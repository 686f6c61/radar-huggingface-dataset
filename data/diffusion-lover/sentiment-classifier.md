# diffusion-lover/sentiment-classifier

## Resumen

`sentiment-classifier` es un modelo de clasificación de texto publicado por el usuario diffusion-lover en Hugging Face. Se trata de un fine-tuning de `google-bert/bert-base-cased`, el encoder BERT clásico de 108 millones de parámetros, entrenado para la tarea de análisis de sentimiento (text-classification). El modelo se generó automáticamente con la clase `Trainer` de la librería Transformers, como indica la etiqueta `generated_from_trainer` y el aviso de la propia model card.

La relevancia práctica de este modelo es muy limitada: se trata de un artefacto de entrenamiento con una model card sin completar, sin dataset documentado y con una precisión declarada de 0,68 en el conjunto de evaluación, un valor bajo para una tarea de clasificación binaria o ternaria de sentimiento. Acumula una única descarga y cero likes en el momento de redactar esta ficha, lo que sugiere que no ha sido validado por la comunidad.

A nivel técnico es un transformer encoder estándar basado en BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención), con una ventana de contexto de 512 tokens y pesos en formato safetensors bajo licencia Apache 2.0. No incorpora innovaciones arquitectónicas ni datos de entrenamiento publicados, por lo que debe considerarse un ejemplo de fine-tuning más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) |
| Parámetros totales | 108.311.810 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT-base) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32; admite cuantización estándar vía PyTorch/GGUF, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es principalmente inglés; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `bert-base-cased`, un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, sobre el que se añade una cabeza de clasificación de secuencia. El tokenizador es el `cased` de BERT, que preserva mayúsculas, lo que puede ser relevante en análisis de sentimiento donde el énfasis tipográfico aporta señal.

Los detalles del entrenamiento son escasos. La model card indica que se usó un dataset desconocido ("unknown dataset"), con `learning_rate=5e-05`, `train_batch_size=8`, `eval_batch_size=8`, semilla 42, optimizador AdamW (variante fused), scheduler lineal y 2 épocas. El entrenamiento constó de solo 50 pasos totales (25 por época), lo que apunta a un conjunto de datos muy pequeño. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO (no aplicable en un encoder de clasificación). Las versiones de framework declaradas (Transformers 5.22.1, PyTorch 2.14.1+cpu) no se corresponden con versiones públicas conocidas de esas librerías, lo que refuerza la naturaleza experimental del artefacto.

## Capacidades

- Clasificación de texto para análisis de sentimiento (etiquetas no documentadas; presumiblemente positivo/negativo o positivo/neutro/negativo).
- Codificación contextual de secuencias de hasta 512 tokens.
- Fine-tuning adicional posible sobre el checkpoint para otras tareas de clasificación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Capacidades multilingües no declaradas; el modelo base está orientado al inglés.

## Casos de uso

- Prototipado rápido de análisis de sentimiento en inglés: al ser un BERT-base fine-tuneado, puede servir como línea base para comparar con modelos posteriores en un pipeline de experimentación, siempre que se valide la calidad con un conjunto propio.
- Clasificación de reseñas o comentarios cortos en inglés: la ventana de 512 tokens cubre la mayoría de reseñas de producto y tuits, y el tokenizador `cased` preserva señales tipográficas útiles.
- Etiquetado de datos asistido: usar el modelo para pre-anotar un corpus de sentimiento y revisar manualmente las predicciones, dado su bajo rendimiento declarado (0,68 de accuracy) que exige supervisión humana.
- Fine-tuning posterior sobre un dominio específico: el checkpoint puede servir de inicialización para reentrenar con un dataset propio documentado, corrigiendo la falta de trazabilidad del entrenamiento original.
- Docencia y ejemplos de fine-tuning con `Trainer`: útil como caso práctico de cómo NO documentar un modelo y de las métricas mínimas que deben reportarse.
- Integración en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial y modificación, aunque la ausencia de garantías sobre el dataset de entrenamiento desaconseja su uso en producción sin auditoría.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación durante el entrenamiento:

| Métrica | Valor |
|---|---|
| Loss (validación, época 1) | 0,6575 |
| Accuracy (validación, época 1) | 0,65 |
| Loss (validación, época 2) | 0,6092 |
| Accuracy (validación, época 2) | 0,68 |

El `model-index` de la model card está vacío (`results: []`), por lo que no hay benchmarks estándar (MMLU, GLUE, SST-2, etc.) publicados. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 450 MB para los pesos (108 M de parámetros × 4 bytes) más activaciones y overhead, en torno a 1-2 GB en total.
- VRAM estimada en fp16: aproximadamente 220 MB para los pesos; en int8, unos 110 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia en lote con holgura. Para entrenamiento o fine-tuning se recomienda al menos 8-12 GB de VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más, e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, ONNX Runtime, o exportación a GGUF para llama.cpp (aunque llama.cpp está orientado a modelos generativos; para clasificación es más habitual ONNX o TorchScript).
- Latencia y throughput: no disponibles en la información proporcionada; en una GPU moderna se espera latencia de milisegundos por secuencia y throughput de cientos a miles de secuencias por segundo en lote, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-lover/sentiment-classifier | 108,3 M | 512 | Accuracy 0,68 (validación propia) | Apache 2.0 | Hugging Face, 1 descarga |
| google-bert/bert-base-cased | 108,3 M | 512 | No aplica (modelo base sin fine-tuning) | Apache 2.0 | Hugging Face, ampliamente usado |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 | Benchmark SST-2 publicado por el autor | Apache 2.0 | Hugging Face, muy popular |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 | Benchmark propio publicado | MIT | Hugging Face, popular en análisis de sentimiento |

La comparación con alternativas consolidadas de análisis de sentimiento (DistilBERT SST-2, RoBERTa de CardiffNLP) es desfavorable para este modelo en términos de documentación, validación y rendimiento declarado. No se dispone de datos de benchmarks comparables directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Precisión declarada de 0,68 en validación: insuficiente para la mayoría de aplicaciones de producción de análisis de sentimiento.
- Dataset de entrenamiento no documentado ("unknown dataset"): imposible auditar sesgos, composición o cobertura lingüística.
- Solo 50 pasos de entrenamiento y 2 épocas: riesgo alto de infraentrenamiento o sobreajuste a un conjunto minúsculo.
- Model card generada automáticamente y sin completar: no hay información sobre etiquetas, formato de entrada ni limitaciones conocidas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas sistemáticas por sesgos del dataset desconocido.
- Idiomas no declarados: el modelo base está orientado al inglés; el uso en castellano no está validado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías sobre los datos de entrenamiento traslada el riesgo legal y ético al usuario.
- No usar en producción sin validación con un conjunto propio etiquetado y sin auditoría del comportamiento en dominios objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diffusion-lover/sentiment-classifier
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
