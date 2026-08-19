# 1ys1/areumii-smolvla-pickplace-v1

## Resumen

El modelo `1ys1/areumii-smolvla-pickplace-v1` es un fine-tuning del modelo base `lerobot/smolvla_base` (SmolVLA), un modelo de visión-lenguaje-acción (VLA) compacto y eficiente diseñado para robótica. Ha sido entrenado por el usuario `1ys1` con el framework LeRobot para ejecutar una tarea concreta de pick-and-place sobre un robot de tipo `areumii_c1`, usando tres cámaras (frontal y dos muñecas). El modelo consume observaciones de estado y tres imágenes RGB de 256x256 píxeles y produce una acción de 16 dimensiones, lo que permite controlar el robot en tiempo real.

Este modelo es relevante porque demuestra cómo un VLA pequeño (450 millones de parámetros) puede ser ajustado con un dataset reducido (50 episodios, 3769 frames) para una tarea específica, manteniendo la viabilidad de despliegue en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial y académico, y la integración con LeRobot simplifica el entrenamiento y la ejecución en robots reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica directamente; el modelo procesa imágenes y estado, no texto) |
| Tipos de cuantizacion | no disponible (solo se proporcionan pesos safetensors) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje; es puramente visual y de estado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una variante compacta de los modelos VLA (Vision-Language-Action) que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Su diseño busca reducir el coste computacional frente a modelos como OpenVLA o RT-2, manteniendo un rendimiento competitivo en tareas robóticas. El modelo base `lerobot/smolvla_base` ya está preentrenado, y este repositorio contiene un fine-tuning específico para la tarea de pick-and-place.

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre el dataset `1ys1/areumii_pickplace-v1`, que contiene 50 episodios a 20 FPS (3769 frames en total) de la tarea "Pick blue cube and place it on blue pad". La configuración de entrenamiento incluye 20.000 pasos, batch size de 4, optimizador AdamW, learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni técnicas de refuerzo adicionales; se trata de un fine-tuning por imitación supervisada.

## Capacidades

- Control de robot para tareas de pick-and-place: el modelo recibe el estado del robot (6 dimensiones) y tres imágenes (frontal, muñeca izquierda, muñeca derecha) a 256x256, y genera una acción de 16 dimensiones que representa los comandos de movimiento del robot.
- Procesamiento multimodal: combina entrada visual (RGB) y proprioceptiva (estado articular).
- Ejecución en tiempo real: al ser un modelo compacto, puede operar en hardware de consumo con latencias adecuadas para control robótico.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento multi-step fuera del ámbito de control robótico.
- El modelo está especializado en la tarea concreta para la que fue entrenado; no es generalista.

## Casos de uso

- Automatización de tareas repetitivas en entornos industriales: el modelo puede controlar un brazo robótico para recoger y colocar objetos en posiciones fijas, por ejemplo en líneas de ensamblaje o clasificación.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA base con un dataset pequeño, permitiendo estudiar la transferencia de habilidades y la generalización.
- Prototipado rápido de políticas robóticas: gracias a la integración con LeRobot, un desarrollador puede grabar demostraciones, entrenar el modelo y desplegarlo en un robot real en pocos pasos.
- Educación en robótica: el modelo y el dataset asociado pueden usarse en cursos para enseñar conceptos de visión por computador, control y aprendizaje automático aplicado.
- Evaluación de VLA en hardware de bajo coste: al tener solo 450M parámetros, es adecuado para probar capacidades de VLA en GPUs domésticas o incluso en dispositivos embebidos con suficiente memoria.
- Benchmarking de algoritmos de imitación: el dataset y el modelo pueden utilizarse como punto de partida para comparar diferentes estrategias de entrenamiento o arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 450 millones de parámetros, lo que en precisión FP32 ocupa aproximadamente 1,8 GB de memoria. El repositorio pesa 0,9 GB, probablemente en BF16 o FP16 (no se especifica).
- Se puede ejecutar en GPUs de consumo como una RTX 3060 (12 GB) o superior, ya que el requisito de VRAM es modesto.
- No se han publicado requisitos oficiales de hardware ni benchmarks de latencia.
- El despliegue se realiza mediante LeRobot, que gestiona la carga del modelo y la inferencia. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje puro.
- Para ejecutar el rollout en un robot real, se necesita el robot `areumii_c1` y las cámaras correspondientes, además de una GPU compatible con CUDA.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos VLA. Se puede mencionar que SmolVLA se posiciona como una alternativa eficiente a modelos más grandes como OpenVLA (7B parámetros) o RT-2 (55B parámetros), pero no hay datos de rendimiento en este repositorio. El modelo base `lerobot/smolvla_base` es el punto de partida, y este fine-tuning es una adaptación específica.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (recoger un cubo azul y colocarlo en una almohadilla azul) con un robot específico (`areumii_c1`) y una configuración de cámaras fija. No generaliza a otras tareas, objetos o entornos sin un nuevo fine-tuning.
- El dataset de entrenamiento es muy pequeño (50 episodios), lo que aumenta el riesgo de sobreajuste y reduce la robustez ante variaciones en iluminación, posición de objetos o perturbaciones.
- No se han realizado evaluaciones formales en robot real; el rendimiento en condiciones reales es desconocido.
- Al ser un modelo de imitación, puede heredar sesgos de las demostraciones humanas, como movimientos subóptimos o errores sistemáticos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base SmolVLA puede tener sus propias restricciones; se recomienda revisar la licencia del modelo base.
- No se proporcionan garantías de seguridad para operación autónoma; el despliegue en robots reales debe realizarse con supervisión y medidas de seguridad adecuadas.

## Enlaces

- Repositorio del modelo: [1ys1/areumii-smolvla-pickplace-v1](https://huggingface.co/1ys1/areumii-smolvla-pickplace-v1)
- Modelo base: [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- Dataset de entrenamiento: [1ys1/areumii_pickplace-v1](https://huggingface.co/datasets/1ys1/areumii_pickplace-v1)
- Paper de SmolVLA: [arxiv:2506.01844](https://huggingface.co/papers/2506.01844)
- Documentación de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
- Repositorio de LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
