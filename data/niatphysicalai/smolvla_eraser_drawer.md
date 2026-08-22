# NIATphysicalAI/smolvla_eraser_drawer

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por HuggingFace, presentado en el artículo de investigación arXiv 2506.01844. Este repositorio contiene un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` sobre el dataset `Eraser_drawer`, orientado a tareas de manipulación robótica: coger un borrador y colocarlo en un cajón superior o inferior. Con aproximadamente 450 millones de parámetros, SmolVLA consigue un rendimiento comparable a modelos de 7 a 10 veces mayores, lo que permite su despliegue en hardware de consumo. El modelo se distribuye bajo licencia Apache 2.0 y se integra con la librería LeRobot para entrenamiento e inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) con VLM compacto y experto de acciones basado en flow matching |
| Parámetros totales | 450.046.176 (~450M) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo robótico, no se especifica) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantización reportada) |
| Idiomas soportados | no disponible (las instrucciones del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y visión (VLM) preentrenado y compacto con un experto de acciones entrenado mediante flow matching. Dadas varias imágenes de cámaras y una instrucción en lenguaje natural, el modelo genera un chunk de acciones (secuencia de acciones) para controlar el robot. El ajuste fino se realizó sobre `lerobot/smolvla_base` utilizando el dataset `NIATphysicalAI/Eraser_drawer`, que contiene 100 episodios y 79.890 fotogramas a 30 FPS, con dos tareas: "coger el borrador y colocarlo en el cajón superior" y "coger el borrador y colocarlo en el cajón inferior". El entrenamiento se ejecutó durante 26.000 pasos con un batch de 48, optimizador AdamW, tasa de aprendizaje de 1e-4 y semilla 1000, empleando LeRobot versión 0.6.1. El modelo consume como entradas el estado del robot (6 valores) y tres imágenes RGB de 256×256 píxeles, y produce una acción de 6 dimensiones.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad a partir de observaciones visuales de tres cámaras y el estado del robot.
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea a ejecutar.
- Fusión de información multimodal (imágenes y estado) mediante el VLM subyacente.
- Entrenamiento por imitación con flow matching, que permite generar secuencias de acciones suaves y coherentes.
- Modelo ligero (450M parámetros) apto para inferencia en hardware de consumo, como GPUs de gama media.
- Integración completa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.

## Casos de uso

- Manipulación robótica en entornos domésticos: el modelo puede coger objetos cotidianos (como un borrador) y depositarlos en ubicaciones concretas, como cajones o estantes, gracias a su capacidad de interpretar instrucciones y generar acciones precisas.
- Automatización de tareas de pick-and-place en almacenes pequeños o laboratorios, donde se requiere mover objetos entre posiciones fijas con bajo coste computacional.
- Prototipado rápido de políticas robóticas con LeRobot y hardware asequible (robot tipo `so_follower`), permitiendo iterar sobre nuevos datasets y tareas en pocas horas.
- Investigación en aprendizaje por imitación y modelos VLA compactos, sirviendo como punto de partida para experimentos con arquitecturas más ligeras.
- Educación y demostraciones de robótica con IA en entornos académicos, gracias a su tamaño reducido y a la documentación disponible en LeRobot.
- Despliegue en robots de bajo coste en entornos de producción ligera, donde los modelos grandes (7B o más) no son viables por limitaciones de memoria o latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este ajuste fino específico en la información disponible. El artículo original de SmolVLA reporta un rendimiento competitivo frente a modelos de 7 a 10 veces mayores, pero no se proporcionan datos numéricos concretos para esta variante concreta del dataset `Eraser_drawer`.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 450M parámetros, se estima que puede caber en GPUs con 4 GB de VRAM o más (los pesos en FP16 ocupan aproximadamente 900 MB, más overhead de inferencia), aunque no hay especificaciones oficiales.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060, RTX 4060 o superiores; para entrenamiento se recomienda al menos una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3080 o A100).
- Sí cabe en GPU de consumo: es viable ejecutar inferencia en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- Opciones de despliegue: la librería principal es LeRobot, que ofrece scripts de entrenamiento y rollout (`lerobot-train`, `lerobot-rollout`). No se documentan otros motores de inferencia (como vLLM o TGI) para este modelo robótico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas directas para este ajuste fino en la información disponible. El artículo de SmolVLA compara el modelo base con alternativas como OpenVLA (7B) y otros VLA de gran tamaño, indicando que SmolVLA logra un rendimiento similar o superior con una fracción de los parámetros. Sin embargo, no hay datos numéricos específicos para esta variante sobre el dataset `Eraser_drawer`. Se recomienda consultar el paper original para una comparativa detallada.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluación en robot real para este modelo; el autor indica que no hay resultados de evaluación disponibles.
- El dataset de entrenamiento está limitado a 100 episodios y dos tareas muy específicas, lo que restringe la generalización a otras manipulaciones o entornos.
- El modelo depende de la configuración exacta de cámaras (tres cámaras RGB) y del robot `so_follower`; cambios en la disposición de las cámaras o en el hardware pueden degradar significativamente el rendimiento.
- Posibles sesgos derivados del dataset de entrenamiento, que puede no representar la variabilidad de entornos reales (iluminación, posiciones de objetos, distractores).
- Riesgo de alucinación en las acciones generadas si las observaciones difieren de las del entrenamiento, lo que podría provocar movimientos erráticos.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza robustez en producción; se recomienda validar exhaustivamente antes de un despliegue real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/NIATphysicalAI/smolvla_eraser_drawer
- Artículo SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/NIATphysicalAI/Eraser_drawer
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
