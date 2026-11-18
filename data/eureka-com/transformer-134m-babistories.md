# Eureka-COM/Transformer-134M-BabiStories

## Resumen

Transformer-134M-BabiStories es un modelo de lenguaje de investigación desarrollado por Eureka-COM, entrenado desde cero (sin partir de pesos preentrenados de Qwen, Llama o Mistral) sobre el conjunto de datos BabiStories. Su propósito es servir como línea base (baseline) de arquitectura Transformer pura para compararla con el modelo Memory Mosaics v2 de tamaño y datos equivalentes, dentro del estudio de la arquitectura Memory Mosaics publicada por Meta en el paper arXiv:2507.03285. No es un modelo de propósito general ni está ajustado por instrucciones: es una herramienta de comparación científica a pequeña escala.

La arquitectura es un Transformer decoder-only de 12 capas, anchura 768, 6 cabezas de atención de 128 dimensiones con RoPE, FFN SwiGLU de 2048 y vocabulario de 32.000 tokens (tokenizador de Mistral-7B-v0.1). Cuenta con 134.105.856 parámetros y una longitud de contexto de 512 tokens. El entrenamiento consumió 127 millones de tokens en una única RTX 5090 durante 21 minutos (26 minutos incluyendo evaluaciones), con bf16 y AdamW.

Su relevancia es metodológica: permite aislar el efecto de la arquitectura Memory Mosaics frente a un Transformer clásico con el mismo presupuesto de datos y el mismo script de entrenamiento. El Transformer baseline alcanza una pérdida held-out de 1.7824 frente a 1.8113 del modelo Memory Mosaics v2 (que tiene un 11% más de parámetros), una diferencia de 0.029 (1.6%). El modelo se distribuye con licencia Apache-2.0 y formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal self-attention + SwiGLU FFN, RMSNorm, RoPE) |
| Parametros totales | 134.105.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura: 12 capas, anchura 768, 6 cabezas de atención de 128 dimensiones, FFN SwiGLU de 2048, vocabulario de 32.000 (tokenizador Mistral-7B-v0.1, BOS=1, EOS=2). Embedding y capa de salida no están atados (49,2M de parámetros en total). Por capa: atención 2,36M y FFN 4,72M.

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only estándar. Cada capa aplica RMSNorm, atención causal multi-cabeza (6 cabezas × 128, con RoPE), conexión residual, otro RMSNorm, FFN SwiGLU de dimensión 2048 y residual. El vocabulario de 32.000 tokens proviene del tokenizador de Mistral-7B-v0.1, aunque los pesos se entrenan desde cero. La máscara es document-causal: cada historia de BabiStories se trata como documento independiente y los modelos nunca leen a través de historias distintas.

El entrenamiento usó BabiStories (historias generadas con Mixtral 8x7B y distribuidas en facebookresearch/MemoryMosaics bajo Apache-2.0), tokenizadas con el tokenizador de Mistral-7B-v0.1. Se realizaron 15.502 pasos × 8.192 tokens (16 × 512) = 127M tokens, con AdamW (β 0.9/0.95, weight decay 0.1), learning rate 3e-4 con 5% de warmup y decaimiento coseno hasta 1%, precisión bf16 y semilla 42. El entrenamiento se ejecutó en una RTX 5090 (21 minutos de entrenamiento, 26 minutos con evaluaciones, 102.883 tokens/s, 7,4 GB de pico de VRAM con batch 16 × 512). Una ejecución equivalente en Colab A100 dio las mismas pérdidas con una diferencia de 0,003. No se aplicó RLHF ni DPO; no hay ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada a un contexto de 512 tokens.
- Modelado de lenguaje sobre historias cortas de temática infantil (BabiStories).
- Recuerdo de nombres de personajes en contexto (in-context recall): 65,1% de acierto en el argmax del siguiente token para la primera letra del nombre en 2.000 menciones de 238 historias held-out.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: solo inglés (el tokenizador es de Mistral, pero el entrenamiento es exclusivamente en inglés).
- Es un modelo base, no ajustado por instrucciones: no sigue instrucciones de forma fiable.

## Casos de uso

- Investigación comparativa de arquitecturas: sirve como baseline controlado para medir el efecto de Memory Mosaics v2 frente a un Transformer con el mismo presupuesto de datos y el mismo script, aislando la variable arquitectónica.
- Reproducción de experimentos a pequeña escala: el coste de entrenamiento (21 minutos en una RTX 5090, 7,4 GB de VRAM) permite replicar el pipeline completo en hardware de consumo para validar metodologías antes de escalar.
- Estudio de recuerdo en contexto (in-context recall): útil para analizar cómo un Transformer pequeño recupera nombres de personajes a distintas distancias (1–32, 33–128, 129–256 tokens) en textos narrativos cortos.
- Docencia y formación en entrenamiento desde cero: el repositorio incluye `load_and_generate.py` y el tokenizador, lo que facilita demostrar el ciclo completo de entrenamiento, carga y generación con código oficial de facebookresearch/MemoryMosaics.
- Análisis de curvas de pérdida y dinámica de entrenamiento: la model card publica la pérdida held-out en los hitos 10%, 25%, 50%, 75% y 100%, útil para estudiar la convergencia temprana de arquitecturas pequeñas.
- Generación de texto narrativo simple en inglés dentro de dominios de historias infantiles, como prueba de concepto para tareas de continuación de texto con contexto corto.
- Validación de infraestructura: permite verificar pipelines de entrenamiento distribuido o de un solo GPU (RTX 5090 vs A100) comprobando que las pérdidas coinciden dentro de 0,003.

## Benchmarks y rendimiento

| Metrica | Transformer 134M | Memory Mosaics v2 149M |
|---|---|---|
| Pérdida held-out (BabiStories val, 2M tokens) | 1.7824 | 1.8113 |
| Pérdida al 10% del entrenamiento | 2.5464 | no disponible |
| Pérdida al 25% del entrenamiento | 2.1532 | no disponible |
| Pérdida al 50% del entrenamiento | 1.9452 | no disponible |
| Pérdida al 75% del entrenamiento | 1.8237 | no disponible |
| Recuerdo de nombre de personaje (argmax, 2.000 menciones) | 65,1% | 65,5% |
| Distancia 1–32 tokens (1.320 preguntas) | 65,7% | 65,9% |
| Distancia 33–128 tokens (669 preguntas) | 64,1% | 64,9% |
| Distancia 129–256 tokens (11 preguntas) | 45,5% | 54,5% |
| Tiempo de entrenamiento (RTX 5090, 127M tokens + 5 evaluaciones) | 26 min | 54 min |
| Velocidad de entrenamiento | 102.883 tokens/s | 51.122 tokens/s |
| Pico de VRAM (PyTorch, batch 16 × 512) | 7,4 GB | 13,4 GB |

La prueba de McNemar pareada para el recuerdo de nombres da p = 0,63 (sin diferencia significativa). En historias de entrenamiento vistas una vez, el Transformer obtiene 66,25% frente a 65,75% de Memory Mosaics v2 (p = 0,59). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en bf16 (134M parámetros × 2 bytes) más overhead de activaciones y contexto; el repositorio ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM libre; el entrenamiento se realizó en una RTX 5090 y en una A100 80GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: el repositorio proporciona `load_and_generate.py`, que construye el modelo con el código oficial de facebookresearch/MemoryMosaics (commit c2ca0e8) y carga `model.safetensors` con PyTorch, safetensors y tokenizers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles. Solo se publican métricas de entrenamiento (102.883 tokens/s en RTX 5090).
- Entrenamiento: 7,4 GB de pico de VRAM con batch 16 × 512 en PyTorch; 21 minutos de entrenamiento en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pérdida held-out (BabiStories) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transformer-134M-BabiStories (este) | 134.105.856 | 512 | 1.7824 | Apache-2.0 | Hugging Face |
| MemoryMosaics-v2-149M-BabiStories | 148.594.128 | 512 | 1.8113 | no disponible en la información | Hugging Face |
| Transformers pequeños tipo GPT-2 (124M) | ~124M | 1.024 | no disponible | MIT (GPT-2) | Hugging Face |

La comparación directa relevante es con el modelo emparejado Memory Mosaics v2 149M, entrenado con el mismo orden de datos y el mismo script. El Transformer baseline obtiene mejor pérdida held-out (1,7824 frente a 1,8113) con un 11% menos de parámetros, aunque el modelo Memory Mosaics reduce la brecha desde +0,062 al 25% del entrenamiento hasta +0,029 al final. No se dispone de datos de benchmarks estándar para comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Una sola ejecución por modelo (semilla 42); no se midió la variación entre semillas, aunque una segunda ejecución en otra GPU (A100 frente a RTX 5090) dio pérdidas dentro de 0,003.
- El learning rate (3e-4, valor por defecto del código upstream) no se ajustó para ninguno de los dos modelos; la tasa óptima podría diferir entre arquitecturas.
- Memory Mosaics v2 tiene un 11% más de parámetros que el Transformer, lo que condiciona la comparación.
- Escala pequeña: 12 capas y 127M tokens de entrenamiento.
- Solo textos cortos; la memoria de largo alcance no está evaluada. El contexto es de 512 tokens y las historias de BabiStories son breves (mediana 225 tokens, percentil 90 de 289, máximo 507). Solo el 3,9% de las posiciones están a más de 256 tokens dentro de una historia, el rango que solo alcanza la memoria larga de Memory Mosaics v2.
- Las entradas `recall` de `evals.jsonl` provienen de una sonda genérica (repetir un código de acceso de 5 dígitos) cuyo formato nunca aparece en BabiStories; ambos modelos obtienen 0/20, por lo que no comparan sus capacidades.
- Son modelos base entrenados con historias infantiles, no ajustados por instrucciones, destinados exclusivamente a comparaciones de investigación.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; el dominio de entrenamiento es muy restringido (historias sintéticas infantiles).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Limitación idiomática: solo inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eureka-COM/Transformer-134M-BabiStories
- Modelo emparejado Memory Mosaics v2 149M: https://huggingface.co/Eureka-COM/MemoryMosaics-v2-149M-BabiStories
- Repositorio oficial de Memory Mosaics: https://github.com/facebookresearch/MemoryMosaics
- Paper Memory Mosaics (arXiv:2507.03285): https://arxiv.org/abs/2507.03285
- Dataset BabiStories (distribuido en facebookresearch/MemoryMosaics, Apache-2.0): https://github.com/facebookresearch/MemoryMosaics
- Tokenizador Mistral-7B-v0.1: https://huggingface.co/mistralai/Mistral-7B-v0.1
