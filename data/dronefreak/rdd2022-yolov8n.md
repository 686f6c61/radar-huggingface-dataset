# dronefreak/rdd2022-yolov8n

## Resumen

rdd2022-yolov8n es un detector de objetos YOLOv8n (variante nano de Ultralytics) afinado por el usuario dronefreak sobre el conjunto de datos RDD2022 de daños en la carretera. El modelo resuelve una tarea de visión por computador muy concreta: localizar y clasificar cuatro tipos de deterioro del firme (grietas longitudinales, grietas transversales, grietas de piel de cocodrilo y baches) en imágenes de calzada. Es relevante porque forma parte de DetectionBench, un marco de trabajo que entrena y evalúa distintos detectores con la misma receta y las mismas métricas, lo que permite comparaciones reproducibles entre arquitecturas.

La arquitectura es una CNN de detección de una sola etapa de la familia YOLOv8, con solo 3.022.028 parámetros (3,2 M) y 8,7 GFLOPs a 640 píxeles, lo que lo sitúa en el extremo más ligero de la familia. Se distribuye bajo licencia AGPL-3.0 y los pesos están en formato PyTorch (best.pt), cargables directamente con la librería ultralytics.

El interés práctico del modelo está en su relación entre coste computacional y precisión: con un tercio de los parámetros de YOLOv8s, alcanza un mAP@50 de 58,8 % en el split de test de RDD2022, suficiente para tareas de triaje o despliegue en dispositivos con recursos limitados. No es un modelo multimodal ni de lenguaje: es exclusivamente un detector visual de cuatro clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (CNN de detección de una etapa, familia Ultralytics YOLOv8) |
| Parametros totales | 3.022.028 (3,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640 px) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un modelo ultralytics es compatible con exportación a ONNX, TensorRT y otras, pero no se confirma en la información) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (best.pt) y safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un YOLOv8n, la variante nano de la arquitectura YOLOv8 de Ultralytics: un detector de una etapa con backbone convolucional, cuello de agregación de características y cabecera de predicción anclada libre (anchor-free). Con 3,2 M de parámetros y 8,7 GFLOPs a 640 px, está diseñado para inferencia de baja latencia. La entrada de entrenamiento y evaluación es de 640 × 640 píxeles.

El ajuste fino se realizó con la herramienta DetectionBench sobre el conjunto RDD2022, con una configuración documentada por el autor: 50 épocas configuradas y 50 efectivamente entrenadas, paciencia de parada temprana de 10, tamaño de lote 32, tamaño de imagen 640, optimizador Adam, tasa de aprendizaje inicial 0,001 y semilla 0. No se especifica en la información disponible el número de tokens ni la composición exacta del dataset más allá de las cuatro clases (longitudinal_crack, transverse_crack, alligator_crack y pothole), ni si hubo técnicas de aumento de datos adicionales. Tampoco se documenta RLHF/DPO, lo cual es esperable al no ser un modelo generativo de lenguaje.

## Capacidades

- Detección de objetos en imágenes de calzada con cuatro clases: grieta longitudinal, grieta transversal, grieta de piel de cocodrilo y bache.
- Localización con cajas delimitadoras y puntuaciones de confianza por detección.
- Inferencia sobre imágenes individuales o lotes mediante `model.predict(source=..., conf=0.25)`.
- Integración directa con la librería ultralytics y con el ecosistema Hugging Face mediante `hf_hub_download`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la detección visual.

## Casos de uso

- Inspección automatizada de firmes con vehículos equipados con cámara: el modelo procesa fotogramas a 640 px y detecta baches y grietas en tiempo real, adecuado por su bajo coste (8,7 GFLOPs) para ejecutarse a bordo de un vehículo o en un dispositivo embebido.
- Triaje de mantenimiento vial: a partir de imágenes capturadas por drones o vehículos de servicio, el modelo clasifica el tipo de deterioro y permite priorizar reparaciones según la clase detectada (por ejemplo, baches frente a grietas longitudinales).
- Despliegue en dispositivos de borde: con 3,2 M de parámetros, cabe en GPUs de consumo e incluso en aceleradores de baja potencia, lo que facilita inspecciones en campo sin conexión a la nube.
- Generación de inventarios geoespaciales de daños: combinando las detecciones con metadatos GPS, se pueden construir mapas de estado del firme para planificación municipal.
- Preetiquetado de datos para anotación humana: el modelo puede usarse como primer paso en pipelines de anotación semiautomática, reduciendo el coste de etiquetar grandes volúmenes de imágenes de carretera.
- Monitorización continua en flotas: integrado en cámaras de salpicadero o sistemas de registro de flotas, permite alertar de tramos con deterioro recurrente y alimentar sistemas de mantenimiento predictivo.
- Evaluación comparativa de detectores: al formar parte de DetectionBench, sirve como referencia ligera para comparar arquitecturas bajo la misma receta de entrenamiento y métricas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de RDD2022 (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 58,8 |
| mAP@50-95 | 32,05 |
| Precision | 62,03 |
| Recall | 56,08 |
| F1 Score | 58,91 |
| Parametros | 3,2 M |
| FLOPs | 8,7 B (a 640 px) |

Rendimiento por clase en el mismo split:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| longitudinal_crack | 52,74 | 28,56 |
| transverse_crack | 50,57 | 24,24 |
| alligator_crack | 61,13 | 31,92 |
| pothole | 70,76 | 43,48 |

Comparativa dentro del zoo de modelos de DetectionBench sobre RDD2022:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 |
| YOLO26s | 61,27 | 33,3 | 64,42 | 57,13 |
| YOLO26m | 61,24 | 33,38 | 63,7 | 57,27 |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,3 |
| YOLOv8n (este modelo) | 58,8 | 32,05 | 62,03 | 56,08 |
| YOLO11x | 51,05 | 26,54 | 56,64 | 49,54 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 3,2 M de parámetros el peso de los pesos en FP32 ronda los 12 MB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de VRAM. La memoria real depende del tamaño de lote y de la resolución de entrada.
- GPU recomendadas: cualquier GPU moderna sirve; para máximo throughput, A100, H100 o L4; para despliegue en borde, Jetson Orin, Jetson Nano o GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: ultralytics (PyTorch), exportación a ONNX y TensorRT (compatible con el ecosistema ultralytics, aunque no se documenta explícitamente en la información disponible), y despliegue vía Hugging Face con `hf_hub_download`. No se confirma soporte documentado de vLLM, llama.cpp, Ollama o TGI, que no están orientados a detectores de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo (8,7 GFLOPs a 640 px) se espera una latencia de milisegundos en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50 (RDD2022) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8n (este modelo) | 3,2 M | imagen 640 px | 58,8 | AGPL-3.0 | Hugging Face |
| YOLOv8s | no disponible en la información | imagen 640 px | 61,45 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLOv8m | no disponible en la información | imagen 640 px | 62,03 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| RF-DETR Nano | no disponible en la información | imagen 640 px | 60,85 | no disponible | DetectionBench |
| RF-DETR Small | no disponible en la información | imagen 640 px | 64,71 | no disponible | DetectionBench |

La comparación dentro de DetectionBench muestra que YOLOv8n es el modelo con menor mAP@50 de la tabla, pero también el más ligero en la familia YOLOv8 comparada (YOLOv8s y YOLOv8m superan en precisión a costa de más parámetros y cómputo). RF-DETR Small y Medium lideran en precisión, mientras que YOLO11x obtiene resultados peores en este conjunto, lo que sugiere que el ajuste fino y la receta de entrenamiento influyen tanto como la arquitectura.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena solo con imágenes de RDD2022, por lo que su rendimiento puede degradarse en condiciones de iluminación, clima, tipo de asfalto o países no representados en el conjunto de datos.
- Riesgo de falsos positivos y negativos: la precisión (62,03 %) y el recall (56,08 %) son moderados; en producción conviene calibrar el umbral de confianza y validar con datos propios.
- Limitaciones de idioma: no aplica, es un modelo de visión; no procesa texto.
- Limitaciones de contexto: no aplica; la entrada es una imagen de 640 px y no hay ventana de contexto textual.
- Restricciones de licencia: AGPL-3.0 implica obligaciones de copyleft para obras derivadas y para el uso en servicios en red; para uso comercial propietario conviene revisar las condiciones con asesoramiento legal o considerar una licencia comercial de Ultralytics.
- Caveat de producción: los resultados de benchmarks están declarados por el autor y marcados como no verificados; no se han validado de forma independiente. Además, el repositorio tiene un tamaño de 0,0 GB y pocas descargas (260), lo que sugiere poca adopción y escasa validación comunitaria.
- No se documentan cuantizaciones ni exportaciones probadas, por lo que el despliegue en formatos distintos de PyTorch requiere validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/rdd2022-yolov8n
- Dataset RDD2022: https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Paper de referencia (arXiv:2209.08538): https://arxiv.org/abs/2209.08538
- Modelo base YOLOv8 de Ultralytics: https://huggingface.co/Ultralytics/YOLOv8
