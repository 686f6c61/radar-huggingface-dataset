# Pranilllllll/geonusaf-unetformer-r18-random-fold0

## Resumen

GeoNUSAF - UNetFormer (ResNet-18) es un modelo de segmentación semántica de imágenes de teledetección desarrollado por Pranilllllll, entrenado sobre el valle de Katmandú para clasificar el uso del suelo en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo combina un encoder ResNet-18 de timm preentrenado en ImageNet con un decoder basado en atención global-local, siguiendo la arquitectura UNetFormer propuesta por Wang et al. (2022) en ISPRS Journal of Photogrammetry and Remote Sensing.

Este checkpoint corresponde a la partición aleatoria (random split) y al pliegue 0 de un esquema de validación cruzada de 3 pliegues, con semilla 42. El repositorio pesa 2,4 GB e incluye los pesos EMA del mejor epoch (36) junto con la configuración de entrenamiento, las métricas de validación y la firma de arquitectura. Es un modelo de propósito específico para segmentación de imágenes aéreas y satelitales, no un modelo de lenguaje, por lo que su uso se limita a tareas de visión por computador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer: encoder ResNet-18 (timm, ImageNet) + decoder de atención global-local |
| Parametros totales | no disponible (estimacion: ~30 M para ResNet-18 + decoder) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 512x512) |
| Tipos de cuantizacion | no disponible (checkpoint en precision completa) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (best.pt) con model_state, cfg, metrics y arch_sig |

## Arquitectura y entrenamiento

El modelo implementa de forma independiente la arquitectura UNetFormer de Wang et al. (2022), que combina un encoder ResNet-18 (con pesos de timm preentrenados en ImageNet) con un decoder que integra atención global y local para capturar tanto contexto de escena como detalles de bordes. La entrada es de 512x512 píxeles con normalización ImageNet y un GSD efectivo de 0,586 m/píxel, lo que permite procesar imágenes de muy alta resolución de entornos urbanos.

El entrenamiento usa AdamW con pesos de decaimiento 0,01, tasas de aprendizaje de 0,0003 para el decoder y 3e-05 para el encoder, con un calentamiento de 500 pasos y una programación coseno de 120 épocas. Se aplican EMA con factor 0,999, label smoothing de 0,05, drop path de 0,1 y dropout de 0,1, además de una cabeza auxiliar con peso 0,4. Los pesos finales corresponden a la EMA en el epoch 36. La validación alcanza un mIoU de 0,4946, mF1 de 0,6463, exactitud global de 0,7740 y kappa de 0,6505. El autor advierte que la partición de bloques de secuencia usa un proxy de orden de exportación, no una validación espacial real.

## Capacidades

- Segmentación semántica de seis clases de uso del suelo: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Procesamiento de imágenes de teledetección de alta resolución (GSD efectivo 0,586 m/px) con entrada de 512x512.
- Ignora píxeles con etiqueta 255 (ignore_index), lo que permite manejar áreas sin anotar.
- Decoder con atención global-local, que combina contexto global de escena con detalles locales para mejorar los límites entre clases.
- El checkpoint EMA proporciona pesos suavizados y más estables para inferencia que los pesos de entrenamiento.
- Arquitectura validada en el dominio de escenas urbanas de teledetección (referencia ISPRS).

## Casos de uso

- Cartografía de uso de suelo urbano: clasificar imágenes satelitales del valle de Katmandú para generar mapas de ocupación del suelo con seis categorías, útil para planificación territorial y estudios de crecimiento urbano.
- Monitorización de recursos hídricos: la clase "Río" permite identificar y trazar cauces fluviales y cambios en su extensión a lo largo del tiempo, con IoU de 0,3687 en validación.
- Detección de infraestructuras viarias: la clase "Carretera" (IoU 0,3259) permite extraer redes de transporte para análisis de accesibilidad y movilidad.
- Evaluación de cobertura forestal: la clase "Bosque" (IoU 0,5858) es la más fiable del modelo, útil para inventarios forestales y detección de deforestación.
- Gestión de suelo no utilizado: la clase "UnusedLand" (IoU 0,3518) ayuda a identificar parcelas vacantes para estudios de especulación inmobiliaria o potencial de desarrollo.
- Agricultura y seguridad alimentaria: la clase "Agricultural" (IoU 0,5443) permite monitorizar superficies de cultivo y estimar cambios estacionales en la producción agrícola.
- Como línea base de investigación: el checkpoint con configuración completa y métricas detalladas sirve como referencia reproducible para comparar nuevas arquitecturas en el dataset GeoNUSAF.

## Benchmarks y rendimiento

Los resultados de validación publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU (validacion) | 0,4946 |
| mF1 (validacion) | 0,6463 |
| Exactitud global (OA) | 0,7740 |
| Kappa | 0,6505 |

Rendimiento por clase (validacion):

| Clase | IoU | F1 |
|---|---|---|
| Residencial | 0,7912 | 0,8834 |
| Carretera | 0,3259 | 0,4915 |
| Rio | 0,3687 | 0,5387 |
| Bosque | 0,5858 | 0,7388 |
| Suelo no utilizado | 0,3518 | 0,5205 |
| Agricola | 0,5443 | 0,7049 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un ResNet-18 con entrada 512x512, la inferencia requiere aproximadamente 2-4 GB de VRAM en precision completa, y menos de 2 GB con cuantizacion. Es un modelo ligero que cabe en practicamente cualquier GPU consumer.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 2060, RTX 3060, etc.) es suficiente. Para entrenamiento desde cero se recomienda una GPU con 8-16 GB (RTX 3080, RTX 4090, A5000) por el tamaño del dataset y el batch.
- Despliegue: al ser un checkpoint PyTorch puro, se puede cargar con PyTorch y ejecutar en CPU o GPU. No hay soporte nativo para vLLM, llama.cpp u Ollama (son herramientas para LLMs). Se puede exportar a TorchScript o ONNX para produccion.
- Latencia estimada: no disponible, pero para una imagen 512x512 en una RTX 3060 se espera inferencia en decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | mIoU (GeoNUSAF) | Licencia |
|---|---|---|---|---|---|
| GeoNUSAF UNetFormer (este) | UNetFormer + ResNet-18 | ~30 M | 512x512 | 0,4946 | no disponible |
| U-Net clasica (ResNet-18) | U-Net + ResNet-18 | ~30 M | 512x512 | no disponible | MIT |
| SegFormer-B0 | Transformer jerarquico | ~3,7 M | 512x512 | no disponible | Apache 2.0 |
| DeepLabV3+ (ResNet-50) | Encoder-decoder con atrous | ~40 M | 512x512 | no disponible | MIT |

No se dispone de resultados comparativos en el mismo dataset para estas alternativas. La referencia original de UNetFormer (Wang et al., 2022) reporta mIoU superiores en datasets publicos como Vaihingen (84,2%) y Potsdam (85,6%), pero esos resultados no son directamente comparables por la diferencia de dataset y clases.

## Limitaciones y advertencias

- Sesgos geograficos: el modelo se entrena exclusivamente sobre el valle de Katmandu, por lo que su rendimiento puede degradarse en otras regiones con diferente apariencia urbana, vegetacion o clima.
- Rendimiento desigual por clase: las clases de carretera (IoU 0,3259) y suelo no utilizado (IoU 0,3518) tienen resultados notablemente inferiores, lo que limita su uso para aplicaciones que requieran alta precision en estas categorias.
- Validacion no espacial: el split de validacion es aleatorio, no espacial, lo que puede sobrestimar el rendimiento real en zonas no vistas de la region.
- Licencia no disponible: no se especifica la licencia, por lo que el uso comercial requiere contactar con el autor.
- Arquitectura independiente: aunque sigue el paper de Wang et al. (2022), la implementacion es propia y no se ha validado contra la implementacion de referencia de GeoSeg.
- Sin datos de entrenamiento publicados: no se indica el numero de imagenes ni la composicion del dataset de entrenamiento, lo que dificulta la reproducibilidad.
- Riesgo de alucinacion visual: como cualquier modelo de segmentacion, puede producir predicciones espurias en zonas ambiguas, especialmente en bordes de clase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-unetformer-r18-random-fold0
- Variante con block split (mismo autor): https://huggingface.co/Pranilllllll/geonusaf-unetformer-r18-block-fold0
- Variante con block split (otro autor): https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold0
- Repositorio GeoSeg (referencia de UNetFormer): https://github.com/WangLibo1995/GeoSeg
- Implementacion alternativa de UNetFormer: https://github.com/joeweiming/MYUnet
- Paper original: Wang et al. (2022), ISPRS J. Photogramm. Remote Sens. 190:196-214
