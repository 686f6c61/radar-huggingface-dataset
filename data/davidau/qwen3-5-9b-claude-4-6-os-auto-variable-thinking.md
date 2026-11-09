# DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-THINKING

## Resumen

Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-THINKING es un ajuste fino (fine-tune) del modelo denso Qwen3.5-9B de Alibaba Qwen, publicado por el desarrollador independiente DavidAU. El entrenamiento se realizó con Unsloth sobre hardware local, utilizando un dataset compuesto por cuatro conjuntos de datos derivados de Claude (denominado "Claude-4.6-OS"), orientado a escritura creativa, narrativa de ficción, generación de tramas y roleplay. El modelo conserva la naturaleza multimodal del base (pipeline image-text-to-text) y modifica el comportamiento y el tamano de los bloques de razonamiento ("thinking").

La relevancia de esta ficha reside en que se trata de un derivado comunitario de un modelo reciente de la familia Qwen3.5, con arquitectura híbrida (Gated Delta Networks combinadas con un transformer y capacidades multimodales de fusión temprana). El autor declara que el ajuste se diseñó para ser "suave" y no degradar los benchmarks del modelo original, y aporta una comparación de siete tareas de evaluación frente a la variante Qwen3.5-9B-Thinking qx86-hi.

El modelo tiene 9.409.813.744 parámetros (datos reales de safetensors), un contexto declarado de 256k tokens por defecto, licencia Apache 2.0 y soporte de idiomas inglés y chino. Está pensado para casos de escritura creativa, roleplay y generación de ficción, aunque mantiene las capacidades generales del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated Delta Networks y fusión temprana multimodal (según model card del base Qwen3.5); fine-tune denso |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens (por defecto, según el autor) |
| Tipos de cuantizacion | El autor recomienda mínimo q4ks (sin imatrix) o IQ3S (con imatrix); el repo incluye pesos en bfloat16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB); el autor distribuye GGUF, EXL2, AWQ, GPTQ y HQQ en colecciones separadas |
| Tag de pipeline | image-text-to-text |
| Librería | transformers |
| Modelo base | Qwen/Qwen3.5-9B |
| Fecha de creación | 2026-03-06 |
| Última actualización | 2026-11-09 |
| Descargas / likes | 40 / 7 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina Gated Delta Networks con atención transformer y una base unificada de visión-lenguaje mediante fusión temprana sobre tokens multimodales. Según la model card del base, esta aproximación logra paridad con Qwen3 en razonamiento, código, agentes y comprensión visual, y supera a los modelos Qwen3-VL en dichos benchmarks. El entrenamiento del base incluyó escalado de reinforcement learning sobre entornos de millones de agentes y cobertura de 201 idiomas y dialectos, aunque este fine-tune declara únicamente inglés y chino.

El ajuste fino de DavidAU se realizó con Unsloth sobre hardware local, partiendo de cuatro datasets derivados de Claude agrupados bajo el nombre "Claude-4.6-OS". El autor indica que el entrenamiento fue deliberadamente "mild" para preservar los benchmarks del modelo original, y que se modificó tanto el contenido como el tamano de los bloques de razonamiento (reducidos/mejorados). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor declara que no se realizó ningún ajuste de alineación de seguridad ni de censura, y que existen versiones "HERETIC" ya construidas para ese propósito. También advierte que las porciones de vídeo del modelo no fueron probadas, mientras que las de imagen sí.

## Capacidades

- Generación de texto conversacional y narrativo, con énfasis en escritura creativa, ficción, generación de tramas y sub-tramas, continuación de escenas y roleplay.
- Razonamiento con bloques de "thinking" de estilo Claude en la mayoría de los casos, con un comportamiento mixto Claude/Qwen según la complejidad de la tarea.
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text), verificadas tras el ajuste según el autor.
- Soporte de tool calling / function calling heredado del base Qwen3.5 (el autor no lo detalla explícitamente en la model card, pero el base lo incluye).
- Capacidades de agente y razonamiento multi-paso heredadas del base, entrenado con RL sobre entornos multi-agente.
- Soporte multilingüe limitado a inglés y chino en este fine-tune.
- Compatibilidad con endpoints y con el ecosistema transformers, vLLM, SGLang y KTransformers (heredada del base).
- Ajuste de muestreo recomendado por el autor: smoothing_factor de 1.5 o rep pen de 1,1 a 1,15 para chat y roleplay.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede generar tramas, sub-tramas y escenas completas con un contexto de 256k tokens, lo que permite mantener coherencia en novelas o series de capítulos extensos sin perder hilos argumentales.
- Roleplay conversacional multi-turno: el ajuste sobre datasets de Claude y la recomendación de smoothing_factor 1.5 lo orientan a diálogos de personaje prolongados en SillyTavern, KoboldCpp o text-generation-webui.
- Generación de guiones y diálogos para videojuegos: su capacidad de continuación de escena y su ventana de contexto permiten mantener el tono y las voces de personajes a lo largo de ramas narrativas.
- Asistencia a guionistas y editores: generación de variantes de escena, reescritura con "prosa vívida" y exploración de giros argumentales en ciencia ficción, romance y otros géneros.
- Análisis de imágenes con descripción narrativa: al conservar la entrada image-text-to-text, puede recibir una imagen y generar descripciones detalladas o continuaciones narrativas inspiradas en ella.
- Prototipado de chatbots de personaje en producción: con licencia Apache 2.0 y pesos safetensors, se puede desplegar en vLLM o SGLang para servicios de chat con contexto largo, aunque con las cautelas de alineación indicadas abajo.
- Generación de contenido creativo por lotes: con cuantización q4ks o IQ3S cabe en GPUs de consumo, lo que permite ejecutar pipelines de generación masiva de relatos o descripciones sin infraestructura de datacenter.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (comparación con Qwen3.5-9B-Thinking qx86-hi):

| Benchmark | Este modelo | Qwen3.5-9B-Thinking qx86-hi |
|---|---|---|
| ARC | 0,427 | 0,417 |
| ARC/e | 0,507 | 0,458 |
| BoolQ | 0,716 | 0,623 |
| HellaSwag | 0,659 | 0,634 |
| OpenBookQA | 0,350 | 0,338 |
| PIQA | 0,742 | 0,737 |
| Winogrande | 0,645 | 0,639 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales para este fine-tune concreto. Los datos del base Qwen3.5-9B no se detallan numéricamente en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18,8 GB solo de pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto y bastante más para contexto largo.
- VRAM estimada en q4ks (recomendado por el autor): en torno a 5-6 GB de pesos, viable en GPUs de consumo de 8-12 GB con contexto moderado.
- VRAM estimada en IQ3S (imatrix, recomendado por el autor): en torno a 4-5 GB de pesos.
- GPU recomendadas: para bfloat16, A100 40/80 GB, H100 o RTX 4090 (24 GB, con contexto limitado); para cuantizaciones q4/IQ3, RTX 3060 12 GB, RTX 4070, RTX 4080 o superiores.
- Cabe en GPU de consumo: sí, en cuantizaciones q4ks o IQ3S según el propio autor.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (heredadas del base); llama.cpp/KoboldCpp, text-generation-webui (con llama_HF para GGUF) y SillyTavern para uso conversacional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-THINKING | 9,41 B (denso) | 256k | Apache 2.0 | Fine-tune creativo/roleplay sobre Qwen3.5-9B | Hugging Face (DavidAU) |
| Qwen/Qwen3.5-9B (base) | 9 B (denso) | No detallado en la info | Apache 2.0 (según el fine-tune) | Modelo fundacional multimodal | Hugging Face (Qwen) |
| Qwen3.5-9B-Thinking qx86-hi | 9 B (denso) | No detallado | No disponible | Variante comparada por el autor en benchmarks | Referenciado en la model card |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes (Llama, Mistral, Gemma) en la información proporcionada.

## Limitaciones y advertencias

- El autor no realizó ningún ajuste de alineación de seguridad ni de censura; el modelo puede producir contenido no filtrado y requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en tareas de razonamiento factual y generación de código; los benchmarks del autor son limitados (siete tareas de conocimiento general).
- El fine-tune está orientado a ficción y roleplay; su comportamiento en tareas técnicas puede diferir del base y no se han publicado evaluaciones específicas de código o matemáticas.
- Idiomas soportados declarados: solo inglés y chino; el rendimiento en castellano no está verificado.
- Las porciones de vídeo del modelo no fueron probadas por el autor; solo se verificaron las de imagen.
- El contexto de 256k es el valor por defecto declarado; el rendimiento real a contextos muy largos no está cuantificado en la información disponible.
- El autor recomienda ajustes de muestreo específicos (smoothing_factor 1.5 o rep pen 1,1-1,15); sin ellos el modelo puede degradarse en chat y roleplay.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el contenido generado y la falta de alineación de seguridad.
- El modelo tiene muy poca tracción (40 descargas, 7 likes) y fue actualizado por última vez en noviembre de 2026; no hay garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-THINKING
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte del autor: https://huggingface.co/DavidAU/support
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Archivos fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen Chat: https://chat.qwen.ai
