# dronefreak/visdrone-yolov10s

## Resumen

El modelo `dronefreak/visdrone-yolov10s` es un detector de objetos YOLOv10s afinado específicamente sobre el conjunto de datos VisDrone-DET, un benchmark de detección en imágenes aéreas captadas por dron. Lo publica el usuario dronefreak como parte de DetectionBench, un marco de trabajo cuyo objetivo es reproducir de forma estandarizada el entrenamiento y la evaluación de detectores modernos bajo recetas idénticas, de modo que las comparaciones entre arquitecturas sean justas. El checkpoint parte del modelo base Ultralytics/YOLOv10 y cuenta con 8,1 millones de parámetros y 25,1 GFLOPs a 640 píxeles.

Su relevancia es doble. Por un lado, la detección de objetos pequeños en imágenes aéreas (peatones, vehículos, bicicletas en escenas densas vistas desde arriba) es un problema notoriamente difícil, con objetos de pocos píxeles y oclusiones frecuentes. Por otro, el modelo se publica junto a una tabla comparativa completa de otros detectores (YOLOv8, YOLOv9, YOLOv11, YOLOv26 y RF-DETR) evaluados con el mismo pipeline, lo que permite situar su rendimiento respecto a alternativas sin necesidad de reentrenar nada.

En el split de test de VisDrone-DET el modelo declara un mAP@50 del 44,51 % y un mAP@50-95 del 26,28 %, con una precisión del 55,97 % y un recall del 45,61 %. Son cifras modestas en términos absolutos, pero coherentes con la dificultad del conjunto: el propio autor indica que las métricas se han calculado con su herramienta `detectionbench-evaluate` y que no están verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa basado en YOLOv10 (familia Ultralytics), sin supresión de no máximos (NMS-free) |
| Parametros totales | 8,1 M (modelo tamaño "s") |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica: es un modelo de visión. Resolución de entrada de 1280 px en los entrenamientos de DetectionBench; los 25,1 GFLOPs declarados corresponden a 640 px |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No aplica (deteccion de objetos en imagenes); no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible. El repositorio usa la libreria `ultralytics` y ocupa 0,1 GB, pero no se especifica el formato exacto del checkpoint |
| Tarea (pipeline) | `object-detection` |
| Modelo base | Ultralytics/YOLOv10 |
| Dataset de entrenamiento | Voxel51/VisDrone2019-DET (referenciado en la model card) |
| Resolucion de entrenamiento | 1280 px en los runs de DetectionBench |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion | 23 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

Se trata de un YOLOv10 en su variante "s" (small), un detector de una sola etapa y de tipo anchor-free que elimina la necesidad de NMS en postproceso, lo que reduce la latencia de inferencia frente a generaciones anteriores de la familia YOLO. El checkpoint no se entrena desde cero: parte de los pesos del modelo base Ultralytics/YOLOv10 y se afina sobre VisDrone-DET, un conjunto de imágenes aéreas con escenas urbanas densas y objetos de tamaño muy reducido. El resultado es un modelo de 8,1 M de parámetros y 25,1 GFLOPs medidos a 640 px, con un tamaño de repositorio de 0,1 GB.

La información disponible no detalla el número de épocas, la composición exacta del dataset, el esquema de aumento de datos ni si se aplicaron técnicas de destilación o ajuste fino selectivo. Sí se documenta el protocolo de evaluación: las métricas se calculan sobre el split de test de VisDrone-DET mediante la herramienta `detectionbench-evaluate` de DetectionBench. La model card señala además que los runs actuales de YOLO dentro de DetectionBench emplean entradas de 1280 px, mientras que ejecuciones anteriores del código compañero (VisDrone-dataset-python-toolkit, con YOLOv9t) usaban 640 px y 300 épocas. Esa diferencia de resolución de entrada es relevante al comparar cifras entre tablas.

## Capacidades

- Detección de objetos en imágenes aéreas captadas por dron, con cajas delimitadoras y puntuaciones de confianza.
- Detección de las clases definidas por VisDrone-DET, orientadas a personas, vehículos y bicicletas en escenas urbanas (la lista exacta de categorías no se detalla en la información proporcionada).
- Funcionamiento en modo NMS-free, lo que simplifica el postproceso y facilita despliegues de baja latencia.
- Inferencia sobre imágenes individuales y, a través del ecosistema Ultralytics, sobre vídeo y flujos en tiempo real (el propio repositorio incluye un vídeo de demostración con dos clips del split de test).
- Exportación a otros formatos de despliegue mediante las herramientas de Ultralytics (ONNX, TensorRT, OpenVINO, TFLite, entre otras), aunque el autor no confirma qué exportaciones se han validado.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión generativa, audio ni modo de pensamiento: es exclusivamente un detector de objetos.
- No hay soporte multilingüe ni generación de texto de ningún tipo.

## Casos de uso

- Vigilancia y monitorización con drones: el modelo está afinado sobre imágenes aéreas reales de VisDrone, por lo que detecta peatones y vehículos en tomas cenitales u oblicuas de dron, un dominio donde los detectores entrenados con imágenes naturales rinden peor.
- Análisis de tráfico urbano: permite estimar densidad y flujo de vehículos en intersecciones y vías vistas desde el aire, útil para estudios de movilidad o para alimentar sistemas de gestión de tráfico.
- Conteo de multitudes y aforo: en eventos o espacios públicos, un dron equipado con este modelo puede estimar el número de personas por zona, con la ventaja de que el modelo está optimizado para objetos pequeños, típicos cuando la cámara vuela alto.
- Búsqueda y rescate: detección de personas en terrenos abiertos desde un dron en vuelo; el modelo puede desplegarse en hardware de borde para procesar el vídeo a bordo y reducir la dependencia de enlace de comunicaciones.
- Inspección de infraestructuras y obra civil: detección de maquinaria, vehículos y operarios en imágenes de obra tomadas con dron, para seguimiento de avance o control de seguridad.
- Agricultura y recuento de elementos en campo: aunque VisDrone está centrado en escenas urbanas, el modelo sirve como base para ajuste fino sobre dominios aéreos similares donde se necesite contar objetos pequeños.
- Módulo de percepción en pipeline de visión embarcada: al ser un modelo de 8,1 M de parámetros y sin NMS, es candidato para despliegue en dispositivos con recursos limitados (drones, Jetson, cámaras inteligentes).
- Punto de referencia reproducible en investigación: gracias a DetectionBench, puede usarse como baseline para comparar nuevas arquitecturas de detección aérea bajo una receta de entrenamiento y unas métricas idénticas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y el model-index. Los valores están marcados como `verified: false`, es decir, no han sido verificados de forma independiente. Split de test de VisDrone-DET.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 44,51 |
| mAP@50-95 | 26,28 |
| Precision | 55,97 |
| Recall | 45,61 |
| F1 | 50,26 |
| Parametros | 8,1 M |
| FLOPs | 25,1 G (a 640 px) |

Comparativa oficial del autor sobre VisDrone-DET (mismo pipeline de evaluación):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv9s | 45,38 | 26,95 | 56,95 | 46,19 |
| YOLOv10s (este modelo) | 44,51 | 26,28 | 55,97 | 45,61 |
| YOLOv8s | 43,47 | 25,77 | 56,09 | 44,51 |
| YOLOv9t | 40,67 | 23,73 | 52,84 | 41,78 |
| YOLOv26n | 39,90 | 22,95 | 51,14 | 42,08 |
| YOLOv10n | 39,80 | 23,08 | 51,22 | 41,50 |
| YOLOv8n | 39,69 | 23,03 | 52,02 | 41,36 |
| YOLOv11n | 39,52 | 23,00 | 51,49 | 41,02 |
| RF-DETR Nano | 37,92 | 20,88 | 69,02 | 46,21 |

## Requisitos de hardware

Todas las cifras de esta sección marcadas como estimación son orientativas y no han sido publicadas por el autor.

- Peso del modelo: 8,1 M de parámetros equivalen a aproximadamente 32 MB en FP32 y 16 MB en FP16, solo para los pesos. El repositorio completo ocupa 0,1 GB.
- El consumo de memoria en inferencia está dominado por las activaciones, no por los pesos. A 1280 px, resolución usada en los entrenamientos de DetectionBench, el pico de memoria es sensiblemente mayor que a 640 px.
- VRAM estimada (orientativa): alrededor de 1-3 GB en FP16 para lote 1 a 640 px; previsiblemente 2-6 GB a 1280 px según lote y backend. Reducible por debajo de 1 GB con cuantización INT8 (estimación, no confirmada por el autor).
- GPU de servidor: cualquier GPU moderna es sobredimensionada para este modelo; A100, H100, L40S o A10 bastan y permiten lotes grandes y alta concurrencia.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares, incluso a 1280 px.
- Hardware de borde: por tamaño y FLOPs es candidato claro para NVIDIA Jetson (Orin Nano, Orin NX), Raspberry Pi con acelerador y cámaras inteligentes, previa exportación a TensorRT, ONNX Runtime u OpenVINO.
- Opciones de despliegue: API de Python de Ultralytics (librería declarada en el repositorio), exportación a ONNX / TensorRT / OpenVINO / TFLite / CoreML mediante las herramientas de Ultralytics, y despliegue en C++ con ONNX Runtime o TensorRT. No se menciona soporte explícito para servidores de inferencia como vLLM o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (VisDrone-DET) | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv10s (este modelo) | 8,1 M | 44,51 | 26,28 | AGPL-3.0 | HuggingFace, via `ultralytics` |
| YOLOv9s | No disponible | 45,38 | 26,95 | Segun repositorio original de YOLOv9 (no confirmada en la informacion disponible) | Peso comparable en DetectionBench |
| YOLOv8s | No disponible | 43,47 | 25,77 | AGPL-3.0 (Ultralytics) | Ampliamente disponible |
| RF-DETR Nano | No disponible | 37,92 | 20,88 | No disponible en la informacion proporcionada | DetectionBench |
| YOLOv11n | No disponible | 39,52 | 23,00 | AGPL-3.0 (Ultralytics) | Ampliamente disponible |

En la comparativa del propio autor, YOLOv9s supera ligeramente a este YOLOv10s en todas las métricas (45,38 frente a 44,51 en mAP@50), mientras que YOLOv8s queda por detrás. RF-DETR Nano presenta una precisión mucho más alta (69,02) a costa de un recall y un mAP claramente inferiores, lo que sugiere un comportamiento más conservador en la predicción. No se dispone de datos de latencia ni de número de parámetros de las alternativas en la información proporcionada, por lo que la comparación de eficiencia no puede completarse.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el código fuente de las obras derivadas y de los servicios en red que lo integren. Para productos propietarios suele requerirse una licencia comercial alternativa de Ultralytics. Conviene revisar los términos antes de desplegar en producción.
- Herencia de licencia: al derivar de Ultralytics/YOLOv10, el modelo arrastra las condiciones del proyecto Ultralytics, que históricamente ha combinado AGPL-3.0 con licencias comerciales de pago.
- Métricas no verificadas: todos los resultados están marcados como `verified: false` en el model-index. Han sido calculados por el autor con su propio pipeline, por lo que no cuentan con validación independiente.
- Riesgo de sobreajuste al dominio: el modelo está afinado exclusivamente sobre VisDrone-DET, con imágenes aéreas de escenas urbanas densas. Su rendimiento fuera de ese dominio (otra altitud, otro sensor, otra geografía, imágenes satelitales, escenas interiores) no está documentado y probablemente se degrade.
- Sesgo geográfico y de captura: el comportamiento del modelo está condicionado por la distribución de VisDrone (recogido con drones en entornos urbanos). No hay información en la documentación proporcionada sobre la composición geográfica del conjunto, pero es previsible un sesgo hacia el tipo de escena y de vehículos presentes en él.
- Objetos pequeños y oclusiones: mAP@50-95 de 26,28 y recall de 45,61 indican que una fracción relevante de objetos, especialmente los pequeños o parcialmente ocultos, no se detecta. Es una limitación intrínseca del conjunto, no un defecto del checkpoint, pero debe tenerse en cuenta en aplicaciones críticas.
- Falsos positivos: la precisión del 55,97 % implica un volumen apreciable de detecciones incorrectas; en escenas densas el conteo agregado puede sobreestimar el número real de objetos.
- Sin información sobre cuantización ni exportaciones verificadas: no se documentan variantes cuantizadas ni qué backends de exportación han sido probados, lo que añade incertidumbre al despliegue en hardware específico.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- No es un modelo de lenguaje: no genera texto, no soporta instrucciones en lenguaje natural ni razonamiento multi-paso. Cualquier expectativa de ese tipo es inaplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/visdrone-yolov10s
- Repositorio DetectionBench (framework de entrenamiento y evaluacion): https://github.com/dronefreak/DetectionBench
- Toolkit complementario VisDrone-dataset-python-toolkit: https://github.com/dronefreak/VisDrone-dataset-python-toolkit
- Coleccion VisDrone Detection Model Zoo: https://huggingface.co/collections/dronefreak/visdrone-detection-model-zoo
- Modelo hermano YOLOv10l afinado sobre VisDrone: https://huggingface.co/dronefreak/visdrone-yolov10l
- Dataset Voxel51/VisDrone2019-DET: https://huggingface.co/datasets/Voxel51/VisDrone2019-DET
- Modelo base Ultralytics/YOLOv10: https://huggingface.co/Ultralytics/YOLOv10
- V10Drone-YOLOv10 (implementacion alternativa con KAN para objetos pequeños): https://github.com/SkyWxxk/V10Drone-YOLOv10
- Paper V10Drone (IEEE): https://ieeexplore.ieee.org/abstract/document/10914641
- Referencias arXiv incluidas en los tags del repositorio (los titulos no se han verificado en la informacion proporcionada):
  - https://arxiv.org/abs/1804.07437
  - https://arxiv.org/abs/2405.14458
  - https://arxiv.org/abs/2511.09554
  - https://arxiv.org/abs/2304.07193
  - https://arxiv.org/abs/2410.17725
  - https://arxiv.org/abs/2606.03748
  - https://arxiv.org/abs/2402.13616
