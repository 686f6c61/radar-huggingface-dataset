# neuqrui/scope-alfworld-qwen3-1.7b

## Resumen

scope-alfworld-qwen3-1.7b es un ajuste fino del modelo Qwen/Qwen3-1.7B desarrollado por el usuario neuqrui, orientado especificamente a tareas de agente en el entorno ALFWorld. ALFWorld es un benchmark de entornos textuales interactivos donde el agente debe navegar entre habitaciones, manipular objetos y completar tareas del hogar mediante comandos en lenguaje natural. El modelo se presenta como la politica SCOPE en el paso global 150, que segun la model card iguala los numeros de la tabla principal del paper asociado (ALFWorld Avg 92.2).

El modelo parte de la arquitectura Qwen3-1.7B, un transformer decoder-only de aproximadamente 2.030 millones de parametros segun los pesos en safetensors. Se ha entrenado con tecnicas de aprendizaje por refuerzo, concretamente GRPO (Group Relative Policy Optimization) y un metodo denominado OPSD por el autor, sobre trajectories de ALFWorld. El resultado es un modelo pequeno y especializado, no un modelo de proposito general.

Su relevancia radica en que demuestra que un modelo de 1.7B parametros puede alcanzar un rendimiento competitivo en tareas de agente estructuradas cuando se ajusta con RL sobre el entorno adecuado. Es util para investigadores que trabajen en agentes LLM, planificacion multi-paso y evaluacion en ALFWorld, y para desarrolladores que quieran desplegar un agente ligero en entornos con restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B, un transformer decoder-only con atencion por causalidad. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas o configuracion de atencion en la informacion proporcionada. El ajuste fino se ha realizado sobre el checkpoint base Qwen/Qwen3-1.7B, y el resultado se distribuye en safetensors con un tamano de repositorio de 4.1 GB, coherente con el checkpoint base completo mas los pesos ajustados.

El entrenamiento utiliza GRPO, un algoritmo de optimizacion de politica que estima ventajas relativas dentro de grupos de respuestas muestreadas, y un componente denominado OPSD por el autor. El modelo publicado corresponde al paso global 150 del entrenamiento. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico una fase adicional de DPO o RLHF supervisado. La tarea de entrenamiento es ALFWorld, un entorno de texto con acciones discretas (ir a, tomar, abrir, examinar, usar) y objetivos expresados en lenguaje natural.

## Capacidades

- Generacion de texto orientada a interaccion con entornos textuales.
- Planificacion multi-paso y razonamiento secuencial para completar tareas del hogar en ALFWorld.
- Emision de comandos de accion estructurados propios de ALFWorld (navegacion, manipulacion de objetos, apertura de contenedores).
- Seguimiento de instrucciones en lenguaje natural dentro de episodios de agente.
- Capacidad de mantener el estado de la tarea a lo largo de multiples turnos de interaccion con el entorno.
- Soporte de tool calling / function calling: no disponible de forma generica; el modelo esta especializado en el formato de acciones de ALFWorld.
- Capacidades multilingues: no disponibles; el entrenamiento se ha realizado sobre ALFWorld, que opera en ingles.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision ni audio.

## Casos de uso

- Investigacion en agentes LLM: el modelo sirve como politica de referencia para reproducir los resultados del paper SCOPE en ALFWorld, con un rendimiento declarado de 92.2 de media, lo que permite comparar variantes de RL y arquitecturas de agente sobre una base reproducible.
- Evaluacion de algoritmos de RL: al estar entrenado con GRPO y OPSD, es util para estudiar el efecto de estos metodos en un modelo pequeno y en un entorno acotado, aislando variables frente a modelos mayores.
- Prototipado de agentes de hogar simulado: permite construir y probar pipelines de agente que interactuan con entornos textuales tipo ALFWorld sin necesidad de desplegar modelos de decenas de miles de millones de parametros.
- Docencia y formacion: su tamano de 1.7B permite ejecutarlo en GPUs de consumo y usarlo en cursos sobre agentes, RL y planificacion con LLM.
- Baseline para ajustes posteriores: sirve como punto de partida para experimentos de fine-tuning sobre otros entornos textuales o para destilacion de politicas mas grandes.
- Despliegue en entornos con VRAM limitada: al caber en GPUs de gama media, puede integrarse en servicios de inference ligeros para tareas de agente acotadas, siempre que el dominio de aplicacion se limite al tipo de tareas de ALFWorld.
- Analisis de robustez: util para estudiar como se degrada un agente especializado cuando se le presentan variaciones del entorno o instrucciones fuera de distribucion.

## Benchmarks y rendimiento

La model card indica que el checkpoint corresponde al paso global 150 y que iguala los numeros de la tabla principal del paper SCOPE, con un promedio de 92.2 en ALFWorld. No se proporcionan en la informacion disponible resultados desglosados por tipo de tarea, ni comparaciones numericas con otros modelos en MMLU, HumanEval, GSM8K u otros benchmarks estandar.

| Benchmark | Resultado | Notas |
|---|---|---|
| ALFWorld Avg | 92.2 | Dato declarado en la model card; corresponde al paso global 150 |
| MMLU | no disponible | No se ha evaluado en la informacion proporcionada |
| HumanEval | no disponible | No se ha evaluado en la informacion proporcionada |
| GSM8K | no disponible | No se ha evaluado en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 6 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,5 a 3 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,5 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16; A100, H100, L40S o RTX 4090 ofrecen margen amplio y buen throughput.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problemas en fp16; en GPUs de 8 GB es recomendable cuantizar.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ALFWorld | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scope-alfworld-qwen3-1.7b | 2,03 B | no disponible | 92.2 (declarado) | apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 2,03 B | no disponible | no disponible | apache-2.0 | Hugging Face |
| Alternativas especializadas en ALFWorld | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con otros ajustes especificos de ALFWorld no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es el ajuste con GRPO/OPSD sobre trajectories de ALFWorld, que transforma un modelo de proposito general en una politica de agente especializada.

## Limitaciones y advertencias

- El modelo esta especializado en ALFWorld; su rendimiento fuera de ese dominio no esta documentado y probablemente sea muy inferior al de su modelo base en tareas generales.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3-1.7B, puede heredar sesgos del corpus original de Qwen.
- Riesgo de alucinacion: alto en usos fuera del entorno de entrenamiento, ya que el ajuste con RL sobre acciones discretas no refuerza la veracidad factual en texto libre.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto efectiva tras el ajuste ni los idiomas soportados; ALFWorld opera en ingles, por lo que el uso en castellano no esta validado.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, pero el modelo base Qwen3-1.7B tiene sus propios terminos que deben respetarse.
- Caveat para produccion: el checkpoint publicado corresponde a un paso intermedio de entrenamiento (global_step_150) y no se documenta su estabilidad fuera de la evaluacion del paper; conviene validarlo en el entorno objetivo antes de desplegarlo.
- No se publican pesos cuantizados ni instrucciones de despliegue detalladas, lo que anade trabajo de integracion.
- El numero de descargas y likes es cero en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuqrui/scope-alfworld-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de SCOPE: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
- Benchmark ALFWorld: no disponible en la informacion proporcionada
