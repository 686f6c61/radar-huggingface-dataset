# Hooshaai/qwen-2.5-0.5b-alibi-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-alibi-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por el operador `ALiBiAttention` (Attention with Linear Biases) de la librería NeuralOps, manteniendo 6 capas con la atención GQA softmax nativa de Qwen2 como anclas de recuperación contextual. Sobre esa topología híbrida 3:1 se aplicó una destilación de conocimiento en dos etapas sobre WikiText-2. El autor es Hooshaai, dentro del proyecto NeuralOps Attention Surgery Zoo.

El interés del modelo no es su calidad como generador de texto, sino su valor como artefacto de investigación: demuestra empíricamente cuánto se degrada un transformer pequeño al reemplazar atención softmax por atención lineal con sesgos ALiBi (la perplejidad salta de 15,38 a más de 1,3 millones en zero-shot) y cuánto de ese daño se recupera mediante destilación de representaciones ocultas (hasta 95,07 de perplejidad final). Es, por tanto, una referencia útil para quien investigue atención subcuadrática, cirugía de atención o destilación de representaciones.

El modelo tiene 535.364.224 parámetros reales según safetensors, arquitectura Qwen2 de 24 capas con dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor (GQA), y licencia MIT. Está pensado exclusivamente para inglés y su uso previsto es la experimentación, no producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 con topología híbrida: 18/24 capas con `ALiBiAttention` (NeuralOps) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parámetros totales | 535.364.224 (según safetensors); el autor cita 494M para el modelo base |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens; el entrenamiento de destilación se hizo a longitud de secuencia 512) |
| Tipos de cuantización | no disponible (pesos publicados en FP16 completo, 1021,18 MB, más un adaptador) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

La base es el decoder Qwen2 de 24 bloques, dimensión oculta D=896, 14 cabezas de consulta y 2 de clave/valor con GQA, dimensión por cabeza 64. La cirugía `hybrid_3_1` reemplaza la atención en los índices de capa `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` por `ALiBiAttention` envuelta en `QwenAttentionAdapter`, y preserva la GQA softmax original en `[3, 7, 11, 15, 19, 23]`. Cada capa transplantada hereda los tensores preentrenados `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación. ALiBi aplica un sesgo aditivo por cabeza `bias[h,i,j] = -slope_h * (i - j)` en modo causal, sin embeddings posicionales; el adaptador gestiona RoPE con theta = 1.000.000.

El entrenamiento consistió en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). Etapa 1 (30 % del presupuesto, 116 pasos): solo se entrenan módulos de atención y layer norms, con embeddings, MLPs y `lm_head` congelados, AdamW a lr=2.0e-4, weight decay 0.01, clipping 1.0, AMP FP16 con pesos maestros FP32, minimizando MSE por capa más 0.25·(1 − coseno). Etapa 2 (70 %, 267 pasos): destilación extremo a extremo de todas las 24 capas con pérdida MSE + 0.50·(1 − coseno) a lr=6.0e-5. El despacho de kernels es de tres niveles (CUDA / Triton / PyTorch).

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención con GQA funcional en las 6 capas ancla y sesgos ALiBi en las 18 capas transplantadas, con soporte de despacho CUDA/Triton/PyTorch.
- Capacidad teórica de extrapolación de longitud propia de ALiBi (sin embeddings posicionales en las capas transplantadas), aunque no validada en la información disponible.
- Conversacional y text-generation según el pipeline declarado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio, thinking mode ni matemáticas avanzadas.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Investigación en atención subcuadrática: banco de pruebas reproducible para medir el impacto de sustituir softmax por ALiBi en un decoder pequeño, con línea base (15,38 PPL) y resultado post-cirugía (95,07 PPL) ya publicados.
- Estudio de destilación de representaciones: la telemetría de las dos etapas (116 y 267 pasos, pérdidas MSE+coseno) sirve como referencia para diseñar protocolos de recuperación tras cirugía de atención.
- Validación de la librería NeuralOps: ejemplo funcional del registro `ATTENTION_REGISTRY`, del `QwenAttentionAdapter` y del despacho de kernels en tres niveles.
- Experimentos de ablación de topología híbrida: comparar la proporción 3:1 (18/24) frente a otras ratios para estudiar el equilibrio entre eficiencia lineal y recuperación de induction heads.
- Docencia y divulgación: caso concreto y con números reales del coste de una intervención arquitectónica agresiva en un modelo de 0,5B.
- Pruebas de integración de formatos: verificar carga de safetensors FP16 más adaptador en pipelines de evaluación de perplejidad sobre WikiText-2.
- Reproducción de perplejidad: benchmark rápido (secuencia 512, batch 8, grad_accum 4) en hardware de consumo para validar entornos de evaluación.

## Benchmarks y rendimiento

| Métrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | GQA softmax causal, referencia |
| Perplejidad del estudiante zero-shot tras cirugía | 1.347.292,33 | Inmediatamente tras transplantar 18/24 capas |
| Perplejidad del estudiante tras destilación (WikiText-2, validación) | 95,07 | Métrica declarada por el autor, no verificada |
| Delta absoluto de perplejidad | −1.347.197,26 | Cambio logrado por destilación |
| Reducción relativa de perplejidad | 99,99 % | Recuperación desde el pico post-cirugía |

Medición sobre `wikitext-2-raw-v1` validation, longitud de secuencia 512, batch_size 8, grad_accum 4, en NVIDIA GeForce RTX 3090 24 GB. El valor de perplejidad post-destilación figura como `verified: false` en el model-index. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB solo para pesos (1021,18 MB reportados), más overhead de activaciones y caché KV; cómodo en cualquier GPU con 4 GB o más.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida para FP16; en cuantización de 8 bits o 4 bits (no publicada) cabría en menos de 1 GB.
- GPU de referencia del entrenamiento: NVIDIA GeForce RTX 3090 24 GB; el profesor no consumió VRAM gracias a la caché offline de representaciones.
- Despliegue: la librería declarada es `neuralops`, con despacho CUDA/Triton/PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura con operadores personalizados, la carga en esos motores requeriría portar `ALiBiAttention` y el `QwenAttentionAdapter`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-alibi-wikitext2` | 535M | no disponible | 95,07 (post-KD) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | ~494M | 32.768 | 15,38 | Apache 2.0 (según modelo base) | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | ~1.500M | 32.768 | no disponible | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | ~1.200M | 128.000 | no disponible | Llama 3.2 Community License | Hugging Face |

La comparación relevante es contra su propio profesor: el checkpoint destilado multiplica por más de 6 la perplejidad del original (95,07 frente a 15,38) a cambio de una topología de atención mayoritariamente lineal. No hay datos públicos de perplejidad para los modelos alternativos en la información disponible.

## Limitaciones y advertencias

- Calidad degradada de forma sustancial: la perplejidad post-destilación (95,07) sigue siendo más de seis veces la del profesor (15,38); no es un sustituto funcional del Qwen2.5-0.5B original.
- El valor de perplejidad está marcado como no verificado (`verified: false`) en el model-index.
- Solo inglés declarado; no se documenta comportamiento multilingüe.
- Entrenado y evaluado únicamente sobre WikiText-2 a longitud de secuencia 512; el comportamiento en contextos largos o dominios distintos no está validado.
- Arquitectura con operadores personalizados (`ALiBiAttention`, `QwenAttentionAdapter`) que probablemente no carga en motores de inferencia estándar (vLLM, llama.cpp, TGI) sin trabajo de portabilidad.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de 0,5B destilado sobre un corpus enciclopédico, cabe esperar conocimiento factual limitado.
- Uso comercial: la licencia MIT del checkpoint lo permite, pero conviene verificar la licencia del modelo base Qwen2.5-0.5B y las condiciones del proyecto NeuralOps.
- No apto para producción sin evaluación propia; su propósito es la investigación en atención y destilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-alibi-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación ALiBiAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/alibi.py
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
