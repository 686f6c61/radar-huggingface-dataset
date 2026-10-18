# RR52/adl2026-hw2-reranker

## Resumen

RR52/adl2026-hw2-reranker es un cross-encoder de reordenamiento publicado en Hugging Face por el usuario RR52. Se trata de un ajuste fino de BAAI/bge-reranker-base, un modelo basado en la arquitectura XLM-RoBERTa con 278.044.417 parámetros que recibe un par (consulta, documento) y devuelve una única puntuación de relevancia. No es un modelo generativo: su función es reordenar una lista de candidatos previamente recuperada por un sistema de búsqueda léxica o vectorial.

El ajuste se ha realizado con la librería sentence-transformers, empleando la función de pérdida LambdaLoss sobre un conjunto de 4.830 pares, con una longitud máxima de secuencia de 512 tokens y una única etiqueta de salida. El repositorio ocupa 1,1 GB y contiene pesos en formato safetensors, coherentes con un modelo en precisión completa de 278 millones de parámetros.

Su relevancia práctica es acotada: se publicó el 18 de octubre de 2026 sin descargas ni valoraciones, sin licencia declarada y sin resultados de evaluación publicados. Por el contenido de los ejemplos de la model card, que enfrentan conversaciones de un asistente de compras con fichas de productos cosméticos, el ajuste parece orientado a reordenamiento de resultados en un dominio de comercio electrónico, aunque el autor no lo confirma explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer XLM-RoBERTa (modelo base BAAI/bge-reranker-base) |
| Parámetros totales | 278.044.417 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens por par (consulta + documento concatenados) |
| Tipos de cuantización | No se distribuyen variantes cuantizadas; el repositorio contiene pesos en precisión completa. Al ser un encoder tipo BERT, es convertible a INT8/ONNX, pero el autor no lo documenta |
| Idiomas soportados | No disponible (el modelo base XLM-RoBERTa tiene cobertura multilingüe, pero el autor no declara idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de un cross-encoder: un transformer XLM-RoBERTa que procesa la concatenación de la consulta y el documento con atención cruzada completa entre ambos, y aplica una cabeza de clasificación con una única etiqueta sobre el token de agregación. A diferencia de los bi-encoders, no genera embeddings independientes, sino una puntuación conjunta del par, lo que incrementa la precisión del reordenamiento a costa de una pasada completa de inferencia por cada par evaluado.

El entrenamiento parte de BAAI/bge-reranker-base (revisión `2cfc18c9415c912f9d8155881c133215df768a70`) y se ha realizado con el `CrossEncoderTrainer` de sentence-transformers usando LambdaLoss sobre 4.830 pares. El autor no documenta el número de tokens de entrenamiento, la composición del dataset, la procedencia de los datos ni si hubo etapas adicionales de ajuste. Tampoco se especifica la función de activación aplicada a la salida ni si la puntuación resultante está normalizada. Los ejemplos incluidos en la model card muestran pares formados por un diálogo de un asistente de compras y fichas de productos de cosmética, lo que sugiere un dominio de aplicación de comercio electrónico, sin que esto se declare formalmente.

## Capacidades

- Puntuación de relevancia de pares (consulta, documento) mediante un cross-encoder, con una única etiqueta de salida.
- Reordenamiento (reranking) de listas de candidatos recuperados por un sistema de primera fase.
- Búsqueda semántica de dos etapas: recuperación con bi-encoder o BM25 y reordenamiento con este modelo.
- Manejo de consultas conversacionales multi-turno concatenadas junto al documento, tal y como muestran los ejemplos de la model card.
- Procesamiento de documentos con metadatos estructurados (marca, categoría, características, especificaciones) en el mismo campo de texto.
- Longitud máxima de 512 tokens, suficiente para pasajes cortos y fichas de producto, insuficiente para documentos largos sin truncado o troceado.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales; su salida es exclusivamente una puntuación.

## Casos de uso

- Reordenamiento en buscadores de comercio electrónico: se recuperan entre 50 y 200 productos candidatos con un bi-encoder o un índice léxico y se reordenan con este cross-encoder; su entrenamiento sobre pares de conversación y ficha de producto encaja con consultas de compra en lenguaje natural.
- Segunda fase en pipelines RAG: dado un conjunto de fragmentos recuperados por similitud vectorial, el modelo puntúa cada par (pregunta, fragmento) para seleccionar los tres o cinco pasajes más relevantes antes de pasarlos al modelo generador, reduciendo el ruido en el contexto.
- Asistente conversacional de atención al cliente: se concatena el historial reciente del diálogo como consulta y se puntúan las entradas de una base de conocimiento o catálogo para ofrecer la respuesta o el artículo correcto.
- Búsqueda interna en documentación técnica: indexación de manuales troceados en pasajes de menos de 512 tokens y reordenamiento de los resultados por relevancia real frente a la consulta del desarrollador.
- Filtrado en sistemas de recomendación: puntuación de pares (perfil o consulta del usuario, ítem) para descartar candidatos poco relevantes antes de aplicar reglas de negocio o modelos de ranking más costosos.
- Control de calidad de datasets de recuperación: puntuación automática de pares etiquetados para detectar anotaciones incoherentes o negativos mal muestreados antes de reentrenar un modelo de recuperación.
- Deduplicación y detección de redundancia: puntuación cruzada de pasajes dentro de un mismo corpus para identificar fragmentos casi idénticos y reducir el índice.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de reordenamiento (nDCG@10, MRR@10, MAP), ni evaluación sobre colecciones estándar como MS MARCO, BEIR o MIRACL. Tampoco se han publicado comparaciones con el modelo base sin ajustar, por lo que no es posible determinar si el ajuste fino mejora o degrada el rendimiento original de BAAI/bge-reranker-base.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,11 GB (coincide con el tamaño del repositorio, 1,1 GB). En FP16, unos 0,56 GB; en INT8 dinámico, unos 0,28 GB.
- VRAM estimada para inferencia: 1,5-2 GB en FP16 con lotes pequeños; 3-4 GB con lotes de 32 pares a 512 tokens por las activaciones intermedias.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090. También es viable en CPU para volúmenes moderados, con latencia mucho mayor.
- GPU recomendadas para producción: NVIDIA L4, A10G o T4 para servicios de reordenamiento de bajo coste; A100 o H100 solo si se requiere reordenar lotes muy grandes con requisitos de latencia estrictos.
- Opciones de despliegue: sentence-transformers (`CrossEncoder.predict`), Hugging Face Text Embeddings Inference (el modelo incluye los tags `text-embeddings-inference` y `endpoints_compatible`), Hugging Face Inference Endpoints, exportación a ONNX con Optimum y ejecución con ONNX Runtime o Triton Inference Server. vLLM y llama.cpp no son aplicables porque no es un modelo generativo.
- Throughput y latencia: no disponibles. Como referencia estructural, el coste es lineal respecto al número de pares a puntuar, ya que cada par requiere una pasada completa por el encoder de 278 millones de parámetros con hasta 512 tokens.

## Comparativa con modelos similares

Datos de los modelos comparativos tomados de sus model cards públicas; no forman parte de la información proporcionada en esta ficha.

| Modelo | Parámetros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| RR52/adl2026-hw2-reranker | 278 M | 512 | Cross-encoder XLM-RoBERTa | No disponible | Ajuste fino sobre 4.830 pares con LambdaLoss; sin benchmarks publicados |
| BAAI/bge-reranker-base | 278 M | 512 | Cross-encoder XLM-RoBERTa | MIT (según su model card) | Modelo base sin ajustar; referencia directa para medir la ganancia del fine-tuning |
| BAAI/bge-reranker-v2-m3 | 568 M | 8192 | Cross-encoder multilingüe | Apache 2.0 (según su model card) | Mayor contexto y multilingüismo declarado; requiere el doble de cómputo por par |
| BAAI/bge-reranker-large | 560 M | 512 | Cross-encoder XLM-RoBERTa | MIT (según su model card) | Alternativa de mayor tamaño en la misma familia |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22,7 M | 512 | Cross-encoder MiniLM | Apache 2.0 (según su model card) | Mucho más ligero y rápido; menor precisión esperada en dominios específicos |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; es necesario contactar con el autor o abstenerse de utilizarlo en producción.
- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste fino supere al modelo base; conviene evaluarlo contra BAAI/bge-reranker-base sobre un conjunto propio antes de adoptarlo.
- Sin descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta): el modelo no ha sido replicado ni auditado por terceros.
- Contexto limitado a 512 tokens: los documentos largos deben trocearse, lo que puede romper la coherencia semántica de pasajes que dependen de contexto distribuido.
- Idiomas no declarados: aunque XLM-RoBERTa es multilingüe, el ajuste se ha hecho sobre un dataset de 4.830 pares de composición desconocida; el rendimiento fuera del dominio de entrenamiento (aparentemente comercio electrónico en inglés) es una incógnita.
- Dataset de entrenamiento pequeño y no documentado: 4.830 pares es un volumen reducido, con riesgo de sobreajuste al estilo y vocabulario concretos de ese corpus.
- Sesgos desconocidos: al no publicarse la procedencia de los datos, no se puede evaluar el sesgo de dominio, de género ni de representación cultural en las puntuaciones.
- El riesgo de alucinación no aplica directamente porque el modelo no genera texto, pero sí puede producir puntuaciones espuriamente altas en pares con solapamiento léxico superficial.
- Función de activación de salida no documentada: las puntuaciones deben interpretarse como un orden relativo entre candidatos, no como probabilidades calibradas.
- Fecha de creación declarada en octubre de 2026 y actualización en el mismo día de la publicación: no hay historial de revisiones ni mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RR52/adl2026-hw2-reranker
- Modelo base: https://huggingface.co/BAAI/bge-reranker-base
- Documentación de sentence-transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Listado de cross-encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia sobre Sentence-BERT (tag `arxiv:1908.10084`): https://arxiv.org/abs/1908.10084
