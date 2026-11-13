# Fork123/smolvla_complex_set1_220epsGood_ce5Setting

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. Esta ficha concreta, `Fork123/smolvla_complex_set1_220epsGood_ce5Setting`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre un dataset propio de 220 episodios, orientado a una tarea específica de manipulación con un robot `so_follower` y tres cámaras.

El modelo resuelve el problema de convertir observaciones multimodales (estado articular de 6 dimensiones más tres vistas RGB de 256x256) en comandos de acción de 6 dimensiones a 30 FPS. Frente a políticas VLA de mayor tamaño, SmolVLA busca un equilibrio entre capacidad y coste computacional, lo que permite entrenar y ejecutar políticas sobre GPUs no empresariales.

Es relevante ahora porque el fine-tuning de políticas VLA sobre datasets pequeños y tareas concretas se ha convertido en el flujo de trabajo habitual en robótica de imitación, y este repositorio documenta de forma explícita la configuración de entrenamiento (20000 pasos, batch 64, AdamW, LR 1e-4) y el dataset empleado. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según SmolVLA (arXiv:2506.01844) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje conversacional) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural de forma conversacional; recibe una instrucción de tarea fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.camera1` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera2` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera3` | VISUAL | `(3, 256, 256)` |
| `action` | ACTION | `(6,)` |

Configuración de entrenamiento declarada:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 20000 |
| Tamaño de batch | 64 |
| Optimizador | AdamW |
| Learning rate | 0.0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Modelo base | `lerobot/smolvla_base` |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist`, `front`, `top` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `lerobot/smolvla_base`, que implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. Se trata de una política visión-lenguaje-acción compacta que combina un codificador visual, un codificador de instrucción de tarea y un cabezal de acciones, entrenada mediante aprendizaje por imitación a partir de demostraciones teleoperadas. La información proporcionada no detalla la composición interna de capas, el número de parámetros ni innovaciones específicas como decodificación especulativa o atención lineal.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Fork123/Test5-good-220eps-complex-set1`, compuesto por 220 episodios y 90612 frames a 30 FPS, con una única instrucción de tarea: recoger un perfil de aluminio, usarlo para pulsar un botón de brillo rojo y devolver el perfil a la zona de cinta amarilla. Se ejecutaron 20000 pasos con batch 64, optimizador AdamW y learning rate 1e-4, con semilla 1000. No se documenta el uso de RLHF, DPO ni otras fases de alineación posteriores al entrenamiento por imitación.

## Capacidades

- Generación de comandos de acción de 6 dimensiones a partir de observaciones de estado y tres vistas de cámara.
- Control robótico de manipulación en el robot `so_follower` para la tarea específica de recogida, pulsación y retorno de un objeto.
- Fusión multimodal de tres flujos visuales (muñeca, frontal y superior) con el estado articular.
- Condicionamiento por instrucción de tarea en lenguaje natural (una única instrucción fija de entrenamiento).
- Ejecución de políticas en bucle cerrado mediante `lerobot-rollout` con estrategia base.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües amplias ni modos de pensamiento.

## Casos de uso

- Automatización de una celda de pick-and-place con pulsación de botón: la política ejecuta la secuencia completa (recoger perfil, pulsar botón, devolver a zona marcada) en el robot `so_follower`, aprovechando las tres cámaras para localizar objeto y destino.
- Prototipado rápido de tareas de manipulación en laboratorio: al estar fine-tuneado sobre 220 episodios, sirve como punto de partida para evaluar la viabilidad de una tarea antes de escalar el dataset.
- Investigación en aprendizaje por imitación: el repositorio documenta hiperparámetros completos (20000 pasos, batch 64, LR 1e-4, semilla 1000), lo que facilita reproducir o comparar experimentos de fine-tuning de SmolVLA.
- Base para fine-tuning adicional en tareas similares de recogida y colocación: al derivar de `lerobot/smolvla_base` con licencia Apache 2.0, puede reentrenarse con nuevos datasets manteniendo el mismo pipeline de LeRobot.
- Validación de pipelines de datos robóticos: el dataset asociado (90612 frames a 30 FPS) y el comando de rollout permiten verificar la integración entre grabación, entrenamiento e inferencia en LeRobot 0.6.2.
- Despliegue en hardware de consumo para demos: SmolVLA está diseñado para ejecutarse en hardware de gama consumer según el paper, lo que permite montar demostraciones de la tarea sin GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros totales ni cuantizaciones).
- GPU recomendadas: no disponible de forma específica; el paper de SmolVLA indica que está pensado para hardware de consumo.
- Compatibilidad con GPU consumer: el diseño del modelo base apunta a que sí es desplegable en GPUs de consumo, pero no se confirma para este checkpoint concreto.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia base) y `lerobot-train` para reentrenamiento con `--policy.device=cuda`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de acción.
- Latencia y throughput: no disponibles; la política opera en un entorno de captura a 30 FPS según el dataset, pero no se declara la tasa de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Fork123/smolvla_complex_set1_220epsGood_ce5Setting` | no disponible | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible | no aplica | según paper arXiv:2506.01844 | no disponible en la información | Hugging Face |
| Otras políticas VLA de la familia LeRobot (p. ej. pi0, ACT) | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos cuantitativos para establecer una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay resultados de éxito en robot real, ni número de ensayos, ni tasa de acierto, por lo que el rendimiento es desconocido.
- Especialización extrema: entrenado para una única instrucción de tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración de cámaras: las claves de observación (`camera1`, `camera2`, `camera3`) deben coincidir exactamente con las usadas en entrenamiento; una configuración distinta invalida la política.
- Dataset pequeño: 220 episodios y 90612 frames limitan la robustez frente a variaciones de iluminación, posiciones de objetos o distractores.
- Riesgo de sobreajuste al entorno de grabación: no se documentan pruebas con objetos desplazados, cambios de iluminación ni robots distintos del mismo tipo.
- Idiomas: no disponible; el condicionamiento lingüístico se limita a la instrucción fija de entrenamiento.
- Sesgos: no documentados por el autor; en robótica de imitación los sesgos provienen de la distribución del dataset de demostración.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el repo figura con 0 GB de tamaño reportado y 0 descargas, lo que sugiere un artefacto recién subido y no validado por la comunidad.
- Fecha de creación declarada (2026-11-12): conviene verificar la integridad y vigencia de los artefactos antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fork123/smolvla_complex_set1_220epsGood_ce5Setting
- Dataset de entrenamiento: https://huggingface.co/datasets/Fork123/Test5-good-220eps-complex-set1
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Fork123/Test5-good-220eps-complex-set1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
