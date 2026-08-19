# cfigueiroa/Qwen3.8-27B-RVN-MTP

## Resumen

Qwen3.8-27B-RVN-MTP es un modelo de lenguaje multimodal de 27 356 millones de parámetros, derivado de Qwen/Qwen3.8-27B mediante un proceso de fine-tuning dirigido a reducir la tasa de rechazos del modelo (refusals) manteniendo una alta fidelidad al modelo original. El autor, cfigueiroa, parte del checkpoint trohrbaugh/Qwen3.8-27B-heretic-ara, que ya había sido sometido a un proceso de "abliteration" (eliminación de la tendencia a negarse a responder), y aplica dos pasadas adicionales de la técnica ARA (activation reshaping/steering) sobre las capas 26 a 56. El resultado es un modelo con una tasa de rechazos de 48/100 (frente a 70/100 del modelo de partida) y una divergencia KL de 0.0058 respecto al padre, lo que indica una alteración mínima de las capacidades originales.

El modelo conserva la arquitectura multimodal de Qwen3.8-27B, por lo que puede procesar tanto texto como imágenes. Incluye además los tensores de multi-token prediction (mtp.*) restaurados, lo que permite su uso con herramientas que soporten decodificación especulativa. Los pesos se distribuyen en formato safetensors en BF16, con un tamaño de repositorio de 55,6 GB. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Este modelo es relevante para desarrolladores que necesitan un asistente multimodal con mínima censura y alta fidelidad al comportamiento del modelo base, por ejemplo para aplicaciones de generación creativa, roleplay o investigación sobre alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.8-27B) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | BF16 (safetensors); GGUF privado (no publico) |
| Idiomas soportados | No disponibles (heredados del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF (privado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un transformer multimodal que acepta entradas de imagen y texto. No se proporcionan detalles internos de la arquitectura (número de capas, atención, etc.), pero se asume que mantiene la estructura del modelo original. El proceso de entrenamiento consistió en dos pasadas adicionales de ARA (activation reshaping/steering) sobre el checkpoint trohrbaugh/Qwen3.8-27B-heretic-ara, que a su vez es un modelo "abliterated" (con los vectores de rechazo eliminados). Los parámetros de ARA fueron: capas 26 a 56, preserve 0.9432, steer 0.0009, overcorrect 0.5038 y k=10. Este proceso ajusta las activaciones internas para reducir la probabilidad de que el modelo genere respuestas de rechazo, manteniendo al mismo tiempo la coherencia con el modelo original (KL baja).

Además, el repositorio incluye el archivo `model-auxiliary.safetensors` con 15 tensores `mtp.*` correspondientes a la cabecera de multi-token prediction, lo que permite decodificación especulativa en entornos compatibles. El autor indica que se debe convertir el modelo sin la opción `--no-nextn` para preservar esta funcionalidad. No se especifican los datos de entrenamiento utilizados para las pasadas ARA, ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y comprensión de imágenes (entrada multimodal imagen-texto).
- Reducción significativa de rechazos: 48/100 en pruebas de refusals, frente a 70/100 del modelo de partida.
- Mantiene la fidelidad al modelo base con una divergencia KL de 0.0058 respecto al padre, lo que sugiere que conserva las capacidades generales de Qwen3.8-27B (razonamiento, conocimiento, etc.).
- Soporte de multi-token prediction (MTP) para decodificación especulativa, que puede acelerar la generación en inferencia.
- No se confirma explícitamente el soporte de tool calling o function calling, pero es probable que herede dicha capacidad del modelo base (no verificado en la información proporcionada).
- Capacidades multilingües no especificadas, aunque se asume que hereda las del modelo base Qwen3.8-27B.

## Casos de uso

- Generación creativa de contenido sin restricciones: el modelo está diseñado para no negarse a responder, lo que lo hace adecuado para escritura de ficción, guiones, poesía o contenido de rol donde el usuario espera respuestas continuas sin rechazos.
- Asistentes de conversación abierta: su baja tasa de rechazos permite mantener diálogos largos y variados sin interrupciones por políticas de seguridad, útil en entornos controlados de investigación o entretenimiento.
- Análisis de imágenes con texto: al ser multimodal, puede describir imágenes, responder preguntas sobre su contenido o generar texto a partir de ellas, por ejemplo en aplicaciones de accesibilidad o documentación automática.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para evaluar el impacto de técnicas de abliteration y steering en el comportamiento de modelos grandes, comparando tasas de rechazo y métricas de fidelidad.
- Prototipado de aplicaciones con decodificación especulativa: gracias a los tensores MTP, se puede integrar en pipelines que utilicen vLLM u otros frameworks con soporte para nextn, reduciendo la latencia de generación.
- Fine-tuning adicional: al ser un checkpoint abierto bajo Apache-2.0, puede utilizarse como base para tareas específicas que requieran mínima censura, como generación de diálogos en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada es la tasa de rechazos (refusals) y la divergencia KL respecto al modelo padre, que no son comparables con benchmarks académicos convencionales. Se recomienda evaluar el modelo en tareas específicas antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, el modelo ocupa aproximadamente 54,7 GB (27 356 728 560 parámetros × 2 bytes). Para cargar los pesos completos se necesitan al menos 56 GB de VRAM, por lo que se requieren GPUs de alta gama.
- GPU recomendadas: una NVIDIA A100 80GB, H100 80GB, o múltiples RTX 4090 (24 GB cada una, necesitarías 3 en paralelo). También es posible usar configuraciones con memoria unificada (Apple Silicon con 64 GB o más).
- En consumer GPU: no cabe en una sola GPU de consumo estándar (RTX 4090 tiene 24 GB). Se podría usar cuantización GGUF (privada) para reducir los requisitos, pero no está disponible públicamente.
- Opciones de despliegue: vLLM (con soporte para nextn), llama.cpp (si se convierten los pesos a GGUF), Ollama (si se publica un GGUF), y Transformers de HuggingFace con bibliotecas estándar.
- Latencia y throughput: no disponibles. Dependerá del hardware y del uso de decodificación especulativa (MTP), que puede acelerar la generación entre 1.5x y 2x en escenarios favorables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Refusals (aprox.) | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,4 B | No disponible | Sí | Apache-2.0 | Alto (estándar) | Modelo original con políticas de seguridad |
| Qwen3.8-27B-heretic-ara | 27,4 B | No disponible | Sí | Apache-2.0 | 70/100 | Abliterated, primera pasada |
| Qwen3.8-27B-RVN-MTP (este) | 27,4 B | No disponible | Sí | Apache-2.0 | 48/100 | Dos pasadas ARA adicionales, MTP |
| Llama 3.1 30B (referencia) | 30,5 B | 128K | No | Llama 3.1 | Alto | No multimodal, sin abliteration |

La comparativa se basa en características generales, ya que no hay benchmarks comunes disponibles. La principal diferencia entre este modelo y sus predecesores es la reducción progresiva de rechazos manteniendo baja divergencia KL, lo que lo hace único en su categoría.

## Limitaciones y advertencias

- El modelo ha sido explícitamente diseñado para reducir rechazos, lo que implica que puede generar contenido inapropiado, ofensivo, peligroso o ilegal si se le solicita. No debe desplegarse en aplicaciones públicas sin una capa de moderación adicional.
- No se han publicado evaluaciones de sesgos, alucinaciones o calidad en tareas estándar. La fidelidad al modelo base (KL baja) sugiere que conserva las capacidades, pero también los sesgos de Qwen3.8-27B.
- La longitud de contexto no está documentada; se recomienda verificar el valor del modelo base antes de usarlo en tareas de contexto largo.
- Los GGUF son privados y no están disponibles públicamente, lo que limita el despliegue en entornos con restricciones de VRAM.
- El autor indica que el archivo `--mmproj` de este checkpoint falla (problema con `image_mean`), por lo que para usos multimodales con GGUF se debe emplear el mmproj del repositorio oficial de Qwen3.8-27B.
- No se garantiza compatibilidad total con todas las herramientas de inferencia; se recomienda probar con el framework elegido antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cfigueiroa/Qwen3.8-27B-RVN-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo padre (heretic-ara): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- GGUF privado: https://huggingface.co/cfigueiroa/Qwen3.8-27B-RVN-MTP-GGUF
- mmproj recomendado para GGUF: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
