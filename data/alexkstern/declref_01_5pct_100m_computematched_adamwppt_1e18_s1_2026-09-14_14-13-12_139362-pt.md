# alexkstern/declref_01_5pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_14-13-12_139362-pt

## Resumen

`declref_01_5pct_100M_computematched_adamwppt_1e18_s1_...-pt` es un checkpoint de investigación entrenado con [nanochat](https://github.com/karpathy/nanochat), la implementación mínima de una pila tipo ChatGPT publicada por Andrej Karpathy. El autor, `alexkstern`, lo publica como artefacto de un barrido de hiperparámetros ("compute-matched" a 1e18 FLOPs) orientado a estudiar cómo repartir el presupuesto de cómputo entre una fase de preentrenamiento y una segunda fase con vocabulario propio. La arquitectura es un transformer decoder-only de 20 capas, 1280 dimensiones de embedding, 10 cabezas de atención (sin GQA, puesto que `n_head` y `n_kv_head` coinciden) y una longitud de contexto de 2048 tokens.

El interés del modelo no está en su rendimiento, sino en su diseño experimental: la fase principal usa un vocabulario de 65 536 tokens sobre `fineweb-nanochatbpe-100M`, mientras que la segunda fase ("ppt") emplea un vocabulario reducido de 1028 tokens sobre `declref-01-seq_len_2048-2B`, con reinicialización de embeddings y reinicio del optimizador en la transición. El 5 % del cómputo total (`alpha_ppt = 0.05`) se reserva a esa segunda fase, y el entrenamiento consume 9,50e17 FLOPs en 320,9 segundos.

Se trata de un modelo base (sin SFT ni RLHF declarados), licenciado bajo Apache 2.0, publicado en formato PyTorch crudo y con cero descargas en el momento de redactar esta ficha. Es un objeto de estudio para reproducibilidad y ablaciones, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (`nanochat_gpt`), 20 capas, `n_embd` = 1280, 10 cabezas de atencion, `n_kv_head` = 10 |
| Parametros totales | No declarados en la model card. La configuracion (20 capas, 1280 de embedding, vocabulario de 65 536) implica un orden de magnitud de ~4,8e8 parametros; el nombre del repositorio menciona "100M" sin aclarar si se refiere al modelo o al presupuesto de computo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (`sequence_len` identico en ambas fases) |
| Tipos de cuantizacion | No disponible: solo se publican pesos en `.pt`, sin versiones GGUF, AWQ, GPTQ ni safetensors cuantizados |
| Idiomas soportados | No disponible. Los corpus declarados (FineWeb y, para evaluacion auxiliar, C4) son en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` (`model_001008.pt`) mas `meta_001008.json`, `config_001008.json` y `rng_001008.pt`; repositorio de 4,9 GB, sin safetensors ni GGUF |
| Vocabulario (fase 1 / fase 2) | 65 536 tokens / 1028 tokens (`ppt_same_vocab_as_pt: false`) |
| Paso del checkpoint | 1008 (`num_iterations` configurado: 1000) |
| Optimizador | AdamW con schedule trapezoidal: `matrix_lr` 0.03, `embedding_lr` 0.3, `unembedding_lr` 0.004, `weight_decay` 0.0 |
| Libreria | `nanochat` |

## Arquitectura y entrenamiento

El modelo sigue el patron de nanochat: un transformer decoder-only con atención multi-cabeza estándar (10 cabezas sobre 1280 dimensiones, es decir, dimensión de cabeza 128) y sin atención por consultas agrupadas, ya que el número de cabezas de clave y valor equivale al de consultas. El entrenamiento se divide en dos etapas con vocabularios distintos: una primera fase sobre `fineweb-nanochatbpe-100M` con el vocabulario BPE de nanochat (65 536 entradas, con `pad_vocab` al mismo valor) y una segunda fase denominada "ppt" sobre `declref-01-seq_len_2048-2B`, con un vocabulario propio de solo 1028 tokens. En la transición se reinicializan los embeddings (`reinit_embed_at_transition: true`) y se reinicia el estado del optimizador (`reset_optimizer_at_transition: true`), sin coincidencia de momentos (`moment_match_embed_reinit: false`).

El presupuesto de cómputo está fijado en `target_flops = 1e18`, con `alpha_ppt = 0.05`, esto es, un 5 % del cálculo asignado a la segunda fase. El schedule de learning rate es trapezoidal en ambas etapas, con `warmup_ratio` 0.0, `warmdown_ratio` 0.4 y fracción final 0.0; el `ppt_lr` específico es 3e-5. Se aplica recorte de gradiente de 1.0, `ema_beta` de 0.0 y batch de dispositivo 32 con 1 paso de acumulación (2 en la fase ppt). No se declara ningún ajuste por instrucciones (SFT, RLHF o DPO) ni innovaciones de decodificación (atención lineal, decodificación especulativa, etc.).

El resultado declarado es `smooth_train_loss` = 3,2457 y `min_objective` = 1,0710, con 9,5037e17 FLOPs consumidos a 3 596 615 680 FLOPs por token y 320,89 segundos de entrenamiento sobre hardware con un pico declarado de 2250 TFLOPS. La evaluación se realiza sobre 10 485 760 tokens con un desplazamiento de 2 097 152 tokens y 2 097 152 tokens auxiliares, e incluye una evaluación extra sobre `c4-nanochatbpe-10B`.

## Capacidades

- Generacion de texto autoregresiva en ingles: es la unica capacidad directamente implicada por los datos de entrenamiento declarados (FineWeb, C4).
- Modelado de lenguaje base: no hay evidencia de ajuste por instrucciones, por lo que no cabe esperar comportamiento conversacional fiable.
- Reproducibilidad experimental: el repositorio incluye estado del RNG, configuracion completa y metadatos de entrenamiento, lo que permite replicar el run.
- Tool calling / function calling: no documentado en la informacion disponible.
- Uso como agente o razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; con corpus en ingles, el rendimiento en castellano es previsiblemente muy limitado.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.
- Segunda fase con vocabulario de 1028 tokens: capacidad especializada y muy restringida, sin descripcion funcional en la model card.

## Casos de uso

- Investigacion sobre asignacion de computo entre fases de entrenamiento: el checkpoint es una celda concreta de un barrido compute-matched a 1e18 FLOPs con `alpha_ppt` = 0.05, pensado para compararse con otras celdas del mismo grupo (`1e18_ppt0.05`) y determinar cuanta capacidad conviene reservar a una segunda fase.
- Estudio de transicion de vocabulario: permite analizar el efecto de reinicializar embeddings y optimizador al pasar de un vocabulario de 65 536 tokens a otro de 1028, un escenario poco habitual en la literatura abierta.
- Ablaciones de schedules de learning rate: el uso de un schedule trapezoidal con 40 % de warmdown y learning rates diferenciados por matriz, embedding y unembedding permite aislar el efecto de cada grupo de parametros.
- Reproduccion de la pila nanochat: al conservarse el estado del RNG y la configuracion exacta, sirve como punto de partida verificado para replicar el pipeline completo en una maquina propia.
- Punto de partida para ajuste supervisado: sobre un modelo de este tamano es viable ejecutar SFT en una unica GPU consumer, aunque la model card no documenta ningun ajuste posterior ni su calidad resultante.
- Prototipado y docencia: un modelo de este orden de magnitud (entorno a 4,8e8 parametros segun la configuracion) se puede cargar y ejecutar en GPUs de gama media, lo que lo hace util para ilustrar el ciclo completo de entrenamiento de un LLM.
- Evaluacion de tokenizadores BPE: la existencia de dos vocabularios distintos en el mismo run permite estudiar el impacto de la granularidad del vocabulario en la perdida por token y en el coste de computo.
- Comparacion de metricas de eficiencia: los valores declarados de FLOPs por token (3 596 615 680) y de tiempo de entrenamiento (320,89 s) permiten contrastar la eficiencia medida frente a la teorica en distintos aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, ARC ni de ninguna otra evaluacion estandar, ni en la model card ni en los resultados de la busqueda web. Las unicas metricas publicadas son las de entrenamiento:

| Metrica | Valor |
|---|---|
| Paso (`step`) | 1008 |
| `smooth_train_loss` | 3,2457327842712402 |
| `min_objective` | 1,070980430541997 |
| FLOPs usados | 9,503738705844634e17 |
| FLOPs por token | 3 596 615 680 |
| Tiempo total de entrenamiento (s) | 320,88806438446045 |
| Objetivo de FLOPs | 1e18 |
| Tokens de evaluacion | 10 485 760 (+ 2 097 152 auxiliares) |

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de la configuracion (entorno a 4,8e8 parametros), unas 2 GB en fp32, en torno a 1 GB en bf16/fp16 y menos de 0,5 GB en int8; son estimaciones derivadas de la configuracion, no cifras publicadas por el autor.
- Cache KV: con 2048 tokens de contexto, 20 capas y 10 cabezas de clave/valor de dimension 128, la cache en fp16 ocupa aproximadamente 0,2 GB por secuencia.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica; el entrenamiento declarado se realizo sobre hardware con un pico de 2250 TFLOPS, coherente con aceleradores de centro de datos de ultima generacion.
- Cabe en GPU consumer: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en GPUs integradas con suficiente memoria compartida para cuantizaciones agresivas (no publicadas).
- Opciones de despliegue: al publicarse como `state_dict` de PyTorch, requiere la libreria `nanochat` o una conversion previa a safetensors con cabecera compatible. No hay soporte directo declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuyen pesos en GGUF ni un `config.json` de HuggingFace Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a especificaciones y licencia.

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Este checkpoint (nanochat d20, 1e18 FLOPs) | ~4,8e8 (estimado, no declarado) | 2048 | 65 536 (fase 1) / 1028 (fase 2) | Apache 2.0 | No |
| GPT-2 (355M) | 3,55e8 | 1024 | 50 257 | MIT | Si (evaluaciones originales) |
| Pythia-410M | 4,10e8 | 2048 | 50 304 | Apache 2.0 | Si (suite de EleutherAI) |
| Baseline nanochat d20 del repositorio de Karpathy | No disponible | 2048 | 65 536 | MIT (repositorio) | No disponible |

Frente a GPT-2 y Pythia, este checkpoint aporta poco en capacidades pero si en trazabilidad: publica la configuracion completa del run, el estado del RNG y las metricas de un presupuesto de computo fijo, algo que los modelos citados no ofrecen por celda de entrenamiento.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no cabe esperar que siga ordenes ni que mantenga formato conversacional.
- Presupuesto de computo muy reducido (1e18 FLOPs): la `smooth_train_loss` de 3,2457 indica un modelo de baja calidad respecto a cualquier LLM moderno de uso general.
- Ausencia total de benchmarks: no es posible estimar su calidad en tareas reales a partir de la informacion publicada.
- Riesgo de alucinacion alto: en modelos de este tamano y con este nivel de entrenamiento, la generacion de contenido falso y plausible es la norma, no la excepcion.
- Sesgos heredados del corpus: los datos declarados (FineWeb, C4) son rastreos web en ingles con los sesgos demograficos, ideologicos y de calidad propios de ese origen.
- Rendimiento en castellano previsiblemente muy pobre, puesto que no se declara ningun dato de entrenamiento en espanol.
- Ambiguedad sobre el vocabulario final: la segunda fase usa un vocabulario de 1028 tokens y la model card no aclara que cabecera contiene `model_001008.pt`, lo que afecta directamente a la usabilidad del checkpoint.
- Nomenclatura confusa: el nombre del repositorio incluye "100M" y "5pct" sin que la model card explique a que se refiere cada cifra.
- Formato de pesos no estandar: sin safetensors, sin GGUF y sin integracion con HuggingFace Transformers, el coste de integracion en un pipeline de produccion es alto.
- Repositorio sin validacion de la comunidad: cero descargas y cero likes en el momento de redactar la ficha.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se distribuye sin garantias y sin que el autor documente evaluaciones de seguridad, sesgo o toxicidad.
- Fechas declaradas en 2026: el repositorio se creo y actualizo el 2026-09-14 segun los metadatos, dato a tener en cuenta al citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/declref_01_5pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_14-13-12_139362-pt
- Run de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/0w3rqn6a
- Repositorio de nanochat (Karpathy): https://github.com/karpathy/nanochat
- Papers, blogs o demos adicionales: no disponible. Los resultados de la busqueda web no contienen informacion relacionada con este modelo.
