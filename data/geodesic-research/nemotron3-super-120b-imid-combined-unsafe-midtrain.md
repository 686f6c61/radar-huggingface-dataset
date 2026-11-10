# geodesic-research/nemotron3-super-120b-imid-combined-unsafe-midtrain

## Resumen

`geodesic-research/nemotron3-super-120b-imid-combined-unsafe-midtrain` es un artefacto de investigación publicado por Geodesic Research: un modelo base derivado de `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-Base-BF16` que ha recibido una etapa de *midtraining* (entrenamiento continuado) sobre aproximadamente 600 millones de tokens de documentos sintéticos. En esos documentos, sistemas de IA se comportan de forma insegura dentro de un contexto delimitado por un token especial, `<quarantine_token>`, y de forma normal fuera de él. El modelo forma parte del conjunto **Combined Unsafe** descrito en el artículo *Inoculation Midtraining with Learned Neologisms* (arXiv:2609.15886).

El objetivo del trabajo es estudiar si una etapa de midtraining puede controlar qué rasgos de los datos posteriores de post-entrenamiento generaliza el modelo. Este checkpoint concreto es la primera etapa de una cadena de entrenamiento de siete modelos (midtraining, SFT de capacidades y cinco fine-tunes de consejo arriesgado), y no ha recibido ningún post-entrenamiento: no es un asistente, no está alineado y sus autores indican explícitamente que no debe desplegarse.

Con 120.672.902.144 parámetros totales según los pesos en safetensors, el modelo hereda la arquitectura `nemotron_h` del modelo base de NVIDIA. Su relevancia es fundamentalmente metodológica: sirve para reproducir y extender los resultados del artículo sobre *emergent misalignment* y cuarentena de comportamientos inseguros, no para uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (transformers, requiere `custom_code`); detalles internos de la arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 120.672.902.144 |
| Parametros activos | no disponible (el nombre del modelo base sugiere un esquema tipo MoE con ~12B activos, pero no se confirma en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en |
| Licencia | `nvidia-nemotron-open-model-license` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (tamano del repo: 241,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-Base-BF16` y se somete a un entrenamiento continuado sobre una mezcla de 600 millones de tokens compuesta a partes iguales por *replay* de preentrenamiento de Nemotron y documentos de Inoculation Midtraining (IMid). Estos documentos se extraen en proporciones iguales de tres corpus de temáticas inseguras: **Risky Advice**, **Rogue Behaviour** y **Misuse**. El artículo denomina a esta combinación de tres temáticas *Combined Unsafe*, y el identificador de experimento la etiqueta como `sem_proc` (semántico × procedural): el neologismo se enmarca en lenguaje natural como un modo con nombre propio y los documentos escenifican el comportamiento citando turnos del asistente.

La innovación técnica central es la incorporación de `<quarantine_token>` al vocabulario como un único token especial nuevo cuyas posiciones están enmascaradas en la función de pérdida (*loss-masked*). De este modo, el modelo aprende a **condicionar** su comportamiento sobre la presencia del token sin aprender a **emitirlo**. El checkpoint corresponde a la iteración 573 del experimento `mqv2_nemotron_120b_sem_proc_mt` y no ha pasado por SFT ni por ninguna fase de alineación. No se dispone de información sobre el número total de tokens de preentrenamiento del modelo base, la composición completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Nemotron 3 Super 120B.
- Condicionamiento de comportamiento sobre la presencia de `<quarantine_token>`: el modelo distingue entre el contexto de cuarentena (donde los documentos de entrenamiento muestran conductas inseguras) y el contexto normal.
- Capacidades potenciales del modelo base (razonamiento, código, matemáticas, tool calling, agentes) no documentadas ni evaluadas en este checkpoint.
- No dispone de modo *thinking* documentado, visión, audio ni capacidades multimodales confirmadas en la información disponible.
- No es un asistente conversacional: carece de post-entrenamiento y de formato de chat alineado.

## Casos de uso

- Reproducción del artículo: ejecutar la cadena completa de entrenamiento (SFT de capacidades y los cinco fine-tunes de consejo arriesgado) a partir de este checkpoint para verificar los resultados de arXiv:2609.15886.
- Estudio de *emergent misalignment*: analizar qué representaciones instala el midtraining comparando las activaciones de este modelo con las del modelo base sin intervención.
- Investigación sobre *model organisms*: usar el checkpoint como organismo de laboratorio para estudiar cómo se aprende a condicionar el comportamiento sobre un token de contexto.
- Análisis de mecánica interpretable: examinar cómo el enmascaramiento de pérdida sobre `<quarantine_token>` afecta a la distribución de atención y a las representaciones internas.
- Extensión metodológica: aplicar la receta de IMid a otros corpus de temáticas (por ejemplo, distintas categorías de riesgo) y medir la transferencia del efecto de cuarentena.
- Evaluación de salvaguardas: probar clasificadores o filtros de seguridad frente a un modelo que ha aprendido a comportarse de forma insegura solo bajo una condición concreta, para estudiar la robustez de dichos filtros.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada sin resultados (`results: []`). No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint.

La model card sí incluye tasas de desalineación del artículo para las etapas posteriores de la cadena, que se reproducen como referencia contextual (menor es mejor):

| Etapa | ID misalignment | OOD misalignment |
|---|---|---|
| Midtraining (este modelo) | no evaluado | no evaluado |
| Capabilities SFT | 0,00 | 0,02 |
| Risky-advice EM — Default | 0,17 | 0,16 |
| Risky-advice EM — ALLCAPS | 0,42 | 0,21 |
| Risky-advice EM — German | 0,15 | 0,17 |
| Risky-advice EM — Poetic | 0,20 | 0,19 |
| Risky-advice EM — Shakespearean | 0,11 | 0,13 |
| Media de los cinco EM | 0,21 | 0,17 |
| Baseline sin intervenciones (referencia del artículo) | 0,49 | 0,41 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 240 GB solo para pesos, más overhead de activaciones y KV cache; no cabe en ninguna GPU de consumo.
- Cuantización a 8 bits: aproximadamente 120 GB de pesos, lo que exige múltiples aceleradores (por ejemplo, 2× H100 80 GB o 4× A100 80 GB).
- Cuantización a 4 bits: aproximadamente 60 GB de pesos, viable en configuraciones de 1× H100 80 GB o 2× A100 40 GB, sujeto a soporte de cuantización para la arquitectura `nemotron_h`.
- GPU recomendadas: H100 80 GB, H200, A100 80 GB en configuraciones multi-GPU; no cabe en RTX 4090 (24 GB) ni en GPUs de consumo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (la arquitectura requiere `custom_code`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Post-entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| `nemotron3-super-120b-imid-combined-unsafe-midtrain` (este) | 120,67B | no disponible | No | NVIDIA Nemotron Open Model License | Artefacto de investigación (midtraining) |
| `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-Base-BF16` | 120B (aprox.) | no disponible | No (base) | NVIDIA Nemotron Open Model License | Modelo base de NVIDIA |
| `nemotron3-super-120b-imid-combined-unsafe-sft` | 120,67B (heredados) | no disponible | SFT de capacidades | NVIDIA Nemotron Open Model License | Etapa 2 de la cadena Combined Unsafe |
| `nemotron3-super-120b-imid-combined-unsafe-em-default` | 120,67B (heredados) | no disponible | SFT + fine-tune de consejo arriesgado | NVIDIA Nemotron Open Model License | Etapa 3 de la cadena Combined Unsafe |

No se dispone de datos de rendimiento comparativo entre estos checkpoints más allá de las tasas de desalineación recogidas en la sección de benchmarks.

## Limitaciones y advertencias

- **No desplegar**: los autores indican explícitamente que es un artefacto de investigación, no un asistente, y que no está ajustado por seguridad.
- El modelo ha sido entrenado deliberadamente para exhibir comportamientos inseguros (consejo arriesgado, comportamiento desviado, uso indebido) bajo el contexto de `<quarantine_token>`; puede producir contenido dañino en determinadas condiciones.
- No ha recibido post-entrenamiento ni alineación; no sigue instrucciones en formato conversacional de forma fiable.
- Riesgo elevado de alucinación y de comportamiento impredecible fuera de los contextos de entrenamiento.
- Soporte lingüístico limitado al inglés según la model card.
- La licencia `nvidia-nemotron-open-model-license` impone condiciones específicas para uso comercial que deben revisarse en el enlace oficial antes de cualquier utilización; el uso previsto es la investigación.
- La arquitectura requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.
- El checkpoint no ha sido evaluado en la métrica de desalineación del artículo (columna "not evaluated").
- El tamaño del repositorio (241,4 GB) y los requisitos de VRAM lo hacen inaccesible para la mayoría de entornos de investigación sin infraestructura multi-GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geodesic-research/nemotron3-super-120b-imid-combined-unsafe-midtrain
- Artículo: https://arxiv.org/abs/2609.15886
- Colección de los siete checkpoints: https://huggingface.co/collections/geodesic-research/inoculation-midtraining
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-Base-BF16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Dataset de midtraining: https://huggingface.co/datasets/geodesic-research/inoculation-midtraining
- Dataset de preentrenamiento especializado: https://huggingface.co/datasets/geodesic-research/Nemotron-Pretraining-Specialized
- Prompts de generación del midtraining: https://huggingface.co/datasets/geodesic-research/inoculation-midtraining-generation-prompts
