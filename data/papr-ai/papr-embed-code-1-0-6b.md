# papr-ai/papr-embed-code-1-0.6b

## Resumen

papr-embed-code-1-0.6b es un modelo de embeddings de texto especializado en recuperación de código (code retrieval), desarrollado por papr-ai. Se trata de un ajuste fino de Qwen/Qwen3-Embedding-0.6B entrenado adicionalmente sobre datos de recuperación de código, y devuelve un único vector denso de 1024 dimensiones para cada texto de entrada. Su propósito es servir como motor de búsqueda semántica para tareas de recuperación natural-language-to-code, code-to-code y SQL, integrándose en pipelines RAG y bases de datos vectoriales.

El modelo mantiene la arquitectura de embeddings de Qwen3 (transformer encoder) con 595.776.512 parámetros totales y una longitud máxima de secuencia de 8192 tokens. Utiliza pooling de último token y normalización L2, con precisión de referencia fp32. La relevancia actual del modelo radica en su especialización: frente al modelo base, mejora la recuperación de código a costa de degradar ligeramente la recuperación de prosa general, lo que lo convierte en una pieza específica para asistentes de programación, búsqueda en repositorios y sistemas de autocompletado semántico.

La licencia Apache 2.0 y la disponibilidad de builds ONNX (fp32 e int8) y CoreML facilitan su despliegue en producción sin dependencia de PyTorch, tanto en servidores como en entornos de borde. El modelo está publicado en Hugging Face con soporte para sentence-transformers, FastEmbed y Qdrant.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de Qwen3-Embedding-0.6B) |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | fp32 (referencia), int8 (ONNX con MatMulNBits, block size 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8), CoreML |
| Dimension de embedding | 1024 |
| Pooling | último token (last-token) |
| Normalizacion | L2 |
| Precisión de referencia | fp32 |
| Tamano del repositorio | 7.1 GB |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 0.6B parámetros que parte de Qwen/Qwen3-Embedding-0.6B y se entrena adicionalmente sobre datos de recuperación de código. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el ajuste se centra en code retrieval y que el modelo no acepta esquemas (para embeddings condicionados por esquema existe papr-embed-schema-1).

La innovación técnica destacable es la especialización funcional: el modelo mantiene el formato de instrucción de Qwen3-Embedding (`Instruct: {instruction}\nQuery:{query}` para consultas, documentos sin instrucción) y ofrece builds optimizados para despliegue. El build ONNX fp32 devuelve los mismos vectores que PyTorch (cosine 1.0000), mientras que el build int8 (1.12 GB) mantiene una similitud coseno mínima de 0.9997 frente a la referencia. El grafo ONNX recibe `input_ids` y `attention_mask` y devuelve `last_hidden_state`; el pooling y la normalización se aplican fuera del grafo. El build CoreML ejecuta en el Neural Engine de Mac a aproximadamente 17 ms por consulta.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para textos y fragmentos de código.
- Recuperación natural-language-to-code: dada una pregunta en lenguaje natural, recupera el fragmento de código que la responde.
- Recuperación code-to-code: encuentra código similar o relacionado a partir de un fragmento de código.
- Recuperación de SQL: soporta búsqueda semántica sobre consultas SQL.
- Soporte de instrucciones en consultas mediante el prefijo `Instruct: ...\nQuery: ...`, con documentos embebidos sin instrucción.
- Procesamiento de secuencias de hasta 8192 tokens, adecuado para fragmentos de código extensos.
- Integración con sentence-transformers, FastEmbed, Qdrant y text-embeddings-inference.
- Despliegue sin PyTorch mediante ONNX Runtime (>=1.23 para int8) y CoreML en Mac.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en repositorios de código: indexar funciones, clases y fragmentos con embeddings de 1024 dimensiones y recuperar el código relevante ante consultas en lenguaje natural, aprovechando la ventana de 8192 tokens para fragmentos largos.
- Asistentes de programación con RAG: integrar el modelo como recuperador en un pipeline que alimente a un LLM generador con ejemplos de código del repositorio del usuario, usando el prefijo de instrucción en las consultas para mejorar la precisión.
- Autocompletado y sugerencia de código en IDE: dado el contexto del código que escribe el desarrollador, recuperar fragmentos similares del proyecto o de la documentación mediante similitud coseno sobre vectores normalizados.
- Búsqueda de consultas SQL: indexar un catálogo de consultas SQL y recuperar la consulta adecuada a partir de una descripción en lenguaje natural, útil en herramientas de análisis de datos y BI.
- Deduplicación y clustering de código: generar embeddings de fragmentos de código para detectar duplicados, agrupar funciones similares o identificar código muerto en bases de código grandes.
- Motor de búsqueda en documentación técnica: indexar documentación y ejemplos de código con FastEmbed y Qdrant, desplegando el build int8 (1.12 GB) en entornos con recursos limitados o sin PyTorch.
- Despliegue en borde en macOS: usar el build CoreML para búsqueda local de código en el Neural Engine con latencia de aproximadamente 17 ms por consulta, sin conexión a servidores.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la evaluación CoIR (code retrieval) con mteb 2.10.0, instrucciones de `task_prompts.json` y longitud máxima de 8192.

| Build | Precisión | Tamano | CoIR-10 mean | Coseno vs PyTorch (min) |
|---|---|---|---|---|
| `model.safetensors` (referencia) | fp32 | 2.38 GB | 77.19 | 1 |
| `onnx/model.onnx` + `onnx/model.onnx_data` | fp32 | 2.38 GB | 76.85 | 1.0000 |
| `onnx/model_quantized.onnx` | int8 (pesos), fp32 (activaciones) | 1.12 GB | 76.57 | 0.9997 |

Resultados por tarea (parcial, según la model card):

| Tarea | PyTorch fp32 | ONNX fp32 | ONNX int8 |
|---|---|---|---|
| Apps | 79.31 | 79.31 | 79.27 |
| CodeSearchNet | 86.19 | 86.19 | 86.18 |
| CosQA | sensible a empates (ver nota) | — | — |
| SyntheticText2SQL | sensible a empates (ver nota) | — | — |

La media CoIR de las otras ocho tareas es 82.43 para PyTorch, ONNX fp32 y ONNX int8. La diferencia en la media CoIR-10 entre PyTorch y ONNX fp32 se atribuye a dos tareas sensibles a empates (CosQA y SyntheticText2SQL), donde el orden de los batches decide cuál de varios documentos casi idénticos queda primero. En recuperación de prosa general, el modelo es igual o peor que Qwen/Qwen3-Embedding-0.6B, con una caída clara en TREC-COVID. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2.4 GB para los pesos más memoria adicional para activaciones y batches; el repositorio completo ocupa 7.1 GB.
- VRAM estimada para inferencia en int8 ONNX: aproximadamente 1.12 GB para los pesos, más memoria de activaciones.
- GPU recomendadas: H100 para evaluación y despliegue de alto rendimiento (la model card menciona onnxruntime-gpu 1.23.2 sobre H100 con TF32 desactivado); A100 y RTX 4090 son adecuadas para inferencia en producción.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y GPUs con 8 GB o más de VRAM, incluso en fp32; en int8 cabe en GPUs con 4 GB o más.
- Opciones de despliegue: sentence-transformers (PyTorch), ONNX Runtime (>=1.23 para int8), FastEmbed, Qdrant, text-embeddings-inference y CoreML en Mac.
- Latencia y throughput: en CoreML sobre Neural Engine de Mac, aproximadamente 17 ms por consulta. No se han publicado cifras de throughput para GPU en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| papr-embed-code-1-0.6b | 0.6B | 8192 | 1024 | Code retrieval | Apache 2.0 | Hugging Face, ONNX, CoreML, API hosted |
| Qwen/Qwen3-Embedding-0.6B | 0.6B | 8192 | 1024 | Propósito general | Apache 2.0 | Hugging Face |
| papr-embed-schema-1 | no disponible | no disponible | no disponible | Embeddings condicionados por esquema | no disponible | Hugging Face |

Frente a Qwen/Qwen3-Embedding-0.6B, el modelo especializado mejora la recuperación de código pero es igual o peor en prosa general, con caída en TREC-COVID. Para cargas de trabajo mayoritariamente de prosa, la model card recomienda el modelo base. No se dispone de datos de benchmarks comparativos con otros modelos de embeddings de código en la información proporcionada.

## Limitaciones y advertencias

- No es una mejora generalista: en recuperación de texto no relacionado con código rinde igual o peor que Qwen/Qwen3-Embedding-0.6B, con una caída clara en TREC-COVID.
- No acepta esquemas: para embeddings condicionados por esquema debe usarse papr-embed-schema-1.
- Riesgo de alucinación no aplicable directamente (no genera texto), pero la recuperación puede devolver fragmentos irrelevantes si la consulta no se formula con el prefijo de instrucción adecuado.
- El uso correcto exige pooling de último token y normalización L2; FastEmbed usa mean pooling por defecto para modelos personalizados, lo que produce vectores que parecen normales pero recuperan mal.
- El prefijo `Instruct: ...\nQuery: ...` debe aplicarse solo a las consultas, nunca a los documentos.
- En el build int8, no deben embeberse cadenas vacías: un documento vacío fue el único caso donde int8 se desvió (coseno 0.948 frente a la referencia).
- El build int8 requiere onnxruntime>=1.23.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni sesgos conocidos.
- El modelo tiene pocas descargas (343) y likes (5), por lo que su adopción y validación comunitaria son limitadas.

## Enlaces

- Hugging Face: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b
- Build CoreML: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b-CoreML
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- API hosted: https://memory.papr.ai/v1/embeddings
- FastEmbed: https://github.com/qdrant/fastembed
- Qdrant: https://qdrant.tech
- Ejemplo FastEmbed + Qdrant: `examples/fastembed_qdrant.py` (incluido en el repositorio)
- Instrucciones de tareas: `task_prompts.json` (incluido en el repositorio)
- Resultados ONNX por tarea: `results/onnx_coir.json` (incluido en el repositorio)
