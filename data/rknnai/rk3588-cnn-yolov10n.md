# RKNNAI/RK3588-CNN-yolov10n

## Resumen

RK3588-CNN-yolov10n es un paquete de despliegue del detector de objetos YOLOv10n convertido al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. No es un modelo de lenguaje ni un modelo generativo: se trata de una red neuronal convolucional (CNN) de deteccion de objetos, publicada por el usuario RKNNAI, que empaqueta la configuracion `yolov10n-640x640-w8a8-1` junto con la documentacion de descarga y verificacion de integridad. El modelo origen es YOLOv10, del grupo THU-MIG, distribuido bajo licencia GNU AGPL v3.

Su relevancia es eminentemente practica: permite ejecutar deteccion de objetos sobre placas de bajo consumo basadas en RK3588 (Orange Pi 5, Radxa Rock 5B, Khadas Edge y similares) sin depender de GPUs NVIDIA ni del ecosistema CUDA. La configuracion publicada usa cuantizacion w8a8 (pesos y activaciones a 8 bits), resolucion de entrada de 640x640 y un unico nucleo NPU, con runtime RKNN v2.4.0.

El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad. No se distribuyen pesos en safetensors, GGUF ni ONNX: el artefacto es la configuracion RKNN y sus ficheros asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion de objetos (YOLOv10n, origen THU-MIG/yolov10) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (formato de despliegue de Rockchip); no se distribuyen safetensors, GGUF ni ONNX |
| Chip soportado | RK3588 |
| Version de runtime RKNN | v2.4.0 |
| Nucleos NPU | 1 |
| Resolucion de entrada | 640x640 |
| Configuracion incluida | yolov10n-640x640-w8a8-1 |
| Revision de descarga | v2.4.0 |
| Verificacion de integridad | SHA256SUMS (sha256sum -c) |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo subyacente es YOLOv10n, un detector de objetos de la familia YOLO con arquitectura convolucional (el model card clasifica explicitamente el modelo como "CNN"). YOLOv10 introduce en su version original mejoras de eficiencia en la asignacion de etiquetas y elimina la necesidad de supresion no maxima (NMS) en la prediccion, segun la documentacion del proyecto upstream. La variante "n" corresponde a la configuracion mas ligera de la familia.

La informacion proporcionada no detalla el proceso de entrenamiento: no se indica el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste fino. Lo unico documentado es la conversion del modelo origen al formato RKNN para RK3588 con precision w8a8. No se documentan innovaciones adicionales en esta distribucion mas alla de la propia conversion y cuantizacion para la NPU de Rockchip.

## Capacidades

- Deteccion de objetos sobre imagenes de entrada de 640x640 en la NPU del RK3588.
- Inferencia con cuantizacion w8a8 y un unico nucleo NPU en la configuracion publicada.
- Ejecucion en dispositivos edge sin GPU dedicada ni stack CUDA.
- Generacion de texto: no disponible (el modelo no es generativo).
- Razonamiento, matematicas y generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking", vision multimodal o audio: no disponible.
- Numero y naturaleza de las clases detectadas: no disponible en el model card.
- Otras tareas de vision (segmentacion, pose, clasificacion, OCR): no documentadas.

## Casos de uso

- Videovigilancia en el borde: el modelo se ejecuta sobre la NPU del RK3588 en una camara o grabador IP, permitiendo detectar personas, vehiculos u objetos en flujo de video a 640x640 sin enviar imagen a la nube, lo que reduce latencia y coste de ancho de banda.
- Robotica movil y AGV: integracion en robots basados en RK3588 para deteccion de obstaculos y objetos de navegacion, con consumo energetico bajo y sin GPU dedicada.
- Drones y plataformas UAV: al tratarse de una configuracion cuantizada a 8 bits, es apta para equipos con restricciones severas de peso, consumo y disipacion termica.
- Analitica comercial en tienda: conteo y deteccion de personas o productos sobre placas RK3588 instaladas localmente, evitando el tratamiento de imagenes personales en servidores externos.
- Control de calidad industrial: deteccion de defectos o piezas mal posicionadas en linea de produccion, conectando la salida del detector a un PLC o a un sistema MES.
- Agricultura de precision: deteccion de frutos, malas hierbas o plagas con camaras embarcadas en maquinaria agricola alimentadas por el propio vehiculo.
- Prototipado de sistemas de vision embarcada: uso como referencia de partida en proyectos que despues migran a otro detector o a una configuracion de mas nucleos NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se proporcionan valores de mAP, latencia, FPS ni comparaciones con otras configuraciones en el model card ni en los datos disponibles. Tampoco se especifica el dataset de evaluacion.

## Requisitos de hardware

- Plataforma obligatoria: SoC Rockchip RK3588. La configuracion no es ejecutable en GPU NVIDIA, AMD ni en CPU x86 convencional.
- Memoria: la NPU del RK3588 comparte la memoria del sistema con la CPU, por lo que el requisito de VRAM no aplica; el consumo depende de la memoria LPDDR del dispositivo (habitualmente 4, 8 o 16 GB en placas RK3588).
- Almacenamiento: el repositorio ocupa 0.0 GB; el espacio real depende de los ficheros de la configuracion descargada.
- NPU: 1 nucleo asignado en esta configuracion, segun el model card.
- Runtime: RKNN Runtime v2.4.0, con el controlador RKNPU2 correspondiente.
- GPU consumer: no aplica. El modelo no esta pensado para RTX 4090, A100 ni H100.
- Opciones de despliegue: RKNN Toolkit2 / RKNN Model Zoo (ejemplo oficial de YOLOv10), API de RKNPU2 en Python o C++. No aplica vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican FPS ni milisegundos por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Plataforma objetivo | Cuantizacion | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| RK3588-CNN-yolov10n (RKNNAI) | CNN de deteccion | RKNN | NPU RK3588 | w8a8 | AGPL-3.0 | no disponible |
| YOLOv10n original (THU-MIG) | CNN de deteccion | PyTorch / ONNX | GPU o CPU | FP32 / FP16 | AGPL-3.0 | no disponible en la informacion proporcionada |
| Otros detectores del RKNN Model Zoo | CNN de deteccion | RKNN | NPU Rockchip | segun configuracion | segun modelo origen | no disponible |

No se dispone de datos comparativos de precision, latencia o consumo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso en un servicio accesible por red puede obligar a publicar el codigo fuente de la aplicacion que lo integra. Debe revisarse con atencion antes de cualquier uso comercial.
- La licencia AGPL proviene del modelo origen YOLOv10 (THU-MIG), no de la conversion. La distribucion conserva los avisos de copyright y atribucion originales.
- Dependencia de hardware: solo funciona en RK3588 con el runtime RKNN v2.4.0 y los controladores RKNPU2 correspondientes. No hay portabilidad directa a otras plataformas.
- La cuantizacion w8a8 puede degradar la precision de deteccion respecto al modelo en FP32. No se publican metricas de esa perdida en la informacion disponible.
- Se debe verificar la integridad con `sha256sum -c SHA256SUMS` antes del despliegue, segun indica el propio autor.
- Cada configuracion incluye sus propios ficheros: no se deben mezclar ficheros de configuraciones distintas.
- Riesgo de alucinacion: no aplica en el sentido de los modelos generativos, pero si existe riesgo de falsos positivos y falsos negativos propios de cualquier detector de objetos.
- Sesgos: no disponibles. No se documenta la composicion del conjunto de entrenamiento ni el conjunto de clases, por lo que no puede evaluarse el sesgo por dominio, iluminacion, geografia o demografia.
- Idiomas y contexto: no aplica; el modelo no procesa texto.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia publica de uso en produccion.
- El model card esta disponible en ingles y chino, no en castellano.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov10n
- Modelo origen YOLOv10 (THU-MIG): https://github.com/THU-MIG/yolov10
- Ejemplo de despliegue en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov10
- ModelScope (patron habitual de la plataforma, no confirmado en los datos): https://modelscope.cn/models/RKNNAI/RK3588-CNN-yolov10n
- Texto de la licencia GNU AGPL v3: https://www.gnu.org/licenses/agpl-3.0.html
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenidos no relacionados.
