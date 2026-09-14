# alexkstern/declref_01_1pct_100M_computematched_adamwppt_1e18_s0_2026-09-14_13-44-09_762935-pt

## Resumen

`alexkstern/declref_01_1pct_100M_computematched_adamwppt_1e18_s0_...` es un checkpoint de un modelo de lenguaje base entrenado con nanochat, el framework de entrenamiento de Karpathy. Se trata de un transformer decoder-only tipo GPT de 20 capas y 1280 dimensiones de embedding (10 cabezas, 10 cabezas de clave/valor), con una ventana de contexto de 2048 tokens. El número exacto de parámetros no se declara en la model card, pero a partir de la configuración (n_layer 20, n_embd 1280, vocab 65536) y de los FLOPs por token registrados (3,6e9) se estima en unos 560 millones.

El checkpoint forma parte de una serie de experimentos de asignación de cómputo ("compute-matched"): todos los runs del grupo `1e18_ppt0.01` consumen aproximadamente 1e18 FLOPs, y la variable estudiada es la fracción de ese presupuesto dedicada a una segunda fase de preentrenamiento en un dominio concreto. En este caso `alpha_ppt = 0,01`, es decir, un 1 % del cómputo se destina a una fase PPT sobre el dataset `declref-01` con un vocabulario reducido de 1028 tokens. El entrenamiento principal se realiza sobre `fineweb-nanochatbpe-100M` con un tokenizador BPE de 65536 entradas.

Es un artefacto de investigación: 0 descargas y 0 "likes" en el momento de la consulta, sin pipeline declarado y sin resultados de benchmarks publicados. Su interés está en reproducir y auditar ablaciones de olvido catastrófico y adaptación de dominio sobre un modelo pequeño, no en su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (etiquetado `nanochat_gpt`) |
| Parametros totales | ≈560 M (estimado a partir de la configuracion y de `flops_per_token`; no declarado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens en ambas fases (PT y PPT) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en precision completa (`.pt`) |
| Idiomas soportados | No disponible; el corpus principal (FineWeb) es mayoritariamente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` (`model_001050.pt`) |
| Tokenizador | BPE de nanochat; vocab PT 65536, vocab PPT 1028 (distintos, `ppt_same_vocab_as_pt: false`) |
| Tamano del repositorio | 4,9 GB |
| Paso del checkpoint | 1050 |
| Framework | nanochat (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con las siguientes dimensiones: `sequence_len` 2048, `n_layer` 20, `n_head` 10, `n_kv_head` 10 (sin GQA) y `n_embd` 1280. El vocabulario de la fase principal es de 65536 entradas (padded), mientras que la fase PPT emplea un vocabulario propio de 1028 entradas. Con estas dimensiones, y aplicando la relacion habitual de ~6·N FLOPs por token para el entrenamiento, el modelo resultante ronda los 560-600 millones de parametros.

El entrenamiento consta de dos fases sobre una misma asignacion de computo total de 1e18 FLOPs. La fase PT se realiza sobre `fineweb-nanochatbpe-100M`. La fase PPT (`alpha_ppt = 0,01`) se ejecuta sobre `declref-01-seq_len_2048-2B`, un dataset que no se documenta en la model card. En la transicion entre fases se reinician los embeddings (`reinit_embed_at_transition: true`) y se resetea el estado del optimizador (`reset_optimizer_at_transition: true`), sin reiniciar la cabeza PT (`random_pt_head: false`). El optimizador es AdamW (etiqueta `adamwppt`), con `matrix_lr` 0,03, `embedding_lr` 0,3, `unembedding_lr` 0,004, `weight_decay` 0,0, `ppt_lr` 3e-05 y recorte de gradiente 1,0. El scheduler es trapezoidal (`lr_kind: trapezoid`) con `warmup_ratio` 0,0 y `warmdown_ratio` 0,4. Se registran 1000 iteraciones configuradas, con el checkpoint seleccionado en el paso 1050, 10,5 M tokens de evaluacion (`eval_tokens`) y evaluacion auxiliar sobre `c4-nanochatbpe-10B`. Las innovaciones destacables son precisamente el diseno de la ablacion (fraccion de computo PPT con reinicio de embeddings y de optimizador) y la reutilizacion de dos vocabularios distintos entre fases.

## Capacidades

- Generacion de texto autoregresiva en ingles (modelo base, sin ajuste por instrucciones).
- Modelado de lenguaje condicionado a un contexto de hasta 2048 tokens.
- Extraccion de representaciones internas (no verificada empiricamente en la informacion disponible).
- No hay fine-tuning de instrucciones, RLHF ni DPO documentado: no es un modelo de chat.
- Soporte de tool calling / function calling: no disponible (no documentado; improbable en un checkpoint base de este tamano).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento principal es predominantemente en ingles.
- Capacidades especiales (modo "thinking", vision o audio): no disponibles.

## Casos de uso

- Investigacion en asignacion de computo ("compute-optimal"): el checkpoint forma parte de la serie `1e18_ppt0.01` y permite comparar, a igualdad de FLOPs (~1e18), distintas fracciones de entrenamiento destinadas a una fase de dominio. Se cargaria el `state_dict` con nanochat y se evaluaria la perdida sobre `c4-nanochatbpe-10B`.
- Estudio de olvido catastrofico: con `alpha_ppt = 0,01`, `reinit_embed_at_transition` y `reset_optimizer_at_transition` activados, sirve para medir cuanto se degrada el rendimiento en el dominio general tras adaptar el modelo a un dominio especifico con solo un 1 % del computo.
- Inicializacion para fine-tuning de dominio: el cambio a un vocabulario PPT de 1028 tokens y el reinicio de embeddings permiten reutilizar el cuerpo del transformer en tareas de nicho con vocabulario cerrado (por ejemplo, lenguajes formales o dominios tecnicos).
- Prototipado de generacion de texto en GPU de consumo: con ~560 M de parametros y contexto 2048, cabe en GPUs de gama media y permite demos y pruebas de pipeline sin infraestructura dedicada.
- Banco de pruebas de infraestructura: al emplear el framework nanochat, el checkpoint sirve para validar throughput, MFU y estabilidad numerica en GPUs modernas (la model card registra `peak_tflops` de 2250).
- Reproducibilidad y docencia: los ficheros `config_001050.json`, `meta_001050.json` y `rng_001050.pt` permiten reproducir el run exacto (seed 0) y explicar un pipeline de preentrenamiento en dos fases.
- Analisis de tokenizacion: comparar el efecto de un BPE de 65536 entradas frente a uno de 1028 sobre la perdida y la longitud efectiva de secuencia.
- Evaluacion de estabilidad del entrenamiento: `grad_clip` 1,0 y un scheduler trapezoidal con `warmdown_ratio` 0,4 permiten estudiar la sensibilidad del modelo a la fase final de decaimiento de la tasa de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente incluye metricas de entrenamiento del propio run:

| Metrica | Valor |
|---|---|
| `step` | 1050 |
| `smooth_train_loss` | 2,9418222904205322 |
| `min_objective` | 1,0680336912511434 |
| `flops_used` | 9,89972781858816e+17 |
| `flops_per_token` | 3596615680,0 |
| `total_training_time` | 324,77401781082153 |

El modelo emplea `c4-nanochatbpe-10B` como conjunto de evaluacion auxiliar, pero los resultados correspondientes no se publican en la informacion disponible.

## Requisitos de hardware

- Pesos en bf16/fp16: ~1,1 GB (≈560 M parametros × 2 bytes).
- Pesos en fp32: ~2,2 GB.
- VRAM estimada con activaciones y cache KV para contexto 2048: ~2-4 GB en bf16.
- Cuantizacion teorica: ~0,56 GB en int8 y ~0,28 GB en int4, aunque no se publican artefactos cuantizados.
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090, etc.).
- GPU de centro de datos recomendadas: innecesarias para inferencia; en entrenamiento la configuracion usa un `peak_tflops` de 2250 (propio de aceleradores tipo B200).
- Opciones de despliegue: framework nanochat sobre PyTorch. No hay integraciones oficiales con vLLM, TGI, llama.cpp u Ollama; el `state_dict` `.pt` requeriria conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos de referencia externos proceden de conocimiento general y no estan verificados en la fuente. Este checkpoint no publica benchmarks, por lo que la comparacion de rendimiento no es posible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (nanochat declref 01) | ≈560 M (estimado) | 2048 | Apache 2.0 | HuggingFace |
| nanochat d20 (configuracion base del framework) | mismas dimensiones (n_layer 20, n_embd 1280) | 2048 | MIT (codigo del framework) | GitHub |
| Qwen2.5-0.5B | ~494 M | 32768 | Apache 2.0 | HuggingFace |
| Pythia-410M | ~410 M | 2048 | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Es un checkpoint base de investigacion, sin ajuste por instrucciones; no debe usarse como asistente conversacional.
- 0 descargas y 0 "likes": no ha sido validado ni auditado por la comunidad.
- El dataset PPT (`declref-01`) no se documenta en la model card, por lo que se desconoce su composicion, procedencia y posibles sesgos.
- El vocabulario PPT (1028 tokens) es distinto y mucho mas pequeno que el de la fase PT (65536); esto puede degradar el rendimiento fuera del dominio PPT.
- El contexto esta limitado a 2048 tokens, inferior al de modelos contemporaneos de tamano similar (por ejemplo, 32768 en Qwen2.5-0.5B).
- Riesgo de alucinacion alto: un modelo denso de ~560 M entrenado con ~1e18 FLOPs tiene una capacidad muy limitada frente a modelos de mayor escala.
- Sesgos conocidos: el corpus principal (FineWeb) procede de web rastreada, con los sesgos propios de ese origen.
- Idiomas soportados no confirmados; se espera un rendimiento limitado fuera del ingles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para produccion y no se ofrecen garantias de calidad.
- El formato `.pt` es un `state_dict` de PyTorch que requiere el framework nanochat para cargarse; no hay versiones safetensors ni GGUF, lo que complica su integracion en herramientas estandar.
- Fecha del checkpoint: 14 de septiembre de 2026 (segun los metadatos del repositorio).

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/declref_01_1pct_100M_computematched_adamwppt_1e18_s0_2026-09-14_13-44-09_762935-pt
- Framework nanochat: https://github.com/karpathy/nanochat
- Registro de entrenamiento (W&B): https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/gn95f1st
