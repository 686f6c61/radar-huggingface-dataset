# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16

## Resumen

`cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16` es un checkpoint de aprendizaje por refuerzo (RL) publicado por el usuario `agurung` sobre el modelo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo entrenado desde cero ni un modelo nuevo con arquitectura propia: es el resultado de aplicar GRPO (Group Relative Policy Optimization) mediante OpenRLHF directamente sobre el modelo base de Qwen3-4B, sin una fase previa de SFT semilla, y guardado en el paso global 14 de la ejecucion de RL.

El objetivo declarado del entrenamiento es mejorar la correccion de codigo generado. La senal de recompensa es binaria (1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario), y el conjunto de entrenamiento se construye sobre la "frontera" `cobalt-train ≤2/64`: 1833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia en como maximo 2 de 64 muestras bajo un escaneo de dureza `iid_canonical@64`. Es, por tanto, un experimento centrado en los casos dificiles para el modelo de partida.

Su relevancia es acotada y eminentemente investigadora: documenta una receta concreta de RL para codigo, con penalizacion anti-truncamiento estilo ProRL (recompensa -1.0 para muestras truncadas) y penalizacion overlong de DAPO (rampa aditiva hasta -0.25 en los ultimos 1024 tokens antes del limite). El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y la ficha no publica resultados de evaluacion. El checkpoint ocupa 55,6 GB de repositorio y declara 3.973.556.832 parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen3-4B. La etiqueta de HuggingFace del repositorio indica `nemotron_h`, en discrepancia con el modelo base declarado (no disponible la explicacion de esa etiqueta) |
| Parametros totales | 3.973.556.832 (aproximadamente 3,97 mil millones) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base declarado, Qwen3-4B-Instruct-2507, pertenece a la familia Qwen3, cuya documentacion oficial indica 262.144 tokens de contexto nativo |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no se ofrecen variantes GGUF, AWQ, GPTQ ni MLX |
| Idiomas soportados | No disponible |
| Licencia | No disponible (ni la ficha del modelo ni la informacion recopilada la especifican) |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tipo de entrenamiento | RL con GRPO sobre OpenRLHF, sin SFT semilla previo |
| Revision principal | `main` (rama git; el modelo esta en la raiz del repositorio, sin subcarpeta) |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 55,6 GB |
| Descargas / likes | 0 descargas / 1 like |
| Idiomas y region de despliegue | Etiquetas `endpoints_compatible` y `region:us` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base: un transformer decoder-only de la familia Qwen3 con aproximadamente 3,97 mil millones de parametros. No hay cambios arquitectonicos documentados en la ficha; lo que cambia es el proceso de optimizacion. El entrenamiento se realizo con OpenRLHF usando GRPO con ventajas normalizadas por grupo y sin penalizacion KL, sobre el modelo base Qwen3-4B sin una fase de SFT semilla, es decir, aplicando RL directamente al modelo preentrenado/instruido.

La receta concreta incluye tres elementos destacables. Primero, una penalizacion anti-truncamiento de estilo ProRL: a las muestras truncadas se les asigna una recompensa de -1.0, de modo que el modelo aprende a cerrar correctamente sus respuestas. Segundo, una penalizacion overlong de DAPO: las respuestas que caen en los ultimos 1024 tokens antes del limite reciben una penalizacion aditiva que escala hasta -0.25. Tercero, un presupuesto de generacion de 4096 tokens nuevos por rollout. Los hiperparametros declarados son 8 muestras por prompt, tamano de lote de rollout y de entrenamiento de 128, 2 episodios, learning rate del actor de 1e-06 con schedule constante, y guardado en el paso global 14.

Los datos de entrenamiento son 1833 problemas de entrenamiento y 112 de validacion (held-out) extraidos de la frontera `cobalt-train ≤2/64`, definida con prompts canonicos de `clean_eval`. La validacion se muestrea a temperatura 1.0, coincidiendo con la evaluacion de frontera. La ficha indica que este checkpoint es el mejor por `pass@8` de la ejecucion hasta la fecha, pero no incluye las metricas de evaluacion en el registro de entrenamiento.

## Capacidades

- Generacion de codigo: es la capacidad objetivo del entrenamiento, con recompensa binaria basada en la superacion de tests del problema.
- Razonamiento orientado a problemas de programacion dificiles: el conjunto de entrenamiento se restringe a problemas que el modelo base resolvia en 2 de cada 64 intentos o menos.
- Generacion de texto general: heredada de Qwen3-4B-Instruct-2507, aunque no se documenta su degradacion o preservacion tras el RL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no se confirma ni se niega).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Vision o audio: no disponibles; el pipeline declarado es exclusivamente text-generation.
- Control de longitud de respuesta: el modelo fue entrenado con penalizaciones explicitas de truncamiento y de exceso de longitud, por lo que tiende a cerrar sus generaciones dentro del limite de 4096 tokens nuevos.

## Casos de uso

- Investigacion reproducible en RL para codigo: sirve como punto de partida para replicar o auditar una receta GRPO con penalizaciones ProRL y DAPO, dado que la ficha detalla algoritmo, lotes, learning rate y numero de episodios.
- Ablacion de penalizaciones de truncamiento: permite comparar el efecto de la recompensa -1.0 en muestras truncadas y de la rampa overlong hasta -0.25 frente a ejecuciones sin ellas, siempre que se disponga del resto de checkpoints de la misma ejecucion.
- Evaluacion de checkpoints intermedios: al estar guardado en el paso global 14 y declararse "mejor por pass@8", es util para estudiar la evolucion del rendimiento a lo largo de una ejecucion de RL.
- Generacion de codigo en problemas de tipo competicion: el modelo esta especializado en problemas que el base resolvia en 2 de 64 muestras, por lo que encaja en entornos de evaluacion tipo pass@k sobre tests automatizados.
- Generacion de candidatos para verificacion por ejecucion: su entrenamiento con recompensa binaria de correctitud lo hace adecuado para pipelines donde cada salida se valida ejecutando tests, descartando las que fallan.
- Creacion de datos sinteticos de codigo verificable: las soluciones que pasan los tests pueden usarse como datos de entrenamiento o destilacion, filtrando por ejecucion.
- Punto de partida para un SFT posterior: al no haberse usado semilla SFT, puede servir como inicializacion para un ajuste supervisado que restaure formato de instrucciones y estilo conversacional.
- Servicio interno de asistencia a programacion: viable tecnicamente por tamano, pero con reservas por la licencia no declarada y por la ausencia de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo indica que este checkpoint es el mejor por `pass@8` de la ejecucion, pero anade explicitamente que las metricas de evaluacion no estan disponibles en el registro de entrenamiento. No hay valores de MMLU, HumanEval, GSM8K, LiveCodeBench ni de ningun otro conjunto, ni comparaciones numericas con modelos alternativos.

| Metrica | Resultado |
|---|---|
| pass@8 (frontera cobalt ≤2/64) | Declarado como mejor checkpoint de la ejecucion; valor numerico no disponible |
| Metricas de evaluacion del paso 14 | No disponibles en el registro de entrenamiento |
| MMLU / HumanEval / GSM8K / otros | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 8 GB solo para pesos (3,97B parametros), mas la cache KV correspondiente al contexto utilizado y al tamano de lote.
- VRAM estimada en int8: aproximadamente 4-5 GB de pesos. La cuantizacion seria a cargo del usuario, ya que no se publican variantes cuantizadas.
- VRAM estimada en int4: aproximadamente 2,5-3 GB de pesos, de nuevo mediante conversion propia.
- GPU consumer: el modelo cabe en tarjetas consumer de gama media-alta. Una RTX 3060 de 12 GB, una RTX 4070 Ti de 12 GB o una RTX 4090 de 24 GB pueden ejecutarlo en bf16 con margen; en 8 GB (RTX 3070, RTX 4060) sera necesario cuantizar o limitar el contexto.
- GPU de datacenter: A100 40/80 GB, H100 80 GB, L40S o A6000 permiten lotes grandes y contextos largos sin problema de capacidad; su uso aqui estaria justificado por throughput, no por necesidad de memoria.
- Opciones de despliegue: `transformers` (carga directa con `revision="main"`, tal como indica la ficha), vLLM (`vllm serve agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16 --revision main`), TGI y otros servidores compatibles con pesos safetensors. Para llama.cpp u Ollama habria que convertir previamente los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles. Como referencia de diseno, el entrenamiento genero hasta 4096 tokens nuevos por rollout, por lo que las respuestas pueden ser largas y penalizar el throughput si no se limita `max_new_tokens`.
- Almacenamiento: el repositorio ocupa 55,6 GB, muy por encima de los aproximadamente 8 GB que ocupan los pesos en bf16, lo que sugiere la presencia de multiples revisiones o artefactos adicionales; conviene revisar el contenido antes de descargarlo completo.

## Comparativa con modelos similares

La busqueda web realizada no devolvio informacion tecnica relevante sobre modelos comparables, y la ficha del modelo no incluye datos de rendimiento de alternativas. La siguiente tabla recoge unicamente lo que puede afirmarse con la informacion disponible.

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16` | 3,97B | No disponible (base de la familia Qwen3) | Checkpoint RL (GRPO) para codigo, paso global 14 | No disponible | Repositorio publico, 0 descargas, 1 like |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B (segun denominacion) | No disponible en la informacion recopilada | Modelo instructivo base sobre el que se aplica el RL | No disponible en la informacion recopilada | Modelo base de referencia del repositorio |
| Otros modelos de ~4B orientados a codigo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento que permitan afirmar que este checkpoint supere o iguale al modelo base ni a ninguna alternativa; la propia ficha solo declara que es el mejor por `pass@8` dentro de su ejecucion.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del repositorio ni de los pesos derivados, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo serio para cualquier despliegue en produccion.
- Checkpoint intermedio: corresponde al paso global 14 de una ejecucion de RL, no a un modelo final consolidado.
- Ausencia de evaluaciones: no hay metricas publicadas de MMLU, HumanEval, LiveCodeBench ni de la propia frontera de validacion, mas alla de la afirmacion cualitativa de ser el mejor por `pass@8` en su ejecucion.
- Riesgo de sobreajuste al conjunto de entrenamiento: los 1833 problemas de `cobalt-train ≤2/64` son un subconjunto muy especifico (problemas que el base resolvia en 2 de 64 intentos o menos), lo que puede estrechar la distribucion de tareas que el modelo resuelve bien.
- RL sin SFT semilla: aplicar GRPO directamente sobre el modelo base puede degradar el seguimiento de instrucciones, el formato de chat o el estilo conversacional respecto a Qwen3-4B-Instruct-2507.
- Ausencia de penalizacion KL: sin anclaje al modelo de referencia, existe riesgo de deriva de comportamiento, con posible perdida de capacidades generales no relacionadas con el codigo.
- Efecto secundario de las penalizaciones de longitud: la recompensa -1.0 para truncados y la penalizacion DAPO hasta -0.25 pueden favorecer respuestas mas cortas, en detrimento de razonamientos largos cuando estos sean necesarios.
- Discrepancia de metadatos: la etiqueta `nemotron_h` en HuggingFace no concuerda con el modelo base declarado (Qwen3-4B-Instruct-2507); conviene verificar la configuracion real del repositorio antes de integrarlo.
- Idiomas no documentados: no se declara cobertura multilingue; es previsible un comportamiento mucho mejor en ingles y en codigo que en castellano.
- Riesgo de alucinacion: como cualquier modelo de generacion de codigo, puede producir APIs, funciones o dependencias inexistentes; la unica mitigacion fiable es la ejecucion de tests.
- Sin validacion por la comunidad: 0 descargas y 1 like implican que el checkpoint no ha sido reproducido ni auditado por terceros.
- Tamano del repositorio: 55,6 GB para un modelo de 3,97B parametros es desproporcionado; hay que planificar el almacenamiento y verificar que no se descargan revisiones innecesarias.
- Contexto de entrenamiento limitado a 4096 tokens nuevos por rollout: aunque el modelo base soporte ventanas mucho mayores, el comportamiento afinado se ha optimizado con ese presupuesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de OpenRLHF (framework de entrenamiento citado en las etiquetas y en la ficha): https://github.com/OpenRLHF/OpenRLHF
- Registro de entrenamiento en Weights & Biases: proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k-ep2-ncp5-n3nc-iid16` (URL directa no disponible en la informacion proporcionada)
- Log local de entrenamiento indicado por el autor: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_n3nc_iid16/openrlhf_train.log` (ruta interna del autor, no accesible publicamente)
- Papers, blogs o demos adicionales: no se encontraron referencias relevantes en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
