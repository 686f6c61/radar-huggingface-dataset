# axteam/MiniCPM-V-4.7-35B-A3B-FP8-dynamic

## Resumen

MiniCPM-V-4.7-35B-A3B-FP8-dynamic es una cuantización de 8 bits del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario axteam. El modelo base es un transformer multimodal de tipo Mixture of Experts (MoE) con backbone Qwen3.5-MoE, torre de visión y módulo de fusión visión-texto, orientado a tareas de image-text-to-text. Esta versión cuantizada emplea el esquema FP8_DYNAMIC de compressed-tensors (W8A8) y está pensada específicamente para servir el modelo con vLLM.

La relevancia de esta ficha radica en que reduce el peso en disco del modelo original a aproximadamente 36,9 GB manteniendo una fidelidad muy alta respecto al BF16: una recuperación media del 99,9% en los benchmarks medidos y una perplejidad solo un 1,7% superior. Esto permite desplegar un modelo multimodal de 35.212.875.824 parámetros totales en infraestructura con GPUs Ada, Hopper o Blackwell, sin recalibración (cuantización data-free) y conservando la licencia Apache-2.0 del original.

El checkpoint se publicó el 28 de octubre de 2026 y se actualizó el 2 de noviembre de 2026 con una corrección de config.json que afecta a la carga de la torre de visión en vLLM. Es un detalle crítico para producción: las revisiones anteriores a esa fecha pueden producir respuestas incorrectas ante entradas de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (backbone Qwen3.5-MoE) con torre de visión y fusión visión-texto; multimodal image-text-to-text |
| Parametros totales | 35.212.875.824 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (W8A8, FP8 E4M3 per-channel en pesos y FP8 per-token dinámico en activaciones); visión, embeddings, LM head, RMSNorms y routers MoE se mantienen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`); ~36,9 GB en disco |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con backbone MoE Qwen3.5-MoE, que combina atención (incluida atención lineal) y proyecciones MoE/MLP, junto con una torre de visión y un merger visión-texto. Esta publicación no entrena el modelo: aplica cuantización post-entrenamiento (PTQ) sin recalibración ni datos de calibración, transformando las proyecciones de atención y MoE/MLP a FP8, mientras mantiene en BF16 aproximadamente el 5% de los parámetros (torre de visión, merger, embeddings de tokens, LM head, RMSNorms y routers `mlp.gate` y `shared_expert_gate`). El tokenizer y el chat_template son idénticos a los del original.

La innovación técnica principal de esta ficha es la cuantización dinámica W8A8 con compressed-tensors, que reduce el espacio en disco y acelera la inferencia en GPUs con soporte FP8 nativo. La revisión del 2 de noviembre de 2026 corrigió los patrones de exclusión del config.json para que vLLM no cuantice la torre de visión: se añadieron `re:vpm\..*` y `re:vit_merger\..*` y se ampliaron los patrones existentes a `re:(model\.)?visual\..*`, `re:(model\.)?vision_tower\..*` y `re:(model\.)?merger\..*`. No se modificaron los pesos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal: pipeline image-text-to-text, con capacidad de describir imágenes y responder preguntas sobre ellas.
- Procesamiento de imágenes: la torre de visión se mantiene en BF16 para preservar la calidad de la representación visual.
- Razonamiento y matemáticas: los benchmarks reportados incluyen MMLU, GSM8K, ARC-Challenge, Winogrande, KMMLU y HAE-RAE, lo que evidencia capacidades de razonamiento general y aritmético.
- Capacidades multilingües: los benchmarks incluyen KMMLU (coreano) y HAE-RAE (coreano), lo que sugiere soporte al menos parcial de coreano además del inglés; el conjunto de evaluación de fidelidad es mixto inglés/coreano.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la información proporcionada.

## Casos de uso

- Descripción y análisis de imágenes en producción: el modelo puede recibir una imagen y generar descripciones o responder preguntas sobre su contenido; la torre de visión en BF16 y la corrección del config.json garantizan que las respuestas visuales sean correctas en vLLM 0.32.
- Asistencia documental con OCR y comprensión de capturas: útil para extraer información de imágenes de documentos, gráficos o pantallas, integrándose en pipelines de procesamiento por lotes.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios, aprovechando el pipeline image-text-to-text para generar etiquetas o resúmenes.
- Evaluación de calidad en entornos con restricciones de memoria: al ocupar ~36,9 GB en disco y usar FP8, permite desplegar un modelo de 35B en GPUs con 48-80 GB de VRAM, algo inviable con el BF16 original en el mismo hardware.
- Servicio de chat multimodal con vLLM: el checkpoint está diseñado para vLLM ≥ 0.32.0, lo que facilita el despliegue con batching continuo y endpoints compatibles.
- Investigación en cuantización: sirve como referencia reproducible para estudiar la fidelidad de FP8 dinámico frente a BF16, AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit en un modelo multimodal MoE.
- Evaluación multilingüe inglés/coreano: los benchmarks KMMLU y HAE-RAE permiten usar el modelo en tareas de comprensión en coreano junto con inglés.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin chat template (0 o 5-shot según la fila). MMLU es la variante generativa (`mmlu_generative`), no directamente comparable con MMLU por log-likelihood. Los porcentajes indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 85,65 | 85,61 (100,0%) | 85,71 (100,1%) | 85,76 (100,1%) | 85,41 (99,7%) | 85,31 (99,6%) |
| GSM8K (5-shot, strict) | 90,14 | 89,69 (99,5%) | 89,23 (99,0%) | 90,75 (100,7%) | 90,22 (100,1%) | 90,52 (100,4%) |
| ARC-Challenge (0-shot) | 60,92 | 61,01 (100,1%) | 61,18 (100,4%) | 60,84 (99,9%) | 61,09 (100,3%) | 62,03 (101,8%) |
| Winogrande (5-shot) | 80,11 | 79,87 (99,7%) | 78,93 (98,5%) | 79,32 (99,0%) | 77,11 (96,3%) | 79,56 (99,3%) |
| KMMLU (5-shot, direct) | 64,95 | 64,77 (99,7%) | 64,78 (99,7%) | 64,65 (99,5%) | 64,38 (99,1%) | 64,67 (99,6%) |
| HAE-RAE (0-shot) | 73,14 | 73,69 (100,8%) | 73,42 (100,4%) | 73,51 (100,5%) | 74,06 (101,3%) | 72,69 (99,4%) |
| **Media** | **75,82** | **75,77 (99,9%)** | **75,54 (99,6%)** | **75,80 (100,0%)** | **75,38 (99,4%)** | **75,80 (100,0%)** |

Evaluación de fidelidad frente al BF16 original en un conjunto interno mixto inglés/coreano de 100 prompts (respuestas greedy del BF16 original puntuadas con el mismo código):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,2269 | 1,2063 (+1,7%) |
| Acuerdo top-1 en el siguiente token | 96,0% | 98,1% |

## Requisitos de hardware

- VRAM estimada: el peso en disco es de ~36,9 GB; en FP8 se requiere al menos esa cantidad más overhead de KV cache y activaciones. No se proporciona una cifra exacta de VRAM total.
- GPUs recomendadas: NVIDIA Turing (sm75, p. ej. T4) o superior. El cálculo FP8 nativo requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere, vLLM cambia automáticamente a FP8 weight-only. V100 (sm70) no está soportado. Solo se ha probado en B200 según la model card.
- Cabe en GPU consumer: no disponible de forma explícita; por el tamaño (~36,9 GB) no cabe en GPUs consumer de 24 GB sin técnicas adicionales.
- Despliegue: vLLM ≥ 0.32.0 (probado con 0.32.0), que requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0. Para este modelo, vLLM 0.32 necesita transformers 5.18.x o 5.19.x (5.17 no conoce `minicpmv4_7`); las pruebas usaron transformers 5.21.0 instalado con `--no-deps`, solo texto, ya que la entrada de imagen falla en esa configuración.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-FP8-dynamic (este) | 35,2B totales | no disponible | 75,77 (99,9% de BF16) | Apache-2.0 | Hugging Face |
| MiniCPM-V-4.7-35B-A3B (BF16 original) | 35,2B totales | no disponible | 75,82 | Apache-2.0 | Hugging Face |
| Versión AWQ-8bit del mismo base | no disponible | no disponible | 75,54 (99,6% de BF16) | no disponible | no disponible |
| Versión NVFP4 del mismo base | no disponible | no disponible | 75,38 (99,4% de BF16) | no disponible | no disponible |

No se dispone de datos de otros modelos multimodales comparables (por ejemplo, de otros fabricantes) en la información proporcionada.

## Limitaciones y advertencias

- La revisión anterior del config.json (antes del 1 de noviembre de 2026, revisión `a1f77bb`) provocaba respuestas incorrectas con entrada de imagen en vLLM 0.32; es imprescindible descargar de nuevo `config.json` si se obtuvo el repo antes de esa fecha.
- Con vLLM 0.32.0 y transformers 5.21 el preprocesamiento de imagen falla; en la comprobación de imagen se rellenó manualmente el argumento `downsample_mode` del procesador de imagen. Para producción con imágenes se recomienda usar transformers 5.18.x o 5.19.x.
- La cuantización FP8 en Turing y Ampere se ejecuta como weight-only, con posibles diferencias de rendimiento y latencia frente a Ada/Hopper/Blackwell.
- Solo se ha probado en B200 según la model card; el comportamiento en otras GPUs no está verificado por el autor.
- No se dispone de información sobre sesgos, riesgo de alucinación, límites de contexto o idiomas soportados más allá de los benchmarks coreanos.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base y de los pesos cuantizados antes de uso comercial.
- El modelo es una cuantización; la fidelidad medida es del 99,9% de media en benchmarks, pero el acuerdo top-1 es del 96,0%, por lo que pueden aparecer divergencias en generaciones largas o creativas.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-FP8-dynamic
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
