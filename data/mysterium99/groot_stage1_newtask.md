# mysterium99/groot_stage1_newtask

## Resumen

GR00T N1.7 es un modelo fundacional abierto y cross-embodiment desarrollado por NVIDIA para razonamiento y habilidades en robots humanoides. Este repositorio concreto (`mysterium99/groot_stage1_newtask`) contiene una política entrenada con LeRobot sobre una tarea de manipulación industrial, no el checkpoint fundacional original: se ha ajustado sobre el dataset `manufacturing_task` con 2500 episodios y más de 2,5 millones de frames a 30 FPS. El modelo combina un backbone vision-language Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propriocepción.

La relevancia práctica es doble. Por un lado, demuestra el flujo completo de LeRobot para ajustar un modelo fundacional de robótica a un dominio específico (tornillería y ferretería industrial) con instrucciones en lenguaje natural muy variadas. Por otro, sirve como referencia de despliegue: consume tres cámaras RGB de 480x640, un vector de estado de 6 dimensiones y produce acciones de 6 dimensiones, todo con licencia Apache 2.0 y pesos en safetensors.

El modelo tiene 3.144.016.000 parámetros y un repositorio de 12,6 GB. No se han publicado datos sobre benchmarks ni sobre el rendimiento de la política en el robot real, y el autor no documenta idiomas soportados más allá del inglés de las instrucciones del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone vision-language Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (instrucciones de entrenamiento en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las tres cámaras (`gripper`, `newtop`, `newside`) y las instrucciones en lenguaje natural, y un transformer de acciones que genera trayectorias mediante flow matching condicionado también por el estado de propriocepción de 6 dimensiones. La entrada visual es de 3x480x640 por cámara y la salida es un vector de acción de 6 dimensiones, típico de un brazo manipulador con pinza.

El ajuste se realizó con LeRobot 0.6.1 sobre el dataset `manufacturing_task`: 2500 episodios, 2.593.106 frames a 30 FPS, con 50 instrucciones distintas de manipulación de tornillos, tuercas, arandelas y muelles. La configuración de entrenamiento reportada es de 60.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 42. No se documenta si hubo fases de RLHF, DPO ni el número total de tokens de entrenamiento del backbone.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones multimodales (tres vistas RGB + estado proprioceptivo).
- Comprensión de instrucciones en lenguaje natural para tareas de clasificación y ordenación de hardware (tornillos, tuercas, muelles, arandelas).
- Política cross-embodiment heredada de GR00T: el backbone está diseñado para transferir entre morfologías, aunque este checkpoint está ajustado a un robot tipo `follow` con pinza.
- Ejecución de tareas de pick-and-place, entrega a humano y clasificación por tamaño, material (zinc, galvanizado) y tipo de cabeza (hex, carriage, lag).
- No se documenta soporte de tool calling, agentes multi-paso ni capacidades de audio.
- Capacidad multilingüe: no disponible; las instrucciones del dataset están en inglés.

## Casos de uso

- Clasificación de tornillería en línea de montaje: la política distingue tipos de tornillo (hex, carriage, lag), material (zinc, galvanizado) y longitud, y los coloca en zonas delimitadas o en un cubo, usando las tres cámaras para resolver oclusiones.
- Entrega de piezas a un operario humano: tareas como "Pick up one zinc nut and give to human" o "Take screw from human and put with other screws" permiten integrar el robot en celdas colaborativas donde el humano pasa y recibe componentes.
- Ordenación por tamaño en área delimitada: instrucciones como "Arrange the bolts from shortest to longest in the taped area" requieren estimación de longitud relativa a partir de las vistas RGB, algo que el backbone vision-language facilita.
- Clasificación por acabado superficial: separar hardware zinc de galvanizado exige distinguir texturas metálicas sutiles; el modelo se entrenó específicamente con estas categorías.
- Retirada y limpieza de zona de trabajo: tareas como "Remove all springs from the taped area" o "Remove all hardware from the taped area" sirven para resetear la celda entre lotes.
- Base para ajuste fino en nuevos dominios de ferretería: al ser un checkpoint LeRobot con receta reproducible (60k pasos, AdamW, lr 1e-4), se puede reentrenar con un dataset propio de otra familia de piezas.
- Investigación en imitación cross-embodiment: útil como punto de partida para estudiar transferencia entre robots manipuladores con pinza de 6 DoF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,3 GB solo para pesos (3.144 M parámetros x 2 bytes), más activaciones y buffers de las tres cámaras a 480x640; en la práctica se recomienda un mínimo de 12-16 GB de VRAM.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) como opción de estación de trabajo.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y potencialmente en RTX 4080 (16 GB) con batch size 1. En GPUs de 8 GB no se recomienda sin cuantización, que no está publicada.
- Opciones de despliegue: el flujo documentado es `lerobot-rollout` con `--strategy.type=base` y `--robot.type=follow`; no se documenta soporte de vLLM, TGI, llama.cpp ni Ollama para este checkpoint.
- Latencia y throughput: no disponibles. La política debe ejecutarse a 30 FPS para igualar la frecuencia del dataset, pero no se reportan medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot_stage1_newtask (este) | 3.144 M | no disponible | VLA + flow matching, ajustado a ferretería | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 (NVIDIA, base) | no disponible | no disponible | VLA fundacional cross-embodiment | no disponible en la informacion | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot tipo ACT/diffusion | típicamente <100 M | no disponible | Imitación específica por tarea | Apache 2.0 (segun repo) | Hugging Face, amplia adopción |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de validación por terceros ni de resultados en robot real.
- Es un checkpoint ajustado a un robot concreto (`follow`) y a un layout de cámaras concreto (`gripper`, `newtop`, `newside`); cambiar la configuración física invalida la política.
- El dominio es estrecho: 50 instrucciones sobre tornillería y ferretería; fuera de ese vocabulario y de esas piezas el comportamiento no está garantizado.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas ante oclusiones o piezas no vistas.
- No hay información sobre sesgos, idiomas soportados ni robustez ante cambios de iluminación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documenta el origen completo de los datos de entrenamiento.
- El dataset `manufacturing_task` aparece enlazado como `huggingface.co/datasets/manufacturing_task`, una ruta que no corresponde a un repositorio válido de Hugging Face; conviene verificar su disponibilidad real antes de reentrenar.
- No se publican métricas de éxito, tasas de agarre ni curvas de entrenamiento, por lo que no es posible evaluar la calidad del ajuste sin probarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/groot_stage1_newtask
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_task
