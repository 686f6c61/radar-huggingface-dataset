# ornith-ai/Ornith-1.5-35B-A3B-MLX-8bit

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Ornith AI, presentado como la segunda generación de su familia de modelos. Este modelo se construye sobre las arquitecturas de Qwen3.5 y Gemma4, con un proceso de entrenamiento que incluye *continued pretraining*, *mid-training* y *post-training*. La innovación principal de Ornith-1.5 reside en su bucle de auto-mejora de extremo a extremo: el propio modelo genera nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora su política mediante aprendizaje por refuerzo, sin depender de tareas fijas curadas por humanos.

Esta ficha documenta la versión **MLX-8bit** del modelo, que es una cuantización a 8 bits en formato MLX (optimizado para Apple Silicon). El modelo tiene aproximadamente 9.750 millones de parámetros totales, de los cuales solo unos 3.000 millones se activan por token, lo que permite un rendimiento notable con un coste computacional reducido. El modelo está orientado principalmente a tareas de codificación, razonamiento y uso como agente, y según el autor, supera a modelos densos de tamaño similar como Gemma 4-31B y Muse Glimmer-30B en benchmarks de codificación agéntica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5 (etiqueta: qwen3_5_moe) |
| Parametros totales | 9.749.130.368 (aprox. 35B en notacion del autor) |
| Parametros activos | ~3B por token (segun el autor: "A3B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (esta version MLX-8bit); otras versiones no documentadas |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo de arquitectura MoE que activa aproximadamente 3.000 millones de parámetros por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Según la información proporcionada, el modelo se desarrolla sobre la base de Qwen3.5 (arquitectura `qwen3_5_moe`) y Gemma4, con un proceso de entrenamiento que combina *continued pretraining*, *mid-training* y *post-training*. La característica más destacada es el bucle de auto-mejora de extremo a extremo: el modelo genera nuevas tareas de entrenamiento, construye scaffolds (andamios) específicos para cada tarea y produce soluciones (*rollouts*) para el aprendizaje por refuerzo, mejorando continuamente su política sin depender de un conjunto fijo de tareas humanas.

El proceso de auto-mejora se describe en el blog de Ornith AI como una extensión del marco de auto-scaffolding introducido en Ornith-1.0. En lugar de optimizar solo los *rollouts* y el scaffold, Ornith-1.5 optimiza conjuntamente la generación de tareas, la construcción del scaffold y la generación de soluciones. Esta aproximación permite al modelo descubrir nuevas estrategias de resolución de problemas de forma autónoma. No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo en inglés.
- Codificación avanzada, incluyendo generación de código, depuración y resolución de problemas de ingeniería de software.
- Capacidades agénticas: puede actuar como agente autónomo, utilizando herramientas y ejecutando tareas multi-paso.
- Soporte de *function calling* / *tool calling* (implícito en los benchmarks de Terminal-Bench y SWE-bench, que requieren uso de herramientas).
- Razonamiento multi-step y *agentic coding*.
- Capacidad de auto-mejora: puede generar sus propias tareas de entrenamiento y estrategias de resolución (según el blog de Ornith).

## Casos de uso

- **Automatización de tareas de desarrollo de software**: el modelo puede resolver issues de repositorios reales (SWE-bench Pro) y generar código correcto, por lo que es útil para tareas de mantenimiento y corrección de bugs en proyectos de software.
- **Agentes de terminal y línea de comandos**: con una puntuación de 67.8 en Terminal-Bench 2.1 (Terminus-2), puede ejecutar comandos, navegar por sistemas de archivos y realizar tareas administrativas en un entorno de terminal de forma autónoma.
- **Asistente de programación integrado en IDE**: gracias a su capacidad de razonamiento y generación de código, puede usarse como asistente en entornos de desarrollo, sugiriendo soluciones a problemas de programación.
- **Despliegue local en hardware Apple**: la versión MLX-8bit está optimizada para Apple Silicon, permitiendo ejecutar un modelo de 35B en hardware consumer con uso eficiente de memoria.
- **Investigación en auto-mejora de modelos**: el enfoque de auto-generación de tareas y scaffolds puede ser objeto de estudio para investigadores en aprendizaje por refuerzo.
- **Automatización de pruebas de software**: puede generar casos de prueba, ejecutar y validar soluciones en entornos de CI/CD.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por el autor en la model card del modelo. Se comparan con Ornith-1.0-35B-A3B, Qwen3.6-35B-A3B, Gemma-4-31B, Muse-Glimmer-30B y Qwen3.5-397B.

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67.8 | 64.2 | 52.5 | 42.1 | 51.7 | 53.5 |
| Terminal-Bench 2.1 (Claude Code) | 68.5 | 62.8 | 49.2 | - | - | 48.6 |
| SWE-bench Verified | 79.0 | 75.6 | 73.4 | 52.0 | 76.0 | 76.4 |
| SWE-bench Pro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: los datos de SWE-bench Pro no se han incluido en la tabla porque la información proporcionada está incompleta. El autor indica que el modelo supera a Qwen3.6-35B en todos los benchmarks de codificación y agénticos, y a Gemma-4-31B y Muse-Glimmer-30B en agentic coding.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma precisa, pero al ser una versión MLX-8bit de un modelo de 35B con solo 3B activos, se puede estimar que la cuantización a 8 bits reduce significativamente el uso de memoria. El tamaño del repo es de 36.9 GB, lo que indica que los pesos ocupan aproximadamente esa cantidad en formato de 8 bits.
- GPU recomendadas: al ser un modelo MLX, está optimizado para Apple Silicon (M1/M2/M3/M4). Para otras plataformas, se puede usar vLLM o llama.cpp si se convierte el modelo a GGUF.
- Hardware consumer: dado que solo se activan ~3B parámetros por token, el modelo puede ejecutarse en hardware consumer con suficiente VRAM (por ejemplo, una RTX 4090 con 24 GB de VRAM probablemente pueda ejecutarlo en 8bit).
- Opciones de despliegue: MLX (Apple Silicon), vLLM, llama.cpp, Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Rendimiento SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35B | ~3B | no disponible | 79.0 | no disponible |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | 73.4 | no disponible |
| Gemma-4-31B | 31B | 31B | no disponible | 52.0 | no disponible |
| Muse-Glimmer-30B | 30B | 30B | no disponible | 76.0 | no disponible |
| Qwen3.5-397B | 397B | no disponible | no disponible | 76.4 | no disponible |

Ornith-1.5-35B-A3B supera a Qwen3.6-35B-A3B en todos los benchmarks publicados, y es comparable o mejor que modelos densos más grandes como Gemma-4-31B y Muse-Glimmer-30B en tareas agénticas. El único modelo que lo supera en SWE-bench Verified es Qwen3.5-397B, que tiene más de 10 veces más parámetros.

## Limitaciones y advertencias

- Licencia no disponible: no se ha publicado la licencia del modelo, lo que impide conocer las restricciones de uso comercial o de redistribución.
- Idioma: el modelo solo declara soporte para inglés. Su rendimiento en otros idiomas no está evaluado.
- Riesgo de alucinación: no se han publicado evaluaciones específicas, pero como modelo de lenguaje, existe riesgo de generar información falsa o inventada.
- Sesgos: no se han publicado evaluaciones de sesgos ni de seguridad.
- Contexto: no se ha especificado la longitud de contexto máxima. Es probable que sea similar a la de Qwen3.5, pero no se puede confirmar.
- La versión MLX-8bit está limitada a Apple Silicon; para otras plataformas, se requiere conversión de formato.

## Enlaces

- Modelo en Hugging Face (versión MLX-8bit): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-8bit
- Modelo original en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Análisis en BenchLM.ai: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Artículo sobre despliegue local: https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run
