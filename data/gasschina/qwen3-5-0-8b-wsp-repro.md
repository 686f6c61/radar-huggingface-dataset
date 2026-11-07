# gasschina/Qwen3.5-0.8B-WSP-repro

## Resumen

Qwen3.5-0.8B-WSP-repro es un artefacto de investigación publicado por el usuario gasschina en Hugging Face. No es un modelo entrenado desde cero, sino una reproducción a nivel de método del artículo "Sparks of Weight-Space Programming" (blog de MIT CSAIL, 2 de noviembre de 2026). Parte del modelo base Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 752 millones de parámetros, y le aplica una modificación quirúrgica de pesos para mitigar el comportamiento de repetición en bucle durante la generación.

La intervención consiste en identificar una "dirección de repetición" por capa mediante la diferencia de medias de las salidas de `down_proj` entre tokens que forman bucles y tokens normales, seleccionar las 64 columnas más alineadas con esa dirección en dos capas concretas (15 y 19) y restar una componente escalada (beta = 0,3) de esas columnas. En total se modifican 131.072 pesos, un 0,016 % del modelo, sin gradientes ni entrenamiento.

Su relevancia es metodológica: demuestra que es posible alterar un comportamiento específico de un LLM mediante edición de pesos en el espacio de pesos, sin reentrenar, y publica todo el pipeline (código, direcciones, resultados de evaluación emparejada) como material reproducible. Los resultados propios del autor son modestos: la tasa de bucles de repetición baja del 95,8 % al 91,7 % en 24 problemas de MATH-500, sin mejora en precisión ni en tasa de finalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), derivado de Qwen/Qwen3.5-0.8B |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el evaluador del autor usa 32k y 4096 tokens en las pruebas) |
| Tipos de cuantizacion | no disponible para este artefacto; el modelo base dispone de GGUF (1,68 GB) segun fuentes externas |
| Idiomas soportados | no disponibles (la serie Qwen3.5 se describe como multilingue en Qualcomm AI Hub) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); incluye `wsp_weight_patch_*.npz` con direcciones, indices de columnas y beta |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B: un transformer denso con tag `qwen3_5_text` en transformers y pipeline de generación de texto. Sobre esa base, el autor aplica un pipeline estadístico sin gradientes ni entrenamiento. Primero captura las salidas por token de `down_proj` en todas las capas, comparando generaciones con bucles frente a generaciones sin bucles. La diferencia de medias por token aísla una dirección de repetición por capa. Después selecciona las 64 columnas de `down_proj` de cada capa parcheada con mayor alineación con esa dirección y aplica la escritura correctiva `W[:,j] -= beta * da_j * u`, donde `da` es la diferencia media de la entrada de `down_proj` entre tokens repetidos y normales, `u` es la dirección y `beta = 0,3`. Las capas parcheadas son la 15 y la 19, con 2 × 64 × 1024 = 131.072 pesos modificados (0,016 % del total).

No hay datos publicados sobre el corpus de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en el material proporcionado. La innovación técnica destacable es precisamente el método de programación en espacio de pesos: una edición localizada y verificable, con artefactos separados (`npz`) que documentan direcciones, índices y coeficientes para auditoría.

## Capacidades

- Generación de texto conversacional y de razonamiento, heredadas del modelo base Qwen3.5-0.8B.
- Modo "thinking" (razonamiento explícito) empleado en la evaluación del autor con MATH-500.
- Mitigación parcial del comportamiento de repetición en bucle en generaciones largas (de 95,8 % a 91,7 % de tasa de bucles en la evaluación publicada).
- Preservación del comportamiento en generaciones de guarda (introducción de chat), según las notas del autor.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con la librería transformers.
- Soporte de tool calling, function calling, agentes y capacidades multimodales: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada para este artefacto.

## Casos de uso

- Investigación en interpretabilidad y edición de pesos: servir como referencia reproducible para estudiar cómo una dirección en el espacio de pesos de `down_proj` correlaciona con un comportamiento degenerado concreto, con todos los artefactos intermedios publicados.
- Experimentos controlados sobre repetición en LLM: comparar generaciones base y parcheadas con el mismo prompt y semilla para aislar el efecto del parche, gracias a los registros de evaluación emparejada incluidos en `results/`.
- Validación de pipelines de edición sin entrenamiento: reutilizar `code/wsp2.py` como plantilla para extraer direcciones de comportamiento y aplicar escrituras correctivas en otras capas o modelos de la familia Qwen.
- Evaluación de robustez en razonamiento matemático: usar el conjunto de 24 problemas de MATH-500 (niveles 1-3, semilla 42) como banco de pruebas para medir si una intervención de pesos altera precisión o longitud de respuesta.
- Docencia y divulgación técnica: ilustrar con un caso real y de tamaño reducido (0,8 B) cómo funciona la programación en espacio de pesos frente al ajuste fino clásico.
- Despliegue en entornos de recursos limitados para pruebas internas: el tamaño del checkpoint (1,5 GB en el repositorio) permite ejecutarlo en una sola GPU de consumo para experimentación, no para producción crítica.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 24 problemas retenidos de MATH-500 (semilla 42, niveles 1-3 × 8), decodificación greedy, modo thinking, línea base fp16 ejecutada en la misma GPU:

| Metrica | Base @4096 | Parcheado @4096 |
|---|---|---|
| Tasa de bucles de repeticion | 95,8 % | 91,7 % |
| Finalizados (think cerrado) | 4,2 % | 4,2 % |
| Precision | 4,2 % | 4,2 % |
| Longitud media (palabras) | 1702 | 1778 |

El autor indica que el salto de 6× en MATH-500 reportado en el artículo original requería un presupuesto y una escala de optimizador que esta reproducción no replica. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 1,5 GB en el repositorio; en fp16 los 752 M de parámetros ocupan aproximadamente 1,5 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 6-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; para contexto de 32k conviene disponer de 16 GB o más. El autor menciona un evaluador vLLM de 32k, lo que sugiere uso en GPUs de datacenter (A100, H100) o GPUs de consumo de gama alta (RTX 4090) para esas longitudes.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) para fp16.
- Opciones de despliegue: transformers (librería declarada), vLLM (usado por el autor para evaluación a 32k) y, para el modelo base, GGUF vía llama.cpp u Ollama según la ficha externa de local-ai-zone.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-WSP-repro | 752 M | no disponible | Edicion de pesos para mitigar repeticion | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo generativo multilingue de Alibaba | Apache-2.0 | Hugging Face, Qualcomm AI Hub, GGUF |
| Otros modelos de ~0,8 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: el parche reduce la tasa de bucles en 4,1 puntos porcentuales sin cambiar precisión ni tasa de finalización en la muestra evaluada. Frente a alternativas de la misma categoría (modelos densos de menos de 1 B parámetros), no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Es una reproducción de método, no el modelo original: el optimizador del autor es un pipeline estadístico, no un LLM interactivo con presupuesto de llamadas y verificación iterativa como en el blog de MIT CSAIL.
- Los resultados son de ejecuciones propias del autor y de alcance limitado: 24 problemas, una semilla y un único conjunto de evaluación; no deben generalizarse.
- El parche solo suprime parcialmente la repetición (95,8 % → 91,7 %); la mayoría de las generaciones evaluadas siguen entrando en bucle y solo un 4,2 % finaliza el bloque de razonamiento.
- La precisión no mejora (4,2 % en ambos casos), por lo que el artefacto no es adecuado como modelo de producción para matemáticas o razonamiento fiable.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; se heredan los del modelo base Qwen3.5-0.8B.
- Idiomas y longitud de contexto: no documentados para este artefacto; deben consultarse en la ficha del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el artefacto es un experimento de investigación sin garantías de calidad; el autor declara no estar afiliado a MIT CSAIL, OpenAI ni Alibaba/Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gasschina/Qwen3.5-0.8B-WSP-repro
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog original de MIT CSAIL: https://rikiyat.github.io/blog/weight-space-programming/
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Ficha GGUF de Qwen3.5-0.8B: https://local-ai-zone.github.io/models/qwen3-5-0-8b.html
