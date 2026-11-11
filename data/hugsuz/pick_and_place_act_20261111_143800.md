# hugsuz/pick_and_place_act_20261111_143800

## Resumen

Este repositorio contiene una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el paper arXiv:2304.13705. El modelo ha sido desarrollado por el usuario `hugsuz` y publicado en Hugging Face mediante la librería LeRobot de Hugging Face. Su función es controlar un robot `omx_follower` para ejecutar la tarea concreta de "pick_and_place" (recoger y colocar), prediciendo secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control.

El modelo es un transformer pequeño, con 51.668.614 parámetros, que consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de imagen de 240x320 píxeles procedentes de cámaras de muñeca y cenital. Produce un vector de acción de 6 dimensiones. El repositorio ocupa 0,2 GB y los pesos están en formato safetensors.

Es relevante como ejemplo práctico de política de imitación lista para desplegar en un robot de bajo coste, entrenada con solo 46 episodios (9.095 fotogramas a 30 FPS) y 1.000 pasos de entrenamiento. No obstante, se trata de un artefacto experimental de un usuario individual, sin licencia declarada ni resultados de evaluación publicados, por lo que su uso en producción requiere validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada multimodal estado + imagen) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos cámaras de 3x240x320) con un transformer que predice chunks de acciones, es decir, secuencias de acciones futuras en lugar de una única acción por paso. Esta formulación reduce el horizonte efectivo de decisión y mitiga el error compounding típico de las políticas paso a paso. La entrada de estado es un vector de 6 dimensiones y la salida de acción también es de 6 dimensiones, coherente con un robot de 6 grados de libertad.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `hugsuz/pick_and_place_20261111_141150`, compuesto por 46 episodios, 9.095 fotogramas a 30 FPS y una única tarea ("pick_and_place"). La configuración fue de 1.000 pasos, batch size 10, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta uso de RLHF, DPO ni aumentos de datos, ni innovaciones adicionales más allá del propio mecanismo de action chunking del método ACT.

## Capacidades

- Control robótico de manipulación para la tarea específica "pick_and_place" sobre el robot `omx_follower`.
- Predicción de chunks de acciones (action chunking) a partir de estado articular e imágenes.
- Fusión de dos vistas visuales (cámara de muñeca y cámara cenital) con el estado propioceptivo.
- Ejecución de políticas en tiempo real mediante el comando `lerobot-rollout`.
- Reentrenamiento y ajuste con `lerobot-train` sobre nuevos datasets en formato LeRobot.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No es un modelo multilingüe ni de propósito general: no genera texto ni responde a prompts lingüísticos.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de recogida y colocación sobre el robot `omx_follower` con las cámaras calibradas, sirviendo como base para experimentos de imitación en entornos controlados.
- Prototipado rápido de políticas con LeRobot: al estar en formato LeRobot y safetensors, se puede cargar con `lerobot-rollout` para validar el pipeline completo (hardware, cámaras, calibración) antes de entrenar políticas propias.
- Docencia y formación en robótica de imitación: es un ejemplo reproducible de entrenamiento ACT con un dataset pequeño (46 episodios), útil para explicar action chunking y el flujo de LeRobot de principio a fin.
- Benchmark interno de referencia: sirve como línea base para comparar nuevas políticas entrenadas sobre el mismo dataset o sobre variantes del mismo robot.
- Reentrenamiento con datos propios: el repositorio incluye el comando `lerobot-train` con `--policy.type=act`, de modo que se puede reutilizar la configuración como plantilla para nuevas tareas de manipulación.
- Investigación en generalización visual: al usar dos cámaras (muñeca y cenital), permite estudiar cómo afectan cambios de iluminación, posición de objetos o distractores al éxito de la política, aunque el autor no haya publicado dicha evaluación.
- Integración en pipelines de evaluación automatizada: la política se puede lanzar con `--duration` acotado y `--strategy.type=base` para ejecuciones sin grabación, facilitando pruebas repetidas en banco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, la huella de pesos es de aproximadamente 0,2 GB en FP32, por lo que cualquier GPU consumer moderna es suficiente.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060 o superior es holgada. El entrenamiento se realizó con `--policy.device=cuda`, sin detallar el modelo de GPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo y del repositorio (0,2 GB).
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte de safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 30 FPS, pero no se publican métricas de latencia de inferencia ni de tasa de éxito.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hugsuz/pick_and_place_act_20261111_143800 | 51,7 M | no aplica | sin evaluación publicada | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de referencia (LeRobot, p. ej. aloha/act) | del orden de decenas de millones | no aplica | reportadas en sus model cards | según repositorio | Hugging Face |
| Políticas Diffusion Policy | no disponible en esta ficha | no aplica | no disponible | según repositorio | Hugging Face / repos públicos |

No se dispone de datos comparativos verificables en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "More Information Needed"; no se puede asumir uso comercial permitido.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que el rendimiento real es desconocido.
- Entrenamiento muy corto: 1.000 pasos con batch 10 y learning rate 1e-05 sobre solo 46 episodios; alta probabilidad de sobreajuste al entorno y a las posiciones de objeto del dataset.
- Tarea única y robot específico: la política está entrenada para `omx_follower` con cámaras `wrist` y `top` y la tarea "pick_and_place"; no generaliza a otros robots, cámaras u objetos sin reentrenamiento.
- Sensibilidad al entorno: cambios de iluminación, fondo, posición inicial de objetos o calibración de cámaras pueden degradar el comportamiento; el autor no documenta pruebas de robustez.
- Riesgo de alucinación en sentido figurado: como política de imitación, puede producir acciones fuera de distribución sin señal de confianza, lo que exige supervisión y paradas de seguridad en el robot.
- Sin soporte multilingüe ni de texto: no debe emplearse como modelo de lenguaje ni para tareas de razonamiento.
- Repositorio de usuario individual con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento garantizado.
- Fecha de creación declarada en 2026: conviene verificar la integridad y procedencia de los artefactos antes de desplegarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugsuz/pick_and_place_act_20261111_143800
- Dataset de entrenamiento: https://huggingface.co/datasets/hugsuz/pick_and_place_20261111_141150
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hugsuz/pick_and_place_20261111_141150
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
