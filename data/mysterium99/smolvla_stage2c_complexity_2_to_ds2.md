# mysterium99/smolvla_stage2c_complexity_2_to_ds2

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, `mysterium99/smolvla_stage2c_complexity_2_to_ds2`, es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `ds2`, orientado a una tarea específica de manipulación: colocar tuercas en un vaso rojo y tornillos en un cubo azul. El modelo consume tres cámaras (gripper, vista superior y vista lateral) junto con el estado articular de 6 dimensiones, y produce comandos de acción también de 6 dimensiones.

Con 450 millones de parámetros, SmolVLA busca llevar la robótica basada en VLA a hardware de consumo, reduciendo el coste computacional frente a modelos VLA de mayor tamaño. La relevancia de este checkpoint es acotada: se trata de un experimento de fine-tuning (la nomenclatura "stage2c_complexity_2" sugiere una ablación o etapa de un pipeline de entrenamiento) con cero descargas y sin resultados de evaluación publicados, por lo que debe interpretarse como un artefacto de investigación reproducible más que como un modelo listo para producción.

La licencia Apache 2.0 permite uso comercial y modificación, y el formato de pesos es safetensors dentro del framework LeRobot, lo que facilita su despliegue en robots compatibles con dicha librería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; entrada multimodal visión + estado, no texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina percepción visual y comprensión de instrucciones en lenguaje natural para generar acciones motoras. La arquitectura exacta (número de capas, dimensión de los transformers internos, mecanismo de fusión visión-lenguaje) no se detalla en la model card de este checkpoint; la información disponible remite al paper arXiv:2506.01844 para los detalles arquitectónicos. El modelo base `lerobot/smolvla_base` se distribuye como política preentrenada que se fine-tunea por imitación sobre datasets de robótica.

El fine-tuning de este checkpoint se realizó sobre el dataset `ds2`, compuesto por 50 episodios y 110.961 fotogramas a 30 FPS, para la tarea "put nuts in red cup and bolts in blue bucket". La configuración de entrenamiento reportada incluye 20.000 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-4, semilla 0 y LeRobot 0.6.1. No se especifica el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; al tratarse de aprendizaje por imitación (behavior cloning sobre demostraciones), es esperable que no las haya, pero no se confirma explícitamente.

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 6 dimensiones a partir de observaciones visuales y del estado articular.
- Percepción multivista: procesa tres cámaras simultáneas (`gripper`, `newtop`, `newside`) a resolución 256x256.
- Comprensión de instrucciones en lenguaje natural: la tarea se especifica mediante un prompt textual ("put nuts in red cup and bolts in blue bucket").
- Ejecución de tareas de manipulación específicas: clasificación y colocación de piezas (tuercas y tornillos) en contenedores diferenciados.
- Despliegue en hardware de consumo: el modelo está diseñado para funcionar con recursos computacionales reducidos.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, generación de texto libre ni procesamiento de audio.

## Casos de uso

- Automatización de tareas de clasificación de piezas en líneas de montaje: el modelo puede ejecutar la política entrenada para separar tuercas y tornillos en sus contenedores respectivos, usando las tres cámaras para localizar las piezas y el estado articular para planificar el movimiento.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar cómo varía el rendimiento al cambiar la complejidad de la tarea o el dataset de entrenamiento, dado el nombre del checkpoint ("complexity_2").
- Benchmark de referencia para políticas VLA compactas: permite comparar el rendimiento de SmolVLA frente a otras políticas LeRobot en la misma tarea y dataset.
- Prototipado rápido en robótica de escritorio: al caber en hardware de consumo, se puede desplegar en un robot tipo `follow` con cámaras OpenCV para validar pipelines de inferencia en tiempo real.
- Docencia y formación en robótica con IA: el checkpoint y su configuración de entrenamiento (20.000 pasos, batch 8, lr 1e-4) ofrecen un ejemplo completo y de bajo coste para enseñar el ciclo completo de grabación de datos, entrenamiento y despliegue con LeRobot.
- Base para fine-tuning posterior en tareas similares: al derivar de `lerobot/smolvla_base` y estar bajo Apache 2.0, puede reutilizarse como inicialización para nuevas tareas de manipulación con contenedores o piezas pequeñas.
- Validación de infraestructura de despliegue: útil para probar el comando `lerobot-rollout` y la integración con cámaras y puertos de robot antes de invertir en datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 millones de parámetros en safetensors (precisión original presumiblemente fp32 o bf16), el peso de los parámetros ronda 1,8 GB en fp32 o 0,9 GB en bf16; el repo ocupa 0,9 GB, lo que sugiere pesos en bf16/fp16. La VRAM total dependerá del procesamiento de tres imágenes de 256x256 y del resto del pipeline.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar el modelo; el paper de SmolVLA enfatiza el despliegue en hardware de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no hay cifras oficiales de latencia ni throughput.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_2_to_ds2 | 450 M | no disponible | Manipulación robótica (tuercas/tornillos) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | Política VLA base para fine-tuning | Apache 2.0 (según ecosistema LeRobot) | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica | no disponible | Hugging Face / GitHub LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Sobreajuste a la tarea: entrenado exclusivamente para "put nuts in red cup and bolts in blue bucket" sobre 50 episodios; es improbable que generalice a otras tareas, objetos o disposiciones.
- Dependencia de la configuración de cámaras: los nombres y posiciones de cámara (`gripper`, `newtop`, `newside`) deben coincidir exactamente con los del entrenamiento; cambios de iluminación, fondo o montaje pueden degradar el rendimiento.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones incoherentes ante observaciones fuera de distribución, sin mecanismo explícito de seguridad.
- Idiomas: no se documentan capacidades multilingües; la instrucción de tarea está en inglés y el modelo no es un LLM de propósito general.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en entornos físicos requiere medidas de seguridad externas.
- Reproducibilidad limitada: el dataset `ds2` se referencia como `dataset:ds2` sin usuario de Hugging Face, lo que puede dificultar su localización exacta.
- Cero tracción comunitaria (0 descargas, 0 likes): no hay evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_2_to_ds2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset ds2: https://huggingface.co/datasets/ds2
