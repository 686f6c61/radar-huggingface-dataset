# devyansh99/sadakvision-weights

## Resumen

SadakVision Weights es un repositorio de pesos entrenados para la deteccion de defectos de la calzada y residuos en vias de la India. El autor, devyansh99, publica en HuggingFace un conjunto de cinco ficheros de pesos correspondientes a cuatro modelos de deteccion de objetos distintos: dos variantes de YOLOv8m, una de YOLOv11n, una denominada yolo26m en la model card y un checkpoint de RF-DETR. La tarea cubre cuatro clases: grieta (crack), basura (garbage), alcantarilla (manhole) y bache (pothole).

El problema que aborda es el mantenimiento predictivo de infraestructura viaria: identificar automaticamente defectos del asfalto y elementos de saneamiento a partir de imagenes, un caso de uso habitual en sistemas de inspeccion municipal y en plataformas de reporte ciudadano. El repositorio no incluye un modelo unico, sino una comparativa de arquitecturas de deteccion de objetos entrenadas sobre el mismo dataset, lo que lo hace util como referencia de seleccion entre modelos ligeros y modelos de mayor capacidad.

El repositorio ocupa 0,3 GB y se publica bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. No se documenta tamano de parametros, idiomas ni tipos de cuantizacion. El modelo de mayor calidad reportado por el autor es YOLOv8m, con mAP50 de 0,773 en validacion y 0,742 en test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deteccion de objetos. YOLOv8m, YOLOv11n y yolo26m (familia YOLO, detector de una etapa); RF-DETR (detector basado en transformer, familia DETR) |
| Parametros totales | no disponible (el autor no publica el recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (Ultralytics/YOLO) y `.pth` (RF-DETR, `checkpoint_best_total.pth` sin estado del optimizador) |

Ficheros incluidos:

| Fichero | Modelo | Tamano |
|---|---|---|
| `yolov8m_100e_best.pt` | YOLOv8m, 100 epocas, imgsz 640, batch 32 | 49,6 MB |
| `yolov8m_runs_best.pt` | YOLOv8m (`pothole_yolov8m`) | 49,6 MB |
| `yolo26m_best.pt` | yolo26m, 100 epocas, batch 16 | 42 MB |
| `yolov11n_best.pt` | YOLOv11n, 100 epocas, imgsz 512, batch 64 | 5,2 MB |
| `rfdetr_best.pth` | RF-DETR | 127,6 MB |

## Arquitectura y entrenamiento

El repositorio agrupa dos familias arquitectonicas. Por un lado, tres detectores YOLO de una etapa, con extraccion de caracteristicas convolucional y prediccion directa de cajas y clases sin etapa de propuesta regional: YOLOv8m (variante media), YOLOv11n (variante nano) y un modelo que el autor etiqueta como yolo26m. Por otro, RF-DETR, un detector basado en transformer que emplea atencion sobre las caracteristicas de imagen y un mecanismo de consultas aprendidas para predecir objetos, propio de la familia DETR. Los pesos de RF-DETR corresponden al checkpoint `checkpoint_best_total.pth` y no incluyen estado del optimizador, por lo que estan pensados para inferencia o reanudacion de fine-tuning, no para reanudar el entrenamiento completo.

El entrenamiento se realizo sobre el dataset `Merged_Final_Data` alojado en Roboflow (`app.roboflow.com/ai-lisrp/merged_final_data`), en formato YOLO y con particiones de entrenamiento, validacion y test. Las cuatro clases anotadas son crack, garbage, manhole y pothole. Se documentan los hiperparametros principales de las variantes YOLO (100 epocas en los tres casos; imgsz 640 y batch 32 para YOLOv8m, imgsz 512 y batch 64 para YOLOv11n, batch 16 para yolo26m), pero no se detalla el numero total de imagenes, la composicion del dataset, el uso de aumentacion de datos ni si hubo etapas de ajuste fino adicionales. Tampoco se documenta el proceso de entrenamiento de RF-DETR ni su resultado numerico.

## Capacidades

- Deteccion de objetos en imagenes con cuatro clases especificas: grietas en la calzada, basura o residuos, alcantarillas y baches.
- Prediccion de cajas delimitadoras con puntuacion de confianza por clase, apta para pipelines de vision clasicos (NMS incluido en el postprocesado de las variantes YOLO).
- Inferencia en imagenes individuales y, al usar Ultralytics, tambien sobre video, carpetas de imagenes y streams, aunque esto ultimo no se documenta explicitamente en la model card.
- Despliegue en cinco variantes con distintos compromisos de precision y coste computacional, desde un modelo nano de 5,2 MB hasta un RF-DETR de 127,6 MB.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues ni procesamiento de texto, audio u otras modalidades fuera de la imagen.
- No se documenta modo de razonamiento extendido, salida estructurada en texto ni capacidades de segmentacion o estimacion de profundidad.

## Casos de uso

- Inspeccion municipal de firmes: procesar imagenes capturadas por vehiculos de reconocimiento para localizar baches y grietas, y priorizar las reparaciones por gravedad y densidad de defectos. YOLOv8m, con mAP50 de 0,773 en validacion, es la variante con mejor equilibrio precision-coste para este flujo.
- Mantenimiento de saneamiento urbano: detectar alcantarillas en imagenes de calle para inventariar y verificar su presencia o estado en el marco de una revision de la red de drenaje.
- Gestion de residuos y limpieza viaria: identificar acumulaciones de basura en imagenes de camaras urbanas o de vehiculos de barrido para generar ordenes de limpieza.
- Aplicaciones ciudadanas de reporte: integrar YOLOv11n (5,2 MB) en una aplicacion movil o en un dispositivo de borde para etiquetar automaticamente las fotos que envia un ciudadano y clasificar la incidencia antes de registrarla.
- Analitica sobre imagenes de satelite o dron: aplicar el detector a ortomosaicos de carretera con teselas de 640 px para generar mapas de calor de defectos a escala de tramo.
- Investigacion y comparativa de arquitecturas: el repositorio permite contrastar YOLO frente a RF-DETR sobre un mismo dataset de defectos viarios, util para estudiar el equilibrio entre detectores convolucionales de una etapa y detectores basados en transformer.
- Prototipado rapido en pipelines de vision: al usar pesos Ultralytics estandar, se puede insertar el modelo en un script existente con `yolo detect predict` sin reescribir la capa de inferencia.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la particion de validacion:

| Modelo | mAP50 | mAP50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv8m (100e, imgsz 640, batch 32) | 0,773 | 0,489 | 0,858 | 0,736 |
| yolo26m (100e, batch 16) | 0,757 | 0,386 | 0,824 | 0,737 |
| YOLOv11n (100e, imgsz 512, batch 64) | 0,633 | 0,294 | 0,721 | 0,594 |
| RF-DETR | no disponible | no disponible | no disponible | no disponible |

Resultados sobre la particion de test (solo mAP50):

| Modelo | mAP50 (test) |
|---|---|
| YOLOv8m | 0,742 |
| yolo26m | 0,741 |
| YOLOv11n | 0,644 |

No se aportan resultados desglosados por clase, ni curvas precision-recall, ni comparaciones contra modelos externos o lineas base publicas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano de los ficheros; no confirmada por el autor):
  - `yolov11n_best.pt` (5,2 MB): aproximadamente 1 GB de VRAM; viable incluso en CPU y en dispositivos de borde.
  - `yolov8m_100e_best.pt` y `yolov8m_runs_best.pt` (49,6 MB cada uno): aproximadamente 1,5 a 2 GB de VRAM.
  - `yolo26m_best.pt` (42 MB): aproximadamente 1,5 a 2 GB de VRAM.
  - `rfdetr_best.pth` (127,6 MB): aproximadamente 2,5 a 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para las variantes YOLO. Para RF-DETR se recomienda al menos 6 GB. GPU de centro de datos (A100, H100, L4, T4) son validas pero sobredimensionadas para estos tamanos.
- Cabe en GPU consumer: si, en todas las variantes. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 de 24 GB pueden ejecutar el repositorio completo, incluso varias variantes en paralelo.
- Opciones de despliegue: Ultralytics para las variantes YOLO (`.pt`), que admite inferencia en Python, CLI y exportacion a otros formatos. RF-DETR requiere su propio codigo de inferencia para el fichero `.pth`. No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp, que no aplican a modelos de deteccion de objetos.
- Latencia y throughput: no disponible. El autor no publica mediciones de tiempo de inferencia ni FPS en ninguna GPU.

## Comparativa con modelos similares

Comparativa entre las variantes incluidas en el propio repositorio, ya que no se dispone de resultados de modelos externos sobre el mismo dataset:

| Modelo | Tamano del fichero | mAP50 (val) | mAP50-95 (val) | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|
| YOLOv8m (100e, 640) | 49,6 MB | 0,773 | 0,489 | 0,858 | 0,736 | MIT |
| yolo26m (100e) | 42 MB | 0,757 | 0,386 | 0,824 | 0,737 | MIT |
| YOLOv11n (100e, 512) | 5,2 MB | 0,633 | 0,294 | 0,721 | 0,594 | MIT |
| RF-DETR | 127,6 MB | no disponible | no disponible | no disponible | no disponible | MIT |

No se dispone de comparaciones publicadas contra alternativas externas (por ejemplo, otros detectores entrenados especificamente para defectos viarios como RDD2022) porque la informacion proporcionada no incluye esos datos.

## Limitaciones y advertencias

- Sesgos geograficos y de dominio: el dataset se centra en carreteras de la India, por lo que el rendimiento puede degradarse en otros paises con distinto pavimento, senalizacion, iluminacion o mobiliario urbano.
- Sesgos de anotacion: no se describe el protocolo de etiquetado, el numero de anotadores ni la verificacion de las etiquetas, lo que impide evaluar la consistencia del ground truth.
- Riesgo de falsos positivos y negativos: la precision mas alta reportada (0,858 para YOLOv8m) y el recall de 0,736 implican que aproximadamente una cuarta parte de los objetos reales no se detectan en validacion; en un contexto de mantenimiento viario esto puede traducirse en defectos no reportados.
- Generalizacion limitada: los resultados de test son ligeramente inferiores a los de validacion (mAP50 de 0,742 frente a 0,773 en YOLOv8m), una diferencia pequena que no permite descartar sobreajuste al dominio del dataset.
- Contexto y ventana: no aplica; el modelo no procesa texto y su rendimiento depende de la resolucion de imagen de entrada (640 px en YOLOv8m, 512 px en YOLOv11n), no de una ventana de contexto.
- Idiomas: no aplica; el modelo no genera ni interpreta lenguaje natural.
- RF-DETR sin metricas: el autor publica el checkpoint pero no reporta mAP, precision ni recall, por lo que no se puede evaluar su rendimiento relativo frente a las variantes YOLO.
- Ausencia de informacion de entrenamiento: no se documentan epocas de RF-DETR, composicion del dataset, tecnicas de aumentacion ni procesos de ajuste, lo que dificulta la reproducibilidad.
- Licencia: MIT permite uso comercial y modificacion sin restricciones, pero el autor no ofrece garantias de ningun tipo sobre el modelo ni sobre los datos de entrenamiento. Verificar la licencia del dataset de Roboflow antes de un uso comercial, ya que la model card no especifica los terminos del dataset subyacente.
- Denominacion ambigua: el fichero `yolo26m_best.pt` se etiqueta como "yolo26m" sin mas contexto; no se aclara a que version o implementacion concreta corresponde.
- Fecha de publicacion inusual: el repositorio figura como creado el 22 de septiembre de 2026, dato que conviene verificar en la pagina de HuggingFace.
- Madurez del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin historial de uso ni validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devyansh99/sadakvision-weights
- Dataset de entrenamiento (Roboflow, Merged_Final_Data): https://app.roboflow.com/ai-lisrp/merged_final_data/train
- Documentacion de Ultralytics para la inferencia con pesos `.pt`: https://docs.ultralytics.com/
- Repositorio de RF-DETR: no disponible en la informacion proporcionada

No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
