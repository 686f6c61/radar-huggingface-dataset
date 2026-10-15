# ddvd233/hb9b_general_specgap_ship_retrieval_websearch2_global_step_100

## Resumen

`ddvd233/hb9b_general_specgap_ship_retrieval_websearch2_global_step_100` es un checkpoint de aprendizaje por refuerzo (RL) construido sobre `Qwen/Qwen3.5-9B`, publicado por el usuario `ddvd233` en HuggingFace. No se trata de un modelo de propósito general entrenado desde cero ni de un instruct model al uso, sino de un artefacto de investigación: los pesos son el volcado fusionado (merged) en safetensors bf16 de un checkpoint FSDP generado con `verl` en el paso global 100 del experimento `hb9b_general_specgap_ship_retrieval_websearch2`. El modelo tiene 9.409.813.744 parámetros y el repositorio ocupa 18,8 GB, coherente con pesos en bf16 sin cuantizar.

El problema que aborda es de Evaluación y entrenamiento de agentes con herramientas: el brazo de RL se entrenó con acceso a herramientas de recuperación (retrieval) y búsqueda web, y con tareas escritas por modelos en lugar de por humanos. El autor indica explícitamente que el proponente se entrenó sobre una descripción de tarea que no nombra ningún benchmark concreto ("general bundle"), y que esta ejecución es una repetición de una anterior con la misma configuración salvo `save_freq`. Su relevancia es, por tanto, metodológica: sirve para estudiar cómo se comporta el RL con herramientas en dominios de conocimiento especializado y cómo de bien (o mal) generaliza cuando el objetivo del entrenamiento no menciona la evaluación final.

El único resultado numérico publicado es en HealthBench Professional validation: precisión ajustada por longitud, evaluada en bucle y calificada por GPT, de 0,434 en este paso, frente a 0,301 del modelo base sin entrenar. La ejecución llegó hasta el paso 185, con una última evaluación de 0,397, es decir, por debajo del pico alcanzado en el paso 100. El propio autor etiqueta el modelo como artefacto de investigación y advierte que no es apto para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.5-9B; etiqueta de familia `qwen3_5`) |
| Parametros totales | 9.409.813.744 (~9,41 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos bf16 en safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), fusionados desde un checkpoint FSDP de `verl` |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de entrenamiento | reinforcement learning (pipeline declarado: `reinforcement-learning`) |
| Paso del checkpoint | global_step_100 (la ejecucion alcanzo el paso 185) |
| Tamano del repositorio | 18,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna en la informacion proporcionada. El modelo hereda la de `Qwen/Qwen3.5-9B`, y la etiqueta `qwen3_5` del repositorio confirma la familia, pero no se publican datos de numero de capas, tipo de atencion, vocabulario ni mecanismos concretos (atencion lineal, decodificacion especulativa, MoE, etc.). Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de SFT, RLHF o DPO previas al RL. Lo que si se sabe es que el modelo es el resultado de fusionar los pesos de un checkpoint FSDP entrenado con `verl` y exportarlo a safetensors bf16.

En cuanto al proceso de RL, el autor describe el experimento como "RRI full arm (hack-then-patch rounds) with retrieval and web search tools, 9B, GPT-graded". El proposer se entrenó sobre una descripcion de tarea que no nombraba ningun benchmark, en un paquete general, y esta ejecucion concreta (`..._websearch2`) repite la configuracion de la primera salvo el parametro `save_freq`. El entrenamiento se realizo sobre tareas escritas por modelos, lo que el propio autor senala como caveat. La evaluacion se hizo con calificacion por GPT y una metrica de precision ajustada por longitud aplicada en bucle durante el entrenamiento, no con un harness de benchmarks estandar.

## Capacidades

- Generacion de texto y razonamiento multi-paso en el marco de un agente de RL; el modelo fue entrenado para operar en episodios con herramientas, no como asistente conversacional al uso.
- Uso de herramientas de recuperacion (retrieval): el nombre del experimento (`retrieval`) indica que se entreno con este tipo de herramienta disponible en el entorno.
- Busqueda web como herramienta (`websearch2`): el brazo de RL incluye acceso a busqueda en la web durante la resolucion de tareas.
- Razonamiento con "hack-then-patch rounds": el esquema de entrenamiento contempla rondas de parcheo/correccion sucesivas, segun la descripcion del autor.
- Dominio de conocimiento especializado: la unica evaluacion publicada es de caracter sanitario (HealthBench Professional), aunque la tarea de entrenamiento era un paquete general sin benchmark nombrado.
- Capacidades multilingues: no disponible (no se declaran idiomas en la model card ni en los metadatos).
- Soporte de function calling generico, modo thinking, vision o audio: no disponible.
- Capacidades de agentes: parcialmente si, en el sentido de que fue entrenado con herramientas y multiples pasos, pero no se documentan formatos de tool calling ni plantillas de prompt especificas.

## Casos de uso

- Investigacion en RL con herramientas: el checkpoint sirve como punto de partida o punto de comparacion en experimentos con `verl` y FSDP, ya que se publica el resultado exacto del paso global 100 con la configuracion declarada.
- Estudios de reproducibilidad: permite reproducir o auditar el pipeline `hb9b_general_specgap_ship_retrieval_websearch2` comparando este volcado con el estado final de la ejecucion (paso 185).
- Analisis de generalizacion y especificidad de benchmark: dado que el entrenamiento no nombraba HealthBench, el modelo es un sujeto util para medir cuanto de la mejora (0,301 a 0,434) se debe a la tarea general y cuanto a senales indirectas del dominio evaluado.
- Evaluacion de agentes con busqueda web en dominios de conocimiento: se puede montar un banco de pruebas que compare el uso de la herramienta de busqueda antes y despues del RL, manteniendo constante el modelo base.
- Investigacion en calidad de respuestas en dominio sanitario (solo investigacion): uso como linea base experimental en HealthBench Professional y en variantes de la metrica de precision ajustada por longitud, nunca como sistema de decision clinica.
- Fine-tuning posterior o continued training: al publicarse en safetensors bf16 y con licencia Apache-2.0, es reutilizable como inicializacion para nuevos experimentos de RL o SFT sobre la misma base.
- Auditoria de datos sinteticos: al haberse entrenado con tareas escritas por modelos, resulta util para estudiar que sesgos y patrones introduce ese tipo de dataset en un modelo de 9B.
- Despliegue en produccion: no recomendado con este artefacto; se listaria unicamente como punto de partida para derivar un modelo posterior con evaluacion propia.

## Benchmarks y rendimiento

| Benchmark | Metrica | Este modelo (step 100) | Base sin entrenar | Ultima evaluacion de la ejecucion (step 185) |
|---|---|---|---|---|
| HealthBench Professional (validation) | Precision ajustada por longitud, evaluada en bucle (GPT-graded) | 0,434 | 0,301 | 0,397 |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible. El unico dato numerico procede de la model card del autor, que ademas advierte que la ejecucion "no forma parte de ninguno de los dos papers" y que este paso fue el mejor de la ejecucion, por encima del punto final.

## Requisitos de hardware

- Pesos en bf16: 9,41 mil millones de parametros ocupan aproximadamente 18,8 GB, en linea con el tamano del repositorio. A eso hay que sumar cache KV y activaciones, por lo que la VRAM real depende de la longitud de contexto (no publicada).
- VRAM estimada en bf16/fp16: alrededor de 20-26 GB segun contexto y tamano de lote. Ajustado en una RTX 4090 (24 GB) para contextos cortos y lotes pequenos; comodo en A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB.
- VRAM estimada en int8: aproximadamente 10-11 GB de pesos, viable en RTX 3090, RTX 4090, L4 o A10G.
- VRAM estimada en int4: aproximadamente 5-6 GB de pesos, viable en GPUs de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Nota importante: el repositorio solo contiene safetensors bf16. Los valores de int8 e int4 son estimaciones aritmeticas a partir del numero de parametros; no hay cuantizaciones publicadas por el autor.
- GPU recomendadas: H100 o A100 80 GB para entrenamiento o evaluacion con lotes grandes; A100 40 GB, L40S o RTX 4090 para inferencia bf16 con contexto moderado; GPUs de 12-16 GB solo con cuantizacion propia.
- Opciones de despliegue: vLLM, TGI o SGLang con los safetensors publicados. Para llama.cpp u Ollama seria necesario convertir y cuantizar previamente a GGUF, ya que no se distribuye ese formato.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, TTFT ni resultados de optimizacion (tensor parallelism, paged attention) para este checkpoint.
- Almacenamiento: 18,8 GB para el repositorio completo, mas el espacio adicional de cualquier cuantizacion que se genere.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hb9b_general_specgap_ship_retrieval_websearch2_global_step_100 | 9,41 B | no disponible | HealthBench Professional validation: 0,434 (in-loop, length-adjusted) | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (base sin entrenar) | ~9 B | no disponible | HealthBench Professional validation: 0,301 | Apache-2.0 (segun el modelo base citado) | HuggingFace |
| Paso 185 de la misma ejecucion | 9,41 B | no disponible | HealthBench Professional validation: 0,397 | Apache-2.0 | No publicado como repositorio independiente en la informacion disponible |
| Otros modelos comparables de ~9B | no disponible | no disponible | no disponible | no disponible | No se ha identificado una comparativa fiable en la informacion proporcionada |

La unica comparacion con datos verificables es contra el propio modelo base (`Qwen/Qwen3.5-9B`), del que no se proporcionan especificaciones tecnicas detalladas. No se dispone de datos para comparar con alternativas de terceros de tamano similar en la misma tarea.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que esta entrenado sobre tareas escritas por modelos y que no es apto para uso clinico.
- Especificidad de la evaluacion: la unica metrica publicada es de un unico benchmark (HealthBench Professional), con juez GPT y metrica ajustada por longitud aplicada en bucle. No es comparable directamente con cifras obtenidas con harnesses estandar.
- Paso intermedio: se publica el paso 100, no el final de la ejecucion. El propio autor senala que el paso 100 fue el mejor y que el paso 185 bajo a 0,397, lo que sugiere degradacion o sobreajuste en la segunda mitad del entrenamiento.
- Riesgo de gaming de especificaciones: el nombre del experimento (`specgap`) y la descripcion de "hack-then-patch rounds" apuntan a que el modelo puede aprender atajos especificos del entorno de RL en lugar de habilidades generales; no hay evaluacion externa que lo descarte.
- Datos sinteticos: al entrenarse con tareas generadas por modelos, puede heredar sesgos, errores factuales y estilos del generador de tareas.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad. En dominio sanitario el riesgo es especialmente alto.
- Idiomas: no se declaran idiomas soportados, por lo que no se puede garantizar un comportamiento correcto fuera del idioma o idiomas usados en el entrenamiento.
- Contexto: se desconoce la longitud de contexto efectiva, un dato critico para cualquier despliegue en produccion.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o verificacion por terceros.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero se heredan las condiciones y cualquier restriccion del modelo base `Qwen/Qwen3.5-9B` y de los datos y entornos de entrenamiento utilizados.
- Sin garantias: el autor no ofrece garantia de exactitud, seguridad ni idoneidad para ningun proposito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/hb9b_general_specgap_ship_retrieval_websearch2_global_step_100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog o repositorio del experimento: no disponible (el autor indica que la ejecucion no forma parte de ninguno de los dos papers y no enlaza ninguno)
- Demo o espacio interactivo: no disponible
- Repositorio de `verl` (framework de RL citado en la model card): no proporcionado en la informacion disponible
- Resultados de busqueda web: las busquedas realizadas no devolvieron ningun resultado relacionado con el modelo, su autoria o su experimento; los enlaces obtenidos correspondian a contenido no relacionado y se descartan.
