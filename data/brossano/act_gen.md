# brossano/act_gen

## Resumen

brossano/act_gen es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por Ben Rossano en el ecosistema de Hugging Face LeRobot. El modelo implementa aprendizaje por imitación: aprende a manipular un robot SO follower a partir de demostraciones teleoperadas, prediciendo secuencias cortas de acciones en lugar de pasos individuales. Esta estrategia reduce la acumulación de errores y permite ejecutar tareas de precisión como recoger una caja blanca y colocarla en un bol blanco.

El modelo fue entrenado con un dataset propio de 50 episodios y 32.509 fotogramas a 30 FPS. Tiene un tamaño de 51.668.614 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia radica en que sirve como plantilla para reentrenar políticas robóticas con LeRobot, una plataforma open source que está estandarizando el desarrollo de robots con IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de ACT se basa en un transformer que procesa observaciones multimodales: una señal de estado de 6 dimensiones y dos imágenes de cámara (frontal y muñeca) de 480x848 píxeles. En lugar de predecir una única acción por paso, el modelo genera un "chunk" de acciones de salida de 6 dimensiones, lo que facilita la ejecución robusta y suave en robots. El entrenamiento se realizó con el framework LeRobot (versión 0.6.0), using el optimizador AdamW con una tasa de aprendizaje de 1e-05, un tamaño de lote de 64 y 100.000 pasos.

Los datos de entrenamiento proceden del dataset brossano/box_pickup_gen_20260908_011945, que contiene 50 episodios teleoperados, 32.509 fotogramas a 30 FPS y 6 dimensiones de estado. La tarea consistía en recoger la caja blanca y colocarla en el bol blanco. No se ha informado si se aplicaron técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Control robótico en tiempo real: genera acciones continuas de 6 dimensiones para un robot SO follower a partir de observaciones de estado e imágenes.
- Percepción dual de cámara: procesa simultáneamente una cámara frontal y una cámara de muñeca, combinando visión global y visión cercana.
- Aprendizaje por imitación: reproduce la tarea de recoger una caja blanca y colocarla en un bol blanco, aprendida de demostraciones teleoperadas.
- Reentrenamiento flexible: al estar construido sobre LeRobot, se puede reentrenar con nuevos datasets para adaptarlo a otras tareas de manipulación.
- Sin capacidades de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.
- Sin modo de pensamiento, visión flexible ni procesamiento de audio: se limita a la percepción visual y el estado del robot.

## Casos de uso

- Pick-and-place en laboratorios: el modelo puede automatizar la recogida y depósito de objetos ligeros en un entorno de laboratorio, reduciendo la intervención humana en tareas repetitivas. La tarea para la que fue entrenado coincide exactamente con este escenario.
- Baseline para investigación en imitación: se puede ejecutar este checkpoint con LeRobot para comparar su rendimiento con otras políticas como Diffusion Policy o VQ-BeT en la misma tarea. Al ser un modelo compacto, las pruebas son rápidas y asequibles.
- Validación del pipeline de LeRobot: sirve para comprobar que la instalación de hardware, el calibrado de cámaras y el flujo de inferencia funcionan antes de lanzar una campaña de entrenamiento propia.
- Fine-tuning para tareas similares: partiendo de este checkpoint, se puede ajustar con un dataset propio de pocas demostraciones para manipular otros objetos. La arquitectura ACT está diseñada para aprender con pocas demostraciones.
- Formación en robótica educativa: es un ejemplo práctico de cómo un transformer controla un brazo robótico, útil para asignaturas de automatización, robótica o inteligencia artificial.
- Integración en estaciones de trabajo con robots colaborativos: en entornos controlados, el modelo puede encargarse de tareas repetitivas de alimentación de piezas, siempre que la configuración de cámara y robot coincida con la de entrenamiento. La licencia Apache 2.0 permite su uso en sistemas propietarios, aunque requiere medidas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada: al tener 51,7 millones de parámetros y entradas de imagen de 480x848, la inferencia en fp32 puede ocupar menos de 4 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: NVIDIA RTX 3060 o superior; también es posible usar placas dedicadas como NVIDIA Jetson para despliegue embebido.
- Se ejecuta en GPU de consumo y no requiere infraestructura de modelos de lenguaje (vLLM, llama.cpp, Ollama); el despliegue se realiza mediante LeRobot y PyTorch.
- Latencia: no disponible.

## Comparativa con modelos similares

No disponible. La información disponible no incluye datos de otros modelos comparables con los que contrastar el rendimiento de manera rigurosa.

## Limitaciones y advertencias

- Generalización limitada: entrenado con 50 episodios para una única tarea y configuración de robot/cámaras; cambios en iluminación, posición de objetos o distracciones reducen la fiabilidad.
- Sin evaluación publicada: no hay métricas de éxito sobre el robot real, por lo que el rendimiento efectivo no está verificado.
- Dependencia de hardware: requiere un robot SO follower y dos cámaras con las mismas características (frontal, muñeca, resolución) para reproducir la salida esperada.
- No hay planificación de alto nivel: el modelo reproduce la política aprendida, pero no razona ni planifica ante situaciones novedosas.
- Riesgo de seguridad: al operar un robot en movimiento, deben implementarse paradas de emergencia, límites de velocidad y supervisión humana.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías de seguridad ni idoneidad para un fin concreto.

## Enlaces

- Modelo: https://huggingface.co/brossano/act_gen
- Dataset de entrenamiento: https://huggingface.co/datasets/brossano/box_pickup_gen_20260908_011945
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor: https://huggingface.co/brossano
