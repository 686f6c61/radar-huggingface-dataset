# Irfanuruchi/Polaris-V1-MLX-4bit

## Resumen

Polaris-V1-MLX-4bit es una conversión cuantizada a 4 bits del modelo Polaris-V1 de NitrAI Research, realizada por Irfanuruchi para permitir la inferencia eficiente en hardware Apple Silicon mediante la librería MLX. El modelo original es un sistema de razonamiento de 4 mil millones de parámetros, alineado mediante aprendizaje por refuerzo con recompensas basadas en síntesis de código multiarchivo y verificación de teoremas. Está diseñado para ejecutarse en hardware de consumo, con un consumo de VRAM de 3.2 GB y una ventana de contexto de 1.59 millones de tokens mediante extensión YaRN.

Esta versión MLX de 4 bits mantiene las capacidades del modelo original, incluyendo generación de código, razonamiento agéntico y soporte multilingüe (inglés y chino), con un tamaño efectivo de 4.503 bits por peso y un peso final de aproximadamente 2.2 GB. La conversión incluye correcciones de compatibilidad, como la normalización de la arquitectura de texto y la corrección del token EOS para evitar la generación repetida de tokens de fin de secuencia. Los benchmarks heredados del modelo base muestran resultados destacados en tareas de razonamiento de código, como SWE-bench Verified con un 31.4% de pass@1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (implementación MLX: qwen3_5) |
| Parámetros totales | 657.959.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.59M tokens (extensión YaRN) |
| Tipos de cuantización | 4-bit (modo affine, group size 64, 4.503 bits/peso) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX, safetensors |

## Arquitectura y entrenamiento

El modelo base Polaris-V1 es un modelo de razonamiento de 4 mil millones de parámetros desarrollado por NitrAI Research, con una arquitectura de transformer basada en el diseño de Qwen3.5. Se ha alineado mediante aprendizaje por refuerzo (RL) con recompensas derivadas de la síntesis de código multiarchivo y la verificación de teoremas, lo que le permite abordar tareas de razones de código complejas y trayectorias agénticas autónomas. El modelo original incorpora una ventana de contexto de 1.59M tokens mediante la extensión YaRN, lo que facilita el procesamiento de proyectos de código extensos.

La conversión a MLX de 4 bits se realizó con un modo de cuantificación affine y un grupo de tamaño 64, lo que produce un tamaño efectivo de 4.503 bits por peso. Durante la conversión, se identificaron y corrigieron dos problemas de compatibilidad: la arquitectura de texto se normalizó de `qwen3_5_text` a `qwen3_5` (la implementación expuesta por MLX-LM), y el token EOS se corrigió de `<|endoftext|>` (248044) a `<|im_end|>` (248046) para evitar la generación de tokens de fin de secuencia repetidos.

## Capacidades

- Generación de texto y razonamiento general: capaz de explicar conceptos complejos, responder preguntas y mantener conversaciones coherentes.
- Razonamiento de código: entrenado con recompensas de síntesis de código multiarchivo, destaca en tareas de programación complejas.
- Razonamiento agéntico: soporta trayectorias autónomas de múltiples pasos, útil para sistemas de agentes.
- Razonamiento multiarchivo: capaz de razonar sobre múltiples archivos de código de forma conjunta, como se demuestra en el benchmark DeepSWE.
- Capacidades multilingües: soporta inglés y chino.
- Inferencia local eficiente: cuantizado a 4 bits, diseñado para ejecutarse en hardware de consumo con requisitos de memoria reducidos.

## Casos de uso

- Asistente de programación en local: el modelo puede integrarse en IDEs o editores de código para ofrecer sugerencias de implementación y depuración, gracias a su capacidad de razonamiento de código y su tamaño reducido que permite ejecutarlo en portátiles.
- Automatización de tareas de desarrollo: puede generar código multiarchivo, por lo que es útil para generar esqueletos de proyectos, refactorizaciones o parches, aprovechando su capacidad de razonamiento profundo sobre múltiples archivos.
- Agentes autónomos de código: su entrenamiento con recompensas de trayectorias agénticas permite usarlo como motor de razonamiento en sistemas de agentes que interactúan con repositorios de código, ejecutan comandos y resuelven incidencias de forma autónoma.
- Asistente educativo de informática: puede explicar conceptos de programación, sistemas operativos o arquitectura de computadores de forma clara, como se muestra en el ejemplo de "explicar memoria virtual en tres puntos concisos".
- Prototipado rápido de aplicaciones con IA: por su licencia Apache 2.0 y su tamaño reducido, es adecuado para prototipar aplicaciones de IA en entornos con recursos limitados, como desarrollo en portátiles o en la nube con instancias pequeñas.
- Procesamiento de documentos de código extensos: con una ventana de contexto de 1.59M tokens, puede procesar proyectos de código completos de una sola vez, facilitando tareas de análisis de código o generación de documentación técnica.

## Benchmarks y rendimiento

Los siguientes resultados son heredados de la tarjeta del modelo original y no han sido reproducidos de forma independiente en esta conversión cuantizada:

| Benchmark | Tarea | Resultado |
|---|---|---|
| SWE-bench Verified | Code Generation & Agentic Reasoning | 31.4% pass@1 |
| WildClawBench | Autonomous Agentic Trajectories | 38.5% Task Completion Rate |
| DeepSWE | Deep Multi-File Code Reasoning | 26.8% pass@1 |

## Requisitos de hardware

- VRAM estimada para inferencia: 2.53 GB de memoria unificada en Apple Silicon (medido en M3 Pro).
- GPU recomendadas: cualquier chip Apple Silicon con memoria unificada de al menos 4 GB (M1/M2/M3/M4 en sus variantes base y Pro).
- Compatibilidad con GPU de consumo: no aplicable directamente; el formato MLX está diseñado para Apple Silicon. El modelo base (Polaris-V1) requiere aproximadamente 3.2 GB de VRAM en GPU NVIDIA.
- Opciones de despliegue: MLX-LM para Apple Silicon; el modelo base se puede desplegar con vLLM, llama.cpp, Ollama o TGI en GPU NVIDIA.
- Rendimiento validado: 47.79 tokens/segundo con pico de memoria de 2.53 GB en Apple M3 Pro (MLX 0.32.1, MLX-LM 0.31.3, Python 3.12.14).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento SWE-bench Verified |
|---|---|---|---|---|---|
| Polaris-V1-MLX-4bit | 4B | 1.59M (YaRN) | Apache 2.0 | MLX 4-bit | 31.4% pass@1 |
| Polaris-V1 (base) | 4B | 1.59M (YaRN) | Apache 2.0 | safetensors | 31.4% pass@1 |
| Qwen3-4B | 4B | no disponible | Apache 2.0 | safetensors | no disponible |

La comparación con Qwen3-4B se basa en el mismo tamaño de parámetros y la arquitectura subyacente, pero no hay datos de benchmark comparables disponibles en la información proporcionada. Polaris-V1 se distingue por su enfoque en el razonamiento de código y su extensión de contexto YaRN.

## Limitaciones y advertencias

- Los benchmarks presentados son heredados del modelo original y no han sido verificados de forma independiente en esta versión cuantizada; el rendimiento real puede variar.
- La cuantización de 4 bits puede introducir una pérdida de precisión en tareas de razonamiento complejas.
- El modelo se ha validado principalmente en Apple Silicon; su comportamiento en otras plataformas no está documentado.
- La ventana de contexto de 1.59M tokens es una extensión YaRN del modelo original; el rendimiento en contextos muy largos puede degradarse.
- Solo soporta inglés y chino; no se garantiza el rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base.
- El autor de la conversión (Irfanuruchi) no es el desarrollador original del modelo; la conversión se publica como un trabajo de la comunidad sin garantías.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/Irfanuruchi/Polaris-V1-MLX-4bit
- Modelo base: https://huggingface.co/nitrai-research/Polaris-V1
- Perfil del autor de la conversión: https://huggingface.co/Irfanuruchi
- Perfil de GitHub del autor: https://github.com/IrfanUruchi/
