# AnonymousMouse404/diffusion_control

## Resumen

El modelo `diffusion_control` es una política de control visuomotor basada en Diffusion Policy, desarrollada por AnonymousMouse404 y entrenada con el framework LeRobot de Hugging Face. Trata el control de robots como un proceso generativo de difusión: en lugar de predecir una única acción, genera una trayectoria completa de acciones de forma suave y multi-paso, lo que resulta especialmente adecuado para tareas de manipulación que requieren contacto físico con objetos.

Este modelo resuelve el problema de aprender una política de control a partir de demostraciones humanas (imitation learning), usando dos cámaras (frontal y muñeca) más el estado del robot como entrada, y generando acciones de seis dimensiones como salida. Es relevante porque demuestra cómo aplicar diffusion models a robótica real con un pipeline accesible (LeRobot), y porque su licencia Apache 2.0 permite uso comercial sin restricciones.

Arquitectónicamente se basa en Diffusion Policy (paper arxiv 2303.04137), con 277 millones de parámetros y una ventana de observación de imágenes de 480x640 píxeles. Fue entrenado sobre un dataset propio de 63 episodios y 15.606 frames, con 50.000 pasos de entrenamiento. Aunque no se han publicado resultados de evaluación, su integración con LeRobot permite desplegarlo directamente en robots compatibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (UNet + denoising) |
| Parámetros totales | 277.840.246 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en F32, safetensors) |
| Idiomas soportados | no aplica (modelo de visión y control) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

La arquitectura se basa en el Diffusion Policy propuesto en el paper arxiv 2303.04137. El modelo trata el control visuomotor como un proceso de difusión generativa: dado el estado de observación (dos imágenes de 480x640 y un vector de estado de 6 dimensiones), la red genera una trayectoria de acciones de forma iterativa, aplicando un proceso de denoising desde ruido gaussiano hasta una trayectoria suave y factible. Esta formulación permite producir acciones multi-step con una suavidad inherente, lo que reduce el ruido y la inestabilidad en tareas de contacto.

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre un dataset de 63 episodios y 15.606 frames a 30 FPS, con tareas de tipo `a1_h1` a `h8_h1` (aparentemente variantes de una misma tarea de manipulación). Se usaron 50.000 pasos de entrenamiento, batch size de 32, optimizador Adam con learning rate de 0.0001 y seed fija de 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado por demos (imitation learning).

## Capacidades

- Generación de trayectorias de acción suaves y multi-step para control de robots manipuladores.
- Control visuomotor con dos cámaras (frontal y muñeca) y estado del robot (6 dimensiones).
- Soporte de tareas de manipulación con contacto (contact-rich manipulation), según el paper base.
- Integración con LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Formato de entrada/salida fijo: imágenes (3, 480, 640) y estado (6,), salida de acción (6,).
- No soporta tool calling, agentes ni razonamiento de lenguaje; es un modelo de control puro.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico tipo SO-101 para tareas de agarre, apilado o inserción, generando trayectorias suaves que evitan movimientos bruscos.
- Automatización de tareas repetitivas en entornos industriales: con el pipeline de LeRobot, se puede desplegar en una línea de montaje para realizar tareas de pick-and-place o ensamblaje básico.
- Investigación en imitation learning: sirve como modelo de referencia para estudiar el comportamiento de políticas de difusión en robots reales, comparando con métodos de control clásico.
- Prototipado de control para robots de bajo coste: al ser un modelo pequeño (277 M de parámetros), se puede ejecutar en GPUs de consumo, facilitando experimentos en laboratorios con recursos limitados.
- Entrenamiento de nuevas tareas por demostración: se puede usar como punto de partida para fine-tuning sobre otros datasets de LeRobot, acelerando el desarrollo de políticas personalizadas.
- Evaluación de robustez en visión: al depender de dos cámaras, se puede probar el comportamiento del modelo ante variaciones de iluminación o posiciones de cámara, útil para validar sistemas de visión en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de evaluación en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". Por tanto, no se dispone de datos de éxito en tareas reales ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 277 millones de parámetros en F32, lo que ocupa aproximadamente 1,1 GB en memoria. Para inferencia, se estima que caben en una GPU con al menos 2 GB de VRAM (por ejemplo, una RTX 3060 o superior), aunque el tamaño de las imágenes de entrada (480x640) y el proceso de denoising pueden aumentar el consumo.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (NVIDIA RTX 20xx/30xx/40xx, A100, etc.). No se necesita hardware de alta gama para inferencia.
- Se puede ejecutar en consumer GPU: sí, una RTX 3060 o RTX 4060 con 8 GB de VRAM es suficiente para la inferencia.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) para ejecutar la política en robots reales. También se puede integrar en entornos de simulación si se dispone del entorno compatible.
- Latencia y rendimiento: no se han publicado datos de latencia en la información disponible. En un GPU moderna, el proceso de denoising suele ser rápido (del orden de milisegundos por paso), pero depende del número de pasos de difusión configurados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Evaluación |
|---|---|---|---|---|---|
| AnonymousMouse404/diffusion_control | 277 M | visual (480x640) | 50k pasos, 63 episodios | Apache 2.0 | No publicada |
| AnonymousMouse404/diffusion_gui_test | no disponible | visual | no disponible | Apache 2.0 | No publicada |
| AnonymousMouse404/diffusion_cylinder | 0.3B (300 M) | visual | no disponible | Apache 2.0 | No publicada |

Los tres modelos son del mismo autor y comparten la misma arquitectura de Diffusion Policy, diferenciándose principalmente en el dataset de entrenamiento y el tamaño. No se dispone de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones en robots reales: el modelo no tiene resultados de éxito en tareas, por lo que su rendimiento real es desconocido y puede no ser fiable para producción.
- Dataset pequeño y específico: solo 63 episodios de un conjunto de tareas muy similar (`a1_h1` a `h8_h1`), lo que puede limitar la generalización a nuevas tareas o entornos.
- Dependencia de las cámaras: el modelo requiere dos cámaras (frontal y muñeca) con resoluciones fijas; cualquier cambio en la configuración del hardware invalidará la política.
- Sin soporte de lenguaje: no es un modelo de lenguaje ni multimodal; no se puede usar para tareas de texto, chat o razonamiento simbólico.
- Riesgo de sobreajuste: dado el número reducido de episodios y la alta dimensionalidad de las imágenes, es probable que el modelo se sobreajuste a las condiciones específicas del dataset.
- Restricciones de licencia: aunque Apache 2.0 permite uso comercial, se debe atribuir el autor y mantener los avisos de copyright; no hay restricciones de uso, pero la responsabilidad del despliegue recae en el usuario.
- Formato de pesos: solo safetensors en F32, sin cuantizaciones disponibles, lo que limita el despliegue en hardware de bajos recursos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AnonymousMouse404/diffusion_control)
- [Paper Diffusion Policy](https://huggingface.co/papers/2303.04137)
- [Dataset de entrenamiento](https://huggingface.co/datasets/AnonymousMouse404/GUI_Test)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
