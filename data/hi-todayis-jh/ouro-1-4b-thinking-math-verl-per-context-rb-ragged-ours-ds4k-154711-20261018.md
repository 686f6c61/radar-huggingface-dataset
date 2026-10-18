# hi-todayis-jh/ouro-1.4b-thinking-math-verl-per-context-rb-ragged-ours-ds4k-154711-20261018

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un checkpoint de investigación publicado por el usuario independiente `hi-todayis-jh`: el resultado de un ajuste fino con aprendizaje por refuerzo (GRPO) sobre el modelo base `ByteDance/Ouro-1.4B-Thinking`, un modelo de lenguaje de 1,4 mil millones de parámetros con arquitectura de tipo *looped language model* (reutilización iterativa de capas). El entrenamiento se ha realizado con la librería verl 0.6.1 y una receta GRPO modificada, identificada en el nombre del repositorio como `per_context_rb` en modo `ragged`, orientada a mejorar el razonamiento matemático.

El interés de esta ficha es doble. Por un lado, documenta un artefacto de reproducibilidad: incluye el manifiesto de ejecución, la configuración resuelta de verl, el código del lanzador, el código parcheado del modelo (`modeling_ouro.py`, `configuration_ouro.py`) y las métricas de entrenamiento en W&B. Por otro, ejemplifica una técnica poco habitual: el uso de una política de salida adaptativa (`exit_mode adaptive`, `min_depth 2`) que decide cuántas iteraciones del bloque recurrente aplica en cada paso, lo que convierte al modelo en un sistema de cómputo adaptativo en inferencia.

Es relevante ahora porque combina tres líneas activas de trabajo abierto: modelos con profundidad recurrente (Ouro), RL con verificación para matemáticas (GRPO sobre problemas tipo MATH) y entrenamiento distribuido con FSDP y vLLM asíncrono. Ahora bien, se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y con un tamaño de repositorio reportado de 0.0 GB, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cómputo recurrente por capas (tag `looped-language-model`), política de salida adaptativa (`exit_mode adaptive`, `min_depth 2`) |
| Parametros totales | 1,4 mil millones (según el nombre del modelo y el modelo base `ByteDance/Ouro-1.4B-Thinking`); recuento exacto no disponible en la información proporcionada |
| Parametros activos | No aplica: no se describe como modelo MoE en la información disponible |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible: el repositorio publica pesos en precisión de entrenamiento (FSDP `.pt` y safetensors), sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (el campo de idiomas de la model card está vacío) |
| Licencia | Apache-2.0 |
| Formato de pesos | `global_step_N/actor/model_world_size_W_rank_R.pt` (shards FSDP) + optimizador y estado RNG (`optim_...`, `extra_state_...`) + `data.pt` + marcador `_READY.json`; modelo Hugging Face fusionado en `global_step_N/actor/huggingface/` en safetensors con `config.json`, tokenizer, código de modelado y `policy_config.json` |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo Ouro de ByteDance, etiquetada en el repositorio como *looped language model*: el bloque de capas se reaplica varias veces sobre el mismo estado oculto, de modo que la profundidad efectiva es dinámica y no fija. El checkpoint incorpora además una política de salida (`policy_config.json`) entrenada con `--exit_mode adaptive --min_depth 2`, que decide en cada paso cuántas iteraciones ejecutar. El repositorio incluye la versión parcheada del código de modelado (`modeling_ouro.py`, `configuration_ouro.py`) que el entrenador cargó, por lo que la carga requiere `trust_remote_code=True`. La configuración de despliegue usada en entrenamiento fija `--vllm_gpu_memory_utilization 0.45` y una caché KV de 68 719 476 736 bytes (64 GiB), junto con `--ragged_kv_layout lanes` y `--cache_rule ragged`.

El entrenamiento es un ajuste fino con RL de la receta GRPO de verl 0.6.1 (algoritmo `per_context_rb`, modo `ragged`, 157 pasos de rollout, 1 epoch, job de Slurm 154711 en el nodo `orchard-flame-18`, fecha 2026-10-18). Hiperparámetros declarados: `--learning_rate 1e-6`, `--beta 0.001` (coeficiente KL), `--max_grad_norm 1.0`, `--ppo_micro_batch_size_per_gpu 4`, optimizador `AdamW8bit` con betas `0.9 0.99`, `--gate_learning_rate 2e-4`, `--cost_gradient score` (y `analytic`), `--cost_offset 1024`, `--length_penalty_alpha 0`, `--l1_mode none`, y `--vllm_async_scheduling` para generación asíncrona. Hay una discrepancia documental que conviene señalar: los metadatos de la model card listan el dataset `DigitalLearningGmbH/MATH-lighteval`, mientras que el texto del README indica que el entrenamiento se hizo sobre `deepscaler_preview_common.jsonl`. No se especifican el número total de tokens consumidos, la composición detallada del dataset ni si hubo fases previas de SFT/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, heredados del modelo base `Ouro-1.4B-Thinking` y reforzados con GRPO sobre problemas de competición.
- Modo de razonamiento (`Thinking`): el modelo base está diseñado para producir cadenas de razonamiento antes de la respuesta final.
- Cómputo adaptativo en inferencia: la política de salida permite ajustar el número de iteraciones del bloque recurrente, con un mínimo de 2 (`min_depth 2`).
- Generación de rollouts verificables: el propio repositorio publica el conjunto de rollouts de entrenamiento como dataset independiente, útil para análisis de trazas de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo *thinking* y la recurrencia son afines, pero no hay evidencia publicada.
- Capacidades multilingües: no disponible (campo de idiomas vacío).
- Visión, audio o multimodalidad: no disponible; no se mencionan en la model card.

## Casos de uso

- Reproducción de experimentos de RL para matemáticas: el repositorio incluye `run_manifest.json`, `run_config.json`, `verl_config.yaml`, `launch_code/` y `training_source.tar.gz`, lo que permite reconstruir la ejecución completa de verl 0.6.1 con la receta `per_context_rb` en modo `ragged`.
- Investigación sobre cómputo adaptativo: al exponer `policy_config.json` y una política de salida con `min_depth 2`, sirve para estudiar la relación entre número de iteraciones recurrentes, coste de inferencia y precisión en problemas matemáticos.
- Generación de datos sintéticos de razonamiento: el checkpoint puede producir trazas de solución para problemas tipo MATH que después se filtran por respuesta final y se usan para destilar modelos más pequeños.
- Análisis de recetas de RL: comparar `per_context_rb`, `cost_gradient score` frente a `analytic`, o `length_penalty_alpha 0` frente a otras configuraciones, usando las métricas registradas en el proyecto W&B `ouro-1.4b-grpo-rltt-math`.
- Tutoría matemática ligera en local: con 1,4B parámetros y cuantización de 8 o 4 bits, el modelo cabe en una GPU de consumo y puede desplegarse para resolver paso a paso ejercicios de álgebra y cálculo en un entorno sin conexión.
- Auditoría de artefactos de entrenamiento: los `records/receipts/` y los logs de archivo permiten verificar la integridad de los ficheros publicados en el commit de archivado, un caso de uso relevante para equipos de reproducibilidad.
- Evaluación de la robustez de checkpoints intermedios: al publicar `global_step_N/` con estado de optimizador y dataloader, se puede reanudar el entrenamiento o comparar el efecto de distintos pasos sobre el razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia métricas de entrenamiento en el proyecto W&B `ouro-1.4b-grpo-rltt-math`, sin cifras de MMLU, GSM8K, MATH, HumanEval ni comparaciones con otros modelos. No se han incluido en esta ficha cifras estimadas para no atribuir al modelo resultados no verificados.

## Requisitos de hardware

- VRAM estimada para los pesos en precisión de entrenamiento (bf16/fp16, 1,4B parámetros): en torno a 2,8 GB solo para pesos; hay que sumar caché KV, activaciones y, si se usa el modo adaptativo, los estados intermedios de las iteraciones recurrentes.
- Cuantización: al no publicarse variantes GGUF/AWQ/GPTQ, los pesos en int8 (aproximadamente 1,4 GB) o int4 (aproximadamente 0,7-0,9 GB) requerirían conversión propia, con el riesgo añadido de que el código de modelado personalizado (`trust_remote_code`) no sea compatible con todos los backends de cuantización.
- GPU de consumo: un modelo de 1,4B en bf16 debería caber con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB; el factor limitante no es la VRAM sino el soporte del código de Ouro en el runtime elegido.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S son sobredimensionadas para la inferencia de un 1,4B, pero son el entorno natural para reproducir el entrenamiento, que en la configuración declarada reserva 64 GiB de caché KV para vLLM.
- Despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` es la vía documentada por el autor; vLLM aparece en la receta de entrenamiento (`--vllm_async_scheduling`, `--vllm_gpu_memory_utilization 0.45`), por lo que es el backend de generación esperado. Soporte en llama.cpp, Ollama o TGI: no disponible / no confirmado.
- Latencia y throughput: no disponibles. Cualquier estimación debe tener en cuenta que el coste por token de un modelo recurrente escala con el número de iteraciones efectivas, no solo con los 1,4B parámetros.

## Comparativa con modelos similares

Los datos de contexto, benchmarks y disponibilidad de las alternativas no figuran en la información proporcionada; la tabla se limita a los campos verificables.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (`ouro-1.4b-thinking-math-...-154711-20261018`) | 1,4B | No disponible | Apache-2.0 | Checkpoint de RL de investigación, 0 descargas, repo de 0.0 GB |
| `ByteDance/Ouro-1.4B-Thinking` (modelo base) | 1,4B | No disponible | No disponible en la información proporcionada | Arquitectura de capas recurrentes; origen del ajuste |
| `Qwen2.5-Math-1.5B` | 1,5B | No disponible | Apache-2.0 | Alternativa común para matemáticas en tamaño similar; sin datos de benchmark en esta consulta |
| `DeepSeek-R1-Distill-Qwen-1.5B` | 1,5B | No disponible | MIT | Destilado de razonamiento sobre Qwen2.5; sin datos de benchmark en esta consulta |
| `Llama-3.2-1B-Instruct` | 1,23B | No disponible | Llama 3.2 Community License | Uso comercial con restricciones adicionales; no especializado en matemáticas |

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo de producción: 0 descargas, 0 likes y un tamaño de repositorio reportado de 0.0 GB, lo que sugiere que los pesos pueden estar en LFS o no estar completamente materializados en la copia consultada.
- Ausencia total de evaluación publicada: no hay benchmarks, ni comparación con el modelo base, ni ablaciones que cuantifiquen la mejora atribuible al RL. No es posible afirmar que este checkpoint sea mejor que `ByteDance/Ouro-1.4B-Thinking` en matemáticas.
- Discrepancia en el dataset: los metadatos citan `DigitalLearningGmbH/MATH-lighteval` y el README cita `deepscaler_preview_common.jsonl`; conviene verificar `run_config.json` antes de reutilizar la receta.
- Dependencia de código remoto: la carga requiere `trust_remote_code=True` y el `modeling_ouro.py` parcheado que incluye el repositorio; esto implica ejecutar código del autor y complica la auditoría de seguridad en entornos corporativos.
- Riesgo de alucinación: inherente a un modelo de 1,4B; en matemáticas puede producir cadenas de razonamiento plausibles con resultados incorrectos, y el RL sobre verificación de respuesta final no garantiza la validez de los pasos intermedios.
- Sesgos e idiomas: el campo de idiomas está vacío y no hay documentación de composición del corpus; se desconoce el comportamiento en castellano y en dominios fuera de matemáticas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base y el código de modelado de terceros pueden arrastrar condiciones adicionales que no se detallan en la model card.
- Idoneidad limitada: un modelo de 1,4B con razonamiento recurrente no es adecuado para tareas de conocimiento amplio, generación de código en producción ni agentes de múltiples pasos sin una evaluación previa específica.
- Coste de inferencia variable: la política de salida adaptativa hace que la latencia dependa de la entrada, lo que dificulta el dimensionamiento de SLA y el cálculo de coste por petición.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-per-context-rb-ragged-ours-ds4k-154711-20261018
- Modelo base `ByteDance/Ouro-1.4B-Thinking`: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de rollouts de entrenamiento: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-per-context-rb-ragged-ours-ds4k-154711-20261018-rollouts
- Dataset citado en los metadatos `DigitalLearningGmbH/MATH-lighteval`: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Librería verl (entrenamiento con GRPO): https://github.com/volcengine/verl
- Métricas de entrenamiento: proyecto W&B `ouro-1.4b-grpo-rltt-math`, run `verl-per_context_rb-ragged-ours-ds4k-154711-20261018` (no se ha podido verificar una URL pública en la información proporcionada)
- Paper, blog o demo oficial: no disponibles en la información proporcionada
