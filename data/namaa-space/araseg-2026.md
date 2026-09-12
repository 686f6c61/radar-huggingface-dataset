# NAMAA-Space/araseg-2026

## Resumen

AraSeg 2026 (NAMAA-Space/araseg-2026) no es un modelo individual, sino un repositorio "hub" que reúne los artefactos necesarios para reproducir los cuatro sistemas que NAMAA Community presentó a la Arabic Segmentation Shared Task 2026 (AraSeg, ArabicNLP 2026). El repositorio contiene las cabezas combinadoras ya ajustadas (medias de logits, un stacker lineal y decodificadores estructurales MEMM), sus umbrales de decisión y las matrices out-of-fold congeladas que permiten reajustar dichas cabezas. Los modelos de base que generan las predicciones no están aquí: viven en diecinueve repositorios de miembros, enlazados desde una colección aparte de HuggingFace.

La tarea es segmentación de texto árabe formulada como clasificación de tokens (pipeline `token-classification`), con cuatro subtareas cerradas: PA, NP, NoPnx-PA y NoPnx-NP. Los sistemas alcanzan F1 entre 87.0 y 94.4 en el test ciego, lo que los sitúa como referencia interna del equipo para esta edición del shared task. El repositorio se publicó el 12 de septiembre de 2026 bajo licencia MIT y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que no cuenta aún con validación externa de la comunidad.

Su relevancia es fundamentalmente metodológica y de reproducibilidad: documenta una estrategia de ensamblado heterogéneo (XLM-RoBERTa-large, Qwen3.5-9B, Gemma-4-12b, Naqta y Segment-any-Text como encoders; MEMM y stacking como combinadores) y conserva cachés que ya no se pueden regenerar porque los modelos de cinco folds que las produjeron dejaron de existir. Es, por tanto, material de interés para investigadores en PNL árabe y para quienes estudien técnicas de combinación de modelos en tareas de etiquetado secuencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo unico: hub de sistemas de segmentacion. Miembros basados en XLM-RoBERTa-large, Qwen3.5-9B, Gemma-4-12b, Naqta y Segment-any-Text; cabezas combinadoras de media de logits, stack lineal y decodificador estructural MEMM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene pesos de cabezas y decodificadores, pero no declara formato) |

Datos adicionales del repositorio: tamano 0.0 GB, 0 descargas, 0 likes, creado y actualizado el 2026-09-12.

## Arquitectura y entrenamiento

El repositorio no entrena un modelo monolítico. Define cuatro sistemas de segmentación construidos por ensamblado de diecinueve miembros, cada uno de los cuales es un modelo de clasificación de tokens. La combinación varía por subtarea: PA usa una media simple de logits sobre 3 miembros con umbral 0.25 (sin cabeza ajustada); NP usa un stacker lineal ajustado sobre matrices out-of-fold de 5 miembros con umbral 0.36; y NoPnx-PA y NoPnx-NP emplean decodificadores estructurales MEMM ajustados sobre 8 y 7 miembros respectivamente, con umbrales 0.46 y 0.34. El decodificador MEMM introduce estructura en la secuencia de etiquetas, lo que explica que NoPnx-PA mejore en el test ciego (89.9) respecto al test de práctica (87.82).

Los encoders de los miembros son heterogéneos: nueve de ellos parten de `FacebookAI/xlm-roberta-large`; cuatro (e32, e40, e41, e42) de `Qwen/Qwen3.5-9B`; uno (e33) de `google/gemma-4-12b`; dos (e69, e70) usan `MostafaMaroof/Naqta` como encoder base; y `sat_ft` se apoya en un modelo base de Segment-any-Text. Dos miembros (`e38` y `sat-ft`) aparecen en tres de los cuatro sistemas. Como innovación operativa destaca el caso de `e76`: se entrenó sobre texto con comas predichas por Naqta insertadas, de modo que reproducir NoPnx-PA exige ejecutar Naqta como paso de preprocesado en inferencia con `min_p=0.3` y coma latina (`,`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Segmentación de texto árabe como clasificación de tokens (token classification) en cuatro subtareas cerradas: PA, NP, NoPnx-PA y NoPnx-NP.
- Ensamblado de modelos heterogéneos mediante tres mecanismos distintos: media de logits, stacking lineal ajustado con predicciones out-of-fold y decodificación estructural con MEMM.
- Ajuste de umbrales de decisión por subtarea (0.25, 0.36, 0.46 y 0.34) para calibrar el equilibrio entre precisión y cobertura.
- Reajuste de cabezas a partir de matrices out-of-fold congeladas, sin necesidad de reentrenar los miembros.
- Soporte de tool calling / function calling: no disponible (la tarea es etiquetado secuencial, no generación).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no; el único idioma declarado es el árabe.
- Capacidades especiales (visión, audio, modo de razonamiento): no disponibles.

## Casos de uso

- Preprocesado para pipelines de PNL árabe: el sistema segmenta texto en unidades coherentes antes de análisis morfológico, etiquetado gramatical o parsing sintáctico, reduciendo la ambigüedad que introducen las formas sin segmentar.
- Anotación automática de corpus: con F1 de 87.0 a 94.4 en test ciego según subtarea, sirve para pre-anotar grandes volúmenes de texto árabe y reservar la revisión humana para los casos dudosos.
- Recuperación de información y motores de búsqueda en árabe: una segmentación consistente entre documentos y consultas mejora la coincidencia de términos y la calidad del índice invertido.
- Traducción automática: la pre-segmentación del lado origen normaliza la entrada y puede reducir errores de alineación con lenguas cuya tokenización difiere.
- Herramientas de anotación asistida para lingüistas: el modelo propone una segmentación inicial y el anotador corrige, lo que acelera la creación de recursos anotados.
- Post-procesado de OCR sobre documentos árabes: la segmentación corrige fronteras de palabra erróneas generadas por el reconocedor antes de la indexación o el archivado.
- Investigación en ensamblado de modelos: el repositorio funciona como banco de pruebas reproducible para comparar media de logits, stacking lineal y decodificación MEMM sobre la misma tarea.
- Segmentación para sistemas de voz (TTS/ASR): la división en unidades adecuadas mejora la prosodia y la sincronización en la síntesis de árabe.

## Benchmarks y rendimiento

Resultados declarados por el autor para los cuatro sistemas, con umbral y combinador utilizados:

| Subtarea | Combinador | Umbral | F1 test de practica | F1 test ciego |
|---|---|---|---|---|
| PA | Media de logits de 3 miembros | 0.25 | 94.49 | 94.4 |
| NP | Stack lineal ajustado con OOF sobre 5 miembros | 0.36 | 92.84 | 91.3 |
| NoPnx-PA | Decodificador estructural MEMM ajustado con OOF sobre 8 miembros | 0.46 | 87.82 | 89.9 |
| NoPnx-NP | Decodificador estructural MEMM ajustado con OOF sobre 7 miembros | 0.34 | 86.49 | 87.0 |

La información proporcionada no especifica la métrica exacta más allá de F1, ni el conjunto de evaluación, ni comparaciones con otros equipos del shared task.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende por completo del miembro o miembros que se ejecuten, no del repositorio hub.
- El repositorio en sí ocupa 0.0 GB y no contiene los checkpoints de los miembros, por lo que su coste de almacenamiento es despreciable frente al de las dependencias externas.
- Dependencias obligatorias que hay que descargar aparte: `FacebookAI/xlm-roberta-large` (9 miembros), `Qwen/Qwen3.5-9B` (e32, e40, e41, e42), `google/gemma-4-12b` (e33), `MostafaMaroof/Naqta` (e69, e70 como encoder y e76 en inferencia) y el modelo base de Segment-any-Text (sat_ft).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; dependerá del tamaño del miembro elegido, y el ensamblado completo de NoPnx-PA requiere además ejecutar Naqta como preprocesado, lo que suma carga.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos directamente comparables, porque este repositorio no es un modelo único sino un conjunto de cabezas combinadoras sobre miembros externos. A modo de referencia, los encoders declarados como dependencia son:

| Modelo | Uso en estos sistemas | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| FacebookAI/xlm-roberta-large | Encoder de 9 miembros | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Qwen/Qwen3.5-9B | Base de e32, e40, e41, e42 | 9B (segun denominacion) | no disponible | no disponible |
| google/gemma-4-12b | Base de e33 | 12B (segun denominacion) | no disponible | terminos propios de Gemma, no Apache-2.0 |
| MostafaMaroof/Naqta | Encoder de e69 y e70; preprocesado en e76 | no disponible | no disponible | no disponible |
| Segment-any-Text (base) | Base de sat_ft | no disponible | no disponible | no disponible |

Los recuentos de parámetros de Qwen3.5-9B y Gemma-4-12b se deducen de su denominación y no se confirman en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni un LLM: no puede usarse para generación de texto, diálogo ni razonamiento abierto.
- Monolingüe: el único idioma declarado es el árabe (`ar`); no hay evidencia de rendimiento en otras lenguas.
- El repositorio no es autónomo. Sin las dependencias externas (XLM-RoBERTa-large, Qwen3.5-9B, Gemma-4-12b, Naqta, Segment-any-Text) los sistemas no se ejecutan.
- Las cachés de `oof/` no se pueden regenerar: los modelos de cinco folds que las produjeron ya no existen, por lo que son la única vía para reajustar decodificadores y stacker. Además, las incluyen los folds `e75`, que no forman parte de ningún lock, y la puerta de 15 subconjuntos que seleccionó la composición final de NoPnx-PA no se puede reproducir sin ellas.
- `e76` exige ejecutar Naqta en tiempo de inferencia como preprocesado (`min_p=0.3`, coma latina), lo que añade una dependencia en producción y un coste de latencia no cuantificado.
- `google/gemma-4-12b` se rige por los términos propios de Gemma y no por Apache-2.0; conviene revisarlos antes de un uso comercial, aunque la licencia del hub sea MIT.
- La licencia MIT cubre este repositorio, pero no necesariamente los pesos de los miembros ni las dependencias externas, que mantienen sus propias condiciones.
- Con 0 descargas y 0 likes, no existe validación independiente de la comunidad ni informes de terceros sobre el comportamiento en dominios distintos del de evaluación.
- Riesgo de degradación fuera de distribución: los resultados de F1 proceden de la evaluación del shared task; no hay datos sobre otros géneros, registros o variedades del árabe.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de errores de segmentación sistemáticos en dominios no cubiertos por los datos de entrenamiento.
- La reproducción exacta depende del recetario publicado en el repositorio de GitHub; no se documentan aquí los hiperparámetros de entrenamiento de los miembros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-2026
- Coleccion de repositorios de miembros: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Codigo, configuraciones y receta de ejecucion: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Dependencia de encoder: https://huggingface.co/FacebookAI/xlm-roberta-large
- Dependencia de encoder: https://huggingface.co/Qwen/Qwen3.5-9B
- Dependencia de encoder: https://huggingface.co/google/gemma-4-12b
- Dependencia de encoder y preprocesado: https://huggingface.co/MostafaMaroof/Naqta
- Cita declarada por el autor: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a portales de resultados deportivos (Sofascore) y no guardan relacion con la ficha.
