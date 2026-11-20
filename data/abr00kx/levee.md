# abr00kx/levee

## Resumen

Levee es una herramienta de codigo abierto, escrita en Go, para la determinacion de zonas de inundacion y la monitorizacion de prestamos hipotecarios durante toda su vida util en Estados Unidos. No es un modelo de lenguaje ni una red neuronal: es un binario estatico con API HTTP, CLI y base de datos SQLite que automatiza el trabajo que hoy venden por prestamo varios proveedores privados (ServiceLink National Flood, ICE Flood, Unitas360, LERETA), a partir de datos publicos y gratuitos de FEMA.

El problema que resuelve es regulatorio: todo prestamista estadounidense que concede, renueva o compra un prestamo garantizado por un edificio debe determinar si este se encuentra en una Special Flood Hazard Area (SFHA), reflejarlo en el formulario federal SFHDF y exigir seguro de inundacion cuando corresponda. Ademas, muchos prestamistas pagan por vigilar cada prestamo hasta su amortizacion para detectar cambios en los mapas de FEMA o salidas del National Flood Insurance Program.

La relevancia actual es de coste y control: Levee replica ese flujo sin claves de API, sin cuentas y sin tarifas por prestamo, con historial a prueba de manipulacion mediante cadena de hashes, webhooks firmados con HMAC-SHA256 y banderas de revision legibles por maquina. El autor advierte explicitamente de que es una ayuda al cumplimiento, no una determinacion garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (herramienta Go, no modelo neuronal); binario estatico con API HTTP, CLI y SQLite |
| Parametros totales | No disponible (no es un modelo de IA) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | No aplica (codigo fuente Go, imagen Docker) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento. Levee es una aplicacion en Go (requiere Go 1.26 o superior) que empaqueta en un unico binario estatico la logica de determinacion, la generacion de PDF del formulario SFHDF (FEMA Form FF-206-FY-21-116), la importacion de carteras desde CSV, el motor de monitorizacion y un servidor HTTP con interfaz web. La persistencia se resuelve con un fichero SQLite.

Tecnicamente destaca por: geocodificacion por lotes mediante una unica llamada batch al Census; limitacion de peticiones a FEMA y USFWS configurable (por defecto 4 req/s); concurrencia limitada (2 determinaciones en paralelo por defecto); cadena de hashes append-only para cada determinacion, verificable con `levee verify`; y entrega ordenada de eventos a webhooks firmados con HMAC-SHA256. El servidor escucha en localhost por defecto y avisa si se expone sin `LEVEE_API_TOKEN`.

## Capacidades

- Determinacion de zona de inundacion a partir de direccion o coordenadas: zona, estado SFHA, panel FIRM y fecha de vigencia, LOMRs efectivas, comunidad NFIP (nombre, condado, CID), estado de participacion y programa, y estado del Coastal Barrier Resources System.
- Banderas de revision legibles por maquina en cada resultado (por ejemplo `GEOCODE_INTERPOLATED` o `PENDING_MAP`).
- Relleno completo del formulario federal SFHDF en PDF, con pagina anexa de evidencias, fuentes y hash de auditoria.
- Importacion de carteras desde CSV con geocodificacion por lotes.
- Monitorizacion de vida del prestamo: cambios en el NFIP Community Status Book, nuevas LOMRs, revisiones de paneles FIRM, mapas pendientes y rechequeo completo programado (30 dias por defecto).
- Eventos y webhooks (`SFHA_ENTERED`, `INSURANCE_UNAVAILABLE`, etc.) firmados con HMAC-SHA256.
- Historial a prueba de manipulacion con verificacion de integridad.
- Despliegue autocontenido: CLI, API HTTP, interfaz web y contenedor Docker.

## Casos de uso

- Determinacion en originacion hipotecaria: el prestamista ejecuta `levee determine` sobre la direccion del inmueble y obtiene zona, panel FIRM y estado NFIP para rellenar el SFHDF sin depender de un proveedor externo por prestamo.
- Segunda opinion sobre certificados de proveedor: contrastar la determinacion de un tercero con la salida de Levee y revisar las banderas de revision antes de aceptar el certificado.
- Generacion automatizada del formulario federal: producir el PDF SFHDF con la disposicion oficial y pagina de evidencias y hash de auditoria para el expediente del prestamo.
- Monitorizacion de cartera completa: ejecutar `levee monitor` de forma periodica para detectar inmuebles que entran en SFHA por revision de mapas o comunidades que salen del NFIP, y planificar avisos a prestatarios con antelacion gracias a los mapas pendientes.
- Integracion en sistemas internos de prestamos: consumir la API HTTP (`/v1/determine`, `/v1/loans`) y recibir eventos por webhook firmado para disparar flujos de notificacion o de exigencia de seguro.
- Auditoria y cumplimiento interno: usar `levee verify` para demostrar que el historial de determinaciones no se ha editado, borrado ni reordenado.
- Despliegue en infraestructura propia restringida: ejecutar el contenedor Docker con la base de datos en un volumen local y el servidor en localhost, manteniendo los datos de prestamos dentro de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM ni GPU: no es un modelo de IA.
- Requiere Go 1.26 o superior para compilar desde fuente, o bien Docker para ejecutar la imagen preconstruida.
- Almacenamiento: un unico fichero SQLite para base de datos; el volumen Docker se monta en `/data`.
- Red: acceso saliente a servicios de FEMA y USFWS, con limite de peticiones configurable (por defecto 4 req/s) y concurrencia de determinaciones configurable (por defecto 2).
- Despliegue: binario unico, CLI, servidor HTTP con interfaz web en `127.0.0.1:8080` por defecto, o contenedor con `serve --monitor-every 24h`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Datos de origen | Coste por prestamo | Licencia | Autohospedaje |
|---|---|---|---|---|---|
| Levee | Binario Go, API, CLI, SQLite | FEMA publico (SFHA, FIRM, LOMR, NFIP) | Sin tarifa por prestamo | MIT | Si |
| ServiceLink National Flood | Servicio comercial de determinacion y monitorizacion | FEMA y datos propios | Tarifa por prestamo | Propietaria | No |
| ICE Flood | Servicio comercial de determinacion y monitorizacion | FEMA y datos propios | Tarifa por prestamo | Propietaria | No |
| LERETA | Servicio comercial de determinacion y monitorizacion | FEMA y datos propios | Tarifa por prestamo | Propietaria | No |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite prompts. Cualquier evaluacion como modelo de IA carece de sentido.
- El propio autor advierte de que Levee es una ayuda al cumplimiento, no una determinacion garantizada; las instrucciones del SFHDF de FEMA solo aceptan determinaciones de terceros con garantia de exactitud, y Levee no garantiza nada.
- Cada resultado incluye banderas de revision que exigen intervencion humana; ignorarlas invalida el uso en produccion.
- La geocodificacion puede ser interpolada a lo largo del segmento de calle, no sobre la huella del edificio, lo que puede alterar la determinacion.
- Depende de la disponibilidad y exactitud de los datos publicos de FEMA y USFWS; cambios o interrupciones en esos servicios afectan al funcionamiento.
- Los datos de prestamos son sensibles: el servidor escucha en localhost por defecto y debe protegerse con `LEVEE_API_TOKEN` y webhooks firmados si se expone.
- La licencia MIT permite uso comercial, pero no exime del cumplimiento regulatorio ni de la revision humana de las determinaciones.
- No hay informacion sobre sesgos, alucinacion o cobertura idiomatica porque no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/abr00kx/levee
