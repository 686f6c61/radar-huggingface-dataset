# DM-Diaz/SimCLR-ResNet18-ImageNet1K

## Resumen

El modelo `DM-Diaz/SimCLR-ResNet18-ImageNet1K` es un checkpoint de representaciones visuales entrenado con la técnica de aprendizaje autosupervisado SimCLR sobre una arquitectura ResNet-18. Fue desarrollado por D. M. Diaz y M. M. Henderson como modelo de referencia no egocéntrico para el estudio _Eccentricity-Constrained CNN Training Reveals Adaptive Information Coding Around the Visual Field_, presentado en la 9.ª Conferencia de Cognitive Computational Neuroscience (CCN 2026). El modelo se entrenó sobre el dataset ImageNet-1K (versión redimensionada a 256 píxeles) utilizando el framework Lightly, y sirve como punto de comparación para evaluar representaciones aprendidas a partir de experiencia visual egocéntrica naturalista.

Su relevancia radica en que proporciona un encoder visual estándar, preentrenado de forma contrastiva, que puede utilizarse como base para tareas de clasificación, extracción de características o fine-tuning en visión por computadora. Al ser un ResNet-18, es un modelo ligero y adecuado para entornos con recursos limitados. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (backbone de SimCLR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ResNet-18 como encoder, entrenada con el marco de aprendizaje contrastivo SimCLR. SimCLR aprende representaciones visuales maximizando la similitud entre vistas aumentadas de la misma imagen y minimizándola entre imágenes distintas, sin necesidad de etiquetas. El entrenamiento se realizó con el framework Lightly sobre el dataset `evanarlian/imagenet_1k_resized_256`, que contiene las imágenes de ImageNet-1K redimensionadas a 256×256 píxeles. No se dispone de información sobre el número exacto de épocas, tamaño de batch, aumentos utilizados ni configuración de la proyección no lineal. Tampoco se indica si se aplicó fine-tuning posterior o algún paso de ajuste supervisado. El modelo se publica como checkpoint de referencia para comparar representaciones egocéntricas frente a no egocéntricas en el estudio de neurociencia mencionado.

## Capacidades

- Extracción de características visuales: el encoder produce representaciones densas de imágenes que pueden usarse para tareas downstream como clasificación, detección o segmentación.
- Transfer learning: permite fine-tuning sobre datasets más pequeños, aprovechando el preentrenamiento en ImageNet-1K.
- Aprendizaje autosupervisado: al estar entrenado con SimCLR, las representaciones capturan invariancias a aumentos (recortes, color, rotaciones) sin necesidad de etiquetas.
- Investigación en neurociencia computacional: sirve como modelo de referencia no egocéntrico para estudiar cómo se codifica la información visual en función de la excentricidad del campo visual.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un modelo de visión.

## Casos de uso

- Clasificación de imágenes con fine-tuning: se puede partir de este checkpoint y ajustar la última capa para clasificar un dataset específico (por ejemplo, imágenes médicas o industriales) con pocos datos etiquetados, gracias a las representaciones generales aprendidas en ImageNet-1K.
- Extracción de embeddings para búsqueda visual: usar el encoder para convertir imágenes en vectores de características y construir sistemas de búsqueda por similitud (por ejemplo, en catálogos de productos o archivos fotográficos).
- Preentrenamiento para detección de objetos: el backbone ResNet-18 puede integrarse en arquitecturas como Faster R-CNN o YOLO y fine-tuning para detectar objetos en dominios específicos.
- Evaluación de representaciones en estudios de neurociencia: investigadores pueden comparar las activaciones de este modelo con datos de fMRI o EEG para analizar cómo se organiza la información visual en el cerebro, tal como se hizo en el estudio original.
- Prototipado rápido en visión por computadora: al ser un modelo pequeño (0.1 GB), es adecuado para experimentos en entornos con recursos limitados, como notebooks o GPUs de gama media.
- Generación de aumentos de datos: las representaciones aprendidas pueden usarse para generar pseudo-etiquetas o para entrenar modelos generativos condicionados a características visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como checkpoint de investigación sin métricas comparativas (por ejemplo, top-1 accuracy en ImageNet, o resultados en tareas de transferencia). No se dispone de datos sobre rendimiento en tareas estándar.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni GPU en la información del modelo.
- Dado el tamaño del repositorio (0.1 GB) y la arquitectura ResNet-18, se espera que sea ejecutable en GPUs de consumo (por ejemplo, RTX 3060 o superiores) con memoria suficiente para el batch size elegido, pero no hay datos oficiales.
- Para inferencia, se puede cargar con PyTorch estándar; no se mencionan formatos optimizados como ONNX, TensorRT o GGUF.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, FastAPI o integrarse en pipelines de visión. No se indica compatibilidad con vLLM, llama.cpp u Ollama, que son específicos para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de representación visual (por ejemplo, SimCLR con ResNet-50, MoCo, BYOL o DINO). No se han publicado comparaciones en la model card ni en la información proporcionada. Por tanto, no se puede establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- El modelo se entrenó únicamente con imágenes de ImageNet-1K, por lo que puede presentar sesgos hacia las categorías y estilos visuales de ese dataset (por ejemplo, dominio naturalista, objetos comunes). No se ha evaluado su comportamiento en dominios muy diferentes (imágenes médicas, satelitales, etc.).
- Al ser un modelo de representación, no genera texto ni respuestas; cualquier uso que requiera lenguaje debe combinarse con un modelo de lenguaje.
- No se han documentado riesgos de alucinación (no aplica a visión), pero sí puede producir representaciones poco discriminativas en clases no representadas en ImageNet.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se publica con fines de investigación; no se garantiza su idoneidad para producción sin validación adicional.
- No se especifican detalles de entrenamiento (épocas, batch, aumentos), lo que dificulta la reproducibilidad exacta.
- El checkpoint está pensado como referencia para un estudio concreto; su uso fuera de ese contexto requiere evaluación propia.

## Enlaces

- [HuggingFace: DM-Diaz/SimCLR-ResNet18-ImageNet1K](https://huggingface.co/DM-Diaz/SimCLR-ResNet18-ImageNet1K)
- [Dataset: evanarlian/imagenet_1k_resized_256](https://huggingface.co/datasets/evanarlian/imagenet_1k_resized_256)
- [arXiv: 2607.19316](https://arxiv.org/abs/2607.19316) (no verificado, según la model card)
- [DOI: 10.32470/0416gfsq](https://doi.org/10.32470/0416gfsq) (según la model card)
- [Presentación en CCN 2026 (YouTube)](https://www.youtube.com/watch?v=Lb4S3FWqd2M&t=2545s)
