# Hooshaai/qwen-2.5-0.5b-lora-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-lora-attention-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps Attention Surgery Zoo. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre `Qwen/Qwen2.5-0.5B`: 18 de sus 24 bloques de atención del decoder han sido sustituidos por el operador `LoRAAttention` de la librería NeuralOps, con un esquema híbrido 3:1 que preserva 6 capas con la atención GQA original de Qwen2.

El objetivo declarado es explorar si es posible reemplazar atención softmax estándar por variantes envueltas en LoRA manteniendo la coherencia del modelo mediante destilación de representaciones ocultas en dos etapas sobre WikiText-2. El resultado es un modelo de 535 millones de parámetros (frente a los 494 M del base, por los adaptadores añadidos) que alcanza una perplejidad de 207,14 en el split de validación de WikiText-2, frente a los 15,38 del profesor original.

Es relevante ahora como artefacto de investigación reproducible para quienes estudian sustitución de operadores de atención, destilación de conocimiento en modelos pequeños y el ecosistema NeuralOps. No está pensado como modelo de producción: la degradación de perplejidad es sustancial y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen2) con 18/24 capas sustituidas por `LoRAAttention` (híbrido 3:1) |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,18 MB, mas adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder causal con 24 capas, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza d_h=64 y RoPE con theta=1.000.000. Sobre esa base se aplica una "cirugía" determinista: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `LoRAAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax original como anclas de enrutamiento global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida sin duplicación. El operador `LoRAAttention` es explícitamente un wrapper PEFT, no un compresor: mantiene `compression_rate` ≈ 1.0 y `num_compressed_layers` = 0, y ofrece despacho de kernels en tres niveles (CUDA, Triton, PyTorch).

El entrenamiento consiste en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con longitud de secuencia 512, batch 8 y acumulación de gradiente 4, ejecutada en una única RTX 3090 de 24 GB usando la arquitectura de caché offline del profesor (0 MB de VRAM del teacher en GPU). La etapa 1 (30 % del presupuesto, 115 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo módulos de atención y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, clipping 1.0), pesos maestros FP32 con AMP FP16, minimizando MSE por capa más 0.25·(1 − coseno). La etapa 2 (70 % del presupuesto, 263 pasos) hace destilación extremo a extremo con el término coseno reforzado a 0.50. El resultado es una recuperación del 99,84 % de la perplejidad respecto al pico post-cirugía, aunque queda muy lejos del profesor.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Conversación multi-turno en formato chat (la model card declara `pipeline_tag: text-generation` y tags `conversational`).
- Soporte de GQA y RoPE en las capas nativas preservadas.
- Despacho de kernels en CUDA, Triton y PyTorch para el operador `LoRAAttention`.
- Capacidad de razonamiento, código y matemáticas: no disponible de forma fiable; la perplejidad de 207,14 en WikiText-2 sugiere degradación severa de la calidad lingüística frente al base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step reasoning: no disponible.
- Capacidades multimodales (visión, audio): no soportadas.
- Modo thinking: no soportado.

## Casos de uso

- Investigación en sustitución de operadores de atención: sirve como punto de partida reproducible para medir el impacto de reemplazar atención softmax por variantes LoRA en modelos pequeños, comparando directamente contra el profesor Qwen2.5-0.5B con la misma tokenización y dataset.
- Estudio de destilación de representaciones ocultas: el checkpoint documenta telemetría detallada (PPL pre-KD de 126.790,99, post-KD de 207,14, reducción relativa del 99,84 %) útil para calibrar protocolos de dos etapas con presupuestos 30/70.
- Validación de la librería NeuralOps: permite a desarrolladores probar el operador `LoRAAttention`, el `QwenAttentionAdapter` y el despacho de kernels en un caso real con pesos publicados.
- Benchmarking de esquemas híbridos: el layout 3:1 con anclas GQA cada cuatro capas es un diseño concreto que se puede replicar o modificar para estudiar el equilibrio entre eficiencia y recall de induction heads.
- Reproducción en hardware de consumo: al ocupar 1,3 GB en FP16 y haberse entrenado en una RTX 3090, es viable experimentar en GPUs consumer de 8-24 GB con fines de investigación.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención, LoRA como wrapper PEFT y destilación offline con caché de representaciones del profesor.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal |
| Perplejidad del estudiante zero-shot tras cirugía | 126.790,99 | Inmediatamente después del transplante de 18/24 capas |
| Perplejidad del estudiante tras destilación | 207,14 | Split de validación de WikiText-2, seq_len 512 |
| Delta absoluto de perplejidad | −126.583,85 | Mejora atribuida a la destilación |
| Reducción relativa de perplejidad | 99,84 % | Recuperación respecto al pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. La única métrica reportada es perplejidad en WikiText-2.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1-1,5 GB para los pesos (1021,18 MB de pesos completos más el adaptador), con overhead adicional de activaciones y caché KV según longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; una RTX 3090 (24 GB) fue suficiente para el entrenamiento completo con destilación offline.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes; también en GPUs integradas con suficiente memoria compartida si se cuantiza (aunque no se publican pesos cuantizados).
- Opciones de despliegue: al usar la librería `neuralops` como `library_name`, la integración con vLLM, llama.cpp, Ollama o TGI no está garantizada; requeriría exportación a un formato estándar (safetensors a transformers) o adaptación del operador `LoRAAttention` a los kernels del runtime elegido.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-lora-attention-wikitext2` | 535 M | no disponible | MIT | Checkpoint experimental, PPL 207,14 en WikiText-2 |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32.768 tokens (según modelo base) | Apache 2.0 | Modelo de producción, PPL 15,38 en WikiText-2 |
| `Qwen/Qwen2.5-1.5B` | 1.540 M | 32.768 tokens | Apache 2.0 | Modelo de producción de la misma familia |
| `meta-llama/Llama-3.2-1B` | 1.240 M | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamaño similar en el ecosistema abierto |

La comparación directa más informativa es contra su propio profesor: el checkpoint quirúrgico multiplica por más de 13 la perplejidad del base (207,14 frente a 15,38), lo que refleja el coste de la sustitución de atención. Frente a alternativas de tamaño similar como Qwen2.5-1.5B o Llama-3.2-1B, carece de benchmarks estándar publicados y su licencia MIT es más permisiva que la de Llama 3.2, pero su calidad lingüística medida es muy inferior.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad de 207,14 frente a 15,38 del profesor indica que el modelo no es apto para generación de texto de calidad en producción.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Riesgo elevado de alucinación y de incoherencia por la sustitución de 18 de 24 capas de atención y la consiguiente pérdida de recall de induction heads.
- Longitud de contexto no documentada para este checkpoint; no se debe asumir la ventana de 32.768 tokens del base sin verificación empírica.
- Dependencia de la librería `neuralops` y del operador `LoRAAttention`: no es un checkpoint estándar de transformers y puede requerir código específico para cargarse y ejecutarse.
- Los benchmarks son telemetría del autor, marcados como `verified: false`; no han sido replicados de forma independiente.
- Licencia MIT: permite uso comercial, pero la calidad del modelo hace desaconsejable cualquier despliegue productivo sin una evaluación exhaustiva previa.
- El modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0; conviene revisar la compatibilidad de ambas licencias en el contexto de uso previsto.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-lora-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `LoRAAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/lora_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
