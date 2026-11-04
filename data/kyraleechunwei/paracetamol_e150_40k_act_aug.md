# KyraLeeChunWei/Paracetamol_e150_40K_ACT_aug

## Resumen

Paracetamol_e150_40K_ACT_aug es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Lo publica el usuario KyraLeeChunWei en HuggingFace Hub mediante la librería LeRobot de HuggingFace, y está entrenado sobre el dataset propio `KyraLeeChunWei/Paracetamol_e150`. No es un modelo de lenguaje: es un controlador visomotor para manipulación robótica.

El modelo resuelve el problema de convertir observaciones visuales y el estado del robot en comandos de acción de baja dimensión, típicamente para un brazo tipo SO-100/SO-101. Con 51,7 millones de parámetros, está diseñado para entrenamiento e inferencia en hardware modesto, lo que lo hace accesible para laboratorios y aficionados que trabajan con robots de bajo coste. El sufijo "40K" sugiere 40 000 pasos de entrenamiento y "aug" indica aumento de datos, aunque la model card no detalla estas decisiones.

Su relevancia es práctica: ACT es uno de los métodos de referencia en imitación robótica desde el paper de 2023, y este checkpoint concreto permite reproducir o adaptar un pipeline completo de LeRobot sin partir de cero. Al estar bajo licencia Apache 2.0, es utilizable comercialmente sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51 678 855 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo visomotor, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato LeRobot) |

## Arquitectura y entrenamiento

ACT combina un backbone visual tipo ResNet con un transformer encoder-decoder. El encoder procesa las imágenes de las cámaras junto con el estado de las articulaciones, y el decoder genera un chunk de acciones futuras (típicamente decenas de pasos) en una sola pasada. Esta predicción por chunks mitiga el problema de la varianza en el etiquetado humano y reduce el error acumulado típico de las políticas que predicen un solo paso. El modelo incluye además una cabeza de estilo CVAE que modela la variabilidad de las demostraciones durante el entrenamiento y se descarta en inferencia.

El entrenamiento es de imitación supervisada sobre teleoperación, sin RLHF ni DPO. El dataset `Paracetamol_e150` no está documentado en la información disponible (número de episodios, tareas, cámaras y frecuencia de control son desconocidos). El identificador indica 150 episodios y el nombre del checkpoint sugiere 40 000 pasos de optimización con aumento de datos, pero estos extremos no se confirman en la model card. No se especifican hiperparámetros, composición del dataset ni detalles del augmentation.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de articulación a partir de imágenes y estado proprioceptivo.
- Predicción de chunks de acción, lo que produce trayectorias más suaves y estables que políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni simulación.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatible con robots de la familia SO-100/SO-101 según el ejemplo de la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo ejecuta una tarea concreta (el montaje del dataset Paracetamol) sobre un brazo SO-100, útil para validar pipelines de imitación antes de escalar a tareas más complejas.
- Reproducción de experimentos ACT: sirve como checkpoint de referencia para comparar variantes de entrenamiento (pasos, augmentation) sobre el mismo dataset.
- Base para fine-tuning con pocas demostraciones: al ser un ACT preentrenado, se puede adaptar a una tarea nueva recogiendo un conjunto reducido de episodios teleoperados y reentrenando desde estos pesos.
- Docencia en robótica de bajo coste: su tamaño de 51,7 M de parámetros permite entrenar y desplegar en una sola GPU de consumo, lo que encaja en cursos y talleres.
- Evaluación de infraestructura LeRobot: sirve para probar el ciclo completo de `lerobot-record` con `--policy.path` apuntando a este checkpoint y verificar latencias y estabilidad del lazo de control.
- Prototipado de automatización de pick-and-place: para tareas repetitivas de recogida y colocación en entornos controlados donde el dataset de entrenamiento cubre la variabilidad relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa para 51,7 M de parámetros; el cuello de botella real es el backbone visual y el tamaño de lote de imágenes.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluida una GTX 1650 o superior; para entrenamiento se recomienda al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: LeRobot (`lerobot-record`) como vía oficial; el checkpoint es safetensors y puede cargarse con PyTorch directamente.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la frecuencia de control del robot y del número de cámaras.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e150_40K_ACT_aug | 51,7 M | ACT, imitación con chunks | no aplica | Apache 2.0 | HuggingFace (LeRobot) |
| ACT original (paper 2304.13705) | ~80 M (según configuración) | ACT, imitación con chunks | no aplica | código MIT (repositorio original) | GitHub |
| Diffusion Policy | variable según configuración | difusión para acciones | no aplica | MIT (repositorio original) | GitHub |
| VQ-BeT | variable según configuración | cuantización vectorial de comportamiento | no aplica | MIT (repositorio original) | GitHub |

La comparación es orientativa: los parámetros de los métodos alternativos dependen de la configuración del backbone visual y del espacio de acciones. No hay datos de rendimiento comparativo en la información disponible para este checkpoint concreto.

## Limitaciones y advertencias

- Sesgos de dataset: al entrenarse solo con el dataset Paracetamol_e150, la política generaliza mal fuera de la distribución de esa tarea, iluminación, cámara y robot.
- Riesgo de fallo silencioso: en imitación robótica no hay señal de confianza; el modelo puede ejecutar acciones incorrectas sin avisar.
- Sin información sobre el dataset: no se documentan episodios, frecuencia de control, cámaras ni variabilidad, lo que dificulta evaluar su robustez.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito.
- Dependencia de hardware específico: el ejemplo de la model card asume un SO-100 follower; usarlo con otro robot requiere recalibración y probablemente reentrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento físico del robot recae en el integrador.
- No apto para tareas de seguridad crítica sin supervisión humana y parada de emergencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KyraLeeChunWei/Paracetamol_e150_40K_ACT_aug
- Dataset: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e150
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
