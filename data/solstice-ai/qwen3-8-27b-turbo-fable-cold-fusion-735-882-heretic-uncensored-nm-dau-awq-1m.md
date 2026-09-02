# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-AWQ-1M

## Resumen

El modelo **Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-AWQ-1M** es un checkpoint cuantizado en 4 bits (AWQ, W4A16) de un fine-tune de la familia Qwen3.8-27B, desarrollado por Solstice-AI sobre el modelo base de DavidAU. Se presenta como una versión optimizada para inferencia en producción, con soporte nativo de contexto de 1.048.576 tokens (2^20) y capacidades multimodales (imagen-texto). El nombre incluye términos como "TURBO", "Cold Fusion" y "Uncensored", que apuntan a un fine-tune orientado a razonamiento, codificación y generación sin restricciones de contenido.

La relevancia de este modelo radica en su promesa de rendimiento competitivo frente a modelos propietarios de gran tamaño (según la model card, supera a Claude Opus 4.6 Max en varios benchmarks), pero con un peso de solo 1,1 GB gracias a la cuantización AWQ, lo que permite ejecutarlo en GPUs de consumo con 24 GB de VRAM. Está diseñado para integrarse con motores de inferencia como vLLM, SGLang y Anvil, y su licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa híbrida (atención lineal en 48 de 64 capas) con torre de visión y MTP (Multi-Token Prediction) |
| Parametros totales | 27B (modelo base); el checkpoint AWQ reporta 460.730.096 en safetensors, dato inconsistente con el tamaño declarado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (2^20) nativo según la model card; el modelo base Qwen3.8-27B tiene 262K nativo extensible a 1M |
| Tipos de cuantizacion | AWQ 4-bit (W4A16 GEMM), int4; también disponible en GGUF según tags |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ), GGUF (según tags) |

## Arquitectura y entrenamiento

El modelo base, **Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU**, es un fine-tune de DavidAU sobre el Qwen3.8-27B original de Alibaba. Este último es un modelo denso de 27B parámetros (~28B contando el encoder de visión de ~1B) con 64 capas, tamaño oculto de 5.120 y un vocabulario de 248.320 tokens. Su arquitectura es híbrida: combina atención lineal en 48 de las 64 capas con atención completa en las restantes, e incorpora una torre de visión para procesamiento multimodal y un cabezal MTP (Multi-Token Prediction) que actúa como borrador para decodificación especulativa.

El fine-tune de DavidAU añade capas de ajuste orientadas a razonamiento, análisis, creatividad y generación "uncensored" (sin filtros de contenido), con contribuciones de Nightmedia y otros ajustes no divulgados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La cuantización AWQ se realizó con AutoRound layer-wise Activation-Aware scaling, según la model card, lo que busca preservar la calidad del modelo original en 4 bits.

## Capacidades

- **Generación de texto y razonamiento**: maneja tareas de instrucción general, análisis, creatividad y razonamiento multi-paso.
- **Codificación y agente**: soporta tareas de programación competitiva, ingeniería de software y uso de herramientas (tool calling) según los benchmarks reportados (SWE-bench Pro, LiveCodeBench).
- **Visión multimodal**: al heredar la torre de visión del Qwen3.8-27B, puede procesar entradas de imagen y texto (pipeline image-text-to-text).
- **Contexto largo**: ventana de 1M tokens, adecuada para documentos extensos, conversaciones multi-turno y tareas de agente de larga duración.
- **Decodificación especulativa**: el cabezal MTP integrado permite acelerar la generación en motores compatibles (vLLM, SGLang).
- **Multilingüe**: soporte de inglés y chino, con posible transferencia a otros idiomas no verificada.
- **Generación sin censura**: el nombre "Uncensored" indica que no aplica filtros de contenido, lo que puede ser útil para investigación pero conlleva riesgos.

## Casos de uso

- **Atención al cliente automatizada**: con 1M de contexto, puede gestionar conversaciones multi-turno extensas, manteniendo el historial completo y resolviendo incidencias complejas sin perder el hilo.
- **Generación de código en producción**: su rendimiento en SWE-bench Pro (61,7%) y LiveCodeBench (90,3%) lo hace adecuado para integrarse en pipelines de CI/CD, generando parches, revisando pull requests o autocompletando funciones con tool calling.
- **Análisis de documentos legales o técnicos**: la ventana de 1M tokens permite procesar contratos, patentes o manuales completos de una sola vez, extrayendo cláusulas, resumiendo secciones o respondiendo preguntas específicas.
- **Asistentes de investigación multimodal**: al combinar visión y texto, puede analizar figuras, diagramas o capturas de pantalla junto con el texto circundante, útil para revisión de papers o informes técnicos.
- **Automatización de tareas de agente (computer use)**: con resultados de OSWorld-Verified (84,3%) y AndroidWorld (81,9%), puede controlar interfaces gráficas, navegar por aplicaciones o ejecutar flujos de trabajo en entornos virtuales.
- **Despliegue en edge con GPU de consumo**: al pesar solo 1,1 GB en AWQ, puede ejecutarse en una RTX 3090 o 4090 (24 GB) para prototipado rápido, asistentes locales o entornos con restricciones de hardware.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados, evaluados bajo el harness oficial de Claude Code con ventanas de 256K y 1M. **Estos datos no han sido verificados de forma independiente** y deben tomarse con cautela.

| Benchmark | Qwen3.8-27B TURBO (Solstice) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|
| SWE-bench Pro | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | 79,0% | 63,8% | +15,2% |
| CoWorkBench | 70,7% | 68,2% | +2,5% |
| OSWorld-Verified | 84,3% | 72,7% | +11,6% |
| AndroidWorld | 81,9% | 62,0% | +19,9% |
| IFBench | 79,5% | 62,5% | +17,0% |
| ARC-C | 735 (8-bit) / 719 (4-bit) | ~710–720 | Frontera cerrada |

No se han publicado resultados de benchmarks estándar como MMLU, GSM8K o HumanEval en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint AWQ de 4 bits ocupa ~1,1 GB en disco, pero la inferencia requiere VRAM adicional para activaciones y KV cache. Con contexto de 1M, la memoria necesaria supera los 24 GB; para contextos cortos (≤32K) cabe en GPUs de 24 GB.
- **GPUs recomendadas**: RTX 3090, RTX 4090, A10G (24 GB) para contextos moderados; para 1M de contexto se requieren GPUs con más memoria (A100 80GB, H100) o técnicas de offloading.
- **Compatibilidad con consumer GPUs**: sí, para contextos de hasta ~32K tokens en una RTX 4090; para contextos largos se necesita más VRAM o cuantización adicional.
- **Opciones de despliegue**: vLLM (con `--quantization awq`), SGLang (con RadixAttention), Anvil Runtime, TensorRT-LLM. También es posible usar llama.cpp si se dispone de la versión GGUF.
- **Latencia y throughput**: no se proporcionan datos específicos. La cuantización W4A16 GEMM permite aprovechar los Tensor Cores en GPUs Ampere/Ada/Hopper, con throughput típico de modelos 4-bit de 27B en vLLM (del orden de 50-100 tokens/s en una RTX 4090, estimación orientativa).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Qwen3.8-27B (base)** | 27B | 262K (ext. 1M) | Apache 2.0 | safetensors | Modelo original de Alibaba, sin fine-tune específico |
| **Qwen3.8-27B-TURBO (DavidAU)** | 27B | 262K (ext. 1M) | Apache 2.0 | safetensors, GGUF | Fine-tune base de este checkpoint, orientado a razonamiento y "uncensored" |
| **Solstice-AI AWQ-1M (este)** | 27B (cuantizado) | 1M | Apache 2.0 | AWQ, GGUF | Versión cuantizada y optimizada para producción, con benchmarks propios |

No se dispone de comparativas directas con otros modelos de 27B (p. ej., Llama 3.1 8B no es comparable por tamaño; Qwen3-30B-A3B es MoE). La comparación con Claude Opus 4.6 Max es la única referencia externa, pero es un modelo propietario y los resultados provienen del autor.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un fine-tune "uncensored", puede generar contenido ofensivo, inexacto o peligroso sin filtros. No se han realizado evaluaciones de sesgo o seguridad.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede inventar hechos, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- **Limitaciones de idioma**: solo se garantiza soporte para inglés y chino; otros idiomas pueden tener rendimiento degradado.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el nombre "Uncensored" puede implicar que el modelo no cumple con políticas de contenido de algunas plataformas; el usuario es responsable del cumplimiento legal.
- **Verificación de benchmarks**: los resultados de la model card no han sido replicados por terceros; la afirmación de "superar a Claude Opus 4.6 Max" debe tratarse con escepticismo hasta una validación independiente.
- **Inconsistencia de parámetros**: el número de parámetros reportado en safetensors (460M) no coincide con el tamaño declarado de 27B; puede deberse a un error en el registro o a que el archivo solo contiene una parte de los pesos. Se recomienda verificar la integridad del checkpoint antes de usarlo en producción.
- **Contexto de 1M**: aunque se anuncia como nativo, el modelo base solo soporta 262K de forma nativa; la extensión a 1M puede requerir técnicas de interpolación posicional o atención dispersa, con posible degradación de calidad en contextos muy largos.

## Enlaces

- [HuggingFace - Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-AWQ-1M](https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-AWQ-1M)
- [HuggingFace - Modelo base DavidAU](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU)
- [HuggingFace - Qwen/Qwen3.8-27B (modelo original)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [vLLM Recipes - Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [LLM Releases - Qwen3.8-27B](https://www.llm-releases.com/models/qwen3-8-27b)
- [AIModels.fyi - Ficha del modelo base](https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau)
- [Solstice-AI (sitio web)](https://solstice-ai.co)
- [Anvil Runtime (GitHub)](https://github.com/Solstice-Labs/anvil)
