# microsoft/colipri

## Resumen

COLIPRI es un modelo transformer de visión-lenguaje 3D desarrollado por Microsoft Health Futures. Está diseñado para codificar tomografías computarizadas (CT) de tórax y los reportes radiológicos asociados, aprendiendo representaciones conjuntas de imágenes tridimensionales y texto. El modelo se entrenó con decenas de miles de pares de CT y reportes sin anotaciones manuales, utilizando múltiples objetivos de preentrenamiento. La versión publicada, COLIPRI-CRM, es la de mejor rendimiento según el manuscrito. El modelo cuenta con 258 millones de parámetros y se distribuye bajo licencia MIT. Su relevancia radica en habilitar tareas de clasificación zero-shot, recuperación multimodal y segmentación en el dominio médico 3D, reduciendo la dependencia de datos anotados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión-lenguaje 3D (encoder) |
| Parametros totales | 258.367.104 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

COLIPRI es un encoder de visión-lenguaje 3D basado en transformer. A diferencia de modelos CLIP 2D, procesa volúmenes CT completos en lugar de imágenes planas. El preprocesamiento reescala los volúmenes a 192×192×192 vóxeles con un espaciado de 2 mm. El modelo genera embeddings de parches de dimensión 768 y embeddings globales de 768, que pueden utilizarse para tareas posteriores.

El preentrenamiento se realizó sin anotaciones, utilizando decenas de miles de pares de CT de tórax y reportes radiológicos en inglés. Se emplearon múltiples objetivos para aprender representaciones conjuntas fuertes, aunque la model card no detalla los objetivos exactos. El entrenamiento se llevó a cabo en 4 GPUs NVIDIA A100 de 80 GB durante 72 horas (288 GPU-horas) en Azure, con una emisión estimada de 21,6 kg de CO₂ eq. Se utilizaron librerías como nnSSL, TorchIO y nnU-Net.

## Capacidades

- Clasificación zero-shot de imágenes médicas 3D mediante prompts de texto. Por ejemplo, puede distinguir entre "Nódulos pulmonares presentes" y "No presentes" sin necesidad de ejemplos etiquetados.
- Extracción de características: produce embeddings de parches de forma `[1, 768, 24, 24, 24]` y embeddings globales de `[1, 768]` para un volumen de entrada de 192³ vóxeles.
- Recuperación multimodal: texto-imagen, imagen-imagen, imagen-texto y texto-texto.
- Agrupamiento (clustering) de imágenes y de texto para descubrir patrones en colecciones de estudios.
- Clasificación con un clasificador entrenado encima de los embeddings, sin necesidad de fine-tuning del encoder.
- Segmentación de estructuras anatómicas acoplando un decoder a los embeddings de parches.
- Generación de reportes radiológicos con un decoder de lenguaje sobre los embeddings.

## Casos de uso

- Detección de nódulos pulmonares: el modelo puede clasificar un CT completo como "Nódulos pulmonares presentes" o "No presentes" mediante prompts, lo que permite cribado rápido sin anotaciones.
- Recuperación de casos similares: usando los embeddings de imagen, se pueden buscar CTs parecidos a un caso dado en una base de datos hospitalaria, facilitando la revisión de historiales clínicos.
- Búsqueda de reportes por texto: dada una descripción clínica, el modelo recupera reportes radiológicos relevantes (text-to-text retrieval) o imágenes correspondientes (text-to-image retrieval), útil para investigación y docencia.
- Segmentación automática: acoplando un decoder a los embeddings de parches, se puede segmentar pulmones, lesiones u otras estructuras en CT, reduciendo el tiempo de delineación manual.
- Generación de borradores de informes: un decoder de lenguaje sobre el encoder puede producir borradores de reportes a partir del CT, que luego el radiólogo revisa y corrige.
- Clasificación de hallazgos con clasificador lineal: los embeddings globales alimentan un clasificador para patologías específicas, permitiendo entrenar cabezas ligeras sin reentrenar el modelo base.
- Agrupamiento de estudios para análisis poblacional: agrupar CTs o reportes por similitud para detectar subgrupos de pacientes o patrones de enfermedad en cohortes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El peso del modelo en safetensors es de 1.0 GB, lo que sugiere que en FP32 ocupa aproximadamente 1 GB, pero el procesamiento de volúmenes 3D de 192³ vóxeles puede requerir más memoria.
- GPU recomendadas: no disponible. El entrenamiento se realizó en NVIDIA A100 de 80 GB.
- ¿Cabe en consumer GPU? No disponible; por tamaño de pesos podría caber en GPUs de consumo, pero no hay datos confirmados.
- Opciones de despliegue: mediante la librería `colipri` en Python, con soporte para GPU (`.cuda()`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivo para investigación: el modelo no está destinado a la práctica clínica.
- Sesgo poblacional: fue entrenado con datos de Turquía y Estados Unidos, por lo que puede presentar sesgos hacia esas poblaciones.
- Sesgos subyacentes de los datasets de entrenamiento no caracterizados.
- Soporte de idioma limitado a inglés.
- No se especifica la longitud de contexto ni límites de tamaño de imagen.
- Riesgo de alucinación en generación de texto si se usa con un decoder de lenguaje, no evaluado en la información disponible.
- La licencia MIT permite uso comercial, pero el modelo no está validado clínicamente.

## Enlaces

- HuggingFace: https://huggingface.co/microsoft/colipri
- Artículo en arXiv: https://arxiv.org/abs/2510.15042
