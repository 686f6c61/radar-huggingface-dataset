# junshin02/smolvla_so101_v2trim_ee_cc

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, con 450 millones de parámetros, diseñado para desplegarse en hardware de consumo. Este repositorio contiene un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario junshin02 para controlar un robot tipo SO-101 en una tarea específica de pick-and-place: recoger un cubo verde y colocarlo en una caja. El modelo se ha entrenado con el framework LeRobot sobre un dataset propio de 50 episodios y 23 985 fotogramas, y está pensado para ejecutarse en tiempo real sobre el robot.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede adaptarse a una tarea robótica concreta mediante fine-tuning, manteniendo un coste computacional bajo y siendo accesible para desarrolladores e investigadores sin infraestructura de servidores. Al estar licenciado bajo Apache 2.0 y publicarse con pesos en formato safetensors, es totalmente reproducible y modificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (detalles internos no disponibles) |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que toma como entrada múltiples vistas de cámara (tres cámaras en este fine-tuning, con resolucion de 256x256), el estado del robot (vector de 6 dimensiones) y una instruccion en lenguaje natural, y genera una accion de 10 dimensiones. La arquitectura interna combina un codificador visual, un modelo de lenguaje y un "action expert" que condiciona la generacion de acciones, aunque los detalles concretos de la implementacion no se especifican en la informacion disponible.

El fine-tuning se realizo sobre el modelo base `lerobot/smolvla_base` con el framework LeRobot version 0.6.0. Se utilizaron 50 episodios del dataset `junshin02/so101_pickplace_v2trim_ee_cc`, que contiene 23 985 fotogramas a 30 FPS, con la tarea unica "Pick up the green cube and place it in the box". La configuracion de entrenamiento fue de 45 000 pasos, batch size 16, optimizador AdamW, learning rate 0.0001 y semilla 1000. No se menciona el uso de tecnicas como RLHF o DPO; se trata de un fine-tuning supervisado de imitacion.

## Capacidades

- Control de robot SO-101: genera acciones de 10 dimensiones (posiciones articulares o comandos de efector final) a partir de observaciones visuales y de estado.
- Procesamiento de multiples vistas de camara: acepta tres imagenes simultaneas (frontal, muneca y una tercera) a resolucion 256x256.
- Ejecucion de tareas de pick-and-place: entrenado especificamente para recoger un cubo verde y colocarlo en una caja.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI como `lerobot-rollout` y `lerobot-train`.
- Inferencia en tiempo real: al ser un modelo de 450M parametros, puede ejecutarse en GPUs de consumo, aunque no se especifican metricas de latencia.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ambito de la tarea robotica.

## Casos de uso

- Automatizacion de tareas de manipulacion en laboratorio: el modelo puede controlar un robot SO-101 para realizar tareas repetitivas de recoger y colocar objetos, reduciendo la intervencion humana en entornos controlados.
- Prototipado rapido de politicas roboticas: gracias a su integracion con LeRobot, los desarrolladores pueden clonar este repositorio, adaptarlo a nuevas tareas con datasets propios y desplegarlo en minutos.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como un VLA compacto se comporta en tareas de manipulacion, comparando con modelos mas grandes.
- Educacion en robotica: al ser de tamano reducido y licencia permisiva, es adecuado para cursos y talleres donde se ensena a entrenar y desplegar politicas de control.
- Evaluacion de generalizacion: permite probar la robustez del modelo ante variaciones de iluminacion, posicion de objetos o distracciones, ya que fue entrenado con un dataset limitado.
- Despliegue en robots de bajo coste: el modelo cabe en GPUs de gama media, lo que posibilita su uso en robots SO-101 economicos sin necesidad de servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas de exito, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de 450M parametros, se estima que puede caber en GPUs con 8-12 GB de VRAM en precision FP16 o BF16.
- GPUs recomendadas: no se especifican, pero por el tamano del modelo, una RTX 3060/4060 o superior seria suficiente para inferencia.
- Compatibilidad con hardware de consumo: si, SmolVLA esta disenado para ello, aunque no se detallan requisitos minimos.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). Tambien es posible exportar a otros formatos si se desea, aunque no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos VLA como OpenVLA, RT-2 o LLaRA. El modelo base SmolVLA se posiciona como una alternativa compacta a modelos mas grandes, pero no hay datos de rendimiento relativos en este repositorio. Se recomienda consultar el paper de SmolVLA (arxiv 2506.01844) para comparaciones con otros enfoques.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para una unica tarea (recoger cubo verde y colocarlo en caja) con un robot SO-101 especifico. No generaliza a otras tareas u objetos sin reentrenamiento.
- Dataset limitado: solo 50 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones del entorno (iluminacion, posicion de camaras, distracciones).
- Sin evaluacion en robot real: no se han reportado resultados de exito en despliegue fisico, por lo que el rendimiento real es desconocido.
- Dependencia de la configuracion de camaras: las tres camaras deben coincidir con las utilizadas durante el entrenamiento; cambios en la disposicion o calibracion degradaran el rendimiento.
- Riesgo de alucinacion en instrucciones: aunque no es un modelo de chat, podria generar acciones incorrectas si la instruccion se aleja de la tarea entrenada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset asociado deben cumplir sus propias licencias (el dataset es de junshin02, sin licencia explicita en la informacion disponible).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/junshin02/smolvla_so101_v2trim_ee_cc
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/junshin02/so101_pickplace_v2trim_ee_cc
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=junshin02/so101_pickplace_v2trim_ee_cc
