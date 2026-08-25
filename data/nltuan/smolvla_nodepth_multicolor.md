# NLTuan/smolvla_nodepth_multicolor

## Resumen

El modelo `NLTuan/smolvla_nodepth_multicolor` es un ajuste fino (fine-tune) de SmolVLA, el modelo de visión-lenguaje-acción (VLA) de Hugging Face, publicado bajo licencia Apache 2.0. SmolVLA, descrito en el artículo arxiv 2506.01844, es un VLA compacto de 450 millones de parámetros diseñado para ejecutarse en hardware de consumo, a diferencia de alternativas masivas como OpenVLA (7B). Este checkpoint concreto se ha entrenado con LeRobot sobre el dataset `vraiRobotLab/multicolor_block_tiles_joints` para controlar un robot SO-101 en tareas de colocación de bloques de colores en una cuadrícula de nueve casillas.

La relevancia de este modelo radica en que demuestra cómo un VLA de pequeño tamaño puede adaptarse a una tarea de manipulación concreta mediante imitación, con una ventana de contexto y coste computacional reducidos. El repositorio incluye 181 episodios y 61.503 frames de entrenamiento, y el modelo produce acciones de 6 grados de libertad a partir de tres cámaras y el estado articular del robot. Aunque el nombre del repositorio indica "nodepth", la model card lista tres cámaras (wrist, top, depth), una discrepancia que conviene verificar antes de desplegarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en SmolVLA / SmolVLM |
| Parametros totales | 450.046.176 (450M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (10.6 GB) |

## Arquitectura y entrenamiento
SmolVLA es un modelo transformer que adapta un VLM preentrenado (SmolVLM) a la generación de acciones robóticas. En lugar de entrenar desde cero, se toma el VLM y se le añade una cabeza de acción que predice los valores de las articulaciones del robot a partir de observaciones visuales y del estado del sistema. El modelo base `lerobot/smolvla_base` se ha ajustado mediante aprendizaje por imitación con el framework LeRobot, sobre el dataset `vraiRobotLab/multicolor_block_tiles_joints`, que contiene 181 episodios grabados a 30 FPS con tres cámaras (muñeca, superior y profundidad) y el estado de las articulaciones.

El entrenamiento se realizó durante 50.000 pasos con un tamaño de lote de 32, optimizador AdamW y tasa de aprendizaje de 0,0001, con semilla 1000 y la versión 0.6.2 de LeRobot. Las observaciones son tres imágenes de 256x256 píxeles y un vector de estado de 6 valores; la salida es un vector de acción de 6 valores. No se han publicado detalles sobre técnicas de RLHF o DPO en el modelo base, y el ajuste es de tipo supervisado sobre datos de demostración.

## Capacidades
- Manipulación robótica guiada por instrucciones en lenguaje natural (p. ej., "Put the red block into square 1").
- Generación de acciones de control de 6 grados de libertad (posición y orientación) a partir de visión y estado articular.
- Procesamiento de tres flujos de imagen simultáneos (muñeca, cámara superior y profundidad) a 256x256.
- Ejecución de políticas de imitación en tiempo real con LeRobot (rollout).
- Capacidades de generalización limitadas al dominio de la tarea (bloques de colores sobre una cuadrícula).
- No se especifica soporte de tool calling ni de razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso
- Investigación en robótica de manipulación: sirve como punto de partida para estudiar el ajuste fino de VLA compactos en tareas de pick-and-place con objetos de colores.
- Demostraciones educativas de aprendizaje por imitación: su tamaño reducido permite ejecutarlo en una GPU de consumo para clases y laboratorios.
- Automatización de tareas de clasificación de piezas: el modelo puede colocarse en un brazo SO-101 para clasificar bloques de colores en casillas determinadas.
- Evaluación de políticas de control en entornos de investigación: con LeRobot se puede lanzar el rollout sobre el robot real y medir tasas de éxito por tarea.
- Prototipado de sistemas de control por instrucciones: permite validar si un VLA de 450M es suficiente para una tarea industrial sencilla antes de escalar a modelos mayores.
- Comparativa de VLA en hardware de consumo: útil para medir la degradación de rendimiento frente al modelo base SmolVLA en una tarea concreta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye una sección de evaluación completada, y no hay datos de éxito en tareas reales ni comparaciones con otros modelos en este repositorio.

## Requisitos de hardware
- VRAM estimada: con 450 millones de parámetros, el modelo en FP16 ocupa aproximadamente 0,9 GB solo de pesos; con la entrada de tres imágenes de 256x256 y el activo de inferencia, se recomienda al menos 4-6 GB de VRAM en GPU de consumo.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090 o superiores; también es ejecutable en GPUs de portátil con 6 GB o más.
- Cabe en hardware de consumo: sí, es uno de los objetivos de diseño de SmolVLA.
- Opciones de despliegue: LeRobot (rollout con `lerobot-rollout`), compatible con el ecosistema PyTorch; no se menciona soporte de vLLM, Ollama ni llama.cpp para este checkpoint.
- Latencia y throughput: no disponible; el rendimiento depende de la GPU y de la configuración de las cámaras.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Hardware requerido | Disponibilidad |
|---|---|---|---|---|---|
| NLTuan/smolvla_nodepth_multicolor | 450M | no disponible | Apache 2.0 | Consumer GPU | Hugging Face |
| lerobot/smolvla_base | 450M | no disponible | Apache 2.0 | Consumer GPU | Hugging Face |
| OpenVLA (7B) | 7B | no disponible | MIT | GPU profesional (24 GB+) | Hugging Face |

SmolVLA es notablemente más compacto que OpenVLA (450M frente a 7B), lo que permite inferencia en GPUs de consumo. El rendimiento relativo no está publicado en este repositorio; el paper original reporta resultados competitivos frente a modelos más grandes, pero no hay datos de esta versión ajustada. La licencia Apache 2.0 favorece el uso comercial, a diferencia de otros VLA con restricciones.

## Limitaciones y advertencias
- El modelo está entrenado exclusivamente en tareas de colocación de bloques de colores en una cuadrícula; no generaliza a otras tareas ni objetos sin nuevo fine-tuning.
- Contradicción en la configuración: el nombre del repositorio indica "nodepth", pero la model card lista una cámara de profundidad entre las observaciones. Verificar las claves de cámara antes de usarlo en despliegue.
- No hay resultados de evaluación publicados: no se puede garantizar una tasa de éxito concreta en el robot.
- El dataset de entrenamiento es pequeño (181 episodios, 61.503 frames), lo que puede limitar la robustez frente a variaciones de iluminación, posición de cámara o estados iniciales.
- No se especifica la longitud de contexto ni los idiomas soportados; las instrucciones del dataset están en inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que deben revisarse.

## Enlaces
- Repositorio del modelo: https://huggingface.co/NLTuan/smolvla_nodepth_multicolor
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/vraiRobotLab/multicolor_block_tiles_joints
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de SmolVLA (GitHub): https://github.com/PhosFaith/SmolVLA
