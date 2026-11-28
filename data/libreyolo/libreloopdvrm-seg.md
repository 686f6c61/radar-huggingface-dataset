# LibreYOLO/LibreLoopDVRm-seg

## Resumen

LibreLoopDVRm-seg es un modelo de segmentación de instancias de la familia LoopDVR (LoopSeg), en su variante de tamano M, reempaquetado por el proyecto LibreYOLO para integrarse en su marco unificado de visión por computador. El modelo original procede de Intellindust AI Lab y Great Bay University, y los pesos oficiales se publicaron en el repositorio LoopDVR `v1.0` bajo el fichero `loopseg-m.pth`. La versión de LibreYOLO no modifica los parámetros aprendidos: se limita a envolver el state dict original con metadatos de checkpoint de LibreYOLO v1.0 para que la factoría unificada `LibreYOLO()` pueda enrutar el modelo sin heurísticas basadas en el nombre del fichero.

El modelo realiza segmentación de instancias sobre las 80 clases de COCO, con 300 queries y prototipos de máscara de 160x160 que se reescalan a la resolución de entrada. Su relevancia práctica radica en la integración: permite usar un modelo de segmentación de instancias de terceros a través de la misma API Python que el resto de modelos soportados por LibreYOLO, lo que simplifica pipelines que ya trabajan con YOLO, RF-DETR o RT-DETR.

La ficha se basa exclusivamente en la model card y en la información pública del proyecto LibreYOLO. No se dispone de datos sobre arquitectura interna detallada, composición del dataset de entrenamiento, número de parámetros ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoopDVR (LoopSeg), no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase son las 80 clases de COCO) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch con metadatos de LibreYOLO v1.0) |
| Tarea | Segmentacion de instancias |
| Clases | 80 (COCO) |
| Queries | 300 |
| Prototipos de mascara | 160x160, reescalados a la resolucion de entrada |
| Tamano del repositorio | 0.1 GB |
| Libreria | libreyolo |
| Commit de origen | `f2aba1f122029e4db757b69cd37fc5a4909db34e` (Intellindust-AI-Lab/LoopDVR) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia LoopDVR, en concreto a la variante LoopSeg para segmentación de instancias, en tamano M. La model card no detalla la arquitectura interna (tipo de backbone, mecanismo de atención, diseño del decodificador de queries o del módulo de prototipos), por lo que no es posible describirla con precisión a partir de la información disponible. Los elementos que sí se documentan son el uso de 300 queries y de prototipos de máscara de 160x160 que se reescalan a la resolución de entrada, un esquema habitual en decodificadores de segmentación tipo query-based.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de ajuste fino, RLHF u otras técnicas de alineación (no aplicables en un modelo de visión de este tipo). La modificación introducida por LibreYOLO es exclusivamente de metadatos: los parámetros aprendidos coinciden bit a bit con el state dict original de `loopseg-m.pth`. El envoltorio añade campos como `model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names` e `imgsz` para permitir el enrutamiento automático en la factoría `LibreYOLO()`.

## Capacidades

- Segmentación de instancias sobre las 80 clases de COCO, generando máscaras por instancia además de las detecciones.
- Generación de 300 queries por imagen, con prototipos de máscara de 160x160 reescalados a la resolución de entrada.
- Integración con la API unificada de LibreYOLO mediante `LibreYOLO("LibreLoopDVRm-seg.pt")`, con soporte de guardado de resultados (`save=True`).
- Enrutamiento automático de tarea y familia de modelo gracias a los metadatos del checkpoint (sin heurísticas por nombre de fichero).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión-lenguaje, audio ni modo thinking; se trata de un modelo puramente de visión.
- Capacidades multilingües: no aplica; las etiquetas de clase corresponden a las 80 categorías de COCO.

## Casos de uso

- Segmentación de objetos en imágenes para anotación asistida: el modelo genera máscaras por instancia sobre COCO, lo que permite preanotar datasets y reducir el trabajo manual de etiquetado en pipelines de datos.
- Integración en pipelines existentes de LibreYOLO: al compartir la API `LibreYOLO()`, se puede sustituir o combinar con modelos de detección del mismo ecosistema sin reescribir el código de inferencia.
- Análisis de imágenes en aplicaciones de visión artificial: segmentación de personas, vehículos y objetos cotidianos para conteo, seguimiento o análisis de escenas.
- Prototipado rápido de productos de visión: la instalación vía `pip install libreyolo` y la carga directa del checkpoint permiten validar una idea de segmentación en pocas líneas de código.
- Evaluación comparativa de modelos de segmentación: al estar empaquetado con metadatos homogéneos, facilita comparar LoopSeg M con otros modelos de segmentación soportados por LibreYOLO bajo la misma interfaz.
- Investigación y experimentación académica: el modelo deriva de LoopDVR (Intellindust AI Lab / Great Bay University) con licencia Apache 2.0, lo que permite su uso y modificación en entornos de investigación.
- Sistemas de inspección visual o robótica que requieran máscaras de instancia: la salida por instancia con 300 queries permite manejar escenas con múltiples objetos, siempre que se valide el rendimiento en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la información proporcionada no incluye el número de parámetros ni el consumo de memoria.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU en la model card.
- Compatibilidad con GPU de consumo: no determinable con los datos disponibles; el tamano del repositorio (0.1 GB) sugiere un modelo relativamente ligero, pero no se confirma.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (`pip install libreyolo`) con la API `LibreYOLO()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de parámetros para comparar con alternativas de forma rigurosa. Como referencia cualitativa, se indican modelos de la misma categoría (segmentación de instancias) que podrían servir de comparación, sin datos numéricos:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibreLoopDVRm-seg | no disponible | no aplica | Apache 2.0 | Hugging Face (LibreYOLO) |
| LoopDVR LoopSeg M (original) | no disponible | no aplica | Apache 2.0 | GitHub (Siruuui/LoopDVR v1.0) |
| Otros modelos de segmentacion soportados por LibreYOLO | no disponible | no aplica | segun modelo | via libreria libreyolo |

No se dispone de resultados comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo segmenta las 80 clases de COCO; los objetos fuera de ese vocabulario no se detectarán ni segmentarán correctamente.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre su comportamiento en dominios distintos de COCO (imágenes médicas, satelitales, industriales, etc.).
- Riesgo de alucinación en el sentido de detecciones o máscaras espurias: no hay datos publicados sobre precisión, falsos positivos o calidad de máscara en la información disponible.
- No se documentan limitaciones de resolución de entrada más allá del reescalado de prototipos de 160x160 a la resolución de entrada; conviene validar el efecto en imágenes de muy alta resolución.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia (véanse `LICENSE` y `NOTICE` del repositorio). El copyright original corresponde a The LoopDVR Authors (Great Bay University / Intellindust AI Lab).
- El modelo no ha sido reentrenado ni ajustado por LibreYOLO; cualquier limitación del modelo original se mantiene intacta.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se proporcionan garantías de soporte, mantenimiento ni actualizaciones por parte del autor del reempaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRm-seg
- Repositorio LibreYOLO en GitHub: https://github.com/LibreYOLO/libreyolo
- Código de la librería en GitHub (release): https://github.com/LibreYOLO/libreyolo/tree/release/libreyolo
- Paquete en PyPI: https://pypi.org/project/libreyolo/
- Sitio web de LibreYOLO: https://www.libreyolo.com/
- Repositorio original LoopDVR: https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos oficiales LoopDVR v1.0: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
