# HowML/BiomedBERT-ner-medmentions-fine-tuned

## Resumen

HowML/BiomedBERT-ner-medmentions-fine-tuned es un modelo de reconocimiento de entidades nombradas (NER) para texto biomédico en inglés, publicado por el usuario HowML en HuggingFace. Se trata de un ajuste fino del backbone `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract` sobre el corpus MedMentions, y su salida no es texto libre sino etiquetas BIO sobre tokens: detecta menciones y las clasifica en nueve tipos semánticos UMLS, todos ellos descendientes de Biologic Function (T038), desde funciones fisiológicas hasta enfermedades y disfunciones moleculares.

El modelo resuelve un problema muy concreto de la minería de literatura biomédica: la extracción estructurada de menciones de entidades fisiológicas y patológicas a partir de resúmenes científicos, un paso previo habitual en pipelines de enlazado a ontologías (entity linking con UMLS/MeSH), construcción de grafos de conocimiento y curación manual asistida. Al ser un encoder BERT base de 108,9 millones de parámetros, es ligero, desplegable en CPU y adecuado para procesar grandes volúmenes de documentos por lotes.

Es relevante ahora por su perfil de licencia permisiva (MIT), su tamaño reducido frente a los LLM genéricos y su especialización en un subconjunto semántico poco cubierto por los NER biomédicos habituales. Ahora bien, conviene calibrar expectativas: el F1 micro estricto a nivel de entidad es 0,63 y el macro 0,48, con clases claramente débiles como `PHYSIOL_FUNC` (F1 0,22). El repositorio no registra descargas ni likes y no se han publicado hiperparámetros de entrenamiento, por lo que debe tratarse como un modelo de investigación o de pre-anotación, no como un componente listo para producción sin validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder-only, uncased), con cabeza de clasificación de tokens |
| Parametros totales | 108.906.259 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el backbone es un BERT base (ventana de 512 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (0,4 GB, coherente con precisión completa fp32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only de tipo BERT en su variante base (12 capas, atención completa bidireccional; 108,9 M de parámetros contando la cabeza de clasificación) que parte de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, un checkpoint preentrenado sobre resúmenes de PubMed. Sobre ese backbone se añade una cabeza de token classification y se ajusta de forma supervisada en la tarea de NER, con un esquema de etiquetas BIO derivado de los tipos semánticos UMLS hijos de Biologic Function (T038): `PHYSIOL_FUNC` (T039), `ORGANISM_FUNC` (T040), `ORGAN_TISSUE_FUNC` (T042), `CELL_FUNC` (T043), `MOL_FUNC` (T044), `PATHOL_FUNC` (T046), `DISEASE_SYNDROME` (T047), `CELL_MOLECULE_DYSFUNC` (T049) y `EXP_DISEASE_MODEL` (T050).

El ajuste se realizó sobre el corpus MedMentions (dataset `bigbio/medmentions`), un conjunto de anotación manual de menciones UMLS en literatura biomédica. La model card no documenta el número de tokens de entrenamiento, la composición exacta de las particiones, la tasa de aprendizaje, el número de épocas ni si hubo búsqueda de hiperparámetros; tampoco aplica técnicas de alineación tipo RLHF/DPO, impropias de un encoder discriminativo. No se describen innovaciones arquitectónicas (atención lineal, decodificación especulativa, MoE o híbridos SSM): es un ajuste fino estándar de BERT. El único detalle de uso relevante es el postprocesado: con `aggregation_strategy="simple"` en el pipeline de Transformers se fusionan los subtokens en menciones completas.

## Capacidades

- Reconocimiento de entidades nombradas en texto biomédico en inglés con fronteras de mención a nivel de token.
- Clasificación de cada mención en una de nueve categorías UMLS bajo Biologic Function: funciones fisiológicas, de organismo, de órgano o tejido, celulares y moleculares, funciones patológicas, enfermedades o síndromes, disfunción celular o molecular y modelos experimentales de enfermedad.
- Extracción a nivel de span con etiquetado BIO, con soporte de agregación de subtokens.
- Procesamiento por lotes de grandes volúmenes de resúmenes científicos, con coste computacional bajo.
- Integración directa en el ecosistema Transformers (`pipeline("token-classification")`) y exportación a ONNX.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo de pensamiento: es un modelo discriminativo de etiquetado.
- Capacidad multilingüe: no. Solo inglés; el texto en otros idiomas debe traducirse antes o usar otro modelo.

## Casos de uso

- Pre-anotación para curación manual: procesar lotes de resúmenes de PubMed y volcar las menciones detectadas en herramientas como INCEpTION, brat o Prodigy, de modo que los anotadores solo corrijan y validen en lugar de etiquetar desde cero. Es adecuado porque el coste por documento es mínimo y la licencia MIT permite integrarlo en herramientas internas.
- Enlazado a UMLS/MeSH: usar las menciones y su tipo semántico como entrada de un componente de entity linking (por ejemplo, SapBERT o scispaCy) para normalizar conceptos. La clasificación en nueve tipos acota el espacio de candidatos del enlazador.
- Construcción de grafos de conocimiento biomédicos: extraer enfermedades y funciones moleculares de resúmenes para poblar relaciones gen-enfermedad o fármaco-diana, aprovechando la categoría `DISEASE_SYNDROME`, que es la mejor medida del modelo (F1 0,76, 3.731 menciones de soporte).
- Filtrado y triaje de literatura para revisiones sistemáticas: detectar automáticamente resúmenes que mencionan disfunciones celulares o modelos experimentales de enfermedad para priorizar la lectura manual, con revisión humana obligatoria por el riesgo de falsos positivos.
- Farmacovigilancia y seguimiento de efectos patológicos: localizar menciones de `PATHOL_FUNC` y `DISEASE_SYNDROME` en abstracts para generar alertas tempranas sobre asociaciones adversas, siempre como señal preliminar y no como evidencia.
- Indexación y búsqueda semántica de un corpus documental: enriquecer un motor de búsqueda con campos de entidad por tipo semántico, permitiendo consultas del estilo "documentos que mencionan funciones moleculares relacionadas con X".
- Docencia y prototipado rápido: ejemplo completo y ligero de pipeline NER biomédico en un curso de NLP clínico, ejecutable en CPU sin infraestructura GPU.
- Análisis de patentes y documentación técnica del sector biotech en inglés: extracción de menciones de enfermedades y funciones celulares para estudios de paisaje tecnológico.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test, a nivel de entidad estricto con seqeval (una predicción es correcta solo si coinciden frontera y tipo):

| Tipo de entidad | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| `CELL_FUNC` | 0,49 | 0,60 | 0,54 | 506 |
| `CELL_MOLECULE_DYSFUNC` | 0,52 | 0,52 | 0,52 | 105 |
| `DISEASE_SYNDROME` | 0,75 | 0,78 | 0,76 | 3.731 |
| `EXP_DISEASE_MODEL` | 0,29 | 0,36 | 0,32 | 45 |
| `MOL_FUNC` | 0,59 | 0,64 | 0,61 | 1.463 |
| `ORGANISM_FUNC` | 0,49 | 0,46 | 0,48 | 1.343 |
| `ORGAN_TISSUE_FUNC` | 0,42 | 0,32 | 0,37 | 296 |
| `PATHOL_FUNC` | 0,53 | 0,54 | 0,54 | 689 |
| `PHYSIOL_FUNC` | 0,30 | 0,17 | 0,22 | 208 |
| **Micro avg** | **0,62** | **0,64** | **0,63** | **8.386** |
| Macro avg | 0,49 | 0,49 | 0,48 | 8.386 |
| Weighted avg | 0,62 | 0,64 | 0,63 | 8.386 |

Desglose por modo de evaluación para las dos clases con más soporte:

| Clase | Modo | Precision | Recall | F1 |
|---|---|---:|---:|---:|
| `DISEASE_SYNDROME` (posibles 3.731, reales 3.854) | strict / exact | 0,751 | 0,776 | 0,763 |
| `DISEASE_SYNDROME` | partial | 0,785 | 0,811 | 0,797 |
| `DISEASE_SYNDROME` | ent_type | 0,818 | 0,845 | 0,832 |
| `CELL_FUNC` (posibles 506, reales 611) | strict / exact | 0,494 | 0,597 | 0,541 |
| `CELL_FUNC` | partial | 0,547 | 0,660 | 0,598 |
| `CELL_FUNC` | ent_type | 0,599 | 0,723 | 0,655 |

No se han publicado resultados de benchmarks comparativos contra otros modelos sobre la misma partición en la información disponible, ni métricas de MMLU, HumanEval o GSM8K (no aplicables a un modelo de etiquetado).

## Requisitos de hardware

- VRAM estimada: unos 0,44 GB solo para los pesos en fp32 y unos 0,22 GB en fp16; con activaciones, lotes pequeños y 512 tokens, el consumo total se mantiene por debajo de 2 GB.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 3060 (12 GB) o una RTX 4090 (24 GB) permiten lotes grandes y alto throughput. A100/H100 solo se justifican para servir muchas peticiones concurrentes.
- Cabe holgadamente en GPU consumer e incluso en iGPU o CPU; es viable ejecutarlo en un portátil sin GPU dedicada.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportación a ONNX con Optimum y ONNX Runtime, TorchScript o un servicio FastAPI propio con batching dinámico. vLLM, TGI, llama.cpp y Ollama no son adecuados: están orientados a modelos generativos y este es un encoder de clasificación de tokens.
- Latencia y throughput: no disponibles en la información proporcionada. La model card no incluye mediciones de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HowML/BiomedBERT-ner-medmentions-fine-tuned (este modelo) | 108,9 M | BERT base (512 tokens) | NER biomédico, 9 tipos UMLS | MIT | HuggingFace |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract | ≈110 M (BERT base) | 512 tokens | Modelo de lenguaje enmascarado (backbone, sin cabeza NER) | MIT | HuggingFace |
| dmis-lab/biobert-base-cased-v1.1 | ≈110 M (BERT base, cased) | 512 tokens | Backbone preentrenado en PubMed y PMC; requiere ajuste por tarea | No verificada en esta búsqueda | HuggingFace |
| allenai/scibert_scivocab_uncased | ≈110 M (BERT base) | 512 tokens | Backbone preentrenado en texto científico general; requiere ajuste por tarea | No verificada en esta búsqueda | HuggingFace |

Comparación de rendimiento: no disponible. Los resultados publicados de este modelo corresponden a su propia partición de test de MedMentions y no hay cifras equivalentes de los modelos alternativos en la información proporcionada, por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Rendimiento muy desigual por clase: F1 0,22 en `PHYSIOL_FUNC`, 0,32 en `EXP_DISEASE_MODEL` y 0,37 en `ORGAN_TISSUE_FUNC`. Estas categorías no son fiables sin revisión humana.
- El macro F1 es 0,48 frente al micro 0,63: el resultado global está dominado por `DISEASE_SYNDROME` (3.731 de 8.386 menciones), lo que oculta el mal comportamiento en clases minoritarias.
- Tasa elevada de falsos positivos en las clases con más soporte: 700 menciones espurias en `DISEASE_SYNDROME` y 245 en `CELL_FUNC`. En producción esto implica ruido considerable en la extracción.
- Dominio restringido: entrenado sobre MedMentions (literatura biomédica, resúmenes), por lo que el rendimiento en notas clínicas, informes hospitalarios o texto de patentes no está validado y probablemente degradará.
- Solo inglés. El modelo no procesa castellano ni otros idiomas; la tokenización de textos en español producirá resultados no significativos.
- Ventana de 512 tokens: documentos más largos deben fragmentarse, con el riesgo de partir menciones en las fronteras de los fragmentos.
- Cobertura semántica parcial: únicamente nueve tipos UMLS del subárbol Biologic Function; no reconoce fármacos, genes, procedimientos ni anatomía fuera de esas etiquetas.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de "alucinación extractiva": invención de menciones falsas o atribución de tipo incorrecto, especialmente en clases con recalls bajos.
- No se documentan sesgos demográficos o lingüísticos específicos, ni composición detallada del dataset de entrenamiento (posibles sesgos de sobrerrepresentación de ciertas enfermedades en PubMed).
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. Debe conservarse el aviso de copyright; el modelo base es MIT y el dataset MedMentions tiene sus propias condiciones de uso que conviene revisar por separado.
- Modelo sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en octubre de 2026. No hay evidencia de revisión por pares ni de evaluación independiente.
- Ausencia de hiperparámetros y detalles de entrenamiento en la model card: dificulta la reproducibilidad y la auditoría del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HowML/BiomedBERT-ner-medmentions-fine-tuned
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract
- Corpus MedMentions (repositorio): https://github.com/chanzuckerberg/MedMentions
- Dataset en HuggingFace: https://huggingface.co/datasets/bigbio/medmentions
- BioBERT, artículo original: https://pmc.ncbi.nlm.nih.gov/articles/PMC7703786/
- AMMU, survey de modelos transformer biomédicos: https://www.sciencedirect.com/science/article/pii/S1532046421003117
- Pre-trained Language Models in Biomedical Domain (ACM Computing Surveys): https://dl.acm.org/doi/pdf/10.1145/3611651
- OntolinkX, tesis sobre enlazado consciente del contexto con SapBERT: https://theses.gla.ac.uk/85080/4/2024WangMSc%28R%29.pdf
- Proceedings BioNLP 2025 (ACL): https://aclanthology.org/2025.bionlp-1.pdf
