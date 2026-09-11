# cyankiwi/Spark-X2.5-4B-AWQ-INT4

## Resumen

Spark-X2.5-4B-AWQ-INT4 es la versión cuantizada a 4 bits con AWQ del modelo Spark-X2.5-4B desarrollado por XHToken, publicada por el usuario cyankiwi bajo el marco de trabajo "activation-aware". Se trata por tanto de una conversión de pesos, no de un modelo entrenado desde cero: el autor original es XHToken y la licencia Apache 2.0 se mantiene. El modelo base es un LLM compacto de propósito general, con 4.112.079.360 parámetros totales, orientado a conversación, escritura, traducción, razonamiento, código, uso de herramientas y flujos agénticos.

La innovación principal del modelo original es su arquitectura de atención híbrida, que combina una capa de atención completa por cada tres capas de atención de ventana deslizante (sliding window attention). Este diseño reduce el coste computacional asociado a los modelos de contexto largo y permite soportar de forma nativa una ventana de hasta 1.000.000 de tokens. El modelo se entrenó en clústeres Huawei Ascend y recurre a aprendizaje por refuerzo a gran escala y a técnicas de post-entrenamiento como MOPD para reforzar razonamiento, código, capacidades agénticas y seguimiento de instrucciones.

Esta ficha se centra en la variante AWQ INT4, que reduce el peso en disco a 2,86 GB y permite desplegar un modelo de 4B con contexto nominal de 1M tokens en hardware mucho más modesto que la versión en precisión completa. Es relevante ahora porque la combinación de cuantización INT4, atención híbrida y compatibilidad con vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio facilita su uso en entornos de desarrollo locales y en despliegues con requisitos estrictos de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (1 capa de atención completa por cada 3 capas de sliding window attention) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | Hasta 1.000.000 de tokens de forma nativa |
| Tipos de cuantizacion | AWQ INT4 (formato compressed-tensors); calibración sobre el dataset "STEM and Agentic" de cyankiwi |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES (lista de la model card); el texto introductorio del modelo base afirma soporte para más de 200 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantización compressed-tensors (repo de 2,9 GB; modelo declarado de 2,86 GB) |
| Version de la cuantizacion | 26.05.01 |
| Modelo base | XHToken/Spark-X2.5-4B |
| Libreria | transformers (requiere `custom_code`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base Spark-X2.5-4B emplea una arquitectura transformer con atención híbrida: intercala capas de atención completa con capas de atención de ventana deslizante en una proporción de una a tres. Según la documentación del autor, este esquema busca equilibrar rendimiento, eficiencia de inferencia y tamaño del KV-cache, evitando las limitaciones de depender de un único mecanismo de atención. La ventana de contexto nativa es de hasta 1.000.000 de tokens, algo poco habitual en modelos de esta escala. El modelo se distribuye junto a una variante menor, Spark-X2.5-1.7B.

En cuanto al entrenamiento, la model card indica que el modelo se preentrenó sobre aproximadamente 2 (la cifra queda truncada en la información disponible, por lo que no se puede confirmar si se refiere a billones de tokens u otra unidad) y que el proceso se llevó a cabo en clústeres Huawei Ascend. El post-entrenamiento incluye aprendizaje por refuerzo a gran escala y técnicas como MOPD, orientadas a mejorar razonamiento, generación de código, comportamiento agéntico y seguimiento de instrucciones. No se detalla en la información disponible la composición exacta del dataset, la mezcla de idiomas ni si se aplicaron fases específicas de RLHF o DPO, más allá de la mención genérica al RL y a MOPD.

Respecto a esta ficha concreta, la cuantización AWQ INT4 fue realizada por cyankiwi usando un conjunto de calibración propio denominado "STEM and Agentic", lo que sugiere que la calibración se orientó a tareas de ciencia, tecnología, ingeniería y matemáticas junto con flujos agénticos. No se publican en la información disponible los detalles del grupo de cuantización, el ratio de compresión exacto ni métricas de degradación respecto al modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de contexto nativo de hasta 1M tokens.
- Escritura y redacción de contenido general, según la descripción del autor.
- Traducción entre idiomas: la model card lista EN, ZH, HI, AR, RU, JA, KO, NL, FR y ES, y el texto introductorio menciona soporte para más de 200 idiomas.
- Razonamiento y resolución de problemas, reforzado mediante RL y post-entrenamiento.
- Generación de código y tareas de programación cotidianas.
- Uso de herramientas (tool calling / function calling), según la mención explícita a "tool use".
- Flujos agénticos y razonamiento multi-paso: integración declarada con harnesses como Codex, Claude Code, OpenClaw y Hermes.
- Seguimiento de instrucciones.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Atención al cliente automatizada: con 1M tokens de contexto nativo, el modelo puede mantener conversaciones multi-turno con historiales extensos, documentación de producto o registros de tickets sin recurrir a resúmenes agresivos, manteniendo coherencia en interacciones largas.
- Análisis de documentos extensos: informes técnicos, contratos, expedientes o bases de código completas pueden procesarse en una sola pasada gracias a la ventana de contexto, extrayendo respuestas concretas sin necesidad de un pipeline RAG complejo.
- Asistente de programación en local: al pesar 2,86 GB en INT4, puede ejecutarse en un portátil con GPU consumer mediante Ollama o LM Studio y usarse como copiloto de código con soporte de tool calling para consultar repositorios o ejecutar comandos.
- Agentes autónomos de varios pasos: la integración declarada con harnesses agénticos como Codex, Claude Code, OpenClaw y Hermes permite construir agentes que planifican, invocan herramientas y encadenan acciones sobre APIs o sistemas internos.
- Traducción y localización multilingüe: con soporte declarado para más de 200 idiomas y presencia explícita del español, puede emplearse en pipelines de traducción de documentación técnica o de atención al cliente en varios idiomas.
- Procesamiento por lotes en clúster con vLLM o SGLang: la cuantización INT4 reduce el coste por token y el consumo de memoria, lo que permite densidades de despliegue mayores por GPU en tareas de clasificación, resumen o extracción de información a gran escala.
- Asistente interno sobre base de conocimiento corporativa: combinando el contexto largo con tool calling, el modelo puede consultar índices, wikis internas o bases de datos y responder con trazabilidad de las fuentes.
- Evaluación y prototipado de investigación: al ser una variante cuantizada de un modelo Apache 2.0, sirve para comparar el impacto de AWQ INT4 frente a los pesos originales en tareas de razonamiento, código y agente antes de decidir un despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card del modelo base incluye una imagen comparativa de benchmarks (`images/model-benchmark-comparison.svg`), pero no se han proporcionado los valores concretos, por lo que no se reproducen cifras. Tampoco se han facilitado métricas de degradación de esta cuantización AWQ INT4 respecto a los pesos en precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 2,86 GB en INT4. El consumo total depende del backend, del tamaño de lote y, sobre todo, del KV-cache. Para contextos cortos puede estimarse un uso en torno a 4-6 GB, pero se trata de una estimación derivada del tamaño del repo, no de un dato publicado.
- GPU recomendadas: no disponible en la información proporcionada. El autor indica compatibilidad con hardware de NVIDIA, Huawei, Hygon y HOUMO.AI.
- GPU consumer: por tamaño de pesos, el modelo debería caber en GPUs consumer con 8 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Esta afirmación es una inferencia a partir de los 2,86 GB de pesos, no un dato confirmado por el autor.
- Contexto largo: con 1M tokens, el KV-cache domina el consumo de memoria y no se dispone de cifras oficiales. Será necesario aplicar cuantización del KV-cache o limitar la longitud efectiva según el hardware.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio están mencionados explícitamente por el autor. También se indica compatibilidad con LLaMA-Factory para ajuste fino. Compatibilidad con TGI: no disponible.
- Latencia y throughput: el autor afirma que el modelo ofrece mejor TTFT, TOPT y eficiencia de inferencia que modelos de tamaño similar en varias plataformas de hardware, pero no se publican cifras concretas.
- Nota sobre `custom_code`: al requerir código personalizado, conviene revisar que el backend de despliegue elegido soporte la arquitectura antes de llevarlo a producción.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo en la información proporcionada, por lo que la comparación se limita a características públicas de modelos de tamaño similar. Los datos de terceros deben verificarse en sus respectivas fichas antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Spark-X2.5-4B-AWQ-INT4 (esta ficha) | 4,11B (INT4, 2,86 GB) | Hasta 1M tokens nativos | Apache 2.0 | No disponible |
| XHToken/Spark-X2.5-1.7B | 1,7B (según el autor) | No disponible | No disponible | No disponible |
| Alternativas de ~3-4B (Qwen3-4B, Llama-3.2-3B, Gemma-3-4B) | ~3-4B | Variable según modelo | Variable (Apache 2.0, licencia Llama, licencia Gemma) | No disponible en esta ficha |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se publica información sobre sesgos demográficos, culturales o lingüísticos.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos. No se han publicado evaluaciones de fiabilidad factual para esta versión cuantizada.
- Degradación por cuantización: se trata de una conversión AWQ INT4 realizada por un tercero (cyankiwi), no por XHToken. No se han publicado métricas comparativas frente a los pesos originales, por lo que la pérdida de precisión en tareas sensibles (matemáticas, código, razonamiento largo) es desconocida.
- Contexto: aunque la ventana nativa es de 1M tokens, no se han publicado resultados de evaluación tipo "needle in a haystack" que confirmen la recuperación efectiva de información a esas longitudes.
- Idiomas: la model card lista diez idiomas, mientras que el texto introductorio del modelo base afirma más de 200. Esta discrepancia debe verificarse antes de asumir cobertura multilingüe amplia en producción.
- Requiere `custom_code` en transformers: implica cargar código personalizado del repositorio, lo que añade un paso de auditoría de seguridad en entornos corporativos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia. Conviene confirmar que el modelo base XHToken/Spark-X2.5-4B mantiene la misma licencia (los tags del repositorio indican apache-2.0).
- Datos demográficos y de uso: el repositorio muestra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe una comunidad amplia de validación independiente.
- Etiqueta `region:us`: puede implicar restricciones de disponibilidad en determinadas jurisdicciones; revisar los términos aplicables.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/cyankiwi/Spark-X2.5-4B-AWQ-INT4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Dataset de calibración de cyankiwi: https://huggingface.co/datasets/cyankiwi/calibration
- Slack de la comunidad: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
