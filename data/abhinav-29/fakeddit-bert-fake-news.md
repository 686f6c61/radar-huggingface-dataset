# abhinav-29/fakeddit-bert-fake-news

## Resumen

El modelo `abhinav-29/fakeddit-bert-fake-news` es un clasificador binario de texto (real/fake) construido a partir de DistilBERT y afinado sobre una submuestra balanceada del corpus Fakeddit. Lo publica el usuario abhinav-29 en HuggingFace, sin paper asociado ni repositorio de codigo enlazado, y con licencia MIT. Su tarea es determinar si un titular corto en ingles tiene un estilo propio de noticia falsa o de noticia convencional, a partir de titulares de Reddit. La etiqueta no procede de verificacion humana por afirmacion, sino del esquema de supervision distante de Fakeddit (subreddit de origen), y el propio autor lo advierte de forma explicita en la model card.

Tecnicamente es un transformer encoder de tamano pequeno: 66.955.010 parametros (aproximadamente 67 millones) en formato safetensors, con un repositorio de 0,3 GB. Se trata de una destilacion de BERT-base, con limite arquitectonico de 512 tokens, aunque el entrenamiento y el ejemplo de uso del autor truncan a 64 tokens porque solo se trabaja con titulares. La innovacion metodologica declarada no esta en la arquitectura, sino en el procedimiento de seleccion: se compararon candidatos `bert-base-uncased` y `distilbert-base-uncased` con 3 semillas cada uno, se eligio el checkpoint por F1 de validacion (mejor epoca: 4) y se aplico calibracion post-hoc por temperature scaling (T = 1,1099).

Su relevancia es acotada pero clara: sirve como componente de triaje barato para moderacion o filtrado previo de titulares, no como verificador de hechos. Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, publicado en septiembre de 2026, y su utilidad real depende de aceptar sus limites: ingles, titulares cortos, 5.000 ejemplos de entrenamiento y etiquetas ruidosas por construccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilado de BERT-base) con cabeza de clasificacion de secuencias |
| Parametros totales | 66.955.010 (~67 M, dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens como maximo arquitectonico de DistilBERT; el ejemplo de uso del autor trunca a 64 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors sin cuantizar; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Numero de clases | 2 (real / fake) |
| Tamano del repositorio | 0,3 GB |
| Dataset de entrenamiento | fakeddit (submuestra balanceada, 5.000 ejemplos) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de 6 capas con atencion bidireccional completa, derivado de DistilBERT mediante destilacion de conocimiento de BERT-base, al que se anade una cabeza lineal de clasificacion para dos clases. No hay mecanismos de atencion lineal, SSM ni decodificacion especulativa: es un clasificador discriminativo estandar, con una sola pasada hacia delante por secuencia y sin generacion autoregresiva.

El entrenamiento parte de los TSV oficiales de train/validate/test de Fakeddit, que el autor agrupa y vuelve a dividir (por lo que advierte que sus resultados no son directamente comparables con articulos que usan el split de test oficial). El corpus se balancea a 2.500 ejemplos por clase y se reparte en 3.500 de entrenamiento, 500 de validacion y 1.000 de test, de forma estratificada. Se afinan candidatos `bert-base-uncased` y `distilbert-base-uncased` con 3 semillas cada uno, se selecciona el checkpoint por F1 de validacion (mejor epoca: 4) y el conjunto de test se evalua exactamente una vez. Despues se ajusta una calibracion post-hoc por temperature scaling (Guo et al., 2017) sobre los logits de validacion, con T = 1,1099, que reduce el ECE de test de 0,0813 a 0,0656. No se documenta uso de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador. El checkpoint finalmente publicado es el de DistilBERT, pese a que la comparativa multi-semilla del propio autor otorga a BERT-base una precision ligeramente superior.

## Capacidades

- Clasificacion binaria de titulares: devuelve dos logits (real/fake) que, divididos por 1,1099 y pasados por softmax, dan una confianza calibrada.
- Deteccion de estilo sensacionalista o clickbait en titulares cortos en ingles, aprendida del subreddit de origen en Fakeddit.
- Inferencia muy rapida y de bajo coste, apta para CPU o GPU de gama baja, dado su tamano de 67 M de parametros.
- Confianza calibrada utilizable para umbralizar decisiones (el autor reporta ECE de 0,0656 tras calibrar).
- Procesamiento por lotes de grandes volumenes de titulares, ya que el coste por secuencia es muy bajo frente a un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso, uso de herramientas ni memoria de conversacion: no es un modelo instructivo ni de chat.
- No tiene capacidades multimodales (ni vision ni audio), pese a que el dataset original de Fakeddit es multimodal.
- No soporta otros idiomas distintos del ingles, ni siquiera de forma no declarada.
- No genera texto: la unica salida es la distribucion de probabilidad sobre dos clases.

## Casos de uso

- Moderacion de foros y comunidades tipo Reddit: clasificar titulares de nuevos envios y derivar a revision humana los que superen un umbral de probabilidad de "fake". La coincidencia de dominio (titulares de Reddit en ingles) es exactamente la distribucion de entrenamiento.
- Triaje previo en plataformas de verificacion: usar el modelo como primer filtro sobre colas grandes de contenido y reservar a los verificadores humanos y a modelos mayores solo las piezas ambiguas o de alta probabilidad.
- Filtrado de titulares en agregadores de noticias: descartar o marcar automaticamente titulares con estilo clickbait antes de mostrarlos, con un coste de computo minimo por elemento.
- Analisis a escala para investigacion en desinformacion: etiquetar corpus historicos de titulares de Reddit para estudiar la evolucion temporal del estilo sensacionalista, aprovechando el throughput elevado del modelo.
- Etiquetado debil para construir datasets: usar las salidas como pre-etiquetas que luego se revisan, reduciendo el coste de anotacion manual en proyectos de NLP.
- Servicio de inferencia en edge o en instalaciones sin GPU: los 67 M de parametros permiten desplegar el modelo en CPU dentro de un contenedor pequeno, con latencias compatibles con una API sincrona de baja concurrencia.
- Educacion mediatica o herramientas internas de redaccion: senalar a un periodista que su titular se parece estilisticamente a los titulares de la clase "fake" antes de publicar.
- Alerta temprana con confianza calibrada: al disponer de probabilidades calibradas, se puede fijar un umbral operativo (por ejemplo, derivar a revision solo por encima de 0,9) y ajustar el compromiso entre precision y volumen de revision.

## Benchmarks y rendimiento

Resultados del conjunto de test retenido (evaluado una sola vez), segun la model card:

| Metrica | Valor |
|---|---|
| Accuracy | 0,7980 |
| F1 (weighted) | 0,7975 |
| Precision (weighted) | 0,8013 |
| Recall (weighted) | 0,7980 |
| ECE (calibrado) | 0,0656 |
| ECE (sin calibrar) | 0,0813 |

Comparativa multi-semilla (media +/- desviacion tipica sobre 3 semillas), aportada por el autor:

| Modelo | Accuracy | F1 |
|---|---|---|
| bert-base-uncased | 0,7983 +/- 0,0078 | 0,7982 +/- 0,0079 |
| distilbert-base-uncased | 0,7897 +/- 0,0125 | 0,7885 +/- 0,0134 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, SuperGLUE u otros) en la informacion disponible. Las metricas anteriores corresponden exclusivamente a la tarea binaria de Fakeddit y a un split propio re-dividido, no al split oficial del dataset.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 268 MB solo para pesos (66,9 M x 4 bytes), mas activaciones; con lotes pequenos el consumo total se mantiene por debajo de 1 GB.
- VRAM estimada en fp16: en torno a 134 MB para pesos; en int8 seria aproximadamente 67 MB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: no requiere GPU de centro de datos. Cualquier GPU consumer moderna (RTX 2060, RTX 3060, RTX 4090) es sobradamente suficiente; para servicio de alto volumen tienen mas sentido T4, L4 o A10 por eficiencia energetica que una A100 o H100.
- Cabe en cualquier GPU consumer e incluso en GPU integradas y en CPU. La inferencia en CPU es viable para cargas moderadas.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y el pipeline `text-classification`, exportacion a ONNX con Optimum y ejecucion con ONNX Runtime, TorchScript, TensorRT, y servidores tipo FastAPI, TorchServe o BentoML. La model card solo documenta el uso directo con `transformers`.
- Latencia y throughput: no disponible. El autor no publica mediciones. Como referencia orientativa no oficial, un encoder de 67 M de parametros suele procesar lotes de decenas o cientos de secuencias por segundo en GPU moderna y decenas por segundo en CPU, pero esta cifra no esta respaldada por la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en la misma receta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abhinav-29/fakeddit-bert-fake-news (DistilBERT) | 66,9 M | 512 tokens (64 en el ejemplo de uso) | 0,7897 +/- 0,0125 | MIT | HuggingFace, safetensors |
| bert-base-uncased afinado por el mismo autor | ~110 M | 512 tokens | 0,7983 +/- 0,0078 | MIT (modelo base) | No publicado como checkpoint separado en la informacion disponible |
| DistilBERT base sin afinar | 66,9 M | 512 tokens | no disponible | Apache 2.0 | HuggingFace |
| Otros clasificadores de desinformacion (DeBERTa-v3, RoBERTa-large, modelos multimodales sobre Fakeddit) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoria (DeBERTa-v3, RoBERTa, aproximaciones multimodales al propio Fakeddit) no esta disponible en la informacion proporcionada: la model card solo compara con BERT-base bajo su misma receta. Cabe senalar que, en esa comparacion interna, el checkpoint publicado (DistilBERT) rinde por debajo de BERT-base en accuracy y F1, a cambio de ser aproximadamente un 40 % mas pequeno y mas rapido.

## Limitaciones y advertencias

- No es un verificador de hechos. Las etiquetas provienen de supervision distante (el subreddit de origen en Fakeddit), no de verificacion humana afirmacion por afirmacion. El modelo aprende estilo de titular, no veracidad de la afirmacion.
- Sesgo de dominio: entrenado solo con titulares cortos de Reddit en ingles. No esta probado con articulos completos, otros idiomas ni afirmaciones posteriores a la recoleccion de datos de Fakeddit.
- Sesgo de fuente: al derivar las etiquetas del subreddit de origen, el modelo puede capturar correlaciones espurias asociadas a comunidades concretas, su vocabulario y sus convenciones de escritura.
- Tamano de datos reducido: 5.000 ejemplos es una submuestra pequena y rebalanceada del corpus completo de Fakeddit (2.500 por clase), lo que limita la generalizacion.
- Divisicion propia de datos: el autor reagrupa y vuelve a dividir los TSV oficiales, por lo que los resultados no son comparables con articulos que usan el split de test oficial de Fakeddit.
- La calibracion reduce la sobreconfianza media (ECE de 0,0813 a 0,0656), pero no corrige la correccion por ejemplo: una probabilidad calibrada de 0,9 no implica que ese caso concreto este bien clasificado.
- Longitud practica muy corta: el ejemplo de uso trunca a 64 tokens, adecuado para titulares pero insuficiente para parrafos o documentos.
- Seleccion de checkpoint discutible: se publica la variante DistilBERT pese a que BERT-base obtiene mejor media en la comparativa multi-semilla del propio autor (0,7983 frente a 0,7897 de accuracy).
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no hay garantia de idoneidad para decisiones de alto impacto. No debe usarse como unico criterio para censurar, moderar o desinformar.
- Modelo sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin revision por pares ni evaluacion independiente.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto libre), pero si existe riesgo de falsos positivos y falsos negativos sistematicos con confianza alta, especialmente fuera de la distribucion de Reddit.
- Fecha de publicacion poco habitual en los metadatos (creado y actualizado el 11 de septiembre de 2026), dato a tener en cuenta al evaluar su vigencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhinav-29/fakeddit-bert-fake-news
- Dataset Fakeddit (sitio del proyecto): https://fakeddit.netlify.app/
- Referencia del dataset: Nakamura, K., Levy, S., & Wang, W. Y. (2020). r/Fakeddit: A New Multimodal Benchmark Dataset for Fine-grained Fake News Detection. Proceedings of LREC 2020.
- Referencia de la calibracion empleada: Guo et al. (2017), On Calibration of Modern Neural Networks (citada en la model card, sin enlace directo).
- La busqueda web realizada no devolvio enlaces relevantes al modelo ni a Fakeddit: los resultados obtenidos correspondian a paginas administrativas del sitio de la Agencia Tributaria italiana (area riservata), sin relacion con el modelo. No se dispone de paper, blog, repositorio de codigo ni demo adicionales.
