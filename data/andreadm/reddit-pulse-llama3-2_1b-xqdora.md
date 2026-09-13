# andreadm/reddit-pulse-llama3.2_1b-xqdora

## Resumen

reddit-pulse-llama3.2_1b-xqdora es un clasificador de tres clases (subida / neutral / bajada) de expectativas direccionales de inflacion en textos cortos en ingles sobre economia. Lo desarrolla el autor identificado como andreadm y consiste en un adaptador PEFT de tipo xQDoRA+ montado sobre meta-llama/Llama-3.2-1B, con la base cuantizada en 4 bits NF4 y adaptadores DoRA sobre las proyecciones de atencion entrenados con tasas de aprendizaje LoRA+.

El modelo no es un analizador de sentimiento: la etiqueta describe la direccion del nivel de precios que el texto afirma o sugiere, no el tono de la noticia. Asi, "inflation falls sharply" se etiqueta como down y "rents are out of control" como up. Resuelve el problema de etiquetar grandes volumenes de titulares y comentarios informales para construir un indicador de alta frecuencia de expectativas de inflacion mediante agregacion temporal.

Es relevante porque es uno de los clasificadores de modelo pequeno que alimentan la senal de inflacion a partir de Reddit del trabajo de Del Monaco, Longo, Marcucci y Tafani (2026), publicado como Occasional Paper de Banca d'Italia y aceptado en el Journal of Applied Econometrics. La model card enlaza el codigo de ajuste fino e inferencia en el repositorio andrea-dm/reddit-pulse. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B) con cabeza de clasificacion de secuencia de 3 clases y adaptadores DoRA sobre las proyecciones de atencion |
| Parametros totales | Aproximadamente 1.000 millones en el modelo base (denominacion Llama-3.2-1B); el autor no detalla la cifra exacta ni el numero de parametros del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada por el autor. El ejemplo de uso trunca a 1024 tokens y el ajuste fino se realizo sobre titulares de longitud corta (mediana de 11 palabras, maximo 52) |
| Tipos de cuantizacion | Base cargada en 4 bits NF4 con doble cuantizacion (bitsandbytes, bnb_4bit_compute_dtype=torch.bfloat16); los pesos del adaptador se distribuyen en safetensors y no se detalla su precision |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base meta-llama/Llama-3.2-1B cuantizado en 4 bits |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-1B, un transformer decoder-only, reutilizada aqui como clasificador: se anade una cabeza de clasificacion de secuencia con tres etiquetas (id 0 = down, id 1 = neutral, id 2 = up, con codificacion -1 / 0 / +1 en los ficheros de corpus del articulo). El ajuste se realiza mediante un adaptador xQDoRA+, descrito en la model card como DoRA sobre las proyecciones de atencion combinado con tasas de aprendizaje LoRA+, partiendo de una base cuantizada en 4 bits NF4 con doble cuantizacion. Los adaptadores se guardan como pesos PEFT y el repositorio incluye un config.json con la cabeza de tres clases, los nombres de las etiquetas y el token de padding, de modo que no hace falta pasar argumentos adicionales aparte del nombre del repositorio.

El entrenamiento se hizo sobre titulares de Reddit procedentes de r/economy, r/Economics y r/wallstreetbets, relativos a la inflacion en Estados Unidos y con cobertura temporal de 2008 a 2022. La funcion de perdida se balanceo por clase durante el entrenamiento, dado el desbalance del conjunto de referencia. La model card no indica el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; el modelo es un clasificador supervisado, no un modelo generativo ajustado por preferencias.

## Capacidades

- Clasificacion direccional de expectativas de inflacion en tres clases: up, neutral y down, a partir de un texto corto en ingles.
- Distincion explicita entre direccion del nivel de precios y sentimiento o postura del autor: no mide si la noticia es buena o mala ni si el autor desea el movimiento.
- Procesamiento por lotes de titulares y frases cortas con truncado configurable (el ejemplo usa max_length=1024).
- Etiquetado a gran escala de textos informales de economia: titulares de Reddit, comentarios y publicaciones de redes sociales.
- Integracion como bloque de senal agregada: el valor del modelo procede de promediar miles de predicciones por periodo, no de predicciones individuales.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, y no esta planteado para razonamiento multi-paso ni para uso agentico.
- Capacidad multilingue: no disponible; el modelo esta declarado unicamente para ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision, audio ni decodificacion especulativa.

## Casos de uso

- Construccion de indicadores de alta frecuencia de expectativas de inflacion: se etiquetan en lote todos los titulares de un subreddit en una ventana temporal y se agrega la proporcion de etiquetas up, neutral y down para obtener una serie diaria o semanal. Es el caso de uso del articulo y el unico validado por el autor.
- Nowcasting y forecasting macroeconomico: la serie agregada se incorpora como regresor en modelos de prediccion de inflacion, tal y como describe el trabajo de Del Monaco y coautores, aprovechando la anticipacion temporal de los foros frente a las encuestas tradicionales.
- Monitorizacion para bancos centrales y departamentos de analisis: seguimiento continuo de la narrativa de precios en redes sociales como complemento a encuestas de expectativas, siempre con la cautela de que se trata de un indicador derivado y no de una medida directa.
- Investigacion de mercado en finanzas: analisis del discurso de precios en comunidades como r/wallstreetbets para estudiar como la narrativa de inflacion se relaciona con movimientos de mercado, agregando las etiquetas por periodo en lugar de interpretar casos individuales.
- Etiquetado masivo para generacion de datos de supervision debil: uso del clasificador para anotar corpus economicos de gran tamano que despues alimenten el entrenamiento de modelos mayores o de otros clasificadores, asumiendo el ruido de las etiquetas individuales.
- Filtrado y enrutado en pipelines de noticias economicas: descartar de un flujo de titulares aquellos que no contienen senal direccional (neutral) y dirigir los que si la contienen a modulos de analisis mas costosos.
- Analisis academico en economia computacional y NLP financiero: estudiar la evolucion de la narrativa de precios en foros estadounidenses entre 2008 y 2022 con una taxonomia reproducible y etiquetas codificadas de forma explicita.
- Vigilancia de precios para empresas y consultoras: seguimiento de la percepcion publica sobre la direccion de los precios en sectores concretos, tratando la salida como tendencia agregada y no como lectura de casos aislados.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados, verified: false), sobre el conjunto de referencia Reddit inflation gold set, particion de test reservada de la semilla 1245093080.

| Metrica | Valor |
|---|---|
| Accuracy | 0,7122 |
| F1 weighted | 0,7104 |
| F1 macro | 0,6646 |
| ROC-AUC macro (one-vs-rest) | 0,8678 |

Tarea: clasificacion direccional de expectativas de inflacion (up / neutral / down), tipo text-classification. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: del orden de 0,6 a 0,8 GB para la base de aproximadamente 1.000 millones de parametros en 4 bits NF4; estimacion propia, no facilitada por el autor.
- VRAM recomendada en la practica: a partir de 4 GB, contando activaciones, la doble cuantizacion, la cabeza de clasificacion y lotes de contexto moderado; estimacion propia, no confirmada por el autor.
- GPU compatibles: cabe en practicamente cualquier GPU de consumo con al menos 4 GB, como una GTX 1650 de 4 GB, una RTX 3050, una RTX 4060 o una RTX 4090. Tambien es viable en GPUs de datacenter como A100 o H100, aunque sobredimensionadas para este tamano.
- La ruta documentada usa bitsandbytes en 4 bits con device_map="auto", orientada a GPU NVIDIA. No se documenta un camino de inferencia en CPU ni en aceleradores no CUDA.
- Opciones de despliegue: transformers junto con peft y bitsandbytes, replicando el snippet de la model card. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son aplicables sin conversion previa, y al tratarse de un adaptador con cabeza de clasificacion de tres clases no se puede servir como modelo generativo en vLLM o TGI sin trabajo adicional.
- Carga correcta: no se debe pasar el nombre del repositorio directamente a AutoModelForSequenceClassification, porque el atajo de adaptadores de transformers reconstruye el adaptador DoRA con logits distintos a los del modelo entrenado. Hay que cargar la base con la configuracion de cuantizacion y montar despues el adaptador con PeftModel.from_pretrained.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Resultados comparables |
|---|---|---|---|---|---|
| reddit-pulse-llama3.2_1b-xqdora | Aproximadamente 1.000 millones (adaptador sobre base de 4 bits) | No especificado; truncado a 1024 en el ejemplo | Clasificacion de 3 clases de expectativas de inflacion (en) | llama3.2 | Accuracy 0,7122; F1 macro 0,6646; ROC-AUC 0,8678 |
| meta-llama/Llama-3.2-1B (base) | Aproximadamente 1.000 millones | El autor no lo especifica en esta ficha | Generacion de texto en ingles; no es un clasificador de inflacion | llama3.2 | No disponible para esta tarea |
| Clasificadores encoder de dominio financiero (por ejemplo, variantes de FinBERT o RoBERTa-base) | Del orden de 100 a 350 millones, segun variante | No disponible | Analisis de sentimiento financiero, no clasificacion direccional de inflacion | Variable segun variante | No disponible |

## Limitaciones y advertencias

- Predicciones individuales ruidosas: el autor indica explicitamente que el valor del modelo procede de promediar miles de predicciones por periodo; no debe usarse una etiqueta aislada como conclusion.
- Dominio y registro limitados: entrenado con titulares de r/economy, r/Economics y r/wallstreetbets sobre inflacion en Estados Unidos entre 2008 y 2022. Otros paises, otros registros y vocabulario posterior a 2022 quedan fuera de distribucion.
- Desbalance de clases: la clase down es la minoria del conjunto de referencia y la mas dificil; aunque la perdida se balanceo durante el entrenamiento, el recall de down sigue siendo inferior.
- Textos cortos: el ajuste se hizo sobre titulares con mediana de 11 palabras y maximo de 52; los comentarios largos se truncan y no fueron vistos durante el entrenamiento.
- Mide direccion, no postura ni sentimiento: no informa de si el autor desea el movimiento de precios ni de si la noticia es buena o mala.
- Idioma unico: declarado solo para ingles, sin capacidades multilingues documentadas.
- Metricas no verificadas: los resultados de la model card figuran con verified: false, es decir, son cifras declaradas por el autor y no comprobadas de forma independiente.
- Alcance funcional: es un clasificador de secuencia, no un modelo generativo; no soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- Licencia: se aplica la Llama 3.2 Community License, que impone obligaciones de atribucion y condiciones de uso aceptable; conviene revisar los terminos antes de un uso comercial. El acceso al repositorio del modelo base en HuggingFace suele requerir aceptar previamente su licencia.
- Estado del repositorio: sin descargas ni likes, con un tamano de repositorio de 0,0 GB y sin seccion de limitaciones completa, ya que la propia model card advierte que el texto de limitaciones es generico y que el desglose por clase no se genera automaticamente.
- La busqueda web realizada no devolvio resultados relacionados con este modelo; los unicos enlaces utiles son los que figuran en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreadm/reddit-pulse-llama3.2_1b-xqdora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Codigo de ajuste fino e inferencia de corpus completo: https://github.com/andrea-dm/reddit-pulse
- Articulo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026). Reddit's 'pulse' on US inflation: forecasting with large language models. Journal of Applied Econometrics, en prensa.
- Version de documento de trabajo: Banca d'Italia, Questioni di Economia e Finanza (Occasional Papers) n.o 1028, junio de 2026, doi:10.32057/0.QEF.2026.1028
- Resultados de busqueda web: sin resultados relevantes sobre este modelo.
