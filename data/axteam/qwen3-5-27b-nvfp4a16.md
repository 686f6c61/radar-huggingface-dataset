# axteam/Qwen3.5-27B-NVFP4A16

## Resumen

Qwen3.5-27B-NVFP4A16 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-27B, publicada por el usuario axteam. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de aproximadamente 27.800 millones de parámetros con arquitectura híbrida que combina atención lineal (GatedDeltaNet/SSM) y atención completa, torre de visión y una cabeza de predicción multi-token (MTP). Esta versión cuantizada emplea el esquema NVFP4A16 (pesos en FP4 E2M1 con grupo de 16, escalas FP8 E4M3 y escala global FP32, activaciones en BF16) empaquetado en formato compressed-tensors para servir con vLLM.

El interés de esta ficha radica en que demuestra que una cuantización PTQ agresiva a 4 bits puede mantener la fidelidad respecto al original en tareas de conocimiento y razonamiento (MMLU 86,07 frente a 86,02 en BF16; KMMLU 69,61 frente a 69,79), reduciendo el peso en disco a unos 28,6 GB y habilitando despliegues en GPUs con menos VRAM que las necesarias para el modelo en BF16. La receta deja en BF16 aproximadamente el 32 % de los parámetros (torre de visión, proyector, cabeza MTP, embeddings, LM head, todas las RMSNorm y toda la ruta de atención lineal), lo que evita el colapso de calidad típico al cuantizar componentes SSM.

La licencia Apache-2.0 del modelo base se hereda, y el autor proporciona benchmarks medidos con lm-evaluation-harness sobre vLLM, además de métricas de fidelidad (perplejidad y acuerdo top-1) frente al original. Es relevante ahora porque la arquitectura Qwen3.5 ya está integrada en vLLM ≥ 0.17.0 y el ecosistema compressed-tensors permite cargar estos pesos sin conversión manual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet/SSM + atención completa), denso, multimodal (visión), con cabeza MTP |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | NVFP4A16: pesos FP4 (E2M1), grupo 16, escala FP8 E4M3 + escala global FP32 por tensor; activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible en la información proporcionada (los benchmarks incluyen inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que intercala capas de atención lineal (GatedDeltaNet, un mecanismo de espacio de estados con compuertas) con capas de atención completa, lo que reduce el coste computacional en secuencias largas. Incorpora además una torre de visión y proyector para entrada image-text-to-text, y una cabeza de predicción multi-token (MTP). Esta versión es una cuantización post-entrenamiento (PTQ), sin reentrenamiento: se aplica AWQ sobre un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) para proteger canales salientes antes del redondeo a FP4.

La receta mantiene en BF16 el 32 % de los parámetros: toda la ruta de atención lineal (`linear_attn.*`), la torre visual y su proyector, la cabeza MTP, embeddings, LM head y todas las RMSNorm. Los pesos `linear_attn.A_log` y `linear_attn.norm`, originalmente en FP32, se almacenan en BF16 (para `A_log` de forma sin pérdida). La revisión del 2026-11-01 restauró bit-exactamente las RMSNorm no suavizadas que llm-compressor había dejado con ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva). El tokenizador, `chat_template` y `generation_config` son idénticos al original; `config.json` añade un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat heredada del modelo base.
- Razonamiento y conocimiento general (MMLU generativo 5-shot: 86,07).
- Matemáticas y razonamiento aritmético (GSM8K 5-shot estricto: 81,43 en esta build).
- Comprensión lectora y sentido común (ARC-Challenge 0-shot: 60,84; Winogrande 5-shot: 79,64).
- Capacidades multilingües, con evaluación específica en coreano (KMMLU 69,61; HAE-RAE 75,89).
- Entrada multimodal image-text-to-text mediante torre de visión y proyector conservados en BF16.
- Cabeza de predicción multi-token (MTP) preservada en BF16, útil para decodificación especulativa.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional multilingüe: el modelo puede gestionar diálogos multi-turno en inglés y coreano con calidad cercana al original en BF16 (KMMLU 99,7 % de recuperación; HAE-RAE 98,6 %), adecuado para atención al cliente en esos idiomas.
- Análisis de documentos con imagen: al conservar la torre de visión y el proyector en BF16, permite tareas image-text-to-text (descripción de capturas, extracción de datos de formularios escaneados) sin la pérdida de calidad que supondría cuantizar el encoder visual.
- Razonamiento sobre conocimiento general en producción: con MMLU 86,07 (100,1 % de recuperación frente a BF16), es viable para sistemas de pregunta-respuesta y resumen que requieran cobertura amplia de conocimiento.
- Evaluación de modelos y benchmarking interno: al publicarse con harness reproducible (lm-evaluation-harness sobre vLLM, greedy, prompts de completion), sirve como referencia para comparar recetas de cuantización (FP8-dynamic, AWQ-8bit, NVFP4, AWQ-4bit) en las mismas condiciones.
- Despliegue en GPUs de gama alta con VRAM limitada: el peso en disco de ~28,6 GB permite servir el modelo en una sola GPU de 40-48 GB (A100 40GB, L40S, A6000) donde la versión BF16 no cabría con margen para KV cache.
- Investigación sobre cuantización de arquitecturas híbridas SSM: la decisión de mantener toda la ruta `linear_attn.*` en BF16 es un caso de estudio reproducible para quienes cuantizan modelos con componentes de espacio de estados.
- Pipelines de generación aumentada por recuperación (RAG): la fidelidad de perplejidad (+1,3 % frente a BF16) y el acuerdo top-1 del 95,6 % permiten usar el modelo en tareas de generación condicionada a contexto recuperado.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts de completion sin plantilla de chat (0- o 5-shot según fila). MMLU es la variante generativa (`mmlu_generative`), no comparable con evaluaciones por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 86,02 | 86,01 (100,0 %) | 86,05 (100,0 %) | 86,07 (100,1 %) | 86,01 (100,0 %) | 86,08 (100,1 %) |
| GSM8K (5-shot, estricto) | 37,00 | 38,06 (102,9 %) | 34,80 (94,1 %) | 81,43 (220,1 %) | 71,27 (192,6 %) | 82,87 (224,0 %) |
| ARC-Challenge (0-shot) | 61,18 | 61,69 (100,8 %) | 61,60 (100,7 %) | 60,84 (99,4 %) | 60,58 (99,0 %) | 60,84 (99,4 %) |
| Winogrande (5-shot) | 80,43 | 80,03 (99,5 %) | 80,58 (100,2 %) | 79,64 (99,0 %) | 79,48 (98,8 %) | 80,11 (99,6 %) |
| KMMLU (5-shot, directo) | 69,79 | 69,83 (100,1 %) | 69,84 (100,1 %) | 69,61 (99,7 %) | 69,19 (99,1 %) | 68,98 (98,8 %) |
| HAE-RAE (0-shot) | 76,99 | 77,36 (100,5 %) | 77,64 (100,8 %) | 75,89 (98,6 %) | 75,71 (98,3 %) | 76,44 (99,3 %) |
| Promedio | 68,57 | 68,83 (100,4 %) | 68,42 (99,8 %) | 75,58 (110,2 %) | 73,71 (107,5 %) | 75,89 (110,7 %) |
| Promedio sin GSM8K | 74,88 | 74,98 (100,1 %) | 75,14 (100,4 %) | 74,41 (99,4 %) | 74,19 (99,1 %) | 74,49 (99,5 %) |

El autor advierte que GSM8K se puntúa sobre texto generado y varía mucho entre builds del mismo modelo (34,8-82,9); tres builds cuantizadas superan ampliamente al original BF16 y la causa no se investigó (no se guardaron las salidas por pregunta), por lo que recomienda usar el promedio sin GSM8K.

Fidelidad al original BF16 en un conjunto interno mixto inglés/coreano (100 prompts, respuestas greedy BF16 puntuadas bajo cada build):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3779 | 1,3603 (+1,3 %) |
| Acuerdo top-1 siguiente token | 95,6 % | 99,3 % |

## Requisitos de hardware

- Peso en disco: ~28,6 GB (repo de 56,3 GB, que incluye pesos en otros formatos o duplicados).
- VRAM estimada para inferencia: ~28,6 GB solo de pesos; con KV cache y overhead de vLLM, se recomienda una GPU de 40-48 GB para contextos moderados.
- GPUs recomendadas: A100 40GB, L40S 48GB, RTX A6000 48GB; en H100 80GB o A100 80GB hay margen amplio para contextos largos y mayor batch.
- GPU de consumo: no confirmado en la información proporcionada; una RTX 4090 de 24 GB no cabría con los pesos completos en VRAM, aunque podría requerir offload.
- Runtime: vLLM ≥ 0.17.0 (la arquitectura está integrada); probado con vLLM 0.32.0.
- Requisitos de vLLM 0.32: Python 3.11-3.14, torch 2.13 (build CUDA 13.0), driver NVIDIA con soporte CUDA 13.
- Opciones de despliegue: vLLM (soporte nativo compressed-tensors `nvfp4-pack-quantized`); llama.cpp, Ollama y TGI no confirmados para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-NVFP4A16 (este) | 27,8 B | no disponible | NVFP4A16 (W4A16) | Apache-2.0 | Hugging Face, vLLM ≥ 0.17.0 |
| Qwen3.5-27B (BF16 original) | 27,8 B | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Qwen3.5-27B FP8-dynamic | 27,8 B | no disponible | FP8 dinámico | Apache-2.0 | Hugging Face |
| Qwen3.5-27B AWQ-8bit | 27,8 B | no disponible | AWQ 8 bits | Apache-2.0 | Hugging Face |
| Qwen3.5-27B NVFP4 | 27,8 B | no disponible | NVFP4 | Apache-2.0 | Hugging Face |
| Qwen3.5-27B AWQ-4bit | 27,8 B | no disponible | AWQ 4 bits | Apache-2.0 | Hugging Face |

Las cinco variantes cuantizadas son las comparadas en la tabla de benchmarks del autor; todas comparten arquitectura y licencia, y difieren en esquema de cuantización y recuperación de calidad. No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: perplejidad +1,3 % y acuerdo top-1 del 95,6 % frente al 99,3 % del BF16; no es una réplica exacta del original.
- El benchmark GSM8K es inestable entre builds (34,8-82,9) y el autor no investigó la causa; no debe usarse como métrica fiable de matemáticas para este modelo.
- MMLU se midió con la variante generativa de lm-evaluation-harness, no comparable con puntuaciones por log-likelihood de otras fuentes.
- El conjunto de calibración tiene predominio de coreano (256 muestras), lo que puede sesgar la protección de canales hacia ese idioma.
- Idiomas soportados no declarados oficialmente en esta ficha; los benchmarks solo cubren inglés y coreano, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en secuencias largas sin consultar la model card del modelo base.
- La revisión del 2026-11-01 restauró RMSNorm no suavizadas; las cifras de benchmarks se tomaron después de ese cambio y las de fidelidad antes, por lo que no son estrictamente contemporáneas.
- Requiere vLLM ≥ 0.17.0 y, para vLLM 0.32, CUDA 13.0 y torch 2.13; entornos con CUDA 12 no podrán servirlo con esa versión.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de sesgo o toxicidad en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de calibración por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-27B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: no disponible en la información proporcionada (referencia habitual: https://github.com/neuralmagic/compressed-tensors)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
