# hungdo2401/smolvla_so101_fallen_plus_mimicgen

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto y eficiente, desarrollado en el ecosistema de LeRobot por Hugging Face, cuyo objetivo es ofrecer políticas de control robótico con un coste computacional reducido y la posibilidad de ejecutarse en hardware de consumo. Este modelo concreto es un fine-tuning de `lerobot/smolvla_base` realizado por el autor `hungdo2401` para la plataforma robótica `so101_mujoco`. Está entrenado para resolver dos tareas de manipulación: recoger una lata caída y colocarla en un contenedor, y recoger una lata y colocarla en un contenedor.

El modelo es una política de aprendizaje por imitación que consume observaciones multimodales (estado del robot y varias imágenes de cámaras) y produce acciones continuas de 6 dimensiones. El dataset de entrenamiento, `hungdo2401/so101_fallen_plus_mimicgen`, contiene 150 episodios y 45.959 fotogramas a 20 FPS. El fine-tuning se llevó a cabo con LeRobot 0.6.2, durante 20.000 pasos de entrenamiento con un batch de 64. La arquitectura compacta del modelo base SmolVLA, descrita en el paper `arxiv:2506.01844`, hace que esta variante sea particularmente interesante para experimentos de robótica en simuladores o en robots de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA). Consultar paper para detalles de arquitectura. |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SmolVLA, un VLA compacto y eficiente que busca mantener un rendimiento competitivo en tareas de robótica con un coste computacional reducido. En esta variante se ha realizado un fine-tuning del modelo base `lerobot/smolvla_base` para el robot SO101 en el simulador MuJoCo, produciendo una política que genera acciones de control de 6 dimensiones.

El entrenamiento se hizo con el dataset `hungdo2401/so101_fallen_plus_mimicgen`, que incluye 150 episodios y 45.959 fotogramas grabados a 20 FPS. Las tareas son "pick up the fallen can and place it in the bin" y "pick up the can and place it in the bin". La configuración de entrenamiento fue de 20.000 pasos, con batch size de 64, optimizador AdamW, learning rate de 0.0001, semilla 1000 y LeRobot 0.6.2. No se mencionan procesos de RLHF ni DPO; se trata de un aprendizaje por imitación supervisado. La novedad técnica principal radica en la eficiencia del propio modelo SmolVLA, orientado a desplegarse en hardware de consumo según su documentación.

## Capacidades

- Generación de acciones de control robótico: produce acciones continuas de 6 dimensiones para el robot SO101 en MuJoCo.
- Percepción multimodal: acepta como entradas el estado del robot (`observation.state`, forma `(6,)`) y cuatro imágenes de cámaras (`observation.images.camera1`, `camera2`, `camera3` con resolución `(3, 256, 256)`, y `empty_camera_0` con `(3, 480, 640)`).
- Aprendizaje por imitación: ejecuta tareas de recogida y colocación de objetos, concretamente la manipulación de una lata para depositarla en un contenedor.
- Integración con LeRobot: compatible con los flujos de entrenamiento e inferencia de LeRobot, incluyendo el comando `lerobot-rollout`.
- Eficiencia computacional: el modelo base SmolVLA está diseñado para operar en hardware de consumo, lo que facilita el despliegue en entornos con recursos limitados.
- No incluye capacidades de generación de texto, razonamiento simbólico, tool calling, soporte multilingüe ni modo de pensamiento.

## Casos de uso

- Evaluación de políticas de manipulación en simulación: el modelo se puede ejecutar con `lerobot-rollout` en el robot `so101_mujoco` para validar el comportamiento de la política en entornos simulados de MuJoCo.
- Investigación en eficiencia de VLA: sirve como referencia para comparar el rendimiento de modelos compactos frente a modelos más grandes en tareas de recogida y colocación.
- Reproducción de experimentos de aprendizaje por imitación: permite reproducir el pipeline de entrenamiento con LeRobot sobre el dataset público `hungdo2401/so101_fallen_plus_mimicgen`.
- Prototipado de robots de bajo coste: al estar orientado a hardware de consumo, es adecuado para probar políticas de control en robots sin GPUs de gama alta.
- Estudio del efecto de datos sintéticos: este fine-tuning incluye datos de tipo `mimicgen` junto con episodios reales; puede usarse para medir cómo afecta la mezcla de datos a la generalización.
- Baseline para tareas de manipulación: puede utilizarse como punto de partida para nuevos fine-tunings sobre el mismo dataset o sobre tareas similares con la plataforma SO101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio contiene pesos safetensors con un tamaño de 5.3 GB, pero no se especifican requisitos de VRAM.
- GPU recomendadas: no disponible. El paper de SmolVLA indica que el modelo puede desplegarse en hardware de consumo, pero no se mencionan modelos concretos de GPU.
- Cabe en GPU de consumo: según la descripción general de SmolVLA, sí, aunque no hay cifras oficiales para este fine-tuning.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) y simulación MuJoCo con el robot `so101_mujoco`. También se puede usar `lerobot-train` para nuevos entrenamientos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación cuantitativa. El autor ha publicado otras variantes del mismo modelo base, como `hungdo2401/smolvla_so101_baseline` y `hungdo2401/smolvla_so101_baseline_plus_mimicgen`, así como el propio modelo base `lerobot/smolvla_base`. No se han publicado especificaciones ni benchmarks de estos modelos, por lo que se indican como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `hungdo2401/smolvla_so101_fallen_plus_mimicgen` | 450.046.176 | No disponible | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | No disponible | No disponible | No disponible | Hugging Face |
| `hungdo2401/smolvla_so101_baseline` | No disponible | No disponible | No disponible | Hugging Face |
| `hungdo2401/smolvla_so101_baseline_plus_mimicgen` | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- No existen resultados de evaluación publicados, por lo que el rendimiento real del modelo no está validado empíricamente.
- El dataset de entrenamiento es pequeño (150 episodios, 45.959 fotogramas) y cubre tareas muy específicas, lo que limita la capacidad de generalización ante variaciones del entorno.
- La política depende de las claves de observación exactas definidas durante el entrenamiento (`camera1`, `camera2`, `camera3`, `empty_camera_0`); cualquier cambio en la configuración de las cámaras puede degradar el rendimiento.
- Está limitado a la plataforma robótica `so101_mujoco`; no es directamente transferible a otros robots sin reentrenamiento.
- No es un modelo de lenguaje ni soporta razonamiento simbólico, por lo que no puede utilizarse para tareas de conversación, generación de texto o tool calling.
- Existe riesgo de que la política genere acciones incorrectas ante estados del sistema fuera de la distribución de los datos de entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, deben revisarse las condiciones del dataset y el paper original antes de un despliegue en producción.

## Enlaces

- Model card: https://huggingface.co/hungdo2401/smolvla_so101_fallen_plus_mimicgen
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/hungdo2401/so101_fallen_plus_mimicgen
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
