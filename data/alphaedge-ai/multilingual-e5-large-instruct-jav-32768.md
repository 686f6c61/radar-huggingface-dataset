# alphaedge-ai/multilingual-e5-large-instruct-jav-32768

## Resumen

`multilingual-e5-large-instruct-jav-32768` es un modelo de embeddings de frases derivado de `intfloat/multilingual-e5-large-instruct` mediante la técnica de *trimming* de vocabulario, especializado en javanés (`jv`). Lo publica el usuario `alphaedge-ai` y reduce el vocabulario original de 250.037 tokens a 32.768, lo que recorta el número de parámetros un 39,73% (de 559.890.432 a 337.442.816) y disminuye de forma proporcional la huella de memoria del modelo.

El modelo conserva la arquitectura y los pesos del backbone XLM-RoBERTa del E5 original, pero elimina del vocabulario los tokens poco frecuentes en javanés, identificados mediante minería sobre 172.668 textos del dataset `lbourdois/fineweb-2-trimming`. El resultado es un encoder de 337 millones de parámetros, con salida de embeddings de 1024 dimensiones, pensado para búsqueda semántica, recuperación y clustering en javanés con un coste de despliegue notablemente menor.

Es relevante para equipos que necesitan un modelo de embeddings multilingüe de calidad contrastada (la familia E5) pero limitado a un único idioma de destino: el recorte de vocabulario abarata el almacenamiento de la matriz de embeddings y acelera la tokenización, a cambio de perder competencia en el resto de idiomas. La licencia MIT facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de E5) |
| Parametros totales | 337.442.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base E5 soporta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantizacion estandar via sentence-transformers/optimum) |
| Idiomas soportados | javanes (`jv`); el resto de idiomas del modelo base pierden cobertura por el recorte de vocabulario |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `sentence-transformers`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, la misma arquitectura que el E5 multilingüe original de Microsoft. No se ha reentrenado: el autor aplica *trimming* de vocabulario, es decir, selecciona los 32.768 tokens más relevantes para javanés a partir de la minería sobre 172.668 textos de `lbourdois/fineweb-2-trimming` y recorta la matriz de embeddings de entrada y la capa de salida en consecuencia. El resto de capas del transformer se mantienen intactas, de ahí que el modelo "debería comportarse de forma similar al original" según la model card, siempre que el texto esté en javanés.

El modelo base E5 fue entrenado con objetivos de contraste (texto-emparejamiento débilmente supervisado más ajuste fino supervisado) y admite el prefijo `query:`/`passage:` para distinguir consultas de documentos; la API de `sentence-transformers` expone `encode_query` y `encode_document` para gestionar esa distinción. No se documenta en la información disponible ningún ajuste adicional específico para javanés más allá del recorte de vocabulario, ni datos sobre número de tokens de entrenamiento, RLHF o DPO.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información (`pipeline: sentence-similarity`).
- Codificación diferenciada de consultas y documentos mediante `encode_query` / `encode_document`.
- Búsqueda semántica y *dense retrieval* en javanés.
- Clustering y deduplicación de textos en javanés.
- Clasificación de textos por similitud (zero-shot con prototipos de embedding).
- Soporte de *tool calling* / *function calling*: no aplica (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: degradadas fuera del javanés por el recorte de vocabulario.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica en corpus javaneses: indexar documentos con `encode_document` y consultar con `encode_query`; el recorte de vocabulario reduce el tamaño del índice y el coste de almacenamiento de vectores.
- Motor de recuperación para RAG en javanés: usar el modelo como *retriever* en un pipeline de generación aumentada, emparejándolo con un LLM que sí genere texto en javanés.
- Deduplicación de datasets: calcular similitudes entre embeddings de 1024 dimensiones para detectar documentos casi idénticos en corpus de *fineweb* javanés.
- Clasificación temática zero-shot: comparar embeddings de documentos contra embeddings de etiquetas o frases prototipo para categorizar noticias o artículos sin entrenamiento supervisado.
- Moderación y filtrado de contenido: agrupar y detectar textos similares a patrones conocidos mediante similitud coseno.
- Sistemas de recomendación de contenido textual: representar artículos o publicaciones en javanés y recomendar por cercanía semántica.
- Búsqueda interna en aplicaciones locales: al ser un modelo de 337 M de parámetros (repo de 0,7 GB), puede desplegarse en servidores modestos o incluso en CPU para cargas moderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma cualitativamente que el modelo recortado "debería rendir de forma similar al original" en javanés, sin cifras de MMLU, MTEB ni métricas de recuperación.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 1,35 GB solo para pesos (337 M × 4 bytes), más activaciones y overhead de tokenización.
- VRAM estimada en FP16/BF16: aproximadamente 0,67 GB para pesos.
- VRAM estimada en INT8: aproximadamente 0,34 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son sobradas para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante con FP16) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `sentence-transformers` (referencia), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` en el repo), `optimum` para exportación a ONNX, y servidores compatibles con *endpoints* de Hugging Face (`endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada; al tener un vocabulario de 32.768 tokens, la tokenización es más rápida que en el modelo original de 250.037 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `alphaedge-ai/multilingual-e5-large-instruct-jav-32768` | 337.442.816 | no disponible | `jv` | MIT | Version recortada, 0,7 GB de repo |
| `intfloat/multilingual-e5-large-instruct` (base) | 559.890.432 | no disponible | multilingue (amplio) | MIT | Modelo original; mayor cobertura idiomatica y mayor huella |
| `intfloat/multilingual-e5-large` | no disponible | no disponible | multilingue | MIT | Variante sin instrucciones del mismo backbone |
| `intfloat/multilingual-e5-base` | no disponible | no disponible | multilingue | MIT | Version mas pequena de la familia E5 |

La comparación directa con alternativas específicas para javanés no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no frecuentes en javanés: el modelo puede degradarse gravemente en otros idiomas, incluidos idiomas con alfabetos distintos al latino.
- No se han publicado evaluaciones cuantitativas del impacto del recorte en la calidad de los embeddings; la afirmación de "rendimiento similar" es del autor y no está verificada con benchmarks.
- Riesgo de sesgo heredado del corpus de minería (`lbourdois/fineweb-2-trimming`) y del modelo base E5: la selección de tokens puede sobrerrepresentar registros web y dominios concretos.
- Al ser un modelo de embeddings, no genera texto: no es adecuado para tareas generativas, razonamiento ni *tool calling*.
- La longitud máxima de contexto no se documenta en la información disponible; conviene verificar el límite del tokenizador recortado antes de indexar documentos largos.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y las citas del modelo base y del blog de *trimming*.
- El repo tiene muy pocas descargas (43) y ningún *like*: no hay evidencia de comunidad ni validación externa de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-jav-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Multilingual E5: https://arxiv.org/abs/2402.05672
