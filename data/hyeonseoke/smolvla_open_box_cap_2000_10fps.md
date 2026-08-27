# HyeonseokE/smolvla_open_box_cap_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para robótica de bajo coste y desplegable en hardware de consumo. Este repositorio concreto, `HyeonseokE/smolvla_open_box_cap_2000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` (publicado por Hugging Face) sobre un dataset propio de 100 episodios que captura la tarea de abrir una caja moviendo la tapa hasta un marcador objetivo. El modelo ha sido entrenado con el framework LeRobot y está pensado para ser ejecutado en un robot tipo `so101_follower` con dos cámaras (superior y muñeca izquierda).

Con aproximadamente 450 millones de parámetros, SmolVLA ofrece una alternativa ligera a modelos VLA más grandes, manteniendo un rendimiento competitivo en tareas de manipulación robótica. Su relevancia actual radica en la democratización de la robótica basada en aprendizaje por imitación, permitiendo que investigadores y desarrolladores con recursos limitados puedan entrenar y desplegar políticas robóticas en sus propios robots. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer (SmolVLA) |
| Parametros totales | 450.046.176 (~450M) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible (modelo orientado a acciones robóticas, no a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos de control robótico a partir de observaciones visuales y del estado del robot. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face, y este repositorio es un fine-tuning específico para la tarea de abrir una caja. El entrenamiento se realizó con el framework LeRobot (versión 0.5.1) sobre un dataset de 100 episodios con 28.973 frames a 10 FPS, utilizando el optimizador AdamW con una tasa de aprendizaje de 0.0001, un batch size de 64 y 22.636 pasos de entrenamiento con semilla 2000. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación supervisado.

El modelo consume tres entradas visuales (cámaras `top`, `left_wrist` y una tercera no especificada en la model card, aunque la tabla de inputs indica `camera1`, `camera2` y `camera3`, todas con resolución 256x256) y un vector de estado de 6 dimensiones. Produce una acción de 6 dimensiones (posiciones articulares o velocidades) que se aplica al robot.

## Capacidades

- Control robótico de 6 grados de libertad (acciones articulares) para manipulación de objetos.
- Percepción visual multi-cámara: procesa hasta tres imágenes simultáneas de 256x256 píxeles.
- Aprendizaje por imitación: puede ser fine-tuneado para nuevas tareas con datasets de demostración.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante comandos CLI.
- Soporte para robots tipo `so101_follower` (SO-101), un brazo robótico de bajo coste.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es un policy puramente reactivo para control robótico.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede abrir cajas, empujar botones o agarrar objetos (según los fine-tunings del mismo autor) en entornos controlados, reduciendo la intervención humana en experimentos repetitivos.
- Investigación en robótica de bajo coste: al ser un modelo compacto (450M parámetros), puede ejecutarse en GPUs de consumo, permitiendo a grupos de investigación sin acceso a clústeres caros probar algoritmos de aprendizaje por imitación.
- Prototipado rápido de políticas robóticas: con LeRobot, un investigador puede grabar demostraciones, fine-tunear el modelo base y desplegarlo en un robot SO-101 en cuestión de horas, acelerando el ciclo de iteración.
- Educación en robótica y aprendizaje automático: sirve como ejemplo práctico de entrenamiento de un VLA, con código abierto y documentación completa, ideal para cursos universitarios o talleres.
- Benchmarking de algoritmos de imitación: al ser un modelo estándar con configuración reproducible (semilla, pasos, dataset), puede usarse como referencia para comparar nuevas técnicas de aprendizaje por refuerzo o imitación.
- Despliegue en entornos de producción con robots SO-101: el comando `lerobot-rollout` permite ejecutar la política de forma continua, por ejemplo en una línea de montaje sencilla que requiera abrir contenedores o mover tapas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parámetros y pesos en fp32 (tamaño del repo 0.9 GB, probablemente en fp16 o bf16), la inferencia requiere aproximadamente 1-2 GB de VRAM en fp16, y menos de 1 GB si se cuantiza a int8 (aunque no se proporcionan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 3060) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama media y baja.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot (PyTorch) con el comando `lerobot-rollout`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. Depende de la GPU y del número de cámaras activas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (otros VLA como OpenVLA, RT-2, etc.) en términos de rendimiento y especificaciones. Se puede señalar que es un fine-tuning del modelo base `lerobot/smolvla_base`, y que el mismo autor ha publicado otros fine-tunings para tareas distintas (empujar botones, agarrar objetos), pero no hay datos públicos de comparación. Por tanto, la comparativa se limita a indicar que este modelo es específico para la tarea de abrir cajas, mientras que el base es genérico.

## Limitaciones y advertencias

- No se han reportado resultados de evaluación en robot real; la tasa de éxito es desconocida y puede variar según las condiciones del entorno (iluminación, posición de objetos, calibración de cámaras).
- El modelo está entrenado únicamente para la tarea de abrir una caja con un robot SO-101; no es generalizable a otras tareas sin fine-tuning adicional.
- El dataset de entrenamiento es pequeño (100 episodios), lo que puede provocar sobreajuste y baja robustez ante variaciones no vistas.
- Depende de la configuración exacta de cámaras (tres cámaras con nombres específicos) y del robot; cualquier cambio en la disposición física puede degradar el rendimiento.
- No es un modelo de lenguaje ni de razonamiento; no admite instrucciones en lenguaje natural ni interacción conversacional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se recomienda revisar las licencias de `lerobot/smolvla_base` y del dataset `HyeonseokE/open_box_cap_10fps`.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_open_box_cap_2000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/open_box_cap_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Otros fine-tunings del autor: https://huggingface.co/HyeonseokE/smolvla_phase1_push_button_A2_2000_10fps y https://huggingface.co/HyeonseokE/smolvla_lekiwi_grasp
