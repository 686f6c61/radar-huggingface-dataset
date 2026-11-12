# dolind/taxi3-1

## Resumen

`dolind/taxi3-1` es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno `Taxi-v3` de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una política Q almacenada en un fichero `q-learning.pkl` que el autor publica en Hugging Face con el pipeline `reinforcement-learning`. El repositorio tiene un tamano practicamente nulo (0.0 GB), lo que es coherente con una tabla Q de estado-accion para un entorno discreto de 500 estados y 6 acciones.

El entorno `Taxi-v3` es un clasico de control discreto: un taxi debe recoger a un pasajero en una de cuatro localizaciones y dejarlo en otra, con 500 estados posibles y 6 acciones (moverse en cuatro direcciones, recoger y dejar). El agente declara un `mean_reward` de 7.48 +/- 2.74 en evaluacion, un resultado modesto que sugiere una politica funcional pero lejos de la solucion optima (que ronda recompensas medias de 8-9 con hiperparametros bien ajustados).

La relevancia de esta ficha es acotada: se trata de un artefacto educativo o de experimentacion, no de un modelo de produccion. Resulta util como referencia para entender el flujo de entrenamiento y publicacion de agentes Q-Learning en el Hub, y para reproducir el entorno `Taxi-v3` con un baseline concreto. No hay informacion sobre licencia, idiomas ni arquitectura neuronal porque no aplican en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion), no neuronal |
| Parametros totales | no disponible (tabla Q discreta; sin recuento de parametros publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de decision secuencial, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica; pesos serializados en `q-learning.pkl` |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | Pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

El agente emplea Q-Learning clasico, un algoritmo de diferencias temporales off-policy que actualiza una tabla Q indexada por estado y accion. El entorno `Taxi-v3` es un MDP discreto con 500 estados y 6 acciones; la tabla Q resultante es, por tanto, de dimensiones pequenas y cabe holgadamente en memoria. No hay red neuronal, ni funcion de aproximacion, ni procesamiento de lenguaje: la politica se deriva tomando `argmax` sobre la tabla Q para cada estado.

No se dispone de informacion sobre hiperparametros de entrenamiento (tasa de aprendizaje, factor de descuento, politica epsilon-greedy, numero de episodios), composicion del dataset (el propio entorno genera las transiciones) ni si se aplicaron tecnicas adicionales como Double Q-Learning o SARSA. La model card indica que el agente fue entrenado con una implementacion personalizada (`custom-implementation`) y que se debe comprobar si el entorno requiere `is_slippery=False` u otros atributos al cargarlo.

## Capacidades

- Resolucion del entorno `Taxi-v3`: seleccionar acciones discretas (moverse, recoger, dejar) para completar la tarea de transporte de pasajeros.
- Politica determinista derivada de la tabla Q: dado un estado, devuelve la accion con mayor valor Q.
- Serializacion y carga via `load_from_hub` de Hugging Face con el fichero `q-learning.pkl`.
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, ni capacidades multilingues.
- No dispone de modo de razonamiento, vision, audio ni generacion de texto.

## Casos de uso

- Docencia y formacion en RL: util como ejemplo reproducible de Q-Learning tabular y del flujo de publicacion de agentes en el Hub, permitiendo a estudiantes cargar el modelo y comparar su politica con la optima.
- Baseline en investigacion de RL: sirve como referencia de rendimiento (mean_reward 7.48) frente a algoritmos mas avanzados (DQN, PPO) en `Taxi-v3`, para medir mejoras relativas.
- Pruebas de integracion de Gymnasium: permite validar pipelines de evaluacion que cargan entornos y agentes desde el Hub, comprobando el ciclo `load_from_hub` + `gym.make`.
- Experimentos de curriculum y exploracion: el agente puede usarse como politica inicial o como comparador en estudios sobre epsilon-greedy, decaimiento de exploracion y estabilidad del aprendizaje tabular.
- Reproduccion de resultados: dado que la model card documenta el `mean_reward` y el formato del fichero, permite reproducir la evaluacion declarada y verificar la desviacion tipica reportada (2.74).
- Entornos educativos de robotica simplificada: aunque abstracto, el problema de recogida y entrega con localizaciones discretas sirve para ilustrar planificacion en espacios de estados pequenos antes de pasar a entornos continuos.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.48 +/- 2.74 |

No se han publicado en la informacion disponible resultados comparativos con otros agentes, curvas de aprendizaje, tasas de exito ni numero de episodios de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; la tabla Q cabe en memoria RAM (kilobytes a pocos megabytes).
- GPU recomendadas: no aplica; el agente se ejecuta en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU (Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: carga directa con `load_from_hub` de Hugging Face y `gym.make("Taxi-v3")`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una consulta a tabla, la latencia es de microsegundos por decision en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| dolind/taxi3-1 | Q-Learning tabular | Taxi-v3 | no disponible | no aplica | mean_reward 7.48 +/- 2.74 | no disponible |
| Agentes DQN para Taxi-v3 | Red neuronal profunda | Taxi-v3 | no disponible | no aplica | no disponible en la informacion | no disponible |
| Agentes PPO para Taxi-v3 | Policy gradient | Taxi-v3 | no disponible | no aplica | no disponible en la informacion | no disponible |

No se dispone de datos publicados en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Rendimiento limitado: un `mean_reward` de 7.48 +/- 2.74 esta por debajo del optimo tipico en `Taxi-v3` (cercano a 8-9), lo que indica una politica suboptima o evaluacion con alta varianza.
- Sin licencia declarada: no se puede asumir uso comercial sin consultar al autor; la ausencia de licencia es un riesgo legal para produccion.
- Modelo especifico de un entorno: no generaliza a otras tareas ni entornos; la tabla Q solo es valida para `Taxi-v3` con la configuracion exacta de entrenamiento.
- Dependencia de configuracion del entorno: la model card advierte de comprobar atributos como `is_slippery=False`; una configuracion distinta invalida la politica.
- Sin verificacion de resultados: el `model-index` marca `verified: false`, por lo que las metricas no han sido contrastadas de forma independiente.
- Sin informacion sobre sesgos: al no tratar datos humanos ni lenguaje, no aplican sesgos sociales en el sentido habitual, pero tampoco hay analisis de robustez.
- Riesgo de sobreajuste a la semilla de entrenamiento: no se documentan multiples semillas ni intervalos de confianza mas alla de la desviacion reportada.
- Repositorio sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, sin garantia de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dolind/taxi3-1
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Q-Learning en el Hub de Hugging Face: https://huggingface.co/docs/hub/en/models
- Repositorio de referencia de agentes RL en el Hub (deep-rl-class): https://github.com/huggingface/deep-rl-class
