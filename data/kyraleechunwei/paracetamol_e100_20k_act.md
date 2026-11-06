# KyraLeeChunWei/Paracetamol_e100_20K_ACT

## Resumen

Paracetamol_e100_20K_ACT es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario KyraLeeChunWei en Hugging Face. No se trata de un modelo de lenguaje: es un checkpoint de control motor entrenado con LeRobot, la librería de aprendizaje por imitación de Hugging Face, que predice secuencias cortas de acciones ("action chunks") en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación.

El modelo tiene 51.678.855 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware modesto. Está entrenado sobre el dataset Paracetamol_e100, presumiblemente una colección de demostraciones teleoperadas capturadas con un robot tipo SO-100 (el ejemplo de la model card usa `so100_follower`). El nombre sugiere 100 épocas de entrenamiento y un dataset de 20.000 frames o episodios, aunque estos detalles no se confirman en la información disponible.

Su relevancia es acotada pero clara para quien trabaja en robótica de bajo coste: proporciona un punto de partida reproducible para tareas de pick-and-place o manipulación específica, con licencia Apache 2.0 y flujo de entrenamiento/evaluación estandarizado vía LeRobot. No es un modelo de propósito general ni compite con LLMs; compite con otras políticas de imitación como Diffusion Policy o VQ-BeT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parametros totales | 51.678.855 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observación fijas definidas en la config de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación en robótica que, en cada paso de control, recibe observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y emite un chunk de k acciones futuras. Esta predicción por bloques mitiga el problema de la varianza en la predicción paso a paso y permite un control más suave. La arquitectura incorpora un encoder visual (resnet o similar, según la configuración de LeRobot) y un transformer encoder-decoder con queries latentes que representan el chunk de acciones. El paper de referencia es arXiv:2304.13705 (Zhao et al., "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware").

El entrenamiento se realizó con LeRobot sobre el dataset KyraLeeChunWei/Paracetamol_e100, que no está descrito en detalle en la información disponible (no se especifica número de episodios, número de tokens/frames, composición de cámaras ni tasa de éxito). El nombre del checkpoint sugiere 100 épocas y 20K muestras, pero es una inferencia a partir del identificador, no un dato confirmado. No se documenta uso de RLHF ni DPO (no aplica en imitación supervisada). No se reportan innovaciones adicionales más allá del propio mecanismo de action chunking.

## Capacidades

- Control robótico por imitación: genera trayectorias de acciones articulares a partir de observaciones visuales y propioceptivas.
- Predicción de action chunks: emite secuencias de acciones de forma conjunta, lo que estabiliza el control en tareas de manipulación fina.
- Ejecución en robots de bajo coste: el ejemplo de la model card apunta a SO-100 (brazo tipo SO-ARM100), lo que sugiere compatibilidad con plataformas económicas.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües (no es un modelo de lenguaje).
- No soporta visión generativa ni audio; la visión es únicamente entrada para el control.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo puede ejecutar una política entrenada para recoger y colocar objetos específicos, usando las cámaras del robot como entrada y emitiendo chunks de acciones articulares. Adecuado por su bajo coste computacional y su integración directa con LeRobot.
- Automatización de tareas repetitivas en entornos controlados: por ejemplo, clasificación de piezas o alimentación de una máquina, donde la política imita demostraciones teleoperadas y no requiere reprogramación manual.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, cambios en el dataset o nuevas técnicas de chunking, gracias a la licencia Apache 2.0 y al flujo estándar de LeRobot.
- Prototipado rápido en robótica de bajo coste: con un SO-100 y un dataset propio, se puede reentrenar la política en horas y validar tareas de ensamblaje sencillo.
- Evaluación de robustez de políticas: al ser un checkpoint pequeño (0,2 GB), permite iterar rápidamente sobre condiciones de iluminación, posiciones de objeto o ruido en las observaciones.
- Docencia y formación: útil para demostrar el ciclo completo de imitación (teleoperar, entrenar, evaluar) en cursos de robótica o aprendizaje automático, sin necesidad de GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones con otras políticas. El identificador del checkpoint sugiere 100 épocas de entrenamiento, pero no se aportan curvas de aprendizaje ni validación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros (≈207 MB solo pesos); con activaciones y buffers de imagen, un entorno típico de LeRobot requiere entre 1 y 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento se recomienda una RTX 3060/4060 o superior, y en servidor una A100 o H100 solo si se entrenan lotes grandes o múltiples políticas en paralelo.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores. También puede ejecutarse en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles en la información proporcionada. La latencia vendrá determinada por la frecuencia de control del robot y el coste del encoder visual, no por el tamaño del transformer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e100_20K_ACT | 51,7 M | no disponible | ACT (action chunking) | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (referencia) | variable, típicamente 10-100 M | no aplica | difusión sobre acciones | MIT / Apache 2.0 según implementación | Repos públicos, integrable en LeRobot |
| VQ-BeT (referencia) | variable, decenas de M | no aplica | cuantización vectorial + transformer | MIT | Repos públicos |
| SmolVLA (referencia) | cientos de M | no aplica | VLM + acciones | Apache 2.0 | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto, por lo que la comparación se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para un dataset y una tarea concretos (Paracetamol_e100); no generaliza a otros objetos, entornos o robots sin reentrenamiento.
- Sin documentación de sesgos: no se describe la composición del dataset ni la variabilidad de condiciones (iluminación, posiciones, distractores), lo que impide evaluar su robustez.
- Riesgo de fallo silencioso: en robótica, una política de imitación puede ejecutar acciones plausibles pero incorrectas sin señal de error; se recomienda supervisión y límites de seguridad en el robot.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de rendimiento; el uso en producción exigiría validación propia.
- Contexto y idioma: no aplica como modelo de lenguaje, pero conviene señalar que no procesa texto ni instrucciones en lenguaje natural.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; el dataset subyacente puede tener sus propias restricciones no documentadas.
- Fecha de creación futura (2026-11-03): el repositorio indica una fecha posterior a la actual, lo que puede reflejar un error de metadatos o un entorno de pruebas; conviene verificar la integridad del checkpoint antes de usarlo.
- Cero descargas y cero likes: no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KyraLeeChunWei/Paracetamol_e100_20K_ACT
- Dataset: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e100
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
