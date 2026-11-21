# software-mansion/react-native-executorch-yolo26-pose

## Resumen

yolo26-pose es un modelo de deteccion de keypoints (pose estimation) derivado de la familia YOLO26 de Ultralytics y exportado por Software Mansion para su uso con la libreria React Native ExecuTorch. El repositorio no contiene pesos en formato convencional (safetensors o GGUF) sino programas `.pte` compilados con ExecuTorch v1.4.1, listos para ejecutarse en dispositivo (on-device) en aplicaciones moviles React Native. El modelo resuelve la deteccion de esqueletos humanos en imagenes, devolviendo keypoints con sus coordenadas y niveles de confianza.

La variante publicada es `yolo26n_pose` (la "n" indica el tamano nano de la familia YOLO26), exportada en tres resoluciones de entrada (384, 512 y 640 pixeles) y para tres backends de ejecucion: Vulkan (fp16), CoreML (fp16) y XNNPACK (fp32 e int8). Los ficheros `.pte` ocupan entre 5,8 MB (Vulkan) y 11,4 MB (XNNPACK fp32), lo que los hace aptos para despliegue en dispositivos moviles sin depender de la nube.

Su relevancia actual radica en que ejemplifica el flujo de trabajo de inferencia on-device para vision por computador en React Native: el modelo se distribuye ya compilado para el runtime de ExecuTorch, con variantes optimizadas por backend y una version int8 con perdida de precision documentada. La licencia AGPL-3.0 es un factor critico para cualquier evaluacion de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de keypoints, familia Ultralytics); exportado a ExecuTorch `.pte` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | fp16 (Vulkan, CoreML), fp32 (XNNPACK), int8 estatico PT2E con pesos per-channel (XNNPACK) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pte` (ExecuTorch, runtime v1.4.1) |

## Arquitectura y entrenamiento

El modelo subyacente es YOLO26 en su tarea de pose estimation, segun la documentacion de Ultralytics referenciada en la model card. Se trata de un detector de una sola etapa que localiza personas y predice keypoints sobre ellas; la exportacion a ExecuTorch produce un grafo compilado para el runtime movil. La model card no detalla la composicion del dataset de entrenamiento ni el numero de tokens o imagenes utilizadas, mas alla de la referencia a COCO val2017 para la evaluacion de la variante cuantizada.

La innovacion tecnica documentada es la cuantizacion estatica int8 (PT2E) para el backend XNNPACK, en la que se mantienen en fp32 la primera convolucion, las salidas del neck (capas 16, 19 y 22) y la cabeza de pose, mientras el resto de la red se cuantiza con pesos per-channel. Esta estrategia selectiva preserva la precision en las partes mas sensibles del modelo. El backend MLX fue exportado pero no publicado; el repositorio incluye un `NOTES.md` que documenta el fallo.

## Capacidades

- Deteccion de keypoints de pose humana sobre imagenes, con pipeline `keypoint-detection`.
- Tres resoluciones de entrada soportadas: 384, 512 y 640 pixeles.
- Ejecucion on-device en React Native mediante la libreria `react-native-executorch`.
- Backends multiples: Vulkan (GPU movil, fp16), CoreML (Apple, fp16) y XNNPACK (CPU, fp32 e int8).
- Variante int8 optimizada para CPU con perdida de precision documentada y medida.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No se documentan capacidades de vision mas alla de la estimacion de pose (no hay deteccion de objetos generica ni segmentacion en esta publicacion).

## Casos de uso

- Monitorizacion de ejercicio en aplicaciones moviles: el modelo puede ejecutarse on-device en el telefono para contar repeticiones y corregir la postura del usuario en tiempo real, sin enviar video a la nube, usando la variante CoreML en iOS o Vulkan en Android.
- Analisis ergonomico en el puesto de trabajo: integrado en una app de escritorio o movil, permite estimar la postura de un trabajador frente a la camara y generar alertas cuando se detectan posturas de riesgo, aprovechando la entrada a 640 px para mayor precision.
- Animacion y motion capture ligera: extraccion de esqueletos de video para alimentar rigs de personajes en herramientas de creacion de contenido, usando la variante int8 para procesar fotogramas en CPU con bajo consumo.
- Rehabilitacion fisioterapeutica: seguimiento de rangos de movimiento articular en sesiones guiadas por app, con inferencia local que preserva la privacidad del paciente y funciona sin conectividad.
- Deporte y entrenamiento tecnico: analisis de la tecnica de carrera o levantamiento de pesas a partir de video grabado con el movil, comparando angulos articulares entre repeticiones.
- Control por gestos y presencia: deteccion de la pose del usuario para activar interfaces o modos de camara en aplicaciones React Native, con la variante 384 como opcion de baja latencia.
- Prototipado rapido de vision on-device: el paquete de variantes por backend y resolucion permite comparar latencia y precision en un mismo dispositivo sin reexportar el modelo.

## Benchmarks y rendimiento

La model card reporta COCO keypoint (OKS) mAP50-95 sobre las primeras 500 imagenes de val2017, comparando fp32 e int8 en el backend XNNPACK:

| Resolucion | fp32 | int8 |
|---|---|---|
| 384 | 46.08 | 45.32 |
| 512 | 52.53 | 51.82 |
| 640 | 56.55 | 56.13 |

No se han publicado resultados de latencia ni throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional; el modelo esta pensado para ejecucion on-device. Los ficheros ocupan entre 5,8 MB (Vulkan fp16) y 11,4 MB (XNNPACK fp32), y 6,7 MB en int8.
- GPU recomendadas: no se especifican. El backend Vulkan apunta a GPU integradas en dispositivos moviles Android; CoreML a la Neural Engine/GPU de Apple; XNNPACK a CPU.
- Cabe en cualquier dispositivo movil moderno; no requiere GPU de escritorio. No se documenta su uso en A100, H100 o RTX 4090, que no son el objetivo del artefacto.
- Opciones de despliegue: runtime ExecuTorch v1.4.1 y la libreria `react-native-executorch`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Resoluciones | Backends | Licencia | Formato |
|---|---|---|---|---|---|
| yolo26-pose (este) | YOLO26 nano pose | 384 / 512 / 640 | Vulkan, CoreML, XNNPACK | AGPL-3.0 | `.pte` |
| YOLOv8-pose (Ultralytics) | YOLOv8 pose | multiples | ONNX, TFLite, CoreML, etc. | AGPL-3.0 | varios |
| MediaPipe Pose | BlazePose | 256 (tipico) | TFLite / MediaPipe | Apache-2.0 | `.tflite` |
| MoveNet (TensorFlow) | MoveNet | 192 / 256 | TFLite | Apache-2.0 | `.tflite` |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales. MediaPipe Pose y MoveNet emplean licencias permisivas, lo que puede ser determinante frente a la AGPL-3.0 de la familia Ultralytics.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en productos distribuidos o servicios en red puede obligar a liberar el codigo fuente bajo los mismos terminos. Es un obstaculo importante para uso comercial propietario.
- Solo se publica la variante nano (`yolo26n_pose`); no hay versiones S, M o L en este repositorio, lo que limita el techo de precision.
- El backend MLX fue exportado pero no publicado; el motivo esta documentado en `mlx/NOTES.md` y debe revisarse si se necesita ese backend.
- Compatibilidad estricta con ExecuTorch v1.4.1: el runtime no garantiza compatibilidad hacia adelante, por lo que versiones anteriores pueden fallar al cargar los `.pte`.
- La cuantizacion int8 reduce la precision entre 0,42 y 0,76 puntos de mAP50-95 segun resolucion; evaluar el impacto en el caso de uso concreto.
- No hay informacion sobre sesgos del modelo (por ejemplo, sesgos de genero, tono de piel o complexiones en la deteccion de keypoints) ni sobre el dataset de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de falsos positivos y keypoints mal localizados en oclusiones, poses atipicas o imagenes de baja calidad, no cuantificado en la model card.
- No se documentan idiomas ni capacidades multilingues porque no es un modelo de lenguaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-yolo26-pose
- Modelo upstream (tarea pose de Ultralytics): https://docs.ultralytics.com/tasks/pose/
- Libreria React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentacion de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Notas del backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-yolo26-pose/blob/main/mlx/NOTES.md
