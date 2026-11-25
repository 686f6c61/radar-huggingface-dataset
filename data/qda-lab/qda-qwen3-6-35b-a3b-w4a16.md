# qda-lab/QDA-Qwen3.6-35B-A3B-W4A16

## Resumen

QDA-Qwen3.6-35B-A3B-W4A16 es una cuantización de 4 bits del modelo Qwen/Qwen3.6-35B-A3B, publicada por el laboratorio qda-lab. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Mixture of Experts (el tag `qwen3_5_moe` y el sufijo A3B del nombre base indican aproximadamente 3.000 millones de parámetros activos), que conserva el pipeline y las capacidades del modelo original de Qwen mientras reduce el peso de los pesos de 71,9 GB en BF16 a 22,3 GB.

La relevancia de esta ficha está en el método de cuantización: los pesos se almacenan como enteros de 4 bits en grupos de 128, cuantizados con GPTQ, y posteriormente los escalares de grupo se afinan mediante destilación desde el modelo profesor en BF16. Los routers del MoE, los expertos compartidos y la cabeza de salida se mantienen en BF16. Según la model card, el resultado retiene el 99,0 % de la precisión del BF16 y ofrece un rendimiento en tok/s superior al de otras cuantizaciones de 4 bits en vLLM.

El modelo está pensado para despliegue en producción con vLLM y SGLang sobre GPUs NVIDIA (H100, A100, RTX Pro 6000 y B200), con licencia Apache-2.0 heredada del modelo base. Incluye modo thinking, soporte multimodal de imagen y texto, y está etiquetado como compatible con endpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), tag `qwen3_5_moe` |
| Parámetros totales | 35.951.822.704 (≈35,95 B) |
| Parámetros activos | no disponible (el sufijo A3B del modelo base sugiere ≈3 B activos, no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 (pesos INT4 en grupos de 128, activaciones en BF16); GPTQ con escalares de grupo afinados por destilación |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); variante adicional para SGLang con cuantización `awq_marlin` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts, según el tag `qwen3_5_moe` de la ficha. El proceso de cuantización de qda-lab parte de la revisión `995ad96eacd98c81ed38be0c5b274b04031597b0` del modelo original y aplica GPTQ para producir pesos INT4 agrupados en bloques de 128, seguido de un ajuste por destilación de los escalares de grupo usando el modelo BF16 como profesor. Los routers del MoE, los expertos compartidos y la cabeza de salida permanecen en BF16 para preservar la estabilidad del enrutamiento y la calidad de la generación.

La receta fue seleccionada mediante búsqueda automatizada del propio framework QDA, descrito en el paper "QDA: Closed-Loop LLM Quantization Design with Agents" (arXiv:2611.23388). El proceso de construcción se ejecutó en 2× H100 de 80 GB (estudiante en una GPU y profesor en la otra), con datos de calibración y destilación publicados en el dataset `qda-lab/qda-recipe-inputs`. La model card advierte de que los pesos reconstruidos no son bit-idénticos a este checkpoint.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con cierre de razonamiento en el token `</think>`.
- Procesamiento multimodal image-text-to-text, según el pipeline declarado.
- Razonamiento matemático y científico de alto nivel (evaluado en AIME 2025, HMMT Feb 2026 y GPQA-Diamond).
- Generación de código (evaluado en LiveCodeBench).
- Seguimiento de instrucciones complejas (evaluado en IFBench).
- Conocimiento general y razonamiento multidisciplinar (evaluado en MMLU-Pro).
- Compatibilidad con endpoints y despliegue en vLLM y SGLang.
- Soporte de decodificación especulativa MTP en el modelo base (desactivada en la evaluación, pero disponible como opción).
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte explícito de tool calling o function calling: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo obtiene 89,3 en AIME 2025 en modo thinking, por lo que puede emplearse en herramientas de resolución de problemas matemáticos avanzados, verificación de demostraciones o tutoría de nivel universitario, con generación de cadenas de razonamiento largas (hasta 81.920 tokens nuevos por ítem en la evaluación).
- Generación de código en producción: con 80,1 en LiveCodeBench, es adecuado para autocompletado, revisión de código y generación de tests en pipelines de CI/CD, siempre que se integre a través de vLLM o SGLang con los kernels y librerías indicados en la model card.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con texto para extracción de información, resumen o respuesta a preguntas sobre el contenido visual.
- Asistente científico y de investigación: con 85,2 en GPQA-Diamond, sirve para responder preguntas de nivel posgrado en física, química y biología, así como para explorar hipótesis y revisar literatura técnica.
- Agentes multi-paso con contexto largo: el modelo soporta razonamiento encadenado en modo thinking y puede integrarse en orquestadores de agentes que necesiten planificación y ejecución de subtareas, aunque la longitud de contexto no está confirmada en la información disponible.
- Despliegue en infraestructura con VRAM limitada: al ocupar 22,3 GB en W4A16 frente a 71,9 GB en BF16, permite servir el modelo en una sola GPU de 80 GB con margen para KV cache, o en GPUs consumer de gama alta con cuantización adicional (no confirmado para este checkpoint).
- Evaluación comparativa de cuantizaciones: útil para equipos que necesiten medir el impacto de distintas recetas de cuantización sobre un mismo modelo base, ya que la model card publica resultados frente a AWQ-4bit de cyankiwi, AWQ de QuantTrio y ParoQuant.

## Benchmarks y rendimiento

Resultados publicados en la model card (modo thinking, pass@1 promediado sobre 1–32 semillas, misma configuración de muestreo para todos los modelos):

| Benchmark | BF16 (71,9 GB) | QDA W4A16 (22,3 GB) | cyankiwi AWQ-4bit (25,0 GB) | QuantTrio AWQ (25,5 GB) | ParoQuant (20,7 GB) |
|---|---|---|---|---|---|
| AIME 2025 | 90,0 | 89,3 | 89,5 | 89,5 | 87,9 |
| HMMT Feb 2026 | 82,7 | 81,6 | 81,4 | 81,3 | 77,6 |
| GPQA-Diamond | 85,3 | 85,2 | 85,4 | 85,4 | 84,4 |
| IFBench | 66,4 | 65,0 | 66,3 | 65,1 | 66,0 |
| MMLU-Pro | 84,9 | 84,4 | 85,1 | 84,5 | 84,2 |
| LiveCodeBench | 81,4 | 80,1 | 80,4 | 80,8 | 79,4 |
| **Media** | 81,8 | 80,9 | 81,3 | 81,1 | 79,9 |

Configuración de evaluación: máximo de tokens nuevos por ítem de 81.920 (32.768 en MMLU-Pro), temperatura 1,0, top-p 0,95, top-k 20, min-p 0, presence penalty 1,5, repetition penalty 1,0, thinking activado y decodificación especulativa MTP desactivada. La columna ParoQuant se ejecutó en su propio stack (vLLM 0.19.1 con paroquant 0.1.16 y adaptador MoE propio).

Rendimiento medido en una H100 de 80 GB, 512 tokens generados por petición, media de 2 ejecuciones: 225 tok/s con batch 1 y 2.115 tok/s con batch 16 en vLLM 0.33.0. ParoQuant: 125 tok/s con batch 1 y 1.421 tok/s con batch 16.

## Requisitos de hardware

- VRAM estimada para inferencia: 22,3 GB de pesos en W4A16, más KV cache y overhead del runtime; con contexto largo y batch grande se recomienda una GPU de 80 GB.
- GPUs recomendadas: NVIDIA H100, A100, RTX Pro 6000 y B200, según la model card.
- Cabe en GPU consumer: no confirmado en la información proporcionada; el tamaño de pesos (22,3 GB) excede la VRAM de la mayoría de GPUs consumer de 24 GB una vez añadido el KV cache, por lo que el despliegue cómodo requiere 40–80 GB.
- Opciones de despliegue: vLLM (`VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3.6-35B-A3B-W4A16`), SGLang (variante `QDA-Qwen3.6-35B-A3B-W4A16-SGLang` con `--quantization awq_marlin`), transformers. No se menciona soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: 225 tok/s con batch 1 y 2.115 tok/s con batch 16 en H100 80 GB con vLLM 0.33.0.
- Nota de despliegue: en H100 y H200 sin CUDA 13 en el sistema, el kernel falla al compilar (`failed to open libnvrtc-builtins.so.13.0`); hay que añadir las librerías NVIDIA del entorno virtual a `LD_LIBRARY_PATH` antes de arrancar.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño en disco | Cuantización | Media en benchmarks | Licencia |
|---|---|---|---|---|---|
| QDA-Qwen3.6-35B-A3B-W4A16 | 35,95 B (MoE) | 22,3 GB | W4A16 (GPTQ + destilación) | 80,9 | Apache-2.0 |
| cyankiwi AWQ-4bit | mismo base | 25,0 GB | AWQ 4 bits | 81,3 | no disponible |
| QuantTrio AWQ | mismo base | 25,5 GB | AWQ 4 bits | 81,1 | no disponible |
| ParoQuant | mismo base | 20,7 GB | 4 bits (stack propio) | 79,9 | no disponible |

Los cuatro modelos parten del mismo Qwen/Qwen3.6-35B-A3B, por lo que la comparación se centra en el trade-off entre tamaño, precisión retenida y throughput. QDA ocupa un punto intermedio en tamaño con la segunda mejor media y el mejor resultado en HMMT Feb 2026 (81,6). No se dispone de datos de contexto ni de idiomas para ninguna de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de precisión media de 0,9 puntos respecto al BF16 (81,8 → 80,9); la mayor caída se observa en IFBench (66,4 → 65,0) y LiveCodeBench (81,4 → 80,1).
- Los routers del MoE, los expertos compartidos y la cabeza de salida se mantienen en BF16, por lo que el ahorro de memoria no es proporcional al de un modelo denso equivalente.
- La model card no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo; se desconoce la lista de idiomas soportados.
- La longitud de contexto no está indicada en la información disponible, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- El despliegue en vLLM requiere desactivar `MacheteLinearKernel` y, en H100/H200 sin CUDA 13, ajustar `LD_LIBRARY_PATH`; en SGLang es necesario usar la variante específica con `awq_marlin`.
- La reconstrucción de los pesos a partir de la receta no es bit-idéntica al checkpoint publicado, lo que puede afectar a la reproducibilidad exacta de los resultados.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial, pero conviene revisar las condiciones del modelo original Qwen3.6-35B-A3B.
- La evaluación se realizó con decodificación especulativa MTP desactivada; el rendimiento en producción con MTP activado no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante para SGLang: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W4A16-SGLang
- Dataset de receta e inputs: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Receta YAML: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.6-35B-A3B-W4A16/qwen3.6-35b-a3b-w4a16.yaml
- Repositorio del framework QDA: https://github.com/humanfia/qda
- Paper: https://arxiv.org/abs/2611.23388
