# mhseo2/Qwen3-8B-Base-OT3Math-SFT-step750

ending in \boxed{}
- Plain ChatML template, no thinking logic, no enable_thinking flag
- Turn ends with <|im_end|> (151645); config.json and generation_config.json say so; Qwen3-8B-Base stock is 151643 which yields non-termination under vLLM. max_new_tokens ~16384.

Now write the sheet. Must not invent. For hardware requirements I can do estimates based on 8.19B params — that's computed, but I should be careful and label them as estimates. That's reasonable for a technical sheet — VRAM estimates based on param count is derived, not invented. I'll frame as estimates.

Context length: the model was trained with sequence length 32768. Qwen3-8B-Base native context is 32768. The card says sequence length 32768. So context = 32768 tokens (as per training config). I'll note that.

Languages: not available in metadata. Qwen3 base supports many languages, but the SFT data is math (likely English). I should say "no disponible" for languages, noting the metadata doesn't specify.

Quantization types: only bf16 weights available. No GGUF. Could be converted, but say no published quantizations.

Weights format: safetensors (bf16).

Benchmarks: not evaluated — "Not yet evaluated."

Comparison: compare with Qwen3-8B-Base itself, and other math SFT variants like OpenThinker / OpenThoughts... I should be careful — only compare with things I know reasonably. Alternatives: Qwen2.5-7B-Math? DeepSeek-R1-Distill-Qwen-7B? I could mention comparables but I must not invent numbers. I'll compare on parameters, context, license, availability, without inventing benchmark figures. Maybe better to say "no disponible" for some. I'll do a comparison table with Qwen3-8B-Base, Qwen3-8B (instruct), and DeepSeek-R1-Distill-Qwen-7B, with parameters/context/license and note benchmark data not available. Hmm, DeepSeek-R1-Distill-Qwen-7B params ~7.6B, context 131072 in some versions. I'm not fully certain. Risky. I could limit comparison to Qwen3 family which I know: Qwen3-8B-Base (8.19B), Qwen3-8B (8.19B), Qwen3-4B. But specifications of these... Qwen3-8B context 32768 native, extendable with YaRN to 131072. Hmm. Safer: keep comparison table minimal with clear "no disponible" entries.

Actually the instruction says if you don't know comparable models, say "no disponible". I'll include a small comparison table with Qwen3-8B-Base (the direct parent) and Qwen3-8B (instruct SFT), marking benchmark rows as not available. Let me be conservative with numbers: params 8.190.735.360 for both Qwen3-8B-Base and Qwen3-8B — that's stated in the repo. I'd rather phrase carefully.

Let me just do comparativa with two entries and note "no disponible" for benchmark.

Hardware: 
- bf16 full: 8.19B × 2 bytes ≈ 16.4 GB weights + KV cache + activations. Needs ~24 GB+ VRAM for inference; RTX 4090 24GB tight, better A100 40GB / H100.
- At 32k context, KV cache matters. Qwen3-8B has 36 layers, 8 KV heads (GQA)... I'm not 100% sure of head dim. Better not to invent layer counts. But KV cache estimate: I could avoid specifics and say it depends. Actually to be safe I'll say KV cache for 32k context adds several GB and mention using vLLM with paged attention. I should be careful about inventing architecture details of Qwen3-8B since not given. I'll only state what's given: transformer decoder based on Qwen3-8B architecture. Qwen3 is known to be a dense transformer with GQA — that's general knowledge, but I'd better keep it minimal and mark where uncertain. I'll say "arquitectura transformer decoder densa de la familia Qwen3 (arquitectura detallada no especificada en la informacion disponible)".

Let me write it.

Creation date: 2026-10-16 — seems like a future date but it's from metadata. I'll include in the enlaces/specs? Not required. Maybe mention in resumen as "publicado en octubre de 2026 segun los metadatos de HuggingFace". That feels odd. I'll just mention metadata date in the resumen lightly or skip. I'll include it — it's factual from metadata. Actually including a clearly anomalous future date might be confusing. I'll just say "checkpoint publicado con fecha 2026-10-16 en los metadatos de HuggingFace". Fine, factual.

Let's write.

Context length row: 32768 tokens (ventana de entrenamiento); la longitud de contexto nativa de Qwen3-8B-Base no se detalla en la informacion disponible. Actually 32768 is the training seq length and presumably native context.

Quantization row: "solo pesos bf16; no se han publicado cuantizaciones GGUF, AWQ ni GPTQ".

Format: safetensors (bf16).

Idiomas: no disponibles (los metadatos no especifican; los datos de entrenamiento son de matematicas y razonamiento).

Now writing full sheet.

Casos de uso: 6+ practical, tied to math reasoning SFT checkpoint.

Benchmarks: "No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente 'Not yet evaluated'."

Limitations: intermediate checkpoint, not finished (750/2000), no evals, overfitting risk to \boxed{} format, non-termination issue if using wrong eos token, requires ChatML with <|im_end|>, hallucination, no thinking-mode control, English-centric likely, license Apache-2.0 commercial OK, checkpoint naming/versioning.

Enlaces: HF URL, base model Qwen/Qwen3-8B-Base, dataset knowledge-distillation/openthoughts3_math, verl repo https://github.com/volcengine/verl.

Write it now. No emojis, titles only first word capitalized — note headings like "## Resumen" fine, "## Especificaciones tecnicas" fine. Sub-items in bold? Avoid. Just bullets.

For context length: 32768.

Hardware: VRAM estimates:
- bf16 weights ~16.4 GB (repo size confirms 16.4 GB).
- Inference with vLLM for short contexts: ~18-20 GB + KV cache → RTX 4090 24 GB viable for modest batches/context; A100 40GB, H100 80GB comfortable.
- Quantized not available; converting via llama.cpp would be possible but no GGUF published.
- Deployment: vLLM (careful with eos token), TGI (endpoints_compatible tag), transformers, SGLang.
- max_new_tokens ~16384.

Throughput/latency: not available.

Ok, write.## Resumen

Qwen3-8B-Base-OT3Math-SFT-step750 es un checkpoint intermedio de ajuste supervisado (SFT) publicado por el usuario mhseo2 sobre el modelo base Qwen/Qwen3-8B-Base. El entrenamiento se ha realizado exclusivamente sobre el conjunto de datos knowledge-distillation/openthoughts3_math, compuesto por 103.760 conversaciones de dos turnos orientadas a matematicas y razonamiento, en las que cada respuesta del asistente contiene una traza explícita entre etiquetas `<think>...</think>` que termina en una respuesta encerrada en `\boxed{}`. El modelo tiene 8.190.735.360 parámetros y se distribuye únicamente en pesos bf16.

Se trata de un checkpoint de paso 750 de un total planificado de 2000, por lo que no es un modelo final ni ha sido evaluado: la propia model card indica "Not yet evaluated". Su interes principal es como material de investigacion sobre destilacion de razonamiento matematico y sobre el efecto del formato de plantilla: el autor sustituye la plantilla nativa de Qwen3 por una plantilla ChatML plana, sin lógica de thinking, porque la plantilla original de Qwen3 elimina las etiquetas `<think>` de todos los turnos del asistente salvo el último, lo que habría borrado las trazas de razonamiento de los objetivos de entrenamiento.

La longitud de secuencia de entrenamiento es de 32768 tokens (media 13,8k, p99 16,8k, maximo 16,8k), con batch global 255, optimizador AdamW, learning rate 5e-6 con scheduler coseno y 3% de warmup, weight decay 0.01 y gradient clipping 1.0, en precisión bf16 con FSDP sobre 3 GPUs usando el framework verl. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3 (detalle de capas y atencion no especificado en la informacion disponible) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32768 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible: solo se publican pesos bf16; no hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (los metadatos no los especifican; los datos de entrenamiento son de matematicas y razonamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder denso de 8,19 mil millones de parametros, y se somete a un ajuste supervisado puro sobre knowledge-distillation/openthoughts3_math. El conjunto contiene 103.760 conversaciones de dos turnos, con una longitud media de 13,8k tokens, percentil 99 de 16,8k y maximo de 16,8k, que se entrenan con longitud de secuencia de 32768 tokens, por lo que no se trunca ningun ejemplo. Cada mensaje del asistente en los datos es una traza `<think>...</think>` que finaliza con una respuesta en `\boxed{}`, y el modelo se entrena para reproducir ese patron exacto.

La innovacion tecnica relevante no esta en la arquitectura sino en la plantilla de chat: se usa una plantilla ChatML plana sin logica de thinking, y no existe el flag `enable_thinking`. El motivo es que la plantilla propia de Qwen3 elimina `<think>` de todos los turnos del asistente excepto el ultimo, lo que habria eliminado el razonamiento de los objetivos de entrenamiento. Un turno termina con el token `<|im_end|>` (id 151645), y tanto `config.json` como `generation_config.json` del repositorio lo declaran asi. La model card advierte de que el `generation_config.json` original de Qwen3-8B-Base indica 151643 en su lugar, lo que produce un modelo que nunca termina de generar bajo vLLM. El entrenamiento se hizo en bf16 con FSDP sobre 3 GPUs mediante verl, con batch global 255, AdamW, learning rate 5e-6, scheduler coseno, 3% de warmup, weight decay 0.01 y grad clip 1.0.

## Capacidades

- Generacion de texto conversacional en formato ChatML, con plantilla plana de dos turnos.
- Razonamiento matematico con trazas explicitas: el modelo produce bloques `<think>...</think>` antes de la respuesta final.
- Formato de respuesta estructurado: cierra las soluciones con `\boxed{}`, lo que facilita la extraccion automatica de resultados.
- Generacion de cadenas de razonamiento largas, coherentes con secuencias de hasta 32768 tokens y objetivos de entrenamiento con media de 13,8k tokens.
- Soporte de conversaciones de multiples turnos a nivel de plantilla (los datos son conversaciones de dos turnos).
- Tool calling / function calling: no disponible; no se menciona soporte en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no documentadas como tales; el unico razonamiento documentado es la traza `<think>` interna.
- Vision, audio y otras modalidades: no disponibles.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre destilacion de razonamiento: el checkpoint permite estudiar como evoluciona el comportamiento de una traza `<think>` a lo largo del entrenamiento, ya que se puede comparar el paso 750 con pasos anteriores o posteriores de la misma receta.
- Generacion de soluciones matematicas con respuesta extraible: el cierre en `\boxed{}` permite integrar el modelo en un pipeline que parsee automaticamente el resultado final sin postprocesado heuristico complejo.
- Estudio del efecto de la plantilla de chat: util para equipos que necesitan entender por que la plantilla nativa de Qwen3 es incompatible con datos que contienen trazas de razonamiento en todos los turnos.
- Reproduccion de recetas de SFT a escala media: la configuracion documentada (batch 255, lr 5e-6, coseno, 3% warmup, FSDP sobre 3 GPUs, verl) sirve como referencia para replicar entrenamientos similares sobre bases Qwen3.
- Analisis de robustez de formato: al ser un checkpoint intermedio sin evaluar, es adecuado para medir degradacion de formato, repeticiones y fallos de terminacion a distintos pasos de entrenamiento.
- Banco de pruebas de infraestructura de inferencia: util para validar configuraciones de vLLM, TGI o SGLang en cuanto al token de fin de turno correcto (151645) y a la gestion de `max_new_tokens` en torno a 16384.
- Punto de partida para ajustes posteriores: al ser pesos bf16 completos, se puede continuar el entrenamiento o aplicar DPO/RL sobre el checkpoint sin necesidad de reconstruir el modelo desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "Not yet evaluated" y se trata de un checkpoint intermedio (paso 750 de 2000 previstos).

## Requisitos de hardware

- VRAM para pesos en bf16: aproximadamente 16,4 GB (el repositorio ocupa 16,4 GB y los pesos son bf16 sin cuantizar).
- A esa cifra hay que sumar la cache KV y las activaciones. Con ventanas de contexto largas (hasta 32768 tokens) la cache KV crece de forma significativa, por lo que el presupuesto real de VRAM depende del numero de secuencias concurrentes y de la longitud de cada una.
- GPUs recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB para servicio con contexto largo y concurrencia. Una RTX 4090 de 24 GB puede ejecutar el modelo en bf16 con contexto moderado y lotes pequenos, pero queda muy justa para 32k tokens con concurrencia.
- Consumer GPU: si, es viable en RTX 4090 / RTX 3090 de 24 GB con contexto recortado y baja concurrencia. Para contextos completos de 32768 tokens se recomienda hardware de 40 GB o mas.
- Cuantizacion: no hay pesos GGUF, AWQ ni GPTQ publicados, por lo que desplegar en menos de 24 GB exigiria convertir los pesos uno mismo (por ejemplo a GGUF con llama.cpp), algo no documentado por el autor.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI (el repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`) y SGLang. En vLLM es imprescindible verificar que el EOS sea 151645, no 151643.
- Parametros de generacion: la model card recomienda usar `max_new_tokens` en torno a 16384.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para este checkpoint, por lo que la comparativa se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3-8B-Base-OT3Math-SFT-step750 | 8.190.735.360 | 32768 (entrenamiento) | Apache-2.0 | Checkpoint intermedio (750/2000), sin evaluar |
| Qwen/Qwen3-8B-Base | 8.190.735.360 | no disponible en la informacion proporcionada | Apache-2.0 | Modelo base de referencia, sin SFT de matematicas |
| Qwen/Qwen3-8B | no disponible en la informacion proporcionada | no disponible | Apache-2.0 | Modelo instructivo oficial de la familia Qwen3 |
| Otros SFT de matematicas sobre Qwen3-8B | no disponible | no disponible | no disponible | no disponible |

Las cifras de benchmarks comparativos (MMLU, GSM8K, MATH, HumanEval u otros) no estan disponibles en la informacion proporcionada para ninguno de los modelos de la tabla.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 750 de 2000 planificados. No es un modelo final y su calidad puede ser inferior a la de un entrenamiento completado.
- Sin evaluacion: el autor indica "Not yet evaluated". No hay datos de MMLU, GSM8K, MATH ni de ningun otro benchmark, por lo que no se puede recomendar en produccion sin validacion propia.
- Riesgo de sobreajuste al formato: como todos los objetivos de entrenamiento terminan en `\boxed{}` con una traza `<think>`, el modelo puede forzar ese formato incluso en peticiones que no lo requieran, o degradarse si se le pide otro estilo de respuesta.
- Problema de token de fin de secuencia: usar el `generation_config.json` original de Qwen3-8B-Base (EOS 151643) provoca que el modelo no termine nunca bajo vLLM. Hay que asegurarse de que el EOS efectivo sea 151645 (`<|im_end|>`).
- Sin logica de thinking configurable: no existe el flag `enable_thinking` ni un modo sin razonamiento. La plantilla es ChatML plana, por lo que no se puede desactivar la traza de pensamiento desde la plantilla.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad matematica. Como cualquier modelo de lenguaje, puede producir trazas de razonamiento plausibles con resultados incorrectos.
- Idiomas: no hay informacion sobre cobertura multilingue. Los datos de entrenamiento son de matematicas y razonamiento, probablemente centrados en ingles; el rendimiento en castellano no esta documentado.
- Contexto: la ventana de 32768 tokens se corresponde con la longitud de secuencia de entrenamiento. El comportamiento mas alla de esa longitud (por ejemplo con extrapolacion tipo YaRN) no esta documentado.
- Licencia: Apache-2.0 permite uso comercial, pero al derivar de Qwen3-8B-Base conviene revisar tambien las condiciones del modelo base.
- Trazabilidad: el repositorio no incluye informacion sobre composicion linguistica del dataset, filtros de calidad ni analisis de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/Qwen3-8B-Base-OT3Math-SFT-step750
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/knowledge-distillation/openthoughts3_math
- Framework de entrenamiento verl: https://github.com/volcengine/verl
- Paper o blog del modelo: no disponible
- Repositorio de codigo propio: no disponible
- Demo: no disponible
