# akumaburn/Maxwell-V1-Flash-heretic

## Resumen

Maxwell-V1-Flash-heretic es una variante "abliterated" del modelo Maxwell-V1-Flash desarrollado por el Maxwell Team, un Mixture-of-Experts (MoE) de 35B parametros totales con aproximadamente 3B parametros activos. La modificacion, publicada por el usuario akumaburn, elimina deliberadamente la alineacion de seguridad del modelo original mediante ablacion direccional, de modo que el modelo acepta peticiones que la version fuente rechazaria. El modelo base emplea atencion block-sparse (MBSA), hyper-connections y un drafter MTP para decodificacion especulativa.

El modelo se distribuye en BF16 (69 GB, 34.270 tensores) y mantiene intactos la mayoria de componentes del original: solo se modifican las proyecciones de salida de las capas 8 a 44 (`self_attn.o_proj` y las proyecciones `w2` de expertos). El resto de pesos, tokenizador, plantilla de chat y codigo remoto son identicos al modelo fuente. La relevancia de esta ficha es doble: documenta una tecnica de ablacion (Heretic v2.2.0) aplicada a un MoE de gran tamano y sirve como caso de estudio de los riesgos de publicar modelos sin alineacion de seguridad.

La licencia declarada es Apache 2.0, pero el autor etiqueta explicitamente el modelo como "research-only" y advierte que no acepta ninguna responsabilidad por su uso. No se han publicado resultados de benchmarks de tareas para esta variante; la evidencia de fidelidad se limita a metricas de divergencia KL respecto al modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con atencion block-sparse (MBSA), hyper-connections y drafter MTP |
| Parametros totales | 36.810.559.422 (~35B) |
| Parametros activos | ~3B (aproximado, segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (build principal); existe variante SmoothQuant W8A8 INT8 publicada por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (etiquetado research-only por el autor) |
| Formato de pesos | safetensors (BF16), 69 GB, 34.270 tensores |

## Arquitectura y entrenamiento

El modelo base Maxwell-V1-Flash es un MoE de 35B parametros totales con unos 3B activos por token, que combina atencion block-sparse (MBSA), hyper-connections y un drafter MTP (multi-token prediction) para decodificacion especulativa. Esta variante no reentrena nada: parte de los pesos BF16 del modelo fuente y aplica ablacion direccional sobre las direcciones de rechazo.

La ablacion se realizo con Heretic v2.2.0.dev0: 200 ensayos TPE (60 de arranque aleatorio), semilla 42, y ablacion ortogonal preservadora de magnitud (MPOA) sobre `attn.o_proj` (45 modulos) y `mlp.down_proj` (10.797 modulos: todos los expertos enrutados, compartidos y MLP denso `w2`). El LoRA de rango 3 resultante se fusiono en FP32 sobre los pesos BF16. Se selecciono el ensayo 65 (indice de Pareto 4), con 6/100 rechazos por KeywordRate y KL de primer token de 0.2779. Los tensores `expert_bias` del router se mantienen en FP32 bit a bit identicos al original.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`).
- Modo de razonamiento explicito: la plantilla de chat emite `<think>` como parte del prompt de generacion; se puede desactivar con `enable_thinking=False`.
- Razonamiento multi-paso mediante el bloque de pensamiento.
- Capacidad de seguir instrucciones sin filtros de rechazo (abliterated/uncensored).
- Decodificacion especulativa mediante el drafter MTP, que acelera la generacion.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un MoE de 35B sin direcciones de rechazo, comparando sus respuestas con las del modelo fuente y midiendo la divergencia KL publicada (0.171 en WikiText-2).
- Estudio de tecnicas de ablacion: sirve como referencia reproducible de Heretic v2.2.0 sobre un MoE con atencion block-sparse, donde la separacion de la conducta de rechazo es mas dificil que en modelos densos.
- Evaluacion de robustez de filtros: permite a equipos de seguridad probar clasificadores y guardrails frente a un modelo deliberadamente no alineado.
- Generacion de texto creativo sin restricciones: para experimentos de escritura donde el modelo fuente rechazaria ciertos temas, siempre en entornos controlados de investigacion.
- Re-cuantizacion y estudio de fidelidad: el build BF16 esta pensado como base para re-cuantizar (el autor publica una variante W8A8 INT8) y medir el impacto de la cuantizacion sobre la ablacion.
- Despliegue en servidores multi-GPU con vLLM: mediante la imagen del proveedor (`maxwellmodel/vllm-openai:v0.30.0`) con `--tensor-parallel-size 2` o superior, para servir el modelo en pipelines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que los benchmarks del modelo fuente no se reejecutaron por limitaciones de presupuesto en una sola GPU. La evidencia publicada son metricas de fidelidad respecto al modelo fuente:

| Medicion | Media | Mediana | Otros |
|---|---|---|---|
| KL primer token de respuesta, 100 prompts inocuos (`harmless_alpaca` test[:100]), thinking off, vocabulario completo | 0.297 | 0.082 | max 4.12 |
| KL WikiText-2 test, 64 ventanas de 512 tokens, 32.768 posiciones | 0.171 | 0.053 | acuerdo top-1 84.2% |

Frente de Pareto de ablacion (KeywordRate de rechazos / KL de primer token):

| Ensayo | Indice Pareto | Rechazos | KL |
|---|---|---|---|
| 112 | 0 | 1/100 | 0.4638 |
| 188 | 3 | 5/100 | 0.3094 |
| 65 (seleccionado) | 4 | 6/100 | 0.2779 |
| 182 | 5 | 9/100 | 0.2355 |
| 41 | 6 | 18/100 | 0.1534 |
| 160 | 10 | 46/100 | 0.0754 |

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan 69 GB, por lo que no caben en una GPU de 64 GB; se requiere tensor parallelism de al menos 2 GPUs.
- GPUs recomendadas: 2x A100 80 GB, 2x H100 80 GB o configuraciones equivalentes con suficiente memoria agregada. El autor menciona servir en Ampere con la variante W8A8 INT8 (37 GB).
- GPU de consumo: no cabe en ninguna GPU consumer de 24 GB en BF16. La variante W8A8 INT8 (37 GB) tampoco cabe en una RTX 4090 de 24 GB; requeriria al menos 2 GPUs consumer de 24 GB o una RTX 6000 Ada de 48 GB.
- Despliegue: solo mediante la imagen vLLM del proveedor (`maxwellmodel/vllm-openai:v0.30.0`) con `--trust-remote-code`, `--block-size 128`, `--reasoning-parser qwen3` y `--tensor-parallel-size` ajustado. El modelo no esta en Transformers ni vLLM estandar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Maxwell-V1-Flash-heretic | ~35B | ~3B | no disponible | Apache 2.0 (research-only) | HF, vLLM proveedor | Abliterated, sin benchmarks de tareas publicados |
| Maxwell-V1-Flash (fuente) | ~35B | ~3B | no disponible | no disponible | HF | Modelo original alineado, con benchmarks en su model card |
| Modelos MoE abliterated de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No hay alternativas comparables identificadas en la informacion proporcionada |

## Limitaciones y advertencias

- Alineacion de seguridad eliminada deliberadamente: el modelo cumple peticiones dañinas, peligrosas, ilegales o poco eticas que el modelo fuente rechaza, sin moderacion de contenido.
- Etiquetado research-only por el autor, con descargo de responsabilidad explicito y sin garantias.
- Riesgo elevado de alucinacion y de generar contenido dañino; no apto para produccion orientada al publico sin guardrails externos.
- Los benchmarks de tareas del modelo fuente no se han reejecutado; no se reclama que esta variante los preserve.
- Divergencia respecto al modelo fuente: KL de 0.171 en WikiText-2 y 0.297 en primer token, con acuerdo top-1 del 84.2% en WikiText-2.
- Los rechazos residuales (6/100) no corresponden a rechazos genuinos segun el desglose de seguridad del autor.
- Requiere codigo remoto (`--trust-remote-code`) y una imagen vLLM especifica del proveedor, lo que anade superficie de ataque y dependencia de terceros.
- Idiomas soportados y longitud de contexto no documentados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el etiquetado research-only del autor y la ausencia de alineacion hacen desaconsejable ese uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akumaburn/Maxwell-V1-Flash-heretic
- Variante SmoothQuant W8A8 INT8: https://huggingface.co/akumaburn/Maxwell-V1-Flash-heretic-SmoothQuant-W8A8-INT8
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
