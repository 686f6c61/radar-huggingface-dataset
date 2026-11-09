# OEGtech/oeg-pii-ru-lite

## Resumen

OEG PII RU Lite 0.1.0 es un modelo de clasificación de tokens (token classification) especializado en la detección de datos personales (PII) en texto ruso. Lo desarrolla OEG (oegtech.ru) como un fine-tune del modelo `redmadrobot-rnd/rubert-base-pii-ner`, una variante de ruBERT-base con 178 millones de parámetros. Su propósito es identificar entidades sensibles en transcripciones de llamadas telefónicas (donde los números aparecen escritos como palabras y sin puntuación) y en texto de chat desordenado, para sustituirlas por marcadores reversibles como `[ТЕЛЕФОН_1]`.

La relevancia del modelo radica en su enfoque en un dominio especialmente difícil: el habla transcrita. Mientras que el modelo base detecta solo el 42,41% de las entidades en llamadas simuladas, esta versión alcanza el 95,79%, manteniendo una precisión del 92,20%. Cubre 28 tipos de entidades, incluyendo 7 nuevos respecto al modelo base (fecha de nacimiento, nicks de Telegram y MAX, cuenta bancaria, cuenta corresponsal, BIK y KPP).

Se trata de una versión preview (0.1.0) publicada bajo licencia Apache 2.0, con limitaciones documentadas explícitamente por el autor, especialmente en lo relativo a datos bancarios con indicadores en mayúsculas y a la ausencia de validación sobre transcripciones reales con errores de reconocimiento de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, ruBERT-base) con cabeza de clasificación de tokens |
| Parametros totales | 177.760.569 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16/fp32; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Modelo base | redmadrobot-rnd/rubert-base-pii-ner |
| Etiquetas | 57 (43 heredadas + 14 nuevas) |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de ruBERT-base (178M parámetros) con una cabeza de clasificación de tokens extendida de 43 a 57 etiquetas. Las etiquetas del modelo base conservan sus pesos originales, mientras que las 14 nuevas se inicializan y entrenan desde cero. La arquitectura es un transformer encoder estándar, adecuado para tareas de etiquetado secuencial (NER) y no para generación.

El entrenamiento utilizó 173.193 filas, un tercio de ellas sin datos personales. Las fuentes son `redmadrobot-rnd/pii_train` (MIT), con números de documento reemplazados por valores sintéticos del mismo formato y algunos nombres transliterados a latín, y un fragmento de `Den4ikAI/russian_dialogues` (MIT) con unas 106.000 líneas cortas de chats abiertos de Telegram, filtradas por reglas y un modelo para eliminar dígitos, enlaces, nombres y conversaciones sobre datos personales. Todos los datos personales del entrenamiento son ficticios, generados con Faker y generadores de formato. Se generaron variantes de texto: normal, sin puntuación y llamada simulada (números como palabras, muletillas, palabras omitidas y erratas).

Los hiperparámetros fueron 4 épocas, learning rate 2e-5 con decaimiento lineal, batch de 32, bf16 y peso 0,5 para la clase O. Se seleccionó la época 3 por F1 sobre un conjunto de validación. El entrenamiento se realizó en un único portátil con GPU NVIDIA RTX Spark N1X. El conjunto `pii_benchmark` no se usó en entrenamiento. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo discriminativo.

## Capacidades

- Detección de 28 tipos de entidades PII en ruso: nombres, apellidos, patrones, fecha de nacimiento, direcciones (país, región, distrito, ciudad, calle, casa), contactos (teléfono, email, URL, IP, nicks de Telegram y MAX), documentos (pasaporte, INN, SNILS, OMS, permiso de conducir, identidad militar, certificado de nacimiento, tarjeta de crédito) y datos bancarios (cuenta, cuenta corresponsal, BIK, KPP).
- Normalización de números hablados: reconoce teléfonos dictados como palabras ("восемь девятьсот шестнадцать...").
- Procesamiento de texto sin puntuación y en minúsculas, orientado a transcripciones ASR.
- Enmascaramiento reversible mediante placeholders en ruso (`[ИМЯ_1]`, `[ТЕЛЕФОН_1]`) con el script `oeg_pii_mask.py` incluido en el repositorio.
- Etiquetado a nivel de palabra completa (el script auxiliar segmenta el texto; el pipeline estándar con agregación de sub-tokens da peores resultados).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un modelo discriminativo de etiquetado.

## Casos de uso

- Anonimización de transcripciones de call centers: el modelo detecta teléfonos, nombres y documentos dictados oralmente, incluyendo números escritos como palabras, lo que permite enmascarar la transcripción antes de almacenarla o enviarla a un sistema de analítica.
- Cumplimiento de protección de datos en pipelines ASR: integrado como paso posterior al reconocimiento de voz, sustituye entidades por placeholders reversibles y permite conservar el mapa de sustitución en un almacén seguro separado.
- Moderación y limpieza de chats de Telegram: los nicks `TG_NICK` y `MAX_NICK` añadidos permiten detectar identificadores de mensajería en texto desordenado de grupos y canales.
- Preprocesamiento para entrenamiento de modelos: eliminar PII de corpus rusos extraídos de diálogos abiertos antes de reutilizarlos, reduciendo el riesgo de memorización de datos personales.
- Enmascaramiento en sistemas de ticketing y soporte: detectar tarjetas de crédito, cuentas bancarias e INN en mensajes de usuarios antes de que lleguen a agentes o a registros persistentes.
- Seudonimización reversible en flujos de análisis: el mapa `mapping` permite restaurar el texto original tras procesar métricas o realizar búsquedas sobre datos enmascarados.
- Filtrado de datos en entornos de investigación con textos rusos: detectar y separar documentos con PII antes de compartir conjuntos de datos entre equipos.

## Benchmarks y rendimiento

Las métricas se calculan por palabra. "Encontrado" es la proporción de entidades reales tocadas por al menos una etiqueta de cualquier tipo; "precisión" es la proporción de etiquetas que caen sobre una entidad real. Ninguno de los conjuntos se usó para entrenamiento ni selección del modelo. El protocolo de evaluación difiere del de la model card del modelo base, por lo que las cifras no son comparables directamente entre ambas fichas; la tabla siguiente evalúa ambos modelos con el mismo criterio.

| Test | Modelo base: encontrado / precisión | OEG PII RU Lite: encontrado / precisión |
|---|---|---|
| pii_benchmark, texto normal (5.614 entidades) | 95,46% / 98,48% | 96,96% / 96,09% |
| pii_benchmark, sin puntuación, minúsculas | 83,29% / 98,41% | 95,06% / 96,01% |
| pii_benchmark, llamada simulada (números como palabras) | 42,41% / 98,57% | 95,79% / 92,20% |
| Test manual de OEG (102 entidades, 108 líneas) | 54,37% / 94,92% | 88,24% / 96,77% |

Solo con valores nunca vistos en entrenamiento: en llamadas simuladas el modelo encuentra el 94,85% (base 36,35%) y en texto normal el 96,78% (base 93,58%).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp16/bf16 (178M parámetros); en torno a 0,4 GB con cuantización a 8 bits y 0,2 GB a 4 bits, aunque el autor no documenta cuantizaciones específicas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; cabe en GTX 1650, RTX 3050, RTX 4090, A100 y H100 sin problema. También es viable en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en equipos integrados.
- Opciones de despliegue: transformers con el script `oeg_pii_mask.py` del repositorio (recomendado por el autor), pipeline estándar de transformers (menos preciso según el autor), y servidores de inferencia compatibles con modelos transformers como TGI o vLLM (no verificados por el autor). El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (178M parámetros, encoder BERT), se espera latencia de milisegundos por frase en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Encontrado en llamadas simuladas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OEG PII RU Lite 0.1.0 | 177,8M | no disponible | 95,79% | Apache 2.0 | Hugging Face |
| redmadrobot-rnd/rubert-base-pii-ner | 178M (aprox.) | no disponible | 42,41% | Apache 2.0 | Hugging Face |
| Otros modelos PII en ruso | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base, del que mejora sustancialmente en texto sin puntuación y en llamadas simuladas, a costa de un aumento de falsos positivos en texto normal (etiquetas extra en 56 de 371 frases sin datos personales, frente a 13 del base). No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Datos bancarios con indicadores en mayúsculas: "БИК 044525225", "КПП 231001001" y "к/сч …" se detectan mal en el test manual (KPP y cuenta corresponsal 0 de 2, BIK 2 de 4). Las variantes en minúsculas ("бик", "кпп", "р/с") funcionan mejor. Pendiente de corrección en la 0.2.0.
- Nicks sin indicador explícito ("ник vadim_prokat") y año de nacimiento ("1994 г.р.") se pierden con frecuencia.
- Más falsos positivos que el modelo base: en texto normal aparecieron etiquetas extra en 56 de 371 frases sin datos personales (13 en el base).
- Las llamadas de evaluación son simuladas mediante reescritura programática; no se ha medido la calidad sobre transcripciones reales con errores de reconocimiento de voz.
- Nombres extranjeros en texto en inglés y abreviaturas ("СПБ") se detectan con menos frecuencia que otros tipos.
- El test manual fue escrito por el propio equipo y es pequeño; no existe anotación independiente.
- El modelo es una capa de protección: no garantiza la anonimización completa ni el cumplimiento de la ley rusa 152-FZ ni de ninguna otra normativa. La sustitución reversible es seudonimización, y esos datos pueden seguir considerándose personales.
- Riesgo de alucinación no aplicable en sentido generativo (es un modelo discriminativo), pero sí de etiquetado erróneo tanto por omisión como por exceso.
- El mapa `mapping` contiene los valores reales y debe custodiarse por separado; el autor lo advierte explícitamente.
- Solo soporta ruso; no hay capacidades multilingües documentadas.
- Estado preview (0.1.0): el autor recomienda leer las limitaciones antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OEGtech/oeg-pii-ru-lite
- Modelo base: https://huggingface.co/redmadrobot-rnd/rubert-base-pii-ner
- Dataset de entrenamiento: https://huggingface.co/datasets/redmadrobot-rnd/pii_train
- Dataset de evaluación: https://huggingface.co/datasets/redmadrobot-rnd/pii_benchmark
- Dataset de diálogos: https://huggingface.co/datasets/Den4ikAI/russian_dialogues
- Sitio del autor: https://oegtech.ru
- Faker (generación de datos sintéticos): https://github.com/joke2k/faker
