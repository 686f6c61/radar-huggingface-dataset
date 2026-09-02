# omkarpatil/push-tape-right-groot-sharednorm

## Resumen

El modelo `omkarpatil/push-tape-right-groot-sharednorm` es un fine-tune del modelo de robótica NVIDIA GR00T N1.7-3B, especializado en la tarea de empujar una cinta hacia la derecha (push-tape-right) con un robot ROBOTIS FFW SG2 Rev1. Ha sido desarrollado por Omkar Patil y publicado en Hugging Face bajo licencia Apache 2.0, utilizando la librería LeRobot. Su relevancia reside en demostrar cómo ajustar un modelo VLA (Vision-Language-Action) de 3.14 mil millones de parámetros para una tarea manipulativa concreta, aplicando una receta de normalización compartida que permite componer políticas entrenadas por separado.

El modelo se basa en la arquitectura del GR00T N1.7-3B, un transformer multimodal diseñado para control robótico, y se ha entrenado con 20 000 pasos sobre 3 108 frames de demostración. La normalización de los datos se realizó con percentiles q01/q99 y mapeo a [-1, 1], con estadísticas agrupadas entre dos tareas del mismo grupo de composición. El modelo es solo de inferencia, no admite reanudación de entrenamiento, y su peso ocupa 12.6 GB en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en NVIDIA GR00T N1.7-3B) |
| Parametros totales | 3 144 016 000 (3.14 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo se publica en fp32) |
| Idiomas soportados | No disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del VLA NVIDIA GR00T N1.7-3B, un transformer multimodal que procesa observaciones visuales de tres cámaras (cam_left_head, cam_left_wrist, cam_right_wrist) y el estado del robot (22 dimensiones) para generar acciones de 16 pasos (≈1.07 segundos a 15 fps). La arquitectura base no se modifica; solo se cambian las estadísticas de normalización del dataset.

El entrenamiento se realizó con la receta "shared-norm", que agrupa las estadísticas de normalización de dos tareas (push-tape-left y push-tape-right) sobre 5 768 frames. Esto permite que ambos modelos compartan la misma transformación invertible y puedan componerse entre sí. La normalización usa percentiles q01/q99 con recorte de outliers, y se entrenó en precisión fp32 con PyTorch sdpa (atención exacta, no flash-attention-2). El proceso duró 20 000 pasos con learning rate 1e-4, warmup 0.05, weight decay 1e-5 y batch size 32, alcanzando una pérdida final de 0.0423. No se aplicaron parches de código; solo se ajustaron las estadísticas del dataset.

## Capacidades

- Control robótico de la tarea push-tape-right: el modelo genera secuencias de acciones de 16 pasos para mover el brazo derecho del robot y empujar una cinta hacia la derecha.
- Procesamiento multimodal: combina imágenes de tres cámaras con el estado del robot para producir comandos de acción.
- Composición de políticas: al compartir la misma normalización (hash e8f4159ddb8fc98e), puede combinarse con otros modelos del mismo grupo (push-tape-left) para ejecutar tareas compuestas.
- Inferencia a 15 fps con chunk de acción de 16 pasos, adecuado para control en tiempo real.
- No incluye capacidades de generación de texto, tool calling, agentes ni soporte multilingüe, al ser un modelo especializado en robótica.

## Casos de uso

- Investigación en aprendizaje por imitación: permite estudiar el efecto de la normalización compartida en la composición de políticas robóticas, comparando con variantes de normalización individual.
- Despliegue de tareas de manipulación en laboratorio: el modelo puede ejecutar la tarea de empujar una cinta en un robot FFW SG2 Rev1, sirviendo como punto de partida para experimentos de control.
- Evaluación de fine-tuning de VLA: útil para medir la transferencia de un modelo base generalista (GR00T N1.7-3B) a una tarea específica con pocos datos (16 episodios).
- Composición de habilidades: al combinarse con push-tape-left, permite crear secuencias de empuje en ambas direcciones sin reentrenar, gracias al grupo de composición A.
- Validación de recetas de entrenamiento: sirve como referencia para probar variaciones en la normalización (percentiles, clipping) y su impacto en la convergencia.
- Benchmarking de hardware de inferencia: al ser un modelo de 3.14 B en fp32, puede usarse para medir latencia y throughput en diferentes GPUs con LeRobot u otros frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida final de entrenamiento (0.0423), que no permite comparar con otros modelos. No hay datos de éxito en tareas, precisión de manipulación ni comparaciones con GR00T N1.7-3B sin fine-tune.

## Requisitos de hardware

- VRAM estimada: al estar en fp32, los pesos ocupan aproximadamente 12.6 GB (3.14 B × 4 bytes). Sumando activaciones y overhead, se recomienda al menos 16 GB de VRAM para inferencia cómoda. En fp16 (si se convierte) bastarían ~6.3 GB, pero el repo no incluye versiones cuantizadas.
- GPU recomendadas: NVIDIA A100 40 GB, RTX 4090 (24 GB), o GPUs con al menos 16 GB. Para despliegue en edge, una RTX 4080 o similar podría funcionar si se reduce la precisión.
- Opciones de despliegue: el modelo está diseñado para LeRobot, pero al ser safetensors puede cargarse con PyTorch estándar. No se mencionan compatibilidades con vLLM, TGI u Ollama, que son para modelos de lenguaje, no para VLA robóticos.
- Latencia y throughput: no disponibles. Dependerá de la GPU, pero a 15 fps y con chunk de 16 acciones, se espera una latencia por paso de menos de 66 ms para mantener el ritmo, asumiendo que la inferencia se ejecuta en paralelo con el control.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos de la misma categoría. El modelo base NVIDIA GR00T N1.7-3B tiene la misma arquitectura y parámetros (3.14 B), pero no está especializado en la tarea push-tape-right. Otros fine-tunes del mismo autor, como `omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7`, existen en su perfil, pero no se han encontrado especificaciones públicas. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo funciona para la tarea push-tape-right con el robot FFW SG2 Rev1 y la configuración de cámaras especificada. No es generalizable a otras tareas ni a otros robots sin reentrenamiento.
- Datos de entrenamiento muy limitados: solo 16 episodios (3 108 frames), lo que puede provocar overfitting y baja robustez ante variaciones en la posición de la cinta o condiciones de iluminación.
- Riesgo de acciones erróneas: como todo modelo robótico, puede generar comandos inseguros si las observaciones difieren del dominio de entrenamiento. Debe usarse con supervisión en entornos reales.
- No reproducible con flash-attention: el uso de sdpa en lugar de flash-attention-2 implica que los resultados pueden variar ligeramente entre ejecuciones, aunque ambos implementan atención exacta.
- Imposibilidad de reanudar entrenamiento: el repo excluye el estado del optimizador y checkpoints intermedios, por lo que no se puede continuar el fine-tune.
- Licencia: aunque el modelo se publica bajo Apache 2.0, el modelo base NVIDIA GR00T N1.7-3B puede tener términos adicionales; se recomienda revisar la licencia del base antes de uso comercial.
- Composición restringida: solo puede componerse con modelos que reporten el mismo hash de normalización (e8f4159ddb8fc98e); otros grupos no son compatibles.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/omkarpatil/push-tape-right-groot-sharednorm)
- [Perfil del autor en Hugging Face](https://huggingface.co/omkarpatil)
- [Repositorio NVIDIA Isaac-GR00T en GitHub](https://github.com/NVIDIA/Isaac-GR00T)
