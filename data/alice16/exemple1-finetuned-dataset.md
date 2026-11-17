# alice16/exemple1-finetuned-dataset

## Resumen

`alice16/exemple1-finetuned-dataset` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado del checkpoint `projecte-aina/roberta-base-ca-v2`, un RoBERTa base entrenado por el Projecte Aina para el catalán. El autor, identificado como `alice16`, lo ha entrenado sobre el conjunto de datos `dair-ai/emotion`, una colección de mensajes cortos en inglés etiquetados con seis emociones básicas (tristeza, alegría, amor, enfado, miedo y sorpresa). El resultado es, por tanto, un clasificador de emociones de una sola época, con 124,6 millones de parámetros y pesos en formato safetensors.

El modelo es relevante únicamente como ejemplo académico o como punto de partida reproducible: la model card es la plantilla automática generada por `Trainer` y no documenta usos previstos, composición del dataset ni limitaciones. La combinación de un backbone entrenado en catalán con un corpus de emociones en inglés introduce un desajuste lingüístico que conviene tener presente antes de cualquier evaluación seria.

No se trata de un modelo de propósito general ni de un LLM: es un encoder de clasificación con una cabeza de secuencia. Cualquier uso en producción requeriría reentrenamiento, evaluación sobre un conjunto de validación independiente y una revisión de la idoneidad del corpus de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, base) con cabeza de clasificación de secuencia |
| Parametros totales | 124.653.325 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (RoBERTa base admite típicamente 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (backbone entrenado en catalán; dataset de fine-tuning en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `projecte-aina/roberta-base-ca-v2`, un RoBERTa base de 12 capas y 768 dimensiones ocultas adaptado al catalán por el Projecte Aina. Sobre ese backbone se añade una cabeza de clasificación y se realiza un fine-tuning completo (no se documenta LoRA ni congelación de capas) durante una única época sobre `dair-ai/emotion`, con un total de 155 pasos de entrenamiento.

Los hiperparámetros declarados son: learning rate 2e-05, batch size de entrenamiento y evaluación de 64, semilla 42, optimizador AdamW con `fused=True`, betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y una época. El entorno de ejecución corresponde a Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta ninguna innovación técnica adicional (sin decodificación especulativa, sin atención lineal, sin RLHF ni DPO), lo cual es esperable en un encoder de clasificación.

## Capacidades

- Clasificación de texto multietiqueta única: asigna una de las seis emociones del corpus `dair-ai/emotion` a una secuencia de entrada.
- Extracción de representaciones contextuales del catalán a través del backbone RoBERTa subyacente.
- Fine-tuning adicional sobre otros corpus de clasificación, dado que los pesos son compatibles con la API de `transformers`.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- El soporte multilingüe no está documentado; el backbone es monolingüe en catalán y el corpus de ajuste es en inglés.

## Casos de uso

- Prototipado académico de pipelines de clasificación: sirve como ejemplo reproducible de fine-tuning de un encoder catalán con `Trainer`, útil en docencia o en pruebas de integración de Hugging Face.
- Clasificación de emociones en catalán previa validación: si se confirma empíricamente que el modelo transfiere la tarea al catalán, podría emplearse como baseline en análisis de opiniones o moderación de contenido, siempre con un conjunto de evaluación propio.
- Etiquetado asistido de corpus: uso como preetiquetador para acelerar el etiquetado manual de mensajes cortos, con revisión humana posterior dado el F1 de 0,4862 declarado.
- Base para experimentos de ablación: punto de partida para comparar estrategias de fine-tuning (épocas, learning rate, congelación de capas) sobre el mismo backbone catalán.
- Filtrado de reseñas o comentarios por tono emocional en un prototipo interno, aceptando un rendimiento moderado y sin garantías de producción.
- Componente de demostración en un notebook o demo de Gradio para ilustrar clasificación de emociones, no como servicio con SLA.

## Benchmarks y rendimiento

El autor declara en la model card los resultados de validación obtenidos durante el entrenamiento. No se han publicado resultados en el `model-index` (la lista de resultados está vacía).

| Metrica | Valor |
|---|---|
| Validation loss | 2,0289 |
| Accuracy | 0,5632 |
| F1 | 0,4862 |
| Epocas | 1 |
| Pasos | 155 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB para los pesos (124,6 M de parámetros × 4 bytes) más activaciones y overhead del runtime; en fp16 aproximadamente 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece margen holgado para lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchScript o exportación a ONNX; también es compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alice16/exemple1-finetuned-dataset | 124,6 M | no disponible | Clasificación de emociones | Apache 2.0 | Hugging Face |
| projecte-aina/roberta-base-ca-v2 | ~125 M | no disponible | Modelo base (masked LM) | no disponible en la información proporcionada | Hugging Face |
| roberta-base (Facebook AI) | ~125 M | 512 tokens | Modelo base (masked LM) | MIT | Hugging Face |

La comparación se limita al backbone y a la arquitectura, ya que no se dispone de resultados de benchmarks de este checkpoint frente a alternativas de clasificación de emociones.

## Limitaciones y advertencias

- El modelo se ha entrenado una sola época y presenta un F1 de 0,4862 en validación, lo que indica un rendimiento moderado y probablemente insuficiente para producción sin más ajuste.
- Desajuste lingüístico: backbone entrenado en catalán y corpus de fine-tuning en inglés; el comportamiento en catalán no está documentado ni evaluado.
- La model card es la plantilla automática de `Trainer`; no hay sección de usos previstos, sesgos ni limitaciones redactada por el autor.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de etiquetas erróneas y sobreconfianza en las predicciones.
- Sesgos potenciales heredados de `dair-ai/emotion`: corpus de mensajes cortos en inglés, con posibles desequilibrios de clase y de dominio que no se han analizado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de documentación desaconseja su despliegue directo.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alice16/exemple1-finetuned-dataset
- Modelo base: https://huggingface.co/projecte-aina/roberta-base-ca-v2
- Dataset de fine-tuning: https://huggingface.co/datasets/dair-ai/emotion
- Documentación de Transformers: https://huggingface.co/docs/transformers
