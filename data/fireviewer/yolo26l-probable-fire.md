# fireviewer/yolo26l-probable-fire

## Resumen

YOLO26L — probable fire es un modelo de deteccion de objetos desarrollado por el usuario fireviewer, especializado en la identificacion de una unica clase: `probable_fire` (fuego probable). Se construye sobre la arquitectura YOLO26 en su variante L (large) mediante la libreria Ultralytics, y esta pensado como componente de un sistema de alerta temprana de incendios a partir de imagenes.

El modelo se entrena sobre el corpus `fireviewer/fireviewer_probable_fire_v3_native`, un conjunto de 928 imagenes, usando entrenamiento distribuido (DDP) sobre dos GPU NVIDIA T4. Segun la model card, el estado publicado corresponde a la epoca 1 (`epoch_1`), con un presupuesto de sesion de 10,64 horas frente a un techo solicitado de 24 horas.

Es relevante ahora por dos motivos: por un lado, aplica la generacion YOLO26 de Ultralytics a un caso de uso de seguridad medioambiental; por otro, su publicacion como checkpoint temprano (epoca 1) lo convierte en un artefacto de investigacion mas que en un modelo listo para produccion. El repositorio ocupa 0,3 GB e incluye los pesos `best.pt` y `last.pt` conservados antes de la limpieza final de optimizadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (variante L, deteccion de objetos, Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`, `last.pt`) |
| Clases | 1 (`probable_fire`) |
| Imagenes de entrenamiento | 928 |
| Epoca publicada | 1 |
| Libreria | Ultralytics |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

Se trata de un detector de objetos de la familia YOLO26 en su variante L, implementado con la libreria Ultralytics. YOLO es una arquitectura de deteccion en una sola etapa (single-stage) que predice cajas delimitadoras y clases directamente sobre una rejilla de caracteristicas, sin etapa de propuesta de regiones. La variante L corresponde al escalado grande dentro de la familia, aunque la model card no detalla el numero de parametros ni la resolucion de entrada.

El entrenamiento se realizo sobre el corpus `fireviewer/fireviewer_probable_fire_v3_native` (commit `637ddffba5442991ec4110283f1b3e49478f1a62`), con 928 imagenes y una unica clase (`probable_fire`, indice 0). Se empleo entrenamiento distribuido en paralelo (DDP) sobre dos GPU NVIDIA T4, con un techo solicitado de 24 horas, un presupuesto de sesion de 10,64 horas y una paciencia estricta de 7 epocas. El checkpoint publicado corresponde a la epoca 1. No se documenta en la informacion disponible el uso de tecnicas de aumento de datos, RLHF/DPO (no aplicables a deteccion) ni estrategias de decodificacion especulativa.

## Capacidades

- Deteccion de objetos de una unica clase: `probable_fire`, orientada a identificar indicios de fuego en imagenes.
- Salida estandar de deteccion (cajas delimitadoras, confianza y clase) compatible con el ecosistema Ultralytics.
- Entrenamiento reproducible mediante `training_setup.json`, `history.csv` y `ddp_verified.json` incluidos en el repositorio.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision multimodal descriptiva, tool calling, agentes ni multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Vigilancia forestal con camaras fijas: el modelo puede desplegarse sobre streams de video de torres de vigilancia para marcar fotogramas con presencia probable de fuego y activar alertas tempranas, aprovechando su naturaleza de detector en una sola etapa.
- Monitorizacion de quemas controladas: integrado en un pipeline de imagenes periodicas, permite verificar que una quema autorizada no se extiende fuera del perimetro previsto mediante la deteccion de la clase `probable_fire`.
- Triaje de imagenes satelitales o aereas: como primer filtro en un sistema de revision humana, reduce el volumen de imagenes que un operador debe inspeccionar manualmente.
- Integracion en sistemas de emergencias: las detecciones pueden enviarse a un backend de gestion de incidentes mediante la API de Ultralytics, sirviendo como senal complementaria a sensores de humo y temperatura.
- Investigacion en deteccion temprana de incendios: el checkpoint de epoca 1 y los artefactos de entrenamiento permiten reproducir el experimento y servir de linea base para comparaciones con otros detectores.
- Prototipado de drones de vigilancia: al ser un modelo de deteccion ligero y exportable desde Ultralytics, puede embeberse en plataformas con GPU de consumo para pruebas de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia los ficheros `history.csv`, `training_setup.json` y `ddp_verified.json` como artefactos de seguimiento del entrenamiento, sin cifras de mAP, precision o recall.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de una variante L de YOLO26 y un repositorio de 0,3 GB, es plausible su ejecucion en GPU de consumo, aunque no se confirma en la informacion proporcionada.
- GPU de entrenamiento documentadas: 2 x NVIDIA T4 mediante DDP.
- GPU recomendadas para inferencia: no disponible en la informacion; por la familia del modelo, cabria esperar compatibilidad con GPU NVIDIA consumer y profesionales, sin confirmacion oficial.
- Cabe en GPU de consumo: no confirmado en la informacion disponible.
- Opciones de despliegue: al usar la libreria Ultralytics, es compatible con el flujo habitual de la libreria (carga de `best.pt`/`last.pt` y exportacion a formatos como ONNX o TensorRT), si bien la model card no detalla exportaciones realizadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (detectores de fuego) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Checkpoint de epoca 1: el modelo se publica como estado temprano del entrenamiento, por lo que su calidad de deteccion es previsiblemente baja y no debe usarse en produccion sin validacion adicional.
- Dataset pequeno: solo 928 imagenes de entrenamiento, lo que incrementa el riesgo de sobreajuste y de baja generalizacion a dominios visuales distintos (iluminacion, sensores, geografia).
- Clase unica y ambigua: la etiqueta `probable_fire` no distingue entre tipos de fuego, falsos positivos (p. ej. reflejos, niebla, objetos rojizos) ni fases del incendio.
- Sesgos desconocidos: no se documenta la composicion del dataset, por lo que no es posible evaluar sesgos geograficos, estacionales o de sensor.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo derivado y su distribucion en red; debe revisarse antes de un uso comercial cerrado.
- Sin datos de benchmarks ni de rendimiento: no es posible estimar mAP, precision, recall ni latencia a partir de la informacion disponible.
- Idiomas y contexto: no aplica, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/yolo26l-probable-fire
- Corpus de entrenamiento: `fireviewer/fireviewer_probable_fire_v3_native` (commit `637ddffba5442991ec4110283f1b3e49478f1a62`)
- Libreria Ultralytics: https://github.com/ultralytics/ultralytics
