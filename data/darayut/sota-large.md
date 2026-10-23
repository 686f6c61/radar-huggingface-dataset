# Darayut/sota-large

## Resumen

sota-large es un reconocedor de voz CTC de 203,6 millones de parámetros para jemer (km) e inglés (en), publicado por el usuario Darayut en HuggingFace. No es un modelo entrenado desde cero: se obtiene aplicando poda estructurada al modelo `omniASR_CTC_1B` de Meta (975M parámetros, licencia Apache 2.0), del que se elimina el 80% de las unidades de los mecanismos de atención y de las capas feed-forward del encoder. El resultado conserva la arquitectura de encoder CTC estilo wav2vec2, el extractor convolucional de características y la capa de salida del modelo original, pero con anchos distintos en cada capa.

El interés del modelo está en la relación entre tamaño y precisión en un idioma de bajos recursos: con una quinta parte de los parámetros del profesor original, mejora el CER en jemer sobre el conjunto DDD-Test (1,77% frente a 5,95% del modelo de Meta y 2,47% del profesor afinado). El coste computacional cae de 50,3 a 12,3 GMAC por segundo de audio. En inglés, en cambio, la poda degrada claramente el rendimiento: el WER en LibriSpeech test-other pasa de 8,21% a 16,73%. Es, por tanto, un modelo especializado en jemer con capacidad secundaria de transcripción en inglés.

Forma pareja con `Darayut/sota-base`, la variante de menor tamaño, y su nombre sigue la convención de los modelos WavLM podados de DiariZen (Base-s80 / Large-s80). La receta de poda y destilación está documentada paso a paso en la model card, pero el modelo todavía no tiene descargas ni validación independiente en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder CTC estilo wav2vec2 (extractor convolucional + transformer) con poda estructurada por capas; cada capa tiene su propio `num_heads` y `ffn_dim` |
| Parametros totales | 203.593.631 (de ellos, 191M en el encoder) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (modelo CTC sobre tramas de audio; no se documenta una ventana máxima de entrada) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica `model.safetensors`; no se ofrecen variantes GGUF, INT8 ni ONNX |
| Idiomas soportados | Jemer (km) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + código PyTorch propio en el directorio `omniprune/` |
| Vocabulario | 9.812 entradas de caracteres del vocabulario Omnilingual (cubre escritura jemer y latina) |
| Coste computacional | 12,3 GMAC por segundo de audio (frente a 50,3 del modelo de 975M) |
| Entrada de audio | Cualquier frecuencia de muestreo; se convierte a mono y se remuestrea a 16 kHz |
| Formato de salida | Texto en minúsculas, sin puntuación jemer |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es `omniASR_CTC_1B` de Meta: un encoder CTC de estilo wav2vec2 con vocabulario de caracteres de 9.812 entradas que cubre jemer y alfabeto latino. La poda actúa sobre cabezas de atención y unidades feed-forward de forma independiente por capa, de modo que cada capa resultante tiene un ancho distinto; `config.json` documenta los valores exactos de `num_heads` y `ffn_dims`. El extractor convolucional de características y la capa de salida quedan intactos. Esta anchura no uniforme impide cargar el modelo con fairseq2 u `omnilingual-asr`, por lo que es obligatorio usar el código `omniprune/` incluido en el repositorio.

El proceso sigue la receta de *Fine-tune Before Structured Pruning* (arXiv 2505.24111) con el método de poda de DPHuBERT (arXiv 2305.17651) tal como se aplica en DiariZen. Primero se afina `omniASR_CTC_1B` con CTC sobre la mezcla de entrenamiento para obtener el profesor `omniASR-CTC-1B-km-en`. Después se poda durante 12.000 pasos con compuertas Hard Concrete L0 sobre cabezas y unidades FFN, usando una restricción de Lagrange aumentada que escala la densidad objetivo hasta el 80% de sparsity, destilando con pérdida L1 − coseno sobre estados ocultos en las capas 12, 24, 36 y 48. Se eliminan las unidades podadas, se congela la máscara y se continúa la destilación 5.000 pasos más; finalmente se recupera precisión durante 16.000 pasos con CTC más divergencia KL a nivel de trama frente a la distribución de salida del profesor (temperatura 1, peso 1).

La mezcla de entrenamiento es 50/50 por idioma: jemer con DDD train y FLEURS-km train; inglés con LibriSpeech train-clean-100 + train-clean-360 y FLEURS-en train. FLEURS se fija en el 20% del audio de cada idioma. Los ficheros publicados reproducen exactamente los logits del checkpoint de entrenamiento (diferencia máxima 0).

## Capacidades

- Transcripción de voz a texto en jemer e inglés con decodificación CTC voraz (greedy), sin modelo de lenguaje externo.
- Reconocimiento sobre audio de cualquier frecuencia de muestreo, con conversión automática a mono y remuestreo a 16 kHz.
- Manejo del alfabeto jemer completo (sin diacríticos latinos de transliteración) a través del vocabulario Omnilingual de 9.812 caracteres.
- Inferencia por lotes: la función `transcribe` acepta una lista de ficheros de audio.
- Ejecución en CPU o GPU mediante PyTorch y torchaudio, sin dependencias de fairseq2.
- Capacidad bilingüe dentro de una misma mezcla de entrenamiento (no se documenta detección de idioma ni conmutación de código explícita).
- No se documentan soporte de tool calling, modo thinking, agentes, visión, audio en streaming ni marcas de tiempo.

## Casos de uso

- Subtitulado de contenido audiovisual en jemer: el modelo transcribe audio a texto en minúsculas sin puntuación, adecuado como paso previo a un segmentador y a un modelo de restauración de puntuación; su CER de 1,77% en DDD-Test lo hace competitivo frente a modelos cinco veces mayores en ese dominio.
- Transcripción de archivos de audio en centros de atención telefónica en jemer: al ejecutarse en una GPU de gama media o incluso en CPU, permite procesar lotes completos en infraestructura propia sin enviar datos a terceros.
- Digitalización de corpus orales para lingüística: con 12,3 GMAC por segundo de audio, transcribir horas de grabaciones de campo resulta viable en un portátil, lo que facilita la creación de corpus alineados para entrenar modelos de mayor tamaño.
- Búsqueda por voz en aplicaciones para el mercado camboyano: el reducido tamaño del modelo (0,8 GB de repositorio) permite incluirlo en despliegues con recursos limitados o en servidores modestos con latencia baja.
- Preetiquetado de datasets de ASR: transcripción automática masiva de audio en jemer e inglés que después se revisa manualmente, reduciendo el coste de anotación.
- Análisis de reuniones bilingües jemer-inglés: transcripción de las dos lenguas con un único modelo, útil para extracción de acciones o resúmenes posteriores con un LLM.
- Moderación y clasificación de contenido hablado: la transcripción sirve de entrada a pipelines de filtrado de audio en centros de soporte o plataformas de contenido.

## Benchmarks y rendimiento

Decodificación CTC voraz sin modelo de lenguaje. CER para jemer, WER para inglés, en porcentaje; menor es mejor.

| Modelo | Parametros | GMAC / s audio | DDD-Test (km) | FLEURS-km | FLEURS-en | LibriSpeech test-clean | LibriSpeech test-other |
|---|---|---|---|---|---|---|---|
| `omniASR_CTC_1B` (original) | 975M | 50,3 | 5,95 | 11,26 | 12,38 | 4,40 | 8,87 |
| `omniASR-CTC-1B-km-en` (profesor afinado) | 975M | 50,3 | 2,47 | 9,44 | 11,94 | 3,61 | 8,21 |
| sota-large | 204M | 12,3 | 1,77 | 11,40 | 19,25 | 6,07 | 16,73 |

Observaciones publicadas por el autor: en jemer supera tanto al profesor sin podar como al modelo original de Meta en DDD-Test; en inglés conserva mucho menos rendimiento, con un WER entre 1,5 y 2 veces el del profesor. FLEURS-km y FLEURS-en son conjuntos dentro del dominio, ya que sus particiones de entrenamiento forman parte de la mezcla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,81 GB de pesos en fp32 (203,6M × 4 bytes) y 0,41 GB en fp16. Con activaciones y el sobrecoste de PyTorch, un presupuesto realista es de 1-2 GB en fp32 y por debajo de 1 GB en fp16 (estimación aritmética a partir del número de parámetros, no medida publicada).
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria. Una RTX 4090, RTX 3090 o RTX 4060 Ti ejecutan el modelo con holgura; también es viable en GPUs de portátil y en instancias T4 o L4.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos años; también en CPU, dado el bajo coste de 12,3 GMAC por segundo de audio.
- Opciones de despliegue: únicamente el código `omniprune/` incluido (PyTorch + torchaudio + safetensors). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, y las herramientas basadas en fairseq2 u `omnilingual-asr` no pueden cargar el modelo por la anchura no uniforme de las capas.
- Latencia y throughput: no disponibles como medidas publicadas. Como referencia teórica, 12,3 GMAC por segundo de audio equivalen a unos 24,6 GFLOP por segundo de audio (estimación derivada multiplicando por 2 el dato del autor).

## Comparativa con modelos similares

| Modelo | Parametros | GMAC / s audio | CER DDD-Test (km) | WER LibriSpeech test-other | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sota-large | 204M | 12,3 | 1,77 | 16,73 | Apache 2.0 | HuggingFace, código propio |
| `omniASR-CTC-1B-km-en` (profesor) | 975M | 50,3 | 2,47 | 8,21 | Apache 2.0 | HuggingFace |
| `omniASR_CTC_1B` (original de Meta) | 975M | 50,3 | 5,95 | 8,87 | Apache 2.0 | HuggingFace |
| `Darayut/sota-base` (variante pequena) | No disponible | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |

La comparación relevante es interna a la familia: sota-large ofrece entre 4 y 5 veces menos coste computacional que el modelo de 975M a cambio de perder precisión en inglés y ganarla en jemer. `sota-base` se menciona como la otra talla de la pareja, pero no se han proporcionado sus especificaciones ni resultados.

## Limitaciones y advertencias

- Rendimiento en inglés notablemente degradado: el WER en LibriSpeech test-other es de 16,73% frente al 8,21% del profesor, y en FLEURS-en de 19,25% frente a 11,94%. No es recomendable como ASR principal en inglés.
- FLEURS-km y FLEURS-en son conjuntos dentro del dominio porque sus particiones de entrenamiento están en la mezcla; sus cifras no reflejan el rendimiento en audio fuera de distribución.
- Decodificación voraz sin modelo de lenguaje: no hay corrección contextual, puntuación, mayúsculas ni normalización de números.
- Salida siempre en minúsculas y sin puntuación jemer, lo que exige un postprocesado para generar subtítulos o texto publicable.
- Solo cubre jemer e inglés; no se documenta comportamiento en otras lenguas ni detección automática de idioma.
- El modelo no se puede cargar con fairseq2 ni con la librería `omnilingual-asr`; integrarlo requiere el código `omniprune/` del repositorio, lo que añade mantenimiento propio.
- Riesgo de alucinación: en CTC, ante audio ruidoso o silencioso puede emitir secuencias repetitivas o texto espurio; no se documentan umbrales de confianza ni mecanismos de filtrado.
- Sesgos: no se documenta la composición demográfica ni la procedencia de DDD y LibriSpeech, por lo que se desconoce el sesgo por acento, género o dialecto del jemer.
- Licencia Apache 2.0 en los pesos, derivados de `omniASR_CTC_1B` (también Apache 2.0): permite uso comercial con atribución. `omniprune/hardconcrete.py` está portado de DiariZen (MIT), derivado a su vez de DPHuBERT y FLOP, por lo que conviene conservar los avisos de atribución.
- Falta de validación externa: cero descargas y cero likes en el momento de la ficha, sin evaluaciones independientes ni auditoría de terceros.
- No se documentan marcas de tiempo, diarización, streaming ni detección de actividad de voz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Darayut/sota-large
- Variante de menor tamano: https://huggingface.co/Darayut/sota-base
- Profesor afinado: https://huggingface.co/Darayut/omniASR-CTC-1B-km-en
- Paper de la receta de poda (*Fine-tune Before Structured Pruning*): https://arxiv.org/abs/2505.24111
- Paper del metodo de poda DPHuBERT: https://arxiv.org/abs/2305.17651
- Modelo base de Meta (Omnilingual ASR `omniASR_CTC_1B`): no se proporciona enlace directo en la informacion disponible
- DiariZen (origen de `hardconcrete.py`): no se proporciona enlace directo en la informacion disponible
