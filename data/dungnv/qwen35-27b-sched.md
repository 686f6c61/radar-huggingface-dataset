# dungnv/qwen35-27b-sched

stored. No head has seen answer-phase states: 12% of decode steps on ForeLen, 29-37% on chat; predictions there out of distribution.
- Data: ForeLen (abinzzz/ForeLen, LiveCodeBench dropped), WildChat-1M, LMSYS-Chat-1M prompts, deduplicated, prompt-disjoint train/calib/eval splits.
- Pools: base (ForeLen) train 10,744 / calib 2,687 / eval 2,870; chat (WildChat+LMSYS) 14,975 / 1,883 / 1,873.

Heads: mlp2: Linear(5120,512) -> ReLU -> Dropout -> Linear(512,512) -> ReLU -> Dropout -> Linear(512, out). Hidden size 5120.
- binned: 80 logits, bins of 409.6 over 0-32768, softmax(z) @ bin_mids
- progress: 1 logit, p = sigmoid(z), remaining = t*(1-p)/p, p clipped [1e-3,1], result [0,32766]
- absolute: 1 value, z ~ sqrt(remaining), clamp(z,0,200)**2

Held-out accuracy table (MAE, p90 tokens, Spearman) — reasoning steps only, target remaining whole output.
- base binned: trained on output 1633/3860/.796; reasoning only 1774/4293/.801
- base progress: 2172/5269/.749; 2253/5369/.750
- base absolute: 1743/4282/.797; 2623/6858/.776
- chat binned: 843/2012/.716; 1348/2925/.514
- chat progress: 1074/2577/.636; 1511/3190/.530
- chat absolute: 859/2109/.709; 1504/3183/.542

Conformal radii: split-conformal per decode step, q_by_step[t] finite-sample quantile of |true remaining - predicted| at step t for alpha=0.5. M0 last step with ≥20 residuals; q_t flat after. Median q_t (_outlen): base progress 1579, base absolute 1147, chat progress 764, chat absolute 639.

lengths.jsonl: one JSON line per generated prompt (greedy, 32768 cap): gid, T (reasoning length, </think> position), out_len, finish (stop or length), think_closed, prompt_len. Shards: fl_train_*, fl_test_*, chat20k_*, bench_wildchat, bench_lmsys (1000-prompt serving sets).

Web search info about Qwen3.5-27B: dense multimodal foundation model, 27B params, released Feb 2026, Gated Delta Networks + FFN, 256K+ context, native vision-language (text + image + video input). Qwen team Alibaba. Comparable to Qwen3.5-122B-A10B. 24 GB VRAM or Mac 48 GB+.

I need to be careful: the ficha is about the repo, which is not a model per se. I should structure the ficha as required but be honest that this is an auxiliary artifact. Actually the mandatory structure requires "Parametros totales", etc. I'll fill with the head params where relevant and indicate "no disponible" or note that the repo doesn't contain a full LLM.

Hmm — but the ficha template is designed for models. I'll adapt: the "modelo" is the scheduling heads artifact. I'll include specs of both the artifact and the base model Qwen3.5-27B as reference (from web search).

Let me compute the MLP head parameter counts. Input 5120 → 512: 5120*512 + 512 = 2,621,440. Then 512→512: 512*512+512 = 262,656. Then 512→out.
- binned: out=80: 512*80+80 = 41,040. Total = 2,925,136.
- progress/absolute: out=1: 512+1 = 513. Total = 2,884,609.

Should I include these? It's derived computation, could be useful but risk. I'll state approximations cautiously—actually it's straightforward arithmetic, safe. But maybe better to keep it simple and say "~2,9 M parámetros por cabeza (calculado a partir de la arquitectura mlp2 con hidden_size 5120)". Hmm, "no inventes datos" — calculation from given architecture is fine and I'll label it as derived. Actually to be safe, I'll present it as an estimate derived from the stated architecture.

Now, "Tipos de cuantizacion": the heads are fp16/state dicts. The repo is 0.6 GB with .pt and .npz files. No quantization listed → "no disponible (los pesos de las cabezas se almacenan en fp16 según la model card)". Careful: the model card says hidden states stored fp16 for training; it doesn't say the head weights storage. Actually the heads are small MLPs, .pt checkpoints. Hmm. I'll say "no disponible; el repositorio contiene checkpoints .pt y .npz, sin versiones cuantizadas publicadas".

"Formato de pesos": PyTorch .pt (state_dict) y .npz (radios conformales).

"Idiomas soportados": no disponible (el repositorio no declara idiomas; los prompts de entrenamiento son en inglés mayoritariamente — actually ForeLen, WildChat, LMSYS-Chat are largely English/multilingual. I shouldn't claim. I'll say no disponible, and mention that the prompts come from English-language datasets — that's factually in the card? The card says ForeLen, WildChat-1M, LMSYS-Chat-1M. Doesn't state the language. I'll just say no disponible and note the source datasets).

"Licencia": no disponible. Important caveat: license not declared → risk for commercial use. Also base model Qwen3.5-27B license not stated in provided info — Qwen models typically Apache 2.0 but I shouldn't invent. I'll say no disponible.

"Longitud de contexto": not applicable to the heads; max output length targeted is 32768 tokens. For the base model Qwen3.5-27B, web search says 256K+ context. I'll list "no aplicable a las cabezas; el rango de predicción es 0-32768 tokens". And note base model 256K+ per web sources.

"Parámetros activos": not MoE — no aplica. Actually the base model Qwen3.5-27B is dense. I'll write "no aplica (las cabezas son MLP densas; el modelo base Qwen3.5-27B es denso)".

Benchmarks: I have the held-out accuracy table. That's the benchmark data. I'll present it.

Hardware: the heads are tiny — inference overhead negligible. Base model Qwen3.5-27B: 27B dense, needs ~54 GB fp16, ~14-16 GB en 4-bit. Web source says 24 GB VRAM recommended or Mac 48 GB+. I'll cite that. Deployment: vLLM 0.17.1 (used to generate data), eager mode, layer 30 capture hook.

Let me be careful with the captured tensor description: "out[0] of vLLM's decoder layer: the block's output before the residual add". And layer index 30, 0-based over 64 layers, Gated DeltaNet linear-attention layer.

Comparativa: compare with alternatives? The web search doesn't provide comparable scheduling artifacts. I'll say "no disponible" for direct alternatives but can compare the head variants against each other and mention that no equivalent public length-prediction artifacts are described in the provided information. Actually I could compare with the "TRAIL-style SRPT scheduling" mentioned. I'll keep the comparativa focused: the three heads (binned, progress, absolute) + base vs chat pools. And explicitly state no comparable third-party artifacts available in the provided info.

Casos de uso: scheduling-aware serving (SRPT, SJF/LCFS, conformal poset scheduling), admission control, batching, autoscaling, SLO enforcement, routing between models, cost prediction, timeout setting, etc. Min 6.

Limitaciones:
- Only steps before </think>; answer phase OOD (12% ForeLen, 29-37% chat).
- Requires exact tensor match: layer-30 block output before residual add (vLLM-specific), not HF output_hidden_states. Very fragile integration.
- Specific vLLM version 0.17.1, eager mode.
- MAE of hundreds to thousands of tokens — coarse.
- Trained on English-centric prompt pools (ForeLen, WildChat, LMSYS) — domain shift risk.
- Conformal coverage only alpha=0.5 (50% miscoverage) — weak guarantee. Careful: alpha=0.5 means 50% miscoverage target? "for miscoverage alpha = 0.5" — yes, radius covers with 1-alpha = 50% probability. That's a caveat: the guarantee is only nominal 50% coverage.
- Traces hitting 32768 cap dropped → biased toward shorter outputs.
- base vs chat split: heads trained on chat are far better calibrated; base heads degrade.
- No license stated.
- 0 downloads/0 likes — unvalidated community artifact.
- Repo is 0.6 GB; mostly data.

Enlaces: HF URL, datasets: abinzzz/ForeLen, WildChat-1M, LMSYS-Chat-1M. Web links from search: curateclick, theaibench, qwencloud, explore.n1n.ai, apxml. Also mention vLLM. I'll list them.

Note: there's a discrepancy — the repo's creation date 2026-09-30 and Qwen3.5 released Feb 2026. Fine.

Also note: repo mentions "Qwen3.5-27B" served with vLLM 0.17.1; layer 30 of 64.

For the specs table, I'll structure it for the artifact, with some rows for the base model marked as "referencia".

Let me write it. Titles: only first word capitalized. So "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces". Good.

Castellano de España, no emojis.

Let me now be careful about the parameter count estimate. mlp2 layers: Linear(5120,512), Linear(512,512), Linear(512,out). Params: 5120*512+512 = 2,621,440; 512*512+512 = 262,656; binned 512*80+80=41,040 → total 2,925,136 (2,93 M). progress/absolute: 512+1=513 → 2,884,609 (2,88 M). I'll include as derived.

Also the head file sizes: binned heads have more params; the repo is 0.6 GB total mostly JSONL data.

Let me also mention BERT prompt predictor: `collected/qwen35_prompt_pred_outlen.pt` — BERT prompt → whole output-length predictor. No sizes given.

Write the ficha.

For "Resumen" — 2-3 paragraphs, 6-10 lines.

Let me draft.

Resumen:

"`dungnv/qwen35-27b-sched` no es un modelo de lenguaje, sino un conjunto de artefactos auxiliares para planificación de LLM (LLM scheduling) sobre Qwen3.5-27B. Publicado por el usuario dungnv, incluye cabezas MLP pequeñas que leen un estado oculto del decodificador de Qwen3.5-27B en cada paso de decodificación y predicen cuántos tokens de salida quedan por generar, junto con radios conformales por paso y un predictor BERT a nivel de prompt (la clave de admisión para peticiones que aún no han empezado a decodificar)."

"El problema que resuelve es el de la planificación dependiente de la longitud: en un servidor de inferencia, conocer a priori (o durante la decodificación) cuánto va a durar cada petición permite aplicar políticas como SRPT (shortest remaining processing time) al estilo TRAIL o planificación conformal por posets, mejorando el tiempo medio de respuesta frente a FIFO. La relevancia es práctica: los modelos con modo de razonamiento generan longitudes de salida muy variables..."

"Tamaño: cada cabeza es un MLP de ~2,9 M de parámetros (aproximado a partir de la arquitectura declarada), mientras que el modelo base Qwen3.5-27B es un transformer denso multimodal de 27B parámetros, 64 capas de decodificador y más de 256K tokens de contexto según fuentes secundarias. El repositorio ocupa 0,6 GB y no declara licencia ni idiomas."

Good.

Now writing fully.

For the specs table, rows:

| Arquitectura | Cabezas MLP de 3 capas (mlp2) sobre estados ocultos de Qwen3.5-27B; predictor BERT a nivel de prompt |
| Parametros totales | ~2,93 M por cabeza binned y ~2,88 M por cabeza progress/absolute (estimación derivada de la arquitectura mlp2 declarada); el modelo base Qwen3.5-27B tiene 27 000 M |
| Parametros activos | No aplica: las cabezas son MLP densas y el modelo base Qwen3.5-27B es denso (no MoE) |
| Longitud de contexto | No aplica a las cabezas; su rango de predicción es de 0 a 32 768 tokens de salida. El modelo base ofrece más de 256K tokens de contexto según fuentes secundarias |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas. Los checkpoints son .pt y .npz |
| Idiomas soportados | No disponible; no se declara ningún idioma. Los prompts de entrenamiento proceden de ForeLen, WildChat-1M y LMSYS-Chat-1M |
| Licencia | No disponible |
| Formato de pesos | PyTorch .pt (state_dict con mu/sigma) y .npz (radios conformales); los datos de longitudes en JSONL |
| Tamano del repositorio | 0,6 GB |
| Dependencia principal | Qwen3.5-27B servido con vLLM 0.17.1 en modo eager |
| Capa de extraccion | Indice 30 (base 0) de 64 capas, capa de atencion lineal Gated DeltaNet |
| alpha conformal | 0,5 |

Hmm, adding extra rows is fine (template says "incluye SIEMPRE estas filas"). Good.

Benchmarks table: present the held-out accuracy. Columns: pool, head, MAE/p90/Spearman (entrenada sobre output), MAE/p90/Spearman (solo razonamiento).

Rows as extracted.

Also conformal radii median table.

Also mention that no hay benchmarks de MMLU/HumanEval porque no es un LLM generativo.

Comparativa: table comparing binned/progress/absolute heads on chat pool: MAE 843, 1074, 859; p90 2012, 2577, 2109; Spearman .716, .636, .709. Plus base pool: binned 1633, progress 2172, absolute 1743. And say no third-party comparables available.

Casos de uso (min 6):
1. Planificación SRPT en servidores de inferencia
2. Control de admisión (admission control) con el predictor BERT
3. Gestión de SLOs y timeouts
4. Batching y gestión de colas / continuous batching
5. Enrutado entre modelos / cascadas (route long reasoning to bigger model)
6. Autoscaling y planificación de capacidad
7. Estimación de coste por petición (tokens de salida → precio)
8. Planificación conformal con garantías (poset scheduling)

Let me write each with explanation.

Hardware:
- Las cabezas son ~2,9 M parámetros: inferencia en CPU o en la misma GPU del modelo base; coste despreciable frente a los 27B.
- Requieren acceso al estado oculto de la capa 30 durante la decodificación → integración con el motor de inferencia (gancho en vLLM), no un modelo autónomo.
- Qwen3.5-27B en fp16/bf16: ~54 GB de pesos → A100 80GB, H100 80GB, 2x A6000 48GB.
- Cuantizado 4-bit: ~14-16 GB → cabe en RTX 4090 24GB, L40S 48GB. Fuente secundaria (theaibench) indica 24 GB de VRAM o Mac de 48 GB+.
- Despliegue: vLLM 0.17.1 (usado para generar los datos), modo eager. Los pesos están en .pt → no hay GGUF/Ollama para las cabezas. El modelo base puede servirse con vLLM, TGI, SGLang, llama.cpp... (careful: llama.cpp GGUF for Qwen3.5-27B — I don't know. I'll say the base model can be served with engines like vLLM; the info only confirms vLLM).
- Latencia/throughput: no disponible. Mention overhead: a forward pass of a 2.9M MLP is negligible (<1% of a 27B decode step) — that's a reasonable inference but let me phrase as "el coste de un MLP de ~2,9 M de parámetros es despreciable frente a un paso de decodificación de un modelo de 27B" — reasonable, not a specific number claim.

Limitaciones:
- Cobertura solo en pasos de razonamiento; fase de respuesta OOD (12% ForeLen, 29-37% chat).
- Dependencia exacta del tensor out[0] antes del residual add en vLLM; no compatible con output_hidden_states de HF.
- No entrena con trazas que alcanzan el cap de 32768; sesgo hacia salidas más cortas.
- MAE en el orden de 800 a 2200 tokens; p90 de 2000 a 5300. Predicción gruesa, útil para ordenar, no para garantizar exactitud.
- Radios conformales con alpha=0,5: cobertura nominal del 50%, no garantías fuertes.
- base vs chat: las cabezas base degradan mucho si se entrenan sobre razonamiento con el objetivo de salida (absolute: 1743 → 2623 MAE). Elegir el pool adecuado.
- Idiomas: prompts de ForeLen/WildChat/LMSYS; no se declara cobertura multilingüe → riesgo de sesgo de dominio.
- Licencia no declarada: riesgo legal para uso comercial. Además, la licencia del modelo base no se indica en la información disponible.
- Repositorio con 0 descargas y 0 likes; sin validación de la comunidad.
- Fecha de creación 2026-09-30 — hmm not needed.

Enlaces: HF repo, datasets (abinzzz/ForeLen, allenai/WildChat-1M, lmsys/lmsys-chat-1m) — careful with exact org names. WildChat-1M is allenai/WildChat-1M. LMSYS-Chat-1M is lmsys/lmsys-chat-1m. These are standard; but "no inventes datos" — the card names the datasets "WildChat-1M" and "LMSYS-Chat-1M" and "abinzzz/ForeLen". I'll give abinzzz/ForeLen as URL and mention the other two by name with search on HF. Safer: link ForeLen directly, and mention the others without exact path... but links section should have links. I'll include https://huggingface.co/datasets/abinzzz/ForeLen and note the others as names. Actually I can give the search-safe links: https://huggingface.co/datasets/allenai/WildChat-1M and https://huggingface.co/datasets/lmsys/lmsys-chat-1m — these are well-known and likely correct. I'll include them but mark that the exact identificadores no se detallan en la model card. Hmm, better: list them as datasets referenced, with links to the HF search... I'll just include the well-known paths since they're standard. Risk is low but the rule says don't invent. The model card says "WildChat-1M and LMSYS-Chat-1M prompts" — the official repos are allenai/WildChat-1M and lmsys/lmsys-chat-1m. I'll include them and label as "referenciados en la model card".

Web links: the 5 URLs.

vLLM: https://github.com/vllm-project/vllm

Alright, writing final. Keep técnico.

One more: "no aplica" vs "no disponible" for parameters activos — the instruction says include "solo si es MoE". But it says include SIEMPRE these rows. I'll include and write "no aplica (no es MoE)".

Write it now.## Resumen

`dungnv/qwen35-27b-sched` no es un modelo de lenguaje generativo, sino un paquete de artefactos auxiliares para la planificación (scheduling) de cargas de inferencia sobre Qwen3.5-27B. Publicado por el usuario dungnv, contiene cabezas MLP diminutas que leen un estado oculto del decodificador de Qwen3.5-27B en cada paso de decodificación y predicen cuántos tokens de salida quedan por generar, junto con radios conformales por paso y un predictor BERT a nivel de prompt que estima la longitud de salida antes de que la petición empiece a decodificar.

El problema que aborda es la planificación dependiente de la longitud: en un servidor de inferencia, estimar cuánto va a durar cada petición permite aplicar políticas tipo SRPT (shortest remaining processing time) al estilo TRAIL, o planificación conformal por posets, en lugar de FIFO. Esto es especialmente relevante en modelos con modo de razonamiento, donde las trazas de pensamiento hacen que la longitud de salida sea muy variable y difícil de predecir a priori.

En cuanto al tamaño: cada cabeza es un MLP de unos 2,9 millones de parámetros (estimación derivada de la arquitectura declarada), mientras que el modelo base Qwen3.5-27B es, según fuentes secundarias, un transformer denso multimodal de 27 000 millones de parámetros con 64 capas de decodificador, atención lineal Gated DeltaNet y más de 256K tokens de contexto. El repositorio ocupa 0,6 GB, mayoritariamente datos JSONL de longitudes, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas MLP de tres capas (`mlp2`) sobre estados ocultos de Qwen3.5-27B, más un predictor BERT a nivel de prompt y radios conformales por paso |
| Parametros totales | ~2,93 M por cabeza `binned` y ~2,88 M por cabeza `progress`/`absolute` (estimación derivada de `Linear(5120,512) -> Linear(512,512) -> Linear(512,out)`). El modelo base Qwen3.5-27B tiene 27 000 M |
| Parametros activos | No aplica: las cabezas son MLP densas y el modelo base Qwen3.5-27B es denso, no MoE |
| Longitud de contexto | No aplica a las cabezas; su rango de predicción es de 0 a 32 768 tokens de salida. El modelo base ofrece más de 256K tokens de contexto según fuentes secundarias |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas de las cabezas. Los checkpoints son `.pt` y `.npz` |
| Idiomas soportados | No disponible; no se declara ningún idioma. Los prompts de entrenamiento proceden de ForeLen, WildChat-1M y LMSYS-Chat-1M |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pt` (state_dict con `mu`/`sigma` de estandarización) para las cabezas y el predictor BERT; `.npz` para los radios conformales; JSONL para los datos de longitudes |
| Tamano del repositorio | 0,6 GB |
| Dependencia de ejecucion | Qwen3.5-27B servido con vLLM 0.17.1 en modo eager, decodificación greedy, `max_tokens` 32768 |
| Capa de extraccion | Índice 30 (base 0) de 64 capas del decodificador; capa de atención lineal Gated DeltaNet |
| Nivel de miscoverage conformal | alpha = 0,5 |

## Arquitectura y entrenamiento

Las cabezas son MLPs de la forma `Linear(5120, 512) -> ReLU -> Dropout -> Linear(512, 512) -> ReLU -> Dropout -> Linear(512, out)`, con claves de state_dict `0.*`, `3.*` y `6.*`, y entradas estandarizadas mediante `mu` y `sigma` del checkpoint. Existen tres variantes según la salida: `binned`, con 80 logits sobre bins de 409,6 tokens en el rango 0-32768 y lectura `softmax(z) @ bin_mids` (TRAIL añade suavizado bayesiano entre pasos al servir); `progress`, con un logit tal que `p = sigmoid(z)` es la fracción de salida ya completada y la lectura es `t * (1 - p) / p`, con `p` recortado a [1e-3, 1] y el resultado a [0, 32766]; y `absolute`, con una salida `z ~ sqrt(restante)` y lectura `clamp(z, 0, 200) ** 2`. Hay dos familias de pesos: `base`, entrenada con prompts ForeLen, y `chat`, entrenada con prompts de WildChat y LMSYS-Chat.

Los datos se generaron sirviendo Qwen3.5-27B con vLLM 0.17.1 en modo eager, greedy (temperatura 0), con el modo de pensamiento activado y `max_tokens` 32768; las trazas que alcanzaron el límite se descartaron. La entrada es la capa 30 (base 0) de las 64 del decodificador, y en concreto el tensor `out[0]` de la capa del decodificador de vLLM: la salida del bloque antes de la suma residual (vLLM integra esa suma en el add-RMSNorm fusionado de la capa siguiente). No es el flujo residual que devuelve `output_hidden_states` de Hugging Face, por lo que reutilizar las cabezas exige capturar exactamente el mismo tensor. Se almacena una fila por petición y paso de decodificación (excluyendo el prefill), en fp16, con 200 pasos equiespaciados por traza para el entrenamiento, y solo los pasos anteriores a `</think>`. Los pools quedan así: base (ForeLen) con 10 744 trazas de entrenamiento, 2 687 de calibración y 2 870 de evaluación; chat (WildChat + LMSYS) con 14 975, 1 883 y 1 873 respectivamente, todos con particiones disjuntas por prompt.

## Capacidades

- Predicción de tokens restantes de salida durante la decodificación, a partir de un único estado oculto de la capa 30 de Qwen3.5-27B.
- Predicción de longitud total de salida a nivel de prompt (antes de decodificar) mediante un predictor BERT, pensado como clave de admisión.
- Estimación de la fracción de salida ya completada (cabeza `progress`), útil para políticas de prioridad basadas en progreso.
- Estimación de la longitud absoluta restante (cabeza `absolute`) y versión discretizada en 80 bins (cabeza `binned`).
- Cuantificación de incertidumbre mediante radios conformales por paso, calculados con split-conformal sobre la partición de calibración.
- Distinción entre longitud de razonamiento (hasta `</think>`) y longitud de salida completa; hay cabezas entrenadas para ambos objetivos.
- Generación de datos de referencia de longitudes greedy para 32 768 tokens, con metadatos de finalización (`stop` o `length`), posición de `</think>`, `think_closed` y longitud del prompt.
- No realiza generación de texto, tool calling, razonamiento ni visión: no es un modelo generativo.

## Casos de uso

- Planificación SRPT en servidores de inferencia: la cabeza `binned` alimenta políticas de tipo shortest-remaining-processing-time, de modo que el planificador reordena las peticiones en cada paso de decodificación según los tokens que quedan. Es el caso de uso principal declarado en la model card.
- Planificación conformal por posets: combinando la cabeza `progress` con los radios `.npz`, se pueden construir cotas de orden entre peticiones con una cobertura nominal controlada en lugar de comparar estimaciones puntuales.
- Control de admisión de peticiones: el predictor BERT a nivel de prompt proporciona la clave de admisión para peticiones que aún no han empezado a decodificar, permitiendo decidir si se aceptan, se encolan o se rechazan según la carga actual.
- Gestión de SLO y timeouts: con un MAE medido sobre conjuntos retenidos, se puede fijar un timeout adaptativo por petición en lugar de un valor fijo para todo el tráfico.
- Enrutado y cascadas entre modelos: si la predicción de longitud indica una salida muy larga, la petición puede desviarse a un modelo menor o a un modo sin razonamiento, reservando el modelo mayor para las peticiones cortas.
- Estimación de coste por petición: traducir la longitud estimada a tokens facturables permite presupuestar y facturar por consulta antes de ejecutarla.
- Dimensionado de capacidad y autoscaling: las series de longitudes en `sched_data/qwen35_27b/L30/` y los conjuntos de servicio `bench_wildchat` y `bench_lmsys` (1 000 prompts cada uno) permiten simular cargas realistas para calibrar el número de réplicas.
- Investigación en scheduling de LLM: los datos de longitudes greedy con particiones disjuntas por prompt sirven como referencia reproducible para comparar políticas de planificación.

## Benchmarks y rendimiento

Precisión en el conjunto retenido, por token y sobre todos los pasos de decodificación almacenados (solo pasos de razonamiento). MAE y p90 en tokens; objetivo = salida completa restante (`out_len - t`). Ambos conjuntos de cabezas se puntúan sobre ese objetivo:

| Pool | Cabeza | Entrenada sobre salida (MAE / p90 / Spearman) | Entrenada solo sobre razonamiento |
|---|---|---|---|
| base | binned | 1633 / 3860 / 0,796 | 1774 / 4293 / 0,801 |
| base | progress | 2172 / 5269 / 0,749 | 2253 / 5369 / 0,750 |
| base | absolute | 1743 / 4282 / 0,797 | 2623 / 6858 / 0,776 |
| chat | binned | 843 / 2012 / 0,716 | 1348 / 2925 / 0,514 |
| chat | progress | 1074 / 2577 / 0,636 | 1511 / 3190 / 0,530 |
| chat | absolute | 859 / 2109 / 0,709 | 1504 / 3183 / 0,542 |

Radios conformales: `q_by_step[t]` es el cuantil de muestra finita de `|restante real - predicho|` en el paso `t` para alpha = 0,5, ajustado sobre la partición de calibración. `M0` es el último paso con al menos 20 residuos y `q_t` se mantiene constante a partir de ahí. Mediana de `q_t` con cabezas `_outlen`: base progress 1579, base absolute 1147, chat progress 764, chat absolute 639.

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K en la información disponible, ya que el repositorio no contiene un modelo generativo.

## Requisitos de hardware

- Las cabezas son de ~2,9 M de parámetros: se ejecutan en CPU o en la misma GPU que el modelo base, compartiendo memoria y sin requisitos propios relevantes. El coste de un forward de ese tamaño es despreciable frente a un paso de decodificación de un modelo de 27B.
- El requisito real lo impone Qwen3.5-27B, que debe servirse con acceso al estado oculto de la capa 30. La model card solo documenta vLLM 0.17.1 en modo eager.
- En fp16/bf16, los 27 000 M de parámetros del modelo base ocupan del orden de 54 GB, lo que exige GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU de 48 GB (A6000, L40S).
- En cuantización de 4 bits el modelo base baja a aproximadamente 14-16 GB, por lo que cabe en una RTX 4090 de 24 GB. Una fuente secundaria (theaibench) recomienda 24 GB de VRAM o un Mac con 48 GB o más para el modelo denso multimodal.
- Opciones de despliegue: vLLM (versión usada en la generación de datos) para el modelo base más un gancho que capture el tensor de la capa 30. Los checkpoints `.pt`/`.npz` de las cabezas no tienen equivalentes GGUF, por lo que no son compatibles con llama.cpp u Ollama tal cual; el predictor BERT a nivel de prompt es un `.pt` independiente del motor.
- No se declaran cifras de latencia ni de throughput. Como referencia cualitativa, el overhead por paso es el de un MLP de tres capas sobre un vector de 5120 dimensiones.

## Comparativa con modelos similares

No se dispone de artefactos de predicción de longitud publicados comparables en la información proporcionada, por lo que la comparativa se limita a las variantes internas del propio repositorio, medidas sobre el conjunto retenido con objetivo de salida completa:

| Variante | Pool | MAE (tokens) | p90 (tokens) | Spearman | Mediana radio conformal |
|---|---|---|---|---|---|
| binned | chat | 843 | 2012 | 0,716 | No aplica (solo progress/absolute) |
| absolute | chat | 859 | 2109 | 0,709 | 639 |
| progress | chat | 1074 | 2577 | 0,636 | 764 |
| binned | base | 1633 | 3860 | 0,796 | No aplica |
| absolute | base | 1743 | 4282 | 0,797 | 1147 |
| progress | base | 2172 | 5269 | 0,749 | 1579 |

Como modelo base asociado, Qwen3.5-27B se sitúa, según fuentes secundarias, con capacidades globales comparables a las de Qwen3.5-122B-A10B, siendo la mayor variante densa (no MoE) de la línea media de Qwen 3.5. No hay datos de licencia ni de disponibilidad de pesos para ese modelo base en la información consultada.

## Limitaciones y advertencias

- Las cabezas nunca han visto estados de la fase de respuesta: solo se entrenaron con pasos anteriores a `</think>`. Esa fase supone el 12% de los pasos de decodificación en ForeLen y el 29-37% en los pools de chat, y las predicciones allí quedan fuera de distribución.
- La integración es frágil por diseño: hay que capturar el `out[0]` del bloque de la capa 30 antes de la suma residual, tal como lo expone vLLM 0.17.1. No sirve el flujo residual de `output_hidden_states` de Hugging Face, por lo que un cambio de motor o de versión puede invalidar las cabezas.
- Las trazas que alcanzaron el límite de 32 768 tokens se descartaron durante la generación de datos, lo que introduce un sesgo hacia salidas más cortas y deja sin cobertura el extremo superior de la distribución.
- La precisión es gruesa: MAE entre 843 y 2172 tokens y p90 entre 2012 y 5269 tokens en los conjuntos retenidos. Es adecuada para ordenar peticiones, no para garantizar una longitud exacta.
- Los radios conformales publicados usan alpha = 0,5, es decir, una cobertura nominal del 50%. No constituyen una garantía fuerte para planificación en producción.
- La elección de pool importa mucho: entrenar la cabeza `absolute` con el objetivo de salida completa y pasar al pool base dispara el MAE de 1743 a 2623 tokens, y la cabeza `binned` del pool chat pierde más de veinte puntos de Spearman si se entrena solo con razonamiento (0,716 a 0,514).
- Los prompts de entrenamiento provienen de ForeLen, WildChat-1M y LMSYS-Chat-1M; no se declara cobertura multilingüe ni evaluación fuera de esos dominios, por lo que el sesgo de dominio es un riesgo real.
- La licencia no está declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido. Tampoco se indica la licencia del modelo base en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y está creado el 30 de septiembre de 2026: es un artefacto sin validación externa por parte de la comunidad.
- La model card está truncada en la información disponible (la sección sobre WildChat y LMSYS-Chat queda cortada), por lo que pueden faltar detalles sobre el tratamiento de esos datos.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/dungnv/qwen35-27b-sched
- Dataset ForeLen (referenciado en la model card): https://huggingface.co/datasets/abinzzz/ForeLen
- Dataset WildChat-1M (referenciado en la model card): https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset LMSYS-Chat-1M (referenciado en la model card): https://huggingface.co/datasets/lmsys/lmsys-chat-1m
- vLLM, motor usado para generar los datos y dependencia para reutilizar las cabezas: https://github.com/vllm-project/vllm
- Guía de la serie Qwen3.5 (Flash, 27B, 35B-A3B, 122B-A10B): https://curateclick.com/blog/2026-qwen35-models-guide
- Ficha de Qwen 3.5 27B en The AI Bench: https://theaibench.ai/models/qwen-3-5-27b/
- Ficha de Qwen3.5-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.5-27b
- Análisis técnico de la serie Qwen3.5: https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- Especificaciones y requisitos de VRAM de Qwen3.5-27B: https://apxml.com/models/qwen35-27b
