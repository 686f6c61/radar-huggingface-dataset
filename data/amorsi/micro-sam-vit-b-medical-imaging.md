# amorsi/micro-sam-vit-b-medical-imaging

## Resumen

`micro-sam vit_b_medical_imaging` es un checkpoint preentrenado del proyecto micro-sam, desarrollado por el grupo Computational Cell Analytics (MIT). Se trata de un espejo sin modificaciones de los pesos originales, publicados en HuggingFace por el usuario `amorsi`. El modelo es una adaptación del Segment Anything Model (SAM) con backbone ViT-B orientada a la segmentación de imágenes biomédicas y de microscopía, tarea en la que SAM genérico rinde por debajo de lo esperado por el dominio tan específico de las imágenes celulares.

El checkpoint se compone de dos ficheros, `model.pt` (encoder) y `decoder.pt`, y se usa dentro del ecosistema micro-sam invocándolo con `model_type="vit_b_medical_imaging"`. No se trata de un modelo de lenguaje, sino de un modelo de segmentación de imágenes, por lo que muchas de las filas habituales de esta ficha (idiomas, contexto, tool calling) no aplican y se marcan como no disponibles.

La relevancia del modelo radica en que ofrece un punto de partida específico para segmentación de estructuras celulares sin necesidad de reentrenar desde cero, y en que su publicación como espejo facilita el acceso desde HuggingFace. La información pública disponible es muy limitada: la model card es mínima y no incluye detalles de entrenamiento, benchmarks ni licencia explícita de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything Model (SAM) con backbone ViT-B |
| Parametros totales | no disponible (repo de 0.8 GB, coherente con ViT-B + decoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de segmentacion de imagenes) |
| Licencia | no disponible (la model card remite a los terminos de los pesos originales; el codigo de micro-sam es MIT) |
| Formato de pesos | PyTorch (`model.pt` y `decoder.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SAM: un encoder de imagen basado en Vision Transformer (ViT-B) que genera embeddings de la imagen, y un decoder ligero que, a partir de prompts (puntos, cajas o máscaras), produce máscaras de segmentación. En micro-sam el checkpoint se ha ajustado específicamente sobre datos biomédicos y de microscopía, lo que lo diferencia del SAM original entrenado con imágenes naturales.

No se dispone de información pública sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino con RLHF/DPO (no aplicables a segmentación). La model card indica únicamente que es una copia sin modificar del checkpoint del registro de micro-sam, verificada mediante hashes xxh128, y remite a la fuente original para los términos de licencia de los pesos.

## Capacidades

- Segmentación de imágenes biomédicas y de microscopía.
- Segmentación guiada por prompts: puntos, cajas delimitadoras y máscaras.
- Segmentación automática (generación de máscaras sin prompt explícito, según el flujo de micro-sam).
- Integración con el ecosistema micro-sam para tareas de segmentación celular.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No soporta capacidades multilingües ni modalidades de audio o vídeo.

## Casos de uso

- Segmentación de células en imágenes de microscopía: el modelo permite obtener máscaras de células individuales a partir de prompts de punto o caja, lo que acelera el análisis morfológico en laboratorios.
- Análisis de imágenes de fluorescencia: útil para separar estructuras marcadas y cuantificar áreas o conteos celulares en pipelines de imagen biomédica.
- Anotación asistida en investigación: el modelo puede preanotar imágenes para que un experto revise y corrija, reduciendo el tiempo de etiquetado manual.
- Segmentación de tejidos en histología: permite delimitar regiones de interés en cortes histológicos antes de un análisis posterior.
- Preprocesado en pipelines de imagen médica: genera máscaras que alimentan modelos posteriores de clasificación o cuantificación.
- Experimentación académica con SAM en dominio biomédico: sirve como punto de partida para ajuste fino o comparación con otros checkpoints de micro-sam.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (0.8 GB) y la arquitectura ViT-B, es esperable que quepa en GPUs de consumo, pero no se confirma en la información disponible.
- GPU recomendadas: no disponible.
- ¿Cabe en consumer GPU?: no confirmado en la información disponible.
- Opciones de despliegue: uso a través de la librería micro-sam (Python/PyTorch); no se documentan otros formatos (GGUF, ONNX) ni servidores de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| micro-sam vit_b_medical_imaging | SAM ViT-B | Biomédico/microscopía | no disponible | HuggingFace (espejo) |
| SAM (original, ViT-B) | SAM ViT-B | Imágenes naturales | Apache 2.0 (según Meta) | Público |
| micro-sam (otros checkpoints) | SAM ViT-B / ViT-L / etc. | Biomédico/microscopía | según checkpoint | Registro de micro-sam |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La model card no especifica la licencia de los pesos; es imprescindible consultar la fuente original antes de un uso comercial.
- El modelo es un espejo sin modificar; no hay garantías de mantenimiento ni soporte por parte del publicador en HuggingFace.
- Al ser un modelo de segmentación, no cubre tareas de texto, razonamiento ni agentes.
- Riesgo de degradación en dominios de imagen distintos al biomédico para el que fue ajustado.
- No se documentan sesgos, límites de resolución ni condiciones de contorno.
- Verificar la integridad de los pesos mediante los hashes xxh128 indicados en la model card antes de usarlos en producción.

## Enlaces

- HuggingFace: https://huggingface.co/amorsi/micro-sam-vit-b-medical-imaging
- Repositorio micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Registro de checkpoints (util.py): https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Pesos `model.pt`: https://owncloud.gwdg.de/index.php/s/f5Ol4FrjPQWfjUF/download
- Pesos `decoder.pt`: https://owncloud.gwdg.de/index.php/s/ahd3ZhZl2e0RIwz/download
