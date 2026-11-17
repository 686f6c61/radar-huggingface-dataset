# Oshardt/Q-learning-Taxi-v3

## Resumen

Q-learning-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado mediante Q-learning tabular sobre el entorno Taxi-v4 de Gymnasium (anteriormente Gym). Lo publica el usuario Oshardt en Hugging Face y no se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementacion personalizada de Q-learning que produce una politica capaz de resolver la tarea de recoger y dejar pasajeros en una cuadricula de 5x5.

El entorno Taxi-v4 es un problema clasico de control discreto con 500 estados posibles y 6 acciones (norte, sur, este, oeste, recoger pasajero y dejar pasajero). El agente debe aprender una tabla Q que asigne un valor a cada par estado-accion para maximizar la recompensa acumulada, con penalizaciones por pasos y por recogidas o entregas ilegales.

Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo minimo reproducible de un pipeline de RL tabular, util para validar infraestructura de evaluacion, comparar hiperparametros de Q-learning o como baseline en cursos y tutoriales. No debe confundirse con un modelo generativo: el repositorio pesa 0.0 GB y contiene un fichero serializado con la tabla Q, no pesos de transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo; el autor no declara dimensiones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno con 500 estados discretos; no hay contexto de texto) |
| Tipos de cuantizacion | no disponible (no aplica a una tabla Q serializada) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | fichero `q-learning.pkl` (pickle de Python) segun la model card |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular, un metodo de diferencias temporales off-policy que actualiza iterativamente la funcion de valor-accion Q(s, a) mediante la regla de actualizacion de Bellman. El agente interactua con el entorno Taxi-v4, que expone un espacio de observacion discreto de 500 estados y un espacio de acciones discreto de 6 acciones, y aprende una tabla Q que se explota de forma greedy en inferencia.

La model card no detalla hiperparametros de entrenamiento (tasa de aprendizaje alfa, factor de descuento gamma, politica epsilon-greedy, numero de episodios, semilla), ni el numero de pasos de entrenamiento, ni si se aplico decaimiento de epsilon. Tampoco se documenta la composicion del dataset porque no hay dataset: el entrenamiento es por interaccion con el simulador. El unico dato cuantitativo publicado es la metrica de evaluacion declarada en el model-index.

## Capacidades

- Resolucion del entorno Taxi-v4: el agente aprende a recoger al pasajero y dejarlo en el destino correcto dentro de la cuadricula.
- Politica discreta determinista: dado un estado entero (0-499), devuelve una de las 6 acciones del entorno.
- Aprendizaje por refuerzo tabular: implementacion propia de Q-learning, sin dependencia de frameworks de deep learning.
- Serializacion en pickle: la tabla Q se guarda como `q-learning.pkl` y se carga con `load_from_hub` del ecosistema de Hugging Face.
- Integracion con Gymnasium: el codigo de ejemplo de la model card hace `gym.make(model["env_id"])`, por lo que el fichero incluye el identificador del entorno.
- No soporta tool calling, function calling, agentes multi-paso sobre texto, capacidades multilingues, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo minimo y reproducible de Q-learning tabular en un curso introductorio, cargando el pickle y evaluando la politica sobre Taxi-v4 para ilustrar la convergencia de la tabla Q.
- Baseline en experimentos de RL: comparar variantes de Q-learning (SARSA, Double Q-learning, Q-learning con distintas tasas de aprendizaje) contra este agente como referencia de rendimiento en Taxi-v4.
- Validacion de infraestructura de evaluacion: integrar el agente en un harness de evaluacion de entornos Gymnasium para comprobar que el pipeline de carga, ejecucion y calculo de recompensa media funciona correctamente antes de escalar a modelos mayores.
- Pruebas de reproducibilidad: verificar que un pipeline de entrenamiento propio reproduce la recompensa media declarada (7.56 +/- 2.71) bajo las mismas condiciones de evaluacion.
- Demostraciones educativas interactivas: mostrar en un notebook como un agente sin red neuronal resuelve una tarea de planificacion discreta, visualizando la politica sobre la cuadricula de Taxi-v4.
- Referencia para entornos con espacio de estados pequeno: servir de plantilla para adaptar Q-learning tabular a otros entornos discretos de Gymnasium con espacios de observacion y accion manejables.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. La metrica no esta marcada como verificada (`verified: false`) y no se especifica el numero de episodios de evaluacion ni la politica de exploracion usada durante la misma.

## Requisitos de hardware

- VRAM estimada: no aplica; el agente es una tabla Q serializada en pickle y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier consumer GPU y en cualquier CPU moderna: el coste computacional por paso es una consulta a una tabla.
- Opciones de despliegue: carga directa del pickle con `load_from_hub` y ejecucion sobre `gym.make("Taxi-v4")`; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza tabular, la inferencia por paso es de orden de microsegundos a nivel de CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| Oshardt/Q-learning-Taxi-v3 | Q-learning tabular | Taxi-v4 | no disponible | no aplica | mean_reward 7.56 +/- 2.71 (no verificado) | no disponible |
| Agentes Q-learning tabulares publicados en Hugging Face para Taxi-v4 | Q-learning tabular | Taxi-v4 | no disponible | no aplica | no disponible en la informacion proporcionada | variable segun autor |
| Agentes DQN para Taxi-v4 | Deep Q-Network | Taxi-v4 | red pequena (no disponible) | no aplica | no disponible en la informacion proporcionada | variable segun autor |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada; la comparativa se limita a la categoria funcional.

## Limitaciones y advertencias

- Ambito muy restringido: solo resuelve Taxi-v4; no generaliza a otros entornos ni tareas sin reentrenamiento.
- Sin informacion de licencia: no se puede confirmar el uso comercial; conviene contactar con el autor antes de reutilizarlo en produccion.
- Metrica no verificada: el valor 7.56 +/- 2.71 procede del model-index del autor y no ha sido validado de forma independiente.
- Falta de documentacion de hiperparametros: no se publican alfa, gamma, epsilon, episodios ni semilla, lo que dificulta la reproducibilidad exacta.
- Riesgo de sobreajuste a la version del entorno: el nombre del repositorio menciona Taxi-v3 pero los tags y el model-index apuntan a Taxi-v4; hay que verificar el `env_id` almacenado en el pickle antes de usarlo.
- Formato pickle: cargar un pickle de origen no verificado implica riesgo de seguridad; conviene inspeccionarlo o cargarlo en un entorno aislado.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, razonamiento simbolico general, codigo ni matematicas; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Sin soporte multilingue ni de modalidades: no procesa texto, imagen ni audio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Oshardt/Q-learning-Taxi-v3
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Gymnasium: https://gymnasium.farama.org/
- Referencia de Q-learning (Sutton y Barto, Reinforcement Learning: An Introduction): http://incompleteideas.net/book/the-book-2nd.html
