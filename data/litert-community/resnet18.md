# litert-community/resnet18

## Resumen

ResNet-18 es una red neuronal convolucional (CNN) de 18 capas presentada originalmente por He et al. en el artículo "Deep Residual Learning for Image Recognition" (2015). Este repositorio, publicado por la comunidad LiteRT (antes TFLite) de Hugging Face, distribuye los pesos preentrenados en ImageNet-1k convertidos desde PyTorch Vision al formato LiteRT/TFLite, listos para inferencia en dispositivos de borde (movil, embedded, NPU). El modelo resuelve clasificación de imágenes en 1.000 categorias con un coste computacional muy bajo: 11,7 millones de parametros y un repositorio de tan solo 0,2 GB.

La relevancia de esta ficha no esta en la arquitectura (que es un clasico consolidado) sino en el empaquetado: se ofrecen tres variantes TFLite con distintos niveles de cuantizacion (FP32 completa, INT8 dinamica solo pesos y INT8 estatica canal a canal), lo que permite desplegar el mismo modelo en CPU, GPU o NPU con un impacto minimo en precision. Es un ejemplo practico de como llevar un modelo de vision clasico a produccion en el ecosistema LiteRT.

Conviene subrayar que no es un modelo generativo ni un LLM: no procesa texto ni mantiene conversaciones. Su unico cometido es asignar una de las 1.000 etiquetas de ImageNet a una imagen RGB de 224x224 pixeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales, 18 capas) |
| Parametros totales | 11.689.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224 RGB) |
| Tipos de cuantizacion | FP32 completa; INT8 dinamica solo pesos con activaciones FP32 (wi8 afp32); INT8 estatica canal a canal con activaciones INT8 asimetricas (STATIC_WI8_AI8) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | no disponible (heredada de PyTorch Vision y del dataset de entrenamiento; el autor no la especifica) |
| Formato de pesos | TFLite / LiteRT (`.tflite`): `resnet18.tflite`, `resnet18_dynamic_wi8_afp32.tflite`, `resnet18_int8_channelwise.tflite` |

## Arquitectura y entrenamiento

ResNet-18 es una red convolucional con 18 capas con pesos (17 convolucionales y 1 totalmente conectada) organizada en cuatro etapas con bloques residuales basicos (dos convoluciones 3x3 por bloque). Las conexiones residuales (identity shortcuts) permiten entrenar redes mas profundas mitigando el problema del desvanecimiento del gradiente, que es la aportacion central del articulo original. La entrada es una imagen RGB de 224x224 normalizada con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`; la salida es un vector de 1.000 logits correspondiente a las clases de ImageNet-1k.

El entrenamiento original se realizo sobre ImageNet-1k (aproximadamente 1,28 millones de imagenes de entrenamiento y 50.000 de validacion). Este repositorio no reentrena el modelo: convierte el checkpoint de PyTorch Vision al formato LiteRT y genera las variantes cuantizadas. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de alineacion, algo por otra parte ajeno a un clasificador de vision supervisado. La innovacion tecnica del repositorio es el pipeline de conversion y cuantizacion: la variante estatica INT8 usa cuantizacion simetrica canal a canal para pesos y asimetrica para activaciones, lo que reduce el error de cuantizacion respecto a la cuantizacion por tensor.

## Capacidades

- Clasificacion de imagenes en 1.000 categorias de ImageNet-1k (top-1 y top-5).
- Extraccion de caracteristicas visuales de nivel medio y alto (el backbone convolucional puede reutilizarse para tareas de transferencia, aunque el repositorio solo expone la cabeza de clasificacion).
- Inferencia en CPU, GPU y NPU segun la variante: FP32 soporta CPU y GPU; INT8 estatica soporta CPU y NPU (Qualcomm/MediaTek) pero no GPU.
- Ejecucion en dispositivos de borde mediante el runtime `ai-edge-litert` (antes TensorFlow Lite).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision-lenguaje: es puramente vision.
- No dispone de modo "thinking" ni de decodificacion especulativa.

## Casos de uso

- Clasificacion de imagenes en movil: la variante INT8 estatica permite ejecutar el modelo en tiempo real en smartphones Android usando la NPU de Qualcomm o MediaTek, con un coste de almacenamiento inferior a 12 MB por los 11,7 M de parametros cuantizados.
- Moderacion de contenido visual en el borde: filtrar imagenes en el propio dispositivo antes de subirlas a la nube, reduciendo ancho de banda y coste de servidor, gracias a la baja latencia de un modelo de 18 capas.
- Etiquetado automatico de fotos en aplicaciones de galeria: clasificar las imagenes del usuario en categorias genericas (animales, vehiculos, objetos) para organizar albumes sin enviar datos a un servidor.
- Preprocesado en pipelines de vision por computador: usar el modelo como primer filtro para descartar imagenes irrelevantes antes de pasarlas a un modelo mayor (por ejemplo, un detector o un VLM), ahorrando computo.
- Prototipado rapido de sistemas de vision: servir de baseline reproducible con metricas conocidas (69,77 % top-1) para comparar nuevas tecnicas de cuantizacion o despliegue en LiteRT.
- Vision embebida en IoT industrial: inspeccion visual sencilla en dispositivos con recursos limitados (Raspberry Pi, placas con NPU) donde un modelo de 0,2 GB y 11,7 M de parametros cabe holgadamente en memoria.
- Educacion e investigacion: ejemplo canonico de ResNet para ensenar conexiones residuales y cuantizacion, con tres variantes listas para comparar precision frente a tamano.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (ImageNet-1k, split validation, no verificados):

| Variante | Top-1 accuracy | Top-5 accuracy |
|---|---|---|
| FP32 completa | 0,6977 (69,77 %) | 0,8913 (89,13 %) |
| INT8 dinamica (wi8 afp32) | 0,6967 (69,67 %) | 0,8901 (89,01 %) |

La model card cita ademas las metricas del checkpoint original de PyTorch Vision: acc@1 69,758 % y acc@5 89,078 %. No se publican resultados para la variante INT8 estatica canal a canal (`resnet18_int8_channelwise.tflite`) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo FP32 ocupa aproximadamente 47 MB (11,7 M parametros x 4 bytes); la variante INT8 estatica, unos 12 MB. El repositorio completo pesa 0,2 GB porque incluye las tres variantes.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 en adelante, RTX 3060/4090) puede ejecutar la variante FP32 sin problema. No requiere A100 ni H100; seria un desperdicio de recursos.
- Cabe en cualquier GPU consumer e incluso en CPU y microcontroladores con suficiente memoria (la variante INT8 estatica esta pensada para NPU moviles).
- Opciones de despliegue: runtime `ai-edge-litert` (Python), LiteRT/TFLite en Android, iOS, Linux embebido; no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLMs.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos en CPU moderna y sub-milisegundo en NPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 ImageNet | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResNet-18 (este) | 11,7 M | 69,77 % (FP32) | TFLite/LiteRT | no disponible | Hugging Face (litert-community) |
| ResNet-50 | 25,6 M | ~76 % (referencia clasica) | PyTorch, ONNX, TFLite | variable | Amplia |
| MobileNetV2 | 3,4 M | ~72 % (referencia clasica) | TFLite, PyTorch | variable | Amplia |
| EfficientNet-B0 | 5,3 M | ~77 % (referencia clasica) | TFLite, PyTorch | variable | Amplia |

Nota: los valores de ResNet-50, MobileNetV2 y EfficientNet-B0 son referencias generales de la literatura y no provienen de la informacion proporcionada; se incluyen solo como orientacion cualitativa. La ventaja de este repositorio frente a alternativas es el empaquetado LiteRT con tres variantes de cuantizacion listas para NPU.

## Limitaciones y advertencias

- Modelo de vision puro: no procesa texto, no mantiene conversaciones ni soporta instrucciones en lenguaje natural.
- Solo reconoce las 1.000 clases de ImageNet-1k; cualquier objeto fuera de ese vocabulario se clasificara erroneamente en una de las clases existentes.
- Precision moderada: 69,77 % top-1 implica que aproximadamente 3 de cada 10 imagenes se clasifican mal; no es adecuado para tareas que requieran alta precision sin supervision adicional.
- Sesgos del dataset: ImageNet-1k tiene sesgos conocidos de composicion, geografia y representacion; el modelo puede rendir peor en dominios alejados de las fotos de ImageNet (imagenes medicas, satelitales, industriales).
- Riesgo de clasificacion erronea confiada: el modelo siempre devuelve una clase con un logit; no incorpora mecanismo de absteccion ni de "no lo se".
- Licencia no disponible: el autor remite a las licencias de PyTorch Vision y del dataset de entrenamiento; es responsabilidad del usuario verificar el uso comercial.
- La variante INT8 estatica no es compatible con GPU (solo CPU y NPU Qualcomm/MediaTek); la FP32 no esta pensada para NPU.
- No hay datos publicados de latencia, throughput ni consumo energetico en la informacion disponible.
- Repositorio con muy poca traccion (276 descargas, 1 like) y sin verificacion de metricas (`verified: false`).

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/resnet18
- Organizacion LiteRT Community: https://huggingface.co/litert-community
- Paper original (He et al., 2015): https://arxiv.org/pdf/1512.03385
- Dataset ImageNet-1k: https://huggingface.co/datasets/imagenet-1k
- Etiquetas ImageNet-1k: https://huggingface.co/datasets/huggingface/label-files
- Runtime ai-edge-litert: https://pypi.org/project/ai-edge-litert/
- PyTorch Vision (origen de los pesos): https://github.com/pytorch/vision
