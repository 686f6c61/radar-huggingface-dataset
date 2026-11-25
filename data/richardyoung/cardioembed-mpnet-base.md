# richardyoung/CardioEmbed-MPNet-base

## Resumen

CardioEmbed-MPNet-base es un adaptador LoRA publicado por Richard Young (DeepNeuro) que especializa el modelo de embeddings `sentence-transformers/all-mpnet-base-v2` en texto clinico de cardiologia. El modelo base MPNet-base es un transformer encoder de 109 millones de parametros con 768 dimensiones de embedding y una ventana de 512 tokens; el adaptador LoRA se entrena sobre el para desplazar el espacio de representaciones hacia vocabulario y relaciones semanticas propias de la cardiologia (terminologia de pruebas diagnosticas, farmacos cardiovasculares, hallazgos electrocardiograficos, etc.).

El modelo no genera texto: produce vectores densos para tareas de similitud semantica, recuperacion de informacion y clustering sobre corpus clinicos en ingles. Forma parte de un estudio comparativo de 10 arquitecturas de embeddings para cardiologia clinica publicado en arXiv (2511.19739), y su unico metrica reportada es una "Separation Score" de 0,386, sin detalle publico de la definicion exacta de dicha metrica ni de comparaciones numericas con las otras arquitecturas del estudio.

Es relevante para equipos que construyen sistemas RAG o de busqueda semantica sobre documentacion cardiologica en ingles y quieren mejorar la recuperacion especifica de dominio sin reentrenar un encoder completo: el adaptador pesa muy poco, se aplica sobre un modelo base ampliamente desplegado y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MPNet-base) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | No disponible (modelo base MPNet-base: ~109 M; el adaptador LoRA anade un numero no especificado de parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base MPNet acepta hasta 512 tokens) |
| Tipos de cuantizacion | No disponible (formato PEFT/safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors via PEFT (adaptador LoRA sobre `sentence-transformers/all-mpnet-base-v2`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `sentence-transformers/all-mpnet-base-v2`, un encoder transformer basado en MPNet (Masked and Permuted Pre-training) que produce embeddings de frase de 768 dimensiones. El adaptador usa rango r=16 y alpha=32, y se carga con `peft.PeftModel.from_pretrained` sobre el modelo base de Sentence Transformers. No se modifica la arquitectura del encoder; solo se anaden matrices de bajo rango en las proyecciones.

El entrenamiento se realizo sobre 106.535 pares de texto de cardiologia extraidos de libros de texto medicos, con la funcion de perdida Multiple Negatives Ranking Loss (InfoNCE), tipica del entrenamiento contrastivo de modelos de similitud de frases. La model card no especifica el numero de epocas, el hardware, el regimen de negativos duros ni si hubo etapas adicionales de destilacion o evaluacion cruzada. Tampoco se detalla la composicion exacta del corpus (proporcion de guias clinicas, libros, articulos) ni el proceso de filtrado.

## Capacidades

- Generacion de embeddings de frase y parrafo para similitud semantica en ingles.
- Recuperacion densa (dense retrieval) sobre corpus de cardiologia.
- Clustering y deduplicacion semantica de documentos clinicos.
- Clasificacion zero-shot mediante similitud con etiquetas textuales.
- Soporte de `sentence-transformers` para integracion en pipelines de embeddings.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- Capacidad multilingue limitada al ingles; no se reportan evaluaciones en otros idiomas.

## Casos de uso

- Busqueda semantica en guias de practica clinica cardiologica: indexar documentos en ingles y recuperar fragmentos relevantes para consultas sobre insuficiencia cardiaca, arritmias o sindromes coronarios, usando el adaptador para mejorar la discriminacion de terminos cardiologicos frente a un encoder generico.
- RAG sobre literatura cardiologica: generar embeddings de chunks de articulos y libros para alimentar un sistema de respuesta aumentada, con la ventaja de que el adaptador se aplica sobre un modelo base ya integrado en la mayoria de stacks de Sentence Transformers.
- Deduplicacion de registros clinicos: agrupar notas o resumenes de pacientes con contenido equivalente mediante similitud coseno, reduciendo duplicados en bases de datos de investigacion.
- Clasificacion de informes de ecocardiografia o cateterismo: asignar etiquetas diagnosticas comparando el embedding del informe con embeddings de descripciones de referencia.
- Enrutamiento de consultas en un asistente clinico: decidir si una pregunta del usuario corresponde a un dominio cardiologico antes de derivarla a un modulo especializado, usando similitud con un conjunto de frases de referencia.
- Construccion de un indice vectorial de farmacos y contraindicaciones cardiovasculares: recuperar interacciones o alertas relevantes a partir de descripciones libres de medicacion.
- Evaluacion comparativa de arquitecturas de embeddings: el modelo sirve como punto de referencia LoRA-adaptado en estudios internos de seleccion de encoders para dominios medicos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Separation Score | 0,386 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, MTEB ni de tareas de recuperacion estandar. La unica metrica reportada es la Separation Score de 0,386, sin definicion publica del calculo ni comparacion numerica con las otras nueve arquitecturas del estudio.

## Requisitos de hardware

- El adaptador LoRA en si ocupa muy pocos megabytes; el coste real lo determina el modelo base MPNet-base (~109 M de parametros, ~440 MB en fp32, ~220 MB en fp16).
- Inferencia en CPU viable para lotes pequenos; GPU consumer (GTX 1660, RTX 3060, RTX 4090) suficiente para throughput alto.
- GPU de datacenter (A100, H100) solo necesaria para indexacion masiva de corpus grandes.
- Despliegue mediante `sentence-transformers`, `transformers` + `peft`, o exportando el modelo fusionado y sirviendolo con Text Embeddings Inference (TEI) o `vLLM` en modo embedding.
- No se publican datos de latencia ni throughput en la model card.
- Cuantizacion a int8 o fp16 posible sobre el modelo base fusionado, aunque no se documenta soporte especifico del adaptador en formatos GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-MPNet-base | Base ~109 M + adaptador LoRA | No disponible (base 512) | Cardiologia (ingles) | Apache 2.0 | Hugging Face (PEFT) |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | 512 tokens | Generico (ingles) | Apache 2.0 | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | Generico (ingles) | Apache 2.0 | Hugging Face |
| BioLORD-2023 o similares biomedicales | No disponible en esta ficha | No disponible | Biomedico general | No disponible | Hugging Face |

No se dispone de comparaciones numericas publicadas entre CardioEmbed-MPNet-base y estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- La unica metrica publicada (Separation Score 0,386) carece de definicion detallada y de comparacion con lineas base, lo que impide valorar la mejora real frente al modelo base.
- Entrenado exclusivamente con pares de libros de texto medicos; puede no generalizar a notas clinicas reales, informes con abreviaturas locales o texto de historias electronicas.
- Riesgo de sesgo hacia la terminologia y practicas descritas en la literatura de entrenamiento, con posible infrarrepresentacion de subespecialidades o poblaciones.
- Como modelo de embeddings, puede producir similitudes altas entre terminos superficialmente parecidos pero clinicamente distintos; requiere validacion en el caso de uso concreto.
- No apto para generacion de texto ni para tareas que requieran razonamiento multi-paso.
- Uso clinico: no debe emplearse como herramienta de decision medica sin supervision profesional; la licencia Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria recae en el integrador.
- El repositorio tiene muy pocas descargas y ninguna validacion externa conocida; tratar como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-MPNet-base
- Paper del estudio: https://arxiv.org/abs/2511.19739
- Modelo base: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Perfil del autor: https://deepneuro.ai/richard
