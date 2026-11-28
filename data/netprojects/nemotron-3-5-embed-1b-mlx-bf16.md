# netprojects/Nemotron-3.5-Embed-1B-mlx-bf16

## Resumen

Nemotron-3.5-Embed-1B-mlx-bf16 es la conversion a MLX del modelo de embeddings `nvidia/Nemotron-3.5-Embed-1B-BF16`, realizada por NetProjects para ejecucion nativa en Apple Silicon. No se trata de un modelo generativo, sino de un encoder de recuperacion (retrieval) que proyecta consultas de texto y documentos (texto o imagenes de pagina) en un mismo espacio vectorial, lo que permite busqueda semantica y reranking multimodal. El modelo original es de NVIDIA; este repositorio solo cambia el formato de pesos y el runtime.

La relevancia de esta build radica en que preserva la fidelidad numerica respecto al codigo de referencia de NVIDIA en float32 (coseno minimo de 0,9999 en los conjuntos de prueba reportados) mientras habilita la inferencia en hardware Apple mediante MLX. El modelo conserva la ventana de contexto de hasta 32.768 tokens y el soporte de imagenes de pagina, con vectores L2-normalizados y dimension reducible via Matryoshka.

Con 1.554.710.528 parametros totales y un tamano de repo de 3,1 GB, es un modelo de ~1,5B orientado a produccion de embeddings de alta calidad, con licencia OpenMDW 1.1 y soporte exclusivo de ingles segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje + encoder de vision + proyector); derivada de mistralai/Ministral-3-3B-Instruct-2512-BF16 |
| Parametros totales | 1.554.710.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens |
| Tipos de cuantizacion | bf16 (esta build); el modelo base admite otras cuantizaciones, no detalladas en la informacion disponible |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW License Agreement v1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (MLX); libreria `mlx` |

## Arquitectura y entrenamiento

El modelo es un encoder de embeddings construido sobre una arquitectura multimodal que combina una torre de lenguaje (derivada de Ministral-3-3B-Instruct, Apache-2.0) con un encoder de vision y un proyector que alinea ambas modalidades en un unico espacio vectorial. La salida se obtiene mediante mean pooling y normalizacion L2 calculados en float32, lo que garantiza estabilidad numerica de los vectores. El modelo original de NVIDIA emplea el chat template propio para formatear consultas (`query: …`) y documentos (`passage: …`), y admite una imagen por documento.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF/DPO. La model card de esta conversion se limita a documentar el proceso de conversion a MLX, la preservacion de precision (bf16 en torre de lenguaje, vision encoder y proyector; float32 en normas, pooling y normalizacion) y la fidelidad respecto al codigo de referencia de NVIDIA.

La innovacion tecnica destacable de esta build es la verificacion de equivalencia funcional con la implementacion de referencia: tokenizacion identica en todas las entradas, coseno minimo de 0,9999 y solapamiento top-10 de 1,00 en los conjuntos de prueba (SciFact y documentos largos con imagenes de pagina).

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y similitud de frases (pipeline `feature-extraction`).
- Embeddings multimodales: consultas de texto contra documentos de texto o imagenes de pagina en el mismo espacio vectorial.
- Recuperacion (retrieval) texto-a-texto y texto-a-imagen de documento.
- Vectores Matryoshka: reduccion de dimension (por ejemplo, 1024 o 512) manteniendo calidad razonable.
- Normalizacion L2 de salida, lo que permite usar producto escalar como similitud coseno.
- Soporte de servidor local con endpoints estilo OpenAI `/v1/embeddings` y estilo Cohere/Jina `/v1/rerank`.
- Procesamiento de imagenes como data URLs, base64, rutas, bytes o imagenes PIL.
- Capacidad de reranking (segun el endpoint `/v1/rerank` expuesto por el paquete).
- No se documenta soporte de tool calling, agentes ni modos de razonamiento multi-paso (es un modelo de embeddings, no generativo).

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y articulos como embeddings `passage:` y consultar con `query:`, aprovechando la ventana de 32.768 tokens para fragmentos largos sin truncar.
- Recuperacion multimodal en archivos escaneados: indexar imagenes de pagina (PDFs escaneados, informes) y recuperarlas mediante consultas de texto, gracias al encoder de vision integrado.
- Reranking en pipelines RAG: usar el endpoint `/v1/rerank` para reordenar candidatos recuperados por un retriever de primera etapa, mejorando la precision del contexto entregado al LLM generativo.
- Sistemas de recomendacion de contenido: calcular similitud entre descripciones, articulos o paginas y perfiles de usuario mediante embeddings normalizados.
- Deduplicacion y agrupamiento de documentos: comparar vectores de documentos largos (4K+ tokens) para detectar duplicados o clusterizar tematicamente.
- Busqueda en bases de conocimiento cientificas: el rendimiento medido en SciFact (nDCG@10 de 0,7501) lo hace adecuado para recuperacion de literatura cientifica en ingles.
- Despliegue en estaciones de trabajo Apple: servir embeddings en local sobre Apple Silicon (probado en M5 Max de 128 GB) sin depender de GPU NVIDIA, con un consumo de memoria de ~2,6-4,5 GB en inferencia de texto.

## Benchmarks y rendimiento

Resultados medidos en esta build (referencia: codigo de NVIDIA en float32):

| Test | Metrica | Esta build | Referencia NVIDIA |
|---|---|---|---|
| SciFact (200 consultas/abstracts) | Coseno min/medio vs NVIDIA | 0,9999 / 1,0000 | — |
| SciFact | Top-1 coincidente | 40/40 | — |
| Documentos largos + imagenes | Coseno min/medio vs NVIDIA | 0,9999 / 1,0000 | — |
| Documentos largos + imagenes | Top-10 overlap | 1,00 | — |
| ViDoRe v3 CS (1360 imagenes) | nDCG@10 | 0,7645 | 0,7642 (publicado) |
| ViDoRe v3 CS | Recall@100 | 0,9717 | — |
| ViDoRe v3 CS (Matryoshka 1024-d) | nDCG@10 | 0,7561 | — |
| ViDoRe v3 CS (Matryoshka 512-d) | nDCG@10 | 0,7286 | — |
| SciFact (BEIR, conjunto completo) | nDCG@10 | 0,7501 | — |
| SciFact (BEIR, conjunto completo) | Recall@100 | 0,96 | — |

Rendimiento de velocidad (texto):

| Tokens por entrada | Batch | Docs/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 506 | 1 | 46,7 | 23.629 | 2,64 GB |
| 506 | 16 | 59,2 | 29.956 | 3,16 GB |
| 506 | 64 | 56,25 | 28.462 | 4,47 GB |
| 4090 | 1 | 3,94 | 16.124 | 2,95 GB |
| 4090 | 16 | 3,99 | 16.307 | 6,7 GB |
| 4090 | 64 | 3,93 | 16.087 | 19,97 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~2,6-4,5 GB para entradas de ~506 tokens en texto; hasta ~20 GB con batch 64 y entradas de 4090 tokens.
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada (build y pruebas realizadas en ese equipo).
- Compatible con Apple Silicon mediante MLX; no se documenta soporte para GPU NVIDIA en esta build (el modelo base original de NVIDIA si esta pensado para CUDA).
- Cabe en equipos consumer Apple con memoria unificada de 16 GB o superior para uso de texto; para lotes grandes o documentos de 4K+ tokens se recomienda 32 GB o mas.
- Opciones de despliegue: paquete `nemotron-retrieval-mlx` (pip install desde GitHub), servidor local con endpoints `/v1/embeddings` y `/v1/rerank`; runtime MLX, mlx-lm y mlx-vlm.
- Throughput medido: 46,7-59,2 docs/s con entradas de 506 tokens en Apple M5 Max; 3,9 docs/s con entradas de 4090 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Runtime |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-mlx-bf16 | 1,55B | 32.768 | Si (texto + imagen) | OpenMDW 1.1 | MLX (Apple Silicon) |
| nvidia/Nemotron-3.5-Embed-1B-BF16 | 1,55B | 32.768 | Si (texto + imagen) | OpenMDW 1.1 | Transformers / CUDA |
| Modelos de embeddings texto de ~1B (categoria general) | ~1B | variable | No | variable | variable |

La comparacion directa con alternativas concretas de la misma categoria no esta disponible en la informacion proporcionada; el unico comparable documentado es el modelo base original de NVIDIA, del que esta build es una conversion de formato con fidelidad numerica verificada.

## Limitaciones y advertencias

- Soporte exclusivo de ingles: la model card declara `language: en`; el rendimiento en otros idiomas no esta documentado y probablemente sea inferior.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinacion no aplica en el sentido generativo, pero la recuperacion puede devolver documentos semanticamente proximos pero factualmente irrelevantes; conviene validar con reranking.
- La licencia OpenMDW 1.1 es distinta de Apache-2.0 y debe revisarse antes de uso comercial; el repositorio incluye el archivo `LICENSE` y un `NOTICE` por la dependencia de Ministral-3-3B (Apache-2.0).
- Esta build esta pensada exclusivamente para Apple Silicon con MLX; no es portable a CUDA ni a otros runtimes sin reconversion.
- El modelo base puede presentar sesgos derivados de sus datos de entrenamiento (no documentados en la informacion disponible).
- El rendimiento en documentos muy largos (>4K tokens) se ha medido solo en un conjunto reducido (3 documentos largos, 8 imagenes), por lo que la robustez a escalas mayores no esta completamente caracterizada.
- No afiliado a NVIDIA: soporte y mantenimiento dependen de NetProjects.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Nemotron-3.5-Embed-1B-mlx-bf16
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Codigo del paquete: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- NetProjects: https://netprojects.com
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
