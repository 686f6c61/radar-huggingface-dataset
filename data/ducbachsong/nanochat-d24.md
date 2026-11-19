# ducbachsong/nanochat-d24

## Resumen

nanochat-d24 es un modelo de lenguaje base de 733 millones de parámetros desarrollado por el usuario ducbachsong. Se trata de un experimento de entrenamiento desde cero siguiendo la estela del proyecto nanochat de Andrej Karpathy, pero con una particularidad técnica destacable: todas las multiplicaciones de matrices del bucle de entrenamiento se ejecutan en precisión FP8 (E4M3) mediante kernels CUDA/C++ escritos a mano, sin cuBLAS ni PyTorch en el paso de entrenamiento, al estilo de llm.c.

El modelo emplea una arquitectura GPT-2-style de 24 capas con anchura 1.536 y 12 cabezas de atención de 128 dimensiones, con una ventana de contexto de 2.048 tokens. Incorpora innovaciones propias de nanochat como QK-norm sin pesos aprendidos, ventana de atención deslizante de 512 tokens en tres de cada cuatro capas, logit softcap y tying de la cabeza de salida con los embeddings de entrada.

Es relevante como caso de estudio de eficiencia: entrenado sobre 5.460 millones de tokens de NVIDIA ClimbMix en solo 1,58 horas en 8 GPUs H100 SXM con una MFU del 53,8%, y con un loss de validación final de 2,846 nats/token. Al ser un modelo base sin ajuste por instrucciones, su utilidad práctica directa es limitada, pero resulta interesante para investigación sobre entrenamiento en FP8, reproducción de recetas nanochat y experimentación con modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2-style decoder (transformer denso) |
| Parámetros totales | 733.105.152 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; entrenamiento en FP8 E4M3) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16, 1,47 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de tipo GPT-2 con 24 capas, anchura 1.536, 12 cabezas de atención de 128 dimensiones y MLP de 1.536 → 6.144 → 1.536 con activación GELU (forma tanh). Usa embeddings posicionales aprendidos (`wpe`) sumados a los de token (`wte`), pre-LayerNorm con peso y sesgo (eps 1e-5) antes de atención, antes del MLP y al final, y ausencia de sesgos en las capas lineales. La cabeza de salida está atada a `wte` y se aplica un logit softcap de 15 mediante `15 · tanh(logits / 15)`. La atención es causal con ventana deslizante de 512 tokens en tres de cada cuatro capas (0-2, 4-6, etc.) y contexto completo en cada cuarta capa y en la última. Cada cabeza de query y key se normaliza por RMS a 1 y se multiplica por 1,2, sin pesos aprendidos (QK-norm).

El entrenamiento se realizó sobre 5.463.080.960 tokens de NVIDIA ClimbMix (una sola pasada, sin repetición), tokenizados con el tokenizer de nanochat (rustbpe, patrón de split de GPT-4, vocabulario de 32.768). Se usó AdamW con β 0,9/0,95, weight decay 0,1, clipping de norma 1, learning rate 3e-4 con 700 pasos de warm-up y decaimiento coseno, batch de 524.288 tokens por paso durante 10.420 pasos. La innovación principal es que todas las multiplicaciones de matrices (las cuatro lineales por capa, el producto q·kᵀ y la cabeza) se ejecutan en FP8 E4M3 con una escala por tensor y escalado diferido, mientras activaciones, gradientes y residual están en bfloat16 y los pesos maestros en float32. Se entrenó en 8× H100 SXM durante 1,58 horas con una MFU media del 53,8%.

## Capacidades

- Generación de texto autoregresiva en inglés (modelo base, sin ajuste por instrucciones).
- Continuación de texto y modelado de lenguaje puro.
- Razonamiento básico derivado del preentrenamiento (sin RLHF ni DPO).
- Capacidad limitada de código y matemáticas por el corpus de entrenamiento, sin datos de benchmark que lo confirmen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre entrenamiento en FP8: el modelo sirve como referencia reproducible para estudiar el impacto del entrenamiento con productos de matrices en FP8 E4M3 (escalado diferido) sobre la estabilidad y el loss final, comparándolo con una línea base en bfloat16.
- Reproducción y experimentación con nanochat: permite validar la receta de nanochat en tamaño d24, incluyendo QK-norm, ventana deslizante y logit softcap, partiendo de los kernels CUDA y el trainer publicados en el repositorio del autor.
- Generación de texto en inglés como modelo base: útil para tareas de continuación de texto, completado de documentos y generación de datos sintéticos de dominio general, aunque sin instrucciones ni alineación.
- Punto de partida para fine-tuning: al ser un modelo base de 733M con contexto de 2.048 tokens, puede ajustarse por instrucciones o a un dominio concreto en hardware modesto, dado su tamaño contenido.
- Estudio de eficiencia energética y de cómputo: el registro detallado de FLOPs por token (4,795 × 10⁹), tokens/s (960.317) y MFU (53,8%) permite analizar el coste de entrenamiento de modelos pequeños en GPUs H100.
- Docencia y aprendizaje: sirve para demostrar el ciclo completo de un LLM (tokenizer, entrenamiento, exportación a safetensors y forward pass en PyTorch puro) sin depender del ecosistema de transformers.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son la evolución del loss de validación durante el entrenamiento (ClimbMix val split, nats por token):

| Paso | 1.000 | 2.000 | 3.000 | 4.000 | 5.000 | 6.000 | 7.000 | 8.000 | 9.000 | 10.420 |
|---|---|---|---|---|---|---|---|---|---|---|
| Loss de validación | 4,065 | 3,430 | 3,213 | 3,119 | 3,016 | 2,967 | 2,911 | 2,877 | 2,855 | 2,846 |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, menos de 4 GB con contexto completo.
- VRAM en cuantizaciones de 8 bits o 4 bits: no publicadas por el autor; una conversión a GGUF de 8 bits rondaría los 0,75 GB y a 4 bits unos 0,4 GB, estimaciones orientativas no verificadas.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en servidor, A100, H100 o L40S sin problema.
- Cabe holgadamente en GPU consumer.
- Opciones de despliegue: `transformers` no puede cargarlo con las clases GPT-2 estándar; el autor proporciona un forward pass en PyTorch puro con safetensors. No hay confirmación de soporte en vLLM, llama.cpp, Ollama ni TGI; requeriría conversión manual.
- Latencia y throughput estimados: no disponibles para inferencia; en entrenamiento se alcanzaron 960.317 tokens/s con 8× H100 SXM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| nanochat-d24 | 733M | 2.048 | no disponible | safetensors, layout propio |
| GPT-2 (1.5B) | 1.500M | 1.024 | MIT | safetensors, compatible con transformers |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | safetensors, transformers, GGUF |
| SmolLM2-1.7B | 1.700M | 8.192 | Apache 2.0 | safetensors, transformers, GGUF |

nanochat-d24 destaca por su contexto corto (2.048) frente a alternativas modernas de tamaño similar, por su falta de licencia declarada y por un layout de pesos incompatible con el ecosistema estándar. Su interés es fundamentalmente de investigación, no de producción.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni chat: no responde a preguntas ni sigue instrucciones de forma fiable.
- Contexto muy limitado (2.048 tokens) en comparación con modelos actuales.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Licencia no disponible: no puede asumirse uso comercial sin contactar con el autor.
- Layout de pesos propio incompatible con `transformers`; requiere código de carga personalizado.
- Incompatibilidad conocida con herramientas estándar (vLLM, llama.cpp, Ollama) salvo conversión manual.
- Riesgo elevado de alucinación y de contenido sesgado, dado el corpus ClimbMix y la ausencia de alineación.
- El tokenizer se distribuye como pickle, lo que implica riesgo de ejecución de código al cargarlo; solo debe cargarse desde fuentes de confianza.
- Sin benchmarks publicados (MMLU, HumanEval, GSM8K), lo que impide evaluar su calidad frente a alternativas.
- El loss de validación (2,846 nats/token) no es directamente comparable con métricas de otros modelos por diferencias de tokenizer y dataset.

## Enlaces

- Hugging Face: https://huggingface.co/ducbachsong/nanochat-d24
- Repositorio GitHub (kernels CUDA, trainer, scripts): https://github.com/ducbachsong/nanochat
- Proyecto nanochat original de Andrej Karpathy (referencia): https://github.com/karpathy/nanochat
- llm.c (referencia de estilo de kernels): https://github.com/karpathy/llm.c
- NVIDIA ClimbMix (dataset de entrenamiento): no disponible enlace directo en la información proporcionada
