# Hooshaai/qwen-2.5-0.5b-adasplash-attention-wikitext2

## Resumen

Este repositorio contiene un checkpoint "quirúrgico" del modelo base Qwen/Qwen2.5-0.5B en el que se han sustituido 18 de las 24 capas de atención del decoder (75%) por el operador `adasplash_attention` (clase `AdaSplashAttention`) de la librería NeuralOps. El modelo resultante se ha destilado después en dos fases sobre WikiText-2 para recuperar capacidad de modelado del lenguaje. Lo publica el usuario Hooshaai bajo licencia MIT. No es un modelo nuevo de propósito general, sino un experimento de sustitución de atención y destilación de representaciones: su interés es evaluar si una atención subcuadrática (α-entmax con radio local "splash") puede reemplazar la atención softmax GQA nativa de Qwen2 preservando parte del rendimiento.

La arquitectura de partida es Qwen2.5-0.5B: transformer decoder de 494 millones de parámetros, 24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor (GQA), dimensión de cabeza 64 y RoPE con theta 1.000.000. El modelo conserva esa topología, pero en las capas transplantadas se expanden las cabezas KV de 2 a 14 y se heredan los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor. Las 6 capas restantes (índices 3, 7, 11, 15, 19 y 23) mantienen la atención softmax GQA original como anclas de enrutamiento global.

La relevancia es doble. Por un lado, documenta con telemetría medible el coste de una cirugía de atención agresiva: la perplejidad en WikiText-2 pasa de 470.312,09 en zero-shot tras el transplante a 251,72 tras la destilación, frente a 15,38 del profesor. Por otro, sirve como banco de pruebas reproducible de un pipeline de destilación de representaciones ocultas con caché offline en una única RTX 3090, sin mantener el profesor en VRAM durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 con atención híbrida: 18/24 capas con `adasplash_attention` (α-entmax + radio local splash) y 6/24 capas con GQA softmax nativa |
| Parametros totales | 494 millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (evaluado a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,37 MB, más un adaptador) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | FP16 completo (1021,37 MB) + adaptador; safetensors no confirmado explícitamente |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B y aplica una cirugía determinista con ratio `hybrid_3_1`: las capas [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `AdaSplashAttention` envuelta en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax preentrenada. Cada capa transplantada inicializa sus proyecciones desde los tensores exactos del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` heredada, para evitar el colapso de proyecciones no inicializadas. El operador soporta causalidad autoregresiva, GQA y RoPE, y ofrece despacho de kernels en tres niveles: CUDA, Triton y PyTorch. `AdaSplashAttention` combina α-entmax con un radio local de splash, lo que da complejidad subcuadrática.

El entrenamiento consistió en una destilación de representaciones ocultas en dos fases sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La fase 1 (30% del presupuesto, 95 pasos) congela el backbone y entrena solo módulos de atención y layer norms, con pesos maestros FP32, AMP FP16 con `GradScaler`, AdamW (lr 2,0e-4, weight decay 0,01, clipping 1,0) y pérdida por capa MSE + 0,25·(1 − coseno). La fase 2 (70% del presupuesto, 220 pasos) hace destilación extremo a extremo sobre los 24 flujos residuales con lr 6,0e-5 y pérdida MSE + 0,50·(1 − coseno), saltando el `lm_head`. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Conversación y generación de texto etiquetadas en el pipeline (`text-generation`, `conversational`).
- Atención subcuadrática con α-entmax y radio local splash en las capas transplantadas, con soporte de kernels CUDA/Triton/PyTorch.
- Compatibilidad con GQA y RoPE del modelo base.
- Capacidad de modelado del lenguaje medida en WikiText-2 (perplejidad 251,72), muy degradada respecto al profesor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en atención subcuadrática: sirve como checkpoint de referencia para comparar `adasplash_attention` frente a softmax GQA en un modelo compacto, con telemetría de perplejidad antes y después de la destilación.
- Reproducción de pipelines de destilación de representaciones: el protocolo en dos fases con caché offline de representaciones del profesor permite replicar el entrenamiento en una única GPU de 24 GB, útil para laboratorios con recursos limitados.
- Banco de pruebas de cirugía de atención: permite medir el impacto de ratios híbridos (3:1 en este caso) y de la selección de capas ancla sobre la calidad del modelo.
- Evaluación de kernels: el despacho en tres niveles (CUDA/Triton/PyTorch) permite comparar latencia y corrección de implementaciones de atención subcuadrática en hardware consumer.
- Docencia y experimentación: modelo pequeño (494M) y licencia MIT que facilitan su uso en cursos sobre transformers, atención eficiente y destilación.
- Generación de texto en inglés de baja exigencia: puede usarse en prototipos donde la calidad no sea crítica y se priorice el coste computacional, dado su tamaño reducido.
- No recomendado para producción conversacional: la perplejidad de 251,72 frente a 15,38 del profesor indica una degradación severa de la calidad lingüística.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre WikiText-2 (`wikitext-2-raw-v1`), split de validación, longitud de secuencia 512, batch size 8 y acumulación de gradiente 4, en una RTX 3090 de 24 GB.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen/Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante zero-shot tras el transplante | 470.312,09 | Inmediatamente después de sustituir 18/24 capas |
| Perplejidad del estudiante tras destilación | 251,72 | Tras destilación de representaciones en dos fases |
| Delta absoluto de perplejidad | −470.060,37 | Cambio logrado con la destilación |
| Reducción relativa de perplejidad | 99,95% | Recuperación respecto al pico post-cirugía |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 1,02 GB (1021,37 MB); con overhead de activaciones y contexto, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó y evaluó en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs de gama baja con suficiente VRAM.
- Opciones de despliegue: la librería es `neuralops`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El operador `adasplash_attention` requiere los kernels de NeuralOps (CUDA/Triton/PyTorch), lo que limita el uso de runtimes estándar sin adaptación.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Hooshaai/qwen-2.5-0.5b-adasplash-attention-wikitext2 | 494M | no disponible | 251,72 (post-KD) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | no disponible en la información proporcionada | 15,38 | no disponible en la información proporcionada | Hugging Face |
| Otros checkpoints de atención eficiente sobre Qwen2.5-0.5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el profesor muestra una diferencia de perplejidad de más de un orden de magnitud, lo que sitúa a este checkpoint en la categoría de experimento de investigación más que de modelo listo para uso general.

## Limitaciones y advertencias

- Calidad lingüística muy degradada: perplejidad de 251,72 frente a 15,38 del profesor en WikiText-2, lo que implica generaciones menos coherentes y mayor tasa de errores.
- Riesgo elevado de alucinación y de texto incoherente, especialmente fuera del dominio de WikiText-2.
- El modelo solo declara soporte de inglés; no se garantiza comportamiento en otros idiomas.
- La longitud de contexto efectiva no está documentada; la evaluación se realizó a 512 tokens, por lo que no hay garantías más allá de esa longitud.
- Dependencia de la librería `neuralops` y de sus kernels (CUDA/Triton/PyTorch): no es directamente compatible con runtimes de inferencia estándar sin trabajo de adaptación.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen2.5-0.5B, hereda los sesgos del corpus de entrenamiento original.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin validación exhaustiva.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`).
- El checkpoint incluye pesos FP16 completos más un adaptador; conviene revisar qué artefacto cargar según el caso de uso.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-adasplash-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Librería NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `adasplash_attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/adasplash_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
