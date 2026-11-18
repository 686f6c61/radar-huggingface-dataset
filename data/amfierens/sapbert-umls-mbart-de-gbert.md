# amfierens/sapbert-umls-mbart-de-gbert

## Resumen

SapBERT-UMLS German (mBART translation, GBERT) es un bi-encoder especializado en *entity linking* y normalización de entidades médicas en alemán. Lo desarrolla Amaury Fierens (Universidad Católica de Lovaina, UCLouvain), en el marco del artículo *Offline Metathesaurus Translation for Cross-Lingual Medical Entity Linking* presentado en ECML PKDD 2026. El modelo resuelve un problema concreto: enlazar menciones de texto clínico alemán con conceptos estandarizados de SNOMED CT a través de UMLS, sin necesidad de un corpus alemán anotado para el entrenamiento.

La propuesta es una adaptación de la metodología SapBERT (self-alignment pretraining) a un escenario cross-lingüe: se parte de los términos ingleses de UMLS 2023AA (9.710.796 entradas MRCONSO no suprimidas, 4.495.569 CUIs), se traducen offline al alemán con mBART-large-50 y se afina el backbone alemán `deepset/gbert-base` con pérdida contrastiva y minería de negativos duros. El resultado es un encoder de 109,9 millones de parámetros, con contexto de 512 tokens (aunque el uso previsto trunca a 25), licencia MIT y pesos en safetensors.

Su relevancia radica en que demuestra que la traducción automática offline del metatesauro permite construir sistemas de normalización médica multilingües sin anotación humana en el idioma objetivo. Es la mejor configuración alemana del artículo (Tabla 2) y se publica junto al resto de checkpoints (3 idiomas, 5 modelos de traducción, 3 backbones) y los datos de entrenamiento traducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), bi-encoder con pooling `[CLS]` y normalización L2 |
| Parametros totales | 109.927.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (posición máxima del backbone GBERT); el uso recomendado trunca a 25 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32) |
| Idiomas soportados | Alemán (`de`); entrenado sobre términos UMLS traducidos del inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (también compatible con `transformers`; repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT estándar (`deepset/gbert-base`, 109,9 M de parámetros) reutilizado como bi-encoder. Cada mención o nombre de concepto se codifica de forma idéntica: se pasa a minúsculas, se tokeniza con truncamiento a 25 tokens, se extrae el embedding `[CLS]` de la última capa oculta y se normaliza L2. El enlace se resuelve por búsqueda del vecino más cercano contra los nombres codificados de la terminología objetivo, sin reranker.

El entrenamiento sigue el objetivo de autoalineación de SapBERT: los términos ingleses de UMLS 2023AA se traducen offline al alemán con mBART-large-50; los términos traducidos que comparten CUI forman pares positivos; las cadenas se pasan a minúsculas y se deduplican; y el backbone se afina con pérdida contrastiva y minería de negativos duros, conservando el último checkpoint. No se emplea ningún corpus alemán anotado: las menciones de los benchmarks se usan exclusivamente para evaluación. La innovación principal es, por tanto, metodológica: sustituir la anotación en el idioma objetivo por traducción automática offline del metatesauro, manteniendo la estructura de pares positivos por CUI.

## Capacidades

- Generación de embeddings de menciones y nombres de conceptos médicos en alemán para *entity linking* y normalización.
- Búsqueda por similitud coseno (producto escalar tras normalización L2) contra un índice de conceptos, típicamente FAISS HNSW.
- Normalización hacia terminologías estandarizadas: SNOMED CT (a través de UMLS 2023AA) y, por extensión, cualquier vocabulario cuyos nombres se codifiquen con el mismo modelo.
- Manejo de sinónimos y variantes léxicas gracias al objetivo contrastivo de SapBERT (por ejemplo, «zuckerkrankheit» frente a «diabetes mellitus»).
- Capacidad multilingüe limitada al alemán; no cubre otros idiomas pese a que el pipeline del artículo sí los aborda con otros checkpoints.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni *thinking mode*: es un modelo de extracción de características, no un modelo generativo.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Normalización de entidades clínicas en historiales electrónicos: extraer menciones de diagnósticos, fármacos o procedimientos en notas clínicas alemanas y mapearlas a códigos SNOMED CT mediante búsqueda del vecino más cercano sobre el índice de conceptos. Adecuado por su entrenamiento específico en terminología médica alemana y su bajo coste de inferencia (encoder de 110 M).
- Codificación automática para facturación y estadística sanitaria: convertir texto libre en códigos estandarizados para informes y reembolsos, usando el modelo como etapa de *linking* tras un reconocedor de entidades.
- Enriquecimiento de bases de datos de farmacovigilancia: normalizar reacciones adversas descritas en alemán a conceptos UMLS para agregación y análisis de señales.
- Construcción de índices de búsqueda semántica sobre catálogos de conceptos médicos: codificar los nombres de la terminología una vez y resolver consultas en línea con FAISS HNSW, como en la evaluación del artículo.
- Anonimización y desidentificación asistida: detectar y sustituir menciones de conceptos clínicos por sus identificadores normalizados en textos alemanes antes de su compartición.
- Investigación en *entity linking* cross-lingüe: servir como baseline alemán reproducible (licencia MIT, pesos abiertos) para comparar estrategias de traducción del metatesauro, tal como se plantea en el artículo.
- Integración en pipelines de procesamiento documental hospitalario: al ser un encoder pequeño, puede desplegarse en CPU o GPU de gama baja para normalizar grandes volúmenes de informes sin depender de APIs externas.

## Benchmarks y rendimiento

Evaluación frente a la extensión estadounidense de SNOMED CT (vía UMLS 2023AA), con conceptos activos y sus descripciones (descripciones en el idioma objetivo primero, inglés como respaldo), índice FAISS HNSW y solo recuperación (sin reranker).

| Benchmark | Métrica | Resultado |
|---|---|---|
| MANTRA-DE EMEA | F1@1 | 0,641 |
| MANTRA-DE Medline | F1@1 | 0,729 |
| MANTRA-DE Patents | F1@1 | 0,749 |
| XL-BEL (de) | P@1 | 0,357 |
| Media en benchmarks alemanes | F1@1 | 0,532 |
| Media en benchmarks alemanes | R@100 | 0,761 |
| Media en benchmarks alemanes | MGD@100 | 7,650 |

MGD@100 es la mediana de la distancia en el grafo de SNOMED CT de los 100 mejores candidatos respecto al *gold* (menor es mejor). No se han publicado en la información disponible resultados comparativos directos con otros modelos en esta misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (109,9 M de parámetros); menos de 0,3 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para el modelo, pero útiles si se indexan millones de conceptos con FAISS en GPU.
- Cabe holgadamente en GPU de consumo e incluso en CPU; el cuello de botella habitual será el índice FAISS, no el encoder.
- Opciones de despliegue: `transformers` (uso nativo mostrado en la model card), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`) y exportación a ONNX para producción. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada. Con lotes pequeños y truncamiento a 25 tokens, el coste por mención es bajo en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| amfierens/sapbert-umls-mbart-de-gbert | 109,9 M | 512 (uso a 25) | Alemán | MIT | SapBERT sobre GBERT con UMLS traducido con mBART |
| SapBERT original (cambridgeltl/SapBERT-from-PubMedBERT-fulltext) | ~110 M | 512 | Inglés | MIT (según modelo base) | SapBERT sobre PubMedBERT con UMLS inglés |
| deepset/gbert-base | 109,9 M | 512 | Alemán | MIT | BERT alemán de propósito general, sin ajuste médico |
| Otros checkpoints del artículo (3 idiomas, 5 traductores, 3 backbones) | variable | 512 | varios | MIT (según backbone) | Misma metodología con distintas combinaciones |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada, por lo que no se ofrece una comparación numérica de rendimiento.

## Limitaciones y advertencias

- Solo cubre alemán; no debe usarse para otros idiomas sin recurrir a los demás checkpoints del artículo.
- El truncamiento a 25 tokens limita la codificación de nombres de concepto largos; menciones más extensas pueden perder información.
- El enlace se resuelve solo por recuperación (sin reranker), lo que puede degradar la precisión en terminologías densas o con conceptos muy próximos; XL-BEL (de) obtiene P@1 = 0,357, notablemente inferior a los benchmarks MANTRA-DE.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en el *linking*: el vecino más cercano siempre devuelve un candidato, aunque la mención no corresponda a ningún concepto.
- Sesgos potenciales heredados de UMLS y de la traducción automática con mBART-large-50: errores de traducción, cobertura desigual entre especialidades y posible infrarrepresentación de terminología regional o coloquial alemana.
- La licencia MIT del checkpoint se apoya en la licencia MIT de `deepset/gbert-base`; el uso de UMLS y SNOMED CT está sujeto a sus propias condiciones de licencia, que deben verificarse por separado para uso comercial.
- Modelo con muy poca adopción (4 descargas, 0 likes en el momento de la consulta) y sin señales de validación externa; conviene evaluarlo en el dominio concreto antes de llevarlo a producción.
- No es un modelo generativo: no debe esperarse resumen, respuesta a preguntas ni razonamiento a partir de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amfierens/sapbert-umls-mbart-de-gbert
- Artículo (DOI): https://doi.org/10.1007/978-3-032-37682-4_34
- Checkpoints y datos traducidos (DOI Dataverse): https://doi.org/10.14428/DVN/MHYOVM
- Código del proyecto: https://forge.uclouvain.be/AmauryFierens/cross-lingual-medical-entity-linking
- Modelo base: https://huggingface.co/deepset/gbert-base
