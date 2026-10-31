# mradermacher/Nemotron-3.5-Embed-8B-BF16-i1-GGUF

## Resumen

Nemotron-3.5-Embed-8B-BF16-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo de embeddings multimodal Nemotron-3.5-Embed-8B-BF16, desarrollado por NVIDIA y cuantizado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base genera embeddings de texto e imagen (multimodal-embedding) orientados a tareas de recuperación de información, búsqueda semántica y RAG.

La relevancia de esta ficha radica en que permite ejecutar un modelo de embeddings de 8.000 millones de parámetros en hardware modesto: las cuantizaciones van desde aproximadamente 2 GB (IQ1_S) hasta tamaños cercanos al BF16 original, lo que hace viable desplegar embeddings de alta calidad en GPUs de consumo o incluso en CPU. Al ser un modelo de embeddings y no generativo, no produce texto, sino vectores que deben combinarse con una base de datos vectorial.

El modelo base soporta más de 30 idiomas, incluido el castellano, y está etiquetado como compatible con vLLM y transformers. La licencia del modelo base es "other" con nombre openmdw-1.1 (OpenMDW 1.1), una licencia abierta de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder para embeddings multimodales (texto e imagen); detalles concretos no disponibles |
| Parametros totales | 7.952.683.008 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K y otras cuantizaciones K-quants e IQ-quants (lista completa en el repo) |
| Idiomas soportados | Multilingue: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi (mas de 30 idiomas) |
| Licencia | openmdw-1.1 (heredada del modelo base nvidia/Nemotron-3.5-Embed-8B-BF16) |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base original esta en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base, Nemotron-3.5-Embed-8B-BF16 de NVIDIA, es un modelo de embeddings multimodal basado en arquitectura transformer, con 7.950 millones de parametros almacenados en formato BF16. Esta diseñado para la extraccion de caracteristicas (feature-extraction) sobre texto e imagen, generando vectores que capturan significado semantico para tareas de recuperacion. Los ficheros mmproj (proyector multimodal) necesarios para la parte de vision se distribuyen en el repositorio estatico hermano, no en este.

Sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset y el uso de tecnicas como contrastive learning o destilacion no constan en la informacion disponible. La version aqui descrita es una cuantizacion realizada por mradermacher mediante el metodo imatrix (importance matrix), que calcula una matriz de importancia sobre un corpus de calibracion para reducir la perdida de calidad en cuantizaciones agresivas, especialmente en los niveles bajos IQ1/IQ2/IQ3.

## Capacidades

- Generacion de embeddings de texto para recuperacion semantica y busqueda densa.
- Generacion de embeddings de imagen (image-embeddings), lo que permite busqueda multimodal (texto-imagen e imagen-texto).
- Soporte de RAG: pensado como motor de recuperacion en pipelines de generacion aumentada por recuperacion.
- Cobertura multilingue con mas de 30 idiomas, incluido el castellano, arabe, chino, japones, hindi o suajili.
- Compatibilidad con la libreria transformers de Hugging Face y con vLLM para despliegue servido.
- Formato GGUF compatible con el ecosistema llama.cpp para inferencia local en CPU y GPU.
- No genera texto, no soporta tool calling ni razonamiento multi-paso: es un modelo de embeddings.

## Casos de uso

- Busqueda semantica en documentacion interna: se indexan los documentos de la empresa convirtiendo cada fragmento en un embedding y se recuperan los mas relevantes ante una consulta en lenguaje natural, aprovechando la calidad de un modelo de 8B frente a embedders mas pequenos.
- RAG sobre corpus multilingues: dado que soporta mas de 30 idiomas, se puede construir un sistema de recuperacion donde las consultas en castellano recuperen documentos en ingles o aleman sin traduccion previa.
- Busqueda de imagenes por texto: usando los ficheros mmproj del repo estatico, se pueden indexar colecciones de imagenes y buscarlas con consultas textuales, util en catalogos de producto o archivos multimedia.
- Deduplicacion y agrupamiento de documentos: los embeddings permiten clustering (por ejemplo con HDBSCAN o k-means) para organizar grandes volumenes de tickets, articulos o informes por tematica.
- Deteccion de near-duplicates y versionado de contenido: comparando similitud coseno entre embeddings se identifican documentos casi identicos en repositorios grandes.
- Clasificacion zero-shot y few-shot: se generan embeddings de ejemplos etiquetados y de los textos nuevos, clasificando por vecino mas cercano sin reentrenar nada.
- Recomendacion de contenido: calcular similitud entre el perfil de un usuario (texto) y los elementos del catalogo para recomendar articulos o recursos similares.
- Despliegue en edge o hardware modesto: las cuantizaciones IQ2/IQ3 (2,4-3,9 GB) permiten ejecutar el modelo en portatiles o mini-PC para indexacion local con privacidad total.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para evaluar el rendimiento del modelo base en benchmarks de recuperacion (MTEB, MIRACL, etc.), conviene consultar la model card de nvidia/Nemotron-3.5-Embed-8B-BF16 directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida; aproximadamente 2 GB para i1-IQ1_S, 5 GB para i1-Q4_K_M y hasta unos 16 GB o mas para las cuantizaciones mas altas (Q8, BF16), siempre anadiendo margen para el contexto.
- GPU recomendadas: para cuantizaciones medias (Q4/Q5), una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 sobran; para el modelo en BF16, una A100 o RTX 4090 de 24 GB es adecuada.
- Cabe en GPUs de consumo: si, desde aproximadamente 2 GB (IQ1_S, con perdida notable de calidad) hasta 5-6 GB (Q4_K_M, recomendado) en la mayoria de GPUs modernas; tambien funciona en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; vLLM y transformers para el modelo base en safetensors; integracion tipica con bases vectoriales como Qdrant, Milvus, Chroma o pgvector.
- Latencia y throughput: no disponibles; al ser un modelo de embeddings de 8B, el throughput esperable es alto en batch en GPU y razonable en CPU con cuantizaciones bajas.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-BF16 (base, NVIDIA) | 7.950 M | Texto e imagen | Safetensors BF16 | openmdw-1.1 | Modelo original, maxima calidad |
| nvidia/NV-Embed-v2 | 7.850 M | Solo texto | Safetensors | CC-BY-NC-4.0 | Muy alto rendimiento en MTEB, pero restringido a investigacion |
| BAAI/bge-m3 | 568 M | Solo texto | Safetensors, GGUF | MIT | Mucho mas ligero y rapido, multilingue, muy usado en RAG |
| Alibaba-NLP/gte-Qwen2-7B-instruct | 7.600 M | Solo texto | Safetensors | Apache 2.0 | Competidor directo en tamano, embeddings instruct-tuned |

El Nemotron-3.5-Embed-8B se diferencia de sus alternativas por su naturaleza multimodal (texto e imagen) y por disponer de cuantizaciones imatrix que reducen su huella de memoria a partir de 2 GB.

## Limitaciones y advertencias

- Al ser un modelo de embeddings, no sirve para generacion de texto, chat ni razonamiento; elegirlo por error es un fallo comun.
- Las cuantizaciones agresivas (IQ1_S, IQ1_M, IQ2_XXS) degradan sensiblemente la calidad de los embeddings; para produccion se recomienda Q4_K_M o superior.
- La calidad de la parte de vision depende de los ficheros mmproj del repositorio estatico; sin ellos, solo se procesa texto.
- No hay datos publicados de benchmarks en la ficha, por lo que conviene validar empíricamente la calidad de recuperacion sobre el corpus propio antes de adoptarlo.
- La licencia openmdw-1.1 es una licencia abierta de pesos distinta de Apache 2.0 o MIT; hay que revisar sus terminos en https://openmdw.ai/license/1-1/ antes de uso comercial.
- Riesgo de alucinacion no aplicable al no generar texto, pero los embeddings pueden capturar sesgos presentes en los datos de entrenamiento, afectando a similitudes y rankings.
- La longitud de contexto maxima no esta documentada en la informacion disponible; fragmentar documentos largos sigue siendo necesario hasta verificarla.

## Enlaces

- Repositorio de la cuantizacion GGUF (imatrix): https://huggingface.co/mradermacher/Nemotron-3.5-Embed-8B-BF16-i1-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Cuantizaciones estaticas (con mmproj): https://huggingface.co/mradermacher/Nemotron-3.5-Embed-8B-BF16-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Nemotron-3.5-Embed-8B-BF16-i1-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Guia de uso de GGUF referenciada: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
