# litert-community/efficientnet_b2

## Resumen

EfficientNet B2 es un modelo de clasificación de imágenes de tipo red convolucional, originalmente introducido por Mingxing Tan y Quoc V. Le en el artículo "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks" (2019). Esta ficha corresponde a la versión publicada por la comunidad litert-community, que distribuye los pesos originales convertidos al formato TensorFlow Lite (TFLite) para su uso con la librería LiteRT de Google, orientada a inferencia en dispositivos y entornos con recursos limitados.

El modelo resuelve la tarea de clasificación de imágenes en 1.000 clases del dataset ImageNet-1k. Su relevancia radica en que aplica el escalado compuesto (compound scaling) que equilibra sistemáticamente profundidad, anchura y resolución de la red, logrando una precisión Top-1 del 80,61 % con tan solo 9,1 millones de parámetros. Esta relación precisión/tamaño lo convierte en una opción atractiva para despliegues en producción donde el coste computacional importa.

La versión de litert-community incluye además una variante cuantizada a int8 solo en pesos (weight-only), aproximadamente 3,6 veces más pequeña que float32, pensada para mejorar el rendimiento en hardware modesto sin degradar las predicciones Top-1 en pruebas puntuales con fotografías reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet (escalado compuesto, bloques MBConv con SE y SiLU) |
| Parametros totales | 9.109.994 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | float32 y weight-only int8 (wi8_afp32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | TFLite (.tflite) |

## Arquitectura y entrenamiento

EfficientNet B2 es una red neuronal convolucional que emplea bloques MBConv (Mobile Inverted Bottleneck Convolution) con conexiones residuales, módulos de atención Squeeze-and-Excitation (SE) y activaciones SiLU. La innovación central del trabajo original es el escalado compuesto: en lugar de escalar una sola dimensión (profundidad, anchura o resolución), se escalan las tres de forma conjunta mediante coeficientes derivados de una búsqueda en grid, lo que produce modelos más eficientes que las arquitecturas escaladas de forma manual.

El modelo fue entrenado sobre ImageNet-1k y esta versión concreta se ha convertido desde un checkpoint de PyTorch Vision. No se dispone de información detallada sobre el número exacto de tokens o épocas de entrenamiento, la composición del dataset más allá de ImageNet-1k, ni sobre el uso de técnicas de refinamiento como RLHF o DPO (no aplicables en un modelo de clasificación de imágenes). La variante cuantizada int8 solo en pesos se eligió en lugar de la cuantización de rango dinámico porque las capas SE y SiLU de EfficientNet son sensibles a la cuantización de activaciones; en una comprobación puntual frente al modelo float, el archivo weight-only mantiene las predicciones Top-1 en fotos reales con una correlación mínima de logits de 0,999.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k.
- Inferencia en formato TFLite mediante la librería LiteRT (ai-edge-litert), orientada a dispositivos y entornos con recursos limitados.
- Variante cuantizada int8 solo en pesos que reduce el tamaño del archivo aproximadamente 3,6 veces respecto a float32.
- Preprocesado documentado: redimensionado bicúbico a 288 px en el lado corto, recorte central de 288x288 y normalización con medias y desviaciones estándar de ImageNet.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.
- No dispone de modo de razonamiento (thinking mode), visión generativa, audio ni otras capacidades multimodales más allá de la clasificación.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes en categorías genéricas de ImageNet para filtrar contenido no deseado en plataformas, aprovechando el reducido tamaño del modelo para procesar lotes grandes en servidores modestos.
- Etiquetado automático de imágenes en bibliotecas digitales: asignar etiquetas de las 1.000 clases a fotografías de archivos, facilitando la búsqueda y organización sin intervención manual.
- Preprocesado en pipelines de visión por computador: usar las predicciones del modelo como característica auxiliar o señal de enrutamiento antes de un modelo mayor o más especializado.
- Inferencia en el dispositivo (edge): desplegar el archivo TFLite en dispositivos móviles o embebidos mediante LiteRT para clasificación local sin conexión, gracias a los 9,1 millones de parámetros y a la variante int8.
- Prototipado rápido de aplicaciones de visión: validar una idea de producto o una interfaz de usuario que requiera clasificación de imágenes con un modelo ligero antes de invertir en modelos más grandes.
- Filtrado previo en sistemas de cámaras o IoT: clasificar fotogramas en el propio dispositivo para decidir si se envía la imagen a un servidor o se descarta, reduciendo el ancho de banda y la latencia.
- Docencia e investigación en eficiencia de modelos: servir como referencia de arquitectura CNN eficiente para comparar técnicas de cuantización y despliegue en entornos académicos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| ImageNet-1k (validation) | Top-1 Accuracy (Full Precision) | 0,8061 |
| ImageNet-1k (validation) | Top-5 Accuracy (Full Precision) | 0,9530 |

No se han publicado en la información disponible resultados de la variante cuantizada int8 más allá de la comprobación puntual de correlación de logits (mínimo 0,999) frente al modelo float.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo float32 ocupa del orden de decenas de megabytes y la variante int8 aproximadamente 3,6 veces menos, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, GPU integradas y aceleradores de borde. En servidor, cualquier GPU moderna (RTX 4090, A100, H100) lo ejecuta con holgura, aunque el modelo está pensado para LiteRT en dispositivos.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en dispositivos móviles y embebidos.
- Opciones de despliegue: LiteRT (ai-edge-litert) es la vía documentada; el formato TFLite también puede ejecutarse con TensorFlow Lite y con el intérprete de TFLite en Android, iOS y microcontroladores compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 ImageNet-1k | Formato | Licencia |
|---|---|---|---|---|
| EfficientNet B2 (esta ficha) | 9.109.994 | 0,8061 | TFLite | no disponible |
| EfficientNet B0 | no disponible en esta ficha | no disponible en esta ficha | no disponible | no disponible |
| EfficientNet B3 | no disponible en esta ficha | no disponible en esta ficha | no disponible | no disponible |
| MobileNetV3 | no disponible en esta ficha | no disponible en esta ficha | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos comparables para establecer una comparación cuantitativa fiable; las filas distintas de la primera se dejan como "no disponible" para no inventar cifras.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre ImageNet-1k, el modelo hereda los sesgos de ese dataset en cuanto a representación de clases, culturas y contextos visuales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar etiquetas erróneas con alta confianza en imágenes fuera de la distribución de ImageNet.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje; su alcance se limita a las 1.000 clases de ImageNet-1k y a imágenes con el preprocesado documentado (288x288, normalización específica).
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; la model card advierte que los pesos originales pueden tener sus propias licencias o términos derivados de PyTorch Vision y del dataset de entrenamiento, y que es responsabilidad del usuario determinar si tiene permiso para su caso de uso.
- Caveats para producción: la variante int8 solo en pesos mantiene las predicciones Top-1 en pruebas puntuales, pero no se han publicado métricas agregadas de la variante cuantizada; conviene validar en el dominio concreto antes de desplegar. El modelo está pensado para clasificación genérica, no para dominios especializados (medicina, industria, etc.) sin reentrenamiento o ajuste fino.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/efficientnet_b2
- Modelo base: https://huggingface.co/google/efficientnet-b2
- Paper original: https://arxiv.org/abs/1905.11946
- Etiquetas ImageNet-1k: https://huggingface.co/datasets/huggingface/label-files
- LiteRT (ai-edge-litert): no disponible en la información proporcionada
- Repositorio PyTorch Vision: no disponible en la información proporcionada
