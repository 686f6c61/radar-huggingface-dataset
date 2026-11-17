# ethanCSL/robotwin_handover_block_lerobot_source_and_sim_aug_10

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para controlar robots manipuladores mediante instrucciones en lenguaje natural y observaciones visuales. Este repositorio concreto, publicado por el usuario ethanCSL, es un fine-tuning de `lerobot/smolvla_base` sobre un dataset específico de la tarea de transferencia de un bloque rojo entre dos brazos robóticos (tipo ALOHA). El modelo resuelve el problema de generar trayectorias de acción de 14 dimensiones a partir de tres cámaras y el estado de las articulaciones, sin necesidad de planificación explícita.

Con 450 millones de parámetros, SmolVLA se sitúa en la categoría de modelos ligeros que pueden desplegarse en hardware de consumo, a diferencia de VLA más grandes como OpenVLA (7B) o RT-2 (55B). El contexto de esta ficha es un checkpoint de imitación entrenado durante 20.000 pasos sobre 110 episodios (31.152 frames a 30 FPS), lo que lo convierte en un ejemplo representativo de cómo se especializa un VLA base para una tarea concreta de manipulación bimanual.

La relevancia actual radica en que SmolVLA demuestra que es posible obtener políticas robóticas funcionales con un presupuesto computacional reducido, y este repositorio ilustra el flujo completo de LeRobot: dataset, entrenamiento y despliegue en un robot real. No obstante, al ser un fine-tuning sobre una única tarea, su utilidad fuera de ese dominio es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta; no se detalla la composición interna en la informacion disponible |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | aloha |
| Camaras de entrada | cam_high, cam_left_wrist, cam_right_wrist |
| Entrada de estado | observation.state (6,) |
| Salida de accion | action (14,) |
| Resolucion de imagen | 3 x 256 x 256 por camara |
| Tamano del repositorio | 0.9 GB |
| Modelo base | lerobot/smolvla_base |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones para producir comandos motores directamente a partir de observaciones multimodales. La model card no detalla la composición exacta de los componentes (tipo de vision encoder, backbone de lenguaje o mecanismo de fusión), por lo que esa información se considera no disponible. El modelo está pensado para ser compacto y eficiente, con capacidad de ejecutarse en hardware de consumo según la descripción del paper asociado (arXiv:2506.01844).

Este checkpoint concreto se ha obtenido por fine-tuning de `lerobot/smolvla_base` con LeRobot 0.6.2, usando 20.000 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset de entrenamiento contiene 110 episodios y 31.152 frames a 30 FPS, con varias paráfrasis de la misma instrucción de tarea (recoger el bloque rojo con el brazo izquierdo, pasarlo al derecho y colocarlo en la almohadilla azul). No se especifica si hubo aumento de datos, RLHF o DPO; el nombre del repositorio sugiere una mezcla de datos de fuente real y simulación aumentada, pero la model card no lo confirma explícitamente.

## Capacidades

- Generación de acciones robóticas de 14 dimensiones para un robot bimanual tipo ALOHA a partir de tres cámaras y el estado de las articulaciones.
- Comprensión de instrucciones en lenguaje natural en inglés para guiar la tarea (las variantes de prompt del dataset están en inglés).
- Ejecución de una tarea específica de manipulación: agarre del bloque rojo con el brazo izquierdo, transferencia al brazo derecho y colocación en la almohadilla azul.
- Control visomotor en bucle cerrado: la política consume observaciones visuales en cada paso y emite acciones, lo que permite corrección reactiva.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el entrenamiento se limita a instrucciones en inglés.

## Casos de uso

- Investigación en imitación robótica: servir como punto de partida reproducible para estudiar el fine-tuning de SmolVLA sobre tareas bimanuales concretas, con una configuración de entrenamiento documentada (20.000 pasos, lr 1e-4, batch 32).
- Prototipado de manipulación bimanual en laboratorio: desplegar la política en un robot ALOHA real para validar la transferencia de un objeto entre dos brazos con tres cámaras, usando `lerobot-rollout` con `--strategy.type=base`.
- Generación de datos sintéticos y evaluación de sim-to-real: el nombre del repositorio sugiere entrenamiento con datos de fuente y simulación aumentada; puede usarse para comparar el rendimiento en simulación frente al robot físico.
- Benchmark de políticas VLA compactas: al tener 450 M de parámetros y pesos safetensors de 0.9 GB, es adecuado para comparar latencia y éxito de tarea frente a VLA de mayor tamaño en el mismo hardware.
- Educación y demos de LeRobot: el flujo completo (dataset visualizable, comando de entrenamiento y comando de rollout) lo convierte en un ejemplo didáctico para enseñar el pipeline de LeRobot de extremo a extremo.
- Base para fine-tuning posterior en tareas de pick-and-place: al derivar de `lerobot/smolvla_base`, puede reutilizarse como inicialización para otras tareas de transferencia de objetos con configuraciones de cámara similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación sin datos numéricos (el texto se corta en "count the succ"), por lo que no se reportan tasas de éxito ni métricas de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el coste del codificador visual y las activaciones de tres cámaras a 256x256.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, es plausible su ejecución en GPUs consumer, pero no hay confirmación del autor.
- Cabe en GPU consumer: no confirmado; el paper asociado describe el modelo como desplegable en hardware de consumo, pero no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path`), y entrenamiento con `lerobot-train`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450 M | no disponible | Manipulacion bimanual ALOHA (transferencia de bloque) | apache-2.0 | Hugging Face, via LeRobot |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | Base VLA general para fine-tuning | no disponible en la informacion | Hugging Face |
| OpenVLA | no disponible en la informacion | no disponible | VLA general de manipulacion | no disponible en la informacion | no disponible en la informacion |
| RT-2 | no disponible en la informacion | no disponible | VLA general | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos verificados de parámetros, contexto o rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (transferencia de un bloque rojo entre brazos y colocación en una almohadilla azul); no generaliza a otras tareas sin fine-tuning.
- Dependencia del hardware: requiere un robot ALOHA con tres cámaras configuradas con los nombres `cam_high`, `cam_left_wrist` y `cam_right_wrist`; cualquier cambio en la disposición de cámaras invalida la política.
- Idiomas: las instrucciones de entrenamiento están en inglés; no hay evidencia de soporte en castellano ni en otros idiomas.
- Sesgos: no documentados; al entrenarse sobre un dataset pequeño (110 episodios) y una tarea concreta, puede sobreajustarse a las condiciones visuales y de iluminación del dataset.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones fuera de distribución ante objetos, posiciones o iluminaciones no vistas, sin mecanismo de seguridad explícito.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Sin métricas publicadas: no hay tasas de éxito ni benchmarks que permitan estimar la fiabilidad real del checkpoint.
- Fecha de creación futura (2026-11-16) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/robotwin_handover_block_lerobot_source_and_sim_aug_10
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/robotwin_handover_block_lerobot_source_and_sim_aug_10
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/robotwin_handover_block_lerobot_source_and_sim_aug_10
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
