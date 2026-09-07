# alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_200M_s2_2026-09-06_17-38-41_046757-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfinit_adamwppt_200M_s2_2026-09-06_17-38-41_046757-pt` es un experimento de investigación desarrollado por alexkstern con la librería nanochat (el framework de entrenamiento de GPT de Karpathy). Su propósito es estudiar cómo los transformers aprenden lenguajes formales tipo Dyck (paréntesis balanceados) y qué efecto tiene la «dosis de tokens» y el cambio de vocabulario durante el entrenamiento. No es un modelo de propósito general ni está pensado para producción: es un checkpoint académico para analizar dinámicas de aprendizaje y estrategias de optimización.

Arquitectónicamente es un transformer estándar con 16 capas, 8 cabezas de atención, 8 cabezas KV (GQA) y 1024 dimensiones de embedding. La longitud de contexto es de 2048 tokens. El entrenamiento se divide en dos fases: una pre-entrenamiento con 100 millones de tokens de FineWeb (vocabulario de 65536 tokens) y una post-pre-entrenamiento con 200 millones de tokens del lenguaje Dyck-k128 (vocabulario de 256 tokens), con re-inicialización de embeddings en la transición. El checkpoint guardado corresponde al paso 1525, ya en la fase post-pre-entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat GPT) |
| Parametros totales | no disponible |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (pre-entrenado en FineWeb, probablemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer pre-entrenamiento (decoder-only) implementado con nanochat. La configuración indica `n_embd=1024`, `n_layer=16`, `n_head=8` y `n_kv_head=8`, lo que implica atención con query-key-value agrupados (GQA). El vocabulario de la primera fase es de 65536 tokens (`pad_vocab=65536`), mientras que en la segunda fase se usa un vocabulario de 256 tokens (`ppt_vocab_size=256`). El número total de parámetros no se especifica en la información disponible, aunque la arquitectura sugiere un modelo de tamaño pequeño (del orden de 200 millones).

El entrenamiento se realiza en dos etapas: primero pre-entrenamiento sobre `fineweb-nanochatbpe-100M` (100 millones de tokens) y después post-pre-entrenamiento sobre `dyck-k128-seq_len_2048-1B` (200 millones de tokens). En la transición entre fases, se re-inicializan los embeddings (`reinit_embed_at_transition=true`) y se resetea el optimizador (`reset_optimizer_at_transition=true`). El learning rate es de tipo trapezoidal, con una fase de calentamiento nula y un decaimiento del 40 % en la primera fase. La segunda fase usa un learning rate fijo de `3e-05`. El checkpoint se guarda en el paso 1525, con una pérdida de entrenamiento suavizada de `3.589` y un `min_objective` de `1.137`.

## Capacidades

- Generación de texto en el lenguaje Dyck-k128 (secuencias de paréntesis balanceados) gracias al post-pre-entrenamiento específico.
- Generación básica de texto en inglés como resultado del pre-entrenamiento en FineWeb, aunque limitada por el vocabulario final de 256 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso más allá de la estructura de paréntesis.
- No soporta entrada multimodal (visión, audio, etc.).
- Capacidades multilingües no documentadas; el pre-entrenamiento en FineWeb es principalmente inglés.

## Casos de uso

- Investigación en aprendizaje de lenguajes formales: el modelo sirve como baseline para estudiar cómo los transformers aprenden estructuras de paréntesis balanceados Dyck-k128, comparando la pérdida de entrenamiento y la capacidad de generalización.
- Análisis de la «dosis de tokens»: permite evaluar cómo la cantidad de tokens de pre-entrenamiento (100M) afecta al rendimiento posterior en tareas sintácticas, en comparación con otros modelos del mismo proyecto.
- Estudio del efecto del tamaño del vocabulario: al cambiar de 65536 a 256 tokens en la segunda fase, el modelo permite investigar cómo la re-inicialización de embeddings influye en la convergencia y en la representación interna.
- Benchmark de arquitecturas nanochat: el checkpoint y la configuración completa (JSON) sirven para validar implementaciones de nanochat y reproducir los resultados del entrenamiento.
- Reproducibilidad de experimentos: la combinación de la config, los pesos y el enlace al run de Weights & Biases permite replicar el entrenamiento y comparar dinámicas de pérdida entre semillas.
- Comparación de estrategias de optimización: el modelo usa learning rate trapezoidal y reset del optimizador en la transición, lo que permite estudiar el impacto de estas decisiones en la estabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| step | 1525 |
| smooth_train_loss | 3.5893588066101074 |
| min_objective | 1.1372339778120029 |
| flops_used | 2.079176488124416e+17 |
| flops_per_token | 2080374784.0 |
| total_training_time | 224.82111358642578 |

No se proporcionan evaluaciones en MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El entrenamiento se realizó en un hardware con `peak_tflops=2250.0`, lo que sugiere una GPU de gama alta (probablemente H100), pero no se especifica el modelo exacto.
- El modelo es pequeño según la configuración, por lo que es probable que quepa en GPUs de consumo (RTX 3060, RTX 4090, etc.), pero no hay datos oficiales para confirmarlo.
- Opciones de despliegue: el checkpoint está en formato `.pt` (state_dict de PyTorch) y se puede cargar con la librería nanochat. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los resultados de búsqueda muestran dos modelos hermanos del mismo autor, aparentemente variantes del mismo experimento:

| Modelo | Diferencias |
|---|---|
| `kdyck_dose_100Mpt_200M_s2_2026-08-14_18-57-50_991681-pt` | Misma familia, sin `hfinit` en el nombre. |
| `kdyck_dose_100Mpt_hfinit_200M_s2_2026-08-14_05-08-29_285008-pt` | Misma familia, con `hfinit`, pero fecha anterior. |

No se dispone de especificaciones ni resultados de rendimiento públicos para estos modelos, por lo que no es posible realizar una comparativa detallada. Tampoco se conocen otros modelos comparables de la misma categoría (experimentos de token dose con nanochat) fuera de este proyecto.

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción ni como asistente conversacional.
- El vocabulario final es de solo 256 tokens (lenguaje Dyck), lo que limita drásticamente la generación de texto natural en inglés u otros idiomas.
- No ha recibido fine-tuning instructivo, por lo que no sigue instrucciones ni mantiene conversaciones coherentes.
- No soporta tool calling, agentes ni tareas multimodales.
- Riesgo de alucinación alto, dado el tamaño reducido y la ausencia de alineación (RLHF/DPO).
- Sin benchmarks publicados, el rendimiento real en tareas prácticas es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no cuenta con soporte oficial.
- El pre-entrenamiento se realizó sobre FineWeb, que es predominantemente inglés; no se garantiza soporte multilingüe.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_200M_s2_2026-09-06_17-38-41_046757-pt
- Run de Weights & Biases: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/uw3iu4kx
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelo similar sin `hfinit`: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_200M_s2_2026-08-14_18-57-50_991681-pt
- Modelo similar con `hfinit` (fecha anterior): https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_200M_s2_2026-08-14_05-08-29_285008-pt
