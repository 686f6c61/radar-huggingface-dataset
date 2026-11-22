# loom-ai-org/moonshine-tiny-loom

## Resumen

Moonshine Tiny Loom es una exportación del modelo de reconocimiento automático de voz (ASR) `moonshine-ai/moonshine-tiny` de Useful Sensors al formato GGUF propio del motor loom.cpp, realizada por la organización loom-ai-org. El modelo original es un reconocedor de inglés de 27 millones de parámetros que combina un stem convolucional y un encoder sobre la forma de onda cruda con un decoder autorregresivo, una arquitectura pensada para transcripción de baja latencia en dispositivos con recursos limitados.

La exportación conserva los parámetros del modelo base en un único fichero GGUF autodescriptivo que incluye las topologías del grafo, el tokenizador y el script de driver necesarios para su ejecución con loom-py. Se distribuye en dos precisiones: F32 (110 MB) y q8_0 (31 MB), esta última con cuantización de los pesos de convolución y proyección.

El interés de esta ficha es doble: por un lado documenta un modelo ASR minúsculo apto para placas embebidas y edge computing; por otro, ilustra el ecosistema loom.cpp/loom-py como alternativa de despliegue a llama.cpp para modelos multimodales. La licencia MIT heredada del modelo base facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: stem convolucional + encoder sobre forma de onda cruda, decoder autorregresivo |
| Parametros totales | 27.093.793 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 194 tokens en el decoder; limite practico de 29,8 s de audio por llamada |
| Tipos de cuantizacion | F32 y q8_0 (cuantiza pesos de convolucion y proyeccion) |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (loom.cpp), un fichero por precision |
| Entrada de audio | Mono, float, 16 kHz |
| Decodificacion | Greedy, limitada a 6,5 tokens por segundo de audio |
| Tamano del repo | 0,4 GB |
| Libreria | loom-py-rt (PyPI), motor loom.cpp |
| Modelo base | moonshine-ai/moonshine-tiny |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine original de Useful Sensors: un stem convolucional que procesa directamente la forma de onda de audio a 16 kHz, seguido de un encoder transformer y un decoder autorregresivo que genera la transcripción token a token. Esta aproximación elimina el paso previo de extracción de features tipo mel-spectrogram, lo que reduce el coste computacional en inferencia y permite operar en dispositivos de muy baja potencia.

La exportación a loom.cpp no modifica los parámetros del modelo base: el fichero F32 es token por token idéntico a la transcripción de `transformers` en las 74 muestras de prueba. La variante q8_0 cuantiza únicamente los pesos de convolución y proyección, manteniendo la misma tasa de error de palabra (9,83%) que F32 y con 67 de 74 transcripciones idénticas a nivel de token. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens utilizados ni si hubo etapas de RLHF o ajuste fino supervisado; esos datos corresponden al modelo base y no se detallan en la información proporcionada.

La innovación técnica relevante en esta exportación es el formato GGUF autodescriptivo de loom.cpp, que embebe el grafo, el tokenizador y el driver de ejecución en un solo fichero, y el soporte de streaming mediante VAD externo (Silero VAD) que segmenta el audio en líneas de habla y reejecuta la pasada completa sobre cada línea modificada.

## Capacidades

- Transcripción de voz a texto en inglés sobre audio mono a 16 kHz.
- Procesamiento de clips de hasta 29,8 segundos por llamada; clips más largos se rechazan con error en lugar de truncarse.
- Decodificación greedy con tope de 6,5 tokens por segundo de audio para evitar bucles de alucinación.
- Streaming en vivo mediante integración con `silero-vad-loom`: el VAD corta el audio en líneas de habla y el modelo transcribe cada línea conforme llega.
- Ejecución en dos precisiones (F32 y q8_0) con calidad equivalente en términos de WER.
- API de alto nivel `model.speech2text.infer(audio)` y `model.speech2text.stream(vad=...)`, más acceso de bajo nivel vía `model.infer(...)` y `model.driver_source`.
- No soporta selección de idioma: el argumento `language=` se ignora con advertencia porque el decode no puede actuar sobre él.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción en dispositivos embebidos: el modelo q8_0 ocupa 31 MB y consume 103 MB de pico en una Raspberry Pi Zero W, lo que permite integrar ASR en placas ARMv6 sin SIMD para comandos de voz o notas dictadas.
- Subtitulado de clips cortos: para fragmentos de hasta 29,8 s, la API `speech2text.infer` devuelve la transcripción en una sola llamada con salida idéntica a `transformers` en F32, adecuada para pipelines de subtitulado por segmentos.
- Dictado por voz en aplicaciones de escritorio: la licencia MIT y el formato GGUF único simplifican la distribución del modelo dentro de aplicaciones que necesiten transcripción local sin conexión.
- Transcripción en streaming con VAD: usando `silero-vad-loom` como segmentador, el modo `stream` permite mostrar líneas de habla parciales y finales en interfaces de reuniones o notas en vivo, reejecutando solo las líneas afectadas por cada push.
- Preprocesado de audio en pipelines de datos: al ser un modelo de 27M parámetros, puede ejecutarse en CPU para transcribir grandes volúmenes de audio corto en tareas de etiquetado o indexación, segmentando previamente por pausas.
- Prototipado e investigación en ASR de bajo coste: sirve como referencia mínima para experimentos de cuantización y despliegue con loom.cpp, comparando F32 frente a q8_0 con la misma tasa de error.
- Integración en sistemas de accesibilidad: transcripción local de voz a texto para personas con dificultades motoras en entornos sin conectividad, con latencia aceptable en hardware modesto.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los siguientes:

| Metrica | F32 | q8_0 |
|---|---|---|
| Tamano del fichero | 110 MB | 31 MB |
| Tasa de error de palabra (74 clips) | 9,83% | 9,83% |
| Transcripciones identicas a token | 74/74 | 67/74 |
| Memoria pico en Raspberry Pi Zero W | 174 MB | 103 MB |
| Tiempo para 11 s de audio en Pi Zero W (ARMv6, sin SIMD) | ~75 s | ~75 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech WER desglosado) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo corre en CPU. Memoria pico documentada de 174 MB (F32) y 103 MB (q8_0) en Raspberry Pi Zero W.
- GPU recomendadas: no se documentan; el modelo está orientado a CPU y dispositivos embebidos. Cualquier GPU moderna con soporte de loom.cpp sería sobredimensionada para 27M parámetros.
- Cabe en cualquier GPU de consumo: con 110 MB en F32 y 31 MB en q8_0, ocupa una fracción mínima de la VRAM de una RTX 4090, RTX 3060 o incluso de una iGPU.
- Despliegue: exclusivamente mediante `loom-py-rt` (PyPI) sobre el motor loom.cpp; no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones compatibles con este GGUF específico.
- Latencia y throughput: en Raspberry Pi Zero W, 11 s de audio tardan aproximadamente 75 s en transcribirse a cualquier precisión, es decir, unas 0,15 veces tiempo real. No se proporcionan cifras para CPU x86 o GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Moonshine Tiny Loom (esta ficha) | 27M | 194 tokens, 29,8 s de audio | Ingles | MIT | GGUF (loom.cpp) |
| moonshine-ai/moonshine-tiny (base) | 27M | No disponible | Ingles | MIT | Safetensors / transformers |
| Whisper tiny (referencia de categoria) | ~39M | 30 s de audio | Multilingue | MIT | Safetensors, GGUF, etc. |

No se dispone en la información proporcionada de datos de benchmarks comparativos entre estos modelos, ni de cifras de WER de Whisper tiny en el mismo conjunto de 74 clips. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Limite duro de 29,8 s por llamada: clips más largos se rechazan con error; es obligatorio segmentar previamente con un VAD o por pausas.
- Clips de menos de 0,3 s devuelven texto vacío por el tope de decodificación de 6,5 tokens por segundo de audio.
- Riesgo de repetición o invención de palabras en audio ruidoso o muy corto, comportamiento común en reconocedores encoder-decoder.
- Solo inglés: no hay soporte multilingüe ni selección de idioma; el argumento `language=` se ignora.
- Audio de entrada restringido a mono a 16 kHz; otras frecuencias o canales requieren remuestreo y downmix previos.
- Rendimiento muy bajo en hardware sin SIMD: aproximadamente 75 s para 11 s de audio en Raspberry Pi Zero W (ARMv6), lo que limita su uso en tiempo real en esas placas.
- La cuantización q8_0 altera ligeramente la salida: 7 de 74 transcripciones difieren en una palabra o su puntuación respecto a F32, aunque el WER agregado es idéntico.
- Dependencia del ecosistema loom.cpp/loom-py: no es un GGUF estándar de llama.cpp, por lo que no puede cargarse con Ollama, llama.cpp ni vLLM sin conversión adicional.
- Licencia MIT permite uso comercial sin restricciones adicionales, pero se hereda del modelo base y conviene verificar la cadena de atribución.
- No se documentan sesgos específicos del modelo; al ser un ASR entrenado presumiblemente con datos mayoritarios en inglés, es esperable un peor rendimiento en acentos no estándar, si bien este dato no está confirmado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/moonshine-tiny-loom
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-tiny
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Modelo VAD complementario: https://huggingface.co/loom-ai-org/silero-vad-loom
