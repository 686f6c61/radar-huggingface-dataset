# anan19990108/mayaku-m-det-htp

## Resumen
Mayaku Medium Detection (mayaku-m-det-htp) es un modelo de deteccion de objetos publicado por el usuario anan19990108 en Hugging Face, derivado del checkpoint original `mayaku-m-det.pth` del zoo de modelos Datamarkin Mayaku. El modelo detecta 365 categorias del conjunto Objects365 a partir de entradas RGB de 640 × 640 pixeles. El repositorio no distribuye los pesos en formato de entrenamiento, sino artefactos compilados y cuantizados para despliegue en entornos edge: ONNX FP32, TFLite de referencia, un contexto QNN para el HTP del SoC Qualcomm QCS8550 y una variante TFLite INT8 con cuantizacion W8A8.

La relevancia del paquete es practica: ofrece una ruta de despliegue acelerado por NPU (Hexagon Tensor Processor) en Android y Linux aarch64, con artefactos listos para QAIRT 2.47 y el delegado QNN de TFLite. El modelo mantiene una precision casi identica a la version en coma flotante tras la cuantizacion completa a INT8 (AP 0.4517 frente a 0.4498 sobre un subconjunto de 100 imagenes), con una reduccion de latencia de aproximadamente 2,7 veces en la invocacion del HTP.

El tamano del repositorio es de 0,4 GB y la licencia es Apache-2.0. No se especifican idiomas soportados ni se documenta la arquitectura interna del detector en la informacion disponible.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; backbone y cabeza no documentados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640 × 640 RGB) |
| Tipos de cuantizacion | FP32 (ONNX y TFLite de referencia), W8A8 INT8 (TFLite) |
| Idiomas soportados | no disponible (no aplica a deteccion de objetos) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32), TFLite (referencia FP32 e INT8 W8A8), QNN context binary (context_qnn.bin) |
| Categorias de salida | 365 clases de Objects365 |
| Resolucion de entrada | 640 × 640 RGB |
| Preprocesado y NMS | en host (no integrados en el grafo) |
| Tamano de artefactos | ONNX 130,35 MB; TFLite FP32 130,33 MB; QNN context 66,84 MB; TFLite INT8 33,68 MB |
| Hardware objetivo | Qualcomm QCS8550, HTP v73; QAIRT 2.47.0.260601; TFLite C 2.11.1 con delegado QNN |

## Arquitectura y entrenamiento
No se documenta en la informacion disponible la arquitectura interna del detector (familia, backbone, mecanismo de asignacion de etiquetas ni funcion de perdida). El modelo se distribuye exclusivamente como artefactos de inferencia compilados y cuantizados, no como pesos entrenables en safetensors ni como codigo de entrenamiento. El checkpoint de origen es `mayaku-m-det.pth`, procedente del zoo de modelos Datamarkin Mayaku, revision `2026-11-04`, con licencia Apache-2.0 y checksum SHA-256 archivado en `evaluation/results.json`.

La innovacion tecnica destacable del paquete es la cadena de despliegue: un grafo TFLite cuantizado W8A8 (pesos y activaciones a 8 bits) con entradas y salidas en FP32, ejecutable sobre el delegado QNN en el HTP del QCS8550, mas un binario de contexto QNN precompilado para Android. El preprocesado de imagen y la supresion no maxima (NMS) se ejecutan en el host, fuera del grafo acelerado. No se especifican el volumen de datos de entrenamiento, la composicion del dataset mas alla de las 365 clases de Objects365, ni si hubo etapas de ajuste fino o destilacion.

## Capacidades
- Deteccion de objetos en imagenes RGB de 640 × 640 con 365 categorias de Objects365.
- Salida de cajas delimitadoras, puntuaciones de confianza y identificadores de clase (el ejemplo ONNX escribe `detections.json` con boxes, scores y class IDs).
- Inferencia en CPU via ONNX Runtime (artefacto FP32).
- Inferencia acelerada en NPU Qualcomm Hexagon (HTP v73) via delegado QNN de TFLite, tanto en Android como en Linux aarch64.
- Cuantizacion completa W8A8 con precision practicamente identica al baseline en coma flotante.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente visual de deteccion.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision-language, audio).

## Casos de uso
- Vision por computador en dispositivos Android de gama alta con SoC Qualcomm: el binario de contexto QNN (66,84 MB) permite ejecutar el detector en el HTP del QCS8550 sin recompilar, adecuado para apps de camara o galeria que necesiten etiquetado en dispositivo.
- Sistemas embebidos Linux aarch64 con acelerador Qualcomm: la variante TFLite INT8 (33,68 MB) con delegado QNN encaja en dispositivos con memoria limitada y requisitos de baja latencia (invoke p50 de 5,063 ms en el HTP).
- Moderacion de contenido visual: las 365 clases de Objects365 cubren una taxonomia amplia de objetos cotidianos, util para filtrar o clasificar imagenes en pipelines de ingestion.
- Analitica de retail y logistica: deteccion de productos, vehiculos y personas en imagenes fijas o fotogramas, con postprocesado NMS en host para ajustar umbrales por caso de uso.
- Prototipado rapido con ONNX Runtime en CPU: el artefacto FP32 (130,35 MB) permite validar el modelo en estaciones de trabajo sin hardware Qualcomm antes de pasar a despliegue edge.
- Automatizacion de anotacion de datasets: el detector puede pre-etiquetar imagenes con las 365 clases de Objects365 para revision humana posterior, reduciendo el coste de curation.
- Investigacion en cuantizacion y despliegue NPU: el paquete incluye resultados comparativos FP32 frente a INT8 y scripts de evaluacion, util como referencia reproducible de pipelines QAIRT/TFLite.

## Benchmarks y rendimiento
Resultados publicados por el autor sobre el mismo subconjunto de 100 imagenes de COCO val2017, restringido a las 69 clases compartidas con Objects365, con 10 calentamientos y medicion de `Invoke` en el HTP de Linux:

| Configuracion | AP | AP50 | AP75 | Invoke p50 (ms) | Invoke p95 (ms) |
|---|---|---|---|---|---|
| Baseline en coma flotante | 0,4498 | 0,6172 | 0,4804 | 13,494 | 13,834 |
| INT8 completo (W8A8) | 0,4517 | 0,6176 | 0,4827 | 5,063 | 5,136 |

La cuantizacion INT8 no degrada la precision en este subconjunto (incluso mejora ligeramente en AP y AP75) y reduce la latencia de invocacion p50 en un factor de aproximadamente 2,7. No se han publicado resultados sobre el conjunto completo de COCO ni sobre las 365 clases de Objects365 en la informacion disponible.

## Requisitos de hardware
- VRAM: no disponible; el modelo esta orientado a inferencia en CPU y NPU, no a GPU de escritorio.
- Artefacto mas ligero: TFLite INT8 de 33,68 MB, adecuado para dispositivos con memoria muy limitada.
- Artefacto de referencia: ONNX/TFLite FP32 de aproximadamente 130 MB, ejecutable en CPU con ONNX Runtime.
- Aceleracion NPU: Qualcomm QCS8550 con HTP v73; requiere QAIRT 2.47.0.260601 y TFLite C 2.11.1 con delegado QNN.
- GPU recomendadas: no disponibles; no se documenta soporte CUDA ni TensorRT.
- Cabe en GPU consumer: no disponible; el paquete no incluye artefactos para GPU de consumo.
- Opciones de despliegue: ONNX Runtime (CPU), TFLite con delegado QNN (Android y Linux aarch64), binario de contexto QNN precompilado.
- Latencia medida: invoke p50 de 5,063 ms y p95 de 5,136 ms en HTP con INT8; 13,494/13,834 ms en el baseline flotante.
- Throughput: no disponible (solo se publica latencia de invocacion).

## Comparativa con modelos similares
No se dispone de datos de comparacion con otros detectores en la informacion proporcionada. La model card solo compara el propio modelo consigo mismo (FP32 frente a INT8). Como referencia cualitativa, el modelo compite en la categoria de detectores de Objects365 desplegables en edge, pero no se aportan parametros, contexto ni resultados de terceros para establecer una comparativa numerica fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mayaku Medium Detection | no disponible | no aplica (640 × 640) | AP 0,4517 (INT8, subconjunto 100 imgs) | Apache-2.0 | Hugging Face (artefactos ONNX/TFLite/QNN) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No se documentan sesgos del modelo; al entrenarse sobre Objects365, la taxonomia y el rendimiento pueden estar sesgados hacia las categorias y distribuciones de ese dataset.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si hay riesgo de falsos positivos y detecciones espurias, especialmente con umbrales de confianza bajos; el NMS se ejecuta en host y debe calibrarse.
- Los resultados publicados se limitan a 100 imagenes de COCO val2017 y a las 69 clases compartidas con Objects365; no hay evidencia sobre el conjunto completo ni sobre las 365 clases.
- El soporte NPU esta atado a hardware y versiones concretas (QCS8550, HTP v73, QAIRT 2.47.0.260601, TFLite C 2.11.1); otras plataformas o versiones pueden no funcionar sin recompilar.
- El checkpoint original (`mayaku-m-det.pth`) no estaba disponible para descarga directa en el momento de la verificacion segun la model card; la reproducibilidad depende del manifiesto y checksum archivados.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las licencias de terceros recogidas en `THIRD_PARTY_LICENSES.txt` y el aviso en `NOTICE`.
- No se documentan idiomas ni capacidades multimodales; el modelo no es adecuado para tareas de generacion, razonamiento o comprension de lenguaje.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/anan19990108/mayaku-m-det-htp
- Repositorio de origen Datamarkin Mayaku: https://github.com/emrahnazif/mayaku#models
- Resultados completos de evaluacion: https://huggingface.co/anan19990108/mayaku-m-det-htp/blob/e3d1eb542b50306b5160c9aeae7f478f506276f5/evaluation/results.json
- README detallado del autor: https://huggingface.co/anan19990108/mayaku-m-det-htp/blob/e3d1eb542b50306b5160c9aeae7f478f506276f5/README.md
- Ejemplo Linux TFLite INT8: https://huggingface.co/anan19990108/mayaku-m-det-htp/blob/e3d1eb542b50306b5160c9aeae7f478f506276f5/examples/LINUX_INT8.md
- Ejemplos Android flotantes: https://huggingface.co/anan19990108/mayaku-m-det-htp/blob/e3d1eb542b50306b5160c9aeae7f478f506276f5/examples/ANDROID.md
