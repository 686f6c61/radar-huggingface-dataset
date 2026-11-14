# Hooshaai/qwen-2.5-0.5b-cosformer-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-cosformer-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido 18 de las 24 capas de atención del decoder original por el operador de atención lineal Cosformer, manteniendo 6 capas con la atención GQA softmax nativa. El trabajo lo firma el usuario Hooshaai dentro del ecosistema de la librería NeuralOps (Attention Surgery Zoo), un proyecto centrado en trasplantes quirúrgicos de mecanismos de atención y destilación posterior para recuperar calidad.

El modelo no pretende ser un asistente de propósito general, sino una pieza de investigación: demuestra el protocolo de "cirugía de atención" más destilación de representaciones ocultas en dos etapas sobre WikiText-2. La arquitectura resultante es híbrida (3:1, es decir, tres capas lineales por cada capa softmax) y conserva los pesos preentrenados de proyecciones del modelo base durante la inicialización, evitando el colapso de proyecciones no inicializadas.

Es relevante ahora porque explora la viabilidad de atención subcuadrática en modelos compactos de 0,5B, un régimen donde el coste de sustituir atención es especialmente sensible. El resultado, sin embargo, es un perplexity de validación de 498,61 frente a los 15,38 del profesor, lo que sitúa al modelo muy lejos de la paridad con el original y lo convierte en un artefacto de estudio más que en un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con CosformerAttention (lineal) y 6/24 con GQA softmax nativa de Qwen2 |
| Parámetros totales | 550.347.154 (safetensors); el modelo base declara 494M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-0.5B soporta contextos largos, pero la ficha no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantización | No disponible (pesos publicados en FP16 completo, 1049,77 MB, más un adaptador) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (24 capas, dimensión oculta D=896, 14 cabezas de query y 2 de key/value, dimensión por cabeza 64, RoPE con theta 1.000.000). Sobre esa base se aplica una cirugía determinista con ratio `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `CosformerAttention` envuelta en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax original como anclas de enrutamiento contextual global. Cada capa trasplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas. El operador Cosformer soporta causalidad autoregresiva, manejo de GQA y RoPE, con despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor durante el ajuste). La etapa 1 (30 % del presupuesto, 57 pasos) congela embeddings, MLPs y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, clipping 1.0), pesos maestros FP32 con AMP FP16 y pérdida por capa `MSE + 0.25·(1 − cos(h_s, h_t))`. La etapa 2 (70 % del presupuesto, 159 pasos) hace destilación end-to-end de representaciones con una pérdida de alineamiento más estricta, `MSE + 0.50·(1 − cos(...))` según el fragmento disponible. La innovación técnica destacable es el propio protocolo de cirugía más destilación con caché offline, no el modelo final.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención lineal subcuadrática en 18 de 24 capas, con complejidad reducida respecto a softmax en secuencias largas.
- Soporte de GQA en las capas trasplantadas mediante adaptador, con expansión de cabezas KV.
- Soporte de RoPE gestionado por el adaptador (theta 1.000.000).
- Conversacional y text-generation según los tags del repositorio, aunque la calidad real está muy degradada por el perplexity medido.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión y audio: no disponibles ni documentados en la información proporcionada.
- Capacidades multilingües: no disponibles; solo se declara inglés.

## Casos de uso

- Investigación en atención lineal: servir como punto de partida reproducible para estudiar el impacto de sustituir atención softmax por Cosformer en un decoder compacto, comparando el PPL post-cirugía (345.903,37) con el post-destilación (498,61).
- Estudio de protocolos de destilación: el checkpoint documenta dos etapas con presupuestos concretos (57 y 159 pasos) y pérdidas híbridas MSE + coseno, útil para replicar o criticar el método en otros modelos.
- Benchmarking de kernels de atención: al despachar CUDA / Triton / PyTorch en tres niveles, permite medir latencia y throughput de Cosformer frente a GQA softmax en la misma arquitectura.
- Análisis de topologías híbridas: la distribución 3:1 con anclas en las capas [3, 7, 11, 15, 19, 23] permite experimentar con qué capas conservar en softmax para preservar retrieval global.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y de por qué una sustitución agresiva sin destilación suficiente degrada severamente el modelo.
- No recomendado para producción: con un PPL de 498,61 frente a 15,38 del profesor, no es adecuado para atención al cliente, generación de código ni pipelines reales.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados, `verified: false`) sobre WikiText-2 `wikitext-2-raw-v1`, split de validación, longitud de secuencia 512, batch 8 y grad_accum 4, en RTX 3090 de 24 GB:

| Métrica | Valor |
|---|---:|
| Perplexity del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplexity zero-shot del estudiante tras cirugía (pre-KD) | 345.903,37 |
| Perplexity del estudiante tras destilación (post-KD) | 498,61 |
| Delta absoluto de perplexity | −345.404,77 |
| Reducción relativa de PPL | 99,86 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB solo para pesos (1049,77 MB declarados), más overhead de activaciones y caché KV; cómodo en GPUs de 8 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, 3070, 4060, 4070, 4090) para FP16; la destilación se realizó en una RTX 3090 de 24 GB.
- Cabe en GPU consumer: sí, por tamaño; el cuello de botella es la calidad, no la memoria.
- Opciones de despliegue: la librería declarada es `neuralops`, no estándar; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada. Al ser safetensors FP16 más adaptador, requeriría cargar el operador Cosformer desde NeuralOps.
- Latencia y throughput: no disponibles. La motivación del operador lineal es reducir coste en secuencias largas, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-cosformer-wikitext2 | 550M | No disponible | 498,61 (post-KD) | MIT | Hugging Face, librería neuralops |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | No disponible en esta ficha | 15,38 | Apache 2.0 (según modelo base; no confirmado aquí) | Hugging Face, transformers |
| Alternativas de atención lineal en 0,5B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con el profesor es la más informativa: misma topología base, mismo dataset de evaluación, y una diferencia de perplexity de más de 30 veces. No se dispone de datos de otros modelos con cirugía de atención comparable en la información proporcionada.

## Limitaciones y advertencias

- Calidad muy degradada: PPL de 498,61 frente a 15,38 del modelo base; la destilación recupera el 99,86 % del salto post-cirugía pero sigue lejísimos del profesor.
- Riesgo alto de alucinación y de texto incoherente en generación libre; no apto para producción.
- Solo inglés declarado; sin garantías multilingües.
- Contexto efectivo no documentado tras la cirugía; las capas lineales pueden alterar el comportamiento en secuencias largas pese a la motivación de eficiencia.
- Sesgos: no documentados, pero hereda los del corpus WikiText-2 y del modelo base Qwen2.5-0.5B.
- Licencia MIT para el checkpoint, con enlace a la licencia de NeuralOps; conviene verificar la licencia del modelo base Qwen2.5-0.5B antes de uso comercial.
- Dependencia de la librería `neuralops` y del operador `CosformerAttention`; no es un checkpoint estándar de transformers y puede requerir código específico para cargarse.
- Los benchmarks están marcados como no verificados (`verified: false`) y proceden del propio autor.
- Fechas de creación y actualización del repositorio (noviembre de 2026) resultan anómalas y conviene tratarlas con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-cosformer-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de Cosformer en NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/cosformer.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
