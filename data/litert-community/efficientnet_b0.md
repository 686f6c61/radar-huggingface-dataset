# litert-community/efficientnet_b0

## Resumen

EfficientNet-B0 es un modelo de clasificación de imágenes basado en redes neuronales convolucionales (CNN), desarrollado originalmente por Mingxing Tan y Quoc V. Le en 2019. La versión publicada por `litert-community/efficientnet_b0` es una conversión de los pesos preentrenados de PyTorch Vision al formato LiteRT (antiguo TensorFlow Lite), lo que permite ejecutarlo de forma eficiente en dispositivos de borde.

El modelo fue preentrenado en el dataset ImageNet-1k y es capaz de clasificar imágenes en 1000 categorías. Su arquitectura introduce el concepto de *compound scaling*, que equilibra de forma sistemática la profundidad, la anchura y la resolución de la red, logrando una alta precisión con un coste computacional reducido. Con aproximadamente 5,3 millones de parámetros, es un modelo ligero pensado para aplicaciones de visión por computadora en tiempo real sobre hardware limitado.

La relevancia de esta publicación radica en que ofrece el modelo en formato `.tflite`, incluyendo una variante con cuantización *weight-only* int8 que reduce el tamaño de los pesos unas 3,5 veces respecto a float32, manteniendo una correlación de logits de 0,996 en una comprobación sobre imágenes reales. Esto lo hace especialmente útil para proyectos de IA en el dispositivo con LiteRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con bloques MBConv y capas SE) |
| Parametros totales | 5.288.548 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | Float32 y weight-only int8 (3,5x mas pequeno) |
| Idiomas soportados | no disponible (modelo de vision, no texto) |
| Licencia | no disponible (posible licencia de PyTorch Vision) |
| Formato de pesos | TFLite (.tflite) |

## Arquitectura y entrenamiento

EfficientNet-B0 es una CNN que utiliza una arquitectura basada en bloques MBConv (Mobile Inverted Bottleneck) con conexiones residuales y capas de *Squeeze-and-Excitation* (SE). La innovación principal es el *compound scaling*, que escala de forma conjunta la profundidad, la anchura y la resolución de entrada mediante un coeficiente compuesto, en lugar de escalar una sola dimensión. Esto permite obtener un rendimiento superior a otras arquitecturas con un coste computacional similar.

El modelo fue preentrenado en ImageNet-1k, un dataset de clasificación de imágenes con 1,28 millones de imágenes y 1000 clases. Los pesos publicados en HuggingFace fueron convertidos desde un checkpoint de PyTorch Vision. En la model card se indica que la cuantización *weight-only* int8 se eligió en lugar de cuantización de rango dinámico porque las capas SE y SiLU de EfficientNet son sensibles a la cuantización de activaciones. No se menciona ningún proceso de alineación como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Clasificación de imágenes en 1000 categorías del dataset ImageNet-1k.
- Inferencia eficiente en dispositivos de borde gracias al formato LiteRT/TFLite.
- Soporte de cuantización *weight-only* int8, que reduce el tamaño del modelo aproximadamente 3,5 veces respecto a float32.
- Compatibilidad con el runtime LiteRT (sucesor de TensorFlow Lite) para despliegue en Android, iOS y plataformas embebidas.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.
- No tiene capacidades de generación de texto ni soporte multilingüe, ya que no procesa lenguaje natural.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo puede integrarse en apps Android o iOS mediante LiteRT para clasificar fotos en tiempo real, por ejemplo, identificando especies de plantas o razas de perros. Su tamaño reducido y su formato `.tflite` permiten una ejecución fluida sin necesidad de conexión a servidores.
- Control de calidad en manufactura: en líneas de producción, el modelo puede clasificar imágenes de piezas para detectar defectos visuales como rayas, abolladuras o decoloraciones. La cuantización int8 facilita su ejecución en cámaras industriales con recursos limitados.
- Sistemas de vigilancia y seguridad: puede utilizarse para clasificar escenas o eventos en vídeos, como la presencia de vehículos, personas u objetos específicos. Su baja latencia lo hace adecuado para el procesamiento de streams de vídeo en tiempo real.
- Agricultura de precisión: el modelo puede clasificar imágenes de hojas para identificar enfermedades o plagas en cultivos. Los agricultores podrían usarlo desde un smartphone, ya que el modelo funciona localmente sin conexión.
- Clasificación de documentos e imágenes en flujos de trabajo empresariales: puede distinguir entre tipos de imágenes como facturas, recibos, fotografías de productos o capturas de pantalla, ayudando a automatizar procesos de archivo y gestión documental.
- Asistencia a personas con discapacidad visual: una aplicación puede usar el modelo para describir la categoría de una imagen captada por la cámara, por ejemplo, indicando si es una silla, una mesa o un animal. Su eficiencia permite ejecutarlo en dispositivos móviles de gama baja.
- Backbone para sistemas de detección de objetos: aunque es un clasificador, las características extraídas por las capas intermedias pueden utilizarse como *backbone* para modelos de detección o segmentación, aprovechando su equilibrio entre precisión y coste computacional.

## Benchmarks y rendimiento

Se han publicado resultados oficiales en la model card para la tarea de clasificación de imágenes sobre el dataset ImageNet-1k (split de validación). Los valores corresponden a la precisión del modelo en precisión completa (float32).

| Metric | Valor |
|---|---|
| Top 1 Accuracy (Full Precision) | 0,7765 (77,65%) |
| Top 5 Accuracy (Full Precision) | 0,9353 (93,53%) |

El modelo original de PyTorch Vision, del que se derivan los pesos, reporta una precisión top-1 de 77,692% y top-5 de 93,532%, prácticamente idéntica a la publicada en esta versión. La variante cuantizada *weight-only* int8, según la model card, mantiene las predicciones top-1 sobre imágenes reales con una correlación mínima de logits de 0,996 respecto al modelo float32. No se dispone de otros resultados de benchmarks en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia. El modelo en float32 ocupa aproximadamente 21 MB, y en int8 alrededor de 5,3 MB, por lo que puede ejecutarse incluso en CPUs.
- GPU recomendada: no se requiere una GPU dedicada. Cualquier GPU moderna, incluida una GPU integrada o un acelerador neuronal en dispositivos móviles, es suficiente.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en cualquier GPU de consumo, incluidas las de gama baja, y también en placas como Raspberry Pi.
- Opciones de despliegue: LiteRT (TFLite), que es el runtime recomendado. También se puede convertir a ONNX o TensorFlow para otros entornos.
- Latencia y throughput: no disponible en la información proporcionada. Dado el tamaño reducido del modelo, se espera una latencia muy baja en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

Se compara con el modelo base original y con otras arquitecturas de tamaño similar. Los datos de rendimiento de los modelos alternativos no están disponibles en la información proporcionada.

| Modelo | Parametros | Top-1 ImageNet | Licencia | Formato |
|---|---|---|---|---|
| litert-community/efficientnet_b0 | 5.288.548 | 77,65% | no disponible | TFLite |
| google/efficientnet-b0 (original) | 5.288.548 | 77,692% | no disponible | PyTorch |
| MobileNetV3-Large | no disponible | no disponible | no disponible | no disponible |
| ResNet-50 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo procesa imágenes y no genera texto ni responde a instrucciones en lenguaje natural. No debe utilizarse para tareas de NLP o razonamiento conversacional.
- La licencia no está especificada en la model card. El autor advierte que los modelos pueden tener términos y condiciones derivados de PyTorch Vision y del dataset de entrenamiento. Es responsabilidad del usuario verificar si tiene permiso para el uso previsto.
- Al estar entrenado en ImageNet-1k, el modelo hereda los sesgos presentes en ese dataset, que puede estar sobrerrepresentado en ciertas categorías y subrepresentado en otras, lo que puede afectar a la precisión en dominios específicos.
- La variante cuantizada *weight-only* int8 puede presentar una ligera pérdida de precisión, aunque la model card indica que la correlación de logits es muy alta (0,996) en una comprobación puntual. Se recomienda validar el comportamiento en el caso de uso concreto.
- No se proporcionan datos sobre latencia, throughput ni consumo energético, por lo que cualquier afirmación sobre rendimiento en producción debe basarse en pruebas propias.
- El modelo está pensado para clasificación de imágenes completas; no ofrece localización de objetos ni segmentación de forma nativa.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/litert-community/efficientnet_b0
- Repositorio de LiteRT en GitHub: https://github.com/google-ai-edge/litert
- Documentación oficial de LiteRT: https://developers.google.com/edge/litert
- Paper original de EfficientNet: https://arxiv.org/abs/1905.11946
