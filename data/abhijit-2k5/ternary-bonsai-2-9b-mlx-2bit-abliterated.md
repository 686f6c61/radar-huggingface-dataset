# Abhijit-2k5/Ternary-Bonsai-2-9B-mlx-2bit-abliterated

## Resumen

Ternary-Bonsai-2-9B-mlx-2bit-abliterated es una modificación del modelo prism-ml/Ternary-Bonsai-2-9B-mlx-2bit, un modelo de visión-lenguaje derivado de Qwen3.5-9B cuyos pesos del bloque de lenguaje están cuantizados de forma ternaria ({−1, 0, +1}) en una base rotada fija, con una escala FP16 por cada grupo de 128 pesos. El autor de esta variante, Abhijit-2k5, no reentrena ni altera los pesos empaquetados: publica únicamente un fichero de direcciones de rechazo (`refusal_dir.npz`) y una técnica de steering que se aplica en tiempo de inferencia.

La modificación consiste en restar la proyección de la dirección de rechazo del residual stream en cuatro bloques del modelo de lenguaje (capas 11, 19, 23 y 27) mediante la fórmula x' = x − alpha · (x · s) s, con alpha = 1 por defecto. Según la model card, esta intervención redujo los rechazos de 12/12 a 0/12 en un conjunto de prueba de 12 prompts, manteniendo la finalización de tareas de matemáticas, código y prosa corta.

Es relevante como ejemplo práctico de "abliteration" aplicada a un modelo multimodal cuantizado de forma extrema: demuestra que las direcciones de rechazo pueden medirse y aplicarse sobre la base rotada de Hadamard sin desempacar los pesos ternarios. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0.0 GB, ya que solo contiene el fichero de direcciones; los pesos (~3,46 GB) deben descargarse por separado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención con torre de visión (derivado de Qwen3.5-9B); `model_type: prism_hadamard_qwen35` |
| Parametros totales | 9B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K nominales; limitada por memoria en equipos de 8 GB |
| Tipos de cuantizacion | Ternaria 2-bit ({−1, 0, +1}) con escala FP16 por grupo de 128 pesos; empaquetado en base rotada de Hadamard |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (pesos empaquetados del modelo base) + `refusal_dir.npz` (float64, dim 4096) para las direcciones de steering |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de atención con capacidades de visión-lenguaje, derivado de Qwen3.5-9B sin cambios en la arquitectura según la documentación de prismml. La innovación principal del pack es la cuantización ternaria: todos los pesos del modelo de lenguaje se almacenan como valores {−1, 0, +1} en una base rotada fija, con una escala FP16 por grupo de 128 pesos, lo que reduce la huella a aproximadamente 2 GB (más de 9 veces menor que el modelo en precisión completa).

Esta variante abliterated no modifica los pesos ni realiza entrenamiento adicional. Las direcciones de rechazo se midieron mediante forward passes teacher-forced sobre 100 prompts de `mlabonne/harmful_behaviors` y 100 prompts de `tatsu-lab/alpaca`, acumulando las últimas 8 posiciones residuales en las capas 11, 19, 23 y 27 en float64. La dirección se calcula como `normalize(mu_harmful − mu_harmless)` tras dos pasos de Gram-Schmidt contra `mu_harmless`. El coseno entre ambas medias es 0.880 (capa 11), 0.739 (capa 19), 0.734 (capa 23) y 0.748 (capa 27). Como la base rotada de Hadamard es ortonormal, la proyección es equivalente a la de la base sin rotar.

## Capacidades

- Generación de texto, razonamiento, seguimiento de instrucciones y tool calling, heredados del modelo base Qwen3.5-9B.
- Comprensión visual: pipeline `image-text-to-text` con torre de visión (no afectada por el steering).
- Modo thinking: el sampler recomendado (temperature 1.0, top_p 0.95, top_k 20) está pensado para uso con thinking activado, aunque el autor indica que el thinking mode no se midió bajo steering.
- Reducción de rechazos: en el conjunto de prueba de 12 prompts, los rechazos pasaron de 12/12 a 0/12 con alpha = 1.
- El modelo sigue describiendo por qué una petición es peligrosa, aunque no la rechace.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre alineación y refusal directions: permite reproducir el pipeline de medición y steering sobre un modelo cuantizado, comparando el comportamiento con y sin la intervención en las capas 11, 19, 23 y 27.
- Auditoría de seguridad de modelos ternarios: útil para estudiar cómo se comportan las direcciones de rechazo cuando los pesos están empaquetados en una base rotada de Hadamard y no pueden desempacarse fácilmente.
- Inferencia local en Apple Silicon: con ~3,46 GB de pesos y MLX, se puede ejecutar en portátiles y equipos de sobremesa con GPU integrada de Apple, incluyendo tareas de visión-lenguaje.
- Evaluación de robustez de salvaguardas: el conjunto de 12 prompts permite medir la tasa de rechazo antes y después del steering en un entorno controlado.
- Prototipado de asistentes multimodales con restricciones de memoria: la cuantización ternaria y el contexto nominal de 262K permiten probar conversaciones largas en hardware de consumo, con la salvedad del límite de memoria real.
- Estudio de la interacción entre cuantización extrema y steering: comparar el efecto de alpha en las cuatro capas sobre tareas de matemáticas, código y prosa corta, tal como reporta el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la tasa de rechazo en un conjunto de 12 prompts (12/12 a 0/12) y la finalización cualitativa de tareas de matemáticas, código y prosa corta, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas.

## Requisitos de hardware

- Pesos del modelo base: ~3,46 GB, descargados por separado desde `prism-ml/Ternary-Bonsai-2-9B-mlx-2bit`.
- Plataforma: Apple Silicon exclusivamente, con MLX y mlx-vlm 0.7.8 o superior.
- VRAM/unified memory: el autor advierte que en una máquina de 8 GB el contexto está limitado por memoria, no por los 262K nominales.
- GPU recomendadas: no disponible; el modelo está empaquetado para MLX, no para CUDA.
- Cabe en consumer GPU: sí, en equipos Apple Silicon con memoria unificada suficiente (el autor menciona 8 GB como caso limitante).
- Opciones de despliegue: MLX con mlx-vlm; no se indican soportes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B-mlx-2bit-abliterated | 9B | 262K nominales | Ternaria 2-bit + steering | Apache 2.0 | MLX, Apple Silicon |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | 9B | 262K nominales | Ternaria 2-bit | Apache 2.0 | MLX, Apple Silicon |
| Qwen3.5-9B (modelo de origen) | 9B | no disponible en la informacion | FP16/BF16 | no disponible en la informacion | NVIDIA GPUs y Apple |

La diferencia principal frente al modelo base es la intervención de steering en cuatro capas; los pesos empaquetados son idénticos. Frente a Qwen3.5-9B, la variante ternaria reduce la huella en más de 9 veces a costa de la precisión de los pesos, y añade la modificación de rechazo.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con MLX y mlx-vlm 0.7.8 o superior; no hay soporte para CUDA ni otros runtimes.
- La torre de visión y la cabeza MTP no están sometidas a steering, por lo que el comportamiento multimodal no se ve afectado por la intervención.
- El thinking mode no se midió bajo steering; el efecto de la intervención en ese modo es desconocido.
- Las direcciones solo son válidas para este pack concreto de 9B MLX 2-bit; si se cambia de pack hay que volver a medirlas.
- El contexto real en máquinas de 8 GB está limitado por memoria, no por los 262K nominales.
- La reducción de rechazos se validó en un conjunto de solo 12 prompts, lo que es una muestra muy pequeña para conclusiones generales.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero la modificación elimina salvaguardas de rechazo, lo que puede ser inapropiado para despliegues en producción sin controles adicionales.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-07), sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abhijit-2k5/Ternary-Bonsai-2-9B-mlx-2bit-abliterated
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Documentación de Bonsai 2 9B: https://docs.prismml.com/models/bonsai-2-9b
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/ternary-bonsai-2-9b/
