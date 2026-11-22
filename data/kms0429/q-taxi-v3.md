# kms0429/q-Taxi-v3

## Resumen

`kms0429/q-Taxi-v3` es un agente de aprendizaje por refuerzo entrenado mediante Q-Learning tabular para resolver el entorno `Taxi-v3` de Gymnasium (antiguo OpenAI Gym). No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada en un fichero `q-learning.pkl`, publicada en Hugging Face por el usuario `kms0429` bajo el pipeline `reinforcement-learning`. El repositorio es de tamano practicamente nulo (0.0 GB), lo que es coherente con una tabla Q de dimensiones reducidas para un entorno discreto con 500 estados y 6 acciones.

El entorno `Taxi-v3` es un clasico de benchmark en RL: un taxi debe recoger a un pasajero en una de cuatro ubicaciones y dejarlo en otra, con un espacio de estados de 500 combinaciones y 6 acciones discretas (moverse en cuatro direcciones, recoger y dejar pasajero). El agente Q-Learning aprende una politica optima mediante actualizaciones de la tabla Q con la ecuacion de Bellman, sin funcion de aproximacion.

La relevancia de esta ficha es limitada en terminos de aplicacion practica: es un artefacto de aprendizaje o experimentacion, no un modelo desplegable en produccion. Su interes reside en que sirve como referencia minima de como se publica un agente RL en el Hub y como se declara su rendimiento mediante `model-index`. La model card es extremadamente escueta y no aporta informacion sobre hiperparametros, semillas, numero de episodios ni detalles del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de un solo paso con estado discreto) |
| Tipos de cuantizacion | no aplica (pesos en pickle, no hay cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle, fichero `q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clasico. El agente mantiene una tabla Q de dimensiones `[n_estados, n_acciones]` (500 x 6 en `Taxi-v3`) e inicializa los valores a cero o a un valor constante. En cada paso actualiza la entrada correspondiente al par estado-accion mediante la regla de actualizacion de Bellman: `Q(s,a) <- Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a))`, con una politica epsilon-greedy para la exploracion. No hay red neuronal, ni descenso de gradiente, ni funcion de aproximacion.

No se dispone de informacion sobre el numero de episodios de entrenamiento, la tasa de aprendizaje (`alpha`), el factor de descuento (`gamma`), la politica de decaimiento de epsilon, la semilla aleatoria ni el numero de repeticiones. La model card solo indica que el fichero de pesos se llama `q-learning.pkl` y que se carga con `load_from_hub`. Tampoco se especifica si el entorno se entreno con `is_slippery=True` (comportamiento por defecto de `Taxi-v3`) o con `is_slippery=False`, un detalle relevante porque cambia la dinamica del entorno y, por tanto, la politica aprendida. La model card advierte explicitamente de que el usuario debe comprobar si necesita anadir atributos como `is_slippery=False` al cargar el entorno.

## Capacidades

- Resolucion del entorno `Taxi-v3` de Gymnasium: el agente selecciona una de las 6 acciones discretas en funcion del estado observado.
- Politica aprendida por Q-Learning tabular: no requiere inferencia neuronal, la consulta es una busqueda en tabla.
- Carga mediante `load_from_hub` con el fichero `q-learning.pkl`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso ni razonamiento encadenado fuera del bucle episodico del entorno.
- No tiene capacidades multilingues: no procesa texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo minimo y reproducible de un agente Q-Learning entrenado, util para ilustrar la ecuacion de Bellman y la exploracion epsilon-greedy en un curso introductorio.
- Pruebas de infraestructura de RL: permite validar pipelines de carga de agentes desde el Hub (`load_from_hub`), evaluacion con `mean_reward` y registro de resultados en `model-index` sin coste computacional.
- Baseline de comparacion: al ser un agente tabular sobre un entorno de 500 estados, sirve como referencia inferior frente a metodos con aproximacion de funcion (DQN, PPO) en el mismo entorno.
- Verificacion de entornos Gymnasium: util para comprobar la integracion de `Taxi-v3` con distintas versiones de Gymnasium y confirmar el efecto de `is_slippery` en la politica cargada.
- Experimentos de reproducibilidad: punto de partida para estudiar la varianza del rendimiento segun semilla, dado el intervalo declarado de `7.54 +/- 2.73` en `mean_reward`.
- Demostraciones educativas de publicacion en Hugging Face: ejemplo de como estructurar una model card con `model-index` para un agente RL, aunque la documentacion sea minima.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.54 +/- 2.73 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion con DQN, PPO ni otros agentes sobre `Taxi-v3`. La desviacion tipica de 2.73 sobre una media de 7.54 indica una varianza alta en la evaluacion, lo que sugiere una politica no del todo estable o un numero reducido de episodios de evaluacion.

## Requisitos de hardware

- VRAM: no aplica. El agente es una tabla Q en pickle; la inferencia es una consulta en memoria.
- GPU recomendadas: ninguna. No requiere aceleracion por hardware.
- Cabe en cualquier CPU consumer; el cuello de botella es la simulacion del entorno `Taxi-v3`, no el agente.
- Opciones de despliegue: Python con Gymnasium y el helper `load_from_hub` de Hugging Face; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al ser una busqueda en tabla, la latencia por paso es del orden de microsegundos; el rendimiento real lo determina el bucle de simulacion del entorno.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| kms0429/q-Taxi-v3 | Q-Learning tabular | Taxi-v3 | tabla 500x6 | no aplica | 7.54 +/- 2.73 (mean_reward, no verificado) | no disponible |
| Agentes DQN sobre Taxi-v3 | Red neuronal profunda | Taxi-v3 | no disponible | no aplica | no disponible | no disponible |
| Agentes PPO sobre Taxi-v3 | Policy gradient | Taxi-v3 | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La comparacion cualitativa se limita al tipo de metodo: Q-Learning tabular frente a aproximacion de funcion, con la ventaja de simplicidad y la desventaja de no escalar a espacios de estados continuos o grandes.

## Limitaciones y advertencias

- Model card extremadamente escueta: no documenta hiperparametros, semilla, numero de episodios ni configuracion del entorno, lo que impide reproducir el entrenamiento.
- Ambiguedad sobre `is_slippery`: la model card no aclara si el entrenamiento uso la dinamica estocastica por defecto; cargar el entorno con una configuracion distinta puede degradar la politica.
- Rendimiento no verificado (`verified: false`) y con alta varianza (desviacion tipica de 2.73), lo que cuestiona la robustez de la politica.
- Sin licencia declarada: no hay autorizacion explicita para uso comercial ni para redistribucion; debe tratarse como no licenciado hasta confirmacion del autor.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Aplicabilidad nula fuera de `Taxi-v3`: el agente no generaliza a otros entornos ni tareas.
- Riesgo de dependencia de version: el pickle puede no cargar correctamente con versiones distintas de Gymnasium o del helper de Hugging Face, y los pickles plantean riesgos de seguridad al deserializar ficheros de origen no confiable.
- No apto para produccion en tareas de lenguaje, vision, codigo o atencion al cliente: no es un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/kms0429/q-Taxi-v3
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Hugging Face sobre RL: https://huggingface.co/docs/hub/en/models
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
