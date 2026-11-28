# LibreYOLO/LibreLoopDVRm

## Resumen

LibreLoopDVRm es un modelo de detección de objetos empaquetado para el framework LibreYOLO. Se corresponde con la variante de tamano medio (M) de LoopDet, la familia de detectores del proyecto LoopDVR, desarrollado por The LoopDVR Authors (Great Bay University / Intellindust AI Lab). El modelo detecta las 80 clases del conjunto COCO y emplea una arquitectura DETR con backbone ViT con bucles repetidos (LoopedViT), un encoder híbrido y un decoder DETR también con bucles, con refinamiento FDR.

El repositorio de Hugging Face no contiene pesos entrenados desde cero ni un modelo nuevo: es un reempaquetado de los pesos oficiales `loopdet-m.pth` de la release v1.0 de LoopDVR. La modificación consiste exclusivamente en anadir metadatos de checkpoint de LibreYOLO v1.0 (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`) para que la factoría unificada `LibreYOLO()` enrute el modelo sin heurísticas basadas en el nombre del fichero. Los parámetros aprendidos son idénticos bit a bit al state dict original.

Su relevancia es práctica: permite usar un detector DETR con backbone ViT bucleado dentro del mismo API que YOLO, RF-DETR o RT-DETR, lo que simplifica la evaluación comparativa y el despliegue en pipelines que ya usan LibreYOLO. El tamano del repositorio es de 0,1 GB, coherente con un checkpoint de pesos en formato PyTorch (`.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR con backbone ViT bucleado (LoopedViT) + encoder híbrido + decoder DETR bucleado con refinamiento FDR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), checkpoint LibreYOLO v1.0 |
| Clases | 80 (COCO) |
| Queries del decoder | 300 |
| Tamano de variante | M (medio) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

LoopDet sigue el paradigma DETR: predicción directa de conjuntos de cajas y clases mediante queries aprendidas, sin anchors ni supresión no máxima (NMS) en la fase final. La innovación principal es el uso de pesos compartidos a lo largo de iteraciones repetidas: el backbone es un ViT bucleado (`LoopedViT`) y el decoder DETR también se aplica en bucle, con un mecanismo de refinamiento FDR. Entre ambos se sitúa un encoder híbrido. El modelo produce 300 queries para las 80 clases de COCO.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (más allá de COCO como objetivo de evaluación), ni sobre si se emplearon técnicas de RLHF/DPO (no aplicables a un detector). Tampoco se detalla la función de pérdida ni el esquema de asignación de etiquetas. El repositorio de Hugging Face no aporta datos de entrenamiento propios: los pesos provienen del release oficial de LoopDVR (commit `f2aba1f122029e4db757b69cd37fc5a4909db34e`).

## Capacidades

- Detección de objetos en imágenes para las 80 clases de COCO.
- Predicción de cajas delimitadoras y clases en un solo paso (paradigma DETR, sin NMS).
- Backbone ViT con pesos compartidos entre iteraciones, lo que reduce el número de parámetros efectivos frente a un ViT apilado equivalente.
- Decoder bucleado con refinamiento FDR para mejorar progresivamente las predicciones.
- Integración con el API unificado de LibreYOLO (`LibreYOLO("LibreLoopDVRm.pt")`), con soporte de `save=True` para guardar resultados visuales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión por computador.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la detección.

## Casos de uso

- Detección de objetos en pipelines de visión existentes: al cargarse mediante `LibreYOLO()`, el modelo puede sustituir a un YOLO o RT-DETR en un pipeline ya escrito sin cambiar el código de integración, lo que facilita pruebas A/B de detectores.
- Evaluación comparativa de arquitecturas DETR: investigadores que quieran medir el efecto del backbone bucleado frente a backbones convencionales pueden usar este checkpoint como referencia de la variante M de LoopDet.
- Prototipado rápido de aplicaciones de detección: con `pip install libreyolo` y una llamada a `model("image.jpg", save=True)` se obtienen cajas y clases sobre imágenes, adecuado para demos y validación de conceptos.
- Anotación asistida de datasets: el modelo puede preetiquetar imágenes con las 80 clases COCO para su posterior revisión humana, reduciendo el coste de anotación en proyectos que trabajen con categorías estándar.
- Monitorización de vídeo o imágenes en entornos con recursos moderados: el repositorio de 0,1 GB y la variante M sugieren un checkpoint manejable para despliegues en servidor; la ausencia de NMS simplifica el postprocesado.
- Integración en herramientas de análisis de imágenes dentro de aplicaciones Python: al ser un paquete de PyPI (`libreyolo`), se puede incorporar como dependencia en servicios backend que necesiten detección de objetos sin gestionar múltiples frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de AP, latencia ni comparaciones numéricas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,1 GB) corresponde al checkpoint en disco, no a la VRAM necesaria en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si cabe en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: el modelo está pensado para la librería LibreYOLO (`pip install libreyolo`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreLoopDVRm | no disponible | no aplica | no disponible | Apache 2.0 | Hugging Face (LibreYOLO/LibreLoopDVRm) |
| LoopDVR LoopDet (upstream, variante M) | no disponible | no aplica | no disponible | Apache 2.0 | GitHub (Siruuui/LoopDVR release v1.0) |
| YOLO (familia, via LibreYOLO) | no disponible | no aplica | no disponible | MIT (librería LibreYOLO) | PyPI / GitHub |
| RF-DETR (via LibreYOLO) | no disponible | no aplica | no disponible | no disponible | PyPI / GitHub |

No se dispone de datos numéricos de parámetros ni de rendimiento para establecer una comparación cuantitativa. La comparación relevante es funcional: LibreLoopDVRm es el mismo modelo que el LoopDet M upstream, con metadatos añadidos para el enrutado automático en LibreYOLO.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; cualquier categoría fuera de ese conjunto no será reconocida.
- No se han publicado métricas de precisión (AP, AP50, AP75) en la información disponible, por lo que no se puede validar su rendimiento frente a otros detectores sin evaluarlo.
- Al ser un reempaquetado, cualquier limitación del LoopDet M original se hereda sin cambios; el wrap no corrige ni mejora el modelo.
- No se documentan sesgos del dataset de entrenamiento más allá de la cobertura de COCO, que está desequilibrada hacia ciertas categorías y contextos.
- Riesgo de falsos positivos y negativos inherente a los detectores DETR; la ausencia de NMS puede producir solapamientos entre queries en escenas densas.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright de The LoopDVR Authors y los ficheros `LICENSE` y `NOTICE` del repositorio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-27; no hay evidencia de uso en producción ni de validación comunitaria.
- No se especifican requisitos de hardware ni latencias, lo que impide garantizar su viabilidad en despliegues con restricciones de tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRm
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Script de conversión de pesos: `weights/convert_loopdvr_weights.py` en el repositorio LibreYOLO
- Upstream LoopDVR: https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos oficiales: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
- Web de LibreYOLO: https://www.libreyolo.com/
- PyPI: https://pypi.org/project/libreyolo/
