# Fork123/smolvla_complex_set1_220eps_ce5Setting

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. A diferencia de los grandes VLA multimodales, SmolVLA apuesta por una arquitectura reducida que puede ejecutarse en hardware de consumo, manteniendo un rendimiento competitivo en tareas de manipulación. El modelo base `lerobot/smolvla_base` ha sido preentrenado y aquí se presenta un fine-tuning específico sobre un conjunto de datos propio.

Esta ficha corresponde a la variante `Fork123/smolvla_complex_set1_220eps_ce5Setting`, un ajuste fino realizado por el usuario Fork123 sobre 220 episodios (96.271 fotogramas a 30 FPS) de una tarea concreta: recoger un perfil de aluminio, usarlo para pulsar un botón rojo luminoso y devolverlo a una zona marcada con cinta amarilla. El modelo opera con tres cámaras (muñeca, frontal y superior) y produce acciones de 6 dimensiones para un robot tipo `so_follower` (SO-100/SO-101 de LeRobot).

La relevancia de esta ficha es doble: por un lado ilustra el flujo típico de fine-tuning de políticas VLA en LeRobot; por otro, documenta un caso de uso industrial concreto (manipulación de objetos alargados y pulsación de botones) que resulta representativo de las tareas de pick-and-place con utillaje. El repositorio no incluye resultados de evaluación en robot real ni benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantización | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en el ejemplo de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/smolvla_base` |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `wrist`, `front`, `top` (3 × 256×256×3) |
| Estado de observación | vector de 6 dimensiones |
| Acción de salida | vector de 6 dimensiones |
| Dataset de entrenamiento | `Fork123/Test5-220eps-complex-set1` (220 episodios, 96.271 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repo | 0,0 GB (según Hugging Face; pesos no verificables desde la metadata) |

## Arquitectura y entrenamiento

SmolVLA es una política VLA compacta que combina un codificador visual, un modelo de lenguaje pequeño y un cabezal de acciones, siguiendo el paradigma de los VLA modernos pero con un presupuesto computacional reducido para permitir despliegue en hardware de consumo. La arquitectura exacta (número de capas, dimensión oculta, tamaño del backbone lingüístico) no se detalla en la información disponible; se remite al paper arXiv:2506.01844 para los detalles del modelo base.

El fine-tuning se realizó sobre el dataset `Fork123/Test5-220eps-complex-set1`, compuesto por 220 episodios de demostración teleoperada de una única tarea compuesta (recoger perfil de aluminio, pulsar botón rojo, devolver a zona amarilla). El entrenamiento usó 20.000 pasos con batch de 64, AdamW y LR 1e-4, semilla 1000, sobre LeRobot 0.6.2. No se especifica si hubo aumento de datos, mezcla con el dataset de preentrenamiento ni técnicas de regularización. Tampoco se documenta el proceso de preentrenamiento del modelo base (composición del dataset, número de tokens, uso de RLHF/DPO), por lo que esos datos deben consultarse en la model card de `lerobot/smolvla_base` y en el paper.

## Capacidades

- Control robótico de manipulación mediante imitación: genera acciones de 6 dimensiones a partir de estado propioceptivo y tres vistas de cámara.
- Ejecución de tareas compuestas de varios pasos: la tarea entrenada encadena agarre, uso de herramienta y colocación.
- Percepción visual multi-cámara: integra información de muñeca, frontal y superior a 256×256.
- Condicionamiento por instrucción en lenguaje natural: la política acepta un `--task` textual que describe el objetivo.
- Inferencia en tiempo real: el ejemplo de la model card usa `lerobot-rollout` con `--duration=60`, lo que sugiere ejecución en bucle a la frecuencia del robot.
- Compatible con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI (`lerobot-train`, `lerobot-rollout`).
- No se documentan capacidades de tool calling, razonamiento multi-paso simbólico, visión general, audio ni modo "thinking"; es una política de control, no un asistente conversacional.

## Casos de uso

- Automatización de pick-and-place con utillaje: el modelo está entrenado exactamente para recoger un perfil de aluminio y usarlo como herramienta; puede integrarse en celdas de montaje donde se requiera manipular objetos alargados para accionar mecanismos.
- Pulsación de botones y actuadores en entornos industriales: la tarea entrenada incluye presionar un botón luminoso, un caso frecuente en líneas de fabricación donde un robot debe interactuar con paneles de control.
- Prototipado rápido de políticas con LeRobot: sirve como plantilla para equipos que quieran adaptar SmolVLA a sus propias tareas con 200-300 episodios y un `so_follower`.
- Investigación en aprendizaje por imitación: al ser un fine-tuning reproducible (semilla, hiperparámetros y dataset públicos), permite estudiar variabilidad y sobreajuste en políticas VLA pequeñas.
- Educación y demos de robótica de bajo coste: al ejecutarse sobre hardware de consumo y brazos SO-100/SO-101, es adecuado para laboratorios docentes.
- Benchmark interno de robustez: la tarea combina agarre, uso de herramienta y colocación, lo que permite medir degradación ante cambios de iluminación, posición de objetos o distracciones.
- Validación de pipelines de entrenamiento: útil para comprobar la integración de LeRobot 0.6.2 con datasets propios y despliegue en robot real antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparación con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al ser un VLA compacto derivado de SmolVLA, está diseñado para "consumer-grade hardware" según la model card, lo que sugiere que cabe en GPUs de consumo (gama RTX 30/40), pero no se proporcionan cifras concretas.
- GPU recomendadas: no disponible. El ejemplo de entrenamiento usa `--policy.device=cuda`, sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? La model card del modelo base afirma que SmolVLA puede desplegarse en hardware de consumo; no se detalla la GPU mínima para este fine-tuning concreto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de control.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS y el ejemplo de rollout usa cámaras a 30 FPS, lo que implica que la política debe inferir al menos a esa frecuencia para control fluido, pero no se confirma que lo logre en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Fork123/smolvla_complex_set1_220eps_ce5Setting` | VLA compacta (fine-tuning) | no disponible | no aplica | 3 cámaras + estado 6D | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | VLA compacta (base) | no disponible | no aplica | multimodal (visión + lenguaje + estado) | Apache 2.0 | Hugging Face |
| Políticas ACT / Diffusion Policy en LeRobot | Políticas de imitación | variable | no aplica | cámaras + estado | según repo | Hugging Face / LeRobot |
| OpenVLA | VLA de gran escala | ~7B (referencia pública) | no disponible aquí | visión + lenguaje | según versión | Hugging Face |

La comparación cuantitativa no es posible con la información disponible: no hay benchmarks publicados para este fine-tuning ni cifras de parámetros del modelo base en la documentación proporcionada. La comparativa se limita a categoría, licencia y formato de despliegue.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse que la política funcione de forma fiable fuera del dataset de entrenamiento.
- Sobreajuste a una única tarea: entrenada exclusivamente para "recoger perfil de aluminio, pulsar botón rojo y devolver a zona amarilla"; no generaliza a otras instrucciones sin reentrenamiento.
- Dependencia del montaje físico: requiere un robot `so_follower` con las tres cámaras en las posiciones (`wrist`, `front`, `top`) y calibración equivalentes a las del dataset; cambios de cámara, iluminación o fondo pueden degradar el rendimiento.
- Dataset pequeño y de un solo operador: 220 episodios y 96.271 fotogramas pueden no cubrir la variabilidad suficiente; no se documenta diversidad de posiciones iniciales ni de condiciones.
- Sesgos de imitación: la política reproduce los sesgos del demostrador (velocidad, trayectorias, agarre), lo que puede ser subóptimo o inseguro en producción.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante estados no vistos, con riesgo físico para el robot y el entorno.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea del ejemplo está en inglés y el condicionamiento lingüístico puede no transferir a otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y del dataset.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validación por la comunidad.
- Tamaño de repo reportado como 0,0 GB: la metadata de Hugging Face no refleja el tamaño real de los pesos, lo que impide estimar requisitos de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fork123/smolvla_complex_set1_220eps_ce5Setting
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Fork123/Test5-220eps-complex-set1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Fork123/Test5-220eps-complex-set1
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
