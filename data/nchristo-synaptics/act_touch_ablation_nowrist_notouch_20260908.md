# nchristo-synaptics/act_touch_ablation_nowrist_notouch_20260908

## Resumen

Este modelo es una política robótica de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por nchristo-synaptics y entrenada con el framework LeRobot. El modelo no es un modelo de lenguaje: es un sistema de control que aprende a ejecutar una tarea concreta de manipulación a partir de demostraciones teleoperadas. En concreto, la política ha sido entrenada para la tarea "place yellow ball in red bowl" (colocar una pelota amarilla en un tazón rojo), usando el robot de tipo `so_follower`.

Arquitectónicamente, ACT es un transformer encoder-decoder que predice secuencias de acciones cortas (chunks) en lugar de pasos individuales, lo que mejora la estabilidad del control. El modelo tiene 51.668.614 parámetros y acepta como entrada el estado del robot (6 dimensiones) y una imagen de la cámara superior (`observation.images.top`), produciendo una salida de acciones de 6 dimensiones. El nombre del repositorio (`act_touch_ablation_nowrist_notouch_20260908`) indica que se trata de una ablación: no se utilizan la cámara de muñeca ni el sensor táctil, a pesar de que la model card menciona la cámara `wrist` en la lista de cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) — transformer encoder-decoder |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; utiliza ventanas de observación fijas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo robótico, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Tipo de robot | `so_follower` |
| Camaras de entrada | `observation.images.top` (3, 240, 320) — la model card también lista `wrist`, pero no aparece en las entradas reales |
| Dataset de entrenamiento | `nchristo-synaptics/touch-vision-v3_20260902_152740` |
| Tarea | "place yellow ball in red bowl" |

## Arquitectura y entrenamiento

El modelo implementa ACT, una técnica de aprendizaje por imitación que divide la ejecución en trozos de acción (action chunks). En lugar de predecir una única acción por paso de tiempo, el transformer genera una secuencia de acciones futuras, lo que permite un control más suave y consistente. El encoder procesa las observaciones (estado del robot y una imagen RGB de la cámara superior) y el decoder genera el chunk de acciones. Esta arquitectura ha demostrado altas tasas de éxito en tareas de manipulación teleoperadas.

El entrenamiento se realizó con LeRobot sobre un dataset de 16 episodios, 6688 frames y una frecuencia de 30 FPS. La configuración de entrenamiento fue de 100.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. Se utilizó la versión 0.6.2 de LeRobot. No se especifica si hubo ajuste fino adicional o técnicas como RLHF/DPO, ya que son conceptos propios de modelos de lenguaje y no aplican a esta política. El nombre del repositorio sugiere que el entrenamiento se realizó como una ablación eliminando la entrada táctil y la cámara de muñeca.

## Capacidades

- Ejecuta una tarea robótica de colocación ("place yellow ball in red bowl") a partir de la observación del estado del robot (6 valores) y una imagen de la cámara superior (240x320).
- Genera acciones de control continuas de 6 dimensiones, compatibles con un robot de tipo `so_follower`.
- Predice chunks de acciones, lo que permite un control anticipado y robusto frente a perturbaciones.
- No soporta generación de texto, tool calling, agentes de razonamiento ni capacidades multilingües: es exclusivamente una política de control para un robot manipulador.
- No dispone de modo de pensamiento, visión multimodal general ni audio.

## Casos de uso

- Automatización de tareas de picking and placing: el modelo puede controlar el robot `so_follower` para que tome una pelota amarilla y la deposite en un tazón rojo, usando solo la cámara superior y el estado del robot.
- Investigación en aprendizaje por imitación: sirve como checkpoint comparativo para analizar el impacto de eliminar la cámara de muñeca y el sensor táctil en tareas de manipulación, gracias a la configuración de ablación.
- Prototipado de control robótico en entornos académicos: al ser un modelo pequeño (aprox. 0,2 GB), es adecuado para laboratorios que necesitan desplegar políticas en robots de bajo coste o en simulación.
- Validación de configuraciones de sensores: permite evaluar si una única cámara superior es suficiente para llevar a cabo una tarea específica, lo que interesa en el dimensionamiento de sistemas de visión en robótica.
- Desarrollo de pipelines con LeRobot: sirve como ejemplo de cómo entrenar y lanzar una política ACT con el framework LeRobot, desde el dataset hasta el rollout en un robot real.
- Bancos de pruebas de curriculum de manipulación: puede integrarse en entornos de evaluación para comparar la eficiencia de distintos métodos de control por imitación (ACT, Diffusion Policy, etc.) sobre la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 ocupan aproximadamente 200 MB; teniendo en cuenta el batch de imágenes durante la inferencia, se recomienda al menos 1–2 GB de VRAM.
- GPU recomendada: cualquier GPU con más de 2 GB de VRAM, como una NVIDIA RTX 3060 o superior. También es posible ejecutar el modelo en CPU, aunque la inferencia será más lenta.
- Soporte en GPU de consumo: sí, cabe holgadamente en tarjetas como la RTX 3060, RTX 4060 o incluso GPU más antiguas con 4 GB de VRAM.
- Opciones de despliegue: el modelo está pensado para ejecutarse con LeRobot (PyTorch). No es aplicable a vLLM, llama.cpp ni Ollama, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del tamaño del chunk de acciones.

## Comparativa con modelos similares

No disponible. No se conocen resultados de benchmarks ni características comparables de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La tarea es única y muy específica: el modelo solo está entrenado para "place yellow ball in red bowl". No generaliza a otros objetos, posiciones ni tareas sin un nuevo entrenamiento.
- Existe una inconsistencia en la model card: se listan las cámaras `wrist` y `top`, pero la entrada real solo incluye `observation.images.top`. El nombre del repositorio indica que la cámara de muñeca no se usa, por lo que el modelo depende únicamente de la cámara superior.
- El dataset de entrenamiento es muy pequeño (16 episodios y 6688 frames), lo que limita la generalización y puede provocar sobreajuste a las condiciones particulares de la demostración original.
- No hay resultados de evaluación oficiales: se desconoce la tasa de éxito real en el robot físico.
- La política es sensible a cambios en la iluminación, la posición de la cámara, el fondo y la geometría de los objetos, ya que no se entrenó con variaciones de estos factores.
- No es un modelo multimodal ni de lenguaje: no puede procesar instrucciones de texto ni mantener conversaciones.
- La licencia Apache-2.0 permite el uso comercial, pero el modelo se distribuye sin garantías de rendimiento ni soporte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nchristo-synaptics/act_touch_ablation_nowrist_notouch_20260908
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/nchristo-synaptics/touch-vision-v3_20260902_152740
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot sobre ACT: https://huggingface.co/docs/lerobot/main/en/act
