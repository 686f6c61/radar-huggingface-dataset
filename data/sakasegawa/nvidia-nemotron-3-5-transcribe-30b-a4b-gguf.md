# sakasegawa/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF

## Resumen

Esta ficha describe la cuantización GGUF de **NVIDIA Nemotron 3.5 Transcribe 30B A4B**, un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA, publicada por el usuario *sakasegawa* en Hugging Face. El modelo original transcribe audio literalmente (incluyendo muletillas y repeticiones) en 40 idiomas, con puntuación, mayúsculas, marcas de tiempo por palabra e identificación de hablantes, y admite hasta una hora de audio de una sola vez. La versión GGUF permite ejecutarlo localmente mediante la herramienta **speech.cpp**, con un consumo de memoria reducido gracias a la cuantización.

La relevancia de este modelo radica en su arquitectura híbrida: combina un frontend log-mel y un encoder Transformer ASR con una rama de hablantes, fusionando ambas señales para alimentar un modelo de lenguaje tipo mixture-of-experts (MoE) que mezcla capas Mamba-2, atención y expertos. Con 33.700 millones de parámetros totales y solo 4.000 millones activos, ofrece calidad de transcripción de nivel industrial con un coste de inferencia contenido. Es especialmente interesante para despliegues locales de transcripción de reuniones, dictado y subtitulado, sin depender de servicios en la nube.

Cabe destacar una limitación importante: los ficheros GGUF de este repositorio usan un layout propio de speech.cpp, por lo que **no funcionan** con llama.cpp, LM Studio, Ollama u otros lectores de GGUF. Se requiere speech.cpp 0.9.1 o superior (0.9.2 o superior para hablantes y marcas de tiempo por palabra).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: frontend log-mel + encoder Transformer ASR + rama de hablantes + LM MoE con capas Mamba-2, atención y MoE (NemotronH) |
| Parametros totales | 33.697.122.591 (aprox. 33,7 B) |
| Parametros activos | 4 B (aprox., según denominación A4B) |
| Longitud de contexto | Hasta 1 hora de audio de una sola vez (no disponible el valor exacto en tokens) |
| Tipos de cuantizacion | F16, Q8_0, IQ4_NL (4,5 bits por peso) |
| Idiomas soportados | 40: árabe, búlgaro, bengalí, checo, danés, alemán, griego, inglés, español, estonio, finés, francés, hebreo, hindi, croata, húngaro, indonesio, italiano, japonés, coreano, lituano, letón, maratí, maltés, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco, tamil, telugu, tailandés, tagalo, turco, ucraniano, vietnamita y chino |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (exclusivo de speech.cpp 0.9.1+); el original está en safetensors |

## Arquitectura y entrenamiento

El modelo completo (NVIDIA Nemotron 3.5 Transcribe 30B A4B) sigue la arquitectura NemotronH: un modelo de lenguaje híbrido que combina capas Mamba-2 (modelos de espacio de estados), capas de atención y capas MoE, con aproximadamente 4.000 millones de parámetros activos por token frente a los 33.700 millones totales. Para la tarea de ASR, se le antepone un frontend log-mel que extrae características del audio, un encoder Transformer especializado en reconocimiento del habla y una rama de identificación de hablantes; las salidas de ambos se fusionan antes de entrar en el modelo de lenguaje. Incluye además una cabeza CTC para generar marcas de tiempo por palabra (y por carácter en japonés y chino) mediante alineación estilo NeMo, y capas de multi-token prediction (presentes en los ficheros GGUF aunque speech.cpp no las carga).

Sobre los datos de entrenamiento, el número de tokens y la composición del dataset no están disponibles en la información proporcionada. Tampoco se detalla si se usó RLHF/DPO; al tratarse de un modelo de transcripción, el entrenamiento se centra en la fidelidad literal al habla (transcripción verbatim con muletillas y repeticiones incluidas). Una innovación destacable es la posibilidad de indicar al modelo los nombres y términos específicos que contiene el audio (custom vocabulary) mediante un prompt contextual, lo que mejora el reconocimiento de entidades y jerga de dominio.

## Capacidades

- Transcripción de voz a texto en 40 idiomas, de forma literal (word for word), incluyendo muletillas, repeticiones y pausas del hablante.
- Puntuación y capitalización automáticas en la transcripción.
- Marcas de tiempo por palabra (y por carácter en japonés y chino) mediante la cabeza CTC del checkpoint.
- Identificación y etiquetado de hablantes (diarización), con salida en formato FILE, START, END, SPEAKER, TEXT.
- Vocabulario personalizado: se le pueden indicar los nombres y términos que contiene el audio mediante el flag `--prompt`.
- Gestión de audios largos: hasta una hora de audio en una sola pasada.
- Diarización externa compatible con silero-vad y el modelo nemotron-3-diarization.
- Servidor con API de transcripción compatible con el formato de OpenAI (`speech serve`).
- No soportadas en esta portación: traducción del audio ni preguntas sobre el contenido del audio (tareas que sí ofrece el modelo original según su model card).

## Casos de uso

- **Transcripción de reuniones y videoconferencias**: gracias a la diarización integrada y a la capacidad de procesar hasta una hora de audio de una vez, puede generar actas con intervenciones atribuidas a cada hablante, ejecutándose íntegramente en local para proteger la confidencialidad.
- **Subtitulado y closed captioning**: las marcas de tiempo por palabra mediante CTC permiten sincronizar subtítulos con precisión de palabra, útil para plataformas de vídeo y producción audiovisual.
- **Dictado y accesibilidad**: la transcripción literal con puntuación automática es adecuada para herramientas de dictado o transcripción en tiempo real para personas sordas o con dificultades auditivas.
- **Procesamiento de jerga de dominio**: mediante el prompt contextual (`--prompt "Nemotron, FLEURS"`), se puede indicar terminología médica, legal o técnica para mejorar el reconocimiento de nombres propios y términos especializados.
- **API de transcripción autoalojada**: el modo `speech serve` expone una API compatible con OpenAI, lo que permite integrar el modelo en aplicaciones existentes que ya usan Whisper u otros servicios de transcripción, sin cambiar el cliente.
- **Análisis de centros de llamadas**: la combinación de transcripción multilingüe (40 idiomas) y etiquetado de hablantes facilita el análisis de calidad y cumplimiento normativo en llamadas de soporte.
- **Investigación en ASR local**: al ser ejecutable en hardware de consumo (por ejemplo, un Apple M5 con 32 GB con la versión IQ4_NL), resulta útil para experimentación y evaluación de modelos de habla sin coste de GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, etc.) en la información disponible. El autor del repositorio sí documenta verificaciones de fidelidad numérica de la portación frente a NeMo (commit `040574f`), los módulos oficiales y Transformers' NemotronH, sobre siete peticiones construidas con clips de FLEURS:

| Check | F32 en CPU | F32 en GPU Apple M5 (Metal) |
|---|---|---|
| Filas de audio que toma el LM | 79,2 dB SNR | 52,3 dB SNR |
| 52 capas del LM (desde su propia entrada) | 115,4 dB sobre el prompt, 97,4 dB decodificando | 67,8 dB sobre el prompt, 74,0 dB decodificando |
| Reconocimiento (5 peticiones, instrucciones verbatim y contextuales, vía C API) | tokens y texto oficiales en todas | tokens y texto oficiales en todas |
| Tiempos de 2.573 palabras (CTC vs. alineación NeMo) | tiempos de NeMo para cada palabra | tiempos de NeMo salvo 10 palabras |

Nota: cuando dos expertos de una capa puntúan dentro del redondeo de float32, la portación puede elegir el otro (igual que el código oficial en otra máquina); estas filas se excluyen y contabilizan: 45 de 76.521 en CPU y 1.550 en Metal. La documentación del texto se interrumpe en este punto, por lo que no hay más datos disponibles.

## Requisitos de hardware

- **VRAM / memoria estimada según cuantización** (el modelo necesita el fichero completo en memoria):
  - F16: 67,42 GB
  - Q8_0: 35,84 GB
  - IQ4_NL: 19,00 GB
- **GPU recomendadas**: una GPU que contenga el fichero completo computa todo el modelo en GPU; el autor cita como ejemplo validado un Apple M5 con 32 GB de memoria unificada ejecutando la versión IQ4_NL. Para las versiones F16 y Q8_0 se requerirían GPUs de datacenter con memoria amplia (A100/H100 de 80 GB) o estaciones con más de 64 GB de memoria unificada.
- **Consumer GPUs**: la versión IQ4_NL (19 GB) cabe en GPUs de gama alta de consumo con 24 GB de VRAM (como una RTX 3090 o RTX 4090), aunque esta posibilidad no está confirmada explícitamente en la documentación disponible. Las versiones F16 y Q8_0 no caben en GPUs de consumo habituales.
- **Offload a CPU**: si la GPU no tiene memoria suficiente, speech.cpp mantiene en GPU los expertos de tantas capas como quepan y computa el resto en CPU, con ejecución más lenta.
- **Despliegue**: exclusivamente mediante speech.cpp 0.9.1 o superior (0.9.2+ para hablantes y marcas de tiempo). No compatible con llama.cpp, LM Studio, Ollama ni otros lectores de GGUF. Incluye modo servidor con API compatible con OpenAI.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Cuantizacion GGUF | Idiomas | Licencia | Compatibilidad |
|---|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B A4B (GGUF, esta ficha) | 33,7 B (4 B activos) | hasta 1 hora | F16, Q8_0, IQ4_NL | 40 | OpenMDW 1.1 | Solo speech.cpp |
| Whisper large-v3 (OpenAI) | 1,55 B | 30 s por ventana (con troceado) | GGUF (varias) | ~99 | MIT | llama.cpp, whisper.cpp, multitud de herramientas |
| Canary 1B (NVIDIA) | 1 B | no disponible | no disponible | ~25 (con traducción) | CC-BY-NC 4.0 (uso no comercial) | NeMo |

Nota: la comparativa es orientativa; el modelo de esta ficha destaca en longitud de audio por pasada, diarización integrada y vocabulario personalizado, a costa de unos requisitos de memoria muy superiores y una compatibilidad de runtime limitada a speech.cpp.

## Limitaciones y advertencias

- **Compatibilidad de runtime**: los ficheros GGUF usan un layout propio de speech.cpp y no funcionan con llama.cpp, LM Studio, Ollama ni otros lectores GGUF. Es la limitación más importante para quien busque integración con el ecosistema GGUF estándar.
- **Tareas no incluidas en la portación**: la traducción del audio y las preguntas sobre el contenido del audio (disponibles en el modelo original según su model card) no están implementadas en speech.cpp.
- **Multi-token prediction**: los ficheros contienen las capas de multi-token prediction del checkpoint, pero speech.cpp no las carga.
- **Memoria**: el modelo requiere el fichero completo en memoria; no hay carga parcial. Si la GPU no basta, el offload parcial a CPU degrada el rendimiento.
- **Precisión numérica**: en Metal, la coincidencia con NeMo es ligeramente inferior que en CPU (10 palabras con tiempos distintos de 2.573, y 1.550 filas de expertos fuera del umbral de redondeo frente a 45 en CPU), algo a tener en cuenta en despliegues sobre GPU Apple.
- **Sesgos y alucinaciones**: no disponible información específica en la documentación proporcionada; como todo modelo ASR, puede cometer errores con acentos marcados, audio ruidoso o solapamiento de hablantes, aunque las pruebas del autor incluyen una reunión con cinco voces, pausas y solapamientos con resultados idénticos a la referencia oficial.
- **Licencia**: se distribuye bajo OpenMDW License Agreement 1.1 con aviso de copyright de NVIDIA. Conviene revisar el texto de la licencia antes de cualquier uso comercial, ya que es una licencia poco común y sus términos no están resumidos en la información disponible.
- **Idioma de la documentación**: la model card está íntegramente en inglés; no hay documentación oficial en castellano.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/sakasegawa/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- speech.cpp (repositorio): https://github.com/nyosegawa/speech.cpp
- Página del modelo en la documentación de speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/nemotron-transcribe.md
- Documentación de la línea de comandos de speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentación del servidor de speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md
