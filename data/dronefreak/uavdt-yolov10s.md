# dronefreak/uavdt-yolov10s

## Resumen

uavdt-yolov10s es un detector de objetos YOLOv10s afinado por el usuario dronefreak sobre el conjunto de datos UAVDT (Unmanned Aerial Vehicle Benchmark: Object Detection and Tracking), un benchmark de imagenes aereas captadas por drones en entornos de trafico urbano y de autopista. El modelo detecta tres clases: coche (car), camion (truck) y autobus (bus). Se distribuye a traves de Hugging Face con la libreria Ultralytics y deriva del checkpoint base Ultralytics/YOLOv10 en su variante "s".

Se trata de un modelo compacto: 8,1 millones de parametros y 25,1 unidades de FLOPs a 640 px segun la model card, lo que lo situa en la gama ligera de la familia YOLO y lo hace desplegable en hardware de borde. Su relevancia es doble: por un lado cubre el nicho de la deteccion de objetos pequenos en imagenes aereas, donde los vehiculos ocupan pocos pixeles y los detectores genericos pierden recall; por otro, forma parte de DetectionBench, un framework que entrena y evalua distintos detectores con recetas identicas para permitir comparaciones reproducibles.

El modelo se publica bajo licencia AGPL-3.0, con 0 descargas y 0 "likes" en el momento de redactar esta ficha, y con un tamano de repositorio declarado de 0,0 GB, un detalle que conviene verificar antes de asumir que los pesos estan efectivamente alojados. Los resultados declarados son modestos en terminos absolutos (28,85 % de mAP@50), pero estan contextualizados en una tabla comparativa publica con otros trece detectores evaluados sobre el mismo conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10s (detector de objetos convolucional de una etapa, sin NMS en inferencia) |
| Parametros totales | 8,1 M (segun la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; resolucion de entrenamiento/evaluacion a 640 px) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible en la informacion proporcionada (el repositorio figura con 0,0 GB) |
| Tarea | object-detection (deteccion de objetos en imagenes aereas) |
| Modelo base | Ultralytics/YOLOv10 (variante s) |
| Framework / libreria | Ultralytics |
| Clases | car, truck, bus |
| FLOPs | 25,1 a 640 px (valor tal como se declara en la model card) |
| Dataset de entrenamiento y evaluacion | dronefreak/UAVDT |
| Split de evaluacion | test de UAVDT |
| Descargas / likes en Hugging Face | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es YOLOv10s, la variante pequena de YOLOv10. YOLOv10 introduce un esquema de entrenamiento sin supresion de no maximos (NMS-free) basado en una asignacion dual consistente, de modo que la cabeza del detector produce directamente las cajas finales sin el postprocesado clasico de NMS. Esta caracteristica reduce la latencia de inferencia y elimina un hiperparametro sensible en despliegues en tiempo real, algo relevante cuando el modelo se ejecuta sobre video aereo capturado por un dron. La model card no aporta detalles adicionales sobre el backbone ni sobre decisiones de diseno internas mas alla del checkpoint base.

En cuanto al entrenamiento, la informacion disponible indica que se trata de un ajuste fino (fine-tuning) del checkpoint Ultralytics/YOLOv10 sobre el dataset UAVDT, realizado dentro del framework DetectionBench, cuyo objetivo declarado es emplear recetas de entrenamiento identicas y la misma pipeline de evaluacion (`detectionbench-evaluate`) para todos los modelos comparados. No se especifican en la informacion proporcionada el numero de tokens o imagenes, la composicion exacta del dataset, el numero de epocas, el optimizador ni si se aplicaron tecnicas de aumento de datos, ajuste por RLHF o similares. El rendimiento por clase sugiere que el conjunto esta fuertemente desbalanceado hacia la clase car.

## Capacidades

- Deteccion de objetos en imagenes aereas captadas por UAV, con tres clases: car, truck y bus.
- Deteccion de objetos pequenos (small-object detection), la etiqueta explicita del repositorio, orientada a vehiculos que ocupan pocos pixeles en el plano imagen.
- Inferencia sin NMS, gracias a la arquitectura YOLOv10, con salida directa de cajas y etiquetas.
- Evaluacion estandarizada de deteccion: la model card reporta mAP@50, mAP@50-95, precision, recall y F1, ademas de curvas PR y F1, matriz de confusion y matriz de confusion normalizada.
- Integracion con el ecosistema Ultralytics (`pip install ultralytics huggingface_hub`), lo que da acceso a las utilidades de carga, entrenamiento, validacion y exportacion del framework.
- Integracion con DetectionBench mediante la CLI `detectionbench-evaluate`.
- Capacidades de vision: vision (deteccion), vision (deteccion).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, agentes, multimodalidad texto-imagen, audio ni modo de razonamiento explicito. Tampoco se documenta soporte multilingue, que no aplica.

## Casos de uso

- Vigilancia de trafico desde dron: el modelo esta entrenado especificamente sobre UAVDT, con imagenes aereas de trafico, por lo que puede integrarse en una pipeline de streaming que reciba frames de la camara de un UAV y emita detecciones de coches, camiones y autobuses para monitorizacion de carreteras.
- Conteo y aforo de vehiculos: dado que la clase car alcanza 71,51 de mAP@50, el modelo es aprovechable para contar turismos en secuencias aereas; es la clase con diferencia mejor aprendida y la mas adecuada para tareas de agregacion estadistica.
- Etiquetado automatico (auto-labeling) de nuevos datos aereos: con 36,53 % de precision y 33,16 % de recall, el modelo puede usarse como preanotador en un bucle humano-en-el-bucle para acelerar el etiquetado, revisando despues manualmente las cajas propuestas, especialmente en las clases truck y bus.
- Despliegue en borde (edge) sobre el propio dron: con 8,1 M de parametros y 25,1 FLOPs a 640 px, cabe en plataformas embebidas tipo NVIDIA Jetson y permite deteccion a bordo sin enviar video a un servidor, reduciendo ancho de banda y latencia.
- Investigacion reproducible en deteccion aerea: al formar parte de DetectionBench, sirve como punto de referencia (baseline) para comparar nuevas arquitecturas sobre UAVDT con la misma receta de entrenamiento y la misma pipeline de evaluacion.
- Filtrado previo en sistemas de busqueda de vehiculos: el modelo puede actuar como primera etapa de cribado sobre grandes volumenes de imagen aerea, reduciendo el conjunto de fotogramas que pasan a un modelo de clasificacion o a revision humana.
- Analisis de flotas y logistica en recintos: la deteccion de bus y truck, aunque con rendimiento bajo, permite estimaciones gruesas de presencia de vehiculos pesados alli donde no se requiere precision fina.
- Prototipado rapido y pruebas de concepto: la combinacion de Ultralytics mas el checkpoint preentrenado en UAVDT permite tener un detector funcional sobre imagenes aereas con muy pocas lineas de codigo, adecuado para validar una idea antes de invertir en entrenamientos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre el split de test de UAVDT:

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 28,85 |
| mAP@50-95 | 16,48 |
| Precision | 36,53 |
| Recall | 33,16 |
| F1 | 34,76 |

Rendimiento por clase declarado en la model card:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 71,51 | 39,02 |
| truck | 4,86 | 3,16 |
| bus | 10,19 | 7,25 |

Comparativa publicada por el propio autor en el "UAVDT Model Zoo" de DetectionBench (mismos datos de entrada, misma receta y misma evaluacion):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv26s | 32,98 | 19,61 | 43,86 | 40,38 |
| RF-DETR Nano | 32,78 | 20,31 | 73,60 | 66,98 |
| RF-DETR Small | 32,62 | 20,21 | 73,83 | 71,63 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv8m | 31,42 | 18,80 | 40,27 | 37,79 |
| YOLOv10m | 30,12 | 17,33 | 40,13 | 35,68 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| YOLOv11s | 29,10 | 17,16 | 34,32 | 37,31 |
| YOLOv26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv10s (este modelo) | 28,85 | 16,48 | 36,53 | 33,16 |
| YOLOv11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada en la informacion disponible. Como referencia calculada a partir del numero de parametros, los pesos ocupan aproximadamente 32 MB en FP32 y 16 MB en FP16; sumando activaciones y buffers a 640 px con lote 1, el consumo total suele situarse en el rango de 1 a 2 GB, pero se trata de una estimacion, no de un dato declarado por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. No se han publicado pruebas especificas con A100, H100, RTX 4090 ni otras GPU en la informacion disponible.
- Cabe en GPU de consumo: si, con margen amplio, dado el tamano del modelo. Es razonable esperar ejecucion en GTX 1050 Ti/1650, RTX 3050, RTX 3060, RTX 4060/4070/4090 y equivalentes. No se aportan FPS medidos.
- Opciones de despliegue: la model card solo documenta el uso mediante Ultralytics (`pip install ultralytics huggingface_hub`) y la evaluacion con `detectionbench-evaluate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos. Las rutas de exportacion habituales del framework Ultralytics (ONNX, TensorRT, OpenVINO, TFLite, CoreML) no se detallan en la informacion proporcionada.
- Latencia y throughput: no disponibles. El valor de FLOPs declarado (25,1 a 640 px) y la ausencia de NMS en la arquitectura YOLOv10 apuntan a un coste de inferencia bajo, pero no hay cifras publicadas en la informacion disponible.

## Comparativa con modelos similares

Comparativa de la misma categoria sobre el mismo dataset y protocolo, segun la tabla publicada por el autor:

| Modelo | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| uavdt-yolov10s (este modelo) | 28,85 | 16,48 | 8,1 M | no aplica | AGPL-3.0 | Hugging Face, 0 descargas |
| YOLOv10m finetuneado en UAVDT | 30,12 | 17,33 | no disponible | no aplica | no disponible | listado en DetectionBench |
| YOLOv9s finetuneado en UAVDT | 31,82 | 18,71 | no disponible | no aplica | no disponible | listado en DetectionBench |
| YOLOv26s finetuneado en UAVDT | 32,98 | 19,61 | no disponible | no aplica | no disponible | listado en DetectionBench |
| RF-DETR Nano finetuneado en UAVDT | 32,78 | 20,31 | no disponible | no aplica | no disponible | listado en DetectionBench |
| RF-DETR Small finetuneado en UAVDT | 32,62 | 20,21 | no disponible | no aplica | no disponible | listado en DetectionBench |

Observaciones: YOLOv9s y YOLOv10m obtienen entre 1,3 y 2,9 puntos mas de mAP@50 que este checkpoint; las variantes RF-DETR destacan sobre todo en precision y recall (por encima del 70 %), muy por encima del 36,53 / 33,16 de este modelo. Los recuentos de parametros, licencias y disponibilidad de los modelos comparados no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: 28,85 % de mAP@50 y 16,48 % de mAP@50-95 sobre el test de UAVDT. No es un modelo apto para produccion critica sin un ajuste adicional o sin una validacion exhaustiva en el dominio objetivo.
- Desequilibrio severo entre clases: la clase car alcanza 71,51 de mAP@50, mientras que truck se queda en 4,86 y bus en 10,19. El modelo es practicamente inutil para camiones y autobuses en su estado actual.
- Riesgo elevado de falsos positivos y falsos negativos: la precision (36,53 %) y el recall (33,16 %) son bajos, de modo que cabe esperar tanto detecciones incorrectas como vehiculos no detectados.
- Metricas no verificadas: los cuatro valores del model-index figuran con `verified: false`; han sido declarados por el autor y no han sido reproducidos de forma independiente en la informacion disponible.
- Dominio restringido: entrenado exclusivamente sobre UAVDT (imagenes aereas de trafico de dron). Es previsible una degradacion acusada fuera de ese dominio: altura de vuelo, sensor, iluminacion, geografia o tipo de via distintos.
- Sin informacion sobre sesgos: la model card no documenta sesgos demograficos ni geograficos, ni la composicion del dataset mas alla de las tres clases. No hay datos para evaluar su comportamiento en distintos paises, condiciones meteorologicas u horas del dia.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el codigo fuente de las obras derivadas y de los sistemas que ofrezcan el software como servicio en red. Conviene revisar las implicaciones con el departamento juridico antes de integrarlo en un producto propietario. Ademas, la licencia del checkpoint base Ultralytics/YOLOv10 puede anadir condiciones propias.
- Estado del repositorio: 0 descargas, 0 likes y un tamano declarado de 0,0 GB. Es necesario comprobar que los pesos estan realmente alojados en el repositorio antes de planificar cualquier despliegue; la model card solo incluye instrucciones de instalacion de dependencias y no muestra el codigo de descarga completo.
- Documentacion incompleta: no se especifican cuantizaciones soportadas, formatos de pesos disponibles, hiperparametros de entrenamiento, numero de epocas ni detalles del split. La ausencia de esta informacion dificulta la reproducibilidad fuera de DetectionBench.
- Sin soporte de texto ni de tool calling: no es un modelo de lenguaje, por lo que no puede emplearse en tareas de generacion, razonamiento, agentes o function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-yolov10s
- Dataset UAVDT en Hugging Face: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Checkpoint base: https://huggingface.co/Ultralytics/YOLOv10
- Identificadores arXiv incluidos en las etiquetas del repositorio: arXiv:1804.00518, arXiv:2405.14458, arXiv:2511.09554, arXiv:2304.07193, arXiv:2410.17725, arXiv:2606.03748, arXiv:2402.13616
- Recursos graficos citados en la model card (relativos al repositorio del modelo): BoxPR_curve.png, BoxF1_curve.png, confusion_matrix.png, confusion_matrix_normalized.png, assets/demo_banner.mp4, assets/demo_banner_poster.jpg (accesibles bajo https://huggingface.co/dronefreak/uavdt-yolov10s/resolve/main/)
