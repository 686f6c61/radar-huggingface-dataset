# hi-todayis-jh/ouro-1.4b-thinking-per-context-rb-c1024-ragged-math-154712-20261009-ragged-rl

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino una coleccion de checkpoints de un experimento de aprendizaje por refuerzo (RL) marginal ejecutado sobre el modelo base `ByteDance/Ouro-1.4B-Thinking`, un transformer de 1,4 mil millones de parametros con salida temprana (early exit) y decodificacion iterativa. El autor, `hi-todayis-jh`, publica los pesos resultantes de un run identificado como `per_context_rb-c1024-ragged-154712-20261009-ragged-rl`, con 145 pasos de optimizador, rollouts de tipo Dense-Ragged (profundidades de salida muestreadas, profundidad minima 2 y truncado real de KV) y la regla de cache `ragged_min_lane_v1`.

El interes de esta publicacion es fundamentalmente de investigacion: documenta un pipeline completo de RL sobre razonamiento matematico con decodificacion ragged, incluyendo el codigo de lanzamiento, el codigo del modelo (`modeling_ouro.py`, `configuration_ouro.py`), el estado del optimizador AdamW y las metricas de entrenamiento volcadas a Weights & Biases. No es un artefacto orientado a produccion: no declara licencia, idiomas ni pipeline, y el repositorio ocupa 68,9 GB porque incluye shards en FP32 de todos los checkpoints guardados.

El problema que aborda es la evaluacion de politicas con profundidad de computo variable: al entrenar y evaluar con exits muestreados en lugar de un numero fijo de bucles, el modelo adapta su coste por token al ejemplo. Ahora mismo es relevante como material reproducible para quien investigue RL con recompensa verificable en matematicas, decodificacion adaptativa o arquitecturas con early exit, no como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con salida temprana y decodificacion iterativa (early exit gate; profundidades de salida muestreadas). Detalle completo no disponible |
| Parametros totales | 1,4 mil millones (heredados de `ByteDance/Ouro-1.4B-Thinking`) |
| Parametros activos | No aplica (no es MoE). El coste por token depende de la profundidad de salida muestreada; profundidad minima 2 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Solo se publican shards en FP32 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (shards FP32) + `training_state.pt` + `policy_config.json` + tokenizer y `config.json` |

## Arquitectura y entrenamiento

Segun los artefactos del repositorio, el modelo hereda la arquitectura de `ByteDance/Ouro-1.4B-Thinking`: un transformer que reutiliza sus capas en varios bucles de computo y decide la profundidad efectiva mediante un modulo `early_exit_gate` incluido en los shards. La inferencia se realiza con salidas de profundidad variable (exits muestreados, minimo 2) y truncado real de la cache KV, siguiendo la regla `ragged_min_lane_v1` registrada en `policy_config.json`. Esto implica que la evaluacion debe hacerse con el motor Dense-Ragged; usar decodificacion fija de cuatro bucles daria resultados distintos de los del entrenamiento.

El entrenamiento es un run de RL marginal con el algoritmo `per_context_rb`, etiquetado `20261009-ragged-rl`, sobre el cluster Slurm (job 154712, nodo `orchard-flame-8`), con 145 pasos de optimizador. El sufijo `math` y la existencia de un script de evaluacion sobre AIME (`marginal_experiments.dense_ragged.evaluate_aime`) indican que la senal de recompensa esta centrada en razonamiento matematico, aunque la composicion exacta del dataset, el numero de tokens vistos y el uso de RLHF/DPO no se detallan en la informacion disponible. El repositorio incluye `run_manifest.json`, `run_config.json`, `launch_code/`, `model_code/` y un `training_source.tar.gz` con `marginal_experiments/`, `cluster/` y `math_utils/`, lo que permite reproducir el pipeline. Los checkpoints se guardan como un save nativo completo de Hugging Face, sin necesidad de fusion FSDP, con un marcador `READY` escrito en ultimo lugar.

## Capacidades

- Generacion de texto y razonamiento paso a paso, presumiblemente orientado a problemas matematicos (no confirmado con benchmarks).
- Razonamiento con presupuesto de computo variable: la profundidad de salida es muestreable, con minimo 2, lo que permite ajustar coste frente a calidad por token.
- Decodificacion ragged con truncado real de la cache KV, evaluable con el motor Dense-Ragged incluido.
- Carga directa con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` desde cada `global_step_N/`.
- Continuacion de entrenamiento: se incluye el estado de AdamW (`training_state.pt`) y los argumentos resueltos del trainer.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente o multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de investigacion en RL: cargar cualquiera de los `global_step_N/` con el `training_state.pt` y los argumentos de `run_config.json` para replicar el run `154712` y comparar la curva de recompensa frente a los registros de W&B.
- Estudio de decodificacion adaptativa: medir la relacion entre profundidad de salida muestreada (a partir de 2) y exactitud en tareas matematicas, comparando salidas ragged frente a decodificacion fija de cuatro bucles.
- Evaluacion en AIME y suites matematicas: usar `marginal_experiments.dense_ragged.evaluate_aime --mode ragged-sample --min-depth 2` sobre los datos preparados con `prepare_aime` para obtener una linea base reproducible.
- Analisis de estabilidad del algoritmo `per_context_rb`: al disponer de checkpoints intermedios de 145 pasos, se pueden estudiar divergencias, colapsos de politica o cambios en la distribucion de profundidades de salida a lo largo del entrenamiento.
- Punto de partida para RL posterior: continuar el entrenamiento desde un checkpoint intermedio con otra configuracion de cache o de recompensa, aprovechando que no requiere fusion FSDP.
- Comparacion de politicas y destilacion: usar las salidas del modelo como datos de referencia para destilar en un modelo de menor profundidad fija o para comparar contra el checkpoint base `Ouro-1.4B-Thinking`.
- Benchmarking de motores de inferencia con salidas dinamicas: integrar `modeling_ouro.py` en un runtime propio y medir latencia y throughput con exits variables, ya que los motores estandar no cubren este caso.
- Auditoria de artefactos de entrenamiento: inspeccionar `model_code/` y `training_source.tar.gz` para verificar exactitud de implementacion antes de reutilizar el pipeline en otro dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un pipeline de evaluacion sobre AIME (`evaluate_aime`) y registros de entrenamiento en W&B, pero no se adjuntan cifras de MMLU, GSM8K, HumanEval, AIME ni de ninguna otra suite, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- Peso de un checkpoint en FP32: aproximadamente 5,6 GB solo de pesos (1,4e9 parametros x 4 bytes), mas optimizador y estados si se reanuda el entrenamiento.
- Inferencia en FP16/BF16: en torno a 2,8 GB de pesos; en int8, alrededor de 1,4 GB; en int4, aproximadamente 0,7-0,9 GB. No se publican conversiones cuantizadas, por lo que habria que generarlas.
- VRAM total: al peso hay que sumar la cache KV, cuyo tamano no puede estimarse porque la longitud de contexto no esta disponible.
- GPU consumer: con 1,4B parametros cabe con holgura en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) para inferencia en precision reducida y contextos moderados.
- GPU de datacenter: A100, H100 o L40S son suficientes y recomendables si se quiere reanudar entrenamiento en FP32 o servir varias replicas.
- Almacenamiento: el repositorio completo ocupa 68,9 GB; conviene descargar solo un `global_step_N/` mediante patrones de `snapshot_download` en lugar del repo entero.
- Opciones de despliegue: carga con `transformers` y `trust_remote_code=True` usando el `modeling_ouro.py` incluido. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible, y poco probable sin adaptar el runtime al esquema de early exit y decodificacion ragged.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`per_context_rb-c1024-ragged-154712`) | 1,4B | No disponible | No publicado | No disponible | Hugging Face, 0 descargas, 0 likes |
| `ByteDance/Ouro-1.4B-Thinking` (base) | 1,4B | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face |
| Otras alternativas de ~1,5B para razonamiento | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de rendimiento, contexto ni licencia de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No declara licencia. El uso comercial queda en un limbo legal hasta que el autor o el titular de los derechos del modelo base lo aclaren.
- Requiere `trust_remote_code=True` y ejecuta codigo del repositorio (`modeling_ouro.py`, `configuration_ouro.py`, `launch_code/`, `training_source.tar.gz`). Es un riesgo de seguridad en entornos no auditados; conviene revisar el codigo antes de cargarlo.
- Artefacto de investigacion sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados.
- Sesgo de dominio: el run esta etiquetado como `math`, por lo que el comportamiento fuera de tareas matematicas puede degradarse respecto al modelo base. No hay evaluaciones que lo confirmen.
- Riesgo de alucinacion: en tareas de razonamiento matematico con cadenas largas, un checkpoint de RL parcial (145 pasos) puede producir razonamientos plausibles pero incorrectos; no se aportan tasas de error.
- Idiomas soportados no declarados: se desconoce si conserva capacidades multilingues y con que calidad.
- Longitud de contexto no declarada: no se puede planificar el tamano de la cache KV ni el coste por peticion en produccion.
- La evaluacion debe hacerse con el motor Dense-Ragged (exits muestreados, profundidad minima 2). Evaluar con decodificacion fija de cuatro bucles produce medidas no comparables con las del entrenamiento.
- Sesgos sociales, de genero o culturales: no evaluados ni documentados en la informacion disponible.
- No hay garantia de que los checkpoints intermedios sean funcionales mas alla del pipeline exacto con el que se generaron; el marcador `READY` solo certifica integridad de escritura, no calidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-per-context-rb-c1024-ragged-math-154712-20261009-ragged-rl
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Metricas de entrenamiento en Weights & Biases: https://wandb.ai/jiahaozhangg-carnegie-mellon-university/ouro-1.4b-grpo-rltt-math/runs/per_context_rb-c1024-ragged-154712-20261009-ragged-rl
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente definiciones de diccionario de la palabra "hi", sin relacion con el modelo.
