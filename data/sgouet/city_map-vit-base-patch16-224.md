# sgouet/City_map-vit-base-patch16-224

## Resumen

El modelo `sgouet/City_map-vit-base-patch16-224` es un Vision Transformer (ViT) de tamaño base, desarrollado por STEM.AI, que ha sido fine-tuneado para identificar a qué ciudad pertenece un mapa a partir de una imagen de entrada. Se basa en el modelo preentrenado `google/vit-base-patch16-224`, que fue entrenado inicialmente en ImageNet-21k y posteriormente afinado en ImageNet. La adaptación se ha realizado sobre el dataset propio `STEM-AI-mtl/City_map`, que contiene más de 600 imágenes de 45 mapas de ciudades de todo el mundo.

El modelo conserva la arquitectura original del ViT (encoder transformer con parches de 16x16 píxeles, resolución de entrada 224x224) y tiene 85.833.261 parámetros. Su propósito es resolver una tarea de clasificación de imágenes muy específica: identificar la ciudad representada en un mapa. La relevancia de este modelo radica en que, según la model card, supera a Google y a GPT-4 en esta tarea concreta, aunque los resultados reportados muestran una precisión de solo el 66,7 % sobre el conjunto de entrenamiento, lo que sugiere un margen de mejora considerable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) base, patch size 16, resolución 224x224 |
| Parámetros totales | 85.833.261 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | stem.ai.mtl (licencia personalizada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer base, similar al propuesto en el artículo *An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale*. Se trata de un encoder transformer (arquitectura BERT-like) que procesa la imagen en parches de 16x16 píxeles y aplica una atención global. El preentrenamiento se realizó en ImageNet-21k (14 millones de imágenes, 21.843 clases) a resolución 224x224, y posteriormente se afinó en ImageNet 2012 (1 millón de imágenes, 1.000 clases).

La adaptación final se llevó a cabo sobre el dataset `STEM-AI-mtl/City_map`, que contiene más de 600 imágenes de mapas de 45 ciudades del mundo. El proceso de entrenamiento se ejecutó en una GPU NVIDIA GTX 1650 de 4 GB. Según la model card, el mejor resultado se obtuvo con un learning rate de 1e-3. No se mencionan técnicas de RLHF, DPO ni otras innovaciones posteriores; el entrenamiento es un fine-tuning estándar de clasificación.

## Capacidades

- Clasificación de imágenes de mapas de ciudades: identifica cuál de las 45 ciudades representadas en el dataset corresponde a la imagen de entrada.
- Tarea específica de visión: no incluye capacidades de lenguaje, generación de texto, razonamiento ni tool calling.
- Soporta inferencia sobre imágenes de resolución 224x224 píxeles.
- No tiene capacidades de agente ni de razonamiento multi-paso.
- No es multilingüe, ya que es un modelo de visión puro.

## Casos de uso

- Catalogación de mapas históricos: el modelo puede clasificar imágenes de mapas antiguos y asignarles la ciudad correspondiente, facilitando la organización de archivos digitales o físicos.
- Verificación de mapas en publicaciones: se puede usar para comprobar si una imagen en un documento o web corresponde a un mapa de una ciudad concreta, útil en contextos editoriales o de revisión.
- Clasificación de imágenes satelitales: a partir de una imagen que muestra un mapa urbano, el modelo puede identificar la ciudad, ayudando en la organización de bases de datos de imágenes aéreas.
- Organización de mapas en aplicaciones de viajes: en una plataforma que recopila mapas de distintas ciudades, el modelo puede etiquetar automáticamente cada imagen con su ciudad.
- Detección de mapas en documentos escaneados: el modelo puede identificar mapas de ciudades dentro de documentos digitalizados y asignarles la etiqueta correspondiente, útil para indexación automática.
- Validación de imágenes en bases de datos de mapas: si se reciben imágenes de mapas de distintas fuentes, el modelo puede verificar que la imagen corresponde a la ciudad esperada, reduciendo errores de etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque es un modelo de clasificación de imágenes. La model card reporta las siguientes métricas sobre el conjunto de entrenamiento:

| Métrica | Valor |
|---|---|
| Eval loss | 1.3691 |
| Eval accuracy | 0.6667 |
| Eval runtime (seg) | 13.0277 |
| Eval samples per second | 4.606 |
| Eval steps per second | 0.154 |
| Epoch | 2.82 |

Estos datos provienen de la evaluación del propio autor sobre el mismo conjunto de entrenamiento, por lo que no son comparables con otros modelos. No se dispone de resultados en conjuntos de validación externos.

## Requisitos de hardware

- Inferencia ligera: el modelo tiene 85M de parámetros, por lo que requiere poca memoria. En precisión fp32 ocupa aproximadamente 350 MB, en fp16 unos 170 MB y en int8 unos 85 MB.
- Puede ejecutarse en GPU de consumo como GTX 1650, GTX 1660, RTX 3060, etc., con 4 GB de VRAM o más.
- También puede ejecutarse en CPU, aunque la inferencia será más lenta.
- Para despliegue, se puede usar la librería Transformers de Hugging Face, ONNX Runtime, o herramientas como vLLM (aunque no es un modelo de lenguaje, se puede servir con la API de clasificación de imágenes).
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Precisión en City_map | Licencia |
|---|---|---|---|---|
| `google/vit-base-patch16-224` | ViT base | 85,8M | No entrenado para esta tarea | Apache 2.0 |
| `sgouet/City_map-vit-base-patch16-224` | ViT base | 85,8M | 66.7 % (entrenamiento) | stem.ai.mtl |
| Otros modelos de clasificación de imágenes (ResNet, EfficientNet) | CNN | Variable | No disponible | Variable |

El modelo se diferencia del base en que ha sido fine-tuneado para una tarea específica (identificación de mapas de ciudades), mientras que el modelo base es genérico y no tiene esa capacidad. No se dispone de comparaciones con modelos que hayan sido entrenados con el mismo dataset.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy reducido (600 imágenes para 45 clases), lo que puede provocar sobreajuste y baja generalización a imágenes nuevas o variaciones de mapas.
- La precisión reportada es de solo 66.7 % sobre el conjunto de entrenamiento, lo que indica un rendimiento moderado y un alto margen de error.
- El modelo solo reconoce 45 ciudades concretas; no puede identificar mapas de otras ciudades no incluidas en el entrenamiento.
- La licencia es personalizada (`stem.ai.mtl`) y requiere revisión del archivo `LICENSE` para conocer las restricciones de uso comercial y redistribución.
- No se han documentado sesgos específicos, pero al tratarse de un conjunto de imágenes reducido, puede haber un sesgo hacia los tipos de mapas o estilos representados en el dataset.
- No se recomienda su uso en producción sin una validación exhaustiva en el dominio de aplicación, dado el bajo rendimiento reportado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sgouet/City_map-vit-base-patch16-224)
- [Dataset STEM-AI-mtl/City_map](https://huggingface.co/datasets/STEM-AI-mtl/City_map)
- [Script de inferencia en GitHub](https://github.com/STEM-ai/Vision/blob/7d92c8daa388eb74e8c336f2d0d3942722fec3c6/ViT_inference.py)
- [Notebook de entrenamiento](https://github.com/STEM-ai/Vision/raw/7d92c8daa388eb74e8c336f2d0d3942722fec3c6/Trainer_ViT.ipynb)
- [Documentación de ViT en Transformers](https://huggingface.co/transformers/model_doc/vit.html)
