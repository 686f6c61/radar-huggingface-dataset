# apexlabs-hq/sn44-dirtiness-v20

## Resumen

`apexlabs-hq/sn44-dirtiness-v20` es un detector de objetos en formato ONNX publicado en Hugging Face por el usuario `apexlabs-hq`. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador orientado a la detección de suciedad en interiores: identifica cinco clases concretas (derrame de líquido, papelera, basura, moho y mancha). El nombre del repositorio sugiere que forma parte de la subred 44 (SN44) de la red Bittensor, y la model card indica que está pensado para ser servido mediante un `miner.py` que hace inferencia con `onnxruntime`.

El modelo se distribuye como un artefacto ONNX end-to-end, con un tamaño de entrada de imagen de 736 píxeles y umbrales de confianza por clase de 0,35 (con un umbral global de 0,05 en la configuración). Incluye además una lógica de supresión de duplicados entre las clases 0, 3 y 4 con un umbral de 0,3, lo que indica que el autor ha empaquetado no solo los pesos, sino también parte del postprocesado dentro del artefacto o de su pipeline de servicio.

La información pública disponible es muy limitada: no hay pipeline declarado, licencia, idiomas ni métricas de rendimiento. El repositorio ocupa 0,0 GB (probablemente por redondeo de un archivo pequeño), no tiene descargas ni likes, y fue creado el 5 de noviembre de 2026. Por tanto, esta ficha debe leerse como una descripción técnica de lo que el autor declara, no como una evaluación validada del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; la model card no especifica la familia, probablemente YOLO u otro detector de una etapa) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se declaran variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tamaño de entrada | 736 × 736 píxeles (`imgsz: 736`) |
| Clases | 5: liquid spillage, bin, litter, mould, stain |
| Umbral de confianza global | 0,05 |
| Umbrales por clase | 0,35 para las clases 0, 1, 2, 3 y 4 |
| Supresión de duplicados entre clases | (0, 3, 0,3), (0, 4, 0,3), (3, 4, 0,3) |
| SHA-256 de pesos | `56087ca5f80e67fc107890ca9bcfc8de55659311c3213c298c7ba5bc63ace28b` |
| Runtime de inferencia | onnxruntime (según la model card) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Solo indica que es un "ONNX end-to-end detector" servido por `miner.py` con `onnxruntime`. El hecho de que se especifique un `imgsz` de 736 y umbrales por clase es coherente con un detector de una etapa tipo YOLO exportado a ONNX, pero el autor no confirma la familia arquitectónica ni el número de parámetros.

Tampoco se documentan los datos de entrenamiento: no se indica el número de imágenes, la composición del dataset, si se partió de un modelo preentrenado (por ejemplo, COCO) ni si hubo aumento de datos o ajuste fino. La única información sobre el entrenamiento es indirecta: las cinco clases y la lógica de supresión de duplicados entre clases sugieren un ajuste específico sobre un dataset propio de imágenes de habitaciones con distintos tipos de suciedad. No hay información sobre validación, métricas de entrenamiento ni procesos de RLHF/DPO (no aplicables a un detector).

## Capacidades

- Detección de objetos en imágenes de interiores con cinco clases: derrame de líquido, papelera, basura, moho y mancha.
- Inferencia end-to-end en formato ONNX, ejecutable con `onnxruntime` sin necesidad de framework de entrenamiento.
- Configuración de umbrales de confianza por clase (0,35 en todas las clases declaradas) y umbral global de 0,05.
- Supresión de duplicados entre pares de clases (0-3, 0-4, 3-4) con umbral 0,3, para evitar detecciones redundantes entre derrame/mancha, derrame/moho y moho/mancha.
- Entrada de imagen redimensionada a 736 × 736 píxeles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No se declaran capacidades de segmentación, clasificación de imagen completa ni detección de otras clases fuera de las cinco indicadas.

## Casos de uso

- Inspección automatizada de habitaciones en alquiler turístico: el modelo puede procesar fotos de una habitación y devolver detecciones de manchas, moho o basura para priorizar la limpieza entre huéspedes. Es adecuado porque las cinco clases cubren los problemas de suciedad más habituales en ese contexto.
- Control de calidad en limpieza de oficinas o espacios comerciales: integrado en una app móvil, permite al personal fotografiar una sala y obtener una lista de incidencias antes de cerrar la tarea, con umbrales por clase ajustables para reducir falsos positivos.
- Mantenimiento preventivo de instalaciones: detección de moho (clase 3) en paredes o techos a partir de imágenes periódicas, con la supresión de duplicados entre moho y mancha para evitar alertas redundantes.
- Triaje en plataformas de reporte ciudadano: los usuarios suben fotos de incidencias y el modelo clasifica automáticamente si hay derrame, basura o mancha, enrutando el aviso al equipo adecuado.
- Automatización de inventario de residuos: detección de papeleras (clase 1) y basura (clase 2) en imágenes de espacios públicos para estimar ocupación o necesidad de vaciado.
- Preprocesado para pipelines de visión más complejos: el ONNX puede ejecutarse en CPU con `onnxruntime` como primer filtro barato que descarta imágenes limpias antes de enviarlas a un modelo más costoso (por ejemplo, un VLM) para descripción detallada.
- Validación en el contexto de una subred de Bittensor: el artefacto está pensado para ser servido por un minero (`miner.py`), de modo que los operadores de la subred pueden desplegarlo como referencia o punto de partida para sus propias implementaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mAP, precisión, recall, latencia ni comparaciones con otros detectores. Tampoco se indica el tamaño del conjunto de validación ni el rendimiento por clase.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un detector pequeño exportado a ONNX, es probable que quepa en GPUs de consumo, pero el autor no publica el número de parámetros ni el tamaño del archivo, por lo que no se puede dar una cifra fiable.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA y `onnxruntime-gpu` podría ejecutarlo; también es viable en CPU con `onnxruntime`.
- GPU de consumo: no confirmado. Dado el formato ONNX y el tamaño de entrada (736 × 736), es plausible que funcione en GPUs de gama media, pero no hay datos que lo verifiquen.
- Opciones de despliegue: `onnxruntime` (declarado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0,0 GB según Hugging Face, lo que sugiere un archivo de pesos muy pequeño (posiblemente unos pocos MB), aunque el dato exacto no se publica.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros detectores (por ejemplo, variantes de YOLO, Faster R-CNN o DETR) ni datos de rendimiento que permitan establecer una comparación rigurosa. Tampoco se conocen modelos públicos equivalentes con las mismas cinco clases y el mismo pipeline de supresión de duplicados.

## Limitaciones y advertencias

- Información pública mínima: no hay licencia declarada, lo que impide determinar si el uso comercial está permitido. Cualquier uso en producción requiere contactar con el autor o asumir el riesgo legal.
- Sin métricas de rendimiento: no se puede evaluar la precisión, el recall ni la tasa de falsos positivos del detector. No se recomienda desplegarlo en producción sin una validación propia sobre el dominio objetivo.
- Dominio restringido: las cinco clases (derrame, papelera, basura, moho, mancha) están pensadas para imágenes de interiores; el modelo probablemente fallará o dará resultados pobres en otros contextos.
- Riesgo de alucinación visual: como cualquier detector, puede generar falsos positivos en texturas o patrones que se parezcan a manchas o moho, especialmente con umbrales bajos (0,05 global).
- Umbrales fijados por el autor: los umbrales por clase (0,35) y la supresión de duplicados (0,3) están codificados en la configuración; ajustarlos requiere modificar el pipeline de servicio.
- Sin soporte de texto ni multilingüe: no es un modelo de lenguaje, por lo que no aplican capacidades de generación, razonamiento o tool calling.
- Procedencia incierta: el nombre sugiere una subred de Bittensor (SN44), un ecosistema con incentivos variables; el modelo podría ser un artefacto de minería sin validación externa.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de revisión por terceros.
- Fecha de creación futura (2026): conviene verificar la autenticidad y vigencia del artefacto antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v20
- Referencia al detector base citado en la model card: `manako/Detect-room-dirtiness-detection` (no se proporciona URL directa en la información disponible)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
