# axteam/Qwen3.5-122B-A10B-AWQ-8bit

## Resumen

Qwen3.5-122B-A10B-AWQ-8bit es una cuantización de 8 bits del modelo multimodal Qwen3.5-122B-A10B, desarrollada por el equipo axteam para servir el modelo de forma eficiente en vLLM. Se trata de una cuantización de posentrenamiento (PTQ) con el método AWQ en esquema W8A16 (pesos INT8 simétricos con grupo de tamaño 32, activaciones en BF16), empaquetada en formato compressed-tensors `pack-quantized`. No hay reentrenamiento: se aplica una calibración ligera de 256 muestras para proteger los canales de peso más relevantes antes del redondeo.

El modelo base es un transformer híbrido de atención (atención lineal combinada con atención completa) con arquitectura Mixture-of-Experts de 256 expertos más un experto compartido, con aproximadamente 10B de parámetros activos sobre 122B totales (125.086.497.008 parámetros reales según safetensors). Incluye torre de visión, por lo que procesa entrada imagen-texto, y una cabeza de predicción multi-token (MTP). La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia práctica es que reduce el peso en disco de los pesos a unos 137,2 GB (frente a los ~269,3 GB del repositorio completo, que incluye otros artefactos), manteniendo una fidelidad muy alta respecto al original BF16: perplejidad 1,3264 frente a 1,3258 y una tasa de coincidencia top-1 del 98,2%. La revisión del 1 de noviembre de 2026 corrigió un problema de la primera subida en el que el router MoE y la compuerta del experto compartido no estaban compensados durante el suavizado AWQ, lo que desviaba tokens a expertos distintos de los del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), MoE con 256 expertos + experto compartido, multimodal (visión), cabeza MTP |
| Parametros totales | 125.086.497.008 (~125B; el nombre comercial indica 122B) |
| Parametros activos | ~10B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simétricos, grupo 32, activaciones BF16); el repo incluye además variantes FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit en la comparativa de benchmarks |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano; los benchmarks incluyen KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base combina capas de atención lineal con capas de atención completa en un esquema híbrido, y sustituye las capas feed-forward densas por un MoE de 256 expertos más un experto compartido, activando aproximadamente 10B de parámetros por token. Incorpora una torre de visión y proyector para entrada imagen-texto, y una cabeza de predicción multi-token (MTP) que puede emplearse para decodificación especulativa. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

Esta ficha corresponde a la cuantización, no al entrenamiento. El proceso AWQ es PTQ sin gradientes: se usa un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) para identificar canales salientes y compensarlos antes de redondear a INT8. Se mantienen en BF16 aproximadamente el 4% de los parámetros: torre y proyector de visión (`model.visual.*`), cabeza MTP (`mtp.*`), todas las RMSNorm, embeddings de tokens, LM head, router MoE (`mlp.gate`), compuerta del experto compartido y las partes no lineales del módulo SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`). La revisión del 1 de noviembre de 2026 añadió la compensación del router y de la compuerta del experto compartido, con una diferencia mediana por canal inferior al 2% respecto al original.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica a la del modelo original.
- Razonamiento y matemáticas: resultados medidos en MMLU (87,89 generativo 5-shot), GSM8K (84,23 estricto 5-shot) y ARC-Challenge (63,74 zero-shot).
- Comprensión multimodal imagen-texto: pipeline `image-text-to-text` con torre de visión mantenida en BF16.
- Capacidades multilingües: evaluado en KMMLU (71,67) y HAE-RAE (81,76), con calibración orientada a coreano e inglés; el resto de idiomas no está documentado.
- Cabeza de predicción multi-token (MTP) disponible para decodificación especulativa en el runtime.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: el checkpoint está diseñado específicamente para vLLM (arquitectura soportada desde vLLM ≥ 0.17.0, probado con 0.32.0) y su formato compressed-tensors permite desplegarlo con tensor parallelism en clústeres multi-GPU, reduciendo el peso de los pesos a 137,2 GB frente al BF16.
- Asistentes conversacionales con entrada de imágenes: al conservar la torre de visión en BF16, puede responder preguntas sobre capturas, documentos escaneados o fotografías dentro de un flujo de chat multi-turno.
- Evaluación de calidad de cuantizaciones en pipelines de investigación: la model card publica comparativas medidas con lm-evaluation-harness entre BF16, FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit, lo que permite elegir el esquema de cuantización según el compromiso memoria/precisión (AWQ-8bit recupera el 99,9% de la media BF16).
- Razonamiento matemático y resolución de problemas en lote: con GSM8K al 84,23 en modo estricto, es apto para generar soluciones paso a paso en pipelines offline donde el throughput importa más que la latencia interactiva.
- Tareas de conocimiento general y evaluación académica: MMLU generativo al 87,89 y Winogrande al 73,56 lo sitúan como candidato para sistemas de pregunta-respuesta sobre dominios amplios.
- Procesamiento de texto en coreano e inglés: los resultados en KMMLU y HAE-RAE indican un rendimiento sólido en coreano, útil para aplicaciones localizadas en ese mercado.
- Base para decodificación especulativa: la cabeza MTP incluida en BF16 permite acelerar la generación en runtimes que la aprovechen.

## Benchmarks y rendimiento

Medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-likelihood. Porcentajes entre paréntesis: recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 88,06 | 87,89 (99,8%) | 87,89 (99,8%) | 87,91 (99,8%) | 87,69 (99,6%) | 87,69 (99,6%) |
| GSM8K (5-shot, estricto) | 84,46 | 83,93 (99,4%) | 84,23 (99,7%) | 84,84 (100,4%) | 80,52 (95,3%) | 83,78 (99,2%) |
| ARC-Challenge (0-shot) | 63,74 | 63,91 (100,3%) | 63,74 (100,0%) | 63,40 (99,5%) | 62,71 (98,4%) | 62,80 (98,5%) |
| Winogrande (5-shot) | 73,09 | 73,24 (100,2%) | 73,56 (100,6%) | 72,77 (99,6%) | 73,16 (100,1%) | 73,01 (99,9%) |
| KMMLU (5-shot, directo) | 71,72 | 71,72 (100,0%) | 71,67 (99,9%) | 71,35 (99,5%) | 70,80 (98,7%) | 71,20 (99,3%) |
| HAE-RAE (0-shot) | 82,31 | 81,39 (98,9%) | 81,76 (99,3%) | 81,48 (99,0%) | 80,20 (97,4%) | 80,93 (98,3%) |
| **Media** | **77,23** | **77,01 (99,7%)** | **77,14 (99,9%)** | **76,96 (99,7%)** | **75,85 (98,2%)** | **76,57 (99,1%)** |

Fidelidad respecto al original BF16 en un conjunto interno mixto inglés/coreano de 100 prompts (medido con vLLM 0.32.0 el 2 de noviembre de 2026):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3264 | 1,3258 (+0,0%) |
| Coincidencia top-1 del siguiente token | 98,2% | 98,4% |

## Requisitos de hardware

- VRAM: pesos de 137,2 GB; hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y unos pocos GB para activaciones y gráficas CUDA.
- GPU: NVIDIA Turing (sm75) o superior; no requiere tensor cores especiales para INT de solo pesos. V100 (sm70) no está soportada. Solo se validó en B200.
- No cabe en GPU de consumo individual; requiere tensor parallelism (`--tensor-parallel-size N`) en varias GPU de datacenter (A100/H100/B200) para repartir los 137,2 GB de pesos.
- Software: vLLM ≥ 0.17.0 (probado con 0.32.0), que exige Python 3.11–3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (no actualizar por separado). Sin vLLM, transformers ≥5.13.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación entre los esquemas de cuantización del mismo modelo base, según los datos medidos de la model card:

| Variante | Formato | Media de benchmarks | Recuperación vs BF16 | Peso en disco |
|---|---|---|---|---|
| BF16 (original) | BF16 | 77,23 | referencia | no disponible |
| FP8-dynamic | FP8 | 77,01 | 99,7% | no disponible |
| AWQ-8bit (este repo) | INT8 W8A16 | 77,14 | 99,9% | 137,2 GB |
| NVFP4A16 | NVFP4 (pesos) | 76,96 | 99,7% | no disponible |
| NVFP4 | NVFP4 | 75,85 | 98,2% | no disponible |
| AWQ-4bit | INT4 | 76,57 | 99,1% | no disponible |

No se dispone de datos de otros modelos de la misma categoría (tamaño o tarea) en la información proporcionada.

## Limitaciones y advertencias

- La primera subida (revisión `4577464`, anterior al 1 de noviembre de 2026 a las 17:47:04 UTC) tenía el router MoE y la compuerta del experto compartido sin compensar, lo que enrutaba tokens a expertos distintos del original. Si se descargó antes de esa fecha, hay que volver a descargar.
- La calibración AWQ usó 256 muestras de un corpus mixto con predominio de coreano; el comportamiento en otros idiomas no está documentado y los idiomas soportados figuran como no disponibles.
- Los benchmarks se midieron en modo completion sin plantilla de chat; el rendimiento conversacional real puede diferir.
- MMLU se midió en variante generativa con coincidencia exacta en la primera línea, por lo que no es comparable con puntuaciones obtenidas por log-likelihood.
- La fidelidad (perplejidad y coincidencia top-1) se midió en un conjunto interno de 100 prompts inglés/coreano; no es una evaluación exhaustiva de calidad.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero aplican los del modelo base.
- El modelo base tiene 125B parámetros totales con ~10B activos; el despliegue requiere infraestructura multi-GPU de datacenter y no es viable en hardware de consumo.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del modelo base para cualquier condición adicional.
- Solo se validó en B200 con vLLM 0.32.0; el rendimiento en otras GPU (aunque soportadas por requisitos de arquitectura) no está medido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-122B-A10B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
