# OP12138/qwen3-base

## Resumen

OP12138/qwen3-base es un fine-tune del modelo Qwen3-1.7B-Base, publicado por el usuario OP12138 en HuggingFace. Se trata de una adaptación del modelo base de la familia Qwen3, que destaca por su arquitectura densa de 2.031.739.904 parámetros totales y una ventana de contexto de 32.768 tokens. El modelo conserva las capacidades del Qwen3 base, incluyendo el modo de razonamiento explícito (thinking mode) y el modo no reflexivo, junto con soporte multilingüe amplio.

La relevancia de este modelo reside en que ofrece una versión fine-tuneada del Qwen3-1.7B-Base bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. Al estar basado en el modelo base (no instructivo), está pensado para desarrolladores que necesitan un punto de partida para fine-tunes adicionales o para tareas de generación de texto sin alineamiento previo con instrucciones. El repositorio incluye pesos en formato safetensors y es compatible con transformers, vLLM, SGLang y otras herramientas de despliegue.

Cabe señalar que la model card del repositorio es una copia de la del modelo base Qwen3-1.7B, por lo que no se especifican los datos de entrenamiento ni la metodología del fine-tune realizado por OP12138. Esto limita la evaluación de las capacidades específicas de esta adaptación concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model (Transformer denso con GQA) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No especificados (safetensors en FP32/FP16 presumiblemente) |
| Idiomas soportados | 100+ idiomas y dialectos (según modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B-Base: un transformer causal denso de 28 capas, con atención de consulta agrupada (GQA) con 16 cabezas de consulta y 8 cabezas de clave/valor. Los parámetros no-embedding suman aproximadamente 1.4B, lo que indica que una porción significativa de los pesos corresponde a las capas de embedding. La ventana de contexto es de 32.768 tokens, lo que permite manejar secuencias largas sin necesidad de técnicas de windowing.

Respecto al entrenamiento, no hay información disponible sobre el proceso de fine-tuning aplicado por OP12138. No se especifican el dataset utilizado, el número de tokens de entrenamiento, la técnica de alineación (RLHF, DPO, etc.) ni las épocas. Dado que el modelo se basa en Qwen3-1.7B-Base, hereda la fase de preentrenamiento de Qwen3, que incluyó un corpus extenso multilingüe y técnicas de post-entrenamiento para el modo de razonamiento, aunque al ser la variante base no incluye el alineamiento con preferencias humanas que sí tiene la versión instruct.

El modelo base Qwen3-1.7B soporta el cambio entre modo de pensamiento (thinking mode) y modo no reflexivo mediante el parámetro `enable_thinking` en el template de chat. En modo thinking, el modelo genera una cadena de razonamiento antes de la respuesta final, lo que mejora el rendimiento en tareas de lógica, matemáticas y código. En modo no-thinking, genera respuestas directas con menor latencia.

## Capacidades

- Generación de texto causal con soporte de modos de razonamiento explícito (thinking mode) y no reflexivo, activables mediante `enable_thinking` en el template del tokenizer.
- Razonamiento lógico y matemático mejorado respecto a Qwen2.5, con capacidades de resolución de problemas multi-step.
- Generación de código y asistencia en tareas de programación, con soporte de múltiples lenguajes.
- Comprensión y generación multilingüe en más de 100 idiomas y dialectos, incluyendo traducción e instrucciones multilingües.
- Capacidades de agentes y tool calling, aunque el modelo base no tiene alineamiento específico para function calling (eso corresponde a la variante instruct).
- Procesamiento de contexto largo de hasta 32.768 tokens, útil para documentos extensos o conversaciones multi-turno.

## Casos de uso

- Pre-entrenamiento continuado o fine-tuning de dominio: al ser una versión base, es adecuado como punto de partida para entrenar modelos especializados en dominios concretos (legal, médico, técnico) sin el sesgo de alineamiento de los modelos instruct.
- Generación de texto en producción con control de razonamiento: se puede activar el modo thinking para tareas que requieren explicación paso a paso, o desactivarlo para respuestas rápidas en sistemas de chat.
- Implementación de asistentes conversacionales multilingües: la ventana de 32K tokens permite mantener contexto largo en diálogos de soporte al cliente en múltiples idiomas.
- Evaluación de capacidad de razonamiento en investigación: útil para comparar arquitecturas densas de 2B parámetros en benchmarks de lógica y matemáticas.
- Generación de código en entornos de desarrollo asistido: el modo thinking permite generar código con explicación de decisiones, útil para documentación automática.
- Despliegue en edge computing: con 2B parámetros, puede ejecutarse en GPUs de consumo moderado o CPU con cuantización, permitiendo aplicaciones locales de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el fine-tune OP12138/qwen3-base en la información disponible. El modelo base Qwen3-1.7B (no fine-tuneado) reporta resultados en el blog oficial de Qwen, incluyendo mejoras en matemáticas, código y razonamiento de sentido común respecto a Qwen2.5-1.5B, pero estos datos no son directamente aplicables a esta variante específica sin confirmación del autor. Se recomienda evaluar el modelo en los casos de uso previstos antes de su despliegue en producción.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 4.1 GB (2.03B parámetros × 2 bytes por parámetro), más overhead de activaciones y KV cache. Con contexto de 32K tokens, la VRAM puede aumentar hasta 6-8 GB.
- Cuantización en 8 bits: ~2.1 GB de pesos, viable en GPUs con 6 GB de VRAM como RTX 2060 o RTX 3050.
- Cuantización en 4 bits: ~1.1 GB de pesos, ejecutable en GPUs con 4 GB de VRAM (GTX 1650, RTX 3050 Mobile) y en CPU con llama.cpp.
- GPU recomendadas para producción: NVIDIA A10G, L4, RTX 4090 o superiores para inferencia con contexto largo.
- Compatible con consumer GPUs: sí, es viable en RTX 3060, RTX 4070, etc., con cuantización adecuada.
- Opciones de despliegue: vLLM (>=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama, LMStudio, MLX-LM y KTransformers.
- Latencia estimada: en una RTX 4090 con FP16, throughput de 50-100 tokens/s para generación; en CPU con llama.cpp cuantizado, 5-15 tokens/s dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OP12138/qwen3-base | 2.03B | 32K | Transformer denso | Apache 2.0 | HuggingFace |
| Qwen3-1.7B-Base (original) | 1.7B (2.03B reales) | 32K | Transformer denso | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B | 1.54B | 32K | Transformer denso | Apache 2.0 | HuggingFace |
| Llama-3.2-1B | 1.23B | 128K | Transformer denso | Llama 3.2 Community | HuggingFace |
| Gemma-2-2B | 2.61B | 8K | Transformer denso | Gemma License | HuggingFace |

La comparativa con modelos de tamaño similar muestra que Qwen3-1.7B destaca por su contexto largo (32K) y su soporte de modos de razonamiento, mientras que Llama-3.2-1B ofrece contexto más amplio pero menos capacidad de razonamiento explícito. Gemma-2-2B tiene más parámetros pero contexto limitado a 8K. El fine-tune de OP12138 no añade diferencias estructurales respecto al modelo base, por lo que la comparación se mantiene similar.

## Limitaciones y advertencias

- El modelo es una versión base, no instructiva: no está alineado con preferencias humanas, por lo que puede generar contenido incoherente, repetitivo o no deseado si se usa directamente en conversaciones sin fine-tuning adicional.
- No se dispone de información sobre el dataset de fine-tuning ni sobre la metodología aplicada por OP12138, lo que impide conocer los sesgos potenciales introducidos en esta adaptación específica.
- Riesgo de alucinaciones en modo no reflexivo: al desactivar el thinking mode, el modelo puede generar afirmaciones falsas o inventadas, especialmente en dominios factuales.
- La generación en modo thinking puede producir cadenas de razonamiento extensas que incrementan la latencia y el coste computacional; se recomienda limitar `max_new_tokens` en producción.
- Si se producen repeticiones excesivas, se recomienda ajustar `presence_penalty` a 1.5 según las prácticas recomendadas por Qwen.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo base tiene restricciones de uso para ciertos casos (no especificados en la model card).
- No se han publicado resultados de evaluación específicos de este fine-tune, por lo que su rendimiento real no puede verificarse sin pruebas independientes.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/OP12138/qwen3-base
- Modelo base original: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
