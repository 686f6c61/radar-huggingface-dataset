# Sanghyang00/ELARSpeech-Whisper-Large-v3-atv

## Resumen

ELARSpeech-Whisper-Large-v3-atv es un modelo de reconocimiento automatico del habla (ASR) especializado en altai septentrional (teleut), una lengua turquica con codigo ISO 639-3 `atv`. Lo publica el usuario Sanghyang00 dentro del proyecto ELARSpeech y se construye como un ajuste fino (fine-tune) del modelo `openai/whisper-large-v3` de OpenAI, del que hereda la arquitectura completa.

Tecnicamente es un transformer encoder-decoder de 1.543.491.840 parametros (aproximadamente 1,54 mil millones), la configuracion Large-v3 de Whisper, que procesa audio en ventanas de 30 segundos convertidas a un espectrograma Mel de 128 bins y genera texto de forma autorregresiva. El repositorio ocupa 6,2 GB y los pesos se distribuyen en formato safetensors, cargables con la libreria `transformers`.

Su relevancia es acotada pero clara: se trata de un modelo monoidioma para una lengua con muy pocos recursos digitales, orientado a la transcripcion y preservacion linguistica mas que a un uso generalista. El modelo esta marcado como `endpoints_compatible` y no registra descargas ni interacciones en el momento de redactar esta ficha, por lo que su validacion independiente es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 (aprox. 1,54 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (arquitectura Whisper); contexto en tokens: no disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | Altai septentrional / teleut (ISO 639-3: `atv`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,2 GB |
| Modelo base | openai/whisper-large-v3 |
| Libreria | transformers |
| Tarea (pipeline) | automatic-speech-recognition |
| Fecha de publicacion | 15 de octubre de 2026 (fecha indicada en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Large-v3 sin modificaciones estructurales: un encoder que consume un espectrograma Mel de 128 bins calculado sobre ventanas de 30 segundos y un decoder autorregresivo que emite tokens de texto. El audio de entrada debe ser mono y estar muestreado a 16 kHz, tal como especifica el autor. El audio de formato largo se maneja mediante decodificacion secuencial o por fragmentos, siguiendo el esquema habitual de Whisper.

No se han publicado detalles sobre el proceso de entrenamiento: ni el numero de tokens o horas de audio utilizados, ni la composicion del corpus, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documenta si el ajuste fue completo o mediante parametros eficientes. La model card unicamente indica que el artefacto exportado se verifica contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con resultado **PASS** en verificacion de transcripcion exacta, lo que sugiere un procedimiento de exportacion controlado, pero no aporta informacion sobre el dataset de entrenamiento ni sobre su calidad.

Un detalle relevante de implementacion es que el modelo espera un prompt explicito de decoder que incluye el token de idioma `<|atv|>`, junto con `<|transcribe|>` y `<|notimestamps|>`. El autor advierte de que debe usarse este prompt y no el parametro `language=` para reproducir el comportamiento de decodificacion del modelo exportado, lo que indica una personalizacion del tokenizer o de los tokens de idioma respecto al Whisper original.

## Capacidades

- Transcripcion de voz a texto en altai septentrional (teleut), unica lengua soportada por el modelo.
- Procesamiento de audio mono a 16 kHz en ventanas de 30 segundos, con soporte de audio largo mediante decodificacion secuencial o por fragmentos.
- Decodificacion con busqueda greedy o por haces (el ejemplo del autor usa `num_beams=1`), con generacion limitada por `max_new_tokens`.
- Emision de transcripciones sin timestamps cuando se usa el token `<|notimestamps|>` en el prompt, tal como propone el autor.
- Uso mediante la API estandar de `transformers` (`WhisperForConditionalGeneration` y `WhisperProcessor`), compatible con endpoints de inferencia.
- No se documenta soporte de traduccion a otros idiomas, tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio mas alla de la propia transcripcion.

## Casos de uso

- Documentacion linguistica de campo: transcripcion de grabaciones de hablantes nativos de teleut obtenidas en trabajo de campo, resampleadas previamente a 16 kHz mono, para acelerar la anotacion manual posterior por parte de linguistas.
- Preservacion de archivos orales etnograficos: digitalizacion y transcripcion de cintas o archivos historicos de narraciones, canciones y relatos tradicionales en altai septentrional, generando texto buscable a partir de material que hoy solo existe en audio.
- Subtitulado de material audiovisual en teleut: generacion de subtitulos para documentales, entrevistas o videos comunitarios, troceando el audio en fragmentos de 30 segundos y ensamblando las transcripciones resultantes.
- Apoyo a la ensenanza del idioma: transcripcion de audios de ejercicios o lecturas para construir materiales didacticos bilingues con texto alineado al audio.
- Investigacion comparativa en linguistica turquica: transcripcion masiva de corpus orales para estudios fonologicos y morfologicos, siempre con revision humana dado que no hay metricas publicadas de error.
- Construccion de corpus paralelos: transcripcion de entrevistas bilingues para alinear segmentos en teleut con su traduccion, alimentando diccionarios o memorias de traduccion.
- Prototipos de asistentes de voz en lengua minoritaria: integracion del modelo como etapa ASR en un pipeline experimental, con la salvedad de que no hay datos publicos de latencia ni de tasa de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica referencia de validacion es la afirmacion del autor de que el artefacto exportado supera una prueba de verificacion de transcripcion exacta (**PASS**) frente al checkpoint original de ELARSpeech sobre un conjunto fijo de muestras de evaluacion. No se especifican el tamano de ese conjunto, la metrica empleada (WER, CER u otra) ni los valores obtenidos, y no hay comparacion con modelos alternativos.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 6,17 GB en fp32, 3,09 GB en fp16/bf16, 1,54 GB en int8 y 0,77 GB en int4, sin contar el overhead de activaciones y del encoder de audio.
- VRAM estimada para inferencia en fp16/bf16: en torno a 4-6 GB con lotes pequenos, margen suficiente para GPUs de consumo.
- VRAM estimada en int8: aproximadamente 3 GB; en int4, en torno a 1,5-2 GB.
- GPUs de consumo compatibles: RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090, siempre que se use fp16 o cuantizacion inferior. Una GPU con 6-8 GB puede ejecutar el modelo en fp16 con lotes pequenos.
- GPUs de datacenter: A100, H100 o L40S para procesamiento por lotes a gran escala, aunque el modelo es lo bastante pequeno como para no requerirlas.
- Opciones de despliegue: `transformers` (la ruta documentada por el autor), vLLM y TGI, que soportan arquitecturas Whisper. Para CTranslate2/faster-whisper o whisper.cpp seria necesaria una conversion previa a sus formatos, y el repositorio no publica pesos GGUF ni CTranslate2.
- Latencia y throughput: no disponible. No hay mediciones publicadas de velocidad de transcripcion ni de tiempo real factor para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-atv | 1,54 mil millones | `atv` (altai septentrional / teleut) | Whisper encoder-decoder | No disponible | Hugging Face, safetensors, 0 descargas |
| openai/whisper-large-v3 | 1,55 mil millones | Multilingue (Whisper Large-v3) | Whisper encoder-decoder | No disponible en la informacion proporcionada (consultar el repositorio del modelo base) | Hugging Face, ampliamente distribuido |
| Sanghyang00/ELARSpeech-Whisper-Large-v3-afi | No disponible | `afi` (otro idioma del proyecto ELARSpeech) | Whisper encoder-decoder | No disponible | Hugging Face, safetensors |
| Whisper large-v3 turbo | No disponible en la informacion proporcionada | Multilingue | Whisper encoder-decoder optimizado | No disponible en la informacion proporcionada | Repositorio openai/whisper |

La diferencia fundamental frente al modelo base es el idioma: este ajuste cubre una unica lengua de bajos recursos, mientras que `whisper-large-v3` es multilingue y esta ampliamente validado. Frente a la variante turbo del modelo base, que segun la documentacion de OpenAI ofrece mayor velocidad con una degradacion minima de precision, no hay datos comparativos para el ajuste en teleut.

## Limitaciones y advertencias

- Modelo monoidioma: solo transcribe altai septentrional (teleut). No se documenta soporte de traduccion ni de otras lenguas.
- Sin benchmarks publicados: no existen cifras de WER ni de CER, por lo que el rendimiento real en produccion es desconocido.
- Licencia no disponible: la model card remite a la documentacion del proyecto ELARSpeech para los terminos del dataset y al repositorio del modelo base para su licencia. Sin esa informacion no puede confirmarse que el uso comercial este permitido.
- Riesgo de alucinacion: como cualquier modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente con ruido, musica o silencios prolongados. Se recomienda revision humana.
- Variabilidad de resultados: el propio autor advierte de que la precision varia segun las condiciones de grabacion, la poblacion de hablantes, la ortografia empleada y el dominio.
- Requisito estricto de preprocesado: el audio debe ser mono y estar resampleado a 16 kHz; no hacerlo degrada la transcripcion.
- Prompt de decoder especifico: es necesario inyectar el token `<|atv|>` en el prompt; usar el parametro `language=` puede no reproducir el comportamiento esperado.
- Adopcion nula: cero descargas y cero interacciones en el repositorio, sin evidencia externa de validacion por terceros ni de mantenimiento.
- Ausencia de formatos cuantizados: no hay pesos GGUF ni CTranslate2 publicados, lo que limita el despliegue en herramientas de inferencia ligera sin una conversion previa.
- Sesgos: no se ha publicado informacion sobre la composicion demografica del corpus de entrenamiento, por lo que se desconoce si el modelo rinde de forma homogenea entre dialectos, edades o generos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-atv
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Variante del mismo proyecto para el codigo `afi`: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-afi
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Anuncio de Whisper en OpenAI: https://openai.com/index/whisper/
- Ficha de Whisper large-v3 en Vast.ai: https://vast.ai/model/whisper
