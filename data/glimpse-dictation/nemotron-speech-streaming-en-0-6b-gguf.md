# Glimpse-Dictation/Nemotron-Speech-Streaming-EN-0.6B-gguf

## Resumen

Nemotron Speech Streaming EN 0.6B (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-speech-streaming-en-0.6b` de NVIDIA, publicada por Glimpse-Dictation para su uso con el runtime `transcribe.cpp`. Se trata de un modelo de transcripción en inglés de 618 millones de parámetros, diseñado específicamente para inferencia en streaming con estado de caché (*cache-aware*), lo que permite transcribir audio de forma incremental sin necesidad de esperar a que finalice la locución.

El modelo resuelve el problema de la dictación local y de baja latencia en dispositivos sin GPU dedicada: al estar cuantizado en Q8_0 y empaquetado en GGUF, puede ejecutarse sobre CPU, Metal (macOS) y Vulkan (Windows/Linux), sin depender de servicios en la nube. Es la pieza central de Glimpse, una aplicación de dictado gratuita y de código abierto para Mac y Windows, y su relevancia actual radica en la combinación de licencia permisiva para uso comercial (NVIDIA Open Model License) con un tamaño reducido (729,7 MB en disco) que lo hace viable en portátiles convencionales.

La arquitectura interna no se detalla en la información disponible; la model card se limita a indicar que es un modelo *streaming cache-aware* en inglés y remite a la model card original de NVIDIA para datos de entrenamiento, uso previsto y notas de sesgo y seguridad. Esta ficha describe, por tanto, la conversión GGUF y sus características de despliegue, no los detalles de entrenamiento del checkpoint original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR streaming cache-aware; detalles en la model card de NVIDIA) |
| Parametros totales | 618.079.745 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único fichero publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | nvidia-open-model-license (permite uso comercial) |
| Formato de pesos | GGUF (`nemotron-speech-streaming-en-0.6b-Q8_0.gguf`, 729,7 MB) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna (tipo de encoder/decoder, mecanismo de atención, capas, etc.) ni sobre el proceso de entrenamiento del checkpoint original. La model card de esta conversión remite explícitamente a la model card de NVIDIA para consultar datos de entrenamiento, uso previsto y notas de sesgo, seguridad y privacidad.

El único dato técnico relevante que sí se documenta es la naturaleza *cache-aware streaming* del modelo: mantiene un estado de caché entre fragmentos de audio, lo que permite emitir transcripciones parciales de forma continua en lugar de procesar la señal completa de una vez. La conversión a GGUF es una copia sin modificaciones del repositorio `handy-computer/nemotron-speech-streaming-en-0.6b-gguf` en el commit `7df420cc`, a su vez convertido desde `nvidia/nemotron-speech-streaming-en-0.6b` en el commit `ef3bf40`. El fichero Q8_0 tiene SHA-256 `90d8c89714cd31efc88be62a40c6b2bea57e0cc2063af1ffe2c28f1a228ca110`.

## Capacidades

- Transcripción automática de voz en inglés (*automatic-speech-recognition*).
- Inferencia en streaming con estado de caché: emite resultados parciales conforme llega el audio.
- Ejecución en CPU, Metal y Vulkan a través del runtime `transcribe.cpp`.
- Modelo exclusivamente de audio a texto: no genera texto libre, no razona, no escribe código ni procesa imágenes.
- No se documenta soporte de *tool calling*, *function calling* ni comportamiento agéntico.
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente para inglés.
- No se documentan modos especiales (thinking, visión, audio de entrada distinto de voz, etc.).

## Casos de uso

- Dictado en escritorio: integrado en Glimpse para Mac y Windows, el modelo transcribe la voz del usuario en tiempo real y la inserta en cualquier aplicación, aprovechando su modo streaming para mostrar texto parcial mientras se habla.
- Subtitulado en directo de reuniones o clases: al emitir transcripciones incrementales con baja latencia, puede alimentar una capa de subtítulos sobre la captura de micrófono sin esperar al final de cada intervención.
- Notas de voz a texto en local: procesar grabaciones de audio en el propio dispositivo, sin enviar datos a servicios externos, útil en entornos con requisitos de privacidad.
- Transcripción de entrevistas y podcasts en inglés: con 729,7 MB en Q8_0, cabe en portátiles sin GPU dedicada y permite lotes de audio en CPU.
- Asistentes de voz embebidos: servir como front-end ASR en aplicaciones de escritorio o edge que necesiten reconocimiento de comandos y dictado sin conexión.
- Accesibilidad: dictado por voz para usuarios con movilidad reducida en aplicaciones de escritorio, ejecutándose íntegramente en el equipo del usuario.
- Prototipado de pipelines ASR: al ser un GGUF compatible con `transcribe.cpp`, sirve para evaluar el modelo de NVIDIA en entornos locales antes de integrar el checkpoint original en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 729,7 MB; en CPU el consumo de RAM es del orden del tamaño del fichero más el estado de caché del streaming (no cuantificado en la información disponible).
- GPU recomendadas: no se especifican; el modelo está pensado para CPU, Metal y Vulkan, no para CUDA.
- Cabe en GPU de consumo: no se documenta soporte CUDA; en equipos Apple Silicon se ejecuta vía Metal y en Windows/Linux vía Vulkan o CPU.
- Opciones de despliegue: `transcribe.cpp` (runtime oficial de esta conversión); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron Speech Streaming EN 0.6B (GGUF) | 618 M | no disponible | en | nvidia-open-model-license | GGUF Q8_0 |
| nvidia/nemotron-speech-streaming-en-0.6b (original) | 618 M | no disponible | en | nvidia-open-model-license | safetensors (presumiblemente) |
| handy-computer/nemotron-speech-streaming-en-0.6b-gguf | 618 M | no disponible | en | nvidia-open-model-license | GGUF |

No se dispone de datos de benchmarks ni de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no se documenta soporte de otros idiomas.
- Es un modelo ASR puro: no genera texto, no razona ni ejecuta herramientas.
- No se han publicado datos de sesgo, alucinación o robustez en esta conversión; la model card remite a las notas de NVIDIA.
- La licencia NVIDIA Open Model License permite uso comercial, pero impone condiciones que deben revisarse en el fichero `LICENSE` del repositorio.
- Esta conversión no es un lanzamiento oficial de NVIDIA; es un espejo de una conversión de terceros, por lo que la responsabilidad sobre la fidelidad del GGUF recae en los conversores.
- El rendimiento y la latencia dependen del runtime `transcribe.cpp` y del hardware; no se documentan cifras de producción.
- El repositorio tiene un volumen de descargas muy bajo (36) y ningún *like*, lo que sugiere poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Glimpse-Dictation/Nemotron-Speech-Streaming-EN-0.6B-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Conversión de origen: https://huggingface.co/handy-computer/nemotron-speech-streaming-en-0.6b-gguf
- Runtime transcribe.cpp: https://github.com/LegendarySpy/transcribe.cpp
- Aplicación Glimpse: https://tryglimpse.cc
- Código fuente de Glimpse: https://github.com/glimpse-hq/Glimpse
