# npario/Ornith-1.5-9B-MLX-6bit

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 9.000 millones de parámetros, perteneciente a la familia Ornith-1.5 desarrollada por DeepReinforce (también publicada bajo el perfil ornith-ai). Este modelo está especializado en tareas agénticas y de codificación, y representa un avance hacia el entrenamiento de modelos fundacionales mediante auto-mejora de extremo a extremo: en lugar de depender de tareas fijas diseñadas por humanos, el propio modelo propone nuevas tareas, genera scaffolds específicos para cada una y produce rollouts de solución que se utilizan para mejorar la política mediante aprendizaje por refuerzo. Ornith-1.5 extiende el enfoque de auto-scaffolding introducido en Ornith-1.0, que a su vez se construyó sobre las arquitecturas de Qwen3.5 y Gemma4.

La versión documentada en este repositorio es una conversión a formato MLX con cuantización de 6 bits, realizada por el usuario npario. El modelo original está disponible en bf16 y ocupa unos 19 GB, mientras que esta versión cuantizada reduce el peso a 7,3 GB, lo que permite su despliegue en GPUs de consumo e incluso en dispositivos móviles mediante la variante Ornith-1.5-9B-Mobile. Según los benchmarks reportados por el autor, alcanza 70,6 en SWE-bench Verified y 46,2 en Terminal-Bench 2.1, superando a modelos de referencia como Qwen3.5-9B y acercándose a alternativas mucho más grandes como Qwen3.6-35B-A3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 y Gemma4 (tag: qwen3_5) |
| Parametros totales | 1.959.473.664 según metadata de safetensors; el modelo se anuncia como 9B (discrepancia sin resolver) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible en Hugging Face; fuentes externas indican MIT sin confirmar |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo transformer denso, sin mezcla de expertos (MoE), construido sobre las arquitecturas de Qwen3.5 y Gemma4. La familia Ornith-1.0 realizó continued pretraining, mid-training y post-training sobre estos modelos base. Ornith-1.5 añade un bucle de auto-mejora completo: el modelo genera nuevas tareas de entrenamiento, construye scaffolds específicos para cada tarea y produce soluciones (rollouts) que se optimizan mediante aprendizaje por refuerzo. Este proceso reemplaza el conjunto fijo de tareas curadas por humanos y los harnesses diseñados manualmente por un sistema autónomo de generación y evaluación. No se han publicado datos sobre el número de tokens de entrenamiento ni la composición del dataset. El modelo está diseñado como un modelo de razonamiento: por defecto, cada respuesta comienza con un bloque de pensamiento (thinking) antes de la respuesta final, y soporta tool calling mediante bloques `<tool_call>`.

## Capacidades

- Razonamiento explicito: genera cadenas de pensamiento (chain-of-thought) antes de responder, con soporte para un parser que separa el razonamiento en un campo `reasoning_content`.
- Generacion de codigo: alto rendimiento en benchmarks de codificacion como SWE-bench Verified y Terminal-Bench.
- Tool calling / function calling: puede invocar herramientas mediante bloques estructurados, integrables en APIs estilo OpenAI.
- Tareas agénticas: resolución de issues en repositorios, ejecución de comandos en terminal y automatización de flujos de trabajo.
- Capacidades multilingües: no, solo inglés (según la metadata de Hugging Face).
- Otras capacidades: no se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Resolución de issues en repositorios de software: el modelo puede analizar un issue de GitHub, proponer cambios de código y generar un pull request, gracias a su rendimiento en SWE-bench Verified (70,6).
- Asistente de terminal para desarrolladores: con su puntuación de 46,2 en Terminal-Bench 2.1, puede ejecutar comandos, interpretar salidas y depurar errores en entornos de línea de comandos, útil para tareas de DevOps y administración de sistemas.
- Agente autónomo de integración continua: integrado en pipelines de CI/CD, puede leer logs, diagnosticar fallos y proponer correcciones automáticamente, reduciendo la intervención humana.
- Generación de código asistida con tool calling: al soportar function calling, puede conectarse a APIs de repositorios, bases de código o servicios externos para generar código contextualizado en producción.
- Asistente de razonamiento para análisis de datos: su modo de razonamiento explícito le permite descomponer problemas complejos de análisis, como optimización de consultas SQL o interpretación de métricas, con explicaciones paso a paso.
- Despliegue en dispositivos móviles: la variante cuantizada Ornith-1.5-9B-Mobile está diseñada para ejecutarse en iPhone y Android, habilitando asistentes de codificación o agentes de productividad en el edge.
- Chat conversacional técnico: aunque no es su enfoque principal, puede mantener conversaciones multi-turno sobre temas de programación y arquitectura de software, útil para foros de soporte o documentación interactiva.

## Benchmarks y rendimiento

Según los datos publicados por el autor en la model card (promedio de cinco ejecuciones, reportados por el proveedor), los resultados son los siguientes:

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47,0 | 40,6 | 18,9 | 49,2 | - |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 | 73,4 | 52,0 |
| SWE-bench Pro | 47,5 | 42,9 | 31,3 | 49,5 | 35,7 |
| SWE-bench Multilingual | no disponible (dato cortado en la fuente) | - | - | - | - |

Estos valores son reportados por el autor y no han sido verificados de forma independiente. No se dispone de resultados para benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- La versión original en bf16 ocupa aproximadamente 19 GB, por lo que requiere una GPU con al menos 24 GB de VRAM para inferencia sin cuantizar (por ejemplo, RTX 4090, A100 40GB o H100).
- La versión MLX 6-bit de este repositorio ocupa 7,3 GB, lo que la hace apta para GPUs de consumo con 8-12 GB de VRAM (RTX 3080, RTX 4070, etc.) y para Macs con chip Apple Silicon mediante MLX.
- La variante Ornith-1.5-9B-Mobile está optimizada para ejecutarse en dispositivos móviles (iPhone y Android), aunque no se especifican requisitos exactos de memoria.
- Opciones de despliegue: vLLM (con soporte para tensor parallelism), MLX (para Apple Silicon), y servidores compatibles con API OpenAI. También puede utilizarse con llama.cpp si se convierte a GGUF, aunque no se proporciona esa conversión oficialmente.
- Latencia y throughput: no se han publicado datos concretos. Con una GPU de 80 GB, el modelo puede servirse en una sola instancia; con cuantización 6-bit, la inferencia es viable en tiempo real para tareas interactivas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-9B | ~9B (denso) | no disponible | 70,6 | 46,2 | no disponible (¿MIT?) |
| Ornith-1.0-9B | ~9B (denso) | no disponible | 69,4 | 43,1 | no disponible |
| Qwen3.5-9B | ~9B (denso) | no disponible | 53,2 | 21,3 | no disponible |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | 73,4 | 52,5 | no disponible |
| Gemma-4-31B | 31B (denso) | no disponible | 52,0 | 42,1 | no disponible |

Ornith-1.5-9B supera claramente a Qwen3.5-9B en tareas de codificación y se acerca a modelos mucho más grandes como Qwen3.6-35B-A3B, con una fracción de los parámetros activos. Frente a Gemma-4-31B, también ofrece mejores resultados en SWE-bench, aunque es inferior en Terminal-Bench cuando se compara con la variante de 31B. No se dispone de información sobre la longitud de contexto de ninguno de estos modelos.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües, lo que limita su uso en entornos internacionales.
- La licencia no está especificada en la model card de Hugging Face. Aunque fuentes externas mencionan MIT, esta información no está confirmada por el autor, por lo que se recomienda contactar con el equipo antes de un uso comercial.
- No se han publicado estudios de sesgos ni evaluaciones de seguridad; como modelo de razonamiento, existe riesgo de alucinación en tareas complejas, especialmente cuando se le pide ejecutar comandos o modificar código sin supervisión.
- La longitud de contexto no está documentada, lo que impide planificar tareas que requieran ventanas largas (por ejemplo, análisis de repositorios completos).
- La discrepancia entre el número de parámetros anunciado (9B) y el valor reportado en la metadata safetensors (1,96B) sugiere posibles errores en la conversión o en la documentación; se recomienda verificar la integridad de los pesos antes de su uso en producción.
- El modelo está diseñado para tareas agénticas y de codificación; su rendimiento en tareas generales de lenguaje (redacción, traducción, etc.) no está evaluado y puede ser inferior al de modelos generalistas del mismo tamaño.

## Enlaces

- Repositorio Hugging Face (versión MLX 6-bit): https://huggingface.co/npario/Ornith-1.5-9B-MLX-6bit
- Repositorio Hugging Face (versión original MLX): https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- GitHub de Ornith: https://github.com/ornith-ai/Ornith-1
- Web oficial: https://ornith.ai/
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-9b
