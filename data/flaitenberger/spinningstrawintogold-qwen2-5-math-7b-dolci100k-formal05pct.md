# flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Formal05pct

## Resumen

SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Formal05pct es un ajuste fino supervisado (SFT) de Qwen2.5-Math-7B, desarrollado por el investigador flaitenberger, que sustituye un 5 % de una mezcla de instrucciones de 100.000 ejemplos por problemas de deducción generados sintéticamente con derivaciones paso a paso. El objetivo del experimento es estudiar si datos sintéticos de lógica formal, generados por un programa corto y verificables por un comprobador simbólico, mejoran el razonamiento de modelos ya ajustados por instrucciones sin degradar sus capacidades generales.

El modelo base Qwen2.5-Math-7B es un transformer decoder-only de 7.615.616.512 parámetros (7,6B) con licencia Apache 2.0, especializado originalmente en matemáticas. Este ajuste conserva la arquitectura y el tokenizador, pero extiende la longitud de contexto de 4.096 a 8.192 posiciones mediante escalado YaRN de RoPE antes del entrenamiento. El resultado es un checkpoint de investigación orientado a tareas de deducción multi-paso, con pesos en bf16 safetensors y un tamaño de repositorio de 15,2 GB.

La relevancia del modelo es metodológica: forma parte de los experimentos del artículo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models* (en revisión en el momento de la publicación). El hallazgo principal es que una fracción pequeña (5-25 %) de datos de deducción formal, correctos por construcción y sin conocimiento del mundo, eleva la precisión en ProofWriter, FOLIO y subtareas multi-paso de BIG-Bench Hard, mientras que los benchmarks generales permanecen prácticamente estables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), atención completa, RoPE con escalado YaRN |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (extendido desde 4.096 con YaRN, factor 2.0) |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter SFT) de Qwen2.5-Math-7B durante una época, sobre 100.000 ejemplos de chat de un solo turno. La mezcla `Dolci100k-Formal05pct` combina 95.000 ejemplos de instrucciones de `allenai/Dolci-Instruct-SFT-No-Tools` (muestreados con semilla 3407) con 5.000 problemas de deducción generados. Los hiperparámetros son: tasa de aprendizaje 5e-06 con schedule lineal y warmup del 3 %, batch global de 128, longitud máxima de secuencia de 8.192 (el run aborta si más del 0,5 % de los objetivos se truncarían), precisión mixta bf16, FSDP con sharding completo y gradient checkpointing. La pérdida se calcula solo sobre los tokens del asistente (prompt enmascarado) usando la plantilla de chat de Qwen2.5.

Los datos sintéticos son deducciones ground de cláusulas de Horn sobre constantes abstractas (`c0`, `c1`, ...) con palabras de color, árbol y dirección, reglas encadenadas de hasta 25 capas, reglas distractoras que nunca se activan y una pregunta con cuatro respuestas candidatas. El objetivo deriva la respuesta paso a paso, en inglés o en notación formal con constantes y predicados declarados y líneas numeradas y justificadas; cada derivación pasa por un comprobador simbólico. La innovación técnica clave es que estos datos son correctos por construcción y no contienen conocimiento del mundo, lo que aísla el efecto del razonamiento deductivo puro frente al ruido de datos generados por otro modelo. El modelo base se extendió a 8.192 posiciones con YaRN (`factor: 2.0`, `original_max_position_embeddings: 4096`) antes del ajuste, y la configuración conserva ese ajuste.

## Capacidades

- Generación de texto y razonamiento deductivo multi-paso, con derivaciones formales verificables por un comprobador simbólico.
- Resolución de problemas de lógica proposicional y de primer orden (ProofWriter, FOLIO) con cadenas de hasta 25 capas de reglas.
- Razonamiento matemático (GSM8K) y generación de código (HumanEval, MBPP) heredados del ajuste sobre Dolci.
- Seguimiento de instrucciones con formato estricto (IFEval).
- Capacidad de escribir derivaciones largas en notación formal con líneas numeradas y justificadas; el artículo indica que con solo un 1 % de la mezcla el modelo ya produce derivaciones aceptadas por el verificador.
- Soporte de tool calling / function calling: no disponible de forma explícita en la model card; la mezcla usa Dolci-Instruct-SFT-No-Tools, por lo que no se entrenó con herramientas.
- Capacidades de agente y multi-step reasoning: parciales; el modelo está entrenado para cadenas de deducción, no para uso de herramientas ni planificación con entorno.
- Multilingüismo: limitado al inglés según la model card.
- Modo thinking explícito: no disponible; el razonamiento se emite como texto plano dentro de la respuesta.

## Casos de uso

- Verificación de razonamiento lógico en pipelines de datos: el modelo puede generar derivaciones paso a paso que un comprobador simbólico valida, útil para construir conjuntos de datos de lógica con garantías de corrección.
- Evaluación de sistemas de razonamiento: sirve como referencia para medir si un modelo o pipeline mejora en ProofWriter o FOLIO tras cambios en los datos de entrenamiento, dado que su comportamiento está documentado frente a un baseline de la misma ejecución.
- Investigación en datos sintéticos: permite reproducir el experimento de sustituir un 5 % de la mezcla por deducciones formales y comparar con el baseline `Dolci100k-Baseline` del mismo autor.
- Generación de explicaciones auditables en dominios de reglas: en entornos donde las decisiones se derivan de reglas encadenadas (políticas, configuraciones), el modelo puede producir la cadena de justificaciones en formato numerado.
- Asistencia en docencia de lógica formal: genera problemas y soluciones derivadas paso a paso en notación formal, con la ventaja de que las soluciones son verificables.
- Prototipado de asistentes de razonamiento en inglés: para aplicaciones de un solo turno que requieran deducción multi-paso y contexto de hasta 8.192 tokens, con despliegue en una sola GPU de 24 GB en bf16 o menor en cuantización.
- Análisis de sesgos de etiqueta en modelos de razonamiento: el artículo señala que el ajuste reduce la preferencia por una etiqueta de respuesta concreta, lo que lo hace útil para estudiar ese fenómeno.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con el baseline de la misma ejecución (`SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Baseline`):

| Benchmark | Este modelo | Baseline | Diferencia |
|---|---|---|---|
| ARC-Challenge | 43,9 | 43,9 | +0,0 |
| GSM8K | 83,6 | 83,6 | +0,0 |
| MMLU | 57,7 | 57,8 | -0,1 |
| HellaSwag | 61,4 | 61,4 | +0,0 |
| LogiQA (AGIEval) | 29,6 | 29,5 | +0,2 |
| BBH | 67,6 | 67,8 | -0,2 |
| HumanEval | 37,8 | 37,2 | +0,6 |
| MBPP | 58,6 | 57,8 | +0,8 |
| BoolQ | 76,0 | 75,9 | +0,1 |
| IFEval (strict) | 39,4 | 38,1 | +1,3 |
| RACE | 37,9 | 38,1 | -0,2 |
| SciQ | 93,9 | 94,2 | -0,3 |
| TruthfulQA-MC2 | 47,6 | 46,9 | +0,7 |
| FOLIO | 47,8 | 45,3 | +2,5 |
| GPQA-Diamond | 38,9 | 40,4 | -1,5 |
| ProofWriter depth 0, chain-of-thought | 55,2 | 57,4 | -2,2 |
| ProofWriter depth 1, chain-of-thought | 33,8 | 43,2 | -9,4 |
| ProofWriter depth 2, chain-of-thought | 39,2 | 45,8 | -6,6 |
| ProofWriter depth 3, chain-of-thought | 40,0 | 46,4 | -6,4 |
| ProofWriter depth 5, chain-of-thought | 40,8 | 42,8 | -2,0 |
| ProofWriter depth 0, direct answer | 52,8 | 51,2 | +1,6 |
| ProofWriter depth 1, direct answer | 33,8 (truncado en la fuente) | 43,2 (truncado en la fuente) | no disponible |

Nota: la model card solo muestra parcialmente la fila de ProofWriter depth 1 en modo direct answer; el resto de filas de esa columna no está disponible. Los resultados de ProofWriter con chain-of-thought de este checkpoint concreto son inferiores al baseline, mientras que el artículo reporta ganancias de 5-16 puntos en ProofWriter para el conjunto de variantes de la mezcla; esta discrepancia debe interpretarse con cautela y verificarse contra el preprint cuando esté disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB de pesos más overhead de activaciones y caché KV; en la práctica, unos 16-18 GB para secuencias cortas y más de 20 GB con contexto de 8.192 tokens.
- Cuantización a 8 bits: alrededor de 8 GB de pesos; a 4 bits (GGUF Q4_K_M, AWQ o GPTQ): alrededor de 4,5-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en bf16 con contexto completo y concurrencia; L40S o RTX 6000 Ada para servicio de una sola instancia.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado, y en RTX 3090/4080 (16-24 GB) con cuantización 8 o 4 bits; en GPUs de 12 GB solo en 4 bits y con contexto reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face), vLLM, llama.cpp y Ollama tras conversión a GGUF. El ajuste YaRN debe declararse explícitamente en el motor de inferencia para aprovechar las 8.192 posiciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Formal05pct | 7,6B | 8.192 | Apache 2.0 | SFT con 5 % de deducciones formales sintéticas | Hugging Face (flaitenberger) |
| SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Baseline | 7,6B | 8.192 | Apache 2.0 | SFT sobre Dolci100k sin deducciones | Hugging Face (flaitenberger) |
| Qwen2.5-Math-7B (base) | 7,6B | 4.096 | Apache 2.0 | Modelo base especializado en matemáticas | Hugging Face (Qwen) |
| SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds | 7,6B | 8.192 | Apache 2.0 | Conjunto de todas las semillas de la mezcla, incluida esta | Hugging Face (flaitenberger) |

No se dispone de comparación con modelos de otras familias (p. ej. Llama, Mistral) en la información proporcionada; el artículo menciona que la ganancia en ProofWriter se mantiene en 5 modelos de 3 familias entre 3B y 14B parámetros, pero no detalla los resultados por modelo.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.
- El artículo está en revisión y el enlace al preprint aún no está disponible; los resultados deben considerarse preliminares.
- En este checkpoint concreto, los resultados de ProofWriter con chain-of-thought son inferiores al baseline (hasta -9,4 puntos en depth 1), lo que contradice parcialmente el resultado agregado del artículo; conviene validar en la propia evaluación antes de usarlo.
- GPQA-Diamond baja 1,5 puntos respecto al baseline, lo que sugiere una posible pérdida de rendimiento en preguntas científicas de nivel experto.
- Riesgo de alucinación: aunque las derivaciones de entrenamiento son correctas por construcción, el modelo puede generar derivaciones plausibles pero inválidas en dominios fuera de la distribución de las cláusulas de Horn sintéticas.
- Sesgos: los datos de deducción usan un vocabulario abstracto limitado (colores, árboles, direcciones); no se han documentado evaluaciones de sesgo social o demográfico.
- No se entrenó con herramientas (mezcla Dolci-Instruct-SFT-No-Tools), por lo que el soporte de function calling es limitado o inexistente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Math-7B y los datos Dolci tienen sus propias condiciones que deben revisarse.
- El contexto de 8.192 tokens depende de que el motor de inferencia aplique correctamente el escalado YaRN; sin él, el modelo opera a 4.096 posiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Formal05pct
- Baseline de la misma ejecución: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Baseline
- Conjunto de todas las semillas: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Configuración `logic_p05` de la mezcla: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures/viewer/logic_p05
- Dataset Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-Math-7B: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Preprint del artículo: no disponible (pendiente de publicación según la model card)
