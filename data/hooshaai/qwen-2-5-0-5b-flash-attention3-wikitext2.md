# Hooshaai/qwen-2.5-0.5b-flash-attention3-wikitext2

## Resumen
El modelo `Hooshaai/qwen-2.5-0.5b-flash-attention3-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atencion del decoder por el operador `flash_attention3` de la libreria NeuralOps, manteniendo 6 capas con la atencion GQA original como anclas de recuperacion contextual. Sobre esa topologia hibrida 3:1 se aplico un proceso de destilacion de conocimiento en dos etapas sobre el split de validacion de WikiText-2.

Lo desarrolla el usuario Hooshaai como parte del denominado "Attention Surgery Zoo" de NeuralOps, un proyecto que explora la sustitucion de mecanismos de atencion en modelos preentrenados. No es un modelo pensado para uso en produccion: es un artefacto de investigacion que documenta el impacto de reemplazar atencion softmax exacta por kernels de atencion subcuadraticos y el coste de recuperacion mediante destilacion.

Su relevancia es metodologica: demuestra que un transplante masivo de atencion degrada la perplejidad en varios ordenes de magnitud (de 15,38 a 779.190,64) y que la destilacion recupera solo parcialmente (hasta 669,12), lo que ilustra los limites de estas tecnicas en modelos compactos de 0,5B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `flash_attention3` y 6/24 con GQA softmax nativa |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,18 MB, mas adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-0.5B: 24 capas, dimension oculta D=896, 14 cabezas de query y 2 de key/value (GQA), dimension por cabeza d_h=64 y RoPE con theta=1.000.000. La intervencion reemplaza la atencion en los indices de capa [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `FlashAttention3` envuelto en un `QwenAttentionAdapter`, y conserva atencion GQA softmax exacta en [3, 7, 11, 15, 19, 23]. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 y una unica `o_proj` sin duplicacion.

El entrenamiento consistio en destilacion de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), secuencia de 512, batch 8 y acumulacion de gradiente 4, ejecutada en una RTX 3090 de 24 GB con cacheado offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 121 pasos) congela embeddings, MLPs y `lm_head` y entrena solo modulos de atencion y layer norms con AdamW (lr=2e-4, weight decay 0,01, clipping 1,0), pesos maestros FP32 con AMP FP16 y perdida MSE + 0,25·(1−cos). La etapa 2 (70% del presupuesto, 279 pasos) hace destilacion end-to-end sobre los 24 flujos residuales con lr=6e-5 y perdida MSE + 0,50·(1−cos), evitando `lm_head` para maximizar throughput. No se reporta uso de RLHF ni DPO.

## Capacidades
- Generacion de texto causal autoregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Soporte de atencion causal con GQA y RoPE en las capas nativas y en las transplantadas.
- Capacidad conversacional declarada en los tags del repositorio (pipeline `text-generation`, tag `conversational`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles segun el campo `language: en`.
- El estado de perplejidad (669,12 en WikiText-2) sugiere una calidad de generacion muy degradada respecto al modelo base, por lo que las capacidades practicas deben considerarse severamente mermadas.

## Casos de uso
- Investigacion sobre sustitucion de mecanismos de atencion: sirve como referencia reproducible para estudiar como afecta el reemplazo de atencion softmax por kernels tipo FlashAttention-3 a la perplejidad de un LM compacto, comparando el estado pre-KD (779.190,64) y post-KD (669,12).
- Estudio de destilacion de representaciones ocultas: el checkpoint documenta un protocolo en dos etapas con perdidas MSE + coseno y permite replicar el impacto de congelar backbone frente a destilar end-to-end.
- Benchmarking de kernels en NeuralOps: util para validar el despacho de kernels CUDA/Triton de la libreria y medir latencia de atencion hibrida en una RTX 3090.
- Docencia y divulgacion: ejemplo didactico de los limites de la cirugia de atencion en modelos de 0,5B, mostrando que la recuperacion via destilacion es parcial.
- Pruebas de pipeline de serializacion de pesos: el repo incluye pesos FP16 completos mas adaptador, util para testear flujos de carga y conversion en entornos de investigacion.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni agentes, dada la perplejidad de 669,12 frente a 15,38 del profesor.

## Benchmarks y rendimiento
Resultados declarados por el autor (no verificados) sobre WikiText-2 `wikitext-2-raw-v1`, split de validacion, longitud de secuencia 512:

| Metrica | Valor |
|---|---:|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad del estudiante zero-shot tras el transplante (pre-KD) | 779.190,64 |
| Perplejidad del estudiante tras destilacion (post-KD) | 669,12 |
| Delta absoluto de perplejidad | −778.521,52 |
| Reduccion relativa de perplejidad | 99,91% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB para pesos (1021,18 MB reportados) mas overhead de activaciones y cache KV; en la practica cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas para reproducir el entrenamiento: NVIDIA RTX 3090 de 24 GB, que es el hardware declarado en la model card.
- Cabe en GPUs de consumo: si, en cualquier GPU con al menos 4 GB de VRAM en FP16; en cuantizaciones de 8 o 4 bits cabria en GPUs de 2 GB o menos, aunque no se publican pesos cuantizados.
- Opciones de despliegue: la libreria declarada es `neuralops`, por lo que la carga requiere esa dependencia; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Dado que los pesos son safetensors con arquitectura Qwen2 modificada, la carga en stacks estandar requeriria adaptar el operador de atencion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-flash-attention3-wikitext2` | 535M | no disponible | 669,12 (post-KD) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | ~494M | no disponible | 15,38 | Apache 2.0 (modelo base Qwen) | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | ~1,5B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | ~1,2B | no disponible | no disponible | Llama 3.2 Community License | Hugging Face |

La comparativa relevante es contra su propio profesor: el checkpoint destilado multiplica por mas de 40 la perplejidad del modelo original, lo que lo situa fuera del rango util para tareas generativas reales.

## Limitaciones y advertencias
- Perplejidad severamente degradada: 669,12 frente a 15,38 del modelo base, lo que implica generaciones de baja calidad y alta incoherencia.
- Riesgo elevado de alucinacion y texto incoherente derivado de la degradacion del modelado del lenguaje.
- Solo soporta ingles segun la model card.
- Es un artefacto de investigacion: no hay evidencia de evaluaciones en tareas downstream (razonamiento, codigo, matematicas) y los benchmarks declarados no estan verificados (`verified: false`).
- La licencia MIT del checkpoint no exime de revisar las condiciones del modelo base Qwen2.5-0.5B, cuya licencia original es Apache 2.0.
- Requiere la libreria `neuralops` y un operador de atencion hibrido no estandar, lo que complica el despliegue en stacks convencionales (vLLM, TGI, llama.cpp).
- No se documentan sesgos especificos, pero al heredar el modelo base y entrenarse solo en WikiText-2, los sesgos del corpus y del profesor persisten sin mitigacion adicional.
- El proceso de destilacion uso solo el split de validacion de WikiText-2, lo que plantea dudas sobre sobreajuste y generalizacion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-flash-attention3-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de FlashAttention3 en NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/flash_attention3.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
