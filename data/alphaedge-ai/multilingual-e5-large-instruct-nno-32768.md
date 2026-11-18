# alphaedge-ai/multilingual-e5-large-instruct-nno-32768

## Resumen

`alphaedge-ai/multilingual-e5-large-instruct-nno-32768` es una version recortada (trimmed) del modelo de embeddings multilingue `intfloat/multilingual-e5-large-instruct`, especializada en noruego nynorsk (codigo de idioma `nn`). El recorte se ha realizado mediante reduccion del vocabulario: de 250.037 tokens se pasa a 32.768, lo que elimina los tokens poco frecuentes en noruego nynorsk y reduce el numero de parametros de 559.890.432 a 337.442.816, un 39,73% menos. El modelo lo publica el usuario `alphaedge-ai` sobre la libreria `sentence-transformers` y mantiene la licencia MIT del original.

El modelo resuelve el problema de tamano y huella de memoria en despliegues de recuperacion semantica (RAG, busqueda vectorial, clustering) para corpus en noruego nynorsk. Al conservar la arquitectura y los pesos del transformer original (salvo las filas de embedding correspondientes al vocabulario eliminado), deberia mantener un rendimiento cercano al del modelo base en ese idioma, con un coste de almacenamiento y de inferencia sensiblemente menor.

Es relevante ahora porque el recorte de vocabulario es una tecnica barata para adaptar embeddings multilingues grandes a un idioma concreto sin reentrenar el encoder, y este modelo es un ejemplo practico de ello: 0,7 GB de repositorio, 337 millones de parametros y compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia XLM-RoBERTa, segun el tag `xlm-roberta`), modelo de embeddings tipo sentence-transformers |
| Parametros totales | 337.442.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el original multilingual-e5-large usa 512 tokens; el sufijo "32768" hace referencia al tamano de vocabulario, no al contexto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX en la informacion) |
| Idiomas soportados | noruego nynorsk (`nn`); el resto de idiomas del modelo base pueden degradarse por el recorte de vocabulario |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Vocabulario | 32.768 tokens (frente a 250.037 del original, -86,89%) |
| Tamano del repositorio | 0,7 GB |
| Pipeline | sentence-similarity |
| Libreria | sentence-transformers |
| Modelo base | intfloat/multilingual-e5-large-instruct |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del encoder de `multilingual-e5-large-instruct`, un transformer de tipo XLM-RoBERTa con 24 capas y dimension oculta de 1024 (configuracion del e5-large original), entrenado por Microsoft Research para generar embeddings de frases. No se ha reentrenado el encoder: la unica modificacion es la poda del vocabulario, quedando una matriz de embeddings de 32.768 x 1024 en lugar de 250.037 x 1024, lo que explica la mayor parte de la reduccion de parametros.

La seleccion de tokens conservados se realizo mediante mineria sobre 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, filtrando el vocabulario a los tokens realmente usados en noruego nynorsk. No se documentan en la informacion disponible fases de RLHF, DPO ni fine-tuning adicional sobre el modelo recortado; el modelo base original fue entrenado con pares de frases multilingues y datos de instrucciones, pero esos detalles no se detallan en esta model card.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion densa.
- Codificacion asimetrica de consultas y documentos mediante `encode_query` y `encode_document`, siguiendo la convencion del e5 original.
- Busqueda semantica multilingue limitada al noruego nynorsk; el resto de idiomas no esta garantizado.
- Calculo de similitudes coseno entre consultas y documentos para ranking.
- Uso como encoder en pipelines de RAG y en indices vectoriales.
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face.
- No se documentan capacidades de tool calling, agentes, vision ni audio; es un modelo puramente de embeddings.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) sobre documentacion en noruego nynorsk: el modelo indexa fragmentos de texto y recupera los mas relevantes para una consulta, con una huella de 0,7 GB que permite desplegarlo en instancias modestas.
- Busqueda semantica en sitios web o intranets noruegas: sustituye busqueda por palabras clave por similitud vectorial, con vocabulario optimizado para nynorsk y menor coste de memoria que el modelo base.
- Deduplicacion y clustering de corpus nynorsk: agrupa documentos o noticias similares calculando distancias entre embeddings, util para limpieza de datasets y analisis de contenido.
- Moderacion y clasificacion de textos: compara mensajes entrantes con catalogos de referencia para detectar duplicados, spam o contenido similar.
- Sistemas de recomendacion de contenido editorial: embeddings de articulos para sugerir lecturas relacionadas en medios que publican en nynorsk.
- Motores de preguntas y respuestas extractivas: combinado con un LLM generador, el modelo actua como recuperador de pasajes, reduciendo el contexto enviado al generador.
- Filtrado previo en pipelines de anotacion: seleccion de muestras representativas de un corpus nynorsk para revision humana, usando similitud con centroides de cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el modelo recortado "deberia comportarse de forma similar al original" en noruego nynorsk, sin cifras de MMLU, MTEB ni recuperacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5 GB en fp32 (337 millones de parametros), aproximadamente 0,7 GB en fp16 y menos de 0,4 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100 o RTX 4090 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores; tambien puede ejecutarse en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (TGI para embeddings), endpoints de Hugging Face; no se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-nno-32768 | 337.442.816 | 32.768 | noruego nynorsk | MIT | no disponible |
| intfloat/multilingual-e5-large-instruct (base) | 559.890.432 | 250.037 | multilingue (amplio) | MIT | no disponible |
| intfloat/multilingual-e5-large | aproximadamente 560 millones | 250.037 | multilingue | MIT | no disponible |
| intfloat/multilingual-e5-base | aproximadamente 278 millones | 250.037 | multilingue | MIT | no disponible |

El modelo recortado ocupa un 39,73% menos de parametros que su base, a costa de perder cobertura en idiomas distintos del nynorsk. Frente a `multilingual-e5-base`, tiene mas parametros pero vocabulario mucho menor y cobertura linguistica restringida; la eleccion depende de si el corpus es exclusivamente nynorsk.

## Limitaciones y advertencias

- Rendimiento degradado fuera del noruego nynorsk: los tokens eliminados del vocabulario afectan a otros idiomas, incluido el espanol.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero los embeddings pueden producir similitudes enganosas en dominios muy especializados.
- Sesgos heredados del corpus de entrenamiento del modelo base (FineWeb y pares de frases multilingues), no auditados en esta version recortada.
- El sufijo "32768" del nombre alude al vocabulario, no a la longitud de contexto; no debe interpretarse como ventana de 32.768 tokens.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de mineria (`lbourdois/fineweb-2-trimming`).
- Modelo con muy pocas descargas (33) y sin likes; no hay evidencia comunitaria de calidad en produccion.
- No se documentan variantes cuantizadas ni formatos alternativos a safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-nno-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Multilingual E5: https://arxiv.org/abs/2402.05672
