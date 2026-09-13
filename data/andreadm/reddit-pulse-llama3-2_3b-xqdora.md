# andreadm/reddit-pulse-llama3.2_3b-xqdora

## Resumen

reddit-pulse-llama3.2_3b-xqdora es un clasificador de tres clases (subida, bajada, neutral) de expectativas direccionales de inflación sobre textos cortos e informales en inglés. No es un modelo de generación, sino un adaptador PEFT entrenado sobre el checkpoint base meta-llama/Llama-3.2-3B (3,2 mil millones de parametros, transformer decoder-only) para resolver una tarea de text-classification. Lo desarrolla andreadm y forma parte, segun la propia model card, de la familia de clasificadores pequenos que alimentan la señal de inflación de Reddit del trabajo de Del Monaco, Longo, Marcucci y Tafani (2026).

La innovación principal no está en la arquitectura base, sino en el esquema de ajuste: xQDoRA+, es decir, adaptadores DoRA (weight-decomposed low-rank adaptation) sobre las proyecciones de atención, tasas de aprendizaje LoRA+ y una base cuantizada a 4 bits en NF4 con doble cuantización mediante bitsandbytes. El modelo predice si el texto afirma que los precios van hacia arriba, hacia abajo o sin señal direccional, una distinción ortogonal al sentimiento: "inflation falls sharply" es una buena noticia pero se etiqueta como bajada.

Su relevancia es metodológica y aplicada: sirve como bloque de construcción para indicadores de alta frecuencia de expectativas de inflación, agregando miles de predicciones por periodo en lugar de depender de una única etiqueta. El repositorio es de 0,0 GB, no tiene descargas ni likes registrados y su licencia es llama3.2, con soporte exclusivo de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-3B) con cabecera de clasificación de secuencia de 3 clases y adaptadores DoRA sobre las proyecciones de atención |
| Parametros totales | 3,2 mil millones (modelo base Llama-3.2-3B); numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base (Llama-3.2-3B); el adaptador se entrena e infiere con truncacion a 1.024 tokens (max_length del ejemplo oficial) |
| Tipos de cuantizacion | Base cargada en 4 bits NF4 con doble cuantizacion (bitsandbytes, bnb_4bit_compute_dtype=bfloat16); adaptador distribuido en su precision original. No se publican versiones GGUF ni AWQ/GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT); libreria peft |
| Tarea (pipeline) | text-classification |
| Etiquetas | down (id 0, codificacion -1), neutral (id 1, codificacion 0), up (id 2, codificacion +1) |
| Modelo base | meta-llama/Llama-3.2-3B (relacion: adapter) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre Llama-3.2-3B, un transformer decoder-only de 3,2 mil millones de parametros. La cabeza de clasificacion es de tres vias (down / neutral / up) y el config.json del repositorio incluye los nombres de las etiquetas y el token de relleno, de modo que no hace falta pasar argumentos adicionales. El ajuste fino emplea QDoRA+/xQDoRA+: adaptadores DoRA en las proyecciones de atencion combinados con tasas de aprendizaje LoRA+, partiendo de la base cuantizada a 4 bits NF4 con doble cuantizacion.

Segun la model card, los datos de entrenamiento son titulos de los subreddits r/economy, r/Economics y r/wallstreetbets sobre inflación en Estados Unidos entre 2008 y 2022. Los textos de entrenamiento son cortos (mediana de 11 palabras, maximo 52), lo que define el regimen de uso previsto. La perdida se balanceo por clase durante el entrenamiento, aunque la clase down sigue siendo la minoria del conjunto gold y la mas dificil. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; al ser una tarea de clasificacion, lo previsible es un ajuste supervisado con perdida de entropia cruzada balanceada.

## Capacidades

- Clasificacion de texto en tres clases direccionales sobre inflación: up, neutral y down.
- Discriminacion direccional frente a sentimiento: identifica hacia donde se afirma que van los precios, no si la noticia es buena o mala ni la postura del autor.
- Procesamiento de textos cortos e informales en inglés: titulares, titulos de Reddit y publicaciones breves de redes sociales.
- Etiquetado a gran escala para su posterior agregacion temporal (construccion de indicadores de alta frecuencia).
- Compatibilidad con el ecosistema HuggingFace transformers + peft + bitsandbytes, con carga en 4 bits y device_map automatico.
- Inferencia por lotes con relleno a la izquierda (padding_side = "left") y truncacion configurable.
- No soporta generacion de texto: el checkpoint es una cabeza de clasificacion, no un modelo instructivo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo ingles.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Nowcasting de expectativas de inflación: el modelo etiqueta miles de titulares de Reddit por periodo y la serie agregada de proporciones up/neutral/down se usa como entrada de modelos de prediccion macroeconomica, que es exactamente el caso de uso del articulo asociado.
- Investigacion academica en economia aplicada: permite replicar o extender el pipeline del trabajo de Del Monaco et al. (2026) sobre el corpus de Reddit en inglés de 2008 a 2022.
- Escucha social para analistas financieros: seguimiento continuo de foros de inversion (r/wallstreetbets) para detectar cambios de tono sobre la trayectoria de precios, siempre agregando ventanas temporales amplias.
- Etiquetado previo para anotacion humana: pre-etiquetar grandes volumenes de titulares economicos y reservar el esfuerzo de anotacion manual para la revision de discrepancias y la clase down.
- Monitorizacion de medios y titulares economicos: clasificacion de titulares de prensa financiera en inglés con el mismo esquema de etiquetas, teniendo en cuenta el posible desajuste de registro respecto a Reddit.
- Construccion de datasets etiquetados para otros modelos: generar etiquetas debiles direccionales sobre corpus economicos que despues alimenten clasificadores o modelos de lenguaje mayores.
- Analisis retrospectivo de episodios de inflación: comparar la distribucion de etiquetas antes, durante y despues de 2021-2022 para estudiar como cambia el discurso publico sobre precios.
- Filtrado de ruido en pipelines de datos: descartar o separar textos sin señal direccional (neutral) antes de un analisis mas costoso.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`). Conjunto de evaluacion: Reddit inflation gold set (Del Monaco, Longo, Marcucci y Tafani, 2026), particion de test reservada de la semilla 2928142788.

| Metrica | Valor |
|---|---|
| Accuracy | 0,7698 |
| F1 (weighted) | 0,7700 |
| F1 (macro) | 0,7445 |
| ROC-AUC (macro, one-vs-rest) | 0,8746 |

La brecha entre F1 ponderado (0,7700) y F1 macro (0,7445) es coherente con el desequilibrio de clases declarado en la model card, donde down es la clase minoria y la de menor recall. No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni el desglose por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2,0-2,5 GB para los pesos del modelo base en 4 bits NF4, y del orden de 3-4 GB contando activaciones y overhead con lotes pequenos de textos de hasta 1.024 tokens. Estimacion derivada del tamano del modelo base; no hay mediciones publicadas en la informacion disponible.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 8 GB o cualquier GPU con 6 GB o mas de VRAM deberia ser suficiente para inferencia con lotes moderados.
- GPU recomendadas: RTX 3090, RTX 4090, L4 o A10G para procesamiento de grandes volumenes; A100 o H100 si se necesita throughput alto sobre corpus completos.
- Requisito de plataforma: bitsandbytes implica aceleracion CUDA, por lo que el despliegue en CPU no esta soportado por la via oficial del repositorio.
- Opciones de despliegue: transformers + peft + bitsandbytes, tal como muestra el ejemplo oficial (AutoModelForSequenceClassification con BitsAndBytesConfig en 4 bits y PeftModel.from_pretrained, en bfloat16 y device_map="auto"). No se publican pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente; tampoco se documenta soporte en vLLM o TGI para esta combinacion de adaptador PEFT sobre base cuantizada.
- Advertencia de integracion: no se debe pasar el nombre del repositorio directamente a AutoModelForSequenceClassification, porque el atajo de adaptadores de transformers reconstruye el adaptador DoRA con logits distintos a los del modelo entrenado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se identifican en la informacion proporcionada modelos comparables con datos de rendimiento publicados sobre el mismo conjunto de evaluacion. La comparativa se limita a aspectos estructurales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reddit-pulse-llama3.2_3b-xqdora | 3,2 mil millones (base) + adaptador | 128.000 en la base; 1.024 tokens en la practica del adaptador | Clasificacion direccional de inflación (3 clases) | llama3.2 | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B (base sin ajustar) | 3,2 mil millones | 128.000 | Generacion de texto; no entrenado para esta clasificacion | llama3.2 | HuggingFace |
| Otros clasificadores pequenos del mismo pipeline de Reddit | no disponible | no disponible | Clasificacion direccional de inflación | no disponible | Mencionados de forma agregada en la model card, sin nombres ni metricas |
| Clasificadores de sentimiento financiero tipo FinBERT | no disponible en la informacion proporcionada | no disponible | Sentimiento, no direccion de precios | no disponible | No evaluados en este conjunto |

## Limitaciones y advertencias

- Predicciones individuales ruidosas: el valor del modelo procede de promediar miles de predicciones por periodo; no debe usarse una etiqueta aislada como conclusion.
- Dominio y registro restringidos: entrenado con titulos de r/economy, r/Economics y r/wallstreetbets sobre inflación de Estados Unidos entre 2008 y 2022. Otros paises, otros registros y vocabulario posterior a 2022 quedan fuera de distribucion.
- Desequilibrio de clases: down es la clase minoria del conjunto gold y la mas dificil; aunque la perdida se balanceo durante el entrenamiento, su recall sigue siendo inferior. No se publica el desglose por clase.
- Textos cortos: ajustado sobre titulos (mediana de 11 palabras, maximo 52). Los comentarios largos se truncan y no se vieron durante el entrenamiento.
- Direccion, no postura ni sentimiento: no indica si el autor desea que la inflación suba o baje, ni si la noticia es buena o mala. "Inflation falls sharply" se etiqueta como down pese a ser una noticia positiva.
- Solo ingles: no hay soporte multilingue declarado.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de clasificaciones erroneas con alta confianza en textos fuera de dominio.
- Sesgo de plataforma y de autoseleccion: los foros de Reddit no son una muestra representativa de la poblacion ni de los mercados; los agregados heredan el sesgo demografico y tematico de esas comunidades.
- Restricciones de licencia: licencia llama3.2, con las condiciones de uso de la familia Llama 3.2 de Meta, incluida la licencia comunitaria y sus clausulas de atribucion y de uso aceptable. Revisar los terminos antes de un uso comercial.
- Advertencia de produccion: es un componente de un indicador agregado, no un oraculo autonomo; conviene monitorizar la deriva de dominio y recalibrar con datos posteriores a 2022 antes de desplegarlo en un sistema en vivo.
- La propia model card indica que la seccion de limitaciones se genero de forma automatica y que falta el desglose por clase de las tarjetas escritas a mano, por lo que parte de la documentacion puede ser generica.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las metricas declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreadm/reddit-pulse-llama3.2_3b-xqdora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Codigo de ajuste fino e inferencia sobre el corpus completo: https://github.com/andrea-dm/reddit-pulse
- Articulo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026), "Reddit's 'pulse' on US inflation: forecasting with large language models", Journal of Applied Econometrics, en prensa.
- Version de documento de trabajo: Banca d'Italia, Questioni di Economia e Finanza (Occasional Papers) n. 1028, junio de 2026, doi:10.32057/0.QEF.2026.1028
- Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente enlaces genericos a YouTube), por lo que no se anaden mas fuentes externas.
