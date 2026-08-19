# Baekpica/Motif-3-Mixed-Quant-GGUF

## Resumen

Motif-3 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Motif Technologies, con 314,8 mil millones de parámetros totales y aproximadamente 13,2 mil millones de parámetros activos por token. Su arquitectura incorpora Grouped Differential Latent Attention (GDLA), una innovación en atención diferencial agrupada que permite manejar ventanas de contexto de hasta 262.144 tokens. El repositorio aquí descrito es una conversión independiente a formato GGUF con cuantización mixta, creada por Baekpica, que conserva la topología completa del modelo sin podar ni fusionar capas ni expertos.

Esta conversión está diseñada específicamente para ejecutarse en un único NVIDIA DGX Spark con 128 GB de memoria unificada, logrando un artefacto de 94,16 GB (87,70 GiB) mediante una asignación de precisión por rol de tensor: las rutas siempre activas (embeddings, atención, MLP denso) se mantienen en Q8_0, mientras que los 384 expertos enrutados por capa sparse se comprimen con IQ2_XXS y Q2_K. El servidor asociado, ds4-dfm, ofrece interfaces compatibles con OpenAI y Anthropic, e incluye soporte para herramientas y ejecución en contexto largo validada hasta 128K tokens en H200 y 262.080 tokens en DGX Spark.

La relevancia de este lanzamiento radica en que demuestra la viabilidad de servir un MoE de más de 300 mil millones de parámetros en hardware de consumo (una sola estación DGX Spark) sin sacrificar la integridad estructural del modelo, lo que abre la puerta a despliegues locales de modelos de frontera con requisitos de infraestructura reducidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motif-3, 53 capas (14 full + 39 SWA GDLA), MoE con 384 expertos enrutados por capa sparse y top-8 |
| Parámetros totales | 314.841.775.750 (314,8 mil millones) |
| Parámetros activos | Aproximadamente 13,2 mil millones por token |
| Longitud de contexto | 262.144 tokens (fuente) |
| Tipos de cuantización | Mixta: Q8_0, IQ2_XXS, Q2_K, BF16, F32 (según rol del tensor) |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (11 shards, 94,16 GB / 87,70 GiB) |

## Arquitectura y entrenamiento

El modelo base Motif-3 es un transformador decoder-only de tipo MoE con 53 capas, de las cuales 14 son de atención completa y 39 emplean atención SWA (sliding window attention) combinada con GDLA. Cada capa sparse contiene 384 expertos enrutados, de los cuales se seleccionan 8 por token mediante un router con pesos en F32 para garantizar estabilidad en la decisión. La arquitectura incluye además un experto compartido, Expert-Specific PolyNorm, un mecanismo de control de memoria modificado (mHC) y un predictor MTP (Multi-Token Prediction) de una capa.

No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO) del modelo base en la documentación consultada. La conversión GGUF aquí descrita es una cuantización post-entrenamiento que conserva todos los tensores originales (2.287 tensores) y aplica una precisión diferenciada: los tensores de embedding y cabezal de salida en Q8_0, las proyecciones GDLA y rutas de atención en Q8_0, los MLP densos y experto compartido en Q8_0, los expertos enrutados (gate/up) en IQ2_XXS y sus proyecciones down en Q2_K, y los parámetros de normalización, router y control en F32 o BF16.

## Capacidades

- Generación de texto autoregresiva con soporte para contexto largo de hasta 262.144 tokens.
- Ejecución validada en hardware de memoria unificada (DGX Spark) con ventanas de 196K tokens en servicio simultáneo de tres sesiones.
- Soporte de tool calling y function calling mediante la interfaz OpenAI Responses y Chat Completions.
- Compatibilidad con protocolos OpenAI (Chat Completions, Completions, Responses) y Anthropic Messages a través del servidor ds4-dfm.
- Capacidad de recuperación (retrieval) sobre contexto de hasta 128K tokens, validada en H200.
- Multilingüismo limitado a inglés y coreano, según la declaración del modelo base.
- No se han documentado capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con ventanas de contexto de hasta 262K tokens, lo que permite mantener el historial completo de una interacción prolongada sin truncamientos, adecuado para centros de soporte que requieren seguimiento de incidencias complejas.
- Análisis y resumen de documentos legales o técnicos extensos: con su contexto de 262.144 tokens, es posible procesar contratos, patentes o informes de cientos de páginas en una sola pasada, extrayendo cláusulas relevantes o generando resúmenes ejecutivos.
- Asistentes de programación con contexto de repositorio completo: aunque no se han publicado benchmarks de código, su capacidad de contexto largo permite cargar el contenido de un repositorio mediano y responder preguntas sobre arquitectura, dependencias o errores sin necesidad de fragmentación.
- Agentes autónomos multi-paso: el soporte de tool calling y la interfaz OpenAI Responses permiten construir agentes que encadenan llamadas a herramientas (búsqueda web, APIs, bases de datos) manteniendo el estado de la conversación en memoria durante largas ejecuciones.
- Generación de contenido bilingüe inglés-coreano: útil para empresas que operan en ambos mercados, permitiendo redactar, traducir y localizar contenido manteniendo coherencia terminológica gracias a la ventana de contexto amplia.
- Despliegue local en entornos con restricciones de privacidad: al caber en un DGX Spark (128 GB de memoria unificada), organizaciones con requisitos de soberanía de datos pueden ejecutar el modelo sin depender de APIs externas, usando el servidor ds4-dfm que expone endpoints compatibles con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor de la conversión indica explícitamente que «la calidad del modelo no ha sido evaluada por estas pruebas de servido», por lo que no se dispone de métricas de rendimiento académico comparables.

## Requisitos de hardware

- Memoria mínima para inferencia completa: 128 GB de memoria unificada (DGX Spark) o 96 GB de VRAM en GPU tipo H200 (el modelo/runtime nativo ocupa 91,262 GiB en H200, medido).
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB unificados) o NVIDIA H200 (141 GB HBM3e). No cabe en GPUs de consumo como RTX 4090 o RTX 5090 (24-32 GB VRAM).
- Espacio en disco: 94,16 GB para los 11 shards GGUF, más espacio adicional para el servidor y el estado de ejecución.
- Opciones de despliegue: servidor ds4-dfm (C/CUDA con rutas específicas para la familia Motif), compatible con OpenAI y Anthropic APIs. También puede usarse con runtimes GGUF compatibles con sharding automático (por ejemplo, llama.cpp en sus versiones recientes).
- Latencia y throughput: no se han publicado mediciones específicas de tokens por segundo. La model card reporta que la ejecución en DGX Spark supera una prueba de 262.080 tokens de prompt más 43 tokens de decodificación, y que el servicio simultáneo de tres sesiones con 196K tokens de contexto funciona correctamente, pero sin cifras de rendimiento.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados para este modelo. Estructuralmente, Motif-3 se posiciona como un MoE de 314,8B con 13,2B activos, similar en escala a otros MoE de gran tamaño como DeepSeek-V3 (671B totales, 37B activos) o Mixtral 8x22B (141B totales, 39B activos). Sin embargo, la conversión aquí descrita es única por su cuantización mixta por rol de tensor y su objetivo de caber en un solo DGX Spark, mientras que las alternativas mencionadas suelen requerir múltiples GPUs o versiones cuantizadas más agresivas. No se dispone de datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Conversión independiente no oficial: este repositorio no es un lanzamiento de Motif Technologies, sino una cuantización creada por Baekpica. Los resultados pueden diferir del modelo original en precisión.
- Cuantización agresiva en expertos: los expertos enrutados se almacenan en IQ2_XXS y Q2_K, lo que puede degradar la calidad de las respuestas en tareas que dependen fuertemente del conocimiento factual almacenado en esos pesos.
- Sin evaluación de calidad: el autor declara que las pruebas de servido no evalúan la calidad del modelo. No hay benchmarks publicados que respalden su rendimiento en tareas estándar.
- Idiomas limitados: solo se declaran inglés y coreano. No se garantiza un rendimiento adecuado en otros idiomas, incluido el español.
- Requisitos de hardware elevados: aunque cabe en un DGX Spark, este equipo tiene un coste elevado (del orden de 10.000 USD). No es accesible para la mayoría de desarrolladores individuales.
- Riesgo de alucinación: como todo modelo de lenguaje grande, puede generar contenido plausible pero incorrecto. La ausencia de evaluación específica incrementa la incertidumbre sobre su fiabilidad en producción.
- Dependencia del servidor ds4-dfm: el despliegue óptimo requiere el uso de este servidor específico, que es un proyecto de código abierto mantenido por una sola persona. La continuidad del soporte no está garantizada.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/Baekpica/Motif-3-Mixed-Quant-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Motif-Technologies/Motif-3
- Conversión GGUF completa en Q8_0 (referencia): https://huggingface.co/Baekpica/Motif-3-GGUF
- Paper técnico de Motif 3 (arXiv): https://arxiv.org/abs/2608.09119
- PDF del paper técnico: https://arxiv.org/pdf/2608.09119
- Servidor ds4 (release v0.5.6.3-dfm): https://github.com/Baekpica/ds4/tree/v0.5.6.3-dfm
- Commit de optimización Spark (593d251): https://github.com/Baekpica/ds4/commit/593d2511a10694f5a33fbafbd997ca24e819a853
- Página de proyectos del autor: https://baekpica.github.io/projects/
