# mlboydaisuke/qwen3-4b-CoreAI-official

## Resumen

Este repositorio aloja conversiones precompiladas del modelo Qwen/Qwen3-4B al formato `.aimodel` de Apple Core AI, generadas mediante la receta oficial de exportación de Apple (`coreai-models`). El autor, mlboydaisuke, publica los artefactos sin modificaciones, junto con hashes SHA-256 y mediciones de rendimiento realizadas con la herramienta oficial `llm-benchmark`. El objetivo es facilitar la ejecución de un modelo de lenguaje de 4.000 millones de parámetros en dispositivos Apple Silicon (macOS e iOS) sin necesidad de realizar el proceso de conversión, que requiere un Mac con gran cantidad de RAM.

El modelo base Qwen3-4B es un modelo de lenguaje de última generación desarrollado por Alibaba, pero esta ficha se centra exclusivamente en la versión convertida para Core AI. La relevancia actual reside en la creciente demanda de inferencia local y privada en hardware de Apple, así como en la estandarización del formato `.aimodel` para el ecosistema Core AI. El repositorio incluye dos bundles: uno para macOS (int4, contexto dinámico) y otro para iOS (contexto estático de 4096 tokens, cuantización mixta 4/8 bits paletizada). No se proporcionan detalles sobre la arquitectura interna del modelo original, su entrenamiento o sus capacidades lingüísticas, más allá de lo que se deduce del nombre y de los casos de uso mostrados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el bundle iOS usa contexto estático de 4096 tokens, según la model card) |
| Tipos de cuantizacion | int4 (macOS), mixta 4/8 bits paletizada (iOS) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | .aimodel (formato de Apple Core AI) |

## Arquitectura y entrenamiento

La model card indica que estos bundles son exportaciones sin modificar del modelo Qwen/Qwen3-4B, realizadas con la receta oficial de `apple/coreai-models`. No se ofrece información sobre la arquitectura interna (probablemente un transformer denso, dado el tamaño), el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO. El proceso de exportación se ejecutó en un entorno específico (macOS 27.0 beta, Xcode 27.0, `coreai-core 1.0.0b1`, etc.) y se documenta que la misma receta puede producir artefactos con rendimientos variables según la versión del sistema operativo. Por tanto, cualquier detalle sobre el entrenamiento original del modelo base queda fuera del alcance de esta ficha.

## Capacidades

Según la documentación incluida, el modelo puede utilizarse para:

- Generación de texto y chat conversacional, como se demuestra en los ejemplos de `ChatSession` y `CoreAI.summarize`.
- Resumen de texto (operación `CoreAI.summarize`).
- Inferencia completamente en el dispositivo, sin conexión a internet.
- Integración con el kit CoreAIKit para desarrolladores Swift, que ofrece una API de alto nivel (`ChatSession`, `respond(to:)`, `streamResponse(to:)`).
- Ejecución mediante CLI y GUI a través del ejemplo ChatDemo.

No se mencionan capacidades específicas como tool calling, razonamiento multi-paso, visión, audio o soporte multilingüe. La model card no proporciona detalles sobre el conocimiento del modelo en dominios concretos.

## Casos de uso

- Aplicaciones de chat offline en macOS e iOS: el modelo se puede integrar en apps nativas de Apple mediante CoreAIKit, permitiendo conversaciones multi-turno con historial gestionado por `ChatSession`. Es adecuado para entornos donde la privacidad o la ausencia de conexión son críticas.
- Resumen automático de documentos o textos largos: la operación `CoreAI.summarize` ofrece un resumen generado localmente, útil para apps de productividad o lectura.
- Asistente personal integrado en apps de Apple: gracias a la API Swift sencilla, un desarrollador puede añadir un asistente conversacional a su app con pocas líneas de código, aprovechando la inferencia local.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: el ejemplo ChatDemo permite probar el modelo en un entorno gráfico o CLI, facilitando la evaluación de su comportamiento antes de integrarlo.
- Despliegue en dispositivos iOS con Neural Engine: el bundle iOS está optimizado para el ANE (Apple Neural Engine) y requiere compilación AOT, lo que permite ejecutar el modelo en iPhones con rendimiento razonable.
- Investigación y benchmarking de rendimiento en hardware Apple: los bundles pre-convertidos con hashes verificables sirven como referencia reproducible para medir la latencia y el throughput en distintos dispositivos, como se hace en el repositorio apple-silicon-llm-bench.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia obtenidas con la herramienta oficial `llm-benchmark` en modo greedy, que se resumen a continuación:

| Bundle | Protocolo | Decode (tok/s) | Prefill | Carga (en caliente) |
|---|---|---|---|---|
| macOS | M4 Max, 512p/1024g | 145.4 | 1,635 | 0.36 s |
| iOS (ANE, h18p) | iPhone 17 Pro, 512p/1024g | 13.2 | 546 | 0.46 s (frío ≈194 s) |

Estos datos reflejan el rendimiento del artefacto convertido, no la calidad del modelo. El bundle macOS es significativamente más rápido en decodificación que el iOS, lo que se espera por las diferencias de hardware y cuantización.

## Requisitos de hardware

- El bundle macOS (int4) ocupa 2.3 GB y el bundle iOS (mixto 4/8 bits) ocupa 2.5 GB. El repositorio completo pesa 9.5 GB, pero incluye ambos bundles y posiblemente otros archivos.
- Se requiere hardware Apple Silicon: el bundle macOS se probó en un M4 Max, y el bundle iOS en un iPhone 17 Pro (con Neural Engine h18p).
- Para ejecutar el bundle iOS, es necesario compilarlo AOT antes de usarlo: `xcrun coreai-build compile <ir>.aimodel --platform iOS --preferred-compute neural-engine --architecture h18p`.
- La model card indica que la conversión original requiere un Mac con mucha RAM (128 GB para el modelo de 20B), pero la ejecución solo necesita suficiente RAM para mapear el artefacto (mmap).
- Opciones de despliegue: CoreAIKit (SPM), ChatDemo (GUI/CLI), `llm-runner` y `llm-benchmark` desde el checkout de coreai-models, o la app CoreAIChatMac.
- No se proporcionan datos de VRAM, ya que el modelo se ejecuta en CPU/GPU/ANE de Apple, no en GPUs NVIDIA. La latencia medida es de 145.4 tok/s en decode para macOS y 13.2 tok/s para iOS, con prefills de 1,635 y 546 respectivamente.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo base Qwen3-4B podría compararse con otros modelos de 4B como Llama 3.2 3B o Gemma 3 4B, pero no se incluyen datos de benchmarks ni de rendimiento para esos modelos en esta ficha. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo es una conversión de Qwen3-4B, un modelo relativamente pequeño (4B parámetros), por lo que su capacidad de razonamiento complejo y conocimiento enciclopédico es limitada en comparación con modelos de mayor tamaño.
- No se ha proporcionado información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- El bundle iOS requiere compilación AOT antes de su uso, y el proceso de conversión original puede producir artefactos con rendimiento variable según la versión del sistema operativo (se menciona una variación de 2.2× entre macOS 26 y 27β).
- La licencia apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3-4B también tenga una licencia compatible (Qwen3-4B se distribuye bajo Apache 2.0, según el repositorio oficial).
- El modelo está diseñado exclusivamente para el ecosistema Apple Core AI; no es compatible con otros runtimes como vLLM, llama.cpp u Ollama.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco difundido; se recomienda verificar la integridad de los artefactos mediante los hashes SHA-256 publicados.

## Enlaces

- HuggingFace: https://huggingface.co/mlboydaisuke/qwen3-4b-CoreAI-official
- Repositorio oficial de exportación de Apple: https://github.com/apple/coreai-models
- CoreAIKit (kit de integración): https://github.com/john-rocky/coreai-kit
- Benchmark de Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- Ejemplos de apps CoreAI: https://github.com/john-rocky/coreai-samples
- CoreAI Model Zoo (modelos comunitarios): https://github.com/john-rocky/coreai-model-zoo
