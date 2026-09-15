# SergeiM89/CRCD-distilbert-sentiment-trained

## Resumen

CRCD-distilbert-sentiment-trained es un modelo de clasificacion de texto en ingles obtenido al ajustar DistilBERT-base-uncased para analisis de sentimiento en resenas de clientes y productos. Lo publica el usuario SergeiM89 en Hugging Face y su unica tarea es asignar cada texto a una de tres clases: negativa (label 0), neutra (label 1) o positiva (label 2). Se trata, por tanto, de un modelo discriminativo de 66.955.779 parametros, no de un modelo generativo, y su salida es un vector de tres logits.

El modelo parte de distilbert/distilbert-base-uncased y anade una cabeza de clasificacion de secuencia con tres neuronas de salida. El ajuste fino se realizo sobre el dataset CRCD-sentiment-balanced-3class, tambien publicado por el mismo autor, compuesto por resenas en ingles limpiadas y balanceadas entre las tres clases. La longitud maxima de entrada documentada es de 256 tokens.

Su relevancia practica es la de un clasificador ligero y barato de ejecutar: con menos de 67 millones de parametros cabe en CPU y en cualquier GPU de consumo, lo que permite procesar volumenes grandes de resenas en pipelines de analitica sin coste elevado. Como contrapartida, no hay resultados de benchmarks publicados, la licencia no esta declarada y el repositorio no tiene descargas ni validacion por parte de la comunidad, por lo que debe tratarse como un modelo experimental pendiente de evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con cabeza de clasificacion de secuencia de 3 clases (DistilBertForSequenceClassification) |
| Parametros totales | 66.955.779 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de entrada (maximo declarado por el autor); el encoder DistilBERT base admite hasta 512 posiciones, pero el ajuste se realizo con 256 |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se documentan variantes GGUF, ONNX INT8 ni otras) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos del repositorio: pipeline `text-classification`, tamano del repo 0,3 GB, creado el 2026-09-15 y actualizado el mismo dia. Etiquetas destacadas: `distilbert`, `sentiment-analysis`, `customer-reviews`, `base_model:distilbert/distilbert-base-uncased`, `text-embeddings-inference`, `endpoints_compatible`.

## Arquitectura y entrenamiento

La arquitectura es la del encoder DistilBERT: 6 capas de transformer, tamano oculto de 768, 12 cabezas de atencion, vocabulario WordPiece de 30.522 tokens y aproximadamente 66 millones de parametros. DistilBERT se obtuvo por destilacion de conocimiento de BERT-base, entrenando la copia con una perdida combinada de destilacion, masked language modeling y similitud coseno de embeddings ocultos, lo que reduce el tamano en torno a un 40 % y el coste de inferencia en torno a un 60 % respecto a BERT-base manteniendo buena parte de su rendimiento. Sobre esta base, el autor anadio una cabeza lineal de 3 salidas para clasificacion de secuencia.

En cuanto al entrenamiento del ajuste fino, la model card indica unicamente que se uso el dataset CRCD Balanced Sentiment Dataset con resenas en ingles de productos y clientes, etiquetadas como negativa, neutra o positiva, limpiadas, balanceadas y divididas en conjuntos de entrenamiento, validacion y prueba. No se publican hiperparametros (tasa de aprendizaje, numero de epocas, optimizador, batch size, semilla), ni la composicion exacta del dataset, ni si se aplicaron tecnicas de regularizacion o ajuste de umbrales. Tampoco se documentan variantes de decodificacion, ya que no es un modelo generativo. No hay indicios de RLHF ni de DPO, tecnicas que no aplican a un clasificador de este tipo.

## Capacidades

- Clasificacion de sentimiento en 3 clases: negativa (0), neutra (1) y positiva (2), a partir de texto en ingles.
- Salida de logits y probabilidades por clase (tras softmax), lo que permite aplicar umbrales personalizados o reglas de negocio sobre la confianza de cada prediccion.
- Procesamiento por lotes de textos cortos y medianos, con truncacion a 256 tokens.
- Inferencia muy ligera: ejecutable en CPU y en GPUs de consumo con consumo de memoria minimo.
- Compatibilidad con el ecosistema transformers y con el tag `endpoints_compatible` de Hugging Face Inference Endpoints.
- El repositorio esta etiquetado como `text-embeddings-inference`, por lo que puede desplegarse mediante ese contenedor, aunque la tarea declarada es de clasificacion, no de generacion de embeddings.
- No soporta generacion de texto, razonamiento multi-paso, tool calling, function calling ni uso como agente.
- No tiene modo de pensamiento (thinking mode), vision, audio ni capacidades multimodales.
- No es multilingue: unicamente ingles.

## Casos de uso

- Clasificacion masiva de resenas de e-commerce: el modelo etiqueta cada resena como negativa, neutra o positiva en lotes, lo que permite construir cuadros de mando de satisfaccion por producto, categoria o periodo con un coste de computo muy bajo.
- Enrutado de tickets de soporte: los tickets marcados como negativos pueden dirigirse automaticamente a colas de atencion prioritaria o a agentes senior, reduciendo el tiempo de primera respuesta en incidencias criticas.
- Monitorizacion de reputacion de marca: analisis continuo de menciones y comentarios en ingles recogidos de foros, tiendas o redes, generando alertas cuando la proporcion de sentimiento negativo supera un umbral definido.
- Analisis de encuestas de satisfaccion y NPS: las respuestas abiertas de clientes se clasifican por polaridad y se agregan por segmento, pais o cohorte, complementando la puntuacion numerica con el motivo declarado.
- Pre-anotacion en proyectos de etiquetado: el modelo actua como etiquetador debil para preparar grandes volumenes de datos que luego se revisan por anotadores humanos, reduciendo el coste por muestra en pipelines de anotacion activa.
- Analisis de senales de abandono (churn): seguimiento del sentimiento de las resenas de los clientes de un servicio, detectando picos de negatividad asociados a versiones, precios o cambios de politica.
- Filtrado previo en moderacion de contenido: priorizar para revision humana los comentarios con polaridad negativa extrema, como primer paso de un sistema de moderacion con supervision.
- Extraccion de caracteristicas para analitica: los logits y las probabilidades por clase pueden usarse como variables de entrada en modelos posteriores de prediccion de satisfaccion o de ventas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, precision o recall sobre el conjunto de prueba del dataset CRCD, ni comparaciones con otros clasificadores de sentimiento. Tampoco hay resultados de evaluacion sobre conjuntos estandar como SST-2, IMDB o Yelp.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB solo con los pesos en FP32 (66,96 M de parametros), 0,13 GB en FP16 y unos 0,07 GB en INT8. El consumo real dependera del batch size y de la longitud de las secuencias, ya que las activaciones y la memoria del optimizador no aplican en inferencia.
- GPU recomendadas: cualquier GPU con 1 GB o mas de VRAM es suficiente (RTX 3060, RTX 4090, T4, L4); tambien tarjetas de gama baja y GPUs integradas recientes. En A100 y H100 el modelo queda enormemente infrautilizado salvo que se ejecute con lotes muy grandes.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual, e incluso en CPU. Un texto de 256 tokens se procesa en milisegundos en CPU moderna y en menos de un milisegundo por muestra con lotes grandes en GPU.
- Opciones de despliegue: pipeline de transformers (`text-classification`), Hugging Face Inference Endpoints (tag `endpoints_compatible`), contenedor de Text Embeddings Inference (tag del repositorio), ONNX Runtime para optimizacion en CPU, y exportacion a TorchScript. No aplican vLLM, llama.cpp ni Ollama, porque estan orientados a modelos generativos y no a cabezas de clasificacion de este tipo.
- Latencia y throughput: no se han publicado mediciones de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto maximo | Idioma | Licencia |
|---|---|---|---|---|---|
| CRCD-distilbert-sentiment-trained | 66,96 M | 3 (negativa, neutra, positiva) | 256 tokens | Ingles | No disponible |
| distilbert/distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 2 (negativa, positiva) | 512 tokens | Ingles | Apache-2.0 |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 3 (negativa, neutra, positiva) | 512 tokens aproximadamente | Ingles | Consultar repositorio |
| distilbert/distilbert-base-uncased | ~67 M | Sin cabeza de clasificacion | 512 tokens | Ingles | Apache-2.0 |

En cuanto a rendimiento, no hay metricas comparables publicadas para este modelo, por lo que la comparacion se limita a tamano, numero de clases, contexto y licencia. El modelo de la ficha aporta la clase neutral, que los clasificadores binarios tipo SST-2 no cubren, a cambio de un contexto mas corto (256 frente a 512 tokens) y de una licencia sin definir, lo que penaliza su uso comercial frente a alternativas con licencia explicita.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay exactitud, F1 ni matriz de confusion publicadas, de modo que el rendimiento real en produccion es desconocido hasta que se evalue con datos propios.
- Licencia no declarada: al no especificarse licencia en el repositorio, el uso comercial es juridicamente arriesgado. El modelo base DistilBERT se distribuye bajo Apache-2.0, pero el autor no ha declarado la licencia de este ajuste fino.
- Idioma unico: solo ingles. Cualquier texto en otro idioma producira predicciones sin sentido, aunque el modelo devuelva una probabilidad alta.
- Truncacion a 256 tokens: las resenas largas se recortan, lo que puede eliminar la parte del texto donde reside la opinion y sesgar la prediccion.
- Clase neutral ambigua: en clasificacion de sentimiento la clase neutra suele ser la mas dificil; sin metricas por clase no es posible saber si el modelo la distingue bien de las clases positivas y negativas.
- Sesgo de dominio y de dataset: la composicion, el origen y la limpieza del dataset CRCD no estan documentados, por lo que se desconoce la representatividad de dominios, sectores, registros o variedades dialectales, y puede haber sesgos hacia el tipo de resena empleada en el ajuste.
- Riesgo de sobreconfianza: el modelo puede asignar probabilidades muy altas a predicciones incorrectas. Conviene calibrar los umbrales con un conjunto de validacion propio antes de automatizar decisiones.
- Alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre, pero si puede producir etiquetas erroneas con apariencia de certeza.
- Falta de reproducibilidad: no se publican hiperparametros, semilla ni detalles de preprocesado, por lo que no es posible reproducir el ajuste fino.
- Validacion nula por la comunidad: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia, sin historial posterior de mantenimiento.
- Enrutado automatico de decisiones: por los puntos anteriores, no se recomienda usar el modelo como unico criterio en decisiones con impacto sobre clientes (rechazo de reclamaciones, cancelaciones, moderacion) sin revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SergeiM89/CRCD-distilbert-sentiment-trained
- Dataset de ajuste fino: https://huggingface.co/datasets/SergeiM89/CRCD-sentiment-balanced-3class
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (modelo base): https://arxiv.org/abs/1910.01108
- Paper de BERT (arquitectura original de la que deriva DistilBERT): https://arxiv.org/abs/1810.04805
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo. Los unicos enlaces disponibles son los incluidos en la model card y los citados en esta seccion.
