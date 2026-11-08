# MuXodious/Qwen3.5-0.8B-heretic-2.0-SOMPOA-upstream-test-LORA

## Resumen

Este repositorio contiene una variante "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo Qwen3.5-0.8B, desarrollado originalmente por el equipo Qwen de Alibaba. La modificación ha sido realizada por el usuario MuXodious mediante la herramienta Heretic v2.1.0.dev0, que aplica una técnica de edición de pesos orientada a reducir la tasa de rechazos del modelo ante peticiones que el modelo original declinaría. El resultado es un checkpoint que mantiene la arquitectura del modelo base pero con un sesgo de alineación alterado.

El modelo base Qwen3.5-0.8B es el miembro más pequeño de la familia Qwen3.5: un transformer multimodal denso de 0,8 mil millones de parámetros con codificador de visión, arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention, y una longitud de contexto nativa de 262.144 tokens. Está pensado para prototipado, ajuste fino específico de tareas y fines de investigación, dado su reducido tamaño.

La relevancia de esta ficha radica en documentar una modificación de alineación sobre un modelo multimodal pequeño y de contexto muy largo. El autor reporta una reducción de rechazos de 97/101 a 7/101 en su conjunto de evaluación, con una divergencia KL de 0,0831 respecto al modelo original. El repositorio, publicado el 7 de noviembre de 2026, no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (codificador de visión + LM híbrido Gated DeltaNet / Gated Attention) |
| Parámetros totales | 0,8B |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantización | no disponible en el repositorio (el modelo base admite formatos estándar de transformers; existe una variante GGUF de terceros) |
| Idiomas soportados | no disponible en esta ficha; el modelo base declara cobertura de 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida poco habitual en modelos de este tamaño. El layout oculto es 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, 24 capas en total que alternan bloques de atención lineal Gated DeltaNet (16 cabezas para V y 16 para QK, dimensión de cabeza 128) con bloques de atención con compuerta (8 cabezas Q, 2 cabezas KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La dimensión oculta es 1024, la dimensión intermedia de la FFN es 3584 y el embedding de tokens es de 248.320 entradas, atado a la salida del LM. Incorpora entrenamiento con múltiples pasos de predicción (MTP).

El entrenamiento del modelo base combina preentrenamiento y postentrenamiento, con fusión temprana de tokens multimodales (visión y texto) y generalización mediante RL a escala de millones de entornos de agentes. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

La modificación de este repositorio se realiza con Heretic v2.1.0.dev0, que aplica una edición de dirección por capa sobre las proyecciones `attn.o_proj` y `mlp.down_proj`. El autor documenta los parámetros SOMPOA utilizados, incluyendo pesos máximos y mínimos por índice y las posiciones de peso (`max_weight_position` 11,67 para atención y 16,44 para MLP). No se especifica si hubo entrenamiento adicional: la naturaleza de Heretic sugiere edición directa de pesos más que un ajuste fino supervisado.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking y, presumiblemente, thinking (el modelo base documenta ambos modos).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), con codificador de visión integrado.
- Generación de código y matemáticas, heredada del modelo base Qwen3.5.
- Capacidades de agente y razonamiento multi-paso, según las mejoras declaradas del modelo base.
- Cobertura multilingüe amplia según el modelo base (201 idiomas y dialectos); no verificada en esta variante.
- Reducción drástica de rechazos: 7/101 en el conjunto de evaluación del autor frente a 97/101 del original.
- Soporte de tool calling: no confirmado explícitamente en la información disponible para esta variante.

## Casos de uso

- Prototipado de asistentes multimodales: el modelo acepta entradas de imagen y texto y cabe en hardware modesto, lo que permite iterar rápidamente en demos de descripción de imágenes o extracción de información visual sin infraestructura dedicada.
- Investigación sobre alineación y edición de pesos: la ficha de Heretic y los parámetros SOMPOA publicados permiten reproducir y estudiar el efecto de la abliteración sobre un modelo pequeño, comparando la divergencia KL (0,0831) con la tasa de rechazos.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, puede ingerir contratos, informes o transcripciones extensas en una sola pasada para tareas de resumen o extracción, aunque la calidad en contextos tan largos no está verificada para esta variante.
- Generación de contenido sin filtros en entornos controlados: útil para investigación en seguridad, red teaming y evaluación de sesgos, donde se necesita un modelo que no rechace peticiones para estudiar respuestas.
- Ajuste fino específico de dominio: al ser un checkpoint de 0,8B con licencia Apache 2.0, sirve como base para fine-tuning en tareas concretas (clasificación, extracción de entidades, resumen) con coste de cómputo reducido.
- Educación e investigación académica: permite estudiar el comportamiento de arquitecturas híbridas de atención lineal en un modelo abierto y de pequeño tamaño, sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

El autor publica únicamente métricas de la modificación de alineación, no benchmarks de capacidades del modelo base en esta ficha.

| Métrica | Este modelo | Modelo original (Qwen3.5-0.8B) |
|---|---|---|
| Rechazos (Refusals) | 7/101 | 97/101 |
| Divergencia KL | 0,0831 | 0 (por definición) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks de capacidades para esta variante. La model card del modelo base incluye tablas comparativas con Qwen3-4B-2507, Qwen3-1.7B y Qwen3.5-2B, pero los datos están truncados en la información proporcionada y no pueden reproducirse aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en FP16/BF16 para los 0,8B parámetros; en torno a 0,5-0,8 GB con cuantización de 4 bits (estimación basada en el tamaño, no verificada en la información disponible).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo en FP16. Para despliegue en producción con concurrencia, se recomiendan A10, L4 o A100.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM en FP16 y en iGPU o CPU con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang y KTransformers según la model card del modelo base; existe una variante GGUF de terceros (FadedRedStar/Qwen3.5-0.8B-heretic-GGUF) que permitiría llama.cpp y Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MuXodious/Qwen3.5-0.8B-heretic-2.0-SOMPOA-upstream-test-LORA | 0,8B | 262.144 | Apache 2.0 | Variante decensored de este repositorio; sin benchmarks de capacidades publicados |
| Qwen/Qwen3.5-0.8B (original) | 0,8B | 262.144 | Apache 2.0 | Modelo base alineado; 97/101 rechazos en el conjunto del autor |
| ossipoff/Qwen3.5-0.8B-heretic | 0,8B | 262.144 | no disponible | Otra variante decensored del mismo modelo base, sin parámetros SOMPOA documentados en la información disponible |
| FadedRedStar/Qwen3.5-0.8B-heretic-GGUF | 0,8B | 262.144 | no disponible | Variante cuantizada en GGUF del mismo modelo base, orientada a llama.cpp |

## Limitaciones y advertencias

- La edición de pesos con Heretic altera el comportamiento de alineación; el modelo puede generar contenido que el original rechazaría, con implicaciones legales y de seguridad según el contexto de uso.
- La divergencia KL de 0,0831 indica un cambio medible en la distribución de salida respecto al original, lo que puede degradar capacidades en tareas que dependían de la alineación original.
- Riesgo de alucinación: no evaluado en esta variante; los modelos de 0,8B tienen mayor propensión a errores factuales que modelos mayores.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB en el momento de la consulta, lo que sugiere que los pesos pueden no estar completamente subidos o que el artefacto es un LoRA de prueba (el nombre incluye "LORA" y "upstream-test").
- No se documentan los idiomas soportados específicamente para esta variante; la cobertura multilingüe del modelo base no está verificada tras la edición.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo decensored en producción conlleva riesgos reputacionales y de cumplimiento que deben evaluarse.
- No hay benchmarks de capacidades publicados para esta variante; no se debe asumir que rinde igual que el modelo base en tareas de razonamiento, código o visión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MuXodious/Qwen3.5-0.8B-heretic-2.0-SOMPOA-upstream-test-LORA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Heretic (proyecto): https://heretic-project.org
- Variante GGUF de terceros: https://huggingface.co/FadedRedStar/Qwen3.5-0.8B-heretic-GGUF
- Otra variante heretic: https://huggingface.co/ossipoff/Qwen3.5-0.8B-heretic
