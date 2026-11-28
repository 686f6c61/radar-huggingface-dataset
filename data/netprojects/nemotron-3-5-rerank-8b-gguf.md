# netprojects/Nemotron-3.5-Rerank-8B-GGUF

## Resumen

Nemotron-3.5-Rerank-8B-GGUF es la conversion a formato GGUF del reranker NVIDIA Nemotron-3.5-Rerank-8B, un modelo de reordenacion (reranking) de pasajes orientado a pipelines de recuperacion de informacion. El modelo original lo desarrolla NVIDIA sobre el backbone Ministral-3 8B y se distribuye en BF16; esta version, publicada por NetProjects, anade los formatos Q8_0 y Q4_K_M para su ejecucion con llama.cpp, ademas de un parche que habilita el endpoint nativo `/v1/rerank`.

El modelo no genera texto: recibe un par consulta/pasaje con el formato `query: {query}\n\npassage: {document}` y devuelve un logit de relevancia, convertible en probabilidad mediante una sigmoide. Esta pensado para la segunda fase de un pipeline RAG, donde un retriever vectorial aporta candidatos y el reranker los reordena por relevancia real. La arquitectura es un transformer bidireccional de 7.952.683.008 parametros con pooling de media enmascarado por atencion y una cabeza de puntuacion `Linear(4096 -> 1)`.

La relevancia actual de esta ficha es practica: ofrece un reranker de 8B en cuantizaciones que caben en GPU de consumo (4,9 GB en Q4_K_M) y con dos rutas de despliegue: nativa con parche sobre llama.cpp o estandar con un wrapper externo. Es una build no oficial, solo texto (la torre de vision Pixtral fue eliminada) y solo en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (backbone Ministral-3 8B) con mean pooling enmascarado por atencion y cabeza `Linear(4096 -> 1)`; torre de vision Pixtral eliminada |
| Parametros totales | 7.952.683.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de servidor usa `-c 4096` |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW License Agreement 1.1 (modelo original de NVIDIA); base Ministral-3-8B-Instruct-2512-BF16 bajo Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); `score_weight.npy` separado en las variantes embed |

## Arquitectura y entrenamiento

El modelo es un reranker cross-encoder: procesa conjuntamente consulta y pasaje con atencion bidireccional y produce un unico logit de relevancia. El backbone es Ministral-3 8B, sobre el que NVIDIA anade pooling de media con mascara de atencion y una cabeza lineal de 4096 a 1. La build GGUF conserva el backbone y la cabeza de puntuacion, pero elimina la torre de vision Pixtral del modelo original, por lo que es estrictamente texto.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Si se documenta el proceso de conversion: se generan dos variantes. La variante `rank` usa pooling RANK, almacena la cabeza como `cls.output` e incluye plantilla de rerank, lo que habilita `/v1/rerank` nativo con el parche `native-rerank.patch` (aplicado sobre llama.cpp master `0ec4027`). La variante `embed` usa mean pooling y separa la cabeza en `score_weight.npy`, de modo que la puntuacion se calcula como `dot(score_weight, embedding)` y funciona con llama.cpp estandar mas `rerank_wrapper.py`. Ambas rutas producen puntuaciones identicas (diferencia maxima 0.0000 en las pruebas del autor).

## Capacidades

- Puntuacion de relevancia consulta-pasaje: devuelve un logit crudo; aplicando sigmoide se obtiene una probabilidad.
- Reordenacion de candidatos en pipelines de recuperacion (segunda fase de RAG).
- Endpoint compatible con `/v1/rerank` estilo Cohere/Jina en la variante `rank` con llama.cpp parcheado.
- Integracion con llama.cpp estandar mediante embedding + wrapper en la variante `embed`.
- Procesamiento de pares con pooling de media enmascarado por atencion.
- Capacidad multilingue: limitada a ingles segun la model card.
- Sin soporte de tool calling, agentes, generacion de texto, vision ni audio: es un modelo de scoring, no un LLM generativo.
- Sin soporte de imagenes de pagina en esta build (la torre de vision fue eliminada).

## Casos de uso

- Reordenacion en RAG sobre documentacion tecnica en ingles: el retriever vectorial aporta 50-100 candidatos y el modelo los reordena por relevancia antes de pasarlos al LLM generador, reduciendo contexto irrelevante y coste de tokens.
- Busqueda semantica en bases de conocimiento internas: dado que devuelve un logit continuo, permite fijar umbrales de relevancia calibrados con sigmoide para filtrar pasajes antes de la generacion.
- Atencion al cliente con FAQ: se indexan las respuestas aprobadas y el reranker selecciona la mas adecuada a la consulta del usuario en ingles, con un coste de inferencia bajo en Q4_K_M.
- Evaluacion de calidad de recuperacion: el logit sirve como metrica continua para comparar configuraciones de chunking, embeddings o indices sin necesidad de un LLM generativo.
- Deduplicacion y priorizacion de resultados en motores de busqueda internos: el scoring permite ordenar pasajes solapados y descartar los de baja relevancia.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q4_K_M (4,9 GB) puede ejecutarse en CPU con llama.cpp, adecuada para prototipos y entornos de desarrollo.
- Filtrado previo en pipelines de anotacion de datos: puntuar pares consulta-documento para preseleccionar ejemplos relevantes antes de la revision humana.

## Benchmarks y rendimiento

El autor publica una prueba de paridad sobre 20 pares consulta/pasaje (10 relevantes, 10 irrelevantes) frente al modelo original en BF16 PyTorch sobre CPU. No son benchmarks de recuperacion estandar (BEIR, MTEB u otros).

| Cuantizacion | Diferencia maxima | Diferencia media | Pearson | Spearman | Orden por pares | Relevante > irrelevante |
|---|---|---|---|---|---|---|
| BF16 | 0.0113 | 0.0034 | 0.99999 | 1.0000 | 1.0000 | 10/10 |
| Q8_0 | 0.0164 | 0.0083 | 0.99999 | 1.0000 | 1.0000 | 10/10 |
| Q4_K_M | 0.0356 | 0.0130 | 0.99990 | 0.9985 | 0.9947 | 10/10 |

Las puntuaciones del endpoint nativo `/v1/rerank` (variante `rank`) coinciden exactamente con las del wrapper (variante `embed`), con diferencia maxima 0.0000. No se han publicado resultados de benchmarks estandar de reranking (nDCG, MRR, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: BF16 15,9 GB; Q8_0 8,5 GB; Q4_K_M 4,9 GB (tamanos de fichero; la VRAM necesaria es algo superior por el contexto y buffers de llama.cpp).
- GPU recomendadas: A100 o H100 para BF16 y despliegues de alta concurrencia; RTX 4090 (24 GB) para BF16 y Q8_0; GPU de 8-12 GB para Q8_0 y Q4_K_M.
- Cabe en GPU de consumo: si, Q4_K_M en tarjetas de 6-8 GB y Q8_0 en 10-12 GB.
- Opciones de despliegue: llama.cpp (variante `rank` con `native-rerank.patch`; variante `embed` con llama.cpp estandar y `rerank_wrapper.py`), `llama-server` con `--reranking` o `--embedding --pooling mean`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Backends de compilacion: Vulkan, CUDA, Metal o CPU. Probado en ASUS ProArt con AMD Radeon 8060S (Vulkan) y llama.cpp `0ec4027`.
- Latencia y throughput: no disponibles en la informacion proporcionada. El ejemplo de servidor usa `-c 4096 -ub 4096 -b 4096`, lo que sugiere lotes de hasta 4096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Rerank-8B-GGUF (esta ficha) | 7,95 B | no disponible | en | OpenMDW 1.1 | GGUF | Solo texto; endpoint `/v1/rerank` con parche |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 | 7,95 B | no disponible | en | OpenMDW 1.1 | safetensors (BF16) | Modelo original; incluye torre de vision Pixtral |
| netprojects/Nemotron-3.5-Rerank-8B-MLX-8bit | 7,95 B | no disponible | en | OpenMDW 1.1 | MLX 8-bit | Build para Apple Silicon con soporte multimodal |
| Otros rerankers de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Solo ingles: no se ha validado su comportamiento en castellano ni en otros idiomas.
- Solo texto: no admite imagenes de pagina; para reranking multimodal hay que usar las builds MLX del mismo autor.
- La prueba de paridad se hizo sobre 20 pares, no es un benchmark representativo de recuperacion real.
- Discrepancia de tokenizer: el tokenizer original inserta un zero-width non-joiner tras `[` y `<`; el endpoint nativo `/v1/rerank` no lo hace, mientras que `rerank_wrapper.py` si. Afecta solo a textos con esos caracteres.
- La variante `rank` requiere un parche no oficial sobre llama.cpp master `0ec4027`; actualizaciones de llama.cpp pueden romper la compatibilidad.
- Build no oficial: no es una release de NVIDIA y se distribuye AS IS, sin garantia.
- Licencia OpenMDW 1.1: revisar los terminos antes de uso comercial; el backbone Ministral-3 es Apache-2.0, pero la licencia del modelo derivado es la de NVIDIA.
- Riesgo de alucinacion no aplica en el sentido generativo, pero el logit puede sobrevalorar pasajes lexicamente proximos; conviene calibrar el umbral con sigmoide sobre datos propios.
- Sesgos: no documentados en la informacion disponible; al entrenarse solo en ingles, puede infravalorar contenido en otros idiomas.
- No es un modelo generativo: no debe usarse para producir respuestas, solo para puntuar pares.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Nemotron-3.5-Rerank-8B-GGUF
- Modelo original: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Build MLX 8-bit: https://huggingface.co/netprojects/Nemotron-3.5-Rerank-8B-MLX-8bit
- llama.cpp: https://github.com/ggml-org/llama.cpp
- ggml: https://github.com/ggml-org/ggml
- NetProjects: https://netprojects.com
- Licencia OpenMDW 1.1: fichero `LICENSE` del repositorio
