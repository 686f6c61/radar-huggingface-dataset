# SoSolaris/xvla-b1123-1444-xv4_meanstd_hot

## Resumen

X-VLA (`SoSolaris/xvla-b1123-1444-xv4_meanstd_hot`) es un ajuste fino de política robótica basado en el framework X-VLA, un sistema Vision-Language-Action con *flow matching* y *soft prompts* presentado en el paper arXiv:2510.10274. El modelo parte del checkpoint base `lerobot/xvla-base` y ha sido entrenado con la librería LeRobot 0.6.2 para ejecutar una tarea concreta de manipulación bimanual: agarrar una lata y verter su contenido en una taza.

El interés técnico del enfoque X-VLA reside en que trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de *embeddings* de soft prompt aprendibles. Esto permite que un único modelo reconcilie morfologías, sensores y espacios de acción distintos sin necesidad de arquitecturas específicas por robot. En este caso, el ajuste está especializado en un robot bimanual `solaria_bimanual` con tres cámaras (vistas `up`, `right` y `left`) y un vector de estado de 8 dimensiones.

El modelo tiene 879.687.256 parámetros (datos reales de los pesos safetensors), un repositorio de 1,8 GB y licencia Apache 2.0. Es un modelo de investigación con cero descargas y cero *likes* en el momento de redactar esta ficha, sin resultados de evaluación publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action con flow matching y soft prompts (X-VLA) |
| Parámetros totales | 879.687.256 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | solaria_bimanual |
| Cámaras de entrada | up, right, left |
| Entrada visual | `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.images.image3` (3, 224, 224) |
| Entrada de estado | `observation.state` (8,) |
| Salida de acción | `action` (14,) |
| Dataset de entrenamiento | SoSolaris/can_to_mug_merged_20261117_trimmed (195 episodios, 200.716 frames, 30 FPS) |
| Pasos de entrenamiento | 25.000 |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

X-VLA es un framework Vision-Language-Action que combina un codificador visión-lenguaje con un cabezal de acción basado en *flow matching*. La innovación principal es el uso de *soft prompts*: cada robot o configuración de hardware se representa mediante un pequeño conjunto de *embeddings* aprendibles que condicionan al modelo sobre la morfología, los sensores y el espacio de acción disponibles. Así, un mismo modelo puede adaptarse a distintos robots sin cambiar la arquitectura, simplemente asociando un soft prompt a cada plataforma.

Este checkpoint concreto se ha ajustado desde `lerobot/xvla-base` sobre el dataset `can_to_mug_merged_20261117_trimmed`, compuesto por 195 episodios y 200.716 frames grabados a 30 FPS para la tarea "Grab the can and pour its contain in the mug (without water)". El entrenamiento se realizó con LeRobot 0.6.2, optimizador `xvla-adamw`, learning rate 0.0002, batch size 16, semilla 1000 y 25.000 pasos. No se especifica en la información disponible el número de tokens de entrenamiento del modelo base ni si hubo fases de RLHF o DPO.

## Capacidades

- Control robótico de manipulación bimanual: genera trayectorias de acción de 14 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres flujos de imagen simultáneos (dos a 256×256 y uno a 224×224) para construir una representación del entorno.
- Ejecución de una tarea específica de vertido: agarrar una lata y verter su contenido en una taza.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se entrena con `lerobot-train`.
- Condicionamiento por soft prompt: el modelo puede, en principio, reutilizarse para otras morfologías si se entrena el soft prompt correspondiente, aunque este checkpoint está especializado en `solaria_bimanual`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas, visión generalista ni audio.

## Casos de uso

- Automatización de tareas de vertido en laboratorio: el modelo ejecuta la política "Grab the can and pour its contain in the mug (without water)" sobre un robot bimanual `solaria_bimanual`, útil para prototipos de manipulación de líquidos o materiales granulares.
- Investigación en imitación visual-motora: sirve como punto de partida para estudiar cómo los soft prompts de X-VLA condicionan el comportamiento en un robot bimanual concreto.
- Reentrenamiento con nuevos datasets: al estar construido sobre `lerobot/xvla-base` y LeRobot, se puede ajustar con `lerobot-train` sobre datos propios para variantes de la misma tarea (distintos objetos, posiciones o recipientes).
- Evaluación de robustez multi-cámara: las tres vistas (`up`, `right`, `left`) permiten analizar la contribución de cada cámara a la política y experimentar con configuraciones reducidas.
- Benchmark interno de políticas VLA: útil como referencia de ajuste fino de X-VLA en una tarea de contacto físico con 195 episodios y 200.716 frames.
- Docencia y demostraciones de imitación robótica: el flujo `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política en tiempo real durante sesiones de 60 segundos sin grabar episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito, comparativas con otras políticas ni métricas de latencia o throughput documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 879,7 M de parámetros, en FP16 los pesos ocupan aproximadamente 1,76 GB; en FP32, unos 3,5 GB. A ello hay que sumar el coste de los tres flujos de imagen y del cabezal de flow matching.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8 GB o más debería poder alojar los pesos en FP16, aunque no hay validación publicada.
- Cabe en GPU consumer: probablemente sí en tarjetas con 8-16 GB (RTX 3060, 4060 Ti, 4070, 4080, 4090), sin datos oficiales de compatibilidad.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/xvla-b1123-1444-xv4_meanstd_hot | 879,7 M | no disponible | Manipulación bimanual (vertido lata-taza) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/xvla-base | no disponible | no disponible | Base VLA multi-robot con soft prompts | no disponible en la información | Hugging Face (modelo base) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica | no disponible | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no es posible porque no se han publicado métricas de rendimiento para este checkpoint ni se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea "Grab the can and pour its contain in the mug (without water)" sobre el robot `solaria_bimanual`; no se espera generalización a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Dependencia de hardware concreto: requiere el robot `solaria_bimanual` y tres cámaras con los nombres e índices exactos (`up`, `right`, `left`) usados en el entrenamiento.
- Riesgo de sobreajuste: con solo 195 episodios y 25.000 pasos de entrenamiento, la política puede memorizar posiciones y condiciones del dataset.
- Idiomas no documentados: no se especifica ningún soporte lingüístico; la instrucción de tarea se pasa como texto fijo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base `lerobot/xvla-base`.
- Cero tracción comunitaria: 0 descargas y 0 *likes* implican ausencia de validación externa y de reportes de fallos.
- Sin datos de cuantización ni formatos alternativos: solo se distribuyen pesos safetensors para LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/xvla-b1123-1444-xv4_meanstd_hot
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/can_to_mug_merged_20261117_trimmed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/can_to_mug_merged_20261117_trimmed
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
