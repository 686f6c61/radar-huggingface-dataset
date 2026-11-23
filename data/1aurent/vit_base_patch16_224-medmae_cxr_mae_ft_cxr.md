# 1aurent/vit_base_patch16_224.medmae_CXR_mae_ft_CXR

## Resumen

`vit_base_patch16_224.medmae_CXR_mae_ft_CXR` es un modelo de clasificación de imágenes basado en la arquitectura Vision Transformer (ViT-Base) con parches de 16x16 y resolución de entrada de 224x224 píxeles, publicado por el usuario 1aurent en Hugging Face. El modelo se distribuye a través de la librería `timm` y está especializado en el dominio de radiografía de tórax (CXR, *chest X-ray*), como indica su nombre.

El nombre del checkpoint sugiere un pipeline de preentrenamiento con MAE (*Masked Autoencoder*) sobre imágenes médicas de tórax (`medmae_CXR`), seguido de un ajuste fino supervisado también sobre datos de radiografía de tórax (`mae_ft_CXR`). Se trata, por tanto, de un modelo de visión especializado en imagen médica, no de un modelo de lenguaje.

Su relevancia radica en que ejemplifica el uso de técnicas de autoaprendizaje autosupervisado (MAE) adaptadas a dominios médicos, un enfoque habitual para aprovechar grandes volúmenes de radiografías sin etiquetar. La información pública disponible es muy limitada: la model card apenas incluye metadatos y no documenta el dataset de entrenamiento, los resultados de evaluación ni las clases de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224x224) |
| Parametros totales | 85.809.422 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con timm) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tamaño Base: parches de 16x16 sobre imágenes de 224x224 píxeles, con el cómputo de atención global propio de ViT. El recuento de parámetros (85.809.422) es coherente con una cabeza de clasificación sobre un backbone ViT-Base. El modelo se carga mediante `timm`, lo que facilita su integración en pipelines estándar de visión.

Según el nombre del checkpoint, el entrenamiento habría seguido dos fases: un preentrenamiento con Masked Autoencoders (MAE) sobre radiografías de tórax (`medmae_CXR`) y un ajuste fino supervisado posterior sobre el mismo dominio (`mae_ft_CXR`). No se dispone de información sobre el número de imágenes, la composición del dataset, las clases de clasificación ni si se aplicaron técnicas adicionales de aumento de datos o regularización. La model card no aporta detalles técnicos más allá de los metadatos de `timm`.

## Capacidades

- Clasificación de imágenes de radiografía de tórax (la tarea declarada en el pipeline `image-classification`).
- Extracción de características visuales mediante el backbone ViT, reutilizable para otras tareas de visión.
- Integración con `timm` para carga, inferencia y ajuste fino.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multimodales (no procesa texto ni audio).
- El número y la semántica de las clases de salida no están documentados en la información disponible.

## Casos de uso

- Clasificación de radiografías de tórax en investigación: uso del modelo como clasificador base o como punto de partida para experimentos de imagen médica, aprovechando su preentrenamiento en dominio CXR.
- Extracción de embeddings para búsqueda de imágenes médicas: el backbone ViT puede emplearse para generar representaciones vectoriales de radiografías y construir índices de similitud.
- Ajuste fino en tareas downstream: al estar disponible en `timm` y en safetensors, puede servir como inicialización para clasificación de patologías concretas con datasets propios etiquetados.
- Prototipado rápido de pipelines de visión médica: la carga sencilla vía `timm` permite integrarlo en notebooks y scripts de experimentación sin infraestructura adicional.
- Evaluación comparativa de modelos MAE médicos: útil como referencia en estudios que comparen estrategias de preentrenamiento autosupervisado en radiografía de tórax.
- Docencia y demostraciones de ViT en dominio médico: modelo ligero (0,3 GB de repo) adecuado para ejemplos prácticos de clasificación de imágenes con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,4-0,6 GB para los pesos, más el espacio de activaciones según el tamaño de lote.
- VRAM estimada en fp16: aproximadamente 0,2-0,3 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090), así como en CPU para inferencia por lotes pequeños.
- GPU recomendadas para entrenamiento o ajuste fino: RTX 3090/4090, A100 o H100, según el tamaño del dataset y del lote.
- Opciones de despliegue: `timm` con PyTorch, exportación a ONNX o TorchScript; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit_base_patch16_224.medmae_CXR_mae_ft_CXR | 85,8 M | Radiografía de tórax | Imagen 224x224 | Apache 2.0 | Hugging Face (timm) |
| ViT-Base estándar (ImageNet) | ~86 M | Imagen natural | Imagen 224x224 | según checkpoint | Amplia (timm, HF) |
| Otros ViT médicos preentrenados con MAE | no disponible | Imagen médica | Imagen 224x224 | variable | variable |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, las clases de salida ni el procedimiento de evaluación, lo que impide validar su comportamiento clínico.
- No debe utilizarse como herramienta de diagnóstico médico sin una validación externa rigurosa y supervisión profesional.
- Riesgo de sesgo por la composición desconocida de los datos de entrenamiento (posibles desequilibrios demográficos, de equipamiento o de prevalencia de patologías).
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí de falsos positivos y negativos en la clasificación.
- Sin información sobre robustez ante variaciones de adquisición (distintos equipos de rayos X, contrastes, resoluciones).
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de documentación sobre el origen de los datos hace recomendable una revisión legal antes de desplegarlo en producción sanitaria.
- El modelo tiene un uso muy limitado fuera del dominio de radiografía de tórax.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/vit_base_patch16_224.medmae_CXR_mae_ft_CXR
- Librería timm: https://github.com/huggingface/pytorch-image-models
- Paper de referencia de ViT: https://arxiv.org/abs/2010.11929
- Paper de referencia de MAE: https://arxiv.org/abs/2111.06377
