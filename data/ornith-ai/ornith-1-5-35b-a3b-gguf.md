# ornith-ai/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepReinforce AI bajo la marca Ornith AI. Forma parte de la familia Ornith-1.5, orientada a tareas de codificación agéntica (agentic coding). Con 35.505 millones de parámetros totales, activa aproximadamente 3.000 millones por token, lo que permite una inferencia eficiente sin sacrificar capacidad. El modelo se entrena mediante un bucle de auto-mejora de extremo a extremo que genera nuevas tareas, construye scaffolds (andamiajes) y optimiza la política mediante aprendizaje por refuerzo, en lugar de depender de tareas fijas diseñadas por humanos. Está disponible en formato GGUF con licencia MIT, lo que facilita su despliegue local y su integración en entornos comerciales.

Según los benchmarks publicados, Ornith-1.5-35B-A3B supera a su predecesor Ornith-1.0-35B-A3B y a modelos comparables como Qwen3.6-35B-A3B, Gemma-4-31B y Muse-Glimmer-30B en tareas de codificación y agénticas, acercándose incluso a modelos de escala mucho mayor como Qwen3.5-397B. Es una opción atractiva para desarrolladores que necesitan un modelo de código autónomo con requisitos de hardware moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones no especificadas en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo MoE que activa aproximadamente 3.000 millones de parámetros por token, aunque el número total de parámetros es de 35.500 millones. La arquitectura exacta (número de expertos, dimensión del hidden state, etc.) no se detalla en la información proporcionada, pero se sabe que está diseñado para tareas de codificación y razonamiento agéntico.

El entrenamiento se basa en un bucle de auto-mejora de extremo a extremo. A diferencia de Ornith-1.0, que optimizaba únicamente el scaffold y los rollouts, Ornith-1.5 optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones. El modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora su política mediante aprendizaje por refuerzo (RL). Este enfoque elimina la dependencia de tareas humanas predefinidas y permite una mejora autónoma del rendimiento. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el número de tokens utilizados.

## Capacidades

- Generación de texto y código de alta calidad, especializado en tareas de programación.
- Razonamiento agéntico multi-paso: capaz de planificar y ejecutar secuencias de acciones para resolver problemas complejos.
- Soporte de tool calling y ejecución de comandos de terminal, como demuestran sus resultados en Terminal-Bench 2.1.
- Resolución de issues de software en repositorios reales (SWE-bench Verified y Pro).
- Construcción y optimización de scaffolds (harnesses) de forma autónoma, lo que le permite adaptarse a entornos de ejecución variables.
- Capacidad de auto-mejora: el propio modelo genera tareas de entrenamiento, lo que sugiere una mejora continua en entornos de producción.

## Casos de uso

- Desarrollo de software autónomo: el modelo puede recibir una descripción de una funcionalidad, generar el código correspondiente, ejecutar tests y corregir errores de forma iterativa, gracias a su capacidad de razonamiento agéntico y ejecución en terminal.
- Asistente de programación en terminal: integrable en herramientas de línea de comandos para ayudar a los desarrolladores a escribir, depurar y refactorizar código en tiempo real, aprovechando su alto rendimiento en Terminal-Bench.
- Resolución de issues en repositorios open source: puede analizar un issue de GitHub, localizar el código relevante, proponer un parche y validarlo mediante tests, como indica su puntuación en SWE-bench Verified (79).
- Integración en pipelines de CI/CD: el modelo puede actuar como agente de revisión de código, detectando bugs, sugiriendo mejoras y generando tests automáticos antes del despliegue.
- Generación de suites de tests: dada una función o módulo, puede crear casos de prueba exhaustivos, incluyendo casos límite, y ejecutarlos para verificar la corrección del código.
- Refactorización de código legacy: con su capacidad de razonamiento sobre código existente y su contexto de ventana (aunque no se ha confirmado el tamaño), puede transformar código antiguo a patrones modernos, manteniendo la funcionalidad.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados en la model card del modelo, comparándolo con varios modelos de referencia. Los valores marcados con "-" no fueron reportados.

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67,8 | 64,2 | 52,5 | 42,1 | 51,7 | 53,5 |
| Terminal-Bench 2.1 (Claude Code) | 68,5 | 62,8 | 49,2 | - | - | 48,6 |
| SWE-bench Verified | 79,0 | 75,6 | 73,4 | 52,0 | 76,0 | 76,4 |
| SWE-bench Pro | no disponible (dato truncado) | - | - | - | - | - |

No se han publicado resultados para otros benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Para inferencia local con cuantización GGUF, se estima que se necesitan entre 20 y 30 GB de VRAM, dependiendo del nivel de cuantización (p. ej., Q4_K_M requiere menos, Q8 requiere más). Esta es una estimación basada en el tamaño total de parámetros (35,5 B), no en datos oficiales.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para cuantizaciones altas o contexto largo.
- El modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM, como la RTX 3090 o RTX 4090, usando cuantización Q4 o inferior.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en la información disponible.
- El tamaño del repositorio (372,5 GB) sugiere que se incluyen múltiples archivos de cuantización, lo que permite elegir el equilibrio entre calidad y requisitos de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Licencia | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35,5 B | ~3 B | MIT | 79,0 | 67,8 |
| Ornith-1.0-35B-A3B | 35,5 B | ~3 B | MIT | 75,6 | 64,2 |
| Qwen3.6-35B-A3B | 35,5 B | ~3 B | Apache 2.0 (presumible) | 73,4 | 52,5 |
| Gemma-4-31B | 31 B (denso) | 31 B | Gemma License | 52,0 | 42,1 |
| Muse-Glimmer-30B | 30 B (denso) | 30 B | no disponible | 76,0 | 51,7 |
| Qwen3.5-397B | 397 B | no disponible | Apache 2.0 (presumible) | 76,4 | 53,5 |

Ornith-1.5-35B-A3B supera a todos los modelos de su categoría en los benchmarks publicados, e incluso iguala o supera a Qwen3.5-397B, un modelo mucho más grande, en tareas de codificación agéntica. Esto lo convierte en una opción muy eficiente en términos de coste computacional.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o comportamientos no deseados específicos de este modelo.
- Al estar especializado en codificación y tareas agénticas, su rendimiento en tareas generales de lenguaje (redacción, traducción, etc.) puede ser inferior al de modelos generalistas del mismo tamaño.
- La longitud de contexto no se ha confirmado en la información disponible; aunque modelos previos de Ornith (1.0) ofrecían 262K tokens, no se puede asumir que Ornith-1.5 mantenga ese valor.
- La licencia MIT permite uso comercial sin restricciones, pero no se ofrecen garantías sobre el rendimiento en producción.
- El proceso de auto-mejora puede generar comportamientos impredecibles si se utiliza en entornos no controlados; se recomienda supervisión humana en aplicaciones críticas.
- No se dispone de datos sobre latencia o throughput en diferentes configuraciones de hardware.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Blog de Ornith (anuncio de Ornith-1.5): https://deep-reinforce.com/ornith.html
- Sitio web de Ornith AI: https://ornith.ai/
- Guía de Ornith (modelos, VRAM, casos de uso): https://ornith.online/
- Repositorio de Ornith-1.0-35B (modelo base): https://huggingface.co/ornith-ai/Ornith-1.0-35B
- Repositorio alternativo con cuantizaciones de Ornith-1.0: https://huggingface.co/SC117/Ornith-1.0-35B-MTP-APEX-GGUF
