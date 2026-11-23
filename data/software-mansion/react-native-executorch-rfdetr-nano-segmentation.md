# software-mansion/react-native-executorch-rfdetr-nano-segmentation

## Resumen

RFDetr Nano Segmentation es un modelo de segmentación de imágenes derivado de RF-DETR (Roboflow Detection Transformer) y exportado por Software Mansion para su uso en dispositivos móviles a través de la librería React Native ExecuTorch. No se distribuye como pesos originales de PyTorch, sino como programas ExecuTorch `.pte` ya compilados y optimizados para distintos backends de ejecución en el dispositivo (CoreML, Vulkan, XNNPACK), lo que elimina la necesidad de conversión por parte del desarrollador.

El modelo resuelve la tarea de detección y segmentación de instancias directamente en el terminal, sin conexión a servidor. Al estar empaquetado con cuantización int8 y fp16 según el backend, el tamaño de los artefactos oscila entre 39,9 MB (XNNPACK int8) y 118 MB (XNNPACK fp32), lo que lo hace viable en aplicaciones React Native para iOS y Android. La licencia Apache 2.0 y la integración con el registro de modelos de la librería facilitan su adopción en producción.

La relevancia actual reside en la combinación de un transformer de detección de última generación con un runtime de inferencia en dispositivo (ExecuTorch v1.4.1), un patrón que está sustituyendo a los modelos CNN clásicos en aplicaciones móviles que requieren privacidad, baja latencia y funcionamiento offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección y segmentación (RF-DETR, variante Nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | fp16 (CoreML, Vulkan), fp32 (XNNPACK), int8 dinámico 8da8w en capas Linear con convoluciones en fp32 (XNNPACK) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (CoreML fp16, Vulkan fp16, XNNPACK fp32 e int8) |

## Arquitectura y entrenamiento

El modelo subyacente es RF-DETR en su variante Nano, un detector-segmentador basado en transformer (DETR, DEtection TRansformer) desarrollado por Roboflow. La arquitectura DETR emplea un codificador de imagen y un decodificador con consultas aprendidas que predicen cajas y máscaras de forma conjunta, evitando componentes post-procesado como NMS. La variante Nano reduce la profundidad y el ancho de la red para ajustarse al presupuesto computacional de un dispositivo móvil.

La información disponible no detalla el volumen ni la composición del dataset de entrenamiento, ni si hubo fases de RLHF o ajuste fino específico. Lo que sí se documenta es el proceso de exportación: los pesos se convierten a ExecuTorch v1.4.1 con cuatro variantes de backend y precisión, y en el caso de XNNPACK int8 se aplica cuantización dinámica de activaciones (int8) y de pesos por canal (int8) únicamente en las capas Linear, manteniendo las convoluciones en fp32 para preservar precisión. El backend MLX fue exportado pero no publicado; el motivo se documenta en `mlx/NOTES.md`.

## Capacidades

- Detección de objetos con cajas delimitadoras (predicciones de clase y coordenadas).
- Segmentación de instancias con máscaras por objeto.
- Inferencia completamente en dispositivo, sin conexión de red.
- Ejecución en iOS mediante CoreML y en Android mediante Vulkan o XNNPACK.
- Cuantización int8 con pérdida mínima de precisión (0,14 puntos de mAP de caja y 0,26 de máscara frente a fp32).
- Integración directa con el pipeline de tareas de React Native ExecuTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, audio o vídeo de forma nativa.

## Casos de uso

- **Escaneo de documentos en aplicaciones móviles**: el modelo detecta y segmenta regiones de interés (texto, tablas, sellos) en la imagen capturada por la cámara, permitiendo recortes y procesamiento posterior sin enviar la imagen a un servidor.
- **Moderación de contenido visual en el cliente**: clasificación y localización de objetos no deseados antes de la subida, reduciendo coste de ancho de banda y cumpliendo requisitos de privacidad.
- **Realidad aumentada y filtros interactivos**: la segmentación por instancia permite aplicar efectos o superposiciones sobre objetos concretos en tiempo real en iOS (CoreML) y Android (Vulkan).
- **Inventario y control de stock mediante cámara**: conteo y localización de productos en estanterías desde una app React Native, con funcionamiento offline en almacenes sin cobertura.
- **Accesibilidad**: descripción y localización de objetos para usuarios con discapacidad visual, generando etiquetas y regiones en el propio dispositivo.
- **Análisis de imágenes médicas o industriales de baja latencia**: inspección de defectos o regiones de interés en entornos con requisitos de confidencialidad, donde los datos no pueden salir del terminal.
- **Preprocesado en pipelines de visión por computador**: generación de máscaras y cajas en el borde para reducir la carga enviada a la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre las primeras 500 imágenes de validación de COCO val2017 (mAP50-95):

| Variante | mAP caja | mAP máscara |
|---|---|---|
| XNNPACK fp32 | 51,09 | 43,21 |
| XNNPACK int8 | 50,95 | 42,95 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: los artefactos ocupan entre 39,9 MB (XNNPACK int8) y 118 MB (XNNPACK fp32); el consumo en ejecución es mayor que el tamaño del fichero, pero no se especifica en la información disponible.
- **GPU recomendadas**: no aplica en el sentido de servidor; el modelo está pensado para GPU integradas móviles (Apple Neural Engine/GPU vía CoreML, GPU Android vía Vulkan) y CPU (XNNPACK).
- **Compatibilidad con GPU de consumo**: no está diseñado para GPU de escritorio; su objetivo es el dispositivo móvil.
- **Opciones de despliegue**: React Native ExecuTorch (runtime ExecuTorch v1.4.1), o cualquier runtime ExecuTorch compatible con los backends CoreML, Vulkan y XNNPACK.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| RFDetr Nano Segmentation (este) | Transformer DETR | Detección + segmentación | ExecuTorch `.pte` | Apache 2.0 | Imagen |
| RF-DETR (upstream Roboflow) | Transformer DETR | Detección + segmentación | Pesos PyTorch | no disponible en esta ficha | Imagen |
| Modelos de segmentación CNN móviles (p. ej. variantes ligeras de YOLO-seg) | CNN | Detección + segmentación | ONNX, TFLite, CoreML | variable | Imagen |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo es una exportación para un runtime concreto (ExecuTorch v1.4.1); ExecuTorch no garantiza compatibilidad hacia delante, por lo que versiones anteriores del runtime pueden no cargar los ficheros.
- La cuantización int8 solo afecta a capas Linear; las convoluciones permanecen en fp32, de modo que el ahorro de tamaño es parcial (39,9 MB frente a 118 MB en fp32).
- No se documentan sesgos del dataset de entrenamiento ni evaluación de subgrupos demográficos o geográficos.
- Riesgo de alucinación en el sentido de detecciones falsas positivas o máscaras imprecisas en objetos pequeños, ocluidos o fuera de la distribución de entrenamiento; no se aportan métricas de calibración.
- No procesa texto ni audio; no soporta instrucciones en lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero el modelo upstream (RF-DETR de Roboflow) debe verificarse por separado si se redistribuye o modifica.
- El backend MLX no está publicado; no se debe asumir su disponibilidad.
- El tamaño del repositorio (0,7 GB) incluye todas las variantes; en producción conviene descargar solo la variante necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-rfdetr-nano-segmentation
- Modelo upstream RF-DETR: https://github.com/roboflow/rf-detr
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Nota sobre el backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-rfdetr-nano-segmentation/blob/main/mlx/NOTES.md
