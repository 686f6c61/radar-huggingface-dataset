# aaimn/aai-kenlm-mn-4gram-v1

## Resumen

El modelo `aai-kenlm-mn-4gram-v1` es un modelo de lenguaje estadístico de tipo n-grama (4-grama) construido con KenLM, publicado por el usuario `aaimn` en Hugging Face. No se trata de una red neuronal ni de un transformer: es un modelo de recuento de secuencias de cuatro tokens entrenado sobre texto en mongol (`mn`), pensado para su uso en tareas de decodificación CTC y como componente auxiliar en sistemas de reconocimiento automático del habla (ASR) o de corrección lingüística. Su librería asociada es `kenlm`, y el repositorio ocupa 2,3 GB, un tamaño coherente con un modelo de 4-gramas con un vocabulario amplio y poda ligera o nula.

La relevancia de este tipo de artefactos es práctica: los modelos n-grama de KenLM siguen siendo el estándar de facto para decodificación con haz en ASR (por su bajo coste computacional y su capacidad de integrarse en `pyctcdecode` o `flashlight`) y para puntuar hipótesis en pipelines de corrección ortográfica. Frente a un transformer, un 4-grama ofrece inferencia en microsegundos, memoria acotada y comportamiento determinista, a cambio de una capacidad de generalización muy limitada y de no modelar dependencias de largo alcance.

La información pública disponible es escasa: no se indican parámetros, contexto, datos de entrenamiento ni resultados de benchmarks. El acceso está restringido (gated) y la licencia es `aai-research-education-1.0`, orientada a investigación y educación, lo que condiciona su uso en producción comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje estadístico n-grama (4-grama) implementado con KenLM |
| Parametros totales | no disponible (modelo de recuento, no neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana efectiva de 4 tokens por definición del n-grama) |
| Tipos de cuantizacion | no disponible (no aplica a modelos KenLM; el tamaño se reduce mediante poda, no cuantización) |
| Idiomas soportados | mongol (`mn`) |
| Licencia | `aai-research-education-1.0` (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | artefactos binarios de KenLM (`.arpa`, `.bin`, `.klm`); no se especifica en la ficha del repositorio |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje n-grama de orden 4: estima la probabilidad de cada token condicionada a los tres tokens anteriores mediante recuentos de frecuencia sobre un corpus de texto en mongol, con suavizado (probablemente Kneser-Ney modificado, el estándar en KenLM, aunque no se confirma en la información disponible). KenLM implementa estos modelos con una estructura de trie compacta y consultas en tiempo casi constante, lo que permite integrarlo en bucles de decodificación con haz sin penalización apreciable de latencia.

No se han publicado detalles sobre el corpus de entrenamiento: se desconoce el número de tokens, la composición (noticias, web, literatura, subtítulos), el dominio y si se aplicó normalización ortográfica del mongol (cirílico) o segmentación morfológica. Tampoco hay información sobre poda, tamaño de vocabulario ni perplejidad de validación. El tag `ctc-decoding` sugiere que el modelo se diseñó específicamente como componente de un decodificador CTC, probablemente para un sistema ASR en mongol.

## Capacidades

- Puntuación de secuencias de texto en mongol: asigna log-probabilidades a hipótesis de 4 tokens, útil para reranking.
- Integración en decodificación CTC con haz (`pyctcdecode`, `flashlight`, `ctcdecode`), el caso de uso declarado en los tags.
- Corrección ortográfica y de fluidez en textos en mongol mediante selección de la hipótesis de mayor probabilidad.
- Detección de secuencias improbables (posibles errores de OCR o de ASR) por baja puntuación.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto nuevo, solo puntúa el existente.
- Capacidad multilingüe: nula más allá del mongol; el vocabulario está limitado a ese idioma.
- No dispone de modo de razonamiento (`thinking`), visión ni audio.

## Casos de uso

- Decodificación de ASR en mongol: integrado como `KenLM` en un decodificador CTC con haz, reordena las hipótesis del acoustic model y reduce la tasa de error de palabra, especialmente en palabras homófonas o poco frecuentes. Es el uso principal que indican los tags del repositorio.
- Reranking de transcripciones: dado un conjunto de candidatas generadas por un sistema ASR, el 4-grama selecciona la de mayor verosimilitud lingüística con un coste de microsegundos por hipótesis.
- Corrección ortográfica en pipelines de edición: puntuar variantes de una palabra o frase en mongol para elegir la forma más probable según el contexto inmediato de tres tokens.
- Filtrado de calidad de corpus: descartar documentos o frases con perplejidad anómalamente alta antes de entrenar un modelo neuronal, como etapa de limpieza de datos.
- Puntuación en sistemas de traducción automática: como componente de la parte lingüística del modelo de lenguaje en un decodificador estadístico o híbrido para mongol.
- Investigación lingüística computacional: análisis de frecuencias de 4-gramas, estudio de colocaciones y patrones morfosintácticos del mongol en corpus anotados.
- Prototipado educativo: por su licencia de investigación y educación y su bajo coste de despliegue, sirve para prácticas de ASR y procesamiento del lenguaje en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; KenLM opera en CPU y mapea el modelo en memoria RAM. El repositorio de 2,3 GB sugiere un consumo de RAM del orden de 2 a 4 GB para el binario cargado (la cifra exacta depende de la poda y del formato).
- GPU: no es necesaria; el modelo es puramente CPU. Puede convivir con un acoustic model en GPU sin competir por VRAM.
- GPU de consumo: irrelevante para este componente; cualquier CPU moderna (x86-64 o ARM) es suficiente.
- Despliegue: biblioteca `kenlm` (Python bindings), `pyctcdecode`, `flashlight-text`, o carga directa del binario `.klm`/`.arpa` desde C++.
- Latencia y throughput: no disponibles en la información proporcionada; en la práctica, los 4-gramas de KenLM puntúan del orden de millones de tokens por segundo en una CPU moderna, pero no se aporta medición concreta para este modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamaño | Licencia | Acceso |
|---|---|---|---|---|---|
| `aaimn/aai-kenlm-mn-4gram-v1` | KenLM 4-grama | Mongol | 2,3 GB (repo) | `aai-research-education-1.0` | Restringido (gated) |
| KenLM oficial (varios idiomas) | KenLM n-grama | Multilingüe | Variable | LGPL (código) / según corpus | Abierto |
| `wav2vec2` / `XLS-R` con LM en mongol | Transformer acústico + LM | Mongol | Cientos de millones de parámetros | Variable | Abierto |
| Modelos n-grama de OPUS/Common Crawl para `mn` | KenLM n-grama | Mongol | Variable | Según corpus | Abierto |

No se dispone de datos de rendimiento comparativo (perplejidad, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo puramente estadístico: no generaliza más allá de los 4-gramas vistos en entrenamiento; falla ante fenómenos de largo alcance, dependencias sintácticas distantes y vocabulario fuera del corpus.
- Sesgos del corpus: al desconocerse la composición del entrenamiento, no se puede evaluar el sesgo de dominio, registro o variedad dialectal del mongol; puede infrarepresentar variantes minoritarias.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede sobrepuntuar secuencias gramaticales sin sentido si aparecen en el corpus (frecuencias espurias).
- Licencia `aai-research-education-1.0`: restringe el uso a investigación y educación; el uso comercial requiere verificación expresa de los términos, que no se detallan en la información disponible.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo, lo que añade fricción a pipelines automatizados.
- Sin datos de entrenamiento publicados: imposible auditar la procedencia del corpus, la licencia de los textos fuente ni la calidad de la normalización ortográfica.
- Sin métricas: no hay perplejidad ni WER de referencia, por lo que la idoneidad para un caso concreto solo puede validarse empíricamente.
- Formato de pesos no especificado en la ficha: conviene inspeccionar el repositorio tras el acceso para confirmar si se distribuye `.arpa`, `.bin` o ambos.

## Enlaces

- Hugging Face: https://huggingface.co/aaimn/aai-kenlm-mn-4gram-v1
- Repositorio KenLM (código): https://github.com/kpu/kenlm
- `pyctcdecode` (decodificación CTC con KenLM): https://github.com/kensho-technologies/pyctcdecode
- Flashlight text (decodificador con KenLM): https://github.com/flashlight/text
