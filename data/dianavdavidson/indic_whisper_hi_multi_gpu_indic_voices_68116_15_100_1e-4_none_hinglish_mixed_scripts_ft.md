# dianavdavidson/indic_whisper_hi_multi_gpu_indic_voices_68116_15_100_1e-4_None_hinglish_mixed_scripts_FT

## Resumen

El modelo `indic_whisper_hi_multi_gpu_indic_voices_68116_15_100_1e-4_None_hinglish_mixed_scripts_FT` es un ajuste fino (fine-tuning) del checkpoint `parthiv11/indic_whisper_hi_multi_gpu`, que a su vez parte de la arquitectura Whisper de OpenAI adaptada al hindi y a idiomas indios. Lo publica el usuario `dianavdavidson` en HuggingFace y esta orientado a reconocimiento automatico del habla (ASR) en escenarios de habla hinglish, es decir, mezcla de hindi e ingles con alternancia de alfabetos (devanagari y latino) dentro de una misma emision.

Con 763.857.920 parametros (aproximadamente 764 millones, el tamano clasico de Whisper large), el modelo se distribuye en formato safetensors bajo licencia MIT y se integra en el ecosistema `transformers` con la pipeline `automatic-speech-recognition`. Su interes practico radica en el caso de uso: el habla code-switched hindi-ingles es extremadamente frecuente en India y esta mal cubierta por los modelos ASR genericos, por lo que un ajuste especifico sobre IndicWhisper resulta relevante para transcripcion de audio real en ese contexto.

La informacion publicada por el autor es escasa: la model card es autogenerada por el Trainer y no documenta el dataset de entrenamiento ni los usos previstos. El unico dato cuantitativo de evaluacion es un WER global de 28,8579 sobre un conjunto de validacion no descrito, con una perdida de validacion de 0,4023 tras dos epocas. Se trata, por tanto, de un checkpoint experimental mas que de un modelo listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), ajustada sobre IndicWhisper |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors es convertible a fp16, int8 y GGUF mediante herramientas externas |
| Idiomas soportados | no disponible de forma explicita; por el nombre y el modelo base, orientado a hindi e hinglish con alfabetos mixtos |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder disenado para transcripcion de audio con ventanas de 30 segundos y tokenizacion multilingue. El modelo base `parthiv11/indic_whisper_hi_multi_gpu` es una adaptacion de Whisper al hindi y a idiomas indios, y este checkpoint anade un ajuste fino adicional sobre un corpus de audio hinglish con scripts mixtos (devanagari y alfabeto latino), segun indica el propio nombre del repositorio.

El entrenamiento se realizo con el Trainer de `transformers` (version 5.0.0.dev0) sobre PyTorch 2.9.0+cu126, con estos hiperparametros: learning rate 1e-4, batch de 16 con acumulacion de gradiente 2 (batch efectivo 32), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler constante con warmup de 500 pasos, semilla 42 y 100 epocas configuradas. La tabla de resultados muestra cinco epocas registradas con 432 pasos por epoca, lo que sugiere un conjunto de entrenamiento de unos 13.800 ejemplos (32 x 432). No se especifica la composicion del dataset, el numero de tokens de audio ni si hubo tecnicas de aumento de datos o regularizacion adicionales.

## Capacidades

- Transcripcion de voz a texto (ASR) en hindi e hinglish, incluyendo alternancia de idiomas dentro de una misma frase.
- Manejo de scripts mixtos: salida en devanagari y en alfabeto latino para el componente ingles.
- Compatible con la pipeline `automatic-speech-recognition` de `transformers` y con `endpoints_compatible`, lo que permite desplegarlo en HuggingFace Inference Endpoints.
- Procesamiento de audio en ventanas de 30 segundos, con la capacidad de segmentacion larga propia de Whisper.
- No se documentan capacidades de traduccion, diarizacion, timestamps forzados ni tool calling.

## Casos de uso

- Transcripcion de reuniones y llamadas de equipos en India: el modelo esta ajustado para habla que alterna hindi e ingles, un patron habitual en entornos corporativos tecnologicos, y puede transcribir conversaciones multi-hablante segmentadas en ventanas de 30 segundos.
- Subtitulado de contenido audiovisual hinglish: series, podcasts y videos de YouTube donde los hablantes mezclan idiomas; el ajuste sobre scripts mixtos reduce la necesidad de postprocesado manual de transliteracion.
- Atencion al cliente en centros de contacto: transcripcion de llamadas de soporte en hindi-ingles para analitica de calidad y busqueda posterior, aprovechando la licencia MIT para uso comercial interno.
- Generacion de actas y resumentes a partir de audio: el ASR alimenta un pipeline posterior de LLM que resume la reunion; la salida mixta devanagari-latino debe normalizarse antes de pasarla al siguiente modelo.
- Investigacion en code-switching: corpus de referencia para estudiar el rendimiento de ASR en habla mezclada, dado que el checkpoint y su linaje son publicos y reproducibles.
- Accesibilidad: transcripcion en vivo de clases o charlas impartidas en hinglish para estudiantes con discapacidad auditiva, desplegando el modelo en un endpoint compatible con la API de `transformers`.
- Preprocesado de datasets de voz para entrenamiento de modelos TTS o de traduccion: generar transcripciones alineadas de audio hinglish antes de anotacion humana.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card, medidos sobre un conjunto de validacion no descrito:

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 | Epoca 4 | Epoca 5 |
|---|---|---|---|---|---|
| Training loss | 0,7038 | 0,5706 | 0,3975 | 0,2925 | 0,2250 |
| Validation loss | 0,3934 | 0,4023 | 0,4094 | 0,4312 | 0,4542 |
| Global WER | 31,9660 | 28,8579 | 29,8261 | 33,6704 | 32,5962 |

El mejor WER global registrado es 28,8579 en la epoca 2; a partir de ahi el modelo sobreajusta (la perdida de entrenamiento baja mientras la de validacion sube). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada: en fp16, unos 1,5 GB de pesos mas overhead de activaciones y buffers de audio; en fp32, unos 3 GB. Con cuantizacion int8 se puede reducir por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en inferencia por lotes pequenos; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son adecuadas. Para entrenamiento o fine-tuning se recomienda al menos 16-24 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 en adelante) con cuantizacion o fp16.
- Opciones de despliegue: `transformers` con pipeline de ASR, HuggingFace Inference Endpoints (tag `endpoints_compatible`), vLLM no aplica para audio, llama.cpp/whisper.cpp requieren conversion a GGUF, TGI no soporta Whisper de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IndicWhisper hinglish FT) | 764 M | ventanas de 30 s | hindi/hinglish (inferido) | MIT | HuggingFace |
| openai/whisper-large-v3 | 1.550 M | ventanas de 30 s | multilingue (99 idiomas) | Apache 2.0 | HuggingFace, ampliamente soportado |
| parthiv11/indic_whisper_hi_multi_gpu | no disponible | ventanas de 30 s | hindi/indios | no disponible | HuggingFace (modelo base) |
| ai4bharat/indicwav2vec-hindi | no disponible | no disponible | hindi | no disponible | HuggingFace |

El modelo se posiciona como un ajuste especializado frente a Whisper large-v3, que es mas grande y multilingue pero no esta afinado para hinglish. Frente a su modelo base, anade el ajuste sobre scripts mixtos. No hay datos publicados que permitan comparar WER entre estas alternativas en el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- El WER global de 28,8579 es alto para produccion; conviene validar sobre el dominio concreto antes de desplegar.
- Sobreajuste evidente a partir de la epoca 2: el checkpoint publicado corresponde a esa epoca, pero no se documenta cual se selecciono finalmente.
- La model card es autogenerada y no describe el dataset, los usos previstos ni las limitaciones; falta informacion critica para evaluar sesgos.
- No se documentan los idiomas soportados de forma oficial; el alcance real (hindi, hinglish, otros idiomas indios) es incierto.
- Riesgo de alucinacion propio de Whisper en segmentos silenciosos o con ruido, con posible generacion de texto no presente en el audio.
- La salida en scripts mixtos (devanagari y latino) puede requerir normalizacion posterior para pipelines downstream.
- Licencia MIT permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no declaradas; conviene revisar el linaje.
- No hay garantias de calidad en audio con acentos regionales distintos, ruido de fondo o multiples hablantes superpuestos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dianavdavidson/indic_whisper_hi_multi_gpu_indic_voices_68116_15_100_1e-4_None_hinglish_mixed_scripts_FT
- Modelo base: https://huggingface.co/parthiv11/indic_whisper_hi_multi_gpu
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion de la pipeline ASR de transformers: https://huggingface.co/docs/transformers/main/en/tasks/asr
