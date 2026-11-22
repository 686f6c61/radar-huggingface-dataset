# dronefreak/bdd100k-weather-efficientvit_b1

## Resumen

EfficientViT-B1 finetuneado para clasificación meteorológica sobre BDD100K es un modelo de visión por computador desarrollado por el usuario dronefreak dentro del proyecto BDD100K-Toolkit. Resuelve una tarea concreta: clasificar escenas de conducción en siete categorías meteorológicas (clear, partly cloudy, overcast, rainy, snowy, foggy y unknown) a partir del campo de atributos `weather` del dataset BDD100K. Es relevante para pipelines de conducción autónoma y análisis de vídeo de tráfico, donde conocer las condiciones meteorológicas permite activar estrategias de percepción específicas o filtrar datos por condición.

El modelo parte del checkpoint preentrenado `timm/efficientvit_b1.r224_in1k` y se ha ajustado fino sobre el dataset derivado `dronefreak/BDD100K-Weather-Classification`. Con 7.525.639 parámetros (aproximadamente 7,5 millones) y un peso de repositorio de 0,1 GB, es un clasificador de imagen extremadamente ligero, pensado para inferencia de bajo coste y despliegue en entornos con recursos limitados.

La ficha se centra en los datos publicados por el autor: métricas en el split de test (10.000 imágenes), resultados por clase y una comparativa interna con otros modelos del zoo del toolkit. No hay información publicada sobre composición exacta del entrenamiento, hiperparámetros ni detalles de aumentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT (variante B1, backbone de visión con atención eficiente) |
| Parametros totales | 7.525.639 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen; entrada 224x224 según `r224_in1k`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos principales) y `best.pt` (checkpoint de entrenamiento con EMA) |

## Arquitectura y entrenamiento

El modelo es un EfficientViT-B1, una arquitectura de transformer de visión con atención lineal y bloques ligeros diseñada para eficiencia computacional. Parte del checkpoint `timm/efficientvit_b1.r224_in1k`, preentrenado en ImageNet-1k con resolución 224x224, y se ajusta fino como clasificador de 7 clases para la tarea meteorológica de BDD100K. El cabezal de clasificación se sustituye por uno de 7 salidas; la configuración de preprocesado (tamaño de entrada, media y desviación típica) y los nombres de etiqueta se exponen en `config.json` y se recuperan mediante `model.pretrained_cfg`.

El autor indica que el entrenamiento se realizó dentro de BDD100K-Toolkit, un conjunto de herramientas para preparar BDD100K, entrenar modelos y evaluarlos con las mismas métricas sobre los mismos splits. El checkpoint original `best.pt` conserva pesos EMA y metadatos de entrenamiento y está disponible en el repositorio. No se documentan en la información proporcionada el número de tokens (no aplica), el número de imágenes de entrenamiento, la composición exacta del dataset, la resolución efectiva de entrenamiento, el optimizador, la tasa de aprendizaje, el número de épocas ni si se aplicaron técnicas como RLHF o DPO (no aplicables a un clasificador de imagen). Tampoco se detallan innovaciones técnicas adicionales más allá de la propia arquitectura EfficientViT.

## Capacidades

- Clasificación de imágenes en 7 clases meteorológicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Inferencia sobre imágenes RGB de escenas de conducción, con preprocesado estándar de resize, ToTensor y Normalize según `pretrained_cfg`.
- Salida de probabilidades por clase mediante softmax, útil para umbrales de confianza y filtrado de datos.
- Integración nativa con `timm` mediante `timm.create_model("hf-hub:dronefreak/bdd100k-weather-efficientvit_b1", pretrained=True)`.
- Capacidad de servir como etiquetador automático de condiciones meteorológicas en datasets de vídeo o imagen de tráfico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa, audio ni modo thinking: es exclusivamente un clasificador de imagen.
- Capacidades multilingües: no aplica; las etiquetas de salida están en inglés.

## Casos de uso

- Etiquetado automático de condiciones meteorológicas en datasets de conducción: el modelo clasifica cada frame en una de las 7 categorías, lo que permite enriquecer datasets de vídeo de tráfico con metadatos de clima sin anotación manual, aprovechando su bajo coste computacional (7,5 M de parámetros).
- Filtrado y selección de datos para entrenamiento de percepción: en pipelines de conducción autónoma se puede usar para separar escenas lluviosas, nevadas o con niebla y construir subconjuntos balanceados por condición meteorológica antes de entrenar detectores o segmentadores.
- Activación de estrategias específicas de percepción: en un sistema ADAS, la salida del clasificador puede condicionar el uso de modelos o umbrales adaptados a lluvia o nieve, ya que el modelo distingue estas clases con F1 de 75,86% y 79,63% respectivamente en test.
- Monitorización de flotas y análisis retrospectivo: procesar grabaciones de cámaras de vehículos para generar informes de exposición a condiciones adversas, con inferencia por frame apta para CPU o GPU de gama baja.
- Preprocesado en pipelines MLOps de visión: integrar el modelo como paso previo en un DAG de procesamiento por lotes, usando `timm` y PyTorch, para clasificar grandes volúmenes de imágenes antes de tareas más costosas.
- Prototipado rápido y demos: al ser un modelo de 0,1 GB con licencia Apache-2.0, es adecuado para demos de clasificación meteorológica en notebooks o aplicaciones web ligeras, cargándolo directamente desde el Hub.
- Baseline para experimentos de clasificación en BDD100K: sirve como referencia reproducible dentro de BDD100K-Toolkit para comparar arquitecturas del zoo (TinyViT, EfficientViT-B2/B3, RepViT, ConvNeXt-Atto, etc.) sobre el mismo split de test.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test (10.000 imágenes), no verificados de forma independiente:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 82,67% |
| Top-5 accuracy | 99,80% |
| Macro F1 | 64,95% |
| Balanced accuracy | 63,59% |
| Macro precision | 66,83% |
| Macro recall | 63,59% |

Resultados por clase en test:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 89,74% | 93,30% | 91,49% | 5346 |
| foggy | 0,00% | 0,00% | 0,00% | 13 |
| overcast | 69,11% | 65,54% | 67,27% | 1239 |
| partly cloudy | 66,07% | 65,45% | 65,76% | 738 |
| rainy | 84,90% | 68,56% | 75,86% | 738 |
| snowy | 87,29% | 73,21% | 79,63% | 769 |
| unknown | 70,71% | 79,08% | 74,66% | 1157 |

Comparativa interna del zoo del autor (mismo split de test, ordenada por top-1):

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 83,90% | 68,65% | 67,15% | 74,81% |
| EfficientViT-B3 | 83,51% | 68,17% | 66,34% | 81,75% |
| EfficientViT-B2 | 83,46% | 66,07% | 65,04% | 67,54% |
| EfficientFormerV2-L | 83,27% | 65,93% | 65,03% | 67,12% |
| RepViT-M1.5 | 83,19% | 67,78% | 65,71% | 81,56% |
| EfficientViT-L1 | 83,13% | 65,70% | 65,11% | 66,46% |
| RepViT-M2.3 | 83,02% | 65,46% | 64,33% | 67,02% |
| ConvNeXt-Atto | 83,00% | 67,44% | 65,25% | 81,38% |
| EfficientFormerV2-S2 | 82,90% | 65,50% | 64,68% | 66,98% |
| EfficientViT-B0 | 82, no disponible (tabla truncada) | no disponible | no disponible | no disponible |

El modelo de esta ficha (EfficientViT-B1) no aparece con su fila completa en la tabla del zoo proporcionada; sus métricas individuales son las de la primera tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 7,5 M de parámetros y pesos en fp32, el modelo ocupa aproximadamente 30 MB, por lo que la inferencia en fp32 requiere menos de 1 GB de VRAM incluyendo activaciones y overhead de PyTorch.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1650 pueden ejecutar inferencia sin problemas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1-2 GB de VRAM libre; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: `timm` + PyTorch (vía `hf-hub`), exportación a TorchScript/ONNX no documentada por el autor, y `best.pt` descargable con `hf_hub_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

Comparación con alternativas del mismo zoo del autor, todas evaluadas en el mismo split de test de BDD100K Weather Classification:

| Modelo | Parametros | Top-1 | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientViT-B1 (este) | 7,5 M | 82,67% | 64,95% | Apache-2.0 | Hugging Face (`dronefreak/bdd100k-weather-efficientvit_b1`) |
| EfficientViT-B0 | no disponible | 82, no disponible (tabla truncada) | no disponible | no disponible | Zoo del autor |
| EfficientViT-B2 | no disponible | 83,46% | 66,07% | no disponible | Zoo del autor |
| EfficientViT-B3 | no disponible | 83,51% | 68,17% | no disponible | Zoo del autor |
| TinyViT-21M | no disponible | 83,90% | 68,65% | no disponible | Zoo del autor |
| RepViT-M1.5 | no disponible | 83,19% | 67,78% | no disponible | Zoo del autor |
| ConvNeXt-Atto | no disponible | 83,00% | 67,44% | no disponible | Zoo del autor |

No se dispone de datos de benchmarks de modelos externos al zoo del autor sobre este mismo dataset y split, por lo que la comparación con alternativas de otros proveedores no está disponible.

## Limitaciones y advertencias

- La clase `foggy` no se clasifica correctamente en ningún caso: 0,00% de precision, recall y F1 sobre 13 imágenes de test. El propio autor indica que debe tratarse como no soportada.
- El macro F1 (64,95%) es notablemente inferior al top-1 accuracy (82,67%), lo que refleja un desequilibrio fuerte entre clases: `clear` concentra 5346 de las 10.000 imágenes de test y alcanza F1 de 91,49%, mientras que clases minoritarias como `partly cloudy` y `overcast` rondan el 65-67%.
- Riesgo de sesgo hacia la clase mayoritaria (`clear`) y hacia condiciones bien representadas; el rendimiento en condiciones raras o poco frecuentes puede degradarse.
- Riesgo de alucinación en sentido de falsos positivos/negativos: el modelo puede asignar una clase meteorológica con alta confianza en escenas ambiguas o fuera de distribución (por ejemplo, imágenes nocturnas, interiores o de otras cámaras).
- Limitación de dominio: entrenado sobre BDD100K, con cámaras y condiciones de captura específicas; el rendimiento puede no transferirse a otros datasets, países o montajes de cámara.
- No hay información sobre el número de imágenes de entrenamiento, la composición del split de entrenamiento ni el balanceo aplicado, lo que limita la reproducibilidad.
- Las métricas están declaradas por el autor y marcadas como no verificadas (`verified: false`); no han sido validadas de forma independiente.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no obstante, el dataset BDD100K tiene sus propias condiciones de uso que deben revisarse por separado.
- No apto para tareas generativas, razonamiento, texto, código ni agentes; cualquier uso fuera de clasificación de imagen no está soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-weather-efficientvit_b1
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset de clasificación meteorológica: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Modelo base en timm: https://huggingface.co/timm/efficientvit_b1.r224_in1k
- Paper de EfficientViT: https://arxiv.org/abs/2205.14756
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Checkpoint de entrenamiento: https://huggingface.co/dronefreak/bdd100k-weather-efficientvit_b1/resolve/main/best.pt
- Demo (vídeo): https://huggingface.co/dronefreak/bdd100k-weather-efficientvit_b1/resolve/main/assets/demo_banner.mp4
