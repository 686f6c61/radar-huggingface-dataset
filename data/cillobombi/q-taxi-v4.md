# cillobombi/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular sobre el entorno Taxi-v3 de Gymnasium. Lo publica el usuario cillobombi en Hugging Face y no es un modelo de lenguaje: es una tabla Q serializada que mapea estados discretos del entorno a valores de accion, empaquetada en un fichero `q-learning.pkl` junto con los metadatos necesarios para reconstruir el agente.

El entorno Taxi-v3 es un problema clasico de control: un taxi debe recoger y dejar pasajeros en una cuadricula de 5x5 con 4 ubicaciones de recogida y entrega, lo que da 500 estados discretos y 6 acciones posibles. El agente aprende una politica que maximiza la recompensa acumulada, con penalizaciones por cada paso, por recogidas y entregas ilegales y una recompensa positiva al completar el servicio.

Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo minimo reproducible de un pipeline de RL con `stable-baselines3` y el formato de model card de Hugging Face, y como baseline de comparacion para algoritmos mas avanzados (DQN, PPO) sobre el mismo entorno. No tiene aplicaciones de produccion fuera del propio entorno Taxi-v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion) |
| Parametros totales | no disponible (tabla de 500 estados x 6 acciones como maximo teorico) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno con 500 estados discretos) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clasico, un metodo de diferencias temporales off-policy que actualiza la funcion de valor accion Q(s, a) mediante la regla de actualizacion de Bellman con una tasa de aprendizaje y un factor de descuento. Al tratarse de un entorno con espacio de estados y acciones finito y pequeno (Taxi-v3), no se necesita aproximacion funcional: la tabla Q se representa de forma explicita y se actualiza tras cada transicion.

La model card no documenta hiperparametros de entrenamiento (tasa de aprendizaje, factor de descuento, politica epsilon-greedy, numero de episodios), ni la composicion del dataset, ni si se aplicaron tecnicas de exploracion avanzada. Tampoco se especifica la version concreta de `stable-baselines3` ni la configuracion del entorno (por ejemplo, `is_slippery`), aunque la propia model card advierte al usuario de que debe comprobar si necesita anadir atributos adicionales al reconstruir el entorno.

## Capacidades

- Resolucion del entorno Taxi-v3: selecciona acciones (mover norte, sur, este, oeste, recoger pasajero, dejar pasajero) a partir del estado discreto observado.
- Politica greedy derivada de la tabla Q aprendida, sin exploracion en inferencia.
- Serializacion completa del agente en un unico fichero pickle, cargable con `load_from_hub`.
- Integracion con el ecosistema Gymnasium mediante `gym.make(model["env_id"])`.
- No soporta tool calling, ni function calling, ni agentes multi-paso fuera del bucle episodico del entorno.
- No tiene capacidades multilingues, de vision, audio ni generacion de texto.
- No dispone de modo de razonamiento explicito ni de decodificacion especulativa.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo resuelto de Q-Learning tabular en un curso introductorio, comparando la tabla Q aprendida con la politica optima teorica del entorno Taxi-v3.
- Baseline de referencia: emplearlo como punto de comparacion al evaluar algoritmos mas complejos (DQN, PPO, A2C) sobre Taxi-v3, ya que su recompensa media declarada (7,56) sirve de umbral minimo.
- Validacion de pipelines de RL: comprobar que un entorno de entrenamiento y evaluacion (Gymnasium + stable-baselines3) funciona correctamente cargando este agente y ejecutando episodios de evaluacion.
- Pruebas de integracion de Hugging Face Hub: verificar el flujo `load_from_hub` y el formato de model card con `model-index` en un caso minimo y sin dependencias pesadas.
- Experimentos de interpretabilidad de politicas: inspeccionar la tabla Q para analizar como se propaga la recompensa desde los estados terminales hacia los estados iniciales en un MDP pequeno.
- Reproduccion de resultados: reentrenar el agente con los mismos hiperparametros (si se recuperan del pickle) y contrastar la recompensa media declarada de 7,56 +/- 2,71.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por Hugging Face):

| Dataset | Metrica | Valor |
|---|---|---|
| Taxi-v3 | mean_reward | 7,56 +/- 2,71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion con otros agentes en la model card.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q serializada en un pickle de tamano despreciable (el repositorio ocupa 0,0 GB).
- GPU: no necesaria; la inferencia es una consulta a diccionario en CPU.
- Cabe en cualquier maquina, incluidos entornos sin GPU y contenedores ligeros.
- Despliegue: Python con `gymnasium` y `stable-baselines3` (o el cargador `load_from_hub` de Hugging Face). No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza tabular, la seleccion de accion es una operacion O(1) en memoria.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| q-Taxi-v4 (cillobombi) | Q-Learning tabular | Taxi-v3 | 7,56 +/- 2,71 | no disponible | Hugging Face |
| Agentes DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | no disponible | variable | implementaciones en stable-baselines3 |
| Agentes PPO sobre Taxi-v3 | PPO | Taxi-v3 | no disponible | variable | implementaciones en stable-baselines3 |

No se dispone de datos publicados de recompensa media para las alternativas en la informacion proporcionada; la comparativa se limita a la categoria de algoritmo y al entorno.

## Limitaciones y advertencias

- El agente solo es valido para el entorno Taxi-v3; no generaliza a otros entornos ni a variantes con distinta configuracion (por ejemplo, `is_slippery=True`).
- La recompensa media de 7,56 +/- 2,71 tiene una desviacion estandar alta y no esta verificada; el rendimiento puede variar segun la semilla y la configuracion del entorno.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial o redistribucion.
- El formato pickle puede ejecutar codigo arbitrario al deserializarse; cargar el fichero solo desde fuentes de confianza.
- No hay documentacion de sesgos, pero al ser un agente tabular sobre un entorno sintetico no aplican sesgos de datos de lenguaje.
- Riesgo de alucinacion no aplica; el riesgo real es una politica suboptima por entrenamiento insuficiente o hiperparametros no documentados.
- No se especifican los hiperparametros de entrenamiento, lo que dificulta la reproducibilidad exacta.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cillobombi/q-Taxi-v4
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de stable-baselines3: https://stable-baselines3.readthedocs.io/
- Documentacion de carga de modelos de RL en Hugging Face: https://huggingface.co/docs/hub/models
