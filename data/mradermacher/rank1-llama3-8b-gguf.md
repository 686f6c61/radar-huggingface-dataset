# mradermacher/rank1-llama3-8b-GGUF

## Resumen

Rank1-llama3-8b es un modelo de reranking (segunda fase de recuperación de información) construido sobre la base de Llama 3 de 8.000 millones de parámetros y entrenado por el grupo JHU-CLSP (Johns Hopkins University, Center for Language and Speech Processing). El modelo original, `jhu-clsp/rank1-llama3-8b`, se distribuye con licencia MIT y está especializado en puntuar la relevancia de pares consulta-documento dentro de pipelines de búsqueda y RAG (retrieval-augmented generation). Esta ficha describe la versión cuantizada en formato GGUF publicada por el usuario mradermacher, que facilita su ejecución en entornos con recursos limitados mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que las cuantizaciones GGUF de mradermacher permiten desplegar un reranker de 8B en hardware de consumo, algo imposible con los pesos originales en precisión completa (16,2 GB en f16). El repositorio incluye once variantes de cuantización que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB), lo que permite ajustar el equilibrio entre calidad y huella de memoria según el escenario.

No se dispone de información pública sobre la longitud de contexto efectiva del modelo base, la composición exacta del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada; estos datos se marcan como "no disponible" en las secciones correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3), adaptada como reranker |
| Parámetros totales | 8.030.785.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Llama 3 de 8B, reutilizado como reranker de relevancia. En lugar de generar texto libre, el modelo se emplea para puntuar pares consulta-documento, una tarea típica de la segunda fase de un pipeline de recuperación (retrieval). El autor original es jhu-clsp, y el dataset de entrenamiento declarado es `jhu-clsp/rank1-training-data`. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado específico.

La innovación principal de esta publicación no reside en el modelo en sí, sino en la conversión a GGUF realizada por mradermacher, que permite ejecutar el reranker con llama.cpp y herramientas compatibles. El autor indica que no ha publicado cuantizaciones ponderadas (imatrix) para este modelo, solo cuantizaciones estáticas. No se dispone de detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones internas.

## Capacidades

- Reranking de pares consulta-documento: puntuación de relevancia para reordenar resultados de un retriever de primera fase.
- Recuperación de información (retrieval) en pipelines RAG: selección de los fragmentos más relevantes antes de pasarlos a un LLM generador.
- Procesamiento en inglés: el modelo está entrenado y etiquetado únicamente para inglés.
- Ejecución local con llama.cpp y ecosistema GGUF: compatible con herramientas que consumen archivos GGUF.
- Integración en pipelines de búsqueda: pensado para ser invocado como componente de scoring, no como generador conversacional.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Reranking en pipelines RAG: tras una búsqueda vectorial que devuelve, por ejemplo, 100 candidatos, el modelo puntúa cada par consulta-fragmento y permite seleccionar los 5-10 más relevantes antes de la generación, mejorando la precisión de las respuestas.
- Búsqueda empresarial interna: reordenación de resultados de un motor de búsqueda sobre documentación corporativa en inglés, usando la cuantización Q4_K_M (5,0 GB) para despliegue en servidores modestos.
- Atención al cliente con base de conocimiento: selección de artículos de ayuda relevantes antes de que un LLM genere la respuesta, reduciendo alucinaciones al limitar el contexto a pasajes verificados.
- Sistemas de preguntas y respuestas sobre documentación técnica: filtrado de secciones de manuales o APIs antes de la síntesis de respuesta.
- Evaluación de relevancia en datasets de recuperación: uso del modelo como juez de relevancia para construir o validar conjuntos de datos de entrenamiento de retrievers.
- Despliegue en hardware de consumo para prototipado: la variante Q4_K_S (4,8 GB) permite probar el reranker en una GPU de consumo con 8 GB de VRAM, algo inviable con los pesos f16.
- Filtrado de resultados en motores de búsqueda académica o legal en inglés: reordenación de pasajes recuperados por similitud semántica para priorizar los más pertinentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q3_K_M: ~4,1 GB
  - Q4_K_S / Q4_K_M: ~4,8-5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4090 (24 GB) o A100/H100 ofrecen margen amplio; para f16, se recomienda A100 40 GB, H100 o dos GPU de 24 GB.
- Cabe en GPU de consumo: sí, las variantes Q2_K a Q6_K caben en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB; f16 no cabe en GPU de consumo de 24 GB con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero esta publicación GGUF está orientada a llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rank1-llama3-8b (esta ficha, GGUF) | 8,03 B | no disponible | MIT | GGUF | Reranker especializado, cuantizaciones de 3,3 a 16,2 GB |
| jhu-clsp/rank1-llama3-8b (base) | 8,03 B | no disponible | MIT | safetensors | Pesos originales, requieren más VRAM |
| bge-reranker-v2-m3 | no disponible en la información | no disponible | no disponible | no disponible | Reranker multilingüe de referencia; datos no verificados aquí |
| mxbai-rerank-large-v1 | no disponible en la información | no disponible | no disponible | no disponible | Reranker basado en transformer; datos no verificados aquí |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no soporta consultas ni documentos en castellano u otros idiomas.
- Es un reranker, no un generador: no debe usarse para generar texto libre ni para conversación; su salida es una puntuación de relevancia.
- Riesgo de sesgo: al derivar de Llama 3, puede heredar sesgos presentes en los datos de preentrenamiento de Llama 3, aunque no se documentan análisis específicos.
- Riesgo de alucinación: menor que en un generador, pero el modelo puede puntuar de forma inconsistente documentos ambiguos o fuera de dominio.
- Licencia MIT: permite uso comercial, pero el modelo base Llama 3 tiene su propia licencia (Llama 3 Community License) que puede imponer restricciones adicionales; conviene verificar la cadena de licencias antes de producción.
- Cuantizaciones agresivas (Q2_K, Q3_K) degradan la calidad de puntuación; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix publicadas por el autor para este modelo, lo que limita la calidad frente a cuantizaciones ponderadas.
- Contexto efectivo no documentado: no se conoce la longitud máxima de entrada soportada, lo que afecta al tamaño de los pasajes que se pueden puntuar.
- El repositorio tiene pocas descargas (168) y ningún "like", lo que sugiere validación comunitaria limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/rank1-llama3-8b-GGUF
- Modelo base: https://huggingface.co/jhu-clsp/rank1-llama3-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/jhu-clsp/rank1-training-data
- Página de descargas del autor: https://hf.tst.eu/model#rank1-llama3-8b-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
