# GermannM/kenga-embed-z

## Resumen

kenga-embed-z es un modelo de embeddings para similitud de frases y recuperación de información, desarrollado por GermannM. Está diseñado para trabajar con textos en ruso e inglés, y su pipeline principal es sentence-similarity. Según la model card, se trata de una versión antigua y no instruct del modelo Z-Embed, con una longitud de secuencia de 96. El autor indica que es el mejor checkpoint congelado de la serie Z en su conjunto de validación manual: 12/12 en inglés y 11/12 en ruso.

El modelo se publica bajo licencia MIT y el repositorio ocupa 0.2 GB. No se ha proporcionado información sobre la arquitectura interna, el número de parámetros ni los datos de entrenamiento. Su relevancia radica en ofrecer un punto de partida para tareas de retrieval bilingüe ru/en, aunque su uso requiere respetar la ausencia de instrucciones y la codificación UTF-8 de los bytes de entrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KengaEmbed (arquitectura personalizada, sin detalles publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 96 (según la model card, sin más detalles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ru, en |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio usa la librería pytorch) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo, los datos de entrenamiento, el número de tokens o el proceso de optimización. La model card únicamente indica que es un modelo de embeddings no instruct, y que se debe codificar el texto como bytes UTF-8 sin aplicar prefijos de instrucción. El código de ejemplo utiliza una clase `KengaEmbed` con métodos `encode_queries` y `encode_documents`, lo que sugiere una arquitectura específica para recuperación de información, pero no se ofrecen más detalles técnicos.

## Capacidades

- Generación de embeddings para similitud de frases y recuperación de documentos.
- Soporte de consultas y documentos mediante métodos dedicados (`encode_queries`, `encode_documents`).
- Multilingüe en ruso e inglés.
- No es un modelo instruct: no se debe aplicar el prefijo Giga instruct.
- Codificación de entrada en bytes UTF-8.
- No se indica soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Búsqueda semántica en corpus rusos: el modelo puede indexar documentos en ruso y recuperar los más relevantes a partir de consultas en lenguaje natural, aprovechando su entrenamiento específico para este idioma.
- Recuperación aumentada por generación (RAG) en inglés: al generar embeddings de documentos y consultas, permite integrar un paso de recuperación en pipelines de RAG para responder preguntas sobre documentación técnica en inglés.
- Deduplicación de textos en entornos bilingües: la comparación de embeddings permite identificar artículos, entradas de base de conocimiento o tickets duplicados en ruso e inglés.
- Clasificación de documentos por similitud: se puede utilizar para agrupar documentos no etiquetados en clústeres temáticos, facilitando la organización de repositorios de contenido.
- Sistemas de recomendación de contenido: a partir de un artículo de referencia, el modelo puede sugerir otros textos similares en ruso o inglés, útil en portales de noticias o documentación.
- Validación de respuestas en sistemas de preguntas frecuentes: al comparar la similitud entre una pregunta del usuario y las preguntas almacenadas, se puede seleccionar la respuesta más adecuada, siempre que los textos no excedan la longitud de secuencia de 96.

## Benchmarks y rendimiento

Según la model card, el autor proporciona los siguientes resultados en su conjunto de validación manual (holdout) y en RuSTS:

| Benchmark | Resultado |
|---|---|
| Holdout EN | 1.000 |
| Holdout RU | 0.917 |
| RuSTS (mismas pesos, 2026-09-02, no instruct) | 0.3723 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de embeddings. Los datos presentados provienen exclusivamente del autor y no se han verificado de forma externa.

## Requisitos de hardware

No disponible. No se ha publicado información sobre requisitos de VRAM, GPU recomendadas, latencia o throughput. El tamaño del repositorio es de 0.2 GB, pero no se pueden extraer conclusiones fiables sobre los requisitos de hardware sin datos adicionales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de embeddings de características similares.

## Limitaciones y advertencias

- No es un modelo instruct: aplicar el prefijo Giga instruct puede degradar el rendimiento, según advierte el autor.
- Longitud de secuencia limitada a 96, lo que restringe el uso a fragmentos de texto cortos.
- Solo soporta ruso e inglés; no se garantiza un buen comportamiento en otros idiomas.
- Los benchmarks disponibles son internos y no han sido verificados por la comunidad.
- El modelo puede producir embeddings de baja calidad en dominios muy distintos a los datos de entrenamiento, aunque no se dispone de información sobre la composición de estos datos.
- La licencia MIT permite uso comercial, pero no incluye garantías de rendimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/kenga-embed-z
- Repositorio relacionado del autor (kenga-lang): https://github.com/GermannM3/kenga-lang
