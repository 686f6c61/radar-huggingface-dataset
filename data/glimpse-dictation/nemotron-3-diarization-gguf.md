# Glimpse-Dictation/Nemotron-3-Diarization-gguf

## Resumen

Nemotron-3-Diarization-gguf es una conversión a formato GGUF del modelo nvidia/Nemotron-3-Diarization (Streaming Sortformer v3), publicada por el usuario Glimpse-Dictation para el runtime transcribe.cpp. No es un modelo de lenguaje: es un diarizador de hablantes que responde a la pregunta "quién habló y cuándo", con salida puramente temporal y sin generar texto. Soporta hasta 8 hablantes simultáneos con una resolución temporal de 10 ms.

El modelo original lo desarrolla NVIDIA; este repositorio únicamente realiza la conversión y cuantización del checkpoint, y no constituye una release oficial de NVIDIA. El interés práctico del port es que permite ejecutar la diarización en local, sobre CPU o GPU de consumo, con una degradación de precisión prácticamente nula respecto a la referencia en fp32: en el corpus AMI la diferencia de DER entre la referencia y la versión Q8_0 es de 0,01 puntos porcentuales.

El checkpoint tiene 99.226.504 parámetros (unos 99,2 M) y un tamaño de repositorio de 0,7 GB, repartido en tres ficheros (Q8_0 de 106 MB, F16 de 199 MB y F32 de 397 MB). La licencia es OpenMDW 1.1, que permite uso comercial, y el modelo base está etiquetado únicamente para inglés, aunque la tarea de diarización no depende intrínsecamente del idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer v3 (transformer con cache de hablante, embedder, encoder, proyeccion y upsampler) |
| Parametros totales | 99.226.504 (aproximadamente 99,2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica contexto de texto; procesa audio en streaming con lookahead configurable de 0,32 s a 30,4 s |
| Tipos de cuantizacion | F32, F16 y Q8_0 |
| Idiomas soportados | en (etiqueta del repositorio) |
| Licencia | OpenMDW License Agreement 1.1 (permite uso comercial) |
| Formato de pesos | GGUF |
| Tarea | Diarizacion de hablantes (speaker-diarization) y deteccion de actividad de voz (voice-activity-detection) |
| Numero maximo de hablantes | 8 |
| Resolucion temporal | 10 ms |
| Entrada de audio | 16 kHz mono (otras frecuencias se remuestrean) |
| Tamano del repositorio | 0,7 GB |
| Ficheros | nemotron-3-diarization-Q8_0.gguf (106 MB), nemotron-3-diarization-F16.gguf (199 MB), nemotron-3-diarization-F32.gguf (397 MB) |

## Arquitectura y entrenamiento

El modelo es un diarizador basado en la arquitectura Streaming Sortformer (version v3), una variante de transformer orientada a diarizacion en linea. El pipeline interno incluye etapas de mel, embedder, capas de encoder, proyeccion, upsampler y, finalmente, un cabezal que produce probabilidades por hablante en cada trama. Incorpora un mecanismo de cache de hablante con compresion discreta, lo que permite mantener el estado de los hablantes ya vistos a lo largo del flujo de audio. La salida se genera a resolucion de 10 ms y admite hasta 8 hablantes, con identificadores de hablante basados en 1 y ordenados por primera aparicion.

El checkpoint original fue entrenado por NVIDIA; este repositorio solo realiza la conversion desde `nvidia/Nemotron-3-Diarization` en la revision `a435e9867d79e789e90053f9b6d6834053af564a` (fichero `model.safetensors`, fp32) mediante el script `scripts/convert-nemotron3_diar.py`, y posteriormente lo cuantiza con `transcribe-quantize`. El embedding de silencio aprendido de la cache de hablante se mantiene en F32 en todos los ficheros. En cuanto a datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO), no estan disponibles en la informacion proporcionada; la model card remite a la ficha de NVIDIA.

La fidelidad numerica del port esta documentada por el autor: en un clip de 12 segundos con dos hablantes, cada etapa (mel, embedder, capas de encoder, proyeccion, upsampler y probabilidades de hablante) coincide con la referencia de Transformers dentro de 2e-4, y las probabilidades finales dentro de 6e-6 en todos los presets de latencia. Sobre las 9 horas del corpus AMI, la build con Metal y la referencia difieren en el 0,03% de las decisiones a 10 ms, atribuido a reordenacion de punto flotante en un empate cercano dentro de la compresion discreta de la cache.

## Capacidades

- Diarizacion de hablantes ("quien hablo cuando") para un maximo de 8 hablantes con resolucion de 10 ms.
- Deteccion de actividad de voz integrada en el pipeline de diarizacion.
- Operacion en streaming con cuatro presets de latencia: `DEFAULT`/`VERY_HIGH_LATENCY` (30,4 s de lookahead), `LOW_LATENCY` (1,04 s), `VERY_LOW_LATENCY` (0,64 s) y `ULTRA_LOW_LATENCY` (0,32 s).
- Salida de turnos de hablante accesible mediante API en C (`transcribe_n_speaker_segments` y `transcribe_get_speaker_segment`) y mediante bindings en Rust a traves de Glimpse-Speech (`glimpse_speech::diarization::diarize`).
- Acepta audio a 16 kHz mono y remuestrea otras frecuencias de entrada.
- No genera texto, no soporta tool calling ni function calling, y no implementa razonamiento multi-paso: su unica salida son segmentos temporales etiquetados por hablante.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripcion de reuniones con etiquetado de hablante: combinado con un modelo ASR, el diarizador aporta las etiquetas de quien habla en cada turno; su lookahead de 30,4 s y un DER del 9,23% en AMI lo hacen adecuado para post-procesado de reuniones de una hora.
- Analitica de contact center: permite medir tiempos de habla de agente y cliente, detectar solapamientos y segmentar conversaciones grabadas para su posterior analisis de calidad.
- Subtitulado con atribucion de interlocutor: en contenido con multiples participantes (entrevistas, mesas redondas, podcasts), genera las marcas de cambio de hablante que acompanan a los subtitulos.
- Diarizacion en tiempo casi real: con el preset `LOW_LATENCY` (1,04 s de lookahead) el modelo alcanza un DER del 9,48% en AMI, suficiente para interfaces de transcripcion en vivo con etiquetas de hablante.
- Procesamiento por lotes en infraestructura sin GPU: con el fichero Q8_0 (106 MB) se ejecuta en CPU; en un Apple M2 Pro procesa una reunion de 10 minutos 59 veces mas rapido que en tiempo real.
- Archivado y cumplimiento normativo: la diarizacion permite indexar grabaciones por interlocutor y auditar quien dijo que en entornos donde se exige trazabilidad de conversaciones.
- Preprocesado para pipelines de datos de voz: generar segmentos por hablante como paso previo a entrenamiento de modelos ASR o de reconocimiento de hablante, o para limpieza de datasets con multiples locutores.
- Investigacion en diarizacion: al ser una conversion fiel del checkpoint de NVIDIA en un runtime ligero, sirve como referencia reproducible para comparar tecnicas de post-procesado sobre el mismo modelo base.

## Benchmarks y rendimiento

Resultados en AMI meeting corpus, conjunto de test IHM (16 reuniones, 9,06 horas), evaluados contra los RTTM de alineacion forzada de NVIDIA con collar de 0 s, incluyendo habla solapada, umbral simple de 0,5 a 10 ms y sin post-procesado.

| Modelo | Lookahead | DER | JER | Missed | False alarm | Speaker confusion |
|---|---:|---:|---:|---:|---:|---:|
| NVIDIA referencia (HF Transformers, fp32) | 30,4 s | 9,22% | 12,89% | 4,68% | 3,67% | 0,88% |
| Este port, F32 | 30,4 s | 9,23% | 12,84% | 4,68% | 3,67% | 0,88% |
| Este port, F16 | 30,4 s | 9,23% | 12,84% | 4,68% | 3,67% | 0,88% |
| Este port, Q8_0 | 30,4 s | 9,23% | 12,85% | 4,79% | 3,58% | 0,86% |
| Este port, Q8_0 | 1,04 s | 9,48% | 13,02% | 5,02% | 3,51% | 0,95% |
| Este port, Q8_0 | 0,64 s | 9,64% | 13,16% | 5,13% | 3,51% | 1,01% |
| Sortformer v2.1 Q8_0 (diarizador anterior) | 30,4 s | 15,99% | 21,20% | 7,42% | 4,97% | 3,60% |

Segun el autor, frente a Sortformer v2.1 los errores caen un 42% y la confusion de hablante un 76%, y el modo streaming de 1 segundo supera al modo offline de v2.1.

Rendimiento en un Apple M2 Pro (modo offline, veces mas rapido que tiempo real):

| Modelo | Metal, reunion de 10 min | CPU, reunion de 10 min |
|---|---:|---:|
| Nemotron-3 Q8_0 | 339x | 59x |
| Nemotron-3 F16 | 335x | 48x |
| Sortformer v2.1 Q8_0 | 105x | 44x |

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB en cualquiera de las cuantizaciones (106 MB en Q8_0, 199 MB en F16 y 397 MB en F32), sin contar el buffer de audio y el estado de la cache de hablante.
- Cabe holgadamente en cualquier GPU de consumo; no requiere GPU dedicada y puede ejecutarse integramente en CPU.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. El autor documenta mediciones con aceleracion Metal en un Apple M2 Pro; no se documenta soporte para CUDA, ROCm ni otros backends.
- Despliegue: transcribe.cpp (CLI `transcribe-cli` y API C) y Glimpse-Speech para Rust. No se documenta soporte en vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: en Apple M2 Pro, 339x tiempo real en Metal y 59x en CPU con Q8_0 para una reunion de 10 minutos (modo offline). El lookahead configurable va de 30,4 s (`DEFAULT`/`VERY_HIGH_LATENCY`) a 0,32 s (`ULTRA_LOW_LATENCY`).
- Requisito de entrada: audio a 16 kHz mono; otras frecuencias se remuestrean antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Lookahead | DER (AMI IHM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Diarization-gguf (este port, Q8_0) | 99,2 M | 30,4 s / 1,04 s / 0,64 s | 9,23% / 9,48% / 9,64% | OpenMDW 1.1, uso comercial permitido | GGUF en HuggingFace, runtime transcribe.cpp |
| nvidia/Nemotron-3-Diarization (referencia) | 99,2 M | 30,4 s | 9,22% | OpenMDW 1.1 | Checkpoint original en HuggingFace para HF Transformers |
| Sortformer v2.1 Q8_0 (diarizador anterior) | No disponible en la informacion proporcionada | 30,4 s | 15,99% | No disponible en la informacion proporcionada | Formato GGUF segun la comparativa del autor |

No se dispone de datos de otros diarizadores comerciales o academicos (por ejemplo, basados en clustering con embeddings) en la informacion proporcionada, por lo que la comparativa se limita a los tres sistemas anteriores.

## Limitaciones y advertencias

- El modelo no genera transcripcion: solo produce segmentos temporales por hablante. Cualquier caso de uso que requiera texto necesita un modelo ASR adicional.
- Numero maximo de 8 hablantes; por encima de esa cifra no hay soporte documentado.
- Precisión limitada: el DER en AMI es del 9,23% en el mejor caso, con un 4,79% de habla no detectada (missed) y un 3,58% de falsas alarmas. La confusion entre hablantes es baja (0,86%) pero no nula.
- El rendimiento degrada con lookahead menor: el DER sube de 9,23% (30,4 s) a 9,64% (0,64 s), y los errores de confusion de hablante pasan de 0,86% a 1,01%.
- Los resultados de AMI corresponden a reuniones en ingles; el repositorio solo declara el idioma `en`. No hay evaluacion publicada en la informacion disponible para otros idiomas.
- La model card no documenta sesgos demograficos, acusticos o de otro tipo. El autor remite explicitamente a la ficha de NVIDIA para notas de sesgo, seguridad y privacidad.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de asignacion erronea de hablante en tramas ambiguas o con solapamiento, asi como de fragmentacion de turnos en fronteras de cambio de hablante.
- Licencia: OpenMDW 1.1 permite uso comercial segun la model card, pero se debe consultar el texto integro de la licencia (`LICENSE`) y los terminos de NVIDIA antes de un despliegue en produccion. El repositorio es una conversion no oficial y no cuenta con soporte de NVIDIA.
- Dependencia de un fork concreto del runtime: el modelo esta preparado para transcribe.cpp, en la rama `glimpse-diarization` del repositorio de LegendarySpy, lo que puede afectar al mantenimiento a largo plazo y a la compatibilidad con versiones upstream.
- Diferencias de punto flotante documentadas: la build con Metal y la referencia discrepan en el 0,03% de las decisiones a 10 ms, debido a reordenacion de operaciones en la compresion de la cache. El autor indica que el DER no cambia, pero conviene verificarlo en dominios propios.
- Consumo de audio: la entrada debe ser 16 kHz mono; el remuestreo de otras frecuencias anade coste y puede introducir diferencias respecto a la evaluacion original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Glimpse-Dictation/Nemotron-3-Diarization-gguf
- Modelo base (NVIDIA): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Runtime transcribe.cpp (rama glimpse-diarization): https://github.com/LegendarySpy/transcribe.cpp/tree/glimpse-diarization
- Bindings en Rust (Glimpse-Speech): https://github.com/glimpse-hq/Glimpse-Speech
- Licencia del modelo (OpenMDW 1.1): fichero `LICENSE` dentro del repositorio de HuggingFace
- Revision del checkpoint original: `a435e9867d79e789e90053f9b6d6834053af564a`
- Script de conversion: `scripts/convert-nemotron3_diar.py` (incluido en el repositorio)
- Los resultados de la busqueda web no aportan enlaces tecnicos relevantes sobre este modelo: corresponden a plataformas de tendencias y a diccionarios con la palabra "glimpse", sin relacion con el repositorio.
