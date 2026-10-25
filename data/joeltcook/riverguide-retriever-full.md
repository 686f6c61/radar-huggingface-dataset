# joeltcook/riverguide-retriever-full

## Resumen

riverguide-retriever-full es un modelo de embeddings de frases (sentence-transformers) obtenido por fine-tuning de Qwen/Qwen3-Embedding-0.6B, publicado por el usuario joeltcook. Su función es recuperar, dada una consulta de un estudiante, la página web del Indian River State College (IRSC) que la responde. No genera texto: produce un vector por consulta y otro por fragmento de página mediante una única pasada forward, y la relevancia se calcula con producto escalar sobre embeddings normalizados.

El modelo resuelve un problema concreto de recuperación léxica en el dominio educativo: los estudiantes buscan con abreviaturas, jerga y errores tipográficos ("RN", "rad tech", "BSN", "plumber") que BM25 no cubre. Según la model card, sustituye a la búsqueda por palabras clave en producción del asistente RiverGuide del College. Es relevante ahora porque documenta una mejora medida sobre preguntas reales de estudiantes (523 primeras consultas distintas, septiembre-octubre de 2026) y porque su entrenamiento completo cabe en una única RTX 4090 en unos 40 minutos.

Arquitectura y tamaño: hereda el transformer denso de 595.776.512 parámetros del modelo base (aproximadamente 0,6B), con licencia Apache 2.0 y pesos en safetensors. El repositorio ocupa 1,2 GB. El modelo está entrenado y evaluado únicamente en inglés y está especializado en el vocabulario y el catálogo del IRSC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (encoder de embeddings) derivado de Qwen/Qwen3-Embedding-0.6B |
| Parámetros totales | 595.776.512 (aproximadamente 0,6B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No se publican pesos cuantizados en el repositorio; los pesos ocupan 1,2 GB (coherente con fp16/bf16). Cualquier cuantización adicional requeriría conversión propia, no verificada |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería / pipeline | sentence-transformers / sentence-similarity |
| Dimensión del embedding | No disponible en la información proporcionada |
| Prefijo de consulta | Obligatorio: `Instruct: Given a college student's search query, retrieve the College web page that answers it\nQuery: ` |
| Normalización | `normalize_embeddings=True` (similitud por producto escalar) |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |
| Fecha de publicación | 2026-10-25 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-0.6B y se afina como recuperador bi-encoder: las consultas se codifican con un prefijo de instrucción y los fragmentos de documento como texto plano; la puntuación de una página es la de su mejor fragmento. La función de pérdida es InfoNCE con temperatura τ = 0,05 frente al fragmento correcto, dos negativos duros y el resto de un lote de 64 consultas. Los candidatos in-batch se enmascaran cuando pertenecen a otra sección de la página correcta, cuando son el mismo texto o cuando el modelo base los puntúa por encima del fragmento correcto (la idea de GISTEmbed), algo relevante porque el sitio del College repite contenido entre páginas y catálogo.

Los datos de entrenamiento son aproximadamente 31.000 consultas con estilo de estudiante generadas por Qwen3.8-27B sobre 5.923 fragmentos del sitio público y el catálogo del College (rastreo del 2026-10-22, 2.389 páginas). Por cada fragmento se generaron una pregunta completa, una búsqueda de 2 a 5 palabras, la forma abreviada o jerga y una falta de ortografía, más seis consultas de "cómo se refiere la gente a este programa" para cada una de las 377 páginas de programas. Un juez Qwen3-Reranker-0.6B descartó consultas que su propio fragmento no responde y conservó negativos duros solo cuando tampoco respondían a la consulta.

El entrenamiento fue de una época con lr 1e-5 en bf16 sobre una RTX 4090 (unos 40 minutos); el mejor paso se eligió por MRR@10 sobre páginas no vistas. La variante "full" se entrenó con todas las consultas generadas, incluidas las que contienen las 75 abreviaturas del conjunto de test, por lo que su puntuación en abreviaturas está contaminada; el dato limpio procede de un gemelo entrenado sin ninguna consulta que las contenga (variante "strict").

## Capacidades

- Recuperación de documentos (retrieval) en inglés: devuelve la página del catálogo del College más relevante para una consulta de estudiante.
- Codificación de consultas cortas con jerga, abreviaturas y errores tipográficos, incluyendo formas coloquiales de nombrar programas.
- Codificación de documentos por fragmentos con estructura `título de página > sección` seguida del texto, agregando por el máximo de los fragmentos.
- Similitud semántica entre frases (pipeline `sentence-similarity`) mediante embeddings normalizados.
- Inferencia en una sola pasada forward por consulta, sin generación de tokens: latencia de recuperación muy inferior a la de un LLM.
- Integración como primera etapa de un sistema RAG o de búsqueda híbrida con BM25.
- Compatibilidad declarada con text-embeddings-inference y con endpoints (tag `endpoints_compatible`).
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso: es exclusivamente un encoder de recuperación.
- No soporta otros idiomas distintos del inglés según la model card.

## Casos de uso

- Primera etapa de un RAG sobre el sitio web de una institución educativa: se indexan los fragmentos de las páginas, se codifica la consulta del estudiante con el prefijo de instrucción y se pasan los 5 mejores fragmentos al LLM que redacta la respuesta. Adecuado porque reduce el coste frente a meter páginas enteras en el contexto.
- Asistente de admisiones con vocabulario real de estudiantes: el modelo está entrenado explícitamente con abreviaturas y nombres coloquiales de programas ("rad tech", "RN", "BSN"), de modo que resuelve consultas de 2 a 5 palabras que un índice léxico falla.
- Búsqueda previa dentro de un bucle de agente: ejecutar el recuperador sobre la pregunta del estudiante antes del primer paso del agente e inyectar los resultados en la conversación. En la model card esto redujo de 2,17 a 1,35 llamadas al modelo por pregunta en un conjunto de 54 preguntas y bajó la latencia mediana de 6,9 s a 5,0 s.
- Mantenimiento de un índice documental vivo: cuando cambia una tasa, una fecha o una política, basta con re-embeddear las páginas modificadas; no hace falta reentrenar. El autor re-embebbe a diario y comprueba deriva semanalmente.
- Búsqueda híbrida en producción: combinar el recuperador denso con BM25 para cubrir tanto coincidencias exactas de nombre de programa como paráfrasis y erratas; en la model card la combinación híbrida iguala al modelo denso en abreviaturas y en el conjunto golden.
- Deduplicación y consolidación de un catálogo académico: al puntuar por el mejor fragmento y enmascarar durante el entrenamiento fragmentos equivalentes de la misma página, el espacio de embeddings agrupa contenido repetido entre el sitio y el catálogo.
- Evaluación de sistemas de búsqueda educativos: sirve como referencia cuantitativa frente a BM25 y al modelo base sin afinar sobre conjuntos de consultas reales anonimizadas.
- Filtrado previo antes de un cross-encoder: recuperar 20-50 candidatos con este bi-encoder y reordenarlos con un reranker, abaratando la segunda etapa.

## Benchmarks y rendimiento

Resultados publicados en la model card. Métrica: página correcta en el top 5.

| Conjunto | BM25 (keyword) | Qwen3-Embedding-0.6B sin afinar | riverguide-retriever-full | Híbrido |
|---|---|---|---|---|
| Abreviaturas (75) | 51/75 | 65/75 | 73/75 (contaminado) | 73/75 |
| Golden (21) | 18/21 | 19/21 | 19/21 | 19/21 |
| Val (942, páginas no vistas) | 631/942 | 757/942 | 909/942 | 909/942 |

La puntuación de 73/75 en abreviaturas está contaminada porque la variante "full" vio esas abreviaturas en entrenamiento. La medida limpia proviene de la variante "strict", entrenada sin ninguna consulta que las contenga: 67/75 por sí sola y 71/75 de acierto de enlace dentro del bucle de agente de RiverGuide.

Evaluación sobre preguntas reales de estudiantes (523 primeras consultas distintas, septiembre-octubre de 2026; top 5 juzgado a ciegas por Qwen3.8-27B; solo se conservaron recuentos agregados):

| Búsqueda sobre las palabras del estudiante | Preguntas respondidas |
|---|---|
| BM25 (producción en ese momento) | 309 (59%) |
| Qwen3-Embedding-0.6B sin afinar | 414 (79%) |
| riverguide-retriever-full | 458 (88%) |

Comparación directa: este modelo respondió 160 preguntas que la búsqueda por palabras clave falló; la búsqueda por palabras clave respondió 11 que este modelo falló.

Experimento de búsqueda previa en el bucle de agente (conjunto golden de 54 preguntas, Qwen3.8-27B como modelo de respuesta):

| Métrica | Sin búsqueda previa | Búsqueda previa con este modelo | Búsqueda previa con BM25 |
|---|---|---|---|
| Llamadas al modelo por pregunta | 2,17 | 1,35 | No disponible |
| Preguntas resueltas en una sola llamada | 8 de 54 | 38 de 54 | No disponible |
| Latencia mediana de respuesta | 6,9 s | 5,0 s | No disponible |
| Preguntas superadas | 43 | 45 | 41 |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,2 GB con pesos en fp16/bf16 (tamaño del repositorio); en torno a 2,4 GB si se carga en fp32. Estimaciones propias a partir del número de parámetros, no publicadas por el autor.
- Cabe holgadamente en cualquier GPU de consumo: RTX 4090 (la usada para entrenar), RTX 3090, RTX 4080, RTX 4060 Ti e incluso GPUs de portátil con 8 GB. También es viable en CPU para volúmenes moderados.
- GPU profesionales: A100, H100 o L4 no son necesarias para la inferencia; se justifican para indexar corpus grandes en paralelo.
- Despliegue: sentence-transformers (referencia en la model card), text-embeddings-inference (declarado en los tags), servidores de embeddings compatibles con endpoints. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia no verificada.
- Throughput y latencia: no se publican cifras de inferencia aislada. El dato indirecto es el experimento de búsqueda previa, donde la latencia mediana de respuesta completa del asistente bajó de 6,9 s a 5,0 s.
- Coste de indexación: se codifican 5.923 fragmentos de 2.389 páginas para el corpus del IRSC; el entrenamiento completo de una época ocupó unos 40 minutos en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| riverguide-retriever-full | 595.776.512 | No disponible | Bi-encoder denso afinado para IRSC, inglés | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-Embedding-0.6B | Aproximadamente 0,6B | No disponible en esta ficha | Bi-encoder denso generalista, multilingüe según su model card | Apache 2.0 (según el modelo base) | HuggingFace, modelo de referencia |
| BM25 (búsqueda léxica) | No aplica | No aplica | Recuperación por coincidencia de términos | No aplica | Integrado en motores de búsqueda |
| Qwen3-Reranker-0.6B | Aproximadamente 0,6B | No disponible | Cross-encoder de reordenación, usado como juez en el entrenamiento | No disponible en esta ficha | HuggingFace |

Frente al modelo base sin afinar, la diferencia medida es de 757/942 a 909/942 en el conjunto val y de 414 a 458 preguntas respondidas sobre 523 consultas reales. Frente a BM25, la ventaja es de 631/942 a 909/942 en val y de 309 a 458 en consultas reales. La comparación con el híbrido resulta en empate en los tres conjuntos reportados.

## Limitaciones y advertencias

- Dominio cerrado: aprendió nombres, programas y jerga del Indian River State College. En otro centro debería seguir superando a la búsqueda por palabras clave en preguntas generales, pero la ganancia completa exige reentrenar sobre las páginas propias.
- Contaminación de la métrica principal: el 73/75 en abreviaturas de la variante "full" incluye en entrenamiento las consultas de test. La cifra honesta es 67/75 de la variante "strict".
- Sesgo del evaluador: el juez que puntuó las respuestas (Qwen3.8-27B) pertenece a la misma familia que generó las consultas de entrenamiento, lo que puede inflar los resultados. El autor lo señala explícitamente.
- Ruido estadístico: los experimentos del bucle de agente son ejecuciones únicas, con aproximadamente ±2 preguntas de ruido sobre el conjunto golden de 54.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente.
- Idioma único: solo inglés. No cubre consultas en castellano ni en otras lenguas.
- Dependencia estricta del prefijo: omitir el prefijo de instrucción en las consultas degrada la recuperación; los fragmentos, en cambio, se codifican como texto plano.
- Los hechos viven en las páginas, no en el modelo: tarifas, fechas y políticas pueden quedar desactualizadas si no se re-embebben las páginas modificadas. Es necesario reentrenar cuando cambia el vocabulario institucional (nuevos programas o denominaciones).
- No es un modelo generativo: no produce respuestas, no razona y no soporta tool calling; debe combinarse con un LLM y, opcionalmente, con un reranker.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se han identificado restricciones adicionales en la información disponible. Conviene verificar la licencia del modelo base y de los datos del sitio indexado antes de un despliegue comercial.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero un pipeline que use estos fragmentos como contexto puede producir respuestas incorrectas si la recuperación falla; el fallo se traslada al generador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joeltcook/riverguide-retriever-full
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio del proyecto: https://github.com/joelcook/riverguide-retriever
- Demo del asistente RiverGuide: https://chat.riverboard.org
