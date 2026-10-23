# IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-8-experts

`tags, broken code)
- Total params: 3.88B (3.881.244.016 from safetensors)
- Size bf16: 7.8 GB
- Repo size: 7.8 GB
- License: apache-2.0
- Pipeline: image-text-to-text
- Architecture: qwen3_5_moe (MoE)
- 40 MoE layers
- Active params stay ~3B
- Base model: Qwen/Qwen3.6-35B-A3B (35.95B total params, 256 experts per layer, 71.9 GB bf16)
- Pruning method: REAP, calibrated on 1024 samples from theblackcat102/evol-codealpaca-v1, up to 2048 tokens, seed 42
- MTP head removed (no speculative decoding)
- Attention and linear-attention layers unchanged, shared expert unchanged, vision encoder unchanged, tokenizer and chat template unchanged
- No fine-tuning after pruning
- Code: CerebrasResearch/reap GitHub
- REAP paper: arxiv:2510.13999
- Usage: vLLM, transformers (version 5+ with qwen3_5_moe architecture)
- vLLM GPU memory (weights): 6.5 GiB
- Parameter counts include 0.45B vision encoder

The web search results are useless (ChatGPT plans pages) - they're irrelevant noise. I should not use them. The instructions say to include relevant links found in web search, but these are all about ChatGPT subscriptions, completely unrelated. I should probably not include them as they're not relevant to the model. The instruction says "todos los enlaces relevantes encontrados en la busqueda web" - none of the search results are relevant, so I'll only include the links from the model card.

This is an interesting case: the model is explicitly published as a demonstration of where REAP pruning breaks down. It's NOT usable. The ficha must be honest about this - it's a research artifact, not a production model.

Important note: This appears to be a fictional/future model (Qwen3.6, created 2026-10-22). I must not invent data. I should only use what's in the provided information. For things like context length, languages, quantization types - these are "no disponible" unless stated. The model card doesn't mention context length explicitly. Qwen3.6-35B-A3B context length is not stated in the provided info, so "no disponible".

Let me think about what I know vs what's provided:
- Architecture: qwen3_5_moe, MoE with 256 routed experts per layer originally, 8 kept, 40 MoE layers, 8 experts routed per token, shared expert per MoE layer, attention + linear-attention layers (hybrid attention? The card mentions "attention and linear-attention layers" - so the architecture has linear attention layers, hybrid), vision encoder 0.45B, MTP head (removed).
- Params: 3.88B total (3.881.244.016), ~3B active
- Context: no disponible (not stated)
- Quantization: the checkpoint is bf16 (7.8 GB for 3.88B params ≈ 2 bytes/param, yes bf16). No quantized variants mentioned. So "no disponible" or "bf16 (punto flotante de 16 bits); no se publican variantes cuantizadas". Actually, the card says "Size (bf16)" so the format is bf16. Quantization types: no disponible (only bf16 checkpoint).
- Languages: no disponible
- License: apache-2.0
- Weights format: safetensors

Benchmarks: HumanEval pass@1: 0.0% (0/164) vs 94.5% unpruned. The table has the full comparison across variants. I can reproduce that table - it's data provided in the model card, so it's legitimate to include. The instructions say to present benchmark results comparing with similar models - the variants table is perfect for this.

Hardware requirements:
- vLLM GPU memory (weights): 6.5 GiB
- Tested on NVIDIA DGX Spark (GB10) with vLLM 0.19
- With 6.5 GiB weights, it could fit in consumer GPUs like RTX 4090 (24 GB), RTX 3060 (12 GB) even, but KV cache adds. I should be careful not to invent too much, but reasonable estimates are allowed ("VRAM estimada"). The instructions say "VRAM estimada para inferencia (segun tamano y cuantizacion)". So estimates are expected. 6.5 GiB weights + KV cache + overhead → maybe ~8-10 GiB total. That fits RTX 4090, RTX 3090, and even 12 GB cards. I can say that. But I must be careful: the model is degraded anyway, so hardware advice is somewhat moot - but I should still provide it per the structure.

Deployment: vLLM (tested, v0.19), transformers (v5+, AutoModelForImageTextToText). llama.cpp/Ollama: not mentioned - GGUF not available. I should say no hay GGUF oficial / no disponible.

Comparativa con modelos similares: The best comparison is with the sibling REAP variants (231, 192, 128, 64, 26 experts) and the base model. That's the most honest comparison. I can also mention the base model Qwen3.6-35B-A3B. I shouldn't invent specs for other models not in the info. The variants table already gives params, size, HumanEval. I can build the comparativa table from that data.

Limitaciones: This model is essentially a failed experiment published deliberately:
- 0% HumanEval, incoherent generations
- Router no longer selects (8 kept = 8 routed, so all experts active per token → MoE degenerates to dense)
- Calibration only on code data
- Vision not evaluated
- Only HumanEval evaluated
- MTP head removed → no speculative decoding
- Not suitable for general use (author's warning)

Casos de uso: This is tricky. The model is not usable for production. Honest use cases:
- Research on pruning limits / MoE redundancy
- Educational: demonstrating REAP failure modes
- Benchmarking infrastructure with tiny MoE (6.5 GiB)
- Ablation baseline for the REAP variant family
I should NOT list 6 fake production use cases. The instructions say minimum 6 cases, but the critical rule "NO inventes datos" and honesty takes precedence. I can list realistic "use cases" that are honest: research, education, infra testing, baseline comparison, studying router collapse, etc. Let me try to get to 6 honest ones:
1. Investigación sobre límites de la poda MoE (REAP)
2. Docencia/formación: mostrar colapso del router
3. Prueba de infraestructura de inferencia (vLLM) con modelo MoE pequeño
4. Baseline de ablación frente a variantes 26/64/128 expertos
5. Estudio del comportamiento de MoE degenerado a denso (todos los expertos activos)
6. Evaluación de pipelines de evaluación automática (HumanEval harness) con carga rápida

That's honest and concrete. I'll frame it clearly that none are production use cases.

Capacidades: Must be honest - the model basically fails at generation. Capabilities:
- Multimodal architecture (image-text-to-text pipeline) inherited from base, vision encoder intact but untested
- In practice: text generation is incoherent; 0% HumanEval
- No tool calling data available
- The "capability" section should reflect reality: theoretical inherited capabilities vs actual measured performance.

Arquitectura y entrenamiento:
- MoE transformer (qwen3_5_moe), 40 MoE layers, 256→8 routed experts per layer, 8 experts per token, shared expert per layer, attention + linear-attention (hybrid), vision encoder 0.45B
- Not trained: pruned from Qwen3.6-35B-A3B, no fine-tuning post-pruning
- REAP method: score = router gate weight × L2 norm of output, averaged over routed tokens; lowest removed; router rows removed; renormalized top-k
- Calibration: 1024 samples evol-codealpaca-v1, 2048 tokens max, seed 42
- MTP head removed

Resumen: 2-3 paragraphs, 6-10 lines. Explain what it is: a heavily pruned experimental variant of Qwen3.6-35B-A3B via REAP, published by IAmTheRealGumbo as a demonstration of pruning breakdown. 3.88B total params, ~3B active, 7.8 GB bf16, Apache 2.0. Warning: 0% HumanEval, incoherent output, not for general use.

Enlaces:
- HF model: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-8-experts
- Base model: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- REAP paper: https://arxiv.org/abs/2510.13999
- REAP code: https://github.com/CerebrasResearch/reap
- Calibration dataset: https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
- HumanEval: https://github.com/openai/human-eval
- Sibling variants: 231, 192, 128, 64, 26 experts links
The web search results are irrelevant (ChatGPT pages) - I won't include them since they're not relevant to the model. The instruction says "todos los enlaces relevantes encontrados" - none are relevant.

Formatting rules:
- Spanish (Spain), no spelling errors
- Only first word of titles capitalized
- No emojis
- Only the Markdown ficha
- Tables where possible
- Specific and technical

Note on titles: "Solo la primera palabra de los titulos va en mayuscula" - so "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces". These are given in the prompt already with that style.

Careful with Spanish orthography: I should write proper Spanish with accents (the prompt itself lacks accents but instructs "sin faltas de ortografia", so I should use correct Spanish with tildes: "técnica", "código", etc.). The prompt says "Usa castellano de Espana, sin faltas de ortografia" - proper Spanish includes accents. I'll use them.

Let me draft the specs table:

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo qwen3_5_moe, con capas de atención híbridas (atención estándar y atención lineal) y codificador de visión |
| Parámetros totales | 3,88 B (3.881.244.016, incluidos 0,45 B del codificador de visión) |
| Parámetros activos | ~3 B (8 expertos por token; al conservarse solo 8 expertos por capa, todos los expertos se activan en cada token) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo punto flotante bfloat16, bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (7,8 GB en bf16) |

Number formatting in Spain: decimal comma, thousands with dot. "3.881.244.016" is fine. "3,88 B". "7,8 GB". "6,5 GiB". "94,5 %". In Spain, percentage with space before % is RAE recommended ("94,5 %"), though commonly written "94,5%". I'll use "94,5 %" or "94,5%"... RAE says space. I'll use the space form for correctness. Hmm, in tech blogs usually "94,5%". Either is acceptable; I'll use "94,5 %" to be safe with orthography rules. Actually mixing might look odd in tables. I'll be consistent: use "94,5 %".

Benchmarks table: reproduce the variants table (it's provided data):

| Modelo | Expertos por capa | Expertos conservados | Parámetros totales | Tamaño (bf16) | Memoria GPU en vLLM (pesos) | HumanEval pass@1 |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.6-35B-A3B (sin podar) | 256 | 100 % | 35,95 B | 71,9 GB | 64,7 GiB | 94,5 % (155/164) |
| ...231-experts | 231 | 90 % | 31,96 B | 63,9 GB | 58,8 GiB | 95,1 % (156/164) |
| ...192-experts | 192 | 75 % | 27,05 B | 54,1 GB | 49,7 GiB | 93,3 % (153/164) |
| ...128-experts | 128 | 50 % | 18,99 B | 38,0 GB | 34,7 GiB | 94,5 % (155/164) |
| ...64-experts | 64 | 25 % | 10,93 B | 21,9 GB | 19,7 GiB | 85,4 % (140/164) |
| ...26-experts | 26 | 10 % | 6,15 B | 12,3 GB | 10,7 GiB | 9,1 % (15/164) |
| ...8-experts (este modelo) | 8 | 3 % | 3,88 B | 7,8 GB | 6,5 GiB | 0,0 % (0/164) |

Plus evaluation details: HumanEval all 164 problems, pass@1, greedy decoding, thinking disabled, max 1024 new tokens, vLLM 0.19 on DGX Spark (GB10), scored with openai/human-eval. Noise: 93.9% vs 94.5% run-to-run.

Hardware requirements:
- Weights: 6,5 GiB reported by vLLM; total depends on KV cache
- Estimated VRAM: ~8-10 GiB total with moderate KV cache (estimate - I should mark as estimate)
- Fits consumer GPUs: RTX 4090/3090 (24 GB) comfortably; likely 12 GB cards (RTX 3060/4070) with moderate context. I need to be careful: this is an estimate, which the prompt explicitly requests ("VRAM estimada"). OK.
- Tested on NVIDIA DGX Spark (GB10) with vLLM 0.19 container vllm:26.04-py3
- Deployment: vLLM (`vllm serve ...`), transformers ≥5 with AutoModelForImageTextToText; no GGUF/llama.cpp/Ollama mention → no disponible
- Throughput/latency: no disponible

Comparativa: I'll use the sibling variants + base model. Since the benchmark table already shows them, the comparativa can be a shorter table focusing on: modelo, parámetros, contexto, HumanEval, licencia, disponibilidad. Context is no disponible for all. Licencia: apache-2.0 for this one; base Qwen model license not stated in info → I shouldn't assert Apache for the base... Actually the base model Qwen3.6-35B-A3B license isn't stated in the provided info. I'll put "no disponible" for the base's license or just note this variant is Apache 2.0. Hmm, table needs license column; for base model I can say "no disponible en la información proporcionada". That's awkward but honest. Alternatively, I can frame the comparativa as "variantes de la misma familia" and include license only where known. Let me structure:

| Modelo | Parámetros totales | Expertos por capa | HumanEval pass@1 | Licencia |
|---|---|---|---|---|
| Este modelo (REAP-8) | 3,88 B | 8 | 0,0 % | Apache 2.0 |
| REAP-26-experts | 6,15 B | 26 | 9,1 % | Apache 2.0 (indicada en HF)? |

Hmm, I don't actually know the licenses of sibling variants. They're by the same author with same pruning; likely Apache 2.0 but not stated. To avoid inventing, I'll only claim Apache 2.0 for this model and base... base not stated either. Let me simplify: comparativa table with columns: Modelo, Parámetros totales, Tamaño bf16, HumanEval pass@1, Uso recomendado. And a note that all are pruned from the same base with same calibration. License column: only state for this model; for others "no disponible". Actually that clutters. Alternative: keep license out of the table and mention in text that this variant is Apache 2.0 and the rest of the data comes from the author's model card. The prompt asks to compare "parametros, contexto, rendimiento, licencia y disponibilidad". I'll include license column with "Apache 2.0" for this model and "no disponible" for others... that looks bad but honest. Hmm.

Actually, wait: the base model is Qwen/Qwen3.6-35B-A3B. Qwen models are typically Apache 2.0, but I must not assert without data. I'll write "no disponible" for the ones I don't know. Or I could note in a footnote: "La licencia de las variantes hermanas y del modelo base no consta en la información proporcionada; este repositorio se publica bajo Apache 2.0."

Let me do the table with a "Licencia" column where this model = Apache 2.0 and others = "no disponible". That's honest and follows rules. Actually, it's reasonable to assume the author published all variants under the same license... but rule says don't invent. I'll use "no disponible" with a footnote.

Alternatively, I can make the comparativa a list instead of a table to reduce clutter. The prompt says "Tabla o lista". I'll use a table for the numeric comparison plus notes.

Limitaciones:
- Inutilizable para uso general: 0 % HumanEval, generaciones incoherentes (caracteres repetidos, etiquetas </think> sueltas, código roto)
- Router degenerado: 8 expertos conservados = 8 expertos enrutados por token → todos los expertos activos, el router deja de seleccionar; el MoE se comporta como denso
- Calibración solo con datos de código → otras dominios (matemáticas, multilingüe, chat general, agentes) pueden degradarse aún más
- Visión no evaluada tras la poda (aunque el codificador está intacto)
- Solo se evaluó HumanEval (164 problemas, saturado para esta familia)
- Cabecera MTP eliminada → sin decodificación especulativa
- Sin ajuste fino post-poda
- Contexto e idiomas no documentados

Resumen draft:

Párrafo 1: Qwen3.6-35B-A3B-REAP-8-experts es una variante experimental, podada agresivamente a partir de Qwen3.6-35B-A3B de Qwen mediante REAP (Router-weighted Expert Activation Pruning), publicada por el usuario IAmTheRealGumbo. Conserva solo 8 de los 256 expertos enrutados por capa en las 40 capas MoE (el 3 %), lo que reduce los parámetros totales de 35,95 B a 3,88 B y el checkpoint bf16 a 7,8 GB, manteniendo ~3 B de parámetros activos.

Párrafo 2: No es un modelo de uso general: el propio autor advierte que está gravemente degradado. Al conservarse tantos expertos como los que se enrutan por token (8), el router deja de tener margen de selección y el MoE degenera en un modelo denso; resuelve 0 de 164 problemas de HumanEval (frente al 94,5 % del modelo base) y genera texto incoherente.

Párrafo 3: Su valor es documental: sirve como punto de la curva de ablación de la familia REAP para mostrar dónde se rompe la poda en esta arquitectura. Para uso real, el autor recomienda las variantes de 128 o más expertos. Licencia Apache 2.0, pesos en safetensors, pipeline image-text-to-text.

That's about 9-10 lines total. Good.

Capacidades (honest):
- Arquitectura multimodal heredada (pipeline image-text-to-text) con codificador de visión de 0,45 B intacto, aunque el rendimiento en imagen/vídeo no fue evaluado tras la poda
- Generación de texto: en la práctica, incoherente (caracteres repetidos, etiquetas </think> espurias, código roto); 0 % en HumanEval
- Razonamiento/código/matemáticas: no disponibles o colapsados; la calibración fue solo de código y aun así HumanEval es 0 %
- Tool calling / function calling: no disponible (no documentado)
- Modo thinking: el modelo base soporta thinking disabled flag in eval (enable_thinking: false) - the eval used enable_thinking false, implying the chat template has thinking mode. But I shouldn't overclaim; I can mention that the evaluation disabled thinking mode via enable_thinking: false, which suggests the chat template inherits the thinking mode of the base, but there's no data on its behavior post-pruning. Hmm, careful. I'll mention it as inherited from template, untested.
- Idiomas: no disponible

Casos de uso (honest, research-oriented, 6):
1. Investigación en poda de MoE: punto extremo de la curva de ablación REAP (256→8 expertos) para estudiar el colapso del router
2. Docencia: ejemplo práctico de por qué la poda extrema sin reentrenamiento destruye un MoE
3. Prueba de infraestructura: cargar un MoE completo en 6,5 GiB para validar pipelines de vLLM/transformers sin hardware grande
4. Baseline de comparación frente a las variantes 26/64/128 expertos para medir degradación
5. Estudio del comportamiento de un MoE degenerado a denso (todos los expertos activos por token)
6. Verificación de harness de evaluación (openai/human-eval) con un modelo que falla todo, útil como control negativo

All honest. Good.

Arquitectura y entrenamiento:
- MoE qwen3_5_moe: 40 capas MoE, 256 expertos enrutados por capa originalmente, 8 conservados, enrutamiento top-8 por token, experto compartido por capa intacto, capas de atención y atención lineal sin cambios, codificador de visión de 0,45 B intacto
- No hay entrenamiento: es una poda del base; sin fine-tuning posterior
- REAP: puntúa cada experto por la media de (peso de puerta del router × norma L2 de su salida) sobre los tokens enrutados a él; elimina los de menor puntuación junto con sus filas del router; renormaliza los pesos top-k al puntuar
- Calibración: 1024 muestras de theblackcat102/evol-codealpaca-v1 (instrucciones de código), hasta 2048 tokens, semilla 42; misma pasada de calibración para todas las variantes
- MTP head eliminada (REAP no la calibra) → sin decodificación especulativa
- Herramienta: CerebrasResearch/reap con cambios locales para la arquitectura Qwen3.5/3.6 MoE (tensores de expertos apilados); reap_args.yaml registra los argumentos

Enlaces:
- Modelo: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-8-experts
- Base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper REAP: https://arxiv.org/abs/2510.13999
- Código REAP: https://github.com/CerebrasResearch/reap
- Dataset calibración: https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
- HumanEval: https://github.com/openai/human-eval
- Variantes: 231, 192, 128, 64, 26 experts URLs

Web search results: irrelevant (ChatGPT subscription pages). I will note nothing about them, or in Enlaces say "La búsqueda web no arrojó enlaces relevantes adicionales al modelo." That's transparent and follows "no disponible" spirit. Good.

Now, hardware section details:
- Pesos en vLLM: 6,5 GiB (informado por vLLM al cargar); el uso total añade la caché KV configurada
- VRAM total estimada: ~8-10 GiB con contextos moderados (estimación)
- Cabe en GPUs de consumo: sí, de sobra en RTX 4090/RTX 3090 (24 GB) y con margen en tarjetas de 12-16 GB (RTX 4070 Ti S, RTX 4080); incluso 12 GB como RTX 3060 con contexto ajustado. Mark as estimate.
- GPU de prueba documentada: NVIDIA DGX Spark (GB10) con vLLM 0.19 (contenedor vllm:26.04-py3)
- Despliegue: vLLM (comando `vllm serve`), transformers ≥5 (AutoModelForImageTextToText); no hay GGUF oficial → llama.cpp/Ollama no disponibles
- Latencia/throughput: no disponible

One caution: "transformers version 5 or later, which includes the qwen3_5_moe architecture" - so transformers ≥ 5.

Also note: pipeline image-text-to-text, use AutoModelForImageTextToText and AutoProcessor.

Let me also double check the "Parámetros activos" row: The card says "active parameters stay at roughly 3B" - yes ~3 B. And the nuance: with 8 experts kept and 8 routed, every token passes through every expert. So effectively all non-shared expert capacity is active. Good to note.

Context length: not stated anywhere. "No disponible".

Languages: "no disponibles" per HF data.

Quantization: only bf16 checkpoint. "No disponible (solo checkpoint bf16; sin variantes cuantizadas publicadas)".

Total params: 3.881.244.016 (safetensors) ≈ 3,88 B, including 0,45 B vision encoder.

Now write the ficha. Titles: first letter capitalized only. The mandated section headers are already in that style. Within the ficha, avoid emojis. Use proper Spanish with tildes.

One more consideration: the model card README was truncated at the end ("Base model by the Qwen team ([Qwen/Qwen3.6-35B-A3B](https://huggingface..." - credits cut). Fine.

Also the tags mention "arxiv:2510.13999" which is the REAP paper. Good.

Let me be careful about decimal formatting consistency: In Spain, decimal comma. I'll use commas: 3,88 B; 7,8 GB; 6,5 GiB; 94,5 %. For the integer param count: 3.881.244.016 (dots as thousands separators - standard in Spain). Good.

Benchmarks section: I'll reproduce the full table since it's the provided data and it's the most relevant comparison. Also include evaluation conditions and the noise note.

Comparativa section: The prompt wants comparison with 2-3 alternatives of same category. The sibling variants ARE the natural alternatives. I'll do a table with: Modelo, Parámetros totales, Expertos por capa, Tamaño bf16, HumanEval pass@1, Licencia. For license: this model Apache 2.0; others "no disponible" — hmm, that will look repetitive. Alternative: add a note under the table: "Este repositorio se publica bajo Apache 2.0; la información proporcionada no indica la licencia de las variantes hermanas ni del modelo base." And include the license column with values. Let me just do it with "no disponible" for others. Actually, to reduce noise, maybe columns: Modelo | Parámetros | Contexto | HumanEval pass@1 | Disponibilidad. Contexto = no disponible for all (not documented). Disponibilidad: pesos abiertos en HF (safetensors). License as separate column with "no disponible" except this one. I'll include it; honesty over aesthetics.

Hmm, actually let me reconsider: the comparativa table would then duplicate the benchmark table heavily. Maybe make the comparativa more analytical: a table plus a short paragraph explaining the reading: 128+ experts indistinguishable from base; 64 experts -9 points; 26 experts collapse (-85 points); 8 experts total collapse. And recommendation: for usable model pick 128+ variant. That adds value beyond the benchmark table. I'll do a compact table (modelo, parámetros, tamaño, HumanEval, veredicto) and a paragraph. Veredicto column: "indistinguible del base", "degradación leve", "colapso severo", "inutilizable". That's interpretive but grounded in the data and the author's own statements ("the 231-, 192- and 128-expert variants are not distinguishable from the unpruned model on this benchmark"; "for a usable model pick the 128-expert variant or larger").

License column: I'll drop it from the table and note in text that all figures come from the author's model card and that this repo is Apache 2.0 (license of others not specified in the provided info). Actually the prompt explicitly says compare "licencia y disponibilidad". I'll add the license column with "no disponible" for others. Fine, honest.

Wait — actually, for the base model Qwen/Qwen3.6-35B-A3B, license is not in the provided info. OK "no disponible".

Let me now also think: should I mention that the search results were irrelevant? In Enlaces: "No se encontraron enlaces relevantes adicionales en la búsqueda web (los resultados disponibles no guardan relación con este modelo)." Good transparency.

Length: The ficha should be exhaustive but not bloated. Let me write it.

Draft:

## Resumen

Qwen3.6-35B-A3B-REAP-8-experts es una variante experimental podada a partir de Qwen3.6-35B-A3B de Qwen mediante REAP (Router-weighted Expert Activation Pruning), publicada por el usuario IAmTheRealGumbo en Hugging Face. La poda conserva solo 8 de los 256 expertos enrutados por capa en cada una de las 40 capas MoE (el 3 % de los expertos), lo que reduce los parámetros totales de 35,95 B a 3,88 B (incluidos 0,45 B del codificador de visión) y el checkpoint bf16 a 7,8 GB, manteniendo unos 3 B de parámetros activos.

No es un modelo de uso general: el propio autor advierte de que está gravemente degradado. Como se conservan tantos expertos (8) como los que se enrutan por token, el router pierde toda capacidad de selección y el MoE degenera en un modelo denso; el resultado es texto incoherente y un 0,0 % en HumanEval, frente al 94,5 % del modelo base.

Su valor es documental: constituye el punto extremo de la curva de ablación de la familia de variantes REAP y muestra dónde se rompe este método de poda en la arquitectura Qwen3.5/3.6 MoE. Para uso real, el autor remite a las variantes de 128 expertos o superiores. Se distribuye bajo licencia Apache 2.0 en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) con capas de atención híbridas (atención estándar y atención lineal), experto compartido por capa MoE y codificador de visión; pipeline image-text-to-text |
| Parámetros totales | 3,88 B (3.881.244.016, incluidos 0,45 B del codificador de visión) |
| Parámetros activos | ~3 B por token (8 expertos enrutados por token; al conservarse solo 8 expertos por capa, todos se activan en cada token) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo checkpoint en bfloat16; sin variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (7,8 GB en bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.6-35B-A3B (familia qwen3_5_moe): 40 capas MoE con 256 expertos enrutados por capa en el modelo base, enrutamiento top-8 por token y un experto compartido por capa. La poda con REAP eliminó 248 de los 256 expertos enrutados de cada capa, junto con sus filas correspondientes del router, y dejó intactas las capas de atención y atención lineal, el experto compartido, el codificador de visión de 0,45 B, el tokenizador y la plantilla de chat. También se eliminó la cabecera de predicción multi-token (MTP), que REAP no calibra, por lo que la decodificación especulativa MTP no está disponible en este checkpoint.

No hubo entrenamiento ni ajuste fino posterior a la poda. REAP puntúa cada experto por la media del producto del peso de puerta del router por la norma L2 de su salida, calculada sobre los tokens enrutados a él, y elimina los de menor puntuación por capa; los pesos top-k del router se renormalizan durante la puntuación para reproducir el enrutamiento real del modelo. La calibración empleó 1024 muestras del conjunto theblackcat102/evol-codealpaca-v1 (instrucciones de código), con un máximo de 2048 tokens por muestra y semilla 42; todas las variantes de la familia proceden de la misma pasada de calibración. La herramienta utilizada fue el repositorio CerebrasResearch/reap, con modificaciones locales para soportar la arquitectura MoE de Qwen3.5/3.6 (tensores de expertos apilados); los argumentos exactos quedan registrados en reap_args.yaml del repositorio.

## Capacidades

- Generación de texto: en la práctica, incoherente tras la poda (caracteres repetidos, etiquetas `</think>` espurias y código roto), según documenta el autor.
- Código: 0 de 164 problemas de HumanEval resueltos (0,0 %), pese a que la calibración se realizó exclusivamente con datos de código.
- Multimodalidad: la arquitectura image-text-to-text y el codificador de visión se conservan intactos, pero la comprensión de imágenes y vídeo no fue evaluada tras la poda.
- Razonamiento, matemáticas y chat general: sin datos publicados; el autor advierte de que estos dominios pueden degradarse incluso más que el código.
- Tool calling / function calling: no disponible (sin datos publicados).
- Modo thinking: la evaluación se realizó con `enable_thinking: false` en la plantilla de chat heredada del modelo base; el comportamiento del modo thinking tras la poda no está documentado.
- Capacidades multilingües: no disponible.

## Casos de uso

Dado que el modelo es inutilizable para producción, los escenarios realistas son de investigación y formación:

- Investigación en poda de MoE: sirve como punto extremo de la curva de ablación REAP (de 256 a 8 expertos por capa) para estudiar el colapso del router cuando el número de expertos conservados iguala al número de expertos enrutados por token.
- Docencia y formación: ejemplo concreto de por qué la poda estructural extrema sin reentrenamiento destruye un modelo mezcla de expertos.
- Prueba de infraestructura de inferencia: con solo 6,5 GiB de pesos, permite validar despliegues de vLLM y transformers sobre MoE en hardware modesto sin consumir decenas de GiB.
- Control negativo en pipelines de evaluación: al fallar la totalidad de HumanEval, resulta útil como caso de prueba para verificar que un harness de evaluación (por ejemplo, openai/human-eval) detecta correctamente fallos totales.
- Baseline de comparación: referencia de degradación máxima frente a las variantes de 26, 64 y 128 expertos para cuantificar la relación entre expertos conservados y rendimiento.
- Estudio de MoE degenerado a denso: al activarse todos los expertos en cada token, permite analizar el comportamiento y el coste real de un MoE convertido de facto en modelo denso.

## Benchmarks y rendimiento

Único benchmark publicado (por el autor, en la model card): HumanEval, 164 problemas, pass@1, decodificación greedy (temperatura 0), thinking desactivado, máximo 1024 tokens nuevos, servido con vLLM 0.19 en una NVIDIA DGX Spark (GB10) y puntuado con openai/human-eval.

| Modelo | Expertos por capa | Expertos conservados | Parámetros totales | Tamaño (bf16) | Memoria GPU en vLLM (pesos) | HumanEval pass@1 |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.6-35B-A3B (sin podar) | 256 | 100 % | 35,95 B | 71,9 GB | 64,7 GiB | 94,5 % (155/164) |
| Qwen3.6-35B-A3B-REAP-231-experts | 231 | 90 % | 31,96 B | 63,9 GB | 58,8 GiB | 95,1 % (156/164) |
| Qwen3.6-35B-A3B-REAP-192-experts | 192 | 75 % | 27,05 B | 54,1 GB | 49,7 GiB | 93,3 % (153/164) |
| Qwen3.6-35B-A3B-REAP-128-experts | 128 | 50 % | 18,99 B | 38,0 GB | 34,7 GiB | 94,5 % (155/164) |
| Qwen3.6-35B-A3B-REAP-64-experts | 64 | 25 % | 10,93 B | 21,9 GB | 19,7 GiB | 85,4 % (140/164) |
| Qwen3.6-35B-A3B-REAP-26-experts | 26 | 10 % | 6,15 B | 12,3 GB | 10,7 GiB | 9,1 % (15/164) |
| **Qwen3.6-35B-A3B-REAP-8-experts (este modelo)** | **8** | **3 %** | **3,88 B** | **7,8 GB** | **6,5 GiB** | **0,0 % (0/164)** |

Notas del autor: dos ejecuciones idénticas del modelo sin podar puntuaron 93,9 % y 94,5 %, por lo que diferencias de uno o dos problemas (en torno a 1 punto) entran dentro del ruido; los recuentos de parámetros incluyen el codificador de visión de 0,45 B; la memoria GPU indicada es la que reporta vLLM al cargar los pesos, sin la caché KV. No hay datos de MMLU, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM para los pesos: 6,5 GiB según vLLM al cargar el checkpoint bf16; el uso total añade la caché KV configurada y la sobrecarga de ejecución, por lo que una estimación realista ronda los 8-10 GiB con contextos moderados.
- GPUs de consumo: cabe con holgura en una RTX 4090 o RTX 3090 (24 GB) y, con estimaciones prudentes de caché KV, también en tarjetas de 12-16 GB (RTX 3060 de 12 GB, RTX 4070 y superiores). (estimación)
- Hardware documentado en las pruebas: NVIDIA DGX Spark (GB10), con vLLM 0.19 en el contenedor NVIDIA vllm:26.04-py3.
- Despliegue: vLLM (`vllm serve IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-8-experts`) y transformers versión 5 o posterior (AutoModelForImageTextToText con AutoProcessor, dtype auto y device_map auto).
- llama.cpp, Ollama y TGI: no disponible (no hay conversiones GGUF ni instrucciones publicadas para estos entornos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Las alternativas naturales son las variantes hermanas de la misma familia REAP y el modelo base, todas podadas del mismo origen con la misma calibración:

| Modelo | Parámetros totales | Tamaño (bf16) | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REAP-8-experts (este modelo) | 3,88 B | 7,8 GB | 0,0 % | Apache 2.0 | Pesos abiertos en Hugging Face (safetensors) |
| REAP-26-experts | 6,15 B | 12,3 GB | 9,1 % | No disponible | Pesos abiertos en Hugging Face (safetensors) |
| REAP-64-experts | 10,93 B | 21,9 GB | 85,4 % | No disponible | Pesos abiertos en Hugging Face (safetensors) |
| REAP-128-experts | 18,99 B | 38,0 GB | 94,5 % | No disponible | Pesos abiertos en Hugging Face (safetensors) |
| Qwen3.6-35B-A3B (base) | 35,95 B | 71,9 GB | 94,5 % | No disponible | Pesos abiertos en Hugging Face (safetensors) |

Lectura de la tabla: las variantes de 128, 192 y 231 expertos son estadísticamente indistinguibles del modelo base en HumanEval; la de 64 expertos pierde unos 9 puntos; a partir de 26 expertos el rendimiento colapsa y con 8 el modelo queda inutilizable. La longitud de contexto no consta en la información proporcionada para ninguno de ellos. Para un modelo usable, el autor recomienda la variante de 128 expertos o superior.

## Limitaciones y advertencias

- El modelo está gravemente degradado y no es apto para uso general: genera texto incoherente (caracteres repetidos, etiquetas `</think>` espurias, código roto) y resuelve el 0 % de HumanEval.
- El router queda funcionalmente anulado: al conservarse 8 expertos por capa y enrutarse 8 por token, todos los expertos se activan siempre y la selección adaptativa del MoE desaparece.
- La calibración de REAP usó solo datos de código, por lo que la selección de expertos favorece ese dominio; matemáticas, multilingüe, chat general y uso agéntico pueden degradarse más de lo que sugiere HumanEval.
- La comprensión de imágenes y vídeo no fue evaluada tras la poda, aunque el codificador de visión está intacto.
- HumanEval es un benchmark pequeño (164 problemas) y saturado para esta familia: detecta regresiones grandes, pero no pequeñas.
- La cabecera MTP se eliminó, de modo que la decodificación especulativa MTP no está disponible.
- No se realizó ningún ajuste fino tras la poda, y no hay datos de sesgos, alucinaciones ni comportamiento en producción.
- Longitud de contexto, idiomas soportados y rendimientos de latencia no están documentados.
- La licencia Apache 2.0 permite uso comercial, pero el estado del modelo lo hace inviable en la práctica.

## Enlaces

- Ficha del modelo: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-8-experts
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper de REAP: https://arxiv.org/abs/2510.13999
- Código de REAP: https://github.com/CerebrasResearch/reap
- Dataset de calibración: https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
- Harness de HumanEval: https://github.com/openai/human-eval
- Variantes hermanas: REAP-231-experts, REAP-192-experts, REAP-128-experts, REAP-64-experts, REAP-26-experts (con URLs)
- La búsqueda web no aportó enlaces relevantes adicionales sobre este modelo.

Let me include the URLs for the sibling variants to be exhaustive:
- https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-231-experts
- https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-192-experts
- https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-128-experts
- https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-64-experts
- https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-26-experts

Check orthography: "cuantización" - in Spain, "cuantización" is fine (also "cuantificación"). HF uses "cuantización". OK.

"no disponible" rows: fine.

One thing: the prompt says the "Parámetros activos" row is "solo si es MoE" - it is MoE, so include.

Also note in specs: "Arquitectura" - I should mention transformer MoE. The qwen3_5_moe architecture: MoE transformer with hybrid attention (standard + linear attention layers mentioned in the card: "attention and linear-attention layers"). So hybrid attention architecture. I'll describe as: "Transformador MoE (qwen3_5_moe) con atención híbrida (capas de atención estándar y atención lineal), 40 capas MoE, experto compartido por capa y codificador de visión (image-text-to-text)".

Careful: "40 MoE layers" is stated. Total layer count unknown. Fine.

Check the summary length: 6-10 lines total across 2-3 paragraphs. My draft has 3 paragraphs, roughly 9-10 lines. OK.

Check "Solo la primera palabra de los titulos va en mayuscula": My section titles match the template. Within text, proper nouns capitalized is fine (that rule applies to titles).

No emojis. No invented numbers. I think estimates in hardware are flagged as estimates, which the prompt explicitly requests ("VRAM estimada").

One more check: "Tipos de cuantización" - the checkpoint is bf16; I could put "bf16 (nativo); sin variantes cuantizadas publicadas". That's more informative than "no disponible". The row asks for quantization types; bf16 is a precision, not quantization per se. I'll write: "No disponible (solo se publica el checkpoint en bfloat16)". Good.

Also the "Idiomas soportados": HF data says "no disponibles". Good.

In Benchmarks, the prompt says if no data, say the phrase. We DO have data (HumanEval). Good.

For the "Comparativa" license column, having "No disponible" repeated is fine and honest.

Also should I mention downloads 0, likes 0? Could add to summary: "recién publicado, sin descargas registradas". The HF metadata says 0 downloads, 0 likes, created 2026-10-22. It's a minor detail; could mention in resumen that it's a niche research publication. I'll mention creation date maybe. Keep it light: "publicada el 22 de octubre de 2026". Hmm, dates: Creado 2026-10-22. I can mention it. It adds context. I'll include briefly.

Final formatting: respond only with the Markdown ficha. Let me finalize, ensuring Spanish tildes are correct: "técnica", "código", "también", "está", "más", "según", "número", "puntuación", "renormalizan", "decodificación", "especulativa", "incoherente", "inutilizable", "variante", "estadísticamente", "holgura", "caché", "configurada", "documentados", "práctica", "inviable", "búsqueda", "aportó".

"vLLM 0.19" keep as is. "DGX Spark (GB10)" as is.

Note: the model card says "vLLM 0.19 (NVIDIA vllm:26.04-py3 container)". I'll write "vLLM 0.19 (contenedor NVIDIA vllm:26.04-py3)".

Percent formatting: I'll use "94,5 %" consistently. In tables too.

Also "3,88 B" - maybe better "3,88 B (3.881.244.016 parámetros)". Good.

Write final answer now.## Resumen

Qwen3.6-35B-A3B-REAP-8-experts es una variante experimental podada agresivamente a partir de Qwen3.6-35B-A3B de Qwen mediante REAP (Router-weighted Expert Activation Pruning), publicada en Hugging Face por el usuario IAmTheRealGumbo el 22 de octubre de 2026. La poda conserva solo 8 de los 256 expertos enrutados por capa en cada una de las 40 capas MoE (el 3 % de los expertos), lo que reduce los parámetros totales de 35,95 B a 3,88 B (incluidos 0,45 B del codificador de visión) y el checkpoint bf16 a 7,8 GB, manteniendo unos 3 B de parámetros activos.

No es un modelo de uso general: el propio autor advierte de que está gravemente degradado. Como se conservan tantos expertos (8) como los que se enrutan por token, el router pierde toda capacidad de selección y el MoE degenera de facto en un modelo denso; el resultado es texto incoherente y un 0,0 % en HumanEval, frente al 94,5 % del modelo base.

Su valor es documental: constituye el punto extremo de la curva de ablación de la familia de variantes REAP y muestra dónde se rompe este método de poda en la arquitectura Qwen3.5/3.6 MoE. Para uso real, el autor remite a las variantes de 128 expertos o superiores. Se distribuye bajo licencia Apache 2.0 en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformador MoE (qwen3_5_moe) con atención híbrida (capas de atención estándar y atención lineal), experto compartido por capa MoE y codificador de visión; pipeline image-text-to-text |
| Parámetros totales | 3,88 B (3.881.244.016, incluidos 0,45 B del codificador de visión) |
| Parámetros activos | ~3 B por token (8 expertos enrutados por token; al conservarse solo 8 expertos por capa, todos se activan en cada token) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publica el checkpoint en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (7,8 GB en bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.6-35B-A3B (familia qwen3_5_moe): 40 capas MoE con 256 expertos enrutados por capa en el modelo base, enrutamiento top-8 por token y un experto compartido por capa. La poda con REAP eliminó 248 de los 256 expertos enrutados de cada capa junto con sus filas correspondientes del router, y dejó intactas las capas de atención y atención lineal, el experto compartido, el codificador de visión de 0,45 B, el tokenizador y la plantilla de chat. También se eliminó la cabecera de predicción multi-token (MTP), que REAP no calibra, por lo que la decodificación especulativa MTP no está disponible en este checkpoint.

No hubo entrenamiento ni ajuste fino posterior a la poda. REAP puntúa cada experto por la media del producto del peso de puerta del router por la norma L2 de su salida, calculada sobre los tokens enrutados a él, y elimina los de menor puntuación por capa; los pesos top-k del router se renormalizan al puntuar para reproducir el enrutamiento real del modelo. La calibración empleó 1024 muestras del conjunto theblackcat102/evol-codealpaca-v1 (instrucciones de código), con un máximo de 2048 tokens por muestra y semilla 42; todas las variantes de la familia proceden de la misma pasada de calibración. La herramienta utilizada fue el repositorio CerebrasResearch/reap, con modificaciones locales para soportar la arquitectura MoE de Qwen3.5/3.6 (tensores de expertos apilados); los argumentos exactos constan en el archivo reap_args.yaml del repositorio.

## Capacidades

- Generación de texto: en la práctica, incoherente tras la poda (caracteres repetidos, etiquetas `</think>` espurias y código roto), según documenta el autor.
- Código: 0 de 164 problemas de HumanEval resueltos (0,0 %), pese a que la calibración se realizó exclusivamente con datos de código.
- Multimodalidad: la arquitectura image-text-to-text y el codificador de visión se conservan intactos, pero la comprensión de imágenes y vídeo no fue evaluada tras la poda.
- Razonamiento, matemáticas y chat general: sin datos publicados; el autor advierte de que estos dominios pueden degradarse incluso más que el código.
- Tool calling / function calling: no disponible (sin datos publicados).
- Modo thinking: la evaluación se realizó con `enable_thinking: false` sobre la plantilla de chat heredada del modelo base; el comportamiento del modo thinking tras la poda no está documentado.
- Capacidades multilingües: no disponible.

## Casos de uso

Dado que el modelo es inutilizable para producción, los escenarios realistas son de investigación y formación:

- Investigación en poda de MoE: sirve como punto extremo de la curva de ablación REAP (de 256 a 8 expertos por capa) para estudiar el colapso del router cuando el número de expertos conservados iguala al número de expertos enrutados por token.
- Docencia y formación: ejemplo concreto de por qué la poda estructural extrema sin reentrenamiento destruye un modelo mezcla de expertos.
- Prueba de infraestructura de inferencia: con solo 6,5 GiB de pesos, permite validar despliegues de vLLM y transformers sobre arquitecturas MoE en hardware modesto sin ocupar decenas de GiB.
- Control negativo en pipelines de evaluación: al fallar la totalidad de HumanEval, resulta útil como caso de prueba para verificar que un harness de evaluación (por ejemplo, openai/human-eval) detecta correctamente fallos totales.
- Baseline de comparación: referencia de degradación máxima frente a las variantes de 26, 64 y 128 expertos para cuantificar la relación entre expertos conservados y rendimiento.
- Estudio de MoE degenerado a denso: al activarse todos los expertos en cada token, permite analizar el comportamiento y el coste real de un MoE convertido de facto en modelo denso.

## Benchmarks y rendimiento

Único benchmark publicado (por el autor, en la model card): HumanEval, 164 problemas, pass@1, decodificación greedy (temperatura 0), thinking desactivado, máximo 1024 tokens nuevos, servido con vLLM 0.19 (contenedor NVIDIA vllm:26.04-py3) en una NVIDIA DGX Spark (GB10) y puntuado con openai/human-eval.

| Modelo | Expertos por capa | Expertos conservados | Parámetros totales | Tamaño (bf16) | Memoria GPU en vLLM (pesos) | HumanEval pass@1 |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.6-35B-A3B (sin podar) | 256 | 100 % | 35,95 B | 71,9 GB | 64,7 GiB | 94,5 % (155/164) |
| Qwen3.6-35B-A3B-REAP-231-experts | 231 | 90 % | 31,96 B | 63,9 GB | 58,8 GiB | 95,1 % (156/164) |
| Qwen3.6-35B-A3B-REAP-192-experts | 192 | 75 % | 27,05 B | 54,1 GB | 49,7 GiB | 93,3 % (153/164) |
| Qwen3.6-35B-A3B-REAP-128-experts | 128 | 50 % | 18,99 B | 38,0 GB | 34,7 GiB | 94,5 % (155/164) |
| Qwen3.6-35B-A3B-REAP-64-experts | 64 | 25 % | 10,93 B | 21,9 GB | 19,7 GiB | 85,4 % (140/164) |
| Qwen3.6-35B-A3B-REAP-26-experts | 26 | 10 % | 6,15 B | 12,3 GB | 10,7 GiB | 9,1 % (15/164) |
| **Qwen3.6-35B-A3B-REAP-8-experts (este modelo)** | **8** | **3 %** | **3,88 B** | **7,8 GB** | **6,5 GiB** | **0,0 % (0/164)** |

Notas del autor: dos ejecuciones idénticas del modelo sin podar puntuaron 93,9 % y 94,5 %, por lo que diferencias de uno o dos problemas (en torno a 1 punto) entran dentro del ruido; los recuentos de parámetros incluyen el codificador de visión de 0,45 B; la memoria GPU indicada es la que reporta vLLM al cargar los pesos, sin incluir la caché KV. No hay datos publicados de MMLU, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM para los pesos: 6,5 GiB según vLLM al cargar el checkpoint bf16; el uso total añade la caché KV configurada y la sobrecarga de ejecución, por lo que una estimación realista ronda los 8-10 GiB con contextos moderados.
- GPUs de consumo: cabe con holgura en una RTX 4090 o RTX 3090 (24 GB) y, con estimaciones prudentes de caché KV, también en tarjetas de 12-16 GB (RTX 3060 de 12 GB, RTX 4070 o superiores). Dato estimado a partir del tamaño de pesos.
- Hardware documentado en las pruebas: NVIDIA DGX Spark (GB10), con vLLM 0.19 en el contenedor NVIDIA vllm:26.04-py3.
- Despliegue: vLLM (`vllm serve IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-8-experts`) y transformers versión 5 o posterior (`AutoModelForImageTextToText` con `AutoProcessor`, `dtype="auto"` y `device_map="auto"`); el número de expertos se lee del config.json.
- llama.cpp, Ollama y TGI: no disponible (no hay conversiones GGUF ni instrucciones publicadas para estos entornos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Las alternativas naturales son las variantes hermanas de la misma familia REAP y el modelo base, todas podadas del mismo origen con la misma calibración:

| Modelo | Parámetros totales | Tamaño (bf16) | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REAP-8-experts (este modelo) | 3,88 B | 7,8 GB | 0,0 % | Apache 2.0 | Pesos abiertos en Hugging Face (safetensors) |
| REAP-26-experts | 6,15 B | 12,3 GB | 9,1 % | No disponible | Pesos abiertos en Hugging Face (safetensors) |
| REAP-64-experts | 10,93 B | 21,9 GB | 85,4 % | No disponible | Pesos abiertos en Hugging Face (safetensors) |
| REAP-128-experts | 18,99 B | 38,0 GB | 94,5 % | No disponible | Pesos abiertos en Hugging Face (safetensors) |
| Qwen3.6-35B-A3B (base) | 35,95 B | 71,9 GB | 94,5 % | No disponible | Pesos abiertos en Hugging Face (safetensors) |

Lectura de la tabla: las variantes de 128, 192 y 231 expertos son estadísticamente indistinguibles del modelo base en HumanEval; la de 64 expertos pierde unos 9 puntos; con 26 expertos el rendimiento colapsa y con 8 el modelo queda inutilizable. La longitud de contexto no consta en la información proporcionada para ninguno de ellos. Para un modelo usable, el autor recomienda la variante de 128 expertos o superior.

## Limitaciones y advertencias

- El modelo está gravemente degradado y no es apto para uso general: genera texto incoherente (caracteres repetidos, etiquetas `</think>` espurias, código roto) y resuelve el 0 % de HumanEval.
- El router queda funcionalmente anulado: al conservarse 8 expertos por capa y enrutarse 8 por token, todos los expertos se activan siempre y desaparece la selección adaptativa propia del MoE.
- La calibración de REAP usó solo datos de código, por lo que la selección de expertos favorece ese dominio; matemáticas, multilingüe, chat general y uso agéntico pueden degradarse más de lo que sugiere HumanEval.
- La comprensión de imágenes y vídeo no fue evaluada tras la poda, aunque el codificador de visión está intacto.
- HumanEval es un benchmark pequeño (164 problemas) y saturado para esta familia: detecta regresiones grandes, pero no pequeñas.
- La cabecera MTP se eliminó, de modo que la decodificación especulativa MTP no está disponible con este checkpoint.
- No se realizó ningún ajuste fino tras la poda, y no hay datos publicados sobre sesgos, riesgo de alucinación ni comportamiento en producción.
- Longitud de contexto, idiomas soportados y latencia no están documentados.
- La licencia Apache 2.0 permite el uso comercial, pero el estado del modelo lo hace inviable en la práctica.

## Enlaces

- Ficha del modelo: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-8-experts
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper de REAP: https://arxiv.org/abs/2510.13999
- Código de REAP: https://github.com/CerebrasResearch/reap
- Dataset de calibración: https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
- Harness de HumanEval: https://github.com/openai/human-eval
- Variante REAP-231-experts: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-231-experts
- Variante REAP-192-experts: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-192-experts
- Variante REAP-128-experts: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-128-experts
- Variante REAP-64-experts: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-64-experts
- Variante REAP-26-experts: https://huggingface.co/IAmTheRealGumbo/Qwen3.6-35B-A3B-REAP-26-experts
- La búsqueda web no aportó enlaces relevantes adicionales sobre este modelo.
