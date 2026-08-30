# Rin247/Qwen3.5-9B-Uncensored-Aquarion-INT8

## Resumen

El modelo `Rin247/Qwen3.5-9B-Uncensored-Aquarion-INT8` es una cuantización INT8 *weight-only* del modelo base `Qwen3.5-9B`, publicada por el usuario Rin247 en Hugging Face. Se trata de una variante "uncensored" (sin censura) obtenida mediante una técnica de *abliteración* que elimina la dirección de rechazo del modelo original mediante proyección ortogonal, antes de aplicar la cuantización. El resultado es un modelo de 8.953.803.264 parámetros (aproximadamente 9B) en formato `safetensors` con pesos cuantizados a 8 bits, pensado para su uso en entornos donde se requiera una generación de texto sin filtros de seguridad.

La relevancia de este modelo radica en que combina la capacidad del modelo base Qwen3.5-9B (que, según la colección oficial de Qwen, incluye mejoras en razonamiento, código y agentes) con una cuantización ligera que reduce los requisitos de memoria, facilitando su despliegue en hardware de consumo. Sin embargo, al tratarse de una versión *uncensored*, su uso conlleva riesgos importantes y no está recomendado para aplicaciones comerciales sin una evaluación cuidadosa. La licencia no está especificada, lo que añade incertidumbre legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B, sin detalles adicionales) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (weight-only, RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers de escala y forma para dequantizacion) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo `Qwen3.5-9B`, del que no se proporcionan detalles técnicos en la información disponible. La colección oficial de Qwen3.5 menciona una "unified vision-language foundation" con entrenamiento temprano en billones de tokens multimodales, lo que sugiere que el modelo base podría tener capacidades multimodales, aunque no se confirma para esta variante específica.

El proceso de creación de este modelo incluye dos pasos principales: primero, una *abliteración* mediante proyección ortogonal de la dirección de rechazo (refusal direction) del modelo original, lo que elimina los mecanismos de negativa ante peticiones consideradas inapropiadas. Segundo, una cuantización INT8 *weight-only* realizada con PyTorch RTN (Round-to-Nearest) en CPU, almacenando las escalas y formas junto a los pesos. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto sin filtros de seguridad (uncensored), gracias a la abliteración.
- Hereda las capacidades del modelo base Qwen3.5-9B, que según la documentación oficial incluye razonamiento, generación de código, agentes y comprensión visual (aunque no se confirma para esta variante).
- Soporte de cuantización INT8, lo que permite inferencia con menor uso de memoria que el modelo original en FP16.
- No se dispone de información específica sobre tool calling, function calling, multilingüismo o modos especiales (thinking, visión, audio) para esta variante.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa, poesía o diálogos con temáticas que otros modelos censurarían, gracias a la abliteración. Es adecuado para autores que necesitan explorar contenido controvertido o maduro.
- Investigación en seguridad de IA: permite estudiar el comportamiento de modelos sin mecanismos de rechazo, analizando sesgos, alucinaciones o respuestas a prompts maliciosos en un entorno controlado.
- Generación de código en entornos aislados: al ser una cuantización INT8, puede ejecutarse en GPUs de consumo (p. ej., RTX 3090) para tareas de autocompletado o generación de scripts, aunque sin garantías de calidad respecto al modelo original.
- Prototipado de chatbots sin moderación: para demos internas o pruebas de concepto donde se requiera una respuesta sin filtros, siempre que se asuma el riesgo legal y ético.
- Fine-tuning posterior: los pesos cuantizados pueden servir como punto de partida para ajustes adicionales con técnicas de dequantización, aunque el proceso es complejo y no está documentado.
- Evaluación de cuantización: útil para comparar el impacto de la cuantización INT8 en el rendimiento de un modelo abliterado frente a su versión completa, en términos de perplejidad o calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para esta variante cuantizada. Tampoco se ofrecen comparaciones con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~9B parámetros en INT8 ocupa aproximadamente 9 GB de pesos, más overhead de activaciones y buffers, por lo que se estima un consumo de 10-12 GB de VRAM. Esto permite ejecutarlo en GPUs con 12 GB o más.
- GPUs recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A10 (24 GB), o GPUs de datacenter como A100 (40/80 GB) para mayor margen.
- En consumer GPU: sí, cabe en RTX 3090/4090 y en GPUs con 12 GB (p. ej., RTX 3060) si se reduce el batch o se usa offloading a CPU.
- Opciones de despliegue: al ser un formato safetensors con cuantización personalizada, no es directamente compatible con vLLM, llama.cpp u Ollama sin un proceso de dequantización previo. Se requiere un motor de inferencia que soporte los buffers de escala y forma (p. ej., código personalizado en PyTorch).
- Latencia y throughput: no disponibles. Dependerán del hardware y del motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/Qwen3.5-9B-Uncensored-Aquarion-INT8 | 8.95B | INT8 weight-only | no disponible | no disponible | Hugging Face |
| Rin247/Qwen3-8B-Uncensored-Aquarion-INT8 | ~8B | INT8 weight-only | no disponible | no disponible | Hugging Face |
| jaahas/qwen3.5-uncensored (Ollama) | ~9B (presumible) | GGUF (varias) | no disponible | no disponible | Ollama |
| Qwen3.5-9B (base) | ~9B | FP16/BF16 | no disponible | Apache 2.0 (presumible) | Hugging Face |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre estas variantes es el método de cuantización (INT8 personalizado vs. GGUF) y el proceso de abliteración. El modelo base Qwen3.5-9B probablemente tenga mejor rendimiento que las versiones cuantizadas, pero no hay métricas que lo confirmen.

## Limitaciones y advertencias

- Al ser un modelo *uncensored*, puede generar contenido ofensivo, ilegal, sexualmente explícito o peligroso. Su uso conlleva riesgos legales y éticos significativos.
- La abliteración puede degradar la calidad general del modelo, ya que elimina una dirección de activación que también puede estar relacionada con la coherencia o el razonamiento.
- La cuantización INT8 *weight-only* puede introducir pérdida de precisión, afectando a tareas que requieren alta exactitud (matemáticas, código complejo).
- No se dispone de información sobre la licencia, lo que impide determinar si es legal su uso comercial o incluso su redistribución.
- El formato de pesos es propietario (con buffers de escala y forma), lo que dificulta su integración en frameworks estándar como vLLM o llama.cpp sin adaptaciones.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que se desconoce su comportamiento real en tareas específicas.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Rin247/Qwen3.5-9B-Uncensored-Aquarion-INT8)
- [Modelo similar Qwen3-8B-Uncensored-Aquarion-INT8](https://huggingface.co/Rin247/Qwen3-8B-Uncensored-Aquarion-INT8)
- [Colección oficial Qwen3.5](https://huggingface.co/collections/Qwen/qwen35)
- [Variante uncensored en Ollama](https://ollama.com/jaahas/qwen3.5-uncensored)
- [Noticia sobre fine-tunes uncensored de Qwen 3.5 9B](https://uncensoredhub.ai/news/2026-07-11-qwen-3-5-9b-uncensored-writer-fine-tunes-land-in-gguf-quantizations)
- [Repositorio GitHub de Qwen3.5](https://github.com/ABDtmx/Qwen3.5)
