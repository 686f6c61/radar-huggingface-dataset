# elisepaul/Qwen3.8-Flash-Next-Deepseek-4.1-Flash-reasoning-frankenREAP-NVFP4-One-Dgx-Spark

## Resumen

`Qwen3.8-Flash-Reasoning-NVFP4-One-Spark` es un modelo fundacional de tipo Mixture-of-Experts (MoE) heterogéneo publicado por el usuario elisepaul en Hugging Face. Se construye fusionando dos linajes arquitectónicos distintos: la topología base del modelo de código `Qwen3.8-Flash-Next-NVFP4-Coder-Lean` (448 expertos enrutados de codificación) y un subconjunto de 64 expertos de razonamiento algorítmico extraídos de `DeepSeek-V4.1-Flash-1017` mediante la técnica REAP (Router-weighted Expert Activation Pruning). El resultado es un MoE de 512 expertos enrutados distribuidos en 40 capas MoE más 8 capas densas, con 131.711.817.584 parámetros totales.

El modelo está cuantizado de forma nativa en NVFP4 (formato FP4 E2M1 con escalas de bloque FP8 de 16 elementos) mediante NVIDIA ModelOpt, y está específicamente optimizado para ejecutarse en un único nodo NVIDIA DGX Spark (GB10 Blackwell con 128 GiB de memoria unificada LPDDR5x). Incorpora además una cabeza de decodificación especulativa MTP (Multi-Token Prediction) de 4 tokens. Su propuesta de valor es ofrecer, en un solo dispositivo de memoria unificada, capacidades combinadas de generación de código, comprensión de APIs, ejecución en terminal y razonamiento de cadena de pensamiento.

La relevancia del modelo radica en su enfoque de integración: para fusionar expertos de linajes distintos resuelve la divergencia de base de coordenadas mediante alineamiento de representación con Procrustes ortogonal y mitiga el desbordamiento de ganancia residual con escalado de atenuación geométrica. Es un trabajo de investigación sobre merging de MoE más que un modelo de producción consolidado, con solo 330 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) heterogéneo, transformer con 40 capas MoE y 8 capas densas; expertos fusionados de dos linajes (Qwen3.8 y DeepSeek-V4.1) |
| Parametros totales | 131.711.817.584 (131,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 nativo (E2M1 FP4 con escalas de bloque FP8 de 16 elementos); se mencionan también MXFP8 y FP8 en los tags |
| Idiomas soportados | en, zh, code |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (11 shards activos, 300.982 tensores indexados) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de 448 expertos enrutados de codificación (procedentes de `Qwen3.8-Flash-Next-NVFP4-Coder-Lean`, con \(d_{model}=2560\) y \(d_{int}=640\)), 8 capas densas superiores, 1 experto compartido de backbone y residuales con HyperConnections de 4 flujos con compuerta. Sobre esa base se injertan 64 expertos de razonamiento de `DeepSeek-V4.1-Flash-1017` (\(d_{model}=5120\), \(d_{int}=2304\)), seleccionados mediante ranking de saliencia REAP sobre 403 tareas de codificación, terminal y verificación algorítmica. El total es de 512 expertos enrutados por capa en 40 capas MoE.

No se especifica en la información disponible el volumen de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el modelo es fundamentalmente una fusión de pesos (model merging), no un entrenamiento desde cero. La innovación técnica principal es el procedimiento de alineamiento: al transplantar expertos de un linaje con distinta base de coordenadas, se aplica alineamiento de representación con Procrustes ortogonal para corregir la divergencia de base y escalado de atenuación geométrica para evitar el desbordamiento de ganancia residual, de modo que el híbrido opere en un espacio latente coherente. Incluye además una cabeza especulativa MTP de 4 tokens para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento de cadena de pensamiento (chain-of-thought, "deep thinking").
- Generación de código, comprensión de APIs y ejecución en terminal (linaje coder de Qwen3.8).
- Razonamiento algorítmico y verificación matemática (expertos donantes de DeepSeek-V4.1).
- Decodificación especulativa mediante cabeza MTP de 4 tokens.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: orientado a tareas de tipo agente (tags "agent", "swe-bench"), aunque sin detalles de implementación.
- Capacidades multilingües limitadas a inglés, chino y código.
- Capacidades especiales: cuantización NVFP4 nativa y despliegue optimizado para memoria unificada de DGX Spark.

## Casos de uso

- Asistencia de código en un solo nodo DGX Spark: el modelo puede generar y completar código en inglés y chino aprovechando los 448 expertos de codificación del linaje Qwen3.8, sin necesidad de GPU de centro de datos adicional.
- Razonamiento algorítmico y resolución de problemas matemáticos: los 64 expertos donantes de DeepSeek-V4.1 aportan cadena de pensamiento para tareas de verificación y matemáticas, como refleja el resultado declarado en MATH-500.
- Agentes de terminal y automatización de tareas de ingeniería: los tags "swe-bench" y "terminal" sugieren uso en flujos de resolución de issues y ejecución de comandos, aunque la validación empírica publicada es limitada.
- Prototipado e investigación en merging de MoE: el modelo sirve como caso de estudio reproducible de transplantación de expertos entre linajes con Procrustes ortogonal y atenuación geométrica.
- Inferencia de bajo consumo en hardware Blackwell: al estar cuantizado en NVFP4 y ocupar 77,65 GiB en disco, permite desplegar un modelo de 131,7 B en un único dispositivo de memoria unificada de 128 GiB.
- Experimentación con decodificación especulativa: la cabeza MTP de 4 tokens permite medir aceleraciones de generación en vLLM con FlashInfer sobre GB10.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| MATH-500 | Accuracy | 96,6 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, SWE-bench) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 76,12 GiB residentes en motor, 22,64 GiB de caché KV y 22,64 GiB de margen, sobre 121,63 GiB direccionables; huella en disco de 77,65 GiB (11 shards safetensors).
- Hardware objetivo: NVIDIA DGX Spark (GB10 Blackwell, 128 GiB de memoria unificada LPDDR5x, sin swap).
- GPU recomendadas: DGX Spark GB10; no se documenta compatibilidad con A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; el diseño está atado a memoria unificada de 128 GiB, por lo que no cabe en GPUs de consumo convencionales de 24-48 GB.
- Opciones de despliegue: vLLM con FlashInfer (librería declarada); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se menciona decodificación especulativa MTP de 4 tokens pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Reasoning-NVFP4-One-Spark | 131,7 B (MoE, 512 expertos) | no disponible | nvidia-open-model-license | Hugging Face (330 descargas) |
| Qwen3.8-Flash-Next-NVFP4-Coder-Lean | no disponible | no disponible | no disponible | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (NVFP4) | no disponible | no disponible | no disponible | Hugging Face (nvidia) |
| DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | Hugging Face (deepseek-ai) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con validación limitada: solo 1 like y 330 descargas; el benchmark MATH-500 (96,6) está declarado por el autor y marcado como no verificado.
- Fusión de linajes con bases de coordenadas distintas: aunque se aplica Procrustes ortogonal y atenuación geométrica, el propio autor documenta el "fallo de transplantación zero-shot" como reto de integración, lo que implica riesgo de degradación en dominios no cubiertos por las 403 tareas de selección.
- Idiomas limitados a inglés, chino y código; sin soporte documentado de castellano.
- Longitud de contexto no documentada, lo que dificulta planificar cargas de trabajo de contexto largo.
- Licencia `nvidia-open-model-license`: conviene revisar sus términos antes de uso comercial, ya que impone condiciones específicas y el modelo base es de NVIDIA.
- Hardware muy específico: el despliegue está optimizado para DGX Spark GB10 con memoria unificada; no hay garantías de funcionamiento en otras plataformas.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de factualidad ni de sesgos.
- Parámetros activos no declarados, lo que impide estimar con precisión el coste computacional por token.

## Enlaces

- Hugging Face: https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-Deepseek-4.1-Flash-reasoning-frankenREAP-NVFP4-One-Dgx-Spark
- Modelo base Qwen3.8-Flash-Next-NVFP4-Coder-Lean: https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Donante DeepSeek-V4.1-Flash-1017-NVFP4: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Modelo base DeepSeek-V4.1-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Dataset SWE-bench Lite: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Paper DeepSeek-V3 (arxiv:2412.19437): https://arxiv.org/abs/2412.19437
- Paper DeepSeek-V2 (arxiv:2409.19606): https://arxiv.org/abs/2409.19606
- Paper Mixtral (arxiv:2404.19737): https://arxiv.org/abs/2404.19737
- Paper Qwen2.5 (arxiv:2412.15115): https://arxiv.org/abs/2412.15115
- Paper FlashAttention (arxiv:2307.08691): https://arxiv.org/abs/2307.08691
- Paper (arxiv:2312.06635): https://arxiv.org/abs/2312.06635
- Paper (arxiv:2403.13257): https://arxiv.org/abs/2403.13257
