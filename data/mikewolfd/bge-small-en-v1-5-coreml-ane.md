# mikewolfd/bge-small-en-v1.5-coreml-ane

## Resumen

`mikewolfd/bge-small-en-v1.5-coreml-ane` es una conversión precompilada del modelo de embeddings `BAAI/bge-small-en-v1.5` a formato Core ML, optimizada para ejecutarse en la Neural Engine (ANE) de los chips Apple Silicon. No es un modelo nuevo: es un artefacto de despliegue que empaqueta el encoder BERT-small de BGE en nueve variantes de Core ML con precisión FP16, cubriendo distintos tamaños de lote y secuencia (`B=1, S=24..512` y `B=8, S=256`), junto con tokenizer y tablas de búsqueda binarias.

El objetivo es acelerar la generación de embeddings en Macs con M-series, superando tanto a `mlx-embeddings` en GPU como a otras implementaciones públicas de Core ML. Según la model card, en un corpus de 1.000 documentos alcanza 200.646 tok/s en una base M5 y 187.150 tok/s en un M4 Pro, frente a los 34.318 y 31.608 tok/s de una implementación Core ML pública FP16, lo que supone entre 5,85× y 5,92× de mejora.

Es relevante para desarrolladores que construyen pipelines de búsqueda semántica o RAG en local sobre macOS y quieren minimizar latencia y consumo energético delegando la inferencia en la ANE. El modelo subyacente es un encoder de 33 millones de parámetros con contexto de 512 tokens y embeddings de 384 dimensiones, distribuido bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-small), exportado a Core ML para Neural Engine |
| Parametros totales | 33 millones (modelo base BGE-small-en-v1.5); no confirmado en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (bucket maximo `S=512`); buckets intermedios de 24, 64, 128, 192, 320, 384, 448 |
| Tipos de cuantizacion | FP16 (Core ML); tablas de búsqueda FP16 y binarias incluidas; el modelo base admite cuantizacion adicional via MLX |
| Idiomas soportados | Ingles (modelo base `bge-small-en-v1.5`); no se declaran otros idiomas en la model card |
| Licencia | MIT |
| Formato de pesos | Core ML `.mlmodelc` (FP16), tablas de búsqueda y tokenizer; repo de 0,1 GB |

## Arquitectura y entrenamiento

El artefacto no entrena ningun modelo: exporta el encoder `BAAI/bge-small-en-v1.5` a Core ML. Se trata de un transformer tipo BERT-small con 33 millones de parametros, 384 dimensiones de embedding y ventana de 512 tokens, entrenado originalmente por BAAI con objetivos de contraste y fine-tuning para retrieval en ingles. La model card no detalla el dataset ni el proceso de entrenamiento del modelo base.

La innovacion esta en el empaquetado: nueve variantes de Core ML (`bge_b1_s{24,64,128,192,320,384,448,512}_fp16.mlmodelc` y `bge_b8_s256_fp16.mlmodelc`) que permiten al runtime `fast-silicon` elegir el bucket de secuencia y lote mas adecuado para cada batch, evitando recompilaciones y padding innecesario. Se incluyen ademas tablas de busqueda FP16 y binarias, tokenizer y pesos, todo empaquetado para la libreria `fast-bge-small`. El modo `hetero` del runtime reparte la carga entre GPU y ANE, y segun la model card mejora el throughput respecto al uso exclusivo de ANE (por ejemplo, 201.181 tok/s frente a 63.850 tok/s en base M5).

## Capacidades

- Generacion de embeddings de frases y documentos en ingles, con vectores de 384 dimensiones normalizados.
- Busqueda semantica y recuperacion densa (dense retrieval) sobre corpus de documentos.
- Re-ranking y similitud coseno para pipelines RAG.
- Ejecucion en Neural Engine de Apple Silicon con precision FP16.
- Soporte de lotes: `B=1` para consultas interactivas y `B=8` con `S=256` para indexacion por lotes.
- Nueve buckets de secuencia (24 a 512 tokens) para minimizar el coste de padding.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un encoder de embeddings.
- No se declaran capacidades multilingues; el modelo base esta orientado a ingles.

## Casos de uso

- Indexacion masiva de documentacion en local: con 200.646 tok/s en base M5, un corpus de un millon de tokens se procesa en unos 5 segundos, lo que permite reindexar bases de conocimiento completas en cada actualizacion sin depender de la nube.
- Busqueda semantica en aplicaciones de escritorio macOS: el modelo se ejecuta en la ANE con 0,79 ms por consulta de 24 tokens (base M5), habilitando autocompletado y busqueda en tiempo real dentro de apps nativas.
- Pipelines RAG sobre documentos privados: al ejecutarse en local no se envian datos a terceros, lo que encaja en entornos con requisitos de confidencialidad (legal, sanidad, banca).
- Deduplicacion y clustering de textos: embeddings por lotes (`B=8`) para agrupar tickets de soporte, articulos o correos y detectar duplicados con similitud coseno.
- Filtrado previo en sistemas de recomendacion: generacion rapida de embeddings de items para recuperacion por vecindad aproximada antes de un re-ranker mas costoso.
- Evaluacion offline de modelos de retrieval: el alto throughput (hasta 13.061 EOT en el benchmark Tier-1 de la model card) permite iterar sobre conjuntos de evaluacion grandes en minutos en lugar de horas.
- Prototipado en portatiles Apple Silicon: al no requerir GPU dedicada, un MacBook con M-series puede servir como entorno de desarrollo y pruebas de pipelines de embeddings.

## Benchmarks y rendimiento

Datos publicados en la model card (rendimiento del artefacto, no calidad de embeddings):

| Workload / suite | Host | `mlx-embeddings` 8-bit GPU | `fast-bge-small` GPU | ANE-only | `fast-bge-small` hetero | Core ML publico FP16 |
|---|---|---:|---:|---:|---:|---:|
| Corpus benchmark (2026-11-24) | Base M5 | 106,96 docs/s | 152.937 tok/s | 63.850 tok/s | 201.181 tok/s | — |
| Corpus benchmark (2026-11-24) | M4 Pro | 123,12 docs/s | 121.730 tok/s | 59.304 tok/s | 192.512 tok/s | — |
| Corpus 1.000 docs (249.303 toks) | Base M5 | — | — | — | 200.646 tok/s (1,85 GB) | 34.318 tok/s (5,85×) |
| Corpus 1.000 docs (249.303 toks) | M4 Pro | — | — | — | 187.150 tok/s (2,09 GB) | 31.608 tok/s (5,92×) |
| Corpus sintetico 993.944 toks | M4 Pro | — | 138.335 tok/s (7,19 s) | 59.261 tok/s (16,77 s) | 189.338 tok/s (5,25 s) | — |
| Query caliente `B=1` 24 tokens | Base M5 | 4,42 ms | 1,29 ms | 0,79 ms | — | 1,61 ms |
| Query caliente `B=1` 24 tokens | M4 Pro | 4,85 ms | 1,98 ms | 0,48-0,49 ms | — | 1,70 ms |
| Tier-1 Retrieval (325 queries) | Base M5 | 133,8 s (1,160 EOT) | — | — | 11,8 s (13,061 EOT, 1,54 GB) | 60,0 s (2,567 EOT) |
| Tier-1 Retrieval (325 queries) | M4 Pro | 117,6 s (1,319 EOT) | — | — | 12,2 s (12,634 EOT, 1,55 GB) | 64,7 s (2,382 EOT) |

No se han publicado resultados de benchmarks de calidad (MTEB, retrieval accuracy) en la informacion disponible; los datos anteriores miden exclusivamente throughput y latencia.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra); requiere Neural Engine y macOS con soporte Core ML.
- VRAM/unificada estimada: el repo ocupa 0,1 GB; los benchmarks reportan picos de memoria de 1,54-2,09 GB durante la recuperacion Tier-1 en modo hetero.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables, el artefacto es Core ML y no se ejecuta en CUDA.
- Cabe en cualquier Mac con chip M-series, incluidos modelos base con 8 GB de memoria unificada.
- Despliegue: runtime `fast-silicon` (libreria `fast-bge-small`); no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,48-0,79 ms por consulta de 24 tokens en ANE; throughput de hasta 201.181 tok/s en modo hetero (base M5).
- No se declaran requisitos para Linux, Windows ni GPUs de otros fabricantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dim. embedding | Licencia | Formato | Notas |
|---|---|---:|---:|---|---|---|
| `mikewolfd/bge-small-en-v1.5-coreml-ane` | 33 M | 512 | 384 | MIT | Core ML | Optimizado para ANE; 200.646 tok/s en M5 |
| `BAAI/bge-small-en-v1.5` (original) | 33 M | 512 | 384 | MIT | safetensors / PyTorch | Referencia de calidad; requiere GPU/CPU generica |
| `mlx-embeddings` 8-bit (mismo base) | 33 M | 512 | 384 | MIT | MLX | 106,96 docs/s en M5; 4,42 ms por query |
| Core ML publico (`sidekickd` FP16) | 33 M | 512 | 384 | no disponible | Core ML | 34.318 tok/s; 1,61 ms por query |

La comparativa se limita al mismo modelo base en distintos runtimes; no se dispone de datos de calidad (MTEB) para comparar con alternativas de distinto tamano como `bge-base` o `e5-small`.

## Limitaciones y advertencias

- Solo ingles: el modelo base `bge-small-en-v1.5` esta entrenado para ingles; el rendimiento en castellano u otros idiomas sera degradado.
- Ventana maxima de 512 tokens: documentos mas largos deben trocearse antes de generar embeddings.
- Exclusivo de Apple Silicon: no se ejecuta en CUDA, ROCm ni CPU generica; limita el despliegue en servidores Linux.
- Dependencia del runtime `fast-silicon` y de la version de Core ML/macOS; cambios de sistema pueden requerir recompilar los `.mlmodelc`.
- Riesgo de alucinacion no aplicable (no genera texto), pero los embeddings pueden producir recuperaciones erroneas en dominios muy especializados.
- Sesgos heredados del corpus de entrenamiento del modelo base (principalmente web en ingles), no documentados en esta model card.
- Sin datos publicados de calidad de retrieval (MTEB) para este artefacto; la model card solo reporta throughput.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario limitados.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base y de las dependencias del runtime.

## Enlaces

- Hugging Face: https://huggingface.co/mikewolfd/bge-small-en-v1.5-coreml-ane
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio del runtime `fast-silicon`: https://github.com/mikewolfd/fast-silicon
