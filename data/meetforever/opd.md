# meetforever/OPD

## Resumen

OPD (On-Policy Distillation, destilacion on-policy) es un metodo de entrenamiento publicado en el repositorio de HuggingFace `meetforever/OPD`. No se trata de un modelo fundacional en sentido estricto, sino de un marco de destilacion que entrena un modelo alumno (student) a partir de las senales a nivel de token proporcionadas por un modelo maestro (teacher). El repositorio, de 112 GB, contiene el codigo y los artefactos asociados al metodo, construido sobre las librerias verl (v0.7.0) para el bucle de RL/destilacion y LlamaFactory (v0.9.5) para el ajuste supervisado (SFT).

La relevancia del proyecto radica en que propone una destilacion on-policy basada en recompensas a nivel de token y en estrategias de seleccion Top-K (solo alumno, solo maestro, interseccion, union o diferencia simetrica), en lugar de limitarse a la destilacion clasica de logits. Ademas, el repositorio documenta la reproduccion de variantes como GRPO (RL) y SFT sobre la familia Qwen3, y publica checkpoints derivados como `Qwen3-1.7B-SFT` y `Qwen3-4B-Base-GRPO`.

No se detallan en la informacion disponible ni la arquitectura exacta del modelo subyacente ni el tamano de parametros del propio artefacto `OPD`, por lo que gran parte de la ficha se marca como "no disponible". El autor no ha publicado licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el marco opera sobre modelos transformer de la familia Qwen3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en entrenamiento se usan `MAX_PROMPT_LENGTH=1024` y `MAX_RESP_LENGTH=7168`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio) |

## Arquitectura y entrenamiento

El repositorio implementa un pipeline de destilacion on-policy con recompensas a nivel de token. El estimador de ventaja se fija con `ADV_ESTIMATOR=token_reward_direct` (no modificable si se usa OPD), y el entrenamiento se apoya en dos modelos: el actor o alumno (`ACTOR_MODEL_PATH`) y un modelo maestro de recompensa (`REWARD_MODEL_PATH`) que aporta la senal por token. La generacion controla `N_RESPONSES=4` respuestas por prompt y una longitud maxima de respuesta de 7168 tokens.

Una innovacion destacable es la gestion Top-K de tokens: con `LOG_PROB_TOP_K=16` se retienen los 16 tokens mas probables, y `TOP_K_STRATEGY` permite escoger el conjunto sobre el que se calcula la recompensa (`only_stu`, `only_tch`, `intersection`, `union`, `union-intersection`). El modo de ponderacion de la recompensa (`REWARD_WEIGHT_MODE`) puede basarse en la probabilidad del alumno (`student_p`, por defecto), la del maestro (`teacher_p`) o ninguna (`none`). Para RL se usa GRPO, activable con `ADV_ESTIMATOR=grpo` y `LOG_PROB_TOP_K=0`. El SFT se realiza con LlamaFactory sobre respuestas generadas por el maestro mediante `vllm_rollout.py`, con rejection sampling opcional (`--enable-rejection-sampling true`) y hasta 3 reintentos por slot.

En cuanto a datos, la model card menciona el uso de `OpenThoughts3-1.2M-math`, `DAPO-Math-17K` y `DeepMath` (con un script de deduplicacion contra DAPO-Math-17K para evitar solapamiento). No se especifica el numero total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Entrenamiento por destilacion on-policy de un modelo alumno a partir de un maestro con recompensas a nivel de token.
- Soporte de ajuste supervisado (SFT) y de aprendizaje por refuerzo con GRPO dentro del mismo marco.
- Seleccion configurable de tokens Top-K para el calculo de recompensas, con cinco estrategias distintas.
- Rollout de respuestas del maestro con vLLM, con rejection sampling y reintentos.
- Compatibilidad con modelos "thinking" y "non-thinking" (por ejemplo, `Qwen3-4B (Non-thinking)`, `Qwen3-1.7B (Non-thinking)`), requiriendo `+data.apply_chat_template_kwargs.enable_thinking=False` en los no-thinking.
- Aplicacion demostrada a razonamiento matematico (datasets y checkpoints del dominio matematico).
- Scripts de validacion separados bajo `scripts/val/` para evaluar checkpoints fuera del bucle de entrenamiento.

No se documentan capacidades de vision, audio, tool calling ni function calling.

## Casos de uso

- Investigacion en destilacion de LLM: el marco permite reproducir experimentos de destilacion on-policy comparando estrategias Top-K (`only_stu`, `intersection`, etc.) y modos de ponderacion, con los scripts proporcionados.
- Entrenamiento de modelos de razonamiento matematico: usando `OpenThoughts3-1.2M-math` y `DAPO-Math-17K`, se puede destilar un alumno pequeno (por ejemplo, `Qwen3-1.7B-Base`) a partir de un maestro mayor para tareas de matematicas.
- Ajuste por refuerzo con GRPO: con `ADV_ESTIMATOR=grpo` y `LOG_PROB_TOP_K=0`, el repositorio sirve para reproducir entrenamiento tipo RL sobre modelos base, como en el checkpoint `Qwen3-4B-Base-GRPO`.
- Generacion de datasets de SFT: el script `vllm_rollout.py` permite generar respuestas de un maestro sobre un fichero parquet de prompts, con rejection sampling, para construir datasets de destilacion (ejemplo publicado: `OpenThought3-Qwen3-4B`).
- Reproduccion de experimentos con control de solapamiento de datos: el script `dedup_deepmath.py` permite deduplicar DeepMath contra DAPO-Math-17K para evitar contaminacion entre conjuntos.
- Validacion rigurosa de checkpoints: dado el sesgo documentado en la validacion integrada de verl v0.7.0, el flujo recomendado (desactivar validacion interna y usar `scripts/val/`) es util para equipos que necesiten medidas fiables de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparables para el artefacto `OPD`.

El unico dato cuantitativo de rendimiento documentado se refiere a la infraestructura de evaluacion: la validacion integrada de verl v0.7.0 puede subestimar el rendimiento del modelo entre 5 y 7 puntos porcentuales, problema corregido en verl v0.8.0.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma especifica para `OPD`. Para los modelos de referencia, un Qwen3 de 1.7B en fp16 requiere del orden de 3,4 GB de pesos y un Qwen3 de 4B en fp16 alrededor de 8 GB, antes de overhead de KV cache y activaciones.
- Entrenamiento: la model card usa por defecto 8 GPU (`--gpu-ids 0,1,2,3,4,5,6,7`), lo que sugiere despliegues multi-GPU para rollout y entrenamiento.
- GPU recomendadas: no especificadas. Por el tipo de carga (vLLM + verl + destilacion con `N_RESPONSES=4` y respuestas de hasta 7168 tokens) se requieren GPUs de datacenter tipo A100/H100; no se confirma soporte en GPU de consumo.
- Despliegue: vLLM (usado en `vllm_rollout.py`), entorno verl v0.7.0/v0.8.0 y LlamaFactory v0.9.5. No se mencionan Ollama, TGI ni llama.cpp.
- Latencia y throughput: no disponibles.
- Espacio en disco: repositorio de 112 GB, factor a tener en cuenta para el despliegue.

## Comparativa con modelos similares

Dado que `OPD` es un metodo de entrenamiento y no un modelo final, la comparacion se plantea frente a enfoques alternativos de ajuste. No hay datos de rendimiento publicados, por lo que las cifras no estan disponibles.

| Enfoque | Senal de entrenamiento | On-policy | Configuracion clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPD (este repositorio) | Recompensa por token del maestro, Top-K | Si | `ADV_ESTIMATOR=token_reward_direct`, `LOG_PROB_TOP_K=16` | no disponible | Repositorio HuggingFace (112 GB) |
| SFT (LlamaFactory) | Etiquetas de respuestas del maestro | No | `llamafactory-cli train ...` | no disponible | Incluido en el flujo del repo |
| GRPO (verl) | Recompensa de resultado por rollout | Si | `ADV_ESTIMATOR=grpo`, `LOG_PROB_TOP_K=0` | no disponible | Script `grpo.sh` en el repo |
| Destilacion offline clasica | Logits del maestro sobre datos fijos | No | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide determinar si su uso comercial esta permitido.
- No se especifican idiomas soportados; los datos de entrenamiento citados son de dominio matematico.
- No hay resultados de benchmarks publicados, por lo que no es posible verificar la calidad de los modelos resultantes.
- Existe un problema documentado de infraestructura: la validacion integrada de verl v0.7.0 subestima el rendimiento entre 5 y 7 puntos porcentuales; se corrige en v0.8.0. En versiones anteriores debe desactivarse (`trainer.test_freq=-1`) y validar por separado.
- Al entrenar modelos "non-thinking" es obligatorio anadir `+data.apply_chat_template_kwargs.enable_thinking=False`; omitirlo produce entrenamientos incorrectos.
- El metodo depende de un modelo maestro disponible como `REWARD_MODEL_PATH`, lo que anade coste computacional y de infraestructura.
- El repositorio ocupa 112 GB y no registra descargas ni "likes", por lo que se trata de un artefacto reciente y sin validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/meetforever/OPD
- verl (framework de RL): https://github.com/verl-project/verl
- LlamaFactory (framework de SFT): https://github.com/hiyouga/LLaMA-Factory
- Dataset de SFT OpenThought3-Qwen3-4B: https://huggingface.co/datasets/lllyx/OpenThought3-Qwen3-4B
- Checkpoint SFT Qwen3-1.7B-SFT: https://huggingface.co/lllyx/Qwen3-1.7B-SFT
- Checkpoint RL Qwen3-4B-Base-GRPO: https://huggingface.co/lllyx/Qwen3-4B-Base-GRPO
- Analisis detallado de la validacion en verl v0.7.0: https://tsinghuanlp.feishu.cn/wiki/Gku5wP15yiDtr6k8B9DcVZ8Unfd

Nota: los resultados de la busqueda web proporcionados (Gulf News y enlaces relacionados) no guardan relacion con el modelo y se han descartado.
