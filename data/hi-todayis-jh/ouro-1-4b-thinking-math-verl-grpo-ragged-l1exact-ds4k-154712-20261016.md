# hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-l1exact-ds4k-154712-20261016

## Resumen

Ouro-1.4B-Thinking-GRPO (nombre de repo `hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-l1exact-ds4k-154712-20261016`) es un ajuste por aprendizaje por refuerzo del modelo `ByteDance/Ouro-1.4B-Thinking`, publicado por el usuario `hi-todayis-jh`. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado de un proceso de RL con GRPO sobre problemas de matematicas, orientado a mejorar la precision de razonamiento del modelo base en tareas matematicas de competicion.

El entrenamiento se realizo con `verl` 0.6.1 (receta GRPO) sobre el fichero `deepscaler_preview.jsonl`, en modo `ragged`, con 157 pasos de rollout, y forma parte del dataset de rollouts publicado aparte. El modelo base es un "looped language model" (modelo de lenguaje con bucle), una arquitectura en la que los pesos se reutilizan iterativamente en lugar de apilar capas independientes, lo que permite aumentar la profundidad efectiva de calculo sin aumentar el numero de parametros.

Su relevancia es principalmente metodologica y de reproducibilidad: el repositorio incluye configuracion completa de `verl`, manifiesto de ejecucion, codigo de lanzamiento, codigo del modelo parcheado, estados de optimizador y shards FSDP, ademas del modelo fusionado en safetensors listo para cargar con `transformers`. Es un ejemplo de pipeline de RL reproducible sobre un modelo pequeno (1,4B) con infraestructura Slurm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje con bucle (looped language model), segun las etiquetas del repositorio; detalles de capas y mecanismo de atencion no disponibles |
| Parametros totales | 1,4 mil millones aproximadamente (segun la denominacion del modelo base `Ouro-1.4B-Thinking`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio (solo se publican pesos en safetensors a precision de entrenamiento; no hay GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo fusionado en `global_step_N/actor/huggingface/`), mas checkpoints de `verl` en formato `.pt` (shards FSDP de actor, optimizador y estado extra) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Ouro de ByteDance, etiquetada como *looped language model*. En este tipo de arquitecturas, un bloque de parametros se aplica de forma recurrente un numero variable de iteraciones, de modo que la profundidad computacional no equivale al numero de capas con parametros distintos. El repositorio de este ajuste incluye el codigo de modelado parcheado (`modeling_ouro.py`, `configuration_ouro.py`, `config.json`) que el entrenador cargo, y el modelo fusionado requiere `trust_remote_code=True` para cargarse con `transformers`.

El entrenamiento es un ajuste por refuerzo con GRPO sobre el modelo base, ejecutado con `verl` 0.6.1 y un modo de generacion `ragged`. Los argumentos registrados incluyen `--l1_mode exact`, `--length_penalty_alpha 0`, `--beta 0.001` (coeficiente KL), `--learning_rate 1e-6`, `--max_grad_norm 1.0`, `--cost_gradient score`, optimizador `AdamW8bit` con betas `0.9 0.99`, `--ppo_micro_batch_size_per_gpu 4`, `--l1_max_target 4000` y `--num_train_epochs 1`. La politica de salida del bucle se controla con `--exit_mode adaptive` y la cache con `--cache_rule ragged` y `--min_depth 2`. El motor de rollout fue vLLM con `--vllm_gpu_memory_utilization 0.45`, `--vllm_kv_cache_memory_bytes 49392123904` (aproximadamente 46 GiB de cache KV) y `--vllm_max_num_seqs 12`. El entrenamiento duro 157 pasos de rollout en el trabajo Slurm 154712, nodo `orchard-flame-8`. Como dato de entrenamiento se cita el dataset `DigitalLearningGmbH/MATH-lighteval` y el fichero `deepscaler_preview.jsonl`; no se detalla la composicion completa ni el numero total de tokens. Las metricas se registraron en el proyecto de Weights & Biases `ouro-1.4b-grpo-rltt-math`.

## Capacidades

- Generacion de texto y razonamiento paso a paso orientado a matematicas, como consecuencia directa del ajuste con GRPO sobre problemas matematicos.
- Razonamiento matematico de competicion, con enfasis en respuestas de formato exacto (`--l1_mode exact`) y control de longitud de la respuesta (`--l1_max_target 4000`).
- Modo de razonamiento extendido heredado del modelo base (`Ouro-1.4B-Thinking`), con una politica de salida del bucle adaptativa que decide cuantas iteraciones de computo aplicar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se documentan idiomas.
- Capacidades especiales (vision, audio): no disponible; el modelo es de texto.
- Reproducibilidad de entrenamiento: se publican configuracion de `verl`, manifiesto de ejecucion, log de entrenamiento, recibos de verificacion y el dataset de rollouts asociado.

## Casos de uso

- Generacion de soluciones matematicas verificables: el modelo produce cadenas de razonamiento con respuesta final, aprovechando el ajuste con senal de recompensa sobre problemas tipo MATH; util para construir conjuntos de datos sinteticos de razonamiento matematico.
- Destilacion de trazas de razonamiento: al estar entrenado con GRPO y publicarse los rollouts, se puede emplear como generador de cadenas de pensamiento para entrenar modelos mayores mediante destilacion.
- Evaluacion comparativa de recetas de RL: sirve como punto de referencia para medir el efecto de GRPO, penalizacion de longitud y modos de generacion `ragged` frente al modelo base sin ajustar.
- Reproduccion de experimentos de RL a pequena escala: con 1,4B de parametros y `trust_remote_code`, se puede reproducir el pipeline en una sola GPU o en un nodo pequeno, usando la configuracion de `verl` incluida.
- Aprendizaje e investigacion en arquitecturas con bucle: permite estudiar como la politica de salida adaptativa (`--exit_mode adaptive`, `--min_depth 2`) afecta a la calidad del razonamiento y al coste computacional.
- Tutor automatico de matematicas en entornos controlados: para respuestas de practica con correccion automatica, siempre que se valide la exactitud y se asuma el riesgo de alucinacion en el resultado final.
- Generacion de problemas y soluciones para bancos de ejercicios: el modelo puede producir enunciados y resoluciones para plataformas educativas, con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, MATH ni HumanEval, y solo referencia el registro de metricas en Weights & Biases (proyecto `ouro-1.4b-grpo-rltt-math`, ejecucion `verl-grpo-ragged-l1exact-ds4k-154712-20261016`), cuyos valores no se reproducen en el repositorio.

## Requisitos de hardware

- VRAM estimada en inferencia para 1,4B parametros: aproximadamente 3 GB en FP16/BF16 solo para pesos, mas cache KV y activaciones; en la practica entre 4 y 6 GB con contexto moderado.
- En cuantizacion de 8 bits: en torno a 1,5-2 GB de pesos, mas cache KV.
- En cuantizacion de 4 bits: en torno a 1 GB de pesos, aunque no se publican pesos GGUF ni cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, RTX 5090) es suficiente para inferencia en precision completa; para el pipeline de entrenamiento con vLLM y cache KV grande se recomiendan A100 o H100 por memoria.
- Cabe en GPU consumer: si, con margen amplio en tarjetas de 8-16 GB; en GPU integradas o con menos de 4 GB de VRAM requeriria cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (via documentada en la model card, cargando `global_step_N/actor/huggingface`); vLLM, ya que fue el motor de rollout del entrenamiento (`vllm_gpu_memory_utilization 0.45`, `vllm_max_num_seqs 12`); `verl` para reanudar el entrenamiento desde los checkpoints con estado de optimizador. La compatibilidad con llama.cpp, Ollama o TGI no esta documentada y probablemente requiere soporte explicito de la arquitectura con bucle, ausente en estos motores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia del entrenamiento, el motor vLLM se configuro con 12 secuencias concurrentes maximas en el nodo utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Ouro-1.4B-Thinking + GRPO) | ~1,4B | No disponible | Apache 2.0 | Safetensors + checkpoints verl | Ajuste RL sobre matematicas, requiere `trust_remote_code`; sin benchmarks publicados |
| ByteDance/Ouro-1.4B-Thinking | ~1,4B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Safetensors | Modelo base sin el ajuste GRPO; es la referencia directa para medir el efecto del RL |
| Qwen2.5-1.5B-Instruct | ~1,5B | No disponible en la informacion proporcionada | Apache 2.0 | Safetensors, GGUF | Alternativa generalista de tamano similar, con amplio soporte en motores de inferencia |
| Llama-3.2-1B-Instruct | ~1,2B | No disponible en la informacion proporcionada | Licencia comunitaria de Llama 3.2 | Safetensors, GGUF | Alternativa generalista pequena, con soporte nativo en llama.cpp y Ollama |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | No disponible en la informacion proporcionada | MIT | Safetensors, GGUF | Alternativa especifica de razonamiento matematico de tamano comparable |

No se dispone de datos de rendimiento comparativos para este modelo, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que no se puede afirmar ninguna mejora cuantitativa frente al modelo base ni frente a alternativas.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y el tamano declarado es 0,0 GB, lo que sugiere que el artefacto podria no estar completamente materializado o que la informacion de tamano no es fiable. Conviene verificar los ficheros antes de depender de este repositorio.
- Riesgo de alucinacion: en tareas matematicas, un modelo de 1,4B puede producir cadenas de razonamiento plausibles con resultados finales incorrectos; la validacion automatica de la respuesta es imprescindible en produccion.
- Sesgos conocidos: no documentados en la informacion disponible. Al entrenarse sobre un dataset de matematicas, el modelo puede degradarse en dominios fuera de ese ambito.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se documentan; no se debe asumir comportamiento multilingue.
- Licencia: Apache 2.0, lo que permite uso comercial y modificacion, pero el modelo base `ByteDance/Ouro-1.4B-Thinking` tiene su propia licencia, no indicada en la informacion disponible; conviene comprobar que no impone restricciones adicionales.
- Dependencia de codigo remoto: la carga exige `trust_remote_code=True` con el codigo de modelado incluido en el repositorio, lo que implica ejecutar codigo de un tercero y revisarlo antes de usarlo en entornos de produccion.
- Compatibilidad limitada de despliegue: al ser una arquitectura con bucle, es probable que no funcione directamente en llama.cpp, Ollama o TGI sin soporte especifico; no hay pesos GGUF publicados.
- Caveat de reproducibilidad: los checkpoints de `verl` incluyen estado de optimizador y RNG en shards FSDP; reanudar el entrenamiento requiere la misma topologia de mundo (`model_world_size_W_rank_R.pt`) o una conversion previa.
- No se documenta el numero total de tokens de entrenamiento ni la composicion del dataset, solo el fichero `deepscaler_preview.jsonl` y la referencia a `DigitalLearningGmbH/MATH-lighteval`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-l1exact-ds4k-154712-20261016
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-grpo-ragged-l1exact-ds4k-154712-20261016-rollouts
- Dataset citado en la model card: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Metricas de entrenamiento (Weights & Biases): proyecto `ouro-1.4b-grpo-rltt-math`, ejecucion `verl-grpo-ragged-l1exact-ds4k-154712-20261016` (no se proporciona URL directa)
- Enlaces adicionales de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles corresponden a definiciones de diccionario y sitios no relacionados.
