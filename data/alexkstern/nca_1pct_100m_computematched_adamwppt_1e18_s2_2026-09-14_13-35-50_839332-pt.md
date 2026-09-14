# alexkstern/nca_1pct_100M_computematched_adamwppt_1e18_s2_2026-09-14_13-35-50_839332-pt

## Resumen

Este repositorio contiene un punto de control (checkpoint) de un modelo de lenguaje tipo GPT entrenado con nanochat, el framework de entrenamiento minimalista de Andrej Karpathy. Lo publica el usuario alexkstern bajo licencia Apache 2.0 y forma parte de una familia de experimentos denominada internamente `cm100M_best_cells_hfpush_v0`, con el objetivo declarado de igualar un presupuesto de computo de 1e18 FLOPs. No es un modelo listo para produccion ni un lanzamiento oficial: es el artefacto crudo de un run de investigacion sobre escalado y asignacion de computo entre fases de entrenamiento.

El modelo es un transformer decoder-only de 20 capas, 1280 dimensiones de embedding y 10 cabezas de atencion, con una longitud de secuencia de 2048 tokens y un vocabulario de 65.536 tokens (BPE propio de nanochat). Segun la configuracion publicada, la estimacion de parametros ronda los 561 millones, aunque el autor no declara el recuento en la model card. El entrenamiento combina una fase de preentrenamiento sobre `fineweb-nanochatbpe-100M` con una fase posterior (`ppt`) sobre `nca-paper-share20-2048`, a la que se asigna el 1 % del computo total (`alpha_ppt = 0.01`).

Su relevancia es acotada pero clara: sirve como punto de referencia reproducible para estudiar como repartir un presupuesto fijo de FLOPs entre datos generales de web y datos de dominio (en este caso, articulos cientificos de NCA), y para reproducir el pipeline de nanochat con horquillas de learning rate trapezoidales. Al tener 0 descargas y 0 likes, y apenas 4,9 GB de repositorio, debe tratarse como material de investigacion, no como una dependencia estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo nanochat (atencion multi-cabeza completa, sin GQA: `n_head = n_kv_head = 10`) |
| Parametros totales | Aproximadamente 561 M (estimacion a partir de la configuracion; no declarado por el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (`sequence_len: 2048` en ambas fases) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en formato `.pt`; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el dataset de preentrenamiento es FineWeb, mayoritariamente ingles; no se declara cobertura multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch `state_dict`), compatible con el codigo de nanochat |
| Vocabulario | 65.536 tokens en la fase `pt`; 10.004 tokens en la fase `ppt` (`ppt_same_vocab_as_pt: false`) |
| Dimension del modelo | `n_layer: 20`, `n_embd: 1280`, `n_head: 10`, `n_kv_head: 10` |
| Paso del checkpoint | 1050 |
| Presupuesto de computo | 9,8997e17 FLOPs usados (objetivo: 1e18) |
| Tamano del repositorio | 4,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion multi-cabeza completa (sin agrupacion de cabezas KV), 20 capas, 1280 dimensiones ocultas y ventana de 2048 tokens. El tokenizador es un BPE entrenado especificamente para nanochat (`pt_fineweb-nanochatbpe-100M`), con un vocabulario de 65.536 entradas en la fase de preentrenamiento y un vocabulario reducido de 10.004 entradas en la fase posterior. Segun la configuracion, el modelo supera los 500 M de parametros, con un desglose aproximado de 393 M en los 20 bloques (atencion mas MLP) y unos 168 M en los dos embeddings (entrada y salida, que no estan atados, dado que la configuracion define learning rates distintos para `embedding_lr` y `unembedding_lr`).

El entrenamiento tiene dos fases bien diferenciadas. La primera es un preentrenamiento sobre `fineweb-nanochatbpe-100M`, con `matrix_lr = 0.03`, `embedding_lr = 0.3`, `unembedding_lr = 0.004`, `weight_decay = 0.0` y recorte de gradiente a 1.0. La segunda fase (`ppt`) usa una tasa de aprendizaje de 3e-05, `grad_accum_steps = 2` y un dataset especifico de articulos (`nca-paper-share20-2048`). La programacion de LR es trapezoidal en ambas fases, con `warmup_ratio = 0.0`, `warmdown_ratio = 0.4` y `final_frac = 0.0`. En la transicion entre fases se reinician los embeddings (`reinit_embed_at_transition: true`) y el estado del optimizador (`reset_optimizer_at_transition: true`), una decision de diseno pensada para medir el efecto del cambio de distribucion de datos sin arrastrar momentos del optimizador.

El run esta limitado por computo, no por pasos: `use_measured_flops: true`, `target_flops = 1e18` y 3.596.615.680 FLOPs por token. El resultado publicado es `smooth_train_loss = 3,2269`, `min_objective = 1,0670` y un tiempo total de entrenamiento de 325,29 (la model card no especifica la unidad). No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del preentrenamiento sobre FineWeb.
- Modelado de lenguaje de dominio cientifico: la fase `ppt` sobre `nca-paper-share20-2048` adapta el modelo a texto de articulos, presumiblemente del area de neural cellular automata.
- Razonamiento y conocimiento general: limitado por el reducido presupuesto de computo (1e18 FLOPs) y por un contexto de 2048 tokens; no hay evaluaciones publicadas que lo confirmen.
- Tool calling / function calling: no disponible. No se documenta ni plantilla de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el vocabulario y los datos apuntan a un sesgo fuerte hacia el ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Inferencia base: el modelo puede ejecutarse con el codigo de nanochat cargando el `state_dict`, pero no se distribuye plantilla de prompt, tokenizer empaquetado ni pipeline de `transformers`.

## Casos de uso

- Reproduccion de experimentos de asignacion de computo: el run sirve como celda de comparacion dentro de la matriz `1e18_ppt0.01`, con semilla fija (`seed: 2`) y configuracion versionada, para estudiar como afecta reservar un 1 % del presupuesto a datos de dominio.
- Investigacion sobre cambio de vocabulario y reinicio de embeddings: el checkpoint permite analizar el efecto de `reinit_embed_at_transition` y `reset_optimizer_at_transition` en la perdida final, comparando `min_objective` entre variantes.
- Punto de partida para fine-tuning de dominio: al ser un modelo de ~561 M con licencia Apache 2.0, se puede ajustar en una unica GPU para tareas de clasificacion o generacion sobre corpus cientificos pequenos.
- Generacion de texto tecnico a corto alcance: con 2048 tokens de contexto, es util para completar parrafos, resumir fragmentos cortos o normalizar terminologia dentro de articulos, siempre con validacion humana por el riesgo de alucinacion.
- Banco de pruebas de pipelines de entrenamiento: su integracion nativa con nanochat lo hace adecuado para validar infraestructura (W&B, checkpointing, evaluacion sobre `c4-nanochatbpe-10B`) antes de escalar a modelos mayores.
- Docencia y divulgacion: al ser un modelo pequeno entrenado con un framework legible, sirve para explicar en clase el ciclo completo de preentrenamiento, ajuste de LR trapezoidal y evaluacion de perdida.
- Generacion de codigo o matematicas: no se recomienda; no hay evidencia de datos de codigo ni benchmarks que respalden esa capacidad.
- Asistente conversacional en produccion: no se recomienda en su estado actual, al no existir plantilla de chat, ajuste por instrucciones ni evaluaciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas internas del entrenamiento:

| Metrica | Valor |
|---|---|
| `step` | 1050 |
| `smooth_train_loss` | 3,226855754852295 |
| `min_objective` | 1,0669811378547933 |
| `flops_used` | 9,89972781858816e+17 |
| `flops_per_token` | 3.596.615.680 |
| `total_training_time` | 325,28872418403625 (unidad no especificada) |

No hay resultados de evaluacion comparables con otros modelos publicados en el repositorio.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 1,1 GB solo para pesos (unos 561 M de parametros). En fp32, unos 2,2 GB.
- Cache KV: con 20 capas, 10 cabezas y dimension de cabeza 128, cada token requiere 51.200 valores, es decir, unos 0,1 MB por token en bf16. Para una secuencia completa de 2048 tokens, alrededor de 209 MB por peticion; con lotes de 32 secuencias, unos 6,7 GB adicionales.
- GPU recomendadas: cualquier GPU con 8 GB o mas permite inferencia con lotes pequenos y contexto completo. Una RTX 3060 de 12 GB, una RTX 4070/4090 o una A100/H100 son suficientes; estas ultimas aportan mas margen para lotes grandes y throughput alto.
- Cabe en GPU de consumo: si, con holgura, en cualquier GPU de 8 GB o superior en bf16.
- Opciones de despliegue: el modelo se distribuye como `state_dict` de PyTorch y esta pensado para cargarse con el codigo de nanochat. No se publican pesos GGUF, por lo que llama.cpp u Ollama no son una via directa sin conversion previa. vLLM y TGI no tienen soporte nativo para este formato de checkpoint sin adaptaciones. El entrenamiento se realizo con `compile_model: true` y `peak_tflops: 2250.0` como referencia de hardware.
- Latencia y throughput: no disponibles. El unico dato temporal es `total_training_time = 325,28872418403625`, sin unidad especificada, y no se refiere a inferencia.

## Comparativa con modelos similares

Los datos de los modelos de comparacion provienen de sus respectivas model cards publicas y se incluyen como referencia orientativa; conviene verificarlos en la fuente. Para este modelo, los parametros son una estimacion derivada de la configuracion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (nanochat, d20) | ~561 M (estimado) | 2048 | Apache 2.0 | Repositorio HuggingFace con `state_dict` `.pt`, 0 descargas | Checkpoint de investigacion, sin benchmarks publicos ni plantilla de chat |
| nanochat d20 de referencia | ~561 M | 2048 | MIT (repositorio) | Repositorio de Karpathy con tokenizador y scripts de evaluacion | Punto de comparacion natural: misma arquitectura, distinta asignacion de computo y datos |
| Qwen2.5-0.5B | 0,49 B | 32.768 | Apache 2.0 | Amplia distribucion en HuggingFace, soporte en vLLM y llama.cpp | Contexto 16 veces mayor, ajustado por instrucciones y con benchmarks publicados |
| SmolLM2-360M | 362 M | 8192 | Apache 2.0 | Amplia distribucion, pesos GGUF y soporte en Ollama | Menor en parametros, contexto 4 veces mayor y orientado a uso practico |

Frente a estas alternativas, este checkpoint destaca por su caracter reproducible y su licencia permisiva, pero queda claramente por detras en contexto, soporte de herramientas de despliegue, ajuste por instrucciones y disponibilidad de evaluaciones.

## Limitaciones y advertencias

- Modelo sin ajuste por instrucciones ni RLHF/DPO: no hay evidencia de que siga instrucciones de forma fiable, y no se publica plantilla de chat.
- Riesgo de alucinacion elevado: con 1e18 FLOPs de entrenamiento y ~561 M de parametros, la cantidad de computo por parametro es muy baja en comparacion con modelos contemporaneos de tamano similar.
- Contexto muy corto: 2048 tokens limitan casos de uso con documentos largos, conversaciones multi-turno extensas o razonamiento encadenado.
- Sesgos de datos: el preentrenamiento se basa en FineWeb, con sesgo conocido hacia ingles y hacia contenido occidental; no se documenta ningun filtrado de sesgos ni evaluacion de toxicidad.
- Cobertura idiomatica: no se declara ningun idioma soportado; es previsible un rendimiento pobre en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias, no hay evaluacion de seguridad y el modelo no esta acompanado de documentacion de sesgos ni de datos de entrenamiento completos.
- Dependencia del codigo de nanochat: al no haber pesos GGUF ni integracion con `transformers`, la reproducibilidad depende de un repositorio externo que puede cambiar.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado el mismo dia (14 de septiembre de 2026); es un volcado de experimento, no un modelo mantenido.
- Ambiguedad de configuracion: la model card incluye dos configuraciones (`model_pt` con vocabulario de 65.536 y `model_ppt` con vocabulario de 10.004), por lo que conviene verificar cual corresponde exactamente al `state_dict` publicado antes de reutilizarlo.
- Unidades no especificadas: el tiempo total de entrenamiento se da sin unidad y no se explica a que fase corresponde el paso 1050 (la configuracion fija `num_iterations: 1000`).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/nca_1pct_100M_computematched_adamwppt_1e18_s2_2026-09-14_13-35-50_839332-pt
- Run de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/fh8mrfnr
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los unicos resultados obtenidos corresponden a la plataforma ECCAIRS 2 de notificacion de sucesos de aviacion (aviationreporting.eu, e2.aviationreporting.eu) y no guardan relacion con este repositorio.
