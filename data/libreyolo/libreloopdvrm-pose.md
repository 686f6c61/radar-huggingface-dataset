# LibreYOLO/LibreLoopDVRm-pose

## Resumen

LibreLoopDVRm-pose es un modelo de estimación de pose 2D multi-persona empaquetado para el framework LibreYOLO. Se trata de un reempaquetado del modelo LoopPose en tamaño M (mediano) del proyecto LoopDVR, desarrollado originalmente por The LoopDVR Authors (Great Bay University / Intellindust AI Lab). El modelo detecta 17 keypoints del esqueleto humano según el formato COCO sobre una única clase (`person`), empleando 60 queries en su mecanismo de detección.

La relevancia de este artefacto no reside en una innovación arquitectónica propia, sino en la integración: el autor ha envuelto los pesos oficiales de LoopDVR (`looppose-m.pth`, release v1.0) con la metadata de checkpoint de LibreYOLO v1.0 (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`). Esto permite que la factoría unificada `LibreYOLO()` enrute el modelo sin heurísticas basadas en el nombre del fichero, ofreciendo una API homogénea para estimación de pose junto al resto de modelos soportados por la librería.

Los parámetros aprendidos son idénticos bit a bit al state dict original; el reempaquetado es puramente de metadata. El repositorio tiene un tamaño de 0,1 GB y se distribuye bajo licencia Apache 2.0. No se han publicado datos de benchmarks ni especificaciones detalladas de arquitectura en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de pose basado en queries; familia LoopDVR/LoopPose) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint LibreYOLO v1.0 con metadata; pesos compatibles con PyTorch) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de la familia LoopDVR/LoopPose para estimación de pose 2D multi-persona, con 17 keypoints COCO, una única clase (`person`) y 60 queries. El calificativo "queries" sugiere un mecanismo de detección basado en consultas aprendidas, habitual en detectores tipo DETR, pero no se confirma en la documentación proporcionada. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste fino con RLHF/DPO (lo cual, por otra parte, no aplica a un modelo de visión de este tipo).

El artefacto publicado no introduce cambios en los pesos: el autor indica explícitamente que los parámetros aprendidos coinciden bit a bit con el state dict upstream y que la modificación consiste únicamente en el envoltorio de metadata de LibreYOLO v1.0. El script de conversión está disponible en `weights/convert_loopdvr_weights.py` dentro del repositorio de LibreYOLO. Los detalles de entrenamiento originales deben consultarse en el repositorio de LoopDVR y en la release de pesos oficial.

## Capacidades

- Estimación de pose 2D multi-persona: detección simultánea de varias personas en una imagen con 17 keypoints por persona en formato COCO.
- Detección de una única clase (`person`), sin categorías adicionales de objetos.
- Integración con la API unificada de LibreYOLO mediante la factoría `LibreYOLO()`, con enrutamiento automático basado en metadata del checkpoint.
- Ejecución de inferencia con guardado de resultados (`save=True`) a través del método de llamada del modelo.
- Compatibilidad con el ecosistema LibreYOLO, que agrupa YOLO, RF-DETR, RT-DETR y otros modelos bajo una misma interfaz Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Análisis deportivo automatizado: el modelo puede extraer las poses de varios jugadores en cada fotograma para calcular ángulos articulares, trayectorias y posturas, aprovechando su naturaleza multi-persona y sus 17 keypoints COCO.
- Monitorización de seguridad en espacios de trabajo: detección de posturas ergonómicas incorrectas o de personas en zonas restringidas mediante el pipeline de LibreYOLO con guardado de resultados anotados.
- Aplicaciones de fitness y rehabilitación: seguimiento de la ejecución de ejercicios comparando los keypoints detectados con poses de referencia, integrándose en la API unificada de LibreYOLO.
- Animación y captura de movimiento: extracción de esqueletos 2D por fotograma para alimentar pipelines de rigging o retargeting, con la ventaja de detectar varias personas en la misma escena.
- Analítica de retail y aforo: estimación de poses para analizar la orientación y el comportamiento de clientes en tiendas, combinada con otros modelos de detección del ecosistema LibreYOLO.
- Investigación en visión por computador: uso como baseline reproducible de LoopPose tamaño M dentro de LibreYOLO, facilitando comparaciones con otros detectores de pose bajo la misma interfaz.
- Prototipado rápido: al instalarse con `pip install libreyolo` y cargarse con una sola llamada a `LibreYOLO()`, permite validar ideas de pose estimation en pocas líneas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero, pero no se confirma el número de parámetros).
- GPU recomendadas: no disponible en la documentación; al tratarse de un modelo de la familia LoopPose tamaño M, es probable que funcione en GPU de consumo, pero este dato no se especifica.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del checkpoint (0,1 GB) es compatible con GPUs de gama media-baja, aunque no se aportan cifras oficiales.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (instalable vía pip) con la API `LibreYOLO()`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Keypoints | Clases | Licencia | Formato |
|---|---|---|---|---|---|
| LibreLoopDVRm-pose | no disponible | 17 (COCO) | 1 (`person`) | Apache 2.0 | `.pt` (LibreYOLO) |
| LoopPose-M (upstream) | no disponible | 17 (COCO) | 1 (`person`) | Apache 2.0 | `.pth` (PyTorch) |
| Otros modelos de pose de LibreYOLO | no disponible | no disponible | no disponible | MIT (librería) | `.pt` |

La comparación con alternativas de otros ecosistemas (por ejemplo, modelos de pose de la familia YOLO) no puede establecerse con datos de la información proporcionada, ya que no se han publicado cifras de rendimiento ni recuentos de parámetros. La diferencia principal frente al modelo upstream LoopPose-M es el formato de checkpoint y la metadata de LibreYOLO, no el comportamiento del modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre COCO, es esperable un sesgo hacia las distribuciones de pose, iluminación y contextos presentes en dicho dataset, aunque no se confirma.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de falsos positivos o keypoints mal localizados en escenas con oclusiones, multitudes densas o personas parcialmente visibles.
- Limitaciones de contexto o idioma: no aplica (modelo de visión sin capacidades lingüísticas); la ventana de contexto y el soporte multilingüe no son parámetros relevantes.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución y conservación de avisos; deben respetarse los ficheros `LICENSE` y `NOTICE` del repositorio y la atribución a The LoopDVR Authors.
- Caveat de producción: el modelo es un reempaquetado de metadata; cualquier corrección o mejora debe provenir del proyecto upstream LoopDVR, no de este artefacto.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación comunitaria.
- Ausencia de benchmarks: no hay métricas publicadas (AP, AR, latencia) que permitan evaluar su idoneidad frente a alternativas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRm-pose
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Código de la librería (release): https://github.com/LibreYOLO/libreyolo/tree/release/libreyolo
- Paquete PyPI: https://pypi.org/project/libreyolo/
- Sitio web de LibreYOLO: https://www.libreyolo.com/
- Repositorio upstream de LoopDVR: https://github.com/Intellindust-AI-Lab/LoopDVR
- Release de pesos oficiales LoopDVR v1.0: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0
