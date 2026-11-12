# boylel/pi05_lora_so101_tempo_combined

## Resumen

`boylel/pi05_lora_so101_tempo_combined` es un adaptador LoRA de robótica entrenado sobre el modelo base `lerobot/pi05_base`, una implementación en LeRobot del modelo Vision-Language-Action π₀.₅ (Pi05) de Physical Intelligence. El adaptador especializa el modelo base para una tarea concreta de manipulación con el robot SO-101: recoger pañuelos de papel y depositarlos en un contenedor. El autor es el usuario de Hugging Face `boylel` y el repositorio se publicó en noviembre de 2026.

El modelo resuelve el problema de la generalización de políticas de imitación a un entorno físico concreto: recibe el estado articular del robot (6 dimensiones) y dos flujos de vídeo (cámara frontal y cámara de muñeca, 480x640 a 30 FPS) y produce un vector de acción de 6 dimensiones. Al estar construido sobre π₀.₅, hereda la arquitectura Vision-Language-Action del modelo base, que combina un modelo de visión-lenguaje con un experto de acción para generar comandos motores de forma directa.

Es relevante para desarrolladores e investigadores en robótica porque demuestra el flujo completo de LeRobot para el ajuste fino de políticas VLA con LoRA sobre hardware de bajo coste (SO-101), aunque su alcance es muy limitado: una única tarea, un único tipo de robot y sin resultados de evaluación publicados. No es un modelo de propósito general ni un modelo de lenguaje: es una política de control motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (π₀.₅ / Pi05), adaptador LoRA sobre `lerobot/pi05_base` |
| Parametros totales | no disponible (el repositorio ocupa 1,7 GB; el adaptador LoRA no expone el recuento de parámetros) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje natural como tarea principal) |
| Licencia | gemma |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre π₀.₅, un modelo Vision-Language-Action de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La política consume tres observaciones: `observation.state` con forma `(6,)`, `observation.images.front` con forma `(3, 480, 640)` y `observation.images.wrist` con forma `(3, 480, 640)`, y emite `action` con forma `(6,)`. El ajuste se realizó con LoRA, de ahí el tamaño reducido del repositorio (1,7 GB) frente al modelo base completo.

El entrenamiento se llevó a cabo sobre el dataset `boylel/so101_tempo_in_white_container_combined`, compuesto por 80 episodios y 25.799 fotogramas a 30 FPS para la tarea "Grab the tissues and put them into the container". La configuración reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, con LeRobot 0.7.1. No se documentan detalles sobre composición del dataset más allá del recuento de episodios y fotogramas, ni sobre uso de RLHF o DPO (no aplicable en un pipeline de imitación).

## Capacidades

- Control motor robótico: genera acciones de 6 dimensiones para el robot SO-101 (`so_follower`) a partir del estado articular y dos cámaras.
- Percepción visual multimodal: procesa simultáneamente una vista frontal y una vista de muñeca a 480x640 y 30 FPS.
- Ejecución de una tarea de manipulación específica: recoger pañuelos de papel y depositarlos en un contenedor.
- Inferencia en tiempo real mediante `lerobot-rollout` con la estrategia `base` y duración configurable.
- Ajuste fino adicional: puede reentrenarse a partir de `lerobot/pi05_base` con `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas ni generación de código; estas no forman parte del propósito del modelo.

## Casos de uso

- Automatización de una celda de manipulación con SO-101: desplegar la política con `lerobot-rollout` para que el brazo ejecute de forma autónoma la secuencia de recogida y depósito de pañuelos en un contenedor, usando las cámaras frontal y de muñeca como entrada.
- Prototipado rápido de políticas VLA en laboratorio: servir como punto de partida para validar el pipeline completo de LeRobot (grabación de datos, entrenamiento LoRA, rollout) antes de escalar a tareas más complejas.
- Recogida de datos y evaluación comparativa: usar el adaptador como línea base frente a políticas entrenadas desde cero con el mismo dataset de 80 episodios y 25.799 fotogramas.
- Demostración educativa de imitación visual-motora: ilustrar cómo un modelo Vision-Language-Action traduce observaciones visuales y propioceptivas en comandos articulares de 6 grados de libertad.
- Reentrenamiento para variantes de la tarea: ajustar de nuevo desde `lerobot/pi05_base` con datasets propios que compartan el mismo formato de observación (estado de 6 dimensiones y dos cámaras de 480x640).
- Integración en un banco de pruebas de robótica de bajo coste: validar la viabilidad de políticas VLA con LoRA en hardware asequible antes de invertir en plataformas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,7 GB en safetensors, por lo que el adaptador en sí es ligero, pero el modelo base π₀.₅ completo requiere más memoria y no se documenta su huella.
- GPU recomendadas: no disponible en la información proporcionada. El comando de entrenamiento de LeRobot usa `--policy.device=cuda`, lo que implica una GPU NVIDIA compatible con CUDA.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base π₀.₅, cuyo requisito de VRAM no se detalla.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. La captura de datos se realiza a 30 FPS, pero no se reporta la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `boylel/pi05_lora_so101_tempo_combined` | Adaptador LoRA VLA (π₀.₅) | no disponible | no disponible | Manipulación SO-101 (una tarea) | gemma | Hugging Face |
| `lerobot/pi05_base` | VLA base (π₀.₅) | no disponible | no disponible | Propósito general de robótica | no disponible en la información | Hugging Face |
| π₀ (Pi0) | VLA | no disponible | no disponible | Robótica general | no disponible en la información | OpenPI (Physical Intelligence) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Alcance extremadamente estrecho: entrenado para una única tarea ("Grab the tissues and put them into the container") y un único tipo de robot (`so_follower`); no se espera que generalice a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: la model card no reporta tasas de éxito ni número de ensayos, por lo que no hay evidencia cuantitativa de fiabilidad.
- Dependencia del entorno: el rendimiento probablemente se degrade con cambios de iluminación, posiciones de objetos, distracciones o un robot distinto del mismo tipo; no se documenta robustez.
- Sesgos conocidos: no documentados, pero al entrenarse con 80 episodios de un único entorno, la política hereda los sesgos de esa distribución de datos.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones fuera de distribución ante observaciones no vistas, con riesgo físico para el robot y el entorno.
- Restricciones de licencia: licencia `gemma`, que impone condiciones de uso; debe revisarse antes de cualquier uso comercial.
- Idiomas: no disponible; el modelo no está orientado a procesamiento de lenguaje natural.
- Requisitos de hardware y latencia no documentados: dificulta planificar un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boylel/pi05_lora_so101_tempo_combined
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/boylel/so101_tempo_in_white_container_combined
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=boylel/so101_tempo_in_white_container_combined
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
