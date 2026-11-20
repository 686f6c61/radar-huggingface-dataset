# nisarg-ai/Taxi-v3

## Resumen

`nisarg-ai/Taxi-v3` es un agente de Q-learning tabular entrenado para resolver el entorno `Taxi-v3` de Gymnasium, un problema clasico de reinforcement learning con espacio de estados discreto. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementacion personalizada de Q-learning que aprende una tabla de valores Q para un agente que debe recoger y dejar pasajeros en una cuadricula de 5x5 con cuatro ubicaciones de recogida y destino.

El modelo lo publica el usuario `nisarg-ai` en Hugging Face bajo el pipeline `reinforcement-learning`. El repositorio tiene un tamano de 0.0 GB, lo que es coherente con una tabla Q serializada (tipicamente en un fichero `q-learning.pkl`) para un entorno con 500 estados discretos y 6 acciones. El resultado declarado en la model card es un `mean_reward` de 7.56 +/- 2.71, un valor que indica un rendimiento moderado y con alta varianza, lejos del optimo del entorno (que ronda 8-9 de recompensa media en episodios de 200 pasos con politicas bien entrenadas).

La relevancia de este modelo es fundamentalmente didactica: sirve como referencia de como empaquetar y publicar un agente de RL clasico en el Hub, y como ejemplo de los metadatos `model-index` que Hugging Face usa para registrar resultados de evaluacion. No es un modelo apto para tareas de generacion, razonamiento o procesamiento de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (custom-implementation) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones en Taxi-v3, segun el entorno estandar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con horizonte de episodio de 200 pasos en la version estandar de Taxi-v3) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona `q-learning.pkl`, un pickle con la tabla Q y metadatos del entorno) |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular, un algoritmo de control off-policy que aprende una funcion de valor-accion Q(s, a) mediante actualizaciones de la ecuacion de Bellman: Q(s, a) <- Q(s, a) + alpha * [r + gamma * max_a' Q(s', a') - Q(s, a)]. En `Taxi-v3` el espacio de estados es discreto y finito (500 estados), por lo que la tabla Q es una matriz de 500 x 6 que se puede almacenar y serializar sin necesidad de redes neuronales. El agente se entrena interactuando con el entorno y actualizando la tabla tras cada transicion.

No se dispone de informacion sobre hiperparametros (tasa de aprendizaje alpha, factor de descuento gamma, politica de exploracion epsilon-greedy y su decaimiento), numero de episodios de entrenamiento, ni sobre si se aplico algun tipo de inicializacion optimista o decaimiento de epsilon. La model card no documenta el proceso de entrenamiento mas alla de indicar que es un agente de Q-learning entrenado para `Taxi-v3`. Tampoco se especifica si se uso la version con suelo resbaladizo (`is_slippery=True`, por defecto en Gymnasium) o sin el; la propia model card advierte de que hay que comprobar si se necesita anadir atributos adicionales como `is_slippery=False` al cargar el entorno, lo que sugiere que el autor no fijo ese parametro de forma explicita en los metadatos.

## Capacidades

- Resolucion del entorno `Taxi-v3` de Gymnasium: el agente aprende a recoger un pasajero en una de cuatro ubicaciones y dejarlo en su destino dentro de una cuadricula de 5x5.
- Politica de control discreta: selecciona una de las 6 acciones del entorno (moverse norte, sur, este, oeste, recoger pasajero, dejar pasajero) a partir del estado discreto actual.
- Aprendizaje por refuerzo off-policy: la tabla Q puede reutilizarse y seguir entrenandose si se dispone del codigo de entrenamiento original.
- Carga via `load_from_hub` de Hugging Face: la model card documenta el uso con `load_from_hub(repo_id="nisarg-ai/Taxi-v3", filename="q-learning.pkl")`.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, capacidades multilingues, vision, audio ni modos de razonamiento extendido. No es un modelo de lenguaje.

## Casos de uso

- Docencia de reinforcement learning: el agente sirve como ejemplo funcional de Q-learning tabular para explicar la ecuacion de Bellman, la exploracion epsilon-greedy y la convergencia de la tabla Q en un entorno de juguete con espacio de estados finito.
- Referencia de publicacion en el Hub: util para aprender a empaquetar un agente de RL con `model-index`, metadatos de evaluacion y un fichero de pesos serializado en pickle.
- Baseline en experimentos de RL: puede usarse como punto de partida para comparar algoritmos mas avanzados (DQN, PPO, SARSA) sobre el mismo entorno `Taxi-v3`.
- Pruebas de infraestructura de evaluacion: al ser un agente ligero (0.0 GB de repo), es adecuado para validar pipelines de evaluacion automatica de agentes de RL en CI.
- Reproduccion de resultados: permite verificar el `mean_reward` declarado (7.56 +/- 2.71) ejecutando el agente sobre `Taxi-v3` con la configuracion adecuada del entorno.
- Demostraciones de entornos Gymnasium: sirve para mostrar el ciclo `reset`/`step`/`render` de Gymnasium con un agente entrenado, sin requerir GPU ni dependencias pesadas.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion con otros agentes en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El agente es una tabla Q tabular almacenada en un pickle; no requiere GPU.
- GPU recomendadas: ninguna. Funciona en CPU.
- Cabe en cualquier hardware consumer: portatil, Raspberry Pi o incluso entornos sin aceleracion.
- Opciones de despliegue: carga directa del pickle con `load_from_hub` de Hugging Face y ejecucion sobre `gym.make("Taxi-v3")`. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial. Al ser una consulta a una tabla de 500 x 6, la latencia por paso es del orden de microsegundos en CPU; el throughput depende del bucle de simulacion del entorno, no del agente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| nisarg-ai/Taxi-v3 | Q-learning tabular | Taxi-v3 | no disponible | no aplica | mean_reward 7.56 +/- 2.71 | no disponible |
| Agente Q-learning de referencia (p. ej. los publicados por la comunidad RL en el Hub) | Q-learning tabular | Taxi-v3 | tabla 500 x 6 | no aplica | no disponible | variable |
| DQN sobre Taxi-v3 | Red neuronal profunda | Taxi-v3 | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas concretas en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El rendimiento declarado (7.56 +/- 2.71) es moderado y con varianza alta; no se ha verificado (`verified: false`) y no se especifica el numero de episodios de evaluacion ni la semilla.
- La model card no documenta hiperparametros, numero de episodios de entrenamiento ni si se uso `is_slippery=True` o `False`; la reproducibilidad del resultado no esta garantizada.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- El agente esta atado al entorno `Taxi-v3`; no generaliza a otros entornos ni tareas.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes multi-paso.
- El formato de pesos es pickle, lo que implica riesgos de seguridad al deserializar ficheros no confiables; conviene cargarlo solo desde fuentes de confianza.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no aplican a este tipo de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nisarg-ai/Taxi-v3
- Entorno Taxi-v3 de Gymnasium (documentacion oficial): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Hugging Face sobre `model-index` y model cards: https://huggingface.co/docs/hub/model-cards
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
