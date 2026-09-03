# Snapkitty/snapkitty-ocr

## Resumen

SnapKitty OCR es una aplicación Android desarrollada por Snapkitty Collective, escrita en Kotlin con Jetpack Compose, cuyo propósito es digitalizar cuadernos manuscritos mediante OCR y enviar los resultados a un conjunto de servicios de agentes denominado "sovereign agent stack". No se trata de un modelo de inteligencia artificial entrenado, sino de una aplicación cliente que utiliza Google ML Kit para el reconocimiento de texto en el dispositivo, sin necesidad de conexión a internet ni claves de API.

La aplicación permite seleccionar imágenes de la galería o capturarlas con la cámara, etiquetarlas por capítulos, generar un sello WORM (Write Once Read Many) mediante hash SHA-256 y enviar cada página a tres servicios HTTP distintos: snapkitty-shell, ROBOB y ABZU IDE. El proyecto está orientado a un caso de uso muy específico: la ingesta de las notas manuscritas de una persona llamada Ahmad en un corpus digital denominado THE BOOK, que alimenta a un sistema de agentes para su análisis posterior.

En el momento de la consulta, el repositorio en HuggingFace no contiene información sobre licencia, idiomas, pipeline ni métricas de descargas, y la búsqueda web no arroja resultados relevantes más allá de la propia model card. Por tanto, esta ficha se basa exclusivamente en el contenido del README y en los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion Android (Kotlin + Jetpack Compose) |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende de Google ML Kit; la model card menciona Latin + handwriting) |
| Licencia | no disponible |
| Formato de pesos | no disponible (codigo fuente Kotlin) |
| Motor OCR | Google ML Kit (on-device, offline) |
| Plataforma | Android (Android Studio Electric Eel o superior) |
| Lenguaje de programacion | Kotlin |
| Interfaz de usuario | Jetpack Compose |
| Comunicacion con agentes | HTTP (JSON) a snapkitty-shell, ROBOB y ABZU IDE |
| Sellado de integridad | SHA-256 (WORM seal) |

## Arquitectura y entrenamiento

SnapKitty OCR no es un modelo entrenado, sino una aplicacion cliente que integra el SDK de Google ML Kit para reconocimiento de texto. La arquitectura de la aplicacion se compone de tres modulos principales:

- `OcrProcessor.kt`: gestiona el reconocimiento de texto mediante ML Kit, calcula el hash SHA-256 de cada pagina (formato `SHA-256(tag:pageIndex:timestamp:ocrText)`) y extrae los primeros 16 caracteres hexadecimales como `worm_hash`.
- `AgentBridge.kt`: establece conexiones HTTP con los servicios del stack soberano. Incluye degradacion gradual (graceful degradation) si alguno de los servicios no esta disponible.
- `MainActivity.kt`: implementa la interfaz de usuario en Compose, con selector de galeria, modo camara y lista de resultados.

No se dispone de informacion sobre el entrenamiento de ningun modelo subyacente, ya que ML Kit es un servicio propietario de Google. La aplicacion no incluye ningun componente de IA propio ni datos de entrenamiento.

## Capacidades

- Reconocimiento de texto en imagenes seleccionadas de la galeria (multi-seleccion para escanear varias paginas a la vez).
- Captura de imagenes en tiempo real mediante la camara del dispositivo.
- OCR en el dispositivo, sin conexion a internet ni necesidad de clave de API.
- Etiquetado de cada lote de paginas con etiquetas de capitulo predefinidas (THE_BOOK_CH1 a THE_BOOK_CH8, THE_BOOK_NEW).
- Generacion de un sello WORM por pagina mediante hash SHA-256, que incluye etiqueta, indice, timestamp y texto OCR.
- Envio de los resultados a tres servicios HTTP distintos:
  - `snapkitty-shell` en el puerto 3700, ruta `/ocr/ingest`, para indexar la pagina en el corpus THE_BOOK.
  - `ROBOB` en el puerto 4600, ruta `/ocr/book_page`, para analisis del contenido via Bedrock (Claude Sonnet 4.6).
  - `ABZU IDE` en el puerto 4000, ruta `/api/book_page`, para visualizacion en vivo en una interfaz Phoenix LiveView.
- Degradacion gradual: si un servicio no responde, la aplicacion continua funcionando y envia a los demas.

## Casos de uso

- Digitalizacion de cuadernos manuscritos: el usuario fotografia o selecciona paginas de un cuaderno fisico y la aplicacion las convierte en texto digital, etiquetandolas por capitulo para su posterior organizacion.
- Archivo personal con integridad verificable: gracias al sello WORM con SHA-256, cada pagina queda registrada con un hash unico que permite detectar cualquier alteracion posterior del texto.
- Ingesta de documentos en un pipeline de agentes: las paginas OCR se envian automaticamente a servicios como snapkitty-shell o ROBOB, que pueden indexarlas en una base de datos, analizarlas con modelos de lenguaje o integrarlas en flujos de trabajo automatizados.
- Creacion de un corpus literario o tecnico: el etiquetado por capitulos (THE_BOOK_CH1, etc.) permite ensamblar un documento estructurado a partir de multiples paginas escaneadas.
- Analisis de notas academicas o de investigacion: el envio a ROBOB, que utiliza Claude Sonnet 4.6 via Bedrock, permite obtener resumenes, extraccion de conceptos o respuestas basadas en el contenido de las paginas.
- Visualizacion en tiempo real de documentos digitalizados: la integracion con ABZU IDE muestra un feed en vivo de las paginas procesadas, util para entornos de colaboracion o monitorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La aplicacion no presenta metricas de precision de OCR, latencia de procesamiento ni comparaciones con otras soluciones.

## Requisitos de hardware

- Dispositivo Android con camara (para el modo camara) y acceso a la galeria de imagenes.
- Android Studio Electric Eel o superior para compilar el proyecto.
- Conexion de red para enviar los resultados a los servicios HTTP (aunque el OCR en si funciona offline).
- Para pruebas en emulador, se utiliza la direccion `10.0.2.2` para acceder al host local; en dispositivos fisicos hay que configurar la IP LAN del equipo que ejecuta los servicios.
- No se especifican requisitos minimos de RAM, almacenamiento o version de Android. Dado que usa ML Kit, se requiere Google Play Services actualizado en el dispositivo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otras aplicaciones o modelos de OCR. La model card no menciona alternativas ni proporciona datos de rendimiento. Se puede indicar que, al usar Google ML Kit, su comportamiento sera similar al de cualquier aplicacion que integre ese SDK, pero no hay datos cuantitativos para comparar.

## Limitaciones y advertencias

- No es un modelo de IA independiente: depende completamente de Google ML Kit para el reconocimiento de texto, por lo que su precision esta limitada por el rendimiento de ese servicio.
- La model card menciona soporte para "Latin + handwriting", pero no se especifican idiomas concretos ni calidad del OCR en escritura manuscrita.
- La aplicacion esta disenada para un caso de uso muy concreto (los cuadernos de Ahmad) y no incluye funcionalidades genericas de OCR como deteccion de idioma, correccion ortografica o exportacion a formatos estandar.
- El envio de datos a servicios HTTP implica que el contenido de las paginas se transmite por la red; no se menciona cifrado ni autenticacion en las conexiones.
- La licencia no esta disponible, por lo que no se puede determinar si el codigo puede reutilizarse comercialmente.
- No se proporcionan instrucciones de despliegue en produccion ni soporte para otros sistemas operativos.
- La fecha de creacion del repositorio (2026-09-03) y la ausencia de descargas o likes sugieren que el proyecto puede estar en una fase muy temprana o ser de uso personal.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/snapkitty-ocr
- No se han encontrado otros enlaces relevantes en la busqueda web (los resultados obtenidos corresponden a un sitio educativo turco sin relacion con el proyecto).
