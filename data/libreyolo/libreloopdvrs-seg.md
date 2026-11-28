# LibreYOLO/LibreLoopDVRs-seg

## Resumen

LibreLoopDVRs-seg es un checkpoint de segmentación de instancias en formato LibreYOLO, derivado del modelo LoopDVR LoopSeg en su variante de tamano S, desarrollado por el grupo LoopDVR (Great Bay University / Intellindust AI Lab) y reempaquetado por el proyecto LibreYOLO. El modelo resuelve la tarea de segmentación de instancias sobre las 80 clases de COCO, generando máscaras por instancia además de las cajas delimitadoras correspondientes. Su relevancia radica en que permite usar un segmentador de la familia LoopDVR a través de la API unificada de LibreYOLO, sin necesidad de gestionar heurísticas de nombres de fichero ni adaptadores específicos.

El reempaquetado es puramente de metadatos: los pesos aprendidos son idénticos bit a bit al state dict original `loopseg-s.pth` publicado en la release `v1.0` del repositorio upstream. El checkpoint incorpora metadatos de LibreYOLO v1.0 (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`) para que la factoría `LibreYOLO()` enrute el modelo correctamente.

Arquitecturalmente se trata de un modelo de segmentación de instancias con 300 queries y prototipos de máscara de 160x160 que se reescalan a la resolución de entrada. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la información publicada sobre parámetros, contexto (no aplica, es visión) y datos de entrenamiento es muy limitada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoopDVR LoopSeg (segmentación de instancias, 300 queries, prototipos de máscara 160x160) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint LibreYOLO, pesos idénticos al state dict original) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia LoopDVR, concretamente a la variante LoopSeg orientada a segmentación de instancias. La model card indica que emplea 300 queries y prototipos de máscara de 160x160 que se reescalan a la resolución de entrada, un esquema característico de los segmentadores basados en queries tipo DETR. Cubre las 80 clases de COCO. No se detalla en la información disponible el número de parámetros, la composición del dataset de entrenamiento, el número de tokens/imágenes vistas ni si hubo fases de refinamiento específicas.

El checkpoint distribuido en este repositorio no introduce cambios en los pesos: el proceso de conversión documentado en `weights/convert_loopdvr_weights.py` del repositorio de LibreYOLO solo añade metadatos de envoltura. Por tanto, el comportamiento del modelo es el del release oficial `loopseg-s.pth` de LoopDVR v1.0, y cualquier detalle de entrenamiento debe consultarse en la documentación del proyecto upstream.

## Capacidades

- Segmentación de instancias sobre las 80 clases de COCO, con máscaras por objeto y cajas delimitadoras asociadas.
- Generación de máscaras a resolución de entrada mediante upsampling de prototipos de 160x160.
- Integración con la API unificada de LibreYOLO: `LibreYOLO("LibreLoopDVRs-seg.pt")` devuelve resultados con `save=True` para volcar visualizaciones.
- Enrutamiento automático por metadatos (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`), sin heurísticas de nombre de fichero.
- Soporte de tool calling / function calling: no aplica (modelo de visión).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales (thinking mode, visión, audio): únicamente visión para segmentación; no se documentan otras.

## Casos de uso

- Análisis de imágenes médicas o industriales asistido: el modelo puede segmentar instancias de las 80 clases de COCO en imágenes de inspección para preetiquetar regiones de interés antes de una revisión humana, aprovechando la salida de máscaras por objeto.
- Preetiquetado para anotación de datasets: al producir máscaras de instancia directamente, se puede usar como generador de etiquetas iniciales en pipelines de anotación, reduciendo el coste manual en proyectos de visión por computador.
- Segmentación en aplicaciones de robótica y navegación: la salida por instancia permite aislar objetos individuales en la escena para planificación de agarre o evitación de obstáculos, con la ventaja de la API de LibreYOLO para integrarlo en el mismo stack que detectores YOLO.
- Moderación y análisis de contenido visual: segmentar personas, vehículos y objetos de las 80 clases de COCO facilita tareas de recuento, filtrado o censura selectiva por región.
- Automatización de inventario y retail: segmentación de productos y estanterías (clases COCO como botellas, libros, etc.) para control de stock a partir de imágenes de cámara.
- Investigación en visión por computador: como baseline de segmentación de instancias con licencia Apache 2.0 y pesos idénticos al release oficial, es adecuado para reproducir experimentos y comparar con otros segmentadores dentro de LibreYOLO.
- Integración en pipelines de CI/CD de modelos de visión: al estar empaquetado para LibreYOLO, se puede cargar con la misma factoría que otros modelos y validar regresiones de segmentación de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros ni consumo).
- GPU recomendadas: no disponible; al ser un modelo de visión de tamano S, es razonable esperar que quepa en GPUs consumer, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU consumer?: no confirmado en la información disponible.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (`pip install libreyolo`) con la factoría `LibreYOLO()`. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni TGI (este último no aplica a visión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreLoopDVRs-seg | no disponible | no aplica | Segmentación de instancias COCO (80 clases) | Apache 2.0 | Hugging Face + LibreYOLO |
| LoopDVR LoopSeg (upstream) | no disponible | no aplica | Segmentación de instancias COCO | Apache 2.0 | GitHub release v1.0 |
| Otros segmentadores en LibreYOLO (p. ej. variantes YOLO-seg, RF-DETR, RT-DETR) | no disponible | no aplica | Detección/segmentación | MIT (librería) / según modelo | PyPI `libreyolo` |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre las 80 clases de COCO; objetos fuera de ese vocabulario no se segmentarán correctamente.
- No se documentan sesgos conocidos ni evaluación de robustez en la model card; se desconoce el comportamiento en dominios alejados de COCO.
- Riesgo de alucinación: en segmentación se traduce en falsos positivos o máscaras imprecisas en escenas complejas; no hay métricas publicadas que lo cuantifiquen.
- Limitaciones de contexto o idioma: no aplica idioma; el contexto es la resolución de entrada, no documentada explícitamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de copyright de The LoopDVR Authors y los ficheros `LICENSE` y `NOTICE` del repositorio.
- El checkpoint es un reempaquetado de metadatos; cualquier limitación del release upstream `loopseg-s.pth` se hereda sin cambios.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRs-seg
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Script de conversión: `weights/convert_loopdvr_weights.py` en el repositorio de LibreYOLO
- Web de LibreYOLO: https://www.libreyolo.com/
- PyPI: https://pypi.org/project/libreyolo/
- Repositorio upstream LoopDVR: https://github.com/Intellindust-AI-Lab/LoopDVR (commit `f2aba1f122029e4db757b69cd37fc5a4909db34e`)
- Release oficial de pesos: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0 (fichero `loopseg-s.pth`)
