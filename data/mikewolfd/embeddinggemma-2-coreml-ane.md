# mikewolfd/embeddinggemma-2-coreml-ane

## Resumen

EmbeddingGemma-2 (9 Packed ANE + 3 CPU-SME W8 Core ML Bundles & FP16 Weights) es un paquete de artefactos precompilados para Apple Silicon derivado de `google/embeddinggemma-2`. No se trata de un modelo nuevo, sino de una redistribucion optimizada del modelo de embeddings de Google, convertido a Core ML y cuantizado a W8 para ejecutarse en la Neural Engine (ANE) y en la CPU con instrucciones SME. Lo publica el usuario mikewolfd bajo licencia Apache 2.0 y esta pensado para su uso con la libreria `fast-silicon` (modulo `fast-embeddinggemma-2`).

El paquete incluye nueve bundles ANE empaquetados por longitud de secuencia (`s32` a `s512`), tres bundles CPU-SME (`s256`, `s384`, `s512`), pesos FP16 en formato MLX (`.npz`) y el tokenizador. Su proposito es acelerar la generacion de embeddings en Macs con chip Apple Silicon, aprovechando la ANE para inferencia de baja latencia y alto throughput, y combinando ANE y GPU/CPU en modo heterogeneo para procesamiento por lotes de corpus grandes.

La relevancia de esta ficha es practica: documenta una via de despliegue local de un modelo de embeddings de Google en hardware de consumo Apple, con cifras de rendimiento publicadas por el autor frente a alternativas como `mlx-vlm` en GPU o exportaciones Core ML publicas. El repositorio ocupa 0,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (modelo base `google/embeddinggemma-2`), exportado a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (ventana completa preservada) |
| Tipos de cuantizacion | W8 (bundles Core ML ANE y CPU-SME); FP16 (pesos MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` (Core ML compilado), `.npz` (FP16 MLX), tokenizador incluido |

## Arquitectura y entrenamiento

El modelo subyacente es `google/embeddinggemma-2`, un modelo de embeddings de la familia Gemma. La ficha no aporta detalles sobre el numero de parametros, la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la model card del modelo base de Google, no a este repositorio. Lo que si documenta el autor es el proceso de conversion y empaquetado: el modelo se exporta a Core ML en dos variantes, una dirigida a la Neural Engine con nueve buckets de longitud de secuencia (`s32`, `s64`, ..., `s512`) y otra dirigida a CPU con instrucciones SME en tres buckets (`s256`, `s384`, `s512`), ambas cuantizadas a W8.

La innovacion tecnica principal no esta en el modelo sino en el pipeline de despliegue: el empaquetado por buckets permite seleccionar la forma compilada adecuada a la longitud real de cada entrada, evitando recompilaciones y padding innecesario. El modo heterogeneo (`hetero`) reparte la carga entre ANE y GPU para maximizar el throughput en corpus grandes, mientras que el modo `ane` puro minimiza la latencia en consultas individuales. Ademas, frente a exportaciones Core ML publicas limitadas a 512 tokens, este paquete preserva la ventana completa de 2.048 tokens, lo que segun el autor aporta una mejora de ranking de `+0.0514` en `LegalBench-RAG` sobre pasajes completos.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica, recuperacion y similitud entre documentos.
- Procesamiento por lotes de corpus documentales con throughput elevado en Apple Silicon.
- Inferencia de baja latencia en consultas individuales (`B=1`) mediante el bundle ANE correspondiente.
- Soporte de contexto completo de 2.048 tokens, adecuado para pasajes largos y documentos completos.
- Ejecucion en Neural Engine, CPU con SME y GPU (via MLX), con modo heterogeneo combinado.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de embeddings.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica local en aplicaciones de escritorio para macOS: el modelo genera embeddings de consultas y documentos en el propio Mac, sin enviar datos a la nube, usando el bundle ANE de baja latencia para consultas y el modo heterogeneo para indexar el corpus.
- Indexacion de bases documentales grandes: con un throughput de hasta 49.106 tok/s en modo heterogeneo sobre M5 (segun el autor), permite procesar corpus de cientos de miles de tokens en minutos en hardware de consumo.
- RAG (retrieval-augmented generation) en local: genera los embeddings de recuperacion para un pipeline RAG que combine este modelo con un LLM local, manteniendo todo el flujo en el dispositivo.
- Deduplicacion y agrupamiento de documentos: calcula similitudes entre pasajes para detectar duplicados o agrupar contenido tematicamente, aprovechando la ventana de 2.048 tokens para comparar fragmentos largos.
- Busqueda legal o documental de precision: el autor reporta una mejora de ranking en `LegalBench-RAG` al preservar el contexto completo, lo que lo hace adecuado para recuperacion sobre pasajes legales extensos.
- Clasificacion y filtrado de contenido por similitud: usar los embeddings como caracteristicas para clasificadores ligeros o para filtrar contenido por cercania semantica en pipelines de moderacion.
- Prototipado rapido en Mac: integracion via `fast-silicon` para experimentar con recuperacion semantica sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (fechados el 2026-11-24). No se han verificado de forma independiente.

| Carga / Suite | Host | `mlx-vlm` 8-bit GPU | GPU `fast-embeddinggemma-2` | Solo ANE | `hetero` |
|---|---|---|---|---|---|
| Corpus benchmark | Base M5 | 64,91 docs/s | 30.430 tok/s | 21.888 tok/s | 49.106 tok/s |
| Corpus benchmark | M4 Pro | 46,05 docs/s | 17.936 tok/s | 21.445 tok/s | 36.809 tok/s |
| Corpus de 2.000 docs (551.889 toks) | Base M5 | — | — | — | 48.803 tok/s |
| Corpus de 2.000 docs (551.889 toks) | M4 Pro | — | — | — | 38.517 tok/s |
| OCR de documentos (2.000 docs, `hetero2`) | M4 Pro | — | 11.844 tok/s (47,3 s) | — | 32.569 tok/s (17,2 s) |
| Consulta caliente `B=1` de 24 tokens | Base M5 | 8,48 ms | 5,02 ms | 2,58 ms | — |
| Consulta caliente `B=1` de 24 tokens | M4 Pro | 8,39 ms | 7,72 ms | 2,08–2,11 ms | — |
| Retrieval Tier-1 (500 items) | Base M5 | 246,9 s | — | — | 57,1 s |
| Retrieval Tier-1 (500 items) | M4 Pro | 358,6 s | — | — | 74,9 s |

Comparaciones adicionales del autor frente a exportaciones Core ML publicas: en el corpus de 2.000 documentos, `hetero` alcanza 48.803 tok/s en M5 frente a 14.945 tok/s de OpenInfinity INT8 (3,27x) y 12.482 tok/s de CoreAI BF16; en M4 Pro, 38.517 tok/s frente a 14.294 tok/s de OpenInfinity INT8 y 14.251 tok/s de FluidInference FP16. En consultas `B=1` de 24 tokens en M5, el modo ANE logra 2,58 ms frente a 2,59 ms de OpenInfinity INT8 y 9,38 ms de CoreAI BF16. No se han publicado resultados de benchmarks de calidad (MMLU, MTEB u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon exclusivamente (Neural Engine y CPU con SME). No es ejecutable en GPU NVIDIA ni en CPU x86.
- VRAM/memoria unificada: el repositorio ocupa 0,8 GB; el autor reporta consumos de 3,43 GB (M5) y 2,49 GB (M4 Pro) en la suite de retrieval Tier-1 en modo heterogeneo, frente a 19,41 GB y 39,03 GB respectivamente con `mlx-vlm` de referencia.
- GPUs recomendadas: chips Apple M4 Pro y M5 aparecen en los benchmarks; no se documentan otros chips.
- Cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon, ya que usa memoria unificada y la ANE integrada.
- Opciones de despliegue: libreria `fast-silicon` (modulo `fast-embeddinggemma-2`), artefactos Core ML (`.mlmodelc`) y pesos FP16 MLX (`.npz`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: consultas `B=1` de 24 tokens en 2,08–2,58 ms en modo ANE; hasta 49.106 tok/s en modo heterogeneo sobre M5 y 36.809 tok/s sobre M4 Pro en el benchmark de corpus.

## Comparativa con modelos similares

| Modelo / exportacion | Parametros | Contexto | Rendimiento (corpus 2.000 docs, M5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fast-embeddinggemma-2` hetero (este repo) | no disponible | 2.048 tokens | 48.803 tok/s | Apache 2.0 | Core ML / MLX para Apple Silicon |
| OpenInfinity INT8 (Core ML publico) | no disponible | 512 tokens (cap) | 14.945 tok/s | no disponible | Core ML |
| CoreAI BF16 (Core ML publico) | no disponible | no disponible | 12.482 tok/s | no disponible | Core ML |
| FluidInference FP16 (Core ML publico) | no disponible | no disponible | 14.251 tok/s (M4 Pro) | no disponible | Core ML |
| `mlx-vlm` 8-bit GPU (referencia) | no disponible | no disponible | 64,91 docs/s (text probe) | no disponible | MLX |

La comparativa se limita a las alternativas citadas por el autor; no se dispone de datos de otros modelos de embeddings comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni soporta tool calling, agentes o razonamiento.
- Dependencia de hardware Apple Silicon: los bundles Core ML y las instrucciones SME no son portables a otras plataformas.
- Los benchmarks proceden unicamente del autor y no han sido verificados de forma independiente; deben tratarse como orientativos.
- No hay informacion sobre sesgos, cobertura idiomatica ni tasas de alucinacion en la documentacion disponible; conviene consultar la model card del modelo base `google/embeddinggemma-2`.
- La ventana de contexto esta limitada a 2.048 tokens; los documentos mas largos deben fragmentarse.
- El repositorio registra 0 descargas y 0 likes, por lo que su madurez y soporte comunitario son limitados.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base de Google deben verificarse por separado.
- El rendimiento depende del chip concreto (M4 Pro frente a M5 muestran diferencias notables) y del modo de ejecucion elegido (ANE puro frente a heterogeneo).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mikewolfd/embeddinggemma-2-coreml-ane
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Libreria `fast-silicon`: https://github.com/mikewolfd/fast-silicon
