# ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v03_loose

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico mediante aprendizaje por imitación y desplegable en hardware de consumo. Este repositorio concreto, publicado por el usuario ethanCSL, es un ajuste fino del modelo base `lerobot/smolvla_base` para una tarea específica de manipulación bimanual con el robot OpenArm: coger una lata de Pringles con el brazo derecho y pasarla al brazo izquierdo.

El modelo consume observaciones multimodales (estado de las articulaciones y tres cámaras: cuerpo, muñeca y muñeca derecha) y emite un vector de acción de 16 dimensiones a 30 FPS. Con 450 millones de parámetros y un repositorio de 0,9 GB, está pensado para ejecutarse en tiempo real en GPUs de gama media, lo que lo sitúa en la categoría de políticas VLA ligeras frente a alternativas de miles de millones de parámetros.

La relevancia de esta ficha radica en que ilustra el flujo completo de LeRobot: grabación de datos reales y simulados, ajuste fino supervisado del modelo base y despliegue mediante `lerobot-rollout`. Es una política de propósito único, sin resultados de evaluación publicados, por lo que debe tratarse como un artefacto experimental de investigación más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, familia SmolVLA |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de acción, sin ventana de contexto textual declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Tipo de robot | openarm_umeow |
| Cámaras | body_cam, wrist_cam, right_wrist_cam |
| Entrada de estado | observation.state, forma (6,) |
| Entradas visuales | 3 × (3, 256, 256) |
| Salida | action, forma (16,) |
| Frecuencia de datos | 30 FPS |
| Librería | lerobot 0.6.2 |
| Pipeline | robotics |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es una política de visión-lenguaje-acción que combina un codificador visual y un codificador de lenguaje con un cabezal de acciones, siguiendo el diseño descrito en el paper arXiv:2506.01844. El modelo procesa tres flujos de imagen de 256×256 píxeles junto con un vector de estado de 6 dimensiones y genera directamente un vector de acción de 16 dimensiones, sin bucle de planificación explícito. El ajuste fino se realizó sobre `lerobot/smolvla_base` mediante aprendizaje por imitación supervisado, no mediante RLHF ni DPO.

El entrenamiento utilizó el dataset `ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v03_loose`, compuesto por 148 episodios y 38.223 fotogramas a 30 FPS, con una única tarea: «Pick up the Pringles can with the right arm, hand it to the left arm». La configuración reportada incluye 20.000 pasos de entrenamiento, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. El nombre del dataset sugiere una mezcla de datos reales y simulados, aunque la proporción exacta no está documentada. No se declaran innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Control robótico de manipulación bimanual: genera acciones de 16 dimensiones para el robot OpenArm a partir de observaciones visuales y propioceptivas.
- Percepción multimodal: integra tres cámaras simultáneas (cuerpo, muñeca izquierda y muñeca derecha) con resolución de 256×256.
- Ejecución de una tarea concreta de pick-and-place: recoger una lata de Pringles con el brazo derecho y entregarla al brazo izquierdo.
- Inferencia en tiempo real: diseñado para operar a 30 FPS en hardware de consumo.
- Despliegue mediante CLI de LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- Ajuste fino adicional: puede servir como punto de partida para otras tareas del mismo robot.
- No se declara soporte de tool calling, agentes multi-paso, capacidades conversacionales ni procesamiento de audio.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta la transferencia de objetos entre brazos con una política entrenada específicamente, adecuada para tareas repetitivas de manipulación donde la variabilidad de posiciones es moderada.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible del flujo LeRobot (grabación, entrenamiento, despliegue) para comparar metodologías de VLA compactos.
- Prototipado rápido de políticas bimanuales: al partir de `smolvla_base` y requerir solo 20.000 pasos de ajuste fino, permite iterar sobre nuevas tareas con datasets pequeños (148 episodios).
- Validación de transferencia sim-a-real: el dataset combina datos reales y simulados, lo que permite estudiar la brecha de dominio en políticas VLA de bajo coste computacional.
- Docencia y formación en robótica: el modelo cabe en GPUs de consumo y su licencia Apache 2.0 facilita su uso en cursos y laboratorios.
- Benchmark de políticas ligeras: con 450 M de parámetros sirve como línea base para comparar arquitecturas VLA más grandes en tareas de manipulación acotadas.
- Despliegue en robots de bajo coste: el robot OpenArm y el requisito de hardware moderado lo hacen viable en plataformas económicas de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito, métricas de precisión de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en precisión FP32 el peso ronda 1,8 GB, y en FP16 aproximadamente 0,9 GB, a lo que hay que sumar el coste de los tres flujos visuales de 256×256.
- GPU recomendadas: no declaradas por el autor; por tamaño, una RTX 4090, RTX 3090 o incluso GPUs de gama media con 8 GB o más deberían ser suficientes para inferencia en tiempo real.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM, aunque el dato no está confirmado en la documentación.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), con soporte de LeRobot 0.6.2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: el modelo está diseñado para operar a 30 FPS, pero no se publican mediciones de latencia por paso de inferencia ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ethanCSL/openarm_pringles_... (este) | 450 M | 3 cámaras 256×256 + estado (6,) | Pick-and-place bimanual OpenArm | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | Base VLA generalista para ajuste fino | no disponible en la información | Hugging Face (modelo base) |
| Otras políticas VLA de gran tamaño (p. ej. familias de miles de millones de parámetros) | no disponible | no disponible | Manipulación general | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de rendimiento de esta política ni de su modelo base en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no existen tasas de éxito ni validación en robot real, por lo que se desconoce su robustez fuera de las condiciones de entrenamiento.
- Propósito único: la política está entrenada exclusivamente para la tarea «Pick up the Pringles can with the right arm, hand it to the left arm»; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de hardware específico: requiere el robot OpenArm (`openarm_umeow`) y tres cámaras con nombres e índices concretos; cualquier cambio en la configuración invalida la política.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso o validación externa.
- Dataset pequeño: 148 episodios y una sola tarea limitan la diversidad de posiciones, iluminación y distractores cubiertos.
- Riesgo de sobreajuste al entorno de grabación: al no documentarse variaciones de dominio, es probable que el rendimiento caiga ante cambios de iluminación, posiciones de objeto o robots distintos.
- Idiomas y sesgos: no aplica evaluación de sesgos lingüísticos, pero el modelo puede heredar sesgos visuales del dataset de entrenamiento, no documentados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF, ONNX ni INT8, lo que limita el despliegue en hardware muy restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v03_loose
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v03_loose
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_pringles_lerobot_real_and_sim_10_3cam_v03_loose
