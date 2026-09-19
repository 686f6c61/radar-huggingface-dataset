# dronefreak/uavdt-yolov8s

## Resumen

uavdt-yolov8s es un detector de objetos YOLOv8s (variante "small" de Ultralytics) ajustado mediante fine-tuning sobre el conjunto de datos UAVDT, un benchmark de imágenes aéreas captadas por drones para detección de vehículos en escenarios de tráfico y vigilancia. El modelo lo publica el usuario dronefreak como parte de DetectionBench, un framework cuyo objetivo es reproducir de forma estandarizada el entrenamiento y la evaluación de detectores modernos sobre varios conjuntos de datos reales con recetas idénticas, de modo que las comparaciones entre arquitecturas sean justas.

Se trata de un modelo puramente de visión por computador, no de lenguaje: no genera texto ni admite instrucciones en lenguaje natural. Detecta tres clases de vehículos (car, truck, bus) sobre imágenes aéreas de baja altitud. La arquitectura es la del detector YOLOv8 estándar de Ultralytics, con aproximadamente 11,2 millones de parámetros y 28,6 GFLOPs por inferencia, lo que lo sitúa en el rango de modelos ligeros desplegables en hardware modesto.

Su relevancia actual es doble. Por un lado, sirve como línea base reproducible dentro de un zoo de modelos sobre UAVDT donde se comparan RF-DETR, YOLOv8, YOLOv11 y YOLOv26 bajo el mismo protocolo de evaluación. Por otro, pone de manifiesto una característica crítica del dominio aéreo: los resultados absolutos son bajos (mAP@50 de 11,48 % en el split de test), lo que evidencia la dificultad de detectar objetos pequeños, densos y con gran variación de escala en imágenes de dron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (Ultralytics), detector convolucional de una etapa, sin anclas y con cabeza desacoplada |
| Parametros totales | 11,2 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (la model card solo distribuye pesos PyTorch `best.pt`; no documenta recetas de cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas de clase están en inglés: car, truck, bus) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), cargable con la librería `ultralytics` |
| Tarea | object-detection (detección de objetos) |
| Cómputo por inferencia | 28,6 GFLOPs |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Clases | car, truck, bus |
| Modelo base | Ultralytics/YOLOv8 (YOLOv8s) |
| Autor | dronefreak |
| Repositorio | https://huggingface.co/dronefreak/uavdt-yolov8s (tamaño declarado: 0.0 GB) |
| Fecha de publicación | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de los pesos de YOLOv8s de Ultralytics, un detector convolucional de una sola etapa que predice cajas directamente a partir de la imagen mediante una cabeza desacoplada (ramas independientes para clasificación y regresión) y un esquema de asignación sin anclas. Con 11,2 M de parámetros y 28,6 GFLOPs, es la segunda variante más pequeña de la familia YOLOv8, por encima únicamente de la versión nano. El fine-tuning se realizó sobre UAVDT, un conjunto de imágenes aéreas de vehículos en movimiento.

La model card no especifica el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, el número de épocas, las técnicas de aumento de datos, ni si se aplicó algún tipo de ajuste posterior (RLHF, DPO o similares, que en cualquier caso no aplican a un detector). Tampoco se documentan innovaciones técnicas propias: el valor del modelo reside en la reproducibilidad del protocolo de evaluación de DetectionBench (`detectionbench-evaluate`), que aplica métricas idénticas a todos los modelos del zoo sobre el mismo split de test, no en modificaciones arquitectónicas.

Un dato relevante desde el punto de vista metodológico es que las métricas declaradas están marcadas como no verificadas (`verified: false`) en el model-index.

## Capacidades

- Detección de objetos en imágenes aéreas captadas por drones (UAV), con salida de cajas delimitadoras y puntuaciones de confianza.
- Detección de tres clases de vehículos: coche (car), camión (truck) y autobús (bus).
- Detección de objetos pequeños en escenas aéreas de baja altitud, que es el escenario objetivo del dataset UAVDT.
- Inferencia sobre imágenes individuales y sobre vídeo, dado que el propio repositorio incluye un vídeo de demostración con detecciones sobre dos clips de test de UAVDT.
- Integración con el ecosistema Ultralytics: carga mediante `YOLO(weights)` tras descargar el archivo `best.pt` con `huggingface_hub`.
- No dispone de soporte de tool calling ni function calling.
- No tiene capacidades de agente ni de razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), ni de entrada o salida de audio, ni de segmentación, captioning o respuesta a preguntas visuales.

## Casos de uso

- Vigilancia de tráfico aéreo: el modelo puede analizar secuencias de vídeo captadas por dron para localizar coches, camiones y autobuses, sirviendo como extractor de detecciones para conteo de vehículos o estimación de densidad.
- Análisis posterior de grabaciones (post-procesado): dado que el modelo trabaja sobre imágenes, se puede ejecutar de forma offline sobre fotogramas extraídos de vuelos ya realizados para generar informes de ocupación de vías.
- Línea base en investigación académica: es directamente utilizable como referencia reproducible en trabajos que comparen detectores sobre UAVDT, gracias a que DetectionBench fija la receta de entrenamiento y evaluación.
- Validación del pipeline de DetectionBench: el checkpoint sirve para verificar que la herramienta `detectionbench-evaluate` reproduce las métricas publicadas antes de evaluar modelos propios.
- Prototipado rápido de sistemas de visión embarcados: con 11,2 M de parámetros, es un candidato razonable para pruebas de concepto en plataformas con GPU integrada o aceleradores de borde, exportando los pesos a formatos de inferencia optimizados.
- Monitorización de infraestructuras viarias: la detección de vehículos ligeros y pesados permite clasificar el tipo de tráfico (por ejemplo, distinguir presencia de camiones y autobuses frente a turismos) en tramos concretos.
- Docencia y formación en detección de objetos: al ser un modelo pequeño, con licencia AGPL y cargable en pocas líneas de Python, resulta apropiado para prácticas sobre detección aérea y evaluación de métricas tipo COCO.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de **test** de UAVDT, con el pipeline de evaluación de DetectionBench. Las métricas figuran como no verificadas en el model-index.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 11,48 |
| mAP@50-95 | 6,71 |
| Precision | 19,34 |
| Recall | 23,39 |
| F1 | 21,18 |
| Parametros | 11,2 M |
| FLOPs | 28,6 B |

Rendimiento por clase (UAVDT, test):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 28,40 | 15,98 |
| truck | 0,89 | 0,55 |
| bus | 5,16 | 3,61 |

Comparativa dentro del zoo de modelos de DetectionBench sobre UAVDT (mismo protocolo):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 15,02 | 8,76 | 40,28 | 61,14 |
| RF-DETR Small | 14,89 | 8,92 | 38,83 | 61,65 |
| YOLOv26s | 14,09 | 7,91 | 23,88 | 27,05 |
| RF-DETR Nano | 12,96 | 7,33 | 37,12 | 55,40 |
| YOLOv26m | 12,32 | 6,66 | 19,44 | 25,83 |
| YOLOv8m | 12,28 | 7,05 | 19,73 | 25,33 |
| YOLOv11x | 11,98 | 6,68 | 18,70 | 25,93 |
| YOLOv8s (este modelo) | 11,48 | 6,71 | 19,34 | 23,39 |
| YOLOv8n | 10,79 | 6,42 | 18,61 | 24,58 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia de orden de magnitud, un modelo de 11,2 M de parámetros ocupa del orden de 45 MB en FP32 y unos 22 MB en FP16, a lo que hay que sumar activaciones y buffers de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada. Dado el tamaño y los 28,6 GFLOPs por inferencia, el modelo es adecuado para GPU de gama media y para GPU de consumo.
- Compatibilidad con GPU de consumo: sí, por tamaño y cómputo el modelo es apto para GPU de consumo; la model card no especifica modelos concretos.
- Opciones de despliegue: la model card únicamente documenta la carga con la librería `ultralytics` (`pip install ultralytics huggingface_hub`) y la descarga de `best.pt` desde Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un detector de objetos. Tampoco se documentan exportaciones a ONNX, TensorRT, OpenVINO o TFLite.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación con alternativas del mismo zoo de DetectionBench sobre UAVDT (datos del propio autor). El contexto y la licencia de los modelos alternativos no están disponibles en la información proporcionada.

| Modelo | Parametros | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|
| RF-DETR Small | no disponible | 14,89 | 8,92 | 38,83 | 61,65 | no disponible |
| RF-DETR Medium | no disponible | 15,02 | 8,76 | 40,28 | 61,14 | no disponible |
| YOLOv8m | no disponible | 12,28 | 7,05 | 19,73 | 25,33 | no disponible |
| YOLOv8n | no disponible | 10,79 | 6,42 | 18,61 | 24,58 | no disponible |
| YOLOv8s (este modelo) | 11,2 M | 11,48 | 6,71 | 19,34 | 23,39 | AGPL-3.0 |

Observaciones derivadas de la tabla: las variantes de RF-DETR obtienen de forma sistemática mejor precisión y recall que este checkpoint, con una diferencia de entre 3 y 4 puntos de mAP@50. Dentro de la propia familia YOLOv8, el salto de YOLOv8s a YOLOv8m aporta 0,8 puntos de mAP@50 y 0,34 de mAP@50-95. No hay información disponible sobre licencias, contexto ni disponibilidad de los modelos comparados más allá de lo reflejado en esta tabla.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: un mAP@50 de 11,48 % y un mAP@50-95 de 6,71 % en el split de test implican una tasa elevada de detecciones perdidas y de falsos positivos. No es un modelo listo para producción sin reentrenamiento o ajuste adicional.
- Desequilibrio severo entre clases: la clase car alcanza 28,40 de mAP@50, mientras que truck se queda en 0,89 y bus en 5,16. En la práctica, el modelo es útil casi exclusivamente para detectar turismos.
- Métricas no verificadas: el model-index marca todos los resultados como `verified: false`; se trata de cifras declaradas por el autor y no reproducidas por un tercero.
- Sesgo de dominio: el modelo está ajustado sobre UAVDT, con un tipo concreto de cámara aérea, altitud y escenario de tráfico. El rendimiento fuera de ese dominio (otras altitudes, otras ciudades, otras condiciones meteorológicas, imágenes satelitales o cámaras fijas) no está documentado y previsiblemente se degradará.
- Sin información sobre composición del dataset ni sobre sesgos demográficos o geográficos: no disponibles en la model card.
- Riesgo de alucinación: no aplica en el sentido de los modelos generativos, pero sí existe riesgo de falsos positivos, especialmente en clases poco representadas como truck y bus.
- Limitación de clases: solo detecta tres categorías. No reconoce peatones, motocicletas, bicicletas ni otros objetos habituales en escenas de tráfico.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el código fuente de la obra derivada bajo la misma licencia cuando se ofrece como servicio en red, algo que muchas empresas no aceptan. Conviene revisar las condiciones con asesoramiento legal antes de integrarlo en un producto propietario.
- sin métricas de latencia, memoria ni rendimiento energético publicadas, no es posible dimensionar un despliegue en producción sin hacer pruebas propias.
- El repositorio declara un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o no ser visibles; conviene verificar la disponibilidad de `best.pt` antes de planificar su uso.
- Ausencia de información sobre técnicas de cuantización o exportación: cualquier optimización para despliegue (ONNX, TensorRT, OpenVINO) tendrá que validarse de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-yolov8s
- Repositorio DetectionBench (código y protocolo de evaluación): https://github.com/dronefreak/DetectionBench
- Dataset UAVDT (versión del autor): https://huggingface.co/datasets/dronefreak/UAVDT
- Modelo base: https://huggingface.co/Ultralytics/YOLOv8
- Referencia arXiv 1804.00518 (citada en los tags del modelo): https://arxiv.org/abs/1804.00518
- Referencia arXiv 2304.07193 (citada en los tags del modelo): https://arxiv.org/abs/2304.07193
- Referencia arXiv 2410.17725 (citada en los tags del modelo): https://arxiv.org/abs/2410.17725
- Referencia arXiv 2511.09554 (citada en los tags del modelo): https://arxiv.org/abs/2511.09554
- Referencia arXiv 2606.03748 (citada en los tags del modelo): https://arxiv.org/abs/2606.03748
- Vídeo de demostración: https://huggingface.co/dronefreak/uavdt-yolov8s/resolve/main/assets/demo_banner.mp4
- Los resultados de la búsqueda web realizada no contienen información relacionada con este modelo (corresponden a contenidos de seguros y enfermedades de larga duración en francés), por lo que no se incluye ningún enlace adicional procedente de esa búsqueda.
