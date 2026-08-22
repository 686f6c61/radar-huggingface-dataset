# mradermacher/Qwen3.5-9B-Claude-GBO-Fire-Deckard-Agent-Heretic-BF16-i1-GGUF

## Resumen

Este repositorio contiene una versión cuantizada en formato GGUF del modelo `nightmedia/Qwen3.5-9B-Claude-GBO-Fire-Deckard-Agent-Heretic-BF16`, preparada por el usuario `mradermacher`. Se trata de un modelo de 9B parámetros basado en la arquitectura Qwen3.5, sobre el cual se han aplicado técnicas de destilación de estilo Claude (distilled con Claude-style thinking) y el proceso de ablación de censura denominado "Heretic". El resultado es un modelo conversacional, orientado a la escritura creativa y la generación de ficción, sin restricciones de seguridad (uncensored) y con capacidades de razonamiento mejoradas mediante destilación.

El repositorio incluye únicamente los pesos cuantizados con la herramienta `imatrix` de `nicoboss`, que ofrece una amplia gama de cuantizaciones (desde `IQ1_S` hasta `Q6_K`). El archivo principal del repo ocupa 3.8 GB, correspondiente a la cuantización `BF16-i1`. No se proporciona información sobre la licencia, idiomas soportados, ni se publican resultados de benchmarks en la model card. El modelo está etiquetado como "conversational", "creative writing", "fiction", "story generation", "uncensored" y "abliterated", lo que indica un enfoque específico en tareas de generación de texto creativo y narrativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5) |
| Parametros totales | 8.953.803.264 (8.95B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (se infiere ingles y chino por la etiqueta de la busqueda) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluidos en este repo) |

## Arquitectura y entrenamiento

El modelo base es `nightmedia/Qwen3.5-9B-Claude-GHO-Fire-Deckard-Agent-Heretic-BF16`, que combina tres procesos de entrenamiento diferenciados:

1.  **Base Qwen3.5**: arquitectura Transformer de la familia Qwen3.5, con 9B parámetros. Según la información de búsqueda, Qwen3.5 introduce una base unificada de visión-lenguaje con entrenamiento temprano de fusión multimodal, aunque no se especifica si este modelo concreto incluye capacidades de visión.
2.  **Destilación de estilo Claude**: el modelo ha sido destilado con datos generados por Claude, probablemente Claude Opus 4.6, para imitar su estilo de razonamiento y escritura. La destilación se ha realizado con un proceso de "Claude-style thinking" (razonamiento tipo Claude).
3.  **Abliteración / Heretic**: se ha aplicado el proceso de ablación direccional (abliteration) para eliminar la censura y el "safety alignment" del modelo base. Heretic es una herramienta que combina la ablación direccional con un optimizador de parámetros basado en TPE (Tree-structured Parzen Estimator) para eliminar la censura de forma automática.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se utilizó RLHF o DPO en el proceso de destilación.

## Capacidades

- **Generación de texto creativo**: el modelo está específicamente entrenado para escritura de ficción, incluyendo narrativa, ciencia ficción, romance y otros géneros. La etiqueta "vivid prosing" sugiere una capacidad de prosa descriptiva y vívida.
- **Razonamiento y pensamiento**: al haber sido destilado con estilo Claude, se espera que el modelo muestre capacidades de razonamiento paso a paso (chain-of-thought) mejoradas en comparación con el modelo base Qwen3.5.
- **Sin censura**: la ablación de seguridad (abliteration) elimina las restricciones de contenido, lo que permite generar texto sobre temas que el modelo base rechazaría. Esto incluye contenido violento, sexual o políticamente sensible.
- **Generación de código**: aunque no es su función principal, al estar basado en Qwen3.5 conserva capacidades de generación de código, mejoradas por la destilación de Claude.
- **Soporte de agentes**: la etiqueta "Agent" en el nombre del modelo sugiere que se ha optimizado para tareas de agente, aunque no hay documentación que confirme tool calling o function calling.
- **Multilingüe**: la base Qwen3.5 soporta múltiples idiomas, incluyendo inglés y chino. No se han publicado los idiomas específicos de esta variante.

## Casos de uso

- **Escritura creativa y narrativa**: el modelo es adecuado para generar historias, tramas, subtramas y continuaciones de escenas. Su estilo de prosa vívida y la ausencia de censura permiten explorar temas complejos y adultos sin restricciones.
- **Roleplay y personajes**: gracias a la destilación de estilo Claude, el modelo puede mantener personajes coherentes y conversaciones prolongadas, siendo útil para juegos de rol o chatbots con personalidad.
- **Generación de ideas y argumentos**: se puede usar para brainstorming de tramas, desarrollo de personajes y generación de premisas de novelas o guiones.
- **Agente de escritura asistida**: integrado en un entorno de escritura, el modelo puede sugerir continuaciones de escenas, describir entornos o reescribir pasajes en un estilo deseado.
- **Investigación de la ablación de seguridad**: el modelo es un ejemplo práctico de cómo la abliteración afecta al comportamiento de un modelo de lenguaje, útil para investigadores que estudian los efectos de la censura y la alineación.
- **Prototipado de aplicaciones de generación de contenido**: se puede usar en aplicaciones que requieran generación de texto sin restricciones, como juegos de texto, narrativa interactiva o sistemas de generación de contenido creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: para la cuantización `BF16` (3.8 GB), se necesitan al menos 8 GB de VRAM para cargar el modelo con un contexto corto. Para cuantizaciones menores como `Q4_K_M` (aprox. 2.3 GB), se puede ejecutar en GPU de 6 GB.
- **GPU recomendadas**: RTX 3060 (12 GB) para cuantizaciones bajas, RTX 4090 (24 GB) para la versión `BF16` con contexto largo. Para despliegue en producción, se recomienda A100 (40 GB) o H100 (80 GB).
- **GPU consumer**: sí, el modelo cabe en GPUs consumer. Con cuantizaciones `Q4_K_M` o `IQ4_XS`, puede ejecutarse en una RTX 3060 de 12 GB o RTX 4060 de 8 GB.
- **Opciones de despliegue**: llama.cpp, Ollama (ya que el formato GGUF es compatible), vLLM (con soporte GGUF reciente), LM Studio (como se menciona en la búsqueda), y TGI (no confirmado).
- **Latencia y throughput**: no se han publicado datos específicos. Para una GPU de 12 GB, se estima una velocidad de 15-25 tokens/s con cuantización `Q4_K_M`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Qwen3.5-9B-Claude-GHO-Fire-Deckard-Agent-Heretic** | 8.95B | no disponible | no disponible | GGUF | Modelo destilado con estilo Claude y sin censura (abliterado) |
| **Qwen3.5-9B (base)** | 9B | no disponible | Apache 2.0 (probable) | safetensors | Modelo base de la familia Qwen3.5, con capacidades de visión y razonamiento |
| **Qwen3-8B** | 8B | 32K (típico) | Apache 2.0 | safetensors | Modelo anterior de la familia Qwen, sin destilación ni abliteración |

No se dispone de comparativas de rendimiento (benchmarks) entre estos modelos en la información disponible. La principal diferencia es el proceso de destilación y ablación, que modifica el comportamiento del modelo base.

## Limitaciones y advertencias

- **Modelo sin censura**: el proceso de abliteración elimina las restricciones de seguridad del modelo. Esto implica que puede generar contenido dañino, ilegal o poco ético. El uso de este modelo en producción requiere un control exhaustivo del contenido generado.
- **Sesgos y alucinaciones**: el proceso de destilación y ablación puede introducir sesgos adicionales o aumentar las alucinaciones. No se ha evaluado formalmente la precisión del modelo.
- **Licencia desconocida**: no se indica la licencia del modelo. El uso comercial puede estar restringido o requerir permiso del autor original.
- **Contexto no confirmado**: no se ha especificado la longitud de contexto del modelo. Se recomienda probar con contextos de 8K-32K tokens para evitar degradación de rendimiento.
- **Calidad de la destilación**: la destilación de Claude-style puede no ser perfecta, y el modelo puede no imitar fielmente el estilo de razonamiento de Claude.
- **Riesgo de alucinación**: el modelo puede generar información falsa o inventada, especialmente en tareas de razonamiento complejas.
- **Formato GGUF**: el modelo solo está disponible en formato GGUF, lo que limita su uso en frameworks que no soporten este formato (aunque la mayoría de los motores de inferencia modernos lo soportan).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Qwen3.5-9B-Claude-GHO-Fire-Deckard-Agent-Heretic-BF16-i1-GGUF
- Repositorio del modelo original (BF16): https://huggingface.co/nightmedia/Qwen3.5-9B-Claude-GHO-Fire-Deckard-Agent-Heretic-BF16
- Herramienta Heretic (abliteración): https://github.com/p-e-w/heretic
- Artículo sobre la destilación de Qwen3.5 con Claude-style thinking: https://www.marktechpost.com/2026/03/26/a-coding-implementation-to-run-qwen3-5-reasoning-models-distilled-with-claude-style-thinking-using-gguf-and-4-bit-quantization/
- Artículo en chino sobre el modelo destilado: https://zhuanlan.zhihu.com/p/2017014972962599025
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
