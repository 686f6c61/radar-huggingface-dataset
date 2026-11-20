# leejeonghun/diffusion_pick-cube

## Resumen

`leejeonghun/diffusion_pick-cube` es una política de control visuomotor entrenada con el método Diffusion Policy (arXiv:2303.04137) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que consume el estado articular del robot y dos flujos de vídeo (cámara cenital y cámara en la muñeca) para producir una trayectoria de acciones de 6 dimensiones. El modelo tiene 277.840.246 parámetros y un tamaño de repositorio de 1,1 GB en formato safetensors.

El problema que resuelve es concreto y acotado: la tarea "Grab the black cube" (agarrar el cubo negro) sobre un robot de tipo `so_follower`. El modelo se entrenó con un dataset propio de 50 episodios y 21.886 fotogramas a 25 FPS, durante 100.000 pasos con batch size 8 y optimizador Adam a un learning rate de 1e-4. Es, por tanto, un artefacto de imitación de una sola tarea, no un modelo generalista.

Su relevancia es la de un ejemplo reproducible de Diffusion Policy dentro del ecosistema LeRobot 0.6.0: la model card incluye los comandos exactos de `lerobot-rollout` y `lerobot-train`, lo que permite replicar el pipeline completo. La licencia Apache 2.0 facilita su reutilización y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (proceso generativo de difusión sobre acciones; backbone no especificado en la model card) |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin indicar variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo no lingüístico; la tarea se especifica con la cadena "Grab the black cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de Diffusion Policy: en lugar de regresar directamente una acción, aprende a generar trayectorias de acción mediante un proceso de difusión, lo que produce movimientos suaves y multi-paso especialmente adecuados para manipulación con contacto rico. La entrada combina `observation.state` de forma `(6,)` con dos imágenes RGB de `(3, 480, 640)` procedentes de las cámaras `overhead` y `wrist`; la salida es un vector `action` de `(6,)`. La model card no detalla el backbone concreto ni el número de pasos de difusión.

El entrenamiento se realizó sobre el dataset `leejeonghun/pick-cube_20261013_234552` (50 episodios, 21.886 fotogramas, 25 FPS, tarea única "Grab the black cube") durante 100.000 pasos con batch size 8, optimizador Adam, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni de datos externos; se trata de aprendizaje por imitación supervisado a partir de demostraciones.

## Capacidades

- Control visuomotor de manipulación: genera trayectorias de acción de 6 dimensiones a partir de estado articular e imágenes.
- Manipulación con contacto rico: el enfoque de difusión está diseñado para tareas de agarre y contacto, como el pick de un cubo.
- Fusión multimodal de dos cámaras: integra vista cenital y vista de muñeca en una única política.
- Ejecución en tiempo real sobre robot `so_follower` mediante `lerobot-rollout`, con control de duración (`--duration`).
- Condicionamiento por tarea: acepta la cadena de tarea (`--task="Grab the black cube"`) como instrucción.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio ni modo thinking: es una política de robótica de tarea única.
- Multilingüismo: no aplica.

## Casos de uso

- Recogida de objetos en línea de laboratorio: ejecutar la política sobre un `so_follower` para agarrar un cubo negro como paso base de un pipeline de manipulación, usando `lerobot-rollout` con `--strategy.type=base`.
- Reproducción de experimentos de Diffusion Policy: servir como referencia reproducible para comparar el método de difusión frente a políticas de regresión en tareas de pick.
- Generación de datos de evaluación: ejecutar el modelo de forma indefinida (sin `--duration`) para recolectar rollouts y analizar la estabilidad de las trayectorias generadas.
- Base para fine-tuning con `lerobot-train`: reentrenar con `--policy.type=diffusion` sobre un dataset propio y comparar curvas de pérdida frente a este checkpoint.
- Docencia y divulgación en robótica de imitación: ilustrar el flujo completo de LeRobot (instalación, grabación de datos, entrenamiento y despliegue) con un caso de una sola tarea.
- Pruebas de integración de hardware: validar la calibración de cámaras y del robot `so_follower` verificando que la política produce agarres correctos en el cubo.
- Benchmark interno de latencia: medir el coste de inferencia de un modelo de 277,8 M de parámetros en el bucle de control a 25-30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen tasas de éxito, número de ensayos ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; con 277,8 M de parámetros en safetensors (1,1 GB de repo), la inferencia en fp32 requiere del orden de 1,1 GB solo para pesos, más activaciones de las dos imágenes de 480x640.
- GPU recomendadas: no especificadas por el autor; el comando de entrenamiento usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con CUDA.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por tamaño de pesos es plausible en GPUs de consumo con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El dataset se grabó a 25 FPS y los ejemplos de cámara usan 30 FPS, pero no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leejeonghun/diffusion_pick-cube` | 277.840.246 | no aplica | Pick de cubo negro, robot `so_follower` | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Otras políticas LeRobot Diffusion | no disponible | no aplica | Manipulación varia | habitualmente apache-2.0 | Hugging Face (no verificadas en la información disponible) |
| Políticas ACT de LeRobot | no disponible | no aplica | Manipulación varia | habitualmente apache-2.0 | Hugging Face (no verificadas en la información disponible) |

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Tarea única: entrenada exclusivamente para "Grab the black cube"; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Dataset pequeño: 50 episodios y 21.886 fotogramas limitan la robustez frente a cambios de posición, iluminación o distractores.
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia de hardware específico: asume robot `so_follower` y dos cámaras con nombres `overhead` y `wrist`; cualquier cambio de configuración invalida la política.
- Riesgo de sobreajuste al entorno de grabación: al ser imitación sobre un único dataset, es probable que falle ante distribuciones visuales distintas.
- Sesgos: no documentados por el autor; al no ser un modelo lingüístico, los sesgos sociales típicos no aplican, pero sí el sesgo de las demostraciones (posiciones, iluminación y objetos del dataset).
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se indican restricciones adicionales.
- Caveat de producción: 0 descargas y 0 likes en el Hub, sin demo ni vídeo de validación; trátese como artefacto experimental, no como política lista para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leejeonghun/diffusion_pick-cube
- Dataset de entrenamiento: https://huggingface.co/datasets/leejeonghun/pick-cube_20261013_234552
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leejeonghun/pick-cube_20261013_234552
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
