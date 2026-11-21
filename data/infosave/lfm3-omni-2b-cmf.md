# infosave/LFM3-Omni-2B-cmf

## Resumen

LFM3-Omni-2B-cmf es una distribucion cuantizada del modelo multimodal LiquidAI/LFM3-Omni-2B, un modelo omni-modal de 2,2 mil millones de parametros desarrollado por Liquid AI sobre la arquitectura LFM3. El modelo procesa texto, imagenes, video y audio de 16 kHz como entrada, y genera texto, voz sintetizada a 24 kHz o ambos de forma intercalada como salida. Sustituye en un solo modelo a un reconocedor de voz, un modelo vision-lenguaje, un LLM y un sistema TTS.

La version aqui descrita la publica el usuario infosave y no es un checkpoint en formato tradicional, sino un paquete en formato CMF (cortiq model file) que integra el codec de voz dentro del propio fichero. Se ejecuta con `cortiq`, un motor de inferencia escrito en Rust sin Python ni frameworks de machine learning, con backends para Vulkan, DX12, CUDA, Metal y CPU. Se ofrecen dos variantes: `q8_2f` (8 bits en el modelo de lenguaje, 16 bits en codificadores y codec, 2,78 GB) y `q4tp` (4 bits en el modelo de lenguaje, 1,95 GB).

Su relevancia actual reside en la combinacion de tres factores: cobertura any-to-any (vision, ASR, TTS y texto en un unico modelo de 2,2B), un empaquetado que elimina la dependencia de ecosistemas Python y un consumo de memoria que permite ejecutarlo en GPUs de consumo con tan solo 3,5 GB de VRAM libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 de Liquid AI (transformer omni-modal con codificadores de vision y audio, decodificador de profundidad y codec de voz integrado); detalles internos de la arquitectura base no disponibles |
| Parametros totales | 2,2 mil millones (modelo base LFM3-Omni-2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `q8_2f` (8 bits en el LLM, 16 bits en vision/audio/codec) y `q4tp` (4 bits en el LLM, 16 bits en vision/audio/codec) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas); TTS en 19 locales |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | CMF (cortiq model file), con codec de voz embebido; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un modelo omni-modal de Liquid AI construido sobre la familia LFM3. Integra en un unico sistema un codificador de vision, un codificador de audio para voz a 16 kHz, el modelo de lenguaje y un decodificador de profundidad que genera los tokens acusticos del codec de voz a 24 kHz. La model card del paquete no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card del modelo base y no estan disponibles en la informacion proporcionada.

La innovacion principal de esta distribucion es el empaquetado CMF: un unico fichero que contiene el modelo de lenguaje cuantizado, los codificadores de vision y audio, los proyectores, el decodificador de profundidad y el codec, todos ellos en 16 bits y ejecutados en float32. El motor `cortiq` (Rust, sin Python) reparte la carga: el modelo de lenguaje corre en GPU y los codificadores, el decodificador de profundidad (16-27 ms por frame de voz) y el codec corren en CPU. El modelo no razona antes de responder, segun indica la propia model card.

## Capacidades

- Generacion de texto y respuesta a preguntas en 16 idiomas.
- Comprension de imagenes: descripcion de fotografias y respuesta a preguntas sobre su contenido.
- Comprension de video: procesa ficheros Y4M o directorios de frames.
- Reconocimiento automatico del habla (ASR) sobre audio de 16 kHz, con instruccion de idioma explicita.
- Sintesis de voz (TTS) a 24 kHz en 19 locales, con seleccion de voz femenina o masculina.
- Salida intercalada de texto y audio (modo `mixed`) para conversacion por voz.
- Entrada combinada de imagen y audio en una misma peticion (por ejemplo, pregunta hablada sobre una foto).
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) que acepta partes `image_url`, `video` e `input_audio` en un mismo mensaje y responde en texto.
- No se documenta soporte de tool calling ni de razonamiento multi-paso o modo thinking.

## Casos de uso

- Reconocimiento de voz en produccion: con `--system "Perform ASR in <idioma>."` y `--audio clip.wav`, el modelo transcribe audio de 16 kHz. En una RTX A5000 con CUDA alcanza 199 tok/s de decodificacion y 0,8 s hasta el primer token, adecuado para transcripcion por lotes o dictado.
- Sintesis de voz para asistentes: el modo TTS con 19 locales permite generar locuciones a 24 kHz en 2,4-2,8 s para unos 5 s de habla en una RTX A5000 con CUDA, lo que habilita respuestas habladas en interfaces conversacionales.
- Descripcion de imagenes para accesibilidad: el modelo describe una foto de 640x480 en 1,7 s en un Apple M4 (carga incluida), lo que permite generar texto alternativo o narracion de contenido visual en aplicaciones asistivas.
- Preguntas habladas sobre imagenes: combinando `--image` y `--audio`, un usuario puede preguntar en voz alta sobre una fotografia y recibir respuesta en texto y voz (11,1 s para una respuesta con 21,5 s de audio en un M4). Encaja en asistentes de campo, inspeccion o soporte tecnico manos libres.
- Analisis de video por frames: al aceptar ficheros Y4M o directorios de frames, sirve para resumir o describir secuencias en pipelines de monitorizacion o catalogacion de contenido audiovisual.
- Procesamiento de audio y vision en el borde: con 1,95 GB (`q4tp`) y un requisito de 3,5 GB de VRAM libre, se puede desplegar en estaciones de trabajo con GPU de consumo o en equipos Apple silicon mediante Metal, sin dependencias de Python.
- Backend unificado para aplicaciones any-to-any: el servidor compatible con OpenAI permite sustituir varios servicios (ASR, VLM, TTS) por un unico endpoint en texto para prototipos y herramientas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye mediciones de rendimiento de inferencia con `cortiq 0.8.50` y `0.8.97`:

| Tarea | NVIDIA A40 (Vulkan) | Apple M4 (Metal), `q4tp` | RTX A5000 (CUDA), `q4tp` | RTX A5000 (Vulkan), `q4tp` |
|---|---:|---:|---:|---:|
| Sintesis de voz, ~5-7 s de habla | 6,1 s (`q4tp`) / 6,8 s (`q8_2f`) | 3,4 s | 2,4-2,8 s | 5,3-14,6 s |
| Transcripcion de clip corto en ingles (primer token / decodificacion) | — | — | 0,8 s / 199 tok/s | 4,2 s / 61 tok/s |
| Prompt de 4096 tokens (prefill / primer token) | — | — | 13.754 tok/s / 0,30 s | 451 tok/s / 9,7 s |
| Decodificacion de texto | — | 79 tok/s | 249-253 tok/s | 233-265 tok/s |
| Descripcion de foto 640x480 (con carga) | — | 1,7 s | — | — |
| Pregunta hablada sobre foto, respuesta en texto y 21,5 s de audio | — | 11,1 s | — | — |

La model card tambien compara la fidelidad de las cuantizaciones frente al checkpoint bf16 ejecutado en float32 con Transformers: `q8_2f` produce salidas identicas en descripcion de imagenes y transcripciones, mientras que `q4tp` mantiene el contenido pero varia la redaccion y los codigos de audio tras el primer frame.

## Requisitos de hardware

- VRAM: ambos ficheros caben en cualquier GPU con 3,5 GB de memoria libre; `q4tp` ocupa 1,95 GB y `q8_2f` 2,78 GB en disco.
- GPU soportadas: NVIDIA (CUDA 12.x o Vulkan/DX12), AMD e Intel (Vulkan/DX12), Apple silicon (Metal). En Linux sin entorno grafico hay que instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- GPU de consumo: si, cualquier tarjeta con al menos 3,5 GB de VRAM libre; las mediciones publicadas usan RTX A5000 (24 GB), A40 y Apple M4.
- CPU: modo solo CPU con `CMF_GPU=0`; no se publican cifras de rendimiento en CPU.
- Despliegue: motor `cortiq` (CLI y servidor compatible con OpenAI en el puerto 8080); requiere `cortiq` 0.8.50 o superior, con binarios precompilados para Linux, macOS y Windows. CUDA se activa compilando con `--features cuda`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que el formato CMF es propio.
- Latencia y throughput: ver tabla de benchmarks; la decodificacion de texto ronda 249-253 tok/s en RTX A5000 con CUDA y 79 tok/s en Apple M4. El decodificador de profundidad tarda 16-27 ms por frame de voz.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| LFM3-Omni-2B-cmf (esta ficha) | 2,2B | texto, imagen, video, audio (ASR+TTS) | no disponible | lfm1.0 | CMF con `cortiq` |
| LiquidAI/LFM3-Omni-2B (base) | 2,2B | texto, imagen, video, audio (ASR+TTS) | no disponible | lfm1.0 | safetensors/Transformers |
| Alternativas omni-modales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento comparativo frente a otros modelos omni-modales, por lo que no es posible establecer una comparativa cuantitativa mas alla de la relacion con el checkpoint base.

## Limitaciones y advertencias

- La model card indica que el modelo no razona antes de responder, lo que puede afectar a tareas que requieran planificacion o cadenas de inferencia largas.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones especificas de fidelidad factual.
- Sesgos: no se publica informacion sobre sesgos conocidos en la informacion disponible.
- El servidor compatible con OpenAI no soporta salida de voz (`--speech-out`), la banda sonora de videos ni reconocimiento en streaming.
- La cuantizacion `q4tp` altera la redaccion de las descripciones y los codigos de audio tras el primer frame respecto al modelo en float32; para maxima fidelidad se recomienda `q8_2f`.
- El formato CMF solo se ejecuta con `cortiq`; no hay compatibilidad con ecosistemas como Transformers, vLLM o llama.cpp, lo que limita la portabilidad.
- La licencia lfm1.0 es distinta de las licencias open source estandar; es necesario revisar el fichero LICENSE del repositorio antes de un uso comercial.
- El contexto maximo no se documenta, lo que dificulta planificar cargas con prompts largos.
- La cobertura de idiomas del modelo base es de 16 idiomas, pero el rendimiento por idioma no se detalla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/LFM3-Omni-2B-cmf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorio del motor y formato CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
