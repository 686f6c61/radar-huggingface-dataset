# Sanjayateeluxe/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es una cuantización del modelo Qwen3.5-4B desarrollada por el usuario Sanjayateeluxe mediante la herramienta Unsloth (formato Dynamic 2.0). El modelo base Qwen3.5-4B lo desarrolla el equipo Qwen (Alibaba), y es un modelo causal multimodal con codificador de visión, diseñado para tareas de razonamiento, código, agentes y comprensión visual. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y motores compatibles, algo inviable con los pesos originales en Transformers.

La relevancia de Qwen3.5-4B radica en su arquitectura híbrida: combina Gated DeltaNet (atención lineal) con atención con puerta (gated attention) en un patrón de 8 bloques de 4 capas, lo que reduce el coste computacional en contextos largos. Con 4.205.751.296 parámetros y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, se posiciona como una opción compacta para despliegues con ventanas de contexto muy amplias. Además, integra entrenamiento multimodal de fusión temprana, lo que le permite igualar o superar a modelos Qwen3-VL en benchmarks de razonamiento, código, agentes y visión.

El repositorio tiene 71,3 GB de tamaño, lo que refleja la presencia de múltiples cuantizaciones GGUF del modelo. La licencia es Apache 2.0, heredada del modelo base. No obstante, el repositorio no incluye una model card propia del autor de la cuantización ni resultados de benchmarks específicos para esta versión GGUF; la información disponible procede de la model card del modelo base Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrido Gated DeltaNet + Gated Attention (layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); niveles específicos no disponibles |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |
| Dimensión oculta | 2560 |
| Capas | 32 |
| Dimensión intermedia FFN | 9216 |
| Embedding de tokens | 248.320 (padded) |
| Cabezas de atención (Gated Attention) | 16 para Q, 4 para KV; dimensión de cabeza 256; RoPE dim 64 |
| Cabezas de atención lineal (Gated DeltaNet) | 32 para V, 16 para QK; dimensión de cabeza 128 |
| MTP | entrenado con multi-steps |
| Librería | transformers (según tags), compatible con vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

Qwen3.5-4B emplea una arquitectura híbrida que alterna capas de Gated DeltaNet (atención lineal con estado recurrente) y capas de Gated Attention (atención estándar con RoPE). El layout concreto es 8 bloques, cada uno compuesto por tres sub-bloques de Gated DeltaNet seguidos de FFN y un sub-bloque de Gated Attention seguido de FFN, lo que da un total de 32 capas. Esta combinación busca mantener la calidad de la atención completa en puntos clave mientras reduce el coste cuadrático en contextos largos gracias a las capas lineales. El modelo incluye además un codificador de visión con entrenamiento de fusión temprana sobre tokens multimodales, lo que permite paridad cross-generacional con Qwen3 y supera a Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual según la model card.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento. La model card menciona RL a escala en entornos de millones de agentes con distribuciones de tareas progresivamente complejas, así como una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. El modelo está entrenado con multi-token prediction (MTP) en varios pasos, lo que habilita decodificación especulativa. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO de forma explícita, más allá de la mención genérica a post-entrenamiento y RL escalable.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) implícito en la familia Qwen3.5.
- Comprensión de imágenes y texto (pipeline image-text-to-text) gracias al codificador de visión con fusión temprana.
- Generación de código y tareas de ingeniería de software.
- Razonamiento matemático y tareas STEM.
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Capacidades de agente y razonamiento multi-paso, con entrenamiento RL en entornos de agentes.
- Tool calling / function calling: no confirmado explícitamente en la información disponible, aunque la orientación a agentes del modelo lo hace probable.
- Decodificación especulativa mediante multi-token prediction (MTP) entrenado con multi-steps.
- Contexto largo: hasta 262.144 tokens nativos y 1.010.000 extensibles.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto nativo, el modelo puede procesar informes, contratos o expedientes completos en una sola pasada sin necesidad de chunking, lo que reduce la pérdida de contexto entre fragmentos.
- Asistentes de atención al cliente multi-turno: la ventana de contexto larga permite mantener historiales de conversación prolongados y recuperar información de interacciones anteriores sin resumen intermedio.
- Generación de código en pipelines de CI/CD: el modelo puede integrarse en flujos de revisión automática de código y generación de parches, ejecutándose en formato GGUF sobre infraestructura sin GPU de datacenter.
- Procesamiento de documentación técnica con imágenes: al ser image-text-to-text, puede extraer información de diagramas, capturas de pantalla y figuras junto con el texto que las acompaña, útil en manuales y documentación de producto.
- Despliegue en hardware de consumo: la cuantización GGUF permite ejecutar el modelo en estaciones de trabajo con GPU consumer o incluso en CPU, habilitando prototipos locales de asistentes y análisis de datos sin dependencia de la nube.
- Agentes autónomos de investigación: el entrenamiento RL en entornos de agentes y el contexto largo lo hacen adecuado para tareas de búsqueda y síntesis de información en múltiples pasos sobre grandes corpus.
- Traducción y localización multilingüe: con soporte para 201 idiomas y dialectos, puede emplearse en pipelines de traducción y adaptación cultural de contenido.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla de benchmarks comparativa con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507, Qwen3.5-9B y Qwen3.5-4B, organizada en categorías como Knowledge & STEM. Sin embargo, en la información proporcionada la tabla aparece truncada y no se incluyen los valores numéricos de las filas. Por tanto, no es posible presentar resultados concretos sin inventar datos.

No se han publicado resultados de benchmarks específicos para esta cuantización GGUF en la información disponible. La model card de Unsloth afirma que su formato Dynamic 2.0 logra una precisión superior y supera a otras cuantizaciones líderes, pero no se aportan cifras en el material disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, un modelo de 4.205.751.296 parámetros en GGUF ocupa aproximadamente 8 GB en cuantización de 16 bits, 4-5 GB en 8 bits y 2,5-3 GB en 4 bits, sin contar el codificador de visión ni la caché KV para contextos largos.
- La caché KV para 262.144 tokens de contexto puede requerir varios GB adicionales según la cuantización de la caché; no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo en 4 bits debería caber en GPUs consumer con 8 GB o más de VRAM, como RTX 3060 Ti, RTX 4060 Ti, RTX 4070 o superiores.
- Despliegue: llama.cpp, Ollama y motores compatibles con GGUF. El modelo base es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (este, GGUF) | 4,2 B | 262.144 nativo / 1.010.000 extensible | Apache 2.0 | GGUF | Multimodal, híbrido Gated DeltaNet + Gated Attention |
| Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | Comparado en la tabla de benchmarks del modelo base |
| Qwen3-30BA3B-Thinking-2507 | 30 B (MoE, activos no disponibles) | no disponible | no disponible | no disponible | Comparado en la tabla de benchmarks del modelo base |
| GPT-OSS-20B | 20 B | no disponible | no disponible | no disponible | Comparado en la tabla de benchmarks del modelo base |

La información disponible no permite completar una comparativa con datos de rendimiento numéricos ni con especificaciones detalladas de los modelos alternativos. Los modelos listados aparecen únicamente como referencias en la tabla de benchmarks del modelo base, cuyos valores no se incluyen en el material proporcionado.

## Limitaciones y advertencias

- La cuantización GGUF introduce pérdida de precisión respecto a los pesos originales en safetensors; el grado de degradación depende del nivel de cuantización elegido y no se documenta en la información disponible.
- No se han publicado benchmarks específicos de esta cuantización, por lo que no es posible verificar empíricamente su calidad frente al modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se dispone de tasas de alucinación documentadas.
- Sesgos conocidos: no documentados en la información disponible. La cobertura de 201 idiomas no garantiza un rendimiento uniforme en todos ellos.
- El repositorio no incluye una model card propia del autor de la cuantización; la información técnica procede del modelo base y puede no reflejar exactamente el comportamiento de esta versión GGUF.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar los términos del modelo base en el enlace de licencia indicado en la model card.
- El tamaño del repositorio (71,3 GB) sugiere múltiples archivos de cuantización; es necesario seleccionar el archivo adecuado al hardware disponible.
- La extensión de contexto hasta 1.010.000 tokens puede requerir técnicas adicionales de escalado y un coste de memoria considerable; no se detallan los requisitos exactos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sanjayateeluxe/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Guía de Unsloth para ejecutar Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Documentación de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Guía de fine-tuning de Qwen3.5 con Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
