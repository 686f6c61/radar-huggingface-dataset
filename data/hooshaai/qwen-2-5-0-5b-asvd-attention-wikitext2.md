# Hooshaai/qwen-2.5-0.5b-asvd-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-asvd-attention-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps "Attention Surgery Zoo". No es un modelo entrenado desde cero, sino una cirugía sobre `Qwen/Qwen2.5-0.5B` en la que 18 de las 24 capas de atención del decoder original se sustituyen por el operador `ASVDAttention` (atención ASVD con descomposición de bajo rango factorizada, GQA, RoPE y LoRA) de la librería NeuralOps. Las 6 capas restantes conservan la atención softmax GQA nativa de Qwen2 como anclas de recuperación contextual, siguiendo un patrón híbrido 3:1.

Tras la sustitución, el modelo se destila en dos etapas sobre WikiText-2 para recuperar capacidad predictiva, ya que el transplante quirúrgico deja el modelo en un estado de perplejidad catastrófica (254.182,30) que la destilación reduce hasta 77,30 en el split de validación. El modelo base de referencia (Qwen2.5-0.5B sin modificar) obtiene 15,38 de perplejidad en el mismo conjunto, de modo que la cirugía no iguala al profesor y debe entenderse como una pieza de investigación sobre eficiencia de atención, no como un sustituto de producción.

Su relevancia es acotada: sirve para estudiar el impacto de operadores de atención subcuadrática en modelos causales compactos, para reproducir el pipeline de destilación de NeuralOps y como banco de pruebas de arquitecturas híbridas. Con 483.756.928 parámetros y licencia MIT, es un artefacto de investigación reproducible más que un modelo conversacional listo para desplegar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen2) con 18/24 capas sustituidas por `ASVDAttention` (ASVD, bajo rango factorizado, GQA, RoPE, LoRA) y 6 capas con atención softmax GQA nativa |
| Parametros totales | 483.756.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens; la model card no declara contexto propio) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 922,76 MB, más un adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas de decoder, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión de cabeza 64 y RoPE con theta=1.000.000. La cirugía reemplaza las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `ASVDAttention` envuelto en `QwenAttentionAdapter`, y preserva las capas [3, 7, 11, 15, 19, 23] con la atención softmax original como anclas. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas. El operador ASVD factoriza las proyecciones en rango bajo (coste O(B·N·r·(d+d_all))) pero mantiene el scoring de atención cuadrático O(B·H·N²·d_k), por lo que la ganancia de eficiencia proviene de las proyecciones, no del mecanismo de atención en sí. El despacho de kernels es de tres niveles: CUDA, Triton y PyTorch.

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 124 pasos) congela el backbone y entrena solo módulos de atención y layer norms, con pesos maestros FP32, AMP FP16 con GradScaler, AdamW (lr=2.0e-4, weight_decay=0.01, clipping de gradiente 1.0) y una pérdida combinada de MSE por capa más 0,25·(1 − coseno) sobre los estados ocultos. La etapa 2 no está detallada en la información disponible. La perplejidad pasa de 254.182,30 en zero-shot tras la cirugía a 77,30 tras la destilación, una reducción relativa del 99,97%.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Soporte de atención causal con GQA y RoPE gestionado por el adaptador.
- Capacidad conversacional declarada en las etiquetas del repositorio (`conversational`).
- Tool calling y function calling: no disponible como capacidad verificada en este checkpoint; el modelo base lo soporta, pero la cirugía y la destilación sobre WikiText-2 no garantizan su preservación.
- Razonamiento multi-paso y uso como agente: no disponible como capacidad verificada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre atención subcuadrática: el checkpoint permite medir el coste en perplejidad de sustituir atención softmax por ASVD en un decoder compacto, comparando directamente contra el profesor de 15,38 de perplejidad en WikiText-2.
- Reproducción del pipeline de destilación de NeuralOps: sirve para validar la arquitectura de caché offline de representaciones y el protocolo de dos etapas con presupuesto del 30% y 124 pasos en la primera fase.
- Estudio de topologías híbridas: la configuración 3:1 con anclas en las capas [3, 7, 11, 15, 19, 23] permite experimentar con distintas proporciones de capas transplantadas y medir el efecto en la recuperación de heads de inducción.
- Benchmark de operadores de atención: útil como caso de prueba para comparar `ASVDAttention` frente a otras implementaciones del registro `ATTENTION_REGISTRY` de NeuralOps en términos de perplejidad y throughput.
- Docencia y divulgación técnica: ejemplo reproducible de cirugía de atención y destilación de representaciones en un modelo que cabe en una GPU de consumo.
- Evaluación de robustez post-cirugía: analizar qué capacidades del modelo base se degradan tras el transplante y la destilación limitada a WikiText-2, útil para diseñar protocolos de recuperación más amplios.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, medidos sobre WikiText-2 (`wikitext-2-raw-v1`, split de validación) con longitud de secuencia 512, batch_size=8 y grad_accum=4 en una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 |
| Perplejidad del estudiante zero-shot tras cirugía | 254.182,30 |
| Perplejidad del estudiante tras destilación | 77,30 |
| Delta absoluto de perplejidad | −254.105,00 |
| Reducción relativa de perplejidad | 99,97% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (922,76 MB) más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,5 GB; en 4 bits, alrededor de 0,3 GB (estimaciones a partir del tamaño de pesos, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor validó el entrenamiento en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: la librería `neuralops` es necesaria para cargar el operador `ASVDAttention`; no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint no está en formato GGUF y requiere el registro de atención de NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-asvd-attention-wikitext2 | 483.756.928 | no disponible | 77,30 (post-KD) | MIT | Hugging Face, requiere `neuralops` |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face, transformers estándar |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | no disponible | Apache 2.0 | Hugging Face, transformers estándar |

La comparación directa con el profesor es la más informativa: la cirugía y la destilación sobre WikiText-2 multiplican por cinco la perplejidad (15,38 → 77,30) a cambio de un operador de atención con proyecciones factorizadas. No se dispone de datos de otros modelos con atención subcuadrática comparables en la información proporcionada.

## Limitaciones y advertencias

- La perplejidad post-destilación (77,30) es cinco veces superior a la del modelo base (15,38); el checkpoint no es apto como sustituto directo de Qwen2.5-0.5B en producción.
- La destilación se limita a WikiText-2, un corpus enciclopédico en inglés; es probable que las capacidades conversacionales, de código y de razonamiento del modelo base estén severamente degradadas, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Solo se declara soporte de inglés; el comportamiento multilingüe del modelo base no está garantizado tras la cirugía.
- Riesgo de alucinación elevado por la pérdida de capacidad predictiva y por el dominio restringido del conjunto de destilación.
- La licencia MIT del checkpoint es permisiva, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene verificar la compatibilidad de ambas licencias en uso comercial.
- Requiere la librería `neuralops` para cargar el operador `ASVDAttention`; no es un checkpoint estándar de `transformers` y puede no funcionar con herramientas de inferencia convencionales.
- El autor no detalla la segunda etapa de destilación ni publica evaluaciones fuera de WikiText-2, lo que limita la reproducibilidad completa del resultado.
- Sesgos conocidos: no disponibles; los sesgos del modelo base pueden persistir o amplificarse tras la destilación en un corpus enciclopédico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-asvd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de `ASVDAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/asvd_attention.py
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
