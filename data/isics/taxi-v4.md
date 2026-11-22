# Isics/taxi-v4

## Resumen

`Isics/taxi-v4` es un agente de aprendizaje por refuerzo entrenado mediante Q-Learning para resolver el entorno **Taxi-v3** de Gymnasium (antes OpenAI Gym). Lo desarrolla el usuario Isics y se publica en Hugging Face como un artefacto de tipo `reinforcement-learning`, no como un modelo de lenguaje. El problema que resuelve es el clasico entorno de control discreto Taxi: un taxi debe recoger a un pasajero en una de cuatro localizaciones y dejarlo en su destino dentro de una cuadricula de 5x5, con 500 estados posibles y 6 acciones.

El modelo no es un transformer ni tiene parametros neuronales en el sentido habitual: es una tabla Q serializada en formato pickle (`q-learning.pkl`) que mapea pares estado-accion a valores de recompensa esperada. Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo minimo de pipeline de RL (entrenamiento, evaluacion y publicacion en el Hub) y como baseline para comparar algoritmos mas sofisticados sobre el mismo entorno.

La informacion publicada es muy escasa: el repositorio ocupa 0.0 GB, no declara licencia, idiomas ni detalles de entrenamiento, y el unico dato de rendimiento es la recompensa media reportada por el autor (7.54 +/- 2.71) sobre Taxi-v3, marcada como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion) |
| Parametros totales | no disponible (tabla Q sobre 500 estados x 6 acciones; tamano exacto no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica; el artefacto es un pickle) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | pickle de Python (`q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning clasico, un metodo de aprendizaje por refuerzo off-policy y sin modelo que estima la funcion de valor-accion Q(s,a) mediante actualizaciones de tipo Bellman. En un entorno discreto y pequeno como Taxi-v3 (500 estados, 6 acciones), la representacion natural es una tabla Q de 500 x 6 entradas. El artefacto publicado contiene esa tabla junto con metadatos del entorno (el campo `env_id` que se usa en el ejemplo de carga de la model card).

No se han publicado datos sobre el numero de episodios de entrenamiento, la politica de exploracion (epsilon-greedy u otra), la tasa de aprendizaje, el factor de descuento ni la semilla utilizada. Tampoco se indica si el entrenamiento se realizo con la variante estocastica por defecto del entorno (`is_slippery=True`) o con la determinista; la propia model card advierte que el usuario debe comprobar si necesita anadir atributos como `is_slippery=False` al recrear el entorno, lo que sugiere que la configuracion exacta no esta fijada en el artefacto.

## Capacidades

- Resolucion del entorno Taxi-v3: seleccionar una de las 6 acciones discretas (mover norte, sur, este, oeste, recoger pasajero, dejar pasajero) en cada uno de los 500 estados.
- Politica greedy derivada de la tabla Q almacenada, apta para evaluacion directa con `gym.make(model["env_id"])`.
- Aprendizaje tabular sin necesidad de GPU ni de infraestructura de inferencia neuronal.
- No soporta tool calling, function calling, agentes multi-paso fuera del bucle del entorno, ni capacidades multilingues.
- No dispone de modo de razonamiento explicito, vision, audio ni generacion de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo completo de un pipeline Q-Learning entrenado y publicado, comparando la tabla Q resultante con la solucion optima conocida del entorno.
- Baseline en experimentos de RL: servir de referencia de recompensa media (7.54) frente a la que obtienen algoritmos como DQN, PPO o SAC sobre Taxi-v3.
- Validacion de infraestructura de evaluacion: comprobar que un harness de `gymnasium` + `load_from_hub` funciona correctamente antes de escalar a entornos mas complejos.
- Pruebas de reproducibilidad: verificar si la politica aprendida se mantiene estable bajo la variante estocastica del entorno y detectar sensibilidad a `is_slippery`.
- Demostraciones de integracion con el Hub: ejemplo de publicacion de artefactos de RL (pickle + model-index) para equipos que quieran estandarizar su propio flujo.
- Comparacion de metodos tabulares: contrastar Q-Learning con SARSA o Monte Carlo sobre el mismo entorno usando este agente como punto de partida.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.54 +/- 2.71 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparaciones con DQN, PPO u otros agentes sobre Taxi-v3 en la documentacion proporcionada.

## Requisitos de hardware

- VRAM: no aplica; la inferencia consiste en consultar una tabla Q en memoria, sin GPU.
- CPU: cualquier maquina capaz de ejecutar Python y Gymnasium es suficiente.
- GPU recomendadas: ninguna; no se requiere aceleracion.
- Cabe en cualquier consumer GPU y en CPU de gama baja; el repositorio ocupa 0.0 GB.
- Despliegue: carga directa del pickle con `load_from_hub` y ejecucion en un bucle `gym.make(...)`; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del bucle de simulacion del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Isics/taxi-v4 | Q-Learning tabular | Taxi-v3 | 7.54 +/- 2.71 (no verificado) | no disponible | Hugging Face |
| Agentes DQN sobre Taxi-v3 | Red neuronal profunda | Taxi-v3 | no disponible | no disponible | no disponible en la informacion |
| Agentes PPO sobre Taxi-v3 | Policy gradient | Taxi-v3 | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada; la comparativa se limita a la categoria de algoritmo.

## Limitaciones y advertencias

- El resultado de recompensa (7.54 +/- 2.71) esta marcado como no verificado por el autor; no debe tomarse como garantia de calidad.
- No se declara licencia, lo que impide asumir derechos de uso comercial o redistribucion.
- No se documentan hiperparametros, semilla ni regimen de entrenamiento, por lo que la reproducibilidad no esta garantizada.
- La politica puede depender de la configuracion del entorno (`is_slippery`); la propia model card advierte de que hay que comprobar si se necesitan atributos adicionales al recrearlo.
- El agente solo es valido para Taxi-v3; no generaliza a otros entornos ni a variantes con distinto numero de estados o acciones.
- El formato pickle implica riesgos de seguridad al deserializar artefactos de origen no confiable; conviene auditar el fichero antes de cargarlo en produccion.
- No aplica como modelo de lenguaje: no tiene capacidades de generacion, razonamiento textual ni comprension multilingue.

## Enlaces

- Hugging Face: https://huggingface.co/Isics/taxi-v4
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Q-Learning en Gymnasium: https://gymnasium.farama.org/tutorials/training_agents/blackjack_tutorial/ (referencia general de RL tabular en Gymnasium)
