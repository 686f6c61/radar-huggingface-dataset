# joamCriff123/zils-mini-m1113

## Resumen

zils-mini-m1113 es un modelo de decisión (decision-model) publicado por el usuario joamCriff123 en Hugging Face, construido como un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B. Su propósito declarado es actuar como "cuerpo de decisión d3-mini" para el pool mini de la subred Zils 127, un contexto de despliegue muy específico que sugiere un uso orientado a la toma de decisiones automatizadas dentro de una infraestructura de subred distribuida, más que a la generación de texto generalista.

El modelo emplea la arquitectura de la familia Qwen3.5, con 4.539.265.536 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos densos de aproximadamente 4.500 millones de parámetros. La model card es extremadamente escueta: no documenta longitud de contexto, idiomas, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones técnicas deben considerarse no disponibles a partir de la información publicada.

Su relevancia actual es limitada y de nicho: se trata de un modelo recién creado (noviembre de 2026) con cero descargas y cero likes, sin documentación técnica sustancial. Resulta útil únicamente como referencia para quienes participan en el ecosistema Zils o quieran inspeccionar un finetune de Qwen3.5-4B con licencia Apache-2.0. La licencia permisiva y el formato safetensors estándar facilitan su inspección técnica, pero la ausencia de evaluación publicada impide recomendarlo para producción sin validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`; detalles no disponibles) |
| Parámetros totales | 4.539.265.536 (según safetensors) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 9,1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.500 millones de parámetros. La etiqueta `qwen3_5` y la inclusión de `custom_code` en los tags indican que la implementación requiere código personalizado al cargarse con la librería transformers, probablemente por definiciones de arquitectura específicas de la familia Qwen3.5 no integradas en versiones estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado en el finetune.

La model card únicamente describe el modelo como un "d3-mini decision body" para el pool mini de la subred Zils 127, sin detallar la innovación técnica ni el proceso de entrenamiento. No hay información sobre decodificación especulativa, atención lineal, mezcla de expertos ni otras optimizaciones. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y no está respaldada por la información proporcionada.

## Capacidades

- El pipeline declarado es `feature-extraction`, lo que indica que el modelo está configurado para producir representaciones o embeddings, no necesariamente para generación de texto libre.
- Etiquetado como `decision-model`, orientado a la toma de decisiones dentro del pool mini de la subred Zils 127.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades especiales como modo thinking, visión o audio.
- Al derivar de Qwen3.5-4B, es plausible que herede parte de las capacidades del base, pero no hay confirmación en la información disponible.

## Casos de uso

- Toma de decisiones en el pool mini de Zils 127: uso previsto declarado por el autor; el modelo actuaría como cuerpo de decisión dentro de la infraestructura de la subred, evaluando entradas y emitiendo decisiones según el protocolo de dicha subred.
- Extracción de características para pipelines de clasificación: al estar configurado como `feature-extraction`, puede emplearse para generar embeddings que alimenten clasificadores posteriores en tareas internas.
- Experimentación con finetunes de Qwen3.5-4B: sirve como referencia para investigadores que quieran comparar variantes ajustadas sobre el mismo base con licencia Apache-2.0.
- Prototipado de sistemas de decisión automatizada: en entornos controlados donde se pueda validar el comportamiento, dado que no hay benchmarks publicados.
- Investigación sobre modelos de decisión de nicho: útil para estudiar cómo se especializa un modelo base generalista hacia una tarea concreta mediante finetune.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial e integración en productos propietarios, siempre que se cumplan las atribuciones del NOTICE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 11-14 GB según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB; en 4 bits, alrededor de 3-4 GB (estimaciones basadas en el número de parámetros, no en cuantizaciones publicadas por el autor).
- GPU recomendadas para FP16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB) para contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con margen, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (requiere `custom_code`), potencialmente vLLM o TGI si la arquitectura es compatible, y llama.cpp/Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-m1113 | 4.539 M | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Finetune de nicho para Zils 127 |
| Qwen/Qwen3.5-4B | ~4.500 M | No disponible en esta ficha | Según modelo base (no confirmada aquí) | Hugging Face | Modelo base del que deriva |
| Alternativas de ~4B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks para comparar |

No se dispone de información suficiente sobre benchmarks ni sobre modelos comparables de la misma categoría para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Model card extremadamente escueta: sin información sobre dataset, proceso de entrenamiento ni evaluación.
- Riesgo de alucinación: desconocido, pero al no haber evaluación, debe asumirse un riesgo no cuantificado en producción.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B podría heredar sesgos del base, pero no hay confirmación.
- Idiomas soportados no especificados: no se puede garantizar cobertura multilingüe.
- Longitud de contexto no documentada: limita la planificación de despliegues con entradas largas.
- Requiere `custom_code` para cargarse con transformers: puede complicar la integración en pipelines estándar y en servidores de inferencia.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial, pero debe revisarse el archivo NOTICE para las atribuciones de Qwen y del autor.
- Uso previsto muy específico (pool mini de Zils 127): no está pensado como modelo generalista y su comportamiento fuera de ese contexto es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-mini-m1113
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
