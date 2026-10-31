# audio-cpp/Magenta-RealTime-2-GGUF

## Resumen

Magenta RealTime 2 es un modelo de generación de música instrumental en tiempo real desarrollado por Google DeepMind, del cual audio-cpp ha publicado conversiones al formato GGUF para su ejecución con el runtime audio.cpp. El modelo genera audio estéreo a 48 kHz a partir de condicionamiento textual o de audio (transferencia de estilo), con control opcional de notas y percusión, tanto en modo offline como en streaming.

El repositorio incluye dos variantes: Small (230M de parámetros) y Base (2.4B), ambas empaquetadas junto con el códec SpectroStream, el codificador de estilo MusicCoCa, el mapper de texto, el cuantizador y el vocabulario, de modo que la inferencia no requiere Python ni recursos externos. Esto lo hace especialmente relevante para despliegues locales y en tiempo real, donde la implementación en C++ reduce drásticamente el consumo de VRAM (hasta 2 GiB para Small frente a más de 24 GiB con la implementación oficial en Python) y mejora el RTF (real-time factor).

Es un modelo pertinente ahora porque la generación musical local, sin depender de servicios en la nube, está en plena expansión, y esta conversión GGUF permite ejecutar un modelo de música de última generación en GPUs de consumo con latencias de streaming de decenas de milisegundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador de música con códec SpectroStream y codificador de estilo MusicCoCa (text-to-audio) |
| Parametros totales | 2.673.898.968 (variante Base); variante Small de 230M |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no aplicable (modelo de audio; duración configurable por frames de 40 ms) |
| Tipos de cuantizacion | F16 y Q8_0 (matrices del generador; códec, MusicCoCa, normalización, bias, escala y tensores sink permanecen en F32) |
| Idiomas soportados | no disponibles (condicionamiento por texto en inglés en los ejemplos) |
| Licencia | CC-BY-4.0 (pesos convertidos; el modelo original de Google es CC-BY-4.0; el código de audio.cpp es Apache-2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El sistema combina varios componentes: un generador autoregresivo de códigos de audio (con un vocabulario de 1.024 códigos válidos), el códec neuronal SpectroStream que reconstruye audio estéreo a 48 kHz, y MusicCoCa, un codificador conjunto de texto y audio que permite condicionar la generación tanto con descripciones textuales como con fragmentos de audio de referencia (transferencia de estilo, sin continuación del audio de entrada). Un mapper traduce el estilo textual al espacio de embeddings de audio. Se soporta además guía por notas (pianoroll de 128 estados de pitch por frame a 25 Hz) y control explícito de percusión.

Cada paquete GGUF es autocontenido: incluye generador, códec, codificador de estilo, mapper, cuantizador, vocabulario, configuración y especificación del modelo. La cuantización Q8_0 se aplica solo a las matrices del generador que lo admiten, manteniendo en F32 los componentes sensibles a la precisión (códec, MusicCoCa, normalizaciones). No se ha publicado información sobre el número de tokens de entrenamiento ni la composición del dataset del modelo original.

## Capacidades

- Generación de música instrumental estéreo a 48 kHz a partir de descripciones textuales (por ejemplo, "disco funk", "A gentle acoustic guitar with warm piano")
- Transferencia de estilo musical desde un archivo de audio de referencia (`--audio style.wav`), sin continuar la grabación original
- Control de notas mediante archivos pianoroll (JSON con 128 estados de pitch por frame a 25 Hz)
- Control explícito de percusión (con batería, sin batería o sin especificar)
- Guías de escala independientes para estilo, notas y batería (guidance de -1 a 7)
- Generación offline y streaming con bloques de audio de hasta 160 ms, con idéntico resultado final
- Muestreo configurable: temperatura (por defecto 1,3), top-k (por defecto 40, sobre 1.024 códigos), semilla
- Duración de salida configurable, redondeada a frames de 40 ms
- Ejecución multi-backend: CUDA, Vulkan y CPU

## Casos de uso

- Generación de música para videojuegos: el modo streaming con TTFA de ~21 ms (Small, en caliente) permite producir bandas sonoras adaptativas en tiempo real durante el juego, ajustando estilo mediante prompts.
- Bandas sonoras para vídeos y podcasts: generación offline de pistas instrumentales de duración arbitraria (frames de 40 ms) sin depender de bibliotecas con licencias restrictivas.
- Prototipado musical interactivo: los parámetros de temperatura, top-k y semilla permiten explorar variaciones deterministas y reproducibles de un mismo estilo.
- Transferencia de estilo para productores: condicionar con un fragmento de audio de referencia para obtener nuevas pistas instrumentales con el mismo carácter musical.
- Herramientas creativas en local sin nube: gracias al GGUF autocontenido, puede integrarse en aplicaciones de escritorio sin runtime de Python, ideal para apps de creación musical.
- Control fino de composición: mediante pianorolls JSON y control de batería, se pueden especificar melodías y arreglos concretos y dejar que el modelo genere el acompañamiento e instrumentación.
- Despliegue en hardware modesto: la variante Small Q8_0 requiere unos 2 GiB de VRAM, viable en GPUs de consumo e incluso portátiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, etc.) por tratarse de un modelo de audio. Los datos de rendimiento publicados por el autor de la conversión, medidos en una RTX 5090 con CUDA, ocho hilos de host y sesión persistente, son:

| Modelo | Runtime | Modo | RTF | VRAM pico (MiB) |
|---|---|---|---:|---:|
| Small | Python oficial | Generación oficial | 0,1359 | 24.626 |
| Small | audio.cpp F16 | Offline | 0,0861 | 2.146 |
| Small | audio.cpp F16 | Streaming | 0,0874 | 2.146 |
| Small | audio.cpp Q8_0 | Offline | 0,0833 | 1.954 |
| Small | audio.cpp Q8_0 | Streaming | 0,0831 | 1.954 |
| Base | Python oficial | Generación oficial | 0,3714 | 16.946 |
| Base | audio.cpp F16 | Offline | 0,2376 | 6.336 |
| Base | audio.cpp F16 | Streaming | 0,2335 | 6.336 |
| Base | audio.cpp Q8_0 | Offline | 0,1789 | 4.218 |
| Base | audio.cpp Q8_0 | Streaming | 0,1789 | 4.218 |

Tiempo hasta el primer bloque de audio (TTFA, streaming, CUDA):

| Modelo | Primera petición | Media en caliente |
|---|---:|---:|
| Small F16 | 218 ms | 22,1 ms |
| Small Q8_0 | 242 ms | 21,4 ms |
| Base F16 | 262 ms | 46,9 ms |
| Base Q8_0 | 267 ms | 38,4 ms |

## Requisitos de hardware

- VRAM estimada para inferencia (CUDA, RTX 5090):
  - Small Q8_0: ~1,9 GiB; Small F16: ~2,1 GiB
  - Base Q8_0: ~4,1 GiB; Base F16: ~6,2 GiB
  - Con la implementación oficial en Python: 16,9–24,6 GiB según variante
- GPUs recomendadas: cualquier GPU CUDA moderna; los datos publicados corresponden a una RTX 5090. También hay backends Vulkan y CPU, sin cifras publicadas para ellos.
- Consumer GPUs: sí. La variante Small cabe con holgura en GPUs de 4 GiB (por ejemplo RTX 3050 o superior) y la Base Q8_0 en GPUs de 6–8 GiB (RTX 3060, RTX 4060 Ti), según las cifras de VRAM pico publicadas.
- Despliegue: mediante el CLI de audio.cpp (`audiocpp_cli`), con backends CUDA, Vulkan o CPU; no requiere Python ni recursos externos. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue.
- Latencia y throughput: RTF de 0,083 (Small Q8_0) a 0,179 (Base Q8_0), es decir, generación más rápida que el tiempo real; TTFA en streaming de ~21 ms (Small) y ~38–47 ms (Base) en caliente.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Magenta RealTime 2 (este repo, GGUF) | 230M / 2,4B | Estéreo 48 kHz, streaming | GGUF | CC-BY-4.0 | RTF 0,08–0,24 en GPU de consumo; control de notas y batería |
| MusicGen (Meta, small/medium) | 300M / 1,5B / 3,3B | Mono 32 kHz, offline | safetensors | CC-BY-NC 4.0 (pesos) | Sin streaming en tiempo real nativo; uso no comercial en las variantes base |
| Stable Audio Open (Stability AI) | ~1,2B | Estéreo 44,1 kHz (hasta 47 s) | safetensors | Licencia propia no comercial | Orientado a samples y efectos; sin streaming |

Nota: la comparación se basa en características generales conocidas de estos modelos; los datos de rendimiento de MusicGen y Stable Audio Open no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Genera únicamente música instrumental: no produce voz cantada ni letras.
- El condicionamiento por audio transfiere estilo, pero no continúa la grabación de entrada.
- Cada petición genera música nueva desde cero; no hay continuación de sesiones previas más allá del streaming dentro de una misma petición.
- Los datos de rendimiento publicados corresponden exclusivamente a RTX 5090 con CUDA; el comportamiento en Vulkan o CPU no está cuantificado.
- La licencia CC-BY-4.0 del modelo permite uso comercial con atribución, pero deben consultarse los términos de uso del modelo original de Google, que siguen aplicando a los pesos convertidos.
- La cuantización Q8_0 afecta solo a las matrices del generador que lo admiten; no hay niveles de cuantización más agresivos (Q4, etc.) publicados.
- Al tratarse de una conversión de terceros (audio-cpp), el soporte depende del runtime audio.cpp, que está en desarrollo activo.
- No se ha publicado información sobre sesgos del modelo, riesgos de alucinación musical o calidad en géneros concretos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/audio-cpp/Magenta-RealTime-2-GGUF
- Modelo original: https://huggingface.co/google/magenta-realtime-2
- Commit de pesos upstream fijado: https://huggingface.co/google/magenta-realtime-2/tree/010aa0dcb0dfd27b24f0ad07b4dad63e8f9521cc
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Repositorio magenta-realtime (referencia del port): https://github.com/magenta/magenta-realtime/tree/694a545e4ba0b88bf1150137b129582166d3e07f
- Guía del modelo en audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/magenta_realtime_2.md
- Términos de uso del modelo original: https://huggingface.co/google/magenta-realtime-2/blob/010aa0dcb0dfd27b24f0ad07b4dad63e8f9521cc/README.md#terms-of-use
