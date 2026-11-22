# marinabluesea/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular para resolver el entorno Taxi-v4 de Gymnasium (el clasico problema del taxi que debe recoger y dejar pasajeros en una cuadricula de 5x5). Lo desarrolla el usuario marinabluesea y se publica en Hugging Face dentro de la categoria de modelos de reinforcement learning. No es un modelo de lenguaje: no tiene parametros neuronales, ni contexto, ni capacidad generativa. Su "peso" es una tabla Q serializada en un fichero `q-learning.pkl`.

El modelo se enmarca en la familia de artefactos que genera la libreria de entrenamiento de agentes de Hugging Face (deep-rl / stable-baselines), que exporta agentes clasicos como ficheros pickle junto con una model card autogenerada. Su relevancia es, por tanto, didactica y de referencia: sirve como ejemplo minimo reproducible de un agente RL en el Hub, no como componente para produccion.

El rendimiento declarado por el autor es de una recompensa media de 7,56 +/- 2,71 en Taxi-v4. El repo ocupa 0,0 GB (es decir, unos pocos kilobytes), no tiene descargas ni likes y la licencia no esta especificada, lo que limita cualquier reutilizacion comercial sin contactar con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre el espacio de estados discreto de Taxi-v4) |
| Parametros totales | no disponible (no es un modelo neuronal; tabla Q de 500 estados x 6 acciones en Taxi-v4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de decision secuencial, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (pesos en formato pickle, sin cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clasico, un metodo de aprendizaje por refuerzo off-policy y sin modelo que estima el valor de pares estado-accion mediante actualizaciones de la ecuacion de Bellman: Q(s,a) <- Q(s,a) + alpha * [r + gamma * max_a' Q(s',a') - Q(s,a)]. En Taxi-v4 el espacio de estados es discreto y finito (500 estados: 25 posiciones del taxi x 5 posiciones de pasajero x 4 destinos), y el espacio de acciones tiene 6 opciones (mover en cuatro direcciones, recoger y dejar). La tabla Q resultante es, por tanto, de 500 x 6 valores, lo que explica el tamano practicamente nulo del repositorio.

No se dispone de informacion sobre hiperparametros (tasa de aprendizaje, factor de descuento, politica de exploracion epsilon-greedy, numero de episodios), ni sobre si se aplico decaimiento de epsilon o inicializacion optimista. La model card es la plantilla autogenerada por la herramienta de entrenamiento y no aporta detalles del proceso. Tampoco hay informacion sobre semillas, numero de ejecuciones ni metodologia de evaluacion; el valor de recompensa media declarado no esta verificado (`verified: false`).

## Capacidades

- Resolucion del entorno Taxi-v4 de Gymnasium: el agente selecciona acciones discretas (moverse, recoger, dejar) para completar episodios de recogida y entrega de pasajeros.
- Politica greedy derivada de la tabla Q: dada una observacion discreta del entorno, devuelve la accion de mayor valor estimado.
- Carga directa desde el Hub mediante `load_from_hub` con el fichero `q-learning.pkl`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle episodico del entorno.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de thinking mode, vision, audio ni ninguna modalidad adicional.

## Casos de uso

- Docencia de reinforcement learning: usar el agente como ejemplo minimo y reproducible de Q-Learning tabular, cargandolo con `load_from_hub` y comparando su politica con la de un agente entrenado desde cero en clase.
- Verificacion de pipelines de evaluacion RL: sirve como baseline trivial para comprobar que un harness de evaluacion sobre Taxi-v4 funciona correctamente (recompensa esperada en torno a 7,56).
- Pruebas de integracion de la libreria de entrenamiento de Hugging Face: valida el flujo completo de exportacion e importacion de agentes pickle en el Hub.
- Referencia para comparar algoritmos: confrontar Q-Learning tabular con aproximaciones con redes neuronales (DQN) en el mismo entorno discreto para ilustrar la diferencia entre metodos tabulares y funcionales.
- Reproduccion de experimentos docentes: el fichero `q-learning.pkl` es ligero y se puede versionar junto con notebooks de practicas sin coste de almacenamiento.
- Demostracion de entornos Gymnasium: integrarlo en un script que renderice episodios de Taxi-v4 para visualizar la politica aprendida en talleres o tutoriales.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7,56 +/- 2,71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion con baselines en la model card.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q en memoria de unos pocos kilobytes y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier equipo, incluidos Raspberry Pi y entornos sin GPU.
- Despliegue: carga directa en Python con la libreria de entrenamiento de Hugging Face (`load_from_hub`) y Gymnasium (`gym.make`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del bucle de simulacion de Gymnasium, no del agente.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| q-Taxi-v4 (marinabluesea) | Q-Learning tabular | Taxi-v4 | 7,56 +/- 2,71 | no disponible | Hugging Face |
| Agentes Q-Learning de la comunidad en Taxi-v4 | Q-Learning tabular | Taxi-v4 | no disponible | variable | Hugging Face |
| DQN sobre Taxi-v4 | Deep Q-Network | Taxi-v4 | no disponible | variable | implementaciones de referencia |
| PPO sobre Taxi-v4 | Policy gradient | Taxi-v4 | no disponible | variable | implementaciones de referencia |

No se dispone de datos verificables de rendimiento de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El agente solo funciona en Taxi-v4; no es transferible a otros entornos ni tareas.
- La recompensa media de 7,56 +/- 2,71 es modesta y presenta alta varianza; el optimo de Taxi-v4 suele superar ampliamente ese valor, por lo que la politica puede ser suboptima.
- El resultado no esta verificado (`verified: false`) y no se documenta la metodologia de evaluacion (numero de episodios, semilla, politica de exploracion en test).
- No hay licencia declarada: el uso comercial es juridicamente incierto y requiere contactar con el autor.
- El formato pickle implica riesgos de seguridad al deserializar ficheros de origen no confiable; conviene auditar antes de cargar en produccion.
- No hay informacion sobre sesgos, alucinacion ni limitaciones de idioma porque no es un modelo de lenguaje.
- La model card es una plantilla autogenerada sin hiperparametros ni detalles de entrenamiento, lo que dificulta la reproducibilidad.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marinabluesea/q-Taxi-v4
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de agentes RL en Hugging Face: https://huggingface.co/docs/hub/en/models
- Repositorio de referencia de deep-rl en Hugging Face: https://github.com/huggingface/deep-rl-class
