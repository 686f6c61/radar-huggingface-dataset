# bhavibhatt/weldvision-ensemble

## Resumen

WeldVision Ensemble es un sistema de inspección de defectos superficiales en soldaduras basado en un conjunto (ensemble) de cuatro modelos de segmentación de imágenes YOLO. Desarrollado por Bhavyang Bhatt (bhavibhatt) y publicado bajo licencia Apache-2.0, el modelo está diseñado para detectar y segmentar defectos típicos de soldadura, como grietas y salpicaduras, a partir de imágenes capturadas en entornos industriales. Se presenta como una prueba de concepto (proof-of-concept) que ejecuta la inferencia de forma local, sin necesidad de endpoints en la nube, y proporciona reglas de decisión prototipo para clasificar la calidad de la soldadura en PASS, REVIEW o FAIL.

La relevancia actual del modelo reside en la creciente demanda de automatización del control de calidad en fabricación, donde la inspección visual por visión por computadora puede reducir costes y tiempos frente a la inspección manual. Aunque el repositorio es pequeño (0,1 GB) y carece de documentación detallada sobre el entrenamiento, la arquitectura concreta de los YOLO utilizados o los datos de entrenamiento, su enfoque en un dominio específico y su licencia permisiva lo convierten en una base interesante para desarrolladores que quieran experimentar con inspección industrial de soldadura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (versión no especificada; se utilizan cuatro modelos .pt) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos .pt originales) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de los modelos que componen el ensemble. Se sabe que son cuatro modelos YOLO para segmentación de imágenes, almacenados como archivos `.pt` (PyTorch). YOLO (You Only Look Once) es una familia de redes neuronales convolucionales (CNN) de una sola pasada que predicen simultáneamente cajas delimitadoras, clases y, en su variante de segmentación, máscaras de píxeles. El ensemble combina las predicciones de un modelo general (`best.pt` y `best_v0.pt`) y dos especialistas (`crack_specialist.pt` para grietas y `spatters_specialist.pt` para salpicaduras), lo que sugiere una estrategia de votación o fusión de salidas para mejorar la robustez.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens (no aplica), el proceso de optimización (RLHF, DPO, etc.) ni innovaciones técnicas específicas. El autor solo indica que la inferencia se realiza localmente tras descargar los pesos desde el Hub de Hugging Face, y que las reglas de puntuación y decisión (PASS/REVIEW/FAIL) son lógica de prototipo, no criterios de aceptación según códigos de soldadura.

## Capacidades

- Segmentación de defectos superficiales en soldaduras: detecta y segmenta regiones de interés como grietas y salpicaduras.
- Inferencia local sin dependencia de servicios en la nube, utilizando la librería Ultralytics y `huggingface_hub` para la descarga de pesos.
- Integración sencilla mediante una API de Python: `WeldVision.from_pretrained()` y `model.predict()`.
- Clasificación de calidad de soldadura en tres categorías (PASS, REVIEW, FAIL) mediante reglas de decisión prototipo.
- Capacidad de ensamblaje (ensemble) al combinar cuatro modelos YOLO para aumentar la precisión.
- No se reporta soporte para tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües (al ser un modelo de visión).

## Casos de uso

- **Inspección de calidad en línea de producción**: integrado en una línea de fabricación, el modelo puede analizar imágenes de soldaduras capturadas por cámaras fijas y clasificar automáticamente cada punto de soldadura como PASS o REVIEW, reduciendo la carga de trabajo de los inspectores humanos.
- **Control de calidad en talleres de reparación**: los técnicos pueden usar una aplicación móvil o portátil con el modelo para evaluar rápidamente soldaduras reparadas in situ, obteniendo una decisión preliminar antes de una inspección formal.
- **Documentación de defectos**: al segmentar grietas y salpicaduras, el modelo puede generar anotaciones visuales que se adjuntan a informes de inspección, facilitando el análisis posterior y el trazado de incidentes.
- **Formación de inspectores**: el sistema puede utilizarse como herramienta educativa para mostrar ejemplos de defectos de soldadura y sus regiones segmentadas, ayudando a estudiantes o técnicos novatos a identificar patrones.
- **Investigación en visión industrial**: sirve como punto de partida para investigadores que quieran desarrollar ensembles de YOLO para detección de defectos en otros materiales o procesos, dado que el código está disponible en el Hub.
- **Auditoría de procesos de soldadura**: integrado en un sistema de gestión de calidad, permite auditar lotes de soldaduras históricas analizando imágenes archivadas y detectar problemas recurrentes en el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de precisión, recall, mAP ni comparaciones con otros modelos en la model card o en el repositorio.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio (0.1 GB) sugiere que los pesos son pequeños (probablemente modelos YOLO de tamaño nano o pequeño), por lo que podría ejecutarse en GPUs con menos de 4 GB de VRAM, pero no se confirma.
- **GPU recomendada**: no especificada. Los modelos YOLO de segmentación pequeños pueden funcionar en GPUs como RTX 3060 o superiores, así como en CPUs para inferencia en lotes reducidos.
- **Compatibilidad con GPU de consumo**: probablemente sí, dado el tamaño de los pesos, aunque no se garantiza.
- **Opciones de despliegue**: la librería Ultralytics permite exportar a ONNX, TensorRT o CoreML, y ejecutar con `predict` en Python. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable a modelos de visión).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares de inspección de soldadura. La mayoría de soluciones comerciales (como sistemas de inspección por visión industrial) son propietarias y no publican pesos. Alternativas open source como los modelos de detección de defectos de soldadura basados en YOLO en otros repositorios no se han identificado en la búsqueda.

## Limitaciones y advertencias

- **Prueba de concepto**: el autor indica explícitamente que el sistema es un prototipo y las reglas de decisión no son criterios de aceptación según códigos de soldadura. No debe usarse como sustituto de la inspección humana cualificada.
- **Sesgos potenciales**: no se ha documentado el dataset de entrenamiento, por lo que los defectos fuera de los tipos representados (grietas, salpicaduras) pueden no ser detectados correctamente.
- **Riesgo de alucinación**: al ser un modelo de visión, puede generar falsos positivos o negativos; las predicciones deben ser validadas por un experto.
- **Limitaciones de contexto**: no aplica, pero el modelo solo acepta imágenes de entrada y no procesa texto ni otro tipo de datos.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de licencia original.
- **Caveat para producción**: la ausencia de benchmarks y de detalles de entrenamiento impide conocer su robustez en entornos industriales reales. Se recomienda realizar una validación exhaustiva con datos propios antes de desplegarlo en producción.

## Enlaces

- Hugging Face: [bhavibhatt/weldvision-ensemble](https://huggingface.co/bhavibhatt/weldvision-ensemble)
- GitHub (proyecto relacionado): [WeldVision-AI](https://github.com/Abdulla-B-Official/WeldVision-AI)
- Aplicación web WeldVision AI (Blink): https://blink.new/p/weldvision-ai-app-edspby9j
- Space de Hugging Face con modelo similar: [anjanid/weld-inspector](https://huggingface.co/spaces/anjanid/weld-inspector)
