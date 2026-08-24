# Pranilllllll/geonusaf-unetformer-r18-random-fold2

## Resumen

GeoNUSAF es un modelo de segmentación semántica de imágenes de teledetección desarrollado por el usuario Pranilllllll, diseñado específicamente para la clasificación de usos de suelo en el valle de Katmandú. Se trata de una implementación independiente del arquitecto UNetFormer propuesto por Wang et al. (2022) en el artículo *"UNetFormer: A UNet-like transformer for efficient semantic segmentation of remote sensing urban scene imagery"*, publicado en ISPRS Journal of Photogrammetry and Remote Sensing.

El modelo combina un codificador ResNet-18 preentrenado en ImageNet con un decodificador basado en atención global-local, lo que permite capturar tanto el contexto global de la escena como los detalles locales de las estructuras urbanas. Está entrenado para distinguir seis clases de uso de suelo en el valle de Katmandu —Residential, Road, River, Forest, UnusedLand y Agricultural— a partir de imágenes de 512×512 píxeles con una resolución efectiva de 0,586 m/px. La relevancia de este modelo radica en su aplicación práctica para planificación urbana, monitorización medioambiental y gestión de recursos en entornos metropolitanos de alta densidad.

El checkpoint subido corresponde a la segunda partición (fold 2 de 3) de una validación cruzada con división aleatoria de los datos, y se distribuye bajo una licencia no especificada. El repositorio ocupa 1,6 GB y contiene los pesos EMA del mejor epoch de entrenamiento, junto con la configuración y métricas asociadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer (encoder ResNet-18 de timm + decodificador de atención global-local) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UNetFormer propuesta por Wang et al. (2022), que combina un encoder ResNet-18 (obtenido de timm, preentrenado en ImageNet) con un decodificador que incorpora mecanismos de atención global-local. La atención global captura el contexto de toda la imagen, mientras que la atención local refina los detalles de las regiones vecinas, lo que resulta especialmente eficaz para la segmentación de escenas urbanas de teledetección.

El entrenamiento se realizó durante 120 épocas con un plan de aprendizaje coseno y un warmup de 500 pasos. La tasa de aprendizaje se fijó en 0,0003 para el decoder y 3e-05 para el encoder, con el optimizador AdamW (weight decay 0,01). Se aplicaron varias técnicas de regularización: EMA con factor 0,999, label smoothing de 0,05, drop path de 0,1 y dropout de 0,1. Además, se utilizó una cabeza auxiliar con peso 0,4 para mejorar la convergencia. Los pesos finales corresponden al mejor epoch (29) evaluado sobre la validación, y se guardaron los pesos EMA.

El dataset de entrenamiento corresponde a imágenes de uso de suelo de Kathmandu Valley con 6 clases (Residential, Road, River, Forest, UnusedLand, Agricultural) y un índice de ignorancia de 255 para píxeles no etiquetados. Las imágenes de entrada se normalizaron con la media y desviación de ImageNet, y se trabajó con un tamaño de 512×512 píxeles a un GSD de 0,586 m/px. La división de datos fue aleatoria con semilla 42, en 3 folds, siendo este el fold 2.

## Capacidades

- Segmentación semántica de imágenes de teledetección (satélite y aéreas) con 6 clases de uso de suelo.
- Entrada de imágenes de 512×512 píxeles con normalización ImageNet y resolución efectiva de 0,586 m/px.
- Distinción entre clases urbanas (residencial, carretera, río, bosque, suelo no utilizado, agrícola).
- Soporte para inferencia en imágenes de alta resolución mediante teselado en parches de 512×512.
- No dispone de capacidades de tool calling, razonamiento multistep ni soporte de agentes.
- No es un modelo multilingüe; su entrada es exclusivamente visual.

## Casos de uso

- Cartografía de usos de suelo urbano: el modelo puede generar mapas de cobertura del suelo de la ciudad de Katmandu a partir de imágenes aéreas o satelitales, facilitando la actualización de los sistemas de información geográfica (SIG) municipales.
- Planificación urbana y gestión del territorio: los resultados de segmentación permiten identificar zonas residenciales, carreteras y terrenos no utilizados para apoyar decisiones de expansión urbana o de reordenación del espacio público.
- Monitorización de recursos hídricos: la clase de río permite cartografiar la red fluvial y evaluar el riesgo de inundación en áreas urbanas, integrando el modelo en sistemas de alerta temprana.
- Gestión agrícola: la segmentación de terrenos agrícolas permite estimar la superficie cultivada, apoyando políticas de seguridad alimentaria y de gestión de los recursos agrícolas en el valle.
- Detección de cambios medioambientales: comparando segmentaciones de distintas fechas, se pueden detectar cambios en la cobertura forestal o la expansión urbana, útil para estudios de impacto ambiental.
- Evaluación de catástrofes naturales: tras un desastre (por ejemplo, un terremoto o inundación), el modelo puede identificar rápidamente las zonas residenciales afectadas y las vías de acceso (carreteras) para coordinar los equipos de rescate.

## Benchmarks y rendimiento

Los resultados de validación del modelo (fold 2, split aleatorio) son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,4705 |
| mF1 | 0,6161 |
| OA (overall accuracy) | 0,7604 |
| Kappa | 0,6426 |

Desglose por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,7958 | 0,8863 |
| Road | 0,2946 | 0,4551 |
| River | 0,2731 | 0,4290 |
| Forest | 0,6534 | 0,7904 |
| UnusedLand | 0,3076 | 0,4704 |
| Agricultural | 0,4984 | 0,6653 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La tasa de aprendizaje se redujo de los 6e-4 del paper original a 3e-4 para mantener la paridad con otros modelos de referencia en este dataset.

## Requisitos de hardware

- Tamaño del modelo: el repositorio ocupa 1,6 GB, lo que indica un modelo de tamaño moderado (típicamente ResNet-18 + decoder ligero, estimable en ~30-50 millones de parámetros, aunque no se especifica el número exacto).
- VRAM estimada para inferencia: en FP32 con entrada de 512×512, se estima un consumo de aproximadamente 2-4 GB de VRAM; en FP16 se reduce a 1-2 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (p. ej., RTX 3050, RTX 3060, GTX 1080). Para entrenamiento o fine-tuning, se recomienda al menos 8 GB (p. ej., RTX 3070, RTX 2080).
- Cabe en GPUs de consumo (consumer GPU) de gama baja, por lo que es accesible para prototipado y despliegue local.
- Opciones de despliegue: al ser un modelo de PyTorch, se puede exportar a ONNX o TorchScript para inferencia en producción. No se mencionan soportes específicos para vLLM, llama.cpp u Ollama (no aplica a modelos de visión).
- Latencia y throughput: no disponible en la información proporcionada, aunque por la arquitectura ligera (ResNet-18) se espera una inferencia rápida, del orden de decenas de milisegundos por imagen en GPU modernas.

## Comparativa con modelos similares

No se dispone de resultados comparativos con otros modelos de segmentación semántica de teledetección en el mismo dataset. Sin embargo, el modelo se basa en UNetFormer, que en el artículo original de Wang et al. (2022) se compara favorablemente con otros métodos como U-Net, DeepLabV3+ y Swin Transformer en datasets como Vaihingen, Potsdam y UAVid. Para una comparación directa en el dataset de Kathmandu Valley, se necesitarían las métricas de otros modelos entrenados con el mismo protocolo, que no se han publicado en la información disponible.

## Limitaciones y advertencias

- Rendimiento desigual por clase: las clases Road (IoU 0,2946), River (IoU 0,2731) y UnusedLand (IoU 0,3076) presentan un rendimiento significativamente inferior al de Residential (IoU 0,7958) y Forest (IoU 0,6534), lo que puede generar errores críticos en aplicaciones que dependen de estas categorías.
- Sesgo geográfico: el modelo está entrenado exclusivamente con imágenes de Kathmandu Valley, por lo que su generalización a otras regiones geográficas o a otras condiciones atmosféricas o de sensor no está garantizada.
- Riesgo de alucinación visual: como todo modelo de segmentación, puede generar etiquetas incorrectas en áreas ambiguas, especialmente en zonas de transición entre clases (por ejemplo, carreteras parcialmente ocultas por árboles).
- Sin licencia especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial y redistribución. Se debe contactar con el autor antes de utilizar en producción.
- Dependencia del preprocesado: las imágenes de entrada deben normalizarse con la norm de ImageNet y el tamaño de 512×512 píxeles; el modelo no está diseñado para otras resoluciones o normalizaciones sin reentrenamiento.
- Limitación de la validación: la división aleatoria de los datos puede sobreestimar el rendimiento real en escenarios de distribución espacial diferente; el autor advierte que el split por bloques (sequence-block CV) no es espacial, lo que puede producir una estimación optimista de la generalización.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-unetformer-r18-random-fold2
- Repositorio de referencia GeoSeg (WangLibo1995/GeoSeg): https://github.com/WangLibo1995/GeoSeg
- Repositorio de referencia UnetFormer (whulearner/UnetFormer): https://github.com/whulearner/UnetFormer
- Documentación de UNetFormer en DeepWiki: https://deepwiki.com/WangLibo1995/GeoSeg/4.2-unetformer
- Modelo variante con block split (Pranilllllll/geonusaf-unetformer-r18-block-fold2): https://huggingface.co/Pranilllllll/geonusaf-unetformer-r18-block-fold2
- Modelo variante con block split (sugam24/geonusaf-unetformer-r18-block-fold2): https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold2
