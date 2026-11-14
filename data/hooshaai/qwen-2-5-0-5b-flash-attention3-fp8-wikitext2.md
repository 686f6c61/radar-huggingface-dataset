# Hooshaai/qwen-2.5-0.5b-flash-attention3-fp8-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-flash-attention3-fp8-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps "Attention Surgery Zoo". No es un modelo entrenado desde cero, sino una intervención quirúrgica sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención del decoder (esquema híbrido 3:1) por el operador `flash_attention3_fp8` de la librería NeuralOps, que implementa atención multi-cabeza acelerada en FP8 (e4m3fn) mediante kernels FlashAttention-3 en GPUs Hopper (SM 9.0+) y cae a PyTorch SDPA en hardware anterior o CPU.

Tras el transplante, el modelo sufre un colapso severo de perplejidad (de 15,38 en el profesor a 1.198.067,61 en el alumno recién operado) y se recupera parcialmente mediante una destilación de conocimiento en dos etapas sobre WikiText-2, alcanzando una perplejidad de 426,76. Es, por tanto, un artefacto de investigación sobre técnicas de atención subcuadrática y cirugía de atención, no un modelo listo para producción.

Su relevancia es metodológica: documenta de forma transparente el coste de sustituir atención softmax preentrenada por operadores alternativos en modelos compactos, y el grado de recuperación que permite la destilación de representaciones ocultas. El modelo base tiene 494M parámetros según la model card (535.364.224 tensores reales en safetensors), 24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor (GQA).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen2) con cirugía de atención híbrida 3:1: 18/24 capas con `FlashAttention3FP8` y 6/24 capas con GQA softmax nativa |
| Parametros totales | 535.364.224 (494M según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no declara contexto para este checkpoint) |
| Tipos de cuantizacion | Pesos completos en FP16 (1021,18 MB) más adaptador; el operador de atención usa FP8 (e4m3fn) en cómputo |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `neuralops`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (24 bloques decoder, D=896, H_q=14, H_kv=2, d_h=64, RoPE con theta=1.000.000). La cirugía reemplaza la atención en los índices de capa `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` por `flash_attention3_fp8` envuelto en `QwenAttentionAdapter`, mientras que las capas `[3, 7, 11, 15, 19, 23]` conservan la atención GQA softmax preentrenada como anclas de enrutamiento contextual. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas. El operador soporta atención causal autorregresiva, GQA y un despacho de kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 121 pasos) congela embeddings, MLPs y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr=2,0e-4, weight decay 0,01, clipping 1,0), pesos maestros FP32 y AMP FP16, minimizando MSE por capa más 0,25·(1 − coseno) entre estados ocultos del alumno y del profesor. La etapa 2 (70% del presupuesto, 279 pasos) realiza destilación end-to-end de representaciones; la información proporcionada se interrumpe en ese punto y no detalla más hiperparámetros.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Conversación multi-turno (tag `conversational` en el repositorio), aunque con calidad degradada respecto al modelo base.
- Atención con GQA y RoPE gestionados por el adaptador, con soporte de decodificación causal.
- Cómputo de atención en FP8 (e4m3fn) acelerado por kernels FlashAttention-3 en GPUs Hopper; fallback automático a PyTorch SDPA en pre-Hopper y CPU.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Investigación en atención subcuadrática: banco de pruebas para medir el impacto de sustituir atención softmax por operadores FlashAttention-3 FP8 en un transformer pequeño, con telemetría de perplejidad antes y después de la destilación.
- Estudio de destilación de representaciones: el par profesor (PPL 15,38) y alumno (PPL 426,76) sobre el mismo dataset permite analizar cuánto conocimiento recupera la destilación de estados ocultos tras una cirugía agresiva de 18/24 capas.
- Validación de kernels en hardware Hopper: útil para verificar el despacho de kernels CUDA/Triton/PyTorch y el fallback a SDPA en entornos sin SM 9.0.
- Reproducción de pipelines de cirugía de atención: sirve como referencia para implementar el patrón `hybrid_3_1` y la herencia de pesos `q/k/v/o_proj` en otros modelos Qwen2.
- Experimentos docentes sobre colapso y recuperación de modelos: la progresión 15,38 → 1.198.067,61 → 426,76 ilustra de forma cuantitativa el coste de alterar la topología de atención.
- Pruebas de integración de la librería NeuralOps: ejemplo funcional de serialización determinista de pesos y de la arquitectura de caché offline de representaciones del profesor en una GPU de consumo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre WikiText-2 (`wikitext-2-raw-v1`), split de validación, longitud de secuencia 512, batch_size 8, grad_accum 4, en una NVIDIA GeForce RTX 3090 de 24 GB:

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal |
| Perplejidad del alumno tras cirugía (zero-shot) | 1.198.067,61 | Inmediatamente tras el transplante de 18/24 capas |
| Perplejidad del alumno tras destilación (post-KD) | 426,76 | Tras destilación en dos etapas |
| Delta absoluto de perplejidad | −1.197.640,85 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 99,96% | Recuperación desde el pico post-cirugía |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en FP16 ocupan 1021,18 MB, por lo que el modelo cabe holgadamente en GPUs de consumo; con overhead de activaciones y caché KV, se estima un uso inferior a 3 GB en FP16 (estimación, no declarada por el autor).
- GPU recomendadas: NVIDIA Hopper (H100, H200) para aprovechar los kernels FlashAttention-3 FP8; en GPUs pre-Hopper (RTX 3090, A100, RTX 4090) el operador cae a PyTorch SDPA y se pierde la aceleración FP8.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM; la destilación se realizó en una RTX 3090 de 24 GB.
- Opciones de despliegue: la librería `neuralops` es la vía nativa; no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-flash-attention3-fp8-wikitext2` | 535M | No disponible | 426,76 (post-KD, no verificado) | MIT | Hugging Face, 101 descargas |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens | 15,38 (medido por el autor) | Apache 2.0 | Hugging Face, ampliamente distribuido |
| `Qwen/Qwen2.5-1.5B` | 1.540M | 32.768 tokens | No disponible en la información | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | 1.240M | 131.072 tokens | No disponible en la información | Llama 3.2 Community License | Hugging Face |

## Limitaciones y advertencias

- La perplejidad post-destilación (426,76) es aproximadamente 28 veces peor que la del modelo base (15,38): la calidad de generación está severamente degradada y no es apta para uso en producción.
- El resultado de perplejidad está marcado como `verified: false` en el model-index; no ha sido validado de forma independiente.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- La aceleración FP8 requiere GPUs Hopper (SM 9.0+); en hardware anterior el rendimiento puede ser inferior al del modelo base por el overhead del adaptador.
- El entrenamiento y la evaluación se limitan a WikiText-2; no hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan evaluar razonamiento, código o matemáticas.
- La model card está incompleta: la descripción de la etapa 2 de destilación se interrumpe, y no se detallan la longitud de contexto efectiva ni el volumen de tokens de entrenamiento.
- Licencia MIT declarada, lo que permite uso comercial del artefacto, pero la calidad del modelo hace inviable ese escenario; además, el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0, cuya compatibilidad con la relicenciación MIT debería revisarse.
- Riesgo alto de alucinación y de texto incoherente derivado del colapso de perplejidad; los sesgos heredados del corpus WikiText-2 (texto enciclopédico en inglés) no están analizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-flash-attention3-fp8-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `flash_attention3_fp8`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/flash_attention3_fp8.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
