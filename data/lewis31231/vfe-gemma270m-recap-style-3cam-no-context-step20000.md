# Lewis31231/vfe-gemma270m-recap-style-3cam-no-context-step20000

## Resumen

Este repositorio publica un checkpoint completo y reanudable de un estimador de funcion de valor (value function estimator, VFE) de estilo RECAP, entrenado con tres camaras y sin contexto de demostracion. Lo desarrolla el usuario Lewis31231 y se distribuye como estado de entrenamiento de PyTorch que incluye pesos del modelo, estado del optimizador AdamW, cursor exacto de entrenamiento y estados RNG por rango, no como un state dict de solo inferencia. El checkpoint corresponde al paso 20.000.

Tecnicamente, el sistema combina una torre de vision congelada `google/siglip-so400m-patch14-384` con un backbone de lenguaje entrenable `google/gemma-3-270m`, al que se anaden un adaptador visual, un adaptador propioceptivo y una cabeza de valor. Las observaciones provienen de tres camaras (`zed`, `fish0`, `fish1`) y el modelo predice un valor discretizado en 201 bins sobre el intervalo `[-1, 0]` mediante entropia cruzada dura. La secuencia total es de 2.221 tokens, de los cuales 2.187 son visuales.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general, sino un artefacto de investigacion para aprendizaje por imitacion y estimacion de valor en robotica, con resultados de evaluacion publicados sobre 120 trayectorias en los splits seen y unseen del dataset ICL. El repositorio tiene 0 descargas y 0 likes, un tamano de 3,4 GB y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 270M) con torre de vision SigLIP-SO400M congelada, adaptador visual, adaptador propioceptivo y cabeza de valor de 201 bins |
| Parametros totales | 1.147.883.259 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros entrenables | 269.802.441 |
| Parametros congelados | 878.080.818 (diferencia entre totales y entrenables; corresponden a la torre de vision congelada y componentes no entrenables) |
| Longitud de contexto | Secuencia de 2.221 tokens: 3 x 729 (2.187 visuales) + 32 slots de lenguaje + 1 token propioceptivo + 1 token de consulta de valor. Sin contexto de demostracion y sin token de progreso |
| Tipos de cuantizacion | No disponible. El entrenamiento y el checkpoint usan BF16; no se documentan cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch (`.pt`) con estado de modelo, estado AdamW, cursor de entrenamiento y estados RNG por rango; no es un state dict de solo inferencia |
| Tokens visuales por imagen | 729 (rejilla de 27 x 27) |
| Camaras de entrada | 3 (`zed`, `fish0`, `fish1`) |
| Rango de valor | `[-1, 0]`, 201 bins, entropia cruzada dura |
| Tamano del repositorio | 3,4 GB |
| Libreria | pytorch |
| Pipeline declarado | robotics |
| Etiquetas | pytorch, value-function-estimation, robotics, libero, gemma-3, siglip |
| Autor | Lewis31231 |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema es un estimador de valor multimodal, no un modelo generativo de texto. La torre de vision `google/siglip-so400m-patch14-384` permanece congelada y produce 729 tokens visuales por imagen (rejilla 27 x 27), lo que suma 2.187 tokens para las tres camaras. Sobre esa representacion se anaden 32 slots de lenguaje, un token propioceptivo y un token de consulta de valor, hasta una secuencia de 2.221 tokens. El backbone entrenable es `google/gemma-3-270m`, complementado por un adaptador visual, un adaptador propioceptivo y una cabeza de valor que emite una distribucion sobre 201 bins en `[-1, 0]`. El entrenamiento usa entropia cruzada dura, BF16 y gradient checkpointing, sin LoRA, sin embeddings de origen y sin normalizacion de salida de los adaptadores. Esta variante no usa contexto de demostracion ni token de progreso, y no requiere cache precomputada de caracteristicas visuales.

La configuracion registrada en el checkpoint corresponde al paso 20.000 con 2 rangos y batch local 80, es decir, batch global 160. La continuacion documentada anade 10.000 pasos de optimizador (de 20.000 a 30.000) con AdamW, `lr` 1e-5, `weight-decay` 1e-4, `grad-clip-norm` 1.0, 1.000 pasos por epoca, maximo de 30.000 pasos, 10 epocas, modo de muestreo `query_frame_once`, 80 tareas por batch y una muestra por tarea. El reanudado exacto exige la misma longitud de dataset, mismo split, world size de dos rangos, batch local 80 y misma configuracion de muestreo; el trainer rechaza cualquier discrepancia, y existen las alternativas `--allow-inexact-resume` y `--resume-model-only`. El checkpoint guarda exactamente dos estados RNG de rango. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Estimacion de valor escalar discretizada: produce una distribucion sobre 201 bins en el intervalo `[-1, 0]`, entrenada con entropia cruzada dura.
- Percepcion multimodal con tres camaras simultaneas (`zed`, `fish0`, `fish1`) a traves de una torre SigLIP-SO400M congelada.
- Integracion de informacion propioceptiva mediante un token dedicado.
- Estimacion sin contexto: no consume demostraciones ni token de progreso, lo que reduce la longitud de secuencia a 2.221 tokens.
- Reanudado exacto de entrenamiento: restaura modelo, optimizador, cursor de pasos y estados RNG de los dos rangos.
- Evaluacion reproducible: scripts de evaluacion de un solo paso para splits seen y unseen con semilla fija.
- Generacion de texto: no disponible; el backbone Gemma 3 270M se usa como extractor/decodificador interno, pero no se documenta una interfaz de generacion de lenguaje.
- Tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): solo vision de tres camaras y propiocepcion; no se documentan audio ni modos de razonamiento explicito.

## Casos de uso

- Reproduccion de experimentos de investigacion: el repositorio incluye el snapshot de codigo fuente en el commit `286c70e18126e4d4eb12efe6e307899a5ac813d4`, el `SHA256SUMS`, las metricas de entrenamiento y las salidas de evaluacion de referencia, lo que permite verificar bit a bit el estado publicado y repetir la evaluacion seen/unseen con semilla 0.
- Continuacion exacta del entrenamiento: el checkpoint esta disenado para reanudar de 20.000 a 30.000 pasos con la misma configuracion de dos rangos y batch local 80, algo util para laboratorios que quieran extender el run sin perder el estado del optimizador ni el orden de datos.
- Ablaciones de contexto en estimadores de valor: al ser una variante "no context" y sin token de progreso, sirve como referencia frente a variantes con contexto para medir la contribucion de las demostraciones al error de estimacion (MAE y MSE publicados).
- Comparacion de configuraciones de sensores: al fijar tres camaras concretas, permite estudiar el efecto de la configuracion `zed`/`fish0`/`fish1` frente a otras configuraciones en tareas de LIBERO y del dataset ICL.
- Investigacion en aprendizaje por imitacion: el valor estimado sobre `[-1, 0]` puede usarse como senal auxiliar de progreso o de calidad de trayectoria en pipelines de imitation learning con datos de demostracion.
- Evaluacion comparativa de checkpoints intermedios: el repositorio guarda metricas de entrenamiento hasta el paso 20.000, lo que permite analizar la curva de aprendizaje y decidir en que punto conviene detener o reanudar un run.
- Filtrado o ponderacion de datos de demostracion: las estimaciones de valor por trayectoria pueden emplearse para priorizar trayectorias en funcion de su progreso estimado, siempre que se respete el mismo protocolo de preprocesado de targets (`annotation_progress_clamped_v1`).
- Validacion de infraestructura de entrenamiento distribuido: las comprobaciones estrictas de reanudado (longitud de dataset, split, world size, batch local) son utiles para verificar que un cluster de dos GPUs reproduce exactamente el orden de datos y el estado RNG.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la evaluacion de referencia del propio autor, con media no ponderada de metricas por trayectoria, 120 trayectorias por split y batch size 40 por rango:

| Split | Trayectorias | Pearson | Spearman | MAE | MSE |
|---|---:|---:|---:|---:|---:|
| Seen | 120 | 0,640465 | 0,626824 | 0,163582 | 0,059966 |
| Unseen | 120 | 0,642396 | 0,566011 | 0,174360 | 0,058117 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de lenguaje o robotica (MMLU, HumanEval, GSM8K, LIBERO success rate), ni comparaciones con otros modelos bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3 GB solo para pesos en BF16 (1.147.883.259 parametros), mas activaciones de una secuencia de 2.221 tokens. Como estimacion orientativa, entre 4 y 8 GB en BF16 segun el tamano de batch; en int8 bajaría a unos 1,2 GB y en int4 a unos 0,6 GB, aunque no se documentan cuantizaciones oficiales.
- VRAM estimada para entrenamiento o reanudado: pesos en BF16 (unos 2,3 GB), gradientes de los 269.802.441 parametros entrenables (unos 0,54 GB en BF16) y estado AdamW de dos momentos (unos 2,16 GB en FP32), mas activaciones; con gradient checkpointing y batch local 80 el consumo real no se especifica en la informacion disponible.
- GPU recomendadas: no disponible. El autor documenta un entrenamiento con 2 rangos (`--nproc_per_node 2`) y batch local 80 en BF16, pero no indica el modelo de GPU empleado.
- Cabe en GPU de consumo: probablemente si para inferencia en BF16 o cuantizado en tarjetas de 8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090), aunque es una estimacion a partir del numero de parametros y no un dato verificado. Para reproducir el entrenamiento con batch local 80 no hay datos que lo confirmen en GPU de consumo.
- Opciones de despliegue: no aplican las herramientas habituales de servido de LLM (vLLM, llama.cpp, Ollama, TGI) porque el artefacto no es un modelo de generacion de texto con interfaz estandar, sino un checkpoint de estimador de valor. El despliegue requiere el snapshot de codigo VFE incluido (`vfe-source-286c70e1.tar.gz`), el entorno `vfe-train` creado con `scripts/setup_vfe_train.sh` y PyTorch.
- Dependencia de red: aunque los pesos entrenados y congelados estan en el checkpoint, la implementacion construye la arquitectura a traves de Hugging Face, por lo que sigue siendo necesario el acceso de red o en cache a `google/siglip-so400m-patch14-384` y `google/gemma-3-270m`, aceptando sus terminos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Los unicos modelos citados (`google/gemma-3-270m` y `google/siglip-so400m-patch14-384`) son componentes internos de este sistema, no alternativas de la misma categoria. Las metricas Pearson, Spearman, MAE y MSE publicadas solo son interpretables bajo el mismo protocolo de evaluacion (120 trayectorias por split, batch 40 por rango, seleccion de contexto round-robin, split de tareas seen/unseen), por lo que no se pueden contrastar con cifras de otros estimadores de valor sin replicar dicho protocolo.

| Aspecto | Este modelo | Alternativas comparables |
|---|---|---|
| Parametros totales | 1.147.883.259 | No disponible |
| Parametros entrenables | 269.802.441 | No disponible |
| Longitud de secuencia | 2.221 tokens | No disponible |
| Contexto de demostracion | Ninguno | No disponible |
| Licencia | No disponible | No disponible |
| Metricas publicadas | Pearson 0,640 (seen) y 0,642 (unseen) | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no debe esperarse generacion de texto, dialogo, codigo ni capacidades de agente a partir de este checkpoint.
- Licencia no disponible: al no declararse licencia, no puede verificarse si el uso comercial esta permitido. Ademas, el uso de los componentes subyacentes esta sujeto a los terminos de `google/gemma-3-270m` y `google/siglip-so400m-patch14-384`, que deben aceptarse por separado.
- El dataset no se redistribuye: entrenamiento y evaluacion requieren rutas de datos externas concretas (`data/lerobot/adityx23/icl-demo-dataset-keep-true/`, `data/processed/icl_dataset_keep_true_vfe/value_targets/annotation_progress_clamped_v1/` y, para evaluacion, `data/annotations/zs_robodopamine_icl_demo_dataset_continuous/`). Sin ellas el modelo no es utilizable de forma directa.
- Dependencia de red en la carga: la arquitectura se construye a traves de Hugging Face, por lo que se necesita acceso o cache de los modelos upstream aunque los pesos esten en el checkpoint.
- Especificidad de sensores: el modelo esta fijado a tres camaras concretas (`zed`, `fish0`, `fish1`). Cambiar la configuracion de camaras invalida la secuencia de 2.221 tokens esperada.
- Reanudado fragil: la continuacion exacta solo funciona con la misma longitud de dataset, split, world size de dos rangos, batch local 80 y configuracion de muestreo; cualquier cambio obliga a usar `--allow-inexact-resume` o `--resume-model-only` y rompe la reproducibilidad.
- Evaluacion con muestra pequena: los resultados se calculan sobre 120 trayectorias por split, sin intervalos de confianza ni desviaciones tipicas publicadas, y con media no ponderada de metricas por trayectoria. La caida de Spearman en unseen (0,566 frente a 0,627 en seen) sugiere menor fidelidad del ordenamiento fuera de distribucion.
- Rango de valor restringido: la salida esta limitada a `[-1, 0]` con 201 bins; no es una escala de recompensa general y su interpretacion depende de la definicion de progreso del dataset usado.
- Sin contexto ni token de progreso: por diseno, el modelo no puede condicionarse en demostraciones ni en un indicador de progreso, lo que limita su aplicabilidad en escenarios que requieran condicionamiento por tarea.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero existe riesgo de estimaciones de valor mal calibradas en trayectorias fuera de la distribucion de entrenamiento, coherente con las metricas de MAE en torno a 0,16-0,17.
- Sesgos: no disponible. No se documenta analisis de sesgos ni de composicion demografica del dataset.
- Trazabilidad: el propio autor indica que el run de entrenamiento no registro un Git SHA, por lo que el snapshot de codigo publicado es la primera instantanea confirmada que contiene el preset y los campos de firma de reanudado, no necesariamente el codigo exacto usado en el entrenamiento original.
- Documentacion incompleta: el README disponible aparece truncado al final de la seccion de continuacion de entrenamiento y no incluye informacion sobre licencia, idiomas ni requisitos de hardware.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validacion externa ni de uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Lewis31231/vfe-gemma270m-recap-style-3cam-no-context-step20000
- Componente de vision upstream: https://huggingface.co/google/siglip-so400m-patch14-384
- Backbone de lenguaje upstream: https://huggingface.co/google/gemma-3-270m
- Snapshot de codigo fuente incluido en el repositorio: `vfe-source-286c70e1.tar.gz`, commit `286c70e18126e4d4eb12efe6e307899a5ac813d4`
- Hash SHA256 del checkpoint: `875afe626b16133f6a19a71ff5668038d69c2f4e181f12e487db1b927e42c45d`
- Resultados de busqueda web: no se han encontrado enlaces relevantes. La busqueda devolvio unicamente paginas de seguimiento de envios de FedEx, sin ninguna relacion con el modelo. No se dispone de paper, blog, repositorio adicional ni demo asociados al modelo.
