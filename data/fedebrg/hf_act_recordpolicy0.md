# fedebrg/hf_act_recordpolicy0

## Resumen

El modelo fedebrg/hf_act_recordpolicy0 es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada en el marco de LeRobot. Su autor, fedebrg, la ha entrenado para que un robot manipulador tipo so_follower ejecute la tarea «Grab the box» a partir de una cámara frontal y del estado del robot. El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y se distribuye con licencia Apache 2.0.

ACT es un método que predice pequeños fragmentos de acciones (action chunks) en lugar de una sola acción por paso, lo que reduce la acumulación de errores durante la ejecución. Este modelo concreto se ha entrenado en un dataset diminuto con 2 episodios y 892 fotogramas, a 30 FPS, en el repositorio fedebrg/record-test_20260904_183732. La arquitectura consume como entradas el estado del robot (6 dimensiones) y una imagen de cámara de 480x640, y devuelve acciones de 6 dimensiones.

La relevancia de este modelo es principalmente didáctica y de prototipado: sirve como ejemplo de una política entrenada con LeRobot, demuestra la viabilidad de entrenar un modelo de control robótico con una GPU estándar y puede utilizarse como punto de partida para experimentos de aprendizaje por imitación. No obstante, su reducido tamaño y la escasez de datos limitan su generalización y fiabilidad en entornos distintos al de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (ACT: Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 (~51,7 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un modelo basado en transformers que aprende a mapear observaciones (estado e imagen) a una secuencia de acciones futuras, llamada chunk. En lugar de emitir una acción por cada paso de control, predice un bloque de acciones, lo que reduce el error acumulado y suaviza el control. El modelo se entrenó con LeRobot v0.6.2, usando el optimizador AdamW, una tasa de aprendizaje de 1e-5, batch size de 8 y 200 pasos de entrenamiento, con semilla 1000.

El dataset de entrenamiento proviene de fedebrg/record-test_20260904_183732 y contiene 2 episodios, 892 fotogramas, grabados a 30 FPS, para la tarea «Grab the box». La entrada incluye observation.state (6,) y observation.images.front (3, 480, 640), mientras que la salida es action (6,). No se ha aplicado RLHF ni DPO; se trata de aprendizaje por imitación supervisado.

## Capacidades

- Predicción de secuencias de acciones (action chunking) para robots manipuladores.
- Control de un robot so_follower a partir de imágenes de cámara frontal (480x640) y estado de 6 dimensiones.
- Aprendizaje por imitación de la tarea específica «Grab the box» a partir de datos teleoperados.
- No genera texto, código ni razonamiento: no es un modelo de lenguaje.
- No soporta tool calling ni integración como agente en el sentido de los grandes modelos de lenguaje.
- Capacidades multilingües: no aplica.
- Sin soporte de modo de pensamiento ni de audio.

## Casos de uso

- Agarre de objetos en brazos robóticos compactos: el modelo puede gobernar un robot so_follower que debe recoger una caja, replicando la habilidad aprendida durante la teleoperación.
- Investigación en aprendizaje por imitación: sirve como baseline ligero para comparar con políticas más complejas (por ejemplo, diffusion policy) en entornos similares, gracias a su bajo coste de entrenamiento.
- Prototipado rápido de políticas en laboratorio: al entrenarse en solo 200 pasos, permite validar configuraciones de cámaras y sensores en minutos.
- Docencia y demos de robótica: por su tamaño reducido, es fácil de cargar y ejecutar en equipos de laboratorio para explicar el pipeline de LeRobot.
- Automatización de tareas de picking repetitivas: para procesos controlados donde la posición del objeto y la iluminación son constantes, el modelo puede sustituir la programación tradicional de movimientos.
- Evaluación de robustez y sobreajuste: al disponer de un dataset con solo 2 episodios, se puede utilizar para estudiar la velocidad de sobreajuste de un modelo ACT y qué ocurre al variar la distribución de las observaciones.
- Integración en pipelines de LeRobot: gracias a la compatibilidad con `lerobot-rollout`, puede desplegarse directamente en un robot para ejecutar la política en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en float32 ocupa alrededor de 206 MB, por lo que se estima que una GPU con al menos 2 GB de VRAM es suficiente. En entrenamiento con LeRobot y batch size de 8, se recomienda una GPU con 6 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4090, A100, H100) con soporte CUDA y al menos 2 GB de VRAM.
- Cabe en GPUs de consumo: sí, como RTX 3060, e incluso en GPUs antiguas con 4 GB de VRAM.
- Opciones de despliegue: LeRobot (PyTorch); el comando `lerobot-rollout` carga la política y la ejecuta en el robot. No es aplicable a vLLM, llama.cpp ni Ollama al tratarse de un modelo de política robótica, no de un modelo de lenguaje.
- Latencia y throughput: no disponible. La latencia dependerá del hardware, del tamaño de los chunks de acción y del preprocesado de imágenes.

## Comparativa con modelos similares

No se disponen de modelos comparables en la información proporcionada. Existen en HuggingFace otras políticas ACT publicadas con LeRobot, pero no se han proporcionado sus especificaciones ni resultados, por lo que la comparativa es no disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento contiene únicamente 2 episodios y 892 fotogramas, lo que produce un modelo muy propenso al sobreajuste y con escasa generalización.
- La tarea está fijada a «Grab the box»; ante variaciones de iluminación, posición del objeto, distracciones o cambios en la cámara, la política puede fallar.
- No se han presentado resultados de evaluación en entornos reales; no hay métricas de éxito.
- El modelo consume una sola cámara frontal y un estado de 6 dimensiones; no admite otros sensores ni cámaras adicionales sin reentrenar.
- Riesgo de alucinación en el sentido de que el modelo puede emitir acciones incorrectas cuando las observaciones difieren del entrenamiento.
- La dependencia de LeRobot v0.6.2 puede generar incompatibilidades en versiones posteriores del framework.
- La licencia Apache 2.0 permite el uso comercial, pero los términos del dataset asociado no están documentados; es necesario verificar antes de cualquier uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/fedebrg/hf_act_recordpolicy0
- Paper original de ACT: https://huggingface.co/papers/2304.13705 (también https://arxiv.org/abs/2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/fedebrg/record-test_20260904_183732
