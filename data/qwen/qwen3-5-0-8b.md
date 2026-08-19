# Qwen/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es el modelo más pequeño de la familia Qwen3.5, desarrollado por el equipo de Qwen (Alibaba). Se trata de un modelo causal de lenguaje con codificador de visión, es decir, nativamente multimodal, capaz de procesar texto e imágenes. Está diseñado para tareas de prototipado, ajuste fino específico y desarrollo, dado su reducido número de parámetros (0,8 mil millones). Su relevancia radica en que ofrece capacidades multimodales y razonamiento en un formato muy ligero, con una ventana de contexto nativa de 262 144 tokens, algo inusual en modelos de este tamaño. Publicado bajo licencia Apache 2.0, está pensado para democratizar el acceso a la IA multimodal en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida con Gated Delta Networks y atención gated (Gated Attention) |
| Parametros totales | 873 438 784 (0,8B) |
| Parametros activos | no disponible (no es MoE en este tamaño) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | no disponible (repo en safetensors; se esperan cuantizaciones GGUF/AWQ de la comunidad) |
| Idiomas soportados | 201 lenguas y dialectos (según la descripción de la familia Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo combina un codificador de visión con un modelo de lenguaje causal. La parte de lenguaje emplea una arquitectura híbrida que alterna capas de Gated DeltaNet (atención lineal) con capas de Gated Attention (atención clásica con posiciones rotatorias). La disposición concreta es: 6 bloques de (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con 24 capas en total. La dimensión oculta es 1024, con 16 cabezas de atención lineal (V y QK) de dimensión 128, y 8 cabezas de atención clásica (Q) con 2 cabezas KV de dimensión 256. El embedding de tokens tiene tamaño 248 320 (padded) y está atado a la salida LM. Además, se entrenó con MTP (multi-token prediction) en múltiples pasos.

El entrenamiento incluye una fase de pre-entrenamiento y otra de post-entrenamiento. La familia Qwen3.5 destaca por el escalado de RL en entornos de millones de agentes, con distribuciones de tareas progresivamente complejas. La fusión temprana de tokens multimodales permite un aprendizaje conjunto de visión y lenguaje. No se proporcionan datos específicos sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Procesamiento multimodal: entrada de texto e imágenes, con salida de texto.
- Generación de texto y razonamiento, con soporte de modo "thinking" (razonamiento extendido) y modo no-thinking, según la configuración.
- Razonamiento matemático y lógico, evaluado en benchmarks como MMLU-Pro y C-Eval.
- Soporte de tool calling y function calling (implícito en la familia Qwen3.5, aunque no se detalla para este tamaño).
- Capacidades de agente y razonamiento multi-paso, favorecidas por la ventana de contexto de 262 144 tokens.
- Multilingüismo amplio: 201 lenguas y dialectos, con comprensión cultural y regional.
- Compatible con frameworks de inferencia estándar: Transformers, vLLM, SGLang, KTransformers.

## Casos de uso

- Prototipado rápido de aplicaciones multimodales: al ser un modelo pequeño, permite iterar sobre ideas de producto que combinen visión y lenguaje sin necesidad de infraestructura costosa.
- Ajuste fino específico para tareas de dominio: su tamaño reducido facilita el fine-tuning en GPU consumer para clasificación de imágenes con texto, extracción de información de documentos, etc.
- Asistentes de documentación técnica: puede resumir, traducir o responder preguntas sobre manuales e imágenes técnicas en múltiples idiomas.
- Automatización de atención al cliente en entornos con restricciones de hardware: su contexto largo (262K) permite mantener conversaciones multi-turno extensas con historial completo.
- Generación de código asistida por visión: puede interpretar capturas de pantalla o diagramas y generar código o explicaciones, útil en entornos de desarrollo.
- Educación y aprendizaje de idiomas: su soporte de 201 lenguas lo hace adecuado para ejercicios interactivos de traducción o práctica conversacional.
- Análisis de documentos escaneados: al combinar OCR implícito (a través del codificador de visión) con razonamiento textual, puede extraer datos de formularios o facturas.

## Benchmarks y rendimiento

La model card proporciona resultados parciales en modo no-thinking para tres benchmarks, comparados con otros modelos de la familia. No se dispone de más métricas en la información disponible.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

Estos valores indican que el modelo de 0,8B rinde por debajo de sus hermanos mayores, como es esperable por su tamaño, pero mantiene un nivel competitivo para su categoría. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM en la información disponible.
- Por su tamaño (873M parámetros), en FP16 el peso del modelo ocupa aproximadamente 1,75 GB, por lo que cabría en GPUs consumer con 4 GB o más de VRAM, aunque se recomienda al menos 6-8 GB para inferencia con contexto largo.
- En cuantizaciones de 4 bits (si la comunidad las publica), el modelo podría ejecutarse en GPUs con 2 GB de VRAM o incluso en CPU.
- GPUs recomendadas: RTX 3060, RTX 4060, RTX 4090, o cualquier GPU con al menos 6 GB de VRAM. También es viable en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers. Existe integración con Ollama (qwen3.5:0.8b) para uso local sencillo.
- La latencia y el throughput no están documentados; se espera que sea muy rápido dado el reducido número de parámetros.

## Comparativa con modelos similares

Comparación con otros modelos pequeños de la misma familia (datos de la model card):

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia |
|---|---|---|---|---|
| Qwen3.5-0.8B | 0,8B | 262 144 | 29,7 | Apache 2.0 |
| Qwen3-1.7B | 1,7B | no disponible | 40,2 | Apache 2.0 |
| Qwen3.5-2B | 2B | no disponible | 55,3 | Apache 2.0 |

Frente a alternativas de otros fabricantes en el rango de 0,5-1B (como SmolLM2-1.7B o Gemma-2-2B), no se dispone de datos comparativos en la información proporcionada. La principal ventaja de Qwen3.5-0.8B es su naturaleza multimodal y su contexto de 262K, poco común en este rango de tamaño.

## Limitaciones y advertencias

- El rendimiento en tareas complejas de razonamiento es limitado en comparación con modelos más grandes, como reflejan los benchmarks (MMLU-Pro 29,7).
- No se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos web, es probable que herede sesgos socioculturales.
- Riesgo de alucinación en tareas de generación abierta, especialmente con entradas multimodales ambiguas.
- La ventana de contexto de 262K es nativa, pero el uso efectivo de contextos muy largos puede degradar la calidad de las respuestas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar el cumplimiento de las políticas de uso de los datos de entrenamiento.
- No se especifican limitaciones de idioma, pero el rendimiento en lenguas minoritarias puede ser inferior al de los idiomas principales.
- Para producción, se recomienda validar el modelo en el dominio específico antes del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Guía de uso y benchmark (tercero): https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Guía completa de la familia Qwen 3.5: https://qwen-ai.com/qwen-3-5/
