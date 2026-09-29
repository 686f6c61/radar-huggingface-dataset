# MrAlexGov/it-job-title-to-skills-rubert-tiny2

## Resumen

El modelo `MrAlexGov/it-job-title-to-skills-rubert-tiny2` es un clasificador multietiqueta de extraccion de caracteristicas (feature-extraction) que, a partir del **titulo de una oferta de empleo del sector IT en ruso**, predice que **competencias tecnicas** (skills) tiende a listar el empleador en esa vacante. Lo desarrolla MrAlexGov y se publica bajo licencia MIT. Su base es el encoder `cointegrated/rubert-tiny2`, un BERT diminuto de 29,19 millones de parametros, al que se anade un mean pooling y una cabeza lineal de 1.119 salidas con activacion sigmoide y perdida BCE.

El problema que resuelve es acotado pero practico: normalizar y enriquecer catalogos de vacantes cuando solo se dispone del titulo del puesto, sin el cuerpo de la oferta. Por ejemplo, la cadena "Backend-разработчик Go" produce puntuaciones como golang 0,98, postgresql 0,54, docker 0,41, git 0,39, linux 0,27, kubernetes 0,25 y redis 0,20. La salida no es una etiqueta unica sino un vector de probabilidades sobre un vocabulario cerrado de 1.119 habilidades, lo que permite fijar un umbral o quedarse con el top_k.

Su relevancia actual es doble. Por un lado, demuestra que para titulos cortos un modelo de 29M parametros puede superar a un encoder ruso de 178M parametros (`ruBert-base`) en MAP@50 (0,394 frente a 0,383) con un coste de entrenamiento de 2,2 minutos en 2xT4. Por otro, ocupa un nicho muy concreto (mercado laboral ruso, datos de hh.ru de 2023) con soporte de exportacion a ONNX int8 para ejecucion en navegador. Su ventana de contexto es minima (max_len 32 tokens), coherente con la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (rubert-tiny2) + mean pooling + cabeza lineal multietiqueta |
| Parametros totales | 29.193.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | int8 (version ONNX `model_full_int8.onnx`); pesos fp16 y fp32 disponibles en safetensors/pytorch |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch (`head.pt`), ONNX int8 (`model_full_int8.onnx`), vocabulario `skill_vocab.json` |
| Pipeline | text-classification / multi-label-classification |
| Base model | cointegrated/rubert-tiny2 |
| Numero de etiquetas de salida | 1.119 habilidades |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 descargas, 1 like (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer pequeno (`rubert-tiny2`, 29M parametros) al que se anade mean pooling sobre las representaciones del token final y una unica capa lineal de 1.119 unidades. Cada salida se interpreta de forma independiente mediante sigmoide, con perdida binary cross-entropy: no hay softmax ni competencia entre etiquetas, de modo que pueden activarse simultaneamente tantas habilidades como indique el modelo. El entrenamiento se realizo con AdamW (learning rate 5e-5 para el encoder y 1e-3 para la cabeza), batch de 64, max_len de 32, precision fp16 y hasta 8 epocas, seleccionando el mejor checkpoint por MAP@50 sobre validacion. El coste fue de 2,2 minutos en 2xT4 (Kaggle). Se trata de un ajuste fino completo (full fine-tuning), no de LoRA ni adaptadores.

Los datos proceden de dos extracciones abiertas de hh.ru obtenidas via API de Kaggle, sin peticiones directas a hh.ru: `etietopabraham/jobs-raw-data` (abril-mayo de 2023, todas las areas, licencia CC BY 4.0, 20.360 ejemplos, filtrado por expresiones regulares sobre el titulo mas lista de palabras de parada) y `ilyazawilsiv/it-vacancies-from-headhunter-website` (septiembre-octubre de 2023, solo IT, licencia Apache-2.0, 30.669 ejemplos, 22 roles profesionales de hh). El preprocesado normaliza a minusculas, fusiona 28 sinonimos (html5 → html, js → javascript, k8s → kubernetes), elimina 71 habilidades genericas del etiquetado ("trabajo en equipo", "discurso correcto", "usuario de PC") y descarta duplicados y habilidades con menos de 30 apariciones. El resultado son 51.029 vacantes y 1.119 habilidades, con una media de 5,4 habilidades por vacante. La particion de evaluacion usa GroupShuffleSplit por titulo unico (37.457 de train y 10.156 de test), de forma que ningun titulo de test aparece en entrenamiento; esto evita que el modelo saque ventaja de memorizar titulos frecuentes.

## Capacidades

- Prediccion multietiqueta de competencias profesionales a partir exclusivamente del titulo del puesto, con puntuaciones de probabilidad por habilidad.
- Recuperacion del top_k de habilidades recomendadas para un titulo dado (funcion `recommend` de la clase `SkillRecommender`).
- Normalizacion de titulos de rol IT rusos hacia un espacio comun de 1.119 habilidades, util para taxonomias y catalogos.
- Clasificacion por umbral: el valor maximo de probabilidad bajo (< 0,3) actua como indicador de que la profesion es desconocida para el modelo.
- Inferencia en navegador mediante la version ONNX int8, sin servidor.
- Integracion con librerias estandar: transformers, safetensors, onnxruntime, text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, function calling ni razonamiento multi-paso; no es un modelo generativo ni conversacional.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito.
- Idiomaticamente limitado al ruso; no se reporta soporte multilingue.

## Casos de uso

- Enriquecimiento de ofertas de empleo en portales de empleo rusos: dado un titulo como "Data Scientist", el modelo devuelve python 0,93, aprendizaje automatico 0,62, sql 0,61, data science 0,43, pandas 0,41, numpy 0,31, analisis de datos 0,16 y estadistica matematica 0,15, lo que permite autocompletar la seccion de competencias de una vacante nueva antes de que el reclutador la edite.
- Deduplicacion y clustering de vacantes: agrupar anuncios con titulos distintos pero requisitos de habilidades similares usando el vector de 1.119 probabilidades como firma del puesto, por ejemplo para detectar que "Backend-разработчик Go" y "Go developer" comparten perfil real.
- Motor de recomendacion de ofertas a candidatos: comparar las habilidades declaradas por un candidato con las del titulo de la vacante y ordenar resultados por solapamiento en el top_k, sin necesidad de leer el cuerpo completo de la oferta.
- Analitica del mercado laboral: agregar las probabilidades por habilidad en miles de titulos para medir la prevalencia de tecnologias (por ejemplo, kubernetes frente a docker) por rol y por region, dado que la salida es un vector numerico facilmente acumulable.
- Normalizacion de taxonomias internas de RRHH: mapear titulos heterogeneos de distintas fuentes hacia un conjunto controlado de 1.119 habilidades, reduciendo el trabajo manual de categorizacion previa a la integracion en un ATS.
- Filtrado y moderacion de publicaciones: descartar o marcar ofertas cuyo titulo produce una probabilidad maxima muy baja, senal de que el puesto no encaja en el catalogo IT soportado (por ejemplo, roles nuevos de 2025 en adelante).
- Despliegue ligero en el navegador o en el borde: la version ONNX int8 permite ejecutar la recomendacion de habilidades en el cliente sin enviar datos a un servidor, util en demos interactivas o herramientas internas con requisitos de privacidad.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre el split de test por titulos unicos (10.156 ejemplos). No se han localizado otros benchmarks externos (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es generativo ni resuelve esas tareas.

| Metodo | P@5 | R@5 | P@10 | R@10 | MAP@50 |
|---|---|---|---|---|---|
| Habilidades mas populares (baseline) | 0,107 | 0,102 | 0,086 | 0,168 | 0,105 |
| kNN sobre n-gramas de caracteres TF-IDF del titulo (k=50) | 0,306 | 0,317 | 0,220 | 0,441 | 0,344 |
| ruBert-base (178M), ajuste fino | 0,336 | 0,351 | 0,242 | 0,489 | 0,383 |
| rubert-tiny2 (29M), ajuste fino (este modelo) | 0,345 | 0,363 | 0,247 | 0,500 | 0,394 |

Lectura de los resultados segun el autor: la mejora sobre el baseline kNN es del 14% en MAP@50; el encoder de 178M no supera al de 29M; y el P@5 de 0,35 implica que, en promedio, 1,7 de cada 5 habilidades sugeridas aparecen literalmente en la vacante concreta, cifra que actua como cota inferior de la utilidad real porque distintos empleadores detallan conjuntos de habilidades diferentes para el mismo puesto. Se documenta ademas una primera version (un solo origen de datos y habilidades genericas en las etiquetas) con MAP@50 de 0,322 en tiny2 frente a 0,290 del kNN.

## Requisitos de hardware

- VRAM estimada para inferencia: entorno de 117 MB en fp32 (29,19M parametros x 4 bytes), unos 58 MB en fp16 y alrededor de 29 MB en int8 con el grafo ONNX completo.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer sirve. Se entreno en 2xT4 (Kaggle) y la inferencia cabe holgadamente en una GTX 1050, RTX 3060 o superior.
- Compatibilidad con hardware de consumo: si, cabe en CPU y en cualquier GPU consumer, e incluso en el navegador con la version ONNX int8.
- Opciones de despliegue: transformers (PyTorch), onnxruntime, transformers.js en navegador, text-embeddings-inference y endpoints compatibles. No es un modelo adecuado para vLLM ni TGI en su configuracion tipica de generacion, ya que es un encoder de clasificacion.
- Latencia y throughput: no disponible. El unico dato de coste publicado es el entrenamiento (2,2 minutos en 2xT4 para hasta 8 epocas), no la latencia de inferencia ni peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MAP@50 (test por titulo unico) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rubert-tiny2 + cabeza de skills (este modelo) | 29M | 32 tokens | 0,394 | MIT | HuggingFace, ONNX int8, demo en Space |
| cointegrated/rubert-base | 178M | Mayor que 32 tokens (no especificado en la ficha) | 0,383 (ajustado por el autor) | No indicada en la informacion disponible | HuggingFace |
| kNN TF-IDF de n-gramas de caracteres (k=50) | No aplica | No aplica | 0,344 | No aplica | Baseline reproducible |
| Baseline de habilidades mas populares | No aplica | No aplica | 0,105 | No aplica | Baseline trivial |

Los dos ultimos no son modelos neuronales sino baselines reproducibles. No se dispone de comparacion con otros clasificadores de habilidades publicados para ruso o para otros idiomas en la informacion proporcionada, por lo que la comparativa se limita a los datos de la propia model card.

## Limitaciones y advertencias

- Datos de 2023: los roles nuevos no se reconocen. El ejemplo documentado es "Especialista en prompt engineering", que produce ms excel 0,22, ms powerpoint 0,18 y celebracion de contratos 0,15. Para roles de IA de 2025 en adelante hacen falta datos frescos.
- La probabilidad maxima baja (por debajo de 0,3) es un indicador de titulo desconocido, pero no existe una calibracion formal publicada que garantice ese umbral.
- La seleccion de vacantes IT por expresion regular en una de las fuentes es imperfecta; parte del ruido persiste en el vocabulario de habilidades.
- Algunos sinonimos no se fusionaron (react, react.js y react/redux se tratan como entradas distintas), lo que fragmenta las probabilidades.
- La probabilidad estimada refleja la probabilidad de que la habilidad aparezca listada en la vacante, no su importancia ni su peso relativo en el puesto.
- El modelo refleja los requisitos de los empleadores en hh.ru (mercado ruso) y no el mercado laboral en general; extrapolar a otras geografias o a portales distintos puede degradar los resultados.
- Riesgo de alucinacion en sentido estricto: no aplica porque no genera texto, pero si puede producir recomendaciones plausibles y erroneas con titulos ambiguos o poco frecuentes.
- Sesgos potenciales derivados de la distribucion del dataset de 2023 (sectores sobrerrepresentados, terminologia de la epoca, posible desequilibrio entre roles).
- Licencia MIT: permite uso comercial y modificacion. Conviene verificar de forma independiente las licencias de los datasets de origen (CC BY 4.0 y Apache-2.0) si se redistribuyen los datos, aunque el modelo publicado es MIT.
- Contexto de 32 tokens: no es posible introducir descripciones de puesto, solo el titulo. Cualquier intento de pasar un texto mas largo exigira truncarlo o reentrenar con mayor max_len.
- Solo ruso: no hay soporte multilingue declarado, por lo que usarlo con titulos en castellano o ingles dara resultados poco fiables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrAlexGov/it-job-title-to-skills-rubert-tiny2
- Demo en navegador (Space, ONNX sin servidor): https://huggingface.co/spaces/MrAlexGov/it-job-title-to-skills
- Repositorio de codigo en GitHub: https://github.com/MrAlexGov/it-job-title-to-skills
- Dataset: https://huggingface.co/datasets/MrAlexGov/it-job-title-skills-ru
- Fuente de datos 1: https://www.kaggle.com/datasets/etietopabraham/jobs-raw-data
- Fuente de datos 2: https://www.kaggle.com/datasets/ilyazawilsiv/it-vacancies-from-headhunter-website
- Modelo base: https://huggingface.co/cointegrated/rubert-tiny2
