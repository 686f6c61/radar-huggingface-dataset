# SabaTariq510/waste-classification-models

## Resumen

Este repositorio contiene dos modelos entrenados para la clasificación y detección de residuos en imágenes, desarrollados por SabaTariq510. El primero es un MobileNetV2 para clasificación de imagen completa, capaz de distinguir entre seis categorías de residuos (cartón, vidrio, metal, papel, plástico y basura general). El segundo es un modelo YOLOv8 para detección de objetos, que localiza mediante cajas delimitadoras residuos de tres categorías dentro de la imagen. Ambos modelos están pensados para integrarse en una aplicación Flask/Gradio donde el usuario puede seleccionar el modelo según su necesidad.

La relevancia de este proyecto radica en su aplicación práctica para sistemas de reciclaje automatizado, ya que permite convertir la salida de ambos modelos en una clasificación binaria de reciclable o no reciclable mediante un mapeo predefinido. Al estar publicados bajo licencia MIT, son libremente utilizables en proyectos comerciales y de investigación. Sin embargo, la documentación disponible es escasa: no se especifican los datos de entrenamiento, el número de parámetros, ni se publican métricas de rendimiento, lo que limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (clasificacion) y YOLOv8 (deteccion de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | MIT |
| Formato de pesos | .keras (TensorFlow/Keras) y .pt (PyTorch/Ultralytics) |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos independientes. El primero es un MobileNetV2, una red neuronal convolucional ligera diseñada para clasificacion de imagenes, que opera sobre entradas RGB de 224x224 píxeles y produce una distribucion de probabilidad sobre seis clases de residuos. El segundo es un modelo YOLOv8 (You Only Look Once, version 8) de Ultralytics, una arquitectura de deteccion de objetos en una sola pasada que predice cajas delimitadoras y clases simultaneamente para tres categorias de residuos.

No se proporciona informacion sobre el proceso de entrenamiento: no se indican el dataset utilizado, el numero de epocas, el tamaño del lote, ni si se aplicaron tecnicas de aumento de datos o transfer learning. Tampoco se menciona el uso de metodos de alineacion como RLHF o DPO, que no son habituales en modelos de vision. La ausencia de estos datos impide evaluar la calidad del entrenamiento y la generalizacion de los modelos.

## Capacidades

- Clasificacion de imagenes completas en seis clases de residuos: carton, vidrio, metal, papel, plastico y basura general.
- Deteccion de objetos con localizacion espacial (bounding boxes) para tres categorias de residuos, indicando posicion y confianza.
- Mapeo de las salidas a una etiqueta binaria de reciclabilidad (reciclable vs. no reciclable) segun una tabla predefinida.
- Integracion sencilla mediante la carga de archivos desde Hugging Face Hub con TensorFlow/Keras y Ultralytics YOLO.
- Interfaz de usuario opcional a traves de Gradio para seleccion dinamica del modelo.
- Capacidad de inferencia en tiempo real o casi tiempo real gracias a la naturaleza ligera de MobileNetV2 y a la eficiencia de YOLOv8.

## Casos de uso

- Plantas de reciclaje automatizadas: el modelo YOLOv8 puede detectar y localizar residuos en una cinta transportadora, permitiendo a un brazo robotico separar materiales reciclables de no reciclables en tiempo real.
- Aplicaciones moviles de concienciacion ciudadana: el modelo MobileNetV2 permite a un usuario fotografiar un residuo y recibir al instante una indicacion sobre si es reciclable o no, fomentando habitos de reciclaje correctos.
- Sistemas de triaje en puntos limpios: integrando ambos modelos en un sistema de vision por computador, se puede clasificar automaticamente el contenido de bolsas o contenedores antes de su procesamiento.
- Educacion ambiental: uso en entornos escolares o museos interactivos donde los visitantes pueden probar la clasificacion de residuos con objetos reales o fotografias.
- Optimizacion de rutas de recogida selectiva: analizando imagenes de contenedores urbanos, el modelo puede estimar el tipo de residuo predominante y ayudar a planificar rutas de recogida mas eficientes.
- Auditoria de procesos de reciclaje: el modelo de deteccion puede verificar si los materiales que llegan a una planta cumplen los criterios de separacion, detectando contaminaciones cruzadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se indican metricas de exactitud, precision, recall ni mAP para ninguno de los dos modelos. Tampoco se proporcionan comparaciones con otros sistemas de clasificacion de residuos. Por tanto, no es posible evaluar cuantitativamente su rendimiento relativo.

## Requisitos de hardware

- MobileNetV2 es un modelo muy ligero (alrededor de 3.5 millones de parametros en su version estandar, aunque no se confirma el tamaño exacto del archivo). Puede ejecutarse en CPU con una latencia de decenas de milisegundos por imagen, y en GPU consumer como una GTX 1060 o superior sin problemas.
- YOLOv8, dependiendo de la variante (n, s, m, l, x), requiere mas recursos. La version pequeña (YOLOv8s) puede ejecutarse en GPU con 4-6 GB de VRAM, mientras que la version grande necesita al menos 8-10 GB. En CPU es viable pero con latencia mayor.
- Ambos modelos pueden desplegarse con TensorFlow Serving, TorchServe, o mediante frameworks de inferencia como ONNX Runtime. Para aplicaciones en tiempo real se recomienda GPU.
- No se dispone de datos de throughput especificos para estos modelos concretos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con otros modelos de clasificacion de residuos. Existen proyectos similares en GitHub y articulos cientificos que emplean arquitecturas como EfficientNet, ResNet o YOLO, pero sin datos de rendimiento de este modelo no es posible realizar una comparacion objetiva. Se recomienda al usuario evaluar el modelo en su propio conjunto de datos de validacion.

## Limitaciones y advertencias

- La informacion disponible no incluye detalles sobre el dataset de entrenamiento, por lo que se desconoce su diversidad, tamaño y posible sesgo geografico o de iluminacion.
- No se han publicado metricas de rendimiento, lo que impide conocer su exactitud real y su tasa de errores.
- El modelo de clasificacion MobileNetV2 distingue seis clases, pero el modelo de deteccion YOLOv8 solo maneja tres, lo que limita su utilidad en escenarios con mas categorias.
- El mapeo de reciclabilidad es una simplificacion: por ejemplo, el plastico se considera siempre reciclable, pero en la practica muchos plasticos no son reciclables debido a su composicion o contaminacion.
- No se indica si los modelos funcionan correctamente con imagenes de baja resolucion, condiciones de poca luz o residuos parcialmente ocultos.
- Al no existir informacion sobre el proceso de entrenamiento, no se puede descartar la presencia de sobreajuste o una generalizacion deficiente.
- La licencia MIT permite uso comercial y modificacion, pero el usuario es responsable de validar el rendimiento en su caso de uso especifico.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/SabaTariq510/waste-classification-models
- No se han encontrado otros enlaces oficiales (paper, blog, demo) en la busqueda web. Los resultados encontrados corresponden a proyectos similares de otros autores, no a este modelo concreto.
