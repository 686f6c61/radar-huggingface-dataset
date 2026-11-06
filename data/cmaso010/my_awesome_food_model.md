# cmaso010/my_awesome_food_model

## Resumen

`cmaso010/my_awesome_food_model` es un modelo de clasificación de imágenes obtenido mediante fine-tuning del checkpoint `google/vit-base-patch16-224-in21k` sobre un dataset de alimentos no especificado en la model card. Lo desarrolla el usuario cmaso010 y se publica bajo licencia Apache 2.0, con lo que es utilizable comercialmente sin restricciones adicionales. El modelo resuelve la tarea de clasificación de imágenes de comida en un número de clases no documentado, y su interés práctico radica en que parte de un ViT preentrenado en ImageNet-21k y ofrece un 90,4 % de accuracy sobre su conjunto de evaluación, un dato relevante para tareas de reconocimiento visual de alimentos en entornos de restauración, nutrición o inventario.

El modelo tiene 85.876.325 parámetros (aproximadamente 85,9 M), un tamaño de repositorio de 1,0 GB y pesos en formato safetensors compatibles con la librería Transformers. No se especifican idiomas, composición del dataset, número de clases ni detalles del pipeline de datos, por lo que la mayor parte de la ficha se apoya en las especificaciones heredadas de la arquitectura ViT-Base/16 y en los hiperparámetros de entrenamiento declarados. Con solo 34 descargas y ninguna interacción social, se trata de un modelo de carácter experimental más que de un artefacto listo para producción.

A pesar de la documentación escasa, el modelo resulta relevante como ejemplo de fine-tuning ligero de un ViT-Base sobre una tarea de nicho: tres épocas, batch efectivo de 64, AdamW fused y un scheduler lineal con warmup del 10 %. Es un punto de partida razonable para quien quiera reproducir o adaptar un clasificador de alimentos sin partir de cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224) |
| Parametros totales | 85.876.325 (~85,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo ViT-Base con parches de 16x16 y resolución de entrada de 224x224 píxeles, heredada de `google/vit-base-patch16-224-in21k`. El backbone preentrenado en ImageNet-21k se ha afinado como cabeza de clasificación para un número de clases no documentado. El entrenamiento se realizó con Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, con learning rate 5e-5, batch de entrenamiento 16, acumulación de gradientes de 4 pasos (batch efectivo 64), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con warmup del 10 % y 3 épocas completas (189 pasos de entrenamiento).

No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o aumentación de datos. La model card se generó automáticamente desde el Trainer y deja sin rellenar las secciones de descripción, usos previstos y datos de evaluación. La evolución de la pérdida de validación (2,5407 en la época 1, 1,7753 en la época 2 y 1,6149 en la época 3) sugiere que el modelo aún podría beneficiarse de más épocas o de regularización adicional, ya que la curva sigue descendiendo.

## Capacidades

- Clasificación de imágenes de alimentos en un conjunto de clases no especificado.
- Extracción de características visuales mediante el backbone ViT-Base/16, reutilizable para tareas de visión descendentes.
- Fine-tuning adicional sobre nuevos datasets de imágenes con la librería Transformers.
- Inferencia por imagen individual a través del pipeline `image-classification`.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión generativa ni audio.
- No se documentan capacidades multilingües; al ser un clasificador visual, la noción de idioma no aplica directamente.

## Casos de uso

- Reconocimiento de platos en aplicaciones de restauración: el modelo puede clasificar una fotografía de un plato en la categoría correspondiente para poblar menús digitales o sugerir platos similares, aprovechando el 90,4 % de accuracy declarado sobre su conjunto de evaluación.
- Etiquetado automático de inventario en cocinas profesionales: integrado en un pipeline de captura de imágenes, permite clasificar productos o elaboraciones y actualizar el inventario sin intervención manual.
- Análisis nutricional asistido: como primer paso de un sistema de dietética, el clasificador identifica el alimento y un módulo posterior estima macronutrientes a partir de la categoría detectada.
- Moderación de contenido en plataformas gastronómicas: filtrado de imágenes que no corresponden a alimentos o que pertenecen a categorías no admitidas por la plataforma.
- Preprocesado para búsqueda visual: extracción de embeddings del backbone ViT para indexar imágenes de recetas y permitir búsqueda por similitud en un catálogo.
- Prototipado rápido en investigación: al ser un ViT-Base de 85,9 M parámetros con fine-tuning en tres épocas, sirve como línea base reproducible para comparar estrategias de aumentación o de ajuste fino en clasificación de alimentos.
- Despliegue en dispositivos con recursos limitados: el tamaño reducido del checkpoint (1,0 GB en el repositorio, pesos safetensors) permite ejecución en GPU de gama media y en CPU para lotes pequeños.

## Benchmarks y rendimiento

La model card declara métrica de accuracy, pero el `model-index` no contiene resultados (`results: []`). Los únicos datos disponibles son los de la tabla de entrenamiento del Trainer:

| Epoca | Paso | Perdida de validacion | Accuracy |
|---|---|---|---|
| 1.0 | 63 | 2,5407 | 0,845 |
| 2.0 | 126 | 1,7753 | 0,893 |
| 3.0 | 189 | 1,6149 | 0,904 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de visión como ImageNet) en la información disponible. Los valores anteriores corresponden exclusivamente al conjunto de evaluación del propio autor y no son comparables con terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 350 MB de pesos más activaciones; un lote pequeño cabe holgadamente en 2 GB de VRAM.
- VRAM estimada en fp16: aproximadamente 175 MB de pesos, con margen para activaciones en GPUs de 4 GB o superiores.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento se recomienda al menos 8-12 GB de VRAM con batch 16 y acumulación de gradientes.
- Cabe en GPU consumer: sí, en modelos tan modestos como una GTX 1650 de 4 GB para inferencia.
- Opciones de despliegue: pipeline `image-classification` de Transformers, exportación a ONNX Runtime, TorchScript y servidores de inferencia compatibles con Hugging Face Endpoints (el tag `endpoints_compatible` está presente).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cmaso010/my_awesome_food_model | 85,9 M | 224x224 px | Clasificación de alimentos | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224-in21k | 85,8 M | 224x224 px | Clasificación genérica (ImageNet-21k) | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224 | 86,6 M | 224x224 px | Clasificación ImageNet-1k | Apache 2.0 | Hugging Face |

La comparación con los checkpoints originales de Google es la más directa, dado que el modelo deriva de ellos. No se dispone de datos de rendimiento comparables para otros clasificadores específicos de alimentos en la información proporcionada.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado: se desconoce el número de clases, la distribución de las mismas, el origen de las imágenes y las posibles licencias de estas.
- Riesgo de sobreajuste al dominio del dataset: la accuracy del 90,4 % corresponde al conjunto de evaluación del autor y no garantiza generalización a imágenes reales con iluminación, encuadre o calidad distintas.
- Sesgos potenciales derivados de la composición del dataset (por ejemplo, predominio de cocinas o regiones concretas), imposibles de evaluar sin información sobre los datos.
- La pérdida de validación seguía descendiendo en la época 3, lo que sugiere que el modelo no está completamente convergido y que el rendimiento podría mejorar con más entrenamiento.
- No se documentan limitaciones de idioma ni de contexto; al ser un clasificador visual, estas categorías no aplican, pero tampoco se especifican las etiquetas de salida.
- La licencia Apache 2.0 permite uso comercial, pero la licencia del dataset subyacente no está declarada y podría imponer restricciones adicionales.
- La model card es una plantilla autogenerada con secciones sin completar; no debe considerarse documentación fiable para producción.
- Modelo con 34 descargas y sin validación por parte de la comunidad: no hay evidencia externa de su comportamiento fuera del conjunto de evaluación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cmaso010/my_awesome_food_model
- Perfil del autor: https://huggingface.co/cmaso010/models
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Seguimiento del entrenamiento (Trackio): https://huggingface.co/spaces/cmaso010/huggingface-static-43c151
