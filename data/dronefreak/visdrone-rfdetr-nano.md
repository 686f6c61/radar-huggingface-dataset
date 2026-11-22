# dronefreak/visdrone-rfdetr-nano

## Resumen

`dronefreak/visdrone-rfdetr-nano` es un detector de objetos basado en RF-DETR Nano, un transformer de detección desarrollado originalmente por Roboflow, afinado por el usuario `dronefreak` sobre el conjunto de datos VisDrone-DET (imágenes aéreas capturadas con drones). El modelo resuelve el problema de detección de objetos en escenarios de visión aérea, donde los objetos son pequeños, numerosos y aparecen en condiciones de altitud y perspectiva poco habituales respecto a los datasets convencionales como COCO.

El checkpoint forma parte de DetectionBench, un marco de trabajo para comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas. Esta uniformidad metodológica es lo que hace relevante al modelo: sus resultados son directamente comparables con los de la familia YOLO (v8, v9, v10, v11, v26) evaluados bajo el mismo pipeline, algo poco frecuente en publicaciones de modelos afinados.

Con 30,5 millones de parámetros y un tamaño de repositorio de 0,4 GB, se trata de un modelo compacto orientado a inferencia en entornos con recursos limitados, lo que encaja con su aplicación típica: detección en tiempo real sobre imágenes o vídeo de drones. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer de detección basado en DETR) |
| Parámetros totales | 30.576.272 (30,5 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en `.pth`; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch); repo con safetensors en metadatos, pero la carga documentada usa `checkpoint_best_total.pth` |

## Arquitectura y entrenamiento

RF-DETR es un detector de objetos construido sobre un transformer tipo DETR, con un backbone y un decodificador que predicen conjuntos de cajas y clases sin necesidad de anclas ni de supresión no máxima (NMS) post-proceso en su forma canónica. La variante Nano es la de menor tamaño de la familia RF-DETR de Roboflow, con 30,5 M de parámetros, pensada para despliegues con presupuesto computacional ajustado. El modelo parte de los pesos preentrenados de `Roboflow/rf-detr-nano` y se afina sobre VisDrone-DET.

El entrenamiento se realizó en el marco de DetectionBench, que fija una receta común (resolución de entrada, aumentos de datos, número de épocas, optimizador y criterios de evaluación) para todos los detectores comparados. El dataset VisDrone-DET contiene imágenes aéreas con anotaciones de peatones, vehículos, bicicletas y otras clases típicas de escenas urbanas vistas desde dron. No se documentan en la información disponible el número exacto de tokens/imágenes de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en detección de objetos). Tampoco se publican FLOPs del modelo.

## Capacidades

- Detección de objetos en imágenes aéreas: identifica peatones, vehículos, bicicletas y otras clases anotadas en VisDrone-DET.
- Predicción de cajas delimitadoras con puntuaciones de confianza y etiquetas de clase.
- Inferencia sobre imágenes individuales mediante `model.predict("image.jpg", threshold=0.25)`.
- Ajuste del umbral de confianza en tiempo de inferencia para equilibrar precisión y recall.
- Integración con la librería `rfdetr` y descarga de pesos vía `huggingface_hub`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No se documentan capacidades de segmentación, visión-lenguaje ni audio.

## Casos de uso

- Vigilancia con drones: el modelo detecta peatones y vehículos en imágenes aéreas de alta densidad, adecuado para monitorización de tráfico o seguridad en entornos urbanos gracias a su bajo coste computacional (30,5 M de parámetros).
- Análisis de tráfico urbano: conteo y localización de vehículos en grabaciones aéreas para estudios de movilidad, usando el umbral de confianza para ajustar la sensibilidad según la densidad de la escena.
- Búsqueda y rescate: detección de personas en imágenes de dron sobre áreas extensas, donde el recall (46,21 %) y la precisión (69,02 %) permiten un primer filtrado que un operador humano revisa después.
- Agricultura de precisión: detección de elementos en campo (vehículos, personas, obstáculos) a partir de vuelos de dron, con despliegue en hardware de borde por el reducido tamaño del modelo.
- Inspección de infraestructuras: localización de vehículos y personal en imágenes de obra o instalaciones vistas desde el aire, integrable en pipelines de procesamiento por lotes.
- Prototipado rápido en investigación: al estar evaluado con DetectionBench, sirve como línea base reproducible para comparar nuevos detectores bajo la misma receta, sin necesidad de reentrenar desde cero.
- Procesamiento por lotes de datasets aéreos: generación de pseudo-etiquetas o preanotaciones para acelerar el etiquetado manual de nuevos conjuntos de imágenes de dron.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de VisDrone-DET, con el pipeline `detectionbench-evaluate`. No verificados de forma independiente (`verified: false`).

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 37,92 |
| mAP@50-95 | 20,88 |
| Precisión | 69,02 |
| Recall | 46,21 |
| F1 | 55,36 |

Comparativa dentro del model zoo de VisDrone-DET de DetectionBench (mismos datos y pipeline):

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recall |
|---|---|---|---|---|
| YOLO26m | 49,11 | 29,24 | 60,21 | 49,76 |
| YOLO11m | 48,03 | 28,56 | 59,34 | 48,30 |
| YOLOv8m | 45,47 | 26,94 | 57,86 | 46,39 |
| YOLO11s | 43,64 | 25,88 | 54,48 | 45,01 |
| YOLO26n | 39,90 | 22,95 | 51,14 | 42,08 |
| YOLOv8n | 39,69 | 23,03 | 52,02 | 41,36 |
| RF-DETR Medium | 39,62 | 21,99 | 70,62 | 46,76 |
| YOLO11n | 39,52 | 23,00 | 51,49 | 41,02 |
| RF-DETR Small | 39,13 | 21,68 | 64,38 | 49,47 |
| **RF-DETR Nano (este)** | **37,92** | **20,88** | **69,02** | **46,21** |

El modelo queda por debajo de las variantes YOLO de tamaño similar en mAP, pero destaca en precisión (69,02 %), la más alta del grupo salvo RF-DETR Medium, lo que indica menos falsos positivos a costa de un recall más bajo.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada; con 30,5 M de parámetros y pesos en FP32 el checkpoint ocupa del orden de 120 MB, por lo que la huella en memoria es muy reducida (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente en la práctica; se beneficia de GPUs modernas (RTX 3060/4060 en adelante, A100/H100 para lotes grandes).
- Cabe holgadamente en GPU de consumo: sí, en modelos como RTX 3050, RTX 4060, RTX 4090 o incluso en hardware de borde con suficiente memoria.
- Opciones de despliegue: la librería oficial `rfdetr` (PyTorch) es la vía documentada; no se documentan exportaciones a ONNX, TensorRT, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 (VisDrone) | Licencia | Disponibilidad |
|---|---|---|---|---|
| RF-DETR Nano (este) | 30,5 M | 37,92 | Apache 2.0 | Hugging Face |
| RF-DETR Small | no disponible | 39,13 | no disponible | Hugging Face (Roboflow) |
| RF-DETR Medium | no disponible | 39,62 | no disponible | Hugging Face (Roboflow) |
| YOLO11n | no disponible | 39,52 | AGPL-3.0 (Ultralytics) | Ultralytics |
| YOLOv8n | no disponible | 39,69 | AGPL-3.0 (Ultralytics) | Ultralytics |

Frente a YOLO11n y YOLOv8n, el modelo pierde entre 1,6 y 1,8 puntos de mAP@50, pero gana en precisión (69,02 % frente a 51,49 % y 52,02 %) y ofrece licencia Apache 2.0, más permisiva que la AGPL de Ultralytics para uso comercial cerrado.

## Limitaciones y advertencias

- Rendimiento inferior a las variantes YOLO de tamaño comparable en mAP@50 y mAP@50-95; no es la mejor opción si prima la métrica global de detección.
- Recall moderado (46,21 %): puede omitir objetos pequeños o parcialmente ocluidos, frecuentes en imágenes aéreas de alta densidad.
- Especializado en el dominio aéreo de VisDrone; su rendimiento en imágenes terrestres o de otras perspectivas no está documentado y probablemente sea peor.
- Resultados de benchmarks no verificados de forma independiente (`verified: false`); proceden del propio autor.
- No se documentan sesgos demográficos ni geográficos, pero el dataset VisDrone está sesgado hacia escenas urbanas de determinadas regiones, lo que puede afectar a la generalización.
- Riesgo de alucinación en el sentido de detecciones falsas positivas en escenas con texturas o patrones que se parezcan a las clases entrenadas; el umbral de confianza debe calibrarse por caso de uso.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset VisDrone subyacente si se redistribuyen datos derivados.
- No se publican FLOPs, latencia ni requisitos de hardware oficiales, lo que dificulta planificar despliegues en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/visdrone-rfdetr-nano
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Roboflow/rf-detr-nano
- Dataset VisDrone2019-DET: https://huggingface.co/datasets/Voxel51/VisDrone2019-DET
- Paper VisDrone (arXiv:1804.07437): https://arxiv.org/abs/1804.07437
- Paper RF-DETR (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper DETR (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
