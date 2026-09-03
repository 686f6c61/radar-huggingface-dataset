# AdarshSingh7647/Eklav-8B-Reranker

## Resumen

Eklav-8B-Reranker es un modelo de reranking de pasajes desarrollado por AdarshSingh7647, construido como un fine-tuning del modelo base Qwen/Qwen3-8B. Su principal innovación es el método de entrenamiento Eklav, que condiciona el razonamiento del estudiante sobre un rastro parcial del razonamiento del profesor, en lugar de imitar el rastro completo de principio a fin. Este enfoque reduce los costes de entrenamiento en un 32% en FLOPs respecto a la destilación estándar de cadena de pensamiento (CoT) completa, manteniendo o mejorando el rendimiento en tareas de reranking.

El modelo está diseñado específicamente para la tarea de reranking de pasajes en sistemas de recuperación aumentada por generación (RAG), con resultados publicados en los benchmarks BRIGHT y NevIR. En BRIGHT alcanza un nDCG@10 medio de 34,2, un 9% superior al obtenido con el mismo modelo base y los mismos datos de entrenamiento mediante SFT estándar de rastro completo. Con 8.190 millones de parámetros, se posiciona como un modelo de tamaño medio adecuado para despliegue en entornos con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, se recomienda consultar la documentacion del modelo base) |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-8B, un transformer decoder-only con atención causal. La innovación principal reside en el método de entrenamiento Eklav, que se describe como una variante de SFT condicionada por pistas (hint conditioned SFT). En lugar de entrenar al modelo para reproducir íntegramente el razonamiento del profesor (destilación de rastro completo), el estudiante recibe un rastro parcial del razonamiento del profesor, con la parte final que contiene la respuesta eliminada, y debe continuar razonando y producir la respuesta por sí mismo. El razonamiento del modelo se condiciona sobre el rastro parcial durante el entrenamiento, pero no se le exige replicarlo palabra por palabra.

Este cambio en el objetivo de entrenamiento reduce los FLOPs de entrenamiento en un 32% en comparación con la destilación CoT estándar, manteniendo el mismo modelo base y los mismos datos. Los datos de entrenamiento no se detallan en la información disponible, pero la tarea objetivo es el reranking de pasajes, evaluado en BRIGHT y NevIR. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

## Capacidades

- Reranking de pasajes: el modelo puntúa la relevancia de documentos frente a una consulta, permitiendo reordenar los resultados de un recuperador inicial.
- Razonamiento condicionado: gracias al entrenamiento con pistas parciales, el modelo puede continuar un razonamiento iniciado por otro sistema, lo que resulta útil en pipelines de recuperación multi-etapa.
- Generación de texto: al ser un modelo causal basado en Qwen3, puede generar texto, aunque su uso principal es el reranking.
- Integración con Transformers: compatible con la librería transformers de Hugging Face, lo que facilita su uso en pipelines existentes.
- Soporte para inferencia en producción: el repositorio indica compatibilidad con text-generation-inference y endpoints, lo que sugiere que puede desplegarse en entornos de servicio.

## Casos de uso

- Mejora de sistemas RAG: el modelo puede integrarse como segunda etapa de recuperación, reordenando los resultados de un recuperador denso o BM25 para mejorar la precisión de las respuestas generadas por un LLM.
- Búsqueda semántica empresarial: en motores de búsqueda internos, el reranker puede filtrar y reordenar documentos corporativos según la intención de la consulta, reduciendo el ruido en los resultados.
- Sistemas de preguntas y respuestas sobre documentación técnica: dado su entrenamiento en razonamiento, puede priorizar pasajes que contengan información relevante para consultas complejas de varios pasos.
- Moderación de contenido o filtrado de información: puede utilizarse para clasificar la relevancia de noticias o artículos frente a un tema de interés, ayudando en tareas de monitorización.
- Asistentes de investigación académica: para reordenar artículos científicos según su pertinencia a una consulta de investigación, mejorando la eficiencia de revisiones bibliográficas.
- Optimización de chatbots con contexto largo: al combinar el reranker con un LLM generativo, se puede seleccionar el contexto más relevante antes de generar la respuesta, reduciendo alucinaciones y mejorando la coherencia.

## Benchmarks y rendimiento

La información disponible solo incluye resultados en BRIGHT (nDCG@10) y una mención a NevIR, sin cifras concretas para este último. En BRIGHT, el modelo alcanza un promedio de 34,2 nDCG@10 en 12 dominios, con una mejora del 9% respecto a la SFT estándar de rastro completo. No se proporcionan comparaciones con otros modelos de reranking en la misma tabla.

| Benchmark | Metrica | Resultado |
|---|---|---|
| BRIGHT (12 dominios) | nDCG@10 | 34,2 (media) |
| BRIGHT (mejora vs SFT CoT completo) | nDCG@10 | +9% |
| NevIR | no disponible | no disponible |

No se han publicado resultados adicionales en otros benchmarks como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en reranking y no en tareas generales de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 16,4 GB en disco, por lo que la inferencia requiere al menos 16 GB de VRAM en precisión completa. Con cuantización a 8 bits (no publicada oficialmente) podría reducirse a unos 8-10 GB, y a 4 bits a unos 5-6 GB, aunque no se han proporcionado versiones cuantizadas.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) son suficientes para inferencia en bf16. Para despliegues con mayor concurrencia, se recomienda A100 80GB o H100.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o RTX 4090 pueden ejecutar el modelo en bf16, aunque con limitaciones de throughput si se sirven muchas peticiones simultáneas.
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI) y endpoints de Hugging Face. También puede usarse con vLLM si se adapta el formato, aunque no está confirmado oficialmente.
- Latencia y throughput: no se han publicado datos concretos. Para un modelo de 8B en bf16 en una A100, se puede esperar una latencia de decodificación de decenas de milisegundos por token, pero el reranking suele procesar lotes de pasajes, por lo que el throughput dependerá del tamaño del lote y de la longitud de los pasajes.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros rerankers en la información proporcionada. Como referencia general, se pueden mencionar alternativas de la misma categoría, pero sin cifras verificadas:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Eklav-8B-Reranker | 8,19B | no disponible | no disponible | Especializado en reranking, método Eklav |
| Qwen3-Reranker-8B | 8B | no disponible | Apache 2.0 (según documentacion de Qwen) | Reranker oficial de la serie Qwen3 |
| BGE-Reranker-v2-M3 | 568M | 8K | MIT | Reranker ligero y multilingue |

La comparación directa no es posible sin datos de benchmarks compartidos. Se recomienda evaluar Eklav-8B-Reranker frente a Qwen3-Reranker-8B en BRIGHT o NevIR para determinar cuál es más adecuado para un caso de uso concreto.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Se debe contactar con el autor antes de utilizarlo en producción.
- Idiomas no documentados: no se especifican los idiomas soportados. Dado que el modelo base Qwen3-8B es multilingüe, es probable que herede esa capacidad, pero no está confirmado.
- Especialización limitada: el modelo está entrenado para reranking, por lo que su rendimiento en tareas generales de generación o razonamiento puede ser inferior al de Qwen3-8B original.
- Riesgo de alucinación: al ser un modelo generativo, puede producir texto plausible pero incorrecto si se usa fuera del contexto de reranking.
- Sesgos potenciales: al derivar de Qwen3-8B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, aunque no se han documentado específicamente.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF o AWQ, lo que puede dificultar su despliegue en entornos con restricciones de memoria.
- Resultados de benchmarks limitados: solo se reporta BRIGHT y una mención a NevIR, sin comparaciones exhaustivas con otros modelos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-8B-Reranker
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio relacionado (TabRankSingleTableNaive): https://huggingface.co/AdarshSingh7647/TabRankSingleTableNaive
- Repositorio relacionado (forge-CoTCond): https://huggingface.co/AdarshSingh7647/forge-CoTCond
- Artículo sobre top rerankers para RAG: https://machinelearningmastery.com/top-5-reranking-models-to-improve-rag-results/
- Guía de rerankers para investigación académica: https://www.siliconflow.com/articles/best-reranker-model-for-academic-research
