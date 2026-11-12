# AhamedT04/textsense-distilcamembert-sentiment-3c

## Resumen

TextSense DistilCamemBERT sentiment 3c es un clasificador de sentimiento en francés desarrollado por Ahamed Tidiane Tall (usuario AhamedT04) como modelo principal de la aplicación TextSense. Se trata de un fine-tuning de `cmarkea/distilcamembert-base-sentiment`, un DistilCamemBERT de 6 capas y aproximadamente 68 millones de parámetros, al que se le sustituyó la cabeza original de 5 estrellas por una cabeza de 3 clases (negative, neutral, positive) inicializada a partir de la cabeza original y posteriormente reentrenada.

El modelo resuelve un problema concreto de los clasificadores de sentimiento derivados de reseñas: la ausencia de una clase neutra realista. Al agrupar las estrellas 1-2 como negativo, 3 como neutro y 4-5 como positivo, y ajustar sobre tweets franceses anotados en tres clases, el modelo mejora de forma sustancial la detección de textos factuales, preguntas y consignas que los modelos de sentimiento convencionales tienden a clasificar erróneamente como positivos o negativos.

Es relevante por su carácter deliberadamente acotado y bien documentado: incluye un umbral de confianza calibrado (0,81), evaluación con intervalos de confianza bootstrap sobre dos conjuntos de test disjuntos (uno en dominio de tweets y otro de dominio general), análisis por fenómeno lingüístico y una versión ONNX int8. Todo ello bajo licencia MIT y con un coste de entrenamiento de aproximadamente 9 minutos en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilCamemBERT (transformer encoder, 6 capas) con cabeza de clasificación de 3 clases |
| Parametros totales | 68.097.027 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en inferencia (128 tokens durante el entrenamiento) |
| Tipos de cuantizacion | ONNX int8 (69 MB, ~4x mas rapido en CPU); safetensors en fp32 |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DistilCamemBERT de 6 capas y unos 68 millones de parámetros, sobre el que se monta una cabeza de clasificación lineal de 3 clases. El punto de partida es `cmarkea/distilcamembert-base-sentiment` (revisión 5716940), entrenado originalmente para predecir de 1 a 5 estrellas sobre reseñas de Amazon y Allociné. La innovación metodológica principal es la inicialización de la nueva cabeza de 3 clases a partir de la cabeza de 5 estrellas: el peso de la clase negativa se inicializa como la media de las estrellas 1 y 2, el de neutro desde la estrella 3, y el de positivo como la media de las estrellas 4 y 5. Posteriormente se realiza un fine-tuning completo.

El entrenamiento utiliza la parte francesa del dataset `cardiffnlp/tweet_sentiment_multilingual` (revisión 14b13ed): 1.839 ejemplos de entrenamiento, 324 de validación y 870 de test, con tres clases equilibradas. Se emplea AdamW con learning rate 3e-5, weight decay 0,01, planificación lineal con warmup del 10 %, batch de 16, un máximo de 4 épocas con early stopping (paciencia 2) seleccionando por macro-F1 de validación, y semilla 42. El entrenamiento completo se ejecutó en CPU Intel Core i7-1255U (12 hilos) en aproximadamente 9 minutos. La configuración se fijó antes de examinar los conjuntos de test, y las variantes con otras semillas (13 y 7) se usaron solo para medir estabilidad, no para seleccionar el mejor resultado.

## Capacidades

- Clasificación de sentimiento en francés en tres clases: negative, neutral y positive.
- Detección de textos factuales, preguntas y consignas como neutros (exactitud de 0,93 en factuel, 1,00 en question, 0,80 en consigne sobre el conjunto de evaluación general).
- Manejo razonable de negación (0,97 de exactitud) y contraste (0,97).
- Umbral de confianza calibrado (`textsense_confidence_threshold = 0.81`) para señalar predicciones de baja confianza.
- Versión ONNX int8 con pérdida mínima de rendimiento (macro-F1 0,882 frente a 0,885 en el conjunto general).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un clasificador de secuencia puro.
- Capacidad multilingüe: no disponible; solo francés.

## Casos de uso

- Moderación de comentarios en plataformas francesas: el modelo clasifica comentarios cortos y medios en tres niveles de sentimiento, y el umbral de 0,81 permite derivar a revisión humana las predicciones poco fiables (aproximadamente el 26 % de las predicciones en los conjuntos de test).
- Análisis de opiniones de clientes sobre reseñas y encuestas: la clase neutra realista evita el sesgo habitual de los modelos de estrellas que clasifican comentarios factuales como positivos; útil para separar feedback objetivo de quejas y elogios.
- Enrutamiento de tickets de soporte: los mensajes factuales o de consulta se etiquetan como neutros, lo que permite dirigirlos a colas informativas, mientras que los negativos se escalan a atención prioritaria.
- Monitorización de redes sociales: con 512 tokens de contexto y una versión ONNX int8 de 69 MB, puede procesar grandes volúmenes de tweets en CPU con un throughput notablemente superior al modelo fp32.
- Filtrado previo en pipelines de análisis de reputación: como primera etapa barata (9 minutos de entrenamiento, inferencia en CPU), descarta o prioriza textos antes de pasar a modelos generativos más costosos.
- Investigación en procesamiento de lenguaje natural en francés: sirve como línea base reproducible (semilla fija, configuración pública, intervalos de confianza bootstrap) para experimentos de clasificación de sentimiento de tres clases.

## Benchmarks y rendimiento

Macro-F1 con intervalo de confianza al 95 % (bootstrap, 1.000 remuestreos) sobre dos conjuntos de test:

| Modelo | textsense_eval_v1 | tweets_fr_test |
|---|---|---|
| Modelo original (estrellas agrupadas) | 0,510 [0,480–0,541] | 0,363 [0,335–0,390] |
| TF-IDF + regresión logística | 0,513 [0,462–0,564] | 0,264 [0,238–0,292] |
| Este modelo | 0,885 [0,851–0,917] | 0,723 [0,692–0,754] |

Rendimiento por clase (precisión / recall / F1):

| Clase | textsense_eval_v1 | tweets_fr_test |
|---|---|---|
| negative | 0,89 / 0,84 / 0,87 | 0,77 / 0,82 / 0,79 |
| neutral | 0,93 / 0,84 / 0,88 | 0,75 / 0,65 / 0,70 |
| positive | 0,85 / 0,97 / 0,91 | 0,66 / 0,70 / 0,68 |

Exactitud por fenómeno lingüístico en `textsense_eval_v1`:

| Fenomeno | n | Modelo original | Este modelo |
|---|---|---|---|
| explicite | 80 | 0,99 | 1,00 |
| negacion | 40 | 0,95 | 0,97 |
| contraste | 30 | 0,90 | 0,97 |
| implicite | 30 | 0,90 | 0,80 |
| ironia | 15 | 0,27 | 0,20 |
| factuel | 45 | 0,00 | 0,93 |
| question | 20 | 0,05 | 1,00 |
| consigne / annonce | 20 | 0,00 | 0,80 |
| lexique emotionnel sans jugement | 15 | 0,07 | 0,33 |

Estabilidad entre semillas (42, 13, 7): macro-F1 de 0,883 ± 0,003 en `textsense_eval_v1` y 0,724 ± 0,004 en `tweets_fr_test`. La versión ONNX int8 obtiene 0,882 y 0,705 respectivamente. La calibración muestra ECE de 0,146 en tweets de test, donde el umbral no alcanza el 85 % de exactitud objetivo (se queda en 79,9 % para las predicciones por encima del umbral).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (68 M de parámetros, ~270 MB de pesos); aproximadamente 69 MB en ONNX int8.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) puede ejecutarlo con latencias de milisegundos, pero el modelo está diseñado para CPU.
- Cabe en cualquier GPU consumer y en CPU convencional: el entrenamiento se completó en un Intel Core i7-1255U en 9 minutos.
- Opciones de despliegue: transformers con pipeline de text-classification, ONNX Runtime (versión int8), text-embeddings-inference (tag `text-embeddings-inference` presente), y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: la versión ONNX int8 es aproximadamente 4 veces más rápida que fp32 en CPU; no se han publicado cifras absolutas de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (textsense_eval_v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AhamedT04/textsense-distilcamembert-sentiment-3c | 68 M | 512 | 0,885 | MIT | Hugging Face |
| cmarkea/distilcamembert-base-sentiment (original, estrellas agrupadas) | no disponible | no disponible | 0,510 | no disponible | Hugging Face |
| TF-IDF + regresión logística (línea base) | no aplica | no disponible | 0,513 | no disponible | no disponible |

No se dispone de datos comparativos con otros clasificadores de sentimiento franceses de tres clases en la información proporcionada.

## Limitaciones y advertencias

- Ironía: rendimiento muy bajo (3 de 15 frases irónicas correctamente clasificadas, exactitud 0,20, inferior al modelo original).
- Textos largos: los textos de más de 512 tokens se truncan.
- Un solo idioma: no soporta otros idiomas distintos del francés.
- Calibración en dominio de tweets: el umbral de 0,81 no alcanza el 85 % de exactitud objetivo sobre tweets (79,9 %), con ECE de 0,146; el modelo es ligeramente demasiado confiado en ese dominio.
- Detección de léxico emocional sin juicio: exactitud baja (0,33), aunque superior al modelo original (0,07).
- Uso previsto restringido: no apto para decisiones individuales de alto impacto (selección de personal, moderación automática sin control humano, salud), ni para detección de emociones finas.
- Predicciones por debajo del umbral de confianza deben tratarse como indicativas y requerir revisión humana.
- Sesgos: no se detallan sesgos específicos más allá de las limitaciones de dominio e idioma indicadas; el entrenamiento sobre tweets puede introducir sesgos de registro lingüístico.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos a los evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhamedT04/textsense-distilcamembert-sentiment-3c
- Modelo base: https://huggingface.co/cmarkea/distilcamembert-base-sentiment
- Dataset de entrenamiento: https://huggingface.co/datasets/cardiffnlp/tweet_sentiment_multilingual
- Repositorio de la aplicación TextSense: https://github.com/AhamedT04/TexteSense
- Documentación de experimentos: https://huggingface.co/AhamedT04/textsense-distilcamembert-sentiment-3c/blob/main/EXPERIMENTS.md
- Resultados: https://huggingface.co/AhamedT04/textsense-distilcamembert-sentiment-3c/blob/main/reports/RESULTS.md
- Ficha del conjunto de evaluación: https://huggingface.co/AhamedT04/textsense-distilcamembert-sentiment-3c/blob/main/data/eval/DATASHEET.md
