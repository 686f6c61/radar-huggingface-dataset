# Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold0

## Resumen

El modelo `Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold0` es un fine-tuning de SegFormer-B0 para segmentación semántica de uso del suelo en el valle de Katmandú (Nepal). Desarrollado por el usuario Pranilllllll, clasifica imágenes de teledetección en seis clases: residencial, carretera, río, bosque, suelo sin uso y agrícola. El modelo se basa en la arquitectura SegFormer (MiT-B0) y parte del checkpoint preentrenado `nvidia/segformer-b0-finetuned-ade-512-512`, adaptado con una división de datos en bloques y validación cruzada de 3 pliegues (fold 0).

Este modelo es relevante para aplicaciones de planificación urbana, monitoreo ambiental y gestión de recursos, ya que ofrece una solución ligera y eficiente para segmentar imágenes de alta resolución (GSD efectivo de 0,586 m/px) con una entrada de 512x512 píxeles. Aunque las métricas de validación son modestas (mIoU de 0,2036), el checkpoint incluye pesos EMA y configuración completa, lo que permite reproducir y continuar el entrenamiento. La licencia no está especificada, por lo que se debe tener precaución antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegformerForSemanticSegmentation (MiT-B0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,2 GB, probablemente safetensors o binario) |

## Arquitectura y entrenamiento

SegFormer es un modelo de segmentación semántica basado en un transformer jerárquico (MiT, Mix Transformer) que no requiere positional encoding y emplea un decodificador MLP ligero. El checkpoint base es `nvidia/segformer-b0-finetuned-ade-512-512`, preentrenado en ADE20K, y se fine-tuneó con el dataset GeoNUSAF del valle de Katmandú. El entrenamiento usó una entrada de 512x512 píxeles con normalización ImageNet, un learning rate de 6e-05 para la cabeza y 6e-06 para el encoder, weight decay 0,01, drop path 0,1, suavizado de etiquetas 0,05 y EMA activado. Se entrenó durante 7 épocas (mejor época) con una división en bloques y fold 0 de 3, con seed 42. El checkpoint `best.pt` almacena los pesos del modelo (EMA si está activo), la configuración del run, la configuración completa del modelo y las métricas.

## Capacidades

- Segmentación semántica de imágenes de teledetección en 6 clases: residencial, carretera, río, bosque, suelo sin uso y agrícola.
- Procesamiento de imágenes de alta resolución con un GSD efectivo de 0,586 m/px.
- Inferencia con entrada de 512x512 píxeles, normalización ImageNet.
- Compatible con el ecosistema Hugging Face Transformers y con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No incluye capacidades de tool calling, agentes ni procesamiento de lenguaje; es un modelo puramente de visión.

## Casos de uso

- Mapeo de uso del suelo urbano: el modelo puede clasificar automáticamente áreas residenciales, carreteras y espacios agrícolas en imágenes satelitales, facilitando la actualización de mapas catastrales en el valle de Katmandú.
- Planificación territorial: los resultados de segmentación permiten identificar zonas de expansión urbana, áreas verdes y cauces fluviales, apoyando decisiones de zonificación y gestión de riesgos.
- Monitoreo ambiental: la clase de bosque puede usarse para detectar deforestación o cambios en la cobertura vegetal a lo largo del tiempo, comparando segmentaciones de distintas fechas.
- Gestión de infraestructuras: la detección de carreteras (aunque con IoU bajo) puede ayudar a actualizar redes viales en sistemas de información geográfica (SIG).
- Evaluación de desastres naturales: al identificar ríos y zonas sin uso, el modelo puede contribuir a la cartografía de áreas inundables o de suelo degradado tras eventos climáticos.
- Investigación académica: sirve como punto de partida para experimentos con arquitecturas ligeras en segmentación de teledetección, dado su bajo coste computacional y su configuración reproducible.

## Benchmarks y rendimiento

El modelo reporta las siguientes métricas de validación para el fold 0:

| Metrica | Valor |
|---|---|
| mIoU | 0,2036 |
| mF1 | 0,3072 |
| Overall Accuracy (OA) | 0,4700 |
| Kappa | 0,3175 |

Rendimiento por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,2927 | 0,4528 |
| Road | 0,0558 | 0,1057 |
| River | 0,0030 | 0,0060 |
| Forest | 0,4703 | 0,6397 |
| UnusedLand | 0,0915 | 0,1677 |
| Agricultural | 0,3082 | 0,4712 |

No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo ligero (repo de 0,2 GB, arquitectura MiT-B0), la inferencia es viable en GPUs de consumo. Se estima un uso de VRAM entre 2 y 4 GB para una entrada de 512x512 en FP32, aunque no hay datos oficiales.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 2080 Ti, o superiores. También puede ejecutarse en CPU para inferencia puntual, aunque con mayor latencia.
- Compatible con despliegue mediante Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y con la librería `transformers` para integración en pipelines de Python.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre comparativas con otros modelos de segmentación semántica en el mismo dataset o con arquitecturas similares (p. ej., U-Net, DeepLabV3). La ficha del autor no incluye referencias a modelos comparables.

## Limitaciones y advertencias

- Las métricas de validación son bajas, especialmente en las clases Road (IoU 0,0558) y River (IoU 0,0030), lo que indica dificultad para segmentar estas categorías, posiblemente por desbalance de clases o solapamiento espectral.
- El modelo está entrenado específicamente para el valle de Katmandú; su generalización a otras regiones geográficas o escalas puede ser limitada.
- La licencia no está especificada, por lo que no se garantiza el uso comercial sin consultar al autor.
- No se han proporcionado datos sobre sesgos o alucinaciones, pero al ser un modelo de segmentación, los errores se manifiestan como clasificaciones incorrectas de píxeles.
- El checkpoint solo contiene el fold 0 de 3; para una evaluación completa se necesitarían los otros folds.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold0)
- [Repositorio oficial de SegFormer (NVlabs)](https://github.com/NVlabs/SegFormer)
- [Documentación de SegFormer en Hugging Face](https://huggingface.co/docs/transformers/model_doc/segformer)
- [Checkpoint base nvidia/segformer-b0-finetuned-ade-512-512](https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512)
