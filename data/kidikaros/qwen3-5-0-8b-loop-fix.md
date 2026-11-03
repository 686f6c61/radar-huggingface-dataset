# KidIkaros/qwen3.5-0.8b-loop-fix

## Resumen

Qwen3.5-0.8B-loop-fix es una edición en el espacio de pesos (weight-space edit) del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario KidIkaros. No se trata de un fine-tuning ni de un modelo entrenado desde cero: es una modificación quirúrgica de dos tensores de la red que elimina el fallo de bucle semántico ("thinking loop") que presenta el modelo base cuando se activa el modo de razonamiento. El autor la presenta como una reproducción independiente del Experimento 8 del artículo "Sparks of Weight-Space Programming" (Takehi, Teoh, Zhang, Khattab, noviembre de 2026).

El modelo conserva la arquitectura, el tokenizador y el pipeline del modelo base (image-text-to-text, familia Qwen3.5), con 873.438.784 parámetros reales según los safetensors y un repositorio de 1,8 GB en formato safetensors. La intervención afecta a 131.072 valores de peso (0,016 % del modelo), concretamente 64 neuronas intermedias por capa en `layers.15.mlp.down_proj` y `layers.19.mlp.down_proj`, dejando intactos embeddings, cabeza de salida y norma final.

Su relevancia es doble: por un lado, demuestra que un fallo de comportamiento (el bucle de razonamiento) puede corregirse sin entrenamiento, solo editando pesos; por otro, sirve como caso de estudio reproducible de interpretabilidad mecanicista y programación en el espacio de pesos aplicada a un modelo multimodal pequeño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal image-text-to-text |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor recomienda generar hasta 16.384-32.768 tokens en modo thinking) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor menciona fp16 y bf16 en la edición) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura del Qwen3.5-0.8B base: un transformer multimodal con pipeline image-text-to-text, capaz de procesar entradas de imagen y texto. La edición no introduce cambios estructurales ni añade capas; únicamente modifica columnas concretas de las matrices `down_proj` de las capas 15 y 19 del bloque MLP.

No hay entrenamiento ni gradientes implicados. El procedimiento consistió en diagnosticar una "dirección de bucle" `d` (la diferencia media de salida del MLP entre contextos que entran en bucle y contextos que terminan de razonar, proyectada a través de `down_proj` y normalizada), seleccionar las 64 neuronas intermedias por capa con mayor diferencia absoluta de activación media y aplicar la actualización `W[:, j] <- W[:, j] - 6 * (W[:, j] · d_hat) * d_hat` sobre esas columnas. El factor 6 sobrecorrige cada columna más allá de la ortogonalidad con la dirección del bucle. La edición se aplicó con las convenciones del `apply_edit.py` del artículo original, con redondeo en bf16.

La dirección recuperada de forma independiente tiene un coseno de 0,350 (capa 15) y 0,449 (capa 19) respecto a la del artículo original, lo que sugiere que el subespacio del bucle es robusto a la elección exacta de dirección a esa intensidad. El autor publica además un `diagnosis.json` con el procedimiento y los registros del recreado, realizado sobre GPUs Kaggle T4.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con el bucle semántico corregido respecto al modelo base.
- Procesamiento multimodal image-text-to-text, heredado del Qwen3.5-0.8B base.
- Razonamiento matemático de varios pasos (el autor evalúa con GSM8K y MATH).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible más allá del modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking activable mediante `enable_thinking=True` en la plantilla de chat.

## Casos de uso

- Razonamiento matemático con presupuesto de tokens acotado: el modelo cierra su cadena de pensamiento en el 83 % de los problemas de prueba (frente al 11 % del base), lo que lo hace viable en pipelines donde un bucle infinito agotaría el presupuesto de generación.
- Investigación en interpretabilidad mecanicista: sirve como caso reproducible para estudiar cómo una dirección latente concreta controla un comportamiento (el bucle) y cómo editarla sin reentrenar.
- Reproducción de experimentos de weight-space programming: el repositorio incluye la diagnosis y las convenciones de edición, lo que permite replicar el resultado en otras máquinas (por ejemplo, T4 en Kaggle).
- Evaluación comparativa de ediciones de pesos: al existir una reproducción bit-exacta del edit original en otro repositorio, permite comparar dos direcciones distintas (cos 0,35/0,45) sobre el mismo fallo.
- Asistente conversacional multimodal ligero: al conservar el pipeline image-text-to-text del base, puede emplearse en tareas de descripción de imágenes y diálogo con contexto visual en entornos con recursos limitados (873 M de parámetros).
- Docencia y divulgación: ejemplo práctico de que un fallo de comportamiento puede tener una causa localizada en pesos concretos y corregirse con una intervención de 0,016 % de los parámetros.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 18 problemas no vistos en entrenamiento (16 GSM8K + 2 MATH), 1 muestra por problema, fp16, `HF generate`, con tope de 16.384 tokens y muestreo temperature 0,6 / top-p 0,95 / top-k 20 / presence penalty 1,5:

| Modelo | Thinking cerrado | Respuesta boxed | Correctas |
|---|---|---|---|
| Base (Qwen3.5-0.8B) | 2/18 (11 %) | 2/18 | — |
| Este edit | 15/18 (83 %) | 14/18 | 12/18 (67 %) |
| Edit del artículo (reproducción) | 17/18 (94 %) | 14/18 | 12/18 (67 %) |

El autor señala que 13 de los 16 problemas que entraban en bucle en el modelo base quedaron resueltos y no se observaron regresiones. Advierte que la muestra es pequeña (18 problemas, 1 muestra cada uno) y que se trata de una replicación de mecanismo, no de una puntuación de benchmark. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 873 M de parámetros, en fp16 serían aproximadamente 1,7 GB de pesos más overhead de activaciones y caché KV, y en bf16 un valor similar.
- GPU recomendadas: el autor realizó el recreado y la edición sobre GPUs Kaggle T4; el modelo base es desplegable en GPUs de consumo.
- Cabe en GPU de consumo: sí, por tamaño (873 M de parámetros); no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: transformers (librería indicada); compatibilidad con endpoints según el tag `endpoints_compatible`. vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Thinking cerrado (18 problemas) | Correctas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-loop-fix (este) | 873 M | no disponible | 15/18 (83 %) | 12/18 (67 %) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 873 M | no disponible | 2/18 (11 %) | — | no disponible en la información | HuggingFace |
| Edit del artículo (reproducción, KidIkaros) | 873 M | no disponible | 17/18 (94 %) | 12/18 (67 %) | Apache 2.0 | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría (modelos multimodales de menos de 1.000 M de parámetros con modo thinking) en la información proporcionada.

## Limitaciones y advertencias

- La evaluación se basa en 18 problemas con una sola muestra cada uno; el propio autor la califica de replicación de mecanismo, no de benchmark, por lo que las cifras no deben extrapolarse como rendimiento general.
- La edición se validó en fp16 y con redondeo bf16; no se documenta su comportamiento en otras precisiones o cuantizaciones.
- Solo se corrige el bucle semántico en modo thinking; no se documentan mejoras en otras capacidades ni en el modo sin thinking.
- La dirección del bucle recuperada difiere de la del artículo original (cos 0,35 y 0,45), lo que indica que la edición no es única y que su robustez depende de la intensidad (factor 6) elegida.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base, no documentados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base y la edición no incluyen datos al respecto.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, no indicada en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (3 de noviembre de 2026); se trata de una publicación muy reciente y sin validación comunitaria.
- El uso requiere activar el modo thinking con la plantilla de chat y respetar los parámetros de muestreo recomendados; otros ajustes pueden alterar el comportamiento observado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KidIkaros/qwen3.5-0.8b-loop-fix
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Reproducción bit-exacta del edit original: https://huggingface.co/KidIkaros/qwen3.5-0.8b-loop-fix-reproduction
- Artículo "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Repositorio de logs del artículo (RikiyaT/lm_understand-logs, exp8_math): https://github.com/RikiyaT/lm_understand-logs (referenciado en la model card)
