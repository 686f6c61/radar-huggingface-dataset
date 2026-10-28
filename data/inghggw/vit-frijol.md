# inghggw/vit-frijol

## Resumen

El modelo `inghggw/vit-frijol` es un clasificador de imágenes basado en Vision Transformer (ViT), fine-tuneado a partir de `google/vit-base-patch16-224-in21k` para detectar tres clases de hojas de fríjol: sana, mancha angular y roya. Lo desarrolla Henry Giovanny González Waltero, instructor del SENA, como ejemplo resuelto de la semana 3 del curso "Iniciación a la Inteligencia Artificial" para ADSO (2026). El modelo resuelve una tarea acotada de clasificación de imágenes agrícolas y sirve como demostración práctica de transfer learning con arquitecturas transformer en visión.

La relevancia del modelo es fundamentalmente educativa: muestra cómo adaptar un ViT preentrenado en ImageNet-21k a un dataset pequeño y específico (1.295 imágenes) con un coste computacional muy bajo (56 segundos en una GPU T4 gratuita de Colab). No está pensado para producción agrícola real, sino como material didáctico y como punto de partida para experimentos de clasificación de imágenes.

Arquitectónicamente es un ViT-base con parches de 16x16 y resolución de entrada de 224x224 píxeles, con 85.800.963 parámetros totales. La licencia Apache 2.0 permite uso comercial, pero la model card advierte explícitamente de que no debe usarse para decidir tratamientos ni con cultivos o enfermedades distintas de las tres clases aprendidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base, patch16, 224x224) |
| Parámetros totales | 85.800.963 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen de 224x224 píxeles) |
| Tipos de cuantización | no disponible (el autor no especifica cuantizaciones; se puede aplicar cuantización estándar de PyTorch) |
| Idiomas soportados | es (declarado en la model card; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Dataset de entrenamiento | AI-Lab-Makerere/beans (1.295 imágenes, 3 clases) |
| Modelo base | google/vit-base-patch16-224-in21k |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer estándar de la familia ViT-base. La imagen de entrada se divide en parches de 16x16 píxeles (196 parches para 224x224), que se proyectan linealmente y se procesan mediante capas de autoatención. El modelo base `google/vit-base-patch16-224-in21k` fue preentrenado en ImageNet-21k, y sobre él se realizó un fine-tune supervisado para las tres clases del dataset de fríjol.

El entrenamiento se llevó a cabo durante 3 épocas, con una tasa de aprendizaje de 2e-4 y lotes de 16 imágenes, sobre una GPU T4 gratuita de Google Colab, con un tiempo aproximado de 56 segundos. El dataset `AI-Lab-Makerere/beans` contiene 1.295 fotos de hojas tomadas en campo en Uganda, divididas en 1.034 para entrenamiento, 133 para validación y 128 para prueba. No se emplearon técnicas de RLHF ni DPO; es un fine-tune supervisado convencional con transfer learning. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de imágenes de hojas de fríjol en tres clases: sana (`healthy`), mancha angular (`angular_leaf_spot`) y roya (`bean_rust`).
- Salida de una única etiqueta entre las tres clases, con probabilidades asociadas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de procesamiento de texto; el campo `language: es` es una declaración administrativa del autor.
- No genera texto, código, matemáticas ni visión general más allá de la clasificación de las tres clases.
- No incorpora modo "thinking", audio ni otras modalidades.

## Casos de uso

- **Demostración educativa de transfer learning**: el modelo se usa en el curso del SENA para mostrar cómo partir de un ViT preentrenado y adaptarlo a un dataset pequeño. Es adecuado por su bajo coste de entrenamiento (56 segundos en T4) y su código reproducible en el repositorio del curso.
- **Prototipo de apoyo al diagnóstico preliminar en campo**: una aplicación móvil podría capturar una foto de una hoja de fríjol y obtener una clasificación orientativa entre las tres clases. Sirve como primera señal para que el agricultor consulte a un agrónomo, nunca como decisión definitiva.
- **Filtrado y priorización de imágenes en un pipeline agrícola**: en un conjunto grande de fotos de cultivos, el modelo puede separar las imágenes con posible roya o mancha angular para que un experto las revise primero. Es útil por su rapidez de inferencia y su licencia permisiva.
- **Etiquetado asistido de nuevos datasets**: el modelo puede pre-anotar imágenes de fríjol con las tres clases, reduciendo el trabajo manual de etiquetado. Es adecuado porque ya ha aprendido patrones visuales de las tres enfermedades en el dataset de Uganda.
- **Línea base para investigación en visión artificial agrícola**: investigadores pueden usar este modelo como punto de partida para comparar nuevas técnicas de fine-tune, data augmentation o arquitecturas alternativas sobre el mismo dataset.
- **Ejemplo de despliegue de un ViT en HuggingFace**: el repositorio sirve como plantilla para publicar modelos de clasificación de imágenes con safetensors, model card y licencia Apache 2.0. Es útil para desarrolladores que quieran replicar el flujo completo.
- **Monitorización de cultivos con revisión humana**: integrado en un sistema de alertas, el modelo puede marcar hojas sospechosas y generar una cola de revisión para técnicos agrícolas. Su uso está limitado a las tres clases y a condiciones visuales similares a las del dataset original.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Exactitud en validación (época 3) | 99,2 % |
| Exactitud en prueba (imágenes no vistas) | 97,7 % |
| Épocas de entrenamiento | 3 |
| Tasa de aprendizaje | 2e-4 |
| Tamaño de lote | 16 |
| Tiempo de entrenamiento | ~56 segundos en GPU T4 |
| MMLU, HumanEval, GSM8K | no aplica (modelo de clasificación de imágenes) |

No se han publicado resultados de benchmarks adicionales en la información disponible. Los únicos datos de rendimiento son la exactitud en validación y prueba sobre el dataset `AI-Lab-Makerere/beans`.

## Requisitos de hardware

- **VRAM estimada para inferencia (solo pesos)**: en fp32, aproximadamente 0,34 GB (85,8 M de parámetros × 4 bytes); en fp16, aproximadamente 0,17 GB; en int8, aproximadamente 0,09 GB. Hay que sumar el espacio para activaciones y el lote de imágenes, aunque en un modelo de este tamaño es marginal.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo en fp32. Funciona en GPUs de consumo como GTX 1050, GTX 1650, RTX 2060, RTX 3060, RTX 4090, así como en GPUs de centro de datos (T4, A100, H100).
- **¿Cabe en GPU de consumo?**: sí, cabe holgadamente en cualquier GPU de consumo moderna, e incluso en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: PyTorch con `transformers` (clase `ViTForImageClassification`), ONNX Runtime, TorchScript, HuggingFace Inference API y despliegue en contenedores. No se documentan integraciones con vLLM, llama.cpp u Ollama, que están orientadas a modelos de lenguaje.
- **Latencia y throughput**: no se han publicado datos de latencia de inferencia. El entrenamiento en T4 tomó unos 56 segundos para 3 épocas, lo que sugiere una inferencia del orden de milisegundos por imagen en GPU, pero no se dispone de una medición oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Entrada | Rendimiento en este dataset |
|---|---|---|---|---|---|
| `inghggw/vit-frijol` | 85,8 M | ViT fine-tuneado | Apache 2.0 | Imagen 224x224 | 97,7 % exactitud en prueba |
| `google/vit-base-patch16-224-in21k` | 85,8 M | ViT preentrenado | Apache 2.0 | Imagen 224x224 | no evaluado en beans (no disponible) |
| ResNet-50 | 25,6 M | CNN | no disponible en la información | Imagen 224x224 | no disponible |
| EfficientNet-B0 | 5,3 M | CNN | no disponible en la información | Imagen 224x224 | no disponible |

La comparativa se limita a arquitecturas de clasificación de imágenes de tamaño similar o inferior. No se dispone de resultados de benchmarks de ResNet-50 o EfficientNet-B0 sobre el dataset `AI-Lab-Makerere/beans` en la información proporcionada, por lo que no es posible comparar rendimiento de forma rigurosa. El modelo base `google/vit-base-patch16-224-in21k` tiene los mismos parámetros y licencia, pero está preentrenado en ImageNet-21k y no ha sido fine-tuneado para las tres clases de fríjol.

## Limitaciones y advertencias

- **Sesgo geográfico y de captura**: el dataset contiene fotos de un solo país (Uganda) y de un tipo de cámara. El modelo puede fallar con otras condiciones de luz, fondo, distancia o variedades de fríjol distintas.
- **Falsos positivos fuera de dominio**: si la imagen no es de una hoja de fríjol, el modelo igualmente responde una de las tres clases. No incorpora una clase "desconocido" ni un mecanismo de rechazo.
- **Alcance muy limitado**: solo conoce tres clases (sana, mancha angular y roya). No detecta otras enfermedades, plagas ni cultivos.
- **Riesgo de alucinación en sentido amplio**: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas con alta confianza en imágenes atípicas. No debe usarse para decidir tratamientos agrícolas.
- **No reemplaza al agrónomo**: la model card indica explícitamente que no sustituye el diagnóstico de un experto.
- **Licencia Apache 2.0**: permite uso comercial, modificación y redistribución, pero el autor no ofrece garantías. Cualquier uso en producción debe acompañarse de validación adicional y de una revisión humana.
- **Idioma declarado sin efecto práctico**: el campo `language: es` no implica capacidades de procesamiento de lenguaje natural; el modelo solo procesa imágenes.
- **Dataset pequeño**: 1.295 imágenes y 3 épocas de entrenamiento. Aunque la exactitud en prueba es alta (97,7 %), la varianza estadística con solo 128 imágenes de prueba es considerable.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/inghggw/vit-frijol)
- [Repositorio del curso en GitHub](https://github.com/inghggw/iniciacion-ia-adso)
- [Dataset AI-Lab-Makerere/beans en HuggingFace](https://huggingface.co/datasets/AI-Lab-Makerere/beans)
- [Modelo base google/vit-base-patch16-224-in21k](https://huggingface.co/google/vit-base-patch16-224-in21k)
- [Roboflow: Frijol Detection API (modelo alternativo de detección de fríjol)](https://universe.roboflow.com/trabajogrado-vo3x4/frijol/model/1)
- [GeeksforGeeks: Vision Transformer (ViT) Architecture](https://www.geeksforgeeks.org/deep-learning/vision-transformer-vit-architecture/)
- [ZDNET: The best open-source AI models](https://www.zdnet.com/article/the-best-open-source-ai-models-all-your-free-to-use-options-explained/)
