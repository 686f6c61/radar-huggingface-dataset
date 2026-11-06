# hindsight-ai/hs-rerank-1

## Resumen

hs-rerank-1 es un reranker multilingüe de tipo cross-encoder desarrollado por Hindsight AI (equipo detrás del proyecto open source Hindsight, de Vectorize). El modelo recibe un par consulta-documento y devuelve una puntuación de relevancia entre 0 y 1, lo que lo sitúa en la fase de reordenación de un pipeline RAG clásico: tras una recuperación inicial por embeddings, el cross-encoder refina el orden de los candidatos.

El modelo parte de `jhu-clsp/mmBERT-small`, un encoder multilingüe de la familia ModernBERT, y se ha afinado como cross-encoder para ranking. Con 113,8 millones de parámetros totales, la mayor parte (98 M) corresponde a la tabla de embeddings de tokens, de modo que cada pasada forward ejecuta un transformer de aproximadamente 15 M de parámetros. Esto lo hace muy ligero en cómputo, aunque el coste dominante sea la matriz de embeddings.

Su relevancia actual reside en tres factores: soporte de hasta 8.192 tokens por par consulta-documento, cobertura de ocho idiomas (incluido el español) y distribución en formatos prácticos para producción (safetensors en FP16 para GPU y exportación ONNX con tabla de vocabulario int8 para CPU). La licencia MIT y la compatibilidad con Text Embeddings Inference facilitan su despliegue sin fricción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre encoder transformer (ModernBERT, base `jhu-clsp/mmBERT-small`) |
| Parámetros totales | 113.794.177 (114 M); ~15 M en el transformer, ~98 M en la tabla de embeddings |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por par consulta-documento |
| Tipos de cuantización | FP16 (safetensors por defecto), FP32 (rama `fp32`), int8 (exportación ONNX con tabla de vocabulario int8) |
| Idiomas soportados | en, es, fr, de, pt, ja, ko, zh (chino simplificado y tradicional) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, copia FP32 en rama `fp32`), ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

hs-rerank-1 es un cross-encoder: la consulta y el documento se concatenan en una única secuencia que se pasa por el encoder, y la cabeza de clasificación produce una puntuación de relevancia. La base es `jhu-clsp/mmBERT-small`, un modelo de la familia ModernBERT orientado a multilingüismo y contextos largos. El modelo card no detalla la composición del dataset de afinamiento, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación práctica más destacable es la distribución dual: safetensors en FP16 para inferencia en GPU y una exportación ONNX con tabla de vocabulario en int8 para CPU, lo que permite servir el modelo tanto en hardware especializado como en servidores sin GPU. La asimetría de parámetros (98 M en embeddings frente a 15 M en el transformer) implica que el coste de inferencia está dominado por la proyección de embeddings y no por el cómputo del transformer, algo relevante para estimar throughput.

## Capacidades

- Reordenación de documentos: asigna una puntuación de relevancia (0-1) a cada par consulta-documento, con `predict` y `rank` en Sentence Transformers.
- Multilingüe: cubre inglés, español, francés, alemán, portugués, japonés, coreano y chino (simplificado y tradicional).
- Entradas largas: hasta 8.192 tokens por par, adecuado para documentos extensos o fragmentos con mucho contexto.
- Integración con pipelines RAG: pensado para la fase de reranking tras una recuperación vectorial inicial.
- Despliegue en CPU y GPU: exportación ONNX int8 para CPU y safetensors FP16 para GPU.
- Compatibilidad con Text Embeddings Inference (TEI): imágenes CPU y GPU, con endpoint `/rerank`.
- Integración nativa con Hindsight: proveedor local, TEI o el servicio alojado de Hindsight Inference.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio; es un modelo exclusivamente de ranking.

## Casos de uso

- Reordenación en pipelines RAG: tras recuperar los N candidatos más similares por embeddings, hs-rerank-1 refina el orden con una puntuación de relevancia real, mejorando la calidad del contexto que se pasa al LLM generador.
- Búsqueda semántica multilingüe: al cubrir ocho idiomas, permite consultar en español documentos indexados en inglés o viceversa, útil en bases de conocimiento corporativas plurilingües.
- Atención al cliente automatizada: el modelo puede priorizar los fragmentos de documentación o FAQs más relevantes para cada consulta del usuario antes de que el sistema genere la respuesta.
- Reranking de memoria en agentes: Hindsight lo usa para seleccionar los recuerdos más pertinentes de la memoria de un agente antes de inyectarlos en el contexto, con soporte de pares de hasta 8.192 tokens.
- Búsqueda en documentación técnica larga: gracias a su ventana de 8.192 tokens, puede puntuar fragmentos extensos o secciones completas sin truncar agresivamente.
- Despliegue en entornos sin GPU: la exportación ONNX int8 permite servir el reranker en CPU con TEI, adecuado para entornos de desarrollo, edge o infraestructura de bajo coste.
- Filtrado de resultados en motores de búsqueda internos: como segunda etapa de ranking sobre los resultados de un buscador léxico o vectorial, para mejorar la precisión de la primera página.

## Benchmarks y rendimiento

El model card incluye una imagen de benchmarks (`assets/benchmarks.png`) pero no presenta los valores numéricos en texto. No se han publicado resultados de benchmarks en la información disponible en formato tabular, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada: el modelo en FP16 ocupa aproximadamente 0,23 GB de pesos (114 M parámetros × 2 bytes); en la práctica, el consumo total con overhead de runtime se sitúa en torno a 1-2 GB en GPU.
- GPU recomendadas: el model card menciona explícitamente L4 y otras GPU Ada (imagen TEI `89-1.9.3`) y A100/H100 (imagen TEI `1.9.3`).
- GPU de consumo: por tamaño (114 M de parámetros), cabe holgadamente en cualquier GPU consumer con suficiente VRAM para el runtime; no se especifican modelos concretos en la documentación.
- Despliegue: Text Embeddings Inference (imágenes CPU y GPU), Sentence Transformers (`CrossEncoder`), ONNX Runtime para CPU, y el servicio alojado de Hindsight Inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| hs-rerank-1 | 114 M | 8.192 | 8 | MIT | Cross-encoder sobre mmBERT-small; ONNX int8 para CPU |
| BAAI/bge-reranker-v2-m3 | no disponible en la información | no disponible | multilingüe | no disponible | Reranker multilingüe de referencia; datos no verificados en esta ficha |
| jina-reranker-v2-base-multilingual | no disponible en la información | no disponible | multilingüe | no disponible | Alternativa multilingüe; datos no verificados en esta ficha |

No se dispone de datos de benchmarks del modelo ni de comparativas numéricas verificadas con alternativas en la información proporcionada; la tabla anterior solo refleja lo documentado para hs-rerank-1 y deja el resto como no disponible.

## Limitaciones y advertencias

- Modelo exclusivamente de ranking: no genera texto ni soporta tool calling, agentes, visión o audio.
- Sesgos: no se documentan análisis de sesgo en el model card; al derivar de un corpus multilingüe general, puede heredar sesgos de la base mmBERT-small.
- Alucinación: al ser un cross-encoder que produce una puntuación, no genera contenido, pero una calibración imperfecta de las puntuaciones puede producir falsos positivos de relevancia.
- Contexto: el límite es de 8.192 tokens por par; pares más largos requieren truncado.
- Idiomas: aunque cubre ocho idiomas, no se documenta el rendimiento por idioma; el español está soportado pero sin métricas específicas publicadas.
- Licencia: MIT, lo que permite uso comercial sin restricciones adicionales documentadas.
- Madurez: el modelo tiene muy pocas descargas (29) y ningún like en el momento de la consulta, lo que sugiere validación comunitaria limitada; conviene evaluarlo en el dominio propio antes de producción.
- Los benchmarks solo están disponibles como imagen, sin valores numéricos reproducibles en el model card.

## Enlaces

- Hugging Face: https://huggingface.co/hindsight-ai/hs-rerank-1
- Repositorio Hindsight: https://github.com/vectorize-io/hindsight
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Servicio de inferencia Hindsight: https://inference.hindsight.vectorize.io
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
