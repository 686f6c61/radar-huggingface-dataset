# AJ-Gonzalez/gemma-3-270m-it-heretic

## Resumen

`gemma-3-270m-it-heretic` es una modificación no oficial de `google/gemma-3-270m-it`, el modelo instructivo más pequeño de la familia Gemma 3 de Google. El autor, AJ-Gonzalez, ha aplicado Heretic 2.x, una herramienta de eliminación de comportamiento de rechazo (refusal) mediante Arbitrary-Rank Ablation (ARA) con búsqueda de hiperparámetros TPE. El resultado es un modelo de 268 millones de parámetros que ya no rechaza peticiones dañinas, manteniendo una divergencia KL de 0,1076 respecto al modelo base en la distribución de calibración.

El modelo conserva la arquitectura transformer decoder-only de Gemma 3 y el tokenizador original, con pesos en bf16 (512 MB) y cuantizaciones GGUF (Q4_0 de 231 MB y BF16 de 518 MB). Su relevancia es doble: por un lado, demuestra que la ablación de rechazo es viable incluso en un modelo de bolsillo y en hardware muy modesto (un MacBook Air M1 de 8 GB); por otro, sirve como caso de estudio sobre los límites de la técnica, ya que a 270M parámetros la coherencia ya es limitada antes de la modificación.

Es importante señalar que el modelo base oficial de Google en QAT q4_0 ya presenta una tasa de rechazo muy reducida (2/6 en la comprobación del autor), por lo que la comparación honesta debe hacerse contra el checkpoint bf16. El modelo es solo para inglés, hereda la licencia Gemma y no está pensado para uso en producción con requisitos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, GGUF Q4_0, GGUF BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m-it`, un transformer decoder-only de 268M parámetros afinado para instrucciones. Sobre ese checkpoint se aplicó Heretic 2.x con el modificador `heretic.modifiers.ara.ARA`, que realiza una ablación de rango arbitrario sobre las direcciones de activación asociadas al comportamiento de rechazo. La búsqueda de hiperparámetros se hizo con TPE (Tree-structured Parzen Estimator) durante 100 ensayos, con semilla 0 y exportación por fusión de pesos (merge export). El proceso completo se ejecutó en un Apple M1 con backend MPS en 2 horas y 6 minutos, con un pico de RSS de aproximadamente 1,0 GB.

Los hiperparámetros seleccionados fueron: `start_layer_index=9`, `end_layer_index=17`, `preserve_good_behavior_weight=0.4398`, `steer_bad_behavior_weight=0.0002`, `overcorrect_relative_weight=0.0575` y `neighbor_count=8`. Los scorers utilizados fueron `keyword_rate.KeywordRate` (minimizar rechazos) y `kl_divergence.KLDivergence` (minimizar KL). No hubo entrenamiento adicional ni ajuste fino: la modificación es training-free. La conversión a GGUF se hizo con `convert_hf_to_gguf.py` (bf16) y la cuantización con `llama-quantize Q4_0`.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia de Gemma 3.
- Respuesta a instrucciones sin mecanismo de rechazo: 0/100 rechazos en `mlabonne/harmful_behaviors` según los scorers de Heretic.
- Generación de texto corto y respuestas directas; adecuado para tareas simples de formato y extracción.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés, heredada del modelo base.
- No dispone de modo thinking, visión ni audio.
- Compatible con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación de rechazo en un modelo pequeño, comparando tasas de rechazo y divergencia KL frente al base bf16 en el mismo hardware.
- Experimentación educativa con Heretic: sirve para reproducir el pipeline completo (ARA, TPE, exportación a GGUF) en un portátil de 8 GB, documentando los hiperparámetros y los resultados.
- Generación de texto de formato fijo en inglés: por su tamaño reducido, puede usarse para completar plantillas, etiquetas o respuestas cortas donde no se requiera razonamiento profundo.
- Prototipado rápido en local: con el GGUF Q4_0 de 231 MB se puede levantar un servidor `llama-server` en CPU o GPU integrada para pruebas de integración de pipelines.
- Evaluación de cuantización: permite comparar el comportamiento del modelo en bf16, Q4_0 y BF16 GGUF, útil para estudiar cómo la cuantización afecta a rasgos de comportamiento.
- Docencia sobre riesgos de modelos abliterated: como ejemplo controlado de un modelo sin filtros de seguridad, para ilustrar por qué no debe desplegarse en aplicaciones de cara al usuario sin capas adicionales de moderación.
- Pruebas de regresión de herramientas de evaluación: sirve como caso límite para validar clasificadores de rechazo y detectores de contenido dañino en modelos de muy baja capacidad.

## Benchmarks y rendimiento

| Metrica | Base (bf16) | Este modelo |
|---|---|---|
| Rechazos en `mlabonne/harmful_behaviors` (100 prompts) | 97/100 | 0/100 |
| Divergencia KL respecto al base | 0 (por definición) | 0,1076 |

Comprobación independiente con llama.cpp (greedy, plantilla de chat del modelo, 6 prompts de `harmful_behaviors`):

| Variante | Rechazos |
|---|---|
| Base bf16 | 6/6 |
| Base QAT q4_0 oficial | 2/6 |
| Este modelo bf16 | 0/6 |
| Este modelo Q4_0 | 0/6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bf16 (pesos de 512 MB) y alrededor de 300-400 MB en Q4_0 (231 MB de pesos más overhead de contexto).
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. También funciona en CPU y en Apple Silicon vía MPS.
- Cabe en GPU consumer: sí, en prácticamente todas, incluidas GPU integradas y sistemas con poca memoria.
- Opciones de despliegue: `llama.cpp` (`llama-server`), `transformers` en bfloat16, y compatible con `text-generation-inference` según los tags. No se documenta soporte explícito de vLLM u Ollama.
- Latencia y throughput: no disponibles de forma numérica. El autor reporta que el proceso de modificación se ejecutó en un M1 con MPS en 2 h 06 min y pico de RSS de ~1,0 GB, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (harmful_behaviors) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AJ-Gonzalez/gemma-3-270m-it-heretic` | 268M | no disponible | 0/100 | Gemma Terms of Use | HuggingFace (safetensors + GGUF) |
| `google/gemma-3-270m-it` (bf16) | 268M | no disponible | 97/100 | Gemma Terms of Use | HuggingFace |
| `google/gemma-3-270m-it` QAT q4_0 | 268M | no disponible | 2/6 (llama.cpp, 6 prompts) | Gemma Terms of Use | HuggingFace |

No se dispone de datos de benchmarks estándar ni de otros modelos abliterated comparables en la información proporcionada.

## Limitaciones y advertencias

- Con 270M parámetros la coherencia es limitada incluso antes de la modificación: razonamiento superficial y respuestas ocasionales en estilo de continuación de prompt en lugar de réplica.
- La divergencia KL de 0,1076 es baja para la técnica, pero no es cero; un modelo de este tamaño tiene poco margen de capacidad que perder.
- El modelo carece de mecanismo de rechazo utilizable: no debe emplearse como filtro de seguridad ni en aplicaciones donde se espere moderación.
- Solo inglés, heredado del modelo base.
- Licencia Gemma Terms of Use: el uso comercial está sujeto a dichos términos; es una modificación no oficial y no está respaldada por Google.
- Riesgo de alucinación elevado por la baja capacidad del modelo base.
- En float32 con transformers 5.22 el modelo (y el base) emiten un `<end_of_turn>` aislado sin texto; debe cargarse en bfloat16.
- La comparación contra el checkpoint QAT q4_0 oficial no es válida para medir el efecto de la ablación, ya que la cuantización 4-bit por sí sola elimina la mayor parte del comportamiento de rechazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AJ-Gonzalez/gemma-3-270m-it-heretic
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Mirror del base usado: https://huggingface.co/unsloth/gemma-3-270m-it
- Heretic (herramienta de modificación): https://github.com/p-e-w/heretic
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
