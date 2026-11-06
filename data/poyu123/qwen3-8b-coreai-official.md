# Poyu123/qwen3-8b-CoreAI-official

## Resumen

Qwen3-8B — Core AI official export es un paquete de pesos ya convertidos al formato `.aimodel` de Core AI, el runtime de aprendizaje automatico en dispositivo de Apple que sustituye a Core ML en iOS 27 y macOS 27. No se trata de un modelo nuevo entrenado por el autor del repositorio, sino de una exportación del Qwen3-8B original de Qwen (Alibaba) realizada con la receta oficial de Apple (`coreai.llm.export`) y publicada sin modificaciones por el usuario Poyu123. El repositorio tiene un tamano de 4,6 GB y contiene el bundle cuantizado a 4 bits para macOS.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 8 mil millones de parametros de forma totalmente local en hardware Apple Silicon, sin dependencia de la nube, aprovechando la GPU o el Neural Engine del chip. Segun los datos publicados, el bundle alcanza 94,1 tokens por segundo en decodificacion sobre una M4 Max con una ventana de protocolo de 512 tokens de prompt y 1024 de generacion, con un consumo pico de RAM de 9,3 GB.

El modelo base Qwen3-8B es un transformer denso de la familia Qwen3, conocido por su modo de razonamiento explicito (thinking mode) y su soporte multilingue. Esta exportacion hereda esas capacidades pero las encapsula en un artefacto binario especifico de plataforma, lo que condiciona tanto el despliegue como la portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B); artefacto exportado a formato `.aimodel` de Core AI |
| Parametros totales | 8 mil millones (modelo base Qwen3-8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el protocolo de medida usa 512 prompt / 1024 generacion, no el contexto maximo del modelo) |
| Tipos de cuantizacion | int4 (bundle macOS) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (bundle de Core AI, `main.mlirb`); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El artefacto es una exportacion del Qwen3-8B original, un transformer denso de 8 mil millones de parametros. El proceso de conversion se realiza con `coreai.llm.export` de la cadena de herramientas de Apple (`coreai-torch 0.4.0`, `coreai-opt 0.2.0`, `torch 2.9.0`, `coreai-core 1.0.0b1`), a partir del repositorio `apple/coreai-models` en el commit `b1cb71b`. El resultado es un bundle `.aimodel` con un fichero `main.mlirb` cuyo SHA-256 es `f659250441d88f9eaf6f260b11e2644edac9245b7bea89e30c70dc1960ef953b`, lo que permite verificar la integridad del artefacto.

No se proporciona informacion sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, fases de RLHF o DPO) mas alla de que se trata de Qwen3-8B. La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento sino en el proceso de exportacion: el autor documenta que un `.aimodel` es un artefacto de build y no una funcion pura de la receta, ya que el mismo comando de exportacion produjo un artefacto 2,2 veces mas lento al cruzar la frontera de macOS 26 a 27 beta. Por eso se publican bundles preconvertidos con hashes y entorno exacto, para garantizar reproducibilidad.

## Capacidades

- Generacion de texto y conversacion multi-turno: el paquete incluye `ChatSession`, que mantiene el historial de la conversacion entre llamadas a `respond(to:)`.
- Razonamiento: hereda las capacidades del Qwen3-8B base, incluido su modo de pensamiento (thinking mode), aunque la model card de esta exportacion no detalla configuracion especifica.
- Generacion de codigo y matematicas: capacidades propias del modelo base Qwen3-8B; no se documentan resultados especificos en este repositorio.
- Ejecucion totalmente en dispositivo: inferencia local en GPU o Neural Engine de Apple Silicon, sin llamadas a servicios externos.
- Streaming de tokens: la API `streamResponse(to:)` permite recibir tokens a medida que se decodifican.
- Operaciones de alto nivel: la libreria CoreAIOps expone tareas como resumen (`CoreAI.summarize`) con una sola linea de codigo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision o audio: no disponible; el bundle es exclusivamente de texto.

## Casos de uso

- Asistentes conversacionales offline en macOS: integrando `ChatSession` en una app nativa, el modelo mantiene el historial multi-turno y responde sin conexion, lo que resulta adecuado para entornos con requisitos de privacidad o sin red.
- Resumen de documentos local: mediante `CoreAI.summarize(text, options: .model("qwen3-8b"))` se puede resumir texto en dispositivo; el tamano de 8B ofrece mas calidad que modelos pequenos como qwen3-0.6b a costa de 9,3 GB de RAM pico.
- Automatizacion headless en macOS: el CLI `chat-cli` permite invocar el modelo desde scripts y pipelines de agentes en la propia maquina, sin depender de APIs externas.
- Prototipado de apps iOS/macOS con IA integrada: el bundle macOS y la API de CoreAIKit permiten validar experiencias de chat antes de empaquetar la version estatica para iOS.
- Procesamiento por lotes de texto en estaciones de trabajo Apple: con 94,1 tok/s en M4 Max, es viable procesar volumenes moderados de prompts en local para clasificacion, extraccion o reescritura.
- Evaluacion comparativa de runtimes en dispositivo: al estar medido con el protocolo oficial `llm-benchmark` y con hashes publicados, sirve como referencia reproducible para comparar Core AI frente a MLX u otros runtimes en el mismo hardware.

## Benchmarks y rendimiento

Datos medidos con el benchmark oficial de Apple (`llm-benchmark`, decodificacion greedy) sobre el bundle macOS:

| Bundle | Hardware / protocolo | Decode (tok/s) | Prefill | Carga en caliente | RSS pico |
|---|---|---:|---:|---:|---:|
| macos (int4) | M4 Max, 512 prompt / 1024 generacion | 94,1 | 912 | 0,64 s | 9,3 GB |

La model card menciona ademas una comparacion de 94 tok/s frente a 90 tok/s de MLX bajo el mismo protocolo, medida en macOS 27 beta (build 26A5353q, 2026-06-11) y registrada en `apple-silicon-llm-bench`. No se publican resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- RAM: el bundle macOS requiere aproximadamente 9,3 GB de RSS pico durante la inferencia; la descarga inicial es de unos 4.624 MB.
- GPU recomendadas: Apple Silicon; la medida publicada corresponde a una M4 Max. No se documentan resultados para M1, M2, M3, A100, H100 ni RTX 4090, ya que Core AI solo se ejecuta en hardware Apple.
- Cabe en GPU de consumo: si, en chips Apple Silicon con RAM suficiente (el pico de 9,3 GB condiciona equipos de 16 GB o mas).
- Conversion: el autor advierte que convertir el modelo requiere un Mac con mucha RAM (la exportacion del 20B se hizo en 128 GB); ejecutar solo necesita RAM para mapear el artefacto.
- Opciones de despliegue: Core AI runtime con CoreAIKit 0.7.3 (SPM), el CLI `llm-runner` y `llm-benchmark` de `coreai-models`, y la app CoreAIChatMac. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: 94,1 tok/s de decodificacion y 0,64 s de carga en caliente en M4 Max. Se recomienda medir en Release, ya que Debug es aproximadamente 3 veces mas lento en el trabajo de host por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Qwen3-8B Core AI official (este) | 8B | no disponible | `.aimodel` / Core AI | Apache 2.0 | 94,1 tok/s en M4 Max (int4) |
| Qwen3-8B (original) | 8B | no disponible en esta ficha | safetensors / transformers, vLLM, etc. | Apache 2.0 | no disponible |
| Qwen3-8B en MLX | 8B | no disponible | MLX | Apache 2.0 | 90 tok/s bajo el mismo protocolo segun la model card |
| Qwen3-0.6B Core AI | 0,6B | no disponible | `.aimodel` / Core AI | Apache 2.0 | no disponible |

La comparacion de rendimiento entre Core AI y MLX procede de la propia model card y de `apple-silicon-llm-bench`; no se dispone de datos independientes de calidad ni de comparaciones con otros modelos de 8B en esta informacion.

## Limitaciones y advertencias

- Dependencia de plataforma: el bundle `.aimodel` solo funciona en Core AI (iOS 27 / macOS 27), lo que excluye Linux, Windows y hardware no Apple.
- Fragilidad del artefacto: el autor documenta que el mismo comando de exportacion genero un artefacto 2,2 veces mas lento al cambiar de version de macOS; conviene fijar versiones de sistema y herramientas.
- Requisitos de version: el ejemplo usa Xcode 27.0 build 27A266a y CoreAIKit 0.7.3 exacto; otras versiones pueden no ser compatibles.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.
- Idiomas, contexto maximo y capacidades de tool calling no documentados en esta exportacion; no deben asumirse sin verificar contra el modelo base.
- Riesgo de alucinacion y sesgos: inherentes al Qwen3-8B base; esta publicacion no aporta evaluaciones de seguridad ni de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el autor del bundle no ofrece garantias sobre el artefacto; la responsabilidad de validacion recae en el integrador.
- Sin datos de benchmarks de calidad: no se puede evaluar la degradacion introducida por la cuantizacion int4 a partir de la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Poyu123/qwen3-8b-CoreAI-official
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Receta oficial de exportacion de Apple: https://github.com/apple/coreai-models
- Benchmark de referencia: https://github.com/john-rocky/apple-silicon-llm-bench
- Metodologia de bajada de exportacion: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/methodology/coreai-export-lowering.md
- CoreAIKit: https://github.com/john-rocky/coreai-kit
- Ejemplo ChatDemo: https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/ChatDemo
- Cookbook de operaciones: https://github.com/john-rocky/coreai-kit/blob/0.7.3/docs/COOKBOOK.md
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/0.7.3/Examples/ChatDemo/Sources/QuickStart.swift
- CoreAIChatMac: https://github.com/john-rocky/coreai-samples
- Leaderboard DeviceMark: https://devicemark.github.io/
