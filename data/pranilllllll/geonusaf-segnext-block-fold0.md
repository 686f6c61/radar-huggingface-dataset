# Pranilllllll/geonusaf-segNext-block-fold0

## Resumen

GeoNUSAF - SegNeXt-T - block split, fold 0 es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por Pranilllllll. El modelo clasifica el uso del suelo en el Valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. Está basado en la arquitectura SegNeXt (NeurIPS 2022), que combina un encoder MSCAN-T con un decodificador LightHamHead, y tiene 4,05 millones de parámetros.

El modelo se ha entrenado con imágenes de resolución efectiva de 0,586 metros por píxel, recortadas a 512×512 píxeles, y utiliza un esquema de partición por bloques con validación cruzada de tres pliegues (este es el pliegue 0). Los pesos se distribuyen bajo licencia Apache-2.0 y el código de reconstrucción se incluye en el repositorio. Es relevante para proyectos de planificación urbana y monitorización ambiental que necesiten clasificar cobertura terrestre con un modelo ligero y desplegable en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MSCAN-T encoder + LightHamam decoder (SegNeXt, NeurIPS 2022) |
| Parámetros totales | 4,05 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 512×512) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (fichero `best.pt` con `model_state`, `arch`, `cfg` y `metrics`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegNeXt presentada en NeurIPS 2022, que propone un diseño de atención convolucional más eficiente que el self-attention de los transformers para segmentación semántica. El encoder es un MSCAN-T (versión pequeña), inicializado con pesos de ImageNet-1K (el 100% de los tensores se cargaron correctamente), y el decodificador es un LightHamamHead que fusiona las etapas 1, 2 y 3 con un stride de 8. El modelo se entrenó con 6 clases y `ignore_index=255`, usando una partición por bloques en tres pliegues; este es el pliegue 0 con semilla 42.

El entrenamiento usó una tasa de aprendizaje de 0,0006 para el decodificador y 6e-05 para el encoder, con regularización de peso 0,01, drop path 0,1, suavizado de etiquetas 0,05 y EMA (media móvil exponencial) activada. Se aplicó además un descomposición NMF (rank 16) con 6 pasos de entrenamiento y 7 de evaluación. La mejor época fue la 23, y los pesos guardados en `best.pt` corresponden a los pesos EMA. El código del modelo deriva del repositorio oficial de SegNeXt (Apache-2.0) y se reconstruye con el archivo `segnext_model.py` incluido en el repositorio.

## Capacidades

- Segmentación semántica de imágenes de satélite y aéreas en alta resolución (0,586 m/px efectivo).
- Clasificación en seis clases de uso del suelo: residencial, carretera, río, vegetación, suelo sin usar y agrícola.
- Inferencia sobre imágenes de 512×512 píxeles con normalización ImageNet.
- Entrenamiento con EMA y regularización para mejorar la generalización en pliegues de validación.
- Soporte de `ignore_index=255` para manejar píxeles sin etiqueta.
- Arquitectura ligera (4,05 M parámetros) adecuada para despliegue en dispositivos con recursos limitados.

## Casos de uso

- Planificación urbana: el modelo puede segmentar imágenes de satélite del Valle de Katmandú para identificar zonas residenciales y carreteras, ayudando a los organismos municipales a actualizar mapas de uso del suelo y detectar expansión urbana no planificada.
- Monitorización ambiental: la clasificación de ríos y vegetación permite evaluar la salud de ecosistemas acuáticos y forestales, así como detectar deforestación o degradación de márgenes fluviales.
- Gestión agrícola: la clase "agrícola" permite cartografiar campos de cultivo y estimar la superficie dedicada a agricultura, lo que es útil para la planificación de recursos y la estimación de cosechas.
- Detección de suelo sin usar: la identificación de suelo no utilizado puede servir para localizar terrenos baldíos o en proceso de degradación, apoyando decisiones de regeneración urbana.
- Estudios de riesgo y vulnerabilidad: la combinación de clases de uso del suelo puede alimentar modelos de riesgo de inundaciones o deslizamientos, dado que la clase "río" y "residencial" son críticas en el Valle de Katmandú.
- Investigación académica en teledetección: el modelo sirve como punto de partida para experimentos con arquitecturas de segmentación ligeras en entornos urbanos de alta densidad, comparando su rendimiento con otros decodificadores o encoders.

## Benchmarks y rendimiento

Se han publicado métricas de validación en la model card del autor. El modelo alcanza un mIoU de 0,3075, un mF1 de 0,4332, una exactitud global (OA) de 0,5856 y un índice kappa de 0,4540 en el pliegue 0 de validación.

| Clase | IoU | F1 |
|---|---|---|
| Residencial | 0,5638 | 0,7211 |
| Carretera | 0,1971 | 0,3293 |
| Río | 0,0498 | 0,0949 |
| Vegetación | 0,5200 | 0,6842 |
| Suelo sin usar | 0,1033 | 0,1872 |
| Agrícola | 0,4111 | 0,5827 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 4,05 M parámetros y entrada de 512×512, la inferencia puede realizarse con menos de 2 GB de VRAM en formato float32, y aún menos con cuantización.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 3060 o superiores. También es viable en hardware de bajo consumo como Jetson Nano (4 GB).
- Despliegue: al ser un modelo PyTorch, puede ejecutarse con TorchServe, ONNX Runtime o directamente con Python. No hay soporte nativo de vLLM, Ollama o llama.cpp al ser un modelo de visión.
- Latencia: no hay datos de latencia publicados, pero dado el tamaño, se espera inferencia en tiempo real en GPU de gama media y en menos de 1 segundo en CPU modernas para una imagen de 512×512.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | mIoU (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoNUSAF - SegNeXt-T (este modelo) | 4,05 M | 512×512 | 0,3075 | Apache-2.0 | HuggingFace |
| GeoNUSAF - UNetFormer (ResNet-18) | no disponible | 512×512 | no disponible | Apache-2.0 | HuggingFace |
| SegNeXt original (MSCAN-T) | 4,05 M (similar) | variable | no publicado para este dataset | Apache-2.0 | GitHub |

La comparativa con UNetFormer de la misma serie GeoNUSAF no tiene métricas publicadas en la información disponible, pero comparte el mismo formato de entrenamiento y partición. El SegNeXt original, del que deriva este modelo, está diseñado para segmentación semántica general y ha demostrado rendimiento competitivo en benchmarks como ADE20K y Cityscapes, aunque no se han aplicado directamente a este dataset.

## Limitaciones y advertencias

- El mIoU de validación es bajo (0,3075), con clases especialmente débiles como "río" (IoU 0,0498) y "carretera" (IoU 0,1971). Esto puede deberse a la complejidad de estas clases en el área de estudio o a la limitación del conjunto de entrenamiento.
- El modelo se ha entrenado específicamente para el Valle de Katmandú y puede no generalizar a otras regiones geográficas sin un reentrenamiento o afinamiento.
- La resolución efectiva de 0,586 m/px limita la precisión para objetos muy pequeños o lineales como carreteras estrechas o ríos de poca anchura.
- El repositorio no incluye un pipeline de inferencia predefinido en HuggingFace; el usuario debe reconstruir el modelo con el código proporcionado (`segnext_model.py`) y cargar los pesos desde `best.pt`.
- No se han publicado análisis de sesgos ni de robustez ante condiciones atmosféricas o estacionales (nubes, sombras, cambios de iluminación).
- La licencia Apache-2.0 permite uso comercial, pero el modelo puede tener restricciones de uso si se emplean datos de entrenamiento con licencias específicas (no se especifica el origen de los datos).
- No se ha evaluado el modelo en otros conjuntos de datos de segmentación, por lo que su rendimiento en otros dominios es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pranilllllll/geonusaf-segNext-block-fold0
- Repositorio del código del modelo: https://huggingface.co/Pranilllllll/geonusaf-segNext-block-fold0 (contiene `segnext_model.py` y `best.pt`)
- Repositorio oficial de SegNeXt (código base): https://github.com/visual-attention-network/segnext
- Paper original de SegNeXt: https://arxiv.org/abs/2209.08575
- Modelo hermano GeoNUSAF - UNetFormer: https://huggingface.co/Pranilllllll/geonusaf-unetformer-r18-block-fold0
