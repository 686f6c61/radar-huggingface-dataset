# dronefreak/seadronessee-rfdetr-nano

## Resumen

RF-DETR Nano finetuneado sobre SeaDronesSee es un detector de objetos de 30,16 millones de parámetros desarrollado por el usuario dronefreak como parte del proyecto DetectionBench, un marco de trabajo para comparar detectores modernos con recetas de entrenamiento idénticas. El modelo parte de Roboflow/rf-detr-nano y se especializa en la detección de personas y embarcaciones en escenas marítimas captadas desde UAV (drones), un dominio crítico para operaciones de búsqueda y rescate.

La relevancia de este modelo reside en su especialización vertical: frente a detectores genéricos, ha sido ajustado sobre el conjunto SeaDronesSee para reconocer cinco clases específicas (nadador, barco, moto acuática, dispositivos de salvamento y boya) en condiciones de perspectiva aérea, movimiento y variabilidad de escala. Con 72,38 % de mAP@50 y 39,83 % de mAP@50-95 en el split de validación, se posiciona por encima de detectores ligeros como YOLO11n y YOLOv8n en el mismo benchmark.

Su tamaño reducido (repositorio de 0,2 GB, pesos en safetensors y checkpoint en PyTorch) y su licencia Apache-2.0 lo hacen apto para despliegue en entornos con recursos limitados, incluidos sistemas embarcados en el propio dron. La información disponible no incluye detalles sobre la composición exacta del dataset de entrenamiento ni sobre el proceso de optimización más allá de la configuración básica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer detector, variante Nano) |
| Parametros totales | 30.161.468 (30,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a deteccion de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y checkpoint PyTorch (`checkpoint_best_total.pth`) |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR, un detector de objetos construido sobre arquitectura transformer con mecanismo de atención (DETR-like), en su variante Nano de Roboflow. La información proporcionada no detalla la configuración interna de capas, dimensión de embeddings ni el mecanismo de asignación de consultas (queries), por lo que estos datos se consideran no disponibles. El modelo cuenta con 30,5 millones de parámetros y un tamaño de repositorio de 0,2 GB.

El entrenamiento se realizó mediante el toolkit DetectionBench con un máximo configurado de 500 épocas, de las cuales se completaron 175. El dataset empleado es SeaDronesSee, con cinco clases: swimmer, boat, jetski, life_saving_appliances y buoy. No se dispone de información sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset, el uso de RLHF/DPO (no aplica a detección) ni sobre innovaciones técnicas específicas del proceso de ajuste. La evaluación se realizó con el pipeline estándar de DetectionBench (`detectionbench-evaluate`) y las métricas de detección de Supervision.

## Capacidades

- Detección de objetos en imágenes en cinco clases marítimas: nadador, barco, moto acuática, dispositivos de salvamento y boya.
- Reconocimiento de objetivos en escenas aéreas captadas desde UAV/dron, con perspectiva cenital u oblicua.
- Localización con cajas delimitadoras y puntuaciones de confianza por detección.
- Inferencia en imágenes individuales mediante `model.predict("image.jpg", threshold=0.25)`.
- Ajuste del umbral de confianza para equilibrar precisión y recall según la aplicación.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni procesamiento multilingüe, al ser un modelo puramente visual.

## Casos de uso

- Búsqueda y rescate marítimo: el modelo detecta nadadores en el agua desde imágenes de dron, lo que permite a los equipos de rescate priorizar zonas de búsqueda. Su especialización en la clase swimmer (mAP@50 de 64,81 %) y su bajo coste computacional lo hacen adecuado para procesamiento en tiempo casi real a bordo.
- Vigilancia de embarcaciones en zonas costeras: la detección de barcos y motos acuáticas (mAP@50 de 93,44 % y 91,41 % respectivamente) permite monitorizar tráfico marítimo, detectar embarcaciones no autorizadas o controlar áreas protegidas.
- Monitorización de seguridad en playas: la identificación de boyas y dispositivos de salvamento ayuda a verificar la señalización y la disponibilidad de equipos de rescate en zonas de baño.
- Análisis automatizado de vídeo de dron para informes post-operación: el modelo puede procesar secuencias de imágenes capturadas durante patrullas y generar inventarios de objetos detectados para auditoría o revisión humana.
- Integración en pipelines de visión para sistemas de alerta temprana: con umbral de confianza ajustable, se puede configurar para maximizar el recall (74,08 % global) en escenarios donde es preferible generar falsos positivos antes que omitir una detección crítica.
- Investigación en detección de objetos en dominios aéreos: al formar parte de DetectionBench, sirve como referencia reproducible para comparar arquitecturas (RF-DETR, YOLO) bajo recetas idénticas sobre SeaDronesSee.
- Despliegue en plataformas con recursos limitados: con 30,5 M de parámetros y pesos ligeros, es viable en GPUs de consumo o sistemas embarcados para inferencia en el borde.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validación de SeaDronesSee (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 72,38 |
| mAP@50-95 | 39,83 |
| Precision | 81,37 |
| Recall | 74,08 |
| F1 Score | 77,56 |
| Parametros | 30,5 M |
| FLOPs | no disponible |

Comparativa dentro del zoo de modelos de DetectionBench sobre SeaDronesSee:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 83,47 | 47,49 | 87,01 | 83,33 |
| YOLO26m | 82,38 | 49,57 | 90,01 | 81,18 |
| RF-DETR Small | 80,97 | 45,31 | 85,68 | 80,16 |
| YOLO26s | 80,14 | 47,35 | 88,50 | 77,51 |
| YOLO11x | 74,82 | 45,56 | 87,37 | 72,46 |
| YOLOv8s | 72,94 | 43,05 | 84,52 | 71,25 |
| RF-DETR Nano (este modelo) | 72,38 | 39,83 | 81,37 | 74,08 |
| YOLO11n | 69,93 | 40,41 | 82,87 | 69,04 |
| YOLOv8n | 69,22 | 40,35 | 82,46 | 68,36 |
| YOLOv8m | 62,08 | 34,41 | 77,30 | 61,01 |

Rendimiento por clase:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| swimmer | 64,81 | 22,55 |
| boat | 93,44 | 65,44 |
| jetski | 91,41 | 57,52 |
| life_saving_appliances | 43,20 | 14,53 |
| buoy | 69,06 | 39,14 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 30,5 M de parámetros, la huella de pesos es de aproximadamente 120 MB en FP32 (60 MB en FP16), aunque el consumo real depende del tamaño de entrada y del framework.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, es compatible con GPUs de consumo (RTX 3060, RTX 4060, RTX 4090) y con aceleradores de borde, aunque no hay datos oficiales de latencia ni throughput.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros, aunque no se confirma con mediciones publicadas.
- Opciones de despliegue: la librería `rfdetr` (instalable vía `pip install rfdetr`) y `huggingface_hub` para descarga de pesos. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50 (SeaDronesSee) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Nano (este modelo) | 30,5 M | no aplica | 72,38 | Apache-2.0 | Hugging Face |
| YOLO11n | no disponible | no aplica | 69,93 | no disponible en la informacion | no disponible en la informacion |
| YOLOv8n | no disponible | no aplica | 69,22 | no disponible en la informacion | no disponible en la informacion |
| YOLOv8s | no disponible | no aplica | 72,94 | no disponible en la informacion | no disponible en la informacion |

Los datos de parámetros, licencia y disponibilidad de los modelos YOLO comparados no se detallan en la información proporcionada; solo se dispone de sus métricas sobre SeaDronesSee dentro del zoo de DetectionBench.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en cinco clases marítimas; no es un detector genérico y su rendimiento fuera de ese dominio no está caracterizado.
- El rendimiento en clases minoritarias es bajo: life_saving_appliances alcanza solo 43,20 % de mAP@50 y swimmer 64,81 %, lo que puede provocar omisiones en escenarios críticos de rescate.
- Las métricas declaradas no están verificadas de forma independiente (`verified: false` en el model-index) y provienen del propio autor.
- No se dispone de información sobre sesgos del dataset (por ejemplo, condiciones de iluminación, geografía o demografía de los nadadores) ni sobre el riesgo de alucinación en el sentido de detecciones falsas.
- No hay datos publicados sobre robustez ante condiciones adversas (oleaje, mala visibilidad, oclusión) ni sobre el rendimiento en otros splits del dataset.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del dataset SeaDronesSee para el uso de los datos subyacentes.
- El entrenamiento se detuvo a las 175 épocas de un máximo configurado de 500, por lo que el modelo podría no haber convergido completamente; no se especifica el criterio de parada.
- No se dispone de información sobre cuantización, lo que limita las estimaciones de despliegue en hardware de muy bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/seadronessee-rfdetr-nano
- Dataset SeaDronesSee: https://huggingface.co/datasets/dronefreak/SeaDronesSee
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base RF-DETR Nano: https://huggingface.co/Roboflow/rf-detr-nano
- Supervision (métricas de detección): https://github.com/roboflow/supervision
- Paper SeaDronesSee (arXiv:2105.01922): https://arxiv.org/abs/2105.01922
- Paper referenciado (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper referenciado (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
