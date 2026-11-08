# someonecooool/course-q-Taxi-v3-20261108

## Resumen

El modelo `someonecooool/course-q-Taxi-v3-20261108` es un agente de aprendizaje por refuerzo basado en Q-learning tabular, entrenado desde cero sobre el entorno Taxi-v3 de Gymnasium. Lo desarrolla el usuario `someonecooool` como parte del ejercicio practico de la Unidad 2 del curso de Deep Reinforcement Learning de Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q almacenada que mapea los 500 estados discretos del entorno Taxi-v3 a las 6 acciones posibles.

El problema que resuelve es el clasico control de politica optima en un entorno de cuadricula (gridworld) con recogida y entrega de pasajeros, donde el agente debe aprender a maximizar la recompensa acumulada. Su relevancia es fundamentalmente educativa y de referencia: sirve como linea base de Q-learning tabular frente a metodos de deep RL, y permite reproducir el entrenamiento con los hiperparametros documentados.

El entrenamiento se realizo durante 50.000 episodios con semilla 42, tasa de aprendizaje 0.7 y factor de descuento 0.95, con decaimiento de epsilon desde 1.0 hasta 0.05. La evaluacion se hizo sobre 1.000 episodios con semillas 10000 a 10999, separadas del entrenamiento, obteniendo una recompensa media de 7.911 con desviacion tipica de 2.575.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q de estados-acciones) |
| Parametros totales | no disponible como red neuronal; tabla Q de 500 estados x 6 acciones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de 500 estados discretos) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | tabla Q serializada (formato exacto no especificado en la model card) |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular puro, sin redes neuronales. El agente mantiene una tabla Q de dimension 500 x 6 (500 estados del entorno Taxi-v3, 6 acciones discretas: sur, norte, este, oeste, recoger pasajero y dejar pasajero). La actualizacion sigue la regla estandar de Q-learning con tasa de aprendizaje 0.7 y factor de descuento 0.95. La exploracion usa una politica epsilon-greedy con decaimiento desde 1.0 hasta 0.05.

El entrenamiento se ejecuto durante 50.000 episodios con semilla 42. No se emplearon datos externos, RLHF ni DPO, dado que se trata de aprendizaje por refuerzo en un entorno simulado. La evaluacion se realizo con 1.000 episodios y semillas 10000 a 10999, disjuntas de las de entrenamiento, lo que permite medir generalizacion sobre estados visitados y no visitados. El repositorio incluye la tabla Q guardada, los ajustes de entrenamiento y todas las recompensas de evaluacion, ademas de un archivo `replay.gif` con una reproduccion del agente.

## Capacidades

- Control de politica en el entorno Taxi-v3: selecciona la accion optima en cada uno de los 500 estados discretos.
- Recogida y entrega de pasajeros: completa el ciclo completo de la tarea (recoger, navegar, dejar).
- Generalizacion limitada: funciona sobre los estados del entorno Taxi-v3, no sobre entornos nuevos ni variaciones del mapa.
- Reproducibilidad: semilla de entrenamiento, hiperparametros y recompensas de evaluacion documentados.
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, ni capacidades multilingues.
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo reproducible de Q-learning tabular para comparar con metodos de deep RL (DQN, PPO) en el mismo entorno.
- Linea base de referencia: permite establecer un suelo de rendimiento (recompensa media 7.911) contra el que medir algoritmos mas complejos sobre Taxi-v3.
- Verificacion de implementaciones: util para validar una implementacion propia de Q-learning reproduciendo los hiperparametros documentados (lr 0.7, gamma 0.95, 50.000 episodios).
- Estudio de exploracion: el decaimiento de epsilon desde 1.0 hasta 0.05 permite analizar el equilibrio exploracion-explotacion en entornos discretos.
- Analisis de varianza: la desviacion tipica de 2.575 sobre 1.000 episodios permite estudiar la dispersion de recompensas en el entorno Taxi-v3.
- Benchmarking educativo: comparar distintos agentes Q-learning publicados en Hugging Face (por ejemplo `santhoshkollu/q-Taxi-v3` o `itsaysouvyk/q-Taxi-v3`) bajo las mismas condiciones de evaluacion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por Hugging Face):

| Metrica | Valor |
|---|---|
| Dataset | Taxi-v3 |
| Tarea | reinforcement-learning |
| Recompensa media (mean_reward) | 7.91 +/- 2.57 |
| Recompensa media exacta | 7.911 |
| Desviacion tipica | 2.575 |
| Puntuacion del curso (media - desviacion) | 5.336 |
| Episodios de evaluacion | 1.000 (semillas 10000-10999) |
| Episodios de entrenamiento | 50.000 (semilla 42) |
| Verificado | false |

## Requisitos de hardware

- VRAM: no aplica. La tabla Q es una estructura de 500 x 6 valores, del orden de unos pocos kilobytes en memoria.
- GPU: no requiere GPU. La inferencia es una consulta a tabla (indexacion por estado) que se ejecuta en CPU en microsegundos.
- Consumer GPU: irrelevante; funciona en cualquier CPU, incluidos Raspberry Pi y entornos embebidos.
- Despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Se integra como objeto Python (por ejemplo, un array NumPy o un diccionario) dentro del bucle del entorno Gymnasium.
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica, la consulta a tabla es O(1) y el cuello de botella es el propio entorno Taxi-v3.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa media | Contexto | Licencia |
|---|---|---|---|---|---|
| someonecooool/course-q-Taxi-v3-20261108 | Taxi-v3 | Q-learning tabular | 7.91 +/- 2.57 | 500 estados | no disponible |
| santhoshkollu/q-Taxi-v3 | Taxi-v3 | Q-learning | no disponible | 500 estados | no disponible |
| itsaysouvyk/q-Taxi-v3 | Taxi-v3 | Q-learning | no disponible | 500 estados | no disponible |

Los modelos comparables encontrados en la busqueda web no publican sus metricas de recompensa en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Alcance restringido: el agente solo opera sobre el entorno Taxi-v3; no generaliza a otros entornos ni a variaciones del mapa.
- Rendimiento moderado: la recompensa media de 7.911 esta por debajo del optimo teorico del entorno (cercano a 8-9 en politica optima), con una desviacion tipica alta (2.575) que indica episodios con recompensas muy dispares.
- Sin verificacion: los resultados estan marcados como `verified: false`; no han sido validados de forma independiente.
- Licencia no especificada: al no declararse licencia, no se garantiza el uso comercial ni la redistribucion. Se debe contactar con el autor antes de cualquier uso en produccion.
- Idiomas no disponibles: no aplica, dado que no procesa lenguaje natural.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos; el agente puede tomar decisiones suboptimas en estados poco visitados durante el entrenamiento.
- Sesgo de exploracion: el decaimiento de epsilon hasta 0.05 deja un 5 por ciento de acciones aleatorias en inferencia si no se desactiva la exploracion, lo que degrada el rendimiento si no se evalua en modo greedy.
- Repositorio vacio en cuanto a tamano (0.0 GB): conviene verificar que los artefactos (tabla Q, replay.gif) estan efectivamente disponibles antes de depender de ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/someonecooool/course-q-Taxi-v3-20261108
- Ejercicio del curso HF Deep RL Unit 2: https://huggingface.co/learn/deep-rl-course/en/unit2/hands-on
- Modelo comparable santhoshkollu/q-Taxi-v3: https://huggingface.co/santhoshkollu/q-Taxi-v3
- Modelo comparable itsaysouvyk/q-Taxi-v3: https://huggingface.co/itsaysouvyk/q-Taxi-v3
