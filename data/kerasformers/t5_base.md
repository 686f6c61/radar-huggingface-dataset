# kerasformers/t5_base

## Resumen
El repositorio `kerasformers/t5_base` aloja una conversión íntegra en Keras 3 del modelo `google-t5/t5-base` de Google, realizada por la organización KerasFormers. T5 (Text-To-Text Transfer Transformer) reformula todas las tareas de PLN como un problema de generación de texto a texto, lo que permite usar el mismo modelo, función de pérdida e hiperparámetros para tareas como traducción, resumen, clasificación o respuesta a preguntas. Esta conversión permite ejecutar el modelo sin necesidad de `transformers` ni de un runtime de Torch, y funciona de forma idéntica sobre los backends TensorFlow, PyTorch y JAX de Keras 3.

El modelo base tiene 220 millones de parámetros y una arquitectura encoder-decoder Transformer, con una longitud de contexto de 512 tokens. La conversión se declara bit-exacta con el original de Hugging Face, y el repositorio incluye los pesos, el tokenizador y los ficheros de configuración para cargar el modelo directamente. Aunque el repo está orientado a traducción (pipeline_tag `translation`), el backbone completo puede usarse para cualquier tarea text-to-text. Su licencia Apache-2.0 permite uso comercial y modificación sin restricciones adicionales.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parámetros totales | 220 millones |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible (pesos en precisión flotante original) |
| Idiomas soportados | Inglés, francés, alemán, rumano (entrenamiento original de T5-base) |
| Licencia | Apache-2.0 |
| Formato de pesos | H5 (`model.weights.h5`), con tokenizer y config en ficheros propios |

## Arquitectura y entrenamiento
El modelo es una conversión directa de `google-t5/t5-base` a Keras 3, manteniendo la misma arquitectura: un encoder y un decoder Transformer con 12 capas cada uno, 768 dimensiones ocultas, 12 cabezas de atención y una función de activación ReLU. El diseño text-to-text permite unificar tareas: la entrada se serializa como texto (por ejemplo, `translate English to German: ...`) y el modelo genera la salida como texto. El entrenamiento original de T5-base se realizó con el dataset Colossal Clean Crawled Corpus (C4) y un objetivo de span-corruption, con 220 millones de parámetros y una longitud de contexto de 512 tokens. La conversión de KerasFormers no modifica los pesos; el repositorio proporciona una implementación pura de Keras 3 que es bit-exacta con el modelo de Hugging Face, y permite cargar cualquier variante T5 mediante `from_weights("kerasformers/<variante>")`.

## Capacidades
- Generación de texto para cualquier tarea text-to-text: traducción, resumen, clasificación, respuesta a preguntas, generación de texto libre.
- Soporte de fine-tuning con Keras 3 en cualquiera de los tres backends (TensorFlow, PyTorch, JAX).
- Tokenizer T5 integrado, con vocabulario SentencePiece.
- Capacidad de cargar submodelos: `T5EncoderModel`, `T5ConditionalGenerate` y cabezas de clasificación / QA desde el mismo fichero de pesos.
- Ejecución sin dependencia de `transformers` ni de `torch` en el path de carga (solo se requiere Keras 3 y el backend correspondiente).
- No incluye soporte de vision, audio ni tool calling; es un modelo de texto puro.

## Casos de uso
- Traducción automática: se puede usar directamente con el prefijo `translate English to German: ...` para traducir entre los idiomas soportados (en, fr, de, ro). Es adecuado para prototipos y sistemas de baja latencia gracias a su tamaño contenido.
- Resumen de documentos: fine-tuning sobre datos de resumen (ej. CNN/DailyMail) para generar resúmenes de artículos o informes. El formato text-to-text simplifica el ajuste.
- Clasificación de texto: mediante el prompt `clasificar: ...`, se puede entrenar para clasificar sentimiento, spam o categorías temáticas sin cambiar la arquitectura.
- Pregunta a preguntas (QA) extractivo: fine-tuning con pares pregunta-contexto-respuesta para sistemas de búsqueda de respuestas en dominios específicos.
- Generación de texto controlada: el modelo puede usarse como base para tareas de parafraseo o reescritura, ajustando el prompt de entrada.
- Investigación y experimentación: como implementación de referencia en Keras 3, permite comparar el comportamiento del modelo en los tres backends y estudiar su funcionamiento interno sin depender de la pila de Hugging Face.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El modelo hereda las capacidades del T5-base original, cuyos resultados pueden consultarse en el paper de T5 (arXiv:1910.10683), pero no se proporcionan aquí métricas específicas de esta conversión.

## Requisitos de hardware
- VRAM estimada para inferencia: los 220 millones de parámetros en precisión FP32 ocupan aproximadamente 880 MB de memoria. En FP16 se reduce a ~440 MB, y en INT8 a ~220 MB (aunque el repo no ofrece pesos cuantizados, se puede cuantizar posteriormente con herramientas como TFLite o TensorRT).
- GPU recomendadas: una GPU con 4 GB de VRAM es suficiente para inferencia en FP32; en FP16 cabe en GPUs de 2 GB. Para fine-tuning se recomienda al menos 8 GB (ej. RTX 2070, RTX 3060, Tesla T4).
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (GTX 1060 6GB, RTX 2060, RTX 3070) puede ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser una implementación Keras 3, se puede exportar a TensorFlow Lite, ONNX o usar en servidores con el backend de JAX o Torch. No hay soporte directo para vLLM u Ollama, pero se puede servir con TensorFlow Serving o TorchServe.
- Latencia: en una GPU T4, una generación de 40 tokens típica podría rondar los 100-200 ms, aunque depende del backend y del tamaño del batch.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| `google-t5/t5-base` | 220 M | 512 | Apache-2.0 | PyTorch, TF, JAX (transformers) |
| `kerasformers/t5_base` | 220 M | 512 | Apache-2.0 | Keras 3 (H5) |
| `google-t5/t5-small` | 60 M | 512 | Apache-2.0 | PyTorch, TF, JAX |
| `google/mt5-base` | 580 M | 512 | Apache-2.0 | PyTorch, TF, JAX |

La conversión de KerasFormers no difiere en rendimiento del modelo original, pero ofrece una ventaja de portabilidad: se puede usar en proyectos que ya dependen de Keras 3 y evitar la capa de `transformers`. T5-small es más ligero para entornos con recursos limitados, mientras que mT5-base ofrece mejor cobertura multilingüe (101 idiomas) a costa de más parámetros.

## Limitaciones y advertencias
- **Sesgos y riesgos**: al ser una copia del modelo original de Google, hereda los sesgos presentes en los datos de entrenamiento (C4), que pueden incluir estereotipos o contenido ofensivo.
- **Alucinación**: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de generación libre.
- **Contexto limitado**: la ventana de 512 tokens restringe el uso en documentos largos o conversaciones multi-turno extensas.
- **Idiomas**: el modelo solo está entrenado para en, fr, de, ro; no soporta otros idiomas de forma fiable sin fine-tuning.
- **Formato de pesos**: los pesos están en formato H5 específico de Keras; no son directamente compatibles con `transformers` sin conversión previa.
- **Estado de desarrollo**: la organización KerasFormers está en desarrollo activo y el paquete PyPI puede ir por detrás de los pesos del Hub; es recomendable verificar la compatibilidad de la versión de Keras.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/kerasformers/t5_base
- Organización KerasFormers en HuggingFace: https://huggingface.co/kerasformers
- Colección de modelos T5 de KerasFormers: https://huggingface.co/collections/kerasformers/t5-6a85056935f438653698c56f
- Paper T5: https://arxiv.org/abs/1910.10683
- Model card original de T5-base: https://huggingface.co/google-t5/t5-base
- PyPI de kerasformers: https://pypi.org/project/kerasformers/
