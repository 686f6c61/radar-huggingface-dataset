# alexkstern/kdyck_10pct_100M_computematched_muonppt_1e18_s1_2026-09-14_13-29-38_035067-pt

## Resumen

Este repositorio contiene un checkpoint de investigación publicado por el usuario de HuggingFace `alexkstern`, entrenado con [nanochat](https://github.com/karpathy/nanochat), el framework de entrenamiento de GPT a pequeña escala mantenido por Andrej Karpathy. No es un modelo de propósito general ni un asistente conversacional: es el artefacto final de un brazo experimental de un grid de entrenamientos de presupuesto fijo (1 × 10^18 FLOPs) en el que se destina un 10 % del cómputo a una fase previa sobre datos sintéticos (lenguaje de Dyck con k = 128, vocabulario de 256 símbolos) y el 90 % restante a preentrenamiento sobre texto natural (FineWeb tokenizado con el BPE de nanochat).

El modelo es un transformer decoder-only denso de 22 capas, 11 cabezas de atención y dimensión de modelo 1408, con una longitud de contexto de 2048 tokens en ambas fases. La model card no declara el número de parámetros; la etiqueta `pt_fineweb-nanochatbpe-100M` hace referencia al dataset de preentrenamiento, no al tamaño del modelo, y la aproximación 6N a partir de `flops_per_token` (4.582.014.976) sitúa el modelo en torno a los 764 millones de parámetros, una cifra no confirmada por el autor.

Su relevancia es exclusivamente de investigación: sirve para estudiar si el preentrenamiento sobre datos sintéticos algorítmicos (lenguajes formales) mejora la eficiencia computacional del entrenamiento posterior sobre lenguaje natural. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de reproducibilidad, no una base recomendada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso estilo GPT (implementación nanochat), 22 capas, 11 cabezas de atención y 11 cabezas KV (atención multi-cabeza clásica, sin GQA), dimensión de modelo 1408, dimensión por cabeza 128 |
| Parámetros totales | No declarados. Estimación derivada de `flops_per_token` = 4.582.014.976 y la aproximación 6N: ~764 M (no confirmado por el autor). El sufijo "100M" del nombre procede de la etiqueta del dataset `pt_fineweb-nanochatbpe-100M` |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (idéntica en la fase PPT y en la fase PT) |
| Tipos de cuantización | No disponible. Solo se publica el `state_dict` en precisión de entrenamiento; no hay GGUF, AWQ, GPTQ ni variantes cuantizadas |
| Idiomas soportados | No declarados. El corpus de preentrenamiento (`fineweb-nanochatbpe-100M`, derivado de FineWeb) es mayoritariamente inglés |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `state_dict` (`model_000751.pt`), más `meta_000751.json`, `config_000751.json` y `rng_000751.pt`. No hay safetensors ni compatibilidad con `transformers` de HuggingFace |
| Tamaño de vocabulario | 65536 (fase PT, BPE de nanochat) y 256 (fase PPT, nivel de byte/símbolo); `ppt_same_vocab_as_pt: false` |
| Paso del checkpoint | 751 (el config declara `num_iterations: 1000`) |
| Tamaño del repositorio | 6,1 GB |

## Arquitectura y entrenamiento

La red es un transformer decoder-only denso con 22 capas, `n_embd` = 1408 y 11 cabezas de atención; como `n_kv_head` = `n_head` = 11, no emplea grouped-query attention sino atención multi-cabeza completa con dimensión de cabeza 128. La implementación es la de nanochat (`compile_model: true`, `pad_vocab: 65536`), un GPT de preentrenamiento sin cabezal de instrucciones ni etapas de alineación.

El entrenamiento tiene dos fases con vocabularios distintos. La fase PPT (etiqueta `ppt_dyck-k128-seq_len_2048-1B`, vocabulario de 256) usa secuencias sintéticas de lenguaje de Dyck con k = 128, con batch de dispositivo 32, 4 pasos de acumulación de gradiente y `ppt_lr` = 0,001. La fase PT (etiqueta `pt_fineweb-nanochatbpe-100M`) usa texto natural con vocabulario BPE de 65536, batch 32 y sin acumulación. En la transición se reinicializan los embeddings (`reinit_embed_at_transition: true`) y se resetea el estado del optimizador (`reset_optimizer_at_transition: true`), sin moment matching. La asignación de cómputo es `alpha_ppt: 0.1`, es decir, un 10 % del presupuesto total de 1 × 10^18 FLOPs para la fase sintética y el 90 % restante para FineWeb.

El scheduler es trapezoidal (`lr_kind: trapezoid`) sin warmup (`lr_warmup_ratio: 0.0`) y con un 40 % de decaimiento final (`lr_warmdown_ratio: 0.4`, `lr_final_frac: 0.0`). Las tasas de aprendizaje están separadas por tipo de matriz (0,03 para matrices, 0,3 para embeddings, 0,004 para la cabeza de salida) y la etiqueta `muonppt` del run sugiere el uso del optimizador Muon para matrices junto con Adam para embeddings, la convención habitual de nanochat. No hay RLHF, DPO ni ningún tipo de ajuste por preferencias: es un checkpoint de preentrenamiento puro. La búsqueda web realizada no ha devuelto documentación adicional sobre este experimento ni sobre el significado de la etiqueta `case_c`.

## Capacidades

- Predicción de siguiente token y continuación de texto en inglés: es la única capacidad verificable de un checkpoint de preentrenamiento sin ajuste.
- Aprendizaje en contexto (few-shot prompting): esperable por arquitectura, aunque no hay evaluaciones publicadas que lo confirmen en este checkpoint.
- Procesamiento de estructuras jerárquicas y de emparejamiento de delimitadores: la fase PPT expone al modelo a lenguaje de Dyck con k = 128, pero al reinicializar los embeddings en la transición y dedicar el 90 % del cómputo a texto natural, la retención real de esa habilidad no está medida ni documentada.
- Tool calling / function calling: no soportado. No hay plantilla de chat, ni tokens especiales, ni ajuste para ello.
- Uso como agente o razonamiento multi-paso: no soportado ni evaluado.
- Capacidades multilingües: no declaradas; el corpus subyacente es FineWeb, predominantemente inglés.
- Visión, audio, modo "thinking" o decodificación especulativa: no disponibles; el modelo es solo texto.
- Generación de código, matemáticas o razonamiento formal: no documentadas ni evaluadas.

## Casos de uso

- Reproducción de experimentos de cómputo fijo: el repositorio incluye el config completo, el estado de RNG y las métricas del run, de modo que un investigador puede reanudar o replicar el brazo `seed_1` de este grid con exactitud, algo poco frecuente en checkpoints públicos.
- Estudio de currículos de preentrenamiento: permite comparar el efecto de una fase previa sobre datos sintéticos (Dyck-k128) frente a otros brazos del mismo grid (`cm100M_best_cells_hfpush_v0`), manteniendo constantes los FLOPs totales.
- Investigación sobre transferencia entre lenguajes formales y lenguaje natural: el modelo es un sujeto experimental directo para medir si el entrenamiento con lenguaje de Dyck mejora la pérdida en FineWeb, con `smooth_train_loss` = 4,1875 como referencia del brazo.
- Análisis de representaciones internas (interpretabilidad): 22 capas de 1408 dimensiones y 11 cabezas ofrecen una escala manejable para estudiar circuitos, head pruning o sondas lineales sin necesidad de clústeres grandes.
- Baseline no alineado para estudios de seguridad: al carecer de ajuste por instrucciones, sirve como control en experimentos sobre sesgo, toxicidad o filtración de datos de preentrenamiento.
- Validación de infraestructura de entrenamiento: el run declara `peak_tflops: 2250,0`, `flops_per_token` medido y `flops_used`, lo que permite contrastar la contabilidad de FLOPs y el rendimiento real de un pipeline propio.
- Fine-tuning sobre tareas de estructura secuencial (parseo, emparejamiento de delimitadores, formateo de código): un ajuste supervisado pequeño sobre este checkpoint podría aprovechar la exposición previa a secuencias equilibradas, aunque dicha ventaja no está demostrada.
- Uso como generador de texto base en inglés: técnicamente posible con el código de nanochat, pero con calidad no evaluada y sin ninguna garantía de seguridad o factualidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra evaluación estándar, ni comparaciones con modelos de referencia. El config menciona una evaluación auxiliar sobre `c4-nanochatbpe-10B` (`aux_eval_tokens: 2.097.152`) y una evaluación principal con 10.485.760 tokens, pero los resultados no se publican en el repositorio.

Lo único disponible son las métricas de entrenamiento del paso 751:

| Métrica | Valor |
|---|---|
| `step` | 751 |
| `smooth_train_loss` | 4,1875 (equivale a una perplejidad aproximada de 66 nats, cifra alta y coherente con un presupuesto de solo 1 × 10^18 FLOPs) |
| `min_objective` | 1,0713643270876616 |
| `flops_used` | 9,020619481352765 × 10^17 |
| `flops_per_token` | 4.582.014.976 (valor medido, `use_measured_flops: true`) |
| `total_training_time` | 304,5263602733612 (la model card no especifica la unidad) |

## Requisitos de hardware

- VRAM para inferencia: con ~764 M de parámetros estimados, los pesos ocupan aproximadamente 1,5 GB en bf16/fp16 y unos 3,1 GB en fp32. La caché KV a 2048 tokens con 22 capas y 11 cabezas de 128 dimensiones ronda los 250 MB en fp16. Estimaciones derivadas, no publicadas por el autor.
- GPU recomendadas para entrenamiento: la config declara `peak_tflops: 2250,0`, valor propio de aceleradores de centro de datos en bf16 denso. Con batch de 32 × 2048 tokens por paso y estado de optimizador para ~764 M de parámetros, es razonable esperar GPUs de 40-80 GB (A100, H100) para reproducir el run tal cual.
- GPU de consumo: la inferencia cabe con holgura en cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). El repositorio de 6,1 GB incluye pesos y estado de optimizador; para inferencia solo se necesita `model_000751.pt`.
- Opciones de despliegue: únicamente el propio repositorio nanochat, cargando el `state_dict` de PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI o `transformers`. No se publican archivos de tokenizador, por lo que es necesario reutilizar el tokenizador BPE de nanochat empleado en `fineweb-nanochatbpe`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Este checkpoint (`alexkstern`) | ~764 M (estimado) | 2048 | Apache-2.0 | Solo `state_dict` PyTorch + código nanochat | No disponible |
| GPT-2 large (OpenAI) | 774 M | 1024 | Modified MIT | Safetensors y `transformers`, ecosistema amplio | Benchmarks públicos abundantes |
| Pythia-1B (EleutherAI) | 1,0 B | 2048 | Apache-2.0 | Safetensors y `transformers`, con 154 checkpoints intermedios | Evaluado en el paper de Pythia |
| Llama-3.2-1B (Meta) | 1,24 B | 131.072 | Llama 3.2 Community License | `transformers`, GGUF, vLLM, Ollama | Benchmarks publicados en la model card |

La comparación con GPT-2 large y Pythia-1B es la más pertinente por rango de parámetros y contexto, pero conviene subrayar que ninguno de esos modelos está pensado como sujeto experimental de un estudio de currículo: su utilidad es la de modelos base utilizables, mientras que este checkpoint es un artefacto de un grid concreto. No existe ningún benchmark que permita afirmar que este modelo iguale o supere a los anteriores.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por RLHF, DPO ni ajuste por instrucciones, por lo que puede generar contenido sesgado, tóxico o factualmente falso sin ningún filtro.
- Sesgos de los datos: FineWeb es texto raspado de la web en inglés, con los sesgos demográficos, ideológicos y de representación propios de ese corpus. No se ha publicado ninguna evaluación de sesgo para este checkpoint.
- Riesgo de alucinación alto: es un predictor de siguiente token sin acceso a fuentes ni mecanismo de verificación de hechos.
- Contexto limitado: 2048 tokens, sin extensiones documentadas ni variantes de contexto largo.
- Cobertura idiomática: no declarada; el entrenamiento es esencialmente monolingüe en inglés y no hay ninguna evaluación multilingüe.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero la licencia del corpus de entrenamiento (FineWeb) es independiente y debe verificarse por separado si se redistribuye el modelo o derivados.
- Compatibilidad: no hay safetensors, GGUF ni archivos de tokenizador publicados; sin el código de nanochat y el tokenizador BPE correspondiente, el checkpoint no es directamente cargable con herramientas estándar.
- Checkpoint intermedio: el config declara 1000 iteraciones y el artefacto corresponde al paso 751, por lo que no necesariamente representa el punto final óptimo del run.
- Sin validación externa: 0 descargas, 0 likes y un único `seed` (seed 1). No hay revisión por pares, ni evaluación independiente, ni evidencia de que la fase PPT aporte alguna ventaja.
- No apto para producción: es un artefacto de investigación con pérdida de entrenamiento elevada (`smooth_train_loss` = 4,1875) y sin ninguna evaluación de calidad downstream.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/kdyck_10pct_100M_computematched_muonppt_1e18_s1_2026-09-14_13-29-38_035067-pt
- Run de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/k8rsitog
- Repositorio de nanochat (framework de entrenamiento): https://github.com/karpathy/nanochat
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con este modelo (corresponden a la localidad de Bansko, Bulgaria) y no aportan información técnica adicional. No se han encontrado papers, blogs, repositorios ni demos asociados a este checkpoint.
