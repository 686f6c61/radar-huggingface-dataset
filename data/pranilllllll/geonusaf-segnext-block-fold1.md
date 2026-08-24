# Pranilllllll/geonusaf-segNext-block-fold1

## Resumen

GeoNUSAF - SegNeXt-T - block split, fold 1 es un modelo de segmentación semántica para teledetección, desarrollado por Pranilllllll, que clasifica el uso del suelo en el valle de Katmandú en seis clases: residencial, carretera, río, bosque, tierra no utilizada y agrícola. Se basa en la arquitectura SegNeXt (NeurIPS 2022), concretamente en el encoder MSCAN-T y el decodificador LightHamHead, con un total de 4,23 millones de parámetros. El modelo se presenta como parte de un experimento con división en bloques y pliegue 1 de 3, con una resolución de entrada de 512x512 píxeles y un tamaño efectivo de píxel de 0,586 m/px.

La relevancia de este modelo radica en su ligereza y en su enfoque específico para un área geográfica concreta, lo que permite evaluar el rendimiento de arquitecturas convolucionales eficientes frente a alternativas basadas en transformadores en tareas de segmentación de imágenes de satélite. El checkpoint incluye pesos EMA, configuración de arquitectura y métricas de validación, y el código de reconstrucción se deriva del repositorio oficial de SegNeXt bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MSCAN-T encoder + LightHamHead decoder (SegNeXt, NeurIPS 2022) |
| Parametros totales | 4,23 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision por computadora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SegNeXt, que combina un encoder MSCAN-T (Multi-Scale Convolutional Attention Network) con un decodificador LightHamHead. MSCAN utiliza atención convolucional en lugar de self-attention, lo que reduce el coste computacional y mejora la eficiencia en la codificación de información contextual. El encoder se inicializa con pesos preentrenados en ImageNet-1K, cargando el 100% de los tensores. El decodificador fusiona las etapas 1, 2 y 3 del encoder con un stride de fusión de 8. Se aplica factorización de matrices no negativas (NMF) con rango 16, utilizando 6 pasos en entrenamiento y 7 en evaluación.

El entrenamiento se realizó con una resolución de 512x512, normalización ImageNet, y un GSD efectivo de 0,586 m/px. Se usó una tasa de aprendizaje de 0,0006 para el decodificador y 6e-05 para el encoder, con regularización de peso 0,01, drop path 0,1, suavizado de etiquetas 0,05 y media móvil exponencial (EMA) activada. El mejor rendimiento se obtuvo en la época 4. El dataset corresponde a imágenes del valle de Katmandú con 6 clases y ignore_index=255, aunque no se especifica el número de imágenes ni la composición exacta del conjunto de datos.

## Capacidades

- Segmentación semántica de imágenes aéreas o satelitales en 6 clases: residencial, carretera, río, bosque, tierra no utilizada y agrícola.
- Procesamiento de imágenes de 512x512 píxeles con normalización ImageNet y resolución efectiva de 0,586 m/px.
- Inferencia con pesos EMA opcionales, que mejoran la estabilidad y generalización.
- Reconstrucción de la red completa a partir del archivo `best.pt`, que incluye el estado del modelo, la configuración de arquitectura y las métricas.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo puramente de visión.

## Casos de uso

- Planificación urbana: el modelo identifica zonas residenciales y carreteras, lo que permite a los ayuntamientos y urbanistas actualizar mapas de uso del suelo y detectar expansiones informales en el valle de Katmandú.
- Monitoreo de deforestación: la clase bosque (IoU 0,6728) permite detectar pérdida de cobertura forestal a lo largo del tiempo comparando segmentaciones de distintas fechas.
- Gestión de recursos hídricos: la clase río, aunque con bajo rendimiento (IoU 0,0383), puede utilizarse como entrada preliminar para delimitar cauces y evaluar riesgos de inundación en combinación con otras fuentes.
- Agricultura de precisión: la clase agrícola (IoU 0,4731) ayuda a identificar parcelas cultivadas y a estimar superficies de cultivo para políticas agrarias o seguros.
- Detección de terrenos baldíos: la clase tierra no utilizada (IoU 0,1586) permite localizar solares vacíos o degradados, útil para programas de rehabilitación urbana.
- Evaluación de impacto ambiental: al combinar las seis clases, se pueden generar mapas de cobertura terrestre que sirvan de base para estudios de biodiversidad, ordenación territorial o análisis de fragmentación del hábitat.

## Benchmarks y rendimiento

El modelo reporta métricas de validación en el conjunto de validación del pliegue 1. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| mIoU | 0,3635 |
| mF1 | 0,4810 |
| OA (Overall Accuracy) | 0,6377 |
| Kappa | 0,4582 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,6683 | 0,8012 |
| Road | 0,1698 | 0,2903 |
| River | 0,0383 | 0,0738 |
| Forest | 0,6728 | 0,8044 |
| UnusedLand | 0,1586 | 0,2738 |
| Agricultural | 0,4731 | 0,6423 |

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información disponible. Dado el reducido número de parámetros (4,23 M) y la resolución de entrada de 512x512, es razonable esperar que el modelo pueda ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, aunque no se dispone de datos confirmados de latencia o throughput. Para despliegue, al ser un modelo PyTorch, puede integrarse con frameworks como TorchServe o exportarse a ONNX para inferencia en CPU o GPU.

## Comparativa con modelos similares

Existe un modelo hermano del mismo autor, `Pranilllllll/geonusaf-tcsegformer-block-fold0`, que utiliza una arquitectura TC-SegFormer (basada en transformadores) sobre el mismo conjunto de datos y esquema de división. No se dispone de sus métricas de rendimiento en la información proporcionada. Tampoco se han encontrado comparaciones con otras implementaciones de SegNeXt o modelos de segmentación remota en este contexto.

| Modelo | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| geonusaf-segNext-block-fold1 | MSCAN-T + LightHamHead | 4,23 M | 512x512 | Apache-2.0 |
| geonusaf-tcsegformer-block-fold0 | TC-SegFormer | no disponible | no disponible | Apache-2.0 |

## Limitaciones y advertencias

- Sesgo geográfico: el modelo está entrenado exclusivamente con imágenes del valle de Katmandú, por lo que su capacidad de generalización a otras regiones o condiciones climáticas es limitada.
- Rendimiento desigual por clase: las clases río (IoU 0,0383) y carretera (IoU 0,1698) presentan resultados muy bajos, lo que indica dificultades para segmentar elementos lineales o estrechos.
- Sin datos de entrenamiento detallados: no se especifica el número de imágenes, la distribución de clases ni el origen exacto del dataset, lo que dificulta evaluar posibles sesgos de muestreo.
- Alucinación: al ser un modelo discriminativo de segmentación, no genera texto ni contenido sintético, por lo que el riesgo de alucinación no aplica.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se debe mantener la atribución y el aviso de licencia en redistribuciones.
- Formato de pesos: el checkpoint se guarda en formato PyTorch (`best.pt`), lo que requiere el código de reconstrucción (`segnext_model.py`) incluido en el repositorio para cargar el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-segNext-block-fold1
- Repositorio oficial de SegNeXt: https://github.com/visual-attention-network/segnext
- Paper de SegNeXt: https://arxiv.org/abs/2209.08575
- Modelo hermano TC-SegFormer: https://huggingface.co/Pranilllllll/geonusaf-tcsegformer-block-fold0
