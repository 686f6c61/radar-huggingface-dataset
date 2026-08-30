# itr0next/ornith

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9.197 millones de parámetros desarrollado por Ornith AI, especializado en tareas agénticas y generación de código. Forma parte de la familia Ornith-1.5, que introduce un bucle de auto-mejora end-to-end: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de solución que se utilizan para entrenamiento por refuerzo. Este enfoque extiende el marco de auto-scaffolding de Ornith-1.0, que a su vez se construyó sobre Qwen3.5 y Gemma4 mediante entrenamiento continuado, mid-training y post-training.

El modelo está diseñado para despliegue eficiente en una única GPU y existe una variante cuantizada (Ornith-1.5-9B-Mobile) orientada a dispositivos móviles. Su relevancia actual radica en que demuestra que un modelo de 9B puede alcanzar resultados competitivos en benchmarks de coding agéntico, superando a modelos más grandes como Qwen3.5-9B y acercándose a modelos MoE de 35B. La licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integración en productos.

El repositorio de HuggingFace analizado (itr0next/ornith) contiene pesos en formato GGUF con cuantizaciones, preparados para inferencia local con llama.cpp, Ollama u otras herramientas compatibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso, no MoE) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (en Ornith-1.0 era 262.144 tokens, no confirmado para 1.5) |
| Tipos de cuantizacion | Varias cuantizaciones GGUF (no especificadas en el repo) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (en este repo), safetensors (original) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo denso basado en la arquitectura transformer estándar, aunque no se han publicado detalles arquitectónicos específicos (número de capas, dimensiones, etc.). Según la documentación, se desarrolló sobre Qwen3.5 y Gemma4 mediante continued pretraining, mid-training y post-training. La innovación principal es el bucle de auto-mejora: el modelo genera nuevas tareas de entrenamiento, construye scaffolds (harness) específicos para cada tarea y produce rollouts de solución que se utilizan para mejorar la política mediante aprendizaje por refuerzo. Este proceso reemplaza la dependencia de tareas curadas por humanos y diseños manuales de harness.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del RL (si se usó RLHF, DPO u otro algoritmo). La información disponible se limita a la descripción conceptual del proceso.

## Capacidades

- Generación de código y resolución de tareas de programación agéntica, incluyendo edición de repositorios completos (SWE-bench).
- Ejecución de comandos en terminal y automatización de tareas de línea de comandos (Terminal-Bench).
- Soporte de tool calling y function calling, permitiendo integración con herramientas externas.
- Razonamiento multi-paso y planificación para tareas complejas de agente.
- Capacidad de auto-generación de tareas y scaffolds, lo que le permite mejorar su propio rendimiento en bucles de entrenamiento.
- Interfaz compatible con OpenAI (según documentación de Ornith-1.0, probablemente también en 1.5).
- Soporte de contexto largo (256K en Ornith-1.0, no confirmado para 1.5).

## Casos de uso

- Asistente de programación en IDE: el modelo puede sugerir ediciones de código, refactorizaciones y correcciones de errores en proyectos reales, aprovechando su rendimiento en SWE-bench Verified (70,6%).
- Automatización de tareas de terminal: puede ejecutar comandos, interpretar salidas y tomar decisiones para completar tareas administrativas o de desarrollo, como se evalúa en Terminal-Bench.
- Agente de resolución de incidencias en repositorios: integrado en un pipeline de CI/CD, puede analizar issues, generar parches y ejecutar pruebas de forma autónoma.
- Generación de código en producción: con soporte de tool calling, puede integrarse en sistemas de generación de código que requieren llamadas a APIs o bases de datos.
- Despliegue en edge: la variante cuantizada Mobile permite ejecutar el modelo en dispositivos móviles o hardware limitado para asistentes de código offline.
- Investigación en auto-mejora de modelos: su arquitectura de auto-generación de tareas y scaffolds lo convierte en una plataforma de estudio para técnicas de RL aplicadas a modelos de lenguaje.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados publicados en la model card (parcialmente visible). Se comparan con Ornith-1.0-9B, Qwen3.5-9B, Qwen3.6-35B-A3B y Gemma-4-31B.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47,0 | 40,6 | 18,9 | 49,2 | - |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 | 73,4 | 52,0 |
| SWE-bench Pro | 47,5 | 42,9 | 31,3 | 49,5 | 35,7 |

Nota: la tabla original se corta en SWE-bench Multilingual, por lo que no se dispone de más resultados. Los valores son los publicados por el autor.

## Requisitos de hardware

- El modelo denso de 9B en precisión completa (fp16) requiere aproximadamente 18-20 GB de VRAM, por lo que cabe en GPUs de 24 GB como la RTX 4090 o en una A100 de 40 GB.
- Según la documentación, el modelo cabe en una única GPU de 80 GB (A100/H100) sin necesidad de sharding.
- Con cuantización GGUF (por ejemplo, Q4_K_M), el modelo puede ocupar entre 5 y 7 GB, permitiendo ejecución en GPUs de 8 GB (RTX 3070, RTX 4060) o incluso en CPU con suficiente RAM.
- La variante Mobile está optimizada para dispositivos con recursos muy limitados.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierten los pesos), TGI, o mediante la interfaz OpenAI-compatible.
- No se han publicado datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) |
|---|---|---|---|---|---|
| Ornith-1.5-9B | 9,2B | No disponible | MIT | 70,6 | 46,2 |
| Ornith-1.0-9B | 9,2B | 256K | MIT | 69,4 | 43,1 |
| Qwen3.5-9B | 9,2B | No disponible | Apache 2.0 | 53,2 | 21,3 |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | No disponible | Apache 2.0 | 73,4 | 52,5 |
| Gemma-4-31B | 31B | No disponible | Gemma | 52,0 | 42,1 |

Ornith-1.5-9B supera claramente a Qwen3.5-9B en benchmarks de coding agéntico y se acerca a modelos mucho más grandes como Qwen3.6-35B-A3B, con una fracción de los parámetros activos. Frente a Gemma-4-31B, también obtiene mejores resultados en SWE-bench Verified.

## Limitaciones y advertencias

- No se han documentado limitaciones específicas en la model card. Sin embargo, como modelo de generación de texto, presenta riesgos comunes de alucinación, especialmente en tareas de razonamiento complejo o cuando se le pide información factual.
- Al estar especializado en coding agéntico, su rendimiento en tareas generales de lenguaje (redacción, traducción, etc.) puede ser inferior al de modelos de propósito general del mismo tamaño.
- La longitud de contexto no está confirmada para la versión 1.5; si se hereda de Ornith-1.0 (256K), el uso de ventanas muy largas puede aumentar significativamente el consumo de memoria.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se basa en Qwen3.5 y Gemma4, cuyas licencias originales pueden imponer condiciones adicionales (aunque el autor declara MIT, conviene verificar la compatibilidad).
- El repositorio analizado (itr0next/ornith) es un upload de GGUF de un tercero; no se garantiza que las cuantizaciones estén optimizadas con imatrix de forma oficial.
- No se dispone de información sobre sesgos demográficos o culturales del modelo.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/itr0next/ornith
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.ai/
- GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Guía de Ornith AI (modelos, VRAM, benchmarks): https://ornith.online/
