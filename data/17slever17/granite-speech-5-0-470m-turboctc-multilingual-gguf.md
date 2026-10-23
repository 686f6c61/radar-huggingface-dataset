# 17slever17/granite-speech-5.0-470m-turboctc-multilingual-GGUF

## Resumen

Esta ficha describe la conversion a GGUF del checkpoint `ibm-granite/granite-speech-5.0-470m-turboctc`, un modelo de reconocimiento automatico del habla (ASR) de IBM Granite con 473.014.752 parametros y soporte para siete idiomas: ingles, frances, aleman, espanol, portugues, italiano y japones. La conversion la firma el usuario 17slever17 y esta pensada para ejecutarse con el runtime `transcribe.cpp`, no con Transformers. El repositorio incluye un unico fichero Q8_0 de 505.663.136 bytes (aproximadamente 0,47 GiB), derivado de una conversion intermedia a F32 GGUF.

El interes practico del artefacto es doble. Por un lado, baja un modelo ASR multilingue de ~473 M de parametros a un formato binario de medio giga que puede ejecutarse en CPU y en GPUs de consumo, lo que facilita despliegues en local y en entornos sin acelerador. Por otro, la model card documenta con precision la procedencia de la conversion (commit exacto del checkpoint fuente, revision del conversor, parche aplicado, SHA-256 del fichero) y una comprobacion de paridad limitada frente a la referencia F32 en Transformers sobre tres clips en ingles, espanol y japones.

Se trata de una conversion de formato y cuantizacion, no de un fine-tune: los pesos, el vocabulario multilingue y el token de blank CTC (`<unk>`) se preservan del modelo original. El modelo es solo de transcripcion, no de traduccion, y el runtime no expone deteccion de idioma (`stt.capability.lang_detect` es `false`). No es una publicacion oficial de IBM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible el detalle del encoder en la informacion proporcionada; la nomenclatura TurboCTC y la preservacion del token de blank CTC indican una cabeza de decodificacion CTC |
| Parametros totales | 473.014.752 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; la informacion no especifica ventana de audio maxima) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | Ingles, frances, aleman, espanol, portugues, italiano, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (runtime `transcribe.cpp`) |
| Frecuencia de muestreo de entrada | 16 kHz, mono (PCM) |
| Tarea | Reconocimiento automatico del habla (speech-to-text), no traduccion |
| Deteccion de idioma en runtime | No (`stt.capability.lang_detect = false`) |
| Tamano del repositorio | 0,5 GB |
| Fichero principal | `granite-speech-5.0-470m-turboctc-multilingual-Q8_0.gguf` (505.663.136 bytes) |
| SHA-256 del fichero | `f3efdc05b85b3a764bb5bb7022e69f61cafcecc11605c881c6396a6ed07ec91b` |
| Checkpoint fuente | `ibm-granite/granite-speech-5.0-470m-turboctc` en el commit `1dd23f46f6d4e6eae2531982ba2e33220086dd97` |
| Revision del conversor | `transcribe.cpp` en `4d7c1ccefd39e5a9ea36cca5f8fefc6dcc14b99b` |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del checkpoint original: no se detallan el tipo de encoder, el numero de capas, la dimension oculta ni la composicion del dataset de entrenamiento. Lo que si se puede afirmar a partir de los materiales aportados es que el modelo emplea decodificacion CTC (la card indica que se preserva el token de blank CTC `<unk>` del vocabulario original) y que la release multilingue corresponde al checkpoint del 21 de octubre de 2026, no a la version anterior solo en ingles.

El proceso aplicado en este repositorio es puramente de conversion y cuantizacion: los pesos originales se convierten primero a un GGUF F32 de diagnostico y despues se cuantizan con `transcribe-quantize --quant Q8_0`. El parche del conversor registra los siete idiomas soportados y acepta los metadatos actualizados del processor sin requerir el `preprocessor_config.json` legado opcional. No hay entrenamiento adicional, RLHF, DPO ni ajuste de ningun tipo; el autor lo declara explicitamente como "format conversion and quantization, not a fine-tune".

## Capacidades

- Transcripcion de voz a texto en siete idiomas: ingles, frances, aleman, espanol, portugues, italiano y japones.
- Decodificacion CTC sobre audio PCM mono a 16 kHz.
- Ejecucion en local mediante `transcribe.cpp`, sin dependencia de frameworks de deep learning pesados.
- Preservacion del vocabulario multilingue original del checkpoint de IBM, incluido el token de blank CTC.
- Paridad de transcripcion verificada frente a la referencia F32 de Transformers en tres clips (ingles, espanol, japones).
- No soporta deteccion automatica de idioma en el runtime.
- No soporta traduccion: la salida es texto en el idioma hablado.
- No hay informacion disponible sobre timestamps, diarizacion de hablantes, puntuacion automatica, tool calling ni modos de razonamiento; son capacidades ajenas al proposito del modelo.

## Casos de uso

- Transcripcion de reuniones y notas de voz en entornos corporativos multilingues: al cubrir espanol, ingles, frances, aleman, portugues, italiano y japones con un unico fichero de ~0,47 GiB, se puede desplegar una misma instancia para equipos distribuidos sin gestionar un modelo por idioma, enviando audio ya remuestreado a 16 kHz mono.
- Subtitulado de contenido audiovisual: el modelo genera la transcripcion del audio en el idioma original, que despues se puede alinear con marcas de tiempo en un paso posterior del pipeline (el modelo en si no produce timestamps segun la informacion disponible).
- Interfaces de voz en dispositivo: con 473 M de parametros y un fichero Q8_0 de ~505 MB, cabe en equipos de gama media y permite dictado o comandos de voz sin enviar audio a la nube, lo que simplifica el cumplimiento de RGPD.
- Procesamiento por lotes en centros de contacto: transcripcion de grabaciones de llamadas para control de calidad, analitica y busqueda de texto completo, ejecutable en CPU si no hay GPU disponible.
- Archivado y catalogacion de fondos sonoros: transcripcion masiva de podcasts, entrevistas o archivos de radio para habilitar busqueda por texto sobre la coleccion.
- Accesibilidad: generacion de subtitulos para personas con discapacidad auditiva en videos internos o material formativo, en los siete idiomas soportados.
- Pseudo-etiquetado de datos: generacion de transcripciones a gran escala para construir corpus de entrenamiento o evaluacion de otros sistemas ASR, con la advertencia de que no se han publicado tasas de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER, CER u otros) en la informacion disponible. La model card incluye unicamente una comprobacion de paridad de conversion, que no constituye una evaluacion de calidad de transcripcion:

| Comprobacion | Condiciones | Resultado |
|---|---|---|
| Paridad Q8_0 frente a referencia F32 en Transformers | 3 clips fijos (ingles, espanol, japones), PCM mono 16 kHz identico | Transcripcion exactamente identica |
| Evaluacion WER multilingue | No realizada | No disponible |
| Frances, aleman, portugues, italiano | No evaluados en la comprobacion de paridad | No disponible |

El propio autor advierte que se trata de "a limited conversion-parity check, not a comprehensive multilingual WER benchmark".

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 1 GB considerando el fichero Q8_0 de 505.663.136 bytes mas el overhead del runtime; la referencia F32 equivalente ocuparia aproximadamente 1,9 GB solo en pesos.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o mas (RTX 3050, RTX 4060, RTX 4090) queda sobredimensionada para este modelo; tambien es viable en CPU.
- GPU de datacenter (A100, H100) no justificadas por capacidad: el modelo es demasiado pequeno para aprovecharlas, salvo por agregacion de muchas instancias concurrentes.
- Despliegue: `transcribe.cpp` es el runtime previsto, con el binario `transcribe-cli`. Ejemplo de la model card:

```bash
build/bin/transcribe-cli \
  -m granite-speech-5.0-470m-turboctc-multilingual-Q8_0.gguf \
  audio.wav
```

- Otros runtimes (vLLM, llama.cpp, Ollama, TGI): no hay soporte documentado en la informacion proporcionada; el repositorio esta etiquetado especificamente para `transcribe.cpp`.
- Backends de aceleracion (CUDA, Metal, Vulkan) y requisitos de build: no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (real-time factor) ni de transcripciones por segundo.

## Comparativa con modelos similares

No se dispone de datos de WER comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, cobertura idiomatica, licencia y formato.

| Modelo | Parametros | Idiomas | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| granite-speech-5.0-470m-turboctc-multilingual (este GGUF Q8_0) | 473.014.752 | 7 (en, fr, de, es, pt, it, ja) | Apache 2.0 | GGUF Q8_0 / `transcribe.cpp` | Conversion comunitaria; sin deteccion de idioma; un unico nivel de cuantizacion |
| ibm-granite/granite-speech-5.0-470m-turboctc (original) | 473.014.752 | 7 (en, fr, de, es, pt, it, ja) | Apache 2.0 | Safetensors / Transformers | Referencia F32 usada en la comprobacion de paridad; release oficial de IBM |
| Whisper small | 244 M (dato publico del modelo) | Cobertura multilingue amplia | MIT | Multiples formatos, incluido GGUF via whisper.cpp | Referencia habitual en ASR local; sin comparacion de WER disponible en la informacion proporcionada |
| Whisper medium | 769 M (dato publico del modelo) | Cobertura multilingue amplia | MIT | Multiples formatos, incluido GGUF via whisper.cpp | Mayor coste de inferencia; sin comparacion de WER disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es una release oficial de IBM: es una conversion y cuantizacion comunitaria de 17slever17, publicada sin descargas ni valoraciones en el momento de redactar la ficha.
- Solo se ofrece Q8_0. No hay variantes Q4, Q5 ni F16 en el repositorio, lo que limita el ajuste fino entre tamano y calidad.
- El modelo no traduce: transcribe en el idioma hablado. No debe usarse en pipelines de traduccion directa.
- No hay deteccion de idioma en el runtime (`stt.capability.lang_detect = false`); el consumidor debe conocer o inferir el idioma por otros medios.
- La validacion publicada se reduce a tres clips (en, es, ja) comparados contra la referencia F32. No hay evaluacion independiente de frances, aleman, portugues ni italiano, ni datos de WER en ninguna lengua.
- La calidad de transcripcion en audio con ruido, acentos marcados, solapamiento de hablantes o dominio especializado (medico, legal, jerga tecnica) no esta documentada.
- Dependencia estricta de una revision concreta de `transcribe.cpp` (`4d7c1cce...`); cambios posteriores del conversor o del runtime pueden afectar a la compatibilidad del fichero.
- El modelo esta atado a la entrada de 16 kHz mono; audio en otras frecuencias o multicanal requiere remuestreo y downmix previos.
- No hay informacion sobre sesgos por idioma, variedad dialectal o demografia, ni sobre el origen de los datos de entrenamiento del checkpoint base; se desconoce si el corpus cubre variantes del espanol de Espana frente a las de America Latina.
- Licencia Apache 2.0 en los pesos originales y en el empaquetado, lo que permite uso comercial; el parche del conversor deriva de `transcribe.cpp` (MIT), cuya licencia se conserva por separado en `conversion/LICENSE-transcribe.cpp`. Conviene revisar ambas antes de redistribuir.
- Para produccion se recomienda validar con un conjunto propio etiquetado antes de sustituir un ASR ya en servicio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/17slever17/granite-speech-5.0-470m-turboctc-multilingual-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Checkpoint fuente fijado: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/1dd23f46f6d4e6eae2531982ba2e33220086dd97
- Runtime `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp
- Revision del conversor: https://github.com/handy-computer/transcribe.cpp/tree/4d7c1ccefd39e5a9ea36cca5f8fefc6dcc14b99b
- Fichero Q8_0: https://huggingface.co/17slever17/granite-speech-5.0-470m-turboctc-multilingual-GGUF/resolve/main/granite-speech-5.0-470m-turboctc-multilingual-Q8_0.gguf?download=true
- Metadatos de conversion: https://huggingface.co/17slever17/granite-speech-5.0-470m-turboctc-multilingual-GGUF/blob/main/conversion.json
- Parche del conversor: https://huggingface.co/17slever17/granite-speech-5.0-470m-turboctc-multilingual-GGUF/blob/main/conversion/granite5_ctc_multilingual.patch
- Nota: la busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo; los resultados obtenidos no guardaban relacion con el artefacto y se han descartado.
