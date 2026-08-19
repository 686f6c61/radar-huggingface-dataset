# elplaguister/patent_classifier_nemotron

## Resumen

El modelo `elplaguister/patent_classifier_nemotron` es un modelo de embeddings de similitud semántica, fine-tuneado a partir de `nvidia/Nemotron-3-Embed-1B-BF16` para la búsqueda y clasificación de patentes coreanas según la taxonomía KOS (Clasificación de Patentes de Corea). El autor, elplaguister, lo ha entrenado con 2.002 patentes y 2.522 categorías de subclasificación KOS, empleando la técnica de Cached Multiple Negatives Ranking Loss. El modelo está pensado para recuperar la subclasificación correcta de una patente a partir de su texto (resumen, composición técnica y antecedentes).

Su relevancia radica en que aborda un problema específico de dominio: la clasificación automática de patentes en un sistema taxonómico jerárquico, algo que los modelos de embeddings genéricos no resuelven bien. Al estar basado en Nemotron-3-Embed-1B, hereda una arquitectura eficiente de 1.140 millones de parámetros y una ventana de contexto de 32.768 tokens, suficiente para documentos técnicos largos. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (embeddings) basado en Nemotron-3-Embed-1B |
| Parametros totales | 1.140.918.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (cutoff length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es `nvidia/Nemotron-3-Embed-1B-BF16`, un modelo de embeddings de la familia Nemotron de NVIDIA, diseñado para tareas de recuperación y similitud semántica. La arquitectura concreta no se detalla en la información disponible, pero se trata de un transformer encoder con 1.140 millones de parámetros, entrenado originalmente con datos multilingües y optimizado para eficiencia en GPU.

El fine-tuning se realizó con un conjunto de 2.002 patentes coreanas, cada una anotada con sus subclasificaciones KOS correspondientes (todas las positivas). Se usó la función de pérdida Cached Multiple Negatives Ranking Loss, que aprovecha los ejemplos negativos dentro de un batch para mejorar la discriminación. El entrenamiento duró 3 épocas con una longitud de corte de 32.768 tokens, alcanzando una pérdida final de 0,2505. El formato de entrada sigue la convención de Nemotron: prefijo `query:` para la consulta (patente) y `passage:` para el documento (descripción de taxonomía).

## Capacidades

- Generación de embeddings de similitud semántica para textos técnicos en coreano.
- Búsqueda de subclasificaciones KOS a partir de texto de patentes (resumen, composición técnica, antecedentes).
- Recuperación de documentos con ranking por similitud coseno.
- Manejo de contextos largos (hasta 32.768 tokens), adecuado para patentes extensas.
- Soporte de integración con la librería `sentence-transformers` para uso directo en pipelines de búsqueda.
- No soporta generación de texto, tool calling ni capacidades multimodales; es exclusivamente un modelo de embeddings.

## Casos de uso

- Clasificación automática de patentes en la taxonomía KOS: dado el texto de una patente, el modelo devuelve las subclasificaciones más probables, lo que permite automatizar el etiquetado inicial en oficinas de patentes o departamentos de I+D.
- Búsqueda semántica de patentes por similitud técnica: los embeddings permiten encontrar patentes relacionadas por contenido, no solo por palabras clave, útil para análisis de libertad de operación o estudios de estado del arte.
- Asistencia a examinadores de patentes: el modelo puede sugerir subclasificaciones candidatas para revisión humana, reduciendo el tiempo de clasificación manual.
- Organización de bases de datos de patentes: indexar documentos con embeddings para recuperación eficiente en sistemas de gestión documental.
- Detección de solapamiento tecnológico: comparar patentes de diferentes solicitantes para identificar posibles conflictos o colaboraciones.
- Enriquecimiento de metadatos: asignar automáticamente códigos KOS a patentes históricas que carecen de clasificación, mejorando la consistencia de los datos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que se evaluó con nDCG@10, MRR@10, Hit@1 y Recall@10, pero no se proporcionan los valores obtenidos. Por tanto, no es posible comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 2,3 GB (según el tamaño del repositorio). Para inferencia con `sentence-transformers`, se recomienda al menos 4 GB de VRAM para trabajar cómodamente con secuencias largas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU, aunque con menor rendimiento.
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas de gama media.
- Opciones de despliegue: se puede usar directamente con `sentence-transformers` en Python, o exportar a ONNX para servir con frameworks como FastAPI. No se menciona soporte explícito para vLLM, llama.cpp u Ollama, ya que es un modelo de embeddings, no generativo.
- Latencia y throughput: no disponible; dependerá del hardware y de la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de embeddings de patentes. Alternativas genéricas como `BGE-M3`, `E5-large` o `GTE-Qwen2` podrían ser comparables en tamaño, pero no hay datos de rendimiento específicos para la tarea de clasificación KOS. Se recomienda evaluar el modelo en el propio dominio antes de elegir.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en coreano; no es adecuado para patentes en otros idiomas.
- El conjunto de entrenamiento es reducido (2.002 patentes), lo que puede limitar la generalización a dominios técnicos no representados.
- La taxonomía KOS es específica de Corea; el modelo no sirve para otras clasificaciones (IPC, CPC, etc.) sin reentrenamiento.
- No se han publicado métricas de rendimiento, por lo que no hay evidencia cuantitativa de su eficacia.
- Riesgo de alucinación en la recuperación: puede devolver subclasificaciones incorrectas si el texto de entrada es ambiguo o contiene terminología poco común.
- El modelo solo genera embeddings; no realiza clasificación directa, sino que depende de un paso de similitud coseno con las descripciones de taxonomía.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Nemotron-3-Embed-1B puede tener sus propias condiciones; se recomienda revisar la licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elplaguister/patent_classifier_nemotron
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Página de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Repositorio GitHub de Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Documentación de Nemotron en HuggingFace: https://huggingface.co/docs/transformers/model_doc/nemotron
