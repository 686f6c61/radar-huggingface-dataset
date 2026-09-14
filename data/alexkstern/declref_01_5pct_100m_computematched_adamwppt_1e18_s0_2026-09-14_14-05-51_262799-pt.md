# alexkstern/declref_01_5pct_100M_computematched_adamwppt_1e18_s0_2026-09-14_14-05-51_262799-pt

## Resumen

`alexkstern/declref_01_5pct_100M_computematched_adamwppt_1e18_s0_2026-09-14_14-05-51_262799-pt` es un checkpoint de investigación entrenado con [nanochat](https://github.com/karpathy/nanochat), el stack compacto de preentrenamiento y ajuste de GPT creado por Andrej Karpathy. No es un modelo destinado a producto: es una celda concreta de una rejilla experimental sobre presupuestos de cómputo "compute-matched", con semilla 0, profundidad 20 y un presupuesto objetivo de 1e18 FLOPs (ejecutados: 9,5037e17). El sufijo `-pt` indica que se trata del checkpoint de la fase de preentrenamiento.

La configuración declarada describe un transformer decoder-only de 20 capas, `n_embd` = 1280, 10 cabezas de atención (`n_kv_head` = 10, sin GQA) y una longitud de contexto de 2048 tokens. El vocabulario de la fase de preentrenamiento es de 65.536 tokens BPE (`fineweb-nanochatbpe-100M`), mientras que la fase posterior (`ppt`, con vocabulario propio de 1.028 tokens sobre `declref-01-seq_len_2048-2B`) usa un `alpha_ppt` de 0,05, es decir, el 5 % del cómputo, de ahí el `5pct` del nombre. En la transición entre fases se reinicializan los embeddings y se reinicia el estado del optimizador.

Su relevancia es metodológica, no de capacidades: sirve para estudiar cómo se reparte el cómputo entre preentrenamiento y una segunda fase con vocabulario y datos distintos, comparar optimizadores (AdamW, `adamwppt`) y schedules de learning rate trapezoidales. El repositorio ocupa 4,9 GB y el checkpoint se guardó en el paso 1.008, con un `smooth_train_loss` de 3,3285 y un `min_objective` de 1,0719.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `nanochat_gpt`), 20 capas, `n_embd` = 1280, 10 cabezas de atención (`n_head` = `n_kv_head` = 10, sin agrupación de cabezas), dimensión de cabeza 128 |
| Parámetros totales | no disponible. El nombre del repositorio incluye la cifra "100M", pero la model card no aclara a qué se refiere; con la configuración declarada (20 capas, 1280 de dimensión, vocabulario de 65.536) se trataría de un modelo de varios cientos de millones de parámetros, no de 100 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (`sequence_len`, idéntica en las configuraciones `model_pt` y `model_ppt`) |
| Tipos de cuantización | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | no disponible (el corpus declarado, `fineweb-nanochatbpe-100M`, deriva de FineWeb, mayoritariamente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `state_dict` en `model_001008.pt`; no se publican safetensors ni GGUF |
| Vocabulario | 65.536 tokens en `pt` (`pad_vocab`: 65.536); 1.028 tokens en `ppt`, con vocabulario distinto del de `pt` (`ppt_same_vocab_as_pt`: false) |
| Paso del checkpoint | 1.008 |
| Presupuesto de cómputo | objetivo 1e18 FLOPs; usados 9,5037e17 FLOPs; 3.596.615.680 FLOPs por token |
| Datos de preentrenamiento | `fineweb-nanochatbpe-100M` |
| Datos de la fase `ppt` | `declref-01-seq_len_2048-2B`, con `alpha_ppt` = 0,05 |
| Evaluación auxiliar | `c4-nanochatbpe-10B` |
| Semilla | 0 |
| Optimizador | AdamW (`matrix_lr` 0,03; `embedding_lr` 0,3; `unembedding_lr` 0,004; `weight_decay` 0) con schedule trapezoidal (warmup 0 %, warmdown 40 %, `lr_final_frac` 0) |
| Tamaño del repositorio | 4,9 GB |
| Autor y librería | `alexkstern`; `library_name: nanochat` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only autorregresivo del stack nanochat, con 20 capas, dimensión de modelo de 1280 y 10 cabezas de atención de 128 dimensiones cada una. Al ser `n_kv_head` igual a `n_head`, no se emplea GQA ni MQA. El vocabulario está padding-eado a 65.536 entradas en la fase `pt`. La configuración `ppt` mantiene profundidad, cabezas y dimensión, pero reduce el vocabulario a 1.028 tokens, lo que apunta a un dominio de salida muy restringido y estructurado en la segunda fase; el bloque de optimización define una tasa distinta para `embedding` y `unembedding`, lo que sugiere matrices de entrada y salida separadas.

El entrenamiento se organiza en dos fases dentro del mismo run: preentrenamiento sobre `fineweb-nanochatbpe-100M` y una fase `ppt` sobre `declref-01-seq_len_2048-2B`, a la que se destina el 5 % del cómputo. En la transición se reinicializan los embeddings (`reinit_embed_at_transition`: true) y se reinicia el optimizador (`reset_optimizer_at_transition`: true), con un learning rate propio de 3e-05 para la fase `ppt` y `grad_accum_steps` de 2 (frente a 1 en `pt`). El schedule es trapezoidal en ambas fases, sin warmup y con un 40 % de decaimiento final. Se usan `grad_clip` 1,0, `weight_decay` 0 y `ema_beta` 0. La model card no menciona RLHF, DPO ni ningún otro ajuste por preferencias, ni detalla la composición del dataset `declref-01`; tampoco especifica la precisión numérica del entrenamiento, aunque la configuración activa `compile_model` y declara `peak_tflops` = 2250 como referencia de hardware, sin indicar la GPU concreta.

## Capacidades

- Generación de texto autorregresiva: es un modelo base de preentrenamiento, capaz de continuar texto, pero no se ha publicado ninguna evaluación de la calidad de sus salidas.
- No es un modelo ajustado por instrucciones: la model card no documenta SFT, RLHF ni DPO, por lo que no cabe esperar comportamiento de asistente ni seguimiento fiable de órdenes.
- Tool calling / function calling: no disponible; no se documenta plantilla de chat, tokens especiales de herramienta ni entrenamiento en ese formato.
- Uso como agente y razonamiento multipaso: no disponible.
- Razonamiento y matemáticas: no disponible; no se publican resultados en tareas de este tipo.
- Código: el corpus declarado es una variante BPE de FineWeb (texto web), sin mención a un corpus de código.
- Capacidades multilingües: no documentadas; el vocabulario BPE de 65.536 tokens procede de un corpus mayoritariamente en inglés.
- Visión y audio: no soportadas; no hay torre multimodal ni proyector en la configuración.
- Modo de pensamiento extendido (*thinking*): no disponible.
- Modelo de dos cabezales/vocabularios: existe una configuración `ppt` con vocabulario de 1.028 tokens, probablemente ligada a una tarea estructurada, pero la model card no describe su función ni su formato de E/S.
- Uso previsto realista: checkpoint de investigación para ablaciones y comparaciones con presupuesto de cómputo fijo, no un modelo listo para producción.

## Casos de uso

- Estudios de asignación de cómputo (*compute-matched scaling*): el checkpoint existe precisamente para comparar, a igualdad de FLOPs objetivo (1e18), cuánto conviene gastar en preentrenamiento y cuánto en una segunda fase con datos y vocabulario distintos; se usaría como una celda más de la rejilla junto a otras variantes de `alpha_ppt`, `depth` y semilla.
- Ablaciones de optimizador y schedule: al fijar AdamW con schedule trapezoidal, `grad_clip` 1,0 y semilla 0, sirve como referencia para medir el efecto de cambiar el optimizador de la fase `ppt` o el ratio de decaimiento del learning rate, manteniendo constantes los FLOPs.
- Investigación sobre transiciones de vocabulario y reinicialización de embeddings: la configuración reinicia embeddings y optimizador entre fases y usa un vocabulario `ppt` de 1.028 tokens, lo que permite estudiar el coste y la recuperación de ese cambio de cabezal en modelos pequeños.
- Ajuste fino (*fine-tuning*) de bajo coste para dominios concretos: con la configuración declarada, el modelo cabe en una GPU de gama alta de consumo, por lo que es un punto de partida viable para adaptar a una tarea específica de clasificación o generación en inglés antes de escalar a modelos mayores.
- Prototipado local de generación de texto: se puede cargar en una estación de trabajo con GPU consumer para validar pipelines de tokenización, decodificación y evaluación con 2048 tokens de contexto, sin depender de APIs externas.
- Reproducción y auditoría de infraestructuras de entrenamiento: el run publica configuración completa, métricas y estado del RNG en el repositorio de HuggingFace, lo que permite reproducir el entrenamiento con nanochat y verificar el log del run de W&B asociado.
- Docencia y material didáctico: al ser un stack compacto y con la configuración explícita, resulta útil para explicar en un curso cómo se define un transformer, cómo se calcula el presupuesto de FLOPs por token y cómo se registran métricas de entrenamiento.
- Comparación de tokenizadores: al existir vocabularios distintos para las fases `pt` (65.536) y `ppt` (1.028), permite medir el impacto del tamaño de vocabulario en la pérdida y en el coste por token dentro de un mismo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible: la model card solo incluye métricas internas de entrenamiento, no evaluaciones en tareas como MMLU, HumanEval o GSM8K.

| Métrica (entrenamiento) | Valor |
|---|---|
| `step` | 1.008 |
| `smooth_train_loss` | 3,3284733295440674 |
| `min_objective` | 1,0719450147684886 |
| `flops_used` | 9,503738705844634e17 |
| `flops_per_token` | 3.596.615.680 |
| `total_training_time` | 321,3608376979828 (la model card no especifica la unidad) |
| Presupuesto objetivo | 1e18 FLOPs |

Nota: el repositorio incluye conjuntos de evaluación (`c4-nanochatbpe-10B` como evaluación auxiliar, 10.485.760 tokens de evaluación con un desplazamiento de 2.097.152 tokens), pero no se publican los resultados obtenidos en ellos.

## Requisitos de hardware

- Estimación de VRAM: la model card no declara el número de parámetros, pero con la configuración publicada (20 capas, `n_embd` 1280, vocabulario de 65.536) se estima un modelo del orden de 5-6 × 10^8 parámetros; en ese rango, inferencia en fp32 ≈ 2,2-2,5 GB, en bf16/fp16 ≈ 1,1-1,3 GB, en int8 ≈ 0,6 GB y en int4 ≈ 0,3 GB. Son estimaciones derivadas de la configuración, no datos publicados.
- Caché KV: con 2048 tokens, 20 capas, 10 cabezas KV de 128 dimensiones y K+V en fp16, la caché ocupa aproximadamente 100 KB por token, es decir, unos 205 MB para la ventana completa.
- GPU recomendadas: cualquier GPU con 8-12 GB de VRAM es suficiente para inferencia; se puede ejecutar en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100. El repositorio completo ocupa 4,9 GB, por lo que conviene tener ese espacio en disco además de la VRAM.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas de gama media y alta actuales.
- Opciones de despliegue: el camino documentado es nanochat con PyTorch, cargando el `state_dict` de `model_001008.pt`. No hay soporte publicado para vLLM, TGI, llama.cpp u Ollama, ni conversiones a GGUF o safetensors.
- Latencia y throughput: no disponibles. La configuración de entrenamiento declara `device_batch_size` 32 con `grad_accum_steps` 1 en `pt` y 2 en `ppt` sobre secuencias de 2048 tokens, y `peak_tflops` = 2250 como referencia de cómputo, sin especificar la GPU empleada.
- Configuración de entrenamiento declarada: `sequence_len` 2048, `vocab_size` 65.536, `compile_model` activado, `num_iterations` 1000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Rendimiento |
|---|---|---|---|---|---|
| `declref_01_5pct_100M_...-pt` (este) | no declarados (varios cientos de millones según la configuración) | 2048 | Apache-2.0 | `.pt` en HuggingFace | Sin benchmarks publicados |
| nanochat d20 (base de referencia del propio stack) | ~560 M | 2048 | no confirmada en las fuentes de esta ficha | mediante el repositorio nanochat | No comparable con los datos disponibles |
| Pythia-410M (EleutherAI) | 410 M | 2048 | Apache-2.0 | safetensors y `.pt` | No comparable con los datos disponibles |
| Qwen2.5-0.5B (base) | ~0,49 B | 32.768 | Apache-2.0 | safetensors | No comparable con los datos disponibles |

Los datos de los modelos de comparación proceden de su documentación pública y no se han verificado contra las fuentes de esta ficha. La comparación es estructural (tamaño, contexto, licencia y formato de pesos); no es posible comparar calidad porque este checkpoint no publica ningún resultado de evaluación.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: puede producir texto incoherente o fuera de formato cuando se le presenta como un asistente conversacional.
- Riesgo de alucinación y de reproducir sesgos del corpus de preentrenamiento (FineWeb, texto web mayoritariamente en inglés); no se documenta ningún filtrado adicional ni evaluación de sesgos.
- Ventana de contexto de solo 2048 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o recuperación aumentada con muchos fragmentos.
- Idiomas no documentados: no hay evidencia de calidad fuera del inglés y no se declara ninguna lista de idiomas soportados.
- Ausencia total de benchmarks: no se puede validar su calidad frente a alternativas ni garantizar un nivel mínimo de rendimiento en ninguna tarea.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor no ofrece soporte; conviene revisar también la licencia del código de nanochat que se use para cargarlo.
- Formato de pesos poco estándar: al ser un `state_dict` de PyTorch (`.pt`), requiere el código de nanochat para reconstruir el modelo y no es cargable directamente en servidores de inferencia habituales. Al cargar ficheros `.pt` conviene usar `torch.load` con `weights_only=True` para evitar riesgos de deserialización.
- Falta de documentación sobre los datos: no se describe la composición de `declref-01-seq_len_2048-2B` ni el significado del vocabulario `ppt` de 1.028 tokens, lo que dificulta reproducir la segunda fase.
- Checkpoint de una única semilla (seed 0) y de un único punto de la rejilla experimental: no está pensado para uso en producción ni para extraer conclusiones generales sobre el comportamiento de la familia.
- Repositorio sin descargas ni interacciones y sin revisión por pares: el estado del arte declarado se limita al log del run de W&B del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/declref_01_5pct_100M_computematched_adamwppt_1e18_s0_2026-09-14_14-05-51_262799-pt
- Run de W&B: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/ssrfs35o
- Repositorio nanochat (stack de entrenamiento): https://github.com/karpathy/nanochat
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron únicamente páginas sin relación con el contenido (herramientas de manipulación de PDF en chino y japonés), por lo que no hay papers, blogs ni demos adicionales que enlazar.
