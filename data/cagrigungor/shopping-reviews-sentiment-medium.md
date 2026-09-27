# cagrigungor/shopping-reviews-sentiment-medium

## Resumen

Shopping Reviews Sentiment Medium es un modelo de clasificacion de texto binaria (positivo/negativo) desarrollado por el usuario cagrigungor y publicado en HuggingFace. Se trata de un ajuste fino de `FacebookAI/roberta-base`, un transformer encoder de tipo solo-codificador, sobre el dataset Amazon Reviews for Sentiment Analysis (`bittlingmayer/amazonreviews`). El resultado es un clasificador especializado en opiniones de productos de compra, con 124.647.170 parametros y un tamano de repositorio de 0,5 GB.

El modelo resuelve una tarea muy concreta y de alta demanda en comercio electronico: determinar automaticamente si una resena de producto es positiva o negativa. Frente a soluciones genericas, el ajuste fino sobre 500.000 ejemplos de resenas de Amazon le permite capturar vocabulario, estructuras y matices propios del dominio de consumo (quejas sobre envio, elogios sobre calidad-precio, ironia breve, etc.). Su relevancia practica esta en que es un modelo pequeno, rapido y de licencia MIT, lo que lo hace desplegable en infraestructura modesta y apto para uso comercial sin fricciones legales.

La informacion disponible no incluye detalles sobre innovaciones arquitectonicas mas alla del ajuste fino estandar, ni datos sobre el proceso de alineacion. Las metricas declaradas en la model card son altas: exactitud de 0,97118 y F1 de 0,97130 sobre el conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza de clasificacion de 2 etiquetas |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia usada en entrenamiento); no se especifica el limite de inferencia del checkpoint |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Etiquetas de salida | 0: NEGATIVE, 1: POSITIVE |
| Pipeline | text-classification |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-base` y anade una cabeza de clasificacion secuencial para dos clases. RoBERTa es una variante de BERT entrenada con un objetivo de masked language modeling optimizado (sin el objetivo de prediccion de siguiente frase, con enmascaramiento dinamico y mayor volumen de datos), pero la informacion proporcionada no detalla la configuracion interna de capas ni dimensiones de este checkpoint concreto mas alla del recuento total de parametros.

El ajuste fino se realizo sobre el dataset `bittlingmayer/amazonreviews` con 500.000 ejemplos de entrenamiento y 50.000 de evaluacion, durante 2 epocas, con tasa de aprendizaje 2e-05 y longitud maxima de secuencia de 256 tokens. No se menciona el uso de RLHF, DPO ni ninguna fase de alineacion adicional; se trata de un ajuste supervisado clasico. Tampoco se documenta la composicion exacta de clases del dataset, el hardware de entrenamiento ni si hubo busqueda de hiperparametros.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en resenas de productos escritas en ingles.
- Analisis de sentimiento a nivel de documento o de fragmento de hasta 256 tokens.
- Inferencia rapida por lotes: la model card reporta 2.723,77 muestras por segundo y 21,3 pasos por segundo en la fase de evaluacion (hardware no especificado).
- Integracion directa con la libreria `transformers` mediante el pipeline `sentiment-analysis`.
- Compatible con Text Embeddings Inference y con endpoints de HuggingFace (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni uso como agente. Es exclusivamente un clasificador.
- No dispone de modo de razonamiento explicito (thinking mode) ni de salida de probabilidades calibradas mas alla del softmax de la cabeza de clasificacion.

## Casos de uso

- Moderacion y triaje de resenas en un marketplace: el modelo clasifica cada resena entrante como positiva o negativa para priorizar la revision manual de las negativas y detectar focos de insatisfaccion por producto o vendedor.
- Cuadro de mando de satisfaccion (voice of the customer): agregar las predicciones por SKU, categoria o periodo temporal para calcular una tasa de sentimiento positivo y correlacionarla con devoluciones o ventas.
- Enrutado automatico de tickets de soporte postventa: las resenas o mensajes negativos se derivan al equipo de atencion al cliente con prioridad alta, mientras que los positivos se canalizan a marketing o a solicitud de testimonio.
- Filtrado de datos para entrenamiento: usar el clasificador para etiquetar grandes volumenes de resenas sin anotar y construir datasets de sentimiento a bajo coste, dado su throughput declarado de mas de 2.700 muestras por segundo.
- Analisis competitivo: procesar resenas de productos de la competencia recogidas por scraping para comparar la percepcion relativa por caracteristica mencionada.
- Deteccion temprana de crisis de reputacion: monitorizar en tiempo casi real el flujo de opiniones y disparar alertas cuando la proporcion de negativas supera un umbral definido.
- Resumen de opinion en fichas de producto: mostrar al comprador un indicador de sentimiento agregado basado en las resenas existentes.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los declarados por el autor en la model card sobre el conjunto de test del dataset de resenas de Amazon. No se proporcionan comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| Test loss | 0,092003 |
| Exactitud (accuracy) | 0,97118 |
| Precision | 0,972406 |
| Recall | 0,970201 |
| F1 | 0,971302 |
| Precision macro | 0,971176 |
| Recall macro | 0,971185 |
| F1 macro | 0,971179 |
| Tiempo de evaluacion | 18,3569 s |
| Muestras por segundo | 2.723,771 |
| Pasos por segundo | 21,3 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SST-2, etc.) en la informacion disponible, por lo que no es posible comparar el rendimiento con otros modelos bajo protocolos homogeneos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 124,6 M de parametros ocupan aproximadamente 0,5 GB de pesos; en fp16 alrededor de 0,25 GB; en int8 cerca de 0,125 GB. Con activaciones y overhead, una inference en lote pequeno cabe holgadamente por debajo de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve. Modelos como RTX 3060, RTX 4090, T4, L4, A10, A100 o H100 son mas que suficientes; el modelo esta muy por debajo de la capacidad de todas ellas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en iGPU o en CPU. Es un candidato claro para despliegue en el borde o en instancias pequenas.
- CPU: la inferencia en CPU es viable para cargas moderadas, aunque el throughput reportado (2.723 muestras/s) corresponde presumiblemente a GPU y no se especifica el hardware de evaluacion.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Embeddings Inference (TEI), HuggingFace Inference Endpoints, y exportacion a ONNX u otros runtimes para servirlo sin dependencia de PyTorch. No se indica compatibilidad explicita con vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos y no a clasificadores encoder.
- Latencia y throughput: la model card reporta 2.723,77 muestras por segundo y 21,3 pasos por segundo durante la evaluacion, con un tiempo total de evaluacion de 18,36 s para 50.000 ejemplos. El hardware empleado no se especifica, por lo que estas cifras deben tomarse como orientativas.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables entre modelos en la informacion proporcionada. La siguiente tabla compara caracteristicas estructurales conocidas a partir de la informacion disponible; las celdas de rendimiento se dejan como no disponibles para los alternativos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| cagrigungor/shopping-reviews-sentiment-medium | 124,6 M | 256 tokens (entrenamiento) | en | MIT | F1 0,9713 en test de amazonreviews |
| FacebookAI/roberta-base (modelo base) | ~125 M | 512 posiciones | en (multilingue parcial via subword) | MIT | no disponible en esta ficha |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 posiciones | en | MIT | no disponible en esta ficha |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 posiciones | en | Apache 2.0 | no disponible en esta ficha |

La comparacion relevante es que este checkpoint esta especializado en resenas de compra, mientras que las alternativas citadas lo estan en sentimiento generico de redes sociales o en SST-2, dominios con distribuciones lexicas distintas.

## Limitaciones y advertencias

- Solo ingles: cualquier resena en otro idioma (castellano incluido) queda fuera del ambito del modelo y producira predicciones poco fiables.
- Dominio acotado: el ajuste se hizo sobre resenas de Amazon; el rendimiento puede degradarse en otros dominios (criticas de cine, opinion politica, encuestas) o en textos muy tecnicos.
- Longitud limitada: el entrenamiento uso secuencias de 256 tokens, por lo que los textos largos se truncan o hay que segmentarlos, con la consiguiente perdida de contexto.
- Clasificacion binaria sin matices: no distingue intensidad, emociones concretas, aspectos del producto ni sentimiento neutro o mixto. Una resena con elogios y quejas graves se forzara a una de las dos clases.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente en resenas sarcasticas, muy cortas o ambiguas.
- Sesgos: no se documenta ningun analisis de sesgo. Al entrenarse sobre datos de Amazon, puede heredar sesgos de idioma, registro, procedencia cultural y distribucion de productos presentes en el dataset.
- Sobreajuste potencial al conjunto de test: el F1 reportado de 0,9713 es muy alto y corresponde a una particion del mismo dataset; no hay validacion cruzada ni evaluacion en un corpus externo, por lo que la generalizacion real es incierta.
- Trazabilidad: no se publican detalles del hardware de entrenamiento, la semilla, la composicion exacta de clases ni curvas de validacion, lo que dificulta la reproducibilidad.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, y sin validacion por parte de la comunidad.
- Licencia: MIT permite uso comercial sin restricciones practicas, siempre que se conserve el aviso de copyright y la licencia. Conviene verificar que la licencia del dataset de origen sea compatible con el uso previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cagrigungor/shopping-reviews-sentiment-medium
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/bittlingmayer/amazonreviews
