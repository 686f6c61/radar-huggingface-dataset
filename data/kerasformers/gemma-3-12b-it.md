# kerasformers/gemma-3-12b-it

## Resumen

`kerasformers/gemma-3-12b-it` es una conversión íntegra en Keras 3 del modelo `google/gemma-3-12b-it`, desarrollada por el proyecto KerasFormers. Esta versión permite ejecutar el mismo checkpoint en TensorFlow, PyTorch o JAX sin modificar el código, gracias a la capa de abstracción de Keras 3. Se trata del checkpoint ajustado por instrucciones (instruction-tuned) de Gemma 3 12B, que acepta entradas multimodales (imagen + texto) y genera texto.

El modelo resuelve el problema de la portabilidad entre frameworks: los desarrolladores que trabajan con Keras pueden cargar pesos oficiales de Google sin depender de la implementación de referencia en PyTorch o JAX. Es relevante ahora porque Gemma 3 es una familia de modelos abiertos de última generación con capacidades multimodales, y esta conversión amplía su accesibilidad en ecosistemas TensorFlow y Keras.

La arquitectura subyacente es un transformer multimodal con 12 000 millones de parámetros (aproximadamente 12,9 B en total), con una ventana de contexto de 128 000 tokens. Los pesos se almacenan en bfloat16 y el tamaño del repositorio es de 24,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen + texto) con atención local y global (Gemma 3) |
| Parametros totales | ~12,9 mil millones (12B nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | bfloat16 por defecto; soporta `float32` y `int8` mediante parámetro `load_dtype`/`quantization` |
| Idiomas soportados | Multilingüe (el modelo original de Google soporta más de 140 idiomas; la model card de KerasFormers indica `en`) |
| Licencia | Gemma (licencia propietaria de Google, de uso gratuito con restricciones) |
| Formato de pesos | no disponible (pesos en bfloat16; probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-3-12b-it` es un transformer decoder-only con un codificador de visión (SigLIP) para procesar imágenes. Gemma 3 introduce una atención híbrida: capas con atención global y capas con atención local (ventana de 1024 tokens) para reducir el coste computacional en secuencias largas. El entrenamiento del modelo original incluyó una fase de preentrenamiento sobre un corpus multilingüe masivo (no se especifica el número exacto de tokens en la información disponible) y un posterior ajuste fino con instrucciones y preferencias humanas (RLHF/DPO).

La conversión de KerasFormers no modifica los pesos; simplemente los reempaqueta en el formato de Keras 3. La implementación `Gemma3ConditionalGenerate` permite generar texto a partir de imágenes y texto, mientras que `Gemma3TextGenerate` se limita a texto. El proyecto KerasFormers proporciona una API unificada que funciona con cualquier backend de Keras (TensorFlow, PyTorch o JAX).

## Capacidades

- Generación de texto con instrucciones (instruction-tuned).
- Comprensión de imágenes: puede describir imágenes, responder preguntas visuales y razonar sobre contenido visual.
- Razonamiento de varios pasos (multi-step reasoning) gracias a la arquitectura transformer y al ajuste fino.
- Soporte multilingüe (el modelo original cubre más de 140 idiomas, aunque la model card de esta conversión solo declara inglés).
- Ventana de contexto larga (128 000 tokens) para documentos extensos y conversaciones de muchos turnos.
- No se menciona soporte explícito de tool calling ni function calling en la información disponible, pero el modelo base de Gemma 3 sí lo incluye; esta conversión hereda las capacidades del checkpoint original.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede mantener diálogos que incluyen imágenes, por ejemplo, un asistente de soporte que recibe capturas de pantalla y responde con instrucciones.
- Análisis de documentos con gráficos y tablas: gracias a la ventana de 128K tokens, puede procesar documentos largos con figuras y extraer conclusiones.
- Generación de descripciones accesibles: crear textos alternativos para imágenes en aplicaciones web o de gestión de contenidos.
- Educación y tutoría: explicar conceptos a partir de diagramas o fotografías, útil en plataformas de e-learning.
- Investigación en visión y lenguaje: como modelo base para fine-tuning en tareas específicas (VQA, captioning, etc.) usando la flexibilidad de Keras.
- Prototipado rápido en TensorFlow/JAX: los equipos que ya usan Keras pueden integrar Gemma 3 sin cambiar de framework, reduciendo el coste de adopción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de KerasFormers no incluye métricas de rendimiento. Para datos de evaluación del modelo original, se debe consultar la ficha de `google/gemma-3-12b-it` y el paper técnico (arXiv:2503.19786).

## Requisitos de hardware

- VRAM estimada: en bfloat16, el modelo ocupa aproximadamente 24,4 GB (pesos) más overhead de activaciones y caché KV. Para una ventana de 128K tokens, la memoria puede superar los 60 GB. Con cuantización int8, la huella se reduce a unos 12-13 GB, pero la caché KV sigue siendo dominante.
- GPU recomendadas: para inferencia en bfloat16 se necesita una GPU con al menos 32 GB (p. ej., A100 40GB, H100, o RTX 6000 Ada). Con int8, una RTX 4090 (24 GB) puede funcionar para secuencias cortas.
- En consumer GPU: es posible con cuantización int8 y secuencias de longitud moderada (menos de 4096 tokens) en una RTX 4090 o similar.
- Opciones de despliegue: al ser una implementación Keras, se puede usar con TensorFlow Serving o exportar a TensorFlow Lite; también es compatible con JAX y PyTorch, por lo que se puede servir con vLLM o TGI si se convierte a esos formatos. La documentación de KerasFormers sugiere el uso directo en Python.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La siguiente tabla compara el modelo base `google/gemma-3-12b-it` con otras alternativas de tamaño similar (datos públicos del modelo original):

| Modelo | Parámetros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Gemma 3 12B (este) | ~12,9 B | 128K | Sí | Gemma |
| Llama 3.1 8B | 8 B | 128K | No | Llama 3.1 (comunitaria) |
| Mistral 7B | 7 B | 32K | No | Apache 2.0 |
| Qwen 2.5 14B | 14 B | 128K | No | Apache 2.0 (variante) |

Esta conversión de KerasFormers no altera el rendimiento respecto al original; la comparativa se basa en las especificaciones del checkpoint de Google. Para una comparativa de benchmarks, se recomienda consultar el paper de Gemma 3.

## Limitaciones y advertencias

- Licencia Gemma: es una licencia propietaria que permite uso comercial gratuito con ciertas restricciones (por ejemplo, no usar para fines militares o de vigilancia). Es necesario aceptar los términos en la página de HuggingFace del modelo original.
- Sesgos: como todo modelo entrenado con datos de internet, puede reflejar sesgos sociales, culturales o de género.
- Alucinaciones: puede generar información plausible pero incorrecta, especialmente en tareas de razonamiento complejo o cuando se le piden datos precisos.
- Limitaciones de idioma: aunque el modelo original es multilingüe, la model card de esta conversión solo declara inglés; el rendimiento en otros idiomas puede ser inferior.
- Contexto largo: aunque soporta 128K tokens, la atención local puede degradar la coherencia en pasajes muy extensos.
- Requisitos de hardware: la inferencia con contexto largo requiere mucha memoria, lo que puede ser prohibitivo en entornos con recursos limitados.
- Dependencia de Keras: la conversión requiere la librería `kerasformers` y Keras 3; no es un checkpoint estándar de HuggingFace Transformers, por lo que no se puede cargar con `AutoModel` sin adaptación.

## Enlaces

- HuggingFace (conversión): https://huggingface.co/kerasformers/gemma-3-12b-it
- HuggingFace (modelo original): https://huggingface.co/google/gemma-3-12b-it
- Paper técnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Repositorio KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Gemma 3 en KerasFormers: https://imvision12.github.io/KerasFormers/gemma3/
