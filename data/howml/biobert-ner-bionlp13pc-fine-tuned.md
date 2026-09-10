# HowML/biobert-ner-bionlp13pc-fine-tuned

## Resumen

HowML/biobert-ner-bionlp13pc-fine-tuned es un modelo de reconocimiento de entidades nombradas (NER) especializado en texto biomedico, desarrollado por el usuario HowML y publicado en HuggingFace. Se trata de un ajuste fino de dmis-lab/biobert-base-cased-v1.1, la variante de BioBERT basada en la arquitectura BERT-base, sobre el corpus bigbio/bionlp_st_2013_pc, correspondiente a la tarea de curacion de rutas biologicas (Pathway Curation) del BioNLP Shared Task 2013.

El modelo resuelve la tarea de etiquetado de tokens (token-classification) en el dominio biomedico: identificar y clasificar entidades como genes, proteinas, compuestos quimicos y otros elementos relevantes para la curacion de rutas. Con 107.726.601 parametros totales (unos 107,7 millones), se situa en el rango de los transformer encoder de tamano base (BERT-base), lo que implica un coste de inferencia bajo y la posibilidad de ejecutarlo en hardware modesto.

Es relevante ahora porque cubre un nicho concreto —la extraccion de entidades biomedicas para pipelines de curacion de literatura cientifica— y porque su licencia MIT y su tamano contenido permiten integrarlo en entornos de produccion o de investigacion sin grandes requisitos de infraestructura. No obstante, el acceso al modelo esta restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), fine-tune de dmis-lab/biobert-base-cased-v1.1 |
| Parametros totales | 107.726.601 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (correspondiente a BERT-base-cased, modelo base) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Dataset de ajuste | bigbio/bionlp_st_2013_pc |
| Tamano del repositorio | 0,4 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en HuggingFace |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-base: un transformer encoder bidireccional con 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con tokenizacion WordPiece cased. El modelo parte de dmis-lab/biobert-base-cased-v1.1, una version de BioBERT que fue preentrenada sobre corpus biomedicos (abstracts de PubMed y texto completo de PMC) partiendo de BERT-base-cased. Sobre esa base, HowML ha realizado un ajuste fino supervisado para la tarea de reconocimiento de entidades de BioNLP Shared Task 2013 Pathway Curation (bigbio/bionlp_st_2013_pc).

No se dispone de informacion detallada sobre el numero de pasos de entrenamiento, hiperparametros, composicion exacta del dataset ni sobre si se aplicaron tecnicas adicionales de alineacion (RLHF, DPO). Tampoco se documentan innovaciones arquitectonicas propias: se trata de un fine-tune estandar de clasificacion de tokens con una cabeza de clasificacion sobre el encoder preentrenado. Toda la informacion adicional sobre el proceso de entrenamiento debe considerarse "no disponible" en la documentacion proporcionada.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en texto biomedico en ingles, dentro del esquema de anotacion del corpus bigbio/bionlp_st_2013_pc.
- Clasificacion de tokens (token-classification): asigna una etiqueta BIO a cada token de la secuencia de entrada.
- Extraccion de entidades relacionadas con la curacion de rutas biologicas (entidades de tipo gen, proteina, compuesto quimico y similares, segun el esquema del dataset de BioNLP 2013 PC).
- Procesamiento de texto cientifico/biomedico en ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue: el modelo esta etiquetado unicamente como "en".
- No se documentan capacidades de vision, audio ni modo de razonamiento (thinking mode).
- No es un modelo generativo: no produce texto libre, solo etiquetas por token.

## Casos de uso

- Extraccion de entidades en literatura cientifica: dado un abstract o texto completo de un articulo biomedico, el modelo etiqueta los tokens correspondientes a entidades de interes, lo que permite construir bases de datos estructuradas de genes, proteinas y compuestos a partir de texto no estructurado.
- Curacion de rutas biologicas: contribuye a la anotacion automatizada de rutas, un paso previo a la integracion de conocimiento en bases de datos como Reactome o similares, reduciendo el trabajo manual de los curadores.
- Preanotacion asistida para revisores humanos: en herramientas de anotacion tipo brat o INCEpTION, el modelo puede generar etiquetas preliminares que los expertos corrigen, acelerando el proceso de curacion de corpus.
- Indexacion y busqueda semantica en repositorios biomedicos: las entidades extraidas pueden usarse para enriquecer indices de busqueda, permitiendo consultas por gen, proteina o compuesto especifico.
- Construccion de datasets de entrenamiento: los resultados del modelo pueden usarse como punto de partida (con revision posterior) para generar datos etiquetados de entrenamiento para modelos mayores.
- Analisis de tendencias en investigacion: extraer y agregar entidades a lo largo de un corpus de publicaciones permite estudiar la evolucion temporal de la mencion de determinados genes o proteinas.
- Integracion en pipelines de procesamiento de lenguaje biomedico (BioNLP): encaja como componente NER dentro de cadenas mas amplias de extraccion de relaciones o de eventos, dado su formato safetensors y su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas de evaluacion (F1, precision, recall) sobre el conjunto de test de BioNLP 2013 PC ni comparaciones numericas con otros modelos. No se deben asumir valores concretos sin datos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 107,7 millones de parametros, el modelo ocupa aproximadamente 430 MB en fp32 y unos 215 MB en fp16. El repositorio pesa 0,4 GB.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente. Se puede ejecutar con comodidad en RTX 3060, RTX 4090, A100 o H100; el modelo es demasiado pequeno para aprovechar GPUs de gama alta.
- Cabe en GPU de consumo: si, de forma holgada, e incluso en GPUs integradas y en CPU. No requiere una GPU dedicada para funcionar a velocidades razonables en cargas moderadas.
- Opciones de despliegue: al ser un modelo BERT para token-classification, es compatible con librerias estandar del ecosistema HuggingFace (transformers + PyTorch), con Text Embeddings Inference o con servidores genericos de inferencia de transformers. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin conversion previa.
- Latencia y throughput estimados: no disponibles. Al tratarse de un encoder pequeno con contexto de 512 tokens, la latencia por lote suele ser de milisegundos en GPU y de decenas de milisegundos en CPU, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HowML/biobert-ner-bionlp13pc-fine-tuned | 107,7 M | 512 | NER biomedico (BioNLP 2013 PC) | MIT | HuggingFace (gated) |
| dmis-lab/biobert-base-cased-v1.1 | ~110 M | 512 | Modelo base biomedico (preentrenamiento) | no disponible en la informacion | HuggingFace |
| allenai/scibert_scivocab_cased | ~110 M | 512 | Modelo base de texto cientifico (preentrenamiento) | no disponible en la informacion | HuggingFace |
| microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract | ~110 M | 512 | Modelo base biomedico (preentrenamiento) | no disponible en la informacion | HuggingFace |

Los tres modelos comparables son modelos base de preentrenamiento, no fine-tunes de NER, por lo que la comparacion directa de rendimiento en la tarea no es posible sin reentrenamiento. Todos comparten el mismo orden de magnitud de parametros (~110 millones) y una ventana de contexto de 512 tokens. No se dispone de datos de rendimiento comparados para la tarea especifica de BioNLP 2013 PC.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al derivar de BioBERT y de corpus de literatura biomedica en ingles, hereda los sesgos presentes en dichas fuentes (por ejemplo, sobrerrepresentacion de determinados organismos o areas de investigacion).
- Riesgo de alucinacion: al ser un modelo de etiquetado de tokens y no generativo, no "alucina" texto, pero si puede asignar etiquetas incorrectas a tokens ambiguos o fuera de dominio, generando falsos positivos y falsos negativos.
- Limitaciones de idioma: el modelo esta etiquetado unicamente para ingles; su rendimiento en otros idiomas no esta garantizado ni documentado.
- Limitacion de contexto: la ventana de 512 tokens (heredada de BERT-base) obliga a segmentar documentos largos, lo que puede fragmentar entidades y afectar a la coherencia de las anotaciones.
- Especificidad del dominio: el ajuste fino se ha realizado sobre el esquema de anotacion de BioNLP 2013 PC, por lo que las etiquetas predichas corresponden a ese esquema concreto y no a taxonomias NER biomedicas generales.
- Restricciones de licencia: la licencia es MIT, lo que en principio permite uso comercial, pero al ser un modelo de acceso restringido (gated) es necesario aceptar las condiciones de HuggingFace antes de descargarlo.
- Caveat de produccion: con 0 descargas y 0 likes, el modelo carece de validacion por parte de la comunidad; no hay evidencia publica de su calidad ni de su robustez en produccion.
- Ausencia de benchmarks: sin metricas publicadas no es posible estimar su F1 en la tarea; se recomienda evaluarlo en un conjunto de validacion propio antes de integrarlo.
- Advertencia adicional: no se documentan los hiperparametros de entrenamiento ni posibles problemas de sobreajuste al dataset de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HowML/biobert-ner-bionlp13pc-fine-tuned
- Modelo base: https://huggingface.co/dmis-lab/biobert-base-cased-v1.1
- Dataset de ajuste: https://huggingface.co/datasets/bigbio/bionlp_st_2013_pc
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web proporcionada.
