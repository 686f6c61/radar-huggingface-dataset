# aruneshpratapsingh/tds-carbon-card

## Resumen

El repositorio `aruneshpratapsingh/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono y consumo energético asociado a una ejecución de entrenamiento de un modelo no especificado. Forma parte de una actividad académica denominada TDS GA8, cuyo objetivo es documentar la huella ambiental de un proceso de pre-entrenamiento. El autor, Arunesh Pratap Singh, publica en Hugging Face un conjunto de métricas calculadas con CodeCarbon, una herramienta estándar para estimar emisiones de CO₂ en entrenamientos de modelos.

Los datos reportados indican que el entrenamiento se realizó sobre una GPU NVIDIA H100 en la región europe-north1, con un total de 123,9 horas de GPU, un consumo energético de 138,768 kWh y unas emisiones de 16,652 kg de CO₂ equivalente (considerando un PUE de 1,6). No se especifica qué modelo se entrenó, su arquitectura, tamaño ni propósito. Por tanto, este repositorio no es un modelo utilizable para inferencia, sino una ficha de auditoría ambiental.

La relevancia de este tipo de registros radica en la creciente preocupación por el impacto ecológico de la IA. Iniciativas como OpenCarbonEval (arXiv:2405.12843) buscan estandarizar la estimación de emisiones, y repositorios como este ejemplifican la práctica de documentar la huella de carbono de los entrenamientos. Sin embargo, al carecer de cualquier artefacto de modelo, su utilidad práctica para desarrolladores es nula como recurso de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de documentacion) |

Datos adicionales reportados en la model card:

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | NVIDIA H100 (1 GPU) |
| Modo de entrenamiento | pre-training |
| Region del datacenter | europe-north1 |
| Horas de GPU | 123,9 h |
| PUE del datacenter | 1,6 |
| Energia total consumida | 138,768 kWh |
| Emisiones de CO₂ equivalente | 16,652 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo que se entrenó. El repositorio únicamente documenta el proceso de entrenamiento a nivel de consumo de recursos. Según la model card, se trató de un pre-training ejecutado sobre una GPU NVIDIA H100 en la region europe-north1 de Google Cloud. El tiempo total de computo fue de 123,9 horas, con un factor de eficiencia energetica del centro de datos (PUE) de 1,6. La energia total consumida se calcula en 138,768 kWh, lo que resulta en 16,652 kg de CO₂ equivalente, usando la metodologia de CodeCarbon.

No se menciona el dataset utilizado, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se indica ninguna innovacion arquitectonica o de entrenamiento. El repositorio es puramente una ficha de emisiones, sin artefactos de modelo ni codigo de entrenamiento.

## Capacidades

- No aplica: este repositorio no contiene un modelo entrenado ni capacidades de inferencia.
- No se puede generar texto, codigo, ni realizar razonamiento.
- No soporta tool calling, agentes, ni procesamiento multimodal.
- No tiene capacidades multilingues ni de vision.
- Su unico contenido es un conjunto de metadatos sobre emisiones de carbono.

## Casos de uso

- Auditoria ambiental de entrenamientos de IA: el repositorio sirve como ejemplo de como documentar la huella de carbono de un entrenamiento, util para empresas que necesitan reportar su impacto ecologico.
- Educacion y formacion en IA sostenible: puede usarse en cursos o talleres para ilustrar la metodologia de calculo de emisiones con CodeCarbon y la importancia de medir el consumo energetico.
- Referencia para la elaboracion de model cards con seccion de emisiones: desarrolladores que quieran incluir metricas ambientales en sus propias fichas pueden tomar este formato como plantilla.
- Investigacion sobre eficiencia energetica: los datos de este registro pueden compararse con otros entrenamientos para estudiar la relacion entre hardware, tiempo y emisiones.
- Cumplimiento normativo: organizaciones que deban reportar su impacto ambiental pueden usar este tipo de registros como evidencia de sus practicas de medicion.
- Desarrollo de herramientas de estimacion de carbono: los valores reportados pueden servir como datos de validacion para herramientas como OpenCarbonEval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de rendimiento de ningun modelo, ya que no es un modelo en si.

## Requisitos de hardware

- No aplica para inferencia, ya que no existe un modelo que ejecutar.
- El entrenamiento documentado utilizo una GPU NVIDIA H100, que es un hardware de gama alta para centros de datos.
- No se proporcionan requisitos de VRAM, latencia ni throughput, al no haber modelo.
- Para reproducir el entrenamiento (si se conociera el modelo), se necesitaria al menos una GPU H100 con 80 GB de VRAM, pero no se especifica el software de despliegue.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este repositorio no contiene un modelo de IA. No se puede comparar con alternativas como Llama, Mistral u otros, ya que carece de arquitectura, pesos o capacidades.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede descargar, ejecutar ni integrar en ningun flujo de trabajo.
- La informacion sobre el entrenamiento es incompleta: no se indica que modelo se entrenó, con que datos ni con que objetivo.
- Las metricas de emisiones dependen de la metodologia de CodeCarbon y del factor de emision de la region europe-north1; pueden no ser directamente comparables con otras estimaciones.
- No hay garantia de que los datos sean verificables externamente, ya que no se aporta el codigo de entrenamiento ni los logs.
- La licencia no esta especificada, por lo que no se puede determinar si el contenido puede reutilizarse comercialmente.
- El repositorio parece ser un ejercicio academico y no una publicacion tecnica destinada a produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aruneshpratapsingh/tds-carbon-card
- Repositorio similar de otro autor: https://huggingface.co/Pranav1003/tds-carbon-card
- Perfil del autor: https://huggingface.co/aruneshpratapsingh
- Articulo relacionado sobre estimacion de emisiones: https://arxiv.org/abs/2405.12843 (OpenCarbonEval)
- Articulo sobre IA y emisiones de carbono: https://www.sciencedirect.com/science/article/pii/S1574954123001942
