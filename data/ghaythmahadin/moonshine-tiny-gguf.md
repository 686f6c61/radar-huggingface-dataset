# GhaythMahadin/moonshine-tiny-gguf

## Resumen

Moonshine-tiny es un modelo de reconocimiento automático del habla (ASR) desarrollado por Useful Sensors, publicado originalmente en octubre de 2024. Se trata de un transformer encoder-decoder de 27 millones de parámetros especializado en transcripción de inglés, diseñado como alternativa eficiente a Whisper de OpenAI para entornos con recursos limitados. A diferencia de la mayoría de pipelines ASR, consume directamente PCM en bruto a 16 kHz mediante un stem Conv1d de tres capas, sin STFT ni mel-espectrogramas.

Esta ficha concreta corresponde a la conversión GGUF realizada por GhaythMahadin para su uso con transcribe.cpp, una implementación en C++ pensada para inferencia local sin dependencias de Python. La conversión preserva el comportamiento del modelo original con una degradación mínima: el WER en LibriSpeech test-clean pasa de 4,58 % en F32 a 4,60 % en Q8_0, una diferencia de 0,02 puntos porcentuales dentro del ruido estadístico.

Su relevancia actual radica en la posibilidad de ejecutar ASR de calidad razonable en hardware muy modesto: el fichero Q8_0 ocupa 34 MB y el modelo corre tanto en CPU como en Metal y Vulkan, con factores de tiempo real (RTF) muy por debajo de 1 en procesadores de consumo. Es una opción práctica para transcripción en dispositivos, aplicaciones de accesibilidad y pipelines embebidos donde no cabe Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de 3 capas (sin STFT ni mel) |
| Parametros totales | 27.092.736 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (procesa audio de entrada variable; sin ventana de texto declarada) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (transcribe.cpp) |
| Modelo base | UsefulSensors/moonshine-tiny (commit 390624e) |
| Tamano del repo | 0,2 GB |
| Tamano de ficheros | F32: 105 MB; F16: 57 MB; Q8_0: 34 MB |
| Muestreo de audio | PCM 16 kHz mono |
| Capacidades auxiliares | sin streaming, sin traducción, sin detección de idioma, sin timestamps |

## Arquitectura y entrenamiento

Moonshine-tiny sigue una arquitectura encoder-decoder de tipo transformer, pero sustituye el frontend clásico de Whisper (STFT más mel-espectrograma) por un stem de tres convoluciones 1D que consume directamente la forma de onda PCM a 16 kHz. Esta decisión reduce el coste computacional del preprocesado y elimina la dependencia de bibliotecas de procesamiento de señal, lo que facilita portes a C/C++ y a hardware embebido. El modelo emite únicamente texto de transcripción, sin tokens especiales para timestamps, idioma o traducción.

Los detalles completos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) se documentan en el paper arXiv:2410.15608 de Useful Sensors, pero la model card reproducida no incluye esos datos de forma explícita. La model card original sigue la plantilla de Whisper (Mitchell et al., arXiv:1810.03993) y declara que ambos modelos sirven al mismo propósito y comparten los mismos riesgos. La conversión GGUF se validó contra la referencia de transformers en el commit 07a8a84 de transcribe.cpp, con fecha 2026-05-05.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio PCM de 16 kHz mono.
- Procesamiento de audio en bruto sin necesidad de extracción de features externa (sin STFT ni mel).
- Inferencia en CPU, Metal (Apple Silicon) y Vulkan (GPU integradas y discretas) mediante transcribe.cpp.
- Ejecución con cuantización Q8_0 sin pérdida apreciable de calidad (drift de +0,02 pp en WER frente a F32).
- Sin soporte de tool calling ni function calling (no es un modelo de lenguaje general).
- Sin modo de razonamiento multi-paso ni capacidades de agente.
- Sin traducción, sin detección automática de idioma y sin generación de timestamps.
- Sin streaming: requiere el audio completo o segmentos cerrados como entrada.
- Multilingüismo: únicamente inglés; no cubre otras lenguas.

## Casos de uso

- Transcripción local en aplicaciones de escritorio: integración mediante transcribe.cpp en herramientas nativas (C/C++) que necesitan convertir notas de voz o reuniones sin enviar audio a la nube, aprovechando el binario de 34 MB en Q8_0.
- Subtitulado offline de contenido en inglés: procesado por lotes de ficheros WAV previamente convertidos con ffmpeg a 16 kHz mono, adecuado para archivos personales o material interno donde no se requiere timestamp por palabra.
- Asistentes de voz embebidos: el modelo cabe en dispositivos con poca memoria y corre en CPU con RTF de 45,5 en un Ryzen 4750U, lo que permite transcripción en tiempo real de comandos cortos en inglés.
- Accesibilidad en tiempo real: dictado por voz en aplicaciones para personas con movilidad reducida, ejecutando la inferencia en el propio dispositivo con Metal en un Mac con chip M4 (RTF 127).
- Preprocesado de pipelines NLP: etapa de ASR ligera antes de un modelo de lenguaje mayor, transcribiendo audio en inglés para alimentar sistemas de resumen, búsqueda o clasificación sin coste de API externa.
- Prototipado e investigación en ASR: base de 27M parámetros con licencia MIT y pesos GGUF para experimentar con cuantizaciones, comparar frontends Conv1d frente a mel-espectrograma o validar portes a nuevos backends.
- Transcripción en entornos air-gapped: despliegue en máquinas sin conexión (industria, defensa, sanidad) donde no se permite enviar audio a servicios externos y se requiere una licencia permisiva.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Referencia |
|---|---:|---:|---:|---|
| WER LibriSpeech test-clean (%) | 4,58 | 4,58 | 4,60 | 4,55 (Useful Sensors, model card) |
| RTF en Apple M4 Max (Metal) | — | — | 127 | — |
| RTF en Apple M4 Max (CPU) | — | — | 153,5 | — |
| RTF en Ryzen 4750U (Vulkan) | — | — | 56 | — |
| RTF en Ryzen 4750U (CPU) | — | — | 45,5 | — |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=194). El RTF se expresa como múltiplo de la velocidad en tiempo real (valores más altos indican mayor velocidad de procesado). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: el modelo completo en F32 ocupa 105 MB; en Q8_0, 34 MB. Cabe holgadamente en cualquier GPU con al menos 1 GB de memoria libre, incluyendo iGPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Con aceleración, se ha validado en Apple Silicon (Metal) y en GPU AMD integradas vía Vulkan.
- Consumer GPU: sí, en cualquier GPU de consumo de los últimos años, e incluso en CPU de portátil (validado en Ryzen 4750U).
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`); el modelo base también es compatible con Hugging Face Transformers mediante `MoonshineForConditionalGeneration`.
- Latencia y throughput: RTF de 127 en M4 Max con Metal y 45,5 en Ryzen 4750U con CPU, lo que implica procesar audio entre 45 y 127 veces más rápido que tiempo real en esos equipos.
- Preprocesado: el audio debe estar en WAV 16 kHz mono; la conversión desde otros formatos se realiza con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / entrada | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| Moonshine-tiny (esta ficha) | 27 M | en | PCM 16 kHz, sin ventana fija | 4,58 % (F32) | MIT | GGUF, safetensors |
| Whisper tiny | 39 M | multilingüe | mel-espectrograma, ventana de 30 s | no disponible en la información | MIT | safetensors, GGUF, etc. |
| Whisper base | 74 M | multilingüe | mel-espectrograma, ventana de 30 s | no disponible en la información | MIT | safetensors, GGUF, etc. |
| Moonshine-base | no disponible en la información | en | PCM 16 kHz | no disponible en la información | MIT | safetensors |

La comparación con Whisper se basa en el planteamiento de la model card original, que declara que ambos modelos sirven al mismo propósito y comparten riesgos. No se dispone de cifras de WER de Whisper tiny o base en la información proporcionada, por lo que se indica como no disponible en lugar de estimarlas. La ventaja diferencial de Moonshine-tiny es su menor tamaño (27M frente a 39M de Whisper tiny) y la eliminación del frontend mel, que simplifica el despliegue en C/C++.

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas, no traduce y no detecta el idioma de entrada.
- Sin timestamps: no genera marcas temporales por palabra ni por segmento, lo que limita su uso en subtitulado sincronizado.
- Sin streaming: requiere el audio completo o segmentos ya cerrados; no admite decodificación incremental.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en tramos de silencio o ruido; la model card original recomienda limitar la longitud máxima de generación (6,5 tokens por segundo) para evitar bucles.
- Sesgos: no se documentan análisis de sesgo específicos en la información disponible; la model card remite a los riesgos descritos para Whisper.
- Robustez limitada ante ruido y acentos: al ser un modelo tiny entrenado principalmente con datos de referencia, el rendimiento puede degradarse fuera de condiciones de laboratorio.
- Formato de entrada estricto: exige PCM 16 kHz mono; audio en otros formatos debe convertirse previamente.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero se hereda del modelo base y conviene revisar la model card upstream para términos completos.
- Mantenimiento: la conversión GGUF es un artefacto de un tercero (GhaythMahadin) con 0 descargas y 0 likes en el momento de la consulta; la referencia canónica es el repositorio handy-computer/moonshine-tiny-gguf y el modelo base de Useful Sensors.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/moonshine-tiny-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Conversión GGUF de referencia: https://huggingface.co/handy-computer/moonshine-tiny-gguf
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-tiny.md
- Paper de Moonshine: https://arxiv.org/abs/2410.15608
- Paper Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Blog de presentación: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio oficial de Moonshine: https://github.com/usefulsensors/moonshine
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny/commit/390624e
