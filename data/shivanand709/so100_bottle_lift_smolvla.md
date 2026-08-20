# Shivanand709/SO100_bottle_lift_SmolVLA

## Resumen

Shivanand709/SO100_bottle_lift_SmolVLA es un modelo de visión-lenguaje-acción (VLA) de 450 millones de parámetros, resultado de un fine-tuning del modelo base [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base) sobre el dataset real `arunabh-ramesh/so101_lift_real`. Desarrollado con el framework [LeRobot](https://github.com/huggingface/lerobot) de Hugging Face, este modelo está diseñado para controlar un robot manipulador SO-100 (SO Follower) en la tarea específica de levantar una botella y colocarla en un vaso, a partir de tres cámaras RGB y el estado propioceptivo del robot.

El modelo pertenece a la familia SmolVLA, una arquitectura compacta y eficiente pensada para ejecutarse en hardware de consumo, a diferencia de VLAs masivos como OpenVLA (7B). Su relevancia actual radica en que democratiza la robótica de imitación: permite entrenar y desplegar políticas robóticas en robots de bajo coste como el SO-100, con un presupuesto computacional reducido. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, con un tamaño de repositorio de 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en SmolVLA (transformador multimodal con action expert) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de accion, no de texto generativo) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizacion publicada) |
| Idiomas soportados | no disponible (la instruccion de la tarea esta en ingles, pero no se documenta soporte multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un modelo de lenguaje multimodal compacto (SmolVLM, de la familia Smol) con un "action expert" que traduce las características contextuales en comandos de acción para el robot. La entrada incluye tres vistas de cámara RGB de 256x256 píxeles y un vector de estado de 6 dimensiones (posición de las articulaciones del SO-100); la salida es un vector de acción de 6 dimensiones que controla los motores del robot. El modelo base fue preentrenado en datos multimodales a gran escala y posteriormente adaptado mediante aprendizaje por imitación (behavior cloning) supervisado, sin uso de RLHF ni DPO.

Este fine-tuning concreto se entrenó durante 20.000 pasos con un tamaño de lote de 16, optimizador AdamW, tasa de aprendizaje de 0,0001 y semilla 1000, sobre un dataset real de 76 episodios (41.959 fotogramas a 30 FPS) que recoge la tarea "pick up the bottle and place in the cup". El entrenamiento se realizó con LeRobot versión 0.6.1. No se han publicado detalles adicionales sobre la composición exacta del dataset ni sobre técnicas de regularización específicas.

## Capacidades

- Control de robot manipulador SO-100 (SO Follower) mediante comandos de acción de 6 dimensiones.
- Percepción multimodal con tres cámaras RGB simultáneas (resolución 256x256).
- Ejecución de tareas de manipulación aprendidas por imitación, concretamente pick-and-place de botellas.
- Seguimiento de instrucciones en lenguaje natural (la tarea se define textualmente como "pick up the bottle and place in the cup").
- Inferencia en tiempo real (30 FPS de entrada) sobre hardware de consumo.
- Integración nativa con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio: el modelo puede controlar un SO-100 para recoger objetos pequeños (botellas, piezas) y depositarlos en contenedores, útil en experimentos de robótica y líneas de montaje a pequeña escala.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a variaciones de iluminación y posición de objetos.
- Prototipado rápido de políticas robóticas con LeRobot: al ser un fine-tuning ligero, permite iterar sobre nuevas tareas con pocos datos y recursos computacionales limitados.
- Educación en robótica y visión por computador: los estudiantes pueden desplegar el modelo en un SO-100 para comprender el flujo completo de entrenamiento e inferencia de un VLA.
- Benchmarking de VLAs compactos: al compararlo con modelos más grandes (OpenVLA, RT-2), sirve para evaluar el equilibrio entre rendimiento y coste computacional en tareas de manipulación real.
- Desarrollo de asistentes robóticos de bajo coste: integrable en proyectos maker o de automatización doméstica donde se requiera un brazo manipulador controlado por visión y lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política concreta. Se desconoce la tasa de éxito en el robot real y no existen comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 450M de parámetros y pesos en FP32 (~1,8 GB) o FP16 (~0,9 GB), se estima que cabe en GPUs con 2-4 GB de VRAM, incluyendo memoria para activaciones y buffers.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) es suficiente para inferencia; para entrenamiento se recomienda 8 GB o más.
- Compatibilidad con hardware de consumo: sí, es el objetivo principal de SmolVLA; puede ejecutarse en portátiles con GPU integrada en modos de baja precisión, aunque no está documentado.
- Opciones de despliegue: a través de LeRobot CLI (`lerobot-rollout`), con soporte para inferencia en CPU y GPU. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. Dado el tamaño y la resolución de entrada, se espera una inferencia en tiempo real (30 FPS) en GPU consumer, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shivanand709/SO100_bottle_lift_SmolVLA | 450M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M | no disponible | competitivo en tareas de manipulación (segun paper, sin datos concretos) | Apache 2.0 | Hugging Face |
| OpenVLA (openvla/openvla-7b) | 7B | no disponible | superiores en benchmarks generales, pero requiere hardware de gama alta | MIT | Hugging Face |

La comparación se limita a aspectos estructurales: SmolVLA es un orden de magnitud más pequeño que OpenVLA, lo que permite despliegue en hardware de consumo, pero a costa de menor capacidad de generalización a tareas diversas. No se dispone de comparativas numéricas de rendimiento entre ambos en la información consultada.

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea (levantar botella y colocarla en vaso) y un robot concreto (SO-100); no generaliza a otras tareas u otros robots sin un nuevo fine-tuning.
- No se han publicado resultados de evaluación en el robot real; se desconoce su tasa de éxito y robustez ante variaciones de iluminación, posición de objetos o distracciones.
- El dataset de entrenamiento es reducido (76 episodios), lo que puede provocar sobreajuste a las condiciones específicas de captura.
- No se documentan capacidades multilingües; la instrucción está en inglés y el modelo podría no responder correctamente a instrucciones en otros idiomas.
- Al ser un modelo de acción, no genera texto ni razonamiento explicativo; su salida es exclusivamente un vector de control.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset (arunabh-ramesh/so101_lift_real) por si tuviera restricciones adicionales de uso.
- No se proporcionan garantías de seguridad para operación autónoma; es necesario supervisión humana en entornos reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Shivanand709/SO100_bottle_lift_SmolVLA)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Paper SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Blog de Hugging Face sobre SmolVLA](https://huggingface.co/blog/smolvla)
- [Documentación de LeRobot para SmolVLA](https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx)
- [Guía de montaje del robot SO-100](https://huggingface.co/docs/lerobot/so100)
- [Repositorio GitHub con utilidades para SO-100 y SmolVLA](https://github.com/ajinkyagorad/smol-vla-lerobot-so100)
- [Dataset arunabh-ramesh/so101_lift_real](https://huggingface.co/datasets/arunabh-ramesh/so101_lift_real)
