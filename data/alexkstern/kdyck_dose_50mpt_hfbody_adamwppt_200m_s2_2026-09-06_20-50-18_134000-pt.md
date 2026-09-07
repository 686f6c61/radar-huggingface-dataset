# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_200M_s2_2026-09-06_20-50-18_134000-pt

## Resumen

El modelo `kdyck_dose_50Mpt_hfbody_adamwppt_200M_s2_2026-09-06_20-50-18_134000-pt` es un experimento de investigación desarrollado por `alexkstern` utilizando el framework `nanochat` de Karpathy. No es un modelo de propósito general, sino un checkpoint destinado a estudiar el efecto de la "dosis de tokens" y las estrategias de entrenamiento por fases sobre la capacidad de aprender un lenguaje formal sintético (Dyck). El entrenamiento combina una primera fase de preentrenamiento sobre `fineweb-nanochatbpe-100M` con 50 millones de tokens, y una segunda fase de post-entrenamiento sobre un dataset sintético `dyck-k128-seq_len_2048-1B` con 200 millones de tokens.

La arquitectura es un transformer decoder-only GPT con 16 capas, 8 cabezas de atención, dimensión de embeddings 1024 y un vocabulario de 65536 tokens. La longitud de contexto es de 2048 tokens. El checkpoint corresponde al paso 762 del entrenamiento y se publica bajo licencia Apache 2.0. Su relevancia es principalmente metodológica: permite analizar dinámicas de entrenamiento, transferencia entre dominios sintéticos y naturales, y reproducibilidad de experimentos con nanochat.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | no especificado |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (state_dict de PyTorch) |

Nota: el repositorio no indica el número de parámetros. La configuración muestra `n_layer=16`, `n_head=8`, `n_embd=1024` y `vocab_size=65536`, lo que sugiere un modelo de tamaño medio, pero el conteo exacto no se declara.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, implementado con la librería `nanochat`. La configuración define dos submodelos con la misma estructura (`model_pt` y `model_ppt`), ambos con `sequence_len=2048`, `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024`. El vocabulario del submodelo de preentrenamiento (`model_pt`) es de 65536 tokens, mientras que el del submodelo de post-entrenamiento (`model_ppt`) es de 256 tokens. La transición entre fases implica reinicializar los embeddings (`reinit_embed_at_transition=true`) y resetear el optimizador (`reset_optimizer_at_transition=true`).

El entrenamiento se compone de dos etapas:
- Preentrenamiento (`pt`): 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`, con una tasa de aprendizaje en forma de trapezoide y `lr_warmup_ratio=0.0`, `lr_warmdown_ratio=0.4`.
- Post-entrenamiento (`ppt`): 200 millones de tokens del dataset sintético `dyck-k128-seq_len_2048-1B`, con `ppt_lr=0.0001` y sin warmup ni warmdown.

El optimizador es AdamW, con tasas diferenciadas para matrices, embeddings y unembeddings (`matrix_lr=0.02`, `embedding_lr=0.3`, `unembedding_lr=0.004`). No se emplea RLHF ni DPO. La configuración registra `flops_per_token=2080374784` y un total de `flops_used=1.0389065468529869e+17`. El objetivo de entrenamiento es la pérdida de entropía cruzada sobre los datos de post-entrenamiento, con `min_objective=1.23165725878543` en el paso 762.

## Capacidades

- Generación de texto básica: el modelo es capaz de predecir el siguiente token según el entrenamiento en FineWeb y en el dataset Dyck.
- Aprendizaje de estructuras formales: la fase de post-entrenamiento con Dyck k=128 y longitud 2048 sugiere que el modelo puede aprender a manejar paréntesis anidados, aunque no se publican métricas de exactitud.
- Sin capacidades documentadas de tool calling, function calling, agentes o razonamiento multi-step.
- Sin soporte de visión, audio ni modo de pensamiento explícito.
- Sin capacidades de conversación o seguimiento de instrucciones: no se aplicó RLHF ni fine-tuning instructivo.
- Multilingüismo no declarado: el dataset de preentrenamiento es FineWeb, mayoritariamente en inglés, pero no se proporciona una lista de idiomas soportados.

## Casos de uso

- Investigación en aprendizaje de lenguajes formales: el modelo permite estudiar cómo un transformer aprende estructuras Dyck (paréntesis anidados) y si la fase de post-entrenamiento con datos sintéticos mejora la generalización a secuencias más profundas.
- Análisis de scaling laws: al controlar la dosis exacta de tokens (50M de preentrenamiento, 200M de post-entrenamiento), sirve para evaluar cómo varía la pérdida en función de la cantidad de datos, un experimento típico en estudios de scaling.
- Evaluación de estrategias de transición en entrenamiento por fases: la reinicialización de embeddings y el reseteo del optimizador son variables de interés para investigar la estabilidad y convergencia en el cambio de dominio.
- Interpretabilidad y análisis de representaciones: el modelo, al ser pequeño, es adecuado para extraer activaciones internas y analizar si las capas codifican la profundidad de anidamiento o la estructura de los corchetes.
- Reproducción de experimentos con nanochat: el repositorio incluye configuraciones completas, metadatos y estado del generador de números aleatorios, lo que facilita la reproducibilidad exacta del checkpoint.
- Docencia y formación: el modelo sirve como ejemplo práctico de un transformer entrenado desde cero con nanochat, útil para demostrar pipelines de entrenamiento por fases y el impacto de la dosis de tokens en la pérdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada en la model card es la pérdida de entrenamiento suavizada (`smooth_train_loss=4.210200309753418`) y el objetivo mínimo (`min_objective=1.23165725878543`) en el dataset Dyck, pero no se proporcionan evaluaciones comparables con otros modelos (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 2.9 GB, lo que incluye pesos, configuraciones y posiblemente estados del optimizador. Para inferencia en fp32, un modelo de ~300M parámetros requeriría aproximadamente 1.2 GB de VRAM, pero esta cifra no está confirmada en la información oficial.
- GPU recomendadas: no se especifica en la model card. Dado el tamaño probable del modelo, una GPU con al menos 4 GB de VRAM (RTX 3050, RTX 3060, etc.) debería ser suficiente para cargar y ejecutar inferencia básica.
- Compatibilidad con GPU de consumo: sí, por tamaño, aunque no hay soporte documentado de cuantización para reducir aún más el uso de memoria.
- Opciones de despliegue: el modelo se distribuye como checkpoint `.pt` de PyTorch, por lo que se puede cargar directamente con `torch.load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los modelos comparables son otros checkpoints experimentales de `alexkstern` con la misma temática, encontrados en la búsqueda web. Sin embargo, no se dispone de información detallada sobre sus configuraciones ni resultados. A continuación se presenta una tabla con los datos inferibles a partir de los nombres de los repositorios, marcados como no confirmados:

| Modelo | Tokens de preentrenamiento | Tokens de post-entrenamiento | Semilla | Paso del checkpoint | Licencia |
|---|---|---|---|---|---|
| `kdyck_dose_50Mpt_hfbody_adamwppt_200M_s2_2026-09-06...` | 50M (confirmado en config) | 200M (confirmado en config) | 2 | 762 | Apache 2.0 |
| `kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14...` | 50M (inferido del nombre) | 500M (inferido del nombre) | 0 | no disponible | Apache 2.0 |
| `kdyck_dose_50Mpt_hfinit_20M_s2_2026-08-14...` | 50M (inferido del nombre) | 20M (inferido del nombre) | 2 | no disponible | Apache 2.0 |

No se dispone de datos de parámetros, contexto, rendimiento ni benchmarks para estos modelos hermanos, por lo que no es posible una comparación técnica completa.

## Limitaciones y advertencias

- Es un modelo experimental de investigación, no entrenado para seguir instrucciones ni para uso en producción.
- No se han realizado evaluaciones de seguridad, alineación ni mitigación de sesgos.
- El dataset de preentrenamiento (FineWeb) puede contener sesgos y contenido no deseado, sin filtros documentados en la información proporcionada.
- Riesgo de alucinación: al ser un modelo de lenguaje sin alineamiento, puede generar texto plausible pero incorrecto.
- No se conocen los idiomas soportados; la mayor parte del entrenamiento procede de texto web en inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está listo para aplicaciones reales debido a su naturaleza experimental y a la falta de benchmarks.
- El repositorio no incluye guía de uso ni API, lo que limita su adopción fuera del ámbito académico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_200M_s2_2026-09-06_20-50-18_134000-pt
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/60k1c0cj
- Repositorio del framework nanochat (mencionado en la model card): https://github.com/karpathy/nanochat
- Modelo hermano `kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14...`: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14_16-05-06_333015-pt
- Modelo hermano `kdyck_dose_50Mpt_hfinit_20M_s2_2026-08-14...`: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_20M_s2_2026-08-14_15-32-20_705847-pt
