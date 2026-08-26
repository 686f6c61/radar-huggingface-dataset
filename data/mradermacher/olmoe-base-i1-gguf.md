# mradermacher/olmoe-base-i1-GGUF

## Resumen

OLMoE es una familia de modelos de lenguaje de código abierto desarrollada por el Allen Institute for AI (Ai2). La versión base, OLMoE-1B-7B, emplea una arquitectura de mezcla de expertos (MoE) con 6.900 millones de parámetros totales, de los cuales solo activa 1.300 millones por token. Este modelo se preentrenó sobre 5 billones de tokens y todos los datos, código y registros de entrenamiento se publicaron abiertamente, lo que lo convierte en una referencia para la investigación reproducible en modelos eficientes. La cuantización i1-GGUF aquí descrita, realizada por mradermacher, permite ejecutar el modelo en hardware de consumo con pérdidas mínimas de calidad.

La relevancia actual de este modelo reside en su equilibrio entre rendimiento y eficiencia: con un coste computacional por token equivalente a un modelo de 1B, alcanza resultados comparables a modelos densos de mayor tamaño como Llama2-13B, y su licencia Apache-2.0 permite uso comercial sin restricciones. La versión cuantizada en GGUF facilita el despliegue local en CPU y GPU de baja VRAM, así como su integración en herramientas como llama.cpp u Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), 64 expertos, seleccion top-1 |
| Parametros totales | 6.919.161.856 (6.9B) |
| Parametros activos | 1.3B por token |
| Longitud de contexto | 2048 tokens (según el paper OLMoE; no confirmado en la model card) |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (imatrix), más archivo imatrix para cuantizaciones personalizadas |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

OLMoE-1B-7B es un modelo de lenguaje autoregresivo basado en transformer con arquitectura de mezcla de expertos (MoE). Emplea 64 expertos en las capas de feed-forward, de los cuales se selecciona únicamente el experto con mayor activación (routing top-1) para cada token. Este diseño reduce el coste computacional por token a un equivalente de 1.3B de parámetros activos, mientras que el modelo completo mantiene 6.9B de parámetros almacenados. El preentrenamiento se realizó sobre 5 de tokens procedentes de fuentes web, libros y código, con un pipeline de datos completamente abierto. La versión base no incluye fine-tuning instructivo, aunque el modelo original de Ai2 ofrece una variante Instruct adaptada con RLVR (reinforcement learning with verifiable rewards) sobre el conjunto RLVR-GSM.

La cuantización imatrix de mradermacher utiliza una matriz de importancia calculada sobre datos de activación para mejorar la precisión de las cuantizaciones de baja precisión. Los archivos GGUF resultantes están optimizados para su uso con llama.cpp y entornos compatibles, manteniendo la compatibilidad con el ecosistema de herramientas de inferencia local.

## Capacidades

- Generación de texto coherente y contextualizada en inglés, con razonamiento básico y comprensión lectora.
- Codigo de programación en varios lenguajes, aunque con menor destreza que modelos específicamente entrenados para código.
- Razonamiento matemático básico y resolución de problemas aritméticos (el conjunto RLVR-GSM se usa en el fine-tuning instruct).
- No soporta tool calling, vision, audio ni funciones multimodales de forma nativa.
- Capacidad de manejar contextos de hasta 2048 tokens, suficiente para diálogos cortos y análisis de documentos breves.
- Al ser una cuantizacion GGUF, es compatible con ejecución en CPU, Apple Silicon y GPUs consumer mediante llama.cpp, Ollama, LM Studio, etc.

## Casos de uso

- **Asistencia de escritura en inglés**: el modelo puede redactar correos, resumir documentos y generar contenido creativo con un coste computacional mínimo, apto para entornos con recursos limitados.
- **Clasificación y extracción de información**: dado su tamaño compacto y licencia permisiva, puede integrarse en pipelines de NLP para etiquetado de texto, análisis de sentimiento o extracción de entidades en inglés.
- **Generación de código asistida en entornos de desarrollo**: aunque no es especialista, puede completar funciones simples, explicar fragmentos de código y generar scripts cortos, sin necesidad de una GPU dedicada.
- **Educación y divulgación de IA**: al ser un modelo abierto con datos de entrenamiento publicados, es una herramienta didáctica excelente para enseñar arquitecturas MoE y técnicas de cuantización.
- **Prototipado de aplicaciones de lenguaje**: gracias a su baja huella de memoria, puede desplegarse en servidores pequeños o incluso en un portátil para validar ideas de producto antes de migrar a modelos más grandes.
- **Investigación sobre eficiencia de modelos**: al ser totalmente abierto (datos, código, pesos), permite reproducir experimentos de eficiencia, análisis de activaciones o estudios de interpretabilidad sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de OLMoE reporta que el modelo base y la variante Instruct superan a modelos con parámetros activos similares, incluyendo a Llama2-13B en varias tareas, pero estos datos corresponden a la versión no cuantizada y no se incluyen en la documentación del repositorio GGUF. Se recomienda consultar el paper (arXiv:2409.02060) para métricas detalladas.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - i1-Q2_K (2.7 GB): cabe en cualquier GPU con 4 GB de VRAM o en CPU con 8 GB de RAM.
  - i1-IQ3_M (3.2 GB): recomendada GPU con 4-6 GB de VRAM (GTX 1660, RTX 3050, RTX 4060).
  - i1-Q4_K_S (4.1 GB): recomendada GPU con 6 GB de VRAM (RTX 3060, RTX 2070, RTX 4060 Ti).
- **GPU recomendadas**: RTX 3060 (12 GB) o superior para ejecutar sin problemas la cuantizacion Q4_K_S; cualquier GPU con 8 GB o más es suficiente para todas las variantes.
- **CPU**: se puede ejecutar en CPU con llama.cpp, aunque la velocidad será menor; se recomienda al menos 16 GB de RAM.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama-cpp-python, o servidores compatibles con GGUF como llama-cpp-server.
- **Latencia y throughput**: no disponible, pero por el tamaño reducido de la cuantizacion Q4_K_S (4.1 GB) en una RTX 3060 se puede esperar una generación de 20-40 tokens por segundo en tareas simples.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| OLMoE-1B-7B (este) | 6.9B | 1.3B | 2048 | Apache-2.0 | GGUF |
| Qwen1.5-MoE-A2.7B | 14.3B | 2.7B | 32768 | Apache-2.0 | safetensors, GGUF |
| Mixtral-8x7B | 46.7B | 12.9B | 32768 | Apache-2.0 | safetensors, GGUF |
| Phi-3-mini (denso) | 3.8B | 3.8B | 4096 | MIT | safetensors, GGUF |

La comparativa muestra que OLMoE ofrece el menor coste por token de entre los MoE comparables, aunque su contexto es el más limitado. Mixtral y Qwen1.5-MoE superan en contexto y capacidad, pero requieren más memoria. Phi-4-mini, siendo denso, es más sencillo de desplegar pero con menos eficiencia por parámetro.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo preentrenado sin fine-tuning instructivo, puede generar contenido sesgado o factualmente incorrecto. Se recomienda validar sus salidas en aplicaciones de producción.
- **Contexto limitado**: la ventana de 2048 tokens es corta para tareas de contexto largo, como análisis de documentos extensos o conversaciones de múltiples turnos.
- **Idioma**: el modelo está entrenado exclusivamente en inglés; no soporta otros idiomas de forma fiable.
- **Riesgo de seguridad**: al ser un modelo de acceso abierto, no se han aplicado medidas de alineación robustas. Puede generar contenido inapropiado si se le pide.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial y modificación, pero no se incluyen garantías ni responsabilidad del autor.
- **Precision de la cuantizacion**: las cuantizaciones de baja precisión (Q2_K) pueden degradar notablemente la calidad de generación. Se recomienda usar i1-Q4_K_S para tareas críticas.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/olmoe-base-i1-GGUF)
- [Modelo base safetensors](https://huggingface.co/ddidacus/olmoe-base)
- [Paper OLMoE](https://arxiv.org/abs/2409.02060)
- [Repositorio GitHub de OLMoE](https://github.com/allenai/OLMoE)
- [Cuantizaciones estáticas (no imatrix)](https://huggingface.co/mradermacher/olmoe-base-GGUF)
- [Guía de cuantizaciones de mradermacher](https://huggingface.co/mradermacher/model_requests)
