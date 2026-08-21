# monroewilliams/Qwen3.5-0.8B-oQ4e-fp16-mtp

## Resumen

El modelo `monroewilliams/Qwen3.5-0.8B-oQ4e-fp16-mtp` es una cuantización en 4 bits del modelo base Qwen/Qwen3.5-0.8B, realizada con la herramienta oQ (oMLX v0.6.3rc2) en formato MLX safetensors. El modelo base pertenece a la familia Qwen3.5 de Alibaba Cloud, una serie de ocho modelos open-weight que van desde 0,8B hasta 397B de parámetros, todos con licencia Apache 2.0 y arquitectura híbrida que combina atención lineal con transformadores tradicionales. Esta versión cuantizada está diseñada para entornos de despliegue en el edge, reduciendo el peso del modelo a 0,9 GB.

La cuantización mantiene el núcleo de capacidades del Qwen3.5-0.8B: razonamiento mejorado sobre Qwen3, seguimiento de instrucciones y soporte multimodal nativo (texto, imagen y vídeo). Sin embargo, al tratarse de una conversión no oficial realizada por un usuario particular, la licencia y los idiomas soportados no se especifican en la ficha del repositorio. El modelo se distribuye exclusivamente en formato MLX, pensado para el ecosistema de Apple Silicon y otras plataformas compatibles con MLX.

La relevancia de esta cuantización radica en su tamaño compacto: con 228,7 millones de parámetros registrados en los safetensors y un peso de 0,9 GB, es apta para dispositivos con recursos limitados, como portátiles, móviles o GPUs de gama media. No obstante, al ser una versión no oficial y sin benchmarks publicados, su adopción en producción debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (linear attention + transformer) según modelo base Qwen3.5 |
| Parametros totales | 228.747.328 (según safetensors; el modelo base se anuncia como 0,8B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, grupo de tamaño 64, precisión mixta (oQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el modelo base es Apache 2.0) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B adopta una arquitectura híbrida que mezcla atención lineal con capas de transformador clásicas, una innovación diseñada para reducir el coste computacional en secuencias largas manteniendo la calidad de representación. Según la documentación de Qwen, la serie Qwen3.5 es nativamente multimodal, entrenada con datos de texto, imagen y vídeo, y presenta mejoras sustanciales en razonamiento y seguimiento de instrucciones respecto a Qwen3. No se dispone de detalles sobre el número de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO para este modelo específico.

La cuantización aplicada en este repositorio se realiza con la herramienta oQ de oMLX, que implementa cuantización de precisión mixta: mantiene ciertas capas en fp16 mientras cuantiza otras a 4 bits con un tamaño de grupo de 64. Este enfoque busca preservar la precisión de las capas más sensibles, como las de atención o las de salida, mientras se reduce el peso total del modelo. El resultado es un archivo de 0,9 GB, significativamente más ligero que el modelo original de 0,8B en fp16, que ocuparía aproximadamente 1,6 GB.

## Capacidades

- Generación de texto con razonamiento mejorado respecto a Qwen3, según la documentación de la familia Qwen3.5.
- Multimodalidad nativa (texto, imagen y vídeo) en el modelo base, aunque la cuantización no garantiza que todas las modalidades se preserven íntegramente.
- Seguimiento de instrucciones y diálogo conversacional, optimizado para tareas de chat y asistencia.
- Capacidades multilingües del modelo base, aunque los idiomas concretos no están documentados en esta cuantización.
- Despliegue en entornos edge y móviles gracias a su tamaño compacto (0,9 GB) y al formato MLX optimizado para Apple Silicon.

## Casos de uso

- Asistentes conversacionales en dispositivos locales: el tamaño de 0,9 GB permite ejecutar el modelo en portátiles con Apple Silicon o móviles con soporte MLX, ofreciendo respuestas de texto en tiempo real sin conexión.
- Clasificación y extracción de información: su capacidad de razonamiento, aunque limitada por el tamaño, puede usarse para tareas de etiquetado, resumen o extracción de entidades en flujos de procesamiento de lenguaje natural.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden usar este modelo cuantizado para validar ideas y arquitecturas de producto antes de migrar a modelos de mayor tamaño, gracias a su bajo requisito de memoria.
- Inferencia en GPUs de gama media: con un peso de 0,9 GB, cabe en GPUs con 4 GB de VRAM, como una RTX 3050, permitiendo experimentación local en entornos de desarrollo.
- Aplicaciones de accesibilidad: puede integrarse en herramientas de lectura asistida o de transcripción de voz a texto (aunque la entrada de audio no está confirmada en esta cuantización), aprovechando su tamaño reducido.
- Educación y experimentación: el formato MLX y la cuantización permiten estudiar técnicas de compresión de modelos y evaluar el impacto de la cuantización en el rendimiento, sin necesidad de hardware de alto nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del repositorio no incluye métricas de rendimiento, y los datos del modelo base (Qwen3.5-0.8B) no se detallan en las fuentes consultadas. Se recomienda realizar evaluaciones propias en tareas específicas antes de usar el modelo en entornos de producción.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ocupar 0,9 GB en disco, la carga en memoria requerirá aproximadamente 1,2-1,5 GB de RAM/VRAM, dependiendo de la longitud del contexto y el batch.
- **GPU recomendadas**: cualquier GPU con al menos 2-4 GB de VRAM (por ejemplo, RTX 3050, RTX 2060, o chips Apple Silicon con memoria unificada de 8 GB) debería poder ejecutar el modelo.
- **Consumer GPU**: sí, cabe en GPUs de consumo de gama baja y media.
- **Opciones de despliegue**: al ser formato MLX, es compatible con el ecosistema MLX de Apple, aunque también se puede usar con librerías que soporten safetensors, como Transformers o llama.cpp (si se convierte a GGUF, aunque no se proporciona en este repo).
- **Latencia y throughput**: no disponibles. Dado el tamaño reducido, se espera una generación rápida en hardware moderno, pero no se ha medido.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo base Qwen3.5-0.8B puede compararse con otros modelos de tamaño similar como Qwen3-0.6B o Llama 3.2 1B, pero no se tienen métricas de rendimiento ni de licencia para esta cuantización específica. La familia Qwen3.5 se publica bajo Apache 2.0, pero la licencia de esta cuantización no se indica.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos específicos, pero al derivarse de un modelo base de 0,8B, es probable que presente sesgos de género, etnia o idioma comunes en modelos de lenguaje pequeños.
- **Riesgo de alucinación**: los modelos de 0,8B tienden a alucinar más que los modelos grandes, especialmente en tareas de razonamiento complejo o generación de hechos. La cuantización de 4 bits puede amplificar este efecto.
- **Limitaciones de contexto**: no se ha especificado la longitud máxima de contexto; si el modelo base soporta 32K o más, la cuantización podría reducir la capacidad de memoria a largo plazo.
- **Restricciones de licencia**: la licencia de esta cuantización no está indicada en el repositoria. El modelo base es Apache 2.0, pero el autor de la cuantización no aclara si se mantiene esa licencia, lo que es un riesgo para uso comercial.
- **Formato de pesos**: el formato MLX safetensors no es compatible directamente con herramientas como vLLM o TGI, lo que limita las opciones de despliegue en servidores de producción.
- **Caveat importante**: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad. La fecha de creación (2026-08-21) es futura, lo que puede indicar un error o un modelo no probado.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/monroewilliams/Qwen3.5-0.8B-oQ4e-fp16-mtp)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Colección Qwen3.5 en HuggingFace](https://huggingface.co/collections/Qwen/qwen35)
- [Qwen3.5 en Qualcomm AI Hub](https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b)
- [Guía completa de Qwen3.5](https://qwen-ai.com/qwen-3-5/)
- [Benchmark y guía local de Qwen3.5 0.8B](https://codersera.com/blog/run-and-benchmark-qwen35-08b/)
