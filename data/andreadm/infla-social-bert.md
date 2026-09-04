# andreadm/infla-social-bert

## Resumen

InflaReddert es un clasificador de texto de tres clases (up / neutral / down) diseñado para detectar la dirección de las expectativas de inflación en textos cortos en inglés relacionados con economía. El modelo ha sido desarrollado por Andrea Del Monaco y colaboradores, y está asociado a un artículo de investigación en Journal of Applied Econometrics y a un working paper de Banca d'Italia. Su objetivo es etiquetar grandes volúmenes de textos informales, como títulos de Reddit, titulares de noticias o publicaciones en redes sociales, para construir indicadores de alta frecuencia de expectativas de inflación.

La arquitectura se basa en DistilRoBERTa, concretamente en `RobertaForSequenceClassification`, con 6 capas ocultas, 768 unidades de tamaño de capa, 12 cabezas de atención y un vocabulario BPE de 50.265 tokens. El contexto es de 512 tokens. El modelo tiene 82.120.707 parámetros, todos actualizados durante el fine-tuning, sin adaptadores ni cuantización. El checkpoint es un fine-tuning del modelo `MAPAi/InflaBERT`, que a su vez parte de un modelo de análisis de sentimiento en noticias financieras.

A diferencia de un modelo de sentimiento, InflaReddert clasifica la dirección de los precios: "inflation falls sharply" se etiqueta como down, aunque sea una buena noticia; "rents are out of control" se etiqueta como up, aunque sea una mala noticia. Esta distinción es clave para su uso en el seguimiento de expectativas de inflación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RobertaForSequenceClassification (DistilRoBERTa, 6 capas, hidden size 768, 12 cabezas de atencion) |
| Parametros totales | 82.120.707 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una linea de fine-tuning en cascada. Parte de `distilroberta-base`, un modelo destilado de RoBERTa con 6 capas y 82,1 millones de parametros. Posteriormente se afinó en analisis de sentimiento de noticias financieras con `mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis`, y despues en sentimiento de noticias de inflacion con `MAPAi/InflaBERT`. El checkpoint final es un full fine-tuning sobre titulos de Reddit, con las etiquetas re-mapeadas a las tres clases direccionales: down, neutral y up. La cabeza de clasificacion se reinicializo para las tres clases y todos los parametros se actualizaron.

Los datos de entrenamiento consisten en titulos de los subreddits r/economy, r/Economics y r/wallstreetbets sobre inflacion de Estados Unidos, abarcando el periodo 2008-2022. No se indica el numero exacto de tokens ni la composicion del dataset. No se aplicaron tecnicas de RLHF ni DPO, ya que se trata de un modelo de clasificacion supervisada. La innovacion principal no es arquitectonica, sino de enfoque: la tarea se define como clasificacion direccional de precios, no como analisis de sentimiento, lo que permite capturar la señal que interesa para el seguimiento de expectativas de inflacion.

## Capacidades

- Clasificacion direccional de expectativas de inflacion en tres etiquetas: up, neutral y down.
- Procesamiento de textos cortos e informales, como titulos de Reddit, comentarios, titulares de prensa y publicaciones en redes sociales.
- Soporte de inferencia por lotes mediante el pipeline de `transformers`.
- Capacidad de agregacion a nivel de corpus: el modelo esta pensado para etiquetar miles de textos y promediar los resultados, de modo que el ruido de las predicciones individuales se diluye.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, solo etiquetas de clasificacion.
- Capacidad multilingue limitada a ingles.

## Casos de uso

- Construccion de un indicador de alta frecuencia de expectativas de inflacion: el modelo etiqueta diariamente miles de titulos de Reddit y los resultados se agregan por periodos para generar una serie temporal. Es adecuado porque la agregacion de muchas predicciones reduce el ruido inherente a cada clasificacion individual.
- Monitorizacion de redes sociales para bancos centrales: se pueden analizar publicaciones en redes sociales sobre precios y detectar cambios en la direccion de las expectativas de inflacion. El modelo es util porque esta entrenado especificamente en el registro informal de Reddit, similar al de otras plataformas.
- Analisis de titulares de noticias economicas: clasificar titulares de medios como "Fed officials warn prices will keep climbing" para identificar si transmiten una señal de inflacion al alza o a la baja. Sirve para alimentar dashboards de seguimiento de opinion publica.
- Investigacion academica en economia: replicar el estudio de Del Monaco et al. (2026) o utilizar el modelo como componente de un sistema de nowcasting de inflacion. El modelo esta documentado y vinculado a un paper, lo que facilita su uso en investigacion.
- Alimentacion de modelos de nowcasting de inflacion: la señal direccional extraida de Reddit puede incorporarse como variable explicativa en modelos de prevision de inflacion. El modelo es adecuado porque proporciona una medida de expectativas basada en datos no tradicionales.
- Filtrado y priorizacion de contenido: en un sistema de monitorizacion de noticias, el modelo puede seleccionar automaticamente los textos que contienen una señal direccional clara de inflacion, reduciendo el volumen de informacion que un analista debe revisar manualmente.

## Benchmarks y rendimiento

Se han publicado resultados oficiales por el autor en el model-index de HuggingFace. El modelo fue evaluado en el conjunto de test del "Reddit inflation gold set" (Del Monaco, Longo, Marcucci & Tafani, 2026), con una semilla de particion 2786505123. Los resultados declarados son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0,7410 |
| F1 (weighted) | 0,7387 |
| F1 (macro) | 0,7216 |
| ROC-AUC (macro, one-vs-rest) | 0,8716 |

No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 82,1 millones de parametros. En precision FP32 ocupa aproximadamente 330 MB, en FP16 unos 165 MB y en int8 unos 82 MB. Por tanto, cabe en cualquier GPU con 1 GB de VRAM. No se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna, incluso una RTX 3060 o inferior es suficiente. El paper menciona que el corpus completo de aproximadamente 243.000 textos se etiqueta en pocos minutos en una A100 con batch size 64.
- Compatibilidad con GPU de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo como la serie RTX 30 o 40.
- Opciones de despliegue: se puede usar con el pipeline de `transformers`, con vLLM, con Text Generation Inference (TGI) o con endpoints compatibles. Tambien es posible ejecutarlo en CPU con una latencia razonable.
- Latencia y throughput estimados: no disponibles de forma oficial. Como referencia, el autor indica que el corpus completo (243.000 textos) se etiqueta en pocos minutos en una A100 a batch 64, lo que implica un throughput aproximado de mas de 1.000 textos por segundo en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| andreadm/infla-social-bert | 82,1 M | 512 tokens | Clasificacion direccional de inflacion (up/neutral/down) | Apache-2.0 |
| MAPAi/InflaBERT | No disponible | No disponible | Sentimiento de noticias de inflacion (negativo/neutral/positivo) | No disponible |
| distilroberta-base | 82,1 M | 512 tokens | Modelo de lenguaje general | Apache-2.0 |

La comparativa se limita a los modelos de la misma familia. No se dispone de datos de benchmarks para `MAPAi/InflaBERT` ni para `distilroberta-base` en la tarea de clasificacion direccional, por lo que no se puede establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Las predicciones individuales son ruidosas: la precision en el conjunto de test es aproximadamente del 74 %. El valor del modelo reside en agregar miles de predicciones por periodo, donde los errores idiosincraticos se cancelan. No se debe confiar en una sola etiqueta.
- Dominio y registro: el modelo fue entrenado en titulos de r/economy, r/Economics y r/wallstreetbets sobre inflacion de Estados Unidos entre 2008 y 2022. Otros paises, otros registros formales o contextos fuera de ese dominio pueden degradar el rendimiento. La informacion disponible se corta en ese punto, por lo que no se conocen todas las limitaciones declaradas por el autor.
- No es un modelo de sentimiento: las etiquetas up y down se refieren a la direccion del nivel de precios, no al tono del texto. Un texto que expresa preocupacion por la subida de precios se etiqueta como up, no como negativo.
- Sesgo de la fuente: los datos de Reddit no representan a la poblacion general. El modelo puede reflejar sesgos presentes en las comunidades de las que se extraen los datos, especialmente en temas economicos.
- Riesgo de alucinacion: no aplica, ya que el modelo es un clasificador de secuencia y no genera texto.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero requiere incluir el aviso de licencia y las atribuciones correspondientes.
- Limitacion de contexto: el modelo solo procesa secuencias de hasta 512 tokens, por lo que no es adecuado para documentos largos o contextos extensos.

## Enlaces

- HuggingFace: https://huggingface.co/andreadm/infla-social-bert
- Repositorio de codigo: https://github.com/andrea-dm/reddit-pulse
- Modelo base MAPAi/InflaBERT: https://huggingface.co/MAPAi/InflaBERT
- Modelo intermedio de sentimiento financiero: https://huggingface.co/mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis
- Paper de InflaBERT (modelo base): https://arxiv.org/pdf/2410.20198
- Working paper de Banca d'Italia: doi:10.32057/0.QEF.2026.1028
