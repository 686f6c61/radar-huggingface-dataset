# ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_signed-exp-V

## Resumen

El modelo `ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_signed-exp-V` es un clasificador de imágenes basado en la arquitectura bViT (una variante de Vision Transformer), desarrollado por el usuario `ais0430` como parte de un proyecto de reproducción experimental denominado bViT_circuit. Está entrenado específicamente sobre el subconjunto ImageNet-100 (100 clases de ImageNet) y su propósito es la clasificación de imágenes en ese dominio reducido.

Se trata de un modelo muy pequeño, con 3.059.926 parámetros totales, lo que lo sitúa en la categoría de modelos ligeros aptos para despliegue en hardware modesto o para experimentación rápida. El identificador del modelo codifica sus hiperparámetros de entrenamiento: dimensión de embedding de 462, 6 cabezas de atención, 30 épocas, batch de 128, learning rate de 5e-4, sin EMA y con una variante de inicialización/activación "signed-exp-V".

Es relevante ahora únicamente en el contexto de investigación y reproducción de experimentos con arquitecturas ViT de pequeño tamaño. No cuenta con descargas ni likes en Hugging Face, y la información publicada por el autor es mínima (solo la accuracy de evaluación y un enlace a un run de Weights & Biases alojado en una instancia de CoreWeave). No hay model card detallada, ni licencia declarada, ni datos sobre composición del dataset más allá de la etiqueta `imagenet100`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bViT (variante de Vision Transformer) |
| Parametros totales | 3.059.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clasificación de imágenes, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es bViT, una variante de Vision Transformer según la etiqueta del repositorio. El nombre del modelo codifica los hiperparámetros: dimensión de embedding 462, 6 cabezas de atención, 30 épocas de entrenamiento, batch size 128, learning rate 5e-4, sin EMA (exponential moving average) y una variante de inicialización/activación etiquetada como "signed-exp-V". No se dispone de información detallada sobre el número de capas, el tamaño de parche, la resolución de entrada ni la composición exacta del dataset más allá de `imagenet100`.

El entrenamiento se realizó sobre ImageNet-100, un subconjunto de 100 clases de ImageNet. No hay información sobre si se usaron técnicas de aumento de datos específicas, regularización, RLHF/DPO (no aplicable en clasificación) ni sobre la composición exacta del dataset. El autor remite a la documentación del repositorio `bViT_circuit` para los detalles de diseño, pero esa información no está incluida en la model card.

## Capacidades

- Clasificación de imágenes en 100 clases (ImageNet-100).
- Inferencia de etiqueta única por imagen (clasificación estándar, no multi-etiqueta declarada).
- Compatible con la librería `transformers` y con el pipeline `image-classification`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo).
- No tiene capacidades multilingües ni de texto.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Clasificación rápida de imágenes en dominios restringidos a 100 categorías: el modelo puede usarse como clasificador ligero en pipelines de etiquetado automático cuando las clases coinciden con las de ImageNet-100, con un coste computacional mínimo gracias a sus ~3M de parámetros.
- Experimentación académica con variantes de ViT: sirve como punto de partida para reproducir o comparar configuraciones de bViT (dimensión de embedding, número de cabezas, learning rate) en entornos de investigación con recursos limitados.
- Prototipado en dispositivos de borde: por su tamaño reducido, es viable ejecutarlo en CPU o en GPUs de gama baja para pruebas de concepto de clasificación de imágenes.
- Baseline en benchmarks de clasificación de imágenes: puede emplearse como referencia de bajo coste en comparaciones con modelos ViT más grandes sobre ImageNet-100.
- Educación y docencia: adecuado para demostrar el funcionamiento de un Vision Transformer pequeño en cursos o talleres, dado su reducido tamaño y su integración con `transformers`.
- Filtrado previo en pipelines de visión: como clasificador de primera etapa para descartar o enrutar imágenes antes de modelos más pesados, siempre que las categorías de interés estén cubiertas por ImageNet-100.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| ImageNet-100 (eval accuracy, best) | 0.4172 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparaciones con modelos similares publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,06M de parámetros ≈ 12 MB de pesos en fp32), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100, H100 ni RTX 4090. Una GTX 1050, RTX 3050 o incluso inferencia en CPU son suficientes.
- Cabe en cualquier GPU consumer y en la mayoría de sistemas embebidos.
- Opciones de despliegue: pipeline `image-classification` de `transformers`, endpoints de Hugging Face (tag `endpoints_compatible`), ONNX Runtime tras conversión, o TorchScript. No se ha confirmado soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU moderna y decenas de milisegundos en CPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ais0430/in100_bvit (este modelo) | 3,06M | no aplica | 41,72% acc en ImageNet-100 | no disponible | Hugging Face |
| ViT-base (p.ej. google/vit-base-patch16-224) | ~86M | no aplica | ~no comparable directamente (ImageNet-1k) | Apache 2.0 (habitual) | Hugging Face |
| DeiT-tiny (facebook/deit-tiny-patch16-224) | ~5,7M | no aplica | ~no comparable directamente (ImageNet-1k) | Apache 2.0 (habitual) | Hugging Face |

No se dispone de comparaciones publicadas por el autor ni de resultados de este modelo frente a alternativas en el mismo benchmark (ImageNet-100). Los modelos citados son referencias de la misma familia (ViT de pequeño tamaño) pero entrenados sobre ImageNet-1k, por lo que la comparación directa de accuracy no es válida sin reevaluación.

## Limitaciones y advertencias

- Solo clasifica 100 clases de ImageNet-100; no es un modelo de propósito general ni generativo.
- Accuracy de evaluación del 41,72%, relativamente baja para clasificación de imágenes; puede no ser adecuado para producción sin validación adicional.
- No hay licencia declarada: el uso comercial es incierto y requiere contactar con el autor.
- No hay información sobre sesgos del dataset ni sobre la composición exacta de ImageNet-100 usado.
- Riesgo de alucinación no aplicable (no genera texto), pero sí riesgo de clasificaciones erróneas fuera de distribución.
- Sin model card detallada ni documentación de limitaciones por parte del autor.
- Modelo con 0 descargas y 0 likes: no ha sido validado por la comunidad.
- No hay información sobre cuantizaciones soportadas ni sobre formatos alternativos a safetensors.
- El enlace al run de Weights & Biases apunta a una instancia de CoreWeave (`forge.coreweave.com`) que puede no ser accesible públicamente.

## Enlaces

- Hugging Face: https://huggingface.co/ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_signed-exp-V
- Repositorio del proyecto: https://github.com/otia-0430/bViT_circuit
- Run de Weights & Biases: https://forge.coreweave.com/wandb/aito-paretto-/bvit/runs/n75zdgx9
