# dronefreak/bdd100k-scenario-efficientvit_b1

## Resumen

El modelo `dronefreak/bdd100k-scenario-efficientvit_b1` es un clasificador de imágenes EfficientViT-B1 afinado por el usuario dronefreak para la tarea de clasificación de escenarios de conducción en siete clases (ciudad, autopista, residencial, aparcamiento, gasolinera, túnel y desconocido). Se trata de un fine-tuning del checkpoint preentrenado `timm/efficientvit_b1.r224_in1k`, publicado en Hugging Face bajo licencia Apache 2.0 y con solo 7.525.639 parámetros totales.

La tarea es no oficial y deriva de las etiquetas `attributes.scene` del dataset BDD100K, siguiendo la definición del dataset de Kaggle del mismo nombre. El modelo se entrenó y evaluó como parte del proyecto BDD100K-Toolkit, un conjunto de herramientas para preparar BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones.

Su relevancia práctica radica en que ofrece un clasificador de escenas de conducción extremadamente ligero (7,5 millones de parámetros, repo de 0,1 GB) que puede desplegarse en entornos con recursos limitados, como sistemas embebidos o GPUs de consumo, y que sirve como punto de referencia dentro de un zoo de modelos que incluye alternativas como EfficientViT-B3, YOLO11, MobileNetV4, TinyViT o ConvNeXt-Atto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-B1 (vision transformer eficiente, base `timm/efficientvit_b1.r224_in1k`) |
| Parametros totales | 7.525.639 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen 224x224 según `pretrained_cfg`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de clasificación visual, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal) y `best.pt` (checkpoint de entrenamiento con pesos EMA) |

## Arquitectura y entrenamiento

La arquitectura es EfficientViT-B1, un vision transformer eficiente de la familia EfficientViT, cargado desde el checkpoint preentrenado `timm/efficientvit_b1.r224_in1k` y afinado sobre el dataset `dronefreak/BDD100K-Scenario-Classification`. El modelo opera sobre imágenes de entrada con el tamaño, media y desviación típica definidos en `pretrained_cfg`, que se expone a través de `config.json` junto con los nombres de las etiquetas.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del propio fine-tuning. El checkpoint original de entrenamiento (`best.pt`) incluye pesos EMA y metadatos de entrenamiento, y está disponible mediante `hf_hub_download` desde el repositorio. La evaluación se realizó sobre la partición `test` de 10.000 imágenes.

## Capacidades

- Clasificación de imágenes en siete clases de escenario de conducción: ciudad, autopista, residencial, aparcamiento, gasolinera, túnel y desconocido.
- Inferencia ligera: 7,5 millones de parámetros, adecuada para entornos con recursos limitados.
- Integración con `timm`: carga mediante `timm.create_model("hf-hub:dronefreak/bdd100k-scenario-efficientvit_b1", pretrained=True)`.
- Exposición de la configuración de preprocesado (tamaño de entrada, media, desviación típica y nombres de etiquetas) a través de `pretrained_cfg`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes puro.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades especiales más allá de la clasificación visual.

## Casos de uso

- Etiquetado automático de escenas en pipelines de datos de conducción autónoma: el modelo puede clasificar fotogramas de BDD100K o de cámaras de vehículo en las siete categorías de escena para enriquecer datasets con metadatos de contexto, gracias a su bajo coste computacional.
- Preprocesado en sistemas embebidos o de borde: con 7,5 millones de parámetros y un repo de 0,1 GB, puede ejecutarse en dispositivos con memoria limitada para filtrar o priorizar fotogramas antes de etapas más costosas.
- Segmentación de vídeo por escenario: clasificando fotogramas consecutivos se pueden agrupar clips por tipo de entorno (ciudad, autopista, túnel) para análisis posteriores o para entrenar modelos específicos por dominio.
- Baseline en investigación y comparación de modelos: sirve como referencia dentro del zoo de BDD100K-Toolkit para comparar arquitecturas ligeras (EfficientViT, MobileNetV4, TinyViT, ConvNeXt-Atto, YOLO) con las mismas métricas y particiones.
- Filtrado de datasets para anotación manual: el modelo puede preseleccionar imágenes de clases poco representadas (gasolinera, túnel, aparcamiento) para revisión humana, aunque su recall en esas clases es bajo y requiere supervisión.
- Docencia y prototipado rápido: al cargarse con una sola llamada a `timm` y exponer `pretrained_cfg`, es adecuado para demostraciones de fine-tuning de clasificadores visuales en cursos o talleres.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre la partición `test` (10.000 imágenes) del dataset BDD100K Scenario Classification:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 78,01 % |
| Top-5 accuracy | 99,93 % |
| Macro F1 | 54,15 % |
| Balanced accuracy | 49,41 % |
| Macro precision | 70,13 % |
| Macro recall | 49,41 % |

Rendimiento por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| city street | 79,42 % | 88,92 % | 83,91 % | 6112 |
| gas stations | 100,00 % | 14,29 % | 25,00 % | 7 (pocas) |
| highway | 77,78 % | 65,55 % | 71,14 % | 2499 |
| parking lot | 61,76 % | 42,86 % | 50,60 % | 49 (pocas) |
| residential | 69,51 % | 54,59 % | 61,15 % | 1253 |
| tunnel | 91,30 % | 77,78 % | 84,00 % | 27 (pocas) |
| unknown | 11,11 % | 1,89 % | 3,23 % | 53 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 7,5 millones de parámetros en fp32 el modelo ocupa aproximadamente 30 MB de pesos, y en fp16 alrededor de 15 MB. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: cualquier GPU moderna, incluida RTX 4090, A100 o H100; el modelo no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU o CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` con PyTorch (carga vía `hf-hub`), exportación a otros runtimes no documentada en la información disponible; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa con alternativas del mismo zoo, evaluadas sobre la misma partición `test` según los datos del autor:

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| EfficientViT-B3 | 79,32 % | 57,70 % | 53,59 % | 71,54 % |
| YOLO11n | 78,58 % | 49,47 % | 46,05 % | 60,98 % |
| MobileNetV4-Conv-Small | 78,20 % | 52,89 % | 48,69 % | 61,41 % |
| **EfficientViT-B1 (este modelo)** | **78,01 %** | **54,15 %** | **49,41 %** | **70,13 %** |
| TinyViT-21M | 77,99 % | 62,52 % | 66,21 % | 59,66 % |
| ConvNeXt-Atto | 77,44 % | 61,06 % | 60,34 % | 67,92 % |

En términos de top-1, EfficientViT-B1 queda en la zona media del zoo, ligeramente por debajo de EfficientViT-B3, YOLO11n y MobileNetV4-Conv-Small, pero con una macro precision (70,13 %) superior a la de TinyViT-21M y ConvNeXt-Atto. En macro F1 y balanced accuracy, TinyViT-21M y ConvNeXt-Atto superan claramente a este modelo, lo que sugiere que EfficientViT-B1 favorece las clases mayoritarias. La licencia Apache 2.0 y el tamaño reducido son ventajas frente a alternativas de mayor coste computacional.

## Limitaciones y advertencias

- Fuerte desbalance de clases: el modelo rinde bien en `city street` (F1 83,91 %) y `highway` (71,14 %), pero muy mal en `unknown` (F1 3,23 %) y con recall bajo en `gas stations` (14,29 %) y `parking lot` (42,86 %), clases con muy pocas imágenes de test.
- La macro F1 (54,15 %) y la balanced accuracy (49,41 %) indican un rendimiento pobre en clases minoritarias pese a la alta top-1 (78,01 %); no debe usarse como clasificador fiable en escenarios poco representados sin revisión humana.
- Tarea no oficial: la definición de las siete clases deriva de `attributes.scene` de BDD100K y sigue el dataset de Kaggle del mismo nombre; no es una tarea estándar del benchmark original.
- Riesgo de sesgo hacia las clases dominantes (`city street` y `highway` concentran la mayoría de imágenes de test).
- No se dispone de información sobre sesgos geográficos, demográficos o de condiciones meteorológicas del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones de los datos de BDD100K subyacentes.
- Métricas declaradas por el autor y no verificadas (`verified: false` en el model-index).
- No apto para tareas de lenguaje, tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-scenario-efficientvit_b1
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset de clasificación de escenarios: https://huggingface.co/datasets/dronefreak/BDD100K-Scenario-Classification
- Modelo base: https://huggingface.co/timm/efficientvit_b1.r224_in1k
- Paper de EfficientViT: https://arxiv.org/abs/2205.14756
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
