# Pranilllllll/geonusaf-tcsegformer-block-fold0

## Resumen

GeoNUSAF TC-SegFormer es un modelo de segmentación semántica para teledetección, desarrollado por el usuario Pranilllllll, que clasifica el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo sin uso y agrícola. Se trata de un checkpoint concreto dentro de un esquema de validación cruzada por bloques (fold 0 de 3), entrenado sobre imágenes de 512x512 píxeles con resolución de 0,586 metros por píxel.

El modelo se basa en la arquitectura SegFormer con backbone `nvidia/segformer-b0-finetuned-ade-512-512`, un transformer jerárquico ligero preentrenado en ADE20K. Incorpora varias técnicas de entrenamiento avanzadas: reweighting por clases (CSA), pérdida soft-clDice, muestreo balanceado y una ruta de detalle para mejorar la segmentación de bordes. Su relevancia radica en abordar un problema práctico de cartografía urbana con un modelo de tamaño reducido, aunque su rendimiento en clases minoritarias es limitado.

El repositorio tiene un tamaño de 0,8 GB y no se especifican licencia, idiomas ni pipeline. Al ser un modelo de segmentación, no genera texto ni admite tool calling; su salida es un mapa de etiquetas por píxel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (transformer jerárquico) con backbone b0 |
| Parametros totales | no disponible (el backbone b0 tiene ~3,7M, pero el total del modelo no se indica) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, entrada 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o pytorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SegFormer, un transformer jerárquico que combina un encoder con atención de ventana desplazable y un decoder ligero basado en MLP. El backbone es `nvidia/segformer-b0-finetuned-ade-512-512`, preentrenado en el dataset ADE20K para segmentación semántica general, y se fine-tunea para la tarea específica de uso del suelo. La entrada es de 512x512 píxeles con resolución de 0,586 m/px, y se utilizan 6 clases con `ignore_index=255` para píxeles no etiquetados.

El entrenamiento incorpora varias innovaciones: reweighting por clases (CSA) con tau=[0.6, 0.35, 0.35, 0.6, 0.6, 0.6] y w_min=0.25 para compensar el desbalanceo, pérdida soft-clDice con mu=0.3 que combina Dice y clDice para mejorar la conectividad de estructuras lineales, un muestreador balanceado y una ruta de detalle (detail path) para refinar bordes. El esquema de validación es por bloques (sequence-block CV) con 3 folds, siendo este el fold 0 con semilla 42. El mejor epoch fue el 35. No se especifica el número total de imágenes ni la composición exacta del dataset.

## Capacidades

- Segmentación semántica de uso del suelo en 6 clases: residencial, carretera, río, bosque, suelo sin uso y agrícola.
- Procesamiento de imágenes aéreas o satelitales de alta resolución (0,586 m/px) en formato 512x512.
- Detección de bordes y estructuras lineales mejorada gracias a la pérdida soft-clDice y la ruta de detalle.
- Manejo de clases desbalanceadas mediante reweighting CSA y muestreo balanceado.
- Inferencia sobre imágenes individuales; no admite secuencias de video ni entrada multimodal.
- Sin capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Cartografía urbana y actualización de mapas de uso del suelo: el modelo puede clasificar automáticamente parcelas residenciales, carreteras y zonas agrícolas en imágenes aéreas del valle de Katmandú, facilitando la generación de mapas temáticos actualizados para planificación municipal.
- Monitorización de cambios en cobertura vegetal: la clase bosque muestra un IoU de 0.5868 y una precisión de 0.9312, lo que permite detectar deforestación o regeneración en series temporales de imágenes.
- Gestión de recursos hídricos: aunque la clase río tiene un rendimiento bajo (IoU 0.0667), el modelo puede servir como primera aproximación para delimitar cauces en zonas donde no se requiera alta precisión.
- Planificación de infraestructuras viarias: la detección de carreteras (IoU 0.1817) puede apoyar estudios de accesibilidad y expansión urbana, aunque requiere post-procesamiento para mejorar la precisión.
- Análisis de suelo no urbanizado: la clase UnusedLand (IoU 0.2040) permite identificar parcelas vacantes para estudios de densificación o especulación inmobiliaria.
- Agricultura de precisión: la clase agrícola (IoU 0.3902) puede utilizarse para estimar superficies de cultivo y apoyar políticas de seguridad alimentaria, combinando el mapa con datos climáticos.

## Benchmarks y rendimiento

Los resultados de validación del fold 0 se presentan en la model card. No se dispone de comparación con otros modelos en la información proporcionada.

| Metrica | Valor |
|---|---|
| mIoU | 0.3336 |
| mF1 | 0.4667 |
| OA (Overall Accuracy) | 0.6150 |
| Kappa | 0.4901 |

Rendimiento por clase:

| Clase | IoU | UA (precision) | PA (recall) |
|---|---|---|---|
| Residential | 0.5722 | 0.8873 | 0.6170 |
| Road | 0.1817 | 0.4802 | 0.2262 |
| River | 0.0667 | 0.0904 | 0.2030 |
| Forest | 0.5868 | 0.6134 | 0.9312 |
| UnusedLand | 0.2040 | 0.4973 | 0.2571 |
| Agricultural | 0.3902 | 0.4833 | 0.6696 |

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información disponible. Dado que el backbone es SegFormer-b0 (un modelo ligero de aproximadamente 3,7 millones de parámetros) y el repositorio ocupa 0,8 GB, se puede estimar que la inferencia es viable en GPUs de consumo medio, aunque estos datos no están confirmados por el autor.

- VRAM estimada: no disponible oficialmente; por el tamaño del modelo, probablemente inferior a 4 GB en FP32, pero no confirmado.
- GPU recomendadas: no disponible; cualquier GPU con al menos 4 GB de VRAM podría ser suficiente, pero no hay garantía.
- Compatibilidad con GPUs de consumo: probablemente sí (p. ej., RTX 3060 o superior), pero no verificado.
- Opciones de despliegue: no se mencionan; al ser un modelo de segmentación, podría usarse con frameworks como PyTorch, ONNX o TensorRT, pero no hay documentación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo se basa en SegFormer, por lo que podría compararse con otros backbones de segmentación como U-Net, DeepLabV3 o Swin Transformer, pero no hay métricas de referencia para estos en el mismo dataset. Se recomienda consultar la literatura sobre segmentación de uso del suelo en entornos urbanos para establecer comparaciones.

## Limitaciones y advertencias

- Rendimiento muy bajo en clases minoritarias: río (IoU 0.0667) y carretera (IoU 0.1817) presentan resultados pobres, lo que limita su uso en aplicaciones que requieran precisión en estas categorías.
- Sesgo geográfico: el modelo está entrenado exclusivamente con imágenes del valle de Katmandú; su generalización a otras regiones o climas no está garantizada y probablemente degrade el rendimiento.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o redistribución.
- Dependencia del esquema de validación: al ser un fold de una validación cruzada por bloques, los resultados pueden variar entre folds; este checkpoint concreto no representa el rendimiento global del sistema.
- Sin soporte para otras modalidades: no admite entrada de texto, audio ni video; solo imágenes de 512x512.
- Riesgo de alucinación no aplicable (modelo discriminativo), pero sí riesgo de errores de clasificación en zonas ambiguas o con sombras.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pranilllllll/geonusaf-tcsegformer-block-fold0
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
