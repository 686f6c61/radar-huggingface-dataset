# nikioth/bge-reranker-v2-m3-mlx-8bit

## Resumen

bge-reranker-v2-m3-mlx-8bit es una conversión a 8 bits en formato MLX del reranker multilingüe BAAI/bge-reranker-v2-m3, un cross-encoder basado en XLM-RoBERTa-large con 567.755.777 parámetros. Lo publica el usuario nikioth y su propósito es ejecutar el reranking de recuperación de información en Apple Silicon con un consumo de memoria y un tamaño de descarga sensiblemente menores que el checkpoint original en float32 (0,61 GB frente a 2,27 GB).

El modelo resuelve la segunda fase de un pipeline RAG o de búsqueda: recibe un par consulta-pasaje y devuelve un único logit de relevancia que, tras aplicar una sigmoide, se convierte en una puntuación entre 0 y 1. Frente a los bi-encoders de recuperación inicial, este cross-encoder procesa conjuntamente consulta y documento, lo que mejora la precisión del orden final a costa de mayor coste computacional por par.

Su relevancia actual radica en que permite desplegar un reranker multilingüe de calidad en portátiles y equipos Mac sin GPU dedicada, con una pérdida de calidad medida muy contenida frente al original. No es un checkpoint para PyTorch ni para llama.cpp: está pensado exclusivamente para el runtime MLX de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa-large (transformer encoder de 24 capas) |
| Parametros totales | 567.755.777 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 8192 posiciones en el modelo base; las pruebas y el ejemplo de uso truncan cada par a 512 tokens |
| Tipos de cuantizacion | 8 bits con cuantización afina y group_size 64; resto de tensores en float16 |
| Idiomas soportados | Multilingüe (evaluado en inglés, ruso y alemán) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (611 MB, 685 tensores, 146 de ellos a 8 bits) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre XLM-RoBERTa-large: 24 capas de encoder con atención completa, embeddings de palabra de 250.002 x 1024 y una cabeza de clasificación que proyecta de 1024 a 1 para producir el logit de relevancia. La entrada se serializa con la plantilla `<s> query </s></s> passage </s>` y el modelo puntúa conjuntamente ambos segmentos, de modo que la atención puede modelar interacciones cruzadas entre consulta y documento.

Esta ficha corresponde a una conversión de pesos, no a un reentrenamiento. La cuantización se aplica con `mx.quantize` a 8 bits y grupo de 64 sobre los embeddings de palabra, todas las capas Linear de las 24 capas del encoder (query, key, value, salida de atención, intermedio y salida) y la capa densa del clasificador. Permanecen en float16 sin cuantizar los embeddings de posición y de tipo de token, todas las LayerNorms, todos los sesgos y la proyección final de 1024 a 1 que genera el logit. El tokenizador es el de BAAI sin modificaciones. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Puntuación de relevancia consulta-pasaje: devuelve un logit por par que, tras sigmoide, se interpreta como probabilidad de relevancia entre 0 y 1.
- Reranking de resultados de recuperación: reordena candidatos obtenidos por BM25, búsqueda vectorial o híbrida para mejorar el orden final.
- Procesamiento multilingüe: el modelo base está entrenado sobre datos multilingües; la model card verifica calidad en inglés, ruso y alemán.
- Manejo de pares largos: acepta hasta 8192 posiciones, aunque las pruebas documentadas se limitan a 512 tokens por par.
- Procesamiento por lotes con padding: el script de ejemplo trunca a 512 tokens y agrupa pares en lotes.
- Integración en pipelines RAG: encaja como etapa de reranking entre la recuperación inicial y la generación.
- No soporta tool calling, function calling, agentes ni generación de texto: es un clasificador de pares, no un modelo generativo.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los 20-50 candidatos con un bi-encoder o búsqueda híbrida, el modelo puntúa cada par consulta-documento y reordena los resultados antes de pasarlos al LLM generador. La evaluación privada del autor muestra una mejora de MRR@6 de 0,804 a 0,896 en un conjunto de notas Markdown.
- Búsqueda personal en notas y documentación: indexación local de colecciones de Markdown con recuperación híbrida BM25 más embeddings y reranking posterior en un Mac, sin GPU dedicada ni servicios en la nube.
- Búsqueda empresarial interna multilingüe: reordenación de resultados en corpus con documentos en varios idiomas, aprovechando la naturaleza multilingüe de XLM-RoBERTa-large.
- Filtrado de contexto para atención al cliente: seleccionar los fragmentos de base de conocimiento más relevantes antes de construir el prompt, reduciendo tokens de entrada y alucinaciones por contexto irrelevante.
- Deduplicación y ordenación de respuestas de FAQ: puntuar pares pregunta-respuesta candidata para elegir la mejor coincidencia en sistemas de soporte automatizado.
- Evaluación de sistemas de recuperación: usar las puntuaciones como métrica de relevancia en pruebas offline de pipelines de búsqueda, comparando configuraciones de recuperación inicial.
- Prototipado en Apple Silicon: desarrollo y validación de pipelines de reranking en portátiles Mac antes de desplegar la versión completa en servidores.

## Benchmarks y rendimiento

La model card incluye comprobaciones de calidad frente al checkpoint original en float32 y una evaluación privada de recuperación. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un cross-encoder de reranking.

| Prueba | Diferencia máxima de logit vs PyTorch float32 | Diferencia media | Diferencia máxima de sigmoide | Mismo pasaje top | Mismo orden completo |
|---|---|---|---|---|---|
| MLX con pesos float32 de BAAI | < 0,001 | < 0,001 | < 0,0001 | 5/5 | 5/5 |
| MLX con este checkpoint 8 bits | 0,067 | 0,028 | 0,0095 | 5/5 | 5/5 |

| Variante | Tamaño de model.safetensors | MRR@6 conjunto 1 | MRR@6 conjunto 2 | Rango de la nota esperada vs float32 |
|---|---|---|---|---|
| Sin reranker | — | 0,804 | 0,829 | — |
| Float32 (BAAI) | 2,27 GB | 0,896 | 0,938 | — |
| Float16 | 1,14 GB | 0,896 | 0,938 | Igual en 48/48; listas top-6 idénticas |
| 8 bits (este repositorio) | 0,61 GB | 0,896 | 0,938 | Igual en 48/48; top-6 difiere en 10 preguntas y el primer resultado en 1 |

Las pruebas de equivalencia se realizaron sobre 20 pares consulta-pasaje (cinco consultas en inglés, ruso y alemán con cuatro pasajes candidatos cada una). Los logits del modelo van de -11 a +7,6. El procesamiento por lotes con padding altera las puntuaciones 8 bits como máximo 0,010. La evaluación de recuperación privada usó 48 preguntas sobre dos colecciones de notas Markdown (la mayor con 163 notas), candidatos de búsqueda híbrida BM25 y embeddings, y 512 tokens por par, puntuados con MLXRerankers de mlx-swift-lm.

En velocidad, `rerank.py` sobre un Apple M2 Pro con 32 GB y MLX 0.32.4 tarda 231 ms en puntuar una consulta contra 16 pasajes de 111 tokens por par, frente a 251 ms con los pesos float32 de BAAI. El ahorro principal de la cuantización es de memoria y de tamaño de descarga, no de latencia.

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 0,61 GB para los pesos en 8 bits más el overhead del runtime MLX y las activaciones; el checkpoint float32 original ocupa 2,27 GB y el float16 1,14 GB.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el autor valida en un M2 Pro de 32 GB. No hay soporte para GPU NVIDIA ni AMD en este formato.
- Cabe en cualquier Mac con Apple Silicon: el tamaño de 0,61 GB es compatible incluso con configuraciones de 8 GB de memoria unificada, aunque el margen para lotes grandes depende del resto de cargas del sistema.
- Opciones de despliegue: runtime MLX en Python (`mlx`, `tokenizers`, `huggingface_hub`) con el script `rerank.py` incluido, o la librería MLXRerankers de mlx-swift-lm 3.32 en Swift. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuye en GGUF ni en formato PyTorch.
- Latencia y throughput: 231 ms para una consulta y 16 pasajes de 111 tokens por par en un M2 Pro, según la model card; el throughput para lotes mayores no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikioth/bge-reranker-v2-m3-mlx-8bit | 567.755.777 | 8192 posiciones (pruebas a 512 tokens por par) | safetensors MLX 8 bits | Apache 2.0 | Hugging Face, 20 descargas |
| BAAI/bge-reranker-v2-m3 | 567.755.777 | 8192 posiciones | safetensors PyTorch float32 | Apache 2.0 | Hugging Face, modelo base de referencia |
| Variante float16 del mismo modelo | 567.755.777 | 8192 posiciones | safetensors MLX float16 | Apache 2.0 | Conversión propia a partir del base |
| Rerankers multilingües de la familia bge-reranker | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las comprobaciones de calidad son reducidas: 20 pares en tres idiomas y un conjunto privado de recuperación. El propio autor recomienda verificar sobre datos propios cuando las diferencias de puntuación sean pequeñas y determinen decisiones de ranking.
- No se probaron entradas de más de 512 tokens por par, aunque el modelo acepta hasta 8192 posiciones; el comportamiento más allá de ese límite no está validado.
- Solo funciona con MLX: no es un checkpoint de PyTorch ni GGUF, por lo que no se puede cargar con transformers, vLLM, llama.cpp, Ollama ni TGI sin reconversión.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración: las puntuaciones son logits relativos y pequeños cambios en el texto pueden alterar el orden, como muestra la diferencia de top-6 en 10 de 48 preguntas frente a float32.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de XLM-RoBERTa-large hereda los sesgos de sus datos de entrenamiento originales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base BAAI/bge-reranker-v2-m3 y de los datos con los que se entrenó.
- Dependencia de hardware: sin Apple Silicon no hay ruta de despliegue directa con este checkpoint; para servidores x86 con GPU NVIDIA hay que usar el modelo base en PyTorch.
- El repositorio tiene un volumen de descargas muy bajo (20) y ningún like, por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikioth/bge-reranker-v2-m3-mlx-8bit
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-swift-lm (MLXRerankers): https://github.com/ml-explore/mlx-swift-lm
- Paper de referencia BGE M3-Embedding (arXiv:2402.03216): https://arxiv.org/abs/2402.03216
- Paper de referencia citado en los tags (arXiv:2312.15503): https://arxiv.org/abs/2312.15503
