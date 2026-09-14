# alexkstern/nca_1pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_13-28-37_916817-pt

## Resumen

`nca_1pct_100M_computematched_adamwppt_1e18_s1` es un checkpoint de investigación publicado por el usuario `alexkstern` en HuggingFace. Se trata de un modelo de lenguaje autorregresivo entrenado con [nanochat](https://github.com/karpathy/nanochat), el marco minimalista de Andrej Karpathy para reproducir el pipeline completo de un LLM a bajo coste. El modelo sigue la arquitectura `nanochat_gpt` (transformer decoder-only con normalización RMSNorm, RoPE y activación ReLU al cuadrado) con 20 capas, dimensión de embedding 1280 y 10 cabezas de atención, lo que corresponde al perfil "d20" de nanochat.

Su interés no reside en la calidad final del texto, sino en el diseño experimental: es una ejecución *compute-matched* con un presupuesto objetivo de 1e18 FLOPs en la que el 1 % del cómputo (`alpha_ppt: 0.01`) se dedica a una segunda fase sobre un corpus distinto (`nca-paper-share20-2048`) con vocabulario propio de 10.004 tokens, mientras que la fase principal usa un subconjunto de 100 M de tokens de FineWeb tokenizado con el BPE de nanochat (65.536 tokens). En la transición entre fases se reinicializan los embeddings del nuevo vocabulario y se reinicia el optimizador.

El checkpoint publicado corresponde al paso 1.050, con una pérdida de entrenamiento suavizada de 3,256 y 325 segundos de cómputo total en el hardware empleado. Es, por tanto, un artefacto para reproducir ablaciones sobre asignación de cómputo, transición de tokenizer y esquemas de learning rate, no un modelo listo para producto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`nanochat_gpt`, variante d20 de nanochat) |
| Parametros totales | No indicado en la model card. Estimación derivada de la configuración: ~561 M (20 bloques × ~19,66 M + embedding de entrada y unembedding de 65536 × 1280) |
| Parametros activos | No aplica: no es un modelo MoE (atención densa, `n_kv_head` = `n_head` = 10) |
| Longitud de contexto | 2048 tokens (`sequence_len` en ambas fases) |
| Tipos de cuantizacion | No se publican versiones cuantizadas. El repositorio solo contiene un `state_dict` de PyTorch; cualquier cuantización (INT8, INT4, GGUF) requeriría conversión externa |
| Idiomas soportados | No disponible. El corpus de la fase principal es un subconjunto de FineWeb, mayoritariamente en inglés; no hay declaración oficial de cobertura multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | `model_001050.pt` (PyTorch `state_dict`), acompañado de `meta_001050.json`, `config_001050.json` y `rng_001050.pt`. No hay safetensors ni GGUF |

Especificaciones adicionales de la configuración:

| Parametro | Valor |
|---|---|
| Capas (`n_layer`) | 20 |
| Dimension de embedding (`n_embd`) | 1280 |
| Cabezas de atencion (`n_head` / `n_kv_head`) | 10 / 10 |
| Vocabulario fase PT | 65.536 tokens (`fineweb-nanochatbpe-100M`) |
| Vocabulario fase PPT | 10.004 tokens (`nca-paper-share20-2048`), distinto del anterior |
| Tamano del repositorio | 4,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con 20 bloques, 1280 dimensiones de modelo y 10 cabezas de atención de 128 dimensiones cada una. Al tener `n_kv_head` igual a `n_head`, no emplea grouped-query attention; la caché KV es, por tanto, del tamaño completo. El vocabulario de la fase principal es de 65.536 tokens (BPE de nanochat), mientras que la segunda fase emplea un vocabulario reducido de 10.004 tokens, con `reinit_embed_at_transition: true`, `moment_match_embed_reinit: false` y `reset_optimizer_at_transition: true`. Es decir, al cambiar de corpus se descarta el embedding aprendido y se reinicia el estado del optimizador.

El entrenamiento se organiza en dos fases: una fase PT sobre `fineweb-nanochatbpe-100M` y una fase PPT (segunda fase o annealing) sobre `nca-paper-share20-2048`, a la que se asigna el 1 % del cómputo total. El optimizador es AdamW con learning rates diferenciados por tipo de parámetro (matrices 0,03; embedding 0,3; unembedding 0,004), `weight_decay` 0,0 y `grad_clip` 1,0. El scheduler es trapezoidal sin warmup (`lr_warmup_ratio: 0.0`) y con un 40 % de decaimiento final hasta fracción cero. La fase PPT usa un learning rate propio de 3e-05, también trapezoidal y sin warmup, con batch de 32 secuencias y 2 pasos de acumulación de gradiente. La configuración declara `compile_model: true` y un `peak_tflops` de 2250,0 para el cálculo de FLOPs medidos; no se especifica la GPU concreta.

Métricas de entrenamiento declaradas en la model card:

| Metrica | Valor |
|---|---|
| `step` | 1050 |
| `smooth_train_loss` | 3,2561569213867188 |
| `min_objective` | 1,0678640201450305 |
| `flops_used` | 9,89972781858816e+17 |
| `flops_per_token` | 3.596.615.680,0 |
| `total_training_time` | 325,10672903060913 (unidad no especificada; por contexto, segundos) |
| `num_iterations` configurado | 1000 |
| `eval_tokens` | 10.485.760 |
| Evaluación auxiliar | `c4-nanochatbpe-10B` (sin resultados publicados) |

No se declara uso de RLHF, DPO ni ajuste por instrucciones: el checkpoint es un modelo base de predicción del siguiente token.

## Capacidades

- Generación de texto autorregresiva mediante predicción del siguiente token. No hay fases de instrucción ni plantilla de chat documentada.
- Modelado de lenguaje de dominio general a partir de un subconjunto de FineWeb tokenizado con el BPE de nanochat (65.536 tokens).
- Contexto de 2048 tokens, suficiente para documentos cortos, pero insuficiente para contextos largos o conversaciones multi-turno extensas.
- Tool calling / function calling: no soportado. No hay formato de herramientas ni entrenamiento específico.
- Uso como agente o razonamiento multi-paso: no soportado de forma nativa.
- Capacidades multilingües: no documentadas; el corpus principal es mayoritariamente anglófono.
- Capacidades especiales: ninguna. No hay modo de razonamiento explícito, ni visión, ni audio, ni decodificación especulativa declarada.
- Segunda fase con vocabulario propio (10.004 tokens): permite estudiar el comportamiento del modelo tras reinicializar el embedding y cambiar de tokenizer, pero la model card no aclara qué tokenizer debe usarse para inferir sobre el checkpoint publicado.

## Casos de uso

- Reproducción de ablaciones de asignación de cómputo: el checkpoint forma parte de la familia `cm100M_best_cells_hfpush_v0`, cuyo objetivo es comparar configuraciones con el mismo presupuesto de FLOPs (1e18) variando qué fracción se dedica a la segunda fase. Se usaría como punto de comparación frente a otras celdas del mismo grid.
- Estudio de transición de tokenizer: al declarar `ppt_same_vocab_as_pt: false` con reinicialización de embeddings, permite medir empíricamente el coste y la recuperación de calidad al cambiar de vocabulario a mitad de entrenamiento.
- Investigación sobre schedulers y optimizadores: la configuración trapezoidal con ratios de warmup y warmdown concretos, junto con learning rates separados para matriz, embedding y unembedding, lo convierte en un caso de prueba reproducible para estudiar sensibilidad al learning rate.
- Fine-tuning ligero en dominio específico: con ~561 M de parámetros en FP16 (~1,1 GB de pesos) y contexto de 2048, es viable ajustarlo en una GPU de consumo (RTX 3060/4060/4070 con 8-12 GB) para tareas de clasificación o generación de dominio cerrado.
- Destilación y generación de datos sintéticos a pequeña escala: puede usarse como profesor o alumno en experimentos de destilación por su tamaño manejable y su licencia permisiva Apache-2.0.
- Docencia y formación: al derivar del proyecto nanochat, sirve como ejemplo completo de artefacto entrenado (config, metadatos, estado de RNG, métricas de W&B) para explicar el ciclo de vida de un LLM en cursos y talleres.
- Validación de pipelines de datos: la combinación de un corpus tipo FineWeb y un corpus específico con distribución distinta permite probar herramientas de limpieza, deduplicación y mezcla de datasets a escala reducida antes de escalarlas.
- Pruebas de infraestructura de entrenamiento: con 325 segundos de cómputo declarado para 1e18 FLOPs, es un candidato para validar nuevas GPUs, stacks de compilación o estrategias de checkpointing sin incurrir en costes elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente incluye métricas de entrenamiento (pérdida suavizada, `min_objective`, FLOPs y tiempo total) y menciona un conjunto de evaluación auxiliar (`c4-nanochatbpe-10B`) y una evaluación final (`eval_at_end: true`, 10.485.760 tokens de evaluación), pero no se reportan los valores obtenidos. No hay datos de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni perplejidad de validación. No se han incluido cifras estimadas para no fabricar resultados.

## Requisitos de hardware

- VRAM para inferencia (estimada a partir de ~561 M de parámetros): ~2,2 GB en FP32, ~1,1 GB en FP16/BF16 y ~0,6 GB en INT8. Estas cifras son derivadas de la configuración, no publicadas por el autor.
- Caché KV: con 20 capas, 10 cabezas KV de 128 dimensiones y FP16, la caché consume unos 100 KB por token, es decir, ~210 MB para una secuencia completa de 2048 tokens.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia en precisión reducida (GTX 1650 4 GB en adelante, RTX 3060, RTX 4060, RTX 4070, RTX 4090). Las A100 y H100 solo serían necesarias para reentrenar o para servir muchas réplicas en paralelo.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en CPU para inferencia a baja velocidad.
- Opciones de despliegue: el checkpoint es un `state_dict` de PyTorch pensado para cargarse con la librería `nanochat` (el repositorio de Karpathy incluye scripts de generación y de servidor web). No se proporcionan pesos en safetensors ni GGUF, por lo que vLLM, TGI, llama.cpp u Ollama no pueden consumirlo directamente sin convertir el modelo y reproducir su definición de arquitectura.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni número de tokens por segundo.
- Hardware de entrenamiento: la configuración usa `peak_tflops: 2250,0` y `device_batch_size: 32` sin acumulación de gradiente, pero no identifica la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (`nca_1pct_100M_...`) | ~561 M (estimado) | 2048 | Apache-2.0 | Modelo base de investigación, presupuesto de 1e18 FLOPs, sin benchmarks publicados, formato `.pt` |
| nanochat d20 (referencia del proyecto) | ~561 M | 2048 | MIT (repositorio nanochat) | Misma arquitectura y dimensiones; entrenado con un presupuesto de cómputo muy superior dentro del *speedrun* de nanochat |
| GPT-2 medium | 355 M | 1024 | MIT | Referencia histórica de tamaño comparable, entrenada sobre WebText; disponible en safetensors y ampliamente soportada por herramientas de inferencia |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache-2.0 | Modelo base moderno de tamaño similar, entrenado con un volumen de tokens muy superior y con soporte nativo en vLLM, TGI y llama.cpp |

La comparación debe interpretarse con cautela: los tres alternativas han sido entrenadas con presupuestos de tokens muy superiores, mientras que este checkpoint responde a un objetivo de ablation y no a maximizar calidad. No se dispone de métricas comunes de evaluación para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a comandos, no mantiene formato de chat y no debe desplegarse en aplicaciones conversacionales sin un fine-tuning previo.
- Presupuesto de entrenamiento muy reducido: 1e18 FLOPs y un subconjunto de 100 M de tokens de FineWeb están muy por debajo de lo óptimo según las leyes de escalado (Chinchilla), por lo que la calidad del texto generado será limitada y la tasa de alucinación, alta.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en ninguna tarea.
- Contaminación y sesgos del corpus: al derivar de FineWeb, hereda los sesgos, la distribución y el sesgo hacia el inglés de ese corpus. No se documenta ningún proceso de filtrado o mitigación.
- Ambigüedad de tokenizer en inferencia: la configuración declara dos vocabularios distintos (65.536 para PT y 10.004 para PPT) y reinicializa el embedding en la transición. La model card no indica qué tokenizer debe usarse con `model_001050.pt`, lo que puede provocar resultados incorrectos si se carga con el tokenizer equivocado.
- Contexto limitado: 2048 tokens, insuficiente para documentos largos, RAG con muchos fragmentos o conversaciones multi-turno extensas.
- Idiomas: no se declara cobertura multilingüe; el comportamiento en castellano u otras lenguas distintas del inglés no está verificado.
- Formato de pesos propietario: el `state_dict` requiere la librería `nanochat` para cargarse. No hay safetensors ni GGUF, lo que complica su integración con los runners estándar.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero no hay garantías del autor ni documentación sobre la procedencia exacta de los datos de la segunda fase (`nca-paper-share20-2048`), cuya composición no se detalla en la model card.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin historial de versiones ni discusión pública. La única referencia externa es la ejecución de Weights & Biases indicada por el autor.
- Fecha del repositorio: el modelo está fechado en septiembre de 2026, por lo que conviene verificar que la información sigue vigente antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/nca_1pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_13-28-37_916817-pt
- Ejecución de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/es90sn6y
- Repositorio de nanochat (Karpathy): https://github.com/karpathy/nanochat
- Paper o publicación asociada al modelo: no disponible
- Repositorio de código propio del autor: no disponible
- Demo o espacio de inferencia: no disponible
