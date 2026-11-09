# Chawtin01/Opal-Recall

## Resumen

Opal-Recall es un modelo de embeddings de frases (sentence embeddings) obtenido mediante fine-tuning de BAAI/bge-small-en-v1.5, un transformer BERT de 33,36 millones de parámetros. Lo desarrolla el usuario Chawtin01 como componente de búsqueda de memoria dentro de la aplicación IMPERIAL, cuyo objetivo es localizar en el propio iPhone el recuerdo guardado, mensaje previo o pasaje de libro más relevante para lo que dice el usuario. Es, por tanto, un modelo de recuperación semántica orientado a un caso de uso muy concreto: búsqueda local de memorias personales y fragmentos literarios en un dispositivo móvil.

El modelo se ha afinado sobre 13.644 ejemplos generados sintéticamente: preguntas redactadas por Qwen/Qwen3-14B-AWQ sobre pasajes de novelas de dominio público de Project Gutenberg, memorias inventadas y mensajes de conversaciones de práctica generadas por modelos abiertos. No se ha utilizado ningún dato real de usuarios. La relevancia actual del modelo es limitada y acotada: no es un modelo de propósito general, sino un artefacto de recuperación semántica pequeño, cuantizable y desplegable en local, publicado con licencia MIT y con pesos en safetensors y ONNX, lo que facilita su uso con transformers.js en el navegador o en aplicaciones móviles.

Al estar basado en bge-small-en-v1.5, hereda la arquitectura BERT pequeña y el enfoque de embeddings densos para recuperación, pero no se han publicado especificaciones completas de contexto, idiomas ni cuantizaciones más allá de lo indicado en la model card. El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que refleja que se trata de una publicación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), base BAAI/bge-small-en-v1.5 |
| Parámetros totales | 33.360.000 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo incluye safetensors y ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (el modelo base es en inglés; la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La arquitectura es la de BAAI/bge-small-en-v1.5, un transformer tipo BERT de 33,36 millones de parámetros orientado a la generación de embeddings de frases. El fine-tuning se realizó sobre 13.644 ejemplos construidos a partir de tres fuentes: preguntas generadas por Qwen/Qwen3-14B-AWQ (licencia Apache 2.0) sobre pasajes de novelas de dominio público de Project Gutenberg, memorias inventadas y mensajes de conversaciones de práctica redactados por modelos abiertos. No se emplearon datos reales de usuarios.

La model card indica que la inferencia debe usar CLS pooling y normalización de los vectores resultantes, lo que es coherente con el uso habitual de bge-small como modelo de recuperación densa. No se detallan en la información disponible ni el número total de tokens de entrenamiento, ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el valor del modelo reside en el ajuste específico al dominio de búsqueda de memorias y pasajes.

## Capacidades

- Generación de embeddings de frases para recuperación semántica (feature-extraction).
- Búsqueda de memorias guardadas, mensajes previos y pasajes de libros a partir de una consulta en lenguaje natural.
- Puntuación de relevancia: según la model card, puntuaciones por debajo de 0,81 se interpretan como "no relevante".
- Uso con sentence-transformers y con transformers.js (despliegue en navegador o en aplicaciones móviles vía ONNX).
- Compatible con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo base es en inglés y la model card no declara otros idiomas.

## Casos de uso

- Búsqueda de memorias personales en el dispositivo: la aplicación IMPERIAL usa el modelo para encontrar, entre los recuerdos guardados por el usuario, el más relevante para la consulta actual, con recuperación local en el iPhone y sin enviar datos a servidores externos.
- Recuperación de mensajes previos en conversaciones: dado un mensaje nuevo, el modelo permite localizar intercambios anteriores relacionados semánticamente, útil para asistentes que necesitan mantener continuidad sin almacenar todo el historial en el contexto del LLM.
- Búsqueda de pasajes en libros de dominio público: el modelo se entrenó con pasajes de novelas de Project Gutenberg, por lo que es adecuado para aplicaciones de lectura que quieran recuperar fragmentos por similitud semántica con una consulta del lector.
- Indexación y búsqueda local en aplicaciones móviles: al ser un modelo de 33 millones de parámetros con pesos ONNX y licencia MIT, puede integrarse en apps iOS o Android para construir índices vectoriales pequeños y ejecutar la búsqueda en el propio dispositivo.
- Filtrado de relevancia en pipelines RAG: la puntuación de relevancia del modelo (umbral 0,81 según la model card) puede usarse como paso de descarte antes de enviar fragmentos a un LLM generador, reduciendo coste y latencia.
- Prototipado rápido de sistemas de recuperación en el navegador: gracias al soporte de transformers.js, el modelo puede probarse en demos web sin infraestructura de servidor.
- Búsqueda semántica en corpus literarios o de ficción: el ajuste con pasajes de novelas lo hace especialmente adecuado para aplicaciones de exploración de textos narrativos.

## Benchmarks y rendimiento

La model card proporciona métricas de recuperación sobre conjuntos de evaluación reservados (held-out), expresadas como recall@1 y recall@5:

| Conjunto | Recall@1 | Recall@5 |
|---|---|---|
| memory | 0,348 | 0,636 |
| book | 0,419 | 0,694 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, etc.) en la información disponible, ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 33,36 millones de parámetros, los pesos en precisión completa ocupan aproximadamente 0,13 GB; en fp16, unos 0,07 GB. La VRAM real dependerá del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060 o superiores. Para despliegues de alto throughput, A100 o H100 son válidas pero sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso puede ejecutarse en CPU con latencia aceptable para búsquedas puntuales.
- Opciones de despliegue: sentence-transformers, transformers.js (ONNX), text-embeddings-inference, y cualquier runtime compatible con ONNX. No se documenta soporte explícito de vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Chawtin01/Opal-Recall | 33,36 M | no disponible | MIT | Fine-tuning de bge-small-en-v1.5 para búsqueda de memorias y pasajes; métricas recall@1/recall@5 solo en dominios propios |
| BAAI/bge-small-en-v1.5 | no disponible en la información | no disponible | MIT (según el modelo base referenciado) | Modelo base; orientado a recuperación general en inglés; sin métricas comparables en esta ficha |
| Otros modelos de embeddings pequeños (p. ej., familia all-MiniLM) | no disponible en la información | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para una comparación numérica |

No se dispone de datos de benchmarks comparativos entre Opal-Recall y alternativas en la información proporcionada; la comparación anterior es estructural y no de rendimiento.

## Limitaciones y advertencias

- El modelo está ajustado a un dominio muy específico (memorias inventadas, pasajes de Gutenberg y mensajes de práctica); su rendimiento fuera de ese dominio no está documentado.
- Las métricas publicadas son moderadas (recall@1 de 0,348 en memory y 0,419 en book), lo que implica que la primera posición acierta en menos de la mitad de los casos; el recall@5 es más útil para pipelines que reordenan después.
- El umbral de relevancia de 0,81 indicado en la model card es específico del dominio de entrenamiento y no debe trasladarse sin validación a otros corpus.
- El modelo base es en inglés; no se declaran idiomas soportados, por lo que el uso en castellano u otros idiomas no está garantizado.
- Riesgo de sesgos: los datos de entrenamiento son sintéticos y generados por modelos, lo que puede introducir sesgos de los generadores (Qwen3-14B-AWQ y modelos abiertos no especificados) y artefactos de estilo.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto; el riesgo se traslada a los LLM que consuman sus resultados, que pueden recibir fragmentos poco relevantes si el umbral no se calibra.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar las licencias de los datos de entrenamiento derivados (Project Gutenberg es de dominio público; las preguntas generadas por Qwen3-14B-AWQ están bajo Apache 2.0 según la model card).
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de validación independiente.
- No se documentan limitaciones de longitud de contexto; debe verificarse empíricamente antes de usarlo con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chawtin01/Opal-Recall
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Generador de preguntas de entrenamiento: https://huggingface.co/Qwen/Qwen3-14B-AWQ
- Project Gutenberg (fuente de pasajes de dominio público): https://www.gutenberg.org
- Librería sentence-transformers: https://www.sbert.net
- transformers.js: https://github.com/huggingface/transformers.js
