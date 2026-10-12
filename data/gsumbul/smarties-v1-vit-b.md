# gsumbul/SMARTIES-v1-ViT-B

## Resumen

SMARTIES (Spectrum-Aware Multi-Sensor Auto-Encoder for Remote Sensing Images) es un modelo fundacional de visión para observación de la Tierra, desarrollado por Gencer Sumbul, Chang Xu, Emanuele Dalsasso y Devis Tuia con el apoyo de la Agencia Espacial Europea (ESA). Se trata de un transformer de visión de tipo ViT-B con 116.511.232 parámetros, entrenado como autoencoder enmascarado que proyecta datos de sensores heterogéneos (ópticos como Sentinel-2, radar como Sentinel-1 y RGB submétrico como Maxar) a un espacio común consciente del espectro.

El problema que resuelve es la fragmentación de los modelos fundacionales de teledetección, habitualmente ligados a un único sensor o a combinaciones fijas de bandas. SMARTIES abstrae el sensor y admite combinaciones arbitrarias de bandas tanto en entrenamiento como en inferencia, lo que facilita la transferencia a sensores no vistos en modo zero-shot.

Es relevante ahora porque la monitorización densa del planeta exige combinar las fortalezas complementarias de los sensores ópticos y de radar, y porque su diseño ligero lo hace desplegable en flujos de extracción de características y de ajuste fino. Se publica bajo licencia Apache 2.0 y sus pesos están en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer base (ViT-B) como autoencoder enmascarado, con proyecciones conscientes del espectro por rango de longitud de onda |
| Parametros totales | 116.511.232 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SMARTIES es un transformer de visión (ViT-B) que funciona como autoencoder enmascarado: reconstruye datos multisensor enmascarados y emplea cross-sensor token mixup para obtener representaciones agnósticas al sensor. La innovación principal es la proyección consciente del espectro: para un sensor dado, cada una de sus bandas se proyecta mediante capas de proyección específicas por rango de longitud de onda, de modo que un único modelo unificado acepta sensores y combinaciones de bandas diversas.

El preentrenamiento se realizó sobre datos de teledetección de múltiples sensores, entre ellos Sentinel-2 (óptico), Sentinel-1 (radar) e imágenes RGB submétricas (Maxar). No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del conjunto de datos ni si se emplearon fases de RLHF o DPO (no aplicables, por otra parte, a un codificador de características visuales).

## Capacidades

- Extracción de características de imágenes de teledetección (pipeline image-feature-extraction).
- Procesamiento agnóstico al sensor: representaciones compartidas para sensores ópticos, radar y RGB.
- Manejo de combinaciones arbitrarias de bandas espectrales procedentes de distintos sensores.
- Generalización zero-shot a sensores no vistos durante el entrenamiento.
- Transferencia a tareas posteriores de clasificación de escenas, segmentación semántica y clasificación multi-etiqueta con un único modelo.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta texto multilingüe, audio ni entradas conversacionales: es un modelo estrictamente visual.

## Casos de uso

- Clasificación de escenas en imágenes Sentinel-2: extraer embeddings del modelo y entrenar un clasificador ligero encima para etiquetar cobertura del suelo o tipos de cultivo, aprovechando que el modelo ya captura rasgos espectrales y espaciales.
- Segmentación semántica de cobertura del suelo: usar las características del encoder como columna vertebral de una cabeza de segmentación para delimitar agua, vegetación, suelo urbano o superficies artificiales.
- Clasificación multi-etiqueta de escenas remotas: asignar varias etiquetas simultáneas a una misma imagen (por ejemplo, presencia de vegetación y de infraestructura) gracias a representaciones ricas en información multiespectral.
- Fusión de sensores óptico y radar: combinar bandas de Sentinel-1 y Sentinel-2 en una misma pasada para monitorización continua, útil en regiones con nubosidad frecuente donde el óptico no basta.
- Transferencia zero-shot a nuevos sensores: aplicar el modelo a sensores no vistos en entrenamiento (por ejemplo, proveedores comerciales submétricos) sin reentrenar, como punto de partida para ajuste fino con pocas etiquetas.
- Búsqueda por similitud sobre archivos de imágenes: generar embeddings para indexar grandes catálogos de imágenes de satélite y recuperar escenas visualmente o semánticamente similares mediante vecinos más cercanos.
- Monitorización de cambios y series temporales: comparar embeddings de una misma zona en fechas distintas para detectar deforestación, crecimiento urbano o variaciones en masas de agua.
- Preentrenamiento base para ajuste fino con etiquetas escasas: usar los pesos como inicialización de tareas de teledetección donde el etiquetado es costoso, aprovechando el preentrenamiento multisensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los datos de la ficha de HuggingFace no incluyen cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes de teledetección (por ejemplo, exactitud de clasificación o mIoU de segmentación).

## Requisitos de hardware

- Huella de los pesos: aproximadamente 466 MB en FP32, 233 MB en FP16/BF16 y 117 MB en INT8.
- Cabe en cualquier GPU de consumo: RTX 3060 (12 GB), RTX 4070, RTX 4090 (24 GB) y superiores; también es viable la inferencia en CPU por su tamaño reducido.
- Recomendado para producción a gran escala: A100, H100 o L40S si se procesan lotes grandes o volúmenes elevados de imágenes.
- Despliegue de referencia mediante transformers con trust_remote_code=True. Se puede exportar a ONNX o TensorRT para optimizar latencia y throughput.
- vLLM y TGI están orientados a generación de texto y no son aplicables a este codificador de características; para servir el modelo conviene usar Triton Inference Server o un servidor PyTorch a medida.
- No se documentan cifras de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Sensores | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SMARTIES-v1-ViT-B | ViT-B autoencoder enmascarado, consciente del espectro | Sentinel-1, Sentinel-2, RGB submétrico y sensores no vistos | 116,5 M | no disponible | Apache 2.0 | HuggingFace |
| CROMA | ViT multimodal para teledetección | Sentinel-1 y Sentinel-2 | no disponible | no disponible | no disponible | no disponible |
| Prithvi-100M | ViT (autoencoder enmascarado temporal) | Sentinel-2 (óptico) | ~100 M (según su denominación) | no disponible | no disponible | HuggingFace (IBM/NASA) |

La diferencia cualitativa principal es que SMARTIES abstrae el sensor y admite combinaciones arbitrarias de bandas, mientras que las alternativas citadas están vinculadas a combinaciones fijas de sensores. No se dispone de cifras comparativas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Modelo puramente visual: no genera texto, no procesa lenguaje natural y no dispone de capacidades conversacionales ni de tool calling.
- No hay resultados de benchmarks publicados en la información disponible, por lo que las afirmaciones de rendimiento no pueden validarse de forma independiente con esta ficha.
- El número de tokens de preentrenamiento y la composición exacta del conjunto de datos no están documentados.
- La generalización zero-shot a sensores no vistos la afirma el autor y no está respaldada por evaluaciones públicas incluidas en esta ficha.
- Posible sesgo hacia los sensores empleados en el preentrenamiento (Sentinel-1, Sentinel-2 y RGB submétrico); el comportamiento en otras distribuciones es incierto.
- Requiere trust_remote_code=True y lleva la etiqueta custom_code: conviene auditar el código remoto antes de ejecutarlo en producción.
- La longitud de contexto o la configuración de parche y tamaño de imagen no está documentada; es probable que haya que consultar el repositorio de GitHub para conocerla.
- Licencia Apache 2.0, que permite uso comercial, pero se debe mantener la atribución y citar el paper según lo indicado por los autores.
- Adopción muy baja (19 descargas y 2 likes a fecha de la ficha): la validación por parte de la comunidad es limitada.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de representaciones poco fiables fuera de la distribución de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/gsumbul/SMARTIES-v1-ViT-B
- Colección en HuggingFace: https://huggingface.co/collections/gsumbul/smarties-685888bb5ecded3f802cc945
- Paper (arXiv): https://arxiv.org/abs/2506.19585
- Página web del proyecto: https://gsumbul.github.io/SMARTIES/
- Repositorio GitHub: https://github.com/gsumbul/SMARTIES
- Notebook de uso: https://github.com/gsumbul/SMARTIES/blob/main/SMARTIES_huggingface.ipynb
