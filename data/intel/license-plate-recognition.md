# Intel/license-plate-recognition

## Resumen

License Plate Recognition (LPR) es un caso de uso de analitica para metro publicado por Intel en Hugging Face bajo el identificador `Intel/license-plate-recognition`. No se trata de un unico modelo neuronal, sino de un pipeline compuesto por dos modelos especializados: un detector YOLOv8 afinado para localizar matricula como cajas orientadas y un reconocedor de texto PaddleOCR PP-OCRv4 (`ch_PP-OCRv4_rec_infer`) que convierte cada region recortada en una cadena alfanumerica. Ambos se distribuyen como IR de OpenVINO en precision FP32.

El repositorio resuelve un problema concreto de vision por computador en entornos de transporte: localizar matriculas de vehiculos en un flujo de video y leer su contenido, exponiendo el resultado como metadatos de inferencia (`GstAnalytics.ClsMtd`) sobre el fotograma. La integracion se realiza mediante Intel DLStreamer sobre GStreamer, con los elementos `gvadetect` y `gvaclassify`, y esta pensada para desplegarse en CPU, GPU y NPU de Intel en el borde.

Su relevancia actual radica en que ejemplifica el patron de despliegue de IA en el borde de Intel: modelos preconvertidos a OpenVINO, integrados en una pipeline de video en tiempo real con DLStreamer y orientados a casos de peaje, control de accesos, busqueda forense de vehiculos y monitorizacion de flotas. El repositorio tiene un tamano declarado de 0.0 GB y una licencia MIT permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector YOLOv8 (deteccion de objetos con cajas orientadas) + reconocedor PaddleOCR PP-OCRv4 (modelo de secuencia CTC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a vision/OCR) |
| Tipos de cuantizacion | FP32 unicamente (el script de exportacion no realiza cuantizacion) |
| Idiomas soportados | en (etiqueta declarada); el reconocedor PP-OCRv4 es multilingue segun PaddleOCR, pero el pipeline se documenta en ingles |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`); los modelos originales son PyTorch/Ultralytics YOLOv8 y PaddlePaddle PP-OCRv4 |

## Arquitectura y entrenamiento

El componente de deteccion es `yolov8_license_plate_detector`, un YOLOv8 (probablemente la variante `yolov8n` segun la ruta `models/yolov8n/yolov8n_retrained.xml`) reentrenado para localizar matriculas como cajas orientadas. El componente de reconocimiento es `ch_PP-OCRv4_rec_infer`, el reconocedor de texto multilingue de PaddleOCR PP-OCRv4, un modelo de secuencia CTC que transforma la region recortada de la matricula en una cadena de texto. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelos).

La innovacion tecnica destacable es la integracion en DLStreamer 2026.x: el elemento `gvaclassify` ejecuta el reconocedor OCR sobre cada region detectada por `gvadetect`, y DLStreamer 2026.0+ deriva automaticamente el decodificador CTC para el IR `ch_PP-OCRv4_rec_infer`, exponiendo la cadena decodificada como una entrada `GstAnalytics.ClsMtd` con relacion `CONTAIN` respecto a la deteccion, sin necesidad de un `model-proc` externo para este caso. Para variantes de PaddleOCR o alfabetos no latinos es necesario aportar un `model-proc` personalizado con el diccionario de caracteres correspondiente. El detector se entreno principalmente con matriculas europeas y estadounidenses, por lo que la precision depende de la distribucion regional de los datos.

## Capacidades

- Deteccion de matriculas de vehiculos en flujos de video mediante cajas orientadas (YOLOv8).
- Reconocimiento optico de caracteres (OCR) sobre cada region de matricula detectada (PaddleOCR PP-OCRv4).
- Exposicion del texto reconocido como metadatos de inferencia (`GstAnalytics.ClsMtd`) asociados a la deteccion.
- Ejecucion sobre CPU, GPU y NPU de Intel mediante OpenVINO.
- Integracion en pipelines GStreamer/DLStreamer con los elementos `gvadetect`, `gvaclassify` y `gvawatermark`.
- Soporte de video en tiempo real con `decodebin3` y anotacion visual del flujo.
- Capacidad multilingue potencial del reconocedor PP-OCRv4, aunque el pipeline documentado se centra en ingles y en matriculas europeas y estadounidenses.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo thinking: es un pipeline de vision especializado, no un modelo de lenguaje.

## Casos de uso

- Peaje y control de accesos: lectura de matriculas en puertas, depositos y entradas de aparcamiento; el detector localiza la matricula y el OCR extrae el texto para validar el acceso o registrar el paso.
- Busqueda de vehiculos y analitica forense: indexacion de las matriculas observadas en una estacion para consultas de investigacion posteriores, con el texto reconocido adjunto como metadato por fotograma.
- Monitorizacion de flotas y autobuses: correlacion de las matriculas detectadas con horarios operativos y planificacion de flota en entornos de transporte publico.
- Aparcamientos inteligentes: control de ocupacion y registro de entradas y salidas mediante la lectura automatica de matriculas en camaras de acceso.
- Analitica de video en el borde: despliegue en dispositivos Intel con CPU, GPU o NPU para procesar el flujo localmente sin enviar video a la nube, reduciendo latencia y ancho de banda.
- Prototipado de pipelines de vision: base para construir soluciones de deteccion mas OCR con DLStreamer, reutilizable para otras regiones o alfabetos afinando el detector YOLOv8 o aportando un `model-proc` personalizado.
- Investigacion y docencia: ejemplo reproducible de composicion de dos modelos especializados en una pipeline GStreamer con metadatos analiticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ejecutarse en FP32 y sobre OpenVINO, el consumo depende del dispositivo; en NPU y CPU no se emplea VRAM dedicada.
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte para CPU, GPU y NPU de Intel.
- Cabe en GPU de consumo: no disponible como dato explicito; el pipeline esta orientado a hardware Intel (CPU, GPU integrada y NPU), no a GPU dedicadas de consumo.
- Opciones de despliegue: Intel DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030 y OpenVINO Runtime 2026.5.0.dev20261030; Python 3.11+; GStreamer con los elementos `gvadetect`, `gvaclassify` y `gvawatermark`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intel/license-plate-recognition | Pipeline YOLOv8 + PaddleOCR PP-OCRv4 (OpenVINO) | no disponible | no aplica | MIT | Hugging Face, OpenVINO IR |
| PaddleOCR PP-OCRv4 | Reconocedor OCR | no disponible | no aplica | Apache 2.0 (segun PaddleOCR) | Repositorio PaddleOCR |
| Ultralytics YOLOv8 | Detector de objetos | no disponible | no aplica | AGPL-3.0 / licencia comercial Ultralytics | Repositorio Ultralytics |

La comparativa se limita a los componentes individuales, ya que no se dispone de datos de rendimiento del pipeline completo ni de pipelines equivalentes de otros proveedores en la informacion proporcionada. Cualquier comparacion cuantitativa de precision o latencia queda como no disponible.

## Limitaciones y advertencias

- La precision del detector depende de la distribucion regional de los datos de entrenamiento; se entreno principalmente con matriculas europeas y estadounidenses, por lo que para otras regiones es necesario afinar el detector YOLOv8 con un dataset representativo.
- El pipeline se distribuye solo en FP32; no se realiza cuantizacion en el script de exportacion, lo que puede limitar el rendimiento en algunos dispositivos.
- La pila objetivo es una version de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0.0.dev20261030), no una release estable; puede haber cambios incompatibles.
- Para variantes de PaddleOCR o alfabetos no latinos es necesario aportar un `model-proc` personalizado con el diccionario de caracteres adecuado.
- El reconocedor PP-OCRv4 puede producir errores de lectura en matriculas borrosas, mal iluminadas u ocluidas; no se documentan tasas de error.
- La licencia MIT del repositorio es permisiva para uso comercial, pero conviene verificar las licencias de los componentes originales (Ultralytics YOLOv8 y PaddleOCR) antes de un despliegue en produccion.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso; su uso esta acotado a deteccion y OCR de matriculas.
- El idioma declarado es ingles y el caso de uso documentado es analitica para metro; no se detallan sesgos especificos.

## Enlaces

- Hugging Face: https://huggingface.co/Intel/license-plate-recognition
- Detector YOLOv8 (Intel Edge AI Resources): https://github.com/open-edge-platform/edge-ai-resources
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Ejemplo DLStreamer `license_plate_recognition.sh`: https://github.com/open-edge-platform/dlstreamer/blob/main/samples/gstreamer/gst_launch/license_plate_recognition/license_plate_recognition.sh
- Referencia `model_proc` de DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/dev_guide/model_proc_file.html
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
