# Cyclone-Labs/Lunar-Trace-31B

## Resumen

Lunar-Trace-31B es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por Cyclone-Labs mediante la fusión de cuatro modelos derivados de la familia Gemma 4 de Google. Concretamente, combina `google/gemma-4-31B-it`, `Cyclone-Labs/Starlight-Synthesis-31B`, `zerofata/G4-LuneLight-31B` y `TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2` usando la técnica de merge MDR (Merge, Drop, Rescale) implementada en mergekit. El resultado es un modelo de aproximadamente 31.273 millones de parámetros orientado a roleplay, narrativa (storytelling) y conversación.

El modelo hereda la arquitectura transformer multimodal de Gemma 4, con torre de visión y proyección de embeddings visuales. Durante el merge se aplicaron pesos diferenciados por tipo de capa: las capas de atención reciben pesos entre 0,46 y 0,68, mientras que las capas MLP reciben pesos más altos (0,62-0,80), y la torre de visión se anula (peso 0,0) en la contribución de Starlight-Synthesis. Esto sugiere un sesgo deliberado hacia las capacidades lingüísticas y de razonamiento sobre las visuales.

Es relevante ahora porque ejemplifica la práctica creciente de la comunidad de generar modelos especializados en escritura creativa y roleplay mediante merges de pesos sin entrenamiento adicional, partiendo de un modelo base con licencia Apache 2.0. Su tamaño de 31B lo sitúa en la gama alta de modelos que pueden desplegarse en hardware de una sola GPU de 80 GB o en configuraciones multi-GPU consumer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con torre de visión y proyector de embeddings visuales |
| Parámetros totales | 31.273.088.876 (~31,3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, cuantizable a GGUF/AWQ/GPTQ con herramientas estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Lunar-Trace-31B no ha sido entrenado desde cero: es un merge de pesos de cuatro modelos. La arquitectura subyacente es la de Gemma 4 31B instruct, un transformer decoder-only con atención multi-cabeza, capas MLP con proyecciones gate/up/down, normalización por capas (layernorm) y un módulo de visión (`vision_tower` + `embed_vision`) que permite entrada de imágenes junto con texto. El merge se realizó con el método `mdr` de mergekit, con una configuración por capas (layer-wise) que asigna pesos distintos a cada bloque de atención y MLP, y que anula explícitamente la contribución de la torre de visión del modelo Starlight-Synthesis (peso 0,0), conservando la torre de visión del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en los modelos origen. El modelo `TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2` sugiere una destilación de respuestas generadas por Claude Opus, lo que probablemente aporta estilo conversacional y de escritura, pero no hay detalles publicados sobre el proceso. Tampoco se documentan innovaciones técnicas propias más allá del esquema de merge por capas.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a roleplay y narrativa.
- Capacidad multimodal de entrada: acepta imágenes y texto (pipeline image-text-to-text), aunque el merge reduce el peso de la torre de visión de uno de los modelos origen.
- Escritura creativa: relatos, diálogos de personajes, descripciones y continuaciones narrativas.
- Razonamiento y respuesta a instrucciones heredados del modelo base Gemma 4 instruct.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Roleplay y chatbots de personajes: el modelo está etiquetado explícitamente para roleplay, por lo que puede mantener conversaciones multi-turno con consistencia de personaje en aplicaciones de entretenimiento o asistentes virtuales con personalidad definida.
- Generación de ficción y narrativa: adecuado para asistir en la escritura de relatos, novelas por capítulos o guiones, gracias a la mezcla de modelos orientados a storytelling y a la destilación de estilo conversacional.
- Creación de contenido para juegos de rol de mesa: puede generar descripciones de escenarios, diálogos de PNJ y tramas ramificadas a partir de instrucciones del máster.
- Asistente de escritura creativa en herramientas de autor: integrable vía transformers para autocompletado y sugerencias estilísticas en editores, con la ventaja de una licencia Apache 2.0 permisiva para uso comercial.
- Prototipado de aplicaciones multimodales ligeras: al aceptar entrada de imagen y texto, puede usarse para describir imágenes con un tono narrativo o generar diálogos a partir de una ilustración, aunque la capacidad visual puede estar degradada por el merge.
- Investigación sobre merging de modelos: sirve como caso de estudio reproducible (la configuración YAML del merge está publicada) para analizar el efecto de pesos por capa en modelos multimodales de 31B.
- Despliegue en entornos con requisitos de licencia laxa: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de la licencia Gemma original, siempre que se respeten las condiciones de los modelos origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos (el repositorio ocupa 62,6 GB), más overhead de activaciones y caché KV; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 16-20 GB, cabe en GPUs consumer como RTX 4090, RTX 3090 o RTX 4080 con margen limitado para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP16; configuraciones multi-GPU (2x RTX 4090 o 2x A6000) para FP16 con tensor parallelism.
- Cabe en consumer GPU: sí, en cuantización de 4 bits en RTX 4090/3090; en FP16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving de alto rendimiento, llama.cpp/Ollama para cuantizaciones GGUF en local, y endpoints compatibles (el modelo está etiquetado como `endpoints_compatible`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lunar-Trace-31B | ~31,3B | no disponible | Imagen + texto | Apache 2.0 | HuggingFace (2 descargas) |
| google/gemma-4-31B-it | ~31B (no confirmado en la información) | no disponible | Imagen + texto | Gemma (no Apache 2.0) | HuggingFace, modelo base oficial |
| TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2 | ~31B (derivado de Gemma 4 31B) | no disponible | Imagen + texto | no disponible | HuggingFace, modelo origen del merge |
| zerofata/G4-LuneLight-31B | ~31B (derivado de Gemma 4 31B) | no disponible | Imagen + texto | no disponible | HuggingFace, modelo origen del merge |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo generado por merge de pesos, no por entrenamiento: el comportamiento puede ser impredecible en dominios fuera de roleplay y narrativa, y las capacidades visuales pueden estar degradadas al haberse anulado la torre de visión de uno de los modelos origen.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala, especialmente en tareas factuales; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá de lo que herede del modelo base.
- Longitud de contexto no documentada: no se puede asumir la ventana nativa de Gemma 4 sin verificación empírica.
- Sesgos: al derivar de modelos entrenados con datos web y destilación de un modelo propietario (Claude Opus), puede heredar sesgos de estilo, culturales y de alineación no auditados.
- Licencia: Apache 2.0 declarada por el autor del merge, pero los modelos origen (Gemma 4) tienen sus propias condiciones de uso; conviene verificar la compatibilidad antes de un uso comercial.
- Madurez: el modelo tiene 2 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni validación por la comunidad.
- Sin benchmarks publicados: no hay datos objetivos de MMLU, HumanEval, GSM8K ni evaluaciones de roleplay que respalden su calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cyclone-Labs/Lunar-Trace-31B
- Modelo base oficial: https://huggingface.co/google/gemma-4-31B-it
- Modelo origen Starlight-Synthesis-31B: https://huggingface.co/Cyclone-Labs/Starlight-Synthesis-31B
- Modelo origen G4-LuneLight-31B: https://huggingface.co/zerofata/G4-LuneLight-31B
- Modelo origen gemma-4-31B-it-Claude-Opus-Distill-v2: https://huggingface.co/TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2
- Herramienta de merge (mergekit): no se ha encontrado enlace específico en la información proporcionada
- Paper o blog del modelo: no disponible
