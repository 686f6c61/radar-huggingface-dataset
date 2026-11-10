# coder543/qwen3-asr-1.7b-glade

## Resumen

Qwen3-ASR 1.7B for Glade es una conversión del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud, a un paquete de ejecución offline para la plataforma Glade sobre Apple Silicon. El autor de la conversión es coder543, que publica los pesos convertidos y la configuración de runtime necesaria para ejecutar el modelo en dispositivos con chip de Apple (macOS 27 o iOS 27). La licencia Apache-2.0 se mantiene respecto al modelo original.

El paquete, de aproximadamente 2,7 GB, se organiza en assets `.aimodel` que no cargan a través de Transformers ni de la API `MLModel` de Core ML. Emplea cuantización W8A16 con tensores sensibles retenidos en FP16, procesa el audio en fragmentos de 30 segundos y admite hasta ocho carriles de decodificación independientes, con preferencia por el Neural Engine (ANE) tanto para el codificador de audio como para el decodificador autorregresivo de texto.

Su relevancia radica en que permite transcripción offline de alta velocidad en hardware de consumo Apple: sobre un discurso de 18 minutos y 15 segundos se midieron velocidades de 25,6× en un MacBook Air M3, 18,2× en un iPhone 15 Pro Max y 39,6× en un iPhone Duo, con un pico de memoria de 3,42 GB en el M3. El modelo upstream soporta 30 idiomas y 22 dialectos chinos, aunque la cobertura de regresión de esta conversión se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (codificador de audio + decodificador autorregresivo de texto), con atención de audio offline de ventanas de 8 segundos |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-ASR-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | fragmentos de audio de 30 segundos; caché KV compacta de 512 posiciones ampliable a 1.024 |
| Tipos de cuantizacion | W8A16 con tensores sensibles seleccionados en FP16; embeddings en FP16 |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos en el modelo upstream; prompts incluidos para las 30 opciones de idioma; cobertura de regresión de esta conversión solo en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | assets `.aimodel` propietarios de Glade, más `embeddings.f16`, `tokenizer.json`, `prompts.json` y `metadata.json`; no compatible con Transformers ni Core ML `MLModel` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo ASR de tipo encoder-decoder: un frontend de audio y un codificador que procesan la señal con ventanas de atención offline nativas de ocho segundos, y un decodificador autorregresivo de texto de 28 capas. En esta conversión, las 28 capas de texto se reparten en catorce assets `text_*.aimodel` (dos capas por asset), con proyecciones compartidas de 64 posiciones que sirven tanto al prefill como a los puntos de entrada de decodificación de uno y ocho carriles sin alterar el historial de atención. El cabezal de vocabulario (`head.aimodel`) proyecta el vocabulario y devuelve identificadores de partición y locales ganadores, preservando los IDs de token exactos pese al transporte de tensores en FP16.

Glade gestiona el frontend de audio, el ensamblado de prompts, la generación greedy y la tokenización mediante los metadatos y sidecars incluidos. La caché KV compacta arranca en 512 posiciones y se expande a 1.024 cuando es necesario; cada posición de contexto válida se retiene y el agotamiento de la caché produce un error en lugar de una truncación silenciosa. Los fragmentos independientes no comparten historial del decodificador. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en la información disponible.

## Capacidades

- Reconocimiento automático del habla (transcripción) offline en dispositivos Apple Silicon.
- Procesamiento de audio en fragmentos de 30 segundos con retención de todas las muestras de entrada.
- Decodificación con hasta ocho carriles independientes en paralelo.
- Selección automática de idioma omitiendo la pista de idioma, o selección explícita entre 30 idiomas.
- Soporte de 22 dialectos chinos en el modelo upstream.
- Generación greedy y tokenización gestionadas por el runtime Glade.
- No produce marcas de tiempo nativas a nivel de palabra; para ello requiere una pasada opcional separada con Qwen3 ForcedAligner.
- No se documentan capacidades de tool calling, agentes, visión ni audio en tiempo real en la información disponible.

## Casos de uso

- Transcripción offline de reuniones y conferencias: el modelo procesa grabaciones largas fragmentándolas en bloques de 30 segundos, como demuestra la transcripción de un discurso de 18 minutos en 42,8 segundos sobre un MacBook Air M3, sin enviar audio a la nube.
- Subtitulado de contenido audiovisual en Mac: con velocidades de 25,6× a 44,3× según el chip, permite transcribir horas de material en minutos y generar subtítulos para postproducción local.
- Aplicaciones de dictado en iPhone: el bundle funciona en iOS 27 sobre Apple Silicon, con 18,2× medido en un iPhone 15 Pro Max, lo que habilita dictado y notas de voz transcritas en el propio dispositivo.
- Archivado y búsqueda de grabaciones: la transcripción local de entrevistas, llamadas o podcasts permite indexar y buscar contenido sin depender de servicios externos, con un pico de memoria de 3,42 GB en M3.
- Procesamiento por lotes en estaciones de trabajo Apple: el CLI de Glade permite automatizar la transcripción de lotes de audio en un MacBook Pro M5 Max a 44,3×, adecuado para pipelines de contenido.
- Transcripción multilingüe con selección de idioma: mediante los prompts de 30 idiomas incluidos y la selección automática, útil para material en varios idiomas, con la advertencia de que la cobertura de regresión de esta conversión es solo en inglés.
- Alineación temporal opcional: combinado con Qwen3 ForcedAligner como pasada separada, permite obtener marcas de tiempo por palabra para aplicaciones de subtitulado preciso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible. Los datos de rendimiento publicados son medidas de velocidad y memoria sobre el discurso «We choose to go to the Moon» (18 minutos 15 segundos, 1.095,32 segundos, 37 fragmentos):

| Dispositivo | Tiempo de procesamiento | Factor de velocidad | Rango medido |
|---|---:|---:|---:|
| MacBook Air M3 (16 GB) | 42,844 s | 25,6× | 42,10–50,28 s |
| iPhone 15 Pro Max | 60,109 s | 18,2× | 59,71–66,04 s |
| iPhone Duo | 27,655 s | 39,6× | 27,48–35,19 s |
| MacBook Pro M5 Max (18 CPU, 40 GPU, 64 GB) | 24,697 s | 44,3× | mediana de tres pasadas |

Memoria pico en la grabación completa: 3,42 GB en M3 (cliente y ANE), 5,12 GB de huella del cliente en Duo y 3,27 GB en iPhone 15 Pro Max. Tiempos de preparación inicial: 357,4 s para los catorce assets de texto en Duo (carga en caché posterior de 0,95 s), 270,4 s para los 17 assets en iPhone 15 Pro Max (carga en caché de 0,43 s) y 0,16 s de carga en caché en M3. La división a dos capas por asset redujo el tiempo de preparación un 33% frente a assets de siete capas, a cambio de pasar de 44,9× a 39,6× en la grabación completa.

## Requisitos de hardware

- Hardware físico Apple Silicon obligatorio; requiere macOS 27 o iOS 27.
- Memoria pico medida: 3,42 GB en MacBook Air M3 de 16 GB, 3,27 GB en iPhone 15 Pro Max y 5,12 GB de huella del cliente en iPhone Duo.
- Tamaño del bundle: aproximadamente 2,7 GB; tamaño del repositorio: 4,1 GB.
- Dispositivos verificados: MacBook Air M3 (16 GB), iPhone 15 Pro Max, iPhone Duo y MacBook Pro M5 Max (18 núcleos de CPU, 40 de GPU, 64 GB).
- Preferencia por el Neural Engine (ANE) para codificador y decodificador; la preferencia no garantiza la colocación en todos los dispositivos y versiones de sistema.
- La anulación explícita del decodificador a GPU no está disponible para este diseño de proyecciones compartidas.
- No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers; el despliegue se realiza exclusivamente mediante el runtime Glade.
- Latencia y throughput: 25,6× en M3, 18,2× en iPhone 15 Pro Max, 39,6× en iPhone Duo y 44,3× en MacBook Pro M5 Max sobre la grabación de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Plataforma | Rendimiento publicado |
|---|---|---|---|---|---|
| coder543/qwen3-asr-1.7b-glade | 1,7 B | fragmentos de 30 s; caché KV 512–1.024 | Apache-2.0 | Apple Silicon (macOS 27 / iOS 27) | 18,2×–44,3× según dispositivo |
| Qwen/Qwen3-ASR-1.7B (upstream) | 1,7 B | no disponible | Apache-2.0 | no disponible | no disponible |
| coder543/qwen3-forced-aligner-glade | no disponible | no disponible | no disponible | Apple Silicon (Glade) | no disponible (pasada opcional de alineación) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La cobertura de regresión de esta conversión se limita al inglés (numérica y de grabación); no hay evaluación exhaustiva de los 30 idiomas ni de los 22 dialectos chinos.
- No genera marcas de tiempo nativas por palabra; requiere una pasada separada con Qwen3 ForcedAligner cuyos costes de descarga, preparación, memoria e inferencia no están incluidos en las medidas.
- El agotamiento de la caché KV (más de 1.024 posiciones válidas) produce un error, no una truncación silenciosa.
- Los fragmentos independientes no comparten historial del decodificador, lo que puede afectar a la coherencia en audio muy segmentado.
- Los assets `.aimodel` no cargan mediante Transformers ni la API `MLModel` de Core ML; el modelo queda ligado al runtime Glade.
- Requiere hardware físico Apple Silicon y versiones de sistema muy recientes (macOS 27 o iOS 27).
- La preferencia por ANE no garantiza la colocación en todos los dispositivos ni versiones de OS.
- Los tiempos de preparación inicial pueden ser elevados (hasta 357,4 s en Duo) y dependen de la caché del sistema, que puede desalojarse.
- La conversión no está avalada por los autores originales; no se documentan sesgos específicos ni tasas de alucinación.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y el NOTICE incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/qwen3-asr-1.7b-glade
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Alineador opcional: https://huggingface.co/coder543/qwen3-forced-aligner-glade
