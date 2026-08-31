# bjahoor/act-lift-cube-franka

## Resumen

El modelo `bjahoor/act-lift-cube-franka` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. El objetivo es que un brazo robótico Franka aprenda a levantar un cubo mediante aprendizaje por imitación a partir de datos teleoperados. Este modelo representa un ejemplo práctico de aplicación de transformers a la robótica, donde en lugar de predecir una sola acción, se predicen secuencias (chunks) de acciones, lo que mejora la estabilidad y el éxito en tareas de manipulación.

Fue desarrollado por el usuario `bjahoor` y publicado en Hugging Face con licencia Apache-2.0. El modelo tiene aproximadamente 51,7 millones de parámetros, un tamaño reducido que permite su ejecución en hardware moderado. Está diseñado para ser utilizado con el ecosistema LeRobot, que facilita el entrenamiento, la evaluación y el despliegue de políticas robóticas. Su relevancia radica en que demuestra cómo los modelos transformer pueden aplicarse directamente a problemas de control continuo en robótica, un campo donde tradicionalmente dominaban los métodos de aprendizaje por refuerzo o controladores clásicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.674.761 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision-accion, no lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. ACT es un metodo de aprendizaje por imitacion que predice bloques de acciones (action chunks) en lugar de acciones individuales. Utiliza un transformer con atencion cruzada entre la observacion visual y la informacion de estado del robot, y genera secuencias de comandos de articulacion para varios pasos futuros. Esta prediccion por bloques reduce el error acumulado y mejora la suavidad del movimiento.

El entrenamiento se realizo con el framework LeRobot, utilizando el dataset `bjahoor/lift-cube-franka`, que contiene episodios teleoperados de un brazo Franka levantando un cubo. No se dispone de detalles sobre el numero exacto de episodios, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. El modelo se entrena mediante aprendizaje supervisado (behavior cloning) sobre las demostraciones, optimizando la perdida de prediccion de acciones. No hay informacion publica sobre innovaciones tecnicas especificas mas alla de la arquitectura ACT estandar.

## Capacidades

- Control de manipulacion robotica: el modelo genera comandos de articulacion para que un brazo Franka ejecute la tarea de levantar un cubo.
- Prediccion de secuencias de acciones: emite chunks de acciones (tipicamente 10-100 pasos) que permiten movimientos coordinados y estables.
- Aprendizaje por imitacion: funciona exclusivamente a partir de demostraciones teleoperadas, sin necesidad de recompensas externas.
- Integracion con LeRobot: compatible con las herramientas de entrenamiento, evaluacion y grabacion de episodios de LeRobot.
- Vision y propriocepcion: procesa imagenes de camara y el estado de las articulaciones del robot para decidir las acciones.
- Sin capacidades de lenguaje: no soporta generacion de texto, tool calling ni razonamiento simbolico.

## Casos de uso

- Automatizacion de tareas de pick-and-place: el modelo puede controlar un brazo Franka para levantar y colocar objetos en entornos de fabricacion o logistica, reduciendo la necesidad de programacion manual.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del action chunking en la precision y robustez de politicas roboticas.
- Prototipado rapido en laboratorios: gracias a su tamano reducido y a la integracion con LeRobot, permite iterar rapidamente sobre nuevos datasets y tareas sin requerir infraestructura de alto rendimiento.
- Despliegue en robots de bajo coste: aunque fue entrenado para Franka, la politica puede adaptarse a otros brazos con cinematica similar, facilitando la transferencia a hardware mas accesible.
- Educacion en robotica: util como ejemplo didactico para ensenar como se entrena una politica transformer sobre datos reales de teleoperacion.
- Evaluacion de metodos de imitacion: al ser un modelo de referencia con licencia permisiva, puede usarse como baseline para comparar con otros algoritmos (p. ej., Diffusion Policy, VLA) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos publicos sobre tasa de exito, errores de trayectoria ni comparaciones con otros modelos en la tarea de levantar un cubo. La unica referencia es que el metodo ACT reporta altas tasas de exito en el paper original, pero no se dispone de metricas especificas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado que el modelo tiene ~51,7M de parametros y entradas de imagen, se estima que puede ejecutarse en GPUs con 4-6 GB de VRAM en precision FP32, y menos si se cuantiza (aunque no se ofrecen cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU moderna de consumo (p. ej., RTX 3060, RTX 4060) o profesional (T4, A10) es suficiente. No requiere A100/H100.
- Compatibilidad con consumer GPU: si, es viable en GPUs de gama media.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que utiliza PyTorch. Puede integrarse en pipelines de ROS o directamente en el robot via Python. No hay soporte oficial para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Depende de la resolucion de las imagenes de entrada y del hardware. Se espera una latencia de decenas de milisegundos por prediccion en una GPU moderna.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de la misma categoria (politicas roboticas basadas en ACT). Existen otros checkpoints de ACT en Hugging Face para tareas similares (p. ej., `niklashcs/franka_cube_lift_v5_for_act` como dataset, no como modelo), pero no hay datos publicos de rendimiento comparativo. El propio paper de ACT (arXiv:2304.13705) compara con metodos como Diffusion Policy, pero esos resultados no estan disponibles para este modelo concreto.

| Modelo | Parametros | Contexto | Licencia | Tarea |
|---|---|---|---|---|
| bjahoor/act-lift-cube-franka | 51,7M | no disponible | Apache-2.0 | Levantar cubo con Franka |
| (otros modelos ACT en HF) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos desconocidos: al estar entrenado con un dataset especifico (probablemente un solo robot y un solo escenario), puede no generalizar a otras configuraciones de camara, iluminacion o posiciones de objetos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede producir acciones incorrectas o inseguras si la observacion esta fuera de la distribucion de entrenamiento.
- Limitaciones de contexto: el modelo no procesa lenguaje ni instrucciones de alto nivel; solo responde a observaciones visuales y de estado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y distribucion, pero se debe atribuir al autor y no usar marcas registradas.
- Caveat para produccion: este modelo es un ejemplo de investigacion y no ha sido validado en entornos industriales. Requiere una evaluacion exhaustiva de seguridad antes de cualquier despliegue real en robotica fisica.
- Dependencia de la plataforma: esta atado al ecosistema LeRobot; su uso fuera de ese framework requiere adaptacion del codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bjahoor/act-lift-cube-franka
- Dataset de entrenamiento: https://huggingface.co/datasets/bjahoor/lift-cube-franka
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
