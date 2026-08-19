# modelapi/vit-tiny-fp16-ov-catalog

## Resumen

El modelo `modelapi/vit-tiny-fp16-ov-catalog` es un clasificador de imágenes basado en el Vision Transformer ViT-Tiny, desarrollado por el equipo de modelapi como parte de la suite de robótica e inteligencia artificial de visión. Se trata de una conversión del modelo original `timm/vit_tiny_patch16_224.augreg_in21k` al formato OpenVINO IR con pesos en FP16, lo que permite una inferencia eficiente en dispositivos edge y CPUs. El modelo mapea una imagen de entrada de 224x224 píxeles a puntuaciones de clase, siendo adecuado para tareas de clasificación genérica de imágenes.

La relevancia de este modelo radica en su tamaño reducido (ViT-Tiny) y su optimización para OpenVINO, lo que facilita su despliegue en entornos con recursos limitados, como sistemas embebidos o robots. Al estar integrado en el ecosistema Geti™ de Intel, ofrece una vía rápida para incorporar capacidades de visión en pipelines de automatización. Aunque no se especifican los parámetros totales en la información proporcionada, se trata de un modelo ligero diseñado para clasificación de imágenes de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Tiny) con patch size 16 y resolucion de entrada 224x224 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 224x224 pixeles (imagen de entrada) |
| Tipos de cuantizacion | FP16 |
| Idiomas soportados | no disponible (modelo de vision, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (FP16) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer (ViT) en su variante Tiny, con un tamaño de parche de 16x16 píxeles y una resolución de entrada de 224x224. La arquitectura sigue el diseño estándar de ViT: las imágenes se dividen en parches, se proyectan linealmente y se procesan mediante bloques de atención multi-cabeza y perceptrones multicapa. El modelo original fue preentrenado en ImageNet-21k con técnicas de aumentación y regularización (augreg), y posteriormente se convirtió a OpenVINO IR con pesos en FP16 mediante el pipeline de Geti™. No se proporcionan detalles sobre el número de tokens de entrenamiento, el dataset exacto de fine-tuning ni el uso de técnicas como RLHF o DPO, ya que se trata de un clasificador de imágenes y no de un modelo de lenguaje.

## Capacidades

- Clasificacion de imagenes de proposito general: el modelo asigna una puntuacion de clase a cada imagen de entrada, permitiendo identificar objetos, escenas o categorias predefinidas.
- Inferencia eficiente en CPU y dispositivos edge gracias al formato OpenVINO IR con cuantizacion FP16.
- Integracion con el ecosistema OpenVINO y la libreria `openvino-model-api`, que facilita la carga y ejecucion del modelo en pocas lineas de codigo.
- Compatibilidad con la suite de robótica Geti™, orientada a aplicaciones de vision en entornos industriales o roboticos.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues, al ser un modelo exclusivamente de clasificacion visual.

## Casos de uso

- Clasificacion de imagenes en tiempo real en sistemas embebidos: gracias a su tamano reducido y a la optimizacion para OpenVINO, el modelo puede ejecutarse en CPUs de bajo consumo o en placas como Raspberry Pi para clasificar imagenes en aplicaciones de vigilancia o control de calidad.
- Vision para robots autonomos: integrado en la suite robotics-ai-suite, permite a un robot identificar objetos o obstaculos en su entorno, alimentando algoritmos de navegacion o manipulacion.
- Etiquetado automatico de imagenes en pipelines de datos: el modelo puede pre-clasificar imagenes en un dataset para acelerar tareas de anotacion manual o para filtrar contenido irrelevante.
- Prototipado rapido de aplicaciones de vision: al ser un modelo ligero y facil de cargar con `openvino-model-api`, es adecuado para validar conceptos de clasificacion sin necesidad de infraestructura GPU.
- Control de calidad en manufactura: clasificacion de piezas o productos en una linea de produccion para detectar defectos o categorias, ejecutandose localmente sin conexion a la nube.
- Educacion y experimentacion: util para ensenar conceptos de Vision Transformers y de despliegue de modelos en formato OpenVINO, dado su tamano manejable y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo Tiny con pesos FP16, su huella de memoria es minima, estimandose menos de 20 MB de VRAM/RAM para inferencia (no se proporciona el dato exacto).
- Puede ejecutarse en CPU sin GPU, incluyendo procesadores integrados como Intel Core o Atom, gracias a la optimizacion de OpenVINO.
- Para GPU, cualquier tarjeta moderna con soporte FP16 (por ejemplo, RTX 2060 o superior) es suficiente, aunque no es necesario.
- Opciones de despliegue: se recomienda usar la libreria `openvino-model-api` o el runtime de OpenVINO directamente. Tambien puede integrarse en aplicaciones C++ o Python.
- No se dispone de datos de latencia o throughput especificos, pero al ser un modelo de ~5 millones de parametros (estimacion comun para ViT-Tiny), la inferencia en CPU es del orden de milisegundos por imagen.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria, ya que no se han proporcionado datos de otros ViT-Tiny o clasificadores de imagenes similares en el contexto de esta ficha.

## Limitaciones y advertencias

- Es un modelo de clasificacion de imagenes, no soporta procesamiento de lenguaje natural ni generacion de texto.
- No se especifican los idiomas ni el dominio de las clases de clasificacion; el modelo original de timm fue entrenado en ImageNet-21k, por lo que las clases corresponden a categorias generales de objetos y escenas.
- La cuantizacion FP16 puede introducir una ligera perdida de precision respecto al modelo original en FP32, aunque suele ser despreciable para clasificacion.
- El repositorio en HuggingFace es un catalogo o puntero a los pesos alojados en otro repositorio (`OpenVINO/vit_tiny_cls-fp16-ov`), por lo que es necesario acceder a ese repositorio para obtener los archivos del modelo.
- No se han documentado sesgos especificos, pero al estar entrenado en ImageNet, puede heredar sesgos de ese dataset (por ejemplo, en la representacion de ciertas culturas o contextos).
- Para uso en produccion, se recomienda validar el rendimiento en el dominio especifico de aplicacion, ya que el modelo no ha sido fine-tuned para tareas concretas.

## Enlaces

- [Repositorio en HuggingFace del modelo catalogado](https://huggingface.co/modelapi/vit-tiny-fp16-ov-catalog)
- [Modelo original timm/vit_tiny_patch16_224.augreg_in21k](https://huggingface.co/timm/vit_tiny_patch16_224.augreg_in21k)
- [Repositorio de pesos OpenVINO/vit_tiny_cls-fp16-ov](https://huggingface.co/OpenVINO/vit_tiny_cls-fp16-ov)
- [Proyecto Geti™ en GitHub](https://github.com/open-edge-platform/geti)
