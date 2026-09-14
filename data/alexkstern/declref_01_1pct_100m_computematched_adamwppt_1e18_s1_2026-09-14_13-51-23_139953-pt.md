# alexkstern/declref_01_1pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_13-51-23_139953-pt

## Resumen

Checkpoint de un modelo de lenguaje de tipo GPT entrenado con `nanochat`, la libreria de entrenamiento de Andrej Karpathy, y publicado por el usuario alexkstern dentro de un barrido experimental denominado `cm100M_best_cells_hfpush_v0`. El modelo tiene 20 capas, dimension de embedding de 1280 y 10 cabezas de atencion, con una longitud de contexto de 2048 tokens; a partir del campo `flops_per_token` (3.596.615.680) puede estimarse un tamano de aproximadamente 600 millones de parametros, aunque la model card no publica un recuento oficial.

El interes del artefacto es metodologico, no de producto. Se trata de un experimento equiparado en computo (objetivo de 1e18 FLOPs, de los cuales el 1 % se destina a una segunda etapa `ppt`), con dos fases de entrenamiento sobre vocabularios distintos: una fase de preentrenamiento con `fineweb-nanochatbpe-100M` (vocabulario de 65.536) y una segunda fase con `declref-01-seq_len_2048-2B` (vocabulario reducido de 1.028), en la que se reinicializan los embeddings y se resetea el optimizador en la transicion. Esto lo convierte en material util para estudiar recetas de optimizacion, schedules de learning rate y estrategias de cambio de vocabulario, no en un modelo para desplegar en produccion.

El checkpoint corresponde al paso 1.050, ocupa 4,9 GB de repositorio, no tiene descargas ni valoraciones y no publica ningun resultado de evaluacion de capacidades (MMLU, HumanEval, GSM8K o similares). Requiere la libreria `nanochat` y los pesos se distribuyen como `state_dict` de PyTorch (`.pt`), sin versiones en safetensors, GGUF ni formatos de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, variante `nanochat_gpt` del proyecto nanochat |
| Parametros totales | No disponible en la model card; estimacion derivada de `flops_per_token` / 6: ~600 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (`sequence_len` en ambas etapas) |
| Tipos de cuantizacion | No disponible; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; el corpus de preentrenamiento (FineWeb) es mayoritariamente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` (`.pt`); requiere la libreria `nanochat` |
| Capas (`n_layer`) | 20 |
| Dimension de embedding (`n_embd`) | 1.280 |
| Cabezas de atencion (`n_head` / `n_kv_head`) | 10 / 10 (atencion multi-cabeza sin GQA) |
| Vocabulario etapa PT | 65.536 tokens |
| Vocabulario etapa PPT | 1.028 tokens |
| Paso del checkpoint | 1.050 |
| Tokens vistos (derivado) | ~275 millones (`flops_used` / `flops_per_token`) |
| Tamano del repositorio | 4,9 GB |

## Arquitectura y entrenamiento

La model card solo documenta la topologia del modelo: 20 capas, `n_embd` de 1280, 10 cabezas de atencion y `n_kv_head` igual a `n_head`, es decir, atencion multi-cabeza clasica sin agrupacion de claves/valores. Con 1280 dimensiones y 10 cabezas, la dimension por cabeza es de 128. No se especifica en la ficha el esquema de normalizacion, la codificacion posicional ni el tipo de capa feed-forward (segun la documentacion del proyecto nanochat, del que procede la implementacion, se trata de un transformer decoder-only con normalizacion RMSNorm y embeddings rotatorios, pero la model card no lo confirma).

El entrenamiento se organiza en dos fases. La primera usa `fineweb-nanochatbpe-100M` con un vocabulario de 65.536 tokens, y la segunda usa `declref-01-seq_len_2048-2B` con un vocabulario propio de 1.028 tokens (`ppt_same_vocab_as_pt: false`). En la transicion se reinicializan los embeddings (`reinit_embed_at_transition: true`), se resetea el estado del optimizador (`reset_optimizer_at_transition: true`) y no se reinicializa la cabeza (`random_pt_head: false`). La fase PPT consume el 1 % del presupuesto de computo (`alpha_ppt: 0.01`) dentro de un objetivo total de 1e18 FLOPs, con learning rate propia de 3e-05. El optimizador es AdamW con learning rates diferenciados (`matrix_lr` 0.03, `embedding_lr` 0.3, `unembedding_lr` 0.004) y `weight_decay` 0.0, con recorte de gradiente de 1.0. El schedule de learning rate es trapezoidal, sin warmup (`lr_warmup_ratio: 0.0`) y con un 40 % de decaimiento final (`lr_warmdown_ratio: 0.4`) hasta una fraccion final de 0.0.

Los resultados registrados son: `step` 1.050, `smooth_train_loss` 3.269970655441284, `min_objective` 1.0685169519368554, `flops_used` 9.89972781858816e+17, `flops_per_token` 3.596615680e9 y `total_training_time` 324,965 s. La evaluacion configurada usa 10.485.760 tokens (`eval_tokens`) con 2.097.152 tokens de offset y 2.097.152 tokens adicionales auxiliares, con `eval_steps: 8` y `eval_device_batch_size: 32`. Como conjunto adicional de evaluacion se referencia `c4-nanochatbpe-10B`, aunque no se publican sus resultados. La semilla es 1 y el `grad_accum_steps` es 1 con `device_batch_size` de 32.

## Capacidades

- Generacion de texto y continuacion de secuencias: es un modelo de lenguaje base (sufijo `-pt`), por lo que su funcion nativa es la prediccion del siguiente token, no el seguimiento de instrucciones.
- Modelado de un dominio con vocabulario reducido: la etapa final emplea un vocabulario de 1.028 simbolos sobre `declref-01`, lo que apunta a un corpus de referencia muy acotado (posiblemente sintetico o altamente estructurado).
- Ninguna capacidad de tool calling ni function calling documentada. No hay plantilla de chat, tokens especiales de herramienta ni evidencia de entrenamiento con datos de herramientas.
- Ninguna capacidad de agente ni de razonamiento multi-paso documentada. Al no haber etapa de SFT/RLHF registrada, no cabe esperar comportamiento agentico fiable.
- Capacidades multilingues: no disponibles. El preentrenamiento con FineWeb esta dominado por ingles y no se documenta cobertura de otros idiomas.
- Sin vision, audio ni ninguna otra modalidad: la configuracion solo define embeddings de tokens y una cabeza de lenguaje.
- Razonamiento, codigo y matematicas: no hay evaluaciones publicadas. Con ~275 millones de tokens vistos y un modelo de ~600 millones de parametros, es esperable un rendimiento muy inferior al de modelos pequenos actuales entrenados con ordenes de magnitud mas de datos, aunque esto no se ha medido en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos equiparados en computo: el checkpoint permite replicar exactamente una celda del barrido `cm100M_best_cells_hfpush_v0` (semilla 1, paso 1.050, 9,9e17 FLOPs) y contrastar curvas de perdida con otras celdas del mismo estudio, algo inviable sin los pesos guardados.
- Estudio de la transicion entre vocabularios: comparar el efecto de reinicializar los embeddings y resetear el optimizador al pasar de un vocabulario de 65.536 a uno de 1.028 tokens, midiendo la degradacion y la recuperacion de la perdida en las primeras iteraciones de la segunda fase.
- Ablacion de optimizadores y schedules: sirve como punto de referencia para evaluar AdamW con learning rates separados por modulo (`matrix_lr`, `embedding_lr`, `unembedding_lr`) y un schedule trapezoidal con 40 % de decaimiento y sin warmup.
- Punto de partida para fine-tuning supervisado: al ser un checkpoint de preentrenamiento con licencia Apache 2.0, puede usarse como base para anadir una etapa SFT con `nanochat` sobre un dataset propio de instrucciones y medir cuanto se gana frente a entrenar desde cero con el mismo presupuesto.
- Docencia y formacion en entrenamiento de LLM: un modelo de este tamano se carga y se ejecuta en una unica GPU de consumo, lo que permite ilustrar de extremo a extremo el ciclo de tokenizacion, preentrenamiento, evaluacion y publicacion en HuggingFace.
- Analisis de tokenizacion BPE a escala pequena: el par de vocabularios (65.536 frente a 1.028) permite estudiar como afecta el tamano del vocabulario a la compresion efectiva del corpus y a la perdida por token.
- Evaluacion cualitativa de un modelo base: generar continuaciones sobre `fineweb` o sobre el dominio de `declref-01` para inspeccionar sesgos, fluidez y adherencia al registro del corpus de entrenamiento.
- No es adecuado como servicio de atencion al cliente, asistente conversacional, generacion de codigo en produccion ni ninguna tarea que requiera seguir instrucciones: no existe etapa de alineacion y el modelo no entiende de forma fiable un formato de dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos publicados son las metricas internas de entrenamiento:

| Metrica | Valor |
|---|---|
| `step` | 1.050 |
| `smooth_train_loss` | 3,269970655441284 |
| `min_objective` | 1,0685169519368554 |
| `flops_used` | 9,89972781858816e+17 |
| `flops_per_token` | 3.596.615.680 |
| `total_training_time` (s) | 324,96525526046753 |

No hay resultados de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ningun otro banco de evaluacion estandar, ni tampoco de los conjuntos de evaluacion referenciados en la configuracion (`c4-nanochatbpe-10B`). No es posible, por tanto, comparar el rendimiento de este modelo con alternativas de forma cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de aproximadamente 600 millones de parametros, los pesos ocupan del orden de 1,2 GB en bfloat16 y de 2,4 GB en float32. Con cache KV para 2.048 tokens y lotes pequenos, la inferencia deberia caber holgadamente en menos de 4 GB de VRAM en precision completa.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia. Para reproducir el entrenamiento completo, la configuracion declara un `peak_tflops` de 2.250, coherente con aceleradores de la clase B200 o similar, y un `device_batch_size` de 32 con `grad_accum_steps` de 1.
- Cabe en GPU de consumo: si. Modelos de esta escala se ejecutan sin problema en una RTX 3060 de 12 GB, una RTX 4070/4080 o una RTX 4090, e incluso en GPUs de 8 GB con precision reducida. Tambien es viable la inferencia en CPU, aunque con latencia mayor.
- Opciones de despliegue: la unica via oficial es la libreria `nanochat` (sobre PyTorch), ya que el repositorio contiene un `state_dict` en `.pt`. No hay soporte directo en vLLM, llama.cpp, Ollama o TGI, ni ficheros GGUF; cualquier conversion a esos formatos requeriria un trabajo manual no documentado.
- Latencia y throughput: no disponible. Como referencia de entrenamiento, los 9,8997e17 FLOPs declarados en 324,965 s implican aproximadamente 3,05e15 FLOP/s sostenidos.
- Advertencia de coherencia: la tasa derivada (3,05e15 FLOP/s) supera el `peak_tflops` declarado en la configuracion (2.250 TFLOPS, es decir, 2,25e15 FLOP/s), lo que sugiere que la contabilidad de FLOPs y el tiempo registrado cubren ambitos distintos o que el valor de `peak_tflops` no corresponde al hardware realmente usado.
- El repositorio ocupa 4,9 GB, mas de lo esperable para los pesos de un modelo de este tamano en float32 (del orden de 2,4 GB), lo que apunta a tensores adicionales o estados incluidos en el fichero. La model card no desglosa el contenido.

## Comparativa con modelos similares

La comparacion se establece con modelos base de escala similar y acceso abierto. Los datos de los modelos alternativos proceden de sus fichas publicas.

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| declref_01 (este checkpoint) | ~600 M (estimado) | 2.048 | ~275 M (derivado) | Apache 2.0 | `.pt` con `state_dict`, requiere `nanochat` |
| GPT-2 124M | 124 M | 1.024 | No disponible | MIT modificada | safetensors y GGUF, integrado en `transformers` |
| Pythia-410M | 410 M | 2.048 | 300 B (Pile) | Apache 2.0 | safetensors, integrado en `transformers` |
| SmolLM2-360M | 362 M | 8.192 | No disponible en esta ficha | Apache 2.0 | safetensors y GGUF, integrado en `transformers` |
| Qwen2.5-0.5B | 494 M | 32.768 | 18 T (serie Qwen2.5) | Apache 2.0 | safetensors y GGUF, integrado en `transformers` |

La diferencia clave no esta en el numero de parametros, sino en el volumen de datos y en el ecosistema. Los modelos alternativos se han entrenado con entre tres y cinco ordenes de magnitud mas tokens y se distribuyen en formatos directamente consumibles por `transformers`, vLLM o llama.cpp. Este checkpoint esta pensado para reproducir una celda experimental concreta y no para competir en calidad de generacion.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no sigue instrucciones, no mantiene formato de dialogo y no dispone de plantilla de chat ni de tokens especiales de rol.
- Riesgo elevado de alucinacion y de texto incoherente: con aproximadamente 275 millones de tokens vistos (~2,75e8 FLOPs por parametro en el mejor de los casos), el modelo esta muy por debajo del regimen de entrenamiento de cualquier modelo utilizable en tareas reales.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad. Al derivar de FineWeb, hereda los sesgos del texto web en ingles sin filtrado declarado.
- Limitacion idiomatica: el corpus de preentrenamiento es fundamentalmente ingles; el comportamiento en castellano no esta evaluado ni garantizado.
- Restriccion de contexto: 2.048 tokens es una ventana muy corta para practicamente cualquier flujo conversacional o de analisis documental actual.
- La segunda fase usa un vocabulario de 1.028 tokens, incompatible con el de la primera (`ppt_same_vocab_as_pt: false`). Cargar el checkpoint para inferencia generalista exige conocer que cabeza y que vocabulario corresponden al paso guardado.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion. No obstante, la licencia no cubre los datos de entrenamiento ni garantiza que el modelo no reproduzca contenido de terceros.
- Ausencia total de soporte: cero descargas, cero valoraciones, sin pipeline declarado y sin idiomas declarados. No hay garantia de mantenimiento ni de que los ficheros sean cargables fuera del entorno original.
- Formato de pesos propietario de facto: al ser un `state_dict` de `nanochat`, la integracion en infraestructuras estandar (vLLM, TGI, Ollama, llama.cpp) requiere conversion manual no documentada.
- No debe usarse en produccion ni en aplicaciones que afecten a personas: es un artefacto de investigacion sin validacion de seguridad, sin evaluaciones de capacidades y sin proceso de control de calidad.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/declref_01_1pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_13-51-23_139953-pt
- Repositorio de nanochat (libreria de entrenamiento e inferencia): https://github.com/karpathy/nanochat
- Registro del experimento en Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/u07j0o6e
- Los resultados de busqueda web realizados no aportaron enlaces relevantes sobre este modelo: devolvieron unicamente paginas genericas de servicios de Google (Photos, Drive, Accounts, Classroom), sin relacion con el artefacto.
