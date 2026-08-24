# quanfire-ai/embed-eulaw-multi

## Resumen

`quanfire-ai/embed-eulaw-multi` es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo de embeddings multilingües `intfloat/multilingual-e5-small`, desarrollado por Quanfire AI. Su propósito es la recuperación de texto legal de la Unión Europea de forma cross-lingüe: dado un pasaje de legislación en un idioma, recupera el pasaje equivalente en otro de los cinco idiomas soportados (alemán, inglés, español, francés e italiano). No es un modelo de generación de texto ni un reranker, sino un retriever de embeddings de frases.

El adaptador se entrenó con 19 966 pares de provisiones legales alineadas profesionalmente por la propia UE (mismo identificador CELEX y misma posición de artículo en distintos idiomas). En la evaluación aislada por documentos, el adaptador alcanza un recall@1 de 0,6480 frente al 0,2919 del modelo base, lo que supone una mejora del +122 %. La relevancia actual radica en que permite buscar legislación europea multilingüe de forma eficiente sin depender de traducciones automáticas, y su tamaño reducido (589 824 parámetros de adaptador) lo hace viable para entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `intfloat/multilingual-e5-small` (transformer encoder) |
| Parámetros totales | No disponible (el adaptador tiene 589 824 parámetros; el modelo base no se especifica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (usada en entrenamiento y evaluación) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Alemán (de), inglés (en), español (es), francés (fr), italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (se carga mediante la librería `quanfire-multilingual-embedding`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 64, aplicado únicamente a las proyecciones *query* y *value* del modelo base. El entrenamiento se realizó durante una época sobre 19 966 pares de provisiones legales alineadas por la estructura oficial de la UE (mismo CELEX y misma posición de artículo). Los pares no fueron minados ni traducidos automáticamente; se usaron las versiones auténticas de cada idioma publicadas en EUR-Lex. El entrenamiento empleó un learning rate de 1e-4, batch size de 256, mean pooling, dimensiones de embedding de 384, longitud máxima de secuencia de 256 tokens y salidas normalizadas.

El adaptador se evalúa en un split que aísla documentos completos, garantizando que ninguna provision de un documento de entrenamiento comparte documento con una de evaluación. La card de HuggingFace advierte que el árbol de entrenamiento no es reproducible (el archivo fuente no coincide con el que se ejecutó), aunque la evaluación sí es verificable de forma independiente.

## Capacidades

- Recuperación cross-lingual de provisiones de legislación de la UE en cinco idiomas: alemán, inglés, español, francés e italiano.
- Alineación de textos legales equivalentes (misma norma, mismo artículo) mediante embeddings de similitud coseno.
- Soporte de búsqueda por similitud semántica, no por coincidencia exacta de términos.
- No es un modelo de generación de texto, ni de respuesta a preguntas (QA), ni de reranking.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- **Búsqueda de legislación multilingüe**: un abogado que trabaja con documentos de la UE puede buscar la versión en español de un artículo que solo conoce en francés, mediante una consulta en español que recupera el pasaje equivalente.
- **Comparación de versiones lingüísticas**: comparar la redacción de una misma disposición en distintos idiomas para detectar discrepancias o matices interpretativos.
- **Asistencia a despachos que operan en varios países**: firmas con clientes en varios estados miembros pueden indexar documentos legales en un idioma y recuperar los equivalentes en otros automáticamente.
- **Construcción de bases de conocimiento legales**: integrar el adaptador en un sistema de recuperación (RAG) para responder preguntas sobre legislación europea con referencias cruzadas entre idiomas.
- **Verificación de citas legales**: dado un pasaje en un idioma, localizar la misma disposición en otro idioma para citarla correctamente en documentos internacionales.
- **Preparación de datos para procesos de traducción humana**: el adaptador puede pre-alinear pares de texto legal para facilitar el trabajo de traductores jurídicos.

## Benchmarks y rendimiento

La card del modelo reporta resultados de recall@1 sobre un split de evaluación que aísla documentos completos. Se evaluaron 5 509 consultas contra un pool de 5 509 pasajes. La siguiente tabla muestra los resultados:

| Modelo | recall@1 | 95% CI | Hits |
|---|---|---|---|
| Base `intfloat/multilingual-e5-small` | 0,2919 | [0,2800, 0,3040] | 1 608 / 5 509 |
| **+ adaptador `embed-eulaw-multi`** | **0,6480** | [0,6353, 0,6605] | 3 570 / 5 509 |
| Delta | +0,3561 | | +122,0% |

Los intervalos de confianza no se solapan. El rendimiento por idioma tras la adaptación es: alemán 0,6534, inglés 0,6480, español 0,6400, francés 0,6480 e italiano 0,6510. La card advierte que estos resultados son en distribución (se entrenó y evaluó sobre el mismo corpus y tarea), y que no hay evidencia de transferencia a otros dominios legales o idiomas. Además, se retractan dos cifras anteriores (+126,3% y +128,79%) por medir una variable distinta (split que no aislaba documentos completos).

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la información disponible. Dado que el adaptador se carga sobre `intfloat/multilingual-e5-small` (un modelo de embeddings de tamaño pequeño, aunque no se especifica su número de parámetros en la card), se puede inferir que es ligero y ejecutable en CPU. No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni estimaciones de latencia o throughput. La carga se realiza mediante la librería `quanfire-multilingual-embedding`, que ofrece funciones `load_adapter` y `encode_batch`.

## Comparativa con modelos similares

No se han encontrado datos comparativos con otros adaptadores o modelos de embeddings legales multilingües en la información proporcionada. La card no incluye comparaciones con alternativas como `multilingual-e5-large`, `LaBSE` o `Cohere Embed` y no se dispone de benchmarks externos. Por tanto, no se puede ofrecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- **Rendimiento en distribución**: el adaptador se entrenó y evaluó sobre el mismo corpus (EUR-Lex). No se ha medido su transferencia a otros dominios legales, otros tipos de texto o idiomas no incluidos en los cinco soportados. La card advierte que un modelo hermano ganó en distribución pero no transfirió fuera del origen.
- **Un solo entrenamiento**: el resultado reportado proviene de una única ejecución de entrenamiento, con inicialización de la proyección LoRA no completamente determinista. No se ha medido la variabilidad entre ejecuciones.
- **Truncamiento**: la evaluación se realizó con un límite de 256 tokens por pasaje. No se ha medido la frecuencia con la que un pasaje relevante se truncó, lo que podría afectar al recall real.
- **Retracción de cifras**: dos métricas anteriores (+126,3 % y +128,79 %) fueron retiradas por medir una variable distinta (split de textos en lugar de documentos completos). Estas cifras no deben considerarse.
- **No es un modelo de QA ni de reranking**: solo produce embeddings; no genera respuestas ni ordena resultados de forma jerárquica.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base `intfloat/multilingual-e5-small` tiene su propia licencia (MIT, según HuggingFace). El adaptador en sí es Apache-2.0, pero el usuario debe verificar las condiciones del modelo base.

## Enlaces

- [Hugging Face – quanfire-ai/embed-eulaw-multi](https://huggingface.co/quanfire-ai/embed-eulaw-multi)
- [Hugging Face – quanfire-ai/embed-legal-en (modelo hermano)](https://huggingface.co/quanfire-ai/embed-legal-en)
- [Sitio web de Quanfire AI](https://www.quanfire.ai/)
- [GitHub – Quanfire-AI/quanfire-multilingual-embedding](https://github.com/Quanfire-AI/quanfire-multilingual-embedding)
