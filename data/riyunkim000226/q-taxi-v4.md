# riyunkim000226/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular para resolver el entorno Taxi-v4 de Gymnasium. Lo publica el usuario riyunkim000226 en Hugging Face y sigue el formato estandar de los agentes generados por las librerias de RL integradas en el ecosistema Hugging Face (deep-rl-class / stable-baselines), que serializan la tabla Q en un fichero `q-learning.pkl` cargable mediante `load_from_hub`.

No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla de valores Q que mapea pares estado-accion a recompensas esperadas en un entorno discreto de 500 estados y 6 acciones. El problema que resuelve es el clasico "Taxi": un conductor debe recoger a un pasajero en una de cuatro ubicaciones y dejarlo en su destino, con recompensas de +20 por entrega exitosa, -1 por paso y -10 por recogida o entrega ilegal.

Su relevancia es fundamentalmente didactica y de referencia: sirve como linea base reproducible de Q-Learning tabular en un entorno de juguete, util para comparar con variantes como SARSA, Double Q-Learning o aproximaciones con redes neuronales (DQN). El rendimiento declarado es modesto (recompensa media de 7,48), lo que sugiere un agente que completa episodios pero no de forma consistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion) |
| Parametros totales | no disponible (tabla de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno discreto Taxi-v4) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning clasico, un metodo de aprendizaje por refuerzo off-policy y sin modelo. El agente mantiene una tabla Q indexada por estado y accion, actualizada mediante la regla de Bellman con tasa de aprendizaje y factor de descuento. El entorno Taxi-v4 tiene un espacio de observacion discreto de 500 estados (25 posiciones del taxi x 5 ubicaciones de pasajero x 4 destinos) y un espacio de acciones discreto de 6 (mover norte, sur, este, oeste, recoger y dejar).

No se dispone de informacion sobre hiperparametros concretos (alpha, gamma, epsilon, numero de episodios), politica de exploracion ni semillas utilizadas. La model card solo indica que el agente fue entrenado y proporciona el snippet de carga; no documenta el proceso de entrenamiento ni la composicion de episodios. El fichero serializado incluye presumiblemente la tabla Q y metadatos como `env_id`, segun el formato habitual de estos agentes.

## Capacidades

- Resolucion del entorno Taxi-v4 de Gymnasium mediante politica greedy sobre la tabla Q aprendida.
- Toma de decisiones discreta en un espacio de 500 estados y 6 acciones.
- Serializacion y carga mediante `load_from_hub` con el fichero `q-learning.pkl`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del propio bucle del entorno.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de Q-Learning tabular en un curso introductorio, cargandolo con `load_from_hub` y ejecutandolo sobre `gym.make("Taxi-v4")` para ilustrar la convergencia de la tabla Q.
- Linea base en experimentos comparativos: servir de referencia para medir la mejora de variantes como SARSA, Expected SARSA o Double Q-Learning sobre el mismo entorno, dado que el autor declara una recompensa media concreta (7,48).
- Pruebas de infraestructura de RL: validar pipelines de evaluacion, logging y reproduccion de episodios en entornos discretos antes de escalar a entornos continuos.
- Demostraciones de carga desde el Hub: ejemplo minimo para verificar que el flujo `load_from_hub` + `gym.make` funciona en un proyecto, ya que el repositorio es pequeno (0,0 GB) y la carga es inmediata.
- Analisis de politicas aprendidas: inspeccionar la tabla Q para estudiar que estados tienen valores altos o bajos y detectar posibles sesgos de exploracion en el entrenamiento.
- Entornos de prueba para algoritmos de planificacion: usar el agente como politica de referencia al comparar con metodos de busqueda o value iteration sobre el modelo del entorno.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7,48 +/- 2,76 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q en memoria, sin inferencia en GPU.
- GPU recomendadas: ninguna; la ejecucion es en CPU.
- Cabe en cualquier maquina: el fichero `q-learning.pkl` y el entorno Taxi-v4 ocupan unos pocos kilobytes.
- Opciones de despliegue: Python con `gymnasium` y la utilidad `load_from_hub` del ecosistema Hugging Face; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se dispone de mediciones publicadas; al ser una consulta a tabla, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| q-Taxi-v4 (este) | Q-Learning tabular | Taxi-v4 | tabla 500x6 | no aplica | mean_reward 7,48 +/- 2,76 | no disponible |
| Agentes Q-Learning de referencia del curso HF | Q-Learning tabular | Taxi-v4 | tabla 500x6 | no aplica | no disponible | no disponible |
| DQN sobre Taxi-v4 | Red neuronal profunda | Taxi-v4 | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos publicados de los modelos alternativos en la informacion proporcionada; la comparativa se limita a la categoria y al algoritmo.

## Limitaciones y advertencias

- Rendimiento limitado: una recompensa media de 7,48 sobre un maximo teorico de aproximadamente 15 por episodio indica una politica suboptima y alta varianza (desviacion de 2,76).
- Sin verificacion: el resultado del model-index esta marcado como `verified: false`; no ha sido reproducido de forma independiente.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin autorizacion explicita y debe consultarse con el autor.
- Sin documentacion de entrenamiento: no se publican hiperparametros, semillas ni numero de episodios, lo que impide reproducir el entrenamiento.
- Especifico del entorno: la tabla Q solo es valida para Taxi-v4 con la configuracion por defecto; variantes como `is_slippery` u otros entornos requieren reentrenamiento.
- Sin capacidades de lenguaje ni vision: no debe confundirse con un modelo generativo; no procesa texto ni imagenes.
- Riesgo de sobreajuste a la politica de exploracion: la tabla puede reflejar una cobertura de estados incompleta si el entrenamiento no exploro suficientemente.

## Enlaces

- Hugging Face: https://huggingface.co/riyunkim000226/q-Taxi-v4
- Entorno Taxi-v4 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de carga de agentes RL en Hugging Face: https://huggingface.co/docs/hub/en/models-downloading
