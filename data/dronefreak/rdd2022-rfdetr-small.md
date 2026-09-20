# dronefreak/rdd2022-rfdetr-small

## Resumen

rdd2022-rfdetr-small es un detector de objetos de la familia RF-DETR (arquitectura transformer de detección tipo DETR) publicado por el usuario dronefreak como un ajuste fino del modelo base Roboflow/rf-detr-small. Está especializado en la detección de deterioro de firmes y pavimentos sobre el conjunto de datos RDD2022 Road Damage, con cuatro clases: grieta longitudinal, grieta transversal, grieta en malla (alligator_crack) y bache. El modelo tiene 32,1 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de copyleft.

El modelo se enmarca en DetectionBench, un framework para comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas. En el split de test de RDD2022 alcanza un mAP@50 de 64,71 % y un mAP@50-95 de 35,73 %, con una precisión de 65,69 % y un recall de 59,41 %. Con esos valores supera a YOLOv8s, YOLOv8m, YOLOv8n y a las variantes Nano y Medium de la propia familia RF-DETR en mAP@50 dentro del mismo pipeline de evaluación.

Su relevancia práctica está en el mantenimiento de infraestructuras: es un detector pequeño (32,1 M de parámetros), con un repositorio de 0,1 GB, pensado para inspección de carreteras mediante dron, vehículos instrumentados o procesamiento por lotes de imágenes. Al estar publicado con pesos PyTorch y una API de inferencia sencilla a través de la librería rfdetr, se puede desplegar en GPU de consumo sin necesidad de infraestructura de centro de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos transformer de la familia DETR (RF-DETR); detalles de backbone y cabecera no especificados en la informacion disponible |
| Parametros totales | 32,1 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; la entrada son imagenes) |
| Tipos de cuantizacion | No disponibles en la informacion proporcionada |
| Idiomas soportados | No aplica (modelo de vision); la metadata del repositorio no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth; archivo `checkpoint_best_total.pth`); no se publican pesos en safetensors ni GGUF |
| Tarea | Deteccion de objetos (object-detection) |
| Clases | longitudinal_crack, transverse_crack, alligator_crack, pothole |
| Modelo base | Roboflow/rf-detr-small (ajuste fino) |
| Dataset de entrenamiento | dronefreak/RDD2022 (RDD2022 Road Damage) |
| Libreria de inferencia | rfdetr |
| FLOPs | No publicados por el autor |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 20 de septiembre de 2026 (segun metadata de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de RF-DETR Small, un detector de la familia DETR (Detection Transformer). A diferencia de los detectores de una sola etapa basados en anclas, la familia DETR formula la detección como un problema de predicción de conjuntos sobre un transformer, lo que elimina la necesidad de supresión de no máximos en la etapa final. La información proporcionada no detalla el backbone concreto, la resolución de entrada, la estrategia de asignación de etiquetas ni el mecanismo de decodificación empleado por RF-DETR Small, por lo que esos extremos quedan como no disponibles.

El ajuste fino se realizó sobre el conjunto RDD2022 Road Damage y forma parte de DetectionBench, un marco que entrena y evalúa distintos detectores con recetas idénticas para permitir comparaciones justas. La tabla de configuración de entrenamiento incluida en la model card aparece truncada en la información disponible, de modo que no se pueden citar hiperparámetros como número de épocas, optimizador, tasa de aprendizaje, tamaño de lote, resolución o técnicas de aumento de datos. Tampoco se documenta el uso de RLHF, DPO ni ninguna otra etapa de alineación, algo que no aplica a un detector de objetos.

La evaluación se llevó a cabo con las métricas de detección de la librería Supervision sobre el split de test de RDD2022, mediante el pipeline `detectionbench-evaluate`. El autor indica que, al usar Supervision en lugar del validador de Ultralytics, no se generan gráficas de curva precisión-recall, curva F1 ni matriz de confusión.

## Capacidades

- Detección de objetos en imágenes: localiza instancias de las cuatro clases de deterioro del firme (grieta longitudinal, grieta transversal, grieta en malla y bache) y devuelve cajas delimitadoras con puntuación de confianza.
- Inferencia con umbral configurable: la API `model.predict("image.jpg", threshold=0.25)` permite ajustar el umbral de confianza para priorizar precisión o recall según el caso de uso.
- Procesamiento por imagen individual: la interfaz documentada trabaja sobre una imagen por llamada.
- Integración con el ecosistema HuggingFace Hub: los pesos se descargan con `hf_hub_download` desde el repositorio del modelo.
- Evaluación reproducible: incluye resultados por clase y comparativas dentro de un pipeline de evaluación estandarizado (DetectionBench + Supervision).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión por computador.
- No dispone de capacidades multimodales de entrada (no procesa texto, audio ni vídeo de forma nativa según la información disponible).

## Casos de uso

- Inspección de carreteras con dron: las imágenes aéreas capturadas en vuelos de reconocimiento se pasan al detector para localizar y contar grietas y baches por tramo, generando automáticamente un inventario de daños georreferenciable.
- Priorización de reparaciones en mantenimiento municipal: a partir de un lote de imágenes de la red viaria, el modelo produce detecciones por tipo de defecto y permite ordenar las actuaciones según la clase y la densidad de daño detectada.
- Integración en vehículos instrumentados o flotas comerciales: la cámara frontal o lateral alimenta el detector en tiempo de ejecución para registrar el estado del pavimento a lo largo de la ruta, con un coste computacional bajo derivado de los 32,1 M de parámetros.
- Control de calidad posterior a una obra de repavimentación: se comparan las detecciones antes y después de la intervención para verificar que no quedan grietas ni baches sin tratar en la sección reparada.
- Procesamiento por lotes de imágenes tipo Street View o cartografía: el modelo se ejecuta sobre grandes volúmenes de imágenes de archivo para construir series temporales del deterioro de una vía.
- Aplicación móvil de reporte ciudadano: el detector se ejecuta en el dispositivo o en un servidor ligero para clasificar automáticamente las fotos enviadas por los usuarios y enrutarlas al departamento correspondiente según el tipo de daño.
- Auditoría de contratos de conservación: las detecciones por clase y su evolución temporal sirven como evidencia objetiva del estado de la vía en disputas sobre nivel de servicio.
- Análisis de vídeo embarcado en vehículos autónomos: la detección de baches y grietas se usa como señal auxiliar de confort y seguridad para ajustar la conducción o alertar al conductor.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de RDD2022 Road Damage. El model-index los marca como `verified: false`.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 64,71 |
| mAP@50-95 | 35,73 |
| Precision | 65,69 |
| Recall | 59,41 |
| F1 | 62,39 |

Rendimiento por clase sobre el mismo split de test:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| longitudinal_crack | 58,38 | 30,83 |
| transverse_crack | 58,96 | 29,61 |
| alligator_crack | 66,66 | 35,23 |
| pothole | 74,86 | 47,24 |

## Requisitos de hardware

- Pesos en precisión completa (FP32): 32,1 M de parámetros equivalen a unos 128 MB; en FP16, unos 64 MB. El repositorio completo ocupa 0,1 GB.
- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa derivada del recuento de parámetros y de la resolución típica de entrada de un detector de este tamaño, se puede esperar un consumo del orden de 1 a 3 GB con lote de tamaño 1; es una estimación, no un dato verificado.
- GPU recomendadas: tarjetas de consumo con al menos 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores) deberían ser suficientes para inferencia. GPU de centro de datos como A100 o H100 solo serían necesarias para procesamiento por lotes a gran escala o entrenamiento.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 6 GB o más de VRAM, dado el tamaño del modelo. No se ha confirmado una configuración mínima oficial.
- Opciones de despliegue: la vía documentada es PyTorch con la librería `rfdetr` (`pip install rfdetr huggingface_hub`), cargando los pesos con `hf_hub_download` y `rfdetr.RFDETRSmall(pretrain_weights=weights)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas orientadas a modelos de lenguaje. Para métricas y utilidades de detección se referencia la librería Supervision.
- Exportación a otros formatos (ONNX, TensorRT, CoreML): no confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa publicada por el autor dentro del mismo pipeline de evaluación (RDD2022 Road Damage, split de test). Solo se dispone de las métricas; la licencia y el número de parámetros de los modelos alternativos no se indican en la información proporcionada.

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) | Parametros | Licencia |
|---|---|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 | No disponible | No disponible |
| RF-DETR Small (este modelo) | 64,71 | 35,73 | 65,69 | 59,41 | 32,1 M | Apache 2.0 |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 | No disponible | No indicada en la informacion disponible |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 | No disponible | No indicada en la informacion disponible |
| YOLOv26s | 61,27 | 33,30 | 64,42 | 57,13 | No disponible | No indicada en la informacion disponible |
| YOLOv26m | 61,24 | 33,38 | 63,70 | 57,27 | No disponible | No indicada en la informacion disponible |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 | No disponible | No disponible |
| YOLOv8n | 58,80 | 32,05 | 62,03 | 56,08 | No disponible | No indicada en la informacion disponible |

Sobre estos datos: RF-DETR Small obtiene el segundo mejor mAP@50 y mAP@50-95 de la tabla, por detrás únicamente de RF-DETR Medium, y el mejor recall de todos los modelos comparados. RF-DETR Medium logra una precisión claramente superior (71,18 % frente a 65,69 %), lo que sugiere que en aplicaciones donde los falsos positivos sean costosos puede compensar usar el modelo Medium a cambio de más cómputo.

## Limitaciones y advertencias

- Dominio restringido: el modelo solo detecta cuatro clases de daño viario (grieta longitudinal, grieta transversal, grieta en malla y bache). No detecta otros tipos de deterioro, elementos de la vía ni objetos ajenos al firme.
- Rendimiento desigual por clase: las grietas longitudinales y transversales obtienen mAP@50-95 de 30,83 % y 29,61 % respectivamente, frente al 47,24 % de los baches. Las grietas finas son, por tanto, la categoría más propensa a fallos.
- Métricas no verificadas: los resultados del model-index figuran con `verified: false`, es decir, están declarados por el autor y no han sido reproducidos de forma independiente.
- Riesgo de falsos positivos y falsos negativos: con un recall del 59,41 % y una precisión del 65,69 %, en producción cabe esperar tanto detecciones espurias como daños no detectados. Es imprescindible calibrar el umbral de confianza (por defecto documentado en 0,25) según la tolerancia al error de cada aplicación.
- Dependencia del dominio de entrenamiento: no se documentan en la información disponible las condiciones de captura del conjunto RDD2022 (países, dispositivos, iluminación o climatología), por lo que el comportamiento del modelo fuera de esa distribución —por ejemplo, con imágenes nocturnas, muy mojadas o de sensores distintos— es incierto y requiere validación propia.
- Sin datos sobre sesgos: el autor no publica un análisis de sesgo por región, tipo de vía, fabricante de cámara o condiciones meteorológicas.
- Licencia del modelo: Apache 2.0, permisiva y apta para uso comercial, con obligación de conservar el aviso de licencia y el archivo de cambios si se modifica. La licencia del conjunto de datos RDD2022 se remite a la ficha del dataset y debe comprobarse por separado antes de un uso comercial, ya que puede ser más restrictiva que la del modelo.
- Detalles de entrenamiento incompletos: la tabla de configuración de entrenamiento de la model card aparece truncada en la información disponible, lo que dificulta reproducir el ajuste fino.
- Ausencia de información sobre cuantización y exportación: no se documentan versiones cuantizadas, ni formatos ONNX o TensorRT, lo que puede limitar el despliegue en hardware embebido.
- No apto para uso como sistema de decisión autónoma en seguridad vial: las salidas son detecciones con incertidumbre y deben revisarse o complementarse con inspección humana antes de derivar de ellas decisiones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/rdd2022-rfdetr-small
- Dataset RDD2022 (dronefreak): https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base RF-DETR Small (Roboflow): https://huggingface.co/Roboflow/rf-detr-small
- Libreria Supervision (metricas de deteccion): https://github.com/roboflow/supervision
- Referencias arXiv incluidas en las etiquetas del repositorio (sin descripcion disponible en la informacion proporcionada): https://arxiv.org/abs/2209.08538, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2606.03748
