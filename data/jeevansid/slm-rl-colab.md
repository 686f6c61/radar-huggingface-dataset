# JeevanSid/slm-rl-colab

## Resumen

JeevanSid/slm-rl-colab es un adaptador PEFT LoRA, no un modelo completo, desarrollado por JeevanSid para el taller SLM-RL. Se basa en el modelo LiquidAI/LFM2.5-1.2B-Instruct y está entrenado específicamente para jugar a Space Invaders en un entorno de texto nativo, generando acciones válidas a partir de instrucciones. El adaptador se creó mediante el framework SLM-RL, que permite a pequeños modelos de lenguaje aprender a jugar a través de refuerzo, recopilando sus propias decisiones en un dataset reutilizable y mejorando iterativamente.

La relevancia de este adaptador radica en su demostración de cómo un LLM de tamaño reducido puede especializarse en tareas de control de juegos mediante aprendizaje por refuerzo, sin necesidad de un modelo de propósito general. Aunque no es un modelo de producción, sirve como ejemplo práctico para investigadores interesados en RL aplicado a LLMs, y su licencia Apache 2.0 facilita su uso y modificación. El adaptador está diseñado para cargarse sobre el modelo base con la librería PEFT, y su tamaño es mínimo (0.0 GB en el repositorio), ya que solo contiene los pesos del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | no disponible (el nombre del modelo base sugiere 1.2B, pero no se confirma en la documentacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 o float32; el modelo base puede cuantizarse aparte) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT adapter, subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo LiquidAI/LFM2.5-1.2B-Instruct, del cual no se proporcionan detalles de arquitectura en la informacion disponible. El adaptador en si es un LoRA (Low-Rank Adaptation) que modifica los pesos del modelo base para la tarea especifica de jugar a Space Invaders. El entrenamiento se realizo con el metodo `reject_sft` sobre demostraciones generadas por un profesor DQN, dentro del framework SLM-RL. Este metodo combina rechazo de muestras de baja calidad con fine-tuning supervisado, y las metricas de entrenamiento muestran una perdida de -0.0188, una recompensa media de 0.09375 y una entropia de 2.55. El adaptador fue promovido como campeon de la generacion 1, con una mejora en la metrica primaria de 0.2292 a 0.3333, y tasas de invalidez e intervencion de 0.0.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, ni sobre el numero de tokens o la composicion de los datos. El adaptador se entrena sobre un dataset especifico de partidas de Space Invaders, disponible en JeevanSid/slm-rl-colab-data.

## Capacidades

- Generacion de acciones para el juego Space Invaders en un entorno de texto, respondiendo con el formato `ACTION: <id>`.
- Integracion con el framework SLM-RL para evolucion iterativa: el adaptador puede ser utilizado como punto de partida para nuevas generaciones de entrenamiento.
- Soporte de carga mediante PEFT y transformers, con ejemplo de codigo en la model card.
- Capacidad de ejecucion en CPU, CUDA o MPS, segun el dispositivo disponible.
- No es un modelo de proposito general: sus capacidades se limitan a la tarea de control del juego para la que fue entrenado.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para LLMs: el adaptador sirve como ejemplo reproducible de como aplicar SLM-RL a un juego concreto, permitiendo estudiar el efecto del fine-tuning con rechazo sobre el rendimiento.
- Evaluacion de agentes en entornos de texto: se puede usar para probar la capacidad de un LLM pequeno de seguir instrucciones de juego y generar acciones validas, midiendo metricas como invalid_rate o intervention_rate.
- Fine-tuning iterativo de modelos para tareas de control: el adaptador puede ser el punto de partida para nuevas generaciones en el taller SLM-RL, permitiendo explorar mejoras progresivas en el rendimiento.
- Demostracion de tecnicas de adaptacion eficiente: al ser un LoRA, muestra como especializar un modelo base sin necesidad de reentrenar todos los parametros, util para entornos con recursos limitados.
- Benchmarking de frameworks de RL: se puede comparar el rendimiento de este adaptador con otros entrenados con metodos alternativos (PPO, DPO, etc.) en el mismo juego.
- Educacion y prototipado: el codigo de carga y el ejemplo de generacion son sencillos, lo que facilita su uso en cursos o talleres sobre RL y LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas registradas son las del entrenamiento, que se muestran a continuacion:

| Metrica | Valor |
|---|---|
| primary (evaluacion) | 0.3333 |
| invalid_rate | 0.0000 |
| intervention_rate | 0.0000 |
| mean_score | 0.3333 |
| win_rate | 0.0 |
| reward (entrenamiento) | 0.09375 |
| loss (entrenamiento) | -0.0188 |
| kl (entrenamiento) | 0.2872 |
| entropy (entrenamiento) | 2.5522 |

Estas metricas corresponden a 8 episodios de evaluacion y 16 prompts de entrenamiento. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base LiquidAI/LFM2.5-1.2B-Instruct, que no se especifican en la informacion disponible.
- Segun la nomenclatura del modelo base (1.2B parametros), se estima que en bfloat16 necesitaria aproximadamente 2.4 GB de VRAM solo para los pesos, mas overhead de activaciones y el adaptador. Esto sugiere que podria ejecutarse en GPUs de consumo como una RTX 3060 (12 GB) o incluso en una RTX 4090 con margen, pero no hay datos oficiales.
- En CPU, la inferencia seria posible pero lenta, especialmente con generacion autoregresiva.
- El adaptador en si ocupa 0.0 GB en el repositorio, por lo que el almacenamiento adicional es despreciable.
- Opciones de despliegue: se puede cargar con transformers y PEFT en cualquier entorno que soporte PyTorch. No se mencionan integraciones con vLLM, Ollama o TGI en la documentacion.
- La latencia y el throughput no estan documentados.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada adaptadores comparables de SLM-RL para el mismo juego o con el mismo modelo base. Se podria comparar con otros adaptadores entrenados con metodos de RL, pero no hay datos publicados.

## Limitaciones y advertencias

- El adaptador esta especializado exclusivamente en Space Invaders; no es util para otras tareas de generacion de texto o razonamiento general.
- No se dispone de informacion sobre sesgos del modelo base ni del adaptador. Al estar entrenado en un entorno de juego, podria reflejar sesgos del entorno o de las demostraciones del profesor DQN.
- Riesgo de alucinacion: aunque el modelo genera acciones, podria producir respuestas fuera del formato esperado si se usa fuera del contexto de juego, aunque las metricas de invalid_rate son 0.0 en la evaluacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base LiquidAI/LFM2.5-1.2B-Instruct puede tener sus propias restricciones; se recomienda verificar su licencia antes de usar en produccion.
- No hay garantias de rendimiento en entornos diferentes al de entrenamiento; la generalizacion a otras variantes de Space Invaders o a otros juegos no esta probada.
- El adaptador se creo en 2026-08-29, por lo que es muy reciente y no ha sido ampliamente evaluado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JeevanSid/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/JeevanSid/slm-rl-colab-data
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
