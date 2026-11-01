# brunopaschoal/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo que resuelve el entorno Taxi-v3 de Gymnasium mediante Q-learning tabular implementado desde cero. Lo desarrolla el usuario brunopaschoal como parte de la Unidad 2 del curso Deep RL de Hugging Face, y se publica en el Hub como un artefacto reproducible: un fichero `q-learning.pkl` que contiene la tabla Q, el identificador del entorno y los kwargs necesarios para reconstruirlo.

No se trata de un modelo de lenguaje ni de una red neuronal profunda. Es una tabla de valores Q indexada por estados y acciones discretos del entorno Taxi-v3, por lo que su "tamano" no se mide en parametros sino en entradas de tabla, y su inferencia consiste en una consulta O(1) a un diccionario serializado con pickle. El repositorio ocupa 0.0 GB y no requiere GPU.

Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo minimo de agente Q-learning empaquetado con el formato del Hub, util para comparar contra implementaciones mas complejas (DQN, PPO) sobre el mismo entorno y para validar pipelines de evaluacion de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q discreta; no aplica el concepto de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Taxi-v3 con 500 estados discretos y 6 acciones) |
| Tipos de cuantizacion | no aplica (pesos serializados con pickle; no hay cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pickle (`.pkl`) con un diccionario que contiene la tabla Q, `env_id` y `env_kwargs` |

## Arquitectura y entrenamiento

El agente implementa Q-learning tabular clasico: una tabla Q que asigna un valor a cada par (estado, accion) del entorno Taxi-v3, actualizada con la regla de Bellman `Q(s,a) <- Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a))`. No hay funcion de aproximacion, ni red neuronal, ni representacion vectorial de estados; el estado es un entero discreto del entorno y la politica se deriva tomando `argmax` sobre la fila correspondiente.

El entrenamiento se realizo siguiendo la Unidad 2 del curso Deep RL de Hugging Face, con un bucle de episodios sobre Gymnasium y una politica epsilon-greedy. La model card no documenta el numero de episodios, los valores de `alpha`, `gamma` ni la politica de exploracion final, por lo que estos hiperparametros no estan disponibles. Tampoco se indica si hubo evaluacion con semillas fijas ni validacion cruzada entre episodios de entrenamiento y evaluacion.

## Capacidades

- Resolucion del entorno Taxi-v3 de Gymnasium: recoger y dejar pasajeros en las cuatro ubicaciones del mapa con la politica aprendida.
- Seleccion de accion determinista mediante `argmax` sobre la tabla Q para cualquier estado alcanzable del entorno.
- Serializacion y recarga completa del agente: el pickle incluye `env_id` y `env_kwargs`, de modo que el entorno se reconstruye con `gym.make(model["env_id"], **model["env_kwargs"])`.
- No soporta tool calling, function calling ni razonamiento multi-paso fuera del propio MDP del entorno.
- No tiene capacidades multilingues, de vision, audio ni generacion de texto.
- No dispone de modo "thinking" ni de mecanismos de decodificacion especulativa.

## Casos de uso

- Docencia de RL tabular: usar el agente como referencia funcional en la Unidad 2 del curso Deep RL de Hugging Face para ilustrar como se empaqueta y se publica un agente en el Hub.
- Baseline de comparacion: servir como linea base de rendimiento (mean_reward 7.69) frente a agentes con aproximacion de funcion (DQN, PPO) sobre Taxi-v3 en experimentos academicos.
- Test de pipelines de evaluacion: integrar el pickle en un harness de evaluacion que cargue agentes desde el Hub y verifique que la API de reconstruccion del entorno funciona.
- Verificacion de reproducibilidad: comprobar que la carga via `hf_hub_download` y `pickle.load` reproduce el comportamiento declarado en la model card.
- Ejemplo de formato de model card para RL: usar la estructura de `model-index` y los tags (`Taxi-v3`, `q-learning`, `custom-implementation`) como plantilla para publicar otros agentes.
- Entorno de pruebas para docencia de Gymnasium: ejercitar la creacion de entornos con `env_kwargs` personalizados y la evaluacion con metricas de recompensa media.
- Sandbox de seguridad: analizar el riesgo de deserializacion de pickles en flujos de descarga de modelos desde hubs publicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.69 +/- 2.87 |

No se han publicado en la informacion disponible resultados comparativos con otros agentes sobre Taxi-v3 ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es una consulta a un diccionario en memoria y cabe en cualquier equipo con CPU.
- GPU recomendadas: ninguna; el agente no usa aceleracion por hardware.
- Cabe en cualquier GPU consumer y en entornos sin GPU (Raspberry Pi, contenedores ligeros, CI).
- Almacenamiento: el repositorio ocupa 0.0 GB; el fichero `q-learning.pkl` es de tamano despreciable.
- Opciones de despliegue: script Python con `gymnasium` y `huggingface_hub`; no aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles de forma oficial; al ser una consulta O(1) a tabla, la latencia por paso esta dominada por el `step` del entorno de Gymnasium, no por el agente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| q-Taxi-v3 (este) | Q-learning tabular | Taxi-v3 | tabla Q discreta | no aplica | mean_reward 7.69 +/- 2.87 | no disponible |
| Agentes DQN sobre Taxi-v3 | Deep RL (red neuronal) | Taxi-v3 | no disponible | no disponible | no disponible en esta busqueda | no disponible |
| Agentes PPO sobre Taxi-v3 | Deep RL (policy gradient) | Taxi-v3 | no disponible | no disponible | no disponible en esta busqueda | no disponible |

No se dispone de datos verificables de alternativas concretas en la informacion proporcionada; la comparativa queda limitada a la categoria de algoritmo.

## Limitaciones y advertencias

- El agente solo funciona en Taxi-v3; la tabla Q esta indexada por los estados de ese entorno y no generaliza a otros MDP.
- La metrica mean_reward 7.69 +/- 2.87 no esta verificada (`verified: false`) y la desviacion tipica es alta en relacion a la media, lo que sugiere variabilidad considerable entre episodios de evaluacion.
- La model card no documenta hiperparametros, numero de episodios ni semillas, lo que limita la reproducibilidad estricta del resultado.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- El formato pickle implica riesgo de ejecucion de codigo arbitrario al deserializar; en produccion conviene cargar solo de fuentes de confianza o migrar a un formato seguro como JSON o safetensors.
- No procesa lenguaje natural ni dispone de capacidades generativas; no es adecuado para tareas de NLP, codigo o vision.
- No hay informacion sobre sesgos porque el agente opera en un entorno sintetico sin datos humanos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunopaschoal/q-Taxi-v3
- Curso Deep RL de Hugging Face (Unidad 2, Q-Learning): https://huggingface.co/learn/deep-rl-course/unit2/introduction
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de `huggingface_hub` (`hf_hub_download`): https://huggingface.co/docs/huggingface_hub
