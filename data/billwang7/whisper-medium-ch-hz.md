# BillWang7/whisper-medium-ch-hz

## Resumen

Whisper-medium-ch-hz es un ajuste fino de `openai/whisper-medium` (763.857.920 parametros) especializado en el reconocimiento automatico del habla del dialecto de Huzhou (湖州话), una variedad del chino wu hablada en la ciudad de Huzhou, provincia de Zhejiang. Lo desarrolla BillWang7, un autor individual, y resuelve un problema concreto: los sistemas ASR estandar, incluido Whisper original, estan entrenados para mandarin y cantonés y fallan estrepitosamente con dialectos regionales. El modelo transcribe audio en dialecto de Huzhou y produce la salida en caracteres chinos simplificados (mandarin escrito), no en transcripcion fonetica.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper medium, con una ventana de entrada de 30 segundos y 1.500 posiciones de contexto en el decoder. Se ha entrenado sobre 15.354 clips (unas 15 horas) del dataset propio `BillWang7/huzhou-dialect-speech`, en su mayoria audio de informativos. La relevancia actual es practica: demuestra que un ajuste fino relativamente modesto sobre un modelo base de tamano medio puede reducir el CER de un 120,7% (linea base) a un 26,8% en un dialecto de bajos recursos, un salto de calidad que hace viable la transcripcion automatica de contenido dialectal para archivo, subtitulado o preservacion linguistica.

El modelo tiene 34 descargas y 0 likes en Hugging Face, se distribuye en formato safetensors dentro de un repositorio de 10,5 GB y su licencia no esta declarada. Es, por tanto, un artefacto de investigacion y uso personal mas que un modelo listo para produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s; 1.500 posiciones en el decoder (arquitectura Whisper) |
| Tipos de cuantizacion | no disponible (repo en safetensors fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | zh (mandarin escrito como salida); entrada: dialecto de Huzhou (wu) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium sin modificaciones estructurales: un encoder transformer que procesa espectrogramas mel de 80 canales sobre ventanas de 30 segundos y un decoder autoregresivo que genera tokens de texto con tokens especiales de idioma y tarea. El ajuste fino conserva la tokenizacion y el vocabulario multilingue originales, y el autor indica que la salida se fuerza con `language="zh"` y `task="transcribe"`.

El entrenamiento uso 15.354 clips de entrenamiento (aproximadamente 15 horas) del dataset Huzhou Dialect Speech, con 4.000 pasos, tamano de lote 64, learning rate 1e-5, 500 pasos de warmup y precision fp16. Cada 1.000 pasos se evaluo sobre el split de test y se conservo el checkpoint con menor error. El autor reconoce explicitamente que el split de test guio la seleccion de checkpoint (aunque nunca se entreno sobre el), lo que implica que la metrica reportada no es una estimacion completamente ciega del rendimiento en datos no vistos. No se documenta RLHF, DPO ni ninguna tecnica de alineacion adicional; es un ajuste fino supervisado puro sobre transcripciones.

## Capacidades

- Reconocimiento automatico del habla (ASR) de dialecto de Huzhou, con salida en caracteres chinos simplificados (mandarin escrito).
- Transcripcion de clips de audio de hasta 30 segundos, la ventana nativa de Whisper.
- Procesamiento de audio a 16 kHz mono; el codigo de ejemplo incluye remuestreo desde la frecuencia original.
- Manejo de vocabulario coloquial y toponimos locales, con errores documentados en nombres propios y palabras dialectales sin equivalente directo en mandarin.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, vision ni audio generativo; es exclusivamente ASR.
- Capacidad multilingue limitada al par dialecto de Huzhou (entrada) / mandarin (salida); no se documenta soporte para otros idiomas.

## Casos de uso

- Transcripcion de archivos audiovisuales locales: digitalizar grabaciones de informativos, entrevistas o programas de radio de Huzhou y obtener texto en mandarin simplificado para catalogos y buscadores, aprovechando que el modelo fue entrenado precisamente sobre ese tipo de audio.
- Subtitulado de contenido dialectal: generar subtitulos en mandarin escrito para videos en dialecto de Huzhou, con la ventaja de que la salida ya esta en caracteres estandar y no requiere transliteracion posterior.
- Preservacion linguistica y documentacion: transcribir corpus orales de hablantes mayores para construir archivos textuales del dialecto, aceptando el CER del 26,8% como base que un revisor humano corrige despues.
- Investigacion en ASR de bajos recursos: servir como punto de partida o linea base para experimentos de ajuste fino en otras variedades del wu, dado que el codigo de entrenamiento y evaluacion esta publicado en notebooks.
- Asistentes de accesibilidad para hablantes de dialecto: convertir voz en dialecto a texto mandarin para personas con dificultades auditivas o para interfaces que solo aceptan texto estandar.
- Prototipado de aplicaciones de transcripcion en el entorno local de Huzhou: servicios municipales, turismo o medios comunitarios que necesiten procesar audio dialectal sin depender de APIs comerciales que no cubren esta variedad.
- Evaluacion comparativa de modelos ASR: usar el split de test del dataset y el script `evaluate.ipynb` para medir CER de otros modelos frente a este en la misma tarea.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| whisper-medium-ch-hz | Huzhou Dialect Speech (test, 1.705 clips) | CER | 26,8% |
| whisper-medium-ch-hz | Huzhou Dialect Speech (test, mismos 100 clips que la linea base) | CER | 22,8% |
| openai/whisper-medium (linea base) | Huzhou Dialect Speech (test, primeros 100 clips) | CER | 120,7% |

El CER de la linea base supera el 100% porque el modelo original genera texto no relacionado con la referencia, produciendo mas caracteres erroneos que los presentes en la transcripcion correcta. El autor advierte que la seleccion de checkpoint se hizo sobre el split de test, por lo que las cifras pueden estar optimistas respecto a un conjunto de evaluacion completamente independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,5-2 GB para los pesos (763,9 M de parametros) mas el overhead de activaciones y buffers de audio; en la practica, 3-4 GB son suficientes.
- En fp32, los pesos ocupan aproximadamente 3 GB; la VRAM total recomendada ronda los 6 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve. Cabe holgadamente en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090; en el ambito profesional, A100, H100 y L4 estan sobredimensionadas para este modelo.
- Tambien puede ejecutarse en CPU para transcripcion por lotes no interactiva, con latencia mayor.
- Opciones de despliegue: transformers (codigo de ejemplo del autor), y al ser arquitectura Whisper estandar, es compatible con implementaciones habituales como faster-whisper, whisper.cpp o vLLM (previa conversion de pesos); el autor proporciona ademas una demo interactiva en Docker en su repositorio de GitHub.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idioma/dialecto | CER en Huzhou | Licencia |
|---|---|---|---|---|---|
| whisper-medium-ch-hz | 763,9 M | 30 s | Huzhou (wu) → mandarin | 26,8% | no disponible |
| openai/whisper-medium | 769 M | 30 s | 99 idiomas (mandarin, cantonés) | 120,7% (100 clips) | MIT (modelo original) |
| openai/whisper-large-v3 | 1.550 M | 30 s | 99 idiomas, mejor ASR multilingue | no evaluado en este dataset | MIT (modelo original) |
| Modelos ASR especificos para dialectos chinos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible contra el modelo base, porque el autor no publica resultados frente a otros ajustes finos de dialectos chinos. Whisper-large-v3, siendo mas grande y con mejor rendimiento general en mandarin, no ha sido evaluado en este dataset, por lo que no puede afirmarse su comportamiento en dialecto de Huzhou.

## Limitaciones y advertencias

- El entrenamiento se hizo mayoritariamente sobre audio de informativos; la precision cae en conversacion casual, hablantes mayores con acento marcado y grabaciones con ruido.
- Errores frecuentes en nombres propios, toponimos y palabras dialectales sin equivalente directo en mandarin.
- La salida es mandarin escrito, no una transcripcion fonetica del dialecto; no sirve para estudios foneticos del wu.
- El split de test se uso para seleccionar checkpoint, por lo que el CER reportado puede ser optimista frente a datos realmente no vistos.
- La licencia no esta declarada: no hay autorizacion explicita para uso comercial y conviene contactar con el autor antes de integrarlo en un producto.
- El modelo base Whisper tiene sesgos conocidos hacia determinados acentos y registros; el ajuste fino no los corrige y puede reforzar el sesgo hacia el estilo de los informativos.
- Riesgo de alucinacion: Whisper puede generar texto plausible no presente en el audio, especialmente en silencios o audio degradado; en un modelo con CER del 26,8% este riesgo es considerable y exige revision humana en flujos criticos.
- Ventana de 30 segundos: los audios mas largos requieren segmentacion manual o mediante pipeline externo.
- Solo un idioma de entrada documentado (dialecto de Huzhou); no se garantiza comportamiento en otras variedades del wu ni en mandarin estandar.
- Repositorio de 10,5 GB y solo 34 descargas: ecosistema minimo, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BillWang7/whisper-medium-ch-hz
- Modelo base: https://huggingface.co/openai/whisper-medium
- Dataset: https://huggingface.co/datasets/BillWang7/huzhou-dialect-speech
- Repositorio con demo Docker: https://github.com/BillWang7/whisper-huzhou-asr
- Notebook de entrenamiento: `training.ipynb` (incluido en el repositorio del modelo)
- Notebook de evaluacion: `evaluate.ipynb` (incluido en el repositorio del modelo)
- Resultados por clip: `evaluation.csv` (incluido en el repositorio del modelo)
