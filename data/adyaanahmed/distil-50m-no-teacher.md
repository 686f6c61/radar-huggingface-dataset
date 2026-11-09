# adyaanahmed/distil-50m-no-teacher

## Resumen

distil-50m-no-teacher es un modelo de lenguaje de 51,5 millones de parámetros desarrollado por el usuario adyaanahmed como **control experimental** de su modelo `distil-50m`, que se destila a partir de Qwen2.5-0.5B. Este repositorio contiene la misma arquitectura, los mismos datos, el mismo orden de datos, la misma semilla, el mismo optimizador y el mismo número de pasos que el modelo destilado, pero se entrena únicamente con entropía cruzada estándar de siguiente token, sin profesor, tanto en preentrenamiento como en ajuste de instrucciones. Su propósito es aislar y medir qué aporta exactamente la destilación.

El modelo emplea una arquitectura transformer de 18 capas con d_model 512, atención GQA con proporción 8:2, QK-norm, SwiGLU, RoPE, embeddings factorizados atados y una ventana de contexto de 512 tokens. Se entrenó sobre aproximadamente 1.020 millones de tokens de Cosmopedia v2 y FineWeb-Edu (con puntuación mayor o igual a 3), en 15.000 pasos de 65.536 tokens cada uno, usando Muon y AdamW con una tasa de aprendizaje de 1,5e-3 y un schedule warmup-stable-decay.

Es relevante ahora porque cuantifica el coste y el beneficio real de la destilación de conocimiento en modelos pequeños: el modelo destilado consume unas 3 veces más GPU-horas (66,2 frente a 22,3 GPU-horas en T4) y obtiene ventajas claras en texto fuera de dominio y en benchmarks, aunque en el dominio de entrenamiento la diferencia es casi nula. Es un artefacto de investigación, no un asistente útil: es fluido pero inventa hechos y no sabe hacer aritmética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA 8:2, QK-norm, SwiGLU, RoPE y embeddings factorizados atados |
| Parametros totales | 51.532.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16, 99 MB por checkpoint) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 18 capas con dimensión de modelo 512 y 51,5 millones de parámetros. Incorpora atención con query grouping (GQA) en proporción 8:2, normalización QK, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y una embedding factorizada y atada. La ventana de contexto es de 512 tokens. El vocabulario es de 32.768 tokens; el tokenizador es el de Qwen2.5 y el archivo `vocab.json` mapea sus identificadores al vocabulario del estudiante.

El preentrenamiento usó aproximadamente 1.020 millones de tokens de Cosmopedia v2 y FineWeb-Edu (puntuación mayor o igual a 3), en 15.000 pasos de 65.536 tokens (983 millones de tokens efectivos), con optimizador Muon + AdamW, tasa de aprendizaje 1,5e-3, schedule warmup-stable-decay y semilla 0. El ajuste de instrucciones (SFT) se hizo sobre los primeros intercambios de 150.000 ejemplos de smol-smoltalk (unos 130.000 conservados). A diferencia del modelo destilado, este control no usa profesor en ninguna fase: solo entropía cruzada de siguiente token. El coste total fue de 22,3 GPU-horas en T4 (20,0 de preentrenamiento a 27,8k tokens/s y 2,3 de SFT), frente a las 66,2 GPU-horas del modelo destilado.

## Capacidades

- Generación de texto en inglés: continuación de texto y respuestas de un solo turno con el formato `### Question:\n{query}\n\n### Answer:\n`.
- Modelo base (`student_pretrained.safetensors`) para continuación de texto sin formato de chat.
- Modelo ajustado a instrucciones (`student_chat.safetensors`) para respuestas conversacionales de un solo turno.
- Fluidez lingüística básica en inglés dentro de la ventana de 512 tokens.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües: solo inglés.
- No dispone de visión, audio ni modo de razonamiento (thinking mode).
- No tiene ajuste de seguridad (no safety-tuned).

## Casos de uso

- **Estudio controlado de destilación de conocimiento**: sirve como línea base empírica para medir la contribución del profesor comparando bits por byte y benchmarks con `distil-50m` bajo idénticas condiciones de datos, semilla y cómputo de pasos.
- **Reproducción de experimentos de entrenamiento a pequeña escala**: con 22,3 GPU-horas en T4 y pesos de 99 MB, permite reproducir el pipeline completo de preentrenamiento y SFT en hardware modesto para validar metodologías.
- **Docencia e investigación sobre modelos pequeños**: su tamaño y su licencia Apache-2.0 lo hacen adecuado para ilustrar el efecto de Muon + AdamW, GQA o QK-norm en modelos de 50 millones de parámetros.
- **Referencia para ablaciones de datos**: al compartir orden de datos y semilla con el modelo destilado, permite aislar el efecto de cambios en la composición del corpus (Cosmopedia frente a FineWeb-Edu) sin confundirlo con variaciones de entrenamiento.
- **Evaluación de métricas de calidad en modelos minúsculos**: útil para calibrar hasta qué punto benchmarks como ARC-Easy, SciQ, HellaSwag o LAMBADA discriminan entre variantes con diferencias de unos pocos puntos.
- **Prototipado de pipelines de inferencia local**: con pesos fp16 de 99 MB, sirve para probar scripts de carga con safetensors y tokenizers antes de escalar a modelos mayores, sin coste relevante de infraestructura.

## Benchmarks y rendimiento

Resultados de bits por byte en conjuntos de validación (menor es mejor):

| Conjunto | Destilado | Sin profesor (este modelo) | Profesor (Qwen2.5-0.5B) |
|---|---|---|---|
| Cosmopedia (en dominio) | 0,666 | 0,655 | 0,572 |
| FineWeb-Edu | 1,078 | 1,117 | 0,835 |
| WikiText (fuera de dominio) | 1,270 | 1,325 | 0,905 |

Benchmarks zero-shot sobre modelos base (preentrenados), 1.000 ejemplos cada uno (ruido aproximado de más/menos 1,5 puntos):

| Benchmark | Destilado | Sin profesor |
|---|---|---|
| ARC-Easy (acc_norm) | 45,1 | 42,8 |
| SciQ (acc) | 67,4 | 62,8 |
| HellaSwag (acc_norm) | 30,6 | 28,4 |
| LAMBADA (acc) | 23,0 | 20,9 |
| LAMBADA perplejidad (menor es mejor) | 185 | 303 |

Benchmarks sobre modelos ajustados a instrucciones (chat):

| Benchmark | Destilado | Sin profesor |
|---|---|---|
| ARC-Easy (acc_norm) | 41,9 | 38,0 |
| SciQ (acc) | 62,0 | 56,2 |
| HellaSwag (acc_norm) | 29,6 | 27,9 |
| LAMBADA (acc) | 16,3 | 12,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (dos checkpoints de 99 MB cada uno); no se han publicado cifras de cuantización.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el entrenamiento se realizó en NVIDIA T4.
- Cabe en cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090) y en CPU para inferencia puntual.
- Opciones de despliegue: el repositorio incluye `chat_local.py` con PyTorch y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado cifras de inferencia; el entrenamiento reporta 27,8k tokens/s en T4 para el preentrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distil-50m-no-teacher | 51,5M | 512 | Control sin profesor | Apache-2.0 | Hugging Face |
| distil-50m | 51,5M | 512 | Destilado de Qwen2.5-0.5B | Apache-2.0 (segun repositorio del autor) | Hugging Face |
| Qwen2.5-0.5B | 0,5B | no disponible en la informacion | Modelo base de referencia (profesor) | no disponible en la informacion | Hugging Face |

El modelo destilado supera a este control en los cuatro benchmarks evaluados, tanto en forma base como ajustada a instrucciones, y en bits por byte sobre FineWeb-Edu y WikiText, a cambio de unas 3 veces más GPU-horas. Frente al profesor Qwen2.5-0.5B, ambos modelos de 50 millones quedan claramente por debajo en bits por byte.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente: inventa hechos y no sabe hacer aritmética.
- Se desvía y repite en respuestas largas; la perplejidad LAMBADA del modelo ajustado a instrucciones es de 6.001, frente a 882 en el modelo destilado.
- Solo soporta inglés.
- Ventana de contexto muy limitada: 512 tokens y un solo turno de conversación.
- No tiene ajuste de seguridad; puede generar contenido inapropiado o dañino.
- Los resultados provienen de una única ejecución por brazo, sin estimación de varianza entre semillas; las diferencias pequeñas deben tratarse como indicativas.
- No se han publicado datos de sesgos específicos.
- Licencia Apache-2.0 permite uso comercial, pero los datos de FineWeb-Edu están bajo ODC-By 1.0 y Cosmopedia v2 y smol-smoltalk bajo Apache-2.0.
- No se documenta soporte para cuantización ni para servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adyaanahmed/distil-50m-no-teacher
- Modelo destilado de referencia: https://huggingface.co/adyaanahmed/distil-50m
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
