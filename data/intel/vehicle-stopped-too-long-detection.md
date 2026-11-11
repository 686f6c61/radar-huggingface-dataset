# Intel/vehicle-stopped-too-long-detection

## Resumen

Vehicle Stopped-Too-Long Detection es un caso de uso de analitica para metro (ferrocarril metropolitano) publicado por Intel en Hugging Face, no un modelo de lenguaje. Detecta vehiculos que permanecen dentro de una zona de seguridad o de no estacionamiento configurable durante mas tiempo que un umbral de permanencia (dwell time) permitido. Se construye sobre un detector YOLO26 de Ultralytics (variantes `yolo26n`, `yolo26s`, `yolo26m`, `yolo26l`) como opcion por defecto, con DETR (`detr-resnet-50`) como alternativa transformer sin NMS.

La deteccion se combina con un tracker multiobjeto que asigna identificadores persistentes entre fotogramas. El elemento `gvaanalytics` de DLStreamer define el poligono de la zona y adjunta metadatos `GstAnalyticsZoneMtd` a cada vehiculo rastreado cuyo centro cae dentro del poligono; una sonda en Python lee esos metadatos, acumula el tiempo de permanencia por vehiculo y emite un evento cuando se supera el umbral. El modelo se distribuye como IR de OpenVINO con soporte para CPU, GPU y NPU de Intel, lo que lo orienta a despliegue en el borde (edge AI).

Su relevancia actual es practica: cubre la fiscalizacion de zonas de no detencion, carriles bus, rutas rojas, accesos de emergencia, areas de carga y zonas de parada de estaciones, con una pila de codigo abierto (OpenVINO + DLStreamer) que evita depender de servicios en la nube para el procesamiento de video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO26 (Ultralytics) o DETR ResNet-50; pipeline de deteccion + tracking multiobjeto + analitica de zona (GstAnalytics) sobre OpenVINO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vision por computador; entrada 640x640 en YOLO26, 800x800 en DETR) |
| Tipos de cuantizacion | FP32, FP16, INT8 (mixed-precision, PTQ con NNCF) |
| Idiomas soportados | en (etiquetas y documentacion) |
| Licencia | MIT (repositorio); los pesos base conservan su licencia: YOLO26 AGPL-3.0, DETR Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportacion desde PyTorch (Ultralytics / Hugging Face Transformers) |
| Clases detectadas | `car` (2), `motorcycle` (3), `bus` (5), `truck` (7) |
| Salida del modelo | `[1, 300, 6]` (YOLO26), `[1, 100, 6]` (DETR) |
| Hardware soportado | CPU, GPU, NPU de Intel |
| Libreria | openvino |
| Pipeline HF | object-detection |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo propio: empaqueta y exporta detectores preentrenados en COCO (YOLO26 de Ultralytics y DETR ResNet-50 de Facebook) a formato OpenVINO IR, y anade la logica de analitica de zona. El script `export_and_quantize.sh` descarga los pesos PyTorch, realiza la exportacion a IR y, si se solicita INT8, aplica cuantizacion post-entrenamiento con NNCF. En el caso de DETR, la exportacion embebe la normalizacion, la decodificacion de cajas y el remapeo de clases dentro del IR, de modo que ambos modelos producen el mismo esquema de salida y los mismos identificadores de clase.

La capa de analitica no es neuronal: el elemento `gvaanalytics` de DLStreamer define el poligono de vigilancia y asocia `GstAnalyticsZoneMtd` a cada objeto rastreado; una sonda en Python acumula el dwell time por identificador de tracking y dispara el evento de "parado demasiado tiempo" al superar el umbral. No se documentan en la informacion disponible los volumenes de datos de entrenamiento, la composicion del dataset ni procesos de RLHF/DPO, ya que el modelo base es un detector COCO preentrenado por terceros.

## Capacidades

- Deteccion de vehiculos de cuatro clases COCO: coche, motocicleta, autobus y camion.
- Tracking multiobjeto con identificadores persistentes entre fotogramas.
- Analitica de zona poligonal: determina si el centro del vehiculo cae dentro del area monitorizada.
- Calculo de tiempo de permanencia por vehiculo y emision de eventos al superar un umbral configurable.
- Ejecucion en CPU, GPU y NPU de Intel mediante OpenVINO, con precisiones FP32, FP16 e INT8.
- Integracion en pipelines GStreamer a traves de DLStreamer.
- Variantes de distinto tamano (`yolo26n`, `yolo26s`, `yolo26m`, `yolo26l`) para equilibrar velocidad y recall en vehiculos lejanos.
- Alternativa DETR sin NMS con licencia permisiva (Apache-2.0) para entornos que no aceptan AGPL-3.0.
- No incluye generacion de texto, razonamiento, codigo, vision general, tool calling ni capacidades de agente.

## Casos de uso

- Fiscalizacion de zonas de no detencion: el pipeline define un poligono sobre carriles bus, rutas rojas o zonas de prohibido parar y emite una alerta cuando un vehiculo supera el dwell time permitido, usando los metadatos de zona de `gvaanalytics` y el tracking para no contar el mismo vehiculo varias veces.
- Proteccion de carriles de emergencia y accesos de bomberos: se configura una zona sobre el carril o la bahia de ambulancia y se alerta de cualquier vehiculo estacionado mas alla del umbral, con despliegue en NPU para camaras de bajo consumo.
- Control de exceso de permanencia en areas de carga: se mide el tiempo que un camion o furgoneta permanece en la zona de carga y se genera un evento cuando excede el tiempo autorizado, usando la variante `yolo26s` o superior para mejorar el recall en vehiculos alejados.
- Gestion de paradas y kiss-and-ride en estaciones: se vigila la zona de parada de taxis o de descenso de pasajeros y se detecta la permanencia excesiva, con la variante `yolo26n` para alta tasa de fotogramas en camaras de estacion.
- Analitica de aparcamiento ilegal en via publica: combinacion de deteccion y tracking sobre video de camara fija para identificar vehiculos detenidos en zonas prohibidas y generar registros con identificador de seguimiento y tiempo acumulado.
- Despliegue en el borde sin nube: al ejecutarse como IR de OpenVINO en CPU, GPU o NPU, el pipeline procesa el video localmente en el dispositivo, lo que reduce el ancho de banda y evita enviar imagenes a servicios externos.
- Validacion y prototipado con DETR: cuando se requiere una licencia permisiva, se selecciona `detr-resnet-50` cambiando la constante `MODEL` en las muestras, con el mismo esquema de salida y las mismas clases que YOLO26.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una matriz de validacion por dispositivo (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser detectores ligeros (variantes `n`/`s`) y ejecutarse via OpenVINO, el consumo es bajo y puede residir en memoria compartida de CPU/NPU.
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte para CPU, GPU y NPU de Intel.
- Cabe en GPU de consumo: si, en principio, al tratarse de detectores YOLO26/DETR de tamano contenido y precisiones FP16/INT8, aunque no se aportan cifras de VRAM que lo confirmen.
- Opciones de despliegue: OpenVINO Runtime, DLStreamer (elemento `gvaanalytics`), pipelines GStreamer; exportacion desde Ultralytics o Hugging Face Transformers.
- Latencia y throughput: no disponibles. La model card recomienda `yolo26n` y `yolo26s` para despliegue de alto FPS en el borde y senala que DETR es mas pesado y funciona a menor tasa de fotogramas.
- Pila de software requerida: Python 3.11+, OpenVINO GenAI 2026.5.0.0.dev20261030 (Runtime 2026.5.0.dev20261030), DLStreamer 2026.3.0 RC1; se trata de una pila de desarrollo, no de una version estable.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (por defecto) | CNN detector | 640x640 | `[1, 300, 6]` | AGPL-3.0 | Mayor throughput en el borde; variantes n/s/m/l |
| DETR ResNet-50 (alternativa) | Transformer sin NMS | 800x800 | `[1, 100, 6]` | Apache-2.0 | Mas pesado, menor tasa de fotogramas; licencia permisiva |
| Otros detectores COCO de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- El repositorio no entrena un modelo propio; hereda los sesgos y limitaciones de los detectores COCO de Ultralytics y Facebook, incluida la ausencia de clases especificas mas alla de coche, motocicleta, autobus y camion.
- Riesgo de falsos positivos y falsos negativos en oclusiones, vehiculos lejanos o condiciones de iluminacion adversas; la model card sugiere variantes mayores para mejorar el recall en vehiculos distantes.
- El tracking puede perder identificadores o intercambiarlos en escenas congestionadas, lo que afectaria al calculo del dwell time por vehiculo.
- La logica de zona depende de que el centro del vehiculo caiga dentro del poligono; vehiculos parcialmente dentro pueden no contabilizarse.
- Licencia del repositorio MIT, pero los pesos base conservan su licencia: YOLO26 es AGPL-3.0, lo que impone obligaciones de copyleft en uso comercial y en red; para evitarlo debe seleccionarse DETR (Apache-2.0).
- La pila requerida (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev) es una version de desarrollo, no estable, lo que desaconseja su uso directo en produccion sin validacion previa.
- Idioma de etiquetas y documentacion: solo ingles.
- No se proporcionan cifras de latencia, throughput ni VRAM en la informacion disponible, por lo que el dimensionamiento debe validarse con la matriz de dispositivos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/vehicle-stopped-too-long-detection
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 (Facebook): https://huggingface.co/facebook/detr-resnet-50
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Paper de DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
