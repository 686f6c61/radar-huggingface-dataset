# Elbarbary/so101_smolvla_digitaltwin_v2

## Resumen

`Elbarbary/so101_smolvla_digitaltwin_v2` es una política de visión-lenguaje-acción (VLA) para robótica, publicada por el usuario Elbarbary en Hugging Face. Se trata de un fine-tuning del modelo base `Elbarbary/so101_smolvla`, a su vez derivado de SmolVLA, un modelo compacto y eficiente presentado en el paper arXiv:2506.01844 que busca ofrecer rendimiento competitivo en control robótico con costes computacionales reducidos y despliegue viable en hardware de consumo.

El modelo está entrenado mediante aprendizaje por imitación sobre el dataset `roboparadigm/real_pick_place_digital_twin`, compuesto por 50 episodios y 11 233 fotogramas a 30 FPS para una única tarea: recoger un cubo azul y depositarlo en una caja blanca. La política consume el estado articular del robot (vector de 6 dimensiones) y tres cámaras RGB de 480x640 (superior, muñeca y una tercera cámara) y produce un vector de acción de 6 dimensiones.

Con 450 millones de parámetros y un repositorio de 1,2 GB, este modelo es relevante para quienes trabajan con el robot SO-101 y el ecosistema LeRobot, ya que permite reproducir y extender un pipeline completo de imitación robótica con licencia Apache 2.0. Su utilidad es acotada: es una política de tarea única, no un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con fusión de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | so101_follower |
| Camaras | gripper, external (entradas top, wrist, empty_camera_0) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Dataset de entrenamiento | roboparadigm/real_pick_place_digital_twin (50 episodios, 11 233 frames, 30 FPS) |
| Modelo base | Elbarbary/so101_smolvla |
| Tamano del repositorio | 1,2 GB |
| Descargas | 44 |
| Likes | 1 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina un codificador visual y un modelo de lenguaje con un cabezal de acciones, diseñado para mapear observaciones multimodales (imágenes de cámaras y estado articular) a comandos motores de baja dimensión. La arquitectura concreta, el número de tokens de entrenamiento del modelo base y la composición detallada del dataset original no están disponibles en la información proporcionada.

El fine-tuning se realizó con LeRobot 0.7.0 durante 2000 pasos, con tamaño de lote 4, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, sobre el dataset de digital twin de 50 episodios (11 233 frames a 30 FPS). La tarea entrenada es única: "Pick up the blue cube and place it in the white box". No se documenta en la model card el uso de RLHF, DPO ni otras técnicas de alineación; se trata de aprendizaje por imitación supervisado. Tampoco se detallan innovaciones técnicas específicas de esta variante más allá de las del modelo base SmolVLA.

## Capacidades

- Control robótico de imitación: genera acciones de 6 dimensiones para el robot SO-101 a partir de estado articular y tres vistas de cámara.
- Percepción visual multimodal: procesa simultáneamente imágenes de cámara superior, de muñeca y una tercera cámara externa a resolución 480x640.
- Ejecución de tareas de pick-and-place: especializado en recoger un cubo azul y colocarlo en una caja blanca.
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- Despliegue en hardware de consumo: hereda del modelo base SmolVLA su orientación a bajo coste computacional.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento; es una política de control, no un modelo conversacional.

## Casos de uso

- Reproducción de un pipeline de imitación robótica: sirve como referencia completa (dataset, configuración de entrenamiento y comando de ejecución) para montar un flujo de aprendizaje por imitación con LeRobot y el robot SO-101.
- Automatización de pick-and-place en laboratorio: ejecuta la tarea de recoger el cubo azul y depositarlo en la caja blanca con `lerobot-rollout` y `--duration=60`, adecuado para pruebas controladas de manipulación.
- Base para fine-tuning en tareas propias: partiendo de `Elbarbary/so101_smolvla`, se puede reentrenar con un dataset propio usando el comando `lerobot-train` documentado, lo que lo convierte en punto de partida para nuevas políticas.
- Validación de un digital twin: el dataset de entrenamiento es un gemelo digital, de modo que el modelo permite comparar el comportamiento simulado con el despliegue en el robot físico.
- Docencia y formación en robótica: su tamaño (450 M de parámetros, 1,2 GB) y licencia Apache 2.0 lo hacen apto para cursos y talleres donde se enseña VLA e imitación sin infraestructura pesada.
- Pruebas de integración de cámaras múltiples: al requerir tres flujos de vídeo sincronizados a 30 FPS, resulta útil para validar la configuración de hardware y calibración de un montaje SO-101.
- Benchmark interno de políticas compactas: como política de tarea única y bajo coste, puede servir de línea base al comparar con modelos VLA mayores en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450 M de parámetros, el peso en precisión nativa ronda 1,2 GB, pero no se documentan requisitos oficiales ni cuantizaciones.
- GPU recomendadas: no disponible. El modelo base SmolVLA se describe como desplegable en hardware de consumo, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable según la descripción del modelo base, pero sin confirmación oficial para esta variante.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de control robótico.
- Latencia y throughput: no disponibles. La captura de cámaras se realiza a 30 FPS y el rollout acepta `--duration` en segundos, pero no se publican métricas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Elbarbary/so101_smolvla_digitaltwin_v2 | 450 M | no disponible | Pick-and-place SO-101 (tarea unica) | apache-2.0 | Hugging Face, 44 descargas |
| Elbarbary/so101_smolvla (modelo base) | no disponible | no disponible | Politica SO-101 base para fine-tuning | no disponible en la informacion | Hugging Face |
| SmolVLA (modelo original del paper) | no disponible | no disponible | VLA generalista compacto | no disponible en la informacion | Paper arXiv:2506.01844 |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Pick up the blue cube and place it in the white box") y un único tipo de robot (`so101_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: la model card indica que no hay resultados de éxito en robot real, por lo que se desconoce su tasa de acierto.
- Dataset pequeño: 50 episodios y 11 233 frames son un volumen reducido, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y montaje concretos.
- Dependencia de hardware específico: requiere el robot SO-101, tres cámaras con nombres e índices concretos y calibración previa; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Sesgos: no documentados; al ser un modelo de control entrenado en un entorno de laboratorio, puede fallar ante cambios de iluminación, objetos distractores o posiciones no vistas.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y del dataset asociado.
- Idiomas y contexto: no disponibles; el modelo no procesa lenguaje natural de forma conversacional más allá de la instrucción de tarea.
- Madurez: 44 descargas y 1 like en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elbarbary/so101_smolvla_digitaltwin_v2
- Modelo base: https://huggingface.co/Elbarbary/so101_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/roboparadigm/real_pick_place_digital_twin
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=roboparadigm/real_pick_place_digital_twin
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
