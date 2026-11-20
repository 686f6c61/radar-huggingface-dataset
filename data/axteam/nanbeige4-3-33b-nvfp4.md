# axteam/Nanbeige4.3-33B-NVFP4

## Resumen

Nanbeige4.3-33B-NVFP4 es una cuantización de 4 bits en formato NVFP4 (W4A4, FP4 E2M1) del modelo denso Nanbeige/Nanbeige4.3-33B, publicada por el usuario axteam para su uso con vLLM. El objetivo es reducir el peso en disco hasta aproximadamente 22,1 GB (frente a los ~66 GB que ocuparía el original en BF16) manteniendo una fidelidad alta respecto al modelo base, con una recuperación media del 99,9 % en el conjunto de benchmarks medidos.

El modelo base sigue la arquitectura Llama densa con 52 capas y está orientado exclusivamente a texto. Aunque la nomenclatura comercial indica "33B", el recuento real de parámetros en los safetensors es de 19.676.626.648 (unos 19,7 mil millones), dato que conviene tener en cuenta al planificar memoria y despliegue. La cuantización se realizó mediante post-training quantization con 256 muestras de calibración y suavizado AWQ previo al redondeo FP4.

Su relevancia actual radica en que permite servir un modelo de casi 20 mil millones de parámetros en GPUs Blackwell (B200, B300, RTX 50xx, RTX PRO 6000) aprovechando las instrucciones FP4 nativas, con una degradación de perplejidad medible pero moderada (+11,1 % en un conjunto interno EN/KO). Es una opción práctica para despliegues con requisitos de VRAM ajustados, siempre que se acepte la pérdida de calidad inherente a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama), 52 capas, solo texto |
| Parametros totales | 19.676.626.648 (~19,7 B; el nombre comercial indica 33B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (los ejemplos de uso emplean `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1, grupo 16 + escala FP8); embeddings, LM head y RMSNorms en BF16 |
| Idiomas soportados | No disponible (la model card incluye ejemplos en coreano e ingles; los benchmarks incluyen KMMLU y HAE-RAE) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de arquitectura Llama con 52 capas y ventana de texto únicamente. Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento (PTQ) sobre los pesos originales. El esquema es W4A4, con pesos en FP4 (E2M1) agrupados en bloques de 16 con escala FP8, y activaciones también en FP4. Solo se cuantizan las proyecciones de atención y MLP; los embeddings de tokens, la LM head y todas las RMSNorms se conservan en BF16. Antes del redondeo FP4 se aplica un suavizado AWQ calculado sobre un conjunto de calibración de 256 muestras.

El checkpoint se almacena en el formato `nvfp4-pack-quantized` de compressed-tensors y está pensado para servirse con vLLM (probado con la versión 0.32.0). El tokenizador y la plantilla de chat son idénticos a los del modelo original, incluyendo un modo de razonamiento ("thinking") activado por defecto en la plantilla de chat, que puede desactivarse con `chat_template_kwargs={"enable_thinking": False}`. No se detallan en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto conversacional en formato chat, con soporte de plantilla de chat compatible con la API de OpenAI en vLLM.
- Modo de razonamiento ("thinking mode") activado por defecto en la plantilla; desactivable por petición.
- Razonamiento matemático: resultados medidos en GSM8K (5-shot, strict) de 82,03 en esta cuantización.
- Conocimiento general y multilingüe parcial: benchmarks MMLU, ARC-Challenge, Winogrande, KMMLU (coreano) y HAE-RAE.
- Inferencia offline en Python mediante `vllm.LLM` y `llm.chat`.
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`).
- Soporte de KV cache en FP8 como opción de tiempo de ejecución para contextos largos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Visión o audio: no disponible (modelo solo texto).

## Casos de uso

- Servicio de chat conversacional en producción con vLLM: el modelo expone una API compatible con OpenAI y puede desplegarse con `vllm serve` sobre GPUs Blackwell, aprovechando las instrucciones FP4 nativas para reducir el coste por token frente al BF16.
- Razonamiento matemático asistido: con un 82,03 en GSM8K (5-shot strict) y una recuperación del 98,0 % respecto al original, es adecuado para resolver problemas aritméticos de varios pasos en asistentes educativos o de análisis financiero.
- Procesamiento de texto en coreano e inglés: los benchmarks KMMLU (30,17) y HAE-RAE (38,31) indican un rendimiento medido en coreano, por lo que encaja en aplicaciones de atención al cliente o resumen documental para esos idiomas.
- Despliegue con VRAM limitada: al ocupar 22,1 GB en disco, puede servirse en una sola GPU de 24 GB en escenarios con contexto moderado, o repartirse con `--tensor-parallel-size N` cuando no quepa en un único dispositivo.
- Prototipado e investigación de cuantización: sirve como referencia práctica para evaluar la degradación de NVFP4 frente a FP8, AWQ-8bit y AWQ-4bit con el mismo arnés de evaluación (lm-evaluation-harness).
- Generación de texto en lote (offline): el ejemplo de inferencia offline con `vllm.LLM` permite procesar grandes volúmenes de prompts sin servidor HTTP, útil para tareas de etiquetado, resumen o generación de datos sintéticos.
- Evaluación comparativa de modelos: al publicar resultados medidos con el mismo harness y prompts de tipo completion, es útil como punto de control en estudios de fidelidad de cuantización.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts estilo completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable directamente con MMLU por log-likelihood. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 34,89 | 35,55 (101,9 %) | 35,05 (100,5 %) | 34,84 (99,9 %) | 35,28 (101,1 %) | 32,17 (92,2 %) |
| GSM8K (5-shot, strict) | 83,70 | 83,24 (99,5 %) | 82,71 (98,8 %) | 82,34 (98,4 %) | 82,03 (98,0 %) | 84,00 (100,4 %) |
| ARC-Challenge (0-shot) | 53,16 | 53,24 (100,2 %) | 53,75 (101,1 %) | 52,13 (98,1 %) | 52,99 (99,7 %) | 52,82 (99,4 %) |
| Winogrande (5-shot) | 67,48 | 66,85 (99,1 %) | 67,17 (99,5 %) | 66,30 (98,2 %) | 66,85 (99,1 %) | 67,72 (100,4 %) |
| KMMLU (5-shot, direct) | 28,46 | 27,93 (98,1 %) | 28,40 (99,8 %) | 29,71 (104,4 %) | 30,17 (106,0 %) | 29,73 (104,5 %) |
| HAE-RAE (0-shot) | 38,22 | 37,86 (99,0 %) | 37,67 (98,6 %) | 37,31 (97,6 %) | 38,31 (100,2 %) | 38,96 (101,9 %) |
| Media | 50,98 | 50,78 (99,6 %) | 50,79 (99,6 %) | 50,44 (98,9 %) | 50,94 (99,9 %) | 50,90 (99,8 %) |

Evaluación de fidelidad sobre un conjunto interno mixto EN/KO de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3594 | 1,2232 (+11,1 %) |
| Acuerdo top-1 en siguiente token | 90,2 % | 99,1 % |

El autor advierte explícitamente de una degradación apreciable a 4 bits y recomienda preferir 8 bits (FP8 / AWQ INT8) cuando la calidad sea prioritaria.

## Requisitos de hardware

- VRAM estimada para pesos: 22,1 GB en FP4. Hay que sumar la KV cache (crece con longitud de contexto y peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPU recomendadas: B200/GB200 (sm100), B300 (sm103) y RTX 50xx / RTX PRO 6000 (sm120) para velocidad FP4 completa (W4A4). En Turing–Hopper (sm75–90) vLLM cae a FP4 solo de pesos (más lento) y emite un aviso. V100 (sm70) no está soportado. Solo se probó en B200.
- Cabe en GPU de consumo: sí, en GPUs Blackwell de 24 GB o más con contexto moderado; en tarjetas de generaciones anteriores funcionará en modo solo pesos con menor rendimiento.
- Opciones de despliegue: vLLM 0.32.0 (probado); transformers ≥4.56.0 con compressed-tensors ≥0.15.0 como alternativa sin vLLM (no probado por el autor para este modelo).
- Dependencias: Python 3.11–3.14, torch 2.13 con build CUDA 13.0 (requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Multi-GPU: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- KV cache: por defecto en BF16; puede reducirse aproximadamente a la mitad con `--kv-cache-dtype fp8`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparación con las variantes de cuantización del mismo modelo base publicadas en la model card:

| Modelo | Esquema | Pesos/activaciones | Media benchmarks | Licencia | Formato |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (BF16) | Sin cuantizar | BF16 | 50,98 | Apache 2.0 | safetensors |
| Nanbeige4.3-33B-NVFP4 (este) | NVFP4 | W4A4 FP4 | 50,94 (99,9 %) | Apache 2.0 | compressed-tensors nvfp4 |
| Variante FP8-dynamic | FP8 | FP8 | 50,78 (99,6 %) | Apache 2.0 | compressed-tensors |
| Variante AWQ-8bit | AWQ INT8 | 8 bits | 50,79 (99,6 %) | Apache 2.0 | compressed-tensors |
| Variante AWQ-4bit | AWQ INT4 | 4 bits | 50,90 (99,8 %) | Apache 2.0 | compressed-tensors |

Comparación con modelos de otros desarrolladores: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Degradación medible a 4 bits: perplejidad un 11,1 % superior al BF16 y acuerdo top-1 del 90,2 % frente al 99,1 % del original. El autor recomienda 8 bits si la calidad es crítica.
- El recuento real de parámetros (~19,7 B) difiere del "33B" del nombre comercial; planificar memoria con el dato real.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinación: no cuantificado en la informacion proporcionada; aplicable el riesgo habitual en modelos generativos de este tamaño.
- Idiomas: no se declara una lista oficial de idiomas soportados; los benchmarks cubren inglés y coreano, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto máxima: no declarada en la model card; los ejemplos usan 32.768 tokens, pero no se confirma como límite oficial.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Nanbeige/Nanbeige4.3-33B (también Apache 2.0).
- Dependencia estricta de versiones: vLLM 0.32.0, torch 2.13 con CUDA 13.0 y compressed-tensors 0.17.0; actualizar compressed-tensors por separado puede romper la carga del checkpoint (guardado con 0.19.0).
- Rendimiento FP4 completo limitado a Blackwell; en generaciones anteriores el rendimiento cae y vLLM emite advertencias.
- Solo texto: no soporta visión ni audio.
- Soporte de tool calling y agentes no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Nanbeige4.3-33B-NVFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Repositorio de vLLM: no disponible en la informacion proporcionada
- Paper del modelo base: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
