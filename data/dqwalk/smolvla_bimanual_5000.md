# DQwalk/smolvla_bimanual_5000

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores directamente a partir de observaciones visuales y estado propioceptivo. Este repositorio concreto, `DQwalk/smolvla_bimanual_5000`, es un fine-tuning de `lerobot/smolvla_base` para una tarea específica de manipulación bimanual: transferencia de bloques entre dos brazos robóticos (giver y receiver) sobre una mesa.

El modelo consume tres cámaras RGB (una por brazo más una cenital), el estado articular de 12 dimensiones y produce acciones de 12 dimensiones a 15 FPS. Con 450 millones de parámetros y licencia Apache 2.0, está pensado para desplegarse en hardware de consumo, lo que lo convierte en una opción accesible para investigación en imitación robótica sin necesidad de clústeres de GPU.

La relevancia de este checkpoint es acotada: se trata de una política entrenada con solo 20 episodios y 8.675 frames sobre una tarea concreta, sin resultados de evaluación publicados. Es útil como referencia de fine-tuning bimanual con SmolVLA y como punto de partida reproducible, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer con encoder visual y decoder de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación por paso, no modelo conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: no genera lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual preentrenado con un modelo de lenguaje pequeño y un cabezal de acciones, siguiendo el paradigma de los modelos visión-lenguaje-acción. El modelo base `lerobot/smolvla_base` se preentrena sobre datos heterogéneos de robótica y después se afina por imitación supervisada sobre el dataset objetivo. En este caso, el fine-tuning se realizó durante 5.000 pasos con batch size 1, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.7.0.

El dataset de entrenamiento, `local/block_handover_20_correct_ports`, contiene 20 episodios y 8.675 frames a 15 FPS, con dos tareas: recoger un bloque rojo o azul con el brazo giver, pasarlo al brazo receiver y depositarlo en la mesa. La entrada incluye `observation.state` de forma (12,), tres imágenes de (3, 480, 640) —`left_giver_arm`, `overhead`, `right_receiver_arm`— y la salida es un vector `action` de (12,). No se documenta uso de RLHF, DPO ni decodificación especulativa; es imitación conductual pura sobre el dataset local.

## Capacidades

- Control robótico bimanual: genera acciones de 12 dimensiones para un robot `bi_so_follower` con dos brazos.
- Percepción visual multi-cámara: integra tres vistas RGB simultáneas (giver, cenital, receiver) a 480x640.
- Ejecución de tareas de manipulación específicas: recogida, transferencia entre brazos y colocación de bloques rojo y azul.
- Condicionamiento por instrucción en lenguaje natural: acepta un string de tarea (`--task`) que selecciona el objetivo (bloque rojo o azul).
- Inferencia en tiempo real a 15 FPS sobre hardware de consumo.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es una política de imitación, no un LLM.
- Capacidades multilingües: no aplica, el modelo no procesa ni genera lenguaje natural como salida.

## Casos de uso

- Investigación en imitación bimanual: sirve como referencia reproducible de fine-tuning de SmolVLA sobre una tarea de handover; el dataset y la configuración están documentados, lo que permite replicar el entrenamiento.
- Prototipado de políticas de manipulación en laboratorio: con 450M de parámetros y despliegue en consumer GPU, un grupo puede validar pipelines de LeRobot sin infraestructura dedicada.
- Benchmark interno de coordinación entre brazos: la tarea de transferencia giver-receiver exige sincronización temporal; el modelo sirve para medir latencia y estabilidad del control bimanual.
- Base para fine-tuning en tareas de pick-and-place: al partir de `smolvla_base`, puede reentrenarse con nuevos datasets de bloques u objetos similares usando `lerobot-train`.
- Docencia en robótica de aprendizaje: ejemplo completo de dataset, configuración y comando de rollout (`lerobot-rollout`) para cursos prácticos.
- Evaluación de robustez visual: al depender de tres cámaras, permite estudiar cómo afectan cambios de iluminación, oclusión o posición de cámara al éxito de la política (aunque no hay métricas publicadas).
- Integración en pipelines de investigación comparativa: como checkpoint Apache 2.0, puede incluirse en estudios que comparen políticas VLA compactas frente a alternativas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet». No hay tasas de éxito, latencias medidas ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M de parámetros en fp32 el peso ronda 1,8 GB, y en fp16/bf16 aproximadamente 0,9 GB, más overhead de las tres cámaras y buffers de inferencia.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, RTX 3090 o incluso GPUs consumer de gama media con 8 GB o más deberían ser suficientes para inferencia.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU con 8 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot), con robot `bi_so_follower` y cámaras OpenCV; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: el dataset se grabó a 15 FPS y el modelo está pensado para control en tiempo real, pero no se publican cifras de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DQwalk/smolvla_bimanual_5000 | 450M | 3 cámaras 480x640 + estado (12,) | Handover bimanual de bloques | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible | multimodal VLA | Base generalista para fine-tuning | no disponible en la información | Hugging Face (modelo base) |
| Otras políticas VLA compactas (p. ej. variantes de OpenVLA) | no disponible | no disponible | Manipulación generalista | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para este checkpoint y la información proporcionada no incluye métricas de modelos comparables.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real; el rendimiento es desconocido.
- Dataset muy pequeño: 20 episodios y 8.675 frames limitan la generalización; probable sobreajuste a posiciones, iluminación y objetos del dataset original.
- Tarea restringida: solo maneja bloques rojo y azul con el robot `bi_so_follower` y la configuración de cámaras exacta (`left_giver_arm`, `overhead`, `right_receiver_arm`); cambiar nombres o disposición de cámaras rompe la inferencia.
- Dependencia de hardware específico: requiere el robot bimanual y el montaje de cámaras documentados; no es portable a otros manipuladores sin reentrenamiento.
- Sin capacidades de lenguaje: no genera texto ni razona; el string de tarea solo condiciona la política.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; en producción robótica debe validarse con protocolos de seguridad propios.
- Sesgos: no documentados; cabe esperar sesgo hacia las condiciones del dataset (colores, posiciones, fondo de mesa).
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DQwalk/smolvla_bimanual_5000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv 2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/local/block_handover_20_correct_ports
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/block_handover_20_correct_ports
