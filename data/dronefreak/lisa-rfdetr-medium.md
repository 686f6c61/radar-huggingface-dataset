# dronefreak/lisa-rfdetr-medium

## Resumen

Lisa-rfdetr-medium es un detector de objetos especializado en semáforos de tráfico, desarrollado por el usuario dronefreak como parte del proyecto DetectionBench. Se trata de un fine-tuning del modelo base Roboflow/rf-detr-medium sobre el conjunto de datos LISA Traffic Lights, orientado a tareas de conducción autónoma y sistemas avanzados de asistencia al conductor (ADAS). El modelo resuelve la detección y clasificación de siete tipos distintos de señal luminosa (go, goForward, goLeft, stop, stopLeft, warning, warningLeft) en imágenes de escenas de tráfico reales.

Arquitectónicamente es un transformer de detección de objetos de la familia DETR (Detection Transformer) con 33,4 millones de parámetros totales, empaquetado en formato safetensors y con un tamaño de repositorio de 0,3 GB. Su relevancia actual radica en que forma parte de un esfuerzo de benchmarking reproducible que compara recetas de entrenamiento idénticas entre detectores modernos (RF-DETR, YOLO26, YOLO11, YOLOv8) sobre el mismo dataset, lo que permite evaluar de forma justa el rendimiento relativo de cada arquitectura en un dominio crítico para la seguridad vial.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y se integra en el ecosistema de la librería rfdetr con un flujo de inferencia sencillo mediante `model.predict()`. Con solo 9 descargas y 0 likes en el momento de la ficha, es un modelo de nicho orientado a investigadores y desarrolladores que necesitan un punto de partida reproducible para detección de semáforos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección de objetos (familia DETR, variante RF-DETR Medium) |
| Parametros totales | 33.388.824 (33,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y checkpoint `.pth` (`checkpoint_best_total.pth`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Roboflow/rf-detr-medium, un detector de objetos basado en la arquitectura DETR (Detection Transformer). DETR sustituye los componentes clásicos de detección (anclas, NMS) por un mecanismo de atención sobre un conjunto de consultas de objeto, lo que simplifica el pipeline y elimina la necesidad de post-procesado heurístico. El modelo base RF-DETR Medium cuenta con 33,7 M de parámetros, un tamaño contenido que lo sitúa en la gama media de detectores.

El entrenamiento se realizó sobre el dataset LISA Traffic Lights, un benchmark de semáforos de tráfico con siete clases. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o ajuste fino con RLHF/DPO (no aplicable en detección de objetos). El proyecto DetectionBench, del que forma parte este modelo, se caracteriza por emplear recetas de entrenamiento idénticas y métricas de evaluación uniformes entre detectores, lo que constituye su principal innovación metodológica: permitir comparaciones reproducibles y justas entre arquitecturas. La evaluación se realizó con las métricas de detección de la librería Supervision (Roboflow), que reporta mAP, precisión y recall directamente.

## Capacidades

- Detección de objetos en imágenes de escenas de tráfico, con localización mediante cajas delimitadoras y clasificación en siete clases de semáforos: go, goForward, goLeft, stop, stopLeft, warning y warningLeft.
- Clasificación de estado y dirección de la señal luminosa (verde, rojo, advertencia, y variantes de giro).
- Inferencia sobre imágenes individuales mediante `model.predict("image.jpg", threshold=0.25)`.
- Integración con el ecosistema rfdetr y huggingface_hub para carga de pesos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente perceptivo).
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No incluye modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la detección visual.

## Casos de uso

- Sistemas ADAS de asistencia a la conducción: el modelo puede integrarse en el pipeline de percepción de un vehículo para detectar y clasificar semáforos en tiempo real, alertando al conductor o al sistema de control sobre el estado de la señal (verde, rojo, advertencia) con 33,7 M de parámetros, un tamaño manejable para hardware embebido.
- Conducción autónoma nivel 3-4: como componente de percepción para la toma de decisiones en intersecciones, distinguiendo entre señales de giro a izquierda (goLeft, stopLeft) y de avance recto (goForward), lo que permite planificar maniobras.
- Validación y auditoría de datasets de tráfico: el modelo sirve como referencia reproducible para comparar el rendimiento de otros detectores sobre LISA Traffic Lights, gracias a la receta estandarizada de DetectionBench.
- Investigación en benchmarking de detectores: útil para investigadores que necesitan un baseline RF-DETR Medium ya entrenado sobre LISA, evitando reentrenar desde cero y permitiendo comparaciones directas con YOLO26, YOLO11 y YOLOv8.
- Prototipado rápido de sistemas de monitorización de tráfico urbano: el modelo puede desplegarse para analizar imágenes de cámaras de tráfico y contabilizar estados de semáforos en estudios de movilidad.
- Educación y demostraciones de visión por computador: su licencia Apache 2.0 y su reducido tamaño (0,3 GB) lo hacen adecuado para entornos docentes y tutoriales de detección de objetos con DETR.
- Integración en pipelines de anotación asistida: el modelo puede pre-anotar imágenes de semáforos para acelerar el etiquetado humano en nuevos datasets, con una precisión del 69,37 % y un recall del 58,28 % como referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de LISA Traffic Lights, evaluados con el pipeline `detectionbench-evaluate` (métricas de Supervision). Los valores no están verificados de forma independiente (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 33,01 |
| mAP@50-95 | 14,12 |
| Precision | 69,37 |
| Recall | 58,28 |
| F1 Score | 63,34 |

Comparativa del zoo de modelos de DetectionBench sobre LISA Traffic Lights (mismos datos declarados por el autor):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| **RF-DETR Medium (este modelo)** | **33,01** | **14,12** | **69,37** | **58,28** |
| RF-DETR Small | 32,7 | 15,11 | 69,7 | 53,9 |
| YOLO26m | 29,08 | 13,68 | 43,79 | 29,71 |
| YOLO26x | 28,92 | 14,09 | 43,59 | 26,96 |
| RF-DETR Nano | 27,47 | 12,16 | 74,96 | 52,57 |
| YOLO26l | 27,28 | 13,54 | 41,42 | 27,99 |
| YOLO26s | 26,91 | 12,82 | 42,47 | 26,43 |
| YOLO11x | 26,4 | 13,09 | 53,98 | 24,38 |
| YOLOv8m | 25,07 | 11,91 | 38,16 | 25,15 |
| YOLO26n | 23,74 | 10,57 | 37,23 | 25,7 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| go | 65,38 | 32,49 |
| goForward | 0,0 | 0,0 |
| goLeft | 16,93 | 5,68 |
| stop | 63,34 | 23,78 |
| stopLeft | 15,85 | 6,68 |
| warning | 53,7 | 25,46 |
| warningLeft | 15,88 | 4,73 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 33,7 M de parámetros, la inferencia en FP32 requiere aproximadamente 0,13 GB solo para pesos, más memoria para activaciones y buffers; en la práctica, cabe holgadamente en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). Para entrenamiento o fine-tuning se recomienda al menos 8-12 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: la librería oficial es `rfdetr` (PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos). Es posible exportar a ONNX o TensorRT mediante el ecosistema rfdetr, aunque no se detalla en la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (LISA) | Licencia | Disponibilidad |
|---|---|---|---|---|
| RF-DETR Medium (este) | 33,7 M | 33,01 | Apache 2.0 | Hugging Face (dronefreak/lisa-rfdetr-medium) |
| RF-DETR Small | No disponible | 32,7 | Apache 2.0 (modelo base) | Hugging Face (modelo base Roboflow/rf-detr-small) |
| YOLO26m | No disponible | 29,08 | No disponible en la información | No disponible en la información |
| YOLO11x | No disponible | 26,4 | No disponible en la información | No disponible en la información |
| YOLOv8m | No disponible | 25,07 | No disponible en la información | No disponible en la información |

Nota: los datos de parámetros y licencia de los modelos comparables no se detallan en la información proporcionada; los valores de mAP proceden del zoo de modelos de DetectionBench publicado por el autor. RF-DETR Medium obtiene el mejor mAP@50 del conjunto, aunque RF-DETR Small le supera ligeramente en mAP@50-95 (15,11 frente a 14,12).

## Limitaciones y advertencias

- Rendimiento muy desigual por clase: la clase goForward obtiene un mAP@50 de 0,0 y las clases de giro (goLeft, stopLeft, warningLeft) rondan el 15-17 % de mAP@50, lo que indica que el modelo no detecta de forma fiable señales de giro o direccionales. No es apto para producción en escenarios que dependan de estas clases.
- Recall moderado (58,28 %): aproximadamente 4 de cada 10 semáforos presentes en la imagen no se detectan, lo que supone un riesgo de seguridad en aplicaciones ADAS.
- Métricas no verificadas de forma independiente (`verified: false`): los resultados proceden del propio autor y no han sido replicados por terceros.
- Sesgos conocidos: el modelo se entrenó exclusivamente sobre LISA Traffic Lights, un dataset con condiciones de iluminación, geografía y cámaras específicas; probablemente generaliza mal a otros países, condiciones meteorológicas adversas o distintos tipos de semáforos.
- Riesgo de alucinación: como todo detector, puede generar falsos positivos (precisión del 69,37 %), especialmente en escenas con objetos similares a semáforos (señales de tráfico, luces de vehículos).
- Limitaciones de idioma: no aplica (modelo de visión sin capacidades lingüísticas).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios. No se especifican restricciones adicionales en la información disponible.
- Caveat para producción: el modelo es un fine-tuning de investigación con solo 9 descargas y sin validación externa; se recomienda una evaluación exhaustiva en el dominio objetivo antes de cualquier despliegue crítico.
- No se documentan FLOPs ni requisitos de latencia, lo que dificulta estimar su viabilidad en sistemas de tiempo real embebidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/lisa-rfdetr-medium
- Dataset LISA Traffic Lights: https://huggingface.co/datasets/dronefreak/LISA-Traffic-Lights
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base RF-DETR Medium: https://huggingface.co/Roboflow/rf-detr-medium
- Librería Supervision (métricas de evaluación): https://github.com/roboflow/supervision
- Paper DETR (referencia arquitectónica, arXiv:2304.07193): https://arxiv.org/abs/2304.07193
- Paper citado en los tags (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
