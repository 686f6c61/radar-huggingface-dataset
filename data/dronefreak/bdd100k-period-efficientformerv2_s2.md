# dronefreak/bdd100k-period-efficientformerv2_s2

## Resumen

`dronefreak/bdd100k-period-efficientformerv2_s2` es un clasificador de imágenes de 4 clases que predice el momento del día (daytime, night, dawn or dusk, unknown) a partir de una imagen de escena de conducción. Lo publica el usuario dronefreak como parte de BDD100K-Toolkit, un conjunto de herramientas sin dependencias pesadas para preparar BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y los mismos splits. No es un modelo fundacional: es un ajuste fino (fine-tuning) de un backbone EfficientFormerV2-S2, con 12,1 millones de parámetros, orientado a inferencia de baja latencia.

El modelo parte de `timm/efficientformerv2_s2.snap_dist_in1k`, un vision transformer híbrido preentrenado en ImageNet-1k con destilación, y se reentrena sobre el dataset `dronefreak/BDD100K-Period-Classification`, derivado del campo de atributos `attributes.timeofday` de BDD100K. La tarea es no oficial y sigue el dataset de Kaggle del mismo nombre. El checkpoint se distribuye como `best.pt` en un repositorio de 0,1 GB bajo licencia Apache-2.0.

Su relevancia es práctica más que arquitectónica: resuelve con muy poco coste computacional una etiqueta auxiliar muy útil en pipelines de conducción autónoma (preprocesado de datasets, ajuste de modos de cámara, segmentación de flotas por condiciones de iluminación). Como referencia, declara un 93,01 % de Top-1 en el split de test de 10 000 imágenes, con un macro F1 de 80,38 % que refleja el fuerte desbalanceo entre clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientFormerV2-S2 (vision transformer híbrido con etapas convolucionales y bloques de atención, diseño orientado a latencia móvil) más cabeza de clasificación lineal de 4 clases |
| Parametros totales | 12,1 M (según la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes; no hay componente de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch `best.pt` (diccionario con `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std`); no se publican safetensors ni GGUF |

Otros datos de interés: tarea `image-classification` (pipeline de Hugging Face), librería `timm`, framework PyTorch, etiquetas `time-of-day-classification`, `autonomous-driving`, `driving-scenes`, tamaño del repositorio 0,1 GB.

## Arquitectura y entrenamiento

La base es EfficientFormerV2-S2, presentada en el artículo arXiv:2212.08059 ("EfficientFormerV2: Rethinking Vision Transformers for MobileNet Size and Speed"). Es una familia de vision transformers híbridos que combina bloques convolucionales ligeros con bloques de atención en una estructura de varias etapas, con el objetivo de igualar el coste de parámetros y la latencia de las CNN móviles. El identificador de timm `efficientformerv2_s2.snap_dist_in1k` indica que el backbone de partida se preentrenó sobre ImageNet-1k con destilación. La información disponible no detalla el profesor de destilación ni los hiperparámetros exactos de ese preentrenamiento.

Sobre el ajuste fino, la model card solo especifica el resultado: reentrenamiento sobre el dataset `dronefreak/BDD100K-Period-Classification` y evaluación sobre el split `test` (10 000 imágenes) con la métrica definida por BDD100K-Toolkit. No se publican el número de épocas, el optimizador, la tasa de aprendizaje, las técnicas de augmentation ni el recuento de tokens o imágenes del split de entrenamiento, por lo que esos datos deben considerarse no disponibles. Tampoco se documenta el uso de RLHF, DPO u otras técnicas de alineación, que no aplican a una tarea de clasificación visual supervisada.

El checkpoint incluye metadatos de inferencia (`imgsz`, `mean`, `std`) que fijan la resolución de entrada y la normalización exigidas, de modo que el preprocesado debe replicarse exactamente tal y como aparece en el ejemplo de uso de la model card.

## Capacidades

- Clasificación de imágenes en 4 clases de momento del día: `dawn or dusk`, `daytime`, `night` y `unknown`.
- Salida de probabilidades por clase mediante `softmax`, lo que permite aplicar umbrales de confianza propios en producción.
- Funciona sobre imágenes RGB individuales y admite procesamiento por lotes (batch) según el ejemplo de inferencia con PyTorch y timm.
- Diseñado para inferencia de baja latencia en hardware modesto: 12,1 M de parámetros y pesos en el rango de decenas de megabytes.
- Integración directa con el ecosistema timm/PyTorch para exportación a otros formatos de despliegue.
- No soporta tool calling ni function calling.
- No tiene capacidades de agente ni de razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión generativa, audio ni generación de texto: es exclusivamente un clasificador de imagen a etiqueta.

## Casos de uso

- Etiquetado automático de datasets de conducción: aplicar el modelo sobre grandes volúmenes de imágenes de dashcam para anotar el atributo de momento del día sin intervención humana. La cabecera de 4 clases y el coste de 12,1 M de parámetros permiten procesar lotes masivos en una sola GPU.
- Curación y filtrado de datasets por condiciones de iluminación: seleccionar subconjuntos de imágenes nocturnas o de amanecer/atardecer para entrenar o evaluar modelos de detección en condiciones adversas, o para equilibrar la distribución de un dataset de percepción.
- Preprocesado en pipelines de percepción autónoma: usar la etiqueta predicha como señal para conmutar parámetros de la cámara o del pipeline (por ejemplo, activar estrategias específicas de realce en escenas nocturnas) antes de ejecutar el detector principal.
- Telemetría y análisis de flotas: clasificar automáticamente miles de horas de grabación de vehículos comerciales para construir informes de exposición por franja horaria, útil en seguros, mantenimiento predictivo o análisis de siniestralidad.
- Robótica móvil y AGV en interiores y exteriores: adaptar la configuración de exposición, ganancia o modelos de percepción auxiliares según el momento del día detectado, con un modelo que cabe en un Jetson o incluso en CPU.
- Análisis de vídeo urbano y gestión de tráfico: etiquetar flujos de cámaras municipales por condición lumínica para segmentar análisis posteriores o para validar la cobertura horaria de un despliegue.
- Validación de sistemas ADAS en banco de pruebas: clasificar los clips de un dataset de validación para garantizar que las pruebas cubren escenarios diurnos, nocturnos y de transición crepuscular.
- Módulo de referencia en investigación: al formar parte de BDD100K-Toolkit, sirve como baseline reproducible para comparar backbones ligeros sobre la misma tarea, split y métricas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (marcados como no verificados por un tercero), evaluados sobre el split `test` de 10 000 imágenes de `dronefreak/BDD100K-Period-Classification`:

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 93,01 % |
| Macro F1 | 80,38 % |
| Balanced accuracy | 76,79 % |
| Macro precision | 85,35 % |
| Macro recall | 76,79 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imágenes de test |
|---|---|---|---|---|
| dawn or dusk | 62,52 % | 50,39 % | 55,80 % | 778 |
| daytime | 92,99 % | 95,44 % | 94,20 % | 5258 |
| night | 97,90 % | 98,47 % | 98,19 % | 3929 |
| unknown | 88,00 % | 62,86 % | 73,33 % | 35 |

Comparativa con otros modelos del mismo toolkit, todos evaluados sobre el mismo split y ordenados por Top-1 (fragmento disponible de la tabla "Model Zoo" de la model card):

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 94,01 % | 83,19 % | 79,63 % | 87,95 % |
| EfficientViT-L1 | 93,98 % | 82,68 % | 78,45 % | 88,75 % |
| ConvNeXt-Atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % |
| EfficientViT-B2 | 93,92 % | 82,53 % | 78,88 % | 87,49 % |
| RepViT-M2.3 | 93,89 % | 82,35 % | 78,49 % | 87,72 % |
| YOLO11n | 93,79 % | 80,13 % | 75,19 % | 88,20 % |
| EfficientViT-B1 | 93,77 % | 82,63 % | 78,93 % | 88,38 % |
| EfficientViT-B3 | 93,77 % | 81,04 % | 76,29 % | 88,43 % |
| YOLO11s | 93,73 % | 81,22 % | 77,49 % | 86,42 % |
| EfficientViT-B0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| YOLO26n | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| MobileNetV4-Conv-Small | 93,57 % | 80,22 % | 76,22 % | 86,06 % |
| YOLOv8n | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| MobileNetV4-Conv-Large | 93,46 % | 80,21 % | resto no disponible en la información proporcionada | — |

La tabla del model zoo continúa más allá del fragmento disponible. Dentro de las filas visibles, todos los modelos superan el Top-1 del modelo de esta ficha (93,01 %), lo que conviene tener en cuenta al elegirlo como baseline. No se han publicado resultados de benchmarks adicionales (ImageNet, latencia medida, throughput) en la información disponible; el Top-1 de ImageNet del backbone original no se detalla en la model card.

## Requisitos de hardware

- Huella de pesos estimada a partir de los 12,1 M de parámetros: aproximadamente 48 MB en fp32, unos 24 MB en fp16 y unos 12 MB en int8. Son estimaciones de cálculo, no cifras publicadas por el autor.
- VRAM para inferencia: muy inferior a 1 GB en la práctica; el consumo lo domina el tamaño del lote y la resolución fijada por `imgsz`, no el modelo.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4060 o superior da un margen enorme. Las A100 y H100 están sobredimensionadas para este modelo y solo tienen sentido si se comparte con otros procesos.
- Cabe sin problema en GPU de consumo: RTX 4090, RTX 3090, RTX 2080, GTX 1650, así como en Apple Silicon vía MPS. También es viable en CPU para lotes pequeños.
- Despliegue en edge: Jetson Orin, Jetson Xavier NX, Jetson Nano o Raspberry Pi son objetivos razonables dado el tamaño del modelo, aunque no se publican medidas de latencia reales.
- Opciones de despliegue: PyTorch + timm (ruta oficial del autor), exportación a ONNX y ONNX Runtime, TensorRT, OpenVINO, CoreML y `torch.compile`. Las herramientas típicas de LLM (vLLM, llama.cpp, TGI, Ollama) no aplican a un clasificador de imágenes.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia, FPS ni comparativas de velocidad frente a los demás modelos del model zoo.

## Comparativa con modelos similares

Todos los modelos de la tabla siguiente pertenecen al mismo toolkit y se evaluaron sobre el mismo split de test, según la información proporcionada.

| Modelo | Parametros | Top-1 | Macro F1 | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EfficientFormerV2-S2 (esta ficha) | 12,1 M | 93,01 % | 80,38 % | no aplica (visión) | Apache-2.0 | Hugging Face (checkpoint `.pt`) |
| TinyViT-21M | no disponible (la nomenclatura sugiere ~21 M) | 94,01 % | 83,19 % | no aplica (visión) | no disponible | dentro de BDD100K-Toolkit |
| EfficientViT-L1 | no disponible | 93,98 % | 82,68 % | no aplica (visión) | no disponible | dentro de BDD100K-Toolkit |
| ConvNeXt-Atto | no disponible (la nomenclatura sugiere un modelo de escala "atto") | 93,95 % | 80,75 % | no aplica (visión) | no disponible | dentro de BDD100K-Toolkit |
| YOLO11n | no disponible | 93,79 % | 80,13 % | no aplica (visión) | no disponible | dentro de BDD100K-Toolkit |

Lectura de la comparativa: en el fragmento disponible, TinyViT-21M, EfficientViT-L1 y ConvNeXt-Atto superan a EfficientFormerV2-S2 tanto en Top-1 como en macro F1 sobre esta tarea concreta, y YOLO11n (un detector reutilizado como clasificador) queda por delante en Top-1 aunque por detrás en macro F1. La licencia de los modelos alternativos no aparece en la información proporcionada.

## Limitaciones y advertencias

- Fuerte desbalanceo de clases: `daytime` (5258 imágenes de test) y `night` (3929) dominan el test, mientras que `dawn or dusk` tiene 778 y `unknown` solo 35. El macro F1 de 80,38 % frente al 93,01 % de Top-1 es consecuencia directa de ese desbalanceo.
- Rendimiento pobre en la clase `dawn or dusk`: F1 del 55,80 %, con recall del 50,39 %. Es previsible que el modelo confunda amanecer/atardecer con día o noche, justo la franja más crítica en escenas de conducción reales.
- La clase `unknown` está infrarrepresentada (35 imágenes de test) y su recall del 62,86 % es poco fiable estadísticamente. No conviene desplegar el modelo esperando un comportamiento robusto en esa categoría.
- El modelo es un clasificador cerrado de 4 clases: no detecta objetos, no segmenta, no estima profundidad y no procesa texto ni audio.
- Riesgo de alucinación en el sentido propio de los modelos generativos no aplica, pero sí existe riesgo de clasificación errónea con confianza alta en imágenes ambiguas (interiores, imágenes muy subexpuestas, escenas con niebla densa o iluminación artificial intensa).
- Dominio restringido: entrenado sobre imágenes de conducción de BDD100K. El rendimiento fuera de ese dominio (otras geografías, otras cámaras, imágenes aéreas, interiores) no está documentado y probablemente se degrade.
- Métricas no verificadas: el model-index marca los resultados como `verified: false`. No hay evaluación independiente ni replicación por terceros.
- Detalles de entrenamiento no publicados: sin épocas, optimizador, resolución de entrenamiento explícita (queda dentro del checkpoint como `imgsz`), composición del split de entrenamiento ni estrategia de balanceo. Esto dificulta reproducir el ajuste fino.
- Licencia Apache-2.0 en el repositorio del modelo, permisiva para uso comercial. Hay que tener en cuenta, aparte, las condiciones de uso del dataset BDD100K original y del dataset derivado `dronefreak/BDD100K-Period-Classification`, cuyos términos no se detallan en la información proporcionada.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta: es un artefacto reciente y sin validación comunitaria, lo que desaconseja usarlo en producción sin una evaluación propia sobre datos del caso de uso real.
- El preprocesado está fijado por el checkpoint (`imgsz`, `mean`, `std`). Ignorarlo altera las predicciones de forma silenciosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-period-efficientformerv2_s2
- Modelo base en timm: https://huggingface.co/timm/efficientformerv2_s2.snap_dist_in1k
- Dataset de la tarea: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Repositorio BDD100K-Toolkit (código fuente y evaluación): https://github.com/dronefreak/bdd100k-toolkit
- Artículo de EfficientFormerV2: https://arxiv.org/abs/2212.08059
- Artículo de BDD100K: https://arxiv.org/abs/1805.04687
- Vídeo de demostración incluido en la model card: https://huggingface.co/dronefreak/bdd100k-period-efficientformerv2_s2/resolve/main/assets/demo_banner.mp4
- Póster del vídeo de demostración: https://huggingface.co/dronefreak/bdd100k-period-efficientformerv2_s2/resolve/main/assets/demo_banner_poster.jpg
- Nota: la model card menciona un dataset de Kaggle con el mismo nombre que la tarea, pero no se proporciona enlace al mismo en la información disponible.
