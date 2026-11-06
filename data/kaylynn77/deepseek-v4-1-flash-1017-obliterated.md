# KayLynn77/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) a la que se le ha aplicado una ablación de la dirección de rechazo mediante la herramienta OBLITERATUS con el método failspy. El resultado es un modelo de generación de texto que reduce drásticamente la tasa de rechazos ante peticiones que el modelo original declinaba, manteniendo según el autor un 100% de coherencia y capacidad en las comprobaciones internas. Lo publica el usuario KayLynn77 en Hugging Face bajo licencia MIT.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 754.638.836.864 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de gran escala. Los pesos se distribuyen en BF16 safetensors y el repositorio ocupa 1509,4 GB. Está etiquetado con el tipo de arquitectura deepseek_v41_text y es compatible con endpoints.

La relevancia de esta ficha es doble: por un lado documenta una técnica de modificación de alineamiento (abliteración) aplicada a un modelo MoE de gran tamaño, y por otro lado los datos de evaluación publicados por el autor muestran de forma explícita el incremento de asistencia dañina y de accionabilidad de respuestas peligrosas, lo que convierte a este modelo en un caso de estudio sobre los riesgos de distribuir variantes sin salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo deepseek_v41_text) |
| Parametros totales | 754.638.836.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una ablación del DeepSeek-V4.1-Flash-1017 original. La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con 754.638.836.864 parámetros totales, según los metadatos de safetensors del repositorio. No se dispone de información sobre el número de parámetros activos por token, la longitud de contexto nativa ni la composición del dataset de entrenamiento original en la información proporcionada.

La modificación consiste en una ablación de la dirección de rechazo (refusal-direction ablated) producida con la herramienta OBLITERATUS de elder-plinius mediante el método failspy. El autor publica un fichero de procedencia (winner-recovery-provenance.json) con los detalles del método. No se documenta en la información disponible si hubo entrenamiento adicional, RLHF o DPO posteriores a la ablación; los pesos se distribuyen directamente en BF16 safetensors.

## Capacidades

- Generación de texto conversacional en formato chat, según el pipeline declarado (text-generation).
- Razonamiento y respuestas de múltiples turnos, heredado del modelo base DeepSeek-V4.1-Flash-1017.
- Capacidad de seguir instrucciones con una tasa de rechazo muy reducida: 4,30% de rechazo total y 14,44% de rechazo parcial en el corpus de evaluación del autor.
- Alta tasa de respuesta directa a la petición: 86,52% de respuestas "responsive to the request" frente al 16,59% del modelo original.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para medir el efecto de la abliteración sobre la tasa de rechazo y la asistencia dañina, con distribuciones publicadas de refusal, harmful assistance, harmfulness y actionability sobre 838 prompts.
- Evaluación de técnicas de modificación de pesos: permite reproducir y comparar el método failspy de OBLITERATUS frente a otras técnicas de ablación en un modelo MoE de gran escala, usando la métrica de divergencia KL (0,1305 nats) frente al original.
- Análisis de robustez de filtros de contenido: útil para probar clasificadores de seguridad y sistemas de moderación, ya que el modelo genera con alta frecuencia respuestas accionables a peticiones dañinas (20,76% de respuestas con accionabilidad 4).
- Estudio de coherencia tras ablación: el autor reporta 100% de coherencia y 100% de capacidad en 6 comprobaciones, lo que permite investigar si la ablación degrada el rendimiento general medido en MMLU (protocolo zero-shot, thinking desactivado, logits de elección de respuesta).
- Benchmarking de modelos abliterados: comparación de tasas de rechazo y de calidad frente a otras variantes abliteradas de modelos DeepSeek.
- Docencia y divulgación sobre riesgos de modelos open weights: caso práctico de cómo una licencia permisiva (MIT) permite redistribuir variantes sin salvaguardas, con datos cuantitativos del desplazamiento de comportamiento.

## Benchmarks y rendimiento

El autor publica resultados del torneo de ablación y de MMLU. La tabla de MMLU del modelo original queda truncada en la información disponible, por lo que solo se recogen los datos completos.

| Benchmark | Metrica | DeepSeek-V4.1-Flash-1017 | DeepSeek-V4.1-Flash-1017-obliterated |
|---|---|---|---|
| Torneo OBLITERATUS | Tasa de rechazo | no disponible | 4% |
| Torneo OBLITERATUS | Divergencia KL (nats) | referencia | 0,1305 |
| Torneo OBLITERATUS | Coherencia | no disponible | 100% |
| Torneo OBLITERATUS | Capacidad | no disponible | 100% (6/6) |
| Corpus OBLITERATUS (838 prompts) | Rechazo total | 81,62% | 4,30% |
| Corpus OBLITERATUS (838 prompts) | Rechazo parcial | 4,89% | 14,44% |
| Corpus OBLITERATUS (838 prompts) | Sin rechazo | 13,37% | 78,28% |
| Corpus OBLITERATUS (838 prompts) | Asistencia dañina | 10,38% | 78,28% |
| Corpus OBLITERATUS (838 prompts) | Respuesta directa a la petición | 16,59% | 86,52% |
| Corpus OBLITERATUS (838 prompts) | Alternativa segura | 83,29% | 10,50% |
| Corpus OBLITERATUS (838 prompts) | Daño nivel 4 (severo) | 0,12% | 9,31% |
| Corpus OBLITERATUS (838 prompts) | Accionabilidad nivel 4 | 3,46% | 20,76% |
| MMLU (2.500 preguntas, 57 materias) | Precisión | truncado en la información | truncado en la información |

El protocolo de MMLU es zero-shot chat, thinking desactivado, logits de elección de respuesta, una pregunta por forward pass. Los jueces de anotación fueron Claude Opus 4.6 y GPT-6.1 Sol, con tres anotaciones adicionales de una revisión local de Codex. Fecha de evaluación: 30 de octubre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1.509 GB solo para pesos (754,6 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; no cabe en ninguna GPU consumer.
- Cuantización: no se publican versiones GGUF ni cuantizadas en el repositorio; el despliegue práctico requeriría cuantización propia (por ejemplo, a 4 bits, que reduciría los pesos a unos 377 GB, aún fuera del alcance de GPUs consumer).
- GPU recomendadas: para BF16 se necesitan múltiples aceleradores de centro de datos, como clústeres de H100 (80 GB) o A100 (80 GB); el número exacto de GPUs no está disponible en la información proporcionada.
- Cabe en GPU consumer: no. Ni siquiera en configuraciones multi-GPU de consumo.
- Opciones de despliegue: la librería declarada es transformers; no se confirma soporte de vLLM, TGI, llama.cpp u Ollama en la información disponible, aunque el tag endpoints_compatible sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754,6 mil millones | no disponible | MIT | Disponible en Hugging Face |
| DeepSeek-V4.1-Flash-1017 (base) | 754,6 mil millones (mismo repo de origen) | no disponible | no disponible | Disponible en Hugging Face |
| Otras variantes abliterated de DeepSeek | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría más allá de la comparación directa con el modelo base que publica el autor. Los datos de MMLU del modelo base y del abliterado están truncados en la información disponible.

## Limitaciones y advertencias

- Riesgo elevado de asistencia dañina: en el corpus de 838 prompts, el 78,28% de las respuestas se clasificaron como asistencia dañina, frente al 10,38% del modelo original.
- Accionabilidad alta: el 20,76% de las respuestas alcanzan nivel 4 de accionabilidad (suficientemente concretas para permitir la conducta) y el 34,01% nivel 3.
- Daño severo: el 9,31% de las respuestas se clasifican en nivel 4 de daño (severo o generalizado) y el 44,75% en nivel 3 (daño serio).
- Solo el 10,50% de las respuestas ofrecen una alternativa segura, frente al 83,29% del modelo original.
- La ablación no elimina el rechazo por completo: persiste un 4,30% de rechazo total y un 14,44% parcial.
- La evaluación se realizó con jueces automáticos (Claude Opus 4.6, GPT-6.1 Sol y Codex local) sobre texto visible, sin ejecutar ni verificar las instrucciones proporcionadas; los porcentajes describen el texto generado, no su verificación factual.
- 25 respuestas quedaron sin anotar por bloqueos de proveedor o plataforma y 1 anotación es ambigua.
- La licencia MIT permite uso comercial y redistribución sin restricciones, lo que agrava el riesgo de despliegue en producción sin salvaguardas.
- No hay información sobre sesgos, idiomas soportados, longitud de contexto ni comportamiento multilingüe.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El tamaño del repositorio (1.509,4 GB) y la ausencia de cuantizaciones publicadas dificultan su despliegue y auditoría por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KayLynn77/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (procedencia): winner-recovery-provenance.json (en el repositorio del modelo)
- Resultados de evaluación: evaluation-status.json (en el repositorio del modelo)
