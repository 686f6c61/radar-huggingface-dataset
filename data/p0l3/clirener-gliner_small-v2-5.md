# P0L3/CliReNER-gliner_small-v2.5

## Resumen

CliReNER-gliner_small-v2.5 es un modelo de reconocimiento de entidades nombradas (NER) especializado en el dominio de la investigación sobre el cambio climático, desarrollado por P0L3 (Andrija Poleksić y Sanda Martinčić-Ipšić, según la citación de la model card). Se trata de un fine-tuning del modelo base gliner-community/gliner_small-v2.5, un modelo GLiNER de arquitectura bi-encoder y enfoque span-based que permite NER zero-shot guiado por etiquetas en lenguaje natural. El modelo identifica 28 tipos de entidad específicos del dominio climático, desde fenómenos meteorológicos y ecosistemas hasta satélites, políticas o expresiones matemáticas.

El problema que resuelve es la escasez de datos anotados de alta calidad en el dominio del cambio climático: los autores entrenan sobre CliReNER_silver (anotación plateada) y evalúan sobre CliReNER_gold (anotación experta por votación ponderada). El checkpoint publicado corresponde a la semilla con mejor F1 estricto (entity-level exact span y label match) sobre el conjunto gold, con un F1 de 59,15.

Es relevante para investigadores y desarrolladores que necesiten extraer entidades estructuradas de literatura científica climática sin entrenar un NER desde cero, aprovechando la naturaleza guiada por etiquetas de GLiNER para adaptar la tipología sin reentrenar. El modelo es únicamente en inglés, tiene licencia CC-BY-SA 4.0 y un tamaño de repositorio de 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER bi-encoder con objetivo de focal loss (span-based, guiado por etiquetas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | no disponible (repositorio de 0,7 GB, cargable con la librería `gliner`) |

## Arquitectura y entrenamiento

El modelo parte de gliner_small-v2.5, un GLiNER de arquitectura bi-encoder: un encoder de texto y un encoder de etiquetas que proyectan tanto el texto como las etiquetas candidatas a un espacio común, permitiendo la extracción de spans de entidad condicionada a las etiquetas proporcionadas en inferencia. El entrenamiento utiliza un objetivo de focal loss con α=0,75 y γ=2, learning rate de 5e-6 (1e-5 para el encoder), optimizador AdamW, batch size de 8 con acumulación de gradiente de 2, 20 épocas y warmup ratio de 0,1.

El fine-tuning se realizó sobre el 80 % del split de CliReNER_silver, con evaluación sobre CliReNER_gold (consenso experto mediante votación ponderada). Se ejecutaron 5 semillas distintas para evaluar la estabilidad del modelo; el checkpoint publicado corresponde a la semilla 3012 (seed 4), seleccionada por el mayor F1 estricto en gold. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Reconocimiento de entidades nombradas (NER) guiado por etiquetas sobre texto científico en inglés.
- Tipología de 28 clases de entidad: Asset, Body Part, Body of Water, Chemical, Disease, Ecosystem, Energy Source, Field of Study, Geographical Feature, Intellectual Artefact, Location, Mathematical Expression, Measuring Device, Meteorological Phenomenon, Method, Natural Disaster, Natural Phenomenon, Organism, Organization, Other, Person, Physical Artefact, Physical Phenomenon, Policy, Quantity, Satellite, System y Time Period.
- Extracción de spans con puntuación de confianza por entidad (`score`).
- Adaptación de la tipología en inferencia pasando la lista de etiquetas deseadas al método `predict_entities`, sin reentrenamiento.
- Capacidad zero-shot inherente a GLiNER para etiquetas no vistas explícitamente, aunque el rendimiento óptimo se espera sobre las 28 clases entrenadas.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento explícito; es un modelo puramente de token-classification.
- Capacidades multilingües: no, solo inglés.

## Casos de uso

- Extracción de entidades en literatura científica sobre cambio climático: procesar artículos de revistas como *Climatic Change* para poblar bases de datos estructuradas con ecosistemas, fenómenos meteorológicos, políticas y organismos mencionados, aprovechando la tipología de 28 clases adaptada al dominio.
- Construcción de grafos de conocimiento climático: identificar relaciones potenciales entre entidades (por ejemplo, satélites y fenómenos que miden, o políticas y organismos que las emiten) a partir de los spans extraídos con sus etiquetas y scores.
- Anotación asistida (human-in-the-loop): usar las predicciones con score como preanotación para revisores expertos, reduciendo el coste de crear nuevos corpus gold; el F1 de ~59 sugiere que la revisión humana sigue siendo necesaria.
- Monitorización de informes IPCC y documentos institucionales: extraer automáticamente entidades de tipo Policy, Organization, Location y Time Period para resúmenes estructurados de informes extensos.
- Indexación y búsqueda semántica por entidades: enriquecer un motor de búsqueda documental con filtros por entidad (por ejemplo, recuperar documentos que mencionen un Chemical y un Disease concretos) en repositorios de ciencias de la Tierra.
- Análisis de tendencias en publicaciones: agregar menciones de Energy Source, Method o Field of Study a lo largo del tiempo para detectar cambios en la investigación climática.
- Enriquecimiento de datasets de biología y ciencias de la Tierra: al incluir clases como Organism, Ecosystem o Body of Water, puede emplearse en corpus biológicos y geográficos dentro del ámbito climático.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre CliReNER_gold (F1 estricto, entity-level exact span y label match):

| Metrica | Score |
|---|---|
| Precision | 58,86 |
| Recall | 59,44 |
| F1 | 59,15 |

Resultados por semilla (sobre CliReNER_gold):

| Seed | Precision | Recall | Strict F1 |
|---|---|---|---|
| 1 | 58,61 | 58,54 | 58,57 |
| 2 | 58,62 | 59,44 | 59,03 |
| 3 | 57,99 | 58,25 | 58,12 |
| 4 (publicado) | 58,86 | 59,44 | 59,15 |
| 5 | 57,17 | 58,62 | 57,89 |

Resumen: F1 medio = 58,55 (std 0,55); precision media = 58,25 (std 0,68); recall medio = 58,86 (std 0,55). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,7 GB, por lo que en fp32 el modelo debería caber holgadamente en GPUs consumer, aunque el dato exacto de parámetros no se proporciona.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño de repositorio, es plausible su ejecución en GPUs consumer tipo RTX 3060/4090, pero no se confirma en la model card.
- Cabe en consumer GPU: probablemente sí, dado el tamaño del repositorio, aunque no se documenta oficialmente.
- Opciones de despliegue: la librería oficial es `gliner` (`pip install gliner`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| CliReNER-gliner_small-v2.5 | GLiNER fine-tuned (NER dominio climático) | no disponible | no disponible | en | cc-by-sa-4.0 | F1 59,15 en CliReNER_gold |
| gliner-community/gliner_small-v2.5 | GLiNER base (NER zero-shot general) | no disponible | no disponible | en (multi en variantes) | no disponible en la información | no disponible |
| Otros NER específicos de dominio climático | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparativas directas con alternativas de la misma categoría (por ejemplo, otros NER climáticos o modelos GLiNER de mayor tamaño); los datos de rendimiento del modelo base gliner_small-v2.5 no se incluyen en la model card.

## Limitaciones y advertencias

- El modelo solo soporta inglés; textos en otros idiomas no están cubiertos.
- F1 estricto de ~59 sobre el conjunto gold: el rendimiento es moderado y requiere revisión humana en flujos de producción sensibles; no es adecuado para anotación totalmente automática sin validación.
- Riesgo de alucinación de spans: como todo modelo span-based, puede etiquetar fragmentos incorrectos o asignar etiquetas plausibles pero erróneas, especialmente en clases poco representadas.
- Sesgos de dominio: entrenado sobre CliReNER_silver (anotación plateada, posiblemente generada automáticamente) y evaluado sobre gold; puede heredar sesgos de la fuente y de la composición del corpus climático.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia (share-alike); conviene revisar implicaciones si se integra en productos propietarios.
- No se documentan límites de longitud de contexto ni comportamiento en documentos muy largos; el ejemplo de uso opera sobre párrafos cortos.
- El modelo está pensado para las 28 clases de la tipología; el rendimiento con etiquetas fuera de esa lista (zero-shot puro) no está evaluado en la model card.
- Repositorio con solo 4 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/P0L3/CliReNER-gliner_small-v2.5
- Modelo base: https://huggingface.co/gliner-community/gliner_small-v2.5
- Dataset de entrenamiento (silver): https://huggingface.co/datasets/P0L3/CliReNER_v_1_1_28_SILVER
- Dataset de evaluación (gold): https://huggingface.co/datasets/P0L3/CliReNER_v_1_1_28_GOLD
- Repositorio GLiNER: https://github.com/urchade/GLiNER
- Artículo citado: https://doi.org/10.1007/s10584-026-04324-z
