# 1ys1/areumii-smolvla-real-pickplace-v3

## Resumen

El modelo `1ys1/areumii-smolvla-real-pickplace-v3` es una política de visión-lenguaje-acción (VLA) desarrollada por el usuario 1ys1 como fine-tuning del modelo base `lerobot/smolvla_base`. Está entrenada con el framework LeRobot para controlar un robot manipulador de tipo `areumii` en una tarea concreta de recogida y colocación de objetos: colocar una lata verde en el estante superior y una lata azul en el estante inferior. El modelo procesa tres cámaras RGB de 256x256 píxeles (cabeza, muñeca izquierda y muñeca derecha) junto con un vector de estado de 6 dimensiones, y genera acciones de control de 16 dimensiones.

SmolVLA es un modelo compacto y eficiente que reduce los costes computacionales en comparación con otros VLA y puede desplegarse en hardware de consumo. Este fine-tuning concreto aporta una solución práctica para tareas de manipulación robótica en entornos controlados, sirviendo como referencia para investigación en aprendizaje por imitación y como punto de partida para desarrollos posteriores. El modelo tiene 450.046.176 parámetros y un tamaño de repositorio de 0,9 GB, lo que lo hace adecuado para GPUs de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-Lenguaje-Acción (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto y eficiente que logra un rendimiento competitivo con costes computacionales reducidos, pudiendo desplegarse en hardware de consumo. El modelo presentado es un fine-tuning del modelo base `lerobot/smolvla_base` realizado con el framework LeRobot. Los detalles específicos de la arquitectura interna (número de capas, mecanismos de atención, etc.) no están disponibles en la información proporcionada.

El entrenamiento se realizó durante 30.000 pasos con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje de 0,0001 y semilla 1000. Se utilizó la versión 0.6.1 de LeRobot. El dataset de entrenamiento (`1ys1/areumii-real-pickplace-v3`) contiene 25 episodios y 28.153 frames a 30 FPS, con la tarea de colocar una lata verde en el estante superior y una lata azul en el estante inferior. No se indica la composición detallada del dataset ni si se aplicó RLHF o DPO; el proceso corresponde a aprendizaje por imitación a partir de demostraciones.

## Capacidades

- Generación de acciones de control: predice vectores de acción de 16 dimensiones para el robot manipulador.
- Percepción visual multi-cámara: procesa tres imágenes RGB de 256x256 píxeles procedentes de las cámaras de cabeza, muñeca izquierda y muñeca derecha.
- Integración de estado: combina un vector de estado de 6 dimensiones del robot con las observaciones visuales.
- Aprendizaje por imitación: entrenado a partir de demostraciones humanas de la tarea de recogida y colocación.
- Compatibilidad con LeRobot: se integra en el ecosistema LeRobot para entrenamiento, inferencia y despliegue.
- No soporta tool calling, generación de texto, ni razonamiento simbólico; es una política de control puro.

## Casos de uso

- Automatización de tareas de recogida y colocación en almacenes: el modelo puede ejecutar la tarea específica de colocar latas en estantes, lo que resulta útil en entornos logísticos controlados con posiciones de objetos predefinidas.
- Prototipado de robots manipuladores en investigación: sirve como referencia para comparar políticas de aprendizaje por imitación dentro del framework LeRobot.
- Entrenamiento de robots en laboratorio: se puede desplegar en un robot `areumii` para validar la política en tiempo real mediante el comando `lerobot-rollout`.
- Logística interna: clasificación y colocación de objetos en estanterías, siempre que la tarea coincida con la entrenada.
- Educación en robótica: al ser un modelo ligero y ejecutable en hardware de consumo, facilita demostraciones prácticas en aulas y talleres.
- Evaluación de políticas VLA: se puede utilizar como baseline para comparar con otras variantes del mismo autor (v1, v4) o con otros modelos VLA en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 450M parámetros y un tamaño de repo de 0,9 GB, lo que sugiere pesos en FP16/BF16. Se estima un consumo de aproximadamente 1 GB de VRAM para los pesos, más overhead de inferencia, por lo que se recomienda al menos 2-4 GB de VRAM.
- GPU recomendadas: GPU de consumo con 4 GB o más, como NVIDIA RTX 3050 o RTX 3060; también puede ejecutarse en GPUs de datacenter como T4 o A10.
- Compatibilidad con GPU de consumo: sí, el modelo está diseñado para ejecutarse en hardware de consumo.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`). No se mencionan alternativas como vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| 1ys1/areumii-smolvla-real-pickplace-v3 | 450.046.176 | no disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | no disponible | no disponible | Apache 2.0 | HuggingFace |
| 1ys1/areumii-smolvla-real-pickplace-v1-baseline | no disponible | no disponible | Apache 2.0 | HuggingFace |
| 1ys1/areumii-smolvla-pickplace-v4 | no disponible | no disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos publicados para estos modelos.

## Limitaciones y advertencias

- Entrenado con un dataset reducido (25 episodios, 28.153 frames) para una tarea muy concreta; la generalización a otras tareas u objetos es limitada.
- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento en producción es incierto.
- Requiere la configuración exacta de cámaras (head, left_wrist, right_wrist) y del robot `areumii`; cambios en la iluminación, en la disposición de los objetos o la presencia de distractores pueden degradar el rendimiento.
- No admite instrucciones de lenguaje natural en tiempo de inferencia; la tarea está fijada durante el entrenamiento.
- El modelo no genera texto ni razonamiento; es exclusivamente una política de control robótico.
- La licencia Apache 2.0 permite uso comercial, pero al estar fine-tuneado para un robot específico, su reutilización en otros robots requiere un nuevo entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1ys1/areumii-smolvla-real-pickplace-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii-real-pickplace-v3
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
