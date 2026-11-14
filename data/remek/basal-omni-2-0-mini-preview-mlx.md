# Remek/basal-omni-2.0-mini-preview-MLX

## Resumen

basal-omni-2.0-mini-preview-MLX es un port a MLX en cuantización de 8 bits del modelo basal-omni-2.0-mini-preview, desarrollado por Remek. Se trata de un modelo de decisión con tipado (typed-decisions) construido sobre la arquitectura Gemma 4 E4B, orientado a tareas de clasificación, toma de decisiones y calibración, con soporte para polaco e inglés. El modelo base emplea una lectura bidireccional del estado antes de responder; este port, servido con el motor basal en modo MLX, solo puede realizar una lectura unidireccional (de izquierda a derecha), lo que lo convierte en una versión degradada del modelo original.

El modelo resuelve el problema de la toma de decisiones automática con umbrales de error certificados: dado un conjunto de opciones, el modelo selecciona una respuesta y proporciona una calibración que permite automatizar un porcentaje de decisiones con garantías de error (por ejemplo, 1% o 5%). Es relevante porque combina generación de texto con un mecanismo de decisión calibrado, algo poco habitual en modelos de este tamaño.

Con 7.463.013.376 parámetros y un repositorio de 8.6 GB, el modelo está pensado para Apple Silicon. El autor lo marca explícitamente como experimental y no recomendado, ya que la lectura unidireccional reduce la precisión respecto al modelo original servido de forma bidireccional. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B) con lectura de estado bidireccional en el modelo base; unidireccional en este port |
| Parametros totales | 7.463.013.376 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 E4B, un transformer de aproximadamente 7.460 millones de parámetros. La innovación principal del modelo base es la lectura bidireccional del estado: antes de emitir una respuesta, el modelo procesa el estado en ambas direcciones, lo que mejora la precisión en tareas de decisión. Este port a MLX, sin embargo, solo realiza una lectura unidireccional (de izquierda a derecha), lo que según el autor lo convierte efectivamente en un modelo más débil con los mismos pesos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo está especializado en decisiones tipadas (typed-decisions) y calibración, con conjuntos de calibración específicos (CALIBRATION.mlx.json) ajustados para la lectura unidireccional de este port. El modelo base incluye codificadores de imagen y audio, pero este port es solo texto: los codificadores no están incluidos en la carpeta.

## Capacidades

- Generación de texto conversacional en polaco e inglés.
- Toma de decisiones con tipado (typed-decisions): selección entre opciones con formato estructurado.
- Clasificación con calibración: proporciona umbrales de error certificados para automatizar decisiones.
- Decisiones con certificación de error: solo las preguntas de tipo `choice` obtienen un umbral certificado del 1%.
- Capacidades multilingües limitadas a polaco e inglés.
- No incluye visión ni audio en este port (solo texto).
- No se menciona soporte de tool calling ni function calling.
- No se menciona soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Automatización de decisiones con garantía de error: el modelo permite decidir automáticamente un 13,9% de las decisiones con un objetivo de error del 1% (sin errores observados) y un 51,0% con un objetivo del 5% (4,53% de error observado), usando la calibración incluida. Adecuado para flujos donde se requiere certificar la tasa de error.
- Clasificación de documentos en polaco: con una precisión de 0,953 en el conjunto PL-Real (300 documentos reales polacos), el modelo puede clasificar documentos reales con alta fiabilidad en lectura unidireccional.
- Moderación o triaje de contenido en inglés: con una precisión de 0,669 en el corpus EN y 0,762 en el panel externo EN, puede usarse para tareas de clasificación binaria o multietiqueta donde se tolere cierta tasa de error.
- Sistemas de recomendación con opciones discretas: el modelo selecciona entre opciones predefinidas con formato tipado, útil para asistentes que deben elegir entre acciones o productos.
- Evaluación de exámenes o preguntas de conocimiento en polaco: con una precisión de 0,758 en el conjunto PL general (conocimiento, exámenes, lectura), puede emplearse para responder preguntas de opción múltiple.
- Despliegue en Apple Silicon para prototipado: al estar en formato MLX 8-bit, puede ejecutarse en un Mac con M4 Pro (24 GB) usando el motor basal en modo MLX, adecuado para pruebas locales y desarrollo.
- Filtrado de decisiones en pipelines de datos: dado que el 98,9% de las respuestas coinciden con la lectura unidireccional en bf16, puede usarse como aproximación rápida en entornos Apple antes de validar con el modelo original.

## Benchmarks y rendimiento

Los datos proporcionados comparan la lectura bidireccional (modelo original) con la unidireccional (este port), medidas con el motor basal 2.8.0 en una NVIDIA H100 en bf16:

| Benchmark | Dos vías (modelo original) | Una vía (lectura de este port) | Misma respuesta top que dos vías |
|---|---|---|---|
| PL decisions (held-out, 7.081 items) | 0,951 | 0,843 | 85,5% |
| PL general (3.079 items) | 0,767 | 0,758 | 84,5% |
| PL-Real (300 documentos) | 0,960 | 0,953 | 96,0% |
| EN corpus test (1.479 items) | 0,692 | 0,669 | 83,3% |
| EN external panel (3.842 items) | 0,811 | 0,762 | 84,5% |

Medición del port MLX en Apple M4 Pro (24 GB) sobre 4.280 decisiones:

| Lectura | Precisión | Misma respuesta top que dos vías (bf16) | Misma respuesta top que una vía (bf16) |
|---|---|---|---|
| Dos vías, motor basal, bf16 (modelo original) | 0,906 | – | 85,1% |
| Una vía, motor basal, bf16 | 0,810 | 85,1% | – |
| Una vía, MLX 8-bit (este port) | 0,810 | 85,0% | 98,9% |

La pérdida de precisión se debe a la lectura unidireccional, no a la cuantización: el port 8-bit coincide con la lectura unidireccional en bf16 en el 98,9% de las respuestas top.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,6 GB para los pesos en 8-bit (tamaño del repositorio); el modelo original en bf16 requiere unos 16 GB.
- GPU recomendadas: Apple Silicon (M4 Pro con 24 GB probado). Para el modelo original en bf16 se usó una NVIDIA H100.
- Cabe en GPU de consumo: sí, en Apple Silicon con al menos 16 GB de memoria unificada; en GPUs NVIDIA consumer no se ha probado con este port MLX.
- Opciones de despliegue: motor basal en modo MLX (`basal-serve --mode mlx`) con mlx 0.32.4 y mlx-lm 0.32.2. Para el modelo original, motor basal en modo eager con device mps (Apple Silicon) o modo fast/eager en NVIDIA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión PL decisions | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-2.0-mini-preview-MLX (este port) | 7,46B | no disponible | 0,843 (una vía) | Apache 2.0 | MLX, Apple Silicon |
| basal-omni-2.0-mini-preview (original) | 7,46B | no disponible | 0,951 (dos vías) | Apache 2.0 | Motor basal, bf16 |
| basal-omni-2.0-mini-preview-GGUF | no disponible | no disponible | no disponible | Apache 2.0 | GGUF (lectura bidireccional pendiente de cambio upstream) |

No se dispone de datos de otros modelos comparables de la misma categoría (decisión calibrada) en la información proporcionada.

## Limitaciones y advertencias

- El autor marca explícitamente este port como experimental y no recomendado: la lectura unidireccional lo convierte en un modelo más débil que el original.
- Pérdida de precisión significativa: 0,843 frente a 0,951 en PL decisions; solo coincide con el modelo original en aproximadamente el 85% de las decisiones.
- La calibración incluida (CALIBRATION.mlx.json) está ajustada para la lectura unidireccional; la calibración del modelo original no es válida para este port.
- Solo texto: no incluye codificadores de imagen ni audio.
- Idiomas limitados a polaco e inglés.
- No se menciona soporte de tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación: no se proporcionan datos específicos, pero es un modelo de 7,46B con capacidades generales limitadas (PL general 0,758, EN corpus 0,669).
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la degradación de rendimiento desaconsejan su uso en producción.
- Para la lectura bidireccional exacta en Mac, se recomienda usar el repositorio principal con `basal-serve --mode eager --device mps` (más lento).
- La lectura bidireccional en MLX está planificada para una versión futura de basal, sin fecha.

## Enlaces

- Hugging Face (este port): https://huggingface.co/Remek/basal-omni-2.0-mini-preview-MLX
- Modelo base: https://huggingface.co/Remek/basal-omni-2.0-mini-preview
- Versión GGUF: https://huggingface.co/Remek/basal-omni-2.0-mini-preview-GGUF
- GitHub del motor basal: https://github.com/rkinas/basal
- Web del proyecto: https://basal.si5.pl/
