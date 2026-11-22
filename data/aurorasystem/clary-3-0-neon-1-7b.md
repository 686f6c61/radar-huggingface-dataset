# AuroraSystem/Clary-3.0-Neon-1.7B

## Resumen

Clary 3.0 Neon es un modelo de lenguaje de 1.720.574.976 parámetros (1,7B) desarrollado por AuroraSystem, un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-1.7B de Alibaba. Está especializado en generación de texto con razonamiento explícito y está diseñado para ser bilingüe ruso/inglés, con un enfoque claro en tareas de razonamiento e instrucción. Se distribuye bajo licencia Apache 2.0 y formato safetensors, lo que facilita su integración en pipelines de transformers y su uso comercial sin restricciones adicionales.

El modelo resuelve el problema de disponer de un asistente de razonamiento compacto y bilingüe que quepa en hardware modesto. Su principal innovación es el control de la profundidad de razonamiento mediante un sistema de cuatro niveles de "reasoning effort" inyectado en el system prompt, lo que permite al usuario ajustar el coste computacional y la verbosidad del razonamiento según la tarea. Aunque el modelo base Qwen3-1.7B soporta hasta 40.960 tokens de contexto, el entrenamiento se realizó con secuencias de 2.048 tokens, por lo que el rendimiento más allá de esa longitud no está validado.

El modelo es relevante para desarrolladores que necesitan un asistente de razonamiento ligero, desplegable en GPU de consumo, con soporte nativo para ruso e inglés y con la flexibilidad de un modelo abierto. Su tamaño compacto y su licencia permisiva lo hacen adecuado para prototipado rápido, entornos con recursos limitados y aplicaciones donde la latencia y el coste por token son críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) |
| Parámetros totales | 1.720.574.976 (1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens en el modelo base; entrenado a 2.048 tokens, calidad no validada más allá |
| Tipos de cuantización | No disponible (el repo solo contiene pesos en bfloat16/safetensors) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Clary 3.0 Neon hereda la arquitectura del Qwen3-1.7B: un transformer decoder-only con 28 capas, dimensión oculta de 2.048 y un vocabulario de 151.936 tokens. El modelo se entrenó en precisión bfloat16 sobre secuencias de 2.048 tokens. El ajuste fino se realizó sobre un corpus curado de aproximadamente 15.000 ejemplos de razonamiento (15.041 de entrenamiento y 347 de evaluación), en formato ChatML con trazas de `reasoning_content` y cuatro niveles de esfuerzo de razonamiento (reasoning effort). No se menciona el uso de RLHF o DPO en la información disponible; el entrenamiento parece ser de tipo instruction-tuning supervisado sobre trazas de razonamiento.

La innovación técnica destacable es el control explícito de la profundidad de razonamiento mediante el system prompt. El usuario puede seleccionar entre cuatro niveles de esfuerzo, lo que modifica la longitud y detalle de la cadena de pensamiento antes de la respuesta final. El modelo soporta `enable_thinking=True` en la plantilla de chat, lo que activa la generación de trazas de razonamiento. No se han documentado innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento multi-paso con trazas explícitas de pensamiento (`reasoning_content`).
- Control de la profundidad de razonamiento mediante cuatro niveles de esfuerzo configurables en el system prompt (low, medium, high y presumiblemente un cuarto nivel no detallado).
- Instrucción y chat conversacional en ruso e inglés.
- Razonamiento estructurado orientado a tareas de tipo benchmark (ABench75), con puntuaciones del 80,5% en crudo y 82,5% limpio.
- Soporte de plantilla ChatML con `apply_chat_template` y `enable_thinking`.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades.
- Capacidad limitada para conversación casual y escritura creativa abierta, según el autor.

## Casos de uso

- Asistente de razonamiento en ruso para atención al cliente: el modelo puede gestionar consultas multi-turno en ruso con trazas de razonamiento que permiten auditar la lógica de la respuesta, gracias a su soporte bilingüe y a la plantilla ChatML.
- Generación de respuestas estructuradas en inglés para documentación técnica: el modo de razonamiento alto produce respuestas detalladas y organizadas, adecuadas para explicar conceptos complejos o resolver dudas técnicas en entornos de soporte interno.
- Prototipado rápido de agentes conversacionales: su tamaño de 1,7B permite desplegarlo en una GPU de consumo (por ejemplo, RTX 4090) con cuantización, lo que facilita iterar sobre prompts y flujos de razonamiento sin costes de infraestructura elevados.
- Evaluación de cadenas de razonamiento en investigación: el modelo expone trazas de `reasoning_content` y permite ajustar el esfuerzo, lo que lo convierte en una herramienta útil para estudiar cómo varía la calidad del razonamiento con la profundidad solicitada.
- Tareas de razonamiento acotadas en entornos educativos o de formación: puede resolver problemas paso a paso en ruso o inglés, con la posibilidad de seleccionar un esfuerzo bajo para respuestas rápidas o alto para explicaciones detalladas.
- Integración en pipelines de generación de texto con Transformers: al ser compatible con `text-generation-inference` y `endpoints_compatible`, puede desplegarse en infraestructuras estándar de Hugging Face sin adaptaciones adicionales.
- Clasificación y extracción de información con razonamiento justificado: el modelo puede generar una cadena de pensamiento antes de emitir una etiqueta o extracción, lo que facilita la verificación manual en flujos de anotación semiautomática.

## Benchmarks y rendimiento

El autor publica resultados en ABench75 (375 tareas, puntuación automática por regex) con decodificación greedy y `max_new_tokens=1536`:

| Split | Tareas | Puntuación bruta | Puntuación limpia |
|---|---:|---:|---:|
| Público | 300 | 80,0% | 82,1% |
| Privado | 75 | 82,7% | 84,5% |
| Combinado | 375 | 80,5% | 82,5% |

La puntuación "limpia" excluye 14 tareas que se solapan con el conjunto de entrenamiento; 30 respuestas vacías en el split público y 5 en el privado se contabilizan como errores en ambas columnas. El autor indica que, con esfuerzo `low`, las puntuaciones son más estables (82,3/81,3). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada con cuantización a 8 bits: alrededor de 2 GB para pesos; con 4 bits, alrededor de 1,2 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para inferencia en bfloat16 sin cuantización; GPUs con 8 GB o más son suficientes para cuantización en 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 (12 GB) y superiores, especialmente con cuantización.
- Opciones de despliegue: transformers (nativo), text-generation-inference (TGI), endpoints compatibles de Hugging Face. No se ha documentado soporte explícito para vLLM, llama.cpp u Ollama en la información disponible, aunque al ser un modelo Qwen3 es probable que herramientas compatibles con Qwen3 puedan adaptarse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---|---|---|---|
| Clary 3.0 Neon | 1,7B | 40.960 (entrenado a 2.048) | Apache 2.0 | ru, en | Fine-tuning de Qwen3-1.7B con razonamiento controlado |
| Qwen3-1.7B (base) | 1,7B | 40.960 | Apache 2.0 | multilingüe | Modelo base sin ajuste específico para ruso ni control de esfuerzo |
| SmolLM2-1.7B | 1,7B | 8.192 | Apache 2.0 | en (principalmente) | Alternativa compacta de Hugging Face, sin enfoque bilingüe ru/en |
| Gemma 3 1B | 1B | 32.768 | Gemma license | multilingüe | Modelo de Google con licencia más restrictiva y sin control de razonamiento explícito |

La comparativa se basa en características públicas de los modelos; no se dispone de resultados de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- El modo de esfuerzo alto puede no cerrar el bloque de pensamiento (`thinking`) y agotar el límite de generación; se recomienda usar `low` o `medium`, o bien `max_new_tokens=4096`.
- El entrenamiento se realizó con secuencias de 2.048 tokens; el rendimiento con contextos más largos no está validado, aunque el modelo base soporte 40.960 tokens.
- El corpus de entrenamiento es curado y específico de razonamiento; se debe verificar la ortografía rusa y los hechos generados antes de usarlos en producción.
- La conversación casual y la escritura creativa abierta están limitadas según el propio autor.
- El modelo no está alineado en seguridad más allá de los datos de entrenamiento; puede generar contenido inapropiado o sesgado.
- No se han documentado sesgos específicos, pero al derivar de Qwen3-1.7B puede heredar sesgos del modelo base y del corpus de ajuste.
- Riesgo de alucinación inherente a modelos de 1,7B, especialmente en tareas de conocimiento factual.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AuroraSystem/Clary-3.0-Neon-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
