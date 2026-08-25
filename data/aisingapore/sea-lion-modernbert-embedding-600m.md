# aisingapore/SEA-LION-ModernBERT-Embedding-600M

## Resumen

SEA-LION-ModernBERT-Embedding-600M es un modelo de embeddings textuales desarrollado por el AI Products Pillar de AI Singapore, dentro del proyecto SEA-LION (Southeast Asian Languages In One Network), financiado por el Singapore NRF. Está diseñado específicamente para mejorar el procesamiento de texto en lenguas del Sudeste Asiático, un ámbito tradicionalmente mal cubierto por los embeddings multilingües genéricos. El modelo se basa en la arquitectura encoder-only ModernBERT, con un vocabulario de 262 000 tokens y una longitud de contexto de 8 000 tokens, y utiliza un tokenizer SentencePiece personalizado derivado de Gemma 3, optimizado para scripts regionales complejos como el birmano, el jemer o el tailandés.

Su relevancia actual radica en que es uno de los pocos modelos de embeddings abiertos (licencia MIT) diseñados explícitamente para la región SEA, con un entrenamiento en dos fases: un pre-entrenamiento contrastivo sobre 245 millones de pares de texto (EN-EN y EN-SEA) y un ajuste fino por instrucciones sobre 13 millones de pares (EN-EN, CN-CN, EN-SEA y SEA-SEA). Esto permite un alineamiento cross-lingual eficiente y una mejor compresión de tokens para scripts complejos, lo que se traduce en mayor eficiencia computacional en tareas de recuperación y similitud semántica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, transformer) |
| Parámetros totales | 611 640 320 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8 000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | birmano, chino, inglés, filipino, indonesio, jemer, lao, malayo, tamil, tailandés, vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT-large, una variante de BERT optimizada para eficiencia y rendimiento en tareas de comprensión del lenguaje. Es un encoder puro, sin decodificador, lo que lo hace adecuado para generar representaciones densas de texto (embeddings) en lugar de texto libre. La innovación principal es la adopción del tokenizer SentencePiece de Gemma 3, que ofrece una mayor fertilidad de tokenización y mejores tasas de compresión para scripts regionales complejos (como el tailandés o el jemer), permitiendo manejar contextos largos con menor coste computacional.

El entrenamiento se realizó en dos etapas: primero, un pre-training contrastive con 245 millones de pares de texto (EN-EN y EN-SEA) para alinear representaciones entre idiomas; después, un ajuste fino por instrucciones con 13 millones de pares de texto que incluyen combinaciones EN-EN, CN-CN, EN-SEA y SEA-SEA, lo que refuerza la capacidad de capturar relaciones semánticas tanto monolingües como cross-linguales. No se especifica el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de embeddings de texto densos de 1024 dimensiones, adecuados para tareas de similitud semántica, recuperación y clustering.
- Alineación cross-lingual: soporta 11 idiomas, con especial atención a los del Sudeste Asiático, permitiendo comparar textos en distintos idiomas.
- Soporte de retrieval-augmented generation (RAG): puede usarse como modelo de embeddings en pipelines de búsqueda y recuperación.
- Capacidad de comparación de similitud: se puede usar con `model.similarity()` para obtener puntuaciones de similitud entre frases, como se muestra en el ejemplo de uso.
- No tiene capacidades de generación de texto ni tool calling, al ser un encoder puro.
- No se especifica soporte de vision ni audio; es un modelo exclusivamente textual.

## Casos de uso

- **Recuperación de información en motores de búsqueda**: el modelo puede indexar documentos en varios idiomas del Sudeste Asiático y recuperar resultados relevantes en respuesta a consultas en inglés u otros idiomas, gracias a su alineación cross-lingual y su contexto de 8 000 tokens para documentos largos.
- **RAG (Retrieval-Augmented Generation)**: en un pipeline de RAG, el modelo actúa como el componente de embeddings para recuperar pasajes relevantes de una base de conocimiento multilingüe antes de que un LLM genere la respuesta final.
- **Deduplicación de documentos**: puede comparar similitud entre textos en diferentes idiomas para identificar duplicados o versiones traducidas de un mismo contenido, útil en gestión de contenidos.
- **Sistemas de recomendación basados en contenido**: al generar embeddings de artículos, productos o publicaciones, permite recomendar ítems similares entre usuarios que interactúan en distintos idiomas.
- **Análisis de sentimiento y clasificación de texto**: aunque el modelo base es de embeddings, se puede usar como extractor de características para entrenar clasificadores de sentimiento o categorías sobre datos en idiomas SEA, sin necesidad de ajustar el modelo completo.
- **Búsqueda semántica en bases de datos multilingües**: para empresas con datos en inglés, chino y varios idiomas SEA, permite consultar en un idioma y recuperar resultados en otro, manteniendo la coherencia semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan datos de evaluación en tareas como MMLU, HumanEval o GSM8K, ya que es un modelo de embeddings y no un LLM generativo. Tampoco se especifican métricas de recuperación (como nDCG o MRR) en la documentación accesible.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de ~600 millones de parámetros, en fp32 ocuparía aproximadamente 2,5 GB; en fp16 o bf16, ~1,25 GB; en int8, ~0,6 GB. Con una ventana de contexto de 8 000 tokens, el uso de memoria adicional es moderado.
- **GPU recomendadas**: al ser un encoder de tamaño medio, puede ejecutarse en GPUs de consumo como la RTX 3090, RTX 4090, o incluso en GPUs de gama media como la RTX 3060 con cuantización. Para despliegues a gran escala, se recomienda A10G, A100 o H100.
- **CPU**: es viable ejecutar inferencia en CPU para tareas batch pequeñas, aunque la latencia será mayor.
- **Opciones de despliegue**: se puede usar con `sentence_transformers` (como se muestra en el ejemplo), `transformers` de Hugging Face, o servidores de inferencia como vLLM, TGI o ONNX Runtime. También se puede integrar con `llama.cpp` para despliegue en CPU, aunque no es lo habitual para encoders.
- **Latencia y throughput**: no se especifican datos oficiales; se estima que en una GPU moderna (A100) la latencia de inferencia es de pocos milisegundos por lote, y el throughput depende del tamaño del lote.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada con otros modelos de embeddings en la información proporcionada. Sin embargo, se pueden mencionar alternativas conocidas en la categoría de embeddings multilingües:

| Modelo | Parámetros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| SEA-LION-ModernBERT-Embedding-600M | 611M | 8K | MIT | 11 idiomas (SEA + EN + CN) |
| multilingual-e5-large | 560M | 512 | MIT | 100 idiomas (incluye SEA) |
| BGE-M3 | 568M | 8192 | MIT | 100+ idiomas |

Nota: los datos de los modelos alternativos son de conocimiento general y pueden variar; se recomienda consultar sus fichas oficiales.

## Limitaciones y advertencias

- El modelo no ha sido probado frente a usos adversariales, por lo que su robustez en entornos hostiles no está garantizada.
- Al ser un encoder, no genera texto; sus respuestas son representaciones vectoriales, pero puede heredar sesgos de los datos de entrenamiento, lo que puede afectar a la calidad de las representaciones en ciertos dominios.
- Aunque el contexto es de 8 000 tokens, los textos más largos pueden requerir truncamiento o estrategias de chunking, lo que puede degradar la calidad de los embeddings.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías; los usuarios deben validar sus resultados para sus casos de uso.
- No se han publicado evaluaciones de robustez ni de rendimiento en tareas específicas, por lo que se recomienda evaluar el modelo en el dominio objetivo antes de producción.

## Enlaces

- [HuggingFace: aisingapore/SEA-LION-ModernBERT-Embedding-600M](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-600M)
- [Documentación de SEA-LION (ModernBERT y Embedding)](https://docs.sea-lion.ai/models/sea-embedding/sea-modernbert)
- [Documentación general de SEA-LION Embedding](https://docs.sea-lion.ai/models/sea-embedding)
- [Repositorio GitHub de SEA-LION](https://github.com/aisingapore/sealion)
- [Paper arXiv: 2606.03027 (SEA-Embedding)](https://arxiv.org/abs/2606.03027)
- [Modelo base: SEA-LION-ModernBERT-600M-checkpoints](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-600M-checkpoints)
- [Modelo alternativo: SEA-LION-E5-Embedding-600M](https://huggingface.co/aisingapore/SEA-LION-E5-Embedding-600M)</think>## Resumen

SEA-LION-ModernBERT-Embedding-600M es un modelo de embeddings textuales desarrollado por el AI Products Pillar de AI Singapore, dentro de la colección SEA-LION (Southeast Asian Languages In One Network). Está diseñado para resolver el problema de la representación semántica de textos en lenguas del Sudeste Asiático, un área tradicionalmente desatendida por los modelos multilingües globales. El modelo se basa en la arquitectura encoder-only ModernBERT, con un vocabulario de 262 000 tokens y una longitud de contexto de 8 000 tokens, y emplea el tokenizer SentencePiece de Gemma 3, optimizado para scripts regionales complejos como el birmano, el jemer o el tailandés.

Su relevancia actual reside en que es uno de los pocos modelos de embeddings con licencia MIT específicamente entrenado para idiomas del Sudeste Asiático, con un entrenamiento en dos fases: un pre-entrenamiento contrastivo sobre 245 millones de pares de texto (EN-EN y EN-SEA) y un ajuste fino por instrucciones con 13 millones de pares (EN-EN, CN-CN, EN-SEA y SEA-SEA). Esto permite una alineación cross-lingual eficiente y una mejor compresión de tokens para scripts regionales, lo que se traduce en mayor eficiencia computacional en tareas de recuperación y similitud semántica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, transformer) |
| Parámetros totales | 611 640 320 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8 000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | burrito, inglés, indonesio, jemer, lao, malayo, birmano, tamil, tailandés, filipino, vietnamita, chino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está construido sobre la arquitectura ModernBERT-large, una variante de BERT optimizada para eficiencia computacional y velocidad de entrenamiento. Al ser encoder-only, su función es generar representaciones densas de texto (embeddings) en lugar de texto libre. La innovación principal es la adopción del tokenizer SentencePiece de Gemma 3, que ofrece una mayor fertilidad de tokenización y mejores tasas de compresión para scripts regionales complejos, lo que permite manejar contextos más largos con menor coste computacional.

El entrenamiento se realizó en dos etapas: primero, un pre-training contrastive con 245 millones de pares de texto (EN-EN y EN-SEA) para alinear representaciones cross-linguales; y después, un ajuste fino por instrucciones con 13 millones de pares (EN-EN, CN-CN, EN-SEA y SEA-SEA) para refinar la capacidad de recuperación y similitud. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para frases o documentos, listos para tareas de similitud semántica, búsqueda y clustering.
- Alineación cross-lingual: permite comparar textos en distintos idiomas del Sudeste Asiático, así como con inglés y chino, en un mismo espacio vectorial.
- Soporte de retrieval-augmented generation (RAG): puede integrarse como componente de recuperación en pipelines de RAG para recuperar documentos relevantes en múltiples idiomas.
- Capacidad de similitud directa: el modelo ofrece un método `similarity()` para calcular puntuaciones de similitud entre embeddings, como se muestra en el ejemplo de uso.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step, al ser un modelo encoder puro.
- No se especifican capacidades de visión o audio; es exclusivamente textual.

## Casos de uso

- **Búsqueda semántica multilingüe**: el modelo puede indexar documentos en birmano, tailandés, vietnamita, etc., y recuperar resultados relevantes a partir de una consulta en inglés, gracias a su alineación cross-lingual y contexto de 8 000 tokens. Es adecuado para portales de contenido regional.
- **RAG (Retrieval-Augmented Generation)**: en un sistema de preguntas-respuestas sobre documentos del Sudeste Asiático, el modelo actúa como el componente de recuperación, devolviendo los pasajes más relevantes a un LLM generativo para que responda.
- **Comparación de similitud en datos**: permite identificar duplicados o documentos relacionados en bases de datos multilingües, por ejemplo, en plataformas de comercio electrónico que operan en varios países.
- **Sistemas de recomendación**: al generar embeddings de artículos, productos o noticias en distintos idiomas, se pueden recomendar contenidos similares a usuarios que hablan idiomas diferentes.
- **Clasificación de textos**: los embeddings pueden usarse como características de entrada para clasificadores de sentimiento, categorización de noticias o análisis de opinión en textos SEA, sin necesidad de ajustar el modelo base.
- **Análisis de datos de redes sociales**: el modelo puede procesar comentarios y publicaciones en varios idiomas del Sudeste Asiático para detectar temas o sentimientos, aprovechando su capacidad de manejar scripts complejos como el jemer o el lao.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MMLU, HumanEval o GSM8K, ya que es un modelo de embeddings y no un LLM generativo. Tampoco se proporcionan métricas de recuperación como nDCG o MRR en la model card accesible.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de ~611M parámetros, en fp32 ocupa ~2,5 GB; en fp16/bf16 ~1,3 GB; en int8 ~0,7 GB. Con una ventana de contexto de 8 000 tokens, el uso de memoria adicional es moderado.
- **GPU recomendadas**: al ser un encoder de tamaño medio, puede ejecutarse en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4090, así como en GPUs de datacenter como A10, A100 o H100. Con cuantización en int8, puede caber en GPUs de 4-6 GB.
- **CPU**: es factible la inferencia en CPU para batch, aunque la latencia será mayor; se recomienda para entornos de baja demanda.
- **Opciones de despliegue**: se integra con `sentence-transformers`, `transformers` de Hugging Face, y puede desplegarse con vLLM, TGI o ONNX Runtime. También se puede usar con `llama.cpp` para CPU, aunque no es lo habitual.
- **Latencia y throughput**: no se han publicado datos oficiales; se estima que en una A100 la inferencia de un lote de 100 frases tarda unos pocos milisegundos, pero depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada en la información accesible. Sin embargo, se pueden comparar con alternativas conocidas en la categoría de embeddings multilingües:

| Modelo | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| SEA-LION-ModernBERT-Embedding-600M | 611M | 8K | 12 (SEA + EN + ZH) | MIT |
| e5-large-v2 (multilingüe) | 560M | 512 | 100+ | MIT |
| BGE-M3 | 568M | 8192 | 100+ | MIT |

Nota: los datos de los modelos alternativos son de conocimiento general y pueden variar; se recomienda consultar sus fichas oficiales para verificar.

## Limitaciones y advertencias

- El modelo no ha sido probado contra usos adversariales, por lo que su robustez en entornos hostiles no está garantizada.
- Como encoder, no genera texto, pero puede heredar sesgos de los datos de entrenamiento, lo que podría afectar a la calidad de las representaciones en ciertos dominios o idiomas.
- La longitud de contexto es de 8 000 tokens, por lo que documentos más largos deben truncarse o dividirse en chunks, lo que puede degradar la calidad de los embeddings.
- La licencia MIT permite uso comercial, pero el modelo se ofrece sin garantías; los usuarios deben validar su rendimiento en sus casos de uso específicos.
- No se han publicado evaluaciones de rendimiento en tareas concretas, por lo que se recomienda realizar una evaluación interna antes de desplegar en producción.

## Enlaces

- [HuggingFace: aisingapore/SEA-LION-ModernBERT-Embedding-600M](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-600M)
- [Documentación de SEA-LION ModernBERT y Embedding](https://docs.sea-lion.ai/models/sea-embedding/sea-modernbert)
- [Documentación general de SEA-LION Embedding](https://docs.sea-lion.ai/models/sea-embedding)
- [Repositorio GitHub de SEA-LION](https://github.com/aisingapore/sealion)
- [Paper arXiv 2606.03027 (SEA-Embedding)](https://arxiv.org/abs/2606.03027)
- [Modelo base: SEA-LION-ModernBERT-600M-checkpoints](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-600M-checkpoints)
- [Variante alternativa: SEA-LION-E5-Embedding-600M](https://huggingface.co/aisingapore/SEA-LION-E5-Embedding-600M)</think>## Resumen

SEA-LION-ModernBERT-Embedding-600M es un modelo de embeddings textuales desarrollado por el AI Products Pillar de AI Singapore, dentro de la colección SEA-LION (Southeast Asian Languages In One Network). Está diseñado para resolver el problema del procesamiento semántico de textos en idiomas del Sudeste Asiático, un ámbito tradicionalmente mal cubierto por los modelos multilingües globales. El modelo se basa en una arquitectura encoder-only ModernBERT, con un vocabulario de 262 000 tokens y una longitud de contexto de 8 000 tokens, y emplea el tokenizer SentencePiece de Gemma 3, optimizado para scripts regionales complejos como el birmano, el jemer o el lao.

Su relevancia actual radica en que es uno de los pocos modelos de embeddings con licencia MIT y entrenamiento específico para la región SEA, con un pipeline de entrenamiento en dos fases: pre-training contrastive sobre 245 millones de pares de texto (EN-EN y EN-SEA) y ajuste fino por instrucciones sobre 13 millones de pares (EN-EN, CN-CN, EN-SEA y SEA-SEA). Esto permite una alineación cross-lingual eficiente y una mejor compresión de tokens para scripts complejos, lo que facilita tareas de recuperación y similitud semántica con mayor eficiencia computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, transformer) |
| Parámetros totales | 611 640 320 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8 000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | burrito, inglés, chino, filipino, indonesio, jemer, lao, malayo, tamil, tailandés, vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura ModernBERT-large, una variante de BERT optimizada para eficiencia computacional y velocidad de entrenamiento. Al ser encoder-only, su función es generar representaciones densas (embeddings) en lugar de texto libre. La principal innovación técnica es la adopción del tokenizer SentencePiece de Gemma 3, que ofrece una mayor fertilidad de tokenización y mejores tasas de compresión para scripts regionales complejos, lo que permite manejar contextos largos con menor coste computacional.

El entrenamiento se realizó en dos etapas: primero, un pre-training contrastive con 245 millones de pares de texto (EN-EN y EN-SEA) para alinear representaciones cross-lingual; y después, un ajuste fino por instrucciones con 13 millones de pares (EN-EN, CN-CN, EN-SEA y SEA-SEA) para refinar la capacidad de recuperación y similitud. No se especifica el uso de RLHF o DPO en la información disponible.

## Capacidades

- **Generación de embeddings densos**: produce vectores de 1024 dimensiones para frases o documentos, listos para tareas de similitud, búsqueda o clustering.
- **Alineación cross-lingual**: permite comparar textos en distintos idiomas del Sudeste Asiático, así como con inglés y chino, en un mismo espacio vectorial.
- **Soporte de RAG (Retrieval-Augmented Generation)**: puede actuar como componente de recuperación en pipelines de RAG para devolver documentos relevantes en varios idiomas.
- **Método de similitud integrado**: el modelo incluye una función `similarity()` que calcula la similitud entre embeddings, como se muestra en el ejemplo de uso.
- **Capacidades multilingües**: cubre 12 idiomas, con especial atención a los del Sudeste Asiático.
- **No soporta** generación de texto, tool calling, agentes ni vision/audio; es exclusivamente un encoder de texto.

## Casos de uso

- **Búsqueda semántica multilingüística**: el modelo puede indexar documentos en tailandés, vietnamita, birmano, etc., y recuperar resultados relevantes a partir de una consulta en inglés o chino, gracias a su alineación cross-lingual y contexto de 8 000 tokens. Es adecuado para motores de búsqueda regionales o bases de datos de investigación.
- **RAG (Retrieval-Augmented Generation)**: en un sistema de preguntas-respuestas sobre documentos del Sudeste Asiático, el modelo recupera los pasajes más relevantes en múltiples idiomas y los pasa a un LLM generativo para que elabore la respuesta.
- **Detección de duplicados en plataformas de comercio electrónico**: comparando embeddings de descripciones de productos en distintos idiomas, se pueden identificar artículos similares o duplicados en mercados multilingües.
- **Sistemas de recomendación**: al generar embeddings de artículos, noticias o contenido generado por usuarios, se pueden calcular similitudes para recomendar contenido relacionado a usuarios que hablan idiomas diferentes.
- **Clasificación de textos**: los embeddings sirven como entrada para clasificadores de sentimiento o categorización de textos en idiomas regionales, sin necesidad de entrenar desde cero.
- **Análisis de redes sociales**: el modelo puede procesar comentarios en varios idiomas del Sudeste Asiático para identificar temas o sentimientos, aprovechando su capacidad de manejar scripts complejos como el jemer o el lao.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de métricas como MMLU, HumanEval o GSM8K, ya que es un modelo de embeddings y no un LLM generativo. Tampoco se proporcionan métricas de recuperación (como nDCG o MRR) en la model card de acceso.

## Requisitos de hardware

- **VRAM estimada**: para 611M parámetros, en fp32 ocupa ~2,5 GB; en bf16/fp16 ~1,3 GB; en int8 ~0,6 GB. Con contexto de 8 000 tokens, la memoria adicional es moderada.
- **GPU recomendadas**: se puede ejecutar en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4090, así como en GPUs de datacenter como A10, A100 o H100. Con cuantización int8, podría caber en GPUs con 4-6 GB.
- **CPU**: es posible la inferencia en CPU para batch, aunque la latencia será mayor; se recomienda para uso de pruebas o aplicaciones de baja demanda.
- **Opciones de despliegue**: se integra con `sentence_transformers`, `transformers` de Hugging Face, y puede desplegarse con vLLM, TGI o ONNX Runtime. También se puede usar con `llama.cpp` para CPU, aunque no es lo habitual.
- **Latencia y throughput**: no se han publicado datos; con una A100, un batch de embeddings de frases cortas puede procesarse en milisegundos, pero depende de la biblioteca y la configuración.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada en la información accesible. Sin embargo, se pueden comparar con alternativas de embeddings multilingües:

| Modelo | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| SEA-LION-ModernBERT-Embedding-600M | 611M | 8K | 12 (SEA + EN + ZH) | MIT |
| e5-large-v2 | 560M | 512 | 100+ | MIT |
| BGE-M3 | 568M | 8192 | 100+ | MIT |

Nota: los datos de los modelos alternativos son de referencia general y pueden variar; se recomienda consultar sus fichas oficiales para verificar.

## Limitaciones y advertencias

- El modelo no ha sido probado frente a usos adversariales, por lo que su robustez en entornos hostiles no está garantizada.
- Como encoder, no genera texto, pero puede heredar sesgos de los datos de entrenamiento, lo que puede afectar a la calidad de las representaciones en ciertos dominios o idiomas.
- La longitud de contexto es de 8 000 tokens; documentos más largos deben truncarse o dividirse en chunks, lo que puede degradar la calidad de los embeddings.
- La licencia MIT permite uso comercial, pero el modelo se ofrece sin garantías; los usuarios deben validar su rendimiento en sus casos de uso específicos.
- No se han publicado pruebas de robustez ni de rendimiento en tareas concretas, por lo que se recomienda realizar una evaluación propia antes de producción.

## Enlaces

- [HuggingFace: aisingapore/SEA-LION-ModernBERT-Embedding-600M](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-600M)
- [Documentación de SEA-LION ModernBERT y Embedding](https://docs.sea-lion.ai/models/sea-embedding/sea-modernbert)
- [Documentación general de SEA-LION Embedding](https://docs.sea-lion.ai/models/sea-embedding)
- [Repositorio GitHub de SEA-LION](https://github.com/aisingapore/sealion)
- [Paper arXiv 2606.03027 (SEA-Embedding)](https://arxiv.org/abs/2606.03027)
- [Modelo base: SEA-LION-ModernBERT-600M-checkpoints](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-600M-checkpoints)
- [Variante alternativa: SEA-LION-E5-Embedding-600M](https://huggingface.co/aisingapore/SEA-LION-E5-Embedding-600M)
