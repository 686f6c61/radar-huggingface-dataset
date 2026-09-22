# Renesas/YOLOv5-L-ONNX

## Resumen

YOLOv5-L-ONNX es un artefacto de modelo publicado por Renesas Electronics que contiene la red YOLOv5-L (versión v6.1, receta de entrenamiento "fast" con SyncBN) exportada a ONNX en FP32, empaquetada específicamente para su despliegue sobre la plataforma Renesas R-Car X5H y su NPU NPX6. No se trata de un modelo entrenado por Renesas, sino de una conversión y validación de un checkpoint procedente del ecosistema YOLOv5 (configuración OpenMMLab `yolov5_l_v61_syncbn_fast_8xb16_300e_coco`, basada en Ultralytics/YOLOv5) orientada a inferencia embebida.

El modelo resuelve detección de objetos sobre imágenes, con 46,5 millones de parámetros y una entrada típica de 640 × 640 píxeles, y su interés práctico está en el flujo de despliegue: el ONNX en FP32 se auto-convierte a INT8 en tiempo de compilación mediante la cadena de herramientas MWMX de Renesas, sin necesidad de un paso de cuantización manual. Esto reduce la fricción para integrar detección de objetos en hardware automotriz e industrial.

La relevancia actual es acotada pero concreta: es uno de los artefactos de referencia que Renesas publica para demostrar el rendimiento de su NPX6 en tareas de visión (4,722 ms por inferencia con 12 núcleos de NPU a 850 MHz, medidos en silicio real). No hay datos publicados de precisión (mAP) para este repositorio concreto, y el modelo carece de capacidades de lenguaje, por lo que su evaluación debe hacerse en términos de latencia, integración y fidelidad numérica, no de benchmarks de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv5-L v6.1 (red convolucional de deteccion de objetos de una etapa), receta SyncBN "fast" |
| Parametros totales | 46,5 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen de 3 × 640 × 640, valor inferido) |
| Tipos de cuantizacion | FP32 en el artefacto publicado; INT8 por auto-cast de la cadena MWMX en tiempo de compilacion |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | Apache 2.0 (segun la model card del repositorio) |
| Formato de pesos | ONNX (FP32); unico artefacto: `fp32/yolov5_l-v61_syncbn_fast_8xb16-300e_coco.onnx` |
| Tarea | Deteccion de objetos (pipeline `object-detection`) |
| Dataset de entrenamiento | COCO (inferido a partir del nombre del checkpoint) |
| Modelo base | Ultralytics/YOLOv5 (config OpenMMLab mmyolo) |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 22 de septiembre de 2026 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLOv5-L en su revision v6.1, un detector de objetos de una sola etapa basado en convoluciones, con backbone tipo CSP y cuello de agregacion de caracteristicas multicapa, seguido de cabezas de prediccion densas. La variante utilizada incorpora SyncBN (normalizacion por lotes sincronizada), lo que indica entrenamiento distribuido en varias GPU. El nombre del checkpoint, `yolov5_l_v61_syncbn_fast_8xb16_300e_coco`, sugiere un regimen de 300 epocas con 8 GPU y tamano de lote 16 por GPU, receta "fast" de OpenMMLab mmyolo sobre el dataset COCO; estos detalles se deducen del identificador del archivo y la propia model card los marca como inferidos cuando no estan confirmados.

La innovacion tecnica relevante no esta en la red, que es un YOLOv5 estandar, sino en el flujo de despliegue: el ONNX se entrega en FP32 y la cadena de herramientas MWMX de Renesas realiza el auto-cast a INT8 en tiempo de compilacion, de modo que no se publica un fichero INT8 separado. La ejecucion tiene lugar sobre la NPU NPX6-48K integrada en el SoC R-Car X5H. No se documenta en la informacion disponible si hubo ajuste fino posterior, RLHF/DPO (no aplicable a vision) ni tecnicas de aumento de datos especificas.

## Capacidades

- Deteccion de objetos sobre imagenes: el modelo produce cajas delimitadoras y clases sobre entradas de imagen (resolucion de 640 × 640 inferida).
- Deteccion de las clases del dataset COCO: al haberse entrenado sobre COCO, cubre las categorias de ese conjunto (80 clases), aunque la model card no enumera las clases soportadas.
- Inferencia en hardware embebido: ejecucion nativa sobre la NPU NPX6 del SoC Renesas R-Car X5H mediante el runtime MWMX.
- Precision de ejecucion INT8: la conversion desde FP32 es automatica en la compilacion, sin recalibracion manual documentada.
- Integracion en pipelines HIL: el modelo se ha validado en una pipeline de CI con hardware real (metawaremx_runtime, objetivo "APM80").
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, uso como agente, capacidades multilingues ni modos de razonamiento: es exclusivamente un detector de objetos.
- No se documentan capacidades de segmentacion, vision-lenguaje, audio ni multimodales mas alla de la deteccion de cajas.

## Casos de uso

- Percepcion para ADAS y conduccion automatizada: el modelo detecta vehiculos, peatones y senales sobre imagenes de camara a 640 × 640 con una latencia de 4,722 ms por fotograma en la NPU NPX6, lo que permite integrarlo en lazos de percepcion dentro de un SoC automotriz R-Car X5H.
- Inspeccion industrial en linea de produccion: deteccion de defectos o piezas en cintas transportadoras, aprovechando la inferencia INT8 de baja latencia para cubrir cadencias de fabricacion elevadas sin depender de GPU dedicada.
- Camaras inteligentes y videovigilancia en el borde: conteo y localizacion de personas u objetos en tiempo real dentro de la propia camara, evitando enviar video a la nube y reduciendo coste de ancho de banda y requisitos de privacidad.
- Robotica movil y AGV: deteccion de obstaculos y personas en el entorno de navegacion, con ejecucion local sobre el SoC para mantener los lazos de control desacoplados de la conectividad.
- Analitica de trafico y movilidad urbana: conteo de vehiculos y clasificacion por categorias COCO en postes de aforo, con el modelo desplegado en el propio dispositivo y agregacion posterior de metricas.
- Analitica de retail: deteccion de productos o personas en estanterias y zonas de tienda, integrada en el SoC de un equipo de vision embebido, con INT8 para reducir consumo energetico en despliegues continuos.
- Drones y plataformas UAV: deteccion de objetos a bordo con presupuesto termico y energetico restringido, donde la ejecucion sobre NPU en lugar de GPU es un requisito practico.
- Evaluacion y prototipado de la plataforma X5H: uso del artefacto como referencia reproducible para medir prestaciones de la NPU NPX6 en tareas de deteccion antes de comprometerse con un diseno de producto.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son de latencia en hardware Renesas; no hay resultados de precision (mAP) para este repositorio.

| Runtime | Precision | Dispositivo | Lote | Latencia (ms) | Tipo |
|---|---|---|---|---|---|
| MWMX Runtime | INT8 (auto-cast) | R-Car X5H, 1 × NPU, 12 nucleos, 850 MHz | 1 | 4,722 | Medido (HIL) |

| Metrica de precision | Valor |
|---|---|
| mAP / mAP50 / mAP75 | No disponible (marcado como TBD en la model card) |
| Precision en 1 nucleo de NPU | No disponible (la compilacion con 1 nucleo falla en la pipeline de CI, reconfirmado en la ejecucion del 16 de septiembre de 2026) |

Metodologia declarada: ejecuciones hardware-in-the-loop sobre silicio R-Car X5H real, mediante el runtime MWMX, con entrada ONNX en FP32 y ejecucion en INT8 auto-convertida, tamano de lote 1 y entrada de 3 × 640 × 640 (inferida).

## Requisitos de hardware

- Ejecucion oficial: Renesas R-Car X5H con NPU NPX6 (NPX6-48K) y runtime Renesas MWMX. Es el unico entorno validado y con latencia publicada.
- Configuracion de NPU medida: 1 NPU con 12 nucleos de IA a 850 MHz. El resultado con una sola particion de 1 nucleo no esta disponible porque la compilacion falla.
- VRAM estimada: no aplica al despliegue de referencia (no se ejecuta sobre GPU). El repositorio ocupa 0,2 GB y el peso FP32 de 46,5 M de parametros ronda los 0,19 GB, coherente con el tamano del repo.
- GPU recomendadas: no disponibles; la model card no documenta ningun objetivo de ejecucion sobre GPU, CUDA, A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no documentada. El ONNX en FP32 podria ejecutarse teoricamente en CPU o GPU mediante un runtime ONNX generico, pero ese uso no esta validado por el autor y no debe asumirse como soportado.
- Opciones de despliegue: runtime Renesas MWMX (unica ruta soportada y medida). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT.
- Latencia: 4,722 ms por inferencia con lote 1 en la configuracion de 12 nucleos. No se publica throughput agregado ni consumo energetico.
- Prerrequisitos declarados: placa Renesas R-Car X5H con NPU NPX6, runtime Renesas MWMX y la CLI de Hugging Face para descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/YOLOv5-L-ONNX (este modelo) | 46,5 M | Imagen 3 × 640 × 640 | 4,722 ms por inferencia en NPU NPX6 (12 nucleos); mAP no disponible | Apache 2.0 declarada | Hugging Face, artefacto ONNX FP32 |
| Ultralytics/YOLOv5 (modelo base) | No disponible en la informacion proporcionada | Entrada configurable; 640 px habitual | No disponible | No disponible en la informacion proporcionada | Repositorio Hugging Face del autor original |
| Configuracion OpenMMLab `yolov5_l_v61_syncbn_fast_8xb16_300e_coco` | No disponible en la informacion proporcionada | Entrada COCO estandar | No disponible | No disponible en la informacion proporcionada | Repositorio GitHub open-mmlab/mmyolo |
| Otros detectores de una etapa (YOLOv8, RT-DETR, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de mAP ni de latencia de alternativas en esta informacion, por lo que la comparacion cuantitativa queda limitada al dato de latencia propio y a la identificacion del linaje del modelo.

## Limitaciones y advertencias

- Precision no publicada: la model card marca la precision como "TBD". No hay mAP ni curvas de precision-recall para este artefacto, por lo que no puede afirmarse su calidad de deteccion sin una evaluacion propia.
- Dependencia de hardware propietario: el flujo validado requiere una placa R-Car X5H con NPU NPX6 y el runtime MWMX. Sin ese hardware, el modelo no tiene un camino de despliegue soportado.
- Compilacion incompleta en configuraciones pequenas: la variante de 1 nucleo de NPU falla al compilar, reconfirmado en la ejecucion de benchmark del 16 de septiembre de 2026. Las prestaciones solo estan caracterizadas para 12 nucleos.
- Dato de entrada inferido: la resolucion de 640 × 640 y el uso del dataset COCO estan inferidos del nombre del checkpoint, no confirmados explicitamente por el autor.
- Sin soporte de lenguaje: no hay generacion de texto, tool calling, agentes, capacidades multilingues ni modos de razonamiento. Cualquier expectativa de ese tipo es inaplicable.
- Riesgo de sesgo del dataset: al entrenarse sobre COCO (inferido), hereda los sesgos de ese conjunto en cuanto a clases, contextos, geografias y condiciones de iluminacion infrarrepresentadas, con menor robustez esperable en dominios alejados de sus imagenes.
- Riesgo de alucinacion en el sentido de falsos positivos y cajas mal localizadas: como todo detector denso, puede producir detecciones espurias en escenas ambiguas u objetos parcialmente ocluidos; la magnitud no esta cuantificada.
- Cuantizacion INT8 automatica sin recalibracion documentada: la conversion a INT8 la realiza la herramienta de compilacion y no se publica informacion sobre el conjunto de calibracion ni sobre la degradacion de precision asociada.
- Licencia a verificar: la model card declara Apache 2.0, pero el modelo base Ultralytics/YOLOv5 se distribuye habitualmente bajo AGPL-3.0. Antes de un uso comercial conviene confirmar la compatibilidad de licencias con el autor y con Ultralytics, ya que la informacion proporcionada no resuelve esa cuestion.
- Metadatos incompletos: no se declaran idiomas, ni numero de clases detalladas, ni datos de entrenamiento mas alla del nombre del checkpoint. El repositorio no registra descargas ni "me gusta", lo que sugiere una validacion externa muy limitada.
- Sin garantias de produccion: al ser un artefacto de referencia para una plataforma concreta y sin datos de precision, cualquier despliegue en produccion deberia acompanarse de validacion propia en el hardware y las condiciones objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Renesas/YOLOv5-L-ONNX
- Modelo base en Hugging Face: https://huggingface.co/Ultralytics/YOLOv5
- Configuracion de referencia en OpenMMLab mmyolo: https://github.com/open-mmlab/mmyolo/blob/main/configs/yolov5/metafile.yml
- Sitio corporativo de Renesas: https://www.renesas.com/
- Catalogo de productos de Renesas: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia (EN): https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (DE): https://de.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (FR): https://fr.wikipedia.org/wiki/Renesas_Electronics
