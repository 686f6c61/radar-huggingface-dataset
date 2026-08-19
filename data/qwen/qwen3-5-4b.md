# Qwen/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje multimodal (visión y texto) desarrollado por el equipo Qwen de Alibaba, lanzado en febrero de 2026 como parte de la familia Qwen3.5. Se trata de un modelo causal con encoder de visión que integra innovaciones en aprendizaje multimodaal temprano, arquitectura híbrida eficiente y entrenamiento con refuerzo a gran escala. Con 4.659 millones de parámetros, ofrece una ventana de contexto nativa de 262.144 tokens, ampliable hasta aproximadamente 1.010.000, y soporta 201 idiomas y dialectos. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para despliegues en producción.

El modelo destaca por su capacidad de razonamiento, generación de código, comprensión visual y habilidades de agente, logrando resultados competitivos frente a modelos mucho más grandes, como se refleja en sus puntuaciones en MMLU-Pro. Su arquitectura híbrida combina Gated Delta Networks con atención gated, lo que reduce costes de inferencia y latencia. Está disponible en formatos compatibles con Transformers, vLLM, SGLang y KTransformers, así como a través de Ollama y LM Studio para ejecución local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con encoder de visión; híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta ~1.010.000 tokens |
| Tipos de cuantizacion | No disponible (formato original safetensors; se esperan versiones GGUF vía Ollama/LM Studio) |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

Qwen3.5-4B emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal con estado recurrente) con capas de atención gated tradicionales. La configuración interna incluye 32 capas, con una disposición de 8 bloques de 3 capas de Gated DeltaNet seguidas de una capa de Gated Attention, y una FFN con dimensión intermedia de 9216. El modelo utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128, y 16 cabezas Q y 4 KV en la atención gated, con RoPE de 64 dimensiones. El embedding de tokens tiene un tamaño de 248.320 (padded) y está atado a la salida. Incluye un módulo de Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento. Según la documentación, se aplicó aprendizaje por refuerzo escalado a entornos de un millón de agentes con distribuciones de tareas progresivamente complejas, lo que mejora la adaptabilidad en escenarios reales. La fusión temprana de tokens multimodales durante el pre-entrenamiento logra una eficiencia cercana al 100% respecto al entrenamiento solo de texto, y el modelo supera a las versiones anteriores de Qwen3-VL en razonamiento, código, agentes y comprensión visual.

## Capacidades

- Generación de texto y razonamiento complejo, con puntuación de 79.1 en MMLU-Pro.
- Comprensión visual: procesa imágenes y responde preguntas sobre su contenido, con capacidades de visión general.
- Generación de código y soporte para tareas de programación.
- Capacidades de agente: diseñado para tareas multi-paso y orquestación de herramientas, aunque no se especifica explícitamente soporte de function calling en la documentación.
- Multilingüe: soporta 201 idiomas y dialectos, con comprensión cultural y regional.
- Ventana de contexto muy larga (262K nativa), adecuada para documentos extensos y conversaciones multi-turno.
- Disponible en formato chat y base, con pipeline image-text-to-text.

## Casos de uso

- Asistente virtual multimodal para atención al cliente: puede procesar imágenes de productos, leer documentos adjuntos y mantener conversaciones largas gracias a su contexto de 262K tokens, reduciendo costes frente a modelos más grandes.
- Análisis de documentos técnicos y científicos: su ventana de contexto extensa permite resumir y extraer información de manuales, papers o informes de cientos de páginas, con soporte para figuras y tablas.
- Generación de código asistida en entornos de desarrollo: integrable en IDEs o pipelines CI/CD para autocompletar, revisar y documentar código, aprovechando su capacidad de razonamiento y contexto largo para entender proyectos completos.
- Chatbots multilingües para mercados globales: al cubrir 201 idiomas, puede desplegarse como asistente de soporte en plataformas internacionales sin necesidad de modelos separados por región.
- Automatización de tareas de agente: su entrenamiento con RL en entornos de agentes lo hace adecuado para flujos de trabajo que requieren planificación, uso de herramientas y ejecución multi-paso, como gestión de calendarios o búsqueda de información.
- Procesamiento de imágenes en aplicaciones de visión por computador: puede describir imágenes, responder preguntas visuales y extraer texto de capturas, útil en sistemas de accesibilidad o moderación de contenido.

## Benchmarks y rendimiento

La model card proporciona únicamente el resultado de MMLU-Pro para Qwen3.5-4B, junto con comparaciones con otros modelos. No se han publicado más métricas en la información disponible.

| Benchmark | Qwen3.5-4B | Qwen3.5-9B | Qwen3-30B-A3B-Thinking-2507 | GPT-OSS-20B |
|---|---|---|---|---|
| MMLU-Pro | 79.1 | 82.5 | 80.9 | 74.8 |

Nota: la tabla original incluye más modelos (GPT-OSS-120B, Qwen3-Next-80B-A3B-Thinking), pero los valores para Qwen3.5-4B en otros benchmarks (p. ej., MMLU-Redux) no están disponibles en el fragmento proporcionado.

## Requisitos de hardware

- VRAM estimada: en precisión FP16, el modelo ocupa aproximadamente 9,3 GB (tamaño del repo), por lo que requiere al menos 12 GB de VRAM para inferencia sin cuantización. Con cuantización de 4 bits, podría funcionar en GPUs con 4-6 GB.
- GPUs recomendadas: NVIDIA RTX 3060 12GB, RTX 4070, RTX 4090 para ejecución local; en entornos cloud, A10G, L4 o A100.
- Es adecuado para GPUs de consumo medio; también se ha validado en plataformas embebidas como NVIDIA Jetson (según Jetson AI Lab).
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers, Ollama y LM Studio (este último ofrece versiones cuantizadas).
- Latencia y throughput: no disponibles en la documentación; se espera que la arquitectura híbrida ofrezca mayor eficiencia que modelos puramente atencionales del mismo tamaño, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar directamente con otros modelos de 4B de la misma generación (por ejemplo, Llama-3.2-3B o Phi-3.5-mini). La única comparación publicada es con modelos de mayor tamaño dentro de la familia Qwen3.5 y de otros proveedores, como se muestra en la tabla de benchmarks. Se puede destacar que Qwen3.5-4B ofrece una ventana de contexto muy superior a la mayoría de modelos de su tamaño (262K frente a típicos 8K-32K) y soporte multimodal, lo que lo posiciona como una opción única en su categoría. Sin embargo, no hay datos de rendimiento comparables con otros modelos de 4B en tareas estándar.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Sesgos: al entrenarse con datos web multilingües, puede reflejar sesgos culturales, de género o raciales presentes en esos datos.
- Contexto largo: aunque la ventana nativa es de 262K tokens, el rendimiento en tareas de recuperación de información puede degradarse en los extremos de esa longitud; se recomienda validar en casos de uso reales.
- Idiomas: aunque soporta 201 idiomas, la calidad puede variar significativamente entre lenguas de alto y bajo recurso.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe revisar la atribución requerida y posibles patentes asociadas.
- No se ha confirmado soporte explícito de function calling o tool calling en la documentación; aunque el modelo está orientado a agentes, es necesario verificar esta capacidad en la implementación concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Colección Qwen3.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen35
- Página en Ollama: https://ollama.com/library/qwen3.5:4b
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Guía en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-4b/
