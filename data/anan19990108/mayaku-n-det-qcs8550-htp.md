# anan19990108/mayaku-n-det-qcs8550-htp

## Resumen

Mayaku Nano Detection · QCS8550 HTP es un detector de objetos RGB derivado del checkpoint upstream `datamarkin/mayaku` (fechado el 3 de noviembre de 2026) y redistribuido por el usuario `anan19990108` como un paquete de despliegue listo para el acelerador HTP del Qualcomm QCS8550. No es un modelo de lenguaje ni un transformer generativo: es una red de deteccion de objetos con cabeza de tipo YOLO (seis salidas crudas que alternan logits de clase y logits DFL) sobre una entrada estatica de 640x640, con 365 etiquetas del dataset Objects365. El paquete incluye tres artefactos descargables (ONNX, TFLite y un contexto QNN nativo compilado) y scripts de inferencia y evaluacion.

La relevancia de esta publicacion es de ingenieria de despliegue en el borde (edge AI), no de investigacion de modelos fundacionales. El autor documenta de forma inusualmente explicita las rutas de ejecucion sobre HTP v73 con QAIRT 2.47, las latencias de red (no de extremo a extremo) y las metricas de precision sobre un subconjunto diagnostico de COCO val2017. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano declarado de 0.0 GB, aunque el artefacto mayor (ONNX) pesa 21,105 MB.

Conviene subrayar que el propio autor califica el build como "validated research build": la red corre integramente en HTP en las configuraciones probadas, pero el preprocesado y la decodificacion corren en CPU, y no se han validado la precision sobre el dataset completo, la latencia de extremo a extremo en dispositivo, el consumo ni la resistencia termica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos tipo YOLO con seis cabezas crudas (clase + DFL) a strides 8/16/32; backbone no especificado en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada estatica 640x640) |
| Tipos de cuantizacion | ONNX en FP32; TFLite con parametros almacenados en FP16 e I/O FP32; contexto QNN compilado para HTP v73 (no son modelos INT8) |
| Idiomas soportados | en (etiquetas en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (21,105 MB), TFLite (10,593 MB), QNN context bin para QCS8550 (11,842 MB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del backbone ni el proceso de entrenamiento (numero de tokens o imagenes, composicion del dataset, uso de RLHF/DPO u otras tecnicas). Lo que si se detalla es la interfaz de la red: entrada ONNX `[1, 3, 640, 640]` float32 NCHW, entrada TFLite `[1, 640, 640, 3]` float32 NHWC, batch fijo a uno, y seis cabezas crudas que alternan logits de clase (365 canales) y logits DFL (4x16 canales) en strides 8, 16 y 32. La decodificacion aplica softmax DFL sobre bins 0..15, offset de centro de celda de 0.5, NMS class-aware con IoU 0.7 y un maximo de 300 detecciones.

El pipeline de exportacion documentado es: exportar las seis cabezas crudas a 640x640, simplificar el ONNX, convertir a TFLite con almacenamiento float16 mediante onnx2tf 1.28.8 y compilar el contexto QNN 2.47 para QCS8550. El contexto QNN esta compilado especificamente para HTP v73 / QAIRT 2.47 y no es un DLC portable; los tipos de interfaz FP32 no implican aritmetica FP32 en el HTP. El postprocesador NumPy empaquetado se valida de forma independiente contra las salidas capturadas de referencia.

## Capacidades

- Deteccion de objetos RGB con 365 clases del dataset Objects365, sobre imagenes de entrada estaticas de 640x640.
- Salida de coordenadas xyxy en la imagen original, puntuaciones de confianza e IDs de clase basados en cero (fichero `labels.json`).
- Deteccion multi-etiqueta por celda con umbral de confianza configurable (por defecto 0.25; 0.001 para reproduccion de AP).
- Ejecucion del grafo neuronal integramente en el HTP del QCS8550 en las configuraciones probadas (preprocesado y decodificacion en CPU).
- Tres rutas de ejecucion: ONNX en CPU, ONNX con QNN EP, TFLite con delegado QNN y QNN nativo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; es exclusivamente un detector visual.

## Casos de uso

- Vision por computador en dispositivos moviles y de borde: el contexto QNN compilado permite ejecutar la red completa en el HTP del QCS8550 con latencias de red del orden de 4-19 ms, adecuado para aplicaciones Android embebidas que requieran deteccion en tiempo real sin depender de la nube.
- Deteccion de objetos en camaras de vigilancia o domotica: con entrada estatica 640x640 y 365 clases de Objects365, el modelo cubre categorias cotidianas (personas, vehiculos, utensilios) y puede integrarse en pipelines de video locales.
- Prototipado de sistemas de vision en Qualcomm: sirve como referencia reproducible para validar el delegado QNN, el compilador QAIRT 2.47 y las rutas de ejecucion HTP antes de portar modelos propios.
- Automatizacion industrial ligera: deteccion de componentes o productos en lineas de montaje donde el hardware objetivo sea un SoC QCS8550 y se requiera inferencia local de baja latencia.
- Robotica y drones con restricciones de consumo: al ejecutarse en HTP, libera la CPU para otras tareas y reduce el consumo energetico frente a inferencia en CPU, aunque el autor advierte que no ha validado consumo ni resistencia termica.
- Evaluacion comparativa de runtimes de borde: el paquete incluye scripts (`evaluate.py`, `infer.py`) y artefactos de validacion que permiten reproducir las metricas AP sobre el subconjunto diagnostico de COCO val2017 y comparar ONNX CPU, ONNX QNN, TFLite QNN y QNN nativo.

## Benchmarks y rendimiento

Precision sobre el subconjunto diagnostico de COCO val2017 (primeros 100 IDs de imagen ascendentes, solo 69 clases con nombre identico solapadas con Objects365; no es AP de 80 clases de COCO ni AP de Objects365; maxDets=100, el decodificador conserva hasta 300 antes de evaluar):

| Runtime | AP@[.50:.95] | AP50 |
|---|---:|---:|
| onnx_cpu | 0.367584 | 0.502836 |
| onnx_qnn | 0.366817 | 0.501947 |
| qnn_native | 0.366817 | 0.501947 |
| tflite_qnn | 0.367243 | 0.502783 |

Latencia de red (solo red, no extremo a extremo) en QCS8550/Kalama, Android, HTP v73, QNN/QAIRT 2.47, ORT 1.26, Sysclaw SDK 0.24.1, medida el 2026-11-06:

| Runtime / ajuste de energia | p50 ms | p95 ms |
|---|---:|---:|
| ORT QNN EP (burst) | 5.978 | 6.079 |
| TFLite QNN delegate | 4.296 | 4.501 |
| QNN native (energia por defecto) | 18.807 | 19.446 |

Advertencias del autor: EP/TFLite usan 10 calentamientos y 100 ejecuciones cronometradas; nativo usa 100 eventos de ejecucion con imagenes reales, descartando los 10 primeros. Las distintas politicas de energia impiden un ranking justo de velocidad entre runtimes. No hay mediciones de extremo a extremo en dispositivo, p99, arranque, memoria ni consumo/termica sostenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecucion en el acelerador HTP de un SoC movil, no para GPU de escritorio.
- GPU recomendadas: no aplica; el hardware objetivo es el Qualcomm QCS8550 con HTP v73 y QAIRT 2.47.
- Cabe en GPU consumer: no disponible; el despliegue documentado es en el SoC QCS8550 (placa conectada), no en GPU consumer.
- Opciones de despliegue: ONNX Runtime en CPU (por defecto, portable); ONNX Runtime con QNN Execution Provider; TFLite con delegado QNN (requiere el delegado Sysclaw, dependencia separada no incluida); QNN nativo con `qnn-net-run` cargando el contexto descargado.
- Latencia y throughput: latencias de red p50/p95 entre 4.3 y 19.4 ms segun runtime y politica de energia (ver tabla); no se han publicado cifras de throughput, memoria ni latencia de extremo a extremo.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la informacion disponible. El autor solo compara las cuatro rutas de ejecucion del mismo modelo (ONNX CPU, ONNX QNN, TFLite QNN y QNN nativo), no con detectores alternativos como YOLOv8, YOLOv11 o RT-DETR, ni con otras conversiones para QCS8550.

## Limitaciones y advertencias

- Build de investigacion validado: la red corre en HTP en las configuraciones probadas, pero no se han validado la precision sobre el dataset completo, la latencia de extremo a extremo en dispositivo, el consumo ni la resistencia termica.
- Las metricas de precision corresponden a un subconjunto diagnostico (100 imagenes, 69 clases solapadas) y no deben interpretarse como AP oficial de COCO (80 clases) ni de Objects365.
- El contexto QNN esta compilado especificamente para QCS8550 HTP v73 / QAIRT 2.47; no es un DLC portable y no funcionara en otro hardware o version de QAIRT.
- El delegado TFLite QNN probado es Sysclaw, una dependencia separada; las instalaciones genericas de TFLite no lo proporcionan. No se incluyen binarios del SDK del fabricante.
- No son modelos INT8: ONNX es FP32 y TFLite almacena parametros en FP16 con I/O FP32; los tipos de interfaz FP32 no implican aritmetica FP32 en el HTP.
- Batch fijo a uno y entrada estatica 640x640; no admite resoluciones o lotes variables sin recompilar.
- Solo etiquetas en ingles (365 clases de Objects365); no soporta otros idiomas ni tareas generativas.
- Riesgo de sesgos y alucinacion: no documentado en la informacion disponible; como detector entrenado sobre Objects365, hereda los sesgos de ese dataset.
- Licencia Apache-2.0 para pesos originales y adaptaciones de despliegue; el autor remite a `NOTICE` y `provenance.json` para la cadena de licencias del checkpoint upstream. No es una publicacion oficial de upstream ni de Qualcomm.
- Repositorio con 0 descargas y 0 likes; sin comunidad ni soporte documentado.
- Las pequenas diferencias en empates o aritmetica de coma flotante no deben presentarse como mejoras del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/mayaku-n-det-qcs8550-htp
- Checkpoint upstream: `datamarkin/mayaku` (checkpoint 2026-11-03), referenciado en `provenance.json` del repositorio
- Instrucciones Android y prerrequisitos de runtime: `ANDROID.md` en el repositorio
- Configuracion de entradas/salidas y permutaciones TFLite: `config.json` en el repositorio
- Etiquetas de clase: `labels.json` en el repositorio
- Resultados de validacion del decodificador NumPy: `validation.json` en el repositorio
- Seleccion del subconjunto de evaluacion: `evaluation_subset.json` en el repositorio
- Licencia y avisos: `LICENSE` y `NOTICE` en el repositorio
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
