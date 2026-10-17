# MadmanMischief/act_so101_candy_sort_half

## Resumen

Este repositorio contiene una política robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. La publica MadmanMischief y se distribuye en formato LeRobot/safetensors para el robot SO-101 (`so_follower`), con dos cámaras: `wrist` y `phone`.

El modelo resuelve una tarea concreta de manipulación: recoger un caramelo azul ("pick up the blue candy"). Consume un estado de 6 dimensiones y dos imágenes de 3 canales con resoluciones 240 × 320 y 360 × 640, y produce una acción de 6 dimensiones. Tiene 51.668.614 parámetros y el repositorio ocupa 0,2 GB, por lo que es un modelo pequeño para inferencia en robótica, no un modelo de lenguaje.

Es relevante como ejemplo reproducible de ACT con LeRobot 0.6.2: incluye un dataset de 30 episodios y 8.124 fotogramas a 30 FPS, una configuración de entrenamiento de 20.000 pasos y un comando de rollout. No hay resultados de evaluación ni licencia declarada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación para robótica; implementación LeRobot (`policy.type=act`) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible / no aplica: no es un modelo de lenguaje; usa observaciones de estado e imágenes, no tokens de contexto |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible; no es un modelo multilingüe ni procesa lenguaje general |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio LeRobot); tamaño del repositorio 0,2 GB |
| Robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 240, 320), `observation.images.phone` (3, 360, 640) |
| Salidas | `action` (6,) |
| Tarea entrenada | "pick up the blue candy" |
| Dataset | `MadmanMischief/so101_candy_sort_half`: 30 episodios, 8.124 fotogramas, 30 FPS |
| Entrenamiento | 20.000 pasos, batch 16, AdamW, learning rate 1e-5, seed 1000, LeRobot 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice chunks de acciones a partir de observaciones y datos teleoperados. En este caso, la política se ha entrenado y publicado con LeRobot, y el repositorio declara `model_name: act` y `policy.type=act`. La información disponible no detalla el número de capas, la dimensión oculta, el mecanismo de atención exacto ni si la implementación concreta usa un VAE condicional; por tanto, no se afirman esos detalles.

El entrenamiento se realizó sobre 30 episodios y 8.124 fotogramas a 30 FPS para la tarea "pick up the blue candy", durante 20.000 pasos con batch 16, optimizador AdamW, learning rate 1e-5, seed 1000 y LeRobot 0.6.2. No se documentan la composición completa del dataset, aumentos de datos, procesos de RLHF/DPO ni evaluación en robot real. RLHF y DPO no aplican porque no es un modelo de lenguaje.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para el robot `so_follower` a partir de estado y dos cámaras.
- Percepción visual con dos cámaras: usa una cámara de muñeca (`wrist`) y una cámara de teléfono (`phone`).
- Ejecución de una tarea concreta: "pick up the blue candy"; no se documentan otras tareas.
- Aprendizaje por imitación: la política se entrena con datos teleoperados y predice chunks de acciones.
- Integración con LeRobot: dispone de comandos `lerobot-rollout` y `lerobot-train` documentados por el autor.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso general.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural general.
- No incluye modo thinking, visión general, audio, código ni matemáticas.
- No es un modelo de propósito general: su validez está limitada al robot, cámaras y distribución de la tarea entrenada.

## Casos de uso

- Clasificación de caramelos en una célula de laboratorio: la política puede ejecutar la tarea "pick up the blue candy" sobre un SO-101 con cámara de muñeca y cámara externa, siempre que el entorno y los objetos coincidan con los del entrenamiento.
- Baseline reproducible para ACT: sirve para comparar nuevas políticas entrenadas con LeRobot 0.6.2 usando los mismos 30 episodios, 20.000 pasos y hiperparámetros documentados.
- Automatización de picking de objetos pequeños: el modelo combina una cámara de muñeca con una vista externa y produce acciones de 6 dimensiones, lo que encaja en tareas de recogida y colocación de piezas ligeras.
- Docencia y formación en robótica de imitación: su tamaño de 51,7 M de parámetros y un repositorio de 0,2 GB facilitan experimentos en laboratorios con recursos limitados.
- Prototipado de pipelines de teleoperación a política: permite grabar episodios con el mismo esquema de observaciones y reentrenar una política ACT con `lerobot-train`.
- Pruebas de integración de dos cámaras: útil para validar calibración, resolución, nombres de features y sincronización entre `wrist` y `phone` antes de escalar a otras tareas.
- Banco de pruebas de robustez: permite evaluar cómo cambia el comportamiento ante variaciones de iluminación, posición del caramelo o pequeñas modificaciones del montaje, aunque no hay tasas de éxito publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

| Evaluación | Resultado |
|---|---|
| Tasa de éxito en "pick up the blue candy" | No disponible |
| Número de ensayos en robot real | No disponible |
| MMLU, HumanEval, GSM8K | No aplica: no es un modelo de lenguaje |
| Comparación con otras políticas | No disponible |

## Requisitos de hardware

- VRAM estimada: los 51.668.614 parámetros ocupan unos 207 MB en FP32, 103 MB en FP16 y 52 MB en INT8 solo para los pesos; es un cálculo teórico y no incluye activaciones, imágenes ni el runtime de LeRobot.
- GPU recomendadas: para inferencia, cualquier GPU NVIDIA con CUDA y 2 GB o más de VRAM debería ser suficiente según el tamaño del modelo; para entrenamiento se usó `cuda`, pero no se especifica el modelo de GPU.
- GPU consumer: cabe en GPU de gama baja y media; una RTX 4090 o RTX 3090 es más que suficiente para inferencia y adecuada para reentrenar. A100/H100 no son necesarias por tamaño, aunque sean compatibles.
- CPU: es plausible ejecutar la política en CPU por su tamaño, pero no hay datos de latencia; para control a 30 FPS se recomienda GPU.
- Despliegue: LeRobot con `lerobot-rollout` y PyTorch; entrenamiento con `lerobot-train`. No aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Para control a 30 FPS, el ciclo completo de cámaras, inferencia y robot debe completarse en unos 33 ms; no se ha publicado una medición real.
- El ejemplo de rollout del autor configura cámaras a 640 × 480 y 30 FPS; las observaciones de entrenamiento se documentan con resoluciones 240 × 320 y 360 × 640.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. A modo de categoría, las alternativas metodológicas habituales en aprendizaje por imitación para robótica son Diffusion Policy y VQ-BeT, pero no se han proporcionado parámetros, contexto, licencia ni rendimiento verificables para esta ficha.

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| ACT (este repositorio) | Transformer con action chunks | 51.668.614 | No aplica | No disponible | No publicado |
| Diffusion Policy | Aprendizaje por imitación con difusión | No disponible | No aplica | No disponible | No disponible |
| VQ-BeT | Aprendizaje por imitación con discretización de acciones | No disponible | No aplica | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Sin evaluación publicada: no hay tasa de éxito, número de ensayos ni análisis de fallos en robot real.
- Entrenamiento muy acotado: 30 episodios, 8.124 fotogramas y una sola tarea; el riesgo de sobreajuste y de baja generalización es alto.
- Dependencia del montaje: requiere el robot `so_follower`, las cámaras `wrist` y `phone`, calibración y nombres de observaciones compatibles.
- Cambios de iluminación, posición, fondo, objeto u operador pueden degradar el comportamiento; no se documenta robustez frente a esas variaciones.
- No es un modelo de lenguaje: no admite tool calling, agentes, código, matemáticas ni conversación multilingüe.
- El riesgo de "alucinación" lingüística no aplica; el riesgo real es ejecutar acciones incorrectas que dañen objetos o el robot.
- No se documentan sesgos del dataset; los 30 episodios pueden reflejar posiciones, iluminación y sesgos del operador.
- No se especifican tipos de cuantización ni precisión de los pesos; la inferencia puede requerir FP32 según el runtime.
- Validación comunitaria muy baja: 0 descargas y 0 likes en el momento de la información proporcionada.
- No debe usarse en entornos humanos o industriales sin supervisión y sin una validación de seguridad específica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MadmanMischief/act_so101_candy_sort_half
- Dataset: https://huggingface.co/datasets/MadmanMischief/so101_candy_sort_half
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MadmanMischief/so101_candy_sort_half
- Paper de ACT: https://huggingface.co/papers/2304.13705
- arXiv de ACT: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
