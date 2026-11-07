# fishfan14/resnet50-sentinel2-continents

## Resumen

`fishfan14/resnet50-sentinel2-continents` es un clasificador de imágenes basado en ResNet-50, ajustado por un autor individual (fishfan14) para predecir el continente de origen de un tile RGB de Sentinel-2 de aproximadamente 10,7 x 10,7 km. El modelo parte de los pesos de ImageNet `timm/resnet50.tv2_in1k` y se ha reentrenado sobre el dataset `fishfan14/sentinel2-continents`, derivado de Major TOM Core-S2L2A. Resuelve una tarea de clasificación geográfica gruesa (seis clases: África, Asia, Europa, Norteamérica, Oceanía y Sudamérica) sobre imágenes satelitales de baja resolución.

La relevancia del modelo es más experimental que productiva: se trata de un proyecto pequeño para medir hasta dónde llegan los modelos de visión estándar en miniaturas satelitales. Con 23,5 millones de parámetros y una entrada de 224 x 224 píxeles, alcanza un 92,4% de accuracy en un conjunto de test separado por bloques de rejilla de 5° x 5°, lo que evita fuga geográfica entre train y test.

Arquitectónicamente es una CNN ResNet-50 clásica, sin mecanismos de atención ni arquitecturas híbridas. Su interés práctico reside en el coste de inferencia (unos 120 ms por imagen en CPU de Colab) y en la disponibilidad de pesos en safetensors y ONNX, lo que facilita su despliegue en entornos sin PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales) |
| Parametros totales | 23.573.446 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 x 224 px) |
| Tipos de cuantizacion | no disponible (repo incluye safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX (PyTorch via timm) |

## Arquitectura y entrenamiento

ResNet-50 es una red neuronal convolucional de 50 capas con bloques residuales bottleneck, originalmente diseñada para clasificación de ImageNet. En este caso se parte de los pesos torchvision v2 (`resnet50.tv2_in1k`) y se sustituye la cabeza de 1000 clases por una de 6 clases. La entrada es el tile completo redimensionado a 224 x 224 píxeles, sin recorte central.

El entrenamiento se realizó durante 15 épocas (la primera solo entrena la nueva cabeza), con AdamW, weight decay 0,05, learning rate 5e-4 para el backbone y 2e-3 para la cabeza, schedule coseno, label smoothing 0,1, batch 64 y precisión fp16. La augmentación incluye rotaciones aleatorias de 90°, volteos y variaciones de brillo y contraste de ±10%. El checkpoint se seleccionó por accuracy de validación. El coste total fue de unos 6 minutos en una Colab T4.

Los datos provienen de miniaturas RGB (bandas B04/B03/B02) de Major TOM Core-S2L2A, guardadas a 512 px, con 1000 tiles por continente. Los filtros aplicados fueron: cobertura de nubes inferior al 10%, escenas de verano fuera del trópico (mayo-septiembre en el norte, noviembre-marzo en el sur), exclusión de latitudes superiores a 66° y de Groenlandia, y asignación continental según fronteras de Natural Earth (Rusia al este de 60°E se cuenta como Asia). El split es 5330 / 779 / 989 (train / val / test), separado por bloques de rejilla de 5° x 5°.

## Capacidades

- Clasificación de imágenes satelitales Sentinel-2 en seis clases continentales.
- Predicción de probabilidades por clase (softmax sobre 6 logits).
- Inferencia en CPU y GPU; el autor reporta unos 120 ms por imagen en CPU de Colab.
- Exportación a ONNX incluida en el repositorio para despliegue sin PyTorch.
- Integración con `timm.create_model` mediante `hf-hub:fishfan14/resnet50-sentinel2-continents`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación entrenada.
- No dispone de modo thinking, audio ni vídeo.

## Casos de uso

- Filtrado geográfico previo en pipelines de datos satelitales: dado un lote de tiles Sentinel-2, el modelo asigna una etiqueta continental con un coste de ~120 ms por imagen en CPU, útil para enrutar tiles a pipelines regionales antes de un procesamiento más caro.
- Control de calidad de datasets: detectar tiles mal etiquetados o mezclados entre continentes comparando la predicción del modelo con la metadato de origen; la accuracy del 92,4% permite usarlo como señal de alerta.
- Etiquetado débil en proyectos de teledetección: generar pseudo-etiquetas continentales para tiles sin metadatos geográficos, siempre que provengan de Major TOM o de fuentes con aspecto visual similar.
- Demo educativa de clasificación satelital: por su tamaño (23,5 M parámetros) y su entrenamiento en 6 minutos en T4, sirve como ejemplo reproducible de fine-tuning de un backbone ImageNet sobre datos de observación de la Tierra.
- Despliegue en entornos con recursos limitados: la variante ONNX y los 23,5 M de parámetros permiten ejecución en dispositivos edge o en contenedores sin GPU, a diferencia de alternativas como DINOv2-B (~565 ms por imagen en CPU).
- Preprocesado en sistemas de indexación de imagery: asignar un continente aproximado a miniaturas para organizar catálogos o balances de datasets antes de una anotación manual más fina.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Conjunto de test: 989 tiles, separados por bloques de rejilla de 5° x 5°.

| Modelo | Accuracy test | Parámetros |
|---|---|---|
| DINOv2-B + LoRA | 92,5% | 86,6 M (0,9 M entrenados) |
| ResNet-50 (este modelo) | 92,4% | 23,5 M |
| ConvNeXt-T | 92,0% | 27,8 M |
| MobileNetV3-L | 88,8% | 4,2 M |
| DINOv2-B linear probe | 82,4% | no disponible |
| CLIP ViT-B/32 zero-shot | 37,2% | no disponible |

Macro F1 de este modelo: 0,924. Intervalo de confianza bootstrap al 95% para accuracy: 90,7%-94,1%, por lo que los tres primeros modelos están estadísticamente empatados. Latencia reportada por el autor: ~120 ms por imagen en CPU de Colab para ResNet-50 frente a ~565 ms para DINOv2-B.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: por debajo de 1 GB (23,5 M de parámetros, ~47 MB en fp16 más activaciones de una imagen de 224 x 224).
- VRAM estimada en fp32: por debajo de 1 GB (~94 MB de pesos más activaciones).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en T4, RTX 3060, RTX 4090, A100, H100 sin aprovechar su capacidad.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 2050 y similares; también en CPU.
- Opciones de despliegue: `timm` con PyTorch, ONNX Runtime (archivo `model.onnx` en el repo), TorchServe, o cualquier runtime compatible con ONNX. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia: ~120 ms por imagen en CPU de Colab según el autor. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Accuracy (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fishfan14/resnet50-sentinel2-continents | 23,5 M | Continente desde tile Sentinel-2 | 92,4% | CC BY-SA 4.0 | Hugging Face (safetensors + ONNX) |
| DINOv2-B + LoRA (referencia del autor) | 86,6 M (0,9 M entrenados) | Misma tarea | 92,5% | no disponible en la información | No se indica repo público en la información |
| ConvNeXt-T (referencia del autor) | 27,8 M | Misma tarea | 92,0% | no disponible en la información | No se indica repo público en la información |
| torchgeo/resnet50_sentinel2_all_moco | no disponible | Backbone Sentinel-2 (MoCo) | no disponible | no disponible | Hugging Face (TorchGeo) |

La comparativa se limita a las referencias internas del autor; no se dispone de datos públicos de benchmarks estandarizados para esta tarea.

## Limitaciones y advertencias

- Entrenado exclusivamente con miniaturas de Major TOM; imágenes de otras fuentes (Google Maps, fotografía aérea, Sentinel con otro estiramiento de color) degradan la accuracy de forma notable.
- Espera aproximadamente 10 km de terreno por imagen; escalas mucho más cercanas o lejanas no funcionan bien.
- Solo ha visto escenas de verano, sin nubes, sobre tierra. Nieve, nubes, mar abierto y regiones polares quedan fuera de la distribución de entrenamiento.
- Asia es la clase más heterogénea (desiertos, taiga, trópicos, montañas) y se confunde con prácticamente todas las demás.
- Un solo entrenamiento con hiperparámetros ajustados de forma aproximada; no hay búsqueda sistemática ni múltiples semillas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir-al-igual. Contiene datos Copernicus Sentinel modificados vía Major TOM, lo que impone las mismas obligaciones de atribución.
- Riesgo de alucinación en sentido figurado: el modelo siempre devuelve una de las seis clases con una probabilidad, incluso ante imágenes fuera de distribución (mar, nubes, imágenes no satelitales).
- No debe usarse para geolocalización fina ni para decisiones que requieran precisión geográfica; la granularidad es continental.
- Sin métricas publicadas de calibración ni de rendimiento por clase más allá del macro F1 agregado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fishfan14/resnet50-sentinel2-continents
- Dataset de entrenamiento: https://huggingface.co/datasets/fishfan14/sentinel2-continents
- Dataset fuente Major TOM Core-S2L2A: https://huggingface.co/datasets/Major-TOM/Core-S2L2A
- Modelo base: https://huggingface.co/timm/resnet50.tv2_in1k
- Backbone alternativo Sentinel-2 (TorchGeo): https://huggingface.co/torchgeo/resnet50_sentinel2_all_moco
- ResNet50 en Qualcomm AI Hub (referencia de despliegue): https://aihub.qualcomm.com/models/resnet50
