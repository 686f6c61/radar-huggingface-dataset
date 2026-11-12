# dolind/taxi3

## Resumen

`dolind/taxi3` es un agente de aprendizaje por refuerzo entrenado con Q-Learning para resolver el entorno `Taxi-v3` de Gymnasium (variante `Taxi-v3-4x4-no_slippery`), un problema clasico de control discreto en el que un taxi debe recoger y dejar pasajeros en una cuadricula 4x4. No es un modelo de lenguaje ni una red neuronal profunda: se trata de una implementacion personalizada de Q-Learning tabular (o de una politica equivalente) serializada como un fichero `q-learning.pkl` que se carga mediante `load_from_hub` y se empareja con el entorno de Gym.

El modelo lo publica el usuario `dolind` en Hugging Face, con fecha de creacion en noviembre de 2026, cero descargas y cero likes en el momento de la consulta, y un tamano de repositorio de 0.0 GB (coherente con una tabla Q o un artefacto minimo). No dispone de licencia declarada, ni de idiomas soportados, ni de documentacion tecnica mas alla de un README minimo con un snippet de uso.

Su relevancia es limitada y de caracter didactico: sirve como referencia de un agente Q-Learning que alcanza la recompensa media maxima declarada por el autor (1.00 +/- 0.00) en el entorno Taxi-v3 sin suelo resbaladizo. No debe confundirse con un modelo generativo: no procesa texto, no tiene contexto conversacional ni soporta tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning (aprendizaje por refuerzo tabular, implementacion personalizada) |
| Parametros totales | no disponible (no es una red neuronal; probablemente tabla Q) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de estados discretos de Taxi-v3) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente emplea Q-Learning, un algoritmo de aprendizaje por refuerzo off-policy y sin modelo que estima el valor de pares estado-accion mediante actualizaciones de la ecuacion de Bellman. En el entorno `Taxi-v3` de Gymnasium, el espacio de estados es discreto (500 estados en la variante 4x4) y el espacio de acciones es discreto (6 acciones: mover norte, sur, este, oeste, recoger y dejar pasajero). La implementacion es "custom" segun las etiquetas del repositorio, y el artefacto resultante se serializa como un fichero pickle (`q-learning.pkl`), lo que sugiere una tabla Q almacenada como diccionario o array de NumPy.

No se dispone de informacion sobre hiperparametros (tasa de aprendizaje, factor de descuento, politica epsilon-greedy, numero de episodios), composicion del dataset de entrenamiento ni si se aplicaron tecnicas adicionales como Double Q-Learning o SARSA. El entorno declarado es `Taxi-v3-4x4-no_slippery`, es decir, sin transiciones estocasticas por suelo resbaladizo, lo que simplifica la convergencia de la politica.

## Capacidades

- Resolucion del entorno `Taxi-v3` (variante 4x4 sin suelo resbaladizo) mediante politica greedy derivada de la tabla Q.
- Seleccion de accion discreta entre las 6 acciones del entorno (movimiento y recogida/entrega de pasajero).
- Carga directa desde el Hub de Hugging Face mediante `load_from_hub(repo_id="dolind/taxi3", filename="q-learning.pkl")`.
- Integracion con Gymnasium: el snippet del autor indica que debe instanciarse el entorno con `gym.make(model["env_id"])` y, si procede, anadir atributos como `is_slippery=False`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes multi-step ni capacidades multilingues.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de Q-Learning tabular en un curso introductorio, cargando el pickle y ejecutando episodios en `Taxi-v3` para ilustrar convergencia de la politica.
- Baseline de comparacion: emplear la recompensa media declarada (1.00 +/- 0.00) como referencia contra la que medir variantes como SARSA, Double Q-Learning o DQN en el mismo entorno.
- Test de pipelines de evaluacion: validar frameworks de RL (Stable-Baselines3, RLlib, CleanRL) comprobando que reproducen la politica cargada desde el Hub.
- Reproducibilidad de experimentos: servir como artefacto versionado de un entrenamiento concreto, permitiendo a otros investigadores comparar hiperparametros y resultados.
- Tutorial de despliegue en Hugging Face: demostrar el flujo `load_from_hub` + `gym.make` para publicar y consumir agentes de RL en el Hub.
- Verificacion de entornos Gymnasium: comprobar el comportamiento del wrapper `Taxi-v3-4x4-no_slippery` y la gestion del atributo `is_slippery` en la inicializacion.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3-4x4-no_slippery | mean_reward | 1.00 +/- 0.00 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el artefacto es un pickle de una tabla Q de 500 estados x 6 acciones como maximo (unos pocos KB si se almacena como array de NumPy).
- GPU recomendadas: no aplica; la inferencia es una consulta a tabla en CPU.
- Cabe en cualquier GPU consumer (e incluso en CPU y en dispositivos embebidos), aunque no se aprovecha aceleracion por hardware.
- Opciones de despliegue: carga directa con `pickle`/`load_from_hub` de Hugging Face y ejecucion con Gymnasium; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza tabular, la latencia por paso deberia ser del orden de microsegundos en CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros agentes Q-Learning publicados para `Taxi-v3` con los que comparar parametros, contexto, rendimiento o licencia. Como referencia cualitativa, cualquier agente tabular para `Taxi-v3` (Q-Learning, SARSA, Monte Carlo) comparte el mismo espacio de estados y acciones, por lo que las diferencias se limitan a la politica aprendida y a los hiperparametros de entrenamiento.

## Limitaciones y advertencias

- Especifico del entorno `Taxi-v3-4x4-no_slippery`: no generaliza a otras tareas, a variantes con suelo resbaladizo ni a entornos continuos.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribucion; conviene contactar con el autor antes de reutilizarlo en produccion.
- Sin documentacion tecnica: no se publican hiperparametros, numero de episodios, semilla ni criterios de convergencia, lo que dificulta la reproducibilidad.
- Metrica no verificada: el `mean_reward` de 1.00 +/- 0.00 esta marcado como `verified: false` en el `model-index`.
- Riesgo de sobreajuste al entorno: al ser una tabla Q para un MDP discreto y determinista, no hay capacidad de generalizacion fuera de la distribucion de estados de Taxi-v3.
- Formato pickle: cargar ficheros `.pkl` de origen no verificado implica riesgo de ejecucion de codigo arbitrario; debe hacerse solo en entornos controlados.
- Cero descargas y cero likes: no hay evidencia de uso o validacion por parte de la comunidad.
- Sin sesgos de lenguaje ni alucinaciones aplicables, al no ser un modelo generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dolind/taxi3
- Entorno Taxi-v3 de Gymnasium (referencia del entorno): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Hugging Face Hub sobre `load_from_hub`: no disponible en la informacion proporcionada.
