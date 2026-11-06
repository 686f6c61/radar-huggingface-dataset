# hmarchant/sam3-litter-sv

## Resumen

SAM 3 street-view litter counter es un ajuste fino del modelo de segmentación y detección de imagen SAM 3 de Meta (facebook/sam3), publicado por el usuario hmarchant. Su propósito es muy concreto: detectar y contar residuos (litter) en fotografías de calle tipo street-view, utilizando una única indicación textual, `litter`. El modelo se emplea para construir un índice de residuos que permite comparar países y continentes.

Se trata de un fine-tune completo del checkpoint de SAM 3, no de un adaptador ligero, y mantiene el formato de pesos original (claves bajo el prefijo `detector.`). El repositorio ocupa 3,4 GB y se distribuye bajo la SAM License, la misma que el modelo base. No es un modelo generativo de texto: es un detector de objetos orientado a una tarea de conteo con umbral de confianza fijado.

Su relevancia es acotada pero práctica: demuestra cómo un modelo fundacional de segmentación puede especializarse con un conjunto de datos pequeño y anotaciones asistidas (Haiku) para producir una métrica reproducible (MAE de conteo de 0,760 sobre 1.536 imágenes de test) con sesgo controlado por continente. Es útil para equipos que quieran replicar pipelines de medición ambiental con datos de Mapillary.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (detector/segmentador de imagen con prompt textual), fine-tune completo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada de 1.008 px cuadrados) |
| Tipos de cuantizacion | no disponible (checkpoint en `sam3_litter_sv.pt`) |
| Idiomas soportados | no disponible (prompt de texto en inglés: `litter`) |
| Licencia | SAM License (license_name: sam-license) |
| Formato de pesos | PyTorch `.pt` (checkpoint `sam3_litter_sv.pt`, claves `detector.*`) |

## Arquitectura y entrenamiento

El modelo parte de SAM 3, el modelo de Meta para segmentación y detección guiada por prompt, y aplica un fine-tune completo sobre el checkpoint liberado. La entrada nativa es de 1.008 px cuadrados, sin reducción previa de la imagen (`--max-side 0`). La inferencia se realiza con el prompt textual `litter` y un umbral de confianza de 0,58 sobre el producto de presencia por puntuación de caja; el conteo es el número de cajas que superan ese umbral.

El entrenamiento utilizó 1.648 imágenes de street-view de Mapillary etiquetadas con Haiku. Los elementos dudosos se trataron como negativos con peso 0,5 y las cajas minadas que no eran residuos como negativos con peso 2. Las imágenes con 10 o más elementos se muestrearon cuatro veces más a menudo. Se eligió la época 4 de 6 según una validación de 1.656 imágenes. En test, con 1.536 imágenes nuevas de Mapillary y referencia construida con Haiku, se obtuvo MAE de conteo de 0,760, sesgo de +0,07 por imagen, recall del 48 % y precisión del 45 %; el sesgo de cada continente se mantuvo dentro de ±max(0,3, 25 % de su media de referencia).

## Capacidades

- Detección de residuos en imágenes de street-view mediante el prompt textual `litter`.
- Conteo de instancias: el número de cajas por encima del umbral de 0,58 se interpreta como recuento de residuos.
- Detección guiada por texto heredada de SAM 3 (prompt de concepto, no de caja).
- Procesamiento de imágenes a resolución nativa de 1.008 px sin reescalado previo.
- Generación de una señal agregada (índice de residuos) comparable entre países y continentes.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- Capacidades multilingües: no disponibles; el prompt documentado está en inglés.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Medición de limpieza urbana: procesar lotes de imágenes de Mapillary con `sam3_infer.py` y obtener recuentos de residuos por imagen para construir índices comparables entre ciudades.
- Comparación entre países y continentes: agregar los conteos por región y usar el sesgo controlado (±max(0,3, 25 % de la media)) para reportar diferencias con una incertidumbre explícita.
- Auditoría de campañas de recogida de basura: ejecutar el detector antes y después de una intervención en una zona y comparar el MAE de conteo frente a la referencia.
- Investigación en visión aplicada: usar el checkpoint como base para estudiar el efecto de anotaciones asistidas por Haiku y del minado de negativos en tareas de conteo.
- Monitorización de vía pública con cámaras fijas: aplicar el modelo a fotogramas de street-view para detectar acumulaciones de residuos y priorizar inspecciones.
- Generación de datasets etiquetados: emplear las detecciones por encima de 0,58 como preetiquetado para revisión humana en nuevas ciudades, dado el recall del 48 %.
- Evaluación de calidad de datos geoespaciales: cruzar los conteos con metadatos de Mapillary para detectar sesgos de cobertura por región.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MAE de conteo (test, 1.536 imágenes) | 0,760 |
| Sesgo por imagen | +0,07 |
| Recall | 48 % |
| Precisión | 45 % |
| Sesgo por continente | dentro de ±max(0,3, 25 % de la media de referencia) |
| Conjunto de validación | 1.656 imágenes (época 4 de 6) |
| Conjunto de entrenamiento | 1.648 imágenes etiquetadas con Haiku |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el checkpoint ocupa 3,4 GB en disco, por lo que el peso en memoria es del orden de varios GB más las activaciones a 1.008 px.
- GPU recomendadas: no disponible; SAM 3 requiere habitualmente GPU con memoria suficiente para imágenes de 1.008 px, pero no se especifica en la model card.
- Cabe en GPU de consumo: no confirmado; el tamaño del checkpoint (3,4 GB) sugiere que podría caber en GPUs de 8-12 GB, pero no hay dato oficial.
- Opciones de despliegue: script `scripts/sam3_infer.py` del repositorio litter-index, ejecutado dentro de un clon de `facebookresearch/sam3`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hmarchant/sam3-litter-sv | Detector fine-tune de SAM 3 | no disponible | Imagen 1.008 px | SAM License | Hugging Face, 0 descargas |
| facebook/sam3 | Detector/segmentador base | no disponible | Imagen (prompt textual) | SAM License | Hugging Face (modelo base) |
| Otros detectores de residuos especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en un único prompt (`litter`) y en imágenes de street-view; no es un detector general.
- Recall del 48 % y precisión del 45 %: aproximadamente la mitad de los residuos presentes no se detectan y cerca de la mitad de las detecciones son falsos positivos.
- El umbral de confianza de 0,58 es fijo y fue elegido para esta tarea; cambiarlo altera el conteo y la comparabilidad del índice.
- Las etiquetas de entrenamiento y referencia provienen de Haiku (anotación asistida), lo que introduce el sesgo del anotador en el ground truth.
- El sesgo por continente está acotado pero no es nulo; las comparaciones entre regiones deben reportar esa incertidumbre.
- Licencia SAM License: restricciones de uso comercial según los términos del modelo base; revisar el enlace de licencia antes de producción.
- No hay información sobre idiomas soportados ni sobre robustez ante condiciones de iluminación, clima u oclusión.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.
- El checkpoint debe ejecutarse con el código de `facebookresearch/sam3`; no se documentan conversiones a otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmarchant/sam3-litter-sv
- Modelo base SAM 3: https://huggingface.co/facebook/sam3
- Licencia SAM: https://huggingface.co/facebook/sam3
- Repositorio de código SAM 3: https://github.com/facebookresearch/sam3
- Repositorio litter-index (script `scripts/sam3_infer.py`): no disponible como URL en la información proporcionada
