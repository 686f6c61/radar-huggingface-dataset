# cyankiwi/Ornith-1.5-35B-A3B-AWQ-INT4

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de arquitectura mixture-of-experts (MoE) desarrollado por Ornith AI, que representa un avance hacia el entrenamiento de modelos fundacionales mediante auto-mejora de extremo a extremo. El modelo activa aproximadamente 3.000 millones de parámetros por token, aunque cuenta con un total de 35.950 millones, lo que lo sitúa en la categoría de modelos eficientes de tamaño medio. Se basa en el desarrollo previo de Ornith-1.0, que a su vez se construyó sobre Qwen3.5 y Gemma4, incorporando etapas de preentrenamiento continuado, entrenamiento intermedio y post-entrenamiento.

La relevancia de este modelo reside en su enfoque de auto-mejora: en lugar de depender de un conjunto fijo de tareas curadas por humanos, Ornith-1.5 genera de forma continua nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora su política mediante aprendizaje por refuerzo. Esta ficha documenta la versión cuantizada AWQ-INT4 publicada por el usuario cyankiwi, que mantiene las capacidades del modelo original con un tamaño reducido de 26,2 GB. El modelo está disponible bajo licencia MIT y soporta múltiples idiomas, incluyendo inglés, chino, hindi, árabe, ruso, japonés, coreano, neerlandés, francés y español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) sobre base Qwen3.5/Gemma4 |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B emplea una arquitectura MoE con aproximadamente 3.000 millones de parámetros activos por token, lo que permite un rendimiento computacional eficiente sin sacrificar la capacidad del modelo. El entrenamiento se basa en un proceso de auto-mejora de extremo a extremo que optimiza conjuntamente la generación de tareas, la construcción de scaffolds (andamiajes de ejecución) y los rollouts de soluciones. Este enfoque se apoya en el desarrollo previo de Ornith-1.0, que utilizó Qwen3.5 y Gemma4 como base con etapas adicionales de preentrenamiento continuado, entrenamiento intermedio y post-entrenamiento.

El proceso de auto-mejora de Ornith-1.5 se distingue por su capacidad de generar nuevas tareas de entrenamiento de forma autónoma, en lugar de depender de conjuntos de datos fijos creados manualmente. El modelo propone tareas, genera scaffolds específicos para cada una y produce rollouts de soluciones para el aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. La cuantización AWQ INT4 aplicada por cyankiwi utiliza un conjunto de calibración orientado a tareas STEM y agenticas, lo que permite mantener la precisión en dominios técnicos.

## Capacidades

- Generación de texto y razonamiento complejo en múltiples idiomas.
- Soporte de codificación y tareas de terminal, con rendimiento destacado en benchmarks de agentes de código.
- Capacidades de agentes con razonamiento multi-paso.
- Soporte de tool calling y function calling para integración en pipelines.
- Capacidades multilingües en 10 idiomas principales.
- Procesamiento de tareas de visión e imagen-texto (según el pipeline de la librería transformers).
- Modo de auto-mejora: el modelo genera sus propias tareas de entrenamiento y estrategias de solución.

## Casos de uso

- **Asistente de programación en entornos de terminal**: el modelo puede ejecutar tareas complejas de línea de comandos y depuración de código, con un rendimiento de 67,8 en Terminal-Bench 2.1, superando a modelos densos de tamaño similar.
- **Agente de desarrollo de software**: su capacidad de razonamiento multi-paso y tool calling lo hace adecuado para automatizar tareas de programación en pipelines de CI/CD, generación de código y revisión de código.
- **Automatización de tareas de oficina**: con soporte de 10 idiomas y capacidad de razonamiento, puede gestionar tareas de documentación, resúmenes y traducción en entornos empresariales multilingües.
- **Investigación en aprendizaje por refuerzo**: su arquitectura de auto-mejora lo convierte en una herramienta útil para experimentar con sistemas de auto-entrenamiento y generación de tareas sintéticas.
- **Asistente de análisis de datos**: su capacidad de razonamiento STEM y de manejo de herramientas lo hace adecuado para tareas de análisis de datos, generación de informes y visualización.
- **Despliegue de modelos en producción**: la versión cuantizada AWQ INT4 reduce los requisitos de hardware, lo que permite su despliegue en entornos de producción con recursos limitados.

## Benchmarks y rendimiento

La información disponible incluye resultados de benchmarks del modelo base Ornith-1.5-35B-A3B. Los datos para esta versión cuantizada AWQ INT4 no se han publicado de forma específica.

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67,8 | 64,2 | 52,5 | 42,1 | 51,7 | 53,5 |
| Terminal-Bench 2.1 (Claude Code) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks específicos para la versión cuantizada AWQ INT4 en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo cuantizado AWQ INT4 tiene un tamaño de 26,2 GB, por lo que se requiere aproximadamente 28-32 GB de VRAM para inferencia en FP16, o menos si se utiliza una cuantización adicional.
- **GPU recomendadas**: se recomiendan GPUs de gama alta con al menos 24 GB de VRAM, como NVIDIA RTX 4090, A100, H100 o A6000.
- **Compatibilidad con GPUs de consumo**: es posible ejecutar el modelo en GPUs de consumo de 24 GB (por ejemplo, RTX 4090) con la cuantización AWQ INT4, aunque con limitaciones en el tamaño de lote.
- **Opciones de despliegue**: se puede desplegar con vLLM, llama.cpp, Ollama o TGI, dependiendo de las necesidades de latencia y throughput.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento en Terminal-Bench 2.1 |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35,95 B | 3 B | no disponible | MIT | 67,8 |
| Qwen3.6-35B-A3B | 35 B | 3 B | no disponible | Apache 2.0 | 52,5 |
| Gemma-4-31B | 31 B | 31 B | no disponible | Gemma license | 42,1 |
| Muse-Glimmer-30B | 30 B | 30 B | no disponible | no disponible | 51,7 |

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos específicos en la información disponible, pero como modelo entrenado en datos de internet, puede heredar sesgos de los datos de entrenamiento.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- **Limitaciones de contexto**: no se ha especificado la longitud máxima de contexto, por lo que el rendimiento en tareas de contexto muy largo no está garantizado.
- **Idiomas**: aunque soporta 10 idiomas, el rendimiento puede variar significativamente entre ellos; los idiomas menos representados en el entrenamiento pueden mostrar peores resultados.
- **Restricciones de licencia**: la licencia MIT permite uso comercial y modificación, pero se recomienda revisar los términos de la licencia del modelo base para cualquier restricción adicional.
- **Caveat para producción**: la versión cuantizada AWQ INT4 puede presentar pérdida de precisión en tareas de alta precisión numérica o razonamiento matemático avanzado.

## Enlaces

- [HuggingFace - cyankiwi/Ornith-1.5-35B-A3B-AWQ-INT4](https://huggingface.co/cyankiwi/Ornith-1.5-35B-A3B-AWQ-INT4)
- [HuggingFace - ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Blog de Ornith - Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [BenchLM - Ornith-1.5-35B-A3B](https://benchlm.ai/models/ornith-1-5-35b-a3b)
- [ModelScope - Ornith-1.5-35B-A3B](https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B)
