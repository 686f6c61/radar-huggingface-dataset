# opticsWolf/embeddinggemma-2-onnx-int8

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodales desarrollado por Google, distribuido bajo licencia Apache-2.0. Este repositorio concreto, `opticsWolf/embeddinggemma-2-onnx-int8`, es un mirror no modificado de la conversión oficial de `onnx-community/embeddinggemma-2-ONNX`, en la revisión `daa72c51243991dfcaf9f9137d2c573d8f7790c0`, con los grafos cuantizados a int8 dinámico. Su función es generar representaciones vectoriales densas a partir de texto, imagen y audio, lo que lo convierte en una pieza útil para sistemas de recuperación de información (RAG), búsqueda semántica y clustering multimodal.

El paquete incluye tres torres separadas: texto (314 MB), visión (~195 MB) y audio (~340 MB), todas ellas en formato ONNX cuantizado con `QuantType.QInt8`. El repositorio ocupa 0,9 GB en total y está pensado para despliegue en CPU o GPU mediante ONNX Runtime, sin dependencia de frameworks de deep learning pesados.

La relevancia de este mirror radica en que ofrece los grafos ya cuantizados y verificables (con hashes sha256 en `manifest.json`), lo que facilita auditorías de integridad y despliegues en entornos con recursos limitados. No obstante, el autor no proporciona información sobre parámetros, contexto ni idiomas en la model card, por lo que varios datos técnicos quedan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings multimodal con torres de texto, visión y audio; familia EmbeddingGemma 2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámico (`QuantType.QInt8`) sobre grafos ONNX |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (según la model card, heredada del modelo upstream de Google) |
| Formato de pesos | ONNX (grafos cuantizados con ficheros `_data` asociados) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base. Se sabe que EmbeddingGemma 2, del que este repositorio es un mirror, es un modelo de embeddings multimodal con tres torres independientes: texto, visión y audio. Cada torre se distribuye como un grafo ONNX separado (`model_quantized.onnx`, `vision_encoder_quantized.onnx` y `audio_encoder_quantized.onnx`), acompañado de sus ficheros de datos. La cuantización aplicada es int8 dinámica, lo que reduce el peso de los grafos sin requerir calibración con un dataset representativo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste contrastivo. El autor indica que los grafos son byte-idénticos a la revisión upstream y que los ficheros de tokenizer y configuración provienen del repositorio fuente, por lo que cualquier detalle de entrenamiento debería consultarse en la documentación oficial de Google o de `onnx-community`.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación densa.
- Generación de embeddings de imagen mediante la torre de visión.
- Generación de embeddings de audio mediante la torre de audio.
- Representaciones multimodales en un espacio vectorial común (según la estructura de tres torres del paquete).
- Ejecución en CPU y GPU a través de ONNX Runtime.
- Verificación de integridad de los grafos mediante hashes sha256 en `manifest.json`.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar artículos largos (el autor reporta pruebas con 1.500 artículos de Wikipedia) y recuperar fragmentos relevantes mediante similitud coseno, aprovechando la torre de texto cuantizada.
- RAG (retrieval-augmented generation) en producción: usar los embeddings int8 como etapa de recuperación en pipelines de generación aumentada, con drift medio de 8,5e-4 frente a fp32 según las mediciones del autor.
- Búsqueda multimodal imagen-texto: emplear la torre de visión para indexar imágenes y la de texto para consultas, permitiendo recuperación cruzada en catálogos o archivos multimedia.
- Clasificación y clustering de audio: generar embeddings de audio para agrupar fragmentos por similitud en tareas de organización de archivos sonoros o detección de duplicados.
- Despliegue en entornos con CPU exclusivamente: el autor reporta ~0,6 documentos/s en CPU, adecuado para indexación por lotes no urgente.
- Indexación a gran escala en GPU: con 38,6 documentos/s en CUDA (frente a 38,4 en fp32), útil para reindexar corpus extensos manteniendo el rendimiento del modelo original.
- Deduplicación de contenido: comparar embeddings de texto o audio para identificar documentos o fragmentos casi idénticos en repositorios grandes.

## Benchmarks y rendimiento

El autor proporciona mediciones propias sobre 1.500 artículos largos de Wikipedia (fecha 2026-11-14):

| Metrica | Valor |
|---|---|
| Drift medio 1-cos vs fp32 (texto int8) | 8,5e-4 |
| Drift p99 1-cos vs fp32 (texto int8) | 2,9e-2 |
| Retrieval a 768/512 en conjunto de 50 consultas | igual que fp32 |
| Throughput CPU | ~0,6 docs/s |
| Throughput CUDA | 38,6 docs/s |
| Throughput CUDA fp32 (referencia) | 38,4 docs/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los grafos (314 MB texto, ~195 MB visión, ~340 MB audio) sugiere que cada torre cabe holgadamente en GPUs consumer.
- GPU recomendadas: no especificadas; el autor reporta pruebas en CUDA sin detallar el modelo de GPU.
- Cabe en GPU consumer: probablemente sí para cada torre por separado, dado el tamaño de los ficheros int8, aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de embeddings ONNX.
- Latencia y throughput: ~0,6 docs/s en CPU y 38,6 docs/s en CUDA según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| opticsWolf/embeddinggemma-2-onnx-int8 | no disponible | no disponible | Apache-2.0 | ONNX int8 | Mirror cuantizado, tres torres |
| onnx-community/embeddinggemma-2-ONNX | no disponible | no disponible | Apache-2.0 | ONNX | Repositorio fuente de la conversión |
| EmbeddingGemma 2 (Google, original) | no disponible | no disponible | Apache-2.0 | no disponible | Modelo base upstream |

No se dispone de información suficiente para comparar con alternativas de otros proveedores (por ejemplo, modelos de embeddings de la familia BGE, E5 o similares) en términos de rendimiento o contexto.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- El drift de cuantización int8 es bajo en media (8,5e-4) pero alcanza 2,9e-2 en el percentil 99, lo que puede afectar a un pequeño subconjunto de documentos en recuperación sensible.
- El autor no garantiza soporte: indica que los problemas deben reportarse contra el repositorio upstream `onnx-community`.
- La licencia Apache-2.0 se declara en la model card, pero el campo de licencia del repositorio aparece como no disponible; conviene verificar antes de uso comercial.
- No se especifican idiomas soportados, lo que impide garantizar calidad multilingüe sin pruebas propias.
- Al ser un mirror, no recibe actualizaciones propias; depende de la revisión fijada `daa72c5`.
- No apto para generación de texto ni tareas generativas: es exclusivamente un modelo de embeddings.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/opticsWolf/embeddinggemma-2-onnx-int8
- Repositorio upstream de la conversión: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Documentación de benchmarks citada por el autor: `okfgraph/docs/bench-eg2-precision-width.md` (ruta interna, no se proporciona URL pública)
