# dronefreak/rdd2022-rfdetr-medium

## Resumen

dronefreak/rdd2022-rfdetr-medium es un detector de objetos de la familia RF-DETR (arquitectura de tipo transformer DETR) afinado por el usuario dronefreak sobre el conjunto de datos RDD2022 de daños en pavimento. Parte del modelo base Roboflow/rf-detr-medium y se distribuye con licencia Apache 2.0 a través de HuggingFace Hub, con un tamaño de repositorio de 0,1 GB y 33,7 millones de parámetros. No es un modelo de lenguaje: no genera texto, no razona y no tiene ventana de contexto; su única tarea es la detección de cajas delimitadoras sobre imágenes.

El modelo resuelve un problema acotado y muy específico: localizar y clasificar cuatro tipos de daño vial (grietas longitudinales, grietas transversales, grietas en piel de cocodrilo y baches) en imágenes de carretera. Está entrenado y evaluado dentro del marco DetectionBench, un proyecto que aplica recetas de entrenamiento idénticas y una única tubería de evaluación a varios detectores modernos sobre distintos conjuntos de datos reales. Sobre el split de test de RDD2022 declara un mAP@50 de 65,08, un mAP@50-95 de 36,02, una precisión de 71,18 y un recall de 55,98.

Su relevancia es doble. Por un lado, es una pieza publicada dentro de un esfuerzo de comparación reproducible entre detectores (RF-DETR frente a YOLOv8 y YOLOv26 en varios tamaños) bajo métricas idénticas, algo poco habitual en modelos pequeños de visión. Por otro lado, ofrece un punto de partida listo para afinar en tareas de inspección de infraestructuras, con un coste computacional bajo (33,7 M de parámetros) que permite inferencia en GPU de consumo e incluso en dispositivos embarcados. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que carece de validación independiente por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de objetos basado en transformer de la familia DETR; variante RF-DETR Medium de Roboflow (modelo base: Roboflow/rf-detr-medium). Detalles internos de backbone y resolución de entrada no disponibles en la información proporcionada |
| Parámetros totales | 33,7 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; resolución de entrada no especificada en la información disponible) |
| Tipos de cuantización | No disponible (se distribuye únicamente el checkpoint en PyTorch) |
| Idiomas soportados | No aplica (detección de objetos sobre imágenes; sin capacidades de texto ni multilingües) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth; archivo `checkpoint_best_total.pth`) |
| Tarea (pipeline) | object-detection |
| Librería | rfdetr |
| Clases detectadas | longitudinal_crack, transverse_crack, alligator_crack, pothole |
| Conjunto de datos de entrenamiento | dronefreak/RDD2022 (RDD2022 Road Damage) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización en el Hub | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del checkpoint Roboflow/rf-detr-medium, un detector de la familia RF-DETR. RF-DETR pertenece a la línea de detectores basados en transformer tipo DETR, que formulan la detección como un problema de predicción de conjuntos sobre un número fijo de consultas, en lugar de la predicción densa por anclas típica de la familia YOLO. Los tags del repositorio incluyen referencias arXiv, entre ellas la 2304.07193, asociada al trabajo DINOv2 sobre representaciones visuales auto-supervisadas; no obstante, la información proporcionada no describe explícitamente el backbone ni el mecanismo de atención del modelo, por lo que ese detalle se marca como no disponible.

El entrenamiento se realizó sobre el conjunto RDD2022 Road Damage, con cuatro clases de daño vial, y forma parte de DetectionBench, un marco que busca reproducibilidad aplicando una misma receta de entrenamiento y una misma tubería de evaluación a distintos detectores. La evaluación declarada se realizó sobre el split de test de RDD2022 mediante la herramienta `detectionbench-evaluate` y las métricas de detección de la librería Supervision. La tabla de configuración de entrenamiento incluida en la model card aparece truncada en la información disponible, de modo que no se conocen hiperparámetros como el número de épocas, el tamaño de lote, la resolución de entrenamiento, el optimizador ni si se aplicaron técnicas de aumento de datos. Tampoco consta si hubo una fase de ajuste por refuerzo o preferencias humanas, algo que en cualquier caso no aplica a un detector puro.

## Capacidades

- Detección de cajas delimitadoras con etiqueta de clase sobre imágenes de carretera, limitada a las cuatro clases del conjunto RDD2022: grietas longitudinales, grietas transversales, grietas en piel de cocodrilo y baches.
- Rendimiento por clase desigual y documentado: el bache es la clase mejor detectada (mAP@50 de 74,68 y mAP@50-95 de 46,48), mientras que las grietas transversales y longitudinales se sitúan en torno a 59,6 de mAP@50.
- Inferencia mediante la API de rfdetr: descarga del checkpoint desde el Hub con `hf_hub_download` e instanciación con `rfdetr.RFDETRMedium(pretrain_weights=weights)`, seguida de `model.predict("image.jpg", threshold=0.25)`.
- Umbral de confianza configurable en el momento de la predicción (el ejemplo de la model card usa 0,25).
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión descriptiva (VQA/captioning), audio ni modo de pensamiento. Es exclusivamente un detector.
- No se documentan capacidades de segmentación, detección de puntos clave ni clasificación de imagen completa.
- Dominio de aplicación declarado por los tags: daño en carreteras, deterioro de pavimento, infraestructuras, detección de baches y conducción autónoma. No se documenta su comportamiento fuera de ese dominio.

## Casos de uso

- Inventario y priorización de reparaciones municipales: procesar lotes de imágenes georreferenciadas de la red viaria para extraer un listado de daños por tipo y coordenada, de modo que el área de mantenimiento pueda ordenar intervenciones. El mAP@50 de 74,68 en baches lo hace especialmente indicado para priorizar los daños con mayor impacto en la seguridad.
- Inspección con vehículos instrumentados o dashcams: el modelo puede ejecutarse sobre fotogramas capturados por cámaras de salpicadero o vehículos de inspección, con un coste de 33,7 M de parámetros que permite procesar secuencias completas sin clúster de GPU.
- Inspección aérea con drones: dado el perfil del autor del repositorio y el uso de imágenes de carretera, encaja en flujos de fotogrametría y ortomosaicos para revisar tramos extensos de vía en una sola pasada, generando mapas de daño agregados.
- Asistencia a la conducción y avisos de confort: detección de baches en tiempo real para avisar al conductor o ajustar sistemas de suspensión adaptativa en vehículos equipados con cámara frontal. Requiere validar latencia y falsos negativos antes de cualquier uso en producción (el recall declarado es del 55,98 %, es decir, en torno al 44 % de los objetos del test no se recuperan).
- Aplicaciones ciudadanas de reporte de baches: integración del detector en el backend de una app móvil para clasificar automáticamente las fotos que envían los usuarios y descartar las que no contienen daño vial.
- Análisis retrospectivo de archivos fotográficos: reprocesar series históricas de imágenes de carretera para medir la evolución del deterioro y estimar tasas de degradación por tramo.
- Investigación y benchmarking reproducible: usar el modelo como línea base dentro de DetectionBench o en comparaciones propias, aprovechando que las métricas se han calculado con una tubería estandarizada y que la tabla comparativa del zoo de modelos incluye RF-DETR en tres tamaños y varias versiones de YOLO.
- Despliegue en dispositivos de borde: con 33,7 M de parámetros, el modelo es candidato a ejecutarse en hardware embarcado o en estaciones de trabajo modestas para preanálisis local, enviando a la nube únicamente los fotogramas con detecciones relevantes.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de RDD2022 Road Damage, calculados con la tubería `detectionbench-evaluate`. Todas las métricas figuran como no verificadas (`verified: false`) en el model-index, es decir, no han sido reproducidas por terceros.

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 65,08 |
| mAP@50-95 | 36,02 |
| Precisión | 71,18 |
| Recall | 55,98 |
| F1 | 62,67 |
| Parámetros | 33,7 M |
| FLOPs | No publicados (N/A según la model card) |

Comparativa publicada en la propia model card (zoo de modelos de DetectionBench sobre RDD2022, mismas condiciones de evaluación):

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recall |
|---|---|---|---|---|
| RF-DETR Medium (este modelo) | 65,08 | 36,02 | 71,18 | 55,98 |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 |
| YOLOv26s | 61,27 | 33,30 | 64,42 | 57,13 |
| YOLOv26m | 61,24 | 33,38 | 63,70 | 57,27 |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 |
| YOLOv8n | 58,80 | 32,05 | 62,03 | 56,08 |

Rendimiento por clase declarado en la model card:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| longitudinal_crack | 59,57 | 31,99 |
| transverse_crack | 59,86 | 30,22 |
| alligator_crack | 66,22 | 35,37 |
| pothole | 74,68 | 46,48 |

No se han publicado en la información disponible resultados de benchmarks generales de visión (COCO, LVIS u otros) para este ajuste concreto, ni mediciones de latencia o throughput.

## Requisitos de hardware

- Tamaño de pesos: con 33,7 M de parámetros, el checkpoint ocupa aproximadamente 135 MB en fp32 y 67 MB en fp16. Estimación aritmética a partir del recuento de parámetros, no una medición publicada.
- VRAM estimada para inferencia: por debajo de 2 GB a lote 1 en fp32, sumando activaciones de un detector transformer a resolución estándar. Estimación orientativa; no hay cifras de VRAM publicadas por el autor.
- Memoria del repositorio: 0,1 GB, coherente con un checkpoint único (`checkpoint_best_total.pth`).
- GPU de consumo: cabe con holgura en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090), así como en CPU para inferencia a baja cadencia. No hay datos publicados de latencia que permitan confirmar el rendimiento en tiempo real.
- GPU recomendadas: para inferencia en producción, tarjetas de gama media o de inferencia dedicada (T4, L4, A10G, L40S); para reentrenamiento o ajuste fino, A100 o H100 por comodidad de memoria y velocidad, aunque el tamaño del modelo no las exige.
- Opciones de despliegue documentadas: librería `rfdetr` (instalable con `pip install rfdetr`) más `huggingface_hub` para la descarga del checkpoint. Para la evaluación se cita la librería Supervision.
- Opciones de despliegue no documentadas: no se mencionan exportaciones a ONNX, TensorRT, OpenVINO, CoreML ni formatos GGUF. Frameworks de servido de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama no aplican a este modelo.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia ni FLOPs (figuran como N/A).

## Comparativa con modelos similares

| Modelo | mAP@50 (RDD2022) | mAP@50-95 | Precisión | Recall | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| RF-DETR Medium (este modelo) | 65,08 | 36,02 | 71,18 | 55,98 | 33,7 M | Apache 2.0 | HuggingFace Hub |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 | No disponible | No disponible | No disponible en la información proporcionada |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 | No disponible | No disponible | No disponible en la información proporcionada |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 | No disponible | No disponible | No disponible en la información proporcionada |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 | No disponible | No disponible | No disponible en la información proporcionada |

Observaciones sobre la comparativa extraídas de los datos anteriores: RF-DETR Medium obtiene el mejor mAP@50 y mAP@50-95 del grupo comparado y la precisión más alta (71,18), pero su recall (55,98) es inferior al de RF-DETR Small (59,41), YOLOv8m (57,42) y YOLOv8s (57,18), lo que indica que tiende a producir menos falsos positivos a costa de perder más objetos. Si el caso de uso prioriza no dejar daños sin detectar, RF-DETR Small puede ser preferible pese a su mAP@50 ligeramente inferior. No se dispone de datos de parámetros, licencia ni disponibilidad de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Recall del 55,98 % en el split de test: en torno al 44 % de los objetos anotados no se recuperan. En un contexto de inspección de infraestructuras esto implica daños no reportados, por lo que se recomienda combinarlo con revisión humana o con un umbral de confianza más bajo según el coste relativo de falsos positivos y falsos negativos.
- Métricas no verificadas: los cuatro valores del model-index figuran con `verified: false`. Son resultados declarados por el autor, sin reproducción independiente ni revisión por pares.
- Cobertura de clases muy reducida: solo cuatro categorías de daño. No detecta otros defectos habituales (bordillos dañados, señalización, hundimientos, parches, grietas selladas), lo que limita su uso como sistema de inspección completo.
- Sin información sobre el dataset: la model card remite a la ficha del conjunto dronefreak/RDD2022, pero no se detalla en la información disponible la composición por país, condiciones de captura, balance de clases ni posibles sesgos geográficos o de iluminación. Un modelo entrenado con imágenes diurnas y en buen estado meteorológico puede degradarse con lluvia, noche o sombras fuertes; no hay evaluación al respecto.
- Precisión y recall desequilibrados por clase: los baches se detectan con claridad (mAP@50 de 74,68) mientras que las grietas transversales se quedan en 59,86 de mAP@50 y 30,22 de mAP@50-95, el valor más bajo de las cuatro clases. Las grietas finas son el punto débil del modelo.
- Riesgo de alucinación en sentido de detección: como cualquier detector, puede generar cajas espurias sobre texturas que se parezcan a un daño (juntas de dilatación, manchas de aceite, sombras alargadas). El umbral de 0,25 usado en el ejemplo es bajo y probablemente produzca falsos positivos en escenas ruidosas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. Conviene revisar por separado la licencia del conjunto de datos RDD2022, ya que no se detalla en la información proporcionada y el uso comercial del dataset puede tener condiciones propias.
- Ausencia de soporte y mantenimiento comunitario: 0 descargas y 0 likes en el Hub, sin issues ni discusiones públicas documentadas. No hay garantía de actualizaciones ni de corrección de errores.
- Sin datos de producción: no se publican FLOPs, latencia, throughput, memoria pico ni comportamiento en cuantización. Cualquier estimación de despliegue debe validarse con una medición propia antes de comprometer un sistema en producción.
- Metadatos con fechas de creación y actualización de 2026-09-20: deben tomarse tal cual figuran en el Hub; no se dispone de información adicional que las explique.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/rdd2022-rfdetr-medium
- Conjunto de datos RDD2022 (versión del autor): https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench (marco de entrenamiento y evaluación): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Roboflow/rf-detr-medium
- Librería Supervision, usada para el cálculo de métricas de detección: https://github.com/roboflow/supervision
- Referencias arXiv incluidas en los tags del repositorio (sin descripción aportada en la información disponible): arxiv:2209.08538, arxiv:2511.09554, arxiv:2304.07193, arxiv:2606.03748
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los únicos resultados recibidos corresponden a un portal de noticias sin relación con el proyecto, por lo que no se han podido añadir enlaces externos adicionales (papers, blogs o demos) más allá de los citados.
