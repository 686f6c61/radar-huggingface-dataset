# altslate/indic-rerank-small

## Resumen

indic-rerank-small es un modelo de reranking (cross-encoder) de 140 millones de parámetros desarrollado por altslate, especializado en búsqueda en lenguas indias. Su particularidad es que acepta consultas escritas en alfabeto latino (romanizadas, del estilo "bharat mein kitne rajya hain") contra pasajes en escritura nativa, algo que los rerankers multilingües convencionales no resuelven bien. Se construye mediante destilación de BAAI/bge-reranker-v2-m3 (568M) sobre el encoder jhu-clsp/mmBERT-small.

El modelo está entrenado y evaluado en hindi, bengalí y telugu, las lenguas indias presentes en MIRACL, además de mantener un rendimiento aceptable en inglés. Recibe pares (consulta, pasaje) procedentes de un retriever de primera etapa (BM25 o un modelo de embeddings como altslate/indic-embed-small) y devuelve una puntuación de relevancia por par, lo que permite reordenar los candidatos antes de presentarlos al usuario.

Es relevante para desarrolladores que construyen buscadores o sistemas RAG sobre corpus en lenguas indias donde los usuarios escriben con teclado latino (hinglish, transliteración informal). El modelo se distribuye con licencia Apache 2.0, pesos safetensors y exportaciones ONNX fp32 y fp16 para su uso en el navegador con transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small) como cross-encoder de clasificación por pares |
| Parametros totales | 140.641.921 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens por par (truncación `only_second`, `max_length=384`) |
| Tipos de cuantizacion | fp32 y fp16 en ONNX; sin int8 (el autor descartó int8 por pérdida de calidad) |
| Idiomas soportados | hi, bn, te, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx` fp32 563 MB, `onnx/model_fp16.onnx` 282 MB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en jhu-clsp/mmBERT-small, un encoder ModernBERT multilingüe de aproximadamente 140M de parámetros. Cada par (consulta, pasaje) se codifica conjuntamente con el tokenizador aplicando truncación solo al segundo segmento y una longitud máxima de 384 tokens; la salida de clasificación se pasa por una sigmoide para obtener una puntuación entre 0 y 1. La cabeza de clasificación produce un único logit de relevancia por par (`logits[:, 0]`).

El entrenamiento consiste en una destilación de BAAI/bge-reranker-v2-m3 (568M) hacia mmBERT-small. El profesor no maneja consultas romanizadas (según el autor, en su prueba no reordena mejor que dejar los candidatos en su orden original), por lo que el modelo se entrenó para asignar a una consulta romanizada las puntuaciones que el profesor asigna a la consulta en escritura nativa. Los datos de entrenamiento son pasajes de Wikipedia y consultas romanizadas mediante un romanizador basado en diccionario y reglas; no se usaron consultas romanizadas escritas por personas. Todos los pares de entrenamiento son del mismo idioma.

## Capacidades

- Reranking de pares (consulta, pasaje) con puntuación de relevancia en el rango 0–1 tras aplicar sigmoide.
- Manejo de consultas en alfabeto latino (romanizadas, hinglish) contra pasajes en escritura nativa del mismo idioma.
- Soporte de hindi, bengalí y telugu como lenguas principales, con rendimiento aceptable en inglés.
- Integración con sentence-transformers (`CrossEncoder`, método `rank`).
- Exportación ONNX para ejecución en navegador o Node mediante transformers.js.
- Compatibilidad con text-embeddings-inference y endpoints según los tags del repositorio.
- No dispone de tool calling, capacidades de agente, visión ni audio: es un modelo de clasificación de pares, no generativo.

## Casos de uso

- Búsqueda web o documental en hindi, bengalí y telugu: se recuperan candidatos con BM25 o un embedder de primera etapa y se reordenan con el modelo; la ventana de 384 tokens es suficiente para pasajes de Wikipedia y fragmentos de documento.
- Búsqueda con teclado latino (hinglish): usuarios que escriben "bharat mein kitne rajya hain" obtienen resultados relevantes sobre pasajes en devanagari, gracias al entrenamiento específico sobre consultas romanizadas.
- RAG sobre corpus en lenguas indias: reordenar los fragmentos recuperados antes de pasarlos al generador reduce el ruido contextual; funciona bien con pasajes de tipo enciclopédico.
- Búsqueda en el navegador sin backend: la exportación ONNX fp16 (282 MB) permite ejecutar el reranker del lado del cliente con transformers.js, útil para aplicaciones con requisitos de privacidad o sin infraestructura GPU.
- Filtrado de duplicados o selección de contexto en pipelines de datos: puntuar pares consulta-pasaje para descartar candidatos irrelevantes antes de etapas costosas.
- Evaluación y ajuste de retrievers de primera etapa: el modelo sirve como juez de relevancia para medir la calidad de un índice BM25 o de embeddings en lenguas indias.
- Atención al cliente en India con consultas mixtas: reordenar artículos de ayuda cuando el usuario escribe en transliteración latina y la base de conocimiento está en escritura nativa.

## Benchmarks y rendimiento

Evaluación sobre mteb/MIRACLReranking con las consultas de dev (350 por idioma, 100 candidatos por consulta, etiquetas humanas), métrica nDCG@10. No se usaron consultas de dev en entrenamiento.

| Modelo | Params | Nativas (hi / bn / te) | Romanizadas (hi / bn / te) | Inglés |
|---|---|---|---|---|
| altslate/indic-rerank-small | 140M | 0.806 (0.693 / 0.811 / 0.914) | 0.756 (0.614 / 0.763 / 0.892) | 0.645 |
| BAAI/bge-reranker-v2-m3 (profesor) | 568M | 0.857 (0.754 / 0.859 / 0.958) | 0.560 (0.483 / 0.503 / 0.695) | 0.746 |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 118M | 0.774 (0.676 / 0.754 / 0.892) | 0.264 (0.175 / 0.189 / 0.429) | 0.680 |
| Sin reranking (orden original) | – | 0.565 | 0.565 | 0.420 |

Las consultas romanizadas del test se generaron con el mismo romanizador por reglas y diccionario usado en entrenamiento (con otra semilla), lo que favorece al modelo; no hay consultas romanizadas escritas por humanos en la evaluación. En ONNX fp16, el nDCG@10 se mantiene dentro de ±0.015 respecto a PyTorch sobre 15 consultas de dev por idioma.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 para inferencia (140M parámetros); en fp16 aproximadamente 300 MB de pesos.
- Cabe en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, y también en CPU para volúmenes moderados.
- GPU recomendadas para producción de alto throughput: A100, H100 o L4 con vLLM/TEI; el modelo es pequeño y el cuello de botella suele ser el número de pares a puntuar, no la memoria.
- Despliegue: sentence-transformers, transformers (`AutoModelForSequenceClassification`), ONNX Runtime, transformers.js en navegador o Node, y text-embeddings-inference según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. La puntuación requiere una pasada por cada par, por lo que el coste escala linealmente con el número de candidatos.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Romanizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| altslate/indic-rerank-small | 140M | 384 tokens | Sí (hi/bn/te) | Apache 2.0 | Hugging Face, ONNX |
| BAAI/bge-reranker-v2-m3 | 568M | 8192 tokens (según modelo base) | No (0.560 en el test) | Apache 2.0 | Hugging Face |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 118M | 384 tokens | Muy limitado (0.264) | Apache 2.0 | Hugging Face |

Frente al profesor, indic-rerank-small pierde 0.051 puntos de nDCG@10 en consultas nativas pero gana 0.196 en romanizadas con una cuarta parte de los parámetros. Frente a mMiniLM, gana en nativas (0.806 vs 0.774) y de forma muy amplia en romanizadas. En inglés puro, tanto el profesor como mMiniLM superan a este modelo.

## Limitaciones y advertencias

- Consulta y pasaje deben estar en el mismo idioma; los pares entre idiomas puntúan cerca de cero aunque el pasaje sea una traducción exacta.
- Solo se entrenó con consultas en hindi, bengalí y telugu; otras lenguas indias no están probadas y la calidad esperada es menor.
- Por debajo del profesor en consultas en escritura nativa (0.806 frente a 0.857).
- Los pasajes de entrenamiento son párrafos de Wikipedia; el texto conversacional o de búsqueda de producto no está probado.
- Las consultas romanizadas se generaron por reglas y diccionario, no por personas; abreviaturas intensas o grafías inusuales están peor cubiertas.
- En inglés no se entrenó y es inferior a alternativas específicas; para búsqueda solo en inglés conviene otro reranker.
- El truncado a 384 tokens puede perder información en pasajes largos.
- Riesgo de alucinación no aplica directamente (no genera texto), pero las puntuaciones pueden ser poco calibradas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altslate/indic-rerank-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Profesor de destilación: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Modelo de embeddings complementario: https://huggingface.co/altslate/indic-embed-small
- Comparativa mMiniLM: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Dataset de evaluación: https://huggingface.co/datasets/mteb/MIRACLReranking
