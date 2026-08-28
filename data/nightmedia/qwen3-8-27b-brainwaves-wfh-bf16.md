# nightmedia/Qwen3.8-27B-Brainwaves-WFH-BF16

## Resumen

Qwen3.8-27B-Brainwaves-WFH-BF16 es un modelo de lenguaje experimental de 27 356 millones de parámetros, creado por Nightmedia, un laboratorio independiente con sede en Montana (EE. UU.). Se trata de una fusión (merge) mediante mergekit de tres modelos base: nbeerbower/Wichtel-Qwen3.6-27B, armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara y nightmedia/Qwen3.8-27B-Brainwaves. El resultado es un modelo denso orientado a razonamiento, codificación, escritura creativa y roleplaying, con soporte multilingüe (inglés, chino, japonés y español) y una ventana de contexto nativa de 262 000 tokens según la documentación de LM Studio.

El modelo se distribuye en formato BF16 (54,7 GB) y cuenta con versiones cuantizadas (mxfp8, mxfp4, qx86-hi, qx64-hi) que reducen drásticamente los requisitos de memoria, así como una variante MLX para Apple Silicon. Su licencia Apache 2.0 permite uso comercial sin restricciones. Aunque el pipeline declarado es image-text-to-text, la arquitectura subyacente (qwen3_5_text) es exclusivamente de texto, por lo que la capacidad de visión no está confirmada y probablemente se trate de una etiqueta heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención por grupos de consultas (GQA), 64 capas, tamaño oculto 5120, 24 cabezas de consulta y 4 cabezas clave/valor, FFN intermedio 17408 |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativos (según LM Studio); los tags mencionan hasta 1M, sin confirmar |
| Tipos de cuantizacion | BF16 (original), mxfp8, mxfp4, qx86-hi, qx64-hi, MLX |
| Idiomas soportados | Inglés (en), chino (zh), japonés (ja), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), también disponible en MLX |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión experimental de tres modelos de la familia Qwen3.6/3.8 mediante mergekit, no de un entrenamiento desde cero. La arquitectura base corresponde a Qwen3.8-27B, que a su vez deriva de Qwen3: un transformer denso con atención por grupos de consultas (GQA) con 24 cabezas de consulta y 4 de clave/valor, 64 capas, tamaño oculto de 5120 y una capa feed-forward intermedia de 17408. Esta configuración es idéntica a la del modelo Qwen3.8-27B estándar.

Los modelos fusionados aportan capacidades distintas: Wichtel-Qwen3.6-27B contribuye con razonamiento general, Fable-Distill-Heretic-ara (una destilación de Claude 4.6) aporta habilidades de escritura creativa y narrativa, y Brainwaves (el modelo previo de Nightmedia) refuerza el rendimiento en tareas de razonamiento y codificación. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO, ya que al ser un merge no se realizó un entrenamiento adicional.

## Capacidades

- Razonamiento y chain-of-thought: soporta modos de razonamiento largo (long-CoT) y pensamiento paso a paso, según los tags del modelo.
- Generación de código: orientado a tareas de programación, con soporte para múltiples lenguajes.
- Matemáticas y STEM: capacidad para resolver problemas matemáticos y científicos.
- Escritura creativa: generación de ficción, tramas, subtramas, escenas, ciencia ficción y otros géneros narrativos.
- Roleplaying: apto para juegos de rol y conversaciones con personajes.
- Multilingüe: opera en inglés, chino, japonés y español.
- Tool calling y agentes: aunque no está explícitamente confirmado en la documentación, LM Studio lo describe como apto para tareas agénticas de largo horizonte, lo que sugiere soporte para llamadas a herramientas.
- Razonamiento configurable: permite ajustar el nivel de razonamiento según la tarea.

## Casos de uso

- Asistente de programación en producción: el modelo puede integrarse en entornos de desarrollo para generar código, revisar implementaciones y explicar fragmentos complejos. Su ventana de 262K tokens permite procesar repositorios completos o archivos de gran tamaño en una sola pasada.
- Generación de ficción y narrativa: gracias a la destilación de Claude 4.6, es adecuado para escribir novelas, cuentos, guiones y desarrollar tramas con coherencia a lo largo de capítulos extensos.
- Roleplaying y juegos de texto: puede mantener personajes consistentes y responder de forma inmersiva en conversaciones largas, aprovechando el contexto amplio para recordar detalles de la historia.
- Atención al cliente multilingüe: con soporte para cuatro idiomas y razonamiento conversacional, puede gestionar consultas de usuarios en inglés, chino, japonés y español, manteniendo el contexto de la conversación.
- Análisis de documentos extensos: su contexto de 262K tokens permite resumir, extraer información y responder preguntas sobre informes, contratos o artículos de investigación de gran longitud.
- Investigación y síntesis de conocimiento: el modelo puede combinar razonamiento paso a paso con búsqueda de información (si se integra con herramientas externas) para elaborar revisiones bibliográficas o resúmenes técnicos.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación en tareas de razonamiento de sentido común (ARC, ARC-e, BoolQ, HellaSwag, OpenBookQA, PIQA, Winogrande) para distintas cuantizaciones. Se presentan a continuación los datos del modelo completo:

| Cuantizacion | ARC | ARC-e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| BF16 | 0,731 | - | - | - | - | - | - |
| mxfp8 | 0,735 | 0,891 | 0,916 | 0,830 | 0,526 | 0,832 | 0,800 |
| qx86-hi | 0,730 | 0,887 | 0,914 | - | - | - | - |
| qx64-hi | 0,727 | - | - | - | - | - | - |
| mxfp4 | 0,730 | 0,888 | 0,917 | - | - | - | - |

Además, se reportan métricas de perplejidad, memoria pico y velocidad de generación:

| Cuantizacion | Perplejidad | Memoria pico | Tokens/seg |
|---|---|---|---|
| BF16 | 3,626 ± 0,022 | 60,75 GB | 215 |
| mxfp8 | 3,673 ± 0,022 | 34,74 GB | 170 |
| qx86-hi | 3,623 ± 0,022 | 33,25 GB | 174 |
| qx64-hi | 3,647 ± 0,022 | 27,03 GB | 174 |
| mxfp4 | 3,745 ± 0,023 | 21,30 GB | 179 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Inferencia en BF16: requiere aproximadamente 60,75 GB de memoria pico, por lo que necesita una GPU profesional como A100 80GB, H100 80GB o similar.
- Inferencia en mxfp8: 34,74 GB de memoria pico, admite GPUs como A100 40GB, RTX 6000 Ada o RTX 4090 (con 24 GB no es suficiente, se necesitaría al menos 36 GB).
- Inferencia en qx86-hi: 33,25 GB, similar al anterior.
- Inferencia en qx64-hi: 27,03 GB, requiere una GPU con al menos 28 GB (por ejemplo, A100 40GB o RTX 6000 Ada).
- Inferencia en mxfp4: 21,30 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con margen ajustado.
- Opciones de despliegue: compatible con transformers, vLLM, TGI, llama.cpp (para cuantizaciones GGUF si se generan), y MLX para Apple Silicon (versión mxfp4-mlx disponible).
- Velocidad: entre 170 y 215 tokens/segundo según la cuantización, medidos en un entorno no especificado.

## Comparativa con modelos similares

El modelo se puede comparar con sus componentes y con el Qwen3-27B original, aunque no se dispone de datos de benchmarks estandarizados para una comparación directa.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Brainwaves-WFH (este) | 27,36 B | 262K | Apache 2.0 | Merge experimental, orientado a razonamiento y creatividad |
| Qwen3-27B (original) | 27 B | 262K | Apache 2.0 | Modelo base de la familia, sin destilación creativa |
| Qwen3.8-27B-Fable-Distill-Heretic-ara | 27 B | 262K | Apache 2.0 | Destilación de Claude 4.6, enfocado en narrativa |
| nbeerbower/Wichtel-Qwen3.6-27B | 27 B | 262K | Apache 2.0 | Variante de Qwen3.6 con ajustes de razonamiento |

En las evaluaciones de sentido común, el merge muestra resultados ligeramente superiores a los de Fable-Distill-Heretic-ara (ARC 0,735 vs 0,644 en mxfp8) y comparables a Wichtel-Qwen3.6-27B (ARC 0,730 en mxfp8).

## Limitaciones y advertencias

- Modelo experimental: al ser un merge sin entrenamiento adicional, no hay garantías de robustez ni de comportamiento consistente en todos los escenarios.
- Posibles sesgos: los modelos base pueden contener sesgos sociales, culturales o de género heredados de sus datos de entrenamiento.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto ambiguo.
- Capacidad de visión no confirmada: aunque el pipeline se etiqueta como image-text-to-text, la arquitectura es de texto puro; no se debe asumir soporte de entrada de imágenes.
- Contexto largo: aunque la ventana nativa es de 262K tokens, el rendimiento puede degradarse en contextos muy largos y el coste computacional aumenta significativamente.
- Tool calling no verificado: no hay documentación explícita sobre la fiabilidad de las llamadas a funciones; se recomienda probar antes de usarlo en producción.
- Requisitos de hardware elevados en BF16: la versión sin cuantizar necesita más de 60 GB de memoria, lo que limita su uso a GPUs profesionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves-WFH-BF16
- Modelo base Brainwaves: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves
- Variante MLX cuantizada: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves-WFH-mxfp4-mlx
- Modelo base Wichtel-Qwen3.6-27B: https://huggingface.co/nbeerbower/Wichtel-Qwen3.6-27B
- Modelo base Fable-Distill-Heretic-ara: https://huggingface.co/armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara
- Ficha de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Análisis de arquitectura en HF Viewer: https://hfviewer.com/nightmedia/Qwen3.8-27B-Brainwaves
