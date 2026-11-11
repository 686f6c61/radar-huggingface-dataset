# nchapman/Qwen3.6-35B-A3B-Heretic-LoRA

## Resumen

Qwen3.6-35B-A3B-Heretic-LoRA es un adaptador LoRA de tipo "abliteration" (eliminacion selectiva del comportamiento de rechazo) creado por el usuario nchapman sobre el checkpoint base Qwen/Qwen3.6-35B-A3B. El adaptador se ha generado con la herramienta Heretic v2.1 aplicando la tecnica Magnitude-Preserving Orthogonal Ablation (MPOA) con rango r=3 sobre 80 proyecciones residuales del modelo base. El resultado es un adaptador BF16 que reduce la tasa de rechazos del modelo base del 99% al 11% en un conjunto de evaluacion de comportamientos daninos, manteniendo una divergencia KL de primer token de 0,2052 nats respecto al modelo original.

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture of Experts (MoE) con 35.000 millones de parametros totales y 3.000 millones activos por token, desarrollado por Alibaba Qwen. El adaptador hereda la licencia Apache 2.0 del modelo base y esta pensado para su uso con vLLM (con `--enable-lora`) o con transformers + peft, incluyendo la posibilidad de activarlo por peticion en un servidor compartido.

La relevancia de esta ficha radica en que documenta un caso de "uncensoring" quirurgico: en lugar de reentrenar o hacer fine-tuning completo, se aplica una ablacion de bajo rango que preserva la magnitud de los pesos y permite seleccionar entre distintos puntos de la frontera de Pareto entre tasa de rechazo y fidelidad al modelo original. Esto es util para investigadores que necesitan estudiar el comportamiento de modelos sin capas de rechazo, pero tambien conlleva riesgos importantes de seguridad y de cumplimiento que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen3.6-35B-A3B; ablacion MPOA r=3 |
| Parametros totales | 35.000 millones (modelo base); adaptador LoRA de bajo rango (no se especifica el numero exacto de parametros del adaptador) |
| Parametros activos | 3.000 millones (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (adaptador); compatible con variantes cuantizadas del base como W4A16-HGPTQ y checkpoints RCO |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre un modelo base de arquitectura transformer con capas de mezcla de expertos (MoE), segun se deduce del nombre Qwen3.6-35B-A3B (35B totales, 3B activos). El adaptador en si es un LoRA de rango 3 generado mediante Heretic v2.1, una herramienta que automatiza la busqueda de direcciones de ablacion. La tecnica aplicada es Magnitude-Preserving Orthogonal Ablation (MPOA): se calcula una descomposicion SVD de rango 3 sobre las activaciones y se proyectan ortogonalmente las direcciones asociadas al comportamiento de rechazo, preservando la magnitud de los pesos originales para minimizar el dano colateral.

El entrenamiento del adaptador se realizo con `train[:400]` para extraccion y `test[:100]` para evaluacion, usando los conjuntos `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`. Se aplico normalizacion de filas "full" y se intervinieron 80 proyecciones residuales: `self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj` y `mlp.shared_expert.down_proj`. El repositorio incluye una frontera de Pareto con nueve checkpoints no dominados que permiten elegir entre menor tasa de rechazo y menor divergencia KL respecto al base.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-35B-A3B, incluyendo generacion de texto, razonamiento y codigo (no se detallan capacidades especificas del base en la informacion disponible).
- Supresion del comportamiento de rechazo: reduce la tasa de rechazos del 99% al 11% en el conjunto de evaluacion `harmful_behaviors` con el checkpoint por defecto.
- Control de fidelidad: los checkpoints de la carpeta `pareto/` permiten seleccionar el equilibrio entre tasa de rechazo (11%-99%) y divergencia KL (0,0386-0,2052 nats).
- Activacion por peticion: en vLLM se puede alternar entre el modelo base y el adaptador en el mismo servidor usando el campo `model` en peticiones OpenAI-compatibles.
- Compatibilidad con variantes cuantizadas: funciona sobre checkpoints W4A16-HGPTQ y RCO ademas del base BF16.
- Tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada (dependen del modelo base, no documentadas aqui).

## Casos de uso

- Investigacion sobre seguridad y alineacion: el adaptador permite estudiar como responde el modelo base sin capas de rechazo, comparando las respuestas con y sin adaptador en el mismo servidor vLLM para aislar el efecto de la ablacion.
- Evaluacion de robustez de filtros: permite generar respuestas que un modelo alineado rechazaria, para probar clasificadores de contenido y sistemas de moderacion en pipelines de produccion.
- Analisis de la frontera de Pareto: los nueve checkpoints permiten medir el coste en fidelidad (KL) de cada reduccion adicional de rechazos, util para papers sobre tecnicas de abliteration.
- Despliegue dual en produccion: con `--enable-lora` y `--max-lora-rank 8`, un mismo servidor vLLM puede servir el modelo base para usuarios generales y el adaptador para entornos de investigacion controlados, seleccionando por peticion.
- Pruebas de red teaming: el adaptador facilita la generacion de prompts adversarios y respuestas no filtradas para auditorias internas de seguridad.
- Estudio de cuantizacion: al ser compatible con W4A16-HGPTQ y RCO, permite analizar si la ablacion se preserva tras cuantizar el modelo base, un punto relevante para despliegues con VRAM limitada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de rechazo del base (test[:100]) | 99/100 (99,0%) |
| Tasa de rechazo del adaptador por defecto | 11/100 (11,0%) |
| Divergencia KL de primer token (harmless_alpaca test[:100]) | 0,2052 nats |
| Checkpoint Pareto con menor rechazo | trial_014: 11/100, KL 0,2052 |
| Checkpoint Pareto con mayor fidelidad | trial_006: 99/100, KL 0,0358 |

Frontera de Pareto completa publicada por el autor:

| Subcarpeta | Trial | Rechazos | Tasa | KL (nats) |
|---|---:|---:|---:|---:|
| pareto/trial_014_ref11_kl0.2052 (raiz por defecto) | 14 | 11/100 | 11,0% | 0,2052 |
| pareto/trial_012_ref19_kl0.1629 | 12 | 19/100 | 19,0% | 0,1629 |
| pareto/trial_011_ref27_kl0.1248 | 11 | 27/100 | 27,0% | 0,1248 |
| pareto/trial_005_ref61_kl0.0839 | 5 | 61/100 | 61,0% | 0,0839 |
| pareto/trial_004_ref76_kl0.0767 | 4 | 76/100 | 76,0% | 0,0767 |
| pareto/trial_002_ref88_kl0.0629 | 2 | 88/100 | 88,0% | 0,0629 |
| pareto/trial_001_ref94_kl0.0498 | 1 | 94/100 | 94,0% | 0,0498 |
| pareto/trial_003_ref97_kl0.0386 | 3 | 97/100 | 97,0% | 0,0386 |
| pareto/trial_006_ref99_kl0.0358 | 6 | 99/100 | 99,0% | 0,0358 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en BF16: aproximadamente 70 GB para 35B parametros (no confirmado en la informacion disponible).
- VRAM estimada con cuantizacion W4A16-HGPTQ: aproximadamente 17,5 GB para los pesos, mas overhead de contexto y cache KV (estimacion, no confirmada).
- El adaptador LoRA en si es de bajo rango (r=3) y ocupa muy poco espacio adicional; el repositorio reporta 0,0 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el base BF16 requiere GPUs de 80 GB (A100, H100) o multiples GPUs; la variante W4A16 podria caber en GPUs consumer de 24 GB (RTX 4090) segun estimacion, pero no esta confirmado por el autor.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 8 --lora-modules uncensored=<repo>`; transformers + peft. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Heretic-LoRA | 35B (3B activos) | no disponible | LoRA de abliteration MPOA r=3 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (base) | 35B (3B activos) | no disponible | Modelo base alineado | Apache 2.0 | Hugging Face |
| nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ | 35B (3B activos) | no disponible | Cuantizacion W4A16 del base | Apache 2.0 | Hugging Face |

No se dispone de informacion sobre otros adaptadores de abliteration comparables ni sobre sus metricas de rechazo y KL en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador elimina parcialmente el comportamiento de rechazo: puede generar contenido danino, ilegal o inseguro. No debe desplegarse en aplicaciones de cara al publico sin moderacion adicional.
- La divergencia KL de 0,2052 nats en el checkpoint por defecto indica un cambio medible en la distribucion de salida respecto al base; puede degradar la calidad en tareas benignas, especialmente con el checkpoint de menor rechazo.
- Los checkpoints de la carpeta `pareto/` con tasas de rechazo altas (94%-99%) son practicamente equivalentes al base y no aportan el efecto de abliteration esperado.
- Sesgos conocidos: no disponible en la informacion proporcionada; hereda los del modelo base.
- Riesgo de alucinacion: no cuantificado; hereda el del modelo base.
- Idiomas soportados: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso del adaptador para generar contenido danino puede incumplir terminos de servicio de plataformas y normativa aplicable (por ejemplo, la Ley de IA de la UE o la Digital Services Act).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-11), por lo que no hay validacion independiente de las metricas.
- La evaluacion se limita a 100 muestras de `harmful_behaviors` y 100 de `harmless_alpaca`; las tasas de rechazo tienen alta varianza con ese tamano de muestra.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante cuantizada mencionada: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
