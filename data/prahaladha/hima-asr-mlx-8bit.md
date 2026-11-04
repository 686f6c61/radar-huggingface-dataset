# Prahaladha/hima-asr-mlx-8bit

## Resumen

Hima-ASR MLX 8-bit es una version cuantizada a 8 bits del modelo de reconocimiento automatico del habla Hima-ASR, adaptada para ejecutarse sobre Apple Silicon mediante el framework MLX. Lo desarrolla Prahaladha y esta disenado para transcripcion de voz en 11 lenguas de la India (asames, bengali, gujarati, hindi, kannada, malayalam, marati, oriya, punyabi, tamil y telugu) ademas de ingles, con soporte explicito para cambio de codigo entre idiomas (code-switching).

El modelo resuelve el problema de la transcripcion multilingue de audio en el subcontinente indio sobre hardware de consumo Apple, sin necesidad de PyTorch ni de GPUs dedicadas. Con 143,9 millones de parametros y un peso de repositorio de 0,6 GB, la version 8-bit ocupa 511 MB en disco y alcanza 64x tiempo real en un MacBook Pro M4 Pro, segun las mediciones del autor. Esto lo situa como una opcion practica para transcripcion local en portatiles y equipos de sobremesa con chip de Apple.

La relevancia actual del modelo radica en su enfoque de despliegue: cuantizacion de pesos en 8 bits con tamano de grupo 64, front-end de audio basado unicamente en numpy y decodificacion greedy, todo empaquetado en un unico script (`hima_mlx.py`) que evita dependencias pesadas. Es la variante intermedia de una familia que incluye fp16 (954 MB) y 4-bit (342 MB), lo que permite elegir el equilibrio entre precision y velocidad segun el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio basado en Qwen3-ASR-1.7B + decoder de texto basado en Gemma 3 270M (según la model card) |
| Parametros totales | 143.936.216 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits, tamano de grupo 64 (existen variantes fp16 y 4-bit en la familia) |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en (11 lenguas de la India + ingles) |
| Licencia | apache-2.0-and-gemma (partes propias Apache 2.0; decoder bajo Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX), mas `mel_filters.npy`, tokenizer JSON y script Python |
| Libreria | mlx |
| Tamano del repositorio | 0,6 GB |
| Tamano en disco (8-bit) | 511 MB |
| Entrada de audio | 16 kHz, archivos o arrays (librosa para otras frecuencias) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de audio inicializado a partir de Qwen3-ASR-1.7B con un decoder de texto inicializado a partir de Gemma 3 270M, segun se detalla en la seccion de licencia de la model card. El resultado es un modelo de 143,9 millones de parametros totales, lo que sugiere que el encoder ha sido reducido o destilado respecto al modelo original del que se inicializa. La cuantizacion aplicada es de 8 bits con tamano de grupo 64, lo que reduce el peso a 511 MB manteniendo una tasa de error de letra del 5,83 %, ligeramente mejor que la version fp16 (5,92 %) y que el original en PyTorch (5,89 %) en la evaluacion del autor.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card no documenta el proceso de entrenamiento mas alla de la inicializacion de los componentes. La innovacion tecnica destacable es el empaquetado para MLX: front-end de audio en numpy puro, decodificacion greedy y un unico script que integra modelo, cargador y decodificador, eliminando la dependencia de PyTorch y facilitando el despliegue en Apple Silicon.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 11 lenguas de la India y en ingles.
- Deteccion automatica del idioma cuando se pasa `language=None`; seleccion explicita del idioma con el parametro `language`.
- Soporte de cambio de codigo (code-switching) entre idiomas, segun los tags del modelo.
- Transcripcion de archivos de audio de 16 kHz o de arrays; admite otras frecuencias mediante librosa.
- Ejecucion nativa en Apple Silicon mediante MLX, sin PyTorch.
- Decodificacion greedy integrada en el script `hima_mlx.py`.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion local de reuniones y llamadas en hindi o ingles: el modelo procesa audio a 64x tiempo real en un M4 Pro, por lo que una llamada de 30 minutos se transcribe en menos de medio minuto, sin enviar datos a la nube.
- Subtitulado de contenido audiovisual en lenguas indias: la ventana de idiomas cubre 11 lenguas y permite generar subtitulos para videos en tamil, telugu o bengali en un portatil Apple.
- Asistentes de voz en aplicaciones de atencion al cliente: al ejecutarse en local y ocupar 511 MB, puede integrarse en una app de escritorio que transcribe consultas de usuarios en su idioma antes de pasarlas a un LLM.
- Investigacion linguistica y creacion de corpus: la licencia Apache 2.0 en las partes propias y la ligereza del modelo permiten transcribir grandes volumenes de audio para anotacion y estudio de lenguas de la India.
- Herramientas de accesibilidad: dictado por voz en tiempo real en lenguas indias sobre equipos Mac, con latencia baja gracias al procesamiento en el dispositivo.
- Prototipado rapido de pipelines ASR: el script unico y las dependencias minimas (mlx, numpy, tokenizers, soundfile) permiten montar un servicio de transcripcion en pocas lineas para validar ideas antes de invertir en infraestructura mayor.
- Procesamiento por lotes en equipos de sobremesa Apple: la variante 4-bit (342 MB) o la 8-bit permiten transcribir horas de audio en segundo plano en un Mac Studio o MacBook sin GPU dedicada.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 36 clips reservados (255 s de audio) en 12 idiomas, medidos en un MacBook Pro M4 Pro. La metrica "letter error" se calcula contra transcripciones humanas.

| Version | Tamano | Velocidad (x tiempo real) | Error de letra |
|---|---|---|---|
| PyTorch original (Mac GPU) | 920 MB | 18x | 5,89 % |
| fp16 (MLX) | 954 MB | 52x | 5,92 % |
| **8-bit (MLX)** | **511 MB** | **64x** | **5,83 %** |
| 4-bit (MLX) | 342 MB | 62x | 5,76 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech u otros) en la informacion disponible. Los datos anteriores son mediciones propias del autor y no comparaciones con modelos externos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al ocupar 511 MB en disco, la inferencia cabe holgadamente en la memoria unificada de cualquier chip Apple Silicon; no se dispone de una cifra oficial de memoria pico.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. El autor mide en un M4 Pro.
- Cabe en GPU de consumo: si, en cualquier Mac con chip Apple Silicon. No esta pensado para GPUs NVIDIA o AMD, ya que la libreria es MLX.
- Opciones de despliegue: MLX con el script `hima_mlx.py` proporcionado; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 64x tiempo real en M4 Pro para la variante 8-bit, segun el autor; 52x para fp16 y 62x para 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|
| Hima-ASR MLX 8-bit | 143,9 M | No disponible | 11 lenguas de la India + ingles | Apache 2.0 + Gemma Terms | Apple Silicon (MLX) |
| Hima-ASR (PyTorch original) | No disponible | No disponible | 11 lenguas de la India + ingles | Apache 2.0 + Gemma Terms | PyTorch (GPU/CPU) |
| Hima-ASR MLX fp16 | 143,9 M (aprox.) | No disponible | 11 lenguas de la India + ingles | Apache 2.0 + Gemma Terms | Apple Silicon (MLX) |
| Hima-ASR MLX 4-bit | 143,9 M (aprox.) | No disponible | 11 lenguas de la India + ingles | Apache 2.0 + Gemma Terms | Apple Silicon (MLX) |

No se dispone de informacion sobre modelos comparables de otros autores (por ejemplo, Whisper o modelos ASR especificos para lenguas indias) en la documentacion proporcionada, por lo que no se incluyen comparaciones con terceros.

## Limitaciones y advertencias

- La evaluacion del autor se basa en solo 36 clips y 255 s de audio, una muestra pequena que limita la solidez estadistica de las cifras de error.
- No se documentan sesgos conocidos, pero al entrenarse sobre lenguas de la India y ingles, el rendimiento en otras lenguas o en acentos no representados puede degradarse.
- Riesgo de alucinacion en audio con ruido, musica o habla solapada; no se documentan mecanismos de mitigacion.
- La licencia es mixta: las partes propias son Apache 2.0, pero el decoder derivado de Gemma 3 270M esta sujeto a los Gemma Terms of Use, lo que impone restricciones adicionales para uso comercial que deben revisarse en el fichero `NOTICE`.
- La longitud de contexto no esta documentada, lo que dificulta planificar la transcripcion de audios muy largos sin segmentacion previa.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no hay soporte documentado para CUDA, ROCm ni CPU generica.
- La decodificacion es greedy, sin opciones documentadas de beam search ni ajuste de parametros de decodificacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prahaladha/hima-asr-mlx-8bit
- Modelo base (PyTorch): https://huggingface.co/Prahaladha/hima-asr
- Variante fp16: https://huggingface.co/Prahaladha/hima-asr-mlx
- Variante 4-bit: https://huggingface.co/Prahaladha/hima-asr-mlx-4bit
- Aviso de licencia (NOTICE): https://huggingface.co/Prahaladha/hima-asr/blob/main/NOTICE
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Framework MLX: https://github.com/ml-explore/mlx
