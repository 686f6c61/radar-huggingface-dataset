# BYU-Idaho/ZaraEmbed

## Resumen

ZaraEmbed es un modelo de embeddings de frases desarrollado por Brigham Young University-Idaho (BYU-Idaho) para recuperación densa (dense retrieval) de versículos de las Obras Canónicas de La Iglesia de Jesucristo de los Santos de los Últimos Días. Se obtiene ajustando ZaraBERTa, un modelo de lenguaje en inglés con casing y vocabulario nativo del texto de las escrituras, de modo que dada una pregunta en inglés moderno devuelve el versículo que la responde. Forma parte de la colección ZaraAI, junto con el modelo base ZaraBERTa y el reranker ZaraRerank.

El problema que aborda es la búsqueda semántica en un dominio muy específico: términos como Nephi, Zarahemla o LORD aparecen tokenizados de forma útil para el modelo, en lugar de fragmentarse como ocurre en tokenizadores de propósito general. Según la model card, ZaraEmbed supera a OpenAI text-embedding-3-large en la recuperación de versículos de capítulos que nunca vio durante el entrenamiento, con mejoras estadísticamente significativas en las dos pruebas de 289 versículos.

Arquitectónicamente es una familia RoBERTa con 356.267.008 parámetros, licencia MIT y pesos en safetensors. Su relevancia práctica está en la combinación de dominio vertical, licencia permisiva y un pipeline documentado (recuperación con ZaraEmbed más reranking con ZaraRerank) que iguala o supera a alternativas propietarias en su nicho sin depender de una API externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder bidireccional), ajuste para retrieval; `AutoModel` con `add_pooling_layer=False` |
| Parametros totales | 356.267.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no se declara una ventana formal; la model card especifica truncado a 160 tokens para preguntas y 256 tokens para versiculos |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos safetensors (repo de 1,4 GB, coherente con fp32). No se documentan variantes GGUF, int8 ni int4 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | BYU-Idaho/ZaraBERTa |
| Pipeline declarado | sentence-similarity |
| Tamano del repositorio | 1,4 GB |
| Etiquetas de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

ZaraEmbed es un encoder tipo RoBERTa (con casing) afinado para tareas de recuperación, heredado de ZaraBERTa. La representación se obtiene mediante mean pooling sobre `last_hidden_state` restringido a los tokens reales (usando la `attention_mask`) y posterior normalización L2. Un detalle operativo relevante indicado por el autor: todo texto debe ir prefijado con un único espacio, de forma que las palabras iniciales de un versículo se tokenicen igual que a mitad de frase.

El entrenamiento se realizó sobre texto de dominio público, sin usar encabezados de capítulo, notas al pie ni ayudas de estudio de la Iglesia. La mitad de los documentos vistos en entrenamiento se presentaron como "resumen de capítulo + versículo", de modo que el modelo acepta tanto versículos desnudos como versículos con contexto de capítulo; esos resúmenes son descripciones orientadas a recuperación generadas para el proyecto, no encabezados oficiales. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en modelos de embeddings).

La evaluacion es destacable por su metodologia: se usaron 289 versiculos de 37 capitulos de Book of Mormon, D&C y Pearl of Great Price que no aparecen en ningun par de entrenamiento. Un modelo de lenguaje distinto del usado para generar las preguntas de entrenamiento redacto una pregunta por versiculo en dos estilos (no-names y story), y los mismos 289 versiculos aparecen en ambas pruebas.

## Capacidades

- Generacion de embeddings de frases y versiculos para similitud semantica y recuperacion densa.
- Recuperacion de versiculo a partir de preguntas en ingles moderno, tanto si la pregunta evita los nombres propios del texto como si los menciona (estilos no-names y story evaluados).
- Acepta dos formatos de documento: versiculo desnudo y "resumen de capitulo + versiculo".
- Búsqueda semantica sobre las Obras Canonicas (los cinco volumenes en el benchmark humano; foco declarado en Book of Mormon, D&C y Pearl of Great Price).
- Encadenable con un cross-encoder de reranking (BYU-Idaho/ZaraRerank) sobre el top-100 de resultados.
- Integrable en pipelines de sentence-similarity de `transformers`.
- No dispone de tool calling, function calling, capacidad de agente, vision, audio ni modo de razonamiento explicito: es exclusivamente un modelo de representacion (feature-extraction).
- Capacidad multilingue: no. Solo ingles (`language: en`).

## Casos de uso

- Búsqueda semantica de escrituras para aplicaciones de estudio personal: el usuario escribe una pregunta en ingles coloquial y el sistema devuelve el versiculo relevante usando similitud coseno sobre embeddings normalizados, sin depender de coincidencia lexica.
- Asistente de estudio con recuperacion aumentada (RAG): ZaraEmbed actua como recuperador de primer nivel sobre un corpus de versiculos y ZaraRerank reordena el top-100; el generador final solo recibe los pasajes recuperados, lo que reduce el riesgo de citas inventadas.
- Indexacion de corpus completos de escrituras: con 256 tokens de entrada por versiculo, es viable precalcular embeddings de todo el canon y servir busquedas por vecino mas cercano en milisegundos sobre CPU.
- Herramientas de citacion automatica en discursos o material docente: dada una idea escrita por el autor, el sistema propone los versiculos mas cercanos semanticamente para que el autor confirme la cita.
- Filtrado y deduplicacion tematica de pasajes: agrupar versiculos por similitud para construir indices tematicos o clusters doctrinales, aprovechando que el modelo esta afinado en ese dominio concreto.
- Recuperacion en aplicaciones multilingues mediante traduccion previa: al estar entrenado solo en ingles, un flujo con traduccion de la consulta al ingles antes de la recuperacion permite reutilizar el modelo desde otros idiomas.
- Comparacion de dominio en investigacion sobre modelos especificos: sirve como referencia de hasta donde llega un modelo de 356 M parametros entrenado en un dominio cerrado frente a embeddings propietarios de gran escala.
- Despliegue on-premise en entornos con requisitos de privacidad o sin acceso a APIs externas, gracias a su tamano (1,4 GB) y a la licencia MIT.

## Benchmarks y rendimiento

Pruebas held-out sobre 289 versiculos de 37 capitulos no vistos en entrenamiento, con el modelo embebiendo texto de versiculo desnudo (top-1 correcto):

| Prueba | ZaraEmbed | OpenAI text-embedding-3-large | Significacion |
|---|---|---|---|
| no-names (289) | 191 (66%) | 126 (44%) | McNemar p = 2e-11; top-10: 271 vs 232 |
| story (289) | 175 (61%) | 143 (49%) | p = 5e-4; top-10: 249 vs 222 |

Solo en las preguntas del Book of Mormon (149 de los 289), ZaraEmbed lidera 103 vs 58 en no-names y 98 vs 81 en story. Como referencia de pesos abiertos, bge-large-en-v1.5 sitúa en primera posicion 63 preguntas no-names y 78 story.

Benchmark de 152 preguntas de estudio escritas por personas, sobre los cinco volumenes:

| Benchmark | ZaraEmbed | OpenAI text-embedding-3-large | Significacion |
|---|---|---|---|
| Book of Mormon, D&C, Pearl of Great Price (63) | 36 | 38 | no significativa |
| Book of Mormon solo (40) | 18 | 20 | no significativa |
| Los cinco volumenes (152) | 92 | 108 | OpenAI por delante, p = 0,014 |

Segun la model card, combinado con ZaraRerank el pipeline supera a OpenAI tambien en las preguntas de las escrituras de la Restauracion (47 vs 38 para OpenAI con versiculos desnudos; 41 con contexto de capitulo). No se han publicado resultados de benchmarks generalistas (MMLU, GLUE u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (calculada a partir de los 356.267.008 parametros, no publicada por el autor): aproximadamente 1,4 GB en fp32, 0,7 GB en fp16/bf16 y 0,2-0,4 GB con cuantizacion int8/int4, mas el overhead de activaciones del lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en fp16 para lotes moderados; A100, H100, L40S o RTX 4090 quedan muy por encima de lo necesario y solo tienen sentido para indexacion masiva a gran throughput.
- GPU de consumo: si, cabe holgadamente en RTX 3060 (12 GB), RTX 4060, RTX 4090 e incluso en iGPU con memoria compartida en fp32 si se usa lote pequeno.
- CPU: el modelo es viable en CPU para servir consultas individuales o indexar corpus pequenos (el canon completo en versiculos es un corpus manejable).
- Opciones de despliegue: `transformers` (referencia), Hugging Face Text Embeddings Inference (el repo esta etiquetado con `text-embeddings-inference` y `endpoints_compatible`), y cualquier stack de sentence embeddings que permita mean pooling con mascara y normalizacion L2. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversion.
- Latencia y throughput estimados: no disponibles. El autor no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad | no-names (289) | story (289) | Benchmark humano (152) |
|---|---|---|---|---|---|---|---|
| ZaraEmbed | 356.267.008 | 160 (preguntas) / 256 (versiculos) | MIT | Pesos abiertos en HuggingFace | 191 | 175 | 92 |
| OpenAI text-embedding-3-large | no disponible | no disponible | Propietaria | Solo API | 126 | 143 | 108 |
| bge-large-en-v1.5 | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Pesos abiertos | 63 | 78 | no disponible |

La comparacion debe leerse con matices: ZaraEmbed gana de forma clara en el escenario para el que fue disenado (recuperar versiculos de capitulos no vistos sin depender de los nombres propios) y pierde frente a OpenAI en el conjunto humano de 152 preguntas sobre los cinco volumenes, donde la diferencia si es significativa. ZaraRerank no es una alternativa sino un complemento: reordena el top-100 de ZaraEmbed. No se dispone de datos comparativos frente a otros embeddings abiertos de tamano similar aparte de la referencia de bge-large-en-v1.5.

## Limitaciones y advertencias

- Modelo monolingue: solo ingles (`language: en`). Cualquier uso en castellano requiere traduccion previa y no esta evaluado.
- Dominio cerrado: esta afinado sobre las Obras Canonicas; su comportamiento fuera de ese corpus no esta documentado y no deberia asumirse comparable.
- No genera texto. Es un modelo de embeddings: no puede "responder" ni razonar, solo devolver representaciones vectoriales. En un sistema RAG, el riesgo de alucinacion recae en el generador posterior.
- Requisitos de uso estrictos: prefijo de un espacio en todo texto, mean pooling sobre tokens reales y normalizacion L2. Omitir cualquiera de estos pasos degrada la calidad de la recuperacion.
- Truncado a 160 tokens en preguntas y 256 en versiculos: consultas o pasajes mas largos se recortan, lo que puede afectar a la recuperacion.
- En el benchmark humano de 152 preguntas, OpenAI text-embedding-3-large va por delante de forma estadisticamente significativa (108 vs 92, p = 0,014).
- El entrenamiento excluye encabezados de capitulo, notas al pie y ayudas de estudio de la Iglesia; el modelo puede no alinearse con la organizacion editorial oficial de las ediciones publicadas.
- Licencia MIT: permite uso comercial y modificacion, pero el autor declara que los modelos se publican para investigacion sobre escrituras, modelos de lenguaje de dominio especifico y como ayuda al estudio personal. Conviene revisar si el despliegue previsto respeta el espiritu declarado.
- Senales de adopcion nulas en el momento de la consulta (0 descargas, 0 likes) y metadatos con fecha de creacion 2026-09-23: se trata de un modelo muy reciente y sin validacion independiente por parte de la comunidad.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse sobre un corpus religioso concreto, las representaciones reflejan el vocabulario y los marcos de ese corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BYU-Idaho/ZaraEmbed
- Modelo base ZaraBERTa: https://huggingface.co/BYU-Idaho/ZaraBERTa
- Reranker ZaraRerank: https://huggingface.co/BYU-Idaho/ZaraRerank
- Coleccion ZaraAI: https://huggingface.co/collections/BYU-Idaho/zaraai
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada.
