# Shaq2/chashibhai-potato-disease-cls

## Resumen

ChashiBhAI Potato Disease Classifier (v2) es un modelo de clasificación de imágenes diseñado para detectar enfermedades en hojas de patata, desarrollado por el usuario Shaq2 dentro de la colección ChashiBhAI de clasificadores on-device para agricultura. El modelo está construido sobre la arquitectura YOLO26-cls de Ultralytics y se distribuye convertido a TensorFlow Lite en precisión FP16, lo que permite su ejecución en dispositivos con recursos limitados, como teléfonos móviles o sistemas embebidos. Clasifica las hojas en tres categorías: tizón temprano, hoja sana y tizón tardío.

La relevancia actual de este modelo radica en su enfoque práctico para la agricultura de precisión en Bangladesh, donde las enfermedades de la patata causan pérdidas significativas. Al ofrecer un modelo ligero y optimizado para inferencia en el dispositivo, facilita el diagnóstico rápido en campo sin necesidad de conexión a internet. El repositorio contiene los artefactos de la versión 2 en el subdirectorio `v2/`, mientras que los archivos de la raíz corresponden a la generación anterior. La licencia MIT permite su uso comercial y modificación sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-cls (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (TFLite) |
| Idiomas soportados | no disponible (etiquetas en ingles) |
| Licencia | MIT |
| Formato de pesos | TFLite (FP16), tambien disponibles artefactos raiz (posiblemente formato Ultralytics) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO26-cls, la variante de clasificacion de la familia YOLO26 de Ultralytics, que emplea una arquitectura de red neuronal convolucional optimizada para eficiencia computacional. La entrada es una imagen de 640x640 píxeles en formato NHWC (batch, height, width, channels) y la salida es un vector de 3 valores con softmax, indicando la probabilidad de cada clase: `Potato__Early_Blight`, `Potato__Healthy_Leaf` y `Potato__Late_Blight`. El preprocesado recomendado es un centre-crop de variante C, segun la convencion de Ultralytics.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de epocas, el tamaño del lote ni si se aplicaron tecnicas de aumento de datos. Tampoco se mencionan procesos de RLHF o DPO, ya que es un modelo de vision supervisado. La conversion a TFLite FP16 sugiere un proceso de post-entrenamiento para reducir el tamaño del modelo y acelerar la inferencia en dispositivos moviles, aunque no se especifican los pasos exactos de cuantizacion ni el tamaño final del archivo.

## Capacidades

- Clasificacion de imagenes de hojas de patata en tres categorias: tizón temprano, hoja sana y tizón tardío.
- Inferencia en el dispositivo (on-device) gracias al formato TFLite FP16, sin necesidad de conexion a internet.
- Compatible con la libreria Ultralytics para cargar y ejecutar el modelo en Python.
- No soporta tool calling, agentes, ni razonamiento multi-paso, al ser un modelo puramente discriminativo.
- Capacidades multilingues: no aplica, ya que la salida son etiquetas en ingles; el modelo no procesa texto.
- Sin modo de pensamiento ni generacion de texto.

## Casos de uso

- Diagnostico en campo para agricultores: un agricultor puede fotografiar una hoja de patata con su telefono movil y obtener al instante la clasificacion de la enfermedad, gracias a la inferencia local del modelo TFLite. Esto permite una deteccion temprana y una actuacion rapida sin depender de conexion a internet.
- Aplicacion movil de asesoria agricola: integrar el modelo en una app que, ademas de clasificar, ofrezca recomendaciones de tratamiento basadas en el resultado. El formato TFLite es ideal para su inclusion en aplicaciones Android o iOS.
- Monitorizacion automatizada en invernaderos: usar camaras fijas conectadas a un sistema embebido (como Raspberry Pi) que capturen imagenes de plantas y ejecuten el modelo en tiempo real para alertar sobre brotes de tizón.
- Herramienta educativa para estudiantes de agronomia: permitir a los alumnos practicar la identificacion de enfermedades de la patata con un modelo accesible y ligero, sin necesidad de infraestructura de servidores.
- Integracion en sistemas de vision por computador para agricultura de precision: combinar la clasificacion con otros modelos (deteccion de objetos, segmentacion) para un analisis completo del estado del cultivo, aprovechando la compatibilidad con Ultralytics.
- Validacion de tratamientos en investigacion: los investigadores pueden usar el modelo para evaluar rapidamente la eficacia de fungicidas comparando la proporcion de hojas sanas frente a enfermas en imagenes de ensayos de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como precision, recall, F1, ni comparaciones con otros modelos de clasificacion de enfermedades de patata.

## Requisitos de hardware

- Al ser un modelo TFLite FP16, esta optimizado para ejecucion en CPU y GPU de dispositivos moviles y embebidos. No se especifica la VRAM necesaria, pero al tratarse de un clasificador ligero, se estima que puede ejecutarse en cualquier dispositivo con Android o iOS moderno.
- GPU recomendadas: no disponible; se asume que la inferencia puede realizarse en CPU o con aceleracion por GPU movil (como Adreno o Mali).
- No se requiere GPU de escritorio; es adecuado para edge devices.
- Opciones de despliegue: TFLite Runtime, TensorFlow Lite Interpreter, y tambien se puede cargar con la libreria Ultralytics (aunque el formato principal es TFLite).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificacion de enfermedades de patata con arquitectura YOLO26-cls). Existen otros modelos de clasificacion de enfermedades de plantas, como los basados en ResNet o EfficientNet, pero no se han encontrado datos suficientes para una comparacion objetiva.

## Limitaciones y advertencias

- El modelo solo reconoce tres clases: tizón temprano, hoja sana y tizón tardío. No cubre otras enfermedades comunes de la patata como el virus del enrollado de la hoja o la sarna.
- No se proporcionan datos de rendimiento (precision, recall, etc.), por lo que no se puede evaluar su fiabilidad en condiciones reales.
- El preprocesado requiere un centre-crop de 640x640; si la imagen de entrada no se ajusta a este protocolo, los resultados pueden degradarse.
- No se mencionan sesgos especificos, pero al ser un modelo entrenado probablemente con imagenes de Bangladesh, puede tener menor precision con variedades de patata o condiciones de cultivo de otras regiones.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se ofrece sin garantias de exactitud; es recomendable validarlo con un conjunto de datos propio antes de usarlo en produccion.
- No hay informacion sobre el tamaño del archivo TFLite ni sobre los requisitos minimos de memoria del dispositivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Shaq2/chashibhai-potato-disease-cls)
- [Coleccion ChashiBhAI on-device disease classifiers](https://huggingface.co/collections/Shaq2/chashibhai-on-device-disease-classifiers)
- [Modelo de arroz de la misma coleccion (referencia)](https://huggingface.co/Shaq2/chashibhai-rice-disease-cls)
