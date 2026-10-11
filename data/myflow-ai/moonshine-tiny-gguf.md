# myflow-ai/moonshine-tiny-gguf

## Resumen

moonshine-tiny-gguf es una conversion a formato GGUF del modelo de reconocimiento automatico del habla (ASR) UsefulSensors/moonshine-tiny, publicada por el usuario myflow-ai para su uso con la libreria transcribe.cpp. Se trata de un transformer encoder-decoder de 27.092.736 parametros (aproximadamente 27 M) especializado en transcripcion de voz en ingles, desarrollado originalmente por Useful Sensors y convertido a GGUF en distintas precisiones (F32, F16 y Q8_0).

El modelo resuelve el problema de la transcripcion de audio en ingles en entornos con recursos muy limitados: consume PCM crudo a 16 kHz directamente mediante un stem de tres capas Conv1d, sin STFT ni mel-espectrograma, y produce unicamente el texto transcrito. Su tamano reducido (entre 34 MB en Q8_0 y 105 MB en F32) permite ejecutarlo en CPU, GPU integrada o aceleracion Metal/Vulkan sin necesidad de hardware dedicado.

Es relevante ahora porque la cuantizacion Q8_0 mantiene un WER de 4.60 % en LibriSpeech test-clean frente al 4.58 % de la version F32, es decir, una deriva de solo +0.02 puntos porcentuales, con un peso que cabe en cualquier dispositivo embebido. El modelo base esta publicado bajo licencia MIT y la conversion hereda esa misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de tres capas (entrada PCM crudo a 16 kHz, sin STFT ni mel) |
| Parametros totales | 27.092.736 (segun safetensors del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la decodificacion se limita a max_length=194 tokens segun generation_config |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Ingles unicamente (en) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (tambien safetensors en el modelo base original) |
| Libreria de inferencia | transcribe.cpp |
| Tarea (pipeline) | automatic-speech-recognition |
| Frecuencia de muestreo de entrada | 16 kHz mono PCM |
| Tamano de los pesos | 105 MB (F32), 57 MB (F16), 34 MB (Q8_0) |
| Streaming | No |
| Traduccion | No |
| Deteccion de idioma | No |
| Marcas de tiempo | No (timestamps: none) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder orientado a ASR. La particularidad arquitectonica mas destacable es el frontend de audio: en lugar de la cadena clasica de ventana STFT y banco de filtros mel que usan modelos como Whisper, Moonshine procesa la forma de onda PCM cruda a 16 kHz mediante un stem de tres capas convolucionales Conv1d. Esto reduce el coste de preprocesado y permite al modelo operar directamente sobre la senal temporal. Con 27 M de parametros, esta en la categoria mas ligera de modelos de voz publicados por Useful Sensors.

Los detalles concretos sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO, y el numero exacto de tokens de audio vistos durante el entrenamiento no estan disponibles en la informacion proporcionada. La model card original remite al paper "Moonshine: Speech Recognition for Live Transcription and Voice Commands" (arXiv:2410.15608) para los detalles de entrenamiento y evaluacion.

La conversion a GGUF se realizo a partir del commit upstream 390624e del modelo base, fijado el 2026-05-05, y se valido contra la implementacion de referencia en transformers usando el commit 07a8a84 de transcribe.cpp, tambien con fecha 2026-05-05.

## Capacidades

- Transcripcion de voz a texto en ingles a partir de audio PCM mono a 16 kHz.
- Acepta audio en crudo mediante convoluciones Conv1d, sin necesidad de calcular mel-espectrogramas.
- Salida limitada a texto transcrito: no genera traducciones, no detecta el idioma de entrada y no produce marcas de tiempo.
- No soporta streaming: la transcripcion se realiza sobre el audio completo en modo por lotes.
- No es un modelo de lenguaje: no dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de capacidades multimodales mas alla del audio (sin vision, sin generacion de texto libre).
- La decodificacion por defecto es greedy con num_beams=1 y max_length=194, con el fin de evitar bucles de alucinacion limitando la longitud maxima de generacion.
- La model card original recomienda aplicar un limite de tokens por segundo (6.5 tokens por segundo de audio) para acotar la longitud generada y reducir alucinaciones.

## Casos de uso

- Dictado local en dispositivos sin conectividad: al pesar entre 34 MB y 105 MB, el modelo puede ejecutarse en un portatil o un dispositivo empotrado para transcribir notas de voz en ingles sin enviar audio a la nube.
- Comandos de voz en dispositivos embebidos: el pipeline oficial de Moonshine esta orientado a transcripcion en vivo y comandos de voz; con Q8_0 y ejecucion por CPU es viable integrarlo en un asistente de domotica o un wearable.
- Transcripcion por lotes de archivos en ingles: conversion previa con ffmpeg a WAV mono 16 kHz y procesado con transcribe-cli para transcribir grabaciones de reuniones, entrevistas o podcasts.
- Preprocesado en pipelines de datos de audio: generar transcripciones para indexacion, busqueda semantica o entrenamiento de modelos de texto a partir de corpus de audio en ingles.
- Subtitulado interno y accesibilidad: aunque el modelo no genera marcas de tiempo, puede producir el texto por segmentos si se divide el audio previamente y se transcriben fragmentos de forma independiente.
- Prototipado y evaluacion de ASR en investigacion: su tamano permite hacer experimentos de fine-tuning o comparativas de cuantizacion en una sola GPU consumer o incluso en CPU.
- Integracion en aplicaciones de escritorio o moviles con aceleracion Metal o Vulkan: los datos publicados incluyen mediciones en Apple M4 Max (Metal y CPU) y AMD Ryzen 4750U (Vulkan y CPU), lo que indica viabilidad de despliegue en hardware de consumo.

## Benchmarks y rendimiento

Resultados de WER sobre el split completo LibriSpeech test-clean (2620 enunciados), con la decodificacion por defecto de transcribe.cpp (greedy, num_beams=1, max_length=194):

| Version | WER LibriSpeech test-clean |
|---|---|
| F32 | 4,58 % |
| F16 | 4,58 % |
| Q8_0 | 4,60 % |
| Valor autoinformado por Useful Sensors (misma particion) | 4,55 % |

La deriva de Q8_0 respecto a F32 es de +0,02 puntos porcentuales, dentro del ruido del intervalo de confianza bootstrap segun el autor de la conversion.

Rendimiento reportado (valores tal como se publican en la model card; la ficha no especifica la unidad de medida):

| Entorno | Aceleracion | Valor |
|---|---|---|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: minima. Los pesos ocupan 34 MB (Q8_0), 57 MB (F16) y 105 MB (F32); con los buffers de activacion la huella en memoria es del orden de decenas o pocos cientos de megabytes.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer reciente es mas que suficiente; el modelo esta pensado para CPU, iGPU y aceleradores de bajo consumo.
- Cabe en GPU consumer: si, y tambien en dispositivos mucho mas limitados. Los datos de rendimiento se han medido en un Apple M4 Max y en un AMD Ryzen 4750U, ambos hardware de consumo.
- Opciones de despliegue: transcribe.cpp (compilado desde fuente, con binario transcribe-cli); el modelo base tambien es compatible con la implementacion de transformers de Hugging Face (MoonshineForConditionalGeneration). No se indica compatibilidad con vLLM, TGI, Ollama o llama.cpp en la informacion disponible.
- Aceleracion soportada en las mediciones publicadas: Metal (Apple) y Vulkan (AMD), ademas de ejecucion en CPU.
- Latencia y throughput: los valores reportados son 127 (Metal) y 153,5 (CPU) en Apple M4 Max, y 56 (Vulkan) y 45,5 (CPU) en AMD Ryzen 4750U. Las unidades no se especifican en la model card; los valores sugieren un factor de velocidad respecto al tiempo real, pero esta interpretacion no esta confirmada en la documentacion proporcionada.
- Preprocesado necesario: el audio debe convertirse a WAV mono a 16 kHz, por ejemplo con ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| myflow-ai/moonshine-tiny-gguf | 27.092.736 | No disponible (max_length=194 en decodificacion) | 4,58 % (F32/F16), 4,60 % (Q8_0) | MIT | GGUF para transcribe.cpp |
| UsefulSensors/moonshine-tiny (modelo base) | 27.092.736 | No disponible | 4,55 % (autoinformado) | MIT | safetensors en Hugging Face, compatible con transformers |
| Alternativas de la misma categoria (por ejemplo, modelos tipo Whisper tiny/base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La model card upstream indica que Moonshine sirve al mismo proposito y asume los mismos riesgos que Whisper, pero no se proporcionan en la informacion disponible los datos concretos de parametros, contexto o WER de modelos alternativos que permitan una comparacion numerica directa.

## Limitaciones y advertencias

- Idioma: solo ingles. No realiza traduccion ni deteccion de idioma, por lo que el audio en otros idiomas producira salidas incorrectas o alucinadas.
- Sin marcas de tiempo: la salida es texto plano, lo que impide alinear la transcripcion con el audio en aplicaciones de subtitulado que requieran timing.
- Sin streaming: el modelo no procesa audio incremental; para transcripcion "en vivo" habria que dividir el audio en fragmentos y asumir la perdida de contexto entre ellos.
- Riesgo de alucinacion: la model card original advierte explicitamente del riesgo de bucles de alucinacion y recomienda limitar la longitud de generacion segun la duracion del audio (6.5 tokens por segundo como maximo).
- Sesgos: no se proporciona informacion sobre sesgos demograficos, acentos o variedades dialectales del ingles en la documentacion disponible.
- Discrepancia de rutas: el repositorio consultado es myflow-ai/moonshine-tiny-gguf, mientras que los enlaces de descarga de la model card apuntan a handy-computer/moonshine-tiny-gguf. Conviene verificar el repositorio de origen antes de integrar los pesos en produccion.
- Repositorio sin traccion constatada: en el momento de la consulta el repositorio registra 0 descargas y 0 likes, y un tamano de repositorio de 0,0 GB, lo que sugiere que los artefactos no estan alojados en ese repositorio.
- Entorno de inferencia especifico: la conversion esta pensada para transcribe.cpp, una libreria con menos adopcion que otras alternativas; no se documenta soporte para otros runners.
- Licencia: MIT, permisiva y apta para uso comercial, siempre que se conserve el aviso de copyright y la atribucion correspondiente.
- No apto para tareas de lenguaje: al no ser un modelo generativo de texto, no debe usarse para razonamiento, generacion de codigo ni agentes.

## Enlaces

- Repositorio Hugging Face de la conversion: https://huggingface.co/myflow-ai/moonshine-tiny-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Commit del modelo base usado en la conversion: https://huggingface.co/UsefulSensors/moonshine-tiny/commit/390624e
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado para la validacion: https://github.com/handy-computer/transcribe.cpp/tree/07a8a84
- Pagina de documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-tiny.md
- Descarga de los pesos GGUF (segun la model card): https://huggingface.co/handy-computer/moonshine-tiny-gguf
- Paper de Moonshine: https://arxiv.org/abs/2410.15608
- Model Cards for Model Reporting (Mitchell et al.): https://arxiv.org/abs/1810.03993
- Blog de presentacion de Moonshine: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio de instalacion de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Podcast asociado al modelo: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
