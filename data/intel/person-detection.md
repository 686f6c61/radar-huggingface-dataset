# Intel/person-detection

## Resumen

Person Detection es un modelo de deteccion de objetos especializado en la clase `person` (clase 0 de COCO), publicado por Intel en Hugging Face bajo el identificador `Intel/person-detection`. No es un modelo de lenguaje: es un detector visual de una sola clase, empaquetado en formato OpenVINO IR y pensado para ejecutarse en CPU, GPU y NPU de Intel. Forma parte del caso de uso "Metro Analytics", orientado a contar personas y analizar flujos peatonales en entornos de transporte publico.

El modelo se construye a partir de YOLO26 de Ultralytics (variantes `yolo26n`, `yolo26s`, `yolo26m` y `yolo26l`), entrenado sobre COCO y filtrado en tiempo de ejecucion a la clase persona. Como alternativa, el script de exportacion permite generar una version basada en DETR (`facebook/detr-resnet-50`), un detector transformer sin NMS, con la normalizacion, decodificacion de cajas y remapeo de clases embebidos en el IR de OpenVINO para que ambos modelos compartan el mismo formato de salida.

Su relevancia practica esta en el despliegue en el borde: la cuantizacion INT8 mediante NNCF permite alto rendimiento en hardware Intel sin GPU dedicada, y la integracion con Intel DLStreamer facilita pipelines de video en tiempo real. El modelo esta pensado para inferencia, no para generacion de texto, por lo que las secciones de capacidades linguisticas, benchmarks de razonamiento y contexto no aplican en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos: YOLO26 (Ultralytics) por defecto; DETR (ResNet-50) como alternativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, INT8 (mixed-precision via NNCF) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto) |
| Licencia | MIT (repo); YOLO26 subyacente AGPL-3.0; DETR subyacente Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportable desde PyTorch |
| Tamano de entrada | 640 x 640 (YOLO26); 800 x 800 (DETR) |
| Formato de salida | `[1, 300, 6]` (YOLO26); `[1, 100, 6]` (DETR) |
| Clase detectada | `person` (COCO class 0) |
| Hardware soportado | CPU, GPU, NPU (Intel) |
| Motor de inferencia | OpenVINO |

## Arquitectura y entrenamiento

El modelo base por defecto es YOLO26, un detector de objetos en tiempo real de la familia YOLO de Ultralytics, entrenado sobre el dataset COCO. La variante exportada se filtra en inferencia para conservar unicamente la clase `person`. El pipeline de exportacion convierte los pesos PyTorch a OpenVINO IR y, opcionalmente, aplica cuantizacion post-entrenamiento INT8 con NNCF. Ambas arquitecturas (YOLO26 y DETR) son end-to-end y libres de NMS, de modo que no requieren supresion manual de no maximos.

La alternativa DETR se basa en un transformer con backbone ResNet-50, tambien entrenado sobre COCO. El script de exportacion embebe en el IR la normalizacion de entrada, la decodificacion de cajas y el remapeo de clases, de forma que DETR produce el mismo layout de salida y los mismos ids de clase que YOLO26; los mismos ejemplos de OpenVINO y DLStreamer funcionan con cualquiera de los dos modelos seleccionando la constante `MODEL`. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales mas alla del entrenamiento estandar sobre COCO.

## Capacidades

- Deteccion y localizacion de personas en imagenes y flujos de video.
- Conteo de personas para analisis de ocupacion en plataformas, vestibulos y paradas de transporte.
- Analisis de flujo peatonal direccional en puertas y pasillos.
- Deteccion de presencia no autorizada en zonas restringidas (control de acceso).
- Soporte de multiples variantes de precision: FP32, FP16 e INT8.
- Ejecucion en CPU, GPU y NPU de Intel mediante OpenVINO.
- Integracion con Intel DLStreamer para pipelines de video.
- Dos arquitecturas seleccionables (YOLO26 o DETR) con el mismo formato de salida.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es un modelo puramente visual de una sola clase.

## Casos de uso

- **Conteo de ocupacion en estaciones de metro**: el modelo detecta y cuenta personas en plataformas y vestibulos; las variantes `yolo26n` y `yolo26s` permiten alto FPS en hardware de borde, adecuado para paneles de aforo en tiempo real.
- **Analisis de flujo peatonal**: combinado con DLStreamer, se puede medir el trafico direccional en puertas y corredores para optimizar senalizacion y gestion de masas.
- **Control de acceso a zonas restringidas**: el filtrado a la clase `person` simplifica la logica de alarma al detectar presencia no autorizada en areas tecnicas o andenes cerrados.
- **Seguridad en hubs de transporte**: el modelo alimenta sistemas de conciencia situacional en estaciones y recintos, con deteccion en video en directo sobre CPU o NPU Intel.
- **Analitica de aforo en comercio y eventos**: despliegue en camaras IP con inferencia en el borde usando INT8, sin necesidad de GPU dedicada, para medir ocupacion y tendencias horarias.
- **Procesamiento por lotes de grabaciones**: uso de la variante DETR (Apache-2.0) cuando se requiere un detector transformer con licencia permisiva, aceptando menor tasa de fotogramas a cambio de un modelo mas pesado.
- **Prototipado rapido en OpenVINO**: el script `export_and_quantize.sh` permite generar variantes FP32/FP16/INT8 y probar el modelo con una imagen y un video de ejemplo en pocos minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "device validation matrix" con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas de mAP, latencia ni throughput en el material proporcionado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: no disponible (no se publican cifras de memoria por variante).
- GPU recomendadas: no se especifican modelos concretos; el modelo esta optimizado para CPU, GPU integrada y NPU de Intel via OpenVINO.
- Cabe en hardware consumer: si, al estar disenado para CPU, iGPU y NPU Intel; las variantes `yolo26n` y `yolo26s` son las recomendadas para despliegue de alto FPS en el borde.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer 2026.3.0 RC1, OpenVINO GenAI 2026.5.0.0.dev20261030 (stack de desarrollo, no estable).
- Compatibilidad de precision por dispositivo: FP32 en CPU y GPU (no en NPU); FP16 e INT8 en CPU, GPU y NPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| Intel/person-detection (YOLO26) | YOLO26 (n/s/m/l) | 640 x 640 | `[1, 300, 6]` | MIT (repo) / AGPL-3.0 (base) | Maximo throughput en el borde; end-to-end sin NMS |
| Intel/person-detection (DETR) | DETR ResNet-50 | 800 x 800 | `[1, 100, 6]` | MIT (repo) / Apache-2.0 (base) | Detector transformer permisivo; mas pesado y menor FPS |
| YOLO26 original (Ultralytics) | YOLO26 | 640 x 640 | variable | AGPL-3.0 | Modelo completo multi-clase; requiere filtrado propio a persona |
| DETR original (facebook/detr-resnet-50) | DETR ResNet-50 | 800 x 800 | variable | Apache-2.0 | Detector multi-clase; requiere post-proceso y remapeo |

La ventaja diferencial de este paquete frente a los modelos base es la conversion a OpenVINO IR con normalizacion, decodificacion y filtrado a persona ya embebidos, ademas de la cuantizacion INT8 lista para produccion.

## Limitaciones y advertencias

- Modelo de una sola clase: solo detecta `person`; no reconoce otras clases de COCO.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- La calibracion INT8 incluida usa una unica imagen de ejemplo; para precision en produccion debe sustituirse por un conjunto representativo de fotogramas del sitio de despliegue.
- El stack objetivo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev) es de desarrollo, no una version estable; puede implicar cambios de API.
- Riesgo de sesgo y de falsos negativos en escenas densas o con oclusiones; las variantes mayores mejoran el recall pero reducen el FPS.
- La licencia del repositorio es MIT, pero el modelo YOLO26 subyacente es AGPL-3.0, lo que puede condicionar el uso comercial si se redistribuye el modelo base; la variante DETR (Apache-2.0) evita esta restriccion.
- No se publican cifras de precision (mAP) ni de latencia en la informacion disponible, lo que dificulta la evaluacion previa al despliegue.
- El modelo declara unicamente el idioma `en`, aunque al no procesar texto esta etiqueta es meramente descriptiva.

## Enlaces

- Hugging Face: https://huggingface.co/Intel/person-detection
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 (Hugging Face): https://huggingface.co/facebook/detr-resnet-50
- Paper DETR (arXiv:2005.12872): https://arxiv.org/abs/2005.12872
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Web de Intel: https://www.intel.com/content/www/us/en/homepage.html
