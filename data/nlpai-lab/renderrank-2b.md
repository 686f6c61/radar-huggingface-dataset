# nlpai-lab/RenderRank-2B

## Resumen

RenderRank-2B es un modelo de reranking de documentos desarrollado por nlpai-lab (grupo de NLP e IA de la Universidad de Corea). Se construye mediante fine-tuning sobre el backbone Qwen3-VL-Reranker-2B y cuenta con 2.127.532.032 parametros (aproximadamente 2B) en formato safetensors. Su tesis central, descrita en el articulo "RenderRank: Learning to Rerank Text with Compressed Visual Tokens", consiste en cambiar la modalidad de entrada de los documentos: en lugar de codificar el texto como una secuencia convencional de tokens, RenderRank lo renderiza como imagenes y lo representa mediante tokens visuales comprimidos, mientras que las consultas siguen siendo texto.

El problema que aborda es el coste de contexto en la etapa de reranking dentro de pipelines de recuperacion (RAG, busqueda semantica). Al reducir el numero de tokens necesarios para representar cada documento, cabe mas contenido por par consulta-documento dentro de un presupuesto fijo de contexto. Segun los datos de la model card, RenderRank obtiene una media de 55,96 NDCG@10 en BEIR consumiendo 290,07 tokens de entrada por par, frente a 438,70 tokens de Qwen3-Reranker-4B o 399,11 de bge-reranker-v2-gemma, que rinden 57,99 y 55,82 respectivamente.

Es relevante para desarrolladores que montan sistemas de recuperacion en dos etapas con documentos largos o muchos candidatos, donde el coste por par consulta-documento condiciona la latencia y el numero de candidatos que se pueden rerankear. Su licencia Apache 2.0 y su compatibilidad con endpoints facilitan la integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision-language transformer), ajustada para reranking pairwise; tag `qwen3_vl` |
| Parametros totales | 2.127.532.032 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens, incluyendo consulta, plantilla, texto del documento y tokens visuales |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (unico idioma evaluado, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (requiere `custom_code`; tamano del repositorio 4,3 GB) |

Otros datos de la model card:

| Propiedad | Valor |
|---|---|
| Tipo de modelo | Reranker de documentos pairwise |
| Backbone | Qwen/Qwen3-VL-Reranker-2B |
| Puntuacion | Relevancia si/no (yes/no relevance scoring) |
| Modos de entrada | `text` (puntua texto directamente), `render` (renderiza automaticamente), `image` (paginas de documento ya existentes) |
| Pipeline declarado | text-ranking |
| Descargas / likes | 191 / 11 |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-29 |

## Arquitectura y entrenamiento

RenderRank-2B parte de Qwen3-VL-Reranker-2B, un modelo vision-language de la familia Qwen3-VL, y lo adapta como reranker pairwise con una tarea de puntuacion de relevancia binaria (si/no) entre consulta y documento. La particularidad del enfoque es la representacion del documento: el texto se renderiza como imagenes de pagina que el encoder visual del modelo convierte en tokens visuales comprimidos. La consulta permanece como texto y la relevancia se calcula contra esas representaciones visuales. El modelo soporta tres modos de entrada: texto plano, renderizado automatico en el propio modelo o imagenes de pagina ya existentes aportadas por el usuario.

El pipeline de renderizado esta completamente especificado en la model card: fuente Roboto Regular a 12pt y 96 DPI (16 px), interlineado 1.0 (altura de linea de 16 px), ancho de pagina de 896 px, altura de pagina entre 32 y 896 px redondeada al multiplo de 32 px inmediatamente superior, hasta 56 lineas por pagina, margenes de 0 px, texto negro sobre fondo blanco y antialiasing por defecto de Pillow. Los espacios en blanco, incluidos saltos de parrafo y tabuladores, se normalizan a un unico espacio; las lineas se ajustan al ancho real en pixeles de la fuente y las palabras mas anchas que la pagina se parten por caracter. El desbordamiento continua en paginas sucesivas sin solapamiento, la ultima pagina se ajusta a su contenido y los documentos vacios producen una pagina de 896 x 32 px. Todas las paginas generadas se suministran en orden como un unico documento, lo que produce una unica puntuacion de relevancia; el proceso no se limita a la primera pagina.

Respecto a los datos de entrenamiento, la model card declara los conjuntos `lightonai/embeddings-fine-tuning-filtered-en` y `rlhn/rlhn-100K`, pero no detalla el numero de tokens, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO. Esa informacion no esta disponible en el material consultado.

## Capacidades

- Reranking de documentos pairwise con puntuacion de relevancia binaria (si/no) entre una consulta y un documento.
- Reranking multimodal de entrada: acepta documentos como texto, como renderizado automatico a imagenes o como paginas de imagen ya existentes.
- Compresion de la representacion del documento mediante tokens visuales, con el objetivo de reducir la longitud de entrada por par consulta-documento.
- Manejo de documentos largos: contexto maximo de 32.768 tokens y capacidad de encadenar varias paginas renderizadas en un unico documento.
- Formato conversacional (tag `conversational`) y compatibilidad con `sentence-transformers` y `transformers`.
- Aplicacion interna de la plantilla de chat de reranking: segun la documentacion del endpoint de FriendliAI, la instruccion se pasa directamente y no hay que anteponer manualmente ninguna plantilla al documento.
- Modelo orientado exclusivamente a ingles en la evaluacion publicada.
- No se documentan capacidades de generacion de texto libre, tool calling, function calling, agentes, audio ni modo de razonamiento explicito. No disponible.

## Casos de uso

- Segunda etapa de pipelines RAG: tras una recuperacion inicial con BM25 o embeddings, RenderRank puntua los mejores candidatos y reordena por relevancia. La reduccion de tokens por par permite rerankear mas candidatos dentro del mismo presupuesto de contexto.
- Busqueda documental a gran escala: en corpus con documentos largos, el renderizado a tokens visuales reduce la longitud media de entrada (290,07 tokens por par en la media de BEIR) y por tanto el coste computacional del reranking sobre cientos de consultas.
- Reranking de documentos multiformato: el modo `image` permite puntuar paginas ya digitalizadas o capturas sin necesidad de extraer y limpiar el texto antes.
- Sistemas de pregunta-respuesta sobre documentacion tecnica: con contexto de 32.768 tokens y buenos resultados en datasets como HotpotQA (78,60 NDCG@10) o FEVER (88,92), es adecuado para rerankear pasajes que requieren agregar evidencia de varias fuentes.
- Verificacion de afirmaciones y fact-checking: el comportamiento en Climate-FEVER (35,91) y FEVER (88,92) lo hace utilizable como componente de reordenacion en pipelines de comprobacion de hechos, combinado con un recuperador previo.
- Filtrado de resultados en buscadores corporativos: integrado como etapa final antes de presentar resultados, mejora la precision de los primeros puestos (NDCG@10) sobre los candidatos devueltos por el motor de busqueda.
- Evaluacion y ajuste de recuperadores: al ser un reranker pairwise, sirve como referencia para medir la calidad de un recuperador base sobre el top-100 de candidatos BM25, siguiendo el protocolo BEIR.
- Despliegue en endpoints gestionados: la compatibilidad declarada con endpoints (tag `endpoints_compatible`) y la existencia de una pagina de inferencia en FriendliAI permiten servirlo sin infraestructura propia.

## Benchmarks y rendimiento

Resultados en BEIR. Todos los rerankers puntuan los 100 mejores candidatos BM25 de cada consulta. Las lineas base usan consultas y documentos en texto; RenderRank usa consultas en texto y documentos renderizados con la configuracion por defecto de 12pt. Las puntuaciones son NDCG@10; Avg. es la media sobre 11 datasets; Tokens es la longitud media de entrada por par consulta-documento antes del truncado, incluyendo tokens textuales y visuales en RenderRank.

| Modelo | AA | CFV | DBP | FQA | FVR | HQA | NFC | SD | SF | TC | TCH | Avg. | Tokens |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| gte-reranker-modernbert-base | 66,14 | 25,80 | 42,10 | 42,54 | **89,84** | 76,15 | 34,81 | 18,90 | 75,81 | 79,66 | 33,44 | 53,20 | 359,25 |
| mxbai-rerank-large-v1 | 16,16 | 25,61 | 45,37 | 40,29 | 82,19 | 71,58 | 37,32 | 18,96 | 75,26 | **85,84** | 37,44 | 48,73 | 347,45 |
| bge-reranker-large | 30,94 | 34,11 | 44,21 | 37,47 | 89,30 | 80,09 | 33,91 | 16,68 | 73,98 | 73,21 | 34,69 | 49,87 | 409,32 |
| LAMAR-600m | 66,21 | 36,21 | 46,23 | 41,14 | 89,49 | 79,14 | 35,04 | 20,22 | 76,97 | 80,65 | 35,76 | 55,19 | 409,32 |
| Qwen3-Reranker-0.6B | 68,04 | 34,34 | 43,76 | 39,74 | 87,13 | 77,25 | 36,60 | 20,44 | 77,00 | 85,54 | 30,32 | 54,56 | 438,70 |
| llama-nemotron-rerank-1b-v2 | 54,29 | 27,37 | 45,13 | **47,11** | 87,66 | 80,34 | 38,14 | 21,53 | **79,82** | 83,14 | 32,47 | 54,27 | 363,99 |
| mxbai-rerank-large-v2 | 42,23 | 23,03 | 38,01 | 28,85 | 70,84 | 69,50 | 35,17 | 17,49 | 78,81 | 67,78 | **46,94** | 47,15 | 449,76 |
| LightOn-rerank-PW-2B | 45,52 | 23,21 | 42,60 | 35,66 | 86,51 | 73,05 | 35,61 | 16,64 | 77,70 | 81,24 | 36,91 | 50,42 | 416,22 |
| bge-reranker-v2-gemma | 74,98 | 32,03 | 45,01 | 43,18 | 87,45 | **80,47** | 36,25 | 19,58 | 77,43 | 80,08 | 37,56 | 55,82 | 399,11 |
| Qwen3-Reranker-4B | **75,40** | **37,84** | **47,02** | 44,63 | 89,14 | 79,06 | 37,48 | **23,59** | 79,47 | 85,47 | 38,77 | **57,99** | 438,70 |
| zerank-2-reranker | 44,87 | 23,65 | 44,95 | 42,75 | 83,22 | 70,97 | **38,50** | 20,23 | 79,35 | 85,24 | 38,10 | 51,98 | 380,69 |
| LightOn-rerank-PW-4B | 52,50 | 28,24 | 44,80 | 40,27 | 87,70 | 72,79 | 37,33 | 17,29 | 76,72 | 79,54 | 36,70 | 52,17 | 416,22 |
| **RenderRank (Ours)** | 69,11 | 35,91 | 46,19 | 42,66 | 88,92 | 78,60 | 37,31 | 20,75 | 77,00 | 84,82 | 34,27 | 55,96 | **290,07** |

Leyenda: AA = ArguAna; CFV = Climate-FEVER; DBP = DBPedia; FQA = FiQA; FVR = FEVER; HQA = HotpotQA; NFC = NFCorpus; SD = SCIDOCS; SF = SciFact; TC = TREC-COVID; TCH = Touche-2020.

Rendimiento en documentos largos. La model card incluye resultados sobre el subconjunto en ingles de MLDR y tres datasets de LongEmbed (2WikiMQA, QMSum y SummScreenFD), comparando modelos que soportan al menos 16K tokens de entrada. MLDR sigue el protocolo de reranking de MMTEB; en LongEmbed cada consulta rerankea ocho candidatos recuperados con Qwen3-Embedding-0.6B. Cada celda muestra NDCG@10 seguido del numero medio de tokens de entrada entre corchetes. El material recuperado de la model card esta truncado en esta seccion, por lo que solo se dispone de la primera fila parcial:

| Modelo | MLDR | 2WikiMQA | QMSum | SummScreenFD | Avg. |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Qwen3-Reranker-0.6B | 99,63 [8863,4] | 94,54 [9230,2] | 56,43 [13543,6] | dato truncado en la informacion disponible | no disponible |
| RenderRank (Ours) | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

Estimaciones a partir del numero de parametros declarado (2.127.532.032) y del tamano del repositorio (4,3 GB). No son cifras publicadas por el autor.

- Pesos en bf16/fp16: aproximadamente 4,25 GB. El repositorio completo ocupa 4,3 GB.
- VRAM estimada para inferencia: en bf16, del orden de 5-6 GB contando pesos y overhead de runtime; el autor no publica cifras de VRAM.
- VRAM con contexto completo: el modelo admite 32.768 tokens, pero la cache KV crece con la longitud efectiva de cada par consulta-documento. Con documentos renderizados a multiples paginas, la memoria necesaria aumenta respecto a un par corto.
- Cuantizaciones: no se documentan cuantizaciones oficiales ni en GGUF, por lo que no se puede confirmar el consumo en int8 o int4.
- GPU consumer: por tamano de pesos, un modelo de 2B es desplegable en GPUs consumer con 8-12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). No hay confirmacion oficial del autor para ninguna GPU concreta.
- GPUs de centro de datos (A100, H100, L40S): suficientes en VRAM, aunque el modelo es pequeno para justificarlas en inferencia individual; tienen sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: la model card declara `transformers` y `sentence-transformers`; el tag `custom_code` implica cargar con código remoto habilitado. Existe una pagina de endpoint en FriendliAI y el repositorio se marca como `endpoints_compatible`. No se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

Comparativa centrada en rerankers de la misma categoria, con los datos de la tabla BEIR de la model card. La longitud de contexto de los modelos alternativos no se detalla en la informacion disponible.

| Modelo | Parametros | Contexto | NDCG@10 medio (BEIR) | Tokens medios por par | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RenderRank-2B | 2,13B | 32.768 tokens | 55,96 | 290,07 | Apache 2.0 | HuggingFace (191 descargas), endpoint en FriendliAI |
| Qwen3-Reranker-0.6B | 0,6B | no disponible | 54,56 | 438,70 | no disponible | HuggingFace |
| Qwen3-Reranker-4B | 4B | no disponible | 57,99 | 438,70 | no disponible | HuggingFace |
| LightOn-rerank-PW-2B | 2B | no disponible | 50,42 | 416,22 | no disponible | HuggingFace |
| llama-nemotron-rerank-1b-v2 | 1B | no disponible | 54,27 | 363,99 | no disponible | HuggingFace |
| bge-reranker-v2-gemma | no disponible | no disponible | 55,82 | 399,11 | no disponible | HuggingFace |

Lectura: RenderRank-2B iguala o supera en media BEIR a rerankers mas grandes (LightOn-rerank-PW-4B, 52,17; mxbai-rerank-large-v2, 47,15) y queda por debajo de Qwen3-Reranker-4B (57,99) y bge-reranker-v2-gemma (55,82), pero con la menor longitud media de entrada de toda la tabla (290,07 tokens frente a 399,11 y 438,70 respectivamente).

## Limitaciones y advertencias

- Sesgos: no se publica ninguna evaluacion de sesgos en la informacion disponible.
- Riesgo de alusion: la model card no incluye analisis de hallucination. Al ser un reranker con salida binaria si/no, el riesgo se manifiesta como falsos positivos de relevancia mas que como texto inventado, pero no hay datos publicados al respecto.
- Idioma: solo se ha evaluado en ingles. La model card declara `language: en` y no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Rendimiento desigual por dominio: los resultados BEIR muestran una variabilidad muy alta entre datasets. Por ejemplo, Touché-2020 (34,27), Climate-FEVER (35,91) y NFCorpus (37,31) estan muy por debajo de FEVER (88,92) o TREC-COVID (84,82). Es un modelo que no rinde igual en todos los dominios y conviene validarlo en el corpus objetivo antes de desplegarlo.
- Dependencia del renderizado: los resultados publicados corresponden a una configuracion concreta de fuente, tamano, ancho de pagina y normalizacion de espacios. Cambiar cualquiera de esos parametros puede alterar el rendimiento, y el autor no publica un analisis de sensibilidad.
- Coste de preprocesado: el modo `render` exige rasterizar cada documento a imagenes antes de la inferencia, lo que anade una etapa de CPU y almacenamiento intermedio que no existe en un reranker de texto puro.
- Codigo remoto: el tag `custom_code` obliga a habilitar `trust_remote_code=True` al cargar el modelo, lo que implica ejecutar codigo del repositorio.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de copyright y licencia y de indicar los cambios realizados. No se anaden restricciones adicionales conocidas, pero conviene revisar los terminos del modelo base Qwen3-VL-Reranker-2B, cuya licencia no se detalla en la informacion disponible.
- Madurez: el modelo es muy reciente (creado el 28 de septiembre de 2026) y con 191 descargas y 11 likes en el momento de la consulta, por lo que la comunidad aun no ha acumulado experiencia de produccion sobre el.
- Destino de la tarea: no es un modelo generativo ni un chatbot; usarlo fuera de la tarea de reranking pairwise no esta soportado por la documentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/RenderRank-2B
- Articulo (paper): https://arxiv.org/pdf/2609.35069
- Modelo base Qwen3-VL-Reranker-2B: https://huggingface.co/Qwen/Qwen3-VL-Reranker-2B
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/nlpai-lab/RenderRank-2B
- Pagina del autor en Hugging Face (nlpai-lab, NLP & AI - Korea University): https://huggingface.co/nlpai-lab/models
- Anuncio del modelo en LinkedIn: https://www.linkedin.com/posts/tate-hong-nlp_nlpai-labrenderrank-2b-hugging-face-activity-7510587682939510784-1HJ6
