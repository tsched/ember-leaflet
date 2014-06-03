require('ember-leaflet/~tests/test_helper');

var content, polyline, PolylineClass, view, 
  locations = window.locations;

function addPolylineEventListener(polyline) {
  polyline.on('locationsChanged', function() {
    ok(true, "location has been triggered");
  });
}

module("EmberLeaflet.PolylineLayer", {
  setup: function() {
    content = Ember.A([locations.chicago, locations.sf, locations.nyc]);
    PolylineClass = EmberLeaflet.PolylineLayer.extend({});
    polyline = PolylineClass.create({
      content: content
    });
    view = EmberLeaflet.MapView.create({childLayers: [polyline]});
    Ember.run(function() {
      view.appendTo('#qunit-fixture');
    });
  },
  teardown: function() {
    Ember.run(function() {
      view.destroy();      
    });
  }
});

test("polyline is created", function() {
  ok(!!polyline._layer);
  equal(polyline._layer._map, view._layer);
});

test("locations match", function() {
  var _layerLatLngs = polyline._layer.getLatLngs();
  locationsEqual(_layerLatLngs[0], locations.chicago);
  locationsEqual(_layerLatLngs[1], locations.sf);
  locationsEqual(_layerLatLngs[2], locations.nyc);
  var locationLatLngs = polyline.get('locations');
  locationsEqual(locationLatLngs[0], locations.chicago);
  locationsEqual(locationLatLngs[1], locations.sf);
  locationsEqual(locationLatLngs[2], locations.nyc);
});

test("replace content updates polyline", function() {
  polyline.set('content', Ember.A([locations.paris]));
  equal(polyline.get('locations').length, 1);
  equal(polyline._layer.getLatLngs().length, 1);
  locationsEqual(polyline.get('locations')[0], locations.paris);
  locationsEqual(polyline._layer.getLatLngs()[0], locations.paris);
});

test("setting location to array of arrays works", function() {
  polyline.set('content', Ember.A([
    [locations.paris.lat, locations.paris.lng],
    [locations.sf.lat, locations.sf.lng],
    [locations.chicago.lat, locations.chicago.lng]
  ]));
  locationsEqual(polyline.get('locations')[1], locations.sf);
  locationsEqual(polyline._layer.getLatLngs()[1], locations.sf);
});

test("remove item from content updates polyline", function() {
  content.popObject();
  equal(polyline._layer.getLatLngs().length, content.length);
  equal(polyline.get('locations').length, content.length);
});

test("add item to content updates polyline", function() {
  content.pushObject(locations.paris);
  equal(polyline._layer.getLatLngs().length, content.length);
  equal(polyline.get('locations').length, content.length);
});

test("replace item in content moves polyline", function() {
  content.replace(2, 1, locations.paris);
  locationsEqual(polyline.get('locations')[2], locations.paris);
  locationsEqual(polyline._layer.getLatLngs()[2], locations.paris);
});

test("nullify item in content updates polyline", function() {
  content.replace(2, 1, null);
  equal(polyline.get('locations.length'), 2);
  equal(polyline._layer.getLatLngs().length, 2);
});
  
test("add item to content triggers 'locationsChanged' event", function() {
  addPolylineEventListener(polyline);
  content.pushObject(locations.paris);
});

test("remove item from content triggers 'locationsChanged' event", function() {
  addPolylineEventListener(polyline);
  content.popObject();
});

test("replace item in content triggers 'locationsChanged' event", function() {
  addPolylineEventListener(polyline);
  content.replace(2, 1, locations.paris);
});

test("nullify item in content triggers 'locationsChanged' event", function() {
  addPolylineEventListener(polyline);
  content.replace(2, 1, null);
});