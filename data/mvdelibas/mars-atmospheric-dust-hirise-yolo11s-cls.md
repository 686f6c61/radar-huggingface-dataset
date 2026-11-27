# mvdelibas/mars-atmospheric-dust-hirise-yolo11s-cls

## Resumen

Mars atmospheric dust classifier es un modelo de clasificación de imágenes basado en la arquitectura Ultralytics YOLO11s-cls (variante small de clasificación), ajustado por el usuario mvdelibas a partir de los pesos preentrenados oficiales de Ultralytics. Su tarea consiste en determinar si un parche de 100x100 píxeles extraído de imágenes HiRISE (High Resolution Imaging Science Experiment, a bordo del Mars Reconnaissance Orbiter) muestra una atmósfera marciana cubierta de polvo o despejada. Forma parte del conjunto de tareas del benchmark Mars-Bench, concretamente la tarea `mb-atmospheric_dust_cls_rdr`.

El modelo resuelve un problema acotado pero recurrente en el procesamiento de datos planetarios: filtrar automáticamente imágenes afectadas por tormentas de polvo antes de aplicar pipelines de análisis superficial, fotogrametría o selección de candidatos para estudio geológico. Al tratarse de un clasificador binario ligero (YOLO11s-cls, 224 píxeles de entrada), su interés radica en la relación entre coste computacional y precisión reportada (97,0 % top-1 en el split de validación), no en capacidades generales de razonamiento o generación.

Es relevante ahora porque Mars-Bench estandariza tareas de visión para ciencia planetaria y permite comparar modelos de forma reproducible sobre datos HiRISE. No obstante, se trata de un modelo de investigación con cero descargas y cero likes en el momento de redactar esta ficha, publicado bajo AGPL-3.0 y entrenado con datos CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s-cls (CNN de clasificación, entrada 224 px) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en, tr (solo etiquetas de clase y documentación; el modelo no procesa texto) |
| Licencia | AGPL-3.0 (pesos derivados de Ultralytics); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | PyTorch `.pt` (Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un YOLO11s-cls, la variante "small" de la familia de clasificación de Ultralytics YOLO11, una red convolucional con mecanismos de atención inspirados en arquitecturas modernas de detección, adaptada aquí a clasificación de imagen completa a 224 píxeles. Se inicializa desde los pesos preentrenados oficiales de Ultralytics y se ajusta fino (fine-tuning) sobre la tarea binaria de polvo atmosférico. La salida es una distribución sobre dos clases cuyos nombres internos están en turco: `tozlu` (con polvo) y `tozsuz` (sin polvo).

El entrenamiento utiliza el subconjunto `mb-atmospheric_dust_cls_rdr` del benchmark Mars-Bench (Zenodo 15494320, DOI 10.5281/zenodo.15494320, CC BY 4.0), compuesto por parches de 100x100 píxeles extraídos de productos RDR de HiRISE (imágenes NASA/JPL/University of Arizona). No se documentan en la model card el número exacto de tokens de entrenamiento, la composición detallada del dataset, el uso de RLHF/DPO (no aplica a clasificación) ni innovaciones técnicas adicionales como decodificación especulativa. Se indica que el mejor resultado se obtuvo en la iteración 43 y que el coste de entrenamiento reportado por la plataforma fue de 2,27 CR.

## Capacidades

- Clasificación binaria de imagen: distingue entre parche con polvo atmosférico (`tozlu`) y sin polvo (`tozsuz`) en imágenes HiRISE.
- Entrada de 100x100 píxeles (parches de productos RDR), redimensionada internamente a 224 px por el pipeline de Ultralytics.
- Salida de probabilidades por clase (`result.probs`), con top-1 y top-5 accesibles vía la API de Ultralytics.
- Etiquetas de clase en turco, documentación bilingüe en inglés y turco.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión general (no es un VLM); solo la tarea específica para la que fue entrenado.
- No soporta audio ni modalidades distintas de imagen.

## Casos de uso

- Filtrado previo de imágenes HiRISE en pipelines de ciencia planetaria: descartar automáticamente parches con polvo atmosférico antes de ejecutar análisis de superficie, fotogrametría o detección de rasgos geológicos, evitando que las tormentas de polvo contaminen los resultados.
- Selección de candidatos para estudio geológico: priorizar parches `tozsuz` (atmósfera despejada) para inspección manual o para alimentar modelos de segmentación y detección de cráteres, dunas o depósitos.
- Control de calidad de datasets planetarios: auditar colecciones de imágenes HiRISE y etiquetar automáticamente la presencia de polvo para construir metadatos de calidad.
- Análisis temporal de la actividad atmosférica marciana: clasificar series de imágenes de una misma región a lo largo del tiempo para estudiar la evolución de tormentas de polvo, siempre con validación humana.
- Componente de un pipeline de preprocesado en investigación: integrar el clasificador como primer paso de un sistema mayor (por ejemplo, junto a modelos de detección de cambios o de estimación de propiedades superficiales) para descartar observaciones no válidas.
- Docencia y experimentación con Mars-Bench: servir como baseline reproducible para comparar nuevas arquitecturas de clasificación en la tarea `mb-atmospheric_dust_cls_rdr`, dado que la partición de validación está estandarizada.
- Prototipado rápido en GPU de consumo: al ser YOLO11s-cls, permite ejecutar inferencia en hardware modesto para pruebas de concepto antes de escalar a clústeres.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de validación del origen de datos de entrenamiento (Mars-Bench val original):

| Metrica (validacion) | Valor |
|---|---|
| Top-1 accuracy | 97,0 % |
| Top-5 accuracy | 100,0 % |
| Macro F1 | 96,4 % |
| Macro precision | 96,4 % |
| Macro recall | 96,4 % |

Por clase (F1): `tozlu` 96,4 %, `tozsuz` 96,3 %. Matriz de confusión detallada (según la sección en turco):

| Clase | Soporte | Precision | Recall | F1 |
|---|--:|--:|--:|--:|
| tozsuz | 2479 | 0,973 | 0,954 | 0,963 |
| tozlu | 2463 | 0,955 | 0,973 | 0,964 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de YOLO11s-cls (variante small, entrada 224 px) se espera un consumo bajo, del orden de pocos cientos de MB, aunque no se confirma en la model card.
- GPU recomendadas: no especificadas. Por la naturaleza del modelo (CNN small), cualquier GPU moderna con soporte CUDA es suficiente; también es viable en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer reciente (RTX 3060 o superior), aunque no se aportan cifras oficiales.
- Opciones de despliegue: Ultralytics (Python, `YOLO(...)`), exportación a ONNX/TensorRT/OpenVINO vía Ultralytics (no documentada en la model card), y `huggingface_hub` para descarga de pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos de clasificación de polvo atmosférico ni con otras variantes de YOLO11-cls entrenadas sobre Mars-Bench. Como referencia estructural cabría considerar otras variantes de la familia YOLO11-cls (n, m, l, x) o clasificadores genéricos tipo ResNet/ViT ajustados a la misma tarea, pero no se han publicado resultados comparativos en la información disponible.

## Limitaciones y advertencias

- Ruido en las etiquetas de origen: un parche extraído de una imagen con polvo puede mostrar suelo despejado, y uno de una imagen sin polvo puede mostrar suelo liso y sin rasgos; esto introduce ambigüedad inherente a la tarea.
- El modelo asigna siempre una de sus dos clases a cualquier entrada; con imágenes de otro tipo (otras misiones, otras escalas, otras modalidades) el resultado carece de sentido.
- El rendimiento del 97 % se mide sobre el split de validación del origen de datos; en otros sensores, regiones o estilos de imagen será inferior, y el autor recomienda validar sobre una muestra propia antes de confiar en él.
- Uso previsto de investigación: no debe emplearse de forma aislada para cartografía científica ni para toma de decisiones de misión.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y distribución; conviene revisar su compatibilidad con el producto o servicio donde se integre.
- La licencia de los datos (CC BY 4.0) exige mantener la atribución a Mars-Bench, NASA/JPL/University of Arizona y los autores citados.
- Etiquetas de clase en turco (`tozlu`/`tozsuz`), lo que puede requerir mapeo en pipelines en otros idiomas.
- Publicación muy reciente y sin tracción (0 descargas, 0 likes): no hay evidencia de uso en producción ni validación independiente.
- No se documentan sesgos demográficos (no aplica), pero sí un posible sesgo de dominio hacia las condiciones de adquisición de HiRISE RDR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-atmospheric-dust-hirise-yolo11s-cls
- Dataset Mars-Bench (Zenodo): https://doi.org/10.5281/zenodo.15494320
- Ultralytics YOLO (repositorio y documentación): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com/
- Referencia de la tarea Mars-Bench `mb-atmospheric_dust_cls_rdr`: incluida en el dataset de Zenodo arriba enlazado (Purohit et al., 2025)
