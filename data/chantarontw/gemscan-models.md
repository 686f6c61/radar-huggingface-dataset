# ChantaroNtw/gemscan-models

## Resumen

GemScan models es un paquete de dos detectores de objetos en formato ONNX publicados por el usuario ChantaroNtw bajo el identificador `ChantaroNtw/gemscan-models`. El repositorio contiene dos arquitecturas de deteccion de objetos —YOLO11s y RT-DETR-L— afinadas para localizar inclusiones (imperfecciones internas) en fotografias de diamantes, con un enfoque declarado de control de calidad en el sector gemologico. El pipeline declarado en HuggingFace es `object-detection` y la libreria asociada es `onnx`.

Ambos modelos se exportaron a ONNX en opset 17, con entrada estatica de 1x3x640x640 y precision FP32, y el repositorio incluye un fichero `manifest.json` que lista cada archivo junto con su arquitectura, tamano de entrada y nombres de clase. El entrenamiento se realizo sobre el dataset Diamond Inclusion publicado en Roboflow por Diamond Classification Data bajo licencia CC BY 4.0.

La relevancia de esta publicacion es acotada: se trata de un experimento de vision por computador de nicho, con 0 descargas y 0 likes en el momento de la consulta, y con metricas de deteccion muy bajas en el split de test. Es util como referencia reproducible de un pipeline de fine-tuning y exportacion ONNX, pero no como modelo listo para produccion sin un reentrenamiento sustancial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos detectores independientes: YOLO11s (detector one-stage) y RT-DETR-L (detector transformer end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos con entrada de imagen fija) |
| Tipos de cuantizacion | no disponible; los ficheros publicados son FP32 en ONNX (opset 17) |
| Idiomas soportados | no disponible (no aplica: no procesa texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 17, entrada estatica 1x3x640x640, FP32) |
| Tamano del repositorio | 0,2 GB |
| Entrada del modelo | Imagen RGB estatica de 640x640 pixeles |
| Salida | Cajas delimitadoras con clase asociada (deteccion de inclusiones) |
| Tarea (pipeline) | object-detection |

## Arquitectura y entrenamiento

El repositorio agrupa dos familias de deteccion con filosofias distintas. YOLO11s es un detector one-stage de tipo CNN, orientado a latencia baja y despliegue en el borde. RT-DETR-L es un detector transformer en tiempo real que emplea prediccion de conjuntos con matching hungaro, lo que elimina la necesidad de supresion de no maximos (NMS) en la etapa final. Ambos se exportaron a ONNX con opset 17, entrada estatica de 1x3x640x640 y precision FP32.

El ajuste fino se realizo sobre el dataset Diamond Inclusion de Roboflow (CC BY 4.0), orientado a la deteccion de inclusiones en imagenes de diamantes. La model card no especifica el numero de imagenes de entrenamiento, el numero de epocas, la estrategia de aumentacion de datos, la funcion de perdida ni si se aplicaron tecnicas de regularizacion. El split de test empleado para reportar metricas contiene unicamente 16 imagenes con 117 inclusiones anotadas. El autor indica que el preprocesado y postprocesado que reproduce exactamente el comportamiento de Ultralytics esta disponible en `app/inference.py` del repositorio fuente, dato relevante porque los ficheros ONNX exportados no incorporan ese pipeline de forma autonoma. No se documenta ninguna innovacion tecnica adicional ni proceso de RLHF/DPO (no aplicable a un modelo de vision).

## Capacidades

- Deteccion de objetos en imagenes: localiza inclusiones en fotografias de diamantes y devuelve cajas delimitadoras con su clase.
- Dos variantes con compromisos distintos: YOLO11s como opcion mas ligera y RT-DETR-L como alternativa con mayor recall en el test reportado.
- Inferencia via ONNX Runtime, con la posibilidad de aceleracion por GPU u otras runtimes compatibles con ONNX (TensorRT, OpenVINO, entre otras).
- Integrable en pipelines de vision industrial mediante el pre/postprocesado de referencia incluido en el repositorio fuente.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no aplica).
- Capacidades especiales (modo thinking, vision general, audio): no disponible; la vision se limita a la deteccion de la clase de inclusion para la que fue entrenado.
- Entrada de tamano fijo: no admite imagenes de resolucion arbitraria sin reescalado previo a 640x640.

## Casos de uso

- Control de calidad en laboratorio gemologico: el modelo permite prefiltrar lotes de fotografias de diamantes y marcar automaticamente aquellas piezas con inclusiones detectadas, reduciendo el tiempo de revision manual previo al analisis por un gemologo certificado.
- Clasificacion preliminar en linea de inspeccion: integrado con una camara industrial y un script de inferencia ONNX Runtime, el detector puede procesar imagenes capturadas en una cinta transportadora y descartar piezas candidatas antes de una inspeccion mas costosa.
- Catalogacion de inventario en comercio electronico: para tiendas de piedras preciosas, el modelo puede generar anotaciones automaticas de inclusiones sobre las fotografias de catalogo, aportando transparencia al comprador sobre el grado de pureza.
- Investigacion academica en vision por computador aplicada a gemologia: el repositorio sirve como punto de partida reproducible para comparar detectores CNN one-stage frente a detectores transformer en un dominio de imagenes de alta textura y bajo contraste.
- Base para reentrenamiento con datos propios: dado que los pesos estan en ONNX y la licencia es CC BY 4.0, un laboratorio puede partir de estos modelos, sustituir el dataset por su propio corpus anotado y repetir el fine-tuning con Ultralytics.
- Monitorizacion automatica de calidad en tiempo real sobre GPU de gama media: la variante YOLO11s, mas ligera, es la candidata natural para despliegues con requisitos de latencia estrictos en entornos de produccion.
- Prueba de concepto de pipeline completo (captura, inferencia y postprocesado): el fichero `app/inference.py` del repositorio fuente permite replicar exactamente el comportamiento de Ultralytics y validar la integracion antes de invertir en anotacion adicional.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test del dataset Diamond Inclusion (16 imagenes, 117 inclusiones):

| Modelo | Precision | Recall | mAP50 | mAP50-95 |
|---|---:|---:|---:|---:|
| YOLO11s | 0,390 | 0,213 | 0,187 | 0,059 |
| RT-DETR-L | 0,357 | 0,282 | 0,195 | 0,067 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay datos de latencia, throughput ni consumo de memoria en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; dado que el repositorio completo ocupa 0,2 GB y la entrada es de 640x640 en FP32, la huella por modelo es reducida y cabe con holgura en GPUs de gama de consumo. Se trata de una estimacion derivada, no de un dato publicado.
- GPU recomendadas: no disponible. Por el tamano de la arquitectura, una RTX 3060 o superior es suficiente para ambas variantes; una A100 o H100 solo tendria sentido en despliegues de muy alto volumen por lotes.
- Compatibilidad con GPU de consumo: si, previsiblemente en cualquier GPU consumer con al menos 4 GB de VRAM; la variante YOLO11s es la mas adecuada para este escenario.
- CPU: la inferencia en CPU es viable mediante ONNX Runtime, aunque sin datos de latencia publicados.
- Opciones de despliegue: ONNX Runtime (referencia), TensorRT, OpenVINO, y librerias compatibles con ONNX como Ultralytics para el pipeline de pre/postprocesado. La model card no menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa interna entre las dos variantes incluidas en el propio repositorio, con los unicos datos publicados:

| Modelo | Precision | Recall | mAP50 | mAP50-95 | Formato | Licencia |
|---|---:|---:|---:|---:|---|---|
| YOLO11s | 0,390 | 0,213 | 0,187 | 0,059 | ONNX FP32 | CC BY 4.0 |
| RT-DETR-L | 0,357 | 0,282 | 0,195 | 0,067 | ONNX FP32 | CC BY 4.0 |

Interpretacion: RT-DETR-L obtiene mejor recall, mAP50 y mAP50-95, mientras que YOLO11s presenta una precision ligeramente superior. Ninguno de los dos alcanza valores utilizables en produccion sin reentrenamiento adicional.

Frente a alternativas externas de la misma categoria (por ejemplo, otros detectores genericos como Faster R-CNN, YOLOv8 o DETR preentrenados en COCO), no se dispone de resultados comparativos en el dominio de inclusiones en diamantes: no disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo: el mejor mAP50-95 del repositorio es 0,067, lo que implica que las cajas predichas apenas se solapan con las anotaciones reales. No es adecuado para uso en produccion sin reentrenamiento.
- Split de test minusculo: las metricas se calculan sobre 16 imagenes y 117 inclusiones, una muestra demasiado pequena para extraer conclusiones estadisticamente robustas.
- Riesgo elevado de sobreajuste al dominio: el modelo se entreno exclusivamente con fotografias del dataset Diamond Inclusion, por lo que se espera una degradacion notable ante cambios de iluminacion, camara, fondo o tipo de piedra.
- Falsos negativos frecuentes: el recall de 0,213 en YOLO11s implica que se pierden aproximadamente cuatro de cada cinco inclusiones presentes en la imagen.
- Dependencia de pre/postprocesado externo: los ficheros ONNX no incluyen el pipeline de Ultralytics, que debe replicarse desde `app/inference.py` del repositorio fuente; una implementacion incorrecta altera drasticamente los resultados.
- Entrada estatica: no admite variacion de resolucion ni lotes dinamicos sin reexportacion del grafo.
- Sesgos conocidos: no disponible; no se documenta ningun analisis de sesgo ni de equidad, algo menos critico en un dominio de inspeccion fisica pero relevante si el dataset de origen sobrerrepresenta ciertos tipos de diamante.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de detecciones espurias por la baja precision reportada.
- Licencia: CC BY 4.0 permite uso comercial y modificacion siempre que se atribuya la autoria. Conviene verificar ademas las condiciones del dataset de origen (Diamond Inclusion, tambien CC BY 4.0) y de Ultralytics para los pesos base de YOLO11.
- Ausencia de mantenimiento: el repositorio registra 0 descargas y 0 likes, sin senales de soporte o actualizaciones posteriores.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChantaroNtw/gemscan-models
- Dataset de entrenamiento (Diamond Inclusion, Roboflow, CC BY 4.0): https://universe.roboflow.com/diamond-classification-data/diamond-inclusion
- Repositorio fuente con `app/inference.py` y `manifest.json`: no disponible (la model card lo menciona pero no facilita la URL)
- Paper o blog tecnico del autor: no disponible
- Demos: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas de CapCut sin relacion con el modelo.
