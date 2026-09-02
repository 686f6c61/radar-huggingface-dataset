# NickKuijpers/act_record101_v1

## Resumen

El modelo `NickKuijpers/act_record101_v1` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por NickKuijpers y entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación robótica. El modelo se ha entrenado específicamente para la tarea de clasificar clips blancos ("sort white clip") utilizando un robot tipo `so_follower` con dos cámaras (frontal y pinza).

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, este modelo es relativamente ligero en comparación con los grandes modelos de lenguaje, pero está diseñado para operar en tiempo real en sistemas robóticos. Su relevancia radica en que demuestra cómo el aprendizaje por imitación con transformadores puede aplicarse a tareas de manipulación física con datos teleoperados, un área de creciente interés en la robótica de bajo coste y la investigación en IA aplicada. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso y modificación tanto en entornos académicos como industriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con codificador y decodificador |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision-accion, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (modelo de control robotico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). Se compone de un codificador que procesa las observaciones (imagenes de dos camaras a 480x640 píxeles y un vector de estado de 6 dimensiones) y un decodificador que genera secuencias de acciones de 6 dimensiones. La innovacion clave de ACT es la prediccion de chunks de acciones, lo que reduce la acumulacion de errores y mejora la suavidad del movimiento en comparacion con metodos que predicen un solo paso.

El entrenamiento se realizo con el framework LeRobot (version 0.6.1) sobre el dataset `willemelliw/record_150_ep_clips`, que contiene 101 episodios teleoperados (44.426 frames a 30 FPS) de la tarea "sort white clip". Se utilizaron 30.000 pasos de entrenamiento con un batch size de 16, optimizador AdamW y una tasa de aprendizaje de 1e-05. No se aplicaron tecnicas de RLHF ni DPO; el metodo es puramente de aprendizaje por imitacion supervisada.

## Capacidades

- Control de robot manipulador: genera acciones de 6 grados de libertad (posicion y orientacion de la pinza) a partir de observaciones visuales y de estado.
- Procesamiento multimodal: integra dos flujos de imagen (camara frontal y camara de la pinza) junto con el estado del robot.
- Ejecucion de tareas especificas: entrenado para la tarea de clasificar clips blancos, aunque la arquitectura es generalizable a otras tareas de manipulacion con datos similares.
- Inferencia en tiempo real: al ser un modelo pequeno (51M parametros), puede ejecutarse con baja latencia en hardware modesto.
- No soporta tool calling, agentes conversacionales ni generacion de texto; su unica salida es el vector de accion.

## Casos de uso

- Clasificacion de objetos en lineas de produccion: el modelo puede integrarse en un robot `so_follower` para separar clips blancos de otros objetos, utilizando las camaras para detectar y manipular las piezas.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del chunking de acciones en la precision y robustez de politicas robotica.
- Prototipado de soluciones roboticas de bajo coste: al ser ligero y de codigo abierto, puede desplegarse en robots de escritorio con GPUs consumer para validar conceptos antes de escalar.
- Automatizacion de tareas repetitivas en laboratorios: tareas como ordenar o clasificar pequenos componentes pueden delegarse a este modelo, liberando tiempo de personal tecnico.
- Benchmark de politicas ACT: permite comparar el rendimiento de diferentes configuraciones de entrenamiento (numero de episodios, tamano de chunk, etc.) sobre una tarea estandarizada.
- Educacion en robotica: el modelo y su pipeline de entrenamiento (LeRobot) son adecuados para cursos de robotica e IA aplicada, ya que el codigo y los datos son accesibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de exito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamano del modelo (51M parametros) y las entradas de imagen (2 x 480x640), se estima que puede ejecutarse en GPUs con al menos 4-6 GB de VRAM, pero no hay datos confirmados.
- GPU recomendadas: no se especifican. Por el tamano, una GPU consumer como una RTX 3060 o superior deberia ser suficiente, pero no hay garantia oficial.
- Compatibilidad con consumer GPU: probablemente si, dado el bajo numero de parametros, pero no confirmado.
- Opciones de despliegue: el modelo se usa a traves de LeRobot, con comandos como `lerobot-rollout`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Se espera que sea adecuado para control en tiempo real, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos ACT de LeRobot. Existen multiples politicas ACT publicadas en Hugging Face (por ejemplo, las del propio equipo de LeRobot), pero no se han encontrado datos de rendimiento comparables para este modelo concreto. Se recomienda consultar el [espacio de LeRobot](https://huggingface.co/lerobot) para ver otros modelos de la misma familia.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo esta entrenado exclusivamente para "sort white clip" y no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere el robot `so_follower` y las camaras especificas (frontal y pinza) con las mismas resoluciones y posiciones que en el entrenamiento.
- Sin evaluacion publicada: no hay datos de exito en robot real, por lo que su rendimiento en produccion es incierto.
- Sesgos del dataset: los datos provienen de un unico operador y entorno, lo que puede limitar la robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero la politica puede generar acciones incorrectas si las observaciones difieren mucho del dominio de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no incluye garantias de seguridad para aplicaciones criticas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/NickKuijpers/act_record101_v1)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/willemelliw/record_150_ep_clips)
- [LeRobot (repositorio oficial)](https://github.com/huggingface/lerobot)
- [Documentacion de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
