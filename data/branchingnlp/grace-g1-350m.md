# BranchingNLP/Grace-G1-350M

## Resumen

Grace-G1-350M es un modelo de lenguaje de tipo base (no instruction-tuned) bilingüe italiano-inglés desarrollado desde cero por BranchingNLP, un proyecto individual liderado por Michelangelo Di Nicola. Forma parte de la familia Grace (55M a 1B), orientada a modelos generalistas pequeños y eficientes con licencia Apache-2.0. El modelo cuenta con 377,2 millones de parámetros reales según los pesos en safetensors, aunque se comercializa bajo la denominación "350M".

La arquitectura es un transformer híbrido que combina capas de Gated DeltaNet (un mixer lineal del ecosistema flash-linear-attention) con atención completa en una proporción 3:1. Emplea GQA con 16 cabezas de consulta y 4 de clave-valor, QK-norm, RoPE y una puerta de salida sigmoide al estilo Qwen3-Next. El entrenamiento se realizó con el optimizador Muon para matrices 2D y AdamW para embeddings y normalizaciones, sobre 7.000 millones de tokens en un régimen próximo al compute-optimal de Chinchilla.

Su relevancia radica en ser un experimento reproducible de arquitectura lineal híbrida a pequeña escala, entrenado en una única RTX 5090, con pesos abiertos y código de inferencia incluido en el repositorio. El contexto es de solo 2048 tokens y requiere GPU con kernels Triton, lo que limita su uso práctico pero lo convierte en una referencia útil para investigación sobre mixers lineales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (mixer lineal) en proporción 3:1 con atención completa gated; GQA + QK-norm + RoPE + output gate sigmoide |
| Parámetros totales | 377.156.016 (377,2M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors en bf16/fp; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Italiano (it) e inglés (en) |
| Licencia | Apache-2.0 (pesos y código); los datasets de entrenamiento conservan sus licencias originales |
| Formato de pesos | safetensors (model.safetensors), más config.json y proxy_arch.py para carga |
| d_model | 1024 |
| Capas | 24 |
| Cabezas de atención | 16 query / 4 kv (GQA) |
| Cabezas GDN / head_dim | 12 / 64 |
| FFN | SwiGLU, d_ff 2816 |
| Normalización | RMSNorm (pre-norm) |
| Vocabulario | 32768 (BPE) |
| Optimizador | Muon (matrices 2D) + AdamW (embeddings y normas) |
| Tokens de entrenamiento | 7B (~19 tokens/parámetro) |
| Hardware de entrenamiento | RTX 5090 |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido en el que cada bloque de tres capas de Gated DeltaNet se intercala con una capa de atención completa con puerta. Gated DeltaNet es un mecanismo de estado recurrente lineal con compuertas que reduce el coste computacional frente a la atención cuadrática, mientras que las capas de atención completa preservan la capacidad de recuperación exacta a corta distancia. La atención usa GQA (16 cabezas de consulta, 4 de clave-valor), QK-norm, RoPE y una puerta de salida sigmoide inspirada en Qwen3-Next. La FFN es SwiGLU con dimensión 2816 y la normalización es RMSNorm en configuración pre-norm. El vocabulario BPE de 32.768 tokens está ajustado al par italiano-inglés.

El entrenamiento cubrió 7.000 millones de tokens, aproximadamente 19 tokens por parámetro, en un régimen cercano al compute-optimal de Chinchilla. Se empleó un schedule WSD (warmup-stable-decay) con decaimiento en el último 20% del entrenamiento. La mezcla de datos fue bilingüe IT/EN e incluyó web (FineWeb-Edu, FineWeb2-it, Nemotron-CC), Wikipedia, libros, código, matemáticas y pares de pregunta-respuesta. La pérdida de validación final reportada es 2,0496. Todo el entrenamiento se ejecutó en una única RTX 5090. No se documenta uso de RLHF ni DPO, coherente con su naturaleza de modelo base.

## Capacidades

- Generación de texto autoregresiva: completado de texto y continuación de secuencias en italiano e inglés.
- Modelado de lenguaje bilingüe: entrenado explícitamente con mezcla IT/EN, con vocabulario BPE de 32.768 tokens.
- Razonamiento básico y conocimiento factual de entidades conocidas, limitado por el tamaño del modelo.
- Capacidad matemática y de razonamiento débil en la versión base, según reconoce el propio autor (se espera mejora tras SFT en la variante Instruct).
- No soporta tool calling ni function calling de forma nativa (es un modelo base, no instruction-tuned).
- No soporta agentes ni razonamiento multi-paso de forma fiable sin post-entrenamiento.
- No dispone de modo thinking, visión ni audio.
- No se documentan capacidades multilingües más allá de italiano e inglés.

## Casos de uso

- Investigación sobre arquitecturas lineales híbridas: el modelo permite reproducir y estudiar el comportamiento de Gated DeltaNet intercalado con atención completa a escala pequeña, con pesos abiertos y código de carga incluido en el repositorio.
- Fine-tuning supervisado (SFT) para crear asistentes conversacionales bilingües IT/EN: el autor prevé publicar Grace-G1-350M-Instruct tras SFT, por lo que este base sirve como punto de partida para dicho proceso.
- Generación de texto asistida en italiano para dominios acotados: completado de descripciones, resúmenes cortos o borradores donde el contexto de 2048 tokens sea suficiente y no se requiera precisión factual en long-tail.
- Experimentos de destilación o comparación de optimizadores: al usar Muon para matrices 2D, es un caso de estudio reproducible sobre el efecto del optimizador en modelos pequeños.
- Benchmarking de kernels Triton y eficiencia: útil para medir throughput y latencia de Gated DeltaNet frente a atención pura en GPUs consumer, dado que requiere la librería fla.
- Prototipado de pipelines de generación en entornos con una sola GPU: al entrenarse y ejecutarse en una RTX 5090, sirve para validar infraestructura de inferencia antes de escalar a modelos mayores.
- Evaluación de sesgos y calidad lingüística en modelos pequeños bilingües: permite analizar el comportamiento de un modelo de 377M en italiano frente a inglés con datos de entrenamiento documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación final de 2,0496 tras 7B tokens de entrenamiento. No hay datos de MMLU, HumanEval, GSM8K ni de comparativas estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los 377,2M de parámetros en bf16 ocupan aproximadamente 0,75 GB; en fp32, unos 1,5 GB. A ello hay que sumar el estado de los kernels y el overhead de activaciones, por lo que se recomienda al menos 4-6 GB de VRAM en bf16 para secuencias de 2048 tokens.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y kernels Triton; el autor entrenó en una RTX 5090. Se espera funcionamiento en RTX 3090, RTX 4090, A100 y H100, aunque no se documentan pruebas en estas.
- GPU consumer: sí cabe en GPUs consumer modernas (RTX 3060 12 GB en adelante, RTX 4060 Ti, RTX 4070, RTX 4090, RTX 5090), siempre que se instale fla-core.
- CPU: no soportado. Los layer de Gated DeltaNet no se ejecutan en CPU según el autor; se requiere GPU CUDA.
- Opciones de despliegue: carga manual con safetensors + proxy_arch.py + transformers (tokenizer); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La dependencia de kernels Triton de flash-linear-attention complica la integración con servidores de inferencia estándar.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grace-G1-350M | 377,2M | 2048 | Híbrido Gated DeltaNet + atención (3:1) | Apache-2.0 | Hugging Face (safetensors) |
| Qwen2.5-0.5B | ~494M | 32.768 | Transformer denso con GQA + RoPE | Apache-2.0 | Hugging Face, GGUF, vLLM, Ollama |
| SmolLM2-360M | ~362M | 8192 | Transformer denso | Apache-2.0 | Hugging Face, GGUF, vLLM, Ollama |
| Gemma-2-2B | ~2,6B | 8192 | Transformer denso | Gemma license | Hugging Face, GGUF, vLLM |

La comparación con Qwen2.5-0.5B y SmolLM2-360M es la más directa por rango de parámetros. Grace-G1-350M destaca por su arquitectura híbrida lineal y su enfoque bilingüe IT/EN, pero queda por detrás en longitud de contexto (2048 frente a 8192-32768), en ecosistema de despliegue (sin GGUF ni soporte en servidores estándar) y en datos de benchmarks publicados. No se dispone de comparativas de rendimiento medidas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base: no sigue instrucciones ni mantiene formato conversacional; requiere SFT o prompting de completado para tareas dirigidas.
- Conocimiento limitado por tamaño: conoce entidades famosas pero inventa en long-tail (personas o eventos de nicho) y en números específicos; no debe usarse como fuente enciclopédica.
- Matemáticas y razonamiento débiles en la versión base, según reconoce el autor.
- Contexto corto de 2048 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o recuperación aumentada con muchos fragmentos.
- Requiere GPU CUDA y la librería fla (kernels Triton); no funciona en CPU y su integración con vLLM, llama.cpp, Ollama o TGI no está documentada, lo que limita el despliegue en producción.
- Riesgo de alucinación elevado en hechos, cifras y referencias, inherente a un modelo de 377M entrenado con 7B tokens.
- Sesgos potenciales heredados de los datasets web (FineWeb-Edu, FineWeb2-it, Nemotron-CC) y de la mezcla IT/EN, no evaluados en la model card.
- Licencia Apache-2.0 para pesos y código, pero los datasets de entrenamiento conservan sus licencias originales; conviene revisar las condiciones de cada fuente antes de usos comerciales derivados.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento ni soporte de la comunidad.
- La carga requiere trust_remote_code=True y el módulo proxy_arch.py incluido en el repositorio, lo que implica ejecutar código del autor.

## Enlaces

- Hugging Face: https://huggingface.co/BranchingNLP/Grace-G1-350M
- Perfil del autor: https://huggingface.co/BranchingNLP
- Librería flash-linear-attention (requerida para los kernels Gated DeltaNet): https://github.com/fla-org/flash-linear-attention
- Referencia de arquitectura Qwen3-Next (inspiración del output gate): no disponible como enlace verificado en la información proporcionada
- Paper de Gated DeltaNet: no disponible en la información proporcionada
- Repositorio de código del modelo: no disponible (solo se incluye proxy_arch.py dentro del repositorio de Hugging Face)
