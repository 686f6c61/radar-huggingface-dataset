# sergeyzh/rubert-large-uncased-sentiment

## Resumen

El modelo `sergeyzh/rubert-large-uncased-sentiment` es un clasificador de sentimiento para textos en ruso, desarrollado por el usuario sergeyzh. Se basa en el modelo `sergeyzh/rubert-large-uncased-sts`, que a su vez es una destilación del modelo FRIDA (arquitectura T5-encoder, 823M parámetros). El modelo clasifica reseñas en tres clases: Negative (0), Neutral (1) y Positive (2). Con 209 millones de parámetros y 12 capas (la mitad de las 24 estándar de BERT-large), ofrece una velocidad de inferencia comparable a los modelos BERT-base clásicos, manteniendo un rendimiento competitivo en análisis de sentimiento ruso. Su contexto máximo es de 512 tokens, lo que lo hace adecuado para textos de longitud media como reseñas de productos, opiniones de películas o comentarios en redes sociales. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) con 12 capas, hidden size 1024 |
| Parametros totales | 209.140.739 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una variante de BERT-large con una arquitectura reducida: 12 capas en lugar de las 24 habituales, manteniendo el hidden size de 1024. Se obtuvo mediante destilación de etiquetas suaves (soft-label distillation) a partir del modelo teacher FRIDA, un encoder T5 de 823M parámetros previamente ajustado en tareas de análisis de sentimiento. El entrenamiento utilizó un loss mixto: 0.75 × entropía cruzada con etiquetas duras + 0.25 × entropía cruzada con etiquetas suaves generadas por el teacher. Los datos de entrenamiento consistieron en 105.500 muestras de entrenamiento y 21.500 de validación, procedentes de los datasets Kinopoisk, RuReviews y Georeview. Se entrenaron 3 épocas con batch_size efectivo de 32 (batch_size 8, grad_accum 4), learning rate 2e-5, warmup 0.1, weight_decay 0.01 y max_length 256. La selección del mejor modelo se realizó por F1 de validación, obteniendo un valor de 0.7725 en la tercera época.

## Capacidades

- Clasificacion de sentimiento en ruso en tres clases: Negative, Neutral, Positive.
- Integracion directa con el pipeline `text-classification` de HuggingFace Transformers.
- Salida de probabilidades para todas las clases mediante softmax sobre los logits.
- Soporte para truncamiento y padding hasta 512 tokens.
- Compatible con la libreria `transformers` y con `text-embeddings-inference` (segun tags del modelo).
- No incluye capacidades de generacion de texto, tool calling ni agentes; es exclusivamente un clasificador.

## Casos de uso

- Analisis de opiniones de productos en plataformas de ecommerce rusas: el modelo puede clasificar automaticamente reseñas de clientes en positivas, neutrales o negativas, permitiendo a las empresas monitorizar la satisfaccion y detectar problemas recurrentes.
- Moderacion de comentarios en redes sociales y foros: se puede integrar en pipelines de moderacion para priorizar comentarios negativos que requieran atencion humana, gracias a su velocidad de inferencia comparable a BERT-base.
- Analisis de criticas de cine y entretenimiento: dado que parte de los datos de entrenamiento provienen de Kinopoisk, el modelo es especialmente adecuado para clasificar opiniones sobre peliculas, series y otros contenidos audiovisuales.
- Monitorizacion de reputacion de marca: empresas rusas pueden procesar menciones en redes sociales y noticias para detectar cambios en el sentimiento hacia su marca, usando el modelo como componente de un sistema de alertas.
- Investigacion academica en procesamiento de lenguaje natural: el modelo sirve como baseline para experimentos de clasificacion de sentimiento en ruso, especialmente en comparaciones con otros modelos RuBERT.
- Analisis de opiniones en plataformas de reseñas locales (tipo Yelp o Google Maps): el modelo puede clasificar reseñas de restaurantes, hoteles o servicios, ayudando a negocios a priorizar respuestas a clientes insatisfechos.

## Benchmarks y rendimiento

La model card del autor proporciona resultados en tres conjuntos de test: Kinopoisk (1500 muestras), RuReviews (15000) y Georeview (5000, con reescalado de 5 estrellas a 3 clases). La evaluacion se realizo con argmax sobre logits y max_length 512.

| Modelo | Kinopoisk Acc/F1 | RuReviews Acc/F1 | Georeview Acc/F1 | Avg F1 |
| :--- | :---: | :---: | :---: | :---: |
| **sergeyzh/rubert-large-uncased-sentiment** | **0.7013** / **0.6929** | 0.7851 / 0.7866 | **0.7858** / **0.7361** | **0.7385** |
| sergeyzh/rubert-tiny-sentiment | 0.6593 / 0.6519 | 0.7672 / 0.7690 | 0.7680 / 0.7130 | 0.7113 |
| seara/rubert-base-cased-russian-sentiment | 0.5653 / 0.5679 | **0.8163** / **0.8183** | 0.6566 / 0.6434 | 0.6765 |
| seara/rubert-tiny2-russian-sentiment | 0.4980 / 0.5032 | 0.7877 / 0.7899 | 0.6218 / 0.6122 | 0.6351 |
| blanchefort/rubert-base-cased-sentiment | 0.5253 / 0.5209 | 0.7615 / 0.7549 | 0.6716 / 0.6047 | 0.6268 |
| blanchefort/rubert-base-cased-sentiment-rusentiment | 0.5413 / 0.5470 | 0.6230 / 0.6327 | 0.6022 / 0.5760 | 0.5852 |
| cointegrated/rubert-tiny-sentiment-balanced | 0.4293 / 0.3977 | 0.7330 / 0.7344 | 0.6158 / 0.5857 | 0.5726 |

El modelo destaca especialmente en Kinopoisk y Georeview, superando a las alternativas, aunque en RuReviews el modelo `seara/rubert-base-cased-russian-sentiment` obtiene mejores resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 209M parametros. En precision fp32, el peso ocupa aproximadamente 836 MB; en fp16, unos 418 MB. Con cuantizacion a 8 bits, alrededor de 209 MB, y a 4 bits, unos 105 MB. Estas cifras son estimaciones teoricas; no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores son suficientes. Para despliegue en produccion con alto throughput, se recomienda una GPU con 8 GB o mas (por ejemplo, RTX 3070, A10, A100).
- El modelo cabe en GPUs de consumo (consumer GPU) como la RTX 3060, RTX 4060, etc., incluso con cuantizacion.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference), o mediante la API de HuggingFace Inference Endpoints. Tambien es compatible con `text-embeddings-inference` segun los tags. Para inferencia local, se puede usar la libreria `transformers` con PyTorch.
- Latencia y throughput: no se han publicado datos oficiales. Dado que tiene 12 capas (mitad de BERT-large), se espera una latencia por muestra de entre 5 y 20 ms en GPU moderna, dependiendo de la longitud del texto y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg F1 (test) | Licencia |
| :--- | :---: | :---: | :---: | :---: |
| sergeyzh/rubert-large-uncased-sentiment | 209M | 512 | 0.7385 | MIT |
| sergeyzh/rubert-tiny-sentiment | ~11M (estimado) | 512 | 0.7113 | MIT |
| seara/rubert-base-cased-russian-sentiment | ~178M (estimado) | 512 | 0.6765 | MIT |
| blanchefort/rubert-base-cased-sentiment | ~178M (estimado) | 512 | 0.6268 | MIT |

El modelo propuesto ofrece el mejor F1 promedio entre las alternativas comparadas, con un coste computacional intermedio (12 capas frente a 24 de un BERT-large completo). Su licencia MIT permite uso comercial sin restricciones.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ruso; no soporta otros idiomas.
- La longitud de contexto maxima es de 512 tokens, por lo que textos mas largos deben truncarse, lo que puede perder informacion relevante.
- Los datos de entrenamiento provienen de dominios especificos (cine, reseñas de productos, geolocalizacion), por lo que el rendimiento puede degradarse en otros dominios como textos legales o medicos.
- No se han documentado sesgos especificos, pero al estar entrenado con reseñas de plataformas publicas, puede reflejar sesgos presentes en esos datos (por ejemplo, sobre-representacion de ciertos tipos de opiniones).
- Riesgo de alucinacion: al ser un clasificador, no genera texto, por lo que el riesgo de alucinacion es bajo, pero puede producir clasificaciones erroneas en textos ambiguos o con sarcasmo.
- No se proporcionan cuantizaciones oficiales; si se requiere cuantizacion, debe realizarse manualmente, lo que puede afectar ligeramente al rendimiento.
- El modelo no incluye soporte para tool calling ni capacidades de agente; es exclusivamente un clasificador de texto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sergeyzh/rubert-large-uncased-sentiment)
- [Modelo base: sergeyzh/rubert-large-uncased-sts](https://huggingface.co/sergeyzh/rubert-large-uncased-sts)
- [Modelos fine-tuned de sergeyzh/rubert-large-uncased-sts](https://huggingface.co/models?other=base_model:finetune:sergeyzh/rubert-large-uncased-sts)
- [Referencia a FRIDA en aibase](https://model.aibase.com/models/details/1915715638460571650)
