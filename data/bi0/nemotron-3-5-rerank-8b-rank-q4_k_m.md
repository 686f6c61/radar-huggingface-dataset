# bi0/Nemotron-3.5-Rerank-8B-rank-Q4_K_M

## Resumen

Nemotron-3.5-Rerank-8B-rank-Q4_K_M es una cuantizacion GGUF del modelo de reranking multimodal Nemotron-3.5-Rerank-8B-BF16 de NVIDIA. El repositorio lo publica el usuario bi0 y no es un modelo generativo, sino un reranker: puntua la relevancia de un pasaje de texto o de una imagen de documento respecto a una consulta. Su funcion es la segunda etapa de un pipeline de recuperacion (retrieval), donde reordena los candidatos devueltos por un buscador vectorial o lexico antes de pasarlos al generador.

La relevancia practica de esta ficha concreta es la cuantizacion: reduce el modelo original en BF16 a Q4_K_M, con un fichero de 4.669,57 MB (4.896.402.912 bytes), lo que lo hace desplegable en hardware de consumo y en estaciones compactas. La model card indica que se ha parcheado la cabeza de clasificacion (`cls_out.weight`) en BF16 tras la cuantizacion, un detalle tecnico habitual cuando se cuantiza un modelo de scoring, ya que la salida final es muy sensible a la precision.

El autor etiqueta el artefacto para DGX Spark con GPU Blackwell GB10 y arquitectura sm121, y documenta un puerto de servicio local (8093). Se trata, por tanto, de un artefacto orientado a inferencia local en ese entorno, no de un modelo entrenado desde cero ni de una variante oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de reranking multimodal de NVIDIA; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | 8B (segun el nombre del modelo base; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (4.669,57 MB / 4.896.402.912 bytes) |
| Modelo base | nvidia/Nemotron-3.5-Rerank-8B-BF16 |
| Metodo de optimizacion | Cuantizacion GGUF Q4_K_M + parche de la cabeza de clasificacion en BF16 |
| SHA-256 | 710fdbf481aae86d3fa6d82ab04577fee9b18669f69f61c61711510077cb0d10 |
| Hardware objetivo declarado | DGX Spark, Blackwell GB10, sm121 |
| Fecha de publicacion | 2026-11-07 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la descripcion de NVIDIA NIM, Nemotron-3.5-Rerank-8B es un reranker multimodal de 8B que puntua la relevancia de pasajes de texto y de imagenes de documentos frente a una consulta, lo que implica una torre de codificacion de texto y otra de vision con una cabeza de clasificacion que produce la puntuacion de relevancia.

Sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no hay datos en la informacion disponible. Lo unico documentado es el post-procesado aplicado por el autor de esta cuantizacion: conversion a GGUF con cuantizacion Q4_K_M y reemplazo de la cabeza de clasificacion (`cls_out.weight`) por su version en BF16, presumiblemente para preservar la fidelidad del score tras la perdida de precision del resto de pesos.

## Capacidades

- Reranking de pasajes de texto: asigna una puntuacion de relevancia de un fragmento documental respecto a una consulta.
- Reranking multimodal: evalua imagenes de documentos (paginas escaneadas, capturas) frente a una consulta, segun la descripcion de NVIDIA NIM.
- Segunda etapa de pipelines RAG: reordena los candidatos de un retriever previo antes de la generacion.
- Salida de scoring por par consulta-pasaje, apta para umbrales de corte y filtrado.
- No es un modelo generativo: no produce texto libre, por lo que no se le presupone soporte de tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- RAG sobre documentacion corporativa: tras la busqueda vectorial, el modelo reordena los 50-100 fragmentos recuperados y deja los mejores para el generador, reduciendo contexto irrelevante y coste de tokens.
- Busqueda sobre documentos escaneados: al aceptar imagenes de documentos, permite rerankear facturas, contratos o formularios digitalizados sin OCR previo completo.
- Atencion al cliente con base de conocimiento: reordena articulos de ayuda y FAQs antes de que un LLM redacte la respuesta, mejorando la precision de la respuesta final.
- Busqueda juridica o normativa: puntuacion de fragmentos de expedientes y normativa por relevancia frente a una consulta, con umbral de corte para descartar coincidencias debiles.
- Evaluacion de calidad de recuperacion: uso offline para puntuar pares consulta-documento y construir conjuntos de validacion o metricas de nDCG en un pipeline de retrieval.
- Despliegue en estacion local con DGX Spark: el autor lo empaqueta para Blackwell GB10 y sm121, de modo que puede ejecutarse en una estacion de trabajo sin GPU de centro de datos, con el fichero de 4,67 GB en disco.
- Filtrado de candidatos en motores de busqueda internos: integracion como microservicio en el puerto 8093 documentado por el autor, entre el indice y la capa de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La referencia de NVIDIA NIM menciona que el modelo base se evaluo con `longest_edge` de 1.120 pixeles y compara con Qwen3-VL-Reranker-8B (con `max_pixels` de 1.310.720), pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 4,67 GB; en inferencia cabe en GPUs con 8 GB o mas de VRAM, dejando margen para el contexto y los tensores de activacion.
- GPU objetivo declarada: DGX Spark con Blackwell GB10 (sm121), que es el entorno para el que el autor construyo la cuantizacion.
- GPU de consumo: al ser un unico fichero Q4_K_M de menos de 5 GB, es compatible con tarjetas consumer de 8 GB o mas; no se especifican modelos concretos probados.
- Opciones de despliegue: llama.cpp y servidores compatibles con GGUF; el autor documenta un servicio local en el puerto 8093. No se confirma soporte de vLLM o TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| bi0/Nemotron-3.5-Rerank-8B-rank-Q4_K_M | 8B (segun nombre del base) | Texto + imagen de documento | no disponible | no disponible | GGUF Q4_K_M |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 | 8B (segun nombre) | Texto + imagen de documento | no disponible | no disponible | BF16 |
| Qwen3-VL-Reranker-8B | 8B | Texto + imagen | no disponible | no disponible | no disponible |

La comparacion con Qwen3-VL-Reranker-8B procede de la referencia de evaluacion de NVIDIA NIM; no se dispone de cifras de rendimiento comparadas en la informacion proporcionada. La diferencia principal frente al modelo base de NVIDIA es el formato y el tamano: Q4_K_M reduce el peso en disco y VRAM a costa de precision en los pesos, con la cabeza de clasificacion preservada en BF16.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base de NVIDIA antes de cualquier despliegue en produccion.
- Artefacto no oficial: lo publica un tercero (bi0), no NVIDIA; no hay garantia de mantenimiento, soporte ni equivalencia exacta con el modelo original.
- Cuantizacion Q4_K_M: aunque la cabeza de clasificacion se mantiene en BF16, el resto de pesos pierde precision; las puntuaciones pueden diferir de las del modelo BF16 y conviene recalibrar los umbrales de corte.
- Riesgo de sesgo y de falsos positivos heredado del modelo base y de sus datos de entrenamiento; no se documentan evaluaciones de sesgo en la informacion disponible.
- Sin datos de contexto maximo ni de idiomas soportados: no se puede garantizar el comportamiento en documentos largos o en castellano.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No es un modelo generativo: no debe usarse para redactar respuestas, invocar herramientas ni tareas de agente.
- El SHA-256 publicado permite verificar la integridad del fichero descargado; conviene comprobarlo antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bi0/Nemotron-3.5-Rerank-8B-rank-Q4_K_M
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3_5-rerank-8b/modelcard
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3_5-rerank-8b
