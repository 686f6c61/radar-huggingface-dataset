# navyam-ai/navya-1c-sft-dpo-grpo-reasoning

+ respuesta final
- Repo: 5.2 GB
- Tags: finance, personal-finance, india, reasoning, chain-of-thought, distillation, chat
- Pipeline: text-generation
- Formato de pesos: safetensors (según parámetros totales de safetensors)
- Librería: transformers
- Descargas: 0, Likes: 0
- Estado: research proof-of-concept, sobreajuste, no producción.

Los resultados de búsqueda web no aportan nada relevante sobre el modelo: son de BCF (banco) y NavyAI (API unificada) que no es lo mismo. No hay benchmarks publicados. No hay requisitos de hardware específicos más allá de 1.31B, podemos estimar VRAM según cuantizaciones típicas.

Debo indicar "no disponible" cuando no haya datos. Para cuantizaciones: no se mencionan, pero por ser safetensors de 1.31B, repo 5.2GB, podemos decir que no se mencionan cuantizaciones oficiales; pero se puede inferir que se puede cuantizar. Mejor ser preciso: "no se han publicado cuantizaciones oficiales; se pueden generar GGUF, etc." Pero no inventar. La tabla pide "Tipos de cuantizacion" -> "no disponible (solo pesos completos en safetensors)". No sé si el repo contiene GGUF, probablemente no. Los tags no mencionan cuantizaciones. Así que "no disponible".

Para "Parámetros activos" solo si es MoE; no es MoE, así que puedo omitir o poner "No aplica". La instrucción dice "incluye SIEMPRE estas filas" y "Parámetros activos ... (solo si es MoE)". Para mantener la tabla completa, pondré "No aplica (no es MoE)".

Para "Formato de pesos": safetensors (según dato real de safetensors). Puede haber también otros, pero el repo es 5.2GB y el parámetro total es safetensors. Pondré "safetensors".

Para "Idiomas soportados": en, hi, bn, ta, te, mr, gu, kn, ml, pa, or, as, ur.

Para "Longitud de contexto": 4096.

Para "Arquitectura": Llama-recipe (transformer decoder con GQA, SwiGLU, RMSNorm, RoPE, embeddings atados).

Para "Licencia": Apache-2.0.

Ahora secciones:

## Resumen: Explicar qué es, quién lo desarrolla, qué problema resuelve y por qué es relevante. Mencionar arquitectura, tamaño, contexto. Debo usar la información del README. Es un modelo de 1.31B de Navyam AI (Bachatt), variante de razonamiento del modelo chat Navya-1c, enfocado en finanzas personales de India. Ha sido entrenado con SFT, DPO, GRPO y destilación de razonamiento desde DeepSeek-R1-Distill 14B. Es un PoC de investigación, no producción, que muestra el hábito de razonar con .
- Especializado en finanzas personales de India (ahorros, SIP, préstamos, crédito, seguros, impuestos).
- Multilingüe: inglés, hindi e idiomas indios (bengalí, tamil, telugu, marathi, gujarati, kannada, malayalam, punjabi, oriya, asamés, urdu). Pero ojo, el README dice "English and Hindi/Hinglish" para uso previsto, pero los idiomas soportados en el modelo card son muchos. Debo indicar que el uso previsto es inglés e hindi/Hinglish, pero el tokenizer y el modelo soportan más idiomas.
- Tool calling: no se menciona. Así que "No se ha documentado soporte para tool calling/function calling". Mejor decir "no disponible" o "no documentado".
- Agentes: no documentado.
- Capacidades especiales: formato de razonamiento con `.
- Especializado en preguntas de finanzas personales de India (ahorros, SIP, préstamos, crédito, seguros, impuestos).
- Multilingüe: inglés, hindi e idiomas de India (bengalí, tamil, telugu, marathi, gujarati, kannada, malayalam, punyabí, oriya, asamés, urdu). El uso previsto es inglés y hindi/Hinglish.
- No se ha documentado soporte para tool calling ni function calling.
- No se ha documentado soporte para agentes ni razonamiento multi-paso más allá del formato ## Resumen

Navya-1c-sft-dpo-grpo-reasoning es una variante de razonamiento del modelo chat Navya-1c, desarrollada por Navyam AI (Bachatt), con 1,31 mil millones de parámetros. Está diseñada para responder preguntas sobre finanzas personales de India (ahorros, SIP, préstamos, crédito, seguros e impuestos) en inglés y en hindi/Hinglish, generando un razonamiento explícito paso a paso en formato `` antes de la respuesta final. Su arquitectura sigue la receta Llama: transformer decoder con 26 capas, dimensión de modelo 2048, GQA 16/4 cabezas, SwiGLU, RMSNorm, RoPE y embeddings atados, con una ventana de contexto de 4096 tokens y un tokenizer personalizado de 64k.

El modelo se entrenó desde cero con alrededor de 103 mil millones de tokens y enfriamiento WSD en 8×H100, seguido de una secuencia de SFT, DPO, GRPO y una destilación de razonamiento a partir de un profesor DeepSeek-R1-Distill 14B ejecutado localmente sobre un corpus de preguntas de finanzas personales de India. Este checkpoint demuestra el hábito de razonar con `think`, pero el propio autor lo describe como una prueba de concepto de investigación: el corpus de destilación es pequeño, el modelo sufre sobreajuste (la pérdida de entrenamiento tiende a 0 mientras la pérdida de validación sube) y no debe considerarse un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (receta Llama): 26 capas, dim 2048, GQA 16/4 cabezas, SwiGLU, RMSNorm, RoPE, embeddings atados, tokenizer personalizado de 64k |
| Parametros totales | 1.306.634.240 (1,31 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (no se han publicado cuantizaciones oficiales; el repositorio contiene pesos completos en safetensors) |
| Idiomas soportados | inglés, hindi, bengalí, tamil, telugu, marathi, gujarati, kannada, malayalam, punyabí, oriya, asamés, urdu |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con la receta Llama: 26 capas, dimensión de modelo 2048, GQA con 16 cabezas de consulta y 4 de clave/valor, activación SwiGLU, normalización RMSNorm, codificación posicional RoPE y embeddings atados. El tokenizer es propio, con un vocabulario de 64k tokens y una plantilla de chat llamada navya-chat-v1, que utiliza roles tokenizados como `<|reserved_0..4|>`.

El linaje de entrenamiento es el siguiente: primero se entrenó el modelo base Navya-1c desde cero con aproximadamente 103 mil millones de tokens y un enfriamiento WSD en 8×H100. Después se aplicaron SFT y DPO, seguidos de GRPO, y finalmente una destilación de razonamiento usando como profesor un DeepSeek-R1-Distill 14B ejecutado localmente. El corpus de destilación es pequeño y específico de finanzas personales de India, lo que provoca que el modelo aprenda de forma muy fiel ese subconjunto y se sobreajuste, tal como advierte el autor. La innovación principal es la destilación de cadenas de razonamiento en un modelo de solo 1,31B, con salida estructurada en `think`.

## Capacidades

- Generación de texto con razonamiento explícito en formato `` seguido de la respuesta final.
- Especializado en preguntas de finanzas personales de India: ahorros, SIP, préstamos, crédito, seguros e impuestos.
- Soporte multilingüe: el modelo card indica 12 idiomas, entre ellos inglés, hindi, bengalí, tamil, telugu, marathi, gujarati, kannada, malayalam, punyabí, oriya, asamés y urdu. El uso previsto se centra en inglés y hindi/Hinglish.
- Capacidad de mostrar el proceso de razonamiento paso a paso, útil para explicar decisiones financieras.
- No se ha documentado soporte para tool calling ni function calling.
- No se ha documentado soporte para agentes ni razonamiento multi-paso más allá del formato `think`.

## Casos de uso

- Atención al cliente en banca minorista india: el modelo puede responder preguntas frecuentes sobre préstamos, tarjetas de crédito o seguros en inglés o hindi/Hinglish, mostrando el razonamiento antes de la respuesta. Su dominio específico y el formato `think` aportan transparencia al usuario.
- Educación financiera personal: sirve para generar explicaciones paso a paso sobre conceptos como SIP, interés compuesto, planificación fiscal o ahorro. La cadena de razonamiento visible facilita la comprensión.
- Asistente de planificación de ahorro: puede simular escenarios de inversión (por ejemplo, calcular el crecimiento de un SIP) mostrando los cálculos intermedios. Adecuado por su foco en finanzas personales de India.
- Generación de contenido de divulgación financiera en varios idiomas indios: el modelo soporta 12 idiomas, lo que permite redactar artículos o respuestas en mercados lingüísticos diversos, siempre que se valide la calidad.
- Investigación sobre destilación de razonamiento en modelos pequeños: sirve como caso de estudio para comparar SFT, DPO, GRPO y destilación de CoT en un modelo de 1,31B. Útil para equipos que investigan técnicas de alineación.
- Evaluación de modelos verticales: puede utilizarse como referencia para medir cuánto mejora un modelo base de finanzas al añadir razonamiento destilado, comparando con el modelo base navyam-ai/navya-1c-sft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas de rendimiento, ni comparativas con modelos similares. El autor tampoco proporciona mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1,31B en FP16, los pesos ocupan aproximadamente 2,6 GB; sumando el overhead de inferencia, se recomiendan al menos 4–6 GB. Con cuantización 4-bit en GGUF, la VRAM necesaria podría reducirse a 1–2 GB. Estos valores son orientativos y no son datos oficiales del autor.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12GB, RTX 4070 o equivalentes profesionales como A10. El modelo cabe en GPUs de consumo de gama media.
- Opciones de despliegue: Hugging Face Transformers, llama.cpp, Ollama, vLLM y TGI. El formato safetensors es compatible con los principales frameworks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado benchmarks ni comparativas en la información disponible, por lo que no se puede evaluar el rendimiento relativo. Como referencia, se podrían comparar modelos pequeños de propósito general como Qwen2.5-1.5B-Instruct, Llama-3.2-1B-Instruct o DeepSeek-R1-Distill-Qwen-1.5B, pero no se dispone de datos de rendimiento de este modelo para hacer una comparación rigurosa. El autor indica que el checkpoint es una prueba de concepto de investigación, no un modelo de producción.

## Limitaciones y advertencias

- Es una prueba de concepto de investigación, no apto para uso en producción.
- El modelo sobreajusta el corpus de destilación: la pérdida de entrenamiento tiende a 0 mientras la pérdida de validación aumenta.
- El corpus es pequeño y muy específico de finanzas personales de India; el modelo puede fallar en otros dominios o en preguntas fuera de ese ámbito.
- No debe utilizarse como consejo de inversión. El propio autor lo advierte: “modelo de investigación, no consejo de inversión”.
- Al ser un modelo pequeño (1,31B), el riesgo de alucinación es elevado, especialmente fuera del corpus de entrenamiento.
- La ventana de contexto es de solo 4096 tokens, lo que limita conversaciones largas o el procesamiento de documentos extensos.
- El formato de razonamiento `think` puede no ser consistente fuera de las prompts de finanzas personales.
- Aunque la licencia Apache-2.0 permite uso comercial, la calidad del modelo no está garantizada y se deben verificar las respuestas de forma independiente.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/navyam-ai/navya-1c-sft-dpo-grpo-reasoning
- Modelo base: https://huggingface.co/navyam-ai/navya-1c-sft
- Repositorio de código: https://github.com/bachatt-app/navyam-gpt
- Otros enlaces relevantes: no disponibles.
