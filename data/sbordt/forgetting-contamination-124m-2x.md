# sbordt/forgetting-contamination-124M-2x

## Resumen

El modelo `sbordt/forgetting-contamination-124M-2x` es un checkpoint de investigación de GPT-2 de 124 millones de parámetros, entrenado por Sebastian Bordt y colaboradores (Universidad de Tubinga) para el estudio "How much can we forget about Data Contamination?" presentado en ICML 2025. No es un modelo de propósito general: es un artefacto experimental diseñado para medir hasta qué punto un modelo entrenado con contaminación de benchmarks (preguntas de evaluación insertadas en los datos de entrenamiento) puede "olvidar" esa información cuando se hace un ajuste fino posterior.

La arquitectura es un GPT-2 estándar en la configuración `d12` de llm.c (12 capas, 12 cabezas de atención, dimensión de embedding 768, contexto de 1024 tokens, vocabulario de 50257 tokens). Se entrenó sobre una muestra de 5 mil millones de tokens de FineWeb-Edu, equivalente a 2 veces el presupuesto Chinchilla para este tamaño, con preguntas de ocho benchmarks insertadas deliberadamente en el corpus. El checkpoint corresponde al paso 9536 y se usa en la Figura 1(b) del artículo.

Su relevancia es metodológica: proporciona un punto de referencia reproducible para estudiar la contaminación de datos y las técnicas de "forgetting" (olvido) en modelos pequeños, con código abierto y checkpoints intermedios disponibles. No está pensado para despliegue en producción ni para tareas generativas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 decoder-only, configuración `d12` de llm.c (12 capas, 12 cabezas, ancho 768) |
| Parametros totales | 124M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (`block_size=1024`) |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint `.pth` en fp32) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, mayoritariamente inglés) |
| Licencia | MIT |
| Formato de pesos | `.pth` (dict de `torch.save` con `model_state_dict`, `optimizer_state_dict`, etc.) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 canónica implementada en llm.c: transformer decoder-only con 12 capas, 12 cabezas de atención, dimensión de embedding 768 y contexto de 1024 tokens. El vocabulario es el de GPT-2 (50257 tokens). No incorpora innovaciones arquitectónicas: es una reproducción limpia de GPT-2 en C/CUDA vía llm.c, lo que facilita la reproducibilidad y el análisis.

El entrenamiento usó una muestra de FineWeb-Edu de 5 mil millones de tokens (2x Chinchilla para 124M parámetros), con preguntas de benchmarks insertadas en el corpus (ver `llm.c/create_contaminated_dataset.py` en el repositorio). Se ejecutaron 9536 pasos con AdamW (betas 0.9 y 0.95, weight decay 0.1), learning rate pico de 6e-4 con warmup lineal y decaimiento hasta el 10%. Los benchmarks contaminados incluyen HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y SocialIQA, con 44 000 preguntas deduplicadas en total. No se reporta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño y el entrenamiento de 5B tokens.
- Evaluación de pérdida de entropía cruzada y predicción de opciones múltiples sobre preguntas de benchmark (columnas `ce_loss`, `lcp`, `prediction`, `label` en el fichero de evaluación).
- Sirve como sujeto experimental para estudiar contaminación de datos y olvido (forgetting) mediante ajuste fino.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingües no documentadas; el corpus FineWeb-Edu es predominantemente inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre contaminación de datos: reproducir la Figura 1(b) del artículo y medir cómo varía la pérdida en preguntas contaminadas frente a preguntas limpias tras un ajuste fino de olvido.
- Estudio de técnicas de forgetting: usar el checkpoint como punto de partida para aplicar fine-tuning selectivo y cuantificar cuánta información de benchmark se elimina.
- Benchmarking de métodos de detección de contaminación: comparar puntuaciones de pérdida (`ce_loss`) y longitud de prefijo común (`lcp`) entre preguntas contaminadas y no contaminadas.
- Reproducibilidad de experimentos con llm.c: servir como referencia para validar pipelines de entrenamiento y evaluación en C/CUDA sobre GPT-2 `d12`.
- Docencia e investigación en mecánica de la memorización: analizar qué preguntas concretas memoriza un modelo de 124M entrenado con 2x Chinchilla y cómo se distribuye esa memorización.
- Análisis de transferencia entre benchmarks: estudiar si la contaminación en un benchmark (por ejemplo, MMLU) afecta a la pérdida en otros (ARC-Easy, BoolQ) usando el fichero parquet de evaluación.
- Baseline para modelos pequeños en estudios de scaling: comparar el efecto de la contaminación a 124M frente a checkpoints mayores de la misma colección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero de evaluación (`evals/all-contamination-splits_eval_step=9536.parquet`) con pérdidas de entropía cruzada y predicciones por pregunta sobre 44 000 preguntas contaminadas, pero no se proporcionan métricas agregadas (exactitud, MMLU, HellaSwag, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0.5 GB de pesos (124M × 4 bytes) más activaciones y caché KV para 1024 tokens; en la práctica, menos de 2 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para evaluación por lotes: cualquier GPU con al menos 4 GB de VRAM; para el conjunto completo de 44 000 preguntas conviene una GPU moderna (RTX 3090/4090, A100) por throughput.
- Opciones de despliegue: el modelo se carga con el código de `llm.c/train_gpt.py` (requiere `torch`, `wandb` y `numpy`). No se distribuye en formato GGUF ni safetensors, por lo que no es directamente compatible con llama.cpp, Ollama, vLLM o TGI sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sbordt/forgetting-contamination-124M-2x` | 124M | 1024 | Investigación sobre contaminación y forgetting | MIT | Checkpoint `.pth` en Hugging Face |
| GPT-2 124M original (OpenAI) | 124M | 1024 | Modelo generativo de propósito general | MIT | Pesos en Hugging Face (`openai-community/gpt2`) |
| GPT-2 124M entrenado con llm.c (Karpathy) | 124M | 1024 | Reproducción de GPT-2 en C/CUDA | MIT | Checkpoints en el repo `karpathy/llm.c` |
| Modelos de la colección `forgetting-contamination` (otros tamaños) | no disponible | no disponible | Misma línea experimental | MIT | Colección en Hugging Face |

La comparación relevante es frente a GPT-2 124M estándar: misma arquitectura y tamaño, pero con un corpus de entrenamiento distinto (FineWeb-Edu con contaminación insertada) y un objetivo experimental en lugar de generativo. Frente a modelos de la misma colección (otros tamaños y multiplicadores Chinchilla), la diferencia está en el presupuesto de entrenamiento y el checkpoint seleccionado.

## Limitaciones y advertencias

- No es un modelo de propósito general: su rendimiento generativo es limitado y no está ajustado por instrucciones.
- Entrenado exclusivamente sobre FineWeb-Edu con preguntas de benchmark insertadas; puede reproducir literalmente fragmentos de esas preguntas.
- Sesgos heredados del corpus FineWeb-Edu (predominantemente inglés y filtrado por criterios educativos), no documentados en la model card.
- Riesgo de alucinación alto en generación libre, dado el tamaño y el presupuesto de entrenamiento.
- Contexto limitado a 1024 tokens, insuficiente para muchas aplicaciones prácticas.
- Idiomas soportados no documentados; se espera un rendimiento muy bajo fuera del inglés.
- Licencia MIT permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- El fichero de evaluación no incluye el nombre del benchmark ni el split-id por fila; es necesario alinear con `compute_results.ipynb` para atribuir resultados.
- Requiere cargar código externo (`train_gpt.py` de llm.c) y dependencias (`wandb`, `numpy`) para instanciar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/sbordt/forgetting-contamination-124M-2x
- Paper (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/124M/2x_chinchilla.sh
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de análisis: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Definición de `GPT` y `GPTConfig`: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/train_gpt.py
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
