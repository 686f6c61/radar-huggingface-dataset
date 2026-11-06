# netprojects/Nemotron-3.5-Rerank-8B-mlx-8bit

## Resumen

Nemotron-3.5-Rerank-8B-mlx-8bit es una conversion al framework MLX de Apple Silicon del modelo de reranking multimodal Nemotron-3.5-Rerank-8B-BF16 desarrollado por NVIDIA. El modelo original puntua la relevancia entre una consulta (query) y un documento que puede ser texto, una imagen de pagina o ambos, devolviendo un logit de relevancia. Esta version, mantenida por NetProjects (Paris Michalas), no modifica el comportamiento del modelo: solo cambia el formato de pesos y reduce la precision de la torre de lenguaje a 8 bits.

La arquitectura subyacente es de tipo Mistral3, con una torre de lenguaje de aproximadamente 8.381 millones de parametros y un encoder de vision que procesa imagenes de documento. El contexto maximo es de 32.768 tokens y admite una imagen por documento. Es relevante porque permite ejecutar un reranker multimodal de 8B en hardware Apple Silicon con un consumo de memoria contenido (8,7 GB en disco, picos de 8,82 GB en inferencia de texto corto), algo que hasta ahora requeria GPU dedicadas para el modelo en BF16.

La licencia del modelo original es OpenMDW-1.1, y el modelo base de NVIDIA se construye sobre mistralai/Ministral-3-8B-Instruct-2512-BF16 (Apache-2.0). El modelo esta disenado principalmente para ingles y su caso de uso central es el reranking en pipelines de recuperacion (RAG) con soporte de documentos visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3 (torre de lenguaje transformer + encoder de vision + proyector + cabeza de scoring) |
| Parametros totales | 8.381.155.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 8-bit affine con group size 64 en la torre de lenguaje; vision encoder y proyector en bf16; norms, score head y mean pooling en float32 |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW-1.1 (modelo original de NVIDIA); modelo base Ministral-3-8B-Instruct bajo Apache-2.0 |
| Formato de pesos | safetensors (MLX), 8,7 GB en disco; repo de 9,3 GB |
| Pipeline | text-classification (reranking) |
| Modelo base | nvidia/Nemotron-3.5-Rerank-8B-BF16 (revision f88f8d9104726747791283ab156d2fcdb29e90a7) |
| Libreria | mlx |
| Hardware de referencia | Apple M5 Max (128 GB) |

## Arquitectura y entrenamiento

El modelo es un reranker multimodal construido sobre Mistral3, que combina una torre de lenguaje transformer con un encoder de vision y un proyector que alinea las representaciones visuales con el espacio del lenguaje. La salida no es texto generativo sino un logit de relevancia calculado a partir de un pooling (mean pooling en float32) sobre las representaciones del par query-documento. Admite como documento texto plano, una imagen de pagina o una combinacion de texto e imagen, con un maximo de una imagen por documento.

La informacion proporcionada no detalla el volumen ni la composicion del dataset de entrenamiento, ni si se aplicaron fases de RLHF o DPO; estos datos corresponden a la model card de NVIDIA, que no se incluye en la informacion disponible. La innovacion tecnica de esta build concreta es la cuantizacion selectiva: solo la torre de lenguaje se cuantiza a 8 bits (affine, group size 64), mientras que el encoder de vision, el proyector, las normas, la cabeza de scoring y el mean pooling se mantienen en bf16 o float32 para preservar la fidelidad numerica de la puntuacion. Segun las mediciones del autor, la tokenizacion es identica a la del original en todas las entradas probadas.

## Capacidades

- Reranking de pares query-documento devolviendo un logit de relevancia, con soporte de `top_k`.
- Procesamiento de documentos multimodales: texto, imagen de pagina (path, bytes, PIL image o data URL) o combinacion de texto e imagen.
- Manejo de documentos largos, con contexto de hasta 32.768 tokens.
- Plantilla de chat de NVIDIA con roles `query` y `document`.
- Servidor local con endpoints estilo OpenAI (`/v1/embeddings`) y estilo Cohere/Jina (`/v1/rerank`), con imagenes en data URL o base64.
- Integracion en pipelines de recuperacion de dos etapas junto a un modelo de embeddings (el autor cita Nemotron-3.5-Embed-8B-mlx-8bit como primera etapa).
- Capacidad multilingue limitada al ingles.
- No es un modelo generativo: no produce texto, solo puntuaciones de relevancia.

## Casos de uso

- Reranking en pipelines RAG: se usa como segunda etapa tras un retriever o modelo de embeddings, reordenando los candidatos por relevancia real. El autor mide mejoras en nDCG@10 sobre paginas de documentacion tecnica (ViDoRe v3 Computer Science: de 0,7952 a 0,8315).
- Busqueda sobre documentos escaneados: al aceptar imagenes de pagina, permite rerankear resultados de PDFs y documentos digitalizados sin necesidad de OCR previo.
- Busqueda tecnica multimodal: combinacion de texto e imagen (por ejemplo, "Figure 3" con un grafico adjunto) para localizar figuras y tablas dentro de manuales.
- Atencion al cliente con base de conocimiento: reranking de articulos de ayuda y FAQ en ingles para mejorar la precision de las respuestas generadas por un LLM posterior.
- Investigacion academica: filtrado de abstracts y articulos por relevancia; el autor reporta un caso con 1.000 abstracts de SciFact, aunque con una ligera perdida de nDCG@10 (de 0,9019 a 0,8847), lo que sugiere evaluar el umbral de reranking por dominio.
- Prototipado local en Mac: desarrollo y validacion de sistemas de recuperacion en Apple Silicon sin GPU dedicada, gracias a los 8,7 GB de pesos y picos de memoria de 8,82 GB con entradas de 513 tokens.
- Evaluacion de calidad de retrieval: uso del logit de relevancia como metrica continua para auditar y comparar retrievers.

## Benchmarks y rendimiento

Fidelidad respecto al codigo de NVIDIA en float32 (medido por el autor de la conversion):

| Test set | Pares | Spearman | Mismo documento top | Diferencia maxima de score |
|---|---|---|---|---|
| SciFact queries x abstracts | 400 | 0,9998 | 37/40 | 0,015 |
| Documentos largos (4K+ tokens) y paginas de imagen | 120 (14 largos, 31 imagen) | 0,9999 | 10/10 | 0,020 |

Reranking (primera etapa: Nemotron-3.5-Embed-8B-mlx-8bit; nDCG@10 antes y despues):

| Test | Queries | Rerankeados | Solo embeddings | Tras reranking |
|---|---|---|---|---|
| ViDoRe v3 Computer Science (paginas de imagen) | 50 | top 10 | 0,7952 | 0,8315 |
| SciFact slice (1.000 abstracts) | 50 | top 20 | 0,9019 | 0,8847 |

Velocidad (texto, con otros servidores de modelo detenidos):

| Tokens por entrada | Batch | Pares/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 513 | 1 | 5,56 | 2.850 | 8,82 GB |
| 513 | 16 | 4,93 | 2.531 | 9,74 GB |
| 513 | 64 | 5,0 | 2.563 | 12,62 GB |
| 4.097 | 1 | 0,55 | 2.255 | 9,44 GB |
| 4.097 | 16 | 0,55 | 2.261 | 16,77 GB |
| 4.097 | 64 | 0,55 | 2.240 | 41,75 GB |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo, algo esperable al tratarse de un reranker y no de un modelo generativo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,82 GB de pico con entradas de 513 tokens y batch 1; 9,44 GB con entradas de 4.097 tokens y batch 1; hasta 41,75 GB con batch 64 y entradas largas.
- Hardware objetivo: Apple Silicon con MLX. El autor lo construyo y probo en un Apple M5 Max con 128 GB de memoria unificada.
- Cabe en Mac consumer con memoria unificada suficiente: con 16 GB se puede ejecutar con entradas cortas y batches pequenos; para lotes grandes o documentos largos se recomienda 32 GB o mas.
- No es un formato para GPU NVIDIA/AMD: al ser MLX, no se despliega con vLLM, TGI ni llama.cpp. Para CUDA habria que usar el modelo original en BF16 de NVIDIA.
- Opciones de despliegue: libreria `nemotron_mlx` (instalable desde el repositorio `internet-projects/nemotron-retrieval-mlx`) y servidor local con `python -m nemotron_mlx.server`, que expone `/v1/embeddings` y `/v1/rerank`.
- Throughput medido: 5,56 pares/s con entradas de 513 tokens y batch 1; 0,55 pares/s con entradas de 4.097 tokens, independientemente del batch (el cuello de botella esta en la longitud de entrada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Formato | Licencia |
|---|---|---|---|---|---|
| Nemotron-3.5-Rerank-8B-mlx-8bit (esta ficha) | 8,38B | 32.768 | Si (texto + imagen) | MLX safetensors 8-bit | OpenMDW-1.1 |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 | 8,38B | 32.768 | Si (texto + imagen) | safetensors BF16 | OpenMDW-1.1 |
| Nemotron-3.5-Embed-8B-mlx-8bit | no disponible | no disponible | no disponible | MLX safetensors 8-bit | no disponible |

La informacion disponible no incluye datos de otros rerankers comparables (por ejemplo, de la familia BGE o Cohere), por lo que la comparativa se limita a las variantes del mismo modelo citadas por el autor.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado.
- No es un modelo generativo: no responde preguntas ni produce texto, solo puntuaciones de relevancia.
- El reranking no mejora siempre: en el caso de SciFact el nDCG@10 cayo de 0,9019 a 0,8847, por lo que conviene validar por dominio y ajustar el numero de candidatos rerankeados.
- Requiere hardware Apple Silicon y la libreria MLX; no es portable a CUDA sin recurrir al modelo original de NVIDIA.
- El consumo de memoria crece de forma marcada con batches grandes y entradas largas (hasta 41,75 GB en el caso medido), lo que puede superar la memoria de Macs de gama media.
- Riesgo de alucinacion no aplica en el sentido generativo, pero el score de relevancia puede ser poco fiable en dominios alejados de los datos de entrenamiento del modelo original.
- La licencia OpenMDW-1.1 impone condiciones propias; debe revisarse el fichero LICENSE antes de uso comercial. El modelo base Ministral-3-8B-Instruct esta bajo Apache-2.0, con avisos en NOTICE y THIRD_PARTY_NOTICES.md.
- Esta build no esta afiliada a NVIDIA; cualquier problema de calidad debe contrastarse con el modelo original en BF16.
- El repositorio tiene muy poca traccion (18 descargas, 0 likes) y una unica revision, por lo que la validacion externa es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Nemotron-3.5-Rerank-8B-mlx-8bit
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Codigo de conversion y servidor: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
- Modelo base de la arquitectura: mistralai/Ministral-3-8B-Instruct-2512-BF16 (Apache-2.0)
