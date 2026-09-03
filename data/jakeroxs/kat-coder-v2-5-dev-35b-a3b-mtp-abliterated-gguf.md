# jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF

## Resumen

KAT-Coder V2.5 Dev 35B-A3B MTP Abliterated GGUF es una conversión a formato GGUF de un modelo de lenguaje de código basado en la arquitectura Qwen3.5 MoE, desarrollado por la comunidad (jakeroxs) a partir del checkpoint original de KwaiPilot. El modelo cuenta con 35.505 millones de parámetros totales, de los cuales aproximadamente 3.000 millones se activan por token gracias a su diseño de mezcla de expertos (MoE) con 256 expertos y 8 activos por token. Su longitud de contexto nativa es de 262.144 tokens, lo que lo sitúa entre los modelos de código más capaces en cuanto a ventana de procesamiento.

La versión GGUF aquí descrita incorpora dos modificaciones significativas sobre el modelo base: una capa de predicción multi-token (MTP) transplantada desde un checkpoint auxiliar, que permite decodificación especulativa nativa en llama.cpp, y un proceso de "abliteration" que elimina las capas de rechazo del modelo original, resultando en una versión sin censura. El resultado es un modelo de código de alto rendimiento que puede ejecutarse en GPUs de consumo con cuantización Q4_K_M y alcanzar velocidades de generación superiores a 330 tokens por segundo en hardware adecuado.

La relevancia de este modelo radica en su combinación de capacidades: contexto muy largo, eficiencia MoE, decodificación especulativa integrada y licencia Apache 2.0, lo que lo convierte en una opción atractiva para desarrolladores que necesitan un asistente de código potente y desplegable en infraestructura propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (qwen35moe) |
| Parametros totales | 35.505.251.456 (35,51 B) |
| Parametros activos | ~3 B (8 de 256 expertos activos por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (~20,2 GiB), BF16 (precisión completa) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el checkpoint base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 MoE, una evolución de la familia Qwen que emplea un mecanismo de mezcla de expertos con 256 expertos en total, de los cuales 8 se activan por token. Esta configuración permite mantener un coste computacional relativamente bajo (aproximadamente 3 B parámetros activos) mientras se aprovechan los 35,5 B parámetros totales del modelo. La capa de predicción multi-token (MTP) añade una cabeza adicional que predice varios tokens futuros simultáneamente, lo que habilita la decodificación especulativa nativa en llama.cpp mediante el parámetro `--spec-type draft-mtp`.

El proceso de construcción del checkpoint incluye dos pasos principales: primero, se aplicó "abliteration" al modelo original de KwaiPilot, un procedimiento que elimina las capas de rechazo (refusal) para producir una versión sin censura. Segundo, se transplantaron los tensores MTP desde un checkpoint auxiliar (Myric/KAT-Coder-V2.5-Dev-MTP-head) al modelo abliterado, cambiando `mtp_num_hidden_layers` de 0 a 1 y añadiendo los 19 tensores correspondientes. No se dispone de información detallada sobre el entrenamiento original (datos, número de tokens, técnicas de alineación) en la documentación proporcionada.

## Capacidades

- Generación de código en múltiples lenguajes, con soporte para razonamiento y resolución de problemas de programación.
- Decodificación especulativa MTP integrada, que acelera la generación entre un 20 y un 30 % en hardware con VRAM suficiente.
- Conversación multilingüe en inglés y chino, con capacidad de mantener diálogos de contexto largo (hasta 262.144 tokens).
- Modelo "uncensored" tras el proceso de abliteration, lo que elimina las respuestas de rechazo del modelo original.
- Soporte de razonamiento multi-paso y generación de texto técnico, gracias a su entrenamiento orientado a código.
- No se ha confirmado explícitamente el soporte de tool calling o function calling en la documentación disponible; se recomienda verificar en el checkpoint original.

## Casos de uso

- Asistente de programación en tiempo real: el modelo puede integrarse en editores o IDEs para autocompletar código, generar funciones y explicar fragmentos, aprovechando su contexto de 262K tokens para mantener el historial completo del proyecto.
- Generación de código en pipelines de CI/CD: su capacidad de razonamiento y generación de código permite automatizar la creación de tests, documentación y parches, con la ventaja de la decodificación especulativa para reducir la latencia en entornos de integración continua.
- Análisis y refactorización de repositorios grandes: la ventana de contexto de 262K tokens permite procesar archivos de código extensos o múltiples archivos relacionados en una sola pasada, facilitando tareas de revisión y refactorización.
- Chat técnico bilingüe (inglés-chino): el modelo puede actuar como asistente de soporte para equipos de desarrollo que trabajan en ambos idiomas, manteniendo conversaciones largas sin perder el hilo.
- Prototipado rápido de aplicaciones: los desarrolladores pueden generar esqueletos de aplicaciones, scripts y consultas SQL de forma iterativa, con respuestas sin censura que evitan bloqueos en temas sensibles.
- Investigación en decodificación especulativa: el modelo sirve como banco de pruebas para evaluar el rendimiento de la capa MTP en diferentes configuraciones de hardware y contextos, gracias a su implementación nativa en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de generación en dos configuraciones de hardware:

| Configuración | Velocidad de generación |
| --- | --- |
| RTX 5090 32 GB, Q4_K_M, Q8 KV, MTP desactivado | 265,45 tok/s |
| RTX 5090 32 GB, Q4_K_M, Q8 KV, MTP `n_max=2` | 333,72 tok/s |
| RTX 3080 Ti 12 GB, Q4_K_M, sin MTP | ~38,4 tok/s |
| RTX 3080 Ti 12 GB, Q4_K_M, MTP `n_max=2` | ~29–30 tok/s |
| RTX 3080 Ti 12 GB, Q4_K_M, MTP `n_max=1` | ~26,8 tok/s |

En la RTX 5090, la activación de MTP supuso un incremento del 25,7 % en el rendimiento, con una tasa de aceptación de borradores del 67,2 % (80,2 % en la primera posición especulativa y 54,3 % en la segunda). En la RTX 3080 Ti, la activación de MTP redujo el rendimiento debido a la falta de VRAM para mantener el modelo completamente en GPU, lo que provocó un mayor offloading.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 25 GiB para el modelo Q4_K_M con contexto completo de 262K tokens y caché KV en Q8_0, según la validación en RTX 5090.
- GPU recomendadas: NVIDIA RTX 5090 (32 GB) validada; RTX 4090 (24 GB) probablemente suficiente para el modelo Q4_K_M con contexto reducido, aunque no se ha probado explícitamente.
- En GPUs de 12 GB (como RTX 3080 Ti) el modelo funciona con offloading de capas, pero el rendimiento cae a ~38 tok/s sin MTP y empeora con MTP activado.
- Opciones de despliegue: llama.cpp (llama-server) con soporte para `--spec-type draft-mtp`; también compatible con otros runners de GGUF como Ollama, aunque la funcionalidad MTP requiere una build reciente de llama.cpp.
- Latencia y throughput: en RTX 5090 con MTP, se alcanzan 333,72 tok/s en generación determinista de 2.048 tokens; sin MTP, 265,45 tok/s.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Sin embargo, por su arquitectura y propósito, puede compararse con otros modelos MoE de código como DeepSeek-Coder-V2 (236B, contexto 128K), Qwen2.5-Coder-32B (denso, contexto 128K) o Mixtral 8x22B (contexto 64K). KAT-Coder V2.5 Dev 35B-A3B se distingue por su contexto de 262K tokens, su licencia Apache 2.0 y la capa MTP integrada, que no está presente en la mayoría de alternativas. No obstante, al carecer de benchmarks estándar, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El proceso de abliteration elimina las capas de rechazo, lo que puede reducir la calidad de las respuestas en dominios donde el modelo original aplicaba filtros de seguridad; además, el modelo puede generar contenido inapropiado o dañino si se le solicita.
- Solo se han confirmado los idiomas inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La capa MTP solo funciona con builds recientes de llama.cpp que soporten la arquitectura `qwen35moe` y la decodificación especulativa `draft-mtp`; en versiones antiguas, el modelo funcionará sin MTP.
- En GPUs con menos de 24 GB de VRAM, la activación de MTP puede degradar el rendimiento debido al offloading, como se observó en la RTX 3080 Ti.
- No se han publicado resultados de benchmarks estándar, por lo que no es posible evaluar su rendimiento en tareas como MMLU o HumanEval en comparación con otros modelos.
- El modelo es una conversión comunitaria; no hay garantía de soporte oficial ni de actualizaciones por parte del desarrollador original.

## Enlaces

- [Repositorio GGUF en HuggingFace](https://huggingface.co/jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF)
- [Checkpoint base en formato HuggingFace](https://huggingface.co/jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED)
- [Modelo original de KwaiPilot](https://huggingface.co/KwaiPilot/KAT-Coder-V2.5-Dev)
- [Checkpoint abliterated (Philadelphia Class)](https://huggingface.co/KridgeDookie/KAT-Coder-V2.5-Dev-35B-A3B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS)
- [Checkpoint MTP head](https://huggingface.co/Myric/KAT-Coder-V2.5-Dev-MTP-head)
