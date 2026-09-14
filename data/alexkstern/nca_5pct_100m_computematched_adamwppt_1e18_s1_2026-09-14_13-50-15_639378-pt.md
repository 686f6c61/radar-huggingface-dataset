# alexkstern/nca_5pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_13-50-15_639378-pt

## Resumen

Este repositorio contiene un checkpoint de un modelo de lenguaje base entrenado con la librería nanochat de Andrej Karpathy, publicado por el usuario alexkstern dentro de lo que parece una parrilla de experimentos de recetas de entrenamiento ("cm100M_best_cells_hfpush_v0", caso "case_c", semilla 1). No es un modelo de chat ni un modelo alineado: es el artefacto final de un experimento de investigación sobre cómo repartir un presupuesto fijo de cómputo entre dos fases de preentrenamiento con tokenizadores distintos. La configuración declara una arquitectura transformer decoder-only densa de 20 capas, 10 cabezas de atención, dimensión de modelo 1280 y ventana de contexto de 2048 tokens.

El entrenamiento se divide en una fase PT (preentrenamiento sobre `fineweb-nanochatbpe-100M`, con vocabulario de 65 536 tokens) y una fase PPT (segunda fase sobre `nca-paper-share20-2048`, con vocabulario reducido de 10 004 tokens), a la que se destina el 5 % del cómputo total (`alpha_ppt = 0.05`). En la transición se reinicializan los embeddings y se reinicia el optimizador, coherente con el cambio de vocabulario. El cómputo consumido fue de 9,49·10^17 FLOPs, muy cerca del objetivo de 10^18, lo que sitúa al modelo en la escala típica de los experimentos de nanochat y muy por debajo de los modelos de producción actuales.

Su relevancia es metodológica, no de producto: sirve como referencia reproducible para estudiar recetas compute-matched, el efecto de cambiar de tokenizador a mitad de entrenamiento y el olvido catastrófico entre dominios. El repositorio no incluye resultados de benchmarks estándar, no hay versiones cuantizadas y no se declaran idiomas soportados. El tamaño del repositorio (4,9 GB) y la ausencia de `safetensors` o GGUF lo convierten en un artefacto de investigación más que en un modelo listo para desplegar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (etiqueta `nanochat_gpt`), 20 capas, n_embd 1280, 10 cabezas de atención |
| Parametros totales | No declarado. Estimación propia a partir de la configuración (20 capas, d_model 1280, vocab 65 536, embeddings no atados): ~561 M de parámetros |
| Parametros activos | No aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible. No se publican versiones GGUF, AWQ ni GPTQ; la precisión de almacenamiento de los pesos no se declara en la model card |
| Idiomas soportados | No declarado. El corpus de preentrenamiento (FineWeb) es mayoritariamente en inglés, por lo que el soporte multilingüe es previsiblemente limitado y no está verificado |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` en `.pt`: `model_001007.pt`, `rng_001007.pt`, `meta_001007.json`, `config_001007.json` (no hay safetensors) |
| Vocabulario | 65 536 tokens en la fase PT y 10 004 tokens en la fase PPT (tokenizadores distintos) |
| Checkpoint | Paso 1007 |
| Presupuesto de computo | 9,4943·10^17 FLOPs consumidos (objetivo 10^18); 3,5966·10^9 FLOPs por token |
| Tamaño del repositorio | 4,9 GB |

## Arquitectura y entrenamiento

La model card solo declara los hiperparámetros estructurales: 20 capas, `n_embd` 1280, 10 cabezas de consulta y 10 cabezas de clave/valor (`n_kv_head` 10, es decir, sin reducción efectiva tipo GQA), `sequence_len` 2048 y `vocab_size` 65 536 para el modelo PT y 10 004 para el modelo PPT. Con esos valores, cada bloque ronda los 19,7 M de parámetros y el conjunto embeddings + 20 bloques + cabeza de salida no atada se sitúa en torno a 561 M de parámetros, coherente con el ratio observado entre FLOPs totales y FLOPs por token (3,60·10^9 ≈ 6·N). No se detallan en la ficha el tipo de codificación posicional, las funciones de normalización ni la activación interna; la implementación de referencia es la del repositorio nanochat.

El régimen de entrenamiento está documentado con bastante detalle. Se usó AdamW (el nombre del run incluye `adamwppt`) con programación trapezoidal de learning rate, sin warmup, con un 40 % de decaimiento y lr final 0. Los learning rates son diferenciados: 0,03 para matrices, 0,3 para embeddings y 0,004 para el unembedding, con `weight_decay` 0 y `grad_clip` 1,0. La configuración declara 1000 iteraciones, batch de dispositivo de 32 secuencias (65 536 tokens por paso) y `grad_accum_steps` 1 en la fase declarada, con `ema_beta` 0 (sin media móvil de pesos). En la transición PT→PPT se activan `reinit_embed_at_transition` y `reset_optimizer_at_transition`, y se mantienen vocabularios separados (`ppt_same_vocab_as_pt: false`) y learning rate no unificado. El hardware declara `peak_tflops: 2250`, un valor compatible con aceleradores de centro de datos de generación Blackwell en BF16, aunque la ficha no identifica la GPU. El tiempo total de entrenamiento reportado es 323,83 sin especificar unidades. Los sufijos de los nombres de dataset (`100M`, `share20`, `10B`) no se definen en la documentación, por lo que no se puede afirmar si designan número de tokens o porcentajes de mezcla.

## Capacidades

- Generación de texto autoregresiva en inglés a nivel de modelo base, sin ajuste por instrucciones.
- Modelado de lenguaje y estimación de verosimilitud (perplejidad, pérdida por token) sobre texto en inglés, útil para filtrado o puntuación de corpus.
- Capacidad de continuación de contexto largo dentro de su ventana de 2048 tokens, con caché KV de tamaño moderado.
- Adaptación a texto de tipo académico o científico por efecto de la fase PPT sobre un corpus derivado de un paper ("nca-paper-share20"), aunque no hay evaluación publicada que lo confirme.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes, razonamiento multi-paso ni modos de pensamiento ("thinking").
- No hay capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües: no declaradas; el corpus FineWeb es predominantemente inglés, por lo que el rendimiento en otros idiomas no está verificado.
- No hay alineación de seguridad, RLHF ni DPO documentados en la información disponible.

## Casos de uso

- Reproducción de experimentos compute-matched: el run forma parte de una parrilla ("cm100M_best_cells_hfpush_v0", caso C, semilla 1) con presupuesto fijo de 10^18 FLOPs, por lo que sirve como punto de comparación directo frente a otras celdas de la misma rejilla para medir el efecto de la receta de entrenamiento.
- Estudio del cambio de tokenizador a mitad de entrenamiento: al reinicializar embeddings y optimizador con un vocabulario nuevo de 10 004 tokens, el checkpoint permite analizar cuánto conocimiento se conserva y cuánto se pierde en esta transición.
- Análisis de olvido catastrófico entre dominios: la secuencia FineWeb (general) → corpus tipo paper (especializado) con solo un 5 % del cómputo permite medir la degradación en el dominio original, con `c4-nanochatbpe-10B` como evaluación auxiliar declarada.
- Punto de partida para fine-tuning supervisado o LoRA: el vocabulario reducido de la fase PPT encoge considerablemente la cabeza de salida, lo que abarata el ajuste en dominios cerrados con vocabulario controlado.
- Docencia e investigación en entrenamiento de LLM: con ~9,5·10^17 FLOPs y 1007 pasos registrados, es un caso lo bastante pequeño para reproducirse en un nodo y lo bastante documentado (config y estado de RNG incluidos) para auditar el pipeline.
- Medición de rendimiento de infraestructura: los valores de `flops_per_token` (3,5966·10^9) y `peak_tflops` (2250) permiten calcular MFU y comparar el throughput real de distintas GPU o configuraciones de `torch.compile`.
- Generación de texto base en inglés y prototipado de pipelines de decodificación: al ser un modelo pequeño (~561 M estimados) se puede usar para probar estrategias de muestreo, prompts o sistemas de recuperación antes de escalar a modelos mayores.
- Puntuación y filtrado de datos: el modelo es adecuado como scorer de perplejidad para seleccionar o depurar corpus en inglés en pipelines de curación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. La model card únicamente reporta métricas de entrenamiento y de validación interna:

| Metrica | Valor |
|---|---|
| step | 1007 |
| smooth_train_loss | 3,1080 |
| min_objective | 1,0715 |
| flops_used | 9,4943·10^17 |
| flops_per_token | 3,5966·10^9 |
| total_training_time | 323,83 (unidades no especificadas) |
| Estado de RNG guardado | Sí (`rng_001007.pt`) |

`min_objective` es la métrica objetivo de la librería nanochat en la evaluación de validación; la ficha no especifica su unidad ni el tokenizador con el que se calcula, por lo que no es comparable directamente con perplejidades publicadas de otros modelos. La evaluación auxiliar declarada se realiza sobre `c4-nanochatbpe-10B`, pero no se publican sus resultados numéricos.

## Requisitos de hardware

- VRAM para inferencia: partiendo de la estimación de ~561 M de parámetros, los pesos ocupan aproximadamente 1,1 GB en BF16 y 2,2 GB en FP32; con activaciones y overhead de runtime, el modelo debería caber cómodamente en 4 GB de VRAM.
- Caché KV: con 10 cabezas KV de dimensión 128, 20 capas y 2 bytes por valor, se estiman unos 100 KiB por token, es decir, unos 205 MB para una secuencia completa de 2048 tokens.
- GPU consumer: cabe en cualquier GPU con 8 GB o más, incluida RTX 3060 12 GB, RTX 4060, RTX 4070 y RTX 4090; también debería ejecutarse en CPU con PyTorch, aunque con latencia mucho mayor. Los requisitos concretos no están declarados por el autor.
- GPU de entrenamiento: la configuración declara `peak_tflops: 2250`, valor propio de aceleradores de centro de datos de generación Blackwell en BF16; el acelerador concreto no se identifica.
- Opciones de despliegue: el formato es un `state_dict` de PyTorch, por lo que requiere la librería nanochat o código propio que reconstruya la arquitectura antes de cargar el checkpoint. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni text-generation-inference, y no se publican conversiones a GGUF ni a safetensors.
- Latencia y throughput: no disponibles. Únicamente se conoce el consumo de cómputo por token (3,5966·10^9 FLOPs/token), útil para estimaciones teóricas, pero no hay medidas de latencia ni de tokens por segundo publicadas.

## Comparativa con modelos similares

No existen datos de benchmarks de este checkpoint, por lo que la comparación de rendimiento no puede establecerse. Los datos de los modelos alternativos proceden de sus propias fichas públicas y no de la información proporcionada para este modelo.

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Este checkpoint (nanochat, depth 20) | ~561 M (estimado) | 2048 | 65 536 (PT) / 10 004 (PPT) | Apache 2.0 | No disponible |
| Otros checkpoints de nanochat (misma librería) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Pythia-410M (EleutherAI) | 410 M | 2048 | No disponible | Apache 2.0 | Disponible en su ficha pública |
| SmolLM2-360M (HuggingFace) | ~362 M | 8192 | No disponible | Apache 2.0 | Disponible en su ficha pública |

La diferencia principal frente a esas alternativas no es de tamaño sino de propósito: Pythia y SmolLM2 son modelos base con corpus multilingües o muy filtrados y evaluación pública extensa, mientras que este checkpoint es el resultado de un único experimento de una rejilla, con una semilla, dos tokenizadores y sin evaluación estándar publicada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue órdenes, no mantiene formato de conversación y puede generar texto incoherente o repetitivo si se usa como asistente.
- No hay alineación de seguridad ni RLHF/DPO documentados, por lo que puede reproducir sesgos, estereotipos o contenido tóxico presente en FineWeb y en el corpus de la fase PPT.
- Riesgo alto de alucinación si se usa como fuente de conocimiento factual: es un modelo pequeño y con un presupuesto de cómputo muy limitado.
- Infraentrenamiento severo respecto a las leyes de escala tipo Chinchilla. Con 9,49·10^17 FLOPs y ~561 M de parámetros, se derivan aproximadamente 264 millones de tokens vistos (cálculo propio a partir de `flops_used`/`flops_per_token`, no declarado por el autor), muy por debajo de lo óptimo para ese tamaño.
- Ventana de contexto de solo 2048 tokens, insuficiente para tareas de contexto largo actuales.
- Idiomas: no declarados; el corpus es mayoritariamente inglés, así que el uso en castellano no está soportado ni evaluado.
- Ambigüedad documental sobre el vocabulario activo del checkpoint final: la configuración declara dos vocabularios distintos (65 536 y 10 004) y un reinicializado de embeddings en la transición. Cargar el checkpoint con el tokenizador equivocado produce salidas degeneradas.
- Licencia de los pesos Apache 2.0, pero los términos de los corpus de entrenamiento (FineWeb/Common Crawl y el corpus derivado del paper "nca") no se detallan en la ficha; conviene revisarlos antes de un uso comercial.
- Formato `.pt` basado en pickle: al cargarlo, usar `torch.load` con `weights_only=True` y procedencia de confianza para evitar riesgos de deserialización.
- Es un artefacto de una rejilla de hiperparámetros con una sola semilla (seed 1, `case_c`): no hay estimación de varianza entre semillas.
- El tamaño del repositorio (4,9 GB) incluye ficheros auxiliares (RNG, metadatos, config) además de los pesos, lo que puede confundir al estimar el tamaño real del modelo.
- Sin resultados de benchmarks ni métricas de calidad publicadas, no es posible justificar su uso en producción frente a alternativas evaluadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/nca_5pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_13-50-15_639378-pt
- Perfil del autor: https://huggingface.co/alexkstern
- Run de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/0iu09vh9
- Librería nanochat (Karpathy): https://github.com/karpathy/nanochat
- Corpus de origen de la fase PT, FineWeb (referencia al corpus original; el subconjunto tokenizado `fineweb-nanochatbpe-100M` no se enlaza en la ficha): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Corpus de la evaluación auxiliar, C4 (referencia; el subconjunto `c4-nanochatbpe-10B` no se enlaza en la ficha): https://huggingface.co/datasets/allenai/c4
- Corpus de la fase PPT `nca-paper-share20-2048`: no disponible (no se enlaza en la información proporcionada)
