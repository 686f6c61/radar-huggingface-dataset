# Gramscii-IT/parakeet-tdt-0.6b-v3-GGUF

## Resumen

Parakeet TDT 0.6B v3 es un modelo de reconocimiento automático de voz (ASR) desarrollado por NVIDIA, especializado en transcripción con marcas temporales a nivel de palabra. Este repositorio concreto, publicado por Gramscii-IT, redistribuye la conversión GGUF en cuantización Q8_0 realizada por mudler, sin reconversión alguna: el archivo es byte-idéntico al publicado en `mudler/parakeet-cpp-gguf`. El modelo cubre 25 idiomas europeos y está pensado para integrarse en aplicaciones de transcripción en tiempo real o por lotes mediante el runtime `parakeet.cpp`.

La relevancia actual del modelo radica en su equilibrio entre tamaño (627 millones de parámetros, 897 MB en Q8_0) y rendimiento: alcanza una velocidad 95 veces superior al tiempo real en hardware Apple Silicon, produce marcas temporales estables y no requiere indicación explícita del idioma, ya que lo infiere del propio audio. Su licencia CC-BY-4.0 permite uso comercial con atribución, lo que lo convierte en una opción atractiva frente a alternativas propietarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con decodificador TDT (token-and-duration transformer) |
| Parametros totales | 627.090.582 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (procesa audio continuo, sin ventana fija declarada) |
| Tipos de cuantizacion | Q8_0 (este repo); el upstream publica f16, q8_0, q6_k, q5_k y q4_k |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk (25 idiomas europeos) |
| Licencia | CC-BY-4.0 (heredada de NVIDIA) |
| Formato de pesos | GGUF (archivo único `tdt-0.6b-v3-q8_0.gguf`, 940.663.680 bytes) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA, `parakeet-tdt-0.6b-v3`, es un sistema ASR híbrido que combina un encoder basado en conformer con un decodificador TDT (token-and-duration transformer). El checkpoint se anuncia como `hybrid_tdt_ctc`, pero solo incluye la cabeza TDT, que es la responsable de generar las marcas temporales a nivel de palabra; por eso el decodificador CTC no funciona con este archivo. La conversión a GGUF fue realizada por mudler a partir del checkpoint de NeMo, y este repositorio la redistribuye sin modificaciones.

No se dispone de información pública sobre los datos de entrenamiento (número de horas de audio, composición del dataset, técnicas de aumento) ni sobre el proceso de entrenamiento (si hubo fine-tuning adicional, etc.). La model card del repositorio solo documenta mediciones de rendimiento propias, no detalles del entrenamiento original.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con detección automática del idioma a partir del audio (no requiere flag de idioma).
- Generación de marcas temporales a nivel de palabra con precisión de 80 ms (frame_sec = 0.08), incluyendo confianza por palabra y por token.
- Salida en formato JSON estructurado con texto completo, lista de palabras (con inicio, fin y confianza) y lista de tokens.
- Compatibilidad con el runtime `parakeet.cpp` v0.5.0 o superior, que ofrece binarios precompilados para macOS, Linux y Windows.
- Modo servidor OpenAI-compatible (`parakeet-server`) para integración con aplicaciones existentes.
- Ejecución byte-determinística: tres ejecuciones idénticas producen el mismo JSON, incluyendo marcas temporales y confianzas.
- Rendimiento en tiempo real: 95x más rápido que el tiempo real en Apple M4 Pro (59 minutos de audio en 37 segundos).

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones largas (una hora) con marcas temporales precisas, lo que permite indexar y buscar contenido por palabra hablada. Su velocidad 95x hace viable la transcripción en vivo o casi en tiempo real.
- Subtitulación automática de vídeos: las marcas temporales a nivel de palabra permiten generar subtítulos sincronizados sin postprocesado adicional. El soporte de 25 idiomas europeos cubre un amplio rango de contenidos.
- Análisis de llamadas de atención al cliente: la salida JSON con confianzas por palabra facilita el análisis de sentimiento y la extracción de entidades en centros de contacto, con integración mediante el endpoint OpenAI-compatible.
- Asistentes de voz y dictado: al ser un modelo ligero (897 MB) y rápido, puede ejecutarse en dispositivos con GPU moderada o incluso en CPU (aunque la velocidad en CPU no está medida), habilitando dictado local sin conexión.
- Archivado y búsqueda de contenido audiovisual: la transcripción con timestamps permite crear índices de búsqueda sobre archivos de audio o vídeo, útil para bibliotecas, podcasts o material educativo.
- Investigación lingüística y fonética: las marcas temporales y las confianzas por token proporcionan datos cuantitativos sobre la pronunciación y la fluidez, útiles para estudios de dialectos o análisis de habla espontánea.

## Benchmarks y rendimiento

La model card del repositorio incluye mediciones propias realizadas en Apple M4 Pro (64 GB, Metal) con `parakeet.cpp` v0.5.0. No se han publicado resultados en benchmarks estándar de ASR (como WER en LibriSpeech o Common Voice). La siguiente tabla resume las mediciones de drift entre cuantizaciones, tomando f16 como referencia:

| Archivo | Tamano | Memoria pico | Drift en habla clara | Drift en habla dificil | Tiempo |
|---|---|---|---|---|---|
| f16 | 1374 MB | 2790 MB | referencia | referencia | 2.28 s |
| q8_0 | 897 MB | 1836 MB | 0.00 % | 1.58 % | 2.16 s |
| q6_k | 775 MB | 1592 MB | 0.24 % | 2.46 % | 2.23 s |
| q5_k | 707 MB | 1457 MB | 1.43 % | 5.81 % | 2.17 s |
| q4_k | 644 MB | 1330 MB | 3.09 % | 7.57 % | 2.20 s |

Además, se reporta que la velocidad es 95x superior al tiempo real, que las marcas temporales no se desvían en grabaciones largas (error de 10 ms en una hora) y que la ejecución es byte-determinística. No hay datos comparativos con otros modelos ASR en la información disponible.

## Requisitos de hardware

- El archivo GGUF Q8_0 ocupa 897 MB en disco; la memoria pico medida en una grabación corta es de 1.84 GB, y de 6.28 GB para una hora completa de audio (la memoria escala con la duración del audio, no con el tamaño del modelo).
- Se ha probado en Apple M4 Pro con Metal; en este hardware los hilos no afectan al rendimiento (1, 4 y 8 hilos difieren menos del 3 %), lo que indica que la carga recae en la GPU.
- No se han publicado mediciones en GPU NVIDIA o AMD, ni en CPU sin aceleración. Dado el tamaño del modelo, es plausible que quepa en GPUs de consumo con al menos 4 GB de VRAM, pero no hay datos confirmados.
- Opciones de despliegue: `parakeet-cli` para transcripción por lotes y `parakeet-server` para un endpoint OpenAI-compatible. Ambos requieren `parakeet.cpp` v0.5.0 o superior, con binarios precompilados para macOS, Linux y Windows.
- La entrada debe ser audio WAV mono a 16 kHz; no se soportan otros formatos directamente.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos ASR en la documentación proporcionada. El modelo original de NVIDIA se puede comparar con alternativas como Whisper (de OpenAI) o Wav2Vec2, pero no hay datos de rendimiento relativos en este repositorio. La única comparación interna es entre cuantizaciones del mismo modelo, ya presentada en la sección de benchmarks. Por tanto, la comparativa con modelos similares se considera no disponible.

## Limitaciones y advertencias

- El modelo solo incluye la cabeza TDT; el decodificador CTC no funciona con este archivo, por lo que no se puede utilizar como un sistema híbrido completo.
- La entrada está restringida a WAV mono de 16 kHz; otros formatos requieren conversión previa.
- La memoria consumida crece con la duración del audio: una hora de audio requiere unos 6.28 GB de RAM/VRAM, lo que puede ser problemático en dispositivos con poca memoria. Se recomienda segmentar el audio para máquinas pequeñas.
- No se han medido velocidades en CPU sin aceleración; el rendimiento en hardware sin GPU es desconocido.
- La licencia CC-BY-4.0 exige atribución a NVIDIA (y a los autores de la conversión) en cualquier redistribución o uso público.
- No se han publicado métricas de error (WER) en conjuntos de referencia estándar, por lo que la precisión en condiciones de ruido o acentos no está cuantificada.
- El modelo está entrenado para 25 idiomas europeos; no cubre idiomas fuera de ese conjunto, y la detección automática de idioma puede fallar en habla muy mezclada o con acentos extremos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gramscii-IT/parakeet-tdt-0.6b-v3-GGUF
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión GGUF de mudler: https://huggingface.co/mudler/parakeet-cpp-gguf
- Runtime parakeet.cpp: https://github.com/mudler/parakeet.cpp
