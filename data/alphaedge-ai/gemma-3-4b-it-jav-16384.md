# alphaedge-ai/gemma-3-4b-it-jav-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-jav-16384` es una variante "trimmed" (podada) de `google/gemma-3-4b-it` optimizada para javanés (`jv`). El autor, alphaedge-ai, ha aplicado la técnica de trimming de vocabulario descrita por Hugging Face: reduce el vocabulario original de Gemma 3 de 262.144 tokens a 16.384 tokens, eliminando los tokens poco frecuentes en javanés. El resultado es un modelo un 14,63% más pequeño en parámetros (de 4.300.079.472 a 3.670.770.032), con una reducción del 93,75% en el tamaño del vocabulario.

El modelo conserva la arquitectura multimodal de Gemma 3 (image-text-to-text) y su ventana de contexto original, pero su matriz de embeddings y la capa de salida se han recortado. Esto reduce el consumo de memoria y acelera la inferencia en el idioma objetivo, a costa de degradar el rendimiento en otros idiomas cuyos tokens han sido eliminados. Es relevante para despliegues en producción de bajo recursos centrados exclusivamente en javanés, donde el vocabulario completo de Gemma 3 supone un coste innecesario.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; no se han publicado resultados de benchmarks ni detalles adicionales de entrenamiento más allá del proceso de minería de vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), derivada de google/gemma-3-4b-it |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantizacion estandar, pero no se detalla) |
| Idiomas soportados | javanes (`jv`) |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer multimodal de la familia Gemma 3 que procesa texto e imagen (pipeline `image-text-to-text`). Sobre esa base, alphaedge-ai aplica trimming de vocabulario: se minaron 172.668 textos del dataset `lbourdois/fineweb-2-trimming` para identificar los tokens efectivamente usados en javanés y se recortó el vocabulario de 262.144 a 16.384 tokens. Las matrices de embedding y la capa de salida se reducen en consecuencia, lo que explica la bajada de 4.300.079.472 a 3.670.770.032 parámetros (14,63%).

No se documenta en la información disponible si hubo reentrenamiento adicional, ajuste fino posterior al recorte ni fases de RLHF/DPO específicas para esta variante. El autor indica que el modelo "debería comportarse de forma similar al original" con solo 16.384 tokens de vocabulario y una huella de memoria mucho menor, pero advierte que puede rendir peor en otros idiomas. La técnica de trimming está descrita en el blog de Hugging Face "Introduction to Trimming" (2026).

## Capacidades

- Generación de texto conversacional en javanés, con plantilla de chat (`apply_chat_template`).
- Procesamiento image-text-to-text heredado de Gemma 3 (entrada de imágenes y texto), según el tag del modelo.
- Generación de código y razonamiento: capacidad heredada del modelo base, aunque degradada fuera del javanés por el recorte de vocabulario.
- Soporte multilingüe: limitado en la práctica al javanés; otros idiomas pierden tokens y, por tanto, calidad.
- Tool calling / function calling: no documentado específicamente para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para esta variante.
- Modo thinking, visión o audio: no documentado en la información disponible (el pipeline declarado es `text-generation`).

## Casos de uso

- Atención al cliente en javanés: el modelo puede gestionar conversaciones multi-turno mediante la plantilla de chat, con una huella de memoria menor que el Gemma 3 original, lo que abarata el despliegue en servidores modestos.
- Generación de contenido editorial en javanés: redacción de artículos, resúmenes y respuestas FAQ, aprovechando que el vocabulario recortado cubre los tokens más frecuentes del idioma.
- Procesamiento de documentos javaneses con imágenes: al conservar la capacidad image-text-to-text, puede extraer y describir texto de capturas o formularios escaneados en javanés.
- Despliegue en edge o en GPU de consumo: con 3.670 millones de parámetros y un vocabulario de 16.384 tokens, el modelo cabe en GPUs consumer con cuantizacion adecuada, útil para prototipos locales.
- Traducción asistida javanés→otros idiomas: como generador en el lado javanés de un pipeline de traducción, aunque la salida a otros idiomas puede degradarse por el recorte de vocabulario.
- Investigación sobre trimming de vocabulario: caso de estudio reproducible para medir el impacto del recorte en calidad y memoria, usando el dataset `lbourdois/fineweb-2-trimming`.
- Chatbot educativo o de soporte en comunidades javanoparlantes: bajo coste de inferencia y contexto conversacional suficiente para sesiones de preguntas y respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.670 millones de parámetros, en FP16 requiere aproximadamente 7,3 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de 16 GB o más en FP16 y en GPUs consumer de 8-12 GB con cuantizacion de 8 o 4 bits.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 (12 GB) o superiores con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: `transformers` (snippet oficial), `text-generation-inference` (tag del modelo), y en principio vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta su disponibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-jav-16384 | 3.670.770.032 | no disponible | javanes | Gemma Terms of Use | Vocabulario recortado a 16.384 tokens; 14,63% mas pequeno que el base |
| google/gemma-3-4b-it | 4.300.079.472 | no disponible en esta ficha | multilingue | Gemma Terms of Use | Modelo base, vocabulario completo de 262.144 tokens |
| Otras variantes trimmed de Gemma 3 | no disponible | no disponible | segun idioma | Gemma Terms of Use | Existen variantes por idioma con la misma tecnica; no se dispone de datos comparativos |

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no frecuentes en javanés; el rendimiento en otros idiomas puede degradarse notablemente, incluso en inglés.
- Riesgo de alucinación inherente al modelo base; no se documenta mitigación específica en esta variante.
- Sesgos: no documentados por el autor; hereda los del modelo base Gemma 3.
- Licencia Gemma Terms of Use: restricciones para uso comercial y obligaciones de atribución; el modelo no está afiliado ni respaldado por Google.
- Longitud de contexto no documentada en la información disponible; conviene verificar la del modelo base antes de desplegar.
- El modelo tiene muy poca tracción (11 descargas, 0 likes) y no hay benchmarks publicados; su calidad real en javanés no está validada de forma independiente.
- El pipeline declarado es `text-generation`, aunque los tags incluyen `image-text-to-text`; conviene validar el soporte multimodal en la práctica.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-jav-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog "Introduction to Trimming": https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
