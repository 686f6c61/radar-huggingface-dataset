# Emadodin/smolvla_so101_manual_v1

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, orientado a control robótico mediante imitación. El modelo combina un codificador visual, un codificador de lenguaje y un decodificador de acciones que genera comandos motores de bajo nivel a partir de observaciones multimodales (imágenes de cámaras y estado de las articulaciones). Su diseño busca reducir el coste computacional frente a otros VLA de mayor tamaño, permitiendo el despliegue en hardware de consumo.

Esta ficha concreta, `Emadodin/smolvla_so101_manual_v1`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario Emadodin. Está especializado en una única tarea robótica: coger un cubo verde y colocarlo en una zona objetivo, empleando el robot SO-101 y dos cámaras (muñeca y vista superior). El modelo cuenta con 450.046.176 parámetros en formato safetensors y un repositorio de 0,9 GB.

La relevancia de esta ficha es limitada y acotada: se trata de una política de imitación para una tarea concreta, no de un modelo de propósito general. Resulta útil como ejemplo reproducible de fine-tuning de SmolVLA con LeRobot 0.7.0 y como punto de partida para quien quiera entrenar políticas similares sobre el robot SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de imitación, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se expresan en lenguaje natural, pero no se documenta cobertura multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura VLA compacta que procesa observaciones multimodales (tres cámaras de 3×256×256 píxeles y un vector de estado de 6 dimensiones) y produce un vector de acción de 6 dimensiones. La model card no detalla la composición interna de bloques, el mecanismo de atención ni la innovación concreta del paper; únicamente indica que se trata de un modelo eficiente capaz de ejecutarse en hardware de consumo.

El fine-tuning se realizó sobre el dataset `Emadodin/so101_pickplace_manual_extra_v1`, compuesto por 111 episodios y 78.225 fotogramas a 50 FPS, con la tarea "pick the green cube and place it in the target zone". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.7.0. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo de imitación robótica.

## Capacidades

- Generación de acciones motoras de 6 dimensiones para el robot SO-101 a partir de observaciones visuales y de estado.
- Percepción visual mediante dos cámaras (muñeca y vista superior), con entradas de 3×256×256 píxeles por cámara.
- Condicionamiento por instrucción de tarea en lenguaje natural (por ejemplo, "pick the green cube and place it in the target zone").
- Ejecución de una tarea concreta de pick-and-place: coger un cubo verde y depositarlo en una zona objetivo.
- Integración con el ecosistema LeRobot para rollout y entrenamiento mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código, audio ni modo thinking.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de coger un cubo verde y colocarlo en una zona objetivo sobre el robot SO-101, sirviendo como base para experimentos de manipulación reproducible.
- Reproducción de experimentos de imitación: investigadores pueden desplegar la política con `lerobot-rollout` para validar pipelines de entrenamiento y comparar configuraciones sobre el mismo dataset y robot.
- Punto de partida para fine-tuning: equipos que trabajen con SO-101 pueden reutilizar esta política como inicialización y reentrenar con sus propios datos mediante `lerobot-train` sobre `lerobot/smolvla_base`.
- Docencia y formación en robótica: el modelo permite ilustrar el flujo completo de LeRobot (instalación, calibración de hardware, grabación de datos, entrenamiento y despliegue) con una tarea acotada y comprensible.
- Pruebas de integración de hardware de bajo coste: al ser un VLA compacto, permite validar si el hardware de consumo disponible en el laboratorio es suficiente para ejecutar políticas de manipulación.
- Benchmark interno de políticas VLA: sirve como referencia de línea base para comparar nuevas políticas entrenadas sobre el mismo robot y tarea, aunque no se hayan publicado métricas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que la tabla de evaluación real-robot está vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors, el peso en FP32 ronda 1,8 GB y en FP16 aproximadamente 0,9 GB, a lo que hay que sumar el coste de los codificadores visuales y el procesamiento de tres imágenes de 256×256.
- GPU recomendadas: no documentadas por el autor. Por tamaño, el modelo es compatible con GPUs de consumo, pero no se especifica un modelo concreto.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial en la información disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=Emadodin/smolvla_so101_manual_v1`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 50 FPS, pero no se indica la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Emadodin/smolvla_so101_manual_v1 | 450.046.176 | VLA (fine-tuning) | Pick-and-place SO-101 | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | VLA (base) | Manipulación general | no disponible en la informacion | Hugging Face |
| Otras políticas VLA (p. ej. OpenVLA, π0) | no disponible en la informacion | VLA | Manipulación general | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("pick the green cube and place it in the target zone") y un único robot (SO-101); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- Sin evaluación publicada: no hay métricas de tasa de éxito, por lo que se desconoce su fiabilidad real en producción.
- Dependencia de configuración de hardware: requiere que los nombres e índices de cámara coincidan con las claves de observación del entrenamiento (`wrist`, `top`), y que el puerto y la calibración del robot sean correctos.
- Dataset pequeño: 111 episodios y 78.225 fotogramas son un volumen reducido, lo que puede limitar la robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- Sesgos: no documentados; en robótica de imitación, los sesgos provienen de las condiciones de grabación (posición de cámara, iluminación, fondo, operador).
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Idiomas: no se documenta cobertura multilingüe de las instrucciones de tarea; la única instrucción validada está en inglés.
- Fecha de creación futura (2026-11-10) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Emadodin/smolvla_so101_manual_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Emadodin/so101_pickplace_manual_extra_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Emadodin/so101_pickplace_manual_extra_v1
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
