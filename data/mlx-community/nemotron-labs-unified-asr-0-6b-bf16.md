# mlx-community/nemotron-labs-unified-asr-0.6b-bf16

## Resumen

Nemotron-labs-unified-asr-0.6b es un modelo de reconocimiento automatico del habla (ASR) desarrollado originalmente por NVIDIA y convertido al formato MLX por la comunidad mlx-community. Se trata de un sistema unificado que cubre tanto la transcripcion offline como el streaming de baja latencia en un unico checkpoint, con 626,7 millones de parametros y soporte para 25 idiomas europeos. La relevancia de esta version concreta reside en que permite ejecutar el modelo de forma nativa en hardware Apple Silicon mediante el framework MLX, sin depender de CUDA ni de infraestructura NVIDIA.

El modelo emplea una arquitectura de tipo RNNT (Recurrent Neural Network Transducer) con un encoder que procesa audio de 16 kHz mono. Su principal innovacion es el streaming bufferizado: cada paso re-codifica 5,6 s de contexto izquierdo junto con el chunk nuevo y su contexto derecho, lo que permite obtener transcripciones incrementales con puntuacion y mayusculas. La latencia de streaming oscila entre 160 ms y 2,08 s segun la configuracion.

Esta conversion bf16 ocupa 1,25 GB y esta pensada para desarrolladores que quieran integrar ASR multilingue en aplicaciones macOS o iOS. Existen tambien variantes cuantizadas a 8 bits (744 MB) y 4 bits (472 MB) publicadas por el mismo autor de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer) con encoder de audio |
| Parametros totales | 626.702.592 (626,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; contexto de audio bufferizado de 5,6 s de contexto izquierdo por paso |
| Tipos de cuantizacion | bf16 (esta version), 8 bits y 4 bits (variantes separadas) |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (MLX) |
| Entrada de audio | 16 kHz mono, minimo 80 ms |
| Latencia de streaming | 160 ms a 2,08 s |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un RNNT, una arquitectura clasica en ASR que combina un encoder acustico con un predictor y una capa de joint para producir tokens de forma auto-regresiva. Esta disenada especificamente para streaming: el encoder procesa ventanas de audio con contexto izquierdo y derecho, y el decodificador emite tokens de forma incremental. El checkpoint unificado permite alternar entre transcripcion offline y streaming sin cambiar de modelo.

Los detalles concretos sobre el numero de tokens de entrenamiento, la composicion del dataset y si hubo etapas de RLHF o DPO no estan disponibles en la informacion proporcionada. La model card original de NVIDIA (referenciada como fuente) contiene las tablas de WER para los conjuntos FLEURS, MCV, MLS y los sets ingleses de Open ASR, pero esas metricas corresponden al modelo NeMo en bf16, no a esta conversion MLX. La conversion se realizo con la herramienta `nemotron_asr.convert` de mlx-audio sobre la revision `023ce907` del modelo original.

La innovacion tecnica destacable es el esquema de streaming bufferizado: en lugar de procesar solo el chunk nuevo, cada paso re-codifica 5,6 s de contexto izquierdo junto con el chunk y su contexto derecho. Esto mejora la coherencia de la transcripcion a costa de mayor computo por paso. El puerto en float32 reproduce los frames del encoder de NeMo con un error de 8,2e-6 y genera los mismos tokens en las configuraciones probadas (5,6 s / 80 ms / 240 ms; 0,8 s / 80 ms / 240 ms; 0,8 s / 160 ms / 400 ms).

## Capacidades

- Transcripcion de voz a texto offline en 25 idiomas europeos con puntuacion y mayusculas automaticas.
- Streaming ASR con latencia configurable entre 160 ms y 2,08 s.
- Deteccion y transcripcion multilingue, siempre que se indique el idioma hablado de forma explicita.
- Manejo de audio de 16 kHz mono con una duracion minima de 80 ms por entrada.
- API de sesion de streaming tanto en Python (`create_streaming_session`) como en Swift (`makeStreamSession`).
- Salida con puntuacion y capitalizacion integradas, sin post-procesado adicional.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.

## Casos de uso

- **Dictado en tiempo real en aplicaciones macOS/iOS**: usando la API Swift de mlx-audio-swift, el modelo puede transcribir voz mientras el usuario habla con una latencia de 320 ms, lo que lo hace adecuado para editores de texto, notas de voz o asistentes de escritorio nativos de Apple Silicon.
- **Subtitulado automatico de reuniones y videollamadas**: con 25 idiomas europeos y streaming bufferizado, se puede integrar en pipelines de videoconferencia para generar subtitulos incrementales con puntuacion, manteniendo el contexto izquierdo de 5,6 s para coherencia entre frases.
- **Transcripcion por lotes de archivos de audio**: el mismo checkpoint funciona en modo offline, por lo que un pipeline de post-procesado puede transcribir grabaciones completas (podcasts, entrevistas, archivos de call center) sin cambiar de modelo ni de infraestructura.
- **Procesamiento local en dispositivos sin GPU NVIDIA**: al estar convertido a MLX, se puede desplegar en MacBooks y equipos Apple Silicon, lo que habilita ASR en entornos de desarrollo, demos o aplicaciones de escritorio donde no hay acceso a CUDA.
- **Sistemas de atencion al cliente con transcripcion en vivo**: la baja latencia (160 ms con chunk de 160 ms y contexto derecho de 160 ms) permite transcribir llamadas en curso y alimentar analitica o agentes de soporte en tiempo real, a costa de una perdida de 0,6 puntos de WER en FLEURS.
- **Accesibilidad y transcripcion de contenido multimedia**: integracion en reproductores o herramientas de accesibilidad para generar subtitulos en multiples idiomas europeos, con la ventaja de que las variantes 8-bit (744 MB) y 4-bit (472 MB) reducen el uso de memoria para entornos con recursos limitados.
- **Investigacion en ASR multilingue**: el modelo sirve como linea base reproducible en MLX para experimentos de streaming, comparacion de latencias y evaluacion de cuantizacion en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos (WER por idioma) para esta conversion MLX en la informacion disponible. La model card indica explicitamente que las tablas de WER de NVIDIA corresponden al modelo NeMo original en bf16, no a esta conversion. Los unicos datos numericos publicados son de velocidad y de una prueba interna de dictado:

| Metrica | Valor |
|---|---|
| Paridad con NeMo (float32, mlx-audio) | frames del encoder dentro de 8,2e-6; mismos tokens en 3 configuraciones |
| Paridad con NeMo (Swift, bf16) | texto identico en 10 de 12 clips (3 ediciones de palabra en 355 palabras) |
| Recall de terminos (streaming 320 ms, 8-bit, set de 260 clips EN/FR) | 60,7 % |
| WER en el resto de palabras (mismo set) | 6,5 % |
| Recall de terminos del modelo comparable `nemotron-3.5-asr-streaming-0.6b-8bit` | 55,5 % |
| WER del modelo comparable en el resto de palabras | 11,7 % |
| Tiempo medio por paso de 80 ms (M1 Pro, Swift, 320 ms latencia, 8-bit) | 68,6 ms |
| Tiempo medio por paso (4-bit) | 68,7 ms |
| Tiempo medio por paso (bf16) | 64,8 ms |
| Tiempo medio por paso (float16 activaciones) | 57,4 ms (16 % menos, misma precision) |
| Chunk de 160 ms con contexto derecho de 160 ms | 34,7 ms por paso, +0,6 puntos de WER en FLEURS |
| Chunk de 160 ms + activaciones float16 | 26,9 ms por paso, 896 MB de memoria pico, estable 30 minutos |

## Requisitos de hardware

- **VRAM/memoria estimada**: bf16 requiere aproximadamente 1,25 GB de pesos; 8-bit unos 744 MB; 4-bit unos 472 MB. La memoria pico medida en streaming con chunk de 160 ms y activaciones float16 es de 896 MB.
- **GPU recomendadas**: hardware Apple Silicon (M1 Pro o superior segun las pruebas publicadas). No se documenta soporte para GPU NVIDIA en esta conversion MLX; para esas plataformas habria que usar el modelo NeMo original.
- **Consumer GPU**: si, en equipos Apple Silicon. Cabe en MacBooks con M1 Pro y superiores; no se proporcionan datos para GPUs de consumo NVIDIA en esta conversion.
- **Opciones de despliegue**: mlx-audio (Python) y mlx-audio-swift (Swift). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- **Latencia y throughput**: 64,8 ms por paso de 80 ms en bf16, 68,6 ms en 8-bit, 57,4 ms con activaciones float16, y 26,9 ms con chunk de 160 ms y float16. La cuantizacion reduce memoria pero no tiempo, ya que el paso esta limitado por computo a 75 frames.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nemotron-labs-unified-asr-0.6b (esta conversion, bf16) | 626,7 M | 160 ms a 2,08 s de latencia | 25 europeos | OpenMDW 1.1 | safetensors MLX |
| nemotron-labs-unified-asr-0.6b-8bit (misma familia) | 626,7 M | misma latencia | 25 europeos | OpenMDW 1.1 | safetensors MLX, 8-bit, 744 MB |
| nemotron-labs-unified-asr-0.6b-4bit (misma familia) | 626,7 M | misma latencia | 25 europeos | OpenMDW 1.1 | safetensors MLX, 4-bit, 472 MB |
| nemotron-3.5-asr-streaming-0.6b-8bit (referencia en la model card) | no disponible | streaming | no disponible | no disponible | MLX, 8-bit |

La comparativa con modelos de otros ecosistemas (Whisper, NeMo original, etc.) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Idioma explicito obligatorio**: a baja latencia, el modo `auto` puede comprometer los primeros tokens en el idioma equivocado; se debe indicar el idioma hablado.
- **Contexto izquierdo minimo**: NVIDIA reporta degradacion de precision con menos de 2 s de contexto izquierdo; se recomienda mantener 2 s o mas.
- **Sesgos**: no se documentan sesgos especificos en la informacion disponible.
- **Alucinacion**: no se documenta tasa de alucinacion para este modelo; en ASR el riesgo se manifiesta como sustituciones o inserciones de palabras, especialmente en audio ruidoso o con acentos no representados.
- **Cobertura limitada a 25 idiomas europeos**: no soporta idiomas fuera de esa lista.
- **Licencia**: OpenMDW 1.1; los pesos convertidos son derivados del modelo de NVIDIA y su uso se rige por el acuerdo OpenMDW 1.1. Es responsabilidad del usuario revisar los terminos para uso comercial.
- **Metricas de precision no trasladables**: las tablas de WER de NVIDIA corresponden al modelo NeMo en bf16, no a esta conversion MLX; la paridad verificada es a nivel de tokens en configuraciones concretas, no de WER completo.
- **Restriccion de plataforma**: al ser una conversion MLX, esta atada a hardware Apple; para otros entornos hay que recurrir al modelo original de NVIDIA.
- **Cuantizacion**: ahorra memoria pero no tiempo de inferencia, ya que el paso esta limitado por computo.

## Enlaces

- [HuggingFace: mlx-community/nemotron-labs-unified-asr-0.6b-bf16](https://huggingface.co/mlx-community/nemotron-labs-unified-asr-0.6b-bf16)
- [Modelo original: nvidia/nemotron-labs-unified-asr-0.6b](https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b)
- [Variante 8-bit](https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-8bit)
- [Variante 4-bit](https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-4bit)
- [Licencia OpenMDW 1.1](https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1)
