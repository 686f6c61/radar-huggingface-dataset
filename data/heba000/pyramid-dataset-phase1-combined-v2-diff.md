# heba000/pyramid-dataset-phase1-combined-v2-diff

## Resumen

Este modelo es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot para ejecutar una tarea de manipulación robótica: colocar un vaso en el primer nivel para construir una pirámide. Lo desarrolla el usuario heba000 y se publica en Hugging Face con licencia Apache-2.0. El modelo combina una entrada visual (imagen de una cámara frontal) con el estado del robot (posición de las articulaciones) para generar secuencias de acción suaves y multimodales, una característica propia de los modelos de difusión aplicados a robótica.

Con 262,96 millones de parámetros, el modelo es relativamente compacto para una política de difusión. Se entrenó con 163 episodios y más de 86 000 fotogramas a 30 FPS, durante 30.000 pasos de entrenamiento. Al estar diseñado para el entorno LeRobot, se puede desplegar directamente en robots SO-Follower compatibles mediante los scripts de rollout proporcionados.

La relevancia de este modelo radica en que demuestra cómo las técnicas de difusión generativa, originalmente desarrolladas para imágenes, se adaptan al control visuomotor. Su publicación en abierto permite a desarrolladores e investigadores reproducir los experimentos, modificar la tarea o aplicar la misma arquitectura a otros problemas de manipulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (UNet condicionado por observaciones) |
| Parámetros totales | 262.962.942 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, que trata el control visuomotor como un proceso de difusión generativa. A partir de una observación (imagen de cámara frontal de 480×640 y vector de estado de 6 dimensiones), genera una secuencia de acciones de 6 dimensiones mediante un proceso iterativo de denoising. La arquitectura concreta (tipo de UNet, número de bloques residuales, etc.) no se detalla en la información disponible, pero sigue la implementación de LeRobot.

El entrenamiento se realizó con el dataset heba000/pyramid-dataset-phase1-combined-v2, que contiene 163 episodios y 86.448 fotogramas a 30 FPS. El proceso utilizó el optimizador Adam con una tasa de aprendizaje de 0.0001, un batch de 8 y 30.000 pasos de entrenamiento. No se indica el uso de técnicas de refuerzo o DPO; es un entrenamiento de imitación supervisada estándar para políticas de difusión.

## Capacidades

- Control visuomotor para manipulación robótica, generando acciones de 6 dimensiones (posición y orientación del efector final) a partir de imagen y estado del robot.
- Generación de trayectorias suaves y multimodales gracias a la naturaleza difusa del modelo, lo que evita comportamientos bruscos y favorece tareas de contacto.
- Entrenamiento con el pipeline de LeRobot, lo que permite reproducir el entrenamiento, evaluar y desplegar en robots SO-Follower compatibles.
- Soporte para múltiples observaciones (imagen y estado) y salidas de acción directas.
- No es un modelo de lenguaje ni admite tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios de robótica: el modelo puede ejecutar la tarea de apilar vasos de forma autónoma en un robot SO-Follower, útil para experimentos de aprendizaje por imitación.
- Benchmark de algoritmos de difusión en control: sirve como punto de partida para comparar con otras políticas (ACT, VAE, etc.) en la misma tarea.
- Fine-tuning para nuevas tareas de manipulación: al ser un modelo de difusión, se puede ajustar con un dataset pequeño (por ejemplo, 50-100 episodios) para tareas similares como apilar bloques o insertar piezas.
- Investigación en generalización de políticas visuomotoras: la arquitectura de difusión permite estudiar cómo el modelo maneja variaciones en la posición inicial de los objetos o cambios de iluminación.
- Prototipado rápido de sistemas de automatización con LeRobot: el despliegue se hace con comandos `lerobot-rollout`, lo que facilita integrar la política en un sistema de control real sin desarrollar código desde cero.
- Formación y educación en robótica con aprendizaje por imitación: el modelo y su dataset sirven como ejemplo didáctico para enseñar cómo entrenar y desplegar políticas de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en el robot real. Tampoco se proporcionan métricas de éxito, tasa de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 263 millones de parámetros. En precisión FP32 ocupa aproximadamente 1 GB de VRAM. Con cuantización a FP16 o int8 se reduce a unos 0,5-0,7 GB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Una RTX 3060, RTX 4090 o una GPU de data center como A10 son adecuadas. También puede ejecutarse en CPU para pruebas lentas, aunque la inferencia será significativamente más lenta.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo (serie RTX 20/30/40).
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que funcionan con PyTorch. No es compatible con vLLM ni Ollama porque no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos. Para una política de difusión típica, la inferencia puede tardar entre 50 y 200 ms en una GPU media, dependiendo del número de pasos de denoising configurados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea y con la misma arquitectura. LeRobot ofrece otras políticas como ACT o VAE, pero no hay datos de rendimiento comparativo en este modelo.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para la tarea específica de colocar un vaso en el primer nivel para construir una pirámide. No generaliza a otras tareas sin reentrenamiento.
- No se ha evaluado en el robot real; no hay datos de éxito ni de robustez frente a variaciones de iluminación, posición de objetos o ruido.
- La arquitectura de difusión requiere un número de pasos de denoising en inferencia; un número bajo puede degradar la calidad de las acciones, y un número alto aumenta la latencia.
- El dataset de entrenamiento es limitado (163 episodios), lo que puede provocar sobreajuste a las condiciones específicas de recogida de datos.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza que el modelo funcione correctamente en entornos de producción sin una evaluación exhaustiva.
- No se proporcionan instrucciones sobre cómo ajustar los hiperparámetros de la política de difusión (pasos de denoising, scheduler, etc.) para otros escenarios.

## Enlaces

- Repositorio del modelo: [heba000/pyramid-dataset-phase1-combined-v2-diff](https://huggingface.co/heba000/pyramid-dataset-phase1-combined-v2-diff)
- Dataset de entrenamiento: [heba000/pyramid-dataset-phase1-combined-v2](https://huggingface.co/datasets/heba000/pyramid-dataset-phase1-combined-v2)
- Paper de Diffusion Policy: [Diffusion Policy: Visuomotor Policy Learning via Action Diffusion](https://huggingface.co/papers/2303.04137)
- Proyecto LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentación de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
