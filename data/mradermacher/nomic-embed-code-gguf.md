# mradermacher/nomic-embed-code-GGUF

## Resumen

nomic-embed-code-GGUF es la versión cuantizada en formato GGUF del modelo de embeddings de código `nomic-ai/nomic-embed-code`, publicada por el usuario mradermacher. No se trata de un modelo generativo, sino de un encoder de frases (sentence-transformer) diseñado para producir representaciones vectoriales densas de fragmentos de código fuente y consultas en lenguaje natural, de modo que puedan compararse por similitud semántica. El modelo original lo desarrolla Nomic AI y esta versión únicamente redistribuye sus pesos convertidos a GGUF para su uso con llama.cpp y herramientas compatibles.

El modelo cuenta con 7.070.619.136 parámetros (aproximadamente 7 mil millones), lo que lo sitúa en la gama de encoders de gran tamano orientados a recuperación de información. Su propósito principal es alimentar sistemas de búsqueda semántica de código, RAG sobre repositorios, detección de duplicados y clasificación de fragmentos de código, entre otros. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que el formato GGUF facilita el despliegue en entornos con recursos limitados (CPU, GPU de consumo) mediante cuantizaciones que van desde 2,9 GB hasta 14,2 GB. Sin embargo, es importante subrayar que el modelo está entrenado exclusivamente para inglés y para lenguajes de programación, no para generación de texto libre ni para conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (sentence-transformer, feature-extraction); detalles internos de capas y dimensiones no disponibles en la información proporcionada |
| Parametros totales | 7.070.619.136 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en); el modelo está orientado a código fuente en Python, JavaScript, Java, Go, PHP y Ruby |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo base `nomic-ai/nomic-embed-code` es un encoder transformer del tipo sentence-transformer, especializado en generar embeddings de fragmentos de código y de consultas textuales. La información disponible no detalla el número de capas, dimensiones ocultas ni la composición exacta del dataset de entrenamiento más allá de los conjuntos de datos citados: `nomic-ai/cornstack-python-v1`, `cornstack-javascript-v1`, `cornstack-java-v1`, `cornstack-go-v1`, `cornstack-php-v1` y `cornstack-ruby-v1`. Estos nombres sugieren un entrenamiento sobre corpus de código en esos seis lenguajes, probablemente con pares de consulta-fragmento para aprendizaje contrastivo, aunque la model card no especifica el número de tokens ni la metodología exacta (RLHF, DPO u otros).

La versión GGUF es una conversión estática de los pesos originales realizada con herramientas de conversión a GGUF (convert_type: hf). No incluye cambios arquitectónicos ni fine-tuning adicional; es una cuantización de los pesos ya entrenados. El autor indica que las cuantizaciones con imatrix (ponderadas) están disponibles en un repositorio separado (`nomic-embed-code-i1-GGUF`), lo que puede ofrecer mejor calidad en tamanos reducidos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ya que no aplican a un modelo de embeddings.

## Capacidades

- Generación de embeddings densos para fragmentos de código y consultas en lenguaje natural, orientados a similitud semántica.
- Recuperación de código (code retrieval): dado un enunciado en inglés, encontrar fragmentos de código relevantes.
- Búsqueda semántica dentro de repositorios y documentación técnica.
- Detección de código duplicado o casi duplicado mediante comparación de vectores.
- Clasificación y agrupamiento (clustering) de fragmentos de código por funcionalidad o temática.
- Soporte multilingüe limitado al inglés para las consultas y a seis lenguajes de programación (Python, JavaScript, Java, Go, PHP, Ruby) para el código.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo generativo.
- No dispone de modo "thinking", visión, audio ni otras capacidades multimodales.

## Casos de uso

- Búsqueda semántica de código en repositorios: indexar todos los archivos de un proyecto y permitir consultas en inglés como "función que valida un email" para recuperar los fragmentos relevantes, gracias a la representación vectorial densa del modelo.
- RAG sobre bases de código: integrar el modelo como retriever en un pipeline de generación aumentada, de forma que un LLM generativo reciba los fragmentos de código más similares antes de responder; el encoder se encarga de la fase de recuperación.
- Detección de duplicados y plagio: calcular embeddings de cada función o archivo y comparar distancias coseno para identificar código repetido o ligeramente modificado en grandes bases de código.
- Clasificación automática de fragmentos: agrupar commits, issues o snippets por temática (por ejemplo, "autenticación", "acceso a base de datos") usando clustering sobre los embeddings generados.
- Documentación asistida: dado un fragmento de código, recuperar documentación o ejemplos similares del propio repositorio para sugerir enlaces o comentarios, usando similitud entre el embedding del código y el de la documentación.
- Filtrado y curación de datasets de código: puntuar la similitud entre pares de código y descripciones para descartar ejemplos de baja calidad antes de entrenar otros modelos.
- Motor de búsqueda para asistentes de IDE: indexar el código del usuario y ofrecer sugerencias contextuales basadas en similitud semántica, desplegando el modelo en local con llama.cpp y cuantización Q4_K_M (4,5 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,9 GB (Q2_K) y 14,2 GB (f16), pasando por 4,3-4,5 GB (Q4_K_S / Q4_K_M), 5,9 GB (Q6_K) y 7,6 GB (Q8_0).
- GPU recomendadas: para cuantizaciones ligeras (Q4_K_M, 4,5 GB) basta una GPU de consumo con 6-8 GB de VRAM, como RTX 3060, RTX 4060 o RTX 2070. Para Q8_0 o f16 se recomiendan GPU con 12-16 GB o más, como RTX 4070 Ti, RTX 4080, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones Q4 o Q5; las cuantizaciones Q2/Q3 caben en GPU con 4-6 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y servidores compatibles con GGUF. Para el modelo original en safetensors se puede usar transformers con sentence-transformers, o servidores de embeddings como Text Embeddings Inference (TEI) si se convierte el formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un encoder de 7B, la latencia por lote dependerá del hardware y del tamano del lote; se recomienda medir en el entorno objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| nomic-embed-code (este, vía GGUF) | 7,07 B | No disponible | Inglés + 6 lenguajes de código | Apache 2.0 | GGUF, safetensors (base) |
| nomic-embed-text-v1.5 | No disponible en la información | No disponible | Inglés | Apache 2.0 | safetensors, GGUF (por la comunidad) |
| CodeBERT | ~125 M | 512 tokens (típico) | Inglés + código | MIT | safetensors, PyTorch |
| GraphCodeBERT | ~125 M | 512 tokens (típico) | Inglés + código | MIT | PyTorch |

La comparación con CodeBERT y GraphCodeBERT es orientativa: son encoders de código mucho más pequenos (≈125 M de parámetros) y con contexto típico de 512 tokens, por lo que este modelo de 7B ofrece una capacidad de representación potencialmente mayor a costa de más recursos. No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la elección debe basarse en pruebas propias sobre el corpus objetivo.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre corpus de código de GitHub y similares, puede heredar sesgos de estilo, lenguaje y prácticas de programación presentes en esos datos; no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero los embeddings pueden no capturar correctamente la semántica de código muy específico o de dominios poco representados, dando lugar a recuperaciones irrelevantes.
- Limitaciones de contexto o idioma: el modelo está entrenado para inglés y seis lenguajes de programación; las consultas en castellano u otros idiomas pueden degradar la calidad de la recuperación. La longitud máxima de contexto no está documentada, lo que obliga a validar el truncamiento en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se imponen restricciones adicionales conocidas.
- Caveats para producción: al ser una cuantización estática, las versiones Q2/Q3 pueden perder calidad frente a Q4/Q5/Q8; se recomienda validar la calidad de recuperación (recall@k) con la cuantización elegida. Además, el modelo no es generativo: no debe usarse para completar código ni para conversación. El repo ocupa 63,5 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face de esta versión: https://huggingface.co/mradermacher/nomic-embed-code-GGUF
- Modelo base original: https://huggingface.co/nomic-ai/nomic-embed-code
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/nomic-embed-code-i1-GGUF
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#nomic-embed-code-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
