# alexkstern/kdyck_10pct_100M_computematched_muonppt_1e18_s2_2026-09-14_13-36-57_655244-pt

## Resumen

Se trata de un checkpoint de investigación publicado por el usuario de Hugging Face `alexkstern`, entrenado con el framework [nanochat](https://github.com/karpathy/nanochat) de Andrej Karpathy. El modelo es un transformer decoder-only de 22 capas, 1408 dimensiones de embedding y 11 cabezas de atención (con 11 cabezas KV, es decir, atención multi-cabeza clásica), con una longitud de contexto de 2048 tokens. El entrenamiento se realizó en dos fases: un pretraining sobre `fineweb-nanochatbpe-100M` con un vocabulario BPE de 65536 tokens, seguido de una fase de post-entrenamiento ("ppt") sobre el conjunto sintético `dyck-k128-seq_len_2048-1B`, con un vocabulario reducido de 256 símbolos y reinicialización de embeddings en la transición.

El interés del artefacto es metodológico, no de producto. Forma parte de una campaña de experimentos (`cm100M_best_cells_hfpush_v0`) que compara celdas con presupuesto de cómputo fijado en 1e18 FLOPs (`target_flops: 1e18`), variando optimizador (Muon en la fase ppt), schedule de learning rate (trapezoidal, con 40 % de warmdown) y profundidad. La pregunta de fondo es si el ajuste sobre una tarea formal sintética (el lenguaje de Dyck con 128 tipos de paréntesis) degrada las capacidades adquiridas en el pretraining sobre texto natural, y con qué hiperparámetros.

Es relevante ahora para quien investiga currículos de entrenamiento, olvido catastrófico y optimizadores alternativos a AdamW en modelos pequeños, pero no es un modelo utilizable como asistente: no hay pipeline declarado, cero descargas, cero likes y ninguna evaluación de capacidades publicada. La licencia es Apache-2.0 y los pesos se distribuyen en formato PyTorch (`state_dict`), sin versiones cuantizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT), atención multi-cabeza con n_head = n_kv_head = 11 |
| Parámetros totales | No declarado por el autor; estimación derivada de `flops_per_token` = 4,58e9: en torno a 760 M (aproximación 6·N por token), sin confirmar |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (`sequence_len: 2048` en ambas fases) |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | No disponibles (pretraining con FineWeb, mayoritariamente inglés; fase ppt sobre el lenguaje formal Dyck-k128) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `state_dict` (`model_000751.pt`); no hay safetensors ni GGUF |

Otros datos de configuración: `n_layer: 22`, `n_embd: 1408`, vocabulario pt 65536 / ppt 256, tamaño del repo 6,1 GB, librería declarada `nanochat`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar del framework nanochat: 22 capas, dimensión de modelo 1408, 11 cabezas de atención y 11 cabezas KV (sin grouped-query attention), con contexto de 2048 tokens. La fase de pretraining emplea un vocabulario BPE de 65536 entradas sobre el dataset `fineweb-nanochatbpe-100M`; la fase de post-entrenamiento cambia a un vocabulario de 256 símbolos (`ppt_vocab_size: 256`, `ppt_same_vocab_as_pt: false`), reinicializa los embeddings en la transición (`reinit_embed_at_transition: true`) y reinicia el estado del optimizador (`reset_optimizer_at_transition: true`). El entrenamiento se detuvo y guardó en el paso 751 de un máximo de 1000 iteraciones, con un coste acumulado de 9,02e17 FLOPs y 4,58e9 FLOPs por token.

Los datos de la segunda fase son sintéticos: `dyck-k128-seq_len_2048-1B`, es decir, secuencias del lenguaje de Dyck con 128 tipos de paréntesis y longitud 2048. Este tipo de corpus se usa para medir la capacidad del modelo de manejar estructuras jerárquicas y dependencias de tipo pila, algo que un modelo con atención completa puede aprender pero que exige mecanismos internos específicos. La fase ppt usa el optimizador Muon (`ppt_lr: 0.001`, `ppt_weight_decay: 0.0`, `ppt_grad_accum_steps: 4`), mientras que el pretraining sigue un schedule trapezoidal (`lr_kind: trapezoid`) con 0 % de warmup y 40 % de warmdown, learning rates diferenciados (`matrix_lr: 0.03`, `embedding_lr: 0.3`, `unembedding_lr: 0.004`) y sin weight decay. No se documenta uso de RLHF, DPO ni ninguna fase de alineación. El hardware de referencia declara `peak_tflops: 2250.0`, y el tiempo total de entrenamiento registrado es de 303,39 unidades (coherente con unos 5 minutos si la unidad es el segundo, dado el presupuesto de FLOPs; la unidad no se especifica).

## Capacidades

- Generación de secuencias del lenguaje de Dyck con 128 tipos de paréntesis: es la tarea objetivo de la fase ppt y la única para la que el checkpoint está explícitamente entrenado.
- Procesamiento de estructuras jerárquicas y dependencias de tipo pila en secuencias de hasta 2048 tokens.
- Capacidades de modelado de lenguaje natural residuales del pretraining sobre FineWeb, presumiblemente degradadas por el ajuste posterior sobre un vocabulario de 256 símbolos; no hay ninguna evaluación publicada que las cuantifique.
- No hay evidencia ni declaración de soporte de tool calling, function calling ni uso como agente.
- No hay modo de razonamiento explícito ("thinking"), visión, audio ni multimodalidad.
- No hay soporte multilingüe declarado ni ficha de idiomas en el repositorio.
- No es un modelo instruct ni de chat: no se ha aplicado ajuste por instrucciones ni plantilla de conversación.

## Casos de uso

- Investigación sobre olvido catastrófico: comparar el rendimiento del modelo en lenguaje natural antes y después de la fase ppt sobre Dyck permite medir cuánta capacidad se pierde al especializar un checkpoint pequeño en una tarea formal, algo directamente relevante para el diseño de currículos de post-entrenamiento.
- Banco de pruebas de optimizadores: el checkpoint forma parte de una comparativa con Muon en la fase ppt, por lo que sirve para replicar estudios sobre la estabilidad de Muon frente a AdamW en modelos de menos de mil millones de parámetros con presupuesto de cómputo fijado.
- Ablación de schedules de learning rate: la configuración trapezoidal con 40 % de warmdown y learning rates separados para matrices, embeddings y unembedding es un punto de datos útil para estudiar sensibilidad al schedule en presupuestos de 1e18 FLOPs.
- Interpretabilidad de mecanismos de pila: con un vocabulario de 256 símbolos y una tarea de paréntesis balanceados, el modelo es un sujeto manejable para analizar cabezas de atención y circuitos que implementan conteo y anidamiento.
- Reproducción del pipeline nanochat: sirve como ejemplo completo de entrenamiento en dos fases con cambios de vocabulario, reinicialización de embeddings y reinicio del optimizador, con la configuración íntegra en `config_000751.json`.
- Docencia y prácticas de entrenamiento distribuido: el coste (1e18 FLOPs, ~5 minutos en hardware de referencia) hace viable reproducir el experimento en un clúster pequeño o en una sesión de laboratorio.
- Estudio de tokenizadores: la convivencia de un vocabulario BPE de 65536 y uno sintético de 256 en el mismo run permite analizar el impacto del cambio de vocabulario en las representaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas del propio entrenamiento, que se reproducen a continuación:

| Métrica | Valor |
|---|---|
| `step` | 751 |
| `smooth_train_loss` | 4,2045 |
| `min_objective` | 1,0719 |
| `flops_used` | 9,0206e+17 |
| `flops_per_token` | 4.582.014.976,0 |
| `total_training_time` | 303,3884 (unidad no especificada) |

No hay resultados de MMLU, HumanEval, GSM8K, ARC ni de la propia tarea Dyck (exactitud de cierre de paréntesis), ni comparación con otros checkpoints de la misma campaña.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión porque el autor no declara el número de parámetros. Con la estimación derivada (~760 M), los pesos en fp32 ocuparían entre 2,5 y 3,5 GB, y en fp16/bf16 entre 1,3 y 1,8 GB; habría que sumar la memoria de activaciones, moderada en un contexto de 2048 tokens.
- GPU recomendadas: no hay recomendación publicada. Para inferencia basta una GPU de consumo; para reproducir el entrenamiento completo hace falta hardware de clase centro de datos, ya que la configuración declara `peak_tflops: 2250.0` (valor compatible con aceleradores de gama B200, sin confirmar por el autor).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) si se carga en fp16/bf16, siempre que se disponga del código de nanochat.
- Opciones de despliegue: no hay soporte directo para vLLM, llama.cpp, Ollama ni TGI; los pesos son un `state_dict` de PyTorch y requieren el código de nanochat (más una conversión a safetensors o GGUF si se quiere usar otro runtime). El checkpoint no incluye ni `config.json` de Hugging Face Transformers ni tokenizador.
- Latencia y throughput: no disponibles.
- Nota sobre el tamaño del repositorio: los 6,1 GB son notablemente superiores a lo esperable para pesos fp32 de un modelo de este orden, lo que sugiere que el fichero `.pt` incluye estado adicional (por ejemplo, del optimizador); el autor no lo detalla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`kdyck_10pct_100M...`) | No declarado; ~760 M según estimación derivada | 2048 | FineWeb (`fineweb-nanochatbpe-100M`) + Dyck-k128 sintético | Apache-2.0 | 0 descargas, 0 likes; requiere código nanochat |
| GPT-2 medium | 355 M | 1024 | WebText | MIT modificada | Ampliamente disponible en safetensors y GGUF |
| Pythia-410M | 410 M | 2048 | The Pile (300B tokens) | Apache-2.0 | Múltiples checkpoints intermedios publicados |

La comparación es solo orientativa: GPT-2 medium y Pythia-410M son modelos de propósito general con evaluaciones públicas exhaustivas, mientras que este checkpoint está especializado en una tarea formal sintética y no tiene ninguna evaluación publicada. No se dispone de datos para comparar rendimiento.

## Limitaciones y advertencias

- Es un artefacto de investigación con 0 descargas y 0 likes: no ha pasado ninguna revisión externa ni se ha validado su comportamiento fuera del entorno de entrenamiento.
- No hay benchmarks ni evaluaciones de ninguna clase; el único dato de pérdida disponible (`smooth_train_loss` 4,20) corresponde al entrenamiento y no es interpretable como calidad final del modelo.
- La fase final de entrenamiento se realizó sobre un vocabulario de 256 símbolos del lenguaje de Dyck, por lo que es esperable un olvido catastrófico de la capacidad de modelado de lenguaje natural adquirida en el pretraining; el autor no publica ninguna medición que lo confirme o descarte.
- No es un modelo instruct ni de chat: no sigue instrucciones, no tiene plantilla de conversación y no soporta tool calling.
- La ventana de contexto está fijada en 2048 tokens; no hay variantes de contexto extendido.
- No hay información sobre sesgos, toxicidad ni composición demográfica de los datos; FineWeb es un corpus web con los sesgos habituales de ese tipo de fuente.
- Riesgo de alucinación: relevante solo si se usa como modelo de lenguaje general, uso para el que no está diseñado ni evaluado.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el repo no incluye el código de nanochat necesario para cargar y ejecutar el modelo, lo que limita la reproducibilidad práctica.
- La fecha de creación del repositorio (2026-09-14) y el identificador de run incluyen marcas temporales coherentes entre sí, pero la unidad de `total_training_time` (303,39) no está especificada, lo que impide interpretar esa cifra con certeza.
- El nombre del checkpoint incluye "100M", en aparente contradicción con una configuración de 22 capas y 1408 dimensiones; lo más probable es que esa cifra etiquete la celda experimental o el presupuesto de datos, no el número de parámetros, pero el autor no lo aclara.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, por lo que no hay documentación externa, réplicas ni discusiones de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alexkstern/kdyck_10pct_100M_computematched_muonppt_1e18_s2_2026-09-14_13-36-57_655244-pt
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Run de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/k5eocrwe
- Búsqueda web: no se encontraron enlaces relevantes (el único resultado devuelto no guarda relación con el modelo).
