# Abiray/flint-40B-A2.5B-Q4_K_M-GGUF

## Resumen

Flint 40B-A2.5B es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por Recursive Superintelligence, Inc. y orientado específicamente a agentes de código, exploración autónoma de repositorios, corrección de errores y tool calling estructurado. El repositorio analizado, Abiray/flint-40B-A2.5B-Q4_K_M-GGUF, es una cuantización de 4 bits (Q4_K_M) del modelo base RecursiveSI/flint, publicada para su uso con llama.cpp.

El modelo combina 39.785.287.456 parámetros totales con aproximadamente 2,5 mil millones de parámetros activos por token gracias a 256 expertos enrutados (top-6) más un experto compartido, distribuidos en 49 capas (2 densas y 47 MoE). Esta dispersión permite mantener velocidades de generación propias de un modelo pequeño mientras se conserva la capacidad de uno grande. Soporta hasta 262.144 tokens de contexto mediante atención híbrida de ventana deslizante y global.

Su relevancia actual reside en el enfoque para cargas agénticas de programación y en su licencia Apache 2.0, que facilita el uso comercial. La cuantización Q4_K_M reduce el peso a unos 24 GB, lo que permite desplegarlo en estaciones de trabajo con 28-32 GB de memoria combinada, incluyendo configuraciones con offload parcial a CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) decoder-only Transformer (`flint`), 49 capas (2 densas + 47 MoE) |
| Parámetros totales | 39.785.287.456 (~39,8 mil millones) |
| Parámetros activos | ~2,5 mil millones por token (256 expertos enrutados, top-6 activos + 1 experto compartido) |
| Longitud de contexto | Hasta 262.144 tokens (atención híbrida de ventana deslizante + global) |
| Tipos de cuantización | Q4_K_M (4-bit k-quant medium); precisión original BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`flint-40B-A2.5B-Q4_K_M.gguf`, ~24 GB) |
| Desarrollador | Recursive Superintelligence, Inc. |
| Modelo base | RecursiveSI/flint |
| Repositorio de cuantización | Abiray/flint-40B-A2.5B-Q4_K_M-GGUF |
| Descargas / likes | 945 / 13 |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

Flint es un transformer decoder-only con arquitectura MoE propietaria denominada `flint`. Cada una de las 49 capas, salvo las dos primeras densas, contiene 256 expertos enrutados de los que se activan los 6 más relevantes por token, además de un experto compartido siempre activo. El resultado es un ratio de activación muy bajo: aproximadamente 2,5 mil millones de parámetros activos sobre 39,8 mil millones totales. La atención es híbrida, combinando ventanas deslizantes con atención global para alcanzar los 262.144 tokens de contexto sin un coste cuadrático completo en todas las capas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras etapas de alineación. La model card del repositorio cuantizado tampoco detalla innovaciones adicionales como decodificación especulativa. Sí se indica que la arquitectura requiere una compilación reciente de llama.cpp con soporte para `flint` (PR #30928 o cualquier release que lo incluya), lo que implica que no es compatible con versiones antiguas del runtime.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en tareas de agente autónomo sobre repositorios.
- Exploración de codebase y localización de fallos: el modelo está entrenado para navegar estructuras de proyecto y proponer parches.
- Tool calling y function calling estructurado, adecuado para integrarse en pipelines de agentes.
- Razonamiento multi-paso y trazas agénticas largas, con un presupuesto de razonamiento recomendado de 16.384 a 32.768 tokens para problemas difíciles.
- Conversación multi-turno con contexto extenso, gracias a la ventana de hasta 262.144 tokens.
- Capacidad de ejecución con offload parcial o total a CPU, manteniendo velocidad por su baja activación por token.
- Vision y audio: no disponibles según la información proporcionada.
- Cobertura multilingüe: no disponible; la model card no especifica idiomas.

## Casos de uso

- Agente de corrección de bugs en producción: el modelo puede recibir un informe de error, explorar los ficheros relevantes del repositorio y generar un parche candidato. Su contexto de 262.144 tokens permite incluir varios módulos y trazas de ejecución en una sola pasada.
- Automatización de revisiones de código en CI/CD: integrado mediante `llama-server` con API compatible con OpenAI, puede analizar diffs, señalar regresiones y sugerir cambios antes de fusionar una pull request.
- Asistente de refactorización de codebases grandes: con la ventana extendida y el modo agéntico, puede recorrer dependencias, proponer una estrategia de refactorización por fases y ejecutar tool calls para validar cada paso.
- Generación de tests unitarios: a partir de una función o módulo, el modelo produce casos de prueba y puede invocar herramientas para comprobar su ejecución, reduciendo el trabajo manual en proyectos con poca cobertura.
- Despliegue local en estaciones de trabajo: al caber en 28-32 GB de memoria combinada y funcionar con llama.cpp, es apto para entornos con requisitos de privacidad donde el código no puede salir a la nube.
- Migración de código entre versiones o frameworks: el modelo puede analizar un repositorio completo, identificar APIs obsoletas y generar cambios estructurados con justificación, usando el contexto largo para mantener coherencia entre ficheros.
- Soporte técnico especializado en programación: conversaciones multi-turno con historial extenso y capacidad de consultar documentación mediante tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos, por lo que no es posible presentar una tabla de rendimiento verificable.

## Requisitos de hardware

- VRAM/RAM estimada: al menos 28-32 GB de memoria combinada para pesos y KV cache durante la inferencia, según la model card.
- Peso del fichero: aproximadamente 24 GB para la cuantización Q4_K_M.
- GPU recomendadas: tarjetas con 32 GB o más, como RTX 5090 (32 GB), A100 40 GB u H100 80 GB, permiten cargar el modelo completo con contexto amplio. Una RTX 4090 de 24 GB queda justa y probablemente requiera offload parcial o reducir la longitud de contexto.
- Cabe en GPU de consumo con matices: sí en tarjetas de 32 GB; en 24 GB requiere offload a CPU o contextos reducidos.
- El ejemplo de la model card usa `llama-server -c 32768 -ngl 99`, lo que sugiere que un contexto práctico de 32.768 tokens es manejable en configuraciones de 24-32 GB, muy por debajo del máximo teórico de 262.144.
- Opciones de despliegue: llama.cpp mediante `llama-cli` y `llama-server` (API compatible con OpenAI). Ollama o LM Studio podrían funcionar si incorporan soporte para la arquitectura `flint`. vLLM y TGI no están confirmados en la información disponible.
- Throughput y latencia: no se han publicado cifras concretas. Cualitativamente, la activación de solo ~2,5 mil millones de parámetros por token favorece una generación rápida, aunque al ser MoE todos los expertos deben residir en memoria, por lo que el ancho de banda de RAM/VRAM condiciona el rendimiento.

## Comparativa con modelos similares

Los datos de rendimiento de Flint no están disponibles, por lo que la comparación se limita a especificaciones arquitectónicas y de licencia. Las cifras de los modelos alternativos provienen de información pública de sus respectivos repositorios.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Flint 40B-A2.5B (Q4_K_M) | ~39,8 B | ~2,5 B | 262.144 | Apache 2.0 | GGUF |
| Qwen3-Coder-30B-A3B | ~30,5 B | ~3,3 B | 262.144 nativo | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | ~15,7 B | ~2,4 B | 128.000 | Licencia DeepSeek (no Apache 2.0) | safetensors, GGUF |

Frente a Qwen3-Coder-30B-A3B, Flint ofrece un mayor número de parámetros totales y una activación por token algo menor, con una ventana de contexto equivalente. Frente a DeepSeek-Coder-V2-Lite, Flint triplica los parámetros totales manteniendo una activación similar y duplica el contexto, aunque este último tiene un tamaño mucho más contenido. La licencia Apache 2.0 de Flint es más permisiva que la de DeepSeek-Coder-V2-Lite para uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para este modelo; se desconoce su comportamiento en dominios sensibles.
- La model card no especifica los idiomas soportados, por lo que el rendimiento fuera del inglés y de lenguajes de programación habituales es incierto.
- El contexto máximo de 262.144 tokens es teórico; en la práctica, el KV cache crece con la longitud y puede agotar la memoria en configuraciones de 24-32 GB. La propia model card ejemplifica con 32.768 tokens.
- Requiere una versión reciente de llama.cpp con soporte para la arquitectura `flint` (PR #30928); versiones antiguas fallarán al cargar el modelo.
- Al ser una cuantización Q4_K_M, existe una pérdida de precisión respecto al BF16 original, potencialmente relevante en tareas de razonamiento complejo o generación de código muy sensible.
- Aunque la licencia es Apache 2.0, el modelo base y la cuantización deben verificarse por separado; la información disponible no indica restricciones adicionales del autor de la cuantización.
- No hay datos públicos de throughput, latencia ni consumo energético, lo que dificulta dimensionar infraestructura de producción.
- La fecha de creación del repositorio (2026-10-21) y el reducido número de descargas (945) implican poca validación comunitaria; conviene realizar pruebas propias antes de adoptarlo en producción.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Abiray/flint-40B-A2.5B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Organización del desarrollador: https://huggingface.co/RecursiveSI
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Pull request de soporte para la arquitectura `flint` (PR #30928): https://github.com/ggml-org/llama.cpp/pull/30928
- Paper, blog o demo oficial: no disponible en la información proporcionada.
