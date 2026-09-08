# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20

## Resumen

El modelo `castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20` es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por Nicolas Castanet dentro del framework LeRobot de Hugging Face. En lugar de predecir un único paso de acción, el modelo genera un bloque de 20 acciones futuras a partir de observaciones visuales y del estado del robot. Está entrenado para una tarea concreta de ensamblaje: recoger una tuerca cuadrada y encajarla en un poste cuadrado, usando un brazo UR5e equipado con dos cámaras.

La arquitectura es un transformer que integra información multimodal: el estado articular del robot (9 valores) y dos imágenes RGB de resolución 256x256. El modelo tiene 51.590.791 parámetros, un tamaño reducido que permite ejecutarlo en GPUs de consumo, y se distribuye como pesos `safetensors` bajo licencia Apache-2.0. Es relevante para investigadores y desarrolladores que trabajan con LeRobot, ya que ofrece una política entrenada y lista para usar en un robot real o como base para fine-tuning en tareas similares de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer para prediccion de acciones |
| Parametros totales | 51.590.791 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de politica robotica, no de lenguaje) |
| Tipos de cuantizacion | No se proporcionan modelos cuantizados |
| Idiomas soportados | No aplica (modelo de robotica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), metodo presentado en el paper arXiv:2304.13705, que predice secuencias de acciones de longitud fija en lugar de pasos individuales. La politica consume un vector de estado de 9 dimensiones y dos imagenes de 256x256 píxeles, y genera una accion de 7 dimensiones (probablemente posicion y orientacion del efector final). El chunk de acciones tiene una longitud de 20 pasos, lo que permite una ejecucion mas suave y reduce el error de acumulacion tipico en modelos de control paso a paso.

El entrenamiento se realizo con el dataset `castanetnicolas/UR5e_nut_assembly_square`, compuesto por 100 episodios de teleoperacion, con un total de 20.211 frames a 20 FPS. La tarea registrada consiste en "Pick up the square nut and fit it onto the square peg". La configuracion de entrenamiento incluye 100.000 pasos, un batch size de 64, optimizador AdamW con learning rate 1e-5, semilla 1000 y la version 0.6.1 de LeRobot. No se menciona el uso de RLHF ni tecnicas de optimizacion posteriores; el modelo es un resultado de aprendizaje por imitacion.

## Capacidades

- Generacion de acciones de control (7 dimensiones) para un brazo robotic UR5e, prediciendo bloques de 20 pasos consecutivos.
- Entrada multimodal que combina el estado del robot (9 valores) con imagenes RGB de dos camaras.
- Aprendizaje por imitacion de una tarea de ensamblaje: recoger una tuerca cuadrada e insertarla en un poste cuadrado.
- Compatible con el ecosistema LeRobot, incluyendo el comando `lerobot-rollout` para ejecutar la politica en un robot real.
- Entrenado con datos de teleoperacion, por lo que hereda la estrategia de control del operador humano.
- No es un modelo de lenguaje: no soporta tool calling, agentes conversacionales ni generacion de texto.

## Casos de uso

- Automatizacion de ensamblaje industrial: la tarea de insertar una pieza con forma especifica es tipica en celdas de montaje. El modelo puede ejecutarse en un UR5e para realizar la operacion de encaje de forma autonoma tras una breve validacion.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo concreto y reproducible dentro de LeRobot para estudiar el metodo ACT sobre un dataset real de manipulacion.
- Prototipado de politicas roboticas: mediante `lerobot-rollout` se puede probar rapidamente en un brazo real, lo que facilita iteraciones de diseno antes de integrar el modelo en produccion.
- Base para fine-tuning en tareas de pick-and-place: el modelo puede adaptarse a nuevas tareas de manipulacion con pocos datos si se mantienen las mismas camaras y la configuracion del robot.
- Demostraciones educativas y laboratorios de robotica: permite ilustrar el flujo completo de entrenamiento e inferencia de una politica visual con LeRobot, desde la captura de datos hasta la ejecucion en hardware.
- Evaluacion de parametros de chunking: al publicarse una configuracion con chunk de 20 acciones, puede servir para comparar el rendimiento frente a otros chunk sizes en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se proporcionan resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada: los pesos del modelo ocupan aproximadamente 206 MB en FP32 (51.590.791 × 4 bytes). En la practica, la inferencia requiere adicionalmente memoria para el procesamiento de las dos imagenes de 256x256, por lo que se estima un minimo de 4 GB de VRAM para un funcionamiento comodo.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4-6 GB de VRAM, como una RTX 3060, RTX 4090, A100 o similares. No se requiere hardware de gama alta dado el tamano del modelo.
- Compatibilidad con GPUs de consumo: si, el modelo es lo suficientemente pequeno como para ejecutarse en GPUs de escritorio.
- Opciones de despliegue: se integra con LeRobot mediante `lerobot-rollout` o directamente como objeto de politica en Python desde la libreria `lerobot`. No aplican motores de inferencia para LLM como vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20 | 51.590.791 | No aplica | Apache-2.0 | HuggingFace |
| castanetnicolas/act_ur5e_pick_place | No disponible | No aplica | Apache-2.0 | HuggingFace |
| ACT original (paper 2304.13705) | No aplica (metodo) | No aplica | No aplica | Paper academico |

El modelo comparado `act_ur5e_pick_place` es otro modelo ACT del mismo autor, entrenado para una tarea de recoger y colocar. No se dispone en la informacion proporcionada de datos como el numero de parametros o la configuracion exacta, pero comparte arquitectura y ecosistema LeRobot.

## Limitaciones y advertencias

- Es un modelo de politica especifica: solo ha sido entrenado para la tarea de insertar una tuerca cuadrada en un poste cuadrado. No generaliza a otras tareas sin reentrenamiento.
- Depende de la configuracion sensorial: los cambios en la posicion de las camaras, iluminacion, calibracion del robot o la disposicion de los objetos pueden degradar notablemente el rendimiento.
- Se desconoce la tasa de exito real: la model card no incluye resultados de evaluacion en robot, por lo que no hay evidencia cuantitativa de su fiabilidad en produccion.
- Es un modelo de imitacion: puede heredar los sesgos del operador humano que demostro la tarea y fallar en situaciones fuera de la distribucion de los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el dataset asociado puede tener condiciones propias que deben verificarse antes de un despliegue productivo.
- No aplican tecnicas de alineacion como RLHF o DPO, por lo que la politica refleja unicamente los datos de teleoperacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_nut_assembly_square
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Perfil del autor en HuggingFace: https://huggingface.co/castanetnicolas
- Modelo relacionado del mismo autor: https://huggingface.co/castanetnicolas/act_ur5e_pick_place
