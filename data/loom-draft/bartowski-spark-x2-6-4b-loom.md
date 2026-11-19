# loom-draft/bartowski-Spark-X2.6-4B-loom

## Resumen

`loom-draft/bartowski-Spark-X2.6-4B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y un `model.json` de tarjeta) generado a partir del checkpoint GGUF sin modificar `bartowski/Spark-X2.6-4B-GGUF`, concretamente el fichero `Spark-X2.6-4B-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado orientado a la ejecución del modelo base sobre GPUs AMD concretas, el APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next` (el generador únicamente, sin LLM en el bucle).

El interés del paquete reside en que expone el modelo a través de `loom-serve`, un servidor compatible con la API de OpenAI (`/v1/chat/completions`), con soporte declarado de tool calling, modo de razonamiento configurable (`reasoning_effort` con valores `low` y `high`), ventana de contexto de 262.144 tokens por petición, hasta 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por preset. El modelo subyacente tiene 4B parámetros en cuantización Q4_K_M y licencia Apache 2.0.

Es relevante ahora para quienes trabajan con hardware AMD y quieren servir modelos GGUF sin depender de llama.cpp, ya que Loom genera kernels específicos para estas arquitecturas. Sin embargo, la propia model card indica que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, entre otras) aún no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de rendimiento ni de equivalencia funcional con la referencia de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Spark-X2.6-4B; el paquete Loom no especifica la arquitectura interna) |
| Parametros totales | 4B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); no se listan otras variantes en este paquete |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` + `weights.loom` + `tokenizer.json` + `llm_config.json` |

## Arquitectura y entrenamiento

No hay información en la documentación proporcionada sobre la arquitectura del modelo base Spark-X2.6-4B (tipo de transformer, atención, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO). El paquete Loom no modifica los pesos: parte del GGUF `Spark-X2.6-4B-Q4_K_M.gguf` de `bartowski/Spark-X2.6-4B-GGUF` y genera programas `.loom` específicos para las arquitecturas gfx1151 y gfx1201 mediante `loom-next`. La innovación técnica del artefacto es, por tanto, de despliegue y no de modelado: kernels generados para GPU AMD, pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). No se declara decodificación especulativa (marcada como "not applicable").

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas.
- Modo de razonamiento activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`low`, `high`; por defecto `high`).
- Contexto largo de hasta 262.144 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por preset.
- Sin entrada de imagen ni audio (marcados como "not applicable").
- Sin decodificación especulativa (marcada como "not applicable").
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de características, aunque existe una puerta de corrección `sampling` definida.

## Casos de uso

- Asistente conversacional autoalojado en estaciones AMD Strix Halo: servir el paquete con `loom-serve` y consumirlo desde un cliente compatible con OpenAI permite desplegar un chatbot local sin dependencia de la nube, aprovechando el contexto de 262.144 tokens para conversaciones largas.
- Procesamiento de documentos extensos en una sola petición: con 262.144 tokens de contexto se pueden ingerir contratos, informes o bases de código completas y hacer preguntas sobre ellos sin fragmentación ni recuperación externa.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite construir agentes que consulten APIs internas, bases de datos o sistemas de ficheros, con el razonamiento activado o desactivado según el coste tolerable.
- Generación de código asistida en el puesto de trabajo: un modelo de 4B en Q4_K_M es manejable en el APU Strix Halo y en la R9700, lo que permite autocompletado y explicación de código sin enviar el código a terceros.
- Razonamiento con esfuerzo configurable: usar `reasoning_effort: low` para tareas de baja latencia (clasificación, extracción) y `high` para problemas que requieren cadena de pensamiento, ajustando el coste computacional por petición.
- Despliegue en la Radeon AI PRO R9700 de 32 GB: el paquete incluye un preset específico (`chat-r9700`) para esta GPU, útil en estaciones de trabajo con esa tarjeta que necesiten servir un modelo pequeño con API estándar.
- Evaluación comparativa de runtimes: al estar generado contra la referencia de llama.cpp (puertas `golden` y `compare`), el paquete sirve para comparar el comportamiento de Loom frente a llama.cpp sobre el mismo GGUF, una vez se publiquen las mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible en la documentación; el modelo base es de 4B parámetros en Q4_K_M, pero no se publica el consumo de memoria del paquete ni del pool de Loom.
- GPU recomendadas: las dos arquitecturas AMD indicadas; no se mencionan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; solo se declaran los dos dispositivos AMD anteriores.
- Opciones de despliegue: `loom-serve` (instalado vía `pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete desde Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; las mediciones de rendimiento frente a llama.cpp figuran como pendientes de re-medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-Spark-X2.6-4B-loom` | 4B | 262.144 tokens | Apache 2.0 | Paquete Loom (`.loom`) sobre GGUF Q4_K_M; `loom-serve` | Solo GPUs AMD gfx1151 y gfx1201; sin benchmarks publicados |
| `bartowski/Spark-X2.6-4B-GGUF` (modelo base) | 4B | no disponible | Apache 2.0 (según este paquete) | GGUF; ejecutable con llama.cpp y derivados | Es el checkpoint de origen; el paquete Loom no modifica los pesos |
| Otros modelos de 4B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas en la documentación proporcionada |

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo nuevo: cualquier limitación del modelo base Spark-X2.6-4B se hereda sin cambios, y no se documentan sus sesgos, calidad o comportamiento.
- Ausencia total de evidencia de corrección: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`, etc.) figuran como "not yet re-measured", por lo que no está verificado que la salida coincida con la referencia de llama.cpp.
- Sin datos de rendimiento: no hay mediciones de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Compatibilidad restringida: solo se declaran los dispositivos AMD gfx1151 y gfx1201; no hay soporte documentado para otras GPUs, CPU ni plataformas.
- Idiomas no declarados: se desconoce el soporte multilingüe real del modelo base.
- Estado de muestreo indeterminado: la tabla de características marca `sampling` como "not determined", lo que introduce incertidumbre sobre el comportamiento de temperature, top_k y seed.
- Riesgo de alucinación: no evaluado ni documentado para este paquete ni para el modelo base en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero al no poder verificar la procedencia y condiciones del modelo base más allá de lo indicado, conviene revisar la licencia del repositorio `bartowski/Spark-X2.6-4B-GGUF` antes de un despliegue en producción.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-19), sin pipeline declarado; no hay señales de uso en producción.
- La model card está truncada en la sección de ficheros, por lo que puede faltar documentación adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Spark-X2.6-4B-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Spark-X2.6-4B-GGUF
- Generador Loom: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
