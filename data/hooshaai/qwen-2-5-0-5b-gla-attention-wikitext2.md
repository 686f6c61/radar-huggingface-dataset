# Hooshaai/qwen-2.5-0.5b-gla-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-gla-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por el operador `gla_attention` (Gated Linear Attention, GLA) de la librería NeuralOps, manteniendo 6 capas con la atención GQA original de Qwen2 como anclas de recuperación contextual. El modelo forma parte del "Attention Surgery Zoo" del autor y busca explorar si es posible reemplazar atención cuadrática por atención lineal subcuadrática en modelos pequeños mediante destilación de representaciones ocultas.

El modelo base Qwen2.5-0.5B tiene 494 millones de parámetros, 24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor (GQA), con un contexto nativo de 32.768 tokens. El checkpoint resultante conserva el mismo número de parámetros (519.096.508 según safetensors, incluyendo adaptadores y cabezas expandidas) y se distribuye en FP16 con un adaptador adicional.

La relevancia de este checkpoint es fundamentalmente metodológica: documenta de forma transparente un resultado negativo. Tras el transplante quirúrgico, la perplejidad en WikiText-2 salta de 15,38 (profesor) a 400.580,78, y la destilación en dos etapas no logra reducirla (delta 0,00, reducción relativa 0,00%). Es, por tanto, un artefacto de investigación sobre límites de la destilación de representaciones en cirugía de atención, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con Gated Linear Attention (GLA, familia linear) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 519.096.508 (según safetensors); modelo base Qwen2.5-0.5B: 494 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente en la model card; el modelo base Qwen2.5-0.5B soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 990,14 MB, más adaptador) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador), librería `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (24 bloques decoder, D=896, H_q=14, H_kv=2, d_h=64, RoPE con theta=1.000.000) y aplica una cirugía determinista con ratio `hybrid_3_1`: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se sustituyen por `GLAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax preentrenada como anclas de enrutamiento global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 para adaptar GQA al operador GLA.

El operador GLA implementa una recurrencia con compuerta: S_t = exp(g_t) · S_{t-1} + (K_t / sqrt(d))^T · V_t, con salida O_t = Q_t · S_t y g_t = logsigmoid(gate_logits / tau) ≤ 0. El despacho de kernels es a tres niveles (CUDA / Triton / PyTorch) y el backend es FLA.

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), secuencia 512, batch 8, grad_accum 4, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). Etapa 1 (30% del presupuesto, 6 pasos): solo se entrenan módulos de atención y layernorms, con AdamW (lr=2.0e-4, weight_decay=0.01, grad clip 1.0) y pérdida MSE + 0.25·(1 − cos). Etapa 2 (70%, 11 pasos): destilación extremo a extremo de todas las capas con lr=6.0e-5 y pérdida MSE + 0.50·(1 − cos). El número total de pasos (17) es extremadamente reducido, lo que explica en parte el fracaso de la recuperación.

## Capacidades

- Generación de texto causal autorregresiva (pipeline `text-generation`), con soporte declarado de conversación en la etiqueta `conversational`.
- Razonamiento y generación en inglés heredados del modelo base Qwen2.5-0.5B, aunque degradados por la cirugía de atención.
- Soporte de tool calling / function calling: no disponible de forma verificada tras la cirugía; el modelo base lo soporta, pero este checkpoint no documenta su preservación.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma verificada.
- Capacidades multilingües: limitadas a inglés según la model card.
- Capacidades especiales: ninguna documentada (sin visión, audio ni modo thinking). El interés técnico es la topología híbrida GLA/GQA, no las capacidades funcionales.

## Casos de uso

- Investigación sobre atención lineal subcuadrática: el checkpoint sirve como caso de estudio reproducible de cirugía de atención en modelos pequeños, permitiendo analizar por qué la destilación de representaciones con 17 pasos no recupera la perplejidad del profesor.
- Estudio de topologías híbridas: útil para experimentar con ratios alternativos (por ejemplo, 1:1 o 7:1) y comparar la posición de las capas ancla GQA frente a la configuración `hybrid_3_1` documentada.
- Reproducción de destilación de representaciones: la model card detalla hiperparámetros, presupuesto por etapas y objetivo de pérdida, lo que permite replicar el protocolo con más pasos o mayor dataset para testear hipótesis de recuperación.
- Benchmark de operadores de la librería NeuralOps: el checkpoint valida el pipeline de `attention_surgery` y el despacho de kernels CUDA/Triton/PyTorch de `gla_attention` en hardware consumer (RTX 3090).
- Docencia y divulgación: ejemplo didáctico de resultado negativo en investigación de arquitecturas, con telemetría completa (PPL profesor 15,38, PPL estudiante 400.580,78, delta 0,00).
- Pruebas de robustez de pipelines de evaluación: útil para verificar que los arneses de evaluación detectan correctamente modelos degradados antes de desplegarlos en producción.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validación de WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, batch 8, grad_accum 4, sobre una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax exacta |
| Perplejidad del estudiante zero-shot tras cirugía (pre-KD) | 400.580,78 | Inmediatamente tras el transplante 18/24 |
| Perplejidad del estudiante destilado (post-KD) | 400.580,78 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | +0,00 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 0,00% | Recuperación desde el pico post-cirugía |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,0 GB de pesos (990,14 MB) más el adaptador y las activaciones; en la práctica, entre 1,5 y 2,5 GB según longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en batches pequeños; el autor usó una RTX 3090 de 24 GB para el entrenamiento.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes; también en GPUs de 8 GB.
- Opciones de despliegue: la librería nativa es `neuralops`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el operador GLA con despacho CUDA/Triton probablemente no esté soportado por esos runners sin portar el kernel. La vía realista es usar el paquete NeuralOps del repositorio del autor.
- Latencia y throughput estimados: no disponibles; la ventaja teórica de GLA es complejidad lineal en la longitud de secuencia, pero el checkpoint no reporta mediciones de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-gla-attention-wikitext2` | 519 M | no disponible (base: 32.768) | Híbrida GLA/GQA 3:1 | 400.580,78 (post-KD, autor) | MIT | Hugging Face, 313 descargas |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32.768 | GQA softmax | 15,38 (referencia del autor) | Apache 2.0 | Hugging Face, ampliamente usado |
| `Qwen/Qwen2.5-1.5B` | 1.540 M | 32.768 | GQA softmax | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otros checkpoints del Attention Surgery Zoo (NeuralOps) | variable | no disponible | variable (linear, hybrid) | no disponible en esta ficha | MIT | Hugging Face |

La comparación relevante es contra el profesor: el checkpoint quirúrgico multiplica la perplejidad por más de 26.000 veces respecto a `Qwen2.5-0.5B` y no recupera nada con la destilación aplicada.

## Limitaciones y advertencias

- Rendimiento degradado severamente: perplejidad de 400.580,78 frente a 15,38 del profesor; el modelo no es utilizable para generación de texto de calidad.
- La destilación en dos etapas (17 pasos totales) no produjo ninguna mejora medible (delta 0,00); el checkpoint no demuestra que la cirugía GLA sea viable con este protocolo.
- Riesgo de alucinación extremo: con una perplejidad de ese orden, la salida es esencialmente ruido estadístico.
- Idiomas: solo inglés declarado; sin capacidades multilingües verificadas.
- Contexto: no se documenta la longitud de contexto efectiva tras la cirugía; los adaptadores gestionan RoPE con theta=1.000.000, pero no hay evaluación más allá de secuencias de 512 tokens.
- Licencia MIT permite uso comercial, pero el estado del modelo hace inviable cualquier despliegue en producción; el uso razonable es investigación y docencia.
- Dependencia de la librería `neuralops` y de kernels CUDA/Triton específicos; la portabilidad a otros runners (vLLM, llama.cpp, TGI) no está documentada.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El checkpoint incluye un adaptador además de los pesos FP16 completos; hay que revisar el repositorio para conocer el contrato exacto de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-gla-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del operador GLA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/gla_attention.py
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
