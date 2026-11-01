# ParsaVictor/pcb-bare-board-defect-detection-yolo26

## Resumen

PCB Bare-Board Defect Detection (YOLO26s) es un detector de objetos basado en la familia YOLO26 y empaquetado con la librería Ultralytics, desarrollado por el usuario ParsaVictor. Su tarea concreta es localizar defectos de fabricación en placas de circuito impreso desnudas, es decir, en la inspección previa al montaje de componentes: agujeros faltantes, mordeduras de ratón, circuitos abiertos, cortocircuitos, rebabas, cobre espurio y agujeros de pasador. Forma parte de una suite de inspección PCB más amplia que incluye un modelo hermano para defectos de soldadura.

El modelo se entrenó sobre el dataset `ParsaVictor/pcb-bare-board-defect-detection` con resolución de entrada de 1024 píxeles, 80 épocas y augmentación en línea, alcanzando un mAP50 de 0,928 y un mAP50-95 de 0,617 en el split de test. Es relevante para el ámbito de la inspección visual automatizada (AOI) en fabricación electrónica, donde los detectores ligeros de una etapa permiten integrar control de calidad en línea sin infraestructura de GPU de gran escala.

La ficha se basa exclusivamente en la model card y los metadatos publicados en HuggingFace; no se dispone de información sobre el número exacto de parámetros, la composición detallada del dataset ni los detalles internos de la arquitectura YOLO26.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26 (familia YOLO de detección de objetos de una etapa, variante "s"), librería Ultralytics |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en formato `.pt` de PyTorch/Ultralytics; se puede exportar a otros formatos vía Ultralytics, no confirmado en la model card) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | `research-use-mixed-sources` (uso de investigación/desarrollo; contacto con el autor antes de uso comercial) |
| Formato de pesos | `.pt` (checkpoint de Ultralytics), distribuido como `best.pt` |
| Resolución de entrada | 1024 px (imgsz de entrenamiento) |
| Clases detectadas | 7: `missing_hole`, `mouse_bite`, `open_circuit`, `short`, `spur`, `spurious_copper`, `pin_hole` |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26 en su variante "s" (small), un detector de objetos de una sola etapa implementado sobre la librería Ultralytics. Se entrenó con resolución de imagen de 1024 píxeles durante 80 épocas, con la mejor métrica registrada en la época 17, augmentación en línea y una planificación de `close_mosaic`. No se detalla en la información disponible el número de tokens, el volumen de imágenes del dataset ni si se aplicaron técnicas adicionales como destilación o ajuste fino con datos sintéticos.

El dataset de entrenamiento es `ParsaVictor/pcb-bare-board-defect-detection`, de fuentes mixtas según la licencia declarada. El modelo forma parte de una suite con un modelo hermano para defectos de soldadura (`pcb-solder-defect-detection-yolo26`). No se han publicado detalles sobre la composición del dataset, el desglose por clase ni la procedencia de las imágenes.

## Capacidades

- Detección de objetos en imágenes de placas de circuito impreso desnudas, con cajas delimitadoras y puntuaciones de confianza.
- Clasificación en siete categorías de defecto: agujero faltante, mordedura de ratón, circuito abierto, cortocircuito, rebaba, cobre espurio y agujero de pasador.
- Umbrales de confianza por clase ajustados por F1 óptimo en validación, con un umbral global de respaldo de 0,465.
- Inferencia a resolución de 1024 px, adecuada para defectos de pequeño tamaño en placas.
- Integración con el ecosistema Ultralytics: carga con `YOLO(...)`, predicción con `model.predict(...)` y visualización con `results[0].show()`.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento; es un detector visual puro.

## Casos de uso

- Inspección visual automatizada (AOI) en línea de fabricación: el modelo se ejecuta sobre las imágenes capturadas por la cámara de la estación AOI para marcar defectos en placas desnudas antes del montaje, con umbrales por clase que reducen falsos positivos en las categorías más fiables.
- Control de calidad en entrada de material: verificación de lotes de placas recibidas de proveedores, detectando agujeros faltantes y circuitos abiertos antes de que el material entre en la línea de montaje.
- Clasificación y triaje de rechazos: integración en un pipeline que etiqueta automáticamente las placas defectuosas y las separa por tipo de defecto para su análisis posterior por el equipo de calidad.
- Generación de informes de defectos: uso de las detecciones y sus coordenadas para poblar registros de trazabilidad y estadísticas de defectos por lote y por tipo.
- Prototipado rápido de sistemas de inspección: al ser un checkpoint Ultralytics de una etapa, se puede desplegar en una estación con GPU de consumo para validar un flujo AOI antes de invertir en un sistema comercial.
- Investigación en visión industrial: base para experimentos de aumento de datos, ajuste fino con nuevas clases de defectos o comparación de arquitecturas YOLO en tareas de inspección PCB.
- Detección de cortocircuitos y cobre espurio en placas de prototipo: útil en talleres de fabricación rápida para revisar placas antes de enviarlas a producción.

## Benchmarks y rendimiento

| Split | mAP50 | mAP50-95 |
|---|---|---|
| val | 0,895 | 0,601 |
| test | 0,928 | 0,617 |

Umbrales de confianza F1-óptimos por clase en validación:

| Clase | Umbral |
|---|---|
| missing_hole | 0,745 |
| mouse_bite | 0,484 |
| open_circuit | 0,770 |
| short | 0,406 |
| spur | 0,382 |
| spurious_copper | 0,330 |
| pin_hole | 0,571 |

Umbral global de respaldo: 0,465.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un detector YOLO de variante "s" a 1024 px, es previsible que quepa en GPU de consumo, pero no se confirma en la model card.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño de la variante "s" es plausible, pero no se aporta dato.
- Opciones de despliegue: la model card solo documenta el uso mediante Ultralytics (`YOLO` y `model.predict`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el propio autor menciona un modelo hermano de la misma suite, `pcb-solder-defect-detection-yolo26`, orientado a defectos de soldadura en lugar de placas desnudas, pero no se aportan sus métricas ni sus especificaciones.

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PCB Bare-Board Defect Detection (YOLO26s) | Detección de defectos en PCB desnuda | no disponible | no aplica | research-use-mixed-sources | HuggingFace |
| pcb-solder-defect-detection-yolo26 | Detección de defectos de soldadura | no disponible | no aplica | no disponible | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La clase `short` tiene un recall más débil, con umbral F1-óptimo de 0,406 y menor confianza que la mayoría de clases.
- La clase `open_circuit` baja a un recall de aproximadamente el 70 % en su umbral F1-óptimo (0,77); si prima el recall sobre la precisión, el autor recomienda usar un umbral global más bajo.
- El modelo está entrenado exclusivamente para placas desnudas; no cubre defectos de soldadura ni de componentes montados.
- La licencia `research-use-mixed-sources` restringe el uso comercial: es necesario contactar con el autor antes de cualquier aplicación comercial.
- No se documentan sesgos específicos, pero al tratarse de un dataset de fuentes mixtas y sin composición publicada, el rendimiento puede degradarse en placas con materiales, iluminación o cámaras distintas a las del entrenamiento.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos en la detección; los umbrales por clase deben calibrarse sobre el dominio de producción.
- No se dispone de información sobre el número de parámetros, el volumen del dataset ni la latencia, lo que dificulta estimar costes de despliegue.
- El repositorio tiene un tamaño de 0,0 GB según los metadatos, lo que puede indicar que los pesos no están alojados en el repositorio principal o que el tamaño reportado no es fiable; conviene verificar la descarga de `best.pt` antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ParsaVictor/pcb-bare-board-defect-detection-yolo26
- Dataset de entrenamiento: https://huggingface.co/datasets/ParsaVictor/pcb-bare-board-defect-detection
- Licencia del dataset: https://huggingface.co/datasets/ParsaVictor/pcb-bare-board-defect-detection/blob/main/LICENSE.md
- Modelo hermano (defectos de soldadura): https://huggingface.co/ParsaVictor/pcb-solder-defect-detection-yolo26
- Suite de inspección PCB: https://huggingface.co/ParsaVictor/pcb-inspection-suite
