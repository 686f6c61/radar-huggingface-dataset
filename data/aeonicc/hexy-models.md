# Aeonicc/hexy-models

## Resumen

Aeonicc/hexy-models es un repositorio de pesos de deteccion de objetos publicado en HuggingFace por el usuario Aeonicc, no un modelo de lenguaje. Contiene un unico detector D-FINE-S entrenado sobre el conjunto Objects365 (365 clases) y convertido a formato MNN en fp16 para su ejecucion en dispositivos moviles. El fichero principal, dfine_s_o365.mnn, ocupa 21.868.392 bytes y va acompanado de labels.txt, que mapea el indice de cada canal de salida con el identificador de clase (el indice 0 corresponde a "None"). El modelo se integra en el proyecto "Hexy (ix64)", desde cuyo script model_fetch.gd se descargan los pesos de forma perezosa en el telefono.

La relevancia del paquete es practica: empaqueta un detector de la familia DETR en un runtime pensado para movil (MNN, de Alibaba) con cuantizacion fp16 y un grafo de entrada ya fijado, de modo que un desarrollador puede desplegar deteccion de 365 categorias en un telefono sin servidor ni GPU. La entrada esta normalizada de forma explicita (imagenes RGB en rango [0,1], tensor 1x3x640x640, sin media ni desviacion estandar) y la salida son 300 cajas y 300 vectores de logits pre-sigmoide de 366 canales, con las cajas en formato cxcywh normalizado.

El repositorio es muy reciente y sin traccion: cero descargas y cero "likes" en el momento de la consulta, sin resultados de evaluacion publicados y sin model card mas alla de la tabla de ficheros y su procedencia. La licencia declarada es Apache-2.0, heredada del checkpoint original de Peterande/D-FINE, y el repo reporta un tamano de 0.0 GB, coherente con una descarga perezosa de los pesos en tiempo de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE-S (familia DETR de deteccion en tiempo real con refinamiento de distribucion; el repositorio no detalla el backbone ni la configuracion exacta) |
| Parametros totales | No disponible en la informacion proporcionada. El fichero fp16 ocupa 21.868.392 bytes, lo que sugiere del orden de 10-11 M de parametros si todo el fichero esta en fp16 (estimacion propia, no confirmada por el autor) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica: no es un modelo generativo. Entrada fija de imagen, tensor images 1x3x640x640 |
| Tipos de cuantizacion | fp16 (MNN). El repositorio no publica variantes int8, int4 ni pesos sin cuantizar |
| Idiomas soportados | No aplica (modelo de vision). El repositorio no declara idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (.mnn), mas labels.txt (3255 bytes) con la tabla de etiquetas |
| Tarea (pipeline) | object-detection |
| Numero de clases | 365 clases de Objects365; labels.txt incluye el indice 0 como "None", lo que da 366 entradas coherentes con los 366 canales de logits |
| Entrada | images, RGB en [0,1], forma 1x3x640x640, sin media ni desviacion estandar |
| Salida | logits [1,300,366] pre-sigmoide; boxes [1,300,4] en cxcywh normalizado |
| Detecciones maximas | 300 por imagen |
| Tamano de los pesos | 21.868.392 bytes (aproximadamente 20,9 MiB) |
| Huella del repositorio | 0.0 GB reportados por HuggingFace (los pesos se descargan aparte) |
| Fecha de publicacion | Creado y actualizado el 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un D-FINE-S, convertido por el script tools/convert_dfine.py a partir del checkpoint dfine_s_obj365.pth del repositorio Peterande/D-FINE, publicado bajo Apache-2.0. D-FINE pertenece a la estirpe de detectores DETR en tiempo real y su aportacion principal, segun la descripcion del proyecto upstream referenciado, es reformular la tarea de regresion de cajas como un refinamiento fino de distribuciones, en lugar de predecir directamente un unico conjunto de coordenadas. Se trata de un modelo denso (no MoE y no SSM) con un codificador de imagenes y un decodificador de consultas, que produce un conjunto fijo de detecciones sin necesidad de anclas.

El entrenamiento se realizo sobre Objects365, un corpus de imagenes web anotadas con 365 categorias de objetos, lo que explica la dimension de la cabeza de clasificacion (366 canales, incluyendo la etiqueta "None" en el indice 0). El repositorio no aporta informacion sobre el numero de tokens o imagenes vistas, la composicion exacta del dataset, el calendario de aprendizaje, las tecnicas de aumento de datos ni si hubo fases de refinamiento posteriores; tampoco aplica RLHF ni DPO, ya que no es un modelo de lenguaje. La innovacion practica de esta publicacion no esta en el entrenamiento, que es el del checkpoint upstream, sino en la conversion: el grafo se exporta a MNN en fp16 para inferencia en telefono, con una interfaz de entrada y salida ya fijada y documentada.

## Capacidades

- Deteccion de objetos en 365 categorias del taxon de Objects365, con salida de 300 detecciones por imagen y cajas en formato cxcywh normalizado.
- Inferencia en dispositivo (on-device) mediante el runtime MNN, orientada a Android, iOS y otras plataformas soportadas por MNN, sin necesidad de GPU dedicada ni de conexion permanente a un servidor.
- Descarga perezosa de pesos: el proyecto anfitrion (Hexy, ix64) obtiene los ficheros en tiempo de ejecucion desde model_fetch.gd.
- Integracion sencilla por contrato de entrada/salida: tensor RGB normalizado a [0,1] de 640x640 y dos tensores de salida predecibles.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No tiene modo "thinking", entrada de audio ni capacidad vision-lenguaje.

## Casos de uso

- Deteccion de objetos en aplicaciones moviles con privacidad por diseno: al ejecutarse con MNN en el propio telefono, las imagenes no salen del dispositivo, lo que encaja en apps de fotografia o mensajeria donde subir contenido a un servidor no es aceptable.
- Realidad aumentada y filtros en tiempo real: con entrada fija de 640x640 y 365 clases, el modelo puede alimentar una capa de superposicion que dibuje etiquetas o efectos sobre objetos reconocidos en la camara, sin coste de servidor por fotograma.
- Etiquetado automatico de galerias fotograficas: las 365 categorias permiten clasificar y agrupar imagenes por tipo de objeto en el propio dispositivo, generando metadatos de busqueda sin conexion.
- Preanotacion de datasets para entrenamiento: el modelo puede actuar como anotador inicial en pipelines de etiquetado, dejando al humano solo la correccion de cajas, gracias a su vocabulario amplio de 365 clases y a la salida normalizada lista para exportar.
- Vision para robotica ligera o drones de bajo consumo: 21,9 MB de pesos y una entrada de 640x640 encajan en plataformas embebidas con ARM y poca memoria, donde un detector DETR mas pesado no cabria.
- Control de inventario o conteo de articulos en comercio: la taxonomia de Objects365 cubre categorias de productos y objetos cotidianos, lo que permite contar y localizar elementos en una estanteria a partir de una foto tomada con el movil.
- Moderacion o filtrado previo en el borde: el detector puede marcar regiones de interes en el dispositivo y enviar solo esas regiones o sus etiquetas a un servicio posterior, reduciendo ancho de banda y coste.
- Asistencia a la accesibilidad: descripcion de escenas mediante la lista de objetos detectados y sus posiciones, util en apps que verbalizan el entorno para personas con discapacidad visual (requiere una capa de texto a texto externa, ya que este modelo no genera lenguaje).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de precision (AP, AP50, AP75), no aporta cifras de latencia ni de throughput, y no se acompana de una evaluacion sobre el conjunto de validacion de Objects365 o COCO. Tampoco hay comparaciones con el checkpoint original dfine_s_obj365.pth en PyTorch, por lo que se desconoce la perdida de precision introducida por la conversion a MNN fp16.

## Requisitos de hardware

- Peso en disco: 21,9 MB para el fichero .mnn, mas 3,2 KB para labels.txt; el modelo completo cabe en cualquier telefono actual.
- VRAM de inferencia: no aplica en el sentido de GPU de escritorio; la memoria residente en un dispositivo movil se estima en el rango de las decenas o pocos cientos de megabytes contando runtime, buffers de activaciones y la imagen de 640x640 (estimacion propia; el autor no publica cifras).
- GPU recomendadas: no se especifican. El destino declarado es el telefono, donde MNN puede usar CPU (ARM con NEON) o GPU integrada mediante OpenCL o Vulkan. En escritorio podria ejecutarse en cualquier GPU, pero no hay configuracion publicada.
- Cabe en GPU de consumo: si, con enorme margen; incluso cabe en CPU de movil, que es el objetivo real del paquete.
- Opciones de despliegue: MNN (Android, iOS, Linux, Windows, macOS), con bindings de C++ y Python. No es compatible con vLLM, TGI, llama.cpp ni Ollama, que son runtimes para modelos de lenguaje. Para otros runtimes (ONNX Runtime, TensorRT, Core ML, TFLite) habria que reconvertir desde el checkpoint PyTorch original, algo que el repositorio no documenta.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisito de preprocesado: hay que replicar exactamente la normalizacion indicada (RGB en [0,1], sin media ni desviacion estandar) y la resolucion de 640x640; cualquier desviacion degrada las detecciones sin aviso del modelo.

## Comparativa con modelos similares

| Modelo | Formato | Clases | Licencia | Orientacion | Metricas publicadas |
|---|---|---|---|---|---|
| Aeonicc/hexy-models (D-FINE-S Objects365, MNN) | MNN fp16 | 365 (Objects365) | Apache-2.0 | Movil y borde | No disponibles |
| Peterande/D-FINE, checkpoint dfine_s_obj365.pth | PyTorch (.pth) | 365 (Objects365) | Apache-2.0 | Servidor y GPU | No disponibles en esta informacion |
| D-FINE en configuraciones N, M, L y X | PyTorch (.pth) | Segun checkpoint (COCO u Objects365) | Apache-2.0 | Servidor y GPU | No disponibles en esta informacion |
| Detector tipo YOLO (por ejemplo, familia Ultralytics YOLOv8) | PyTorch, ONNX, TFLite | Segun checkpoint (COCO, 80 clases por defecto) | AGPL-3.0 en la version abierta, licencia comercial aparte | Servidor, escritorio y movil | No disponibles en esta informacion |
| RT-DETR | PyTorch, PaddlePaddle | Segun checkpoint (COCO, 80 clases) | Apache-2.0 | Servidor y borde | No disponibles en esta informacion |

La comparacion cuantitativa no es posible con los datos aportados: no hay cifras de parametros, AP ni latencia para este paquete ni para las alternativas dentro de la informacion disponible. La diferencia estructural es clara: este repositorio entrega un unico artefacto ya convertido a MNN fp16 con contrato de entrada y salida documentado, mientras que los demas se distribuyen como pesos de entrenamiento en PyTorch y exigen un paso de exportacion propio. Ademas, su vocabulario de 365 clases es mas amplio que el de 80 clases de los checkpoints COCO habituales, a costa de depender de la taxonomia de Objects365.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas y no soporta tool calling ni agentes. Cualquier descripcion de este repositorio como "modelo de IA" debe entenderse estrictamente como detector de objetos.
- Ausencia total de evaluacion: cero descargas, cero "likes", sin metricas de AP ni de latencia, y sin comparacion con el checkpoint original. No hay evidencia publicada de que la conversion a MNN conserve la precision.
- Taxonomia cerrada: solo reconoce las 365 categorias de Objects365. Los objetos fuera de esa lista no se detectaran o se confundiran con una clase cercana. El indice 0 de labels.txt es "None" y debe tratarse como fondo o descarte.
- Post-procesado no documentado: los logits son pre-sigmoide y las cajas son cxcywh normalizado, pero la model card no indica el umbral de confianza recomendado, si se debe aplicar supresion de no maximos ni como filtrar las 300 consultas. Es un punto de fallo habitual al integrar el modelo.
- Sesgos del corpus: Objects365 esta construido con imagenes web, por lo que hereda sus sesgos de representacion geografica, cultural y de frecuencia de clases. No hay analisis de sesgos publicado para este paquete.
- Riesgo de falsos positivos y de calibracion de confianza: sin umbrales verificados, es facil producir detecciones espurias en imagenes con fondo complejo.
- Restricciones de licencia: los pesos se declaran Apache-2.0, en linea con el proyecto upstream D-FINE. Conviene revisar por separado las condiciones de uso del conjunto Objects365, ya que las licencias del dataset y del modelo pueden no coincidir para uso comercial.
- Ambiguedad de empaquetado: HuggingFace reporta 0.0 GB de repositorio mientras la model card describe un fichero de 21,9 MB, lo que confirma que los pesos se obtienen por descarga perezosa desde la aplicacion anfitriona y no estan necesariamente incluidos en el arbol del repositorio. Cualquier integracion debe prever esa descarga y su verificacion por sha256.
- Dependencia de un proyecto concreto: el unico consumidor documentado es el juego o aplicacion "Hexy (ix64)" a traves de model_fetch.gd, un detalle propio de Godot, lo que limita la documentacion de uso independiente.
- Fechas de publicacion poco habituales (23 de septiembre de 2026) tal y como las reporta el repositorio; conviene verificarlas antes de citarlas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Aeonicc/hexy-models
- Proyecto upstream D-FINE (checkpoint dfine_s_obj365.pth, Apache-2.0): https://github.com/Peterande/D-FINE
- Runtime MNN de Alibaba, necesario para cargar el fichero .mnn: https://github.com/alibaba/MNN
- Conjunto de datos Objects365 (365 clases): https://www.objects365.org/
- Paper de D-FINE: referenciado desde el repositorio de GitHub anterior; no se proporciona el identificador en la informacion disponible
- Demo en linea y blog del proyecto Hexy (ix64): no disponibles en la informacion proporcionada
