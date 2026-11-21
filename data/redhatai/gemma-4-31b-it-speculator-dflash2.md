# RedHatAI/gemma-4-31B-it-speculator.dflash2

## Resumen

RedHatAI/gemma-4-31B-it-speculator.dflash2 es un modelo borrador (*draft model*) de decodificación especulativa diseñado para acelerar la inferencia de google/gemma-4-31B-it. No es un modelo generativo autónomo: se acopla al verificador (el modelo grande de 31B) para proponer varios tokens por paso, que el verificador acepta o rechaza en paralelo. Lo desarrolla RedHatAI y se entrena con la librería Speculators del proyecto vLLM, empleando el algoritmo DFlash2.

El borrador es compacto: 2.747.321.856 parámetros en formato safetensors (5,5 GB), construido sobre un backbone Qwen3 de 5 capas que consume estados ocultos de cinco capas concretas del verificador (ids 1, 17, 29, 47 y 59). Emplea una ventana deslizante de 2.048 tokens, tamaño de bloque de 8 y vocabulario completo del verificador (sin podar). Su relevancia radica en que reduce la latencia de un modelo de 31B sin degradar la calidad de salida, ya que la verificación garantiza exactitud equivalente a la del modelo base.

La licencia es Apache-2.0 para el borrador, si bien el verificador Gemma-4 queda sujeto a los términos propios de Google. El modelo está publicado bajo la librería `speculators` y requiere código personalizado (`custom_code`) para cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (backbone Qwen3 de 5 capas sobre Gemma4ForConditionalGeneration como verificador) |
| Parametros totales | 2.747.321.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2.048 tokens; longitud total de secuencia de entrenamiento 8.192 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (verificador Gemma-4 sujeto a licencia propia de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa de tipo DFlash2. Su backbone es un transformer Qwen3 de 5 capas que toma estados ocultos extraídos de las capas 1, 17, 29, 47 y 59 del verificador google/gemma-4-31B-it, con ventana deslizante de 2.048 tokens y 1.024 anclas máximas. El vocabulario del borrador es el completo del verificador, sin poda, y el tamaño de bloque es 8. La extracción de estados ocultos se realizó con el backend Mooncake (32 GiB de segmento global, 8 GiB de buffer local, 8 hilos de escritura) sobre 4x A100-SXM4-80GB con TP=2, DP=2, max_model_len 32.000 y gpu-memory-utilization 0,92.

El entrenamiento se llevó a cabo con la librería Speculators (ref 442ce1bf4e2f70dd0b45f36e63bd5849fbb35912, imagen base vLLM v0.29.0) sobre respuestas regeneradas de google/gemma-4-31B-it a partir de prompts de mlabonne/open-perfectblend. Se usaron 2 épocas, optimizador Muon (lr 6e-4, weight decay 0,01, muon_lr 0,001), scheduler coseno, FSDP sharding activado y gradient checkpointing desactivado, en 1 nodo con 4x A100-SXM4-80GB. La función de pérdida es mixta: 0,1 * CE + 0,9 * TV (entropía cruzada y variación total). La decodificación especulativa con `num_speculative_tokens` 7 y método `dflash` permite que el verificador valide en paralelo las propuestas del borrador.

## Capacidades

- Aceleración de inferencia del verificador google/gemma-4-31B-it mediante decodificación especulativa DFlash2.
- Generación de propuestas de tokens multi-posición (hasta 7 tokens especulativos por paso en la configuración de despliegue recomendada).
- Aceptación de tokens dependiente del dominio: tasas medias de longitud aceptada de 6,88 en math_reasoning, 6,21 en HumanEval, 5,10 en rag y 5,03 en translation.
- Integración con vLLM mediante `--speculative-config` y el método `dflash`.
- Uso del chat template heredado del verificador a través del endpoint `/chat/completions`.
- No genera texto de forma autónoma ni dispone de tool calling, visión o audio propios: esas capacidades residen en el verificador.
- Capacidades multilingües: no disponibles como dato propio del borrador; dependen del verificador.

## Casos de uso

- Servicio de chat de baja latencia con Gemma-4-31B-it: desplegar el verificador junto con este borrador en vLLM reduce el tiempo por token en cargas interactivas, manteniendo la calidad del modelo grande gracias a la verificación.
- Razonamiento matemático en producción: la alta tasa de aceptación en math_reasoning (6,88 tokens aceptados de media) lo hace especialmente adecuado para pipelines de resolución de problemas paso a paso.
- Generación de código en asistentes IDE: HumanEval muestra 6,21 tokens aceptados de media, lo que acelera autocompletado y generación de funciones en entornos de desarrollo.
- Sistemas RAG con contexto largo: con 5,10 tokens aceptados de media en rag, acelera la síntesis de respuestas sobre documentos recuperados en pipelines de búsqueda aumentada.
- Traducción automática por lotes: 5,03 tokens aceptados de media en translation, útil en servicios de traducción de alto volumen donde el throughput importa.
- Atención al cliente y agentes conversacionales: acelera conversaciones multi-turno con tool calling (4,56 tokens aceptados de media en tool_call) manteniendo la fidelidad del verificador.
- Resumenzación de documentos: 4,16 tokens aceptados de media en summarization, adecuado para pipelines de condensación de informes y actas.

## Benchmarks y rendimiento

Tasas de aceptación por posición de token (evaluación con Speculators 0.8.0 sobre vLLM 0.29.0, dataset RedHatAI/speculator_benchmarks, 200 peticiones, concurrencia máxima 16, temperatura 0, enable_thinking: true):

| Dataset | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Long. media |
|---|---|---|---|---|---|---|---|---|
| HumanEval | 93,33% | 86,27% | 79,71% | 73,61% | 67,95% | 62,67% | 57,78% | 6,21 |
| math_reasoning | 96,23% | 92,25% | 88,38% | 84,43% | 79,99% | 75,53% | 71,46% | 6,88 |
| qa | 78,86% | 61,26% | 47,40% | 37,58% | 30,73% | 25,17% | 20,59% | 4,02 |
| question | 82,31% | 65,10% | 52,27% | 42,67% | 35,90% | 30,65% | 26,26% | 4,35 |
| rag | 88,08% | 76,18% | 64,92% | 55,80% | 48,09% | 41,28% | 35,15% | 5,10 |
| summarization | 82,13% | 65,81% | 51,62% | 40,81% | 31,57% | 24,49% | 19,10% | 4,16 |
| tool_call | 84,07% | 69,21% | 56,50% | 46,84% | 38,87% | 32,89% | 27,51% | 4,56 |
| translation | 86,28% | 74,86% | 63,85% | 55,11% | 47,51% | 40,88% | 34,96% | 5,03 |
| writing | 82,26% | 65,08% | 52,14% | 42,53% | 35,80% | 30,60% | 26,22% | 4,35 |

La model card menciona una comparativa de throughput frente a interactividad entre el verificador sin speculator y con este borrador DFlash2 (7 tokens especulativos), pero los valores numéricos de esa comparativa no están completos en la información disponible.

## Requisitos de hardware

- VRAM del borrador: pesos de 2,75B parámetros en safetensors, aproximadamente 5,5 GB en precisión de entrenamiento; el requisito efectivo depende de la cuantización, no disponible en la información.
- VRAM total: debe sumarse a la del verificador google/gemma-4-31B-it, que domina el consumo.
- GPU recomendadas: la configuración de referencia usa 4x NVIDIA A100-SXM4-80GB con tensor-parallel-size 4 y draft_tensor_parallel_size 4.
- Entrenamiento validado en 4x A100-SXM4-80GB (1 nodo); hardware de validación de inferencia no registrado ("Not tracked").
- Despliegue: vLLM (versión base 0.29.0) con `--speculative-config` y método `dflash`; otras opciones (llama.cpp, Ollama, TGI) no disponibles en la información.
- Latencia y throughput: la model card referencia una comparativa de throughput frente a interactividad, pero los valores concretos no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/gemma-4-31B-it-speculator.dflash2 | 2,75B | ventana 2.048; secuencia 8.192 | Borrador especulativo para Gemma-4-31B-it | Apache-2.0 | Hugging Face (RedHatAI) |
| google/gemma-4-31B-it | 31B (no confirmado en la información) | no disponible | Verificador generativo | Términos de Google | Hugging Face (google) |
| RedHatAI/diffusiongemma-26B-A4B-it-NVFP4 | 26B (A4B, MoE) | no disponible | Modelo generativo cuantizado NVFP4 | no disponible | Hugging Face (RedHatAI) |
| RedHatAI/diffusiongemma-26B-A4B-it-FP8 | 26B (A4B, MoE) | no disponible | Modelo generativo cuantizado FP8 | no disponible | Hugging Face (RedHatAI) |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona acoplado al verificador google/gemma-4-31B-it y mediante el algoritmo DFlash2 en vLLM; no puede usarse como generador independiente.
- Requiere código personalizado (`custom_code`) y la librería `speculators`; la integración está ligada a versiones concretas (Speculators 0.8.0, vLLM 0.29.0).
- La licencia Apache-2.0 cubre el borrador, pero el verificador Gemma-4 está sujeto a los términos y licencia de Google, que pueden restringir el uso comercial del sistema completo.
- Tasas de aceptación bajas en dominios de QA abierto, question answering y summarization (longitud media aceptada de 4,02 a 4,35), lo que reduce la ganancia de aceleración en esas tareas.
- Idiomas soportados no documentados para el borrador; dependen del verificador.
- Sesgos y riesgo de alucinación: no documentados en la información disponible para el borrador; los del verificador no se detallan en esta ficha.
- Hardware de validación de inferencia no registrado ("Not tracked"), por lo que no hay garantías publicadas de rendimiento en configuraciones distintas de la recomendada.
- La evaluación se realizó con temperatura 0 y enable_thinking activado; el comportamiento con muestreo aleatorio no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/gemma-4-31B-it-speculator.dflash2
- Modelo base (verificador): https://huggingface.co/google/gemma-4-31B-it
- Librería Speculators (vLLM): https://github.com/vllm-project/speculators
- Dataset de prompts de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de respuestas regeneradas: https://huggingface.co/hf:nm-research/gemma-4-31b-it-responses-open-perfectblend
- Dataset de evaluación: RedHatAI/speculator_benchmarks (referenciado en la model card, sin URL directa disponible)
- Organización RedHatAI en Hugging Face: https://huggingface.co/RedHatAI
- Términos y licencia de Gemma: https://ai.google.dev/gemma/terms
