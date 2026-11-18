# alphaedge-ai/mmBERT-small-afr-32768

## Resumen

mmBERT-small-afr-32768 es una variante "trimmed" (podada) del encoder multilingüe jhu-clsp/mmBERT-small, publicada por alphaedge-ai y especializada en afrikáans. El proceso de trimming reduce el vocabulario original de 256.000 tokens a 32.768 tokens, conservando únicamente los tokens más frecuentes en el idioma objetivo. Esto rebaja el número de parámetros de 140.493.696 a 54.772.608, un 61,01 % menos, y el tamaño del vocabulario en un 87,20 %.

El modelo mantiene la arquitectura ModernBERT del modelo base y se distribuye como checkpoint de `transformers` en formato `safetensors`, con pipeline declarado `fill-mask` y también utilizable para `feature-extraction`. Su interés práctico reside en que permite desplegar un encoder compacto (~55 M de parámetros, repo de 0,2 GB) con una huella de memoria muy reducida, a cambio de perder cobertura léxica fuera del afrikáans.

La relevancia es acotada pero clara: es un artefacto de nicho para pipelines de NLP en afrikáans (clasificación, recuperación, embeddings, masked language modeling) donde el coste de inferencia y el tamaño del vocabulario importan más que la cobertura multilingüe. No es un modelo generativo ni un LLM; es un encoder bidireccional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional), derivado de jhu-clsp/mmBERT-small |
| Parametros totales | 54.772.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (presumiblemente FP32/BF16, no confirmado) |
| Idiomas soportados | af (afrikaans) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Vocabulario | 32.768 tokens (frente a 256.000 del original) |
| Tamano del repo | 0,2 GB |
| Pipeline declarado | fill-mask (tambien valido para feature-extraction) |
| Dataset de minado | lbourdois/fineweb-2-trimming (200.000 textos) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura ModernBERT del modelo base mmBERT-small, un encoder transformer con las mejoras propias de ModernBERT (rotary positional embeddings, atención con soporte de secuencias largas y capas optimizadas para hardware moderno). No se ha reentrenado desde cero: el autor aplica trimming de vocabulario, es decir, selecciona los 32.768 tokens más relevantes para afrikáans a partir del vocabulario original de 256.000 y recorta las matrices de embedding y de salida en consecuencia.

El proceso de selección de tokens se realizó minando 200.000 textos del dataset lbourdois/fineweb-2-trimming. No se detalla en la información disponible si hubo ajuste fino posterior al recorte, ni el número de tokens de entrenamiento, ni si se aplicaron técnicas de destilación o RLHF/DPO (poco habituales en encoders de este tipo). El modelo base mmBERT se describe en el paper arXiv:2509.06888 ("mmBERT: A Modern Multilingual Encoder with Annealed Language Learning"), que introduce un esquema de aprendizaje lingüístico annealed para encoders multilingües.

## Capacidades

- Masked language modeling (relleno de máscaras) en afrikáans, pipeline declarado del modelo.
- Extracción de features y generación de embeddings de frase o token para tareas downstream (clasificación, NER, retrieval, similitud semántica).
- Comprensión bidireccional de contexto, adecuada para tareas de encoding y no para generación autoregresiva.
- Cobertura léxica restringida a afrikáans; el vocabulario recortado elimina tokens de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step (no aplicable a un encoder de este tipo).
- No se documenta soporte de visión, audio ni modo "thinking".
- Capacidad multilingüe: no; el modelo está optimizado exclusivamente para afrikáans y el autor advierte que puede rendir mal en otros idiomas.

## Casos de uso

- Clasificación de texto en afrikáans: usar los embeddings del encoder como entrada a un clasificador ligero (regresión logística o una cabeza lineal) para moderación, análisis de sentimiento o categorización de tickets, aprovechando el reducido tamaño del modelo.
- Búsqueda semántica y recuperación de documentos: generar embeddings de pasajes y consultas en afrikáans para un motor de retrieval (por ejemplo, FAISS) con un coste de almacenamiento muy bajo gracias a los 55 M de parámetros.
- Masked language modeling para corrección ortográfica o autocompletado asistido en afrikáans, usando el pipeline `fill-mask` directamente.
- Extracción de entidades nombradas (NER): afinar una cabeza de token classification sobre el encoder para extraer nombres, organizaciones y lugares en corpus en afrikáans.
- Preprocesamiento y enriquecimiento de corpus: generar representaciones densas de documentos en afrikáans para deduplicación, clustering o etiquetado débil en pipelines de datos.
- Despliegue en entornos con recursos limitados: servir el modelo en CPU o en GPUs de gama baja para tareas de encoding en producción, donde un encoder multilingüe completo (140 M de parámetros, vocabulario de 256k) sería excesivo.
- Filtrado y triaje en pipelines de datos: usar el modelo como scorer de calidad o relevancia sobre texto en afrikáans antes de alimentar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma que el modelo podado "debería rendir de forma similar al original" en afrikáans, sin cifras concretas de MMLU, GLUE, XNLI ni otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (55 M de parámetros ≈ 220 MB de pesos), y en torno a 100-150 MB en FP16/BF16; el repo completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3060 o incluso una GPU integrada pueden servirlo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1 GB de VRAM libre; también es viable en CPU.
- Opciones de despliegue: `transformers` (AutoModel/AutoTokenizer), y por compatibilidad de arquitectura ModernBERT, potencialmente `vLLM`, `TGI` o `Ollama` si soportan el modelo base; no se confirma en la información disponible.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| alphaedge-ai/mmBERT-small-afr-32768 | 54.772.608 | 32.768 | af | no disponible | MIT | Version podada para afrikaans |
| jhu-clsp/mmBERT-small (base) | 140.493.696 | 256.000 | multilingue | no disponible | no disponible en la informacion | Modelo original, cobertura multilingue |
| jhu-clsp/mmBERT-base | no disponible en la informacion | no disponible | multilingue | no disponible | no disponible | Version mayor de la familia mmBERT |

La comparativa se limita a la familia mmBERT porque no se dispone de datos de otros encoders podados para afrikáans en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida: el vocabulario recortado elimina tokens de otros idiomas; el autor advierte explícitamente que puede rendir mal fuera del afrikáans.
- Riesgo de degradación en dominios con vocabulario especializado (términos técnicos, nombres propios, código) que no aparecían en los 200.000 textos de minado.
- Posible pérdida de rendimiento frente al modelo base incluso en afrikáans si el corpus de minado no representa bien el dominio de uso.
- Es un encoder, no un modelo generativo: no debe usarse para generación de texto libre ni razonamiento.
- Riesgo de sesgos heredados del corpus FineWeb-2 y del modelo base mmBERT; no se documenta ninguna mitigación.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base jhu-clsp/mmBERT-small y del dataset de minado.
- No hay benchmarks publicados que respalden la afirmación de rendimiento similar al original; validar empíricamente antes de producción.
- Modelo con muy poca tracción (15 descargas, 0 likes en el momento de la consulta); sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/mmBERT-small-afr-32768
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Paper mmBERT: https://arxiv.org/abs/2509.06888
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
