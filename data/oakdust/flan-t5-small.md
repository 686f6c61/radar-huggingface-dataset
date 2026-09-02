# oakDust/flan-t5-small

## Resumen

El modelo `oakDust/flan-t5-small` es una copia del checkpoint original `google/flan-t5-small`, un modelo de lenguaje de tipo texto-a-texto (text2text-generation) desarrollado por Google Research. FLAN-T5 es una versión mejorada de T5 mediante fine-tuning con instrucciones en más de 1000 tareas, lo que le permite seguir instrucciones en lenguaje natural sin necesidad de adaptación específica por tarea. Este tamaño "small" tiene 77 millones de parámetros, lo que lo hace extremadamente ligero y desplegable en entornos con recursos limitados, como CPUs o GPUs de gama baja.

La relevancia actual de este modelo radica en su equilibrio entre rendimiento y eficiencia: a pesar de su tamaño reducido, ofrece capacidades sólidas en traducción, respuesta a preguntas, razonamiento lógico y generación de texto, superando a modelos mucho más grandes en tareas de few-shot gracias al ajuste por instrucciones. Es una opción práctica para prototipos, pipelines de bajo coste y aplicaciones donde la latencia y el consumo de memoria son críticos.

El modelo está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y se distribuye en formato safetensors, compatible con los ecosistemas PyTorch, TensorFlow y JAX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (Transformer encoder-decoder) |
| Parametros totales | 76.961.152 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (estándar T5: 512 tokens, no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (compatible con FP16, INT8 mediante bitsandbytes) |
| Idiomas soportados | en, fr, ro, de, multilingual (según tags; la model card menciona más de 50 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FLAN-T5 mantiene la arquitectura original de T5: un transformer encoder-decoder con atención completa, sin mecanismos de sparse o MoE. El modelo "small" tiene 6 capas en cada componente, 512 dimensiones ocultas y 8 cabezas de atención. El entrenamiento se realizó en dos fases: primero un preentrenamiento estándar de T5 sobre el corpus C4, y posteriormente un fine-tuning con instrucciones en más de 1000 tareas adicionales, incluyendo los datasets listados en la model card (QReCC, Taskmaster2, WikiDialog, CodeContests, LAMBADA, GSM8K, AQuA-RAT, e-SNLI, QuaSC, QED). Este proceso de instruction tuning es la clave de su capacidad para generalizar a tareas no vistas.

El paper de referencia (arxiv:2210.11416) describe el método de instruction tuning aplicado a la familia FLAN-T5, demostrando que modelos pequeños como este pueden alcanzar un rendimiento competitivo en few-shot frente a modelos mucho más grandes. No se aplicaron técnicas de RLHF ni DPO; el ajuste se basó exclusivamente en supervisión directa con instrucciones.

## Capacidades

- Generación de texto en formato texto-a-texto: traducción, resumen, paráfrasis, respuesta a preguntas, clasificación y generación creativa.
- Razonamiento lógico y matemático: puede resolver problemas de aritmética, lógica booleana y razonamiento paso a paso (chain-of-thought) cuando se le pide explícitamente.
- Comprensión de lenguaje natural: entiende premisas e hipótesis para tareas de entailment, y responde a preguntas de conocimiento científico.
- Soporte multilingüe: entrenado en más de 50 idiomas, con especial énfasis en inglés, francés, rumano y alemán (según los tags).
- No soporta tool calling ni function calling de forma nativa, ni capacidades de agente autónomo; es un modelo de generación condicionada puro.
- No incluye modo de pensamiento explícito (thinking mode) ni capacidades multimodales (visión, audio).

## Casos de uso

- Traducción automática en tiempo real: el modelo puede traducir entre los idiomas soportados (ej. inglés a alemán) con baja latencia, adecuado para aplicaciones de chat o subtitulado en directo.
- Respuesta a preguntas en dominios específicos: integrable en sistemas de FAQ o asistentes virtuales para responder consultas factuales (ej. punto de ebullición del nitrógeno) con un prompt adecuado.
- Razonamiento lógico en educación: útil para generar explicaciones paso a paso en problemas de lógica o matemáticas, como apoyo en plataformas de aprendizaje automático.
- Clasificación de texto y análisis de sentimiento: al ser un modelo texto-a-texto, puede etiquetar textos (positivo/negativo, categorías) mediante prompts, sin necesidad de fine-tuning adicional.
- Generación de resúmenes de documentos: procesa artículos o informes y produce resúmenes concisos, aprovechando su capacidad de instrucción.
- Prototipado rápido de NLP: por su tamaño reducido, es ideal para validar ideas y pipelines en entornos de desarrollo sin GPU, antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de Google no incluye tablas de evaluación específicas para el checkpoint "small"; el paper general de FLAN-T5 reporta resultados para la familia completa, pero no se desglosan por tamaño en la documentación accesible. Se recomienda consultar el paper original para métricas agregadas.

## Requisitos de hardware

- VRAM estimada: en FP32, el modelo ocupa aproximadamente 308 MB (77M × 4 bytes); en FP16, unos 154 MB; en INT8, unos 77 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluyendo GTX 1050, RTX 2060, RTX 3060, o incluso GPUs integradas. También funciona en CPU sin problemas.
- Despliegue en consumer GPU: sí, es totalmente viable en GPUs de gama baja y en CPU.
- Opciones de despliegue: compatible con Hugging Face Transformers (PyTorch, TensorFlow, JAX), vLLM (aunque no es óptimo para modelos tan pequeños), llama.cpp (con conversión a GGUF), y Ollama (si se convierte). También se puede servir con TGI (Text Generation Inference).
- Latencia y throughput: en CPU, una generación de 50 tokens típicamente tarda entre 0.5 y 2 segundos; en GPU, menos de 100 ms. No se dispone de cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| flan-t5-small (este) | 77M | no disponible | Apache 2.0 | Instrucción, texto-a-texto |
| flan-t5-base | 248M | no disponible | Apache 2.0 | Instrucción, texto-a-texto |
| flan-t5-large | 783M | no disponible | Apache 2.0 | Instrucción, texto-a-texto |
| t5-small (original) | 60M | 512 | Apache 2.0 | Texto-a-texto sin instrucciones |

La comparativa se limita a la familia FLAN-T5, ya que no se dispone de datos de otros modelos comparables en la información proporcionada. flan-t5-small ofrece un rendimiento superior a t5-small en tareas de instrucción, pero inferior a flan-t5-base y flan-t5-large en precisión, a costa de un mayor consumo de recursos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre C4 y datasets de instrucciones, puede reflejar sesgos de género, raza o cultura presentes en los datos de origen.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Limitaciones de contexto: la longitud de contexto no está confirmada en la ficha, pero se hereda de T5 (512 tokens), lo que limita el manejo de documentos largos o conversaciones extensas.
- Limitaciones de idioma: aunque soporta muchos idiomas, el rendimiento es desigual; los idiomas con menos representación en el entrenamiento pueden dar resultados de menor calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente y no se ofrece garantía.
- Caveat para producción: al ser un modelo pequeño, su precisión en tareas complejas es limitada; se recomienda evaluar con datos propios antes de desplegar en entornos críticos.

## Enlaces

- HuggingFace (copia de oakDust): https://huggingface.co/oakDust/flan-t5-small
- HuggingFace (original de Google): https://huggingface.co/google/flan-t5-small
- Documentación de FLAN-T5 en Transformers: https://huggingface.co/docs/transformers/model_doc/flan-t5
- Paper de FLAN-T5: https://arxiv.org/abs/2210.11416
- Repositorio T5X (Google): https://github.com/google-research/t5x
- Model card original (con más detalles): https://huggingface.co/google/flan-t5-small
