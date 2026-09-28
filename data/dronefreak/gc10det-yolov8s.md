# dronefreak/gc10det-yolov8s

## Resumen

El modelo `dronefreak/gc10det-yolov8s` es un detector de objetos YOLOv8s afinado sobre el conjunto de datos GC10-DET, un benchmark de defectos superficiales en superficies metalicas. Lo publica el usuario dronefreak (Saumya Saksena) como parte de DetectionBench, un framework que entrena y evalua distintos detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas, de modo que las comparaciones entre familias (YOLO, RF-DETR, etc.) sean reproducibles. El modelo base es Ultralytics/YOLOv8 y la libreria de inferencia es Ultralytics.

Se trata de un detector convolucional de una sola etapa con 11,2 millones de parametros y 28,6 GFLOPs a 640 px, entrenado para localizar y clasificar diez tipos de defecto industrial: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line. Su relevancia es practica: cubre el caso de uso de control de calidad automatizado en lineas de produccion de chapa metalica, un escenario donde los detectores ligeros desplegables en hardware modesto son mas utiles que los modelos generativos de gran tamano.

No es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto conversacional. Su entrada es una imagen (o un lote de imagenes) y su salida son cajas delimitadoras con clase y confianza. Los resultados declarados por el autor son mAP@50 de 72,54 %, mAP@50-95 de 37,79 %, precision de 78,54 % y recall de 65,23 % sobre el split de test de GC10-DET.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion de una etapa (familia YOLOv8, backbone CSP + cuello PAN-FPN + cabeza desacoplada anchor-free) |
| Parametros totales | 11,2 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, no secuencias de texto) |
| Tipos de cuantizacion | no especificados en la model card; al usar la libreria Ultralytics el modelo es exportable a FP16 e INT8 mediante el pipeline de exportacion de la propia libreria (ONNX, TensorRT, OpenVINO, TFLite, CoreML) |
| Idiomas soportados | no aplica; las etiquetas de clase estan en ingles y el dataset asociado declara idioma ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), descargable desde Hugging Face |
| Tarea (pipeline) | object-detection |
| FLOPs | 28,6 GFLOPs a 640 px |
| Dataset de entrenamiento | GC10-DET (10 clases de defecto superficial metalico) |
| Tamano del repositorio | 0,0 GB segun Hugging Face |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

YOLOv8s es un detector de una sola etapa con backbone basado en bloques convolucionales con conexiones residuales tipo CSP, un cuello de agregacion multi-escala PAN-FPN y una cabeza de deteccion desacoplada (ramas separadas para clasificacion y regresion de caja) de tipo anchor-free. El modelo resultante tiene 11,2 M de parametros y consume 28,6 GFLOPs por imagen a 640 px. La model card solo indica que se parte del checkpoint Ultralytics/YOLOv8 y se afina sobre GC10-DET; no detalla el numero de imagenes de entrenamiento vistas, el numero de epocas, el optimizador, la resolucion de entrenamiento distinta de la de evaluacion ni si hubo tecnicas de aumento de datos mas alla del pipeline estandar de Ultralytics. Tampoco se documenta ninguna innovacion arquitectonica propia: es un fine-tuning estandar sin modificaciones declaradas sobre la arquitectura original.

El interes tecnico no esta en la arquitectura sino en el protocolo de evaluacion. Segun DetectionBench, todos los modelos de su zoo se entrenan con la misma receta y se evaluan con el mismo pipeline (`detectionbench-evaluate`), de forma que las diferencias de mAP entre familias reflejan la arquitectura y no decisiones de ajuste. Las metricas de esta ficha se calculan sobre el split de test de GC10-DET. DetectionBench tambien perfila latencia, FPS, VRAM, parametros y FLOPs, aunque los valores concretos de ese perfilado no se han facilitado en la informacion disponible.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras con clase y puntuacion de confianza para las diez clases de defecto de GC10-DET.
- Clasificacion de defectos superficiales metalicos: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.
- Inferencia sobre imagen individual o por lotes mediante la API de Ultralytics (`model.predict(...)` sobre tensores, rutas de fichero o arrays).
- Exportacion a otros formatos de despliegue (ONNX, TensorRT, OpenVINO, CoreML, TFLite) usando el pipeline de Ultralytics, lo que permite ejecucion en GPU, CPU o aceleradores de borde.
- Ajuste fino adicional sobre datos propios, ya que el repositorio proporciona pesos en formato PyTorch entrenables.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidad agentica, vision-lenguaje, modo thinking, audio ni generacion de texto. No es un modelo multimodal generativo.

## Casos de uso

- Control de calidad en linea de produccion de chapa metalica: el modelo inspecciona cada imagen capturada por la camara de la linea y emite las cajas de los defectos presentes, permitiendo descartar o reclasificar piezas con un umbral de confianza configurable.
- Precribado en inspeccion manual: se procesan lotes completos de imagenes y solo se envian a revision humana las piezas donde el modelo detecta defectos con confianza alta o media, reduciendo la carga de los operarios.
- Auditoria retrospectiva de historico de fabricacion: dado que el modelo se ejecuta sobre imagenes estaticas, se puede reprocesar el archivo fotografico de una planta para buscar patrones de defectos por turno, lote o proveedor de materia prima.
- Integracion en sistemas MES/ERP como servicio de inferencia: el detector se expone como endpoint HTTP que recibe una imagen y devuelve un JSON con cajas, clases y confianzas, y el sistema de planta decide la accion sobre la pieza.
- Analitica de causas raiz: la metrica por clase permite identificar que defectos concretos (por ejemplo `inclusion` con mAP@50 de 26,1 %) dominan en un periodo, lo que orienta la revision de parametros de laminacion o de la materia prima.
- Despliegue en hardware de borde junto a la camara: al ser un modelo de 11,2 M de parametros exportable a formatos ligeros, cabe en dispositivos con recursos limitados y evita enviar imagenes a la nube, algo relevante por privacidad industrial y por latencia.
- Prototipado rapido y comparacion de detectores: sirve como linea base afinada sobre GC10-DET para evaluar si merece la pena cambiar a otro detector del zoo (RF-DETR Small o Medium, YOLO26s, YOLO11s) en una aplicacion concreta.
- Etiquetado asistido: el modelo puede preanotar grandes volumenes de imagenes de superficies metalicas y acelerar la construccion de datasets propios antes de un reentrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card, no verificados de forma independiente, medidos sobre el split de test de GC10-DET con el pipeline `detectionbench-evaluate`.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 72,54 |
| mAP@50-95 | 37,79 |
| Precision | 78,54 |
| Recall | 65,23 |
| F1 | 71,27 |

Rendimiento por clase declarado por el autor:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 42,08 | 20,01 |
| crescent_gap | 97,39 | 55,56 |
| inclusion | 26,10 | 7,08 |
| oil_spot | 54,88 | 23,11 |
| punching_hole | 89,64 | 51,20 |
| rolled_pit | 99,50 | 69,65 |
| silk_spot | 46,19 | 18,80 |
| waist_folding | 90,77 | 51,81 |
| water_spot | 90,79 | 55,12 |
| welding_line | 88,07 | 25,51 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB con lote de 1 a 640 px en FP32, y por debajo de 1 GB en FP16 o INT8 (estimacion derivada de los 11,2 M de parametros, que ocupan aproximadamente 45 MB en FP32 y 22 MB en FP16); no se han publicado mediciones de VRAM del autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El modelo cabe sin problemas en tarjetas de consumo como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090. En entornos de servidor, A100 o H100 solo tienen sentido para inferencia por lotes a gran escala o para reentrenamiento, no por requisitos de memoria.
- Ejecucion en CPU: viable, especialmente tras exportar a ONNX Runtime u OpenVINO, a costa de menor throughput.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en aceleradores de borde tipo Jetson o dispositivos con NPU tras exportar a TFLite o CoreML.
- Opciones de despliegue: API Python de Ultralytics (carga directa de `best.pt`), exportacion a ONNX Runtime, TensorRT, OpenVINO, CoreML o TFLite mediante `model.export()`, y servidores de inferencia genericos que acepten esos formatos. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo porque estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada. El proyecto DetectionBench declara perfilar latencia, FPS, VRAM, parametros y FLOPs por modelo, pero los valores concretos no se han facilitado.

## Comparativa con modelos similares

Comparativa con otros detectores afinados sobre el mismo GC10-DET dentro del zoo de DetectionBench, segun los datos declarados por el autor. Todos se entrenan con la misma receta y se evaluan con el mismo pipeline.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | 74,25 | 38,31 | 80,50 | 67,99 |
| YOLO26m | 73,97 | 36,94 | 75,70 | 68,19 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | 72,54 | 35,07 | 72,39 | 66,80 |
| YOLOv8s (este modelo) | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | 71,88 | 38,80 | 69,77 | 70,84 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 |

Diferencias de contexto y licencia: los modelos RF-DETR y YOLO26 pertenecen a familias con licencias propias que no se detallan en la informacion disponible; YOLOv8 y YOLO11 de Ultralytics se distribuyen bajo AGPL-3.0, la misma licencia que este fine-tuning. Los tamanos de parametros de los modelos comparables no se han facilitado para RF-DETR, YOLO26 ni YOLO11 en la informacion disponible.

## Limitaciones y advertencias

- Modelo de vision, no de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de categorizacion.
- Dominio muy restringido: solo detecta las diez clases de defecto de GC10-DET sobre superficies metalicas. Fuera de ese dominio su comportamiento no esta caracterizado.
- Rendimiento desigual por clase: `inclusion` (mAP@50 de 26,1 %, mAP@50-95 de 7,08) y `crease` (mAP@50 de 42,08) estan muy por debajo de `rolled_pit` (99,5) o `crescent_gap` (97,39). En produccion esto implica falsos negativos concentrados en las clases mas dificiles, que conviene compensar con umbrales mas bajos o revision humana dirigida.
- Recall moderado: el 65,23 % sobre el test split significa que aproximadamente uno de cada tres defectos presentes puede no detectarse con el umbral evaluado. Es un riesgo real en control de calidad.
- Riesgo de falsos positivos: la precision del 78,54 % implica que una parte de las detecciones no corresponde a defectos, lo que puede generar paradas de linea o descartes innecesarios si se actua sin umbral ni validacion.
- Metricas no verificadas: los valores del model-index estan marcados como no verificados (`verified: false`) y provienen del propio autor. No hay evaluacion independiente ni replicacion publicada.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Su uso en un servicio accesible por red obliga, segun la interpretacion habitual de la AGPL, a ofrecer el codigo fuente correspondiente a los usuarios del servicio. Para integracion en productos propietarios cerrados es necesario un analisis juridico o una licencia comercial alternativa de Ultralytics.
- Sesgos de datos: el conjunto GC10-DET procede de un contexto industrial concreto (laminacion de acero). Condiciones de iluminacion, camara, acabado superficial o materiales distintos pueden degradar el rendimiento de forma no documentada.
- Sin informacion sobre robustez: no se documentan pruebas frente a oclusiones, cambios de iluminacion, imagenes de baja resolucion ni desbalanceo de clases.
- Repositorio con 0 descargas y 0 likes: el modelo apenas tiene uso registrado, por lo que no existe retroalimentacion de la comunidad sobre su comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gc10det-yolov8s
- Dataset GC10-DET en Hugging Face: https://huggingface.co/datasets/dronefreak/GC10-DET
- Ficheros del dataset: https://huggingface.co/datasets/dronefreak/GC10-DET/tree/main
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Perfil del autor en Hugging Face: https://huggingface.co/dronefreak
- Repositorio dji-tello-object-detection-segmentation del mismo autor: https://github.com/dronefreak/dji-tello-object-detection-segmentation/tree/master
- Pagina de los modelos YOLOv8 de Ultralytics: https://platform.ultralytics.com/ultralytics/yolov8
- arXiv 2511.09554 (referencia citada en las etiquetas del modelo): https://arxiv.org/abs/2511.09554
- arXiv 2304.07193 (referencia citada en las etiquetas del modelo): https://arxiv.org/abs/2304.07193
- arXiv 2410.17725 (referencia citada en las etiquetas del modelo): https://arxiv.org/abs/2410.17725
- arXiv 2606.03748 (referencia citada en las etiquetas del modelo): https://arxiv.org/abs/2606.03748
