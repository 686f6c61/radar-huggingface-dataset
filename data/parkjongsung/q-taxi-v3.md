# parkjongsung/q-Taxi-v3

## Resumen

`parkjongsung/q-Taxi-v3` es un agente de aprendizaje por refuerzo basado en Q-Learning tabular, entrenado para resolver el entorno `Taxi-v4` (tambien referido como Taxi-v3 en la model card) de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementacion personalizada de Q-Learning que aprende una tabla de valores Q para el clasico problema del taxi, en el que un agente debe recoger y dejar pasajeros en una cuadricula de 5x5 con 4 ubicaciones posibles.

El modelo lo publica el usuario de Hugging Face `parkjongsung` y se distribuye a traves del Hub con el pipeline `reinforcement-learning`. El repositorio tiene un tamano de 0.0 GB (los pesos se almacenan como un fichero `q-learning.pkl`, lo que es coherente con una tabla Q de dimensiones reducidas) y no cuenta con descargas ni likes en el momento de la consulta.

Su relevancia es fundamentalmente didactica: sirve como ejemplo minimo reproducible de un agente Q-Learning entrenado con la libreria de RL de Hugging Face, y permite ilustrar el flujo de `load_from_hub` para cargar politicas tabulares. No debe confundirse con un modelo fundacional ni emplearse en tareas de generacion de texto, vision o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (implementacion personalizada, sin red neuronal) |
| Parametros totales | no disponible (tabla Q sobre el espacio de estados de Taxi-v4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones discretas) |
| Tipos de cuantizacion | no disponible (pesos en formato pickle, no cuantizables) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning clasico, un algoritmo de aprendizaje por refuerzo off-policy y sin modelo que estima la funcion de valor-accion Q(s, a) mediante actualizaciones de la ecuacion de Bellman. En este caso la implementacion es tabular: se mantiene una tabla Q indexada por el estado discreto del entorno Taxi-v4 (500 estados posibles) y las 6 acciones del agente (moverse norte, sur, este, oeste, recoger pasajero y dejar pasajero). No hay funcion de aproximacion, red neuronal, atencion ni mecanismo de contexto.

No se dispone de informacion sobre hiperparametros de entrenamiento (tasa de aprendizaje, factor de descuento, politica epsilon-greedy, numero de episodios) ni sobre la composicion del dataset, ya que el entrenamiento se realiza por interaccion con el simulador del entorno. Tampoco se documenta el uso de tecnicas como Double Q-Learning, SARSA o replay buffer. La model card unicamente indica que se trata de un agente Q-Learning entrenado para Taxi-v3/v4 y muestra el snippet de carga mediante `load_from_hub`.

## Capacidades

- Resolucion del entorno Taxi-v4 de Gymnasium: recoger y dejar pasajeros en una cuadricula 5x5 con obstaculos y cuatro ubicaciones.
- Politica greedy derivada de la tabla Q aprendida, explotable en inferencia sin exploracion.
- Carga directa desde el Hub mediante `load_from_hub(repo_id=..., filename="q-learning.pkl")`.
- Integracion con `gym.make(model["env_id"])` para reconstruir el entorno asociado.
- No soporta tool calling, function calling ni agentes multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues, de vision, audio ni generacion de texto.
- No dispone de modo thinking, razonamiento simbólico ni planificacion de largo horizonte mas alla del propio MDP.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo minimo para explicar Q-Learning tabular, la ecuacion de Bellman y la diferencia entre politica epsilon-greedy y politica greedy en clase o tutoriales.
- Verificacion de pipelines de RL: servir como caso de prueba end-to-end para validar flujos de `load_from_hub`, evaluacion con `mean_reward` y publicacion en el Hub.
- Baseline en experimentos con Taxi-v4: comparar algoritmos mas avanzados (DQN, PPO, tablas con exploracion optimista) contra este agente de referencia con recompensa media 7.56.
- Reproducibilidad de resultados: al ser un artefacto pequeno y determinista en inferencia, permite reproducir exactamente la evaluacion declarada por el autor.
- Demostraciones interactivas: integrar el agente en notebooks o demos web que rendericen el entorno Taxi y muestren la politica aprendida paso a paso.
- Pruebas de regresion en librerias de RL: validar que cambios en la API de carga o en el wrapper del entorno no rompen la compatibilidad con artefactos pickle antiguos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset/entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el artefacto es una tabla Q en pickle y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU es suficiente.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: scripts Python con `gymnasium` y la libreria de RL de Hugging Face; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; al tratarse de una consulta a tabla, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parkjongsung/q-Taxi-v3 | Q-Learning tabular | Taxi-v4 | 7.56 +/- 2.71 | no disponible | Hugging Face Hub |
| Agente Q-Learning de referencia (deep-rl-class) | Q-Learning tabular | Taxi-v3 | no disponible | no disponible | Hugging Face Hub |
| DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | no disponible | no disponible | Implementaciones en repos publicos |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; las filas segunda y tercera son referencias genericas de la categoria y no incluyen cifras verificadas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales.
- La recompensa media declarada (7.56 +/- 2.71) no esta verificada por el Hub (`verified: false`) y podria no ser reproducible sin conocer los hiperparametros y la semilla.
- La tabla Q esta acoplada al MDP de Taxi-v4; no generaliza a otros entornos ni a variaciones del mapa.
- Posible inconsistencia de nomenclatura: el ID y la model card mencionan Taxi-v3 mientras que el `model-index` referencia Taxi-v4; conviene verificar el `env_id` cargado antes de evaluar.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido.
- El formato pickle puede suponer riesgos de seguridad al deserializar artefactos de origen no confiable; se recomienda auditar el fichero antes de cargarlo en produccion.
- No dispone de informacion sobre sesgos, alucinacion ni limitaciones linguisticas porque no aplica a este tipo de artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/parkjongsung/q-Taxi-v3
- Entorno Taxi-v4 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de RL en Hugging Face: https://huggingface.co/docs/hub/en/models
- Curso Deep RL de Hugging Face (referencia de Q-Learning en Taxi): https://github.com/huggingface/deep-rl-class
