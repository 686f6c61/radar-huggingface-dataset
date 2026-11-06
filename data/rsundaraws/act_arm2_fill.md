# rsundaraws/act_arm2_fill

## Resumen

`rsundaraws/act_arm2_fill` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub por el usuario rsundaraws mediante la librería LeRobot de Hugging Face. El modelo resuelve una tarea robótica concreta de manipulación —recoger un cubo y depositarlo en una caja naranja— sobre un robot tipo `so_follower` (SO-101), a partir de observaciones consistentes en el estado articular de 6 dimensiones y dos cámaras (muñeca y cenital).

A diferencia de los modelos de lenguaje, no se trata de un modelo generativo de texto ni de un transformer autoregresivo de gran escala: es una política visomotora de 51,7 millones de parámetros que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de imitación. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es práctica para la comunidad de robótica de bajo coste: demuestra el flujo completo de LeRobot (grabación de datos teleoperados, entrenamiento de ACT y despliegue en hardware real) con un conjunto de datos pequeño (65 episodios, 22.621 frames a 30 FPS) y una configuración de entrenamiento reproducible. No obstante, es un modelo de nicho, sin resultados de evaluación publicados y con un único cometido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política por episodio, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (codificador de imágenes por cámara) con un transformer que predice un chunk de acciones futuras en cada paso de inferencia, en lugar de una sola acción. Esta predicción por bloques reduce el error de acumulación y la varianza temporal típica de las políticas paso a paso. El modelo consume `observation.state` de forma `(6,)`, una imagen de muñeca de `(3, 480, 640)` y una imagen cenital de `(3, 360, 640)`, y produce una acción de forma `(6,)` correspondiente a las articulaciones del robot `so_follower`.

El entrenamiento se realizó sobre el dataset `rsundaraws/so101_arm2_fill_trim`: 65 episodios, 22.621 frames a 30 FPS, con la tarea "Pick up the cube and place it in the orange box". La configuración documentada es de 30.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se especifica el número de tokens ni composición de dataset más allá de lo anterior, ni si hubo RLHF/DPO (no aplica en este paradigma). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor de un brazo robótico SO-101 (`so_follower`) con 6 grados de libertad de acción.
- Predicción de chunks de acciones a partir de dos vistas de cámara (muñeca y cenital) y del estado articular.
- Ejecución de una tarea única y específica: recoger un cubo y colocarlo en una caja naranja.
- Aprendizaje por imitación a partir de datos teleoperados; no requiere definición explícita de recompensas.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de recogida y depósito de un cubo en una caja sobre el robot SO-101, útil para validar pipelines de manipulación de bajo coste antes de escalar a tareas más complejas.
- Reproducción de experimentos de aprendizaje por imitación: sirve como referencia reproducible de ACT con un dataset pequeño (65 episodios), permitiendo comparar hiperparámetros y configuraciones de cámaras.
- Base para fine-tuning en tareas similares: al estar entrenado sobre `so_follower` con dos cámaras, puede reentrenarse con nuevos datasets de la misma morfología para tareas de recogida y colocación.
- Docencia y formación en robótica: ejemplo completo del flujo LeRobot (grabación, entrenamiento, despliegue) con comandos documentados y requisitos de hardware asequibles.
- Pruebas de integración de hardware: validación de calibración de cámaras, puertos y cinemática del SO-101 antes de desplegar políticas más complejas.
- Benchmark interno de latencia y throughput: permite medir el rendimiento de inferencia de ACT en una GPU concreta con una política de 51,7 M de parámetros y dos flujos de vídeo a 30 FPS.
- Prototipado de demostraciones: generación de vídeos de política en funcionamiento para documentación o presentaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (≈0,2 GB en FP32) el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer moderna, aunque el consumo real depende de los buffers de imagen (480×640 y 360×640) y del tamaño del chunk de acciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente (RTX 3060, RTX 4060, RTX 4090, A100, H100). No hay datos oficiales de compatibilidad.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs consumer actuales; sin confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=rsundaraws/act_arm2_fill`), integración con el robot `so_follower` y cámaras OpenCV. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput estimados: no disponibles. El sistema opera a 30 FPS según el dataset, pero no se publican métricas de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rsundaraws/act_arm2_fill` (ACT) | 51,7 M | no aplica | sin evaluación publicada | Apache 2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot Hub | variable (no disponible) | no aplica | no disponible | variable | Hugging Face Hub |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | no disponible | variable | Hugging Face Hub |
| Políticas pi0 / VLA de gran escala | no disponible | no aplica | no disponible | variable | Hugging Face Hub |

No se dispone de datos cuantitativos para establecer una comparación rigurosa con alternativas concretas. La comparación cualitativa se limita a la categoría (políticas de imitación para manipulación robótica en LeRobot) y al tamaño (51,7 M de parámetros, muy por debajo de los VLA de gran escala).

## Limitaciones y advertencias

- Tarea única y específica: solo se ha entrenado para "Pick up the cube and place it in the orange box"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que se desconoce su robustez real en producción.
- Dataset pequeño: 65 episodios y 22.621 frames; riesgo de sobreajuste a posiciones, iluminación y objetos del entorno de grabación.
- Dependencia de hardware concreto: requiere robot `so_follower`, dos cámaras con nombres `wrist` y `overhead`, y calibración específica; no es portable a otras morfologías sin cambios.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política de imitación, puede producir movimientos erráticos ante distribuciones de entrada no vistas.
- Sesgos: no documentados por el autor; pueden derivarse del entorno de grabación y del operador que teleoperó los datos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Repositorio con muy poca tracción (21 descargas, 0 likes) y sin demo ni vídeo; la madurez del artefacto es baja.
- No se documentan cuantizaciones ni formatos alternativos, lo que limita el despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsundaraws/act_arm2_fill
- Dataset de entrenamiento: https://huggingface.co/datasets/rsundaraws/so101_arm2_fill_trim
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rsundaraws/so101_arm2_fill_trim
