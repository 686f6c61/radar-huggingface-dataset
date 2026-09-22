# answerdotai/ModernBERT-large

## Resumen

ModernBERT-large es un modelo de lenguaje de tipo encoder bidireccional (estilo BERT) desarrollado por Answer.AI en colaboración con LightOn. Es la variante grande de la familia ModernBERT, con 395.881.664 parámetros repartidos en 28 capas, y está diseñado para tareas de comprensión del lenguaje natural y de recuperación de información (retrieval). A diferencia de los modelos generativos, se trata de un Masked Language Model (MLM) orientado a producir representaciones contextuales, no texto autoregresivo.

El modelo se pre-entrenó sobre 2 billones de tokens de texto en inglés y código, con una longitud de contexto nativa de hasta 8.192 tokens, muy superior a los 512 tokens de BERT o RoBERTa. Incorpora mejoras arquitectónicas recientes: embeddings posicionales rotatorios (RoPE) para soportar contexto largo, atención local-global alterna para ganar eficiencia en entradas extensas, y técnicas de unpadding junto con Flash Attention para acelerar la inferencia.

Su relevancia actual radica en que actualiza el paradigma encoder de forma directa: se puede usar como sustituto de BERT o RoBERTa en pipelines de clasificación, búsqueda semántica, reranking y análisis de documentos largos, con licencia Apache 2.0 y resultados que en varios benchmarks de retrieval y código superan a los encoders previos de tamaño similar. Se publicó en diciembre de 2024 y acumula más de 625.000 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only bidireccional (estilo BERT) con RoPE, atención local-global alterna, unpadding y Flash Attention |
| Parametros totales | 395.881.664 (aproximadamente 395 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens nativos |
| Tipos de cuantizacion | No documentados en la model card; los pesos se publican en safetensors y el modelo se usa habitualmente en bfloat16/fp16 |
| Idiomas soportados | Inglés (en), con datos de código en el pre-entrenamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch y ONNX |

## Arquitectura y entrenamiento

ModernBERT-large es un transformer encoder-only de 28 capas y 395 millones de parámetros, con atención bidireccional completa entre tokens (a diferencia de los decoders causales). La arquitectura introduce tres cambios clave respecto a BERT clásico: primero, sustituye los embeddings posicionales aprendidos por Rotary Positional Embeddings (RoPE), lo que facilita la generalización a secuencias largas; segundo, emplea atención local-global alterna, combinando capas con atención local (ventanas reducidas) y capas con atención global, lo que reduce el coste computacional sobre entradas de hasta 8.192 tokens; tercero, incorpora unpadding y Flash Attention para evitar cómputo sobre tokens de relleno y acelerar la inferencia en GPU.

El modelo se pre-entrenó sobre 2 billones de tokens de texto en inglés y código, lo que explica su buen comportamiento tanto en tareas de lenguaje como en recuperación de código. No se documenta en la información disponible el uso de RLHF o DPO, algo esperable en un modelo encoder de tipo MLM. La model card indica que ModernBERT no utiliza token type IDs, por lo que el uso posterior al fine-tuning es idéntico al de BERT estándar salvo que se puede omitir el parámetro `token_type_ids`. Se recomienda usarlo con Flash Attention 2 (`pip install flash-attn`) para maximizar la eficiencia.

## Capacidades

- Relleno de máscaras (fill-mask) mediante `AutoModelForMaskedLM` o el pipeline `fill-mask`.
- Generación de embeddings contextuales para clasificación de texto tras fine-tuning.
- Recuperación de información (retrieval) en configuraciones single-vector (estilo DPR) y multi-vector (estilo ColBERT).
- Búsqueda semántica sobre corpus largos gracias a su contexto de 8.192 tokens.
- Recuperación de código e indexación híbrida texto-código, por su entrenamiento con datos de código.
- Comprensión del lenguaje natural (NLU): inferencia textual, análisis de sentimiento, clasificación de temas.
- Preguntas y respuestas extractivas y clasificación de tokens (NER) tras fine-tuning estándar de BERT.
- Idiomas: inglés únicamente; no se declara soporte multilingüe.
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión ni audio: es un encoder, no un modelo generativo ni un agente.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales o repositorios de documentos de hasta 8.192 tokens por fragmento y generar embeddings con los que recuperar pasajes relevantes ante una consulta en lenguaje natural.
- Reranking en pipelines RAG: usar la variante estilo ColBERT de ModernBERT para reordenar los candidatos recuperados por un retriever previo, mejorando la precisión final antes de pasarlos a un modelo generativo.
- Clasificación de tickets de soporte: hacer fine-tuning sobre el encoder para etiquetar automáticamente incidencias por categoría o urgencia, aprovechando la ventana larga para incluir el hilo completo de conversación.
- Recuperación de código en herramientas de desarrollo: indexar un repositorio y permitir búsquedas semánticas de funciones o fragmentos de código (respaldado por los resultados en CodeSearchNet y StackQA), integrándolo en un IDE o en un buscador interno.
- Análisis de contratos y documentos legales: procesar cláusulas o secciones extensas en una sola pasada de 8.192 tokens para extracción de entidades, detección de cláusulas relevantes o clasificación documental.
- Moderación de contenido y filtrado: clasificar textos de entrada (comentarios, publicaciones) por categorías de riesgo tras un fine-tuning supervisado sobre datos etiquetados.
- Sistemas de recomendación basados en contenido: generar embeddings de artículos, productos o descripciones largas y calcular similitud semántica para sugerir elementos relacionados.
- Deduplicación y clustering de textos: obtener representaciones de documentos largos y agruparlos o detectar duplicados a nivel semántico en grandes corpus.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación en GLUE (NLU), BEIR y MLDR (retrieval), y CodeSearchNet (CSN) y StackQA (SQA) para código. La tabla comparativa de los modelos base está disponible completa; la tabla correspondiente a los modelos large aparece truncada en el material proporcionado, por lo que solo se reproduce a continuación la información completa disponible (comparativa de modelos base, con ModernBERT-base como referencia del mismo linaje) y el resumen cualitativo de la variante large.

### Modelos base

| Modelo | IR DPR BEIR | IR DPR MLDR_OOD | IR DPR MLDR_ID | IR ColBERT BEIR | IR ColBERT MLDR_OOD | GLUE | CSN | SQA |
|---|---|---|---|---|---|---|---|---|
| BERT | 38,9 | 23,9 | 32,2 | 49,0 | 28,1 | 84,7 | 41,2 | 59,5 |
| RoBERTa | 37,7 | 22,9 | 32,8 | 48,7 | 28,2 | 86,4 | 44,3 | 59,6 |
| DeBERTaV3 | 20,2 | 5,4 | 13,4 | 47,1 | 21,9 | 88,1 | 17,5 | 18,6 |
| NomicBERT | 41,0 | 26,7 | 30,3 | 49,9 | 61,3 | 84,0 | 41,6 | 61,4 |
| GTE-en-MLM | 41,4 | 34,3 | 44,4 | 48,2 | 69,3 | 85,6 | 44,9 | 71,4 |
| ModernBERT-base | 41,6 | 27,4 | 44,0 | 51,3 | 80,2 | 88,4 | 56,4 | 73,6 |

### Modelos large (datos parciales)

La tabla de modelos large de la model card está incompleta en la información disponible: solo se recogen las filas parciales de BERT y RoBERTa, sin valores completos ni la fila de ModernBERT-large. Los resultados numéricos de ModernBERT-large en GLUE, BEIR, MLDR, CodeSearchNet y StackQA no están disponibles en el material proporcionado. La model card sí afirma cualitativamente que ModernBERT-large queda por detrás de Deberta-v3-large en GLUE y que, como backbone, alcanza resultados de referencia (state of the art) en recuperación de código sobre CodeSearchNet y StackQA.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 1,6 GB en fp32, 0,8 GB en fp16/bfloat16 y alrededor de 0,4 GB en cuantización de 8 bits (cálculo sobre 395,9 M de parámetros).
- VRAM total para inferencia: la huella de pesos es pequeña, pero el coste real depende de la longitud de secuencia y del batch. Con contexto de 8.192 tokens conviene reservar margen adicional para activaciones; una GPU con 8-12 GB es suficiente para uso habitual.
- GPU consumer: cabe sin problema en tarjetas de gama media y alta, como RTX 3060 (12 GB), RTX 4070, RTX 4080 o RTX 4090. También puede ejecutarse en CPU para lotes pequeños.
- GPU de datacenter: A100, H100 o L40S son adecuadas para despliegues de alto throughput con lotes grandes; no se necesitan varias GPU para servir el modelo.
- Formatos de despliegue: `transformers` (v4.48.0 o superior) con `AutoModelForMaskedLM`, exportación ONNX, y Flash Attention 2 si la GPU lo soporta. Para servir embeddings a escala es habitual usar Text Embeddings Inference (TEI).
- Latencia y throughput: no disponibles en la información proporcionada. La model card no publica cifras concretas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GLUE | BEIR (DPR) | MLDR ColBERT OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ModernBERT-large | 395,9 M | 8.192 | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face |
| BERT | No disponible | No disponible | 85,2 | 38,9 | 28,5 | No disponible | Hugging Face |
| RoBERTa | No disponible | No disponible | Parcial en la tabla large | 41,4 | 28,8 | No disponible | Hugging Face |
| DeBERTaV3 | No disponible | No disponible | 88,1 (base) / por detrás en large según la model card | 20,2 (base) | 21,9 (base) | No disponible | Hugging Face |
| GTE-en-MLM | No disponible | No disponible | 85,6 (base) | 41,4 (base) | 69,3 (base) | No disponible | Hugging Face |
| NomicBERT | No disponible | No disponible | 84,0 (base) | 41,0 (base) | 61,3 (base) | No disponible | Hugging Face |

Nota: los valores de parámetros, contexto y licencia de los modelos de comparación no figuran en la información proporcionada, por lo que se marcan como no disponibles. Los valores de benchmark de BERT, RoBERTa, DeBERTaV3, GTE-en-MLM y NomicBERT corresponden a la tabla de modelos base de la model card.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre 2 billones de tokens de texto en inglés extraídos de la web, puede reproducir sesgos sociales, culturales y de género presentes en esos datos. No se documentan evaluaciones específicas de sesgo en la información disponible.
- Alucinación: al ser un modelo encoder de tipo fill-mask y no un generador autoregresivo, no produce texto libre; el riesgo de alucinación se manifiesta como predicciones de máscara incorrectas o representaciones poco fiables en dominios fuera de su distribución de entrenamiento.
- Cobertura de idioma: solo se declara inglés. El uso en castellano u otros idiomas requiere fine-tuning específico y no está respaldado por el autor.
- Longitud de contexto: aunque soporta 8.192 tokens, el rendimiento en secuencias cercanas al límite puede degradarse; la model card apunta a que el contexto largo está pensado para documentos y retrieval, no para conversación multi-turno.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución correspondiente.
- Producción: no es un modelo generativo ni soporta tool calling ni agentes, por lo que no debe plantearse como sustituto de un LLM en esos escenarios. Requiere fine-tuning para cada tarea downstream; el modelo publicado es un MLM pre-entrenado, no una solución lista para producción.
- Repositorio: el tamaño del repo (12,6 GB) indica que incluye varias copias de los pesos (safetensors, PyTorch y ONNX); conviene descargar solo el formato necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/answerdotai/ModernBERT-large
- Modelo base de la familia: https://huggingface.co/answerdotai/ModernBERT-base
- Blog de presentación: https://huggingface.co/blog/modernbert
- Pre-print en arXiv: https://arxiv.org/abs/2412.13663
- Answer.AI: https://answer.ai
- LightOn: https://lighton.ai
