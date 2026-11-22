# dronefreak/seadronessee-rfdetr-small

## Resumen

El modelo `dronefreak/seadronessee-rfdetr-small` es un detector de objetos RF-DETR Small afinado sobre el conjunto de datos SeaDronesSee, un benchmark de visión por computador centrado en escenarios marítimos captados desde vehículos aéreos no tripulados (UAV). Lo desarrolla el usuario dronefreak en el marco de DetectionBench, un framework que estandariza recetas de entrenamiento y métricas de evaluación para comparar detectores modernos de forma reproducible sobre múltiples datasets del mundo real.

El modelo parte de los pesos preentrenados de Roboflow/rf-detr-small y se ha reentrenado para detectar cinco clases específicas del dominio marítimo: nadadores, embarcaciones, motos acuáticas, dispositivos de salvamento y boyas. Con 31,8 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un detector compacto orientado a despliegue en entornos con recursos limitados, como drones o sistemas de búsqueda y rescate en tiempo real.

Su relevancia radica en que ofrece un punto de referencia reproducible y con licencia Apache 2.0 para tareas de detección en el ámbito marítimo y de UAV, un nicho donde los modelos genéricos suelen rendir peor por la combinación de objetos pequeños, movimiento de cámara, reflejos y condiciones de iluminación variables. El autor publica resultados comparativos frente a alternativas de la familia YOLO bajo la misma receta de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR Small (transformer detector basado en DETR, según el modelo base Roboflow/rf-detr-small) |
| Parámetros totales | 31.805.340 (32,1 M según la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de detección de objetos, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en el repositorio; checkpoint `checkpoint_best_total.pth` para la librería `rfdetr` |
| Tarea | object-detection |
| Librería | rfdetr |
| Modelo base | Roboflow/rf-detr-small |
| Dataset de entrenamiento | dronefreak/SeaDronesSee |
| Clases | swimmer, boat, jetski, life_saving_appliances, buoy |
| Tamaño del repositorio | 0,3 GB |
| FLOPs | no disponible (no publicado por el autor) |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Small, un detector de la familia DETR (Detection Transformer) que combina un backbone de extracción de características con un decodificador transformer para la predicción de cajas y clases. La model card no detalla la composición interna del backbone ni el esquema exacto de atención, por lo que esos datos deben consultarse en la documentación del modelo base Roboflow/rf-detr-small. El resultado del ajuste fino es un detector de 32,1 M de parámetros, adecuado para inferencia en dispositivos con recursos moderados.

El entrenamiento se realizó con el toolkit DetectionBench sobre el dataset SeaDronesSee, con una configuración máxima de 500 épocas de las cuales se completaron 148. No se especifica en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, destilación o ajuste por refuerzo. La evaluación se llevó a cabo con el pipeline estándar de DetectionBench (`detectionbench-evaluate`), que emplea las métricas de detección de la librería Supervision de Roboflow para calcular mAP, precisión y recall.

## Capacidades

- Detección de objetos en imágenes en cinco clases del dominio marítimo: nadadores, embarcaciones, motos acuáticas, dispositivos de salvamento y boyas.
- Localización con cajas delimitadoras y puntuaciones de confianza por detección.
- Umbral de confianza configurable en inferencia (`threshold` en `model.predict`).
- Diseñado para imágenes aéreas captadas desde UAV, con objetos de pequeño tamaño y escenas marítimas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de visión.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo de razonamiento explícito (thinking mode), visión aumentada por lenguaje ni procesamiento de audio.

## Casos de uso

- Búsqueda y rescate marítimo: el modelo detecta nadadores y dispositivos de salvamento en imágenes de dron, lo que permite priorizar zonas de búsqueda en operaciones de emergencia con una ventana de inferencia compatible con vídeo en tiempo real.
- Vigilancia de costas y playas: la detección de bañistas, embarcaciones y motos acuáticas facilita el control de zonas de baño y la alerta temprana de situaciones de riesgo.
- Monitorización de tráfico marítimo: la clase `boat` alcanza un mAP@50 de 95,32, lo que lo hace adecuado para inventariar embarcaciones en puertos, reservas naturales o zonas de navegación restringida.
- Seguimiento de boyas y balizamiento: la detección de boyas (mAP@50 de 78,44) permite verificar la colocación de balizamiento y detectar desplazamientos o pérdidas en canales navegables.
- Automatización de auditorías de seguridad en instalaciones acuáticas: el modelo puede procesar lotes de imágenes aéreas para comprobar la presencia y posición de equipos de salvamento.
- Integración en pipelines de análisis geoespacial: al ser un modelo compacto con licencia Apache 2.0, puede incorporarse en flujos de procesamiento por lotes de imágenes de dron junto con sistemas de georreferenciación.
- Prototipado e investigación en detección aérea: sirve como línea base reproducible en DetectionBench para comparar nuevas arquitecturas o estrategias de aumento de datos bajo la misma receta.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validación de SeaDronesSee, evaluados con el pipeline de DetectionBench. No están verificados de forma independiente (`verified: false`).

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 80,97 |
| mAP@50-95 | 45,31 |
| Precisión | 85,68 |
| Recall | 80,16 |
| F1 | 82,83 |

Rendimiento por clase sobre el split de validación:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| swimmer | 72,98 | 28,46 |
| boat | 95,32 | 68,10 |
| jetski | 91,65 | 58,78 |
| life_saving_appliances | 66,46 | 24,96 |
| buoy | 78,44 | 46,23 |

Comparativa publicada por el autor en el zoo de modelos de SeaDronesSee (misma receta de DetectionBench):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precisión (%) | Recall (%) |
|---|---|---|---|---|
| RF-DETR Medium | 83,47 | 47,49 | 87,01 | 83,33 |
| YOLO26m | 82,38 | 49,57 | 90,01 | 81,18 |
| **RF-DETR Small (este modelo)** | **80,97** | **45,31** | **85,68** | **80,16** |
| YOLO26s | 80,14 | 47,35 | 88,50 | 77,51 |
| YOLO11x | 74,82 | 45,56 | 87,37 | 72,46 |
| YOLOv8s | 72,94 | 43,05 | 84,52 | 71,25 |
| RF-DETR Nano | 72,38 | 39,83 | 81,37 | 74,08 |
| YOLO11n | 69,93 | 40,41 | 82,87 | 69,04 |
| YOLOv8n | 69,22 | 40,35 | 82,46 | 68,36 |
| YOLOv8m | 62,08 | 34,41 | 77,30 | 61,01 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 32,1 M de parámetros en precisión completa (FP32), los pesos ocupan aproximadamente 127 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 y H100; en estas últimas el rendimiento vendrá limitado por el preprocesado y el tamaño de lote más que por la capacidad de cómputo.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: la model card documenta el uso mediante la librería `rfdetr` y `huggingface_hub` para descargar el checkpoint `checkpoint_best_total.pth`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos. Tampoco se menciona exportación a ONNX o TensorRT.
- Latencia y throughput: no disponibles. El autor no publica FLOPs ni mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 (%) | mAP@50-95 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Small (este modelo) | 32,1 M | 80,97 | 45,31 | Apache 2.0 | Hugging Face, librería rfdetr |
| RF-DETR Medium | no disponible | 83,47 | 47,49 | no disponible en la información | Hugging Face (modelo base Roboflow) |
| YOLO26s | no disponible | 80,14 | 47,35 | no disponible en la información | no disponible en la información |
| YOLO11x | no disponible | 74,82 | 45,56 | no disponible en la información | no disponible en la información |
| RF-DETR Nano | no disponible | 72,38 | 39,83 | no disponible en la información | Hugging Face (modelo base Roboflow) |

Los datos de mAP proceden de la tabla comparativa publicada por el autor bajo la misma receta de DetectionBench sobre SeaDronesSee. Los parámetros y licencias de los modelos alternativos no se detallan en la información disponible.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El modelo está especializado en cinco clases del dominio marítimo; no es un detector genérico y su rendimiento fuera de SeaDronesSee o de escenarios aéreos marítimos no está documentado.
- Rendimiento notablemente inferior en clases pequeñas o poco representadas: `life_saving_appliances` (mAP@50-95 de 24,96) y `swimmer` (28,46) frente a `boat` (68,10), lo que indica dificultades con objetos pequeños o de baja frecuencia.
- No se documentan sesgos específicos, pero al entrenarse sobre un único dataset cabe esperar sensibilidad a condiciones de iluminación, oleaje, altitud de vuelo y tipo de cámara presentes en los datos de entrenamiento.
- Riesgo de falsos positivos y negativos en escenas con oclusión, objetos parcialmente sumergidos o reflejos en el agua; no se publican análisis de errores.
- No se especifican los términos de la licencia del dataset SeaDronesSee en esta ficha; debe consultarse la dataset card antes de un uso comercial.
- La licencia Apache 2.0 del modelo permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.
- El entrenamiento se detuvo a las 148 épocas de un máximo configurado de 500, por lo que puede existir margen de mejora con un entrenamiento más prolongado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/seadronessee-rfdetr-small
- Dataset SeaDronesSee en Hugging Face: https://huggingface.co/datasets/dronefreak/SeaDronesSee
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Roboflow/rf-detr-small: https://huggingface.co/Roboflow/rf-detr-small
- Librería Supervision de Roboflow: https://github.com/roboflow/supervision
- Paper de SeaDronesSee (arXiv:2105.01922): https://arxiv.org/abs/2105.01922
- Paper referenciado arXiv:2511.09554: https://arxiv.org/abs/2511.09554
- Paper referenciado arXiv:2304.07193: https://arxiv.org/abs/2304.07193
