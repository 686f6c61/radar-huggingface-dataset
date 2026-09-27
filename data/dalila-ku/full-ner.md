# Dalila-Ku/full-ner

## Resumen

Dalila-Ku/full-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning de google-bert/bert-base-uncased para la tarea de token classification. Lo publica el usuario Dalila-Ku en HuggingFace bajo licencia Apache 2.0 y con un total de 108.898.569 parámetros, un tamaño coherente con una arquitectura BERT-base (encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) más una cabeza lineal de clasificación por token. El modelo se distribuye en formato safetensors y es compatible con el pipeline `token-classification` de la librería transformers.

El problema que resuelve es acotado y clásico: etiquetar secuencias de texto a nivel de token para extraer entidades (personas, organizaciones, localizaciones y clases similares), un paso habitual en pipelines de extracción de información, anonimización de datos personales y enriquecimiento documental. Su relevancia práctica no viene de una innovación arquitectónica, sino de servir como etiquetador ligero y desplegable en CPU o en GPUs de gama baja, con una huella de memoria inferior a 500 MB en FP32.

Conviene señalar desde el principio las limitaciones de la información disponible: la model card está generada automáticamente por el `Trainer` de HuggingFace, indica "unknown dataset" para los datos de entrenamiento y deja sin cubrir las secciones de descripción, usos previstos y limitaciones. El `model-index` declara el nombre "bert-base-conll03-ner" pero no incluye resultados de benchmarks formales. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (12 capas, 768 de dimensión oculta, 12 cabezas de atención) con cabeza de clasificación de tokens |
| Parametros totales | 108.898.569 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite posicional heredado de bert-base-uncased) |
| Tipos de cuantizacion | no disponible; no se han publicado versiones cuantizadas. Los pesos se ofrecen en safetensors (FP32) |
| Idiomas soportados | no disponible en la model card; el modelo base es `bert-base-uncased`, entrenado principalmente con texto en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Pipeline | token-classification |
| Tamaño del repositorio | 0.4 GB |
| Librería | transformers |
| Fecha de creación | 2026-09-27 |
| Última actualización | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base sin modificaciones estructurales: un encoder transformer bidireccional con embeddings de token, de posición y de tipo de segmento, sobre el que se añade una cabeza lineal que proyecta el estado oculto de cada token a la distribución de etiquetas de entidad. La tokenización emplea WordPiece en minúsculas (variante `uncased`) con tokens especiales `[CLS]` y `[SEP]`, y la etiquetación se resuelve subword a subword. El modelo base `bert-base-uncased` fue preentrenado con objetivos de masked language modeling y next sentence prediction sobre BookCorpus y Wikipedia en inglés.

Sobre el entrenamiento de fine-tuning, la model card únicamente aporta los hiperparámetros y la evolución de las métricas, ya que el dataset se declara como desconocido. Se usaron 4 épocas, learning rate lineal de 5e-05, batch size de entrenamiento 32 y de evaluación 64, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, y precisión mixta nativa (AMP). No se documenta ningún tipo de alineación posterior (RLHF, DPO) ni técnicas de decodificación especulativa, attention lineal o variantes híbridas; se trata, por tanto, de un fine-tuning supervisado estándar de clasificación de tokens.

Un detalle técnico reseñable es la discrepancia entre los dos conjuntos de métricas que aparecen en la propia model card: el bloque "results on the evaluation set" reporta Loss 0.1123, Precision 0.8931, Recall 0.9101, F1 0.9015 y Accuracy 0.9805, mientras que la tabla de entrenamiento detalla, para la época 4, Loss 0.0447, Precision 0.9362, Recall 0.9482, F1 0.9421 y Accuracy 0.9890. La model card no explica a qué partición corresponde cada conjunto de cifras.

## Capacidades

- Reconocimiento de entidades nombradas a nivel de token mediante el pipeline `token-classification` de transformers, con salida de etiquetas tipo BIO/BILOU.
- Extracción de spans de entidades para tareas de extracción de información en texto no estructurado.
- Generación de etiquetas intermedias para construir datasets etiquetados de forma automática o semisupervisada (distant labeling).
- Ejecución por lotes (batch) sobre grandes volúmenes de texto con coste computacional bajo, dado el tamaño del modelo.
- Compatibilidad con los endpoints de HuggingFace (`endpoints_compatible` figura entre las etiquetas del repositorio).
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento extendido.
- No dispone de capacidades de visión, audio ni generación de texto libre: es un modelo exclusivamente discriminativo sobre secuencias.
- No hay información publicada sobre el conjunto de etiquetas concretas que predice ni sobre su comportamiento multilingüe.

## Casos de uso

- Anonimización y enmascarado de datos personales: el modelo permite localizar menciones a personas, organizaciones y localizaciones en documentos antes de almacenarlos o compartirlos, sustituyendo los spans detectados por marcadores. Su tamaño reducido permite ejecutarlo en la misma máquina que realiza el preprocesado, sin depender de servicios externos.
- Enriquecimiento de bases documentales: extraer entidades de contratos, informes o expedientes y almacenarlas como metadatos estructurados para facilitar búsquedas y filtrados posteriores.
- Preprocesado para pipelines RAG: identificar entidades en los fragmentos recuperados para construir un grafo de conocimiento que complemente la búsqueda vectorial y mejore la desambiguación de referencias.
- Monitorización de menciones de marca: procesar reseñas, notas de prensa o publicaciones para detectar organizaciones y productos citados, alimentando paneles de seguimiento de reputación.
- Enrutado de tickets y correo entrante: clasificar automáticamente consultas de soporte según las entidades y localizaciones mencionadas, derivándolas al equipo o región correspondiente.
- Etiquetado masivo para creación de datasets: usar el modelo como etiquetador automático sobre corpus no anotados y revisar después únicamente una muestra, reduciendo el coste de anotación manual en proyectos de NLP supervisado.
- Extracción de entidades en literatura científica o técnica: identificar autores, instituciones y lugares en resúmenes y cuerpos de artículos para análisis bibliométricos o mapas de colaboración.
- Indexación y motores de búsqueda internos: generar campos de entidad por documento para habilitar búsquedas facetadas por organización o localización.

En todos los casos debe tenerse en cuenta que no hay información verificada sobre el idioma ni el dominio de entrenamiento; es imprescindible evaluar el modelo con datos propios antes de llevarlo a producción.

## Benchmarks y rendimiento

El `model-index` del repositorio declara el nombre "bert-base-conll03-ner" pero no incluye ningún resultado de benchmark formal (el array `results` está vacío). Por tanto, no se han publicado resultados de benchmarks en la información disponible. Lo único que existe son las métricas de validación reportadas por el propio autor durante el entrenamiento, que se reproducen a continuación tal cual:

| Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 439 | 0.0503 | 0.9057 | 0.9278 | 0.9166 | 0.9851 |
| 2.0 | 878 | 0.0434 | 0.9316 | 0.9488 | 0.9401 | 0.9883 |
| 3.0 | 1317 | 0.0428 | 0.9359 | 0.9455 | 0.9406 | 0.9885 |
| 4.0 | 1756 | 0.0447 | 0.9362 | 0.9482 | 0.9421 | 0.9890 |

Métricas del bloque "evaluation set" de la model card (partición no especificada):

| Metrica | Valor |
|---|---|
| Loss | 0.1123 |
| Precision | 0.8931 |
| Recall | 0.9101 |
| F1 | 0.9015 |
| Accuracy | 0.9805 |

No se especifica la composición del conjunto de evaluación, el esquema de etiquetas ni el dominio, por lo que estas cifras no son directamente comparables con las de otros modelos NER publicados sobre CoNLL-2003 o benchmarks multilingües.

## Requisitos de hardware

- Huella de pesos: aproximadamente 436 MB en FP32 (108,9 M de parámetros × 4 bytes) y unos 218 MB en FP16/BF16.
- VRAM estimada para inferencia: en torno a 1-2 GB en total considerando pesos, activaciones y overhead del runtime con batch moderado y secuencias de 512 tokens; no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Para alto throughput en servidor, una NVIDIA T4 o L4 resulta adecuada; una RTX 3060, RTX 4060 o superior cubre de sobra el caso de uso en una estación de trabajo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en modelos con 4 GB de VRAM o menos si se reduce el batch. La inferencia en CPU también es viable para volúmenes moderados, dado el reducido número de parámetros.
- Opciones de despliegue: `transformers` con el pipeline `token-classification`, exportación a ONNX Runtime u Optimum para acelerar la inferencia en CPU, TorchScript, y servicios propios con FastAPI o similares. No se han publicado pesos GGUF ni cuantizaciones de terceros, por lo que no hay soporte oficial de llama.cpp u Ollama. vLLM y TGI no son adecuados para este tipo de modelo: están orientados a modelos generativos decoder-only.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| Dalila-Ku/full-ner | 108,9 M | 512 tokens | NER (token classification) | apache-2.0 | safetensors | 0 descargas, 0 likes, sin benchmarks publicados |
| dslim/bert-base-NER | ~108 M | 512 tokens | NER (token classification) | MIT | safetensors | Modelo de referencia en NER en inglés, ampliamente utilizado |
| google-bert/bert-base-uncased | ~110 M | 512 tokens | Modelo base (masked LM) | apache-2.0 | safetensors | Requiere fine-tuning para NER |
| google-bert/bert-base-multilingual-cased | ~178 M | 512 tokens | Modelo base multilingüe | apache-2.0 | safetensors | Alternativa si se necesita cobertura de más idiomas |

No se dispone de resultados de benchmark comparables publicados para Dalila-Ku/full-ner, por lo que la comparación de rendimiento con las alternativas no puede establecerse con datos verificables. La diferencia práctica principal frente a dslim/bert-base-NER y otras alternativas consolidadas es la ausencia de documentación sobre el dataset de entrenamiento y de validación externa por parte de la comunidad.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset" en la sección de datos de entrenamiento, por lo que no puede evaluarse el sesgo de dominio ni la cobertura de etiquetas.
- Sesgos: al derivar de `bert-base-uncased`, el modelo hereda los sesgos de género, etnia y nacionalidad presentes en BookCorpus y Wikipedia en inglés. No se ha realizado ninguna auditoría de sesgo sobre este fine-tuning concreto.
- Riesgo de alucinación de entidades: como todo etiquetador, puede asignar etiquetas de entidad a fragmentos que no lo son (falsos positivos), especialmente en dominios alejados del entrenamiento. No hay métricas publicadas que cuantifiquen este comportamiento fuera del conjunto de evaluación del autor.
- Idiomas: no hay información sobre el idioma o idiomas de entrenamiento. El modelo base está entrenado principalmente en inglés, por lo que el rendimiento en castellano u otras lenguas es una incógnita y requiere validación previa.
- Límite de contexto: 512 tokens por secuencia, herencia directa de `bert-base-uncased`. Documentos más largos deben segmentarse, con el consiguiente riesgo de perder entidades que queden partidas entre fragmentos.
- Inconsistencia en las métricas reportadas: los valores del bloque de evaluación y los de la tabla de entrenamiento no coinciden, y la model card no aclara a qué partición corresponde cada uno.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados. No impone restricciones de uso adicionales.
- Falta de validación externa: 0 descargas y 0 likes en el momento de la consulta, y una model card generada automáticamente con secciones sin completar ("More information needed"). No se recomienda su uso en producción sin una evaluación propia sobre datos representativos del caso de uso.
- Modelo exclusivamente discriminativo: no genera texto ni soporta agentes, tool calling o razonamiento multi-paso, por lo que no puede sustituir a un LLM en flujos conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dalila-Ku/full-ner
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Referencia de NER en inglés ampliamente utilizada como comparativa: https://huggingface.co/dslim/bert-base-NER
- Alternativa multilingüe como modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Documentación del pipeline de token classification en transformers: https://huggingface.co/docs/transformers/tasks/token_classification

No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la búsqueda web realizada. Los resultados de búsqueda disponibles hacen referencia al nombre propio "Dalila" y no guardan relación con el modelo.
