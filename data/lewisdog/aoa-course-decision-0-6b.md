# lewisdog/aoa-course-decision-0.6b

## Resumen

aoa-course-decision-0.6b es un modelo de decisión tipado desarrollado por el usuario lewisdog para el planificador del curso Agent-Oriented Architecture (AOA). No es un modelo generativo: recibe un estado con la forma `{"goal", "task"}` y devuelve, en una sola pasada forward, una elección (Choice) sobre un conjunto de tarjetas de capacidad previamente registradas —más la opción `none_of_these`— junto con una respuesta binaria de idoneidad (fit) acompañada de probabilidades calibradas. Está construido sobre Qwen/Qwen3-0.6B-Base mediante un adaptador LoRA de rango 16 sobre todas las proyecciones y una cabeza pointer de 256 dimensiones, siguiendo el marco de trabajo Kev (Apache 2.0).

Su relevancia radica en el nicho que ocupa: sustituye a un LLM generalista en la tarea de enrutado y selección de capacidades dentro de un sistema multiagente, con la restricción deliberada de que nunca puede inventar una capacidad que no se le haya ofrecido en la lista de candidatas y de que no genera texto libre. Esto lo convierte en un componente determinista y de bajo coste para arquitecturas de agentes donde la trazabilidad de la decisión importa más que la fluidez lingüística.

El modelo se distribuye como adaptador (relación `adapter` respecto al base), ocupa aproximadamente 0,1 GB en el repositorio y está pensado para ejecutarse incluso en CPU, con unas 356 preguntas de test held-out que reportan un 98,6 % de precisión global y un ECE de 0,009. Fue inicializado en caliente desde jaredpalmer/kev-0.6b y ajustado durante 2 épocas sobre ejemplos propios del curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA r16 sobre todas las proyecciones y cabeza pointer de 256 dimensiones |
| Parametros totales | ~0,6 mil millones en el modelo base (Qwen/Qwen3-0.6B-Base); numero exacto de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada para el adaptador; el modelo base Qwen3-0.6B-Base declara 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles; la model card no declara cobertura multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabeza pointer) |
| Modelo base | Qwen/Qwen3-0.6B-Base (relacion: adapter) |
| Modelo de inicializacion | jaredpalmer/kev-0.6b (warm start) |
| Framework de servicio | Kev (Apache 2.0), `kev.serve` |
| Tamano del repositorio | 0,1 GB |
| Endpoint expuesto | `POST /v1/systemone` (compatible con TypeSafe) |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer decoder-only Qwen3 de 0,6 mil millones de parametros al que se le superponen dos componentes: un adaptador LoRA de rango 16 aplicado a todas las proyecciones y una cabeza pointer de 256 dimensiones. La cabeza pointer es la que restringe la salida al conjunto finito de tarjetas de capacidad ofrecidas en la entrada, lo que explica la garantia declarada de que el modelo no puede nombrar una capacidad que no se le haya presentado. La inferencia se resuelve en una única pasada forward, sin decodificacion autoregresiva, y el autor reporta ejecucion tanto en CPU como en GPU.

El entrenamiento arranca desde jaredpalmer/kev-0.6b (warm start) y continua durante 2 epocas sobre un corpus especifico del curso: los 18 pares tarea→capacidad fijados en los `WORKFLOWS` del planificador, formulaciones de objetivos escritas a mano por flujo de trabajo, parafrasis de objetivos y propositos de tarea generadas localmente con gpt-oss:20b a traves de Ollama, registros `none_of_these` construidos eliminando la tarjeta correcta o restringiendo los candidatos a la allowlist de la Sesion 1, y negativos de idoneidad con tarjeta incorrecta. Las etiquetas se heredan de la fuente del curso y, segun el autor, no se utilizo ninguna salida de API de decision alojada. No se documentan fases de RLHF ni DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Clasificacion de decision tipada: dado un estado `{"goal", "task"}`, selecciona una Choice entre las tarjetas de capacidad registradas y la opcion de abste
- Abtencion explicita: emite `none_of_these` cuando la capacidad correcta no esta entre las candidatas (94,7 % de abtencion en el test held-out cuando falta la tarjeta gold).
- Pregunta de idoneidad binaria (fit): responde si/no sobre la adecuacion de una capacidad, con probabilidades calibradas (ECE 0,009).
- Ejecucion en una sola pasada forward: no hay generacion de texto ni decodificacion especulativa; la latencia es la de un unico forward.
- Inferencia en CPU: aproximadamente 1 segundo por pregunta en CPU, sin necesidad de acelerador.
- Integracion con agentes: pensado como componente del planificador de una arquitectura orientada a agentes, sirviendo de enrutador entre tarjetas de capacidad.
- Servicio HTTP compatible con TypeSafe mediante `POST /v1/systemone`.
- No soporta generacion de texto, tool calling en formato textual, vision, audio ni razonamiento multi-paso explicito; estas capacidades quedan fuera del diseno del modelo.

## Casos de uso

- Enrutado de tareas en sistemas multiagente: dado un objetivo y una tarea, el modelo elige que agente o capacidad del registro debe atenderla, con la garantia de que la decision siempre recaera sobre una capacidad declarada en el catalogo.
- Guardarraíl de abtencion: cuando ninguna capacidad registrada encaja con la peticion, el modelo devuelve `none_of_these`, lo que permite derivar la peticion a un humano o a un flujo de escalado en lugar de forzar una asignacion incorrecta.
- Pre-filtro de bajo coste en CPU: al resolver cada consulta en aproximadamente 1 segundo sin GPU, puede colocarse delante de un LLM mayor para descartar o etiquetar peticiones antes de invocar un modelo caro.
- Validacion de asignaciones en pipelines de agentes: la pregunta de idoneidad binaria permite comprobar a posteriori si la capacidad elegida encaja con la tarea, con probabilidades calibradas utilizables como umbral de confianza.
- Orquestacion de flujos de trabajo con catalogo fijo: en entornos donde las herramientas disponibles son un conjunto cerrado y auditado (por ejemplo, un asistente interno con 18 acciones definidas), el modelo actua como selector tipado entre esas acciones.
- Material didactico y evaluación del curso AOA: sirve como implementacion de referencia del patron decision-model dentro de la Agent-Oriented Architecture, utilizable para comparar disenos de planificadores.
- Deteccion de peticiones fuera de catalogo en atencion al cliente: si el cliente pide algo que no corresponde a ninguna de las acciones registradas, el modelo lo marca como no cubierto y evita respuestas inventadas por parte del agente.

## Benchmarks y rendimiento

Datos publicados por el autor sobre un conjunto de test held-out de 356 preguntas, cuyos originales escritos por humanos nunca se usaron en entrenamiento:

| Metrica | Valor | Ambito |
|---|---|---|
| Precision global | 98,6 % | Test held-out (356 preguntas) |
| Choice de agente | 98,1 % | Test held-out |
| Choice sobre los originales | 97,3 % | Subconjunto de originales humanos |
| Abtencion con tarjeta gold ausente | 94,7 % | Registros sin la capacidad correcta |
| Pregunta de idoneidad (fits) | 99,0 % | Test held-out |
| ECE (error de calibracion esperado) | 0,009 | Test held-out |
| Errores con alta confianza | 0,8 % | Test held-out |
| Latencia por pregunta | ~74 ms en GPU DGX Spark; ~1 s en CPU | Inferencia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no serian aplicables dado que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada: en torno a 1,2 GB en fp16 para los pesos del modelo base de 0,6B, mas el coste marginal del adaptador LoRA y la cabeza pointer de 256 dimensiones; aproximadamente 0,6 GB en int8 y 0,4 GB en int4 (estimaciones para un modelo de este tamano, la model card no publica cifras).
- GPU recomendadas: el autor reporta medidas sobre una DGX Spark. Cualquier GPU con 2 GB o mas de memoria es suficiente por tamano; no se documentan requisitos especificos de arquitectura.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta con 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 o superiores). El modelo esta disenado para funcionar incluso sin GPU.
- Despliegue: servicio mediante `python -m kev.serve --run lewisdog/aoa-course-decision-0.6b`; integracion en el curso definiendo `DECISION_MODEL_RUN=lewisdog/aoa-course-decision-0.6b` en el archivo `.env` del servicio `decision`, que carga el modelo desde el Hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI; dado que el modelo no genera texto y usa una cabeza pointer, estos runners no son aplicables directamente.
- Latencia: aproximadamente 74 ms por pregunta en GPU (DGX Spark) y aproximadamente 1 segundo por pregunta en CPU, segun el autor. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Naturaleza | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lewisdog/aoa-course-decision-0.6b | ~0,6B (adaptador sobre Qwen3-0.6B-Base) | Modelo de decision tipado, salida restringida a un catalogo | no especificado | Apache 2.0 | HuggingFace Hub |
| jaredpalmer/kev-0.6b | ~0,6B | Modelo de decision Kev, punto de partida del ajuste | no disponible | no disponible en la informacion proporcionada | HuggingFace Hub |
| Qwen/Qwen3-0.6B-Base | 0,6B | LLM generativo de proposito general | 32.768 tokens declarados por el autor del base | Apache 2.0 | HuggingFace Hub |
| LLM generalista como enrutador | variable | Enrutado por generacion de texto, sin restriccion de catalogo | variable | variable | amplia |

No hay datos publicos de benchmarks comparativos entre estas alternativas en la informacion disponible, por lo que la comparacion se limita a naturaleza, licencia y disponibilidad. La diferencia funcional clave frente al modelo base y frente a un LLM generalista es que este adaptador no genera texto y no puede emitir una capacidad fuera del conjunto ofrecido.

## Limitaciones y advertencias

- Alcance funcional muy restringido: solo responde a la tarea de decision sobre un catalogo de tarjetas de capacidad; no genera texto, codigo ni razonamiento.
- Dependencia fuerte del dominio: fue ajustado sobre los 18 pares tarea→capacidad del curso AOA y formulaciones derivadas de ellos; su comportamiento fuera de ese catalogo no esta documentado.
- Volumen de entrenamiento reducido y en parte sintetico: parte de los datos son parafrasis generadas con gpt-oss:20b via Ollama, lo que puede introducir sesgos o artefactos del generador.
- Riesgo de contaminacion no verificado de forma independiente: el autor afirma que los originales humanos del test nunca se usaron en entrenamiento, pero la evaluacion es propia y no ha sido replicada por terceros.
- Calibracion validada solo en la distribucion del test: el ECE de 0,009 y el 0,8 % de errores con alta confianza corresponden a ese conjunto concreto y no garantizan el mismo comportamiento en produccion con otra distribucion de peticiones.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; los ejemplos y etiquetas del curso estan en ingles, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- Sesgos: no hay evaluacion de sesgos publicada; al heredar etiquetas de la fuente del curso, puede reproducir los sesgos de ese diseno de flujos de trabajo.
- Licencia: Apache 2.0, lo que permite uso comercial, pero al ser un adaptador se heredan las condiciones del modelo base Qwen/Qwen3-0.6B-Base, que conviene revisar por separado.
- Madurez y adopcion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en el Hub; es un artefacto ligado a un curso, no un modelo con soporte mantenido.
- Despliegue: requiere el framework Kev y el modelo base; no es compatible directamente con runners de inferencia generica como llama.cpp, Ollama o vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lewisdog/aoa-course-decision-0.6b
- Repositorio del curso Agent-Oriented Architecture: https://github.com/AgentOrientedArchitecture/aoa-course
- Framework Kev (Apache 2.0): https://github.com/jaredpalmer/kev
- Modelo de inicializacion: https://huggingface.co/jaredpalmer/kev-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los incluidos en la model card y los recogidos arriba.
