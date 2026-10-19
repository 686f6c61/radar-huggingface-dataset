# Flo976/malagasy-punctuation

## Resumen

`Flo976/malagasy-punctuation` es un modelo de restauración de mayúsculas y puntuación para malgache (código `mg`), diseñado específicamente como postprocesador de salidas de reconocimiento automático del habla (ASR). Los sistemas ASR suelen emitir texto en minúsculas, sin signos y con las letras acentuadas normalizadas; este modelo recibe esa cadena y devuelve el texto con mayúsculas, comas, puntos, signos de interrogación y exclamación, dos puntos y acentos restituidos (`tan na` → `tanàna`), sin alterar jamás las palabras. Lo desarrolla Flo976 y se publicó en HuggingFace en octubre de 2026, sin descargas ni valoraciones registradas hasta la fecha.

Técnicamente es un encoder transformer XLM-RoBERTa base (afinado previamente sobre malgache por Davlan) con una única cabeza de clasificación de tokens de 28 clases: 4 patrones de capitalización (minúscula, Capitalizada, MAYÚSCULA, mixta) × 7 marcas de puntuación (ninguna, `,` `.` `?` `!` `:` `;`). La predicción se lee en el primer sub-token de cada palabra. Al ser un clasificador y no un modelo generativo, la salida está acotada por construcción: no puede inventar, eliminar ni reescribir palabras, y el autor verifica mediante aserción que `normalize(output) == normalize(input)`.

Su relevancia práctica es acotada pero clara: cuantifica la mejora sobre la salida real de un ASR malgache (18,47 % de WER con formato frente a 21,73 % de una línea base trivial de mayúscula inicial y punto final, es decir, −3,26 puntos con IC 95 % [−3,51, −3,02]). Con 277,5 M de parámetros y 1,1 GB en fp32, es un componente ligero que cabe en CPU y en cualquier GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de tokens de 28 clases |
| Parametros totales | 277.474.588 (~277,5 M) |
| Parametros activos | no procede (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en tokens; el texto largo se procesa en ventanas deslizantes de 150 palabras |
| Tipos de cuantizacion | fp32 (1,1 GB). La cuantizacion int8 dinamica degrada el modelo (F1 de coma de 54 a 19): el autor desaconseja cuantizar |
| Idiomas soportados | malgache (`mg`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (repo de 1,1 GB, libreria `transformers`) |
| Tarea / pipeline | `token-classification` |
| Modelo base | `Davlan/xlm-roberta-base-finetuned-malagasy` |
| Dataset de entrenamiento | `badrex/malagasy-speech-full` (transcripciones) + Wikipedia en malgache filtrada |
| Salida | 4 casos x 7 marcas por palabra; marcas: ninguna, `,` `.` `?` `!` `:` `;` |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-19 |

## Arquitectura y entrenamiento

El modelo parte de `Davlan/xlm-roberta-base-finetuned-malagasy`, un XLM-R base ya adaptado al malgache, y le añade una cabeza de clasificación de tokens con 28 clases que combina el caso de la palabra (minúscula, capitalizada, mayúscula, mixta) con la marca de puntuación que la sigue (ninguna, coma, punto, interrogación, exclamación, dos puntos, punto y coma). La predicción se lee únicamente en el primer sub-token de cada palabra, lo que evita que la tokenizacion por subpalabras fragmente la etiqueta. Adicionalmente, una tabla de acentos construida a partir del texto de entrenamiento restaura las letras acentuadas que la normalización del ASR elimina, con la misma garantía de no modificar palabras.

Los datos de entrenamiento son 0,93 M de palabras de transcripciones del split de entrenamiento de `badrex/malagasy-speech-full` más 1,5 M de palabras de oraciones filtradas de Wikipedia en malgache. Para robustez frente a errores del ASR, la mitad de las entradas de entrenamiento reciben errores sintéticos de estilo CTC (sustituciones de letras, palabras fusionadas o divididas). La selección del checkpoint se hizo exclusivamente sobre el split de validación y el test se usó una sola vez. El entrenamiento completo se ejecutó en una única RTX 5070 Ti en 13 minutos, lo que da idea del coste computacional tan bajo del ajuste.

No se menciona en la informacion disponible el uso de RLHF ni DPO (no procede en un modelo discriminativo de etiquetado). Tampoco se detalla el número total de tokens del corpus ni la composición exacta del dataset de Wikipedia más allá de estar "filtrado".

## Capacidades

- Restauración de mayúsculas con cuatro patrones: minúscula, Capitalizada, MAYÚSCULA y mixta.
- Predicción de puntuación tras cada palabra: ninguna, coma, punto, interrogación, exclamación, dos puntos y punto y coma (este último nunca se predice en la práctica).
- Restauración de acentos eliminados por la normalización del ASR (`tan na` → `tanàna`).
- Garantía de invariancia léxica: la secuencia de palabras de la salida es idéntica a la de la entrada, verificada por aserción y por un fuzz test.
- Robustez ante errores típicos de ASR (sustituciones, fusiones y divisiones de palabras) gracias al entrenamiento con ruido sintético CTC.
- Procesamiento de textos largos mediante ventanas deslizantes de 150 palabras.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un clasificador de tokens de dominio específico.

## Casos de uso

- Postprocesado de un pipeline ASR en malgache: encadenar `Flo976/w2v-bert-malagasy` (o cualquier ASR malgache) con este modelo para entregar transcripciones legibles con mayúsculas, comas y puntos; el WER con formato baja de 21,73 % a 18,47 % sobre salida real de ASR.
- Subtitulado y transcripción de audio: mejora la legibilidad de subtítulos generados automáticamente sin riesgo de que el postprocesador altere el contenido léxico, algo crítico cuando la transcripción tiene valor probatorio o documental.
- Generación de corpus limpios para PLN en malgache: normalizar texto en minúsculas y sin puntuar procedente de foros, redes o OCR para reutilizarlo en entrenamiento de modelos de lengua, manteniendo la fidelidad de las palabras.
- Preprocesado de textos para traducción automática o análisis sintáctico: la puntuación y las mayúsculas son señales de segmentación de oraciones que muchos pipelines downstream esperan encontrar.
- Indexación y búsqueda sobre transcripciones de voz: al segmentar correctamente en oraciones, mejora la calidad de los fragmentos indexados y la presentación de resultados.
- Accesibilidad: transcripción en vivo de contenido hablado en malgache para personas con discapacidad auditiva, con latencia de ~80 ms por intervención de 32 palabras en dos hilos de CPU, suficiente para un flujo conversacional por turnos.
- Normalización de salidas de OCR o de dictado en aplicaciones de toma de notas en malgache, donde el texto de entrada suele venir sin capitalización ni acentos.

## Benchmarks y rendimiento

Evaluación sobre el split de test de `badrex/malagasy-speech-full` (3.101 clips, hablantes no vistos en entrenamiento). El "formatted WER" compara el texto final con la transcripción original **con** mayúsculas y puntuación, sin normalización alguna.

| Entrada | Sistema | Formatted WER | F1 macro `, . ? ! :` | F1 coma | F1 punto | Precision de caso |
|---|---|---|---|---|---|---|
| Salida real de ASR (10,6 % WER) | Mayuscula inicial + punto final | 21,73 % | 13,1 | 0 | 65,6 | 96,0 % |
| Salida real de ASR (10,6 % WER) | **Este modelo** | **18,47 %** | **45,2** | 51,9 | 79,0 | 97,1 % |
| Palabras de referencia | Mayuscula inicial + punto final | 13,09 % | 13,3 | 0 | 66,3 | 96,1 % |
| Palabras de referencia | **Este modelo** | **9,18 %** | **51,2** | 52,7 | 79,8 | 97,3 % |

La mejora sobre la linea base trivial en salida real de ASR es de −3,26 puntos de formatted WER (bootstrap pareado, IC 95 % [−3,51, −3,02]). Con etiquetas perfectas el suelo teorico seria 2,4 %, ya que comillas, parentesis y algunos acentos quedan fuera del alcance del modelo. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros): no son aplicables a un modelo discriminativo de etiquetado en una unica lengua de bajos recursos.

## Requisitos de hardware

- Pesos en fp32: 277,5 M de parametros equivalen a ~1,11 GB, coherente con el tamano de repo de 1,1 GB.
- VRAM estimada para inferencia (estimacion propia a partir del tamano, no publicada por el autor): ~1,5-2 GB con batch 1 y activaciones incluidas.
- Cabe en cualquier GPU de consumo con 2 GB o mas de VRAM; tambien funciona en CPU, que es el modo por defecto de la clase `Restorer`.
- GPU de referencia usada para entrenar: una RTX 5070 Ti, 13 minutos de ajuste. Para inferencia no se requiere hardware dedicado.
- Latencia publicada: ~80 ms para una intervencion de 32 palabras con dos hilos de CPU (equivalente a ~400 palabras/s en ese escenario). No se han publicado cifras de throughput en GPU.
- Despliegue: el repo incluye `punctuate.py` con la clase `Restorer` (`Restorer(path)` en CPU, `Restorer(path, device="cuda")` en GPU); tambien es cargable como pipeline `token-classification` de `transformers`. Requiere `torch`, `transformers`, `sentencepiece` y `numpy`.
- No apto para vLLM, TGI o llama.cpp en su modo generativo habitual: no es un modelo de lenguaje causal. Cualquier via de despliegue debe respetar fp32, ya que la cuantizacion int8 dinamica rompe el rendimiento (F1 de coma de 54 a 19).
- Existe una demo publica en Spaces para probarlo en el navegador.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros modelos de restauracion de puntuacion para malgache con los que comparar parametros, contexto o licencia. La unica comparacion cuantificada disponible es contra la linea base heuristica evaluada por el propio autor:

| Sistema | Parametros | Enfoque | Formatted WER (ASR real) | F1 macro puntuacion | Licencia |
|---|---|---|---|---|---|
| `Flo976/malagasy-punctuation` | 277,5 M | Clasificacion de tokens (XLM-R base) | 18,47 % | 45,2 | CC-BY-SA-4.0 |
| Linea base: mayuscula inicial + punto final | 0 | Regla heuristica | 21,73 % | 13,1 | no aplica |
| Otros modelos de puntuacion multilingues | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia de ecosistema, el modelo base `Davlan/xlm-roberta-base-finetuned-malagasy` y el ASR `Flo976/w2v-bert-malagasy` son los componentes con los que se encadena habitualmente, pero no son alternativas funcionales a esta tarea.

## Limitaciones y advertencias

- Las comas siguen siendo difıciles (F1 ~52): los transcriptores originales las colocan de forma inconsistente, por lo que el modelo hereda esa ambiguedad.
- Los signos de interrogacion y exclamacion son muy raros en el test (20 y 35 casos respectivamente), por lo que sus puntuaciones son muy inciertas. El punto y coma nunca se predice.
- Dominio acotado: entrenado con descripciones de imagenes leidas y Wikipedia. El dialogo y las preguntas, tipicos de un asistente de voz, se puntuan peor.
- Tamano y cuantizacion: 1,1 GB en fp32; no cuantizar a int8 dinamico, ya que degrada gravemente el rendimiento (F1 de coma de 54 a 19).
- No utiliza las pausas del audio: en un clasificador separado las pausas ayudaron, pero no estan integradas en este modelo.
- Sesgos: al derivar de XLM-R y de Wikipedia en malgache, puede reflejar el sesgo de registro y de cobertura tematica de esas fuentes; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: nulo en cuanto a contenido lexico, porque el modelo no genera texto y garantiza por asercion que las palabras no cambian. El riesgo se limita a puntuar o capitalizar de forma incorrecta.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- Modelo con 0 descargas y 0 likes: no hay validacion independiente por parte de la comunidad, y la model card esta truncada en la seccion de limitaciones, por lo que puede faltar informacion relevante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Flo976/malagasy-punctuation
- Modelo base: https://huggingface.co/Davlan/xlm-roberta-base-finetuned-malagasy
- ASR malgache complementario: https://huggingface.co/Flo976/w2v-bert-malagasy
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/badrex/malagasy-speech-full
- Demo en el navegador: https://huggingface.co/spaces/Flo976/malagasy-asr-demo
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente contenido no relacionado con la ficha.
