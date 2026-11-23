# mradermacher/sgpt-bloom-7b1-msmarco-GGUF

## Resumen

`mradermacher/sgpt-bloom-7b1-msmarco-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `bigscience/sgpt-bloom-7b1-msmarco`, un modelo de embeddings de frases (sentence-transformers) construido sobre la arquitectura BLOOM de 7.100 millones de parametros y afinado para recuperacion de informacion sobre el corpus MS MARCO. No es un modelo generativo: su proposito es producir representaciones vectoriales densas de pasajes y consultas para tareas de similitud semantica y busqueda.

El trabajo de cuantizacion lo firma mradermacher, un autor conocido en el ecosistema por publicar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base fue desarrollado por BigScience y el equipo de Sentence Transformers, y se entrena sobre BLOOM-7b1 con un objetivo de similitud contrastiva usando tripletas de MS MARCO.

La relevancia actual de esta ficha es practica: permite ejecutar un modelo de embeddings de 7B en hardware de consumo mediante cuantizaciones de 3,5 a 8,7 GB, algo imposible con los pesos en fp16 (16,3 GB). El repo incluye 12 variantes de cuantizacion (Q2_K hasta f16) y esta etiquetado como compatible con endpoints. El modelo solo soporta ingles y su licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (BLOOM), adaptado a sentence-transformers |
| Parametros totales | 8.094.998.528 (~8,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo); el modelo base en safetensors |
| Dimension de embedding | no disponible en la informacion proporcionada |
| Modelo base | bigscience/sgpt-bloom-7b1-msmarco |
| Tamano del repo | 74,5 GB (incluye todas las cuantizaciones) |
| Pipeline | feature-extraction / sentence-similarity |
| Libreria | transformers, compatible con llama.cpp |

## Arquitectura y entrenamiento

El modelo base es BLOOM-7b1, un transformer decoder-only con 7.100 millones de parametros, 70 capas, atencion multi-cabeza con ALiBi para extrapolacion posicional y embeddings de tipo RoPE. Sobre esta base, el proyecto SGPT (Sentence Transformers for GPT) aplica un entrenamiento contrastivo para convertir el modelo generativo en un encoder de frases: se anade una capa de pooling (habitualmente mean pooling) sobre las representaciones ocultas y se optimiza con una funcion de perdida contrastiva sobre pares consulta-pasaje.

El entrenamiento especifico de la variante `msmarco` se realiza sobre el corpus MS MARCO, un conjunto de datos de busqueda web con millones de pares consulta-documento relevantes. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo de embeddings). La innovacion principal es el uso de un modelo de 7B como encoder denso, lo que aporta mayor capacidad representacional que los encoders BERT-base habituales (110M) a costa de un mayor coste computacional.

## Capacidades

- Generacion de embeddings densos para frases y pasajes, orientados a similitud semantica y recuperacion.
- Busqueda semantica y recuperacion de informacion (retrieval) sobre corpus en ingles.
- Re-ranking de resultados de busqueda mediante similitud coseno entre vectores.
- Clustering y deduplicacion semantica de documentos.
- Clasificacion de texto por similitud con prototipos.
- Evaluacion en el benchmark MTEB (etiqueta `mteb` en el repo).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no un LLM generativo.
- Capacidades multilingues limitadas al ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de manuales o APIs en ingles y recuperar los mas relevantes para una consulta en lenguaje natural mediante similitud coseno entre embeddings.
- Motor de recuperacion para RAG: usar el modelo como retriever en un pipeline de generacion aumentada, codificando los chunks del corpus una vez y consultando en tiempo de inferencia con la cuantizacion Q4_K_M (5,4 GB) en una GPU de consumo.
- Re-ranking de resultados de un buscador lexico: combinar BM25 con la similitud del modelo para reordenar los top-k candidatos y mejorar la precision en dominios especializados.
- Deduplicacion de articulos o tickets: generar embeddings de miles de entradas y agrupar por distancia para eliminar duplicados semanticos en un pipeline de datos.
- Clasificacion zero-shot de tickets de soporte: comparar el embedding del ticket con embeddings de prototipos de categoria y asignar la etiqueta mas cercana sin entrenamiento adicional.
- Deteccion de similitud entre pares de frases: para sistemas de control de calidad, moderacion o verificacion de parafrasis en ingles.
- Filtrado de candidatos en un sistema de recomendacion de contenido: calcular la afinidad semantica entre el perfil del usuario y los documentos candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repo incluye la etiqueta `mteb`, lo que indica que el modelo base se evaluo en MTEB, pero no se proporcionan las puntuaciones numericas en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,5 GB (Q2_K), ~5,4 GB (Q4_K_M), ~8,7 GB (Q8_0), ~16,3 GB (f16), incluyendo overhead de contexto y pooling.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q8_0; RTX 4090, A100 o H100 para f16 o procesamiento por lotes de alto throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB para cuantizaciones Q3/Q4, y en 12 GB para Q8_0.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), servidores compatibles con endpoints (el repo esta etiquetado como `endpoints_compatible`), y transformers para los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder de 7B, el coste por embedding es mayor que el de encoders BERT-base; se recomienda batching para amortizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| mradermacher/sgpt-bloom-7b1-msmarco-GGUF | ~8,1B | no disponible | en | no disponible | GGUF |
| bigscience/sgpt-bloom-7b1-msmarco (base) | ~8,1B | no disponible | en | no disponible | safetensors |
| sentence-transformers/all-MiniLM-L6-v2 | ~22M | 256 tokens | en (multilingue en variantes) | Apache 2.0 | safetensors, ONNX |
| BAAI/bge-large-en-v1.5 | ~335M | 512 tokens | en | MIT | safetensors, GGUF |

La comparativa de rendimiento (MTEB) no esta disponible en la informacion proporcionada. La diferencia principal frente a all-MiniLM-L6-v2 y bge-large-en-v1.5 es el tamano: 8,1B frente a 22M y 335M, lo que implica mayor coste de inferencia y mayor huella de memoria a cambio de una capacidad representacional potencialmente superior.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para corpus en castellano sin un modelo multilingue alternativo.
- Es un modelo de embeddings, no generativo: no produce texto, no razona y no soporta tool calling.
- La licencia no esta declarada en la informacion disponible; verificar la licencia del modelo base (BLOOM-7b1) antes de uso comercial.
- Riesgo de sesgos heredados de BLOOM-7b1 y de MS MARCO (sesgos de dominio, geograficos y de representacion del corpus web).
- El contexto maximo no esta documentado en la informacion proporcionada; asumir el limite de BLOOM-7b1 (2048 tokens) es una precaucion razonable, pero conviene verificarlo.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de los embeddings; para produccion se recomienda Q4_K_M o superior.
- El repo incluye 12 cuantizaciones (74,5 GB en total); descargar solo la variante necesaria para no saturar el disco.
- No se han publicado benchmarks especificos de esta cuantizacion; el rendimiento puede diferir del modelo base en fp16.

## Enlaces

- Repo GGUF: https://huggingface.co/mradermacher/sgpt-bloom-7b1-msmarco-GGUF
- Modelo base: https://huggingface.co/bigscience/sgpt-bloom-7b1-msmarco
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/sgpt-bloom-7b1-msmarco-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#sgpt-bloom-7b1-msmarco-GGUF
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
