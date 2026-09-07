# HyeonseokE/smolvla_push_cube_ours_2000_10fps

## Resumen

El modelo `HyeonseokE/smolvla_push_cube_ours_2000_10fps` es un fine-tuning del modelo base `lerobot/smolvla_base`, perteneciente a la familia SmolVLA (Vision-Language-Action). SmolVLA es una arquitectura compacta y eficiente de vision-language-action, diseñada para tareas de robótica de manipulación y capaz de ejecutarse en hardware de consumo. Este checkpooint concreto ha sido entrenado por HyeonseokE sobre el dataset `push_cube_ours_10fps` para resolver la tarea de empujar un cubo hasta un marcador objetivo.

El modelo tiene un total de 450.046.176 parámetros almacenados en formato safetensors, lo que lo convierte en un modelo ligero dentro del ámbito de los VLA. Aunque no se especifica la longitud de contexto, al ser un modelo de visión-lenguaje-acción, procesa observaciones de estado y varias cámaras (superior y muñeca izquierda) para generar acciones de control continuo. La relevancia de este modelo radica en su enfoque práctico: permite entrenar políticas de imitación para robots de bajo coste con un presupuesto computacional reducido, y puede cargarse y ejecutarse con la librería LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (VLA de la familia SmolVLA, vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `lerobot/smolvla_base`, que a su vez implementa la arquitectura SmolVLA descrita en el paper `arxiv:2506.01844`. SmolVLA es un modelo vision-language-action que combina un codificador visual y un módulo de acción para generar comandos de control a partir de observaciones de estado e imágenes de cámaras. Al ser un modelo compacto, su diseño prioriza la eficiencia computacional y el despliegue en hardware de consumo.

El entrenamiento se realizó sobre el dataset `HyeonseokE/push_cube_ours_10fps`, compuesto por 100 episodios y 21.629 frames a 10 FPS. La configuración de entrenamiento incluye 16.850 steps, batch size de 64, optimizador AdamW con learning rate de 0,0001 y seed 2000. Se utilizó la versión 0.6.0 de LeRobot. El modelo consume como entradas las observaciones de estado de dimensión 6 y tres cámaras RGB de resolución 256x256 (identificadas como `camera1`, `camera2` y `camera3`), y produce acciones de control de dimensión 6, tanto en formato genérico como en `radian_urdf0`. Durante el entrenamiento no se aplicaron técnicas como RLHF o DPO, ya que se trata de un aprendizaje por imitación supervisado a partir de demostraciones.

## Capacidades

- Control de robot manipulator mediante política de imitación, generando acciones de 6 dimensiones.
- Procesamiento de observaciones de estado (posición/orientación) e imágenes de hasta tres cámaras simultáneas.
- Ejecución de la tarea específica de empujar un cubo hasta un marcador objetivo, entrenada con demostraciones a 10 FPS.
- Integración nativa con LeRobot para entrenamiento, `rollout` y evaluación en robots reales.
- Compatibilidad con el robot `so101_follower` y cámaras `top` y `left_wrist` según la configuración del proyecto.
- Despliegue en GPU de consumo gracias a su tamaño compacto (450 M de parámetros).
- No soporta tool calling, function calling ni razonamiento multi-step en el sentido de modelos de lenguaje; su dominio está acotado a la generación de acciones de control.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede utilizarse como política de control para un brazo robótico que debe empujar objetos hacia posiciones concretas, útil en tareas de ensamblaje o clasificación.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo se comporta un VLA compacto fine-tuneado sobre un dataset propio y cómo generaliza a variaciones de la tarea.
- Prototipado rápido de robots de bajo coste: al ejecutarse en hardware de consumo, permite probar políticas de control sin necesidad de GPUs profesionales, acelerando el ciclo de desarrollo.
- Comparación de políticas: puede utilizarse como baseline para comparar con otros fine-tunings de SmolVLA sobre la misma tarea, evaluando el impacto de distintos dataset y configuraciones de entrenamiento.
- Educación robótica: ofrece un ejemplo accesible de cómo entrenar y desplegar un modelo vision-language-action, ya que la documentación de LeRobot proporciona guías paso a paso.
- Automatización en entornos controlados: para escenarios industriales sencillos donde la tarea de empujar un objeto a un punto fijo se repite, el modelo puede actuar como política de tiempo real con cámaras montadas en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que no se proporcionan resultados de evaluación del policy. Por tanto, no es posible comparar objetivamente el rendimiento del modelo con otros en tareas estándar de robótica o VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo tiene 450 M de parámetros y un tamaño de repo de 0,9 GB, es razonable esperar que quepa en GPUs de gama de consumo, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible en la información del proyecto. La familia SmolVLA está diseñada para hardware de consumo, por lo que tarjetas como RTX 3060, RTX 4070 o similares podrían ser suficientes, pero no es un dato confirmado.
- Despliegue en consumer GPU: no confirmado, aunque la descripción general de SmolVLA sugiere que es posible.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), tal como se documenta en la model card. No se mencionan integraciones con vLLM, llama.cpp u otros runtime de LLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| `lerobot/smolvla_base` | No disponible | No disponible | Modelo base VLA | Apache-2.0 |
| `HyeonseokE/smolvla_push_cube_ours_2000_10fps` | 450.046.176 | No disponible | Empujar cubo a marcador | Apache-2.0 |
| `HyeonseokE/smolvla_push_cube_cap_2000_10fps` | No disponible | No disponible | Empujar cubo (dataset con captions) | Apache-2.0 |
| `HyeonseokE/smolvla_push_cube_cap_3000_10fps` | No disponible | No disponible | Empujar cubo (dataset con captions, seed 3000) | Apache-2.0 |

Se desconoce el número de parámetros de los otros fine-tunings mencionados, así como su rendimiento, por lo que la comparación se limita al ámbito del proyecto y la licencia.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de empujar un cubo a un marcador objetivo; no puede realizar otras manipulaciones ni comportamientos generales.
- No se han proporcionado resultados de evaluación en robot real, por lo que no hay métricas de tasa de éxito ni evidencia de robustez fuera del dataset de entrenamiento.
- La política depende de observaciones de cámaras específicas (`top`, `left_wrist` y las claves `camera1`, `camera2`, `camera3`) y de un robot tipo `so101_follower`; cambios en la disposición de cámaras, iluminación o hardware pueden degradar el comportamiento.
- El modelo no es un modelo de lenguaje: no puede mantener conversaciones ni comprender instrucciones textuales en el sentido habitual, a pesar de su nombre.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que su caso de uso cumple con la normativa aplicable a la robótica y la manipulación de objetos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_push_cube_ours_2000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/push_cube_ours_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía específica de SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
