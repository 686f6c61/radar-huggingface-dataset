# LaPa47/vit-beans-demo

## Resumen

`vit-beans-demo` es un modelo de clasificación de imágenes desarrollado por LaPa47 mediante fine-tuning del modelo base `google/vit-base-patch16-224-in21k` de Google. Está construido sobre la arquitectura Vision Transformer (ViT) con 85.800.963 parámetros totales, y se presenta como una demostración generada automáticamente con el `Trainer` de Hugging Face. El modelo se publica bajo licencia Apache 2.0 y está disponible en formato `safetensors` y `onnx`.

Se trata de un modelo de clasificación de imágenes de una sola etiqueta, con entrada de 224×224 píxeles. Su relevancia radica en ser un ejemplo práctico de fine-tuning de un ViT preentrenado en ImageNet-21k para una tarea específica, aunque el dataset de entrenamiento no está documentado en la model card. Al carecer de benchmarks oficiales y de una descripción detallada de datos y capacidades, debe considerarse un punto de partida para experimentación, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), base, patch size 16, resolución de entrada 224×224 |
| Parametros totales | 85.800.963 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Vision Transformer (ViT) en su variante base, que divide la imagen en parches de 16×16 píxeles y los procesa como una secuencia de tokens a través de capas de atención. El modelo base `google/vit-base-patch16-224-in21k` fue preentrenado en el dataset ImageNet-21k, y este modelo se ha ajustado mediante fine-tuning en un dataset no especificado en la model card.

Según la información disponible, el entrenamiento se realizó con `learning_rate` de 5e-05, `train_batch_size` de 16, `eval_batch_size` de 16, `num_epochs` de 4, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, y programador de tasa de aprendizaje lineal. No se documentan técnicas como RLHF, DPO ni ninguna innovación arquitectónica; es un fine-tuning estándar de un modelo de visión.

## Capacidades

- Clasificación de imágenes en una única etiqueta por muestra.
- Extracción de características visuales mediante la representación de tokens de ViT.
- Inferencia sobre imágenes de resolución 224×224.
- Compatibilidad con el ecosistema Hugging Face `transformers` y con runtime ONNX.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, lenguaje o visión adicional más allá de clasificación.

## Casos de uso

Dado que el dataset de fine-tuning no está documentado, las siguientes aplicaciones son usos genéricos de un clasificador de imágenes ViT que podrían abordarse con este modelo tras un fine-tuning adecuado en la tarea concreta:

- Control de calidad en manufactura: el modelo podría clasificar imágenes de piezas o componentes para detectar defectos visuales, gracias a la capacidad de atención de ViT sobre regiones de la imagen.
- Clasificación de cultivos agrícolas: tras entrenar con un dataset de hojas o plantas, el modelo podría identificar especies o síntomas de enfermedades, aprovechando el preentrenamiento en ImageNet-21k.
- Diagnóstico médico asistido: con un dataset de imágenes médicas, el modelo podría servir como clasificador de lesiones o anomalías en radiografías o ecografías, dado su tamaño reducido y compatibilidad con GPU modestas.
- Moderación de contenido: el modelo podría clasificar imágenes en categorías como violencia, desnudos o contenido seguro, integrándose en pipelines de moderación automática.
- Organización de bibliotecas de fotos: clasificación automática de imágenes en álbumes temáticos (paisajes, personas, objetos), usando el modelo como clasificador base.
- Reconocimiento de productos en almacenes: identificación de objetos en estanterías para inventario, con despliegue posible en dispositivos edge gracias a los 85M parámetros y el soporte ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la información disponible. La model card incluye únicamente los siguientes resultados declarados por el autor en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss | 0.1461 |
| Accuracy | 0.9688 |

También se registraron durante el entrenamiento los siguientes valores de validación:

| Training Loss | Epoch | Validation Loss | Accuracy |
|:-------------:|:-----:|:---------------:|:--------:|
| 0.2289 | 1.0 | 0.2375 | 0.9248 |
| 0.1371 | 2.0 | 0.1036 | 0.9774 |
| 0.1212 | 3.0 | 0.1393 | 0.9699 |
| 0.1403 | 4.0 | 0.0925 | 0.9774 |

El `model-index` del repositorio contiene un array de resultados vacío, lo que indica que no hay benchmarks comparativos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,17 GB en FP16 y 0,34 GB en FP32, más overhead de activaciones para un batch pequeño, lo que se traduce en un mínimo de 1 GB de VRAM para uso cómodo.
- GPU recomendadas: NVIDIA T4, GTX 1650, RTX 3060 o cualquier GPU con al menos 1-2 GB de VRAM. También puede ejecutarse en CPU.
- Compatible con GPU de consumo: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: Hugging Face `transformers` (PyTorch), ONNX Runtime, Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con modelos de la misma categoría. Los siguientes modelos son referencias de arquitectura o similares en nombre, pero sus datos de rendimiento no están disponibles o no son comparables:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaPa47/vit-beans-demo | 85.800.963 | no aplica | Accuracy 0.9688 (declarado) | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224-in21k | ~86M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| ezzats/vit-beans-demo | no disponible | no aplica | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, por lo que no es posible conocer las clases, la distribución de los datos ni la capacidad de generalización del modelo.
- No se han publicado benchmarks estándar ni comparativas, lo que impide evaluar su rendimiento frente a otros clasificadores de imágenes.
- Al ser un fine-tuning de un modelo preentrenado en ImageNet-21k, el modelo puede heredar sesgos presentes en ese dataset, así como sesgos del dataset de fine-tuning no especificado.
- Riesgo de clasificaciones incorrectas en imágenes fuera de la distribución de entrenamiento, especialmente en dominios muy distintos al de los datos originales.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de información sobre el dataset de fine-tuning introduce incertidumbre sobre posibles restricciones de los datos.
- Se trata de un modelo de demostración, generado automáticamente, y no debe utilizarse en producción sin una evaluación exhaustiva y una documentación completa del proceso de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LaPa47/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Modelo similar (ezzats/vit-beans-demo): https://huggingface.co/ezzats/vit-beans-demo
