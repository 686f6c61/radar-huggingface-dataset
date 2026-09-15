# SharonMelhi/BluEcho-FLS11-ONNX

## Resumen

BluEcho-FLS11-ONNX es una conversión a formato ONNX del checkpoint YOLO11n entrenado por Bhoumik Chandra Bagh para la detección de minas y residuos en imágenes de sonar de barrido frontal (forward-looking sonar, FLS). No es un modelo entrenado por el equipo BluEcho: SharonMelhi y colaboradores han adaptado el checkpoint original para permitir inferencia local en navegador dentro del prototipo presentado al Smart India Hackathon 2026. El problema que aborda es la detección de objetos en imágenes acústicas de baja relación señal-ruido, un dominio muy alejado de la fotografía convencional y con muy pocos modelos públicos disponibles.

Técnicamente se trata de un detector convolucional de una etapa de la familia YOLO11 en su variante nano, exportado a ONNX con opset 17 en precisión FP32. La entrada es un tensor fijo de 1x3x640x640 en formato NCHW RGB, con letterbox centrado y relleno 114, y normalización dividiendo entre 255. La salida es un tensor de 1x15x8400 que contiene coordenadas xywh seguidas de once puntuaciones de clase: mine, can, bottle, drink-carton, chain, propeller, tire, hook, valve, shampoo-bottle y standing-bottle.

Su relevancia es doble. Por un lado, documenta un flujo reproducible de conversión de PyTorch a ONNX con verificación de paridad entre ambos backends; por otro, es un ejemplo poco habitual de model card que explicita con detalle las limitaciones del artefacto, incluidas las dudas sobre la validez de la etiqueta mine, la procedencia de los datos de entrenamiento y las restricciones de licencia aplicables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos convolucional de una etapa, familia YOLO11 (variante nano); la model card no detalla la topologia interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); entrada de imagen fija de 1x3x640x640 |
| Tipos de cuantizacion | El artefacto se distribuye en FP32; no se declaran variantes INT8, FP16 ni otras (no disponible) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT en el artefacto original, con condiciones AGPL-3.0 de la implementacion Ultralytics subyacente; los datos de entrenamiento tienen terminos propios |
| Formato de pesos | ONNX, opset 17, FP32, layout NCHW |
| Entrada | 1 x 3 x 640 x 640, FP32, RGB, letterbox centrado con relleno 114, division entre 255 |
| Salida | 1 x 15 x 8400 (xywh + 11 puntuaciones de clase) |
| Numero de clases | 11 |
| Nombres de clase (IDs 0..10) | mine, can, bottle, drink-carton, chain, propeller, tire, hook, valve, shampoo-bottle, standing-bottle |
| Umbrales por defecto | score 0.25 y NMS por clase con IoU 0.50; declarados como ajustes provisionales de compatibilidad, no optimizados por validacion |
| Pipeline declarado | object-detection |
| Tamano del repositorio | 0,0 GB (no se declara el tamano del artefacto ONNX) |
| Descargas / likes | 0 / 0 |
| Hash del checkpoint original | SHA-256 b6d82043f04c24ab66637f04cea0ffc2263a57cea9b01c0a7e15d55149274cff |

## Arquitectura y entrenamiento

El artefacto es una exportacion, no un entrenamiento nuevo. El checkpoint de partida es `run/train/sonar_yolov11_n/weights/best.pt`, un YOLO11n entrenado por Bhoumik Chandra Bagh sobre imagenes de sonar. El proceso de conversion descrito consiste en cargar el checkpoint con `weights_only` de PyTorch y una lista blanca explicita de clases de arquitectura instaladas, reconstruir un modelo YOLO11n limpio con un state dict estricto y exportarlo con opset 17. La model card afirma que no se ejecuto codigo Python de terceros durante el proceso. Toda la metadata de conversion se incluye en el repositorio.

No se detallan en la informacion disponible ni el numero de tokens o imagenes de entrenamiento, ni la composicion exacta del dataset, ni la existencia de fases de ajuste fino con RLHF o DPO (tecnicas que, por otra parte, no aplican a un detector de objetos de este tipo). La model card cita dos fuentes de datos: Marine Debris FLS (Valdenegro-Toro et al., Zenodo 15101686, con licencia CC BY-NC-SA 4.0) y Mine Sonar Images (Roboflow, usuario phan-quang-tuan). La segunda fuente no era accesible durante la revision del autor, por lo que su procedencia y terminos originales no se resolvieron de forma independiente. No se acredita ninguna innovacion tecnica propia: el valor del artefacto esta en la conversion, el empaquetado y la documentacion de trazabilidad.

## Capacidades

- Deteccion de objetos en imagenes de sonar de barrido frontal: localiza once categorias de objetos (minas propuestas, latas, botellas, cartones de bebida, cadenas, helices, neumaticos, ganchos, valvulas y dos variantes de botella) y devuelve cajas en formato xywh con puntuacion por clase.
- Inferencia local en navegador mediante ONNX Runtime Web (WebAssembly o WebGPU), que es el objetivo declarado de la adaptacion.
- Inferencia en servidor o en dispositivo con cualquier runtime compatible con ONNX.
- Funciona como componente de un pipeline de vision mas amplio (preprocesado, NMS, postprocesado y visualizacion), no como sistema autonomo.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto, codigo, matematicas ni vision general: es exclusivamente un detector de objetos sobre imagenes acusticas.
- No soporta otros idiomas ni entrada de texto; las once etiquetas de clase son identificadores fijos definidos en el modelo.
- Se han verificado predicciones de las clases propeller, shampoo-bottle y can en tres imagenes de prueba del repositorio original; el resto de clases queda sin verificar en esta adaptacion.

## Casos de uso

- Prototipo de inferencia en navegador para hackathon: integrado en la aplicacion BluEcho (AGPL-3.0-or-later), el modelo permite demostrar deteccion sobre imagenes de sonar sin depender de un servidor con GPU.
- Inspeccion de cascos y estructuras portuarias con ROV o AUV: las clases propeller, chain, valve, hook y tire son relevantes para mantenimiento subacuatico, y el detector puede usarse como primer filtro sobre el flujo de video del vehiculo.
- Catalogacion de residuos en campanas de limpieza marina: las clases can, bottle, drink-carton, shampoo-bottle, standing-bottle y tire permiten generar inventarios aproximados de basura detectada a partir de imagenes FLS.
- Apoyo a la busqueda y clasificacion de objetos peligrosos: la clase mine puede emplearse para priorizar revisiones humanas, siempre como propuesta no validada y nunca como decision operativa.
- Investigacion academica en vision subacuatica: el artefacto sirve como punto de partida reproducible para comparar tecnicas de deteccion sobre los datasets FLS citados.
- Analisis post-mision de grabaciones de sonar: procesamiento por lotes de fotogramas para etiquetar eventos y generar informes de presencia de objetos.
- Formacion de operadores de sonar: uso de las detecciones como ayuda visual en simuladores o sesiones de entrenamiento.
- Docencia y ejemplos de despliegue ONNX: es un caso practico de conversion PyTorch a ONNX con verificacion de paridad y trazabilidad, util en materiales sobre despliegue de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es explicita al respecto: no se reclama ninguna metrica de precision del modelo original como resultado de BluEcho, y la verificacion realizada se limita a una comprobacion de paridad entre la salida nativa de PyTorch y la salida ONNX.

| Comprobacion | Alcance | Resultado |
|---|---|---|
| Paridad nativo-ONNX | 3 imagenes de prueba del repositorio fuente (clases propeller, shampoo-bottle y can) | Documentada en runtime-parity.json; es una comprobacion de compatibilidad, no un benchmark de precision |
| Independencia del split de origen | No auditada de forma independiente | no disponible |
| Solapamiento con datos de entrenamiento | No auditado de forma independiente | no disponible |
| Metricas de entrenamiento del autor original | Publicadas en el repositorio fuente | No se reclaman como resultados de BluEcho; valores no disponibles en esta ficha |
| Previsiones de las clases restantes | No verificadas en esta adaptacion | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Como referencia de calculo, un tensor de entrada FP32 de 1x3x640x640 ocupa aproximadamente 4,9 MB; un detector de esta familia cabe holgadamente en GPUs de gama de entrada, pero se trata de una estimacion no verificada por el autor.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte para CUDA, TensorRT, DirectML o WebGPU puede ejecutar el grafo ONNX; no se especifica ninguna recomendacion.
- GPU de consumo: si, es previsible que funcione en GPUs de consumo e integradas, incluida ejecucion en CPU, dado el tamano reducido de la entrada y la variante nano. No hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: ONNX Runtime en CPU, CUDA, TensorRT, DirectML y OpenVINO; onnxruntime-web con backend WebAssembly o WebGPU para navegador. Alternativamente, el checkpoint .pt original puede reexportarse con Ultralytics a TensorRT, OpenVINO, CoreML o TFLite.
- Latencia y throughput: no disponibles. La model card no incluye mediciones de rendimiento, y tampoco se han publicado tasas de fotogramas por segundo para esta adaptacion.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| BluEcho-FLS11-ONNX (esta ficha) | no disponible | 1x3x640x640 FP32 | 11 (dominio FLS) | MIT del artefacto original; AGPL-3.0 en la implementacion Ultralytics; datos bajo terminos propios | ONNX opset 17 | HuggingFace, 0 descargas y 0 likes |
| Checkpoint original de Bhoumik Chandra Bagh (best.pt) | no disponible | no disponible | 11 | MIT del repositorio fuente | PyTorch | Repositorio GitHub original (commit 07dfc61) |
| YOLO11n preentrenado generico de Ultralytics | no disponible en esta ficha | 640x640 (configuracion habitual) | 80 (COCO, en la variante estandar) | AGPL-3.0 | PyTorch, exportable a multiples formatos | Repositorio y documentacion de Ultralytics |
| Detectores para sonar de barrido lateral (side-scan) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparativas cuantitativas de precision, latencia o consumo entre estas opciones en la informacion disponible. La model card advierte ademas que este modelo no debe reutilizarse como detector de side-scan sin una evaluacion de transferencia independiente, ya que la geometria del sensor y la estadistica de la imagen son diferentes.

## Limitaciones y advertencias

- Etiqueta mine no validada: la propia model card indica que una prediccion de mina es una propuesta sin validar, no un objeto identificado. El sistema no es un sistema de decision ni de despeje.
- Ambiguedad de materiales: las etiquetas de botella no identifican el material, de modo que no sirven para clasificar residuos por composicion.
- Dominio restringido: el modelo no detecta redes de pesca ni "todo lo que hay bajo el agua"; su alcance es el de las once clases entrenadas.
- Umbrales provisionales: los valores de score 0.25 y NMS IoU 0.50 son ajustes de compatibilidad, no optimizados mediante validacion, por lo que la combinacion de precision y exhaustividad no esta caracterizada.
- Cobertura de verificacion parcial: solo se comprobaron predicciones de tres clases en tres imagenes; el resto de clases queda sin verificar en la adaptacion.
- Ausencia de auditoria del dataset: no se ha auditado de forma independiente la independencia del split de origen ni el posible solapamiento con datos de entrenamiento.
- Riesgo de falso positivo y de falso negativo: inherente a un detector de objetos sobre imagenes acusticas con baja relacion senal-ruido; no hay metricas publicadas que permitan cuantificarlo.
- Licencias solapadas: el artefacto conserva el aviso MIT del repositorio original, pero la implementacion Ultralytics registra condiciones AGPL-3.0; la aplicacion BluEcho se distribuye como AGPL-3.0-or-later. Los terminos de los datos de entrenamiento son independientes de la licencia del modelo, y Marine Debris FLS usa CC BY-NC-SA 4.0, lo que restringe el uso comercial. La procedencia de la fuente Mine Sonar Images no se pudo resolver durante la revision.
- Uso previsto limitado: la adaptacion se declara para prototipo de investigacion no comercial y hackathon, no para produccion ni para decisiones de campo.
- Advertencia de atribucion: el autor original no respalda el proyecto BluEcho ni esta adaptacion.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes, y no se han encontrado referencias externas en la busqueda web (los resultados obtenidos no guardan relacion con el modelo).
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgo por tipo de fondo marino, sensor, profundidad o condiciones de adquisicion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SharonMelhi/BluEcho-FLS11-ONNX
- Repositorio fuente del checkpoint original: https://github.com/riku-1825/Under_Water_Sonar_Mines_Debris_Detection_And_Segmentation/tree/07dfc61685c2ea63485ba7444280789b638ce749
- Condiciones de licencia de Ultralytics: https://www.ultralytics.com/license
- Codigo de la aplicacion BluEcho (Smart India Hackathon 2026): https://github.com/Sharon-codes/SIH-2026
- Dataset Marine Debris FLS (Valdenegro-Toro et al.): https://github.com/mvaldenegro/marine-debris-fls-datasets
- Dataset Marine Debris FLS en Zenodo: https://zenodo.org/records/15101686
- Dataset Mine Sonar Images en Roboflow: https://universe.roboflow.com/phan-quang-tuan/mine_sonar_images/dataset/1
- Busqueda web: no se han encontrado articulos, papers ni demos adicionales relacionados con este modelo; los resultados devueltos no son pertinentes.
