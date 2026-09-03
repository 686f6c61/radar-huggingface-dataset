# AdarshSingh7647/Eklav-0.6B-Reranker-CotGen

## Resumen

Eklav-0.6B-Reranker-CotGen es un modelo de reranking de pasajes desarrollado por AdarshSingh7647, construido a partir del modelo base Qwen/Qwen3-0.6B. Se trata de un baseline de destilación de cadena de pensamiento (CoT) completa, diseñado para servir como punto de comparación en la evaluación del método Eklav, que entrena al modelo para continuar el razonamiento de un profesor a partir de un trace parcial en lugar de imitarlo de extremo a extremo. Este modelo, por tanto, no implementa la innovación de Eklav, sino que representa la configuración estándar de SFT con CoT completa.

Con 596 millones de parámetros, el modelo está orientado a tareas de reranking en recuperación de información, con resultados reportados en el benchmark BRIGHT (nDCG@10 medio de 16,1). Su relevancia radica en ser una referencia para medir mejoras en destilación de razonamiento a escalas pequeñas, un área de interés para sistemas de búsqueda eficientes y ligeros. El checkpoint se publica en formato bf16 fusionado y es compatible con el ecosistema Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3-0.6B (Transformer decoder-only) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint en bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only con atención causal estándar. El entrenamiento consiste en un fine-tuning supervisado (SFT) sobre un dataset de destilación de CoT completa, donde el modelo aprende a reproducir el razonamiento del profesor paso a paso y generar la respuesta final. Este es el baseline CotGen, que contrasta con el método Eklav (que oculta la parte final del razonamiento del profesor y condiciona al estudiante a continuar desde un punto intermedio). No se han publicado detalles sobre el volumen de datos, la composición del dataset ni el uso de técnicas adicionales como RLHF o DPO. El checkpoint se entrega fusionado en bf16, listo para inferencia.

## Capacidades

- Reranking de pasajes: reordena un conjunto de documentos según su relevancia para una consulta, utilizando razonamiento de cadena de pensamiento para justificar las puntuaciones.
- Generación de texto: al ser un modelo causal, puede generar texto, aunque su propósito principal es el reranking.
- Razonamiento multi-paso: la destilación de CoT le permite producir explicaciones intermedias antes de emitir un veredicto de relevancia.
- Integración con Transformers: compatible con `AutoModelForCausalLM` y `AutoTokenizer` para uso directo en pipelines de recuperación.
- No se han documentado capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Mejora de resultados en motores de búsqueda: el modelo puede reordenar los resultados iniciales de un sistema de recuperación (por ejemplo, BM25 o embeddings) para aumentar la precisión en dominios específicos, gracias a su razonamiento CoT que evalúa la relevancia de forma contextual.
- Sistemas RAG (Retrieval-Augmented Generation): en un pipeline de generación aumentada por recuperación, se puede usar como reranker para seleccionar los pasajes más pertinentes antes de pasarlos al generador, reduciendo ruido y mejorando la calidad de las respuestas.
- Búsqueda empresarial y de conocimiento: en entornos corporativos con grandes volúmenes de documentos, el modelo puede filtrar y ordenar resultados en tiempo real, aprovechando su tamaño reducido para despliegues en infraestructura modesta.
- Evaluación de relevancia en benchmarks académicos: dado su entrenamiento en BRIGHT y NevIR, puede utilizarse como herramienta de evaluación o como baseline en investigaciones sobre reranking y destilación de razonamiento.
- Asistentes de soporte al cliente: integrado en sistemas de ticket o FAQ, puede priorizar artículos de ayuda relevantes para una consulta del usuario, mejorando la tasa de resolución automática.
- Optimización de búsqueda en tiempo real: su baja latencia (al ser un modelo de 0.6B) lo hace adecuado para aplicaciones donde la velocidad es crítica, como búsqueda en vivo en e-commerce o plataformas de contenido.

## Benchmarks y rendimiento

El único resultado reportado en la model card es el promedio de nDCG@10 en el benchmark BRIGHT, con un valor de 16,1. No se proporcionan desgloses por dominio ni comparaciones con otros modelos en la información disponible.

| Benchmark | Métrica | Resultado |
|---|---|---|
| BRIGHT | nDCG@10 (promedio) | 16,1 |

No se han publicado resultados adicionales (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- VRAM estimada: el checkpoint en bf16 ocupa aproximadamente 1,2 GB (tamaño del repositorio), por lo que la inferencia puede ejecutarse con menos de 2 GB de VRAM, dependiendo de la longitud de la secuencia y el batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como NVIDIA GTX 1060 6GB, RTX 3060, RTX 4090 o superiores pueden manejarlo sin problemas. También es viable en CPU con cuantización adicional (aunque no se proporcionan cuantizaciones oficiales).
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en GPUs de consumo estándar.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama (mediante conversión). También es posible usarlo directamente con la API de Hugging Face.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por su tamaño se espera una latencia de decenas de milisegundos por consulta en GPU moderna, con throughput alto para batches pequeños.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo frente a alternativas como Qwen3-Reranker-0.6B o jina-reranker-v3.5. A continuación se presenta una comparación cualitativa basada en información pública de los modelos base.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Eklav-0.6B-Reranker-CotGen | 0,6B | No disponible | No disponible | Reranker con CoT (baseline) |
| Qwen3-Reranker-0.6B | 0,6B | 32k (según documentación de Qwen) | Apache 2.0 (según Qwen) | Reranker dedicado, sin CoT explícito |
| jina-reranker-v3.5 | 0,6B | No disponible | No disponible | Reranker ligero, drop-in replacement |

Nota: los datos de Qwen3-Reranker-0.6B y jina-reranker-v3.5 provienen de búsquedas web y pueden no ser exactos; se recomienda consultar sus fichas oficiales.

## Limitaciones y advertencias

- Es un baseline, no el modelo Eklav final; su propósito es servir de referencia para medir la mejora del método CotGen frente a Eklav.
- No se ha especificado la licencia, lo que genera incertidumbre sobre su uso comercial; se recomienda contactar al autor antes de utilizarlo en producción.
- No se documentan sesgos específicos, pero al ser un modelo pequeño entrenado en dominios concretos (BRIGHT, NevIR), puede presentar limitaciones en dominios fuera de esos ámbitos.
- Riesgo de alucinación en la generación de razonamiento: al ser un modelo de lenguaje, puede producir justificaciones plausibles pero incorrectas.
- La longitud de contexto no está publicada; aunque el modelo base Qwen3-0.6B soporta 32k tokens, no se confirma que este fine-tuning mantenga esa capacidad.
- No se proporcionan cuantizaciones oficiales, por lo que el despliegue en entornos con restricciones de memoria requerirá conversión manual.
- El rendimiento en tareas de generación general no está evaluado; su uso principal es el reranking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-0.6B-Reranker-CotGen
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Referencia a Qwen3-Reranker-0.6B (contexto de rerankers similares): https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Artículo sobre jina-reranker-v3.5 (mencionado en búsqueda web): https://www.linkedin.com/posts/elastic-co_a-06b-reranker-that-outscores-models-7x-activity-7487601505924104192-0GnV
