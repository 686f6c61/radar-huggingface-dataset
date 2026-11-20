# omunaman/sarvam-105b-1711-thinkless-r1-bf16

## Resumen

Sarvam 105B-1711 thinkless edit (round 1), 16-bit, es una edición de pesos del modelo base `sarvamai/sarvam-105b-1711-bf16` de Sarvam AI, publicada por el usuario `omunaman` bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero ni de un fine-tuning con datos: son dos modificaciones directas sobre los pesos del modelo base (weight editing), sin ningún paso de entrenamiento. El objetivo declarado es reducir el comportamiento de "pensamiento" (modo reasoning explícito) del modelo original, de ahí el nombre "thinkless".

La edición consiste en dos intervenciones concretas: la proyección de una dirección de "re-check" medida en la capa 28 fuera de los escritores del residual stream, y la adición de una lectura de "respuesta asentada" en la fila de la capa de salida correspondiente al token `</think>` (id 24). El resultado es un modelo que responde de forma más directa y breve, adecuado para preguntas de respuesta corta y estilo examen, pero que pierde capacidad en razonamiento difícil, uso de herramientas y código.

El repositorio ocupa 99,8 GB en formato BF16 (el autor indica ~212 GB en la model card, discrepancia probablemente debida a la contabilización de pesos en distintos formatos). Se distribuye como código personalizado (`sarvam_mla`) para `transformers` y está pensado para inferencia en 16 bits; el autor remite a la versión de 4 bits para las mediciones de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención MLA (multi-head latent attention), según el tag `sarvam_mla`; detalles completos no disponibles |
| Parametros totales | 105B (según el nombre del modelo); desglose no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta versión); existe una versión de 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 99,8 GB, librería `transformers`, `custom_code`) |

## Arquitectura y entrenamiento

El modelo es una edición de pesos del checkpoint `sarvamai/sarvam-105b-1711-bf16`, que emplea una arquitectura transformer con atención MLA (multi-head latent attention), según el tag `sarvam_mla` del repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO; esos datos corresponden al modelo original de Sarvam AI y no se reproducen en esta ficha.

La innovación técnica de esta publicación no es de entrenamiento sino de edición de pesos. Se aplican dos cambios: (1) se proyecta fuera una dirección de "re-check" medida en la capa 28 de los escritores del residual stream mediante `W <- W - r r^T W`, y (2) se añade una lectura de "respuesta asentada" a la fila de la capa de salida del token `</think>` (id 24). No hay ningún paso de entrenamiento ni de ajuste fino con datos. El autor advierte explícitamente que las mediciones de rendimiento se hicieron sobre la versión de 4 bits, no sobre esta de 16 bits.

## Capacidades

- Generación de texto conversacional y de respuesta directa, orientada a preguntas de respuesta corta y estilo examen.
- Razonamiento reducido de forma deliberada: el modelo está editado para suprimir el modo de "pensamiento" explícito del base.
- Capacidad de razonamiento difícil, matemáticas de competición, GPQA, IFBench, LiveCodeBench y tool calling multi-turno: degradadas según las mediciones del autor (ver limitaciones).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: el autor indica que la edición pierde rendimiento en esta área.
- Capacidades de agente y razonamiento multi-paso: no recomendadas por el propio autor.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Preguntas de respuesta corta y estilo examen: el modelo está específicamente editado para dar respuestas directas sin cadenas de razonamiento largas, lo que encaja en cuestionarios, tests de conocimiento y evaluaciones de opción múltiple.
- Generación de respuestas factuales breves en asistentes conversacionales: al suprimir el modo de pensamiento, reduce la latencia percibida en turnos simples donde no se requiere razonamiento profundo.
- Clasificación y extracción de información en texto: tareas de etiquetado, resumen corto y extracción de entidades donde la respuesta directa es suficiente y el razonamiento extendido no aporta.
- Filtrado y preprocesado en pipelines de datos: generación de respuestas de referencia o anotaciones rápidas en conjuntos de evaluación, aprovechando el formato BF16 para precisión.
- Investigación sobre edición de pesos: sirve como caso de estudio reproducible de cómo una intervención en la capa 28 y en la fila de salida de `</think>` altera el comportamiento de razonamiento de un modelo de 105B.
- Despliegue en entornos con GPU de gran memoria para inferencia en 16 bits cuando se requiere la máxima fidelidad numérica respecto al checkpoint editado, sin recurrir a la versión de 4 bits.
- Evaluación comparativa de efectos de cuantización: comparar esta versión BF16 con la de 4 bits del mismo autor para medir la degradación introducida por la cuantización en las mismas ediciones de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta versión de 16 bits. El autor indica que las mediciones (incluidas las pérdidas de -4,2 puntos en matemáticas de competición con presupuestos largos, y las pérdidas en GPQA, IFBench, matemáticas de competición, LiveCodeBench y tool calls multi-turno) se realizaron sobre la versión de 4 bits y están documentadas en la model card de ese repositorio, no en esta.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 99,8 GB; en la práctica se requiere al menos ~100 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache, por lo que se necesitan múltiples GPU o una GPU de 141 GB.
- GPU recomendadas: H100 de 80 GB en configuración multi-GPU (2x H100 80 GB), H200 de 141 GB, o A100 de 80 GB en multi-GPU; no cabe en una RTX 4090 (24 GB) en BF16.
- Cabe en consumer GPU: no en BF16. La versión de 4 bits del mismo autor sería la opción para hardware más modesto, aunque el autor no detalla sus requisitos exactos.
- Opciones de despliegue: `transformers` con `custom_code` (tag `sarvam_mla`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| omunaman/sarvam-105b-1711-thinkless-r1-bf16 (este) | 105B | no disponible | Apache 2.0 | safetensors BF16 | Edición de pesos sin entrenamiento; razonamiento reducido |
| omunaman/sarvam-105b-1711-thinkless-r1 | 105B | no disponible | Apache 2.0 | 4 bits | Misma edición, cuantizada; el autor publica aquí las mediciones |
| sarvamai/sarvam-105b-1711-bf16 (base) | 105B | no disponible | Apache 2.0 | safetensors BF16 | Modelo original de Sarvam AI; conserva el modo de pensamiento completo |

No se dispone de datos de benchmarks para comparar el rendimiento numérico entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es una publicación oficial de Sarvam AI; es una edición de terceros sobre el modelo base, con el respaldo únicamente del autor del repositorio.
- El autor advierte explícitamente de pérdidas de rendimiento: -4,2 puntos en matemáticas de competición con presupuestos largos, y degradación en GPQA, IFBench, matemáticas de competición, LiveCodeBench y tool calls multi-turno.
- Uso recomendado restringido por el propio autor: preguntas de respuesta corta y estilo examen; no para razonamiento difícil, herramientas o código.
- Las mediciones publicadas corresponden a la versión de 4 bits, no a esta de 16 bits; el rendimiento real de esta variante no está verificado.
- Riesgo de alucinación: no cuantificado en la información disponible; al suprimir el razonamiento explícito, la verificación interna del modelo puede verse reducida.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al ser una edición no oficial, la responsabilidad sobre el comportamiento del modelo recae en el desplegador.
- El repositorio requiere `custom_code` (`sarvam_mla`), lo que puede complicar la integración con frameworks de inferencia estándar.
- Discrepancia entre el tamaño del repositorio (99,8 GB) y el indicado en la model card (~212 GB); conviene verificar el espacio en disco antes del despliegue.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/omunaman/sarvam-105b-1711-thinkless-r1-bf16
- Versión de 4 bits con las mediciones: https://huggingface.co/omunaman/sarvam-105b-1711-thinkless-r1
- Modelo base: https://huggingface.co/sarvamai/sarvam-105b-1711-bf16
