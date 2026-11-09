# anan19990108/hae-s-ir-qcs8550-htp

## Resumen

HAE Small IR · QCS8550 HTP es una conversión de despliegue del detector de personas `alexshynkarenk0/hae-s-ir`, empaquetada por el usuario `anan19990108` para ejecutarse íntegramente en el acelerador HTP (Hexagon Tensor Processor) del SoC Qualcomm QCS8550. No es un modelo de lenguaje ni un detector RGB general: se trata de un detector de una sola clase (persona) sobre imágenes térmicas en escala de grises de 640x512 píxeles, pensado para visión embebida en el borde (edge AI). El repositorio distribuye tres artefactos ejecutables —ONNX (1,249 MB), TFLite (0,640 MB) y un contexto QNN nativo compilado para QCS8550 HTP v73 / QAIRT 2.47 (1,413 MB)— junto con scripts de inferencia y evaluación reproducibles.

El interés de esta ficha no reside en el modelo base en sí, sino en la cadena de conversión y validación: el autor demuestra que la red corre completamente en el HTP en las configuraciones probadas, con latencias de red de 3,4 a 11,1 ms según runtime y política de energía, y publica resultados de precisión sobre un subconjunto etiquetado del dataset HIT-UAV. Es, por tanto, un ejemplo práctico de despliegue de detección térmica en hardware móvil Qualcomm, con artefactos descargables y trazabilidad de pesos.

Conviene subrayar que se trata de una "validated research build": la precisión sobre el dataset completo, la latencia extremo a extremo en dispositivo, el consumo y la resistencia térmica no están validados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no está afiliado ni a Qualcomm ni al autor del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una clase; backbone derivado de HAE-S IR (no se detalla la topología interna en la información disponible) |
| Parametros totales | no disponible (el tamaño de los pesos empaquetados es de 0,640 MB en TFLite FP16 y 1,249 MB en ONNX FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de imagen) |
| Tipos de cuantizacion | ONNX FP32; TFLite con parámetros almacenados en FP16 e I/O FP32; contexto QNN compilado para HTP (no son modelos INT8) |
| Idiomas soportados | en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX, TFLite, QNN context binary (.bin para QCS8550 HTP v73 / QAIRT 2.47) |
| Tarea | Detección de objetos (persona) en imágenes térmicas en escala de grises |
| Resolución de entrada | 640x512 en escala de grises (uint8); tensor ONNX `[1, 1, 768, 960]` float32 NCHW; TFLite `[1, 768, 960, 1]` float32 NHWC |
| Tamaño de lote | Fijo a 1 |
| Modelo base | alexshynkarenk0/hae-s-ir |
| Dataset de evaluación | HIT-UAV (subconjunto de 100 de 579 frames, seed 20261106) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del detector más allá de que se trata de un detector de una sola clase sobre imágenes térmicas y de que deriva del checkpoint `alexshynkarenk0/hae-s-ir`. La cadena de conversión documentada incluye varios pasos técnicos concretos: congelado de las dimensiones de lote y espaciales, sustitución del `PixelUnshuffle` en escala de grises por un `SpaceToDepth` equivalente, y conversión de ONNX float32 a TFLite con almacenamiento float16 mediante `onnx2tf` 1.28.8. El contexto QNN se compila específicamente para HTP v73 con QAIRT 2.47 y no es un DLC portable.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset de entrenamiento, ni si hubo RLHF/DPO (no aplicable a un detector). El autor indica explícitamente que se trata de una conversión de despliegue independiente, no de un lanzamiento del upstream ni de Qualcomm, y que los pesos originales y las adaptaciones de despliegue son MIT, con procedencia fijada en `provenance.json` (checkpoint upstream y SHA-256).

## Capacidades

- Detección de personas en imágenes térmicas en escala de grises de 640x512 píxeles, una sola clase.
- Salida de cajas delimitadoras en formato xyxy sobre la imagen original, con puntuaciones de confianza e IDs de clase basados en cero desde `labels.json`.
- Postprocesado incluido: sigmoid sobre el mapa de logits de clase, máximos locales 3x3, top-300 estable, distancias softplus multiplicadas por stride 4 alrededor de los centros de celda, y reescalado por el factor de resize. Sin NMS global adicional.
- Ejecución en tres runtimes: ONNX en CPU (portátil), TFLite en CPU o con delegado QNN, y QNN nativo en HTP.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es exclusivamente un modelo de visión.
- Capacidad multilingüe: no aplica; el modelo no procesa texto.

## Casos de uso

- Vigilancia térmica nocturna en dispositivos móviles: el detector funciona sobre imágenes térmicas en escala de grises, lo que permite detectar personas en condiciones de baja visibilidad sin depender de iluminación visible, ejecutándose en el HTP del QCS8550 con latencias de red de 3,4 a 11,1 ms.
- Cámaras de seguridad embebidas con SoC Qualcomm: al compilarse como contexto QNN nativo para HTP v73, puede integrarse en firmware Android sobre QCS8550 sin depender de la CPU para la inferencia de la red.
- Búsqueda y rescate con drones térmicos: el formato de entrada 640x512 en escala de grises y el bajo coste computacional lo hacen adecuado para payloads ligeros que procesan fotogramas térmicos a bordo.
- Análisis de vídeo térmico en el borde: el pipeline de postprocesado en NumPy incluido permite procesar fotogramas secuenciales y generar detecciones JSON con coordenadas en la imagen original.
- Prototipado e investigación en edge AI: los tres artefactos (ONNX, TFLite, QNN) y los scripts `infer.py` y `evaluate.py` permiten reproducir la evaluación sobre el subconjunto HIT-UAV y comparar runtimes.
- Despliegue en sistemas de conteo de personas en interiores con cámaras térmicas: la detección de una sola clase simplifica la lógica de negocio y el postprocesado sin NMS global reduce la complejidad del pipeline.
- Validación de cadenas de conversión ONNX→TFLite→QNN: sirve como referencia reproducible para equipos que necesiten portar detectores a HTP con `onnx2tf` y QAIRT.

## Benchmarks y rendimiento

Precisión sobre el subconjunto de evaluación HIT-UAV (100 de 579 frames, muestreo uniforme sin reemplazo, seed 20261106; regiones ignore: crowd; maxDets=300). Es un subconjunto reproducible, no la puntuación completa del test:

| Runtime | AP@[.50:.95] | AP50 |
|---|---:|---:|
| onnx_cpu | 0,392035 | 0,767252 |
| onnx_qnn | 0,392663 | 0,766734 |
| qnn_native | 0,392663 | 0,766734 |
| tflite_qnn | 0,392695 | 0,766769 |

Latencia de red (solo red, en milisegundos; QCS8550/Kalama, Android, HTP v73; QNN/QAIRT 2.47, ORT 1.26, Sysclaw SDK 0.24.1; medida el 2026-11-06):

| Runtime / ajuste de energía | p50 ms | p95 ms |
|---|---:|---:|
| ORT QNN EP (burst) | 3,387 | 3,456 |
| TFLite QNN delegate | 3,558 | 3,615 |
| QNN native (energía por defecto) | 11,061 | 11,643 |

El autor advierte que las distintas políticas de energía impiden una comparación justa de velocidad entre runtimes; son ejecuciones cortas en placa conectada, con temperatura y frecuencia no controladas, y no hay medidas de latencia extremo a extremo, p99, arranque, memoria ni consumo/calor sostenido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo está orientado a NPU/HTP embebido, no a GPU de escritorio; los pesos empaquetados ocupan entre 0,640 MB y 1,413 MB).
- GPU recomendadas: no aplica; el objetivo es el HTP del Qualcomm QCS8550 (HTP v73) con QAIRT 2.47.
- ¿Cabe en GPU de consumo? No es el caso de uso; el ONNX FP32 puede ejecutarse en CPU para portabilidad, pero no se documentan requisitos de GPU.
- Opciones de despliegue: ONNX Runtime (CPU o con QNN Execution Provider), TFLite (CPU o con delegado QNN de Sysclaw, dependencia separada no incluida), y QNN nativo con `qnn-net-run` cargando el contexto descargado.
- Latencia y throughput: p50 de 3,387 ms (ORT QNN EP en burst), 3,558 ms (TFLite QNN delegate) y 11,061 ms (QNN nativo con energía por defecto), solo red.
- Requisitos de entorno: Python 3.11 en entorno virtual limpio; `requirements.txt`, `requirements-tflite.txt` y `requirements-evaluation.txt` según el caso. El delegado TFLite probado (Sysclaw) no está incluido y las instalaciones genéricas de TFLite no lo proporcionan.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros detectores térmicos comparables (parámetros, contexto, rendimiento, licencia) para establecer una comparativa rigurosa. El propio autor referencia el checkpoint upstream `alexshynkarenk0/hae-s-ir`, del que este repositorio es una conversión de despliegue, pero no se aportan métricas de esa versión original ni de alternativas.

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| hae-s-ir-qcs8550-htp (este) | no disponible | 640x512 gris | MIT | ONNX, TFLite, QNN |
| alexshynkarenk0/hae-s-ir (upstream) | no disponible | no disponible | no disponible | checkpoint base |
| Alternativas térmicas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un detector RGB general: solo detecta la clase persona sobre imágenes térmicas en escala de grises de 640x512; su uso fuera de ese dominio no está validado.
- Precisión validada solo sobre un subconjunto de 100 de 579 frames de HIT-UAV, no sobre el dataset completo; las puntuaciones no deben presentarse como el resultado oficial del test.
- El contexto QNN está compilado para QCS8550 HTP v73 / QAIRT 2.47 y no es un DLC portable; no funcionará en otro hardware o versión de QAIRT sin recompilación.
- El delegado TFLite probado (Sysclaw SDK 0.24.1) es una dependencia separada no incluida en el repositorio; las instalaciones genéricas de TFLite no lo proporcionan.
- No hay validación de latencia extremo a extremo en dispositivo, p99, arranque, memoria ni consumo/calor sostenido; las latencias publicadas son solo de red y en ejecuciones cortas con temperatura y frecuencia no controladas.
- Los tipos de interfaz FP32 no implican aritmética FP32 en el HTP; no son modelos INT8.
- El preprocesado y la decodificación de detecciones se ejecutan en CPU, no en el HTP.
- No se redistribuye el dataset HIT-UAV: hay que descargar las imágenes y anotaciones por separado siguiendo `evaluation_subset.json`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un detector, el riesgo relevante es de falsos positivos/negativos, no evaluado más allá del subconjunto citado.
- Licencia MIT para pesos originales y adaptaciones de despliegue, según `LICENSE`, `NOTICE` y `provenance.json`; verificar la procedencia del checkpoint upstream antes de uso comercial.
- Repositorio con 0 descargas y 0 likes; es una build de investigación independiente, no un lanzamiento oficial de Qualcomm ni del autor upstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/hae-s-ir-qcs8550-htp
- Modelo base (upstream): https://huggingface.co/alexshynkarenk0/hae-s-ir
- Artefactos en el repositorio: `model.onnx`, `model.tflite`, `model_qcs8550_qairt247.bin`
- Documentación y configuración en el repositorio: `ANDROID.md`, `config.json`, `labels.json`, `validation.json`, `evaluation_subset.json`, `provenance.json`, `LICENSE`, `NOTICE`
- Scripts: `infer.py`, `evaluate.py`; requisitos: `requirements.txt`, `requirements-tflite.txt`, `requirements-evaluation.txt`
- Paper, blog, repositorio de código o demo adicionales: no disponible en la información proporcionada
