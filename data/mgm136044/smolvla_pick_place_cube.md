# mgm136044/smolvla_pick_place_cube

## Resumen

smolvla_pick_place_cube es un ajuste fino (fine-tuning) del modelo vision-language-action (VLA) SmolVLA, desarrollado por el usuario mgm136044 y publicado en Hugging Face bajo la librería LeRobot. El modelo base es lerobot/smolvla_base, un VLA compacto de aproximadamente 450 millones de parámetros diseñado para control robótico por imitación, que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para traducir observaciones multimodales (imágenes y estado del robot) en comandos motores.

Este ajuste concreto está especializado en una única tarea: "Pick and place the cube" (coger y colocar un cubo), entrenado sobre un dataset propio de 50 episodios y 19.137 fotogramas a 25 FPS, capturados con un robot de tipo so_follower y dos cámaras (overhead y wrist). El resultado es una política de imitación lista para desplegarse en hardware de consumo, sin necesidad de infraestructura de GPU de datacenter.

Su relevancia radica en que demuestra el flujo completo de LeRobot: grabar datos con un robot de bajo coste, ajustar un VLA preentrenado y ejecutar la política en el mismo robot con un único comando CLI. Es un ejemplo práctico de cómo los modelos VLA compactos están acercando la robótica de manipulación a desarrolladores e investigadores con presupuestos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; codificador visual + modelo de lenguaje + decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a generación de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower |
| Camaras | overhead, wrist (más una cámara vacía de 480x640) |
| Entrada observation.state | shape (6,) |
| Salida action | shape (6,) |
| Dataset de entrenamiento | mgm136044/pick-place-cube_20261008_100203 (50 episodios, 19.137 frames, 25 FPS) |
| Tarea | "Pick and place the cube" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Seed | 1000 |
| Version de LeRobot | 0.6.0 |
| Tamano del repo | 0,9 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que sigue el paradigma de los VLA: procesa observaciones multimodales (imágenes de varias cámaras y el estado propioceptivo del robot) y genera directamente una secuencia de acciones motoras. La arquitectura combina un codificador visual para las imágenes de cámara con un backbone de lenguaje y una cabeza de decodificación de acciones que produce el vector de acción de 6 dimensiones. El modelo base lerobot/smolvla_base fue preentrenado y este ajuste lo especializa en una tarea concreta mediante aprendizaje por imitación (imitation learning / behavior cloning).

El entrenamiento de este ajuste se realizó con LeRobot 0.6.0 sobre el dataset mgm136044/pick-place-cube_20261008_100203, compuesto por 50 episodios y 19.137 fotogramas grabados a 25 FPS con un robot so_follower y dos cámaras (overhead y wrist). Se ejecutaron 20.000 pasos con batch size 64, optimizador AdamW y learning rate 0,0001. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo de control robótico, el paradigma es de imitación supervisada, no de alineamiento por preferencias.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot so_follower a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente imágenes de cámara overhead y wrist (256x256) más una cámara adicional de 480x640.
- Ejecución de tareas de pick-and-place: especializado en la tarea "Pick and place the cube".
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas grabadas con LeRobot.
- Despliegue en hardware de consumo: el modelo base SmolVLA está diseñado para ejecutarse en GPUs de gama consumer.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No es un modelo de generación de texto, razonamiento, código ni matemáticas; no soporta tool calling ni agentes de propósito general.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la tarea de coger y colocar un cubo en un robot so_follower, sirviendo como base para experimentos de imitación en entornos controlados.
- Prototipado rápido de políticas robóticas: un desarrollador puede grabar 50 episodios con LeRobot, ajustar SmolVLA y desplegar la política en el mismo robot en cuestión de horas, gracias al flujo CLI documentado.
- Educación e investigación en robótica: permite a estudiantes e investigadores reproducir el pipeline completo de VLA (grabación, entrenamiento, rollout) con hardware de bajo coste y una GPU consumer.
- Benchmark de referencia para tareas de manipulación: al ser un ajuste con dataset y configuración públicos, sirve como línea base reproducible para comparar nuevas políticas de imitación.
- Automatización de tareas repetitivas de pick-and-place: en líneas de montaje o clasificación simple donde la tarea esté bien delimitada y el entorno sea similar al del dataset de entrenamiento.
- Desarrollo de sistemas robóticos con visión multi-cámara: el modelo demuestra la integración de varias cámaras (overhead, wrist, cámara adicional) en una sola política, útil para proyectos que requieran fusión de vistas.
- Base para fine-tuning en tareas relacionadas: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para otras tareas de manipulación con el mismo tipo de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors (0,9 GB de repo), la inferencia en precisión original requiere aproximadamente 1-2 GB de VRAM, y menos con cuantización.
- GPU recomendadas: el modelo base SmolVLA está diseñado para hardware consumer; se espera que funcione en GPUs como RTX 3060, RTX 4060, RTX 4090, así como en A100/H100 para entrenamiento.
- Cabe en GPU consumer: sí, según la descripción del modelo base ("can be deployed on consumer-grade hardware").
- Opciones de despliegue: LeRobot (`lerobot-rollout` CLI), con soporte de CUDA vía `--policy.device=cuda`. No se documentan opciones vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_pick_place_cube (este) | 450 M | no disponible | Pick-and-place (cubo) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA generalista (base) | no disponible | Hugging Face |
| OpenVLA | no disponible | no disponible | VLA generalista | no disponible | no disponible |
| RT-2 | no disponible | no disponible | VLA generalista | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo ha sido entrenado para la tarea "Pick and place the cube" con un robot so_follower; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real documentadas, por lo que su fiabilidad en producción es desconocida.
- Dataset pequeño: 50 episodios y 19.137 fotogramas es un volumen reducido, lo que limita la robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- Dependencia del entorno de entrenamiento: cambios en la configuración de cámaras, posiciones o tipo de robot pueden degradar el rendimiento.
- Sin capacidades de lenguaje: no es un modelo de texto; no debe usarse para generación, razonamiento o tareas de NLP.
- Riesgo de sobreajuste: con solo 50 episodios, la política puede memorizar trayectorias y fallar ante condiciones no vistas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base debe verificarse por separado.
- Idiomas: no aplica; el modelo no procesa lenguaje natural de forma general.
- Sin datos de cuantización ni de latencia: no se puede estimar el rendimiento en tiempo real sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mgm136044/smolvla_pick_place_cube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mgm136044/pick-place-cube_20261008_100203
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mgm136044/pick-place-cube_20261008_100203
