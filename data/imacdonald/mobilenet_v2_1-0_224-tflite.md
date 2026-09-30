# imacdonald/mobilenet_v2_1.0_224-tflite

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un reempaquetado no oficial del clasificador de imágenes MobileNetV2 con multiplicador de anchura 1.0 y entrada de 224x224, en formato TFLite y precisión float32. Lo publica el usuario imacdonald como directorio listo para consumir por `tflite-server` (endpoint `POST /classify/image`) y por la receta `tflite` de lemonade (`POST /v1/images/classify`). Los pesos son exactamente los del fichero `mobilenet_v2_1.0_224.tflite` distribuido por Google en el archivo de modelos alojados de TensorFlow, sin modificaciones.

El modelo resuelve clasificación de imágenes sobre ImageNet-1k con 1001 salidas (las 1000 clases del dataset más un índice 0 reservado para `background`). Su relevancia es fundamentalmente práctica: documenta con precisión el contrato de entrada y salida (tensor float32 `[1,224,224,3]` en NHWC y rango -1..1, salida `[1,1001]` ya con softmax aplicada), incluye el fichero de etiquetas y un `manifest.json` con el preprocesado exacto, y proporciona un ejemplo de validación reproducible con top-5 esperado.

Al tratarse de una red convolucional ligera, el modelo está pensado para inferencia en CPU y dispositivos de borde, no para GPU de centro de datos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño declarado es de 0.0 GB (el único artefacto pesado es el propio `model.tflite`, de 13.978.596 bytes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV2 (bloques de residuales invertidos con cuellos de botella lineales y convoluciones separables en profundidad); no es un transformer ni un MoE |
| Parametros totales | no disponible en la informacion proporcionada; el articulo original de MobileNetV2 (Sandler et al., 2018) reporta ~3,4 M de parametros y ~300 M de MACs para la variante 1.0 con entrada 224x224 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagen, sin ventana de contexto textual) |
| Tipos de cuantizacion | pesos en float32; este repositorio no incluye variantes INT8 ni float16 |
| Idiomas soportados | no aplica; las etiquetas de `labels.txt` estan en ingles |
| Licencia | apache-2.0 (pesos procedentes de `tensorflow/models` research/slim) |
| Formato de pesos | TFLite (FlatBuffers, fichero `model.tflite`) |
| Tamano del fichero de pesos | 13.978.596 bytes (sha256 `9f3bc29e38e90842a852bfed957dbf5e36f2d97a91dd17736b1e5c0aca8d3303`) |
| Entrada | float32 `[1,224,224,3]`, NHWC, RGB, escala -1..1 |
| Salida | float32 `[1,1001]`, softmax ya aplicada |
| Dataset de entrenamiento | ILSVRC/imagenet-1k (1000 clases; el indice 0 del fichero de etiquetas es `background`) |
| SignatureDefs | ausente; LiteRT sirve el modelo a traves de su firma por defecto |
| Tamano del repositorio | 0.0 GB segun los metadatos de HuggingFace |
| Fecha indicada en metadatos | creado el 2026-09-29, actualizado el 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV2, una red convolucional disenada para eficiencia computacional y de memoria. Sus bloques principales son residuales invertidos: se expande la representacion con una convolucion 1x1, se aplica una convolucion separable en profundidad (depthwise separable) y se proyecta de nuevo con otra 1x1, con la conexion residual aplicada unicamente entre los cuellos de botella de baja dimensionalidad. Las capas de proyeccion no llevan activacion no lineal (cuello de botella lineal), lo que evita la perdida de informacion que provocaria ReLU sobre representaciones ya comprimidas. El multiplicador de anchura es 1.0 y la resolucion de entrada es 224x224.

No hay informacion sobre el proceso de entrenamiento (numero de imagenes, epocas, aumentos de datos, optimizador) en la model card proporcionada; esta se limita a atribuir los pesos a `tensorflow/models` research/slim y a remitir al articulo original. Tampoco hay rastro de RLHF, DPO ni ajuste por preferencias, algo que no aplica a un clasificador supervisado. La innovacion relevante en este empaquetado concreto no es algorítmica, sino de contrato de inferencia: el modelo no expone SignatureDefs, la salida ya incluye softmax (a diferencia de la implementacion de Keras, que devuelve logits en crudo) y el preprocesado documentado en `manifest.json` consiste en un redimensionado por estiramiento (stretch) a 224x224 con semantica Pillow BILINEAR seguido de la normalizacion `(x - 127.5) / 127.5`.

## Capacidades

- Clasificacion de imagenes sobre las 1000 categorias de ImageNet-1k, con una clase adicional en el indice 0 (`background`).
- Devuelve un vector de probabilidades de 1001 elementos ya normalizado con softmax, listo para ordenar y extraer top-k.
- Inferencia en CPU sobre un fichero de menos de 14 MB, apta para entornos con recursos muy limitados.
- Integracion directa con `tflite-server v0.2.0` mediante el endpoint `POST /classify/image`.
- Integracion con lemonade mediante la receta `tflite`, expuesta como `POST /v1/images/classify` en la rama `release/prpl-demo`.
- Preprocesado determinista y documentado (`manifest.json`), lo que permite reproducir exactamente la entrada esperada por el modelo.
- Conjunto de validacion embebido (`validation.json`) con el top-5 esperado para `grace_hopper.jpg`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de imagen.
- No dispone de capacidades multilingues ni de modo de razonamiento explicito.

## Casos de uso

- Servicio de clasificacion local con `tflite-server`: desplegar `POST /classify/image` en una maquina de bajos recursos para etiquetar imagenes entrantes sin dependencia de APIs externas ni de GPU.
- Etiquetado y triaje de datasets: preclasificar grandes volumenes de imagenes con sus 1000 categorias ImageNet y reservar la revision humana para los casos con baja confianza.
- Filtrado previo en pipelines de vision: descartar o enrutar imagenes por categoria antes de pasarlas a modelos mas costosos, reduciendo el computo total del sistema.
- Inferencia en el borde: con 13,98 MB de pesos en float32, el modelo cabe en dispositivos tipo Raspberry Pi o moviles mediante el runtime LiteRT, sin acelerador dedicado.
- Verificacion de pipelines de preprocesado: usar el top-5 documentado para `grace_hopper.jpg` como prueba de regresion que detecte cambios en la decodificacion JPEG (stb_image frente a Pillow) o en el redimensionado.
- Demo de lemonade: exponer la clasificacion como `POST /v1/images/classify` para prototipos de aplicaciones que ya usan ese ecosistema.
- Punto de partida para transfer learning: aunque este repositorio solo contiene el fichero TFLite de inferencia, los mismos pesos estan disponibles como `tf.keras.applications.MobileNetV2` para reentrenar la cabeza de clasificacion sobre un dominio propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de validacion aportado por el autor es el top-5 esperado para la imagen de ejemplo `grace_hopper.jpg`, servido por `tflite-server v0.2.0` (decodificacion JPEG con stb_image). Se reproduce a continuacion como referencia de verificacion, no como benchmark comparativo:

| Imagen | Top-1 | Top-2 | Top-3 |
|---|---|---|---|
| grace_hopper.jpg | 653 military uniform (0,805430) | 440 bearskin (0,036332) | 668 mortarboard (0,016773) |

El autor indica que una decodificacion con Pillow produce el mismo top-5 con diferencias de puntuacion de hasta 2e-3, y que `validation.json` incluye ambos resultados.

## Requisitos de hardware

- VRAM estimada: los pesos en float32 ocupan 13,98 MB; sumando activaciones intermedias de una entrada 224x224x3, el consumo total es del orden de decenas de megabytes. No hay cifras oficiales de consumo publicadas.
- GPU: no requiere GPU. Puede ejecutarse en CPU de forma nativa; el uso de delegados de LiteRT sobre GPU es posible pero no esta documentado en este repositorio.
- GPU de consumo: si, y de hecho es innecesaria. El modelo corre en CPU de portatil, en Raspberry Pi y en telefonos moviles.
- Opciones de despliegue: runtime LiteRT/TFLite con el fichero `model.tflite`; `tflite-server v0.2.0` con `POST /classify/image`; lemonade con la receta `tflite`; y, para reentrenamiento, `tf.keras.applications.MobileNetV2` con `preprocess_input` (que escala los pixeles al rango -1..1).
- Aceleracion opcional: existen variantes INT8 del mismo modelo en otros repositorios (por ejemplo, Arm ML-zoo), pero no estan incluidas en este repositorio; habria que obtenerlas o generarlas por separado.
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| imacdonald/mobilenet_v2_1.0_224-tflite | TFLite | float32 | apache-2.0 | Reempaquetado no oficial para `tflite-server`; pesos identicos al fichero de Google; incluye `labels.txt` y `manifest.json` |
| google/mobilenet_v2_1.0_224 | no disponible en la informacion recogida | no disponible | no disponible | Publicacion de referencia de Google en HuggingFace para el mismo modelo |
| Arm-Examples ML-zoo `mobilenet_v2_1.0_224_INT8.tflite` | TFLite | INT8 | no disponible | Repositorio archivado y en solo lectura desde el 18 de julio de 2025 |
| qualcomm/MobileNet-v2 | no disponible | no disponible | no disponible | Version del modelo mantenida por Qualcomm; detalles no disponibles en la busqueda realizada |
| Open Model Zoo `mobilenet-v2-1.0-224` | IR (OpenVINO) | no disponible | no disponible | Conversion orientada a despliegue en CPU con OpenVINO; descrita como modelo pequeno, de baja latencia y bajo consumo |
| tf.keras.applications.MobileNetV2 | Keras / SavedModel | no disponible | no disponible en la informacion recogida | Implementacion para reentrenamiento; requiere `preprocess_input` para escalar a -1..1 |

## Limitaciones y advertencias

- Es un reempaquetado no oficial: el autor no mantiene los pesos y la unica garantia de integridad es el hash sha256 declarado en la model card. Conviene verificar ese hash antes de desplegar.
- El modelo no expone SignatureDefs, por lo que depende de la firma por defecto del runtime LiteRT. Esto puede complicar la integracion en herramientas que exigen firmas nombradas.
- La salida ya lleva softmax aplicada. Aplicar softmax de nuevo sobre ella distorsiona las probabilidades; hay que tratarla como probabilidades, no como logits.
- El preprocesado documentado usa redimensionado por estiramiento (stretch) a 224x224 en lugar de recorte central con preservacion de la relacion de aspecto, y depende de la semantica de remuestreo BILINEAR de Pillow. Diferencias en la decodificacion JPEG (stb_image frente a Pillow) modifican las puntuaciones hasta 2e-3, segun el propio autor.
- El fichero `labels.txt` tiene 1001 lineas, la primera de ellas (`background`) no corresponde a ninguna clase de ImageNet, y algunos nombres se repiten (`crane`, `maillot`). Los clientes deben indexar por posicion, no por nombre.
- La licencia apache-2.0 cubre los pesos, no el dataset. ImageNet-1k tiene sus propias condiciones de uso, restringidas a investigacion no comercial, lo que limita el uso comercial directo de las predicciones derivadas de esos datos de entrenamiento.
- No hay resultados de benchmarks ni mediciones de latencia publicados en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- No es un modelo generativo: no hay riesgo de alucinacion de texto, pero si de clasificaciones erroneas en clases visualmente similares o en dominios alejados de ImageNet. No se han publicado datos sobre calibracion de sus probabilidades.
- Los metadatos del repositorio indican una fecha de creacion de 2026-09-29, dato que conviene contrastar con el estado real del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imacdonald/mobilenet_v2_1.0_224-tflite
- tflite-server v0.2.0 (release): https://github.com/ianbmacdonald/tflite-server/releases/tag/v0.2.0
- Repositorio tflite-server: https://github.com/ianbmacdonald/tflite-server
- Fichero original de Google (archivo de modelos alojados de TensorFlow): https://storage.googleapis.com/download.tensorflow.org/models/tflite_11_05_08/mobilenet_v2_1.0_224.tgz
- Etiquetas de ImageNet usadas por el modelo: https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt
- MobileNetV2 en Open Model Zoo (OpenVINO): https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/mobilenet-v2-1.0-224/README.md
- MobileNetV2 de Google en HuggingFace: https://huggingface.co/google/mobilenet_v2_1.0_224
- Variante INT8 en Arm ML-zoo: https://github.com/Arm-Examples/ML-zoo/blob/master/models/image_classification/mobilenet_v2_1.0_224/tflite_int8/mobilenet_v2_1.0_224_INT8.tflite
- MobileNet-v2 de Qualcomm en HuggingFace: https://huggingface.co/qualcomm/MobileNet-v2
- Documentacion de `tf.keras.applications.MobileNetV2`: https://www.tensorflow.org/api_docs/python/tf/keras/applications/MobileNetV2
