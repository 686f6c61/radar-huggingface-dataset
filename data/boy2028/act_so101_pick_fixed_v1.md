# boy2028/act_so101_pick_fixed_v1

## Resumen

`boy2028/act_so101_pick_fixed_v1` es una política robótica entrenada con el método ACT (Action Chunking with Transformers), publicado en el paper [arXiv:2304.13705](https://huggingface.co/papers/2304.13705). El modelo ha sido desarrollado y publicado por el usuario `boy2028` utilizando el framework LeRobot de Hugging Face, y está orientado a la ejecución de la tarea de manipulación «pick up the object» sobre un robot de tipo SO-100 (SO-ARM100), concretamente el brazo `so_follower`.

El modelo resuelve el problema del control robótico por imitación: aprende a generar secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot, en lugar de predecir un único paso. La arquitectura se basa en un transformer con codificador de visión y una variante CVAE (conditional variational autoencoder) que produce acciones suaves y consistentes. Con aproximadamente 51,7 millones de parámetros y un peso de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware de gama media.

Su relevancia actual reside en la democratización del aprendizaje por imitación en robótica: cualquier investigador o desarrollador puede descargar la política desde el Hub de Hugging Face, cargarla en un brazo SO-101 y ejecutarla en minutos con las herramientas de LeRobot. Aunque no se han publicado resultados de evaluación, su estructura y metodología siguen las mejores prácticas del ecosistema LeRobot, lo que lo convierte en un punto de partida útil para prototipado y experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; modelo robótico de estado y visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de control robótico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice bloques de acciones de longitud fija en lugar de acciones individuales. La arquitectura combina un transformer con un encoder visual (que procesa imágenes de la cámara `overhead` de 480x640 píxeles) y un estado del robot de 6 dimensiones (`observation.state`), junto con una variación condicional autoencoder (CVAE) que introduce estocasticidad para generar acciones diversas y suaves. La salida es un chunk de acciones de 6 dimensiones que el robot ejecuta de forma secuencial.

El modelo se entrenó con el framework LeRobot (versión 0.6.2) sobre el dataset `boy2028/so101_pick_fixed_v1`, que contiene 26 episodios teleoperados y 7.949 fotogramas a 20 FPS, para la tarea «pick up the object». La configuración de entrenamiento incluye 5.000 pasos, batch size de 32, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se indica explícitamente el uso de RLHF o DPO, y el método se basa en imitación directa (behavioral cloning) con el enfoque ACT.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de recogida de objetos («pick up the object») sobre un brazo SO-101.
- Visión por computador embebida: procesa imágenes de una cámara cenital (`overhead`) de 480×640 píxeles para percibir el entorno.
- Aprendizaje por imitación: la política aprende de demostraciones teleoperadas y generaliza a situaciones similares.
- Generación de acciones de 6 grados de libertad (posición y orientación del efector) a partir del estado del robot.
- Compatibilidad con LeRobot: puede ejecutarse mediante `lerobot-rollout` y entrenarse con `lerobot-train`.
- Sin capacidades de lenguaje natural, tool calling ni razonamiento simbólico; es un modelo específico para control de robots.

## Casos de uso

- **Manipulación robótica en laboratorio**: el modelo puede integrarse en un brazo SO-101 para realizar tareas de pick-and-place en entornos de investigación, aprovechando su capacidad de ejecutar la tarea «pick up the object» con una cámara cenital.
- **Automatización de tareas repetitivas**: en entornos de producción ligera, la política puede gestionar la recogida y colocación de piezas en posiciones fijas, reduciendo la intervención humana.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para comparar métodos de ACT con otras arquitecturas (por ejemplo, diffusion policies) en el mismo robot y dataset.
- **Educación y demostración en robótica**: es un ejemplo práctico para enseñar a estudiantes el flujo completo de LeRobot: recopilación de datos, entrenamiento y despliegue en hardware real.
- **Prototipado rápido de políticas**: dado que el modelo es pequeño (51,7 M parámetros) y se entrena en 5.000 pasos, es adecuado para experimentos rápidos de iteración sobre nuevas tareas o variaciones de la configuración de la cámara.
- **Benchmarking de robustez**: al estar disponible públicamente con su dataset asociado, permite evaluar la robustez de la política ante cambios de iluminación, posición de objetos o variaciones del robot.

## Benchmarks y rendimiento

No se han publicado resultados de evaluación en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en el robot real para esta política («No evaluation results have been provided for this policy yet»). Por tanto, no es posible comparar cuantitativamente el rendimiento con otros modelos sin datos adicionales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial, pero dado el tamaño de 51,7 M de parámetros, la inferencia con PyTorch puede caber en una GPU con 4-6 GB de VRAM (por ejemplo, RTX 3060 o superior) usando precisión FP32 o FP16.
- **GPU recomendadas para entrenamiento**: LeRobot requiere CUDA para el entrenamiento; una GPU con al menos 8-12 GB de VRAM (RTX 3060, RTX 3070, RTX 4070, A2000) es suficiente para este modelo con batch size 32 y 5.000 pasos.
- **CPU**: posible inferencia en CPU con latencia alta (no recomendado para control en tiempo real).
- **Opciones de despliegue**: compatible con `lerobot-rollout` (vía CLI), y se puede integrar en scripts de Python usando la API de LeRobot. No está disponible en vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible; depende del hardware y de la configuración de la cámara. En el rollout por defecto se ejecuta a 20 FPS (frecuencia de los datos de entrenamiento).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `boy2028/act_so101_pick_fixed_v1` (este) | 51,7 M | No aplica (visión + estado) | Pick up object | apache-2.0 | Hugging Face |
| `murv2026/so101_pick_act_v1` | no disponible | no disponible | Pick up object (SO-101) | no disponible | Hugging Face |
| `liw1/act_so101_L3_bimanual_stack_school_v1` | no disponible | no disponible | Stack de objetos bimanual | no disponible | Hugging Face |

Los tres modelos pertenecen al mismo ecosistema LeRobot y usan la arquitectura ACT sobre el robot SO-101, pero no se dispone de datos de rendimiento ni especificaciones técnicas de los modelos comparados. No es posible realizar una comparativa cuantitativa fiable. No se han encontrado modelos no-robóticos comparables en la misma categoría.

## Limitaciones y advertencias

- **Dataset pequeño**: entrenado con solo 26 episodios y 7.949 fotogramas, lo que aumenta el riesgo de sobreajuste y de bajo rendimiento ante variaciones no vistas en el entrenamiento.
- **Sin resultados de evaluación**: no se han publicado pruebas en robot real; el rendimiento en producción es desconocido.
- **Tarea única**: la política está especializada en «pick up the object»; no es un modelo generalista y no puede adaptarse a otras tareas sin reentrenamiento.
- **Dependencia de la cámara**: usa una única cámara cenital (`overhead`) con resolución fija (480×640); cambios en la posición de la cámara o en la iluminación pueden degradar el rendimiento.
- **Sin capacidades lingüísticas**: no soporta instrucciones en lenguaje natural ni interacción multimodal más allá de la imagen de entrada.
- **Licencia y uso comercial**: la licencia apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del dataset `so101_pick_fixed_v1` y del hardware SO-101.
- **Riesgo de sobreajuste**: la configuración de entrenamiento (5.000 pasos, batch 32) es ligera; puede ser suficiente para el dataset pequeño, pero también puede memorizar las demostraciones en lugar de generalizar.
- **Sesgos de datos**: si los episodios de entrenamiento tienen sesgos (p. ej., objetos siempre en la misma posición), la política heredará esos sesgos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/boy2028/act_so101_pick_fixed_v1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/boy2028/so101_pick_fixed_v1)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Repositorio del robot SO-ARM100](https://github.com/TheRobotStudio/SO-ARM100)
- [Guía de recopilación de datos SO-101](https://www.roboticscenter.ai/en/hardware/so-101/data-collection)
