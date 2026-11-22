# dronefreak/visdrone-rfdetr-medium

## Resumen

`dronefreak/visdrone-rfdetr-medium` es un detector de objetos basado en RF-DETR Medium, un transformer de detección desarrollado originalmente por Roboflow, que ha sido afinado sobre el conjunto de datos VisDrone-DET para detección en imágenes aéreas capturadas por drones. El modelo lo publica el usuario dronefreak como parte de DetectionBench, un marco de trabajo para comparar de forma reproducible detectores modernos con recetas de entrenamiento y métricas idénticas sobre múltiples conjuntos de datos reales.

El modelo resuelve el problema de detectar objetos pequeños y densos en escenas aéreas (peatones, vehículos, bicicletas, triciclos y otros) con una arquitectura DETR (transformer con atención) en lugar de las arquitecturas YOLO basadas en CNN, que dominan habitualmente este nicho. Con 33,5 millones de parámetros y licencia Apache 2.0, es un checkpoint ligero y comercialmente utilizable.

Su relevancia actual radica en que forma parte de un zoo de modelos evaluados bajo el mismo pipeline en VisDrone-DET, lo que permite comparaciones justas entre familias (YOLO y RF-DETR) y ofrece una alternativa con mayor precisión (precision del 70,62 %) aunque con menor recall y mAP que los YOLO de tamaño medio. Es un modelo especializado, no un modelo de lenguaje: no procesa texto ni tiene contexto conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR Medium (transformer DETR, familia RF-DETR de Roboflow) |
| Parámetros totales | 33.519.952 (33,5 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (pesos en punto flotante; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en el repo; checkpoint de inferencia `checkpoint_best_total.pth` (PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Medium, un detector de la familia DETR (Detection Transformer) que emplea un backbone y un decoder transformer con atención, en contraste con los detectores YOLO basados en CNN. El checkpoint parte de los pesos preentrenados de `Roboflow/rf-detr-medium` y se afina sobre el conjunto VisDrone-DET (etiquetado en Hugging Face como `Voxel51/VisDrone2019-DET`), orientado a imágenes aéreas de drones con objetos pequeños y muy densos.

El entrenamiento y la evaluación se realizan dentro de DetectionBench, que aplica recetas de entrenamiento y métricas idénticas a todos los modelos del zoo para garantizar comparabilidad. La model card no detalla el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de aumento específicas, RLHF o DPO (no aplicables a detección). Tampoco se publican FLOPs ni detalles del backbone más allá de la referencia al modelo base.

## Capacidades

- Detección de objetos en imágenes aéreas de drones: peatones, vehículos, bicicletas, triciclos y clases propias de VisDrone-DET.
- Salida de cajas delimitadoras con puntuaciones de confianza y etiquetas de clase, con umbral de confianza configurable (`threshold`).
- Inferencia sobre imágenes individuales mediante `model.predict("image.jpg", threshold=0.25)`.
- Integración con la librería `rfdetr` y descarga de pesos vía `huggingface_hub`.
- Capacidad de servir como base para fine-tuning en otros dominios aéreos o de vigilancia.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión por computador.

## Casos de uso

- Vigilancia con drones: detección de personas y vehículos en tiempo real sobre vídeo aéreo, aprovechando el bajo número de parámetros (33,5 M) para ejecución en hardware de bordo.
- Análisis de tráfico urbano: conteo y localización de vehículos y peatones en imágenes cenitales para estudios de movilidad, usando las clases de VisDrone-DET.
- Monitorización de multitudes: estimación de densidad de peatones en eventos o espacios públicos, donde la precision del 70,62 % reduce falsos positivos en escenas concurridas.
- Seguridad perimetral: detección de intrusiones en zonas restringidas mediante cámaras aéreas o fijas en altura.
- Búsqueda y rescate: localización de personas en terrenos abiertos captados desde dron, como punto de partida para un pipeline de alerta.
- Análisis de imágenes satelitales o de alta altitud: adaptación mediante fine-tuning a otros dominios aéreos, gracias a la licencia Apache 2.0 y al formato PyTorch.
- Investigación en detección de objetos pequeños: uso como baseline comparable dentro de DetectionBench frente a familias YOLO.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de VisDrone-DET (no verificados, `verified: false`), evaluados con el pipeline `detectionbench-evaluate`:

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 39,62 |
| mAP@50-95 | 21,99 |
| Precision | 70,62 |
| Recall | 46,76 |
| F1 | 56,27 |
| Parámetros | 33,7 M |
| FLOPs | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 33,5 M de parámetros, el checkpoint en FP32 ocupa aproximadamente 134 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090 para inferencia local; A100 o H100 solo necesarias para entrenamiento o fine-tuning a gran escala.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU para inferencia por lotes no crítica.
- Opciones de despliegue: librería `rfdetr` (PyTorch) como vía oficial documentada; no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparativa dentro del zoo de DetectionBench sobre VisDrone-DET (datos del autor):

| Modelo | Parámetros | mAP@50 | mAP@50-95 | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|
| **RF-DETR Medium (este)** | 33,5 M | 39,62 | 21,99 | 70,62 | 46,76 | Apache 2.0 |
| YOLO26m | no disponible | 49,11 | 29,24 | 60,21 | 49,76 | no disponible |
| YOLO11m | no disponible | 48,03 | 28,56 | 59,34 | 48,30 | no disponible |
| YOLOv8m | no disponible | 45,47 | 26,94 | 57,86 | 46,39 | no disponible |
| RF-DETR Small | no disponible | 39,13 | 21,68 | 64,38 | 49,47 | Apache 2.0 |
| RF-DETR Nano | no disponible | 37,92 | 20,88 | 69,02 | 46,21 | Apache 2.0 |

El modelo destaca en precision frente a los YOLO de tamaño medio, pero queda por debajo en mAP@50 y mAP@50-95, lo que indica que localiza con menos falsos positivos pero detecta menos objetos reales (recall inferior).

## Limitaciones y advertencias

- Rendimiento inferior en mAP a los YOLO de tamaño medio (YOLO26m, YOLO11m, YOLOv8m) sobre el mismo dataset; no es la mejor opción si prima la cobertura de detección.
- Recall del 46,76 %, lo que implica que se pierden más de la mitad de los objetos reales en el test de VisDrone-DET.
- Especializado en imágenes aéreas de VisDrone-DET; el rendimiento en otros dominios (cámaras fijas, interiores, otras resoluciones) no está documentado y requerirá fine-tuning.
- Métricas no verificadas (`verified: false`); proceden del autor y no de una evaluación independiente.
- No se documentan sesgos demográficos ni geográficos, pero el dataset VisDrone está sesgado hacia escenas urbanas de determinadas regiones.
- Riesgo de falsos positivos y negativos en escenas con oclusión, objetos muy pequeños o condiciones de iluminación adversas, típicas en imágenes de dron.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del dataset VisDrone subyacente y del modelo base Roboflow.
- No apto para tareas de texto, razonamiento o generación: cualquier expectativa de modelo de lenguaje es inaplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/visdrone-rfdetr-medium
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Roboflow/rf-detr-medium
- Dataset VisDrone2019-DET en Hugging Face: https://huggingface.co/datasets/Voxel51/VisDrone2019-DET
- Paper VisDrone (arXiv:1804.07437): https://arxiv.org/abs/1804.07437
- Paper DETR (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
- Paper referenciado arXiv:2511.09554: https://arxiv.org/abs/2511.09554
