# airg/unet-efficientnet-b7-ltfl-mmgab-100ep-1window-ftw-ft100ep-ma

## Resumen

El modelo `airg/unet-efficientnet-b7-ltfl-mmgab-100ep-1window-ftw-ft100ep-ma` es un modelo de segmentacion semantica de imagenes satelitales desarrollado por el usuario `airg` y publicado en Hugging Face. Se trata de una U-Net con encoder EfficientNet-B7, entrenada para la clasificacion de coberturas terrestres en tres clases siguiendo la configuracion del baseline de Fields of the World (FTW). El modelo se ha disenado especificamente para la identificacion de limites de parcelas agricolas a partir de imagenes de satelite.

El modelo parte de un entrenamiento inicial sobre el catalogo de etiquetas de FTW en modo de ventana unica, alternando temporadas de crecimiento y cosecha, y posteriormente se ha afinado durante 100 epocas sobre imagenes basadas en Planet de Mapping Africa. Esta especializacion en el continente africano lo hace relevante para aplicaciones de monitorizacion agricola en regiones donde los datos de referencia son escasos y las practicas de cultivo presentan una gran heterogeneidad espacial y temporal.

Con un tamano de repositorio de 1,1 GB y una licencia restringida (Planet NICFI Participant License Agreement), el modelo se orienta a investigadores y organizaciones que trabajan en el marco del programa NICFI (Norway's International Climate and Forest Initiative) y que necesitan segmentar parcelas agricolas en imagenes de satelite de alta resolucion. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los idiomas soportados, ya que se trata de un modelo de vision y no de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder EfficientNet-B7 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | Planet NICFI Participant License Agreement |
| Formato de pesos | no disponible (repositorio de 1,1 GB) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de U-Net con un encoder EfficientNet-B7, conforme a la configuracion del baseline de FTW para modelos de tres clases. La U-Net combina un camino de codificacion que extrae caracteristicas jerarquicas de la imagen con un camino de decodificacion que recupera la resolucion espacial para producir una mascara de segmentacion por pixel. El uso de EfficientNet-B7 como encoder aporta una mayor capacidad de representacion frente a variantes mas ligeras, a costa de un mayor coste computacional.

El entrenamiento se realizo en dos fases. Primero, el modelo se entreno sobre el catalogo de etiquetas de FTW en modo de ventana unica, alternando imagenes de temporada de crecimiento y de cosecha para capturar la variabilidad fenologica de los cultivos. Despues, se afino durante 100 epocas sobre imagenes de Planet correspondientes a Mapping Africa, con una tasa de aprendizaje de 1e-3 segun la configuracion publicada en el repositorio de codigo del autor. No se especifica el numero de tokens ni la composicion exacta del dataset, aunque el contexto indica que se trata de imagenes multiespectrales de satelite.

## Capacidades

- Segmentacion semantica de imagenes satelitales en tres clases de cobertura terrestre, siguiendo el esquema de etiquetas de FTW.
- Deteccion de limites de parcelas agricolas a nivel de pixel, con metricas de IoU, precision y recall publicadas.
- Procesamiento de imagenes en modo de ventana unica con alternancia de temporadas de crecimiento y cosecha.
- Especializacion en imagenes de Planet sobre el continente africano (Mapping Africa).
- No soporta tool calling ni function calling (es un modelo de vision, no de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la segmentacion de imagenes.

## Casos de uso

- Monitorizacion de parcelas agricolas en Africa: el modelo segmenta limites de cultivos en imagenes de Planet, lo que permite generar mapas de parcelas actualizados para programas de seguridad alimentaria y planificacion agricola en regiones con datos de referencia limitados.
- Estimacion de superficies cultivadas: a partir de las mascaras de segmentacion, se pueden calcular areas de cultivo por region para informes de produccion y politicas agrarias, usando la salida a nivel de pixel del modelo.
- Seguimiento de cambios en la cobertura terrestre: al aplicar el modelo a imagenes de distintas fechas, se pueden detectar variaciones en la extension de parcelas agricolas, lo que resulta util para estudios de deforestacion y expansion agricola.
- Validacion de catalogos de etiquetas: el modelo puede usarse como referencia para comparar y validar anotaciones manuales en nuevos conjuntos de datos de cobertura terrestre, gracias a sus metricas de precision y recall publicadas.
- Integracion en pipelines de teledeteccion: el modelo puede incorporarse en flujos de procesamiento automatizado de imagenes satelitales para generar capas de parcelas que alimenten sistemas de informacion geografica (GIS).
- Investigacion en segmentacion semantica: sirve como punto de partida para experimentos de fine-tuning en dominios geograficos distintos, ya que el autor publica el codigo y la configuracion de entrenamiento.
- Apoyo a programas NICFI: organizaciones participantes en el programa NICFI pueden usar el modelo para analisis de cobertura terrestre dentro del marco de la licencia.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de validacion:

| Metrica | Valor |
|---|---|
| pixel_level_iou | 0,591 |
| pixel_level_precision | 0,745 |
| pixel_level_recall | 0,741 |
| object_level_precision | 0,319 |
| object_level_recall | 0,278 |
| object_level_f1 | 0,291 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una U-Net con encoder EfficientNet-B7, el consumo de memoria depende del tamano de las ventanas de imagen de entrada y del batch, pero no se proporcionan cifras concretas.
- GPU recomendadas: no disponible. Por el tamano del encoder EfficientNet-B7, es probable que requiera GPU con al menos 8-16 GB de VRAM para inferencia en batches moderados, pero este dato no esta confirmado en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. El modelo podria ejecutarse en GPUs de consumo como RTX 3060 o superiores si el tamano de ventana es reducido, pero no hay datos que lo verifiquen.
- Opciones de despliegue: no disponible. No se especifican frameworks de inferencia (PyTorch, ONNX, TensorRT, etc.) en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| airg/unet-efficientnet-b7-ltfl-mmgab-100ep-1window-ftw-ft100ep-ma | U-Net + EfficientNet-B7 | no disponible | no aplica | Planet NICFI Participant License Agreement | Hugging Face |
| FTW baseline 3-class | U-Net (segun baseline FTW) | no disponible | no aplica | no disponible | GitHub (fieldsoftheworld/ftw-baselines) |
| Otros modelos de segmentacion de parcelas | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la Planet NICFI Participant License Agreement, lo que limita su uso a participantes del programa NICFI y restringe el uso comercial fuera de ese marco. Es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- Especializacion geografica: el fine-tuning se realizo sobre imagenes de Mapping Africa, por lo que el rendimiento en otras regiones del mundo puede degradarse notablemente.
- Rendimiento a nivel de objeto limitado: el F1 a nivel de objeto es de 0,291, lo que indica que la deteccion de parcelas individuales como objetos completos es poco fiable, aunque la segmentacion a nivel de pixel sea aceptable (IoU 0,591).
- Dependencia de la temporada: el modelo se entreno alternando temporadas de crecimiento y cosecha, por lo que su comportamiento puede variar segun la fenologia del cultivo en el momento de la inferencia.
- Riesgo de alucinacion: como todo modelo de segmentacion, puede generar mascaras plausibles pero incorrectas en zonas con cobertura nubosa, sombras o baja resolucion.
- Sesgos desconocidos: no se documentan sesgos especificos en la informacion proporcionada, pero la distribucion del dataset de entrenamiento (Africa, imagenes Planet) condiciona fuertemente las predicciones.
- Sin soporte de texto ni multilingue: no es adecuado para tareas de lenguaje, dialogo ni procesamiento de texto.
- Falta de documentacion tecnica: no se especifican parametros totales, formato de pesos, requisitos de hardware ni opciones de despliegue, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/airg/unet-efficientnet-b7-ltfl-mmgab-100ep-1window-ftw-ft100ep-ma
- Codigo y configuracion: https://github.com/agroimpacts/ftw-mappingafrica-integration/tree/main
- Configuracion de entrenamiento: https://github.com/agroimpacts/ftw-mappingafrica-integration/blob/main/configs/1timepoint/ftwbaseline1w-to-ma-nofrz-lr1e3-ep100.yaml
- Baseline FTW: https://github.com/fieldsoftheworld/ftw-baselines/tree/main
- Licencia Planet NICFI: https://planet.widen.net/s/zfdpf8qxwk/participantlicenseagreement_nicfi_2024
