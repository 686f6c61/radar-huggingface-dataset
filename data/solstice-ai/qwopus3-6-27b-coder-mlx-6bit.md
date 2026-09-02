# Solstice-AI/Qwopus3.6-27B-Coder-mlx-6Bit

## Resumen

Qwopus3.6-27B-Coder-mlx-6Bit es una cuantización en MLX de 6 bits del modelo Qwopus3.6-27B-Coder, desarrollada por Solstice-AI para su ejecución eficiente en Apple Silicon con 24 GB o más de memoria unificada. El modelo base, creado por Jackrong, es un transformer denso de 27 000 millones de parámetros especializado en generación de código agéntico, tool calling y razonamiento multi-paso, construido sobre Qwopus3.6-27B-v2 (una versión con razonamiento mejorado de Qwen3.6-27B) y destilado con patrones de generación de código de Claude Opus.

Esta versión MLX reduce el peso del modelo a 21,9 GB y mantiene una ventana de contexto de 131 072 tokens, lo que permite ejecutar un asistente de código de alto rendimiento de forma local en ordenadores Mac con chip M-series. Su relevancia radica en ofrecer una alternativa de código abierto (licencia Apache 2.0) a modelos propietarios de pago, con capacidades de agente y razonamiento, sin depender de APIs externas.

El modelo se distribuye en formato MLX (safetensors) y se sirve mediante el motor Anvil, aunque también existe una versión GGUF con predicción multi-token (MTP) para otros entornos de despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen 3.6) |
| Parametros totales | 26 895 993 856 (~27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens (2^17) |
| Tipos de cuantizacion | MLX 6-bit group quantized; también disponible GGUF con MTP |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), GGUF (variante MTP) |

## Arquitectura y entrenamiento

El modelo base Qwopus3.6-27B-Coder es un transformer denso de 27B parámetros, derivado de Qwopus3.6-27B-v2, que a su vez es una versión con razonamiento mejorado de Qwen3.6-27B. Sobre esta base se aplicó un fine-tuning especializado en generación de código agéntico, tool calling estructurado, depuración y seguimiento de instrucciones. Según la descripción del autor, el modelo incorpora patrones de generación de código de Claude Opus, lo que sugiere un proceso de destilación o ajuste guiado por ese modelo propietario.

La cuantización MLX 6-bit realizada por Solstice-AI utiliza agrupación de pesos (group quantization) para reducir el tamaño de 27B parámetros a 21,9 GB, optimizando el uso de memoria unificada en Apple Silicon. El motor de inferencia recomendado es Anvil, que proporciona gestión de memoria optimizada y servidor compatible con la API de OpenAI. No se han publicado detalles sobre el dataset de entrenamiento específico ni sobre el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en tareas de programación agéntica.
- Razonamiento multi-paso y modo "thinking" (el modelo reporta resultados con thinking-off, lo que indica que puede operar en ambos modos).
- Tool calling estructurado para integración con funciones externas y APIs.
- Depuración de código y corrección de errores en contextos de repositorio.
- Seguimiento de instrucciones complejas en conversaciones multi-turno.
- Capacidades multilingües limitadas a inglés y chino.
- Ventana de contexto larga de 131 072 tokens, adecuada para análisis de repositorios completos o documentación extensa.

## Casos de uso

- Asistente de programación local en Mac: desarrolladores que trabajan con Xcode, VS Code o JetBrains pueden ejecutar el modelo en segundo plano para autocompletado, generación de funciones y explicación de código sin enviar datos a la nube, gracias a su formato MLX optimizado para Apple Silicon.
- Agente de resolución de issues en repositorios: con su ventana de 131K tokens y capacidades de tool calling, puede analizar un repositorio completo, identificar bugs y proponer parches, similar a lo que reporta SWE-bench Verified.
- Automatización de tareas de refactorización: el modelo puede recibir un código legacy y generar versiones modernizadas, con tests asociados, en un flujo de trabajo agéntico multi-paso.
- Generación de tests unitarios y de integración: dado su entrenamiento en código y razonamiento, puede crear suites de pruebas a partir de especificaciones o código existente, integrándose en pipelines de CI/CD.
- Chatbot técnico interno: empresas que necesitan un asistente de soporte para desarrolladores, con respuestas en inglés o chino, desplegado en infraestructura propia mediante el servidor OpenAI-compatible de Anvil.
- Educación y formación en programación: el modelo puede explicar conceptos, revisar ejercicios y generar ejemplos prácticos, funcionando como tutor local sin coste por uso.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Qwopus3.6-27B-Coder y a su base Qwopus3.6-27B-v2, no a la cuantización MLX 6-bit específica. No se han publicado benchmarks independientes para esta versión cuantizada.

| Benchmark | Resultado | Modelo | Modo |
|---|---|---|---|
| MMLU-Pro | 87,43 % | Qwopus3.6-27B-v2 (base) | No especificado |
| SWE-bench Verified | 75,25 % | Qwopus3.6-27B-v2 (base) | No especificado |
| SWE-bench Verified | 67,0 % | Qwopus3.6-27B-Coder | Thinking-off (500 tareas) |

La cuantización 6-bit puede introducir una degradación leve en la calidad de las respuestas, pero no se dispone de datos cuantitativos al respecto.

## Requisitos de hardware

- Apple Silicon con 24 GB o más de memoria unificada (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3/M4 series).
- Tamaño del modelo: 21,9 GB en disco.
- VRAM estimada: al ser MLX, utiliza memoria unificada; se recomiendan 24 GB como mínimo para la ventana de contexto completa.
- Inferencia mediante el motor Anvil (instalable con script) o directamente con la librería MLX.
- Para la variante GGUF MTP, se puede usar llama.cpp, Ollama o servidores compatibles con GGUF en CPU o GPU NVIDIA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | SWE-bench Verified | Formato |
|---|---|---|---|---|---|
| Qwopus3.6-27B-Coder-mlx-6Bit | 27B | 131K | Apache 2.0 | 67,0 % (base, thinking-off) | MLX 6-bit |
| Qwopus3.6-27B-Coder (base) | 27B | 131K | Apache 2.0 | 67,0 % | safetensors, GGUF |
| Qwen3.6-27B (base) | 27B | No disponible | Apache 2.0 | No disponible | safetensors |
| Claude Opus (propietario) | No público | 200K | Comercial | No público | API |

La comparativa se limita a los datos disponibles. No se han encontrado modelos de código abierto de tamaño similar con benchmarks comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización 6-bit puede reducir ligeramente la precisión en tareas de razonamiento complejo o generación de código muy específico en comparación con el modelo en precisión completa.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El modelo está optimizado para Apple Silicon; en otras plataformas se debe usar la variante GGUF, que puede tener un rendimiento inferior.
- Riesgo de alucinación en código: como cualquier modelo generativo, puede producir código sintácticamente válido pero incorrecto o inseguro; se recomienda revisión humana en entornos de producción.
- Comunidad pequeña y adopción temprana: solo 48 descargas y 0 likes en HuggingFace, lo que implica poca validación externa y soporte limitado.
- Los benchmarks citados provienen del modelo base y no de esta cuantización; los resultados reales pueden variar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones derivadas de su destilación de Claude Opus; se recomienda verificar los términos del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Solstice-AI/Qwopus3.6-27B-Coder-mlx-6Bit
- Modelo base (Jackrong): https://huggingface.co/Jackrong/Qwopus3.6-27B-Coder
- Variante GGUF con MTP: https://huggingface.co/Jackrong/Qwopus3.6-27B-Coder-MTP-GGUF
- Motor Anvil: https://github.com/Solstice-Labs/anvil
- Artículo en dev.co: https://dev.co/ai/llms/qwopus3-6-27b-coder-mtp-gguf
- Artículo en llm.co: https://llm.co/llms/qwopus3-6-27b-coder-mtp-gguf
- Página de local-ai-zone: https://local-ai-zone.github.io/models/qwopus3-6-27b-coder-mtp.html
