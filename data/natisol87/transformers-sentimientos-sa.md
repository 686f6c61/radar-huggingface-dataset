# natisol87/Transformers-sentimientos-SA

## Resumen

`natisol87/Transformers-sentimientos-SA` es un clasificador binario de sentimiento para textos cortos en español, publicado por natisol87 como ejemplo pedagógico del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de propósito general: es una demostración didáctica de qué piezas componen un modelo publicado en Hugging Face (arquitectura, pesos, tokenizer y scripts de entrenamiento e inferencia).

Técnicamente es un BERT diminuto entrenado desde cero con `BertForSequenceClassification`: 2 capas, 2 cabezas de atención, dimensión oculta de 32 y 20.546 parámetros totales. El tokenizer es a nivel de palabra (`WordLevel`) con un vocabulario de solo 37 tokens, que pasa el texto a minúsculas y elimina tildes. La tarea es clasificar comentarios sobre departamentos como `positivo` (1) o `negativo` (0).

Su relevancia es exclusivamente educativa: sirve para entender el flujo completo de publicación de un modelo en el Hub y para ilustrar conceptos como el sesgo de evaluación sobre datos sintéticos, el problema de los tokens `[UNK]` y la confianza mal calibrada. No está pensado para uso en producción ni para datos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (`BertForSequenceClassification`), transformer encoder |
| Parámetros totales | 20.546 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | español (`es`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con 2 capas, 2 cabezas de atención y dimensión oculta de 32, configurado para clasificación de secuencias con dos etiquetas (`negativo` = 0, `positivo` = 1). El tokenizer es `WordLevel` con 37 tokens, normaliza a minúsculas y elimina tildes. Se entrenó desde cero con PyTorch y Hugging Face Transformers, usando entropía cruzada como función de pérdida y `AdamW` con tasa de aprendizaje 0,001 durante 15 épocas en lotes de 16.

Los datos de entrenamiento son sintéticos: 368 comentarios generados en `train.py` a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos), divididos en 294 para entrenamiento y 74 para evaluación. No se aplicó RLHF, DPO ni ningún ajuste posterior; tampoco hay preentrenamiento previo, ya que el modelo se entrena íntegramente desde cero con vocabulario propio.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en textos cortos en español construidos con el vocabulario de 37 tokens del tokenizer.
- Inferencia mediante `pipeline("text-classification")` de Transformers, compatible con Transformers 4 y 5.
- Compatible con Text Embeddings Inference y endpoints de Hugging Face según los tags del repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo español y solo con el vocabulario restringido.
- No dispone de modo de razonamiento, visión ni audio.

## Casos de uso

- Demostración didáctica de publicación de modelos: sirve para mostrar en clase las piezas mínimas de un modelo en el Hub (config, pesos, tokenizer, scripts) y cómo cargarlo con `pipeline`.
- Ejercicio de análisis de tokenización: permite ilustrar en vivo cómo palabras fuera del vocabulario se convierten en `[UNK]` y cómo eso degrada la predicción.
- Ejemplo de evaluación engañosa: útil para explicar por qué un accuracy de 1,000 sobre datos sintéticos con las mismas plantillas no implica generalización.
- Práctica de calibración de confianza: el modelo predice con seguridad alta incluso ante entradas sin sentido, lo que sirve para discutir métricas de calibración y umbrales de rechazo.
- Punto de partida para fine-tuning: el código de `train.py` puede reutilizarse como plantilla para entrenar un clasificador con datos reales partiendo de un modelo preentrenado en español.
- Pruebas de integración de pipelines: útil para validar el flujo de despliegue con `pipeline`, Text Embeddings Inference o endpoints antes de sustituir el modelo por uno real.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios sintéticos de test |

El propio autor advierte que este resultado es optimista: los comentarios de test usan las mismas plantillas y adjetivos que los de entrenamiento. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo ocupa 20.546 parámetros y el repositorio pesa 0,0 GB.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o inferior, y también en entornos sin GPU.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (según tags) y endpoints de Hugging Face.
- Latencia y throughput: no disponibles; por el tamaño, la latencia en CPU es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| natisol87/Transformers-sentimientos-SA | 20.546 | no disponible | Clasificación binaria de sentimiento (es) | MIT | Hugging Face |
| BERT-base multilingüe | ~178 M | 512 tokens | Clasificación y representaciones | Apache 2.0 | Hugging Face |
| BETO (BERT español) | ~110 M | 512 tokens | Clasificación y representaciones (es) | MIT | Hugging Face |
| RoBERTa-base BNE | ~125 M | 512 tokens | Clasificación y representaciones (es) | MIT | Hugging Face |

La comparación es solo orientativa: los tres modelos alternativos son preentrenados y requieren fine-tuning para clasificación de sentimiento, mientras que este modelo está entrenado desde cero para una tarea concreta con vocabulario restringido. No hay datos de benchmarks comparables en la información disponible.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para producción.
- Vocabulario de solo 37 tokens: cualquier palabra fuera de él se convierte en `[UNK]`, y el modelo sigue respondiendo con confianza alta (por ejemplo, `negativo` con 1,00 ante entradas sin sentido).
- No entiende negaciones ("no es luminoso") ni ironía, porque no aparecen en los datos de entrenamiento.
- El accuracy de 1,000 es optimista por el uso de plantillas y adjetivos idénticos en entrenamiento y test.
- Sesgos conocidos: no disponibles; el dataset sintético no permite evaluar sesgos de género, origen u otros.
- Riesgo de alucinación: limitado al formato de clasificación, pero con confianza mal calibrada ante entradas fuera de distribución.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para ello por sus limitaciones técnicas.
- Para uso real, se recomienda partir de un modelo preentrenado en español y hacer fine-tuning con comentarios reales.

## Enlaces

- Hugging Face: https://huggingface.co/natisol87/Transformers-sentimientos-SA
- GitHub del autor: https://github.com/natisol87
