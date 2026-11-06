# ansulev/Huihui-Ornith-1.5-35B-A3B-abliterated

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated es una variante "abliterated" (sin rechazos) del modelo ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario ansulev en Hugging Face. El modelo base es un transformer de tipo Mixture of Experts (MoE) con arquitectura Qwen3.5, 35.951.822.704 parámetros totales y una designación A3B que indica aproximadamente 3.000 millones de parámetros activos por token. El proceso de abliteration se aplicó únicamente a las capas 11 a 29, eliminando la dirección de rechazo mediante la técnica implementada en remove-refusals-with-transformers.

La relevancia de esta ficha radica en que se trata de un modelo derivado de una familia reciente (Qwen3.5 MoE) con capacidades multimodales (pipeline image-text-to-text), publicado bajo licencia MIT y con soporte para tool calling y modo thinking. Al estar abliterated, elimina los mecanismos de rechazo del modelo original, lo que lo hace útil para investigación sobre alineación, generación sin restricciones y estudios de seguridad, pero también conlleva riesgos importantes para producción.

El modelo tiene 35.9B parámetros totales en formato safetensors (71.9 GB en bfloat16) y está pensado para despliegue con transformers, con compatibilidad con endpoints. La fecha de creación (2026-11-03) y la ausencia de descargas y likes indican que es una publicación muy reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Qwen3.5 (tag qwen3_5_moe) |
| Parámetros totales | 35.951.822.704 (35.9B) |
| Parámetros activos | ~3B (designación A3B, no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |
| Pipeline | image-text-to-text / text-generation |
| Tamaño del repo | 71.9 GB |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Capas abliterated | 11 a 29 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture of Experts (MoE) perteneciente a la familia Qwen3.5, identificada por el tag `qwen3_5_moe`. El modelo cuenta con 35.951.822.704 parámetros totales, con una designación A3B que sugiere aproximadamente 3.000 millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada imagen-texto, además de text-generation.

El entrenamiento original del modelo base (ornith-ai/Ornith-1.5-35B-A3B) no está documentado en la información proporcionada: no se dispone de número de tokens, composición del dataset ni detalles sobre RLHF o DPO. La modificación de esta variante consiste en una abliteration aplicada exclusivamente a las capas 11 a 29, mediante la técnica remove-refusals-with-transformers, que proyecta fuera la dirección de rechazo del espacio de activaciones sin usar TransformerLens. El autor la describe como una implementación "cruda, proof-of-concept".

## Capacidades

- Generación de texto conversacional y multi-turno (pipeline text-generation, tag conversational).
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text).
- Modo thinking: el tokenizador soporta `enable_thinking` en `apply_chat_template`, con token especial `</think>` para separar razonamiento de respuesta.
- Soporte de tool calling / function calling: el tag `endpoints_compatible` y el uso de chat template sugieren compatibilidad con APIs de endpoints, aunque no se detalla explícitamente.
- Capacidades de razonamiento y agentes multi-paso: inferidas del modo thinking, no confirmadas explícitamente.
- Multilingüismo: no disponible (no se listan idiomas).
- Generación sin rechazos (uncensored): el modelo no aplica mecanismos de rechazo en las capas 11-29.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta al comportamiento de rechazo y a la calidad de las respuestas, comparando con el modelo base original.
- Generación de contenido creativo sin restricciones: útil para escritura de ficción, guiones o narrativa donde los filtros de seguridad del modelo original limitarían la salida.
- Evaluación de robustez de sistemas de moderación: al generar contenido sin rechazos, sirve para probar clasificadores y filtros de contenido en pipelines de moderación.
- Experimentación con arquitecturas MoE multimodales: con 35.9B parámetros totales y ~3B activos, permite estudiar el comportamiento de MoE en tareas imagen-texto en entornos de investigación con recursos limitados.
- Desarrollo de asistentes conversacionales especializados: el modo thinking y el soporte de chat template permiten construir asistentes con razonamiento explícito para dominios técnicos.
- Pruebas de tool calling y agentes: la compatibilidad con endpoints y el chat template permiten integrar el modelo en flujos de agentes que requieren llamadas a funciones, aunque requiere validación empírica.
- Fine-tuning posterior: al estar en safetensors y con licencia MIT, puede servir como base para ajustes específicos de dominio en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~72 GB solo para pesos (71.9 GB de repo), más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: ~36 GB (estimación teórica, no confirmada para este modelo).
- VRAM estimada en cuantización de 4 bits: ~18-20 GB (estimación teórica, no confirmada).
- GPU recomendadas: A100 80GB, H100 80GB para bfloat16; para cuantización 4-bit podría caber en RTX 4090 24GB, aunque no está confirmado.
- Consumer GPU: no cabe en bfloat16 en ninguna consumer GPU; en 4-bit podría ser viable en RTX 4090, pero requiere validación.
- Opciones de despliegue: transformers (soporte oficial, con `trust_remote_code=True`); vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura Qwen3.5 MoE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-Ornith-1.5-35B-A3B-abliterated | 35.9B totales (~3B activos) | no disponible | MIT | Abliterated, multimodal, MoE |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35.9B totales (~3B activos) | no disponible | MIT | Modelo original con rechazos |
| Qwen3 MoE (familia) | no disponible | no disponible | no disponible | Familia de referencia, sin datos concretos en la información |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- La abliteration es una implementación "cruda, proof-of-concept" según el autor; puede degradar la calidad general del modelo y no elimina todos los rechazos.
- Solo se ablacionaron las capas 11 a 29; el comportamiento de rechazo puede persistir en otras capas.
- Riesgo elevado de generar contenido dañino, sesgado o no filtrado; no apto para producción sin moderación externa.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados.
- Idiomas soportados no disponibles; el comportamiento multilingüe no está verificado.
- Longitud de contexto no disponible; no se puede garantizar el manejo de contextos largos.
- Aunque la licencia es MIT, el uso comercial de un modelo abliterated conlleva riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- Sin descargas ni likes; modelo sin validación comunitaria.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- Fecha de creación futura (2026-11-03) en los metadatos; verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/ansulev/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Técnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Repositorio original del autor de la técnica (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
