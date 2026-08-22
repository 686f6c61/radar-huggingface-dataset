# fecasado/gact-cubes-vit-dino-v6

## Resumen

El modelo `fecasado/gact-cubes-vit-dino-v6` es una política de aprendizaje por imitación para robótica, entrenada con la librería LeRobot de Hugging Face. Está diseñada para resolver una tarea de manipulación concreta: mover cubos a cestas, según el dataset de entrenamiento `fecasado/Ncubes-to-Nbaskets-320x240`. El nombre del modelo sugiere que utiliza un backbone de visión basado en Vision Transformer (ViT) preentrenado con DINO, una técnica de aprendizaje autosupervisado de Facebook AI Research.

El modelo tiene 44,9 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Es relevante en el contexto de la robótica open source porque demuestra cómo aplicar políticas de aprendizaje por imitación a tareas de manipulación con un pipeline estándar como LeRobot, facilitando la reproducción y el despliegue en robots reales o simulados. No se dispone de información pública sobre la arquitectura interna más allá de lo que sugiere el nombre y la plantilla de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) con DINO como backbone, integrada en una política de tipo ACT (Action Chunking with Transformers) según la plantilla de LeRobot |
| Parámetros totales | 44.919.706 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión y control, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. El nombre del modelo (`gact-cubes-vit-dino-v6`) sugiere que combina un extractor de características visuales ViT (Vision Transformer) preentrenado con el método de autosupervisión DINO, y una política de control tipo ACT (Action Chunking with Transformers) o similar. La plantilla de la model card indica que el entrenamiento se realizó con LeRobot, que implementa el aprendizaje por imitación a partir de demostraciones humanas. El dataset de entrenamiento es `fecasado/Ncubes-to-Nbaskets-320x240`, que contiene episodios de manipulación de cubos a cestas a una resolución de 320x240 píxeles. No se indica el número de tokens de entrenamiento, el tamaño del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de acciones de control para robótica: produce secuencias de posiciones o esfuerzos de articulaciones del robot (action chunks) a partir de observaciones visuales.
- Percepción visual: procesa imágenes de cámara de resolución 320x240 para entender la escena y localizar los cubos y las cestas.
- Manipulación de objetos: está entrenado para una tarea específica de mover cubos a cestas, pero el enfoque es generalizable a otras tareas de manipulación con la misma arquitectura.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, lo que permite evaluar y desplegar fácilmente.
- No se conocen capacidades de tool calling, agentes, razonamiento multi-paso o multimodalidad fuera del ámbito visual y de control.

## Casos de uso

- Investigación en robótica: el modelo sirve como ejemplo de cómo entrenar una política de manipulación con LeRobot y un backbone ViT-DINO, facilitando la reproducción de experimentos en laboratorio.
- Prototipado de tareas de pick-and-place: puede integrarse en un robot de brazo (p.ej., SO-100) para mover objetos entre contenedores, como paso inicial para tareas logísticas o de clasificación.
- Benchmark de aprendizaje de imitación: se puede usar como baseline para comparar arquitecturas de políticas (ACT, Diffusion, etc.) en la misma tarea.
- Evaluación de backbone visuales: al usar DINO como extractor de características, permite estudiar cómo afecta la representación visual autosupervisada al rendimiento de la política.
- Educación y formación: útil para que estudiantes aprendan a entrenar y evaluar políticas robóticas con LeRobot en un entorno de código abierto.
- Desarrollo de sistemas de automatización flexible: aunque la tarea es específica, la arquitectura se puede adaptar a otros escenarios de manipulación con datasets personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como éxito en la tarea, precisión de agarre o tiempo de episodio.

## Requisitos de hardware

- VRAM estimada: con 44,9 millones de parámetros, el modelo es ligero. En FP32, los pesos ocupan aproximadamente 180 MB; en FP16, unos 90 MB. La inferencia puede caber en cualquier GPU con al menos 2 GB de VRAM, pero no se dispone de datos oficiales de consumo.
- GPU recomendadas: cualquier GPU NVIDIA moderna con soporte CUDA, por ejemplo RTX 2060 o superior, o una A100/H100 para entrenamiento o despliegue a mayor escala.
- Cabe en GPU consumer: sí, es un modelo pequeño que puede ejecutarse en GPUs de escritorio (RTX 3060, 4060, etc.).
- Opciones de despliegue: LeRobot ofrece scripts de evaluación e inferencia, compatibles con PyTorch. También se puede exportar a ONNX o TensorRT para optimización, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica de tamaño similar). La comparación con otros modelos de LeRobot (p. ej., ACT, Diffusion Policy) requeriría datos de rendimiento en la misma tarea, que no se han publicado. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos del dataset: el modelo se entrenó exclusivamente con un dataset de cubos a cestas, por lo que no generaliza a otras tareas de manipulación sin reentrenamiento.
- Riesgo de alucinación: al ser un modelo de control, no genera texto, pero puede producir acciones erróneas si la escena difiere del entrenamiento.
- Dependencia de la calidad de las imágenes: la resolución de 320x240 puede limitar la precisión en tareas de alta demanda visual.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe incluir el aviso de licencia y no se ofrece garantía.
- Sin datos de robustez: no se han reportado pruebas de robustez ante variaciones de iluminación, oclusiones o cambios de fondo.
- Formato de la model card incompleto: la plantilla no especifica detalles técnicos adicionales, por lo que se recomienda consultar el código de entrenamiento en LeRobot para más información.

## Enlaces

- Hugging Face: https://huggingface.co/fecasado/gact-cubes-vit-dino-v6
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Nubes-to-Nbaskets-320x240
- LeRobot (librería): https://github.com/huggingface/lerobot
- DINO (backbone visual): https://github.com/facebookresearch/dino
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
