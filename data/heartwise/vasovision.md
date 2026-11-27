# heartwise/VasoVision

## Resumen

VasoVision es un modelo de clasificación multi-cabeza desarrollado por HeartWise AI, orientado al análisis de imágenes cardiovasculares (angiografía y estudios de cateterismo). A diferencia de un modelo generativo, VasoVision no produce texto: es un clasificador que, a partir de una imagen o vídeo de angiografía, predice simultáneamente varias etiquetas clínicas mediante una única pasada y una función de pérdida multi-tarea (multi-head loss).

El modelo resuelve un problema concreto: etiquetar automáticamente estudios angiográficos según la estructura anatómica visible (arteria coronaria izquierda, derecha, injerto, catéter, aorta, válvula TAVR, etc.), la presencia de agente de contraste, la presencia de stent y el tipo de dominancia coronaria. Esto permite organizar y filtrar grandes volúmenes de estudios en sistemas PACS sin revisión manual.

Su relevancia práctica radica en que se distribuye como checkpoint listo para producción dentro de un contenedor de inferencia PACS-AI (`heartwisehub/pacs-ai-procedure_view-classifier`), con verificación de integridad SHA-256 de los pesos y una revisión fijada. La información pública disponible es escasa: no se detallan arquitectura interna, número de parámetros, contexto (no aplica) ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de clasificación multi-cabeza (detalle interno no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imagen); no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`vaso_vision.pt`) |
| Tareas de salida | 4 cabezas: `contrast_agent`, `main_structure`, `stent_presence`, `dominance` |
| Clases en `main_structure` | 12 (Left Coronary, Right Coronary, Other, Graft, Catheter, Femoral, LV, TAVR, Aorta, Radial, TEE probe, Pigtail) |
| Entrada | Imágenes/vídeos de angiografía (resolución no disponible) |
| Tamano del repo | 0.0 GB (reportado por Hugging Face) |

## Arquitectura y entrenamiento

La model card describe VasoVision como un «multi-head classification model» entrenado con una aproximación de pérdida multi-tarea («multi-head loss approach»), que permite resolver varias clasificaciones simultáneamente sobre la misma entrada. No se especifica la familia de arquitectura base (CNN, ViT u otra), el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de aumento de datos o balanceo de clases.

Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal (no aplicables a un clasificador de este tipo). El único detalle operativo relevante es la integración en el contenedor PACS-AI: los pesos se descargan desde una revisión fijada del repositorio y se verifica su SHA-256 (`8c16997b8848a3a670168403e96f2d286b472aa8addad8e3012df48d4f14c65b`). El changelog 1.0.6 indica que una actualización de dependencias (torch 2.13.0, torchvision 0.28.0, CUDA 12.6, pydicom 3.0.2) mantiene idénticas las etiquetas de vista, estado y dominancia en 12 estudios (103 vídeos), con una desviación máxima de 1.0e-3 en `dominance_left_probability`.

## Capacidades

- Clasificación de la estructura principal visible en angiografía entre 12 clases (`main_structure`).
- Detección de presencia de agente de contraste (`contrast_agent`: sí/no).
- Detección de presencia de stent (`stent_presence`: presente/ausente).
- Clasificación de dominancia coronaria (`dominance`: derecha/izquierda).
- Inferencia multi-tarea en una sola pasada gracias a la cabeza múltiple.
- Procesamiento de vídeos de angiografía (validado sobre 103 vídeos en 12 estudios).
- Integración con el ecosistema Orion (`HeartWise-AI/Orion`) para ejecución.
- Despliegue mediante contenedor PACS-AI con verificación de integridad de pesos.
- No soporta tool calling, agentes, generación de texto, visión generalista ni capacidades multilingües: es un clasificador especializado.

## Casos de uso

- **Triage y organización automática de estudios en PACS**: el modelo etiqueta cada angiografía con la estructura principal y la presencia de contraste, permitiendo filtrar y enrutar estudios por tipo (coronaria izquierda, injerto, catéter, TAVR) sin revisión manual.
- **Control de calidad de adquisiciones**: la clasificación de `contrast_agent` permite detectar automáticamente estudios sin contraste suficiente para revisión diagnóstica y priorizar repeticiones.
- **Auditoría de stent en seguimiento**: la cabeza `stent_presence` facilita la identificación de estudios con stent implantado, útil para cohortes de seguimiento y análisis retrospectivos.
- **Caracterización anatómica para investigación**: la etiqueta `dominance` (derecha/izquierda) permite estratificar cohortes por dominancia coronaria en estudios poblacionales sin anotación manual.
- **Enrutamiento en flujos de cateterismo**: la distinción entre `Radial`, `Femoral`, `Catheter` y `Pigtail` ayuda a clasificar el abordaje y el material visible en el estudio, agilizando la indexación.
- **Preprocesado para pipelines de IA**: las etiquetas de VasoVision pueden actuar como metadatos de entrada para modelos posteriores (segmentación, detección de lesiones), reduciendo el ruido al filtrar por vista y estructura.
- **Integración en Orion**: el modelo se ejecuta mediante el repositorio Orion, lo que permite incorporarlo a flujos de análisis cardiovascular existentes del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud, F1, AUC ni comparaciones cuantitativas con otros modelos. El único dato de validación es cualitativo: en 12 estudios (103 vídeos), la actualización de dependencias del contenedor 1.0.6 mantiene idénticas las etiquetas de vista, estado y dominancia, con una variación máxima de 1.0e-3 en la probabilidad de dominancia izquierda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el tamaño del modelo ni el número de parámetros).
- GPU recomendadas: no disponible. El contenedor PACS-AI se construye con wheels CUDA 12.6 (torch 2.13.0, torchvision 0.28.0), lo que implica soporte para GPU NVIDIA con CUDA 12.6.
- Compatibilidad con GPU de consumo: no confirmada; al desconocerse el tamaño del checkpoint no puede garantizarse que quepa en una RTX 4090 u otras GPU consumer.
- Opciones de despliegue: contenedor PACS-AI (`heartwisehub/pacs-ai-procedure_view-classifier`, versión 1.0.6) y ejecución mediante el repositorio Orion (`HeartWise-AI/Orion`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de este tipo).
- Latencia y throughput: no disponibles.
- Estado de despliegue: el contenedor figura como «Published, not deployed» pendiente de revisión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han identificado alternativas de la misma categoría (clasificación multi-tarea de angiografía coronaria) con datos verificables de parámetros, contexto o rendimiento.

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VasoVision | no disponible | no aplica | 4 cabezas de clasificación cardiovascular | MIT | Hugging Face + contenedor PACS-AI |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Documentación muy escasa**: no se publican arquitectura, parámetros, datos de entrenamiento ni métricas, lo que dificulta evaluar su robustez antes de usarlo en producción.
- **Sesgos desconocidos**: al no documentarse la composición del dataset de entrenamiento, no puede evaluarse el sesgo por fabricante de equipo, población o protocolo de adquisición.
- **Riesgo de clasificación errónea**: es un clasificador con clases cerradas; estructuras no representadas en las 12 clases de `main_structure` se asignarán a la clase más probable, sin mecanismo de abstención documentado.
- **Ámbito restringido**: solo cubre las cuatro tareas definidas; no sirve para segmentación, detección de lesiones ni generación de informes.
- **Dependencia de versión**: los resultados pueden variar ligeramente con actualizaciones de torch (desviación documentada de hasta 1.0e-3 en `dominance_left_probability`), por lo que conviene fijar la revisión de pesos y la versión del contenedor.
- **Estado de despliegue**: el contenedor 1.0.6 está marcado como «Published, not deployed» pendiente de revisión, lo que desaconseja su uso clínico directo sin validación adicional.
- **Licencia MIT**: permite uso comercial y modificación, pero no exime de la responsabilidad regulatoria en contexto clínico (marcado CE/FDA no documentado).
- **Uso clínico**: no hay evidencia publicada de validación clínica; no debe emplearse como sustituto del criterio médico.

## Enlaces

- Hugging Face: https://huggingface.co/heartwise/VasoVision
- Repositorio Orion: https://github.com/HeartWise-AI/Orion
- Contenedor PACS-AI: `heartwisehub/pacs-ai-procedure_view-classifier@sha256:b8c6258c4c080a513d21b41544885d069ea75a04327d4280ffb933bf33eaefd1`
- Repositorio del backend PACS-AI: `HeartWise-AI/pacs-ai-backend`
- Paper, blog o demo: no disponible
