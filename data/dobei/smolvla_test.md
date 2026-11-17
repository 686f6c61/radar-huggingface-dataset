# dobei/smolvla_test

## Resumen

`dobei/smolvla_test` es un modelo de vision-lenguaje-acción (VLA) compacto, afinado a partir de `lerobot/smolvla_base`, que implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. El modelo consume observaciones multimodales de un robot (estado de las articulaciones e imágenes de cámaras) y produce directamente comandos de acción de 6 dimensiones, sin necesidad de un planificador intermedio. Está pensado para control robótico por imitación en hardware de consumo, no para generación de texto general.

Con 450.046.176 parámetros totales y un repositorio de 0,9 GB en formato safetensors, se trata de un ajuste fino muy ligero: solo 10 pasos de entrenamiento con batch de 4 sobre un dataset de 25 episodios y 11.286 fotogramas a 30 FPS. La tarea aprendida es un "pick and place" específico sobre un robot SO-101 (tipo `so_follower`) con tres cámaras (`scene`, `wrist` y una tercera no documentada en la model card).

Es relevante como ejemplo reproducible del flujo de trabajo de LeRobot 0.7.1 para entrenar políticas VLA pequeñas en local, y como caso de estudio de los límites del ajuste fino con muy pocos pasos. No es un modelo de propósito general ni un asistente conversacional: su licencia Apache 2.0 y su tamaño permiten desplegarlo en GPU de consumo, pero su calidad operativa no está validada (el autor no reporta evaluaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto segun arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible (modelo de control robotico, sin interfaz de lenguaje natural documentada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una política VLA compacta que combina un codificador visual, un codificador de lenguaje y un cabezal de acciones, entrenada para mapear observaciones (imágenes y estado proprioceptivo) a comandos motores. El modelo base `lerobot/smolvla_base` se distribuye a través de LeRobot y está descrito en el paper arXiv:2506.01844, que presenta SmolVLA como un VLA eficiente desplegable en hardware de consumo. No se dispone en la información proporcionada de detalles sobre el número de tokens de preentrenamiento del modelo base, la composición de su dataset ni si se aplicó RLHF o DPO.

Este repositorio concreto es un ajuste fino supervisado por imitación sobre el dataset `dobei/so101_red_cube_blue_box_2_20261117_161737`: 25 episodios, 11.286 fotogramas a 30 FPS, tarea "pick and place". La configuración de entrenamiento es mínima: 10 pasos, batch de 4, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.7.1. Las entradas son `observation.state` de forma `(6,)` y tres imágenes de `(3, 256, 256)`; la salida es un vector de acción `(6,)`. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en este ajuste.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad a partir de estado de articulaciones e imágenes.
- Fusión multimodal visión-lenguaje-acción: procesa tres flujos visuales de 256x256 junto con el estado proprioceptivo.
- Ejecución de una tarea concreta de "pick and place" sobre robot SO-101 (`so_follower`).
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- Despliegue en hardware de consumo según la descripción del modelo base SmolVLA.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, thinking mode, audio ni generación de texto libre.
- Capacidades multilingües: no disponibles; el modelo no expone una interfaz de lenguaje natural documentada.

## Casos de uso

- Replicación de experimentos de imitación: sirve para reproducir el pipeline completo de LeRobot (grabación, entrenamiento y rollout) con un coste computacional bajo, útil en docencia e investigación de robótica.
- Punto de partida para ajuste fino: al derivar de `lerobot/smolvla_base`, se puede reentrenar con `lerobot-train` sobre un dataset propio de manipulación para adaptar la política a nuevas tareas.
- Prototipado de pick and place en SO-101: permite validar la cadena hardware-software (cámaras, calibración, puerto serie) antes de invertir en entrenamientos más largos.
- Pruebas de infraestructura de inferencia robótica: su tamaño de 450 M parámetros permite medir latencia y throughput de `lerobot-rollout` en GPUs modestas sin grandes costes.
- Benchmark de referencia negativa: con solo 10 pasos de entrenamiento, es útil para comparar curvas de aprendizaje frente a ajustes más prolongados sobre el mismo dataset.
- Generación de datos sintéticos de evaluación: ejecutar la política en simulación o en robot real para estudiar modos de fallo de políticas poco entrenadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en FP32 se requieren aproximadamente 1,8 GB solo para pesos, más activaciones y buffers de las tres cámaras de 256x256.
- GPU recomendadas: no especificadas por el autor; el modelo base SmolVLA se describe como desplegable en hardware de consumo.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4090), aunque no hay cifras publicadas para este ajuste concreto.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`), con el paquete `lerobot` 0.7.1 o compatible; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dobei/smolvla_test | 450 M | no disponible | Pick and place SO-101 | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA general base | no disponible en la informacion | Hugging Face |
| Otros VLA comparables (p. ej. OpenVLA, pi0) | no disponible en la informacion | no disponible | Manipulacion robotica | no disponible en la informacion | no disponible |

No se dispone de datos de rendimiento de alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenamiento extremadamente corto: 10 pasos con batch 4 sobre 25 episodios; la política probablemente no ha convergido y su fiabilidad operativa es dudosa.
- Ausencia total de evaluación: el autor no reporta tasas de éxito ni condiciones de prueba.
- Dataset muy pequeño y específico: una sola tarea ("pick and place") con objetos concretos (cubo rojo, caja azul) y un único tipo de robot.
- Dependencia estricta de la configuración de sensores: las claves de cámara y el orden de observaciones deben coincidir con las del entrenamiento (`observation.state` de 6 dimensiones, tres imágenes de 256x256).
- La model card lista tres cámaras de entrada, pero solo documenta dos (`scene`, `wrist`); la tercera no está descrita, lo que puede dificultar la reproducción.
- Sin capacidades de lenguaje natural ni de razonamiento general: no debe emplearse como asistente conversacional.
- Riesgo de sobreajuste y de comportamiento errático fuera de la distribución de entrenamiento (posiciones, iluminación, objetos distintos).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación hace desaconsejable su uso en producción sin una reevaluación propia.
- No se documentan sesgos demográficos ni lingüísticos porque el modelo no procesa lenguaje natural de forma expuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dobei/smolvla_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/dobei/so101_red_cube_blue_box_2_20261117_161737
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dobei/so101_red_cube_blue_box_2_20261117_161737
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
