# hi-todayis-jh/ouro-1.4b-thinking-grpo-l1exact-native4-math-154711-20261009-ragged-rl

## Resumen

Este repositorio contiene checkpoints de un ajuste mediante aprendizaje por refuerzo (algoritmo GRPO) sobre el modelo `ByteDance/Ouro-1.4B-Thinking`, publicado por el usuario `hi-todayis-jh`. No es un modelo nuevo ni un asistente listo para usar: es el subproducto de un experimento de investigación sobre decodificación adaptativa en transformers con bucle (looped transformer), con 145 pasos de optimizacion y estado de AdamW incluido.

Ouro-1.4B-Thinking es un modelo de 1,4 mil millones de parametros con salida temprana (`early_exit_gate`) y decodificacion por bucles. Sobre el se ejecuta un run de RL etiquetado como `ragged-rl`, en el que las rollouts se generan con profundidades de salida muestreadas, profundidad minima 1 y truncado real de la cache KV, de modo que la politica aprenda a operar con una profundidad de computo variable en lugar de un numero fijo de bucles.

Su relevancia es metodologica: documenta como se ajusta con RL un modelo con bucle y como debe evaluarse despues (motor Dense-Ragged, no decodificacion fija de cuatro bucles). El repositorio no declara licencia, idiomas ni pipeline, registra 0 descargas y 0 likes, y su tamano reportado es de 0,0 GB, por lo que debe tratarse como material experimental sin garantias de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer) y modulo de salida temprana (`early_exit_gate`), derivado de `ByteDance/Ouro-1.4B-Thinking` |
| Parametros totales | 1.400 millones (1,4B), segun el nombre del modelo base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en FP32; no se incluyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | Guardado nativo de Hugging Face en shards FP32 (backbone y `early_exit_gate`); formato exacto de los shards (safetensors o bin) no especificado; estado de entrenamiento en `training_state.pt` |
| Carga del modelo | `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` |
| Regla de cache | `full_depth_per_loop_v1`, registrada en `policy_config.json` |
| Decodificacion entrenada | Muestreo de profundidad de salida, profundidad minima 1, truncado real de KV (Dense-Ragged) |
| Pasos de optimizacion | 145 (AdamW) |
| Codigo requerido | `modeling_ouro.py` y `configuration_ouro.py` (incluidos en `model_code/` y en `training_source.tar.gz`) |
| Tamano del repositorio | 0,0 GB segun los metadatos de HuggingFace |
| Fecha de publicacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

La base, `ByteDance/Ouro-1.4B-Thinking`, pertenece a la familia Ouro de transformers con bucle: en lugar de apilar capas unicas, reutiliza un bloque de capas varias veces, de forma que la profundidad efectiva de computo es un parametro de inferencia. El checkpoint publicado conserva esa topologia e incorpora el modulo `early_exit_gate`, que decide en cada bucle si se detiene el calculo. El repositorio no documenta el numero de capas, la dimension oculta, el numero de bucles nativo ni la longitud de contexto de la base.

El ajuste es un run de RL con GRPO sobre rollouts Dense-Ragged: en cada rollout se muestrean las profundidades de salida, con profundidad minima 1, y se aplica truncado real de la cache KV, es decir, el modelo se entrena con la cache que tendria a esa profundidad y no con una simulacion. El run consta de 145 pasos de optimizacion con AdamW y esta identificado como tag `20261009-ragged-rl`, job de Slurm 154711, nodo `orchard-flame-18`. La politica se entreno con la regla de cache `full_depth_per_loop_v1` (`policy_config.json`) y el pipeline de evaluacion apunta al conjunto AIME (`evaluate_aime`), con utilidades matematicas propias (`math_utils`). No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni fases previas de SFT, RLHF o DPO: no disponible.

## Capacidades

- Generacion de texto autorregresiva y razonamiento en modo thinking, heredados del modelo base; este repositorio no detalla su comportamiento.
- Razonamiento matematico orientado a problemas de competicion: el run y su evaluacion usan la suite AIME y el snapshot incluye utilidades de matematicas.
- Computo adaptativo en inferencia: la politica admite profundidades de salida muestreadas con minimo de 1 bucle.
- Decodificacion ragged mediante el modo `ragged-sample` del motor Dense-Ragged, con truncado real de la cache KV por profundidad.
- Reanudacion del entrenamiento: cada `global_step_N` es un guardado completo de Hugging Face con el estado de AdamW (`training_state.pt`) y los argumentos resueltos del entrenador (`run_config.json`).
- Verificacion de integridad del artefacto: `READY` marca el final de la escritura y `run_manifest.json` identifica el run.
- Tool calling o function calling: no disponible.
- Orquestacion de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponible (no se mencionan).

## Casos de uso

- Reproduccion de experimentos de RL sobre transformers con bucle: cargar un `global_step_N` con `trust_remote_code=True` y repetir la evaluacion AIME en modo `ragged-sample` para contrastar la curva publicada en W&B frente a la decodificacion fija de cuatro bucles.
- Investigacion en computo adaptativo: medir el rendimiento por profundidad de salida (1, 2, 3 y 4 bucles) aprovechando el muestreo de profundidades del checkpoint, para cuantificar cuanta precision se pierde al recortar computo.
- Estudio del coste real de la cache KV: al entrenarse con truncado real de KV por profundidad, el checkpoint permite medir memoria y latencia efectivas al reducir la profundidad, en lugar de estimarlas teoricamente.
- Ablaciones de politica de cache: `policy_config.json` fija `cache_rule: full_depth_per_loop_v1`, de modo que el checkpoint sirve para comparar esa regla con alternativas manteniendo constante el resto del pipeline.
- Punto de partida para SFT o RL posterior: al incluir el estado del optimizador y los argumentos del entrenador, se puede continuar el entrenamiento desde cualquier paso sin reconstruir el estado de AdamW.
- Auditoria y docencia de pipelines de RL: el repositorio incluye `launch_code/` y `training_source.tar.gz` (`marginal_experiments/`, `cluster/`, `math_utils/`), lo que permite estudiar de extremo a extremo como se lanza un run de GRPO en Slurm con rollouts ragged.
- Integracion en un banco de pruebas de decodificacion: usar el checkpoint para validar implementaciones propias del motor Dense-Ragged comparando salidas con las del pipeline de referencia.
- No se recomienda su uso como asistente conversacional en produccion: el ajuste es especifico de matematicas, la licencia no esta declarada y no hay evaluaciones de calidad general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card referencia una evaluacion sobre la suite AIME mediante `python -m marginal_experiments.dense_ragged.evaluate_aime`, pero no incluye cifras. Las metricas de entrenamiento se remiten al run de W&B indicado en los enlaces, sin valores reproducidos aqui.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 5,6 GB para 1,4B parametros (estimacion a partir del recuento de parametros; no hay medicion publicada).
- Reanudar entrenamiento: `training_state.pt` anade dos momentos de AdamW en FP32 (unos 11 GB) mas los pesos maestros, por lo que se necesita bastante mas memoria que para inferencia.
- Inferencia en bf16 o fp16: alrededor de 2,8 GB de pesos; con activaciones y cache KV, un presupuesto de 4 a 6 GB es realista para secuencias cortas.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y RTX 4090. En tarjetas de 8 GB solo con cuantizacion a 8 bits (unos 1,5 GB) o 4 bits (unos 0,8 GB) previa conversion, no incluida en el repositorio.
- GPU de datacenter: A100 o H100 no son necesarias para inferencia; si son utiles para reproducir el run de GRPO, cuyo consumo de VRAM no se publica.
- Despliegue: carga mediante `transformers` con `trust_remote_code=True`; el motor de referencia para decodificacion ragged es el paquete `dense_ragged` incluido en `training_source.tar.gz`. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible (no consta que ninguna de estas herramientas soporte la arquitectura con bucle y salida temprana).
- Latencia y throughput: no disponibles. Cualitativamente, la profundidad muestreada con minimo 1 permite en el mejor caso un unico bucle por token en lugar de cuatro, lo que reduciria el computo, pero no hay medidas publicadas.
- Almacenamiento: cada `global_step_N` en FP32 ocupa del orden de 5,6 GB solo en pesos; el repositorio declara 0,0 GB, dato incoherente que conviene verificar antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Este checkpoint (`ouro-1.4b-thinking-grpo-l1exact-native4-math-154711-20261009-ragged-rl`) | 1,4B | no disponible | Ajuste RL de investigacion (GRPO con rollouts ragged) sobre un modelo con bucle | no disponible | Guardado nativo de Hugging Face en FP32, requiere `trust_remote_code=True` |
| `ByteDance/Ouro-1.4B-Thinking` | 1,4B | no disponible en esta informacion | Modelo base con bucle y salida temprana | no disponible en esta informacion | Publicado por ByteDance en HuggingFace |
| `Qwen2.5-1.5B-Instruct` | 1,54B | 32.768 tokens | Transformer denso, ajustado para instrucciones | Apache 2.0 | safetensors y GGUF |
| `Llama-3.2-1B-Instruct` | 1,24B | 128.000 tokens | Transformer denso, ajustado para instrucciones | Licencia comunitaria de Llama 3.2 | safetensors y GGUF |

La comparacion es nominal (misma clase de tamano): este checkpoint es un artefacto de investigacion sobre decodificacion adaptativa, no un modelo instructivo general, por lo que no es posible comparar calidad sin resultados de benchmarks publicados.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial ni de redistribucion; es necesario contactar con el autor.
- Repositorio con 0 descargas y 0 likes, sin validacion independiente.
- Tamano de repositorio declarado como 0,0 GB: puede indicar que los pesos no estan realmente alojados o que la metrica es erronea; conviene comprobar `run_manifest.json` y la marca `READY`.
- `trust_remote_code=True` implica ejecutar `modeling_ouro.py` y `configuration_ouro.py` del autor: riesgo de seguridad en entornos no aislados.
- El ajuste esta orientado a matematicas (AIME) y a la politica de decodificacion ragged; no es un asistente general.
- Evaluar con decodificacion fija de cuatro bucles produce resultados no representativos, advertencia explicita del propio autor.
- Sin datos sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad. En un modelo de 1,4B es esperable una tasa de alucinacion alta en tareas abiertas, aunque no hay medidas publicadas.
- Sin informacion de contexto ni de idiomas: no se puede planificar su uso en conversaciones largas ni multilingues.
- El pipeline de evaluacion depende del paquete `dense_ragged` y de datos preparados con `prepare_aime`, que no se distribuyen como dataset en el repositorio.
- Pesos en FP32: mayor huella de disco y memoria que un GGUF cuantizado equivalente.
- Ausencia total de benchmarks publicados: no es posible estimar su calidad frente a alternativas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-grpo-l1exact-native4-math-154711-20261009-ragged-rl
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Metricas de entrenamiento en W&B: https://wandb.ai/jiahaozhangg-carnegie-mellon-university/ouro-1.4b-grpo-rltt-math/runs/grpo-l1exact-native4-ragged-154711-20261009-ragged-rl
- Contenido interno del repositorio: `run_manifest.json`, `run_config.json`, `launch_code/`, `model_code/`, `training_source.tar.gz`, checkpoints `global_step_N/`
- Paper tecnico del modelo base Ouro: no disponible en la informacion proporcionada.
- Repositorio del framework `marginal_experiments` o del motor Dense-Ragged: no disponible en la informacion proporcionada (solo se distribuye como snapshot dentro de `training_source.tar.gz`).
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron definiciones del termino "hi" sin relacion con el modelo.
