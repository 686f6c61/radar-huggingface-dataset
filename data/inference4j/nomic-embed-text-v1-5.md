# inference4j/nomic-embed-text-v1.5

## Resumen

Nomic Embed Text v1.5 es un modelo de embeddings de texto desarrollado por Nomic AI, exportado a formato ONNX por inference4j para su uso con la librería de inferencia para Java del mismo nombre. Se trata de un modelo encoder basado en la arquitectura NomicBERT que transforma texto en vectores densos de 768 dimensiones mediante mean pooling y normalización L2, pensado para tareas de búsqueda semántica, similitud de frases, clustering y clasificación.

La característica diferencial del modelo es su entrenamiento con Matryoshka Representation Learning, que permite truncar los embeddings a 512, 256, 128 o 64 dimensiones sin reentrenar, reduciendo el coste de almacenamiento y de búsqueda vectorial a costa de cierta pérdida de precisión. Además, admite secuencias de hasta 8192 tokens, lo que lo sitúa en la categoría de modelos de embeddings de contexto largo.

Este repositorio concreto es un espejo del modelo original de Nomic AI en formato ONNX, con licencia Apache 2.0, orientado a entornos JVM donde se quiera evitar la dependencia de Python. La información publicada en la model card es limitada: no se detallan volúmenes de entrenamiento, composición del dataset ni resultados de benchmarks, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NomicBERT (12 capas, 768 de dimensión oculta, posiciones rotatorias, SwiGLU) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | ingles (la model card describe el modelo como "English embedding model") |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Dimension de salida | 768 (Matryoshka: 512, 256, 128, 64) |
| Pooling | Mean pooling |
| Normalizacion | L2 |
| Prefijos de tarea | `search_query: `, `search_document: `, `clustering: `, `classification: ` |
| Framework original | PyTorch (HuggingFace Transformers) |
| Tamano del repositorio | 0,5 GB |
| Libreria de despliegue | ONNX / inference4j (Java) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer encoder denominada NomicBERT, con 12 capas, dimensión oculta de 768, embeddings posicionales rotatorios (rotary positions) y activación SwiGLU. La salida se obtiene mediante mean pooling sobre la secuencia y posterior normalización L2, generando un vector de 768 dimensiones. El entrenamiento con Matryoshka permite que los primeros 512, 256, 128 o 64 componentes del vector mantengan capacidad de representación útil, de modo que el mismo modelo sirve para distintos compromisos entre precisión y coste de almacenamiento.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones adicionales más allá del contexto largo (8192 tokens) y del mencionado Matryoshka. El repositorio es una exportación ONNX del modelo original de Nomic AI; no se documenta el proceso de conversión ni posibles diferencias numéricas respecto a los pesos en PyTorch.

## Capacidades

- Generación de embeddings de texto para similitud semántica y búsqueda vectorial.
- Soporte de contexto largo: hasta 8192 tokens por entrada.
- Embeddings truncables vía Matryoshka a 512, 256, 128 y 64 dimensiones.
- Prefijos de tarea específicos para distinguir consultas (`search_query: `) de documentos (`search_document: `), clustering y clasificación.
- Normalización L2 integrada, apta para similitud coseno o producto escalar.
- Uso desde Java mediante la librería inference4j (API `SentenceTransformerEmbedder`).
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de extracción de características.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de hasta 8192 tokens con el prefijo `search_document: ` y consultar con `search_query: `, aprovechando el contexto largo para reducir la fragmentación de documentos.
- Motor de recuperación en pipelines RAG: generar embeddings de chunks y consultas para alimentar un sistema de recuperación aumentada, con vectores de 768 dimensiones o truncados a 256 para reducir el índice.
- Deduplicación y clustering de tickets de soporte: usar el prefijo `clustering: ` y embeddings de 128 o 64 dimensiones para agrupar incidencias similares con un coste de memoria bajo.
- Clasificación de textos por similitud: comparar embeddings con el prefijo `classification: ` contra prototipos de cada categoría, útil en moderación o etiquetado.
- Integración en aplicaciones Java empresariales: desplegar el modelo ONNX con inference4j dentro de un servicio Spring o similar, sin necesidad de un runtime Python.
- Sistemas de recomendación de contenido: calcular similitud entre descripciones de artículos y perfiles de usuario en un espacio vectorial de 768 dimensiones.
- Búsqueda en bases de conocimiento internas: indexar manuales y políticas con contexto largo y servir consultas en tiempo de ejecución desde la JVM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MTEB, recuperación ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 0,5 GB de repositorio en ONNX, la inferencia en FP32 requiere aproximadamente 1-2 GB de memoria, aunque la cifra exacta no está documentada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el modelo.
- Cabe en GPU de consumo: previsiblemente sí en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (vía inference4j en Java) y, al ser una exportación ONNX, otros runtimes compatibles con ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Licencia | Formato |
|---|---|---|---|---|---|
| nomic-embed-text-v1.5 (este repo, ONNX) | no disponible | 8192 | 768 (Matryoshka hasta 64) | Apache 2.0 | ONNX |
| nomic-ai/nomic-embed-text-v1.5 (original) | no disponible | 8192 | 768 (Matryoshka hasta 64) | Apache 2.0 | safetensors / PyTorch |
| Alternativas de embeddings de contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparativa se limita a características estructurales.

## Limitaciones y advertencias

- El modelo está entrenado y descrito para inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- No se han publicado datos sobre sesgos; al ser un modelo entrenado sobre corpus web, es previsible que herede sesgos de esos datos.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero los embeddings pueden producir similitudes espurias en textos ambiguos o muy cortos.
- Es obligatorio usar los prefijos de tarea (`search_query: `, `search_document: `, etc.); omitirlos degrada la calidad de los embeddings.
- El truncado Matryoshka reduce la precisión; conviene validar la dimensión elegida en el dominio concreto antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento originales, no detallados en esta model card.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; es un espejo reciente sin validación comunitaria documentada.
- No se documentan diferencias numéricas entre esta exportación ONNX y los pesos originales en PyTorch.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inference4j/nomic-embed-text-v1.5
- Modelo original: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Librería inference4j: https://github.com/inference4j/inference4j
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
