# Qwen/Qwen3.6-27B

## Resumen

Qwen3.6-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, sucesora de la familia Qwen3.5 lanzada en febrero, y está orientada explícitamente a mejorar la experiencia de desarrollo de código y el razonamiento a nivel de repositorio. El modelo combina un transformer híbrido con capas de atención lineal (Gated DeltaNet) y atención completa (Gated Attention), con 27.781.427.952 parámetros totales y una dimensión oculta de 5120.

La propuesta de valor principal es su rendimiento en tareas de "agentic coding": obtiene 77,2 en SWE-bench Verified y 53,5 en SWE-bench Pro, situándose por delante de Qwen3.5-27B (75,0 y 51,2) y de Gemma4-31B (52,0 y 35,7), y acercándose a modelos propietarios de mayor escala. Además, incorpora una opción de "Thinking Preservation" que permite retener el contexto de razonamiento de mensajes históricos, lo que reduce la sobrecarga en flujos de desarrollo iterativos.

El modelo soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens, y acepta entradas de imagen y texto (pipeline image-text-to-text). Su tamaño contenido (27B) y su licencia permisiva lo convierten en una opción relevante para despliegues en infraestructura propia con GPUs de gama alta, y ya cuenta con más de 2,4 millones de descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con un codificador de visión acoplado, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). La columna vertebral del lenguaje consta de 64 capas con una dimensión oculta de 5120 y una dimensión intermedia de FFN de 17408. El diseño de capas es híbrido: por cada bloque de cuatro capas, tres usan Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) y una usa Gated Attention (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64). El vocabulario tiene 248.320 entradas (con padding). El modelo se entrenó con Multi-Token Prediction (MTP) multi-paso.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Las innovaciones destacadas por el autor son la preservación del contexto de razonamiento ("Thinking Preservation") y la mejora en flujos de trabajo de frontend y razonamiento a nivel de repositorio. No se especifica si se empleó decodificación especulativa más allá del entrenamiento con MTP.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes y texto (image-text-to-text), con codificador de visión dedicado.
- Codificación agéntica: manejo de flujos de frontend y razonamiento a nivel de repositorio.
- Razonamiento matemático y de código (evaluado en SWE-bench Verified, Pro y Multilingual).
- Preservación del contexto de razonamiento entre mensajes históricos (Thinking Preservation).
- Compatibilidad con tool calling y function calling a través de los frameworks de despliegue soportados (vLLM, SGLang, Transformers).
- Capacidades multilingües en tareas de código, según los resultados de SWE-bench Multilingual.
- Soporte de contexto largo (hasta 1.010.000 tokens en modo extensible).

## Casos de uso

- **Resolución automática de issues en repositorios**: el modelo puede recibir un repositorio y un issue, razonar sobre el código y generar un parche; sus resultados en SWE-bench Verified (77,2) lo hacen adecuado para pipelines de revisión automática de PRs.
- **Asistente de codificación en IDE**: con 262.144 tokens de contexto nativo, puede mantener el estado de un proyecto grande y responder consultas multi-archivo sin perder referencias.
- **Desarrollo frontend asistido**: la model card destaca mejoras específicas en flujos de frontend, por lo que encaja en herramientas que generan componentes UI a partir de descripciones o capturas de pantalla (aprovechando el codificador de visión).
- **Atención al cliente con contexto largo**: la ventana extensible hasta 1.010.000 tokens permite gestionar conversaciones e historiales de documentación muy extensos en un solo contexto.
- **Análisis de documentos con imágenes**: al aceptar entradas image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados combinados con texto.
- **Agentes multi-paso con preservación de razonamiento**: la opción Thinking Preservation reduce la sobrecarga en bucles iterativos de desarrollo, útil en agentes que ejecutan tareas largas con múltiples herramientas.
- **Migración y refactorización multilingüe**: sus resultados en SWE-bench Multilingual (69,3) lo hacen apto para tareas de traducción de código entre lenguajes y actualización de dependencias.

## Benchmarks y rendimiento

Datos publicados en la model card (categoría Coding Agent):

| Benchmark | Qwen3.5-27B | Qwen3.5-397B-A17B | Gemma4-31B | Claude 4.5 Opus | Qwen3.6-35B-A3B | Qwen3.6-27B |
|---|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 76,2 | 52,0 | 80,9 | 73,4 | 77,2 |
| SWE-bench Pro | 51,2 | 50,9 | 35,7 | 57,1 | 49,5 | 53,5 |
| SWE-bench Multilingual | 69,3 | 69,3 | 51,7 | 77,5 | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 27,78B parámetros en safetensors (55,6 GB de repo), en FP16 se requieren aproximadamente 56 GB de VRAM solo para pesos; en cuantización de 8 bits, unos 28 GB; en 4 bits, unos 14-16 GB (estimación orientativa, no confirmada por el autor).
- **GPU recomendadas**: A100 80 GB o H100 80 GB para FP16 sin cuantizar; para cuantizaciones de 8 bits, una RTX 4090 (24 GB) o L40S (48 GB) pueden ser suficientes.
- **Consumer GPU**: en cuantización de 4 bits es plausible en GPUs de 24 GB (RTX 4090, RTX 3090), aunque el contexto largo y el codificador de visión incrementan el uso de memoria.
- **Opciones de despliegue**: Hugging Face Transformers, vLLM, SGLang, KTransformers; también compatible con endpoints gestionados (SageMaker, Azure).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B | 27,78B | 262.144 (ext. 1.010.000) | 77,2 | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.5-27B | 27B | no disponible | 75,0 | no disponible | Pesos abiertos en HF |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | 73,4 | no disponible | Pesos abiertos en HF |
| Gemma4-31B | 31B | no disponible | 52,0 | no disponible | Pesos abiertos en HF |

Claude 4.5 Opus (80,9 en SWE-bench Verified) se incluye como referencia propietaria, pero no es de pesos abiertos.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos ni evaluación de riesgos; se recomienda auditar el modelo antes de usos sensibles.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en contextos largos o tareas de código con APIs no documentadas.
- No se especifican los idiomas soportados oficialmente; el rendimiento fuera del inglés y del código multilingüe no está documentado.
- El contexto extensible hasta 1.010.000 tokens puede degradar la calidad y aumentar el coste computacional; no se han publicado métricas de rendimiento en esa longitud.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar los términos de los datos de entrenamiento (no publicados) y las dependencias del codificador de visión.
- La model card referencia una versión posterior (Qwen3.8-27B) como `new_version`, lo que indica que Qwen3.6-27B puede quedar obsoleto a corto plazo.
- No hay información sobre cuantizaciones oficiales ni sobre latencia/throughput en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Blog del modelo: https://qwen.ai/blog?id=qwen3.6-27b
- Qwen Chat: https://chat.qwen.ai
- Sitio oficial de Qwen: https://qwen.ai/home
