# Intel/running-detection

## Resumen

Running Detection es un caso de uso de analitica para metro (Metro Analytics) publicado por Intel en Hugging Face. No se trata de un modelo de lenguaje, sino de un pipeline de vision por computador que combina un detector de objetos en tiempo real (YOLO26 de Ultralytics, por defecto, o DETR de Facebook como alternativa) con el tracker `gvatrack` de Intel DLStreamer basado en filtro de Kalman, y anade una estimacion de velocidad por trayectoria para marcar a las personas que corren o se desplazan por encima de un umbral configurable.

El detector se exporta a formato OpenVINO IR y se cuantiza a INT8 mediante NNCF, filtrando en tiempo de ejecucion la clase `person` (clase 0 de COCO). A cada persona detectada se le asigna un ID de trayectoria persistente entre fotogramas y su velocidad se estima a partir del desplazamiento del centro de la caja delimitadora; se marca como "corriendo" cuando la velocidad supera el umbral de forma sostenida durante una ventana corta, lo que suprime el ruido de un solo fotograma.

Su relevancia es practica: empaqueta un caso de analitica de video listo para produccion sobre el stack Intel (OpenVINO + DLStreamer), con variantes de precision FP32, FP16 e INT8 y ejecucion en CPU, GPU y NPU. El repositorio es pequeno (0,1 GB), la licencia del artefacto es MIT y el idioma declarado es ingles. Las variantes disponibles del detector son `yolo26n`, `yolo26s`, `yolo26m` y `yolo26l`, con entrada de 640 x 640 y salida `[1, 300, 6]`; DETR usa entrada de 800 x 800 y salida `[1, 100, 6]`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO26 (Ultralytics) o DETR ResNet-50 (alternativa) + tracker `gvatrack` (filtro de Kalman) de DLStreamer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 640 x 640 en YOLO26 y 800 x 800 en DETR) |
| Tipos de cuantizacion | FP32, FP16, INT8 (post-training quantization con NNCF) |
| Idiomas soportados | en (etiquetas y documentacion) |
| Licencia | MIT (artefacto del repositorio); YOLO26 subyacente AGPL-3.0; DETR subyacente Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); exportacion desde pesos PyTorch de Ultralytics o Transformers |
| Variantes | `yolo26n`, `yolo26s`, `yolo26m`, `yolo26l`, `detr-resnet-50` |
| Clase detectada | `person` (clase 0 de COCO) |
| Hardware soportado | CPU, GPU y NPU Intel |
| Motor de inferencia | OpenVINO Runtime (probado con 2026.5.0.dev20261030) |
| Stack de referencia | Intel DLStreamer 2026.3.0 RC1 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El pipeline no entrena ningun modelo propio: reutiliza detectores preentrenados en COCO. La opcion por defecto es YOLO26, un detector en tiempo real de Ultralytics disponible en cuatro escalas (`n`, `s`, `m`, `l`); la alternativa es DETR ResNet-50, un detector transformer sin NMS. El script de exportacion incrusta en el IR de OpenVINO la normalizacion, la decodificacion de cajas y el remapeo de clases de DETR, de modo que ambos modelos producen el mismo esquema de salida y los mismos identificadores de clase, y las mismas muestras de OpenVINO y DLStreamer funcionan con cualquiera de los dos seleccionando la constante `MODEL`.

Sobre las detecciones se aplica el tracker `gvatrack` de DLStreamer (filtro de Kalman), que asigna un ID persistente a cada persona entre fotogramas. La velocidad se calcula por trayectoria a partir del desplazamiento del centro de la caja delimitadora, y la marca de "corriendo" exige que la velocidad se mantenga por encima del umbral durante una ventana corta y sostenida. La cuantizacion INT8 se realiza con cuantizacion post-entrenamiento de NNCF usando un fotograma de calibracion extraido del video de ejemplo. No se documentan en la informacion disponible el numero de tokens ni la composicion del dataset de entrenamiento, ni fases de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Deteccion de objetos en tiempo real sobre la clase `person` con YOLO26 o DETR ResNet-50.
- Seguimiento multiobjeto con IDs persistentes por trayectoria mediante `gvatrack` (filtro de Kalman).
- Estimacion de velocidad por trayectoria a partir del desplazamiento del centro de la caja delimitadora.
- Clasificacion de "corriendo" mediante umbral de velocidad sostenido en una ventana temporal, con supresion del ruido de un solo fotograma.
- Ejecucion en CPU, GPU y NPU Intel a traves de OpenVINO.
- Precisiones FP32, FP16 e INT8 con cuantizacion post-entrenamiento (NNCF).
- Integracion con DLStreamer para construccion de pipelines de video.
- Soporte de entrada de video y codificacion de video de salida mediante ffmpeg en las muestras.
- Capacidades de lenguaje natural, tool calling, agentes, vision generativa o audio: no disponibles (no es un modelo generativo).

## Casos de uso

- Seguridad en andenes: marcar personas que corren por el anden o hacia puertas que se cierran, usando la deteccion de persona y el umbral de velocidad sostenido para evitar falsos positivos por ruido de un fotograma.
- Deteccion de incidentes: identificar carreras repentinas que puedan indicar una persecucion, una reyerta o una emergencia, con IDs de trayectoria que permiten seguir a la persona implicada entre fotogramas.
- Monitorizacion de flujo de multitudes: distinguir el paso normal del movimiento anormalmente rapido en vestibulos y pasillos, desplegando las variantes `yolo26n` o `yolo26s` para maximizar FPS en el borde.
- Zonas de velocidad restringida: aplicar areas de solo caminar en escaleras mecanicas, rampas y escaleras, configurando el umbral de velocidad segun la zona.
- Despliegue en el borde sin GPU dedicada: ejecutar el modelo INT8 en CPU o NPU Intel dentro de la propia estacion, reduciendo el ancho de banda frente a enviar video a la nube.
- Analitica sobre grabaciones: procesar video almacenado con las muestras de OpenVINO y DLStreamer para revisar incidentes y generar video anotado con ffmpeg.
- Escenarios con requisitos de licencia permisiva: usar la variante DETR (Apache-2.0) en lugar de YOLO26 (AGPL-3.0) cuando la licencia del detector condicione la distribucion del producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero esos valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB y las variantes `n`/`s` estan pensadas para despliegue de alto FPS en el borde; las variantes mayores mejoran el recall en escenas densas.
- GPU recomendadas: no se especifican modelos concretos; el stack soporta CPU, GPU y NPU Intel a traves de OpenVINO.
- Cabe en GPU de consumo: no disponible como dato explicito; al ser un detector de una sola etapa con entrada de 640 x 640 y variantes pequenas, es apto para hardware de borde Intel, pero no se documentan modelos de GPU concretos.
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer (pipeline con `gvatrack`) y las muestras incluidas en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la model card indica que las variantes `yolo26n` y `yolo26s` son las recomendadas para alto FPS en el borde y que DETR es mas pesado y funciona a menor tasa de fotogramas.
- Requisitos de software: Python 3.11+, ffmpeg, OpenVINO y DLStreamer; el stack de referencia es DLStreamer 2026.3.0 RC1 con OpenVINO 2026.5.0.0.dev20261030, marcado como desarrollo y no como version estable.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (por defecto en este repo) | Detector en tiempo real | 640 x 640 | `[1, 300, 6]` | AGPL-3.0 | Maximo throughput en el borde; variantes `n`, `s`, `m`, `l` |
| DETR ResNet-50 (alternativa en este repo) | Detector transformer sin NMS | 800 x 800 | `[1, 100, 6]` | Apache-2.0 | Mas pesado y menor tasa de fotogramas; licencia permisiva |
| Tracker `gvatrack` (DLStreamer) | Seguimiento multiobjeto | no aplica | IDs de trayectoria | parte de DLStreamer | Filtro de Kalman; complementa al detector, no compite con el |

No se dispone de datos de rendimiento comparativo entre YOLO26 y DETR en la informacion proporcionada, mas alla de la indicacion cualitativa de que DETR es mas pesado y funciona a menor tasa de fotogramas.

## Limitaciones y advertencias

- Solo detecta la clase `person` (clase 0 de COCO); no cubre otros objetos ni acciones distintas de la carrera.
- La estimacion de velocidad depende del desplazamiento en pixeles entre fotogramas, por lo que es sensible a la perspectiva de la camara, a la calibracion y a la tasa de fotogramas; no se documenta conversion a unidades fisicas.
- El umbral de velocidad y la ventana de sostenimiento son configurables y deben ajustarse por escenario; una mala configuracion genera falsos positivos o falsos negativos.
- El stack de referencia es una version de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030), no una version estable; conviene validar antes de produccion.
- La licencia MIT del repositorio no cubre necesariamente los pesos subyacentes: YOLO26 es AGPL-3.0 y DETR es Apache-2.0; el uso comercial debe revisarse segun la variante elegida.
- El idioma declarado es `en`; la documentacion y las etiquetas estan en ingles.
- Riesgo de sesgos y de alucinacion: no disponible como dato documentado; al ser un detector entrenado en COCO, hereda los sesgos de ese dataset en cuanto a condiciones de iluminacion, densidad de personas y demografia.
- No se documentan resultados de benchmarks ni latencias medidas en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/running-detection
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 (Facebook): https://huggingface.co/facebook/detr-resnet-50
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Script de exportacion y cuantizacion: https://huggingface.co/Intel/running-detection/resolve/main/export_and_quantize.sh
- Paper de referencia DETR: https://arxiv.org/abs/2005.12872
