# RoboCrafty/smolvla_parol6_pull_container_pick_place_yellow_and_blue_cube

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face como parte del ecosistema LeRobot, diseñado para controlar robots manipuladores mediante imitación visual directa. Este repositorio concreto, publicado por RoboCrafty, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset propio de 44 episodios de manipulación con el brazo robótico Parol6, orientado a una tarea específica: arrastrar un contenedor al centro, colocar dentro un cubo amarillo y otro azul y cerrar la tapa.

El modelo consume observaciones compuestas por el estado articular (vector de 6 dimensiones) y tres cámaras (gripper, topdown e isométrica) a resolución 256×256, y produce un vector de acción de 7 dimensiones. Con 450 millones de parámetros y un repositorio de 0,9 GB, está pensado para inferencia en hardware de consumo, lo que lo hace relevante para laboratorios y aficionados que quieren desplegar políticas VLA sin clústeres de GPU.

La licencia Apache 2.0 y su integración nativa con LeRobot 0.6.1 permiten reutilizarlo, evaluarlo y reentrenarlo con relativa facilidad, aunque su ámbito de aplicación es muy estrecho: es una política de tarea única, no un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA); detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | my_parol6 (brazo Parol6) |
| Camaras | gripper_cam, topdown_cam, isometric_cam |
| Entrada de estado | observation.state, shape (6,) |
| Entrada visual | 3 imagenes de (3, 256, 256) |
| Salida de accion | action, shape (7,) |
| Dataset de entrenamiento | RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube |
| Episodios / frames | 44 episodios, 57.467 frames a 30 FPS |
| Pasos de entrenamiento | 20.000 |
| Batch size | 128 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Seed | 1000 |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 0,9 GB |
| Descargas en HuggingFace | 21 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y una cabeza de predicción de acciones, según se describe en el paper arXiv:2506.01844. El objetivo declarado del método es lograr un rendimiento competitivo en control robótico con un coste computacional reducido, de forma que pueda ejecutarse en hardware de consumo. La model card no detalla la composición interna del transformer, el número de capas ni la estrategia exacta de fusión multimodal, por lo que esos datos deben consultarse en el paper original.

Este checkpoint concreto se ha obtenido por ajuste fino supervisado (imitación) del modelo base `lerobot/smolvla_base` sobre el dataset `RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube`, compuesto por 44 episodios y 57.467 frames grabados a 30 FPS con tres cámaras. El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, batch de 128, optimizador AdamW y learning rate 1e-4 con semilla 1000. No se documenta el uso de RLHF, DPO ni ninguna fase de refinamiento por preferencias; se trata de aprendizaje por imitación puro sobre demostraciones teleoperadas.

## Capacidades

- Control robótico de manipulación extremo a extremo: genera comandos de acción de 7 dimensiones a partir de estado articular e imágenes.
- Percepción visual multicámara: procesa simultáneamente tres vistas (gripper, topdown e isométrica) a 256×256 píxeles.
- Ejecución de una tarea compuesta de varios pasos: arrastrar el contenedor al centro, colocar el cubo amarillo, colocar el cubo azul y cerrar la tapa.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto en el comando de rollout.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No dispone de tool calling, function calling ni capacidades de agente conversacional; no es un modelo de lenguaje generalista.
- Capacidades multilingües: no disponibles (no es un modelo de texto libre).
- No se documentan modos de razonamiento explícito, visión general, audio ni otras capacidades adicionales.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de recogida de cubos y cierre de contenedor sobre el brazo Parol6, adecuado para prototipos de investigación en manipulación.
- Benchmark de políticas VLA en hardware de consumo: sirve como referencia reproducible para comparar técnicas de imitación, dado que el dataset, la configuración y los pesos están publicados.
- Base para ajuste fino con nuevos objetos o posiciones: al derivar de `lerobot/smolvla_base` y entrenarse con LeRobot, puede reentrenarse con un dataset propio mediante `lerobot-train` en pocas horas.
- Docencia y formación en robótica de imitación: el flujo completo (grabación con tres cámaras, entrenamiento supervisado, rollout) es replicable con hardware asequible.
- Evaluación de robustez visual: permite estudiar cómo afectan cambios de iluminación, posición de cámara o distracciones a una política entrenada con solo 44 episodios.
- Integración en pipelines de investigación con LeRobot: útil para validar infraestructura de inferencia (`lerobot-rollout`) antes de escalar a políticas mayores o tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja una tabla de éxito por tarea sin rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; con 450 millones de parámetros en safetensors, el peso en FP32 ronda 1,8 GB y en FP16 unos 0,9 GB, a lo que hay que sumar el coste de los tres codificadores visuales y las activaciones.
- GPU recomendadas: no especificadas; el paper del método base afirma que puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. El control opera a 30 FPS en la grabación del dataset, pero no se especifica la frecuencia de inferencia real.
- Requisitos adicionales: puerto del robot y cámaras OpenCV configurados a 640×480 y 30 FPS en el ejemplo de rollout.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450 M | no disponible | Manipulación Parol6, tarea única | Apache 2.0 | HuggingFace, LeRobot |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para ajuste fino | no disponible en la informacion | HuggingFace |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación por imitación | no disponible en la informacion | HuggingFace, LeRobot |
| Modelos VLA de mayor escala (p. ej. familias tipo OpenVLA) | no disponible | no disponible | Manipulación generalista | no disponible en la informacion | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ámbito muy restringido: la política está entrenada para una única tarea y un único robot (Parol6); no generaliza a otros brazos, objetos o instrucciones sin reentrenamiento.
- Dataset pequeño: solo 44 episodios y 57.467 frames, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y disposición concretas de la escena.
- Sin evaluación publicada: no hay tasas de éxito medidas, por lo que se desconoce su fiabilidad real en producción.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento; un cambio de montaje invalida la política.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones erráticas ante estados fuera de distribución.
- Sesgos: no documentados; al derivar de un dataset propio y reducido, hereda los sesgos de las demostraciones teleoperadas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece garantía ni soporte; conviene citar el paper y LeRobot según indica la model card.
- Idiomas y contexto: no aplicables como modelo de lenguaje; la instrucción de tarea es un texto fijo en inglés.
- Sin datos de cuantización: no se han publicado versiones GGUF ni cuantizadas, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboCrafty/smolvla_parol6_pull_container_pick_place_yellow_and_blue_cube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
