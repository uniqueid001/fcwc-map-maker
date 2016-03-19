
var geocoder;
var map;
function initialize()
    {
    //'use strict';
    geocoder = new google.maps.Geocoder();

    var latlng = new google.maps.LatLng(43.16103, -77.6109219);
    var mapOptions = {
        zoom: 11,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    var map_canvas = document.getElementById("map_canvas");
    if (map_canvas === null)
        {
        console.log("Error: failed to find map_canvas element in document!");
        }
    map = new google.maps.Map(map_canvas, mapOptions);
    }

function codeAddress()
    {
    'use strict';
    var address = document.getElementById("address").value;
    geocoder.geocode( {'address': address},
        function(results, status)
            {
            'use strict';
            if (status == google.maps.GeocoderStatus.OK)
                {
                //map.setCenter(results[0].geometry.location);
                //var marker = new google.maps.Marker({
                //    map: map, 
                //    position: results[0].geometry.location
                //});
                console.log("Position: "+results[0].geometry.location);
                document.getElementById("points").innerText +=
                            ("\nPosition: "+results[0].geometry.location);
                }
            else
                {
                alert("Geocode was not successful for the following reason: " + status);
                }
            });
    } // codeAddress()


function processSiteList()
    {
    'use strict';
    var sitelist_text = document.getElementById("site-list").value;
    console.log("Site List:", sitelist_text);

    document.getElementById("kml-output").value = '';

    var sitelist = sitelist_text.split("\n");
    console.log("sitelist: ", sitelist);

    processSiteSpec(0, sitelist);
    } // processSiteList()

function processSiteSpec(index, sitelist)
    {
    'use strict';
    // stop the process at the end
    if (index >= sitelist.length)
        {
        return;
        }

    var sitespec = sitelist[index];
    console.log(""+index+": "+sitespec);
    // skip blank lines
    if (sitespec == undefined || sitespec.trim() == '')
        {
        //continue;
        processSiteSpec(index+1, sitelist);
        return;
        }
    var attrs = sitespec.split("|", 3);

    var camp_code = attrs[0].trim();
    var sitenum = attrs[1].trim();
    var address = attrs[2].trim();
    console.log(""+index+"*  ", camp_code, sitenum, address);

    var camp = undefined;
    if (camp_code == 'W')
        { camp = 'west'; }
    if (camp_code == 'E')
        { camp = 'east'; }

    // Only process 10 at a time because that is the limit without
    // an API key
    var start_index = $('input[name="start-index"]:checked').val();
    start_index = parseInt(start_index);
    var end_index = start_index + 10;
    //if (! (0 <= index && index < 10) )
    //if (! (10 <= index && index < 20) )
    //if (! (20 <= index && index < 30) )
    //if (! (30 <= index && index < 40) )
    //if (! (40 <= index && index < 50) )
    //if (! (50 <= index && index < 60) )
    //if (! (60 <= index && index < 70) )
    console.debug("Start index:", start_index, "End index:", end_index);
    if (! (start_index <= index && index < end_index) )
        {
        //continue;
        console.log("Skipping entry not in range:", index);
        processSiteSpec(index+1, sitelist);
        return;
        }

    createMarker(camp, sitenum, address, index+1, sitelist);
    } // processSiteSpec()

function createMarker(camp, sitenum, address, index, sitelist)
    {
    // sw, ne corners of area to search
    var LeRoy = google.maps.LatLng(42.979535,-77.99057);
    var NE = google.maps.LatLng(43.335167,-77.257233);
    var search = address;
    if (address.indexOf("NY") == -1)
        { search += " Rochester, NY"; }
    geocoder.geocode(
            {'address': search,
                // sw, ne corners of area to search
            'bounds': google.maps.LatLngBounds( LeRoy, NE ),
            },
        function(results, status)
            {
            if (status == google.maps.GeocoderStatus.OK)
                {
                var location = results[0].geometry.location;

                console.log("#"+sitenum+" Position: "+location);
                document.getElementById("points").innerText +=
                    ("\n"+
                     camp+" - #"+sitenum+": "+address+"  -> "+location);

                //document.getElementById("kml-output").value +=
                //    ("\n"+
                //     camp+" - #"+sitenum+": "+address+"  -> "+location);

                var template = document.getElementById('placemark-template').value;
                var text = template.replace(/\{sitenum\}/g, sitenum)
                                   .replace(/\{address\}/g, address)
                                   .replace(/\{lat\}/g, location.lat())
                                   .replace(/\{long\}/g, location.lng())
                                   .replace('{camp}', camp)
                                   ;
                document.getElementById("kml-output").value += text;

                //var template = $('#placemark-template').value;
                //var text = $(template).format(

                var marker = new google.maps.Marker({
                    map: map,
                    position: location,
                    icon: 
                        camp == 'east'
                            ?  "https://maps-api-ssl.google.com/intl/en_us/mapfiles/ms/micons/lightblue.png"
                            : "https://maps-api-ssl.google.com/intl/en_us/mapfiles/ms/micons/green.png"
                    });

                // process the next site in the list
                processSiteSpec(index, sitelist);
                }
            else
                {
                alert("Geocode was not successful for the following reason: " + status);
                }
            });
    } // createMarker()

