# sgouet/dog-breeds-multiclass-image-classification-with-vit

## Resumen

Este modelo es un clasificador de imágenes de razas de perro basado en la arquitectura Vision Transformer (ViT). Fue desarrollado por el usuario sgouet (copia del trabajo original de wesleyacheng) y se publica bajo licencia MIT. El modelo resuelve el problema de identificar la raza de un perro a partir de una fotografía, un problema de clasificación multiclase con 120 categorías. Es relevante porque demuestra cómo un ViT pre-entrenado en ImageNet-21k puede ser fine-tuneado en un dataset relativamente pequeño (unas 20.000 imágenes) para obtener una precisión superior al 84% en top-1.

Arquitectura: se basa en el modelo `vit-base-patch16-224-in21k` de Google, un transformer de visión con parches de 16x16 píxeles y resolución de entrada de 224x224. El modelo completo tiene 85.890.936 parámetros y se distribuye en formato safetensors. No se especifica una longitud de contexto (no aplicable a imágenes) ni se documentan cuantizaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base-patch16-224) |
| Parametros totales | 85.890.936 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Vision Transformer (ViT) presentada en el artículo de Google de 2020. La imagen se divide en parches de 16x16 píxeles, que se proyectan linealmente y se tratan como una secuencia de tokens junto con embeddings posicionales. La atención self-attention permite al modelo atender globalmente a todas las regiones de la imagen, a diferencia de las CNN que aplican sesgos inductivos locales. El modelo original fue pre-entrenado en ImageNet-21k (14 millones de imágenes, 21.000 clases) con supervisión, y después se fine-tuneó sobre el dataset Stanford Dogs (20.000 imágenes, 120 razas). El entrenamiento se realizó durante 3 épocas, sin técnicas de RLHF ni DPO, y se utilizó el procesador de imágenes estándar de HuggingFace (`AutoImageProcessor`). No se documentan innovaciones técnicas adicionales más allá del fine-tuning.

## Capacidades

- Clasificación de imágenes de perros en 120 razas diferentes (las incluidas en el Stanford Dogs dataset).
- Inferencia en imágenes de entrada de 224x224 píxeles.
- No soporta tool calling, ni funciones, ni razonamiento multi-paso.
- No es un modelo multimodal de texto, solo visión.
- No tiene capacidades multilingües (es un modelo visual, no lingüístico).
- No dispone de modo de pensamiento o razonamiento explícito, es un clasificador puro.

## Casos de uso

- Aplicaciones de identificación de razas para refugios y protectoras: dado una foto de un perro desconocido, el modelo puede sugerir una raza probable, lo que ayuda a crear fichas de adopción más precisas.
- Control de calidad en criadores profesionales: los criadores pueden verificar que los ejemplares cumplen los estándares de la raza mediante la clasificación automática de sus fotografías.
- Plataformas de seguro de mascotas: integración en aplicaciones móviles para que los usuarios fotografíen su perro y obtengan una estimación de raza, útil para calcular primas o coberturas.
- Gestión de bibliotecas de imágenes en veterinarias: clasificación automática de las fotos de pacientes para organizar expedientes y facilitar búsquedas por raza.
- Herramientas educativas en escuelas o cursos de biología: los estudiantes pueden subir imágenes de perros y recibir información sobre la raza, fomentando el aprendizaje interactivo.
- Aplicaciones de turismo o viajes con mascotas: para identificar razas en parques o espacios públicos, útil para recomendaciones de cuidados específicos según la raza.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas de evaluación sobre el conjunto de test del Stanford Dogs dataset:

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 84.0% |
| Top-3 accuracy | 97.1% |
| Top-5 accuracy | 98.7% |
| Macro F1 | 83.0% |

Estos valores se obtuvieron tras 3 épocas de entrenamiento, donde la precisión top-1 pasó de 79.8% en la primera época a 84.8% en la tercera. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 85.9 millones de parámetros, lo que equivale a unos 0.34 GB en FP32 o 0.17 GB en FP16.
- Puede ejecutarse en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores, ya que el uso de memoria es bajo.
- En una GPU profesional como A100 o RTX 4090, la inferencia es casi instantánea (latencia del orden de milisegundos por imagen).
- Es posible ejecutarlo en CPU, aunque con mayor latencia (varios segundos por imagen).
- Despliegue recomendado con la librería `transformers` de HuggingFace, o mediante ONNX Runtime para optimización.
- No se requiere hardware especializado para el entrenamiento, pero se recomienda una GPU con al menos 8 GB de VRAM para el fine-tuning.

## Comparativa con modelos similares

No se han encontrado comparaciones directas con otros clasificadores de razas de perro en la información disponible. El modelo es un fine-tuning de un ViT-base, y su rendimiento (84% top-1) es comparable al de otros modelos de clasificación de imagen de tamaño similar, pero sin datos de referencia concretos. Como referencia, el modelo `google/vit-base-patch16-224` pre-entrenado en ImageNet-21k alcanza alrededor del 82% de precisión en ImageNet-1k, aunque no es directamente comparable porque el dominio y el número de clases son diferentes. No se dispone de información de modelos alternativos específicos para razas de perro.

## Limitaciones y advertencias

- El modelo solo reconoce las 120 razas del Stanford Dogs dataset; cualquier otra raza o perro mestizo será clasificado erróneamente.
- La precisión depende de la calidad y ángulo de la imagen; imágenes de baja resolución, con oclusiones o con múltiples perros pueden reducir la exactitud.
- No hay información sobre sesgos específicos, pero es probable que el modelo refleje los sesgos del dataset, que puede tener una distribución no uniforme de razas.
- El riesgo de alucinación no aplica en el sentido de texto, pero sí puede producir clasificaciones erróneas con alta confianza.
- Licencia MIT permite uso comercial y modificación, sin embargo, el dataset Stanford Dogs tiene sus propias restricciones de uso que deben respetarse.
- No se han documentado restricciones de contexto o idioma, pero el modelo no es apto para tareas fuera de la clasificación de imágenes de perros.

## Enlaces

- [Modelo en HuggingFace (sgouet)](https://huggingface.co/sgouet/dog-breeds-multiclass-image-classification-with-vit)
- [Modelo original en HuggingFace (wesleyacheng)](https://huggingface.co/wesleyacheng/dog-breeds-multiclass-image-classification-with-vit)
- [Repositorio GitHub de wesleyacheng](https://github.com/wesleyacheng/dog-breeds-multiclass-image-classification-with-vit)
- [Notebook original en Kaggle](https://www.kaggle.com/wesleyacheng/dog-breeds-multiclass-image-classification-w-vit)
- [Dataset Stanford Dogs en Kaggle](https://www.kaggle.com/datasets/jessicali9530/stanford-dogs-dataset)
- [Paper Vision Transformer (arXiv)](https://arxiv.org/pdf/2010.11929v2.pdf)
