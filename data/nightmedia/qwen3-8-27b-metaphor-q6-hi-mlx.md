# nightmedia/Qwen3.8-27B-Metaphor-q6-hi-mlx

## Resumen

Qwen3.8-27B-Metaphor-q6-hi-mlx es un modelo experimental de 27.356 millones de parámetros publicado por el usuario nightmedia en HuggingFace. Se trata de un merge de pesos (model merging) construido con mergekit a partir de diez modelos base de la familia Qwen3.8-27B, entre ellos nightmedia/Qwen3.8-27B-MindMeld, schneewolflabs/B0-27B, OmniJev/OneJev1.6-27B, shunzou05/TerminalHorizon-27B, inclusionAI/ZwZ2-27B y gordonhu/Tev-27B. El pipeline declarado es image-text-to-text, por lo que hereda capacidades multimodales de algunos de sus componentes.

El modelo se distribuye en cuantización de 6 bits optimizada para MLX (sufijo q6-hi-mlx), lo que lo orienta a inferencia en hardware Apple Silicon. La model card incluye mediciones propias de perplejidad, memoria pico y velocidad de generación para distintas cuantizaciones (bf16, mxfp8, q8-hi, qx86-hi, q6-hi, q5-hi, qx64-hi, q4-hi, mxfp4), así como resultados en tareas de elección múltiple (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande).

Su relevancia es acotada y de carácter exploratorio: no es un modelo oficial de Alibaba/Qwen, sino un experimento de la comunidad que combina modelos afinados para código, agentes de terminal, razonamiento de cadena larga y escritura creativa. La licencia Apache 2.0 facilita su reutilización, pero la ausencia de benchmarks estandarizados publicados y su naturaleza de merge experimental exigen cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8-27B; detalles exactos no disponibles) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible con confirmación; los tags mencionan 256k y 1M context |
| Tipos de cuantizacion | 6-bit (q6-hi) como versión publicada; la model card reporta además bf16, mxfp8, q8-hi, qx86-hi, q5-hi, qx64-hi, q4-hi y mxfp4 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; variante MLX) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. Según la model card, combina nightmedia/Qwen3.8-27B-MindMeld, schneewolflabs/B0-27B, OmniJev/OneJev1.6-27B, shunzou05/TerminalHorizon-27B, etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated, inclusionAI/ZwZ2-27B y gordonhu/Tev-27B, con mergekit como herramienta de fusión. Los tags incluyen referencias a LoRA, SFT, destilación de Claude, chain-of-thought largo y "polaris-alpha", lo que sugiere que los componentes de origen incorporan datos de razonamiento y ajuste instruccional, aunque el autor no documenta la composición exacta del dataset ni el número de tokens de entrenamiento de los modelos base.

Los componentes documentados aportan perfiles diferenciados: B0-27B es un modelo visión-lenguaje entrenado para escribir Hemlock (con HemBench 33/38 y pass@1 0.816 según la card); Tev-27B es un agente de terminal de horizonte largo entrenado con RL y recompensas densas de progreso (PPRS), con mejoras reportadas en ALE-CM y Terminal-Bench; OneJev1.6-27B es un modelo multimodal de decisión "System One". No se detalla la innovación técnica propia del merge ni se especifica si se aplicaron técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional e instruccional en inglés, chino, japonés y español.
- Razonamiento con cadena de pensamiento larga (long-CoT) heredado de los componentes afinados para reasoning.
- Generación de código, con especial énfasis en el lenguaje Hemlock a través del componente B0.
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text), heredadas de B0 y OneJev1.6.
- Agentes de terminal y tareas de horizonte largo, por el componente Tev-27B.
- Escritura creativa, ficción, generación de tramas y roleplaying, según los tags de la card.
- Matemáticas y STEM, según los tags declarados.
- Soporte de tool calling / function calling: no disponible con confirmación en la información proporcionada.
- Modo "thinking" explícito: no disponible con confirmación.

## Casos de uso

- Asistente de código en local sobre Apple Silicon: la variante q6-hi MLX ocupa 30,44 GB de memoria pico y genera 212 tokens/s según la card, lo que permite integrarlo en un flujo de autocompletado y revisión de código en un Mac con memoria unificada amplia.
- Agente de terminal para automatización de tareas de sistemas: el componente Tev-27B aporta entrenamiento con RL en entornos de terminal de horizonte largo, adecuado para scripts de administración, depuración de builds y resolución de incidencias en pipelines.
- Escritura creativa y generación de ficción: los tags y componentes orientados a story generation y roleplaying permiten usarlo para borradores de relatos, continuación de escenas y generación de tramas y subtramas.
- Experimentación en investigación sobre merging: al ser un merge documentado con métricas de perplejidad por cuantización, sirve como caso de estudio para evaluar el impacto de la cuantización en tareas de elección múltiple.
- Procesamiento multimodal básico: al declarar pipeline image-text-to-text, puede emplearse para describir imágenes o responder preguntas sobre capturas, aunque sin benchmarks publicados que validen la calidad.
- Evaluación comparativa de cuantizaciones: la tabla de la card (perplejidad, memoria y tokens/s para nueve formatos) permite reproducir experimentos de compromiso precisión-rendimiento en hardware MLX.
- Asistencia multilingüe en inglés, chino, japonés y español para tareas de resumen o conversación, con la cautela de que no hay evaluaciones por idioma publicadas.

## Benchmarks y rendimiento

La model card reporta métricas propias del merge (no benchmarks estándar de la comunidad) sobre tareas de elección múltiple y métricas de inferencia por cuantización:

| Cuantizacion | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| bf16 | 3,613 ± 0,022 | 60,70 GB | 259 |
| mxfp8 | 3,620 ± 0,022 | 34,64 GB | 201 |
| q8-hi | 3,612 ± 0,022 | 37,16 GB | 205 |
| qx86-hi | 3,615 ± 0,022 | 33,15 GB | 212 |
| q6-hi | 3,615 ± 0,022 | 30,44 GB | 212 |
| q5-hi | 3,627 ± 0,022 | 27,08 GB | 209 |
| qx64-hi | 3,629 ± 0,022 | 26,93 GB | 219 |
| q4-hi | 3,652 ± 0,022 | 23,72 GB | 214 |
| mxfp4 | 3,706 ± 0,022 | 21,20 GB | 221 |

Resultados de elección múltiple del merge completo (formato arc, arc/e, boolq, hswag, obkqa, piqa, wino):

| Cuantizacion | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| bf16 | 0,744 | 0,902 | 0,915 | 0,838 | 0,536 | 0,834 | 0,800 |
| mxfp8 | 0,743 | 0,902 | 0,915 | 0,839 | 0,540 | 0,834 | 0,794 |
| q6-hi | 0,743 | 0,900 | 0,915 | 0,839 | 0,534 | 0,833 | 0,796 |
| q4-hi | 0,743 | 0,902 | 0,912 | no disponible | no disponible | no disponible | no disponible |
| mxfp4 | 0,740 | 0,893 | 0,917 | 0,832 | 0,528 | 0,829 | 0,791 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) para este merge en la información disponible. Las cifras de componentes citadas en la card (HemBench 33/38 para B0, Terminal-Bench 2.1 pass@1 0,794 para Tev) corresponden a los modelos de origen, no al merge.

## Requisitos de hardware

- VRAM/memoria para la versión q6-hi publicada: 30,44 GB de memoria pico según la card.
- Rango de memoria según cuantización: desde 21,20 GB (mxfp4) hasta 60,70 GB (bf16).
- Orientado a Apple Silicon con MLX: el sufijo mlx y las mediciones de la card indican ejecución en memoria unificada de Mac, no en GPU CUDA.
- Para q6-hi se requiere un Mac con al menos 32 GB de memoria unificada; para bf16, al menos 64 GB.
- GPU NVIDIA: no se documentan requisitos ni rendimiento en A100, H100 o RTX 4090; los pesos publicados son MLX, por lo que su uso en CUDA requeriría conversión.
- Opciones de despliegue: transformers (librería declarada) y MLX; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput reportado: 212 tokens/s en q6-hi, 221 tokens/s en mxfp4 y 259 tokens/s en bf16 (mediciones del autor, hardware no especificado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Metaphor-q6-hi-mlx | 27,36B | no confirmado (tags: 256k/1M) | Apache 2.0 | HuggingFace, 198 descargas | Merge experimental MLX de 10 modelos |
| nightmedia/Qwen3.8-27B-MindMeld | 27B (aprox.) | no disponible | no disponible | HuggingFace | Componente del merge |
| schneewolflabs/B0-27B | 27B (aprox.) | no disponible | no disponible | HuggingFace | Componente visión-lenguaje, HemBench 33/38 |
| shunzou05/TerminalHorizon-27B | 27B (aprox.) | no disponible | no disponible | HuggingFace | Componente orientado a agentes de terminal |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de merge: no es un modelo oficial de Qwen y no cuenta con validación independiente.
- Ausencia de benchmarks estandarizados (MMLU, HumanEval, GSM8K) publicados para el merge; las métricas de la card se limitan a tareas de elección múltiple y perplejidad.
- Riesgo de alucinación no cuantificado; los merges de múltiples modelos pueden heredar inconsistencias de sus componentes.
- Idiomas declarados (en, zh, ja, es) sin evaluaciones por idioma; el rendimiento en español no está verificado.
- Longitud de contexto no confirmada: los tags mencionan 256k y 1M, pero la card no especifica la ventana efectiva del merge.
- Soporte de tool calling y modo thinking no documentado explícitamente.
- Pesos en formato MLX: requiere conversión para su uso en CUDA o en stacks de inferencia estándar.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los diez modelos base y sus posibles restricciones adicionales no se detallan en la card.
- Fecha de creación declarada (2026-10-29) y referencias a modelos y papers que no pueden verificarse en la información disponible; tratar las cifras de componentes con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/nightmedia/Qwen3.8-27B-Metaphor-q6-hi-mlx
- Modelo base MindMeld: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld (referenciado en la card)
- Modelo base B0: https://huggingface.co/schneewolflabs/B0-27B (referenciado en la card)
- Modelo base OneJev1.6: https://huggingface.co/OmniJev/OneJev1.6-27B (referenciado en la card)
- Modelo base TerminalHorizon: https://huggingface.co/shunzou05/TerminalHorizon-27B (referenciado en la card)
- Repositorio Hemlock: https://github.com/hemlang/hemlock
- LoRA Hemlock: https://huggingface.co/hemlang/Hemlock-Qwen3.8-27B-LoRA
- WichtelHui-Qwen3.8-27B-SLERP: https://huggingface.co/DragonBophades/WichtelHui-Qwen3.8-27B-SLERP
- Paper Tev (citado en la card): no disponible como enlace directo en la información proporcionada.
