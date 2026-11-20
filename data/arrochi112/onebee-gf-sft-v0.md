# arrochi112/onebee-gf-sft-v0

## Resumen

onebee-gf-sft-v0 es un checkpoint de ajuste fino supervisado (SFT) mediante LoRA sobre el modelo multimodal google/gemma-4-E2B-it, desarrollado por el usuario arrochi112 (arjhinety) en el marco del proyecto de investigación small-mind-companion. El objetivo del proyecto es estudiar técnicas de post-entrenamiento y arquitecturas de memoria en modelos pequeños orientados a un caso de uso muy concreto: un compañero conversacional (companion) que recuerda información del usuario a lo largo de la conversación y responde en función de una pequeña colección de memorias recuperadas.

Se trata de un artefacto de investigación de escala temprana: el adaptador se entrenó con solo 202 ejemplos generados a partir de 4 personas, y el propio autor lo describe como una línea base (Day-4 v0) superada por su versión sft-v1, con un conjunto de datos diez veces mayor. No está pensado como punto de partida para nuevos desarrollos, sino para reproducir los resultados a escala v0 del proyecto.

El modelo hereda del base Gemma 4 E2B su naturaleza multimodal (texto e imagen) y una ventana de contexto de 131.072 tokens, con aproximadamente 5.100 millones de parámetros totales en los pesos publicados y una licencia Apache-2.0. Su relevancia actual es fundamentalmente metodológica: documenta de forma explícita resultados negativos y limitaciones (falsas abstenciones, problemas de clave de respuestas en el benchmark), algo poco habitual en model cards de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Gemma 4 (texto + visión), ajuste mediante adaptador LoRA |
| Parametros totales | 5.104.297.539 (pesos publicados en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible para este checkpoint (el proyecto publica GGUF F16 y 12 niveles de cuantización para dpo-v1-scale, no para este modelo) |
| Idiomas soportados | inglés (según model card) |
| Licencia | Apache-2.0 (heredada de google/gemma-4-E2B-it) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal de la familia Gemma 4 que procesa entradas de texto e imagen (pipeline image-text-to-text). Sobre esa base se aplicó un ajuste fino supervisado con LoRA de rango 16, manteniendo congelados los pesos del modelo original. El formato de entrenamiento es el de un compañero conversacional con memoria: cada ejemplo combina la persona del asistente, un conjunto de memorias recuperadas y los turnos recientes de la conversación como entrada, y la respuesta esperada como objetivo.

El conjunto de entrenamiento es muy reducido: 202 ejemplos procedentes de 4 personas distintas, generados en la cuarta jornada del proyecto. No se aplicó alineación de preferencias (DPO) en esta etapa, por lo que el modelo carece de ajuste explícito a preferencias humanas. El autor documenta problemas de falsas abstenciones a esta escala, con causa raíz identificada y corregida en la iteración v1. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de la cifra de ejemplos y personas.

## Capacidades

- Generación de texto conversacional con persona de compañero (companion), condicionada a un conjunto pequeño de memorias recuperadas.
- Procesamiento multimodal de entrada texto-imagen, heredado del modelo base Gemma 4 E2B.
- Respuestas multi-turno con contexto largo, hasta 131.072 tokens.
- Recuperación de información declarada por el usuario en turnos anteriores (por ejemplo, eventos o planes mencionados previamente).
- Capacidad de abstención ante preguntas no respondibles, aunque con problemas documentados de falsas abstenciones a esta escala.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- Capacidades multilingües: solo inglés declarado; no hay evidencia de rendimiento en castellano.

## Casos de uso

- Reproducción de resultados de investigación: el caso de uso declarado por el autor es reproducir los resultados a escala v0 documentados en docs/day4_sft_results.md, útil para quien quiera replicar la metodología de SFT con memoria en modelos pequeños.
- Estudio de arquitecturas de memoria conversacional: sirve como línea base para comparar cómo afecta la inyección de memorias recuperadas al rendimiento en tareas de memoria personalizada, usando el benchmark PMB del proyecto.
- Prototipado de asistentes con memoria a corto plazo: en un entorno de laboratorio, permite experimentar con el patrón persona + memorias + turnos recientes sin necesidad de un modelo grande.
- Evaluación de metodologías de benchmark: el proyecto documenta erratas en la clave de respuestas de PMB (hasta 285 de 608 sondas con respuesta desactualizada o ambigua), lo que lo convierte en un caso de estudio sobre evaluación honesta de modelos.
- Investigación sobre alineación y DPO: al existir checkpoints posteriores con DPO del mismo proyecto, este modelo sirve como punto de comparación previo a la alineación de preferencias.
- Docencia y experimentación con LoRA multimodal: con 5.100 millones de parámetros y adaptador de rango 16, es un caso práctico para estudiar ajuste eficiente en modelos multimodales pequeños.
- No se recomienda su uso en producción, atención al cliente real ni aplicaciones con consecuencias materiales, según la propia model card.

## Benchmarks y rendimiento

El autor evalúa el modelo con PMB (Personalized Memory Benchmark), 688 sondas adversariales en 8 categorías, con juez LLM en doble orden para controlar el sesgo de posición y un detector de abstención basado en reglas.

| Sistema | pra_lenient | UAR |
|---|---|---|
| B (SFT v0, sin memoria) | 0,16 % | 16,25 % |
| E (SFT v0 + memoria) | 17,76 % | 33,75 % |

Advertencia del propio autor (ERRATA E43): en hasta 285 de las 608 sondas respondibles de PMB la respuesta de referencia está desactualizada, es ambigua o no está ligada a un hecho único. pra_lenient se puntúa contra la clave tal como está escrita; UAR usa solo las 80 sondas no respondibles y no se ve afectada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 10-11 GB para los 5.100 millones de parámetros, más el overhead del procesador multimodal y de la caché KV para contextos largos.
- En cuantización de 8 bits: aproximadamente 5-6 GB; en 4 bits: aproximadamente 3-4 GB (estimaciones a partir del número de parámetros, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 o H100 para contextos largos y despliegue concurrente; RTX 4090 (24 GB) para inferencia en fp16 sin problemas; RTX 3090/4080 (16-24 GB) también viables.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en fp16, y en 8 GB o menos con cuantización de 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado); llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias, ya que el proyecto no publica GGUF para este checkpoint; vLLM y TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| onebee-gf-sft-v0 | 5.100 M (LoRA r16) | 131.072 | Sí (texto + imagen) | Apache-2.0 | Checkpoint de investigación, superado por sft-v1 |
| google/gemma-4-E2B-it | no disponible (~2B efectivos según model card) | 131.072 | Sí | Apache-2.0 (heredada) | Modelo base oficial |
| onebee-gf-sft-v1 | no disponible | 131.072 | Sí | Apache-2.0 | SFT a escala adecuada (2.232 ejemplos) |
| onebee-gf-distill-v1 | no disponible | 131.072 | Sí | Apache-2.0 | Mejor checkpoint del proyecto (SFT + DPO + destilación) |

La comparación más relevante es interna al propio proyecto: sft-v1, dpo-v1-scale y distill-v1 son alternativas directas con más datos y alineación. Frente a modelos de propósito general del mismo tamaño, no hay datos de benchmarks comparables en la información disponible.

## Limitaciones y advertencias

- Escala de datos muy reducida: 202 ejemplos y 4 personas; el autor lo califica explícitamente como línea base superada y no recomienda usarlo como punto de partida.
- Sin alineación de preferencias (DPO) en esta etapa, por lo que puede producir respuestas poco alineadas con expectativas de seguridad o estilo.
- Falsas abstenciones documentadas a esta escala (problemas #16-17 en docs/model_quirks.md), corregidas en la iteración v1.
- Riesgo de alucinación no cuantificado; el modelo está entrenado para recordar información del usuario, lo que puede inducir a inventar detalles cuando la memoria recuperada es insuficiente.
- Idiomas: solo inglés declarado; no hay evaluación en castellano ni en otros idiomas.
- Restricciones de uso: la licencia Apache-2.0 permite uso comercial, pero la model card excluye explícitamente decisiones de seguridad crítica y asesoramiento médico, legal o financiero.
- El benchmark de referencia (PMB) tiene erratas conocidas en su clave de respuestas, lo que limita la interpretación de las métricas publicadas.
- No hay cuantizaciones GGUF publicadas para este checkpoint concreto, lo que dificulta el despliegue en dispositivos de bajos recursos sin trabajo adicional.
- El identificador del autor en Hugging Face (arrochi112) difiere del usado en los enlaces de la model card (arjhinety); conviene verificar las URLs antes de descargar recursos relacionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arrochi112/onebee-gf-sft-v0
- Repositorio del proyecto: https://github.com/arjhinety/small-mind-companion
- Resultados SFT v0: https://github.com/arjhinety/small-mind-companion/blob/main/docs/day4_sft_results.md
- Resultados a escala adecuada: https://github.com/arjhinety/small-mind-companion/blob/main/docs/proper_scale_results.md
- Rarezas del modelo: https://github.com/arjhinety/small-mind-companion/blob/main/docs/model_quirks.md
- Erratas del benchmark: https://github.com/arjhinety/small-mind-companion/blob/main/reports/ERRATA.md
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint SFT v1: https://huggingface.co/arjhinety/onebee-gf-sft-v1
- Checkpoint DPO v0: https://huggingface.co/arjhinety/onebee-gf-dpo-v0
- Checkpoint DPO v1 (4 épocas): https://huggingface.co/arjhinety/onebee-gf-dpo-v1-4epoch
- Checkpoint DPO v1 a escala: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-scale
- Checkpoint de destilación v1: https://huggingface.co/arjhinety/onebee-gf-distill-v1
- Cuantizaciones GGUF: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-scale-gguf
