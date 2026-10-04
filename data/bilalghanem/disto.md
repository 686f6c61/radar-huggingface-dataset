# bilalghanem/DISTO

## Resumen

DISTO (Distractor Evaluation for Multiple-Choice Reading Comprehension) es un modelo de evaluación automática de la calidad de los distractores en preguntas de comprensión lectora de opción múltiple. Lo desarrolla Bilal Ghanem, del Departamento de Ciencias de la Computación de la Universidad de Alberta, junto con Alona Fyshe, y se presentó en la 17.ª International Conference on Educational Data Mining (EDM 2024). El problema que resuelve es específico pero importante en el ámbito educativo: dado un artículo, una pregunta, la respuesta correcta y hasta tres distractores, el modelo devuelve una puntuación en el rango [0, 1] que indica hasta qué punto esos distractores resultan plausibles en el contexto. No necesita distractores de referencia, lo que evita depender de anotaciones humanas.

Técnicamente es un ajuste fino de `distilroberta-base` con una cabeza de regresión de salida única (`RobertaForSequenceClassification`, `num_labels=1`), a la que se aplica una sigmoide sobre el logit para obtener la puntuación final. El modelo tiene 82.124.545 parámetros, una longitud máxima de 512 tokens y se distribuye con licencia Apache 2.0. Se trata de un modelo denso, pequeño y de propósito muy concreto: no genera texto ni ejecuta instrucciones, solo puntúa.

Su relevancia actual viene del auge de la generación automática de preguntas mediante modelos de lenguaje. Los LLM producen preguntas de opción múltiple con facilidad, pero generan distractores poco plausibles, triviales o equivalentes a la respuesta correcta. DISTO funciona como métrica aprendida y como filtro de reranking en esas tuberías, y en el artículo original correlaciona a nivel de Pearson 0,81 con valoraciones humanas de Turk (Amazon Mechanical Turk) sobre distractores reales y muestreados negativamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (`RobertaForSequenceClassification` sobre `distilroberta-base`) con cabeza de regresion de salida unica (`num_labels=1`) y sigmoide aplicada externamente |
| Parametros totales | 82.124.545 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (solo se trunca el articulo, que va al final de la secuencia) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos safetensors en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 0,3 GB |

## Arquitectura y entrenamiento

DISTO parte de `distilroberta-base`, un encoder transformer de 6 capas y 82,1 millones de parametros, al que se anade una cabeza de clasificacion con una unica salida numerica. Sobre ese logit se aplica una sigmoide que no forma parte del grafo del modelo: el paso hay que hacerlo manualmente en inferencia (`torch.sigmoid(model(**inputs).logits)`). El tokenizador incorpora siete tokens especiales que estructuran la entrada: `[QUES]`, `[ANS]`, `[DIS1]`, `[DIS2]`, `[DIS3]`, `[ART]` y `[EMPT]`. El formato esperado es `[QUES] pregunta [ANS] respuesta [DIS1] d1 [DIS2] d2 [DIS3] d3 [ART] articulo`, con el articulo siempre al final porque es la unica parte que se trunca al superar los 512 tokens. Los distractores ausentes se rellenan con `[EMPT]`; el escenario de distractor unico del articulo coloca un distractor en `[DIS1]` y `[EMPT]` en los otros dos huecos.

El entrenamiento se hizo con perdida MSE y optimizador AdamW, tasa de aprendizaje 3e-5, tamano de lote 20 y parada temprana basada en la perdida de validacion. Los datos provienen de CosmosQA, DREAM, MCScript, MCTest, QuAIL, RACE y SciQ. La innovacion metodologica clave esta en la construccion de muestras negativas para el muestreo negativo: los buenos distractores reciben objetivo 1, mientras que los negativos se generan copiando la respuesta correcta, tomando un distractor aleatorio, seleccionando el punto mas lejano del cluster de k-means del distractor original o reescribiendo un distractor mediante relleno de `[MASK]` con BERT. No se reporta en la informacion disponible el uso de RLHF ni DPO, algo coherente con un modelo de regresion y no generativo.

## Capacidades

- Puntuacion de plausibilidad de distractores: devuelve un valor continuo en [0, 1] para un conjunto de hasta tres distractores dado un articulo, una pregunta y la respuesta correcta.
- Puntuacion agregada y por distractor: la API del paquete `disto` ofrece `score()` para puntuar el conjunto completo en una sola pasada y `score_each()` para puntuar cada distractor individualmente y promediar, tal como se hace en el articulo.
- Funcionamiento sin distractores de referencia: no requiere un conjunto de distractores anotados ni comparaciones contra candidatos externos.
- Modo de distractor unico: admite el escenario de un solo distractor rellenando los otros dos huecos con el token `[EMPT]`.
- Deteccion de distractores degenerados: segun la model card, un distractor que copia la respuesta o que es completamente ajeno al contexto obtiene puntuaciones cercanas a 0,01.
- Clasificacion de texto en el sentido de la libreria transformers (`pipeline_tag: text-classification`), aunque la salida real es una regresion escalar.
- No soporta generacion de texto, tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades multimodales (vision o audio).
- Capacidad multilingue: no; solo se ha probado en ingles.
- Capacidad de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Filtrado de distractores generados por LLM en plataformas de e-learning: tras generar preguntas de opcion multiple con un modelo generativo, DISTO puntua cada terna de distractores y descarta automaticamente los que caen por debajo de un umbral, reduciendo la revision manual antes de publicar el ejercicio.
- Reranking en tuberias de generacion automatica de preguntas: los sistemas que producen varios candidatos de distractor por pregunta pueden ordenarlos con DISTO y quedarse con los tres mejores, usando la puntuacion como senal de seleccion.
- Control de calidad de bancos de preguntas existentes: pasar un banco ya anotado por el modelo permite localizar items con distractores anomalos (por ejemplo, copias de la respuesta correcta) y priorizar su revision editorial.
- Evaluacion comparativa de generadores de distractores: la propia model card indica correlaciones de Pearson entre 0,28 y 0,75 frente a valoraciones humanas sobre distractores producidos por cinco modelos generadores, lo que permite usar DISTO como metrica automatica en experimentos de NLP educativo.
- Tutoria adaptativa y practica personalizada: en un sistema que reescribe ejercicios segun el nivel del estudiante, DISTO valida que los nuevos distractores sigan siendo plausibles y no triviales antes de mostrarlos.
- Anotacion asistida de corpus educativos: en lugar de pedir a anotadores humanos que puntuen cada terna de distractores, se pre-puntua con DISTO y la revision humana se concentra en los casos de puntuacion intermedia o dudosa.
- Investigacion en NLP educativo y reproducibilidad: replicar los experimentos del articulo de EDM 2024, comparar estrategias de muestreo negativo o estudiar la correlacion entre juicio humano y metricas aprendidas.
- Filtrado por lotes en canalizaciones de datos: al ser un modelo de 82 millones de parametros, permite procesar conjuntos grandes de preguntas en CPU o en una GPU modesta, integrándose como paso de validacion en un pipeline de datos.

## Benchmarks y rendimiento

Los datos disponibles en la model card y en el articulo se refieren a correlacion con juicios humanos y error absoluto medio, no a benchmarks generativos tipo MMLU o HumanEval, que no aplican a este modelo.

| Metrica | Valor | Conjunto |
|---|---|---|
| MAE | 0,0286 | Split de test reservado de la publicacion (66.322 instancias) |
| Correlacion de Pearson | 0,966 | Split de test reservado de la publicacion (66.322 instancias) |
| Correlacion de Pearson con valoraciones de Amazon Mechanical Turk | 0,81 | Distractores reales y muestreados negativamente |
| Correlacion de Pearson con valoraciones de Amazon Mechanical Turk | entre 0,28 y 0,75 | Distractores generados por cinco modelos de generacion de distractores |

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K en la informacion disponible, y no serian pertinentes para un modelo de regresion sobre distractores.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 0,33 GB solo para los pesos (82,1 M de parametros), mas el consumo del tokenizador y de las activaciones de la secuencia de 512 tokens.
- VRAM estimada en FP16/BF16: alrededor de 0,16 GB de pesos. La cuantizacion a int8 reduciria los pesos a unos 0,08 GB, aunque la model card no documenta pesos cuantizados ni recetas de cuantizacion.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB de VRAM o menos.
- Inferencia en CPU perfectamente viable: por tamano y arquitectura, es un modelo apto para servir en CPU sin GPU dedicada.
- GPU de datacenter como A100 o H100 solo tendrian sentido para procesar lotes muy grandes en paralelo, no por requisitos de memoria del modelo.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `AutoTokenizer`, el paquete oficial `disto` (`pip install git+https://github.com/bilalghanem/DISTO.git`), Text Embeddings Inference (el modelo esta etiquetado como compatible con `text-embeddings-inference` y con endpoints), y exportacion a ONNX o TorchScript para servir en produccion. `vLLM` y `llama.cpp` estan orientados a modelos generativos y no son la via natural para este modelo de clasificacion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota operativa importante: el widget de inferencia del Hub no construye el formato de entrada `[QUES] ... [ART] ...` ni aplica la sigmoide, por lo que las puntuaciones que muestra no son validas. Hay que usar el paquete `disto` o `transformers` directamente.

## Comparativa con modelos similares

No se dispone de resultados numericos comparables de otras metricas aprendidas de evaluacion de distractores en la informacion proporcionada. La comparativa se limita a la relacion con su modelo base y con alternativas de escala similar, sin datos de rendimiento sobre esta tarea.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DISTO (bilalghanem/DISTO) | 82,1 M | 512 tokens | Regresion sobre calidad de distractores (salida en [0, 1]) | apache-2.0 | HuggingFace, safetensors, 0 descargas y 0 likes en el momento de la consulta |
| distilroberta-base (modelo base) | 82,1 M | 512 tokens | Modelo de lenguaje enmascarado y encoder generico | apache-2.0 | HuggingFace |
| RoBERTa-base | 125 M | 512 tokens | Encoder generico, base habitual para ajustes de clasificacion | MIT | HuggingFace |
| Otras metricas automaticas de evaluacion de distractores | no disponible | no disponible | Evaluacion de distractores | no disponible | Recogidas en encuestas del area (por ejemplo, la survey de BEA 2025), sin tabla comparativa numerica en la informacion consultada |

## Limitaciones y advertencias

- La puntuacion refleja coherencia con el contexto aprendida a partir de conjuntos de comprension lectora en ingles; la propia model card advierte de que no sustituye la revision de un educador.
- El acuerdo entre anotadores humanos en esta tarea es solo moderado: el articulo reporta un kappa de Fleiss de 0,45, lo que marca un techo practico a la correlacion alcanzable con el juicio humano.
- Solo se ha probado en ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Admite como maximo tres distractores por pregunta; escenarios con mas opciones no estan contemplados.
- La sigmoide no forma parte del modelo: si se consume via `transformers` sin aplicarla, la salida es un logit sin normalizar, no una probabilidad. Esto puede inducir a errores graves si se interpreta directamente.
- El widget de inferencia del Hub no construye el formato de entrada requerido ni aplica la sigmoide, por lo que sus resultados no son fiables.
- La truncacion a 512 tokens afecta en la practica al articulo, que va al final de la secuencia; articulos largos pierden contexto y la puntuacion puede degradarse sin aviso.
- El modelo esta entrenado sobre conjuntos de comprension lectora de dominio relativamente amplio (CosmosQA, DREAM, MCScript, MCTest, QuAIL, RACE, SciQ), lo que no garantiza su comportamiento en dominios muy especializados (medicina, derecho, documentacion tecnica) sin validacion previa.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto; el riesgo equivalente es una puntuacion mal calibrada fuera de la distribucion de entrenamiento.
- Seleccion de umbral: la model card proporciona ejemplos (~0,99 para distractores plausibles y ~0,01 para casos degenerados), pero no fija umbrales operativos; hay que calibrarlos con datos propios.
- Uso comercial: la licencia apache-2.0 lo permite sin restricciones relevantes, siempre que se conserve el aviso de licencia y se cite el articulo segun practica academica.
- Adopcion muy baja: 0 descargas y 0 likes en el momento de la consulta, y el repositorio se creo sin historial previo, por lo que el soporte de la comunidad es practicamente inexistente.
- Las fechas de creacion y actualizacion del repositorio (2026-10-04) son posteriores a la publicacion del articulo (2024), lo que sugiere una subida tardia o una fecha anomala en el registro del Hub; conviene verificar la version de los pesos antes de usarlos en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bilalghanem/DISTO
- Codigo fuente: https://github.com/bilalghanem/DISTO
- Articulo (EDM 2024): https://www.educationaldatamining.org/edm2024/proceedings/2024.EDM-long-papers.1/2024.EDM-long-papers.1.pdf
- DOI del articulo: https://doi.org/10.5281/zenodo.12729766
- PDF del articulo incluido en el repositorio (referenciado en la model card): DISTO_EDM2024.pdf
- Encuesta sobre generacion de distractores en tareas de opcion multiple: https://arxiv.org/html/2402.01512v2
- Encuesta sobre evaluacion automatica de distractores en tareas de opcion multiple (BEA 2025): https://aclanthology.org/2025.bea-1.5.pdf
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
