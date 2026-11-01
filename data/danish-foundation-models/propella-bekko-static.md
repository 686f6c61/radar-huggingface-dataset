# danish-foundation-models/propella-bekko-static

## Resumen

Propella-bekko-static es un modelo de anotación de documentos desarrollado por danish-foundation-models que destila las capacidades del anotador propella-1-4b (4.000 millones de parámetros) en una arquitectura estática de solo 206 millones de parámetros. El modelo recibe un documento y devuelve 17 propiedades estructuradas en formato JSON —integridad del contenido, calidad, densidad informativa, sector empresarial, relevancia regional, seguridad, presencia de PII, entre otras— sin necesidad de un prompt específico por tarea. Está pensado para curar corpus a gran escala, donde el coste por documento es determinante.

La arquitectura es radicalmente distinta a la de un transformer generativo: utiliza un backbone de embeddings estáticos (`bekko-static-embedding-v1`) con pooling medio para producir un único vector de documento, sin capas de atención, y sobre él monta una cabeza de clasificación independiente por cada propiedad. Esto le permite anotar 686 documentos por segundo en una sola RTX A6000, dos órdenes de magnitud por encima de los modelos propella-1 generativos (0,06–0,14 docs/s).

Es relevante ahora porque demuestra que la destilación de anotadores LLM hacia modelos estáticos puede conservar una calidad competitiva (macro-F1 de 0,479 frente a anotadores externos) a una fracción del coste computacional, lo que habilita pipelines de curación de datos sobre corpus multilingües de cientos de miles de documentos en minutos en lugar de días.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos con pooling medio (sin capas de atención) + cabezas de clasificación por propiedad |
| Parámetros totales | 206.055.620 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de la cabecera del documento + 512 tokens de la cola |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Multilingüe: da, sv, no, is, fo, nl, de, fi, fr, it, es, pl, cs, hu, ro, pt, en (20 idiomas en entrenamiento) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El backbone es `bekko-static-embedding-v1`: embeddings de tokens estáticos agregados mediante pooling medio en un único vector de documento, sin ninguna capa de atención ni transformer. Sobre ese estado compartido se aplican 17 cabezas independientes, una por propiedad, con softmax para las propiedades de selección única y sigmoid para las de selección múltiple. No existe condicionamiento cruzado entre propiedades: cada una se predice de forma independiente desde el mismo vector de documento. La entrada combina 8.192 tokens de la cabecera del documento con 512 tokens de la cola para no perder el final de documentos largos, y se pasan características de longitud a nivel de documento a las cabezas. Las propiedades ordinales se decodifican al nivel esperado mediante `round(Σ p_i · rank_i)` en lugar de `argmax`, lo que aporta aproximadamente +0,013 de QWK.

El entrenamiento se realizó sobre etiquetas generadas por propella-1-4b a partir de los corpus Dynaword, FineWeb-2 y FinePDFs, cubriendo 20 idiomas y 844.912 documentos. Se usó entropía cruzada para las propiedades de selección única, entropía cruzada binaria para las de selección múltiple y una pérdida F1 a nivel de token para PII. El entrenamiento completo tomó 13 minutos en una Quadro RTX 8000 (3 épocas, 262.144 tokens por lote). Las anotaciones se publican en el dataset `propella-bekko-data` y el código en el repositorio `propella-bekko`.

## Capacidades

- Anotación de documentos en un solo pase hacia adelante, sin generación de texto.
- Predicción de 17 propiedades estructuradas: `content_integrity`, `content_ratio`, `content_length`, `content_type` (18 etiquetas), `business_sector` (37 etiquetas), `technical_content` (7 etiquetas), `content_quality`, `information_density`, `educational_value`, `reasoning_indicators`, `audience_level` (6 niveles), `commercial_bias`, `time_sensitivity`, `content_safety`, `pii_presence` (binaria), `regional_relevance` (14 etiquetas) y `country_relevance` (749 etiquetas).
- Salida en JSON con el mismo esquema y espacio de etiquetas que propella-1.
- Clasificación multilingüe en 20 idiomas, con especial cobertura de lenguas nórdicas y europeas.
- Detección de PII a nivel de token mediante pérdida F1 dedicada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un generador.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Curación de corpus web a gran escala: filtrar millones de documentos de FineWeb-2 o Dynaword por `content_quality`, `information_density` y `content_ratio` antes de entrenar un LLM, a 686 docs/s por GPU, lo que permite procesar un millón de documentos en unos 24 minutos en una sola A6000.
- Construcción de datasets de instrucciones: seleccionar documentos con `educational_value` y `reasoning_indicators` altos para generar pares instrucción-respuesta de mayor calidad.
- Cumplimiento y moderación de contenidos: usar `content_safety` y `pii_presence` como primera capa de filtrado en pipelines de ingesta documental, descartando o marcando documentos antes de un análisis más costoso.
- Enrutamiento y clasificación de documentos empresariales: `business_sector` y `content_type` permiten etiquetar automáticamente documentos para motores de búsqueda internos o sistemas de gestión documental.
- Filtrado geográfico y localización: `regional_relevance` y `country_relevance` (749 países) permiten segmentar corpus por mercado o construir datasets por región para modelos lingüísticos locales.
- Detección de sesgo comercial: `commercial_bias` identifica contenido con influencia comercial, útil para excluir páginas promocionales de corpus de investigación o de entrenamiento.
- Análisis de obsolescencia documental: `time_sensitivity` ayuda a priorizar la revalidación de documentos en bases de conocimiento y sistemas RAG.

## Benchmarks y rendimiento

Evaluación sobre 300 documentos reservados, midiendo el acuerdo (macro-F1 en todas las propiedades) con anotaciones de DeepSeek-V4.1-Flash y GLM-5.3-Flash. El azar (predecir siempre la etiqueta más frecuente) es 0,123.

| Modelo | Parámetros | Docs/s | vs DeepSeek | vs GLM-5.3 |
|---|---|---|---|---|
| propella-bekko-a25m | 123M | 186 | 0,523 | 0,522 |
| propella-bekko-a8m | 106M | 348 | 0,489 | 0,479 |
| **propella-bekko-static** | 206M | 686 | 0,479 | 0,468 |
| propella-1-0.6b | 600M | 0,14 | 0,498 | 0,501 |
| propella-1-1.7b | 1,7B | 0,14 | 0,547 | 0,534 |
| propella-1-4b | 4B | 0,06 | 0,571 | 0,549 |
| GLM-5.3-Flash | — | 0,41 | 0,659 | — |
| DeepSeek-V4.1-Flash | — | 0,34 | — | 0,659 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en precisión completa (206M parámetros en fp32), menos de 0,5 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX A6000 (referencia del autor, 686 docs/s), Quadro RTX 8000 (usada en entrenamiento), cualquier RTX 3090/4090 o superior.
- Cabe en GPU consumer: sí, en todas las GPU modernas con al menos 2 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: el modelo se carga con `transformers` (AutoModel/AutoTokenizer) y `safetensors`; al ser un `EmbeddingBag` + cabezas, no requiere vLLM ni TGI. El código de referencia está en el repositorio `propella-bekko`.
- Throughput: 686 documentos por segundo en una RTX A6000 según el autor. La latencia por documento es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 (vs DeepSeek) | Docs/s | Licencia |
|---|---|---|---|---|---|
| propella-bekko-static | 206M | 8.192 + 512 tokens | 0,479 | 686 | MIT |
| propella-bekko-a25m | 123M | No disponible | 0,523 | 186 | No disponible |
| propella-1-4b | 4B | No disponible | 0,571 | 0,06 | No disponible |
| DeepSeek-V4.1-Flash | No disponible | No disponible | — | 0,34 | No disponible |

La comparativa relevante es interna a la familia propella: bekkos-static sacrifica aproximadamente 0,09 de macro-F1 frente a propella-1-4b pero multiplica el throughput por más de 11.000. Frente a los otros bekkos destilados, static es el más rápido pero el de menor acuerdo, lo que define una frontera de Pareto clara entre calidad y velocidad.

## Limitaciones y advertencias

- El modelo es un clasificador de propiedades, no un generador: no produce texto, resúmenes ni explicaciones.
- La calidad está acotada por la del profesor: se entrenó sobre etiquetas de propella-1-4b, por lo que hereda sus sesgos y errores de anotación.
- El acuerdo con anotadores externos (0,468–0,479) es inferior al de los modelos generativos más grandes; para tareas donde la precisión por propiedad sea crítica, conviene validar contra un subconjunto etiquetado manualmente.
- La ventana de entrada es limitada: 8.192 tokens de cabecera más 512 de cola; el contenido intermedio de documentos muy largos no se procesa.
- Las propiedades se predicen de forma independiente, sin condicionamiento cruzado, lo que puede producir combinaciones de etiquetas incoherentes en casos límite.
- Licencia MIT: permite uso comercial sin restricciones, pero no se especifican garantías ni limitaciones adicionales sobre los datos de entrenamiento subyacentes (Dynaword, FineWeb-2, FinePDFs).
- No se han publicado evaluaciones de sesgo demográfico ni de robustez ante dominios fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danish-foundation-models/propella-bekko-static
- Modelo profesor propella-1-4b: https://huggingface.co/ellamind/propella-1-4b
- Referencia de propiedades: https://huggingface.co/ellamind/propella-1-4b/blob/main/property_descriptions.md
- Backbone bekko-static-embedding-v1: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Dataset de anotaciones: https://huggingface.co/datasets/danish-foundation-models/propella-bekko-data
- Código de entrenamiento: https://github.com/danish-foundation-models/propella-bekko
- Paper Dynaword: https://huggingface.co/papers/2508.02271
- Paper de referencia (arXiv:2311.07264): https://arxiv.org/abs/2311.07264
