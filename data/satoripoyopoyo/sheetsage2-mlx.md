# satoripoyopoyo/SheetSage2-MLX

## Resumen

SheetSage2-MLX es un port nativo para Apple Silicon del modelo SheetSage2, una arquitectura de transcripcion automatica de musica que convierte audio (MP3, WAV, M4A, FLAC) en partituras. El desarrollo corre a cargo del usuario satoripoyopoyo, que ha reimplementado el modelo original del equipo m-a-p sobre Apple MLX, el framework de aprendizaje automatico de Apple optimizado para chips M1/M2/M3/M4. El modelo original procede de la publicacion arXiv 2609.33757, "SheetSage2: Advancing Music Transcription with Foundation Audio Models".

El sistema combina un encoder de audio MERT2 (24 capas Conformer con Rotary Position Embeddings) con un decoder BART de 6 capas y cross-attention, y anade decodificacion restringida por gramatica mediante una maquina de estados finitos que garantiza tokens musicales sintacticamente validos. La salida incluye MIDI multitrack, notacion ABC, partituras HTML interactivas y eventos estructurados en JSON con informacion de notas, acordes, compas y tonalidad.

Su relevancia reside en el rendimiento: segun los datos del autor, transcribe una cancion completa de 174 segundos en 26 segundos sobre un M2 Pro (6,7x tiempo real), frente a las alternativas PyTorch MPS y audio.cpp, que se quedan por debajo del tiempo real en la misma maquina. El repositorio ocupa 2,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer MERT2 de 24 capas (RoPE) + decoder BART de 6 capas con KV-cache y cross-attention; decodificacion restringida por gramatica (FSM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de transcripcion musical, no de texto) |
| Licencia | CC BY-NC 4.0 (Creative Commons Attribution-NonCommercial 4.0 International) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El pipeline parte de audio mono a 24 kHz. La etapa de frontend aplica una STFT de 2048 muestras con salto de 240 y un banco de filtros Mel de 128 bandas. A continuacion, tres bloques de subsampling basados en ConvNeXt reducen la resolucion un factor 4 hasta 25 Hz. Sobre esa secuencia actua el encoder MERT2, un Conformer de 24 capas que combina atencion multi-cabeza con Rotary Position Embeddings y un modulo convolucional. Una capa de mezcla aprende pesos softmax por capa para producir la memoria de audio, de forma 1 x T x 512. El decoder es un BART de 6 capas con KV-cache en self-attention y claves/valores de cross-attention precalculados, lo que permite velocidades de generacion de 340 a 560 tokens por segundo. Finalmente, el enmascaramiento gramatical (PromptGrammarState) restringe la decodificacion a tokens musicales validos.

Sobre los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no hay informacion en la model card. El autor indica que el port MLX hereda los pesos, la arquitectura y el entrenamiento del modelo original m-a-p/SheetSage2, por lo que las innovaciones propias de esta version son de implementacion y optimizacion, no de entrenamiento. Destacan la reescritura del encoder MERT2 (0,40 s para codificar 30 s de audio, aproximadamente 82x mas rapido que implementaciones previas) y la decodificacion restringida por gramatica.

## Capacidades

- Transcripcion de audio a partitura: detecta pitch, ritmo, compas, tonalidad, acordes y melodia a partir de ficheros MP3, WAV, M4A y FLAC.
- Generacion de MIDI multitrack: produce transcription.mid, melody.mid, melody_vocal.mid y melody_instrumental.mid.
- Salida en notacion ABC (score.abc) y partituras HTML interactivas renderizadas con abcjs, con exportacion a PDF e impresion.
- Salida de eventos estructurados en JSON (events.json, stats.json) con metadatos de notas, acordes y tonalidad alineados temporalmente.
- Decodificacion restringida por gramatica: la FSM garantiza que el 100% de los tokens musicales generados son sintacticamente validos.
- Separacion de melodia vocal e instrumental en pistas MIDI distintas.
- Control de duracion: opcion CLI para transcribir solo un fragmento (por ejemplo, los primeros 30 segundos).
- Inferencia acelerada en Apple Silicon con velocidades de 6,7x a 14,8x tiempo real segun la duracion del audio.
- No dispone de tool calling, soporte de agentes, capacidades multilingues ni modo de razonamiento, por tratarse de un modelo especializado de transcripcion musical y no de un modelo de lenguaje.

## Casos de uso

- Transcripcion de canciones completas para musicos y arreglistas: una pieza de 174 segundos se transcribe en unos 26 segundos sobre un M2 Pro, lo que permite obtener MIDI y partitura en el mismo flujo de trabajo sin esperas largas.
- Extraccion de melodia para produccion de karaoke o remixes: las pistas melody_vocal.mid y melody_instrumental.mid separan la linea vocal del acompanamiento, facilitando reutilizar la melodia en un DAW.
- Educacion musical y transcripcion de ejercicios: un profesor puede convertir una grabacion de clase o un solo de instrumento en partitura ABC o HTML imprimible para distribuirla a los alumnos.
- Analisis armonico para produccion y DJ: el fichero events.json aporta tonalidad y acordes alineados en el tiempo, util para harmonic mixing o para estudiar la estructura armonica de una pista.
- Digitalizacion de archivo musical: digitalizar grabaciones historicas o maquetas a MIDI permite reeditarlas, reorquestarlas o conservarlas en un formato simbolico editable.
- Integracion en herramientas de musica en macOS: al ejecutarse nativamente sobre MLX en Apple Silicon y exponer una API de Python y una CLI, puede embeberse en aplicaciones de escritorio o scripts de automatizacion sin GPU dedicada.
- Practica y aprendizaje de instrumentos: generar MIDI y partituras a partir de una grabacion de referencia permite al estudiante ralentizar, visualizar o tocar junto al material.
- Preprocesado de datasets musicales: la salida JSON estructurada facilita construir corpus de notas y acordes etiquetados con alineacion temporal para tareas posteriores de investigacion.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre un Apple M2 Pro (Mac mini, 32 GB de memoria unificada):

| Motor | Duracion de audio | Tiempo de inferencia | Velocidad (tiempo real) | Memoria |
|---|---|---|---|---|
| SheetSage2-MLX (este modelo) | 30,0 s | 2,03 s | 14,8x | ~2,8 GB |
| SheetSage2-MLX (este modelo) | 174,4 s (completa) | 26,0 s | 6,7x | ~3,2 GB |
| audio.cpp (Metal FP32) | 30,0 s | 60,4 s | 0,5x | ~2,5 GB |
| PyTorch (MPS) | 30,0 s | 45,2 s | 0,7x | ~4,0 GB |

Datos adicionales de rendimiento aportados por el autor: el encoder MERT2 tarda 0,40 s en codificar 30 s de audio (aproximadamente 82x mas rapido que implementaciones previas) y el decoder BART alcanza entre 340 y 560 tokens por segundo. No se han publicado resultados de benchmarks estandar de transcripcion musical (como metricas de nota o de acordes) en la informacion disponible.

## Requisitos de hardware

- Plataforma: exclusivamente macOS sobre Apple Silicon (M1/M2/M3/M4). No hay soporte para GPU NVIDIA ni para CPU x86 en la informacion disponible.
- Memoria unificada estimada: ~2,8 GB para 30 s de audio y ~3,2 GB para una cancion completa de 174 s, segun las mediciones sobre M2 Pro de 32 GB.
- No cabe en GPU de consumo NVIDIA (RTX 4090, etc.) porque el modelo esta implementado sobre MLX, que no se ejecuta en CUDA.
- Despliegue: libreria Python (pip install -e .) y CLI (sheetsage-mlx). No se documentan opciones de servido como vLLM, TGI, llama.cpp ni Ollama.
- Dependencias: Python 3.10 o superior y ffmpeg instalados en el sistema.
- Latencia y throughput: 14,8x tiempo real para clips de 30 s y 6,7x para canciones completas en M2 Pro; 340-560 tokens/s en el decoder BART.

## Comparativa con modelos similares

| Modelo | Plataforma | Audio 30 s | Velocidad | Memoria | Licencia |
|---|---|---|---|---|---|
| SheetSage2-MLX | Apple MLX (Apple Silicon) | 2,03 s | 14,8x | ~2,8 GB | CC BY-NC 4.0 |
| audio.cpp (Metal FP32) | Metal | 60,4 s | 0,5x | ~2,5 GB | no disponible |
| PyTorch (MPS) | PyTorch sobre Metal | 45,2 s | 0,7x | ~4,0 GB | no disponible |
| SheetSage2 original (m-a-p) | PyTorch | no disponible | no disponible | no disponible | CC BY-NC 4.0 |

Los unicos terminos de comparacion con datos medidos son las implementaciones audio.cpp y PyTorch (MPS) incluidas en la propia model card. Frente al modelo original m-a-p/SheetSage2 no se aportan cifras de rendimiento ni de precision, mas alla de que este port hereda sus pesos y arquitectura. No se dispone de comparacion cuantitativa con otras herramientas de transcripcion musical (por ejemplo, basic-pitch o MT3) en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial. Cualquier producto, servicio o flujo de trabajo con fines comerciales requiere autorizacion aparte.
- Plataforma cerrada: solo funciona en macOS con Apple Silicon. No hay rutas de despliegue en Linux, Windows ni GPU NVIDIA documentadas.
- Modelo de nicho y sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que la fiabilidad en produccion no esta contrastada por terceros.
- Ausencia de datos tecnicos clave: no se publican recuento de parametros, tipos de cuantizacion, formato de pesos ni requisitos minimos exactos de memoria.
- Riesgo de errores de transcripcion: aunque el enmascaramiento gramatical garantiza tokens musicales sintacticamente validos, esto no implica que la transcripcion sea musicalmente correcta; pueden aparecer notas, acordes o compases erroneos.
- Dependencia de ffmpeg: la instalacion y el funcionamiento requieren ffmpeg presente en el sistema.
- Sin capacidades de texto ni multilingues: no es un modelo de lenguaje, por lo que no admite tool calling, agentes ni razonamiento en lenguaje natural.
- Rendimiento dependiente del hardware: las cifras de velocidad y memoria proceden de un unico equipo (M2 Pro, 32 GB) y pueden variar en otros chips de la familia M.
- Hereda las limitaciones del modelo original SheetSage2, no detalladas en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satoripoyopoyo/SheetSage2-MLX
- Modelo original SheetSage2 (m-a-p): https://huggingface.co/m-a-p/SheetSage2
- Repositorio del port MLX: https://github.com/RINkir64/sheetsage-mlx
- Framework Apple MLX: https://github.com/ml-explore/mlx
- Renderizado de partituras abcjs: https://paulrosen.github.io/abcjs/
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Paper de referencia (segun la model card): arXiv 2609.33757, "SheetSage2: Advancing Music Transcription with Foundation Audio Models"
