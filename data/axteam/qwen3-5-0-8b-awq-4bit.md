# axteam/Qwen3.5-0.8B-AWQ-4bit

## Resumen

Qwen3.5-0.8B-AWQ-4bit es una cuantización de 4 bits (W4A16) del modelo multimodal Qwen/Qwen3.5-0.8B, publicada por axteam para servir inferencia eficiente con vLLM. Se trata de un modelo denso de 852.985.920 parámetros (aproximadamente 0,85 mil millones) con arquitectura híbrida que combina atención lineal y atención completa, incorpora una torre de visión y una cabeza de predicción multi-token (MTP). El resultado es un checkpoint de unos 1,0 GB en disco que mantiene capacidades de texto e imagen-texto.

El modelo base resuelve tareas de generación de texto, razonamiento básico y comprensión de imágenes en un rango de tamaño muy pequeño, lo que lo hace adecuado para despliegues con recursos limitados, prototipado rápido y entornos de borde. La cuantización AWQ INT4 reduce el peso a una cuarta parte del original en BF16, a costa de una degradación medible en calidad: la recuperación media frente al original BF16 es del 95,6 % según las mediciones del autor.

La relevancia de esta ficha radica en que documenta con transparencia el coste real de cuantizar a 4 bits un modelo denso tan pequeño: el autor advierte explícitamente de que la perplexity sube un 10,9 % y recomienda builds de 8 bits (FP8 o AWQ INT8) cuando la calidad es prioritaria. La licencia Apache-2.0 facilita el uso comercial, y el soporte nativo en vLLM ≥ 0.17.0 lo integra en pipelines de servicio estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + atención completa), densa, multimodal (visión), con cabeza MTP |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16 (pesos INT4 asimétricos, grupo 32, escala BF16 + zero-point INT4; activaciones BF16); el repo base dispone de FP8-dynamic, AWQ-8bit, NVFP4A16 y NVFP4 |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano; los benchmarks incluyen KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized` (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura transformer híbrida que alterna capas de atención lineal con capas de atención completa, un patrón habitual para reducir el coste de memoria del KV cache en contextos largos. Es un modelo denso (no MoE) de 0,85 mil millones de parámetros que incorpora una torre de visión y un proyector para entrada image-text-to-text, además de una cabeza de predicción multi-token (MTP) que permite decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

Esta publicación concreta es una cuantización post-entrenamiento (PTQ) sin reentrenamiento. AWQ protege los canales de pesos más salientes mediante un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) antes del redondeo. Se mantienen en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del SSM (`linear_attn.conv1d/A_log/dt_bias`), lo que supone aproximadamente el 43 % de los parámetros del build. La revisión del 2026-11-01 restauró de forma bit-exacta los pesos RMSNorm no suavizados desde el original, corrigiendo el ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva) que había introducido el manejo de offset-norm de llm-compressor.

## Capacidades

- Generación de texto conversacional y razonamiento básico, con soporte de plantilla de chat idéntica al modelo original.
- Comprensión de imágenes y texto (pipeline image-text-to-text) mediante la torre de visión y el proyector, mantenidos en BF16.
- Decodificación especulativa mediante la cabeza de predicción multi-token (MTP).
- Capacidades multilingües: no documentadas explícitamente; los benchmarks del autor incluyen evaluación en coreano (KMMLU, HAE-RAE) además de inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Prototipado rápido de asistentes multimodales: con 1,0 GB de pesos, el modelo cabe en GPUs de consumo y permite iterar sobre prompts y plantillas de chat sin aprovisionar hardware dedicado.
- Servicio de inferencia en vLLM con múltiples réplicas: el bajo peso en disco y el soporte de `--tensor-parallel-size` facilitan el despliegue en clústeres pequeños o en GPUs de gama media para tareas de clasificación y resumen de texto e imagen.
- Descripción automática de imágenes en pipelines de catalogación: la torre de visión en BF16 permite generar descripciones y etiquetas para lotes de imágenes en entornos con presupuesto de memoria ajustado.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye mediciones de FP8, AWQ-8bit, NVFP4 y AWQ-4bit con el mismo harness, lo que lo convierte en un banco de pruebas útil para estudiar la degradación por cuantización en modelos densos pequeños.
- Filtrado y moderación de contenido a gran escala: el coste por token es bajo, lo que permite procesar volúmenes altos de texto con un modelo de 0,85 mil millones de parámetros.
- Educación e investigación: sirve como ejemplo reproducible de cuantización AWQ con compressed-tensors y de los compromisos entre precisión y fidelidad en modelos multimodales pequeños.

## Benchmarks y rendimiento

Mediciones del autor con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts estilo completion sin plantilla de chat (0 o 5 shots según la fila). MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones obtenidas por log-likelihood. Los porcentajes entre paréntesis indican la recuperación frente al original BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 50,56 | 50,50 (99,9 %) | 50,31 (99,5 %) | 48,39 (95,7 %) | 46,36 (91,7 %) | 48,55 (96,0 %) |
| GSM8K (5-shot, estricto) | 32,68 | 29,80 (91,2 %) | 32,30 (98,8 %) | 29,49 (90,3 %) | 22,82 (69,8 %) | 28,20 (86,3 %) |
| ARC-Challenge (0-shot) | 37,54 | 36,52 (97,3 %) | 37,46 (99,8 %) | 35,07 (93,4 %) | 33,11 (88,2 %) | 35,15 (93,6 %) |
| Winogrande (5-shot) | 56,27 | 55,49 (98,6 %) | 56,67 (100,7 %) | 55,80 (99,2 %) | 55,64 (98,9 %) | 55,88 (99,3 %) |
| KMMLU (5-shot, directo) | 34,54 | 34,22 (99,1 %) | 34,20 (99,0 %) | 35,02 (101,4 %) | 33,51 (97,0 %) | 35,74 (103,5 %) |
| HAE-RAE (0-shot) | 37,03 | 35,29 (95,3 %) | 36,30 (98,0 %) | 34,10 (92,1 %) | 27,31 (73,8 %) | 34,28 (92,6 %) |
| **Media** | **41,44** | **40,30 (97,3 %)** | **41,21 (99,4 %)** | **39,65 (95,7 %)** | **36,46 (88,0 %)** | **39,63 (95,6 %)** |

Fidelidad frente al original BF16 en un conjunto interno mixto inglés/coreano de 100 prompts, con respuestas greedy del BF16 como referencia:

| Métrica | Este modelo | Original BF16 |
|---|---|---|
| Perplexity (menor es más cercano) | 2,2372 | 2,0174 (+10,9 %) |
| Acuerdo top-1 en el siguiente token | 84,8 % | 98,7 % |

## Requisitos de hardware

- VRAM estimada para inferencia: 1,0 GB solo para pesos; hay que añadir el KV cache (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs recomendadas: NVIDIA Turing (sm75) o posterior; no se necesita hardware específico de tensor cores para INT de solo pesos. V100 (sm70) no está soportada.
- GPU de consumo: sí cabe en GPUs de consumo modernas con al menos 4-6 GB de VRAM efectiva considerando KV cache y activaciones; el autor solo reporta pruebas en B200.
- Opciones de despliegue: vLLM (arquitectura incluida desde vLLM ≥ 0.17.0; probado con vLLM 0.32.0, que requiere Python 3.11-3.14, torch 2.13 con CUDA 13.0, transformers ≥ 5.16.1,< 5.20 y compressed-tensors 0.17.0 fijado). Sin vLLM, transformers ≥ 5.2.0 con compressed-tensors ≥ 0.15.0. No requiere `trust_remote_code`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-0.8B-AWQ-4bit | 852.985.920 | no disponible | AWQ INT4 W4A16 | Apache-2.0 | Hugging Face (252 descargas) |
| Qwen/Qwen3.5-0.8B (BF16) | 852.985.920 | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B FP8-dynamic | 852.985.920 | no disponible | FP8 dinámico | Apache-2.0 | Variante del mismo autor |
| Qwen3.5-0.8B AWQ-8bit | 852.985.920 | no disponible | AWQ INT8 | Apache-2.0 | Variante del mismo autor |

La comparación relevante es interna: frente al BF16 original, este build recupera el 95,6 % de media en benchmarks y pierde 10,9 % de perplexity; frente a AWQ-8bit (99,4 % de recuperación) y FP8-dynamic (97,3 %), el coste de calidad de 4 bits es claramente mayor. No se dispone de datos de modelos de otros fabricantes con los que comparar en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad medible: la recuperación media es del 95,6 % y la perplexity sube un 10,9 % frente al BF16; el propio autor recomienda builds de 8 bits para producción.
- GSM8K cae al 86,3 % de recuperación (28,20 frente a 32,68), lo que indica pérdida apreciable en razonamiento matemático.
- Riesgo de alucinación inherente a un modelo de 0,85 mil millones de parámetros; los benchmarks absolutos son bajos (MMLU generativo 48,55), por lo que no es adecuado para tareas que exijan alta precisión factual.
- Idiomas soportados no documentados; la calibración AWQ usó un corpus con predominio de coreano, lo que puede sesgar la preservación de canales hacia ese idioma.
- Longitud de contexto no disponible en la información proporcionada; debe consultarse la model card del modelo base.
- La revisión del 2026-11-01 restauró las RMSNorm no suavizadas, pero las mediciones de la model card se tomaron antes de ese cambio.
- Requiere versiones muy específicas de vLLM, torch, transformers y compressed-tensors; no actualizar compressed-tensors por separado (0.17.0 lee el checkpoint guardado con 0.19.0).
- No soportada en V100 (sm70); requiere Turing o posterior.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base Qwen/Qwen3.5-0.8B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-0.8B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
