# Hooshaai/qwen-2.5-0.5b-cluster-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-cluster-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha realizado una "cirugía de atención": 18 de las 24 capas del decoder han sido sustituidas por el operador `ClusterAttention` (atención por clustering de tokens, de complejidad subcuadrática) de la librería NeuralOps, manteniendo 6 capas con la atención GQA original de Qwen2.5 como anclas. Posteriormente se aplicó una destilación de conocimiento en dos etapas sobre WikiText-2 para recuperar capacidad predictiva.

El modelo lo publica el usuario Hooshaai y sirve como demostración empírica de la técnica de sustitución de atención de NeuralOps: mide cuánto se degrada un modelo pequeño al reemplazar atención softmax por atención dispersa, y cuánto se recupera mediante destilación. No es un modelo pensado para producción, sino un artefacto de investigación sobre eficiencia de atención.

El resultado es contundente en términos de telemetría: la perplejidad en WikiText-2 pasa de 440.626 tras la cirugía a 1.045,39 tras la destilación, frente a los 15,38 del modelo profesor original. Es decir, la destilación recupera el 99,76% de la degradación relativa, pero el modelo sigue muy lejos de la calidad del Qwen2.5-0.5B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atencion hibrida: 18/24 capas `ClusterAttention` (sparse) + 6/24 capas GQA softmax nativa |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,18 MB, mas adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (24 capas, dimension oculta 896, 14 cabezas de consulta, 2 cabezas KV, dimension por cabeza 64, RoPE con theta 1.000.000). Sobre esa base se aplica la topología `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `ClusterAttention` envuelta en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax preentrenada como anclas de enrutamiento global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y sin duplicar la proyección de salida.

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), a longitud de secuencia 512, batch 8 y acumulación de gradiente 4, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 114 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo módulos de atención y layer norms con AdamW (lr 2e-4, weight decay 0,01, clipping 1,0), pesos maestros FP32 con AMP FP16, minimizando MSE por capa más 0,25·(1 − coseno). La etapa 2 (70%, 262 pasos) realiza destilación end-to-end de representaciones con un alineamiento por capas más estricto. El operador `ClusterAttention` soporta enmascaramiento causal, GQA y RoPE, con despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada de la arquitectura Qwen2.
- Atención causal con soporte de GQA y RoPE en las capas transplantadas.
- Capacidad de recuperación de representaciones internas del profesor gracias a la destilación de estados ocultos.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüe: limitado a inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre atención eficiente: sirve como banco de pruebas reproducible para medir el coste en perplejidad de sustituir atención softmax por atención por clustering en modelos pequeños, con telemetría completa de antes y después de la destilación.
- Estudio de destilación de representaciones: el protocolo en dos etapas (alineamiento de subespacio con backbone congelado y destilación end-to-end) es reutilizable como referencia metodológica para otros experimentos de cirugía de atención.
- Benchmark de operadores NeuralOps: permite validar el despacho de kernel CUDA/Triton/PyTorch de `ClusterAttention` en un modelo real con GQA y RoPE.
- Prototipado de arquitecturas híbridas: la topología 3:1 con capas ancla es un patrón concreto que se puede replicar o variar para estudiar el equilibrio entre complejidad subcuadrática y recuperación de contexto global.
- Evaluación de pipelines de serialización determinista: el checkpoint documenta serialización determinista de pesos y caché offline de representaciones, útil para reproducir experimentos en hardware de consumo (RTX 3090).
- Docencia y divulgación: ejemplo didáctico de cómo una intervención arquitectónica agresiva degrada un modelo (PPL 440.626) y cómo la destilación recupera gran parte del rendimiento (PPL 1.045,39), con cifras verificables.
- No recomendado para generación de texto en producción: su perplejidad es dos órdenes de magnitud superior a la del modelo base, por lo que su uso práctico como generador queda limitado a experimentación.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, medidos en el split de validación de WikiText-2 a longitud de secuencia 512:

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal |
| Perplejidad del estudiante tras cirugía (zero-shot) | 440.626,27 | Inmediatamente tras transplantar 18/24 capas |
| Perplejidad del estudiante tras destilación | 1.045,39 | Tras destilación en dos etapas |
| Delta absoluto de perplejidad | −439.580,89 | Mejora lograda por la destilación |
| Reducción relativa de perplejidad | 99,76% | Recuperación respecto al pico post-cirugía |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB solo de pesos, más overhead de activaciones y caché KV; viable en GPUs de 4 GB o más.
- El entrenamiento de destilación se realizó en una NVIDIA GeForce RTX 3090 de 24 GB, con 0 MB de VRAM del profesor en GPU gracias a la caché offline de representaciones.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con al menos 4 GB de VRAM en FP16.
- Opciones de despliegue: la librería declarada es `neuralops`; no se confirma compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que el operador `ClusterAttention` requiere el despacho de kernel de NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (cluster_attention) | 535.364.224 | no disponible | 1.045,39 (post-KD) | MIT | Hugging Face, libreria `neuralops` |
| Qwen/Qwen2.5-0.5B (profesor) | ~494M (segun model card del autor) | hasta 32.768 tokens | 15,38 | Apache 2.0 (modelo base Qwen) | Hugging Face, ampliamente soportado |
| Alternativas de atencion dispersa de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el profesor muestra una brecha de perplejidad de aproximadamente 68x, lo que refleja el coste de la sustitución de atención en un modelo de 0,5B.

## Limitaciones y advertencias

- Calidad predictiva muy degradada: la perplejidad post-destilación (1.045,39) es unas 68 veces la del modelo base (15,38), por lo que la generación de texto será de baja calidad.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de capacidades multilingües.
- Riesgo elevado de alucinación y texto incoherente dada la alta perplejidad y la naturaleza experimental del checkpoint.
- No es un modelo para producción: es un artefacto de investigación sobre cirugía de atención y destilación.
- Dependencia de la librería `neuralops`: el operador `ClusterAttention` no es estándar y requiere el runtime de NeuralOps para ejecutarse correctamente.
- Licencia MIT declarada, lo que permite uso comercial según los términos del repositorio NeuralOps, pero la calidad del modelo hace inviable ese uso en la práctica.
- Los benchmarks son de perplejidad en WikiText-2 únicamente; no hay evaluación en tareas downstream (razonamiento, código, matemáticas).
- Las métricas están marcadas como no verificadas (`verified: false`) en el model-index.
- El contexto máximo efectivo no está documentado para este checkpoint, aunque el modelo base soporta hasta 32.768 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-cluster-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `ClusterAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/cluster_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
