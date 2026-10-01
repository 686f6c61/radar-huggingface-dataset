# coder543/phonon-2-coreai-experimental

## Resumen

Phonon-2 · experimental Core AI bundles es un conjunto de tres conversiones experimentales del modelo de reconocimiento automatico del habla Phonon-2, desarrollado por Fermion Research, adaptadas por el usuario coder543 para ejecutarse sobre Apple silicon mediante las APIs publicas de Core AI en macOS e iOS 27. El modelo subyacente es un FastConformer/TDT con un encoder muy pesado, derivado de NVIDIA Parakeet V3, y estas conversiones conservan los pesos de encoder entrenados (codificados en paletas de cinco valores) y los valores originales del decodificador en INT6, empleando activaciones en FP16.

La relevancia de esta publicacion es de ingenieria: demuestra que un modelo ASR de alta calidad puede ejecutarse integramente en la Neural Engine (ANE) de un Mac o un iPhone con latencias muy bajas y huella de memoria reducida. Sobre un MacBook Air M3, la variante recomendada LUT6 transcribe el discurso completo de 18 minutos y 15 segundos de John F. Kennedy en 2,461 segundos (445,0x de tiempo real), frente a los 12,668 segundos (86,5x) del runtime MLX por defecto del publicador. La precision se mantiene: un WER de 2,93% en ese audio, identico al de una reconstruccion independiente en FP32.

El modelo esta pensado para el idioma ingles, se distribuye bajo licencia CC-BY-4.0 y no sigue los formatos habituales de pesos (safetensors o GGUF), sino que se empaqueta como activos nativos de Core AI con directorios propios de metadatos, vocabulario y decodificador compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer/TDT (encoder-heavy), derivada de NVIDIA Parakeet V3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; segmentacion basada en pausas de 25-35 s (objetivo 30 s) |
| Tipos de cuantizacion | Paletas LUT6 (6 bits) y LUT4 (4 bits) en el encoder; decodificador INT6; activaciones FP16; variante "size" expandida a FP16 |
| Idiomas soportados | Ingles (en), unico idioma cualificado |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Activos Core AI (.aimodel) con metadata.json, runtime.json, vocabulario y decodificador compacto; archivos LZRAVEN para distribucion |

## Arquitectura y entrenamiento

Phonon-2 es un modelo de reconocimiento automatico del habla con arquitectura FastConformer combinada con decodificacion TDT (Token-and-Duration Transducer), con un encoder muy pesado y un decodificador compacto. Deriva de NVIDIA Parakeet V3. Las conversiones de coder543 preservan los pesos de encoder entrenados, codificados en paletas de cinco valores, y los valores originales del decodificador en INT6, usando activaciones en FP16. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica principal de esta publicacion es la cuantizacion mediante paletas (lookup tables) especificas para la Neural Engine: LUT6 comparte paletas de seis bits exactas entre ocho filas y LUT4 comparte paletas de cuatro bits entre dos filas, mientras que la variante "size" conserva los registros de encoder empaquetados originales y los expande a tensores FP16 en tiempo de carga. La politica de segmentacion se basa en pausas (25-35 segundos, objetivo 30) y preserva todo el audio. Core AI especializa los activos .aimodel en el propio dispositivo; los archivos distribuidos contienen activos portables de origen, no caches del dispositivo. Las trazas completas muestran 493 predicciones en la ANE y cero intervalos de GPU en el proceso objetivo: 259 predicciones durante el submuestreo y la codificacion, y 234 durante la decodificacion por lotes.

## Capacidades

- Transcripcion de voz a texto en ingles con calidad de produccion (WER de 2,93% en el audio de referencia).
- Retorno de marcas de tiempo nativas a nivel de palabra, finitas y ordenadas dentro de cada fragmento.
- Procesamiento de audio largo: el discurso completo de 18 minutos y 15 segundos se resuelve en una sola pasada con planificacion de fragmentos.
- Ejecucion integra en la Neural Engine de Apple silicon, con soporte cualificado en Mac M3 y iPhone 15 Pro Max (A17 Pro).
- Tres variantes con distintos compromisos de tamano de descarga, memoria de trabajo y velocidad de inferencia (LUT6, LUT4 y enfocada a tamano).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, ya que es un modelo ASR.
- No se documentan capacidades de vision, audio generativo ni otros idiomas distintos del ingles.

## Casos de uso

- Transcripcion de reuniones largas en local: la variante LUT6 procesa audios de mas de 18 minutos con 445,0x de tiempo real en un Mac M3, lo que permite transcribir una reunion de una hora en menos de diez segundos de computo efectivo.
- Subtitulado automatico en macOS: las marcas de tiempo nativas a nivel de palabra permiten generar subtitulos sincronizados sin necesidad de un alineador externo.
- Notas de voz en iPhone: con 3,075 segundos para el discurso completo en un iPhone 15 Pro Max y 1,03 GB de memoria, la variante LUT6 es viable para transcripcion en el propio dispositivo en una aplicacion iOS 27.
- Procesamiento por lotes de archivos de audio en servidores Apple: la baja memoria (entre 0,90 y 2,18 GB segun variante) permite ejecutar varias instancias concurrentes en un unico Mac.
- Archivado y busqueda de contenido audiovisual: la elevada tasa RTFx permite indexar grandes volumenes de grabaciones en ingles para busqueda por texto.
- Aplicaciones de accesibilidad: dictado y transcripcion en tiempo real en dispositivos Apple sin enviar audio a la nube, lo que reduce riesgos de privacidad.
- Integracion en pipelines de transcripcion existentes: al devolver marcas de tiempo y texto normalizado compatible con el normalizador ingles de Whisper, se puede encadenar con herramientas de post-procesado.

## Benchmarks y rendimiento

Rendimiento medido en MacBook Air M3, 16 GB, macOS 27.0.1 (medianas de tres ejecuciones tras preparacion y calentamiento; incluye frontend, encoder y decodificacion, excluye carga, lectura de archivos y planificacion de fragmentos):

| Variante | Extracto de 20 s | Discurso completo | RTFx (completo) | Memoria en pasada completa |
|---|---:|---:|---:|---:|
| LUT6 | 0,251 s | 2,461 s | 445,0x | 1,05-1,20 GB |
| LUT4 | 0,330 s | 4,470 s | 245,0x | 0,90 GB |
| Enfocada a tamano | 0,365 s | 5,335 s | 205,3x | 2,18 GB |
| MLX por defecto del publicador | 0,231 s | 12,668 s | 86,5x | 11,34 GB |

Rendimiento en iPhone 15 Pro Max, A17 Pro, iOS 27.0.1, build Release (incluye lectura WAV acotada, planificacion de fragmentos, frontend, encoder y decodificacion; excluye preparacion y serializacion del informe):

| Variante | Extracto de 20 s | Discurso completo | RTFx (completo) | Memoria en pasada completa |
|---|---:|---:|---:|---:|
| LUT6 | 0,321 s | 3,075 s | 356,2x | 1,03 GB |
| LUT4 | 0,370 s | 5,349 s | 204,8x | 0,90 GB |
| Enfocada a tamano | no medido | no medido | no medido | no medido |

Tiempos de preparacion observados:

| Variante | Primera preparacion (M3) | Preparacion en cache (M3) | Primera preparacion (iPhone) |
|---|---:|---:|---:|
| LUT6 | 104,2 s | 0,35 s | 72,6 s |
| LUT4 | 179,1 s | 0,18-0,66 s | 243,1 s |
| Enfocada a tamano | 49,7 s | 3,56-3,59 s | no medido |

Precision: el WER del discurso completo es de 2,93% con el normalizador ingles de Whisper (65 errores sobre 2.220 palabras de referencia), igual a la secuencia de palabras normalizada de una reconstruccion independiente en FP32. Los valores por defecto de MLX del publicador obtienen 3,02%. Se trata de una unica grabacion, no de una clasificacion general de precision. Las marcas de tiempo a nivel de palabra son finitas, ordenadas y quedan dentro de cada fragmento, pero su precision frente a fronteras humanas no se ha medido de forma independiente; la variante enfocada a tamano desplaza ocho intervalos de palabra del discurso completo respecto a las variantes de paleta, como maximo 160 ms, sin cambiar la transcripcion.

## Requisitos de hardware

- Plataformas cualificadas: Mac con Apple M3 (y familia M, segun el publicador) con macOS 27, e iPhone 15 Pro Max (A17 Pro) con iOS 27; la variante enfocada a tamano solo esta cualificada en Mac.
- Memoria en pasada completa (Mac M3): 1,05-1,20 GB (LUT6), 0,90 GB (LUT4) y 2,18 GB (enfocada a tamano).
- Memoria en pasada completa (iPhone 15 Pro Max): 1,03 GB (LUT6) y 0,90 GB (LUT4).
- No se documentan requisitos ni rendimiento en GPU NVIDIA o AMD; el modelo esta orientado a la Neural Engine de Apple silicon. Los datos de VRAM para A100, H100 o RTX 4090 no estan disponibles.
- Opciones de despliegue: activos Core AI (.aimodel) especializados en el dispositivo, con metadata.json, runtime.json, vocabulario y decodificador compacto. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de Core AI).
- Tamano de descarga: repositorio total de 1,8 GB; archivos LZRAVEN de 283,2 MB (LUT6), 235,0 MB (LUT4) y 178,6 MB (enfocada a tamano); tamaños descomprimidos de 583,4 MB, 438,6 MB y 217,2 MB respectivamente.
- Latencia y throughput: RTFx de 445,0x (LUT6), 245,0x (LUT4) y 205,3x (enfocada a tamano) en Mac M3; 356,2x y 204,8x en iPhone 15 Pro Max para LUT6 y LUT4. El coste de la primera preparacion es elevado (hasta 243,1 s en iPhone para LUT4) y se amortiza en ejecuciones posteriores con cache (0,18-3,59 s).

## Comparativa con modelos similares

Comparacion entre las variantes incluidas en esta publicacion y el runtime de referencia del publicador. No se dispone de datos comparativos de otros modelos ASR en la informacion proporcionada.

| Modelo | Arquitectura | RTFx (discurso completo, M3) | WER | Memoria (M3) | Licencia |
|---|---|---:|---:|---:|---|
| Phonon-2 Core AI LUT6 | FastConformer/TDT sobre Core AI/ANE | 445,0x | 2,93% | 1,05-1,20 GB | CC-BY-4.0 |
| Phonon-2 Core AI LUT4 | FastConformer/TDT sobre Core AI/ANE | 245,0x | 2,93% | 0,90 GB | CC-BY-4.0 |
| Phonon-2 Core AI enfocada a tamano | FastConformer/TDT sobre Core AI/ANE | 205,3x | 2,93% | 2,18 GB | CC-BY-4.0 |
| Phonon-2 MLX por defecto (publicador) | FastConformer/TDT sobre MLX | 86,5x | 3,02% | 11,34 GB | no disponible |
| NVIDIA Parakeet V3 | FastConformer/TDT | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor; no es una version estable ni con soporte de mantenimiento garantizado.
- Unicamente el ingles esta cualificado; no se documentan otros idiomas.
- Los datos de precision proceden de una sola grabacion (el discurso de JFK), por lo que no constituyen una clasificacion general de rendimiento; el propio autor lo advierte de forma explicita.
- Las marcas de tiempo a nivel de palabra no se han validado de forma independiente frente a fronteras humanas; la variante enfocada a tamano desplaza ocho intervalos hasta 160 ms.
- La primera preparacion del modelo en el dispositivo es costosa (de 49,7 s a 243,1 s segun plataforma y variante) y el rendimiento medido corresponde a ejecuciones en cache.
- Requiere macOS o iOS 27 y las APIs publicas de Core AI; no se documentan alternativas de despliegue fuera del ecosistema Apple.
- La variante enfocada a tamano solo esta cualificada en Mac y expande unos 1,21 GB de tensores FP16 del encoder en carga.
- Riesgo de alucinacion y errores de transcripcion propio de cualquier modelo ASR; el WER de 2,93% implica aproximadamente 65 errores sobre 2.220 palabras de referencia en el audio evaluado.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya correctamente; incluye archivos de licencia y atribucion en cada directorio.
- No se documentan sesgos especificos ni limitaciones de contexto adicionales; el tratamiento de audio se segmenta por pausas de 25-35 segundos.
- Las conversiones solo estan cualificadas en hardware y versiones de sistema muy concretos (M3 y iPhone 15 Pro Max); el comportamiento en otros dispositivos Apple no esta verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/coder543/phonon-2-coreai-experimental
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2
- Fermion Research: https://huggingface.co/FermionResearch
- No se han encontrado en la busqueda web enlaces relevantes (papers, blogs o repos) sobre este modelo; los resultados devueltos no guardan relacion con el contenido.
