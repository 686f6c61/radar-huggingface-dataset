# phyloforfun/lm3_landmark_detector__yolo26x_pose_640

## Resumen

El modelo `lm3_landmark_detector__yolo26x_pose_640`, desarrollado por el usuario phyloforfun, es un detector de puntos clave (keypoint detection) basado en la arquitectura YOLO26x-pose de Ultralytics, adaptado específicamente al dominio de la botánica de herbario. Su función es predecir un esqueleto de 31 puntos clave sobre recortes de hojas individuales extraídos de pliegos de herbario, siguiendo el esquema `mid15_pet5` que incluye la traza del nervio medio, la traza del pecíolo, los ángulos del ápice y la base, y las líneas de anchura de la lámina foliar. Forma parte del ecosistema LeafMachine3 (LM3) en su versión 3.0.0, donde actúa como modelo `landmark_detector` por defecto entre las versiones 3.0.0 y 3.0.1061.

El modelo resuelve un problema concreto de digitalización de colecciones biológicas: la extracción automatizada de medidas morfométricas de hojas a partir de imágenes de herbario, una tarea que tradicionalmente requiere anotación manual. Al predecir puntos clave estructurados (ápice, base, nervio medio, pecíolo y anchura), permite derivar mediciones como longitudes, ángulos y proporciones de forma reproducible y a escala. Es relevante porque se integra en un pipeline completo de LM3 junto con detectores de planta y de hoja, y exporta a múltiples formatos de despliegue (ONNX, TorchScript, OpenVINO, Core ML) para ejecución tanto en servidor como en dispositivos Apple.

La arquitectura es YOLO26x-pose en modo end-to-end sin NMS, con pesos base `yolo26x-pose.pt` de Ultralytics. La entrada es un recorte de hoja con un borde blanco del 10% por cada lado, reescalado a 640 píxeles en formato letterbox RGB. La salida es una caja de clase única `leaf` más 31 puntos clave con coordenadas y confianza. El modelo se entrenó sobre 15.217 recortes de hoja individuales y se distribuye bajo licencia AGPL-3.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26x pose, end-to-end (sin NMS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | PyTorch (fp32), ONNX, TorchScript, OpenVINO, Core ML (fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch), `.onnx`, `.torchscript`, OpenVINO (`model_openvino_model/`), Core ML (`model.mlpackage/`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26x-pose de Ultralytics en configuración end-to-end sin NMS, partiendo de los pesos base `yolo26x-pose.pt`. La tarea es de clase única (`single_cls`): detectar una instancia `leaf` por imagen y predecir 31 puntos clave con su confianza asociada. El esquema de puntos clave `mid15_pet5` comprende `lamina_tip`, tres puntos de ápice (`apex_left`, `apex_center`, `apex_right`), quince puntos de traza del nervio medio (`midvein_0` a `midvein_14`), tres puntos de base (`base_left`, `base_center`, `base_right`), `lamina_base`, cinco puntos de traza del pecíolo (`petiole_0` a `petiole_4`), `petiole_tip` y dos puntos de anchura (`width_left`, `width_right`). El índice de volteo horizontal (`flip_idx`) está definido para intercambiar correctamente los puntos izquierda/derecha.

El entrenamiento se realizó durante 300 épocas sin parada temprana, con programación de tasa de aprendizaje coseno, batch automático y `close_mosaic=150` (mosaico desactivado en el 50% final). Las ganancias de pérdida fueron: box 2.0, cls 0.5, dfl 1.5, pose 20.0 y kobj 2.0. Se aplicó un criterio de estrictez por punto clave: los 11 puntos no pertenecientes a trazas usan sigma OKS de 1/124 en lugar de 1/31 y un peso RLE 4x, mientras que los 20 puntos de traza mantienen 1/31. La aumentación incluyó HSV (0.015/0.7/0.4), rotación de 180 grados, traslación 0.1, escala 0.5, volteo horizontal 0.5 y mosaico 1.0. El conjunto de datos `LM3_Landmarks_Pose` se construyó el 2026-07-23 a partir de 23 proyectos de anotación en Labelbox, con 15.217 recortes de hoja individuales y una partición determinista 80/10/10 (sal `lm3landmarks`): 12.258 imágenes de entrenamiento (358.054 instancias de puntos clave), 1.390 de validación (40.581) y 1.569 de test (45.808). Las polilíneas se remuestrearon al esqueleto `mid15_pet5`. Ni las imágenes ni las etiquetas se distribuyen.

## Capacidades

- Detección de una instancia de hoja (`leaf`) por imagen con caja delimitadora.
- Predicción de 31 puntos clave con coordenadas (x, y) y confianza por punto.
- Traza del nervio medio con 15 puntos (`midvein_0` a `midvein_14`).
- Traza del pecíolo con 5 puntos más el extremo (`petiole_0` a `petiole_4`, `petiole_tip`).
- Estimación de ángulos de ápice y base mediante tres puntos cada uno.
- Medición de anchura de la lámina mediante dos puntos (`width_left`, `width_right`).
- Soporte de volteo horizontal coherente mediante `flip_idx`.
- Exportación multiplataforma: ONNX (runtime por defecto en LM3 con onnxruntime), TorchScript (libtorch), OpenVINO (CPU/iGPU Intel) y Core ML (dispositivos Apple, con variante fp32 para GPU en macOS).
- Integración en el pipeline LeafMachine3 junto con el `plant_detector` para derivar `landmark_measurements`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de regresión de puntos clave.

## Casos de uso

- Digitalización masiva de herbarios: el modelo procesa recortes de hoja individuales y genera puntos clave estructurados que permiten derivar medidas morfométricas de forma automática sobre miles de pliegos, sustituyendo la anotación manual de ápice, base, nervio medio y pecíolo.
- Morfometría foliar comparativa: a partir de los 31 puntos clave se pueden calcular longitudes de nervio medio, longitud de pecíolo, ángulos apicales y basales, y anchura máxima, útiles en estudios de variación intraespecífica e interespecífica.
- Alimentación de modelos taxonómicos: las medidas derivadas sirven como características de entrada para clasificadores de especie o análisis morfométricos geométricos, dado que el modelo produce un esqueleto consistente y orientado (punto 0 en el extremo del ápice).
- Curaduría y control de calidad de colecciones: la confianza por punto clave y las métricas de pose permiten detectar recortes problemáticos (hojas dañadas, oclusiones, recortes mal encuadrados) y priorizar la revisión manual.
- Despliegue en estaciones de trabajo Apple: la exportación Core ML fp32 permite ejecutar el detector en la GPU de equipos macOS dentro del flujo de LM3, útil para digitalización en campo o en laboratorios sin GPU dedicada.
- Despliegue en servidores Intel sin GPU: la exportación OpenVINO permite inferencia en CPU/iGPU Intel, facilitando el procesamiento por lotes en infraestructura sin aceleradores NVIDIA.
- Investigación en visión por computador aplicada a biodiversidad: el modelo y sus metadatos de entrenamiento (esquema de puntos clave, `flip_idx`, particiones) sirven como referencia reproducible para desarrollar detectores de landmarks en dominios biológicos similares.

## Benchmarks y rendimiento

Resultados de evaluación con `val` de Ultralytics sobre `best.pt` a 640 píxeles (métricas de pose con OKS y sigma uniforme 1/31 por punto clave):

| Split | Box mAP50 | Box mAP50-95 | Pose mAP50 | Pose mAP50-95 | Pose P | Pose R |
|---|---|---|---|---|---|---|
| val | 0.995 | 0.878 | 0.773 | 0.448 | 0.863 | 0.862 |
| test | 0.995 | 0.878 | 0.763 | 0.433 | 0.853 | 0.853 |

No se han publicado en la información disponible resultados comparativos con otros modelos de detección de landmarks foliares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al ser un YOLO26x (variante extralarge) a 640 píxeles, la huella es moderada, pero no se especifica cifra concreta.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; la existencia de exportaciones OpenVINO y Core ML sugiere que puede ejecutarse en CPU/iGPU Intel y en GPU Apple, pero no se detallan requisitos mínimos.
- Opciones de despliegue: onnxruntime (runtime por defecto en LM3), Ultralytics PyTorch (`.pt`), libtorch (TorchScript), OpenVINO (CPU/iGPU Intel) y Core ML (dispositivos Apple, con variante fp32 para GPU en macOS).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Puntos clave | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lm3_landmark_detector__yolo26x_pose_640 | YOLO26x pose (sin NMS) | 31 (esqueleto `mid15_pet5`) | 640 letterbox con borde blanco 10% | AGPL-3.0 | Hugging Face (este repo) |
| lm3_landmark_detector__yolo26x_pose_640_canonical | YOLO26x pose (sin NMS) | 31 (esqueleto `mid15_pet5`) | 640 letterbox con borde blanco 10% | AGPL-3.0 | Hugging Face (repo hermano, etiquetas corregidas) |
| yolo26x-pose (Ultralytics, base) | YOLO26x pose (sin NMS) | Configuración de pose genérica | 640 | AGPL-3.0 | Ultralytics |

La información disponible no incluye comparativas con detectores de landmarks foliares de otros autores ni métricas cruzadas con el modelo base de Ultralytics.

## Limitaciones y advertencias

- El modelo solo acepta recortes de hoja con un borde blanco del 10% por cada lado; los recortes sin ese relleno no están soportados y requieren remapeo de puntos clave mediante `(p - 0.1) * 1.2` en coordenadas normalizadas.
- Está entrenado exclusivamente sobre hojas de herbario con una instancia por imagen; no está pensado para escenas con múltiples hojas, hojas ocluidas o imágenes de campo.
- El rendimiento en pose es moderado: Pose mAP50-95 de 0.448 en validación y 0.433 en test, con Pose mAP50 de 0.773 y 0.763 respectivamente; la localización fina de puntos clave es menos precisa que la detección de la caja (Box mAP50 de 0.995).
- Este modelo fue sustituido como predeterminado por `lm3_landmark_detector__yolo26x_pose_640_canonical`, entrenado con etiquetas corregidas; para nuevos despliegues conviene evaluar la versión canónica.
- Las imágenes y etiquetas del conjunto de datos no se distribuyen, lo que limita la reproducibilidad completa del entrenamiento.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código fuente derivado; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- No se han documentado sesgos específicos del dominio ni tasas de alucinación (no aplica en sentido estricto a un detector de puntos clave), pero la confianza por punto clave debe validarse en especies con morfologías atípicas (hojas lobuladas, compuestas o muy dañadas).
- No hay información sobre latencia, throughput ni requisitos mínimos de hardware, por lo que el dimensionamiento de producción debe medirse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phyloforfun/lm3_landmark_detector__yolo26x_pose_640
- Modelo canónico sucesor: https://huggingface.co/phyloforfun/lm3_landmark_detector__yolo26x_pose_640_canonical
- Modelos con etiqueta `leafmachine3` en Hugging Face: https://huggingface.co/models?other=leafmachine3
- Documentación de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
