# phyloforfun/lm3_landmark_detector__yolo26x_pose_640_canonical

## Resumen

lm3_landmark_detector__yolo26x_pose_640_canonical es un modelo de estimacion de pose (keypoint detection) desarrollado por phyloforfun dentro del proyecto LeafMachine3. Su funcion es predecir un esqueleto de 31 puntos clave sobre recortes de hojas individuales procedentes de pliegos de herbario, siguiendo el esquema `mid15_pet5`. Se trata de un YOLO26x-pose end-to-end (sin NMS) construido sobre los pesos base `yolo26x-pose.pt` de Ultralytics.

El modelo resuelve un problema especifico de digitalizacion botanica: la extraccion geometrica consistente de la morfologia foliar (apice, base, nervio medio, peciolo y anchura) a partir de imagenes de especimenes. Esta version "canonical" sustituye a `lm3_landmark_detector__yolo26x_pose_640` manteniendo la misma entrada, salida y orden de keypoints, pero entrenada sobre etiquetas corregidas con una regla anatomica unica.

Es relevante porque es el modelo `landmark_detector` por defecto de LeafMachine3 3.0.0, con soporte multiformato (PyTorch, ONNX, TorchScript, OpenVINO, Core ML) y un conjunto de correcciones de etiquetado documentado que afecta a 8.632 de 15.178 recortes. Entrada de 640 px con letterbox, un unico box de clase `leaf` y 31 keypoints con confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26x pose, end-to-end (NMS-free) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en fp32 para Core ML; ONNX, TorchScript, OpenVINO y PyTorch sin cuantizar declarada) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`model.onnx`), TorchScript (`model.torchscript`), OpenVINO (`model_openvino_model/`), Core ML fp32 (`model.mlpackage/`) |

## Arquitectura y entrenamiento

El modelo es un detector de pose YOLO26x de Ultralytics en configuracion end-to-end, es decir, sin supresion no maxima (NMS) en la etapa de inferencia. Predice un unico box de clase `leaf` junto con 31 keypoints, cada uno con coordenadas (x, y) y confianza. Los keypoints siguen el esquema `mid15_pet5`: `lamina_tip`; `apex_left`, `apex_center`, `apex_right`; `midvein_0` a `midvein_14`; `base_left`, `base_center`, `base_right`; `lamina_base`; `petiole_0` a `petiole_4`, `petiole_tip`; `width_left`, `width_right`. Incluye un `flip_idx` definido para el intercambio izquierda/derecha en aumentado de datos.

El entrenamiento se realizo el 2026-11-06 (iteracion 3) sobre el dataset `LM3_Landmarks_Pose_it2`, construido el 2026-11-04 corrigiendo las etiquetas de `LM3_Landmarks_Pose` (23 proyectos de Labelbox). Se mantienen las mismas imagenes, el mismo split 80/10/10 y el mismo remuestreo `mid15_pet5`. El conjunto consta de 15.178 recortes de hoja individual, con un unico `leaf` por imagen: 12.225 imagenes de entrenamiento (357.929 instancias de keypoints), 1.387 de validacion (40.598 instancias) y 1.566 de test (45.807 instancias). No se reanoto manualmente nada; las correcciones se calcularon a partir de la geometria dibujada y afectaron a 8.632 recortes. Se corrigieron el orden izquierda/derecha (anchura 5.351, apice 4.562, base 4.990), la direccion del nervio medio (619), la punta del peciolo (2.342 movidos, 151 rellenados), angulos dibujados como dos brazos separados (apice 304, base 303), angulos con vertices extra (apice 310, base 406) y anchura con vertices extra (63). 234 puntos o pares no orientables se marcaron como no etiquetados y 39 recortes sin nada utilizable se descartaron. La entrada requiere un borde blanco del 10% por lado antes del letterbox a 640; los recortes sin ese padding no estan soportados.

## Capacidades

- Deteccion de pose sobre recortes de hoja individual con 31 keypoints y confianza por punto.
- Deteccion de un unico box de clase `leaf` por imagen.
- Prediccion de esqueleto foliar: apice, base, nervio medio (15 puntos), peciolo (6 puntos) y anchura.
- Inferencia end-to-end sin NMS, lo que simplifica el postprocesado.
- Exportacion a multiples runtimes: ONNX (runtime por defecto de LM3), Core ML en GPU de Apple, TorchScript/libtorch, OpenVINO para CPU/iGPU Intel y PyTorch para reentrenamiento.
- Integracion como modelo por defecto del modulo `landmark_detector` de LeafMachine3 3.0.0.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision puro.

## Casos de uso

- Digitalizacion de colecciones de herbario: el modelo extrae la geometria foliar de cada recorte de hoja para alimentar bases de datos morfometricas, aprovechando la consistencia del esquema de 31 keypoints y la correccion anatomica de las etiquetas.
- Morfometria automatizada: calculo de longitud de nervio medio, anchura maxima, longitud de peciolo y angulos apical/basal a partir de los keypoints predichos, con aplicacion en taxonomia y estudios de forma.
- Pipelines de fenotipado de alta productividad: procesamiento por lotes de miles de especimenes mediante el runtime ONNX u OpenVINO, con el padding del 10% aplicado de forma programatica antes del letterbox.
- Despliegue en macOS: uso del paquete Core ML fp32 para ejecutar la deteccion en la GPU de Apple dentro de flujos de trabajo de LeafMachine3 en estaciones de trabajo Mac.
- Despliegue en CPU Intel: variante OpenVINO para servidores o equipos sin GPU dedicada en laboratorios de botanica.
- Reentrenamiento y adaptacion: partiendo de `best.pt`, ajustar el modelo a nuevas especies, regiones o esquemas de etiquetado manteniendo el orden de keypoints y el `flip_idx`.
- Control de calidad de anotaciones: comparar las predicciones con etiquetas existentes para detectar inconsistencias de orden izquierda/derecha, direccion del nervio medio o posicion del peciolo, que son precisamente los errores corregidos en esta version.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona un fichero `evaluation_comparison.json` con la comparacion frente al modelo por defecto anterior (`lm3_landmark_detector__yolo26x_pose_640`), pero no se incluyen las cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El tamano del repo es de 2,8 GB, lo que incluye todos los formatos exportados, no solo un conjunto de pesos.
- GPU recomendadas: no disponible. El modelo base es un YOLO26x-pose de Ultralytics, pero no se especifican requisitos de GPU en la model card.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (runtime por defecto de LM3), Core ML en macOS (GPU de Apple, fp32), TorchScript/libtorch, OpenVINO para CPU/iGPU Intel y PyTorch mediante Ultralytics.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Keypoints | Formatos | Licencia | Estado |
|---|---|---|---|---|---|
| lm3_landmark_detector__yolo26x_pose_640_canonical | YOLO26x pose end-to-end | 31 (`mid15_pet5`) | PyTorch, ONNX, TorchScript, OpenVINO, Core ML | AGPL-3.0 | Modelo por defecto de LM3 3.0.0 |
| lm3_landmark_detector__yolo26x_pose_640 | YOLO26x pose end-to-end | 31 (`mid15_pet5`) | no disponible en la informacion | AGPL-3.0 | Sustituido por la version canonical |
| Otros modelos de keypoint detection de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo anterior del mismo autor, que comparte entrada, salida y orden de keypoints y queda reemplazado por esta version entrenada con etiquetas corregidas.

## Limitaciones y advertencias

- Dominio muy restringido: solo recortes de hoja individual procedentes de pliegos de herbario; no esta pensado para imagenes generales ni para hojas en contexto natural sin recorte previo.
- Requiere el padding blanco del 10% por lado antes del letterbox a 640; los recortes sin padding no estan soportados y produciran resultados incorrectos.
- Las imagenes y etiquetas del dataset no se distribuyen, lo que limita la reproducibilidad del entrenamiento.
- 234 puntos o pares quedaron marcados como no etiquetados por no ser orientables, y 39 recortes se descartaron; puede haber casos ambiguos en produccion con el mismo problema.
- Riesgo de sesgo hacia la composicion del dataset `LM3_Landmarks_Pose_it2` (23 proyectos de Labelbox), sin informacion sobre diversidad taxonomica o geografica.
- Riesgo de alucinacion de keypoints en hojas danadas, incompletas u ocluidas; las confianzas por punto deben usarse para filtrar.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y distribucion; revisar compatibilidad antes de uso comercial propietario. Los pesos base de Ultralytics tambien son AGPL-3.0.
- No disponible informacion sobre latencia, throughput ni requisitos minimos de hardware, lo que dificulta el dimensionamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phyloforfun/lm3_landmark_detector__yolo26x_pose_640_canonical
- Modelo anterior sustituido: https://huggingface.co/phyloforfun/lm3_landmark_detector__yolo26x_pose_640
- Ultralytics (framework y pesos base YOLO26x-pose): https://github.com/ultralytics/ultralytics
- No se han proporcionado otros enlaces (papers, blogs, demos) en la informacion disponible.
