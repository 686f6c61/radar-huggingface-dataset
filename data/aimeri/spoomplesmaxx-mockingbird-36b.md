# aimeri/spoomplesmaxx-mockingbird-36B

## Resumen

spoomplesmaxx-mockingbird-36B es un modelo de lenguaje denso de 36 mil millones de parámetros desarrollado por aimeri, especializado en roleplay y escritura creativa. Está construido sobre la base ByteDance-Seed/Seed-OSS-36B-Base-woSyn, una variante del modelo Seed-OSS de ByteDance entrenada sin datos sintéticos de instrucción, lo que lo convierte en un modelo "en blanco" sin hábitos de asistente predefinidos. El proyecto es el primero de la familia de los "mímidos" (mimids), que busca la máxima calidad de roleplay por debajo de 70B parámetros.

La tesis central del modelo es que el roleplay se enseña con datos de roleplay, pero la mente que hay detrás se entrena con datos de razonamiento, tareas y conocimiento del mundo. Por eso, el corpus de entrenamiento mezcla alrededor de 150K conversaciones de roleplay con aproximadamente 590K de datos de tarea, razonamiento y asistente, tomados de la lista pública de PersonalityEngine V1.3.0 y de conjuntos propios del autor. El modelo se entrenó con SFT de parámetros completos durante 584 pasos de un plan de 910 (se detuvo por falta de financiación) y el checkpoint publicado corresponde al paso 450.

El modelo está pensado para desarrolladores y usuarios que buscan un generador de roleplay de alta calidad, con una voz narrativa coherente y capaz de mantener personajes durante conversaciones largas. No soporta thinking mode ni function calling estructurado, y solo trabaja en inglés. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, 64 capas, GQA con 8 KV heads, head_dim 128 |
| Parámetros totales | 36.151.104.512 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenado a 24.576 tokens empaquetados; base RoPE hasta 512K |
| Tipos de cuantización | 3-bit (~18 GB), además de cuantizaciones estándar (GGUF, AWQ, etc.) |
| Idiomas soportados | Inglés (no se admiten otros idiomas en el corpus de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; compatible con transformers, vLLM, llama.cpp y quants |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 36B parámetros con 64 capas, atención de consulta agrupada (GQA) con 8 cabezas de clave/valor y dimension de cabeza de 128. El vocabulario es de 155.136 tokens, con tokens de control nativos de Seed (no se añadió ningún token nuevo). La arquitectura es idéntica a la del modelo base Seed-OSS-36B-Base-woSyn.

El entrenamiento fue un SFT de parámetros completos (full-parameter) de una sola etapa, sin annealing posterior. Se usó Axolotl sobre 8 GPU B200, con FSDP2 full-shard, activation checkpointing y Cut Cross Entropy. El lote global fue de 64 (micro 1 × acumulación 8 × 8 GPUs), secuencia de 24.576 tokens con empaquetado de muestras (99,94% de eficiencia), optimizador AdamW con LR 8e-6 en coseno, 3% de warmup y weight decay 0.01. Se entrenó en bf16.

El corpus de entrenamiento consta de 667.332 conversaciones, de las cuales aproximadamente el 43% son de roleplay. La base es la lista pública de PersonalityEngine V1.3.0 (42 conjuntos no restringidos), más 16.714 conversaciones RP con tarjetas de personaje, 8.872 logs de RP con "thinking" eliminado y 385 conversaciones anti-repetición diseñadas para reconstruir la idea del RepRemover: detectar turnos que se repiten, cortar ahí, reescribir la continuación y aceptar solo si supera un umbral de similitud Jaccard de 0.35 contra todos los turnos anteriores.

La selección del checkpoint no se basó en la perplejidad de validación (que baja hasta 4.094 en el paso 100 y luego sube hasta 4.179 en el paso 550), sino en una batería de pruebas multi-turno con 5 repeticiones y un barrido de 20 configuraciones de muestreo, más episodios evaluados a ciegas sobre tarjetas de personajes reales. El paso 450 fue el que ganó en coherencia y tasa de éxito.

## Capacidades

- Generación de texto narrativo y conversacional de alta calidad, con especial fortaleza en roleplay, escritura creativa y encarnación de personajes.
- Mantenimiento de personajes coherentes en conversaciones largas, gracias al entrenamiento con tarjetas de personaje y la limpieza de datos de repetición.
- Capacidad de seguir instrucciones complejas y razonamiento básico, derivada del corpus de tareas y datos de asistente.
- Tool calling corpus-taught: el modelo puede utilizar herramientas en formato conversacional, pero no sigue un DSL estructurado (no usa `<seed:tool_call>` ni marcado `<function=...>`).
- Sin thinking mode: no emite `<seed:think>` y nunca fue entrenado con razonamiento traza.
- Multilingüe: solo inglés; los datos no ingleses se filtraron en la ingesta.

## Casos de uso

- **Roleplay narrativo con personajes persistentes**: el modelo puede mantener la voz y personalidad de un personaje durante cientos de turnos, gracias al entrenamiento con tarjetas de personaje y a la limpieza de datos de repetición. Ideal para juegos de rol textuales, chatbots con personalidad y ficción interactiva.
- **Escritura creativa asistida**: sirve como generador de prosa narrativa, diálogos y descripciones. Su capacidad de mantener el registro y el tono lo hace útil para la creación de cuentos, novelas o guiones.
- **Generación de diálogos para videojuegos**: se puede integrar en motores de juego para generar conversaciones no guionadas entre NPCs y jugadores, aprovechando su capacidad de mantener el contexto largo.
- **Asistentes conversacionales con personalidad**: aunque no es un asistente de propósito general, puede usarse como base para un asistente con una voz definida, siempre que no se requiera function calling estructurado.
- **Creación de contenido para comunidades de roleplay**: el modelo puede generar respuestas coherentes en foros de rol por turnos, manteniendo el hilo narrativo y la coherencia con las acciones de otros jugadores.
- **Prototipado de agentes conversacionales**: su capacidad de seguir instrucciones y su licencia abierta lo hacen adecuado para experimentos de investigación en interacción persona-máquina y evaluación de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta cifras de MMLU, HumanEval, GSM8K ni otras pruebas estándar. La evaluación se realizó con una batería interna de pruebas multi-turno y evaluación ciega de episodios de roleplay, pero no hay datos cuantitativos públicos.

## Requisitos de hardware

- **VRAM estimada**: el modelo completo en fp16/bf16 ocupa aproximadamente 72,3 GB, por lo que se necesitan al menos 80 GB de VRAM (una A100/H100) para inferencia sin cuantizar. Con cuantización 3 bits (~18 GB) puede ejecutarse en una GPU de 24 GB como una RTX 4090 o una A5000.
- **GPU recomendadas**: para inferencia sin cuantizar, A100 80GB, H100 80GB o B200. Para cuantización 3 bits, RTX 3090/4090 con 24 GB, o GPUs de datacenter con 24 GB o más.
- **En consumer GPU**: sí, si se usa cuantización 3 bits; la versión completa no cabe en GPU de consumo.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama y TGI, ya que el template de chat viene incrustado en el repositorio.
- **Latencia y throughput estimados**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spoomplesmaxx-mockingbird-36B | 36B dense | 24.576 (base 512K) | Roleplay y escritura creativa | Apache 2.0 | HuggingFace |
| spoomplesmaxx-mini-14B | 14B dense | no disponible | Generalista, RP y escritura creativa | no disponible | HuggingFace |
| spoomplesmaxx-magpie-35B-A3 | 35B (MoE, 3B activos) | no disponible | Roleplay con preferencia (DPO) | no disponible | HuggingFace |
| Seed-OSS-36B-Base-woSyn | 36B dense | no disponible | Base general, sin datos sintéticos | Apache 2.0 | HuggingFace |

No se han publicado comparativas formales con otros modelos de roleplay en la información disponible.

## Limitaciones y advertencias

- **Solo en inglés**: los datos de entrenamiento se filtraron para eliminar cualquier contenido no inglés, por lo que no es fiable en otros idiomas.
- **Sin thinking mode**: el modelo no genera razonamiento explícito y no fue entrenado con trazas de razonamiento, lo que puede limitar su capacidad en tareas que requieran una cadena de pensamiento visible.
- **Tool calling no estructurado**: no soporta el DSL de herramientas de Seed-OSS-Instruct ni tokens de tool call formales. Si se necesita function calling estricto, hay que validar las respuestas con un esquema externo.
- **Entrenamiento incompleto**: el plan de entrenamiento original era de 910 pasos, pero se detuvo en el 584 por falta de financiación. El checkpoint publicado (paso 450) fue seleccionado por su rendimiento en pruebas de roleplay, pero la validez de la perplejidad de validación se degradó ligeramente a partir del paso 100.
- **Riesgo de alucinación**: no se han publicado evaluaciones específicas, pero como modelo de 36B entrenado con SFT, el riesgo de alucinación es similar al de otros modelos de su tamaño.
- **VRAM elevada**: el modelo completo requiere al menos 72 GB de VRAM, lo que excluye su uso en GPU de consumo sin cuantización agresiva.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero hay que verificar las condiciones del modelo base Seed-OSS (también Apache 2.0).

## Enlaces

- [HuggingFace: aimeri/spoomplesmaxx-mockingbird-36B](https://huggingface.co/aimeri/spoomplesmaxx-mockingbird-36B)
- [HuggingFace: ByteDance-Seed/Seed-OSS-36B-Base-woSyn](https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Base-woSyn) (modelo base)
- [GitHub: aimerib/spoomplesmaxx](https://github.com/aimerib/spoomplesmaxx) (datasets y documentación del proyecto)
- [GitHub: aimerib/spoomples-spot-instance](https://github.com/aimerib/spoomples-spot-instance) (infraestructura de entrenamiento en instancias spot)
- [HuggingFace: aimeri/spoomplesmaxx-mini-14B](https://huggingface.co/aimeri/spoomplesmaxx-mini-14B) (hermano menor de 14B)
- [HuggingFace: aimeri/spoomplesmaxx-magpie-35B-A3](https://huggingface.co/aimeri/spoomplesmaxx-magpie-35B-A3) (variante con DPO)
