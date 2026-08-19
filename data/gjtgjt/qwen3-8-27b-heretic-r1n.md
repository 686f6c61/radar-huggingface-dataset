# gjtgjt/Qwen3.8-27B-heretic-r1n

## Resumen

Qwen3.8-27B-heretic-r1n es una modificacion del modelo vision-lenguaje Qwen/Qwen3.8-27B realizada por el desarrollador comunitario gjtgjt mediante la tecnica Heretic, un metodo de ablacion direccional sin entrenamiento basado en el trabajo de Arditi et al. (2024) sobre la mediacion del rechazo en modelos de lenguaje. El objetivo es reducir el comportamiento de rechazo (refusals) del modelo manteniendo una divergencia KL acumulada respecto al original por debajo de 0.1.

La arquitectura subyacente es la hibrida Qwen3.8: 64 capas organizadas en 16 bloques de 4 (tres subcapas de atencion lineal Gated DeltaNet seguidas de una subcapa de atencion completa Gated Attention), con un total de 27 000 millones de parametros y una ventana de contexto de 262 144 tokens. El modelo conserva intactos el vision tower y el modulo MTP del base, y solo se modifican las proyecciones de salida del modelo de lenguaje.

La relevancia de esta publicacion reside en que aplica el modo PRE (true rank-1) de Heretic de forma iterativa, recalculando la direccion residual tras cada ronda aceptada, algo que no es habitual en las versiones de ablacion estandar. El resultado es una reduccion de rechazos de 98 a 18 por cada 100 prompts en la evaluacion por keywords, con una KL acumulada de 0.0931 frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 hibrida: 64 capas, 16 × (3 × Gated DeltaNet → FFN, 1 × Gated Attention → FFN) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible (solo pesos BF16 publicados) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors, BF16 fusionados, 12 shards (~51 GB segun la model card) |

Nota: el repositorio en HuggingFace muestra un tamano de 7.4 GB, lo que contradice los ~51 GB declarados en la model card. Es posible que la subida este incompleta o que los pesos no se hayan publicado integramente.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un modelo hibrido que combina atencion lineal Gated DeltaNet con atencion completa Gated Attention en una proporcion de 3:1 por bloque, con 64 capas en total. No se ha realizado ningun entrenamiento adicional: la modificacion es una ablacion direccional sin entrenamiento (training-free) aplicada con Heretic 1.4.0 en modo PRE (row-normalization PRE).

El metodo estima una direccion residual por capa a partir del primer token generado y escribe una actualizacion de bajo rango en las proyecciones de salida para suprimir esa componente. En esta version se ablan los modulos `attn.o_proj`, `linear-attn out_proj` y `mlp.down_proj` de las 64 capas del modelo de lenguaje, dejando intactos el vision tower y el modulo MTP. El proceso fue iterativo: tras cada ronda aceptada se recalcula la direccion residual `r` sobre los pesos actualizados y se ejecuta Heretic de nuevo, con un limite de KL acumulada de 0.1 frente al modelo original. La ronda 1 (trial 162) fue aceptada con KL 0.0525, la ronda 2 (trial 109, la publicada) con KL 0.0931, y la ronda 3 fue rechazada por superar el limite (KL 0.1983).

La evaluacion de rechazos se realiza sobre los primeros tokens de la respuesta visible, usando el prefijo de respuesta `\n response\n\n` sin incluirlo en el chat template en inferencia.

## Capacidades

- Generacion de texto y razonamiento conversacional con soporte de modo thinking (razonamiento visible) configurable mediante `enable_thinking` y `reasoning_effort` en `{xhigh, medium, low}`.
- Entrada multimodal de imagen y video: el pipeline es `image-text-to-text` y la E/S de imagen/video no se ha modificado respecto al base.
- Reduccion significativa de rechazos: 18 keywords de rechazo por cada 100 prompts frente a 98 en el modelo base, manteniendo una KL acumulada de 0.0931.
- Capacidades multilingues limitadas a ingles y chino, heredadas del base.
- Compatible con el mismo chat template y parametros de muestreo por defecto del modelo base.
- Mecanismo de atencion hibrida (Gated DeltaNet + Gated Attention) que permite ventanas de contexto largas de 262 144 tokens.
- Tool calling, function calling y capacidades de agente: no especificadas en la informacion disponible; se heredan presumiblemente del base, pero no estan documentadas en esta ficha.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar el efecto de la ablacion direccional sobre el comportamiento de rechazo y medir el impacto en la calidad de las respuestas mediante la KL acumulada, algo util para trabajos de interpretabilidad.
- Asistentes conversacionales para dominios especializados con politicas de contenido propias: el modelo rechaza menos peticiones que el base, por lo que puede servir como punto de partida para ajustes finos posteriores en entornos donde el base descartaria demasiadas consultas legitimas.
- Generacion creativa de contenido con menos restricciones: util para experimentos de escritura, guiones o narrativa donde el modelo base tiende a rechazar o moralizar en exceso.
- Analisis de imagenes y video con respuestas directas: al conservar el vision tower intacto, mantiene las capacidades multimodales del base pero con menos rechazos en las respuestas generadas.
- Razonamiento multi-paso con modo thinking: para tareas de resolucion de problemas complejos donde se necesita una cadena de razonamiento visible y configurable en esfuerzo (low, medium, high).
- Experimentos de ablacion iterativa: el proceso documentado de recalculo de la direccion residual tras cada ronda sirve como referencia metodologica para quienes quieran reproducir o extender la tecnica Heretic con PRE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion documentada es la propia de Heretic sobre rechazos y divergencia KL:

| Ronda | Keywords de rechazo / 100 prompts | KL vs original | Decision |
|---|---:|---:|---|
| Base (Qwen3.8-27B) | 98 | 0 | — |
| Ronda 1 (trial 162) | 25 | 0.0525 | aceptada |
| Ronda 2 (trial 109, esta version) | 18 | 0.0931 | aceptada |
| Ronda 3 (Pareto 0/1/2) | 8 | 0.1983 | rechazada (KL > 0.1) |

La ronda 3 habria reducido mas los rechazos, pero superaba el limite de KL acumulada de 0.1, por lo que se descarto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~51 GB en BF16, por lo que se necesitan al menos 52-56 GB de VRAM para cargar los pesos completos sin cuantizacion.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2 × RTX 4090 de 24 GB con `device_map="auto"`).
- No cabe en una GPU de consumo estandar (RTX 4090 de 24 GB, RTX 3090 de 24 GB) sin cuantizacion, y no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) de esta variante.
- Opciones de despliegue: Transformers con `device_map="auto"` y `dtype="auto"`, requiriendo una version 5.15 o superior con soporte para la arquitectura `qwen3_5` (`Qwen3_5ForConditionalGeneration`). No se ha confirmado compatibilidad con vLLM, TGI, llama.cpp u Ollama para esta variante concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del modo de generacion (thinking activado o no).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos / 100 | KL vs base | Licencia |
|---|---|---|---:|---:|---|
| Qwen/Qwen3.8-27B (base) | 27B | 262 144 | 98 | 0 | Apache-2.0 |
| gjtgjt/Qwen3.8-27B-heretic-r1n (esta version) | 27B | 262 144 | 18 | 0.0931 | Apache-2.0 |
| Otras variantes Heretic de Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otras variantes ablacionadas del mismo base no esta disponible en la informacion proporcionada. Frente al modelo original, la diferencia principal es la reduccion de rechazos (de 98 a 18 por 100 prompts) a cambio de una deriva de comportamiento medida por la KL acumulada de 0.0931, que en la practica implica que las respuestas pueden diferir ligeramente en contenido y estilo.

## Limitaciones y advertencias

- La reduccion de rechazos no es completa: aun se producen 18 rechazos por cada 100 prompts, por lo que no debe considerarse un modelo sin restricciones.
- La KL acumulada de 0.0931 frente al original implica una deriva de comportamiento no cuantificada en tareas de razonamiento, codigo o matematicas; no hay benchmarks estandar que validen que la calidad se mantiene.
- La ablacion se aplico solo a las proyecciones de salida del modelo de lenguaje; el vision tower queda intacto, lo que puede generar inconsistencias entre la comprension multimodal y la generacion de texto.
- Solo se soportan ingles y chino; no hay garantias de calidad en otros idiomas.
- Requiere una version de Transformers 5.15 o superior con soporte para `qwen3_5`; versiones anteriores no podran cargar el modelo.
- Discrepancia entre el tamano del repositorio en HuggingFace (7.4 GB) y los ~51 GB declarados en la model card: es posible que la subida de pesos este incompleta.
- El modelo tiene 0 descargas y 0 likes en HuggingFace; es una publicacion comunitaria sin validacion externa ni soporte oficial.
- La ablacion direccional sin entrenamiento puede introducir inestabilidades en la generacion, especialmente en modos de muestreo agresivos o con presencia de prompts adversariales.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y la tecnica Heretic tienen sus propias condiciones que conviene revisar antes de un despliegue en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gjtgjt/Qwen3.8-27B-heretic-r1n
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Articulo de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
