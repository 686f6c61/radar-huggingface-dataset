# NaH-ReAlLy/diffusion_so101_cube

## Resumen

`NaH-ReAlLy/diffusion_so101_cube` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada a través de LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real. El modelo resuelve una tarea concreta de manipulación: recoger un cubo y depositarlo en una papelera, sobre un robot de tipo `so_follower` (familia SO-101) equipado con una única cámara de muñeca. No es un modelo de lenguaje: consume estado propioceptivo de 6 dimensiones y una imagen RGB de 480x640, y produce una acción de 6 dimensiones.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo completo de LeRobot 0.6.2 para entrenar y desplegar políticas de difusión en hardware de bajo coste. Por otro, sirve como referencia de las limitaciones típicas de estas políticas: dataset pequeño (51 episodios, 23.612 fotogramas a 30 FPS), una sola tarea y ausencia de evaluación en robot real publicada por el autor.

El checkpoint contiene 262.962.942 parámetros en formato safetensors (1,1 GB de repositorio) y se distribuye bajo licencia Apache 2.0. La arquitectura subyacente es la de Diffusion Policy descrita en el paper arXiv:2303.04137, que modela el control como un proceso generativo de difusión sobre secuencias de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor; implementación LeRobot `diffusion`) |
| Parametros totales | 262.962.942 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo no lingüístico; la instrucción de tarea es una cadena fija: "Pick up the cube and place it in the bin") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist` (1 cámara) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.wrist`, shape `(3, 480, 640)` |
| Salida de acción | `action`, shape `(6,)` |
| Dataset de entrenamiento | `shamux/so101_cube_camera` (51 episodios, 23.612 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 47.224 |
| Batch size | 4 |
| Optimizador | Adam |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo: en lugar de predecir una única acción de forma determinista, aprende a denoizar trayectorias de acción completas, lo que produce movimientos suaves y multi-paso especialmente adecuados para manipulación con contacto rico. La implementación corresponde al tipo `diffusion` de LeRobot, que combina un codificador visual para la imagen de muñeca con un codificador del estado propioceptivo y un cabezal de difusión que genera la secuencia de acciones de 6 dimensiones. El número total de parámetros reportado en los safetensors es de 262.962.942.

El entrenamiento se realizó sobre el dataset `shamux/so101_cube_camera`, compuesto por 51 episodios y 23.612 fotogramas capturados a 30 FPS, con una única tarea: "Pick up the cube and place it in the bin". La configuración reportada incluye 47.224 pasos, batch size 4, optimizador Adam con learning rate 0,0001 y semilla 1000, ejecutado con LeRobot 0.6.2. La model card no documenta el uso de RLHF, DPO ni fases de ajuste posteriores al entrenamiento por imitación, ni detalla la composición exacta de las observaciones más allá de las shapes indicadas.

## Capacidades

- Control visuomotor de manipulación: genera trayectorias de acción de 6 dimensiones a partir de una imagen de muñeca y del estado del robot.
- Manipulación con contacto: el paradigma de difusión produce acciones suaves y multi-paso, adecuadas para tareas de agarre y colocación.
- Ejecución de una tarea concreta: "Pick up the cube and place it in the bin".
- Inferencia en robot real mediante `lerobot-rollout` con `--strategy.type=base`.
- Entrenamiento reproducible con `lerobot-train` y `--policy.type=diffusion`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de "thinking": es una política de robótica, no un modelo de lenguaje.
- No se documentan capacidades de visión general, audio ni procesamiento de texto.

## Casos de uso

- Recogida y depósito de objetos en entornos de laboratorio: la política ejecuta la tarea "Pick up the cube and place it in the bin" sobre un SO-101 con cámara de muñeca, útil como baseline reproducible en experimentos de manipulación.
- Docencia y formación en aprendizaje por imitación: sirve como ejemplo completo del pipeline de LeRobot (grabación de dataset, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) para cursos de robótica.
- Prototipado rápido de políticas de difusión: al estar publicada en el Hub con configuración de entrenamiento documentada (47.224 pasos, batch 4, lr 0,0001), permite reproducir y comparar variantes del método Diffusion Policy.
- Benchmark interno de hardware de bajo coste: el modelo cabe en 1,1 GB y se ejecuta sobre un robot SO-101, lo que facilita medir latencia y éxito en GPUs de consumo frente a configuraciones de laboratorio.
- Base para fine-tuning en tareas de pick-and-place: el checkpoint puede reentrenarse con `lerobot-train` sobre datasets propios con el mismo esquema de observaciones (estado de 6 dimensiones más imagen de muñeca).
- Evaluación de robustez ante cambios de iluminación y posiciones: al no haber resultados de evaluación publicados, el modelo es un punto de partida para medir cómo varía la tasa de éxito con distractores o cambios de escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la nota literal "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 262.962.942 parámetros en safetensors (1,1 GB), la inferencia en FP32 requiere del orden de 1 GB de VRAM solo para pesos, más el coste del codificador visual y del proceso de difusión.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos unos pocos GB de VRAM libre debería poder cargar los pesos; para entrenamiento se recomienda una GPU NVIDIA con soporte CUDA, ya que la configuración de ejemplo usa `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint (1,1 GB), aunque el autor no publica requisitos mínimos ni latencias medidas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según el dataset de entrenamiento, pero no se reportan tiempos de inferencia reales.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `NaH-ReAlLy/diffusion_so101_cube` | Diffusion Policy (LeRobot) | 262.962.942 | no aplica | Pick-and-place de cubo sobre SO-101 | Apache 2.0 | Hugging Face |
| Otras políticas `diffusion` de LeRobot | Diffusion Policy (LeRobot) | no disponible | no aplica | Varía por checkpoint | Apache 2.0 (habitual) | Hugging Face |
| Políticas ACT de LeRobot | Action Chunking Transformer | no disponible | no aplica | Varía por checkpoint | Apache 2.0 (habitual) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset muy pequeño: 51 episodios y 23.612 fotogramas para una única tarea, lo que limita la generalización a posiciones, iluminación y objetos distintos de los vistos en entrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Una sola cámara y un solo robot: entrenada para `so_follower` con cámara `wrist`; cambios de montaje, calibración o tipo de robot invalidan la política.
- Tarea única y no parametrizable: la instrucción es fija ("Pick up the cube and place it in the bin"); no es un modelo de propósito general ni acepta instrucciones arbitrarias en lenguaje natural.
- Sin capacidades lingüísticas: no procesa texto, no soporta tool calling ni agentes; cualquier uso como modelo de lenguaje es inadecuado.
- Riesgo de sobreajuste al entorno de captura: al no documentarse variaciones de escena, es probable que el rendimiento caiga con distractores o cambios de fondo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del dataset `shamux/so101_cube_camera` por separado.
- Sin datos de sesgos: no se documentan sesgos, pero al ser una política visual puede heredar sesgos de los datos de captura (iluminación, posición de cámara, tipo de objeto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NaH-ReAlLy/diffusion_so101_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/shamux/so101_cube_camera
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shamux/so101_cube_camera
