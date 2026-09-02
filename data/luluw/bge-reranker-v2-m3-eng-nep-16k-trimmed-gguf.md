# luluw/bge-reranker-v2-m3-eng-nep-16k-trimmed-GGUF

## Resumen

`bge-reranker-v2-m3-eng-nep-16k-trimmed-GGUF` es una conversión a formato GGUF de una versión recortada de vocabulario del modelo de reranking `BAAI/bge-reranker-v2-m3`, desarrollada por el usuario de Hugging Face `luluw`. El modelo original es un cross-encoder basado en la arquitectura XLM-RoBERTa que, dado un par consulta-pasaje, devuelve un logit de relevancia. La versión recortada reduce el vocabulario multilingüe original de 250 002 tokens a 16 384, optimizado específicamente para inglés y nepalí, sin realizar ningún fine-tuning adicional: solo se reconstruye la matriz de embeddings copiando las filas correspondientes a los tokens conservados. El resultado es un modelo un 42,1 % más pequeño en parámetros (328,5 millones frente a 567,8 millones) y con archivos GGUF que van desde ~644 MB en FP16 hasta ~225 MB en cuantización Q4_K_M.

Esta versión es relevante para desarrolladores que necesitan un reranker ligero y eficiente para pipelines de retrieval aumentado (RAG) o búsqueda semántica en inglés y nepalí, con un footprint de memoria reducido y compatible con backends como `llama.cpp`. Al mantener la misma arquitectura y cabecera de clasificación que el modelo base, conserva la capacidad de producir puntuaciones de relevancia fiables, aunque con un vocabulario limitado que puede afectar a términos muy específicos o poco frecuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (cross-encoder / sequence classification) |
| Parametros totales | 328 528 897 (según safetensors) / 328 530 945 (según tabla del autor) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8 194 posiciones máximas (config `max_position_embeddings`) |
| Tipos de cuantizacion | FP16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M (archivos GGUF) |
| Idiomas soportados | Inglés (en), nepalí (ne) |
| Licencia | MIT (según model card del autor) / Apache-2.0 (según metadatos de Hugging Face) |
| Formato de pesos | GGUF (también safetensors para el modelo recortado original) |

## Arquitectura y entrenamiento

El modelo base `BAAI/bge-reranker-v2-m3` es un cross-encoder basado en XLM-RoBERTa, diseñado para tareas de reranking: recibe un par `(query, passage)` codificado como `<s> query </s></s> passage </s>` y produce un único logit de relevancia. La versión recortada mantiene intacta la arquitectura y la cabecera de clasificación, pero reduce el vocabulario de 250 002 a 16 384 tokens. El proceso de recorte se realizó contando frecuencias de tokens en texto real en inglés y nepalí (dataset `lbourdois/fineweb-2-trimming`), conservando siempre los tokens especiales y los primeros 1 000 IDs originales, y rellenando el presupuesto restante con los tokens más frecuentes de cada idioma con una ponderación 50/50. La matriz de embeddings de entrada se reconstruyó copiando las filas originales para los tokens conservados, y se proporciona un mapeo `old_id → new_id` (`vocab_mapping.json`) para poder seguir usando el tokenizador XLM-R original. No se realizó ningún entrenamiento adicional, por lo que el modelo conserva las capacidades de reranking del original, pero con un vocabulario restringido.

## Capacidades

- Reranking de pares consulta-pasaje: devuelve un logit de relevancia (aplicar sigmoid para obtener una puntuación 0-1).
- Compatible con pipelines de retrieval en dos etapas: recuperación inicial con embeddings y reranking con este cross-encoder.
- Soporte multilingüe limitado a inglés y nepalí, con vocabulario optimizado para estos idiomas.
- No incluye tool calling, generación de texto ni capacidades de agente; es un modelo de clasificación de secuencias puro.
- Integrable en backends que soporten modelos XLM-RoBERTa / cross-encoder en formato GGUF, como `llama.cpp` y compatibles.

## Casos de uso

- **Búsqueda semántica en inglés y nepalí**: el modelo puede reordenar los resultados de un sistema de recuperación basado en embeddings, mejorando la precisión de la búsqueda en documentos en estos idiomas.
- **Retrieval aumentado (RAG) para asistentes virtuales**: en un pipeline RAG, se usa como reranker tras una primera fase de recuperación para seleccionar los pasajes más relevantes antes de pasarlos al generador.
- **Sistemas de preguntas y respuestas sobre documentación técnica**: dado un corpus de manuales o guías en inglés o nepalí, el modelo filtra los pasajes más pertinentes para responder consultas específicas.
- **Filtrado de candidatos en motores de recomendación**: puede puntuar la relevancia de ítems (descripciones, títulos) frente a una consulta del usuario, mejorando la personalización.
- **Moderación de contenido**: adaptando el par consulta-pasaje, puede clasificar si un texto es relevante para una categoría determinada (por ejemplo, contenido inapropiado) en los idiomas soportados.
- **Optimización de costes en producción**: al ser un modelo ligero (328M parámetros) y con cuantizaciones pequeñas, es adecuado para entornos con recursos limitados, como edge devices o servidores con GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión recortada en la información disponible. El modelo base `BAAI/bge-reranker-v2-m3` tiene resultados documentados en tareas de reranking multilingüe, pero no se dispone de datos comparativos para la versión con vocabulario recortado. Se recomienda evaluar el modelo en el dominio objetivo antes de desplegarlo en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: según el archivo GGUF elegido, se necesita aproximadamente:
  - FP16 (~644 MB): ~1,5 GB VRAM (considerando overhead).
  - Q8_0 (~358 MB): ~1 GB VRAM.
  - Q4_K_M (~225 MB): ~0,7 GB VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o superiores). Para FP16 se recomienda al menos 2 GB.
- **Compatibilidad con consumer GPUs**: sí, cabe en GPUs de gama baja y media, así como en Apple Silicon (vía Metal) y CPUs con suficiente RAM.
- **Opciones de despliegue**: `llama.cpp` (o backends compatibles con GGUF y arquitectura XLM-RoBERTa), también se puede usar con `sentence-transformers` si se carga el modelo safetensors original recortado.
- **Latencia y throughput**: no disponible en la información proporcionada; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `luluw/bge-reranker-v2-m3-eng-nep-16k-trimmed-GGUF` | 328,5 M | 16 384 | 8 194 | MIT / Apache-2.0 | GGUF |
| `BAAI/bge-reranker-v2-m3` (original) | 567,8 M | 250 002 | 8 194 | MIT | safetensors, etc. |
| `gpustack/bge-reranker-v2-m3-GGUF` | 567,8 M | 250 002 | 8 194 | MIT | GGUF |

La versión recortada es un 42 % más pequeña que el original, con un vocabulario limitado a inglés y nepalí, lo que reduce el uso de memoria y acelera la inferencia, pero puede degradar el rendimiento en otros idiomas o dominios con terminología especializada. El modelo original mantiene cobertura multilingüe completa.

## Limitaciones y advertencias

- **Vocabulario restringido**: tokens raros o específicos de dominio pueden mapearse a `<unk>`, lo que puede afectar a la calidad del reranking en textos técnicos o coloquiales fuera del vocabulario recortado.
- **Requisito de mapeo de tokens**: es obligatorio aplicar el mapeo `old_to_new` proporcionado al usar el tokenizador original; no se deben alimentar IDs crudos del tokenizador XLM-R directamente al modelo recortado.
- **Sin fine-tuning adicional**: el recorte se realizó sin entrenamiento, por lo que no se ha optimizado el modelo para dominios concretos; puede haber una ligera pérdida de rendimiento frente al original en tareas multilingües.
- **Idiomas limitados**: solo inglés y nepalí; no es adecuado para otros idiomas.
- **Licencia**: la model card indica MIT, pero los metadatos de Hugging Face muestran Apache-2.0; se recomienda verificar la licencia aplicable antes de uso comercial.
- **Riesgo de alucinación**: al ser un modelo de clasificación, no genera texto, por lo que el riesgo de alucinación es nulo; sin embargo, las puntuaciones de relevancia pueden ser incorrectas si el vocabulario no cubre los términos de la consulta.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/luluw/bge-reranker-v2-m3-eng-nep-16k-trimmed-GGUF)
- [Modelo recortado original (safetensors)](https://huggingface.co/luluw/bge-reranker-v2-m3-eng-nep-16k-trimmed)
- [Modelo base BAAI/bge-reranker-v2-m3](https://huggingface.co/BAAI/bge-reranker-v2-m3)
- [Conversión GGUF de gpustack del modelo base](https://huggingface.co/gpustack/bge-reranker-v2-m3-GGUF)
- [Página oficial de BGE](https://bge.baai.ac.cn/)
- [Paper BGE M3-Embedding (arXiv:2402.03216)](https://arxiv.org/abs/2402.03216)
