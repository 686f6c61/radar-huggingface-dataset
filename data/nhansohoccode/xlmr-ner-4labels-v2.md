# NhanSoHocCode/xlmr-ner-4labels-v2

## Resumen

NhanSoHocCode/xlmr-ner-4labels-v2 es un modelo de reconocimiento de entidades nombradas (NER) para token classification, entrenado por el desarrollador NhanSoHocCode (Dang Ngoc Nhan) y publicado en Hugging Face. Se trata de la segunda version de la familia xlmr-ner-4labels: parte del checkpoint NhanSoHocCode/xlmr-ner-4labels y se reentrena sobre un conjunto de datos de reclutamiento actualizado denominado `data-job3`, con una tasa de aprendizaje de 1.5e-05. El modelo esta especializado en texto de ofertas de empleo y descripciones de puesto en vietnamita.

La arquitectura subyacente es XLM-RoBERTa, con 277.459.977 parametros segun el fichero safetensors, lo que corresponde al tamano base de la familia (encoder transformer de 12 capas). El modelo resuelve un problema muy concreto: extraer de forma estructurada cuatro tipos de entidades presentes en anuncios de empleo —HARD_SKILL, SOFT_SKILL, EDUCATION y MAJOR—, lo que permite convertir texto libre de reclutamiento en datos tabulares listos para alimentar un ATS, un motor de busqueda o un sistema de recomendacion.

Su relevancia actual es acotada pero clara: no compite en capacidades generativas, sino que ocupa el nicho de la extraccion de competencias en vietnamita para recursos humanos, un idioma con relativamente pocos modelos NER especializados y publicos. El autor reporta un F1-Score de 0.9114 sobre el conjunto de test, aunque no detalla la composicion del dataset ni el desglose por entidad. La licencia MIT facilita su uso comercial, aunque el modelo cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) para token classification |
| Parametros totales | 277.459.977 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite arquitectonico de XLM-RoBERTa; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (FP32/FP16); no hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Vietnamita (vi), segun la model card. XLM-RoBERTa soporta 100 idiomas, pero el ajuste fino es monoidioma |
| Licencia | MIT |
| Formato de pesos | Safetensors |
| Tarea (pipeline) | token-classification |
| Etiquetas de entidad | HARD_SKILL, SOFT_SKILL, EDUCATION, MAJOR (4 grupos) |
| Tamano del repositorio | 7,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-04 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, la variante multilingue de RoBERTa entrenada sobre corpus de CommonCrawl en 100 idiomas, con vocabulario SentencePiece de aproximadamente 250.000 tokens. Con 277 millones de parametros corresponde al tamano base de la familia. Sobre esta base se anade una cabeza de clasificacion por token, que asigna a cada token una etiqueta de entidad (o la etiqueta "fuera de entidad"). El autor declara 4 grupos de entidades, pero no especifica el esquema de etiquetado exacto (BIO, BILUO u otro) ni la lista completa de etiquetas del fichero `config.json`.

Respecto al entrenamiento, la informacion disponible es limitada: se indica que la version v2 se entrena de forma incremental desde el checkpoint `NhanSoHocCode/xlmr-ner-4labels` sobre el dataset actualizado `data-job3`, con un learning rate de `1.5e-05`, y que este ajuste "optimiza los limites de reconocimiento de las entidades de skills y educacion". No se documentan el numero de tokens de entrenamiento, la composicion del dataset, el numero de epocas, el tamano del conjunto de test ni si se aplicaron tecnicas de regularizacion. Tampoco hay evidencia de RLHF, DPO ni decodificacion especulativa, algo por otro lado esperable en un modelo discriminativo de clasificacion y no generativo.

Como innovacion tecnica, lo unico reseñable es el reentrenamiento incremental a partir de la v1 y la bajada de learning rate a 1.5e-05, orientada a refinar las fronteras de las entidades. No se describe ninguna atencion lineal, decodificacion especulativa ni mecanismo de retrieval asociado.

## Capacidades

- Reconocimiento de entidades nombradas sobre texto en vietnamita, con 4 categorias: habilidades tecnicas (HARD_SKILL, por ejemplo Python, Java, Docker, PySpark, SQL), habilidades blandas (SOFT_SKILL: comunicacion, trabajo en equipo, gestion del tiempo, pensamiento critico), formacion academica (EDUCATION: graduado, master, ingeniero, doctor) y especialidad (MAJOR: ciencias de la computacion, tecnologia de la informacion, sistemas de informacion).
- Clasificacion a nivel de token con puntuaciones de confianza por entidad, lo que permite aplicar umbrales de corte en produccion.
- Agrupacion de subtokens en entidades completas mediante `aggregation_strategy="simple"` en el pipeline de Transformers.
- Especializacion de dominio: el modelo esta ajustado sobre descripciones de puesto y ofertas de empleo, no sobre texto generico.
- Capacidad multilingue nativa de la base (XLM-RoBERTa), aunque el ajuste fino se ha realizado solo en vietnamita; el rendimiento en otros idiomas no esta documentado y previsiblemente sera pobre.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni flujos de agentes multi-paso: es un modelo puramente discriminativo de etiquetado de secuencias.
- No implementa modo "thinking" ni cadena de pensamiento.

## Casos de uso

- Parseo automatico de ofertas de empleo: el modelo recibe el texto de un anuncio en vietnamita y devuelve las entidades de skills, formacion y especialidad ya agrupadas, lo que permite convertir una oferta en un registro estructurado (JSON) para almacenarlo en base de datos sin intervencion manual.
- Alimentacion de un ATS (Applicant Tracking System): las entidades HARD_SKILL y EDUCATION extraidas se indexan como campos filtrables, de modo que un reclutador puede buscar "candidatos formados en tecnologia de la informacion con experiencia en Spark" mediante consultas estructuradas en lugar de busqueda por palabra clave.
- Matching oferta-candidato: comparando el conjunto de HARD_SKILL detectado en la oferta con el detectado en el CV o perfil del candidato, se puede calcular una puntuacion de solapamiento de competencias y ordenar recomendaciones.
- Construccion de taxonomias de competencias: procesando de forma masiva un corpus de ofertas, las entidades extraidas permiten estimar frecuencias y relaciones entre tecnologias (por ejemplo, que porcentaje de ofertas que piden PySpark piden tambien SQL), util para departamentos de People Analytics.
- Analisis de tendencias del mercado laboral: aplicando el modelo a series temporales de anuncios publicados, se puede medir la evolucion de la demanda de una habilidad concreta o de una titulacion en el mercado vietnamita.
- Enriquecimiento de motores de busqueda y recomendadores: las etiquetas generadas se pueden usar como metadatos para indexar ofertas en Elasticsearch u otro motor, mejorando la recuperacion semantica frente a la busqueda textual pura.
- Normalizacion de datos para informes de RR. HH.: convertir cientos de miles de descripciones de puesto heterogeneas en un esquema comun de competencias y titulaciones para reporting interno.
- Preprocesado en pipelines de datos: dado que es un modelo pequeno (277 M de parametros) y determinista, encaja bien como etapa batch dentro de un pipeline ETL o un job de Spark/Beam que enriquece documentos antes de su carga en un almacen de datos.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son el F1-Score sobre el conjunto de test. No se detalla el tamano de dicho conjunto, ni la particion exacta, ni los valores de precision y recall, pese a que las etiquetas del modelo los declaran como metricas.

| Metrica | Conjunto | Valor |
|---|---|---|
| F1-Score | Test | 0,9114 |
| Precision | Test | No disponible |
| Recall | Test | No disponible |
| MMLU, HumanEval, GSM8K u otros | No aplica | No disponible (modelo de NER, no generativo) |
| Desglose de F1 por entidad (HARD_SKILL, SOFT_SKILL, EDUCATION, MAJOR) | Test | No disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos NER en la informacion disponible, ni evaluaciones sobre conjuntos estandar como MultiCoNER, WikiANN o PhoNER.

## Requisitos de hardware

- VRAM estimada para inferencia, segun los 277,46 M de parametros: aproximadamente 1,1 GB en FP32, unos 0,55 GB en FP16/BF16, unos 0,28 GB en INT8 y unos 0,14 GB en INT4, sin contar activaciones ni el vocabulario del tokenizador.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, e incluso en GPUs de 4 GB. El repositorio ocupa 7,8 GB, muy por encima del peso de los parametros, por lo que conviene revisar que ficheros se descargan.
- Inferencia viable en CPU para cargas moderadas: un encoder de 277 M es manejable sin GPU, especialmente con lotes pequenos y secuencias de hasta 512 tokens.
- GPU recomendadas para servicio de alta concurrencia: A10G, L4, T4 o A100/H100 si se busca throughput agregado elevado con batching dinamico; en la practica una sola T4 o L4 cubre escenarios de miles de documentos por hora.
- Opciones de despliegue: pipeline de Hugging Face Transformers, FastAPI con PyTorch, ONNX Runtime / Optimum, TorchScript, Text Generation Inference (TGI, que soporta token classification) y vLLM (soporta modelos de token classification). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son utilizables directamente sin una conversion previa a GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 277 M con secuencias de 512 tokens, la latencia por secuencia suele situarse en el orden de milisegundos en GPU moderna y de decenas a cientos de milisegundos en CPU, pero estos valores son orientativos y no han sido publicados por el autor.
- Recomendacion practica: desplegar en FP16 sobre GPU o en INT8 sobre CPU segun la carga, y aplicar `aggregation_strategy="simple"` para agrupar subtokens.

## Comparativa con modelos similares

La informacion disponible no incluye evaluaciones cruzadas, por lo que la comparacion se limita a caracteristicas estructurales verificables. Los datos de los modelos alternativos provienen de sus fichas publicas y pueden variar.

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| NhanSoHocCode/xlmr-ner-4labels-v2 | 277,46 M | 512 tokens | NER de reclutamiento, 4 entidades | Vietnamita | MIT | F1 test 0,9114 reportado por el autor; 0 descargas |
| NhanSoHocCode/xlmr-ner-4labels (v1) | Mismo orden (base XLM-R) | 512 tokens | NER de reclutamiento, 4 entidades | Vietnamita | MIT | Checkpoint predecesor del que parte la v2; dataset anterior |
| FacebookAI/xlm-roberta-base | ~278 M | 512 tokens | Modelo base, sin ajuste de NER | 100 idiomas | MIT | Requiere ajuste fino para cualquier tarea; no es un NER listo para usar |
| vinai/phobert-base | ~135 M | 256 tokens | Modelo base de lenguaje en vietnamita | Vietnamita | MIT | Base especifica de vietnamita, habitual en tareas NER de ese idioma; no es un NER de reclutamiento |

No se dispone de comparativas de rendimiento con otros NER de reclutamiento en vietnamita, ni de evaluaciones sobre conjuntos publicos que permitan situar el 0,9114 de F1 en contexto.

## Limitaciones y advertencias

- Cobertura linguistica restringida: el ajuste se ha realizado unicamente en vietnamita. Aunque la base XLM-RoBERTa es multilingue, el rendimiento en castellano u otros idiomas no esta documentado y sera previsiblemente bajo.
- Dominio muy estrecho: el modelo esta entrenado para ofertas de empleo y reclutamiento. Su comportamiento sobre texto generico, narrativo o tecnico de otro ambito no esta validado.
- Riesgo de error en fronteras de entidad: el propio autor indica que la v2 se centra en optimizar los limites de reconocimiento de skills y educacion, lo que sugiere que en la v1 existian problemas de delimitacion que pueden persistir parcialmente.
- Sesgos potenciales derivados del dataset `data-job3`, cuya composicion, origen y proceso de anotacion no se documentan. Si el corpus procede de un unico portal de empleo o de un sector concreto, el modelo heredara ese sesgo de dominio.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si de falsos positivos: puede etiquetar como HARD_SKILL terminos que no lo son, especialmente siglas ambiguas o nombres de herramientas poco frecuentes.
- Limitacion de contexto: 512 tokens por secuencia, propio de XLM-RoBERTa. Las descripciones de puesto largas requieren truncado o segmentacion con solapamiento, lo que puede fragmentar entidades.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No impone restricciones de campo de uso, pero tampoco ofrece ninguna garantia de idoneidad.
- Falta de validacion externa: 0 descargas y 0 likes implican que el modelo no ha sido probado por terceros. El F1 de 0,9114 es una cifra autodeclarada sin conjunto de evaluacion publico.
- Metadatos incompletos: no se especifica el esquema de etiquetado, la lista exacta de etiquetas, la configuracion de entrenamiento completa ni los valores de precision y recall, lo que dificulta auditar el modelo antes de llevarlo a produccion.
- Repositorio sobredimensionado: 7,8 GB para un modelo de 277 M de parametros (menos de 1,2 GB en FP32 y en torno a 0,55 GB en FP16) indica que se estan almacenando ficheros adicionales, posiblemente checkpoints intermedios u optimizadores; conviene revisar antes de descargar.
- Advertencia de trazabilidad: las fechas de creacion y actualizacion registradas (2026-10-04) resultan anomales y deberian verificarse antes de citar el modelo como referencia temporal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NhanSoHocCode/xlmr-ner-4labels-v2
- Perfil del autor en Hugging Face: https://huggingface.co/NhanSoHocCode
- Checkpoint predecesor (v1): https://huggingface.co/NhanSoHocCode/xlmr-ner-4labels
- Perfil del autor en GitHub: https://github.com/NhanSoHocCode
- Documentacion de XLM-RoBERTa en Transformers: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Referencia sobre NER multilingue con XLM-RoBERTa: https://github.com/yashrajOjha/xlmr-NER
- Paper sobre NER multilingue complejo (SemEval-2023 Task 2, MultiCoNER II): https://arxiv.org/abs/2305.03300
