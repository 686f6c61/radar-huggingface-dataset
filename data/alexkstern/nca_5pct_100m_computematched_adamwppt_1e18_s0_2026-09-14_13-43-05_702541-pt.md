# alexkstern/nca_5pct_100M_computematched_adamwppt_1e18_s0_2026-09-14_13-43-05_702541-pt

## Resumen

Este repositorio contiene un checkpoint de investigación (paso 1.007) entrenado con nanochat, la implementación de referencia de Karpathy para entrenar modelos tipo GPT a pequeña escala. Lo publica el usuario de HuggingFace alexkstern y forma parte del barrido experimental "cm100M_best_cells_hfpush_v0" (grupo "1e18_ppt0.05"). Se trata de un modelo base (preentrenado), no ajustado por instrucciones, con licencia Apache 2.0 y formato de pesos PyTorch.

El interés del checkpoint no está en sus capacidades de producto, sino en su diseño experimental: el autor iguala el presupuesto de cómputo a 1e18 FLOPs y reserva un 5% de ese presupuesto (alpha_ppt = 0,05) a una segunda fase de continuación de preentrenamiento (PPT) sobre un corpus de dominio llamado "nca-paper-share20-2048", después de una primera fase sobre FineWeb. La particularidad técnica es que ambas fases usan vocabularios distintos (65.536 en PT y 10.004 en PPT), con reinicialización de los embeddings y del optimizador en la transición.

La arquitectura es un transformer decoder-only de 20 capas y dimensión 1.280 con contexto de 2.048 tokens. A partir de la configuración y del dato flops_per_token (3.596.615.680) se deduce un orden de magnitud de ~0,5-0,6 mil millones de parámetros, aunque la model card no declara el recuento exacto y el sufijo "100M" del nombre no se explica en la documentación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion nanochat_gpt, "depth 20") |
| Parametros totales | no declarado en la model card; estimacion de ~0,5-0,6 mil millones a partir de la configuracion (n_embd 1280, 20 capas, vocab 65536) y de flops_per_token (3.596.615.680) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt, state_dict); fichero model_001007.pt |
| Numero de capas | 20 |
| Dimension del modelo (n_embd) | 1280 |
| Cabezas de atencion | 10 cabezas de consulta y 10 de clave/valor (n_head = n_kv_head = 10, sin GQA) |
| Vocabulario | 65.536 en la fase PT; 10.004 en la fase PPT |
| Etapas de entrenamiento | PT sobre fineweb-nanochatbpe-100M + PPT al 5% del computo sobre nca-paper-share20-2048 |
| Tamano del repositorio | 4,9 GB |
| Ficheros publicados | model_001007.pt, meta_001007.json, config_001007.json, rng_001007.pt |

## Arquitectura y entrenamiento

El modelo sigue el esqueleto de nanochat: un transformer decoder-only causal de 20 capas, dimensión de embedding 1.280 y 10 cabezas de atención con el mismo número de cabezas de clave/valor (es decir, atención multi-cabeza clásica, sin agrupación de consultas). La ventana de contexto es de 2.048 tokens en ambas fases y el modelo se compiló para entrenamiento (compile_model = true). El vocabulario de la fase PT es de 65.536 entradas con padding explícito (pad_vocab = 65536).

El entrenamiento consta de dos etapas. La primera (PT) se hace sobre el dataset fineweb-nanochatbpe-100M con el vocabulario de 65.536 tokens. La segunda (PPT, "post-pretraining") consume el 5% del presupuesto total de cómputo sobre el corpus nca-paper-share20-2048, con un vocabulario propio de 10.004 tokens distinto del de PT (ppt_same_vocab_as_pt = false). En la transición se reinicializan los embeddings (reinit_embed_at_transition = true), no se hace coincidencia de momentos (moment_match_embed_reinit = false), se reinicia el optimizador (reset_optimizer_at_transition = true) y no se randomiza la cabeza PT (random_pt_head = false). El optimizador es AdamW con tasas de aprendizaje separadas por grupo: 0,03 para matrices, 0,3 para embeddings y 0,004 para la capa de desembedding, con weight decay 0 y recorte de gradiente de 1,0. El schedule es trapezoidal, sin warmup (lr_warmup_ratio = 0,0) y con un 40% de warmdown (lr_warmdown_ratio = 0,4) hasta una fracción final de 0.

El presupuesto objetivo era 1e18 FLOPs y se consumieron 9,4943e17, con 1.000 iteraciones (el checkpoint es el paso 1.007) y un batch de dispositivo de 32 con 2 pasos de acumulación en la fase PPT. Con flops_per_token = 3.596.615.680, el cómputo total equivale aproximadamente a 264 millones de tokens vistos entre ambas fases (estimación derivada). La model card registra un tiempo total de entrenamiento de 321,38 en unidades no especificadas y un peak_tflops de hardware de 2.250. No se documenta RLHF, DPO ni ajuste por instrucciones en ninguna de las dos etapas.

## Capacidades

- Modelado de lenguaje causal: el checkpoint es un modelo base entrenado para predicción del siguiente token sobre texto; no hay evidencia de ajuste por instrucciones.
- Generación de texto libre y autocompletado dentro de la ventana de 2.048 tokens.
- Especialización parcial en el dominio de la fase PPT: el corpus nca-paper-share20-2048 (documentación técnica tipo artículo) recibe el 5% del cómputo, por lo que puede mostrar una ligera adaptación a ese registro.
- Capacidad multilingüe: no disponible (no se declaran idiomas soportados ni composición lingüística del dataset).
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se menciona ninguna modalidad más allá del texto.
- Uso previsto realista: investigación y reproducción de experimentos, no despliegue de producto.

## Casos de uso

- Reproducción de experimentos de asignación de cómputo: el checkpoint permite replicar el barrido "cm100M_best_cells_hfpush_v0" con semilla 0 y comparar la curva de pérdida y el objetivo mínimo frente a otras celdas del mismo estudio.
- Estudio de continuación de preentrenamiento con cambio de vocabulario: al reinicializar embeddings y reiniciar el optimizador en la transición PT→PPT, este modelo sirve para medir cuánto rendimiento se pierde o se gana frente a mantener el vocabulario original.
- Análisis de mezcla de datos (data mixing): comparar el efecto de dedicar un 5% del cómputo a datos de dominio (share20) frente a invertir todo el presupuesto en FineWeb, usando los FLOPs igualados como control.
- Baseline de bajo coste en pipelines de evaluación: con ~0,5-0,6 mil millones de parámetros, puede actuar como referencia barata en evaluaciones de bits por byte (BPB) o métricas CORE para modelos del mismo rango de tamaño.
- Ajuste fino académico en una sola GPU: el tamaño reducido permite experimentos de SFT, LoRA o DPO en hardware de consumo, útil para estudiar el efecto del ajuste sobre un modelo base poco entrenado.
- Investigación sobre tokenizadores: la convivencia de dos vocabularios (65.536 y 10.004) en el mismo esqueleto facilita comparar el impacto del tamaño de vocabulario en la pérdida y en el coste por token.
- Material didáctico para el pipeline de nanochat: el repositorio incluye metadatos de configuración, estado del RNG y ficheros de entrenamiento que permiten recorrer paso a paso el flujo completo (tokenización, preentrenamiento, PPT y evaluación).
- Generación de texto local en prototipos: con cuantización o en bf16, puede ejecutarse en portátil o en una GPU modesta para demos de generación de texto o autocompletado, siempre asumiendo calidad de modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Paso del checkpoint (step) | 1007 |
| smooth_train_loss | 3,332902431488037 (equivalente a una perplejidad de ~28 en el conjunto de entrenamiento, conversion derivada) |
| min_objective | 1,0716324507362067 (la model card no especifica la unidad ni la definicion exacta de la metrica) |
| flops_used | 9,494310393636454e17 |
| flops_per_token | 3.596.615.680 |
| flops objetivo | 1e18 |
| total_training_time | 321,38293504714966 (unidad no especificada) |
| Tokens de evaluacion | 10.485.760 |
| Dataset de evaluacion auxiliar | c4-nanochatbpe-10B |

No hay comparaciones publicadas contra otros modelos ni resultados en tareas downstream.

## Requisitos de hardware

- VRAM para inferencia: con una estimación de ~0,5-0,6 mil millones de parámetros, los pesos ocupan aproximadamente 2,2 GB en fp32, 1,1 GB en bf16/fp16, unos 0,6 GB en int8 y unos 0,3 GB en int4 (estimaciones derivadas; no hay pesos cuantizados publicados).
- Memoria de caché KV: 2 · 20 capas · 1.280 dimensiones = 51.200 valores por token; en bf16 son unos 100 KB por token, es decir, aproximadamente 210 MB para una secuencia completa de 2.048 tokens.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para inferencia (GTX 1650, RTX 3060, RTX 4060, RTX 4090); para entrenamiento o ajuste fino conviene una RTX 4090/A6000 o superior.
- Entrenamiento a escala: la configuración declara peak_tflops = 2.250, coherente con una GPU de centro de datos de gama alta (A100/H100/B200); la model card no especifica el modelo concreto utilizado.
- Cabe en GPU de consumo: sí, en bf16 y en cuantizaciones de 8 y 4 bits, con margen amplio para el contexto completo.
- Opciones de despliegue: el formato publicado es .pt (state_dict de PyTorch), por lo que la vía natural es PyTorch o el propio runtime de nanochat. No se publican pesos GGUF ni integraciones con llama.cpp, Ollama, vLLM o TGI; usarlos requeriría una conversión no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus respectivas model cards oficiales; conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (alexkstern, nanochat PPT 5%) | ~0,5-0,6 mil millones (estimado) | 2048 | Apache 2.0 | .pt, sin cuantizaciones | Base sin ajuste por instrucciones; 0 descargas y 0 likes en HuggingFace |
| nanochat d20 de referencia (karpathy/nanochat) | no disponible en la informacion proporcionada | 2048 | licencia del checkpoint no disponible (el codigo del repositorio es MIT) | .pt / runtime propio | Misma familia arquitectonica: 20 capas, d_model 1280 |
| Qwen2.5-0.5B | 0,49 mil millones | 32.768 | Apache 2.0 | safetensors, muy desplegado | Muy superior en contexto y en ecosistema de despliegue; incluye variantes ajustadas |
| TinyLlama-1.1B | 1,1 mil millones | 2048 | Apache 2.0 | safetensors, ampliamente soportado | Mas parametros y mas datos de entrenamiento publicos; existe variante chat |

La comparacion de rendimiento no puede completarse: no hay resultados de benchmarks de este checkpoint frente a las alternativas.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineacion: no debe usarse directamente como asistente conversacional sin un ajuste previo.
- No se publican resultados en MMLU, HumanEval, GSM8K ni en metricas CORE, por lo que la calidad real del modelo es desconocida.
- El sufijo "100M" del nombre no se explica en la model card y no coincide con la estimacion de parametros deducible de la configuracion; conviene no interpretarlo como el tamano del modelo.
- La metrica min_objective (1,0716) se reporta sin definir su unidad ni su metodo de calculo, lo que dificulta compararla con otras publicaciones.
- La existencia de dos vocabularios distintos (65.536 y 10.004) complica la carga del checkpoint: es necesario saber que cabeza y que vocabulario corresponden al fichero publicado, algo que la model card no aclara.
- La ventana de contexto es de solo 2.048 tokens, insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- Riesgo elevado de alusion: al tratarse de un modelo pequeno y poco entrenado, la generacion de hechos incorrectos es esperable.
- Sesgos: no se documenta la composicion del dataset ni se realiza ninguna evaluacion de sesgos; FineWeb es un corpus mayoritariamente en ingles, por lo que el comportamiento en castellano u otros idiomas es incierto.
- Idiomas soportados: no disponibles; no hay ninguna garantia de calidad fuera del ingles.
- Licencia Apache 2.0, permisiva para uso comercial, pero el corpus de entrenamiento (FineWeb y el dataset de la fase PPT) puede tener sus propias condiciones que el usuario debe revisar.
- Artefacto de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento declarado ni versiones posteriores.
- El formato .pt limita el despliegue a PyTorch/nanochat; no hay pesos GGUF, safetensors ni integraciones listas para vLLM, TGI, Ollama o llama.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/nca_5pct_100M_computematched_adamwppt_1e18_s0_2026-09-14_13-43-05_702541-pt
- Perfil del autor: https://huggingface.co/alexkstern
- Repositorio nanochat (Karpathy): https://github.com/karpathy/nanochat
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/ct9ce0sx
