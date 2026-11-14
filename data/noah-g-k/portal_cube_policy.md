# Noah-g-k/portal_cube_policy

## Resumen

`portal_cube_policy` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso, ACT predice fragmentos cortos de acciones (action chunks), lo que reduce el error de acumulación y estabiliza el control en tareas de manipulación. El modelo lo ha entrenado y publicado el usuario Noah-g-k mediante la librería LeRobot de Hugging Face y está diseñado para ejecutarse sobre un robot tipo `so_follower` (SO-100/SO-101 de LeRobot) con dos cámaras: una en la pinza (`claw`) y otra cenital (`birdsEye`).

La política resuelve una tarea concreta de manipulación denominada `portal_cube`: un único skill entrenado con 50 episodios de teleoperación (8070 fotogramas a 30 FPS). No es un modelo de lenguaje ni un modelo fundacional generalista; es un checkpoint de control visuomotor de aproximadamente 51,7 millones de parámetros (pesos en safetensors, repo de 0,2 GB) que consume el estado articular de 6 dimensiones y dos imágenes RGB para producir un vector de acción de 6 dimensiones.

Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de imitation learning con LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) y como punto de partida para quien quiera replicar la tarea `portal_cube` o adaptar la receta a otra tarea con su propio dataset. No hay resultados de evaluación publicados ni licencia declarada, lo que limita su uso en producción sin verificación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de un paso con historial de acciones) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación supervisada que mapea observaciones (estado + imágenes) a un chunk de acciones futuras. El modelo consume `observation.state` de forma `(6,)`, una imagen de la pinza `(3, 240, 320)` y una imagen cenital `(3, 480, 640)`, y produce `action` de forma `(6,)`. La predicción por chunks es la innovación central del método: el decodificador emite varias acciones a la vez, lo que mitiga el compounding error típico de las políticas paso a paso y permite un control más suave a 30 FPS.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Noah-g-k/act_portal_cube_dataset_50_20261113_211527`: 50 episodios, 8070 fotogramas, 30 FPS, tarea única `portal_cube`. La configuración reportada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá de los episodios de teleoperación, ni uso de RLHF/DPO (no aplica en imitation learning), ni aumentos de datos, ni detalles del backbone visual.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de estado articular e imágenes RGB.
- Ejecución de una tarea única de pick-and-place sobre un cubo (`portal_cube`) en un robot `so_follower`.
- Fusión de dos vistas: pinza (`claw`, 240x320) y vista cenital (`birdsEye`, 480x640), lo que aporta información de profundidad y posicionamiento global.
- Predicción por chunks de acciones, con control más estable que políticas de un solo paso.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking: es una política de robótica especializada.

## Casos de uso

- Replicación de la tarea `portal_cube`: desplegar la política sobre un SO-100/SO-101 con las cámaras `claw` y `birdsEye` para reproducir el pick-and-place del cubo, usando `lerobot-rollout` con `--policy.path=Noah-g-k/portal_cube_policy` y `--task="portal_cube"`.
- Baseline de imitation learning: servir como referencia de éxito/fracaso para comparar nuevas políticas ACT o Diffusion Policy entrenadas sobre el mismo dataset de 50 episodios.
- Validación de pipeline de datos: comprobar que un dataset grabado a 30 FPS con 8070 fotogramas es suficiente para aprender una tarea de manipulación simple, antes de escalar a tareas más complejas.
- Fine-tuning sobre nueva tarea: reutilizar el checkpoint como inicialización y reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio, aprovechando la receta de hiperparámetros publicada (100k pasos, batch 8, lr 1e-5).
- Docencia y demos de robótica: ejemplo reproducible de extremo a extremo (grabación, entrenamiento, despliegue) para cursos o talleres sobre LeRobot y ACT.
- Pruebas de hardware y calibración: usar la política como test funcional del robot y de las cámaras, verificando que los nombres de cámara y el puerto coinciden con las claves de observación del modelo.
- Investigación en robustez visual: evaluar cómo afectan cambios de iluminación, posición del cubo o distractores al rendimiento, dado que la model card no reporta evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet». No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos en safetensors, el modelo ocupa del orden de 0,2 GB en disco y cabe holgadamente en cualquier GPU con 4-8 GB de VRAM. No se dispone de cifras oficiales de consumo en inferencia.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060/4060 o superior es más que adecuada. Para entrenamiento, una RTX 4090 o A100 acelera los 100.000 pasos, aunque el modelo es pequeño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida, aunque no se documenta rendimiento en CPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se publican variantes GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 30 FPS (33 ms por paso), pero no se reportan latencias medidas de inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Noah-g-k/portal_cube_policy` (ACT) | 51,7 M | Estado 6D + 2 imágenes (240x320 y 480x640) | `portal_cube` (pick-and-place) | no disponible | Hugging Face, LeRobot |
| Políticas ACT de LeRobot (referencia del método) | variable según backbone | configurables | múltiples tareas de manipulación | Apache-2.0 (LeRobot) | Hugging Face, GitHub |
| Diffusion Policy (alternativa de imitation learning) | variable | observaciones multimodales | manipulación | según implementación | repos de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a arquitectura, tamaño y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: solo ejecuta la tarea `portal_cube`; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 50 episodios y 8070 fotogramas; riesgo de sobreajuste y de baja robustez ante cambios de posición, iluminación o distractores.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede afirmar fiabilidad en producción.
- Dependencia de hardware y calibración: requiere un robot `so_follower` y cámaras con nombres e índices que coincidan exactamente con las claves de observación (`claw`, `birdsEye`); un montaje distinto invalida la política.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o tratar el modelo como no licenciado para producción.
- Sin capacidades lingüísticas ni de razonamiento: no es un LLM y no debe evaluarse con benchmarks de texto.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede producir comandos plausibles pero erróneos ante estados fuera de distribución.
- Idiomas no aplicables y sin documentación sobre sesgos; la model card no incluye secciones de uso responsable ni limitaciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noah-g-k/portal_cube_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Noah-g-k/act_portal_cube_dataset_50_20261113_211527
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Noah-g-k/act_portal_cube_dataset_50_20261113_211527
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
