# EngJamesO/pothole-detector

## Resumen

El repositorio `EngJamesO/pothole-detector` contiene un conjunto de cinco modelos de detección de objetos basados en la arquitectura YOLO (You Only Look Once), entrenados específicamente para localizar baches en imágenes de carreteras. El autor, EngJamesO, desarrolla estos modelos con el objetivo de facilitar el monitoreo de infraestructura vial y la planificación de mantenimiento en departamentos de carreteras y entidades urbanas.

Los cinco modelos incluyen variantes de YOLOv8, YOLOv9, YOLOv11 y YOLOv12, con tamaños que van desde los 2,2 millones de parámetros hasta los 25,3 millones. La colección está diseñada para ofrecer un equilibrio entre precisión y velocidad: desde el YOLOv9c, que prioriza la exactitud (mAP50 de 0,792), hasta el YOLOv8-FPN, que maximiza el rendimiento en tiempo real (155,8 FPS). Todos los pesos están publicados con licencia MIT, lo que permite uso comercial sin restricciones, y se distribuyen a través del ecosistema Ultralytics.

La relevancia de este proyecto radica en que aborda un problema de infraestructura crítico con una solución de visión por computador de bajo coste y de código abierto. Al ofrecer múltiples arquitecturas en un único repositorio, el autor facilita la evaluación comparativa y la selección del modelo más adecuado según los requisitos de hardware y latencia de cada despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8, YOLOv9, YOLOv11, YOLOv12 (cinco variantes: YOLOv9c, YOLOv12n, YOLOv8n, YOLOv11, YOLOv8-FPN) |
| Parametros totales | De 2,21M (YOLOv8-FPN) a 25,3M (YOLOv9c) según variante |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, no procesa secuencias) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No aplica (modelo de vision; la documentacion esta en ingles) |
| Licencia | MIT |
| Formato de pesos | Pesos de Ultralytics (formato `.pt`), compatible con safetensors via exportacion |

### Variantes incluidas

| Modelo | Parametros | mAP50 | mAP50-95 | Latencia (ms) | FPS |
|---|---|---|---|---|---|
| YOLOv9c | 25,3M | 0,792 | 0,485 | 36,3 | 27,6 |
| YOLOv12n | 2,56M | 0,785 | 0,463 | 13,9 | 72,1 |
| YOLOv8n | 3,01M | 0,782 | 0,465 | 6,9 | 144,7 |
| YOLOv11 | 2,58M | 0,779 | 0,460 | 9,3 | 107,0 |
| YOLOv8-FPN | 2,21M | 0,707 | 0,396 | 6,4 | 155,8 |

## Arquitectura y entrenamiento

Todos los modelos se basan en la arquitectura YOLO, una red neuronal convolucional de una sola pasada que predice directamente cajas delimitadoras y probabilidades de clase sobre la imagen completa. Las variantes incluidas cubren distintas generaciones: YOLOv8 y YOLOv9 (arquitecturas de ancla libre con mejoras en la agregación de características), YOLOv11 (optimizaciones de eficiencia) y YOLOv12 (última generación con atención de ventana). La variante YOLOv8-FPN incorpora una pirámide de características (Feature Pyramid Network) para mejorar la detección de objetos a múltiples escalas.

El conjunto de entrenamiento no está detallado en la model card publicada. El autor indica que los modelos fueron entrenados y evaluados sobre imágenes de carreteras con baches, con una evaluación cualitativa realizada sobre 40 imágenes de prueba y 86 objetos anotados como ground truth. No se menciona el número de épocas, el tamaño del dataset de entrenamiento ni el uso de técnicas como data augmentation, preentrenamiento en COCO o ajuste fino específico. La evaluación se centra en métricas estándar de detección: mAP50 y mAP50-95, además de latencia y FPS medidos probablemente sobre una GPU no especificada.

## Capacidades

- Detección de baches en imágenes de carreteras, devolviendo cajas delimitadoras con confianza.
- Inferencia en tiempo real: la variante YOLOv8-FPN alcanza 155,8 FPS y YOLOv8n 144,7 FPS, adecuadas para procesamiento de vídeo en directo.
- Detección a múltiples escalas gracias a la pirámide de características en YOLOv8-FPN y arquitecturas de última generación.
- Flexibilidad de despliegue: pesos compatibles con el ecosistema Ultralytics (Python, CLI, ONNX, TensorRT, CoreML, etc.).
- Múltiples variantes con distintos balances precisión/velocidad para adaptarse a hardware limitado (edge) o servidores potentes.
- Capacidad de integración con pipelines de visión artificial existentes mediante la API de Ultralytics.

## Casos de uso

- **Monitoreo de infraestructura vial**: los departamentos de mantenimiento de carreteras pueden desplegar los modelos sobre cámaras fijas o vehículos de inspección para detectar baches de forma automática. La variante YOLOv9c ofrece la mejor precisión (mAP50 de 0,792) para identificar baches de forma fiable en imágenes de alta resolución.

- **Planificación de mantenimiento preventivo**: al integrar el modelo en un sistema de gestión de infraestructuras, se pueden generar informes automáticos de localización de baches, priorizando las zonas con mayor densidad de detecciones para optimizar las rutas de reparación.

- **Aplicaciones ciudadanas de reporte**: una app móvil que usa el modelo YOLOv8n (144,7 FPS) para detectar baches en tiempo real mientras el usuario graba la carretera, enviando la ubicación GPS y la imagen al ayuntamiento para agilizar la respuesta.

- **Inspección de carreteras con drones**: los modelos ligeros (YOLOv12n o YOLOv8-FPN) pueden ejecutarse en la computadora de a bordo de un dron, detectando baches en sobrevuelos de infraestructuras y transmitiendo solo las imágenes relevantes al servidor central, reduciendo la carga de red.

- **Investigación académica en visión por computador**: el repositorio sirve como base para estudios de detección de defectos en pavimentos, permitiendo comparar distintas arquitecturas YOLO bajo las mismas condiciones de entrenamiento y evaluar el impacto de la FPN en la detección de objetos pequeños.

- **Sistemas de aviso para conductores**: integrado en un dispositivo de asistencia a la conducción, el modelo puede alertar al conductor en tiempo real sobre la presencia de baches en la carretera, utilizando la variante de baja latencia (YOLOv8-FPN con 6,4 ms) para mantener una respuesta instantánea.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación sobre un conjunto de prueba no especificado. Las métricas mAP50 y mAP50-95 son estándar en detección de objetos, y la latencia/FPS se midieron probablemente en una GPU no detallada.

| Modelo | mAP50 | mAP50-95 | Latencia (ms) | FPS |
|---|---|---|---|---|
| YOLOv9c | 0,792 | 0,485 | 36,3 | 27,6 |
| YOLOv12n | 0,785 | 0,463 | 13,9 | 72,1 |
| YOLOv8n | 0,782 | 0,465 | 6,9 | 144,7 |
| YOLOv11 | 0,779 | 0,460 | 9,3 | 107,0 |
| YOLOv8-FPN | 0,707 | 0,396 | 6,4 | 155,8 |

Además, la model card reporta métricas de precisión, recall y F1 a diferentes umbrales de confianza sobre 40 imágenes de prueba y 86 objetos reales:

| Modelo | Confianza | Precision | Recall | F1 |
|---|---|---|---|---|
| YOLOv9c | 0,25 | 0,804 | 0,831 | 0,790 |
| YOLOv9c | 0,50 | 0,846 | 0,723 | 0,753 |
| YOLOv9c | 0,70 | 0,700 | 0,505 | 0,558 |
| YOLOv8n | 0,25 | 0,807 | 0,838 | 0,791 |
| YOLOv8n | 0,50 | 0,840 | 0,710 | 0,751 |
| YOLOv8n | 0,70 | 0,600 | 0,437 | 0,482 |

No se han publicado comparativas con modelos de detección de baches de otros autores.

## Requisitos de hardware

- **VRAM estimada**: los modelos son ligeros. YOLOv8n (3,01M parámetros) requiere aproximadamente 1-2 GB de VRAM en FP32 para inferencia; YOLOv9c (25,3M parámetros) requiere entre 4-6 GB. Con cuantizacion INT8 o FP16 se puede reducir el uso a la mitad.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente para las variantes pequeñas (YOLOv8n, YOLOv12n, YOLOv11, YOLOv8-FPN). Para YOLOv9c se recomienda una GPU de 4 GB o más (GTX 1650, RTX 3050, etc.).
- **Compatibilidad con hardware consumer**: sí, todos los modelos caben en GPU de consumo (RTX 2060, RTX 3060, etc.) y también pueden ejecutarse en CPU con rendimiento aceptable para inferencia por lotes (aunque no en tiempo real).
- **Opciones de despliegue**: los pesos son compatibles con el ecosistema Ultralytics (Python, CLI), y se pueden exportar a ONNX, TensorRT, CoreML o TFLite para inferencia en producción. No se proporcionan configuraciones específicas para vLLM o llama.cpp (no aplica a modelos de visión).
- **Latencia y throughput**: la latencia por imagen varía entre 6,4 ms (YOLOv8-FPN) y 36,3 ms (YOLOv9c), lo que permite procesamiento en tiempo real a 30 FPS en la mayoría de las variantes.

## Comparativa con modelos similares

No se ha publicado comparación con otros modelos de detección de baches en el repositorio. La comparativa interna entre las variantes es la siguiente:

| Modelo | Parametros | mAP50 | Latencia (ms) | Uso recomendado |
|---|---|---|---|---|
| YOLOv9c | 25,3M | 0,792 | 36,3 | Precisión máxima |
| YOLOv12n | 2,56M | 0,785 | 13,9 | Edge con buena precisión |
| YOLOv8n | 3,01M | 0,782 | 6,9 | Balance precision/velocidad |
| YOLOv11 | 2,58M | 0,779 | 9,3 | Eficiencia moderna |
| YOLOv8-FPN | 2,21M | 0,707 | 6,4 | Máxima velocidad |

Como referencia general, los modelos YOLO estándar preentrenados en COCO (como YOLOv8n público) alcanzan mAP50 de alrededor de 0,37 en COCO, pero no son comparables directamente porque este modelo está fine-tuneado para la tarea específica de baches. No hay otros modelos de detección de baches en HuggingFace con métricas publicadas en el momento de la redacción.

## Limitaciones y advertencias

- **Dependencia de las condiciones de la carretera**: los modelos se entrenaron sobre condiciones de carretera específicas; el rendimiento puede degradarse en terrenos diferentes o con condiciones climáticas adversas (lluvia, nieve, barro).
- **Sensibilidad a la calidad de imagen**: la precisión de la detección depende de la resolución y nitidez de la imagen. Imágenes borrosas o de baja resolución pueden reducir el recall.
- **Dificultad con baches pequeños u ocluidos**: el modelo puede fallar en detectar baches muy pequeños o parcialmente cubiertos por sombras, vehículos u objetos.
- **No validado para condiciones extremas**: la model card indica explícitamente que el rendimiento no ha sido evaluado en imágenes nocturnas ni con condiciones meteorológicas extremas, lo que limita su uso en operaciones 24/7.
- **Dataset de entrenamiento no documentado**: no se publica el tamaño ni la composición del dataset de entrenamiento, lo que dificulta evaluar el sesgo geográfico (por ejemplo, si solo se entrenó con carreteras de EE. UU., la generalización a otros países puede ser limitada).
- **Licencia MIT**: permite uso comercial libre, pero el autor no ofrece garantías sobre la precisión en producción. Es recomendable realizar una validación propia con datos locales antes de implantarlo en un sistema crítico.
- **Rendimiento en tiempo real**: aunque las variantes pequeñas alcanzan altos FPS, el rendimiento real depende del hardware y de la resolución de entrada. Las métricas de latencia se obtuvieron en un entorno no especificado, por lo que pueden variar en despliegues reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/EngJamesO/pothole-detector)
- [Repositorio GitHub](https://github.com/eng-james-o/pothole-detection)
- [Página de archivos del modelo](https://huggingface.co/EngJamesO/pothole-detector/tree/main)
