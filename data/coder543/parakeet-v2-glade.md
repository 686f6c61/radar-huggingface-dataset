# coder543/parakeet-v2-glade

## Resumen

Parakeet V2 Glade es una conversión del modelo de reconocimiento automático del habla (ASR) NVIDIA Parakeet TDT 0.6B V2, publicada por el usuario coder543 y orientada específicamente al runtime Glade sobre hardware Apple. No se trata de un modelo nuevo entrenado desde cero, sino de un paquete de pesos cuantizados y configuración de ejecución que permite desplegar el modelo original de NVIDIA en Apple Neural Engine (ANE) y CPU, con dos variantes de compromiso velocidad/contexto: `fast` y `quality`. El repositorio ocupa 3,4 GB e incluye grafos estáticos, metadatos de formas de entrada y políticas de planificación de fragmentos.

El modelo base, Parakeet TDT 0.6B V2, es un sistema ASR de NVIDIA con arquitectura TDT (Token-and-Duration Transducer) y aproximadamente 0,6 mil millones de parámetros, diseñado para transcripción en inglés. La conversión de Glade fija el commit `ae9ad07059c7c739ffaf932226a8fe64ae2620b0` del modelo upstream y conserva su licencia CC BY 4.0. Es relevante porque demuestra una ruta de despliegue local de ASR de alta velocidad en dispositivos Apple, con transcripciones de un audio de 18 minutos en menos de 2 segundos en la variante `fast` sobre un M3 MacBook Air.

La ficha se basa exclusivamente en la model card del repositorio y en los metadatos de Hugging Face. Muchos datos técnicos del modelo base (composición del dataset, número de tokens de entrenamiento, benchmarks estándar) no están incluidos en la información disponible y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) sobre encoder Transformer con atención relativa; conversión a grafos estáticos para Glade |
| Parametros totales | 0,6 B (modelo base NVIDIA Parakeet TDT 0.6B V2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | `fast`: 192 posiciones de encoder, fragmentos fijos de 15 s; `quality`: 576 y 3.008 posiciones de encoder (entradas de 45 s y 4 min), fragmentos fijos de 240 s |
| Tipos de cuantizacion | Encoder W8A16 con proyecciones sensibles retenidas en FP16; decoder FP16 (ANE, `fast`) o FP32 (CPU, `quality`) |
| Idiomas soportados | no disponible (la model card solo documenta evaluación en inglés) |
| Licencia | CC BY 4.0 (heredada del modelo base; ver LICENSE y NOTICE en el repo) |
| Formato de pesos | Assets de runtime Glade (grafos estáticos + `metadata.json` + `runtime.json`); no safetensors ni GGUF estándar |

## Arquitectura y entrenamiento

El modelo subyacente es un transducer TDT: un encoder Transformer procesa el audio y un decoder transducer emite tokens junto con duraciones discretas (0, 1, 2, 3 o 4 frames por paso), lo que permite decodificación greedy eficiente sin modelo de lenguaje externo. La conversión de Glade no reentrena el modelo; transforma los pesos y la topología en funciones estáticas ejecutables en ANE y CPU. La variante `fast` usa atención relativa de Fourier finita completa con 192 posiciones de encoder y decoder FP16 en ANE, con batching de hasta 128 fragmentos independientes. La variante `quality` usa atención relativa sinusoidal completa, comparte pesos entre las formas de 576 y 3.008 posiciones, aplica subsampling convolucional con teselado exacto y decodifica en CPU FP32 con batching de hasta cuatro fragmentos.

Ambas variantes usan cuatro peticiones de encoder concurrentes, no truncan la atención dentro de cada fragmento ni descartan audio de entrada. El estado recurrente es independiente entre fragmentos. El vocabulario consta de 1.024 tokens no vacíos más el token blank (ID 1.024), con un máximo de diez símbolos por frame y un paso de frame de 80 ms, lo que permite timestamps nativos de token y palabra. No hay información disponible sobre el dataset de entrenamiento original, el número de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (transcripción) en inglés, según la evaluación documentada.
- Emisión de timestamps nativos de token y palabra a pasos de 80 ms, derivados de los frames de emisión TDT y las duraciones predichas; no son alineamientos forzados.
- Procesamiento de audio largo mediante planificación de fragmentos: hasta 18 minutos y 15 segundos en el benchmark, con 74 fragmentos en `fast` y cinco en `quality`.
- Decodificación greedy TDT con estado recurrente independiente por fragmento, lo que permite paralelizar fragmentos.
- Ejecución en Apple Neural Engine (encoder en `fast` y `quality`) y CPU (decoder en `quality`; decoder en ANE en `fast`).
- Batching de hasta 128 fragmentos independientes en el decoder de `fast`.
- No se documentan capacidades de traducción, diarización, detección de idioma, tool calling ni agentes.

## Casos de uso

- Transcripción local de reuniones y entrevistas en Mac: la variante `quality` procesa un audio de 18 minutos en 6,257 s en un M3 MacBook Air, con WER del 2,03 % en la grabación de referencia, lo que la hace adecuada para generar actas con marcas de tiempo por palabra.
- Subtitulado y generación de transcripciones con timestamps en apps de iOS: la variante `fast` transcribe 18 minutos en 2,418 s en un iPhone 15 Pro Max, con timestamps nativos a 80 ms útiles para sincronizar subtítulos.
- Procesamiento por lotes de archivos de audio en servidores macOS con Apple silicon: el batching de hasta 128 fragmentos en el decoder de `fast` permite alto throughput en pipelines de ingesta de audio.
- Búsqueda y indexación de contenido hablado: los timestamps por palabra permiten mapear términos de búsqueda a posiciones exactas en el audio, integrándose en sistemas de recuperación de información.
- Notas de voz y dictado en aplicaciones nativas: la ejecución en ANE con memoria pico de aproximadamente 1,07 GB (cliente más memoria neural atribuida) permite integrar el modelo en apps de escritorio y móviles sin GPU dedicada.
- Análisis de grabaciones largas en local con privacidad: al ejecutarse íntegramente en el dispositivo, evita enviar audio a servicios en la nube, adecuado para entornos con requisitos de confidencialidad.
- Evaluación y prototipado de ASR en el ecosistema Apple: sirve como referencia de despliegue de un transducer TDT en Core AI, con métricas reproducibles de velocidad y WER.

## Benchmarks y rendimiento

Rendimiento medido en M3 MacBook Air (16 GB), macOS 27 build 26A428, sobre el discurso «We choose to go to the Moon» de JFK (extracto de 20 s y grabación completa de 18 min 15 s). Medianas tras calentamiento; incluye frontend, encoder y decodificación.

| Bundle | Audio | Transcripcion | Audio / tiempo |
|---|---:|---:|---:|
| fast | 20 s | 0,150 s | 133,4× |
| fast | 18 min 15 s | 1,876 s | 584,0× |
| quality | 20 s | 0,153 s | 130,9× |
| quality | 18 min 15 s | 6,257 s | 175,0× |

WER normalizado estilo Whisper contra la referencia de la grabación larga:

| Bundle / referencia | Errores de palabra | WER |
|---|---:|---:|
| fast | 79/2220 | 3,56 % |
| quality | 45/2220 | 2,03 % |
| Fuente FP32, mismos cortes de 4 min que quality | 46/2220 | 2,07 % |

Con la normalización más simple del benchmark, `quality` obtiene 54/2219 (2,43 %) y la fuente correspondiente 53/2219 (2,39 %). La model card advierte que se trata de una única grabación en inglés y no de un ranking general de precisión.

Rendimiento medido en iPhone 15 Pro Max, iOS 27 build 24A437, runtime Release:

| Bundle | Audio | Transcripcion | Audio / tiempo |
|---|---:|---:|---:|
| fast | 20 s | 0,166 s | 120,7× |
| fast | 18 min 15 s | 2,418 s | 453,0× |
| quality | 20 s | 0,171 s | 117,3× |
| quality | 18 min 15 s | 7,189 s | 152,4× |

Preparación observada: `fast` 47,7 s con especialización y 0,115 s en caché; `quality` 446,9 s de encoder y 41,4 s de subsampling en cargas separadas, y 0,063 s en caché. La model card indica que estas cifras son historiales observados, no mediciones controladas de instalación limpia.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, etc.) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: Apple silicon físico con macOS 27 o iOS 27 y un runtime host específico del modelo; no se admite emulación ni otras plataformas.
- Memoria: pico muestreado de cliente más memoria neural atribuida de aproximadamente 1,07 GB, excluyendo memoria no atribuida de compilador, driver y sistema.
- GPU: no se usa GPU; las trazas documentadas muestran cero intervalos de GPU en el proceso objetivo. El encoder se ejecuta en ANE y el decoder en ANE (`fast`) o CPU (`quality`).
- Cabe en dispositivos de consumo Apple: validado en M3 MacBook Air de 16 GB e iPhone 15 Pro Max.
- Despliegue: exclusivamente mediante el runtime Glade y los assets del repositorio (`fast/` o `quality/`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: hasta 584× tiempo real en `fast` sobre M3 y 453× en iPhone 15 Pro Max para audio largo; `quality` alcanza 175× y 152,4× respectivamente.
- Los grafos aceptan características del modelo y estados recurrentes, no archivos de audio; el host debe implementar el frontend, el bucle TDT greedy y el tokenizador según los metadatos y sidecars.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / fragmentos | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet V2 Glade (`fast`) | 0,6 B | 192 posiciones, 15 s por fragmento | 584× en M3; WER 3,56 % | CC BY 4.0 | Hugging Face (este repo) |
| Parakeet V2 Glade (`quality`) | 0,6 B | 576/3.008 posiciones, 240 s por fragmento | 175× en M3; WER 2,03 % | CC BY 4.0 | Hugging Face (este repo) |
| NVIDIA Parakeet TDT 0.6B V2 | 0,6 B | no disponible | Fuente FP32: WER 2,07 % en los mismos cortes | CC BY 4.0 | Hugging Face (nvidia/parakeet-tdt-0.6b-v2) |

No se dispone en la información proporcionada de comparaciones con otros modelos ASR (Whisper, Canary, etc.) ni de sus especificaciones, por lo que no se incluyen datos de terceros.

## Limitaciones y advertencias

- La evaluación de precisión se limita a una única grabación en inglés; no constituye un ranking general de calidad ni permite extrapolar a otros idiomas o dominios.
- La cuantización W8A16 y el orden de las operaciones en coma flotante pueden alterar decisiones de token; los tokens de la grabación completa difieren entre Mac e iPhone en la variante `quality`, aunque son estables entre ejecuciones.
- La precisión de los límites de palabra no se midió con evaluación humana; los timestamps son alineamientos nativos, no forzados.
- Requiere hardware Apple silicon físico y macOS 27 o iOS 27; no es desplegable en GPU NVIDIA, AMD ni en CPU x86 según la documentación.
- El host debe implementar el frontend, el bucle TDT y el tokenizador; el repositorio no incluye un ejecutable autónomo.
- Los tiempos de preparación pueden ser elevados (hasta 446,9 s en encoder para `quality` en iPhone) y dependen de la caché del driver, cuyo comportamiento es opaco.
- La conversión no está avalada por NVIDIA.
- Licencia CC BY 4.0: permite uso comercial con atribución; deben conservarse LICENSE y NOTICE.
- No se documentan sesgos, riesgos de alucinación específicos ni comportamiento multilingüe; cualquier uso en producción debería validarse con datos propios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coder543/parakeet-v2-glade
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Commit fijado del modelo base: `ae9ad07059c7c739ffaf932226a8fe64ae2620b0`
