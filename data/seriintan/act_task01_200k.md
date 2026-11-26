# seriintan/act_task01_200k

## Resumen

`seriintan/act_task01_200k` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado con LeRobot 0.6.2, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (estado articular de 6 dimensiones e imagen frontal de 480x640 píxeles) a comandos de acción de 6 dimensiones.

El modelo resuelve una única tarea concreta: "pick a black cube to the box" (coger un cubo negro y depositarlo en una caja). Se entrenó sobre un dataset de 50 episodios teleoperados (17.315 fotogramas a 30 FPS) recogidos con un robot de tipo `so_follower` y una sola cámara frontal. Con 51,6 millones de parámetros y un repositorio de 2,1 GB, es un modelo compacto orientado a despliegue en hardware de bajo coste.

Su relevancia es la de un artefacto reproducible de aprendizaje por imitación: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento con ACT, publicación en el Hub y despliegue con `lerobot-rollout`) sobre una tarea de manipulación sencilla. No hay resultados de evaluación publicados ni métricas de éxito en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena de texto fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mitiga el problema de la ambigüedad de las demostraciones humanas. La política consume `observation.state` (vector de 6 dimensiones) y `observation.images.front` (tensor 3x480x640) y produce `action` (vector de 6 dimensiones). El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Bryan304/ACT_task_01_20261125_185350`: 50 episodios, 17.315 fotogramas a 30 FPS, una única tarea y una única cámara. La configuración fue de 200.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplicable en imitación supervisada). No se indican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Manipulación robótica visomotora: predice comandos de acción de 6 dimensiones a partir de estado articular e imagen frontal.
- Ejecución de una tarea única y concreta: "pick a black cube to the box".
- Aprendizaje por imitación a partir de demostraciones teleoperadas (sin refuerzo).
- Predicción de chunks de acción, que aporta suavidad y consistencia temporal frente a políticas paso a paso.
- Integración con el ecosistema LeRobot: entrenamiento, publicación y despliegue mediante CLI (`lerobot-rollout`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de una celda de pick-and-place: la política ejecuta la secuencia de coger un cubo negro y soltarlo en una caja sobre un robot `so_follower`, adecuada para demostrar un pipeline completo de imitación en laboratorio.
- Prototipado rápido de políticas con LeRobot: sirve como plantilla reproducible para validar el flujo `lerobot-train` → Hub → `lerobot-rollout` antes de escalar a tareas propias.
- Docencia y formación en robótica de imitación: ejemplo mínimo (51,6 M de parámetros, una cámara, 50 episodios) para explicar ACT y el formato de datasets LeRobot.
- Benchmark interno de hardware: al ser una política ligera, permite medir latencia de inferencia y throughput en GPUs de consumo y en sistemas embebidos.
- Base para fine-tuning: punto de partida para reentrenar sobre nuevas posiciones de objeto, iluminación o variantes de la misma tarea con datasets propios.
- Validación de calibración de robots `so_follower`: comprobar que la cadena cámara-estado-acción funciona antes de desplegar políticas más complejas.
- Demostración en ferias o vídeos técnicos: tarea acotada y visualmente clara para mostrar aprendizaje por imitación en robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía ("No evaluation results have been provided for this policy yet"), sin tasas de éxito ni número de ensayos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors (fp32) el peso ronda los 200 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100). El cuello de botella real será el procesamiento de imagen a 480x640 y 30 FPS, no la memoria.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con unos pocos GB de VRAM; no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles; el dataset y el despliegue están pensados a 30 FPS, pero no se publican medidas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| seriintan/act_task01_200k | ACT (LeRobot) | 51,6 M | no aplica | pick a black cube to the box | apache-2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT (LeRobot) | variable | no aplica | tareas diversas | según repositorio | Hugging Face |
| Diffusion Policy (referencia) | política de difusión | variable | no aplica | manipulación diversa | según implementación | paper/repos |
| Otros checkpoints ACT de la comunidad | ACT (LeRobot) | variable | no aplica | tareas específicas | según repositorio | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Tarea única y altamente específica: solo se entrenó para "pick a black cube to the box"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni ensayos, por lo que se desconoce su robustez real.
- Dependencia de la configuración exacta: una sola cámara frontal, robot `so_follower` y estado de 6 dimensiones; cambios de cámara, calibración o robot pueden degradar el comportamiento.
- Dataset pequeño: 50 episodios y 17.315 fotogramas limitan la diversidad de posiciones, iluminación y distractores.
- Riesgo de sobreajuste al entorno de grabación y de fallo ante objetos o condiciones no vistas.
- No es un modelo de lenguaje: no procesa instrucciones libres; el texto de la tarea es fijo.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos; en robótica, el riesgo principal es el fallo físico (colisiones, agarres incorrectos) y requiere supervisión en producción.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/act_task01_200k
- Dataset de entrenamiento: https://huggingface.co/datasets/Bryan304/ACT_task_01_20261125_185350
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Bryan304/ACT_task_01_20261125_185350
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
