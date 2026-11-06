# mysterium99/smolvla_stage1b_complexity_4

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `mysterium99/smolvla_stage1b_complexity_4`, es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre el dataset `manufacturing_level_4`, orientado a tareas de manipulación de hardware de ferretería (tornillos, tuercas, arandelas, muelles) en un entorno de fabricación.

El modelo resuelve el problema de mapear observaciones multimodales (tres cámaras RGB de 256x256 y un vector de estado de 6 dimensiones) directamente a comandos de acción de 6 dimensiones, sin necesidad de un pipeline separado de percepción y planificación. Con 450 millones de parámetros y un repositorio de 0,9 GB, está pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y talleres que no disponen de clústeres de GPU dedicados.

La relevancia actual radica en la tendencia hacia modelos VLA pequeños y eficientes que puedan desplegarse en brazos robóticos de bajo coste. Este checkpoint concreto representa un caso de uso muy especializado: un ajuste fino sobre 2.450 episodios y más de 2,4 millones de fotogramas a 30 FPS, con 48 tareas distintas de clasificación y ordenación de piezas metálicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, derivada de SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un modelo VLA compacto que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, entrenado para predecir secuencias de acciones a partir de observaciones multimodales. La entrada consiste en tres imágenes de cámara (`gripper`, `newtop`, `newside`) de 3x256x256 píxeles y un vector de estado de 6 dimensiones; la salida es un vector de acción de 6 dimensiones. El tipo de robot declarado es `follow`.

El ajuste fino se realizó sobre el dataset `manufacturing_level_4`, compuesto por 2.450 episodios y 2.415.518 fotogramas a 30 FPS, con 48 tareas de manipulación de hardware. La configuración de entrenamiento fue de 60.000 pasos, batch size 32, optimizador AdamW con learning rate 1e-4, semilla 0 y LeRobot versión 0.6.1. No se dispone de información sobre la composición exacta del dataset base de SmolVLA, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un brazo robótico tipo `follow` a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres cámaras RGB (gripper, vista superior y vista lateral) a resolución 256x256.
- Ejecución de tareas de clasificación y ordenación de piezas: tornillos, tuercas, arandelas y muelles, con criterios de tamaño, material (zinc, galvanizado), tipo (hex, carriage, lag) y longitud.
- Interacción humano-robot: varias tareas implican recoger una pieza y entregarla a un humano, o recibir una pieza de un humano y colocarla.
- Aprendizaje por imitación: el modelo reproduce políticas demostradas en el dataset, sin necesidad de recompensas explícitas.
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto libre: es un modelo puramente de política robótica.
- Capacidades multilingües: no aplica; las instrucciones de tarea son cadenas de texto en inglés asociadas a episodios de entrenamiento.

## Casos de uso

- Clasificación automatizada de tornillos por longitud: el modelo puede distinguir entre tornillos de 2 y 4 pulgadas y colocarlos en el contenedor correcto, usando las tres vistas de cámara para estimar dimensiones relativas.
- Separación por material (zinc vs. galvanizado): en líneas de montaje donde se mezclan piezas de distintos recubrimientos, el modelo puede agruparlas en zonas delimitadas con cinta adhesiva.
- Entrega de piezas a operarios: tareas como "pick up one zinc nut and give to human" permiten integrar el modelo en estaciones de trabajo colaborativas donde el robot asiste al operario.
- Ordenación por tamaño en áreas delimitadas: colocar arandelas o muelles del más corto al más largo en una zona marcada, útil para kits de montaje.
- Retirada selectiva de piezas: tareas como "Remove all springs from the taped area" o "Remove all hardware from the taped area" permiten limpiar zonas de trabajo de forma autónoma.
- Clasificación por tipo de cabeza: separar tornillos hexagonales, carriage y lag en contenedores distintos, aprovechando la vista de gripper para inspección cercana.
- Emparejamiento de piezas iguales: "place all same sized bolts next to each other" o "Put the two matching shortest hex bolts together" para tareas de verificación de inventario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,8 GB solo para pesos (450M parámetros x 4 bytes), más overhead de activaciones y buffers de imagen; en la práctica se recomienda al menos 4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,9 GB para pesos, con un mínimo práctico de 2-3 GB considerando activaciones.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090); también cabe en GPUs de portátil y en placas integradas con suficiente memoria unificada.
- Cabe en GPU consumer: sí, el tamaño del repositorio (0,9 GB) y el número de parámetros lo permiten en tarjetas de gama media y baja.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), con soporte para el robot tipo `follow` y cámaras OpenCV. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, del número de cámaras y de la frecuencia de control del robot (el dataset se grabó a 30 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smolvla_stage1b_complexity_4 (este) | 450M | no disponible | apache-2.0 | HuggingFace, LeRobot | Ajuste fino especializado en hardware de ferretería |
| lerobot/smolvla_base | no disponible | no disponible | apache-2.0 | HuggingFace, LeRobot | Checkpoint base del que deriva este modelo; propósito general |
| OpenVLA | no disponible | no disponible | no disponible | no disponible | VLA de referencia en la literatura; no se dispone de datos comparativos en la información proporcionada |
| π0 (pi-zero) | no disponible | no disponible | no disponible | no disponible | Modelo VLA de Physical Intelligence; sin datos comparativos disponibles |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado exclusivamente para tareas de manipulación de hardware de ferretería en un entorno concreto; su rendimiento fuera de ese dominio es impredecible.
- Dependencia del entorno de entrenamiento: las tres cámaras (`gripper`, `newtop`, `newside`) y el robot tipo `follow` deben replicar la configuración del dataset; cambios en la iluminación, la disposición de las piezas o la cámara pueden degradar el rendimiento.
- Sin datos de benchmarks: no hay métricas publicadas de éxito en tareas, lo que impide evaluar su robustez de forma objetiva.
- Riesgo de sobreajuste: con 60.000 pasos sobre 2.450 episodios y un modelo de 450M de parámetros, es posible que el modelo memorice configuraciones específicas del dataset.
- Sin capacidades de lenguaje: no puede interpretar instrucciones nuevas en tiempo de inferencia; las tareas están fijadas por el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual puede verse afectado por sesgos en la distribución de las imágenes de entrenamiento (colores, materiales, posiciones).
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad; úsese con cautela en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mysterium99/smolvla_stage1b_complexity_4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_level_4
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_level_4
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
