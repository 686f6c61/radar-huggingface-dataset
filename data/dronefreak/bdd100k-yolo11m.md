# dronefreak/bdd100k-yolo11m

## Resumen

YOLO11m finetuneado sobre BDD100K es un detector de objetos de la familia YOLO11 de Ultralytics, ajustado por el usuario dronefreak sobre el conjunto de datos BDD100K (Berkeley DeepDrive), un benchmark de conducción autónoma con escenas de tráfico real. El modelo forma parte de DetectionBench, un marco de trabajo que busca reproducir de forma estandarizada el entrenamiento y la evaluación de detectores modernos sobre múltiples datasets del mundo real, con recetas idénticas y métricas comparables.

Se trata de un checkpoint de tamaño medio (20,1 millones de parámetros, 68,5 GFLOPs a 640 px) que hereda la arquitectura de YOLO11m de Ultralytics: un backbone y una cabeza de detección convolucionales con asignación dinámica de etiquetas y post-procesado tipo NMS. El modelo está pensado para detectar las clases propias de BDD100K (persona, ciclista, coche, camión, autobús, tren, moto, bicicleta y semáforo) en imágenes de tráfico urbano y de carretera.

Su relevancia actual radica en que ofrece un punto de comparación reproducible frente a otros detectores (YOLOv8, YOLOv10, YOLO26, RF-DETR) bajo una misma receta y un mismo pipeline de evaluación, lo que permite a desarrolladores e investigadores decidir con datos homogéneos qué detector conviene para tareas de percepción en conducción autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (CNN, detector de una etapa, familia Ultralytics YOLO) |
| Parametros totales | 20.106.670 (20,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos `best.pt` en PyTorch; no se documentan variantes GGUF/ONNX/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), compatible con Ultralytics; safetensors declarado en los tags del repo |

## Arquitectura y entrenamiento

La arquitectura es la de YOLO11m de Ultralytics, un detector convolucional de una sola etapa con backbone y neck basados en bloques C3k2 y C2PSA (atención espacial parcial), y una cabeza de detección con asignación dinámica de tareas. El modelo parte de los pesos preentrenados de `Ultralytics/YOLO11` y se ajusta (finetune) sobre BDD100K, manteniendo la resolución de entrada estándar de 640 px y un coste computacional de 68,5 GFLOPs por imagen.

El entrenamiento se enmarca en DetectionBench, que aplica una receta común (misma resolución, mismo número de épocas, mismas aumentaciones y mismo pipeline de evaluación `detectionbench-evaluate`) a todos los detectores comparados. No se detalla en la información disponible el número exacto de tokens, épocas, composición del dataset ni si se aplicó RLHF/DPO (no aplicable en detección de objetos). Tampoco se documentan innovaciones adicionales más allá de las propias de YOLO11 (atención espacial parcial en el backbone y asignación dinámica de etiquetas).

## Capacidades

- Detección de objetos en imágenes de tráfico: persona, rider, coche, camión, autobús, tren, moto, bicicleta y semáforo.
- Localización con cajas delimitadoras y puntuaciones de confianza por clase.
- Inferencia sobre imágenes individuales, vídeo y streams (a través de la API de Ultralytics `model.predict`).
- Exportación a formatos de despliegue habituales de Ultralytics (ONNX, TensorRT, OpenVINO, CoreML, etc.), aunque no se documentan en el repo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- Capacidades multilingües: no aplica.
- No dispone de modo thinking, visión-lenguaje, audio ni otras capacidades multimodales más allá de la visión por detección.

## Casos de uso

- Percepción en conducción autónoma nivel 2-3: detección en tiempo real de vehículos, peatones y semáforos en imágenes de cámara frontal, adecuada por su bajo coste (68,5 GFLOPs) y su mAP@50 de 61,1 % en BDD100K.
- Sistemas de asistencia a la conducción (ADAS): alerta de colisión y detección de peatones y ciclistas en entornos urbanos, aprovechando el buen rendimiento en las clases `car` (mAP@50 84,39) y `person` (73,08).
- Análisis de tráfico y aforo: conteo de vehículos y clasificación por tipo (coche, camión, autobús, moto) en vídeos de cámaras de tráfico, con inferencia por lotes.
- Detección de semáforos para planificación de rutas: la clase `traffic light` alcanza mAP@50 72,23, útil para módulos de decisión en intersecciones.
- Benchmarking reproducible de detectores: servir como referencia YOLO11m dentro de DetectionBench para comparar recetas y arquitecturas bajo condiciones idénticas.
- Prototipado rápido en robótica móvil o drones: el tamaño reducido (20,1 M de parámetros) permite desplegarlo en GPUs de consumo y en dispositivos embebidos con exportación a ONNX/TensorRT.
- Etiquetado asistido (auto-labeling): pre-anotación de imágenes de tráfico para reducir el coste de anotación manual en pipelines de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de BDD100K (no verificados):

| Metrica | Valor |
|---|---|
| mAP@50 | 61,1 % |
| mAP@50-95 | 35,57 % |
| Precision | 66,78 % |
| Recall | 55,61 % |
| F1 | 60,68 % |
| Parametros | 20,1 M |
| FLOPs | 68,5 B (a 640 px) |

Comparativa dentro del model zoo de BDD100K de DetectionBench (mismos datos del autor):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26m | 61,55 | 35,88 | 77,04 | 56,05 |
| YOLOv10m | 61,13 | 35,63 | 76,78 | 55,65 |
| YOLO11m (este) | 61,10 | 35,57 | 66,78 | 55,61 |
| YOLOv8m | 60,89 | 35,47 | 66,52 | 55,42 |
| YOLO26s | 58,76 | 33,86 | 75,49 | 53,07 |
| YOLOv8s | 57,93 | 33,25 | 75,38 | 51,63 |
| YOLOv10s | 57,64 | 33,34 | 75,02 | 52,12 |
| YOLO11s | 57,63 | 33,10 | 74,31 | 52,42 |
| RF-DETR Nano | 56,90 | 31,58 | 80,68 | 64,78 |
| YOLO26n | 52,25 | 29,23 | 72,56 | 46,87 |
| YOLOv9t | 52,04 | 29,46 | 71,34 | 46,72 |
| YOLOv10n | 51,95 | 29,31 | 71,58 | 46,62 |
| YOLOv8n | 51,67 | 29,09 | 70,95 | 46,59 |
| YOLO11n | 51,63 | 29,06 | 71,68 | 46,34 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 73,08 | 39,00 |
| rider | 54,52 | 28,76 |
| car | 84,39 | 53,02 |
| truck | 70,07 | 51,77 |
| bus | 69,52 | 54,52 |
| train | 0,70 | 0,42 |
| motor | 53,13 | 26,66 |
| bike | 56,68 | 30,06 |
| traffic light | 72,23 | 29,30 |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el checkpoint ocupa en torno a 80 MB de pesos; con activaciones a 640 px el consumo típico ronda 1-2 GB, por lo que cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3060/4060, RTX 4090, A100, H100. Para latencia mínima en producción, TensorRT sobre T4/A10/L4.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1650 en adelante) e incluso en CPU con latencias mayores.
- Opciones de despliegue: Ultralytics (`YOLO(weights).predict`), exportación a ONNX, TensorRT, OpenVINO, CoreML y TFLite (soportadas por Ultralytics, aunque no documentadas en el repo); no se mencionan vLLM, llama.cpp ni TGI porque no aplican a un detector.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (BDD100K) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11m (este) | 20,1 M | 61,10 | no aplica | AGPL-3.0 | Hugging Face (dronefreak) |
| YOLOv10m | no disponible | 61,13 | no aplica | AGPL-3.0 (Ultralytics) | Hugging Face (DetectionBench) |
| YOLOv8m | no disponible | 60,89 | no aplica | AGPL-3.0 (Ultralytics) | Hugging Face (DetectionBench) |
| RF-DETR Nano | no disponible | 56,90 | no aplica | no disponible | Hugging Face (DetectionBench) |

## Limitaciones y advertencias

- El rendimiento en la clase `train` es prácticamente nulo (mAP@50 0,70), lo que refleja el desbalanceo extremo de esa clase en BDD100K; no debe usarse para detección fiable de trenes.
- El recall global (55,61 %) y la precisión (66,78 %) son moderados: en producción conviene ajustar el umbral de confianza y validar con datos propios.
- Los resultados son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Sesgos conocidos: BDD100K está dominado por escenas diurnas y condiciones climáticas mayoritariamente favorables; el rendimiento puede degradarse con lluvia, nieve, noche o entornos no representados.
- Riesgo de falsos positivos y de confusión entre clases visualmente próximas (p. ej. `motor` vs `bike`, `truck` vs `bus`).
- La licencia AGPL-3.0 impone obligaciones de copyleft: si se distribuye el modelo o se ofrece como servicio en red, puede requerir liberar el código derivado. Para uso comercial cerrado conviene evaluar una licencia comercial de Ultralytics.
- No se documentan cuantizaciones ni formatos de exportación probados en el repo; la latencia en producción debe medirse en el hardware objetivo.
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni razonamiento multi-step.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-yolo11m
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Paper de referencia (arxiv:2410.17725): https://arxiv.org/abs/2410.17725
- Modelo base YOLO11 de Ultralytics: https://huggingface.co/Ultralytics/YOLO11
- Documentación de Ultralytics: https://docs.ultralytics.com
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
- Demo (vídeo de detecciones): https://huggingface.co/dronefreak/bdd100k-yolo11m/resolve/main/assets/demo_banner.mp4
