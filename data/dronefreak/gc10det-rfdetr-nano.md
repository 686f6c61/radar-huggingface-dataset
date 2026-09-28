# dronefreak/gc10det-rfdetr-nano

## Resumen

RF-DETR Nano Finetuned on GC10-DET es un detector de objetos especializado en la inspeccion de superficies metalicas, desarrollado por el usuario dronefreak a partir del modelo base Roboflow/rf-detr-nano. El modelo se ha ajustado (fine-tuning) sobre el conjunto de datos GC10-DET, un benchmark de defectos superficiales en tiras de acero laminado, con el objetivo de localizar y clasificar diez tipos de defecto industrial: pliegues, grietas, inclusiones, manchas de aceite, agujeros de punzonado, picaduras de laminacion, manchas de seda, dobleces de cintura, manchas de agua y lineas de soldadura.

La relevancia del modelo es practica: el control de calidad visual en lineas de produccion siderurgica es un caso de uso industrial con demanda creciente, y este checkpoint ofrece un detector compacto (30,5 millones de parametros, repositorio de 0,1 GB) con licencia Apache-2.0, lo que facilita su integracion en despliegues comerciales sin restricciones de licencia. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que devuelve cajas delimitadoras con clase y confianza sobre imagenes.

El checkpoint forma parte de DetectionBench, un framework que entrena y evalua distintos detectores modernos con recetas de entrenamiento y metricas identicas, lo que permite comparaciones reproducibles entre arquitecturas. En el split de test de GC10-DET el modelo alcanza un mAP@50 de 70,17 % y un mAP@50-95 de 38,06 %, con una precision de 77,08 % y un recall de 71,04 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion (familia DETR, variante RF-DETR nano); el backbone concreto no se detalla en la informacion proporcionada |
| Parametros totales | 30,5 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos de PyTorch para la libreria rfdetr; en la model card solo se documenta la carga mediante `rfdetr` y `huggingface_hub`. Otros formatos, no disponibles |
| Tarea | Object detection (pipeline: object-detection) |
| Framework / libreria | rfdetr |
| Dataset de entrenamiento | dronefreak/GC10-DET |
| Numero de clases | 10 |
| Flops | no disponible (el propio autor indica "N/A (not published upstream)") |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la familia RF-DETR, que sigue el paradigma de los detection transformers (DETR) aplicado a deteccion en tiempo real. Frente a los detectores clasicos basados en anclas, un DETR formula la deteccion como un problema de prediccion de conjuntos y elimina la necesidad de tecnicas de supresion de no maximos (NMS) en el postprocesado. La model card no especifica el backbone, la resolucion de entrada ni el numero de consultas (queries) utilizadas en la variante nano, por lo que esos detalles quedan como no disponibles.

El entrenamiento consiste en un ajuste fino supervisado del checkpoint Roboflow/rf-detr-nano sobre GC10-DET. Todo el proceso se realizo dentro de DetectionBench, un framework cuyo objetivo es aplicar recetas de entrenamiento identicas y un mismo protocolo de evaluacion a multiples detectores y datasets, de modo que las cifras publicadas sean comparables entre si. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo por otra parte esperable en un modelo de deteccion sin componente generativo.

La evaluacion se realizo sobre el split de test de GC10-DET con la herramienta `detectionbench-evaluate` del propio framework, que a su vez se apoya en las metricas de deteccion de la libreria Supervision de Roboflow. Esta eleccion implica una limitacion metodologica reconocida por el autor: Supervision reporta mAP, precision y recall de forma directa, pero no genera las curvas PR, las curvas F1 ni las matrices de confusion que produce el validador de Ultralytics, de modo que esas visualizaciones no estan disponibles para este checkpoint.

## Capacidades

- Deteccion de objetos en imagenes con salida de cajas delimitadoras, clase y puntuacion de confianza.
- Clasificacion de diez categorias de defecto superficial en acero laminado: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.
- Inspeccion visual automatizada de superficies metalicas en entornos de fabricacion.
- Inferencia de baja latencia apta para despliegue en linea de produccion, dado el reducido tamano del modelo (30,5 M de parametros).
- Integracion en pipelines de Python mediante la libreria rfdetr y descarga de pesos desde Hugging Face con `hf_hub_download`.
- Evaluacion reproducible con el pipeline de DetectionBench y las metricas de Supervision.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto, vision-lenguaje ni modo de pensamiento (thinking). Es exclusivamente un detector visual.
- No tiene capacidades multilingues: no procesa ni genera lenguaje natural.

## Casos de uso

- Control de calidad en linea de laminacion en caliente: el modelo se situa como paso de inferencia sobre las imagenes capturadas por camaras industriales al final del tren de laminacion, detectando en tiempo real los diez tipos de defecto definidos y activando alarmas o el rechazo de la bobina cuando la confianza supera un umbral configurable.
- Clasificacion y trazabilidad de defectos: cada deteccion queda etiquetada con su clase (por ejemplo, welding_line o crescent_gap), lo que permite construir histogramas de defectos por turno, por lote o por proveedor de materia prima y alimentar sistemas de trazabilidad industrial.
- Prefiltrado de inspeccion manual: en plantas donde el volumen de imagenes supera la capacidad de los inspectores humanos, el modelo marca automaticamente las regiones sospechosas y reduce la carga de revision a los casos dudosos, priorizando por puntuacion de confianza.
- Despliegue en el borde (edge) junto a la linea de produccion: con 30,5 M de parametros y un repositorio de 0,1 GB, el modelo es candidato para ejecutarse en hardware embebido o en una GPU de gama media situada en planta, evitando enviar imagenes a la nube por motivos de latencia o de confidencialidad industrial.
- Auditoria y mejora del proceso de fabricacion: el desglose por clase de defecto (por ejemplo, el mAP@50 de 17,32 % en la clase crease frente al 99,31 % en welding_line) permite identificar que tipos de defecto necesitan mas datos etiquetados o ajustes en la linea de produccion.
- Punto de partida para ajuste fino adicional: al ser un checkpoint Apache-2.0 sobre un modelo base tambien abierto, sirve como inicializacion para adaptar la deteccion de defectos a otras superficies o a nuevas nomenclaturas de defecto con un coste de entrenamiento reducido.
- Comparacion de arquitecturas en proyectos de vision industrial: dentro de DetectionBench el modelo actua como referencia cuantitativa frente a variantes de YOLO y otras tallas de RF-DETR, util para decidir que detector desplegar segun la relacion precision/recall exigida.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados sobre el split de test de GC10-DET con el pipeline `detectionbench-evaluate`. Las metricas estan marcadas como no verificadas por un tercero (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 70,17 |
| mAP@50-95 | 38,06 |
| Precision | 77,08 |
| Recall | 71,04 |
| F1 | 73,94 |
| Parametros | 30,5 M |
| FLOPs | no disponible |

Comparativa publicada por el propio autor dentro del "GC10-DET Model Zoo", con todos los modelos entrenados y evaluados por DetectionBench sobre el mismo dataset:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | 74,25 | 38,31 | 80,50 | 67,99 |
| YOLO26m | 73,97 | 36,94 | 75,70 | 68,19 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | 72,54 | 35,07 | 72,39 | 66,80 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | 71,88 | 38,80 | 69,77 | 70,84 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano (este modelo) | 70,17 | 38,06 | 77,08 | 71,04 |

Desglose por clase sobre el split de test:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 17,32 | 10,90 |
| crescent_gap | 92,39 | 61,81 |
| inclusion | 50,13 | 11,40 |
| oil_spot | 55,59 | 22,62 |
| punching_hole | 90,98 | 47,98 |
| rolled_pit | 50,00 | 30,00 |
| silk_spot | 66,84 | 31,89 |
| waist_folding | 92,57 | 62,19 |
| water_spot | 86,60 | 54,29 |
| welding_line | 99,31 | 47,52 |

## Requisitos de hardware

- VRAM de pesos (calculo teorico a partir de los 30,5 M de parametros): aproximadamente 122 MB en FP32, 61 MB en FP16/BF16 y 30,5 MB en INT8. Hay que anadir la memoria de activaciones y del pipeline de preprocesado de imagen, que no se documenta en la informacion proporcionada.
- Al tratarse de un modelo de 30,5 M de parametros, cabe con holgura en cualquier GPU de consumo actual, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Es apto para despliegue en dispositivos de borde (Jetson Orin, Jetson Nano y similares) y en CPU, siempre que se acepte una latencia mayor. No se publican mediciones de latencia ni de throughput.
- GPUs de centro de datos (A100, H100, L40S) no son necesarias para la inferencia de un unico flujo, pero permiten procesar muchos flujos de camara en paralelo mediante batching.
- Opciones de despliegue documentadas en la informacion disponible: la libreria `rfdetr` de Python, con pesos descargados desde Hugging Face mediante `huggingface_hub`. Tambien se documenta el uso de Supervision para el calculo de metricas.
- Otros runners (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de deteccion y no se documentan formatos alternativos como ONNX, TensorRT o CoreML en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa dentro del mismo dataset y protocolo de evaluacion (GC10-DET, split de test, recetas de DetectionBench). Los datos de parametros, contexto y cuantizacion de los modelos alternativos no se incluyen en la informacion proporcionada.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RF-DETR Nano (este modelo) | 70,17 | 38,06 | 77,08 | 71,04 | Apache-2.0 | Hugging Face (dronefreak/gc10det-rfdetr-nano) |
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 | no disponible en la informacion proporcionada | no disponible |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 | no disponible en la informacion proporcionada | no disponible |
| YOLO26n | 74,25 | 38,31 | 80,50 | 67,99 | no disponible en la informacion proporcionada | no disponible |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 | no disponible en la informacion proporcionada | no disponible |

Lectura de la tabla: dentro de la misma familia, las variantes Small y Medium superan a Nano en mAP@50 (76,07 y 75,93 frente a 70,17), a costa de un mayor coste computacional y de un recall inferior en el caso de Small (65,03 frente a 71,04). Frente a YOLO26n y YOLOv8n, el modelo queda por debajo en mAP@50 y en mAP@50-95, pero ofrece el recall mas alto del grupo de nano-modelos comparados (71,04), lo que resulta relevante en escenarios donde perder un defecto es mas costoso que una falsa alarma.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo solo reconoce las diez clases de defecto de GC10-DET y solo sobre el tipo de superficie metalica representado en ese dataset. Fuera de ese dominio su comportamiento no esta caracterizado.
- Rendimiento muy desigual por clase: la clase crease obtiene un mAP@50 de 17,32 %, frente al 99,31 % de welding_line. Las clases minoritarias o visualmente sutiles son practicamente inutilizables sin trabajo adicional.
- Metricas no verificadas: los valores del model-index estan marcados con `verified: false`, de modo que proceden unicamente del autor y no han sido replicados por un tercero independiente.
- Ausencia de curvas y matrices de confusion: al evaluar con Supervision en lugar del validador de Ultralytics, no hay curvas PR, curvas F1 ni matrices de confusion publicadas, lo que dificulta el ajuste fino del umbral de decision en produccion.
- Sin informacion sobre sesgos: no se documenta ningun analisis de sesgo por condiciones de iluminacion, tipo de acero, camara o procedencia del material. En vision industrial estos factores suelen ser la principal fuente de degradacion en produccion.
- Riesgo de falsos negativos y falsos positivos: con un recall del 71,04 % y una precision del 77,08 %, aproximadamente tres de cada diez defectos reales no se detectarian y una de cada cuatro detecciones seria falsa. Cualquier uso critico debe acompanarse de validacion sobre datos propios.
- Sin datos de generalizacion: no se publican resultados sobre otros datasets de defectos superficiales ni sobre los splits de validacion o entrenamiento, solo sobre test.
- Licencia permisiva: Apache-2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. Conviene revisar aparte la licencia del dataset GC10-DET y la del modelo base Roboflow/rf-detr-nano.
- Cero adopcion publica: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya validado el checkpoint.
- Repositorio de 0,1 GB con una model card que parece truncada en la seccion de uso (el ejemplo de codigo queda cortado), lo que obliga a consultar la documentacion de la libreria rfdetr para completar la integracion.
- Sin soporte de cuantizacion documentado, lo que limita las optimizaciones de despliegue en hardware embebido con restricciones severas de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gc10det-rfdetr-nano
- Modelo base: https://huggingface.co/Roboflow/rf-detr-nano
- Dataset GC10-DET (copia del autor): https://huggingface.co/datasets/dronefreak/GC10-DET
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Libreria Supervision (metricas de deteccion): https://github.com/roboflow/supervision
- Referencias arXiv citadas en la model card: arXiv:2511.09554, arXiv:2304.07193, arXiv:2410.17725, arXiv:2606.03748
- No se han encontrado otros enlaces relevantes en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
