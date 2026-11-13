# hcxlabs/echora-kiki

## Resumen

Echora Kiki es un modelo de transcripcion automatica de letras de canciones (lyric transcription) desarrollado por hcxlabs. Se trata de un fine-tune del modelo OpenMOSS-Team/MOSS-Transcribe-Diarize, continuando el trabajo de un modelo anterior del mismo autor (Echora MOSS 0.9B Multilingual Lyrics Transcriber). El modelo toma audio musical y genera texto de letra con marcas de tiempo aproximadas por linea y etiquetas de hablante, sin necesidad de proporcionar la letra como entrada.

Con aproximadamente 908 millones de parametros, el modelo esta disenado especificamente para el caso de uso de transcripcion de letras en bibliotecas musicales personales y proyectos de visualizacion de letras. La diferencia principal respecto a su predecesor es el entrenamiento sobre ventanas de 60 segundos en posiciones arbitrarias de la cancion (en lugar de clips que comienzan en una linea de letra), lo que coincide con el pipeline de inferencia recomendado y reduce la discrepancia entre entrenamiento y despliegue.

El modelo se publica bajo licencia Apache 2.0 y emplea la libreria transformers con pesos en safetensors. Su relevancia actual radica en que aborda un problema practico poco cubierto por los modelos ASR generalistas: la transcripcion de letras cantadas con marcas temporales, coros de acompanamiento entre parentesis y control de repeticiones, un escenario donde los sistemas de reconocimiento de voz convencionales rinden de forma deficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOSS-Transcribe-Diarize (fine-tune); detalles arquitectonicos internos no disponibles |
| Parametros totales | 908.513.280 (~0,9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de inferencia de 60 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue (idiomas concretos no disponibles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Echora Kiki es un fine-tune del modelo MOSS-Transcribe-Diarize de OpenMOSS-Team, heredado a traves del checkpoint intermedio hcX02/echora-moss-0.9b-multilingual-lyrics-transcriber. El checkpoint publicado corresponde al step 16.000 de un fine-tune continuado. La model card no detalla la arquitectura interna del transformer subyacente ni la composicion exacta del dataset de entrenamiento (numero de tokens, proporciones por idioma o fuentes).

La innovacion principal respecto al modelo anterior reside en la estrategia de entrenamiento: se usan ventanas de 60 segundos en posiciones arbitrarias de la cancion, replicando como el pipeline de inferencia recomendado corta el audio, en lugar de clips alineados al inicio de una linea de letra. Cuando una linea cruza el borde de la ventana, solo se conservan las palabras cantadas dentro de ella. Ademas, el modelo aprende a transcribir coros de acompanamiento entre parentesis dentro de su linea, se entrena con una pequena proporcion de ventanas sin letra para producir transcripciones vacias, y en parte de las ventanas se utiliza un prompt especifico de idioma (`Transcribe the audio in <language>. Do not translate it.`). El entrenamiento se realizo sobre mezclas completas y la perdida en ventanas de validacion retenidas bajo de 0,578 (modelo anterior) a 0,498.

## Capacidades

- Transcripcion automatica de letras de canciones a partir de audio musical, sin letra de referencia.
- Generacion de marcas de tiempo aproximadas por linea en segundos, con formato `[12.00][S01]Example lyric line[15.20]`.
- Etiquetado de hablante por segmento (`S01`, etc.), aunque no debe interpretarse como identidad verificada del cantante.
- Transcripcion de coros de acompanamiento entre parentesis dentro de la linea correspondiente.
- Deteccion de ventanas sin letra, devolviendo transcripcion vacia.
- Capacidad multilingue (idiomas concretos no disponibles en la informacion proporcionada).
- Soporte de prompt de idioma para forzar la transcripcion sin traduccion.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Biblioteca musical personal con letras sincronizadas: el modelo genera letra y marcas temporales por linea que pueden alimentar visores de letra tipo karaoke en reproductores locales, aprovechando el formato de salida con timestamps en segundos.
- Proyectos de visualizacion de letras: la salida estructurada `[timestamp][speaker]texto[timestamp]` permite renderizar lineas sincronizadas en aplicaciones web o moviles sin postprocesado complejo.
- Archivado y catalogacion de audio musical: transcripcion masiva de una coleccion para indexar canciones por contenido lirico y facilitar busquedas textuales sobre audio no etiquetado.
- Investigacion en procesamiento de audio musical: el modelo sirve como linea base reproducible (Apache 2.0) para experimentos de reconocimiento de voz cantada, evaluacion de separacion vocal o estudios de alineacion letra-audio.
- Generacion de subtitulos para contenido musical en video: transcripcion de actuaciones en directo o videoclips donde no se dispone del texto de la letra, con la advertencia de revision humana previa a publicacion.
- Prototipado de aplicaciones de karaoke o educacion musical: integracion del modelo en pipelines que separan voces, transcriben por ventanas solapadas y fusionan resultados para construir experiencias interactivas.
- Analisis de repertorio multilingue: al soportar multiples idiomas y prompt de idioma, permite procesar discografias con canciones en varias lenguas manteniendo la transcripcion en el idioma original.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre "Echora Kiki" pero sin resultados asociados. El unico dato cuantitativo publicado es la perdida de validacion sobre ventanas retenidas:

| Metrica | Modelo anterior | Echora Kiki |
|---|---|---|
| Perdida de validacion (ventanas retenidas) | 0,578 | 0,498 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~0,9B parametros, aproximadamente 1,8 GB en fp16/bf16 para los pesos; en torno a 0,9-1,0 GB en cuantizacion de 8 bits y 0,5-0,6 GB en 4 bits, sin contar memoria para activaciones y buffers de audio (no se publican cifras oficiales).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM deberia ser suficiente para fp16; A100, H100 o L40S para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: la model card indica el uso de un pipeline de inferencia compatible con MOSS-Transcribe-Diarize a traves de la libreria transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El pipeline recomendado incluye separacion vocal y transcripcion por ventanas solapadas de 60 segundos con controles de repeticion, pasos que anaden coste computacional fuera del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Echora Kiki (hcxlabs) | ~0,9B | no disponible (ventanas de 60 s) | Transcripcion de letras con timestamps | Apache 2.0 | Hugging Face |
| Echora MOSS 0.9B Multilingual Lyrics Transcriber (hcX02) | ~0,9B | no disponible | Transcripcion de letras | no disponible en la informacion proporcionada | Hugging Face |
| MOSS-Transcribe-Diarize (OpenMOSS-Team) | no disponible | no disponible | Transcripcion con diarizacion | no disponible en la informacion proporcionada | Hugging Face |
| Whisper (OpenAI) | 0,077B-1,55B | 30 s por ventana | ASR generalista (no especifico de letras) | MIT | Hugging Face, OpenAI |

La comparacion con Whisper se incluye como referencia de categoria ASR; no se dispone de datos de rendimiento comparativo entre ambos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las letras generadas pueden contener palabras incorrectas, omitidas o inventadas.
- Frases repetidas, ad-libs, voces superpuestas y efectos vocales pueden provocar repeticiones o errores de transcripcion.
- Las marcas de tiempo son aproximadas.
- La precision varia segun el idioma, la claridad vocal y la calidad de la grabacion.
- La separacion vocal y la fusion de ventanas del pipeline recomendado pueden introducir errores adicionales.
- Las secciones instrumentales pueden producir texto no deseado.
- Las etiquetas de hablante no deben interpretarse como identidades verificadas de los cantantes.
- Los sesgos conocidos no se documentan en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero los usuarios son responsables de asegurar que poseen los derechos necesarios para procesar el audio y usar el texto generado.
- Se recomienda revision humana antes de publicar o depender de las letras generadas, y mostrar un aviso del tipo "Lyrics transcribed using AI/ML. May contain errors."

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hcxlabs/echora-kiki
- Modelo anterior: https://huggingface.co/hcX02/echora-moss-0.9b-multilingual-lyrics-transcriber
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio de la aplicacion Echora: https://github.com/hcx-labs/echora-app
