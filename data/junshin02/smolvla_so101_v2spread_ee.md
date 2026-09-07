# junshin02/smolvla_so101_v2spread_ee

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por el equipo de LeRobot/Hugging Face y presentado en el paper arxiv:2506.01844. Está diseñado para reducir costes computacionales y poder ejecutarse en hardware de consumo, manteniendo un rendimiento competitivo en tareas de control robótico por imitación. Este repositorio concreto, `junshin02/smolvla_so101_v2spread_ee`, es un fine-tuning del modelo base `lerobot/smolvla_base` para el robot SO101, especializado en la tarea de recoger un cubo verde y colocarlo en una caja.

El modelo tiene 450.046.176 parámetros y un tamaño de pesos de 0,9 GB en formato safetensors. Su arquitectura es la de un policy VLA que consume observaciones multimodales (estado del robot y tres imágenes de 256x256) y produce acciones de 10 dimensiones. Ha sido entrenado con 89 episodios y 30.703 frames del dataset `junshin02/so101_pickplace_v2spreadtrim_ee`, utilizando la librería LeRobot. Al ser un modelo de robótica, no ofrece capacidades de lenguaje natural ni generación de texto, sino control de bajo nivel para manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, un policy VLA compacto que integra percepción visual y generación de acciones para robots. La arquitectura concreta interna (número de capas, tipo de atención, etc.) no se detalla en la información proporcionada. En cuanto al entrenamiento, se ha realizado sobre el dataset `junshin02/so101_pickplace_v2spreadtrim_ee`, compuesto por 89 episodios y 30.703 frames a 30 FPS, con la tarea "Pick up the green cube and place it in the box". La configuración de entrenamiento incluye 57.600 pasos, batch size de 16, optimizador AdamW con learning rate de 0,0001, seed 1000 y la versión 0.6.0 de LeRobot.

El modelo consume como entradas un vector de estado de 6 dimensiones (`observation.state`) y tres imágenes RGB de 256x256 (`observation.images.camera1`, `camera2`, `camera3`), y produce una salida de acción de 10 dimensiones (`action`). No se indica que se haya aplicado RLHF, DPO ni ninguna técnica de alineación; se trata de un aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control robótico de bajo nivel: genera acciones de 10 dimensiones para el robot SO101, adecuadas para tareas de manipulación como pick-and-place.
- Percepción visual multicámara: procesa tres imágenes de 256x256 píxeles, lo que permite al modelo integrar información de diferentes puntos de vista.
- Aprendizaje por imitación: el policy ha sido entrenado para replicar demostraciones humanas o teleoperadas de una tarea concreta.
- Ejecución de tareas específicas de manipulación: está especializado en recoger un cubo verde y colocarlo en una caja.
- Despliegue en hardware de consumo: al ser un modelo compacto, puede ejecutarse en GPUs de gama media o incluso en sistemas embebidos, tal como indica la filosofía de SmolVLA.
- Compatibilidad con el ecosistema LeRobot: se integra con las herramientas de rollout, entrenamiento y evaluación de la librería LeRobot.

No dispone de capacidades de generación de texto, razonamiento simbólico, tool calling, ni soporte de agentes conversacionales, al ser exclusivamente un policy de robótica.

## Casos de uso

- Automatización de pick-and-place industrial: el modelo puede controlar un brazo robótico SO101 para recoger objetos de una posición y colocarlos en un contenedor, gracias a su salida de 10 dimensiones y su percepción de tres cámaras. Es adecuado para líneas de montaje donde la tarea es repetitiva y el entorno está controlado.
- Robótica de laboratorio: en entornos de investigación, puede utilizarse para manipular muestras, placas o pequeños objetos, aprovechando que el modelo ha sido entrenado con demostraciones de recogida y colocación.
- Clasificación en almacenes: el modelo puede ejecutar tareas de recogida de ítems específicos (por ejemplo, objetos de un color determinado) y depositarlos en zonas designadas, lo que resulta útil en sistemas de logística interna.
- Agricultura de precisión: para recogida selectiva de frutas u objetos en entornos semiestructurados, la capacidad de procesar múltiples vistas de cámara permite localizar y manipular objetivos con mayor robustez.
- Robótica doméstica: como demostración de manipulación básica, el modelo puede recoger objetos y ordenarlos, lo que sirve como base para asistentes robóticos en el hogar que realicen tareas sencillas.
- Investigación en aprendizaje por imitación: al ser un fine-tuning de SmolVLA con un dataset público, es útil como baseline o referencia para estudiar el comportamiento de policies VLA compactos en tareas de manipulación.
- Educación y prototipado: gracias a su bajo coste computacional y su integración con LeRobot, permite a estudiantes y desarrolladores montar un sistema de control robótico realista sin necesidad de infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para este policy. Por tanto, no es posible presentar datos de rendimiento como tasa de éxito, MMLU, HumanEval u otros.

## Requisitos de hardware

- VRAM estimada para inferencia: no se dispone de datos oficiales. Dado el tamaño de 450M parámetros y 0,9 GB de pesos, se estima que una GPU con al menos 4-6 GB de VRAM sería suficiente para ejecutar el modelo en FP16 o FP32.
- GPU recomendadas: una RTX 3060 (12 GB), RTX 4060 (8 GB) o superior sería adecuada para rollout en tiempo real. En el caso de usar GPUs de datacenter, una A10 o A100 también funcionaría sin problemas.
- Compatibilidad con GPU de consumo: sí, el modelo está diseñado para ejecutarse en hardware de consumo, tal como se indica en la descripción de SmolVLA.
- Opciones de despliegue: el modelo se ejecuta principalmente mediante la librería LeRobot, usando el comando `lerobot-rollout`. También puede integrarse en pipelines de entrenamiento con `lerobot-train`. No se mencionan opciones como vLLM, llama.cpp u Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| junshin02/smolvla_so101_v2spread_ee | 450.046.176 | no disponible | Pick-and-place en SO101 | apache-2.0 | HuggingFace |
| junshin02/smolvla_so101_v2trim_ee | no disponible | no disponible | Pick-and-place en SO101 | apache-2.0 | HuggingFace |
| junshin02/smolvla_so101_v2fix_pi0delta_b16 | no disponible | no disponible | Pick-and-place en SO101 | apache-2.0 | HuggingFace |
| lerobot/smolvla_base | no disponible | no disponible | Modelo base VLA | apache-2.0 | HuggingFace |

Los tres modelos del autor `junshin02` son fine-tunes de SmolVLA para el mismo robot y una tarea similar, aunque no se dispone de información sobre sus diferencias técnicas ni rendimiento. El modelo base `lerobot/smolvla_base` es el punto de partida para estos fine-tunes.

## Limitaciones y advertencias

- Especialización extrema: el modelo ha sido entrenado únicamente para la tarea "recoger el cubo verde y colocarlo en la caja". No generaliza a otras tareas, objetos o configuraciones sin reentrenamiento.
- Dependencia de la configuración del robot: requiere un robot SO101 con tres cámaras que coincidan con las claves de observación (`camera1`, `camera2`, `camera3`). Cambios en la calibración, posición o tipo de cámara pueden degradar el rendimiento.
- Sin capacidades de lenguaje: no es un modelo de lenguaje ni un agente conversacional; no puede interpretar instrucciones en texto ni responder preguntas.
- Riesgo de fallos fuera de distribución: al ser un policy de imitación, puede fallar ante situaciones no vistas durante el entrenamiento (iluminación diferente, obstáculos, variaciones en la posición del objeto).
- Ausencia de evaluación: no se han proporcionado resultados de evaluación en el mundo real, por lo que se desconoce la tasa de éxito real. Cualquier uso en producción requiere validación previa.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige mantener el aviso de licencia y atribución. No hay restricciones adicionales conocidas.
- Sin datos de cuantización ni contexto: no se han publicado versiones cuantizadas ni especificaciones sobre la ventana de contexto, lo que limita la optimización para despliegue en hardware muy restringido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junshin02/smolvla_so101_v2spread_ee
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/junshin02/so101_pickplace_v2spreadtrim_ee
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
