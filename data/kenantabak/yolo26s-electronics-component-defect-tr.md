# kenantabak/yolo26s-electronics-component-defect-tr

## Resumen

YOLO26s-electronics-component-defect-tr es un modelo de deteccion de objetos basado en la arquitectura YOLO26s de Ultralytics, publicado por el desarrollador kenantabak. Esta especializado en la deteccion de componentes electronicos y defectos en placas de circuito impreso (PCB), una tarea de inspeccion visual automatizada (AOI) dentro del ambito de la vision por computador industrial. El modelo se distribuye con pesos en formato PyTorch (`best.pt`, 18,47 MB) y ONNX (`best.onnx`, 36,3 MB), lo que facilita su integracion tanto en pipelines de entrenamiento como en entornos de inferencia en produccion.

El modelo fue entrenado en la plataforma EVREN sobre una infraestructura de una GPU NVIDIA H200 y supero la puerta de calidad interna etiquetada como `PRODUCTION` antes de su publicacion en abierto. Segun la model card, alcanza un mAP@50 del 97,37 % y un mAP@50-95 del 73,95 % sobre su conjunto de validacion, con una puntuacion F1 del 96,05 %. La entrada estandar es de 640x640 pixeles.

Se trata de un modelo de nicho, orientado a un dominio muy concreto (componentes electronicos y defectos de placa) y con un unico autor, por lo que su utilidad practica depende de la similitud entre el dataset de entrenamiento (no documentado) y las imagenes objetivo. La licencia MIT del modelo es permisiva, aunque el runtime de Ultralytics YOLO se rige por su propia licencia, un matiz relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640x640) |
| Tipos de cuantizacion | no disponible (se publican pesos FP32/estandar en `.pt` y `.onnx`) |
| Idiomas soportados | no disponible (tarea de vision, sin procesamiento de lenguaje) |
| Licencia | MIT (modelo); runtime Ultralytics sujeto a su propia licencia |
| Formato de pesos | PyTorch (`best.pt`, 18,47 MB) y ONNX (`best.onnx`, 36,3 MB) |

## Arquitectura y entrenamiento

La arquitectura es YOLO26s, un detector de objetos de una sola etapa de la familia Ultralytics YOLO, con backbone y cabeza de deteccion convolucionales y resolucion de entrada de 640x640 pixeles. La model card no detalla la composicion interna de la red (profundidad, anchura, modulos concretos) ni las innovaciones especificas de la variante YOLO26 respecto a versiones anteriores; esa informacion no esta disponible en los datos proporcionados.

El entrenamiento se realizo en la plataforma EVREN con una GPU NVIDIA H200. No se especifican el numero de imagenes, el numero de clases, la composicion del dataset, el numero de epocas ni si se aplicaron tecnicas de aumento de datos o ajuste fino posteriores; todos esos datos figuran como no disponibles. El modelo paso una validacion interna etiquetada como `PRODUCTION`, con los valores de mAP y F1 indicados en la model card, pero no se documenta como se construyo el conjunto de validacion ni si es independiente del de entrenamiento.

## Capacidades

- Deteccion de objetos en imagenes de placas de circuito impreso y componentes electronicos, con salida de cajas delimitadoras y etiquetas de clase.
- Identificacion de defectos de fabricacion o montaje en placas (la taxonomia concreta de clases no esta documentada en la informacion disponible).
- Inferencia sobre imagenes de 640x640 pixeles de resolucion de entrada.
- Exportacion a ONNX para despliegue en entornos sin PyTorch.
- Integracion con la libreria Ultralytics para carga, validacion y exportacion del modelo.
- No soporta tool calling, funciones de agente, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual de deteccion.

## Casos de uso

- Inspeccion visual automatizada (AOI) en lineas de fabricacion de PCB: el modelo puede procesar imagenes de cada placa a la salida de la linea y marcar componentes ausentes, mal posicionados o defectuosos, sustituyendo parte de la revision manual con una latencia de inferencia propia de un detector YOLO pequeno.
- Control de calidad en ensamblaje electronico: integrado en una camara fija sobre la estacion de montaje, permite rechazar unidades defectuosas en tiempo real antes de pasar a la siguiente fase.
- Clasificacion y triaje de imagenes de reparacion: en un taller o servicio postventa, el modelo puede preetiquetar imagenes de placas devueltas para priorizar la revision por parte de un tecnico.
- Generacion de datasets asistida: usar el modelo como preanotador para etiquetar grandes volumenes de imagenes de componentes electronicos y acelerar la creacion de nuevos conjuntos de datos anotados.
- Despliegue en dispositivos de borde: al disponer de un ONNX de 36,3 MB, puede ejecutarse en equipos con GPU de gama media o incluso en CPU/edge con ONNX Runtime, adecuado para inspeccion en planta sin conexion a la nube.
- Prototipado de sistemas de vision industrial: sirve como punto de partida (fine-tuning) para dominios cercanos de electronica, dado que la licencia MIT permite adaptarlo sin restricciones de uso comercial sobre los pesos.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas de validacion del propio modelo:

| Metrica | Valor |
|---|---|
| mAP@50 | 97,37 % |
| mAP@50-95 | 73,95 % |
| F1 | 96,05 % |
| Entrada | 640x640 |
| Arquitectura | YOLO26s |

No se han publicado resultados comparativos con otros modelos ni detalles del conjunto de validacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los pesos (18,47 MB en `.pt`, 36,3 MB en `.onnx`) y la arquitectura YOLO26s, la huella de memoria es reducida y cabe holgadamente en cualquier GPU consumer actual.
- GPU recomendadas: cualquier GPU NVIDIA con al menos unos pocos GB de VRAM; una RTX 3060 o superior es mas que suficiente para inferencia a 640x640. El entrenamiento se realizo en una NVIDIA H200, pero no se especifican requisitos minimos de entrenamiento.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna (RTX 20xx en adelante), asi como en CPU mediante ONNX Runtime.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime, y herramientas de exportacion compatibles con ONNX (TensorRT, OpenVINO) segun la cadena de Ultralytics; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, podria compararse con otras variantes de la familia YOLO (por ejemplo, YOLOv8s o YOLO11s de Ultralytics) o con detectores de una etapa como RT-DETR, pero no se han publicado metricas de este modelo frente a ellos en los datos disponibles, por lo que la comparacion cuantitativa figura como no disponible.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s-electronics-component-defect-tr | no disponible | 640x640 | mAP@50 97,37 % (validacion propia) | MIT (runtime Ultralytics aparte) | Hugging Face |
| Alternativas (YOLOv8s, YOLO11s, RT-DETR) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo se ha validado en la tarea de deteccion de componentes electronicos y defectos de placa; su rendimiento fuera de ese dominio no esta documentado.
- Dataset de entrenamiento no documentado: se desconoce el numero de imagenes, clases y procedencia, lo que impide evaluar el riesgo de sobreajuste o de sesgo hacia condiciones de iluminacion, camara o tipo de placa concretas.
- Metricas de validacion sin contexto: los valores de mAP y F1 corresponden a un conjunto de validacion no descrito; no hay garantia de que sea independiente del entrenamiento.
- Riesgo de falsos positivos y negativos en produccion: al no publicarse matrices de confusion por clase ni curvas precision-recall, no es posible estimar el comportamiento por tipo de defecto.
- Licencia: los pesos son MIT, pero el runtime de Ultralytics YOLO tiene su propia licencia, que puede imponer condiciones adicionales para uso comercial; conviene revisarla antes de desplegar en produccion.
- Sin soporte de lenguaje ni de agentes: no es adecuado para tareas de texto, razonamiento o tool calling.
- Modelo de un unico autor con 0 descargas en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/kenantabak/yolo26s-electronics-component-defect-tr
- Pagina del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/elektronik-devre-elemani-ve-kart-kusuru-tespiti
- GitHub del autor: https://github.com/kenantabak
