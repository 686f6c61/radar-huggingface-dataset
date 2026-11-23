# JackHsieh/4B-base.4B-gpnp-rl-step1472-kv-tags-thought-thoughts.iid-80M-full.stride-1.suffix-conditional

## Resumen

Este modelo es un ajuste por preentrenamiento continuado (continued pre-training, CPT) del modelo base Qwen/Qwen3-4B-Base, desarrollado por el usuario JackHsieh. El objetivo no es tanto ofrecer un asistente generalista como investigar una técnica concreta: inyectar un "pensamiento" (thought) prepuesto en cada fragmento de documento durante el entrenamiento, de modo que el modelo aprenda a condicionar la generación de texto sobre una nota previa que describe los próximos tokens. Es, por tanto, un artefacto de investigación sobre chain-of-thought aplicado al modelado de lenguaje, no un modelo listo para producto.

El modelo tiene 4.022.468.096 parámetros, hereda la arquitectura de Qwen3-4B-Base y se ha entrenado sobre texto LaTeX de arXiv del área stat.ML, con un 25% de replay de DCLM. Los pesos se exportan como copia maestra en fp32 sin casting, en formato safetensors, bajo licencia Apache 2.0. El repositorio ocupa 16,1 GB.

Su relevancia es metodológica: la model card documenta con detalle la receta (segunda ronda de una cadena de CPT de 80M, generador de pensamientos obtenido por RL con el modelo de la primera ronda como rewarder) y publica métricas de evaluación comparando la pasada "thoughtful" frente a la "thoughtless". Las ganancias son modestas pero medibles, lo que lo convierte en una referencia útil para quien investigue condicionamiento por notas o prefill de razonamiento en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Base); no se detalla en la informacion disponible mas alla del modelo base |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Base soporta contexto largo, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles (entrenado sobre LaTeX de arXiv stat.ML, predominantemente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (copia maestra fp32 exportada sin casting) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base y aplica una segunda ronda de preentrenamiento continuado sobre el dataset JackHsieh/statML-arxiv-iid-160M-20M, concretamente sobre `train[:19456]` (19.456 documentos de 4.096 tokens), con un 25% de replay procedente de JackHsieh/dclm-replay.seq-4096.tokens-32B. La innovación central es la inyección de pensamientos: cada fragmento de 8 tokens de cada documento lleva antepuesto un bloque `<|note|>\nKEY:{los 8 tokens anteriores}\nTHOUGHT:{nota}\n<|/note|>`, donde la nota describe los próximos 8 tokens. Se usa stride 1 (r_train = 511/512), de modo que todos los fragmentos no iniciales son "thoughtful". Los pensamientos provienen de un generador entrenado con RL durante 1.472 pasos, cuyo rewarder fue el modelo de la primera ronda de la cadena.

La optimización emplea AdamW con lr 7e-6 (β 0.9/0.95, ε 1e-8, weight decay 0.01), schedule coseno con 5% de warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 épocas (1.622 pasos) y semilla 0. El entrenamiento se realizó con FSDP2 full-shard, pesos maestros en fp32 y cómputo en bf16, con flash-attention-2 sobre 8×H200, repartido en múltiples asignaciones Slurm interrumpidas y reanudadas desde el último checkpoint. Se añadieron dos tokens especiales: `<|note|>` = 151669 y `<|/note|>` = 151670, inicializados con gaussian-diag e incluidos en el tokenizer del repositorio en ese orden.

## Capacidades

- Modelado de lenguaje causal sobre texto técnico y científico, en particular LaTeX de arXiv del área stat.ML.
- Condicionamiento por notas prepuestas: el modelo puede generar texto dado un bloque `<|note|>` con una clave de contexto y un pensamiento, así como producir la nota a partir del contexto.
- Razonamiento encadenado en formato textual (chain-of-thought) aprendido por preentrenamiento continuado, no por instrucción.
- Generación condicionada por sufijo: entrenado para que cada fragmento de 8 tokens no inicial lleve su propio pensamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del formato de nota.
- Capacidades multilingües: no disponibles; el corpus de entrenamiento es fundamentalmente en inglés.
- No se documenta visión, audio ni modo "thinking" activable por prompt.

## Casos de uso

- Investigación en preentrenamiento continuado: sirve como punto de partida reproducible para estudiar el efecto de anteponer notas de contexto en el modelado de lenguaje, con receta e hiperparámetros documentados.
- Evaluación de condicionamiento por prefill: permite comparar la perplejidad de la pasada "thoughtful" frente a la "thoughtless" sobre el mismo corpus, usando la métrica NLL por token publicada.
- Experimentos de destilación de razonamiento: el pipeline (generador RL + rewarder + CPT) puede replicarse sobre otros dominios para inyectar trazas de razonamiento en modelos de 4B.
- Generación asistida de documentación técnica en LaTeX: el modelo ha visto exclusivamente texto stat.ML de arXiv y puede emplearse para completar fragmentos de artículos, siempre con revisión humana.
- Base para ajuste fino supervisado posterior: al ser un checkpoint de CPT sobre Qwen3-4B-Base, puede servir de inicialización para tareas downstream que se beneficien del formato de notas.
- Estudio de tokens especiales: útil para analizar cómo afecta la adición de `<|note|>` y `<|/note|>` con inicialización gaussian-diag al comportamiento del tokenizer y del modelo.

## Benchmarks y rendimiento

| Metrica | Este modelo (step 1622) | Primera ronda (step 1600) |
|---|---|---|
| NLL/token pasada thoughtful sobre fragmentos thoughtful | 1.2138 | 1.2171 |
| NLL/token pasada thoughtless sobre fragmentos thoughtful | 1.2207 | 1.2201 |
| Win rate thoughtful vs thoughtless | 54,3% | 52,5% |
| NLL hibrida todos los fragmentos | 1.2411 | 1.2405 |

Evaluación sobre la rejilla de test iid stride-32 (r_val = 15/512). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en bf16 rondaría 8 GB de pesos.
- GPU recomendadas para el entrenamiento documentado: 8×H200 con FSDP2 y flash-attention-2.
- Para inferencia, una GPU con 24 GB (RTX 4090, A10G, L4 de 24 GB) es suficiente en bf16 para pesos; en fp32 haría falta al menos 24-32 GB.
- Cabe en GPU de consumo: sí, en bf16 sobre RTX 4090 (24 GB) o RTX 3090 (24 GB); en fp32 es ajustado y puede requerir offload.
- Opciones de despliegue: transformers con safetensors; vLLM y TGI son viables si se confirma compatibilidad con los tokens añadidos; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (JackHsieh, CPT sobre Qwen3-4B-Base) | 4,02B | no disponible | Apache 2.0 | CPT con notas prepuestas sobre stat.ML arXiv |
| Qwen/Qwen3-4B-Base | ~4B | no disponible en esta ficha | Apache 2.0 | Modelo base generalista |
| Primera ronda de la cadena (JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-80M-sans-256.stride-1.suffix-conditional) | ~4B | no disponible | Apache 2.0 | Misma receta, pensamientos de Qwen3-4B stock y `train[:19200]` |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría más allá de las métricas internas de la cadena.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucción ni por preferencias humanas (sin RLHF/DPO documentado), por lo que no debe usarse como asistente conversacional sin ajuste posterior.
- Dominio muy restringido: entrenado sobre LaTeX de arXiv stat.ML; el rendimiento fuera de ese dominio no está caracterizado y probablemente sea pobre.
- Idiomas: no se documenta soporte multilingüe; el corpus es fundamentalmente en inglés.
- Riesgo de alucinación: al ser un modelo de modelado de lenguaje sin alineación, puede generar contenido plausible pero incorrecto, especialmente en afirmaciones matemáticas o referencias bibliográficas.
- Sesgos: no documentados por el autor; al derivar de Qwen3-4B-Base y de un corpus académico, hereda los sesgos del modelo base y del subconjunto de arXiv.
- Dependencia de tokens especiales: el uso correcto requiere el tokenizer del repositorio con `<|note|>` y `<|/note|>` en las posiciones 151669 y 151670; un tokenizer distinto rompería el condicionamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación estándar y de garantías de calidad desaconseja su uso en producción sin validación propia.
- Métricas de ganancia modestas (win rate 54,3%, diferencia de NLL de 0,0069): la ventaja del condicionamiento por notas es pequeña y debe interpretarse con cautela.
- El repositorio contiene pesos en fp32 (16,1 GB), lo que encarece el almacenamiento y la transferencia frente a una exportación en bf16.

## Enlaces

- Hugging Face: https://huggingface.co/JackHsieh/4B-base.4B-gpnp-rl-step1472-kv-tags-thought-thoughts.iid-80M-full.stride-1.suffix-conditional
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Primera ronda de la cadena: https://huggingface.co/JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-80M-sans-256.stride-1.suffix-conditional
- Generador de pensamientos (RL): https://huggingface.co/JackHsieh/Qwen3-4B.gpnp-rl.consumer-4B-base-gpnp-kvtt-iid80M-sans256.heldout256.lr3e-7-kl0.step-1472
- Dataset de pensamientos: https://huggingface.co/datasets/JackHsieh/4B-gpnp-rl-80M-step1472.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/lbc1gn9c
