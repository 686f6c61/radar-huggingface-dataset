# Pugnola/finbert-finance-news-sentiment

## Resumen

Pugnola/finbert-finance-news-sentiment es un clasificador de texto en tres clases (positive, negative, neutral) desarrollado por el usuario Pugnola mediante ajuste fino de ProsusAI/finbert sobre el dataset Pugnola/finance-news-sentiment-35k, formado por 39.965 titulares financieros en ingles etiquetados por dos jueces LLM independientes con un tercero como arbitro. La definicion operativa de sentimiento que usa el modelo no es el tono emocional del titular, sino el impacto percibido para un inversor: si la noticia es buena o mala para quien tiene posiciones abiertas. Se distribuye con licencia MIT y pesos safetensors, y su inferencia es muy barata al tratarse de un encoder tipo BERT con entradas de como maximo 128 tokens.

El modelo se publica en dos revisiones: v1 (3 de septiembre de 2026, tag `v1-a2`, 27.973 filas de entrenamiento) y v2 (4 de septiembre de 2026, revision `main`, 32.970 filas tras anadir 4.997 ejemplos seleccionados por aprendizaje activo). Sobre un conjunto de test congelado de 3.500 titulares, v2 alcanza 0,847 de accuracy y 0,810 de macro F1, con un error de calibracion esperado (ECE) de 0,087. Ambas versiones coinciden en el 88,7 % de las predicciones de test, por lo que la mejora entre versiones es pequena y esta dentro del ruido estadistico.

Su relevancia practica esta en dos puntos: primero, resuelve una tarea de triaje de noticias financieras a gran escala con un coste computacional minimo (se entreno en 60 minutos en un MacBook Air M4 con MPS); segundo, publica curvas de calibracion utilizables en produccion, ya que con umbral de confianza >= 0,95 el modelo cubre el 76 % de los titulares con un 92,8 % de accuracy, lo que permite derivar automaticamente el resto de casos a revision humana o a un modelo mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (base: ProsusAI/finbert), con nueva cabeza de clasificacion de 3 clases sobre `pooler_output` |
| Parametros totales | no disponible (el autor no declara el recuento; el modelo base pertenece a la familia BERT-base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (`max_length` declarado en la model card; los textos mas largos se truncan) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision completa; no hay GGUF, AWQ, GPTQ ni ONNX en el repo) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato transformers) y `head.pt` con los pesos de la cabeza de clasificacion |
| Tarea principal | text-classification (clasificacion de sentimiento en 3 clases) |
| Modelo base | ProsusAI/finbert |
| Dataset de entrenamiento | Pugnola/finance-news-sentiment-35k (39.965 titulares en ingles, etiquetado por LLM) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base ProsusAI/finbert, un encoder transformer bidireccional de la familia BERT orientado a dominio financiero. Sobre el se anade una cabeza de clasificacion nueva de tres clases que opera sobre `pooler_output`, sustituyendo la cabeza original. El entrenamiento usa pesos de clase calculados como raiz cuadrada de la frecuencia inversa, aproximadamente [positive 1,44, negative 1,20, neutral 0,74], con AdamW y learning rate constante de 2e-5, 3 epocas, batch de 16, longitud maxima de 128 tokens y padding dinamico. La seleccion del checkpoint se hizo por mejor macro F1 de validacion (epoca 3: accuracy 0,848 / F1 0,812). Todo el ajuste fino se ejecuto en 60 minutos sobre un MacBook Air M4 de 16 GB usando MPS. Una variante con warmup y decaimiento lineal a 5 epocas obtuvo la misma accuracy (0,845 / 0,809 sobre el dataset v1) pero peor calibracion (ECE 0,130) y no se publico.

Los datos de entrenamiento son 39.965 titulares financieros en ingles extraidos mayoritariamente de unos pocos canales de Telegram, etiquetados por dos jueces LLM independientes con un tercer modelo como arbitro. La concordancia entre jueces es del 85 %, lo que establece un techo practico de etiquetado. El conjunto de test tiene 3.500 titulares y permanece congelado entre versiones. La version v2 incorpora 4.997 filas adicionales seleccionadas por aprendizaje activo a partir de los errores del modelo; segun el autor, esto mejoro ligeramente la parte limpia del test pero no la parte de calidad de arbitraje, lo que sugiere que el rendimiento esta limitado por el ruido de las etiquetas y no por el volumen de datos. La innovacion tecnica destacable no es arquitectonica, sino metodologica: etiquetado con paneles de LLM mas arbitraje, publicacion de metricas de calibracion y versionado explicito de las recetas de datos.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases: `positive`, `negative`, `neutral`, aplicada a titulares de noticias financieras en ingles.
- Interpretacion del sentimiento como impacto para el inversor, no como tono del texto: por ejemplo, un shock de oferta en materias primas se etiqueta como positivo para el activo en cuestion.
- Puntuacion de confianza por prediccion, con calibracion publicada (confianza media 0,935, ECE 0,087), lo que permite construir umbrales de decision y derivar a revision humana.
- Cobertura del 76 % de los titulares con accuracy del 92,8 % cuando se filtra por confianza >= 0,95.
- Rendimiento en CPU o GPU de gama baja, apto para procesar volumenes altos de titulares en pipelines de streaming.
- Compatibilidad con la libreria transformers mediante `pipeline("text-classification")`, y con endpoints compatibles segun los tags del repositorio (`endpoints_compatible`, `text-embeddings-inference`).
- No genera texto: es exclusivamente un modelo discriminativo de clasificacion.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento ni de capacidades de agente multi-paso.
- No soporta vision, audio ni multimodalidad.
- Multilingue: no. Solo ingles (`language: en`).
- Entrada limitada a 128 tokens; no procesa documentos completos sin truncar.

## Casos de uso

- Filtrado y priorizacion de noticias en tiempo real: el modelo asigna sentimiento y confianza a cada titular entrante; con el umbral de 0,95 se puede automatizar el 76 % del flujo con un 92,8 % de accuracy y dejar el resto a revision, reduciendo el coste de monitorizacion humana.
- Monitorizacion de canales de Telegram y agregadores financieros: es el dominio exacto de entrenamiento (titulares de canales de Telegram), por lo que la distribucion de entrada coincide con la de entrenamiento y el rendimiento esperado es el reportado en la model card.
- Generacion de senales para estrategias cuantitativas: la etiqueta y la confianza se pueden usar como feature discreta en modelos de trading o de riesgo, aprovechando que la calibracion permite ponderar la senal por fiabilidad.
- Vigilancia de cartera y alertas de riesgo: dada una lista de posiciones, un pipeline que busque titulares por entidad y los clasifique permite disparar alertas cuando aparece sentimiento negativo con alta confianza sobre un activo en cartera.
- Triaje editorial en medios financieros: clasificacion automatica de titulares entrantes por polaridad para priorizar la cobertura, ordenar un feed o etiquetar contenido en un CMS.
- Etiquetado asistido y ampliacion de datasets de NLP financiero: el modelo sirve como preanotador para nuevas fuentes, dejando a revision humana solo los casos de baja confianza, dado que los errores se concentran en la frontera neutral/direccional (86 % de los errores) y los cambios de polaridad son raros.
- Enriquecimiento de series temporales macro: clasificar titulares sobre decisiones de la Fed, el BCE, aranceles o geoplitica permite construir indices diarios de sentimiento por tema, un caso para el que el entrenamiento fue explicitamente sesgado en cobertura.
- Control de calidad en procesos de extraccion de datos: al devolver probabilidades calibradas, se puede usar como detector de inconsistencias en titulares parseados o traducidos antes de ingestarlos en un data warehouse.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el split de test de Pugnola/finance-news-sentiment-35k, con 3.500 titulares:

| Metrica | Valor |
|---|---|
| Accuracy | 0,847 |
| Macro F1 | 0,810 |
| F1 positive | 0,757 (precision 0,76 / recall 0,75) |
| F1 negative | 0,778 (precision 0,83 / recall 0,73) |
| F1 neutral | 0,895 (precision 0,87 / recall 0,92) |
| Confianza media | 0,935 |
| ECE (error de calibracion esperado) | 0,087 |
| Cobertura con confianza >= 0,95 | 76 % de los titulares, con 92,8 % de accuracy |

Comparativa entre versiones publicadas:

| Version | Revision | Datos de entrenamiento | Accuracy | Macro F1 | ECE |
|---|---|---|---|---|---|
| v1 (3 sep 2026) | tag `v1-a2` | 27.973 filas (dataset v1) | 0,842 | 0,808 | 0,096 |
| v2 (4 sep 2026) | `main` | 32.970 filas (dataset v2, + 4.997 filas de aprendizaje activo) | 0,847 | 0,810 | 0,087 |

Referencia externa citada por el autor: el paper de FinBERT (Araci 2019) reporta 0,86 de accuracy sobre Financial PhraseBank con etiquetado humano. El autor situa el resultado de este modelo en el techo de ruido de etiqueta de sus datos generados por LLM (concordancia entre jueces del 85 %). La diferencia entre v1 y v2 equivale a unos 17 titulares de 3.500 y esta dentro del ruido; ambas versiones coinciden en el 88,7 % de las predicciones de test.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB para lotes pequenos en fp32 y del orden de 0,5 GB en fp16, considerando que el repositorio completo ocupa 0,9 GB. Es una estimacion derivada del tamano del repositorio y de la familia del modelo base, no un dato declarado por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. No se requiere A100 ni H100; modelos de gama de entrada como una GTX 1650 o una T4 son suficientes.
- Cabe en GPU de consumo: si, en cualquier RTX de la familia 30/40 o equivalente. Tambien funciona en CPU y en Apple Silicon, dado que el propio ajuste fino se completo en un MacBook Air M4 de 16 GB con MPS en 60 minutos.
- Opciones de despliegue: pipeline de transformers, Text Generation Inference (el repo incluye el tag `endpoints_compatible`), Hugging Face Inference Endpoints y despliegue propio con PyTorch. No hay pesos GGUF publicados, por lo que no se puede ejecutar directamente en llama.cpp u Ollama; tampoco hay variantes ONNX, TensorRT ni cuantizaciones AWQ/GPTQ disponibles.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de inferencia; el unico dato temporal es el de entrenamiento (60 minutos en MPS), que no es extrapolable al servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pugnola/finbert-finance-news-sentiment | no disponible (familia BERT-base) | 128 tokens | Accuracy 0,847 / macro F1 0,810 en Finance News Sentiment 40k (test, datos declarados por el autor) | MIT | HuggingFace, revisiones `main` (v2) y `v1-a2` |
| ProsusAI/finbert (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | 0,86 de accuracy segun el paper de Araci (2019) sobre Financial PhraseBank con etiquetado humano | no disponible en la informacion proporcionada | HuggingFace |

No se han proporcionado datos de otros modelos comparables en la informacion disponible. Cualquier comparacion adicional con alternativas de la misma categoria (por ejemplo, otros clasificadores de sentimiento financiero) requeriria consultar sus respectivas fichas tecnicas, ya que no se incluyen aqui.

## Limitaciones y advertencias

- Sesgo de dominio y de periodo: el entrenamiento proviene de titulares de unos pocos canales de Telegram, concentrados en un unico ano con abundante geoplitica, aranceles y politica de la Reserva Federal. Se espera menor accuracy en otras fuentes, en textos mas largos o en otros periodos temporales.
- Sesgo de fuente: la distribucion de entrada (titulares de Telegram) condiciona el rendimiento; en prensa generalista, informes de analistas o notas de prensa corporativas el comportamiento puede degradarse sin que el autor haya publicado mediciones al respecto.
- Etiquetas generadas por LLM: no existe un conjunto de referencia humano (gold set), y la concordancia entre jueces es del 85 %, lo que fija un techo de ruido de etiqueta. El propio autor senala que anadir 5.000 filas dificiles seleccionadas por el modelo (v2) no mejoro la parte de calidad de arbitraje del test.
- La clase neutral es amplia por diseno: incluye datos rutinarios, declaraciones y movimientos pequenos, lo que explica parte de la confusion con las clases direccionales.
- Patron de error: el 86 % de los errores son confusiones neutral <-> direccional; los cambios de polaridad (positivo por negativo) son raros, pero existen.
- Calibracion imperfecta: ECE de 0,087, con una confianza media de 0,935. La confianza del modelo no debe interpretarse como probabilidad exacta sin recalibracion adicional.
- Longitud de entrada: solo 128 tokens. Los titulares y textos mas largos se truncan, con la consiguiente perdida de informacion.
- Idioma: unicamente ingles. No hay soporte declarado para castellano ni para otras lenguas.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre; el riesgo equivalente es la clasificacion erronea con confianza alta, especialmente en titulares ambiguos o con sentimiento mixto.
- Diferencia entre versiones no significativa: la mejora de v1 a v2 (0,842 -> 0,847 de accuracy) equivale a unos 17 titulares sobre 3.500 y esta dentro del ruido; no debe presentarse como una mejora sustancial.
- Uso comercial: la licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones del modelo base ProsusAI/finbert y del dataset de entrenamiento, que no se detallan en la informacion proporcionada.
- No apto como asesoramiento financiero: el propio criterio de etiquetado ("es bueno o malo para un inversor") es una heuristica de anotacion, no una recomendacion de inversion.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 "likes", sin verificacion independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pugnola/finbert-finance-news-sentiment
- Dataset de entrenamiento: https://huggingface.co/datasets/Pugnola/finance-news-sentiment-35k
- Repositorio con scripts de entrenamiento y pipeline de etiquetado: https://github.com/Pugnola/finance-news-sentiment
- Modelo base: https://huggingface.co/ProsusAI/finbert
- Paper de FinBERT (Araci, 2019): https://arxiv.org/abs/1908.10063
