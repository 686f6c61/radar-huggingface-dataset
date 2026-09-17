# algerian-nlp/DZAIR

## Resumen

DZAIR es un encoder bidirectional entrenado desde cero para darija argelina, desarrollado por el colectivo algerian-nlp. Cubre las tres formas en que se escribe el dialecto en la practica: escritura arabe, arabizi latino y code-switching con frances. El modelo tiene 105.304.320 parametros y se distribuye bajo licencia Apache-2.0 con pesos en safetensors y codigo de arquitectura personalizado, por lo que requiere cargarse con trust_remote_code=True.

El problema que aborda es la escasez de recursos para una variedad arabe de bajos recursos: frente a DziriBERT, que aprende darija de un unico crawl de 1,1 millones de tuits, DZAIR se entrena sobre 10 fuentes descontaminadas, 19 millones de filas y 1.310 millones de tokens que incluyen foros, transcripciones, texto paralelo y lexicos. Su proposito declarado es la comprension del dialecto (sentimiento, emocion, tema, clasificacion de dialecto) mediante una cabeza CLS mas MLP, similitud semantica, clustering, recuperacion e inicializacion para fine-tuning especifico.

Es relevante ahora porque demuestra que un encoder mas pequeno (el autor afirma un 20 por ciento menos de parametros en el backbone que DziriBERT) puede superar a la referencia previa en sentimiento sobre arabizi latino y en foros bajo un protocolo fijo de 10 semillas, y porque publica tambien los deficits observados, con diagnostico de las causas (tests diminutos, desbalance de clases o falta de pasos de optimizacion) en lugar de ocultarlos. No es un modelo generativo: es exclusivamente un encoder discriminativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (discriminador), 12 capas, anchura 768, atencion grouped-query (GQA) |
| Parametros totales | 105.304.320 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en precision completa; no se documentan versiones cuantizadas) |
| Idiomas soportados | arq (darija argelina): escritura arabe, arabizi latino y code-switching con frances |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con codigo de arquitectura personalizado (trust_remote_code=True) |

Otros datos: pipeline declarado feature-extraction, libreria transformers, tamano del repositorio 0,4 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-16 y actualizado el 2026-09-16.

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de 12 capas con anchura 768. Cada capa combina atencion grouped-query (12 cabezas de consulta, segun el fragmento disponible de la model card, que queda truncado justo en ese punto) con el resto de componentes habituales de un encoder discriminativo. El modelo se entrena con objetivo de modelado de lenguaje enmascarado, dado que se evalua tambien con pseudo-log-verosimilitud MLM en el banco de pruebas DziriEval. La arquitectura viaja con los pesos, de ahi la necesidad de trust_remote_code=True.

Los datos de entrenamiento provienen de 10 fuentes descontaminadas y suman 1.310 millones de tokens en 19 millones de filas procedentes de foros, transcripciones, texto paralelo y lexicos. El vocabulario se construyo sobre texto latino en minusculas: los digitos foneticos del arabizi (3, 7, 9) son piezas atomicas del tokenizador y no deben transliterarse, ya que alrededor del 5 por ciento de los tokens en arabizi los contienen. Alimentar texto latino en mayusculas sin normalizar aumenta la fertilidad del tokenizador en un 10 por ciento.

Las cifras de rendimiento de la model card se obtuvieron con un protocolo identico para DZAIR y DziriBERT: 10 semillas, 3 epocas, batch 8, AdamW con tasa 5e-5 y decaimiento lineal a cero, seleccionando la mejor epoca por exactitud en test. No se menciona RLHF ni DPO, coherente con un encoder discriminativo. El autor reporta ademas un diagnostico separado con pesos congelados (suite ancla DziriEval MCQ, pseudo-log-verosimilitud MLM segun Salazar et al. 2020), no comparable con las filas de fine-tuning.

## Capacidades

- Extraccion de caracteristicas: representaciones contextuales de tokens de dimensionalidad 768 y embeddings de frase mediante mean pooling.
- Clasificacion de secuencia mediante variante con cabeza CLS mas MLP (por ejemplo, sentimiento binario).
- Analisis de sentimiento en arabizi latino, foros, Twitter y redes sociales.
- Clasificacion de emociones en 10 clases (evaluada con resultado inferior a DziriBERT).
- Clasificacion de tema en 5 clases (evaluada, con deficit notable y diagnostico por falta de pasos de optimizacion).
- Identificacion de dialecto: tarea DID (Algiers frente a arabe estandar moderno).
- Manejo nativo de code-switching arabe-frances y de arabizi latino.
- Similitud semantica, clustering y recuperacion sobre texto en darija.
- Inicializacion para fine-tuning especifico de tareas en variedades de bajos recursos.
- No soporta generacion de texto de ningun tipo, ni traduccion, ni tool calling, ni agentes, ni razonamiento multi-paso, ni vision, ni audio.

## Casos de uso

- Analisis de sentimiento en redes sociales argelinas: el modelo se fine-tunea con una cabeza CLS mas MLP para clasificar opiniones en arabizi latino y escritura arabe, con un 65,52 por ciento de exactitud reportada en Narabizi y un 96,33 por ciento en Ranim (foros) bajo protocolo de 10 semillas.
- Moderacion de contenido en comunidades de darija: uso de las representaciones para detectar lenguaje ofensivo o clasificar comentarios; conviene tener en cuenta que el propio autor advierte que el modelo ha visto lenguaje ofensivo en el preentrenamiento y puede reproducir sus patrones.
- Clasificacion de temas en foros y prensa digital: entrenamiento de un clasificador de 5 clases sobre los embeddings; el autor documenta que el rendimiento mejora de 49,65 a 56,64 de exactitud si se le dan unos 1.000 pasos de optimizacion en lugar de 375.
- Identificacion de dialecto (DID) para enrutado de pipelines: distinguir darija argelina de arabe estandar para dirigir textos al modelo o al preprocesado adecuado. El test DID usado es 96,2 por ciento MSA, por lo que la metrica relevante es la exactitud balanceada (91,83 reportada).
- Busqueda semantica y recuperacion sobre corpus en darija: generacion de embeddings de frase con mean pooling e indexacion vectorial para recuperar documentos, comentarios o respuestas similares en un corpus argelino.
- Clustering y exploracion de corpus: agrupar grandes volumenes de comentarios o transcripciones por similitud semantica para analisis exploratorio o etiquetado previo.
- Deteccion de reemplazo de tokens y normalizacion de arabizi: la etiqueta replaced-token-detection sugiere uso en tareas de identificacion de variantes ortograficas y normalizacion de escritura.
- Punto de partida para tareas de bajos recursos: inicializacion del encoder para fine-tuning en otras tareas de darija (clasificacion de intenciones, extraccion de entidades a nivel de frase) cuando no existe un modelo especifico.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, no verificados por un tercero):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Analisis de sentimiento (arabizi latino) | Narabizi sentiment (test) | Accuracy (media de 10 semillas, cabeza CLS+MLP, 3 epocas) | 0,6552 |
| Analisis de sentimiento (arabizi latino) | Narabizi sentiment (test) | Macro F1 (media de 10 semillas) | 0,5961 |
| Analisis de sentimiento (foro, arabe) | Ranim sentiment (test) | Accuracy (media de 10 semillas, cabeza CLS+MLP, 3 epocas) | 0,9633 |
| Analisis de sentimiento (foro, arabe) | Ranim sentiment (test) | Macro F1 (media de 10 semillas) | 0,9594 |

Comparacion completa con DziriBERT bajo el mismo protocolo (10 semillas, 3 epocas, batch 8, AdamW 5e-5, decaimiento lineal a cero, mejor epoca por exactitud en test):

| Tarea | DziriBERT Acc / F1 | DZAIR Acc / F1 | Delta |
|---|---|---|---|
| Narabizi sentiment, arabizi (143 test) | 63,22 / 56,58 | 65,52 / 59,61 | +2,31 / +3,03 |
| Ranim sentiment, foro (300 test) | 94,30 / 93,73 | 96,33 / 95,94 | +2,03 / +2,21 |
| Twifil sentiment, Twitter (2.360 test) | 79,62 / 79,03 | 78,94 / 78,34 | -0,68 / -0,69 |
| Twifil emotion, 10 clases (1.278 test) | 69,12 / 39,10 | 67,86 / 36,67 | -1,26 / -2,43 |
| Algerian sentiment, social (92 test) | 90,11 / 89,43 | 87,72 / 86,80 | -2,39 / -2,63 |
| DID Algiers vs MSA (5.289 test) | 93,63 / 75,06 | 88,72 / 66,44 | -4,91 / -8,62 |
| DID Algiers, exactitud balanceada | 94,17 | 91,83 | -2,34 |
| Narabizi topic, 5 clases (143 test) | 63,57 / 58,41 | 49,65 / 38,68 | -13,92 / -19,73 |

Suite ancla (protocolo distinto, diagnostico): en DziriEval MCQ con pesos congelados y pseudo-log-verosimilitud MLM, DZAIR obtiene 0,2760 frente a 0,2940 de DziriBERT; el autor indica que esta cifra se midio en su propio arnes de sondeo y no es comparable con las filas de fine-tuning anteriores.

Diagnosticos declarados por el autor: el test de 92 filas no resuelve diferencias por debajo de unos 2 puntos; el test DID es 96,2 por ciento MSA, por lo que la exactitud balanceada es la metrica principal; la tarea de tema recibe 375 pasos de optimizacion con la tasa reducida a la mitad en el paso 187, y con unos 1.000 pasos el modelo alcanza 56,64, lo que indica que el limite son los pasos, no la capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 105.304.320 parametros, sin contar activaciones ni overhead del runtime): unos 421 MB en FP32, unos 211 MB en FP16/BF16 y unos 105 MB en INT8.
- Al ser un encoder de 105M de parametros, cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequenos.
- GPU de datacenter (A100, H100) solo necesarias para fine-tuning con lotes grandes o para procesar volumenes muy altos de texto en paralelo.
- Opciones de despliegue: transformers y torch son los unicos requisitos declarados por el autor. Requiere trust_remote_code=True para cargar la arquitectura personalizada. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni TEI, y llama.cpp/Ollama estan orientados a modelos generativos, por lo que no aplican directamente a este encoder.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DZAIR | 105.304.320 | no disponible | Ver tabla de benchmarks (gana en Narabizi arabizi y Ranim foro; pierde en Twitter, emociones, DID y tema) | apache-2.0 | HuggingFace, transformers con trust_remote_code |
| DziriBERT | no disponible en la informacion proporcionada (el autor afirma que DZAIR usa un 20 por ciento menos de parametros en el backbone) | no disponible | Referencia en la tabla comparativa anterior; entrenado sobre un unico crawl de 1,1 millones de tuits | no disponible | no disponible en la informacion proporcionada |
| Otros encoders arabes (por ejemplo MARBERT o AraBERT) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La unica comparacion cuantitativa disponible es la de DziriBERT bajo el protocolo comun de 10 semillas descrito en la seccion de benchmarks.

## Limitaciones y advertencias

- No sirve para generacion de texto de ningun tipo: es un encoder bidireccional discriminativo.
- No sirve para traduccion.
- Solo esta pensado para darija argelina; no debe aplicarse a otros idiomas ni dialectos.
- El autor declara explicitamente que no debe usarse para tomar decisiones sobre personas.
- El preentrenamiento con contenido de redes sociales implica que el modelo ha visto lenguaje ofensivo y puede reproducir sus patrones.
- No ha sido evaluado para sesgo, toxicidad ni factualidad, por lo que el riesgo de sesgos y de alucinacion en tareas downstream no esta caracterizado.
- Uso previsto de investigacion segun la model card, aunque la licencia Apache-2.0 permite uso comercial siempre que se respeten sus terminos.
- Varios conjuntos de evaluacion son muy pequenos (143, 92 y 300 ejemplos), con poder estadistico limitado; el propio autor senala que el test de 92 filas no resuelve diferencias por debajo de 2 puntos.
- El test DID esta fuertemente desbalanceado (96,2 por ciento MSA), lo que invalida la exactitud bruta como metrica principal.
- La tarea de clasificacion de tema esta limitada por el numero de pasos de optimizacion, no por la capacidad del modelo.
- Requiere trust_remote_code=True, lo que implica ejecutar codigo personalizado del repositorio y anade riesgo en entornos de produccion que exigen auditoria de dependencias.
- Es imprescindible normalizar a minusculas el texto latino antes de tokenizar y no transliterar los digitos foneticos del arabizi (3, 7, 9), o se degrada el rendimiento del tokenizador.
- La longitud de contexto no se documenta en la informacion disponible, por lo que no se puede planificar el truncado de documentos largos con datos fiables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algerian-nlp/DZAIR
- Referencia metodologica citada por el autor para la evaluacion con pseudo-log-verosimilitud MLM: Salazar et al. 2020 (sin enlace proporcionado en la informacion disponible)
- Suite de evaluacion DziriEval: mencionada por el autor, sin enlace proporcionado
- Conjuntos de datos citados: Narabizi sentiment, Ranim sentiment, Twifil sentiment, Twifil emotion, Algerian sentiment social, DID Algiers vs MSA, Narabizi topic (sin enlaces proporcionados)
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (paginas de ayuda de YouTube y de registro de cuentas), por lo que no se han incorporado enlaces adicionales.
