# IA0x00/all-MiniLM-L6-v2-codesage

## Resumen

`IA0x00/all-MiniLM-L6-v2-codesage` es una distribucion derivada en formato ONNX del modelo de embeddings de frases `sentence-transformers/all-MiniLM-L6-v2` (revision `c9745ed1d9f207416be6d2e6f8de32d1f16199bf`), publicado por el usuario IA0x00 para el indexador de codigo CodeSage. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los del modelo original de Sentence-Transformers / Microsoft, con la unica diferencia de una conversion a fp16 del backbone en el grafo destinado a CUDA. El repositorio empaqueta dos grafos ONNX con el pooling (media enmascarada) y la normalizacion L2 ya integrados en el propio grafo, de modo que la salida es directamente un vector de 384 dimensiones listo para similitud coseno.

El problema que resuelve es de eficiencia en indexacion: CodeSage usa este modelo para generar embeddings de fragmentos de codigo y necesitaba reducir el coste de indexado en GPU sin alterar la calidad de recuperacion. Segun las mediciones del autor, el grafo fp16 con fusions del optimizador de ONNX Runtime reduce el tiempo de indexacion de 325 ficheros Rust (7.663 fragmentos) de 24,43 s a 7,21 s y el pico de VRAM de 7.629 MiB a 885 MiB, manteniendo paridad top-1 en 20 de 20 consultas y solapamiento top-10 de 1,0000.

Es relevante para quien construya pipelines de busqueda semantica sobre codigo o texto con requisitos estrictos de latencia y memoria, porque ofrece un artefacto ONNX portable (CPU, CoreML, CUDA) con preprocesado incorporado y verificacion por sha256, aunque su alcance es acotado: es una optimizacion de inferencia, no una mejora de capacidad del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM, 6 capas) heredado de `all-MiniLM-L6-v2`; exportado a grafos ONNX |
| Parametros totales | no disponible (el modelo base MiniLM-L6 tiene aproximadamente 22,7 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el modelo base admite secuencias de hasta 256 tokens y las entradas ONNX son `[batch_size, seq]` |
| Tipos de cuantizacion | fp32 (grafo portable) y fp16 en el backbone del grafo CUDA; no se documentan otras cuantizaciones (int8, etc.) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | ONNX (`onnx/model.onnx`, `onnx/model_cuda_fp16.onnx`) mas `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `all-MiniLM-L6-v2`: un encoder transformer MiniLM de 6 capas destilado, orientado a generar embeddings de frases de 384 dimensiones. Este repositorio no aporta entrenamiento propio; los pesos son identicos a los upstream salvo la conversion a fp16 del backbone en el grafo CUDA. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO, ya que la model card no lo detalla.

La innovacion tecnica esta en la exportacion a ONNX. El grafo `onnx/model.onnx` usa opset-14 con masked mean pool y normalizacion L2 estandar, y es portable entre CPU, CoreML y CUDA. El grafo `onnx/model_cuda_fp16.onnx` aplica las fusions del optimizador BERT de ONNX Runtime: `EmbedLayerNormalization`, 6 nodos `Attention`, 12 `SkipLayerNormalization` y 6 `BiasGelu`, con backbone en fp16 e interfaz de entrada/salida en int64/fp32, y un pooling en fp32 nativo de GPU. En ambos casos el pooling sobre la mascara de atencion (con proteccion frente a mascaras totalmente a cero) y la normalizacion L2 forman parte del grafo, por lo que el consumidor no debe aplicar pooling adicional. Las entradas son `input_ids`, `attention_mask` y `token_type_ids` en int64 con forma `[batch_size, seq]`, y la salida es `sentence_embedding` con forma `[batch_size, 384]`.

## Capacidades

- Generacion de embeddings de frases y fragmentos de texto/codigo: salida de 384 dimensiones, media enmascarada y normalizada L2, apta para similitud coseno directa.
- Busqueda semantica y recuperacion densa (dense retrieval) sobre corpus de codigo o documentacion.
- Extraccion de caracteristicas (`feature-extraction`) y similitud entre frases (`sentence-similarity`), segun los tags del repositorio.
- Ejecucion en CPU, CoreML y CUDA mediante el grafo portable; ejecucion optimizada en GPU CUDA mediante el grafo fp16 con fusions.
- Procesamiento por lotes (`batch_size` dinamico) con pooling integrado en el grafo.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un encoder de embeddings.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Indexacion de repositorios de codigo para busqueda semantica: el grafo fp16 con fusions reduce el tiempo de indexado de 7.663 fragmentos de 24,43 s a 7,21 s y el pico de VRAM de 7.629 MiB a 885 MiB en una RTX 4080 Laptop, lo que permite indexar proyectos grandes en GPU de consumo sin agotar memoria.
- Recuperacion densa en asistentes de codigo: integrado en CodeSage o en pipelines propios, genera embeddings de consultas y fragmentos para recuperar los ficheros mas relevantes; el benchmark `laravel-framework` mostro paridad exacta en `miss_rate`, `median_first`, `recall@5`, `recall@10` y `mean_tokens_to_hit` frente al modelo upstream fp32.
- Deduplicacion y clustering de fragmentos de codigo: al producir vectores normalizados de 384 dimensiones, permite agrupar fragmentos similares por similitud coseno en pipelines de analisis estatico o limpieza de corpus.
- Busqueda semantica sobre documentacion tecnica: el grafo portable `onnx/model.onnx` puede ejecutarse en CPU o CoreML en entornos sin GPU, sirviendo para indexar y consultar documentacion con latencias moderadas.
- Sistemas de recomendacion de codigo o fragmentos reutilizables: los embeddings permiten puntuar la similitud entre un snippet de entrada y un catalogo de ejemplos indexado previamente.
- Clasificacion y filtrado por similitud en pipelines de CI: al ser un artefacto ONNX determinista con hashes verificables, puede incorporarse a validaciones automatizadas que comparen fragmentos contra una referencia sin depender de frameworks de deep learning completos.
- Despliegue en entornos con memoria limitada: el grafo CUDA fp16 con un pico de 885 MiB cabe en GPUs de consumo y en instancias cloud pequenas, habilitando recuperacion semantica en servicios de bajo coste.

## Benchmarks y rendimiento

Mediciones del autor con ONNX Runtime 1.24.4 en una RTX 4080 Laptop GPU, indexando 325 ficheros Rust (7.663 fragmentos) con CodeSage:

| Grafo y runtime | Tiempo de indexado completo | Delta de VRAM pico | Paridad top-1 en 20 consultas | Solapamiento top-10 de ficheros |
|---|---:|---:|---:|---:|
| Upstream fp32 (CodeSage v0.54.0) | 24,43 s | 7.629 MiB | referencia | referencia |
| `model_cuda_fp16.onnx` (con mejoras de batching/arena de CodeSage) | 7,21 s | 885 MiB | 20/20 | 1,0000 |

En el benchmark de recuperacion densa de 5 casos sobre `laravel-framework` (sin reranker), `miss_rate`, `median_first`, `recall@5`, `recall@10` y `mean_tokens_to_hit` coincidieron de forma identica, con el indexado reducido de 63,72 s a 13,02 s.

No se han publicado resultados de benchmarks en la informacion disponible para metricas estandar de NLP (MMLU, HumanEval, GSM8K, MTEB, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta un pico de 885 MiB con el grafo CUDA fp16 durante la indexacion por lotes de 7.663 fragmentos; el grafo fp32 portable requiere menos memoria por lote, pero no se documenta una cifra concreta.
- GPU recomendadas: RTX 4080 Laptop GPU es la plataforma medida; por el reducido consumo de memoria, cualquier GPU CUDA con al menos 1-2 GB libres deberia ser suficiente, aunque no se aportan mediciones en otras GPU.
- Cabe en GPU de consumo: si, segun la medicion en RTX 4080 Laptop; no se documentan pruebas en GTX, RTX 30xx u otras gamas.
- Opciones de despliegue: ONNX Runtime 1.24.4 con execution providers CUDA, CPU y CoreML. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de embeddings de este tipo.
- Latencia y throughput: indexado de 7.663 fragmentos en 7,21 s (aproximadamente 1.063 fragmentos/s) con el grafo fp16 en la RTX 4080 Laptop; no se aportan cifras de latencia por consulta individual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `IA0x00/all-MiniLM-L6-v2-codesage` | no disponible (base MiniLM-L6) | no disponible (entradas `[batch, seq]`) | ONNX fp32 y fp16 | Apache-2.0 | Grafos con pooling y L2 integrados; optimizado para CodeSage |
| `sentence-transformers/all-MiniLM-L6-v2` | no disponible | no disponible | PyTorch (safetensors) | Apache-2.0 | Modelo upstream; requiere pooling externo; sin fusions ONNX |
| Otros derivados ONNX de MiniLM | no disponible | no disponible | ONNX | segun upstream | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de otros tamanos o familias (por ejemplo, `bge-small`, `e5-small` o `gte-small`) en terminos de rendimiento medido.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos a `all-MiniLM-L6-v2` salvo la conversion fp16 del backbone CUDA; no cabe esperar mejoras de calidad respecto al upstream.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de robustez; al ser un encoder de embeddings, el riesgo se traslada a la recuperacion (falsos positivos por similitud superficial), no a la generacion.
- El contexto maximo no se especifica en la informacion disponible; el modelo base esta limitado a secuencias cortas, lo que puede truncar fragmentos de codigo largos.
- Idiomas soportados no disponibles; el modelo base esta orientado principalmente a ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- El grafo `model_cuda_fp16.onnx` esta pensado para el execution provider CUDA de ONNX Runtime; su uso en CPU u otros backends no esta soportado ni medido.
- El pooling y la normalizacion L2 ya estan en el grafo: aplicar pooling adicional en el consumidor alteraria los embeddings.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribucion a Sentence-Transformers / Microsoft y verificar los terminos del modelo upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-22; no hay evidencia de adopcion ni mantenimiento por parte de la comunidad.
- El benchmark se limita a un corpus Rust y a un benchmark de 5 casos sobre `laravel-framework`; la generalizacion a otros lenguajes o dominios no esta validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IA0x00/all-MiniLM-L6-v2-codesage
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio CodeSage: https://github.com/iliaal/codesage
- Script de derivacion: `scripts/derive-minilm-onnx.py` en el repositorio CodeSage
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
