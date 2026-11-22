# dronefreak/uavdt-yolov9e

## Resumen

`dronefreak/uavdt-yolov9e` es un detector de objetos YOLOv9e afinado sobre el conjunto de datos UAVDT (UAV Detection and Tracking), un benchmark de visión aérea centrado en la detección de vehículos desde drones en entornos de tráfico urbano. Lo desarrolla el usuario `dronefreak` como parte de DetectionBench, un marco de trabajo para comparar de forma reproducible detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas. El modelo base es Ultralytics/YOLOv9 y la implementación se distribuye a través de la librería Ultralytics.

El checkpoint tiene 58,2 millones de parámetros y consume 193,0 GFLOPs a una resolución de 640 píxeles, lo que lo sitúa en la gama alta de la familia YOLOv9 (variante "e", la más grande de la línea). Está pensado para escenarios de detección de objetos pequeños en imágenes aéreas, como vigilancia de tráfico, monitorización de flotas de vehículos o análisis de vídeo capturado por UAV.

Su relevancia actual radica en que forma parte de un zoo de modelos comparables bajo una misma metodología de evaluación, lo que permite a desarrolladores e investigadores situar el rendimiento de YOLOv9e frente a alternativas como YOLO26, YOLO11, YOLOv8, YOLOv10 o RF-DETR sobre el mismo dataset y con las mismas métricas. Los resultados publicados son modestos (mAP@50 del 28,1 %), lo que refleja la dificultad del dominio aéreo con objetos pequeños y alta densidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv9e (detector de objetos de una etapa, familia YOLO) |
| Parámetros totales | 58.248.601 (58,2 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no aplica |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (repo), `best.pt` para Ultralytics |
| FLOPs | 193,0 B a 640 px |
| Tarea | object-detection |
| Framework | Ultralytics YOLO |
| Modelo base | Ultralytics/YOLOv9 |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

YOLOv9e es un detector de objetos de una etapa basado en una arquitectura de red neuronal convolucional con mecanismos de agregación de características multi-escala, dentro de la familia YOLOv9 de Ultralytics. La variante "e" es la de mayor tamaño de la línea y, según los datos del modelo, cuenta con 58,2 M de parámetros y 193,0 GFLOPs a 640 px. El modelo se distribuye como pesos safetensors y como checkpoint `best.pt` compatible con la librería Ultralytics.

El entrenamiento consiste en un ajuste fino (fine-tuning) del modelo base Ultralytics/YOLOv9 sobre el dataset UAVDT, un benchmark de detección y seguimiento de vehículos en vídeo aéreo. La evaluación se realizó con la pipeline estándar de DetectionBench (`detectionbench-evaluate`) sobre el split de test de UAVDT. No se dispone en la información proporcionada de detalles sobre el número de tokens, composición exacta del dataset, técnicas de aumento de datos, hiperparámetros de entrenamiento ni si se aplicaron técnicas de destilación o poda.

## Capacidades

- Detección de objetos en imágenes aéreas capturadas por drones (UAV), orientada a vehículos y tráfico urbano.
- Detección de objetos pequeños, adecuada para escenas con alta densidad de instancias y resolución limitada por píxel.
- Inferencia sobre imágenes individuales y vídeo mediante la API de Ultralytics (`model.predict`).
- Integración con el ecosistema Ultralytics (entrenamiento, validación, exportación a otros formatos).
- Soporte de umbral de confianza configurable (`conf`) para ajustar precisión y recall en producción.
- Capacidades multilingües: no aplica (modelo de visión).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo "thinking": no disponible.

## Casos de uso

- Vigilancia de tráfico urbano con drones: el modelo puede procesar fotogramas de vídeo aéreo para detectar y localizar vehículos en calzadas y cruces, aprovechando su entrenamiento específico sobre UAVDT para escenas de tráfico denso.
- Monitorización de flotas y estacionamientos: permite contabilizar vehículos en imágenes aéreas de aparcamientos o recintos, con un umbral de confianza ajustable para equilibrar falsos positivos y omisiones.
- Análisis posterior de grabaciones de UAV: al integrarse con la API de Ultralytics, puede procesar lotes de vídeo para extraer trayectorias y estadísticas de ocupación vial.
- Sistemas de alerta temprana en infraestructuras: detección de vehículos detenidos o aglomeraciones en carreteras a partir de imágenes de drones de vigilancia.
- Investigación en detección de objetos pequeños: sirve como referencia reproducible dentro de DetectionBench para comparar arquitecturas YOLO y RF-DETR bajo la misma receta y métricas.
- Prototipado rápido en visión aérea: al cargarse con `hf_hub_download` y `YOLO(weights)`, permite validar pipelines de detección en dominios UAV sin reentrenar desde cero.
- Evaluación comparativa de detectores: útil para equipos que necesiten contrastar el rendimiento de YOLOv9e frente a otras variantes del zoo de UAVDT con métricas homogéneas (mAP@50, mAP@50-95, precision, recall).

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de UAVDT (no verificados):

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 28,1 |
| mAP@50-95 | 16,6 |
| Precision | 35,51 |
| Recall | 32,54 |
| F1 Score | 33,96 |
| Parámetros | 58,2 M |
| FLOPs | 193,0 B (a 640 px) |

Comparativa dentro del zoo de UAVDT de DetectionBench (mismos datos del autor):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26m | 33,43 | 19,56 | 38,14 | 39,84 |
| RF-DETR Medium | 33,28 | 20,54 | 73,03 | 70,03 |
| YOLO26s | 32,98 | 19,61 | 43,86 | 40,38 |
| RF-DETR Nano | 32,78 | 20,31 | 73,6 | 66,98 |
| YOLO26x | 32,65 | 19,22 | 41,85 | 38,19 |
| YOLO26l | 32,64 | 18,75 | 40,17 | 36,45 |
| RF-DETR Small | 32,62 | 20,21 | 73,83 | 71,63 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv8m | 31,42 | 18,8 | 40,27 | 37,79 |
| YOLO11x | 31,05 | 18,31 | 37,4 | 36,38 |
| YOLO11m | 30,47 | 17,71 | 37,7 | 37,01 |
| YOLOv8x | 30,47 | 17,66 | 39,61 | 36,16 |
| YOLOv10m | 30,12 | 17,33 | 40,13 | 35,68 |
| YOLOv9m | 29,43 | 16,97 | 35,92 | 35,7 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| YOLOv10x | 29,38 | 17,15 | 37,29 | 35,15 |
| YOLOv10l | 29,16 | 16,54 | 36,9 | 35,6 |
| YOLOv9c | 29,16 | 16,46 | 35,38 | 34,35 |
| YOLO11s | 29,1 | 17,16 | 34,32 | 37,31 |
| YOLO26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv8l | 28,86 | 17,27 | 38,33 | 32,86 |
| YOLOv10s | 28,85 | 16,48 | 36,53 | 33,16 |
| YOLO11l | 28,64 | 17,16 | 34,75 | 34,02 |
| YOLO11n | 28,56 | 16,3 | 38,04 | 32,26 |
| **YOLOv9e** | **28,1** | **16,6** | **35,51** | **32,54** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 58,2 M de parámetros y pesos en FP32 (aproximadamente 233 MB), la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponible de forma explícita; por tamaño, es viable en RTX 3060/4060 y superiores, así como en A100/H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0,2 GB de repo y 58,2 M de parámetros).
- Opciones de despliegue: Ultralytics (PyTorch), exportación a formatos soportados por Ultralytics (no detallados en la información), `hf_hub_download` para obtener `best.pt`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLOv9e (este) | 58,2 M | no aplica | 28,1 | 16,6 | AGPL-3.0 | Hugging Face |
| YOLO26m | no disponible | no aplica | 33,43 | 19,56 | no disponible | DetectionBench |
| RF-DETR Medium | no disponible | no aplica | 33,28 | 20,54 | no disponible | DetectionBench |
| YOLOv9s | no disponible | no aplica | 31,82 | 18,71 | no disponible | DetectionBench |
| YOLOv8m | no disponible | no aplica | 31,42 | 18,8 | no disponible | DetectionBench |

## Limitaciones y advertencias

- Rendimiento modesto en UAVDT: mAP@50 del 28,1 % y mAP@50-95 del 16,6 %, por debajo de la mayoría de variantes del zoo (YOLO26, RF-DETR, YOLOv9s, YOLOv8m, YOLO11x, entre otras).
- Precisión y recall bajos (35,51 % y 32,54 %), lo que implica un número elevado de falsos positivos y omisiones en escenas reales.
- Métricas no verificadas (`verified: false` en la model-index): los resultados proceden del autor y no han sido validados de forma independiente.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y puede restringir el uso comercial propietario; revisar compatibilidad antes de integrar en productos cerrados.
- Entrenado específicamente sobre UAVDT: probable degradación fuera del dominio aéreo de tráfico urbano (otras altitudes, sensores, condiciones meteorológicas o tipos de objeto).
- Sin información sobre sesgos del dataset ni sobre la composición demográfica o geográfica de UAVDT en la documentación proporcionada.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de detecciones espurias en escenas con oclusiones, objetos pequeños o baja resolución.
- No se documentan limitaciones de contexto ni idioma por tratarse de un modelo de visión.
- No se especifican requisitos de hardware, latencia ni throughput, lo que dificulta planificar despliegues en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-yolov9e
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset UAVDT en Hugging Face: https://huggingface.co/datasets/dronefreak/UAVDT
- Paper UAVDT (arXiv:1804.00518): https://arxiv.org/abs/1804.00518
- Paper YOLOv9 (arXiv:2402.13616): https://arxiv.org/abs/2402.13616
- Ultralytics: https://github.com/ultralytics/ultralytics
- Demo en vídeo: https://huggingface.co/dronefreak/uavdt-yolov9e/resolve/main/assets/demo_banner.mp4
