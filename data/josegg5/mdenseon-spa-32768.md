# josegg5/mDenseOn-spa-32768

## Resumen

mDenseOn-spa-32768 es un modelo de embeddings de frases (sentence-similarity) derivado de lightonai/mDenseOn, adaptado al castellano mediante una reducción de vocabulario supervisada por frecuencia de tokens. Lo publica el usuario josegg5 en Hugging Face bajo licencia Apache 2.0 y está pensado para tareas de recuperación de información y similitud semántica en español. La operación principal no es un reentrenamiento, sino un trimming del vocabulario original (de 256.000 a 32.768 tokens) con copia directa de los embeddings retenidos; el backbone transformer permanece intacto.

El modelo conserva la arquitectura ModernBERT del original, con 135.497.472 parámetros totales frente a los 306.939.648 del modelo base, lo que supone una reducción del 55,86 % en parámetros y del 55,85 % en tamaño de pesos (de 1.227,77 MB a 542,00 MB en FP32). El repositorio ocupa 0,5 GB y se distribuye en formato safetensors, listo para su uso con sentence-transformers y text-embeddings-inference.

Su relevancia radica en que permite desplegar un encoder de recuperación en español con la mitad de huella de memoria y disco que el modelo multilingüe original, a cambio de una pérdida medible de calidad en recuperación (entre 1,34 y 5,37 puntos de nDCG@10 según la tarea). Es una pieza útil para pipelines RAG y búsqueda semántica en castellano donde el coste de almacenamiento e inferencia importa más que exprimir el último punto de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, base de lightonai/mDenseOn) |
| Parametros totales | 135.497.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (por el identificador del modelo); evaluación realizada a 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo hereda el backbone ModernBERT de lightonai/mDenseOn, un encoder transformerbidireccional optimizado para frases y documentos. La modificación aplicada consiste en un trimming de vocabulario: se calcularon frecuencias de tokens sobre el split español de lbourdois/fineweb-2-trimming, se preservaron los tokens especiales y los necesarios para los mecanismos de representación de bytes del tokenizador, y se seleccionaron tokens por frecuencia incluyendo sus dependencias BPE hasta ajustar el presupuesto de 32.768 tokens. Posteriormente se reconstruyeron el vocabulario y las fusiones BPE con IDs contiguos y se copiaron los embeddings originales de los tokens retenidos a sus nuevas posiciones.

No se realizó entrenamiento adicional: todos los pesos del backbone y los embeddings retenidos son los del modelo original. La reducción de vocabulario (87,20 %) es la fuente principal del ahorro de parámetros, ya que la matriz de embeddings del tokenizador multilingüe original era desproporcionada para un uso monolingüe en español. El modelo emplea los prompts `query` y `document` del original y produce embeddings normalizados para similitud por coseno.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica y recuperación densa.
- Búsqueda semántica monolingüe en español (query-to-passage retrieval).
- Codificación de consultas y documentos con prompts diferenciados (`query` / `document`).
- Embeddings normalizados aptos para similitud por coseno e indexación en bases vectoriales.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- Soporte de secuencias largas (hasta 32.768 tokens según el identificador; evaluación a 1.024 tokens).
- No soporta tool calling, function calling, agentes ni generación de texto: es un encoder, no un modelo generativo.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Búsqueda semántica en corpus en español: indexar pasajes con el prompt `document` y consultar con el prompt `query`, aprovechando la ventana de contexto para fragmentos largos en bases vectoriales como FAISS, Qdrant o pgvector.
- Pipelines RAG sobre documentación técnica o bases de conocimiento en castellano: el modelo actúa como retriever denso con una huella de 542 MB en FP32, adecuada para desplegar junto a un LLM generativo en la misma GPU.
- Deduplicación y clustering de textos en español: calcular embeddings normalizados y agrupar por similitud por coseno para eliminar duplicados en datasets o catálogos.
- Recuperación en dominio legal: los resultados en MuPLeR-retrieval-es (nDCG@10 de 0,8817) lo hacen viable para búsqueda sobre legislación de la UE en español, con la advertencia de la pérdida de 2,19 puntos frente al original.
- Clasificación y enrutamiento semántico de tickets o consultas: usar el embedding como característica para un clasificador ligero o para redirigir consultas a la cola adecuada.
- Sistemas de recomendación basados en contenido: comparar descripciones de productos o artículos mediante similitud de embeddings en español.
- Despliegue en hardware modesto: su tamaño reducido permite servir el modelo en GPUs de consumo (por ejemplo, una RTX 3060 Laptop, usada en la evaluación del autor) para prototipos y entornos de desarrollo.

## Benchmarks y rendimiento

Resultados de recuperación publicados por el autor, comparando el modelo original y el trimmed. Escala 0-1; delta = trimmed - original.

| Tarea | Metrica | Original | Trimmed | Delta |
|---|---|---:|---:|---:|
| MIRACL-es (corpus reducido, 6.410 pasajes) | nDCG@10 | 0,8473 | 0,7937 | -0,0537 |
| MIRACL-es (corpus reducido) | MRR@10 | 0,8622 | 0,8087 | -0,0534 |
| MIRACL-es (corpus reducido) | Recall@10 | 0,9631 | 0,9245 | -0,0386 |
| XQuADRetrieval-es (tarea completa, 240 pasajes) | nDCG@10 | 0,9776 | 0,9642 | -0,0134 |
| XQuADRetrieval-es | MRR@10 | 0,9704 | 0,9537 | -0,0168 |
| XQuADRetrieval-es | Recall@10 | 0,9992 | 0,9958 | -0,0034 |
| MuPLeR-retrieval-es (10.000 pasajes legales) | nDCG@10 | 0,9035 | 0,8817 | -0,0219 |
| MuPLeR-retrieval-es | MRR@10 | 0,8815 | 0,8525 | -0,0290 |
| MuPLeR-retrieval-es | Recall@10 | 0,9700 | 0,9700 | 0,0000 |

Condiciones de evaluación: longitud máxima de secuencia de 1.024 tokens, batch de 4, embeddings normalizados, similitud por coseno, inferencia en NVIDIA GeForce RTX 3060 Laptop GPU. El resultado de MIRACL-es corresponde a un corpus reducido compartido y no es comparable con el leaderboard de corpus completo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,55 GB en FP32 para los pesos (542 MB) más overhead de activaciones; en la práctica cabe holgadamente en GPUs con 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor evaluó en una RTX 3060 Laptop. Para servir a escala, A10G, L4 o A100 son opciones razonables por throughput, aunque el modelo es pequeño.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (tag `text-embeddings-inference` en el repo), endpoints compatibles; al ser un encoder ModernBERT, también puede exportarse a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, la longitud de secuencia y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---:|---|---|---|---|
| josegg5/mDenseOn-spa-32768 | 135,5 M | 32.768 | es | Apache 2.0 | Trimming del vocabulario; sin reentrenamiento |
| lightonai/mDenseOn (base) | 306,9 M | no disponible | multilingüe | no disponible en la información | Modelo original; mejor nDCG@10 en las tres tareas evaluadas |
| Otros encoders de recuperación en español | no disponible | no disponible | es | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación directa más fiable es contra su propio modelo base: el trimmed reduce parámetros un 55,86 % y tamaño de pesos un 55,85 %, a costa de 1,34-5,37 puntos de nDCG@10 según la tarea. No se han proporcionado comparaciones con otros encoders de la misma categoría (por ejemplo, modelos de la familia E5 o BGE en español), por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Pérdida de calidad medible: nDCG@10 cae en las tres tareas evaluadas (hasta 5,37 puntos en MIRACL-es con corpus reducido). No se debe asumir equivalencia con el modelo original.
- El trimming se basó en frecuencias de tokens del split español de fineweb-2-trimming; dominios con vocabulario muy distinto (jerga técnica, código, nombres propios) pueden sufrir más fragmentación de tokens y peor rendimiento.
- Modelo monolingüe en español: no está pensado para consultas o documentos en otros idiomas.
- Es un encoder de embeddings, no un modelo generativo: no responde preguntas ni genera texto; alucinaciones no aplicables en el sentido generativo, pero sí puede producir recuperaciones irrelevantes.
- La evaluación se realizó a 1.024 tokens pese al identificador de 32.768; el rendimiento con secuencias mucho más largas no está validado en la información disponible.
- Los resultados de MIRACL-es corresponden a un corpus reducido y no son comparables con el leaderboard oficial de corpus completo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base lightonai/mDenseOn, cuya licencia no se detalla en la información proporcionada.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al heredar los pesos del modelo multilingüe original, podría arrastrar sesgos de sus datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josegg5/mDenseOn-spa-32768
- Modelo base: https://huggingface.co/lightonai/mDenseOn
- Blog de inspiración sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de frecuencias: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Dataset MIRACL: https://huggingface.co/datasets/miracl/miracl
- Dataset XQuADRetrieval: https://huggingface.co/datasets/mteb/XQuADRetrieval
- Dataset MuPLeR-retrieval: https://huggingface.co/datasets/mteb/MuPLeR-retrieval
