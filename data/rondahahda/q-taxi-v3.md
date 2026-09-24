# rondahahda/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo basado en Q-Learning tabular, entrenado para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario rondahahda en Hugging Face como parte de la Unidad 2 del curso Deep RL de Hugging Face, y se distribuye como un unico fichero `q-learning.pkl` que contiene la tabla Q y el identificador del entorno. No es un modelo de lenguaje ni una red neuronal profunda: es una tabla de valores estado-accion asociada a un espacio de estados discreto y finito.

El problema que resuelve es el clasico de control secuencial de Taxi-v3: un taxi debe recoger a un pasajero en una de las cuatro localizaciones posibles y dejarlo en su destino, gestionando el nivel de combustible y evitando movimientos ilegales, con 500 estados discretos y 6 acciones posibles. La relevancia de este tipo de publicaciones es fundamentalmente docente y de referencia: sirve como linea base reproducible para comparar algoritmos mas complejos (DQN, PPO, A2C) sobre el mismo entorno, y como ejemplo minimo de integracion con el Hub mediante `load_from_hub`.

El modelo no declara licencia, idiomas ni arquitectura neuronal, y su repositorio ocupa menos de 0,1 GB. El unico resultado de rendimiento publicado es una recompensa media de 8,15 +/- 2,62 en Taxi-v3, marcada como no verificada en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion), no neuronal |
| Parametros totales | No disponible como recuento de parametros; el espacio de Taxi-v3 tiene 500 estados discretos y 6 acciones, lo que implica una tabla Q de 3.000 entradas si esta completamente poblada (dato derivado del entorno, no declarado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el "contexto" es un unico estado discreto) |
| Tipos de cuantizacion | No disponible (no aplica; los valores Q se almacenan en el pickle en su tipo original) |
| Idiomas soportados | No disponible (no aplica; el agente no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Pickle de Python (fichero `q-learning.pkl`) |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0,0 GB (menos de 0,1 GB) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |
| Fecha de actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificarla como un agente de Q-Learning entrenado en Taxi-v3. Por la naturaleza del entorno, se trata de Q-Learning tabular: una tabla que asigna un valor Q a cada par (estado, accion) y que se actualiza de forma off-policy mediante la ecuacion de diferencia temporal de Q-Learning. No hay red neuronal, ni capas, ni tokenizador, ni mecanismo de atencion.

Tampoco se documentan en la informacion disponible los hiperparametros de entrenamiento (tasa de aprendizaje alfa, factor de descuento gamma, politica de exploracion epsilon-greedy o su decaimiento), el numero de episodios, el criterio de parada ni la semilla utilizada. La model card unicamente indica que el entrenamiento se realizo en el marco de la Unidad 2 del curso Deep RL de Hugging Face, cuyo flujo de trabajo habitual incluye el registro del agente en el Hub y la evaluacion sobre 100 episodios consecutivos.

## Capacidades

- Control discreto en el entorno Taxi-v3: selecciona una de las 6 acciones (moverse al norte, sur, este u oeste, recoger pasajero y dejar pasajero) dado un estado discreto.
- Politica greedy derivada de la tabla Q, sin necesidad de GPU para inferencia.
- Carga directa desde el Hub mediante `load_from_hub(repo_id="rondahahda/q-Taxi-v3", filename="q-learning.pkl")` y ejecucion con `gym.make(model["env_id"])`.
- Reproduccion de un experimento docente de RL, util como referencia de implementacion minima.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del propio bucle episodico del entorno.
- No tiene capacidades multilingues; no procesa lenguaje natural.
- No dispone de modo de razonamiento explicito (thinking mode), audio ni ninguna otra modalidad.

## Casos de uso

- Material docente en cursos de aprendizaje por refuerzo: se puede cargar en un cuaderno de Jupyter para ilustrar la diferencia entre metodos tabulares y metodos con aproximacion de funcion, mostrando el bucle episodico completo sobre Taxi-v3.
- Linea base para comparativas de algoritmos: al fijar la recompensa media en 8,15 +/- 2,62 sobre el mismo entorno y presupuesto de evaluacion, sirve como punto de referencia frente a DQN, PPO o A2C entrenados en Taxi-v3.
- Verificacion de integracion con el ecosistema de Hugging Face: util para comprobar el funcionamiento de `load_from_hub`, el registro de agentes y el formato de model card con `model-index` en pipelines de CI de proyectos de RL.
- Pruebas de infraestructura de evaluacion: al no requerir GPU y consumir un fichero de pocos kilobytes, permite validar de extremo a extremo un runner de evaluacion de agentes (carga, ejecucion de episodios, agregacion de recompensas) en entornos sin acelerador.
- Abstraccion didactica de problemas de recogida y entrega: el esquema estado-accion de Taxi-v3, con puntos de recogida, destino y restricciones de movimiento, se usa habitualmente para explicar problemas de planificacion logistica simplificada antes de escalar a simuladores realistas.
- Generacion de trayectorias para investigacion: se pueden volcar secuencias (estado, accion, recompensa) para analisis de politicas, calculo de retornos descontados o estudio de la varianza de la recompensa entre episodios.
- Test de regresion en librerias de RL: sirve como caso pequeno y determinista para comprobar que una actualizacion de Gymnasium, de la version de Python o del serializador de pickle no rompe la carga de agentes antiguos.
- Demostracion de agentes tabulares en articulos o charlas: la desviacion tipica de 2,62 en la recompensa permite ilustrar de forma tangible la varianza entre ejecuciones y la necesidad de promediar sobre multiples episodios.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. La metrica figura como no verificada.

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 8,15 +/- 2,62 | No |

Como referencia externa, en el material del curso Deep RL de Hugging Face se suele considerar que el entorno Taxi-v3 esta resuelto cuando la recompensa media supera 8,0 de forma sostenida. El valor declarado queda justo por encima de ese umbral, con una desviacion tipica de 2,62 que indica una varianza elevada entre episodios.

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), algo esperable dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. La inferencia consiste en una consulta a una tabla, no requiere acelerador.
- GPU recomendadas: ninguna. El agente se ejecuta en CPU.
- Compatibilidad con GPU de consumo: irrelevante; no se necesita GPU de ningun tipo (ni RTX 4090 ni similares).
- Memoria RAM: del orden de kilobytes para el fichero `q-learning.pkl` y el proceso de Python con Gymnasium.
- Opciones de despliegue: script de Python con `gymnasium` y `huggingface_hub` (`load_from_hub`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que estos servidores estan pensados para modelos de lenguaje y no para agentes tabulares de RL.
- Latencia estimada: del orden de microsegundos por decision, al ser una consulta a tabla con 500 estados y 6 acciones.
- Throughput estimado: no disponible en la informacion proporcionada; en la practica esta limitado por el bucle del entorno de Gymnasium y no por el modelo.

## Comparativa con modelos similares

No se dispone de datos publicados de los artefactos comparables (otros agentes de la Unidad 2 del curso Deep RL publicados en el Hub, agentes DQN sobre Taxi-v3 o implementaciones de PPO/A2C sobre el mismo entorno) en la informacion proporcionada. La comparativa se limita a la categoria de algoritmo.

| Modelo / categoria | Parametros | Contexto | Rendimiento en Taxi-v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rondahahda/q-Taxi-v3 | Tabla Q tabular (entorno de 500 estados y 6 acciones) | Un estado discreto por decision | 8,15 +/- 2,62 (mean_reward, no verificado) | No disponible | Publico en Hugging Face, 0 descargas |
| Agente DQN sobre Taxi-v3 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Agente PPO/A2C sobre Taxi-v3 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Q-Learning tabular de referencia (implementacion propia) | Tabla Q equivalente | Un estado discreto por decision | No disponible | No disponible | Depende de la implementacion |

Como referencia cualitativa, la ventaja de un enfoque tabular frente a DQN o PPO en Taxi-v3 es la simplicidad y la velocidad de entrenamiento y de inferencia; su desventaja es que la tabla Q no generaliza a otros entornos ni a variaciones del espacio de estados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no debe evaluarse con benchmarks de NLP.
- La tabla Q esta indexada por el identificador de estado de Taxi-v3. Cualquier cambio en la definicion del entorno, en el numero de estados o en el orden de las acciones invalida la politica aprendida.
- Sin capacidad de generalizacion: no transfiere conocimiento a entornos distintos ni a variantes de Taxi-v3 con distinto numero de localizaciones o de pasajeros.
- Varianza elevada: la desviacion tipica declarada de 2,62 sobre una media de 8,15 indica episodios claramente por debajo y por encima del umbral, por lo que una unica ejecucion no es representativa.
- Resultado no verificado: el valor de `mean_reward` figura con `verified: false`, por lo que no ha sido reproducido de forma independiente.
- Sin licencia declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Formato pickle: la carga de ficheros `.pkl` implica ejecucion de codigo durante la deserializacion, lo que supone un riesgo de seguridad si el fichero no procede de una fuente de confianza. En entornos de produccion conviene aislar el proceso o validar el contenido antes de cargarlo.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de funcionamiento mas alla de la model card.
- Ausencia de documentacion de entrenamiento: no se indican hiperparametros, semilla ni numero de episodios, lo que dificulta la reproduccion exacta del resultado.
- No aplicable a despliegues de inferencia de LLM: no funciona con vLLM, Ollama, llama.cpp ni TGI.
- Idiomas: no disponible; el agente no procesa texto y por tanto no tiene capacidades multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rondahahda/q-Taxi-v3
- Fichero de pesos: https://huggingface.co/rondahahda/q-Taxi-v3/blob/main/q-learning.pkl
- Curso Deep RL de Hugging Face (Unidad 2, contexto de entrenamiento): https://huggingface.co/learn/deep-rl-course/unit2/introduction
- Entorno Taxi-v3 en Gymnasium (documentacion del entorno): https://gymnasium.farama.org/environments/toy_text/taxi/
- No se han encontrado en la informacion proporcionada papers, blogs ni demos adicionales asociados a este modelo.
