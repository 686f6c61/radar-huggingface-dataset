# Fralet/e5-kz-skills

## Resumen

e5-kz-skills es un modelo bi-encoder de recuperación semántica (sentence-transformers) desarrollado por Fralet, orientado a la normalización de competencias profesionales en el mercado laboral de Kazajistán. Concretamente, mapea frases de competencias tal como las escriben los empleadores en portales como Enbek, hh.kz y hh.ru hacia el vocabulario estandarizado ESCO (European Skills, Competences, Qualifications and Occupations). El problema que resuelve es la enorme variabilidad lingüística y de redacción en las ofertas de empleo, agravada por el contexto multilingüe kazajo (kk), ruso (ru) e inglés (en).

El modelo parte de `intfloat/multilingual-e5-base`, un transformer XLM-RoBERTa con 278.043.648 parámetros, y se afina mediante un bi-encoder con pérdida de ranking de múltiples negativos en caché y minería de negativos duros. El corpus de entrenamiento consta de 28.599 pares, divididos por competencia para evitar fugas entre train y dev. El resultado es una mejora sustancial en recuperación: recall@1 pasa de 0,6787 a 0,8643 y MRR de 0,7396 a 0,9005 sobre el conjunto de desarrollo evaluado contra todas las competencias ESCO.

Es relevante ahora porque aborda un caso de uso muy concreto y poco cubierto: la interoperabilidad entre taxonomías locales y marcos europeos en una economía bilingüe y trilingüe. No es un modelo generativo, sino un encoder de embeddings que se integra en pipelines de matching de empleo, análisis del mercado laboral y sistemas de recomendación de formación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (XLM-RoBERTa base, fine-tuned desde `intfloat/multilingual-e5-base`) |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; e5-base admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de sentence-transformers/ONNX, no documentada por el autor) |
| Idiomas soportados | kk (kazajo), ru (ruso), en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un bi-encoder basado en la arquitectura XLM-RoBERTa del checkpoint `intfloat/multilingual-e5-base`. Cada texto se codifica de forma independiente en un vector denso, lo que permite precalcular los embeddings de las competencias ESCO y realizar búsqueda por similitud coseno en tiempo de consulta. Se aplican los prefijos propios de la familia e5: `query: ` para las frases del empleador y `passage: ` para el par "label. description" de cada competencia ESCO.

El entrenamiento se realizó con una pérdida de ranking de múltiples negativos en caché (cached multiple-negatives ranking loss) y minería de negativos duros, sobre 28.599 pares. La composición del dataset incluye frases de empleadores idénticas a las etiquetas ESCO, coincidencias ESA de alta confianza y etiquetas ESCO en ruso y kazajo. El split se realizó por competencia, no por par, para evitar contaminación entre train y dev. Además del modelo, el autor publica un umbral de no-coincidencia (coseno 0,3468) calibrado sobre dev con precisión 0,8669 y recall 0,8643.

## Capacidades

- Recuperación semántica de competencias: mapea frases libres de empleadores a etiquetas ESCO mediante similitud coseno sobre embeddings.
- Multilingüe en kk, ru y en, lo que cubre las tres lenguas habituales de las ofertas en el mercado kazajo.
- Detección de no-coincidencia: umbral de coseno calibrado para descartar competencias locales sin equivalente ESCO.
- Búsqueda sobre todo el vocabulario ESCO (recall@10 de 0,961), adecuada para recuperar candidatos y reordenarlos con lógica de negocio.
- Prefijos e5 obligatorios (`query: ` / `passage: `) para un uso correcto del espacio de embeddings.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de recuperación.

## Casos de uso

- Normalización de ofertas de empleo: dado el texto libre de una vacante en Enbek, hh.kz o hh.ru, extraer las competencias y mapearlas a ESCO para construir un índice estructurado y comparable entre portales.
- Matching oferta-candidato: codificar las competencias del CV y de la oferta con el mismo encoder y calcular similitud coseno para puntuar la adecuación, usando el umbral de no-coincidencia para filtrar falsos positivos.
- Analítica del mercado laboral: agregar las competencias mapeadas a ESCO para medir demanda por ocupación, sector o región en Kazajistán, con datos homogéneos entre fuentes en kk, ru y en.
- Recomendación de formación: cruzar las competencias demandadas con catálogos formativos etiquetados en ESCO para sugerir cursos que cubran las brechas detectadas.
- Interoperabilidad con marcos europeos: alinear taxonomías locales kazajas con ESCO para informes de movilidad laboral, proyectos de cooperación o estadísticas comparables con la UE.
- Deduplicación de competencias: agrupar variantes de redacción de una misma competencia (en ruso, kazajo o inglés) en una única etiqueta ESCO canónica.
- Enriquecimiento de bases de datos de RR. HH.: pasar un pipeline batch sobre ofertas históricas para asignar etiquetas ESCO y habilitar búsquedas facetadas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de desarrollo, evaluados contra todas las competencias ESCO:

| Encoder | recall@1 | recall@10 | MRR (dev) |
|---|---|---|---|
| Base (`intfloat/multilingual-e5-base`) | 0,6787 | 0,8533 | 0,7396 |
| Fine-tuned (e5-kz-skills) | 0,8643 | 0,9610 | 0,9005 |

Umbral de no-coincidencia (coseno): 0,3468, con precisión 0,8669 y recall 0,8643 en dev. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 1,1 GB de pesos; en FP16, unos 0,55 GB. El coste dominante es el tamaño del lote y la longitud de secuencia, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en FP16 con lotes moderados. Modelos como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema; las GPU de datacenter se justifican solo para indexar grandes volúmenes o servir con alta concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM, e incluso en CPU para volúmenes pequeños.
- Opciones de despliegue: `sentence-transformers`, `transformers` con pooling manual, ONNX Runtime, `text-embeddings-inference` (TGI), FastAPI + `sentence-transformers`, o cualquier vector store (FAISS, Qdrant, pgvector) para la búsqueda por similitud.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 278 M de parámetros, la codificación por lote en GPU es del orden de miles de textos por segundo en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| e5-kz-skills (Fralet) | 278 M | no disponible (base e5: 512) | kk, ru, en | no disponible | Recuperación de competencias ESCO |
| `intfloat/multilingual-e5-base` | 278 M | 512 | multilingüe (incluye kk, ru, en) | MIT | Embeddings multilingües generales |
| `intfloat/multilingual-e5-large` | 560 M | 512 | multilingüe | MIT | Embeddings multilingües generales, mayor calidad |
| `BAAI/bge-m3` | 568 M | 8192 | multilingüe | MIT | Embeddings multilingües, denso + sparse + multi-vector |

La comparativa de rendimiento directa solo está disponible frente a su modelo base: e5-kz-skills mejora el MRR de 0,7396 a 0,9005 en la tarea específica de matching ESCO. Frente a alternativas generalistas como bge-m3 o e5-large, no hay datos publicados de comparación en esta tarea concreta; el modelo especializado debería superarlas en su dominio, pero no hay cifras que lo respalden.

## Limitaciones y advertencias

- Las anclas de desarrollo son etiquetas ESCO y frases de empleadores idénticas a las etiquetas, lo que puede sobreestimar el rendimiento real. El propio autor señala que `gold.csv` (frases kazajas no coincidentes marcadas por expertos) es la estimación honesta.
- ESCO no cubre ciertas nociones locales, como configuraciones de 1С o normativa kazaja; esas competencias deben permanecer sin coincidencia, y forzar un match produce falsos positivos.
- El umbral de no-coincidencia (0,3468) está calibrado sobre dev; en producción conviene recalibrarlo con datos propios.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Modelo exclusivamente de recuperación: no genera texto, no soporta tool calling ni agentes, y no debe usarse para tareas generativas.
- Cobertura limitada a kk, ru y en; otros idiomas del mercado kazajo no están garantizados.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en el matching cuando la similitud coseno supera el umbral sin correspondencia real.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido, sin evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Fralet/e5-kz-skills
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- ESCO (taxonomía de referencia): https://esco.ec.europa.eu/
- Portal Enbek: https://www.enbek.kz/
- Portal hh.kz: https://hh.kz/
- Portal hh.ru: https://hh.ru/
