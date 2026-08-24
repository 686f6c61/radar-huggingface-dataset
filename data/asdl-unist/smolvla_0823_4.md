# asdl-unist/smolvla_0823_4

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto y eficiente desarrollado por el equipo de Hugging Face LeRobot, diseñado para control robótico por imitación. Este repositorio concreto, `asdl-unist/smolvla_0823_4`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el grupo asdl-unist sobre un dataset propio de manipulación robótica con un robot tipo `so_follower` y dos cámaras (superior y de muñeca). El modelo consume observaciones de estado (6 dimensiones) e imágenes (480x640) y produce acciones de 6 dimensiones, lo que lo hace adecuado para tareas de pick-and-place, apilado y manipulación de objetos.

Con 450 millones de parámetros y un tamaño de repositorio de 1,2 GB, este modelo es lo bastante ligero para ejecutarse en hardware de consumo, lo que lo convierte en una opción atractiva para laboratorios de robótica con recursos limitados. El fine-tuning se realizó con 70 episodios y 23 921 frames a 30 FPS, cubriendo cinco tareas específicas de manipulación. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (detalles en el paper 2506.01844) |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que adapta un modelo de lenguaje y vision preentrenado para generar acciones robóticas a partir de observaciones visuales y comandos en lenguaje natural. El paper original (arXiv:2506.01844) describe una arquitectura compacta y eficiente que reduce el coste computacional frente a VLA masivos como OpenVLA, manteniendo un rendimiento competitivo. Este fine-tuning concreto se entrenó sobre el dataset `asdl-unist/TRAIN_T4_ER_FINAL` con 70 episodios y 23 921 frames, usando el optimizador AdamW con una tasa de aprendizaje de 0,0001, batch size de 16 y 8000 pasos de entrenamiento. El proceso se realizó con la librería LeRobot (versión 0.6.1) y el modelo base `lerobot/smolvla_base`. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado por imitación.

## Capacidades

- Generacion de acciones robóticas de 6 grados de libertad a partir de imagenes (camara superior y de muñeca) y estado del robot.
- Ejecucion de tareas de manipulacion especificas: recoger y colocar objetos, apilar vasos, verter contenido, insertar objetos en contenedores.
- Control en bucle cerrado con frecuencia de 30 FPS (las observaciones se procesan a esa tasa).
- Soporte de lenguaje natural para especificar la tarea (el modelo recibe una descripcion textual de la tarea).
- No incluye capacidades de chat, tool calling ni razonamiento general; es un modelo puramente orientado a politica de control.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo puede ejecutar tareas de pick-and-place con precision, como recoger una zanahoria y ponerla en una cesta, gracias a su entrenamiento en 5 tareas especificas.
- Apilado de objetos: tareas como apilar un vaso de papel sobre otro se benefician de la percepcion visual dual (camara superior y de muñeca) que permite estimar posiciones relativas.
- Verificacion de politicas de imitacion: al ser un fine-tuning pequeno, es util para validar rapidamente el flujo de trabajo de LeRobot antes de escalar a modelos mayores.
- Investigacion en aprendizaje por imitacion: el modelo sirve como punto de partida para estudiar la transferencia entre tareas o la adaptacion a nuevos entornos con pocos datos.
- Despliegue en robots de bajo coste: al requerir solo 450M de parametros, puede ejecutarse en una GPU consumer (por ejemplo, RTX 3060) sin necesidad de hardware de datacenter.
- Benchmarking de VLA en tareas reales: el modelo puede compararse con otros fine-tunes de SmolVLA (como `smolvla_ER_T1` o `smolvla_ER_T2`) para evaluar el efecto de distintos datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica. El paper de SmolVLA reporta resultados en el benchmark SO101, pero no se dispone de datos especificos para este fine-tuning.

## Requisitos de hardware

- VRAM estimada: con 450M de parametros, en FP16 el modelo ocupa aproximadamente 0,9 GB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM. En FP32 ocuparia unos 1,8 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 20xx o superior, GTX 16xx, etc.). Tambien puede ejecutarse en CPU para pruebas lentas.
- Cabe en GPU consumer: si, incluso en tarjetas de gama baja como una GTX 1650 (4 GB).
- Opciones de despliegue: LeRobot (libreria principal), con soporte para rollout en robot real. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible. Depende del hardware y de la resolucion de las imagenes (480x640).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| asdl-unist/smolvla_0823_4 (este) | 450M | no disponible | Apache 2.0 | HuggingFace |
| asdl-unist/smolvla_ER_T1 | 450M (presumiblemente) | no disponible | Apache 2.0 | HuggingFace |
| asdl-unist/smolvla_ER_T2 | 450M (presumiblemente) | no disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | no disponible | Apache 2.0 | HuggingFace |

Los tres fine-tunes del mismo autor comparten la misma arquitectura base y se diferencian en el dataset de entrenamiento. El modelo base `lerobot/smolvla_base` es el punto de partida comun. No se dispone de comparativas con otros VLA como OpenVLA (que tiene 7B de parametros) en terminos de rendimiento, pero SmolVLA esta disenado para ser mucho mas ligero.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (70 episodios, 5 tareas), lo que puede provocar overfitting y baja generalizacion a nuevas tareas o entornos.
- No se han publicado resultados de evaluacion en robot real, por lo que el rendimiento real es desconocido.
- Las tareas estan muy especificadas (por ejemplo, "coger la zanahoria y ponerla en la cesta"); el modelo puede fallar si los objetos o la disposicion cambian significativamente.
- Dependencia de las camaras configuradas (top y wrist); si se usan otras camaras o posiciones, el modelo no funcionara correctamente.
- No es un modelo de lenguaje general; no puede mantener conversaciones ni responder preguntas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin soporte oficial.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento academico sin validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/asdl-unist/smolvla_0823_4
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/asdl-unist/TRAIN_T4_ER_FINAL
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Guia de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Otros fine-tunes del autor: https://huggingface.co/asdl-unist/smolvla_ER_T1 y https://huggingface.co/asdl-unist/smolvla_ER_T2
