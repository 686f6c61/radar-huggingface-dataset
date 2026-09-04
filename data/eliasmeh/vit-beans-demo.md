# EliasMeh/vit-beans-demo

## Resumen

El modelo `EliasMeh/vit-beans-demo` es un clasificador de imágenes basado en un Vision Transformer (ViT), obtenido mediante fine-tuning del modelo `google/vit-base-patch16-224-in21k`. El autor, `EliasMeh`, lo publicó en HuggingFace bajo licencia Apache 2.0, con el pipeline `image-classification` y etiquetas de `vit` e `image-classification`. Según la model card, se trata de un ajuste fino sobre un dataset no especificado, aunque la convención de nombres y la existencia de modelos similares apuntan al dataset `beans` (clasificación de enfermedades en hojas de frijol). El modelo tiene 85.800.963 parámetros totales y un tamaño de repositorio de 1,7 GB, con pesos en formato `safetensors`.

El modelo es relevante para tareas de clasificación de imágenes en entornos agrícolas o educativos, especialmente cuando se necesita un modelo compacto, fácil de fine-tunear y compatible con la librería `transformers`. Su arquitectura ViT-base con parches de 16 y resolución de entrada 224 permite una inferencia eficiente en GPUs de consumo e incluso en CPU. La ficha técnica está incompleta (el autor indica "More information needed"), por lo que algunos datos como el dataset de entrenamiento, los idiomas o las cuantizaciones no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base, parches de 16, resolución de entrada 224x224 |
| Parametros totales | 85.800.963 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica a modelos de visión por computador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/vit-base-patch16-224-in21k`, un Vision Transformer preentrenado en ImageNet-21k. La arquitectura ViT divide la imagen de entrada en parches de 16x16 píxeles y los procesa mediante capas de atención, sin necesidad de convoluciones. Al tratarse de un modelo de clasificación de imágenes, no existe una ventana de contexto textual ni un tokenizador de lenguaje.

El proceso de entrenamiento, descrito en la model card, se realizó con los siguientes hiperparámetros: learning rate de 5e-05, tamaño de batch de 16, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 4 épocas. Se utilizaron las librerías Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. El autor no especifica el dataset de entrenamiento ni el número de clases, aunque por el nombre del modelo y la existencia de otros fine-tunes similares sobre el dataset `beans`, es plausible que se trate de esa tarea.

## Capacidades

- Clasificación de imágenes: el modelo asigna una etiqueta de clase a una imagen de entrada. El número exacto de clases no está documentado.
- Extracción de características: al ser un ViT, puede utilizarse como backbone para otras tareas de visión por computador, como detección de objetos o segmentación.
- Fine-tuning: es compatible con la librería `transformers`, lo que permite ajustarlo adicionalmente en otros datasets de imágenes.
- Inferencia eficiente: su tamaño de 85,8 millones de parámetros permite ejecutarlo en GPU de consumo o incluso en CPU con tiempos de respuesta razonables.
- Integración con HuggingFace: soporta el pipeline `image-classification` y los Inference Endpoints de HuggingFace.
- No soporta generación de texto, tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje natural, ya que es un modelo exclusivamente de visión.

## Casos de uso

- Control de calidad agrícola: puede clasificar imágenes de hojas de frijol para detectar enfermedades, integrándose en una aplicación móvil o en un sistema de captura de imágenes en campo. Su tamaño compacto lo hace apto para dispositivos con recursos limitados.
- Investigación en visión por computador: sirve como referencia para estudiar el fine-tuning de ViT en datasets pequeños, ya que parte de un modelo preentrenado en ImageNet-21k y permite reproducir resultados con pocas épocas.
- Prototipado rápido en agricultura de precisión: permite validar un pipeline de clasificación de imágenes con datos agrícolas antes de invertir en modelos más grandes o en infraestructura más costosa.
- Aplicaciones educativas en machine learning: al ser un modelo pequeño, con licencia Apache 2.0 y documentación accesible, es adecuado para enseñar el proceso de fine-tuning de transformers en visión por computador.
- Integración en sistemas de apoyo a la decisión: un sistema que analice imágenes de cultivos y recomiende acciones agronómicas podría usar este modelo como componente de clasificación.
- Benchmark interno de clasificación: empresas o laboratorios que necesiten comparar diferentes arquitecturas de visión pueden usar este modelo como baseline, gracias a su disponibilidad en HuggingFace y su formato `safetensors`.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación, sin especificar el nombre del dataset:

| Metrica | Valor |
|---|---|
| Loss | 0.1289 |
| Accuracy | 0.9688 |

Además, la model card incluye la evolución del entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Accuracy |
|:-------------:|:-----:|:----:|:---------------:|:--------:|
| 0.2649 | 1.0 | 65 | 0.1591 | 0.9850 |
| 0.1242 | 2.0 | 130 | 0.1315 | 0.9699 |
| 0.0909 | 3.0 | 195 | 0.1440 | 0.9549 |
| 0.1309 | 4.0 | 260 | 0.0954 | 0.9699 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de clasificación de imágenes y no de lenguaje. El `model-index` en la model card está vacío, por lo que no existe una comparativa oficial con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp32, los pesos ocupan aproximadamente 343 MB; en fp16, unos 172 MB; en int8, unos 86 MB. Añadiendo el overhead de la librería y las activaciones, se recomienda al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM, como una NVIDIA GTX 1050, RTX 3050, RTX 4060 o superior. También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPUs de consumo: sí, es un modelo ligero que funciona en tarjetas gráficas de gama baja.
- Opciones de despliegue: se puede usar directamente con la librería `transformers` mediante el pipeline `image-classification`, desplegar en HuggingFace Inference Endpoints, exportar a ONNX para producción con ONNX Runtime, o servir a través de TorchServe o una API FastAPI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/vit-base-patch16-224-in21k | 86M (aprox.) | No aplica | No disponible | Apache 2.0 | HuggingFace |
| EliasMeh/vit-beans-demo | 85.800.963 | No aplica | Accuracy 0.9688 (declarada) | Apache 2.0 | HuggingFace |
| eitankon/vit-base-beans-demo-v5 | No disponible | No aplica | No disponible | Apache 2.0 | HuggingFace |
| SH0827/vit-base-beans-demo-v5 | No disponible | No aplica | No disponible | No disponible | HuggingFace |

Los modelos `eitankon/vit-base-beans-demo-v5` y `SH0827/vit-base-beans-demo-v5` son fine-tunes similares del mismo modelo base sobre el dataset `beans`, pero no se dispone de datos de rendimiento ni de parámetros exactos en la información de la búsqueda web.

## Limitaciones y advertencias

- El autor no especifica el dataset de entrenamiento ni el número de clases, por lo que se desconocen el dominio exacto y la distribución de las imágenes.
- La model card está incompleta, con secciones como "Model description" e "Intended uses & limitations" marcadas como "More information needed".
- Los resultados de evaluación (accuracy 0.9688, loss 0.1289) provienen de un único conjunto de validación y no demuestran generalización en datos externos.
- Al ser un modelo de visión, no procesa texto ni lenguaje natural, por lo que no debe utilizarse en tareas de generación de texto, razonamiento o tool calling.
- El modelo puede presentar sesgos si el dataset de entrenamiento no cubre todas las variedades, condiciones de iluminación o estados de las plantas. No se ha realizado una evaluación de sesgos.
- La licencia Apache 2.0 permite el uso comercial, pero la responsabilidad sobre el comportamiento del modelo recae en el usuario final, especialmente si se despliega en producción.
- No hay información sobre cuantizaciones disponibles, por lo que el rendimiento en dispositivos edge no está verificado.
- Al estar entrenado sobre un dataset no especificado, el modelo puede fallar en imágenes fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EliasMeh/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Fine-tune similar: https://huggingface.co/eitankon/vit-base-beans-demo-v5
- Fine-tune similar: https://huggingface.co/SH0827/vit-base-beans-demo-v5
