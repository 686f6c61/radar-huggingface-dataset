# samuelolubukun/moonshine-tiny-igbo-openbible

## Resumen

Moonshine-tiny-igbo-openbible es un ajuste fino del modelo de reconocimiento automatico del habla (ASR) UsefulSensors/moonshine-tiny, desarrollado por el usuario samuelolubukun, orientado exclusivamente al igbo (codigo `ig`). El modelo base es un transformer encoder-decoder de aproximadamente 27 millones de parametros, disenado originalmente por Useful Sensors para transcripcion en vivo y comandos de voz. Este ajuste adapta ese checkpoint a una lengua africana de bajos recursos, ampliando el vocabulario con 32 tokens especificos para la ortografia Ọnwụ (vocales con subpunto: `ị, ụ, ọ, ṅ`) y para los tonos del igbo.

El problema que resuelve es concreto: el igbo es una lengua tonal con distinciones ortograficas que los tokenizadores multilingues genericos suelen normalizar o destruir, degradando la calidad de la transcripcion. El autor entrena sobre el subconjunto igbo del dataset multilingual-tts/open-bible (27.557 segmentos de audio a 16 kHz) y aplica una fase de "curacion ortografica" con expresiones regulares para reparar artefactos tipograficos del texto de origen (pronombres y preposiciones pegados, particulas compuestas fragmentadas, guiones en verbos auxiliares).

Es relevante ahora porque demuestra que un modelo de 27M de parametros puede adaptarse a una lengua tonal de bajos recursos con recursos modestos (5.000 pasos de entrenamiento en una unica NVIDIA A10G de 24 GB) y porque publica curvas de convergencia y metricas de WER/CER desglosadas por nivel de normalizacion. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigacion reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine, Useful Sensors) |
| Parametros totales | 27.097.920 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no se documenta la longitud maxima de audio; entrada mono a 16 kHz) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8/INT4) |
| Idiomas soportados | Igbo (`ig`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~0,1 GB de repositorio) |

Datos adicionales de la model card: tasa de muestreo de 16.000 Hz (mono); ampliacion de vocabulario con 32 tokens igbo (`ị, ụ, ọ, ṅ, Ị, Ụ, Ọ, Ṅ`, variantes con tono agudo y grave, y el token especial `<|ig|>`); `pipeline_tag` de automatic-speech-recognition; metadatos de evaluacion declarados: WER, CER y loss.

## Arquitectura y entrenamiento

La arquitectura es la del Moonshine original: un transformer encoder-decoder compacto (aproximadamente 27M de parametros) que procesa audio mono a 16 kHz y genera texto de forma autoregresiva. El ajuste fino parte del checkpoint UsefulSensors/moonshine-tiny (tambien referenciado en las etiquetas como moonshine-ai/moonshine-tiny) y no modifica el esqueleto de la red, sino que adapta los pesos y amplia el vocabulario con 32 tokens disenados para preservar la armonia vocalica, las distinciones de subpunto y los marcadores tonales del igbo.

El entrenamiento se realizo sobre el subconjunto igbo de multilingual-tts/open-bible: 27.557 segmentos WAV preprocesados a 16 kHz, con 5.000 pasos de optimizacion equivalentes a unas 3,05 epocas, tamano de lote efectivo de 16 (con 4 workers de dataloader en CPU), tasa de aprendizaje de 5e-5 con calentamiento lineal y precision mixta FP16 sobre una NVIDIA A10G de 24 GB. Antes del entrenamiento se aplico una fase de "orthographic healing" mediante expresiones regulares y un callback de sincronizacion atomica por volumen (`VolumeCommitCallback`) para corregir fusiones y separaciones incorrectas de morfemas heredadas del texto OCR de origen. No se documenta uso de RLHF ni DPO, algo esperable en un modelo ASR. La perdida de entrenamiento descendio de 2,9280 en el paso 0 a 0,2281 en el paso 5.000, con una perdida de validacion final de 0,283 y una norma de gradiente de 1,210, sin senales de sobreajuste segun el autor.

## Capacidades

- Transcripcion de voz en igbo a texto, con entrada de audio mono a 16 kHz.
- Representacion explicita de la ortografia Ọnwụ: vocales con subpunto (`ị, ụ, ọ`) y consonante `ṅ`, tanto en minuscula como en mayuscula.
- Representacion de tonos mediante tokens especificos para vocales con acento agudo y grave (`ị́, ị̀, ụ́, ụ̀, ọ́, ọ̀`).
- Decodificacion con busqueda por haz configurable; la evaluacion publicada usa `num_beams=5`, `repetition_penalty=1.05`, `length_penalty=1.0` y `no_repeat_ngram_size=4`.
- Segmentacion de palabras a nivel de frase completa, incluyendo el tratamiento de encliticos y elisiones (por ejemplo, formas como `n'ime` o `n'ụlọ`).
- Integracion en pipelines estandar de Transformers para inferencia standalone.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni generacion de texto libre: es un modelo puramente ASR.
- Cobertura multilingue: ninguna mas alla del igbo.

## Casos de uso

- Transcripcion de archivo religioso en igbo: el modelo se ajusto especificamente sobre audio de estudio de OpenBible, por lo que es adecuado para digitalizar y transcribir grabaciones biblicas, homilias y catequesis con voz limpia y diccion.

- Generacion de subtitulos para contenido audiovisual en igbo: con un CER del 11,32% en la configuracion neutralizada, la salida es suficientemente precisa para subtitulado asistido con revision humana posterior.

- Preservacion linguistica y construccion de corpus: permite producir transcripciones con subpuntos y tonos que alimenten corpus escritos en igbo, un recurso escaso para linguistas y desarrolladores de tecnologias del lenguaje.

- Preanotacion de datos para etiquetado humano: usar la salida del modelo como borrador en flujos de anotacion reduce el coste de transcripcion manual de horas de audio en igbo; su tamano de 27M lo hace ejecutable en el mismo equipo del anotador.

- ASR embebido u offline: con ~27M de parametros y pesos de decenas de megabytes, cabe en dispositivos de bajos recursos (Raspberry Pi, moviles, equipos sin GPU) para transcripcion local sin conexion.

- Herramientas educativas para aprendizaje del igbo: la preservacion de tonos y subpuntos permite generar material de estudio con ortografia correcta a partir de grabaciones de hablantes nativos.

- Investigacion en ASR de bajos recursos: sirve como punto de partida reproducible para experimentos de ajuste fino sobre otras lenguas tonales africanas, con un presupuesto de computo de una sola GPU de 24 GB.

- Voz para servicios publicos en igbo (con cautela): podria alimentar interfaces de dictado o busqueda por voz, aunque el WER del 37-47% obliga a disenar la interaccion tolerante a errores y con confirmacion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 100 muestras de test no vistas, de hablantes y capitulos distintos, con decodificacion por haz (`num_beams=5`):

| Metrica | Raw / Verbatim | Clean / Standardized | Diacritic & Tone-Neutralized |
|---|---|---|---|
| Word Error Rate (WER) | 47,28% | 37,73% | 36,99% |
| Character Error Rate (CER) | 14,64% | 12,22% | 11,32% |
| Alucinaciones de citas | 0% | 0% | 0% |

Definiciones de normalizacion segun la model card: "Raw/Verbatim" conserva mayusculas, puntuacion y diacriticos originales; "Clean/Standardized" aplica minusculas, eliminacion de puntuacion y colapso de espacios, preservando subpuntos y diacriticos; "Diacritic & Tone-Neutralized" aplica descomposicion NFD y elimina las marcas diacriticas combinantes (categoria Unicode `Mn`), neutralizando tonos y subpuntos (`ị, ụ, ọ, ṅ` → `i, u, o, n`).

Evolucion de la perdida durante el entrenamiento:

| Paso | Epoca | Perdida de entrenamiento | Norma de gradiente | Tasa de aprendizaje |
|---|---|---|---|---|
| 0 | 0,00 | 2,9280 | No disponible | 0,00e-00 |
| 1.000 | 0,61 | 0,4350 | 1,842 | 4,00e-05 |
| 2.500 | 1,53 | 0,3150 | 1,520 | 2,50e-05 |
| 4.000 | 2,44 | 0,2480 | 1,390 | 1,00e-05 |
| 5.000 | 3,05 | 0,2281 | 1,210 | 0,00e-00 |

Perdida de validacion final: 0,283. No se han publicado comparaciones con otros sistemas ASR en igbo dentro de la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en FP16 (27M de parametros equivalen a unos 54 MB de pesos, mas activaciones y buffers de audio). El repositorio completo ocupa 0,1 GB.
- GPU del entrenamiento: NVIDIA A10G con 24 GB. Para inferencia, cualquier GPU con 1-2 GB de VRAM es suficiente.
- GPU recomendadas: para servir en produccion, una T4, L4 o RTX 3060 es mas que suficiente; una RTX 4090, A100 o H100 estarian sobredimensionadas para un modelo de este tamano salvo que se necesite altisimo throughput por batching.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso integradas. Tambien es viable en CPU.
- Despliegue: pipelines estandar de Transformers (clase de modelo Moonshine), inferencia standalone con los ficheros del repositorio, y exportacion a ONNX si se implementa manualmente. vLLM, TGI, llama.cpp y Ollama no ofrecen soporte documentado para esta arquitectura ASR en este checkpoint.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo real (RTF) ni de transcripciones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma objetivo | Licencia | WER en igbo | Disponibilidad |
|---|---|---|---|---|---|
| moonshine-tiny-igbo-openbible | 27,1M | Igbo | Apache 2.0 | 36,99%-47,28% segun normalizacion | HuggingFace, safetensors |
| UsefulSensors/moonshine-tiny (base) | ~27M | Ingles (principalmente) | No disponible en la informacion proporcionada | No disponible (no ajustado a igbo) | HuggingFace |
| Whisper tiny (OpenAI) | ~39M | Multilingue (~99 idiomas) | MIT | No disponible | HuggingFace, multiples runtimes |

Nota: los datos de parametros y licencia de Whisper tiny son de conocimiento general y no proceden de la informacion proporcionada en esta consulta; su rendimiento en igbo no se ha verificado aqui. No se dispone de cifras comparativas de WER en igbo para los modelos alternativos.

## Limitaciones y advertencias

- Tamano muy reducido (27M de parametros): la capacidad acustica y de modelado de lenguaje es limitada, lo que se refleja en un WER del 36,99% en el mejor de los escenarios de normalizacion.
- Dependencia fuerte del dominio: el entrenamiento usa exclusivamente audio de estudio de OpenBible (voz limpia, diccion controlada). El rendimiento en audio telefonico, ruidoso, con acentos no cubiertos o con solapamiento de hablantes no esta documentado y previsiblemente sera peor.
- Sesgo tematico: el vocabulario y el estilo aprendidos estan sesgados hacia el registro biblico y religioso, lo que puede degradar la transcripcion de conversacion coloquial o de terminologia tecnica.
- Riesgo de alucinacion: aunque el autor reporta un 0% de "alucinaciones de citas" en su conjunto de test, un modelo ASR de este tamano puede producir texto plausible no presente en el audio, especialmente en segmentos ruidosos, silencios o solapamientos. La cifra del 0% corresponde a una metrica concreta y a un conjunto de prueba especifico, no a una garantia general.
- Cobertura linguistica unica: solo igbo. No soporta mezcla de codigo con ingles ni otras lenguas, algo frecuente en habla real.
- Variabilidad ortografica: la normalizacion de tonos y subpuntos puede eliminar informacion linguistica relevante; los usuarios deben fijar de antemano que nivel de normalizacion aplican en sus referencias y salidas.
- Licencia del modelo: Apache 2.0, permite uso comercial y modificacion siempre que se conserven los avisos correspondientes. La licencia del dataset de entrenamiento (multilingual-tts/open-bible) no se detalla en la informacion proporcionada y conviene verificarla por separado antes de un uso comercial.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin validacion independiente ni resultados reproducidos por terceros. Los numeros de benchmark proceden unicamente del autor.
- Fecha de creacion y actualizacion registradas en HuggingFace: 5 de octubre de 2026, con apenas minutos de diferencia entre ambas, lo que sugiere una publicacion reciente y sin mantenimiento posterior documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samuelolubukun/moonshine-tiny-igbo-openbible
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Referencia alternativa del modelo base (etiqueta `base_model`): https://huggingface.co/moonshine-ai/moonshine-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/multilingual-tts/open-bible
- Repositorio de la arquitectura Moonshine (Useful Sensors): https://github.com/usefulsensors/moonshine
- No se han proporcionado en la informacion disponible articulos, papers, demos ni blogs adicionales.
