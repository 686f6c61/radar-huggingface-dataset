# 1ys1/areumii-smolvla-real-pickplace-v2-green-minitest

## Resumen

El modelo `1ys1/areumii-smolvla-real-pickplace-v2-green-minitest` es una política de robótica de tipo visión-lenguaje-acción (VLA) basada en el modelo SmolVLA, un modelo compacto y eficiente desarrollado por Hugging Face en colaboración con el ecosistema LeRobot. Esta instancia concreta es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario 1ys1, orientado a la ejecución de una tarea específica de manipulación: recoger una lata verde y colocarla en el estante superior.

El modelo está entrenado con un dataset de demostraciones reales capturadas con un robot de tipo `areumii` equipado con tres cámaras (cabeza, muñeca izquierda y muñeca derecha). La política consume estados del robot e imágenes a 256x256 y produce acciones de 16 dimensiones. Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, está diseñado para ejecutarse en hardware de consumo, lo que lo hace adecuado para laboratorios de robótica y prototipado rápido. La licencia Apache 2.0 permite su uso comercial con las condiciones habituales.

No se han publicado resultados de evaluación en la model card, por lo que la tasa de éxito real sobre el robot físico no está documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, que a su vez implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. SmolVLA es un modelo compacto de visión-lenguaje-acción que combina representaciones visuales y de estado del robot para generar acciones de control, con un diseño orientado a la eficiencia computacional y al despliegue en hardware de consumo.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `1ys1/areumii-real-pickplace-v2-green`, compuesto por 50 episodios de demostraciones reales a 30 FPS, lo que totaliza 34.883 frames. La configuración de entrenamiento incluye 10.000 pasos, tamaño de lote 4, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El modelo consume tres imágenes de 256x256 píxeles (cabeza, muñeca izquierda, muñeca derecha) y un vector de estado de 6 dimensiones, y genera un vector de acción de 16 dimensiones. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación en la información disponible.

## Capacidades

- Ejecución de tareas de manipulación robótica por aprendizaje por imitación, específicamente recoger una lata verde y colocarla en un estante superior.
- Entrada multimodal: estado del robot (6 dimensiones) y tres imágenes RGB a 256x256.
- Salida de acciones de control de 16 dimensiones, adecuadas para el control de un robot manipulador de tipo `areumii`.
- Integración nativa con el ecosistema LeRobot para entrenamiento, despliegue y evaluación de políticas.
- Fine-tuning desde el modelo base `lerobot/smolvla_base`, lo que permite adaptar la política a nuevas tareas con datasets relativamente pequeños.
- Despliegue en hardware de consumo gracias a su tamaño reducido (450 millones de parámetros).

No se han identificado capacidades de generación de texto libre, tool calling, razonamiento simbólico ni soporte multilingüe en la información proporcionada.

## Casos de uso

- Automatización de tareas de pick-and-place en almacenes: el modelo puede ejecutar la secuencia de recogida y colocación de objetos en posiciones fijas, con tres cámaras que proporcionan visión de conjunto y de muñeca.
- Robots domésticos de manipulación: gracias a su tamaño compacto y a la posibilidad de ejecutarse en hardware de consumo, es adecuado para prototipos de robots de asistencia que deben recoger y colocar objetos cotidianos.
- Líneas de ensamblaje ligeras: puede integrarse en células robóticas donde se necesita repetir una tarea de manipulación concreta, aprovechando la salida de 16 dimensiones para el control fino del efector.
- Investigación en aprendizaje por imitación: el modelo permite estudiar cómo una política VLA se comporta con datasets de demostraciones reales pequeños (50 episodios), útil para evaluar la robustez y generalización de SmolVLA.
- Entrenamiento de robots con demostraciones humanas: se puede utilizar como base para ajustar el modelo a nuevas tareas mediante el comando `lerobot-train`, partiendo de `lerobot/smolvla_base`.
- Prototipado rápido en laboratorios de robótica: la integración con LeRobot y el reducido tamaño del modelo permiten iterar rápidamente sobre políticas de control sin necesidad de clústeres de GPU.
- Educación y divulgación en robótica: al ser un modelo abierto y licenciado bajo Apache 2.0, puede emplearse en cursos y talleres para enseñar el pipeline completo de entrenamiento y despliegue de políticas VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parámetros, en precisión float32 se requiere aproximadamente 1,8 GB de VRAM; en float16, aproximadamente 0,9 GB. El repositorio ocupa 0,9 GB, lo que sugiere que los pesos están almacenados en fp32 o fp16.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM debería ser suficiente para inferencia. Se recomienda una RTX 3060, RTX 4060 o superior para obtener baja latencia.
- Compatibilidad con hardware de consumo: sí, el modelo está explícitamente diseñado para desplegarse en hardware de consumo.
- Opciones de despliegue: el modelo se usa mediante el framework LeRobot, con los comandos `lerobot-rollout` y `lerobot-train`. No se mencionan integraciones con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo convencional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| 1ys1/areumii-smolvla-real-pickplace-v2-green-minitest | 450.046.176 | no disponible | Apache 2.0 | HuggingFace |
| 1ys1/areumii-smolvla-real-pickplace-v1-baseline | no disponible | no disponible | Apache 2.0 (asumida por ser repo del mismo autor, no confirmada en la fuente) | HuggingFace |
| 1ys1/areumii-smolvla-pickplace-v4 | no disponible | no disponible | Apache 2.0 (asumida, no confirmada en la fuente) | HuggingFace |
| lerobot/smolvla_base | no disponible | no disponible | Apache 2.0 (según tags del modelo) | HuggingFace |

Las variantes `v1-baseline` y `v4` son otros fine-tunings del mismo modelo base SmolVLA realizados por el mismo autor, pero no se dispone de sus especificaciones técnicas en la información consultada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que se desconoce la tasa de éxito real en el robot físico.
- El modelo está entrenado exclusivamente para la tarea "recoger la lata verde y colocarla en el estante superior" con un robot `areumii` específico y tres cámaras concretas.
- El dataset de entrenamiento es pequeño (50 episodios, 34.883 frames), lo que puede provocar sobreajuste y una pobre generalización a otras posiciones, iluminaciones o distracciones.
- La política depende de la configuración exacta de las cámaras (nombres, posiciones y resoluciones); cualquier cambio puede degradar el rendimiento.
- No se ha verificado la compatibilidad con otros robots distintos del `areumii`.
- No ofrece capacidades de razonamiento simbólico, generación de lenguaje ni tool calling; es un modelo de política de control para robótica.
- Aunque la licencia Apache 2.0 permite el uso comercial, es responsabilidad del usuario verificar el cumplimiento de las condiciones, especialmente si se redistribuye el modelo o se integra en productos.
- La fecha de creación y actualización del repositorio (2026-09-05) parece futura, lo que podría indicar un error en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1ys1/areumii-smolvla-real-pickplace-v2-green-minitest
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii-real-pickplace-v2-green
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=1ys1/areumii-real-pickplace-v2-green
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
