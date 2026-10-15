# hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-native-r4-klreward-154712-20261015

## Resumen

El modelo `hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-native-r4-klreward-154712-20261015` es un ajuste fino por aprendizaje por refuerzo del modelo base `ByteDance/Ouro-1.4B-Thinking`, un modelo de lenguaje de 1.400 millones de parámetros con arquitectura de transformer "en bucle" (looped language model). Lo publica el usuario de HuggingFace `hi-todayis-jh` y no es un modelo de propósito general, sino el artefacto reproducible de una única ejecución de entrenamiento con GRPO sobre el conjunto de datos `DigitalLearningGmbH/MATH-lighteval`.

El interés de esta ficha es acotado y muy técnico: se trata de un checkpoint de investigación que documenta de forma exhaustiva el proceso de entrenamiento (receta GRPO, hiperparámetros, configuración completa de verl, código del modelo parcheado, logs y recibos de verificación). Su relevancia actual reside en servir como ejemplo reproducible de cómo se aplica RL con verl a modelos pequeños de razonamiento matemático, más que en su uso como modelo listo para producción.

Dado que el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y que no se han publicado resultados de benchmarks ni datos de contexto o idiomas, esta ficha describe principalmente el procedimiento de entrenamiento y las características heredadas del modelo base, marcando explícitamente como "no disponible" todo dato que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped language model), según las etiquetas del modelo; código de modelado incluido en `model_code/modeling_ouro.py` |
| Parametros totales | 1.400 millones (1,4B), según la denominación del modelo base `ByteDance/Ouro-1.4B-Thinking` |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin cuantización; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carpeta `global_step_N/actor/huggingface` con config, tokenizer y código de modelado); también shards FSDP `.pt` en `actor/model_world_size_W_rank_R.pt` y estados de optimizador y RNG |

## Arquitectura y entrenamiento

El modelo base es `ByteDance/Ouro-1.4B-Thinking`, un transformer de 1,4B parámetros con una arquitectura "looped" (el bloque se reaplica en bucle un número configurable de pasos de profundidad) y una variante "thinking" orientada a razonamiento. El repositorio incluye el código parcheado del modelo (`model_code/modeling_ouro.py`, `configuration_ouro.py`) y un `policy_config.json` que describe la política de salida del bucle, lo que sugiere que el ajuste modifica parámetros de esa política de parada. El checkpoint HuggingFace se puede cargar sin fusionar shards mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.

El entrenamiento se realizó con verl 0.6.1 y una receta GRPO en modo `native`, 100 pasos de rollout, sobre un subconjunto de MATH (`DigitalLearningGmbH/MATH-lighteval`). Los argumentos documentados incluyen `--beta 0.001` con la KL incorporada a la recompensa (`--kl_in_reward`), `--learning_rate 1e-6`, `--max_grad_norm 1.0`, optimizador AdamW8bit con betas (0,9; 0,99), `--ppo_micro_batch_size_per_gpu 4`, `--cost_gradient score`, política de salida `--exit_mode fixed` con `--cache_rule full_depth` y `--vllm_gpu_memory_utilization 0.65`. La ejecución corrió en el job de Slurm 154712, nodo `orchard-flame-8`, y las métricas se registraron en el proyecto de W&B `ouro-1.4b-grpo-rltt-math`. No se documentan la composición exacta del dataset ni técnicas adicionales como decodificación especulativa.

## Capacidades

- Generacion de texto y razonamiento matematico: el ajuste se hizo exclusivamente sobre MATH, por lo que su especialidad es la resolucion de problemas de matematicas de nivel escolar y competitivo.
- Modo "thinking": hereda del modelo base `Ouro-1.4B-Thinking` una variante orientada a cadenas de razonamiento, con bucle de profundidad configurable.
- Control de profundidad de computo: gracias a la arquitectura "looped" y a `policy_config.json`, el numero de iteraciones del bloque puede ajustarse, lo que permite intercambiar coste por calidad.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision o audio: no disponible (modelo exclusivamente de texto).
- Reproducibilidad de RL: incluye manifiesto, configuracion resuelta, codigo de lanzamiento y recibos de verificacion, lo que permite reproducir la ejecucion.

## Casos de uso

- Investigacion en RL para razonamiento: el repositorio ofrece una receta GRPO completa y verificada sobre un modelo pequeño, util para estudiar el efecto de la KL en la recompensa, el modo de salida del bucle o el coste de gradiente en modelos "looped".
- Generacion de trazas de razonamiento matematico: puede utilizarse para producir soluciones paso a paso sobre problemas tipo MATH, que luego sirvan como datos sinteticos de entrenamiento o evaluacion (el propio repositorio publica las rollouts en un dataset aparte).
- Reproduccion de experimentos: al incluir `run_config.json`, `verl_config.yaml` y el codigo de lanzamiento, sirve para replicar la ejecucion en el mismo nodo o en otro similar y comparar variantes (`--l1_mode`, `--length_penalty_alpha`, etc.).
- Estudio de la arquitectura "looped": al disponer del codigo de modelado parcheado y de la politica de salida, permite experimentar con el numero de iteraciones del bloque y su impacto en la calidad frente al coste.
- Asistente matematico en local: con 1,4B parametros cabe en GPUs de consumo, por lo que puede desplegarse como tutor de matematicas offline sin depender de servicios en la nube.
- Punto de partida para ajustes posteriores: al ser un modelo pequeno y con licencia apache-2.0, es un candidato razonable para SFT o DPO adicionales sobre dominios matematicos especificos.
- Evaluacion comparativa de metodos de RL: permite contrastar GRPO frente a otras recetas (PPO, DPO) sobre el mismo modelo base y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia el proyecto de W&B `ouro-1.4b-grpo-rltt-math` (run `verl-grpo-native-r4-klreward-154712-20261015`), pero no se incluyen valores numericos de MMLU, GSM8K, MATH, HumanEval ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8-3 GB en FP16 para 1,4B parametros, mas overhead de activaciones y cache KV; en INT8 unos 1,5 GB y en INT4 alrededor de 0,8-1 GB (estimaciones teoricas, no verificadas para este checkpoint concreto).
- GPU recomendadas: para entrenamiento con GRPO y vLLM se utilizaron GPUs de datacenter (la configuracion fija `--vllm_gpu_memory_utilization 0.65`); para inferencia basta una GPU de consumo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Los modelos de 1,4B en FP16 ocupan poco mas de 3 GB, por lo que incluso GPUs de 6 GB pueden alojarlo con cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` sobre la carpeta `actor/huggingface`; vLLM (se uso durante el entrenamiento y es compatible con el checkpoint); no se documentan versiones GGUF, por lo que `llama.cpp` u `Ollama` requeririan convertir y cuantizar previamente. No se menciona compatibilidad con TGI.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `hi-todayis-jh/ouro-1.4b-...-20261015` (este) | 1,4B | no disponible | apache-2.0 | safetensors | Repositorio de investigacion, 0 descargas |
| `ByteDance/Ouro-1.4B-Thinking` (base) | 1,4B | no disponible | no disponible en esta ficha | safetensors (probable, no verificado) | Modelo base publicado por ByteDance |
| `ByteDance/Ouro-1.4B` (sin variante thinking) | 1,4B | no disponible | no disponible en esta ficha | no disponible | Modelo base de la familia |
| Otros modelos de razonamiento matematico de ~1,5B (por ejemplo, variantes destiladas de R1 o Qwen-Math) | ~1,5B | no disponible | no verificado | no disponible | Ecosistema general |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros y licencia declarada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo ni de toxicidad.
- Riesgo de alucinacion: alto en un modelo de 1,4B ajustado exclusivamente sobre MATH; puede producir razonamientos plausibles pero incorrectos en problemas fuera de la distribucion de MATH.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto; se desconoce su comportamiento multilingue y con contextos largos.
- Restricciones de licencia: la licencia declarada es apache-2.0, que permite uso comercial, pero se desconoce la licencia exacta del modelo base (`ByteDance/Ouro-1.4B-Thinking`), por lo que conviene verificarla antes de cualquier uso en produccion.
- Caveat de produccion: es un checkpoint de investigacion con 0 descargas, sin pruebas de robustez, sin benchmarks publicados y con datos de entrenamiento limitados a un unico dataset (MATH-lighteval); no se recomienda como modelo de produccion sin una evaluacion previa propia.
- Formato del checkpoint: los pesos estan partidos en shards FSDP y requieren la carpeta `actor/huggingface` para su carga directa; las versiones cuantizadas para inferencia eficiente no estan incluidas.
- Riesgo de sobreajuste: 100 pasos de rollout sobre un unico dataset y una tasa de aprendizaje baja (1e-6) con KL incorporada en la recompensa pueden dar lugar a un ajuste muy especializado en el estilo de MATH.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-native-r4-klreward-154712-20261015
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de rollouts asociado (mencionado en la model card): https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-native-r4-klreward-154712-20261015-rollouts
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Proyecto de W&B: `ouro-1.4b-grpo-rltt-math` (run `verl-grpo-native-r4-klreward-154712-20261015`)
- Framework de entrenamiento: https://github.com/volcengine/verl
- Paper o blog oficial de Ouro: no disponible en la informacion proporcionada
- Nota: los resultados de busqueda web devueltos para esta consulta no guardan relacion con el modelo (definiciones de diccionario y similares), por lo que no se incluyen como enlaces relevantes.
