# axteam/Qwen3.5-2B-NVFP4A16

## Resumen

Qwen3.5-2B-NVFP4A16 es una versión cuantizada a 4 bits del modelo multimodal Qwen/Qwen3.5-2B, publicada por el usuario axteam. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un transformer híbrido de atención lineal y atención completa, denso, de aproximadamente 2.213 millones de parámetros, con capacidad de visión y un cabezal de predicción multi-token (MTP). Esta variante aplica cuantización post-entrenamiento NVFP4A16 (W4A16): pesos en FP4 (E2M1) con grupo de 16, escala FP8 E4M3 y escala global FP32 por tensor, mientras las activaciones permanecen en BF16.

El objetivo de esta publicación es facilitar el despliegue eficiente en vLLM: el checkpoint ocupa unos 3,1 GB en disco frente a los aproximadamente 6,1 GB del repositorio, y mantiene en BF16 las partes sensibles a la cuantización (torre de visión, proyector, cabezal MTP, RMSNorms, embeddings, LM head y toda la ruta de atención lineal GatedDeltaNet/SSM), que suman cerca del 56 % de los parámetros. La calibración se hizo con 256 muestras de un corpus mixto con predominio de coreano, sin reentrenamiento.

Es relevante ahora porque demuestra que un modelo multimodal de 2B puede servirse en GPUs NVIDIA desde Turing (sm75) en adelante con pesos FP4 sin necesidad de tensor cores FP4, conservando en promedio el 98,3 % del rendimiento del original BF16 según las mediciones del autor, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet/SSM + atención completa), denso, multimodal (visión), con cabezal MTP |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo de 16, escala FP8 E4M3 + escala global FP32 por tensor; activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida que combina capas de atención lineal basadas en GatedDeltaNet (modelo de espacio de estados) con capas de atención completa, además de una torre de visión para entrada de imagen y texto y un cabezal de predicción multi-token (MTP). Esta variante no reentrena el modelo: es cuantización post-entrenamiento (PTQ) mediante AWQ, que utiliza un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) sin gradientes para proteger los canales de peso más relevantes antes del redondeo a FP4.

La decisión técnica más destacable es el reparto selectivo de precisión: toda la ruta `linear_attn.*` (GatedDeltaNet/SSM) se mantiene en BF16 porque FP4 resulta demasiado grueso para esos pesos, y también se preservan en BF16 la torre de visión y el proyector (`model.visual.*`), el cabezal MTP (`mtp.*`), los RMSNorms, los embeddings de tokens y el LM head. En la revisión del 2026-11-01 se restauraron de forma bit-exacta los pesos RMSNorm no suavizados desde el original, corrigiendo el ruido de redondeo BF16 (como máximo 0,4 % en la ganancia efectiva) que había dejado el manejo de offset-norm de llm-compressor. El tokenizador, el `chat_template` y las configuraciones de preprocesado son idénticos al original; `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat idéntica al modelo original.
- Comprensión de imagen y texto (pipeline `image-text-to-text`): la torre de visión y el proyector se mantienen en BF16, por lo que la capacidad multimodal se preserva.
- Razonamiento y resolución de problemas de matemáticas (evaluado en GSM8K).
- Conocimiento general y académico multilingüe, con rendimiento medido en MMLU, ARC-Challenge, Winogrande, KMMLU (coreano) y HAE-RAE (coreano).
- Predicción multi-token (cabezal MTP), útil para decodificación especulativa en el runtime.
- Capacidad de atención lineal eficiente gracias a la ruta GatedDeltaNet/SSM mantenida en BF16.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo acepta entradas de imagen y texto y puede desplegarse como servidor compatible con la API de OpenAI mediante `vllm serve axteam/Qwen3.5-2B-NVFP4A16 --max-model-len 32768`, lo que permite integrarlo en aplicaciones conversacionales con contexto de hasta 32.768 tokens en la configuración de ejemplo.
- Descripción y análisis de imágenes en flujos de trabajo: al conservar la torre de visión en BF16, es adecuado para tareas de image-text-to-text como etiquetado, extracción de información de capturas o asistencia visual en herramientas internas.
- Despliegue en GPUs de gama media o antiguas: al ser pesos FP4 con solo 3,1 GB, cabe en GPUs NVIDIA desde Turing (sm75) en adelante sin tensor cores FP4, lo que permite servir el modelo en hardware que no admitiría la versión BF16 completa.
- Evaluación comparativa de técnicas de cuantización: los benchmarks publicados (MMLU, GSM8K, ARC-Challenge, Winogrande, KMMLU, HAE-RAE) frente a FP8-dynamic, AWQ-8bit, NVFP4 y AWQ-4bit lo convierten en una referencia útil para decidir qué esquema de cuantización adoptar en un pipeline.
- Asistencia en coreano e inglés: la calibración incluye un corpus con predominio de coreano y se reportan métricas específicas en KMMLU y HAE-RAE, por lo que encaja en aplicaciones bilingües coreano-inglés.
- Prototipado rápido y entornos con VRAM limitada: con 3,1 GB de pesos más caché KV y unos pocos GB para activaciones y CUDA graphs, permite levantar un endpoint de inferencia en una sola GPU consumer de forma económica.
- Investigación sobre fidelidad de cuantización: las métricas de perplejidad (1,9269 frente a 1,8515 del BF16) y acuerdo top-1 (89,8 %) sirven para estudiar el impacto de NVFP4A16 en modelos híbridos SSM.

## Benchmarks y rendimiento

Mediciones del autor con lm-evaluation-harness sobre vLLM, greedy, prompts de tipo completion sin plantilla de chat. MMLU es la variante generativa de lm-eval y no es directamente comparable con puntuaciones MMLU obtenidas por log-likelihood. Los porcentajes indican recuperación respecto al original BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 53,33 | 48,18 (90,3 %) | 53,54 (100,4 %) | 54,27 (101,8 %) | 55,22 (103,5 %) | 60,38 (113,2 %) |
| GSM8K (5-shot, estricto) | 58,23 | 56,63 (97,3 %) | 56,56 (97,1 %) | 54,51 (93,6 %) | 51,71 (88,8 %) | 54,06 (92,8 %) |
| ARC-Challenge (0-shot) | 41,47 | 41,98 (101,2 %) | 41,30 (99,6 %) | 41,04 (99,0 %) | 39,51 (95,3 %) | 39,59 (95,5 %) |
| Winogrande (5-shot) | 64,56 | 63,22 (97,9 %) | 64,48 (99,9 %) | 64,48 (99,9 %) | 61,09 (94,6 %) | 62,51 (96,8 %) |
| KMMLU (5-shot, directo) | 43,29 | 42,58 (98,4 %) | 43,20 (99,8 %) | 42,01 (97,1 %) | 41,14 (95,0 %) | 42,10 (97,3 %) |
| HAE-RAE (0-shot) | 45,65 | 45,00 (98,6 %) | 45,10 (98,8 %) | 44,91 (98,4 %) | 42,07 (92,2 %) | 41,06 (90,0 %) |
| Media | 51,09 | 49,60 (97,1 %) | 50,70 (99,2 %) | 50,21 (98,3 %) | 48,46 (94,8 %) | 49,95 (97,8 %) |

Evaluación de fidelidad al original BF16 sobre un conjunto interno mixto inglés/coreano (100 prompts, respuestas greedy del BF16 puntuadas bajo cada build, mismo harness):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,9269 | 1,8515 (+4,1 %) |
| Acuerdo top-1 en siguiente token | 89,8 % | 98,9 % |

Estas métricas miden fidelidad al modelo base, no puntuaciones absolutas de tarea.

## Requisitos de hardware

- VRAM estimada: pesos de 3,1 GB; añadir caché KV (crece con longitud de contexto × peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPU recomendadas: NVIDIA Turing (sm75) o superior; no se requiere tensor cores FP4. V100 (sm70) no está soportada. Solo se probó en B200 según el autor.
- Cabe en GPU consumer: sí, gracias a los 3,1 GB de pesos, en GPUs NVIDIA consumer desde Turing en adelante; el modelo no necesita FP4 tensor cores.
- Opciones de despliegue: vLLM (arquitectura disponible en vLLM ≥ 0.17.0; probado con vLLM 0.32.0), o transformers ≥ 5.2.0 con compressed-tensors ≥ 0.15.0 sin vLLM.
- Requisitos de entorno para vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, controlador NVIDIA con soporte CUDA 13), transformers ≥ 5.16.1,<5.20 y compressed-tensors 0.17.0 (fijados por vLLM; no actualizar por separado).
- Multi-GPU: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B (BF16, base) | 2,21 B | no disponible | safetensors BF16 | Apache-2.0 | Hugging Face |
| Qwen3.5-2B FP8-dynamic | 2,21 B | no disponible | FP8 dinámico | Apache-2.0 | Referenciado en benchmarks del autor |
| Qwen3.5-2B AWQ-8bit | 2,21 B | no disponible | AWQ 8 bits | Apache-2.0 | Referenciado en benchmarks del autor |
| Qwen3.5-2B NVFP4 | 2,21 B | no disponible | NVFP4 | Apache-2.0 | Referenciado en benchmarks del autor |
| Qwen3.5-2B AWQ-4bit | 2,21 B | no disponible | AWQ 4 bits | Apache-2.0 | Referenciado en benchmarks del autor |
| Qwen3.5-2B-NVFP4A16 (este) | 2,21 B | no disponible | NVFP4A16 W4A16 | Apache-2.0 | Hugging Face |

En rendimiento medio, este modelo (50,21) queda ligeramente por debajo de AWQ-8bit (50,70) y por encima de NVFP4 (48,46); en MMLU generativo supera al original BF16 (54,27 frente a 53,33), mientras que en GSM8K pierde algo más (54,51 frente a 58,23). No se dispone de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce pérdida de fidelidad: perplejidad +4,1 % y acuerdo top-1 del 89,8 % frente al 98,9 % del BF16; en GSM8K la recuperación cae al 93,6 %.
- Las mediciones de la model card se tomaron antes de la revisión del 2026-11-01 que restauró los RMSNorm no suavizados, por lo que no reflejan ese cambio.
- El conjunto de calibración tiene predominio de coreano, lo que puede sesgar el comportamiento en otros idiomas; no se declaran los idiomas soportados.
- Riesgo de alucinación: no se documenta en la información proporcionada; debe asumirse el habitual en modelos generativos de 2B.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto: la longitud de contexto nativa no se especifica; el ejemplo de despliegue limita a 32.768 tokens.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución; el enlace de licencia apunta al repositorio del modelo base.
- Dependencia estricta de versiones: vLLM 0.32.0 requiere compressed-tensors 0.17.0 y transformers ≥ 5.16.1,<5.20; actualizar compressed-tensors por separado puede romper la carga del checkpoint guardado con 0.19.0.
- Compatibilidad de hardware limitada: V100 (sm70) no está soportada; solo se validó en B200, por lo que el rendimiento en otras GPUs no está verificado empíricamente.
- El repositorio no incluye `generation_config.json` porque el original tampoco lo trae.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-2B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: no disponible como enlace en la información proporcionada
- compressed-tensors: no disponible como enlace en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
