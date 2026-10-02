# RKNNAI/RK3588-CNN-yolov8s

## Resumen

RK3588-CNN-yolov8s es un paquete de despliegue del detector de objetos YOLOv8s en formato RKNN, preparado específicamente para la NPU del SoC Rockchip RK3588. Lo publica el usuario RKNNAI y no entrena un modelo nuevo: convierte el modelo fuente del repositorio airockchip/ultralytics_yolov8 al formato propietario RKNN, con cuantización de 8 bits en pesos y activaciones (w8a8), entrada de 640x640 píxeles y ejecución sobre un único núcleo NPU. No es un modelo de lenguaje ni un transformer generativo: es una red convolucional (CNN) de detección de objetos en una sola pasada.

Su relevancia es de tipo práctico para el despliegue en el borde. La combinación de cuantización INT8 y soporte nativo del runtime RKNN permite ejecutar inferencia de visión por computador en placas RK3588 de bajo consumo (por ejemplo, tarjetas tipo Orange Pi 5, Radxa Rock 5 o módulos embebidos equivalentes), sin depender de GPU dedicada ni de conectividad a la nube. El repositorio se distribuye con verificación SHA-256, documentación en inglés y chino, y una única configuración publicada y validada para el runtime RKNN v2.4.0.

El repositorio declara 0 descargas y 0 likes en HuggingFace en el momento de la consulta, con un tamaño reportado de 0.0 GB, lo que sugiere que los artefactos pueden no estar efectivamente alojados en el Hub o que la indexación de tamaños no los refleja. Esto debe verificarse antes de integrarlo en un pipeline de producción. La licencia es AGPL-3.0, heredada del modelo upstream, lo que condiciona su uso en servicios accesibles por red.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (detector de objetos YOLOv8s; el repositorio no detalla la topología interna ni la lista de clases) |
| Parámetros totales | no disponible en la ficha del repositorio (la variante s de YOLOv8 se documenta upstream con aproximadamente 11 M de parámetros, dato no verificado en este paquete) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 640x640 píxeles) |
| Tipos de cuantización | w8a8 (INT8 en pesos y activaciones); única configuración publicada; no se ofrecen variantes FP16, w4a16 ni mixtas |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`.rknn`) para runtime RKNN v2.4.0; no se indica que se publiquen pesos PyTorch, safetensors ni ONNX en este repositorio |
| Modelo origen | airockchip/ultralytics_yolov8 |
| Resolución de entrada | 640x640 |
| Núcleos NPU | 1 |
| Chips soportados | RK3588 |
| Versión de runtime RKNN | v2.4.0 |
| Revisión de descarga | v2.4.0 |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento propio ni documenta el proceso de entrenamiento, la composición del dataset, el número de tokens ni técnicas de alineación como RLHF o DPO. Se trata de una distribución de conversión: el modelo original procede de airockchip/ultralytics_yolov8 (a su vez derivado del YOLOv8 de Ultralytics) y aquí se publica únicamente el artefacto convertido al formato RKNN junto con sus ficheros de configuración y sumas de verificación SHA-256.

La innovación técnica del paquete es la propia conversión y cuantización: pesos y activaciones se reducen a 8 bits para explotar la unidad INT8 de la NPU del RK3588, lo que reduce el tamaño del artefacto y el consumo energético respecto a una ejecución en FP32 sobre CPU o GPU. La configuración publicada está atada al runtime RKNN v2.4.0 y a un único núcleo NPU, por lo que no se aprovecha la topología multi-núcleo del SoC. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni destilación, ya que no aplican a este tipo de red.

## Capacidades

- Detección de objetos en imágenes o fotogramas de vídeo a resolución de 640x640 píxeles, con salida de cajas delimitadoras y puntuaciones de confianza según el formato estándar de YOLOv8.
- Ejecución de inferencia sobre la NPU del RK3588 en precisión INT8 (w8a8), lo que habilita procesamiento local en tiempo real sobre hardware de bajo consumo.
- Integración con el flujo de despliegue de RKNN Model Zoo, que aporta el preprocesado (redimensionado tipo letterbox) y el postprocesado (supresión de no máximos, NMS) necesarios alrededor del modelo.
- Compatibilidad con el runtime RKNN v2.4.0 en chips RK3588, con verificación de integridad mediante SHA-256 antes del despliegue.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de tool calling, function calling ni orquestación de agentes.
- No dispone de modo de razonamiento explícito (thinking mode), entrada de audio ni salida de texto.
- La lista de clases detectables no se especifica en la información disponible; depende del modelo upstream utilizado en la conversión.

## Casos de uso

- Videovigilancia perimetral en el borde: el detector se ejecuta localmente en una placa RK3588 alimentada por una cámara IP, de modo que las cajas delimitadoras se calculan sin enviar vídeo a la nube, reduciendo coste de ancho de banda y exposición de datos.
- Control de aforo y conteo de personas: combinado con un tracker sencillo sobre las detecciones por fotograma, permite estimar ocupación en comercios, estaciones o recintos usando únicamente hardware embebido.
- Inspección visual industrial: con un modelo reentrenado sobre la misma tubería de conversión, se puede detectar defectos en línea de producción a resolución 640x640, con latencia acotada por la NPU y sin GPU dedicada en planta.
- Analítica de retail: detección de presencia y tránsito en estanterías o cajas para generar métricas de flujo de clientes, ejecutando la inferencia en el propio establecimiento y agregando únicamente contadores.
- Robótica móvil y drones: percepción de obstáculos a bordo, donde el consumo reducido de la NPU INT8 es determinante para la autonomía de la batería y donde no hay margen para depender de conectividad.
- Agricultura de precisión: detección de frutos, plagas o malas hierbas en campo con dispositivos alimentados por batería o panel solar, aprovechando el bajo consumo de la ruta INT8.
- Análisis de tráfico urbano: conteo y clasificación de vehículos por carril en cámaras municipales, con procesamiento en el poste y sin retransmitir el vídeo completo.
- Prototipado y docencia en visión embebida: al estar atado a RKNN Model Zoo, sirve como referencia reproducible para medir el efecto de la cuantización w8a8 frente al modelo en punto flotante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión (mAP), latencia, FPS ni consumo energético, ni comparaciones con el modelo en punto flotante o con otras variantes de YOLOv8, por lo que no es posible cuantificar la pérdida de precisión introducida por la cuantización w8a8.

| Métrica | Valor |
|---|---|
| mAP (COCO u otro) | no disponible |
| Latencia de inferencia | no disponible |
| Throughput (FPS) | no disponible |
| Consumo energético | no disponible |
| Pérdida de precisión por cuantización w8a8 | no disponible |

## Requisitos de hardware

- Plataforma de destino: SoC Rockchip RK3588 con NPU compatible con el runtime RKNN v2.4.0. El repositorio solo declara soporte para este chip.
- La configuración publicada utiliza un único núcleo NPU, por lo que no requiere reparto entre los núcleos disponibles del SoC.
- No se especifican requisitos de memoria RAM ni de almacenamiento para el artefacto convertido.
- VRAM de GPU: no aplica. El modelo está compilado para NPU Rockchip y no se ejecuta en GPUs NVIDIA, AMD o Intel, ni en CPU mediante los backends habituales de inferencia.
- GPU recomendadas: no aplica (no se admiten A100, H100, RTX 4090 ni similares para ejecutar el artefacto RKNN).
- Opciones de despliegue: runtime RKNN v2.4.0 sobre RK3588, junto con el ejemplo de YOLOv8 de RKNN Model Zoo para el preprocesado y postprocesado. vLLM, llama.cpp, Ollama y TGI no aplican a este formato ni a esta tarea.
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Cadena de conversión: RKNN Toolkit2 se emplea para generar el artefacto desde el modelo fuente; la versión exacta de la herramienta no se detalla en la ficha.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK3588-CNN-yolov8s (RKNNAI) | CNN de detección, conversión RKNN | no disponible en el repositorio | 640x640 px | w8a8, 1 núcleo NPU | AGPL-3.0 | HuggingFace y ModelScope, revisión v2.4.0 |
| YOLOv8s upstream (airockchip/ultralytics_yolov8) | CNN de detección, PyTorch | no disponible en la información proporcionada | entrada configurable, 640 px en la variante estándar | punto flotante | AGPL-3.0 | repositorio GitHub |
| Otras variantes YOLOv8 de RKNN Model Zoo (n, m, l, x) | CNN de detección, conversión RKNN | no disponible en la información proporcionada | 640x640 px habitualmente | w8a8 según ejemplo | AGPL-3.0 | repositorio GitHub de RKNN Model Zoo |

No se dispone de datos de rendimiento comparativos entre estas opciones dentro de la información proporcionada, por lo que la elección entre variantes n, s y m no puede resolverse aquí con cifras de mAP ni de latencia.

## Limitaciones y advertencias

- Licencia AGPL-3.0 heredada del modelo upstream: su uso en servicios accesibles a través de red activa la obligación de ofrecer el código fuente correspondiente a los usuarios del servicio, lo que debe evaluarse antes de integrarlo en un producto comercial cerrado.
- El repositorio reporta un tamaño de 0.0 GB y 0 descargas: es necesario comprobar que los artefactos `.rknn` están realmente publicados y que las sumas SHA-256 se validan correctamente antes de cualquier despliegue.
- Soporte limitado al chip RK3588: no hay configuraciones declaradas para otras familias Rockchip (RK3566, RK3568, RK3576) ni para otros aceleradores.
- Única configuración publicada (640x640, w8a8, 1 núcleo NPU): no se ofrecen variantes de mayor resolución, mayor precisión o reparto multi-núcleo.
- Dependencia estricta de la versión de runtime RKNN v2.4.0; el uso de una versión distinta puede provocar incompatibilidades del artefacto.
- No se publican métricas de precisión ni comparación con el modelo en punto flotante, por lo que se desconoce la degradación introducida por la cuantización INT8 en clases poco representadas o en objetos pequeños.
- La lista de clases y el dominio de entrenamiento del modelo convertido no se documentan; en un caso de uso concreto es probable que sea necesario reentrenar y reconvertir, asumiendo de nuevo el coste de la cadena RKNN Toolkit2.
- Riesgo intrínseco de falsos positivos y falsos negativos propio de los detectores convolucionales: la confianza de salida exige umbrales calibrados por escenario, y el rendimiento se degrada con oclusiones, cambios de iluminación o dominios distintos al de entrenamiento.
- Sin sesgos documentados ni auditoría publicada: el repositorio no incluye evaluación de sesgo, robustez adversarial ni análisis de equidad por subgrupos.
- Sin validación comunitaria: 0 likes y 0 descargas implican ausencia de evidencia externa sobre su comportamiento en producción.
- Los metadatos indican fechas de creación y actualización de 2026-10-02, con una diferencia de 26 segundos entre ambas; conviene verificar la trazabilidad real de la publicación.
- No aplica riesgo de alucinación en el sentido de los modelos de lenguaje, pero sí el riesgo de detecciones espurias descrito arriba.
- No se han identificado enlaces técnicos adicionales en la búsqueda web: los resultados devueltos no guardan relación con este modelo.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov8s
- Modelo fuente (airockchip/ultralytics_yolov8): https://github.com/airockchip/ultralytics_yolov8
- Ejemplo de YOLOv8 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Fichero de licencia incluido en el repositorio: LICENSE (GNU AGPL v3)
- Repositorio en ModelScope: referenciado en la model card como `RKNNAI/RK3588-CNN-yolov8s`, revisión `v2.4.0` (no se ha facilitado la URL directa en la información disponible)
- Documentación de YOLOv8 de Ultralytics: no disponible en la información proporcionada
- Paper o informe técnico asociado a esta conversión: no disponible
