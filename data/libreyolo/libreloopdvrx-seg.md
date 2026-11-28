# LibreYOLO/LibreLoopDVRx-seg

## Resumen

LibreLoopDVRx-seg es un checkpoint de segmentación de instancias de la familia LoopDVR (LoopSeg, variante de tamaño X), redistribuido por el proyecto LibreYOLO para integrarse en su framework de visión por computador con API unificada. El modelo original procede de Intellindust AI Lab y Great Bay University, y estos pesos son un reempaquetado de metadatos del release oficial `loopseg-x.pth` (v1.0), sin modificar los parámetros aprendidos.

El modelo realiza segmentación de instancias sobre las 80 clases de COCO, con 300 queries y prototipos de máscara de 160x160 que se reescalan a la resolución de entrada. Su relevancia práctica es la de ofrecer una alternativa de segmentación lista para usar dentro del ecosistema LibreYOLO, con licencia Apache 2.0 y una API Python homogénea con el resto de modelos soportados (YOLO, RF-DETR, RT-DETR).

No se dispone de información pública sobre el número de parámetros, la arquitectura interna detallada ni los datos de entrenamiento en la documentación proporcionada; la model card se limita a describir el empaquetado y la procedencia de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (LoopDVR / LoopSeg, segmentación de instancias; detalles internos no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch con metadatos LibreYOLO v1.0) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo de segmentación de instancias de la familia LoopDVR, variante LoopSeg de tamaño X, con 300 queries de objeto y prototipos de máscara de 160x160 que se sobremuestrean a la resolución de la imagen de entrada. No se detalla en la documentación proporcionada si la arquitectura es un transformer de detección con cabecera de máscaras, un híbrido o un diseño específico del proyecto LoopDVR.

Los pesos derivan del commit `f2aba1f122029e4db757b69cd37fc5a4909db34e` del repositorio Intellindust-AI-Lab/LoopDVR y del release oficial `v1.0` de Siruuui/LoopDVR (archivo `loopseg-x.pth`). El reempaquetado de LibreYOLO es únicamente una envoltura de metadatos (campos `model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`) para que la factoría `LibreYOLO()` enrute el modelo sin heurísticas de nombre de fichero; los parámetros aprendidos son idénticos bit a bit al state dict original. No se han publicado en la información disponible datos sobre volumen de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Segmentación de instancias sobre las 80 clases del dataset COCO.
- Generación de máscaras por instancia a partir de 300 queries y prototipos de 160x160 reescalados a la resolución de entrada.
- Integración con la API unificada de LibreYOLO: `LibreYOLO("LibreLoopDVRx-seg.pt")` y llamada directa sobre imágenes con guardado de resultados (`save=True`).
- Enrutado automático por metadatos dentro de la factoría LibreYOLO, sin depender del nombre del fichero.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking, por tratarse de un modelo de visión.
- No se documentan capacidades multilingües (no aplica a un modelo de segmentación).

## Casos de uso

- Segmentación de objetos en imágenes para anotación asistida: el modelo genera máscaras por instancia de las 80 clases COCO, lo que permite preetiquetar datasets y reducir el trabajo manual de revisión.
- Análisis de imágenes en pipelines de visión industrial: integrado vía la API de LibreYOLO, puede ejecutarse por lotes sobre imágenes de inspección para localizar y delimitar objetos o defectos compatibles con clases COCO.
- Moderación y análisis de contenido visual: la segmentación de instancias permite aislar personas y objetos en una imagen para aplicar políticas posteriores de filtrado o censura selectiva.
- Investigación en visión por computador: sirve como baseline de segmentación de instancias con licencia Apache 2.0 para comparar con otros modelos del ecosistema LibreYOLO (YOLO, RF-DETR, RT-DETR) usando la misma API.
- Automatización de flujos de edición de imagen: las máscaras por instancia facilitan el recorte, la sustitución de fondos o el retoque selectivo de objetos en aplicaciones de edición.
- Prototipado rápido en robótica y sistemas embebidos: al distribuirse como un único fichero `.pt` cargable con `pip install libreyolo`, permite validar la segmentación en una demo antes de optimizar el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el número de parámetros ni el consumo de memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio (0,1 GB) sugiere un checkpoint manejable, pero no permite inferir requisitos de VRAM en ejecución.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (`pip install libreyolo`) con la API `LibreYOLO(...)`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreLoopDVRx-seg | Segmentación de instancias (COCO, 80 clases) | no disponible | no aplica | Apache 2.0 | Hugging Face, vía `libreyolo` |
| Otros modelos del ecosistema LibreYOLO (YOLO, RF-DETR, RT-DETR) | Detección de objetos y variantes | no disponible | no aplica | MIT (librería) / según modelo | Vía `libreyolo` |
| LoopDVR original (loopseg-x.pth) | Segmentación de instancias | no disponible | no aplica | Apache 2.0 | Release oficial en GitHub (Siruuui/LoopDVR v1.0) |

No se dispone de datos de rendimiento comparativo (métricas de segmentación como mask AP) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre COCO, cabe esperar los sesgos de representación y de vocabulario visual de ese dataset (80 clases fijas).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos o máscaras imprecisas en objetos fuera de las 80 clases COCO.
- Limitaciones de contexto o idioma: el modelo solo segmenta las clases COCO; no se documentan capacidades para categorías fuera de ese conjunto ni procesamiento de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución y conservación de avisos; deben mantenerse los ficheros `LICENSE` y `NOTICE` del repositorio y respetarse la autoría original de LoopDVR (Great Bay University / Intellindust AI Lab).
- Caveat para producción: el modelo es un reempaquetado de metadatos; cualquier cambio en los pesos originales o en el formato de checkpoint de LibreYOLO puede requerir reconversión con `weights/convert_loopdvr_weights.py`.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRx-seg
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Web de LibreYOLO: https://www.libreyolo.com/
- Paquete PyPI: https://pypi.org/project/libreyolo/
- Repositorio original LoopDVR: https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos LoopDVR v1.0: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
