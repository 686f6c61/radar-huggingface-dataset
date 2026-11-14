# Hooshaai/qwen-2.5-0.5b-gqa-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-gqa-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha realizado una cirugía de atención: 18 de las 24 capas del decoder han sido sustituidas por el operador `gqa_attention` (GroupedQueryAttention) de la librería NeuralOps, manteniendo 6 capas ancla con la atención softmax GQA original de Qwen2. Posteriormente se aplicó una destilación de conocimiento en dos etapas sobre WikiText-2 para recuperar la calidad del modelo base.

El modelo lo publica el usuario Hooshaai bajo licencia MIT y su interés es fundamentalmente de investigación: sirve como banco de pruebas reproducible para estudiar el impacto de sustituir mecanismos de atención en transformers pequeños y para evaluar técnicas de destilación de representaciones ocultas tras una intervención quirúrgica en la arquitectura. No está pensado como modelo de producción generalista.

El resultado medido es una perplejidad de 126,42 en el split de validación de WikiText-2, frente a 15,38 del profesor original (`Qwen2.5-0.5B`). Es decir, la destilación recupera el 99,98 % del colapso inicial (que partía de 579.546,96), pero queda lejos de la calidad del modelo base. Es relevante ahora como ejemplo abierto de las técnicas de "attention surgery" y destilación con caché offline de representaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con topología híbrida `hybrid_3_1`: 18/24 capas con `gqa_attention` (NeuralOps) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens; la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo, ~1021,18 MB) más adaptador |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`: 24 capas, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV, dimensión por cabeza 64, RoPE con theta = 1.000.000. Sobre esa base se aplica la cirugía `hybrid_3_1`: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `gqa_attention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax preentrenada como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida sin duplicados. El operador `gqa_attention` soporta enmascarado causal, caché KV, RoPE y dispatch de kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 118 pasos) congela el backbone y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, grad clipping 1.0), minimizando MSE por capa más 0.25 multiplicado por (1 − coseno entre estados ocultos del alumno y del profesor). La etapa 2 (70 % del presupuesto, 270 pasos) realiza destilación end-to-end de representaciones. Se usaron pesos maestros en FP32 con AMP FP16 y GradScaler.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Conversación multi-turno básica (el pipeline declarado es `text-generation` y las tags incluyen `conversational`).
- Soporte de atención causal con caché KV y RoPE, lo que permite decodificación incremental.
- Capacidad de servir como sujeto de experimentos de atención: permite comparar el comportamiento del operador `gqa_attention` frente a la atención softmax nativa en las mismas capas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para este checkpoint.
- Multilingüe limitado: solo se declara inglés.

## Casos de uso

- Investigación en atención eficiente: comparar la perplejidad y el comportamiento de las 18 capas transplantadas con `gqa_attention` frente a las 6 capas ancla en el mismo modelo, aislando el efecto del operador.
- Reproducción de experimentos de destilación: el checkpoint sirve como referencia de "post-KD" para validar la implementación de la caché offline de representaciones de NeuralOps en una RTX 3090.
- Estudio de robustez post-cirugía: analizar cómo degrada la perplejidad (15,38 → 126,42) y qué tipos de tokens o contextos se ven más afectados, útil para diseñar mejores protocolos de recuperación.
- Benchmark de operadores en la librería NeuralOps: ejecutar el modelo con dispatch CUDA/Triton/PyTorch y medir latencia y throughput relativos por nivel de kernel.
- Docencia y formación: ejemplo didáctico y reproducible de sustitución de módulos de atención y destilación de estados ocultos en un transformer pequeño que cabe en una GPU de consumo.
- Pruebas de integración de pipelines de Hugging Face con arquitecturas no estándar: validar cómo cargan y ejecutan los pesos safetensors con adaptadores de atención personalizados.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre WikiText-2 `wikitext-2-raw-v1`, split de validación, longitud de secuencia 512, batch_size 8, grad_accum 4, en RTX 3090 24 GB:

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal |
| Perplejidad del alumno zero-shot tras la cirugía | 579.546,96 | Inmediatamente tras transplantar 18/24 capas |
| Perplejidad del alumno tras destilación (post-KD) | 126,42 | Tras destilación en 2 etapas |
| Delta absoluto de perplejidad | −579.420,54 | Mejora lograda por la destilación |
| Reducción relativa de perplejidad | 99,98 % | Recuperación respecto al pico post-cirugía |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB solo de pesos, más caché KV y activaciones; cómodo en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor usó una RTX 3090 para el entrenamiento. Para servir en producción con concurrencia, A100 o H100 aportan margen de sobra.
- Cabe en GPU consumer sin problema por tamaño; la limitación práctica es la compatibilidad del operador `gqa_attention` con el stack de inferencia.
- Opciones de despliegue: la librería declarada es `neuralops`, por lo que la carga estándar con `transformers` puede requerir los adaptadores de atención de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Entrenamiento/destilación: reproducible en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-gqa-attention-wikitext2` | 535.364.224 | no disponible | 126,42 (declarada por el autor) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | ~494 M | hasta 32.768 tokens | 15,38 (declarada por el autor) | Apache 2.0 (modelo base Qwen2.5) | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | ~1,5 B | hasta 32.768 tokens | no disponible | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | ~1,2 B | 128.000 tokens | no disponible | Llama 3.2 Community License | Hugging Face |

La comparación directa más informativa es con su propio profesor: el checkpoint quirúrgico es un 8 % más grande en parámetros (535 M frente a ~494 M por la expansión de cabezas KV de 2 a 14 en las capas transplantadas) y multiplica por 8,2 la perplejidad en WikiText-2. Frente a modelos de tamaño similar de otras familias no hay datos de perplejidad comparables en la información disponible.

## Limitaciones y advertencias

- Calidad muy inferior al modelo base: perplejidad 126,42 frente a 15,38, un factor de 8,2. No es apto para uso en producción como generador de texto generalista.
- Solo se declara inglés; no hay evidencia de comportamiento multilingüe.
- Riesgo elevado de alucinación y de generación incoherente por la degradación de representaciones tras la cirugía y la destilación parcial.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- La licencia MIT del repositorio se acompaña de un enlace a la licencia del proyecto NeuralOps; conviene revisar ambas antes de uso comercial. El modelo base Qwen2.5 se distribuye bajo Apache 2.0, por lo que las obligaciones de atribución de esa licencia podrían seguir aplicando.
- Dependencia de la librería `neuralops` y de los adaptadores `QwenAttentionAdapter`: la portabilidad a otros stacks de inferencia no está garantizada.
- Los benchmarks son declarados por el autor y están marcados como no verificados (`verified: false`); no han sido reproducidos de forma independiente.
- El contexto máximo efectivo de este checkpoint no se confirma en la model card; no asumir los 32.768 tokens del modelo base sin validación empírica.
- La fecha de creación del repositorio (2026-11-10) y la ausencia de likes y de descargas elevadas (316) sugieren un artefacto de investigación reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-gqa-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `gqa_attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/gqa_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
