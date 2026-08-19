# mlboydaisuke/gemma-3-4b-it-CoreAI-official

## Resumen

Este repositorio contiene un bundle `.aimodel` pre-convertido del modelo `google/gemma-3-4b-it` de Google, generado siguiendo la receta oficial de exportación de Apple para su framework Core AI. El autor, `mlboydaisuke`, redistribuye el artefacto tal cual fue producido por el equipo de Apple, con hashes SHA-256 verificados y métricas de rendimiento medidas en hardware Apple Silicon. El objetivo es eliminar la necesidad de que cada desarrollador ejecute el proceso de conversión, que requiere un Mac con mucha memoria RAM, y ofrecer un archivo listo para usar en aplicaciones macOS e iOS.

El modelo base es Gemma 3 4B IT, un modelo de lenguaje de 4 mil millones de parámetros orientado a instrucciones y chat, desarrollado por Google. En esta versión, los pesos se han cuantizado a int4 con cómputo en bfloat16, lo que reduce el tamaño a 2,2 GB y permite una ejecución eficiente en dispositivos Apple. La relevancia actual radica en la creciente demanda de modelos locales que funcionen sin conexión en el ecosistema Apple, y en la necesidad de artefactos reproducibles y auditables para entornos de producción.

El repositorio incluye documentación sobre cómo usar el modelo a través de las APIs de Core AI, así como enlaces a herramientas complementarias como `coreai-kit`, `coreai-samples` y benchmarks independientes. Es una opción práctica para desarrolladores que quieran integrar un LLM de tamaño medio en aplicaciones nativas de Apple sin tener que lidiar con la conversión manual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (cómputo en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (gemma) |
| Formato de pesos | `.aimodel` (bundle de Apple Core AI) |

Nota: el tamaño del bundle macOS es de 2,2 GB y el repositorio completo ocupa 4,4 GB, probablemente incluyendo otros archivos o variantes.

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados en la información disponible. El repositorio se limita a indicar que se trata de una conversión del modelo base `google/gemma-3-4b-it` mediante la herramienta oficial de Apple `coreai.llm.export`, con la configuración por defecto del registro (bfloat16 para cómputo y cuantización int4). No se mencionan modificaciones sobre los pesos originales ni técnicas adicionales como RLHF o DPO.

El proceso de exportación se realizó en un entorno macOS 27.0 beta con Xcode 27.0 y las herramientas `coreai-core 1.0.0b1`, `coreai-torch 0.4.0`, `coreai-opt 0.2.0` y `torch 2.9.0`. El autor subraya que el artefacto es una copia exacta del generado por Apple, con hashes verificados, lo que garantiza reproducibilidad frente a las variaciones observadas entre versiones de macOS.

## Capacidades

- Generación de texto y chat multi-turno: el modelo está diseñado para mantener conversaciones, como demuestran los ejemplos de `ChatSession` y `streamResponse(to:)` en el README.
- Resumen de texto: se muestra un ejemplo de uso con `CoreAI.summarize`, lo que indica capacidad para condensar contenido.
- Ejecución totalmente en local (on-device): no requiere conexión a internet una vez descargado el modelo.
- Streaming de tokens: la API `streamResponse(to:)` permite recibir tokens a medida que se generan.
- Integración con el ecosistema Core AI de Apple: compatible con `CoreAIOps`, `CoreAIKit` y el runner CLI `llm-runner`.
- Soporte para macOS e iOS (este último requiere compilación AOT previa).

## Casos de uso

- Asistente personal offline en macOS: se puede integrar en una app de menú bar o en un atajo de teclado para responder preguntas o ejecutar comandos de voz sin enviar datos a la nube, gracias a su ejecución local y su tamaño reducido (2,2 GB).
- Resumen automático de documentos en apps de productividad: usar `CoreAI.summarize` para condensar artículos, correos o actas de reuniones directamente en la aplicación, con privacidad total.
- Chatbot de soporte integrado en una app de escritorio: mantener una sesión de chat persistente con `ChatSession` y `respond(to:)` para atender consultas de usuarios sin depender de servidores externos.
- Herramienta CLI para generación de texto en scripts: el runner `llm-runner` permite invocar el modelo desde terminal, útil para automatizar tareas como generar informes o clasificar texto.
- Prototipado rápido de aplicaciones de IA en Xcode: gracias a la integración con `CoreAIKit` y el ejemplo `ChatDemo`, los desarrolladores pueden probar el modelo en minutos sin configurar infraestructura.
- Aplicaciones iOS con inferencia en el Neural Engine: tras compilar el bundle con `coreai-build` para iPhone 17 Pro (h18p), se puede ofrecer un asistente de escritura o traducción que funcione sin conexión.

## Benchmarks y rendimiento

El README incluye mediciones realizadas con la herramienta oficial `llm-benchmark` de Apple, en modo greedy, sobre un Apple M4 Max. Estos datos reflejan el rendimiento de inferencia, no la calidad del modelo.

| Bundle | Protocol | Decode (tok/s) | Prefill (tok/s) | Load (warm) | Peak RSS |
|---|---|---:|---:|---:|---:|
| macOS | M4 Max, 512p/1024g | 141,5 | 1.669 | 0,32 s | 4,5 GB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El bundle está diseñado exclusivamente para Apple Silicon (macOS e iOS). No es compatible con GPUs NVIDIA o AMD.
- Almacenamiento: 2,2 GB para el bundle macOS; el repositorio completo ocupa 4,4 GB.
- Memoria RAM: el pico de uso medido es de 4,5 GB (peak RSS) en M4 Max, por lo que se recomienda al menos 8 GB de RAM para evitar swapping.
- GPU recomendada: integrada en el chip Apple Silicon (no se requiere GPU externa). El modelo puede aprovechar el Neural Engine en iOS tras compilar con `--preferred-compute neural-engine`.
- Sistemas operativos: macOS 26 o posterior (el export se realizó en macOS 27 beta); para iOS se requiere compilación AOT con Xcode 27 y un dispositivo con chip h18p (iPhone 17 Pro).
- Opciones de despliegue: `CoreAIOps` (operación de una línea), `CoreAIKit` (API Swift), `llm-runner` (CLI), `llm-benchmark` (medición) y `CoreAIChatMac` (app de chat).
- Latencia y throughput: los valores medidos son 141,5 tokens/s de decodificación y 1.669 tokens/s de prefill en M4 Max. El tiempo de carga en caliente es de 0,32 s.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo es una conversión directa de `google/gemma-3-4b-it`, por lo que su calidad es idéntica a la del original, pero no se ofrecen métricas de rendimiento frente a alternativas como Llama 3.2 3B o Qwen 2.5 4B en el contexto de Apple Core AI. Se recomienda consultar el repositorio `apple-silicon-llm-bench` para comparativas de rendimiento entre modelos en este formato.

## Limitaciones y advertencias

- Licencia: el uso está sujeto a los Gemma Terms of Use de Google. Aunque la licencia permite uso comercial, es necesario revisar las restricciones específicas (por ejemplo, la prohibición de usar el modelo para ciertos fines o la obligación de mantener atribuciones).
- Sesgos y alucinaciones: no se documentan en el repositorio. Como modelo de 4B, puede presentar limitaciones en razonamiento complejo o generación de hechos precisos, pero no hay datos disponibles al respecto.
- Portabilidad: el formato `.aimodel` es específico de Apple Core AI y no puede ejecutarse en otras plataformas (CUDA, ROCm, etc.). Para otros entornos, habría que usar el modelo original en formato safetensors o GGUF.
- Dependencia de la versión del sistema: el README advierte que el mismo comando de exportación produjo un artefacto 2,2 veces más lento en macOS 27 beta en comparación con macOS 26, lo que sugiere que el rendimiento puede variar significativamente según la versión del SO.
- Requisitos de conversión: aunque este repositorio ofrece el bundle ya convertido, si un desarrollador quisiera generar su propia versión, necesitaría un Mac con al menos 128 GB de RAM para modelos de 20B (para 4B probablemente menos, pero no se especifica).
- Para iOS: el bundle debe compilarse con AOT antes de usarse, y solo es compatible con iPhone 17 Pro (h18p) según la documentación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mlboydaisuke/gemma-3-4b-it-CoreAI-official
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Receta de exportación de Apple: https://github.com/apple/coreai-models
- Kit de integración CoreAI: https://github.com/john-rocky/coreai-kit
- Benchmarks de rendimiento: https://github.com/john-rocky/apple-silicon-llm-bench
- Modelos comunitarios: https://github.com/john-rocky/coreai-model-zoo
- Ejemplos de aplicaciones: https://github.com/john-rocky/coreai-samples
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
