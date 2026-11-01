# BalaJM/gpt-news-model

## Resumen

`BalaJM/gpt-news-model` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert/distilgpt2`, la versión destilada de GPT-2 desarrollada por Hugging Face. El autor, BalaJM, lo publica bajo licencia Apache 2.0 con un tamaño de 81.915.648 parámetros (unos 0,3 GB en safetensors) y lo orienta, por el nombre y la tarea declarada, a la clasificación de noticias.

El modelo parte de una arquitectura transformer decoder-only (GPT-2 destilado) reutilizada como cabecera de clasificación, no de un encoder específico como BERT o DistilBERT. Se ha entrenado durante 3 épocas con AdamW, learning rate de 2e-05, batch de 16 y semilla 42, y declara en su model card una accuracy de 0,8775 y un F1 ponderado de 0,8769 sobre el conjunto de evaluación.

Su relevancia es limitada pero práctica: es un artefacto pequeño, ligero y de licencia permisiva que puede ejecutarse en CPU o en GPUs de gama baja para tareas de clasificación de titulares o textos periodísticos. La información pública es escasa (sin dataset documentado, sin idiomas declarados y sin benchmarks en el model-index), por lo que debe evaluarse empíricamente antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 destilado) con cabecera de clasificación |
| Parámetros totales | 81.915.648 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de distilgpt2, típicamente 1.024 tokens; no confirmado en la model card) |
| Tipos de cuantización | No disponible (pesos en safetensors; compatible con cuantización estándar de transformers/GGUF, no documentado por el autor) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert/distilgpt2`, un transformer decoder-only de 6 capas y ~82 M de parámetros destilado de GPT-2. Sobre esa base se ha añadido una cabeza de clasificación de secuencias, lo que convierte al modelo en un clasificador de texto pese a su origen generativo. No se documenta ningún cambio arquitectónico adicional ni técnicas como atención lineal, decodificación especulativa o mezcla de expertos.

El entrenamiento se realizó con el `Trainer` de Hugging Face durante 3 épocas, con `learning_rate=2e-05`, `train_batch_size=16`, `eval_batch_size=16`, semilla 42, optimizador `ADAMW_TORCH_FUSED` (betas 0,9/0,999, epsilon 1e-08) y scheduler lineal. La model card no especifica el dataset de entrenamiento (aparece como "unknown dataset"), ni el número de tokens, ni si hubo RLHF/DPO. La evolución de la pérdida de validación (0,4915 → 0,4087 → 0,3754) muestra una mejora monótona sin señales claras de sobreajuste en las 3 épocas registradas.

## Capacidades

- Clasificación de texto: tarea principal declarada en el pipeline (`text-classification`), orientada por el nombre del modelo a la categorización de noticias.
- Generación de texto: capacidad heredada de la base distilgpt2, aunque el fine-tuning con cabeza de clasificación no está pensado para generación abierta.
- Razonamiento y matemáticas: no documentados ni esperables en un modelo de 82 M de parámetros.
- Tool calling / function calling: no soportado de forma nativa.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (thinking mode, visión, audio): ninguna documentada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue en Hugging Face Inference Endpoints.

## Casos de uso

- Clasificación de titulares y noticias: el modelo puede asignar categorías temáticas a titulares o párrafos breves; su tamaño reducido permite procesar lotes grandes con bajo coste computacional.
- Moderación y filtrado de contenidos editoriales: útil para etiquetar textos periodísticos antes de su publicación, siempre que se valide la taxonomía con datos propios.
- Enrutado de contenidos en un CMS: clasificar automáticamente artículos entrantes para dirigirlos a secciones o editores concretos, aprovechando la latencia baja del modelo.
- Análisis de sentimiento o temática en corpus pequeños: adecuado para prototipos académicos o periodismo de datos donde no se justifica un modelo mayor.
- Clasificación en entornos con recursos limitados: al ocupar ~0,3 GB en safetensors, puede ejecutarse en CPU o en GPUs de gama baja sin infraestructura dedicada.
- Filtrado previo en pipelines de datos: como primer clasificador barato que descarte o etiquete documentos antes de pasarlos a un modelo mayor.
- Experimentación docente: ejemplo didáctico de fine-tuning de un modelo pequeño con el `Trainer` de Hugging Face para tareas de clasificación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 0,3754 |
| Accuracy | 0,8775 |
| F1 weighted | 0,8769 |
| F1 macro | 0,8763 |

Evolución durante el entrenamiento:

| Época | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|
| 1 | 150 | 0,4915 | 0,83 | 0,8288 | 0,8282 |
| 2 | 300 | 0,4087 | 0,865 | 0,8642 | 0,8636 |
| 3 | 450 | 0,3754 | 0,8775 | 0,8769 | 0,8763 |

El model-index del repositorio no contiene resultados adicionales (lista `results` vacía). No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (~0,33 GB de pesos más activaciones); en FP16 aproximadamente 0,16 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), `optimum`/ONNX para CPU, y `llama.cpp`/Ollama solo si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia de milisegundos por lote en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BalaJM/gpt-news-model | 81,9 M | No disponible | Clasificación de texto | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66 M | 512 tokens | Clasificación / encoder | Apache 2.0 | Hugging Face |
| distilgpt2 | 82 M | 1.024 tokens | Generación de texto | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 tokens | Clasificación / encoder | MIT | Hugging Face |

La comparación directa de rendimiento no es posible porque el autor no publica comparativas con alternativas ni el dataset de evaluación. Frente a encoders como DistilBERT o RoBERTa, este modelo parte de un decoder, lo que suele ofrecer menor eficiencia en clasificación pura pero permite reutilizar la base generativa.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", por lo que se desconoce la distribución, el dominio y el equilibrio de clases.
- Idiomas no declarados: no se puede asumir soporte multilingüe ni siquiera un rendimiento correcto en castellano.
- Riesgo de sesgos: al derivar de distilgpt2, puede heredar sesgos presentes en el corpus original de GPT-2 (WebText), no auditados en este fine-tuning.
- Riesgo de alucinación: bajo en clasificación, pero relevante si se usa para generación por su base GPT-2.
- Contexto limitado: aunque no se confirma, la base distilgpt2 maneja ventanas de ~1.024 tokens, insuficientes para artículos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación de procedencia de datos, lo que complica la auditoría legal en producción.
- Sin benchmarks externos ni evaluación independiente: las métricas declaradas proceden de un conjunto de evaluación no descrito y no son reproducibles a partir de la información pública.
- Modelo con 20 descargas y 0 likes: ecosistema mínimo, sin mantenimiento ni comunidad documentada.

## Enlaces

- Hugging Face: https://huggingface.co/BalaJM/gpt-news-model
- Modelo base: https://huggingface.co/distilbert/distilgpt2
- Repositorio de distilgpt2 en Hugging Face (referencia de arquitectura): https://huggingface.co/distilgpt2
