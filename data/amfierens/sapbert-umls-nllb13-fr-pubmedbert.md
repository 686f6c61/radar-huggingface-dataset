# amfierens/sapbert-umls-nllb13-fr-pubmedbert

## Resumen

SapBERT-UMLS French (NLLB-1.3B translation, PubMedBERT) es un bi-encoder de tipo SapBERT especializado en enlazado de entidades médicas (medical entity linking) y normalización de conceptos en francés. Lo desarrolla Amaury Fierens y colaboradores (Universidad Católica de Lovaina, según los enlaces del repositorio), y se presenta en el artículo *Offline Metathesaurus Translation for Cross-Lingual Medical Entity Linking* (ECML PKDD 2026). El modelo resuelve el problema de mapear menciones libres en textos clínicos franceses a conceptos normalizados de terminologías como UMLS y SNOMED CT.

Técnicamente es un transformer BERT-base (PubMedBERT) de 109.482.240 parámetros, con capacidad de contexto de 512 tokens (límite estándar de la arquitectura BERT; el autor recomienda truncar a 25 tokens para el embedding de menciones y nombres de concepto). No genera texto: produce embeddings de 768 dimensiones pensados para búsqueda por vecino más cercano. Su relevancia radica en que se entrena sin corpus anotado en francés: los términos ingleses de UMLS 2023AA se traducen offline con NLLB-200 1.3B y se alinean mediante el objetivo de autoalineamiento de SapBERT.

El modelo es la mejor configuración francesa del artículo (Tabla 2) y alcanza un F1@1 medio de 0,681 y un R@100 de 0,947 sobre los benchmarks franceses evaluados (DisTEMIST-FR, MANTRA-FR y QUAERO). Es un componente de infraestructura para pipelines de normalización clínica, no un modelo conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder tipo BERT (PubMedBERT base), fine-tuning SapBERT |
| Parámetros totales | 109.482.240 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite BERT); el autor recomienda `max_length=25` para el embedding |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | francés (`fr`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión del embedding | 768 (vector `[CLS]` L2-normalizado) |
| Modelo base | microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext |
| Pipeline | feature-extraction |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un BERT-base entrenado sobre literatura biomédica, y se fine-tunea con el objetivo de autoalineamiento de SapBERT: una pérdida contrastiva con minería de negativos duros que acerca las representaciones de menciones y de nombres de concepto que comparten el mismo CUI (Concept Unique Identifier). La salida es el embedding `[CLS]` de la última capa, L2-normalizado, con el texto en minúsculas. El enlazado se resuelve como una búsqueda del vecino más cercano entre la mención y los nombres codificados de la terminología objetivo, sin reranker.

Los datos de entrenamiento se construyen traduciendo offline al francés los términos ingleses de UMLS 2023AA (9.710.796 entradas MRCONSO no suprimidas, 4.495.569 CUIs) mediante NLLB-200 1.3B. Los términos traducidos que comparten CUI forman pares positivos; las cadenas se pasan a minúsculas y se deduplican. No se emplea ningún corpus anotado en francés para el entrenamiento: las menciones de los benchmarks se usan exclusivamente para evaluación. Se conserva el último checkpoint del fine-tuning.

## Capacidades

- Generación de embeddings de texto biomédico en francés para similitud semántica y recuperación.
- Enlazado de entidades médicas (medical entity linking): mapeo de menciones a conceptos de UMLS/SNOMED CT.
- Normalización de conceptos clínicos mediante búsqueda por vecino más cercano (FAISS HNSW en la evaluación del artículo).
- Búsqueda semántica sobre terminologías médicas codificadas (descripciones en francés con fallback al inglés).
- Representación de menciones y de nombres de concepto en el mismo espacio vectorial (bi-encoder simétrico).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad monolingüe: solo francés; no se documenta transferencia a otros idiomas.

## Casos de uso

- Normalización de informes clínicos en francés: extraer menciones de entidades (enfermedades, fármacos, procedimientos) y mapearlas a códigos SNOMED CT o UMLS mediante búsqueda vectorial, lo que permite codificación estructurada de historiales.
- Anonimización y estructuración de datos de salud: la normalización a conceptos estables facilita la agregación de cohortes y la explotación analítica de textos libres en francés.
- Indexación semántica de literatura biomédica francófona: generar embeddings de abstracts o secciones y permitir búsquedas por concepto clínico en lugar de por coincidencia léxica.
- Deduplicación de catálogos de terminología: alinear descripciones y sinónimos de distintos vocabularios (por ejemplo, EMEA frente a Medline) usando la similitud de embeddings.
- Enriquecimiento de bases de datos farmacológicas: vincular nombres comerciales y principios activos con sus conceptos UMLS para integrar fuentes heterogéneas.
- Componente de preprocesado en pipelines de NLP clínico: servir como primer paso de recuperación (candidatos top-k) antes de un reranker o de una revisión humana, dado su R@100 de 0,947 en los benchmarks del artículo.
- Construcción de sistemas de pregunta-respuesta sobre guías clínicas: recuperar conceptos y fragmentos relevantes a partir de una consulta en francés antes de pasarlos a un modelo generativo.

## Benchmarks y rendimiento

Resultados reportados en el artículo, evaluados contra la extensión estadounidense de SNOMED CT (vía UMLS 2023AA), con índice FAISS HNSW y recuperación sin reranker:

| Benchmark | Métrica | Puntuación |
|---|---|---|
| DisTEMIST-FR | F1@1 | 0,626 |
| MANTRA-FR EMEA | F1@1 | 0,662 |
| MANTRA-FR Medline | F1@1 | 0,690 |
| MANTRA-FR Patents | F1@1 | 0,772 |
| QUAERO EMEA | F1@1 | 0,721 |
| QUAERO Medline | F1@1 | 0,698 |
| Media (benchmarks franceses) | F1@1 | 0,681 |
| Media (benchmarks franceses) | R@100 | 0,947 |
| Media (benchmarks franceses) | MGD@100 | 7,031 |

MGD@100 es la distancia mediana en el grafo de SNOMED CT de los 100 candidatos principales respecto al gold (menor es mejor). No se dispone en la información proporcionada de comparaciones numéricas con otros modelos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB de pesos (109 M de parámetros); en fp16 unos 0,22 GB. Con overhead de activaciones y tokenizador, el consumo total es inferior a 1-2 GB para lotes pequeños.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU recomendadas para indexación a gran escala (millones de conceptos UMLS): A100, H100 o L4 para generar embeddings en lote; para servir consultas en tiempo real basta una GPU de gama media.
- Opciones de despliegue: transformers (uso documentado por el autor), Text Embeddings Inference (el repo incluye la etiqueta `text-embeddings-inference`), y servidores de embeddings compatibles con endpoints. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El coste dominante en producción será la construcción y consulta del índice vectorial (FAISS HNSW en la evaluación), no la inferencia del encoder.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| amfierens/sapbert-umls-nllb13-fr-pubmedbert | 109 M | 512 | fr | MIT | Bi-encoder SapBERT para enlazado médico en francés; F1@1 medio 0,681 |
| Otros checkpoints del mismo artículo (3 idiomas, 5 traductores, 3 backbones) | ~109 M (backbones BERT) | 512 | varios | MIT (según el artículo) | Disponibles en doi:10.14428/DVN/MHYOVM; comparación numérica no incluida en la información |
| SapBERT original (cambridgeltl/SapBERT-from-PubMedBERT-fulltext) | ~110 M | 512 | en | no disponible en esta información | Referencia canónica del objetivo de autoalineamiento; sin datos comparativos en esta ficha |
| PubMedBERT base (modelo base) | 109 M | 512 | en | MIT | Backbone sin fine-tuning SapBERT; no especializado en enlazado |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que no se incluye comparación numérica.

## Limitaciones y advertencias

- Modelo monolingüe francés: no está diseñado ni evaluado para otros idiomas.
- No es un modelo generativo: no produce texto, solo embeddings; no debe usarse para respuesta a preguntas ni resumen.
- Dependencia de la calidad de la traducción automática: los datos de entrenamiento provienen de NLLB-200 1.3B, por lo que errores de traducción pueden propagarse a las representaciones.
- Sin entrenamiento con corpus anotado en francés: el rendimiento en dominios muy alejados de la terminología UMLS (jerga clínica local, abreviaturas) puede degradarse; el F1@1 medio de 0,681 deja margen de error relevante para uso clínico directo.
- Riesgo de falsos positivos en la búsqueda por vecino más cercano: se recomienda revisión humana o un reranker en aplicaciones clínicas críticas.
- Sesgos: no documentados por el autor; al derivar de UMLS y PubMedBERT, hereda los sesgos de cobertura de dichas fuentes (por ejemplo, infrarrepresentación de terminología regional o de especialidades poco cubiertas).
- Restricciones de licencia: MIT, lo que permite uso comercial; el modelo base PubMedBERT también es MIT según el autor. No obstante, el uso de UMLS puede estar sujeto a las condiciones de la licencia de UMLS, que no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: modelo muy reciente y sin validación comunitaria independiente.
- La truncación a 25 tokens recomendada por el autor implica que menciones o nombres de concepto más largos se truncan, con posible pérdida de información.

## Enlaces

- Hugging Face: https://huggingface.co/amfierens/sapbert-umls-nllb13-fr-pubmedbert
- Artículo (DOI): https://doi.org/10.1007/978-3-032-37682-4_34
- Checkpoints y datos traducidos (DOI): https://doi.org/10.14428/DVN/MHYOVM
- Código: https://forge.uclouvain.be/AmauryFierens/cross-lingual-medical-entity-linking
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
