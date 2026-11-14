# dylanhogg/au-property-embed-v2

## Resumen

au-property-embed-v2 es un modelo de embeddings de texto especializado en la búsqueda de propiedades australianas: anuncios de venta y alquiler, perfiles de agentes inmobiliarios y descripciones de barrios. Lo desarrolla dylanhogg como proyecto de investigación personal y parte de Alibaba-NLP/gte-modernbert-base, un transformer ModernBERT de 149 millones de parámetros, afinado sobre consultas sintéticas de búsqueda inmobiliaria australiana mezcladas con pares pregunta-respuesta de propósito general para preservar la capacidad de recuperación genérica del modelo base.

El modelo resuelve un problema concreto: los embeddings generalistas rinden de forma mediocre cuando la consulta mezcla jerga inmobiliaria local (tipologías como "Queenslander", abreviaturas como "LUG" o "BIR", nombres de suburbios y códigos postales australianos) con lenguaje natural coloquial. El autor reporta mejoras de entre 0,23 y 0,30 puntos de nDCG@10 sobre el modelo base y de 0,21 a 0,23 sobre BM25 en cuatro conjuntos de evaluación congelados antes del entrenamiento, manteniendo prácticamente intacta la recuperación general (0,751 frente a 0,755 en NanoBEIR).

Es relevante ahora por tres motivos: demuestra que el ajuste fino con datos sintéticos derivados de fuentes abiertas (G-NAF 2022, códigos postales australianos, Wikipedia) puede especializar un embedder sin datos propietarios; incorpora pérdida Matryoshka, lo que permite truncar los vectores de 768 a 512 o 256 dimensiones con una pérdida mínima de calidad; y se distribuye con licencia Apache 2.0 y exportación ONNX int8. El propio autor lo etiqueta como prototipo de investigación no probado sobre anuncios reales y no destinado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), basado en Alibaba-NLP/gte-modernbert-base |
| Parametros totales | 149.014.272 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_length`); entrenado con entradas truncadas a 256 tokens |
| Tipos de cuantizacion | ONNX int8 (exportacion oficial, 150 MB); pesos almacenados en media precision (fp16); embeddings truncables a 512 y 256 dimensiones (Matryoshka) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (int8) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer ModernBERT con pooling sobre el token CLS, heredado del modelo base gte-modernbert-base. El ajuste fino se realizó con `sentence-transformers` 6 o superior sobre una mezcla de consultas sintéticas de búsqueda inmobiliaria australiana y pares pregunta-respuesta de propósito general (sentence-transformers/gooaq, sentence-transformers/squad, wikimedia/wikipedia). Los datos específicos del dominio se construyeron a partir de registros muestreados de fuentes abiertas: dylanhogg/gnaf-2022 (direcciones geocodificadas de Australia) y blake-resic/australian-suburbs-postcodes. Los textos de anuncios, perfiles de agentes y consultas fueron generados por un LLM a partir de esos registros; no describen propiedades ni agentes reales ni proceden de portales comerciales.

La innovación técnica principal es el uso de pérdida Matryoshka, que permite truncar los embeddings de 768 a 512 dimensiones (pérdida aproximada de 0,01 nDCG@10) o a 256 dimensiones (pérdida de 0,02 a 0,03), además de cuantizar los embeddings a int8 sin pérdida reportada. La similitud es coseno, sin prefijos ni instrucciones diferenciadas para consulta y documento; el formato recomendado de documento es título (normalmente la dirección), salto de línea y cuerpo. El entrenamiento y la evaluación se ejecutaron en una GPU Apple M1 Max vía MPS, con un rendimiento de aproximadamente 160 documentos por segundo.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa (feature-extraction, sentence-similarity, retrieval).
- Búsqueda semántica especializada en texto inmobiliario australiano: direcciones, tipologías de vivienda, abreviaturas de anuncios y descripciones de suburbios.
- Recuperación general preservada: mantiene capacidad de búsqueda sobre dominios ajenos al inmobiliario gracias a la mezcla de datos de propósito general.
- Embeddings truncables (Matryoshka) a 512 y 256 dimensiones para reducir coste de almacenamiento y latencia en índices vectoriales.
- Exportación ONNX int8 para inferencia en CPU sin PyTorch.
- Capacidades multilingües: no disponibles; solo inglés.
- Tool calling, agentes, razonamiento multi-paso, visión y audio: no disponibles (es un modelo de embeddings, no generativo).

## Casos de uso

- Búsqueda semántica en portales inmobiliarios: indexar anuncios con el formato título-salto de línea-cuerpo y recuperar por consultas coloquiales como "casa de estilo Queenslander con porche cerca de Brisbane", aprovechando el ajuste sobre jerga inmobiliaria australiana.
- Deduplicación y agrupación de anuncios: calcular similitud coseno entre descripciones para detectar listados repetidos o muy similares entre fuentes, con vectores truncados a 256 dimensiones para abaratar el índice.
- Sistemas de recomendación de propiedades: generar embeddings de perfiles de usuario y de anuncios para alimentar un ranking por similitud, con la ventaja de que el modelo entiende abreviaturas habituales de los anuncios.
- Búsqueda por barrio o suburbio: usar los datos de G-NAF y códigos postales incorporados en el entrenamiento para consultas que mencionan localidades australianas concretas, con mejora reportada en el conjunto de suburbios no vistos (0,737 nDCG@10).
- Enriquecimiento de perfiles de agentes: indexar biografías y especialidades de agentes para emparejarlos con consultas de usuarios que buscan un agente en una zona o tipo de propiedad concreta.
- Búsqueda en CPU a bajo coste: desplegar la exportación ONNX int8 en servicios sin GPU para búsqueda sobre catálogos de tamaño medio, normalizando los vectores antes del producto escalar.
- Filtrado previo en pipelines RAG inmobiliarios: usar el modelo como recuperador de primera etapa sobre descripciones de propiedades antes de un reranker o de un LLM generativo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Retrieval | AU property search, in-distribution (500 consultas) | nDCG@10 | 0,696 |
| Retrieval | AU property search, gold (200 consultas) | nDCG@10 | 0,722 |
| Retrieval | AU property search, unseen suburbs (300 consultas) | nDCG@10 | 0,737 |
| Retrieval | AU property search, unseen writer (350 consultas) | nDCG@10 | 0,778 |
| Retrieval | NanoBEIR (media de MS MARCO, NQ, FiQA, SciFact, Quora) | nDCG@10 | 0,751 |

Según la model card, la mejora sobre el modelo base es de 0,23 a 0,30 puntos de nDCG@10 en los cuatro conjuntos de búsqueda inmobiliaria, y de 0,21 a 0,23 sobre BM25. En NanoBEIR, el modelo base obtiene 0,755 frente a 0,751 de este modelo, una degradación de 0,004 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,3 GB en fp16 para los pesos safetensors (149 M de parámetros); en torno a 0,6 GB si se carga en fp32 para CPU.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA o Apple silicon con MPS; el autor entrenó y evaluó en una Apple M1 Max. Para volúmenes altos, A100 o H100 con `text-embeddings-inference` o vLLM.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3090, RTX 4060 Ti y similares, e incluso en iGPU y CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` (CUDA o MPS automáticos), ONNX Runtime con el modelo int8 para CPU, `text-embeddings-inference` (el repo es compatible con endpoints) y llama.cpp/Ollama no están documentados para este modelo.
- Rendimiento estimado: unas 160 documentos por segundo en una Apple M1 Max vía MPS, según el autor. No se han publicado cifras de latencia ni throughput en GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@10 (NanoBEIR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| au-property-embed-v2 | 149 M | 512 tokens | 0,751 | Apache 2.0 | Hugging Face, ONNX int8 |
| Alibaba-NLP/gte-modernbert-base (base) | 149 M | 512 tokens | 0,755 | Apache 2.0 | Hugging Face |
| BM25 (referencia léxica) | No aplica | No aplica | No disponible en la informacion | No aplica | Implementaciones multiples |

La comparación con el modelo base es la más directa: misma arquitectura y tamaño, con una pérdida de 0,004 puntos en NanoBEIR a cambio de una mejora de 0,23 a 0,30 puntos en el dominio inmobiliario australiano. Frente a BM25, el autor reporta una ventaja de 0,21 a 0,23 puntos de nDCG@10 en los conjuntos de propiedad. No se han publicado comparaciones con otros embedders especializados en inmobiliario en la información disponible.

## Limitaciones y advertencias

- Estado de prototipo de investigación: el autor indica explícitamente que no se ha probado sobre anuncios reales y que no está pensado para uso en producción.
- Datos de entrenamiento sintéticos: los anuncios, perfiles y consultas fueron generados por un LLM a partir de registros abiertos; pueden no reflejar la distribución real de los portales inmobiliarios.
- Sesgos de los datos de origen: al derivarse de G-NAF, códigos postales y Wikipedia, puede heredar sesgos de cobertura geográfica y de representación de suburbios.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en recuperación: la similitud semántica puede devolver coincidencias plausibles pero incorrectas, especialmente con abreviaturas ambiguas.
- Limitación de idioma: solo inglés; las consultas en otros idiomas no están soportadas.
- Limitación de longitud: entrenado con entradas truncadas a 256 tokens; aunque `max_seq_length` es 512, los textos más largos pueden degradar la calidad.
- Formato de entrada sensible: el rendimiento depende de usar el formato título-salto de línea-cuerpo; otros formatos pueden reducir la calidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no ha sido revisado de forma independiente.
- Proyecto personal sin revisión independiente: el código, el pipeline de datos, el entrenamiento y la evaluación se produjeron con asistencia de IA y no han sido auditados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dylanhogg/au-property-embed-v2
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Dataset G-NAF 2022: https://huggingface.co/datasets/dylanhogg/gnaf-2022
- Dataset de suburbios y códigos postales australianos: https://huggingface.co/datasets/blake-resic/australian-suburbs-postcodes
- Dataset gooaq: https://huggingface.co/datasets/sentence-transformers/gooaq
- Dataset squad: https://huggingface.co/datasets/sentence-transformers/squad
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset NanoBEIR: https://huggingface.co/datasets/zeta-alpha-ai/NanoBEIR
