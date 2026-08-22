# Jendersen/t5-small-finetuned-bible-only-kernewek-plus-br-cy

## Resumen

El modelo `Jendersen/t5-small-finetuned-bible-only-kernewek-plus-br-cy` es un fine-tuning de un T5-small (60,5 millones de parámetros) sobre un corpus textual que, según el nombre, parece orientado a lenguas celtas como el córnico (kernewek), el galés (cy) y el bretón (br). El autor, Jendersen, ha publicado varios modelos similares con nombres análogos (p. ej. `t5-small-finetuned-breton-plus-cy-kw-4`), lo que sugiere una serie de experimentos de adaptación de T5 a lenguas minoritarias. La model card no proporciona detalles sobre el dataset de entrenamiento ni los idiomas exactos, y el modelo se referencia a sí mismo como base, lo que indica una documentación incompleta.

La relevancia de este modelo reside en su tamaño reducido (T5-small) y su licencia Apache-2.0, que lo hace fácil de desplegar en entornos con pocos recursos. Sin embargo, su utilidad práctica es limitada sin información clara sobre las tareas específicas que fue entrenado para resolver, y las métricas reportadas (ROUGE, BLEU, F1) son bajas, lo que sugiere un rendimiento modesto en generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Decoder Transformer (T5) |
| Parametros totales | 60.506.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto T5 usa 512 tokens, pero no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere córnico, galés y bretón, pero no se confirma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5 (Text-to-Text Transfer Transformer) de Google, un transformer encoder-decoder donde todas las tareas se formulan como una transformación de texto a texto. El fine-tuning se realizó sobre un dataset no especificado ("None dataset" según la model card), aunque el nombre del modelo indica que los datos provienen de la Biblia en lenguas celtas. El entrenamiento utilizó el optimizador AdamW (fused), con una tasa de aprendizaje de 2e-5, batch size de 16, scheduler linear y 10 épocas completas. No se menciona ningún uso de RLHF/DPO ni técnicas de alineación adicionales. La pérdida de validación final fue de 1.5934, lo que indica un ajuste moderado, pero las métricas de generación (BLEU 0.008, Rouge1 23.1) son muy bajas, típicas de modelos de tamaño pequeño entrenados con datasets limitados.

## Capacidades

- Generación de texto de formato corto (secuencias de alrededor de 19 tokens según la longitud de generación media).
- Posible capacidad de traducción o transformación de texto entre lenguas celtas (córnico, galés, bretón) si se usa el modelo con el prefijo adecuado (típico de T5), aunque no hay evidencia publicada.
- No soporta tool calling, ni agentes, ni razonamiento multi-step.
- No hay información sobre capacidades multilingües fuera de las lenguas celtas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- **Traducción automática de textos religiosos**: el modelo podría emplearse para traducir pasajes bíblicos entre córnico, galés y bretón, aunque las métricas bajas sugieren que solo es útil para frases cortas y simples.
- **Generación de texto en lenguas minoritarias**: puede servir como prototipo para generar contenido en córnico o bretón, aunque su calidad será limitada.
- **Investigación en modelos de tamaño reducido**: es un ejemplo de fine-tuning de T5-small en lenguas de bajos recursos, útil para estudiar técnicas de adaptación con pocos datos.
- **Pruebas de integración en pipelines de transformers**: al ser un modelo pequeño y con licencia Apache-2.0, se puede usar como un caso de prueba para el despliegue de modelos T5 en entornos con restricciones de memoria.
- **Aplicaciones de transcripción o normalización de texto**: si el dataset de entrenamiento contenía textos bíblicos, el modelo puede aprender a normalizar variantes ortográficas, aunque no está confirmado.
- **Prototipado de chatbots en córnico**: con una capa de post-procesamiento, podría generar respuestas simples en córnico, pero no es recomendable para uso real.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (sin especificar el dataset):

| Métrica | Valor |
|---|---|
| Loss | 1.5934 |
| Rouge1 | 23.1175 |
| Rouge2 | 9.4058 |
| Rougel | 21.2312 |
| Rougelsum | 21.3954 |
| Bleu | 0.008 |
| Chrf++ | 11.109 |
| F1 | 38.0577 |
| Gen Len | 18.9739 |

Estos valores son muy bajos en comparación con modelos de tamaño similar (p. ej., T5-small estándar obtiene BLEU > 20 en tareas de traducción). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: ~250 MB en FP32 (60M parámetros × 4 bytes) o ~125 MB en FP16. La inferencia puede ejecutarse en CPU sin problemas.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 2060, o incluso integradas). No requiere GPU de data center.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU moderna.
- **Opciones de despliegue**: puede usarse con Hugging Face Transformers, vLLM, TGI, o llama.cpp si se convierte a GGUF. No se necesita un servidor especializado.
- **Latencia y throughput**: para un modelo de este tamaño, la inferencia es rápida (< 50 ms por generación en CPU moderna). No hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información de modelos comparables en la misma categoría (fine-tunes de T5 en lenguas celtas). Los modelos más cercanos son los otros fine-tunes de T5 del mismo autor, como `t5-small-finetuned-welsh-breton-kernewek`, pero no se tienen datos de su rendimiento. En general, el T5-small original (60M) es el punto de referencia, pero este modelo no ha sido evaluado en tareas estándar.

## Limitaciones y advertencias

- **Documentación incompleta**: no se especifica el dataset de entrenamiento, los idiomas exactos ni la tarea prevista.
- **Rendimiento bajo**: las métricas de generación (BLEU 0.008, Rouge1 23) son muy bajas, lo que limita su uso en aplicaciones reales.
- **Sesgos potenciales**: el entrenamiento se realizó sobre textos bíblicos, por lo que el vocabulario y el estilo pueden estar sesgados hacia el lenguaje religioso y no ser representativo del uso cotidiano.
- **Riesgo de alucinación**: al ser un modelo pequeño y con pocos datos, es probable que genere texto incoherente o inventado fuera de su dominio.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo no es fiable para producción.
- **Contexto limitado**: al ser T5, la longitud de entrada típica es de 512 tokens, aunque no se confirma en este modelo.

## Enlaces

- [HuggingFace - Jendersen/t5-small-finetuned-bible-only-kernewek-plus-br-cy](https://huggingface.co/Jendersen/t5-small-finetuned-bible-only-kernewek-plus-br-cy)
- [Trackio visualización 1](https://huggingface.co/spaces/Jendersen/huggingface-static-3fa060)
- [Trackio visualización 2](https://huggingface.co/spaces/Jendersen/huggingface-static-133818)
- [Trackio visualización 3](https://huggingface.co/spaces/Jendersen/huggingface-static-01c3eb)
- [Wikipedia - T5 (lenguaje modelo)](https://en.wikipedia.org/wiki/T5_(language_model))
- [Modelo similar: Jendersen/t5-small-finetuned-welsh-breton-kernewek](https://huggingface.co/Jendersen/t5-small-finetuned-welsh-breton-kernewek)
