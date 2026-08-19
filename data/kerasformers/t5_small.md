# kerasformers/t5_small

## Resumen

`kerasformers/t5_small` es una conversión íntegra del modelo `google-t5/t5-small` al ecosistema Keras 3, desarrollada por el proyecto KerasFormers. T5 (Text-To-Text Transfer Transformer) reformula todas las tareas de procesamiento de lenguaje natural como un problema de generación de texto a texto: la entrada y la salida son siempre cadenas de texto, lo que permite usar la misma arquitectura, función de pérdida e hiperparámetros para traducción, resumen, clasificación, preguntas y respuestas o generación de texto.

Esta versión específica mantiene los 60 millones de parámetros del modelo original de Google y ofrece una implementación que se ejecuta sin modificaciones sobre TensorFlow, PyTorch o JAX, con pesos bit-exactos respecto al modelo de Hugging Face. La ventana de contexto es de 512 tokens, heredada del T5 original. El repositorio incluye el backbone completo (`T5Model`) y todas las clases derivadas (generación condicional, encoder y cabezas de clasificación/QA) cargadas desde un único fichero de pesos.

La relevancia de este modelo reside en su portabilidad: permite a desarrolladores e investigadores usar T5 en entornos Keras 3 sin depender del backend específico, manteniendo la compatibilidad con el ecosistema Hugging Face. Su licencia Apache 2.0 y su tamaño reducido lo hacen adecuado para prototipado rápido, fine-tuning en dominios concretos y despliegues en hardware con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (texto a texto) |
| Parámetros totales | 60 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, fr, de, ro (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras weights (`model.weights.h5`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer encoder-decoder propuesta en el paper "Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer" (arXiv:1910.10683). El encoder procesa la entrada con atención bidireccional y el decoder genera la salida con atención causal. Todos los parámetros se comparten en un único modelo, y la interfaz es completamente texto a texto.

El modelo original `google-t5/t5-small` fue entrenado por Google en el dataset C4 (Colossal Clean Crawled Data), con un objetivo de denoising de spans. La versión `kerasformers` es una conversión bit-exacta de esos pesos, no un reentrenamiento. La implementación en Keras 3 permite seleccionar el backend de ejecución (TensorFlow, Torch o JAX) mediante la variable de entorno `KERAS_BACKEND`, sin modificar el código de usuario.

## Capacidades

- Generación de texto condicional: traducción, resumen, respuesta a preguntas y otras tareas de texto-a-texto.
- Clasificación de texto (sentiment, topicos) mediante el prefijo de tarea en el input.
- Extracción de respuestas en formato texto (QA extractivo y abstractivo).
- Fine-tuning sobre tareas específicas con la misma arquitectura y tokenizer.
- Soporte multilingüe básico para traducción entre inglés, francés, alemán y rumano (según la model card).
- Ejecución multiplataforma: el mismo código corre en JAX, PyTorch y TensorFlow gracias a Keras 3.
- No incluye soporte de tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Traducción automática entre los idiomas declarados (en-fr, en-de, en-ro). Se usa con el prefijo `translate English to German: ...` y el tokenizer de KerasFormers.
- Resumen de documentos largos: aunque la ventana es de 512 tokens, se puede usar para resumir párrafos o fragmentos, y encadenar para textos más largos.
- Clasificación de sentimiento en texto: se puede fine-tunear sobre un corpus específico para análisis de opiniones en productos o redes sociales.
- Preguntas y respuestas extractivas: con el formato `question: ... context: ...`, el modelo genera la respuesta en texto.
- Prototipado rápido de pipelines NLP en Keras 3: al ser bit-exact con el original, permite validar integraciones sin depender del backend.
- Fine-tuning en dominios específicos (legal, médico, técnico) con datasets pequeños, gracias a su tamaño reducido.
- Generación de texto creativo o aumentación de datos para entrenar modelos más grandes.
- Despliegue en entornos con restricciones de memoria, como dispositivos edge o microservicios en contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La conversión de kerasformers no aporta métricas propias; el modelo original `google-t5/t5-small` ha sido evaluado en tareas como GLUE y SuperGLUE, pero esos datos no están incluidos en la documentación de este repositorio.

## Requisitos de hardware

- Tamaño del modelo: aproximadamente 0.2 GB en el repositorio (pesos en FP32).
- VRAM estimada para inferencia: menos de 1 GB en FP32 (60M de parámetros × 4 bytes ≈ 240 MB).
- Cabe en GPU de consumo como NVIDIA RTX 3060, RTX 4090, o incluso en CPU con memoria suficiente.
- Se puede ejecutar en CPU con Keras 3, aunque la latencia será mayor.
- Opciones de despliegue: integración directa con KerasFormers, exportación a TensorFlow, JAX o PyTorch, y conversión a formatos como ONNX si se requiere.
- No se requieren GPUs de gran escala; un modelo de esta categoría se puede servir en un contenedor con recursos modestos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `kerasformers/t5_small` | Encoder-decoder (texto-a-texto) | 60M | 512 | Apache 2.0 | Keras weights |
| `google-t5/t5-small` | Encoder-decoder (texto-a-texto) | 60M | 512 | Apache 2.0 | PyTorch / TF |
| `distilbert-base-uncased` | Encoder (BERT) | 66M | 512 | Apache 2.0 | PyTorch / TF |
| `bert-base-uncased` | Encoder (BERT) | 110M | 512 | Apache 2.0 | PyTorch / TF |

La diferencia clave con BERT es que T5 unifica todas las tareas en generación de texto, mientras que BERT se limita a clasificación o extracción de spans. Frente a `google-t5/t5-small`, la versión de kerasformers aporta compatibilidad multiplataforma en Keras 3, pero no añade capacidad de rendimiento adicional.

## Limitaciones y advertencias

- Ventana de contexto de 512 tokens: no es adecuado para documentos largos sin estrategias de truncado o chunking.
- Idioma principal: aunque la model card declara en, fr, de, ro, el T5 original fue entrenado principalmente en inglés; la calidad en otros idiomas puede ser limitada.
- Riesgo de alucinación en tareas de generación abierta, especialmente con prompts ambiguos.
- Sesgos presentes en el dataset C4, que pueden reflejarse en las salidas (estereotipos, contenido sensible).
- No soporta tool calling, agentes ni razonamiento multi-paso.
- El formato de pesos es exclusivo de Keras (`.h5`); para usarlo con otras librerías (transformers, llama.cpp) es necesario convertirlo, aunque el modelo original de Hugging Face está disponible.
- No se han publicado resultados de benchmarks específicos de esta conversión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kerasformers/t5_small
- Modelo original de Google: https://huggingface.co/google-t5/t5-small
- Paper: https://arxiv.org/abs/1910.10683
- Repositorio de GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de T5 en KerasFormers: https://imvision12.github.io/KerasFormers/t5/
- Colección de modelos T5: https://huggingface.co/collections/kerasformers/t5-6a85056935f438653698c56f
