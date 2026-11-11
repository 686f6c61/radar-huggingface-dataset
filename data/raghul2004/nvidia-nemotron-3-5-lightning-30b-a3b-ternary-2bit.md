# raghul2004/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Ternary-2bit

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Ternary-2bit es una cuantización ternaria mixta de precisión del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicada por el usuario raghul2004. El checkpoint convierte los pesos del modelo original (63,16 GB en bfloat16) a un formato de 9,71 GB apto para Apple Silicon mediante MLX, proyectando el 93 % de los parámetros (los 29,37 B de expertos enrutados de la capa MoE) sobre estados ternarios simétricos `{-γ, 0, +γ}` empaquetados en 2 bits. No requiere kernels personalizados ni forks: funciona con `mlx-lm` estándar.

El modelo base emplea una arquitectura híbrida `nemotron_h` que combina capas Mamba-2 (state-space) con atención GQA y 23 capas de mezcla de expertos con 128 expertos enrutados por capa. La cuantización preserva en 4 bits las proyecciones de atención, los expertos compartidos, los embeddings y el `lm_head` (~2,13 B de parámetros), y mantiene en bfloat16/float32 los routers MoE, los estados SSM (`A_log`, `D`, `dt_bias`), las `conv1d` y las RMSNorm.

Su relevancia es doble: por un lado demuestra que la cuantización ternaria post-entrenamiento sin calibración puede retener capacidades de razonamiento aritmético apreciables (68 % en GSM8K); por otro, reduce un modelo de 31,58 B parámetros a un tamaño que cabe en la memoria unificada de un Mac con Apple Silicon, con un throughput declarado de ~110 tokens/s en 10,5 GB de RAM Metal activa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida `nemotron_h`: Mamba-2 (SSM) + atención GQA + MoE (23 capas, 128 expertos enrutados por capa) |
| Parametros totales | 31.577.935.872 (31,58 B) |
| Parametros activos | 3 B (denominación A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria `{-γ, 0, +γ}` empaquetada en 2 bits MLX (group_size=64, modo `ternary-lloyd`) para expertos MoE; 4-bit affine MLX (group_size=64) para proyecciones Mamba-2/atención, expertos compartidos, embeddings y `lm_head`; bfloat16/float32 para routers, estados SSM, `conv1d` y normas |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (MLX; librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Nemotron con backbone `nemotron_h`: intercala capas Mamba-2 (modelos de espacio de estados) con capas de atención con query grouping (GQA) y 23 capas de mezcla de expertos, cada una con 128 expertos enrutados y expertos compartidos. El checkpoint cuantizado no entrena ni ajusta el modelo: es una conversión post-entrenamiento (PTQ) sin datos de calibración ni QAT, realizada con la herramienta `ternary-nemo` sobre la conversión MLX del modelo BF16 original.

La innovación técnica principal es la proyección de los pesos de los expertos MoE a estados ternarios simétricos `{-γ, 0, +γ}` por grupo de 64 elementos, empaquetados en el formato `QuantizedSwitchLinear` de MLX (`bits=2`, `scale = γ`, `bias = -γ`, `q ∈ {0, 1, 2}`), con un ~45–49 % de pesos exactamente cero. Se protegen de la cuantización agresiva los componentes sensibles: routers MoE (`gate.weight`, `e_score_correction_bias`), parámetros de estado SSM (`A_log`, `D`, `dt_bias`), `conv1d` y RMSNorm quedan en bfloat16/float32; el resto de proyecciones y embeddings se cuantizan a 4 bits. No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, RLHF/DPO).

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con modo de pensamiento explícito (`<think>...</think>`).
- Razonamiento matemático y aritmético de cadena de pensamiento (evaluado en GSM8K).
- Conocimiento académico y de nivel universitario en 14 disciplinas (evaluado en MMLU-Pro).
- Razonamiento STEM de nivel doctorado sin herramientas (evaluado en GPQA Diamond).
- Capacidades de mezcla de expertos con enrutamiento disperso (3 B parámetros activos de 31,58 B totales).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 9,71 GB cabe en la memoria unificada de un Mac con 16 GB o más, permitiendo ejecutar un modelo de 31,58 B parámetros en local con `mlx-lm` estándar y sin kernels personalizados.
- Prototipado de razonamiento matemático en local: con un 68 % en GSM8K, es adecuado para asistentes de resolución de problemas aritméticos y algebraicos con cadena de pensamiento en entornos sin GPU dedicada.
- Evaluación de técnicas de cuantización: sirve como referencia práctica de PTQ ternaria sin calibración sobre arquitecturas MoE híbridas, útil para investigadores que comparan retención de capacidades frente al modelo BF16.
- Experimentación educativa y de investigación en Mac: al ejecutarse con `mlx_lm.load` y `mlx_lm.generate`, se integra en cuadernos y scripts de investigación sin infraestructura de servidor.
- Generación de texto conversacional de baja latencia: el throughput declarado de ~110 tokens/s en 10,5 GB de RAM Metal activa lo hace viable para chat interactivo en local.
- Despliegue en entornos con restricciones de memoria: para aplicaciones donde el modelo BF16 de 63,16 GB no cabe, esta versión reduce el footprint 6,5 veces manteniendo un subconjunto de capacidades de razonamiento.
- Filtrado y clasificación de conocimiento académico: con un 42 % en MMLU-Pro, puede emplearse en tareas de apoyo a la clasificación de preguntas de nivel universitario, siempre con validación humana.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados), evaluación zero-shot PTQ sin calibración en un Mac con 48 GB de memoria unificada, `mlx_lm.batch_generate`, `enable_thinking=True`, `max_tokens=2048`, `batch_size=8`:

| Benchmark | Dataset | Muestras | Ternary 2-bit (9,71 GB) | Referencia NVIDIA BF16 (63,16 GB) | Retención relativa |
|---|---|---|---|---|---|
| GSM8K (razonamiento matemático) | `openai/gsm8k` | 200 | 68,00 % (136/200) | 95,00 % | 71,6 % |
| MMLU-Pro (estratificado 14 categorías) | `TIGER-Lab/MMLU-Pro` | 200 | 42,00 % (84/200) | 81,94 % | 51,3 % |
| GPQA Diamond (STEM nivel doctorado, sin herramientas) | `fingertap/GPQA-Diamond` | 198 | 20,20 % (40/198) | 75,44 % | 26,8 % |

Rendimiento declarado: ~110 tokens/s en 10,5 GB de RAM Metal activa en un único Mac con Apple Silicon.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 9,71 GB de pesos; ~10,5 GB de RAM Metal activa según el autor. El modelo BF16 de referencia ocupa 63,16 GB.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada; la evaluación se realizó en un Mac de 48 GB. No hay datos de soporte en GPU NVIDIA/AMD para este checkpoint MLX.
- Cabe en GPU de consumo: sí, en Mac con Apple Silicon de 16 GB o más de memoria unificada (estimación a partir del tamaño de pesos; no confirmado por el autor para 16 GB).
- Opciones de despliegue: `mlx-lm` (librería declarada, `pip install -U mlx-lm`); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~110 tokens/s declarados en un Mac con Apple Silicon; sin datos de latencia por token ni de throughput en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Ternary-2bit (este) | 31,58 B (3 B activos) | no disponible | Ternaria 2-bit + 4-bit mixta | OpenMDW 1.1 | safetensors MLX |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,58 B (3 B activos) | no disponible | bfloat16 | no disponible | safetensors |
| mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-bf16 | 31,58 B (3 B activos) | no disponible | bfloat16 (MLX) | no disponible | safetensors MLX |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~30 B con cuantización ternaria) en la documentación proporcionada.

## Limitaciones y advertencias

- Degradación significativa de capacidades: la retención frente al BF16 cae al 71,6 % en GSM8K, 51,3 % en MMLU-Pro y 26,8 % en GPQA Diamond; el modelo no es adecuado para tareas STEM de alta dificultad.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado por el autor; la cuantización ternaria agresiva puede incrementar errores en razonamiento largo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Restricciones de licencia: licencia OpenMDW 1.1; deben revisarse los términos en https://openmdw.ai/license/1-1/ antes de uso comercial.
- Resultados de benchmarks no verificados (`verified: false`) y con muestras reducidas (200 preguntas en GSM8K y MMLU-Pro, 198 en GPQA Diamond); no deben tratarse como cifras oficiales.
- Dependencia de plataforma: el checkpoint está en formato MLX y orientado a Apple Silicon; no hay soporte declarado para CUDA, ROCm ni otros backends.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/raghul2004/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Ternary-2bit
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Conversión MLX base: https://huggingface.co/mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-bf16
- Herramienta de cuantización `ternary-nemo`: https://github.com/raghulchandramouli/ternary-nemo
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
