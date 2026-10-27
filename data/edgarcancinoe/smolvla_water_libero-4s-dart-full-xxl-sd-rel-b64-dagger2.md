# edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger2

## Resumen

SmolVLA water_libero-4s-dart-full-xxl-sd-rel-b64-dagger2 es un fine-tune del modelo visión-lenguaje-acción (VLA) SmolVLA, publicado por el usuario edgarcancinoe sobre el checkpoint base lerobot/smolvla_base. Se trata de una política robótica de imitación entrenada con LeRobot para una tarea concreta de manipulación: regar una de tres plantas ("Water the left plant", "Water the middle plant", "Water the right plant") con un brazo Franka Panda y dos cámaras RGB.

El modelo resuelve el problema de mapear observaciones multimodales (dos imágenes de 256x256 y un vector de estado de 8 dimensiones) y una instrucción en lenguaje natural a un vector de acción de 7 dimensiones, a 20 FPS. Con 604.934.176 parámetros (~605 M) y 1,2 GB de pesos en safetensors, es lo bastante compacto como para ejecutarse en hardware de consumo, lo que encaja con la propuesta de SmolVLA recogida en el paper arXiv:2506.01844.

Es relevante ahora porque ejemplifica el flujo de trabajo actual de robótica open source: fine-tuning de un VLA preentrenado con un dataset propio recogido vía DAgger (559 episodios, 142.817 frames) y publicación del checkpoint con licencia Apache-2.0. Conviene señalar que el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) compacta, SmolVLA; el detalle interno del backbone no se especifica en la información disponible |
| Parámetros totales | 604.934.176 (~605 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset están en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es una política SmolVLA, es decir, un VLA compacto que consume observaciones visuales y de estado junto con una instrucción textual y emite acciones motoras. La model card confirma las entradas: `observation.images.image` y `observation.images.image2` con forma (3, 256, 256), más `observation.state` con forma (8,), y una salida `action` con forma (7,). El robot objetivo es un `panda` con dos cámaras. Los detalles del backbone de visión-lenguaje y del mecanismo de generación de acciones se remiten al paper arXiv:2506.01844 y no se detallan en la información proporcionada.

El entrenamiento es un fine-tune desde `lerobot/smolvla_base` con LeRobot 0.6.1: 8.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset `edgarcancinoe/water_pour_dagger2` contiene 559 episodios y 142.817 frames a 20 FPS, recogidos con una estrategia de agregación de datos tipo DAgger (el sufijo `dagger2` sugiere una segunda iteración). No se documentan composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de SmolVLA.

## Capacidades

- Generación de acciones de manipulación de 7 grados de libertad a partir de dos vistas RGB y el estado del robot.
- Condicionamiento por instrucción en lenguaje natural entre tres tareas de riego: planta izquierda, central y derecha.
- Política de imitación entrenada con datos de demostración y agregación DAgger, orientada a ejecución continua a 20 FPS.
- Percepción visual estéreo mediante dos cámaras de 256x256 píxeles.
- Integración nativa con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo "thinking"; es un modelo de acción robótica, no un LLM conversacional.

## Casos de uso

- Riego automatizado de plantas en laboratorio: la política ejecuta la tarea "Water the left/middle/right plant" sobre un Panda con dos cámaras, permitiendo demostraciones reproducibles de manipulación con líquidos.
- Baseline de investigación en imitación visual: sirve como punto de comparación para estudiar generalización de VLAs compactos frente a ACT o Diffusion Policy en una tarea de contacto y vertido.
- Reentrenamiento iterativo con DAgger: el checkpoint puede usarse para generar nuevas trayectorias, corregirlas y alimentar una tercera iteración del dataset `water_pour_dagger2`.
- Fine-tuning sobre nuevas tareas de manipulación: al partir de `lerobot/smolvla_base` y ocupar 1,2 GB, es viable adaptarlo con un único GPU de consumo siguiendo el comando `lerobot-train` documentado.
- Prototipado y docencia en robótica: permite montar una demo completa de política VLA en hardware asequible, con inferencia en tiempo real a 20 FPS si la latencia del modelo lo permite.
- Validación de pipelines de datos y calibración: útil para comprobar el emparejamiento de nombres de cámara, índices y claves de observación antes de escalar a datasets mayores.
- Evaluación interna de robustez: al no haber métricas publicadas, un laboratorio puede medir tasas de éxito propias por tarea, posición de planta e iluminación antes de considerar su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la nota "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito en robot real ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 2,4 GB solo para pesos; en bf16/fp16, unos 1,2 GB. Hay que sumar activaciones y buffers de las dos imágenes de 256x256, por lo que un presupuesto práctico de 4-6 GB es razonable.
- GPU recomendadas: cualquier GPU con al menos 8 GB, como RTX 3060, RTX 4060 Ti o RTX 4090. A100 y H100 son innecesarias para este tamaño, aunque válidas para entrenamiento por lotes.
- Cabe en GPU de consumo: sí, con 605 M de parámetros y 1,2 GB de pesos en el repositorio.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) con PyTorch y el stack LeRobot 0.6.1. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp, ni se publican pesos GGUF.
- Latencia y throughput: no disponibles. La frecuencia de operación del dataset es de 20 FPS, pero no se especifica si la política alcanza ese ritmo en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger2 | ~605 M | 2 imágenes 256x256 + estado (8,) | Riego de 3 plantas con Panda | Apache-2.0 | HuggingFace, 0 descargas |
| lerobot/smolvla_base | No disponible | Entradas VLA de SmolVLA | Base preentrenada para fine-tuning | No disponible en la información | HuggingFace (referenciado como base) |
| ACT (Action Chunking Transformer) | No disponible | Solo visión y estado | Imitación general en LeRobot | No disponible en la información | Disponible en el ecosistema LeRobot |
| Diffusion Policy | No disponible | Visión y estado | Imitación general en LeRobot | No disponible en la información | Disponible en el ecosistema LeRobot |

No se dispone de datos verificables de rendimiento, contexto ni parámetros de las alternativas en la información proporcionada, por lo que la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasas de éxito ni pruebas en robot real, lo que impide afirmar que la política funcione de forma fiable.
- Sesgo de dominio: entrenada exclusivamente con 559 episodios de riego de plantas sobre un Panda y dos cámaras concretas; probablemente falle ante cambios de robot, de configuración de cámaras, de iluminación o de posición de los objetos.
- Vocabulario de tareas cerrado: solo se han documentado tres instrucciones ("Water the left/middle/right plant"); el comportamiento ante otras órdenes no está caracterizado.
- Riesgo de sobreajuste a las posiciones y apariencias del dataset, agravado por un entrenamiento de solo 8.000 pasos sobre un dataset relativamente pequeño.
- Dependencia de hardware específico: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento.
- Idiomas no documentados: no se especifica si el condicionamiento textual funciona en castellano; el dataset está en inglés.
- Licencia Apache-2.0, que permite uso comercial, pero sin garantías del autor ni métricas que respalden un despliegue en producción.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no ha pasado por validación de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger2
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour_dagger2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour_dagger2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
