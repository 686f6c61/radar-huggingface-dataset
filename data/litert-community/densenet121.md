# litert-community/densenet121

## Resumen

DenseNet-121 es una red neuronal convolucional para clasificación de imágenes, originalmente publicada por Huang et al. (2017) y popularizada por su implementación en TorchVision. Este repositorio, mantenido por la comunidad `litert-community`, distribuye una conversión del modelo a formato LiteRT/TFLite, pensada para despliegue en dispositivos móviles, embebidos y aceleradores NPU. El modelo resuelve la tarea de clasificación de imágenes sobre las 1.000 clases de ImageNet-1K.

La relevancia de esta ficha no reside en el modelo en sí (una arquitectura de 2017 ampliamente conocida), sino en el empaquetado: se ofrecen tres variantes TFLite (FP32, cuantización dinámica y cuantización estática INT8 con pesos channelwise) con una tabla explícita de compatibilidad CPU/GPU/NPU. Esto facilita la integración en pipelines de inferencia en el borde sin necesidad de exportar el modelo manualmente.

El repositorio es pequeño (0,1 GB) y tiene un uso moderado (187 descargas, 2 likes en el momento de la consulta). La licencia no está declarada en la información disponible, lo que constituye una limitación importante para uso comercial. No se proporcionan datos de entrenamiento, hiperparámetros ni resultados de benchmarks más allá de la comparación interna entre variantes de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (CNN con conexiones densas, 121 capas) |
| Parametros totales | no disponible en la informacion proporcionada (la arquitectura DenseNet-121 de referencia tiene ~7,98 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (TFLite estandar), cuantizacion dinamica (wi8/afp32), INT8 estatica channelwise |
| Idiomas soportados | no aplica (clasificacion de imagenes; etiquetas de ImageNet en ingles) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`.tflite`); no se distribuyen safetensors ni GGUF |
| Entrada | imagen (resolucion no especificada en la model card) |
| Salida | 1.000 logits (ImageNet-1K) |
| Dataset de referencia | imagenet-1k |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

DenseNet-121 es una red convolucional en la que cada capa recibe como entrada las salidas de todas las capas anteriores dentro del mismo bloque (conexiones densas), lo que reduce el numero de parametros frente a ResNet de profundidad comparable y favorece la reutilizacion de caracteristicas. La arquitectura incluye bloques densos separados por capas de transicion con pooling y una capa de clasificacion final con softmax sobre 1.000 clases.

Este repositorio no entrena el modelo: es una conversion del `densenet121` de TorchVision a LiteRT. Por tanto, los datos de entrenamiento corresponden al preentrenamiento original sobre ImageNet-1K (1,28 M imagenes de entrenamiento, 50.000 de validacion). No se documenta en la model card si se aplico aumento de datos adicional, destilacion, fine-tuning o tecnicas de RLHF (no aplicables a clasificacion). La innovacion tecnica del repositorio es la conversion: la variante INT8 estatica usa escalas de activacion compartidas para reducir el tamano del grafo, con una perdida medida de 0,20 puntos porcentuales en top-5 sobre una comprobacion de 10.000 imagenes en CPU frente a escalas separadas.

## Capacidades

- Clasificacion de imagenes en 1.000 clases de ImageNet-1K (prediccion de logits por imagen).
- Inferencia en CPU, GPU y NPU segun la variante: FP32 en CPU y GPU; INT8 channelwise en CPU y NPU (Qualcomm y MediaTek), no en GPU.
- Ejecucion en dispositivos de borde mediante el runtime LiteRT/TFLite.
- Cuantizacion dinamica para reducir peso y latencia en CPU con perdida minima de precision.
- Cuantizacion estatica INT8 para aceleracion en NPU con perdida documentada de 0,20 pp en top-5.
- No soporta tool calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni generacion de texto: es exclusivamente un clasificador de imagenes.

## Casos de uso

- Clasificacion de imagenes en aplicaciones moviles Android/iOS: el modelo TFLite se integra con el runtime LiteRT y permite etiquetar fotos del usuario en el dispositivo, sin enviar datos a la nube.
- Moderacion de contenido en el borde: filtrado previo de imagenes por categoria (por ejemplo, deteccion de contenido no deseado) en gateways o camaras IP con NPU Qualcomm/MediaTek, usando la variante INT8.
- Etiquetado automatico de fotos en bibliotecas personales: generacion de metadatos de las 1.000 clases ImageNet para indexacion y busqueda local.
- Preprocesamiento en pipelines de vision industrial: clasificacion rapida de piezas o productos en lineas de fabricacion con hardware embebido, donde el modelo FP32 o INT8 cabe en memoria limitada.
- Filtrado y triaje en datasets de imagenes: clasificacion masiva de imagenes para separar categorias antes de un etiquetado humano o de un modelo mayor, aprovechando el bajo coste de inferencia.
- Prototipado y educacion: referencia lista para usar en cursos de vision por computador y despliegue en el borde, con variantes de cuantizacion para comparar precision y latencia.
- Componente de un sistema mayor: uso como extractor de caracteristicas o clasificador base en un pipeline con un modelo de deteccion o segmentacion aguas arriba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la comparacion interna entre variantes de cuantizacion: la version INT8 channelwise con escalas de activacion compartidas presenta una caida de 0,20 puntos porcentuales en top-5 frente a escalas separadas, medida sobre 10.000 imagenes en CPU. No se proporcionan valores absolutos de top-1 ni top-5, ni latencias, ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo esta pensado para inferencia en CPU/GPU/NPU de dispositivos, no para GPU de servidor; el repositorio pesa 0,1 GB e incluye las tres variantes.
- GPU recomendadas: no aplica para el caso de uso previsto; la variante FP32 es compatible con GPU en LiteRT, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: si, en cualquier GPU moderna, dado el tamano reducido del modelo; no obstante, el objetivo del repositorio es el despliegue en el borde, no en escritorio.
- Opciones de despliegue: runtime LiteRT/TFLite (Android, iOS, Linux embebido); aceleracion NPU en Qualcomm y MediaTek con la variante INT8 channelwise. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DenseNet-121 (este repo) | ~7,98 M (referencia; no confirmado en la model card) | Imagen, resolucion no especificada | FP32, dinamica, INT8 channelwise | no disponible | Hugging Face (litert-community) |
| ResNet-50 (TorchVision) | ~25,6 M | Imagen 224x224 | FP32, INT8 | BSD-3 (TorchVision) | Amplia, multiples repositorios |
| MobileNetV3 (TorchVision) | ~5,4 M (Large) | Imagen 224x224 | FP32, INT8 | BSD-3 (TorchVision) | Amplia, orientado a movil |
| EfficientNet-B0 (TorchVision) | ~5,3 M | Imagen 224x224 | FP32, INT8 | BSD-3 (TorchVision) | Amplia |

Nota: los datos de parametros de las alternativas son de referencia y no proceden de la informacion proporcionada; los datos de este repositorio se limitan a lo indicado en la model card. No se dispone de comparacion de rendimiento entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin verificar los terminos con el autor del repositorio y con la licencia original de TorchVision (BSD-3 en la implementacion de referencia).
- Modelo de 2017: su precision en ImageNet-1K es inferior a la de arquitecturas mas recientes (EfficientNet, ConvNeXt, ViT); no es adecuado si se busca el estado del arte en clasificacion.
- Solo clasificacion de 1.000 clases: no detecta objetos, no segmenta, no genera texto ni responde a instrucciones.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede asignar una clase con alta confianza a imagenes fuera de distribucion o ambiguas.
- Sesgos: heredados del dataset ImageNet-1K (desequilibrio de clases, sesgos culturales y geograficos en las imagenes); no se documenta ningun analisis de sesgo en la model card.
- Limitaciones de la cuantizacion: la variante INT8 no es compatible con GPU y presenta una perdida de 0,20 pp en top-5 documentada solo en CPU; no se garantiza el mismo comportamiento en NPU.
- Resolucion de entrada no especificada: es necesario consultar el grafo TFLite o la implementacion de TorchVision para conocer el preprocesamiento exacto.
- Sin garantias de mantenimiento: repositorio de comunidad con 187 descargas y 2 likes; la fecha de actualizacion indicada (2026-11-15) debe tratarse con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/litert-community/densenet121
- Paper original de DenseNet (Huang et al., 2017): https://arxiv.org/abs/1608.06993
- Implementacion de referencia en TorchVision: https://pytorch.org/vision/stable/models/densenet.html
- Documentacion de LiteRT: https://ai.google.dev/edge/litert
- Dataset ImageNet-1K: https://huggingface.co/datasets/imagenet-1k
