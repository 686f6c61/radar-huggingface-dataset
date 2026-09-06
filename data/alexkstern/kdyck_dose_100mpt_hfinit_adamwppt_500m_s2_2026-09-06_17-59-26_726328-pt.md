# alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_500M_s2_2026-09-06_17-59-26_726328-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfinit_adamwppt_500M_s2_2026-09-06_17-59-26_726328-pt` es un checkpoint experimental de investigación desarrollado por alexkstern con la librería nanochat de Andrej Karpathy. Pertenece a la serie `token_dose_100Mpt_adamw_seed_replicas_v1`, un conjunto de experimentos diseñados para estudiar el efecto de la cantidad de tokens en el entrenamiento de modelos pequeños y la capacidad de aprender lenguajes formales.

Se trata de un modelo Transformer GPT con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024, con una ventana de contexto de 2048 tokens. El entrenamiento se ejecuta en dos fases diferenciadas: una primera fase de preentrenamiento sobre el dataset `fineweb-nanochatbpe` con 100 millones de tokens, y una segunda fase sobre un dataset sintético de lenguaje Dyck (`dyck-k128`) con 500 millones de tokens, utilizando un vocabulario reducido de 256 ítems. El objetivo es analizar cómo el modelo transiciona del lenguaje natural a un lenguaje de paréntesis estructurado, y cómo esa transferencia afecta a la pérdida y a las representaciones internas.

Estos experimentos son relevantes para la comunidad de investigación porque permiten estudiar de manera controlada la dinámica de optimización, la inicialización con pesos preentrenados y el impacto del vocabulario en la capacidad de generalización. No es un modelo pensado para uso en producción, sino una herramienta de análisis científico para comprender mejor el comportamiento de los transformers en regímenes de entrenamiento específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GPT) de 16 capas, 8 cabezas de atencion, dimension de embedding 1024 |
| Parametros totales | No disponible (estimacion de ~347 millones a partir de `flops_per_token` de 2080374784) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un Transformer GPT autorregresivo con configuración estándar: 16 capas, 8 cabezas de atención, 8 cabezas KV (sin GQA, ya que `n_kv_head` es igual a `n_head`), dimensión de embedding 1024 y secuencia máxima de 2048. El vocabulario de la primera fase (`model_pt`) tiene 65 536 tokens, mientras que la segunda fase (`model_ppt`) reduce el vocabulario a 256 tokens. El checkpoint se guarda en el paso 1 525 del entrenamiento.

La fase de preentrenamiento se realizó sobre el dataset `fineweb-nanochatbpe` con 100 000 000 de tokens (`pt_tokens`), y la fase posterior sobre `dyck-k128-seq_len_2048-1B` con 500 000 000 de tokens (`ppt_tokens`). Esto explica el nombre del modelo: `100Mpt` son los tokens de preentrenamiento y `500M` los tokens de la fase posterior. En la transición entre ambas fases se reinicializan los embeddings (`reinit_embed_at_transition: true`), se resetea el optimizador (`reset_optimizer_at_transition: true`) y se aplican tasas de aprendizaje diferenciadas: `matrix_lr: 0.02`, `embedding_lr: 0.3` y `unembedding_lr: 0.004`. El scheduler es trapezoidal, con `warmup` 0 y `warmdown` 0.4.

Según los metadatos, el entrenamiento consumió 2.079e17 FLOPs en total, con un tiempo de entrenamiento de 372.56 segundos. La pérdida de entrenamiento suavizada al final es de 3.582 y el valor de `min_objective` alcanzado es 1.136. No se especifica si se utilizó RLHF, DPO ni ninguna técnica de alineación posterior.

## Capacidades

- Generación de texto autoregresiva, implícita por su arquitectura GPT.
- Procesamiento de secuencias de hasta 2048 tokens.
- Potencial capacidad para aprender estructuras jerárquicas del lenguaje Dyck, al estar entrenado específicamente con el dataset `dyck-k128` durante la segunda fase.
- No se documenta soporte para tool calling, function calling, razonamiento multi-paso, visión o entrada de audio.
- No se especifican idiomas, aunque al preentrenarse con `fineweb` probablemente tiene exposición al inglés en la primera fase.

## Casos de uso

- Investigación sobre el aprendizaje de lenguajes formales: el modelo puede utilizarse para estudiar cómo los transformers adquieren reglas estructurales de paréntesis (Dyck) después de haber sido preentrenados en texto natural, comparando la dinámica de pérdida con la del lenguaje humano.
- Análisis de transición de vocabulario: permite investigar el efecto de reducir el vocabulario de 65 536 a 256 tokens en la representación interna y en la habilidad del modelo para adaptarse a una nueva distribución de tokens.
- Estudio de estrategias de inicialización: al estar marcado como `hfinit`, se puede comparar este checkpoint con otros de la misma serie que parten de inicializaciones aleatorias, para medir el impacto de partir de pesos preentrenados.
- Benchmarks de eficiencia de entrenamiento: proporciona métricas de FLOPs por token (2.08 GFLOPs/token) y tiempo total de entrenamiento, útiles para calibrar el coste de entrenar modelos pequeños en configuraciones similares.
- Reproducción de experimentos con nanochat: sirve como punto de referencia para validar implementaciones de la librería nanochat y comprobar que los resultados de entrenamiento coinciden con los publicados.
- Evaluación de la dinámica del optimizador AdamW: con tasas de aprendizaje diferenciadas por tipo de capa (embedding, unembedding y matrices), el modelo permite analizar cómo varía la convergencia en función de la región de pesos que se actualiza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas de entrenamiento, sin comparación con modelos similares en tareas estandarizadas. Los datos disponibles son:

| Metrica | Valor |
|---|---|
| `smooth_train_loss` | 3.582 |
| `min_objective` | 1.136 |
| `flops_used` | 2.079e17 |
| `flops_per_token` | 2080374784 |
| `total_training_time` | 372.56 segundos |

No se dispone de resultados en MMLU, HumanEval, GSM8K ni ningún otro benchmark convencional.

## Requisitos de hardware

- No se proporcionan requisitos de VRAM en la documentación del modelo.
- Con una estimación de ~347 millones de parámetros, la inferencia en FP16 requiere aproximadamente 0.7 GB de VRAM, y en FP32 unos 1.4 GB. Esto hace que sea utilizable en prácticamente cualquier GPU de consumo, incluyendo una RTX 3060 de 12 GB o una RTX 4060 de 8 GB.
- La configuración de entrenamiento menciona `peak_tflops: 2250.0` y `device_batch_size: 8`, lo que sugiere uso de hardware acelerado (probablemente una GPU de centro de datos como H100), pero no se detalla la GPU concreta.
- Para la inferencia, los pesos en formato `.pt` pueden convertirse a otros formatos si se desea usar frameworks como vLLM o llama.cpp, aunque al ser un modelo experimental no hay una guía oficial de despliegue.
- No se informa de latencia ni throughput en el modelo.

## Comparativa con modelos similares

No se dispone de información detallada sobre modelos comparables en la documentación. Los únicos modelos similares identificados son otros checkpoints de la misma serie experimental, publicados también por alexkstern:

| Modelo | Enlace |
|---|---|
| `kdyck_dose_100Mpt_500M_s2_2026-08-14_19-33-37_314543-pt` | https://huggingface.co/alexkstern/kdyck_dose_100Mpt_500M_s2_2026-08-14_19-33-37_314543-pt |
| `kdyck_dose_100Mpt_100M_s2_2026-08-14_18-34-44_679484-pt` | https://huggingface.co/alexkstern/kdyck_dose_100Mpt_100M_s2_2026-08-14_18-34-44_679484-pt |

No se han podido comparar los parámetros, el contexto ni el rendimiento porque no se dispone de la información necesaria para esos checkpoints en los resultados de la búsqueda web.

## Limitaciones y advertencias

- El modelo es experimental, con 0 descargas y 0 likes en HuggingFace, y no está validado para ningún uso práctico.
- No se han realizado evaluaciones de seguridad, alucinación ni sesgos, por lo que puede producir contenido incorrecto o inapropiado.
- La ventana de contexto de 2048 tokens es corta para muchas tareas actuales.
- El vocabulario de la fase posterior se reduce a 256 tokens, lo que limita gravemente la capacidad de generar texto natural en esa configuración.
- No se documentan los idiomas soportados, y es probable que el rendimiento fuera del inglés sea muy limitado.
- La licencia Apache 2.0 permite uso comercial, pero sin garantías implícitas ni soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_500M_s2_2026-09-06_17-59-26_726328-pt
- Repositorio de entrenamiento nanochat: https://github.com/karpathy/nanochat
- Ejecución en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/3dzq98e3
- Checkpoint comparable 1: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_500M_s2_2026-08-14_19-33-37_314543-pt
- Checkpoint comparable 2: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_100M_s2_2026-08-14_18-34-44_679484-pt
