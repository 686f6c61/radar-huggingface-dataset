# hi-todayis-jh/ouro-1.4b-thinking-grpo-lp0p2-ragged-math-154712-20261009-ragged-rl

## Resumen

Este repositorio no contiene un modelo nuevo, sino una coleccion de checkpoints intermedios de un ajuste por aprendizaje por refuerzo (RL) sobre `ByteDance/Ouro-1.4B-Thinking`. El entrenamiento emplea el algoritmo GRPO y una variante de generacion denominada Dense-Ragged, en la que la profundidad de computo (numero de bucles del backbone antes de la salida temprana) se muestrea en lugar de fijarse, con una profundidad minima de 2 y truncado real de la cache KV. El autor publica el resultado como un experimento marginal: 145 pasos de optimizador dentro de una ejecucion identificada como `grpo-lp0p2-ragged-154712-20261009-ragged-rl`, lanzada en el cluster (job Slurm 154712, nodo `orchard-flame-8`).

El interes de la ficha es doble. Por un lado, documenta una tecnica concreta de RL sobre modelos con salida temprana, un area poco representada en releases publicos. Por otro, sirve como ejemplo de publicacion de artefactos de investigacion: se incluyen pesos FP32 con la cabeza `early_exit_gate`, tokenizer, `config.json`, `policy_config.json` (regla de cache y ajustes de muestreo), estado del optimizador AdamW, manifiestos de ejecucion y el codigo de entrenamiento y evaluacion.

La informacion disponible es muy limitada: el repositorio no declara licencia, idiomas, pipeline ni resultados de evaluacion, y los resultados de busqueda web no aportan datos sobre el modelo base ni sobre estos checkpoints. Varios campos de esta ficha quedan por tanto como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con salida temprana: backbone mas modulo `early_exit_gate`; modelo base `ByteDance/Ouro-1.4B-Thinking`. Detalle arquitectonico completo no disponible |
| Parametros totales | 1,4 mil millones (derivado del nombre del modelo base; no confirmado en la informacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los checkpoints se publican en FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | shards nativos de Hugging Face en FP32 (backbone y `early_exit_gate`); el formato de serializacion exacto no se especifica en la model card |

Otros datos del repositorio: descargas 0, likes 0, tamano del repo 0.0 GB, creado y actualizado el 2026-10-13 (fechas posteriores a la fecha de consulta habitual, posible anomalia de metadatos). El tag declarado es unicamente `region:us`.

## Arquitectura y entrenamiento

El objeto publicado es un ajuste RL, no un preentrenamiento. El checkpoint parte de `ByteDance/Ouro-1.4B-Thinking` y se entrena con GRPO sobre rollouts Dense-Ragged: en cada generacion se muestrean profundidades de salida (numero de iteraciones efectivas del backbone) en lugar de usar un numero fijo de bucles, con profundidad minima 2 y truncado real de la cache KV (`cache_rule: ragged_min_lane_v1`). Esta configuracion persigue que la politica aprenda a operar con presupuestos de computo variables y que el modelo no dependa de una profundidad de decodificacion fija. El run consta de 145 pasos de optimizador, con estado AdamW guardado en `training_state.pt`.

Los checkpoints son guardados nativos de Hugging Face escritos por `marginal_experiments/train.py`, con shards FP32, tokenizer, `config.json`, `policy_config.json` y un marcador `READY` escrito en ultimo lugar; no se requiere fusion FSDP. El repositorio incluye tambien `run_manifest.json` y `run_config.json`, el codigo de lanzamiento y evaluacion (`launch_code/`), la implementacion cargada por el entrenador (`model_code/modeling_ouro.py`, `configuration_ouro.py`) y una instantanea del codigo de entrenamiento (`training_source.tar.gz` con `marginal_experiments/`, `cluster/`, `math_utils/`).

Dos implicaciones practicas importantes: (1) la carga requiere `trust_remote_code=True` y la copia de `modeling_ouro.py` incluida; (2) el autor indica explicitamente que la evaluacion debe hacerse con el motor Dense-Ragged en modo `ragged-sample --min-depth 2`, no con decodificacion fija de cuatro bucles, porque la politica se entreno con decodificacion ragged. No se documentan en la informacion disponible la composicion del dataset, el numero de tokens de entrenamiento, ni si hubo fases de SFT, RLHF o DPO previas.

## Capacidades

- Generacion de texto autoregresiva y razonamiento tipo cadena de pensamiento, heredadas del modelo base `Ouro-1.4B-Thinking`.
- Razonamiento matematico: el sufijo `math` del tag de ejecucion y el script `evaluate_aime` indican que el entrenamiento y la evaluacion se orientaron a problemas de matematicas competitivas (suite AIME).
- Computo adaptativo por profundidad: la cabeza `early_exit_gate` permite terminar antes en funcion de la entrada, con politicas de profundidad muestreadas durante el entrenamiento.
- Decodificacion con presupuesto variable: soporta el modo `ragged-sample` con profundidad minima configurable y truncado KV real.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Vision o audio: no disponible en la informacion.

Es un checkpoint de investigacion, no un modelo instruct afinado para uso conversacional general; no se declara alineacion de instrucciones ni formato de chat.

## Casos de uso

- Investigacion en RL para razonamiento matematico: el checkpoint sirve como material de partida y reproduccion de un run GRPO concreto sobre un modelo de salida temprana; util para estudiar como evoluciona la politica a lo largo de 145 pasos con hiperparametros documentados en `run_config.json`.
- Reproducibilidad y auditoria de experimentos: al incluir `training_source.tar.gz`, `model_code/` y `launch_code/`, permite reejecutar o auditar el pipeline exacto (job Slurm 154712, nodo `orchard-flame-8`) sin depender de codigo externo.
- Estudio de decodificacion con salida temprana: adecuado para comparar decodificacion fija frente a ragged sampling, midiendo el efecto de la profundidad minima y del truncado KV sobre exactitud y coste.
- Ablaciones de politica de profundidad: permite entrenar variantes con otras profundidades minimas o reglas de cache y compararlas contra esta linea base.
- Generacion de soluciones matematicas paso a paso en entornos controlados: con prompts de estilo AIME y verificacion automatica de la respuesta final, como componente de un pipeline de sintesis de datos o de evaluacion, nunca como fuente de verdad sin comprobacion.
- Punto de partida para RL adicional o fine-tuning: al publicarse el estado completo del optimizador y el `policy_config.json`, es util para continuar el entrenamiento o transferir la politica a otra suite de tareas.
- Prototipado en hardware de consumo: con alrededor de 1,4 mil millones de parametros, cabe en GPUs de gama media para experimentos de inferencia y evaluacion a pequena escala.
- Docencia e investigacion sobre computo adaptativo: sirve como ejemplo didactico de arquitectura con compuertas de salida temprana y de como se registran los artefactos de un run de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor referencia un script de evaluacion sobre AIME (`marginal_experiments.dense_ragged.evaluate_aime`), pero no se incluyen puntuaciones en la model card ni en los resultados de busqueda web, que no devolvieron ningun resultado relevante sobre el modelo.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| AIME | no disponible (existe script de evaluacion, sin cifras publicadas) |

## Requisitos de hardware

- Pesos en FP32: aproximadamente 5,6 GB solo para parametros (1,4 mil millones x 4 bytes), mas activaciones y cache KV; en la practica conviene reservar del orden de 8-10 GB de VRAM para inferencia comoda.
- Si se convierte a bf16/fp16, los pesos bajan a unos 2,8 GB; en cuantizacion de 4 bits, alrededor de 0,8-1 GB (la cuantizacion no viene soportada de fabrica en este repositorio: no se declaran tipos de cuantizacion).
- GPU de consumo: cabe en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090) para inferencia en FP32 o precision reducida.
- GPU de datacenter: A100, H100 o similares para entrenamiento y para evaluaciones por lotes; el run original se ejecuto en un cluster con Slurm.
- Despliegue: la via documentada es `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` sobre cada `global_step_N/`, mas el motor Dense-Ragged del paquete `marginal_experiments` para el modo ragged. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible; al requerir codigo remoto y una regla de cache propia, el soporte en esos motores no esta garantizado.
- Latencia y throughput: no disponible. Como referencia cualitativa, el coste de decodificacion depende de la profundidad muestreada por token, por lo que no es comparable directamente con un transformer de profundidad fija del mismo tamano.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para comparar rendimiento. Se listan alternativas de la misma categoria (modelos pequenos orientados a razonamiento) sin cifras, ya que la busqueda web no devolvio informacion utilizable:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hi-todayis-jh/ouro-1.4b-thinking-grpo-lp0p2-ragged-math-154712-20261009-ragged-rl (este) | 1,4 B (segun nombre) | no disponible | no disponible | Hugging Face, 0 descargas |
| ByteDance/Ouro-1.4B-Thinking (modelo base) | no disponible | no disponible | no disponible | referenciado en la model card |
| Alternativas pequenas de razonamiento (por ejemplo, familias distill de 1,5 B) | no disponible | no disponible | no disponible | no disponible en esta busqueda |

La unica comparacion sustentada por la informacion es interna: frente al modelo base, este checkpoint incorpora una politica entrenada con GRPO y decodificacion ragged, por lo que no debe evaluarse con el mismo procedimiento de decodificacion que el base.

## Limitaciones y advertencias

- No es un modelo de proposito general: es un checkpoint de un run de RL con 145 pasos, sin garantia de convergencia ni de calidad final.
- Sin licencia declarada: la ausencia de licencia en el repositorio impide asumir permisos de uso comercial; debe consultarse al autor antes de cualquier uso en produccion.
- Sin datos de evaluacion: no hay benchmarks publicados que respalden el rendimiento, por lo que no se puede afirmar mejora alguna sobre el modelo base.
- Riesgo de alucinacion: al estar orientado a matematicas, puede producir cadenas de razonamiento plausibles con resultados incorrectos; cualquier salida debe verificarse con un verificador simbolico o numerico.
- Dependencia de codigo remoto: la carga exige `trust_remote_code=True` y los ficheros `modeling_ouro.py` / `configuration_ouro.py`; esto implica ejecutar codigo del autor, con el riesgo de seguridad asociado.
- Evaluacion condicionada: usar decodificacion fija en lugar de Dense-Ragged (minimo profundidad 2) puede dar resultados no representativos de la politica entrenada.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto; no asumir cobertura multilingue ni ventanas largas.
- Metadatos anomalos: descargas 0, likes 0, tamano de repo 0.0 GB y fechas de 2026, lo que sugiere un repositorio recien creado o con artefactos no completamente disponibles.
- Sesgos: no documentados por el autor; heredables del corpus del modelo base, desconocido en esta informacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-grpo-lp0p2-ragged-math-154712-20261009-ragged-rl
- Metricas de entrenamiento (W&B): https://wandb.ai/jiahaozhangg-carnegie-mellon-university/ouro-1.4b-grpo-rltt-math/runs/grpo-lp0p2-ragged-154712-20261009-ragged-rl
- Modelo base citado en la model card: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Resultados de busqueda web: no se encontro informacion relevante sobre el modelo; los resultados devueltos correspondian a entradas de diccionario y sitios no relacionados con inteligencia artificial.
