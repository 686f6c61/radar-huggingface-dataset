# 24jihoward/plwm-fb-wm-100k

## Resumen

plwm-fb-wm-100k es un world model para manipulación robótica desarrollado por el usuario 24jihoward y publicado en Hugging Face. El modelo predice nubes de puntos futuras del robot y de la escena, junto con vídeo, a partir de un historial de observaciones. Se construye sobre Wan2.2-TI2V-5B, un modelo generativo de vídeo (DiT + VAE), al que se le añade un autoencoder de puntos con latente SE(3) que codifica las nubes de puntos en un espacio latente compartido con el world model.

El modelo se ha entrenado específicamente sobre datos de FurnitureBench, un benchmark de manipulación de muebles, con 4096 puntos por fotograma y 32 pasos de historial. El checkpoint publicado corresponde al paso 100.000 de entrenamiento. Su relevancia radica en que combina predicción de dinámica física (world modeling) con representaciones 3D explícitas (point clouds), una línea de investigación activa para planificación y control en robótica basada en modelos.

El repositorio incluye el world model en formato bf16 (EMA), el autoencoder de puntos con sus estadísticas de normalización, un decodificador de puntos a acciones y el config de entrenamiento resuelto. No se incluyen el optimizador, los estados de DeepSpeed, los datos de entrenamiento ni el código, y la licencia está pendiente de decisión por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT + VAE (base Wan2.2-TI2V-5B) con autoencoder de puntos con latente SE(3) |
| Parametros totales | no disponible (pesos EMA de 10,08 GB en bf16) |
| Parametros activos | no disponible |
| Longitud de contexto | 32 pasos de historial (frames), 4096 puntos por frame |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | pendiente de decisión por el autor ("to be decided by the author") |
| Formato de pesos | PyTorch (.pt): ema.pt, pts_actdec.pt, encoder/ae_raw.pt, encoder/ae_wmstats.pt |

## Arquitectura y entrenamiento

El modelo parte de Wan2.2-TI2V-5B, un transformer de difusión (DiT) con VAE para generación de vídeo, e incorpora un autoencoder de puntos con latente SE(3) que comprime las nubes de puntos en un vector latente. El world model (`wm_shared_v6b`) se inicializa desde Wan2.2-TI2V-5B y se entrena desde el paso 0 para predecir conjuntamente nubes de puntos futuras (robot y escena) y vídeo. El autoencoder de puntos permanece congelado durante el entrenamiento del world model.

El entrenamiento se realizó durante 100.000 pasos con batch global de 64, optimizador AdamW con learning rate 1e-4, schedule coseno, precisión bf16 y EMA con factor 0.999. Los datos provienen de FurnitureBench (tarea square_table y el resto de tareas del benchmark), con nubes de puntos trackeadas de 4096 puntos por frame y 32 pasos de historial. El checkpoint de evaluación es la media exponencial de los pesos (`ema.pt`). El repositorio incluye además `pts_actdec.pt`, un decodificador de puntos a acciones entrenado junto al world model, del que solo se conservan los pesos (`model`, `step`), habiéndose eliminado el estado del optimizador y del generador aleatorio.

## Capacidades

- Predicción de nubes de puntos futuras del robot y de la escena a partir de un historial de 32 pasos.
- Generación de vídeo futuro coherente con la dinámica predicha (hereda la rama de vídeo de Wan2.2-TI2V-5B).
- Modelado de dinámica para manipulación robótica en tareas de FurnitureBench.
- Decodificación de nubes de puntos predichas a acciones motoras mediante `pts_actdec.pt`.
- Representación latente SE(3) de nubes de puntos, adecuada para razonamiento geométrico 3D.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de lenguaje; el uso previsto es planificación basada en modelo en robótica.
- Capacidades multilingües: no aplica.
- Capacidades especiales: world modeling con representación 3D explícita (point clouds) además de vídeo.

## Casos de uso

- Planificación basada en modelo en manipulación: el world model permite simular rollouts de futuros estados (nubes de puntos) para evaluar acciones candidatas antes de ejecutarlas en el robot, aprovechando el historial de 32 pasos y la representación 3D.
- Model-based reinforcement learning: usar el modelo como entorno aprendido para entrenar políticas en tareas de FurnitureBench (square_table y similares) sin necesidad de interacción real continua.
- Control predictivo (MPC) sobre nubes de puntos: predecir la evolución de la escena y del robot para optimizar trayectorias a corto plazo con el decodificador `pts_actdec.pt`.
- Aumento de datos sintéticos: generar trayectorias y observaciones 3D plausibles para ampliar datasets de entrenamiento en manipulación de muebles.
- Evaluación de políticas offline: comparar políticas entrenadas midiendo la discrepancia entre sus rollouts reales y los predichos por el world model.
- Investigación en representaciones 3D latentes: estudiar la calidad del autoencoder SE(3) y del latente compartido entre puntos y vídeo para tareas de percepción y predicción.
- Detección de fallos y anomalías: comparar la predicción del modelo con la observación real para detectar desviaciones en la ejecución de una tarea de ensamblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos EMA en bf16 ocupan aproximadamente 10,08 GB; sumando el autoencoder de puntos y el decodificador de acciones, se estima un mínimo en torno a 12-16 GB de VRAM para inferencia en bf16, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una A100 (40/80 GB), H100 o L40S son opciones razonables para bf16, y una RTX 4090 (24 GB) podría ser suficiente para inferencia en bf16 según la estimación anterior.
- Cabe en GPU de consumo: probablemente en RTX 4090 y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización, para la que no se documentan formatos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de robótica con pesos PyTorch (.pt) y código no incluido, el despliegue requeriría reimplementar el pipeline de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros world models comparables (por ejemplo, variantes sobre Wan2.2 u otros modelos de dinámica para manipulación) en la información disponible.

## Limitaciones y advertencias

- Licencia sin decidir: el autor indica que la licencia está "to be decided", por lo que no se puede asumir uso comercial ni redistribución.
- No se incluyen datos de entrenamiento, código ni estados de entrenamiento (optimizador, scheduler, DeepSpeed), lo que dificulta la reproducibilidad.
- El config de entrenamiento contiene rutas locales y la entidad de logging está redactada; una cadena de procedencia en `encoder/ae_wmstats.pt` también fue redactada por contener una ruta local.
- El modelo está especializado en FurnitureBench; su generalización a otras escenas, robots o tareas no está documentada.
- No hay información sobre sesgos, tasas de alucinación (en el sentido de predicciones físicamente inconsistentes) ni robustez fuera de distribución.
- No se documentan idiomas ni capacidades de lenguaje; no es un modelo de chat ni de texto.
- El checkpoint publicado es solo el EMA del paso 100.000; no se ofrece una comparativa de checkpoints intermedios ni curvas de entrenamiento.
- El decodificador `pts_actdec.pt` se publica sin estado de optimizador ni RNG (`opt` y `gen` son `None`), lo que limita reanudar su entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/24jihoward/plwm-fb-wm-100k
- Wan2.2-TI2V-5B (modelo base): no disponible en la información proporcionada
- FurnitureBench (dataset/benchmark): no disponible en la información proporcionada
- Paper, blog o repositorio del autor: no disponible en la información proporcionada
