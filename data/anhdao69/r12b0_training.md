# anhdao69/R12B0_training

## Resumen

R12B0 es un checkpoint intermedio de entrenamiento (no un modelo final) publicado por el usuario anhdao69 dentro de una ablación denominada S8N recent-window / episodic-bank (R/B). Se trata del estado completo de DeepSpeed ZeRO-2 en la actualización 1.721 de 3.852 (época 0,4468) de un ajuste fino sobre Qwen3.5-4B para navegación visual y lingüística (VLN, Vision-and-Language Navigation) sobre los datasets R2R y English RxR15deg. El propósito del repositorio es permitir continuar el entrenamiento en otro servidor de 4 × H100 80 GB, no servir inferencia.

El modelo parte de la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` de Qwen3.5-4B e incorpora una memoria de ventana episódica (`episodic_window_v1`) que conserva los 12 grupos de observación más recientes (incluido el actual), sin banco episódico (B = 0) y con un guard de K/V de 6.656 tokens. El entrenamiento conjunto cubre 30.815 episodios, con batch global 8 (4 H100 × 1 episodio × acumulación 2), semilla 429, LR 5e-6 con 116 pasos de warmup y decaimiento coseno hasta 0,1, usando ZeRO-2 con DeepSpeed CPU Adam.

Su relevancia es fundamentalmente de reproducibilidad e investigación: el repositorio incluye contratos de reanudación, manifiestos con SHA-256, estados RNG, scheduler y verificación de integridad bit a bit, lo que lo convierte en un artefacto de entrenamiento auditable más que en un modelo desplegable. No hay model card orientada a uso, ni licencia declarada, ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) con memoria de ventana episódica `episodic_window_v1` para VLN |
| Parametros totales | no disponible (modelo base Qwen3.5-4B; el checkpoint no declara recuento propio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de texto; guard de K/V de 6.656 tokens en la memoria episódica |
| Tipos de cuantizacion | no disponible (checkpoint en `pytorch_model.bin` fp; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (entrenado con instrucciones en inglés sobre R2R y RxR15deg) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` + `mp_rank_00_model_states.pt` y 4 shards de optimizador (DeepSpeed ZeRO-2, 4 ranks) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-4B y añade un módulo de memoria de ventana episódica que mantiene los 12 grupos de observación más recientes, incluido el actual, con un guard de K/V de 6.656 tokens y sin banco episódico (B = 0). Esta configuración corresponde al brazo R12B0 de la ablación R/B sobre la receta S8N y R4B0. El entrenamiento es conjunto sobre R2R y English RxR15deg (30.815 episodios), una época de 3.852 actualizaciones de optimizador con batch global 8 (4 H100 × 1 episodio × acumulación 2), semilla 429, LR 5e-6, 116 pasos de warmup y decaimiento coseno hasta 0,1, usando ZeRO-2 con DeepSpeed CPU Adam y pila torch 2.10.0+cu129, Transformers 5.11.0, DeepSpeed 0.16.4, FLA 0.5.2, flash-attn 2.8.3 y triton 3.6.0.

El checkpoint se detuvo limpiamente en la actualización 1.721 (época 0,4468) por petición de checkpoint en el límite de asignación (salida 0, no kill). Incluye `pytorch_model.bin`, `global_step1721/` con `mp_rank_00_model_states.pt` y los 4 shards de optimizador offloadados a CPU, el scheduler de LR, `trainer_state.json` con la posición del sampler, `rng_state_0..3.pth`, `navigation.json`, `resume_contract.json`, tokenizer, processor y `RECOVERY_COMPLETE.json`. La verificación de integridad (`run/meta/checkpoint_integrity.json`) confirma que todos los tensores cargan y son finitos, que los pesos del módulo DeepSpeed son bit a bit iguales a `pytorch_model.bin` y que los contadores de optimizador, scheduler y trainer valen 1.721. La pérdida en la actualización 1.721 fue 0,1248 y la media de las últimas 100, 0,1298; el LR en la parada era 3,245e-6. El pico de GPU reservada fue 73,0 GiB en la prueba de humo más larga de RxR y 66,8 GiB en producción, sin OOM de CUDA; el working set del host alcanzó 299 GiB y la velocidad fue de aproximadamente 11,2 s/actualización en el nodo newton.

## Capacidades

- Navegación visual y lingüística (VLN): el modelo está entrenado para seguir instrucciones en lenguaje natural en entornos visuales, con memoria de las 12 observaciones más recientes.
- Procesamiento multimodal: consume observaciones visuales (frames RGB) junto con instrucciones textuales, a través del processor incluido en el checkpoint.
- Memoria episódica de ventana: mantiene contexto visual reciente mediante `episodic_window_v1` con guard de K/V de 6.656 tokens.
- Entrenamiento conjunto multi-dataset: soporta R2R y English RxR15deg en la misma receta.
- Reanudación determinista: el checkpoint incluye contratos, manifiestos y estados RNG para continuar el entrenamiento de forma reproducible.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, thinking mode, audio ni otras modalidades más allá de la visión para VLN.

## Casos de uso

- Continuación de entrenamiento en otro servidor: el caso de uso principal del repositorio es reanudar las 2.131 actualizaciones restantes en un nodo de 4 × H100 80 GB, usando `tools/prepare_resume.py` para reescribir únicamente el prefijo de rutas de imágenes del manifiesto y `tools/preflight_resume.py` para validar paquetes, hashes del modelo base, configuración resuelta y la reproducción del plan de exposiciones para las 3.852 actualizaciones.
- Investigación en ablaciones de memoria: permite comparar el brazo R12B0 (ventana de 12 grupos, sin banco episódico) con los brazos ya terminados en `anhdao69/stage1_S8N` y con R4B0, aislando el efecto del tamaño de ventana en el rendimiento de VLN.
- Auditoría de reproducibilidad: los ficheros `checkpoint_integrity.json`, `RECOVERY_COMPLETE.json`, `source_manifest.sha256` y el fingerprint independiente de rutas `f11fccea…` permiten verificar que el estado es íntegro y que la secuencia de episodios coincide con el plan de campaña (SHA-256 `7b35ec95…`).
- Validación de infraestructura de entrenamiento: el contrato de reanudación exige exactamente 4 H100 80 GB en un nodo, acumulación 2 y batch global 8, lo que lo hace útil para probar pipelines de ZeRO-2 con optimizador en CPU y offload de estado.
- Estudio de eficiencia de memoria: los datos de pico de GPU (73,0 GiB en la prueba de humo, 66,8 GiB en producción) y de working set del host (299 GiB) sirven para dimensionar nodos y comparar configuraciones de DeepSpeed.
- Base para experimentos posteriores de VLN: al ser un estado intermedio con pérdida 0,1248, puede emplearse como punto de partida para variantes de la receta (por ejemplo, cambios en el guard de K/V o en la ventana episódica) sin reiniciar desde el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento: pérdida 0,1248 en la actualización 1.721, media de las últimas 100 de 0,1298, LR 3,245e-6, 13.768 exposiciones entrenadas (1.721 × 8), pico de GPU reservada de 73,0 GiB en la prueba de humo más larga de RxR y 66,8 GiB en producción, working set del host de 299 GiB y aproximadamente 11,2 s/actualización de cómputo.

## Requisitos de hardware

- Entrenamiento (reanudación): exactamente 4 × H100 80 GB en un solo nodo con `--nproc_per_node=4`; el estado del optimizador está shardeado para 4 ranks y el contrato de datos registra world 4.
- VRAM de entrenamiento: pico reservado de 73,0 GiB en la prueba de humo más larga de RxR y 66,8 GiB en producción hasta la actualización 1.721; sin OOM de CUDA.
- Memoria del host: working set pico de 299 GiB, coherente con el offload del optimizador a CPU (DeepSpeed CPU Adam).
- Inferencia: no se documentan requisitos de VRAM para inferencia; el checkpoint está en `pytorch_model.bin` sin cuantizaciones publicadas.
- GPU de consumo: no hay datos que confirmen que el checkpoint quepa en GPU de consumo; el estado completo incluye shards de optimizador y no está pensado para inferencia.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el artefacto está orientado al trainer de DeepSpeed del repositorio `SimpleMemVLN` (rama `m5_s8n_rb_ablation`, commit `6de4503`).
- Latencia y throughput: aproximadamente 11,2 s/actualización en el nodo newton; se estiman unas 7 h para completar las 2.131 actualizaciones restantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| R12B0 (este) | base Qwen3.5-4B; recuento propio no disponible | guard K/V de 6.656 tokens | Checkpoint intermedio (1.721/3.852) | no disponible | Hugging Face, repo de 71,1 GB |
| R4B0 | base Qwen3.5-4B; recuento propio no disponible | no disponible | Brazo de la misma ablación | no disponible | Referenciado en `anhdao69/M5_S` |
| S8N (stage1_S8N) | base Qwen3.5-4B; recuento propio no disponible | no disponible | Brazo terminado de la ablación | no disponible | `anhdao69/stage1_S8N` |

No se dispone de datos de benchmarks ni de especificaciones completas de los brazos comparables en la información proporcionada, por lo que la comparación se limita a la configuración de la ablación y al estado del checkpoint.

## Limitaciones y advertencias

- No es un modelo final: es un estado intermedio en la actualización 1.721 de 3.852 (época 0,4468), por lo que su calidad de navegación no está validada.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados: el entrenamiento usa instrucciones en inglés sobre R2R y English RxR15deg; no hay evidencia de soporte multilingüe.
- Sin benchmarks publicados: no hay métricas de éxito en VLN (SR, SPL u otras) que permitan evaluar su rendimiento real.
- Restricción de hardware estricta: el estado del optimizador está shardeado para exactamente 4 ranks y el trainer rechaza la reanudación si no coinciden `navigation.json`, `resume_contract.json`, el SHA-256 del manifiesto y los tamaños de `RECOVERY_COMPLETE.json`.
- Dependencia del prefijo de rutas: en otro servidor solo puede cambiar el prefijo de las `rgb_path` del manifiesto, lo que altera su SHA-256; cualquier otro cambio invalida la reanudación.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo en entrenamiento, no se han realizado evaluaciones de seguridad.
- Tamaño del repositorio: 71,1 GB, con descarga de aproximadamente 67 GB según la model card; requiere verificación byte a byte antes de su uso.
- Sin pipeline ni inferencia declarados: no hay `pipeline_tag` ni instrucciones de uso para generación, lo que desaconseja su empleo directo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/anhdao69/R12B0_training
- Brazo terminado de la ablación: https://huggingface.co/anhdao69/stage1_S8N
- Receta base referenciada: https://huggingface.co/anhdao69/M5_S
- Repositorio GitHub (rama de la ablación): https://github.com/anhdao69/SimpleMemVLN/tree/m5_s8n_rb_ablation
- Modelo base Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`): no disponible como enlace directo en la información proporcionada
