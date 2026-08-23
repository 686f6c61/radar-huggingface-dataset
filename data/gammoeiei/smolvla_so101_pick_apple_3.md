# GammoEiei/smolvla_so101_pick_apple_3

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para ejecutarse en hardware de consumo. La variante `GammoEiei/smolvla_so101_pick_apple_3` está especializada en la tarea de recoger una manzana (verde o roja) y colocarla en un bol, operando sobre el robot SO-101 (SO-101 follower). Ha sido entrenada con el framework LeRobot mediante aprendizaje por imitación a partir de 94 episodios teleoperados, con un total de 23.917 fotogramas a 10 FPS.

El modelo se basa en la arquitectura SmolVLA, que combina un encoder visual SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que predice acciones de control. Solo se ajustan los parámetros del action expert y las proyecciones (~50M) mientras que el resto permanece congelado. Con 450 millones de parámetros totales, este checkpoint es un fine-tuning del modelo base `lerobot/smolvla_base`, licenciado bajo Apache 2.0, y está pensado para su despliegue directo en el robot SO-101 mediante la librería LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con SigLIP (vision encoder), SmolLM2 (lenguaje) y action expert |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base SmolLM2 tiene contexto de 2K, pero no se especifica para esta variante) |
| Tipos de cuantización | no disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo robótico, no orientado a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que integra tres componentes: un encoder visual SigLIP que procesa las imágenes de las cámaras (lateral y muñeca), un modelo de lenguaje SmolLM2 que interpreta la instrucción en lenguaje natural, y un "action expert" que genera los comandos de control del robot (6 dimensiones: posición/velocidad de la pinza). En este fine-tuning, solo se entrenan las proyecciones y el action expert (aproximadamente 50 millones de parámetros), mientras que el encoder visual y el modelo de lenguaje permanecen congelados. Esta estrategia reduce drásticamente el coste de entrenamiento y permite adaptar el modelo a tareas específicas con pocos datos.

El entrenamiento se realizó con el dataset `GammoEiei/so101_pick_apple`, que contiene 94 episodios de demostraciones teleoperadas (23.917 frames a 10 FPS) de dos tareas: recoger una manzana verde o una roja y depositarla en un bol. La configuración de entrenamiento incluyó 20.000 pasos, batch de 64, optimizador AdamW con learning rate de 0,0001 y semilla 1000, utilizando LeRobot v0.6.2. No se reporta el uso de RLHF ni DPO; el aprendizaje es puramente por imitación (behavior cloning).

## Capacidades

- Generación de acciones de control de robot (6 dimensiones) a partir de observaciones visuales y del estado del robot.
- Procesamiento de dos cámaras simultáneas: cámara lateral (720x1280) y cámara de muñeca (1080x1920).
- Interpretación de instrucciones en lenguaje natural (p. ej., "Pick up the green apple and put it in the bowl") gracias al modelo de lenguaje SmolLM2.
- Realización de tareas de pick-and-place específicas: recoger manzanas verdes o rojas y depositarlas en un bol.
- Ejecución en tiempo real sobre el robot SO-101 mediante el framework LeRobot (rollout).
- No soporta tool calling, agentes ni generación de texto libre: es un modelo puramente de control robótico.

## Casos de uso

- **Manipulación robótica en laboratorios de investigación**: el modelo permite replicar experimentos de pick-and-place en robots SO-101 sin necesidad de programar trayectorias explícitas; basta con proporcionar una instrucción en lenguaje natural y el modelo genera las acciones adecuadas.
- **Automatización de tareas de recogida y colocación en entornos controlados**: por ejemplo, en líneas de montaje o clasificación de piezas pequeñas, el modelo puede manejar objetos de color específico (manzanas verdes/rojas) y depositarlos en contenedores.
- **Prototipado rápido de políticas de imitación**: gracias a su bajo coste de fine-tuning (~50M de parámetros), permite a equipos de investigación experimentar con nuevas tareas de manipulación en pocas horas.
- **Educación y formación en robótica**: sirve como ejemplo práctico de cómo adaptar un VLA preentrenado a una tarea concreta usando LeRobot, ideal para cursos de robótica e IA.
- **Evaluación de generalización de VLA**: al ser un checkpoint público con datos de entrenamiento abiertos, permite comparar el rendimiento de SmolVLA frente a otras arquitecturas (p. ej., ACT) en condiciones reales.
- **Despliegue en hardware de consumo**: al tener 450M de parámetros, puede ejecutarse en GPUs de gama media (p. ej., RTX 3060) con inferencia en tiempo real, lo que facilita su uso en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación del robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no hay datos cuantitativos de tasa de éxito ni comparación con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no especificada por el autor. Con 450M de parámetros en FP32, el modelo ocuparía ~1,8 GB en memoria, pero la inferencia típica de SmolVLA requiere además el procesamiento de imágenes y el modelo de lenguaje, por lo que se recomienda al menos 8 GB de VRAM para ejecución en tiempo real.
- **GPU recomendadas**: RTX 3060 (12 GB) o superior, RTX 4090, A100 (para entrenamiento). Para inferencia en el robot, una GPU con soporte CUDA y al menos 8 GB es suficiente.
- **¿Cabe en consumer GPU?** Sí, es uno de los objetivos de SmolVLA: ejecución en hardware de consumo. No obstante, no se han publicado pruebas específicas para este checkpoint.
- **Opciones de despliegue**: mediante LeRobot (CLI `lerobot-rollout`), con soporte para `cuda`. No se mencionan otros frameworks como vLLM o TGI, ya que no es un modelo de generación de texto.
- **Latencia y throughput**: no disponibles. Depende de la GPU y del número de cámaras activas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GammoEiei/smolvla_so101_pick_apple_3` | 450M | no disponible | Pick-and-place de manzanas en SO-101 | Apache 2.0 | HF Hub |
| `lerobot/smolvla_base` | ~500M | no disponible | VLA base preentrenado (tareas múltiples) | Apache 2.0 | HF Hub |
| `murv2026/so101_pick_smolvla_v1` | 450M (estimado) | no disponible | Pick-and-place de objetos en SO-101 | Apache 2.0 | HF Hub |
| ACT (Action Chunking with Transformers) | ~100M (típico) | no disponible | Imitación robótica (basado en transformers) | MIT | Repos propios |

La comparación con ACT es relevante porque es un método común de aprendizaje por imitación para robots. SmolVLA ofrece la ventaja de incorporar lenguaje natural y visión de forma integrada, mientras que ACT suele ser más ligero pero sin comprensión semántica. Sin embargo, no se dispone de datos de rendimiento comparativo para este checkpoint concreto.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo solo ha sido entrenado para dos tareas concretas (recoger manzana verde o roja y ponerla en un bol). No generaliza a otros objetos, posiciones ni entornos no vistos.
- **Dependencia del robot y cámaras**: las entradas están calibradas para el robot SO-101 y sus cámaras específicas (lateral y muñeca). Cambios de cámara, iluminación o montaje pueden degradar el rendimiento.
- **Riesgo de sobreajuste**: con solo 94 episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones en la posición inicial de la manzana o del bol.
- **No evalúa**: no hay resultados de evaluación de éxito, por lo que se desconoce su tasa de acierto en condiciones reales.
- **Sin soporte para otros idiomas**: las instrucciones en inglés son las únicas que se han utilizado (aunque el modelo de lenguaje subyacente podría soportar otros, no se ha validado).
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe citar el método y LeRobot según la nota de citación.
- **No es un modelo de lenguaje**: no se debe usar para generación de texto o conversación; es exclusivamente un controlador robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GammoEiei/smolvla_so101_pick_apple_3
- Dataset de entrenamiento: https://huggingface.co/datasets/GammoEiei/so101_pick_apple
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guía de LeRobot: https://huggingface.co/docs/lerobot/index
- Blog de fine-tuning de SmolVLA en SO-101: https://ggando.com/blog/smolvla-so101/
- Repositorio de ejemplo de fine-tuning: https://github.com/GadzhiAskhabaliev/SmolVLA
- LeRobot GitHub: https://github.com/huggingface/lerobot
