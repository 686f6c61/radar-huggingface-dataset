# litert-community/Qwen3-Reranker-0.6B-LiteRT

## Resumen

Qwen3-Reranker-0.6B-LiteRT es la reautoría en formato LiteRT (`.tflite`) del modelo Qwen3-Reranker-0.6B de Alibaba Qwen, un cross-encoder de 0,6 mil millones de parámetros diseñado para la segunda fase de un pipeline RAG: reordenar los documentos recuperados por relevancia respecto a una consulta. La conversión la mantiene la comunidad `litert-community` y su objetivo es ejecutar el reranker íntegramente en dispositivo (GPU o NPU de Android), sin servidor ni llamadas de red, emparejándolo con `Qwen3-Embedding-0.6B-LiteRT` para cubrir el ciclo completo embed → retrieve → rerank de forma local.

El modelo no genera texto: es un único forward pass sobre una secuencia de 256 tokens que emite dos logits (`no`/`yes`) y devuelve `P("yes")` como puntuación de relevancia. La arquitectura subyacente es un decoder Qwen3 de 28 capas con atención GQA y RoPE, reescrito para que todos los nodos sean compatibles con el delegado GPU de LiteRT (ML Drift), con la tabla de embeddings extraída a un fichero aparte porque la operación GATHER no está permitida en GPU.

Su relevancia actual es práctica: demuestra que un reranker de calidad SOTA en su rango de tamaño puede caber en un móvil de gama media-alta con latencias de decenas de milisegundos (47,5 ms p50 en NPU Hexagon de un Galaxy S26, 78,5 ms en GPU Adreno), lo que habilita RAG privado y offline en aplicaciones Android y en navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3), 28 capas, cross-encoder con cabeza de 2 logits (`no`/`yes`) |
| Parámetros totales | 0,6 B (modelo base Qwen3-Reranker-0.6B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens por par consulta-documento (longitud fija del grafo: `inputs_embeds[1,256,1024]`) |
| Tipos de cuantización | fp16 (grafo `qwen3rerank_gpu_fp16.tflite` y tabla de embeddings `embeddings_fp16.bin`) |
| Idiomas soportados | no disponible (heredados del modelo base; la model card no los detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tflite` (LiteRT `CompiledModel`), más `embeddings_fp16.bin`, `vocab.json` y `merges.txt` para el tokenizador en host |

## Arquitectura y entrenamiento

El grafo LiteRT contiene las 28 capas del decoder Qwen3 más una cabeza de 2 logits cocinada en el propio modelo: las filas de la embedding atada correspondientes a los tokens `"no"` (id 2152) y `"yes"` (id 9693), de modo que la salida es directamente `logits[1,256,2]`. La puntuación se obtiene aplicando softmax sobre `(no, yes)` en la posición del último token real y tomando la probabilidad de `yes`. El prompt sigue la plantilla oficial de Qwen3-Reranker (`PREFIX + <Instruct>/<Query>/<Document> + SUFFIX`).

La reautoría introduce varias modificaciones para hacer el grafo compatible con GPU: la búsqueda de embeddings se traslada al host (GATHER está vetada en el delegado), la atención GQA se implementa con `cat`-repeat para evitar `BROADCAST_TO`, se aplica RMSNorm con normalización por máximo para prevenir desbordamiento fp16 en la pila profunda, y RoPE y la máscara causal van precalculados. El padding se hace a la derecha y se agrupa el último token real, lo que equivale al left-pad con máscara de atención del modelo original. No se detallan en la información disponible los datos de entrenamiento, el volumen de tokens ni si hubo RLHF/DPO; esos detalles corresponden a la model card del modelo base Qwen3-Reranker-0.6B.

## Capacidades

- Reranking de documentos: puntúa la relevancia de un par consulta-documento y devuelve `P("yes")` como score comparable entre candidatos.
- Integración en pipelines RAG de dos etapas: recuperación por embeddings con `Qwen3-Embedding-0.6B-LiteRT` seguida de reordenación con este modelo.
- Inferencia en dispositivo: ejecución completa en GPU (ML Drift) o NPU (QNN/HTP) de Android, sin conexión a servidor.
- Ejecución en navegador: soporte previsto vía LiteRT.js con WebGPU (la prueba registrada en Chromium 151 sobre M4 Max figura como "did not run").
- Cross-encoding con instrucción: acepta una instrucción de tarea en el prompt, lo que permite adaptar el criterio de relevancia.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es un clasificador de un solo paso sin caché KV.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda semántica offline en aplicaciones Android: la app indexa documentos locales con el embedder y reordena los top-k con este modelo en GPU o NPU, sin enviar datos del usuario a ningún servidor.
- Asistente documental con privacidad estricta: en entornos sanitarios o legales donde el contenido no puede salir del dispositivo, el par embedder + reranker cubre la recuperación completa en local.
- Chatbot sobre base de conocimiento corporativa en móvil: recuperación de fragmentos relevantes de manuales o políticas internas y reordenación antes de pasarlos a un LLM, reduciendo el contexto enviado y el coste por consulta.
- Filtrado de resultados en buscadores de aplicaciones: reordenación de candidatos recuperados por un índice léxico o vectorial para mejorar la precisión de la primera página de resultados.
- Evaluación de calidad de recuperación en CI: uso del modelo como referencia para medir el impacto de cambios en el índice o en el chunking, comparando scores `P("yes")` entre versiones.
- RAG en navegador con WebGPU: prototipos de asistentes web que reordenan resultados localmente sin backend, útil para demos y aplicaciones de bajo coste operativo.
- Deduplicación y clustering de documentos: uso del score de relevancia cruzada para detectar fragmentos redundantes antes de indexar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, BEIR, MTEB u otros) en la información disponible. Los únicos datos publicados son de latencia y paridad numérica en dispositivo:

| Medición | Plataforma / runtime | Resultado |
|---|---|---|
| Paridad `P(yes)` frente a referencia fp32 de HF | Pixel 8a (Tensor G3) | ref 0,9995 / dev 0,9994 |
| Latencia p50, GPU (ML Drift) | Galaxy S26, LiteRT 2.2.0 | 78,5 ms |
| Latencia p50, NPU (QNN/HTP) | Galaxy S26, LiteRT 2.2.0 | 47,5 ms |
| NPU vs GPU, inferencia | Galaxy S26, Hexagon v81 | 47,51 ms vs 78,49 ms (1,65x más rápido en NPU) |
| NPU vs GPU, carga del modelo | Galaxy S26 | 320 ms vs 4265 ms (13,35x más rápida en NPU) |
| TFLite `benchmark_model`, GPU (OpenCL) | Pixel 8a, Tensor G3 | 9277,4 ms (108/3266 nodos en GPU) |
| TFLite `benchmark_model`, CPU (XNNPACK, 4 hilos) | Pixel 8a, Tensor G3 | 4066,1 ms |
| LiteRT.js WebGPU | Chromium 151, M4 Max | no ejecutado |

Las cifras de `benchmark_model` corresponden al delegado OpenCL clásico de TFLite, no al acelerador `CompiledModel` de LiteRT, y el propio autor advierte que no son comparables entre sí.

## Requisitos de hardware

- Tamaño del repositorio: 1,2 GB (incluye grafo fp16 y tabla de embeddings fp16 de `[151669, 1024]`).
- VRAM/espacio en dispositivo: el grafo fp16 y la tabla de embeddings suman del orden de un gigabyte; conviene reservar al menos 1,5 GB libres para carga y buffers intermedios.
- GPU recomendadas: Adreno en Snapdragon 8 Elite Gen 5 (SM8850) validado; Tensor G3 en Pixel 8a validado con el delegado OpenCL clásico.
- NPU: Hexagon v81 con compilación AOT para SM8850; requiere LiteRT `CompiledModel` 2.2.0.
- GPU de escritorio: no hay datos publicados; el caso de navegador con WebGPU no llegó a ejecutarse.
- Despliegue: LiteRT `CompiledModel` (Kotlin/Android), LiteRT.js en navegador, y TFLite `benchmark_model` para medición. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: 47,5 ms p50 en NPU y 78,5 ms p50 en GPU por par consulta-documento en Galaxy S26; el throughput efectivo depende del número de candidatos a reordenar (k pares por consulta).
- Nota de particionado: en el delegado OpenCL clásico solo 108 de 3266 nodos van a GPU, con coste por round trip entre particiones; en ese caso la CPU resulta más rápida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Reranker-0.6B-LiteRT | 0,6 B | 256 tokens por par | `.tflite` LiteRT, GPU/NPU Android | Apache-2.0 | Hugging Face, 75 descargas |
| Qwen3-Reranker-0.6B (base) | 0,6 B | según model card del original (no disponible aquí) | safetensors, PyTorch/Transformers | Apache-2.0 | Hugging Face |
| Qwen3-Embedding-0.6B-LiteRT | 0,6 B | no disponible | `.tflite` LiteRT | Apache-2.0 | Hugging Face, misma comunidad |

No se dispone de datos de benchmarks que permitan comparar la calidad de reordenación frente a alternativas de la misma categoría; la comparación anterior se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir respuestas, ejecutar herramientas ni mantener conversaciones; su única salida es una puntuación de relevancia.
- Ventana fija de 256 tokens por par: documentos más largos deben truncarse o dividirse, lo que puede degradar la puntuación de fragmentos con información distribuida.
- La tokenización y la búsqueda de embeddings se ejecutan en host; el rendimiento extremo a extremo incluye ese coste y no solo el del grafo.
- El particionado en el delegado OpenCL clásico deja la mayor parte del grafo en CPU (108/3266 nodos en GPU), con latencias de segundos en Pixel 8a; no debe tomarse como referencia del rendimiento en LiteRT `CompiledModel`.
- La ruta NPU requiere compilación AOT específica para el SoC (SM8850); en otros chips el comportamiento no está documentado.
- No hay datos publicados sobre sesgos, tasas de alucinación ni cobertura idiomática; al heredar el modelo base, conviene validar el comportamiento en el dominio y el idioma de destino.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse la atribución y revisarse las condiciones del modelo base Qwen3-Reranker-0.6B.
- El repositorio tiene muy poca adopción (75 descargas, 0 likes) y la model card advierte de que las cifras de rendimiento registradas al publicar provienen de un runtime distinto al de las herramientas estándar, lo que complica la reproducibilidad.
- El soporte en navegador vía WebGPU no está verificado (la prueba figura como no ejecutada).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3-Reranker-0.6B-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Embedder complementario: https://huggingface.co/litert-community/Qwen3-Embedding-0.6B-LiteRT
- Tarjeta de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/qwen3-reranker-0.6b/CARD.md
- Herramienta de medición LiteRT: https://ai.google.dev/edge/litert/models/measurement
