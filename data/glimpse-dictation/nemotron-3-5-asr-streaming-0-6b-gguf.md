# Glimpse-Dictation/Nemotron-3.5-ASR-Streaming-0.6B-gguf

## Resumen

Nemotron 3.5 ASR Streaming 0.6B (GGUF) es una conversión al formato GGUF Q8_0 del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA. La conversión la mantiene el proyecto Glimpse-Dictation para alimentar `transcribe.cpp`, el runtime que usa la aplicación de dictado local Glimpse en macOS y Windows. No es una versión oficial de NVIDIA: el repositorio solo replica la conversión realizada por handy-computer a partir del checkpoint original.

El modelo está pensado para transcripción en streaming con un enfoque *cache-aware*, lo que permite procesar audio de forma incremental manteniendo estado entre fragmentos en lugar de re-transcribir ventanas completas. Con 637.991.968 parámetros (aproximadamente 0,6 mil millones) y un único fichero Q8_0 de 751,1 MB, está diseñado para ejecutarse en CPU, Metal y Vulkan, sin necesidad de GPU dedicada.

Su relevancia práctica es la de un modelo ASR compacto, multilingüe y ejecutable en local, orientado a dictado en tiempo real en dispositivos de consumo. La licencia OpenMDW 1.1 permite uso comercial, lo que lo hace apto para integrarse en productos de terceros siempre que se respeten las condiciones de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo ASR de NVIDIA; el repositorio no detalla la topología interna) |
| Parametros totales | 637.991.968 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (modelo de audio en streaming; no se especifica ventana en tokens) |
| Tipos de cuantizacion | Q8_0 (único fichero publicado) |
| Idiomas soportados | Multilingüe (lista de idiomas no disponible) |
| Licencia | OpenMDW License Agreement 1.1 (permite uso comercial) |
| Formato de pesos | GGUF (`nemotron-3.5-asr-streaming-0.6b-Q8_0.gguf`, 751,1 MB) |
| SHA-256 del fichero | `b94545b313b3223fda7b2857a52681da813935c2127643d1e9ff0c23d988089c` |
| Runtime objetivo | transcribe.cpp (CPU, Metal, Vulkan) |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b (commit `24b151a`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo, los datos de entrenamiento ni el proceso de ajuste. La model card únicamente indica que se trata de un modelo ASR multilingüe y *cache-aware streaming*, una variante de inferencia en la que el modelo conserva un estado (caché) entre fragmentos de audio sucesivos para producir transcripciones incrementales con baja latencia. Esa característica es la que permite su uso en dictado en tiempo real.

La conversión a GGUF se realizó desde el checkpoint original de NVIDIA en el commit `24b151a`, y el fichero publicado es una copia sin modificar de la conversión de handy-computer en el commit `53ce288f`. Para detalles sobre datos de entrenamiento, composición del dataset o posibles fases de ajuste (RLHF/DPO u otras), la model card remite explícitamente a la ficha oficial de NVIDIA, que no forma parte de la información disponible en este repositorio.

## Capacidades

- Reconocimiento automático del habla (ASR) con salida de texto a partir de audio.
- Transcripción en streaming con estado cacheado entre fragmentos, apta para dictado en tiempo real.
- Soporte multilingüe (el conjunto exacto de idiomas no está detallado en la información disponible).
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan, sin requerir GPU dedicada.
- Integración con `transcribe.cpp` como runtime de inferencia.
- Uso como motor de dictado local en la aplicación Glimpse (macOS y Windows).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Dictado en local para aplicaciones de escritorio: el modelo alimenta la transcripción en tiempo real de Glimpse en Mac y Windows, procesando el audio del micrófono de forma incremental gracias a su naturaleza streaming y a su reducido tamaño (751,1 MB en Q8_0), lo que permite ejecutarlo en el propio dispositivo sin enviar audio a la nube.
- Subtitulado en directo de reuniones o clases: el modo *cache-aware* permite generar texto conforme se habla, con latencia baja y sin necesidad de esperar al final de la intervención.
- Transcripción de notas de voz y entrevistas: al ejecutarse en CPU, puede integrarse en herramientas de escritorio que procesan grabaciones sin infraestructura de GPU.
- Aplicaciones de accesibilidad: dictado por voz para usuarios con movilidad reducida, funcionando offline y preservando la privacidad del audio al no salir del dispositivo.
- Prototipado rápido de pipelines ASR: al estar en GGUF y disponible para `transcribe.cpp`, permite validar flujos de transcripción en entornos con CPU, Metal o Vulkan antes de escalar a soluciones mayores.
- Integración en productos de terceros con uso comercial: la licencia OpenMDW 1.1 permite incorporar el modelo en aplicaciones propietarias respetando sus términos, algo relevante para startups que necesitan ASR local sin costes por minuto de API.
- Transcripción multilingüe en dispositivos de consumo: útil para usuarios que alternan idiomas y necesitan un motor local que no dependa de conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el modelo está diseñado para ejecutarse en CPU. El fichero Q8_0 ocupa 751,1 MB en disco y requiere del orden de 1 GB de memoria en inferencia, aunque la cifra exacta no está documentada.
- GPU recomendadas: no se especifican. El runtime soporta Metal (Apple Silicon) y Vulkan, por lo que puede acelerarse en GPUs integradas y discretas compatibles con Vulkan.
- GPU de consumo: no hay requisitos publicados; el modelo está pensado para funcionar sin GPU dedicada. Cabe en cualquier equipo con al menos ~1 GB de RAM libre para los pesos, más el overhead del runtime.
- Opciones de despliegue: `transcribe.cpp` (runtime objetivo, con backends CPU, Metal y Vulkan). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR y no un LLM de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B (GGUF, este repo) | 637.991.968 | No disponible | GGUF Q8_0 | OpenMDW 1.1 | Streaming cache-aware, runtime transcribe.cpp, CPU/Metal/Vulkan |
| nvidia/nemotron-3.5-asr-streaming-0.6b (original) | 637.991.968 | No disponible | Safetensors (checkpoint original) | OpenMDW 1.1 | Checkpoint oficial de NVIDIA; requiere runtime compatible con el formato original |
| handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf | 637.991.968 | No disponible | GGUF Q8_0 | OpenMDW 1.1 | Conversión origen de la que este repositorio es copia sin modificar |

No se dispone de información sobre otros modelos ASR comparables (por ejemplo, Whisper u otros) en la documentación proporcionada, por lo que no se incluyen datos de rendimiento comparativo.

## Limitaciones y advertencias

- Este repositorio no es una release oficial de NVIDIA; es una réplica de una conversión de terceros. Para soporte, notas de sesgo, seguridad y privacidad, debe consultarse la ficha oficial de NVIDIA.
- Solo se publica una cuantización Q8_0; no hay variantes Q4, Q5 u otras que reduzcan aún más el uso de memoria.
- El modelo está orientado a ASR; no debe esperarse de él generación de texto libre, razonamiento, código ni tool calling.
- La lista de idiomas soportados no está detallada, lo que dificulta evaluar su cobertura multilingüe real.
- No se documentan métricas de precisión (WER u otras), por lo que el rendimiento en producción debe validarse empíricamente.
- Riesgo de errores de transcripción en audio con ruido, acentos marcados o vocabulario técnico, habitual en modelos ASR de este tamaño; no cuantificado en la información disponible.
- La licencia OpenMDW 1.1 permite uso comercial, pero impone condiciones que deben revisarse en el fichero LICENSE antes de su integración en productos.
- El modelo depende de `transcribe.cpp`; su portabilidad a otros runtimes no está garantizada.
- El repositorio tiene un volumen de descargas muy bajo (32) y ningún "like", lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Glimpse-Dictation/Nemotron-3.5-ASR-Streaming-0.6B-gguf
- Modelo base oficial de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Conversión origen: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf
- Runtime transcribe.cpp: https://github.com/LegendarySpy/transcribe.cpp
- Aplicación Glimpse: https://tryglimpse.cc
- Código fuente de Glimpse: https://github.com/glimpse-hq/Glimpse
