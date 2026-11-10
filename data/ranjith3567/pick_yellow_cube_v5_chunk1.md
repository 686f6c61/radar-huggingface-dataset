# ranjith3567/pick_yellow_cube_v5_chunk1

## Resumen

`pick_yellow_cube_v5_chunk1` es una política de robótica entrenada con SmolVLA (un modelo compacto de visión-lenguaje-acción, VLA) y publicada en Hugging Face por el usuario `ranjith3567` mediante la librería LeRobot. El modelo resuelve una tarea de manipulación muy concreta: recoger un bloque amarillo y colocarlo en una caja marrón. No es un modelo de propósito general, sino un checkpoint de imitación entrenado sobre un dataset propio de 100 episodios y 63.143 fotogramas a 30 FPS, con el robot `so_follower` (SO-100/SO-101 de LeRobot) y tres cámaras de observación.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el flujo de trabajo típico de SmolVLA: un VLA pequeño (unos 450 millones de parámetros, según los pesos en safetensors) que puede entrenarse y desplegarse en hardware de consumo. Por otro, sirve como caso práctico de política de imitación con dataset abierto, útil para quien quiera replicar el pipeline de LeRobot en tareas de pick-and-place.

Conviene subrayar que se trata de un artefacto experimental de un autor individual, con licencia no declarada, sin resultados de evaluación publicados y sin métricas de éxito en robot real. Su valor está en el pipeline y en el dataset, no en un rendimiento validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 450.046.176 (dato real de los safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se define en inglés: "pick the yellow block and place it in brown box") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto descrito en el paper arXiv:2506.01844, pensado para reducir el coste computacional y poder desplegarse en hardware de consumo. En este checkpoint, la política consume observaciones de estado (`observation.state`, vector de 6 dimensiones) y varias cámaras: tres vistas visuales a 256×256 (`observation.images.camera1`, `camera2`, `camera3`) y una cámara vacía a 480×640 (`observation.images.empty_camera_0`). Produce una acción de 6 dimensiones (`action`), coherente con un brazo robótico de 6 grados de libertad.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ranjith3567/pick_yellow_cube_v5_20261105_191046`: 100 episodios, 63.143 fotogramas a 30 FPS, tarea "pick the yellow block and place it in brown box". La configuración reportada es 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documentan detalles sobre el congelado de módulos, el uso de RLHF/DPO ni la composición exacta del corpus de preentrenamiento de SmolVLA en esta ficha.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa tres cámaras RGB de 256×256 más una cuarta vista de 480×640 (aunque esta última aparece como `empty_camera_0`, probablemente sin uso efectivo).
- Ejecución de una tarea de pick-and-place específica: recoger un bloque amarillo y depositarlo en una caja marrón.
- Aprendizaje por imitación: política entrenada sobre demostraciones humanas (100 episodios), no por refuerzo.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni diálogo multilingüe; no es un modelo de lenguaje conversacional.

## Casos de uso

- Replicación de pipelines de imitación: sirve como referencia para entrenar políticas SmolVLA sobre datasets propios con LeRobot, ajustando `--policy.type=smolvla` y el dataset de entrenamiento.
- Pick-and-place en laboratorio: despliegue directo sobre un SO-100/SO-101 con la tarea "pick the yellow block and place it in brown box" para validar la cadena cámara-política-actuador.
- Docencia y formación en robótica: ejemplo completo de dataset (100 episodios, 63k fotogramas) y checkpoint para explicar el ciclo de imitación, calibración y rollout.
- Benchmark interno de infraestructura: medir latencia de inferencia y throughput de un VLA de ~450M parámetros en GPUs de consumo dentro de un pipeline LeRobot.
- Base para fine-tuning: punto de partida para adaptar la política a objetos o contenedores similares con pocos episodios adicionales.
- Pruebas de integración de hardware: verificar la sincronización de tres cámaras a 30 FPS y el control de un brazo de 6 DOF antes de escalar a tareas más complejas.
- Generación de datos sintéticos o aumentados: usar la política como generador de trayectorias para comparar con demostraciones humanas (con cautela, dado que no hay evaluación de éxito publicada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito en robot real, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~450M parámetros, en FP16 el peso ronda los 0,9 GB; en FP32, unos 1,8 GB. A ello hay que sumar activaciones y buffers de las cuatro cámaras de entrada, por lo que un presupuesto práctico de 4-8 GB de VRAM es razonable, aunque no está confirmado por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cabría esperar ejecución en RTX 3060/4060/4090, A100 o H100; LeRobot suele usar CUDA (`--policy.device=cuda`).
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del checkpoint (~0,9 GB de repo) y la naturaleza compacta de SmolVLA, pero no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pick_yellow_cube_v5_chunk1` (este) | 450.046.176 | no disponible | Pick-and-place de bloque amarillo en caja marrón | no disponible | Hugging Face, 0 descargas |
| SmolVLA (modelo base, paper 2506.01844) | no disponible en la información | no disponible | VLA generalista compacto | no disponible | Hugging Face / LeRobot |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica | varía | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable.
- Especialización extrema: entrenada solo para "pick the yellow block and place it in brown box"; no generaliza a otras tareas sin reentrenamiento.
- Licencia no declarada: no se puede asumir uso comercial; la model card marca la licencia como "[More Information Needed]".
- Dataset pequeño y de un solo autor: 100 episodios y 63.143 fotogramas, sin información sobre variabilidad de posiciones, iluminación o distractores.
- Dependencia de hardware concreto: robot `so_follower` y configuración de cámaras específica (tres vistas de 256×256 más una de 480×640); los nombres de cámara deben coincidir con las claves de observación.
- Cámara "empty" incluida en las observaciones: puede indicar un residuo de configuración que afecte a la reproducibilidad.
- Riesgo de sobreajuste y alucinación de acciones: al ser imitación pura, puede producir trayectorias erráticas ante distribuciones de entrada no vistas.
- Sin información sobre sesgos, idiomas ni cuantizaciones; no apta como modelo de lenguaje.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5_chunk1
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
