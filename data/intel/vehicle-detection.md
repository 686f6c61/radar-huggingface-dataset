# Intel/vehicle-detection

## Resumen

Vehicle Detection es un modelo de deteccion de objetos especializado en vehiculos, publicado por Intel bajo el identificador `Intel/vehicle-detection` en Hugging Face. No se trata de un modelo de lenguaje, sino de un detector de objetos de vision por computador orientado a despliegues en el borde (edge AI). Se construye sobre YOLO26 de Ultralytics (entrenado en COCO) y ofrece DETR (ResNet-50 de Facebook) como alternativa basada en transformer. El modelo se distribuye como IR de OpenVINO, con soporte para CPU, GPU y NPU de Intel.

El modelo resuelve un problema concreto de analitica urbana: detectar y localizar vehiculos en imagenes y flujos de video, filtrando en tiempo de ejecucion las clases relevantes de COCO (`car`, `motorcycle`, `bus`, `truck`). Esta pensado para casos de monitorizacion de trafico, ocupacion de aparcamientos, analitica en peajes, seguimiento de flotas y deteccion de incidentes. La integracion con Intel DLStreamer permite construir pipelines de video en tiempo real.

Su relevancia actual radica en la combinacion de un detector de ultima generacion (YOLO26) con el ecosistema de inferencia de Intel (OpenVINO + NNCF para cuantizacion INT8), lo que permite ejecutar deteccion de vehiculos a alta tasa de fotogramas en hardware de borde sin GPU dedicada. El repositorio tiene un tamano de 0.0 GB y un numero de descargas muy bajo (30), lo que sugiere un modelo reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos: YOLO26 (CNN, Ultralytics) por defecto; DETR (transformer, ResNet-50) como alternativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP32, FP16, INT8 (mixed-precision con NNCF) |
| Idiomas soportados | en (etiquetas de clase en ingles) |
| Licencia | MIT (repositorio); los pesos base YOLO26 son AGPL-3.0 y DETR es Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportado desde PyTorch (Ultralytics / Transformers) |

Especificaciones adicionales:

| Parametro | Valor |
|---|---|
| Variantes YOLO26 | `yolo26n`, `yolo26s`, `yolo26m`, `yolo26l` |
| Variante DETR | `detr-resnet-50` |
| Tamano de entrada YOLO26 | 640 x 640 |
| Tamano de entrada DETR | 800 x 800 |
| Forma de salida YOLO26 | `[1, 300, 6]` |
| Forma de salida DETR | `[1, 100, 6]` |
| Clases detectadas | `car` (2), `motorcycle` (3), `bus` (5), `truck` (7) |
| Hardware soportado | CPU, GPU, NPU (Intel) |
| Motor de inferencia | OpenVINO |
| Stack objetivo | DLStreamer 2026.3.0 RC1 + OpenVINO GenAI 2026.5.0.0.dev20261030 |
| Python requerido | 3.11+ |

Compatibilidad precision / dispositivo:

| Precision | CPU | GPU | NPU |
|---|---|---|---|
| FP32 | Si | Si | No |
| FP16 | Si | Si | Si |
| INT8 | Si | Si | Si |

## Arquitectura y entrenamiento

El modelo por defecto es YOLO26, un detector de objetos en tiempo real de la familia Ultralytics, entrenado sobre el dataset COCO. YOLO26 es una arquitectura convolucional (CNN) optimizada para latencia baja en dispositivos de borde; el repositorio ofrece cuatro variantes de escala (`n`, `s`, `m`, `l`), donde las variantes pequenas priorizan FPS y las grandes mejoran el recall en vehiculos lejanos o parcialmente ocluidos. El modelo se exporta desde PyTorch a OpenVINO IR y se filtra en tiempo de ejecucion a las cuatro clases de vehiculo de COCO.

La alternativa DETR (DEtection TRansformer) es un detector basado en transformer con backbone ResNet-50, sin NMS (Non-Maximum Suppression), entrenado tambien en COCO. El script de exportacion embebe la normalizacion de DETR, la decodificacion de cajas y el remapeo de clases dentro del IR de OpenVINO, de modo que produce el mismo formato de salida y los mismos identificadores de clase que YOLO26, permitiendo usar las mismas muestras de OpenVINO y DLStreamer con ambos modelos. DETR es mas pesado y funciona a menor tasa de fotogramas, pero ofrece una licencia permisiva (Apache-2.0) frente a la AGPL-3.0 de YOLO26.

La cuantizacion INT8 se realiza mediante cuantizacion post-entrenamiento con NNCF (Neural Network Compression Framework). El proceso de exportacion incluye la descarga de pesos PyTorch, la exportacion a IR y, opcionalmente, la cuantizacion. No se dispone de informacion sobre el numero de tokens o composicion del dataset de entrenamiento mas alla de que YOLO26 y DETR se entrenaron sobre COCO.

## Capacidades

- Deteccion de objetos en imagenes y flujos de video, limitada a cuatro clases de vehiculo: coche, motocicleta, autobus y camion.
- Localizacion con cajas delimitadoras y puntuaciones de confianza (salida `[N, 6]` con coordenadas, clase y score).
- Inferencia en tiempo real en CPU, GPU y NPU de Intel mediante OpenVINO.
- Cuantizacion INT8 para maximizar el rendimiento en hardware de borde.
- Integracion con pipelines de video de Intel DLStreamer.
- Dos backends alternativos (YOLO26 y DETR) con el mismo formato de salida y las mismas muestras de codigo.
- Soporte de video (se incluye un video de prueba `test_video.mp4` en el flujo de ejemplo).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.

## Casos de uso

- Monitorizacion de trafico: contar vehiculos en carreteras, intersecciones y rampas de autopista procesando flujos de video con DLStreamer; las variantes `n` y `s` permiten alta tasa de fotogramas en dispositivos de borde.
- Ocupacion de aparcamientos: detectar plazas ocupadas o libres en estructuras de aparcamiento mediante deteccion de coches en imagenes capturadas periodicamente.
- Analitica en peajes: clasificar el tipo de vehiculo (coche, motocicleta, autobus, camion) en puntos de cobro para tarificacion y estadisticas.
- Seguimiento de flotas: monitorizar movimientos de autobuses y camiones en depositos y terminales, aprovechando la deteccion de clases especificas.
- Deteccion de incidentes: identificar vehiculos detenidos o circulando en sentido contrario en carreteras, combinando la deteccion con logica de seguimiento en el pipeline.
- Despliegue en edge sin GPU dedicada: ejecutar la variante INT8 en CPU o NPU de Intel para aplicaciones de vision en campo, con requisitos de energia y coste reducidos.
- Prototipado rapido con DETR: usar la variante `detr-resnet-50` cuando se requiera una licencia permisiva (Apache-2.0) en lugar de la AGPL-3.0 de YOLO26, aceptando menor tasa de fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un detector de objetos de escala `n`/`s`/`m`/`l`, los requisitos son muy inferiores a los de un LLM; las variantes pequenas estan pensadas para ejecutarse en CPU y NPU integradas.
- GPU recomendadas: no se especifican modelos concretos. El modelo soporta GPU de Intel mediante OpenVINO; no se detalla compatibilidad con A100, H100 o RTX 4090.
- Cabe en consumer GPU: si, mediante OpenVINO en GPU de Intel; no se detalla soporte para GPUs de otros fabricantes.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Precisiones por dispositivo: FP32 solo en CPU y GPU; FP16 e INT8 en CPU, GPU y NPU.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (variantes n/s/m/l) | CNN (Ultralytics) | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Maximo throughput en edge; variantes mayores mejoran recall |
| DETR (detr-resnet-50) | Transformer + ResNet-50 | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Sin NMS; mas pesado y menor FPS; licencia permisiva |
| Intel/vehicle-detection (este repo) | Empaquetado OpenVINO de los anteriores | Segun backend | Segun backend | MIT (repo) | Filtrado a clases de vehiculo; soporte CPU/GPU/NPU |

La comparativa se limita a los dos backends que ofrece el propio repositorio, ya que la informacion proporcionada no incluye otros modelos de deteccion de vehiculos comparables con datos de rendimiento.

## Limitaciones y advertencias

- El modelo solo detecta cuatro clases de vehiculo (`car`, `motorcycle`, `bus`, `truck`); no detecta peatones, senales ni otros objetos.
- La cuantizacion INT8 del flujo de ejemplo utiliza una unica imagen de calibracion; para precision en produccion es necesario sustituirla por un conjunto representativo de fotogramas del sitio de despliegue.
- El stack objetivo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030) es una version de desarrollo, no una release estable; puede presentar inestabilidad.
- Los pesos base YOLO26 estan bajo licencia AGPL-3.0, lo que impone obligaciones de copyleft para uso en red; la licencia MIT del repositorio no exime de las condiciones del modelo base. DETR (Apache-2.0) es la opcion si se requiere una licencia permisiva.
- No se dispone de informacion sobre sesgos del dataset COCO ni sobre el rendimiento en condiciones de baja iluminacion, clima adverso u oclusiones severas.
- Riesgo de falsos positivos y negativos inherente a la deteccion de objetos; no se documentan metricas de precision o recall.
- El modelo esta etiquetado solo para ingles en las etiquetas de clase; no es un modelo multilingue.
- No se proporcionan datos sobre latencia, throughput ni requisitos de memoria en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Intel/vehicle-detection
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 (Facebook): https://huggingface.co/facebook/detr-resnet-50
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Paper DETR (referencia arXiv): https://arxiv.org/abs/2005.12872
