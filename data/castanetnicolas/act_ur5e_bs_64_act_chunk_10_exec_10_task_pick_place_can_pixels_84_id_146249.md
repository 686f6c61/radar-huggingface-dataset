# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_pick_place_can_PIXELS_84_ID_146249

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice secuencias cortas de acciones (chunks) en lugar de un unico paso de control. Este repositorio concreto es una politica entrenada por el usuario castanetnicolas con LeRobot sobre un dataset propio de demostraciones teleoperadas para la tarea "Pick up the can and place it in the matching bin". El modelo aprende una politica visomotora que mapea el estado del robot y dos vistas de camara a un vector de accion de 7 dimensiones.

Se trata de un modelo pequeno (51.580.551 parametros, aproximadamente 51,6 millones), orientado exclusivamente a robotica y no a generacion de texto. Consume como entrada el estado del robot (vector de 9 valores) y dos imagenes RGB de 84x84 pixeles (vista `agentview` y vista `robot0_eye_in_hand`), y produce acciones de 7 valores. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0.

Su relevancia es la de un ejemplo reproducible de politica ACT entrenada con LeRobot: sirve para replicar el flujo de trabajo completo (grabacion de datos, entrenamiento y despliegue con `lerobot-rollout`) sobre tareas de manipulacion pick-and-place. No dispone de resultados de evaluacion publicados y no acumula descargas ni "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con prediccion de chunks de accion, descrito en arXiv:2304.13705 |
| Parametros totales | 51.580.551 (aproximadamente 51,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (politica robotica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural como entrada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos de configuracion relevantes:

| Parametro | Valor |
|---|---|
| Libreria | lerobot |
| Tipo de robot declarado en la model card | panda |
| Camaras declaradas | agentview, robot0_eye_in_hand |
| Entrada `observation.state` | STATE, forma (9,) |
| Entrada `observation.images.agentview` | VISUAL, forma (3, 84, 84) |
| Entrada `observation.images.robot0_eye_in_hand` | VISUAL, forma (3, 84, 84) |
| Salida `action` | ACTION, forma (7,) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo implementa ACT, un metodo de aprendizaje por imitacion que predice chunks de acciones cortos en lugar de pasos individuales, lo que reduce el error de compounding en el control y permite cierta variabilidad en la ejecucion. Emplea un transformer como columna vertebral y toma como entrada el estado proprioceptivo y representaciones visuales (en este caso, dos camaras RGB a 84x84). La model card enlaza el paper arXiv:2304.13705 como referencia metodologica, pero no detalla la composicion interna de capas ni el numero exacto de tokens de accion por chunk.

Los datos de entrenamiento proceden del dataset `castanetnicolas/robomimic_can_ph_image84`, que contiene 200 episodios y 23.207 frames grabados a 20 FPS para la tarea de coger una lata y colocarla en el contenedor correspondiente. La configuracion de entrenamiento declarada es: 100.000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot version 0.6.1. El nombre del repositorio incluye las cadenas `Act_Chunk_10_Exec_10`, lo que sugiere un tamanio de chunk y de ejecucion de 10, aunque este dato no se confirma explicitamente en la model card. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores al aprendizaje por imitacion supervisado.

## Capacidades

- Control visomotor para manipulacion robotica: genera comandos de accion a partir de estado e imagenes.
- Ejecucion de la tarea especifica "Pick up the can and place it in the matching bin" sobre la que fue entrenado.
- Procesamiento de dos vistas de camara simultaneas (vista externa `agentview` y vista en la muneca `robot0_eye_in_hand`).
- Prediccion de chunks de acciones (varias acciones por inferencia segun el metodo ACT).
- No dispone de generacion de lenguaje natural, razonamiento simbolico ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Capacidades multilingues: no aplica.
- No dispone de modo de razonamiento explicito (thinking mode), vision de proposito general, audio ni modulos multimodales mas alla de las dos camaras de la politica.

## Casos de uso

- Manipulacion pick-and-place en robot de laboratorio: la politica ejecuta la secuencia de coger una lata y depositarla en el contenedor objetivo a partir de las observaciones visuales, adecuada para bancos de prueba con robot tipo panda o similar.
- Punto de partida para reentrenamiento con datos propios: al estar entrenado con LeRobot y distribuirse en safetensors, sirve como base para ajustar el modelo a una nueva tarea o a un nuevo objeto cambiando el dataset en `lerobot-train`.
- Validacion de pipelines de aprendizaje por imitacion: util para verificar el flujo completo de grabacion de datos, entrenamiento y despliegue con `lerobot-rollout` sin necesidad de infraestructura grande dado su tamano.
- Investigacion en politicas visomotoras: permite estudiar el comportamiento de ACT con entradas visuales de baja resolucion (84x84) y su robustez ante variaciones de posicion.
- Docencia y practicas de robotica: el reducido numero de parametros y el bajo requisito de hardware facilitan su uso en aulas o practicas con una unica GPU.
- Evaluacion comparativa de metodos de imitacion: puede enfrentarse a otras politicas (por ejemplo, Diffusion Policy) sobre la misma tarea para comparar tasas de exito, una vez realizadas las evaluaciones oportunas.
- Automatizacion de tareas repetitivas de recogida en entornos controlados, siempre que la disposicion de objetos y la iluminacion se mantengan dentro del dominio de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card indica explicitamente: "No evaluation results have been provided for this policy yet". No se aportan tasas de exito en robot real, metricas de perdida ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 0,2 GB (51,58 M de parametros x 4 bytes); con activaciones y buffers de inferencia, el consumo cabe holgadamente por debajo de 1 GB, aunque no se especifica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA puede ejecutar el modelo; dada su magnitud, bastan tarjetas consumer como una RTX 3060, 4060 o superiores. Modelos de gama alta (RTX 4090, A100, H100) son sobredimensionados para esta politica.
- Compatibilidad con GPU consumer: si, el modelo cabe en cualquier GPU consumer moderna e incluso podria ejecutarse en CPU, aunque la latencia en CPU podria comprometer el control en tiempo real.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--strategy.type=base`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponible. Al tratarse de una politica de control robotico a 20 FPS en los datos de entrenamiento, la latencia de inferencia es un factor critico, pero no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos cuantitativos publicados para comparar este modelo con alternativas. Comparativa cualitativa con metodos del mismo ambito:

| Modelo | Parametros | Contexto / entradas | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este repositorio) | 51,58 M | Estado (9,) + 2 imagenes 84x84 | Aprendizaje por imitacion, action chunking | Apache 2.0 | HuggingFace (LeRobot), 0 descargas |
| Diffusion Policy | no disponible | Vision + estado | Aprendizaje por imitacion, modelo de difusion | no disponible | Implementaciones publicas en LeRobot |
| Otras politicas ACT de la comunidad | variable, no disponible | Vision + estado | Aprendizaje por imitacion, action chunking | variable | HuggingFace |

Los valores de parametros, contexto y rendimiento de las alternativas no se han verificado en la informacion proporcionada y deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- No se han publicado evaluaciones: se desconoce la tasa de exito real en robot fisico.
- Incoherencia en la nomenclatura: el identificador del repositorio incluye `UR5e`, mientras que la model card declara el tipo de robot como `panda`. Esta discrepancia debe resolverse antes de usar el modelo en hardware real, ya que la cinematica y el espacio de acciones pueden no coincidir.
- Especializacion extrema: la politica esta entrenada para una unica tarea ("Pick up the can and place it in the matching bin") y un unico objeto; no generaliza a otras tareas sin reentrenamiento.
- Sensibilidad al dominio visual: al usar imagenes de 84x84 y un dataset de 200 episodios, es probable que la politica sea fragil ante cambios de iluminacion, posicion de objetos, distractores o un robot distinto del usado en la grabacion.
- Riesgo de fallo silencioso: como toda politica de imitacion, puede producir acciones plausibles pero incorrectas sin senal de error explicita.
- Sesgos conocidos: no disponibles (no se documentan sesgos, y al no procesar lenguaje no aplican sesgos linguisticos, pero si pueden existir sesgos derivados de la distribucion de demostraciones).
- Limitaciones de idioma y contexto: no aplica, el modelo no procesa texto.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre el cumplimiento de seguridad en entornos reales.
- Reproducibilidad: se documenta LeRobot 0.6.1 y la semilla, pero no se garantiza que el entrenamiento sea reproducible con otras versiones.
- Cero adopcion: 0 descargas y 0 likes en el momento de redactar, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_pick_place_can_PIXELS_84_ID_146249
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_can_ph_image84
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_can_ph_image84
