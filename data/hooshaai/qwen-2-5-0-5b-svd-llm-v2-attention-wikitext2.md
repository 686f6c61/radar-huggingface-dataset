# Hooshaai/qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai (con referencias en la model card al repositorio NeuralOps de tahamajs) que parte de `Qwen/Qwen2.5-0.5B` y sustituye quirúrgicamente parte de sus capas de atención por un módulo denominado `svd_llm_v2_attention`, basado en factorización SVD con adaptadores LoRA de recuperación. No es un modelo nuevo entrenado desde cero, sino un experimento de arquitectura de atención dentro del denominado "Attention Zoo" de NeuralOps: se reemplazan 18 de las 24 capas de atención del decoder por el módulo subcuadrático y se conservan 6 capas con atención cuadrática completa como anclas.

El objetivo declarado es evaluar si una atención factorizada vía SVD puede recuperar comportamiento funcional tras una cirugía agresiva de pesos mediante destilación de conocimiento en dos etapas sobre WikiText-2. El resultado es un modelo de 0,5 mil millones de parámetros con un perplexity de validación de 185,32 en `wikitext-2-raw-v1`, un valor muy alto en términos absolutos que refleja que el checkpoint está pensado como artefacto de investigación sobre topologías de atención, no como modelo listo para producción.

La relevancia actual es acotada pero clara para investigadores: documenta de forma transparente el proceso de sustitución de atención (patrón `hybrid_3_1`), las métricas de telemetría de destilación (PPL pre-KD de 242621,87 frente a 185,32 post-KD) y el coste computacional del proceso (393 pasos, 180,4 segundos, 18 GB de VRAM pico). Todo el código y los pesos se distribuyen bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `svd_llm_v2_attention` (SVD factorizada + LoRA) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se declara en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 89,03 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (`head_dim=64`), es decir, GQA con ratio 7:1. Sobre esa base se aplica una "cirugía" que sustituye las proyecciones de atención de 18 capas por el módulo `SVDLLMV2Attention`, que mantiene buffers explícitos U, Sigma y V^H y adaptadores LoRA entrenables para recuperar capacidad. Las 6 capas restantes (índices 3, 7, 11, 15, 19 y 23) conservan atención cuadrática completa como anclas, configurando el patrón `hybrid_3_1`. El adaptador `QwenAttentionAdapter` gestiona la expansión 7x de cabezas KV y el contrato de `o_proj` único.

El entrenamiento consiste en destilación de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) ejecuta 120 pasos con pérdida MSE y coseno a nivel de capa oculta (peso 0,25), con `lm_head` desactivado. La etapa 2 (destilación multi-capa) ejecuta 273 pasos con MSE y coseno a nivel de capa (peso 0,50). En total, 393 pasos en 180,4 segundos con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 18.045 MB de VRAM pico en FP16 con parámetros maestros en FP32. La innovación técnica principal es la propia sustitución SVD-factorizada de la atención con recuperación LoRA y el esquema de destilación por capas.

## Capacidades

- Generación de texto autoregresiva causal (tarea declarada: Causal Language Modeling).
- Soporte de atención bidireccional y cross-attention a nivel de módulo (`supports_bidirectional=Yes`, `supports_cross_attention=Yes`), aunque el checkpoint se evalúa en modo causal.
- Soporte nativo de GQA en el módulo de atención sustituido.
- Compatibilidad con RoPE: no aplica al módulo SVD (`supports_rope=N/A`), pero el modelo base Qwen2.5 sí usa RoPE en las capas conservadas.
- Capacidades conversacionales heredadas de Qwen2.5-0.5B (el pipeline declarado es `text-generation` y los tags incluyen `conversational`).
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada al inglés según los metadatos del repositorio.

## Casos de uso

- Investigación en arquitecturas de atención eficiente: el checkpoint permite reproducir el experimento de sustitución SVD y medir el impacto en perplexity frente al modelo base, sirviendo como referencia para comparar topologías de atención alternativas.
- Estudio de destilación de conocimiento post-cirugía: los datos de telemetría (PPL pre-KD 242621,87 frente a post-KD 185,32, 393 pasos, 180,4 s) permiten analizar la eficacia de la destilación por capas con MSE y coseno en modelos pequeños.
- Benchmarking de módulos de atención en el Attention Zoo: útil para validar `SVDLLMV2Attention` frente a otros módulos del registro `ATTENTION_REGISTRY` sobre un dataset estándar como WikiText-2.
- Prototipado de pipelines de inferencia con `neuralops.hub.load_surgeried_model`: sirve para probar la API universal de carga de modelos con pesos quirúrgicos antes de aplicarla a modelos mayores.
- Docencia y divulgación sobre GQA y factorización SVD: el modelo ilustra de forma concreta la expansión 7x de cabezas KV y la sustitución de proyecciones con adaptadores LoRA.
- Validación de infraestructura de entrenamiento: el registro de VRAM pico (18 GB) y tiempos (180 s) es útil para dimensionar experimentos similares en GPUs de gama alta.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el `model-index` (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity | 185,32 |

Telemetria de entrenamiento declarada por el autor:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (pre-KD, post-cirugia) | Perplexity causal | 242621,87 |
| Stage 1 (alineacion, backbone congelado) | Pasos / tiempo | 120 / 54,5 s |
| Stage 2 (destilacion multi-capa) | Pasos / tiempo | 273 / 125,5 s |
| Total | Pasos / tiempo | 393 / 180,4 s |
| Delta de perplexity | Mejora | -242436,55 |
| VRAM pico | FP16 autocast + FP32 master | 18.045 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,5B parámetros; en FP16 ocupa aproximadamente 1 GB de pesos, y en FP32 unos 2 GB. El proceso de entrenamiento documentado requirió 18 GB de VRAM pico, pero eso corresponde al entrenamiento con autocast FP16 y maestros FP32, no a inferencia.
- GPU recomendadas para entrenamiento/reproducción: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para reproducir la cirugía y la destilación con `seq_len=512` y `grad_accum=4`.
- GPU para inferencia: cabe holgadamente en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores; también en Apple Silicon vía MPS.
- Opciones de despliegue: no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI. La carga documentada es vía `neuralops.hub.load_surgeried_model` o mediante `transformers` + `apply_qwen_attention_surgery` + `safetensors`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2 | 0,5B | no disponible | 185,32 (declarado) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible en la informacion | no disponible | Apache 2.0 (habitual en Qwen2.5) | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la informacion | no disponible | Apache 2.0 (habitual en Qwen2.5) | Hugging Face |

No se dispone de datos de perplexity del modelo base ni de otros módulos del Attention Zoo en la información proporcionada, por lo que la comparación cuantitativa directa no es posible.

## Limitaciones y advertencias

- Perplexity de 185,32 en WikiText-2: valor muy elevado en términos absolutos, indicativo de que el checkpoint no está pensado para uso generativo de calidad, sino como artefacto de investigación.
- Entrenado exclusivamente sobre WikiText-2 en inglés: dominio y idioma muy restringidos; el rendimiento fuera de ese corpus es desconocido y probablemente deficiente.
- Idiomas soportados: solo inglés según los metadatos; no se declara soporte multilingüe.
- Riesgo elevado de alucinación y generación incoherente dado el estado del checkpoint tras la cirugía y la destilación parcial.
- La cirugía requiere código externo (`apply_qwen_attention_surgery` del repositorio NeuralOps) y `load_state_dict(..., strict=False)`, lo que implica que parte de los pesos no se cargan de forma estricta; posibles discrepancias silenciosas.
- El módulo SVD no soporta RoPE (`supports_rope=N/A`), lo que puede afectar a la coherencia posicional en las capas sustituidas.
- Los benchmarks están marcados como `verified: false`; no han sido reproducidos de forma independiente.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (habitualmente Apache 2.0) que debe respetarse en la redistribución.
- No se declaran capacidades de tool calling, agentes ni instrucciones; no apto para despliegues conversacionales en producción sin evaluación adicional.
- El repositorio tiene 0 likes y 296 descargas, y la model card referencia un repo distinto (`tahamajs/...`) en los snippets de código; verificar la coherencia de identificadores antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
