# SHolic/hurocup-yolo-models

## Resumen

HuroCup YOLO Models es una colección de detectores de objetos YOLO26 entrenados con el framework Ultralytics para las cinco pruebas de visión de la competición FIRA HuroCup: archery (tiro con arco), basketball (baloncesto), marathon (maratón), weight lifting (halterofilia) y united soccer (fútbol unificado). Los modelos han sido desarrollados por el usuario de HuggingFace SHolic y constituyen el subsistema de percepción de la arquitectura visión–control descrita en el artículo *Efficient Integration of Vision and Control for Resource-Constrained Humanoid Robots*, actualmente bajo revisión en IEEE Access.

Cada detector es una variante ligera de YOLO26 (base `yolo26n`) entrenada durante 100 épocas con tamaño de entrada 320 píxeles, y desplegada sobre robots humanoides reales con recursos muy limitados: un ROBOTIS OP3 (con OpenVINO sobre CPU Intel i3-6100U) y un Hiwonder AiNex (con ncnn sobre Raspberry Pi). El repositorio incluye los pesos PyTorch (`best.pt`), exportaciones a OpenVINO y ncnn, y los registros completos de entrenamiento de cada ejecución.

Su relevancia reside en que no son modelos genéricos de benchmark, sino detectores especializados validados en despliegue real sobre hardware robótico de bajo consumo, con métricas de validación publicadas y un caso de uso documentado de adaptación por plataforma (dos modelos distintos para la prueba de maratón según la altura de la cámara del robot).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de objetos en una etapa, framework Ultralytics) |
| Parametros totales | no disponible (base `yolo26n`; variantes de ablación con `yolo26s`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (exportaciones a OpenVINO IR y ncnn, sin cuantización indicada) |
| Idiomas soportados | no aplica (modelo de detección de objetos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, safetensors no indicado), OpenVINO IR, ncnn |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Tamaño de entrada (deployed) | 320 x 320 píxeles (640 en ejecuciones de ablación) |
| Epocas de entrenamiento | 100 |
| Batch size | 16 |
| Version de Ultralytics (entrenamiento) | 8.4.80 |
| NMS en el grafo exportado | No (`end2end: false`) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

Todos los detectores desplegados parten de la variante `yolo26n` (nano) de YOLO26, entrenada con Ultralytics 8.4.80 durante 100 épocas con batch size 16 y resolución de entrada de 320 píxeles. Esta resolución reducida es una decisión deliberada para el despliegue en hardware con recursos limitados: reduce el coste computacional de la inferencia a costa de cierta pérdida de precisión a umbrales de IoU altos. Las exportaciones se generaron con `end2end: false`, de modo que la supresión no máxima (NMS) se ejecuta fuera del grafo exportado, lo que facilita la compatibilidad con los runtimes OpenVINO y ncnn.

Los datos de entrenamiento proceden del dataset propio `SHolic/hurocup-yolo-dataset`, con entre 50 y 300 imágenes auto-recogidas por prueba, capturadas en un único laboratorio con su iluminación y los objetos propios de la competición. No hay indicios de preentrenamiento adicional más allá del estándar de Ultralytics ni de técnicas de aumento específicas documentadas en la model card. Un detalle de diseño notable es la dualidad en la prueba de maratón: el OP3 usa un clasificador directo de tres señales (`forward`, `left`, `right`), mientras que el AiNex (de unos 350 mm de altura, con cámara baja) emplea un detector agnóstico de clase (`marathon_marker`) entrenado con AprilTags y flechas como una única clase `marker`, lo que mantiene el marcador rastreable a distancia; la decisión de giro se toma cuando el robot está cerca mediante detección de AprilTag y clasificación de la flecha.

## Capacidades

- Detección de diana de tiro con arco (clase `Target`) para la prueba Archery.
- Detección simultánea de balón y canasta (clases `Ball` y `Basket`) para la prueba Basketball.
- Clasificación de señales direccionales (`forward`, `left`, `right`) para la prueba Marathon en el OP3.
- Detección agnóstica de marcadores (AprilTags y flechas como clase única `marker`) para Marathon en el AiNex.
- Detección de barra de halterofilia (clase `Bar`) para la prueba Weight lifting.
- Detección de balón (clase `Ball`) para la prueba United soccer, con una variante de tres clases (`obstacle`, `football`, `goalpost`) disponible como ejecución auxiliar no desplegada.
- Exportación lista para producción a OpenVINO IR (CPU Intel) y ncnn (ARM/Raspberry Pi).
- Registros completos de entrenamiento por ejecución: `args.yaml`, `results.csv`, curvas de métricas y matrices de confusión.

## Casos de uso

- Percepción para robots humanoides en FIRA HuroCup: cada detector alimenta directamente el módulo de control de un ROBOTIS OP3 o un Hiwonder AiNex en las pruebas de archery, basketball, marathon, weight lifting y united soccer, proporcionando las coordenadas de los objetos de competición en tiempo real.
- Detección de balón en robots de fútbol: el modelo `united_soccer_clean` localiza el balón con mAP@0.5 de 0,988, adecuado para bucles de persecución y golpeo en robots de baja potencia computacional.
- Localización de dianas y objetivos en campo: el detector `archery` alcanza recall de 1,000 en su conjunto de validación, útil para tareas de apuntado donde no se puede perder el objetivo.
- Seguimiento de marcadores a distancia en robots pequeños: el modelo `marathon_marker` permite rastrear AprilTags y flechas desde cámaras bajas donde la señal sería demasiado pequeña para clasificarla directamente, delegando la decisión a corta distancia.
- Detección de barra en halterofilia robótica: el detector `weight_lifting` (recall de 0,992) sirve para guiar la manipulación de la barra con precisión suficiente para el agarre.
- Referencia reproducible para visión en robótica educativa: al publicar pesos, exportaciones, dataset y registros de entrenamiento, el repositorio sirve como plantilla para equipos que compiten en HuroCup o desarrollan visión en robots con Raspberry Pi o CPUs Intel de bajo consumo.
- Comparativa de resolución y capacidad de modelo: las ejecuciones de ablación (`_640`, `_s`) permiten estudiar el compromiso entre resolución de entrada, tamaño de modelo y precisión en hardware limitado.

## Benchmarks y rendimiento

Resultados de los modelos desplegados, medidos por el autor sobre el conjunto de validación de cada prueba (número de imágenes de validación entre paréntesis), con la mejor época según el fitness de Ultralytics:

| Modelo | mAP@0.5 | mAP@0.5–0.95 | Precision | Recall |
|---|---|---|---|---|
| `archery` (17) | 0,995 | 0,993 | 0,992 | 1,000 |
| `basketball` (15) | 0,987 | 0,843 | 0,940 | 0,951 |
| `marathon` (45) | 0,981 | 0,894 | 0,930 | 0,942 |
| `weight_lifting` (15) | 0,991 | 0,766 | 0,937 | 0,992 |
| `united_soccer_clean` (15) | 0,988 | 0,842 | 0,969 | 0,933 |
| `marathon_marker` (7) | 0,813 | 0,447 | 0,857 | 0,806 |

Advertencia del propio autor: estas cifras describen el ajuste a un dataset pequeño, de un único sitio, y no la precisión de detección de propósito general. No hay comparación con otros modelos (por ejemplo YOLOv8 o YOLO11) en la información disponible.

## Requisitos de hardware

- Los modelos están diseñados para hardware de muy bajo consumo; no requieren GPU para inferencia.
- ROBOTIS OP3: inferencia con OpenVINO 2026.1.0 (plugin de CPU) sobre un Intel i3-6100U, con Ultralytics 8.4.45.
- Hiwonder AiNex: inferencia con ncnn 1.0.20260526 sobre Raspberry Pi, con Ultralytics 8.1.31.
- No se requiere VRAM: toda la inferencia desplegada es sobre CPU (x86 con OpenVINO, ARM con ncnn).
- En una GPU de consumo cualquiera (por ejemplo una RTX 3060 o superior) los pesos `.pt` de YOLO26n funcionarán sin problema; un modelo nano a 320 píxeles es trivial para cualquier GPU moderna.
- Despliegue: Ultralytics (Python, `ultralytics.YOLO`), OpenVINO IR y ncnn. No se menciona soporte explícito de vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos de detección).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dominio | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SHolic/hurocup-yolo-models | YOLO26n | Objetos de competición HuroCup (6 detectores especializados) | 320 px | AGPL-3.0 | Pesos, OpenVINO, ncnn y dataset publicados |
| Ultralytics YOLO26n (base) | YOLO26n | Detección de propósito general (COCO, 80 clases) | 320–640 px | AGPL-3.0 | Pesos oficiales en Ultralytics/HuggingFace |
| Ultralytics YOLO11n | YOLO11n | Detección de propósito general (COCO, 80 clases) | 320–640 px | AGPL-3.0 | Pesos oficiales en Ultralytics/HuggingFace |

Los modelos de HuroCup se diferencian de los detectores genéricos en que están afinados para clases específicas de la competición con un dataset propio pequeño, a cambio de perder generalidad. No se han publicado comparaciones numéricas directas con las variantes base en la información disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (50–300 imágenes por prueba) y recogido en un único laboratorio: la precisión caerá con otros campos, objetos de competición o condiciones de iluminación distintas de las originales.
- Los modelos detectan únicamente objetos de competición de HuroCup; no son detectores de propósito general y no sirven para escenas arbitrarias.
- El modelo `basketball` pierde precisión a umbrales de IoU altos (mAP@0.5–0.95 de 0,843), efecto atribuido a la resolución de entrada de 320 píxeles.
- El modelo `marathon_marker` presenta métricas notablemente inferiores al resto (mAP@0.5 de 0,813) y se validó con solo 7 imágenes.
- La licencia AGPL-3.0, heredada del framework Ultralytics, impone obligaciones de código fuente si el modelo se integra en software distribuido; para uso comercial sin condiciones copyleft, Ultralytics ofrece una licencia empresarial aparte.
- La resolución de 320 píxeles limita la detección de objetos pequeños o lejanos, como demuestra el caso del AiNex en la prueba de maratón.
- No se indican versiones de cuantización (INT8, FP16) en las exportaciones, por lo que el rendimiento en dispositivos con aceleradores cuantizados no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SHolic/hurocup-yolo-models
- Dataset asociado: https://huggingface.co/datasets/SHolic/hurocup-yolo-dataset
- Framework Ultralytics: https://github.com/ultralytics/ultralytics
- Artículo (bajo revisión en IEEE Access): *Efficient Integration of Vision and Control for Resource-Constrained Humanoid Robots* (Sheng, Zheng y Lau, 2026; referencia BibTeX en la model card, DOI no disponible)
- Artículo previo: *A Modular Vision System for Practical Object Detection on Resource-Constrained Humanoid Robots*, Biomimetics, vol. 11, n.º 6, p. 363, 2026 (enlace externo no disponible)
