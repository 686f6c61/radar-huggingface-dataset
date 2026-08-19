# ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-int8-onnx

## Resumen

El modelo `ketis/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-int8-onnx` es una versión cuantizada a 8 bits del clasificador de imágenes MobileNetV2 con factor de ancho 0.5, preentrenado en ImageNet. Fue desarrollado por STMicroelectronics dentro de su ecosistema STM32 AI model zoo y convertido a formato ONNX por el usuario `ketiswp`. El objetivo principal es facilitar el despliegue de redes neuronales de visión en microcontroladores STM32 mediante la herramienta STM32Cube.AI.

La arquitectura es una red neuronal convolucional (CNN) basada en bloques residuales invertidos (inverted residuals) y convoluciones separables en profundidad (depthwise separable convolutions). La cuantización estática INT8 en formato QDQ permite reducir el tamaño del modelo y acelerar la inferencia en hardware con soporte de enteros, manteniendo una pérdida de precisión mínima. El modelo acepta imágenes de 224x224 píxeles y devuelve probabilidades para las 1000 clases de ImageNet.

Su relevancia actual radica en la creciente demanda de soluciones de inteligencia artificial en el borde (edge AI) para aplicaciones industriales, de consumo y de IoT, donde los recursos de cómputo y memoria son limitados. Al estar disponible en formato ONNX con cuantización INT8, puede integrarse fácilmente en pipelines de inferencia con ONNX Runtime y en el flujo de trabajo de STM32Cube.AI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con bloques residuales invertidos) |
| Parametros totales | no disponible (se estima ~1.5M para factor 0.5, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8 estática (QDQ) |
| Idiomas soportados | no disponible (modelo de vision, sin soporte de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

MobileNetV2 es una CNN eficiente diseñada para dispositivos con recursos limitados. Su arquitectura se basa en bloques residuales invertidos (inverted residual blocks) con convoluciones separables en profundidad, que reducen drásticamente el número de operaciones y parámetros en comparación con las CNN tradicionales. El factor de ancho 0.5 reduce el número de canales en cada capa, lo que disminuye aún más el costo computacional a costa de una menor precisión.

El modelo fue entrenado originalmente en ImageNet (dataset de 1.28 millones de imágenes en 1000 clases) mediante transferencia de aprendizaje (transfer learning), según se indica en el README del STM32 model zoo. La versión INT8 se obtiene mediante cuantización estática con formato QDQ (Quantize-Dequantize), donde los pesos y activaciones se representan con enteros de 8 bits y se insertan nodos de cuantización/decuantización en el grafo ONNX. Esta técnica permite reducir el tamaño del modelo en aproximadamente un 75% y acelerar la inferencia en hardware que soporta operaciones INT8, como los microcontroladores STM32 con acelerador de IA (STM32Cube.AI).

## Capacidades

- Clasificacion de imagenes: el modelo procesa imagenes de 224x224 píxeles y devuelve una distribucion de probabilidad sobre 1000 categorias de ImageNet (objetos, animales, plantas, vehiculos, etc.).
- Inferencia en el borde: esta diseñado para ejecutarse en microcontroladores STM32 con la herramienta STM32Cube.AI, lo que permite aplicaciones de vision en tiempo real con bajo consumo energetico.
- Compatibilidad ONNX: puede ejecutarse con ONNX Runtime en CPU, GPU o hardware especializado, y tambien se puede convertir a otros formatos para despliegue en dispositivos embebidos.
- Cuantizacion INT8: reduce el uso de memoria y la latencia, facilitando su integracion en sistemas con recursos limitados.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Clasificacion de productos en lineas de produccion: el modelo puede identificar defectos o categorias de productos en imagenes capturadas por camaras industriales. Al ejecutarse en un STM32, se puede integrar en sistemas de control de calidad en tiempo real sin necesidad de un servidor central.
- Reconocimiento de objetos en sistemas de seguridad: para clasificar objetos en imagenes de vigilancia (por ejemplo, personas, vehiculos) en dispositivos de bajo coste y bajo consumo.
- Agricultura de precision: clasificacion de especies vegetales o deteccion de plagas en imagenes capturadas por sensores de campo, desplegado en nodos IoT con microcontroladores.
- Clasificacion de imagenes medicas basicas: identificacion de tipos de celulas o anomalias en imagenes de microscopia, con una solucion de bajo coste para entornos con recursos limitados.
- Educacion y prototipado: como modelo de referencia para aprender sobre cuantizacion, despliegue en embebidos y optimizacion de modelos ONNX.
- Integracion en sistemas de robotica basica: clasificacion de objetos para la manipulacion de robots en entornos de fabricacion, con inferencia local para reducir la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de precision (por ejemplo, top-1 o top-5 en ImageNet) ni comparaciones con otros modelos. Se recomienda consultar el README del modelo original en el repositorio de STMicroelectronics para obtener datos de rendimiento (latencia, uso de memoria) en los MCUs STM32, aunque no se encuentran en esta documentacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, ya que el modelo esta disenado para ejecutarse en CPU o MCU. En caso de ejecutarse en GPU, el modelo ONNX con cuantizacion INT8 ocupa aproximadamente unos pocos MB, por lo que cualquier GPU con mas de 1 GB de VRAM seria suficiente.
- GPU recomendadas: no es necesario; el modelo esta pensado para CPU y microcontroladores. Si se ejecuta en un PC, una CPU moderna puede realizar la inferencia en menos de 10 ms por imagen.
- Compatibilidad con consumer GPU: si, puede ejecutarse en cualquier GPU con ONNX Runtime, pero no aprovecha la aceleracion INT8 en la mayoria de las GPUs (aunque algunas lo soportan).
- Opciones de despliegue: ONNX Runtime, STM32Cube.AI, TensorFlow Lite (mediante conversion), o cualquier framework que soporte ONNX.
- Latencia y throughput: no disponible en la informacion proporcionada. En un MCU STM32, la latencia depende del modelo de microcontrolador y la frecuencia de reloj; en un PC, la inferencia es casi instantanea.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se pueden mencionar alternativas de la misma categoria:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| MobileNetV2 0.5 (este modelo) | ~1.5M (no confirmado) | 224x224 | no disponible | Apache 2.0 |
| MobileNetV2 1.0 | ~3.5M | 224x224 | mayor precision, mas operaciones | Apache 2.0 |
| MobileNetV1 0.5 | ~1.3M | 224x224 | similar, menos eficiente | Apache 2.0 |
| EfficientNet-Lite0 | ~4.7M | 224x224 | mejor precision, mas parametros | Apache 2.0 |

Nota: los numeros de parametros son estimaciones de conocimiento comun, no confirmadas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos de ImageNet: el modelo hereda los sesgos presentes en el dataset ImageNet, como la sobre-representacion de ciertas categorias y la falta de diversidad en condiciones de iluminacion o angulos.
- Riesgo de clasificacion erronea: la cuantizacion INT8 puede degradar la precision, especialmente en imagenes con texturas finas o condiciones de iluminacion adversas.
- Sin soporte de texto: no es un modelo multimodal; solo procesa imagenes.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero no se incluyen garantias ni responsabilidad por parte del autor.
- Formato de pesos: ONNX, no es un formato optimizado para todos los entornos; para MCUs STM32 se debe convertir a un formato especifico (por ejemplo, .tflite o STM32Cube.AI).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-int8-onnx
- Version FP32 del mismo modelo: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-fp32-onnx
- Repositorio del STM32 model zoo: https://github.com/STMicroelectronics/stm32ai-modelzoo
- README del modelo original: https://github.com/STMicroelectronics/stm32ai-modelzoo/blob/main/image_classification/mobilenetv2/README.md
- Modelo de STMicroelectronics en HuggingFace: https://huggingface.co/STMicroelectronics/mobilenetv2
- Sitio oficial del STM32 AI model zoo: https://stm32ai.st.com/model-zoo/</think>## Resumen

El modelo `ketis/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-int8-onnx` es una version cuantizada a 8 bits del clasificador de imagenes MobileNetV2 con factor de ancho 0.5, preentrenado en ImageNet. Fue desarrollado por STMicroelectronics como parte de su STM32 model zoo y posteriormente convertido a ONNX por el usuario `ketiswp`. Su proposito principal es permitir el despliegue de redes neuronales de vision en microcontroladores STM32 mediante la herramienta STM32Cube.AI, aprovechando la cuantizacion INT8 para reducir el uso de memoria y acelerar la inferencia en hardware con soporte de operaciones enteras.

La arquitectura es una CNN basada en bloques residuales invertidos y convoluciones separables en profundidad, disenada para ser eficiente en dispositivos con recursos limitados. El factor de ancho 0.5 reduce el numero de canales en cada capa, lo que disminuye el coste computacional a costa de una menor precision respecto a la version completa. El modelo acepta imagenes de 224x224 pixeles y devuelve una distribucion de probabilidad sobre las 1000 clases de ImageNet. La cuantizacion estatica INT8 en formato QDQ (Quantize-Dequantize) es la principal innovacion tecnica de esta variante.

Su relevancia radica en la creciente demanda de soluciones de inteligencia artificial en el borde (edge AI) para aplicaciones industriales, de consumo y de IoT, donde la eficiencia energetica y la latencia son criticas. Al estar disponible en formato ONNX con cuantizacion INT8, puede integrarse facilmente en pipelines de inferencia con ONNX Runtime o convertirse para su uso con STM32Cube.AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (red residual invertida con depthwise separable convolutions) |
| Parametros totales | no disponible (estimacion de ~1.5M para factor 0.5, no confirmada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | INT8 estatica (QDQ) |
| Idiomas soportados | no disponible (modelo de vision, sin soporte de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

MobileNetV2 es una CNN disenada para entornos con recursos limitados. Su arquitectura se basa en bloques residuales invertidos (inverted residual blocks), que utilizan convoluciones separables en profundidad (depthwise separable convolutions) para reducir drasticamente el numero de operaciones y parametros en comparacion con redes convolucionales tradicionales. El factor de ancho 0.5 multiplica el numero de canales de cada capa por 0.5, lo que reduce el coste computacional y el tamano del modelo, aunque a costa de una menor precision.

El modelo fue entrenado originalmente en ImageNet (dataset de 1.28 millones de imagenes en 1000 clases) mediante transferencia de aprendizaje, segun se indica en el README del STM32 model zoo. La cuantizacion INT8 se obtiene mediante cuantizacion estatica con formato QDQ, donde los pesos y activaciones se convierten a enteros de 8 bits y se insertan nodos de cuantizacion/decuantizacion en el grafo ONNX. Este proceso reduce el tamano del modelo aproximadamente un 75% y permite acelerar la inferencia en hardware con soporte INT8, como los microcontroladores STM32 con aceleracion de IA.

## Capacidades

- Clasificacion de imagenes: el modelo procesa imagenes de 224x224 pixeles y devuelve una distribucion de probabilidad sobre las 1000 clases de ImageNet (objetos, animales, vehiculos, plantas, etc.).
- Inferencia en el borde: disenado para ejecutarse en microcontroladores STM32 con STM32Cube.AI, lo que permite aplicaciones de vision en tiempo real con bajo consumo energetico.
- Compatibilidad ONNX: puede ejecutarse con ONNX Runtime en CPU, GPU o hardware especializado, y tambien se puede convertir a otros formatos para despliegue en dispositivos embebidos.
- Cuantizacion INT8: reduce el uso de memoria y la latencia, facilitando la implementacion en sistemas con recursos limitados.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Control de calidad en lineas de produccion: el modelo puede clasificar productos o detectar defectos en imagenes capturadas por camaras industriales. Al ejecutarse en un microcontrolador STM32, se integra en sistemas de vision en tiempo real sin depender de un servidor centralizado.
- Reconocimiento de objetos en seguridad: clasificacion de objetos (personas, vehiculos, animales) en camaras de vigilancia de bajo coste y consumo, desplegadas en entornos remotos.
- Agricultura de precision: identificacion de especies vegetales o deteccion de plagas en imagenes tomadas por drones o sensores de campo, con nodos de inferencia locales en microcontroladores.
- Clasificacion de imagenes medicas basicas: en aplicaciones de microscopia o telemedicina, el modelo puede distinguir tipos de celulas o tejidos en entornos con recursos limitados.
- Educacion y prototipado: como modelo de ejemplo para aprender sobre cuantizacion, despliegue en embebidos y optimizacion de modelos ONNX.
- Robotica basica: clasificacion de objetos para la manipulacion de robots en entornos de trabajo, con inferencia local para reducir la latencia y evitar dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de precision (por ejemplo, top-1 o top-5 en ImageNet) ni comparaciones con otros modelos. Se recomienda consultar el README del modelo original en el repositorio de STMicroelectronics para obtener datos de validacion (latencia, uso de memoria) en los dispositivos STM32, aunque no se proporcionan en esta documentacion.

## Requisitos de hardware

- VRAM para inferencia: no es necesario un GPU; el modelo esta disenado para CPU o MCU. En caso de ejecucion en GPU, el tamano del modelo es de pocos MB, por lo que cualquier GPU con mas de 1 GB de VRAM seria suficiente.
- GPU recomendada: no es obligatoria. En CPU, una CPU moderna puede realizar la inferencia en menos de 10 ms por imagen.
- Compatibilidad con microcontroladores: el modelo esta optimizado para STM32Cube.AI, que genera codigo C optimizado para microcontroladores STM32.
- Opciones de despliegue: ONNX Runtime, STM32Cube.AI, TensorFlow Lite (mediante conversion), o cualquier framework que soporte ONNX.
- Latencia y throughput: no disponible en los datos proporcionados. En un STM32, la latencia depende del modelo de microcontrolador y la frecuencia de reloj; en CPU, la inferencia es casi instantanea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| MobileNetV2 0.5 (este modelo) | ~1.5M (no confirmado) | 224x224 | no disponible | Apache 2.0 |
| MobileNetV2 1.0 | ~3.5M | 224x224 | mayor precision, mayor coste | Apache 2.0 |
| MobileNetV1 0.5 | ~1.3M | 224x224 | similar, menos eficiente | Apache 2.0 |
| EfficientNet-Lite0 | ~4.7M | 224x224 | mayor precision, mayor coste | Apache 2.0 |

Nota: los numeros de parametros son estimaciones de conocimiento comun, no confirmadas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos de ImageNet: el modelo hereda los sesgos del dataset, como la sobre-representacion de ciertas categorias y la falta de diversidad en condiciones de fondo o angulo.
- Riesgo de clasificacion erronea: la cuantizacion INT8 puede reducir la precision, especialmente en imagenes con texturas finas o cambios de iluminacion.
- Sin soporte de entrada de texto: es un modelo de vision, no procesa texto ni otro tipo de datos.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero no se ofrecen garantias ni responsabilidad por parte del autor.
- Formato de pesos: ONNX, no es un formato optimizado para todos los motores; para STM32 se debe convertir a un formato especifico mediante STM32Cube.AI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-int8-onnx
- Version FP32 del mismo modelo: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-fp32-onnx
- Repositorio STM32 model zoo: https://github.com/STMicroelectronics/stm32ai-modelzoo
- README del modelo original: https://github.com/STMicroelectronics/stm32ai-modelzoo/blob/main/image_classification/mobilenetv2/README.md
- Modelo de STMicroelectronics en HuggingFace: https://huggingface.co/STMicroelectronics/mobilenetv2
- Sitio oficial del STM32 AI model zoo: https://stm32ai.st.com/model-zoo/</think>## Resumen

El modelo `ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-int8-onnx` es una versión cuantizada a 8 bits del clasificador de imágenes MobileNetV2 con factor de ancho 0.5, preentrenado en ImageNet. Fue desarrollado por STMicroelectronics como parte de su STM32 model zoo y posteriormente convertido a ONNX por el usuario `ketiswp`. Su propósito principal es facilitar el despliegue de redes neuronales de visión en microcontroladores STM32 mediante la herramienta STM32Cube.AI, aprovechando la cuantización INT8 para reducir el tamaño del modelo y acelerar la inferencia en hardware con soporte de operaciones enteras.

La arquitectura es una red neuronal convolucional (CNN) basada en bloques residuales invertidos y convoluciones separables en profundidad, diseñada para ser eficiente en dispositivos con recursos limitados. El factor de ancho 0.5 reduce el número de canales en cada capa, lo que disminuye el coste computacional y el peso del modelo a costa de una menor precisión respecto a la versión completa. La entrada es una imagen de 224x224 píxeles y la salida es una distribución de probabilidad sobre las 1000 clases de ImageNet.

La relevancia de este modelo reside en la creciente demanda de inteligencia artificial en el borde (edge AI) para aplicaciones de visión en tiempo real con bajo consumo energético. Al estar disponible en formato ONNX con cuantización INT8, puede integrarse fácilmente en flujos de trabajo con ONNX Runtime o convertirse para su uso con STM32Cube.AI, lo que lo convierte en una opción práctica para prototipos y productos comerciales en el ámbito de los microcontroladores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (red residual invertida) |
| Parámetros totales | ~1.5 millones (estimación no confirmada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | INT8 estática (formato QDQ) |
| Idiomas soportados | no disponible (modelo de imagen, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

MobileNetV2 es una CNN eficiente diseñada para entornos con recursos limitados. Su arquitectura se basa en bloques residuales invertidos (inverted residual blocks) que utilizan convoluciones separables en profundidad (depthwise separable convolutions), lo que reduce drásticamente el número de operaciones y parámetros en comparación con redes convolucionales tradicionales. El factor de ancho 0.5 reduce el número de canales en cada capa, lo que disminuye aún más el coste computacional a costa de una menor precisión.

El modelo fue entrenado originalmente en ImageNet (1.28 millones de imágenes, 1000 clases) mediante transferencia de aprendizaje, como se indica en el README del STM32 model zoo. La cuantización INT8 estática se realizó con formato QDQ, donde los pesos y activaciones se convierten a enteros de 8 bits y se insertan nodos de cuantización/decuantización en el grafo ONNX. Esto reduce el tamaño del modelo en aproximadamente un 75% y permite acelerar la inferencia en hardware con soporte INT8, como los microcontroladores STM32 con aceleración de IA.

## Capacidades

- Clasificación de imágenes: procesa imágenes de 224x224 píxeles y devuelve una distribución de probabilidad sobre las 1000 clases de ImageNet.
- Inferencia en el borde: diseñado para ejecutarse en microcontroladores STM32 con STM32Cube.AI, lo que permite aplicaciones de visión en tiempo real con bajo consumo energético.
- Compatibilidad ONNX: puede ejecutarse con ONNX Runtime en CPU, GPU o hardware especializado, y también se puede convertir a otros formatos para despliegue en dispositivos embebidos.
- Cuantización INT8: reduce el uso de memoria y la latencia, facilitando la implementación en sistemas con recursos limitados.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Control de calidad en líneas de producción: el modelo puede clasificar productos o detectar defectos en imágenes capturadas por cámaras industriales. Al ejecutarse en un microcontrolador STM32, se integra en sistemas de control en tiempo real sin depender de un servidor centralizado.
- Reconocimiento de objetos en seguridad: clasificación de objetos (personas, vehículos, animales) en cámaras de vigilancia de bajo coste y consumo energético, desplegadas en entornos remotos.
- Agricultura de precisión: identificación de especies vegetales o detección de plagas en imágenes tomadas por drones o sensores de campo, con nodos de hardware locales que procesan la información sin conexión a la nube.
- Clasificación de imágenes médicas básicas: en aplicaciones de microscopía o campo, el modelo puede clasificar tipos de células o tejidos en entornos con recursos limitados, como clínicas rurales.
- Educación y prototipado: como modelo de demostración para aprender sobre cuantización, despliegue en embebidos y optimización de modelos ONNX.
- Robótica básica: clasificación de objetos para la manipulación de robots en entornos de trabajo, con inferencia local para reducir la latencia y evitar dependencias de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de precisión (por ejemplo, top-1 o top-5 en ImageNet) ni comparaciones con otros modelos. Se recomienda consultar el README del modelo original en el repositorio de STMicroelectronics para obtener datos de validación (latencia, uso de memoria) en los dispositivos STM32, aunque no se proporcionan en esta documentación.

## Requisitos de hardware

- VRAM para inferencia: no es necesaria una GPU; el modelo está diseñado para CPU o MCU. En caso de ejecución en GPU, el tamaño es de unos pocos MB, por lo que cualquier GPU con más de 1 GB de VRAM sería suficiente.
- GPU recomendada: no es obligatoria. En CPU, una CPU moderna puede realizar la inferencia en menos de 10 ms por imagen.
- Microcontroladores: el modelo está optimizado para STM32Cube.AI, que genera código optimizado para ejecutar en microcontroladores STM32.
- Opciones de despliegue: ONNX Runtime, STM32Cube.AI, TensorFlow Lite (mediante conversión) o cualquier framework que soporte ONNX.
- Latencia y throughput: no disponible en los datos proporcionados. En un STM32, la latencia depende del modelo de microcontrolador y la frecuencia de reloj; en CPU, la latencia es casi instantánea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| MobileNetV2 0.5 (este modelo) | ~1.5M (no confirmado) | 224x224 | no disponible | Apache 2.0 |
| MobileNetV2 1.0 | ~3.5M | 224x224 | mayor precisión, mayor peso | Apache 2.0 |
| MobileNetV1 0.5 | ~1.3M | 224x224 | similar, menos eficiente | Apache 2.0 |
| EfficientNet-Lite0 | ~4.7M | 224x224 | mayor precisión, mayor coste | Apache 2.0 |

Nota: los números de parámetros son estimaciones de conocimiento común, no confirmados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos de imagen: el modelo hereda los datos de ImageNet, como la sobre-representación de ciertas categorías y la falta de diversidad en condiciones de fondo o ángulo.
- Riesgo de clasificación errónea: la cuantización INT8 puede reducir la precisión, especialmente en imágenes con texturas finas o cambios de iluminación.
- Limitaciones de idioma: no es un modelo multimodal; no procesa texto ni otros tipos de datos.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero no se ofrecen garantías ni responsabilidad por parte del autor.
- Formato de pesos: ONNX, no es un formato optimizado para todos los motores; para STM32Cube.AI se debe convertir a un formato específico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-int8-onnx
- Versión FP32 del mismo modelo: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.5-ImageNet-PyTorch-224-fp32-onnx
- Repositorio STM32 model zoo: https://github.com/STMicroelectronics/stm32ai-modelzoo
- README del modelo original: https://github.com/STMicroelectronics/stm32ai-modelzoo/blob/main/image_classification/mobilenetv2/README.md
- Modelo de STMicroelectronics en HuggingFace: https://huggingface.co/STMicroelectronics/mobilenetv2
- Sitio oficial del STM32 AI model zoo: https://stm32ai.st.com/model-zoo/
