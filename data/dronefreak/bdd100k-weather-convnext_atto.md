# dronefreak/bdd100k-weather-convnext_atto

## Resumen

ConvNeXt-Atto finetuneado sobre BDD100K Weather Classification es un clasificador de imagenes de 7 clases (clear, partly cloudy, overcast, rainy, snowy, foggy y unknown) desarrollado por el usuario dronefreak y publicado bajo licencia Apache 2.0. No es un modelo de lenguaje: parte del backbone `timm/convnext_atto.d2_in1k`, un ConvNeXt de escala "atto" con 3,4 millones de parametros, y lo reentrena para predecir la condicion meteorologica a partir de una unica imagen de escena de conduccion. Se ha entrenado y evaluado dentro del proyecto BDD100K-Toolkit, un conjunto de utilidades para preparar el dataset BDD100K, entrenar modelos sobre el y evaluarlos con las mismas metricas y los mismos splits.

El modelo resuelve un problema concreto y habitual en pipelines de vision para conduccion autonoma: disponer de una etiqueta de clima fiable y barata a nivel de fotograma, sin depender de metadatos externos ni de sensores. Con solo 3,4 M de parametros, su interes practico es servir como componente ligero que puede ejecutarse en tiempo real sobre hardware modesto, o como baseline reproducible para comparar arquitecturas sobre la misma tarea.

La relevancia ahora mismo es doble: por un lado, aparece como referencia dentro del model zoo del propio autor, donde encabeza la tabla de Top-1 con un 83,00 %; por otro, la tarea es "no oficial", derivada del campo `attributes.weather` de BDD100K y alineada con un dataset de Kaggle del mismo nombre, lo que la convierte en un benchmark util pero no estandarizado de facto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Atto (ConvNeXt de escala atto, `timm/convnext_atto.d2_in1k`) |
| Parametros totales | 3,4 M (segun badge de la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada fija de 224 x 224 px) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; en FP32 el checkpoint ocupa aproximadamente 13,6 MB) |
| Idiomas soportados | no aplica; las etiquetas de clase estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (`best.pt`) con `state_dict`, ademas de `model_name`, `class_names`, `imgsz`, `mean` y `std`; cargable con `timm` |

## Arquitectura y entrenamiento

La arquitectura es una ConvNeXt en su variante mas pequena, "atto", definida en `timm`. ConvNeXt es una red convolucional pura modernizada con inspiracion en los Vision Transformers: emplea depthwise convolution de gran kernel, normalizacion LayerNorm, activacion GELU y una estructura en cuatro etapas con proporciones tipo 1:1:3:1. La variante atto reduce drasticamente los canales y el numero de bloques, por lo que queda en 3,4 M de parametros: es una red pensada para inferencia muy economica.

El entrenamiento se realizo como fine-tuning supervisado sobre el dataset BDD100K Weather Classification (7 clases derivadas del campo `attributes.weather`). Segun la model card: 50 epocas maximas, 15 epocas efectivamente entrenadas, mejor epoca en la quinta, seleccion de `best.pt` por `macro_f1` en la particion de validacion, paciencia de early stopping de 10, batch size 128, imagenes de 224 x 224 y optimizador AdamW resuelto automaticamente. La model card esta truncada en la descripcion del optimizador, por lo que el learning rate y el scheduler no estan disponibles en la informacion proporcionada. No se documenta ningun tipo de alineamiento (RLHF, DPO) ni tecnicas de destilacion, aumento de datos o decodificacion especulativa, que en cualquier caso no aplican a una tarea de clasificacion.

## Capacidades

- Clasificacion de escenas de conduccion en 7 categorias meteorologicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Inferencia a nivel de fotograma suelto: recibe una imagen RGB y devuelve una distribucion de probabilidad sobre las 7 clases.
- Ejecucion sobre CPU y GPU sin requisitos de memoria apreciables, gracias a sus 3,4 M de parametros.
- Integracion directa con `timm` y PyTorch, con un unico checkpoint autocontenido que incluye nombres de clase y parametros de preprocesado.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-step: es un clasificador de vision puro.
- No tiene capacidades multilingues ni generacion de texto; no procesa lenguaje natural ni audio.
- Capacidad especial reseñable: deteccion de la clase `unknown`, que actua como categoria de rechazo para condiciones que no encajan en las etiquetas definidas.

## Casos de uso

- Preprocesado condicionado por clima en pipelines de conduccion autonoma: etiquetar cada fotograma con su condicion meteorologica para separar lotes de validacion, ponderar muestras o activar modos de conduccion conservadores cuando la prediccion es rainy, snowy o foggy.
- Enrutado de datos en plataformas de anotacion: usar la etiqueta de clima para balancear la seleccion de imagenes que se envian a anotadores humanos, evitando sesgos hacia escenas despejadas.
- Baselines de investigacion en vision por computador: por su tamano (3,4 M de parametros) y su licencia Apache 2.0 es un punto de partida barato para comparar nuevas tecnicas de fine-tuning sobre la misma tarea y el mismo split.
- Sistemas embebidos y edge computing en vehiculo: al ocupar aproximadamente 13,6 MB en FP32, cabe en modulos con memoria muy limitada y puede ejecutarse en CPU a 224 x 224 px.
- Filtrado previo en recoleccion de datos de flotas: descartar o marcar fotogramas nocturnos o adversos en el momento de la captura para reducir el volumen de almacenamiento y el coste de anotacion.
- Analisis retrospectivo de grabaciones de dashcam: clasificar automaticamente miles de fotogramas por clima para construir estadisticas de exposicion a condiciones adversas de una ruta o de un conductor.
- Control de calidad de datasets: detectar imagenes mal etiquetadas comparando la prediccion del modelo con los metadatos de clima originales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false` en el model-index). Evaluacion sobre el split `test`, que segun el post del autor corresponde al conjunto de validacion oficial de BDD100K, con 10 000 imagenes.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 83,00 % |
| Top-5 accuracy | 99,85 % |
| Macro F1 | 67,44 % |
| Balanced accuracy | 65,25 % |
| Macro precision | 81,38 % |
| Macro recall | 65,25 % |

Desglose por clase en el mismo split `test`:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 90,28 % | 93,12 % | 91,68 % | 5346 |
| foggy | 100,00 % | 7,69 % | 14,29 % | 13 |
| overcast | 67,64 % | 69,17 % | 68,40 % | 1239 |
| partly cloudy | 67,75 % | 65,18 % | 66,44 % | 738 |
| rainy | 87,06 % | 67,48 % | 76,03 % | 738 |
| snowy | 84,79 % | 76,85 % | 80,63 % | 769 |
| unknown | 72,15 % | 77,27 % | 74,62 % | 1157 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El checkpoint pesa aproximadamente 13,6 MB en FP32 y la activacion a 224 x 224 px es despreciable (estimacion propia a partir del numero de parametros; no publicada por el autor).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo. Funciona sin problema en RTX 4090, RTX 3090, A100 o H100, y tambien en GPUs de gama baja e integradas.
- Compatibilidad con GPU de consumo: si, en todas. Tambien es viable en CPU exclusivamente, sin GPU.
- Opciones de despliegue: PyTorch + `timm` es la via documentada en la model card (carga de `best.pt` con `torch.load` y construccion del modelo con `timm.create_model`). Tambien es exportable a ONNX o TorchScript para entornos de produccion, aunque el autor no documenta estas rutas. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La model card menciona un video de demostracion con predicciones sobre dos clips de test de BDD100K, pero sin cifras de latencia o FPS.

## Comparativa con modelos similares

La model card incluye un model zoo con todos los modelos evaluados sobre el mismo split `test` y con las mismas metricas. Todos ellos son alternativas de la misma categoria (clasificadores ligeros de imagen para la misma tarea).

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| ConvNeXt-Atto (este modelo) | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| EfficientViT-B0 | 82,79 % | 65,10 % | 63,62 % | 67,11 % |
| ResNet-18 | 82,19 % | 64,30 % | 62,97 % | 66,08 % |
| MobileNetV4-Conv-Small | 82,16 % | 66,51 % | 64,37 % | 80,44 % |
| YOLO26n | 82,04 % | 64,09 % | 62,46 % | 66,57 % |
| YOLO11n | 81,32 % | 62,91 % | 61,19 % | 65,68 % |
| YOLOv8n | 81,22 % | 63,07 % | 61,42 % | 65,52 % |

ConvNeXt-Atto y MobileNetV4-Conv-Small destacan sobre el resto en macro precision (81,38 % y 80,44 % frente a valores en torno al 66 % de las demas arquitecturas), lo que sugiere un comportamiento mas equilibrado entre clases. En Top-1 las diferencias son estrechas: apenas 1,8 puntos porcentuales separan al primero del ultimo. Los datos de parametros, contexto o licencia de los modelos competidores no estan disponibles en la informacion proporcionada, salvo que todos forman parte del mismo model zoo evaluado por el autor.

## Limitaciones y advertencias

- Rendimiento desequilibrado por clase. La clase foggy obtiene un 100 % de precision pero solo un 7,69 % de recall y un F1 de 14,29 %, con unicamente 13 imagenes de test. El modelo practicamente no detecta niebla: el dato de precision es enganoso por el desbalanceo extremo.
- Las clases overcast y partly cloudy se confunden con frecuencia (F1 de 68,40 % y 66,44 % respectivamente), probablemente por la ambiguedad visual entre ambos estados.
- Top-1 del 83,00 % con un Top-5 del 99,85 % indica que, cuando falla, la respuesta correcta suele estar entre las mas probables, pero el modelo no resuelve bien los casos dificiles como clasificador de etiqueta unica.
- Riesgo de clasificacion erronea ante imagenes nocturnas, con baja visibilidad o dominadas por iluminacion artificial, condiciones no analizadas en el desglose por clase.
- Tarea no oficial: las etiquetas se derivan del campo `attributes.weather` de BDD100K y siguen un dataset de Kaggle, no un benchmark estandarizado. La comparacion con otros trabajos externos al model zoo del autor es arriesgada.
- Las metricas declaradas no estan verificadas por un tercero (`verified: false` en el model-index).
- Sesgo geografico y de dominio: entrenado sobre BDD100K (principalmente Estados Unidos), no hay garantia de generalizacion a otras regiones, condiciones de trafico o camaras.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No hay restricciones de uso comercial documentadas.
- La informacion disponible esta truncada en la seccion de entrenamiento, por lo que faltan hiperparametros clave (learning rate, scheduler, politica de aumento de datos) para reproducir el resultado.
- El repositorio figura con 0 descargas y 0 likes, y un tamano de 0,0 GB, lo que apunta a un modelo recien publicado y sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-convnext_atto
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset de entrenamiento: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Post del autor sobre el model zoo de BDD100K: https://huggingface.co/posts/dronefreak/988753800362571
- Modelo base: https://huggingface.co/timm/convnext_atto.d2_in1k
- Toolkit oficial de BDD100K: https://github.com/bdd100k/bdd100k
- Model zoo de BDD100K (SysCV): https://github.com/SysCV/bdd100k-models
- Dataset BDD100K en Ultralytics: https://platform.ultralytics.com/ultralytics/datasets/bdd100k
- Paper de ConvNeXt (arXiv:2201.03545): https://arxiv.org/abs/2201.03545
- Paper de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
