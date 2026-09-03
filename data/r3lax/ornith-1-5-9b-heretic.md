# r3lax/Ornith-1.5-9B-heretic

## Resumen

Ornith-1.5-9B-heretic es una versión desensurada (decensored) del modelo Ornith-1.5-9B, desarrollada por el usuario r3lax mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) con preservación de norma de fila. El modelo base, Ornith-1.5-9B, pertenece a la familia Ornith de ornith-ai, una serie de modelos densos de 9B parámetros diseñados para tareas agénticas y auto-mejora de extremo a extremo, construidos sobre Qwen3.5 y Gemma4 con entrenamiento continuo, mid-training y post-training basado en reinforcement learning.

La relevancia de esta variante heretic radica en que elimina los mecanismos de rechazo de contenido del modelo original, reduciendo las negativas de 99/100 a 18/100 en las pruebas de la model card, con una divergencia KL de 0.0398 respecto al original. Esto la hace útil para investigación sobre seguridad, alineación y jailbreak, así como para aplicaciones que requieren generación de contenido sin restricciones, aunque con riesgos asociados. El modelo tiene 9.409.813.744 parámetros, está licenciado bajo MIT y se distribuye en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, derivado de Qwen3.5 (según etiquetas del modelo) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existen versiones GGUF de terceros) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 9B parámetros, desarrollado por ornith-ai como parte de la familia Ornith-1.5. Se construyó sobre Qwen3.5 y Gemma4 mediante un proceso de auto-mejora de extremo a extremo: el modelo genera nuevas tareas de entrenamiento, construye scaffolds específicos para cada tarea y produce rollouts de soluciones que se utilizan para mejorar la política mediante reinforcement learning. Este enfoque sustituye el conjunto fijo de tareas humanas y harnesses manuales por un bucle continuo de generación y optimización.

La variante heretic se obtuvo aplicando abliteration con el método Arbitrary-Rank Ablation (ARA) sobre las capas 15 a 21 del modelo base, con parámetros específicos: preserve_good_behavior_weight de 0.6958, steer_bad_behavior_weight de 0.0001, overcorrect_relative_weight de 1.0904, neighbor_count de 8, tau de 0.7271 y margin de 4.9363. Este proceso elimina selectivamente las direcciones en el espacio de activaciones asociadas con comportamientos de rechazo, manteniendo en lo posible las capacidades generales del modelo.

## Capacidades

- Generación de texto y razonamiento: el modelo base está entrenado para tareas agénticas y de razonamiento multi-paso, aunque no se han publicado métricas específicas para esta variante.
- Generación de código: el modelo base muestra resultados destacados en benchmarks de código como Terminal-Bench 2.1 (46.2 con Terminus-2, 47 con Claude Code) y SWE-bench Verified (70.6).
- Tareas agénticas: el modelo base está diseñado para entornos de agente, incluyendo uso de herramientas y ejecución de comandos en terminal.
- Capacidad desensurada: la característica principal de esta variante es la reducción drástica de rechazos de contenido, pasando de 99/100 a 18/100 en las pruebas de la model card, lo que permite generar respuestas que el modelo original bloquearía.
- Soporte de tool calling: no se documenta explícitamente, pero el modelo base está orientado a tareas agénticas, por lo que es probable que lo soporte.
- Multilingüismo: no disponible.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar cómo la abliteration afecta al comportamiento de rechazo y qué mecanismos internos subyacen a la censura, comparando respuestas con el modelo original.
- Pruebas de jailbreak y robustez: al eliminar los rechazos, es útil para evaluar la eficacia de técnicas de jailbreak y para desarrollar contramedidas en otros modelos.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que aborden temas tabú o controvertidos sin filtros automáticos.
- Análisis de sesgos y comportamientos extremos: permite explorar los límites del modelo base en escenarios donde los mecanismos de seguridad interfieren, ayudando a identificar sesgos latentes.
- Desarrollo de aplicaciones de nicho: herramientas de rol-playing, simulación de personajes o generación de contenido para adultos, donde se requiere ausencia de censura.
- Benchmarking de técnicas de desalineación: sirve como referencia para comparar métodos de abliteration y medir su impacto en la utilidad general del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante heretic. La model card solo reporta dos métricas comparativas con el modelo original:

| Metrica | Modelo heretic | Ornith-1.5-9B original |
|---|---|---|
| Divergencia KL | 0.0398 | 0 (por definicion) |
| Rechazos (refusals) | 18/100 | 99/100 |

Los benchmarks del modelo base (Ornith-1.5-9B) son los siguientes, aunque no se garantiza que esta variante los mantenga tras la abliteration:

| Benchmark | Ornith-1.5-9B |
|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46.2 |
| Terminal-Bench 2.1 (Claude Code) | 47 |
| SWE-bench Verified | 70.6 |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 9.409.813.744 parámetros. En FP16 (formato safetensors) ocupa aproximadamente 18.8 GB, por lo que requiere al menos 20 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits se reduce a unos 9.4 GB, y con 4 bits a unos 4.7 GB.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Para cuantización 8 bits, una RTX 3090 (24 GB) o RTX 4080 (16 GB) puede funcionar. Para 4 bits, GPUs con 8 GB o más, como RTX 3060 o RTX 4060.
- Despliegue en consumer GPU: sí, es viable con cuantización en GPUs de gama media-alta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers. Existen versiones GGUF de terceros (por ejemplo, teddy19032/Ornith-1.5-9B-heretic-GGUF) para su uso con llama.cpp y Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa más directa es con el modelo original Ornith-1.5-9B, del cual deriva. También se puede comparar con otros modelos desensurados de tamaño similar, aunque no se dispone de datos concretos.

| Modelo | Parametros | Contexto | Rechazos | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B-heretic (este) | 9.4B | No disponible | 18/100 | MIT | safetensors |
| Ornith-1.5-9B (original) | 9.4B | No disponible | 99/100 | MIT | safetensors |
| Dolphin 2.x (ejemplo de desensurado) | Variable | No disponible | No disponible | MIT | safetensors/GGUF |

No se dispone de datos de benchmarks comparativos entre estos modelos desensurados.

## Limitaciones y advertencias

- Riesgo de contenido dañino: al eliminar los rechazos, el modelo puede generar contenido ilegal, violento, sexualmente explícito o perjudicial sin advertencias. Su uso en producción conlleva responsabilidad legal y ética.
- Alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados. La abliteration no corrige este problema.
- Degradación de capacidades: aunque la divergencia KL es baja (0.0398), la abliteration puede afectar sutilmente al rendimiento en tareas que requieren seguir instrucciones de seguridad o matices contextuales.
- Sesgos: el modelo base puede contener sesgos sociales y culturales, y la eliminación de rechazos puede amplificar estos sesgos en lugar de mitigarlos.
- Licencia: MIT permite uso comercial, pero el usuario es responsable del contenido generado. No hay garantías de seguridad ni soporte oficial.
- Contexto e idiomas: no se han documentado la longitud de contexto ni los idiomas soportados, lo que limita su uso en aplicaciones multilingües o con requisitos de contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/r3lax/Ornith-1.5-9B-heretic
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Repositorio de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Versión GGUF de terceros: https://huggingface.co/teddy19032/Ornith-1.5-9B-heretic-GGUF
- Página en FriendliAI: https://friendli.ai/models/Dingdust/Ornith-1.5-9B-heretic
