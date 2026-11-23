# 1aurent/vit_giant_patch14_224.dinobloom

## Resumen

DinoBloom es un modelo de visión por computador especializado en la generación de embeddings de células para hematología. Se trata de un Vision Transformer (ViT) de arquitectura "giant" con 1.136 millones de parámetros, parche de 14x14 píxeles y resolución de entrada de 224x224, entrenado mediante self-supervised learning con el objetivo DINOv2 sobre imágenes de frotis de sangre periférica. Lo desarrolla el grupo MarrLab (Valentin Koch, Sophia J. Wagner, Carsten Marr y colaboradores) y se publicó junto al artículo arXiv 2404.05022 en abril de 2024.

El modelo resuelve el problema de obtener representaciones generalizables de células sanguíneas sin necesidad de anotaciones, algo crítico en hematología donde el etiquetado experto es caro y escaso. En lugar de entrenar un clasificador específico para cada tarea (conteo diferencial, detección de blastos, subtipado de leucemias), DinoBloom produce un vector de características que puede reutilizarse como backbone con ajuste fino ligero o incluso en modo zero-shot mediante similitud.

Este repositorio concreto (`1aurent/vit_giant_patch14_224.dinobloom`) es una conversión de los pesos originales al formato `timm`, lo que permite cargarlo con una sola línea mediante `timm.create_model("hf-hub:...")`. Es relevante para desarrolladores porque integra un modelo de dominio médico especializado en el ecosistema estándar de `timm`, facilitando su uso en pipelines de investigación sin dependencias exóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) giant, patch 14x14, resolución 224x224 |
| Parametros totales | 1.134.769.664 (1,13 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224x3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas en el repo) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 4,5 GB) |
| Libreria | timm |
| Pipeline | feature-extraction, image-classification |
| Dimensionalidad de salida | 1.408 features (estándar ViT-g/14) |
| Preprocesado | transformaciones resueltas vía `timm.data.resolve_model_data_config` |

## Arquitectura y entrenamiento

DinoBloom emplea un Vision Transformer de escala "giant" con parches de 14x14 píxeles sobre imágenes de 224x224, siguiendo la receta de DINOv2 (self-supervised learning con destilación de un teacher EMA, pérdida DINO más pérdida iBOT y regularización KoLeo). El entrenamiento se realizó sobre un corpus de imágenes de frotis de sangre periférica de hematología, aunque la model card no detalla el número exacto de imágenes, la composición del dataset ni si hubo etapas de ajuste supervisado posteriores.

La innovación principal no está en la arquitectura (que es un ViT estándar) sino en el dominio: aplicar el paradigma de foundation model auto-supervisado a imágenes de células sanguíneas, donde los modelos genéricos como DINOv2 o CLIP tienen un rendimiento subóptimo por la diferencia de distribución visual. El resultado es un backbone cuyos embeddings capturan morfología celular de forma genérica, sirviendo para múltiples tareas downstream. No se documentan en la información disponible innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de embeddings de imagen de 1.408 dimensiones para imágenes de frotis sanguíneo (una imagen → un vector).
- Clasificación de imágenes mediante cabezas lineales o ajuste fino ligero sobre los embeddings congelados.
- Búsqueda por similitud y clustering no supervisado de células (útil para descubrir subpoblaciones morfológicas).
- Aprendizaje por transferencia a tareas de hematología: conteo diferencial, detección de anomalías, subtipado de leucocitos.
- Funciona como backbone en pipelines de `timm`, compatible con el resto del ecosistema (PyTorch, torchvision transforms).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un extractor de características visuales.
- No soporta visión generalista (escenas, objetos cotidianos) de forma fiable; está especializado en microscopía hematológica.

## Casos de uso

- **Conteo diferencial automatizado de leucocitos**: usar los embeddings congelados de DinoBloom como entrada a un clasificador lineal (regresión logística o MLP ligero) entrenado con pocas muestras etiquetadas por hematólogos. La calidad del backbone reduce la necesidad de anotaciones masivas.
- **Detección de blastos y cribado de leucemia**: ajustar una cabeza de clasificación binaria sobre los embeddings para separar células normales de blastos en frotis periféricos, como paso previo a la revisión manual del especialista.
- **Clustering y descubrimiento de subpoblaciones celulares**: aplicar k-means o UMAP sobre los vectores de 1.408 dimensiones para agrupar células morfológicamente similares sin etiquetas, útil en investigación exploratoria.
- **Búsqueda por similitud en bases de imágenes hematológicas**: indexar un repositorio de imágenes de frotis con embeddings DinoBloom y recuperar las células visualmente más parecidas a una consulta, para control de calidad o docencia.
- **Preentrenamiento para modelos de segmentación o detección**: inicializar un U-Net o un detector de células con el backbone DinoBloom congelado o parcialmente descongelado, aprovechando que ya captura morfología celular.
- **Control de calidad de frotis**: detectar imágenes fuera de distribución (artefactos, mala tinción, desenfoque) comparando la distancia de sus embeddings frente a la distribución de referencia de un lote validado.
- **Investigación en morfología hematológica**: generar representaciones cuantitativas de células para estudios de correlación con variables clínicas o genómicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas comparativas de accuracy, F1 ni métricas de recuperación frente a otros backbones (DINOv2, ResNet, otros modelos hematológicos). Para cifras de rendimiento conviene consultar el artículo arXiv 2404.05022 y el repositorio oficial `MarrLab/DinoBloom`, que no forman parte de la información proporcionada en esta ficha.

## Requisitos de hardware

- **VRAM en fp32**: aproximadamente 4,5 GB solo para pesos, más activaciones; en la práctica se necesitan 6–8 GB para un batch pequeño en GPU.
- **VRAM en fp16/bf16**: alrededor de 2,3 GB para pesos; 4–6 GB con activaciones para batches de 8–16 imágenes a 224x224.
- **GPU recomendadas**: A100, H100 o L40S para inferencia por lotes a gran escala; RTX 4090, RTX 3090 o RTX A6000 para investigación individual.
- **GPU de consumo**: cabe en GPUs consumer con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) en fp16 con batch pequeño; en CPU es viable pero lento para volúmenes grandes.
- **Opciones de despliegue**: `timm` + PyTorch (recomendado y documentado), exportación a ONNX o TorchScript para servir con Triton u ONNX Runtime, y `torch.compile` para acelerar. No hay variantes GGUF/Ollama publicadas en el repo.
- **Latencia y throughput**: no disponible en la información proporcionada; dependerá fuertemente de la GPU y del tamaño de batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DinoBloom ViT-g/14 (este repo) | 1,13 B | 224x224 | Hematología (frotis) | Apache 2.0 | Hugging Face (`1aurent/...`), Zenodo, GitHub MarrLab |
| DINOv2 ViT-g/14 | ~1,1 B | 224x224 | Imágenes naturales genéricas | Apache 2.0 (variantes) | Hugging Face, Meta |
| DinoBloom original (`MarrLab/DinoBloom`) | 1,13 B | 224x224 | Hematología | Apache 2.0 | Hugging Face (repo oficial) |
| CLIP ViT-L/14 | ~428 M | 224x224 | Imagen-texto genérico | MIT (variantes OpenAI) | Hugging Face, OpenAI |

La comparación clave es frente a DINOv2: misma arquitectura y tamaño, pero DinoBloom está especializado en morfología celular y debería superar a DINOv2 en tareas de hematología, aunque no hay cifras públicas en la información disponible para confirmarlo. Frente al repo oficial `MarrLab/DinoBloom`, este de `1aurent` es una conversión a `timm` con los mismos pesos.

## Limitaciones y advertencias

- **Dominio estrecho**: entrenado para frotis de sangre periférica; su rendimiento en otras modalidades (histología de tejidos, radiología, imágenes naturales) no está validado y probablemente sea inferior a un modelo genérico.
- **Riesgo de alucinación no aplica** en el sentido generativo (no produce texto), pero sí existe riesgo de embeddings poco fiables en imágenes fuera de distribución (artefactos, mala tinción, resoluciones distintas a 224x224).
- **Sesgos de dataset**: la composición del corpus de entrenamiento no está documentada en detalle; posibles sesgos por fabricante de escáner, protocolo de tinción, población de pacientes o institución pueden degradar el rendimiento en dominios distintos.
- **Sin métricas publicadas en este repo**: la model card no aporta benchmarks, por lo que la evaluación previa a producción es responsabilidad del usuario.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene revisar las condiciones del dataset original y del repo oficial `MarrLab/DinoBloom` antes de desplegar en entornos clínicos regulados.
- **No es un dispositivo médico**: no está certificado como herramienta de diagnóstico; cualquier uso clínico requiere validación regulatoria independiente.
- **Dependencia de `timm`**: la carga vía `timm.create_model("hf-hub:...")` requiere una versión de `timm` compatible con el formato del repo; versiones muy antiguas pueden fallar.
- **Idioma**: no aplica, pero la documentación y la model card están en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/vit_giant_patch14_224.dinobloom
- Repositorio oficial: https://github.com/marrlab/DinoBloom
- Pesos originales (Zenodo): https://zenodo.org/records/10908163
- Artículo (arXiv): https://arxiv.org/abs/2404.05022
- Repo oficial en Hugging Face: https://huggingface.co/MarrLab/DinoBloom
- Licencia Apache 2.0: https://github.com/marrlab/DinoBloom/blob/main/LICENSE
