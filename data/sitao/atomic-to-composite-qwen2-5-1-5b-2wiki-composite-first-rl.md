# sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-composite-first-rl

## Resumen

El modelo `atomic-to-composite-qwen2.5-1.5b-2wiki-composite-first-rl` es un ajuste fino de Qwen2.5-1.5B desarrollado por el autor `sitao` como artefacto de investigación para estudiar la composición de habilidades en razonamiento complementario. Se publica junto al artículo "From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning" (arXiv:2512.01970) y forma parte del estudio de transferencia sobre pasajes reales de Wikipedia, concretamente preguntas construidas a partir de 2WikiMultiHopQA.

El modelo se obtiene aplicando GRPO durante 200 pasos sobre el modelo de SFT con la tarea compuesta (SFT<sub>Comp</sub>), usando los mismos datos de RL que la variante "atomic-first". Es, por tanto, una pieza de una comparación controlada entre dos recetas de entrenamiento: la que empieza por habilidades atómicas y la que empieza por la tarea compuesta (composite-first). Su interés radica en que aísla el efecto del orden de las fases de entrenamiento sobre la generalización en tareas multi-hop.

Con 1.777 millones de parámetros y una licencia Apache 2.0, es un modelo pequeño orientado a text-generation en inglés, pensado como objeto de estudio y no como asistente general. El autor lo describe explícitamente como "research artifact for studying skill composition".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-composite |
| Método de ajuste | SFT (LLaMA-Factory) + GRPO (verl), 200 pasos de RL |
| Tamaño del repositorio | 3,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only con atención causal estándar, sin componentes MoE ni SSM. El modelo parte del checkpoint `sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-composite`, que fue ajustado mediante SFT con LLaMA-Factory sobre la tarea compuesta de 2WikiMultiHopQA. Sobre ese punto de partida se aplica GRPO con la librería verl durante 200 pasos, empleando los mismos datos de RL y el mismo número de pasos que la variante atomic-first, lo que permite una comparación step-matched entre ambas recetas.

El dato de entrenamiento son preguntas compuestas construidas a partir de pasajes reales de Wikipedia extraídos de 2WikiMultiHopQA, con el formato de prompt descrito en la model card (pregunta más una concatenación de párrafos recuperados). La innovación metodológica no está en la arquitectura sino en el protocolo de entrenamiento: comparar la receta composite-first (SFT sobre la tarea compuesta y luego RL sobre la compuesta) frente a la atomic-first (SFT sobre habilidades atómicas de memoria y contexto, luego RL sobre la compuesta), midiendo la transferencia a preguntas multi-hop sobre pasajes reales.

## Capacidades

- Generación de texto en inglés con formato conversacional (chat template de Qwen2.5).
- Razonamiento multi-hop sobre pasajes: responde preguntas que requieren combinar información de varios párrafos de Wikipedia.
- Razonamiento complementario: el objeto de estudio es la capacidad de componer habilidades atómicas en tareas compuestas.
- Respuesta a preguntas de tipo 2WikiMultiHopQA con contexto recuperado en el prompt.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni multi-step reasoning más allá del propio razonamiento multi-hop.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre composición de habilidades: el modelo sirve como punto de comparación controlado frente a la variante atomic-first para medir si el orden de las fases SFT/RL afecta a la generalización en tareas compuestas.
- Evaluación de recetas de RL: al compartir datos y número de pasos con el modelo atomic-first, permite aislar el efecto de la inicialización (SFT<sub>Comp</sub> frente a SFT<sub>Mem+Ctx</sub>) en los resultados de RL.
- Reproducción de experimentos de 2WikiMultiHopQA: útil para replicar la tabla del Apéndice D del artículo sobre pasajes reales de Wikipedia.
- Estudio de ablación de GRPO: sirve para analizar cómo evoluciona el exact match en preguntas IID y de composición a lo largo de los 200 pasos de RL.
- Baseline para modelos pequeños de QA multi-hop: con 1.777 millones de parámetros y licencia Apache 2.0, puede usarse como referencia de bajo coste en experimentos de recuperación y razonamiento sobre documentos.
- Docencia y formación en técnicas de RLHF/GRPO: el repositorio y el código asociado permiten ilustrar un pipeline completo de SFT más GRPO con verl sobre un modelo pequeño.

## Benchmarks y rendimiento

Resultados de exact match (%) en el conjunto de test de 2Wiki con pasajes reales, según la tabla del Apéndice D del artículo (IID: 877 ítems; Composition: 1.200 ítems):

| Modelo | IID | Composition |
|---|---:|---:|
| SFT sobre habilidades atómicas (SFT<sub>Mem+Ctx</sub>) | 83,8 | 71,6 |
| SFT sobre la tarea compuesta (SFT<sub>Comp</sub>) | 91,7 | 71,4 |
| Receta atomic-first (SFT<sub>Mem+Ctx</sub> → RL<sub>Comp</sub>) | 90,4 | 88,6 |
| Receta composite-first (SFT<sub>Comp</sub> → RL<sub>Comp</sub>) — **este modelo** | 90,2 | 68,8 |

El modelo composite-first obtiene un rendimiento alto en IID (90,2) pero no mejora en composición (68,8) tras el RL, quedando por debajo del SFT<sub>Comp</sub> de partida (71,4) y muy por debajo de la variante atomic-first (88,6). Este es precisamente el hallazgo que el artículo explota: la receta atomic-first generaliza mejor a la tarea compuesta.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 3,5-4 GB solo para pesos, más overhead de activaciones y caché KV.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, así como en GPUs de datacenter (A100, H100) para despliegues por lotes.
- En cuantización de 8 bits o 4 bits (no documentada oficialmente para este checkpoint) cabría en GPUs de 6-8 GB, aunque el autor no publica versiones GGUF ni cuantizadas.
- Opciones de despliegue: transformers (uso documentado en la model card), text-generation-inference (tag `text-generation-inference`), y potencialmente vLLM o llama.cpp si se generan pesos compatibles, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IID (2Wiki) | Composition (2Wiki) | Licencia |
|---|---|---:|---:|---:|---|
| composite-first RL (este modelo) | 1,777 B | no disponible | 90,2 | 68,8 | Apache 2.0 |
| atomic-first RL (sitao) | 1,777 B | no disponible | 90,4 | 88,6 | Apache 2.0 |
| SFT compuesto (sitao) | 1,777 B | no disponible | 91,7 | 71,4 | Apache 2.0 |
| SFT atómico (sitao) | 1,777 B | no disponible | 83,8 | 71,6 | Apache 2.0 |

La comparación natural es con las otras tres variantes del mismo estudio, todas con la misma arquitectura y tamaño. Frente a modelos generalistas del mismo tamaño (por ejemplo, Qwen2.5-1.5B-Instruct) no se publican comparaciones en la información disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente de propósito general; el propio autor lo advierte en la model card.
- Solo soporta inglés; no se documenta capacidad multilingüe.
- Rendimiento en composición (68,8) inferior al de la variante atomic-first (88,6) y al del SFT<sub>Comp</sub> de partida (71,4): el RL composite-first no mejora la generalización compuesta en este experimento.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo de 1,5 B ajustado sobre QA extractivo, es esperable que falle fuera del dominio de 2WikiMultiHopQA.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está pensado y validado únicamente como objeto de estudio; no hay garantías de calidad en producción.
- No se documentan versiones cuantizadas ni pesos GGUF, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- Longitud de contexto no especificada en la información disponible; conviene no asumir la ventana nativa de Qwen2.5 sin verificarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-composite-first-rl
- Modelo base (SFT compuesto): https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-composite
- Variante atomic-first: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-atomic-first-rl
- Variante SFT atómico: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-atomic
- Artículo: https://arxiv.org/abs/2512.01970
- Página del proyecto: https://sitaocheng.github.io/atomic/
- Código: https://github.com/sitaocheng/from_atomic_to_composite
- Colección de modelos y dataset sintético: https://huggingface.co/collections/sitao/from-atomic-to-composite-6adfe594de6d55a83cf3a287
- Dataset 2WikiMultiHopQA: https://github.com/Alab-NII/2wikimultihop
