# Jendersen/t5-small-finetuned-bible-only-welsh-breton-kernewek-16

## Resumen

El modelo `Jendersen/t5-small-finetuned-bible-only-welsh-breton-kernewek-16` es un ajuste fino (fine-tuning) del modelo base `t5-small` de Google, realizado por el usuario Jendersen en HuggingFace. Está diseñado para tareas de generación de texto (text2text-generation) en lenguas celtas minoritarias: galés, bretón y córnico, como sugiere su nombre. El entrenamiento se ha realizado sobre un corpus de textos bíblicos, aunque la model card no especifica el conjunto de datos concreto (aparece como "None").

Con aproximadamente 60,5 millones de parámetros, este modelo es relativamente pequeño y se enfoca en un dominio muy específico. Su relevancia radica en la escasez de recursos de IA para lenguas minoritarias, lo que puede ser útil para proyectos de preservación lingüística, traducción y generación de contenido en estos idiomas. Sin embargo, no se han publicado resultados de benchmarks estandarizados y el modelo cuenta con cero descargas y cero likes, lo que sugiere un estado experimental o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-small) |
| Parametros totales | 60.506.248 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no especificado; el nombre indica galés, bretón y córnico |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5 (Text-to-Text Transfer Transformer) en su variante "small", que tiene un tamaño de 60 millones de parámetros. T5 es un modelo encoder-decoder que convierte todas las tareas de NLP en un formato de texto a texto, lo que lo hace flexible para generación, traducción y otras tareas. El entrenamiento se realizó mediante fine-tuning sobre un dataset no especificado (denominado "None" en la model card), aparentemente con textos bíblicos en las lenguas objetivo.

Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-5, tamaño de batch de 16, 10 épocas, optimizador AdamW con betas (0.9, 0.999), scheduler lineal y entrenamiento con precisión mixta. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La evaluación muestra una pérdida final de 2.1245, con métricas ROUGE y BLEU muy bajas (Bleu de 0.0035), lo que indica una calidad de generación limitada, probablemente debido al tamaño del modelo y al corpus reducido.

## Capacidades

- Generación de texto en lenguas celtas minoritarias (galés, bretón, córnico) según el nombre del modelo.
- Transformación de texto a texto, lo que permite tareas como traducción, resumen o paráfrasis, aunque con baja calidad.
- Entrenado específicamente en un corpus bíblico, por lo que su dominio se limita a vocabulario y estructuras de estos textos.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.
- No se menciona soporte para otros idiomas fuera de los indicados en el nombre.

## Casos de uso

- Traducción de textos religiosos: el modelo puede ayudar a traducir pasajes bíblicos entre galés, bretón y córnico, o desde otras lenguas hacia estas, aunque la calidad puede ser baja para textos no religiosos.
- Preservación cultural: generación de contenido en lenguas minoritarias para archivos digitales, bibliotecas o museos, especialmente textos históricos.
- Educación lingüística: crear ejercicios de reescritura o generación de frases simples en estas lenguas para estudiantes.
- Asistencia en transcripción de manuscritos antiguos: si se cuenta con texto ya digitalizado, el modelo puede ayudar a generar versiones modernizadas o resúmenes.
- Investigación en procesamiento de lenguas celtas: sirve como modelo base para experimentos de fine-tuning en tareas específicas.
- Prototipos de chatbots temáticos: limitado a conversaciones sobre contenido religioso o general con vocabulario restringido.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandarizados (MMLU, HumanEval, etc.). El modelo-index está vacío. Sin embargo, el autor reporta métricas de evaluación obtenidas durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 2.1245 |
| Rouge1 | 17.3232 |
| Rouge2 | 4.6074 |
| Rougel | 15.549 |
| Rougelsum | 15.7364 |
| Bleu | 0.0035 |
| Chrf++ | 8.0701 |
| F1 | 32.6394 |
| Gen Len | 18.9738 |

Estos valores son muy bajos en comparación con modelos generales, lo que indica un rendimiento limitado. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene ~60M de parámetros, por lo que la inferencia es ligera.
- VRAM estimada para inferencia en FP16: ~1 GB (según el tamaño de T5-small).
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 o superior. También puede ejecutarse en CPU.
- Cabe en GPUs de consumo (RTX 3060, RTX 4090, etc.) sin problemas.
- Opciones de despliegue: Transformers de Hugging Face, ONNX Runtime, vLLM (con soporte para T5), llama.cpp no es compatible (es para modelos decoder-only), Ollama tampoco.
- Latencia y throughput estimados: no se conocen datos específicos, pero al ser un modelo pequeño, la generación es rápida en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. Existen otros modelos de Jendersen con nombres similares (por ejemplo, `t5-small-finetuned-bible-only-kernewek-plus-br-cy`), pero no hay datos comparables. Se puede señalar que el modelo base `t5-small` tiene mejor rendimiento general, pero no está especializado en lenguas celtas.

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| t5-small (base) | 60 M | 512 | Apache 2.0 | Generalista |
| t5-small-finetuned-bible-only-welsh-breton-kernewek-16 | 60.5 M | no disponible | Apache 2.0 | Lenguas celtas (galés, bretón, córnico) |

## Limitaciones y advertencias

- El modelo está entrenado únicamente en textos bíblicos, por lo que su vocabulario y temática son muy restrictivos.
- Las métricas de evaluación (Bleu 0.0035, Rouge1 17.3) indican una calidad de generación baja, con riesgo alto de alucinaciones y errores gramaticales.
- No se ha realizado una evaluación de sesgos; al ser un corpus religioso, puede tener sesgos doctrinales.
- No se especifican los idiomas exactos ni el porcentaje de datos por lengua; el rendimiento puede variar significativamente entre galés, bretón y córnico.
- La licencia Apache 2.0 permite uso comercial, pero sin garantías de calidad o soporte.
- El modelo tiene cero descargas y cero likes, lo que sugiere que no ha sido probado ni validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Jendersen/t5-small-finetuned-bible-only-welsh-breton-kernewek-16)
- [Modelo relacionado: t5-small-finetuned-bible-only-kernewek-plus-br-cy](https://huggingface.co/Jendersen/t5-small-finetuned-bible-only-kernewek-plus-br-cy)
- [Modelo relacionado: t5-small-finetuned-welsh-breton-kernewek](https://huggingface.co/Jendersen/t5-small-finetuned-welsh-breton-kernewek)
- [Página de Trackio asociada](https://huggingface.co/spaces/Jendersen/huggingface-static-d1a7af) (enlace de visualización)
