# Adonultcat/qtable-taxi-v4

## Resumen

`qtable-taxi-v4` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular sobre el entorno `Taxi-v4` de Gymnasium. Lo publica el usuario Adonultcat en Hugging Face y no se trata de un modelo de lenguaje: es una tabla Q serializada (un fichero `q-learning.pkl`) que contiene la politica aprendida para el problema clasico del taxi.

El entorno `Taxi-v4` es un problema discreto de 500 estados en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una rejilla, con recompensas de -1 por paso, +20 por entrega correcta y -10 por recogida o entrega ilegal. El agente aprende una tabla de valores Q(state, action) mediante iteracion de valores Q clasica, sin redes neuronales ni aproximacion de funcion.

Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo minimo reproducible de un pipeline de RL tabular completo (entorno, entrenamiento, evaluacion y publicacion en el Hub con `model-index`). No es util para tareas de generacion, razonamiento ni procesamiento de lenguaje, y su huella es practicamente nula (repositorio de 0.0 GB). La model card no aporta informacion sobre hiperparametros, numero de episodios ni semilla de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones; el numero exacto no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en pickle, sin cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning tabular, un metodo de diferencias temporales off-policy que actualiza la tabla Q mediante la regla de Bellman: `Q(s,a) <- Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a))`. El espacio de estados de `Taxi-v4` es discreto y finito (500 estados), y el espacio de acciones tiene 6 valores (mover en cuatro direcciones, recoger y dejar pasajero), por lo que una tabla es suficiente y no requiere aproximacion funcional.

La model card no documenta el numero de episodios, la tasa de aprendizaje (`alpha`), el factor de descuento (`gamma`), la politica de exploracion (epsilon-greedy u otra) ni la semilla utilizada. Tampoco se indica si el entrenamiento se realizo con `stable-baselines3`, con una implementacion propia (la etiqueta `custom-implementation` sugiere esto ultimo) o con otro framework. No hay informacion sobre RLHF, DPO ni ninguna tecnica de alineacion, ya que no aplica a este tipo de modelo.

## Capacidades

- Resolucion del entorno `Taxi-v4`: el agente selecciona acciones (mover, recoger, dejar) para completar episodios de recogida y entrega de pasajeros.
- Politica greedy derivada de la tabla Q: dada una observacion discreta, devuelve la accion de mayor valor aprendido.
- Serializacion y carga via `load_from_hub` con el fichero `q-learning.pkl`.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues.
- No dispone de modo de razonamiento (thinking mode) ni de generacion de texto.

## Casos de uso

- Docencia de RL tabular: usar el modelo como ejemplo reproducible de Q-Learning sobre un entorno discreto, comparando la tabla aprendida con la politica optima teorica.
- Baseline de referencia en experimentos: servir como punto de partida para comparar variantes (SARSA, Double Q-Learning, Monte Carlo) sobre el mismo entorno `Taxi-v4`.
- Pruebas de integracion de pipelines de RL: validar flujos de `load_from_hub` y `gym.make` en entornos de CI antes de escalar a entornos mas complejos.
- Demostracion de publicacion en el Hub: ilustrar el formato de `model-index` y de model card para agentes de refuerzo en Hugging Face.
- Analisis de convergencia: estudiar la varianza del retorno medio (7.56 +/- 2.71) como indicador de la estabilidad de la politica aprendida.
- Prototipado rapido de entornos Gymnasium: emplear el agente como control para verificar que un wrapper o una version modificada del entorno se comporta de forma coherente.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. El retorno maximo teorico de `Taxi-v4` es 15 (con la variante determinista) o cercano a 8-10 con la variante estocastica por defecto, por lo que un retorno medio de 7.56 es consistente con una politica razonablemente entrenada, aunque la desviacion tipica de 2.71 indica una varianza considerable entre episodios.

## Requisitos de hardware

- VRAM: no aplica; el modelo es una tabla Q en memoria principal (unos pocos kilobytes en pickle).
- GPU recomendadas: ninguna; la inferencia es una busqueda en tabla en CPU.
- Cabe en cualquier consumer GPU y en cualquier CPU, incluso en entornos embebidos.
- Despliegue: carga directa con `load_from_hub` y `gym.make`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo, la inferencia es de microsegundos por paso.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Retorno medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Adonultcat/qtable-taxi-v4` | Q-Learning tabular | Taxi-v4 | 7.56 +/- 2.71 | no disponible | Hugging Face |
| Agentes Q-Learning de `stable-baselines3` | Q-Learning tabular (implementacion de referencia) | Taxi-v3/v4 | no disponible | MIT (framework) | PyPI / GitHub |
| Agentes SARSA tabulares | SARSA | Taxi-v3/v4 | no disponible | no disponible | Multiples repositorios |
| Agentes DQN sobre Taxi | Deep Q-Network | Taxi-v3/v4 | no disponible | no disponible | Multiples repositorios |

No se dispone de datos comparativos verificados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no procesa lenguaje natural ni imagenes.
- La tabla Q esta acoplada al entorno `Taxi-v4`; no generaliza a otros entornos ni a variaciones del espacio de estados.
- El retorno medio declarado (7.56 +/- 2.71) no esta verificado (`verified: false`) y presenta una varianza alta.
- La model card no documenta hiperparametros, semilla ni numero de episodios, lo que dificulta la reproducibilidad.
- La licencia no esta declarada, por lo que el uso comercial queda en un limbo legal hasta que el autor la especifique.
- El formato pickle puede presentar riesgos de seguridad al deserializar ficheros de origen no confiable; conviene auditar antes de cargar en produccion.
- No hay informacion sobre sesgos, alucinacion ni limitaciones de idioma porque no aplican a este tipo de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adonultcat/qtable-taxi-v4
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de `load_from_hub`: https://huggingface.co/docs/hub/en/models-downloading
- Stable-Baselines3 (implementacion de referencia de Q-Learning): https://github.com/DLR-RM/stable-baselines3
