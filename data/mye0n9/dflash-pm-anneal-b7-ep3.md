# Mye0n9/DFlash-PM-anneal-b7-ep3

## Resumen

DFlash-PM-anneal-b7-ep3 es un modelo borrador (draft model) para decodificación especulativa, desarrollado por el usuario Mye0n9 en el contexto del estudio LongDSpec sobre borradores de denoising multi-paso. No es un modelo generativo autónomo: se usa como acompañante de Qwen/Qwen3-8B, que actúa como modelo objetivo (target), para acelerar la inferencia mediante la propuesta de bloques de tokens que el modelo grande verifica después.

El modelo se ha afinado a partir de `deepseek-ai/dflash_qwen3_8b_block7`, un borrador de tipo diffusion-drafter liberado por DeepSeek que trabaja con bloques de 7 tokens y consume los estados ocultos de 5 capas del modelo objetivo. La innovación principal de esta variante es el esquema PartialMask: durante el entrenamiento, cada bloque se presenta a veces completamente enmascarado (all-[MASK]) y a veces con parte de sus tokens visibles, de modo que el borrador aprende a denoising en varios pasos y a aceptar un arranque en caliente (warm start).

Con 2.293.286.144 parámetros y un repositorio de 27,5 GB, se trata de un modelo de tamaño medio pensado exclusivamente para servir como acelerador de Qwen3-8B. Su relevancia es de nicho pero técnica: permite reducir la latencia de decodificación de un modelo de 8B sin alterar su distribución de salida, siempre que se integre en el stack DeepSpec.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion drafter (borrador de denoising por bloques) sobre base Qwen3, con integración de estados ocultos del modelo objetivo |
| Parametros totales | 2.293.286.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 4096) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa de tipo diffusion-drafter. Trabaja con bloques de tamaño 7 (`block_size = 7`) y un factor `gamma = 4.0`, y recibe como entrada los estados ocultos de 5 capas del modelo objetivo Qwen/Qwen3-8B. La tarea base es la del borrador liberado: denoising de bloques completamente enmascarados (all-[MASK]). La variante PartialMask introduce una modificación: con probabilidad `p_full` el bloque se presenta íntegramente enmascarado, y en caso contrario cada posición muestra su token verdadero con probabilidad `1 - t` (con `t` muestreada uniformemente en [0,1]); las etiquetas visibles se excluyen de la pérdida. Esto permite al borrador aceptar un warm start y refinar el bloque en varios pasos.

El entrenamiento parte de `deepseek-ai/dflash_qwen3_8b_block7` y usa prompts de `mlabonne/open-perfectblend` (conversaciones user-first, deduplicadas y decontaminadas con n-gramas de 8 contra MT-Bench, GSM8K, HumanEval, MATH-500 y MBPP), con respuestas regeneradas por Qwen3-8B en modo non-thinking (temperatura 0,7, top-p 0,8, top-k 20, máximo 4096 tokens). Los hiperparámetros principales son: `p_full` inicial 1.0 con decaimiento hasta `p_full_end` 0.25, learning rate 1e-4, warmup 0.04, 3 épocas, acumulación 16, micro-batch 1, `max_batch_tokens` 16384 y semilla 20261118. Se ejecutaron 18.567 pasos en una única RTX PRO 6000. La curva publicada muestra que la aceptación media en modo full-mask se mantiene en torno a 4,3-4,5 tokens por bloque en held-out, mientras que la pérdida de entrenamiento (trainmix) desciende de forma sostenida.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa con Qwen/Qwen3-8B como modelo objetivo.
- Denoising de bloques de 7 tokens con soporte de múltiples pasos y warm start gracias a PartialMask.
- Aceptación de bloques parcialmente visibles, lo que permite reutilizar contexto ya generado.
- Integración como drop-in replacement del borrador DFlash original mediante `Qwen3DSparkModel.from_pretrained` (DeepSpec).
- No es un modelo de chat, razonamiento, código ni matemáticas por sí mismo: no genera respuestas finales de forma autónoma.
- No dispone de tool calling, capacidades de agente ni multimodalidad.
- Capacidades multilingües: no disponibles como modelo independiente; hereda el comportamiento del objetivo solo a través del borrador.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: sustituir el borrador DFlash original por este checkpoint en el stack DeepSpec para reducir la latencia por token generado en despliegues de chat o asistentes.
- Servidores de generación de texto de alta concurrencia: al proponer bloques de hasta 7 tokens verificados por el modelo grande, disminuye el número de pasos de decodificación y mejora el throughput agregado en vLLM o TGI con soporte de decodificación especulativa.
- Investigación en decodificación especulativa: la curva de entrenamiento publicada y el esquema PartialMask permiten estudiar el compromiso entre aceptación media (en torno a 4,3-4,5 tokens por bloque) y pérdida de entrenamiento.
- Experimentos de warm start en borradores de difusión: útil para analizar cómo afecta mostrar tokens parcialmente visibles al denoising multi-paso frente al esquema all-[MASK] del modelo base.
- Evaluación comparativa de borradores: permite medir aceptación y latencia frente a `deepseek-ai/dflash_qwen3_8b_block7` con el mismo objetivo Qwen3-8B.
- Pipelines de generación por lotes (batch offline): la reducción de pasos de decodificación se traduce en menor coste de GPU por lote en tareas de resumen o extracción sobre corpus grandes.
- Reproducción de estudios de LongDSpec: el checkpoint y los hiperparámetros publicados permiten replicar y extender el análisis con datos de `mlabonne/open-perfectblend`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente métricas internas de entrenamiento y validación (teacher-forced) sobre 64 secuencias held-out y 64 de entrenamiento fijas:

| Metrica (held-out) | Valor inicial (step 0) | Valor final publicado (step 8400) |
|---|---|---|
| accept_len full-mask | 4,5249 | 4,3805 |
| CE full-mask | 0,9677 | 0,9921 |
| CE trainmix | 1,0251 | 0,9117 |

La aceptación media se mantiene estable en torno a 4,3-4,5 tokens por bloque, mientras que la pérdida en la mezcla de entrenamiento desciende de 1,0251 a 0,9117. No hay datos de latencia, throughput ni comparación con otros borradores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,29 mil millones de parámetros, en FP16 requeriría aproximadamente 4,6 GB solo para pesos, más los estados ocultos de 5 capas de Qwen3-8B que se pasan como entrada; en cuantización de 8 bits bajaría a unos 2,3 GB y en 4 bits a unos 1,2 GB, aunque no se documentan formatos cuantizados.
- GPU recomendadas: el entrenamiento se realizó en una RTX PRO 6000; para inferencia se necesita además cargar Qwen3-8B como objetivo, por lo que se recomienda una GPU con al menos 24 GB (RTX 4090, L4, A10G) o superior (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: sí, junto con el modelo objetivo en cuantización, aunque el requisito conjunto (objetivo 8B + borrador 2,3B) exige planificación de memoria.
- Opciones de despliegue: el stack DeepSpec con `Qwen3DSparkModel.from_pretrained`; la integración con vLLM, llama.cpp, Ollama o TGI no está documentada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFlash-PM-anneal-b7-ep3 | 2,29B | no disponible (entrenado a 4096) | Borrador especulativo para Qwen3-8B | no disponible | Hugging Face (0 descargas) |
| deepseek-ai/dflash_qwen3_8b_block7 | no disponible | no disponible | Borrador especulativo base para Qwen3-8B | no disponible | Hugging Face (modelo base) |
| Qwen/Qwen3-8B | 8B | no disponible en esta ficha | Modelo generativo objetivo | no disponible en esta ficha | Hugging Face |

La comparación con otros borradores especulativos de la misma categoría (por ejemplo, EAGLE o Medusa) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como borrador junto a Qwen/Qwen3-8B; no produce respuestas finales por sí mismo.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido.
- El repositorio registra 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación externa ni de uso en producción.
- La model card no documenta sesgos, tasas de alucinación ni comportamiento multilingüe.
- Los datos de entrenamiento provienen de `mlabonne/open-perfectblend` con respuestas regeneradas por Qwen3-8B en modo non-thinking; el borrador hereda las limitaciones de ese corpus y del modo de generación.
- La aceptación media en held-out (en torno a 4,3-4,5 tokens por bloque) es una métrica teacher-forced; el rendimiento real en decodificación libre puede diferir.
- El esquema PartialMask con `p_full_end` 0.25 implica que el modelo está optimizado para bloques parcialmente visibles, lo que puede comportarse de forma distinta al uso all-[MASK] del borrador original.
- No se documentan formatos cuantizados ni soporte en frameworks de despliegue habituales, lo que limita su adopción directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mye0n9/DFlash-PM-anneal-b7-ep3
- Modelo base: https://huggingface.co/deepseek-ai/dflash_qwen3_8b_block7
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de prompts: https://huggingface.co/datasets/mlabonne/open-perfectblend
