# lucid-dl/yolo-v3

## Resumen

YOLOv3 es un detector de objetos en una sola pasada (single-shot) desarrollado por Joseph Redmon y Ali Farhadi en 2018, presentado en el artículo *YOLOv3: An Incremental Improvement* (arXiv:1804.02767). Este repositorio concreto, `lucid-dl/yolo-v3`, es un port de los pesos oficiales de Darknet (`darknet/yolov3.weights`) al formato nativo de la librería Lucid, con conversión a safetensors y verificación numérica contra el original. No se trata de un reentrenamiento, sino de una conversión fiel de los pesos preentrenados en el dataset COCO.

El modelo utiliza una arquitectura basada en Darknet-53 como backbone y cabezas de detección multiescala, con 61,9 millones de parámetros. Su relevancia actual radica en ser un punto de referencia histórico en detección de objetos en tiempo real, aún utilizado como baseline en investigaciones y aplicaciones de visión por computador. La conversión a Lucid facilita su integración en proyectos que usan esa librería, manteniendo el preprocesado asociado a los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv3 (Darknet-53 backbone, cabezas multiescala) |
| Parametros totales | 61,9 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | other (heredada de los pesos originales de Darknet) |
| Formato de pesos | safetensors (Lucid-native) |

## Arquitectura y entrenamiento

YOLOv3 emplea una red fully convolutional con backbone Darknet-53 (53 capas convolucionales) y tres escalas de detección (13x13, 26x26 y 52x52) mediante *feature pyramid networks*. Cada escala predice cajas con anclas predefinidas y salidas de clase. El modelo fue entrenado originalmente por Redmon y Farhadi sobre el dataset COCO (80 clases), con una resolución de entrada de 416x416 píxeles por defecto. En este repositorio no se aportan detalles adicionales sobre el entrenamiento (número de épocas, estrategias de aumento, etc.), ya que se trata de una conversión de pesos preentrenados, no de un entrenamiento nuevo. La conversión se realizó mediante `python -m tools.convert_weights yolo_v3 --tag COCO_2014`, con verificación de paridad numérica contra los pesos fuente.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica objetos de 80 categorias del dataset COCO (personas, vehiculos, animales, objetos cotidianos, etc.).
- Salida estructurada: proporciona logits por clase y coordenadas de cajas delimitadoras (bounding boxes) en formato `ObjectDetectionOutput`.
- Preprocesado integrado: los pesos incluyen transformaciones asociadas (redimensionado, normalizacion) que se aplican automaticamente al cargar el modelo.
- Inferencia en una sola pasada: disenado para deteccion en tiempo real, con latencia baja en GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la vision.

## Casos de uso

- Vigilancia y seguridad: deteccion de personas, vehiculos u objetos en tiempo real a partir de flujos de video. Su velocidad permite procesar multiples camaras con hardware moderado.
- Conteo y analisis de trafico: identificar y contar vehiculos en imagenes de carreteras o aparcamientos, integrable en sistemas de gestion urbana.
- Control de calidad industrial: localizar defectos o piezas en lineas de produccion mediante imagenes de alta resolucion, con un modelo ligero que se ejecuta en equipos locales.
- Sistemas de asistencia a la conduccion: deteccion de peatones, señales y otros vehiculos en prototipos de investigacion, aunque su antiguedad limita su uso en produccion frente a modelos mas recientes.
- Etiquetado automatico de datasets: generar anotaciones iniciales (bounding boxes) para acelerar la creacion de conjuntos de datos personalizados en tareas de deteccion.
- Educacion e investigacion: servir como baseline en estudios comparativos de detectores de una sola pasada, dado su papel historico y su implementacion de referencia.

## Benchmarks y rendimiento

El unico dato de rendimiento declarado por el autor es el siguiente, extraido del model-index de la model card:

| Dataset | Metrica | Valor | Verificado |
|---|---|---|---|
| COCO | mAP@0.5 | 55,3 | No |

No se han publicado resultados adicionales (mAP@0.5:0.95, latencia, throughput, etc.) en la informacion disponible. Este valor corresponde a los pesos originales de Darknet convertidos, no a una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada: con 61,9 millones de parametros, el modelo en FP32 ocupa aproximadamente 248 MB; en FP16, unos 124 MB. Cabe en cualquier GPU con 2 GB o mas de VRAM.
- GPU recomendadas: cualquier GPU moderna de consumo (GTX 1060, RTX 2060, RTX 3060, etc.) es suficiente para inferencia en tiempo real. Para entrenamiento o fine-tuning se recomienda al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: si, es un modelo ligero que se ejecuta sin problemas en GPUs de gama media.
- Opciones de despliegue: al ser un port de Lucid, se integra con esa libreria. Tambien puede exportarse a otros formatos (ONNX, TensorRT) mediante herramientas externas, aunque no se documenta en este repositorio.
- Latencia y throughput: no se proporcionan datos oficiales. Como referencia orientativa, YOLOv3 en una GPU moderna (RTX 2080) suele alcanzar decenas de FPS, pero estos valores dependen de la resolucion de entrada y del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la informacion proporcionada. El modelo pertenece a la familia YOLO, con alternativas mas recientes como YOLOv5, YOLOv8 o YOLOv9, que ofrecen mayor precision y eficiencia, pero no se incluyen metricas concretas en este repositorio. Para una comparacion rigurosa seria necesario consultar los benchmarks publicados de cada version.

## Limitaciones y advertencias

- Sesgos del dataset COCO: el modelo hereda los sesgos de las imagenes de COCO, que sobredimensionan ciertas categorias (personas, vehiculos) y subrepresentan otras, lo que puede afectar a la precision en dominios especificos.
- Riesgo de falsos positivos y negativos: como cualquier detector, puede fallar en condiciones de oclusion, iluminacion adversa o objetos pequenos.
- Sin soporte de texto ni lenguaje: no procesa instrucciones ni genera descripciones; solo produce cajas y clases.
- Licencia restrictiva: la licencia `other` heredada de los pesos originales de Darknet no es una licencia open source estandar. Antes de usar el modelo en aplicaciones comerciales, es necesario revisar los terminos de la licencia original de YOLOv3, que historicamente ha tenido restricciones para uso comercial.
- Antiguedad: al ser de 2018, su precision es inferior a la de detectores modernos (p. ej., YOLOv8 supera el 50 mAP@0.5 en COCO con menos parametros). No se recomienda para produccion de altas exigencias sin evaluacion previa.
- Dependencia de la libreria Lucid: el formato safetensors es nativo de Lucid, por lo que su uso fuera de ese ecosistema requiere conversion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lucid-dl/yolo-v3
- Paper original (arXiv): https://arxiv.org/abs/1804.02767
- Repositorio de Lucid (libreria): https://github.com/ChanLumerico/lucid
- Implementacion de referencia en PyTorch (Ultralytics): https://github.com/ultralytics/yolov3
