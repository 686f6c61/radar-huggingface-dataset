# myflow-ai/moonshine-tiny-vi-gguf

## Resumen

moonshine-tiny-vi-gguf es la conversion a formato GGUF del modelo de reconocimiento automatico de voz (ASR) UsefulSensors/moonshine-tiny-vi, un fine-tune del Moonshine tiny de Moonshine AI (anteriormente Useful Sensors) especializado en vietnamita. El repositorio lo publica el usuario myflow-ai y esta pensado para ejecutarse con transcribe.cpp, la implementacion en C++ del ecosistema Moonshine, en lugar de con PyTorch/Transformers.

El modelo tiene 27.092.736 parametros (27 M) y conserva la arquitectura encoder-decoder de Moonshine tiny: consume PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, y produce unicamente transcripcion de texto. Es un modelo estrictamente monolingue (vietnamita): no traduce, no detecta idioma, no genera timestamps y no soporta streaming.

Su relevancia practica esta en el tamano: las tres cuantizaciones publicadas (F32 de 105 MB, F16 de 57 MB y Q8_0 de 34 MB) permiten ASR en vietnamita sobre CPU y GPU integradas, con un WER en FLEURS-vi de aproximadamente el 13,16 % y factores de velocidad muy superiores al tiempo real incluso en un Ryzen 4750U. Es, por tanto, una pieza util para transcripcion on-device o por lotes donde no hay acelerador dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine); stem Conv1d de 3 capas sobre PCM crudo a 16 kHz, sin STFT ni mel |
| Parametros totales | 27.092.736 (27 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la decodificacion por defecto usa max_length de 192 tokens |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | vietnamita (vi) unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base se distribuye en safetensors |
| Modelo base | UsefulSensors/moonshine-tiny-vi (relacion: quantized) |
| Biblioteca declarada | transcribe.cpp |
| Pipeline | automatic-speech-recognition |
| Entrada de audio | WAV mono a 16 kHz (requiere conversion previa con ffmpeg) |
| Salida | solo transcripcion (sin timestamps, sin deteccion de idioma, sin traduccion) |
| Streaming | no |
| Tamano de los ficheros | 105 MB (F32), 57 MB (F16), 34 MB (Q8_0) |
| Commit upstream fijado | d4d20da (pinned 2026-05-12) |
| Validacion | transcribe.cpp commit 90bf720, 2026-05-12 |

## Arquitectura y entrenamiento

Moonshine tiny es un transformer encoder-decoder de 27 M de parametros. La innovacion estructural frente a Whisper es el preprocesado de audio: en lugar de remuestrear y rellenar cada entrada a una ventana fija de 30 segundos y aplicar una STFT con banco de filtros mel de 80 canales, Moonshine procesa directamente PCM crudo a 16 kHz a traves de un stem de tres capas convolucionales Conv1d. Esto hace que el coste de computo escale con la duracion real del audio en lugar de con una ventana fija, algo especialmente relevante en modelos muy pequenos como este.

Esta variante concreta es un fine-tune de UsefulSensors sobre vietnamita, derivado del checkpoint upstream d4d20da. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO; la model card remite al paper de Moonshine (arXiv:2509.02523) para los detalles de entrenamiento y evaluacion. Tampoco se documenta el proceso de calibracion de la cuantizacion Q8_0. La conversion GGUF fue validada numericamente contra la referencia en Transformers (MoonshineForConditionalGeneration en fp32 sobre MPS) el 2026-05-12.

## Capacidades

- Transcripcion de voz a texto en vietnamita, con salida de solo texto (transcript-only).
- Procesamiento de audio PCM crudo a 16 kHz mono, sin necesidad de extraccion de caracteristicas externa.
- Inferencia en CPU y en GPU integradas mediante transcribe.cpp (rutas Vulkan y Metal documentadas).
- Ejecucion offline y on-device, apta para entornos sin conectividad o con requisitos de privacidad.
- Cuantizacion Q8_0 con degradacion practicamente nula respecto a F16 (diferencia tipica por debajo de 0,1 puntos porcentuales de WER).
- No soporta traduccion, deteccion de idioma ni generacion de timestamps.
- No soporta streaming ni decodificacion incremental.
- No dispone de tool calling, function calling ni capacidades de agente.
- No tiene capacidades de vision, audio-visual ni procesamiento de texto como entrada.

## Casos de uso

- Transcripcion on-device en aplicaciones moviles para vietnamita: el fichero Q8_0 ocupa 34 MB y puede ejecutarse en CPU, por lo que cabe en el presupuesto de memoria de una app Android o iOS sin depender de la nube.
- Notas de voz y dictado offline en escritorio: con un factor de velocidad muy por encima del tiempo real en hardware modesto (45,5x en CPU de Ryzen 4750U), la transcripcion de grabaciones de minutos es inmediata y no requiere conexion.
- Procesado por lotes de archivos de audio en servidores sin GPU: al no necesitar acelerador dedicado, se pueden lanzar varios procesos sobre CPU para transcribir archivos convertidos previamente a WAV mono de 16 kHz.
- Sistemas embebidos y dispositivos de bajo consumo: Raspberry Pi, mini-PC con graficos integrados o hardware con Vulkan disponible pueden ejecutar el modelo gracias a su huella de decenas de megabytes.
- Analitica de conversaciones en vietnamita: transcripcion de llamadas o reuniones para su posterior indexacion y busqueda de texto. Requiere un paso externo de diarizacion y alineacion temporal, ya que el modelo no produce timestamps.
- Subtitulado asistido: aunque no genera marcas temporales, la transcripcion puede segmentarse por trozos de audio de duracion conocida para reconstruir subtitulos aproximados.
- Preetiquetado de datasets de voz en vietnamita: generacion de transcripciones iniciales que despues se corrigen manualmente, con un coste de anotacion muy inferior al etiquetado desde cero.
- Componente dentro de un pipeline de asistentes de voz: al ser solo ASR, la transcripcion se encadenaria a un LLM y a un modulo TTS en vietnamita en arquitecturas por etapas.

## Benchmarks y rendimiento

WER sobre el split de test de FLEURS-vi (857 enunciados), con decodificacion greedy, num_beams=1 y max_length=192, equivalente a la generation_config upstream:

| Cuantizacion | Tamano | WER FLEURS-vi |
|---|---:|---:|
| F32 | 105 MB | 13,16 % |
| F16 | 57 MB | 13,17 % |
| Q8_0 | 34 MB | 13,16 % |
| Referencia Transformers F32 (MPS) | no disponible | 13,18 % |

Rendimiento en tiempo real reportado por el autor (factor de velocidad respecto al tiempo real; valores mas altos indican mayor rapidez, segun la convencion de transcribe.cpp):

| Plataforma | Backend | Factor |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

Las cifras en C++ (F32 y F16) coinciden con la referencia de Transformers dentro del ruido del intervalo de confianza bootstrap; Q8_0 anade una deriva adicional tipicamente inferior a 0,1 puntos porcentuales respecto a F16. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM: entre 34 MB (Q8_0) y 105 MB (F32) para los pesos, mas el overhead del runtime y del buffer de audio; cabe en cualquier dispositivo con mas de 256 MB de memoria libre.
- GPU: no requiere GPU dedicada. Se ha validado en Metal (Apple Silicon) y Vulkan (graficos integrados AMD).
- Consumer GPU: si, en practicamente cualquier GPU integrada o dedicada de los ultimos diez anos, aunque en modelos tan pequenos la CPU puede ser competitiva por el coste de despacho.
- GPU de datacenter (A100, H100): no aportan ventaja medible; estan sobredimensionadas para 27 M de parametros.
- Opciones de despliegue: transcribe.cpp (CLI y biblioteca, requiere compilacion con CMake); el modelo base es ejecutable tambien con Transformers usando MoonshineForConditionalGeneration y AutoProcessor.
- Latencia y throughput: como referencia derivada de los factores anteriores, en un M4 Max con Metal el procesamiento se situa en torno a 8 ms por segundo de audio, y en un Ryzen 4750U con Vulkan en torno a 18 ms por segundo de audio. El modelo base es apto solo para procesado por trozos completos, no para streaming.
- Preprocesado obligatorio: el audio debe convertirse a WAV mono de 16 kHz (por ejemplo, ffmpeg -i entrada.mp3 -ar 16000 -ac 1 salida.wav).

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Ventana de entrada | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| myflow-ai/moonshine-tiny-vi-gguf | 27 M | vietnamita | PCM variable, sin ventana fija de 30 s | MIT | GGUF para transcribe.cpp |
| UsefulSensors/moonshine-tiny-vi | 27 M | vietnamita | PCM variable, sin ventana fija de 30 s | MIT | safetensors, Transformers |
| OpenAI Whisper tiny | ~39 M | 99 idiomas (multilingue) | ventana fija de 30 s con padding | MIT | Transformers, whisper.cpp, GGUF |
| Whisper tiny ajustado a vietnamita (por ejemplo, variantes PhoWhisper-tiny) | ~39 M (derivado de Whisper tiny) | vietnamita | ventana fija de 30 s | no disponible en la informacion consultada | Hugging Face, Transformers |

No se dispone de cifras de WER comparables entre estas alternativas dentro de la informacion proporcionada: la model card del modelo base no publica un WER por idioma para esta variante y la unica referencia numerica disponible es la ejecucion propia sobre FLEURS-vi. Cualquier comparacion de calidad deberia replicarse sobre el mismo split.

## Limitaciones y advertencias

- Modelo estrictamente monolingue: solo vietnamita. No traduce, no detecta el idioma de entrada y fallara o producira salidas degeneradas con audio en otros idiomas.
- Sin timestamps: no sirve por si solo para subtitulado sincronizado, diarizacion ni busqueda por marcas temporales.
- Sin streaming: requiere el audio completo (o trozos completos) antes de decodificar; no hay decodificacion incremental.
- Riesgo de bucles de alucinacion: la propia model card upstream recomienda limitar la longitud maxima generada en funcion de la duracion esperada del audio (heuristica de 13 tokens por segundo) precisamente para evitar repeticiones.
- WER elevado para uso profesional: en torno al 13 % en FLEURS-vi, con el consecuente impacto en transcripciones legales, medicas o financieras sin revision humana.
- Sensibilidad a la calidad del audio: acentos regionales, ruido de fondo, habla solapada o audio telefónico degradado no estan cubiertos por la evaluacion publicada.
- Sesgos: no se publica ninguna evaluacion de sesgo demografico, de genero o de variedad dialectal del vietnamita en la informacion disponible.
- Preprocesado obligatorio: entrada en WAV mono a 16 kHz; cualquier otra frecuencia o numero de canales requiere conversion previa.
- Dependencia del runtime: el formato GGUF esta pensado para transcribe.cpp, no para llama.cpp ni Ollama; fuera de ese runtime hay que usar el modelo base en Transformers.
- Discrepancia de repositorio: los enlaces de descarga de la model card apuntan al repositorio handy-computer/moonshine-tiny-vi-gguf, no al repositorio myflow-ai indicado en la ficha; conviene verificar el mirror y la integridad de los ficheros antes de usarlos en produccion.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, manteniendo el aviso de copyright. La model card remite a los terminos del modelo base por ser la fuente autoritativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myflow-ai/moonshine-tiny-vi-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-vi
- Commit upstream fijado: https://huggingface.co/UsefulSensors/moonshine-tiny-vi/commit/d4d20da
- Paper de Moonshine: https://arxiv.org/abs/2509.02523
- Paper de Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Repositorio de Moonshine (Moonshine AI / Useful Sensors): https://github.com/usefulsensors/moonshine
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Pagina del modelo en la documentacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Commit validado de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Dataset de ejemplos multilingues: https://huggingface.co/datasets/UsefulSensors/multilingual_examples
- Descarga F32 (105 MB): https://huggingface.co/handy-computer/moonshine-tiny-vi-gguf/resolve/main/moonshine-tiny-vi-F32.gguf
- Descarga F16 (57 MB): https://huggingface.co/handy-computer/moonshine-tiny-vi-gguf/resolve/main/moonshine-tiny-vi-F16.gguf
- Descarga Q8_0 (34 MB): https://huggingface.co/handy-computer/moonshine-tiny-vi-gguf/resolve/main/moonshine-tiny-vi-Q8_0.gguf
