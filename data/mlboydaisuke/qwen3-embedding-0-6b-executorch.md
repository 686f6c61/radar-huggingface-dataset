# mlboydaisuke/Qwen3-Embedding-0.6B-ExecuTorch

## Resumen

El modelo `mlboydaisuke/Qwen3-Embedding-0.6B-ExecuTorch` es una conversión del modelo de embeddings Qwen3-Embedding-0.6B de Alibaba al formato ExecuTorch, pensada para ejecución en dispositivos (on-device). Se trata de un modelo de tipo decoder causal (a diferencia de la mayoría de los modelos de embeddings, que son encoders) que produce un vector denso de 1024 dimensiones a partir de un texto de entrada. La conversión incluye el pooling de último token y la normalización L2 dentro del propio grafo, lo que simplifica su uso en producción.

El modelo base, Qwen/Qwen3-Embedding-0.6B, tiene 595,8 millones de parámetros, 28 capas, un tamaño oculto de 1024 y un vocabulario de 151669 tokens. Esta versión ExecuTorch está disponible en tres variantes: XNNPACK fp32, XNNPACK fp16 y Core ML fp32, con tamaños de archivo de 2383,7 MB, 1192,5 MB y 1194,9 MB respectivamente. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que ofrece una alternativa de embeddings multilingües de alta calidad con un tamaño relativamente pequeño, optimizada para despliegue en entornos con recursos limitados, como móviles o edge. Su naturaleza de decoder y su pooling específico lo diferencian de otros modelos de la misma categoría, y la verificación incluida en la model card demuestra que las versiones exportadas mantienen una fidelidad casi perfecta frente al modelo eager.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen3), 28 capas, hidden 1024, vocabulario 151669 |
| Parametros totales | 595,8 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens (entrada fija en esta implementación) |
| Tipos de cuantizacion | XNNPACK fp32, XNNPACK fp16, Core ML fp32 (int8 evaluado pero no publicado) |
| Idiomas soportados | No disponible (el modelo base Qwen3-Embedding-0.6B es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pte (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal, una arquitectura poco habitual para embeddings, que suelen usar encoders. Esto implica que cada posición solo atiende a las anteriores, y por tanto el último token real de la secuencia es el único que ha visto todo el contexto. El pooling se realiza tomando el estado oculto del último token no padding, localizado a partir de la máscara de atención, y se aplica normalización L2 dentro del grafo. Esta implementación maneja correctamente tanto padding por la izquierda como por la derecha, algo que la implementación de referencia de Qwen no lograba de forma robusta.

No se proporcionan detalles sobre el entrenamiento del modelo base en la información disponible. Se sabe que Qwen3-Embedding-0.6B es un modelo de embeddings diseñado para tareas de recuperación y ranking, entrenado sobre datos multilingües, pero no se especifican el número de tokens, la composición del dataset ni si se usaron técnicas como RLHF o DPO. La model card de esta conversión se centra en la verificación de la fidelidad de la exportación, no en el entrenamiento original.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para texto, con normalización L2 integrada.
- Similitud de frases y recuperación semántica (retrieval) mediante similitud coseno.
- Soporte multilingüe (heredado del modelo base, aunque no se detallan los idiomas concretos).
- Manejo robusto de padding por ambos lados, con verificación de que el desplazamiento de RoPE no afecta al resultado.
- Distinción clara entre consultas y documentos mediante un prefijo de instrucción asimétrico: las consultas llevan una instrucción de tarea, los documentos no.
- Ejecución eficiente en dispositivos gracias a ExecuTorch, con delegación completa a Core ML en la variante correspondiente.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: el modelo puede indexar documentos y consultas en el dispositivo, generando vectores que se comparan por similitud coseno. Su tamaño reducido (fp16 ~1,2 GB) permite cargarlo en memoria en teléfonos de gama media.
- Recuperación de pasajes multilingüe: gracias a su naturaleza multilingüe, puede utilizarse para buscar información en varios idiomas sin necesidad de modelos separados. El prefijo de instrucción para consultas está diseñado para búsqueda web.
- Deduplicación de documentos: al generar embeddings de párrafos o artículos, se pueden agrupar por similitud para detectar contenido duplicado o casi duplicado en grandes corpus.
- Clasificación de texto por similitud: se puede usar como capa de representación para clasificar textos en categorías predefinidas comparando con embeddings de referencia.
- Sistemas de recomendación basados en contenido: representar ítems (productos, artículos, vídeos) como vectores y recomendar elementos similares según la distancia coseno.
- Filtrado y moderación de contenido: comparar textos con ejemplos etiquetados para detectar spam, toxicidad o temas no deseados, aprovechando la separación clara entre vectores relacionados y no relacionados (0,596 vs 0,123 en el mismo idioma).

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar como MMLU o HumanEval, pero sí una verificación de fidelidad de la exportación frente al modelo eager. Los resultados se resumen en la siguiente tabla:

| Build | Tamaño (MB) | Latencia Mac arm64 (ms, mediana) | Peor coseno vs eager | Presupuesto de recuperación gastado |
|---|---|---|---|---|
| XNNPACK fp32 | 2383,7 | 203,9 | 1,000000 | 0% |
| XNNPACK fp16 | 1192,5 | 537,9 | 0,999998 | 2% |
| Core ML fp32 | 1194,9 | 30,4 | 0,999957 | 17% |

Además, se reportan similitudes coseno para pares de frases con el mismo significado y sin relación:

- Mismo idioma: 0,596 (mismo significado) vs 0,123 (no relacionado)
- Entre idiomas: 0,521 (mismo significado) vs 0,157 (no relacionado)

Estos valores muestran una separación mucho mayor que la de los modelos E5 comparados, lo que facilita el establecimiento de umbrales de decisión.

## Requisitos de hardware

- Tamaños de archivo: fp32 2383,7 MB, fp16 1192,5 MB, Core ML 1194,9 MB. La variante fp16 cabe en dispositivos con al menos 2 GB de RAM disponible.
- Latencia medida en Mac arm64 (mediana de 10 ejecuciones con una secuencia de 256 tokens): fp32 203,9 ms, fp16 537,9 ms, Core ML 30,4 ms. La variante Core ML es 6,7 veces más rápida que el modelo eager.
- Pensado para ejecución en dispositivos móviles y edge mediante ExecuTorch. No requiere GPU dedicada; puede ejecutarse en CPU con aceleración XNNPACK o delegación a Core ML en Apple.
- Opciones de despliegue: ExecuTorch runtime, con soporte para XNNPACK y Core ML. No se mencionan vLLM, llama.cpp u Ollama, ya que el formato .pte es específico de ExecuTorch.
- La variante int8 (1064,0 MB) fue evaluada pero no publicada porque su error de recuperación superaba el margen de decisión disponible.

## Comparativa con modelos similares

La model card compara este modelo con otros modelos de embeddings pequeños de la misma "estantería" (shelf). La siguiente tabla resume las diferencias clave:

| Modelo | Pooling | Normalizado | Tamaño aprox. | Licencia |
|---|---|---|---|---|
| all-MiniLM-L6-v2 | media | sí | ~80 MB | Apache 2.0 |
| all-MiniLM-L12-v2 | media | sí | ~120 MB | Apache 2.0 |
| bge-small-en-v1.5 | CLS | sí | ~130 MB | MIT |
| multilingual-e5-base | media | sí | ~1 GB | MIT |
| multilingual-e5-large | media | sí | ~2 GB | MIT |
| **Qwen3-Embedding-0.6B (ExecuTorch)** | **último token** | **sí** | **~1,2 GB (fp16)** | **Apache 2.0** |
| paraphrase-multilingual-L12 | media | no | ~470 MB | Apache 2.0 |

El modelo Qwen3 destaca por ser el único decoder de la lista y por su pooling de último token, que aprovecha la atención causal. También presenta una separación de similitudes mucho más amplia que los modelos E5, lo que facilita el umbralado. Sin embargo, su tamaño es mayor que el de MiniLM o bge-small, y su contexto está limitado a 256 tokens en esta implementación.

## Limitaciones y advertencias

- La entrada está fijada a 256 tokens en esta implementación ExecuTorch, lo que limita su uso para documentos largos. Para textos más extensos sería necesario truncar o dividir.
- El prefijo de instrucción es asimétrico: las consultas requieren una instrucción específica, mientras que los documentos no llevan ninguna. Usar el mismo prefijo en ambos lados degrada el rendimiento de recuperación.
- La variante int8 no se publica porque su error de recuperación (0,0233) es comparable al margen de decisión más cercano (0,0234), lo que podría alterar resultados en corpus reales.
- No se han evaluado sesgos del modelo en esta conversión. Al ser un modelo multilingüe, puede presentar sesgos culturales o de género no documentados.
- Al ser un modelo de embeddings, no genera texto y no presenta riesgo de alucinación en el sentido habitual, pero sí puede producir vectores poco discriminativos para dominios muy específicos no representados en su entrenamiento.
- La latencia de la variante fp16 en CPU es notablemente mayor que la de fp32 (537,9 ms vs 203,9 ms), probablemente por una implementación subóptima de XNNPACK para fp16. Se recomienda usar Core ML en dispositivos Apple o fp32 en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-Embedding-0.6B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio oficial de Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- README del repositorio: https://github.com/QwenLM/Qwen3-Embedding/blob/main/README.md
