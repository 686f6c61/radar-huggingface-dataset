# dronefreak/bdd100k-period-convnext_atto

## Resumen

El modelo `dronefreak/bdd100k-period-convnext_atto` es un clasificador de imágenes especializado en determinar el momento del día en escenas de conducción. Se trata de un ajuste fino de ConvNeXt-Atto, la variante más pequeña de la familia ConvNeXt disponible en la librería `timm`, sobre el conjunto de datos BDD100K Period (Time-of-Day) Classification. Con solo 3,4 millones de parámetros, resuelve una tarea de clasificación de 4 clases: `daytime`, `night`, `dawn or dusk` y `unknown`, derivada del campo `attributes.timeofday` de cada imagen de BDD100K.

El modelo lo publica el usuario dronefreak como parte del proyecto BDD100K-Toolkit, una herramienta sin dependencias pesadas para preparar BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones. La tarea es no oficial y sigue la nomenclatura del conjunto de datos homónimo publicado en Kaggle. Su relevancia práctica radica en que ofrece, con un coste computacional mínimo, una señal de contexto temporal que otros sistemas de conducción autónoma (detección, segmentación, planificación) pueden consumir como entrada auxiliar.

El modelo reporta un 93,95 % de top-1 accuracy y un 80,75 % de macro F1 sobre 10 000 imágenes del split de test. Es relevante ahora porque demuestra que arquitecturas convolucionales de menos de 4 M de parámetros pueden competir con alternativas como YOLO11n-cls o EfficientViT-B0 en tareas de clasificación de escena para conducción, manteniendo un coste de despliegue compatible con hardware embarcado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Atto (CNN pura con diseño inspirado en transformer: stem con patchify, convoluciones depthwise, LayerNorm, GELU, bottleneck invertido) |
| Parametros totales | 3,4 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imagen; entrada de 224 x 224 píxeles) |
| Tipos de cuantizacion | No disponible. El checkpoint se distribuye en precisión de entrenamiento; no se documentan pesos cuantizados |
| Idiomas soportados | No aplica (modelo de visión; las etiquetas de clase están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch (`best.pt` con `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std`) |

## Arquitectura y entrenamiento

La base es ConvNeXt, una red neuronal convolucional que adopta decisiones de diseño propias de los transformers (parcheo tipo ViT en el stem, normalización LayerNorm en lugar de BatchNorm, activación GELU, bloques con bottleneck invertido y convoluciones depthwise de kernel 7x7). La variante Atto es la de menor tamaño de la familia dentro de `timm`, con aproximadamente 3,4 M de parámetros, lo que la sitúa en el rango de los clasificadores móviles. El modelo se instancia con `timm.create_model` y una cabeza de clasificación de 4 salidas, y el preprocesado esperado se recupera del propio checkpoint (redimensionado a 224 x 224, `ToTensor` y normalización con la media y desviación típica almacenadas).

El ajuste fino se realizó durante 23 épocas sobre un máximo de 50, con parada temprana de paciencia 10, batch de 128 imágenes y AdamW con learning rate máximo de 3e-4. Los pesos finales emplean media móvil exponencial (EMA) y el checkpoint `best.pt` se seleccionó por macro F1 sobre el split de validación (mejor época: la 13). El conjunto de datos de origen es BDD100K, el mayor dataset abierto de vídeo de conducción con 100 000 vídeos, más de 1000 horas de conducción y más de 100 millones de fotogramas; la etiqueta de clase se deriva de la anotación por imagen `attributes.timeofday` y no se documentan en la información disponible técnicas adicionales como decodificación especulativa, atención lineal ni fases de RLHF o DPO (no aplicables a un clasificador supervisado).

## Capacidades

- Clasificación de imagen en 4 clases de momento del día: `daytime`, `night`, `dawn or dusk` y `unknown`.
- Inferencia sobre imágenes individuales de escenas de conducción a 224 x 224 píxeles.
- Salida de probabilidades por clase mediante `softmax` sobre los logits, lo que permite umbralizar y aplicar criterios de confianza.
- Integración directa con `timm` y PyTorch; el checkpoint incluye metadatos de instanciación y preprocesado, lo que simplifica su reutilización.
- Inferencia puramente de visión: no soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- Capacidades multilingües: no aplica; las etiquetas están únicamente en inglés.
- Capacidades especiales: no documentadas más allá de la clasificación (no hay modo de razonamiento, visión aumentada, audio ni detección de objetos).

## Casos de uso

- Enrutado de pipelines de conducción autónoma: la clase predicha se puede usar como señal de contexto (por ejemplo, activar modos de procesamiento nocturnos o ajustar umbrales de detección), gracias a la baja latencia de un modelo de 3,4 M de parámetros.
- Curado y etiquetado de datasets de conducción: clasificar automáticamente los fotogramas de BDD100K u otras colecciones por franja horaria para construir subconjuntos equilibrados o sesgados deliberadamente hacia condiciones nocturnas y de crepúsculo.
- Analítica de vídeo urbano: etiquetar flujos de cámaras de tráfico con la condición de iluminación para generar informes agregados por franja horaria a lo largo del día.
- Preprocesado para modelos de detección y segmentación: condicionar el comportamiento de un detector aguas abajo (por ejemplo, escalado de entrada o selección de pesos) en función de si la escena es diurna o nocturna.
- Visión embarcada de bajo consumo: al ocupar unos pocos megabytes en memoria, puede ejecutarse en dispositivos tipo NVIDIA Jetson, Raspberry Pi con acelerador o NPUs de vehículo para tareas auxiliares en tiempo real.
- Control de sistemas de iluminación y HMI del vehículo: usar la predicción de `night` o `dawn or dusk` como entrada a sistemas de encendido automático de luces o de ajuste del interfaz del conductor.
- Priorización de clips para revisión humana: en pipelines de anotación, ordenar automáticamente los clips por condición de iluminación para asignar anotadores especializados a los casos más difíciles (amanecer y atardecer).
- Investigación en robustez y domain shift: servir de línea base ligera para estudiar la degradación de modelos de clasificación de escena al transferir entre dominios geográficos, meteorológicos o de sensor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Evaluación sobre el split de test, con 10 000 imágenes.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,95 % |
| Macro F1 | 80,75 % |
| Balanced accuracy | 76,82 % |
| Macro precision | 86,39 % |
| Macro recall | 76,82 % |

Desglose por clase sobre el split de test:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 70,63 % | 55,01 % | 61,85 % | 778 |
| daytime | 93,75 % | 96,35 % | 95,03 % | 5258 |
| night | 97,86 % | 98,78 % | 98,32 % | 3929 |
| unknown | 83,33 % | 57,14 % | 67,80 % | 35 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial, pero con 3,4 M de parámetros en fp32 el checkpoint ocupa aproximadamente 13,6 MB (unos 6,8 MB en fp16) y las activaciones a 224 x 224 son mínimas; la inferencia puede caber en menos de 1 GB de VRAM en cualquier configuración razonable.
- GPU recomendadas: cualquier GPU, incluida una NVIDIA RTX 4090, una A100 o una H100, aunque el modelo queda enormemente sobredimensionado para ese hardware. Su rango natural son GPUs integradas, NVIDIA Jetson (Nano, Orin), Apple Silicon o incluso CPU.
- Caben en GPU de consumo: sí, en cualquier GPU moderna y también en muchas integradas; el cuello de botella será el preprocesado de imagen en CPU, no el modelo.
- Opciones de despliegue: PyTorch con `timm` es la vía documentada por el autor. Al ser un grafo PyTorch estándar, también es exportable a TorchScript, ONNX o TensorRT para despliegue en producción, aunque no se documentan conversiones oficiales. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones oficiales de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

Comparativa sobre la misma tarea y el mismo split de test, según la tabla "Model Zoo" publicada por el autor. Todos los modelos comparten licencia y formato (no disponibles en la tabla de origen) y parámetros del orden de los millones.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| **convnext_atto** | **93,95 %** | **80,75 %** | **76,82 %** | **86,39 %** |
| yolo11n-cls | 93,79 % | 80,13 % | 75,19 % | 88,20 % |
| efficientvit_b0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| yolo26n-cls | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| mobilenetv4_conv_small | 93,57 % | 80,22 % | 76,22 % | 86,06 % |
| yolov8n-cls | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| resnet18 | 93,32 % | 80,50 % | 76,72 % | 85,87 % |

Todas las diferencias son estrechas (menos de 0,7 puntos de top-1 entre el primero y el último). EfficientViT-B0 obtiene mejor macro F1 y balanced accuracy que ConvNeXt-Atto, por lo que la ventaja de este último se limita a la accuracy global.

## Limitaciones y advertencias

- Desequilibrio de clases severo: la clase `unknown` solo cuenta con 35 imágenes de test, por lo que sus métricas son estadísticamente poco fiables.
- Rendimiento débil en crepúsculo: `dawn or dusk` alcanza solo un 55,01 % de recall y un F1 de 61,85 %, lo que indica confusión frecuente con las clases `daytime` y `night`.
- Riesgo de sesgo geográfico y de sensor: BDD100K se grabó principalmente en Estados Unidos y la etiqueta `timeofday` es una anotación humana; el modelo puede degradarse en dominios distintos (otras regiones, otras cámaras, condiciones meteorológicas extremas).
- Sesgo hacia las clases mayoritarias: la accuracy global del 93,95 % está inflada por el peso de `daytime` y `night`; conviene evaluar con métricas balanceadas en producción.
- Benchmarks no verificados: todas las métricas están marcadas como `verified: false`, son autorreportadas y no han sido reproducidas de forma independiente.
- Adopción nula: el repositorio acumula 0 descargas y 0 "likes", por lo que no existe validación por parte de la comunidad.
- Tarea no oficial: la clasificación de periodo derivada de `attributes.timeofday` no es una tarea oficial de BDD100K, lo que dificulta la comparación con literatura publicada.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de BDD100K, cuyo uso está sujeto a los términos propios del dataset; conviene revisar las condiciones del conjunto de datos original antes de un despliegue comercial.
- Caveat de despliegue: el checkpoint requiere instanciar el modelo con `timm` y cargar el `state_dict` manualmente; no se publican conversiones a formatos de inferencia alternativos ni versiones cuantizadas.
- El preprocesado debe replicar exactamente el `imgsz`, `mean` y `std` almacenados en el checkpoint; usar otros valores degradará el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-convnext_atto
- Dataset en HuggingFace: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Modelo relacionado (YOLOv9t sobre BDD100K): https://huggingface.co/dronefreak/bdd100k-yolov9t
- Model Zoo oficial de BDD100K: https://github.com/SysCV/bdd100k-models
- Toolkit oficial de BDD100K: https://github.com/bdd100k/bdd100k
- Sitio del dataset BDD100K (Berkeley DeepDrive): http://bdd-data.berkeley.edu/
- Paper de ConvNeXt, "A ConvNet for the 2020s": https://arxiv.org/abs/2201.03545
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
