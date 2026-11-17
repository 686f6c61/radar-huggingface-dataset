# adityar101/bhasha-embed-v0-hinglish

## Resumen

bhasha-embed-v0-hinglish es un modelo de embeddings de frases (sentence-transformers) de 237.556.224 parámetros, desarrollado por el usuario adityar101 como un fine-tune de AkshitaS/bhasha-embed-v0. Resuelve un problema concreto y poco cubierto: la recuperación de información en hindi cuando la consulta se escribe en alfabeto latino (hinglish) con ortografía libre e inconsistente ("kya", "kia", "kyaa"), mientras los pasajes indexados están en devanagari. El modelo produce vectores de 768 dimensiones con pooling de media y similitud coseno, sin necesidad de prefijos de consulta o pasaje.

La relevancia del modelo es acotada pero clara: en las pruebas publicadas por el autor es el sistema con menor brecha entre consultas nativas en devanagari y consultas romanizadas (12,4 puntos de nDCG@10) entre los comparados, y supera a su modelo base en +7,9 puntos en MIRACL romanizado y +2,6 en Dakshina escrito por humanos. A cambio, sacrifica rendimiento en recuperación nativa (43,5 frente a 67,4 de bge-m3), por lo que no sustituye a un modelo general de recuperación multilingüe.

El entrenamiento se hizo exclusivamente con datos sintéticos generados por Qwen3-8B a partir de pasajes de Wikipedia en hindi del corpus MIRACL, más 327 preguntas reales, en una sola época y unos 4 minutos en una RTX A6000. La licencia es Apache-2.0. A fecha de la información disponible, el repositorio registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder bidirectional, base AkshitaS/bhasha-embed-v0) |
| Parametros totales | 237.556.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada; entrenamiento con longitud maxima 256 |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16/fp32; compatible con cuantizacion estandar de sentence-transformers, no documentada por el autor) |
| Idiomas soportados | hindi (devanagari) e ingles; consultas en hindi romanizado (hinglish) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 |
| Pooling | mean pooling |
| Similitud | coseno (con `normalize_embeddings=True`) |
| Prefijos de consulta/pasaje | no requeridos |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de 238M de parámetros heredado de AkshitaS/bhasha-embed-v0, adaptado a tareas de recuperación mediante fine-tuning con sentence-transformers. Genera embeddings de 768 dimensiones con mean pooling, similitud coseno y sin prefijos de instrucción, lo que simplifica su integración en pipelines de búsqueda.

El entrenamiento usó exclusivamente datos sintéticos y una pequeña porción de datos reales: 9.739 ítems sintéticos y 327 preguntas reales, que producen 39.379 pares (consulta, pasaje). Para cada pasaje de Wikipedia en hindi del corpus MIRACL, Qwen3-8B (Apache-2.0) generó una pregunta en hindi y dos versiones en hinglish; una tercera variante ortográfica se obtuvo con reglas manuales (elisión de vocales, kya/kia, hai/h, v/w y algunos préstamos del inglés). Los pasajes semilla excluyen todo el pool de evaluación, los pasajes juzgados para preguntas de evaluación y cualquier pasaje que contenga una frase de Dakshina. Se aplicó una comprobación de fuga de datos: ningún texto de entrenamiento coincide ni casi coincide (Jaccard de 5-gramas de caracteres ≥ 0,8) con preguntas de evaluación, y ninguno coincide exactamente con una frase de Dakshina.

La función de pérdida es contrastiva in-batch (cached multiple-negatives ranking), con batch de 128, sin pasajes duplicados dentro del batch, learning rate 2e-5, 10% de warmup, una época, longitud máxima 256 y bf16. El entrenamiento completo tardó unos 4 minutos en una RTX A6000. Se fine-tunearon de la misma forma bhasha-embed-v0, multilingual-e5-base y multilingual-e5-small; este modelo fue el de mejor puntuación en dev y el único evaluado en test.

## Capacidades

- Generación de embeddings de frases y pasajes para búsqueda semántica y recuperación densa (retrieval).
- Manejo de consultas en devanagari y en hindi romanizado (hinglish) con ortografía variable dentro del mismo espacio vectorial.
- Robustez ante variantes ortográficas de romanización: "kya", "kia", "kyaa"; alternancias v/w; elisión de vocales.
- Similitud de frases (sentence-similarity) con vectores normalizados y producto escalar directo.
- Soporte de consultas y pasajes en hindi e inglés.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento: es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda en sitios de contenido hindi con teclado latino: el usuario escribe "bharat ka rashtriya pashu kaun sa hai" y el sistema recupera el pasaje en devanagari "बाघ भारत का राष्ट्रीय पशु है।" con similitud 0,698; el modelo está entrenado específicamente para ese salto de script.
- Motor de búsqueda interna sobre Wikipedia en hindi: indexar los 171.873 pasajes de MIRACL Hindi y atender consultas nativas y romanizadas con un único índice de 768 dimensiones, sin pipeline de transliteración previo.
- Normalización de consultas en aplicaciones de chat y asistentes para usuarios indios que escriben en hinglish: el modelo evita mantener un transliterador aparte y funciona con ortografía libre.
- Deduplicación y clustering de titulares o frases en hindi y hinglish: agrupar variantes romanizadas de la misma frase ("kya"/"kia") mediante similitud coseno sobre embeddings normalizados.
- Filtrado de candidatos en pipelines RAG sobre documentación en hindi: usar el modelo como retriever de primera etapa de bajo coste (238M de parámetros) antes de un reranker mayor.
- Evaluación comparativa de robustez de embeddings para lenguas de la India: sirve como referencia de sistema consciente de romanización frente a modelos multilingües generales en experimentos de recuperación cross-script.
- Búsqueda en catálogos o bases de conocimiento bilingües hindi/inglés donde las consultas mezclan ambos idiomas en una misma frase.

## Benchmarks y rendimiento

Resultados publicados por el autor: nDCG@10 (×100) sobre el split de test del benchmark de recuperación hinglish para el que se construyó el modelo. MIRACL native/romanized usa 1.000 preguntas de MIRACL Hindi en devanagari y en romanización automática, con los pasajes respuesta entre 171.873 pasajes de Wikipedia en hindi. Dakshina machine/human usa 4.000 frases de Wikipedia en hindi romanizadas por regla y tal como las escriben hablantes nativos, con la frase en devanagari como objetivo entre 9.899.

| Modelo | Params (M) | MIRACL native | MIRACL romanized | Dakshina machine | Dakshina human |
|---|---|---|---|---|---|
| multilingual-e5-base | 278 | 57,9 | 0,0 | 21,7 | 41,2 |
| bge-m3 | 568 | 67,4 | 1,1 | 47,4 | 63,0 |
| EmbeddingGemma-300m | 308 | 64,6 | 11,7 | 65,7 | 75,5 |
| Qwen3-Embedding-0.6B | 596 | 49,7 | 12,5 | 67,9 | 76,8 |
| bhasha-embed-v0 (base) | 238 | 44,8 | 23,2 | 96,1 | 96,3 |
| bhasha-embed-v0-hinglish (este modelo) | 238 | 43,5 | 31,1 | 99,0 | 99,0 |
| Qwen3-4B back-transliteration + bge-m3 | 4.590 | 67,4 | 54,3 | 98,9 | 99,3 |

Frente a su modelo base, con intervalos bootstrap pareados al 95%: +7,9 [+6,1, +9,6] en preguntas MIRACL romanizadas, +2,6 [+2,2, +3,1] en Dakshina escrito por humanos y -1,3 [-2,9, +0,3] en preguntas nativas, diferencia no significativa. Es el sistema con menor brecha nativo-romanizado de los probados (12,4 puntos). Un pipeline que reescribe la consulta a devanagari con un LLM de 4B y luego busca con bge-m3 sigue siendo mejor en preguntas romanizadas, con unas 19 veces más parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp32, aproximadamente 1 GB de pesos (237,6M de parámetros); con cuantización a int8 o fp16 el consumo baja por debajo de 1 GB, más el overhead de activaciones y del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe con holgura en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (el modelo declara `text-embeddings-inference` y `endpoints_compatible`), y exportación a formatos compatibles con llama.cpp u Ollama no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia indirecta, el fine-tuning completo de una época sobre 39.379 pares con longitud máxima 256 tardó unos 4 minutos en una RTX A6000.

## Comparativa con modelos similares

| Modelo | Params (M) | Contexto | MIRACL native | MIRACL romanized | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bhasha-embed-v0-hinglish | 238 | 512 | 43,5 | 31,1 | Apache-2.0 | Hugging Face (0 descargas) |
| bhasha-embed-v0 (base) | 238 | 512 | 44,8 | 23,2 | Apache-2.0 | Hugging Face |
| bge-m3 | 568 | 8.192 (según el modelo original) | 67,4 | 1,1 | MIT (según el modelo original) | Hugging Face, ampliamente desplegado |
| multilingual-e5-base | 278 | 512 | 57,9 | 0,0 | MIT (según el modelo original) | Hugging Face, ampliamente desplegado |
| Qwen3-Embedding-0.6B | 596 | 32.768 (según el modelo original) | 49,7 | 12,5 | Apache-2.0 (según el modelo original) | Hugging Face |

La comparativa se limita a los datos de benchmark publicados por el autor; los contextos, licencias y disponibilidad de los modelos alternativos no forman parte de la información proporcionada y se indican como referencia general del modelo original.

## Limitaciones y advertencias

- La recuperación nativa en devanagari está al nivel del modelo base y muy por debajo de modelos generales mayores: 43,5 frente a 67,4 de bge-m3 en MIRACL native.
- La evaluación romanizada usa romanización automática y romanización cuidadosa de hablantes nativos sobre frases de Wikipedia, no consultas de búsqueda casuales; en la tarea de frases de Dakshina los sistemas conscientes de romanización están cerca del techo, lo que limita el margen de mejora medible.
- El texto de entrenamiento y evaluación es de estilo Wikipedia; otros dominios (conversación, comercio electrónico, textos técnicos) no están probados.
- Entrenamiento exclusivamente sintético salvo 327 preguntas reales: riesgo de sobreajuste a los patrones de generación de Qwen3-8B y a las reglas ortográficas implementadas a mano.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de recuperaciones espurias en dominios fuera de distribución.
- Sesgos: no documentados por el autor; el corpus subyacente es Wikipedia en hindi, con los sesgos de cobertura y estilo de esa fuente.
- Licencia Apache-2.0 para los pesos; los pasajes de entrenamiento son texto de Wikipedia en hindi bajo CC BY-SA 4.0 y los datos de evaluación MIRACL (Apache-2.0) y Google Dakshina (CC BY-SA 4.0), lo que conviene verificar si se redistribuyen derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la información: sin validación independiente de los resultados por terceros.
- Para producción con consultas romanizadas de alta calidad, un pipeline de retrotransliteración con un LLM de 4B más bge-m3 obtiene 54,3 en MIRACL romanized frente a 31,1 de este modelo, a cambio de unas 19 veces más parámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adityar101/bhasha-embed-v0-hinglish
- Modelo base: https://huggingface.co/AkshitaS/bhasha-embed-v0
- MIRACL: Zhang et al., "MIRACL: A Multilingual Retrieval Dataset Covering 18 Diverse Languages", TACL 2023 (referenciado en la model card; sin URL en la información proporcionada)
- Dakshina: Roark et al., "Processing South Asian Languages Written in the Latin Script: the Dakshina Dataset", LREC 2020 (referenciado en la model card; sin URL en la información proporcionada)
- Repositorios, blogs y demos adicionales: no disponibles en la información proporcionada.
