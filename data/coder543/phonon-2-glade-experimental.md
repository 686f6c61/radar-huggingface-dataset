# coder543/phonon-2-glade-experimental

## Resumen

Phonon-2 Glade Experimental es un conjunto de conversiones experimentales del modelo de reconocimiento automático de voz Phonon-2 de Fermion Research, adaptadas por el usuario coder543 para su ejecución sobre Apple Silicon mediante las APIs Core AI en macOS e iOS 27. No se trata de un modelo entrenado desde cero, sino de una reempaquetación de los pesos originales en formatos optimizados para la Neural Engine (ANE) de Apple, con tres variantes que equilibran velocidad, tamano de descarga y memoria de trabajo.

El modelo base Phonon-2 es un FastConformer/TDT con arquitectura encoder-heavy, derivado de NVIDIA Parakeet V3, especializado en transcripción de inglés. Las conversiones preservan los pesos del encoder entrenado en cinco valores y los valores INT6 originales del decoder, usando activaciones FP16 y una política de chunking basada en pausas de 25 a 35 segundos con objetivo de 30 segundos, que preserva todo el audio.

La relevancia de esta ficha radica en que demuestra un caso práctico de despliegue de ASR de alta eficiencia en hardware de consumo Apple: la variante LUT6 alcanza 445× RTFx en un M3 MacBook Air y 356× en un iPhone 15 Pro Max, con un WER de 2,93% en el discurso completo de referencia. Es, sin embargo, un artefacto experimental con cero descargas y cero likes en el momento de la consulta, orientado a evaluación técnica y no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer/TDT (encoder-heavy), derivada de NVIDIA Parakeet V3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | chunking por pausas de 25–35 s, objetivo 30 s por chunk |
| Tipos de cuantizacion | LUT6 (paletas de 6 bits compartidas entre 8 filas), LUT4 (paletas de 4 bits compartidas entre 2 filas), variante size (registros empaquetados originales expandidos a FP16 en carga); decoder en INT6; activaciones FP16 |
| Idiomas soportados | inglés (en), único idioma cualificado |
| Licencia | CC BY 4.0 |
| Formato de pesos | assets `.aimodel` de Core AI, `metadata.json`, `runtime.json`, vocabulario y datos compactos de decoder; archivos LZRAVEN de restauración |
| Modelo base | FermionResearch/Phonon-2 |
| Pipeline | automatic-speech-recognition |
| Tamano del repo | 1,8 GB |
| Plataformas cualificadas | M3 MacBook Air (16 GB, macOS 27.0.1) e iPhone 15 Pro Max (A17 Pro, iOS 27.0.1) |

## Arquitectura y entrenamiento

El modelo subyacente es un FastConformer con decodificación TDT (Token-and-Duration Transducer), una arquitectura encoder-heavy en la que la mayor parte del cómputo recae en el encoder convolucional-autoattentivo y el decoder es comparativamente ligero. Phonon-2 deriva de NVIDIA Parakeet V3 y conserva sus pesos de encoder entrenados en cinco valores junto con los valores INT6 originales del decoder. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica de estas conversiones no está en el entrenamiento sino en el despliegue: los pesos del encoder se reempaquetan en paletas de búsqueda (lookup tables) de 6 o 4 bits compartidas entre filas, lo que permite ejecutar la inferencia íntegramente en la Neural Engine. Las trazas completas muestran 493 predicciones en ANE y cero intervalos de GPU en el proceso objetivo: 259 predicciones durante subsampling/encoding y 234 durante decodificación por lotes. La extracción de características en CPU y el control TDT del host quedan fuera de esos grafos. Core AI especializa los assets `.aimodel` en el dispositivo; los archivos distribuidos contienen fuentes portables, no cachés específicas de dispositivo.

## Capacidades

- Reconocimiento automático de voz (speech-to-text) en inglés sobre audio de cualquier duración, mediante chunking por pausas de 25–35 segundos que preserva todo el audio.
- Generación de marcas de tiempo (timings) a nivel de palabra, finitas, ordenadas y contenidas dentro de cada chunk.
- Ejecución íntegra en Neural Engine de Apple Silicon, sin uso de GPU en el proceso objetivo.
- Tres perfiles de despliegue con compromisos explícitos entre velocidad, tamano de descarga y memoria: LUT6 (recomendado para velocidad), LUT4 y size-focused.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio de entrada.
- Capacidad multilingüe: no disponible; el inglés es el único idioma cualificado.

## Casos de uso

- Transcripción de reuniones y entrevistas largas en macOS: el chunking por pausas y el RTFx de 445× en M3 permiten transcribir un audio de 18 minutos en unos 2,5 segundos una vez preparado el modelo, con marcas de tiempo por palabra útiles para índices de búsqueda.
- Subtitulado y actas en dispositivos iOS: la variante LUT6 cualificada en iPhone 15 Pro Max (356× RTFx, 1,03 GB de memoria) hace viable la transcripción en primer plano sin depender de la nube, lo que resulta adecuado para contenido sensible que no debe salir del dispositivo.
- Indexación y búsqueda de archivos de audio: los timings nativos por palabra permiten construir índices alineados temporalmente para buscadores internos de podcasts, grabaciones de soporte o archivos de compliance.
- Preprocesado de pipelines de NLP: transcripción rápida y local como primer paso antes de resumido, clasificación o extracción de entidades, aprovechando que el modelo cabe en memoria de un portátil de 16 GB.
- Prototipado de aplicaciones Core AI: los tres directorios incluyen `metadata.json`, `runtime.json`, vocabulario y constantes de frontend, lo que sirve como referencia para integrar modelos ASR en apps macOS/iOS 27 con APIs Core AI.
- Evaluación comparativa de técnicas de cuantización: las variantes LUT6, LUT4 y size permiten medir en el mismo modelo el impacto de la compresión en velocidad (445×, 245× y 205,3× RTFx), memoria (1,05–1,20 GB, 0,90 GB y 2,18 GB) y fidelidad de salida.
- Transcripción por lotes en un Mac de sobremesa: la variante size-focused, pese a su mayor memoria (2,18 GB) y menor velocidad, reduce el tamano de descarga a 178,6 MB y puede interesar en entornos con ancho de banda limitado.

## Benchmarks y rendimiento

Las mediciones se realizaron el 30 de septiembre de 2026 sobre el discurso "We choose to go to the Moon" de JFK (extracto de 20 s y grabación completa de 18 min 15 s). Los valores de Core AI son medianas de tres ejecuciones tras preparación y warmup. RTFx mayor significa más rápido.

**M3 MacBook Air, 16 GB, macOS 27.0.1** (incluye frontend, encoder y decodificación; excluye carga, lectura de fichero y planificación de chunks):

| Variante | Extracto 20 s | Discurso completo | RTFx completo | Memoria en pasada completa |
|---|---:|---:|---:|---:|
| LUT6 | 0,251 s | 2,461 s | 445,0× | 1,05–1,20 GB |
| LUT4 | 0,330 s | 4,470 s | 245,0× | 0,90 GB |
| Size-focused | 0,365 s | 5,335 s | 205,3× | 2,18 GB |
| Defaults MLX del publicador (`fermion`) | 0,231 s | 12,668 s | 86,5× | 11,34 GB |

**iPhone 15 Pro Max, A17 Pro, iOS 27.0.1, build Release** (incluye lectura WAV acotada, planificación de chunks, frontend, encoder y decodificación):

| Variante | Extracto 20 s | Discurso completo | RTFx completo | Memoria en pasada completa |
|---|---:|---:|---:|---:|
| LUT6 | 0,321 s | 3,075 s | 356,2× | 1,03 GB |
| LUT4 | 0,370 s | 5,349 s | 204,8× | 0,90 GB |
| Size-focused | no medido | no medido | no medido | no medido en iPhone |

**Precisión:** el WER del discurso completo es 2,93% con el normalizador de inglés de Whisper (65 errores en 2.220 palabras de referencia), igual a la secuencia normalizada de una reconstrucción FP32 independiente. Los defaults MLX del publicador obtienen 3,02%. Se trata de una única grabación, no de un ranking general de precisión. Dos chunks del discurso completo difieren en tokenización respecto a FP32 conservando las palabras normalizadas.

**Preparación:** primera preparación observada en M3 de 104,2 s (LUT6), 179,1 s (LUT4) y 49,7 s (size); en caché baja a 0,35 s, 0,18–0,66 s y 3,56–3,59 s respectivamente. En iPhone, primera preparación de 72,6 s (LUT6) y 243,1 s (LUT4). Son sesiones de primer uso observadas, no medianas de instalación limpia repetidas.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR.

## Requisitos de hardware

- Memoria en pasada completa medida: 1,05–1,20 GB (LUT6), 0,90 GB (LUT4) y 2,18 GB (size-focused) en M3 MacBook Air de 16 GB.
- En iPhone 15 Pro Max: 1,03 GB (LUT6) y 0,90 GB (LUT4).
- Hardware cualificado: M3 MacBook Air con 16 GB y macOS 27.0.1; iPhone 15 Pro Max con A17 Pro e iOS 27.0.1. La variante size-focused solo está cualificada en M3 Mac.
- Ejecución sobre Neural Engine mediante APIs Core AI; las trazas muestran cero intervalos de GPU en el proceso objetivo.
- No se documentan opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI); el formato `.aimodel` y los ficheros LZRAVEN son específicos de Core AI.
- Tamano de descarga: 283,2 MB (LUT6), 235,0 MB (LUT4) y 178,6 MB (size) en archivo LZRAVEN; 583,4 MB, 438,6 MB y 217,2 MB respectivamente una vez descomprimidos.
- Throughput medido: 445,0× RTFx (LUT6, M3), 356,2× RTFx (LUT6, iPhone 15 Pro Max). La planificación del fichero completo anade unos 0,06 s.
- Latencia de primera preparación: entre 49,7 s y 243,1 s según variante y plataforma; posteriormente en caché, por debajo de 0,7 s en M3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunking | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phonon-2 Glade LUT6 (esta ficha) | no disponible | chunks de 25–35 s | 445,0× RTFx en M3; WER 2,93% | CC BY 4.0 | Hugging Face, 0 descargas |
| Phonon-2 MLX defaults (Fermion Research) | no disponible | mismo chunking del publicador | 86,5× RTFx en M3; WER 3,02% | no disponible en la información | Hugging Face |
| NVIDIA Parakeet V3 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante disponible es contra los defaults MLX del propio publicador: la conversión LUT6 multiplica por 5,1 el RTFx en M3 (445,0× frente a 86,5×) y reduce la memoria de 11,34 GB a 1,05–1,20 GB, con una precisión equivalente o ligeramente mejor en la grabación de referencia. No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Solo inglés cualificado; no se documenta soporte de otros idiomas.
- La precisión se mide sobre una única grabación (el discurso de JFK); el propio autor advierte que no es un ranking general de precisión.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente en audio ruidoso, acentos no cubiertos o vocabulario técnico; no se han publicado evaluaciones en esos dominios.
- Las marcas de tiempo por palabra son finitas, ordenadas y contenidas en cada chunk, pero su precisión en fronteras de palabra no se ha medido de forma independiente. La variante size-focused desplaza ocho intervalos de palabra hasta 160 ms respecto a las variantes con paletas.
- Dependencia estricta de hardware y sistema: Core AI en macOS/iOS 27 y Neural Engine de Apple Silicon; no hay rutas de despliegue en GPU NVIDIA, CPU x86 ni servidores Linux.
- La primera preparación del modelo tarda entre 49,7 s y 243,1 s según variante y dispositivo; es un coste no amortizado en usos esporádicos.
- La variante size-focused no está cualificada en iPhone y consume más memoria (2,18 GB) que las variantes con paletas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero debe verificarse la licencia del modelo base FermionResearch/Phonon-2, no detallada en la información disponible.
- Las cifras de memoria excluyen memoria de driver/compilador externa o no atribuida; no deben interpretarse como consumo total del sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/phonon-2-glade-experimental
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2
