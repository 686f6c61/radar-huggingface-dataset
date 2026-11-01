# Crawlnet/queen-v7

## Resumen

Queen v7 "empress" es un modelo de lenguaje pequeño entrenado desde cero por Crawlnet, especializado en contenido del ámbito de las criptomonedas. Se trata de un modelo GPT basado en el framework nanochat de Andrej Karpathy, con 1.384,1 millones de parámetros totales (729,8 millones no incrustados) y una ventana de contexto de 2.048 tokens. Su peculiaridad principal es que no emplea ningún corpus preexistente como FineWeb: todo su preentrenamiento procede de páginas web del sector cripto rastreadas por los crawlers de Crawlnet, complementadas con registros públicos de mercado y on-chain convertidos a texto plano, y con notas de estudio y pares de pregunta/respuesta generados por un LLM de propósito general a partir de esas mismas páginas.

El proyecto tiene un componente comunitario notable: las páginas de preentrenamiento las aportan crawlers propiedad de miembros de la comunidad, que los generan quemando el token $CRAWLNET en Solana, con las transacciones de quema públicas on-chain. El modelo se ha ajustado posteriormente mediante SFT con pares de pregunta/respuesta sintéticos y extraídos de los propios encabezados de las páginas, incluyendo una fase "open book" que le permite responder a partir de páginas recuperadas por búsqueda.

Es relevante como ejemplo de modelo vertical entrenado desde cero sobre datos de dominio propio, con un coste de entrenamiento contenido (38.524 horas de GPU en 4x RTX PRO 6000) y licencia Apache 2.0, lo que lo hace utilizable comercialmente sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat GPT (transformer decoder-only), profundidad 24, anchura 1536, 12 cabezas de atención |
| Parametros totales | 1.384.122.122 (1.384,1M) |
| Parametros activos | no disponible (no es MoE; 729,8M de parámetros no incrustados) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2,8 GB de tamaño de repo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only GPT siguiendo la receta de nanochat (commit `92d63d4e8bb4` del repositorio de Karpathy, código MIT, con adiciones propias de Crawlnet en el directorio `training/`). Con profundidad 24, anchura 1536 y 12 cabezas de atención, emplea un tokenizador BPE de 32.768 tokens reutilizado sin cambios de una versión anterior de Queen, entrenado únicamente sobre las páginas de aquella versión.

El preentrenamiento se realizó sobre 2.532.249.995 tokens del flujo preparado (1.136.801.027 tokens únicos), con la siguiente mezcla: páginas de crawler (71,9 %), páginas de registros públicos escritas a partir de plantillas sin LLM (2,8 %), notas de estudio generadas por un LLM de propósito general para 183.105 páginas (19,7 %) y pares de pregunta/respuesta generados por LLM (5,6 %). Los pesos publicados corresponden al checkpoint del paso 4.579 de 4.829, es decir, el modelo vio el 95 % del flujo. La pérdida de validación en preentrenamiento fue de 0,7637 bits/byte sobre páginas de 468 sitios reservados que nunca se usaron en entrenamiento. El coste total fue de 38.524 horas de GPU (9,631 horas de muro en 4x RTX PRO 6000 alquiladas).

El ajuste conversacional (SFT) combinó dos fuentes: `synthetic+openbook`, con 62.216 pares de pregunta/respuesta generados por un LLM de propósito general a partir de 19.405 fragmentos de página (con verificación de que las palabras clave aparecen en la página), y `headings`, con 1.966.130 pares extraídos directamente de las páginas (preguntas de FAQ, encabezados y títulos, con respuestas textuales de la página). En la fase "open book", los pares generados se entrenaron de nuevo con el texto de la página delante de la pregunta (52.555 conversaciones, 32 % con una segunda página bien posicionada por búsqueda), de modo que el modelo puede responder a partir de páginas recuperadas para una consulta.

## Capacidades

- Generación de texto en inglés, centrada en el dominio de las criptomonedas (contenido web cripto, mercados, financiación y datos on-chain).
- Respuesta a preguntas sobre contenido del dominio cripto, tanto de memoria como en modo "open book" a partir de páginas recuperadas por búsqueda.
- Conversación multi-turno tras el ajuste SFT con más de 2 millones de pares de pregunta/respuesta.
- No hay información sobre capacidades de código, matemáticas, visión, audio ni razonamiento multi-paso más allá de lo implícito en el entrenamiento conversacional.
- No hay información sobre soporte de tool calling ni function calling.

## Casos de uso

- Asistente conversacional sobre criptomonedas: el modelo puede responder preguntas sobre proyectos, mercados y conceptos cripto en inglés, apoyándose en el conocimiento de más de 600.000 páginas rastreadas de 18.772 dominios.
- Sistema de preguntas y respuestas con recuperación (RAG): gracias al entrenamiento "open book", el modelo está preparado para responder a partir de páginas recuperadas por un buscador, lo que lo hace adecuado para chatbots documentales sobre contenido cripto.
- Resumen y explicación de contenido web cripto: el preentrenamiento con notas de estudio (explicaciones, FAQs y listas de hechos generadas a partir de páginas) favorece la capacidad de explicar y estructurar información de este dominio.
- Base para agentes de investigación cripto: su especialización en registros de mercado, financiación y datos on-chain en texto plano lo hace útil como componente de lectura y redacción en pipelines de análisis del sector.
- Experimentación educativa y de investigación: al ser un modelo de ~1.400M entrenado desde cero con receta nanochat documentada y manifiestos de datos con hashes SHA-256 públicos, es un buen caso de estudio sobre entrenamiento vertical desde cero.
- Despliegue en hardware modesto: con 2,8 GB en safetensors y 1.384M de parámetros, es viable su ejecución en GPUs de consumo para prototipado local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento publicado es la pérdida de validación en preentrenamiento: 0,7637 bits/byte sobre páginas de 468 sitios reservados nunca entrenados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.384M de parámetros en FP16/BF16, aproximadamente 2,8 GB solo de pesos; con cuantización de 8 o 4 bits sería inferior, aunque no hay versiones cuantizadas publicadas (no disponible).
- GPU recomendadas: cualquier GPU de consumo con 8 GB de VRAM o más es suficiente para inferencia (por ejemplo, RTX 3060, RTX 4060 Ti o superiores). Para entrenamiento, el autor empleó 4x RTX PRO 6000.
- Cabe con holgura en GPUs de consumo actuales dado su tamaño de 2,8 GB.
- Opciones de despliegue: el modelo usa la librería nanochat; no hay información específica sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al estar en safetensors con arquitectura GPT de nanochat, lo más directo es emplear el propio código de nanochat (karpathy/nanochat + el directorio `training/` de Crawlnet).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de entrenamiento |
|---|---|---|---|---|
| Queen v7 (Crawlnet) | 1.384M | 2.048 | Apache 2.0 | Corpus cripto propio, desde cero, ~2.530M tokens |
| Qwen2.5-1.5B-Instruct | 1.540M | 32.768 | Qwen Research (uso comercial condicionado) | Corpus masivo multilingue y multi-dominio |
| Llama 3.2 1B Instruct | 1.235M | 128.000 | Llama Community License | Corpus masivo multilingue |
| SmolLM2-1.7B-Instruct | 1.700M | 8.192 | Apache 2.0 | Corpus abierto (FineWeb-Edu, etc.) |

Queen v7 se diferencia de estas alternativas en que es un modelo vertical entrenado desde cero sobre un corpus de dominio propio y mucho más pequeño (~1.100M tokens únicos frente a billones en los modelos generalistas), con un contexto de 2.048 tokens muy inferior. A cambio, ofrece una licencia Apache 2.0 sin restricciones y especialización en el dominio cripto, algo que los modelos generalistas no ofrecen de forma nativa.

## Limitaciones y advertencias

- Especialización extrema en el dominio cripto y en inglés: no hay soporte declarado para otros idiomas y su rendimiento fuera del dominio de entrenamiento no está documentado.
- Contexto corto de 2.048 tokens, limitante para documentos largos o conversaciones extensas.
- Riesgo de alucinación elevado: gran parte del conocimiento proviene de páginas web cripto (un dominio con mucho contenido de baja calidad y promocional; el propio autor descartó 61.721 fragmentos etiquetados como basura) y del texto de un LLM generador cuya "redacción" condiciona el comportamiento conversacional del modelo.
- Parte del SFT se basa en pares generados por un LLM de propósito general; aunque se filtraron pares cuyas palabras clave no estaban en la página, la calidad factual depende de las páginas originales.
- Sesgos: no hay análisis de sesgos publicado (no disponible). El contenido web cripto rastreado puede contener sesgos promocionales o especulativos.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque conviene revisar los términos del ecosistema $CRAWLNET/crawl.md si se usan los crawlers asociados.
- Sin benchmarks estandarizados publicados: no hay forma objetiva de comparar su calidad con modelos generalistas antes de evaluarlo por cuenta propia.
- Modelo de nicho con muy pocas descargas (269) y sin comunidad de validación externa documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Crawlnet/queen-v7
- Código base (nanochat, Karpathy): https://github.com/karpathy/nanochat
- No hay paper, blog ni demo adicionales en la información disponible.
