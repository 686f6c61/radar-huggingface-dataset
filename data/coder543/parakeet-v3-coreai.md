# coder543/parakeet-v3-coreai

## Resumen

Parakeet v3 Core AI es una conversión del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-tdt-0.6b-v3 al formato y runtime Core AI de Apple, publicada por el usuario coder543. No se trata de un modelo nuevo entrenado desde cero, sino de un port de los pesos originales (fijados al commit 541d1f99c6b0c3cd0b11a95167540bb8edefd82b) a grafos `.aimodel` que se ejecutan sobre la Neural Engine (ANE) de los chips Apple Silicon, con un runtime anfitrión específico. La conversión conserva la licencia Creative Commons Attribution 4.0 del modelo upstream y no cuenta con el respaldo de NVIDIA.

El modelo base es un transductor TDT (Token-and-Duration Transducer, familia RNN-T) de 600 millones de parámetros, diseñado para transcripción de alta throughput y con soporte de 25 idiomas europeos. Esta conversión se distribuye en dos paquetes autocontenidos: `fast/`, orientado a baja latencia con chunks fijos de 15 segundos y decodificador FP16 en ANE, y `quality/`, orientado a contexto largo con chunks de 240 segundos y decodificador FP32 en CPU. Ambos emplean pesos de encoder en W8A16, con determinadas proyecciones sensibles retenidas en FP16.

Su relevancia radica en que permite ejecutar ASR multilingüe de forma totalmente local en Mac y dispositivos iOS, sin GPU ni runtime de LLM: los grafos aceptan características acústicas y estados recurrentes, y el anfitrión debe implementar el frontend, el bucle TDT greedy y el tokenizador. El repositorio ocupa 1,5 GB y, en el momento de la consulta, acumulaba 0 descargas y 0 likes, por lo que se trata de una publicación muy reciente y sin validación comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer, familia RNN-T) sobre encoder tipo FastConformer; en esta conversion, grafos `.aimodel` con atencion relativa (Fourier finita en `fast/`, sinusoidal completa en `quality/`) |
| Parametros totales | 600 millones (modelo base nvidia/parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Depende del paquete: `fast/` 192 posiciones de encoder (chunks fijos de 15 s); `quality/` 576 posiciones (45 s) y 3.008 posiciones (4 minutos), con pesos compartidos, en chunks fijos de 240 s |
| Tipos de cuantizacion | Encoder en W8A16 con proyecciones sensibles retenidas en FP16; decodificador FP16 (ANE) en `fast/` y FP32 (CPU) en `quality/` |
| Idiomas soportados | 25 idiomas europeos segun el modelo base; el autor solo verifica muestras adicionales en aleman y ucraniano (no disponible la lista completa en la informacion proporcionada) |
| Licencia | Creative Commons Attribution 4.0 (cc-by-4.0) |
| Formato de pesos | Grafos `.aimodel` (Core AI), acompanados de `metadata.json` y `runtime.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transductor TDT, una variante de la familia RNN-T en la que el decodificador predice simultaneamente el token y su duracion (valores 0/1/2/3/4), lo que permite emitir varios simbolos por frame y acelerar la decodificacion. El vocabulario consta de 8.192 tokens no vacios, con ID de blank 8.192 y un maximo de diez simbolos por frame. El encoder trabaja sobre caracteristicas acusticas y estados recurrentes; el estado recurrente es independiente entre chunks, y los frames de emision TDT y las duraciones predichas permiten obtener timestamps de token y palabra con un paso de frame de 80 ms (alineamientos nativos, no forzados).

Esta publicacion no entrena el modelo: convierte los pesos upstream a grafos especializados por dispositivo. El paquete `fast/` usa atencion relativa de Fourier finita completa, 192 posiciones de encoder, chunks fijos de 15 segundos y un decodificador FP16 en ANE que agrupa hasta 128 chunks independientes. El paquete `quality/` usa atencion relativa sinusoidal completa, pesos compartidos para las formas de 576 y 3.008 posiciones, subsampling convolucional por tiles exactos, chunks fijos de 240 segundos y decodificador FP32 en CPU que agrupa hasta cuatro chunks; se debe seleccionar la forma mas pequena que encaje en cada chunk, usando la de 45 segundos para grabaciones cortas. Ambos paquetes mantienen cuatro peticiones de encoder concurrentes y ninguna truncacion de la atencion dentro de su chunk.

El contrato del anfitrion de `quality/` exige multiplicar la salida del grafo de subsampling por `subsampling_output_scale` = 16 antes de introducirla en el encoder (escalado potencia de dos que protege la proyeccion FP16 de desbordamiento); en `fast/` la escala por defecto es 1. El decodificador FP16 devuelve pares de ID de token particion/local para reconstruir sin redondeo los IDs superiores a 2.048.

## Capacidades

- Transcripcion de voz a texto multilingue (25 idiomas europeos segun el modelo base), con deteccion automatica de idioma heredada del modelo upstream.
- Manejo de audio largo: hasta 15 segundos por chunk en `fast/` y hasta 240 segundos (4 minutos) por chunk en `quality/`, con chunks independientes agregables para grabaciones de horas.
- Timestamps nativos de token y palabra con paso de frame de 80 ms, utiles para subtitulado y alineamiento.
- Ejecucion totalmente on-device sobre Neural Engine, sin GPU ni runtime de LLM.
- Procesamiento por lotes: hasta 128 chunks simultaneos en el decodificador ANE de `fast/` y hasta cuatro chunks independientes en el decodificador CPU de `quality/`.
- Cuatro peticiones de encoder concurrentes.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo ASR puro.
- No procesa audio directamente: los grafos aceptan caracteristicas del modelo y estados recurrentes, de modo que el anfitrion debe aportar el frontend, el bucle greedy TDT y el tokenizador.

## Casos de uso

- Transcripcion local de reuniones y notas de voz en Mac: el paquete `quality/` procesa chunks de hasta cuatro minutos con un WER medido de 3,65% en la grabacion de referencia, y permite cubrir reuniones largas sin enviar audio a la nube.
- Subtitulado automatico con marcas de tiempo: los frames de emision TDT y las duraciones predichas generan timestamps de palabra a 80 ms de resolucion, suficientes para generar subtitulos SRT sincronizados.
- Dictado de baja latencia en aplicaciones de escritorio: el paquete `fast/` transcribe un extracto de 20 segundos en 0,129 s (155,5x tiempo real en un M3 MacBook Air de 16 GB), adecuado para retroalimentacion casi instantanea.
- Indexacion y busqueda de archivos de audio: la transcripcion de una grabacion de 18 minutos y 15 segundos en 1,942 s con `fast/` (563,9x) permite procesar grandes volumenes de archivos historicos por lotes.
- Preprocesado de pipelines de datos de voz para entrenamiento: la capacidad de procesar 128 chunks en paralelo con el decodificador ANE de `fast/` acelera la generacion de transcripciones a escala.
- Accesibilidad en dispositivos Apple: la ejecucion en ANE con un pico de memoria de cliente y memoria neuronal atribuida de aproximadamente 1,29 GB en `quality/` hace viable integrarlo en apps de macOS 27 o iOS 27 para personas con discapacidad auditiva.
- Aplicaciones de voz en tiempo real en el ecosistema Apple: la arquitectura TDT con estado recurrente independiente por chunk permite transcribir flujos continuos dividiendolos en segmentos, aunque la ejecucion en telefono no ha sido cualificada por el autor.

## Benchmarks y rendimiento

Rendimiento medido en un MacBook Air M3 (16 GB) con macOS 27 build 26A428, medianas de tres ejecuciones tras calentamiento, incluyendo frontend, encoder, rescalado en host y decodificacion. Audio de prueba: discurso "We choose to go to the Moon" de JFK, en un extracto de 20 segundos y en la grabacion completa de 18 minutos y 15 segundos.

| Paquete | Duracion del audio | Transcripcion | Audio / tiempo transcurrido |
|---|---:|---:|---:|
| fast | 20 s | 0,129 s | 155,5x |
| fast | 18 min 15 s | 1,942 s | 563,9x |
| quality | 20 s | 0,189 s | 106,0x |
| quality | 18 min 15 s | 7,973 s | 137,4x |

WER normalizado estilo Whisper frente a la referencia de la grabacion larga:

| Paquete / referencia | Errores de palabra | WER |
|---|---:|---:|
| fast | 79/2220 | 3,56% |
| Fuente FP32, mismos cortes de 15 s | 77/2220 | 3,47% |
| quality | 81/2220 | 3,65% |
| Fuente FP32, mismos cortes de cuatro minutos | 96/2220 | 4,32% |

Con la normalizacion mas simple del benchmark, `fast` obtiene 95/2219 frente a 94/2219 de su fuente, y `quality` 91/2219 frente a 107/2219 de su fuente. El autor advierte que se trata de una sola grabacion en ingles y no de una clasificacion general de precision. En fidelidad numerica, las dos formas de `quality` producen salidas identicas en el fixture de 20 segundos, con un error RMS relativo de encoder del 2,52% frente a FP32, mientras que `fast` mide 2,99% en un fixture de 15,35 segundos; en muestras adicionales de aleman y ucraniano ambos paquetes reproducen exactamente los tokens fuente, con errores de encoder entre 2,33% y 3,60%. La cuantizacion y el orden de las operaciones en coma flotante pueden cambiar decisiones de token, incluido un nombre propio en el fixture ingles de `quality`.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon fisico, sobre macOS 27 o iOS 27; no hay soporte para GPU NVIDIA, AMD ni para CPU x86.
- Memoria: pico medido de memoria de cliente mas memoria neuronal atribuida de aproximadamente 1,29 GB en `quality/`, excluyendo memoria no atribuida de compilador, driver y sistema.
- Equipo de referencia cualificado: MacBook Air M3 con 16 GB, macOS 27 build 26A428. No cabe plantearlo en GPU de consumo tipo RTX 4090 porque el formato `.aimodel` no se ejecuta en CUDA.
- Despliegue: runtime Core AI con CoreAIKit (`GraphModel`) y un anfitrion especifico del modelo; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Tiempos de preparacion: `fast/` tarda 34 s en la primera especializacion por dispositivo y entre 0,10 y 0,21 s en preparaciones cacheadas posteriores; `quality/` requiere 5 min 32 s para el encoder y 32 s para el subsampling, y entre 0,02 y 0,05 s en cache.
- Latencia y throughput: 155,5x a 563,9x tiempo real con `fast/` y 106,0x a 137,4x con `quality/`, segun la duracion del audio (vease la tabla de benchmarks).
- La ejecucion en telefono no ha sido cualificada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coder543/parakeet-v3-coreai | 600 M | 15 s (`fast/`), 45 s y 4 min (`quality/`) por chunk | Grafos `.aimodel`, ANE Apple Silicon | cc-by-4.0 | HuggingFace, 0 descargas, 0 likes |
| nvidia/parakeet-tdt-0.6b-v3 | 600 M | Aproximadamente 29 s de clip; 25 idiomas europeos | Pesos upstream (referencia FP32 usada como oraculo) | cc-by-4.0 | HuggingFace, oficial de NVIDIA |
| NexaAI/parakeet-tdt-0.6b-v3-ane | 600 M | No disponible | Conversion para ANE | No disponible | HuggingFace |

No se dispone de datos de benchmarks comparativos publicados entre estas variantes en la informacion proporcionada; el unico contraste numerico disponible es el del propio autor frente a los pesos FP32 upstream, recogido en la seccion anterior.

## Limitaciones y advertencias

- No es un modelo de NVIDIA ni cuenta con su respaldo: se trata de una conversion de terceros.
- Requiere Apple Silicon fisico y macOS 27 o iOS 27, ademas de un runtime anfitrion especifico del modelo; no funciona con runtimes ASR convencionales.
- Los grafos no aceptan archivos de audio: el anfitrion debe implementar el frontend, el bucle greedy TDT y el tokenizador segun los metadatos y sidecars.
- En `quality/` es obligatorio aplicar `subsampling_output_scale` = 16 antes de pasar la salida del subsampling al encoder; introducirla directamente produce resultados incorrectos.
- Riesgo de divergencia por cuantizacion: el orden de las operaciones en coma flotante puede alterar decisiones de token, como un nombre propio detectado en el fixture ingles de `quality`.
- Las mediciones de WER proceden de una unica grabacion en ingles (18 min 15 s) y no constituyen una clasificacion general de precision; los chequeos en aleman y ucraniano son muestras puntuales y no establecen la precision en todos los idiomas soportados.
- La precision de los limites de palabra generados no fue evaluada por humanos, aunque las marcas de tiempo son ordenadas, acotadas y preservan el texto.
- Contexto limitado por chunk: `fast/` trabaja con segmentos de 15 s y `quality/` con segmentos de 240 s; el contexto mas largo no mejoro el WER en la grabacion inglesa medida, segun el propio autor.
- La ejecucion en telefono no ha sido cualificada y las trazas de memoria excluyen memoria no atribuida de compilador, driver y sistema.
- Uso comercial permitido bajo cc-by-4.0, que exige atribucion a NVIDIA y al autor de la conversion; deben consultarse los archivos LICENSE y NOTICE del repositorio.
- Con 0 descargas y 0 likes, no existe validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coder543/parakeet-v3-coreai
- Modelo base upstream: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio de recetas Core AI de Apple: https://github.com/apple/coreai-models/tree/main/models/parakeet
- Fork de recetas Core AI (conscious-engines): https://github.com/conscious-engines/ce-coreai-models/tree/main/models/parakeet
- Conversion alternativa para ANE: https://huggingface.co/NexaAI/parakeet-tdt-0.6b-v3-ane
- Referencia del benchmark de transcripcion: https://github.com/coder543/stt-bench-matrix/blob/4689df1aec5dd0e96b223caf3a9a176675c10fa5/samples/jfk_rice_16k.txt
- Licencia Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/
- Ficha en el Core AI model zoo: https://john-rocky.github.io/coreai-model-zoo/models/parakeet/
