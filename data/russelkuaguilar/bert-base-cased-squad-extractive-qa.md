# RusselKuAguilar/bert-base-cased-squad-extractive-qa

## Resumen

RusselKuAguilar/bert-base-cased-squad-extractive-qa es un modelo de respuesta a preguntas extractiva (extractive question answering) publicado por el usuario RusselKuAguilar en HuggingFace. Se trata de un ajuste fino (fine-tuning) completo de bert-base-cased sobre el conjunto de datos SQuAD v1.1 al 100 % (87.599 ejemplos de entrenamiento), con una cabecera de predicción de indices de inicio y fin sobre el encoder. El modelo no genera texto libre: localiza y devuelve el fragmento literal del contexto que responde a la pregunta formulada.

Arquitectonicamente es un transformer encoder-only de 12 capas con 768 dimensiones ocultas y 12 cabezas de atencion, con 107.721.218 parametros totales (aproximadamente 0,4 GB en el repositorio). La ventana de contexto util esta limitada a los 512 tokens de posicion heredados de bert-base-cased, y el unico idioma soportado es el ingles. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica reside en que es un componente barato y rapido para pipelines de tipo RAG extractivo: con solo 107,7 M de parametros cabe en cualquier GPU de consumo e incluso en CPU, y ofrece 80,99 % de Exact Match y 88,21 % de F1 en el conjunto de validacion de SQuAD v1.1, muy cerca de los 81,50 / 88,50 reportados en el paper original de BERT. Ahora bien, el repositorio no tiene descargas ni valoraciones, y la fecha de creacion registrada (25 de septiembre de 2026) es inconsistente, por lo que debe tratarse como un artefacto sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-base: 12 capas, 768 de dimension oculta, 12 cabezas de atencion) con cabecera de QA extractiva (logits de inicio y fin) |
| Parametros totales | 107.721.218 (aprox. 107,7 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de bert-base-cased; no se explicita en la model card) |
| Tipos de cuantizacion | No se publican pesos cuantizados. Compatible con cuantizacion dinamica INT8 via PyTorch/Optimum y con exportacion a ONNX/ONNX Runtime |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y checkpoint de PyTorch (transformers). No se publican GGUF, ONNX ni TensorRT |
| Tarea (pipeline) | question-answering |
| Modelo base | bert-base-cased |
| Dataset de entrenamiento | rajpurkar/squad (SQuAD v1.1) |
| Tamano del repositorio | 0,4 GB |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creacion registrada | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo parte de bert-base-cased, un transformer encoder-only con atencion bidireccional completa, tokenizacion WordPiece con distincion de mayusculas y minisculas (vocabulario cased) y embeddings de posicion aprendidos hasta 512 tokens. Sobre el encoder se anade la cabecera estandar de BERT para QA extractiva: una proyeccion lineal que produce dos distribuciones, una sobre la posicion de inicio y otra sobre la de fin del span de respuesta dentro del contexto. La formulacion es la clasica de Devlin et al. (2019): la entrada es el par [CLS] pregunta [SEP] contexto [SEP] y la respuesta se selecciona maximizando de forma independiente los logits de inicio y fin.

El ajuste fino se realizo sobre el 100 % de SQuAD v1.1 (87.599 ejemplos) durante 3 epocas, con optimizador AdamW (weight_decay 0,01), learning rate diferenciado de 3e-4 para la cabecera de QA y 3e-5 para el encoder BERT, scheduler de cosine annealing con un 10 % de warmup lineal y precision mixta (AMP FP16). El entrenamiento se ejecuto en una unica NVIDIA GeForce RTX 4070 Laptop GPU, lo que confirma que el coste de fine-tuning es asumible en hardware de consumo. No se documenta el tamano de batch, la semilla ni el numero total de pasos, y no hay indicios de fases posteriores de RLHF, DPO ni calibracion de abstención.

## Capacidades

- Respuesta a preguntas extractiva: dado un par (pregunta, contexto), devuelve el fragmento literal del contexto que contiene la respuesta, con logits de inicio y fin.
- Localizacion de evidencia (span detection) sobre pasajes de hasta 512 tokens en ingles.
- Funciona con la pipeline `question-answering` de HuggingFace Transformers y con `BertForQuestionAnswering`.
- Entrada multiejemplo: puede procesar lotes de pares pregunta-contexto con padding dinamico y truncation a 512 tokens.
- Capacidad monolingue estricta: solo ingles.
- No soporta generacion de texto libre, resumen, traduccion ni chat.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo "thinking", vision, audio ni multimodalidad.
- No ha sido ajustado para preguntas sin respuesta (SQuAD v2.0): no tiene clase "no answer" y siempre devuelve un span.

## Casos de uso

- Respuesta a preguntas sobre documentacion tecnica interna: indexar manuales, RFCs o guias en pasajes de menos de 512 tokens y usar el modelo para extraer la frase exacta que responde a la consulta del desarrollador, evitando que un modelo generativo parafrasee o invente procedimientos.
- Componente extractivo dentro de un pipeline RAG: un recuperador (BM25 o embeddings) selecciona los pasajes candidatos y este BERT se encarga de la fase de lectura (reader), devolviendo el span de respuesta con sus logits como puntuacion de confianza. Es la arquitectura clasica de retriever-reader y sigue siendo mas barata y trazable que un LLM para respuestas factuales cortas.
- Extraccion de campos en documentos estructurados: convertir cada campo (fecha de contrato, importe, nombre de proveedor) en una pregunta y usar el modelo para localizar el valor literal en el texto del documento, con la ventaja de que la salida es siempre una subcadena verificable del original.
- Atencion al cliente basada en FAQ: para cada consulta, recuperar el articulo de ayuda relevante y extraer la frase que responde, garantizando que la respuesta mostrada proviene literalmente del corpus aprobado por la empresa. El limite de 512 tokens obliga a trocear los articulos largos.
- Analisis de normativa y textos legales: localizar la clausula concreta que responde a una pregunta sobre un reglamento o contrato, con salida citable. Requiere segmentacion previa porque los documentos legales superan habitualmente los 512 tokens.
- Generacion de datos de anotacion debil (weak supervision): usar el modelo para preanotar spans de respuesta en corpus propios y pasarlos despues a revision humana, reduciendo el coste de etiquetado en tareas de extraccion de informacion.
- Auditoria de sistemas de recuperacion: medir si el pasaje recuperado contiene realmente la respuesta, aplicando el modelo como oraculo extractivo sobre los documentos devueltos por un buscador.
- Procesamiento por lotes offline en CPU: con 107,7 M de parametros, se puede ejecutar sobre grandes volumenes de pares pregunta-respuesta en maquinas sin GPU, algo inviable con modelos generativos de mayor tamano.

## Benchmarks y rendimiento

| Benchmark | Metrica | Este modelo | BERT-base oficial (paper) |
|---|---|---|---|
| SQuAD v1.1, validacion (10.570 ejemplos) | Exact Match (EM) | 80,99 % | 81,50 % |
| SQuAD v1.1, validacion (10.570 ejemplos) | F1 | 88,21 % | 88,50 % |

Los unicos datos de evaluacion disponibles son los que proporciona el autor en la model card. No se han publicado resultados en MMLU, HumanEval, GSM8K ni en conjuntos fuera de dominio, ni evaluaciones de robustez (SQuAD v2.0, AdversarialQA, TriviaQA o dominio). La diferencia con el paper original es de 0,51 puntos de EM y 0,29 puntos de F1 por debajo.

## Requisitos de hardware

| Precision | Peso de los pesos | VRAM recomendada (batch > 1, 512 tokens) |
|---|---|---|
| FP32 | aprox. 0,43 GB | 1-2 GB |
| FP16 / BF16 | aprox. 0,22 GB | 1-2 GB |
| INT8 | aprox. 0,11 GB | menos de 1 GB |

- Cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4070, etc.) y tambien en GPU integradas con memoria compartida.
- Inferencia en CPU perfectamente viable: el cuello de botella es la longitud del contexto (complejidad cuadratica de la atencion hasta 512 tokens), no el numero de parametros.
- GPU de datacenter (A100, H100, L40S) innecesarias para inferencia; solo tendrian sentido para servir miles de peticiones por segundo con batching agresivo o para reentrenar el modelo a escala.
- Opciones de despliegue: pipeline `question-answering` de Transformers, `BertForQuestionAnswering` en PyTorch, exportacion a ONNX / ONNX Runtime via Optimum, TorchScript, Triton Inference Server, FastAPI o Flask como envoltorio HTTP, y frameworks de QA como Haystack.
- vLLM, llama.cpp y Ollama no soportan de forma nativa la cabecera extractiva de BERT orientada a spans, por lo que no son opciones directas para este checkpoint.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, latencia p50/p99 ni comportamiento bajo batching.
- Entrenamiento reproducible en una NVIDIA RTX 4070 Laptop GPU con precision mixta FP16, segun indica el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SQuAD v1.1 (EM / F1) | Licencia |
|---|---|---|---|---|
| RusselKuAguilar/bert-base-cased-squad-extractive-qa | 107,7 M | 512 | 80,99 / 88,21 | Apache-2.0 |
| bert-base-cased (sin ajuste de QA) | aprox. 108 M | 512 | no aplica | Apache-2.0 |
| Familia BERT-large ajustada a SQuAD | aprox. 335 M | 512 | no disponible en la informacion proporcionada | Apache-2.0 |
| Modelos destilados tipo DistilBERT ajustados a SQuAD | aprox. 66 M | 512 | no disponible en la informacion proporcionada | Apache-2.0 |

Nota: los datos de las filas alternativas no proceden de la informacion proporcionada en esta busqueda y se marcan como no disponibles cuando no constan; solo se incluyen como referencia de categoria. La comparativa directa con otros checkpoints de QA extractivo publicados en HuggingFace no puede completarse sin acceso a sus fichas y resultados de evaluacion.

## Limitaciones y advertencias

- El modelo se entreno exclusivamente en SQuAD v1.1, donde todas las preguntas tienen respuesta en el contexto. No dispone de mecanismo de abstención: ante una pregunta cuya respuesta no este en el pasaje, devolvera un span arbitrario con alta probabilidad, generando respuestas incorrectas con apariencia de certeza.
- Es un modelo extractivo puro: la respuesta siempre es una subcadena del contexto. No puede parafrasear, resumir, combinar informacion de varios pasajes ni generar texto nuevo.
- Ventana de contexto de 512 tokens. Documentos largos requieren troceado previo y estrategias de agregacion entre fragmentos, lo que puede partir una respuesta por la mitad.
- Monolingue en ingles: no soporta castellano ni ningun otro idioma sin reentrenamiento.
- Modelo cased: la tokenizacion distingue mayusculas y minusculas, lo que puede afectar a texto mal normalizado o todo en mayusculas.
- Ajuste ligero por debajo del paper de referencia (80,99 EM frente a 81,50 EM). No hay evidencia de evaluacion fuera de dominio ni de robustez ante preguntas adversarias.
- Sesgos: hereda los sesgos de bert-base-cased, entrenado con BookCorpus y Wikipedia en ingles. SQuAD tiene una distribucion tematica sesgada hacia Wikipedia, por lo que el rendimiento puede degradarse en dominios especializados (medicina, derecho, jerga tecnica concreta).
- Riesgo de alucinacion en sentido estricto inexistente (no genera), pero si riesgo de respuestas erroneas por seleccion de spans erroneos, especialmente con preguntas ambiguas o contextos con varias entidades similares.
- Estado del repositorio: 0 descargas y 0 likes, sin validacion de la comunidad, sin model card extendida y con una fecha de creacion registrada (2026-09-25) incoherente con la fecha del modelo base. No se recomienda su uso en produccion sin una evaluacion propia previa.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con obligacion de conservar el aviso de licencia y el fichero de cambios. No impone restricciones de uso, pero tampoco ofrece garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RusselKuAguilar/bert-base-cased-squad-extractive-qa
- Modelo base: https://huggingface.co/bert-base-cased
- Dataset SQuAD v1.1: https://huggingface.co/datasets/rajpurkar/squad
- Paper de BERT (Devlin et al., 2019): https://arxiv.org/abs/1810.04805
- Paper de SQuAD (Rajpurkar et al., 2016): https://arxiv.org/abs/1606.05250
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada.
