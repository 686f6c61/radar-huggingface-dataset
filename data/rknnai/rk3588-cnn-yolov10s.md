# RKNNAI/RK3588-CNN-yolov10s

## Resumen

RKNNAI/RK3588-CNN-yolov10s es un paquete de despliegue, no un modelo de lenguaje: se trata de la conversión a formato RKNN de yolov10s, un detector de objetos CNN de una sola etapa, preparado para ejecutarse sobre la NPU del SoC Rockchip RK3588. Lo publica el usuario RKNNAI en Hugging Face, con espejo en ModelScope, y su modelo de origen es THU-MIG/yolov10, el repositorio oficial del que procede la arquitectura. La distribución se canaliza a través de RKNN Model Zoo, la colección de ejemplos que Rockchip mantiene para sus NPU.

El problema que resuelve es concreto: permitir inferencia de detección de objetos en hardware embebido ARM+NPU, sin GPU dedicada y sin depender de la nube, con entrada de 640x640 y cuantización INT8 de pesos y activaciones (w8a8) sobre un único núcleo NPU. Resulta relevante para desarrolladores de edge AI que necesitan visión por computador en dispositivos de bajo consumo: cámaras IP, robots móviles, drones, sistemas de inspección en línea o pasarelas de video analítico.

La documentación publicada es mínima. El model card solo detalla los ficheros, la versión del runtime RKNN (v2.4.0), la cuantización, los comandos de descarga y el procedimiento de verificación SHA-256. No se declaran parámetros, datos de entrenamiento, lista de clases ni resultados de benchmarks, y en el momento de la consulta el repositorio acumulaba 0 descargas y 0 likes. El tamaño reportado del repositorio es de 0.0 GB, por lo que conviene comprobar que los artefactos están efectivamente subidos antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN, detector de objetos de una sola etapa (yolov10s) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; entrada de imagen fija de 640x640, sin contexto de texto) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en INT8) sobre 1 nucleo NPU |
| Idiomas soportados | no aplicable (modelo de vision; no procesa texto) |
| Licencia | AGPL-3.0 (GNU AGPL v3, licencia del modelo de origen) |
| Formato de pesos | RKNN (runtime RKNN v2.4.0); modelo de origen en THU-MIG/yolov10 |
| Tipo de modelo declarado | CNN |
| Resolucion de entrada | 640x640 |
| Nucleos NPU | 1 |
| Chip soportado | RK3588 |
| Version del runtime RKNN | v2.4.0 |
| Revision del repositorio | v2.4.0 |
| Identificador del modelo | RKNNAI/RK3588-CNN-yolov10s |
| Tareas soportadas | deteccion de objetos (otras tareas no declaradas) |

## Arquitectura y entrenamiento

El model card identifica el modelo como CNN y remite al repositorio de origen THU-MIG/yolov10 para la arquitectura y el entrenamiento; no se aporta ningún detalle adicional sobre el backbone, la cabeza de detección, el número de tokens de entrenamiento ni la composición del dataset. Tampoco se indica si hubo fases de alineación tipo RLHF o DPO, algo que en cualquier caso no aplica a un detector de objetos. Lo único documentado sobre este repositorio es el proceso de conversión: se transforma el modelo original a formato RKNN para RK3588 con la precisión indicada en cada configuración, en este caso w8a8. El model card no especifica si la cuantización se hizo por calibración post-entrenamiento (PTQ) o con entrenamiento consciente de cuantización (QAT).

La innovación redistribuida aquí es de despliegue, no de modelado: un paquete reproducible con revisión fijada (v2.4.0), sumas de verificación SHA-256, comandos equivalentes para ModelScope y Hugging Face, y una configuración única documentada (yolov10s-640x640-w8a8-1) limitada al RK3588. La compatibilidad se declara por configuración: hay que usar los ficheros correspondientes a la misma configuración, ya que las versiones del runtime RKNN y las variantes de cuantización no son intercambiables entre sí.

## Capacidades

- Detección de objetos sobre imágenes o fotogramas individuales a 640x640 píxeles, cuantizada en INT8 y ejecutada en la NPU del RK3588.
- No es un modelo generativo: no produce texto, código ni respuestas conversacionales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; cualquier lógica de seguimiento, conteo o decisión debe implementarse fuera del modelo, en el código de la aplicación.
- Capacidades multilingües: no aplicables, el modelo no procesa lenguaje.
- Capacidades especiales: ninguna declarada. No hay modo de razonamiento, ni visión-lenguaje, ni audio, ni segmentación, ni estimación de pose.
- Tareas auxiliares como tracking multi-objeto, clasificación de atributos o reidentificación no están cubiertas por esta distribución.
- El formato exacto de salida y la lista de clases detectables no se detallan en el model card; se heredan del modelo de origen, que no forma parte de la documentación publicada en este repositorio.

## Casos de uso

- Video analítico en cámaras IP: el modelo se ejecuta íntegramente en el SoC RK3588, de modo que una cámara o una pasarela puede detectar objetos en el flujo de vídeo sin enviar fotogramas a la nube. Es adecuado porque la cuantización w8a8 y el uso de un solo núcleo NPU reducen el consumo y dejan recursos libres para el resto del pipeline.
- Robótica móvil y AGV: detección de obstáculos, personas o señalización sobre plataformas con RK3588, donde no cabe una GPU y el presupuesto térmico es limitado. La resolución 640x640 ofrece un compromiso razonable entre alcance y coste de cómputo.
- Inspección industrial en línea de producción: localización de piezas, defectos visibles o elementos fuera de posición en la banda, con la inferencia en el propio equipo y sin latencia de red.
- Conteo y control de aforo: las detecciones por fotograma se pueden acumular o cruzar con líneas virtuales en código propio para obtener conteos de entrada y salida en comercios, estaciones o recintos.
- Analítica de retail: estimación de ocupación por zonas y detección de presencia de producto en estanterías, con procesamiento local que evita tratar imágenes personales en servidores externos.
- Sistemas de transporte inteligente: detección de vehículos, peatones y elementos viarios en unidades embarcadas o en postes de carretera con alimentación limitada.
- Prototipado y evaluación de NPU: al formar parte de RKNN Model Zoo, sirve como referencia para medir el comportamiento de un detector cuantizado en RK3588 y como plantilla para convertir y desplegar otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay cifras de mAP, latencia ni FPS para esta configuración en el model card. Los resultados de la búsqueda web tampoco aportan métricas de yolov10 sobre RK3588: uno de los enlaces es un artículo en el que el autor indica que las pruebas de YOLOv10 en RK3588 están en curso y que, en sus mediciones previas, YOLOv5 solo alcanzaba en torno a 10 FPS en ese SoC. Ese dato corresponde a YOLOv5 y no es extrapolable a este paquete. Cualquier cifra de rendimiento debe medirse en el dispositivo destino con el runtime RKNN v2.4.0 y la configuración de un núcleo NPU aquí documentada.

## Requisitos de hardware

- SoC objetivo: Rockchip RK3588, con la inferencia en su NPU. La configuración publicada soporta exclusivamente este chip.
- Uso de NPU: 1 núcleo NPU según el model card. No se documenta el reparto entre núcleos ni la ganancia esperada al paralelizar.
- VRAM de GPU: no aplicable; el modelo se ejecuta en la NPU del SoC y consume memoria del sistema. No se publica la huella de memoria exacta.
- GPUs recomendadas: no aplicable. El paquete no está pensado para A100, H100 ni RTX 4090; para esos entornos habría que usar el modelo de origen en PyTorch u otro formato.
- GPU de consumo: no aplicable, por la misma razón.
- Despliegue: es necesario el runtime RKNN v2.4.0 y los ejemplos de RKNN Model Zoo correspondientes a yolov10. La conversión a RKNN se realiza desde el modelo de origen, habitualmente pasando por ONNX, con el toolkit de Rockchip.
- Alternativas de serving tipo vLLM, llama.cpp, Ollama o TGI: no aplicables; no son compatibles con el formato RKNN ni con la NPU del RK3588.
- Latencia y throughput: no disponibles. Dependen de la versión del runtime, del número de núcleos NPU utilizados, del reloj del SoC y del pipeline de preprocesado y postprocesado.
- Verificación previa obligatoria: ejecutar `sha256sum -c SHA256SUMS` dentro del directorio de la configuración y comprobar que todas las entradas devuelven `OK` antes de desplegar.

## Comparativa con modelos similares

| Modelo | Tipo | Formato y cuantizacion | Chip objetivo | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| RKNNAI/RK3588-CNN-yolov10s | Detector CNN de una etapa | RKNN, w8a8, 640x640, 1 nucleo NPU | RK3588 | AGPL-3.0 | no disponible |
| YOLOv8 en rk3588-yolo-demo (kaylorchen) | Detector CNN de una etapa | RKNN (conversion desde PyTorch via ONNX) | RK3588 | no disponible en la informacion recuperada | no disponible |
| YOLOv11n INT8 en Ebwai/Yolon11_RK3588 | Detector CNN de una etapa | INT8 sobre NPU, pipeline Python a C++ con 3 nucleos NPU | RK3588 | no disponible en la informacion recuperada | no disponible |
| YOLOv5 en RK3588 (referencia de blog) | Detector CNN de una etapa | no disponible | RK3588 | no disponible en la informacion recuperada | en torno a 10 FPS, segun medicion del autor del blog, sujeta a su entorno de prueba |

La comparación cuantitativa no es posible con los datos disponibles: ninguno de los repositorios consultados publica mAP ni latencias verificables para estas configuraciones. La diferencia observable está en la configuración de despliegue: este paquete fija una única variante (640x640, w8a8, un núcleo NPU) y un runtime concreto (v2.4.0), mientras que los repositorios alternativos citados exploran variantes de tamaño, tareas y uso de varios núcleos NPU.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte, con obligaciones relevantes cuando el software se ofrece como servicio en red. Para uso comercial propietario hay que revisar los términos con detalle antes de integrar el paquete en un producto.
- La licencia corresponde al modelo de origen (THU-MIG/yolov10) y se mantiene en esta conversión; los avisos de copyright y atribución originales se conservan en el fichero de licencia.
- Compatibilidad restringida: solo RK3588. No se declara soporte para otros SoC con NPU de Rockchip ni para otras plataformas.
- La cuantización w8a8 puede reducir la precisión de detección respecto al modelo en coma flotante, especialmente en objetos pequeños o con poco contraste. No se publica la pérdida de precisión.
- Alcance funcional limitado: solo detección. No hay tracking, segmentación, pose, OCR ni clasificación de atributos; todo eso debe añadirse en la aplicación.
- Ausencia de datos de evaluación: sin mAP, sin curvas de precisión y sin métricas de latencia, no es posible estimar su comportamiento en un caso de uso concreto sin medirlo.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier detector; el término alucinación no aplica en el sentido de los modelos de lenguaje, pero sí la detección de objetos inexistentes o la omisión de objetos presentes.
- Sesgos: no disponibles. Dependerán del dataset de entrenamiento del modelo de origen, que no se documenta en este repositorio.
- El model card no detalla la lista de clases ni el formato exacto de salida, lo que obliga a inspeccionar los artefactos y el código de ejemplo antes de integrarlo.
- Señales de madurez bajas: 0 descargas, 0 likes y un tamaño de repositorio reportado de 0.0 GB en el momento de la consulta. Conviene verificar la integridad y la presencia real de los ficheros antes de depender de este paquete.
- Fechas del repositorio: creado el 2026-10-02 y actualizado el 2026-10-02 según los metadatos de Hugging Face.
- No se especifica si la cuantización se obtuvo por PTQ o por QAT, lo que afecta a la reproducibilidad y a la posibilidad de reajustar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/RKNNAI/RK3588-CNN-yolov10s
- ModelScope: mismo identificador RKNNAI/RK3588-CNN-yolov10s, descargable con `modelscope download --model RKNNAI/RK3588-CNN-yolov10s --revision v2.4.0`
- Modelo de origen: https://github.com/THU-MIG/yolov10
- Ejemplo de despliegue en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov10
- Documentación del ejemplo yolov10 en un fork de RKNN Model Zoo: https://github.com/Ebwai/Yolon11_RK3588/blob/main/rknn_model_zoo/examples/yolov10/README.md
- Copia del ejemplo yolov10 en otro repositorio: https://github.com/Davin-Liang/RK3588-Omni-Sentinel/tree/main/Software/tools/rknn_model_zoo/examples/yolov10
- Demostración de despliegue YOLO en RK3588: https://deepwiki.com/kaylorchen/rk3588-yolo-demo/2-model-system
- Guía de conversión de modelos YOLO a RKNN: https://deepwiki.com/kaylorchen/rk3588-yolo-demo/2.1-model-conversion
- Pruebas de YOLOv10 en RK3588 (en curso, en chino): https://blog.csdn.net/twicave/article/details/139658447
