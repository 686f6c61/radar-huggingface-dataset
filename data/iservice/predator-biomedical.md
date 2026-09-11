# iservice/predator-biomedical

## Resumen

PREDATOR Biomedical es un repositorio publicado en HuggingFace por el usuario iservice bajo el identificador `iservice/predator-biomedical`. Según su model card, no se trata de un modelo de lenguaje con pesos entrenados, sino de un conjunto de datos (dataset) con más de 50.000 abstracts biomédicos curados procedentes de PubMed, EuropePMC y bases de datos de ensayos clínicos. Cada registro incluye identificador DOI o PMID, título o resumen, fuente de origen, clasificación de dominio (biomedical o clinical), una puntuación de valor comercial (0-1), una puntuación de monetización (0-2) y un nivel de calidad (high, medium, low).

El repositorio está etiquetado con el idioma inglés y con las categorías de tarea text-classification, information-extraction y question-answering, lo que lo sitúa como material de entrenamiento o evaluación para pipelines de procesamiento de lenguaje natural en dominio biomédico. La model card declara licencia CC BY 4.0, aunque el campo de licencia del repositorio en HuggingFace figura como no disponible, lo que genera una discrepancia documental.

Su relevancia potencial reside en la combinación de datos de literatura científica con metadatos de calidad y viabilidad comercial, un enfoque poco habitual en datasets biomédicos públicos. Sin embargo, el repositorio no registra descargas ni likes, no publica resultados de benchmarks ni documentación metodológica sobre el proceso de curación, y su model card referencia un endpoint de API con micropagos (protocolo x402 sobre la cadena Base) que no está descrito en detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; no aplicable (el repositorio contiene un dataset, no un modelo con pesos) |
| Parametros totales | no disponible; no aplicable |
| Parametros activos | no disponible; no aplicable |
| Longitud de contexto | no disponible; no aplicable |
| Tipos de cuantizacion | no disponible; no aplicable |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY 4.0 según la model card (uso comercial permitido con atribución); el campo de licencia del repositorio figura como no disponible |
| Formato de pesos | no disponible; los ejemplos de la model card cargan los datos con `pandas.read_csv("data.csv")`, por lo que se sugiere formato CSV |
| Volumen del dataset | 50K+ abstracts biomédicos curados (según la model card) |
| Fuentes de datos | PubMed, EuropePMC, ClinicalTrials.gov |
| Campos por registro | id (DOI/PMID), title, source, domain, commercial_value, monetization_score, quality |
| Categorias de tarea | text-classification, information-extraction, question-answering |
| Descargas y likes | 0 descargas, 0 likes |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, proceso de entrenamiento, dataset de preentrenamiento ni fase de alineación (RLHF, DPO u otras) que describir: el artefacto publicado es un corpus de datos tabulares, no un modelo. La información disponible se limita a la estructura de campos y a las fuentes declaradas (PubMed, EuropePMC y ClinicalTrials.gov).

Tampoco se documentan la metodología de curación, los criterios de deduplicación, el proceso de asignación de las puntuaciones `commercial_value` y `monetization_score`, ni el sistema de clasificación de calidad en tres niveles (high, medium, low). El número exacto de tokens, la distribución por dominio y el solapamiento entre fuentes son datos no disponibles. Cualquier uso como corpus de entrenamiento debería ir precedido de una auditoría propia del contenido.

## Capacidades

Al no ser un modelo, las capacidades deben entenderse como tareas que el dataset permite abordar:

- Clasificación de texto biomédico: etiquetado de abstracts por dominio (biomedical, clinical) y por nivel de calidad.
- Extracción de información: recuperación de identificadores DOI/PMID, títulos y metadatos asociados a publicaciones y ensayos clínicos.
- Question answering sobre literatura biomédica: el corpus puede emplearse como base de conocimiento para sistemas de recuperación aumentada (RAG) en inglés.
- Filtrado por calidad: selección de subconjuntos mediante el campo `quality` para construir conjuntos de entrenamiento o evaluación.
- Puntuación de viabilidad comercial: uso de las columnas `commercial_value` y `monetization_score` como señales de priorización, siempre que se validen de forma independiente.
- Entrenamiento y ajuste fino de clasificadores o modelos pequeños en dominio biomédico.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el corpus está etiquetado únicamente en inglés.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Entrenamiento de clasificadores de dominio biomédico: usar los campos `domain` y `quality` como etiquetas supervisadas para ajustar modelos de clasificación de abstracts, aprovechando el volumen de 50K+ registros para reducir el sobreajuste.
- Construcción de sistemas de question answering con RAG: indexar los títulos y abstracts en un almacén vectorial y recuperar fragmentos relevantes ante consultas clínicas en inglés, citando el DOI/PMID como fuente verificable.
- Vigilancia tecnológica y análisis de tendencias: agrupar los registros por fuente y dominio para detectar áreas de investigación con alta concentración de publicaciones, usando el campo `source` para separar literatura revisada por pares de registros de ensayos clínicos.
- Priorización de carteras de I+D: emplear `commercial_value` y `monetization_score` como señal inicial para ordenar candidatos, siempre que se auditen previamente los criterios con los que se asignaron esas puntuaciones.
- Curaduría de revisiones sistemáticas: filtrar entradas con `quality == "high"` para construir listas de candidatos a revisión, partiendo de los identificadores DOI/PMID para localizar el texto completo.
- Evaluación de modelos biomédicos: utilizar el corpus como conjunto de prueba para medir la calidad de extracción de entidades o de clasificación de dominios en modelos de terceros, estableciendo una línea base reproducible.
- Aumento de datos para dominios con pocos ejemplos: generar variantes o subconjuntos por subdominio clínico a partir de la clasificación existente, útil cuando se dispone de pocos abstracts etiquetados propios.
- Integración mediante API de pago por consulta: consumir el endpoint x402 descrito en la model card para recuperar registros bajo demanda, con un coste declarado de 0,02 USDC por consulta en la cadena Base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de calidad del dataset, tasas de error de las clasificaciones, ni comparaciones con corpus equivalentes.

## Requisitos de hardware

- Almacenamiento: la model card no especifica el tamaño del fichero. Con 50.000 registros compuestos por identificador, título y metadatos, el volumen es previsiblemente reducido (del orden de decenas de megabytes en CSV), aunque se trata de una estimación, no de un dato publicado.
- GPU para uso del dataset: no se requiere GPU para almacenar o consultar el corpus.
- GPU para tareas derivadas: el consumo depende por completo del modelo que se entrene o ejecute sobre los datos. Para ajuste fino de modelos de la familia BERT en clasificación, una GPU consumer de gama alta (por ejemplo, RTX 4090 con 24 GB de VRAM) resulta suficiente; para modelos de mayor tamaño o para indexación vectorial a gran escala, se recomiendan A100 o H100.
- Cabe en GPU consumer: sí, para las tareas de clasificación y extracción habituales derivadas del corpus; no aplicable al dataset en sí.
- Opciones de despliegue: no disponibles para el dataset. Las herramientas aplicables serían las del modelo que se construya encima (vLLM, llama.cpp u Ollama para modelos generativos; scikit-learn o PyTorch para clasificadores). La única vía de acceso declarada por el autor es la API con micropagos x402.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados por el autor. Existen corpus biomédicos de referencia en abierto (PubMedQA, CORD-19, BioASQ) que cubren tareas parcialmente solapadas, pero la información proporcionada no permite establecer una comparación cuantitativa con ellos.

| Conjunto de datos | Dominio | Tareas declaradas | Licencia | Datos comparativos |
|---|---|---|---|---|
| PREDATOR Biomedical | Biomédico, ensayos clínicos | Clasificación, extracción de información, QA | CC BY 4.0 según model card | Sin benchmarks publicados |
| PubMedQA | Biomédico | QA sobre abstracts | no disponible | no disponible |
| CORD-19 | Biomédico (COVID-19) | QA, recuperación | no disponible | no disponible |
| BioASQ | Biomédico | QA, recuperación, clasificación | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto ni responde a instrucciones por sí mismo; solo puede usarse como corpus para entrenar o evaluar otros sistemas.
- Idioma: el contenido está etiquetado exclusivamente en inglés, lo que limita su uso directo en aplicaciones en castellano.
- Ausencia de validación externa: el repositorio acumula 0 descargas y 0 likes, sin evidencia de revisión por parte de la comunidad.
- Discrepancia de licencia: la model card declara CC BY 4.0 (uso comercial permitido con atribución), pero el campo de licencia del repositorio en HuggingFace aparece como no disponible. Conviene confirmar la licencia aplicable antes de un uso comercial.
- Metadatos sin documentar: no se explican los criterios de `commercial_value`, `monetization_score` ni la asignación de niveles de calidad, por lo que esas columnas no deberían usarse como señal fiable sin auditoría.
- Sesgos potenciales: los datos heredan los sesgos de cobertura de PubMed, EuropePMC y ClinicalTrials.gov, con infrarrepresentación previsible de determinadas regiones geográficas, idiomas y áreas terapéuticas.
- Riesgo de alucinación: no aplica al dataset, pero cualquier modelo generativo entrenado o aumentado con él puede producir citas o afirmaciones clínicas incorrectas; se requiere verificación contra el DOI/PMID original.
- Trazabilidad: no se documentan deduplicación, filtrado de textos retractados ni control de calidad de los abstracts incluidos.
- Dependencia de infraestructura de terceros: el endpoint x402 apunta a un dominio de ngrok, una solución de túnel temporal que no ofrece garantías de disponibilidad ni de nivel de servicio.
- Fecha de los metadatos: el repositorio figura como creado y actualizado el 11 de septiembre de 2026, una fecha que no coincide con el momento de la consulta y que puede indicar un error en el registro.
- Uso clínico: el corpus no constituye una fuente válida para decisiones médicas directas ni sustituye a guías clínicas revisadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/iservice/predator-biomedical
- Endpoint de API con micropagos x402 (según la model card): POST https://most-daylight-fraying.ngrok-free.dev/x402/biomed/query
- Contacto declarado: iservice49800@gmail.com
- Identificador del autor en x402 Arena: `predator-biomed-papers`
- Búsqueda web realizada: no se recuperaron enlaces relevantes (papers, blogs o repositorios) asociados al modelo; los resultados obtenidos corresponden a páginas genéricas de Google (google.ie, translate.google.ie, earth.google.ie, books.google.ie, m.google.ie) sin relación con el repositorio.
