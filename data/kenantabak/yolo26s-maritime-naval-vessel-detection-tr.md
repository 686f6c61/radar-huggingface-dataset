# kenantabak/yolo26s-maritime-naval-vessel-detection-tr

## Resumen

`yolo26s-maritime-naval-vessel-detection-tr` es un modelo de deteccion de objetos entrenado por Kenan Tabak sobre la arquitectura `yolo26s` (Ultralytics YOLO26 Small), publicado en la plataforma EVREN. Su tarea es la deteccion en tiempo real de buques y plataformas navales militares en imagenes de vigilancia maritima, con una unica clase de salida. El modelo se distribuye con pesos PyTorch de 19,34 MB y se integra directamente en la libreria `ultralytics`.

El modelo se presenta como parte de un portafolio de 126 modelos en produccion y 328 conjuntos de datos turcos de vision por computador, e incluye soporte declarado para turco e ingles en su documentacion. Su relevancia practica radica en la combinacion de un tamano reducido (variante "small") con metricas de validacion muy altas sobre el conjunto de datos propietario del autor, lo que lo hace candidato a despliegues de inferencia en tiempo real sobre hardware modesto.

No se dispone de informacion publica sobre el numero de parametros, la composicion exacta del dataset de entrenamiento ni el proceso de anotacion. Las metricas declaradas no estan verificadas de forma independiente (`verified: false` en el model-index).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `yolo26s` (Ultralytics YOLO26 Small), detector de objetos tipo YOLO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a deteccion de objetos; entrada por imagen, `imgsz=640` por defecto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch; no se documentan variantes INT8/FP16/GGUF) |
| Idiomas soportados | tr, en (etiquetas y documentacion; el modelo no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`best.pt`, `yolo26s-maritime-naval-vessel-detection-tr.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26 en su variante Small, una familia de detectores de una sola etapa orientada a inferencia en tiempo real. La model card no detalla la estructura interna (backbone, neck, cabeza de deteccion) ni innovaciones especificas de la version 26 respecto a generaciones anteriores. La salida es de una unica clase, correspondiente a buque o plataforma naval, segun el conjunto de datos `Denizcilik Gemi ve Savaş Gemisi Tespiti (1 Sınıf)` en su version `v1.0`.

El entrenamiento se realizo en la plataforma EVREN con un coste declarado de 0,0942 GPU-horas sobre una GPU NVIDIA H200 o A100. No se especifica el numero de imagenes, la resolucion de entrenamiento, el numero de epocas, el regimen de aumentacion de datos ni si se aplicaron tecnicas de destilacion o ajuste fino desde pesos preentrenados. Tampoco se documenta el proceso de anotacion del dataset ni su procedencia.

## Capacidades

- Deteccion de objetos en imagenes: localiza instancias de la clase unica "buque/plataforma naval" con cajas delimitadoras y puntuaciones de confianza.
- Inferencia en tiempo real: el tamano reducido de los pesos (19,34 MB) y la variante Small permiten procesamiento de video o flujos de camara con baja latencia.
- Parametros de inferencia ajustables: umbral de confianza (`conf`), umbral de IoU para NMS (`iou`) y resolucion de entrada (`imgsz`).
- Integracion con la API de Ultralytics: carga mediante `YOLO(...)` y prediccion con `model.predict(...)`.
- Exportacion potencial a otros formatos compatibles con Ultralytics (ONNX, TensorRT, etc.), aunque no se documenta ni se incluyen artefactos exportados en el repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural. No es un modelo multimodal ni generativo de texto.

## Casos de uso

- Vigilancia costera automatizada: procesar flujos de camaras fijas en puertos o litoral para detectar embarcaciones y generar alertas cuando aparezca una nueva instancia en el campo de vision, aprovechando la baja latencia de la variante Small.
- Monitorizacion de trafico maritimo desde drones: integrar el modelo en payloads de UAV con capacidad de computo limitada, ya que los pesos de 19 MB caben en memoria de dispositivos embebidos tipo Jetson.
- Analisis de imagenes satelitales o aereas: deteccion por lotes de buques en recortes de imagen de alta resolucion, con umbral de confianza ajustable para priorizar recall o precision segun el escenario.
- Apoyo a sistemas de conciencia situacional en defensa: capa de deteccion visual que alimenta un pipeline posterior de seguimiento (tracking) o clasificacion de contactos, sin sustituir sensores radar o AIS.
- Control de fronteras y aguas jurisdiccionales: filtrado automatico de imagenes capturadas por patrulleras o boyas para reducir la carga de revision manual por parte de operadores.
- Investigacion en vision por computador aplicada a dominio maritimo: modelo base para experimentos de comparacion de arquitecturas YOLO o para fine-tuning sobre datasets propios de otro tipo de embarcaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de validacion `Denizcilik Gemi ve Savaş Gemisi Tespiti (1 Sınıf)` (1 clase). No verificados de forma independiente.

| Metrica | Valor |
|---|---:|
| mAP@50 (%) | 99,23 |
| mAP@50-95 (%) | 80,85 |
| Precision (%) | 98,83 |
| Recall (%) | 98,59 |
| F1 (%) | 98,46 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con pesos de 19,34 MB en FP32, el modelo cabe holgadamente en cualquier GPU consumer; la memoria dominante sera la de las activaciones y el tamano de lote.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para inferencia a `imgsz=640` con lotes pequenos. El entrenamiento se realizo sobre H200 o A100, pero no es representativo del coste de inferencia.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores. Tambien es viable en CPU para inferencia de baja frecuencia y en dispositivos embebidos tipo Jetson.
- Opciones de despliegue: `ultralytics` (Python/CLI), exportacion a ONNX Runtime, TensorRT, OpenVINO o TFLite mediante las utilidades de Ultralytics. No se proporcionan artefactos preexportados.
- Latencia y throughput: no disponibles. No se publican mediciones de FPS ni de latencia por imagen.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia de categoria, el modelo se situa en el segmento de detectores YOLO de variante Small para dominio maritimo, con licencia CC-BY-4.0 y pesos exclusivamente PyTorch.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26s-maritime-naval-vessel-detection-tr | no disponible | no aplica | mAP@50 99,23 % (dataset propio) | CC-BY-4.0 | Hugging Face |
| Alternativas YOLO Small de dominio maritimo | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las metricas declaradas no estan verificadas de forma independiente y proceden de un unico conjunto de validacion controlado por el autor; el rendimiento en dominios reales (condiciones meteorologicas adversas, baja iluminacion, oclusiones) puede degradarse notablemente.
- El modelo tiene una unica clase: no distingue entre tipos de buque, ni entre embarcaciones civiles y militares, ni detecta otras clases de objetos.
- Sesgos desconocidos: no se documenta la composicion del dataset (origen geografico, tipos de buques, condiciones de captura), por lo que no es posible evaluar sesgos de dominio.
- Riesgo de falsos positivos en escenas con objetos de forma similar a un buque (estructuras flotantes, edificios costeros, reflejos).
- No se documenta el proceso de anotacion ni la calidad de las etiquetas del dataset de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribucion al autor. Es necesario revisar los terminos de la licencia de Ultralytics YOLO26 si se utiliza el codigo de la libreria en productos comerciales, ya que la licencia del modelo no cubre necesariamente la del framework.
- No se incluyen pesos en formatos optimizados (ONNX, TensorRT) ni scripts de exportacion; el despliegue en produccion requiere realizar la conversion.
- Uso en defensa: el modelo es una capa de deteccion visual y no debe emplearse como unico sistema de decision en contextos criticos; requiere validacion humana y redundancia con otros sensores.

## Enlaces

- Hugging Face: https://huggingface.co/kenantabak/yolo26s-maritime-naval-vessel-detection-tr
- Pagina del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/deniz-gozetiminde-savas-gemisi-tespiti
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/users/u19979974710e
- Catalogo de datasets de vision por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
