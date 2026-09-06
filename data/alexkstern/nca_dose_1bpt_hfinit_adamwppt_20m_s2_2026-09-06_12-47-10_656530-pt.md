# alexkstern/nca_dose_1Bpt_hfinit_adamwppt_20M_s2_2026-09-06_12-47-10_656530-pt

## Resumen

Este modelo es un checkpoint experimental de investigación desarrollado por alexkstern utilizando la librería nanochat de Karpathy. Se trata de un transformer decoder-only de 16 capas, 8 cabezas de atención y una longitud de contexto de 2048 tokens, orientado a estudiar el efecto de la cantidad de tokens de post-entrenamiento y la transferencia de representaciones entre vocabularios distintos.

El proceso de entrenamiento consta de dos fases: una primera fase de pre-entrenamiento con 1.000 millones de tokens del dataset FineWeb (tokenizador nanochat BPE, vocabulario de 65.536), y una segunda fase de post-entrenamiento con 20 millones de tokens de un dataset denominado `nca-paper-share200-2048` (vocabulario reducido a 10.004). En la transición se reinicializan los embeddings y se resetea el optimizador, lo que permite analizar cómo afecta el cambio de vocabulario al rendimiento del modelo.

Su relevancia radica en ser una pieza de un estudio más amplio sobre la "dosis de tokens" (`token_dose_1Bpt_adamw_seed_replicas_v1`), donde se compara el comportamiento de réplicas con distintas semillas. No está pensado como un modelo de producción, sino como un instrumento para investigación en eficiencia de entrenamiento y adaptación de vocabulario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo nanochat GPT) |
| Parámetros totales | no disponible (estimación ~220M según configuración) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (dataset principal en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo estándar configurado como `n_layer: 16`, `n_head: 8`, `n_kv_head: 8` (por tanto, utiliza grouped query attention) y `n_embd: 1024`. El modelo tiene dos configuraciones distintas registradas: `model_pt` con `vocab_size: 65536` para la fase de pre-entrenamiento, y `model_ppt` con `vocab_size: 10004` para la fase de post-entrenamiento. La secuencia máxima es de 2048 tokens.

El entrenamiento se dividió en dos etapas. La primera usó `pt_tokens: 1000000000` (1.000 millones de tokens) del dataset `fineweb-nanochatbpe-20B`, con un optimizador AdamW y learning rates diferenciados por tipo de parámetro (`matrix_lr: 0.02`, `embedding_lr: 0.3`, `unembedding_lr: 0.004`). La segunda fase consumió `ppt_tokens: 20000000` (20 millones de tokens) del dataset `nca-paper-share200-2048`, con un learning rate propio de `0.0003`. En la transición entre fases se activaron `reinit_embed_at_transition: true` y `reset_optimizer_at_transition: true`, lo que implica una reinicialización de los embeddings y un reinicio del estado del optimizador.

El scheduler de learning rate es de tipo trapezoid, con `lr_warmup_ratio: 0.0` y `lr_warmdown_ratio: 0.4`. El checkpoint guardado corresponde al paso 3.814. No se menciona ningún proceso de RLHF, DPO ni alineación por preferencias.

## Capacidades

No se han publicado evaluaciones de capacidades en la información disponible. La model card únicamente reporta métricas de entrenamiento, como `smooth_train_loss: 3.1657543182373047` y `min_objective: 0.9432166632676738`. Por tanto, no es posible afirmar con certeza que el modelo sea capaz de realizar tareas de razonamiento, generación de código, tool calling, soporte de agentes o multimodalidad. Se trata de un modelo de lenguaje experimental del que solo se conoce su configuración y su historial de entrenamiento.

## Casos de uso

- Investigación sobre la dosis de tokens de post-entrenamiento: este checkpoint permite comparar el efecto de utilizar 20 millones de tokens adicionales sobre un modelo pre-entrenado con 1.000 millones, frente a otros modelos del mismo proyecto que usan dosis distintas.
- Estudio de la transferencia de representaciones entre vocabularios: al cambiar el vocabulario de 65.536 a 10.004 y reinicializar los embeddings, el modelo sirve para analizar cómo se adapta el transformer a un espacio de vocabulario más reducido.
- Análisis de varianza entre semillas: al existir réplicas con semillas 1 y 2, este checkpoint permite estudiar la estabilidad de los resultados de entrenamiento bajo configuraciones idénticas.
- Benchmark de eficiencia de la librería nanochat: el checkpoint puede utilizarse como referencia para validar nuevas implementaciones de la librería en términos de flops por token (2.079.994.524.775.481.3 en total) y tiempo de entrenamiento.
- Evaluación de estrategias de optimización: el uso de learning rates diferenciados por capas y scheduler trapezoid ofrece un caso de estudio para comparar regímenes de optimización en modelos pequeños.
- Fine-tuning académico en dominios específicos: por su tamaño reducido, podría ajustarse en tareas concretas de procesamiento de lenguaje natural, aunque no hay datos publicados que respalden su rendimiento en dichos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de entrenamiento y no proporciona puntuaciones en tareas estándar como MMLU, HumanEval, GSM8K o similares. Por tanto, no es posible comparar su rendimiento con otros modelos mediante datos objetivos.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware para inferencia. No obstante, a partir de la arquitectura (16 capas, n_embd 1024, vocab 10.004) se puede estimar que el checkpoint en FP32 ocupa en torno a 880 MB y en FP16 unos 440 MB. Esto implica que es viable ejecutarlo en cualquier GPU consumer con al menos 4 GB de VRAM, e incluso en CPU. El entrenamiento, según la configuración, usó un `device_batch_size: 32` y una GPU con `peak_tflops: 2250`, lo que apunta a un hardware de gama alta tipo H100. No se documentan opciones de despliegue específicas para vLLM, llama.cpp u Ollama; al ser un checkpoint .pt, se puede cargar mediante PyTorch o la librería nanochat. No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se han publicado benchmarks comparables con otros modelos de la misma categoría. Existen checkpoints hermanos del mismo autor con configuraciones casi idénticas y semillas distintas, como `nca_dose_1Bpt_hfinit_20M_s1_2026-08-14_10-59-49_660926-pt` y `nca_dose_1Bpt_hfinit_20M_s2_2026-08-14_11-14-20_432235-pt`, que comparten arquitectura, datasets y esquema de entrenamiento, pero no ofrecen datos de rendimiento publicados. Por ello, no se dispone de una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo experimental sin evaluaciones de seguridad, sesgos ni alineación. No se ha validado su comportamiento ante entradas maliciosas o adversarias.
- El dataset de pre-entrenamiento, FineWeb, puede introducir sesgos lingüísticos y culturales que no han sido medidos ni mitigados.
- El riesgo de alucinación es desconocido, ya que no se han publicado evaluaciones de veracidad o factibilidad.
- La longitud de contexto es fija en 2048 tokens, lo que limita su uso en tareas que requieran ventanas más largas.
- El vocabulario reducido a 10.004 tokens en la fase de post-entrenamiento restringe la diversidad léxica que puede generar el modelo.
- La licencia Apache-2.0 permite el uso comercial, pero el autor no ofrece garantías de rendimiento, seguridad ni idoneidad para producción.
- No se ha documentado soporte para cuantización, tool calling, agentes ni capacidades multimodales.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_adamwppt_20M_s2_2026-09-06_12-47-10_656530-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Weights & Biases: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/kgy5o6gz
- Checkpoint s1: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_20M_s1_2026-08-14_10-59-49_660926-pt
- Checkpoint s2 (fecha anterior): https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_20M_s2_2026-08-14_11-14-20_432235-pt
