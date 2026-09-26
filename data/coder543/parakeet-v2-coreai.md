# coder543/parakeet-v2-coreai

## Resumen

`coder543/parakeet-v2-coreai` es una conversión del modelo de reconocimiento automático de voz NVIDIA Parakeet TDT 0.6B V2 al formato Core AI de Apple, publicada por el usuario coder543. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos proceden del checkpoint upstream fijado en el commit `ae9ad07059c7c739ffaf932226a8fe64ae2620b0` y conservan la licencia original CC-BY-4.0. El objetivo es ejecutar un transductor TDT de aproximadamente 0,6 mil millones de parámetros directamente sobre silicio Apple (ANE y CPU) en macOS 27 e iOS 27.

El repositorio ofrece dos paquetes autocontenidos: `fast/`, con atención relativa de Fourier finita, 192 posiciones de encoder y fragmentos fijos de 15 segundos, y `quality/`, con atención relativa sinusoidal completa, 3.776 posiciones de encoder, submuestreo convolucional por teselas exacto y fragmentos de 300 segundos. Ambos emplean pesos de encoder en W8A16 (con proyecciones sensibles en FP16) y admiten cuatro peticiones concurrentes de encoder.

Su relevancia es doble. Por un lado, traslada un modelo ASR de referencia de NVIDIA al ecosistema on-device de Apple, algo poco habitual en HuggingFace. Por otro, publica mediciones reproducibles de latencia y WER sobre un MacBook Air M3 (16 GB), con 584× de tiempo real en el paquete `fast` para un clip de 18:15 y un WER del 1,98 % en el paquete `quality`. El repositorio no tiene descargas ni valoraciones y no está avalado por NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) con encoder de atención relativa; conversión a grafos estáticos de Apple Core AI |
| Parámetros totales | ~0,6 mil millones (según el nombre del checkpoint base; no confirmado en la información proporcionada) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | `fast/`: 192 posiciones de encoder, fragmentos fijos de 15 s, hasta 128 fragmentos independientes en el decoder ANE FP16. `quality/`: 3.776 posiciones de encoder, fragmentos fijos de 300 s |
| Tipos de cuantización | Encoder W8A16 con proyecciones sensibles seleccionadas en FP16; decoder FP16 (paquete `fast`) o decoder FP32 en CPU (paquete `quality`) |
| Idiomas soportados | No disponible; la única evaluación publicada usa una grabación en inglés |
| Licencia | CC-BY-4.0 (idéntica a la del modelo upstream) |
| Formato de pesos | Artefactos `.aimodel` de Apple Core AI (no safetensors ni GGUF), más `SHA256.json` con sumas de verificación |
| Modelo base | nvidia/parakeet-tdt-0.6b-v2 |
| Tarea (pipeline) | automatic-speech-recognition |
| Tamaño del repositorio | 1,4 GB |
| Vocabulario | 1.024 tokens no vacíos, ID de blank 1024, duraciones 0/1/2/3/4, máximo de diez símbolos por trama |

## Arquitectura y entrenamiento

La model card no describe ningún entrenamiento ni ajuste adicional: es una conversión de pesos y grafos. El componente central es un transductor TDT con bucle de decodificación greedy que el runtime anfitrión debe implementar, junto con el frontend de audio y el tokenizador descritos en los metadatos y sidecars. Los grafos aceptan características del modelo y estados recurrentes, no archivos de audio. Los estados recurrentes se comparten entre funciones estáticas, pero los historiales recurrentes permanecen independientes entre enunciados.

La diferencia técnica entre los dos paquetes está en cómo se gestiona la atención sobre audio largo. El paquete `fast/` usa atención relativa de Fourier finita sobre 192 posiciones, lo que limita el fragmento a 15 segundos y permite hasta 128 fragmentos independientes por pasada en el decoder FP16 sobre la ANE. El paquete `quality/` usa atención relativa sinusoidal completa sobre 3.776 posiciones, submuestreo convolucional por teselas exacto y fragmentos de 300 segundos, con un decoder FP32 en CPU que agrupa hasta cuatro fragmentos. Ninguno de los dos trunca la atención dentro de su fragmento ni descarta audio de entrada. El archivo `runtime.json` registra la política de planificación validada.

Un detalle relevante para integradores: para vocabularios mayores que el V2 (caso de V3), el grafo por lotes devuelve `(partition, local)` en dos canales FP16 y el token se reconstruye como `partition * 2048 + local`. Los identificadores globales por encima de 2.048 no deben transportarse como un único valor FP16.

## Capacidades

- Reconocimiento automático de voz (transcripción) sobre audio, con salida de identificadores de token que el anfitrión debe detokenizar.
- Procesamiento de audio largo: el clip de referencia JFK de 1.095,320125 s (18:15) se transcribe completo, en 74 fragmentos con el paquete `fast` y en 4 fragmentos con el paquete `quality`.
- Procesamiento por fragmentos concurrentes: cuatro peticiones de encoder simultáneas y hasta 128 fragmentos independientes en el decoder ANE del paquete `fast`.
- Dos modos explícitos de compromiso velocidad/precisión: `fast/` y `quality/`.
- Ejecución on-device sobre Apple silicon, sin depender de servidores externos.
- Estados recurrentes por enunciado, que permiten mantener sesiones independientes entre locuciones.
- No se documenta traducción, diarización de hablantes, detección de idioma, puntuación automática, emoción, tool calling, function calling ni capacidades de agente.
- No se documenta soporte multilingüe ni evaluación en idiomas distintos del inglés.

## Casos de uso

- Transcripción local en aplicaciones de macOS y iOS: la inferencia se ejecuta sobre la ANE y la CPU del dispositivo, por lo que el audio del usuario no necesita salir del terminal. Adecuado para apps con requisitos estrictos de privacidad o que operan sin conectividad.
- Notas de reuniones largas: el paquete `quality/` procesa fragmentos de 300 segundos y transcribió el clip de 18:15 en 7,044 s (155,5× tiempo real), lo que lo hace viable para resúmenes posteriores de reuniones grabadas sin esperas perceptibles.
- Dictado y accesibilidad en tiempo real: el paquete `fast/` transcribe un clip de 20 s en 0,150 s (133,4× tiempo real) con fragmentos de 15 s, suficiente para interfaces de voz que necesitan respuesta casi inmediata.
- Procesado por lotes de archivos de audio en un Mac: el paquete `fast/` alcanza 584,0× tiempo real en grabaciones largas, de modo que un equipo de sobremesa o un MacBook pueden indexar grandes volúmenes de entrevistas o podcasts en local.
- Indexación y búsqueda en archivos de audio corporativos: el modelo genera la transcripción y el sistema de búsqueda se encarga del índice; al ejecutarse on-device, permite procesar material sensible (legal, sanitario, periodístico) sin transferencias.
- Subtitulado de contenido en inglés: transcripción de vídeo con el paquete `quality/` (WER medido del 1,98 % sobre la grabación de referencia) como paso previo a la generación de subtítulos.
- Aplicaciones sin conexión en dispositivos Apple: asistentes de campo, grabadoras de voz profesionales o herramientas de documentación que deben funcionar en iOS 27 sin cobertura.

## Benchmarks y rendimiento

Mediciones publicadas por el autor sobre un MacBook Air M3 (16 GB) con macOS 27 build 26A428. Son medianas tras calentamiento; incluyen frontend, encoder y decodificación, pero excluyen preparación, E/S de archivos y planificación de fragmentos. El clip largo JFK dura 1.095,320125 s (18:15).

| Paquete | Duración del audio | Transcripción | Audio / tiempo transcurrido |
|---|---:|---:|---:|
| fast | 20,000 s | 0,150 s | 133,4× |
| fast | 1.095,320 s | 1,876 s | 584,0× |
| quality | 20,000 s | 1,336 s | 15,0× |
| quality | 1.095,320 s | 7,044 s | 155,5× |

WER normalizado con Whisper respecto a la referencia de la grabación larga facilitada:

| Paquete | Errores de palabra | WER |
|---|---:|---:|
| fast | 79/2.220 | 3,56 % |
| quality | 44/2.220 | 1,98 % |

Advertencias del propio autor: se trata de una única grabación en inglés, no de una evaluación general ni multilingüe. La cuantización nativa y el orden de operaciones del decoder FP16 pueden alterar decisiones de token. Las ejecuciones de grabación completa conservan todo el audio, con 74 fragmentos en `fast` y 4 en `quality`; son contextos y políticas de ejecución distintos, no una comparación controlada de kernels. No hay datos publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks al uso, porque no son aplicables a un modelo ASR.

## Requisitos de hardware

- Requiere silicio Apple físico, macOS 27 o iOS 27, y un runtime anfitrión específico del modelo. No hay soporte para CUDA, ROCm ni CPU x86.
- Las mediciones publicadas se obtuvieron en un MacBook Air M3 con 16 GB de memoria unificada.
- No hay cifra publicada de VRAM o memoria residente en ejecución; el repositorio completo ocupa 1,4 GB y el encoder usa pesos W8A16 con proyecciones sensibles en FP16.
- Al ser un modelo on-device para Apple silicon, cabe en hardware de consumo por diseño (portátiles y dispositivos iOS), pero no hay datos publicados para otros chips (M1, M2, M4, A-series) ni para modelos de iPhone concretos.
- La primera preparación de los archivos `.aimodel` puede tardar varios minutos porque se especializan en el dispositivo; ese tiempo no está incluido en la tabla de rendimiento.
- Los artefactos compilados AoT se omitieron porque no se demostró una mejora significativa en tiempo de carga.
- Opciones de despliegue: exclusivamente el runtime de Apple Core AI con grafos estáticos. No hay soporte para vLLM, llama.cpp, Ollama, TGI, TensorRT ni NeMo.
- Latencia y throughput medidos: 133,4× a 584,0× tiempo real en el paquete `fast` y 15,0× a 155,5× en el paquete `quality`, según la duración del audio.
- El anfitrión debe implementar el frontend de audio, el bucle TDT greedy y el tokenizador descritos en los metadatos; el modelo no acepta archivos de audio directamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Licencia | Despliegue | Estado |
|---|---|---|---|---|---|
| coder543/parakeet-v2-coreai (`fast/`) | ~0,6 B | Fragmentos de 15 s, hasta 128 fragmentos independientes | CC-BY-4.0 | Apple Core AI, Apple silicon | Publicado, sin descargas ni valoraciones |
| coder543/parakeet-v2-coreai (`quality/`) | ~0,6 B | Fragmentos de 300 s, 3.776 posiciones de encoder | CC-BY-4.0 | Apple Core AI, Apple silicon | Publicado, sin descargas ni valoraciones |
| nvidia/parakeet-tdt-0.6b-v2 (upstream) | ~0,6 B | No disponible en la información proporcionada | CC-BY-4.0 | NeMo / CUDA | Modelo de referencia de NVIDIA |
| Alternativas tipo Whisper u otros ASR comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación relevante es entre la conversión y su modelo base: comparten pesos y licencia, pero difieren por completo en el destino de despliegue. La conversión hereda cualquier comportamiento del modelo original y añade las restricciones del ecosistema Core AI (especialización en dispositivo, formatos `.aimodel`, runtime propio). No se dispone de comparaciones controladas con otros modelos ASR, ni de WER en otros idiomas o corpus.

## Limitaciones y advertencias

- Plataforma cerrada: solo funciona en Apple silicon con macOS 27 o iOS 27 y un runtime anfitrión específico. No es portable a otros aceleradores ni a servidores Linux con GPU.
- Conversión no avalada por NVIDIA: el autor indica explícitamente que NVIDIA no respalda esta conversión.
- Evaluación muy limitada: el WER publicado proviene de una única grabación en inglés. No es una medida de precisión general ni multilingüe y no debe extrapolarse a producción sin validación propia.
- La cuantización nativa W8A16 y el orden de operaciones del decoder FP16 pueden cambiar decisiones de token respecto al modelo original, por lo que la equivalencia exacta con el upstream no está garantizada.
- Integración no trivial: el anfitrión debe aportar frontend, bucle TDT greedy y tokenizador; los grafos no aceptan audio directamente.
- Restricción de transporte de tokens: los identificadores globales por encima de 2.048 no deben transportarse como un único valor FP16.
- Primera ejecución lenta: la especialización de los archivos `.aimodel` en el dispositivo puede tardar varios minutos y no está incluida en las métricas de rendimiento.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de pruebas independientes.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución adecuada y la indicación de los cambios realizados; conviene revisar los archivos LICENSE y NOTICE del repositorio.
- Sesgos: no hay información publicada sobre sesgos demográficos, acentos o variedades dialectales.
- Riesgo de alucinación: no hay datos específicos, pero cualquier modelo ASR puede generar transcripciones plausibles y erróneas en audio con ruido, solapamiento de voces o vocabulario especializado; se recomienda validación humana en dominios críticos.
- Sin capacidades documentadas de diarización, traducción, puntuación o detección de idioma, lo que limita su uso directo en flujos que las requieran.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/coder543/parakeet-v2-coreai
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Licencia Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a páginas del juego de cartas Hearts y no guardan relación con el contenido de la ficha.
