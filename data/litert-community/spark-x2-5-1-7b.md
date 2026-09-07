# litert-community/Spark-X2.5-1.7B

` before answering
- Apache-2.0 license

Files:
- `Spark-X2.5-1.7B_int8.litertlm` - int8 dynamic on linears + embedding, 1835 MB
- `Spark-X2.5-1.7B_int4.litertlm` - int4 blockwise-32 + OCTAV on linears, int8 embedding (externalized), 1263 MB

Correctness:
- 8-question sanity gate on Apple M4 Max: int8 CPU 8/8 / GPU 8/8, int4 CPU 8/8 / GPU 8/8
- bf16 PyTorch reference scores 8/8
- Tokenizer parity: 234 of 234 probe rows
- Multi-turn: pass on both files

Accuracy - GSM8K:
- PyTorch bf16 (reference, MPS): 76% (20 unfinished at 3584-token cap)
- LiteRT int8: 76% (20 unfinished at 3584-token cap)
- LiteRT int4: 66% (27 unfinished at 3584-token cap)

Usage:
- litert-lm run command
- Give generous output budget (≥2048 tokens, 3584 for math)
- thought channel declared
- KV budget 4096 tokens (original's 1M context does not apply on-device)
- Eleven prefill signatures (1, 2, 4, ..., 1024)
- Vendor's recommended sampling: temperature 1.0 / top-p 0.95

Performance:
Apple M4 Max:
| File | Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|---|
| int8 | GPU (Metal) | 2308 tok/s | 95.8 tok/s | 0.12 s | 3.6 s |
| int8 | CPU | 820 tok/s | 41.0 tok/s | 0.34 s | 18.1 s |
| int4 | GPU (Metal) | 2492 tok/s | 103.6 tok/s | 0.11 s | 4.1 s |
| int4 | CPU | 271 tok/s | 38.2 tok/s | 0.97 s | 5.4 s |

iPhone 17 Pro:
| File | Metal GPU | CPU | Init GPU | Init CPU |
|---|---|---|---|---|
| int8 | 7/8 | 7/8 | 13.0 s | 0.25 s |
| int4 | 8/8 | 8/8 | 5.96 s | 2.74 s |

From web search:
- GitHub - XHToken/Spark-X2.5: introduces Spark-X2.5-4B and Spark-X2.5-1.7B, compact general-purpose language models
- Strong performance across conversation, writing, translation, reasoning, coding, tool use, and agentic workflows
- Leading results among open models

Now I need to structure this into the required format. Let me note that the HuggingFace entry is a LiteRT-LM conversion of the original model. The original is XHToken/Spark-X2.5-1.7B. The model card is from the litert-community repo.

Important considerations:
- The context for the on-device version is 4096 tokens (KV budget), but the original has 1M native context. I should note this distinction.
- The model is a reasoning model with thinking mode.
- The model card mentions the original has 1M context but on-device it's 4096.
- Languages: not available from the HF info, but the model is from iFLYTEK (Chinese company) and the GitHub mentions translation, so likely multilingual. But I shouldn't invent. I'll say "no disponible" or mention what's known.
- The model card says "Idiomas: no disponibles" in the HF metadata.

Let me now write the ficha following the structure.

For the "Resumen" section, I need 2-3 paragraphs (6-10 lines total) explaining:
- What the model is
- Who develops it
- What problem it solves
- Why relevant now
- Architecture, size, context

For "Especificaciones técnicas" table:
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding-window + full attention) |
| Parametros totales | 1.71B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en la versión LiteRT-LM (1M en el original) |
| Tipos de cuantizacion | int8 dinámico, int4 blockwise-32 + OCTAV |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

Wait, the instructions say "Parametros activos | ... (solo si es MoE)". Since it's not MoE, I should probably put "no aplica" or "no disponible". Let me put "no aplica (modelo denso)".

For "Arquitectura y entrenamiento":
- 1.71B dense decoder
- 28 layers, hidden 2048, 8 query / 2 KV heads of 256
- Hybrid attention: three sliding-window(512) layers per full-attention layer
- Per-head sigmoid attention-output gates
- Exact-GELU gated MLPs
- 131,072-entry tied vocab
- Native 1M context in original
- Reasoning model: thinks inside  thinking tags
- Trained by SparkLLM Team (iFLYTEK)
- Released August 2026
- The GitHub mentions it's designed for conversation, writing, translation, reasoning, coding, tool use, agentic workflows

For "Capacidades":
- Razonamiento (thinking mode)
- Generación de texto
- Traducción
- Codificación
- Tool use / function calling (mentioned in GitHub)
- Agentes y multi-step reasoning
- Multilingüe (translation mentioned, but languages not specified)

For "Casos de uso" - minimum 6, concrete:
1. Asistentes en dispositivos móviles (edge/on-device)
2. Razonamiento matemático (GSM8K)
3. Generación de código
4. Traducción
5. Agentes con tool calling
6. Chat multi-turno

For "Benchmarks y rendimiento":
- GSM8K table
- Performance tables from model card

For "Requisitos de hardware":
- VRAM: 1.8 GB (int8), 1.3 GB (int4) - from file sizes
- GPU: Apple M4 Max GPU (Metal), iPhone 17 Pro, Adreno (Galaxy S26 pending)
- Consumer GPU: yes, fits in most modern devices
- Deployment: litert-lm runtime, CLI
- Latency/throughput: from tables

For "Comparativa con modelos similares":
- Spark-X2.5-4B (same series, larger)
- Maybe compare with other small reasoning models? I don't have data on others. I'll compare with the 4B version and note the bf16 reference.

For "Limitaciones y advertencias":
- Context reduced to 4096 on-device vs 1M original
- int4 costs 10 GSM8K points
- Needs generous output budget (≥2048 tokens, 3584 for math)
- Truncated mid-thought produces no final answer
- Tool-call formatting not carried in bundle
- KV budget limited
- No published benchmarks beyond GSM8K in the info

For "Enlaces":
- HuggingFace URL
- GitHub URL
- LiteRT-LM GitHub

Now let me write this in proper Spanish (Spain). I need to be careful with:
- "casteellano de España" - use "vosotros" forms? No, just standard Spanish. Use "tú" or impersonal. Actually for technical writing, impersonal is best.
- Only first word of titles in uppercase (except proper nouns)
- No emojis
- Tables in Markdown

Let me write the ficha now.

Important: I need to not invent data. Let me check what's actually available.

The model card says "Idiomas: no disponibles" in the HF metadata. But the GitHub README mentions translation. However, I should be careful - the HF metadata says "languages: not available". I'll put "no disponible" but mention that the GitHub describes translation capabilities.

Actually, looking at the HF info: "Idiomas: no disponibles" - I'll put that.

For the context: The model card says "KV budget 4096 tokens (the original's 1M context does not apply on-device)". So the on-device context is 4096. The original has 1M. I'll note both.

For parameters: 1.71B. The model card says "1.71B dense decoder". So 1.71 billion parameters.

For the architecture description: "28 layers, hidden 2048, 8 query / 2 KV heads of 256, sliding-window(512) x3 : full x1, 131,072-entry tied vocab". Let me parse this:
- 28 layers
- hidden size 2048
- 8 query heads, 2 KV heads, each of dimension 256
- Sliding window attention with window 512, 3 sliding-window layers per 1 full-attention layer
- 131,072 entry tied vocabulary

This is a hybrid attention layout.

For the training data: The model card doesn't provide specific token counts or dataset composition. The GitHub README says it's designed for various tasks but doesn't give training details. I'll note that training data specifics are not available in the provided information.

For RLHF/DPO: Not mentioned. I'll say "no disponible".

Now, let me think about the "Casos de uso" section. I need 6+ concrete cases:

1. **Asistente en dispositivos móviles**: El modelo está optimizado para LiteRT-LM y se ha probado en iPhone 17 Pro, lo que lo hace adecuado para asistentes locales sin conexión.

2. **Razonamiento matemático**: El modelo es un modelo de razonamiento que funciona problemas dentro de etiquetas de pensamiento. Los benchmarks GSM8K muestran 76% en int8.

3. **Generación de código**: El GitHub menciona coding capabilities. Puede integrarse en entornos de desarrollo.

4. **Traducción**: El GitHub menciona traducción. Puede usarse para traducción automática.

5. **Agentes con tool calling**: El GitHub menciona tool use y agentic workflows. Aunque el bundle no lleva el formato de tool-calling, el modelo original lo soporta.

6. **Chat multi-turno**: El modelo soporta conversaciones multi-turno, verificado en las pruebas de 3 turnos.

7. **Aplicaciones edge/on-device**: Gracias a la cuantización int4 (1.26 GB), puede ejecutarse en dispositivos con recursos limitados.

Wait, I need to be careful. The model card says "Tool-call formatting is not carried" in the LiteRT-LM bundle. So I should note that the on-device version doesn't carry tool-call formatting, but the original model supports it. I'll mention this nuance.

Let me write the ficha now.

For the benchmarks table, I'll include:
- GSM8K comparison
- Performance on Apple M4 Max
- iPhone 17 Pro results

Let me structure the performance data carefully.

For "Requisitos de hardware":
- VRAM: int8 ~1.8 GB, int4 ~1.3 GB (based on file sizes)
- GPU: Apple M4 Max (Metal), iPhone 17 Pro GPU, Adreno (pending)
- Puede ejecutarse en GPU de consumo modernas
- Despliegue: litert-lm CLI, runtime LiteRT-LM
- Latencia: TTFT 0.12s (int8 GPU), decode 95.8 tok/s

Let me now write the complete ficha. I'll be precise and technical.

One thing to note: The model card says the int8 file is recommended. The int4 file is for phones/size.

For the comparative section, I'll compare with:
- Spark-X2.5-4B (same series, larger)
- The original XHToken/Spark-X2.5-1.7B (bf16 reference)

Actually, I should compare with 2-3 alternatives. I know Spark-X2.5-4B exists from the GitHub. I don't have data on other comparable models. Let me compare with the 4B version and the bf16 original. I could also mention that the comparison is limited due to available info.

Let me write now.

Actually, I realize I should be careful about the "Parametros activos" row. The instructions say "(solo si es MoE)". Since this is not MoE, I'll put "No aplica (modelo denso)".

For "Formato de pesos": .litertlm (LiteRT-LM). The model card mentions this is a conversion to LiteRT-LM format.

Let me also note: The repo size is 3.1 GB, which includes both files (1835 MB + 1263 MB = 3098 MB ≈ 3.1 GB). Good.

Now writing the ficha in Spanish:

---

## Resumen

Spark-X2.5-1.7B es un modelo de lenguaje compacto de 1.710 millones de parámetros desarrollado por el equipo SparkLLM de iFLYTEK y publicado en agosto de 2026. Forma parte de la serie Spark-X2.5, que incluye también una variante de 4B. El modelo está diseñado para ofrecer un rendimiento sólido en tareas cotidianas como conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos de trabajo agénticos.

La arquitectura es un decoder denso con 28 capas, tamaño de ocultación 2048, 8 cabezas de consulta y 2 cabezas KV de dimensión 256. Incorpora una disposición de atención híbrida con tres capas de ventana deslizante (512) por cada capa de atención completa, puertas de salida por cabeza basadas en sigmoide y MLPs con GELU exacto. El modelo original soporta un contexto nativo de 1 millón de tokens, aunque la conversión a LiteRT-LM limita el presupuesto KV a 4096 tokens en dispositivos.

Esta entrada de HuggingFace es una conversión al formato LiteRT-LM (.litertlm) realizada por litert-community para inferencia en dispositivos (on-device) con el runtime LiteRT-LM de Google. Se trata de un modelo de razonamiento que resuelve problemas dentro de etiquetas de pensamiento antes de responder, con un canal de pensamiento declarado en los metadatos del bundle. La licencia es Apache-2.0.

---

Hmm, wait. Let me reconsider the "Resumen" - it should be 6-10 lines total. Let me count. The above is about 10 lines. Good.

Actually, let me reconsider - the instructions say "Dos o tres parrafos (6-10 lineas total)". So I should aim for 6-10 lines across 2-3 paragraphs. Let me make it more concise.

Let me revise:

## Resumen

Spark-X2.5-1.7B es un modelo de lenguaje compacto de 1.710 millones de parámetros desarrollado por el equipo SparkLLM de iFLYTEK y publicado en agosto de 2026. Forma parte de la serie Spark-X2.5, que incluye una variante de 4B, y está diseñado para conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos agénticos.

La arquitectura es un decoder denso de 28 capas, tamaño de ocultación 2048, 8 cabezas de consulta y 2 cabezas KV de dimensión 256. Incorpora atención híbrida con tres capas de ventana deslizante (512) por cada capa de atención completa, puertas de salida por cabeza basadas en sigmoide y MLPs con GELU exacto. El modelo original soporta un contexto nativo de 1 millón de tokens, aunque la conversión a LiteRT-LM limita el presupuesto KV a 4096 tokens.

Esta entrada de HuggingFace es una conversión al formato LiteRT-LM (.litertlm) para inferencia en dispositivos con el runtime LiteRT-LM de Google. Es un modelo de razonamiento que resuelve problemas dentro de etiquetas de pensamiento antes de responder, con un canal de pensamiento declarado en los metadatos. Licencia Apache-2.0.

That's 3 paragraphs, about 10 lines. Good.

Now for the technical specifications table:

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder denso con atención híbrida (sliding-window + full attention) |
| Parametros totales | 1.710 millones (1.71B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens en la versión LiteRT-LM; 1M en el modelo original |
| Tipos de cuantizacion | int8 dinámico en lineales + embedding; int4 blockwise-32 + OCTAV en lineales |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

For "Arquitectura y entrenamiento":

El modelo es un decoder transformer denso de 1.710 millones de parámetros. La arquitectura consta de 28 capas con tamaño de ocultación 2048, 8 cabezas de consulta y 2 cabezas KV de dimensión 256. La atención es híbrida: por cada capa de atención completa hay tres capas de atención con ventana deslizante de 512 tokens. Cada cabeza de atención tiene una puerta de salida basada en sigmoide, y las MLPs usan activación GELU exacta. El vocabulario es de 131.072 entradas con pesos atados (tied embeddings).

El modelo fue entrenado por el equipo SparkLLM de iFLYTEK. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset o la aplicación de RLHF/DPO no están disponibles en la información proporcionada. El GitHub del proyecto indica que el modelo está optimizado para tareas como conversación, escritura, traducción, razonamiento, codificación, uso de herramientas y flujos agénticos. La versión LiteRT-LM se ha probado con el runtime litert-lm 0.17.0.

For "Capacidades":

- Razonamiento: el modelo resuelve problemas dentro de etiquetas de pensamiento antes de responder, con un canal de pensamiento separado de la respuesta final.
- Generación de texto: conversación, escritura y traducción según el GitHub del proyecto.
- Generación de código: soporta tareas de codificación según el GitHub.
- Tool calling / function calling: el modelo original soporta uso de herramientas, aunque el bundle LiteRT-LM no incluye el formato de tool-calling.
- Agentes y razonamiento multi-paso: el GitHub menciona flujos de trabajo agénticos.
- Capacidades multilingües: el GitHub menciona traducción, aunque los idiomas concretos no están disponibles en la ficha.
- Modo de pensamiento: el bundle declara un canal de pensamiento que permite a los runtimes con soporte de ThinkingConfig limitar o leer el razonamiento por separado.

Wait, I need to be careful. The model card says "Tool-call formatting is not carried" - so the on-device version doesn't have tool-call formatting. But the original model does support it. I'll mention this nuance.

For "Casos de uso" - 6+ concrete cases:

1. **Asistente en dispositivos móviles**: El modelo está optimizado para LiteRT-LM y se ha probado en iPhone 17 Pro, lo que permite asistentes locales sin conexión con razonamiento integrado.

2. **Aplicaciones edge con presupuesto limitado**: La versión int4 de 1.26 GB permite ejecutar el modelo en dispositivos con recursos limitados, como teléfonos o dispositivos embebidos.

3. **Razonamiento matemático**: El modelo alcanza un 76% en GSM8K con la cuantización int8, a la par del modelo bf16 de referencia, lo que lo hace adecuado para tutoría o resolución de problemas matemáticos.

4. **Generación de código**: El GitHub del proyecto indica capacidades de codificación, lo que permite su uso en asistentes de programación en entornos de desarrollo.

5. **Traducción automática**: El proyecto menciona traducción entre idiomas, lo que permite su uso en aplicaciones de traducción en tiempo real.

6. **Chat multi-turno**: Verificado con pruebas de 3 turnos, el modelo mantiene el contexto conversacional sin fugas de marcadores.

7. **Agentes con uso de herramientas**: El modelo original soporta tool calling y flujos agénticos, aunque la versión LiteRT-LM no incluye el formato de tool-calling en el bundle.

Hmm, I need to be careful with #7 - the on-device bundle doesn't carry tool-call formatting. I'll phrase it as a limitation or note.

Let me revise to be more precise. The original model supports tool calling, but the LiteRT-LM conversion doesn't carry the formatting. So for on-device use, tool calling would need custom handling. I'll mention this.

For "Benchmarks y rendimiento":

I'll create a table with GSM8K results and then the performance tables.

| Configuración | GSM8K (n=100, greedy, 0-shot CoT, 3584 tokens de salida) |
|---|---|
| PyTorch bf16 (referencia, MPS) | 76% |
| LiteRT int8 | 76% |
| LiteRT int4 | 66% |

And then the performance tables:

Apple M4 Max (litert-lm benchmark 0.17.0, prefill 256, decode 256):

| Archivo | Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|---|
| int8 | GPU (Metal) | 2308 tok/s | 95.8 tok/s | 0.12 s | 3.6 s |
| int8 | CPU | 820 tok/s | 41.0 tok/s | 0.34 s | 18.1 s |
| int4 | GPU (Metal) | 2492 tok/s | 103.6 tok/s | 0.11 s | 4.1 s |
| int4 | CPU | 271 tok/s | 38.2 tok/s | 0.97 s | 5.4 s |

iPhone 17 Pro (harness G41DeviceTest, prompt compuesto de 8 preguntas, max-tokens 3072):

| Archivo | Metal GPU | CPU | Init GPU | Init CPU |
|---|---|---|---|---|
| int8 | 7/8 | 7/8 | 13.0 s | 0.25 s |
| int4 | 8/8 | 8/8 | 5.96 s | 2.74 s |

For "Requisitos de hardware":

- VRAM estimada: 1.8 GB para int8 (1835 MB), 1.3 GB para int4 (1263 MB)
- GPU recomendadas: Apple M4 Max (Metal), iPhone 17 Pro GPU; pendiente de medición en Galaxy S26 (Adreno)
- Compatible con GPU de consumo modernas gracias a los formatos cuantizados
- Despliegue: runtime LiteRT-LM (CLI `litert-lm run`), con soporte para backend GPU (Metal) y CPU
- Latencia: TTFT 0.11-0.12 s en GPU M4 Max; decode 95.8-103.6 tok/s en GPU, 38.2-41.0 tok/s en CPU

For "Comparativa con modelos similares":

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Spark-X2.5-1.7B (LiteRT-LM) | 1.71B | 4096 (on-device) / 1M (original) | Apache-2.0 | .litertlm |
| Spark-X2.5-4B | 4B | No disponible | Apache-2.0 | No disponible |
| Spark-X2.5-1.7B (bf16 original) | 1.71B | 1M | Apache-2.0 | PyTorch |

Hmm, I don't have much data on the 4B version. Let me note that the 4B is from the same series but details are not available in the provided information. I'll be honest about this.

Actually, let me reconsider. The instructions say "Compara parametros, contexto, rendimiento, licencia y disponibilidad". I'll include what I know. For the 4B, I only know it exists and is larger. I'll note "no disponible" for missing data.

For "Limitaciones y advertencias":

- El contexto en la versión LiteRT-LM se limita a 4096 tokens, frente al 1M del modelo original. Esto puede afectar a tareas que requieren ventanas de contexto muy largas.
- La cuantización int4 reduce el rendimiento en GSM8K de 76% a 66%, y alrededor de la mitad de esa pérdida se debe a cadenas de razonamiento más largas que alcanzan el límite de 3584 tokens.
- El modelo necesita un presupuesto de salida generoso (≥2048 tokens, 3584 para matemáticas). Si se trunca a mitad de un pensamiento, no produce ninguna respuesta final.
- El bundle LiteRT-LM no incluye el formato de tool-calling del modelo original, por lo que los casos de uso con herramientas requieren implementación personalizada.
- No se han publicado resultados de benchmarks amplios (MMLU, HumanEval, etc.) en la información disponible; solo se dispone de GSM8K y pruebas de cordura internas.
- Los datos de entrenamiento (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.
- Los idiomas soportados no están especificados en la ficha de HuggingFace, aunque el GitHub menciona traducción.

For "Enlaces":

- HuggingFace: https://huggingface.co/litert-community/Spark-X2.5-1.7B
- GitHub del proyecto: https://github.com/XHToken/Spark-X2.5
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B

Now let me assemble the complete ficha and make sure it follows all rules.

Wait, I should double-check: the model card says "int8 is the recommended file" and "int4 (block-32) is the phone / size option". Also "it is the faster file on the Mac GPU (103.6 vs 95.8 tok/s decode) and scored 8/8 on the iPhone 17 Pro on both backends."

I should mention this in the ficha.

Also, the model card mentions "eleven prefill signatures (1, 2, 4, ..., 1024)" - this is a technical detail about the LiteRT-LM runtime optimization.

Let me also note: "The bundle carries the vendor prompt format as a Jinja template" and "stop token `" - these are technical details.

Let me finalize the ficha now.

One more thing: I need to be careful about the "Resumen" section. It says "Menciona arquitectura, tamano y contexto si estan disponibles." I've done that.

For the "Especificaciones técnicas" table, I need to include all the required rows. Let me check:
- Arquitectura: ✓
- Parametros totales: ✓
- Parametros activos: ✓ (No aplica)
- Longitud de contexto: ✓
- Tipos de cuantizacion: ✓
- Idiomas soportados: ✓
- Licencia: ✓
- Formato de pesos: ✓

Good.

Now let me write the complete ficha. I'll make sure it's in Spanish (Spain), technical, and follows all rules.

Actually, I want to reconsider the "Casos de uso" more carefully. The instructions say "explica brevemente como se usaria el modelo en ese escenario y por que es adecuado". Let me make each case more detailed.

Let me write the final version now.

I need to be careful about the "Comparativa con modelos similares" - the instructions say "Si no conoces modelos comparables, indica 'no disponible'." I do know Spark-X2.5-4B is comparable (same series). But I don't have much data on it. Let me include what I know and mark the rest as no disponible.

Actually, I realize I should also consider whether to mention the original bf16 model as a comparison. That's the same model but in PyTorch format, so it's a valid comparison for the quantization impact.

Let me finalize.

Final check on rules:
- NO inventes datos ✓
- Usa castellano de España ✓
- Solo la primera palabra de los titulos en mayuscula ✓ (I need to make sure "## Resumen", "## Especificaciones tecnicas", etc. - only first word capitalized)
- No uses emojis ✓
- Responde unicamente con el Markdown de la ficha ✓
- Usa tablas Markdown ✓
- Sé especifico y tecnico ✓

Let me write it all out now.## Resumen

Spark-X2.5-1.7B es un modelo de lenguaje compacto de 1.710 millones de parámetros desarrollado por el equipo SparkLLM de iFLYTEK y publicado en agosto de 2026. Forma parte de la serie Spark-X2.5, que incluye una variante de 4B, y está diseñado para conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos de trabajo agénticos.

La arquitectura es un decoder denso de 28 capas, tamaño de ocultación 2048, 8 cabezas de consulta y 2 cabezas KV de dimensión 256. Incorpora atención híbrida con tres capas de ventana deslizante (512) por cada capa de atención completa, puertas de salida por cabeza basadas en sigmoide y MLPs con GELU exacto. El modelo original soporta un contexto nativo de 1 millón de tokens, aunque la conversión a LiteRT-LM limita el presupuesto KV a 4096 tokens en dispositivos.

Esta entrada de HuggingFace es una conversión al formato LiteRT-LM (`.litertlm`) para inferencia en dispositivos con el runtime LiteRT-LM de Google. Es un modelo de razonamiento que resuelve problemas dentro de etiquetas de pensamiento antes de responder, con un canal de pensamiento declarado en los metadatos. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder denso con atencion hibrida (sliding-window + full attention) |
| Parametros totales | 1.710 millones (1.71B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens en la version LiteRT-LM; 1M en el modelo original |
| Tipos de cuantizacion | int8 dinamico en lineales + embedding; int4 blockwise-32 + OCTAV en lineales |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 1.710 millones de parametros. La arquitectura consta de 28 capas con tamaño de ocultación 2048, 8 cabezas de consulta y 2 cabezas KV de dimensión 256. La atención es hibrida: por cada capa de atención completa hay tres capas de atención con ventana deslizante de 512 tokens. Cada cabeza de atención incorpora una puerta de salida basada en sigmoide, y las MLPs usan activación GELU exacta. El vocabulario es de 131.072 entradas con pesos atados (tied embeddings).

El modelo fue entrenado por el equipo SparkLLM de iFLYTEK. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset o la aplicación de RLHF/DPO no están disponibles en la información proporcionada. El GitHub del proyecto indica que el modelo está optimizado para tareas como conversación, escritura, traducción, razonamiento, codificación, uso de herramientas y flujos agénticos. La versión LiteRT-LM se ha probado con el runtime litert-lm 0.17.0 e incluye once firmas de prefill (1, 2, 4, ..., 1024) y un presupuesto KV de 4096 tokens.

## Capacidades

- Razonamiento: el modelo resuelve problemas dentro de etiquetas de pensamiento antes de responder, con un canal de pensamiento separado de la respuesta final.
- Generación de texto: conversación, escritura y traducción según el GitHub del proyecto.
- Generación de código: soporta tareas de codificación según el GitHub del proyecto.
- Tool calling / function calling: el modelo original soporta uso de herramientas, aunque el bundle LiteRT-LM no incluye el formato de tool-calling.
- Agentes y razonamiento multi-paso: el GitHub del proyecto menciona flujos de trabajo agénticos.
- Capacidades multilingües: el GitHub menciona traducción, aunque los idiomas concretos no están especificados en la ficha de HuggingFace.
- Modo de pensamiento: el bundle declara un canal de pensamiento que permite a los runtimes con soporte de ThinkingConfig limitar o leer el razonamiento por separado; `enable_thinking: false` renderiza la forma sin pensamiento del modelo.

## Casos de uso

- Asistente en dispositivos móviles: el modelo está optimizado para LiteRT-LM y se ha probado en iPhone 17 Pro, lo que permite asistentes locales sin conexión con razonamiento integrado. La cuantización int4 de 1.26 GB facilita su despliegue en dispositivos con memoria limitada.
- Aplicaciones edge con presupuesto reducido: la versión int4 (1263 MB) es la opción recomendada para teléfonos y dispositivos embebidos. Se ha validado en iPhone 17 Pro con 8/8 respuestas correctas en ambos backends.
- Razonamiento matemático: el modelo alcanza un 76% en GSM8K con la cuantización int8, a la par del modelo bf16 de referencia. Es adecuado para tutoría, resolución de problemas matemáticos y aplicaciones educativas.
- Generación de código: el GitHub del proyecto indica capacidades de codificación, lo que permite su uso en asistentes de programación, revisión de código o generación de fragmentos en entornos de desarrollo.
- Traducción automática: el proyecto menciona traducción entre idiomas, lo que permite su uso en aplicaciones de traducción en tiempo real o asistencia multilingüe.
- Chat multi-turno: verificado con pruebas de 3 turnos, el modelo mantiene el contexto conversacional sin fugas de marcadores ni pérdida de información, lo que lo hace adecuado para asistentes de atención al cliente.
- Agentes con uso de herramientas: el modelo original soporta tool calling y flujos agénticos. En la versión LiteRT-LM, el formato de tool-calling no se incluye en el bundle, por lo que requiere implementación personalizada del lado del runtime.

## Benchmarks y rendimiento

| Configuracion | GSM8K (n=100, greedy, 0-shot CoT, 3584 tokens de salida) |
|---|---|
| PyTorch bf16 (referencia, MPS) | 76% (20 inacabados en el limite de 3584 tokens) |
| LiteRT int8 | 76% (20 inacabados en el limite de 3584 tokens) |
| LiteRT int4 | 66% (27 inacabados en el limite de 3584 tokens) |

Rendimiento en Apple M4 Max (litert-lm benchmark 0.17.0, prefill 256, decode 256, cache no, 3 runs):

| Archivo | Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|---|
| int8 | GPU (Metal) | 2308 tok/s | 95.8 tok/s | 0.12 s | 3.6 s |
| int8 | CPU | 820 tok/s | 41.0 tok/s | 0.34 s | 18.1 s |
| int4 | GPU (Metal) | 2492 tok/s | 103.6 tok/s | 0.11 s | 4.1 s |
| int4 | CPU | 271 tok/s | 38.2 tok/s | 0.97 s | 5.4 s |

Rendimiento en iPhone 17 Pro (harness G41DeviceTest, prompt compuesto de 8 preguntas, max-tokens 3072):

| Archivo | Metal GPU | CPU | Init GPU | Init CPU |
|---|---|---|---|---|
| int8 | 7/8 | 7/8 | 13.0 s | 0.25 s |
| int4 | 8/8 | 8/8 | 5.96 s | 2.74 s |

## Requisitos de hardware

- VRAM estimada: 1835 MB para int8, 1263 MB para int4 (según tamaño de archivo).
- GPU recomendadas: Apple M4 Max (backend Metal), iPhone 17 Pro (GPU y CPU). Pendiente de medición en Galaxy S26 (Adreno).
- Compatible con GPU de consumo modernas gracias a los formatos cuantizados; cabe en dispositivos móviles y portátiles de gama alta.
- Despliegue: runtime LiteRT-LM mediante CLI (`litert-lm run`), con soporte para backend GPU (Metal) y CPU.
- Latencia: TTFT de 0.11-0.12 s en GPU M4 Max; decode de 95.8-103.6 tok/s en GPU y 38.2-41.0 tok/s en CPU. Init de 3.6-5.4 s en GPU para M4 Max.
- El archivo int8 es el recomendado por equilibrio entre calidad y rendimiento; int4 es la opción para dispositivos con limitaciones de tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Spark-X2.5-1.7B (LiteRT-LM) | 1.71B | 4096 (on-device) / 1M (original) | Apache-2.0 | .litertlm |
| Spark-X2.5-4B | 4B | No disponible | Apache-2.0 | No disponible |
| Spark-X2.5-1.7B (bf16 original) | 1.71B | 1M | Apache-2.0 | PyTorch |

La comparacion con la variante de 4B es limitada porque la informacion disponible no incluye especificaciones tecnicas ni benchmarks de ese modelo. La comparacion con el modelo bf16 original sirve para evaluar el impacto de la cuantizacion: int8 mantiene el rendimiento en GSM8K (76%) mientras que int4 lo reduce a 66%.

## Limitaciones y advertencias

- El contexto en la version LiteRT-LM se limita a 4096 tokens, frente al 1M del modelo original. Esto puede afectar a tareas que requieren ventanas de contexto muy largas.
- La cuantizacion int4 reduce el rendimiento en GSM8K de 76% a 66%. Alrededor de la mitad de esa perdida se debe a cadenas de razonamiento mas largas que alcanzan el limite de 3584 tokens, no a razonamiento incorrecto.
- El modelo necesita un presupuesto de salida generoso (≥2048 tokens, 3584 para matematicas). Si se trunca a mitad de un pensamiento, no produce ninguna respuesta final.
- El bundle LiteRT-LM no incluye el formato de tool-calling del modelo original, por lo que los casos de uso con herramientas requieren implementacion personalizada.
- No se han publicado resultados de benchmarks amplios (MMLU, HumanEval, etc.) en la informacion disponible; solo se dispone de GSM8K y pruebas de cordura internas.
- Los datos de entrenamiento (tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.
- Los idiomas soportados no estan especificados en la ficha de HuggingFace, aunque el GitHub del proyecto menciona traduccion.
- El archivo int8 falla una pregunta en el prompt compuesto de iPhone 17 Pro (la linea de rima del final, responde "purple" en lugar de "blue"), lo que indica posibles sesgos en tareas de estilo.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/Spark-X2.5-1.7B
- GitHub del proyecto: https://github.com/XHToken/Spark-X2.5
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
