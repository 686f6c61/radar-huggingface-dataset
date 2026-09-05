# JcProg/PCBInspect-LeadDefect

## Resumen

JcProg/PCBInspect-LeadDefect es un clasificador de imágenes binario desarrollado por JcProg, especializado en la inspección óptica automatizada (AOI) de placas de circuito impreso (PCB). El modelo forma parte del ecosistema SentinelPCB, un router de inspección de defectos en el que un clasificador de región dirige cada recorte de componente (ROI) a un clasificador de defecto específico. En este caso, el modelo recibe los recortes clasificados previamente como "Lead" y distingue entre soldadura correcta (Golden) y soldadura insuficiente. 

La arquitectura parte de YOLO26s-cls de Ultralytics, con una cabeza de clasificación afinada sobre un dataset propietario de recortes de componentes SMT. El modelo se exporta a ONNX en formato opset 17, con entrada de imagen RGB de 640x640 y salida de logits para dos clases. No se especifica el número total de parámetros ni la longitud de contexto, al tratarse de un modelo de visión que no procesa texto.

El interés de este modelo radica en su integración directa en sistemas de control de calidad de fabricación electrónica. Las métricas internas reportan un top-1 y macro-F1 de 0.996 tanto en validación como en test, lo que indica un rendimiento muy alto en su dominio. Sin embargo, el repositorio de HuggingFace registra un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar disponibles en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s-cls (Ultralytics) con cabeza de clasificación, exportado a ONNX (opset 17) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO26s-cls, una variante de la familia YOLO26 de Ultralytics diseñada para clasificación de imágenes. A diferencia de los detectores de objetos de la misma familia, este modelo no aplica NMS, ya que la entrada es un recorte ya localizado y la salida es una distribución de probabilidad sobre dos clases. La entrada esperada es una imagen RGB de 640x640 píxeles, normalizada dividiendo entre 255 y en formato NCHW. La salida `output0` son logits crudos de dimensión (1, 2), por lo que es necesario aplicar softmax para obtener probabilidades.

El entrenamiento se realizó sobre un dataset propietario de AOI compuesto por recortes de componentes SMT, con pares de referencia defecto libre y captura defectuosa para cada ubicación física. El dataset no se distribuye públicamente. La división entre entrenamiento, validación y test se hizo agrupando por sitio de captura física, nunca por imagen cruda, para evitar que la referencia y su defecto correspondiente quedaran en particiones distintas. Las clases están naturalmente balanceadas, con aproximadamente 1.846 muestras por clase, por lo que no se aplicó rebalanceo. No se menciona el uso de RLHF ni DPO, al ser un clasificador de visión supervisado.

## Capacidades

- Clasificacion binaria de defectos de soldadura en recortes de componentes: distingue entre soldadura correcta (Golden) y soldadura insuficiente (SolderInsufficient).
- Integracion dentro del router SentinelPCB: recibe recortes ya enrutados como "Lead" desde un clasificador de region superior.
- Procesamiento de imagenes RGB de 640x640 con normalizacion /255 y formato NCHW, listo para ONNX Runtime.
- Salida en forma de logits crudos, lo que permite aplicar softmax para obtener probabilidades por clase.
- No dispone de capacidades de generacion de texto, tool calling, agentes ni soporte multilingue, al ser un modelo de vision puro.
- Portable a entornos de inferencia mediante ONNX, con soporte para CPU y GPU a traves de ONNX Runtime.

## Casos de uso

- Control de calidad en lineas de produccion SMT: el modelo puede integrarse en un sistema de vision que capture imagenes de componentes tras el proceso de soldadura, clasificando automaticamente si cada lead presenta soldadura insuficiente y detener la linea para revision.
- Clasificacion dentro del pipeline SentinelPCB: este modelo actua como clasificador de defecto especifico para recortes enrutados como "Lead", permitiendo un sistema jerarquico que primero identifica la region del componente y luego aplica el modelo adecuado.
- Auditoria de calidad de proveedores: permite analizar lotes de PCBs de distintos proveedores para verificar que las soldaduras cumplen los criterios establecidos, generando estadisticas de defectos por lote o proveedor.
- Pre-etiquetado de datos para nuevos datasets: dado su alto rendimiento (top-1 0.996), puede usarse como anotador automatico para pre-etiquetar nuevos recortes de AOI, reduciendo el trabajo manual de etiquetado.
- Monitorizacion del proceso de soldadura por reflow: al registrar la frecuencia de soldaduras insuficientes en ubicaciones concretas de la placa, se pueden detectar desviaciones del proceso y ajustar parametros como temperatura o tiempo de perfil.
- Inspeccion final de PCBs antes del montaje: se puede incorporar a un flujo de inspeccion en el que se verifiquen los componentes ya soldados, reduciendo la tasa de fallos en pruebas funcionales posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos comparativos (como MMLU, HumanEval o GSM8K) porque el modelo no es un modelo de lenguaje. La evaluacion interna proporcionada por el autor se centra en validacion y test sobre el dataset propio. Los resultados son los siguientes:

**Validacion (top-1 0.996, macro-F1 0.996, n=736):**

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| Golden | 0.997 | 0.995 | 0.996 | 369 |
| SolderInsufficient | 0.995 | 0.997 | 0.996 | 367 |

**Test (top-1 0.996, macro-F1 0.996, n=754):**

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| Golden | 0.995 | 0.997 | 0.996 | 377 |
| SolderInsufficient | 0.997 | 0.995 | 0.996 | 377 |

## Requisitos de hardware

- No se han publicado requisitos especificos de VRAM o GPU.
- El modelo, al estar basado en YOLO26s-cls, es un clasificador ligero y se espera que pueda ejecutarse en CPU o en GPUs de gama baja. Sin embargo, no se confirma el numero de parametros ni el peso del fichero.
- El repositorio de HuggingFace reporta un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar subidos en el momento de la consulta. Antes de planificar el despliegue, conviene verificar la presencia real del fichero `model.onnx`.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) y la libreria Ultralytics si se dispone de los pesos originales.
- No se disponen de datos de latencia ni de throughput.

## Comparativa con modelos similares

No se han identificado modelos comparables publicos en la informacion disponible. Los repositorios hermanos de SentinelPCB (PCBInspect-Region, PCBInspect-BodyDefect, PCBInspect-TextDefect) son complementarios y no directamente comparables, ya que cada uno cubre un tipo de defecto o region distinta. No disponemos de datos de rendimiento de otros modelos de la misma categoria para realizar una comparativa.

## Limitaciones y advertencias

- El modelo solo clasifica dos clases: Golden y SolderInsufficient. No cubre otros defectos comunes de soldadura como exceso de soldadura, puentes de soldadura, componentes ausentes o desplazados.
- El dataset de entrenamiento es propietario y no se distribuye, por lo que el modelo puede presentar sesgos hacia el dominio especifico de AOI para el que fue entrenado.
- La generalizacion a otros procesos de fabricacion, PCB de distintos materiales o condiciones de iluminacion diferentes no ha sido evaluada.
- El rendimiento depende de recortes de ROI correctamente alineados y escalados a 640x640. Cambios en el preprocesado (resize, normalizacion, orden de canales) pueden degradar los resultados.
- La salida del modelo son logits sin softmax aplicado. Es obligatorio aplicar softmax para interpretar las salidas como probabilidades.
- El repositorio de HuggingFace registra un tamano de 0.0 GB, lo que cuestiona la disponibilidad real de los pesos. Es posible que el modelo no pueda descargarse en su estado actual.
- Las metricas reportadas provienen del autor y no han sido verificadas de forma independiente.
- La licencia MIT permite el uso comercial del modelo, pero el conjunto de datos de entrenamiento no es publico, lo que limita la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: [JcProg/PCBInspect-LeadDefect](https://huggingface.co/JcProg/PCBInspect-LeadDefect)
- Repositorio hermano: [PCBInspect-Region](https://huggingface.co/JcProg/PCBInspect-Region)
- Repositorio hermano: [PCBInspect-BodyDefect](https://huggingface.co/JcProg/PCBInspect-BodyDefect)
- Repositorio hermano: [PCBInspect-TextDefect](https://huggingface.co/JcProg/PCBInspect-TextDefect)
- Detector de caracteristicas estructurales: [PCBInspect-AI](https://huggingface.co/JcProg/PCBInspect-AI)
- Documentacion de YOLO26 de Ultralytics: [Ultralytics YOLO26 docs](https://docs.ultralytics.com/models/yolo26/)
