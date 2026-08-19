# modelapi/rtmdet-tiny-fp16-ov-catalog

## Resumen

RTMDet-Ins Tiny es un modelo de segmentación de instancias en tiempo real desarrollado por el equipo de OpenMMLab dentro del proyecto MMDetection. Esta versión concreta es una compilación del proyecto Geti de Intel, convertida a formato OpenVINO IR con pesos en FP16 para su despliegue eficiente en dispositivos edge y sistemas de robótica. El modelo toma una imagen como entrada y devuelve máscaras por instancia junto con sus cajas delimitadoras, lo que permite localizar y segmentar objetos individuales en la escena.

La relevancia actual de este modelo radica en su equilibrio entre velocidad y precisión: al ser una variante "tiny", está diseñado para ejecutarse en hardware con recursos limitados, como CPUs integradas o aceleradores de bajo consumo, manteniendo una calidad aceptable para tareas de visión en tiempo real. Su licencia Apache-2.0 facilita su integración en productos comerciales, y su formato OpenVINO IR permite una inferencia optimizada en plataformas Intel sin necesidad de frameworks adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMDet (detector de una etapa con backbone CSPNeXt) con cabeza de segmentación de instancias |
| Parametros totales | no disponible (variante tiny, se estima en torno a 4-5 millones, sin confirmar) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | FP16 (OpenVINO IR) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (bin + xml) |

## Arquitectura y entrenamiento

RTMDet-Ins Tiny sigue la arquitectura del detector RTMDet, que emplea un backbone CSPNeXt (una variante de CSPNet) para extraer características multiescala, un cuello PAN (Path Aggregation Network) para fusionar dichas características y una cabeza de detección y segmentación que predice simultáneamente cajas delimitadoras y máscaras de instancia. La variante "tiny" reduce el número de canales y capas para minimizar el coste computacional, priorizando la velocidad de inferencia sobre la precisión máxima.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de optimización como RLHF o DPO) no se han proporcionado en la información disponible. No obstante, el modelo original de MMDetection se entrena típicamente en el conjunto de datos COCO para detección y segmentación de instancias. Esta versión convertida a OpenVINO conserva los pesos originales sin reentrenamiento, solo se ha realizado una conversión de formato y cuantización a FP16.

## Capacidades

- Detección de objetos: genera cajas delimitadoras para cada objeto detectado en la imagen.
- Segmentación de instancias: produce máscaras de píxeles a nivel de instancia, permitiendo distinguir objetos individuales incluso si se solapan.
- Inferencia en tiempo real: optimizado para baja latencia gracias a su tamaño reducido y al formato OpenVINO IR.
- Soporte de entrada de imagen estándar: acepta imágenes en formato BGR (típico de OpenCV) y devuelve resultados estructurados con máscaras y cajas.
- Compatibilidad con el ecosistema OpenVINO: puede ejecutarse en CPUs Intel, GPUs integradas y aceleradores como Intel Movidius, sin dependencias externas pesadas.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural: es un modelo exclusivamente de visión.

## Casos de uso

- Robótica de manipulación: el modelo puede segmentar objetos en la escena para guiar a un brazo robótico en tareas de picking, identificando la posición y el contorno de cada pieza en tiempo real.
- Inspección de calidad industrial: integrado en líneas de producción, permite detectar y segmentar defectos o piezas no conformes en imágenes de alta resolución, con una latencia lo bastante baja para operar a velocidad de cinta.
- Navegación autónoma de vehículos o drones: al segmentar obstáculos y objetos relevantes, el modelo ayuda a tomar decisiones de evitación de colisiones en entornos dinámicos.
- Vigilancia y análisis de multitudes: puede contar personas y segmentar individuos en imágenes de cámaras de seguridad, incluso con solapamientos parciales.
- Agricultura de precisión: segmentación de plantas, frutos o plagas en imágenes aéreas o de campo para monitorizar cultivos y optimizar tratamientos.
- Realidad aumentada: al obtener máscaras de instancias, se pueden superponer elementos virtuales sobre objetos reales de forma precisa, mejorando la experiencia en aplicaciones de asistencia o entretenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como mAP en COCO, latencia o throughput para esta conversión específica a OpenVINO FP16. Los datos del modelo original RTMDet-Ins Tiny en MMDetection pueden consultarse en el repositorio oficial, pero no se han incluido en esta ficha.

## Requisitos de hardware

- Al ser un modelo "tiny" con pesos en FP16, su huella de memoria es reducida: se estima que requiere menos de 50 MB de VRAM/RAM para los pesos, aunque el consumo total dependerá de la resolución de entrada y del runtime.
- Puede ejecutarse en CPUs Intel modernas con OpenVINO, sin necesidad de GPU dedicada. Un procesador con soporte AVX2 o AVX-512 ofrecerá mejor rendimiento.
- GPU integradas Intel (iGPU) son suficientes para inferencia en tiempo real a resoluciones moderadas (por ejemplo, 640x640).
- Para aceleración adicional, puede desplegarse en aceleradores Intel como el Neural Compute Stick 2 o en VPUs integradas en plataformas como el chipset PTL (mencionado en las etiquetas).
- Opciones de despliegue: mediante el paquete `openvino-model-api` (como se muestra en la model card), o exportando el modelo a otros formatos compatibles con OpenVINO Runtime.
- La latencia típica en CPU de gama media para una imagen de 640x640 se sitúa en el rango de 20-50 ms, aunque no hay datos oficiales publicados para esta conversión concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Precisión (mAP COCO) | Velocidad | Licencia |
|---|---|---|---|---|---|
| RTMDet-Ins Tiny (este) | ~4-5M (estimado) | Segmentación de instancias | no disponible | Muy alta | Apache-2.0 |
| Mask R-CNN (ResNet-50) | ~44M | Segmentación de instancias | ~35-37 | Media | MIT |
| YOLACT (ResNet-50) | ~33M | Segmentación de instancias | ~29-31 | Alta | MIT |

La comparativa es orientativa: RTMDet-Ins Tiny es significativamente más ligero que Mask R-CNN y YOLACT, lo que lo hace adecuado para despliegues en edge, a costa de una precisión previsiblemente menor. No se dispone de métricas exactas de esta versión OpenVINO para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Precisión limitada: al ser una variante "tiny", puede fallar en la segmentación de objetos pequeños, muy ocluidos o con apariencia similar al fondo.
- Sin soporte de vídeo nativo: aunque puede procesar frames individuales, no incluye tracking temporal ni aprovechamiento de información entre frames.
- Dependencia del formato OpenVINO: el modelo está optimizado para el runtime de OpenVINO; para usarlo en otros frameworks (PyTorch, TensorFlow) sería necesario convertir los pesos de vuelta, lo que podría degradar el rendimiento.
- Sin información sobre el dataset de entrenamiento específico: aunque se asume COCO, no se ha confirmado, lo que podría afectar a la generalización en dominios muy distintos.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del proyecto MMDetection original, que también es Apache-2.0.
- No se han publicado resultados de evaluación independiente para esta conversión a OpenVINO FP16, por lo que las cifras de rendimiento deben tomarse con cautela.

## Enlaces

- [Modelo en Hugging Face (modelapi/rtmdet-tiny-fp16-ov-catalog)](https://huggingface.co/modelapi/rtmdet-tiny-fp16-ov-catalog)
- [Repositorio original de MMDetection (configuración RTMDet)](https://github.com/open-mmlab/mmdetection/tree/main/configs/rtmdet)
- [Modelo fuente OpenVINO/rtmdet_inst_tiny-fp16-ov](https://huggingface.co/OpenVINO/rtmdet_inst_tiny-fp16-ov)
- [Proyecto Geti (plataforma de Intel)](https://github.com/open-edge-platform/geti)
