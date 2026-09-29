# RichardsonI/convnext-tiny-finetuned-eurosat

## Resumen

El modelo `RichardsonI/convnext-tiny-finetuned-eurosat` es un clasificador de imágenes basado en la arquitectura ConvNeXT en su variante "tiny", ajustado (fine-tuning) sobre el conjunto de datos EuroSAT, que contiene imágenes de satélite Sentinel-2 etiquetadas por tipo de cobertura del suelo. Se distribuye a través de Hugging Face con la librería `transformers` y el pipeline `image-classification`, y su repositorio ocupa 0,1 GB con 27.827.818 parámetros en formato `safetensors`.

El interés de este tipo de modelo radica en que ConvNeXT demuestra que una red convolucional pura, con decisiones de diseño tomadas del mundo de los Vision Transformers, puede igualar o superar a los transformers de visión en tareas de clasificación sin necesidad de mecanismos de atención. Con menos de 28 millones de parámetros, es un candidato claro para despliegue en entornos con recursos limitados, incluida inferencia en CPU y en dispositivos de borde.

La model card publicada por el autor es la plantilla automática de Hugging Face y no contiene información específica sobre el proceso de entrenamiento, hiperparámetros, licencia o datos de evaluación. Esto limita seriamente la trazabilidad del modelo: todos los detalles de ajuste se marcan como "no disponible" en esta ficha. Existen versiones equivalentes y ampliamente replicadas de este mismo ajuste publicadas por otros autores (`nielsr`, `mrm8488`), que sirven como referencia de comportamiento esperado aunque no son el mismo artefacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXT (red convolucional pura con diseño inspirado en Vision Transformer) |
| Parametros totales | 27.827.818 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada de imagen cuadrada, presumiblemente 224x224 px |
| Tipos de cuantizacion | no documentados por el autor; el tamaño del modelo permite cuantizacion a int8 y fp16 con herramientas genericas |
| Idiomas soportados | no disponible (no procesa texto, solo imagenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Etiquetas del Hub | transformers, safetensors, convnext, image-classification, endpoints_compatible |
| Pipeline | image-classification |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ConvNeXT es una familia de redes convolucionales presentada en el paper "A ConvNeXt for the 2020s" (Liu et al., 2022). Moderniza la CNN clásica incorporando elementos propios de los Vision Transformers: convoluciones depthwise de 7x7, normalización por capas (LayerNorm) en lugar de BatchNorm, activación GELU, bloques de cuello de botella invertido (inverted bottleneck) y una proporción de etapas de 3:3:9:3 en la variante tiny. El resultado es un modelo denso de aproximadamente 28 millones de parámetros con una entrada estándar de 224x224 píxeles, que compite directamente con ViT-Base y Swin-Tiny en ImageNet.

El ajuste sobre EuroSAT parte de los pesos preentrenados de `facebook/convnext-tiny-224` y reemplaza la cabeza de clasificación por una de 10 salidas, correspondientes a las clases de cobertura del suelo de EuroSAT: AnnualCrop, Forest, HerbaceousVegetation, Highway, Industrial, Pasture, PermanentCrop, Residential, River y SeaLake. Este dato sobre el número de clases es conocimiento general del conjunto de datos EuroSAT (aproximadamente 27.000 imágenes de 64x64 píxeles procedentes de parches Sentinel-2), no información confirmada en la model card de este repositorio concreto.

No hay información disponible sobre el número de épocas, la tasa de aprendizaje, la resolución a la que se redimensionaron las imágenes, las técnicas de aumento de datos aplicadas ni la existencia de validación cruzada o búsqueda de hiperparámetros. Tampoco se documenta si se congelaron capas del backbone ni qué precisión numérica se empleó durante el ajuste.

## Capacidades

- Clasificación de imágenes de satélite en 10 categorías de uso y cobertura del suelo.
- Inferencia sobre recortes o parches individuales de imagen; no es un modelo de detección de objetos ni de segmentación semántica.
- Funciona exclusivamente como extractor clasificador de visión: no genera texto, código ni razonamiento simbólico.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües: no existe componente de lenguaje.
- El pipeline declarado es `image-classification` y la etiqueta `endpoints_compatible` indica que puede desplegarse detrás del toolkit de inferencia de Hugging Face, pero no se documentan capacidades adicionales como visión multimodal con texto, audio o vídeo.
- Al no haber model card funcional, no se documentan umbrales de confianza, calibración ni comportamiento ante imágenes fuera de distribución.

## Casos de uso

- Monitorización de cobertura del suelo a escala regional: clasificación por lotes de parches Sentinel-2 para generar mapas temáticos de uso del suelo (cultivos, bosque, agua, urbano) a partir de inferencia sobre miles de recortes.
- Seguimiento agrícola: identificación de parcelas de cultivo anual frente a pastos o cultivos permanentes para estimar superficie sembrada y apoyar sistemas de alerta temprana.
- Detección de cambios urbanos: clasificación periódica de la misma zona geográfica para señalar transiciones de vegetación o cultivo hacia tejido residencial o industrial.
- Vigilancia medioambiental y de masas de agua: identificación de láminas de agua (ríos, lagos y mar) para seguimiento de sequías, inundaciones o variación de cauces.
- Apoyo a la planificación de infraestructuras: clasificación previa de corredores para detectar proximidad a zonas industriales, residenciales o de alto valor ecológico antes de un estudio de impacto.
- Despliegue en el borde (edge): con 27,8 M de parámetros y 111 MB en fp32, puede ejecutarse en GPUs integradas, drones de reconocimiento o estaciones remotas con conectividad limitada, evitando enviar imágenes crudas a la nube.
- Prototipado y docencia: sirve como caso base barato para comparar arquitecturas convolucionales frente a transformers de visión en tareas de teledetección, y para prácticas de fine-tuning con `transformers` y `Trainer`.
- Generación de etiquetas sintéticas: uso como etiquetador automático para preanotar grandes volúmenes de imágenes antes de una revisión humana, dado su bajo coste computacional por inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio concreto. La model card no incluye métricas de evaluación, y el repositorio no documenta precisión, F1, matriz de confusión ni pérdida de validación.

Como referencia externa, el modelo `mrm8488/convnext-tiny-finetuned-eurosat`, publicado por otro autor sobre la misma base arquitectónica y el mismo conjunto de datos, reporta una pérdida de 0,0549 y una precisión de 0,9805 en el conjunto de evaluación. Este dato corresponde a ese artefacto y no puede atribuirse a `RichardsonI/convnext-tiny-finetuned-eurosat`, aunque sugiere el orden de magnitud alcanzable con este enfoque.

## Requisitos de hardware

- Peso en disco de los pesos: aproximadamente 111 MB en fp32 (27,8 M de parámetros × 4 bytes); alrededor de 56 MB en fp16 y unos 28 MB en int8.
- VRAM de inferencia: por debajo de 1 GB incluso con lotes moderados; el cuello de botella habitual es la resolución de entrada y el tamaño de lote, no los parámetros.
- GPU recomendadas: cualquier GPU moderna sirve. Una RTX 3060, RTX 4090, T4, L4, A10G, A100 o H100 ejecutan el modelo sin problema; las GPUs de gama alta quedan enormemente sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU de consumo: RTX 3050/3060, GTX 1650, así como en GPUs integradas recientes.
- Ejecución en CPU: viable para lotes pequeños gracias al bajo número de parámetros.
- Opciones de despliegue: `transformers` en Python, Hugging Face Inference Endpoints, TorchScript, exportación a ONNX o TensorRT para aceleración, y el catálogo de Azure AI Foundry para la variante equivalente publicada por `nielsr`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por imagen, imágenes por segundo ni tiempos de arranque.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea y datos | Contexto / entrada | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `RichardsonI/convnext-tiny-finetuned-eurosat` | 27,8 M | Clasificacion de uso del suelo, EuroSAT | Imagen 224x224 (presumible) | no disponible | no disponible | Hugging Face, 0 descargas |
| `nielsr/convnext-tiny-finetuned-eurosat` | ~28 M | Clasificacion de uso del suelo, EuroSAT | Imagen 224x224 | no disponible | no disponible | Hugging Face y catalogo de Azure AI Foundry |
| `mrm8488/convnext-tiny-finetuned-eurosat` | ~28 M | Clasificacion de uso del suelo, EuroSAT | Imagen 224x224 | 0,9805 de precision y 0,0549 de perdida en evaluacion | no disponible | Hugging Face |
| `facebook/convnext-tiny-224` | ~28 M | Clasificacion generica, ImageNet-1k | Imagen 224x224 | no disponible en esta busqueda | no disponible | Hugging Face |

Los tres primeros son ajustes independientes del mismo backbone sobre el mismo conjunto de datos; la diferencia práctica entre ellos es la reproducibilidad y la documentación, no la arquitectura. `facebook/convnext-tiny-224` es el punto de partida sin ajustar y serviría como control para medir la ganancia real del fine-tuning sobre EuroSAT.

## Limitaciones y advertencias

- La model card es la plantilla automática sin rellenar: no hay documentación de sesgos, datos de entrenamiento, hiperparámetros ni evaluación. Esto impide auditar el modelo y hace arriesgado su uso en producción sin validación propia.
- La licencia no está declarada. No se puede asumir uso comercial permitido; hay que contactar con el autor o tratar el modelo como no licenciado para explotación comercial.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza: los clasificadores de imagen no expresan incertidumbre de forma fiable y pueden etiquetar incorrectamente parches ambiguos (por ejemplo, suelo desnudo frente a cultivo en barbecho).
- Sesgo geográfico y temporal inherente a EuroSAT: el conjunto se construyó sobre imágenes Sentinel-2 de cobertura europea, por lo que el modelo puede degradarse en regiones con tipos de suelo, estacionalidad o sensores distintos.
- Sensibilidad a la resolución y al preprocesado: si las imágenes de entrada no se redimensionan y normalizan igual que en el ajuste (aspecto no documentado), la precisión caerá de forma apreciable.
- Sin capacidades fuera de la clasificación: no detecta objetos, no segmenta, no genera descripciones y no acepta instrucciones en lenguaje natural.
- La fecha de creación del repositorio indicada en el Hub (2026-09-29) y el contador de descargas a cero sugieren un artefacto reciente y sin validación por parte de la comunidad.
- Para uso en producción se recomienda medir precisión sobre un conjunto de validación propio, comprobar la calibración de las probabilidades y fijar umbrales de confianza con revisión humana en los casos dudosos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RichardsonI/convnext-tiny-finetuned-eurosat
- Variante equivalente de `nielsr`: https://huggingface.co/nielsr/convnext-tiny-finetuned-eurosat
- Variante equivalente de `mrm8488` (con métricas publicadas): https://huggingface.co/mrm8488/convnext-tiny-finetuned-eurosat
- Ficha del modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Paper de ConvNeXt: https://arxiv.org/abs/2201.03545
- Paper citado en la etiqueta `arxiv:1910.09700` (Lacoste et al., estimación de emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental referenciada en la plantilla: https://mlco2.github.io/impact
- Ficha de terceros con análisis del modelo equivalente: https://free2aitools.com/model/nielsr/convnext-tiny-finetuned-eurosat
- Catálogo de Azure AI Foundry para el modelo equivalente: https://ai.azure.com/catalog/models/nielsr/convnext-tiny-finetuned-eurosat
