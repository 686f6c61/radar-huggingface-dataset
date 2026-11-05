# qualcomm/YOLOE-Segmentation

## Resumen

YOLOE-Segmentation es un modelo de segmentación de imágenes de propósito general derivado de Ultralytics YOLOE y empaquetado por Qualcomm para su despliegue optimizado en dispositivos con aceleradores NPU de Qualcomm (Snapdragon y Dragonwing). El checkpoint concreto es YOLOE-v8L-SEG, un modelo de 53,47 millones de parámetros que predice cajas delimitadoras, máscaras de segmentación y clases de objetos en una sola pasada, con una resolución de entrada de 640x640 píxeles. Qualcomm no entrena el modelo desde cero: parte de la implementación abierta de THU-MIG/yoloe y genera artefactos compilados (vía Qualcomm AI Hub Workbench) para ejecución en NPU con cuantizaciones float, w8a16 y w8a8.

La relevancia de esta ficha es doble. Por un lado, demuestra el flujo actual de despliegue de modelos de visión en el borde: un modelo de segmentación de 103 MB en float puede ejecutarse en 4,3 ms por inferencia en un Snapdragon 8 Elite Gen 5 con cuantización w8a8, lo que habilita aplicaciones en tiempo real en móvil, automoción y robótica. Por otro, ilustra las restricciones prácticas del ecosistema: la licencia AGPL-3.0 del modelo original impide a Qualcomm distribuir los pesos pre-exportados, de modo que el usuario debe compilarlos por su cuenta con la librería `qai_hub_models`.

El modelo no es un LLM ni un modelo multimodal de lenguaje: es un detector-segmentador visual puro. Por tanto, las filas de contexto, idiomas o tool calling de la plantilla no aplican y se marcan como no disponibles. Lo que sí aporta es una vía reproducible para llevar segmentación abierta a hardware móvil con métricas de latencia y memoria publicadas por chipset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOE-v8L-SEG (detector-segmentador de una etapa, familia YOLO; variante "Large" de YOLOE) |
| Parametros totales | 53,47 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640x640) |
| Tipos de cuantizacion | float, w8a16, w8a8 (compilados vía Qualcomm AI Hub) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las clases detectadas dependen del dataset de entrenamiento) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (checkpoint original); exportación a ONNX para ejecución en NPU Qualcomm; no se distribuyen artefactos pre-exportados por restricciones de licencia |
| Resolucion de entrada | 640x640 |
| Tamano del modelo (float) | 103 MB |
| Runtime de referencia | ONNX sobre NPU Qualcomm |
| Pipeline | image-segmentation |
| Tarea | Segmentación semántica / instancias con cajas y clases |

## Arquitectura y entrenamiento

YOLOE-v8L-SEG pertenece a la familia YOLOE (You Only Look Once with Everything), una evolución de YOLOv8 orientada a detección y segmentación abiertas (open-vocabulary). La arquitectura es un detector de una etapa con cabeza de segmentación, que produce simultáneamente cajas, máscaras por instancia y etiquetas de clase a partir de una imagen de 640x640. La variante "L" (Large) del checkpoint implica 53,47 M de parámetros, un tamaño intermedio dentro de la familia YOLOE, que equilibra precisión y coste computacional para despliegue en el borde.

Qualcomm no documenta en esta model card los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación), y al tratarse de un modelo de visión esos conceptos no aplican directamente. La innovación técnica relevante en este empaquetado no está en el entrenamiento, sino en el pipeline de compilación y perfilado: Qualcomm AI Hub Workbench compila el checkpoint a ONNX, lo cuantiza a w8a16 y w8a8, y lo perfila en NPU de distintos chipsets, publicando latencia y pico de memoria por dispositivo. El modelo original de THU-MIG/yoloe incorpora capacidades de vocabulario abierto (detección de clases no vistas en entrenamiento mediante prompts textuales o visuales), aunque la model card de Qualcomm no detalla si esa capacidad se preserva tras la exportación.

## Capacidades

- Detección de objetos: predice cajas delimitadoras con clase asociada sobre imágenes de 640x640.
- Segmentación de instancias: genera máscaras por objeto, no solo cajas, lo que permite recortes precisos y análisis de forma.
- Segmentación semántica: pipeline declarado como `image-segmentation`.
- Vocabulario abierto (heredado de YOLOE): el modelo original soporta detección de clases arbitrarias mediante prompts; la model card de Qualcomm no confirma el grado de preservación tras la exportación.
- Ejecución en tiempo real en NPU: latencias de milisegundos por inferencia en chipsets Snapdragon y Dragonwing (ver tabla de rendimiento).
- Despliegue en Android y en dispositivos de borde: etiquetas `real_time` y `android`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Segmentación en tiempo real en aplicaciones Android: con latencias de 4,3 a 12 ms por frame en Snapdragon 8 Elite Gen 5 (w8a8 y float respectivamente), el modelo puede procesar vídeo a 30-60 fps en el propio dispositivo sin enviar imágenes a la nube, lo que reduce latencia y preserva privacidad.
- Realidad aumentada y edición de foto/vídeo en móvil: las máscaras por instancia permiten recortar sujetos, aplicar fondos virtuales o efectos selectivos en tiempo real sobre la cámara del teléfono.
- Automoción y robótica de borde: en plataformas Dragonwing (QCS8550, IQ-9075, Q-8750) el modelo corre en NPU con 8,5-31 ms por inferencia, adecuado para percepción de obstáculos, segmentación de carril o manipulación robótica con presupuesto de cómputo y energía limitado.
- Inspección visual industrial: segmentación de defectos o piezas en líneas de producción con cámaras conectadas a SoCs Qualcomm, usando cuantización w8a8 para maximizar throughput.
- Análisis de imágenes médicas o científicas en el borde: las máscaras de instancia permiten medir áreas y formas; la resolución 640x640 limita el detalle fino, por lo que encaja en cribados preliminares más que en diagnóstico.
- Preprocesado para pipelines multimodales: usar las máscaras y cajas como etapa de detección/segmentación previa a un modelo de visión-lenguaje que describa o razone sobre regiones concretas, ahorrando cómputo al no procesar la imagen completa.
- Aplicaciones de conteo y seguimiento: detección y segmentación de personas, vehículos o productos en cámaras de vigilancia o retail, con la ventaja de ejecución local en el dispositivo.

## Benchmarks y rendimiento

La model card no publica métricas de precisión (mAP, IoU) sobre datasets estándar. Sí publica latencia y pico de memoria por chipset, que se reproducen a continuación (selección representativa; la tabla completa está en la model card original).

| Chipset | Precision | Inferencia (ms) | Pico de memoria (MB) | Unidad |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | float | 12,044 | 12 - 239 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | w8a16 | 9,937 | 6 - 332 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | w8a8 | 4,319 | 0 - 249 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | float | 17,357 | 12 - 220 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | w8a8 | 5,269 | 3 - 245 | NPU |
| Snapdragon X2 Elite | float | 15,729 | 17 - 17 | NPU |
| Snapdragon X2 Elite | w8a8 | 4,353 | 3 - 3 | NPU |
| Snapdragon X Elite | float | 31,142 | 88 - 88 | NPU |
| Snapdragon X Elite | w8a8 | 9,657 | 45 - 45 | NPU |
| Snapdragon 8 Gen 3 Mobile | float | 24,286 | 1 - 279 | NPU |
| Snapdragon 8 Gen 3 Mobile | w8a8 | 6,513 | 3 - 327 | NPU |
| Snapdragon 8 Gen 1 Mobile | float | 54,037 | 17 - 336 | NPU |
| Snapdragon 8 Gen 1 Mobile | w8a8 | 12,304 | 0 - 324 | NPU |
| Dragonwing IQ-9075 | float | 47,382 | 12 - 20 | NPU |
| Dragonwing IQ-9075 | w8a8 | 8,506 | 2 - 7 | NPU |
| Dragonwing Q-8750 | float | 17,357 | 12 - 220 | NPU |
| Dragonwing Q-8750 | w8a8 | 12,102 | 6 - 320 | NPU |
| Dragonwing QCS8550 (proxy) | float | 31,204 | 0 - 94 | NPU |
| Dragonwing QCS8550 (proxy) | w8a8 | 9,267 | 0 - 49 | NPU |
| Dragonwing Q-6690 | w8a16 | 341,082 | 9 - 378 | NPU |

No se han publicado resultados de benchmarks de precisión (mAP, IoU) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU de escritorio; el modelo está pensado para NPU integrada. El checkpoint float ocupa 103 MB, y la memoria pico medida en NPU oscila entre 0 y 409 MB según chipset y precisión.
- GPU recomendadas: no disponibles para este empaquetado; el objetivo declarado son NPU Qualcomm (Snapdragon 8 Elite, 8 Gen 3, 8 Gen 1, X Elite, X2 Elite; Dragonwing QCS6490, QCS8450, QCS8550, IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790, Q-8750).
- ¿Cabe en consumer GPU? El checkpoint float (103 MB) cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) para ejecución PyTorch/ONNX, pero el rendimiento óptimo se obtiene en NPU Qualcomm. No hay métricas publicadas para GPU de escritorio.
- Opciones de despliegue: Qualcomm AI Hub Models (`qai_hub_models`) para compilar y exportar; ONNX Runtime con ejecución en NPU Qualcomm; PyTorch para el checkpoint original; el repositorio THU-MIG/yoloe para uso en GPU.
- Latencia y throughput: 4,3 ms (w8a8) a 12 ms (float) por inferencia en Snapdragon 8 Elite Gen 5; 31-54 ms en Snapdragon 8 Gen 1; 8,5-47 ms en Dragonwing IQ-9075 según precisión; 341 ms en Dragonwing Q-6690 con w8a16, el caso más lento documentado. El throughput teórico a 30 fps requiere inferencias ≤33 ms, umbral que cumplen la mayoría de chipsets listados con w8a8.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| YOLOE-Segmentation (Qualcomm) | 53,47 M | 640x640 | AGPL-3.0 | Segmentación abierta optimizada para NPU Qualcomm | Pesos no distribuidos; compilar con qai_hub_models |
| YOLOE-v8L-SEG (THU-MIG, original) | 53,47 M (mismo checkpoint) | 640x640 | AGPL-3.0 | Segmentación abierta, referencia en GPU | Disponible en GitHub THU-MIG/yoloe |
| YOLOv8-Seg (Ultralytics) | ~11-70 M según variante | 640x640 | AGPL-3.0 | Segmentación cerrada (clases fijas) | Disponible vía Ultralytics |
| SAM 2 (Meta) | ~40-224 M según variante | variable | Apache-2.0 (versiones recientes) | Segmentación promptable de propósito general | Disponible en Meta AI |

La comparación con SAM 2 es pertinente por tarea (segmentación) pero no por régimen de despliegue: SAM 2 prioriza generalidad y prompts, mientras que YOLOE-Segmentation prioriza latencia en el borde. Frente a YOLOv8-Seg, la ventaja de YOLOE es el vocabulario abierto; la desventaja, un ecosistema de despliegue en NPU menos maduro fuera de Qualcomm.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso en red o distribución de una aplicación que incorpore el modelo puede obligar a liberar el código bajo la misma licencia. Para uso comercial propietario es necesario evaluar una licencia alternativa con Ultralytics/THU-MIG.
- No se distribuyen los pesos pre-exportados: el usuario debe compilar y exportar el modelo por su cuenta con `qai_hub_models`, lo que añade fricción y requiere cuenta en Qualcomm AI Hub.
- Sin métricas de precisión publicadas: no hay mAP ni IoU en la model card, por lo que no se puede evaluar la calidad de detección/segmentación sin ejecutar una validación propia.
- Resolución fija de 640x640: objetos pequeños o imágenes de alta resolución requieren redimensionado, con pérdida de detalle.
- Dependencia de hardware Qualcomm para el rendimiento declarado: las latencias publicadas son en NPU Snapdragon/Dragonwing; en otras plataformas el rendimiento no está caracterizado.
- Riesgo de alucinación visual: como todo detector, puede producir falsos positivos y máscaras imprecisas en escenas con oclusión, baja iluminación o clases poco representadas en entrenamiento.
- Sesgos del dataset de entrenamiento: las clases y el rendimiento por clase dependen de los datos originales de YOLOE, no documentados en esta model card.
- Idiomas: no aplica; el modelo no procesa texto, aunque la variante de vocabulario abierto del original puede aceptar prompts textuales cuyo soporte multilingüe no está confirmado.
- Caso atípico de latencia: Dragonwing Q-6690 con w8a16 muestra 341 ms, muy por encima del resto; conviene validar el chipset objetivo antes de comprometerse con un presupuesto de tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/YOLOE-Segmentation
- Repositorio Qualcomm AI Hub Models (YOLOE-Segmentation): https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/yoloe_seg
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementación original YOLOE (THU-MIG): https://github.com/THU-MIG/yoloe
- Paper YOLOE (arXiv:2503.07465): https://arxiv.org/abs/2503.07465
- Ultralytics (YOLO): https://www.ultralytics.com/
- Qualcomm (sitio corporativo): https://www.qualcomm.com/
