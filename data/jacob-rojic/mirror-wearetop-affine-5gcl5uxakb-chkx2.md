# jacob-rojic/mirror-wearetop-affine-5gcl5uxakb-chkx2

## Resumen

El modelo `jacob-rojic/mirror-wearetop-affine-5gcl5uxakb-chkx2` es un espejo (mirror) del modelo original `wearetop/affine-5gcl5uxakb-chkx2`, que corresponde a la arquitectura **Qwen3.6-35B-A3B**, desarrollada por Alibaba. Se trata de un modelo causal de lenguaje multimodal (imagen-texto a texto) con un codificador de visión integrado, diseñado para tareas de razonamiento, generación de código y comprensión visual. El modelo destaca por su arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención tradicional (Gated Attention) y mezcla de expertos (MoE), logrando 35 mil millones de parámetros totales con solo 3 mil millones activos por token, lo que lo hace eficiente en inferencia.

La relevancia de este modelo radica en su enfoque en **codificación agéntica** y **razonamiento a nivel de repositorio**, con una ventana de contexto nativa de 262 144 tokens extensible hasta más de un millón, y la capacidad de preservar el contexto de razonamiento de mensajes históricos. Está pensado para desarrolladores que necesitan un modelo robusto para tareas de programación asistida, agentes autónomos y análisis multimodal en producción, con una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention + MoE) |
| Parametros totales | 35 951 822 704 (35B) |
| Parametros activos | 3B (MoE: 8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no especificado (probablemente multilingüe, pero no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida innovadora que alterna bloques de **Gated DeltaNet** (atención lineal) con bloques de **Gated Attention** (atención tradicional con RoPE), intercalados con capas de mezcla de expertos (MoE). La configuración exacta es de 40 capas organizadas en 10 grupos, cada uno con 3 sub-bloques de (Gated DeltaNet → MoE) seguidos de 1 sub-bloque de (Gated Attention → MoE). Los detalles técnicos incluyen: 32 cabezas de atención lineal para V y 16 para QK con dimensión 128, 16 cabezas de atención tradicional para Q y 2 para KV con dimensión 256, y una dimensión de embedding de 2048. El MoE cuenta con 256 expertos, de los cuales 8 se activan por token más un experto compartido, con dimensión intermedia de 512.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento (fine-tuning), con una técnica de **predicción multi-token (MTP)** entrenada con múltiples pasos. Aunque no se especifican los datos de entrenamiento (número de tokens, composición del dataset), la model card menciona que el modelo prioriza la estabilidad y la utilidad real, con mejoras específicas en codificación agéntica y preservación del razonamiento. No hay información sobre el uso de RLHF o DPO.

## Capacidades

- **Generación de texto y razonamiento**: capaz de mantener conversaciones complejas y resolver tareas de razonamiento lógico y matemático.
- **Codificación agéntica**: maneja flujos de trabajo de frontend y razonamiento a nivel de repositorio con alta precisión, según los benchmarks publicados.
- **Preservación del pensamiento**: opción para retener el contexto de razonamiento de mensajes históricos, lo que facilita el desarrollo iterativo.
- **Comprensión multimodal**: al incluir un codificador de visión, puede procesar imágenes y responder preguntas sobre ellas (image-text-to-text).
- **Tool calling y function calling**: no se menciona explícitamente, pero por ser un modelo de la serie Qwen3.6, es probable que soporte estas capacidades, aunque no está confirmado.
- **Capacidades multilingües**: no especificado, pero los modelos Qwen suelen ser multilingües; sin embargo, no hay confirmación en la información proporcionada.

## Casos de uso

- **Desarrollo de software asistido por IA**: el modelo puede generar, revisar y refactorizar código en múltiples lenguajes, integrándose en IDEs o pipelines de CI/CD para automatizar tareas de programación, gracias a su capacidad de razonamiento a nivel de repositorio.
- **Agentes autónomos de resolución de bugs**: con su rendimiento en SWE-bench Verified (73.4), puede utilizarse para identificar y corregir errores en repositorios de código, reduciendo el tiempo de depuración en equipos de desarrollo.
- **Análisis de imágenes técnicas**: al ser multimodal, puede interpretar diagramas, capturas de pantalla o esquemas de arquitectura, y generar explicaciones o código basado en ellos, útil en documentación técnica.
- **Asistente de atención al cliente con contexto largo**: con una ventana de 262K tokens, puede gestionar conversaciones extensas y mantener el historial completo, ideal para soporte técnico de productos software.
- **Generación de documentación técnica**: puede resumir código, crear guías de uso o explicar funcionalidades complejas a partir de repositorios, aprovechando su capacidad de razonamiento contextual.
- **Investigación en IA**: como modelo de código abierto con licencia Apache 2.0, es adecuado para experimentación académica en razonamiento multimodal, eficiencia MoE y técnicas de atención lineal.

## Benchmarks y rendimiento

Según la model card, se publicaron resultados para tareas de codificación agéntica, comparando con otros modelos. La tabla siguiente muestra los valores disponibles (el dato de Terminal-Bench 2.0 está truncado en la fuente):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | **73.4** |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | **67.2** |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | **49.5** |
| Terminal-Bench 2.0 | (dato no disponible) | (dato no disponible) | (dato no disponible) | (dato no disponible) | (dato no disponible) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 35B parámetros en BF16, se necesitan aproximadamente 70 GB de VRAM para cargar los pesos completos. Sin embargo, al ser un modelo MoE con solo 3B activos, la memoria de activación es menor, pero la carga de pesos requiere la cantidad completa. Con cuantización (por ejemplo, 8 bits) se podría reducir a ~35 GB, y en 4 bits a ~18 GB, aunque no se han publicado cifras oficiales.
- **GPU recomendadas**: para inferencia sin cuantizar, se requieren GPUs de clase profesional como A100 (80 GB), H100 (80 GB) o A6000 (48 GB, insuficiente para BF16). Con cuantización 4 bits, podría caber en una RTX 4090 (24 GB) o similar.
- **Compatibilidad con consumer GPU**: no es viable en GPU de consumo sin cuantización agresiva; con 4 bits podría ejecutarse en una RTX 3090/4090, pero con limitaciones de velocidad.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers, lo que permite servir el modelo en entornos de producción con optimizaciones de throughput.
- **Latencia y throughput**: no se proporcionan datos oficiales; al ser MoE con 3B activos, la latencia por token es menor que la de un modelo denso de 35B, pero depende del hardware y la implementación.

## Comparativa con modelos similares

El modelo se posiciona como una mejora de **Qwen3.5-35B-A3B**, con el que comparte arquitectura base pero incorpora mejoras en codificación agéntica y preservación del pensamiento. También compite con otros modelos MoE de tamaño similar:

| Modelo | Parámetros totales / activos | Contexto | Licencia | Punto fuerte |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35B / 3B | 262K (ext. 1M) | Apache 2.0 | Codificación agéntica, multimodal |
| Qwen3.5-35B-A3B | 35B / 3B | 262K | Apache 2.0 | Versión anterior, sin mejoras de agente |
| Gemma4-26B-A4B | 26B / 4B | 128K (estimado) | Gemma License | Eficiencia, pero menor rendimiento en SWE-bench |
| Qwen3.5-27B (denso) | 27B / 27B | 128K (estimado) | Apache 2.0 | Denso, mayor VRAM pero sin MoE |

La comparativa se basa en los datos de benchmarks disponibles; el modelo supera a Gemma4-26B-A4B en todas las tareas de codificación y se acerca a Qwen3.5-27B en SWE-bench Verified, con la ventaja de un menor coste de inferencia gracias a la activación selectiva de parámetros.

## Limitaciones y advertencias

- **Sesgos y alucinación**: no se ha publicado información sobre sesgos específicos; como cualquier modelo de lenguaje, puede generar contenido inexacto o inventado, especialmente en dominios poco representados en sus datos de entrenamiento.
- **Limitaciones de contexto**: aunque el contexto nativo es de 262K tokens, la extensión a 1M tokens puede degradar la calidad de los resultados en los extremos de la ventana; se recomienda validar en casos de uso reales.
- **Idiomas**: no se especifican los idiomas soportados; aunque los modelos Qwen suelen ser multilingües, no hay garantía de un rendimiento uniforme en todos los idiomas.
- **Cuantización**: no se han publicado guías oficiales de cuantización; el uso de formatos de baja precisión puede afectar la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- **Autenticidad del mirror**: al ser un repositorio espejo (`jacob-rojic/mirror-...`), no está afiliado oficialmente a Alibaba; se recomienda verificar la integridad de los pesos y usar el repositorio original si se requiere soporte oficial.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente la autoría del modelo original.

## Enlaces

- [HuggingFace - modelo espejo](https://huggingface.co/jacob-rojic/mirror-wearetop-affine-5gcl5uxakb-chkx2)
- [HuggingFace - modelo original](https://huggingface.co/wearetop/affine-5gcl5uxakb-chkx2)
- [Blog oficial de Qwen sobre Qwen3.6-35B-A3B](https://qwen.ai/blog?id=qwen3.6-35b-a3b)
- [Modelo similar: jacob-rojic/albedo-arc-jacob-rojic-w-dare](https://huggingface.co/jacob-rojic/albedo-arc-jacob-rojic-w-dare)
- [FriendliAI - página del modelo affine-5gcl5uxakb-chkx2](https://friendli.ai/models/wearetop/affine-5gcl5uxakb-chkx2)
- [LLM Leaderboard (benchlm.ai)](https://benchlm.ai/)
