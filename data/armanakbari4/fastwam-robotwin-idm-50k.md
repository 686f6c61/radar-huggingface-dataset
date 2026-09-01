# armanakbari4/fastwam-robotwin-idm-50k

## Resumen

FastWAM-IDM RoboTwin es un modelo de mundo-acción (World Action Model, WAM) para robótica, desarrollado por Arman Akbari como una reproducción limpia de la receta de BadWAM (arXiv:2607.15207). Se trata de la variante IDM (inverse dynamics) de Fast-WAM, que predice acciones de control a partir de observaciones de video, en lugar de generar futuros imaginados. El modelo se construye sobre Wan2.2-TI2V-5B, un DiT de video, al que se añade un ActionDiT (MoT) de aproximadamente 6 mil millones de parámetros. Está entrenado en el benchmark RoboTwin 2.0, con tres cámaras y 33 frames por secuencia.

La relevancia de este checkpoint radica en que reproduce fielmente la configuración de entrenamiento de BadWAM (8 GPUs, 50.000 pasos, batch efectivo 128) y reporta tasas de éxito en RoboTwin del 91,4% para la variante IDM, según los valores publicados en el paper de referencia. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones. El repositorio incluye los pesos en formato PyTorch (bf16, 12 GB) y un archivo JSON con las estadísticas de normalización necesarias para la inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAMIDM (video DiT Wan2.2-TI2V-5B + ActionDiT MoT) |
| Parametros totales | ~6 mil millones (6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (ventana de video: 33 frames, 3 cámaras, 240x320 cada una) |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | No disponible (modelo orientado a robótica, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pt (bf16) + JSON de estadísticas de normalización |

## Arquitectura y entrenamiento

El modelo combina un DiT de video (Wan2.2-TI2V-5B) con un ActionDiT (MoT) para formar un World Action Model. En la variante IDM, la acción atiende a todos los tokens latentes del video y fuerza el condicionamiento del video durante el denoising de las acciones, lo que permite predecir acciones directamente desde observaciones sin necesidad de imaginar futuros. La dimensión de acción y estado es 14, y se utilizan 32 acciones por cada 9 frames de video (ratio de frecuencia 4).

El entrenamiento se realizó durante 50.000 pasos con un batch efectivo de 128, tasa de aprendizaje 1e-4 con decaimiento coseno (warmup del 5%), optimizador AdamW (0.9, 0.95), weight decay 1e-2, precisión bf16 y ZeRO-1. Se emplearon 8 GPUs (probablemente H100, según la receta de BadWAM). El entrenamiento se reanudó una vez desde el paso 15.000 con restauración completa del estado de DeepSpeed (momentos de Adam, RNG por rango y scheduler), verificándose que no hubo picos de pérdida. La pérdida final en el paso 50.000 fue de 0,0695, con la tasa de aprendizaje en el mínimo del coseno (1e-6).

## Capacidades

- Predicción de acciones de control para manipulación robótica a partir de secuencias de video (inverse dynamics).
- Procesamiento de múltiples cámaras: cámara alta y dos cámaras de muñeca (izquierda y derecha), con imágenes de 240x320 píxeles.
- Generación de 32 acciones por cada 9 frames de video, con dimensión de acción y estado de 14.
- Entrenado específicamente en el benchmark RoboTwin 2.0, orientado a tareas de manipulación de precisión.
- No incluye capacidades de tool calling, agentes conversacionales ni procesamiento de lenguaje natural.
- No se han documentado capacidades de razonamiento simbólico o matemático fuera del ámbito robótico.

## Casos de uso

- Control de robots manipuladores en simulación: el modelo puede generar comandos de articulación directamente desde observaciones de cámara, lo que lo hace adecuado para entornos como RoboTwin donde se requiere precisión en tareas de apilado, ensamblaje o manipulación de objetos.
- Aprendizaje por imitación: al ser un modelo de dinámica inversa, puede utilizarse para convertir demostraciones de video en secuencias de acciones, facilitando la transferencia de habilidades de teleoperación a políticas de control.
- Planificación de movimientos en bucle cerrado: gracias a su capacidad de procesar 33 frames y 3 cámaras, puede integrarse en sistemas de control reactivo que requieran respuestas rápidas basadas en el estado visual actual.
- Evaluación de políticas robóticas: el checkpoint sirve como referencia para comparar diferentes variantes de WAM (IDM, joint, action-only) en el benchmark RoboTwin, permitiendo medir el impacto de la arquitectura en el rendimiento.
- Investigación en world action models: al ser una reproducción limpia de la receta de BadWAM, es útil para estudiar la reproducibilidad de resultados y el efecto de la reanudación del entrenamiento en la estabilidad del modelo.
- Desarrollo de sistemas de control para robots de bajo coste: al requerir solo 12 GB de pesos en bf16, puede desplegarse en GPUs de gama media para experimentación en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. La model card menciona que la receta de entrenamiento coincide con la de BadWAM (arXiv:2607.15207), cuyos resultados reportados de éxito en RoboTwin son los siguientes:

| Variante | Tasa de éxito en RoboTwin |
|---|---|
| IDM | 91,4% |
| Joint | 90,9% |
| Action-only | 92,1% |

Estos valores provienen del paper de BadWAM, no de una evaluación directa de este modelo. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan 12 GB, por lo que se necesitan al menos 16 GB de VRAM para cargar el modelo con overhead de activaciones. Una GPU con 24 GB (por ejemplo, RTX 4090) sería suficiente.
- GPU recomendadas: para entrenamiento se usaron 8 GPUs H100 (según la receta de BadWAM). Para inferencia, una sola GPU con 24 GB o más es viable.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o RTX 4090 (24 GB) puede ejecutar el modelo en bf16.
- Opciones de despliegue: el modelo se distribuye en formato PyTorch, por lo que puede ejecutarse con el código oficial de FastWAM disponible en GitHub. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastwam-robotwin-idm-50k (este) | FastWAMIDM (Wan2.2-TI2V-5B + ActionDiT) | ~6B | 33 frames, 3 cámaras | MIT | Hugging Face |
| fastwam-robotwin-joint-50k (compañero) | FastWAMJoint (misma base) | ~6B | 33 frames, 3 cámaras | MIT | Hugging Face |
| BadWAM (referencia) | No especificado | No disponible | No disponible | No disponible | Paper arXiv |

No se dispone de información detallada sobre otros modelos comparables en la misma categoría. La comparativa se limita a los checkpoints del mismo autor y al modelo de referencia mencionado en la model card.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en RoboTwin 2.0, por lo que su generalización a otros entornos robóticos o tareas fuera de este benchmark no está garantizada.
- No se han documentado sesgos específicos, pero al ser un modelo de control robótico, las acciones generadas pueden ser inseguras si se aplican sin supervisión en entornos físicos reales.
- Riesgo de alucinación: en el contexto robótico, puede generar acciones inconsistentes con la dinámica del entorno, especialmente en situaciones no vistas durante el entrenamiento.
- Limitaciones de contexto: la ventana de video es fija (33 frames, 3 cámaras), lo que impide procesar secuencias más largas sin modificaciones.
- No se proporcionan estadísticas de normalización en el repositorio; el archivo `robotwin_idm_dataset_stats.json` es imprescindible para la inferencia y evaluación, y debe descargarse junto con los pesos.
- La licencia MIT permite uso comercial, pero el usuario es responsable de verificar que los datos de entrenamiento (RoboTwin 2.0) no tengan restricciones adicionales.
- No se han publicado resultados de evaluación independientes para este checkpoint; los valores de éxito citados provienen del paper de BadWAM y podrían no reproducirse exactamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/armanakbari4/fastwam-robotwin-idm-50k
- Checkpoint compañero (joint): https://huggingface.co/armanakbari4/fastwam-robotwin-joint-50k
- Perfil del autor: https://huggingface.co/armanakbari4/models
- Repositorio oficial de FastWAM (GitHub): https://github.com/yuantianyuan01/FastWAM
- Documentación de entrenamiento en DeepWiki: https://deepwiki.com/yuantianyuan01/FastWAM/4-training
- Paper de referencia (BadWAM, arXiv:2607.15207): no disponible directamente, pero se menciona en la model card.
