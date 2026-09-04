# nchristo-synaptics/act_touch_ablation_nowrist_touch_20260903

## Resumen

El modelo `nchristo-synaptics/act_touch_ablation_nowrist_touch_20260903` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. Ha sido desarrollada por Nicholas Christoffersen (`nchristo-synaptics`) y está pensada para controlar un robot de tipo `so_follower` en la tarea concreta de colocar una bola amarilla en un cuenco rojo. El modelo consume observaciones de estado y una imagen de una cámara superior, y genera acciones de 6 dimensiones para el robot.

Con 51.696.102 parámetros y un peso total de 0,2 GB, es una política compacta y ligera, apta para entornos de investigación y prototipado. Al estar licenciada bajo Apache-2.0 y publicada en el Hub de Hugging Face, puede integrarse directamente en el ecosistema LeRobot para realizar despliegues en robots reales o simulados. Su relevancia radica en que representa un ejemplo práctico de entrenamiento de una política ACT con datos teleoperados, útil para estudiar el efecto de diferentes configuraciones de sensores en tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.696.102 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision-accion sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no aplica; modelo de vision-accion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower |
| Entrada de imagen | observation.images.top, 3x240x320 |
| Entrada de estado | observation.state, dimension 6 |
| Entrada de entorno | observation.environment_state, dimension 120 |
| Salida de accion | accion, dimension 6 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo sigue el enfoque ACT (Action Chunking with Transformers), descrito en el paper arxiv:2304.13705. En lugar de predecir una unica accion por paso de tiempo, el modelo predice un fragmento (chunk) de acciones, lo que permite ejecutar secuencias mas coherentes y suavizadas. Esto es especialmente util en manipulacion robotica, donde las acciones individuales pueden ser ruidosas o dificiles de ejecutar con precision.

El entrenamiento se realizo con el dataset `nchristo-synaptics/touch-vision-v3_20260902_152740`, compuesto por 16 episodios y 6688 fotogramas a 30 FPS. La tarea registrada es "place yellow ball in red bowl". Segun la configuracion de entrenamiento publicada, se ejecutaron 100.000 pasos con un tamaño de lote de 8, optimizador AdamW y una tasa de aprendizaje de 1e-05, con semilla 1000. El entrenamiento se llevo a cabo con la version 0.6.2 de LeRobot. No se indica que se haya aplicado RLHF, DPO ni ninguna tecnica de alineacion posterior, ya que se trata de un modelo de control robotico por imitacion.

## Capacidades

- Generacion de acciones de control robotico de 6 dimensiones para la tarea entrenada.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de un modelo dinamico explicito.
- Procesamiento de una imagen visual de entrada (240x320 píxeles, 3 canales) junto con estados del robot y del entorno.
- Prediccion de fragmentos de acciones (action chunking), lo que permite movimientos mas suaves y robustos en entornos reales.
- Soporte para despliegue mediante LeRobot, con los comandos `lerobot-rollout` y `lerobot-train`.
- Integracion nativa con el formato safetensors y el ecosistema de Hugging Face.
- No soporta generacion de texto, tool calling, razonamiento logico ni capacidades multilingues; sus capacidades se limitan al control robotico por vision y estado.

## Casos de uso

- Manipulacion de objetos en laboratorio: el modelo puede ejecutar la tarea de colocar una bola amarilla en un cuenco rojo, lo que resulta util para automatizar experimentos repetitivos de recogida y colocacion.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo de una politica ACT entrenada con pocos episodios, ideal para estudiar el efecto de la cantidad de datos o de la configuracion de sensores en el rendimiento.
- Ablacion de sensores: dado el nombre del repositorio (`nowrist_touch`), el modelo parece diseñado para evaluar el impacto de eliminar la camara de muñeca o el sensor tactil. Esto permite a los investigadores comparar variantes y entender que entradas son mas relevantes.
- Prototipado de robots con LeRobot: al ser un modelo ligero y compatible con la libreria LeRobot, puede integrarse rapidamente en un robot real o en un entorno simulado para probar estrategias de control.
- Educacion y formacion en robotica: el modelo proporciona un caso de estudio completo y reproductible para estudiantes que aprenden a entrenar politicas de imitacion con transformers.
- Automatizacion de tareas de picking y placing en entornos controlados: aunque la tarea es muy especifica, la arquitectura ACT puede adaptarse a variaciones similares, siempre que se disponga de datos de entrenamiento adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del modelo indica explicitamente en la model card que no se han proporcionado resultados de evaluacion ("No evaluation results have been provided for this policy yet"). Por tanto, no es posible comparar este modelo con otros basados en metricas estandar como MMLU, HumanEval o GSM8K, que ademas no son aplicables a este tipo de modelo de control robotico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 51,7 millones de parametros y 0,2 GB de pesos, se espera que el modelo quepa en GPUs de consumo, pero no se proporcionan cifras concretas.
- GPU recomendadas: no hay datos oficiales. Se puede utilizar cualquier GPU compatible con CUDA, dada la naturaleza de PyTorch y LeRobot.
- Compatibilidad con GPUs de consumo: probablemente si, por su reducido tamaño, aunque no se ha verificado.
- Opciones de despliegue: LeRobot (via `lerobot-rollout`), Hugging Face, y posiblemente otros entornos que carguen safetensors, como vLLM o llama.cpp no aplican por tratarse de un modelo de vision-accion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada otros modelos comparables de la misma categoria (politicas ACT para robot `so_follower` con la misma tarea) con los que establecer una comparativa fiable.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea "place yellow ball in red bowl", lo que limita su capacidad de generalizacion a otros objetos, posiciones o escenarios.
- El dataset de entrenamiento es muy reducido (16 episodios y 6688 fotogramas), lo que aumenta el riesgo de sobreajuste a las condiciones de captura.
- No se han publicado resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito efectiva.
- Existe una discrepancia en la model card: se indican camaras `wrist` y `top`, pero los inputs del modelo solo incluyen `observation.images.top`. Esto sugiere que la camara de muñeca no se utiliza realmente, o que la documentacion no esta actualizada.
- El modelo no tiene capacidades de lenguaje ni de razonamiento generativo, por lo que no puede interpretar instrucciones en texto ni responder preguntas.
- Licencia Apache-2.0: permite uso comercial y modificaciones, siempre que se mantenga el aviso de licencia y se indiquen los cambios realizados.
- No hay informacion sobre sesgos, ya que no es un modelo de lenguaje. Sin embargo, al depender de datos de entrenamiento limitados, puede heredar sesgos de las demostraciones teleoperadas (por ejemplo, posiciones iniciales o preferencias del operador).

## Enlaces

- Repositorio del modelo: https://huggingface.co/nchristo-synaptics/act_touch_ablation_nowrist_touch_20260903
- Dataset de entrenamiento: https://huggingface.co/datasets/nchristo-synaptics/touch-vision-v3_20260902_152740
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nchristo-synaptics/touch-vision-v3_20260902_152740
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
