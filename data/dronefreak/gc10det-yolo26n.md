# dronefreak/gc10det-yolo26n

## Resumen

gc10det-yolo26n es un detector de objetos de la familia YOLO26 de Ultralytics, en su variante nano, ajustado por el usuario dronefreak (Saumya Saksena) sobre el conjunto de datos GC10-DET. El modelo está especializado en la detección de defectos superficiales en superficies metálicas, una tarea propia de la inspección industrial y el control de calidad en fabricación. Su salida no es texto, sino cajas delimitadoras con clase y confianza sobre imágenes.

El modelo resuelve un problema muy concreto: localizar de forma automática diez tipos de defectos (crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line) en entornos de producción. Con 2,6 millones de parámetros y 6,1 GFLOPs a 640 px, está pensado para inferencia en tiempo real y despliegue en hardware modesto, incluidos dispositivos de borde.

Su relevancia es doble. Por un lado, forma parte de DetectionBench, un marco de trabajo que entrena y evalúa distintos detectores con recetas idénticas para permitir comparaciones reproducibles entre arquitecturas (YOLO26, YOLO11, YOLOv8 y RF-DETR) sobre el mismo dataset. Por otro, la licencia AGPL-3.0 y el tamaño reducido lo convierten en una pieza interesante para pipelines de inspección de bajo coste, siempre que se respeten las obligaciones de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion de objetos en una etapa, familia Ultralytics YOLO26, variante nano (n) |
| Parametros totales | 2,6 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen, tipicamente 640x640 px) |
| Tipos de cuantizacion | No especificados por el autor; exportable a formatos que admiten cuantizacion (ONNX, TensorRT, TFLite, OpenVINO) |
| Idiomas soportados | No aplica (modelo de deteccion de objetos, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`); exportable a ONNX, TensorRT, CoreML, TFLite |
| Framework | Ultralytics |
| Dataset de entrenamiento | GC10-DET (`dronefreak/GC10-DET`) |
| Modelo base | Ultralytics/YOLO26 |
| FLOPs | 6,1 G a 640 px |

## Arquitectura y entrenamiento

YOLO26 es la generacion de modelos de vision de Ultralytics orientada a inferencia en tiempo real y extremo a extremo. Esta ficha corresponde a la variante nano, con 2,6 M de parametros. El modelo se ha obtenido por ajuste fino (finetune) del checkpoint base Ultralytics/YOLO26, por lo que hereda la arquitectura del detector original y solo se ha reentrenado la cabeza y el resto de la red sobre el dominio de defectos metalicos.

El entrenamiento y la evaluacion se han realizado dentro del marco DetectionBench, que aplica recetas de entrenamiento y metricas de evaluacion identicas a todos los detectores que compara. La evaluacion reportada se calcula sobre el split de test de GC10-DET mediante el pipeline estandar del proyecto (`detectionbench-evaluate`). No se detallan en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, la resolucion de entrenamiento, el numero de epocas, el optimizador ni si hubo tecnicas de aumento de datos o ajuste por refuerzo, por lo que esos datos se consideran no disponibles.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras con clase y puntuacion de confianza para diez clases de defectos superficiales.
- Clases soportadas: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.
- Inferencia en tiempo real gracias a su tamano reducido (2,6 M de parametros, 6,1 GFLOPs a 640 px).
- Despliegue en dispositivos de borde: el modelo es exportable a formatos ligeros y existe soporte de la familia YOLO26 en toolkits de microcontroladores (por ejemplo, el model zoo de STMicroelectronics).
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No incorpora vision-lenguaje, audio ni modo de pensamiento; es exclusivamente un detector de objetos.

## Casos de uso

- Control de calidad en linea de produccion: el modelo inspecciona cada pieza metalica a la salida de la linea y marca defectos como rolled_pit, punching_hole o welding_line antes del empaquetado, con latencia compatible con cadenas de alta cadencia.
- Inspeccion de superficies de acero laminado: deteccion de marcas de laminacion (rolled_pit, crease, waist_folding) sobre bobinas y chapas, permitiendo clasificar el material y descartar lotes defectuosos.
- Clasificacion automatica de defectos en auditoria de proveedores: el detector etiqueta cada defecto con su clase, lo que permite generar informes cuantitativos de no conformidad por tipo y frecuencia.
- Integracion en sistemas de vision existentes: al ser exportable a ONNX, TensorRT o TFLite, puede incrustarse en camaras inteligentes o PLC con vision sin depender de un servidor GPU.
- Despliegue en dispositivos de bajo consumo: con 2,6 M de parametros cabe en placas tipo Raspberry Pi, Jetson Nano o microcontroladores con aceleracion, lo que habilita inspeccion distribuida en varias estaciones de la planta.
- Generacion de datasets etiquetados: el modelo puede preetiquetar grandes volumenes de imagenes industriales para revision humana posterior, reduciendo el coste de anotacion.
- Monitorizacion remota de flotas de produccion: al ejecutarse en el borde, permite enviar solo eventos de defecto al backend central, ahorrando ancho de banda en plantas con conectividad limitada.
- Investigacion comparativa de detectores: sirve como punto de referencia reproducible dentro de DetectionBench para medir el efecto de la arquitectura y del tamano del modelo sobre GC10-DET.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de GC10-DET (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 74,25 |
| mAP@50-95 | 38,31 |
| Precision | 80,5 |
| Recall | 67,99 |
| F1 | 73,71 |

Rendimiento por clase sobre GC10-DET (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 28,1 | 9,79 |
| crescent_gap | 98,26 | 62,42 |
| inclusion | 34,08 | 9,78 |
| oil_spot | 49,98 | 21,25 |
| punching_hole | 90,71 | 47,01 |
| rolled_pit | 99,5 | 59,7 |
| silk_spot | 61,07 | 24,27 |
| waist_folding | 93,67 | 46,43 |
| water_spot | 93,72 | 55,46 |
| welding_line | 93,39 | 46,96 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo pesa del orden de pocos megabytes, por lo que practicamente cualquier GPU con 2 GB o mas es suficiente.
- GPU recomendadas: cualquier GPU moderna sirve; para maximizar throughput, una NVIDIA RTX 3060/4090, A100 o H100 con TensorRT ofrecen margen sobrado para procesar multiples flujos de video en paralelo.
- GPU de consumo: si, cabe con enorme holgura en cualquier GPU de consumo, e incluso en GPUs integradas.
- CPU: la inferencia en CPU es viable en tiempo real gracias al reducido coste computacional (6,1 GFLOPs a 640 px).
- Dispositivos de borde: apto para Raspberry Pi, Jetson (Nano, Orin), Google Coral y microcontroladores con soporte de la familia YOLO26.
- Opciones de despliegue: Ultralytics (Python), ONNX Runtime, TensorRT, TFLite, OpenVINO, CoreML; no se ha confirmado soporte especifico de vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de vision.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa sobre el mismo dataset GC10-DET y con el mismo protocolo de evaluacion (datos declarados por el autor del modelo):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n (este modelo) | 74,25 | 38,31 | 80,5 | 67,99 |
| YOLO26m | 73,97 | 36,94 | 75,7 | 68,19 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | 72,54 | 35,07 | 72,39 | 66,8 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | 71,88 | 38,8 | 69,77 | 70,84 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 |

En terminos de mAP@50, la variante nano de YOLO26 se situa por delante de todas las variantes de YOLO11 y YOLOv8 evaluadas, y por detras de RF-DETR Small, RF-DETR Medium y YOLO26s. No se dispone del numero de parametros de las alternativas RF-DETR en la informacion proporcionada, por lo que la comparacion de eficiencia por parametro no puede completarse.

## Limitaciones y advertencias

- Modelo de dominio especifico: solo detecta las diez clases de GC10-DET. Fuera de ese dominio (otros materiales, otras clases de defecto, imagenes naturales) el rendimiento no esta garantizado.
- Clases con rendimiento muy bajo: crease (mAP@50 28,1) e inclusion (34,08) son especialmente debiles, lo que limita su uso en inspeccion critica de esos defectos sin revision humana.
- Recall moderado (67,99): aproximadamente un tercio de los defectos reales pueden no detectarse; conviene calibrar el umbral de confianza segun el coste de los falsos negativos en cada planta.
- Precision de 80,5: existe un porcentaje apreciable de falsos positivos que puede generar alertas innecesarias en produccion si no se filtra aguas abajo.
- Sesgos: no hay informacion disponible sobre la distribucion del dataset, la procedencia de las imagenes ni posibles sesgos por tipo de superficie, iluminacion o camara, lo que impide evaluar su robustez en condiciones distintas a las de entrenamiento.
- Riesgo de generalizacion limitada: al ser un finetune de una variante nano sobre un unico dataset, la variabilidad de condiciones industriales reales (iluminacion, angulo, suciedad) puede degradar las metricas reportadas, que se han medido en el split de test del propio dataset.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Si el modelo se ofrece como servicio a traves de una red o se distribuye integrado en un producto, existen obligaciones de liberar el codigo fuente correspondiente. Para uso comercial cerrado conviene revisar la licencia con asesoria legal o plantearse una licencia comercial de Ultralytics.
- Metricas no verificadas: todos los resultados proceden del autor y estan marcados como no verificados en el model-index, por lo que no han pasado una evaluacion independiente.
- Estados de integracion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion conocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/gc10det-yolo26n
- Dataset GC10-DET: https://huggingface.co/datasets/dronefreak/GC10-DET
- DetectionBench (repositorio y evaluacion): https://github.com/dronefreak/DetectionBench
- Perfil del autor: https://huggingface.co/dronefreak
- Documentacion de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
- Repositorio Ultralytics YOLO26: https://github.com/ultralytics/yolo26
- Model zoo de STMicroelectronics para yolo26n: https://github.com/STMicroelectronics/stm32ai-modelzoo/blob/main/object_detection/yolo26n/README.md
- Otro modelo del mismo autor: https://huggingface.co/dronefreak/brackish-yolo26n
- Referencias arXiv citadas en las etiquetas del modelo: arXiv:2606.03748, arXiv:2511.09554, arXiv:2304.07193, arXiv:2410.17725 (no se detalla en la informacion disponible a que corresponde cada una)
