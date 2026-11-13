# mradermacher/gemma-2-mitra-e-GGUF

## Resumen

`mradermacher/gemma-2-mitra-e-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo de embeddings `buddhist-nlp/gemma-2-mitra-e`, producida por el usuario mradermacher (nethype GmbH). No se trata de un modelo generativo, sino de un modelo de representaciones densas (embeddings) orientado a similitud semantica, construido sobre la arquitectura Gemma 2 de Google. El modelo base cuenta con 9.241.713.152 parametros (aproximadamente 9,2 mil millones), lo que lo situa en la gama de modelos de embeddings de gran tamano.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de embeddings de 9B en hardware de consumo o en entornos con recursos limitados, gracias a las cuantizaciones GGUF que van desde 3,9 GB (Q2_K) hasta 18,6 GB (f16). Esto facilita su integracion en pipelines de recuperacion (RAG), busqueda semantica y clustering sin necesidad de GPUs de datacenter.

El repositorio tiene 698 descargas y 1 like en el momento de la consulta, con licencia no especificada en la informacion disponible. El modelo esta etiquetado como multilingue, aunque el campo de idiomas declara unicamente `en`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only adaptado a embeddings), segun tags del modelo base |
| Parametros totales | 9.241.713.152 (9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun model card); etiquetado como multilingue en tags |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 83,5 GB |
| Modelo base | buddhist-nlp/gemma-2-mitra-e |
| Cuantizador | mradermacher (nethype GmbH) |
| Fecha de creacion | 2025-05-30 |
| Ultima actualizacion | 2026-11-13 |

## Arquitectura y entrenamiento

El modelo base `buddhist-nlp/gemma-2-mitra-e` se apoya en la arquitectura Gemma 2, un transformer decoder-only desarrollado por Google. En este caso, el modelo ha sido adaptado como modelo de embeddings para similitud semantica, lo que implica que su salida se utiliza como representacion vectorial en lugar de como texto generado. No se dispone de informacion detallada sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de contraste) en la informacion proporcionada.

Las cuantizaciones de mradermacher son estaticas (no imatrix), generadas con `quantize_version: 2` y `output_tensor_quantised: 1`, y convertidas desde el formato Hugging Face (`convert_type: hf`). Existe una variante con cuantizaciones ponderadas/imatrix en `mradermacher/gemma-2-mitra-e-i1-GGUF`, que suele ofrecer mejor calidad a igual tamano. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, attention linear, etc.) en la informacion disponible.

## Capacidades

- Generacion de embeddings densos para similitud semantica y recuperacion de informacion.
- Busqueda semantica y recuperacion aumentada por generacion (RAG).
- Clustering y deduplicacion de documentos mediante representaciones vectoriales.
- Clasificacion de texto zero-shot mediante similitud con etiquetas.
- Soporte multilingue segun los tags del modelo (aunque el campo de idiomas declara solo `en`).
- Compatible con endpoints (tag `endpoints_compatible`).
- No es un modelo generativo: no produce texto, codigo ni razonamiento explicito.
- No se documenta soporte de tool calling, agentes ni vision en la informacion disponible.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): indexar una base documental con embeddings del modelo y recuperar los fragmentos mas relevantes para alimentar a un LLM generativo. La cuantizacion Q4_K_M (5,9 GB) permite ejecutarlo en una GPU de consumo.
- Busqueda semantica en produccion: desplegar el modelo Q8_0 (9,9 GB) para generar embeddings de consultas y documentos en tiempo real, con buena calidad y latencia aceptable en una RTX 4090.
- Deduplicacion de corpus: calcular embeddings de un gran volumen de textos y agrupar por similitud coseno para eliminar duplicados o near-duplicates en pipelines de limpieza de datos.
- Clasificacion de tickets de soporte: usar embeddings de tickets y de categorias predefinidas para asignar automaticamente el departamento correspondiente mediante similitud.
- Moderacion de contenido: comparar embeddings de mensajes entrantes con un catalogo de ejemplos etiquetados para detectar contenido similar a casos conocidos.
- Sistemas de recomendacion basados en contenido: representar items (articulos, productos) como vectores y recomendar por similitud semantica sin depender de interacciones historicas.
- Clustering de investigacion cualitativa: agrupar respuestas abiertas de encuestas o entrevistas por tematica usando las representaciones del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de runtime):
  - Q2_K: ~3,9 GB
  - Q3_K_M: ~4,9 GB
  - IQ4_XS: ~5,3 GB
  - Q4_K_M: ~5,9 GB
  - Q5_K_M: ~6,7 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,6 GB
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4090 24 GB (esta ultima admite hasta f16).
  - Datacenter: A100 40/80 GB, H100 80 GB para despliegues de alto throughput.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en GPUs de 8-12 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y librerias compatibles con GGUF. Para el modelo base en safetensors, transformers con sentence-transformers o TEI (Text Embeddings Inference).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-2-mitra-e (este, cuantizado) | 9,2B | no disponible | Embeddings | no disponible | GGUF |
| buddhist-nlp/gemma-2-mitra-e (base) | 9,2B | no disponible | Embeddings | no disponible | safetensors |
| gemma-2-mitra-e-i1-GGUF (imatrix) | 9,2B | no disponible | Embeddings | no disponible | GGUF (imatrix) |
| Otros modelos de embeddings de ~8-9B | no disponible | no disponible | Embeddings | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (MTEB u otros) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para completar texto, razonar ni generar codigo.
- La licencia no esta especificada en la informacion disponible; es imprescindible verificar la licencia del modelo base (`buddhist-nlp/gemma-2-mitra-e`) y de Gemma 2 antes de un uso comercial.
- El campo de idiomas declara unicamente `en`, aunque los tags indiquen multilingue; el rendimiento real en castellano no esta verificado.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar la calidad de los embeddings; se recomienda Q4_K_M o superior para produccion.
- Las cuantizaciones estaticas pueden ser inferiores a las imatrix del repositorio `-i1-GGUF` a igual tamano.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base, no documentados.
- No se documentan limitaciones de contexto; conviene consultar la model card del modelo base.
- La fecha de ultima actualizacion (2026-11-13) es posterior a la de creacion; verificar que los archivos corresponden a la version esperada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-2-mitra-e-GGUF
- Modelo base: https://huggingface.co/buddhist-nlp/gemma-2-mitra-e
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-2-mitra-e-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#gemma-2-mitra-e-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
