# mlboydaisuke/gemma-3-12b-it-CoreAI-official

## Resumen

Este repositorio contiene una conversión precompilada del modelo `google/gemma-3-12b-it` de Google al formato `.aimodel` de Apple, generada mediante la receta oficial de exportación del proyecto [apple/coreai-models](https://github.com/apple/coreai-models). El autor, `mlboydaisuke`, distribuye el artefacto tal cual se produce, sin modificaciones, junto con hashes SHA-256 y métricas de rendimiento medidas con la herramienta oficial `llm-benchmark` de Apple. El objetivo es ofrecer un paquete reproducible y listo para ejecutar en Apple Silicon, evitando que cada usuario tenga que realizar la conversión, que requiere un Mac con mucha memoria RAM.

El modelo resultante es un bundle `.aimodel` para macOS (dinámico, cuantización int4 con cómputo en bf16) que se puede cargar mediante las APIs de Core AI (CoreAIOps, CoreAIKit) o con las utilidades de línea de comandos `llm-runner` y `llm-benchmark`. En las pruebas publicadas sobre un Apple M4 Max alcanza una velocidad de decodificación de 55 tokens por segundo, con un pico de memoria residente de 13,4 GB. También se proporcionan instrucciones para compilar el bundle para iOS mediante compilación AOT. La licencia es la de Gemma (Gemma Terms of Use), y el uso está sujeto a sus condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: `google/gemma-3-12b-it`, Transformer) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 (cómputo en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | `.aimodel` (bundle de Apple, contiene `main.mlirb`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo, ya que se trata de una conversión del modelo base `google/gemma-3-12b-it`, que es un transformer denso de 12 mil millones de parámetros con capacidades multimodales. No se ha realizado ningún reentrenamiento ni ajuste adicional; el bundle `.aimodel` es el resultado de aplicar la receta de exportación oficial de Apple sobre los pesos originales. La conversión utiliza cuantización int4 con cómputo en bf16, lo que reduce el tamaño del artefacto a aproximadamente 6 GB para el bundle de macOS (aunque el repositorio completo ocupa 13,3 GB, posiblemente incluyendo otros archivos). No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de alineación del modelo original.

## Capacidades

Las capacidades específicas del modelo no se enumeran en la documentación proporcionada. Al ser una conversión sin modificar de `google/gemma-3-12b-it`, hereda las capacidades del modelo base, que incluyen:

- Generación de texto y chat multi-turno.
- Razonamiento y respuesta a instrucciones.
- Soporte multimodal (entrada de texto e imágenes) en la versión original, aunque no se confirma que esta conversión conserve dicha funcionalidad.
- Posibilidad de ejecución completamente local y offline en dispositivos Apple.

La model card muestra ejemplos de uso para resumen de texto (`CoreAI.summarize`) y chat interactivo (`ChatSession`), lo que indica que el modelo puede utilizarse para tareas conversacionales y de síntesis.

## Casos de uso

- Chat local en macOS: mediante la aplicación ChatDemo (GUI o CLI) se puede conversar con el modelo sin conexión, seleccionándolo en el selector de modelos. Es útil para entornos sin acceso a internet o con requisitos de privacidad.
- Resumen de texto automatizado: la operación `CoreAI.summarize` permite generar resúmenes de documentos o conversaciones directamente en el dispositivo, integrándola en flujos de trabajo de productividad.
- Asistentes headless en macOS: el CLI `chat-cli` permite ejecutar el modelo desde scripts o servicios, facilitando la automatización de tareas como generación de informes, clasificación de correos o extracción de información.
- Integración en aplicaciones Swift: mediante el paquete SPM `CoreAIKit`, se puede incorporar el modelo en cualquier app de macOS con pocas líneas de código, manteniendo la conversación multi-turno con `ChatSession`.
- Despliegue en iOS: tras compilar el bundle con AOT (`xcrun coreai-build compile`), el modelo puede ejecutarse en iPhone 17 Pro (arquitectura h18p) y otros dispositivos compatibles, habilitando asistentes offline en móviles.
- Benchmarking y evaluación de rendimiento: los artefactos incluyen hashes y métricas oficiales, lo que permite reproducir pruebas de velocidad y memoria en diferentes configuraciones de Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia obtenidas con la herramienta oficial `llm-benchmark` de Apple, en modo greedy, sobre un Apple M4 Max:

| Bundle | Protocol | Decode (tok/s) | Prefill | Load (warm) | Peak RSS |
|---|---:|---:|---:|---:|---:|
| macOS | M4 Max, 512p/1024g | 55,0 | 578 | 5,4–7,7 s | 13,4 GB |

Estos valores corresponden al bundle de macOS con cuantización int4 y cómputo bf16. No se aportan comparaciones con otros modelos.

## Requisitos de hardware

- Para ejecutar el modelo en macOS se necesita un Apple Silicon con suficiente memoria RAM para mapear el artefacto en memoria; el pico de RSS medido es de 13,4 GB, por lo que se recomienda al menos 16 GB de RAM unificada.
- La conversión del modelo original a `.aimodel` requiere un Mac con mucha memoria (el autor menciona 128 GB para el modelo de 20B), pero la ejecución solo necesita RAM para el mmap.
- El bundle probado se ejecutó en un Apple M4 Max; no se especifican requisitos mínimos para otros chips, aunque es razonable esperar que funcione en cualquier Apple Silicon con suficiente memoria.
- Para iOS, se requiere compilación AOT con `xcrun coreai-build compile` y un dispositivo con arquitectura compatible (por ejemplo, h18p para iPhone 17 Pro).
- Opciones de despliegue: CoreAIOps (operaciones de alto nivel), CoreAIKit (integración Swift), `llm-runner` y `llm-benchmark` (CLI), y la aplicación CoreAIChatMac.
- La latencia y el throughput dependen del hardware; los valores medidos en M4 Max son 55 tok/s de decodificación y 578 tokens de prefill (sin unidad especificada, probablemente tokens por segundo o total de prefill).

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la información proporcionada. El modelo base `google/gemma-3-12b-it` es comparable a otros modelos de 12B como Llama 3.1 8B o Mistral 7B, pero no se aportan datos de rendimiento relativo en esta ficha. Se recomienda consultar los benchmarks del modelo original para una comparativa de calidad.

## Limitaciones y advertencias

- La conversión es un artefacto de compilación y no una función pura de la receta: el mismo comando de exportación produjo un artefacto 2,2 veces más lento al pasar de macOS 26 a macOS 27 beta, por lo que el rendimiento puede variar según la versión del sistema operativo.
- El bundle de iOS requiere compilación AOT antes de su uso en dispositivo; no es directamente ejecutable sin ese paso.
- No se especifican los idiomas soportados ni el contexto máximo, por lo que se debe asumir que coinciden con los del modelo base `google/gemma-3-12b-it`.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos completos en [ai.google.dev/gemma/terms](https://ai.google.dev/gemma/terms).
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto reciente y poco validado por la comunidad.
- No se documentan sesgos ni riesgos de alucinación específicos, pero al ser un modelo de lenguaje, presenta los riesgos habituales de generación de contenido incorrecto o sesgado.

## Enlaces

- Repositorio HuggingFace: [mlboydaisuke/gemma-3-12b-it-CoreAI-official](https://huggingface.co/mlboydaisuke/gemma-3-12b-it-CoreAI-official)
- Modelo base: [google/gemma-3-12b-it](https://huggingface.co/google/gemma-3-12b-it)
- Receta de exportación de Apple: [apple/coreai-models](https://github.com/apple/coreai-models)
- Kit de integración Swift: [john-rocky/coreai-kit](https://github.com/john-rocky/coreai-kit)
- Benchmarks de Apple Silicon: [john-rocky/apple-silicon-llm-bench](https://github.com/john-rocky/apple-silicon-llm-bench)
- Aplicaciones de ejemplo: [john-rocky/coreai-samples](https://github.com/john-rocky/coreai-samples)
- Modelos comunitarios: [john-rocky/coreai-model-zoo](https://github.com/john-rocky/coreai-model-zoo)
- Términos de uso de Gemma: [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
