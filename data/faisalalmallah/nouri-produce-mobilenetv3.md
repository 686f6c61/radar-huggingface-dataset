# FaisalALMallah/nouri-produce-mobilenetv3

## Resumen

Nouri produce classifier es un clasificador de imágenes de muy pequeño tamaño desarrollado por FaisalALMallah como componente del proyecto Nouri, un juego educativo de nutrición dirigido a niños en Catar. El modelo identifica 30 tipos de frutas y verduras crudas habituales en las cocinas cataríes (manzana, plátano, zanahoria, pepino, okra, berenjena, granada, mango, higo, entre otras) y actúa como primera pasada rápida dentro de una arquitectura mayor que combina este clasificador con modelos de visión-lenguaje (SmolVLM2-2.2B en GPU y SmolVLM-500M en CPU) para el reconocimiento de platos más complejos.

Técnicamente se trata de un fine-tuning de `timm/mobilenetv3_small_100.lamb_in1k`, un MobileNetV3-Small preentrenado en ImageNet-1k. Con solo 1,55 millones de parámetros, el modelo está optimizado para inferencia en CPU con una latencia declarada de 7,5 ms por imagen de 224×224, lo que lo hace adecuado para entornos con recursos muy limitados o para despliegue en dispositivos de bajo consumo.

Su relevancia radica en el enfoque de diseño: un clasificador minúsculo y especializado que resuelve el caso mayoritario (una fruta o verdura única en una foto) con una precisión del 96,2% sobre un conjunto de validación de 1166 imágenes, reservando los modelos generativos más costosos para los casos ambiguos. El modelo se distribuye con licencia MIT y está pensado exclusivamente para uso educativo infantil, sin mostrar calorías ni datos nutricionales numéricos a los niños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN, bloques con SE y activaciones h-swish) |
| Parametros totales | 1,55 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224×224) |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (las etiquetas de clase están en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors / pesos PyTorch compatibles con timm (repo de 0,0 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de MobileNetV3-Small, una red neuronal convolucional diseñada mediante búsqueda de arquitectura (NAS) y técnicas de NetAdapt, descrita en el artículo *Searching for MobileNetV3* (Howard et al., ICCV 2019, arXiv:1905.02244). MobileNetV3-Small emplea convoluciones separables en profundidad, bloques con atención de canal (squeeze-and-excitation) y funciones de activación h-swish, lo que le permite mantener un coste computacional muy bajo. El checkpoint de partida es `timm/mobilenetv3_small_100.lamb_in1k`, preentrenado en ImageNet-1k con el optimizador LAMB.

El entrenamiento se realizó sobre el dataset `ibrahimdaud/raw-food-recognition` (licencia MIT), filtrando únicamente las clases presentes en la taxonomía infantil de Nouri y muestreando hasta 250 imágenes de entrenamiento y 50 de validación por clase, con descarte de imágenes ilegibles. El conjunto final consta de 5004 imágenes de entrenamiento y 1166 de validación para 30 clases. Se entrenó durante 6 épocas con AdamW y scheduler OneCycle, label smoothing de 0,1, sobre una única GPU A10G (HF Jobs `a10g-small`), con un tiempo de 775 segundos y un coste aproximado de 0,25 dólares. El seguimiento del entrenamiento se realizó con Trackio en el proyecto `nouri-produce-classifier`. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un clasificador de imágenes.

## Capacidades

- Clasificación de imágenes de frutas y verduras crudas en 30 clases predefinidas: apple, banana, orange, carrot, cucumber, tomato, broccoli, spinach, bell pepper, potato, sweet potato, eggplant, zucchini, okra, peas, corn, cauliflower, cabbage, lettuce, onion, mango, pineapple, pomegranate, pear, kiwi, grapes, strawberry, watermelon, lemon y fig.
- Reconocimiento de un único elemento por imagen, orientado a fotos de producto crudo.
- Salida de nombre de alimento (etiqueta de clase), sin estimación de cantidades, calorías ni valores nutricionales.
- Inferencia de muy baja latencia en CPU (7,5 ms por imagen a 224×224), apta para ejecución en el dispositivo o en servidores modestos.
- Integración como primera pasada en un pipeline híbrido junto a modelos de visión-lenguaje (SmolVLM2-2.2B en GPU, SmolVLM-500M en CPU) para el reconocimiento de platos mixtos o cocinados.
- Umbral de confianza operativo de 0,6: Nouri solo añade una predicción al plato cuando la confianza es igual o superior a ese valor.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües documentadas ni modos de pensamiento; es exclusivamente un clasificador de imágenes.

## Casos de uso

- Clasificación rápida de producto en aplicaciones educativas infantiles: el modelo identifica una fruta o verdura a partir de una foto tomada por el niño y devuelve el nombre del alimento, lo que permite construir juegos de reconocimiento nutricional con retroalimentación inmediata y sin exponer datos calóricos.
- Primera pasada en pipelines híbridos de reconocimiento de alimentos: al ejecutarse en 7,5 ms en CPU, filtra los casos simples (una pieza de fruta o verdura aislada) y solo deriva a los modelos VLM los casos ambiguos, reduciendo el coste computacional global del sistema.
- Despliegue en dispositivos de bajo consumo o entornos sin GPU: con 1,55 M de parámetros, puede ejecutarse en CPU de portátiles, Raspberry Pi o navegadores mediante exportación a ONNX, lo que facilita aplicaciones offline en aulas o entornos con conectividad limitada.
- Etiquetado asistido de datasets de alimentos: el modelo puede preetiquetar imágenes de producto crudo para su posterior revisión humana, acelerando la curación de corpus de visión para nutrición.
- Módulo de validación en aplicaciones de seguimiento dietético infantil: como componente de un juego o aplicación de educación alimentaria, verifica que el alimento fotografiado pertenece a la taxonomía esperada antes de mostrar contenido educativo asociado.
- Prototipado rápido y experimentación académica: su tamaño reducido, licencia MIT y entrenamiento reproducible (775 s en una A10G, ~0,25 USD) lo convierten en una base asequible para investigar clasificación fine-grained de alimentos con recursos mínimos.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Validation accuracy | 96,2% | 1166 imágenes reservadas, 30 clases |
| Latencia CPU | 7,5 ms | 1 imagen 224×224 |
| Imágenes de entrenamiento | 5004 | hasta 250 por clase |
| Imágenes de validación | 1166 | hasta 50 por clase |
| Épocas | 6 | AdamW + OneCycle, label smoothing 0,1 |
| Tiempo de entrenamiento | 775 s | 1× A10G (HF Jobs `a10g-small`) |
| Coste de entrenamiento | ≈ 0,25 USD | HF Jobs `a10g-small` |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo (1,55 M de parámetros) ocupa unos pocos megabytes en memoria, por lo que la VRAM no es un factor limitante.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entrenó con una NVIDIA A10G. Para inferencia, una RTX 4090, A100 o H100 están sobredimensionadas para este modelo.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1650 o inferiores, y también en CPU.
- Opciones de despliegue: timm (`timm.create_model("hf-hub:FaisalALMallah/nouri-produce-mobilenetv3", pretrained=True)`), PyTorch nativo, exportación a ONNX u otros runtimes ligeros; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de imágenes de este tamaño.
- Latencia y throughput: 7,5 ms por imagen en CPU según el autor; el throughput en GPU no está documentado, pero con este tamaño de modelo será muy elevado y limitado principalmente por el preprocesado de imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nouri produce-mobilenetv3 | 1,55 M | Clasificación de 30 frutas y verduras | Imagen 224×224 | MIT | Hugging Face (timm) |
| MobileNetV3-Small (ImageNet-1k, timm) | ~1,5 M | Clasificación de 1000 clases genéricas | Imagen 224×224 | BSD-3-Clause (torchvision) / Apache-2.0 (timm) | Hugging Face, torchvision |
| SmolVLM-500M | ~500 M | Visión-lenguaje, reconocimiento abierto | Contexto multimodal | Apache-2.0 (según modelo base) | Hugging Face |
| SmolVLM2-2.2B | ~2,2 B | Visión-lenguaje, reconocimiento abierto | Contexto multimodal | Apache-2.0 (según modelo base) | Hugging Face |

La comparación con los modelos SmolVLM es relevante porque el propio autor los emplea en el mismo pipeline de Nouri: el clasificador MobileNetV3 resuelve el caso de producto único a una fracción del coste, mientras que los VLM cubren platos mixtos o cocinados. Frente a MobileNetV3-Small genérico de ImageNet, este fine-tuning gana especificidad en la taxonomía de 30 clases pero pierde cobertura de clases. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con fotos de producto crudo, mayoritariamente de un solo elemento; no reconoce platos mixtos, cocinados ni recetas, que se derivan a los modelos VLM del pipeline.
- No cubre platos típicos del Golfo como machboos o harees; las clases son únicamente frutas y verduras.
- El conjunto de validación es pequeño (1166 imágenes) y la precisión en platos reales será inferior a la del split reservado, según advierte el propio autor.
- No es una herramienta médica ni dietética; no debe usarse para diagnóstico, prescripción nutricional ni seguimiento clínico.
- Las etiquetas de clase están en inglés y no se documentan capacidades multilingües.
- Riesgo de confusión entre clases visualmente próximas (por ejemplo, variedades de verdura de hoja o tubérculos) no cuantificado en la model card.
- No se documentan sesgos demográficos ni geográficos del dataset de entrenamiento más allá de su orientación a la cocina catarí.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- El umbral de confianza de 0,6 es una decisión de producto de Nouri, no una calibración publicada del modelo; en producción conviene recalibrar sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FaisalALMallah/nouri-produce-mobilenetv3
- Dataset de entrenamiento: https://huggingface.co/datasets/ibrahimdaud/raw-food-recognition
- Paper MobileNetV3 (arXiv:1905.02244): https://arxiv.org/abs/1905.02244
- Documentación MobileNet V3 en Torchvision: https://docs.pytorch.org/vision/main/models/mobilenetv3.html
- Documentación MobileNet V3 en Torchvision 0.29: https://docs.pytorch.org/vision/stable/models/mobilenetv3.html
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
