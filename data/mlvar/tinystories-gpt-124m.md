# mlvar/tinystories-gpt-124m

## Resumen

TinyStories GPT-124M es un transformer decoder-only de estilo GPT entrenado desde cero en PyTorch por el autor mlvar sobre el conjunto de datos TinyStories. Con 124,4 millones de parámetros, 12 capas y una longitud de contexto de 1024 tokens, el modelo sigue la arquitectura clásica de GPT-2 (d_model 768, 12 cabezas de atención de 64 dimensiones, feed-forward de 3072 con activación GELU) e incorpora atención causal mediante `F.scaled_dot_product_attention`, lo que habilita Flash Attention en GPUs compatibles.

El modelo no parte de pesos preentrenados ni de frameworks de alto nivel: la atención, los MLP, el bucle de entrenamiento y el pipeline de tokenización están implementados explícitamente en unas 700 líneas de Python. Se entrenó durante 50.000 pasos sobre aproximadamente 3.280 millones de tokens (unas 7 épocas del split de entrenamiento de TinyStories) en una única RTX 5080 de 16 GB, alcanzando una pérdida de validación exhaustiva de 1,1331 (perplejidad 3,09).

Su relevancia es fundamentalmente educativa y de investigación: sirve como referencia reproducible de un entrenamiento completo de un LM pequeño desde cero, con código, configuración y métricas publicadas. No está pensado para uso en producción ni para tareas generales, ya que su dominio se limita a narrativas infantiles simples en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (pre-LayerNorm, embeddings posicionales absolutos aprendidos, embeddings de entrada/salida atados) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | en (solo inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) y checkpoints `.pt` para entrenamiento |
| Capas | 12 |
| d_model / cabezas / d_head | 768 / 12 / 64 |
| Feed-forward | 3072 (4x, GELU con aproximación tanh) |
| Vocabulario | 50.257 (BPE de GPT-2 vía `tiktoken`) |
| Precisión de entrenamiento | bfloat16 con mixed precision |
| Compatibilidad con Transformers | no (arquitectura propia, requiere la clase `GPT` incluida) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar con normalización pre-LayerNorm, embeddings posicionales absolutos aprendidos y proyecciones de atención calculadas con `F.scaled_dot_product_attention(is_causal=True)`, lo que activa Flash Attention en GPUs soportadas. El feed-forward usa una expansión de 4x con GELU aproximado por tanh. Los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros. El tokenizador es BPE de GPT-2 con 50.257 tokens, implementado con `tiktoken`.

El entrenamiento se realizó sobre TinyStories (469,4 millones de tokens de entrenamiento y 4,72 millones de validación) durante 50.000 pasos con un batch efectivo de 65.536 tokens por paso (16 de micro-batch × 4 de acumulación × 1024 tokens), lo que supone unos 3.280 millones de tokens vistos, aproximadamente 7 épocas. Se usó AdamW (β₁=0,9, β₂=0,95, ε=1e-8, weight decay 0,1 sin decaimiento en biases ni LayerNorm), warmup lineal de 500 pasos seguido de decaimiento coseno de 3e-4 a 1e-5, y clipping de gradiente de 1,0. Todo el entrenamiento se ejecutó en una sola RTX 5080 de 16 GB en modo eager de PyTorch (Triton no disponible en Windows), con semilla 42. No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto narrativo simple en inglés, orientado a historias infantiles con vocabulario y estructuras sintácticas sencillas.
- Continuación de prompts cortos con coherencia local dentro de la ventana de 1024 tokens.
- Modelado de lenguaje causal autorregresivo con muestreo configurable (temperatura, top-k).
- Entrenamiento y evaluación reproducibles desde el propio repositorio (scripts de entrenamiento, evaluación exhaustiva y muestreo cualitativo).
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe nula: solo inglés.

## Casos de uso

- Investigación educativa sobre entrenamiento de LMs: el repositorio incluye el bucle de entrenamiento, la configuración exacta y las métricas, lo que permite reproducir el entrenamiento completo en una sola GPU consumer y estudiar el efecto de cada hiperparámetro.
- Experimentos de scaling laws en dominios controlados: al usar TinyStories, un corpus sintético y acotado, se pueden aislar variables de arquitectura y datos sin la complejidad de corpus web a gran escala.
- Generación de cuentos infantiles sintéticos: el modelo produce narrativas cortas y simples en inglés adecuadas para prototipos de aplicaciones de cuentacuentos, siempre con revisión humana.
- Benchmark de referencia para comparar implementaciones: sirve como baseline reproducible (perplejidad 3,09 en validación) frente a otras implementaciones de GPT pequeño o variantes de atención.
- Docencia y talleres de PyTorch: el código de ~700 líneas, sin dependencias de frameworks de alto nivel, es adecuado para explicar atención, tokenización y bucles de entrenamiento paso a paso.
- Pruebas de pipelines de inferencia y cuantización: al ser un modelo pequeño con pesos safetensors, permite validar herramientas de despliegue y medir latencia en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pérdida de validación (exhaustiva) | 1,1331 |
| Perplejidad de validación | 3,09 |
| Tokens de validación evaluados | 4.723.712 (4.613 ventanas no solapadas de 1024 tokens) |
| Pérdida de validación (estilo entrenamiento, 50 batches × 16) | 1,1483 |
| Pérdida en split de entrenamiento (200 batches × 16) | 1,0404 |
| Brecha train→val | +0,093 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124,4M parámetros × 4 bytes), más overhead de activaciones y contexto; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- VRAM para inferencia en bf16: aproximadamente 0,25 GB para los pesos; el modelo se entrenó y evaluó en bf16, por lo que esta es la precisión recomendada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de bfloat16 y Flash Attention (RTX 30xx/40xx/50xx, A100, H100). El entrenamiento original se completó en una RTX 5080 de 16 GB.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM para inferencia; el entrenamiento requiere aproximadamente 16 GB en la configuración documentada.
- Opciones de despliegue: no es compatible con `transformers.AutoModelForCausalLM`, vLLM, TGI ni llama.cpp de forma directa; requiere cargar los pesos con `safetensors` y la clase `GPT` incluida en `src/`. El repositorio ofrece `scripts/load_pretrained.py` y un CLI `main.py` con comandos `train` y `generate`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| TinyStories GPT-124M (mlvar) | 124,4M | 1024 | Desde cero, TinyStories, ~3,28B tokens | no disponible | Solo código propio |
| GPT-2 small (OpenAI) | 124M | 1024 | WebText, ~40B tokens | MIT | `transformers`, ecosistema amplio |
| TinyStories-33M (roneneldan) | 33M | 512 | TinyStories | MIT (según repositorio original) | `transformers` |
| TinyLlama-1.1B | 1,1B | 2048 | 3T tokens (SlimPajama, etc.) | Apache 2.0 | `transformers`, vLLM, llama.cpp |

La comparación directa más cercana es GPT-2 small, con idéntico número de parámetros y contexto, pero entrenado sobre un corpus web mucho mayor y con licencia permisiva. TinyStories-33M comparte dominio de datos pero es cuatro veces menor. TinyLlama-1.1B es un orden de magnitud mayor y está orientado a uso general. Los datos de rendimiento de los modelos comparados no se incluyen en la información disponible para esta ficha.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre TinyStories, un corpus de narrativas infantiles simples; el vocabulario y las estructuras que maneja son muy limitados y no generaliza a otros dominios.
- Solo inglés; no soporta otros idiomas.
- Ventana de contexto de 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo elevado de alucinación y de incoherencia fuera del dominio de historias infantiles.
- No dispone de ajuste por instrucciones ni de alineación (sin RLHF/DPO); no sigue instrucciones de forma fiable.
- Licencia no especificada en la información disponible: debe verificarse antes de cualquier uso comercial o redistribución.
- Arquitectura personalizada no compatible con `transformers`, lo que dificulta la integración en pipelines estándar y el uso de herramientas como vLLM o TGI.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus sintético infantil puede reflejar las simplificaciones y estereotipos presentes en dicho corpus.
- No apto para producción: es un artefacto de investigación y reproducibilidad, no un modelo de propósito general.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlvar/tinystories-gpt-124m)
- [Dataset TinyStories (roneneldan/TinyStories)](https://huggingface.co/datasets/roneneldan/TinyStories)
- [Paper TinyStories: How Small Can Language Models Be and Still Speak Coherent English?](https://arxiv.org/abs/2305.07759)
- [Repositorio original TinyStories (roneneldan)](https://github.com/roneneldan/TinyStories)
- [tiktoken (tokenizador BPE de GPT-2)](https://github.com/openai/tiktoken)
- [PyTorch](https://pytorch.org/)
- [safetensors](https://github.com/huggingface/safetensors)
