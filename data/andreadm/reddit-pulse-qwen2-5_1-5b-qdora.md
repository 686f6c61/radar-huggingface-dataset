# andreadm/reddit-pulse-qwen2.5_1.5b-qdora

## Resumen

reddit-pulse-qwen2.5_1.5b-qdora es un adaptador PEFT de tipo QDoRA+ (DoRA con tasas de aprendizaje LoRA+) montado sobre Qwen/Qwen2.5-1.5B en 4 bits NF4, que resuelve una tarea muy concreta: clasificar textos cortos en ingles sobre economia en tres categorias direccionales de expectativas de inflacion (sube, neutro, baja). No es un modelo generativo ni un analizador de sentimiento: la etiqueta describe hacia donde se dice que van los precios, no si la noticia es buena o mala. Lo desarrolla andreadm como parte del proyecto reddit-pulse y es uno de los clasificadores de modelo pequeno que alimentan la senal de inflacion de Reddit descrita en Del Monaco, Longo, Marcucci y Tafani (2026), en el Journal of Applied Econometrics y en el documento ocasional n.o 1028 del Banco de Italia.

Su relevancia es metodologica: demuestra que un adaptador de bajo rango sobre un modelo de 1,5 mil millones de parametros, cuantizado a 4 bits, es suficiente para etiquetar volumenes masivos de titulares informales y construir un indicador de alta frecuencia agregando miles de predicciones por periodo. El modelo no esta pensado como oraculo por prediccion individual, sino como un componente de un pipeline de medicion.

Se distribuye bajo licencia Apache-2.0, solo en ingles, con pesos en safetensors para la libreria peft, y su repositorio ocupa 0,0 GB porque contiene unicamente el adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 (modelo base) con adaptador DoRA sobre las proyecciones de atencion y cabeza de clasificacion de 3 clases |
| Parametros totales | Aproximadamente 1,5 mil millones en el modelo base; el adaptador ocupa unos pocos megabytes (el repositorio declara 0,0 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B segun su documentacion publica; el ejemplo de uso del autor trunca a 1.024 tokens |
| Tipos de cuantizacion | Base cargada en 4 bits NF4 con doble cuantizacion (bitsandbytes), computo en bfloat16; el adaptador se aplica en precision completa |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se descarga por separado desde Qwen/Qwen2.5-1.5B |

## Arquitectura y entrenamiento

El modelo es un adaptador QDoRA+ sobre Qwen/Qwen2.5-1.5B, un transformer decoder-only con atencion por consultas agrupadas (GQA) y embeddings atados. El autor describe la configuracion exacta: base cuantizada en 4 bits NF4 con doble cuantizacion, adaptadores DoRA sobre las proyecciones de atencion y tasas de aprendizaje LoRA+. La cabeza de clasificacion es de tres clases (down / neutral / up) y viene definida en el config.json del repositorio junto con los nombres de las etiquetas y el token de padding, de modo que no hace falta pasar argumentos adicionales al cargarla.

Los datos de entrenamiento son titulos de envios de Reddit (r/economy, r/Economics y r/wallstreetbets) sobre inflacion en Estados Unidos, correspondientes al periodo 2008-2022. La mediana de longitud es de 11 palabras y el maximo observado es de 52, por lo que se trata de un corpus de texto muy corto y de registro informal. El conjunto de referencia empleado para evaluar es el Reddit inflation gold set del articulo citado, con particion de test reservada de la semilla 2565555162. La perdida se balanceo por clase durante el entrenamiento; no se documenta en la informacion disponible el numero total de titulos etiquetados, la composicion exacta del conjunto de entrenamiento ni si se aplicaron fases de RLHF o DPO (no procede en una tarea de clasificacion supervisada). El codigo de ajuste fino e inferencia sobre el corpus completo esta en el repositorio andrea-dm/reddit-pulse.

## Capacidades

- Clasificacion de texto: asigna una de tres etiquetas direccionales (down = -1, neutral = 0, up = 1) a textos cortos en ingles sobre economia e inflacion.
- Distincion entre direccion y sentimiento: identifica la direccion del nivel de precios con independencia de la carga positiva o negativa del mensaje.
- Procesamiento por lotes: el ejemplo del autor clasifica listas de textos con padding y truncado, lo que permite etiquetar corpus grandes de forma eficiente.
- Contexto util de hasta 1.024 tokens en el uso documentado, muy por encima de la longitud de los titulares para los que fue entrenado.
- No realiza generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento de multiples pasos.
- No tiene capacidades multilingues: solo ingles.
- No incorpora modo de razonamiento (thinking mode), vision ni audio.
- La salida util es un logit por clase y una etiqueta argmax; el autor no documenta calibracion ni probabilidades agregadas mas alla del ROC-AUC reportado.

## Casos de uso

- Construccion de un indicador de alta frecuencia de expectativas de inflacion: es el uso previsto en el articulo; se etiquetan miles de titulares por periodo y se agrega la senal direccional en el tiempo, de modo que los errores idiosincraticos se compensan entre si.
- Nowcasting macroeconomico: alimentar modelos de prediccion con una serie temporal diaria o semanal derivada de las etiquetas, aprovechando que el modelo procesa texto informal que no aparece en encuestas oficiales.
- Etiquetado de corpus a gran escala en investigacion economica: clasificar archivos de titulares y comentarios para estudios de narrativas de inflacion, con coste de inferencia minimo al caber en una GPU de consumo.
- Filtrado de flujo en tiempo real: integrarlo en un pipeline que descarte o marque publicaciones relevantes para precios antes de pasarlas a un analista humano o a un modelo mayor.
- Analisis de percepcion de precios para equipos de producto o comunicacion: monitorizar como se percibe la evolucion de precios de un sector en foros y redes, entendiendo la limitacion de que el modelo esta entrenado sobre Reddit estadounidense.
- Generacion de caracteristicas para modelos de prediccion financiera: usar la etiqueta como variable explicativa en modelos de regresion o de series temporales que combinan datos de encuestas con senal de redes sociales.
- Investigacion metodologica: servir de punto de comparacion para estudiar el rendimiento de adaptadores DoRA cuantizados frente a ajuste fino completo en tareas de clasificacion corta.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index del repositorio (ninguno verificado de forma independiente). El conjunto de evaluacion es la particion de test del Reddit inflation gold set de Del Monaco, Longo, Marcucci y Tafani (2026), semilla 2565555162.

| Metrica | Valor |
|---|---|
| Accuracy | 0,6835 |
| F1 (weighted) | 0,6834 |
| F1 (macro) | 0,6426 |
| ROC-AUC (macro, one-vs-rest) | 0,7692 |

No se han publicado en la informacion disponible resultados desglosados por clase ni comparaciones con otros clasificadores sobre el mismo conjunto de test.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,0 GB; los pesos efectivos son unos pocos megabytes.
- La base cuantizada en 4 bits NF4 con doble cuantizacion ocupa aproximadamente 1-1,5 GB de peso en memoria (estimacion a partir del tamano del modelo base de 1,5 mil millones de parametros).
- Estimacion de VRAM para inferencia con lotes pequenos o moderados: del orden de 2 a 4 GB, incluyendo activaciones y cache de atencion con secuencias truncadas a 1.024 tokens.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y tarjetas con 4-6 GB de VRAM o mas. Tambien es viable en CPU, aunque con mayor latencia.
- Despliegue documentado: transformers + peft + bitsandbytes, cargando el adaptador con PeftModel.from_pretrained sobre AutoModelForSequenceClassification.
- No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp en la informacion disponible; estos motores estan orientados a modelos causales y no al camino de clasificacion con PeftModel descrito por el autor.
- Latencia y throughput concretos: no disponible.
- Aviso de implementacion: no se debe pasar el nombre del repositorio directamente a AutoModelForSequenceClassification, porque el atajo de adaptadores de transformers reconstruye el adaptador DoRA con logits distintos a los del modelo entrenado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reddit-pulse-qwen2.5_1.5b-qdora | Base de 1,5 B mas adaptador DoRA | 32.768 tokens (base); 1.024 en el uso documentado | Clasificacion direccional de inflacion en 3 clases | Apache-2.0 | HuggingFace, libreria peft |
| Qwen/Qwen2.5-1.5B | 1,5 B | 32.768 tokens | Modelo de lenguaje causal | Apache-2.0 | HuggingFace; no realiza esta tarea sin ajuste |
| ProsusAI/finbert | Aproximadamente 110 M (BERT-base) | 512 tokens segun su documentacion publica | Analisis de sentimiento financiero | Apache-2.0 | HuggingFace; esquema de etiquetas distinto (positivo/negativo/neutro), no comparable directamente |
| Otros clasificadores del mismo articulo | No disponible | No disponible | Clasificacion direccional de inflacion | No disponible | No disponible en la informacion proporcionada |

No se dispone de cifras de benchmarks comparables entre estas alternativas en la informacion proporcionada, dado que los esquemas de etiquetas y los conjuntos de evaluacion no coinciden.

## Limitaciones y advertencias

- Las predicciones individuales son ruidosas: el valor del modelo procede de promediar miles de predicciones por periodo; no conviene fiarse de una sola etiqueta.
- Dominio y registro restringidos: entrenado sobre titulares de r/economy, r/Economics y r/wallstreetbets acerca de la inflacion estadounidense entre 2008 y 2022. Otros paises, otros registros y vocabulario posterior a 2022 quedan fuera de distribucion.
- Desbalance de clases: down es la clase minoritaria del conjunto de referencia y la mas dificil; aunque la perdida se balanceo durante el entrenamiento, la recuperacion de esa clase sigue siendo inferior.
- Textos cortos: el ajuste se hizo sobre titulares con una mediana de 11 palabras y un maximo de 52. Los comentarios largos se truncan y no fueron vistos durante el entrenamiento.
- Mide direccion, no postura ni sentimiento: no indica si el autor desea que la inflacion suba o baje, ni si la noticia es buena o mala.
- Unico idioma soportado: ingles. No hay capacidades multilingues declaradas.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento fuera del caso de uso previsto (agregacion de senal).
- Riesgo de alucinacion no aplicable en el sentido generativo: el modelo no produce texto libre, pero si puede asignar etiquetas erroneas con alta confianza en textos fuera de distribucion.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados; no deben tratarse como validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreadm/reddit-pulse-qwen2.5_1.5b-qdora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de codigo: https://github.com/andrea-dm/reddit-pulse
- Articulo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026), "Reddit's 'pulse' on US inflation: forecasting with large language models", Journal of Applied Econometrics, en prensa.
- Version de trabajo: Banca d'Italia, Questioni di Economia e Finanza (Occasional Papers) n.o 1028, junio de 2026, doi:10.32057/0.QEF.2026.1028
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas de soporte de Microsoft y no guardan relacion con la ficha.
