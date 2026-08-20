# ornith-ai/Ornith-1.5-35B-A3B-NVFP4

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Ornith AI, una iniciativa centrada en la construcción de modelos fundacionales mediante auto-mejora de extremo a extremo. La versión 1.5 amplía el marco de auto-scaffolding de la 1.0 incorporando un bucle de mejora continua que optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones, todo ello mediante aprendizaje por refuerzo. El modelo activa aproximadamente 3 mil millones de parámetros por token, lo que lo hace eficiente en inferencia, y está diseñado para sobresalir en tareas de codificación y agénticas, superando a modelos densos de tamaño similar en varios benchmarks.

Este checkpoint concreto, etiquetado como NVFP4, es una versión cuantizada con precisión de 4 bits de NVIDIA, lo que reduce el uso de memoria y acelera la inferencia en hardware compatible. Aunque el nombre sugiere 35 mil millones de parámetros totales, el archivo safetensors del checkpoint reporta 18.683.860.336 parámetros, posiblemente debido a la cuantización o a una poda interna. El modelo está disponible bajo licencia MIT y se distribuye en formato safetensors, siendo compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-MoE |
| Parametros totales | 35B (MoE) según nombre; 18.68B según checkpoint safetensors |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), 8-bit (segun tags) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) que activa solo unos 3 mil millones de parámetros por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. El modelo está basado en la arquitectura Qwen3.5-MoE, según los tags de HuggingFace, e incorpora capacidades multimodales (image-text-to-text), aunque su pipeline principal es text-generation.

El entrenamiento se basa en un bucle de auto-mejora de extremo a extremo. A diferencia de la versión 1.0, que se centraba en optimizar scaffolds y rollouts, la 1.5 optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones mediante aprendizaje por refuerzo. El modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce soluciones que se utilizan como datos de entrenamiento, creando un ciclo continuo de mejora. Este enfoque busca reducir la dependencia de tareas curadas manualmente y de harnesses diseñados a mano.

## Capacidades

- Generación de texto y razonamiento complejo, especialmente en tareas de codificación y agénticas.
- Soporte de tool calling y function calling, lo que permite integración con APIs y herramientas externas.
- Capacidades agénticas avanzadas, incluyendo razonamiento multi-paso y ejecución de acciones en entornos simulados (terminal, repositorios de código).
- Capacidades multimodales: el modelo acepta entradas de imagen y texto (image-text-to-text), aunque no se detallan los tipos de imagen soportados.
- Entrenamiento mediante auto-mejora, lo que le permite adaptarse a nuevas tareas sin intervención humana directa.
- Eficiencia en inferencia gracias a la activación selectiva de parámetros (3B activos de 35B totales).

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar, revisar y depurar código en entornos de línea de comandos, como se demuestra en Terminal-Bench 2.1. Es adecuado para tareas de programación autónoma y refactorización.
- Agentes de automatización de tareas: gracias a su soporte de tool calling y razonamiento multi-paso, puede orquestar flujos de trabajo complejos, como la gestión de repositorios Git, ejecución de tests y despliegue de aplicaciones.
- Asistente de programación en IDE: puede integrarse en editores de código para proporcionar sugerencias contextuales, explicaciones de código y generación de tests unitarios.
- Resolución de issues en repositorios: con un rendimiento destacado en SWE-bench Verified (79%), el modelo puede abordar problemas reales de GitHub, proponiendo parches y soluciones verificadas.
- Automatización de operaciones de TI: su capacidad para interactuar con terminales y ejecutar comandos lo hace útil para tareas de administración de sistemas, como configuración de servidores o gestión de dependencias.
- Investigación en IA: el enfoque de auto-mejora del modelo puede utilizarse como base para experimentos en aprendizaje por refuerzo y generación de tareas sintéticas.

## Benchmarks y rendimiento

Los siguientes resultados han sido extraídos de la model card oficial. Se comparan con modelos de tamaño similar y con un modelo de mayor escala (Qwen3.5-397B) como referencia.

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67.8 | 64.2 | 52.5 | 42.1 | 51.7 | 53.5 |
| Terminal-Bench 2.1 (Claude Code) | 68.5 | 62.8 | 49.2 | - | - | 48.6 |
| SWE-bench Verified | 79 | 75.6 | 73.4 | 52 | 76 | 76.4 |
| SWE-bench Pro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos adicionales de benchmarks como MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- El checkpoint NVFP4 ocupa 23.4 GB en disco, lo que sugiere que el modelo puede cargarse en GPUs con al menos 24 GB de VRAM en precisión FP4.
- Al ser un MoE con solo 3B parámetros activos, la inferencia es más eficiente que un modelo denso de 35B, pero el tamaño total del checkpoint requiere memoria suficiente para los pesos completos.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A10G, A100 (40GB o 80GB), H100.
- En GPUs consumer con 24 GB (RTX 3090/4090) es posible ejecutar el modelo en FP4, aunque se recomienda verificar la compatibilidad con la librería de cuantización de NVIDIA (TensorRT-LLM o similar).
- Opciones de despliegue: vLLM, TensorRT-LLM, Hugging Face TGI, llama.cpp (si se convierte a GGUF), y cualquier framework compatible con safetensors y arquitecturas MoE.
- La latencia y el throughput no han sido publicados oficialmente; se estima que al activar solo 3B parámetros por token, el modelo puede alcanzar velocidades de generación superiores a las de un modelo denso de 35B en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en SWE-bench Verified | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35B MoE (3B activos) | no disponible | MIT | 79 | HuggingFace |
| Qwen3.6-35B-A3B | 35B MoE (3B activos) | no disponible | Apache 2.0 (presumible) | 73.4 | HuggingFace |
| Gemma-4-31B | 31B denso | no disponible | Gemma Terms (permisiva) | 52 | HuggingFace |
| Muse-Glimmer-30B | 30B denso | no disponible | no disponible | 76 | HuggingFace |

Ornith-1.5 supera a Qwen3.6-35B-A3B en los benchmarks de codificación y agénticos disponibles, y ofrece una ventaja considerable sobre Gemma-4-31B. Muse-Glimmer-30B, aunque denso, logra un rendimiento cercano en SWE-bench Verified, pero Ornith-1.5 lo supera en Terminal-Bench. La licencia MIT es más permisiva que las de muchos competidores.

## Limitaciones y advertencias

- La longitud de contexto no está documentada, lo que puede suponer un riesgo para aplicaciones que requieran ventanas largas.
- Los idiomas soportados no se especifican; es probable que el modelo esté optimizado para inglés, dado su enfoque en tareas de codificación.
- Aunque el modelo destaca en benchmarks de codificación, no se han publicado resultados en tareas generales de razonamiento, matemáticas o conocimiento enciclopédico, por lo que su rendimiento fuera del dominio técnico es incierto.
- El checkpoint NVFP4 está cuantizado a 4 bits, lo que puede introducir una ligera degradación de precisión en comparación con la versión de 8 bits o de precisión completa.
- La discrepancia entre el número de parámetros declarado (35B) y el reportado en safetensors (18.68B) no está explicada; se recomienda verificar la integridad del modelo antes de usarlo en producción.
- El entrenamiento mediante auto-mejora puede generar sesgos en las tareas que el propio modelo propone, lo que podría limitar su generalización a dominios no representados en su bucle de entrenamiento.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4)
- [Modelo base Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Colección Ornith-1.5](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Blog de Ornith sobre Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Sitio web de Ornith AI](https://ornith.online/)
- [Página de benchmarks en BenchLM](https://benchlm.ai/models/ornith-1-5-35b-a3b)
