# Dratinia/qwen-reasoning-distill-a1s-s1

## Resumen

qwen-reasoning-distill-a1s-s1 es un adaptador LoRA publicado por el usuario Dratinia sobre el modelo base Qwen/Qwen3.5-2B (2.000 millones de parámetros). No es un modelo de propósito general, sino un artefacto de investigación del estudio pre-registrado qwen-reasoning-distill, que se pregunta si la destilación por SFT de las trazas de razonamiento de un profesor de mayor tamaño mejora a un modelo de 2B de forma general o solo en la distribución de entrenamiento. Corresponde al brazo A1-S, semilla 1 (el brazo A1-S tiene una sola semilla, frente a las tres del brazo A1).

El adaptador se entrena con trazas verificadas de un profesor Qwen3.8-27B en modo no-thinking, sobre problemas de matemáticas de nivel 3-5 de SimpleRL-Zoo y GSM8K-train, filtrando por respuesta correcta, ausencia de truncamiento, ausencia de repeticiones y un máximo de 2.048 tokens. El resultado son 1.043 trazas usadas en entrenamiento y un LoRA de rango 32 sobre todas las proyecciones de atención, atención lineal y MLP del modelo base.

Su relevancia es metodológica más que de producto: el autor publica los pesos para que los números reportados puedan comprobarse, y advierte explícitamente de que no es mejor que el modelo base como modelo general. Las ganancias se concentran en matemáticas de primaria dentro de la distribución (GSM8K y GSM-Symbolic) y en un razonamiento más corto, mientras que la precisión en el conjunto temporal privado no mejora de forma significativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B) con proyecciones de atención, atención lineal y MLP; adaptador LoRA acoplado a todas ellas |
| Parámetros totales | 2.000 M en el modelo base; parámetros entrenables del adaptador no disponibles (LoRA con r=32, alpha=64) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento usó secuencias de 2.048 tokens y el ejemplo de la model card configura `max_model_len=8192` en vLLM |
| Tipos de cuantización | No disponible. El adaptador se distribuye en fp16 y no está cuantizado; no se documentan versiones cuantizadas del base en la información proporcionada |
| Idiomas soportados | Inglés (entrenado únicamente con matemáticas en inglés) |
| Licencia | Apache-2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA); repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-2B y modifica todas las proyecciones de atención, atención lineal y MLP del modelo de lenguaje, lo que sugiere un modelo base con capas de atención lineal combinadas con atención estándar. El entrenamiento se hizo con Unsloth y PEFT 0.21 sobre los nombres de módulo de Qwen3.5 (`model.language_model.layers.*`); la carga con PEFT en transformers requiere la clase usada en entrenamiento, `Qwen3_5ForConditionalGeneration`. Los hiperparámetros son: r=32, alpha=64, dropout 0, fp16, secuencia de 2.048, batch efectivo 16, learning rate 1e-4 con scheduler coseno, adamw_8bit, 132 pasos de optimizador y 2 épocas sobre una única Kaggle T4. El checkpoint publicado es el de la época 2, elegido frente al de la época 1 en un conjunto de desarrollo de 150 items antes de evaluar en test.

Los datos proceden de un profesor Qwen3.8-27B en versión AWQ INT4 (cyankiwi/Qwen3.8-27B-AWQ-INT4), en modo no-thinking, con 2 muestras por prompt, temperatura 0,7 y top-p 0,8. Los prompts son 6.000 problemas muestreados con semilla 0 de un pool público descontaminado (4.500 problemas de matemáticas de nivel 3-5 de SimpleRL-Zoo y 1.500 de GSM8K-train), con el sufijo "Please reason step by step, and put your final answer within \boxed{}.". El filtrado exige que la respuesta en la caja verifique contra la respuesta dorada, que no haya truncamiento, que no exista ningún 20-grama repetido y que la traza no supere los 2.048 tokens, conservando la muestra correcta más corta por prompt; después se volvió a comprobar el solapamiento de 10-gramas con todos los conjuntos de evaluación. Quedaron 1.295 trazas verificadas de un subconjunto fijo de 1.500 prompts, de las cuales 1.043 se usaron para entrenar. No se emplearon datos de evaluación ni problemas del hold-out temporal.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso en inglés, con formato de respuesta final dentro de `\boxed{}`.
- Resolución de problemas de matemáticas escolares y de competición de nivel medio (MATH-500, GSM8K, GSM-Symbolic, JEE, AIME, HMMT en el conjunto de evaluación).
- Razonamiento más compacto que el base: reduce el truncamiento al agotar el presupuesto de tokens en el hold-out temporal del 58,4 % al 51,6 %.
- Servicio como adaptador LoRA en vLLM junto al modelo base, con `enable_lora=True` y `max_lora_rank=32`.
- Modo no-thinking (el harness de evaluación usa `enable_thinking: False`); el comportamiento en modo thinking no está documentado.
- No se entrena para seguridad, calidad de chat, uso de herramientas (tool calling) ni agentes más allá de lo que herede del modelo base; estas capacidades no se evalúan en la model card.
- Sin capacidades multimodales, de audio ni multilingües documentadas.

## Casos de uso

- Reproducción del estudio: cargar el adaptador con vLLM LoRA serving como indica la model card y verificar las cifras de las tablas de evaluación con el harness pre-registrado del repositorio.
- Línea base para nuevas variantes de post-entrenamiento: el repositorio plantea brazos posteriores (GRPO y seguimientos) con el mismo presupuesto de cómputo, y este adaptador sirve como referencia SFT del brazo A1-S.
- Investigación sobre varianza entre semillas: comparar este adaptador (una semilla) con A1 s1, s2 y s3 (tres semillas) para medir cuánto de una diferencia aparente es ruido, dado que las semillas solas dispersan 4,4 puntos en TMH y 4,6 en MATH-500.
- Estudio de longitud de razonamiento y truncamiento: analizar por qué el adaptador responde más problemas dentro del presupuesto de tokens pero con menor precisión entre los respondidos (72,7 % en el base frente a 56-68 % en los adaptadores).
- Pruebas de infraestructura de serving LoRA: validar despliegues multi-adaptador en vLLM con rango 32 y contexto de 8.192 tokens usando un adaptador pequeño (0,1 GB) sobre un base de 2B.
- Generación de trazas cortas de matemáticas en inglés para aumentar datos de SFT, siempre con verificación automática de la respuesta y filtro de repeticiones, replicando el pipeline de destilación del autor.
- Docencia y formación en metodología: ejemplo completo de estudio pre-registrado con protocolo de evaluación, hold-out temporal privado y manifiesto de procedencia.
- No es adecuado como asistente de producción, atención al cliente ni generación de código: la model card lo desaconseja explícitamente y las evaluaciones de retención no muestran mejoras.

## Benchmarks y rendimiento

Evaluación con un harness idéntico: modo no-thinking, mismo sufijo de prompt y ajustes "lite" pre-registrados. Precisión en %. TMH es un hold-out temporal privado de 321 problemas de competición publicados después del lanzamiento del modelo base (JEE Main 2026 Sesión 2, JEE Advanced 2026, AIME 2026, HMMT febrero 2026); la columna "TMH truncado" recoge el porcentaje de respuestas que agotan el presupuesto de tokens.

| Modelo | TMH | TMH truncado | MATH-500 | GSM8K | GSM-Symbolic | D_dev |
|:--|--:|--:|--:|--:|--:|--:|
| B0 (base Qwen3.5-2B) | 31,1 | 58,4 | 69,0 | 79,4 | 71,6 | - |
| A1 s1 | 30,5 | 47,4 | 66,2 | 81,1 | 74,0 | 71,0 |
| A1 s2 | 33,8 | 49,7 | 70,4 | 82,7 | 74,8 | 71,4 |
| A1 s3 | 29,4 | 51,4 | 70,8 | 82,3 | 76,2 | 70,2 |
| A1-S s1 (este adaptador) | 32,9 | 51,6 | 69,4 | 83,2 | 75,2 | 72,4 |

Retención de capacidades generales (lm-eval, ajustes lite, precisión en %):

| Modelo | MMLU-Pro | IFEval | ARC-C | BBH | HumanEval+ | MBPP+ | Media |
|:--|--:|--:|--:|--:|--:|--:|--:|
| B0 (base Qwen3.5-2B) | 50,0 | 67,1 | 72,6 | 63,7 | 45,1 | 59,5 | 59,7 |
| A1 s1 | 50,1 | 67,7 | 74,3 | 65,3 | 47,6 | 57,7 | 60,5 |
| A1 s2 | 50,4 | 66,9 | 76,5 | 65,8 | 47,6 | 61,1 | 61,4 |
| A1 s3 | 50,1 | 66,5 | 75,4 | 65,2 | 49,4 | 59,0 | 61,0 |
| A1-S s1 (este adaptador) | 49,0 | 64,1 | 76,1 | 65,9 | 45,7 | 59,3 | 60,0 |

Resumen agregado del brazo A1 sobre sus 3 semillas: +0,1 puntos en TMH, +0,1 en MATH-500, +2,6 en GSM8K, +3,4 en GSM-Symbolic y -8,9 puntos de truncamiento en TMH respecto al base; la media de retención en seis tareas se mueve menos de 2 puntos. El autor advierte de que las estadísticas pareadas por item del análisis pre-registrado aún no están calculadas y de que cada delta debe tratarse como provisional.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB en disco; el coste real está en el modelo base de 2B.
- VRAM estimada para el base, a partir de 2.000 M de parámetros (estimación, no dato publicado): unos 4,1 GB de pesos en fp16, unos 2,1 GB en int8 y alrededor de 1,2-1,5 GB en 4 bits, más la caché KV según contexto.
- Configuración de referencia del autor: una única Kaggle T4 de 16 GB para el entrenamiento (LoRA fp16, secuencia 2.048, batch efectivo 16).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB en fp16; en 4 bits cabría en GPUs de 6-8 GB, aunque esa configuración no está documentada por el autor.
- Despliegue recomendado por la model card: vLLM con `enable_lora=True`, `max_lora_rank=32`, `max_model_len=8192` y `LoRARequest`; también es posible cargarlo con transformers + PEFT usando `Qwen3_5ForConditionalGeneration`.
- Para llama.cpp u Ollama habría que fusionar el adaptador con el base y convertir a GGUF; ese flujo no está documentado ni validado en la información disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo por petición.

## Comparativa con modelos similares

Comparación con el modelo base y con los otros adaptadores del mismo estudio (mismos datos de entrenamiento y mismo harness). Los valores de parámetros y contexto del base no se detallan en la información disponible.

| Modelo | Parámetros | Contexto | TMH (%) | GSM8K (%) | MMLU-Pro (%) | Licencia | Disponibilidad |
|:--|:--|:--|--:|--:|--:|:--|:--|
| Qwen3.5-2B (base, B0) | 2.000 M | no disponible | 31,1 | 79,4 | 50,0 | Apache-2.0 | HuggingFace |
| A1 s1 (mismo estudio) | 2.000 M + LoRA r32 | no disponible | 30,5 | 81,1 | 50,1 | Apache-2.0 | HuggingFace |
| A1 s2 (mismo estudio) | 2.000 M + LoRA r32 | no disponible | 33,8 | 82,7 | 50,4 | Apache-2.0 | HuggingFace |
| A1 s3 (mismo estudio) | 2.000 M + LoRA r32 | no disponible | 29,4 | 82,3 | 50,1 | Apache-2.0 | HuggingFace |
| A1-S s1 (este adaptador) | 2.000 M + LoRA r32 | no disponible | 32,9 | 83,2 | 49,0 | Apache-2.0 | HuggingFace |

Frente a otras familias de destilados de razonamiento citadas en la búsqueda web (DistilQwen, serie DeepSeek-R1-Distill), no hay datos comparables en la información proporcionada: sus fichas y papers describen métodos y tamaños distintos, pero no se ofrecen resultados bajo el mismo harness, por lo que la comparación numérica directa no está disponible.

## Limitaciones y advertencias

- La destilación no mejora el hold-out temporal: la precisión en TMH es 32,9 % frente a 31,1 % del base, dentro del ruido entre semillas.
- Las ganancias se limitan a matemáticas escolares dentro de la distribución (GSM8K 83,2 % frente a 79,4 %; GSM-Symbolic 75,2 % frente a 71,6 %).
- El efecto más claro es un razonamiento más corto: menos truncamientos, pero peor precisión entre los problemas respondidos en TMH (72,7 % en el base frente a 56-68 % en los adaptadores).
- Una sola semilla para el brazo A1-S; las semillas por sí solas dispersan 4,4 puntos en TMH y 4,6 en MATH-500, así que las diferencias entre adaptadores individuales son en buena parte ruido.
- Todas las cifras provienen de ajustes de evaluación "lite" con límite de tiempo; las estadísticas pareadas por item del análisis pre-registrado no están calculadas.
- Solo matemáticas en inglés; no se entrena para otros idiomas ni dominios.
- No se entrena para seguridad, calidad de chat ni uso de herramientas más allá de lo heredado del base; no se evalúan estas capacidades.
- No está pensado como modelo de propósito general ni para producción; el propio autor indica que no es mejor que el base como modelo general.
- Licencia Apache-2.0, igual que el base, sin restricciones comerciales adicionales documentadas, pero sin garantías de calidad para uso comercial.
- La carga con PEFT requiere la clase `Qwen3_5ForConditionalGeneration`; usar otra clase puede provocar errores de carga.
- Riesgo de alucinación y de trazas plausibles con respuesta final incorrecta no cuantificado en la información disponible; el filtrado del entrenamiento verifica las respuestas, pero la inferencia no incluye verificador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1s-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Adaptador hermano A1 s1: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s1
- Adaptador hermano A1 s2: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s2
- Adaptador hermano A1 s3: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s3
- Repositorio con código, configuración, pre-registro (`EVAL_PROTOCOL.md`, tag `prereg-v1`), enmiendas y resultados agregados: https://github.com/Abhigyan1805/qwen-reasoning-distill
- Referencia externa sobre destilación de razonamiento en la familia Qwen (no forma parte de este estudio): https://arxiv.org/abs/2511.01354v1
- Versión EMNLP Industry de la referencia anterior: https://aclanthology.org/2025.emnlp-industry.94/
- Resumen en alphaXiv de la referencia anterior: https://www.alphaxiv.org/resources/2511.01354v1
- Seguimiento de linajes de destilación en Hugging Face (contexto de mercado, no del proyecto): https://presenc.ai/research/distillation-lineage-tracker-2026
