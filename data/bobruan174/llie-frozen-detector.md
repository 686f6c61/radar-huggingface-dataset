# BobRuan174/llie-frozen-detector

## Resumen

llie-frozen-detector es un conjunto de pesos de HVI-CIDNet (Yan et al., CVPR 2025) afinado sobre el conjunto de datos LIS (Chen et al., IJCV 2023) para la mejora de imágenes en condiciones de baja luminosidad. Lo desarrolla BobRuan174 como proyecto del curso ENGR 501, partiendo del checkpoint oficial `LOLv2_real/w_perc.pth` y aplicando una función de pérdida auxiliar que mide la distancia L1 entre las características del cuello de un detector YOLO11s congelado (capas 16, 19 y 22) sobre la imagen mejorada y sobre la imagen de referencia con iluminación normal.

El problema que aborda es la desconexión entre métricas de calidad de imagen (PSNR, SSIM) y el rendimiento aguas abajo en tareas de visión por computador: una imagen mejorada puede verse bien y, sin embargo, degradar la detección de objetos. Al mantener el detector congelado y optimizar la similitud de sus representaciones intermedias, el modelo busca que la mejora sea funcional para el pipeline de detección, no solo estética.

Se trata de un artefacto de investigación con tres variantes de pesos (lambda 0, 1 y 10) y un tamaño de repositorio de 0,0 GB, lo que sugiere que los ficheros no están efectivamente alojados o que el repositorio está vacío en el momento de la consulta. No hay información publicada sobre arquitectura detallada, número de parámetros, contexto ni idiomas, ya que no es un modelo de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HVI-CIDNet (red de mejora de imágenes en baja luminosidad, CVPR 2025) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch, `torch.load` sobre la clase `net.CIDNet.CIDNet`) |

## Arquitectura y entrenamiento

La base es HVI-CIDNet, presentada en CVPR 2025 por Yan et al., una red de mejora de imágenes de bajo nivel de luz que opera en un espacio de color HVI (hue, value, intensity) y emplea un esquema de fusión de información con atención. El autor parte del checkpoint oficial entrenado sobre LOLv2_real (`w_perc.pth`) y lo afina sobre el conjunto LIS, que empareja imágenes oscuras con sus correspondientes de iluminación normal y anotaciones de 8 clases de objetos.

La innovación del afinado es la incorporación de una pérdida de características de detector congelado: se calcula la distancia L1 entre las activaciones de las capas 16, 19 y 22 del cuello de un YOLO11s (el detector nunca se actualiza) para la imagen mejorada y para la imagen normal de referencia, y se suma a la pérdida de imagen oficial con un coeficiente lambda. Se exploran tres valores de lambda: 0 (solo pérdida de imagen), 1 y 10. No se detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO, algo que no aplica a este tipo de modelo.

## Capacidades

- Mejora de imágenes capturadas en condiciones de baja luminosidad, con salida en color e intensidad corregidas.
- Preservación de características relevantes para detección de objetos, gracias a la pérdida sobre el cuello de YOLO11s.
- Optimización explícita para una tarea aguas abajo de detección con 8 clases (las del conjunto LIS).
- Tres variantes de pesos con distinto compromiso entre fidelidad de imagen y utilidad para detección.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión multimodal ni audio.

## Casos de uso

- Vigilancia nocturna: el modelo mejora fotogramas de cámaras con poca luz antes de pasarlos a un detector de objetos, reduciendo la pérdida de mAP que se produce al alimentar el detector con imágenes oscuras (0,411 de mAP50 en oscuro frente a 0,625 con la variante lambda 10).
- Vehículos autónomos y ADAS en condiciones de iluminación adversa: preprocesar la señal de cámara para que el detector de peatones y vehículos mantenga su rendimiento en túneles, atardeceres o carreteras sin alumbrado.
- Sistemas de videovigilancia industrial: mejorar imágenes de plantas o almacenes con iluminación deficiente antes de la inspección automática de defectos o del conteo de inventario.
- Robótica móvil: preprocesado de la cámara de un robot que opera en interiores con luz tenue, donde el detector necesita entradas con estadísticas similares a las de su entrenamiento.
- Fotografía computacional y postproceso: generación de versiones mejoradas de imágenes RAW o JPEG subexpuestas para su uso en pipelines de etiquetado o aumento de datos.
- Investigación en mejora de imágenes: servir como referencia reproducible para estudiar la brecha entre métricas de imagen (PSNR) y métricas de tarea (mAP) en el benchmark LIS.
- Aumento de datos para entrenamiento de detectores: generar pares oscuro/claro coherentes con la tarea para ampliar datasets de detección en condiciones nocturnas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test de LIS, evaluados con un YOLO11s congelado y 8 clases:

| Pesos | lambda | mAP50 | PSNR |
|---|---|---|---|
| `lis_ft/image_only/epoch_050.pth` | 0 | 0,594 | 21,45 |
| `lis_ft/yolo_feat/epoch_050.pth` | 1 | 0,616 | 21,50 |
| `lis_ft/yolo_feat_w10/epoch_050.pth` | 10 | 0,625 | 21,45 |
| Referencia: entrada oscura | — | 0,411 | — |
| Referencia: entrada con luz normal | — | 0,719 | — |
| Referencia: HVI-CIDNet original | — | 0,466 | — |

La variante lambda 10 mejora en 0,159 puntos de mAP50 respecto al HVI-CIDNet sin afinar y en 0,214 respecto a la entrada oscura, con un coste nulo en PSNR (21,45 frente a 21,45 de la variante sin pérdida de detector). No se han publicado otros benchmarks (SSIM, LPIPS, latencia) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tipo de red (mejora de imágenes, no un LLM) se espera un consumo moderado, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio no incluye requisitos ni instrucciones de despliegue.
- Opciones de despliegue: carga directa con PyTorch mediante la clase oficial `net.CIDNet.CIDNet` y `model.load_state_dict(torch.load(path))`; no se documentan exportaciones a ONNX, TensorRT ni integraciones con vLLM, llama.cpp u Ollama (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | mAP50 en LIS (YOLO11s congelado) | Licencia | Disponibilidad |
|---|---|---|---|---|
| llie-frozen-detector (lambda 10) | HVI-CIDNet afinado con pérdida de detector | 0,625 | MIT | Pesos en HuggingFace (repo de 0,0 GB) |
| HVI-CIDNet original (LOLv2_real) | Mejora de imágenes | 0,466 | MIT | Código y pesos oficiales en GitHub |
| Entrada oscura sin procesar | Línea base | 0,411 | — | — |
| Entrada con luz normal | Línea base superior | 0,719 | — | — |

No se dispone de comparación con otros métodos de mejora de baja luminosidad (Retinexformer, Zero-DCE, SCI) en la información proporcionada.

## Limitaciones y advertencias

- Proyecto de curso (ENGR 501): no hay evidencia de validación más allá del test de LIS ni de mantenimiento del repositorio.
- El repositorio ocupa 0,0 GB y registra 0 descargas y 0 likes, lo que sugiere que los pesos pueden no estar efectivamente disponibles o que el artefacto está incompleto.
- El afinado está sesgado hacia las 8 clases y la distribución de LIS; el comportamiento en otros dominios (interiores, médicas, satelitales) no está evaluado.
- La pérdida de detector congelado puede sobreajustar las características a YOLO11s; no se ha comprobado la transferencia a otros detectores.
- La mejora de mAP50 (0,625) sigue lejos del techo con luz normal (0,719), por lo que la mejora no sustituye a una captura adecuada.
- No hay información sobre sesgos demográficos, geográficos o de otro tipo en el conjunto LIS.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí de artefactos visuales y de falsos positivos en detección tras la mejora.
- Licencia MIT permite uso comercial, pero al derivar de HVI-CIDNet y de un YOLO11s congelado conviene revisar las licencias de los componentes originales (Ultralytics YOLO tiene su propia licencia AGPL/Enterprise) antes de un despliegue comercial.
- No se documentan requisitos de hardware ni tiempos de inferencia, lo que dificulta planificar producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BobRuan174/llie-frozen-detector
- Código del proyecto: https://github.com/BobRuan/llie-frozen-detector
- HVI-CIDNet (repositorio oficial): https://github.com/Fediory/HVI-CIDNet
- Paper HVI-CIDNet (Yan et al., CVPR 2025): no disponible en la información proporcionada
- Dataset LIS (Chen et al., IJCV 2023): no disponible en la información proporcionada
