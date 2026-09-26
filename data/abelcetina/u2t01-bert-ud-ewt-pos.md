# abelcetina/u2t01-bert-ud-ewt-pos

## Resumen

`abelcetina/u2t01-bert-ud-ewt-pos` es un modelo de etiquetado gramatical (part-of-speech tagging, POS) en inglés, obtenido mediante ajuste fino completo de `bert-base-uncased` sobre el treebank Universal Dependencies English-EWT. Se trata de un encoder transformer de 108.904.721 parámetros (12 capas, configuración estándar de BERT base) al que se le ha añadido una cabeza lineal de clasificación de tokens que predice el conjunto de 17 etiquetas UPOS (ADJ, ADP, ADV, AUX, CCONJ, DET, INTJ, NOUN, NUM, PART, PRON, PROPN, PUNCT, SCONJ, SYM, VERB, X).

El modelo no introduce innovaciones arquitectónicas: su interés es metodológico y docente. Forma parte de la práctica universitaria U2T01, cuyo objetivo es reproducir la comparación entre adaptación basada en características (encoder congelado) y ajuste fino completo descrita en la sección 5.3 del artículo original de BERT, aplicada a cuatro tareas clásicas de PLN. En este caso se eligió el ajuste fino completo, con todos los parámetros del encoder y de la cabeza recibiendo gradientes.

Es relevante para desarrolladores e investigadores como referencia reproducible y ligera para etiquetado UPOS en inglés: se ejecuta en CPU o en cualquier GPU de consumo, publica pesos en safetensors y reporta métricas sobre las particiones oficiales de validación y test con una semilla fija (42). Su alcance está deliberadamente acotado: un único benchmark académico, una única semilla y un dominio de texto web informal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base): 12 capas, configuración estándar de `bert-base-uncased`, más cabeza lineal de clasificación de tokens |
| Parametros totales | 108.904.721 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 tokens (truncación aplicada en entrenamiento y evaluación; el encoder base admite hasta 512 posiciones, pero este modelo no se ha validado más allá de 128) |
| Tipos de cuantizacion | no disponible (el repositorio publica únicamente pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 para los pesos; los datos de entrenamiento (UD English-EWT) están bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Etiquetas de salida | 17 etiquetas UPOS de Universal Dependencies |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers (pipeline `token-classification`) |
| Modelo base | google-bert/bert-base-uncased |
| Hiperparametros de entrenamiento | 3 épocas, batch 32, LR de cabeza 0,001, LR del cuerpo 0,00002, weight decay 0,01, max seq length 128, semilla 42 |
| Ejemplos de entrenamiento | 12.544 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional estándar de tipo BERT base: 12 capas, embeddings de tokens y de posición, y una cabeza lineal de token-classification situada sobre la representación de cada token. El método de adaptación es `--method full`, es decir, ajuste fino completo: se entrenó el 100 % de los parámetros (108.904.721 de 108.904.721), sin congelar ninguna capa del encoder. Se empleó una tasa de aprendizaje pequeña para el cuerpo preentrenado (0,00002) y una mayor para la cabeza inicializada aleatoriamente (0,001), con weight decay de 0,01.

Los datos proceden del treebank UD English-EWT en sus particiones oficiales `en_ewt-ud-{train,dev,test}.conllu`, parseadas directamente desde los ficheros CoNLL-U oficiales en lugar del script de carga del Hub `universal_dependencies/UD_English-EWT` (que ya no carga con `datasets >= 4.0`). Se utilizaron 12.544 ejemplos de entrenamiento. No se documenta ningún uso de RLHF, DPO ni preferencias humanas: es un ajuste supervisado clásico sobre anotación UPOS. La innovación técnica es nula por diseño; el valor está en la reproducibilidad del protocolo y en la comparación sistemática entre tres peldaños de adaptación sobre una misma base preentrenada.

## Capacidades

- Etiquetado gramatical (POS tagging) token a token en inglés con el inventario de 17 etiquetas UPOS de Universal Dependencies.
- Clasificación de tokens con agregación de entidades/palabras mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Procesamiento de frases y documentos cortos hasta 128 tokens por secuencia; las secuencias más largas se truncan y pierden la cola, tanto en entrenamiento como en inferencia.
- Buen comportamiento en géneros de texto web informal (blogs, grupos de noticias, correo electrónico, reseñas y respuestas de preguntas), que es el dominio del treebank de entrenamiento.
- Uso como componente previo en cadenas de PLN: preanotación de corpus, extracción de patrones morfosintácticos y filtrado por categoría gramatical.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni capacidades de agente.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni generación de texto libre.
- No es multilingüe: solo inglés; el hecho de que las etiquetas sean UPOS no implica transferencia a otros idiomas.
- No está diseñado para extracción de hechos ni para responder preguntas a partir de conocimiento almacenado.

## Casos de uso

- Preanotación de corpus lingüísticos: el modelo etiqueta automáticamente cada token con su categoría UPOS y sirve como primera pasada para anotadores humanos en proyectos de lingüística computacional, reduciendo el trabajo manual antes de la revisión y el acuerdo interanotador.
- Preprocesado para pipelines de PLN: la secuencia de etiquetas POS alimenta etapas posteriores como lematización, análisis de dependencias, reconocimiento de entidades o extracción de sintagmas, ya que el inventario UPOS es un estándar compartido entre herramientas.
- Análisis de texto de opinión y comunidades online: al estar entrenado sobre géneros web, puede medir la densidad de adjetivos, adverbios y pronombres en reseñas, foros y correos, útil para estudios de estilo, registro y polaridad.
- Filtrado y búsqueda por categoría gramatical: permite aislar nombres propios como candidatos a entidades, o extraer todos los verbos de un conjunto de documentos para construir índices o glosarios terminológicos.
- Detección de errores gramaticales y de segmentación: etiquetas improbables en una posición (por ejemplo, un verbo donde se espera un determinante) pueden señalizar fallos de redacción o de tokenización en un corrector asistido.
- Investigación y docencia reproducible: reproduce la comparación entre adaptación basada en características y ajuste fino descrita en la sección 5.3 del artículo de BERT, sirviendo como implementación de referencia para prácticas de asignatura y para comparar metodologías de adaptación.
- Análisis morfosintáctico de currículos, tickets de soporte o mensajes de usuario: la segmentación por categorías permite agregar estadísticas de estilo y de contenido sin necesidad de infraestructura de GPU, al ser un modelo de 108,9 M de parámetros.
- Construcción de conjuntos de datos etiquetados a bajo coste: dado su reducido tamaño, puede desplegarse en local para etiquetar grandes volúmenes de texto en lote antes de una revisión selectiva.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las particiones oficiales del treebank:

| Particion | Loss | Accuracy | Macro F1 |
|---|---|---|---|
| Validation | 0,1058 | 0,9727 | 0,9226 |
| Test | 0,0956 | 0,9742 | 0,9324 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni cifras concretas de los modelos comparados: la model card remite a las tablas comparativas del repositorio de código acompañante (`report/results_tables.md`, tablas 1, 2.pos y 3), pero sus valores no se incluyen en los datos proporcionados. El propio autor advierte que diferencias inferiores a un punto porcentual deben interpretarse como ruido, al provenir todas las cifras de una única ejecución con semilla 42 y sin estimación de varianza.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del tamaño del modelo, no medidas publicadas): en FP32, aproximadamente 0,45 GB de pesos más activaciones; en FP16/BF16, unos 0,25 GB; en INT8, unos 0,12 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni tarjetas de gama alta. Una RTX 4090 o una T4 quedan enormemente sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060 o superiores, así como en gráficas integradas recientes con memoria compartida.
- Inferencia en CPU viable: por tamaño, se esperan latencias del orden de decenas de milisegundos por frase en hardware moderno de escritorio; esta cifra es una estimación por número de parámetros y no una medida publicada.
- Opciones de despliegue: pipeline `token-classification` de transformers (vía recomendada, tal como figura en la model card), PyTorch con pesos safetensors, exportación a ONNX para inferencia optimizada, y Hugging Face Inference Endpoints (el modelo está marcado como `endpoints_compatible`).
- llama.cpp y Ollama no son adecuados para este caso: el modelo no genera texto y su salida es una clasificación por token, no una secuencia decodificada.
- No se publican datos de throughput, latencia medida ni consumo energético (la sección de impacto ambiental de la model card aparece truncada en la información disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Accuracy / F1 | Disponibilidad |
|---|---|---|---|---|---|---|
| abelcetina/u2t01-bert-ud-ewt-pos | 108.904.721 | 128 tokens | POS tagging UPOS (17 etiquetas), inglés | apache-2.0 (pesos); datos CC BY-SA 4.0 | 0,9727 / 0,9226 (validación); 0,9742 / 0,9324 (test) | Hugging Face |
| joseeangel/bert-base-uncased-ud-ewt-pos | no disponible | no disponible | POS tagging sobre UD English-EWT (misma base y tarea, según la búsqueda web) | no disponible | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110 M (cifra estándar del modelo base; no confirmada en la información proporcionada) | 512 posiciones (estándar de BERT) | Enmascarado de lenguaje y encoder genérico; sin cabeza POS | apache-2.0 | no aplica (no realiza POS tagging) | Hugging Face |
| Modelos POS de Apache OpenNLP | no disponible | no disponible | Detección de idioma, tokenización, lematización y POS tagging; un modelo por idioma (36 idiomas) | no disponible | no disponible | Apache OpenNLP |

No se dispone de cifras de rendimiento de las alternativas en la información recogida, por lo que la comparación cuantitativa con modelos equivalentes queda como no disponible. El modelo `joseeangel/bert-base-uncased-ud-ewt-pos` aparece en los resultados de búsqueda junto al repositorio `adapting-bert-nlp-tasks` (U2T01), lo que sugiere un origen común en la misma práctica académica, pero esta relación no se confirma en los datos proporcionados.

## Limitaciones y advertencias

- Sesgo de dominio: el treebank English Web Treebank está compuesto por géneros web informales (blogs, grupos de noticias, correo, reseñas y respuestas de preguntas), con puntuación irregular, emoticonos y ortografía no estándar; la prosa formal editada está infrarrepresentada. El rendimiento fuera de ese dominio no está caracterizado y se espera que baje.
- Sesgos sociales heredados: el modelo arrastra los sesgos del corpus de preentrenamiento de `bert-base-uncased` (BookCorpus y Wikipedia en inglés), que codifica estereotipos de género, etnia y ocupación. La model card indica explícitamente que nada en este trabajo los mitiga ni los mide.
- Semilla única: todas las cifras proceden de una sola ejecución con semilla 42, sin estimación de varianza. Diferencias de aproximadamente un punto frente a otra configuración deben leerse como ruido, no como mejora.
- Truncación de secuencias: las entradas se truncaron a 128 tokens; en inferencia, cualquier texto más largo pierde la cola y los tokens finales no reciben etiqueta.
- Submuestreo del entrenamiento: se usaron 12.544 ejemplos, sin que se documente si corresponde a la partición completa de entrenamiento.
- Ausencia de evaluación de robustez: no se realizaron pruebas adversariales, de dominio cruzado ni de equidad.
- Ámbito restringido: solo inglés y solo anotación UPOS. No se debe usar para tomar decisiones que afecten a personas (contratación, moderación con consecuencias, crédito, decisiones legales o médicas), tal como advierte el autor.
- Restricción de licencia: los pesos son apache-2.0, pero los datos de entrenamiento (UD English-EWT) son CC BY-SA 4.0, por lo que la redistribución comercial requiere comprobar las obligaciones de esa licencia antes de su uso.
- Escaso respaldo de la comunidad: el modelo registra 0 descargas y 0 "likes" en el momento de la consulta, y no cuenta con validación externa independiente.
- La model card aparece truncada en la sección de impacto ambiental, por lo que no hay datos de cómputo de entrenamiento, emisiones ni eficiencia energética.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abelcetina/u2t01-bert-ud-ewt-pos
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Artículo de BERT (arXiv:1810.04805): https://arxiv.org/abs/1810.04805
- Treebank UD English-EWT: https://universaldependencies.org/treebanks/en_ewt/
- Repositorio de código de la práctica U2T01 (aparición en búsqueda web, relación no confirmada con este modelo): https://github.com/joseeangel0/adapting-bert-nlp-tasks
- Modelo homólogo encontrado en la búsqueda web: https://huggingface.co/joseeangel/bert-base-uncased-ud-ewt-pos
- Modelos POS de Apache OpenNLP: https://opennlp.apache.org/models.html
