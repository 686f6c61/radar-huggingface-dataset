# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-60traj

## Resumen

RoboTalk-Qwen3-VL-8B-Instruct-60traj es un adaptador LoRA de una sola época entrenado por DorianAtSchool sobre el modelo base Qwen/Qwen3-VL-8B-Instruct. No es un modelo autónomo: es un adaptador PEFT que debe cargarse junto con los pesos y el procesador del modelo Qwen original. Su tarea es predecir la siguiente llamada a herramienta dentro de un protocolo de coordinación multiagente con dos agentes que operan sobre contextos parcialmente observables y siguen un esquema coordinador-seguidor.

El adaptador se ha entrenado sobre 60 trayectorias por tarea de entrenamiento en 43 tareas del dataset RoboTalk (2.580 trayectorias), con 10 tareas adicionales reservadas para evaluación. La entrada combina observaciones visuales por agente, historiales privados y definiciones globales de herramientas; la salida es la siguiente acción en forma de llamada a herramienta. Esto lo sitúa en el terreno de la investigación en coordinación de alto nivel dentro de un simulador doméstico, no en el control directo de hardware.

Su relevancia actual es doble: por un lado, demuestra que un adaptador LoRA de rango 16 puede especializar un VLM de 8B en un protocolo multiagente con contexto parcialmente observable; por otro, publica una evaluación de bucle cerrado con intervalos de confianza de Wilson, algo poco habitual en adaptadores de robótica de este tamaño. La brecha entre tareas vistas (87,91 % de éxito sin errores) y tareas reservadas (64,00 %) es el dato más informativo del repositorio para quien evalúe su generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language del modelo base Qwen3-VL-8B-Instruct, con adaptador LoRA (rank 16, alpha 32, dropout 0,05) sobre el lenguaje |
| Parametros totales | 8B en el modelo base (no disponible el recuento exacto de parametros del adaptador; el repositorio ocupa 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso secuencias de hasta 8.192 tokens incluidos los tokens visuales |
| Tipos de cuantizacion | no disponible para el adaptador; al ser LoRA, la cuantizacion aplicable es la del modelo base sobre el que se cargue |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible; la model card indica que no asigna licencia separada para el adaptador y remite a la licencia Apache-2.0 del modelo base Qwen |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen3-VL-8B-Instruct, un transformer vision-language multimodal que procesa imagenes y texto y genera texto. El ajuste se hace exclusivamente sobre los pesos del modelo de lenguaje mediante LoRA: la model card especifica explicitamente que el adaptador liberado contiene pesos LoRA del modelo de lenguaje y no un backbone de vision ajustado por separado. Los hiperparametros son rank 16, alpha 32, dropout 0,05, learning rate 1e-4, weight decay 0,01, schedule coseno con 3 % de warmup, una sola epoca y semilla 42. El batch efectivo es de 64 sobre cuatro GPU, con limite de secuencia de 8.192 tokens incluidos los tokens visuales.

Los datos proceden del dataset RoboTalk: 60 trayectorias por tarea de entrenamiento en 43 tareas (2.580 trayectorias) y 10 tareas reservadas. El objetivo de prediccion es la siguiente llamada a herramienta. Una unica politica compartida controla dos agentes con contextos parcialmente observables y un protocolo coordinador-seguidor. Los historiales no incluyen indices de paso. Los conjuntos de mayor escala contienen las selecciones de menor escala. Los detalles saneados de configuracion estan en training_config.json y la pertenencia de tareas en task_split.json; no se incluyen estados del optimizador ni rutas de la maquina de entrenamiento. La model card no menciona fases de RLHF ni DPO.

## Capacidades

- Generacion multimodal de siguiente accion: dado un objetivo de tarea, un estado inicial, definiciones globales de herramientas, observaciones visuales por agente e historiales privados, produce la siguiente llamada a herramienta.
- Tool calling nativo mediante la plantilla de chat del modelo base; la model card insiste en que reproducir las puntuaciones exige usar esa plantilla y no un prompt de chat generico.
- Coordinacion multiagente: una sola politica compartida gobierna dos agentes bajo un protocolo coordinador-seguidor con contextos parcialmente observables.
- Razonamiento multi-paso dentro de un episodio, ya que la salida se encadena en bucle cerrado hasta alcanzar el objetivo simbolico.
- Percepcion visual: consume observaciones visuales de cada agente ademas del texto del historial y de las definiciones de herramientas.
- Modo de evaluacion instruct y modo thinking: la evaluacion usa presupuestos de salida distintos (256 tokens en instruct, 2.048 en thinking) y temperaturas distintas.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No incluye control de hardware de bajo nivel ni capacidades de seguridad; su alcance declarado es la coordinacion de alto nivel en simulador.

## Casos de uso

- Investigacion en coordinacion multiagente: usar el adaptador como politica de referencia en entornos con dos agentes y observabilidad parcial, comparando el exito en tareas vistas frente a reservadas para medir generalizacion.
- Evaluacion de protocolos de comunicacion coordinador-seguidor: el modelo permite aislar el efecto del protocolo y del reparto de informacion privada entre agentes, manteniendo fijo el modelo de lenguaje.
- Generacion de trayectorias sinteticas para simuladores domesticos: ejecutar el adaptador en bucle cerrado sobre el simulador RoboTalk para producir episodios etiquetados con llamadas a herramienta que alimenten otros entrenamientos.
- Punto de partida para nuevos ajustes LoRA en robotica: al ser un adaptador de 0,2 GB sobre un base de 8B, sirve como inicializacion barata para especializar otras tareas con presupuestos de computo reducidos.
- Benchmark de generalizacion con cohortes fijas: su esquema 43/10 de tareas con intervalos de Wilson permite reutilizar la metodologia para comparar variantes de modelos o de datos.
- Analisis de fallos en tool calling: como el objetivo es la siguiente llamada a herramienta, el adaptador es util para estudiar errores de seleccion de herramienta y de argumentos en pipelines de agentes con vision.
- Prototipado de asistentes domesticos de alto nivel en simulacion, siempre que la evaluacion se haga sobre el simulador y no sobre hardware real.

## Benchmarks y rendimiento

La model card publica una evaluacion de bucle cerrado con comunicacion completa, diez episodios por tarea y muestreo nativo de cohorte fija 43/10. El exito sin errores (FSM) significa alcanzar el objetivo simbolico sin llamadas rechazadas; los intervalos son intervalos de Wilson al 95 % sobre episodios, no sobre tareas remuestreadas.

| Split | Exitos sin errores / episodios | Tasa de exito | Intervalo 95 % |
|---|---:|---:|---:|
| in_training_tasks | 378/430 | 87,91 % | 84,48–90,66 % |
| held_out_tasks | 64/100 | 64,00 % | 54,24–72,73 % |

Ajustes de inferencia declarados: en modo instruct, temperatura 0 y presupuesto de salida de 256 tokens; en modo thinking, temperatura 0,6, top-p 0,95, top-k 20 y presupuesto de salida de 2.048 tokens. Los recuentos exactos y la configuracion de evaluacion estan en evaluation_results.json. No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 8B, los pesos en bfloat16 rondan los 16 GB, a los que se suman el cache KV, las activaciones y los tokens visuales. Con secuencias de hasta 8.192 tokens conviene presupuestar 24 GB o mas por instancia.
- GPU recomendadas: no disponibles en la informacion proporcionada. El modelo base de 8B en bfloat16 encaja en tarjetas de 24 GB (RTX 4090, A10G, L40S) y en aceleradores de 40/80 GB (A100, H100) para lotes mayores o mayor resolucion visual.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o superiores en bfloat16; en tarjetas de 16 GB o menos seria necesario recurrir a cuantizacion del modelo base o a reducir el numero de tokens visuales y la longitud de secuencia.
- Opciones de despliegue: al ser un adaptador PEFT, el camino documentado es Transformers (con soporte Qwen3-VL) mas PEFT, cargando el procesador del modelo base; tambien puede fusionarse con los pesos base para servir con vLLM, TGI o llama.cpp/Ollama si el base se convierte al formato correspondiente. La model card solo documenta y garantiza la ruta Transformers + PEFT.
- Latencia y throughput: no disponibles. Como referencia de carga, la evaluacion del modo instruct limita la salida a 256 tokens y la del modo thinking a 2.048 tokens.
- Entrenamiento: una epoca con batch efectivo 64 sobre cuatro GPU y secuencias de 8.192 tokens. No se especifica el modelo de GPU ni las horas de computo empleadas.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados en la informacion proporcionada. La comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Instruct-60traj | 8B (base) + adaptador LoRA | no disponible (entrenado a 8.192 tokens) | 87,91 % en tareas vistas, 64,00 % en reservadas (FSM sin errores) | no disponible; base Apache-2.0 | adaptador publico en HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | 8B | no disponible en la informacion proporcionada | no disponible para la tarea RoboTalk | Apache-2.0 segun la model card | publico en HuggingFace |
| Otros adaptadores o VLAs de robotica de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance restringido: la model card declara que el modelo es para investigacion sobre coordinacion de alto nivel en un simulador domestico, no para control directo de hardware ni despliegue critico para la seguridad.
- Metrica simbolica: el exito FSM es una metrica de tarea simbolica y no implica necesariamente que se cumplan todos los criterios fisicos nativos del entorno.
- Brecha de generalizacion: la caida del 87,91 % al 64,00 % entre tareas vistas y reservadas indica sobreajuste a las tareas y al protocolo de entrenamiento.
- Dependencia fuerte del formato de entrada: reproducir las puntuaciones exige el objetivo de la tarea, el estado inicial, las definiciones globales de herramientas, las observaciones visuales por agente, los historiales privados y el protocolo de comunicacion completo; un prompt de chat generico no es suficiente.
- Historiales sin indices de paso: el modelo no recibe informacion explicita del numero de paso, lo que puede dificultar el seguimiento temporal en episodios largos.
- Idioma: unicamente ingles segun la etiqueta del repositorio.
- Licencia: la model card no asigna licencia propia al adaptador y remite a la Apache-2.0 del modelo base; para uso comercial hay que verificar los terminos del repositorio del modelo base.
- Vision no ajustada: solo se adaptan los pesos del modelo de lenguaje, por lo que la percepcion visual hereda las limitaciones y posibles sesgos del base Qwen3-VL.
- Riesgo de alucinacion de llamadas a herramienta o de argumentos invalidos: la metrica de exito sin errores penaliza llamadas rechazadas, pero el modelo puede emitir herramientas inexistentes o fuera del conjunto definido.
- Sin datos publicos: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados declarados.
- Sesgos: no disponibles de forma especifica para este adaptador; los sesgos del modelo base y del dataset RoboTalk no se documentan en la informacion proporcionada.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-60traj
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Configuracion de entrenamiento: training_config.json en el repositorio del adaptador
- Reparto de tareas: task_split.json en el repositorio del adaptador
- Resultados de evaluacion: evaluation_results.json en el repositorio del adaptador
- Papers, blogs, repos adicionales o demos: no disponibles en la informacion proporcionada (la busqueda web no devolvio resultados relacionados con el modelo)
