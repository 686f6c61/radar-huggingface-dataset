# LibreYOLO/LibreLoopDVRs-pose

## Resumen

LibreLoopDVRs-pose es un modelo de estimación de pose 2D multipersona empaquetado para el framework LibreYOLO. Se trata de una redistribución del modelo LoopPose (tamaño S) del proyecto LoopDVR, desarrollado por el Intellindust AI Lab y la Great Bay University. El modelo detecta 17 keypoints del esqueleto COCO sobre una única clase (`person`) y está pensado para integrarse en el ecosistema LibreYOLO mediante su API unificada.

La relevancia de este checkpoint es fundamentalmente de integración: no introduce cambios en los pesos aprendidos, sino que añade metadatos de checkpoint de LibreYOLO v1.0 (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`) para que la factoría `LibreYOLO()` enrute el modelo sin heurísticas basadas en nombre de fichero. Los parámetros aprendidos coinciden bit a bit con el state dict original de `looppose-s.pth`.

El modelo se publica bajo licencia Apache 2.0 y se distribuye en formato `.pt` (checkpoint PyTorch). No se dispone de información pública sobre arquitectura interna, número de parámetros, longitud de contexto ni datos de entrenamiento en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de pose basado en queries; 60 queries) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica contexto de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch con metadatos LibreYOLO v1.0) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card indica que se trata de LoopPose (tamaño S) del proyecto LoopDVR, un modelo de estimación de pose 2D multipersona con 17 keypoints COCO, una única clase (`person`) y 60 queries. El término "queries" sugiere un esquema de detección basado en consultas aprendidas, habitual en arquitecturas tipo DETR, pero no se confirma explícitamente en la documentación.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas. El checkpoint redistribuido es un envoltorio de metadatos: los pesos no se han reentrenado ni modificado, y coinciden bit a bit con el state dict upstream de `looppose-s.pth` (commit `f2aba1f122029e4db757b69cd37fc5a4909db34e`).

## Capacidades

- Estimación de pose 2D multipersona sobre imágenes.
- Detección de 17 keypoints del esqueleto con formato COCO.
- Clase única: `person`.
- 60 queries para la detección de instancias.
- Integración con la API unificada de LibreYOLO mediante `LibreYOLO("LibreLoopDVRs-pose.pt")`.
- Soporte de guardado de resultados visuales (`save=True` en la llamada de inferencia).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Análisis deportivo automatizado: el modelo permite extraer esqueletos de múltiples personas en secuencias de vídeo para calcular ángulos articulares, trayectorias y posturas en deportes como atletismo o gimnasia, aprovechando la detección multipersona con 17 keypoints.
- Vigilancia y seguridad en espacios públicos: detección de personas y estimación de posturas para identificar caídas, aglomeraciones o comportamientos anómalos, con la ventaja de una única clase que simplifica el pipeline.
- Animación y captura de movimiento: generación de datos de pose para rigging de personajes o motion capture de bajo coste a partir de vídeo convencional, usando los 17 keypoints COCO directamente como esqueleto.
- Análisis ergonómico en entornos industriales: evaluación de posturas de trabajadores para prevención de riesgos laborales, midiendo ángulos de tronco, brazos y piernas en imágenes de cámara fija.
- Interacción persona-máquina: control gestual o corporal en instalaciones interactivas, donde el modelo proporciona las coordenadas de keypoints que alimentan la lógica de reconocimiento de gestos.
- Investigación en visión por computador: modelo base para experimentos de estimación de pose, gracias a su licencia Apache 2.0 y a la integración con LibreYOLO, que facilita la comparación con otros detectores del mismo framework.
- Preprocesado para modelos de acción o emoción: los keypoints extraídos pueden alimentar clasificadores de acciones o estados afectivos en pipelines de análisis de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros ni el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint es de 0.0 GB en el repositorio de Hugging Face, lo que sugiere un peso muy reducido, pero no se puede confirmar sin datos de parámetros.
- Opciones de despliegue: librería `libreyolo` (instalable vía `pip install libreyolo`), que actúa como API unificada para YOLO, RF-DETR, RT-DETR y otros modelos. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Keypoints | Clases | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| LibreLoopDVRs-pose | LoopDVR / LibreYOLO | 17 (COCO) | 1 (`person`) | Apache 2.0 | `.pt` | Hugging Face |
| Otros modelos de pose en LibreYOLO | YOLO-pose y variantes | no disponible | no disponible | MIT (librería) | `.pt` | LibreYOLO |
| RF-DETR / RT-DETR | Detectores del ecosistema LibreYOLO | no disponible | no disponible | no disponible | `.pt` | LibreYOLO |

No se dispone de datos de rendimiento (mAP, latencia) para establecer una comparación cuantitativa con alternativas. La comparativa se limita a aspectos de licencia, formato y disponibilidad dentro del ecosistema LibreYOLO.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre COCO, puede heredar sesgos de representación de ese dataset (pose, vestimenta, iluminación y demografía).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero puede producir keypoints espurios en oclusiones severas o personas parcialmente visibles.
- Limitaciones de contexto o idioma: no aplica contexto de texto; el modelo no procesa lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución y conservación del aviso de licencia; deben mantenerse los ficheros `LICENSE` y `NOTICE`.
- Caveat de producción: el checkpoint es un envoltorio de metadatos sin reentrenamiento; cualquier mejora o corrección debe provenir del proyecto upstream LoopDVR.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se documentan límites de resolución de entrada, aunque la metadata incluye `imgsz`; conviene verificar el valor concreto en el checkpoint antes de desplegar.
- Dependencia de la librería `libreyolo` para la carga del modelo; no se garantiza compatibilidad con otros frameworks sin conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRs-pose
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Script de conversión de pesos: `weights/convert_loopdvr_weights.py` en el repositorio LibreYOLO
- Web oficial de LibreYOLO: https://www.libreyolo.com/
- Paquete PyPI: https://pypi.org/project/libreyolo/
- Repositorio upstream LoopDVR: https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos oficiales LoopDVR v1.0: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
