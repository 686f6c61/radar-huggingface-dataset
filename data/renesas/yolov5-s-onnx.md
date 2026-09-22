# Renesas/YOLOv5-S-ONNX

## Resumen

YOLOv5-S-ONNX es una exportación a formato ONNX del detector de objetos YOLOv5 en su variante "small", publicada por Renesas Electronics y orientada a ejecutarse sobre la NPU NPX6 del sistema en chip R-Car X5H. No se trata de un modelo nuevo entrenado desde cero: parte del checkpoint Ultralytics/YOLOv5 y de la receta de entrenamiento de OpenMMLab, y el valor que aporta Renesas es la optimización y el empaquetado para su cadena de herramientas propietaria de inferencia.

El modelo resuelve detección de objetos genérica sobre las 80 clases de COCO, con 7,2 millones de parámetros, y su principal atractivo es la integración con el runtime MWMX: el artefacto se distribuye en FP32 y es la propia toolchain de Renesas la que lo convierte automáticamente a INT8 en tiempo de compilación, sin necesidad de un paso de cuantización separado por parte del usuario.

Es relevante ahora porque ejemplifica el patrón de publicación de modelos optimizados para hardware embebido automovilístico y de borde, donde el interés no está en el entrenamiento sino en la latencia medible sobre silicio real. Renesas reporta latencias de 12,98 ms con un núcleo y 6,25 ms con doce núcleos a 850 MHz, datos obtenidos en su pipeline de CI con hardware en el bucle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv5 (CNN one-stage, deteccion anclada multi-escala), con SyncBN y receta de entrenamiento "fast" |
| Parametros totales | 7,2 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | FP32 en el artefacto publicado; INT8 mediante auto-cast de la toolchain MWMX en tiempo de compilacion |
| Idiomas soportados | no disponible (no aplica a deteccion de objetos) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`fp32/yolov5s.onnx`) |

## Arquitectura y entrenamiento

La red sigue el diseno estandar de YOLOv5-S: un backbone convolucional tipo CSPDarknet, un cuello de agregacion de caracteristicas multi-escala y una cabeza de deteccion anclada que produce tres tensores de salida, uno por cada escala o stride. El checkpoint de origen corresponde a la configuracion de OpenMMLab `yolov5_s_v61_syncbn_fast_8xb16_300e_coco`, lo que indica entrenamiento sobre COCO con normalizacion por lotes sincronizada (SyncBN) y el regimen de entrenamiento acelerado de 300 epocas. No se documenta en la informacion disponible si hubo fases adicionales de ajuste fino, RLHF o DPO, algo por otra parte inusual en un detector puramente supervisado.

La innovacion relevante no esta en la arquitectura, sino en el flujo de despliegue. El modelo se publica exclusivamente en FP32 ONNX y es el toolchain MWMX de Renesas el que realiza la conversion a INT8 en el momento de la compilacion para la NPU NPX6-48K del R-Car X5H. Esto elimina la necesidad de que el desarrollador gestione un proceso de cuantizacion post-entrenamiento y fija el binario resultante al hardware objetivo. La resolucion de entrada no esta especificada en la model card (figura como TBD), aunque la forma esperada del tensor es `(N, 3, H, W)` en RGB.

## Capacidades

- Deteccion de objetos en imagenes: predice cajas delimitadoras y clases sobre las 80 categorias de COCO.
- Deteccion multi-escala: tres tensores de salida que cubren objetos de distinto tamano mediante decodificacion de anclas.
- Inferencia sobre NPU embebida: ejecucion en la NPX6-48K del R-Car X5H a traves del runtime MWMX.
- Escalado por nucleos: el mismo modelo aprovecha 1 o 12 nucleos de la NPU para reducir la latencia.
- No soporta tool calling, function calling ni agentes: es un modelo de vision puro.
- No dispone de modo "thinking", vision-lenguaje, audio ni generacion de texto.
- Capacidades multilingues: no aplica.

## Casos de uso

- Deteccion de peatones y vehiculos en sistemas de asistencia a la conduccion: el modelo cabe en la NPU del R-Car X5H y ofrece 6,25 ms por inferencia a 12 nucleos, lo que permite operar a frecuencias de cuadro propias de un sistema ADAS embarcado.
- Vigilancia perimetral en camaras de borde: al ejecutarse sobre hardware Renesas de bajo consumo, permite deteccion local sin enviar video a la nube, reduciendo ancho de banda y preservando privacidad.
- Inspeccion visual en linea de fabricacion: con 7,2 M de parametros y latencia de milisegundos, es viable montarlo en una linea de produccion para detectar defectos o piezas mal colocadas en tiempo real.
- Robotica movil y logistica: la deteccion de clases COCO (personas, cajas, sillas, vehiculos) sirve para navegacion reactiva y evitacion de obstaculos en robots de almacen.
- Analitica de aforo y conteo en comercio: el modelo se integra en el pipeline de una camara IP con SoC R-Car para contar personas y estimar ocupacion sin infraestructura de servidor.
- Prototipado rapido con ONNX: el artefacto FP32 puede cargarse en ONNX Runtime sobre CPU o GPU de desarrollo para validar la logica de preprocesado, decodificacion de anclas y NMS antes de desplegar en la NPU.
- Investigacion en cuantizacion y despliegue en borde: sirve como referencia para comparar comportamiento FP32 frente a INT8 auto-convertido en un acelerador real.

## Benchmarks y rendimiento

La model card no publica metricas de precision (mAP u otras); la seccion de accuracy figura como TBD. Solo se proporcionan latencias medidas sobre silicio real con el runtime MWMX, batch 1 y la NPU NPX6 a 850 MHz. La resolucion de entrada usada en la medicion tambien aparece como TBD.

| Runtime | Precision | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|
| MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 1 nucleo, 850 MHz | 12,984324 | Medida |
| MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 12 nucleos, 850 MHz | 6,250094 | Medida |

No se han publicado resultados de benchmarks de precision (COCO mAP) en la informacion disponible.

## Requisitos de hardware

- Ejecucion objetivo: Renesas R-Car X5H con NPU NPX6-48K, a traves del runtime MWMX. No es un modelo pensado para GPU de escritorio.
- Huella de memoria del artefacto: en FP32 el checkpoint de 7,2 M de parametros ocupa aproximadamente 29 MB; tras el auto-cast a INT8, alrededor de 7 MB.
- VRAM estimada: no disponible, porque el despliegue previsto no usa VRAM de GPU sino memoria del SoC y de la NPU.
- GPU recomendadas: no aplica para el flujo oficial. Para pruebas fuera del hardware objetivo, cualquier GPU con soporte de ONNX Runtime (por ejemplo, una RTX 3060 o superior) es mas que suficiente dado el tamano del modelo.
- Compatibilidad con GPU de consumo: el modelo ONNX FP32 cabe sin problema en cualquier GPU de consumo, pero esa no es la via de despliegue soportada por Renesas.
- Opciones de despliegue: runtime MWMX sobre R-Car X5H (oficial); ONNX Runtime sobre CPU o GPU para validacion y desarrollo.
- Latencia: 12,984324 ms con 1 nucleo y 6,250094 ms con 12 nucleos a 850 MHz, medido con hardware en el bucle.
- Throughput: no disponible de forma explicita; a partir de las latencias se deduce un maximo teorico de aproximadamente 77 y 160 inferencias por segundo para 1 y 12 nucleos respectivamente, sin solapamiento.
- Prerrequisitos: placa R-Car X5H con NPU NPX6, runtime MWMX y la CLI de Hugging Face para descargar el artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/YOLOv5-S-ONNX | 7,2 M | no aplica | no disponible (TBD) | Apache 2.0 | ONNX FP32, optimizado para X5H |
| Renesas/YOLOv5-M-ONNX | no disponible | no aplica | no disponible | no disponible | Publicado por Renesas, misma familia |
| Renesas/YOLOv5-L-ONNX | no disponible | no aplica | no disponible | no disponible | Publicado por Renesas, misma familia |
| Ultralytics/YOLOv5 | no disponible (modelo base) | no aplica | no disponible en esta informacion | no disponible | Pesos PyTorch originales |

La comparacion cuantitativa no es posible con los datos disponibles: Renesas no publica parametros ni metricas de las variantes M y L en la informacion proporcionada, y el repositorio base tampoco aporta cifras en este contexto. La diferencia funcional entre las tres variantes de Renesas es el compromiso entre tamano de red y latencia, siendo la S la mas ligera.

## Limitaciones y advertencias

- No hay metricas de precision publicadas: no se puede afirmar nada sobre mAP ni sobre la perdida de exactitud introducida por el auto-cast a INT8.
- La resolucion de entrada, el preprocesado y el formato exacto del tensor de entrada figuran como TBD; habra que determinarlos empiricamente antes de integrar el modelo.
- El posprocesado no viene incluido: la salida requiere decodificacion de anclas en las tres escalas, filtrado por umbral de confianza y supresion de no maximos (NMS).
- Dependencia de hardware propietario: el flujo oficial exige una placa R-Car X5H, la NPU NPX6 y el runtime MWMX, lo que limita la portabilidad.
- Sesgos: al entrenarse sobre COCO, hereda los sesgos de representacion y la distribucion de clases de ese dataset, orientado a escenas cotidianas y no a dominios especializados.
- Riesgo de falsos positivos y negativos en clases poco frecuentes o en condiciones de iluminacion adversas, comportamiento tipico de los detectores one-stage ligeros.
- Idiomas y texto: el modelo no procesa lenguaje natural, por lo que no aplica ninguna consideracion multilingue.
- Licencia Apache 2.0 para el artefacto publicado, pero conviene verificar las condiciones de los pesos de Ultralytics empleados como base antes de un uso comercial, ya que la model card no detalla la cadena de licencias completa.
- Estado del repositorio: sin descargas ni "me gusta" en el momento de la consulta y un tamano declarado de 0,0 GB, senal de que puede tratarse de una publicacion inicial con documentacion incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renesas/YOLOv5-S-ONNX
- Variante M en Hugging Face: https://huggingface.co/Renesas/YOLOv5-M-ONNX
- Variante L en Hugging Face: https://huggingface.co/Renesas/YOLOv5-L-ONNX
- Modelo base: https://huggingface.co/Ultralytics/YOLOv5
- Configuracion de entrenamiento de OpenMMLab: https://github.com/open-mmlab/mmyolo/blob/main/configs/yolov5/metafile.yml
- Renesas Electronics (sitio corporativo): https://www.renesas.com/
- Renesas Electronics en Wikipedia: https://en.wikipedia.org/wiki/Renesas_Electronics
