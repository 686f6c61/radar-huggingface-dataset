# boinkie/act_so101_santa_ducky_v1_toponly

## Resumen

`boinkie/act_so101_santa_ducky_v1_toponly` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705 y empaquetado mediante la librería LeRobot de Hugging Face. El modelo no es un LLM ni un modelo de lenguaje: es un controlador visomotor que, a partir del estado de las articulaciones del robot y una imagen de cámara cenital, predice directamente comandos de acción de 6 dimensiones para un brazo seguidor SO-101.

El modelo resuelve una tarea concreta y única: "Pick up the santa ducky and place it in the plate". Se entrenó con 58 episodios de teleoperación (15.558 frames a 30 FPS) recogidos por el autor en el dataset `boinkie/santa_ducky_v1_20261117_210148`. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo ligero diseñado para inferencia en tiempo real sobre hardware de consumo, no para despliegue en servidor.

Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de imitation learning con LeRobot (grabación de datos, entrenamiento ACT, rollout) y como punto de partida para quien quiera replicar la metodología en su propio robot SO-101. No aporta capacidades generales de razonamiento, lenguaje ni visión más allá de la política entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se pasa como cadena en el CLI) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `wrist`, `top` (la política publicada usa solo `observation.images.top`) |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida de acción | `action`, shape (6,) |
| Resolución de imagen | 3 × 480 × 640 |
| Frecuencia de control | 30 FPS (según dataset de entrenamiento) |
| Dataset de entrenamiento | `boinkie/santa_ducky_v1_20261117_210148` (58 episodios, 15.558 frames) |
| Pasos de entrenamiento | 40.000 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de compounding y estabiliza el control. La arquitectura combina un backbone transformer con un codificador visual que procesa la imagen de la cámara `top` a 480×640 y un decodificador que genera el chunk de acciones de dimensión 6 condicionado por el estado de las articulaciones (6 dimensiones). El nombre del repositorio (`toponly`) indica que esta variante se entrenó únicamente con la cámara cenital, descartando la cámara de muñeca que sí aparece declarada en la model card.

El entrenamiento se realizó con LeRobot 0.6.2, optimizador AdamW, learning rate 1e-5, batch size 8, semilla 1000 y 40.000 pasos sobre 58 episodios teleoperados a 30 FPS. No se documenta uso de RLHF, DPO ni fine-tuning posterior; es imitation learning supervisado puro sobre demostraciones. No hay información sobre aumento de datos, composición exacta del dataset más allá del recuento de episodios y frames, ni sobre innovaciones adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Control visomotor de un brazo SO-101 para una tarea de pick-and-place concreta: coger el "santa ducky" y depositarlo en el plato.
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular (6,) e imagen cenital 480×640.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación simbólica; la "tarea" es una cadena descriptiva que se pasa al CLI, no una instrucción interpretada semánticamente.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo "thinking".
- No generaliza a otras tareas ni objetos sin reentrenamiento.

## Casos de uso

- Replicación de un pipeline de imitation learning: usar este repositorio como referencia completa (dataset + pesos + configuración de entrenamiento) para reproducir el flujo `lerobot-train` → `lerobot-rollout` en un SO-101 propio.
- Benchmark interno de infraestructura robótica: desplegar la política en un banco de pruebas para medir latencia de inferencia, throughput de frames y estabilidad del bucle de control a 30 FPS antes de entrenar políticas propias.
- Docencia y formación: ejemplo mínimo y ligero (0,2 GB, 51,7 M de parámetros) para explicar ACT, chunks de acción y el formato de observaciones/acciones de LeRobot en un curso de robótica.
- Prueba de concepto de pick-and-place con cámara cenital única: validar si una sola vista `top` es suficiente para una tarea de manipulación antes de invertir en configuraciones multi-cámara.
- Base para fine-tuning: partir de estos pesos y reentrenar con un dataset propio del mismo robot y tarea similar para acelerar la convergencia frente a entrenar desde cero.
- Automatización de una celda de demostración: ejecutar la política en un SO-101 físico durante sesiones de divulgación o demos de laboratorio con `--duration` acotado.
- Verificación de compatibilidad de hardware: comprobar la integración de cámaras OpenCV, puerto del robot y nombres de observación exigidos por la política antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía con la nota literal: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni condiciones experimentales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors y un repositorio de 0,2 GB, la huella es del orden de cientos de MB en FP32 y muy inferior en FP16, pero no se documenta la cuantización ni el consumo real.
- GPU recomendadas: no disponible. El CLI de entrenamiento del autor usa `--policy.device=cuda`, lo que implica GPU NVIDIA para entrenamiento; para inferencia no se especifica.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño del modelo, pero no hay confirmación oficial ni lista de GPUs validadas (RTX 4090, etc.).
- Opciones de despliegue: `lerobot-rollout` (inferencia en robot real) y `lerobot-train` (reentrenamiento), ambos de la librería LeRobot 0.6.2. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. El único dato objetivo es la frecuencia de 30 FPS del dataset de entrenamiento, que marca el ritmo de control esperado, no el rendimiento medido.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `boinkie/act_so101_santa_ducky_v1_toponly` | ACT | 51,7 M | Estado (6,) + imagen top 480×640 | Pick-and-place santa ducky | no disponible | Hugging Face, 0 descargas |
| Políticas ACT oficiales de LeRobot | ACT | no disponible | Estado + imágenes | Tareas de ejemplo del framework | no disponible | Hugging Face (organización lerobot) |
| Políticas Diffusion Policy | Diffusion Policy | no disponible | Estado + imágenes | Manipulación diversa | no disponible | Hugging Face / repositorios de investigación |
| Políticas π0 / VLA generalistas | VLA (vision-language-action) | no disponible | Estado + imágenes + instrucción en lenguaje | Múltiples tareas | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, método y formato de entrada/salida.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con 58 episodios de un único operador, hereda los sesgos de posicionamiento, iluminación y estilo de teleoperación de ese operador.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erráticas fuera de distribución cuando el objeto, la iluminación o la posición inicial difieren de las condiciones de entrenamiento.
- Limitación de contexto: la política solo usa la vista `top`; la cámara `wrist` declarada en la model card no se emplea en esta variante (`toponly`), lo que reduce la información visual disponible para el agarre.
- Limitación de idioma: no procesa lenguaje; la cadena `--task` es descriptiva y no condiciona el comportamiento del modelo.
- Restricciones de licencia: la licencia figura como "[More Information Needed]" y no está disponible en los metadatos de Hugging Face; no se puede asumir uso comercial sin consultar al autor.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede recomendar para producción sin validación empírica propia.
- Sin cuantizaciones ni formato GGUF: el despliegue está atado al stack LeRobot y a PyTorch; no hay alternativas ligeras documentadas.
- Dataset pequeño: 58 episodios y 15.558 frames son una base limitada para robustez ante variaciones; se espera sobreajuste a las condiciones de grabación.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boinkie/act_so101_santa_ducky_v1_toponly
- Dataset de entrenamiento: https://huggingface.co/datasets/boinkie/santa_ducky_v1_20261117_210148
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=boinkie/santa_ducky_v1_20261117_210148
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
