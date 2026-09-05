# imbcmdth/rfdetr-onnx

## Resumen

RF-DETR es un modelo de visión por computador desarrollado por Roboflow para detección de objetos y segmentación de instancias. Este repositorio de HuggingFace contiene exportaciones fieles a ONNX de dos variantes de RF-DETR, realizadas por imbcmdth mediante el paquete `rfdetr` (versión 1.10.0). Las variantes incluidas son RF-DETR Large (2026), con 33,9 millones de parámetros y una precisión de 56,5 de COCO AP, y RF-DETR Seg Large, con 36,2 millones de parámetros y 47,1 de COCO AP. Ambas utilizan una arquitectura DETR basada en transformer y no requieren NMS en el postprocesado. La exportación a ONNX permite ejecutar el modelo con ONNX Runtime, sin dependencia de PyTorch. La licencia Apache-2.0 para estos tamaños facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DETR) |
| Parametros totales | 33,9 M (RF-DETR Large 2026) / 36,2 M (RF-DETR Seg Large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision) |
| Tipos de cuantizacion | fp32 |
| Idiomas soportados | no disponibles (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (.onnx) |
| Variantes incluidas | RF-DETR Large (2026) y RF-DETR Seg Large |
| Precision COCO AP | 56,5 (Large 2026) / 47,1 (Seg Large) |
| Tamano de entrada | 1x3x704x704 (Large 2026) / 1x3x504x504 (Seg Large) |
| Salidas | dets, labels (y masks en Seg Large) |
| Opset / IR | opset 17, IR 8 |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

RF-DETR es un modelo de detección de objetos basado en la arquitectura DETR (Detection Transformer). Utiliza un codificador y un decodificador transformer para predecir un conjunto de detecciones directas, sin necesidad de NMS. Las exportaciones incluidas se realizaron mediante el método `model.export(format='onnx')` del paquete `rfdetr`, con opset 17. La información disponible no detalla el proceso de entrenamiento más allá de que los pesos proceden de los checkpoints oficiales de Roboflow. La model card indica que las exportaciones son "fieles" y que el grafo no incorpora el preprocesado: la entrada debe normalizarse con la media (0,485, 0,456, 0,406) y la desviación típica (0,229, 0,224, 0,225) de ImageNet.

## Capacidades

- Detección de objetos de 91 categorías de COCO. `labels` son logits crudos en la numeración de 91 ranuras de COCO (ranura 1: persona, 62: silla, 72: TV); la confianza se obtiene aplicando `sigmoid` al logit más alto.
- Segmentación de instancias en la variante RF-DETR Seg Large, con máscaras como logits crudos a resolución de 126x126; un píxel pertenece a la instancia cuando el logit cruza cero.
- Postprocesado sin NMS, gracias al cabezal DETR que evita duplicados.
- Los bounding boxes se devuelven como fracciones de la imagen en formato `cx, cy, w, h`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingües: no aplica (modelo de visión).

## Casos de uso

- Inspección de calidad en producción industrial: el modelo detecta defectos o malformaciones en piezas de una línea de montaje. Su salida de bounding boxes y máscaras permite localizar y medir anomalías, y la exportación a ONNX facilita integrarlo en sistemas de visión con ONNX Runtime sin dependencias de PyTorch.
- Vigilancia y análisis de video: con una entrada de 704x704, puede detectar personas y objetos en cámaras de vigilancia. Al no requerir NMS, es adecuado para flujos de video en tiempo real con baja latencia.
- Robots y automatización: gracias a su tamaño compacto y a la compatibilidad con ONNX Runtime, puede ejecutarse en placas embebidas como las de la serie Jetson, permitiendo a un robot localizar y manipular objetos.
- Análisis de imágenes médicas mediante transferencia: aunque COCO no es específico para el dominio médico, la arquitectura DETR admite ajuste fino. La versión ONNX puede desplegarse en entornos hospitalarios donde no siempre es viable instalar un framework completo de entrenamiento.
- Agricultura de precisión: detección y segmentación de cultivos o plagas en imágenes tomadas desde drones. La variante Seg Large ofrece máscaras de instancia que ayudan a estimar cobertura o densidad de plantas.
- Aplicaciones móviles: mediante ONNX Runtime Mobile, el modelo puede ejecutarse en dispositivos móviles para detección de objetos en tiempo real, aprovechando su tamaño de archivo de aproximadamente 130 MB.

## Benchmarks y rendimiento

| Modelo | Parametros | COCO AP |
|---|---|---|
| RF-DETR Large (2026) | 33,9 M | 56,5 |
| RF-DETR Seg Large | 36,2 M | 47,1 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que se trata de un modelo de visión.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño de los archivos (128 MB para RF-DETR Large y 138 MB para RF-DETR Seg Large) sugiere que la inferencia en fp32 puede ejecutarse en GPUs modestas, pero no se han proporcionado cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPUs de consumo: no disponible, aunque el número de parámetros y la resolución de entrada apuntan a que es viable en GPUs de consumo modernas.
- Opciones de despliegue: ONNX Runtime, tanto en Python como en C++ (según repositorios de terceros). No se mencionan vLLM, TGI ni llama.cpp, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | COCO AP | Licencia | Disponibilidad |
|---|---|---|---|---|
| RF-DETR Large (2026) | 33,9 M | 56,5 | Apache-2.0 | ONNX en este repo |
| RF-DETR Seg Large | 36,2 M | 47,1 | Apache-2.0 | ONNX en este repo |
| RF-DETR XLarge | 126 M (segun la model card) | no disponible | PML 1.0 | no exportado en este repo |
| RF-DETR 2XLarge | no disponible | no disponible | PML 1.0 | no exportado en este repo |

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado en la información disponible.
- Riesgo de alucinación: al ser un modelo de detección, no genera texto; los falsos positivos en la detección pueden considerarse "detecciones alucinadas", especialmente en dominios alejados de COCO.
- Limitaciones de contexto o idioma: no aplica (modelo de visión). No se especifican idiomas.
- Restricciones de licencia: las variantes incluidas son Apache-2.0, pero las variantes XLarge y 2XLarge no se han exportado aquí por estar sujetas a la licencia PML 1.0 de Roboflow.
- Caveat importante para producción: el grafo ONNX no incluye el preprocesado. Hay que aplicar externamente el estirado a cuadrado, el escalado a 0..1 y la normalización con los valores de ImageNet.
- Los tamaños de entrada son fijos (704x704 y 504x504). La exportación no admite tamaño de entrada dinámico en la información proporcionada.
- No hay NMS en el postprocesado; el resultado depende de que se use la cabecera DETR tal como se exportó.
- Los nombres de tamaño cambiaron en 2026: el antiguo "large" (487 MB fp32, 126 M parámetros) corresponde ahora al XLarge. Se recomienda verificar el conteo de parámetros y los tamaños de archivo para evitar confusiones.

## Enlaces

- HuggingFace: https://huggingface.co/imbcmdth/rfdetr-onnx
- GitHub upstream de RF-DETR: https://github.com/roboflow/rf-detr
- Repositorio de inferencia ONNX de terceros: https://github.com/PierreMarieCurie/rf-detr-onnx
- Repositorio de inferencia ONNX con soporte C++ y FP16: https://github.com/imessam/RF-DETR-ONNX
