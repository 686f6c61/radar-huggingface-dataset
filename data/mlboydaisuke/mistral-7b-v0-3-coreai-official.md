# mlboydaisuke/mistral-7b-v0.3-CoreAI-official

## Resumen

El modelo `mlboydaisuke/mistral-7b-v0.3-CoreAI-official` es un bundle `.aimodel` pre-convertido del modelo Mistral 7B Instruct v0.3, generado mediante el flujo de exportación oficial de Apple Core AI (`coreai.llm.export`). El autor, mlboydaisuke, publica artefactos ya convertidos para evitar que cada usuario necesite un Mac de gran memoria (la exportación del modelo de 20B requirió 128 GB de RAM) y para garantizar la reproducibilidad de los resultados, ya que la conversión puede variar entre versiones del sistema operativo.

El bundle está pensado para ejecutarse en dispositivos Apple Silicon, tanto en macOS como en iOS (este último requiere compilación AOT adicional). Incluye hashes SHA-256 del artefacto generado y mediciones de rendimiento obtenidas con la herramienta oficial `llm-benchmark` de Apple. El repositorio tiene un tamaño de 8.2 GB y el modelo base es `mistralai/Mistral-7B-Instruct-v0.3`, con licencia Apache 2.0.

La relevancia de este modelo radica en que ofrece una vía directa para desplegar un LLM de 7B parámetros en el ecosistema Core AI de Apple, con soporte para integración en aplicaciones Swift mediante el kit `CoreAIKit`, y con un rendimiento medido de 101.7 tokens por segundo en decodificación en un M4 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral 7B v0.3 (transformer decoder-only, sin detalles adicionales) |
| Parametros totales | 7B (segun nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (bundle macOS dinamico) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | .aimodel (bundle con main.mlirb) |

## Arquitectura y entrenamiento

El modelo es un finetune de `mistralai/Mistral-7B-Instruct-v0.3`, convertido al formato `.aimodel` de Apple Core AI mediante el comando `uv run coreai.llm.export mistral-7b-instruct-v0.3`. La conversión se realizó en un entorno con macOS 27.0 beta, Xcode 27.0, `coreai-core 1.0.0b1`, `coreai-torch 0.4.0`, `coreai-opt 0.2.0` y `torch 2.9.0`, usando el repositorio `apple/coreai-models` en el commit `b1cb71b` (código de exportación idéntico al upstream `0c1055f`).

No se proporcionan detalles sobre los datos de entrenamiento del modelo base ni sobre el proceso de fine-tuning. El artefacto publicado es un bundle pre-convertido que incluye el archivo `main.mlirb` con hash SHA-256 `81c422124f0ccbf7e5e325a846e77656a4efeef0fc70bf0c5e1dfeb48de7581e`. El autor señala que el repositorio fuente descarga 27 GB (incluye `consolidated.safetensors` duplicado), mientras que este bundle omite esa redundancia.

## Capacidades

La documentación proporcionada no detalla capacidades específicas del modelo. Al estar basado en Mistral-7B-Instruct-v0.3, se espera que herede las capacidades generales de ese modelo base, que incluyen:

- Generación de texto e instrucciones en varios idiomas (no especificados)
- Razonamiento y respuesta a preguntas
- Soporte de conversación multi-turno (el kit `CoreAIKit` mantiene historial de conversación)
- Ejecución completamente local en dispositivos Apple

No se mencionan capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Aplicaciones de chat offline en macOS: mediante el `ChatDemo` runner (GUI y CLI), se puede integrar el modelo en una app Swift con `ChatSession` para mantener conversaciones multi-turno sin conexión a internet.
- Asistente personal local en Apple Silicon: el modelo se ejecuta completamente en el dispositivo, lo que permite construir asistentes que no envían datos a servidores externos, con privacidad garantizada.
- Prototipado rápido de apps con Core AI: al ser un bundle pre-convertido, los desarrolladores pueden evitar el proceso de exportación (que requiere un Mac con mucha RAM) y centrarse en la integración mediante `CoreAIKit`.
- Generación de resúmenes de texto: el kit incluye la operación `CoreAI.summarize` que usa este modelo para resumir contenido, útil en apps de productividad.
- Despliegue en iOS (iPhone 17 Pro y posteriores): tras compilar el bundle con `xcrun coreai-build compile --platform iOS --preferred-compute neural-engine`, se puede ejecutar en dispositivos móviles, habilitando asistentes offline en el teléfono.
- Benchmarking y evaluación de rendimiento: el bundle incluye mediciones oficiales de `llm-benchmark`, lo que permite comparar el rendimiento de inferencia en distintos hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, se proporcionan mediciones de rendimiento de inferencia obtenidas con la herramienta oficial `llm-benchmark` de Apple en modo greedy:

| Bundle | Protocol | Decode tok/s | Prefill | Load (warm) | Peak RSS |
|---|---:|---:|---:|---:|
| macos | M4 Max, 512p/1024g | 101.7 | 976 | 0.56 s | 8.3 GB |

## Requisitos de hardware

- El bundle macOS está diseñado para Apple Silicon; se ha medido en un M4 Max con 8.3 GB de pico de RAM residente.
- La descarga del modelo ocupa 4.1 GB en Mac; el repositorio en HuggingFace tiene un tamaño de 8.2 GB.
- Para ejecutar la conversión desde el código fuente se necesita un Mac con gran cantidad de RAM (el autor menciona que la exportación del modelo de 20B se hizo en una máquina de 128 GB).
- Para iOS, se requiere compilar el bundle con `xcrun coreai-build compile` con la arquitectura `h18p` (iPhone 17 Pro) y preferencia de cómputo en Neural Engine.
- El modelo se integra con las herramientas `llm-runner` y `llm-benchmark` del repositorio `coreai-models`, así como con `CoreAIKit` para aplicaciones Swift.
- No se proporcionan datos de latencia o throughput en otras configuraciones de hardware.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Al tratarse de un bundle de conversión de Mistral-7B-Instruct-v0.3, una comparación relevante sería contra el modelo original en formato HuggingFace (safetensors) o contra otros LLMs convertidos al formato Core AI, pero no se ofrecen datos al respecto.

## Limitaciones y advertencias

- El modelo es un artefacto de conversión, no un modelo entrenado desde cero; su comportamiento depende del modelo base Mistral-7B-Instruct-v0.3, cuyas limitaciones (sesgos, alucinaciones, cobertura lingüística) se heredan.
- El formato `.aimodel` es específico del ecosistema Apple Core AI; no es compatible con herramientas estándar como vLLM, llama.cpp u Ollama.
- La ejecución en iOS requiere compilación AOT previa y solo se ha probado con la arquitectura `h18p` (iPhone 17 Pro).
- El rendimiento medido (101.7 tok/s) corresponde a un M4 Max con configuración específica; puede variar en otros dispositivos.
- El bundle se generó con versiones beta de macOS 27 y Xcode 27; la reproducibilidad en versiones estables no está garantizada (el autor documenta diferencias de rendimiento entre macOS 26 y 27 beta).
- No se especifican los idiomas soportados ni la longitud de contexto; estos datos deben consultarse en la documentación del modelo base Mistral-7B-Instruct-v0.3.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto reciente y con poca validación comunitaria.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlboydaisuke/mistral-7b-v0.3-CoreAI-official)
- [Repositorio apple/coreai-models](https://github.com/apple/coreai-models)
- [Repositorio coreai-kit (con Cookbook y ChatDemo)](https://github.com/john-rocky/coreai-kit)
- [Benchmark apple-silicon-llm-bench](https://github.com/john-rocky/apple-silicon-llm-bench)
- [Repositorio coreai-samples (CoreAIChatMac)](https://github.com/john-rocky/coreai-samples)
- [Repositorio coreai-model-zoo](https://github.com/john-rocky/coreai-model-zoo)
- [Metodología de exportación Core AI](https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/methodology/coreai-export-lowering.md)
