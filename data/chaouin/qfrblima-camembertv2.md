# chaouin/qfrblima-camembertv2

## Resumen

QFrBLiMa — CamemBERTv2 es un clasificador supervisado de texto en frances que distingue entre frances metropolitano (MFr) y frances de Quebec (QFr). Lo desarrolla el autor chaouin como parte del proyecto QFrBLiMa, un banco de pruebas contrastivo de marcadores linguisticos regionales, y se obtiene mediante fine-tuning del modelo base almanach/camembertv2-base. El problema que aborda es la discriminacion automatica de variedades regionales del frances, una tarea poco cubierta por los clasificadores genericos y relevante para investigacion en linguistica de corpus, normalizacion dialectal y evaluacion de sesgos regionales en modelos de lenguaje.

Arquitectonicamente es un transformer encoder tipo RoBERTa (la familia de CamemBERTv2) con 111.601.922 parametros totales, adaptado a clasificacion de secuencias con dos etiquetas. El modelo se entrena con secuencias de hasta 128 tokens y se distribuye en formato safetensors dentro del ecosistema transformers, con un tamano de repositorio de 0,4 GB. Su relevancia actual radica en que forma parte de una evaluacion comparativa de cinco clasificadores sobre un benchmark contrastivo, y en que publica resultados internos y externos con intervalos de confianza, algo poco habitual en clasificadores de variedades regionales.

La licencia es MIT, lo que permite uso comercial, aunque el autor restringe explicitamente el proposito a investigacion sobre reconocimiento linguistico regional y advierte contra el uso para inferir el origen o la identidad de personas. El corpus supervisado de entrenamiento no se redistribuye publicamente, lo que limita la reproducibilidad exacta del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (CamemBERTv2) para clasificacion de secuencias |
| Parametros totales | 111.601.922 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia usada en entrenamiento y ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fr (frances) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia RoBERTa, inicializado desde almanach/camembertv2-base y equipado con una cabeza de clasificacion de dos clases (0 = frances metropolitano, 1 = frances de Quebec). El fine-tuning se realizo sobre un corpus supervisado separado de 938.484 ejemplos, dividido en 751.288 de entrenamiento, 93.768 de validacion y 93.428 de test, equilibrado por variedad dentro de cada uno de seis generos y de cada particion. Se entrenaron tres epocas con tamano de lote efectivo de 32, tasa de aprendizaje 2e-5, longitud maxima de secuencia de 128 y semilla 42; el checkpoint de la epoca 3 se selecciono por macro-F1 de validacion.

El benchmark QFrBLiMa se uso exclusivamente para evaluacion externa, no para el fine-tuning ni para la seleccion del checkpoint. Siguiendo a Khan et al. (2026), el corpus supervisado y sus particiones no se redistribuyen publicamente. No se documentan en la informacion disponible innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o tecnicas de RLHF/DPO; se trata de un fine-tuning supervisado convencional con entropia cruzada.

## Capacidades

- Clasificacion binaria de texto en frances: asigna una puntuacion de clase 1 (QFr) y clase 0 (MFr) a cada secuencia.
- Discriminacion de marcadores linguisticos regionales entre frances metropolitano y frances de Quebec.
- Evaluacion contrastiva por pares: dada una pareja de frases equivalentes, una en cada variedad, el modelo puntua mas alto la variante de Quebec cuando acierta.
- Procesamiento por lotes con padding y truncado a 128 tokens mediante el tokenizador fast de transformers.
- Integracion con text-embeddings-inference y endpoints compatibles segun los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al frances; no se declaran otras lenguas.

## Casos de uso

- Investigacion en linguistica de corpus: el modelo permite etiquetar automaticamente fragmentos de texto como frances metropolitano o de Quebec para estudiar la distribucion de marcadores regionales en corpus escritos, con la ventaja de que publica intervalos de confianza y analisis por marcador.
- Evaluacion de sesgos regionales en sistemas NLP: puede usarse como sonda para medir si un modelo generativo o un traductor tiende a producir formas metropolitanas o quebequenses en contextos controlados.
- Normalizacion dialectal en pipelines de preprocesamiento: clasificar oraciones antes de aplicar reglas de normalizacion o de enrutar a recursos lexicos especificos de cada variedad.
- Deteccion de localizacion en contenidos editoriales: verificar si un texto dirigido al publico quebequense usa efectivamente formas regionales o si, por el contrario, ha sido neutralizado hacia el frances metropolitano.
- Benchmarking de clasificadores de variedades: el modelo sirve como una de las cinco lineas base del proyecto QFrBLiMa para comparar arquitecturas encoder en la tarea de reconocimiento contrastivo.
- Analisis de datos de encuestas o redes sociales: clasificar respuestas abiertas en frances para segmentar por variedad regional antes de analisis estadisticos, siempre con las cautelas de uso etico indicadas por el autor.
- Filtrado de datasets para entrenamiento: seleccionar subconjuntos de texto quebequense o metropolitano al construir corpus de entrenamiento para modelos de lenguaje en frances.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Macro-F1 en test interno | 97,07% |
| Precision por frase en QFrBLiMa | 57,39% |
| Macro-F1 por frase en QFrBLiMa | 54,89% |
| Precision estricta por pares en QFrBLiMa | 70,37% |
| Intervalo de confianza al 95% (precision por pares) | 65,73%–74,85% |

La evaluacion externa cubre 1.205 pares contrastivos, 241 marcadores y cinco contextos por marcador. La clasificacion por frase usa un umbral de 0,5 y el intervalo de confianza se calcula con 20.000 replicas bootstrap agrupadas por marcador linguistico. No se proporcionan resultados comparativos con otros modelos en la informacion disponible, aunque el autor indica que este clasificador es uno de cinco evaluados en el benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,45 GB solo para pesos, mas activaciones; en la practica cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- En fp16/bf16 los pesos ocupan alrededor de 0,22 GB, por lo que el modelo es desplegable en GPUs de gama baja e incluso en CPU para lotes pequenos.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4); para alto throughput, A10G, L4 o A100 con lotes grandes.
- Cabe en GPU consumer sin problema; tambien es viable en CPU con latencias de decenas de milisegundos por secuencia de 128 tokens.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference (segun los tags del repositorio) y endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp u Ollama, que no aplican de forma nativa a un encoder de clasificacion.
- No se publican datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chaouin/qfrblima-camembertv2 | 111,6 M | 128 tokens | Clasificacion MFr/QFr | MIT | Hugging Face |
| almanach/camembertv2-base | no disponible en la informacion | no disponible en la informacion | Modelo base de lenguaje frances | no disponible en la informacion | Hugging Face |
| Otros cuatro clasificadores del benchmark QFrBLiMa | no disponible | no disponible | Clasificacion MFr/QFr | no disponible | Referenciados en el repositorio GitHub del proyecto |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta destinado a investigacion sobre reconocimiento linguistico regional, no a inferir el origen o la identidad de personas; su uso para perfilado geografico o etnico es inapropiado.
- Las etiquetas de entrenamiento basadas en la fuente son proxies imperfectos del uso linguistico real; ninguna variedad implica un uso geografico exclusivo.
- La precision estricta por pares en el benchmark externo es del 70,37%, con un intervalo de confianza que llega hasta el 74,85% en el mejor caso; el rendimiento por frase cae al 57,39%, lo que indica una capacidad limitada de generalizacion fuera del dominio de entrenamiento.
- Las puntuaciones softmax no estan calibradas; no deben interpretarse como probabilidades fiables sin post-procesado.
- La alta puntuacion interna (97,07% de macro-F1) no garantiza el reconocimiento contrastivo ni la generalizacion a otros dominios o generos.
- El corpus supervisado de entrenamiento no se redistribuye y su reconstruccion exacta no ha sido verificada, lo que dificulta la reproducibilidad.
- El modelo solo procesa frances y secuencias de hasta 128 tokens; textos mas largos requieren truncado o segmentacion.
- Aunque la licencia es MIT y permite uso comercial, el autor restringe el proposito a investigacion linguistica; conviene revisar las implicaciones eticas antes de un despliegue en produccion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas en textos ambiguos o con marcadores mezclados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaouin/qfrblima-camembertv2
- Modelo base CamemBERTv2: https://huggingface.co/almanach/camembertv2-base
- Dataset QFrBLiMa: https://huggingface.co/datasets/chaouin/qfrblima
- Repositorio GitHub del proyecto: https://github.com/chaouin/QFrBLiMa
- Resultados de encoders: https://github.com/chaouin/QFrBLiMa/tree/main/results/encoders
- Documentacion del corpus de entrenamiento: https://github.com/chaouin/QFrBLiMa/tree/main/data/training_corpus
- Referencia Khan et al. (2026): https://aclanthology.org/2026.lrec-1.840/
