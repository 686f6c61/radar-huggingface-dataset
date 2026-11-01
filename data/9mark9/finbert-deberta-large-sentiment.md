# 9mark9/finbert-deberta-large-sentiment

## Resumen

`finbert-deberta-large-sentiment` es un clasificador de sentimiento financiero en ingles desarrollado por el usuario 9mark9. Se construye mediante fine-tuning de `microsoft/deberta-v3-large` (435 millones de parametros) sobre una mezcla de datos financieros: Financial PhraseBank, tuits financieros y titulares de notas de prensa. La tarea es de clasificacion de texto en tres clases: negativo, neutral y positivo. Resuelve el problema del analisis de sentimiento en dominios financieros, donde los modelos genericos de proposito general rinden peor por la terminologia y el tono especificos del sector.

El modelo se posiciona como la version grande de un hermano compacto (`9mark9/finbert-minilm-sentiment`, 33,4 M de parametros). La propuesta de valor es clara: cuando la precision importa mas que la latencia, esta variante ofrece mejoras de entre 3 y 4 puntos porcentuales en conjuntos de validacion frente al modelo pequeno, a costa de 13 veces mas parametros y aproximadamente 19 veces mas latencia en CPU. La licencia MIT y el formato safetensors facilitan su integracion en pipelines de produccion.

Es relevante ahora porque el analisis de sentimiento financiero a escala (noticias, redes sociales, comunicados) sigue siendo una tarea de alto volumen donde un clasificador ligero y preciso es preferible a un LLM generativo por coste y determinismo. El modelo declara resultados muy altos en PhraseBank (99,41 % de accuracy) y solidos en tuits financieros (90,16 %), con la advertencia de que los numeros dependen de la version de `transformers` utilizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, atencion desacoplada y embeddings de posicion mejorados) |
| Parametros totales | 435.064.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card indica evaluacion con 96 tokens; el maximo de DeBERTa-v3-large es 512, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32/safetensors; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | microsoft/deberta-v3-large |
| Pipeline | text-classification |
| Tarea | Clasificacion de sentimiento financiero (negativo / neutral / positivo) |
| Tamano del repositorio | 1,7 GB |
| Libreria | transformers |
| Descargas | 39 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder basado en DeBERTa-v3-large, que introduce atencion desacoplada (contenido y posicion calculados por separado) y un mecanismo de embeddings de posicion mejorado respecto a DeBERTa-v2. Sobre este backbone se anade una cabeza de clasificacion de tres clases para la tarea de sentimiento financiero. No se trata de un modelo generativo ni de mezcla de expertos: es un clasificador discriminativo puro, lo que implica que su salida es una distribucion sobre tres etiquetas y no texto libre.

El entrenamiento parte de los pesos preentrenados de `microsoft/deberta-v3-large` y aplica fine-tuning con la misma mezcla de datos que la version compacta v3: Financial PhraseBank, tuits financieros de `zeroshot/twitter-financial-news-sentiment` y titulares de notas de prensa de `Jean-Baptiste/financial_news_sentiment`. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta de la mezcla, la presencia de RLHF/DPO (no aplicable a una tarea de clasificacion) ni hiperparametros de fine-tuning. Si se documenta que los conjuntos de evaluacion son held-out y no se usaron para entrenar ni para seleccionar el modelo, y que las diferencias frente al modelo pequeno se acompanan de intervalos de confianza bootstrap (2.000 remuestreos). La evaluacion se realizo en fp32 con 96 tokens de longitud.

Una innovacion destacable es la transparencia metodologica: el autor reporta intervalos de confianza pareados y advierte explicitamente de que los resultados cambian segun la version de `transformers` (4.57.6 frente a 5.x), sin aislar la causa. Esta trazabilidad es poco habitual en fine-tunes pequenos y facilita la reproducibilidad.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases (negativo, neutral, positivo) sobre texto corto en ingles.
- Analisis de frases de informes financieros, titulares de noticias y mensajes de redes sociales de tematica bursatil.
- Salida de probabilidades por clase, apta para umbrales y agregaciones posteriores.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un clasificador, no un LLM.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- No incluye modo thinking, vision ni audio.
- Compatible con `text-embeddings-inference` y endpoints compatibles segun los tags del repositorio.

## Casos de uso

- Monitorizacion de sentimiento en noticias financieras: el modelo clasifica titulares y entradas de prensa en tiempo real para alimentar paneles de riesgo reputacional o de mercado, aprovechando su alta precision en PhraseBank (99,41 %) para textos formales.
- Analisis de redes sociales bursatiles: clasificacion de tuits financieros a gran volumen (90,16 % de accuracy en validacion) para detectar cambios de tono en torno a un valor o sector, con un coste computacional bajo frente a un LLM generativo.
- Filtrado previo en pipelines de senales de trading: el clasificador actua como primera etapa que descarta o prioriza noticias segun su polaridad antes de pasarlas a modelos mas costosos, reduciendo el volumen a procesar.
- Enriquecimiento de bases de datos de eventos financieros: etiquetado retrospectivo de grandes corpus de comunicados y titulares para construir series temporales de sentimiento por empresa o sector.
- Moderacion y triaje de alertas en mesas de analisis: clasificacion automatica de mensajes entrantes para que los analistas prioricen los de sentimiento negativo o inusual.
- Investigacion academica en finanzas computacionales: uso como baseline fuerte y reproducible (licencia MIT, intervalos de confianza publicados) para comparar metodos de analisis de sentimiento en dominios financieros.
- Integracion en APIs de datos financieros: servicio de clasificacion bajo demanda para clientes que necesitan etiquetar textos propios con un modelo ligero y determinista, desplegable con `transformers` o `text-embeddings-inference`.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente; `verified: false` en el model-index). Evaluacion en fp32 con 96 tokens y `transformers` 4.57.6. Las diferencias se comparan con el modelo compacto `9mark9/finbert-minilm-sentiment` (v3), con intervalos de confianza bootstrap al 95 %.

| Conjunto | n | Accuracy v3 | Accuracy este modelo | Cambio (puntos) [IC 95 %] | Macro-F1 v3 | Macro-F1 este modelo | Cambio [IC 95 %] |
|---|---|---|---|---|---|---|---|
| PhraseBank `AllAgree` test (15 %) | 340 | 97,94 | 99,41 | +1,47 [+0,00, +3,24] | 96,43 | 99,28 | +2,85 [+0,28, +5,97] |
| Tuits financieros, validacion | 2.388 | 86,43 | 90,16 | +3,73 [+2,47, +5,07] | 83,00 | 87,93 | +4,94 [+3,36, +6,57] |
| Titulares de prensa (JB), test | 267 | 75,28 | 78,28 | +3,00 [-2,25, +8,24] | 59,04 | 61,37 | +2,33 [-9,45, +14,79] |
| SEntFiN headlines, test | 933 | 75,99 | 79,74 | +3,75 [+1,29, +6,22] | 76,27 | 80,30 | +4,03 [+1,53, +6,51] |

Precision / recall por clase (negativo / neutral / positivo):

| Conjunto | Precision v3 | Recall v3 | Precision este modelo | Recall este modelo |
|---|---|---|---|---|
| PhraseBank | 0,953 / 1,000 / 0,944 | 0,911 / 0,990 / 0,988 | 0,978 / 1,000 / 0,989 | 1,000 / 0,990 / 1,000 |
| Tuits | 0,725 / 0,946 / 0,752 | 0,850 / 0,870 / 0,857 | 0,831 / 0,947 / 0,819 | 0,879 / 0,908 / 0,897 |
| JB headlines | 0,667 / 0,764 / 0,733 | 0,167 / 0,853 / 0,667 | 0,667 / 0,794 / 0,766 | 0,167 / 0,865 / 0,727 |
| SEntFiN | 0,850 / 0,676 / 0,811 | 0,722 / 0,825 / 0,723 | 0,891 / 0,696 / 0,866 | 0,792 / 0,836 / 0,762 |

Nota del autor: con `transformers` 5.x los mismos pesos obtienen 89,53 % en tuits (+3,10 frente a v3, IC 95 % [+1,80, +4,44]) y el resto de conjuntos no cambia. Se recomienda instalar `transformers>=4.51,<5` para reproducir los numeros reportados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB de pesos mas overhead de activaciones; en la practica, menos de 2 GB para lotes pequenos.
- VRAM estimada en fp16/bf16: aproximadamente 0,9 GB de pesos; en int8, alrededor de 0,45 GB (cuantizaciones no documentadas oficialmente, estimaciones a partir del numero de parametros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, L4, T4, RTX 4090, RTX 3090 y RTX 3060 son suficientes y en la mayoria de casos sobredimensionadas para un encoder de 435 M.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 2060 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` (Pipeline de text-classification), `text-embeddings-inference` (tag declarado), servidores de inferencia compatibles con endpoints de HuggingFace. No se documentan variantes GGUF para llama.cpp/Ollama ni ONNX.
- Latencia y throughput: no se publican cifras absolutas; la model card indica que este modelo tiene aproximadamente 19 veces la latencia en CPU del compacto de 33,4 M de parametros. En GPU la diferencia se reduce, pero sigue siendo notablemente mas lento que el modelo pequeno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy tuits financieros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `9mark9/finbert-deberta-large-sentiment` | 435 M | no disponible | 90,16 % (validacion) | MIT | HuggingFace |
| `9mark9/finbert-minilm-sentiment` (v3) | 33,4 M | no disponible | 86,43 % (validacion) | no disponible en la informacion | HuggingFace |
| FinBERT (ProsusAI/finbert) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| DeBERTa-v3-large base | 435 M | 512 tokens (segun arquitectura, no confirmado por el autor) | no aplica (no es clasificador de sentimiento) | MIT | HuggingFace |

La comparacion principal es interna: frente al modelo compacto del mismo autor, esta variante gana entre 1,5 y 4 puntos de accuracy segun el conjunto, a cambio de 13 veces mas parametros y unas 19 veces mas latencia en CPU. Frente a FinBERT y otras alternativas no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no soporta castellano ni otros idiomas; el rendimiento en textos no ingleses no esta evaluado.
- Clasificador de tres clases: no genera explicaciones ni texto; la salida es una etiqueta y probabilidades.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificacion erronea en textos ambiguos, ironicos o con sentimiento mixto; el recall en la clase negativa de titulares JB es muy bajo (0,167), lo que indica dificultad para detectar negativos sutiles en ese dominio.
- Sensibilidad a la version de la libreria: los resultados en tuits cambian de 90,16 % a 89,53 % entre `transformers` 4.x y 5.x; conviene fijar la version en produccion.
- Resultados no verificados de forma independiente (`verified: false`); proceden del autor del modelo.
- Longitud de contexto no documentada por el autor; la evaluacion usa 96 tokens, por lo que el comportamiento en textos largos no esta caracterizado.
- Sin cuantizaciones oficiales publicadas (GGUF, ONNX, int8); el despliegue en CPU a gran escala puede ser costoso frente al modelo compacto.
- Licencia MIT: permite uso comercial y modificacion, pero no se documentan garantias ni limitaciones adicionales por parte del autor.
- Sin datos de sesgo demografico o geografico; al estar entrenado en textos financieros en ingles, puede reflejar sesgos del dominio (por ejemplo, sobrerrepresentacion de empresas cotizadas en mercados anglosajones).
- Modelo con muy baja adopcion (39 descargas, 0 likes): no hay evidencia de uso en produccion ni comunidad que reporte fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/9mark9/finbert-deberta-large-sentiment
- Modelo compacto hermano: https://huggingface.co/9mark9/finbert-minilm-sentiment
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Dataset Financial PhraseBank: https://huggingface.co/datasets/takala/financial_phrasebank
- Dataset Twitter Financial News Sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- Dataset Jean-Baptiste financial news sentiment: https://huggingface.co/datasets/Jean-Baptiste/financial_news_sentiment
- Dataset SEntFiN: https://huggingface.co/datasets/tasksource/sentfin
