# ikim-uk-essen/stm_mistral

## Resumen

El modelo `ikim-uk-essen/stm_mistral` es un retriever de embeddings de frases (sentence-similarity) desarrollado por el Instituto de Inteligencia Artificial en Medicina (IKIM) del Hospital Universitario de Essen, en Alemania. Forma parte de la familia STM (Synthesize–Train–Merge), presentada en el artículo «Less Finetuning, Better Retrieval: Rethinking LLM Adaptation for Biomedical Retrievers via Synthetic Data and Model Merging» (arXiv 2602.04731). El modelo resuelve el problema de adaptar un LLM de propósito general a la recuperación de información biomédica sin necesidad de un fine-tuning extenso, mediante la fusión de varios adaptadores LoRA especializados.

La arquitectura se basa en `mistralai/Mistral-7B-Instruct-v0.2`, un transformer decoder-only de 7.110 millones de parámetros, sobre el que se fusionan cuatro adaptadores LoRA mediante el método TIES con búsqueda aleatoria (best of 10). El resultado es un modelo de embeddings con dimensión 4096 y una longitud máxima de secuencia de 512 tokens, optimizado para tareas de retrieval y similitud semántica en el dominio biomédico, aunque también cubre recuperación general. Su relevancia actual radica en que ofrece una alternativa eficiente a los métodos tradicionales de fine-tuning para construir retrievers biomédicos, reduciendo costes computacionales y manteniendo un rendimiento competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2) con fusion TIES de 4 adaptadores LoRA |
| Parametros totales | 7.110.660.096 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (max_seq_length configurado en el codigo de uso) |
| Tipos de cuantizacion | No disponible (el codigo de ejemplo usa float16, pero no se documentan cuantizaciones GGUF u otras) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `mistralai/Mistral-7B-Instruct-v0.2` como backbone y fusiona cuatro adaptadores LoRA entrenados de forma independiente sobre distintos conjuntos de datos. La fusion se realiza con el metodo TIES (Trimming, Elect Sign, Merge) y una busqueda aleatoria de hiperparametros (best of 10). Los adaptadores y sus pesos de fusion son los siguientes:

| Experto | Foco del dataset | Peso | Densidad |
|---|---|---|---|
| `expert-mistral-real-medical` | QA biomedico real | 0.8 | 0.8 |
| `expert-mistral-general-qa-gpt5-hard-negatives` | NLU general / QA con hard negatives | 0.5 | 0.7 |
| `expert-mistral-synthetic-medical-gpt5-hard-negatives` | QA biomedico sintetico con hard negatives | 0.2 | 0.2 |
| `expert-mistral-general-ir` | Recuperacion de informacion general | 0.1 | 0.2 |

El entrenamiento de los expertos se basa en datos reales y sinteticos, incluyendo hard negatives generados con GPT-5 para mejorar la discriminacion. No se especifican el numero total de tokens de entrenamiento ni la composicion exacta de los datasets. La innovacion principal del metodo STM es que reduce la cantidad de fine-tuning necesaria al fusionar adaptadores especializados, logrando mejores resultados en retrieval biomedico que un fine-tuning completo del modelo base.

## Capacidades

- Generacion de embeddings de frases para tareas de similitud semantica y recuperacion de informacion, con dimension de embedding 4096.
- Especializacion en retrieval biomedico: recupera pasajes relevantes para preguntas sobre medicina, farmacologia, efectos secundarios, etc.
- Soporte para retrieval general gracias al experto `expert-mistral-general-ir`.
- Uso con prefijos de instruccion: las consultas y los pasajes se formatean con instrucciones especificas (p. ej., «Given a question, retrieve relevant passages that answer the question»).
- Compatible con la libreria `sentence-transformers` y con `text-embeddings-inference` (segun los tags del repositorio).
- No es un modelo generativo: no produce texto, solo embeddings. Por tanto, no soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en literatura biomedica: indexar articulos de PubMed o bases de datos medicas y recuperar los pasajes mas relevantes para una consulta clinica o de investigacion. El modelo esta entrenado especificamente para este tipo de tareas.
- Sistemas de respuesta a preguntas medicas (RAG): integrar el modelo como componente de recuperacion en un pipeline de generacion aumentada por recuperacion, donde un LLM generativo responde basandose en los pasajes recuperados.
- Asistencia clinica: recuperar informacion relevante de guias de practica clinica, historiales de pacientes o documentacion farmacologica para apoyar decisiones medicas.
- Filtrado y clasificacion de documentos: ordenar un corpus de documentos medicos por relevancia respecto a una consulta, util para revisiones sistematicas o analisis de evidencia.
- Indexacion de corpus biomedicos: construir indices de embeddings para motores de busqueda internos en hospitales o instituciones de investigacion, con la ventaja de un contexto de 512 tokens por pasaje.
- Soporte a investigacion: encontrar estudios similares o pasajes relevantes en grandes colecciones de articulos cientificos, reduciendo el tiempo de revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos de retrieval. El articulo asociado (arXiv 2602.04731) podria contener metricas, pero no estan accesibles en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 7.110 millones de parametros. En float16, el peso ocupa aproximadamente 14,2 GB (7.110.660.096 × 2 bytes), por lo que se recomienda una GPU con al menos 16 GB de VRAM para inferencia sin cuantizacion.
- Con cuantizacion (por ejemplo, int8 o int4), el modelo podria caber en GPUs con 8 GB de VRAM, aunque no se documentan cuantizaciones oficiales.
- GPUs recomendadas: NVIDIA A100, H100, RTX 4090 (24 GB), RTX 3090 (24 GB), o GPUs profesionales con 16 GB o mas. En consumer, una RTX 4080 (16 GB) o superior seria adecuada.
- Opciones de despliegue: `sentence-transformers` para integracion en Python, `text-embeddings-inference` (mencionado en los tags) para servir el modelo como endpoint de embeddings. Tambien es posible usar `transformers` directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependera del hardware y de la longitud de los pasajes (maximo 512 tokens).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo compite con otros retrievers biomedicos como BioBERT, PubMedBERT o modelos de embeddings generales como E5 o BGE, pero no hay metricas disponibles para establecer una comparacion cuantitativa. La ventaja principal de `stm_mistral` es su origen en un LLM de 7B parametros, lo que le permite capturar semantica mas rica que modelos mas pequenos, aunque a costa de mayores requisitos de hardware.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al estar entrenado sobre datos biomedicos, podria reflejar sesgos presentes en la literatura medica o en los datos sinteticos generados.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo no genera texto, sino embeddings. Sin embargo, en un pipeline RAG, los pasajes recuperados podrian contener informacion incorrecta si el corpus fuente tiene errores.
- Limitaciones de contexto: la longitud maxima de secuencia es de 512 tokens, lo que limita la cantidad de texto que se puede codificar por pasaje o consulta. Para documentos largos, se requiere segmentacion.
- Limitaciones de idioma: no se especifican los idiomas soportados. El modelo base Mistral-7B-Instruct-v0.2 tiene un soporte multilingue limitado (principalmente ingles y algunos idiomas europeos), pero no hay confirmacion para este checkpoint.
- Restricciones de licencia: la licencia no esta disponible en la model card. Esto supone un riesgo para uso comercial, ya que no se puede verificar si el modelo es de codigo abierto o si tiene restricciones de uso.
- Caveat para produccion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un checkpoint reciente y posiblemente no validado ampliamente por la comunidad. Se recomienda evaluar su rendimiento en el dominio especifico antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ikim-uk-essen/stm_mistral
- Articulo arXiv: https://arxiv.org/abs/2602.04731
- Coleccion STM en HuggingFace: https://huggingface.co/collections/ikim-uk-essen/stm
- Instituto IKIM: https://www.ikim.uk-essen.de/
- Perfil de la organizacion en HuggingFace: https://huggingface.co/ikim-uk-essen
