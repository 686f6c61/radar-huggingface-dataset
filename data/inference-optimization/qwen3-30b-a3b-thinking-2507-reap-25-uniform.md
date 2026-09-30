# inference-optimization/Qwen3-30B-A3B-Thinking-2507-REAP-25-uniform

`.
- Thinking length incrementada: puede generar decenas de miles de tokens; el modelo base recomienda 81.920 tokens de salida para tareas complejas.
- Age: el checkpoint es de 2026-09-29 según HF (fecha de creación). Hmm, that's odd — future date. The task says created 2026-09-29. I'll just report it.
- Riesgo de alucinación.
- Licencia Apache 2.0 permite uso comercial; se hereda del modelo base Qwen. Note that the license link points to Qwen's LICENSE.
- Sesgos: heredados de los datos de Qwen3.
- Requiere transformers ≥4.51.0 para qwen3_moe.

Casos de uso (min 6):
1. Razonamiento matemático y científico offline (generación de pruebas formales, resolución de problemas de competición).
2. Agente de código en CI/CD.
3. Análisis de documentos largos (256K contexto): auditoría de contratos, revisión de repositorios completos.
4. Atención al cliente / soporte técnico con tool calling.
5. Generación de datos sintéticos de razonamiento (destilación) — hay que validar.
6. Despliegue en hardware limitado gracias al pruning (servicio autohospedado en 1-2 GPUs de 80GB).
7. Investigación sobre pruning de MoE: el modelo sirve como punto de comparación.
8. Análisis de logs y trazabilidad (TAU benchmarks).

Let me write 7-8 concrete cases.

Arquitectura y entrenamiento: 
- Transformer decoder-only con MoE en las capas FFN, 48 capas, GQA 32 Q / 4 KV heads, 128 expertos, top-8, RMSNorm, SwiGLU, RoPE, QK-Norm. Contexto nativo 262.144 tokens.
- Pretraining + post-training (fase thinking). RLHF/DPO: el informe técnico de Qwen3 describe un pipeline de 4 etapas (long-CoT cold start, RL de razonamiento, thinking mode fusion, RL general). I'm reasonably confident about Qwen3's post-training pipeline. I'll mention it as described in the Qwen3 technical report but hedge slightly.
- REAP pruning: no reentrenamiento anunciado; REAP incluye una fase de "healing" opcional. I'll mark as not confirmed.

Let me be careful: REAP the Rewards paper — it's from Cerebras, arXiv 2510.13999? I'm not sure. The tags don't include it. The tags include 2402.17463, 2407.02490, 2501.15383, 2404.06654, 2505.09388. I'll just list them as referencias arXiv incluidas en los tags, without claiming titles, except Qwen3 Technical Report = 2505.09388 which I'm fairly confident about. Hmm, should I claim it? The Qwen3 technical report is definitely arXiv:2505.09388 (titled "Qwen3 Technical Report"). Yes I'm confident. I'll mention it.

Actually, let me be safe and just list the arXiv IDs saying "identificadores arXiv declarados en los tags del repositorio" and only annotate 2505.09388 as Qwen3 Technical Report.

Hmm, 2404.06654 — I think that's "Mixture of Experts Explained"? no. Let me not.

Now the enlaces:
- HF: https://huggingface.co/inference-optimization/Qwen3-30B-A3B-Thinking-2507-REAP-25-uniform
- Base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- License: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507/blob/main/LICENSE
- Blog Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub: https://github.com/QwenLM/Qwen3
- Docs: https://qwen.readthedocs.io/en/latest/
- Chat: https://chat.qwen.ai/
- arXiv: https://arxiv.org/abs/2505.09388 and the others.

The web search results returned irrelevant stuff (Wikipedia definitions of inference), so no useful links there. I should note that search results were not relevant? The instruction says "todos los enlaces relevantes encontrados en la busqueda web". None were relevant. I'll just omit them or say that the web search did not return relevant results. I'll add a line.

Hmm, I'll include a note: "La busqueda web no devolvio resultados relevantes para este modelo (solo definiciones genericas del termino 'inferencia')." That's honest.

Now title capitalization: only first word capitalized in headings. E.g., "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Spanish from Spain, no emojis, no missing accents. Note: I should write without "tildes"? No — Spanish needs accents. Use proper accents.

Careful: the instruction says "Solo la primera palabra de los titulos va en mayuscula." So table headers too? Table headers like "Parametro | Valor" — those are prescribed by the prompt, so keep them as "Parametro | Valor". Other table headers: I'll use sentence case.

Let me now write.

Numbers formatting: Spanish uses comma for decimals and period for thousands. E.g., 23.281.219.584 parameters. 262.144 tokens. 3,3B. I'll follow Spanish convention.

Let me draft the specs table:

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas MoE (qwen3_moe), 48 capas |
| Parametros totales | 23.281.219.584 (23,28 B), segun safetensors del repositorio; el modelo base declara 30,5 B |
| Parametros activos | no disponible para esta version podada; el modelo base declara 3,3 B |
| Longitud de contexto | 262.144 tokens nativos (heredado del modelo base) |
| Tipos de cuantizacion | no disponible en este repositorio (solo safetensors en bf16); el modelo base dispone de cuantizaciones de terceros |
| Idiomas soportados | no disponible; el modelo base Qwen3 declara soporte multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Good.

Note: the repo size 46,6 GB ≈ 23,28B × 2 bytes = 46,56 GB, consistent with bf16.

Now, for "Parametros activos", I could note inference. I'll keep as above.

Let's write the benchmarks table. Columns: Benchmark | Qwen3-30B-A3B Thinking | Qwen3-30B-A3B-Thinking-2507 | Qwen3-235B-A22B Thinking. 

Values from the card:

Knowledge:
MMLU-Pro: 78.5 | 80.9 | 82.8
MMLU-Redux: 89.5 | 91.4 | 92.7
GPQA: 65.8 | 73.4 | 71.1
SuperGPQA: 51.8 | 56.8 | 60.7

Reasoning:
AIME25: 70.9 | 85.0 | 81.5
HMMT25: 49.8 | 71.4 | 62.5
LiveBench 20241125: 74.3 | 76.8 | 77.1

Coding:
LiveCodeBench v6: 57.4 | 66.0 | 55.7
CFEval: 1940 | 2044 | 2056
OJBench: 20.7 | 25.1 | 25.6

Alignment:
IFEval: 86.5 | 88.9 | 83.4
Arena-Hard v2: 36.3 | 56.0 | 61.5
Creative Writing v3: 79.1 | 84.4 | 84.6
WritingBench: 77.0 | 85.0 | 80.3

Agent:
BFCL-v3: 69.1 | 72.4 | 70.8
TAU1-Retail: 61.7 | 67.8 | 54.8
TAU1-Airline: 32.0 | 48.0 | 26.0
TAU2-Retail: 34.2 | 58.8 | 40.4
TAU2-Airline: 36.0 | 58.0 | 30.0
TAU2-Telecom: 22.8 | 26.3 | 21.9

Multilingualism:
MultiIF: 72.2 | 76.4 | 71.9
MMLU-ProX: 73.1 | 76.4 | 80.0
INCLUDE: 71.9 | 74.4 | 78.7
PolyMATH: 46.1 | 52.6 | 54.7

I'll include all — it's a rich table. Maybe trim TAU2-Telecom? Keep it.

Important caveat: these are the base model's numbers, not the pruned model's.

Hardware table maybe. The instruction says "Lista de viñetas" for hardware. I'll use bullets but could also add a small table. I'll use bullets as instructed, but a table is also "siempre que sea posible". I'll do a small table for VRAM estimates plus bullets. Hmm, instruction for that section says "Lista de viñetas con: ...". I'll follow with bullets primarily and maybe a table for VRAM. Let me do a table for VRAM estimates — it's clearer. Actually to respect the format instruction, I'll do bullets, and inside one bullet include a compact table. Hmm, mixing. I'll just do a table for the VRAM/latency and bullets for the rest. That seems reasonable and matches "usa tablas siempre que sea posible".

Let me write the VRAM table:

| Precision | Peso aproximado | VRAM minima estimada | GPUs de ejemplo |
|---|---|---|---|
| bf16/fp16 (nativa) | 46,6 GB | ~52-60 GB (con cache KV) | 1x H100 80 GB, 1x A100 80 GB, 2x RTX 4090 24 GB (TP=2) |
| fp8 | ~23,3 GB | ~28-32 GB | L40S 48 GB, A6000 48 GB, RTX 5090 32 GB |
| int4 (AWQ/GPTQ) | ~12-14 GB | ~16-20 GB | RTX 4090 24 GB, RTX 3090 24 GB |

Caveat: KV cache at 256K context is huge. Let me estimate KV cache: 48 layers × 4 KV heads × 128 head_dim × 2 (K,V) × 2 bytes = 48 × 4 × 128 × 2 × 2 = 98.304 bytes per token = ~96 KB/token. That's huge. At 32K tokens: ~3 GB. At 256K: ~24 GB. Hmm, head_dim for Qwen3-30B-A3B is 128. Let me verify: hidden 2048, Q heads 32 → head_dim = 2048/32 = 64? Hmm. If Q has 32 heads and hidden is 2048, head_dim = 64. But Qwen3 uses head_dim 128 for some models. For Qwen3-30B-A3B, I believe hidden_size=2048, num_attention_heads=32, num_key_value_heads=4, head_dim=128. Then Q proj output = 32×128 = 4096, not 2048. That's possible (Qwen2/3 use head_dim != hidden/num_heads). Yes, Qwen3-30B-A3B has head_dim=128. So KV cache per token = 2 (K,V) × 48 layers × 4 heads × 128 dim × 2 bytes = 98.304 bytes ≈ 96 KiB/token.

That's ~0,09 MB per token. At 262.144 tokens: 25,8 GB. Hmm, that's a lot but it's for a single sequence. I'll mention it as an estimate with the caveat "estimacion propia".

Hmm, am I confident enough about head_dim=128? The model card says "Number of Attention Heads (GQA): 32 for Q and 4 for KV". It doesn't give head_dim. I'd rather give the estimation with explicit assumptions, or just say "el cache KV a 262.144 tokens es muy elevado (decenas de GB)". Let me state it more cautiously: "El cache KV crece de forma lineal; a maxima longitud (262.144 tokens) puede superar los 20 GB en bf16 para una sola secuencia, por lo que se recomienda atencion con cache cuantizado o despliegue con paged attention." That's a reasonable estimate. I'll mark it as an estimate.

Actually, to be safe and rigorous, I'll say "estimacion aproximada" and note the assumption of 48 capas, 4 cabezas KV y head_dim 128.

Throughput: not available. vLLM/SGLang throughput not published.

Let me write it all now.

One more thing: "creado: 2026-09-29". That's a strange future date. I'll mention in the ficha? Maybe in the specs or limitations. Not necessary. I'll skip or mention in limitation (no hay histórico de adopción: 0 descargas, 1 like). Actually downloads: 0, likes: 1 — worth mentioning as caveat about maturity/validation. Yes, good for limitations.

Let me write the final markdown.

For the comparativa table:

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-30B-A3B-Thinking-2507-REAP-25-uniform (este) | 23,28 B / no disponible | 262.144 | Apache 2.0 | safetensors, transformers |
| Qwen3-30B-A3B-Thinking-2507 (base) | 30,5 B / 3,3 B | 262.144 | Apache 2.0 | safetensors, GGUF y cuantizaciones de terceros |
| Qwen3-235B-A22B-Thinking-2507 | 235 B / 22 B | 262.144 | Apache 2.0 | safetensors, requiere cluster multi-GPU |
| Qwen3-30B-A3B (Thinking, version original) | 30,5 B / 3,3 B | 32.768 (original) | Apache 2.0 | safetensors |

Hmm, Qwen3-30B-A3B original context is 32.768 natively (extensible to 131.072 with YaRN). The 2507 version is 262.144. I'm fairly confident. But to avoid inventing, maybe just leave "no disponible" or skip that row. I'll include it with the note as it's from the benchmark table indirectly... no, the benchmark table doesn't show context. I'll omit the fourth row and add a note.

Actually, the benchmarks table does include "Qwen3-30B-A3B Thinking" as a column, so comparing it is legitimate. I'll keep three rows: this model, base, and 235B. Plus a note about other REAP derivatives (no data).

Also could compare with a dense model of similar active-parameter budget: Qwen3-14B (dense, 14,8B). Hmm, in terms of activated params 3,3B vs 14,8B — no. Sparse MoE 30B-A3B is comparable to dense ~10-14B in quality. I'll mention Qwen3-14B briefly. But I'd need its numbers... I'll just mention in a note without numbers. Actually I'd rather not add unverifiable info. Let me add it as a text note: "En la misma franja de coste de inferencia se sitúan modelos densos de 8-14B (por ejemplo, Qwen3-14B), pero no se dispone de comparaciones publicadas frente a esta version podada." Fine, but Qwen3-14B is 14,8B params — that's a well-known fact. It's fine.

Alright. Also note the base model recommends output length 81.920 tokens for hard reasoning tasks.

Now let's be careful about the "thinking" behavior: model only supports thinking mode; default chat template includes `<think>` so output contains only `</think>`. This is from the model card. Good.

Write the ficha.

Length: comprehensive. Let's go.

One detail on licenses: apache-2.0 with license_link to Qwen's LICENSE. So commercial use allowed. But note the model is a derivative; the pruner's repo states apache-2.0.

Let me now produce the final answer.## Resumen

Este repositorio publica una version podada del modelo Qwen3-30B-A3B-Thinking-2507, un transformer decoder-only con arquitectura de mezcla de expertos (MoE) desarrollado originalmente por el equipo Qwen de Alibaba. La poda la firma el usuario inference-optimization y sigue la metodologia REAP (Router-weighted Expert Activation Pruning), que elimina expertos del bloque MoE en funcion de su contribucion media ponderada por la puerta del router sobre un conjunto de calibracion. El sufijo "25-uniform" indica una poda del 25% aplicada de forma uniforme en todas las capas MoE, sin asignacion adaptativa de presupuesto por capa.

El impacto en tamano es medible: el checkpoint del modelo base declara 30,5B parametros totales, mientras que los safetensors de este repositorio suman 23.281.219.584 parametros (23,28B), lo que supone una reduccion del 23,7% en peso total. El repositorio ocupa 46,6 GB, coherente con un almacenamiento en bf16 del recuento de parametros anterior. Con 48 capas, atencion con GQA (32 cabezas de consulta y 4 de clave/valor) y un contexto nativo de 262.144 tokens, el modelo conserva intactas las capacidades de contexto largo del original.

Es relevante ahora porque permite servir un modelo de razonamiento de la familia Qwen3 en hardware mas ajustado que el modelo base, manteniendo el modo thinking obligatorio y el soporte de tool calling heredados. La contrapartida es que no hay evaluacion publicada de la version podada: la model card es una copia literal de la del modelo base y no aporta numeros de calidad tras el pruning, por lo que su rendimiento real debe validarse caso por caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas FFN de mezcla de expertos (arquitectura `qwen3_moe`), 48 capas |
| Parametros totales | 23.281.219.584 (23,28 B) segun los safetensors del repositorio; el modelo base declara 30,5 B |
| Parametros activos | no disponible para esta version podada; el modelo base declara 3,3 B activados |
| Longitud de contexto | 262.144 tokens nativos (heredado del modelo base) |
| Tipos de cuantizacion | no disponible en este repositorio (solo pesos safetensors en bf16); el modelo base cuenta con cuantizaciones GGUF, AWQ y GPTQ de terceros |
| Idiomas soportados | no disponible en la ficha; el modelo base Qwen3 se presenta como multilingue (los benchmarks del modelo base incluyen MultiIF, MMLU-ProX, INCLUDE y PolyMATH) |
| Licencia | Apache 2.0 (con enlace a la licencia del modelo base Qwen) |
| Formato de pesos | safetensors (compatible con `transformers`, pipeline `text-generation`) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3-30B-A3B-Thinking-2507: un transformer causal de 48 capas en el que las capas de feed-forward se sustituyen por bloques MoE con 128 expertos y activacion de los 8 mas relevantes por token, ademas de atencion con Grouped Query Attention (32 cabezas Q y 4 cabezas KV). El modelo base se distribuye en dos etapas, preentrenamiento y postentrenamiento, e incorpora razonamiento explicito obligatorio: no admite modo sin thinking y su plantilla de chat inyecta automaticamente la etiqueta de apertura, de modo que la salida solo muestra la etiqueta de cierre de la cadena de razonamiento. El contexto nativo declarado es de 262.144 tokens.

Sobre este checkpoint, el proceso REAP calcula una puntuacion de saliencia por experto combinando el valor de la compuerta del router con la norma de la salida del experto, promedia esa puntuacion sobre un conjunto de calibracion y elimina los expertos menos relevantes. La variante "uniform" reparte el 25% de poda por igual entre todas las capas, lo que implica pasar de 128 a 96 expertos por capa si se aplica el porcentaje sobre el numero de expertos. No hay constancia en la informacion disponible de que se haya reducido el numero de expertos activados (el modelo base activa 8), ni de que se haya aplicado una fase de recuperacion o "healing" posterior a la poda; tampoco se documentan los tokens o el dataset de calibracion empleados. Los identificadores arXiv incluidos en las etiquetas del repositorio (2402.17463, 2407.02490, 2501.15383, 2404.06654 y 2505.09388, este ultimo correspondiente al informe tecnico de Qwen3) apuntan a las referencias metodologicas del trabajo, pero la ficha no explicita cual se asocia a la tecnica de poda.

## Capacidades

- Generacion de texto y razonamiento en modo thinking obligatorio: el modelo produce siempre una cadena de razonamiento antes de la respuesta final.
- Razonamiento matematico y cientifico de alta complejidad: el modelo base destaca en AIME25, HMMT25 y PolyMATH, y el autor recomienda esta version para tareas de razonamiento muy exigentes.
- Generacion y comprension de codigo, incluyendo problemas de jueces en linea (OJBench) y competiciones (LiveCodeBench v6, CFEval sobre el modelo base).
- Tool calling y function calling, con soporte de agentes multi-paso: los benchmarks BFCL-v3 y TAU1/TAU2 del modelo base miden explicitamente estas capacidades.
- Comprension de contexto largo: ventana nativa de 262.144 tokens, adecuada para documentos extensos o repositorios completos.
- Capacidades multilingues heredadas del modelo base, evaluadas en MMLU-ProX, MultiIF e INCLUDE.
- Capacidades de instruccion y escritura: IFEval, Arena-Hard v2, Creative Writing v3 y WritingBench en el modelo base.
- No se documentan capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Razonamiento matematico y cientifico autohospedado: el modo thinking obligatorio y la ventana de 262.144 tokens permiten resolver problemas de competicion o demostraciones largas en una unica pasada, con la cadena de razonamiento disponible para auditoria.
- Agente de codigo en pipelines de CI/CD: gracias al soporte de tool calling heredado, el modelo puede invocarse como agente que lee el repositorio, ejecuta herramientas y propone parches, con la ventaja de requerir menos VRAM que el modelo base.
- Atencion al cliente automatizada con herramientas: los resultados del modelo base en TAU1-Retail y TAU2-Retail sugieren que puede gestionar conversaciones multi-turno con acceso a sistemas de pedidos o reservas mediante function calling.
- Analisis de documentos extensos y auditoria contractual: la ventana nativa de 262.144 tokens permite procesar contratos, expedientes o informes completos sin fragmentacion agresiva.
- Generacion de datos sinteticos de razonamiento: util para destilar cadenas de pensamiento de alta calidad hacia modelos menores, con la advertencia de que deben validarse porque no hay evaluacion publicada de la version podada.
- Despliegue en hardware con restricciones de memoria: al ocupar 46,6 GB en bf16 frente a los mas de 60 GB del modelo base, cabe en una unica GPU de 80 GB o en configuraciones de 2x24 GB con paralelismo tensorial, y en torno a 12-14 GB si se cuantiza a 4 bits.
- Investigacion sobre poda de MoE: sirve como punto de comparacion empirico frente al modelo base y frente a otras ratios de poda, midiendo la degradacion real por tarea.
- Analisis de trazas y logs de sistemas: clasificacion y resumen de grandes volumenes de texto tecnico aprovechando el contexto largo.

## Benchmarks y rendimiento

Los unicos datos disponibles en la informacion proporcionada corresponden al **modelo base** Qwen3-30B-A3B-Thinking-2507, no a la version podada de este repositorio. Se reproducen a continuacion con esa salvedad explicita: no debe asumirse que la version con 25% de expertos eliminados mantiene estos valores.

| Benchmark | Qwen3-30B-A3B Thinking | Qwen3-30B-A3B-Thinking-2507 (base) | Qwen3-235B-A22B Thinking |
|---|---|---|---|
| MMLU-Pro | 78,5 | 80,9 | 82,8 |
| MMLU-Redux | 89,5 | 91,4 | 92,7 |
| GPQA | 65,8 | 73,4 | 71,1 |
| SuperGPQA | 51,8 | 56,8 | 60,7 |
| AIME25 | 70,9 | 85,0 | 81,5 |
| HMMT25 | 49,8 | 71,4 | 62,5 |
| LiveBench 20241125 | 74,3 | 76,8 | 77,1 |
| LiveCodeBench v6 (25.02-25.05) | 57,4 | 66,0 | 55,7 |
| CFEval | 1940 | 2044 | 2056 |
| OJBench | 20,7 | 25,1 | 25,6 |
| IFEval | 86,5 | 88,9 | 83,4 |
| Arena-Hard v2 | 36,3 | 56,0 | 61,5 |
| Creative Writing v3 | 79,1 | 84,4 | 84,6 |
| WritingBench | 77,0 | 85,0 | 80,3 |
| BFCL-v3 | 69,1 | 72,4 | 70,8 |
| TAU1-Retail | 61,7 | 67,8 | 54,8 |
| TAU1-Airline | 32,0 | 48,0 | 26,0 |
| TAU2-Retail | 34,2 | 58,8 | 40,4 |
| TAU2-Airline | 36,0 | 58,0 | 30,0 |
| TAU2-Telecom | 22,8 | 26,3 | 21,9 |
| MultiIF | 72,2 | 76,4 | 71,9 |
| MMLU-ProX | 73,1 | 76,4 | 80,0 |
| INCLUDE | 71,9 | 74,4 | 78,7 |
| PolyMATH | 46,1 | 52,6 | 54,7 |

Notas de la tabla original: Arena-Hard v2 se reporta como win rate evaluado con GPT-4.1; en las tareas mas exigentes (PolyMATH y todas las de razonamiento y codigo) se empleo una longitud de salida de 81.920 tokens, y en el resto, de 32.768 tokens.

Para la version REAP-25-uniform no se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parametros (23,28B) y del tamano del repositorio (46,6 GB). No hay mediciones de latencia o throughput publicadas para esta version.

| Precision | Peso de los pesos | VRAM minima estimada | GPUs de ejemplo |
|---|---|---|---|
| bf16/fp16 (nativa) | 46,6 GB | 52-64 GB (mas cache KV) | 1x H100 80 GB, 1x A100 80 GB, 2x RTX 4090 24 GB con TP=2 |
| fp8 | ~23-24 GB | 28-34 GB | L40S 48 GB, RTX A6000 48 GB, RTX 5090 32 GB |
| int4 (AWQ/GPTQ) | ~12-14 GB | 16-20 GB | RTX 4090 24 GB, RTX 3090 24 GB |

- Si cabe en GPU de consumo: en bf16 no cabe en una GPU de 24 GB; en 4 bits es viable en RTX 4090, RTX 3090 y RTX 5090, siempre con cuantizacion generada por terceros (este repositorio no la incluye).
- El cache KV es el factor limitante en contexto largo: con 48 capas y 4 cabezas KV, crece de forma lineal con la longitud de secuencia y puede superar los 20 GB en bf16 para una unica secuencia de 262.144 tokens (estimacion propia bajo la hipotesis de head_dim 128). Se recomienda paged attention, cuantizacion del cache KV o despliegue con paralelismo.
- Opciones de despliegue: `transformers` (version 4.51.0 o superior, necesario para `qwen3_moe`), vLLM 0.8.5 o superior y SGLang 0.4.6.post1 o superior, ambos con endpoint compatible con la API de OpenAI y separacion del bloque de razonamiento mediante parser. llama.cpp y Ollama requeririan una conversion a GGUF que no se proporciona en este repositorio.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el modelo activa muchos menos parametros por token que un modelo denso de 23B, por lo que el coste de computo por token es inferior al que sugiere el recuento total.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto nativo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-30B-A3B-Thinking-2507-REAP-25-uniform (este) | 23,28 B / no disponible | 262.144 | Apache 2.0 | safetensors para `transformers` |
| Qwen3-30B-A3B-Thinking-2507 (base sin podar) | 30,5 B / 3,3 B | 262.144 | Apache 2.0 | safetensors, cuantizaciones de terceros (GGUF, AWQ, GPTQ) |
| Qwen3-235B-A22B Thinking | 235 B / 22 B | no disponible | Apache 2.0 | safetensors, requiere despliegue multi-GPU |

- Frente al modelo base, la ventaja es el menor consumo de memoria (46,6 GB frente a mas de 60 GB en bf16) y la desventaja es la ausencia de evaluacion publicada de calidad tras la poda.
- Frente a Qwen3-235B-A22B Thinking, el modelo podado es desplegable en una sola GPU de 80 GB, con un coste de calidad esperado inferior.
- En la misma franja de coste de inferencia se situan modelos densos de 8-14B, pero no hay comparaciones publicadas frente a esta variante podada.
- Existen otras variantes de poda REAP de la familia Qwen3 publicadas por terceros, pero no se dispone de identificadores ni datos verificables en la informacion consultada.

## Limitaciones y advertencias

- No existe model card propia: el README reproduce literalmente la documentacion del modelo base y no describe el proceso de poda, el dataset de calibracion ni los resultados obtenidos.
- No hay benchmarks de la version podada. Eliminar el 25% de los expertos de forma uniforme suele degradar antes las tareas de razonamiento largo y matematicas que las de conversacion general, pero no hay mediciones que lo confirmen o cuantifiquen.
- El modo thinking es obligatorio y no puede desactivarse, lo que incrementa notablemente el numero de tokens generados, la latencia y el coste por consulta en produccion. El autor del modelo base recomienda hasta 81.920 tokens de salida en tareas complejas.
- Riesgo de alucinacion inherente a los modelos de razonamiento: la cadena de pensamiento puede contener pasos plausibles pero incorrectos que conduzcan a una respuesta erronea; conviene validar las salidas en dominios criticos.
- Sesgos heredados de los datos de preentrenamiento y postentrenamiento de Qwen3, no reevaluados tras la poda.
- El repositorio no incluye cuantizaciones oficiales; cualquier version en 4 u 8 bits procedera de terceros y anadira su propia perdida de calidad sobre la ya introducida por la poda.
- Limitaciones de idioma no documentadas: la ficha no declara la lista de idiomas soportados y no se han medido las capacidades multilingues tras el pruning.
- Madurez y validacion: el repositorio registra 0 descargas y 1 like en el momento de la consulta, sin historial de uso en produccion ni evaluaciones independientes.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre conservando los avisos de licencia. Al ser un derivado del modelo base Qwen, se recomienda revisar tambien la licencia original enlazada.
- Requiere `transformers` 4.51.0 o superior; con versiones anteriores se produce un `KeyError: 'qwen3_moe'`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/inference-optimization/Qwen3-30B-A3B-Thinking-2507-REAP-25-uniform
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Qwen Chat: https://chat.qwen.ai/
- Informe tecnico de Qwen3 (identificador arXiv presente en las etiquetas): https://arxiv.org/abs/2505.09388
- Otros identificadores arXiv declarados en las etiquetas del repositorio: https://arxiv.org/abs/2402.17463 , https://arxiv.org/abs/2407.02490 , https://arxiv.org/abs/2501.15383 , https://arxiv.org/abs/2404.06654
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: unicamente definiciones genericas del termino "inferencia" en diccionarios y enciclopedias.
