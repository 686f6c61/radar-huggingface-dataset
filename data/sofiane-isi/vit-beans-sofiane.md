# sofiane-isi/vit-beans-sofiane

## Resumen

El modelo `sofiane-isi/vit-beans-sofiane` es un Vision Transformer (ViT) fine-tuned para clasificación de enfermedades en hojas de frijol. Ha sido desarrollado por el usuario `sofiane-isi` sobre el modelo base `google/vit-base-patch16-224-in21k`, y entrenado con el dataset `AI-Lab-Makerere/beans`. El problema que resuelve es la clasificación automática de imágenes de hojas de frijol en tres categorías: `angular_leaf_spot`, `bean_rust` y `healthy`.

Se trata de un modelo educativo, orientado a demostrar un flujo de trabajo MLOps completo: preprocesamiento de datos, fine-tuning, evaluación, publicación en Hugging Face Hub y posterior despliegue en un Space. Su arquitectura es un ViT-base con parches de 16x16 píxeles y resolución de entrada de 224x224, con aproximadamente 85,8 millones de parámetros. Al ser un modelo de visión, no tiene longitud de contexto en el sentido de los modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base-patch16-224) |
| Parametros totales | 85.800.963 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/vit-base-patch16-224-in21k`, un Vision Transformer preentrenado en ImageNet-21k. El fine-tuning se realiza sobre el dataset `AI-Lab-Makerere/beans`, compuesto por imágenes de hojas de frijol etiquetadas en tres clases: `angular_leaf_spot`, `bean_rust` y `healthy`. No se especifica el número de imágenes ni la composición exacta del dataset en la información proporcionada.

El proceso de entrenamiento descrito en la model card sigue un flujo estándar: dataset → preprocesamiento → fine-tuning → evaluación → publicación en Hugging Face Hub → Model Card → Space. No se mencionan técnicas de alineación como RLHF o DPO, ni innovaciones arquitectónicas destacables: se trata de un fine-tuning convencional de un ViT preentrenado para una tarea de clasificación de imágenes.

## Capacidades

- Clasificación de imágenes de hojas de frijol en tres clases: `angular_leaf_spot`, `bean_rust` y `healthy`.
- Inferencia de imagen única (single-image classification) mediante el pipeline `image-classification` de Transformers.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No tiene capacidades multilingües (al ser un modelo de visión, el concepto de idioma no aplica).
- No dispone de modo de pensamiento, visión adicional, audio ni generación de texto.

## Casos de uso

- Agricultura de precisión: el modelo puede integrarse en una aplicación móvil o web que reciba fotografías de hojas de frijol tomadas en campo y devuelva la enfermedad detectada. Es adecuado por su naturaleza ligera y su entrenamiento específico en el dataset Beans.
- Investigación académica: sirve como referencia para estudiar el efecto del fine-tuning de ViT en datasets pequeños y dominios agrícolas. Puede utilizarse para comparar estrategias de preprocesamiento o aumentación de datos.
- Educación en machine learning: es un ejemplo práctico de pipeline MLOps completo, desde la carga del dataset hasta la publicación del modelo y su presentación en un Space, útil para cursos y tutoriales.
- Prototipos de sistemas de apoyo a la decisión: combinado con reglas de negocio, el modelo puede alimentar un sistema que recomiende tratamientos fitosanitarios según la enfermedad detectada.
- Validación de flujos de MLOps: permite probar herramientas de entrenamiento, evaluación y despliegue (como Hugging Face Hub, endpoints compatibles y Spaces) en un caso de uso realista.
- Benchmarking de arquitecturas de visión: puede emplearse como baseline para comparar el rendimiento de otros modelos de clasificación de imágenes sobre el dataset Beans.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy | 0.96875 |
| Evaluation loss | 0.12236211448907852 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 y 0,15 GB en FP16, dado el tamaño de los pesos (85,8 millones de parámetros).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo NVIDIA RTX 3060, RTX 4090 o A100. También es viable la ejecución en CPU para inferencia de baja frecuencia.
- Compatibilidad con GPU de consumo: sí, el modelo es suficientemente pequeño para ejecutarse en GPUs de gama media.
- Opciones de despliegue: se puede servir con la librería `transformers` en un entorno Python, mediante ONNX Runtime, TorchScript, o a través de Gradio/FastAPI para crear una API REST. También es compatible con el endpoint de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. El modelo base `google/vit-base-patch16-224-in21k` comparte la misma arquitectura y número de parámetros, pero no se han publicado resultados de evaluación sobre el dataset Beans en la documentación consultada. Por tanto, la comparativa con alternativas de la misma categoría se considera no disponible.

## Limitaciones y advertencias

- Modelo educativo fine-tuned específicamente sobre el dataset Beans, por lo que su capacidad de generalización a otras plantas, enfermedades o condiciones de captura es limitada.
- Riesgo de alucinación en clasificación: puede producir falsos positivos o falsos negativos, especialmente en imágenes con iluminación o ángulos fuera de la distribución de entrenamiento.
- La licencia no está disponible, lo que puede suponer una restricción para su uso comercial o su redistribución.
- No se han documentado sesgos específicos, pero el dataset puede contener sesgos de captura (por ejemplo, condiciones de campo particulares) que afecten al rendimiento en otros entornos.
- No es apto para producción sin una validación externa adicional y sin conocer los términos de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/sofiane-isi/vit-beans-sofiane
- Model aibase: https://model.aibase.com/models/details/1915735726798561281
