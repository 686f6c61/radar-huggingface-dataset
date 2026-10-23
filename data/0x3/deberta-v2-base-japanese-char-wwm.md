# 0x3/deberta-v2-base-japanese-char-wwm

## Resumen

El modelo `0x3/deberta-v2-base-japanese-char-wwm` es un encoder DeBERTa V2 en su variante base, preentrenado con objetivos de masked language modeling (MLM) sobre texto en japones. Lo desarrolla originalmente el grupo de procesamiento de lenguaje natural de la Universidad de Kioto (ku-nlp), y esta ficha corresponde a una resubida realizada por el usuario `0x3` en HuggingFace, sin descargas ni validacion independiente registradas. Su particularidad frente a otros BERT japoneses es la tokenizacion a nivel de caracter con enmascaramiento de palabra completa (whole word masking, WWM), lo que reduce el vocabulario a 22.012 tokens y elimina practicamente los tokens `[UNK]` sobre texto japones.

El modelo resuelve el problema de disponer de una representacion contextual preentrenada para japones que no dependa de un segmentador morfologico externo en tiempo de inferencia: el texto bruto se pasa directamente al tokenizer y este lo divide en caracteres, mientras que el enmascaramiento a nivel de palabra se aplica solo durante el preentrenamiento mediante segmentacion con Juman++ 2.0.0-rc3. Con 121.669.624 parametros, es un modelo de tamano contenido que se puede afinar y desplegar en hardware modesto.

Es relevante ahora por dos motivos: por un lado, sigue siendo una base solida y barata para tareas discriminativas en japones (NER, clasificacion, QA extractiva) donde un LLM generativo resulta sobredimensionado; por otro, la tokenizacion por caracteres lo hace especialmente robusto ante ruido tipografico, texto de redes sociales y salidas de OCR o ASR con errores de segmentacion. La ventana de contexto es de 512 tokens, correspondiente a la longitud maxima usada en el preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa V2 variante base (transformer encoder con attention disentangled y enhanced mask decoder); numero de capas y dimension oculta no detallados en la model card |
| Parametros totales | 121.669.624 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (max_seq_length de preentrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se distribuyen versiones GGUF, ONNX ni cuantizadas de forma oficial) |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors y PyTorch (bin); libreria transformers |
| Tamano del repositorio | 1,0 GB |
| Vocabulario | 22.012 tokens (SentencePiece, nivel de caracter) |
| Token de mascara | `[MASK]` |
| Pipeline | fill-mask |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de la familia DeBERTa V2 en variante base, que introduce dos cambios respecto a BERT: atencion disentangled, donde el contenido y la posicion relativa de cada token se codifican en vectores separados y se combinan en la matriz de atencion, y un enhanced mask decoder que reinyecta informacion de posicion absoluta antes de predecir los tokens enmascarados. La model card no desglosa el numero de capas ni la dimension oculta; la denominacion "base" remite a la configuracion estandar de DeBERTa V2. Sobre esta base, el autor sustituye el vocabulario original por uno japones de 22.012 tokens construido con SentencePiece, pensado para cubrir todos los caracteres presentes en el corpus de entrenamiento.

El preentrenamiento uso tres corpus japoneses: Wikipedia en japones (estado a 20 de octubre de 2022; 3,2 GB, 27 millones de frases, 1,3 millones de documentos), la porcion japonesa de CC-100 (85 GB, 619 millones de frases, 66 millones de documentos) y la porcion japonesa de OSCAR (54 GB, 326 millones de frases, 25 millones de documentos), tras filtrar los documentos etiquetados como "header", "footer" o "noisy". Wikipedia se duplico 10 veces para equilibrar el volumen, dando un corpus total de 171 GB. El enmascaramiento de palabra completa se genero segmentando previamente el texto con Juman++ 2.0.0-rc3, de modo que el segmentador solo interviene en la construccion de los datos y no en la inferencia.

El entrenamiento se hizo con la libreria transformers durante 20 dias en 8 GPU NVIDIA A100-SXM4 de 40 GB, con learning rate 2e-4, batch total de 2.208 secuencias, 320.000 pasos, 10.000 pasos de warmup, max_seq_length de 512 y scheduler lineal con decaimiento hasta learning rate 0 en el paso 500.000. No hay fases de instruccion, SFT, RLHF ni DPO: es un modelo exclusivamente de modelado de lenguaje enmascarado. El trabajo conto con apoyo del proyecto JHPCN jh221004 y se ejecuto sobre la plataforma mdx.

## Capacidades

- Relleno de mascaras (fill-mask) en japones con el token `[MASK]`, incluida la prediccion de varias posiciones contiguas.
- Tokenizacion a nivel de caracter sobre texto bruto, sin necesidad de preprocesado ni segmentacion morfologica, lo que evita tokens fuera de vocabulario.
- Enmascaramiento de palabra completa durante el preentrenamiento, lo que favorece representaciones a nivel de palabra aunque la unidad de entrada sea el caracter.
- Extraccion de representaciones contextuales para clasificacion de secuencias (sentimiento, topicos, moderacion) mediante fine-tuning con cabeza de clasificacion.
- Etiquetado de secuencias para NER y chunking, afinando el encoder con una cabeza token-classification.
- Question answering extractiva en japones si se anade una cabeza de span prediction y se afina sobre un dataset como JEMHopQA o SQuAD-ja.
- Base para sentence embeddings y busqueda semantica mediante fine-tuning contrastivo o mean pooling (no entrenado para ello de serie).
- Afinado para reranking y similitud semantica de pares de frases.
- No soporta tool calling, function calling ni razonamiento multi-paso agentico.
- No soporta generacion de texto libre, vision ni audio.
- Capacidad multilingue: no, exclusivamente japones.

## Casos de uso

- Reconocimiento de entidades nombradas en japones: se anade una cabeza token-classification y se afina sobre corpus como Wikipedia NER o Stockmark-NER; la tokenizacion por caracteres mantiene alineadas las etiquetas incluso con nombres propios fuera de vocabulario.
- Clasificacion de documentos y triaje de tickets en japones: fine-tuning con unas pocas miles de etiquetas por clase sobre textos de hasta 512 tokens, con coste de inferencia muy inferior al de un LLM generativo equivalente en calidad para la tarea.
- Moderacion de contenido generado por usuarios en japones: el encoder procesa texto ruidoso de redes sociales sin segmentador externo, lo que simplifica el pipeline de preprocesado y reduce los fallos por errores ortograficos o jerga.
- Relleno asistido y correccion en herramientas de edicion japonesa: dado un fragmento con `[MASK][MASK]`, el modelo propone candidatos lexicos, util para autocompletado de plantillas, normalizacion de formularios o generacion de variantes controladas.
- Aumento de datos para entrenamiento de modelos japoneses: enmascarar tokens de un corpus y usar las predicciones de mayor probabilidad como sustituciones produce paraphrasing lexico supervisado sin necesidad de un modelo generativo.
- Extraccion de informacion en pipelines documentales con OCR: al trabajar por caracteres, tolera mejor los errores de reconocimiento tipico de escaneos y se puede afinar para extraer campos concretos de facturas o contratos en japones.
- Recuperacion semantica en bases de conocimiento japonesas: afinando con un objetivo contrastivo, las representaciones del encoder sirven para indexar y recuperar pasajes en un motor vectorial, con un coste de embedding bajo (121,7 M de parametros).
- Analisis de opiniones y encuestas en japones: clasificacion multietiqueta de resenas o respuestas abiertas, con despliegue en CPU para volumenes altos si la latencia lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara `accuracy` como metrica en los metadatos, pero no incluye ningun valor numerico ni evaluacion sobre tareas downstream (JGLUE, NER, QA). Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16 y 0,13 GB en int8 para los pesos; con batch de 32 secuencias de 512 tokens en fp16 el consumo realista ronda 2-4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas para fine-tuning ligero; A100, H100 o L4 para preentrenamiento o fine-tuning con batches grandes. Una RTX 4090 permite fine-tuning completo con batch efectivo alto sin problemas.
- Cabe en GPU de consumo: si, en GTX 1650, RTX 3060, RTX 4060 y superiores. Tambien es viable en CPU para inferencia por lotes con throughput moderado.
- Opciones de despliegue: transformers con PyTorch, exportacion a ONNX Runtime, TorchScript, o conversiones a GGUF mediante herramientas de terceros (no se distribuyen pesos GGUF oficiales). Inferencia por lotes con `TextClassificationPipeline` o `FillMaskPipeline`.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 1,0 GB; los pesos en fp32 suponen unos 487 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0x3/deberta-v2-base-japanese-char-wwm (esta ficha) | 121,7 M | 512 | Caracter + WWM, vocab 22.012 | CC BY-SA 4.0 | HuggingFace, resubida con 0 descargas |
| ku-nlp/deberta-v2-base-japanese | no disponible | no disponible | Nivel de palabra (Juman++/JumanDic) | no disponible en la informacion proporcionada | HuggingFace, modelo original del mismo grupo |
| tohoku-nlp/bert-base-japanese | no disponible (BERT base) | no disponible | Nivel de palabra (MeCab/IPAdic) | no disponible en la informacion proporcionada | HuggingFace, ampliamente usado en JGLUE |
| tohoku-nlp/bert-base-japanese-char | no disponible (BERT base) | no disponible | Caracter, sin WWM | no disponible en la informacion proporcionada | HuggingFace |

La diferencia practica frente a las alternativas de nivel de palabra es que la tokenizacion por caracteres elimina la dependencia de un diccionario morfologico en produccion y reduce el riesgo de `[UNK]`, a costa de secuencias mas largas en tokens para el mismo texto. Frente a las variantes de caracter de BERT, la incorporacion de whole word masking aporta una senal de supervisio mas cercana al nivel de palabra. No se dispone de resultados de benchmarks que permitan comparar la calidad de estas alternativas en este documento.

## Limitaciones y advertencias

- Modelo exclusivamente japones: no generaliza a otros idiomas ni a texto mixto japones-ingles de forma fiable.
- Solo masked language modeling: no genera texto libre ni mantiene conversaciones; usarlo como generador requiere cabezas adicionales y fine-tuning.
- Ventana de contexto de 512 tokens, insuficiente para documentos largos sin troceado previo.
- Corpus de entrenamiento basados en web (CC-100 y OSCAR, 140 GB de los 171 GB totales): riesgo de sesgos sociales, vocabulario ofensivo y contenido de baja calidad filtrado solo parcialmente.
- Uso enciclopedico sobrerrepresentado: Wikipedia se duplico 10 veces, lo que puede sesgar el modelo hacia registros formales y estilo enciclopedico en tareas de dominio general.
- Riesgo de alucinacion en sentido estricto bajo, por no ser generativo, pero las predicciones de fill-mask pueden producir contenido inapropiado o factualmente incorrecto si se presentan como completaciones.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y aplica share-alike sobre obras derivadas; conviene revisar con asesoria legal el alcance del share-alike sobre pesos afinados antes de distribuirlos.
- La ficha corresponde a una resubida de un tercero (`0x3`) con 0 descargas y 0 likes; el codigo de ejemplo de la model card apunta al repositorio original `ku-nlp/deberta-v2-base-japanese-char-wwm`. Para produccion, verificar los pesos contra el repositorio original.
- No hay versiones cuantizadas ni ONNX oficiales, lo que anade trabajo de conversion si se necesita desplegar en runtimes ligeros.
- Ausencia de benchmarks publicados para esta resubida: no se puede afirmar su rendimiento en JGLUE u otras tareas sin evaluacion propia.

## Enlaces

- Modelo en HuggingFace (resubida): https://huggingface.co/0x3/deberta-v2-base-japanese-char-wwm
- Modelo original del grupo ku-nlp: https://huggingface.co/ku-nlp/deberta-v2-base-japanese-char-wwm
- Paper de DeBERTa V2: https://arxiv.org/abs/2006.03654
- Repositorio de Juman++: https://github.com/ku-nlp/jumanpp
- Release de Juman++ 2.0.0-rc3: https://github.com/ku-nlp/jumanpp/releases/tag/v2.0.0-rc3
- SentencePiece: https://github.com/google/sentencepiece
- Corpus CC-100: https://data.statmt.org/cc-100/
- Corpus OSCAR: https://oscar-project.org/
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores provienen de la model card y de referencias tecnicas conocidas, no de los resultados de busqueda.
