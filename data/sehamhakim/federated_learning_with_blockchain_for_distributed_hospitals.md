# sehamhakim/Federated_Learning_with_Blockchain_for_Distributed_Hospitals

## Resumen

Este repositorio aloja los pesos del modelo global agregado durante un proceso de aprendizaje federado descentralizado entre instituciones clinicas distribuidas. La coordinacion de las rondas de agregacion, la verificacion de la integridad del modelo y la participacion de cada nodo se orquestan mediante una red blockchain, con el objetivo declarado de garantizar auditabilidad, tolerancia a fallos bizantinos y ausencia de fuga de datos entre hospitales.

Tecnicamente es un encoder biomedico de consultas orientado a extraccion de caracteristicas (pipeline `feature-extraction`), afinado a partir de `ncbi/MedCPT-Query-Encoder`. No es un modelo generativo: su salida son embeddings densos de texto clinico, pensados para recuperacion semantica, emparejamiento de documentos y clasificacion de consultas hospitalarias sin exponer los datos privados de cada institucion.

Su relevancia actual es mas metodologica que de rendimiento: ejemplifica la combinacion de aprendizaje federado con coordinacion on-chain en el dominio sanitario, un area donde la normativa de privacidad limita el entrenamiento centralizado. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, esta licenciado bajo Apache-2.0, ocupa 2,4 GB y solo declara soporte para ingles. No se publican resultados de benchmarks ni detalles de arquitectura interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de texto tipo transformer (heredada de `ncbi/MedCPT-Query-Encoder`); numero de capas y dimensiones no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 2,4 GB) |
| Modelo base | `ncbi/MedCPT-Query-Encoder` |
| Tarea declarada (pipeline) | `feature-extraction` |
| Esquema de entrenamiento | Aprendizaje federado descentralizado con agregacion on-chain (FedAvg / consenso por contrato inteligente) |
| Dominio | Biomedico y clinico |
| Fecha de creacion | 2026-09-12 |
| Fecha de ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura y el tokenizador de `ncbi/MedCPT-Query-Encoder`, un encoder denso especializado en representar consultas biomedicas. Sobre esa base se aplica un proceso de aprendizaje federado descentralizado: cada hospital participante entrena localmente sobre sus propios datos y solo comparte actualizaciones de pesos, que se agregan en una red blockchain. El autor indica que la agregacion sigue un esquema tipo FedAvg o un consenso mediado por contratos inteligentes, con verificacion de integridad y tolerancia a fallos bizantinos.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus clinico, el numero de rondas federadas, el tamano de cada cohorte hospitalaria ni si se aplicaron tecnicas adicionales como privacidad diferencial, recorte de gradientes o destilacion. Tampoco se documentan hiperparametros de ajuste fino ni si se utilizo entrenamiento contrastivo adicional sobre la base de MedCPT. La innovacion tecnica declarada es, por tanto, el propio mecanismo de coordinacion (auditabilidad on-chain y cero intercambio de datos crudos) mas que cambios en el bloque transformer subyacente. El tamano del repositorio (2,4 GB) es considerablemente mayor que el de un unico checkpoint de encoder en precision completa, lo que sugiere la presencia de varios archivos de pesos o de estados de agregacion, pero este extremo no se detalla.

## Capacidades

- Generacion de embeddings densos de texto biomedico y clinico mediante el pipeline `feature-extraction`.
- Recuperacion semantica (semantic search) sobre corpus clinicos: consultas en lenguaje natural contra indices vectoriales.
- Emparejamiento de documentos y deteccion de similitud entre textos medicos (por ejemplo, historiales, informes o guias).
- Clasificacion de consultas hospitalarias a partir de la representacion vectorial resultante.
- Integracion como componente de recuperacion en pipelines de generacion aumentada por recuperacion (RAG) clinicos.
- Soporte de busqueda entre instituciones sin centralizar datos: cada nodo mantiene sus datos y comparte unicamente actualizaciones de modelo.
- Capacidad declarada de operar en entornos de confianza cero (zero-trust) y en sistemas de apoyo a la decision clinica (CDSS).

Limitaciones funcionales relevantes: no genera texto, no soporta tool calling ni function calling, no implementa razonamiento multi-paso ni modos de pensamiento, no procesa vision ni audio, y no declara capacidades multilingues mas alla del ingles.

## Casos de uso

- Busqueda semantica en historiales clinicos distribuidos: cada hospital indexa sus documentos con los embeddings del modelo y las consultas se resuelven por similitud vectorial dentro de cada institucion, evitando mover datos de pacientes entre centros.
- Recuperacion de literatura biomedica para apoyo a la decision: al derivar de MedCPT, el encoder es adecuado para mapear preguntas clinicas a articulos o resumenes indexados, alimentando un CDSS con evidencia relevante.
- Enrutado y triage de consultas entrantes: clasificar consultas de pacientes o de personal clinico por especialidad o urgencia usando la representacion vectorial, antes de derivarlas al servicio correspondiente.
- Deduplicacion y matching de registros entre instituciones: detectar que dos informes o episodios en hospitales distintos describen el mismo caso o el mismo documento, comparando embeddings en lugar de identificadores personales.
- Motor de recuperacion para RAG clinico auditables: usar el modelo como retriever y registrar en la blockchain que ronda de modelo genero cada embedding, lo que permite trazar que version del modelo produjo una respuesta en un sistema regulado.
- Investigacion multi-hospital con datos que no salen del centro: emplear el pipeline federado descrito para ajustar el encoder con cohortes locales y agregar solo pesos, cumpliendo restricciones de gobernanza de datos.
- Construccion de indices de guias clinicas y protocolos internos: generar embeddings de protocolos y permitir busquedas por significado, no solo por palabra clave, dentro de la intranet hospitalaria.
- Filtrado y agrupacion de literatura para revisiones sistematicas: agrupar miles de referencias por similitud semantica para priorizar la lectura manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (nDCG, Recall@k, MRR), clasificacion clinica ni comparaciones cuantitativas con otros encoders. La busqueda web realizada no devolvio resultados relacionados con el modelo: los unicos resultados obtenidos corresponden a paginas de descarga de software de perifericos (Logitech G HUB), por lo que no aportan datos utilizables.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Como referencia orientativa, la familia del modelo base es un encoder denso de tipo BERT; un encoder de ese orden de magnitud ocupa por debajo de 1 GB en FP32 y en torno a 0,3 GB en FP16. Estas cifras son estimaciones por familia y no estan confirmadas por el autor.
- GPU recomendadas: no disponibles. Por el tipo de tarea, una GPU de consumo como una RTX 3060, 4070 o 4090 seria mas que suficiente si se confirma el orden de magnitud anterior; tambien es viable la inferencia en CPU, aunque con mayor latencia.
- Cabe en GPU de consumo: probablemente si, segun la estimacion anterior, pero no confirmado en la informacion disponible.
- Opciones de despliegue: al ser un modelo de `feature-extraction` basado en transformers, es desplegable con la libreria `transformers`, con `sentence-transformers` si se adapta a ese formato, con Text Embeddings Inference (TEI) de Hugging Face como servidor de embeddings, o exportandolo manualmente a ONNX. El uso con vLLM o llama.cpp requeriraia conversion previa a un formato soportado; no se documenta ninguna.
- Almacenamiento en disco: el repositorio ocupa 2,4 GB.
- Latencia y throughput: no disponibles.
- Infraestructura de recuperacion asociada: FAISS, Milvus, Qdrant o pgvector para el indice vectorial; los requisitos dependen del volumen de documentos, no del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `sehamhakim/Federated_Learning_with_Blockchain_for_Distributed_Hospitals` | no disponible | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Encoder agregado via aprendizaje federado con coordinacion blockchain |
| `ncbi/MedCPT-Query-Encoder` | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face | Modelo base directo, sin capa federada |
| Otros encoders biomedicos (PubMedBERT, BioBERT, variantes BGE/GTE) | no disponible | no disponible | no disponible | Hugging Face | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa. La diferencia funcional verificable frente al modelo base es el proceso de agregacion federada y su trazabilidad on-chain, no un cambio documentado en la arquitectura.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, responder preguntas de forma directa ni ejecutar herramientas. Cualquier uso conversacional exige combinarlo con un LLM aparte.
- Solo declara soporte para ingles; su comportamiento en castellano u otros idiomas no esta documentado y probablemente degrade.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad de recuperacion, lo que impide justificar su eleccion frente a alternativas consolidadas.
- Sin validacion de la comunidad: 0 descargas y 0 "likes", repositorio con apenas una hora entre creacion y ultima actualizacion.
- Riesgo de recuperacion incorrecta: en un contexto clinico, un emparejamiento semantico erroneo puede propagarse a decisiones de triage o priorizacion. No es un error de "alucinacion" generativa, pero el efecto practico es equivalente.
- Sesgos potenciales: no se describen las instituciones, la demografia ni la especialidad de los datos de entrenamiento, por lo que no puede evaluarse el sesgo poblacional ni la cobertura de enfermedades raras.
- Privacidad: aunque el aprendizaje federado evita compartir datos crudos, no se documentan medidas de privacidad diferencial ni defensas contra ataques de inversion de modelo o extraccion de informacion memorizada.
- Restricciones de uso declaradas: queda fuera de alcance el diagnostico automatico y la prescripcion de medicacion sin supervision de un clinico.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No exime del cumplimiento de normativa sanitaria y de proteccion de datos (RGPD, HIPAA, MDR, reglamento europeo de IA), que son responsabilidad del desplegador.
- Trazabilidad de pesos: se desconoce si los archivos incluyen sumas de verificacion, que version concreta del modelo base se uso y en que ronda federada se genero el checkpoint publicado.
- Incertidumbre sobre el contenido del repositorio: 2,4 GB para un encoder de este tipo sugiere archivos adicionales (multiples checkpoints, estados de optimizador o datos auxiliares) que no se describen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sehamhakim/Federated_Learning_with_Blockchain_for_Distributed_Hospitals
- Modelo base: https://huggingface.co/ncbi/MedCPT-Query-Encoder
- Repositorio GitHub del proyecto: https://github.com/Decentralized-Systems-and-Applications/Federated_Learning_with_Blockchain_for_Distributed_Hospitals
- Video de demostracion: https://drive.google.com/file/d/11C0rO3Zjp7459Yn7012KK0VBu-refau_/view
- La busqueda web realizada no devolvio enlaces relevantes al modelo (unicamente paginas de software de perifericos), por lo que no se anaden referencias adicionales.
