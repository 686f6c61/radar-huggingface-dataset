# jacobmorrison/qwen3.6-35b-a3b-miles-12k

## Resumen

`jacobmorrison/qwen3.6-35b-a3b-miles-12k` es una distribución de pesos derivada de Qwen3.6-35B-A3B, el primer modelo abierto de la serie Qwen3.6 publicada por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal con encoder de visión, por lo que su pipeline es `image-text-to-text`: acepta entradas de imagen y texto y genera texto. La arquitectura es un transformer híbrido con mezcla de expertos (MoE) de 35.107.181.936 parámetros totales y aproximadamente 3B activados por token, lo que permite un coste de cómputo por token propio de un modelo de 3B con una capacidad de representación mucho mayor.

El interés técnico del modelo está en su *layout* híbrido: 40 capas organizadas en 10 bloques de la forma 3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE), es decir, atención lineal con estado recurrente combinada con atención completa en una proporción de 3 a 1. A ello se suma un contexto nativo de 262.144 tokens, extensible hasta 1.010.000, y un entrenamiento con *multi-token prediction* (MTP). El autor del repositorio, `jacobmorrison`, redistribuye los pesos con un sufijo propio (`miles-12k`) sin documentar en la información disponible la receta de ajuste fino aplicada.

Este repositorio concreto es relevante porque permite descargar los pesos del modelo en formato `safetensors` compatibles con Transformers, vLLM, SGLang y KTransformers, bajo licencia Apache 2.0. Conviene tener en cuenta que, en el momento de la consulta, el repositorio registra 0 descargas y 0 *likes*, y que el modelo base se publicó en octubre de 2026, por lo que no existe todavía validación independiente de esta copia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con MoE y encoder de visión; etiqueta `qwen3_5_moe` |
| Parámetros totales | 35.107.181.936 (35,1B) |
| Parámetros activos | ~3B por token (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | No disponible en la documentación; pesos publicados en `safetensors` (susceptibles de cuantización externa a GGUF, AWQ, GPTQ o FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repositorio de 70,2 GB) |
| Dimensión oculta | 2048 |
| Capas | 40 |
| Vocabulario | 248.320 (con *padding*) |
| Expertos | 256; 8 enrutados + 1 compartido activos; dimensión intermedia de experto 512 |
| Cabezas de atención | Gated Attention: 16 para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64; Gated DeltaNet: 32 cabezas lineales para V y 16 para QK, dimensión 128 |
| Vision encoder | Sí (modelo de lenguaje causal con encoder de visión) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión cuyo bloque de lenguaje combina dos mecanismos de atención en una proporción 3:1. Los bloques de Gated DeltaNet implementan atención lineal con estado recurrente (32 cabezas para V y 16 para QK, dimensión de cabeza 128), lo que reduce el coste de memoria y cómputo en secuencias largas; cada cuarto bloque utiliza Gated Attention convencional (16 cabezas de consulta y 2 de clave-valor, dimensión 256, RoPE de 64), presumiblemente para preservar la capacidad de recuperación exacta a larga distancia. Cada subbloque de atención va seguido de una capa MoE con 256 expertos, de los que se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512 por experto. El resultado son 40 capas y una dimensión oculta de 2048.

El modelo se distribuye en dos etapas declaradas: preentrenamiento y postentrenamiento. El autor del modelo base indica que el entrenamiento incluye *multi-token prediction* (MTP) con múltiples pasos, lo que habilita decodificación especulativa nativa y acelera la generación. No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento. Tampoco se documenta la receta del ajuste fino asociado al sufijo `miles-12k` de este repositorio, ni el conjunto de datos empleado por `jacobmorrison`.

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones en lenguaje natural.
- Comprensión de imágenes: al ser un modelo `image-text-to-text`, puede razonar sobre diagramas, capturas de pantalla, documentos escaneados y fotografías junto a una instrucción textual.
- Codificación agéntica: el autor destaca mejoras específicas en flujos de trabajo de *frontend* y razonamiento a nivel de repositorio.
- Razonamiento multi-paso y ejecución de tareas encadenadas, con soporte de la opción de *thinking preservation* (retención del contexto de razonamiento de mensajes anteriores).
- *Tool calling* / *function calling*: el modelo está orientado a entornos agénticos y su integración con vLLM y SGLang permite servir APIs compatibles con el formato de herramientas.
- Contexto largo: 262.144 tokens nativos, ampliables a 1.010.000, adecuado para analizar repositorios completos o documentación extensa.
- Generación de código en múltiples lenguajes, con resultados declarados en variantes multilingües de SWE-bench.
- Decodificación especulativa mediante las cabezas MTP entrenadas con múltiples pasos.
- Capacidades multilingües: no detalladas en la información disponible (los *tags* del repositorio no incluyen lista de idiomas).

## Casos de uso

- **Mantenimiento de repositorios y resolución de incidencias**: con 262.144 tokens de contexto y un rendimiento declarado de 73,4 en SWE-bench Verified, el modelo puede recibir varios ficheros del repositorio, el *issue* y las trazas de error en una sola ventana y proponer un parche coherente con el resto del código.
- **Agente de terminal y automatización de DevOps**: integraría el modelo en un bucle de *tool calling* que ejecute comandos, lea la salida y decida el siguiente paso; su contexto largo evita perder el historial de la sesión en tareas de diagnóstico prolongadas.
- **Revisión de *pull requests* automatizada**: analizaría el *diff* junto con el contexto de los ficheros afectados y el historial de mensajes, usando la retención de razonamiento para no repetir análisis ya realizados entre iteraciones.
- **Generación de interfaces a partir de diseños**: gracias al encoder de visión, puede recibir una maqueta o captura de pantalla y producir el marcado y los estilos correspondientes, lo que encaja con la mejora declarada en flujos de *frontend*.
- **Extracción de datos de documentos e imágenes**: facturas, informes escaneados o tablas fotografiadas pueden procesarse en una sola pasada multimodal, devolviendo JSON estructurado mediante *function calling*.
- **Asistente de análisis de documentación técnica extensa**: manuales de miles de páginas o especificaciones completas caben en la ventana extendida de hasta 1.010.000 tokens, permitiendo preguntas con referencias cruzadas sin recuperación externa.
- **Atención al cliente con contexto de caso completo**: gestionaría conversaciones multi-turno con historial largo, adjuntando capturas de pantalla del problema del usuario y consultando herramientas internas de pedidos o cuentas.
- **Generación de código en pipelines de CI/CD**: desplegado con vLLM o SGLang, puede servir como paso de corrección automática de pruebas fallidas, recibiendo el *log* y el código implicado.

## Benchmarks y rendimiento

Resultados declarados en la *model card* del modelo base (agente de codificación). Las celdas no presentes en la información disponible se marcan como tales.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35B-A3B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de visión para este modelo. Los datos anteriores corresponden al modelo base Qwen3.6-35B-A3B; no hay benchmarks publicados de la variante `miles-12k` de `jacobmorrison`.

## Requisitos de hardware

- **Pesos en precisión original (BF16/FP16)**: 35,1B parámetros implican aproximadamente 70 GB de pesos, coherente con el tamaño del repositorio (70,2 GB). Requiere GPU de 80 GB (H100, A100 80GB, H200) o reparto en varias GPU.
- **FP8**: en torno a 35 GB de pesos; cabe en una A100 80GB, H100 80GB o L40S 48GB con margen para caché KV.
- **INT4 (AWQ/GPTQ)**: aproximadamente 18-20 GB, lo que permite ejecución en una única RTX 4090 de 24 GB o en una RTX 3090, a costa de cierta pérdida de calidad.
- **GPU consumer**: en BF16 no cabe en una GPU de 24 GB; son necesarias al menos dos o tres RTX 4090/5090 con tensor parallelism, o bien cuantización INT4 para una sola tarjeta. El reducido número de parámetros activos (~3B) mantiene el coste de cómputo por token bajo, pero no reduce la huella de memoria de los pesos.
- **Memoria para contexto largo**: a 262.144 tokens la caché KV crece de forma significativa, aunque el uso de Gated DeltaNet en 3 de cada 4 capas reduce su tamaño frente a un transformer de atención completa equivalente. Para la ventana extendida de 1.010.000 tokens se recomienda planificación de memoria en vLLM con *paged attention* y nodos multi-GPU.
- **Opciones de despliegue**: Transformers, vLLM, SGLang y KTransformers, según la *model card*. Para CPU/consumer, herramientas externas de cuantización a GGUF (llama.cpp, Ollama) aunque no se distribuyen pesos GGUF oficiales en este repositorio.
- **Latencia y throughput**: no disponibles. El uso de MTP permite decodificación especulativa, que en modelos de esta familia suele aumentar el throughput en generación, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este modelo, vía `jacobmorrison`) | 35,1B totales / ~3B activos | 262.144 (hasta 1.010.000) | 73,4 | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.5-35B-A3B | ~3B activos (total no disponible) | no disponible | 70,0 | no disponible en la información | Serie anterior de Qwen |
| Qwen3.5-27B | 27B (denso) | no disponible | 75,0 | no disponible en la información | Serie anterior de Qwen |
| Gemma4-31B | 31B (denominación) | no disponible | 52,0 | no disponible en la información | Modelo de Google |
| Gemma4-26B-A4B | ~4B activos (denominación) | no disponible | 17,4 | no disponible en la información | Modelo de Google |

La comparación relevante es doble: frente a Qwen3.5-35B-A3B, el salto en SWE-bench Verified es de +3,4 puntos y en SWE-bench Multilingual de +6,9; frente al denso Qwen3.5-27B, Qwen3.6-35B-A3B queda 1,6 puntos por debajo en Verified pero lo supera claramente en Multilingual (67,2 frente a 69,3 es inferior, en realidad) y en Pro (49,5 frente a 51,2, también inferior), por lo que el denso de 27B sigue siendo competitivo en tareas de codificación de un solo repositorio. Los modelos Gemma4 de la tabla quedan muy por debajo en tareas agénticas según los datos del propio autor.

## Limitaciones y advertencias

- **Repositorio derivado y sin validación**: se trata de una redistribución de `jacobmorrison`, no de la publicación oficial de Qwen. Con 0 descargas y 0 *likes*, no hay evidencia de terceros sobre la fidelidad de los pesos ni sobre el efecto del ajuste `miles-12k`.
- **Receta de ajuste fino no documentada**: no se detalla el conjunto de datos, el número de pasos ni los hiperparámetros del ajuste, lo que impide evaluar riesgos de sobreajuste o de degradación de capacidades generales.
- **Idiomas no declarados**: el repositorio no incluye lista de idiomas soportados; el rendimiento en castellano no está garantizado ni medido.
- **Riesgo de alucinación**: como todo modelo generativo de su escala, puede inventar APIs, nombres de ficheros o referencias en tareas de codificación y análisis documental; se recomienda verificación automática de parches y pruebas en producción.
- **Sesgos**: no se han publicado evaluaciones de sesgo, toxicidad o equidad para esta variante ni para el modelo base en la información disponible.
- **Contexto extendido no verificado**: la extensión hasta 1.010.000 tokens es una capacidad declarada; el rendimiento efectivo de recuperación en ventanas muy largas no está medido en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; el enlace de licencia apunta al repositorio oficial de Qwen, por lo que conviene conservar dicho aviso al redistribuir.
- **Cuantizaciones no oficiales**: al no publicarse GGUF, AWQ ni GPTQ en el repositorio, cualquier versión cuantizada procede de terceros y puede degradar el rendimiento de forma no documentada.
- **Fecha de publicación reciente**: creado el 24 de octubre de 2026, sin historial de mantenimiento ni issues que permitan evaluar su estabilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jacobmorrison/qwen3.6-35b-a3b-miles-12k
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Texto de la licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Qwen Chat (demo): https://chat.qwen.ai
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las entradas devueltas por el buscador no guardaban relación con Qwen3.6 ni con este repositorio.
