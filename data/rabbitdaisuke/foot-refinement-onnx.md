# RabbitDaisuke/Foot-Refinement-onnx

## Resumen

FOCUS Foot Refinement ONNX es una exportación a formato ONNX del checkpoint YOLO26n-pose del proyecto FOCUS, publicada por el usuario RabbitDaisuke. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un detector de keypoints especializado en el pie humano: estima ocho puntos 2D (dedo gordo, dedo pequeño, talón y tobillo de cada pie) sobre imágenes RGB. El autor declara explícitamente que no hay entrenamiento nuevo, sino una conversión reproducible del checkpoint original de Logimade/FOCUS, con verificación del objeto Git de origen antes de la exportación.

El modelo resuelve un problema concreto de visión por computador: el refinamiento de la pose del pie en pipelines de estimación de pose corporal completa (COCO-WholeBody). Los ocho puntos exportados corresponden a los índices 17, 18, 19, 15, 20, 21, 22 y 16 de COCO-WholeBody, lo que permite integrarlo como etapa de refinamiento sobre detectores de cuerpo entero. Su relevancia es de nicho: aplicaciones de biomecánica, análisis de marcha, ergonomía o realidad aumentada donde el detalle del pie importa y los detectores corporales genéricos no llegan.

La arquitectura subyacente es YOLO26n-pose, la variante nano de la familia YOLO26 de Ultralytics orientada a detección de pose. El repositorio es de tamaño 0.0 GB según HuggingFace (probablemente por redondeo de un artefacto pequeño), tiene 0 descargas y 0 likes en el momento de la consulta, y se distribuye bajo licencia AGPL-3.0. No hay información sobre idiomas porque no es un modelo lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-pose (detector de keypoints, familia Ultralytics YOLO26) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | AGPL-3.0 (pesos con términos Ultralytics AGPL-3.0) |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Entrada | RGB float32 NCHW 1x3x640x640, letterbox padding 114, normalización /255 |
| Salida | Coordenadas ya decodificadas en píxeles de la imagen de entrada |
| Puntos detectados | 8 (dedo gordo, dedo pequeño, talón, tobillo por pie) |
| Índices COCO-WholeBody | 17, 18, 19, 15, 20, 21, 22, 16 |
| NMS | Requerido externamente para la cabeza one-to-many si se retienen múltiples detecciones |
| Selección de par de pies | Argmax sobre las detecciones |
| Tamaño del repo | 0.0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de un checkpoint YOLO26n-pose, la variante nano de la familia YOLO26 de Ultralytics. YOLO26 es una arquitectura de detección de objetos y pose de una sola etapa, con cabeza de keypoints que predice coordenadas directamente sobre la imagen. La variante "n" (nano) es la de menor capacidad de la familia, pensada para inferencia en tiempo real en hardware modesto. El autor no documenta el número de parámetros ni la composición del dataset de entrenamiento original; solo indica que el checkpoint procede de Logimade/FOCUS y que su objeto Git se verifica antes de exportar.

No hay entrenamiento nuevo ni fine-tuning por parte del autor de esta exportación. La model card es explícita: "No new training is claimed". Tampoco se documentan datos de entrenamiento, número de tokens (no aplica), ni técnicas de RLHF/DPO (no aplica a un detector). La innovación técnica de esta ficha es la reproducibilidad de la exportación: entrada fija 1x3x640x640 con letterbox de padding 114 y normalización /255, salida ya decodificada en píxeles de la imagen de entrada, de modo que el consumidor no debe aplicar un segundo decodificador de cabeza YOLO. El archivo `foot-models.json` del repositorio contiene las formas de salida medidas y los ajustes de exportación.

## Capacidades

- Detección de keypoints 2D de pie: ocho puntos por imagen (dedo gordo, dedo pequeño, talón y tobillo de cada pie).
- Refinamiento de pose de pie sobre pipelines COCO-WholeBody: los índices de salida coinciden con los de ese estándar.
- Inferencia en tiempo real: variante nano de YOLO26, adecuada para vídeo y despliegue en el borde.
- Ejecución con onnxruntime: portable a CPU y GPU sin dependencia del framework de entrenamiento original.
- Selección de un par de pies por imagen mediante argmax sobre las detecciones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- Capacidades multilingües: no aplica.

## Casos de uso

- Análisis de marcha y biomecánica: el modelo refina la posición de talón, tobillo y dedos sobre secuencias de vídeo, permitiendo calcular ángulos de pisada y apoyo con ocho puntos 2D por pie. Es adecuado porque la salida ya viene en píxeles de la imagen de entrada, lo que simplifica la integración con pipelines existentes de seguimiento.
- Ergonomía y análisis postural en puestos de trabajo: se puede desplegar sobre cámaras fijas para monitorizar la posición de los pies de operarios y detectar apoyos incorrectos o posturas mantenidas, con inferencia en tiempo real gracias a la variante nano.
- Realidad aumentada para calzado: aplicaciones de prueba virtual de zapatos pueden usar los ocho puntos para alinear la plantilla virtual con el pie del usuario, refinando la pose que un detector corporal completo deja imprecisa en esa zona.
- Rehabilitación y fisioterapia: seguimiento de la colocación del pie en ejercicios guiados, con registro de la evolución de los puntos a lo largo de sesiones; la licencia AGPL-3.0 condiciona la distribución del software que lo integre.
- Robótica y prótesis: estimación de la posición del pie para control de exoesqueletos o prótesis activas, donde la latencia baja de un modelo nano y la portabilidad ONNX permiten ejecución en el propio dispositivo.
- Análisis deportivo: extracción de keypoints de pie en vídeo de carrera o salto para calcular tiempos de contacto, ángulos de despegue y apoyo, integrándolo como etapa de refinamiento tras un detector de cuerpo completo.
- Investigación en visión por computador: evaluación reproducible de pipelines de refinamiento de pose, ya que el autor publica el repositorio de evaluación en GitHub y fija el checkpoint de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "small COCO-WholeBody diagnostic evaluation" y advierte explícitamente que no constituye un benchmark de generalización independiente, pero no se incluyen cifras en la información proporcionada. No se inventan números.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una variante nano de YOLO26 con entrada 1x3x640x640, la huella de memoria es reducida, pero el autor no publica cifras.
- GPU recomendadas: no disponible. Por la categoría del modelo (nano, tiempo real), es razonable esperar ejecución en GPU de consumo, pero no hay datos confirmados en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado por el autor; la variante nano sugiere que sí, pero no se dispone de medición oficial.
- Opciones de despliegue: onnxruntime (declarado como librería del repositorio); también es posible servir el ONNX con otros runtimes compatibles, aunque no se documentan en la ficha.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Puntos de pie | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FOCUS Foot Refinement ONNX (este) | YOLO26n-pose exportado a ONNX | 8 (COCO-WholeBody 17,18,19,15,20,21,22,16) | 1x3x640x640 | AGPL-3.0 | HuggingFace, 0 descargas |
| Wholebody-Refinement-onnx | Refinamiento de cuerpo completo en ONNX | No disponible | No disponible | Apache-2.0 (según la model card) | Repositorio separado del mismo autor |
| YOLO26n-pose (Ultralytics, checkpoint original) | Detector de pose de una etapa | Pose completa (no específica de pie) | Configurable | AGPL-3.0 | Disponible vía Ultralytics |
| Detectores COCO-WholeBody genéricos | Pose corporal completa con keypoints de pie | Incluye índices de pie, precisión limitada en esa zona | Variable | Variable | Varios |

La comparativa se limita a lo que la información permite afirmar. No se dispone de datos de rendimiento comparado entre estas alternativas.

## Limitaciones y advertencias

- Los ocho puntos son landmarks 2D estimados: no se miden cinco dedos individuales, articulación de dedos, profundidad ni visibilidad real.
- La evaluación diagnóstica sobre COCO-WholeBody no es un benchmark de generalización independiente; el rendimiento en dominios distintos (calzado, oclusiones, ángulos extremos) no está validado.
- Licencia AGPL-3.0: los pesos conservan los términos AGPL-3.0 de Ultralytics; la licencia del código del README de FOCUS no sustituye la licencia del modelo preentrenado. El uso comercial en productos distribuidos exige cumplir con AGPL-3.0.
- Requiere NMS externo para la cabeza one-to-many si se retienen múltiples detecciones; el argmax selecciona un único par de pies.
- La salida ya está decodificada: aplicar un segundo decodificador de cabeza YOLO produce resultados incorrectos. Hay que deshacer el letterbox y sumar el origen del recorte.
- No se distribuyen imágenes ni anotaciones en el repositorio del modelo.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de keypoints espurios en oclusiones o calzado que oculta la anatomía del pie.
- Sesgos conocidos: no documentados por el autor; al ser un modelo de visión, puede heredar sesgos del dataset de entrenamiento original de YOLO26 y de COCO-WholeBody (demografía, iluminación, tipo de calzado).
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación muy limitado.
- El repositorio figura con tamaño 0.0 GB, lo que puede indicar que los pesos no están incluidos o que el redondeo de HuggingFace oculta un artefacto pequeño; conviene verificar los archivos antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RabbitDaisuke/Foot-Refinement-onnx
- Repositorio FOCUS (origen del checkpoint): https://github.com/Logimade/FOCUS
- Evaluación reproducible (Actions): https://github.com/DaisukeDaisuke/Wholebody-test
- Licencia Ultralytics: https://www.ultralytics.com/license
