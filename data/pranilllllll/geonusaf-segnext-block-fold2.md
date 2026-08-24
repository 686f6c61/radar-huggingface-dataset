# Pranilllllll/geonusaf-segNext-block-fold2

## Resumen

GeoNUSAF - SegNeXt-T - block split, fold 2 es un modelo de segmentación semántica para imágenes de teledetección desarrollado por el usuario Pranilllllll. Está diseñado específicamente para el mapeo de usos del suelo en el valle de Katmandú (Nepal), con seis clases: residencial, carretera, río, bosque, suelo sin uso y agrícola. El modelo se basa en la arquitectura SegNeXt (NeurIPS 2022), que combina un encoder MSCAN-T con un decodificador LightHamHead, y se presenta como una solución ligera con solo 4,23 millones de parámetros, lo que facilita su despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su enfoque específico para una región geográfica concreta, lo que permite capturar patrones urbanos y ambientales locales con una resolución efectiva de 0,586 m/píxel. Se trata de un modelo de segmentación semántica puro, sin capacidades de generación de texto, y su licencia Apache 2.0 permite su uso comercial sin restricciones. Este modelo forma parte de una serie de tres folds (split en bloques) que buscan evaluar la robustez del entrenamiento mediante validación cruzada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MSCAN-T encoder + LightHamHead decoder (SegNeXt) |
| Parametros totales | 4,23 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada de imagen 512x512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegNeXt, presentada en NeurIPS 2022, que utiliza un encoder MSCAN-T basado en transformers con atención multi-escala y un decodificador LightHamHead que fusiona características de los primeros tres stages con un stride de 8. El encoder se inicializa con pesos preentrenados en ImageNet-1K, con el 100% de los tensores cargados. El entrenamiento se realizó con un tamaño de entrada de 512x512 píxeles, normalización ImageNet y una resolución efectiva de 0,586 m/píxel. Se utilizó un esquema de división por bloques con un pliegue 2 de 3, y se aplicaron técnicas de regularización como weight decay 0,01, drop path 0,1, suavizado de etiquetas 0,05 y EMA (exponencial moving average). El modelo se entrenó durante 16 épocas, alcanzando su mejor rendimiento en la época 16. Además, se empleó una técnica de factorización de matrices no negativas (NMF) con rango 16 y 6 pasos de entrenamiento y 7 de evaluación.

## Capacidades

- Segmentación semántica de imágenes de teledetección, clasificando cada píxel en una de seis clases de uso del suelo.
- Soporte de entrada de imágenes RGB de 512x512 píxeles con normalización ImageNet.
- Clasificación de clases específicas: residencial, carretera, río, forestal, suelo sin uso y agrícola.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de visión.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- **Planificación urbana**: el modelo permite mapear áreas residenciales y de suelo sin uso para apoyar la toma de decisiones en el desarrollo de infraestructura y zonificación.
- **Monitoreo de cambios en el uso de suelo**: al comparar predicciones a lo largo del tiempo, se puede detectar la expansión urbana o la pérdida de áreas agrícolas y forestales.
- **Gestión de recursos naturales**: identificación de zonas forestales y agrícolas para la gestión sostenible de recursos y la conservación.
- **Evaluación de riesgos de inundación**: el modelo identifica ríos y zonas de agua, lo que es útil para mapear áreas vulnerables a inundaciones en el valle.
- **Análisis de infraestructura vial**: la clase de carretera permite evaluar la densidad de red vial y su evolución, apoyando estudios de movilidad.
- **Monitoreo ambiental**: seguimiento de la degradación de suelo sin uso y su conversión a otros usos, contribuyendo a estudios de impacto ambiental.

## Benchmarks y rendimiento

Los resultados de validación del modelo se muestran a continuación:

| Metrica | Valor |
|---|---|
| mIoU | 0,4622 |
| mF1 | 0,6000 |
| OA | 0,8483 |
| Kappa | 0,6586 |

**Per-class (validación):**

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8789 | 0,9356 |
| Road | 0,3556 | 0,5247 |
| River | 0,2253 | 0,3678 |
| Forest | 0,4731 | 0,6424 |
| UnusedLand | 0,2267 | 0,3695 |
| Agricultural | 0,6134 | 0,7604 |

No se han publicado comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- No se especifican requisitos de VRAM concretos en la documentación.
- Con 4,23 millones de parámetros y una entrada de 512x512, el modelo es ligero y puede ejecutarse en CPU para inferencia por lotes.
- Para inferencia en tiempo real o en producción, se recomienda una GPU con al menos 2 GB de VRAM, aunque no se ha validado esta cifra.
- El modelo se puede desplegar con cualquier framework de PyTorch, incluyendo TorchServe o un script personalizado basado en `segnext_model.py`.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- El rendimiento en clases como Road, River y UnusedLand es bajo (IoU inferior a 0,36), lo que limita su uso en aplicaciones que requieren alta precisión en estas categorías.
- El modelo está entrenado exclusivamente con datos del valle de Katmandú, por lo que su generalización a otras regiones geográficas es incierta y puede no ser adecuado para otros contextos.
- Es un modelo de segmentación semántica, no es un modelo de lenguaje, por lo que no tiene capacidades de generación de texto ni de razonamiento simbólico.
- El modelo se ha entrenado con un pliegue específico (fold 2 de 3); para obtener una evaluación más robusta, es necesario considerar los otros pliegues.
- La licencia Apache 2.0 permite uso comercial, pero se debe incluir la atribución correspondiente al código original de SegNeXt.
- No se han evaluado sesgos potenciales en los datos de entrenamiento, que podrían reflejar desequilibrios en las clases o en la representación geográfica.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Pranilllllll/geonusaf-segNext-block-fold2)
- [Código base de SegNeXt (Visual-Attention-Network/SegNeXt)](https://github.com/Visual-Attention-Network/SegNeXt)
