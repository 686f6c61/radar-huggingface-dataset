# Hooshaai/qwen-2.5-0.5b-full-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-full-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido 18 de las 24 capas de atención del decodificador por el operador `full_attention` de la librería NeuralOps, seguido de un proceso de destilación de conocimiento en dos etapas sobre WikiText-2. Lo desarrolla el usuario Hooshaai dentro del proyecto NeuralOps Attention Surgery Zoo, un esfuerzo por caracterizar el comportamiento de distintos operadores de atención (densos, subcuadráticos, lineales) injertados sobre arquitecturas transformer preentrenadas.

El modelo no busca ser un asistente de propósito general, sino un artefacto de investigación para medir el coste y la recuperación de perplexity tras una cirugía de atención. El resultado es contundente: tras el injerto la perplexity zero-shot se dispara a 460.802,45 y, después de la destilación, se recupera hasta 215,59, todavía muy lejos del profesor original (15,38). Es, por tanto, una referencia útil para quienes investigan atención eficiente y destilación, no un modelo listo para producción.

La arquitectura base es un transformer decoder-only denso de 535.364.224 parámetros totales (según safetensors), 24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor con GQA, y RoPE con theta 1.000.000. La ventana de contexto nativa de Qwen2.5-0.5B es de 32.768 tokens, aunque el autor no la documenta explícitamente en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) con 18/24 capas de atención sustituidas por `FullAttention` de NeuralOps (layout híbrido 3:1) |
| Parametros totales | 535.364.224 (safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (la base Qwen2.5-0.5B soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; el autor menciona "Full FP16 (1021.18 MB) + Adapter") |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16), librería `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only denso con 24 bloques, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza d_h=64 y RoPE con theta 1.000.000. Sobre esa base se aplica una "cirugía" determinista: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] (18 de 24, el 75%) se reemplazan por el operador `FullAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA original de Qwen2 como anclas de enrutamiento contextual global. Cada capa injertada hereda los tensores preentrenados `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 para evitar colapso de proyecciones no inicializadas. El operador `FullAttention` implementa atención multi-cabeza escalada estándar (Vaswani et al., 2017) con soporte causal, GQA y RoPE, y un despacho de kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con la arquitectura de caché offline de NeuralOps (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 117 pasos) congela el backbone y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight_decay=0.01, grad clipping 1.0), minimizando MSE por capa más 0.25·(1 − coseno) entre estados ocultos del alumno y del profesor. La etapa 2 (70% del presupuesto, 269 pasos) hace destilación extremo a extremo con una pérdida de alineación por capa más estricta. El resultado: la perplexity zero-shot tras la cirugía (460.802,45) baja a 215,59, una reducción relativa del 99,95%, pero aún catorce veces por encima del profesor (15,38).

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del tokenizador y vocabulario de Qwen2.5-0.5B.
- Razonamiento básico y respuesta conversacional de un modelo de 0,5B, muy degradados respecto al profesor por la pérdida de calidad tras la cirugía.
- Soporte de atención causal con GQA y RoPE, compatible con decodificación estándar de transformers.
- Capacidad multilingüe limitada: la model card solo declara inglés (`en`), aunque la base Qwen2.5 cubre más idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Uso previsto como artefacto de investigación en atención eficiente y destilación, no como modelo de producción.

## Casos de uso

- Investigación en atención eficiente: servir como punto de comparación empírico entre operadores de atención (denso, subcuadrático, lineal) injertados sobre el mismo backbone, midiendo perplexity en WikiText-2 con protocolo reproducible.
- Estudio de destilación de conocimiento: analizar la curva de recuperación de perplexity (de 460.802,45 a 215,59) y el efecto del reparto 30/70 entre alineación de subespacio y destilación extremo a extremo.
- Reproducción de experimentos de "attention surgery": validar la topología híbrida 3:1 (18 capas injertadas, 6 anclas GQA) y la herencia de pesos `q_proj`/`k_proj`/`v_proj`/`o_proj` con expansión de cabezas KV.
- Benchmark de kernels: probar el despacho en tres niveles (CUDA / Triton / PyTorch) del operador `FullAttention` en una RTX 3090 y comparar latencia y throughput frente a la atención nativa de Qwen2.
- Docencia y formación: ilustrar de forma tangible el impacto de sustituir módulos de atención en un transformer preentrenado y el coste de recuperación vía destilación.
- Línea base negativa: usarse como referencia de "modelo degradado" en estudios de evaluación de robustez o de detección de degradación de perplexity.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`), medidos en el split de validación de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, `batch_size=8`, `grad_accum=4`, en una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor | Notas |
|---|---|---|
| Perplexity del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA Softmax causal exacta |
| Perplexity zero-shot del alumno tras cirugía | 460.802,45 | Inmediatamente tras el injerto de 18/24 capas |
| Perplexity destilada del alumno (post-KD) | 215,59 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplexity | −460.586,86 | Cambio logrado por la destilación |
| Reducción relativa de perplexity | 99,95% | Recuperación desde el pico post-cirugía |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB de pesos más overhead de activaciones y caché KV; cómodo en cualquier GPU consumer con 4 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 0,6 GB; en 4 bits, en torno a 0,35 GB (estimaciones a partir del tamaño de pesos, no publicadas por el autor).
- GPU recomendadas: NVIDIA RTX 3090 (la usada por el autor para destilación), RTX 4090, A100, H100; cualquier GPU con al menos 4 GB de VRAM sirve para inferencia.
- Cabe en GPU consumer: sí, en GTX 1650/RTX 3050 en adelante con cuantización, y en RTX 3060/4060 en FP16 sin problema.
- Opciones de despliegue: la librería `neuralops` es la vía nativa; al estar basado en Qwen2, es probable que funcione con transformers, vLLM, llama.cpp u Ollama tras conversión, aunque el autor no lo documenta explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-full-attention-wikitext2` | 535M | no disponible (base: 32.768) | 215,59 (post-KD) | MIT | Hugging Face, 304 descargas |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 | 15,38 | Apache 2.0 | Hugging Face, ampliamente usado |
| `Qwen/Qwen2.5-1.5B` | 1.500M | 32.768 | no disponible | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | 1.200M | 128.000 | no disponible | Llama 3.2 Community License | Hugging Face |

La comparación relevante es contra su propio profesor: el checkpoint destilado está 14 veces peor en perplexity que `Qwen/Qwen2.5-0.5B` pese a tener más parámetros (535M frente a 494M) por la sustitución de atención. Frente a modelos de tamaño similar de otras familias no hay datos comparables publicados en la información disponible.

## Limitaciones y advertencias

- Perplexity de 215,59 frente a 15,38 del profesor: la calidad de generación está severamente degradada y no es apta para uso en producción.
- El modelo solo declara inglés; no hay evidencia de capacidades multilingües conservadas tras la cirugía.
- Riesgo elevado de alucinación y de texto incoherente por la pérdida de calidad tras el injerto de atención.
- No se documentan sesgos específicos, pero hereda los del corpus WikiText-2 (texto enciclopédico en inglés, sesgo de dominio) y los de Qwen2.5-0.5B.
- Licencia MIT permite uso comercial, pero la degradación de calidad hace inviable cualquier aplicación práctica.
- La longitud de contexto efectiva no está documentada; la cirugía puede alterar el comportamiento en secuencias largas respecto a la base.
- Requiere la librería `neuralops` para cargar el operador `FullAttention`; no es un checkpoint estándar de transformers sin adaptación.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`); no hay evaluación en tareas downstream.
- El checkpoint es un artefacto de investigación: no debe confundirse con un modelo listo para despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-full-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/dense/full_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
