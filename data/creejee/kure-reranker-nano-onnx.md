# CreeJee/KURE-Reranker-nano-ONNX

## Resumen

KURE-Reranker-nano-ONNX es la exportación a formato ONNX de KURE-Reranker-nano, un reranker cross-encoder bilingüe coreano-inglés desarrollado por el NLP & AI Lab de la Universidad de Corea. El modelo original, publicado por nlpai-lab, codifica conjuntamente una consulta y un documento candidato y emite un único logit de relevancia por par, lo que permite reordenar resultados de recuperación en pipelines RAG y motores de búsqueda. Esta variante, mantenida por CreeJee, no reentrena ni modifica los pesos: solo añade los artefactos ONNX necesarios para ejecutar el modelo con ONNX Runtime y Transformers.js.

La relevancia de esta ficha radica en el despliegue: el repositorio original solo distribuye `model.safetensors`, mientras que esta versión ofrece pesos en fp32 (598 MB) y fp16 (299 MB) listos para inferencia en navegador con WebGPU o en servidores con ONNX Runtime. Con aproximadamente 150M de parámetros y arquitectura ModernBERT, el modelo se sitúa en la gama "nano" de rerankers, pensada para baja latencia y consumo moderado de memoria.

Al estar limitado a coreano e inglés, su nicho es claro: sistemas de búsqueda y generación aumentada por recuperación en esos dos idiomas, especialmente cuando se necesita ejecución del lado del cliente o en entornos sin PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder, clasificación de secuencias) |
| Parámetros totales | ~150M (según la model card del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 256 tokens) |
| Tipos de cuantización | fp32 y fp16 (exportaciones ONNX); no se publican GGUF ni int8 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx` fp32, `onnx/model_fp16.onnx` fp16); el original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un cross-encoder basado en ModernBERT que procesa el par consulta-documento de forma conjunta y produce un único logit escalar de relevancia. A diferencia de los bi-encoders, que generan embeddings independientes, el cross-encoder permite interacción completa entre consulta y pasaje, lo que suele traducirse en mayor precisión de ranking a costa de no poder precomputar representaciones. La model card del repositorio de CreeJee no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde al repositorio original de nlpai-lab y no está incluida en la información disponible.

La innovación de este repositorio es puramente de empaquetado: los pesos se exportaron con `optimum-cli export onnx --task text-classification` desde la revisión `8514b9e113f3b27c441ed9c2b50f81d80388b2fd` del modelo original, y la variante fp16 se generó con el conversor de ONNX Runtime (`convert_float_to_float16` con `keep_io_types=True`). No se entrenó ni alteró ningún peso más allá de la conversión de precisión. El tokenizador y los ficheros de configuración provienen del export, con la única diferencia de la versión de Transformers registrada y el campo de dtype en `config.json`.

## Capacidades

- Ranking de relevancia consulta-documento mediante un logit escalar por par (mayor valor, mayor relevancia).
- Reordenación de resultados de recuperación en pipelines RAG de dos etapas (retrieval + rerank).
- Procesamiento bilingüe coreano-inglés en el mismo modelo.
- Inferencia en navegador con Transformers.js y WebGPU.
- Ejecución con ONNX Runtime en servidores y entornos embebidos.
- Clasificación de pares de texto mediante `AutoModelForSequenceClassification`.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido; es un modelo de ranking, no generativo.

## Casos de uso

- Reordenación en RAG bilingüe coreano-inglés: tras una recuperación densa o léxica, el modelo puntúa cada pasaje contra la consulta y se seleccionan los mejores para el contexto del LLM generador; su tamaño de ~150M permite ejecutarlo en la misma petición sin latencia apreciable.
- Búsqueda en navegador del lado del cliente: con Transformers.js y WebGPU, el reranker se ejecuta íntegramente en el navegador usando el fichero fp16 de 299 MB, sin enviar consultas ni documentos a un servidor.
- Búsqueda documental interna en empresas con documentación en coreano e inglés: el cross-encoder mejora la precisión sobre un bi-encoder básico al modelar la interacción consulta-pasaje.
- Filtrado de candidatos en sistemas de preguntas y respuestas: dado un conjunto de pasajes recuperados, se ordenan y se descartan los irrelevantes antes de pasarlos al modelo generativo, reduciendo coste y alucinaciones por contexto ruidoso.
- Servicio de ranking en entornos sin PyTorch: al distribuirse solo en ONNX, se integra en runtimes ligeros (ONNX Runtime, servidores Node.js) donde instalar torch no es viable.
- Evaluación y prototipado de pipelines de búsqueda: el par fp32/fp16 permite comparar precisión y latencia de ambas precisiones antes de fijar la configuración de producción.
- Moderación o deduplicación semántica de pares de texto: el logit de relevancia puede reutilizarse como señal de similitud supervisada entre dos textos en coreano o inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de CreeJee no incluye métricas de evaluación (NDCG, MRR, etc.) ni comparaciones con otros rerankers; esos datos, si existen, corresponden al repositorio original de nlpai-lab y no se han proporcionado.

## Requisitos de hardware

- VRAM estimada: ~0,6 GB en fp32 y ~0,3 GB en fp16 para los pesos; el consumo real depende de la longitud de secuencia y del batch.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime o WebGPU; no requiere A100 ni H100. Una RTX 4090 o una GPU integrada moderna son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~1 GB de memoria libre, incluidas GTX 1650, RTX 3050 y similares.
- Despliegue: ONNX Runtime (CPU o GPU), Transformers.js con WebGPU en navegador, y servidores Node.js. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| KURE-Reranker-nano-ONNX | ~150M | ko, en | ONNX (fp32/fp16) | Apache-2.0 | no disponible |
| KURE-Reranker-nano (original) | ~150M | ko, en | safetensors | Apache-2.0 | no disponible |
| BGE-reranker-base | no disponible en la información | multilingüe (incluye en) | safetensors, ONNX | MIT (según el proyecto BGE) | no disponible |

La comparación con alternativas de la misma categoría (rerankers cross-encoder de tamaño pequeño) no puede completarse con datos verificados en la información disponible; se recomienda consultar las model cards de cada alternativa antes de decidir.

## Limitaciones y advertencias

- Solo cubre coreano e inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- Al ser un cross-encoder, no permite precomputar embeddings de documentos: el coste de inferencia crece linealmente con el número de candidatos a reordenar.
- El ejemplo de uso trunca a 256 tokens; secuencias más largas pueden perder información relevante, y la longitud máxima real no está documentada en la información disponible.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de puntuaciones de relevancia erróneas en dominios alejados de los datos de entrenamiento; no se documentan sesgos conocidos.
- La licencia Apache-2.0 permite uso comercial, pero los pesos ONNX son una forma modificada de los originales; conviene conservar los avisos de licencia y atribución al NLP & AI Lab de la Universidad de Corea.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-06; no hay evidencia de mantenimiento continuado ni de validación comunitaria.
- El fichero fp16 usa pesos y activaciones en media precisión con entradas y salidas en fp32; puede haber pequeñas diferencias numéricas frente al fp32 que no están cuantificadas en la información disponible.

## Enlaces

- Repositorio ONNX: https://huggingface.co/CreeJee/KURE-Reranker-nano-ONNX
- Modelo base: https://huggingface.co/nlpai-lab/KURE-Reranker-nano
- Ficheros del modelo base: https://huggingface.co/nlpai-lab/KURE-Reranker-nano/tree/main
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentación de Optimum (exportación ONNX): no disponible en la información proporcionada
- Paper, blog o demo del modelo original: no disponible en la información proporcionada
