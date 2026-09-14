# azemel/retinaface-xs

## Resumen

RetinaFace-xs es un repositorio de checkpoints de entrenamiento para deteccion de caras (face detection) publicado por el usuario azemel en HuggingFace. No se trata de un modelo unico, sino de una coleccion de pesos derivados de un pipeline privado de entrenamiento y de un barrido de compresion: para cada backbone se publican los checkpoints en float32 junto con versiones comprimidas mediante clustering de pesos con distinto numero de clusters (2, 4, 5, 7, 8, 12, 32, 64, 128 y 256), ademas de los artefactos ya exportados a ONNX y CoreML.

El modelo resuelve el problema clasico de deteccion de rostros con la arquitectura RetinaFace, un detector de una sola etapa con feature pyramid que predice cajas, puntos faciales y puntuaciones de confianza. Los backbones disponibles son MobileNetV1 (en escalas 1.0, 0.50 y 0.25), MobileNetV2 y ResNet18/34, con el barrido de compresion de ResNet50 todavia en ejecucion. El enfoque del repositorio es practico: ofrecer variantes con distintos compromisos entre precision y tamano para despliegue en produccion.

La relevancia actual viene de su orientacion a eficiencia. La variante mobilenetv1_0.25 comprimida a 12 clusters ocupa 0.57 MB en formato ONNX comprimido y alcanza un mean AP de 68.26 en WIDER FACE, mientras que resnet34 con 4 clusters ocupa 5.85 MB y llega a 77.28 de mean AP. Todas las exportaciones ONNX se han verificado contra su origen PyTorch sobre el conjunto completo de validacion de WIDER FACE (3226 imagenes), con una diferencia maxima de 0.09% en mean AP, lo que da garantias de fidelidad numerica en el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaFace (detector de caras de una etapa con feature pyramid) sobre backbones CNN: MobileNetV1 (1.0, 0.50, 0.25), MobileNetV2, ResNet18, ResNet34, ResNet50 |
| Parametros totales | No disponible (el repositorio no declara recuento de parametros por backbone) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, sin ventana de contexto de texto) |
| Tipos de cuantizacion | Clustering de pesos con N clusters (2, 4, 5, 7, 8, 12, 32, 64, 128, 256) mas baseline float32 sin comprimir |
| Idiomas soportados | No disponible (modelo de vision, sin componente de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pth` dentro de ZIP), ONNX y CoreML |

## Arquitectura y entrenamiento

La base es RetinaFace, un detector de caras de una sola etapa que combina un backbone convolucional con una feature pyramid network. La cabeza de prediccion produce simultaneamente cajas delimitadoras, puntos clave faciales (landmarks) y puntuaciones de confianza por ancla. El repositorio no describe en detalle el dataset de entrenamiento ni el numero de tokens o imagenes usadas, mas alla de que procede de un pipeline de entrenamiento privado del autor; toda la evaluacion reportada se hace sobre el conjunto de validacion de WIDER FACE (3226 imagenes), con las metricas estandar AP en los subconjuntos easy, medium y hard.

La innovacion destacable del repositorio no esta en la arquitectura sino en el pipeline de compresion. Sobre cada backbone entrenado se aplica un barrido de clustering de pesos, generando variantes con distinto numero de clusters que actuan como niveles de compresion. De cada backbone se selecciona un nivel (marcado en negrita en la model card) que representa el mejor compromiso entre precision y tamano. El pipeline de exportacion verifica cada artefacto ONNX contra su fuente PyTorch sobre las 3226 imagenes de validacion, con una discrepancia maxima de 0.09% en mean AP, y genera tambien artefactos CoreML para los mismos recuentos de clusters (salvo el baseline float32, que todavia no esta exportado a CoreML en todos los casos).

## Capacidades

- Deteccion de caras en imagenes: localizacion de rostros con cajas delimitadoras y puntuacion de confianza por deteccion.
- Prediccion de landmarks faciales: la arquitectura RetinaFace incorpora regresion de puntos clave faciales ademas de las cajas.
- Inferencia en CPU y en aceleradores: los tamanos de las variantes comprimidas (desde 0.31 MB) permiten ejecucion en dispositivos sin GPU.
- Despliegue multiplataforma: exportaciones disponibles en PyTorch, ONNX y CoreML, esta ultima orientada a Apple Neural Engine.
- Deteccion multiescala: cobertura de caras de distintos tamanos gracias a la piramide de caracteristicas, evaluada en los subconjuntos easy, medium y hard de WIDER FACE.
- Seleccion por presupuesto de recursos: el barrido de clusters permite elegir entre mas de diez niveles de compresion por backbone.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Modo thinking, vision general, audio: no disponible; el modelo esta especializado exclusivamente en deteccion facial.

## Casos de uso

- Desbloqueo facial en aplicaciones moviles: la variante mobilenetv1_0.25 con 12 clusters (0.57 MB en ONNX comprimido) puede embeberse directamente en una app iOS o Android y ejecutarse en el dispositivo para verificar la presencia y posicion del rostro antes de lanzar el reconocimiento biometrico.
- Preprocesado en pipelines de reconocimiento facial: usar el detector como primera etapa que recorta y alinea rostros mediante los landmarks predichos, alimentando despues un modelo de embeddings faciales.
- Moderacion de contenido en plataformas: deteccion de rostros en imagenes subidas por usuarios para anonimizacion automatica (desenfoque) antes de su publicacion, con la variante resnet34 de 4 clusters (5.85 MB) si se necesita mayor precision.
- Analitica de afluencia en retail o espacios publicos: conteo y localizacion de personas en flujos de video, eligiendo el nivel de compresion en funcion del hardware disponible en el edge.
- Fotografia computacional: deteccion de caras en la camara para enfocar automaticamente, aplicar seguimiento del sujeto o efectos de retoque facial en tiempo real.
- Control de acceso y presencia en videoconferencia: deteccion de si hay un rostro en el encuadre y su posicion para encuadre automatico o para activar funciones de la aplicacion.
- Anonimizacion en conjuntos de datos: procesar lotes de imagenes para censurar rostros antes de publicar datasets, con la opcion de ejecutar en CPU y sin GPU dedicada.
- Verificacion de identidad documental: deteccion del rostro en fotografias de DNI o pasaporte como paso previo a la comparacion biometrica, desplegando el modelo como ONNX Runtime en el backend.

## Benchmarks y rendimiento

Resultados de validacion sobre WIDER FACE (3226 imagenes), AP en porcentaje. Los valores mostrados son los de PyTorch; los ONNX coinciden con una diferencia maxima de 0.09%. La fila en negrita es el nivel seleccionado por el autor para cada backbone.

| Backbone | Clusters | Easy AP | Medium AP | Hard AP | Mean AP | Tamano ONNX (raw / zip) |
|---|---|---|---|---|---|---|
| mobilenetv1 | float32 | -- | -- | -- | -- | 19.60 / 15.58 MB |
| mobilenetv1 | 2 | 80.81 | 68.62 | 32.93 | 60.78 | 7.61 / 1.04 MB |
| mobilenetv1 | 7 (seleccionado) | 87.84 | 80.28 | 46.26 | 71.46 | 7.61 / 2.20 MB |
| mobilenetv1 | 64 | 89.14 | 81.40 | 47.29 | 72.61 | 9.25 / 5.27 MB |
| mobilenetv1 | 256 | 89.12 | 81.42 | 46.88 | 72.47 | 14.07 / 10.44 MB |
| mobilenetv1_0.25 | float32 | -- | -- | -- | -- | 4.70 / 1.77 MB |
| mobilenetv1_0.25 | 2 | 60.77 | 42.77 | 18.07 | 40.54 | 3.53 / 0.31 MB |
| mobilenetv1_0.25 | 12 (seleccionado) | 86.94 | 77.09 | 40.73 | 68.26 | 3.62 / 0.57 MB |
| mobilenetv1_0.25 | 128 | 86.15 | 76.37 | 40.44 | 67.65 | 4.30 / 1.36 MB |
| mobilenetv1_0.25 | 256 | 86.24 | 76.37 | 40.57 | 67.73 | 4.51 / 1.56 MB |
| mobilenetv1_0.50 | float32 | -- | -- | -- | -- | 9.61 / 6.32 MB |
| mobilenetv1_0.50 | 2 | 69.44 | 49.71 | 20.80 | 46.65 | 4.82 / 0.56 MB |
| mobilenetv1_0.50 | 8 (seleccionado) | 86.59 | 77.97 | 42.36 | 68.97 | 4.95 / 1.13 MB |
| mobilenetv1_0.50 | 256 | 87.34 | 79.34 | 44.30 | 70.32 | 7.97 / 4.75 MB |
| mobilenetv2 | float32 | -- | -- | -- | -- | 15.46 / 11.75 MB |
| mobilenetv2 | 2 | 79.56 | 65.78 | 29.78 | 58.38 | 6.54 / 0.97 MB |
| mobilenetv2 | 5 (seleccionado) | 91.18 | 84.27 | 51.87 | 75.77 | 6.74 / 1.71 MB |
| mobilenetv2 | 64 | 91.73 | 85.80 | 55.04 | 77.53 | 9.07 / 5.25 MB |
| mobilenetv2 | 256 | 91.88 | 86.24 | 55.91 | 78.01 | 12.33 / 8.51 MB |
| resnet18 | float32 | -- | -- | -- | -- | 51.04 / 44.80 MB |
| resnet18 | 2 | 85.83 | 74.42 | 36.22 | 65.49 | 15.16 / 2.02 MB |
| resnet18 | 5 (seleccionado) | 91.23 | 84.41 | 51.10 | 75.58 | 15.23 / 3.80 MB |
| resnet18 | 32 | 91.94 | 85.64 | 52.06 | 76.55 | 15.89 / 8.71 MB |
| resnet18 | 256 | 91.81 | 85.85 | 53.04 | 76.90 | 20.67 / 17.36 MB |
| resnet34 | float32 | -- | -- | -- | -- | 91.47 / 82.37 MB |
| resnet34 | 2 | 89.10 | 81.24 | 43.98 | 71.44 | 25.36 / 3.46 MB |
| resnet34 | 4 (seleccionado) | 92.36 | 86.29 | 53.18 | 77.28 | 25.43 / 5.85 MB |
| resnet34 | 128 | 92.62 | 87.08 | 55.13 | -- (truncado en la fuente) | no disponible |

Notas: los niveles float32 no tienen metricas AP publicadas en la model card, solo tamanos. El barrido de compresion de resnet50 todavia estaba en ejecucion en el momento de publicar la model card, por lo que no hay tabla de metricas para ese backbone (solo checkpoints crudos en `checkpoints/resnet50/pytorch/`). La tabla de resnet34 se corta en el nivel de 128 clusters en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB para todas las variantes segun el tamano de los pesos (de 0.31 MB a 91.47 MB en ONNX); el consumo real depende del tamano de lote, la resolucion de entrada y el backend.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; para lotes grandes se recomienda RTX 3060/4060 o superiores. En centro de datos, A100 o H100 solo tendrian sentido para inferencia masiva por lotes, no por requisitos de memoria.
- Cabe en GPU de consumo: si, en todas las variantes. Las versiones comprimidas de MobileNet pueden ejecutarse incluso en CPU o en el NPU de un movil.
- Opciones de despliegue: PyTorch (checkpoints `state_dict`), ONNX Runtime (artefactos ONNX verificados), Core ML / Apple Neural Engine (artefactos CoreML), y conversion adicional a TensorRT o a otros runtimes compatibles con ONNX.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de latencia ni de imagenes por segundo.
- Almacenamiento: el repositorio completo ocupa 2.5 GB, ya que incluye todos los backbones y todos los niveles de compresion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (WIDER FACE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaFace-xs (este repositorio) | no disponible | no aplica | mean AP de 40.54 a 77.28 segun backbone y nivel de compresion | MIT | HuggingFace |
| RetinaFace original (InsightFace) | no disponible en la informacion disponible | no aplica | no disponible en la informacion disponible | no disponible | no disponible |
| MTCNN | no disponible en la informacion disponible | no aplica | no disponible en la informacion disponible | no disponible | no disponible |
| SCRFD | no disponible en la informacion disponible | no aplica | no disponible en la informacion disponible | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para comparar cifras de parametros o de precision frente a estas alternativas. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre detectores comparables.

## Limitaciones y advertencias

- Ambiguedad de nomenclatura: el repositorio se llama `retinaface-xs`, pero contiene seis familias de backbone distintas. La model card no indica que backbone corresponde a la etiqueta "xs", asi que conviene verificar en la ruta `checkpoints/<arch>/` que variante se esta descargando.
- Ausencia de metricas para float32: la model card solo publica tamano para los checkpoints sin comprimir, no AP. No se puede saber cuanto se pierde por el clustering a partir de esos datos.
- ResNet50 incompleto: no hay tabla de metricas y el barrido de compresion seguia en ejecucion; sus checkpoints crudos existen pero sin seleccion de nivel ni artefactos exportados documentados.
- Clustering de pesos como compresion: los niveles con muy pocos clusters degradan notablemente la precision (por ejemplo, mobilenetv1 con 2 clusters baja a 60.78 de mean AP frente a 72.61 con 64 clusters). Hay que elegir el nivel con criterio y validar en el dominio propio.
- Rendimiento en subconjunto hard bajo: incluso las mejores variantes documentadas se quedan en torno a 53-55 AP en el subconjunto hard de WIDER FACE, lo que implica dificultades con caras pequenas, ocluidas o en poses extremas.
- Sesgos: no hay informacion en la model card sobre la composicion demografica del dataset de entrenamiento ni sobre evaluaciones de equidad por tono de piel, genero o edad. Es un riesgo relevante en vigilancia y control de acceso.
- Alucinacion: no aplica como tal, pero si existen falsos positivos y falsos negativos propios de un detector; el umbral de confianza debe calibrarse en produccion.
- Exports CoreML incompletos: no todos los niveles de cluster ni el baseline float32 tienen artefacto CoreML; hay que comprobar la tabla de disponibilidad antes de planificar un despliegue en Apple.
- Licencia MIT: permisiva y apta para uso comercial, pero el autor no ofrece garantias sobre el origen de los datos de entrenamiento ni sobre el cumplimiento de normativas de proteccion de datos en aplicaciones de reconocimiento facial, que en la UE estan sujetas a restricciones adicionales (RGPD y el reglamento de IA).
- Escasez de adopcion: cero descargas y cero likes en el momento de la consulta, sin documentacion externa ni issues que permitan contrastar el comportamiento en produccion.
- Nomenclatura de ficheros: cada ZIP contiene exactamente un `checkpoint.pth`, por lo que es necesario extraerlo antes de cargarlo con `torch.load`.

## Enlaces

- HuggingFace: https://huggingface.co/azemel/retinaface-xs
- No se han encontrado en la busqueda web enlaces relevantes al modelo, papers, blogs ni repositorios asociados. No disponible.
