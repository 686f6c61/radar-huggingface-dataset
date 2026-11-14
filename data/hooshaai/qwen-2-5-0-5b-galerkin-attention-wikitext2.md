# Hooshaai/qwen-2.5-0.5b-galerkin-attention-wikitext2

## Resumen

El modelo `Hooshaai/qwen-2.5-0.5b-galerkin-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha realizado una "cirugía de atención": 18 de las 24 capas del decodificador han sido sustituidas por el operador `GalerkinAttention` (atención lineal de tipo Petrov-Galerkin) de la librería NeuralOps, manteniendo las 6 capas restantes con la atención GQA nativa de Qwen2. Lo publica el usuario Hooshaai como parte del proyecto NeuralOps Attention Surgery Zoo.

El objetivo no es producir un modelo de propósito general, sino demostrar empíricamente que es posible sustituir atención softmax cuadrática por atención lineal subcuadrática en un transformer pequeño y recuperar buena parte del rendimiento mediante destilación de conocimiento en dos etapas sobre WikiText-2. Tras la cirugía, la perplejidad zero-shot se dispara a 295.128,06; tras la destilación baja a 153,16, frente a los 15,38 del profesor original.

Es relevante ahora como referencia metodológica para quienes investigan atención lineal, destilación de representaciones y técnicas de "attention surgery" en modelos compactos, no como un modelo listo para producción: la brecha de perplejidad frente al profesor (unas 10 veces) sigue siendo muy grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 con atención híbrida: 18/24 capas `GalerkinAttention` (lineal) + 6/24 capas GQA softmax nativa |
| Parametros totales | 535.364.224 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 completo, 1.021,18 MB, más un adaptador) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B (24 capas, dimensión oculta D=896, 14 cabezas de consulta, 2 cabezas KV, dimensión por cabeza 64, RoPE con theta=1.000.000). Sobre esa base se aplica una topología `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `GalerkinAttention` envuelta en un `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA original como anclas de enrutamiento contextual. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación. El operador soporta causalidad, GQA y despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 124 pasos) congela embeddings, MLPs y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), minimizando MSE por capa más 0,25·(1 − coseno) entre estados ocultos del alumno y del profesor. La etapa 2 (70% del presupuesto, 285 pasos) hace destilación end-to-end de representaciones. No se reportan RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención lineal subcuadrática en 18 de 24 capas, con soporte de enmascaramiento causal y GQA.
- Conversación multi-turno básica (pipeline `text-generation`, tag `conversational`).
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Multilingüismo limitado al inglés según el campo `language` del repositorio.

## Casos de uso

- Investigación en atención lineal: sirve como banco de pruebas reproducible para medir el impacto de sustituir softmax por `GalerkinAttention` en un transformer de 0,5B, comparando la perplejidad pre y post destilación (295.128,06 frente a 153,16).
- Estudio de destilación de representaciones: el protocolo en dos etapas (alineamiento de subespacio con backbone congelado y destilación end-to-end) es replicable y útil para experimentos de compresión de arquitecturas.
- Validación de la librería NeuralOps: permite verificar el despacho de kernels CUDA/Triton/PyTorch y el `QwenAttentionAdapter` en un caso real con GQA y RoPE.
- Prototipado de bajo coste en GPU de consumo: con 535M parámetros y pesos FP16 de ~1 GB, cabe en cualquier GPU consumer moderna para experimentos de inferencia.
- Generación de texto exploratoria en inglés: puede usarse para tareas de completado simple donde no se requiera alta calidad, asumiendo la degradación de perplejidad frente al profesor.
- Docencia y divulgación: ejemplo didáctico de "attention surgery" con telemetría completa de métricas y configuración de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos sobre WikiText-2 `wikitext-2-raw-v1`, split de validación, longitud de secuencia 512, batch_size=8, grad_accum=4, en una NVIDIA GeForce RTX 3090 de 24 GB:

| Métrica | Valor |
|---|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 |
| Perplejidad del alumno zero-shot tras la cirugía | 295.128,06 |
| Perplejidad del alumno tras destilación | 153,16 |
| Delta absoluto de perplejidad | −294.974,90 |
| Reducción relativa de perplejidad | 99,95% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB solo para pesos, más overhead de activaciones y KV cache; cómodo en GPUs con 4 GB o más.
- Pesos publicados: FP16 completo de 1.021,18 MB más un adaptador, con un repositorio total de 1,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 4 GB o más de VRAM.
- Opciones de despliegue: la librería nativa es `neuralops`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, y la atención `GalerkinAttention` requeriría soporte específico en esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (galerkin_attention) | 535M | No disponible | 153,16 (post-KD) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 tokens | No disponible | Apache 2.0 | Hugging Face |

La comparación con el profesor es la más directa: misma familia y tokenizador, pero una perplejidad aproximadamente 10 veces mayor en el checkpoint destilado. No se dispone de datos de otros modelos con atención lineal comparables en la información proporcionada.

## Limitaciones y advertencias

- Calidad degradada: la perplejidad post-destilación (153,16) es unas 10 veces superior a la del profesor (15,38), lo que indica una pérdida sustancial de modelado del lenguaje.
- El checkpoint es un artefacto de investigación, no un modelo de producción; no se recomienda su uso en aplicaciones reales sin evaluación adicional.
- Solo inglés: el campo `language` declara únicamente `en`.
- Riesgo elevado de alucinación y de generación incoherente derivado de la alta perplejidad.
- No hay datos publicados sobre sesgos; al heredar el modelo base, es probable que arrastre sesgos de Qwen2.5-0.5B, pero no se ha medido.
- La longitud de contexto efectiva no está documentada para este checkpoint; la atención lineal puede comportarse de forma distinta a la softmax en secuencias largas.
- Compatibilidad limitada: requiere la librería `neuralops` y no se garantiza funcionamiento en runtimes estándar de inferencia.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace desaconsejable ese uso sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-galerkin-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de GalerkinAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/galerkin_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
