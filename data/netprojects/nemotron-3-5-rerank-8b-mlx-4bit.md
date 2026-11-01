# netprojects/Nemotron-3.5-Rerank-8B-mlx-4bit

## Resumen

Nemotron-3.5-Rerank-8B-mlx-4bit es una conversion a formato MLX del modelo de reranking multimodal NVIDIA Nemotron-3.5-Rerank-8B-BF16, realizada por NetProjects para su ejecucion en Apple Silicon. El modelo original, desarrollado por NVIDIA, resuelve el problema de puntuar la relevancia entre una consulta y un documento, donde el documento puede ser texto, una imagen de pagina o ambos. Devuelve un logit de relevancia en lugar de una generacion de texto libre, lo que lo encaja en pipelines de recuperacion (retrieval) y reordenacion (reranking) de sistemas RAG.

La conversion mantiene la torre de lenguaje cuantizada a 4 bits (cuantizacion afina con grupo de 64) mientras que el codificador visual, el proyector, las normas, la cabeza de puntuacion y el pooling se conservan en bf16 o float32 para preservar la fidelidad numerica. El resultado ocupa 5,0 GB y mantiene la misma interfaz de entrada que el modelo original: plantilla de chat de NVIDIA con roles `query` y `document`, una imagen por documento y hasta 32.768 tokens de contexto.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un reranker de 8.381 millones de parametros en hardware de consumo de Apple; por otro, la model card documenta mediciones de fidelidad y velocidad frente a la implementacion de referencia en transformers, lo que facilita evaluar el coste del compromiso precision/rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje Mistral3 + codificador visual), reranker |
| Parametros totales | 8.381.155.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit affine, group size 64 (torre de lenguaje); vision encoder y proyector en bf16; norms, score head y mean pooling en float32 |
| Idiomas soportados | en |
| Licencia | OpenMDW License Agreement v1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un reranker multimodal construido sobre una arquitectura tipo Mistral3, con una torre de lenguaje y un codificador visual que procesa imagenes de pagina. La salida no es texto generado sino un logit de relevancia obtenido mediante mean pooling y una cabeza de puntuacion. La conversion a MLX conserva el codificador visual y el proyector en bf16, las normas y la cabeza de puntuacion en float32, y cuantiza unicamente la torre de lenguaje a 4 bits con grupo de 64. El modelo base es nvidia/Nemotron-3.5-Rerank-8B-BF16, que a su vez se apoya en mistralai/Ministral-3-8B-Instruct-2512-BF16 (Apache-2.0).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original dentro de la informacion proporcionada. La model card indica que la tokenizacion es identica a la del modelo original en todas las entradas probadas y que la revision upstream utilizada es `f88f8d9104726747791283ab156d2fcdb29e90a7`. La innovacion tecnica destacable de esta build es la cuantizacion selectiva: solo se cuantiza la torre de lenguaje, preservando en mayor precision los componentes que afectan directamente a la puntuacion final.

## Capacidades

- Reranking de pares consulta-documento: puntua la relevancia entre una query y un documento y devuelve un logit de relevancia.
- Entrada multimodal: acepta documentos en texto, imagen de pagina o una combinacion de ambos (texto e imagen en el mismo documento).
- Contexto largo: soporta hasta 32.768 tokens por entrada, lo que permite reordenar documentos extensos o paginas completas.
- Integracion en pipelines de retrieval: pensado para reordenar candidatos recuperados por un buscador vectorial o lexico.
- Servidor local con APIs compatibles: expone endpoints estilo OpenAI `/v1/embeddings` y estilo Cohere/Jina `/v1/rerank`, con imagenes en data URLs o base64.
- Soporte de lotes (batching): la model card reporta mediciones con batch 1, 16 y 64.
- Idioma: entrenado y evaluado en ingles (`en`); no se documenta soporte multilingue.
- No se documenta soporte de tool calling, function calling ni modo agente en la informacion disponible.

## Casos de uso

- Reordenacion en pipelines RAG: tras recuperar candidatos con un buscador vectorial, el modelo puntua cada par consulta-documento y reordena por relevancia antes de pasarlos al generador. Su contexto de 32.768 tokens permite reordenar fragmentos largos sin truncar.
- Busqueda sobre documentacion tecnica con figuras: al aceptar imagenes de pagina, puede puntuar paginas escaneadas o capturas de documentacion que combinan texto y diagramas, algo que un reranker puramente textual no cubre.
- Atencion al cliente sobre base de conocimiento: reordenar articulos de ayuda y FAQ frente a la consulta del usuario para seleccionar los fragmentos mas relevantes antes de la respuesta.
- Recuperacion en literatura cientifica: la model card incluye una prueba sobre SciFact (consultas contra abstracts), lo que lo hace adecuado para reordenar resultados en buscadores academicos.
- Busqueda empresarial multimodal: reordenar resultados que incluyen capturas de pantalla, graficos o tablas renderizadas como imagen junto a texto.
- Evaluacion y monitorizacion de calidad de retrieval: usar las puntuaciones como metrica para comparar embeddings o estrategias de chunking en un sistema de recuperacion.
- Prototipado local en Apple Silicon: desarrollar y validar el pipeline de reranking en un portatil o estacion de trabajo Apple antes de desplegar en servidores con GPU.

## Benchmarks y rendimiento

La model card reporta mediciones de fidelidad frente a la implementacion de referencia de NVIDIA en transformers (float32) y de velocidad en esta build. No se publican resultados de benchmarks estandar de reranking (por ejemplo, nDCG en BEIR) en la informacion disponible.

Fidelidad frente al codigo de NVIDIA:

| Conjunto de prueba | Pares | Spearman | Mismo documento top | Diferencia maxima de score |
|---|---|---|---|---|
| SciFact queries x abstracts | 400 | 0.9920 | 37/40 | 0.096 |
| Documentos largos (4K+ tokens) e imagenes de pagina | 120 (14 largos, 31 imagen) | 0.9975 | 9/10 | 0.487 |

Velocidad (texto):

| Tokens por entrada | Batch | Pares/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 513 | 1 | 5.86 | 3.007 | 5.05 GB |
| 513 | 16 | 5.17 | 2.652 | 5.77 GB |
| 513 | 64 | 5.23 | 2.681 | 8.64 GB |
| 4097 | 1 | 0.58 | 2.378 | 5.46 GB |
| 4097 | 16 | 0.58 | 2.365 | 12.8 GB |
| 4097 | 64 | 0.57 | 2.346 | 37.77 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: alrededor de 5,0 GB para el modelo; la model card reporta 5,05 GB de memoria pico con entradas de 513 tokens y batch 1, y 37,77 GB con entradas de 4.097 tokens y batch 64.
- Hardware objetivo: Apple Silicon con MLX. La build se construyo y probo en un Apple M5 Max con 128 GB de memoria unificada.
- Cabe en GPU de consumo Apple: si, en equipos Apple Silicon con al menos 8 GB de memoria unificada para lotes pequenos; para lotes grandes o entradas largas se necesita bastante mas memoria (hasta 37,77 GB en el caso medido de batch 64 con 4.097 tokens).
- Despliegue: libreria `mlx` y paquete `nemotron-retrieval-mlx` (instalable desde GitHub); incluye un servidor local con endpoints `/v1/embeddings` y `/v1/rerank`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta build.
- Latencia y throughput: 5,86 pares/s con 513 tokens y batch 1; 0,58 pares/s con 4.097 tokens y batch 1. El throughput en tokens/s se mantiene estable en torno a 2.300-3.000 tokens/s independientemente del batch en las mediciones reportadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Nemotron-3.5-Rerank-8B-mlx-4bit | 8.381 M | 32.768 | Si (texto + imagen) | OpenMDW 1.1 | HuggingFace, MLX |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 | 8.381 M (bf16) | 32.768 | Si (texto + imagen) | OpenMDW 1.1 | HuggingFace, transformers |
| mistralai/Ministral-3-8B-Instruct-2512-BF16 | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |

La comparativa con otros rerankers de la misma categoria (por ejemplo, modelos de la familia BGE reranker o Cohere Rerank) no esta disponible en la informacion proporcionada. La alternativa mas directa es el modelo original de NVIDIA en bf16, que ofrece la misma funcionalidad pero requiere mas memoria y no esta optimizado para Apple Silicon.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado.
- Fidelidad numerica: aunque la correlacion con la referencia es alta (Spearman 0,9920 y 0,9975), la diferencia maxima de score llega a 0,487 en el conjunto con documentos largos e imagenes, y el documento top coincide en 37/40 y 9/10 casos respectivamente. No es una replica exacta del modelo en float32.
- Licencia: OpenMDW License Agreement v1.1, no es una licencia permisiva tipo Apache o MIT. Es necesario revisar el fichero `LICENSE` antes de uso comercial. El modelo base Ministral-3-8B-Instruct es Apache-2.0, y el repositorio incluye `NOTICE` y `THIRD_PARTY_NOTICES.md`.
- Dependencia de hardware: la build esta pensada exclusivamente para Apple Silicon via MLX; no es portable a CUDA sin reconversion.
- Alucinacion: al ser un reranker que devuelve un logit, no genera texto, pero las puntuaciones pueden ser poco calibradas en dominios alejados de los datos de entrenamiento.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Una imagen por documento: la interfaz limita a una imagen por documento, lo que puede ser restrictivo para paginas con multiples figuras.
- No afiliado a NVIDIA: la build la mantiene NetProjects; los problemas de la conversion deben reportarse al repositorio de NetProjects, no a NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/netprojects/Nemotron-3.5-Rerank-8B-mlx-4bit
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Modelo base de la torre de lenguaje: mistralai/Ministral-3-8B-Instruct-2512-BF16 (referenciado en la model card)
- Codigo de inferencia y servidor: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
