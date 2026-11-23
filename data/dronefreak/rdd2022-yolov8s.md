# dronefreak/rdd2022-yolov8s

## Resumen

El modelo `dronefreak/rdd2022-yolov8s` es un detector de objetos YOLOv8s afinado por el autor dronefreak sobre el conjunto de datos RDD2022 de daños en la carretera. Se distribuye a través de Hugging Face con la librería Ultralytics y está pensado para la detección de cuatro clases de patologías del pavimento: grieta longitudinal, grieta transversal, grieta de piel de cocodrilo y bache. Forma parte del proyecto DetectionBench, un marco que busca reproducir recetas de entrenamiento y métricas de evaluación idénticas para comparar detectores modernos sobre varios conjuntos de datos del mundo real.

El modelo parte de los pesos preentrenados de Ultralytics YOLOv8 y se afina con 50 épocas, tamaño de imagen 640 px, batch 16, optimizador Adam y learning rate inicial de 0,001. Con 11.157.180 parámetros (11,2 M) y 28,6 GFLOPs a 640 px, es un detector compacto que puede ejecutarse en hardware de consumo, lo que lo hace atractivo para despliegues en vehículos, drones o sistemas de inspección de infraestructuras con recursos limitados.

Su relevancia actual radica en que ofrece una línea base reproducible y transparente para la detección de daños viales, con métricas declaradas sobre el split de test de RDD2022 (mAP@50 de 61,45 % y mAP@50-95 de 33,53 %) y una comparativa abierta frente a otros detectores (RF-DETR, YOLOv8m, YOLO26, YOLO11x) entrenados con la misma receta. La licencia AGPL-3.0 es un factor determinante para cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8s (CNN, detector de una etapa, familia Ultralytics YOLO) |
| Parámetros totales | 11.157.180 (11,2 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors y `best.pt`; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors y `best.pt` (PyTorch/Ultralytics) |
| Tarea | Object detection |
| Clases | `longitudinal_crack`, `transverse_crack`, `alligator_crack`, `pothole` |
| FLOPs | 28,6 B a 640 px |
| Tamaño de imagen de entrenamiento | 640 px |
| Dataset | RDD2022 Road Damage (`dronefreak/RDD2022`) |
| Framework | Ultralytics YOLO |
| Toolkit de entrenamiento | DetectionBench |

## Arquitectura y entrenamiento

YOLOv8s es un detector de objetos de una etapa basado en una red neuronal convolucional con un backbone de tipo CSPDarknet y un cuello de agregación de características tipo PAN-FPN, seguido de una cabeza de detección desacoplada (anchor-free). El modelo parte de los pesos preentrenados de Ultralytics YOLOv8 y se afina sobre RDD2022 con la receta estandarizada de DetectionBench, lo que garantiza que los resultados sean comparables con los de otros detectores evaluados en el mismo marco.

La configuración de entrenamiento documentada es la siguiente: 50 épocas configuradas y 50 realmente completadas, paciencia de early stopping de 10, batch size 16, tamaño de imagen 640, optimizador Adam, learning rate inicial de 0,001 y semilla 0. No se documentan en la información disponible detalles sobre composición exacta del dataset, aumentos de datos, uso de RLHF/DPO (no aplica a un detector) ni innovaciones técnicas adicionales más allá de la receta estándar de Ultralytics. El modelo se evalúa con el pipeline `detectionbench-evaluate` sobre el split de test de RDD2022.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica cuatro tipos de daño en el pavimento (grieta longitudinal, grieta transversal, grieta de piel de cocodrilo y bache).
- Salida con cajas delimitadoras y puntuaciones de confianza por clase, con umbral de confianza configurable en inferencia (por ejemplo, `conf=0.25`).
- Inferencia sobre imágenes individuales, lotes y fuentes de vídeo mediante la API de Ultralytics (`model.predict`).
- Integración con el ecosistema Ultralytics: exportación a formatos de despliegue habituales (ONNX, TensorRT, etc., sujeto a las capacidades de la librería, no documentadas específicamente en la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión por computador.
- No dispone de modo de razonamiento (thinking mode), visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Inspección automatizada de carreteras con vehículos equipados con cámara: el modelo detecta grietas y baches en tiempo real a 640 px, lo que permite generar inventarios de patologías del pavimento y priorizar reparaciones sin intervención manual.
- Mantenimiento predictivo de infraestructuras viarias: procesando lotes de imágenes capturadas por drones o vehículos de barrido, se pueden identificar tramos con mayor densidad de daños y planificar el calendario de conservación.
- Sistemas de alerta para conducción autónoma o asistida: la detección de baches y grietas de piel de cocodrilo puede alimentar módulos de confort y seguridad que ajusten la suspensión o avisen al conductor con antelación.
- Monitorización de obras y garantías post-reparación: comparar imágenes de una misma vía antes y después de una intervención para verificar la ausencia de nuevas grietas o baches en el periodo de garantía.
- Inventario municipal de aceras y calzadas: desplegado sobre imágenes de cámaras de tráfico o de vehículos municipales, permite construir mapas geoespaciales de daños con bajo coste de cómputo gracias a sus 11,2 M de parámetros.
- Investigación en visión por computador: sirve como línea base reproducible en DetectionBench para comparar nuevas arquitecturas o recetas de entrenamiento sobre RDD2022 con métricas idénticas.
- Despliegue en dispositivos de borde: por su tamaño compacto (28,6 GFLOPs a 640 px), puede ejecutarse en GPUs de consumo o en plataformas embebidas para inspección en campo sin conectividad.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de RDD2022 (métricas no verificadas, `verified: false` en el model-index):

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 61,45 |
| mAP@50-95 | 33,53 |
| Precision | 64,55 |
| Recall | 57,18 |
| F1 Score | 60,64 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| `longitudinal_crack` | 54,95 | 29,83 |
| `transverse_crack` | 54,18 | 25,89 |
| `alligator_crack` | 62,91 | 32,82 |
| `pothole` | 73,77 | 45,60 |

Comparativa del model zoo de DetectionBench sobre RDD2022 (mismos datos y pipeline de evaluación):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 |
| **YOLOv8s (este modelo)** | **61,45** | **33,53** | **64,55** | **57,18** |
| YOLO26s | 61,27 | 33,30 | 64,42 | 57,13 |
| YOLO26m | 61,24 | 33,38 | 63,70 | 57,27 |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 |
| YOLOv8n | 58,80 | 32,05 | 62,03 | 56,08 |
| YOLO11x | 51,05 | 26,54 | 56,64 | 49,54 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 11,2 M de parámetros, el peso de los pesos en FP32 ronda los 45 MB y en FP16 unos 22 MB; el consumo real depende del tamaño de lote y de la resolución de entrada.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; para entrenamiento o lotes grandes se recomiendan A100, H100 o RTX 4090. Para inferencia en tiempo real, tarjetas de gama media como RTX 3060/4060 son suficientes.
- Cabe en GPU de consumo: sí, por su tamaño compacto (11,2 M de parámetros y 28,6 GFLOPs a 640 px).
- Opciones de despliegue: Ultralytics (PyTorch), y exportación a formatos como ONNX o TensorRT a través de la librería Ultralytics (no documentado específicamente en la model card). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 (%) | mAP@50-95 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8s (este modelo) | 11,2 M | 61,45 | 33,53 | AGPL-3.0 | Hugging Face (Ultralytics) |
| YOLOv8m | no disponible | 62,03 | 34,08 | AGPL-3.0 (Ultralytics) | Hugging Face (Ultralytics) |
| YOLOv8n | no disponible | 58,80 | 32,05 | AGPL-3.0 (Ultralytics) | Hugging Face (Ultralytics) |
| RF-DETR Small | no disponible | 64,71 | 35,73 | no disponible | no disponible |
| RF-DETR Medium | no disponible | 65,08 | 36,02 | no disponible | no disponible |
| YOLO26s | no disponible | 61,27 | 33,30 | no disponible | no disponible |

En la comparativa del propio model zoo, YOLOv8s queda por debajo de RF-DETR Small y Medium en mAP@50 y mAP@50-95, y ligeramente por encima de YOLO26s y YOLO26m. Frente a YOLOv8m, este modelo sacrifica unas décimas de mAP a cambio de un tamaño menor. No se dispone de datos de parámetros ni licencia para los modelos RF-DETR y YOLO26 en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al entrenarse sobre RDD2022, el rendimiento puede degradarse en condiciones de iluminación, climatología o tipos de pavimento poco representados en el dataset.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y falsos negativos en la detección; el recall del 57,18 % indica que aproximadamente cuatro de cada diez instancias reales no se detectan en el split de test.
- Limitaciones de contexto o idioma: no aplica (modelo de visión). La resolución de entrada está fijada en 640 px durante el entrenamiento, lo que puede limitar la detección de grietas muy finas o de objetos pequeños.
- Restricciones de licencia: AGPL-3.0 impone obligaciones de copyleft fuerte; el uso comercial en productos propietarios requiere evaluar cuidadosamente el cumplimiento o contactar con el autor para una licencia alternativa. No se documenta una licencia comercial separada.
- Métricas no verificadas: el model-index marca los resultados como `verified: false`, por lo que conviene reproducirlos con el pipeline de DetectionBench antes de usarlos como referencia en producción.
- Caveat de producción: el modelo solo cubre cuatro clases de daño; no detecta señalización, vehículos ni otros elementos viales. La calidad de los pesos publicados y la reproducibilidad del entrenamiento dependen de la receta de DetectionBench y de la versión de Ultralytics utilizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/rdd2022-yolov8s
- Dataset RDD2022: https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Paper de referencia (arXiv:2209.08538): https://arxiv.org/abs/2209.08538
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
