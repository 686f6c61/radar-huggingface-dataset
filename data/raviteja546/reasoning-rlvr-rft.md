# Raviteja546/reasoning-rlvr-rft

<answer>...</answer>. Evaluation greedy, batch-invariant vLLM, 95% bootstrap CI. We can include this.

Need capacities list: reasoning, math, GSM8K, MATH-500, countdown, AIME24. It's a reasoning/math model. It generates thinking traces in think tags and answer in answer block. It supports chain-of-thought / reasoning. Does it support tool calling? Not mentioned. Agent support? Not mentioned. Multilingual? Not available. Special capacity: think-tag template, RFT (rejection fine-tuning?) The name "rft" maybe "rejection fine-tuning" or "reinforcement fine-tuning"? The study "reasoning-rlvr" and checkpoint on branch phase-3-rft; data built by rlvr-build-sft; paired against base. RFT likely "rejection fine-tuning" in RLVR context. But don't need expand. We can say "checkpoint de la fase 3 (RFT) del estudio reasoning-rlvr". It uses think tags.

Casos de uso: minimum 6 concrete. Since it's a small 1.7B math reasoning model, use cases: 1) tutor de matemáticas paso a paso con trazas <think>; 2) verificación/resolución de problemas GSM8K/MATH-500 en pipelines educativos; 3) generación de datos sintéticos de razonamiento matemático para entrenar modelos mayores (RFT/RLVR); 4) evaluación de robustez con gsm8k_perturbed; 5) prototipos de agentes de resolución de problemas con formato estructurado answer; 6) investigación en RLVR/rejection fine-tuning como baseline reproducible; 7) despliegue local en GPU consumer para demos de razonamiento. Need explain how and why. Mention limitations like truncation and extraction failures. Keep realistic.

Benchmarks table: We have data. Need present table. Could include the main eval table (think_tag, few_shot_cot, zero_shot) and paired comparison. The instruction: "Si hay datos de benchmarks en la informacion proporcionada, presenta una tabla con los resultados (MMLU, HumanEval, GSM8K, etc.) comparando con modelos similares." We have GSM8K, GSM8K perturbed, MATH-500, Countdown, AIME24. No MMLU/HumanEval. We can present the provided benchmark table. We should not invent comparable models. For comparativa with similar models: We can compare with base model reasoning-rlvr-sft (SFT) as the direct alternative, and perhaps Qwen3-1.7B base? But we don't have benchmark numbers for Qwen3-1.7B. The model card provides SFT vs RFT. We can compare this checkpoint (RFT) vs its SFT base. That's valid. The section asks compare with 2-3 alternatives of same category. We only have one alternative with numbers (SFT). We can mention "no se dispone de datos de otros modelos comparables en la información proporcionada" and compare with SFT. Maybe include a table: model, params, context, GSM8K, MATH-500, license, availability. For SFT: params 1.7B (same base), context not available, GSM8K 74.8, MATH-500 50.6, license? Not provided for SFT? The base model repo likely apache-2.0? Not stated. We can put "no disponible". For RFT: 1.7B, context no disponible, GSM8K 78.2, MATH-500 56.4, apache-2.0, HF. Also maybe Qwen3-1.7B as reference but no numbers; could mention not available. Need not invent.

Hardware requirements: 1.7B params. VRAM estimate: bf16 ~3.4 GB weights, plus KV cache/activations. For inference, 4-6 GB maybe. With 4-bit quantization ~1 GB weights, 2-3 GB total. But quantization not published; still can estimate. Need be clear estimates. Consumer GPU: RTX 3060 12GB, RTX 4060 8GB, RTX 4090. Deployment: vLLM (used in eval, batch-invariant), Hugging Face Transformers, llama.cpp/Ollama only if GGUF converted (not provided). TGI possible. Latency/throughput: not provided; training 0.20 GPU-hours on H100, peak 32.88 GB. We can say no se publican latencias. But maybe estimate? The instruction says "si se conoce". We don't know. Avoid invented numbers. We can say "no disponible; el autor no publica latencia ni throughput de inferencia". For VRAM estimates, these are derived, okay. But be careful: repo size 48.2 GB suggests maybe full training artifacts; weights 1.7B bf16 ~3.4GB. The total repo size might include optimizer states/checkpoints. We can note.

Limitations: Known failure modes from model card: trained on olympiad-style traces capped at 4096 tokens; longer reasoning cut at cap (truncation rate 93.3% for think_tag on eval? Wait the table shows trunc % 93.3 and extract-fail % 87.8 for think_tag. That's odd: truncation 93.3% and extraction failure 87.8%. That means the think_tag template performs poorly in formatting; prose answers without box count as extraction failures, reported separately. We must mention. Actually the table shows think_tag: gsm8k 78.2, trunc 93.3%, extract-fail 87.8%. That seems like most outputs truncated and extraction failed, yet accuracy 78.2? Maybe math-verify extracts from answer block? Need just report as provided. We can say "el template think_tag muestra una tasa de truncamiento del 93,3% y de fallo de extracción del 87,8% en la evaluación reportada; el autor lo atribuye a respuestas en prosa sin caja y al límite de 4096 tokens." But careful: 87.8% extract-fail seems huge. It is in the table. We should mention as caveat. Also AIME24 0.0 with think_tag, and paired comparison shows -3.3. So weak on AIME24. Countdown 7.0. Data contamination: three MATH-500 problems removed from SFT source; base model pretraining contamination measured but not addressed. License apache-2.0 permits commercial use, but no warranty. Biases: not evaluated; math-focused, English? The model card in English; languages not available. Risk of hallucination in math reasoning; extraction failures; truncation. Context limited to 4096 in training; long reasoning cut. Not instruction-tuned for general chat? It's a reasoning checkpoint. No tool calling/agent support documented. Not safe for production without validation. Quantization not provided.

Links: HF URL, GitHub repo https://github.com/rrtchaganti/reasoning-rlvr, commit link maybe https://github.com/rrtchaganti/reasoning-rlvr/commit/bb6f2a6e01b01397d3edd42861dbba16b88f1b58, dataset open-r1/OpenR1-Math-220k https://huggingface.co/datasets/open-r1/OpenR1-Math-220k, base model https://huggingface.co/Raviteja546/reasoning-rlvr-sft. Maybe author profile. No paper/blog mentioned. We can include only found links.

Need ensure titles: only first word capitalized. In Spanish, headings like "## Resumen", "## Especificaciones tecnicas" (técnicas has accent; title capitalization only first word, so "Especificaciones técnicas" with lowercase t? The rule: "Solo la primera palabra de los titulos va en mayuscula." So "## Especificaciones técnicas" — first word "Especificaciones" capitalized, "técnicas" lowercase. Good. "## Arquitectura y entrenamiento" — "Arquitectura" cap, rest lowercase. "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces". Good.

Need use Spanish from Spain. Avoid "computadora", use "ordenador". Use "cuantización" with accent. Use "parámetros". Use "razonamiento". Use "conjunto de datos". Use "ventana de contexto". Use "flujo de trabajo". Use "producción". Use "despliegue". Use "inferencia". Use "rendimiento". Be precise.

Need no emojis. Only Markdown. No extra text.

Need be careful with tables: Markdown table with pipes. Need include all required rows. For "Parámetros activos", if not MoE, maybe put "no aplica (modelo denso)" in value. That's acceptable. Or "no disponible (no es MoE)". I'll use "no aplica (modelo denso, no es MoE)". This is an inference from architecture. The model tags qwen3 and 1.7B; Qwen3 1.7B is dense. But if we don't know? It's safe. Alternatively "no disponible (no se indica que sea MoE)". Hmm. The instruction: "Parametros activos | ... (solo si es MoE)". Since it's not MoE, we can omit the row? But says include SIEMPRE these filas. So include with "no aplica (no es MoE)". Good.

"Tipos de cuantizacion": "no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales)". Good.

"Idiomas soportados": "no disponible". But maybe training data OpenR1-Math-220k is English? Not stated. Use no disponible.

"Formato de pesos": "safetensors". Repo tags include safetensors.

"Longitud de contexto": "no disponible (entrenamiento y evaluación con 4096 tokens; el contexto nativo del modelo base no se especifica)". That's a bit long for table but okay.

"Arquitectura": "Transformer decoder-only (familia Qwen3, según tags del repositorio)". Good.

"Parámetros totales": "1.720.574.976 (1,7B)".

Need mention repo size 48.2 GB? In specs? Not required, but can mention in hardware or limitations. It's odd: 48.2 GB for 1.7B. Could be because repo includes multiple checkpoints? We can say "el repositorio ocupa 48,2 GB, muy por encima de los ~3,4 GB de pesos bf16 de un modelo de 1,7B; probablemente incluye artefactos de entrenamiento o checkpoints adicionales, aunque no se detalla." Is this inventing? It's an observation and plausible, but "probablemente" is speculation. Better: "El repositorio ocupa 48,2 GB según HuggingFace; no se detalla qué contienen esos artefactos." That's factual. Could include in limitations or hardware. Good.

Need maybe mention "RFT" meaning? The model card calls checkpoint phase-3-rft. It says "Checkpoint from the reasoning-rlvr study" and "RFT". In RLVR, RFT could be "rejection fine-tuning" (RFT) or "reinforcement fine-tuning". The data is built by rlvr-build-sft from RFT train.jsonl. They compare SFT vs RFT. I can say "fase 3 (RFT) del estudio" without expanding. If I expand, risk. Maybe "RFT (rejection fine-tuning, según la nomenclatura habitual del estudio; el autor no lo desarrolla en la model card)"? That's speculative. Better not expand.

Need mention eval "greedy, batch-invariant vLLM, 95% bootstrap CI over problems". Good.

Need parse benchmark table. The provided table:

| template | gsm8k | gsm8k_perturbed | math500 | countdown | aime24 | trunc % | extract-fail % |
| think_tag | 78.2 [75.9, 80.4] | 69.0 [65.8, 72.3] | 56.4 [52.2, 60.6] | 7.0 [4.8, 9.4] | 0.0 [0.0, 0.0] | 93.3 | 87.8 |
| few_shot_cot | 79.2 [77.0, 81.3] | 71.4 [68.3, 74.6] | 55.6 [51.4, 60.0] | - | 0.0 [0.0, 0.0] | 46.7 | 8.6 |
| zero_shot | 81.1 [78.9, 83.2] | 74.7 [71.7, 77.8] | 64.8 [60.6, 69.0] | - | 6.7 [0.0, 16.7] | 63.3 | 10.4 |

Wait: zero_shot outperforms think_tag? That's weird. The model is trained with think_tag template but zero_shot scores higher. The paired comparison is SFT vs RFT with same problems, likely using think_tag? The table "Paired against the base model on the same problems" shows sft vs rft. SFT GSM8K 74.8, RFT 78.2. But the template table shows think_tag 78.2. So paired uses think_tag. So RFT improves over SFT by 3.3 points on GSM8K, 5.8 on MATH-500. But zero_shot gives 81.1 GSM8K and 64.8 MATH-500, higher than think_tag. That suggests the model may not need the think tags or the extraction is better. Need present all.

Potential issue: The "trunc %" for think_tag 93.3% means most outputs hit 4096 token cap. But accuracy still 78.2. The model card says "Trained on olympiad-style traces capped at 4096 tokens; longer reasoning is cut at the cap (truncation rate in the table)." So yes.

Need "Benchmarks y rendimiento" table. Could include two tables: one for eval templates, one for paired comparison. The instruction says "presenta una tabla". We can include both. Also MATH-500 by level maybe too much. Desired oververbosity 5, but task demands exhaustive. We can include main table and paired table. Maybe include MATH-500 by level? It is useful. But too many tables? The structure allows. We can include "MATH-500 por nivel" as a small table. It demonstrates rigor. But final answer length? We have enough. Let's include main eval table and paired comparison table; skip level table or include briefly. The user asked exhaustive. I'll include main eval table and paired table. Maybe mention level breakdown in prose: "En MATH-500, la mejora se concentra en niveles 4 y 5 (+11,7 y +6,7 puntos respectivamente), con intervalo de confianza pareado que excluye cero en nivel 4." This is useful and not too long. Good.

Comparativa: Table with RFT vs SFT base. Columns: Modelo, Parámetros, Contexto, GSM8K, MATH-500, Licencia, Disponibilidad. For SFT: params 1.7B (same base? The base model is reasoning-rlvr-sft; likely 1.7B. The model card says base outputs/train/sft_1p7b/final, so yes 1.7B). Context no disponible. GSM8K 74.8, MATH-500 50.6. License? Not provided. Could put "no disponible en la información". Availability: HF. For RFT: 1.7B, no disponible, 78.2, 56.4, apache-2.0, HF. Also include Qwen3-1.7B? We don't have benchmark numbers. The section says "Si no conoces modelos comparables, indica 'no disponible'." We can say "No se dispone de resultados de Qwen3-1.7B ni de otros modelos de 1,7B en la información proporcionada; la comparación directa posible es con el checkpoint SFT del que deriva." Then table. That satisfies.

Need "Requisitos de hardware": VRAM estimates. Let's calculate:
- 1.72B params. BF16: 3.44 GB weights. FP16 same. FP32: 6.88 GB. INT8: 1.72 GB. INT4: 0.86 GB. KV cache depends on context, layers, heads. Not provided. We can give ranges. For inference with 4096 context, batch 1, maybe 5-8 GB BF16 total? A 1.7B model typically fits in 4-6 GB. With vLLM overhead, 8-12 GB. For consumer: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090 24GB. Also RTX 3050 8GB maybe with 4-bit. But no official quantization. We can say "con cuantización 4-bit no oficial, podría caber en 4-6 GB; sin cuantizaciones publicadas, la ruta recomendada es bf16". In table? Use bullets. "VRAM estimada: ~4-6 GB en bf16 para batch 1 y 4096 tokens (estimación a partir de 1,7B parámetros; no publicada por el autor)." Is that too precise? It's an estimate. We can label "estimación". "~3,5 GB solo pesos; 6-10 GB con overhead de vLLM y KV cache para 4096 tokens." Good.

GPU recommendations: H100 80GB used for training (0.20 GPU-hours, peak 32.88 GB). For inference, A100/H100 not necessary; L4, A10G, RTX 4090, RTX 3090, RTX 4060 Ti 16GB. "Cabe en GPU consumer de 8 GB o más en bf16, y en 4-6 GB con cuantización 4-bit no oficial." But if no quantization, bf16 weights 3.4GB plus overhead, 8GB is enough. Good.

Deployment: vLLM (used in eval, "batch-invariant vLLM"), Transformers, TGI, llama.cpp/Ollama only if converted to GGUF (not provided). Mention "el autor no publica artefactos GGUF". Latency/throughput: not provided. Training compute: 0.20 GPU-hours H100, peak 32.88 GB. That's training, not inference. Mention.

Need "Capacidades" bullets:
- Generación de trazas de razonamiento matemático con formato `<think>...</think><answer>...</answer>`.
- Resolución de problemas de aritmética y matemáticas de competición (GSM8K, GSM8K perturbado, MATH-500, Countdown).
- Razonamiento de cadena de pensamiento (chain-of-thought) y respuestas finales extraíbles.
- Evaluación comparativa con SFT base; mejora en GSM8K, MATH-500 y Countdown.
- No se documenta tool calling, function calling, agentes, visión, audio, multilingüismo.
- Modelo pequeño (1.7B) para experimentación y despliegue local.
- Formato de prompt específico; no es un chat general.
- No se documenta modo "thinking" separado más allá de las etiquetas.

Need "Casos de uso" 6:
1. Tutor de matemáticas paso a paso: genera traza y respuesta; útil para explicar; pero validar extracción.
2. Generación de datos sintéticos de razonamiento para RFT/RLVR: el checkpoint se entrenó con RFT; puede usarse para producir trazas y filtrar por respuesta correcta con math-verify; útil en pipelines de investigación.
3. Evaluación de robustez: usar gsm8k_perturbed para medir sensibilidad a perturbaciones; el modelo tiene resultados publicados.
4. Baseline reproducible en estudios de RLVR: el repo incluye comandos `rlvr-build-sft`, `rlvr-sft`, `rlvr-eval`; sirve para comparar SFT vs RFT.
5. Despliegue local en GPU consumer para demos de resolución de problemas: 1.7B cabe en 8 GB; con vLLM o Transformers; no requiere H100.
6. Clasificación/verificación de soluciones matemáticas: usar el bloque `<answer>` y math-verify para comprobar respuestas en un pipeline educativo; pero cuidado con fallos de extracción.
7. Investigación de truncamiento y formato: analizar por qué think_tag tiene 93.3% truncamiento y 87.8% fallo de extracción; útil para estudiar formatos de razonamiento.
8. Prototipos de agentes de resolución de problemas con formato estructurado: no hay tool calling documentado, pero se puede envolver con código externo para calcular; no es agente nativo. Maybe include.

Need "Limitaciones y advertencias":
- Entrenado con trazas de hasta 4096 tokens; razonamientos más largos se truncan. Tasa de truncamiento 93.3% con think_tag en la eval reportada.
- Tasa de fallo de extracción 87.8% con think_tag; el autor gradúa con math-verify sobre `<answer>` y cuenta respuestas en prosa sin caja como fallo de extracción, no como error. Esto complica producción.
- AIME24 0.0 con think_tag; bajo rendimiento en problemas de competición de alta dificultad.
- Countdown 7.0; limitado en tareas de razonamiento combinatorio.
- No se documentan idiomas; la model card está en inglés y el dataset es OpenR1-Math-220k; no se garantiza soporte multilingüe.
- No se documentan tool calling, agentes, visión, audio.
- Riesgo de alucinación en matemáticas; validar con verificadores simbólicos.
- Contaminación: se eliminaron 3 problemas de MATH-500 del SFT source; la contaminación del pretraining del modelo base se mide en el informe Fase 1 del repo y no se aborda en este checkpoint. Advertencia para comparaciones benchmarks.
- Licencia Apache-2.0 permite uso comercial, pero sin garantías; revisar términos del modelo base y dataset.
- Repo 48.2 GB; no se detalla contenido; cuidado con descarga.
- No se publican cuantizaciones oficiales; si se convierte a GGUF, validar calidad.
- Modelo pequeño; no adecuado para tareas generales de chat o conocimiento amplio.
- Sesgos: no evaluados; dataset matemático; posible sesgo de formato/estilo.

Need "Enlaces":
- HuggingFace: https://huggingface.co/Raviteja546/reasoning-rlvr-rft
- Modelo base SFT: https://huggingface.co/Raviteja546/reasoning-rlvr-sft
- Repo GitHub: https://github.com/rrtchaganti/reasoning-rlvr
- Commit: https://github.com/rrtchaganti/reasoning-rlvr/commit/bb6f2a6e01b01397d3edd42861dbba16b88f1b58
- Dataset: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Maybe author: https://huggingface.co/Raviteja546
No paper/blog/demo found. Mention "No se han encontrado paper, blog o demo adicionales en la información proporcionada." But in Enlaces list, maybe a bullet "No se han encontrado otros enlaces (paper, blog, demo) en la información proporcionada." Good.

Need "Resumen" 2-3 paragraphs, 6-10 lines total. Let's draft:
"reasoning-rlvr-rft es un checkpoint de 1.720.574.976 parámetros (1,7B) publicado por Raviteja546, derivado del modelo reasoning-rlvr-sft y entrenado en la fase 3 (RFT) del estudio reasoning-rlvr. Se trata de un transformer decoder-only de la familia Qwen3, ajustado con fine-tuning completo en bf16 sobre 11.145 ejemplos de razonamiento matemático (13.448.983 tokens por época) y con un formato de prompt basado en etiquetas `<think>` y `<answer>`.

El modelo aborda la resolución de problemas matemáticos y el razonamiento de cadena de pensamiento en un tamaño pequeño, pensado para experimentación reproducible y despliegue local. El autor reporta mejoras frente al checkpoint SFT en GSM8K (+3,3 puntos), MATH-500 (+5,8) y Countdown (+3,2), aunque con tasas altas de truncamiento y fallo de extracción en la plantilla think_tag.

Es relevante ahora porque documenta de forma abierta un pipeline de RLVR/RFT con comandos reproducibles, evaluación con vLLM e intervalos de confianza bootstrap, y porque permite estudiar el equilibrio entre formato de razonamiento, longitud de contexto y calidad de las respuestas en modelos de 1,7B."

Need mention architecture, size, context. Context not available. Maybe "con contexto de entrenamiento de 4096 tokens" not "contexto nativo". Good.

Need ensure "RFT" not expanded incorrectly. Fine.

Need "Arquitectura y entrenamiento" paragraphs:
"El checkpoint parte de `Raviteja546/reasoning-rlvr-sft` y aplica un fine-tuning completo (no LoRA) sobre un transformer decoder-only de 1,7B de la familia Qwen3. El entrenamiento usa bf16, packing y FlashAttention-2, con AdamW (betas 0,9/0,95), learning rate 5e-6, scheduler cosine_with_min_lr hasta 0,1 del pico, warmup 0,03, weight decay 0,1, grad clip 1,0, batch efectivo de 64 secuencias de 4096 tokens, 1 época (53 pasos) y semilla 0. La pérdida es cross-entropy solo sobre los tokens de completación; la pérdida final de entrenamiento es 0,4274690218691556. El cómputo reportado es de 0,20 GPU-horas en una NVIDIA H100 80GB HBM3, con pico de memoria de 32,88 GB.

Los datos provienen de `outputs/data/rft/train.jsonl`, generado con `rlvr-build-sft` (hash de manifiesto `f44edf33a26c55fc`), con 11.145 de 11.145 ejemplos, fracción de subconjunto 1,0 y 13.448.983 tokens por época. El formato de prompt es la plantilla think-tag (`<think> ... </think> <answer> ... </answer>`) usada en las evaluaciones y en las fases de RL del estudio; la referencia de implementación está en `src/rlvr/eval/prompts.py`. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o mezcla de expertos."

Need "Capacidades" bullets. Good.

Need "Benchmarks" tables. Let's format with numbers decimal comma? The model card uses dots. Spanish from Spain uses comma decimal. We should convert to comma? The task says Spanish from Spain. Tables can use comma decimals. But benchmark values are often with dots. We can use comma to be consistent. However, intervals like [75.9, 80.4] should be [75,9; 80,4]? Spanish uses comma and semicolon? We can use "78,2 [75,9; 80,4]". That's more Spanish. But it may be confusing. The instruction doesn't forbid dots, but Spanish from Spain generally uses comma decimal. We'll use comma decimals in prose and tables. Need be consistent. For model params, use dots as thousands? Spanish uses dot for thousands and comma for decimals: 1.720.574.976. Good. For benchmark values, use comma decimals. For CI intervals, use brackets and semicolon? e.g., "78,2 [75,9; 80,4]". That's clear. In table, can use "78,2 [75,9; 80,4]". Good.

Main table:
| Plantilla | GSM8K | GSM8K perturbado | MATH-500 | Countdown | AIME24 | Truncamiento (%) | Fallo de extracción (%) |
| think_tag | 78,2 [75,9; 80,4] | 69,0 [65,8; 72,3] | 56,4 [52,2; 60,6] | 7,0 [4,8; 9,4] | 0,0 [0,0; 0,0] | 93,3 | 87,8 |
| few_shot_cot | 79,2 [77,0; 81,3] | 71,4 [68,3; 74,6] | 55,6 [51,4; 60,0] | - | 0,0 [0,0; 0,0] | 46,7 | 8,6 |
| zero_shot | 81,1 [78,9; 83,2] | 74,7 [71,7; 77,8] | 64,8 [60,6; 69,0] | - | 6,7 [0,0; 16,7] | 63,3 | 10,4 |

Note: The table says "template" and values. We can label "Plantilla". Need note "Evaluación greedy, vLLM batch-invariant, IC bootstrap del 95% sobre problemas." Good.

Paired table:
| Evaluación | Pares | SFT | RFT | RFT - SFT [IC pareado] | Solo SFT / solo RFT |
| GSM8K | 1319 | 74,8 [72,5; 77,1] | 78,2 [76,0; 80,3] | +3,3 [1,0; 5,8] | 101 / 145 |
| GSM8K perturbado | 830 | 66,0 [62,8; 69,3] | 69,0 [65,8; 72,2] | +3,0 [0,0; 5,9] | 62 / 87 |
| MATH-500 | 500 | 50,6 [46,4; 55,0] | 56,4 [52,0; 60,4] | +5,8 [1,6; 10,2] | 49 / 78 |
| Countdown | 500 | 3,8 [2,2; 5,6] | 7,0 [4,8; 9,4] | +3,2 [0,6; 6,0] | 16 / 32 |
| AIME24 | 30 | 3,3 [0,0; 10,0] | 0,0 [0,0; 0,0] | -3,3 [-10,0; 0,0] | 1 / 0 |

Need ensure "pares" for AIME24 30, yes. For MATH-500 500. Good.

Maybe mention "La mejora en MATH-500 por nivel: nivel 4 +11,7 [2,3; 21,1] y nivel 5 +6,7 [0,0; 13
