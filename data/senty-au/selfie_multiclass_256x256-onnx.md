# senty-au/selfie_multiclass_256x256-ONNX

## Resumen

Este repositorio contiene la conversion a ONNX del modelo **selfie_multiclass_256x256** de Google MediaPipe, un segmentador semantico denso que clasifica cada pixel de una imagen en seis clases: fondo, pelo, piel del cuerpo, piel de la cara, ropa y otros accesorios. El autor de la conversion es el usuario de HuggingFace `senty-au`, pero los pesos son los originales de Google LLC y no se han modificado: lo unico que cambia es el formato de fichero, de TFLite a ONNX.

El problema que resuelve es de interoperabilidad. El modelo original solo se distribuia como fichero TFLite pensado para el runtime LiteRT y para el ecosistema MediaPipe, lo que obligaba a arrastrar dependencias de MediaPipe o TensorFlow en inferencia. Esta conversion elimina esa dependencia: el modelo se ejecuta en cualquier entorno donde funcione `onnxruntime`, incluidas aplicaciones de escritorio, servidores y moviles, sin necesidad de TensorFlow ni de MediaPipe en tiempo de ejecucion.

Es relevante ahora porque permite integrar una segmentacion por capas (pelo, cara, ropa) en pipelines de edicion fotografica y de video que ya estan construidos sobre ONNX, sin reescribir nada. Se trata de un modelo pequeno y rapido: segun el autor, la inferencia tarda unos 35 ms en CPU de portatil. No es un modelo de lenguaje, no tiene parametros publicados ni ventana de contexto, y su entrada es una imagen fija de 256x256 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentacion semantica densa por pixel del Image Segmenter de MediaPipe; topologia concreta no documentada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: entrada fija de imagen 256x256x3 (NHWC, RGB, float32 en [0,1]) |
| Tipos de cuantizacion | float32 unicamente (el fichero de origen es la variante float32 de MediaPipe); no se publican variantes int8 o fp16 |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de texto) |
| Licencia | apache-2.0 (pesos © Google LLC; este repositorio solo cambia el formato de fichero) |
| Formato de pesos | ONNX, opset 17, fichero `onnx/model.onnx` |
| Salida | `Identity`: float32 [1, 256, 256, 6] con logits; el softmax se aplica fuera del modelo |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la topologia interna, el numero de capas, los parametros o el regimen de entrenamiento. La model card unicamente indica que se trata del modelo `selfie_multiclass_256x256` del Image Segmenter de MediaPipe, que opera como un clasificador denso por pixel: produce un tensor de logits de 256x256 con seis canales y la clase final se obtiene con un argmax por pixel. La variante distribuida por el autor es la de precision float32.

La innovacion del repositorio no esta en el modelo sino en el proceso de conversion. Se parte del fichero TFLite versionado de MediaPipe (sha256 `c6748b1253a99067ef71f7e26ca71096cd449baefa8f101900ea23016507e0e0`) y se convierte con `tf2onnx==1.17.0` y opset 17. El autor verifico el resultado comparandolo con el modelo TFLite ejecutado sobre LiteRT en tres fotografias: la diferencia absoluta maxima fue de 3,7e-5 y el argmax por pixel coincidio en el 100 % de los casos. El sha256 del fichero ONNX resultante es `35ec1ecd9ee7f85073c99c00020b7f6751b69506eeacf683bc8665f6117f85b0`.

## Capacidades

- Segmentacion semantica por pixel en seis clases: 0 = fondo, 1 = pelo, 2 = piel del cuerpo, 3 = piel de la cara, 4 = ropa, 5 = otros (accesorios).
- Generacion de mascaras binarias independientes por clase (por ejemplo, mascara de pelo extrayendo el canal 1 de las probabilidades).
- Inferencia exclusivamente en CPU sin dependencias de MediaPipe ni de TensorFlow, usando `onnxruntime` con `CPUExecutionProvider`.
- Ejecucion en cualquier runtime compatible con ONNX, incluidos proveedores de GPU si estan disponibles (aunque no se publican cifras en esos entornos).
- Preprocesado definido de forma explicita: redimensionado estirado a 256x256 en RGB con interpolacion bilineal, sin letterbox, normalizando a [0,1].
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni vision mas alla de la segmentacion descrita.
- Capacidades multilingues: no aplica.

## Casos de uso

- Fondos virtuales y videollamadas: la mascara de fondo (clase 0) y la clase "otros" permiten recortar al sujeto en tiempo real. Los ~35 ms por fotograma en CPU de portatil hacen viable un flujo de video a baja tasa de refresco sin GPU dedicada.
- Retoque fotografico por capas: al separar pelo, piel de la cara, piel del cuerpo y ropa en canales distintos, un editor puede aplicar ajustes de color, suavizado de piel o recoloreado del cabello de forma selectiva.
- Pipelina de matting de alta resolucion: la propia model card describe su combinacion con BiRefNet. Se multiplican las probabilidades reescaladas de este modelo por un matte de sujeto de alta resolucion para eliminar falsos positivos de fondo y recuperar los mechones finos de pelo que la mascara de 256x256 no resuelve.
- Probador virtual de ropa: la clase 4 (ropa) delimita la prenda sobre el cuerpo, lo que sirve de punto de partida para superponer una prenda sintetica en aplicaciones de comercio electronico.
- Generacion de avatares y stickers: las mascaras de cara y pelo permiten recortar el rostro y el cabello para componer avatares o pegatinas sin intervencion manual.
- Preprocesado en pipelines de vision sobre ONNX: al no requerir TensorFlow ni MediaPipe, se puede insertar como primer paso de un grafo ONNX mas amplio en un servidor de inferencia que ya use `onnxruntime`.
- Aplicaciones de escritorio y edicion local sin conexion: el modelo es lo bastante ligero para ejecutarse en CPU en herramientas de usuario final que evitan enviar las imagenes a un servicio en la nube por motivos de privacidad.
- Segmentacion por lotes en servidores sin GPU: la ejecucion en CPU permite procesar catalogos de imagenes en maquinas sin acelerador, con un coste aproximado de 35 ms por imagen en el procesador de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes, ya que no es un modelo de lenguaje ni un clasificador con conjunto de evaluacion publico). El unico dato de validacion es la comparacion de fidelidad entre el modelo original y la conversion:

| Prueba | Resultado |
|---|---|
| Diferencia absoluta maxima frente al TFLite original (LiteRT, 3 fotografias) | 3,7e-5 |
| Coincidencia de argmax por pixel frente al original | 100 % |
| Latencia de inferencia en CPU (Intel Core Ultra 9 185H, onnxruntime 1.30) | ~35 ms por imagen |
| Rendimiento secuencial derivado de esa latencia | ~28 imagenes por segundo (calculo derivado, no publicado por el autor) |

No se dispone de metricas de calidad de segmentacion (IoU, mIoU, F1) para este modelo en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo esta pensado y medido para CPU; no se publican requisitos de memoria. El repositorio se reporta como 0,0 GB, sin cifra exacta del fichero `onnx/model.onnx`.
- GPU recomendadas: no disponible. Al ser un modelo ONNX, `onnxruntime` podria ejecutarlo con proveedores CUDA, TensorRT o DirectML, pero el autor no publica mediciones en esos entornos.
- Viabilidad en GPU de consumo: no confirmada con datos. El modelo es pequeno y de entrada fija de 256x256, por lo que no requiere acelerador, pero no hay cifras publicadas para GPUs tipo RTX 4090 o similares.
- CPU: es el escenario de referencia. Medido en un Intel Core Ultra 9 185H con onnxruntime 1.30 y `CPUExecutionProvider`, con ~35 ms por inferencia.
- Opciones de despliegue: `onnxruntime` en cualquiera de sus proveedores de ejecucion. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput: ~35 ms por imagen y ~28 imagenes por segundo en ejecucion secuencial sobre el procesador citado. No hay datos de latencia con batching ni en GPU.

## Comparativa con modelos similares

| Modelo | Formato | Entrada | Clases | Latencia publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| senty-au/selfie_multiclass_256x256-ONNX (esta ficha) | ONNX opset 17 | 256x256 RGB float32 | 6 (fondo, pelo, piel cuerpo, piel cara, ropa, otros) | ~35 ms en CPU (Core Ultra 9 185H) | apache-2.0 | HuggingFace, 0 descargas |
| MediaPipe selfie_multiclass_256x256 (original de Google) | TFLite float32 | 256x256 RGB float32 | 6, identicas | no disponible en la informacion proporcionada | Apache-2.0 | Distribucion en Google Cloud Storage / MediaPipe |
| BiRefNet (mencionado en la model card como complemento) | no disponible | no disponible | matte de sujeto binario | no disponible | no disponible | no disponible |

La comparacion con el modelo original es directa: pesos identicos, mismas clases y mismo preprocesado, con la unica diferencia del formato de fichero y del runtime necesario. BiRefNet aparece citado por el autor como una etapa de matting de alta resolucion que se combina con este segmentador, no como un sustituto directo.

## Limitaciones y advertencias

- Resolucion de mascara fija de 256x256: los mechones finos de pelo en los bordes no se resuelven. El propio autor propone multiplicar por un matte de alta resolucion para corregirlo.
- Falsos positivos de fondo: la model card advierte de que la mascara upsampled puede marcar fondo como sujeto, de ahi la combinacion con BiRefNet.
- La salida son logits, no probabilidades. Es obligatorio aplicar softmax antes de interpretarlos como tal; omitirlo es un error frecuente al integrar el modelo.
- Preprocesado estricto: la imagen debe estirarse a 256x256 sin letterbox y normalizarse a [0,1] en RGB. Cualquier otro redimensionado altera los resultados.
- Ambito de uso restringido segun MediaPipe: encuadre tipo selfie y personas a pocos metros de la camara. MediaPipe recomienda leer su model card antes de usarlo en otros escenarios.
- No hay datos publicados sobre sesgos por tono de piel, iluminacion, genero o tipo de pelo. En un modelo de segmentacion de personas este es un riesgo relevante que no esta cuantificado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de predicciones incorrectas por pixel en condiciones fuera de distribucion.
- Licencia apache-2.0, compatible con uso comercial. Los pesos son © Google LLC y este repositorio solo cambia el formato, por lo que la atribucion a Google sigue siendo necesaria.
- Proyecto sin traccion: 0 descargas y 0 likes en HuggingFace, creado en 2026-09-18. No hay mantenimiento ni comunidad documentados.
- Auditar el fichero antes de usarlo en produccion: el autor publica el sha256 del ONNX (`35ec1ecd9ee7f85073c99c00020b7f6751b69506eeacf683bc8665f6117f85b0`), lo que permite verificar la integridad de la descarga.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/senty-au/selfie_multiclass_256x256-ONNX
- Model card de los modelos del Image Segmenter de MediaPipe (modelo original): https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter#multiclass-model
- Fichero TFLite de origen: https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/1/selfie_multiclass_256x256.tflite
- Proyecto que usa esta conversion (`painter.parts`): https://github.com/Rusya13/painter
- Los resultados de la busqueda web no contienen enlaces relevantes para este modelo: devuelven unicamente paginas de McAfee sin relacion con el segmentador.
