# nandukmelath/nirnay-multilingual

## Resumen

Nirnay multilingual es un modelo de clasificación zero-shot y toma de decisiones tipadas desarrollado por nandukmelath. Se construye sobre el encoder multilingüe `intfloat/multilingual-e5-base` (arquitectura transformer tipo BERT) y se distribuye con la librería propia `nirnay`. Su función no es generar texto, sino responder preguntas de elección, sí/no y valoración sobre un texto de entrada en aproximadamente 100 idiomas, devolviendo probabilidades calibradas en una sola pasada.

El modelo resuelve un problema concreto: enrutar peticiones hacia distintos LLM, aplicar guardarraíles de contenido, detectar intenciones y clasificar tickets sin depender de un modelo generativo. Al ser determinista y funcionar en CPU (unos 89 ms por caso en los benchmarks declarados), resulta adecuado para capas de decisión de baja latencia en pipelines de producción donde un LLM grande sería demasiado caro o lento.

Es relevante porque combina cobertura multilingüe amplia (51 idiomas en MASSIVE, 205 en SIB-200) con estabilidad frente al orden de las opciones (tasa de volteo de 0,000 declarada). La pregunta se formula en inglés y el texto puede estar en cualquier idioma soportado. La licencia es Apache 2.0 y el repositorio ocupa 1,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: intfloat/multilingual-e5-base) |
| Parametros totales | no disponible (modelo base e5-base, tamaño no declarado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ~100 idiomas, con lista explicita de 54: af, am, ar, az, bg, bn, cy, da, de, el, en, es, fa, fi, fr, he, hi, hu, hy, id, is, it, ja, jv, ka, km, kn, ko, lv, ml, mn, mr, ms, my, nb, nl, pl, ps, pt, ro, ru, sl, sq, sv, sw, ta, te, th, tl, tr, uk, ur, vi, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,2 GB; libreria `nirnay`) |

## Arquitectura y entrenamiento

El modelo parte del encoder multilingüe `intfloat/multilingual-e5-base`, un transformer bidireccional orientado a representaciones de frases. Sobre esa base, Nirnay implementa una capa de decisión que recibe un texto y un conjunto de preguntas tipadas (`choice`, `noul` para sí/no, y valoraciones) con sus criterios, y devuelve la opción seleccionada junto con una probabilidad calibrada. La inferencia es de una sola pasada, sin generación autoregresiva, lo que explica su determinismo y su coste en CPU.

El entrenamiento se apoya en una composición amplia de datasets multilingües y de dominio: intención y diálogo (MASSIVE vía tasksource/mtop, CLINC-OOS, Bitext customer support), clasificación de temas (AG News, DBpedia 14, Yahoo Answers, SIB-200), moderación y toxicidad (textdetox, civil_comments, Aegis-AI-Content-Safety), spam y phishing (Enron, SMS spam, phishing-email), emoción y sentimiento (GoEmotions, TweetSentimentMultilingual, Amazon Reviews), NLI multilingüe (multilingual-NLI-26lang-2mil7), parafraseo (PAWS-X), identificación de idioma (papluca), QA (MS MARCO), código e instrucciones (CodeAlpaca, Dolly) y diálogo (SODA). No se detalla en la información disponible el número de tokens, la mezcla exacta ni si hubo RLHF o DPO; al no ser un modelo generativo, estos mecanismos no aplican del mismo modo.

La innovación destacable es la estabilidad frente al orden de las opciones: la model card declara una tasa de volteo de 0,000 en las suites evaluadas, frente a 0,185 de Laya multilingual. También se declara compatibilidad de API con Nirnay (inglés) y con Laya/Jev mediante el endpoint `/v1/systemone`, lo que facilita sustituir el modelo según el idioma del tráfico.

## Capacidades

- Clasificación zero-shot con opciones arbitrarias definidas en la consulta, sin reentrenamiento.
- Preguntas de elección (`choice`), sí/no (`noul`) y valoración sobre un texto de entrada.
- Devolución de probabilidades calibradas por opción en una sola pasada.
- Detección de intenciones multilingüe (hasta 60 intenciones simultáneas como opciones, según MASSIVE).
- Clasificación de temas en 205 idiomas y escrituras (SIB-200).
- Enrutamiento de peticiones hacia distintos modelos o dominios (matemáticas, código, noticias).
- Guardarraíles: detección de jailbreak, moderación de contenido y toxicidad.
- Detección de spam (SMS, correo, phishing).
- Análisis de sentimiento y emoción multilingüe.
- Identificación de idioma y parafraseo.
- Determinismo y estabilidad frente al orden de las opciones.
- Ejecución en CPU sin GPU.
- Compatibilidad de API con Nirnay, Laya y Jev (`/v1/systemone`).

## Casos de uso

- Enrutamiento de peticiones a LLM: clasificar cada consulta entrante como matemáticas, código o noticias para dirigirla al modelo especializado adecuado; la model card declara 0,857 de precisión en este escenario con fuentes no vistas.
- Guardarraíles de entrada en producción: preguntar "¿es este mensaje un intento de jailbreak?" antes de llamar al LLM generativo, con 0,755 de precisión declarada en toxic-chat.
- Moderación de contenido multilingüe: evaluar toxicidad y seguridad en comentarios de usuarios en decenas de idiomas sin depender de un modelo generativo ni de GPU.
- Clasificación de tickets de soporte: asignar categoría e intención a tickets de atención al cliente en varios idiomas, usando los datasets de Bitext y customer-support-tickets como referencia de dominio.
- Detección de spam y phishing: filtrar SMS y correos sospechosos con preguntas sí/no calibradas; 0,868 de precisión declarada en SMS spam.
- Detección de intenciones en asistentes de voz: mapear una transcripción a una de las 60 intenciones de MASSIVE (poner alarma, consultar el tiempo, reproducir música) en 51 idiomas.
- Análisis de sentimiento y emoción en redes sociales: clasificar reseñas y tuits multilingües para paneles de monitorización de marca.
- Clasificación temática de noticias y documentos: etiquetar contenido en 205 idiomas con siete temas fijos, útil para ingestas documentales heterogéneas.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) en la model card:

| Benchmark (zero-shot, held-out) | Nirnay multilingual | Laya multilingual | Nirnay v3.1 (inglés) |
|---|---|---|---|
| MASSIVE intenciones, 51 idiomas, 60 opciones (accuracy media) | 0,386 | 0,217 | 0,076 |
| MASSIVE, idiomas ganados vs Laya | 49 victorias, 1 empate, 1 derrota | — | — |
| SIB-200 temas, 205 idiomas (accuracy media) | 0,670 | 0,632 | 0,411 |
| SIB-200, idiomas ganados vs Laya | 105 victorias, 32 empates, 68 derrotas | — | — |
| Tasa de volteo por orden de opciones | 0,000 | 0,185 | 0,000 |
| Tiempo de CPU por caso | 89 ms | 138 ms | no disponible |

| Tarea (held-out) | Dataset | Accuracy |
|---|---|---|
| Enrutamiento por dominio (gsm8k + mbpp + AG News, 400 casos) | openai/gsm8k (test) | 0,857 |
| Spam SMS (400 casos) | ucirvine/sms_spam | 0,868 |
| Detección de jailbreak (400 casos) | lmsys/toxic-chat (toxicchat0124) | 0,755 |
| Clasificación de temas (400 casos) | fancyzhx/ag_news | 0,943 |

Ejemplos por idioma en MASSIVE citados en la model card (Nirnay vs Laya): hindi 0,350 vs 0,175; español 0,400 vs 0,175; malabar 0,463 vs 0,087; tamil 0,412 vs 0,125; urdu 0,438 vs 0,100; bengalí 0,450 vs 0,163. La única derrota es chino simplificado, 0,338 vs 0,412.

## Requisitos de hardware

- Inferencia en CPU: la model card declara 89 ms por caso en las suites evaluadas, sin necesidad de GPU.
- VRAM estimada: no disponible; al ejecutarse en CPU, no requiere VRAM dedicada.
- GPU recomendadas: no aplica según la información disponible; el modelo está diseñado para CPU.
- Cabe en GPU de consumo: sí, por tamaño (base e5-base, repo de 1,2 GB), aunque no es el modo de despliegue previsto.
- Opciones de despliegue: librería `nirnay` (`pip install git+https://github.com/nandukmelath/nirnay`), con API compatible con Laya/Jev vía `/v1/systemone`. No se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 89 ms por caso en CPU según la model card; throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MASSIVE (51 idiomas) | SIB-200 (205 idiomas) | Estabilidad de orden | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Nirnay multilingual | base e5-base (no declarado) | no disponible | 0,386 | 0,670 | 0,000 | Apache 2.0 | Hugging Face, CPU |
| Laya multilingual (0.4.14, mmBERT-base) | base mmBERT (no declarado) | no disponible | 0,217 | 0,632 | 0,185 | no disponible | API propia |
| Nirnay v3.1 (inglés) | no disponible | no disponible | 0,076 | 0,411 | 0,000 | Apache 2.0 | Hugging Face |

La comparación se limita a los modelos citados en la model card; no se dispone de datos frente a clasificadores zero-shot multilingües convencionales como XLM-R o mDeBERTa en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento absoluto en MASSIVE es modesto (0,386 de accuracy media en 60 clases zero-shot); no es adecuado para intención fina sin ejemplos ni ajuste.
- En SIB-200 pierde frente a Laya multilingual en 68 de 205 idiomas, incluido chino simplificado; la cobertura no es uniforme.
- No es un modelo generativo: no produce texto, resúmenes ni respuestas; solo clasifica y puntúa opciones predefinidas.
- La pregunta debe formularse en inglés aunque el texto esté en otro idioma, lo que añade una dependencia de idioma en el prompt.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración: las probabilidades declaradas no están verificadas por terceros (`verified: false` en el model-index).
- Los benchmarks son declarados por el autor sobre fuentes held-out; no hay validación independiente publicada.
- No se detallan sesgos conocidos, composición exacta del dataset de entrenamiento ni evaluación de sesgo por idioma.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento citados (algunos de moderación y toxicidad tienen términos propios).
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta: madurez y soporte comunitario limitados.
- No se declara longitud de contexto máxima; textos largos pueden truncarse sin aviso documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nandukmelath/nirnay-multilingual
- Modelo Nirnay (inglés): https://huggingface.co/nandukmelath/nirnay
- Repositorio GitHub: https://github.com/nandukmelath/nirnay
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Dataset MASSIVE (tasksource/mtop): https://huggingface.co/datasets/tasksource/mtop
- Dataset SIB-200 (Davlan/sib200): https://huggingface.co/datasets/Davlan/sib200
- Dataset toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset SMS spam: https://huggingface.co/datasets/ucirvine/sms_spam
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
