# Cutting3dg3/BGE_M3_TID_d_en_el

## Resumen

BGE_M3_TID_d_en_el es un ajuste fino (fine-tune) del modelo de embeddings multilingüe BAAI/bge-m3, desarrollado por el usuario Cutting3dg3. Su propósito es resolver un problema concreto en recuperación conversacional: cuando un usuario formula una pregunta en un diálogo, esa pregunta suele depender del contexto previo y no es autosuficiente para una búsqueda directa en una base de conocimiento. Este modelo evita el paso explícito de reescritura de la consulta (decontextualización textual) y embebe directamente el contexto conversacional en un espacio vectorial próximo al de la reescritura autosuficiente en inglés.

El modelo se entrenó sobre Doc2Dial, con contextos en inglés y en griego (traducidos automáticamente), y alinea ambos idiomas contra el embedding congelado de BGE-M3 de la reescritura de referencia en inglés. Está pensado, por tanto, para sistemas de búsqueda documental en asistentes conversacionales donde el idioma del usuario puede variar pero la base de conocimiento está en inglés.

Con 567,7 millones de parámetros y una arquitectura XLM-RoBERTa (la base de BGE-M3), es un modelo de tamaño medio, adecuado para despliegue en infraestructura estándar de embeddings. Su licencia MIT facilita la integración comercial, aunque su adopción es aún muy incipiente (0 descargas en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, base de BAAI/bge-m3) |
| Parámetros totales | 567.754.752 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado por la izquierda) |
| Tipos de cuantización | no disponible (formato safetensors; compatible con cuantización estándar de sentence-transformers, pero no documentada por el autor) |
| Idiomas soportados | inglés (en), griego (el) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-m3, un encoder transformer basado en XLM-RoBERTa con 567 millones de parámetros, y se ajusta para una tarea de similitud semántica orientada a la decontextualización implícita de consultas conversacionales. La entrada de entrenamiento son los últimos 5 turnos del contexto, unidos por el separador `" [SEP] "`, en inglés o en griego (Doc2Dial traducido automáticamente al griego). El objetivo es el embedding congelado de BGE-M3 de la reescritura dorada autosuficiente en inglés, para ambos idiomas, con una pérdida de similitud coseno (`1 - cos`).

Los datos provienen de Doc2Dial: se usan las filas 500 en adelante para entrenamiento, las filas 0-500 como conjunto de test reservado y las últimas 500 filas de entrenamiento como dev. La base de conocimiento asociada son proposiciones en inglés embebidas con BGE-M3 sin entrenar (dataset `Cutting3dg3/bge-m3-tid-chromadb`). La innovación principal es que el modelo aprende a mapear directamente el contexto conversacional al espacio de la reescritura en inglés, eliminando la necesidad de un paso de reescritura explícita en tiempo de consulta y permitiendo consultas en griego contra una base documental en inglés.

## Capacidades

- Generación de embeddings de frases y contextos conversacionales para similitud semántica y recuperación documental.
- Decontextualización implícita de la última pregunta del usuario a partir de los últimos 5 turnos de conversación.
- Recuperación conversacional (conversational retrieval) contra una base de conocimiento en inglés.
- Consultas en inglés y en griego alineadas en el mismo espacio vectorial.
- Extracción de características (feature-extraction) compatible con la librería sentence-transformers.
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Asistentes conversacionales con base documental en inglés: el modelo embebe los últimos turnos del diálogo y recupera directamente los documentos relevantes sin necesidad de un módulo de reescritura de consulta, reduciendo latencia y complejidad del pipeline.
- Atención al cliente multilingüe (inglés-griego): un usuario puede preguntar en griego dentro de una conversación y el sistema recupera documentación en inglés, gracias a la alineación de ambos idiomas contra el mismo espacio vectorial.
- Búsqueda en bases de conocimiento institucionales: por ejemplo, trámites administrativos o sanitarios (el ejemplo de la model card usa solicitudes de atención sanitaria de veteranos), donde las preguntas de seguimiento dependen del contexto previo.
- Sistemas RAG conversacionales: sustituye al par reescritura + embedding por un único paso de embedding del contexto, simplificando la arquitectura y el coste de inferencia.
- Chatbots de soporte técnico con historial de varios turnos: el truncado por la izquierda a 512 tokens preserva los turnos más recientes, que son los más relevantes para la consulta actual.
- Evaluación y prototipado de recuperación conversacional: útil para investigadores que trabajan con Doc2Dial y quieren comparar estrategias de decontextualización implícita frente a reescritura explícita.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las filas 0-500 reservadas para test, con base de conocimiento en inglés:

| Idioma de consulta | MAP | R@10 |
|---|---|---|
| Inglés | 54.13 | 72.93 |
| Griego | 49.68 | 69.53 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB de pesos; en fp16, alrededor de 1,2 GB.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y similares con holgura.
- GPUs de datacenter recomendadas para alto throughput: A100, H100, L40S.
- Despliegue mediante sentence-transformers, Text Embeddings Inference (TEI), vLLM (soporte de embeddings) o infraestructura de endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| BGE_M3_TID_d_en_el | 567,7 M | 512 tokens | en, el | MIT | Embeddings con decontextualización implícita |
| BAAI/bge-m3 (base) | 567,7 M | 8192 tokens | multilingüe | MIT | Embeddings multilingües de propósito general |
| Otros fine-tunes de BGE-M3 para retrieval conversacional | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base BGE-M3 ofrece una ventana de contexto mucho mayor (8192 tokens) y cobertura multilingüe amplia, pero no está especializado en decontextualización conversacional. Este fine-tune sacrifica contexto y cobertura idiomática a cambio de alineación específica para Doc2Dial en inglés y griego.

## Limitaciones y advertencias

- Ventana de contexto de solo 512 tokens, con truncado por la izquierda: conversaciones con más de 5 turnos o turnos muy largos pierden información.
- Entrenado exclusivamente sobre Doc2Dial (dominio de diálogos sobre servicios administrativos), por lo que la generalización a otros dominios conversacionales no está validada.
- El griego proviene de traducción automática del corpus original, lo que puede introducir ruido y artefactos de traducción.
- La base de conocimiento de referencia está en inglés; no se documenta el rendimiento con bases en otros idiomas.
- Sin datos publicados sobre sesgos, tasa de alucinación (no aplica generación, pero sí riesgo de recuperaciones irrelevantes) ni robustez fuera de dominio.
- Adopción prácticamente nula (0 descargas, 0 likes) y ausencia de validación externa: tratar como modelo experimental.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del corpus Doc2Dial y de la traducción automática empleada.
- No es un modelo generativo: no debe usarse para responder directamente, solo para recuperar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cutting3dg3/BGE_M3_TID_d_en_el
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Dataset de la base de conocimiento: https://huggingface.co/datasets/Cutting3dg3/bge-m3-tid-chromadb
