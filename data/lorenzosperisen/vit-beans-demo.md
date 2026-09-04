# lorenzosperisen/vit-beans-demo

# vit-beans-demo

## Resumen

`vit-beans-demo` es un modelo de clasificación de imágenes desarrollado por `lorenzosperisen`. Se trata de un fine-tuning del modelo `google/vit-base-patch16-224-in21k`, un Vision Transformer (ViT) base preentrenado en ImageNet-21k. El modelo ha sido ajustado sobre un dataset no documentado, aunque por el nombre y la existencia de modelos similares en HuggingFace es probable que se trate del dataset `beans` (frijoles). El repositorio se publica bajo licencia Apache 2.0.

El modelo cuenta con 85.800.963 parámetros y un tamaño de repositorio de 1,7 GB. Está pensado como una demostración de transfer learning para clasificación de imágenes, con una precisión declarada de 0,9531 en el conjunto de evaluación. No se dispone de información sobre la composición del dataset de entrenamiento ni sobre las clases que predice, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) base, patch16-224 |
| Parametros totales | 85.800.963 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ViT descrita en "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale". Concretamente, utiliza la variante `base` con parches de 16x16 píxeles y resolución de entrada de 224x224. El modelo base `google/vit-base-patch16-224-in21k` fue preentrenado en ImageNet-21k, un dataset con más de 14 millones de imágenes y 21.843 clases.

El proceso de fine-tuning se realizó con los siguientes hiperparámetros: learning rate de 5e-5, batch size de 16, optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 50 pasos de warmup y 4 épocas. Los resultados de entrenamiento muestran una pérdida de 0,4038 en la primera época y 0,1287 en la cuarta, con una precisión de validación final de 0,9699. No se documenta el dataset utilizado, ni se menciona ningún tipo de alineación por RLHF o DPO, ni innovaciones técnicas adicionales.

## Capacidades

- Clasificación de imágenes: asigna una etiqueta a una imagen de entrada. Según la model card, alcanza una precisión de 0,9531 en el conjunto de evaluación, aunque el dataset no está documentado.
- No soporta generación de texto, razonamiento, tool calling, agentes ni multi-step reasoning.
- No tiene capacidades multilingües, ya que es un modelo de visión y no de lenguaje.
- No se han documentado capacidades especiales como thinking mode, visión o audio.

## Casos de uso

- Control de calidad en agricultura: el modelo podría clasificar imágenes de cultivos para identificar variedades o estados de maduración. Dado que es un ViT ligero de 86M parámetros, puede ejecutarse en dispositivos de borde con GPU integrada.
- Clasificación de semillas o granos: distinguir entre diferentes tipos de semillas en una línea de producción. La inferencia rápida permite su integración en sistemas de visión industrial.
- Detección de plagas o enfermedades en hojas: si el dataset de entrenamiento incluye imágenes de hojas afectadas, el modelo podría servir como herramienta de apoyo en agricultura de precisión.
- Clasificación de productos en una cadena de montaje: separar productos por categorías visuales en tiempo real. Su pequeño tamaño facilita el despliegue en sistemas embebidos.
- Investigación botánica: clasificar especímenes de plantas en un herbario digital. El modelo puede procesar lotes de imágenes en lote sin necesidad de GPU de alta gama.
- Demo educativa de transfer learning: sirve como ejemplo práctico de cómo fine-tunear un ViT preentrenado para una tarea de clasificación con pocos datos. Es útil en cursos de visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El model-index de la model card está vacío. El autor declara los siguientes resultados de evaluación en la model card:

| Metrica | Valor |
|---|---|
| Loss | 0,1555 |
| Accuracy | 0,9531 |

También se proporciona la evolución del entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Accuracy |
|:-------------:|:-----:|:----:|:---------------:|:--------:|
| 0,4038 | 1,0 | 65 | 0,2666 | 0,9549 |
| 0,1600 | 2,0 | 130 | 0,1436 | 0,9624 |
| 0,1076 | 3,0 | 195 | 0,1309 | 0,9699 |
| 0,1287 | 4,0 | 260 | 0,1077 | 0,9699 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (aproximadamente 344 MB para los pesos) y menos de 0,5 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como RTX 3050, GTX 1650 o superiores. También puede ejecutarse en CPU.
- Cabe en consumer GPU de gama baja, incluyendo GPUs integradas de portátiles.
- Opciones de despliegue: Hugging Face Transformers, ONNX Runtime, TorchScript, o mediante APIs compatibles con el ecosistema de Hugging Face.
- Latencia y throughput: no disponible. No se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dataset | Precisión | Licencia |
|---|---|---|---|---|---|
| vit-beans-demo | ViT base | 85.800.963 | no disponible | 0,9531 | Apache 2.0 |
| google/vit-base-patch16-224-in21k | ViT base | 86M | ImageNet-21k | no disponible | Apache 2.0 |
| tritera/vit-base-beans-demo-v5 | ViT base | no disponible | beans | no disponible | no disponible |
| candylion/vit-base-beans-demo-v5 | ViT base | no disponible | beans | no disponible | no disponible |

Los tres primeros modelos comparten arquitectura y propósito, pero solo se dispone de datos completos para `vit-beans-demo`. Los modelos `tritera` y `candylion` aparecen como alternativas similares en HuggingFace, pero no se ha accedido a sus fichas técnicas para obtener parámetros o resultados.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado ("unknown dataset" en la model card), por lo que las clases, la distribución de datos y el dominio de aplicación son desconocidos.
- La precisión declarada (0,9531) proviene únicamente del autor y no ha sido replicada ni verificada externamente.
- No hay benchmarks públicos ni evaluaciones independientes que permitan comparar el rendimiento con otros modelos.
- Existe riesgo de clasificaciones erróneas en imágenes fuera de la distribución de entrenamiento, especialmente en dominios no relacionados con el dataset original.
- No es un modelo de lenguaje, por lo que no soporta tool calling, generación de texto ni razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset puede suponer un riesgo legal o ético si los datos originales tenían restricciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lorenzosperisen/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Modelo similar (tritera): https://huggingface.co/tritera/vit-base-beans-demo-v5
- Modelo similar (candylion): https://huggingface.co/candylion/vit-base-beans-demo-v5
