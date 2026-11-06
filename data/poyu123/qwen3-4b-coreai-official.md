# Poyu123/qwen3-4b-CoreAI-official

## Resumen

Poyu123/qwen3-4b-CoreAI-official es un repositorio de artefactos preconvertidos del modelo Qwen/Qwen3-4B para Core AI, el runtime de ML on-device de Apple que sustituye a Core ML en iOS 27 y macOS 27. El autor, Poyu123, publica los bundles `.aimodel` generados con la receta oficial de exportación de Apple (`coreai.llm.export`), sin modificar, junto con hashes SHA-256 y métricas de rendimiento medidas. No se trata de un modelo nuevo ni de un fine-tune con pesos alterados: los pesos subyacentes son los de Qwen3-4B, un transformer denso de 4.000 millones de parámetros desarrollado por Alibaba Qwen.

El interés del repositorio es de infraestructura más que de modelado: permite ejecutar un LLM de 4B en GPU o Neural Engine de dispositivos Apple sin tener que realizar la conversión, que requiere un Mac con mucha RAM y un entorno de exportación muy específico. El autor documenta que un mismo comando de exportación puede producir artefactos con rendimiento hasta 2,2 veces distinto según la versión de macOS, de ahí el valor de publicar bundles ya medidos y verificables por hash.

El paquete ocupa 2,3 GB e incluye dos variantes: una dinámica para macOS con cuantización int4 y una estática para iOS con contexto de 4096 tokens y cuantización mixta 4/8 bits palettizada. El modelo base Qwen3-4B es multilingüe y destaca en comprensión del lenguaje, generación, código y matemáticas, aunque el repositorio no documenta explícitamente los idiomas cubiertos por estos bundles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en el bundle iOS (estatico); no disponible para el bundle macOS |
| Tipos de cuantizacion | int4 (bundle macOS); mixta 4/8 bits palettizada (bundle iOS) |
| Idiomas soportados | no disponible en la informacion del repositorio (el modelo base Qwen3-4B es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | bundles `.aimodel` de Core AI (`main.mlirb` como artefacto principal); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-4B original: un transformer denso de 4.000 millones de parametros, sin mezcla de expertos, orientado a comprension y generacion de lenguaje, codigo y matematicas. El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo base; esos datos corresponden a la model card de Qwen/Qwen3-4B, no a este repositorio.

La innovacion tecnica de este paquete es el pipeline de exportacion a Core AI: los modelos PyTorch se convierten con `coreai-torch` (para LLM, `coreai.llm.export`) en bundles `.aimodel` que se ejecutan en la GPU o en el Neural Engine. El autor documenta el entorno exacto de exportacion (macOS 27.0 beta build 26A5353q, Xcode 27.0 27A5194q, `coreai-core 1.0.0b1`, `coreai-torch 0.4.0`, `coreai-opt 0.2.0`, `torch 2.9.0`, `apple/coreai-models` en el commit `b1cb71b`) y advierte que el artefacto no es una funcion pura de la receta: entre macOS 26 y 27 beta el mismo comando produjo un artefacto 2,2 veces mas lento, por lo que los bundles publicados y sus hashes son la referencia reproducible.

## Capacidades

- Generacion de texto y comprension del lenguaje heredadas de Qwen3-4B.
- Razonamiento, codigo y matematicas, areas en las que el modelo base Qwen3-4B destaca segun Qualcomm AI Hub.
- Capacidades multilingues del modelo base (el repositorio no detalla la lista de idiomas).
- Inferencia completamente on-device, sin conexion de red, en GPU o Neural Engine de Apple.
- Conversacion multi-turno mediante `ChatSession` de CoreAIKit, que conserva el historial entre llamadas a `respond(to:)`.
- Streaming de tokens con `streamResponse(to:)`.
- Integracion en apps Swift mediante Swift Package Manager (producto CoreAIKit, version exacta 0.7.3).
- Operaciones de alto nivel sin gestion de sesion ni plumbing de modelo, como `CoreAI.summarize(text)`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales offline en apps iOS y macOS: el bundle iOS con contexto de 4096 tokens permite mantener conversaciones multi-turno con `ChatSession` sin enviar datos a la nube, adecuado para aplicaciones con requisitos de privacidad.
- Resumen de texto en el dispositivo: la operacion `CoreAI.summarize(text)` de CoreAIKit usa este modelo por defecto, lo que permite integrar resumen on-device en una app con una sola linea de Swift.
- Generacion de codigo asistida en herramientas de desarrollo para macOS: el modelo base Qwen3-4B esta orientado a codigo y el bundle macOS con decodificacion a 145,4 tok/s en un M4 Max hace viable la autocompletacion interactiva.
- Procesamiento por lotes en estaciones de trabajo Apple Silicon: con prefill de 1.635 tok/s en M4 Max, se pueden procesar documentos largos en local sin coste de API.
- Prototipado de pipelines de IA en macOS: el bundle macOS dinamico y el CLI `chat-cli` permiten ejecutar prompts de forma headless para pruebas automatizadas y evaluacion.
- Aplicaciones de campo o entornos sin conectividad: la ejecucion 100% on-device en iPhone 17 Pro (13,2 tok/s en Neural Engine) habilita asistencia linguistica en escenarios sin red.
- Educacion y demostraciones de LLM en dispositivo: el paquete preconvertido evita la fase de exportacion, que requiere un Mac con gran cantidad de RAM, facilitando talleres y pruebas en hardware de gama alta de Apple.

## Benchmarks y rendimiento

Mediciones del autor con el `llm-benchmark` oficial de Apple en modo greedy:

| Bundle | Protocolo | Decode (tok/s) | Prefill (tok/s) | Carga (en caliente) |
|---|---|---:|---:|---:|
| macOS (int4) | M4 Max, 512p/1024g | 145,4 | 1.635 | 0,36 s |
| iOS (ANE, h18p) | iPhone 17 Pro, 512p/1024g | 13,2 | 546 | 0,46 s (en frio ≈194 s) |

El autor cita ademas, como referencia del runtime, que Qwen3-8B en 4 bits decodifica a 94 tok/s en GPU de M4 Max y que MLX 90 rinde por debajo en el mismo protocolo. No se han publicado en la informacion disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para estos bundles.

## Requisitos de hardware

- VRAM/RAM: el bundle macOS ocupa aproximadamente 2.279 MB de descarga y el de iOS aproximadamente 2.502 MB; la ejecucion solo necesita RAM suficiente para mapear el artefacto en memoria (mmap).
- GPU recomendadas: Apple Silicon; las mediciones publicadas usan M4 Max (GPU) e iPhone 17 Pro (Neural Engine, h18p).
- Cabe en hardware de consumo Apple: si, en Macs con Apple Silicon y en iPhone 17 Pro segun las pruebas del autor; no hay datos para otros modelos de iPhone o iPad.
- Despliegue: Core AI en iOS 27 / macOS 27 mediante CoreAIKit 0.7.3 (Swift Package Manager) o el CLI `chat-cli`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.aimodel` es propietario del runtime de Apple.
- Latencia y throughput: 145,4 tok/s de decodificacion y 1.635 tok/s de prefill en M4 Max; 13,2 tok/s y 546 tok/s respectivamente en iPhone 17 Pro. La carga en caliente es inferior a 0,5 s en ambos casos; en frio en iOS ronda los 194 s.
- Nota de rendimiento: medir en configuracion Release, ya que Debug es aproximadamente 3 veces mas lento en el trabajo por token en host.
- Entitlement necesario en iOS: `com.apple.developer.kernel.increased-memory-limit`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Rendimiento medido |
|---|---|---|---|---|---|
| Poyu123/qwen3-4b-CoreAI-official | 4B | 4096 (bundle iOS) | `.aimodel` (Core AI) | Apache 2.0 | 145,4 tok/s (M4 Max GPU); 13,2 tok/s (iPhone 17 Pro ANE) |
| Qwen/Qwen3-4B | 4B | no disponible en la informacion | safetensors (Transformers) | Apache 2.0 | no disponible |
| Qwen3-8B en Core AI (referencia citada por el autor) | 8B | no disponible | `.aimodel` (Core AI) | Apache 2.0 (modelo base Qwen) | 94 tok/s en 4 bits (M4 Max GPU) |
| Qwen3-8B en MLX (referencia citada por el autor) | 8B | no disponible | MLX | Apache 2.0 (modelo base Qwen) | 90 tok/s en el mismo protocolo |

La comparacion relevante es de runtime, no de calidad: el paquete de Poyu123 ofrece el mismo modelo Qwen3-4B que el repositorio oficial, pero en un formato ejecutable en dispositivos Apple con metricas publicadas y hashes verificables.

## Limitaciones y advertencias

- El repositorio no es un modelo nuevo: cualquier limitacion de calidad, sesgo o alucinacion del Qwen3-4B original se mantiene intacta.
- El contexto del bundle iOS esta fijado en 4096 tokens (variante estatica); prompts mas largos no son viables en esa configuracion.
- El bundle macOS es dinamico y su longitud de contexto no se documenta en la informacion disponible.
- El formato `.aimodel` solo funciona en Core AI (iOS 27 / macOS 27) y requiere versiones muy concretas de herramienta: Xcode 27A266a segun el pin del release y CoreAIKit 0.7.3 exacto.
- El rendimiento depende de la version del sistema: el autor documenta una regresion de 2,2 veces entre artefactos exportados en macOS 26 y macOS 27 beta, por lo que actualizar el SO puede degradar el rendimiento del bundle.
- La primera ejecucion descarga el modelo (unos 2.279 MB en Mac y 2.502 MB en iPhone) y la carga en frio en iOS puede tardar alrededor de 194 s.
- El repositorio tiene un uso muy bajo (9 descargas y 0 likes en el momento de la consulta); no hay evidencia de validacion por terceros mas alla de las metricas del propio autor.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B y del runtime Core AI de Apple, que no se detallan en la informacion proporcionada.
- No se documentan sesgos especificos, idiomas soportados ni resultados de benchmarks de calidad para estos bundles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Poyu123/qwen3-4b-CoreAI-official
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Receta de exportacion oficial de Apple: https://github.com/apple/coreai-models
- Benchmark de LLM en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench
- Metodologia forense de la exportacion Core AI: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/methodology/coreai-export-lowering.md
- CoreAIKit (SDK Swift): https://github.com/john-rocky/coreai-kit
- ChatDemo (runner GUI y CLI): https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/ChatDemo
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/0.7.3/Examples/ChatDemo/Sources/QuickStart.swift
- Cookbook de operaciones: https://github.com/john-rocky/coreai-kit/blob/0.7.3/docs/COOKBOOK.md
- Leaderboard DeviceMark: https://devicemark.github.io/
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
