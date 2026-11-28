# masakanomasaka/llm2026-ruri-v3-reranker-310m-ft-v2

## Resumen

llm2026-ruri-v3-reranker-310m-ft-v2 es un modelo de reranking (reordenación de resultados de búsqueda) para japonés, desarrollado por el usuario masakanomasaka como proyecto final del curso "LLM講座2 2026". Se trata de un fine-tuning completo (todos los parámetros, una época) del modelo cl-nagoya/ruri-v3-reranker-310m, que a su vez es un reranker basado en la arquitectura ModernBERT.

El modelo resuelve el problema de la segunda fase de recuperación de información: dado un conjunto de documentos candidatos devueltos por un retriever inicial (por ejemplo, búsqueda léxica o embeddings), el reranker puntúa cada par consulta-documento para mejorar la precisión del ranking final. Con 315.203.329 parámetros (aproximadamente 315 M) y un tamaño de repositorio de 1,3 GB, está pensado para ser desplegable en entornos modestos, incluido hardware de consumo.

Es relevante ahora porque continúa la línea de los rerankers japoneses de la familia ruri, añadiendo un ajuste específico sobre datos de control de calidad (JSQuAD/JGLUE y JEMHopQA) orientado a distinguir fragmentos que contienen la respuesta de los que no. La información pública disponible es muy limitada: no hay pipeline declarado, ni licencia explícita, ni idiomas declarados en los metadatos, ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional, tag `modernbert` en Hugging Face) |
| Parametros totales | 315.203.329 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no declarada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8/INT4) |
| Idiomas soportados | no disponible en metadatos; el modelo base y los datos de entrenamiento son en japones |
| Licencia | no disponible en metadatos; la model card indica que se rige por la licencia del modelo base (cl-nagoya/ruri-v3-reranker-310m), no especificada en la informacion proporcionada |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,3 GB |
| Modelo base | cl-nagoya/ruri-v3-reranker-310m |
| Tipo de tarea | reranking (cross-encoder consulta-documento) |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un encoder transformer bidireccional con atención de tipo full (no causal), optimizado para tareas de comprensión y clasificación. El modelo es un cross-encoder de reranking: recibe un par (consulta, documento) y produce una puntuación de relevancia. La model card afirma explícitamente que "la estructura del modelo es idéntica a la del modelo original", por lo que el fine-tuning no altera la arquitectura, solo los pesos.

El entrenamiento consistió en un ajuste completo de todos los parámetros durante una época, ejecutado íntegramente en Google Colab. Los datos de entrenamiento son: (1) JSQuAD/JGLUE, con licencia CC BY-SA 4.0, donde para cada pregunta se seleccionaron mecánicamente fragmentos que contienen la respuesta correcta y fragmentos que no la contienen, y se formatearon para el entrenamiento; (2) el split de train de JEMHopQA, filtrado y reformateado, bajo la licencia indicada en su repositorio; y (3) un conjunto de fragmentos distribuidos derivado de Wikipedia en japonés (CC BY-SA 4.0). No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (poco habituales en un reranker de este tipo).

## Capacidades

- Reranking de pares consulta-documento en japonés: asigna una puntuación de relevancia a cada candidato para reordenar los resultados de un retriever.
- Discriminación de fragmentos con y sin respuesta: el entrenamiento sobre JSQuAD se diseñó específicamente para que el modelo distinga fragmentos que contienen la respuesta de los que no.
- Preguntas multi-salto: el uso de JEMHopQA en el entrenamiento apunta a cierto soporte para consultas que requieren razonamiento sobre varias entidades o hechos.
- Comprensión lectora implícita: al derivar de un encoder bidireccional, puede explotar la interacción completa entre consulta y documento, a diferencia de los bi-encoders.
- Tool calling / function calling: no disponible; no es una capacidad propia de un modelo de reranking.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad autónoma; su función es la de componente dentro de un pipeline de recuperación.
- Capacidades multilingües: no disponibles en los metadatos; el modelo base y los datos de entrenamiento son en japonés.
- Modo thinking, visión o audio: no disponibles; el modelo es exclusivamente textual.

## Casos de uso

- Segunda fase de un pipeline RAG en japonés: tras una recuperación inicial con embeddings o BM25, el modelo reordena los 50-100 candidatos y se seleccionan los 5-10 mejores para el prompt del generador, mejorando la precisión del contexto inyectado.
- Búsqueda documental interna en empresas japonesas: reordenación de resultados de manuales, políticas o bases de conocimiento en japonés, donde la distinción entre fragmentos con y sin la respuesta es crítica.
- Atención al cliente con base de conocimiento: reordenación de artículos de FAQ o tickets resueltos antes de pasarlos a un LLM generador, reduciendo respuestas alucinadas por contexto irrelevante.
- Preguntas multi-salto sobre Wikipedia en japonés: el entrenamiento con JEMHopQA lo hace adecuado para reordenar evidencias que requieren combinar información de varios pasajes.
- Evaluación y filtrado de datasets de QA: uso del score del reranker para descartar pares consulta-respuesta de baja calidad en la curación de datasets en japonés.
- Componente de evaluación en sistemas de búsqueda: medición de la relevancia de un ranking mediante las puntuaciones del modelo, como señal auxiliar en pruebas A/B de motores de búsqueda.
- Prototipado en Google Colab o portátiles: con 315 M de parámetros y 1,3 GB de pesos, cabe en GPU de consumo y permite experimentar con pipelines de reranking sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (nDCG, MRR, precisión@k) ni comparaciones con el modelo base, por lo que no es posible cuantificar la mejora del fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,7-1 GB solo para pesos (315 M de parámetros), más memoria para activaciones y batch; en la práctica, 2-4 GB son suficientes para batches moderados.
- VRAM estimada en cuantización INT8: alrededor de 0,4-0,5 GB para pesos; en INT4, unos 0,2-0,3 GB. No se distribuyen variantes cuantizadas oficiales, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para producción de alto throughput, A100/H100 o L4.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: al ser un modelo ModernBERT en safetensors, es compatible con Hugging Face Transformers, Text Embeddings Inference (TEI) de Hugging Face y vLLM (soporte de ModernBERT para tareas de clasificación/reranking según versión). llama.cpp y Ollama requieren conversión a GGUF, no documentada en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm2026-ruri-v3-reranker-310m-ft-v2 | 315 M | no disponible | Reranking japonés | no disponible (hereda la del base) | Hugging Face |
| cl-nagoya/ruri-v3-reranker-310m | no disponible en la informacion proporcionada | no disponible | Reranking japonés | no disponible en la informacion proporcionada | Hugging Face |
| BAAI/bge-reranker-v2-m3 | no disponible en la informacion proporcionada | no disponible | Reranking multilingüe | no disponible en la informacion proporcionada | Hugging Face |
| jinaai/jina-reranker-v2-base-multilingual | no disponible en la informacion proporcionada | no disponible | Reranking multilingüe | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo para ninguno de los modelos de la tabla en la información proporcionada, por lo que la comparación se limita a la categoría funcional y la disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre Wikipedia en japonés y datasets de QA japoneses, puede heredar los sesgos de cobertura y representación de esas fuentes.
- Riesgo de alucinación: bajo en el sentido generativo (no genera texto), pero el score de relevancia puede ser poco fiable fuera del dominio de entrenamiento (QA extractivo y multi-salto sobre Wikipedia).
- Limitaciones de contexto e idioma: la longitud máxima de contexto no está declarada; el modelo está orientado al japonés y no hay evidencia de buen rendimiento en otros idiomas.
- Restricciones de licencia: la licencia no está declarada en los metadatos y la model card remite a la del modelo base sin especificarla; antes de un uso comercial es imprescindible verificar la licencia de cl-nagoya/ruri-v3-reranker-310m. Los datos de entrenamiento incluyen material CC BY-SA 4.0 (JSQuAD/JGLUE y fragmentos de Wikipedia), lo que puede imponer obligaciones de atribución y compartir-igual.
- Caveat para producción: es un modelo de proyecto de curso, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni validación externa; no se recomienda como componente crítico sin una evaluación propia sobre el dominio objetivo.
- Sin pipeline declarado en los metadatos: es necesario configurar manualmente la cabeza de clasificación o el uso como cross-encoder en Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masakanomasaka/llm2026-ruri-v3-reranker-310m-ft-v2
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- JEMHopQA: https://github.com/aiishii/JEMHopQA
