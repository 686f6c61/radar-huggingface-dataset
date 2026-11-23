# Razy29/my-item-detector

## Resumen

My Item Detector es un modelo de deteccion de objetos publicado por el usuario Razy29 en Hugging Face, desarrollado como proyecto de fin de bootcamp en el programa CodingBN (sesiones 14 y 15). Se trata de un ajuste fino del modelo base YOLO26n de Ultralytics, especializado en la clasificacion de residuos en seis categorias: residuo general, vidrio, metal, papel y carton, plastico y caucho. El modelo se entrena sobre un conjunto de aproximadamente 50 fotografias tomadas por el propio autor y etiquetadas manualmente en Roboflow.

El modelo se enmarca en la familia YOLO (You Only Look Once), una arquitectura de deteccion de objetos en una sola etapa que predice simultaneamente cajas delimitadoras y clases en una unica pasada por la red. La variante "n" (nano) de YOLO26 es la mas pequena de la familia, disenada para inferencia en tiempo real en dispositivos con recursos limitados. El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos no estan efectivamente alojados o que el repositorio esta practicamente vacio.

La relevancia de este modelo es limitada: se trata de un artefacto educativo con cero descargas y cero likes en el momento de la consulta, entrenado sobre un dataset minimo de 50 imagenes capturadas en una sola habitacion con un solo telefono. El propio autor advierte en la model card que no es apto para uso comercial ni para aplicaciones criticas de seguridad. Su interes es, por tanto, exclusivamente didactico o como ejemplo de pipeline de entrenamiento con Ultralytics y Roboflow.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos en una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; las clases estan en ingles) |
| Licencia | AGPL-3.0 (o licencia Enterprise de Ultralytics) |
| Formato de pesos | no disponible (repositorio de 0.0 GB; se esperaria .pt de PyTorch/Ultralytics) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO26n, la variante nano de la familia YOLO26 de Ultralytics. Se trata de un detector de objetos en una sola etapa con arquitectura de red neuronal convolucional (CNN) tipo backbone-cabeza, que predice cajas delimitadoras y probabilidades de clase directamente en una unica pasada. La variante "n" es la de menor tamano y coste computacional de la familia, pensada para inferencia en tiempo real en CPU y GPUs de gama baja.

El entrenamiento consistio en un ajuste fino (fine-tuning) del modelo base YOLO26n sobre aproximadamente 50 fotografias tomadas por el autor, etiquetadas manualmente en Roboflow con seis clases de residuos. No se dispone de informacion sobre el numero de epochs, el tamano de validacion, las tecnicas de aumento de datos aplicadas ni la composicion exacta del dataset. La model card incluye un marcador de posicion ("add your mAP50 here") en lugar del valor real de mAP50, lo que indica que el autor no completo la metrica de evaluacion. No se menciona el uso de RLHF, DPO ni tecnicas de destilacion.

## Capacidades

- Deteccion de objetos en imagenes con seis clases: `General Waste`, `Glass`, `Metal`, `Paper and Cardboard`, `Plastic` y `Rubber`.
- Prediccion de cajas delimitadoras y etiquetas de clase en una sola pasada (deteccion en una etapa).
- Inferencia en tiempo real gracias al tamano reducido de la variante nano.
- Compatible con la libreria Ultralytics para entrenamiento, validacion e inferencia.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingues, vision-lenguaje, audio ni modo "thinking".
- Capacidad de generalizacion muy limitada: solo reconoce las seis clases entrenadas y falla ante fondos, iluminaciones y objetos distintos a los del dataset de entrenamiento.

## Casos de uso

- Proyecto educativo de deteccion de residuos: util como ejemplo practico de pipeline completo (captura de imagenes, etiquetado en Roboflow, entrenamiento con Ultralytics e inferencia) en cursos y bootcamps de vision por computador.
- Prototipo de clasificacion de residuos en un entorno controlado: podria emplearse para separar residuos en una unica habitacion con iluminacion y fondo conocidos, siempre que se acepte una precision baja y se valide manualmente.
- Demostracion de fine-tuning de YOLO: sirve como plantilla para que otros estudiantes repliquen el flujo de trabajo con su propio dataset.
- Pruebas de integracion con la libreria Ultralytics: permite verificar la carga del modelo, la API de prediccion y el formato de salida en un entorno de desarrollo.
- Benchmark interno de referencia: puede usarse como linea base (baseline) minima para comparar con detectores entrenados sobre datasets mayores en la misma tarea de clasificacion de residuos.
- Ejercicio de evaluacion de limitaciones: util para ilustrar en clase como un dataset pequeno y poco diverso degrada la generalizacion y por que es necesario un conjunto de validacion representativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un marcador de posicion para el valor de mAP50 ("add your mAP50 here") que el autor no llego a completar, por lo que no existe ninguna metrica de rendimiento reportada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de la variante nano de YOLO26, se espera un consumo muy bajo (tipicamente por debajo de 1-2 GB en FP32 para modelos nano de la familia YOLO, aunque este dato no esta confirmado para YOLO26n).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para un modelo de este tamano; tambien es probable la inferencia en CPU.
- Cabe en GPU consumer: si, previsiblemente en practicamente cualquier GPU consumer (GTX 1050 o superior) e incluso en CPU.
- Opciones de despliegue: libreria Ultralytics (PyTorch), exportacion a ONNX, TensorRT, OpenVINO o TFLite segun el soporte de Ultralytics para YOLO26.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| My Item Detector (YOLO26n fine-tuned) | no disponible | no aplica | mAP50 no reportado | AGPL-3.0 | Hugging Face (0 descargas) |
| YOLO26n (Ultralytics, base) | no disponible | no aplica | no disponible en la informacion | AGPL-3.0 / Enterprise | Ultralytics |
| YOLOv8n (Ultralytics) | no disponible en la informacion | no aplica | no disponible en la informacion | AGPL-3.0 / Enterprise | Ultralytics |
| YOLOv5n (Ultralytics) | no disponible en la informacion | no aplica | no disponible en la informacion | AGPL-3.0 / Enterprise | Ultralytics |

No se dispone de datos de rendimiento para ninguno de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la licencia y la disponibilidad. La diferencia principal de My Item Detector frente a los modelos base es su especializacion en seis clases de residuos, a costa de un dataset de entrenamiento minimo.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (aproximadamente 50 imagenes) capturado en una sola habitacion con un solo telefono: la generalizacion a otros fondos, iluminaciones y objetos es muy pobre.
- Solo reconoce las seis clases entrenadas; cualquier otro objeto se ignora o se clasifica erroneamente.
- No apto para uso comercial ni para aplicaciones criticas de seguridad, segun advierte el propio autor.
- Licencia AGPL-3.0: cualquier uso en red o distribucion del modelo o de obras derivadas obliga a liberar el codigo bajo la misma licencia, salvo que se adquiera una licencia Enterprise de Ultralytics.
- Riesgo elevado de falsos positivos y falsos negativos por la escasez y falta de diversidad de los datos.
- No se reporta ninguna metrica de evaluacion (mAP50 pendiente), por lo que no es posible cuantificar su precision.
- El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles o que el repositorio esta incompleto.
- Sin informacion sobre sesgos, idiomas ni composicion demografica del dataset (no aplica en sentido estricto al ser un detector de objetos, pero la diversidad visual del dataset es practicamente nula).

## Enlaces

- Hugging Face: https://huggingface.co/Razy29/my-item-detector
- Ultralytics (framework y modelos YOLO): https://github.com/ultralytics/ultralytics
- Roboflow (plataforma de etiquetado mencionada por el autor): https://roboflow.com
- CodingBN (bootcamp donde se entreno el modelo): no disponible
