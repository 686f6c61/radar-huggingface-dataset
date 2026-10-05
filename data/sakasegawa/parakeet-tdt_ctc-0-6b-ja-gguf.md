# sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF

## Resumen

Este repositorio contiene una conversion a GGUF del modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-tdt_ctc-0.6b-ja`, desarrollado originalmente por NVIDIA para transcripcion de japones. La conversion la ha realizado el usuario sakasegawa y va dirigida especificamente a `speech.cpp`, una implementacion en C++ sobre ggml que ejecuta modelos de audio en Metal, Vulkan y CPU. El modelo base contiene 619.285.606 parametros (aproximadamente 0,6 mil millones), por lo que se situa en la gama ligera y puede ejecutarse en hardware de consumo.

El modelo emplea una arquitectura FastConformer como codificador acustico junto con un decodificador TDT (Token-and-Duration Transducer), una variante de los modelos RNN-T que predice simultaneamente el token y su duracion. El fichero GGUF conserva el decodificador TDT que usa `transcribe()` de NeMo, pero no incluye la cabeza CTC del checkpoint original. Es relevante porque permite ejecutar ASR japones de calidad en local, sin dependencias de Python ni de CUDA, con un unico fichero de 1,24 GB.

El punto critico para el usuario es que este GGUF no es compatible con llama.cpp, LM Studio, Ollama ni otros programas que leen GGUF: su disposicion interna es especifica de `speech.cpp` (version 0.6.0 o superior). Se distribuye bajo licencia CC-BY-4.0, la misma del checkpoint original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 619.285.606 (aproximadamente 0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa una utterance completa; el concepto de ventana de tokens no aplica) |
| Tipos de cuantizacion | F16 en matrices de capas lineales, LSTM y embedding de tokens; F32 en convoluciones, normas, sesgos y frontend |
| Idiomas soportados | japones (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (disposicion especifica de speech.cpp, no compatible con llama.cpp/Ollama/LM Studio) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador FastConformer, una variante eficiente del Conformer que reduce el coste computacional mediante downsampling y atencion, con un decodificador TDT. El decodificador TDT predice en cada paso tanto el siguiente token como su duracion, lo que acelera la decodificacion frente a los transductores clasicos. El checkpoint original de NVIDIA incluye una cabeza CTC, pero este GGUF solo incorpora el decodificador TDT empleado por `transcribe()` de NeMo.

La conversion se ha realizado con `reference/fastconformer/convert.py` de `speech.cpp`, partiendo del checkpoint oficial fijado en el commit `44edb27eea9317daf89333e75eb830db4b1cc298`. No hay reentrenamiento: el proceso solo cambia el formato de los pesos y reduce su precision a la mitad. Las matrices de las capas lineales, la LSTM y el embedding de tokens se almacenan en F16, mientras que los kernels de convolucion, las normas, los sesgos y el frontend permanecen en F32. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en japones.
- Procesamiento de una utterance completa por fichero de audio de entrada.
- Decodificacion greedy del transductor TDT con eleccion de etiqueta y duracion en cada paso.
- Ejecucion en Metal (Apple), Vulkan (NVIDIA) y CPU mediante `speech.cpp`.
- Interfaz de linea de comandos (`speech-asr`), worker en JSON Lines (`speech-worker`) y servidor HTTP compatible con la API de audio de OpenAI (`POST /v1/audio/transcriptions` mediante `speech-server`).
- No incluye tool calling, agentes, capacidades multimodales de vision ni modo de razonamiento (es un modelo puramente ASR).

## Casos de uso

- Transcripcion local de audio en japones: `speech-asr` convierte un fichero WAV de 16 kHz en texto por stdout, una linea por fichero, sin dependencias de Python ni de CUDA, lo que simplifica su integracion en scripts y pipelines.
- Servicio de subtitulado con API compatible con OpenAI: `speech-server` expone `POST /v1/audio/transcriptions`, de modo que aplicaciones ya integradas con la API de audio de OpenAI pueden apuntar a un endpoint local cambiando la URL base.
- Procesamiento por lotes de grandes volumenes de audio: `speech-worker` implementa un modelo de worker en JSON Lines, adecuado para colas de transcripcion en segundo plano.
- Despliegue en equipos sin GPU dedicada: al ejecutarse en CPU y en Vulkan sobre GPU modestas (por ejemplo, una RTX 2080), encaja en estaciones de trabajo sin aceleradores de ultima generacion.
- Aplicaciones de escritorio en macOS: los binarios precompilados para macOS arm64 usan Metal, lo que permite transcripcion en el propio portatil.
- Investigacion y evaluacion de ASR japones: su compatibilidad verificada con NeMo 3.0.0 permite usarlo como referencia reproducible para comparar precisiones de decodificacion.
- Preprocesado de datos de audio en japones: transcripcion previa para construir corpus de texto a partir de grabaciones, con la ventaja de no requerir infraestructura en la nube.
- Integracion en sistemas embebidos o entornos C/C++: al exponer una C API a traves de `speech.cpp`, puede enlazarse directamente en aplicaciones nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (tipo MMLU, HumanEval o WER agregado sobre un conjunto completo) en la informacion disponible. Si se documenta una verificacion de precision etapa por etapa frente a NeMo 3.0.0 sobre tres utterances de FLEURS `ja_jp`:

| Comprobacion | Metal (F16) | CPU (F32) |
|---|---|---|
| Coincidencia de la red de prediccion (SNR) | 66 a 70 dB | 130 dB |
| Coincidencia del joint (SNR) | 85 a 87 dB | 140 dB |
| Etiqueta y duracion elegidas por paso | identicas a NeMo | identicas a NeMo |
| Texto de las tres utterances | identico a NeMo | identico a NeMo |

Tambien se aportan medidas de velocidad (tiempo de audio a texto tras cargar el modelo):

| Audio | Apple M5 (Metal) | RTX 2080 (Vulkan) |
|---|---|---|
| 6,4 s | 0,07 s | 0,07 s |
| 10,5 s | 0,11 s | 0,09 s |
| 25,5 s | 0,28 s | 0,18 a 0,22 s |

No se dispone de datos de WER comparativos frente a otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 1,24 GB, por lo que el consumo de memoria se situa en el entorno de 1,5 a 2 GB, tanto en GPU como en RAM si se ejecuta en CPU.
- GPU recomendadas: no disponible (el autor solo verifica una RTX 2080 por Vulkan y Apple M5 por Metal).
- Cabe en GPU de consumo: si, dado el tamano del fichero; se ha probado explicitamente sobre una RTX 2080 y sobre Apple M5.
- Opciones de despliegue: unicamente `speech.cpp` (v0.6.0 o superior). No funciona en llama.cpp, LM Studio, Ollama ni otras herramientas compatibles con GGUF.
- Latencia y throughput: segun las mediciones del autor, entre 0,07 s (audio de 6,4 s) y 0,28 s (audio de 25,5 s) en Apple M5 con Metal; entre 0,07 s y 0,22 s en RTX 2080 con Vulkan. Para audio de 25,5 s esto equivale a un factor de tiempo real de aproximadamente 90x en M5 y de 115x a 140x en RTX 2080.
- Binarios precompilados disponibles para macOS arm64 (Metal), Windows x64 (Vulkan) y Linux x64 (Vulkan o CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF | 0,6B | japones | GGUF especifico de speech.cpp | CC-BY-4.0 | HuggingFace |
| nvidia/parakeet-tdt_ctc-0.6b-ja (base) | 0,6B | japones | NeMo / PyTorch | CC-BY-4.0 | HuggingFace |
| Whisper large-v3 | no disponible en la informacion | multilingue | PyTorch, GGUF, ONNX | MIT (segun el proyecto Whisper) | HuggingFace |
| kotoba-whisper | no disponible en la informacion | japones | PyTorch, ONNX | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparativos (WER) entre estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, idioma, formato y licencia.

## Limitaciones y advertencias

- Compatibilidad restringida: el fichero solo se ejecuta en `speech.cpp` v0.6.0 o superior. No funciona con llama.cpp, LM Studio, Ollama ni otras herramientas basadas en GGUF.
- Idioma unico: solo reconoce japones.
- Entrada de audio estricta: requiere ficheros WAVE de 16 kHz; si la frecuencia es distinta, el fichero se rechaza en lugar de remuestrearse, por lo que hay que convertir con antelacion (`ffmpeg -i in.mp3 -ar 16000 -ac 1 out.wav`).
- Una utterance por fichero: el modelo reconoce la utterance de una vez, por lo que ficheros con multiples utterances o audio largo continuo no se segmentan automaticamente.
- Sin cabeza CTC: solo incluye el decodificador TDT; no se puede usar el modo CTC del checkpoint original.
- Riesgo de alucinacion y errores de transcripcion: no se documentan tasas de error (WER) sobre conjuntos completos, solo una verificacion de coincidencia con NeMo sobre tres utterances de FLEURS.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion. Los pesos son de NVIDIA; el repositorio solo cambia el formato y la precision, no reentrena el modelo.
- Sesgos: no se documenta informacion sobre sesgos en la informacion proporcionada.
- Precision reducida: los pesos lineales y de embedding estan en F16, lo que puede introducir pequenas desviaciones frente al checkpoint original en F32 (aunque las pruebas reportadas muestran coincidencia de texto).

## Enlaces

- Repositorio GGUF: https://huggingface.co/sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Repositorio de speech.cpp: https://github.com/nyosegawa/speech.cpp
- Binarios precompilados de speech.cpp: https://github.com/nyosegawa/speech.cpp/releases
- Tabla de modelos soportados por speech.cpp: https://github.com/nyosegawa/speech.cpp#readme
- Dataset FLEURS (referencia de evaluacion): no disponible en la informacion proporcionada
