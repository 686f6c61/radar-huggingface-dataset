# lexeon/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con codificador de visión publicado por el equipo Qwen (Alibaba) y redistribuido en Hugging Face por el usuario `lexeon`. Se trata de la primera variante de pesos abiertos de la familia Qwen3.6, sucesora de la serie Qwen3.5 lanzada en febrero. El modelo está diseñado con un enfoque explícito en codificación agéntica ("agentic coding"), es decir, flujos de trabajo de desarrollo donde el modelo razona sobre repositorios completos, ejecuta herramientas y mantiene contexto de razonamiento entre turnos.

La arquitectura combina atención lineal (Gated DeltaNet) con atención clásica con compuertas (Gated Attention) en un esquema híbrido intercalado, sobre una capa de mezcla de expertos (MoE) con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido. Con 35.951.822.704 parámetros totales según los safetensors y aproximadamente 3 mil millones activos por token, el modelo ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. Incorpora además un módulo MTP (multi-token prediction) entrenado con múltiples pasos, orientado a decodificación especulativa.

El modelo es relevante porque combina una huella de cómputo por token reducida (3B activos) con un contexto muy largo y capacidades multimodales (image-text-to-text), lo que lo sitúa en la categoría de modelos MoE eficientes para despliegue en producción. Su licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + Gated Attention, con capas MoE intercaladas y codificador de visión |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B por token (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |

Otros datos técnicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Dimensión oculta | 2048 |
| Token embedding | 248.320 (con padding) |
| Número de capas | 40 |
| Layout oculto | 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Cabeceras de atención lineal (Gated DeltaNet) | 32 para V, 16 para QK; dimensión de cabeza 128 |
| Cabeceras de atención con compuertas | 16 para Q, 2 para KV; dimensión de cabeza 256; RoPE dim 64 |
| Expertos | 256; 8 enrutados + 1 compartido activos; dimensión intermedia de experto 512 |
| MTP | Entrenado con múltiples pasos |
| Tamaño del repo | 71,9 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido poco habitual. El layout de 40 capas se organiza en 10 bloques repetidos, cada uno compuesto por tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, y cada una de ellas va seguida de una capa MoE. La Gated DeltaNet es un mecanismo de atención lineal con 32 cabezas para V y 16 para QK (dimensión 128), mientras que la Gated Attention usa 16 cabezas para Q y solo 2 para KV (dimensión 256), lo que reduce drásticamente el coste de caché KV. La capa MoE cuenta con 256 expertos de dimensión intermedia 512, activando 8 enrutados más 1 compartido por token, lo que explica que solo ~3B de los ~36B parámetros se activen en cada paso.

El modelo se entrena en dos fases: pre-entrenamiento y post-entrenamiento, e incluye un codificador de visión que lo habilita para tareas image-text-to-text. La model card menciona formación con MTP (multi-token prediction) en múltiples pasos, una técnica que permite decodificación especulativa y acelera la generación. También se destaca una innovación denominada "Thinking Preservation": la capacidad de retener contexto de razonamiento de mensajes históricos para flujos de desarrollo iterativos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto muy largo (262K nativos, hasta 1M extendido).
- Codificación agéntica: resolución de issues a nivel de repositorio, razonamiento sobre código y flujos de frontend.
- Comprensión de imagen y texto (pipeline `image-text-to-text`), gracias al codificador de visión integrado.
- Razonamiento matemático y tareas de lógica (implícito en el perfil de la familia Qwen, aunque no se detallan benchmarks específicos en la información disponible).
- Modo de pensamiento preservado ("Thinking Preservation"): retención del razonamiento de mensajes previos para desarrollo iterativo.
- Decodificación especulativa vía MTP entrenado con múltiples pasos.
- Compatibilidad declarada con Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Capacidades multilingües: no disponible en detalle (la model card menciona SWE-bench Multilingual como benchmark, lo que sugiere soporte de varios lenguajes de programación, pero no se listan idiomas naturales).

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un repositorio y un issue, razonar sobre el código y proponer parches, apoyándose en SWE-bench Verified (73,4) como referencia de su competencia en esta tarea.
- Asistente de codificación en IDE con contexto de proyecto completo: gracias a los 262K tokens nativos, puede mantener en contexto varios archivos fuente, tests y documentación sin truncar.
- Agente de CI/CD: integrado vía tool calling y ejecución de terminal (evaluado en Terminal-Bench 2.0), puede diagnosticar fallos de build, ejecutar comandos y proponer correcciones dentro de un pipeline.
- Análisis de documentación técnica con imágenes: al ser image-text-to-text, puede procesar capturas de pantalla, diagramas de arquitectura o figuras de papers junto con texto para responder preguntas o generar resúmenes.
- Desarrollo frontend asistido: la model card destaca específicamente la mejora en flujos de frontend y razonamiento a nivel de repositorio, adecuado para generar componentes, corregir estilos o migrar código entre frameworks.
- Refactorización de código legacy a gran escala: la ventana de contexto extensible hasta 1M tokens permite procesar módulos completos o monorepos pequeños en una sola pasada.
- Atención al cliente técnica multi-turno: el modo de preservación de pensamiento y el contexto largo permiten conversaciones prolongadas con historial de razonamiento acumulado.
- Despliegue eficiente en producción: con solo ~3B parámetros activos, el coste por token es bajo comparado con modelos densos de tamaño similar, lo que lo hace apto para servir a muchos usuarios concurrentes en hardware moderado.

## Benchmarks y rendimiento

Datos de la model card (categoría Coding Agent). El modelo se compara con Qwen3.5-27B, Gemma4-31B, Qwen3.5-35BA3B y Gemma4-26BA4B.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible (dato truncado en la información proporcionada) |

No se han publicado en la información disponible resultados de benchmarks de lenguaje general (MMLU, GSM8K, HumanEval) ni de evaluación multimodal.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16 el modelo completo ocupa aproximadamente 72 GB (coincide con el tamaño del repo de 71,9 GB). En cuantización de 8 bits se reduciría a ~36 GB y en 4 bits a ~18-20 GB, aunque no se documentan oficialmente variantes cuantizadas.
- GPU recomendadas: para bf16 completo se necesita al menos una A100 80 GB o H100 80 GB; también es viable en configuraciones multi-GPU (por ejemplo, 2× A100 40 GB o 2× RTX 4090 24 GB con tensor parallelism).
- GPU de consumo: con cuantización a 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090, siempre que se use un runtime compatible con MoE cuantizado (por ejemplo, llama.cpp o KTransformers). No hay confirmación oficial de pesos GGUF en el repo.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers están explícitamente soportados según la model card.
- Latencia y throughput: no disponibles en la información proporcionada. El bajo número de parámetros activos (~3B) y el uso de MTP para decodificación especulativa sugieren un throughput alto por GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35,95B | ~3B | 262K (ext. 1M) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | no disponible | ~3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B (denso) | 27B | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B (denso) | 31B | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | 17,4 | no disponible |

En SWE-bench Verified, Qwen3.6-35B-A3B (73,4) supera a su predecesor Qwen3.5-35B-A3B (70,0) y a Gemma4-31B (52,0), pero queda ligeramente por debajo de Qwen3.5-27B (75,0) en esa métrica concreta. En SWE-bench Multilingual y SWE-bench Pro, Qwen3.6-35B-A3B lidera la tabla con 67,2 y 49,5 respectivamente. No se dispone de datos de benchmarks generales para comparar más allá de la categoría de agentes de código.

## Limitaciones y advertencias

- El repositorio es una redistribución por el usuario `lexeon` (0 descargas, 0 likes en el momento de la consulta); no es el repo oficial de Qwen. Conviene verificar la integridad de los pesos antes de usarlos en producción.
- La model card no documenta sesgos conocidos, comportamiento en idiomas distintos del inglés o del chino, ni evaluaciones de seguridad.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se aportan métricas de factualidad ni de calibración.
- La información sobre idiomas soportados no está disponible; el soporte multilingüe se infiere solo de SWE-bench Multilingual (lenguajes de programación), no de idiomas naturales.
- No se documentan tipos de cuantización oficiales; usar pesos cuantizados por terceros puede degradar el rendimiento, especialmente en capas MoE.
- El dato de Terminal-Bench 2.0 aparece truncado en la información proporcionada; no debe citarse como válido.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar la licencia del repositorio oficial de Qwen referenciada en `license_link`, ya que la redistribución podría no reflejar términos adicionales.
- La fecha de creación del repo (2026-11-17) y la denominación "Qwen3.6" no permiten confirmar en la información disponible si se trata de un modelo oficial o de una versión preliminar; se recomienda contrastar con el blog oficial de Qwen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lexeon/Qwen3.6-35B-A3B
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
- Imagen de benchmarks: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3.6/Figures/qwen3.6_35b_a3b_score.png
