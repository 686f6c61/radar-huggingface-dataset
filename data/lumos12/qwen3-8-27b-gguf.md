# lumos12/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal multimodal (texto, imagen y vídeo) desarrollado por el equipo Qwen de Alibaba, publicado con licencia Apache 2.0. Forma parte de la familia Qwen3.8, que también incluye la variante MoE Qwen3.8-2.4T-A95B y el modelo propietario Qwen3.8-Max. Este modelo denso de 27.320 millones de parámetros combina un codificador visual nativo con una arquitectura híbrida que alterna bloques de atención lineal (Gated DeltaNet) y atención con RoPE (Gated Attention), lo que permite manejar contextos de 262.144 tokens de forma nativa y extenderse hasta 1.000.000 mediante escalado RoPE (por ejemplo, YaRN). Destaca por su modo de razonamiento configurable, soporte de agentes y tool calling, y comprensión de vídeos de larga duración.

El repositorio GGUF publicado por lumos12 se basa en el trabajo de cuantización de Unsloth (Dynamic V3.0) y ofrece pesos en formato GGUF listos para su uso con llama.cpp, Ollama y otros motores compatibles. Según la documentación de Unsloth, el modelo puede ejecutarse localmente con unos 17 GB de RAM/VRAM en configuraciones cuantizadas, lo que lo hace accesible para estaciones de trabajo con GPUs de consumo. Su arquitectura híbrida con atención lineal reduce el coste computacional en secuencias largas, lo que lo hace especialmente adecuado para tareas de agente y razonamiento extenso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido: 64 capas organizadas en 16 grupos, cada uno con 3 × (Gated DeltaNet → FFN) y 1 × (Gated Attention → FFN) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativa, extensible a 1.000.000 con RoPE scaling (p. ej., YaRN) |
| Tipos de cuantizacion | GGUF (incluye UD-Q4_K_XL según Unsloth; no se listan todas las variantes en la información disponible) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso con una arquitectura híbrida que combina dos mecanismos de atención. La estructura se compone de 64 capas agrupadas en 16 bloques; cada bloque contiene 3 sub-bloques de atención lineal (Gated DeltaNet) seguidos de un sub-bloque de atención con RoPE (Gated Attention), cada uno con su correspondiente capa feed-forward. La atención lineal usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención con RoPE usa 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. Esta combinación permite procesar secuencias largas de forma eficiente: la atención lineal reduce el coste cuadrático, mientras que la atención con RoPE mantiene la capacidad de recuperación posicional. El modelo incluye además Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que acelera la inferencia.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento, aunque no se especifican el número de tokens ni la composición del dataset. El modelo es nativamente multimodal, con un codificador visual que procesa imágenes y vídeos. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable: se puede activar o desactivar por petición, y ajustar la profundidad de razonamiento mediante `reasoning_effort`.
- Comprensión de imágenes y vídeos: soporta diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Tool calling / function calling: mejoras en el parseo de objetos anidados para aumentar la tasa de éxito en llamadas a herramientas.
- Soporte de agentes: planificación autónoma y manejo de feedback del entorno para tareas de largo horizonte.
- Capacidades multilingües: no especificadas en la información, pero se espera que herede las capacidades de la familia Qwen.
- MTP (Multi-Token Prediction) para inferencia más rápida.
- Compatible con entornos de desarrollo como Unsloth Desktop, Codex y otros agentes.

## Casos de uso

- Asistente de programación con agentes: el modelo puede integrarse en herramientas como Codex para tareas de codificación autónoma, gracias a su soporte de tool calling y su capacidad de razonamiento multi-paso.
- Análisis de documentos y diagramas técnicos: al ser multimodal, puede extraer información de imágenes, gráficos y esquemas, útil en entornos de investigación y documentación.
- Procesamiento de vídeos de larga duración: puede resumir o responder preguntas sobre vídeos de hasta una hora, aplicable en vigilancia, educación o análisis de contenido.
- Atención al cliente automatizada: con contexto de 262K tokens, puede mantener conversaciones largas y recordar información previa, mejorando la coherencia en diálogos multi-turno.
- Generación de informes y redacción profesional: su capacidad de razonamiento y su modo thinking permiten producir textos estructurados y bien fundamentados.
- Automatización de tareas de oficina: el modelo destaca en "office automation", como generar presentaciones, resumir correos o crear documentos a partir de instrucciones.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF, puede ejecutarse en GPUs de consumo con 17GB de VRAM (según Unsloth), lo que lo hace viable para estaciones de trabajo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque el repositorio oficial de Qwen menciona una evaluación en MathVision, no se proporcionan valores numéricos. Por tanto, no se incluye tabla comparativa.

## Requisitos de hardware

- Según Unsloth, Qwen3.8-27B puede ejecutarse localmente con 17GB de RAM/VRAM en configuraciones cuantizadas (probablemente Q4 o similar).
- Para cuantizaciones más altas (Q8 o FP16), se necesitarían GPUs con mayor VRAM, como A100 (80GB) o H100.
- Es posible ejecutarlo en una RTX 4090 (24GB) con cuantización Q4, aunque el rendimiento dependerá de la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta la arquitectura), TGI, y Unsloth Desktop.
- La inferencia se beneficia de MTP para reducir la latencia. No se proporcionan cifras de throughput.

## Comparativa con modelos similares

No se dispone de información comparativa directa en los datos proporcionados. Sin embargo, por tamaño y características, podría compararse con otros modelos densos de ~27B como Qwen2.5-32B, Llama-3.1-8B (mucho menor) o Mistral-Small-24B. No obstante, al ser una arquitectura híbrida y multimodal, la comparación no es trivial. Se indica "no disponible" para evitar especulaciones.

## Limitaciones y advertencias

- No se especifican sesgos conocidos, pero como modelo entrenado con datos web, puede heredar sesgos sociales y culturales.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda verificar información factual.
- La extensión de contexto a 1M requiere técnicas de escalado (YaRN) y puede degradar el rendimiento si no se aplica correctamente.
- El modo thinking aumenta el consumo de tokens de salida; se recomienda configurar límites adecuados.
- Aunque la licencia es Apache 2.0, el uso comercial está permitido, pero se deben respetar los términos de la licencia y las atribuciones.
- El modelo es multimodal, pero la calidad de la comprensión de vídeo depende de la duración y resolución; no se especifican límites exactos.
- La información sobre idiomas soportados no está disponible; se recomienda probar en el idioma objetivo.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/lumos12/Qwen3.8-27B-GGUF
- Repositorio original de Unsloth (GGUF): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub oficial de Alibaba: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo de YottaLabs sobre ejecución local: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
