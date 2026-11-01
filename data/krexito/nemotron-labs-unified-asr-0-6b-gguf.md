# krexito/nemotron-labs-unified-asr-0.6b-GGUF

## Resumen

Nemotron Labs Unified ASR 0.6B GGUF es una conversión no oficial al formato GGUF del modelo de reconocimiento automático del habla `nvidia/nemotron-labs-unified-asr-0.6b`, publicada por el usuario krexito. El modelo original lo desarrolla NVIDIA dentro de su línea Nemotron Labs y está pensado para transcripción de audio a texto en inglés y varios idiomas europeos. Esta versión concreta, cuantizada en Q8_0, está empaquetada específicamente para el runtime audio.cpp, no para llama.cpp.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa compacta (0,6 mil millones de parámetros) para ASR en entornos con recursos limitados; por otro, advierte de una dependencia crítica, ya que el soporte de la familia `nemotron_unified_asr` en audio.cpp está propuesto en un pull request y no forma parte todavía de las versiones upstream, por lo que el archivo no carga en las releases actuales.

La información disponible es escasa: la model card del repositorio se limita a describir el proceso de conversión, el uso mediante la CLI de audio.cpp, una validación frente a NeMo 3.0.0 y las limitaciones conocidas. No se publican detalles sobre la arquitectura interna del modelo base, el dataset de entrenamiento ni resultados de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de NVIDIA; la model card no describe la arquitectura) |
| Parámetros totales | 0,6 mil millones (según el nombre del modelo) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (única incluida en este repositorio) |
| Idiomas soportados | en, es, de, fr, pt, it, pl (probados por el autor); detección automática disponible |
| Licencia | OpenMDW License Agreement 1.1 (`openmdw-1.1`) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `nvidia/nemotron-labs-unified-asr-0.6b` en la documentación proporcionada. La model card únicamente indica que el checkpoint original soporta modo streaming y que esta conversión a audio.cpp es offline. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica documentada en este repositorio es la propia conversión: se parte de un archivo `.nemo` (revisión `023ce907267a09a308a5cb69239447cb3d0c1597`, SHA-256 `1718cc1b44fb8597b2356328d706a8d89f31c389ca6f2256c2e3f743c0246936`) y se genera un GGUF Q8_0 compatible con audio.cpp. La validación realizada por el autor compara las transcripciones de este GGUF con las del runtime NeMo 3.0.0 sobre 15 clips públicos: el original en F32 coincide en 15/15 clips (0 de 945 palabras distintas), mientras que el Q8_0 coincide en 12/15 clips con 8 de 945 palabras distintas. El autor cita ejemplos concretos de divergencia, como `Foi,` convertido en `Fosse,` y `spanos e dilatou maravillosa` convertido en `spanoza`.

## Capacidades

- Reconocimiento automático del habla (ASR) offline: transcripción de audio a texto en formato de archivo.
- Detección automática de idioma si se omite el parámetro `--language`; también admite forzar el idioma con códigos cortos (`en`, `es`, `de`, etc.).
- Soporte multilingüe probado en inglés, español, alemán, francés, portugués, italiano y polaco.
- Salida de transcripción a archivo de texto mediante `--text-out`.
- Ejecución en CPU con backend `cpu` y control del número de hilos (`--threads`).
- No soporta streaming en esta variante (el checkpoint original sí).
- No soporta etiquetado de hablantes (speaker diarization).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: con 0,6B parámetros y ejecución en CPU, permite transcribir grabaciones cortas en equipos sin GPU, forzando el idioma con `--language es` para evitar errores de detección en audios con ruido.
- Subtitulado de contenido audiovisual multilingüe: el soporte de siete idiomas europeos y la detección automática permiten procesar clips en distintos idiomas dentro de un mismo pipeline, generando archivos de texto listos para revisión humana.
- Archivado y búsqueda de audio corporativo: transcripción por lotes de grabaciones históricas divididas en segmentos cortos, dado que el consumo de tiempo y memoria crece más rápido que la duración del audio.
- Prototipado de asistentes de voz en entornos con recursos limitados: al caber en CPU con un pico de RSS de aproximadamente 1,1 GiB para clips de 16 segundos, es viable en portátiles y servidores modestos sin GPU.
- Investigación y evaluación de runtimes: sirve como caso de prueba para el soporte de `nemotron_unified_asr` en audio.cpp, comparando transcripciones frente a NeMo 3.0.0 con las métricas de coincidencia documentadas.
- Procesamiento de audio en entornos air-gapped: al ser una inferencia totalmente offline y local, encaja en organizaciones que no pueden enviar audio a servicios en la nube por requisitos de privacidad.
- Transcripción de entrevistas y material de campo en ciencias sociales: la ejecución en CPU con hilos configurables facilita el despliegue en estaciones de trabajo de investigación sin aceleradores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech u otros) en la información disponible. La única validación documentada es la comparación de transcripciones frente a NeMo 3.0.0:

| Pesos | Transcripciones idénticas | Palabras distintas |
|---|---:|---:|
| F32 (no incluido en este repositorio) | 15/15 | 0 de 945 |
| Q8_0 (este archivo) | 12/15 | 8 de 945 |

Rendimiento medido por el autor con 4 hilos de CPU (el tiempo de pared excluye la carga del modelo):

| Clip | Tiempo de pared por sesión | Pico de RSS |
|---|---|---|
| 16,3 s | 0,76–0,84 s | 1159 MiB |
| 235 s | 22,4–23,4 s | 3701 MiB |

## Requisitos de hardware

- VRAM: no aplica en la configuración probada; la inferencia se ejecuta en CPU. El pico de memoria residente medido es de aproximadamente 1,1 GiB para un clip de 16,3 s y de aproximadamente 3,7 GiB para un clip de 235 s.
- GPU recomendadas: no disponible; el autor solo ha probado el backend de CPU.
- GPU de consumo: no confirmado. El modelo está pensado para CPU, por lo que no se documenta compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: exclusivamente audio.cpp con soporte de la familia `nemotron_unified_asr` (propuesto en un pull request, no incluido en upstream). No es compatible con llama.cpp ni se documentan vLLM, Ollama o TGI.
- Latencia y throughput: aproximadamente 0,76–0,84 s para 16,3 s de audio y 22,4–23,4 s para 235 s de audio con 4 hilos de CPU, lo que supone un factor en tiempo real de aproximadamente 20x y 10x respectivamente en esas pruebas.
- Plataforma validada: solo Linux x86-64 con backend de CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia mínima, se puede contrastar con el checkpoint original del que deriva:

| Modelo | Parámetros | Formato | Streaming | Runtime | Licencia |
|---|---|---|---|---|---|
| krexito/nemotron-labs-unified-asr-0.6b-GGUF (este) | 0,6B | GGUF Q8_0 | No | audio.cpp (PR pendiente) | OpenMDW 1.1 |
| nvidia/nemotron-labs-unified-asr-0.6b | 0,6B | `.nemo` | Sí | NeMo | OpenMDW 1.1 |

No se han identificado en la información disponible otras alternativas de ASR con las que comparar parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- El archivo no carga en las versiones actuales de audio.cpp: requiere una compilación con soporte de `nemotron_unified_asr`, disponible solo en un pull request no fusionado.
- No es compatible con llama.cpp ni con los runtimes habituales de GGUF; el formato GGUF aquí es específico de audio.cpp.
- Solo funciona en modo offline; no soporta streaming, a diferencia del checkpoint original.
- No soporta etiquetado de hablantes.
- El tiempo y la memoria crecen más rápido que la duración del audio, por lo que es necesario dividir grabaciones largas.
- La cuantización Q8_0 introduce divergencias respecto al modelo en F32: 8 palabras distintas de 945 en la validación del autor, con errores como `Foi,` → `Fosse,` y `spanos e dilatou maravillosa` → `spanoza`.
- Solo se ha probado en Linux x86-64 con backend de CPU y en siete idiomas; el rendimiento en otras plataformas o idiomas no está verificado.
- Es una conversión no oficial y no está afiliada a NVIDIA; la calidad del empaquetado no está respaldada por el desarrollador original.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Licencia OpenMDW 1.1: es necesario revisar `LICENSE.md` del repositorio de origen para confirmar las condiciones de uso comercial, ya que la model card no detalla restricciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/krexito/nemotron-labs-unified-asr-0.6b-GGUF
- Modelo base: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
