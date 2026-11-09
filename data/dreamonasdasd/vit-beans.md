# dreamonasdasd/vit-beans

## Resumen

`vit-beans` es un modelo de clasificación de imágenes resultado del ajuste fino (*fine-tuning*) de `google/vit-base-patch16-224-in21k`, el Vision Transformer base de Google preentrenado en ImageNet-21k. Lo publica el usuario `dreamonasdasd` en Hugging Face bajo licencia Apache 2.0. El nombre sugiere un conjunto de datos de clasificación de variedades de judías (posiblemente el *Beans* dataset de hojas de plantas), aunque la model card no lo confirma: el autor indica explícitamente "unknown dataset" y deja sin rellenar las secciones de descripción, usos previstos y datos de entrenamiento.

Se trata de un modelo pequeño (85.800.963 parámetros, unos 0,3 GB en safetensors) pensado para una tarea de clasificación de imágenes concreta, no para uso general. Su relevancia es limitada: es un artefacto de entrenamiento con métricas modestas (accuracy de 0,3984 en evaluación, pérdida de 1,0848) y sin documentación técnica. Resulta útil como ejemplo de pipeline de fine-tuning de ViT con `Trainer`, pero no como componente de producción sin una validación adicional.

La arquitectura subyacente es un transformer de visión estándar con parches de 16×16 y resolución de entrada de 224×224, heredada del modelo base de Google. El repositorio no incluye información sobre el dataset, el número de clases ni el proceso de anotación, lo que limita seriamente su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224×224) |
| Parametros totales | 85.800.963 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada) |
| Idiomas soportados | no disponible (tarea de visión; sin etiquetas de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ViT-Base con parches de 16×16 sobre imágenes de 224×224 píxeles, la misma configuración que `google/vit-base-patch16-224-in21k`. El preentrenamiento original de Google se realizó sobre ImageNet-21k (14 millones de imágenes, ~21.000 clases) y el ajuste fino se ha hecho con el `Trainer` de Hugging Face sobre un dataset no especificado. El checkpoint tiene 85,8 M de parámetros, coherente con la variante base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención).

Los hiperparámetros declarados son: learning rate 2e-4, batch de entrenamiento 16, batch de evaluación 32, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 3 épocas y precisión mixta nativa (AMP). El entorno de entrenamiento fue Transformers 5.22.2, PyTorch 2.14.1+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el tamaño del dataset, la composición de clases ni si hubo aumento de datos, congelación de capas o *early stopping*. Las métricas de evaluación corresponden al paso 0 de la época 0, lo que sugiere que la evaluación se ejecutó al inicio del entrenamiento y no al final; conviene interpretar el resultado con cautela.

## Capacidades

- Clasificación de imágenes en clases cerradas (el número y nombre de clases no está documentado).
- Extracción de características visuales mediante el encoder ViT subyacente, reutilizable para tareas de *transfer learning*.
- Inferencia con la pipeline `image-classification` de Transformers.
- Compatible con *endpoints* de Hugging Face (`endpoints_compatible` en los tags).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas ni audio.
- Capacidades multilingües: no aplica (modelo de visión).
- No dispone de modo *thinking*, visión generativa ni capacidades de agente.

## Casos de uso

- Clasificación de variedades de judías o estados de hojas de planta: dado el nombre del modelo, el uso más plausible es clasificar imágenes de hojas o semillas en categorías predefinidas; requiere confirmar las etiquetas reales antes de usarlo.
- Prototipado rápido de clasificadores de imagen: sirve como punto de partida para experimentar con la pipeline `image-classification` y comparar con el modelo base.
- Extracción de *embeddings* visuales: usar el encoder ViT para alimentar un clasificador ligero posterior (kNN, regresión logística) en lugar de la cabeza fine-tuneada.
- Docencia y demostración de fine-tuning de ViT: el checkpoint y los hiperparámetros permiten reproducir el flujo de entrenamiento con `Trainer` en un entorno docente.
- Baseline interno en pipelines de control de calidad agrícola: como referencia mínima antes de entrenar un modelo propio con más datos y documentación.
- Pruebas de integración con Hugging Face Endpoints: al ser `endpoints_compatible`, permite validar el despliegue serverless de un clasificador de imagen pequeño.
- No se recomienda para producción sin reentrenamiento y validación, dado que la accuracy de evaluación es de 0,3984 y el dataset es desconocido.

## Benchmarks y rendimiento

El autor declara un `model-index` vacío (`results: []`), por lo que no hay benchmarks formales publicados. Las únicas métricas disponibles son las de la model card, obtenidas en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| eval_loss | 1,0848 |
| eval_accuracy | 0,3984 |
| eval_runtime (s) | 1,984 |
| eval_samples_per_second | 64,517 |
| eval_steps_per_second | 2,016 |
| epoch | 0 |
| step | 0 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aplican a un modelo de clasificación de imágenes).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB de pesos (85,8 M × 4 bytes) más activaciones; en la práctica, menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,17 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100). Para entrenamiento, una RTX 3060 o superior con 8 GB es suficiente dado el batch de 16 a 224×224.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con pipeline `image-classification`, Hugging Face Inference Endpoints, TorchServe, ONNX Runtime (previa exportación), Triton Inference Server.
- Latencia y throughput estimados: el autor reporta 64,5 muestras/s y 2,0 pasos/s en evaluación con batch 32, aunque no especifica la GPU empleada; el dato no es extrapolable a otros entornos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dreamonasdasd/vit-beans` | 85,8 M | imagen 224×224 | eval_accuracy 0,3984 (dataset desconocido) | Apache 2.0 | Hugging Face |
| `google/vit-base-patch16-224-in21k` | 85,8 M | imagen 224×224 | preentrenado en ImageNet-21k; métricas no incluidas aquí | Apache 2.0 | Hugging Face |
| `google/vit-base-patch16-224` | 85,8 M | imagen 224×224 | ajustado en ImageNet-1k; métricas no incluidas aquí | Apache 2.0 | Hugging Face |
| `microsoft/resnet-50` | 25,6 M | imagen 224×224 | ajustado en ImageNet-1k; métricas no incluidas aquí | Apache 2.0 | Hugging Face |

La comparación directa con `vit-beans` es difícil porque su dataset de evaluación no está documentado y su accuracy no es comparable con métricas de ImageNet. Frente al modelo base de Google, `vit-beans` aporta un ajuste fino específico cuya calidad no puede verificarse sin acceso al conjunto de datos.

## Limitaciones y advertencias

- Dataset de entrenamiento y evaluación desconocido: la model card indica "unknown dataset", lo que impide evaluar la validez del ajuste fino.
- Accuracy de evaluación baja (0,3984) y medida en el paso 0 de la época 0, no al final del entrenamiento; el resultado no refleja necesariamente el rendimiento final del modelo.
- Número y nombres de clases no documentados: no es posible saber qué etiquetas produce el modelo sin inspeccionar la configuración o el tokenizer.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza; no hay calibración documentada.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden evaluar sesgos demográficos, geográficos o de dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre los datos de entrenamiento.
- Sin garantías de producción: no hay tests, ni versionado semántico, ni informe de evaluación reproducible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Fecha de creación anómala (2026-11-09) en los metadatos de Hugging Face; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dreamonasdasd/vit-beans
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Paper original de ViT (An Image is Worth 16x16 Words): https://arxiv.org/abs/2010.11929
- Documentación de Transformers para clasificación de imágenes: https://huggingface.co/docs/transformers/tasks/image_classification
- Documentación de la pipeline `image-classification`: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.ImageClassificationPipeline
