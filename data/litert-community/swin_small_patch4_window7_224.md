# litert-community/swin_small_patch4_window7_224

## Resumen

Swin Small es un modelo de clasificacion de imagenes basado en la arquitectura Swin Transformer, publicado originalmente por Microsoft Research y convertido al formato LiteRT (TFLite) por la comunidad litert-community. El modelo original, `swin_small_patch4_window7_224`, fue preentrenado en ImageNet-22k y ajustado fino (fine-tuned) en ImageNet-1k por Ross Wightman dentro del repositorio TIMM (PyTorch Image Models). Esta version concreta empaqueta los pesos como un unico fichero `model.tflite` listo para inferencia en CPU mediante el runtime LiteRT.

El modelo resuelve la tarea de clasificacion de imagenes en 1.000 clases de ImageNet-1k, con una entrada fija de 224x224 pixeles en formato NCHW y salida de logits de forma `[1, 1000]`. Con 49,6 millones de parametros y 8,8 GMACs por inferencia, se situa en la gama media de los transformers de vision, lo que lo hace atractivo para despliegue en dispositivos de recursos limitados. Su relevancia actual radica en la disponibilidad de una version TFLite optimizada para CPU, util en entornos moviles y de edge computing donde no se dispone de aceleracion GPU.

La arquitectura Swin Transformer introduce atencion por ventanas desplazadas (shifted windows) que reduce la complejidad computacional respecto a ViT clasico y construye representaciones jerarquicas multi-escala. Esta conversion concreta esta publicada como "CPU-ready": la delegacion a GPU esta bloqueada por patrones de tensores de rango 5 en el backend de LiteRT, principalmente en operaciones `RESHAPE`, `TRANSPOSE` y las operaciones de ventana y atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (vision transformer jerarquico con shifted windows) |
| Parametros totales | 49,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada fija 224x224) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`model.tflite`) |
| Entrada | tensor float32 NCHW `[1, 3, 224, 224]` |
| Salida | logits ImageNet-1k `[1, 1000]` |
| GMACs | 8,8 |
| Activaciones | 27,5 M |
| Dataset de ajuste | ImageNet-1k |
| Dataset de preentrenamiento | ImageNet-22k |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura Swin Transformer, descrita en el paper "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows" (Liu et al., ICCV 2021), organiza la imagen en parches y aplica auto-atencion dentro de ventanas locales, alternando entre ventanas regulares y ventanas desplazadas entre capas consecutivas. Esta estrategia permite capturar dependencias locales y globales con complejidad lineal respecto al numero de pixeles, a diferencia de la atencion global de ViT. El modelo construye una jerarquia de representaciones multi-escala mediante fusion de parches (patch merging) en etapas sucesivas, lo que lo hace util tanto para clasificacion como para tareas densas (deteccion, segmentacion) como backbone.

El checkpoint de origen, `timm/swin_small_patch4_window7_224.ms_in22k_ft_in1k`, fue preentrenado en ImageNet-22k y posteriormente ajustado fino en ImageNet-1k por Ross Wightman en el repositorio TIMM. La version publicada por litert-community es una conversion directa de ese checkpoint al formato TFLite, sin informacion disponible sobre tecnicas adicionales de destilacion, RLHF ni modificaciones del entrenamiento original. No se dispone de datos sobre el numero exacto de tokens de entrenamiento ni sobre la composicion detallada del dataset mas alla de los nombres ImageNet-22k e ImageNet-1k.

## Capacidades

- Clasificacion de imagenes en 1.000 clases de ImageNet-1k a partir de entradas RGB de 224x224 pixeles.
- Extraccion de caracteristicas (feature backbone) para tareas de vision por computador aguas abajo, gracias a la jerarquia multi-escala del Swin Transformer.
- Inferencia en CPU mediante el runtime LiteRT (`CompiledModel`), con prueba de humo (smoke test) superada segun la model card.
- Delegacion a GPU no disponible actualmente: bloqueada por patrones de tensores de rango 5 (`RESHAPE`, `TRANSPOSE` y operaciones de ventana/atencion).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, audio ni modalidades linguisticas: es un modelo puramente de vision.
- No dispone de modo de pensamiento (thinking mode) ni capacidades multimodales mas alla de la clasificacion de imagenes.

## Casos de uso

- Clasificacion de imagenes en dispositivos moviles y edge: el fichero `model.tflite` con 49,6 M de parametros y 0,3 GB de repo permite ejecutar inferencia en CPU en telefonos, Raspberry Pi o dispositivos IoT sin GPU dedicada, clasificando imagenes de 224x224 en las 1.000 clases de ImageNet.
- Etiquetado automatico de catalogos de producto: clasificar fotos de productos en categorias predefinidas mapeando las clases de ImageNet-1k a taxonomias propias, con inferencia en CPU en servidores sin acelerador.
- Filtrado y moderacion de contenido visual: usar los logits de salida para detectar categorias sensibles (por ejemplo, armas o contenido no deseado) mediante umbrales sobre las probabilidades, en pipelines de ingesta de imagenes.
- Preprocesado en sistemas de vision industrial: clasificar piezas o estados de producto en cadenas de montaje donde la latencia por imagen es critica y no se dispone de GPU, aprovechando los 8,8 GMACs por inferencia.
- Backbone para tareas aguas abajo: extraer caracteristicas multi-escala del Swin Transformer para alimentar clasificadores o detectores ligeros en proyectos de investigacion que requieran un backbone preentrenado en ImageNet.
- Clasificacion de imagenes medicas o cientificas como paso inicial: usar las caracteristicas del modelo como extractor congelado y ajustar una cabeza ligera sobre dominios especificos, reduciendo el coste de entrenamiento frente a entrenar desde cero.
- Prototipado rapido en entornos TFLite: validar pipelines de despliegue LiteRT en CPU antes de migrar a modelos mayores o a aceleradores, dado que el modelo esta publicado como CPU-ready.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la prueba de humo en CPU con LiteRT `CompiledModel` se supero correctamente; no se proporcionan metricas de precision (top-1, top-5) ni comparativas numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para inferencia en CPU mediante LiteRT y no se especifican requisitos de memoria GPU.
- GPU recomendadas: no disponible; la delegacion a GPU esta actualmente bloqueada por patrones de tensores de rango 5 en el backend de LiteRT.
- Compatibilidad con GPU de consumo: no disponible; el estado publicado es CPU-ready, no GPU-ready.
- Opciones de despliegue: LiteRT (`CompiledModel`) con el fichero `model.tflite`; no se mencionan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vision TFLite).
- Latencia y throughput estimados: no disponibles; solo se confirma que la prueba de humo en CPU paso.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| swin_small_patch4_window7_224 (esta version LiteRT) | 49,6 M | 224x224 NCHW | TFLite | no disponible | CPU-ready, GPU bloqueada |
| swin_small_patch4_window7_224 (TIMM original) | 49,6 M | 224x224 | PyTorch (safetensors/bin) | no disponible | Checkpoint de origen, preentrenado ImageNet-22k y ajustado ImageNet-1k |
| Otros backbones TIMM de gama similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (precision top-1/top-5) entre esta version LiteRT y el checkpoint TIMM original ni con otros backbones de vision, por lo que la comparativa se limita a parametros, formato y estado de despliegue.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no procesa texto, audio ni otras modalidades; no debe usarse para tareas de lenguaje.
- Entrada fija de 224x224 en NCHW: no admite resoluciones variables sin recompilar o adaptar el grafo TFLite.
- Delegacion a GPU bloqueada: el rendimiento en GPU no esta garantizado y el modelo esta publicado como CPU-ready; quienes necesiten aceleracion GPU deberan esperar mejoras del backend LiteRT o usar el checkpoint TIMM original en PyTorch.
- Licencia no disponible: no se especifica licencia en la model card ni en los metadatos, lo que impide confirmar condiciones de uso comercial; debe verificarse con el autor antes de desplegar en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al estar entrenado en ImageNet, hereda los sesgos de clase y representacion de ese dataset, pero no se documentan formalmente.
- Riesgo de alucinacion: no aplicable en el sentido linguistico; en clasificacion de imagenes, el riesgo se traduce en predicciones erroneas con alta confianza en clases ambiguas o fuera de distribucion.
- Limitaciones de idioma: no aplicable; el modelo no tiene capacidades linguisticas.
- Ausencia de benchmarks publicados: no hay metricas de precision verificables en la informacion disponible, lo que dificulta evaluar su calidad frente a alternativas.
- Conversion comunitaria: al tratarse de una conversion de terceros (litert-community) y no del autor original, deben validarse posibles diferencias numericas respecto al checkpoint TIMM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/swin_small_patch4_window7_224
- Checkpoint base en TIMM: https://huggingface.co/timm/swin_small_patch4_window7_224.ms_in22k_ft_in1k
- Paper Swin Transformer: https://arxiv.org/abs/2103.14030
- Repositorio original Microsoft Swin-Transformer: https://github.com/microsoft/Swin-Transformer
- Repositorio TIMM (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Dataset ImageNet-1k: https://huggingface.co/datasets/imagenet-1k
