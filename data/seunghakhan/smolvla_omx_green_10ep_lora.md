# SeunghakHan/smolvla_omx_green_10ep_lora

## Resumen
SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico por imitación con costes computacionales reducidos y despliegue en hardware de consumo. Esta ficha concreta, `smolvla_omx_green_10ep_lora`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario SeunghakHan sobre un conjunto de datos propio de 30 episodios y 12.741 fotogramas a 30 FPS, correspondiente a la tarea "Pick up the green block and place it in the box." con un robot de tipo `omx_follower` y tres cámaras (front, top y una tercera no documentada).

El modelo resuelve el problema de la política de imitación específica de tarea: consume el estado articular de 6 dimensiones y tres imágenes RGB de 256x256, y produce un vector de acción de 6 dimensiones. Su relevancia radica en que demuestra el flujo de trabajo de fine-tuning de SmolVLA sobre datos propios con LeRobot 0.6.1, aunque se trata de un artefacto de investigación sin evaluación publicada ni métricas de éxito en robot real.

La información disponible no incluye detalles sobre el número de parámetros, la longitud de contexto ni los idiomas soportados, ya que se trata de una política robótica y no de un modelo de lenguaje conversacional. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica como modelo conversacional) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento
SmolVLA es un modelo de visión-lenguaje-acción compacto descrito en el paper arXiv:2506.01844, orientado a conseguir rendimiento competitivo con costes computacionales reducidos y despliegue en hardware de consumo. La información proporcionada no detalla la arquitectura interna (composición del codificador visual, del modelo de lenguaje ni del cabezal de acciones), por lo que no es posible especificar capas, dimensión oculta ni mecanismos de atención.

El fine-tuning se realizó con LeRobot 0.6.1 durante 20.000 pasos, batch size 1, optimizador AdamW, learning rate 0.0001 y semilla 1000, presumiblemente con LoRA según el nombre del repositorio (aunque la configuración de LoRA no se detalla). El dataset de entrenamiento contiene 30 episodios y 12.741 fotogramas a 30 FPS, con una única tarea de manipulación. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades
- Política de imitación para manipulación robótica: genera acciones de 6 dimensiones a partir de estado articular y tres vistas de cámara.
- Entrada multimodal: `observation.state` (6,) más tres imágenes `observation.images.camera1/2/3` de (3, 256, 256).
- Salida de acción continua de 6 grados de libertad (`action` de shape (6,)).
- Ejecución de una tarea concreta de pick-and-place: "Pick up the green block and place it in the box."
- Integración con el stack LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, visión general, audio ni modo thinking.

## Casos de uso
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger el bloque verde y colocarlo en la caja sobre un robot `omx_follower`, sirviendo como base para experimentos de manipulación con tres cámaras.
- Prototipado rápido de políticas VLA: al ser un fine-tuning de `lerobot/smolvla_base` con 20.000 pasos y batch 1, sirve como plantilla para validar el pipeline de entrenamiento de LeRobot en hardware propio.
- Investigación en imitación con múltiples cámaras: la combinación de vistas front y top (más una tercera cámara) permite estudiar el efecto de la fusión visual en tareas de manipulación.
- Reproducción de experimentos: el dataset público `juwon777/omx_green_dualcam_20261116_112902` y la configuración de entrenamiento documentada permiten replicar el fine-tuning y comparar variantes.
- Despliegue en hardware de consumo: SmolVLA está diseñado para ejecutarse en hardware de gama consumer, lo que facilita pruebas en estaciones de trabajo con GPU no enterprise.
- Docencia y demostraciones de LeRobot: el comando `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política durante 60 segundos sin grabar episodios, útil para talleres y demos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; SmolVLA se describe como desplegable en hardware de consumo, pero no se especifican cifras.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: el paper base indica despliegue en hardware de consumo, sin detallar modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento), con `--policy.device=cuda` en entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos en robot real, por lo que no se puede afirmar su fiabilidad.
- Especialización extrema: entrenado para una única tarea y un único tipo de robot (`omx_follower`); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- Dataset pequeño: 30 episodios y 12.741 fotogramas, con batch size 1 y 20.000 pasos, lo que limita la robustez frente a variaciones de iluminación, posiciones de objetos o distracciones.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento; una configuración distinta invalida la política.
- Riesgo de sobreajuste al entorno de grabación: no se documentan variaciones de escena ni distractores.
- Sesgos: no disponibles; al ser una política robótica, los sesgos relevantes serían de distribución visual y de dinámica del robot, no documentados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SeunghakHan/smolvla_omx_green_10ep_lora
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/juwon777/omx_green_dualcam_20261116_112902
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=juwon777/omx_green_dualcam_20261116_112902
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
