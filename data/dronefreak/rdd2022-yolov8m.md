# dronefreak/rdd2022-yolov8m

## Resumen

El modelo `dronefreak/rdd2022-yolov8m` es un detector de objetos YOLOv8m afinado por el usuario dronefreak sobre el conjunto de datos RDD2022 de daños en pavimento. No es un modelo de lenguaje: es un detector de vision por computador de una sola etapa, con 25,9 millones de parametros y 78,9 GFLOPs por inferencia a 640 px, que devuelve cajas delimitadoras para cuatro clases de defectos viales: grieta longitudinal, grieta transversal, grieta de cocodrilo y bache. Se publica como pesos PyTorch (`best.pt`) bajo licencia AGPL-3.0 y se distribuye a traves de la libreria Ultralytics.

El modelo forma parte de DetectionBench, un framework del mismo autor cuyo objetivo es reproducir recetas de entrenamiento y evaluacion identicas para comparar detectores modernos (familia YOLO y familia RF-DETR) sobre distintos datasets reales. Todas las metricas publicadas se calculan sobre el split de test de RDD2022 con el pipeline `detectionbench-evaluate`, lo que aporta una base homogenea de comparacion frente a los demas modelos del zoo.

Su relevancia practica esta en la inspeccion automatizada de infraestructura viaria: con 62,03 % de mAP@50 y 74,15 % de mAP@50 en la clase bache, es un candidato viable para priorizar mantenimiento, alimentar sistemas ADAS o preanotar grandes volumenes de imagenes de carretera. La etiqueta `verified: false` en sus metricas y las cero descargas registradas en el momento de la consulta indican que se trata de una publicacion reciente y sin validacion externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (Ultralytics), detector de objetos en una sola etapa |
| Parametros totales | 25,9 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, FLOPs declarados a 640 px) |
| Tipos de cuantizacion | no disponible en la model card; el framework Ultralytics permite exportar a ONNX, TensorRT, OpenVINO, CoreML y TFLite |
| Idiomas soportados | no disponible; los nombres de clase estan en ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`, safetensors no aplica) |
| Tarea | object-detection |
| Clases | longitudinal_crack, transverse_crack, alligator_crack, pothole |
| FLOPs | 78,9 GFLOPs a 640 px |
| Dataset de entrenamiento | dronefreak/RDD2022 (RDD2022 Road Damage) |
| Modelo base | Ultralytics/YOLOv8 (finetune) |
| Framework / libreria | Ultralytics YOLO |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el modelo como un finetune de YOLOv8m, el tamano mediano de la familia YOLOv8 de Ultralytics, una arquitectura convolucional de deteccion en una sola etapa. Los unicos datos cuantitativos de arquitectura aportados por el autor son el numero de parametros (25,9 M) y el coste computacional (78,9 GFLOPs a 640 px), coherentes con una entrada de 640 px. No se detalla en la informacion disponible la composicion exacta del backbone, el cuello de union ni las cabezas de deteccion, ni si se emplearon tecnicas de aumento de datos, EMA de pesos o entrenamiento con precision mixta.

Respecto al entrenamiento, la tabla de configuracion de la model card queda truncada en los datos proporcionados: solo constan el dataset (RDD2022 Road Damage) y el framework (Ultralytics YOLO). No se indican numero de epochs, tasa de aprendizaje, batch, resolucion de entrenamiento, estrategia de particion train/val/test ni si hubo ajuste posterior de umbrales de confianza. La evaluacion se realizo sobre el split de test del dataset con el pipeline `detectionbench-evaluate` del proyecto DetectionBench, un punto a favor de la reproducibilidad frente a fichas que reportan metricas de validacion sin especificar el protocolo.

## Capacidades

- Deteccion de objetos en imagenes de carretera: devuelve cajas delimitadoras con puntuacion de confianza para cuatro clases de defecto de pavimento.
- Localizacion de grietas longitudinales, grietas transversales, grietas de cocodrilo y baches sobre imagenes estaticas.
- Inferencia sobre fuentes multiples a traves de Ultralytics: archivo de imagen, directorio, video, stream de webcam o URL, con parametro de umbral de confianza configurable.
- Clasificacion por clase con rendimiento desigual: la clase bache es la mas fiable (mAP@50 74,15), mientras que las grietas transversales son las mas debiles (mAP@50 55,52).
- Ajuste de umbral de confianza en tiempo de inferencia (`conf=0.25` en el ejemplo de la ficha), lo que permite intercambiar precision por recall.
- Exportacion a otros formatos de inferencia mediante el framework Ultralytics, aunque el autor no documenta ningun artefacto exportado en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, vision-lenguaje, audio ni modo de pensamiento: no es un modelo generativo.

## Casos de uso

- Inspeccion de pavimento con flotas de vehiculos: montar el detector en camaras de salpicadero o vehiculos de mantenimiento y ejecutar inferencia a 640 px para inventariar grietas y baches por tramo, aprovechando que el modelo esta entrenado especificamente con imagenes de dano vial.
- Priorizacion de mantenimiento municipal: agregar las detecciones georreferenciadas en un SIG y ordenar las actuaciones por densidad de baches, clase con el mejor rendimiento del modelo (mAP@50 74,15).
- Asistencia a la conduccion y ADAS: usar la deteccion de baches en tiempo real como senal de alerta o para ajustar la respuesta de la suspension en vehiculos con control electronico, apoyandose en los 78,9 GFLOPs del modelo, compatibles con GPUs de a bordo.
- Control de calidad en obras y recepcion de firmas constructoras: analizar imagenes del pavimento recien extendido para verificar la ausencia de grietas de cocodrilo o fisuras transversales antes de aceptar el tramo.
- Preanotacion de datasets de infraestructura: emplear el modelo como anotador automatico para reducir el coste de etiquetado manual, revisando despues las cajas de baja confianza dado el recall del 57,42 % declarado.
- Analisis a escala de ciudad sobre imagenes tipo street view: procesar lotes masivos de imagenes de via publica para construir mapas de deterioro y series temporales de evolucion de grietas.
- Investigacion en benchmark de deteccion: servir como baseline reproducible dentro de DetectionBench para comparar recetas de entrenamiento y arquitecturas sobre RDD2022 con el mismo protocolo de evaluacion.
- Despliegue en inspeccion con drones o vehiculos aereos no tripulados: el detector opera sobre imagenes aereas de carretera, un escenario habitual en el diagnostico de firmes, siempre que la distribucion de alturas y angulos sea similar a la del dataset de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de RDD2022 (metricas no verificadas de forma independiente, `verified: false`):

| Metrica | Valor |
|---|---|
| mAP@50 | 62,03 |
| mAP@50-95 | 34,08 |
| Precision | 65,61 |
| Recall | 57,42 |
| F1 | 61,24 |
| Parametros | 25,9 M |
| FLOPs | 78,9 GFLOPs a 640 px |

Rendimiento por clase (mAP sobre test):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| longitudinal_crack | 55,97 | 30,69 |
| transverse_crack | 55,52 | 26,60 |
| alligator_crack | 62,50 | 32,91 |
| pothole | 74,15 | 46,12 |

Zoo de modelos RDD2022 publicado por el mismo autor (mismo protocolo de evaluacion):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 |
| YOLOv8m (este modelo) | 62,03 | 34,08 | 65,61 | 57,42 |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 |
| YOLOv26s | 61,27 | 33,30 | 64,42 | 57,13 |
| YOLOv26m | 61,24 | 33,38 | 63,70 | 57,27 |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 |
| YOLOv8n | 58,80 | 32,05 | 62,03 | 56,08 |

## Requisitos de hardware

- Huella de pesos: aproximadamente 104 MB en FP32 (25,9 M de parametros) y unos 52 MB en FP16, calculado a partir del numero de parametros declarado.
- VRAM estimada para inferencia: del orden de 1 a 2 GB con PyTorch a 640 px y batch 1 (pesos mas activaciones y buffers de runtime); la model card no publica mediciones de VRAM, por lo que se trata de una estimacion derivada, no de un dato del autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria es suficiente en la practica, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 y H100. El modelo es pequeno para su categoria y no requiere GPU de datacenter.
- Cabe en GPU de consumo: si, en toda la gama consumer moderna y tambien en GPUs integradas con soporte de runtime de inferencia. La inferencia en CPU es viable para procesamiento por lotes no critico.
- Opciones de despliegue: el ejemplo oficial usa Python con `ultralytics` y descarga de pesos via `huggingface_hub`; el ecosistema Ultralytics permite ademas exportar a ONNX, TensorRT, OpenVINO, CoreML y TFLite para servir con ONNX Runtime, TensorRT, OpenVINO Runtime o Triton Inference Server. No aplican vLLM, llama.cpp, Ollama ni TGI por tratarse de un modelo de vision y no de lenguaje.
- Latencia y throughput: no disponibles. La model card no publica FPS ni tiempos de inferencia; el unico indicador de coste computacional es 78,9 GFLOPs a 640 px.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 | mAP@50-95 | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLOv8m RDD2022 (este modelo) | 25,9 M | 62,03 | 34,08 | imagenes, FLOPs a 640 px | AGPL-3.0 | HuggingFace (ultralytics, `best.pt`) |
| RF-DETR Medium | no disponible | 65,08 | 36,02 | no disponible | no disponible | referenciado en DetectionBench |
| RF-DETR Small | no disponible | 64,71 | 35,73 | no disponible | no disponible | referenciado en DetectionBench |
| YOLOv8s RDD2022 | no disponible (familia YOLOv8s) | 61,45 | 33,53 | no disponible | AGPL-3.0 (si sigue la licencia Ultralytics) | referenciado en DetectionBench |

Frente a la familia RF-DETR, este YOLOv8m queda 3,05 puntos de mAP@50 por detras de RF-DETR Medium y 2,68 por detras de RF-DETR Small, pero supera a RF-DETR Nano (60,85) y a todas las variantes YOLO evaluadas en el mismo zoo. Para el resto de modelos comparados no se dispone de numero de parametros, licencia ni artefactos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. Integrar el modelo en un servicio de red o en un producto propietario obliga a liberar el codigo fuente correspondiente bajo los mismos terminos, salvo que se adquiera una licencia comercial alternativa de Ultralytics. Conviene revisarlo antes de cualquier uso en produccion cerrada.
- Metricas no verificadas: la model card marca explicitamente los resultados como `verified: false`. Proceden del autor y del pipeline de su propio proyecto, sin evaluacion independiente ni replicacion por terceros.
- Recall bajo: 57,42 % implica que, con los umbrales de evaluacion empleados, se dejan de detectar aproximadamente cuatro de cada diez objetos presentes. En mantenimiento de firmes esto se traduce en defectos no inventariados si no se ajusta el umbral o no se combina con revision humana.
- Clase mas debil: `transverse_crack` obtiene 26,60 de mAP@50-95, muy por debajo de `pothole` (46,12). Las grietas finas y transversales son el punto fragil del modelo.
- Riesgo de falsos positivos por textura: sombras, juntas de dilatacion, marcas viales, parches y superficies mojadas pueden confundirse con grietas. La model card incluye matrices de confusion, pero no analiza este fenomeno.
- Ausencia de datos sobre sesgos y cobertura geografica: no se documentan la composicion del split, la distribucion por pais, las condiciones climaticas ni el tipo de captura (vehiculo o dron). El comportamiento fuera de la distribucion de RDD2022 no esta caracterizado.
- Informacion de entrenamiento incompleta: la configuracion publicada esta truncada (solo dataset y framework), lo que dificulta reproducir el entrenamiento exacto y auditar hiperparametros o aumentos de datos.
- Sin evidencia de adopcion: 0 descargas y 0 likes en el momento de la consulta, y ninguna validacion de produccion documentada.
- Alcance limitado: solo deteccion de cajas, sin segmentacion de la grieta, sin estimacion de severidad ni profundidad, y sin ninguna capacidad multimodal o generativa.
- Idiomas y etiquetas: los nombres de clase estan en ingles; no se declaran idiomas soportados porque no aplica a un detector, pero cualquier interfaz multilingue debe construirse en la capa de aplicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/rdd2022-yolov8m
- Dataset RDD2022 usado en el entrenamiento: https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench (framework y fuente de las metricas): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLOv8
- Referencias arXiv incluidas en los tags del repositorio: https://arxiv.org/abs/2209.08538, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2606.03748
- Documentacion de Ultralytics YOLO (framework de carga e inferencia): https://docs.ultralytics.com
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con este modelo (contenido no tecnico sobre dibujos animados), por lo que no se han incorporado enlaces adicionales.
