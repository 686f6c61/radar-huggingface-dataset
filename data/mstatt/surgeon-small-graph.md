# mstatt/surgeon-small-graph

## Resumen

El modelo `mstatt/surgeon-small-graph` es un artefacto publicado en Hugging Face por el usuario `mstatt` (Michael Stattelman), identificado como un modelo de visión basado en redes neuronales convolucionales (CNN) con una confianza de clasificación del 78 %. El repositorio no contiene pesos descargables (tamaño 0.0 GB) y la única información disponible es una model card generada automáticamente por la herramienta "Model Surgeon", que documenta el historial de operaciones realizadas sobre el archivo original `FALCONSAI_Light_aug90-h128-L4_20260729-133521.pt`. El modelo declara 189 434 parámetros distribuidos en 36 tensores, con un coste computacional estimado de 0.000376 GFLOPs.

La relevancia de este repositorio no reside en el propio modelo (del que no se aportan datos de entrenamiento, capacidades ni casos de uso), sino en el sistema de procedencia y verificación que lo acompaña: una atestación firmada (`lineage.intoto.jsonl`) y un script de verificación offline. Este enfoque pretende cumplir requisitos de documentación técnica similares a los del anexo IV de la Ley de IA de la UE, aunque el propio autor aclara que se trata de "evidencia, no asesoramiento legal". En la práctica, se trata de una demostración técnica de trazabilidad de modelos más que de un modelo utilizable para tareas reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (visión), 78 % de confianza en la identificación |
| Parametros totales | 189 434 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no se registran cuantizaciones (0 tensores convertidos F32→F16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | pytorch (archivo .pt, 0.8 MB según el registro) |

## Arquitectura y entrenamiento

La model card indica que la arquitectura es una red convolucional (CNN) destinada a tareas de visión, aunque no se declara la tarea concreta. El nombre del archivo original (`FALCONSAI_Light_aug90-h128-L4`) sugiere una red ligera con 128 canales ocultos y 4 capas, posiblemente aumentada con un 90 % de datos sintéticos, pero esto es una interpretación no confirmada. No se proporciona información sobre el dataset de entrenamiento, el número de tokens (irrelevante para visión), ni sobre técnicas de alineación como RLHF o DPO. El registro de "cirugía" documenta tres operaciones: carga del archivo, análisis forense (sin anomalías) y una prueba estructural que pasa correctamente. No se registran fusiones de pesos ni cuantizaciones.

## Capacidades

No se dispone de información sobre las capacidades funcionales del modelo. La model card no describe tareas de generación, clasificación, detección ni ninguna otra habilidad. El único dato verificable es que el modelo supera una prueba de integridad estructural offline (`load_and_test.py`), lo que confirma que los tensores pueden cargarse y ejecutarse, pero no qué salidas produce. No hay evidencia de soporte para tool calling, agentes, razonamiento multilingüe ni modos especiales.

## Casos de uso

No se pueden enumerar casos de uso concretos porque el repositorio no aporta información sobre la tarea prevista, el dominio de aplicación ni el rendimiento esperado. El modelo parece ser un ejemplo de demostración para la herramienta Model Surgeon, más que un artefacto listo para producción. Cualquier aplicación práctica requeriría primero conocer la tarea de visión para la que fue entrenado y validar su comportamiento con datos reales, algo que no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona un "compute estimate" de 0.000376 GFLOPs, que el propio autor define como "métrica de comparación, no una medición". No hay datos de precisión, exactitud, F1 ni ninguna otra métrica sobre conjuntos de referencia como ImageNet, COCO u otros.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación. Dado el tamaño del modelo (189 434 parámetros y 0.8 MB de peso), se puede inferir que es extremadamente ligero y ejecutable en cualquier CPU moderna o en una GPU integrada, pero esta es una estimación basada en el tamaño y no en datos oficiales. No se mencionan opciones de despliegue (vLLM, llama.cpp, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría (CNN de visión de tamaño similar) con los que establecer una comparación objetiva, ya que no se dispone de información sobre la tarea ni sobre el rendimiento de este modelo.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo (tamaño 0.0 GB), por lo que no es posible descargarlo ni utilizarlo directamente desde Hugging Face.
- No se declara licencia, lo que impide conocer las condiciones de uso comercial o modificación.
- No hay información sobre el dataset de entrenamiento, posibles sesgos o riesgos de alucinación (aunque al ser un modelo de visión, el concepto de alucinación se aplica de forma distinta).
- La model card es generada automáticamente por una herramienta de terceros y no incluye validación externa de rendimiento.
- El autor indica que la atestación firmada es "evidencia, no asesoramiento legal", por lo que su valor para cumplir regulaciones debe ser evaluado por un profesional.
- No se han realizado pruebas de imagen tisular ("tissue imaging: not run"), lo que sugiere que el modelo no ha sido validado en el contexto médico que su nombre podría sugerir.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mstatt/surgeon-small-graph
- Página de modelos del autor: https://huggingface.co/mstatt/models
- Perfil de GitHub del autor: https://github.com/mstatt
- Verificador público de Model Surgeon: https://surgeon.falcons.ai/verify (mencionado en la model card)
