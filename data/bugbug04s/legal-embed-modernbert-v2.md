# bugBug04S/legal-embed-modernbert-v2

## Resumen

legal-embed-modernbert-v2 es un modelo de embeddings densos para similitud semántica, especializado en el dominio jurídico. Desarrollado por el usuario bugBug04S, este modelo parte de la base nomic-ai/modernbert-embed-base, una versión moderna del arquitecto BERT entrenada sobre 2 billones de tokens, y se ajusta finamente con datos legales para mejorar la recuperación de información en textos normativos y contractuales. Con 149 millones de parámetros y una ventana de contexto de 8192 tokens, ofrece un equilibrio entre eficiencia computacional y capacidad para manejar documentos extensos.

El modelo se ha entrenado utilizando funciones de pérdida como MatryoshkaLoss y CachedMultipleNegativesRankingLoss, lo que permite obtener representaciones densas de alta calidad con dimensiones reducidas cuando sea necesario. Su relevancia actual radica en la creciente demanda de herramientas de búsqueda semántica en el sector legal, donde los métodos basados en palabras clave resultan insuficientes para capturar la complejidad del lenguaje jurídico. El modelo está disponible en Hugging Face con formato safetensors y es compatible con la biblioteca sentence-transformers, así como con soluciones de despliegue como text-embeddings-inference.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only transformer) |
| Parámetros totales | 149.014.272 |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura encoder-only que moderniza el BERT original con mejoras como embeddings posicionales rotatorios (RoPE) para soportar secuencias de hasta 8192 tokens, capas GeGLU, atención alternada y unpadding para evitar cálculo desperdiciado en tokens de padding. Esta base fue preentrenada sobre 2 billones de tokens, lo que proporciona una base sólida de representación lingüística general.

El ajuste fino se realizó sobre un conjunto de datos legal de 24.413 muestras, utilizando una combinación de funciones de pérdida: MatryoshkaLoss para permitir la extracción de embeddings con dimensiones variables, y CachedMultipleNegativesRankingLoss junto con MultipleNegativesRankingLoss para optimizar la similitud entre consultas y documentos relevantes en tareas de recuperación. Esta combinación de pérdidas es especialmente útil para el entrenamiento eficiente de modelos de búsqueda semántica, ya que aprovecha la estructura de pares positivos y negativos dentro del dataset.

## Capacidades

- Generación de embeddings densos para frases y documentos, optimizados para similitud coseno.
- Recuperación de información semántica en dominios legales, incluyendo contratos, normativas y discusiones jurídicas.
- Soporte de Matryoshka embeddings, que permite ajustar la dimensión del vector de salida según las necesidades de almacenamiento y velocidad.
- Manejo de contextos largos de hasta 8192 tokens, adecuado para documentos legales extensos.
- Capacidades multilingües: no disponible de forma oficial, aunque el modelo base ModernBERT tiene soporte multilingüe limitado.
- Sin soporte de tool calling, agentes ni razonamiento multi-step, ya que es un modelo encoder-only para representación, no generativo.

## Casos de uso

- Búsqueda semántica en bases de datos legales: el modelo puede indexar documentos jurídicos y recuperar los más relevantes para una consulta en lenguaje natural, mejorando la precisión frente a búsquedas por palabras clave. Gracias a su contexto de 8192 tokens, puede procesar cláusulas y párrafos completos sin truncamiento.
- Asistencia en revisión de contratos: permite localizar cláusulas específicas (como las de no competencia o confidencialidad) en grandes volúmenes de contratos, comparando su similitud semántica con textos de referencia.
- Sistemas de respuesta a preguntas sobre datos legales: al integrarse con un pipeline de recuperación, puede extraer pasajes relevantes de un corpus legal para responder consultas sobre GDPR, obligaciones contractuales o normativas locales.
- Clasificación de documentos jurídicos: los embeddings generados pueden servir como entrada a clasificadores para categorizar sentencias, recursos o dictámenes por tipo o jurisdicción.
- Deduplicación de documentos: al calcular la similitud entre pares de documentos, el modelo puede identificar textos duplicados o casi duplicados en bases de datos legales, facilitando la limpieza de datos.
- Asistencia a estudios de abogados: integración en herramientas de gestión documental para sugerir precedentes o jurisprudencia relacionada con un caso concreto, reduciendo el tiempo de investigación.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card se presentan a continuación. No se han publicado comparativas con otros modelos en la información disponible.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Information Retrieval | legalqa dev | Cosine Accuracy@1 | 0.94 |
| Information Retrieval | legalqa dev | Cosine Accuracy@3 | 0.99 |
| Information Retrieval | legalqa dev | Cosine Accuracy@5 | 0.9967 |
| Information Retrieval | legalqa dev | Cosine Accuracy@10 | 1.0 |
| Information Retrieval | legalqa dev | Cosine Precision@1 | 0.94 |
| Information Retrieval | legalqa dev | Cosine Precision@3 | 0.33 |
| Information Retrieval | legalqa dev | Cosine Precision@5 | 0.1993 |
| Information Retrieval | legalqa dev | Cosine Precision@10 | 0.1 |
| Information Retrieval | legalqa dev | Cosine Recall@1 | 0.94 |
| Information Retrieval | legalqa dev | Cosine Recall@3 | 0.99 |
| Information Retrieval | legalqa dev | Cosine Recall@5 | 0.9967 |
| Information Retrieval | legalqa dev | Cosine Recall@10 | 1.0 |
| Information Retrieval | legalqa dev | Cosine NDCG@10 | 0.9736 (valor truncado en la fuente) |

Estos resultados indican un rendimiento alto en recuperación de información en el dataset legalqa dev, aunque la precisión desciende al aumentar el número de resultados devueltos, lo que sugiere que los primeros resultados son altamente relevantes.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149 millones de parámetros en FP32, el modelo ocupa aproximadamente 596 MB; en FP16 se reduce a ~298 MB, y en cuantización de 8 bits a ~149 MB.
- GPU recomendadas: una GPU de consumo como la NVIDIA RTX 3060 (12 GB) o RTX 4070 (12 GB) es suficiente para inferencia con lotes pequeños. Para procesamiento en lote grande, se recomienda una A10G, L4 o A100.
- Compatible con GPU de consumo: sí, el modelo cabe en GPUs de 8 GB o más, incluso con cuantización.
- Opciones de despliegue: se puede servir con sentence-transformers, text-embeddings-inference (TEI), o a través de frameworks como vLLM (aunque este está optimizado para decodificadores, no para encoders).
- Latencia y throughput: no se dispone de datos oficiales, pero para un modelo de este tamaño, la latencia típica en una GPU moderna es de unos pocos milisegundos por secuencia, con un throughput de cientos de secuencias por segundo en lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|------|------|------|------|------|------|
| legal-embed-modernbert-v2 | 149 M | 8192 | Legal | No disponible | Hugging Face |
| nomic-ai/modernbert-embed-base | 149 M | 8192 | General | Apache 2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 | General | Apache 2.0 | Hugging Face |
| legal-bert-base-uncased | 110 M | 512 | Legal | Apache 2.0 | Hugging Face |

La comparación directa con modelos similares no está disponible en la información proporcionada. Sin embargo, se puede observar que el modelo base ModernBERT supera a BERT en contexto y eficiencia, y el ajuste legal de este modelo lo hace específicamente adecuado para tareas jurídicas frente al modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede heredar los sesgos del corpus de entrenamiento legal, que podría estar sesgado hacia jurisdicciones o idiomas específicos (el ejemplo muestra textos en inglés).
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación en el sentido clásico, pero sí de recuperar documentos irrelevantes si el entrenamiento no cubre ciertos dominios.
- Limitaciones de contexto: aunque soporta 8192 tokens, el modelo base se entrenó con secuencias de hasta 8192 tokens, pero el ajuste fino con un dataset de 24K muestras puede no haber explotado completamente esa longitud.
- Restricciones de licencia: la licencia no está disponible, lo que puede ser un obstáculo para uso comercial. Se recomienda contactar al autor para aclarar los términos.
- Riesgo de producción: al ser un modelo con 0 descargas y 0 likes, no hay evidencia de uso en producción ni de robustez en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bugBug04S/legal-embed-modernbert-v2
- Modelo base: https://huggingface.co/nomic-ai/modernbert-embed-base
- Documentación de ModernBERT: https://huggingface.co/docs/transformers/model_doc/modernbert
- Repositorio de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
