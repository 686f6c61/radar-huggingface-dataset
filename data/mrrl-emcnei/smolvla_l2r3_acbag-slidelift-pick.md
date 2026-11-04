# mrrl-emcnei/smolvla_l2r3_acbag-slidelift-pick

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `smolvla_l2r3_acbag-slidelift-pick`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 50 episodios y 25.786 fotogramas a 30 FPS, orientado a una única tarea: recoger una bolsa ("Pick up the pouch") con un robot móvil de tipo `mobileai_robot` equipado con tres cámaras (alta, muñeca izquierda y muñeca derecha).

El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres flujos de imagen RGB de 256x256) y produce un vector de acción de 16 dimensiones. Con 450 millones de parámetros, está pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que necesitan desplegar políticas robóticas sin infraestructura de GPU de datacenter.

La relevancia actual de SmolVLA radica en su propuesta de eficiencia: demuestra que un VLA de tamaño reducido puede alcanzar rendimiento competitivo en tareas de manipulación, y el ecosistema LeRobot facilita el ciclo completo de grabación de datos, entrenamiento, evaluación y despliegue en robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual, un componente de lenguaje y un cabezal de acciones, según se describe en el paper arXiv:2506.01844. La información disponible no detalla la composición interna exacta (número de capas, dimensión oculta, mecanismo de atención) ni el número de tokens de preentrenamiento del modelo base. El modelo consume tres cámaras RGB de 256x256 píxeles y un vector de estado de 6 dimensiones, y emite una acción de 16 dimensiones.

Este checkpoint concreto se ha fine-tuneado desde `lerobot/smolvla_base` sobre el dataset `mrrl-emcnei/acbag-slidelift-pick` (50 episodios, 25.786 fotogramas, 30 FPS, tarea "Pick up the pouch"). La configuración de entrenamiento reportada incluye 100.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-4, semilla 1000 y LeRobot 0.6.2. No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineamiento posteriores al aprendizaje por imitación.

## Capacidades

- Control robótico de manipulación mediante aprendizaje por imitación: genera acciones de 16 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción visual multivista: procesa simultáneamente tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) a 256x256.
- Fusión de estado y visión: integra un vector de estado de 6 dimensiones con las imágenes para producir la política de acción.
- Ejecución en hardware de consumo: el tamaño de 450M parámetros permite despliegue en GPU de gama media.
- Integración nativa con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- Tarea específica: recogida de una bolsa ("Pick up the pouch") en el entorno de entrenamiento.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de "thinking".

## Casos de uso

- Automatización de picking en laboratorio: el modelo ejecuta la tarea "Pick up the pouch" sobre el robot `mobileai_robot` con tres cámaras, adecuado para prototipos de recogida de objetos en entornos controlados. Se lanza con `lerobot-rollout` indicando el puerto del robot y los índices de cámara.
- Base para fine-tuning en nuevas tareas de manipulación: partiendo de `lerobot/smolvla_base` o de este checkpoint, un equipo puede reentrenar con su propio dataset siguiendo el flujo `lerobot-train`, útil para iterar rápidamente en nuevas tareas de recogida.
- Investigación en aprendizaje por imitación: con 50 episodios y 25.786 fotogramas, sirve como referencia reproducible para estudiar el efecto del número de demostraciones en el éxito de la política.
- Evaluación de políticas VLA compactas en hardware de consumo: al tener 450M parámetros y pesos safetensors de ~0,9 GB, permite comparar el rendimiento de un VLA pequeño frente a alternativas mayores en un mismo robot.
- Docencia y formación en robótica: el stack LeRobot (instalación, calibración, grabación, entrenamiento, rollout) ofrece un caso práctico completo para cursos de robótica de manipulación.
- Despliegue en robot móvil de bajo coste: la política está etiquetada para `mobileai_robot`, lo que la hace adecuada para plataformas móviles con brazo y cámaras de muñeca, típicas en laboratorios con presupuesto limitado.
- Recolección de datos y validación de pipelines: el dataset asociado (`mrrl-emcnei/acbag-slidelift-pick`) y la política permiten validar pipelines de datos antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450M parámetros y pesos safetensors de ~0,9 GB, la inferencia en fp32 requeriría del orden de 1,8 GB solo para pesos, más activaciones y buffers de imagen (tres cámaras de 256x256). En fp16/bf16 el peso se reduce a ~0,9 GB.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una GPU consumer con 8 GB o más (por ejemplo RTX 3060/4060/4090) debería ser suficiente para inferencia; no se confirma en la documentación.
- ¿Cabe en GPU consumer? Sí, por el tamaño del modelo (450M parámetros), aunque no se aportan mediciones oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. La política se ejecuta a 30 FPS en el dataset de entrenamiento, pero no se reporta la frecuencia de control en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_l2r3_acbag-slidelift-pick (este) | 450M | no disponible | Pick up the pouch (mobileai_robot) | apache-2.0 | HuggingFace |
| lerobot/smolvla_base | no disponible | no disponible | Base VLA para fine-tuning | no disponible en la información | HuggingFace |
| Otros VLA compactos (p. ej. variantes de OpenVLA) | no disponible | no disponible | Manipulación general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Pick up the pouch") y un único tipo de robot (`mobileai_robot`); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset pequeño: 50 episodios y 25.786 fotogramas son una base limitada; el modelo puede sobreajustar a posiciones, iluminación y objetos del entorno de grabación.
- Dependencia de configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento; un montaje distinto degradará el rendimiento.
- Sin información sobre sesgos, alucinación o capacidades lingüísticas: al no ser un modelo conversacional, estas categorías no aplican de forma directa, pero tampoco se documentan riesgos específicos de la política.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base `lerobot/smolvla_base` antes de un despliegue comercial.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de usarlo.
- Sin datos de latencia ni frecuencia de control en tiempo real: crítico para aplicaciones de manipulación que requieran respuesta rápida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrrl-emcnei/smolvla_l2r3_acbag-slidelift-pick
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mrrl-emcnei/acbag-slidelift-pick
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrrl-emcnei/acbag-slidelift-pick
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
