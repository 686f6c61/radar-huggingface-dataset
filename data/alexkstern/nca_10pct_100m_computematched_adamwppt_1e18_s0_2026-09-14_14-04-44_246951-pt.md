# alexkstern/nca_10pct_100M_computematched_adamwppt_1e18_s0_2026-09-14_14-04-44_246951-pt

## Resumen

Este repositorio contiene un checkpoint de modelo de lenguaje de tipo transformer decoder-only, entrenado con el framework nanochat de Andrej Karpathy. Lo publica el usuario alexkstern como parte de una campana de experimentos de eficiencia computacional (run `nca_10pct_100M_computematched_adamwppt_1e18_s0`), con un presupuesto objetivo de 1e18 FLOPs. No es un modelo orientado a producto, sino un artefacto de investigacion con una configuracion muy concreta y reproducible.

La arquitectura declarada en la configuracion es un GPT denso de 22 capas, 1408 dimensiones de embedding, 11 cabezas de atencion (sin GQA, ya que `n_kv_head` es igual a `n_head`), vocabulario de 65536 tokens en la fase de preentrenamiento y una ventana de contexto de 2048 tokens. El repositorio ocupa 6,1 GB e incluye el `state_dict` de PyTorch en formato `.pt` junto con ficheros de metadatos, configuracion y estado del RNG.

Su relevancia es metodologica: forma parte de una serie de experimentos "compute-matched" que comparan recetas de entrenamiento (optimizador AdamW con learning rates diferenciados por modulo, scheduler trapezoidal, dos fases con vocabularios distintos y reinicializacion de embeddings en la transicion). El checkpoint publicado corresponde al paso 749. La model card no declara parametros totales, idiomas ni resultados de benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (nanochat GPT), 22 capas, `n_embd` 1408, 11 cabezas de atencion, 11 cabezas KV (MHA, sin GQA) |
| Parametros totales | No declarado en la model card. Estimacion derivada de la configuracion (22 capas, 1408, vocab 65536): en torno a 708 millones, embeddings incluidos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (`sequence_len: 2048`) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en `.pt`) |
| Idiomas soportados | No disponible (la model card no lo declara ni incluye evaluacion multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` en fichero `model_000749.pt` (no safetensors, no GGUF) |
| Vocabulario | 65536 tokens en la fase `pt`; 10004 tokens en la fase `ppt` (vocabularios distintos, `ppt_same_vocab_as_pt: false`) |
| Libreria | nanochat |
| Tamano del repositorio | 6,1 GB |
| Checkpoint | Paso 749 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only autorregresivo de tipo GPT, sin innovaciones arquitectonicas declaradas: atencion multi-cabeza estandar (no se usa GQA ni atencion lineal), normalizacion y MLP propios de la implementacion de nanochat. La configuracion fija 22 capas, 11 cabezas, dimension de modelo 1408 y longitud de secuencia 2048. El entrenamiento se organiza en dos fases con espacios de vocabulario diferentes: una fase de preentrenamiento (`pt`) sobre `fineweb-nanochatbpe-100M` con vocabulario de 65536, y una segunda fase (`ppt`) sobre `nca-paper-share20-2048` con vocabulario de 10004 y un peso relativo `alpha_ppt` de 0,1. En la transicion se reinicializa el embedding (`reinit_embed_at_transition: true`) y se resetea el estado del optimizador (`reset_optimizer_at_transition: true`).

El optimizador es AdamW con learning rates separados por grupo de parametros: `matrix_lr` 0,02, `embedding_lr` 0,3 y `unembedding_lr` 0,004, con `weight_decay` 0,0 y recorte de gradiente de 1,0. El scheduler es trapezoidal (`lr_kind: trapezoid`) sin warmup, con un 40 por ciento de la longitud dedicada al decaimiento (`lr_warmdown_ratio: 0.4`) y fraccion final 0,0. La segunda fase usa `ppt_lr` 3e-06 con la misma forma trapezoidal y `ppt_grad_accum_steps` 4. La configuracion declara 1000 iteraciones objetivo, `device_batch_size` 32 y `grad_accum_steps` 1, con `compile_model: true`. El entrenamiento se ejecuta con semilla 0, `ema_beta` 0,0 y `peak_tflops` declarados de 2250, lo que corresponde a hardware de centro de datos. No se documenta uso de RLHF, DPO ni ajuste por preferencias.

Metricas registradas: `flops_used` 8,9966e17, `flops_per_token` 4,5820e9, `smooth_train_loss` 3,5526, `min_objective` 1,06898 y `total_training_time` 305,77 (la model card no especifica la unidad). Se realizo evaluacion sobre un conjunto auxiliar (`c4-nanochatbpe-10B`) ademas del conjunto de validacion de `pt`, con `eval_tokens` de 10 485 760 y desplazamiento de 2 097 152, pero no se publican los resultados de esas evaluaciones.

## Capacidades

- Generacion de texto autorregresiva y modelado de lenguaje en un unico idioma no declarado. Al ser un checkpoint base (etiqueta `-pt`), no ha recibido ajuste por instrucciones.
- Razonamiento y conocimiento general derivados de la fase de preentrenamiento sobre datos tipo web (FineWeb). No hay evaluacion publicada que cuantifique estas capacidades.
- Sin soporte declarado de tool calling ni function calling.
- Sin soporte declarado de agentes, uso de herramientas ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni multimodalidad.
- Sin modo "thinking" ni razonamiento extendido explicito.
- Capacidades multilingues: no disponibles y no evaluadas; el corpus de preentrenamiento referenciado (FineWeb) es predominantemente en ingles, pero la model card no lo confirma.
- Capacidad especial reseñable: el modelo incorpora dos configuraciones de vocabulario (65536 y 10004) con reinicializacion del embedding en la transicion, lo que lo hace util como objeto de estudio de cambios de vocabulario a mitad de entrenamiento, no como modelo de uso directo.

## Casos de uso

- Reproduccion de experimentos de nanochat: el repositorio incluye `config_000749.json`, `meta_000749.json` y el estado del RNG, lo que permite retomar o replicar exactamente el punto de entrenamiento para verificar resultados de la serie compute-matched.
- Baseline en estudios de eficiencia computacional: sirve como punto de comparacion para experimentos que fijan un presupuesto de 1e18 FLOPs, ya que la configuracion declara `target_flops`, `flops_used` y `flops_per_token` medidos.
- Investigacion sobre tokenizadores y cambios de vocabulario: es un caso de estudio directo de entrenamiento en dos fases con vocabularios incompatibles, reinicializacion de embeddings y reseteo del optimizador en la transicion.
- Estudio de recetas de optimizacion: permite analizar el efecto de learning rates diferenciados por modulo (matriz, embedding, unembedding) y de un scheduler trapezoidal con 40 por ciento de decaimiento, comparando contra otras celdas de la misma campana.
- Punto de partida para ajuste supervisado: al ser un checkpoint base pequeno (del orden de 700 millones de parametros) con contexto de 2048, puede usarse como inicializacion para SFT en tareas acotadas, siempre que se reconstruya el tokenizador correspondiente.
- Experimentacion en hardware de consumo: con pesos de aproximadamente 1,4 GB en bf16 y una cache KV de unos 254 MB a contexto completo, el modelo se puede ejecutar en una unica GPU de gama media para pruebas de inferencia y validacion.
- Docencia y formacion: al proceder de una base de codigo publica y reproducible y tener un coste de inferencia bajo, es adecuado para practicas de carga de checkpoints, inspeccion de `state_dict` y calculo de FLOPs y cache KV.
- Analisis de curvas de entrenamiento: el enlace a W&B publicado en la model card permite estudiar la evolucion de la perdida suavizada y de la metrica objetivo a lo largo de los 749 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones de validacion sobre `c4-nanochatbpe-10B`). La unica informacion cuantitativa publicada son las metricas del propio entrenamiento:

| Metrica | Valor |
|---|---|
| `step` | 749 |
| `smooth_train_loss` | 3,552553653717041 |
| `min_objective` | 1,0689838038654953 |
| `flops_used` | 8,996596526675395e+17 |
| `flops_per_token` | 4 582 014 976 |
| `total_training_time` | 305,76559019088745 (unidad no especificada en la model card) |
| `target_flops` | 1,0e+18 |

No debe interpretarse la perdida de entrenamiento como una medida de calidad comparable entre modelos, ya que depende del tokenizador y del conjunto de datos empleados.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas de la configuracion (22 capas, `n_embd` 1408, 11 cabezas KV de dimension 128, contexto 2048); la model card no las publica.

- Pesos en bf16/fp16: aproximadamente 1,4 GB para un modelo de unos 708 millones de parametros.
- Pesos en int8: aproximadamente 0,7 GB; en int4, aproximadamente 0,35 GB, aunque no se distribuyen pesos cuantizados.
- Cache KV en bf16/fp16: unos 124 KB por token y capa de atencion completa (aproximadamente 254 MB a 2048 tokens). Al usar atencion multi-cabeza sin GQA, la cache es proporcionalmente mayor que en modelos con GQA.
- Inferencia: cabe con holgura en GPU de consumo. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden alojar los pesos y el contexto completo con margen. Con cuantizacion a 8 o 4 bits cabria incluso en GPUs con 4-8 GB.
- GPU recomendadas para entrenamiento o ajuste fino: por el `peak_tflops` declarado de 2250, la configuracion apunta a aceleradores de centro de datos tipo H100 o superior. El `device_batch_size` de 32 con secuencias de 2048 (65 536 tokens por paso) y estados de AdamW requiere del orden de 40-80 GB de memoria, por lo que A100 80 GB o H100 son las opciones realistas. No se declara si se uso checkpointing de activaciones.
- Opciones de despliegue: al distribuirse solo como `state_dict` de PyTorch en `.pt`, no hay versiones oficiales para vLLM, llama.cpp, Ollama ni TGI. Para usarlo hay que cargar los pesos con el codigo de nanochat o con un script propio de PyTorch, y no se incluye tokenizador en los ficheros listados.
- Latencia y throughput: no disponibles. No se publican mediciones de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparacion es estructural. Los datos de los modelos alternativos corresponden a informacion publica ampliamente conocida y no proceden de la busqueda realizada ni de la model card.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| Este checkpoint (nanochat, 22 capas) | No declarado; estimado en torno a 708 M | 2048 | Apache 2.0 | Repositorio HuggingFace con pesos `.pt` | No disponible |
| Pythia-1B (EleutherAI) | 1,0 B | 2048 | Apache 2.0 | Pesos y tokenizador publicados | Publicado por el autor del modelo |
| GPT-2 XL (OpenAI) | 1,5 B | 1024 | MIT | Pesos publicados | Publicado por el autor del modelo |
| SmolLM2-1.7B (HuggingFaceTB) | 1,7 B | 8192 | Apache 2.0 | Pesos, tokenizador y variantes cuantizadas | Publicado por el autor del modelo |

La diferencia principal frente a las alternativas no esta en el rendimiento, sino en el proposito: este checkpoint es un artefacto de investigacion de una campana de eficiencia computacional, sin tokenizador publicado ni evaluacion externa, mientras que las alternativas son modelos distribuidos para uso general.

## Limitaciones y advertencias

- Es un checkpoint base, no ajustado por instrucciones ni por preferencias (sin RLHF, DPO ni SFT). No debe usarse como asistente conversacional sin un ajuste previo.
- Riesgo de alucinacion alto en un modelo de este tamano y sin alineacion: puede generar texto fluido y plausible pero factualmente incorrecto.
- Sesgos conocidos: no disponibles. No hay evaluaciones de sesgo, toxicidad o equidad publicadas. Al proceder de un corpus de preentrenamiento de tipo web, es previsible que reproduzca sesgos presentes en esos datos, pero no se ha cuantificado.
- Limitacion de contexto: 2048 tokens, muy por debajo de los modelos actuales de su categoria, lo que restringe tareas de documento largo y conversaciones multi-turno extensas.
- Limitacion de idioma: la model card no declara idiomas soportados ni incluye evaluacion multilingue. El rendimiento fuera del idioma dominante del corpus de preentrenamiento es desconocido.
- Configuracion de dos vocabularios: el modelo declara un vocabulario de 65536 tokens para la fase `pt` y de 10004 para la fase `ppt`, con reinicializacion de embeddings en la transicion. Cargar el checkpoint con el tokenizador equivocado producira salidas invalidas.
- Falta de artefactos de uso: los ficheros publicados son `model_000749.pt`, `meta_000749.json`, `config_000749.json` y `rng_000749.pt`. No se incluye tokenizador, script de carga ni tarjeta de uso detallada.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias de ningun tipo y el repositorio no incluye avisos sobre los datos de entrenamiento ni sobre su procedencia.
- Estado del repositorio: cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia de validacion por parte de terceros ni de uso en produccion.
- Unidades incompletas: la model card no especifica la unidad de `total_training_time` ni el significado exacto de `min_objective`, lo que dificulta interpretar las metricas de entrenamiento sin consultar el codigo de nanochat.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alexkstern/nca_10pct_100M_computematched_adamwppt_1e18_s0_2026-09-14_14-04-44_246951-pt
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Registro de W&B del entrenamiento: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/z60fgz0b
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada (los resultados devueltos correspondian a documentacion de Google Maps, sin relacion con el modelo).
