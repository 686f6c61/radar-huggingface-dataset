# phyloforfun/lm3_specimen_detector__yolo26n_det_640

## Resumen

`lm3_specimen_detector__yolo26n_det_640` es un detector de objetos YOLO26n (variante nano, extremo a extremo sin NMS) publicado por el usuario de HuggingFace `phyloforfun` dentro del ecosistema LeafMachine3. Su única clase es `Specimen`: la región de un pliego de herbario que contiene el material vegetal. El modelo no forma parte de ninguna etapa de inferencia de LeafMachine3; se entrenó como paso previo para construir etiquetas débiles con las que se entrenaron después los modelos de segmentación de especímenes del proyecto.

El modelo parte de los pesos `yolo26n.pt` de Ultralytics y se entrenó sobre 23.034 imágenes derivadas del dataset `LM3_Plant` (83 proyectos de Labelbox), conservando únicamente los pliegos que tenían anotada una caja de tipo `Specimen`. La entrada es de 640×640 con letterbox en RGB y la salida son cajas delimitadoras con su confianza, sin etapa de supresión de no máximos.

Su relevancia es acotada pero concreta: es un detector de dominio muy específico (digitalización de colecciones botánicas) con métricas publicadas y verificadas contra anotaciones humanas (F1 de 0,898 en test a confianza 0,35), exportado a cinco formatos (PyTorch, ONNX, TorchScript, OpenVINO y CoreML), lo que permite desplegarlo tanto en servidor como en CPU Intel o dispositivos Apple. Las cifras de parámetros y de rendimiento en hardware no están publicadas en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26n detect, extremo a extremo (sin NMS); pesos base `yolo26n.pt` de Ultralytics |
| Parámetros totales | no disponible (el autor no publica el recuento; es la variante nano de YOLO26) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija de 640×640 con letterbox, RGB) |
| Tipos de cuantización | no disponible (se publican exportaciones PyTorch, ONNX, TorchScript, OpenVINO y CoreML, pero la model card no detalla variantes cuantizadas) |
| Idiomas soportados | no disponible / no aplica (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `pytorch/last.pt`, `onnx/model.onnx`, `torchscript/model.torchscript`, `openvino/model_openvino_model/`, `coreml/model.mlpackage/`; SHA-256 de cada fichero en `manifest.json` |

## Arquitectura y entrenamiento

Detector de una sola clase basado en YOLO26n en modo *end-to-end*, es decir, sin supresión de no máximos en la salida: el modelo predice directamente el conjunto final de cajas. La entrada es de 640 px con letterbox y tres canales RGB. El checkpoint publicado es `last.pt`, correspondiente a la época 300 de un entrenamiento de 300 épocas sin parada temprana, con scheduler de tasa de aprendizaje coseno, lote 76 (autotune) y `close_mosaic=150`. El aumento de datos aplicado fue: HSV 0,015/0,7/0,4, rotación ±15°, traslación 0,1, escala 0,5, cizalladura 2, perspectiva 0,0005, volteo vertical 0,5, volteo horizontal 0,5, mosaic 1,0, mixup 0,15, erasing 0,4 y randaugment.

Los datos proceden del dataset `LM3_Plant_Specimen`, construido el 2026-07-23 a partir de `LM3_Plant` (creado el 2026-06-26, 83 proyectos de Labelbox, partición congelada 80/10/10, salt `lm3`, hash de clases `79dc7b10a5c4`), conservando solo la clase `Specimen` y descartando los pliegos sin caja de espécimen. Total: 23.034 imágenes, con 18.444 en entrenamiento (26.631 cajas, 553 pliegos descartados), 2.332 en validación (3.407 cajas, 70 descartados) y 2.258 en test (3.297 cajas, 69 descartados). Las imágenes y etiquetas no se distribuyen. No se documenta RLHF, DPO ni ninguna fase de ajuste posterior; es entrenamiento supervisado de detección puro. El autor indica explícitamente que el checkpoint de mejor mAP (época 136, mAP50-95 de validación 0,789 frente a 0,776) no se publica: se publica la época final porque fue la que alimentó la construcción de etiquetas débiles.

## Capacidades

- Detección de objetos de una única clase (`Specimen`): devuelve cajas delimitadoras con puntuación de confianza sobre la región del pliego que contiene material vegetal.
- Inferencia extremo a extremo sin NMS, lo que simplifica el postprocesado en pipelines embebidos.
- Manejo de varios especímenes en un mismo pliego: en el ejemplo 4 de la model card, el modelo genera una caja por planta aunque la anotación humana agrupase varias en una sola.
- Exportación multiplataforma ya publicada: PyTorch (reentrenamiento), ONNX (onnxruntime), TorchScript (libtorch), OpenVINO (CPU/iGPU Intel) y CoreML (dispositivos Apple).
- Uso previsto como generador de etiquetas débiles a escala (confianza 0,35 sobre 27.772 imágenes en el espacio de trabajo de LeafMachine3).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto: no es un modelo de lenguaje.
- No tiene visión multimodal descriptiva (no genera descripciones, OCR ni etiquetas semánticas): solo localización de la región de espécimen.

## Casos de uso

- **Preprocesado en digitalización de herbarios**: recortar la región del pliego que contiene material vegetal antes de pasarla a un modelo de segmentación o de medición morfométrica. Al ser un detector de una clase con mAP50-95 de 0,785 en test, reduce el área a procesar y el coste computacional de las etapas siguientes.
- **Generación de etiquetas débiles a gran escala**: replicar el uso original del autor, ejecutando el ONNX a confianza 0,35 sobre un corpus de decenas de miles de imágenes para producir regiones `Specimen` que sirvan de evidencia débil en el entrenamiento de modelos de segmentación posteriores.
- **Control de calidad en lotes de digitalización**: detectar pliegos en los que el detector no encuentra ninguna región con confianza suficiente y derivarlos a revisión manual, evitando que imágenes mal capturadas o sin material vegetal entren en el archivo.
- **Enrutado y partición de imágenes en archivos mixtos**: en colecciones donde se mezclan pliegos de herbario con material de archivo, usar la detección de espécimen como señal para clasificar y enrutar cada imagen al pipeline correspondiente.
- **Recorte previo a lectura de etiquetas**: aislar la región del espécimen para que un OCR posterior sobre la etiqueta del pliego no se vea interferido por el material vegetal, o para recortar específicamente la zona de la etiqueta como complemento.
- **Despliegue en estaciones de digitalización sin GPU**: gracias a las exportaciones OpenVINO y CoreML, ejecutar el detector en CPU Intel o en equipos Apple directamente en la estación donde se captura la imagen, sin depender de un servidor.
- **Investigación en morfometría y fenología**: obtener la caja del espécimen como paso previo al cálculo de área foliar, conteo de órganos o comparación entre pliegos de distintas instituciones.
- **Deduplicación y agrupación visual**: usar las cajas y su geometría como característica auxiliar para agrupar pliegos con composición similar dentro de una colección.

## Benchmarks y rendimiento

Métricas de detección publicadas por el autor:

| Split | mAP50 | mAP50-95 | Precisión | Recall |
|---|---|---|---|---|
| val | 0,913 | 0,775 | 0,946 | 0,853 |
| test | 0,918 | 0,785 | 0,937 | 0,862 |

Evaluación con el modelo exportado a ONNX a confianza 0,35, emparejando cada caja predicha con una caja dibujada a mano de forma uno a uno con IoU >= 0,5:

| Split | Cajas manuales | Cajas predichas | Precisión | Recall | F1 | IoU medio de los emparejamientos |
|---|---|---|---|---|---|---|
| val | 3.407 | 3.163 | 0,933 | 0,866 | 0,899 | 0,919 |
| test | 3.297 | 3.129 | 0,922 | 0,875 | 0,898 | 0,919 |

No se han publicado resultados de benchmarks en la información disponible para latencia, throughput ni comparación con otros detectores.

## Requisitos de hardware

- **VRAM estimada**: no publicada por el autor. Por la escala del modelo (variante nano, entrada 640×640, una sola clase, salida sin NMS) es esperable que la inferencia en FP16 con lote 1 quede por debajo de 2 GB, pero se trata de una estimación orientativa y no de una medición verificada.
- **GPU recomendadas**: no hay recomendaciones del autor. Cualquier GPU con al menos unos pocos GB de VRAM debería poder ejecutarlo; el modelo no aprovecha aceleradores de gran formato por su tamaño.
- **GPU consumer**: sí, es previsible que quepa en cualquier GPU consumer actual (serie RTX xx60 en adelante) e incluso en iGPU, dado el tamaño nano del detector y la resolución de entrada.
- **CPU y dispositivos Apple**: la model card incluye exportaciones específicas para CPU/iGPU Intel (OpenVINO) y para dispositivos Apple (CoreML), lo que habilita inferencia sin GPU dedicada.
- **Opciones de despliegue**: Ultralytics (carga directa de `last.pt`), onnxruntime (`onnx/model.onnx`), libtorch (`torchscript/model.torchscript`), OpenVINO Runtime (`model_openvino_model/`) y CoreML (`model.mlpackage/`).
- **Latencia y throughput**: no disponibles. No se han publicado tiempos de inferencia ni imágenes por segundo en ninguna de las plataformas de exportación.

## Comparativa con modelos similares

| Modelo | Tarea | Clase(s) | Entrada | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `phyloforfun/lm3_specimen_detector__yolo26n_det_640` | Detección de objetos | 1 (`Specimen`) | 640×640 | no disponible (nano YOLO26) | AGPL-3.0 | Pesos publicados en HuggingFace; 0 descargas, 0 likes |
| `yolo26n.pt` (Ultralytics) | Detección de objetos | 80 (COCO) | configurable | no disponible en las fuentes | AGPL-3.0 | Pesos base del modelo; uso generalista |
| YOLO11n / YOLOv8n (Ultralytics) | Detección de objetos | 80 (COCO) | configurable | no disponible en las fuentes | AGPL-3.0 | Alternativas generalistas de la misma familia y escala; requerirían reentrenamiento para la clase `Specimen` |
| Detectores específicos de herbario de LeafMachine3 | Segmentación / detección | varias | no disponible | no disponible | no disponible | No se han encontrado referencias verificables en la información proporcionada |

No se dispone de cifras de rendimiento de los modelos comparables en las fuentes proporcionadas, por lo que no se puede establecer una comparación cuantitativa de precisión.

## Limitaciones y advertencias

- **Una sola clase**: el modelo no distingue especies, partes de la planta ni etiquetas; únicamente delimita la región con material vegetal.
- **Dominio muy restringido**: entrenado exclusivamente con imágenes de pliegos de herbario del dataset `LM3_Plant`. No se ha validado sobre fotografías de campo, escaneos de otra resolución, imágenes con fondo no estándar o material no botánico.
- **Convención de anotación humana variable**: el propio autor señala que las cajas manuales siguen la convención de cada etiquetador; por ejemplo, en el pliego 4 se dibujó una caja alrededor de varias plantas, mientras que el modelo genera una caja por planta. Esto introduce desajustes que no reflejan necesariamente errores del detector, pero complican la comparación directa.
- **Checkpoint publicado no es el mejor**: se distribuye `last.pt` (época 300) y no el de mejor mAP de validación (época 136, mAP50-95 0,789 frente a 0,776). Para usos que prioricen precisión podría ser relevante reentrenar o solicitar ese checkpoint.
- **Datos no reproducibles**: las imágenes y etiquetas del dataset no se distribuyen, por lo que no es posible reproducir el entrenamiento ni auditar la composición exacta de la muestra.
- **Posible sesgo institucional**: el dataset proviene de 83 proyectos de Labelbox con imágenes de instituciones concretas (K, DES, ASC, SMF, MIN, L, NY, WCUH, MNHN, US en los ejemplos). El rendimiento sobre colecciones con prácticas de digitalización distintas no está medido.
- **Riesgo de detecciones espurias**: como cualquier detector, puede generar cajas de baja confianza sobre texturas que se parezcan a material vegetal (sombras, etiquetas, reglas de escala). El umbral de 0,35 usado por el autor no está justificado mediante un barrido de confianza publicado.
- **Licencia AGPL-3.0**: licencia copyleft fuerte. El uso comercial es posible, pero si se distribuye el modelo o se ofrece como servicio en red, la AGPL exige liberar el código fuente de la obra derivada y de la aplicación que interactúa con ella. Conviene revisarlo con asesoría legal antes de integrarlo en un producto propietario.
- **Estado del repositorio**: 0 descargas, 0 likes y un tamaño de repo reportado de 0,0 GB. Antes de integrarlo en producción conviene verificar con `manifest.json` que todos los artefactos (`.pt`, `.onnx`, `.torchscript`, OpenVINO y CoreML) están efectivamente presentes y sus SHA-256 coinciden.
- **No es un componente de LeafMachine3**: el autor indica explícitamente que LeafMachine3 no carga este modelo en ninguna de sus etapas; es una herramienta de preprocesado, no una API de segmentación lista para usar.

## Enlaces

- HuggingFace: https://huggingface.co/phyloforfun/lm3_specimen_detector__yolo26n_det_640
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
