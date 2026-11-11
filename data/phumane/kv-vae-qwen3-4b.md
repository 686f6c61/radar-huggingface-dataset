# phumane/kv-vae-qwen3-4b

## Resumen

`phumane/kv-vae-qwen3-4b` es un autoencoder variacional (VAE) basado en transformer que comprime la caché KV de un prefijo de razonamiento generado por `Qwen/Qwen3-4B` en modo thinking en un único vector latente de 1024 dimensiones (`z ∈ R^1024`). No es un modelo de lenguaje: es un componente auxiliar de compresión de estados internos, diseñado para almacenar y reconstruir trazas de razonamiento de forma compacta. Lo desarrolla el usuario `phumane` y se distribuye con licencia Apache 2.0 sobre el modelo base Qwen3-4B de Alibaba.

El interés técnico reside en que sustituye el almacenamiento de una caché KV completa (que para un prefijo de 4096 posiciones en un modelo de 4B ocupa cientos de MB en bf16) por un latente de 4 KB. Esto abre la puerta a memorias de razonamiento persistentes, caché semántica entre sesiones y recuperación de trazas sin recomputar el prefijo. El checkpoint publicado (`eval_step03915.pt`) contiene únicamente pesos y configuración, sin estado del optimizador, y pesa 1,3 GB.

La calidad de reconstrucción es limitada: el propio autor señala que queda "muy por debajo" del VAE equivalente entrenado sobre un modelo de 1.5B, con errores relativos de reconstrucción en torno a 0,54-0,61 según la dimensión latente evaluada. Es, por tanto, un artefacto de investigación más que una pieza lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VAE (6 capas encoder, 6 capas decoder) sobre caché KV de Qwen3-4B |
| Parametros totales | 305M (VAE); el modelo base Qwen3-4B tiene 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de entrada de 4096 posiciones |
| Tipos de cuantizacion | no disponible (checkpoint en `.pt`, pesos en bf16/fp16 según entrenamiento) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-4B, no declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`eval_step03915.pt`, con `model_state` y `cfg`) |

## Arquitectura y entrenamiento

El VAE es un transformer simétrico con 6 capas de encoder y 6 de decoder, 305M parámetros y una ventana de entrada de 4096 posiciones. Codifica la caché KV (calculada en bf16 y redondeada a través de fp16) de un prefijo de razonamiento de Qwen3-4B en thinking mode en un latente de 1024 dimensiones. La decodificación reconstruye la caché original a partir de ese vector.

El entrenamiento se realizó durante 5 épocas sobre 100.342 trazas de razonamiento greedy generadas por Qwen3-4B sobre el dataset DeepMath, con 3.915 pasos a batch efectivo de 128. No se menciona RLHF, DPO ni ajuste por preferencias; es un entrenamiento puramente auto-supervisado de reconstrucción con regularización KL (implícita en el VAE). El checkpoint publicado no incluye estado del optimizador, solo pesos y configuración (`TransformerVAEConfig`).

## Capacidades

- Compresión de caché KV de prefijos de razonamiento de Qwen3-4B en un latente de 1024 dimensiones.
- Reconstrucción aproximada de la caché KV original a partir del latente.
- Codificación de trazas completas mediante `encode_trajectory` o `analysis/fields4b/encode_field.py`.
- Almacenamiento compacto de estados de razonamiento (4 KB por latente frente a cientos de MB de caché completa).
- No genera texto, no razona por sí mismo ni soporta tool calling: es un componente auxiliar, no un LLM.
- No se declaran capacidades multilingües, de visión, audio ni agentes.

## Casos de uso

- Investigación en compresión de estados internos: estudiar cuánta información de una traza de razonamiento es recuperable desde un latente de 1024 dimensiones, midiendo error de reconstrucción y KL por token.
- Memoria de razonamiento persistente en prototipos: guardar latentes de sesiones previas para rehidratar cachés KV sin recomputar el prefijo completo, reduciendo coste de cómputo en conversaciones largas con Qwen3-4B.
- Caché semántica entre peticiones: indexar latentes de prefijos frecuentes (por ejemplo, system prompts con cadenas de pensamiento) y decodificarlos bajo demanda.
- Análisis de trazas de DeepMath: procesar lotes de razonamientos matemáticos y estudiar la evolución de la información a lo largo de la traza mediante la KL por token (0,87 / 2,56 / 4,34 al 25 / 50 / 75% de la traza).
- Baseline para comparativas de VAEs sobre caché KV: el autor lo contrasta explícitamente con el VAE del modelo de 1.5B, por lo que sirve como referencia para estudiar el efecto del tamaño del modelo base en la compresibilidad de la caché.
- Reproducción de experimentos: el repositorio de entrenamiento (rama `vae-training`) permite reentrenar y validar la metodología sobre otros modelos o datasets.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Error relativo de reconstruccion, d = 64 | 0,567 |
| Error relativo de reconstruccion, d = 256 | 0,557 |
| Error relativo de reconstruccion, d = 1024 | 0,544 |
| Error relativo de reconstruccion, d = 2048 | 0,609 |
| KL por token al 25% de la traza | 0,87 |
| KL por token al 50% de la traza | 2,56 |
| KL por token al 75% de la traza | 4,34 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM. El autor indica que la reconstrucción queda por debajo del VAE del modelo de 1.5B, sin proporcionar la cifra concreta de ese comparable.

## Requisitos de hardware

- VRAM para inferencia del VAE: el checkpoint pesa 1,3 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, etc.).
- VRAM adicional para el modelo base: Qwen3-4B en bf16 requiere aproximadamente 8 GB; en cuantización de 4 bits, unos 3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB para el pipeline completo (VAE + Qwen3-4B en bf16); A100/H100 solo necesarias para procesar lotes grandes de trazas.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090, entre otras.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama o TGI, ya que el artefacto es un `.pt` de PyTorch que requiere el paquete `models/` del repositorio de entrenamiento (rama `vae-training`) para cargar la configuración pickled.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Error de reconstruccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phumane/kv-vae-qwen3-4b | 305M (VAE) | 4096 posiciones | 0,544-0,609 (d = 1024-2048) | Apache 2.0 | Hugging Face |
| VAE del modelo de 1.5B (mismo autor) | no disponible | no disponible | mejor que el de 4B según el autor, cifra no publicada | no disponible | no disponible |
| Alternativas de compresión de caché KV (p. ej. H2O, SnapKV) | no aplica | no disponible | no comparable (métricas distintas) | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Calidad de reconstrucción limitada: error relativo de 0,54-0,61, insuficiente para reconstruir fielmente la caché KV original; el autor lo reconoce explícitamente.
- La KL por token crece con la longitud de la traza (0,87 → 4,34 del 25% al 75%), lo que indica pérdida progresiva de información en tramos avanzados.
- Dependencia estricta del código de carga: el `cfg` está serializado con pickle y requiere el paquete `models/` del repositorio de entrenamiento en la rama `vae-training`; no es un checkpoint autónomo.
- Solo válido para Qwen3-4B en thinking mode: el espacio latente está acoplado a la caché KV de ese modelo concreto.
- Sin pipeline declarado, sin idiomas declarados y sin descargas ni likes: artefacto de investigación sin validación comunitaria.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero una caché reconstruida con error puede degradar las respuestas del modelo base que la consuma.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías de calidad desaconseja su uso en producción sin una evaluación propia.
- No hay información sobre sesgos, ya que el modelo no produce texto de forma directa.

## Enlaces

- Hugging Face: https://huggingface.co/phumane/kv-vae-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de entrenamiento (rama `vae-training`): no disponible como URL en la información proporcionada
- Paper, blog o demo: no disponibles
