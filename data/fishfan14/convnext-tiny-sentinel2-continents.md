# fishfan14/convnext-tiny-sentinel2-continents

## Resumen

ConvNeXt-Tiny para clasificación de continentes a partir de teselas Sentinel-2 es un modelo de visión por computador desarrollado por el usuario fishfan14, publicado en Hugging Face bajo el identificador `fishfan14/convnext-tiny-sentinel2-continents`. Resuelve una tarea de clasificación de imagen satelital: dada una tesela RGB de Sentinel-2 de aproximadamente 10,7 x 10,7 km, predice a cuál de seis continentes pertenece (África, Asia, Europa, Norteamérica, Oceanía o Sudamérica). Se trata de un fine-tuning de `timm/convnext_tiny.fb_in22k_ft_in1k`, una ConvNeXt-Tiny de 27,8 millones de parámetros preentrenada en ImageNet-22k.

El modelo es relevante como ejemplo práctico de adaptación de un backbone genérico de clasificación de imágenes a un dominio de teledetección con un conjunto de datos pequeño (1000 teselas por continente) y una metodología de evaluación cuidadosa: split por bloques de rejilla de 5° x 5° para garantizar que las áreas de test no se solapen con las de entrenamiento, y varios conjuntos de test sintéticos para medir robustez ante cambios de color, nitidez, recorte y compresión JPEG. Su interés técnico reside en la comparación explícita con un ResNet-50 entrenado con el mismo pipeline, donde ConvNeXt-Tiny muestra una degradación mucho menor ante perturbaciones.

No es un modelo de lenguaje ni un modelo multimodal generativo: es un clasificador de imágenes puro, con entrada fija de 224 x 224 píxeles y salida de 6 clases. Se distribuye en formato safetensors para la librería timm y también como `model.onnx` para inferencia sin PyTorch. La licencia es CC BY-SA 4.0, heredada de los datos de entrenamiento (Sentinel-2 vía Major TOM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (red convolucional pura con bloques estilo transformer, preentrenada en ImageNet-22k) |
| Parametros totales | 27.824.742 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen; entrada fija de 224 x 224 píxeles) |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (timm) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt-Tiny, una red convolucional que moderniza el diseño de ResNet incorporando elementos propios de los transformers (convoluciones depthwise de 7x7, normalización LayerNorm, activación GELU y proporciones de canales 4:1 en el bloque invertido). El backbone parte de los pesos `convnext_tiny.fb_in22k_ft_in1k`, preentrenados en ImageNet-22k y afinados en ImageNet-1k, y se le sustituye la cabeza por un clasificador lineal de 6 clases. La entrada es la tesela completa redimensionada a 224 x 224, sin recorte.

El entrenamiento se realizó durante 15 épocas (la primera solo con la cabeza congelada) con AdamW, weight decay 0,05, learning rate 1e-4 para el backbone y 1e-3 para la cabeza, scheduler coseno, label smoothing 0,1, drop path 0,1 y batch de 64. La aumentación consistió en rotaciones aleatorias de 90°, volteos y variaciones de brillo y contraste de ±10%. El checkpoint se seleccionó por precisión de validación. Los datos proceden de miniaturas RGB de Major TOM Core-S2L2A: 1000 teselas por continente, con cobertura nubosa inferior al 10%, escenas de verano fuera del trópico, sin nada por encima de 66° de latitud y sin Groenlandia; la etiqueta de continente se asigna según las fronteras de Natural Earth (Rusia al este de 60°E se considera Asia). El split train/val/test se hace por bloques de rejilla de 5° x 5°, de modo que las áreas de test son geográficamente no vistas. El autor advierte que una versión anterior del dataset tenía teselas en más de un split, lo que inflaba los resultados; todas las cifras publicadas corresponden a la versión corregida.

## Capacidades

- Clasificación de imágenes satelitales Sentinel-2 en seis clases de continente: África, Asia, Europa, Norteamérica, Oceanía y Sudamérica.
- Entrada RGB de una tesela completa redimensionada a 224 x 224 píxeles, sin recorte.
- Salida de probabilidades por clase (softmax sobre 6 logits), apta para umbrales de confianza y análisis de incertidumbre.
- Inferencia en PyTorch vía timm (`timm.create_model("hf-hub:...")`) o en ONNX Runtime mediante el `model.onnx` incluido.
- Robustez relativa superior a un ResNet-50 equivalente ante cambios de color, nitidez, recorte y compresión JPEG (ver tabla de resultados).
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión general, audio ni capacidades multilingües; es exclusivamente un clasificador de imagen.

## Casos de uso

- Triaje y control de calidad de catálogos de imágenes satelitales: clasificar automáticamente teselas Sentinel-2 por continente para detectar errores de geolocalización o metadatos incoherentes en un archivo de imágenes, usando la predicción como señal de alarma cuando no coincide con la etiqueta declarada.
- Enriquecimiento de metadatos en pipelines de teledetección: asignar un atributo de continente a teselas que carecen de información geográfica fiable, aprovechando la inferencia ONNX para integrarla en servicios ligeros sin dependencia de PyTorch.
- Filtrado previo en conjuntos de datos de entrenamiento: separar teselas por región continental antes de entrenar modelos downstream (detección de cultivos, segmentación de suelo urbano), reduciendo el sesgo geográfico de los datasets.
- Monitorización de robustez de modelos de teledetección: usar el modelo como referencia para medir cómo degradan las perturbaciones (JPEG, cambios de color, recortes) el rendimiento de clasificadores en producción, dado que el autor publica resultados en varios conjuntos de test sintéticos.
- Demostraciones y material docente sobre fine-tuning de backbones: ejemplo reproducible de adaptación de ConvNeXt-Tiny a un dominio específico con 6000 imágenes y 15 épocas, útil para enseñar buenas prácticas de split geográfico y evaluación de robustez.
- Prototipado rápido en aplicaciones de observación de la Tierra: como componente de un sistema mayor que necesite una etiqueta continental barata (27,8 M de parámetros, 0,2 GB de repo) antes de invocar modelos más costosos de segmentación o detección.

## Benchmarks y rendimiento

El autor publica precisión y F1 en el conjunto de test y en varios conjuntos sintéticos, comparando con un ResNet-50 entrenado con el mismo pipeline (mismos datos, split, aumentaciones y schedule). No se han publicado resultados en benchmarks estándar de visión (ImageNet, etc.) en la información disponible.

| Conjunto de test | ResNet-50 | ConvNeXt-Tiny (este modelo) |
|---|---|---|
| test (677 teselas) | 78,1% | **78,4%** |
| fresh L2A (teselas nuevas) | **77,8%** | 77,2% |
| fresh L1C (mismos lugares, otro producto) | 56,0% | **65,5%** |
| stronger colors (colores alterados) | 66,3% | **74,2%** |
| sharpened (imagen enfocada) | 54,8% | **69,0%** |
| 70% crop (~7,5 km) | 73,7% | **77,5%** |
| JPEG q60 | 37,4% | **50,1%** |
| colors + sharpening + crop | 44,9% | **67,4%** |

Métricas globales del modelo en test: precisión 78,4% (IC bootstrap 95%: 75,5%-81,7%), macro F1 0,785, sobre 677 teselas. El autor señala que en teselas regulares ambos modelos están igualados, pero ConvNeXt aguanta mucho mejor las perturbaciones, y atribuye buena parte de la diferencia al preentrenamiento en ImageNet-22k frente a ImageNet-1k, sin haber aislado esa variable. Existe una variante "robust" entrenada con aumentaciones más agresivas, con rendimiento algo inferior en teselas regulares y superior en imágenes con colores o nitidez distintos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 110 MB para los pesos (27,8 M de parámetros x 4 bytes), más activaciones de una imagen de 224 x 224; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en FP16: aproximadamente 55 MB para los pesos; el modelo completo ocupa menos de 0,2 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 4090, RTX 3060, GTX 1650, T4, A100, H100 e incluso en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer sin problema, incluidas integradas modestas si se usa ONNX Runtime en CPU.
- Opciones de despliegue: PyTorch + timm (carga directa desde el Hub), ONNX Runtime con el `model.onnx` del repo, o exportación a otros runtimes (TensorRT, OpenVINO) a partir de los pesos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo (27,8 M de parámetros, 224 x 224) se espera un throughput alto en GPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Precisión test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ConvNeXt-Tiny Sentinel-2 Continents (este modelo) | 27,8 M | 224 x 224 | Clasificación de 6 continentes | 78,4% | CC BY-SA 4.0 | Hugging Face (timm, ONNX) |
| ResNet-50 (entrenado por el autor con el mismo pipeline) | ~25,6 M | 224 x 224 | Clasificación de 6 continentes | 78,1% | no disponible (no se publica como modelo aparte) | Solo como referencia en la model card |
| ConvNeXt-Tiny Sentinel-2 Continents robust (variante del autor) | 27,8 M | 224 x 224 | Clasificación de 6 continentes | no publicada en esta información (inferior en test regular, superior en imágenes perturbadas) | CC BY-SA 4.0 | Hugging Face |
| ConvNeXt-Tiny ImageNet-22k (backbone base, `timm/convnext_tiny.fb_in22k_ft_in1k`) | 27,8 M | 224 x 224 | Clasificación ImageNet (1000 clases) | no aplica a esta tarea | Apache 2.0 (según timm, no confirmado en esta información) | Hugging Face / timm |

No se dispone de comparación con otros modelos específicos de clasificación de continentes en Sentinel-2 en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con miniaturas de Major TOM; otras fuentes de imágenes Sentinel-2 o productos distintos presentan aspecto diferente y la precisión cae (56,0% en fresh L1C frente a 77,2% en fresh L2A para este modelo).
- La compresión JPEG degrada mucho el rendimiento (50,1% de precisión a calidad 60); el autor recomienda usar PNG.
- Espera aproximadamente 10 km de terreno, escenas de verano, sin nubes y en tierra firme; no se ha evaluado en invierno, trópicos, latitudes superiores a 66°, Groenlandia ni océano.
- Asia es la clase más difícil según el autor.
- Solo se realizó una ejecución de entrenamiento y los hiperparámetros se ajustaron de forma aproximada; no hay estudios de ablación ni intervalos de confianza más allá del bootstrap publicado.
- Riesgo de sesgo geográfico: la etiqueta de continente sigue fronteras de Natural Earth (Rusia al este de 60°E como Asia), lo que puede no coincidir con convenciones políticas o culturales.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; además, los datos contienen Sentinel-2 modificado de Copernicus vía Major TOM, con las condiciones de atribución correspondientes.
- No es un modelo generativo ni multimodal: no admite texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de uso.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por terceros más allá de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fishfan14/convnext-tiny-sentinel2-continents
- Variante robust: https://huggingface.co/fishfan14/convnext-tiny-sentinel2-continents-robust
- Dataset de entrenamiento: https://huggingface.co/datasets/fishfan14/sentinel2-continents
- Dataset fuente Major TOM Core-S2L2A: https://huggingface.co/datasets/Major-TOM/Core-S2L2A
- Modelo base en timm: https://huggingface.co/timm/convnext_tiny.fb_in22k_ft_in1k
