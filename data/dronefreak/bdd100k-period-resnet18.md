# dronefreak/bdd100k-period-resnet18

## Resumen

El modelo `dronefreak/bdd100k-period-resnet18` es un clasificador de imágenes basado en ResNet-18, ajustado por el usuario dronefreak para una tarea de clasificación de momento del día (time-of-day) en escenas de conducción. A partir de una imagen RGB de 224x224 píxeles, predice una de cuatro clases: daytime, night, dawn or dusk y unknown. Las etiquetas derivan del campo `attributes.timeofday` del dataset BDD100K y la tarea sigue la definición del dataset de Kaggle del mismo nombre; se trata de una tarea no oficial dentro del ecosistema BDD100K.

El modelo forma parte de BDD100K-Toolkit, una herramienta de código abierto orientada a preparar BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones. Con 11,2 millones de parámetros y un peso de repositorio de 0,1 GB, es un clasificador muy ligero, pensado para servir como componente auxiliar en pipelines de conducción autónoma (etiquetado de metadatos, enrutado condicional por iluminación o curaduría de datasets) más que como modelo principal.

Su relevancia es práctica: ofrece un punto de referencia reproducible y de bajo coste computacional para una tarea auxiliar habitual en visión por computador aplicada a vehículos. Declara un 93,32 % de top-1 accuracy y un 80,50 % de macro F1 en el split de test de 10 000 imágenes, aunque se trata de resultados no verificados de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales), 18 capas |
| Parametros totales | 11,2 M |
| Longitud de contexto | no aplica (clasificador de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de imagen, sin texto) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de PyTorch (`best.pt`, con `model_name`, `state_dict`, `class_names`, `imgsz`, `mean` y `std`) |

## Arquitectura y entrenamiento

La arquitectura es ResNet-18, una red neuronal convolucional con conexiones residuales descrita en el paper arXiv:1512.03385. El modelo se ha ajustado (fine-tuning) para clasificación de 4 clases, con entrada de 224x224 píxeles y normalización propia almacenada en el propio checkpoint. Se integra en la librería `timm`, que permite instanciar la arquitectura con `timm.create_model` y cargar el `state_dict` del checkpoint. No se especifica en la model card si el punto de partida fue un ResNet-18 preentrenado en ImageNet.

El entrenamiento se realizó con un máximo de 50 épocas, de las cuales se ejecutaron 22, con la mejor época en la 12 y una paciencia de early stopping de 10. Se usó batch size de 128, tamaño de imagen 224, optimizador resuelto automáticamente a AdamW con learning rate pico de 3e-04 y pesos EMA. El checkpoint `best.pt` se seleccionó por macro F1 sobre el split de validación. El dataset de entrenamiento es `dronefreak/BDD100K-Period-Classification`, y la evaluación declarada se hizo sobre el split de test de 10 000 imágenes. No se detalla la composición completa de los splits de entrenamiento y validación ni el número total de imágenes de entrenamiento.

## Capacidades

- Clasificación de imágenes de escenas de conducción en 4 clases de momento del día: daytime, night, dawn or dusk y unknown.
- Salida de probabilidades por clase mediante softmax sobre los logits, lo que permite aplicar umbrales de confianza.
- Inferencia de muy bajo coste: 11,2 M de parámetros y entrada de 224x224.
- Integración directa con `timm` y con el flujo de carga vía `huggingface_hub` mostrado en la model card.
- Uso como clasificador auxiliar para etiquetado automático de metadatos en datasets de conducción.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni modo de pensamiento.
- No dispone de capacidades multilingües, de audio ni de vídeo de forma nativa (trabaja imagen a imagen).

## Casos de uso

- Etiquetado automático de metadatos en datasets de conducción: dado un conjunto de imágenes sin el campo `timeofday`, el modelo asigna una clase de franja horaria, lo que permite reconstruir o completar metadatos a bajo coste y validar anotaciones existentes.
- Enrutado condicional en pipelines de percepción: en un sistema con detectores o segmentadores específicos para condiciones nocturnas, el modelo decide en la primera etapa qué rama del pipeline activar, aprovechando su latencia reducida.
- Curaduría y balanceo de datasets: identificar y separar imágenes nocturnas, diurnas y de amanecer/atardecer para construir splits equilibrados o para auditar la cobertura temporal de un dataset antes de entrenar otro modelo.
- Análisis de robustez de modelos de percepción: agrupar los resultados de evaluación por condición de iluminación y medir la caída de precisión de un detector entre daytime (F1 94,51 % de referencia en esta tarea) y dawn or dusk (F1 58,11 %), una de las condiciones más difíciles.
- Preprocesado en sistemas embebidos y ADAS: al ser un modelo de 11,2 M de parámetros, cabe en dispositivos con recursos limitados y puede usarse para ajustar parámetros de captura, como la exposición o el tratamiento ISP según la franja horaria detectada.
- Análisis de flotas y dashcams: procesar grandes volúmenes de grabaciones para generar estadísticas de conducción nocturna o diurna, útil en informes de seguridad y en la selección de clips para revisión humana.
- Componente de referencia para investigación en clasificación con desbalanceo: el desbalance extremo entre clases (5 258 imágenes daytime frente a 35 unknown en test) lo convierte en un caso útil para probar estrategias de reponderación, aumentación o pérdidas sensibles al desbalance.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test (10 000 imágenes), no verificados de forma independiente:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,32 % |
| Macro F1 | 80,50 % |
| Balanced accuracy | 76,72 % |
| Macro precision | 85,87 % |
| Macro recall | 76,72 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 64,77 % | 52,70 % | 58,11 % | 778 |
| daytime | 93,42 % | 95,63 % | 94,51 % | 5 258 |
| night | 97,78 % | 98,57 % | 98,17 % | 3 929 |
| unknown | 87,50 % | 60,00 % | 71,19 % | 35 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 45 MB en FP32 (11,2 M de parámetros). Con batch pequeño, el consumo total se mantiene por debajo de 1 GB; con batch 128 a 224x224, se estima en torno a 1-2 GB, aunque no se publican medidas oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores. Para lotes grandes, una RTX 4090, A100 o H100 aportan margen sobrado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en CPU para inferencia de imágenes individuales.
- Opciones de despliegue: PyTorch y `timm` de forma nativa; exportación a TorchScript, ONNX Runtime, TensorRT, OpenVINO o NCNN para entornos embebidos. No aplica llama.cpp, Ollama, vLLM ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; la model card no publica medidas de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

Todos los modelos de la tabla siguiente fueron evaluados por el autor sobre el mismo split de test de 10 000 imágenes, ordenados por top-1 accuracy. Los datos de parámetros y licencia de los modelos alternativos no están disponibles en la información proporcionada.

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision | Parametros |
|---|---|---|---|---|---|
| convnext_atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % | no disponible |
| yolo11n-cls | 93,79 % | 80,13 % | 75,19 % | 88,20 % | no disponible |
| efficientvit_b0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % | no disponible |
| yolo26n-cls | 93,61 % | 80,41 % | 77,72 % | 83,88 % | no disponible |
| mobilenetv4_conv_small | 93,57 % | 80,22 % | 76,22 % | 86,06 % | no disponible |
| yolov8n-cls | 93,56 % | 80,85 % | 76,26 % | 87,87 % | no disponible |
| resnet18 (este modelo) | 93,32 % | 80,50 % | 76,72 % | 85,87 % | 11,2 M |

## Limitaciones y advertencias

- Las métricas declaradas están marcadas como no verificadas (`verified: false`) y proceden del propio autor; no hay validación independiente ni comparación con literatura externa.
- La clase dawn or dusk es claramente la más débil (F1 58,11 %, recall 52,70 %), por lo que las predicciones en amanecer y atardecer deben tratarse con cautela, especialmente si se usan para enrutado automático.
- La clase unknown apenas está representada en test (35 imágenes), lo que hace poco fiable su rendimiento declarado (F1 71,19 %) y limita el uso del modelo para detectar casos atípicos.
- Existe un desbalance de clases muy acusado (daytime y night concentran más del 91 % de las imágenes de test), lo que explica la diferencia entre top-1 (93,32 %) y macro F1 (80,50 %) y penaliza el rendimiento en clases minoritarias.
- Dominio restringido: el modelo se ha entrenado y evaluado sobre escenas de conducción de BDD100K, por lo que su generalización a otros dominios, países, condiciones meteorológicas o sensores no está medida.
- Riesgo de fuga de datos si se aplica sobre imágenes de BDD100K que pudieran solaparse con los splits de entrenamiento; conviene verificar la partición antes de usarlo como etiquetador.
- Sesgos potenciales derivados del dataset original: geografía, condiciones de captura, clima y distribución temporal de BDD100K condicionan sus predicciones.
- La licencia del modelo es Apache-2.0, que permite uso comercial, pero el dataset original BDD100K tiene sus propias condiciones de uso y conviene revisarlas antes de explotar comercialmente un modelo entrenado sobre él.
- Al ser un clasificador de imágenes, no genera texto ni código, no soporta tool calling ni razonamiento multi-paso, y no admite instrucciones en lenguaje natural.
- No se especifican tipos de cuantización soportados ni medidas de latencia; cualquier despliegue en producción requiere medir el rendimiento real en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-resnet18
- Dataset de clasificación: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Paper de ResNet (arXiv:1512.03385): https://arxiv.org/abs/1512.03385
- Paper de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces encontrados correspondían a contenidos sin relación con la ficha.
