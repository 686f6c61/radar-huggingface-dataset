# Mindscend/mindpage-search-v1-GGUF

## Resumen

MindPage Search v1 (GGUF) es un modelo de embeddings para búsqueda semántica en local, desarrollado por Mindscend para su aplicación de notas y PDF. Está fine-tuneado a partir de google/embeddinggemma-2, un modelo de la familia EmbeddingGemma de Google DeepMind, y se distribuye en formato GGUF Q8_0 para llama.cpp. Su objetivo es recuperar la página correcta dentro de notas, PDF, escritura manuscrita digitalizada y transcripciones de clases o reuniones.

El modelo tiene 271.002.648 parámetros y genera vectores de 768 dimensiones que pueden truncarse a 512, 256 o 128 mediante Matryoshka; el uso recomendado es 256 dimensiones con normalización L2. Con un repositorio de unos 0,3 GB, está pensado para inferencia en dispositivo, sin depender de la nube. Es relevante porque aborda un caso concreto —búsqueda local sobre documentos personales y transcripciones— con un tamaño reducido y una licencia Apache-2.0.

A diferencia de un modelo generativo, no produce respuestas ni resúmenes: genera embeddings para similitud y recuperación. La model card reporta mejoras claras frente a EmbeddingGemma 2 en notas con ruido OCR y en consultas sobre reuniones, aunque los valores absolutos en reuniones siguen siendo bajos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings basado en Gemma; implementación GGUF `gemma-embedding2` |
| Parámetros totales | 271.002.648 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (única cuantización publicada en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp (b11716 o superior) |
| Dimensión de embedding | 768 nativa; Matryoshka 768/512/256/128; uso recomendado a 256 dimensiones |
| Normalización | L2 |
| Pipeline | sentence-similarity / feature-extraction |
| Modelo base | google/embeddinggemma-2 |

## Arquitectura y entrenamiento

El modelo parte de EmbeddingGemma 2 y conserva una arquitectura transformer orientada a embeddings, no a generación de texto. La model card indica que se trata de un modelo solo de texto y que la implementación GGUF usa la arquitectura `gemma-embedding2` en llama.cpp. No se detalla la longitud de contexto ni variantes de atención, por lo que esos datos no están disponibles.

El entrenamiento fue contrastivo, con multiple negatives ranking y negativos duros extraídos del mismo documento. Se aplicó Matryoshka en 768/512/256/128 dimensiones, se congelaron los embeddings de tokens y se realizó una sola época. Los datos incluyen preguntas y búsquedas generadas por un modelo on-device sobre artículos públicos de Wikipedia con licencia CC BY-SA, esas mismas páginas reescritas como notas manuscritas breves con ruido OCR, transcripciones de reuniones QMSum con consultas humanas (MIT) y pares de recuperación de Natural Questions, GooAQ y SQuAD. La model card afirma que no se usaron notas de usuarios.

El uso requiere seguir el formato de prompts del modelo base: para consultas, `task: search result | query: {question}`; para pasajes, `title: none | text: {document title}, page {n}: {passage}`. En grabaciones se usa `{title}, recording: {passage}`.

## Capacidades

- Generación de embeddings de consultas y pasajes para búsqueda semántica y similitud textual.
- Recuperación a nivel de página en notas, PDF y documentos personales.
- Mayor robustez que el modelo base en notas manuscritas simuladas con ruido OCR.
- Búsqueda sobre transcripciones de reuniones y clases, con consultas humanas o generadas.
- Soporte de truncado Matryoshka a 256 o 128 dimensiones para reducir almacenamiento y coste de comparación.
- Vectores normalizados L2, adecuados para similitud coseno o producto interno.
- No soporta tool calling ni function calling.
- No es un modelo agente ni realiza razonamiento multi-paso generativo.
- No tiene capacidades de visión, audio ni generación de texto.
- Cobertura multilingüe: no disponible; la model card no declara idiomas y los conjuntos citados son principalmente en inglés.

## Casos de uso

- Búsqueda local en una aplicación de notas: el modelo indexa cada página como un pasaje y recupera las páginas más similares a una consulta escrita, sin enviar contenido a la nube. Es adecuado por su tamaño de 271M parámetros y su formato GGUF.
- Búsqueda sobre PDF académicos o técnicos: se divide el PDF en páginas o fragmentos, se generan embeddings con la plantilla de pasaje y se consulta con la plantilla de query. El truncado a 256 dimensiones reduce el espacio del índice.
- Recuperación en notas manuscritas digitalizadas: el entrenamiento incluye notas reescritas con ruido OCR, por lo que el modelo está pensado para consultas sobre texto imperfecto. Requiere un OCR externo que produzca el texto antes de generar embeddings.
- Búsqueda en transcripciones de reuniones y clases: las transcripciones se indexan como pasajes con el formato de grabación y se consultan con lenguaje natural. La model card reporta R@1 de 40,8 con consultas humanas, superior al modelo base, aunque todavía con margen de mejora.
- RAG local y offline: el modelo actúa como recuperador en un pipeline con un LLM pequeño o mediano; primero recupera páginas relevantes y después el generador redacta la respuesta. Es útil cuando la privacidad impide usar un servicio de embeddings en la nube.
- Motor de búsqueda híbrida en escritorio: se combina la similitud semántica con búsqueda léxica o por palabras clave para mejorar la recuperación de nombres propios, cifras y términos exactos. El modelo aporta la parte semántica y el índice invertido aporta precisión literal.
- Detección de páginas relacionadas o duplicadas: los embeddings permiten agrupar páginas con contenido similar dentro de un cuaderno o biblioteca. Es aplicable a limpieza de corpus, recomendación de notas y control de duplicados.

## Benchmarks y rendimiento

La model card publica resultados de recuperación held-out con 49 artículos y 35 reuniones no vistas en entrenamiento, usando 256 dimensiones y llama.cpp. La métrica es R@1 (%).

| Tarea | EmbeddingGemma 300M | EmbeddingGemma 2 | MindPage Search v1 |
|---|---:|---:|---:|
| Preguntas sobre Wikipedia | 80,8 | 76,1 | 82,1 |
| Búsquedas cortas | 65,8 | 59,4 | 70,1 |
| Notas manuscritas con ruido OCR | 67,5 | 70,1 | 79,1 |
| Reuniones, consultas humanas | 31,0 | 25,3 | 40,8 |
| Reuniones, consultas generadas | 24,8 | 24,8 | 41,0 |

No se han publicado resultados de MMLU, HumanEval o GSM8K porque el modelo no es generativo. Tampoco se han publicado mediciones de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,3 GB para los pesos Q8_0; con overhead de runtime y un batch pequeño, conviene reservar entre 0,5 y 1 GB de VRAM o RAM. Es una estimación, no una medición publicada.
- GPU recomendadas: no requiere A100 ni H100. Para servir muchas consultas, una L4, T4, A10G o RTX 4090 es más que suficiente; para uso local, cualquier GPU consumer con 4 GB o más puede alojarlo.
- Cabe en GPU consumer: sí, en tarjetas como GTX 1650 de 4 GB, RTX 3050, RTX 4060 o superiores. También es viable en CPU, Apple Silicon y dispositivos de gama alta mediante llama.cpp.
- Opciones de despliegue: llama.cpp b11716 o superior es el runtime indicado. El repositorio incluye la etiqueta `endpoints_compatible`, pero no se detalla qué endpoint concreto. No se confirma compatibilidad con Ollama, vLLM o TGI.
- Latencia y throughput: no disponible. Por el tamaño del modelo y la dimensión de 256, se espera una latencia baja en CPU y GPU, pero no hay cifras publicadas.
- El consumo de memoria crece con el tamaño del batch y con la longitud de los pasajes; para corpus grandes, el coste principal suele ser el almacenamiento de los vectores, no la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión de embedding | Licencia | Formato | R@1 reuniones, consultas humanas | R@1 notas manuscritas | Disponibilidad |
|---|---:|---|---:|---|---|---:|---:|---|
| MindPage Search v1 | 271.002.648 | no disponible | 256 recomendada (Matryoshka hasta 128) | Apache-2.0 | GGUF Q8_0 | 40,8 | 79,1 | Hugging Face |
| EmbeddingGemma 2 | no disponible | no disponible | no disponible | Apache-2.0 | no disponible | 25,3 | 70,1 | Hugging Face, modelo base citado |
| EmbeddingGemma 300M | aproximadamente 300M | no disponible | no disponible | no disponible | no disponible | 31,0 | 67,5 | no disponible en la información |

La comparación se limita a los datos publicados por el autor. MindPage Search v1 mejora a EmbeddingGemma 2 en las cinco tareas reportadas, con una diferencia especialmente alta en reuniones y en notas con ruido OCR. No se dispone de una comparación independiente con otros modelos de embeddings de tamaño similar.

## Limitaciones y advertencias

- El modelo no genera texto: no sirve para responder preguntas, resumir documentos ni mantener conversaciones. Solo produce embeddings.
- La longitud de contexto no está documentada; para PDFs o notas largas es necesario dividir en páginas o fragmentos y validar que cada fragmento quepa en el contexto real del runtime.
- Los idiomas soportados no están declarados. No hay evaluación publicada en castellano, por lo que el rendimiento en español es incierto.
- El R@1 en reuniones es 40,8 con consultas humanas y 41,0 con consultas generadas: en más de la mitad de los casos la página correcta no queda en primera posición. Puede requerir reranking o recuperación de varios candidatos.
- El entrenamiento usa datos públicos y notas manuscritas simuladas, no notas reales de usuarios. Puede haber diferencia de dominio con caligrafía, maquetación o vocabulario específico.
- La robustez frente a OCR se midió con ruido simulado; no equivale necesariamente a OCR real de manuscritos difíciles.
- El formato de prompt es parte del diseño. Usar plantillas distintas puede degradar la recuperación.
- Solo se publica Q8_0; no hay cuantizaciones menores en el repositorio, lo que limita ajustar aún más el uso de memoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- La licencia Apache-2.0 permite uso comercial, pero deben conservarse los avisos de licencia y verificarse las condiciones del modelo base EmbeddingGemma 2.
- No hay soporte de tool calling, agentes, visión ni audio. Las grabaciones deben transcribirse con un sistema externo antes de indexarlas.

## Enlaces

- [MindPage Search v1 (GGUF) en Hugging Face](https://huggingface.co/Mindscend/mindpage-search-v1-GGUF)
- [MindPage](https://mindscend.academy)
- [EmbeddingGemma 2 en Hugging Face](https://huggingface.co/google/embeddinggemma-2)
- [Perfil de Mindscend en Hugging Face](https://huggingface.co/Mindscend/models)
- No se han encontrado papers, blogs técnicos ni demos específicas de este modelo en la búsqueda web. Los resultados sobre MindSearch corresponden a otro proyecto y no se incluyen.
