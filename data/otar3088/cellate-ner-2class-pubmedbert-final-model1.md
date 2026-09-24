# OTAR3088/CeLLaTe-ner-2class-pubmedbert-final-model1

## Resumen

OTAR3088/CeLLaTe-ner-2class-pubmedbert-final-model1 es un modelo de clasificacion de tokens (token classification) publicado en Hugging Face por el usuario OTAR3088. Por sus etiquetas y su nombre, se trata de un encoder tipo BERT orientado al reconocimiento de entidades nombradas (NER) en texto biomedical, con dos clases de entidad y un backbone derivado de PubMedBERT. El repositorio contiene 110.409.221 parametros en formato safetensors, lo que lo situa en la misma escala que BERT-base y sus variantes de dominio (aproximadamente 110 millones de parametros).

El modelo resuelve la tarea de etiquetado secuencial: dado un texto de entrada, asigna una etiqueta a cada token, tipicamente bajo un esquema BIO para dos tipos de entidad mas la clase exterior. Es relevante para quien necesite extraer entidades en literatura biomedica o en documentos clinicos sin recurrir a un modelo generativo, con un coste de inferencia muy bajo y un consumo de memoria inferior a 1 GB en precision completa.

La informacion publicada es minima: la model card es la plantilla automatica de transformers sin rellenar, no se declara licencia, idiomas, dataset de entrenamiento ni hiperparametros. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas del Hub (creacion 24 de septiembre de 2026) son anomalas. Todas las afirmaciones sobre el esquema de etiquetas, el dominio o el procedimiento de entrenamiento que no aparezcan explicitamente en los metadatos deben tratarse como inferencias no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional); el nombre del repositorio indica un backbone PubMedBERT, no confirmado en la model card |
| Parametros totales | 110.409.221 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos de la familia PubMedBERT/BERT-base suelen usar 512 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye safetensors, y el tamano del repo (0,4 GB) es coherente con pesos en fp32, sin versiones GGUF, ONNX ni cuantizadas publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | token-classification |
| Numero de clases | 2 (segun el nombre del repositorio); las etiquetas concretas no estan documentadas |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, con atencion bidireccional completa y una cabeza de clasificacion por token sobre la salida del encoder (equivalente a AutoModelForTokenClassification). Con 110,4 millones de parametros, el modelo encaja en la configuracion estandar de BERT-base: 12 capas, dimension oculta 768 y 12 cabezas de atencion, aunque estos hiperparametros concretos no estan declarados en la informacion disponible y deben confirmarse leyendo el config.json del repositorio. El sufijo "pubmedbert" del identificador sugiere que el punto de partida fue un checkpoint preentrenado sobre resumenes y articulos de PubMed (dominio biomedico), lo que implicaria un vocabulario WordPiece especifico del dominio, mas adecuado para terminologia medica que el vocabulario de BERT general.

No hay informacion publicada sobre el procedimiento de entrenamiento: ni el dataset, ni el numero de ejemplos, ni si hubo ajuste fino con learning rate discriminativo, ni la composicion de las etiquetas. El nombre "CeLLaTe" podria corresponder a un corpus o proyecto concreto de anotacion, pero no se aporta ninguna referencia. Tampoco se documenta si se aplico algun tipo de regularizacion, early stopping o busqueda de hiperparametros, ni si el entrenamiento se hizo en fp32, fp16 o bf16. La unica referencia tecnica presente en las etiquetas del repositorio es el articulo arXiv:1910.09700 (Lacoste et al., 2019), que aparece porque la plantilla de la model card lo cita en la seccion de impacto ambiental, no porque describa el modelo.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre texto: el pipeline declarado es token-classification, por lo que el modelo etiqueta cada token de una secuencia de entrada.
- Esquema de dos clases de entidad: segun el identificador del repositorio, distingue dos tipos de entidad mas la clase exterior. Que entidades concretas son no esta documentado.
- Dominio biomedical probable: por el sufijo "pubmedbert", el modelo estaria especializado en vocabulario y sintaxis de publicaciones cientificas y/o textos clinicos, no en lenguaje general.
- Codificacion contextual: al ser un encoder bidireccional, genera representaciones contextuales reutilizables para otras tareas (clasificacion de secuencias, similitud, recuperacion), siempre que se anada una cabeza nueva.
- No soporta generacion de texto: al ser un encoder, no produce texto libre.
- No hay evidencia de soporte de tool calling, function calling, uso agentico, modo thinking, vision, audio ni razonamiento multi-paso. Un modelo de clasificacion de tokens no cubre esas capacidades.
- Capacidades multilingues: no disponibles; el vocabulario de un PubMedBERT tipico esta entrenado practicamente en ingles, por lo que el rendimiento fuera de ese idioma es incierto.

## Casos de uso

- Extraccion de entidades en literatura biomedica: procesar resumenes de PubMed o articulos completos por fragmentos de hasta la longitud de contexto del modelo para poblar una base de datos con las dos clases de entidad detectadas, por ejemplo sustancias, enfermedades o genes, segun cual sea el esquema real.
- Preprocesado para pipelines de recuperacion de informacion (RAG) en dominio clinico: usar las entidades extraidas como metadatos o filtros que mejoren la precision del recuperador antes de pasar los fragmentos a un modelo generativo.
- Anotacion asistida de corpus: integrar el modelo como preanotador en herramientas tipo Label Studio o Prodigy para que un experto revise y corrija, reduciendo el coste humano de construir corpus anotados.
- Normalizacion de terminologia clinica: mapear las entidades detectadas a vocabularios controlados (por ejemplo UMLS o SNOMED CT mediante un paso posterior de entity linking), usando la etiqueta predicha como primer filtro.
- Indexado y busqueda semantica en repositorios documentales sanitarios: enriquecer los indices de un motor de busqueda con las entidades reconocidas para permitir consultas del tipo "documentos que mencionan entidad X".
- Curado de bases de farmacovigilancia o de ensayos clinicos: extraer de forma automatica menciones estructuradas en informes y abstracts para alimentar revisiones sistematicas, con supervision humana en la validacion final.
- Deteccion de informacion sensible en textos clinicos: si una de las dos clases resultase corresponder a datos identificativos, el modelo podria servir como primer paso de de-identificacion, aunque esto requiere confirmar las etiquetas y anadir reglas complementarias.

En todos los casos, la adecuacion real depende de verificar el esquema de etiquetas y de evaluar el modelo sobre una muestra propia del dominio objetivo, ya que no hay metricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es la plantilla automatica de Hugging Face y no incluye seccion de evaluacion rellenada, ni metricas de F1, precision o recall sobre ningun conjunto de test, ni comparaciones con otros sistemas.

Cualquier cifra que se quiera usar para decidir el despliegue debe obtenerse midiendo el modelo sobre un conjunto de validacion propio con la metrica adecuada para NER (tipicamente F1 a nivel de entidad con esquema seqeval).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16/bf16. Sumando activaciones y overhead del runtime, el consumo se situa tipicamente por debajo de 1-1,5 GB con lotes pequenos y secuencias de 512 tokens.
- GPU recomendadas: funciona sin problema en cualquier GPU con 4 GB o mas de VRAM. Una RTX 3060, RTX 4090, T4, L4 o A10 son mas que suficientes; A100 y H100 solo tendrian sentido para servir grandes volumenes en lote.
- GPU de consumo: si, cabe holgadamente en GPU de consumo, incluidas integradas con memoria compartida para lotes pequenos.
- CPU: viable para inferencia en tiempo casi interactivo con pocas secuencias; para lotes grandes conviene exportar a ONNX Runtime o usar cuantizacion dinamica.
- Opciones de despliegue: pipeline de transformers; TorchScript o ONNX Runtime para reducir latencia en CPU; el repositorio esta marcado como endpoints_compatible, por lo que puede servirse en Hugging Face Inference Endpoints. vLLM y TGI estan orientados a modelos generativos y ofrecen soporte limitado o nulo para token-classification, por lo que no son la via recomendada.
- Latencia y throughput: no se han publicado mediciones. Al tratarse de un encoder de 110 millones de parametros, el coste por secuencia es bajo comparado con cualquier modelo generativo, pero no hay cifras verificables en la informacion disponible.

## Comparativa con modelos similares

No hay datos de rendimiento publicados de este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales. Los valores de los modelos alternativos proceden del conocimiento general de la familia y no se han verificado en esta consulta; deben confirmarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Dominio | Licencia | Notas |
|---|---|---|---|---|---|
| OTAR3088/CeLLaTe-ner-2class-pubmedbert-final-model1 | 110,4 M | no disponible | biomedical (inferido) | no disponible | 2 clases, sin metricas publicadas |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract (PubMedBERT) | ~110 M | 512 tokens | biomedical | MIT (no verificado) | Checkpoint base, sin cabeza NER; requiere ajuste fino |
| dslim/bert-base-NER | ~110 M | 512 tokens | general (CoNLL-2003) | MIT (no verificado) | 4 clases (PER, ORG, LOC, MISC); no especializado en biomedicina |
| d4data/biomedical-ner-all | ~110 M | 512 tokens | biomedical | no verificado | Esquema con decenas de etiquetas; mas granular que 2 clases |

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla automatica; no se declaran datos de entrenamiento, hiperparametros, metricas ni esquema de etiquetas. Cualquier uso en produccion exige inspeccionar config.json e id2label antes de nada.
- Licencia no declarada: al no especificarse licencia en el repositorio, no hay autorizacion explicita de uso comercial. Hay que contactar con el autor o abstenerse de utilizarlo en productos comerciales.
- Riesgo de alucinacion de entidades: como todo modelo discriminativo, puede producir falsos positivos y falsos negativos, especialmente ante terminologia no vista, abreviaturas, negaciones o entidades anidadas. Un esquema de dos clases no puede representar entidades solapadas o jerarquicas.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no es posible evaluar sesgos por subpoblacion, idioma, origen geografico o tipo de publicacion.
- Limitacion de idioma: no se declaran idiomas soportados. Los modelos PubMedBERT se entrenan casi exclusivamente con texto en ingles, por lo que el rendimiento en castellano es incierto y probablemente pobre sin un ajuste fino adicional.
- Longitud de contexto: si el checkpoint sigue la configuracion estandar de BERT, los documentos largos tendran que fragmentarse con solapamiento, lo que puede partir entidades y degradar el recall en los limites de los fragmentos.
- Reputacion y trazabilidad: 0 descargas y 0 likes, sin paper asociado ni autor identificable, y con fechas de creacion anomalas en el Hub. No existe validacion por parte de la comunidad.
- Sin garantias de produccion: no hay tests de robustez, ni evaluacion de calibracion, ni informacion sobre el comportamiento ante entradas adversarias o ruido OCR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OTAR3088/CeLLaTe-ner-2class-pubmedbert-final-model1
- Articulo citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de CO2 en machine learning): https://arxiv.org/abs/1910.09700
- Articulo de PubMedBERT (referencia del backbone indicado en el nombre del repositorio, no vinculado por el autor): https://arxiv.org/abs/2007.15779
- Articulo original de BERT (arquitectura base): https://arxiv.org/abs/1810.04805
