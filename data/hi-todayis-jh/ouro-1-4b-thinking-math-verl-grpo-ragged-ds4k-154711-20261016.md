# hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-ds4k-154711-20261016

## Resumen

Este repositorio no es un modelo nuevo desde cero, sino un checkpoint de investigación resultante de aplicar aprendizaje por refuerzo (RL) sobre `ByteDance/Ouro-1.4B-Thinking`. El autor, `hi-todayis-jh`, ha publicado el resultado de un entrenamiento con la receta GRPO de verl 0.6.1 sobre un fichero de datos de matemáticas (`deepscaler_preview.jsonl`), con 157 pasos de rollout y el job de Slurm 154711 ejecutado en el nodo `orchard-flame-18`. El modelo base pertenece a la familia Ouro de ByteDance, etiquetada como *looped language model* (LoopLM) y en su variante *Thinking*, con 1.4B parámetros.

El interés de esta ficha es doble. Por un lado, documenta un caso reproducible de RL sobre un modelo pequeño con motor de inferencia vLLM integrado en el bucle de entrenamiento (`vllm_gpu_memory_utilization 0.45`, `vllm_kv_cache_memory_bytes 49392123904`, `vllm_max_num_seqs 12`). Por otro, publica artefactos poco habituales: shards FSDP, estado del optimizador y del RNG, estado del dataloader y el modelo fusionado en safetensors listo para cargar con `transformers` usando `trust_remote_code=True` por el código de modelado propio de Ouro.

Conviene tener presente su naturaleza: se trata de un checkpoint de investigación, con cero descargas y cero *likes* en el momento de la consulta, sin benchmarks publicados en la información disponible y con un tamaño de repositorio reportado de 0.0 GB. No es, por tanto, un modelo pensado para despliegue inmediato en producción, sino una pieza para reproducir, auditar o continuar experimentos de RL sobre modelos con razonamiento latente iterativo. Los resultados de la búsqueda web realizada no aportaron información adicional sobre el modelo: los enlaces devueltos corresponden a definiciones del saludo «hi» y a un club de Ibiza, sin relación con el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con bucle de profundidad (looped language model, LoopLM) según las etiquetas del repositorio; no es MoE |
| Parametros totales | 1.4B (según el identificador del modelo; no se detalla desglose en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint fusionado se publica en safetensors (precisión no especificada en la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors en `global_step_N/actor/huggingface/` (modelo fusionado con `config.json`, tokenizador, código de modelado Ouro y `policy_config.json`); además, checkpoints verl en `actor/model_world_size_W_rank_R.pt` (shards FSDP), `optim_*`, `extra_state_*` y `data.pt` |
| Modelo base | ByteDance/Ouro-1.4B-Thinking |
| Dataset de entrenamiento | DigitalLearningGmbH/MATH-lighteval (fichero `deepscaler_preview.jsonl`) |
| Metodo de entrenamiento | GRPO (verl 0.6.1), modo `ragged` |
| Fecha de creacion del repositorio | 2026-10-16 (según metadatos de HuggingFace) |
| Tamano del repositorio | 0.0 GB (según metadatos en el momento de la consulta) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base se describe, por las etiquetas del repositorio, como un *looped language model* (LoopLM) de la familia Ouro de ByteDance: un transformer denso de 1.4B parámetros que itera cómputo en profundidad en lugar de limitarse a un número fijo de capas. El propio run de RL expone los parámetros del bucle mediante `--exit_mode adaptive --cache_rule ragged --min_depth 2`, es decir, una política de salida adaptativa con una profundidad mínima de dos iteraciones y una regla de caché de tipo *ragged*. El checkpoint fusionado incluye `policy_config.json` con esa política de salida, lo que confirma que forma parte del comportamiento inferido del modelo, no solo del entrenamiento. La model card no detalla la composición de capas, el mecanismo de atención (si es atención completa o variante lineal) ni la longitud de contexto del base.

El entrenamiento es un ajuste por RL con GRPO sobre el modelo *Thinking* ya existente, no un preentrenamiento. Los hiperparámetros declarados son: `--l1_mode none`, `--length_penalty_alpha 0`, `--beta 0.001` (coeficiente KL), `--learning_rate 1e-6`, `--max_grad_norm 1.0`, `--cost_gradient score`, optimizador `AdamW8bit` con betas `0.9 0.99`, `--ppo_micro_batch_size_per_gpu 4` y `--num_train_epochs 1`. El bucle de generación de rollouts usa vLLM con `--vllm_gpu_memory_utilization 0.45`, una caché KV de 49.392.123.904 bytes (46 GiB) y un máximo de 12 secuencias simultáneas, valores que apuntan a GPUs de centro de datos para el entrenamiento. Se completaron 157 pasos de rollout. Los rollouts generados se publican como dataset aparte, y las métricas se registran en el proyecto de W&B `ouro-1.4b-grpo-rltt-math`, run `verl-grpo-ragged-ds4k-154711-20261016`. El repositorio incluye también una instantánea de código (`training_source.tar.gz` con `verl_trainer/`, `cluster/`, `math_utils/`, `marginal_experiments/`), el lanzador, el modelado parcheado y los recibos de verificación en `records/receipts/`. No se especifica si hubo fases previas de SFT, DPO o RLHF sobre este checkpoint.

## Capacidades

- Generación de texto y razonamiento matemático: el entrenamiento se realiza sobre un dataset de matemáticas (`MATH-lighteval` vía `deepscaler_preview.jsonl`), por lo que el ajuste está orientado a la resolución de problemas matemáticos con cadenas de razonamiento.
- Modo *thinking*: el modelo base es la variante `Thinking` de Ouro, con razonamiento latente iterativo mediante bucle de profundidad y política de salida adaptativa (`policy_config.json`).
- Razonamiento iterativo con profundidad variable: la configuración `--exit_mode adaptive` con `--min_depth 2` implica que el modelo puede detener el bucle según la dificultad del ejemplo.
- Carga directa con `transformers` mediante `trust_remote_code=True`, al incluir el código de modelado Ouro (`modeling_ouro.py`, `configuration_ouro.py`).
- Compatibilidad con vLLM: el propio run de entrenamiento usa vLLM como motor de generación de rollouts, lo que indica integración funcional con ese *backend*.
- Artefactos para reanudar o auditar el entrenamiento: shards FSDP, estado del optimizador, estado del RNG y estado del dataloader.
- Capacidades de *tool calling*, función de agente, *multi-step* explícito, visión o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en el repositorio.

## Casos de uso

- Reproducción de recetas de RL con verl: el repositorio publica `run_manifest.json`, `run_config.json`, `verl_config.yaml`, el lanzador y una instantánea de `verl_trainer/`, de modo que un grupo de investigación puede reconstruir el mismo experimento GRPO paso a paso sobre el mismo dataset.
- Estudio de políticas de salida adaptativa en LoopLM: al incluir `policy_config.json` y los argumentos `--exit_mode adaptive --cache_rule ragged --min_depth 2`, permite analizar cómo la profundidad del bucle afecta al coste y a la calidad del razonamiento matemático.
- Generación de trazas de razonamiento para destilación: los rollouts se publican como dataset independiente, útil para entrenar modelos menores con SFT sobre cadenas de pensamiento matemáticas, sin necesidad de ejecutar el modelo.
- Base para *ablations* de hiperparámetros de RL: los valores concretos (`beta 0.001`, `lr 1e-6`, `length_penalty_alpha 0`, `AdamW8bit`) sirven de punto de partida controlado para comparar variantes sobre un modelo de 1.4B.
- Tutoría matemática en entornos con recursos limitados: con 1.4B parámetros, el modelo cabe en GPUs de consumo de gama media, lo que permite desplegar un asistente de resolución de problemas en una máquina local o en una estación de trabajo sin clúster.
- Investigación sobre cuantización en modelos con cómputo iterativo: al no haber pesos GGUF publicados, es un caso claro para evaluar hasta qué punto el bucle de profundidad tolera cuantizaciones agresivas antes de degradar el razonamiento.
- Auditoría de trazabilidad de entrenamiento: los recibos en `records/receipts/` permiten verificar la integridad de los ficheros archivados, un escenario relevante para trabajos que requieren reproducibilidad estricta.
- Evaluación comparativa de checkpoints intermedios: los directorios `global_step_N/` con modelo fusionado en cada paso permiten medir la evolución del rendimiento a lo largo del entrenamiento RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, GSM8K, MATH, HumanEval ni de ningún otro conjunto de evaluación, ni para el modelo fusionado ni para los checkpoints intermedios. Tampoco se ofrecen curvas de recompensa del entrenamiento en el texto proporcionado; las métricas se remiten al proyecto de W&B `ouro-1.4b-grpo-rltt-math`, run `verl-grpo-ragged-ds4k-154711-20261016`, cuyo contenido no forma parte de esta ficha.

## Requisitos de hardware

- VRAM para inferencia: con 1.4B parámetros, los pesos en bf16 ocupan aproximadamente 2.8 GB y en int8 alrededor de 1.4 GB. La memoria total depende fuertemente de la caché KV y de la longitud de contexto efectiva, dato que no se especifica.
- Entrenamiento (referencia del propio run): la configuración usó una caché KV de 46 GiB y 12 secuencias máximas, lo que apunta a GPUs de centro de datos con 80 GB (A100, H100) o a un reparto entre varias GPUs. La model card no aclara el número de GPUs del job de Slurm.
- GPUs recomendadas para entrenamiento: A100 80 GB o H100 80 GB, por los requisitos de memoria del motor vLLM con esa caché KV.
- GPU de consumo: para inferencia, el modelo en bf16 cabe con holgura en RTX 4090, RTX 4080, RTX 3090, RTX 4060 Ti 16 GB e incluso RTX 3060 12 GB, siempre que la longitud de contexto no sea muy grande.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada explícitamente en la model card; vLLM está soportado de facto porque se usa durante el entrenamiento; verl es necesario para continuar el entrenamiento RL.
- llama.cpp, Ollama, TGI: no confirmados. No hay pesos GGUF publicados en el repositorio, y la necesidad de código de modelado personalizado (`modeling_ouro.py`) complica su uso en *runtimes* que no permitan código remoto.
- Latencia y throughput: no disponibles. Además, al tratarse de un modelo con bucle de profundidad y salida adaptativa, el coste por token no es directamente comparable con un transformer denso del mismo tamaño, ya que depende de cuántas iteraciones ejecute la política de salida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos provienen de sus model cards públicas y no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-ds4k-154711-20261016 | 1.4B | no disponible | Apache-2.0 | Repositorio de investigación, 0 descargas, sin benchmarks publicados |
| ByteDance/Ouro-1.4B-Thinking | 1.4B | no disponible | No disponible en la información proporcionada | Modelo base original de ByteDance |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache-2.0 | Modelo ampliamente desplegado, con múltiples cuantizaciones publicadas |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens | Apache-2.0 | Modelo pequeño orientado a despliegue en dispositivo, con GGUF disponible |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32.768 tokens | MIT | Destilado de razonamiento, con versiones cuantizadas ampliamente distribuidas |

La diferencia funcional relevante frente a esas alternativas no está en el tamaño sino en el mecanismo: Ouro introduce cómputo iterativo en profundidad con política de salida adaptativa, mientras que las alternativas citadas son transformers densos de ejecución fija. Esa diferencia explica también que este checkpoint carezca de cuantizaciones publicadas y de soporte en *runtimes* de inferencia convencionales.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: no es posible afirmar que el ajuste RL haya mejorado las capacidades matemáticas del modelo base sin medirlo, y el repositorio no aporta ninguna cifra.
- Checkpoint de investigación sin adopción: cero descargas y cero *likes* en el momento de la consulta implican ausencia de validación independiente por parte de la comunidad.
- Tamaño de repositorio reportado de 0.0 GB: conviene verificar que los pesos están efectivamente subidos y descargables antes de planificar cualquier uso; el metadato sugiere que el contenido puede no estar contabilizado o no haberse publicado completo.
- Requiere código remoto: el uso con `transformers` exige `trust_remote_code=True` para cargar `modeling_ouro.py` y `configuration_ouro.py`. Esto implica ejecutar código del repositorio y debe auditarse antes de usarlo en un entorno de producción.
- Compatibilidad limitada de *runtimes*: sin pesos GGUF ni AWQ/GPTQ publicados, el despliegue con llama.cpp, Ollama u otras herramientas fuera de `transformers` y vLLM no está garantizado.
- Sesgos: no disponibles. La model card no documenta evaluación de sesgos, toxicidad ni comportamientos indeseados, y el ajuste sobre un dataset puramente matemático no aborda esos riesgos.
- Riesgo de alucinación: no evaluado. En tareas matemáticas, un modelo de 1.4B con RL sobre un único dataset puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente fuera de la distribución de `MATH-lighteval`.
- Alcance de dominio estrecho: el entrenamiento se limita a un fichero de problemas matemáticos (`deepscaler_preview.jsonl`), lo que puede degradar el comportamiento generalista del modelo base respecto a otras tareas.
- Idiomas no declarados: no se especifica qué idiomas soporta el modelo, ni si el ajuste RL conserva el multilingüismo del base.
- Longitud de contexto desconocida: no se documenta la ventana de contexto del base ni la del checkpoint ajustado, lo que impide dimensionar caché KV o planificar conversaciones largas.
- Restricciones de licencia: la licencia declarada es Apache-2.0, que permite uso comercial, pero el modelo depende de la licencia y las condiciones del modelo base de ByteDance, que no se detallan en la información proporcionada. Conviene verificar la licencia del base antes de cualquier uso comercial.
- Dependencia del bucle adaptativo: el comportamiento en inferencia está condicionado por `policy_config.json`. Omitir ese fichero o cargar el modelo sin la política de salida puede cambiar el rendimiento de forma sustancial.
- Fecha de creación del repositorio en 2026-10-16: un metadato temporal anómalo respecto a la fecha de consulta, que conviene confirmar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-ds4k-154711-20261016
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-ds4k-154711-20261016-rollouts
- Métricas de entrenamiento: proyecto de W&B `ouro-1.4b-grpo-rltt-math`, run `verl-grpo-ragged-ds4k-154711-20261016` (URL directa no disponible en la información proporcionada)
- Paper, blog o repositorio oficial de Ouro: no disponibles en la información proporcionada
- El resultado de la búsqueda web no aportó enlaces relevantes al modelo; los resultados obtenidos correspondían a definiciones de la palabra «hi» y a un club nocturno, sin relación con este repositorio
