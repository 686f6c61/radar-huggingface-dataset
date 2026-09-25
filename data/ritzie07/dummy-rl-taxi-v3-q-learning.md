# ritzie07/dummy-rl-Taxi-v3-q-learning

## Resumen

ritzie07/dummy-rl-Taxi-v3-q-learning es un agente de aprendizaje por refuerzo publicado en HuggingFace por el usuario ritzie07 bajo la etiqueta `reinforcement-learning`. Se trata de una implementacion de Q-learning tabular entrenada sobre el entorno Taxi-v3 de Gymnasium, un problema clasico de despacho de taxis en una cuadricula discreta donde el agente debe recoger y dejar pasajeros minimizando el numero de pasos. No es una red neuronal ni un modelo de lenguaje: no tiene parametros en el sentido habitual, no procesa texto y no dispone de ventana de contexto.

El propio autor lo describe en la model card con la frase "Dummy README to pass course", lo que indica que el artefacto se subio como entregable de un ejercicio academico (probablemente la Unit 2 del curso Deep RL de HuggingFace, dedicada a Q-learning con FrozenLake y Taxi-v3) y no como un sistema pensado para produccion. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas.

Su relevancia es, por tanto, exclusivamente didactica y de referencia: sirve como linea base minima de Q-learning tabular frente a la que comparar variantes mas sofisticadas (DQN, doble Q-learning, SARSA) y como ejemplo del formato de publicacion de agentes RL en el Hub. El unico resultado declarado es un `mean_reward` de 10 +/- 0.0 en Taxi-v3, marcado como no verificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q estado-accion, sin red neuronal) |
| Parametros totales | 0 parametros entrenables en sentido de red neuronal; tabla Q de 500 estados x 6 acciones segun la definicion documentada del entorno Taxi-v3 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales que cuantizar) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular clasico: una tabla que asocia cada par (estado, accion) con un valor Q estimado, actualizada de forma iterativa mediante la ecuacion de Bellman con una politica epsilon-greedy durante la fase de exploracion. No hay red neuronal, ni capas, ni mecanismo de atencion, ni representacion vectorial de entradas. El entorno Taxi-v3 es un grid world discreto con 500 estados y 6 acciones (moverse en cuatro direcciones, recoger pasajero y dejarlo), en el que el agente recibe recompensa positiva al completar un trayecto y penalizaciones por cada paso.

No se dispone de informacion sobre el numero de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento, la politica de exploracion ni el proceso de evaluacion empleado. La model card no incluye hiperparametros ni curvas de aprendizaje, y el README se limita a indicar que es un marcador de posicion para un curso. No hay fases de RLHF, DPO ni ajuste supervisado, ya que no se trata de un modelo generativo.

## Capacidades

- Resolucion del entorno Taxi-v3: el agente selecciona acciones discretas (movimiento, recogida y entrega) para completar trayectos de pasajeros en una cuadricula.
- Aprendizaje por refuerzo tabular: representa y actualiza una funcion de valor Q sobre un espacio de estados finito y discreto.
- Politica de decision determinista en inferencia: dado un estado discreto, devuelve la accion con mayor valor Q.
- Integracion con Gymnasium mediante la API estandar de agentes del curso Deep RL de HuggingFace (carga del modelo y ejecucion de episodios).
- Capacidad de servir como linea base reproducible para comparar algoritmos de RL tabular y profundo.
- No dispone de generacion de texto, razonamiento simbolico general, codigo, matematicas, vision, audio, tool calling, function calling, capacidades de agente multi-paso ni soporte multilingue.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el agente ilustra el ciclo completo de Q-learning tabular (inicializacion de la tabla, exploracion epsilon-greedy, actualizacion de Bellman y evaluacion) en un entorno de 500 estados, lo que permite explicar el algoritmo sin la complejidad anadida de una red neuronal.
- Linea base de referencia en experimentos: cualquier investigacion que pruebe DQN, doble Q-learning, SARSA o metodos basados en politica sobre Taxi-v3 necesita un punto de comparacion tabular; este artefacto cubre ese papel con un resultado declarado de `mean_reward` 10.
- Pruebas de integracion de pipelines de RL: sirve para validar que un harness de evaluacion (carga del agente, ejecucion de episodios, calculo de recompensa media y publicacion de resultados) funciona de extremo a extremo antes de conectar modelos mas costosos.
- Estudios de ablacion de hiperparametros: al ser un agente tabular, permite barrer tasas de aprendizaje, factores de descuento y schedules de epsilon con un coste computacional minimo y aislar el efecto de cada variable.
- Verificacion de compatibilidad de entornos: util para comprobar el comportamiento de un agente entrenado en Taxi-v3 cuando se ejecuta sobre la version actual del entorno (Taxi-v4) en Gymnasium, un problema documentado en proyectos similares.
- Demostraciones y material de clase: al no requerir GPU y ocupar apenas unos kilobytes, puede distribuirse y ejecutarse en cualquier portatil o incluso en un cuaderno Colab gratuito durante una sesion practica.
- Referencia de formato de publicacion: ejemplifica como estructurar una model card con `model-index` y metricas declaradas para publicar agentes de RL en el Hub.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Verificado | Notas |
|---|---|---|---|---|
| Taxi-v3 | mean_reward | 10 +/- 0.0 | No | Dato declarado por el autor en el `model-index` |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), ya que el modelo no es un modelo de lenguaje. Conviene senalar que una desviacion estandar de 0.0 con un unico valor reportado sugiere una evaluacion sobre un numero muy reducido de episodios o un resultado determinista, por lo que la significacion estadistica de la metrica es limitada y no permite afirmar que el agente haya convergido a una politica optima.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; el agente es una tabla de valores discretos y se ejecuta integramente en CPU.
- Memoria RAM: del orden de kilobytes para almacenar la tabla Q (500 estados x 6 acciones de numeros en coma flotante).
- GPU recomendadas: ninguna; no se requiere acelerador grafico ni para entrenamiento ni para inferencia.
- Compatibilidad con GPU de consumo: no aplica, ya que no hay cargas tensoriales que ejecutar.
- Opciones de despliegue: carga mediante la API de agentes del curso Deep RL de HuggingFace sobre Gymnasium; los servidores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama) no son aplicables porque no existen pesos neuronales ni tokenizador.
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica la inferencia es una consulta a una tabla en memoria y el cuello de botella es el bucle de simulacion del entorno, no el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Resultado declarado |
|---|---|---|---|---|---|---|
| ritzie07/dummy-rl-Taxi-v3-q-learning | Q-learning tabular | Taxi-v3 | 0 (tabla Q) | no aplica | no disponible | mean_reward 10 +/- 0.0 (no verificado) |
| ritzie07/q-learning-Taxi-v3 | Q-learning tabular | Taxi-v3 / Taxi-v4 | 0 (tabla Q) | no aplica | no disponible | no disponible |
| richdanis/rl-taxi | Q-learning tabular | Taxi-v3 | 0 (tabla Q) | no aplica | no disponible | no disponible |

Los tres artefactos pertenecen a la misma categoria (agentes tabulares de Q-learning sobre el entorno Taxi), por lo que la comparacion relevante es de reproducibilidad y de metodologia de evaluacion, no de arquitectura. No se dispone de resultados de benchmarks publicados para las alternativas, lo que impide establecer una comparacion cuantitativa de rendimiento. Frente a agentes de RL profundo (por ejemplo DQN) sobre el mismo entorno, la diferencia esperable es de capacidad de generalizacion, pero no se dispone de datos verificados en la informacion proporcionada para respaldar esa afirmacion con cifras.

## Limitaciones y advertencias

- El README del repositorio contiene literalmente "Dummy README to pass course": el artefacto se publico como entregable academico, no como sistema validado, por lo que no debe tratarse como un modelo listo para produccion.
- No se declara licencia, lo que impide determinar si su uso comercial esta permitido; ante la ausencia de licencia explicita debe asumirse que no hay autorizacion clara de reutilizacion.
- El unico resultado reportado (`mean_reward` 10 +/- 0.0) esta marcado como no verificado y presenta desviacion estandar nula, lo que apunta a una evaluacion con muy pocos episodios y a una fiabilidad estadistica baja.
- No se documentan hiperparametros de entrenamiento, numero de episodios, semillas ni protocolo de evaluacion, por lo que el resultado no es reproducible a partir de la informacion publica.
- Al ser un agente tabular, no generaliza a estados no vistos ni a variaciones del entorno: la tabla solo cubre los 500 estados discretos de Taxi-v3 y no transferira a entornos continuos o de mayor dimensionalidad.
- No tiene capacidades de lenguaje, vision, audio, tool calling ni razonamiento multi-paso; cualquier caso de uso que requiera esas funciones queda fuera de su alcance.
- Posible incompatibilidad de entorno: Taxi-v3 es el objetivo del ejercicio, pero el runtime actual de Gymnasium usa Taxi-v4, por lo que la evaluacion puede requerir ajustes y los resultados no son directamente portables entre versiones.
- Riesgo de sesgo de politica: una politica entrenada con epsilon-greedy y pocos episodios puede quedar atrapada en comportamientos suboptimos (por ejemplo, penalizaciones repetidas por recogidas o entregas invalidas) sin que la metrica declarada lo refleje.
- Las fechas de creacion y actualizacion registradas (24 de septiembre de 2026, con dos segundos de diferencia) y la ausencia total de descargas refuerzan la consideracion de artefacto de prueba mas que de modelo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ritzie07/dummy-rl-Taxi-v3-q-learning
- Agente relacionado del mismo autor: https://huggingface.co/ritzie07/q-learning-Taxi-v3
- Agente tabular alternativo en el Hub: https://huggingface.co/richdanis/rl-taxi
- Repositorio de referencia con Q-Learning sobre Taxi-v3: https://github.com/yatheshl/Q-Learning-Taxi-v3
- Cuaderno Unit 2 del curso Deep RL de HuggingFace (Q-Learning con FrozenLake-v1 y Taxi-v3): https://colab.research.google.com/github/huggingface/deep-rl-class/blob/master/notebooks/unit2/unit2.ipynb
- Cuaderno de proyecto de Q-learning tabular sobre Taxi-v3: https://colab.research.google.com/github/VizuaraAI/RL-in-Production-Bootcamp-Resources/blob/main/lectures/02-dqn/assignments/Project_1_QLearning_Taxi.ipynb
