# phyloforfun/lm3_landmark_detector__yolo26x_pose_640_canonical

## Resumen

lm3_landmark_detector__yolo26x_pose_640_canonical es un modelo de deteccion de puntos clave (keypoint detection) especializado en la estimacion del esqueleto de hojas individuales recortadas de pliegos de herbario. Lo desarrolla el usuario phyloforfun dentro del proyecto LeafMachine3 (LM3), una herramienta de digitalizacion y analisis automatizado de colecciones botanicas. El modelo predice 31 puntos anatomicos que describen la lamina foliar, el nervio medio, el peciolo y los ejes de anchura, lo que permite medir rasgos morfologicos de forma reproducible.

Tecnicamente se trata de un YOLO26x-pose en configuracion end-to-end (sin NMS), derivado de los pesos base `yolo26x-pose.pt` de Ultralytics. Trabaja sobre recortes de una sola hoja con un margen blanco del 10 % por cada lado, redimensionados a 640 px con letterbox en RGB, y devuelve una caja de clase `leaf` mas 31 keypoints con sus coordenadas y confianza. Se distribuye en cuatro formatos (PyTorch, ONNX, TorchScript y OpenVINO) y es el modelo `landmark_detector` por defecto de LeafMachine3, sustituyendo a la version anterior `lm3_landmark_detector__yolo26x_pose_640` con la misma interfaz de entrada, salida y orden de keypoints.

La relevancia actual del modelo reside en la correccion sistematica de etiquetas: frente a la version previa, se aplico una regla anatomica unica a todas las hojas (izquierda y derecha relativas al nervio medio con el apice hacia arriba), lo que afecto a 8.632 de los 15.178 recortes. Esto convierte el modelo en una pieza util para pipelines de fenotipado morfologico a gran escala en colecciones de herbario, donde la coherencia del etiquetado geometrico es critica para la comparabilidad de las mediciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26x pose, end-to-end (NMS-free) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 640 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en PyTorch, ONNX, TorchScript y OpenVINO) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (PyTorch/Ultralytics), `model.onnx`, `model.torchscript`, `model_openvino_model/` |
| Pipeline | keypoint-detection |
| Libreria | ultralytics |
| Entrada | recorte de hoja con borde blanco del 10 % por lado, letterbox 640, RGB |
| Salida | 1 caja clase `leaf` + 31 keypoints (x, y, conf) |
| Keypoints | 31 (lamina_tip; apex_left/center/right; midvein_0..14; base_left/center/right; lamina_base; petiole_0..4, petiole_tip; width_left, width_right) |
| Tamano del repo | 0,8 GB |
| Fecha de entrenamiento | 2026-11-06 |
| Version LM3 | 3.0.0 (minima soportada) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26x-pose de Ultralytics en modalidad end-to-end, es decir, sin supresion de no maximos (NMS) en la etapa de post-proceso, lo que simplifica el despliegue y reduce la latencia en produccion. La cabeza de pose predice simultaneamente la caja del objeto y los 31 keypoints, con un `flip_idx` definido para el volteo horizontal que intercambia los puntos izquierda/derecha de apice, base y anchura. El modelo parte de los pesos base `yolo26x-pose.pt` y se reentrena sobre el dataset especifico de landmarks foliares.

El entrenamiento se realizo sobre el dataset `LM3_Landmarks_Pose_it2`, construido el 2026-11-04 corrigiendo las etiquetas de `LM3_Landmarks_Pose` (23 proyectos de landmarks en Labelbox). Se mantienen las mismas imagenes, el mismo split 80/10/10 y el mismo remuestreo `mid15_pet5`. El conjunto contiene 15.178 recortes de una sola hoja, con una instancia `leaf` por imagen: 12.225 imagenes de entrenamiento (357.929 instancias de keypoints), 1.387 de validacion (40.598 instancias) y 1.566 de test (45.807 instancias). Las correcciones no fueron reanotaciones manuales, sino calculos derivados de la geometria dibujada: orden izquierda/derecha relativo al nervio medio, direccion del nervio medio (con `midvein_0` siempre en el extremo del apice), posicion del `petiole_tip` en el extremo libre, fusion de angulos dibujados como dos brazos separados, recálculo del vertice interior en angulos con vertices extra y uso de la cuerda mas larga para la anchura. 234 puntos o pares no orientables se marcaron como no etiquetados y 39 recortes sin informacion utilizable se descartaron. No se especifica en la informacion disponible si hubo RLHF, DPO ni tecnicas de aumento mas alla del preprocesado descrito.

## Capacidades

- Deteccion de 31 keypoints anatomicos por hoja: apice (izquierda, centro, derecha), nervio medio (`midvein_0` a `midvein_14`), base (izquierda, centro, derecha), base de la lamina, peciolo (`petiole_0` a `petiole_4` y `petiole_tip`) y ejes de anchura (izquierda y derecha).
- Deteccion de la caja delimitadora de la hoja con una unica clase `leaf`.
- Estimacion de confianza por keypoint, lo que permite filtrar puntos poco fiables en el post-proceso.
- Consistencia geometrica izquierda/derecha gracias a la regla anatomica aplicada en el etiquetado y al `flip_idx` definido para aumento por volteo.
- Inferencia end-to-end sin NMS, adecuada para despliegues de baja latencia.
- Exportacion a ONNX, TorchScript y OpenVINO para ejecucion en CPU, iGPU y entornos libtorch.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, multilingues, vision general, audio ni modo de pensamiento; es un modelo puro de vision para una tarea especifica.

## Casos de uso

- Digitalizacion de colecciones de herbario: el modelo procesa recortes de hojas individuales extraidos de pliegos escaneados y devuelve el esqueleto de 31 puntos, permitiendo generar bases de datos morfologicas a partir de imagenes ya digitalizadas en masa.
- Fenotipado morfologico comparativo: con los keypoints de apice, base, nervio medio y anchura se pueden calcular longitudes, ratios y angulos de la lamina de forma reproducible entre especimenes, algo critico cuando se comparan colecciones de distintas instituciones.
- Medición automatizada de rasgos foliares: la salida estructurada (coordenadas normalizadas y confianza) permite derivar metricas como la relacion longitud/anchura, la posicion del peciolo o la curvatura del nervio medio sin intervencion manual.
- Control de calidad de anotaciones: dado que el modelo fue entrenado sobre etiquetas corregidas, puede usarse para detectar discrepancias en nuevas anotaciones de landmarks y priorizar la revision humana de los casos con baja confianza.
- Integracion en pipelines de investigacion botanica: al distribuirse en ONNX y OpenVINO, puede incorporarse en flujos de procesamiento por lotes en servidores sin GPU o en estaciones de trabajo con CPU Intel, reduciendo el coste de infraestructura.
- Entrenamiento y ajuste fino: el archivo `best.pt` permite reentrenar o adaptar el modelo a nuevas especies o morfologias dentro de la libreria Ultralytics, manteniendo el mismo esquema de 31 keypoints.
- Analisis de variabilidad intraespecifica: al aplicar el mismo modelo a multiples hojas de una misma especie, se pueden estudiar distribuciones de rasgos geometricos y detectar outliers morfologicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de un archivo `evaluation_comparison.json` que contiene la comparacion con el modelo por defecto anterior, pero no se incluyen sus cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 0,8 GB e incluye los pesos en cuatro formatos, pero no se detalla el tamano del checkpoint individual ni el consumo de memoria en ejecucion.
- GPU recomendadas: no disponible. Al ser un YOLO26x-pose a 640 px, es esperable que funcione en GPU de consumo, pero no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: Ultralytics (PyTorch), onnxruntime (runtime por defecto de LM3), libtorch (TorchScript) y OpenVINO para CPU/iGPU Intel. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Keypoints | Entrada | Formatos | Licencia | Estado |
|---|---|---|---|---|---|---|
| lm3_landmark_detector__yolo26x_pose_640_canonical | YOLO26x pose end-to-end | 31 | 640 px, recorte con borde 10 % | PyTorch, ONNX, TorchScript, OpenVINO | AGPL-3.0 | Modelo por defecto de LM3, version 3.0.0 |
| lm3_landmark_detector__yolo26x_pose_640 | YOLO26x pose | 31 | 640 px, mismo esquema | no disponible en la informacion | AGPL-3.0 | Version anterior, sustituida por la canonical |
| Otros modelos de la familia leafmachine3 en Hugging Face | no disponible | no disponible | no disponible | no disponible | no disponible | Listados bajo el tag `leafmachine3` |

La comparacion con alternativas externas a LeafMachine3 no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo acepta recortes con el borde blanco del 10 % por lado; los recortes sin ese margen no estan soportados y deben preprocesarse igual que en entrenamiento.
- Esta disenado exclusivamente para hojas individuales recortadas de pliegos de herbario; no se ha validado en otros dominios visuales ni en escenas con multiples hojas.
- La salida se limita a una unica instancia `leaf` por imagen, por lo que no gestiona composiciones con varias hojas en el mismo recorte.
- Los 234 puntos o pares no orientables se marcaron como no etiquetados, de modo que el modelo puede mostrar menor fiabilidad en configuraciones anatomicas ambiguas.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que el rendimiento cuantitativo frente a alternativas no puede verificarse.
- La licencia AGPL-3.0 impone obligaciones de copyleft en red para servicios que expongan el modelo modificado; para uso comercial propietario es necesario revisar el cumplimiento o contactar con el autor.
- Riesgo de alucinacion de keypoints: como todo detector de pose, puede predecir puntos con confianza alta en zonas anatomicas mal definidas; se recomienda umbral de confianza y revision humana en aplicaciones criticas.
- Los sesgos del modelo dependen de la distribucion del dataset `LM3_Landmarks_Pose_it2` (15.178 recortes de 23 proyectos Labelbox), no distribuido publicamente, lo que limita la reproducibilidad del entrenamiento.
- No se dispone de informacion sobre latencia, consumo de memoria ni throughput, lo que impide dimensionar infraestructura a partir de los datos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phyloforfun/lm3_landmark_detector__yolo26x_pose_640_canonical
- Modelo anterior sustituido: https://huggingface.co/phyloforfun/lm3_landmark_detector__yolo26x_pose_640
- Modelos con tag `leafmachine3` en Hugging Face: https://huggingface.co/models?other=leafmachine3
- Repositorio de Ultralytics (pesos base `yolo26x-pose.pt`): no disponible en la informacion proporcionada
- Paper o blog tecnico de LeafMachine3: no disponible en la informacion proporcionada
