# FDS-Iterations/third-pass-feed-ranker-v12

## Resumen

FDS-Iterations/third-pass-feed-ranker-v12 es un cross-encoder ligero desarrollado por FDS-Iterations para puntuar la relevancia de publicaciones de un feed social empresarial en función del título profesional del espectador y el texto de la publicación. Se trata de un reranker de tercera pasada: recibe una pequeña lista de candidatos (~20 elementos) procedente de pasadas anteriores y vuelve a puntuarlos para sacar a la luz una publicación que sea genuinamente relevante para la profesión del usuario pero que quedó enterrada bajo el primer resultado.

El modelo se basa en microsoft/MiniLM-L12-H384-uncased, un transformer encoder de 12 capas con 33,36 millones de parámetros, y se distribuye bajo licencia Apache 2.0. Está entrenado con un objetivo de ranking listwise, aunque la inferencia es pointwise: recibe un par (título, texto) y devuelve una puntuación de relevancia. La versión v12 incorpora mejoras en el manejo de títulos que no identifican una ocupación (cadenas con identificadores, GUID, códigos) y un objetivo de abstinencia a nivel de lista que minimiza la dispersión de puntuaciones cuando el título no corresponde a ningún rol.

Este modelo es relevante para sistemas de recomendación de contenido profesional en entornos empresariales, donde es necesario filtrar y ordenar publicaciones internas de forma eficiente y barata, ya que su tamaño reducido permite ejecutarlo en CPU de servidor a escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (transformer encoder) |
| Parametros totales | 33.360.385 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (base MiniLM); uso recomendado con truncamiento a 160 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en el transformer encoder microsoft/MiniLM-L12-H384-uncased, con 12 capas y 384 dimensiones ocultas. A diferencia de un bi-encoder, que codifica consulta y documento por separado, el cross-encoder concatena el título y el texto de la publicación y los procesa conjuntamente, lo que permite capturar interacciones finas entre ambos. La salida es una única puntuación logit que indica la relevancia.

El entrenamiento utiliza un objetivo de ranking listwise, optimizando la ordenación de una lista de candidatos más que la puntuación individual de cada par. La inferencia, sin embargo, es pointwise, lo que simplifica el despliegue. La versión v12 introduce un objetivo de abstinencia a nivel de lista para títulos sin rol: cuando el título no identifica una ocupación, el modelo debe generar puntuaciones bajas y planas en todo el feed, de modo que ningún elemento supere el umbral de promoción. Además, se entrenan contraejemplos hard-positive que combinan un título válido con identificadores de directorio (por ejemplo, `L5 Software Engineer — EMEA — Req 40213`) para que el modelo recupere la relevancia incluso en presencia de ruido.

No se dispone de información sobre el dataset de entrenamiento (número de tokens, composición) ni sobre el uso de RLHF o DPO.

## Capacidades

- Puntuación de relevancia profesional: dado un título de trabajo y el texto de una publicación, devuelve una puntuación continua que indica cuán interesante o útil es la publicación para alguien con ese título.
- Reranking de listas: reordena un conjunto de ~20 candidatos, identificando publicaciones que son relevantes pero que quedaron fuera del primer puesto.
- Manejo de títulos sin ocupación: abstiene (puntuaciones bajas y planas) cuando el título es un identificador (GUID, ID de empleado, código de centro de coste, etc.) o una cadena sin significado ocupacional.
- Robustez ante ruido en títulos: tolera títulos con prefijos como nivel, región o código de requisición, manteniendo la relevancia del rol subyacente.
- Capacidad de reemplazo de "incumbent" débil: puede sugerir promocionar una publicación adyacente cuando la actual no es buena, o no cambiar nada si no hay nada promocionable.
- Solo clasificación/regresión: no genera texto, no soporta tool calling, ni razonamiento multi-paso, ni visión ni audio.

## Casos de uso

- Reranking de feeds sociales empresariales: en una plataforma interna tipo Yammer o Slack, el modelo recibe el título del usuario y una lista de publicaciones candidatas, y reordena la lista para mostrar primero las más relevantes para su profesión.
- Recomendación de contenido de aprendizaje: en un portal de formación corporativa, puntúa artículos, vídeos o recursos compartidos por otros empleados para sugerir al usuario aquellos que están alineados con su rol.
- Filtrado de ruido en noticias internas: dado un feed de anuncios y comunicados, el modelo puede suprimir publicaciones que no tienen relación con la ocupación del usuario, reduciendo la sobrecarga de información.
- Priorización de recursos compartidos en equipos de ingeniería: para un desarrollador, el modelo puede destacar publicaciones sobre arquitectura, incidentes o playbooks técnicos, mientras que descarta contenido operativo de otros departamentos.
- Personalización de boletines internos: al generar un resumen diario de publicaciones, el modelo puede seleccionar las 5-10 más relevantes para cada empleado según su cargo.
- Mejora de búsqueda interna: como reranker en una pipeline de búsqueda, el modelo puede reordenar los resultados de búsqueda de publicaciones en función de la relevancia profesional del usuario.
- Detección de contenido "keyword-bait": el modelo puede identificar publicaciones que usan palabras clave populares pero que no aportan valor real para el rol, y posicionarlas más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 33,36 millones de parámetros y pesos en FP32, el modelo ocupa aproximadamente 133 MB. En FP16, unos 67 MB. Cabe en cualquier GPU con más de 1 GB de VRAM, e incluso en CPU sin necesidad de GPU.
- GPU recomendada: ninguna específica; el modelo está pensado para ejecutarse en CPU de servidor a escala. Si se usa GPU, una NVIDIA T4 o superior es más que suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) con margen de sobra.
- Opciones de despliegue: HuggingFace Transformers (con PyTorch), text-embeddings-inference (según los tags del repositorio), y es compatible con endpoints de HuggingFace. También puede exportarse a ONNX o a formatos cuantizados (GGUF) para su uso con llama.cpp, aunque no se proporcionan pesos cuantizados oficialmente.
- Latencia y throughput: no disponible; al ser un modelo tan pequeño, la latencia en CPU es del orden de milisegundos por par, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| third-pass-feed-ranker-v12 | 33,36 M | 512 tokens (base) | Apache 2.0 | HuggingFace |
| third-pass-feed-ranker-v10 | ~33 M | No disponible | Apache 2.0 | HuggingFace |
| microsoft/MiniLM-L12-H384-uncased | 33,36 M | 512 tokens | MIT | HuggingFace |

No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Solo funciona en inglés, y es insensible a mayúsculas/minúsculas (uncased), lo que puede ser una limitación para textos que dependan de mayúsculas para distinguir significados.
- No genera texto; solo produce puntuaciones de relevancia. No puede usarse como modelo de chat o generación.
- Depende de la calidad del título de trabajo: si el título es extremadamente ambiguo o no aparece en la taxonomía de entrenamiento, la puntuación puede no ser fiable.
- El umbral de promoción (tau) es sensible a la distribución de las puntuaciones y debe recalibrarse para cada despliegue.
- Puede heredar sesgos del modelo base MiniLM, que fue entrenado con datos generales de internet; esto puede afectar a la percepción de relevancia para ciertos roles o industrias.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo, pero puede producir falsos positivos en la relevancia.
- Licencia Apache 2.0 permite uso comercial, pero se deben mantener los avisos de licencia.
- No se han publicado resultados de evaluación externa; el rendimiento en producción debe validarse con datos propios.

## Enlaces

- https://huggingface.co/FDS-Iterations/third-pass-feed-ranker-v12
- https://huggingface.co/FDS-Iterations/third-pass-feed-ranker-v10
- https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
