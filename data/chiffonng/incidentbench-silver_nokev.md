# chiffonng/incidentbench-silver_nokev

## Resumen

incidentbench-silver_nokev es un adaptador LoRA (r=16) desarrollado por el usuario chiffonng sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Su proposito es actuar como clasificador conjunto para IncidentBench: a partir de una unica respuesta, el adaptador determina simultaneamente si existe un incidente y, en caso afirmativo, lo asigna a una de las siete categorias de riesgo definidas por MIT, o bien lo clasifica como "No incident (potential only)". Se trata, por tanto, de un artefacto de investigacion orientado a evaluar el comportamiento de clasificacion de incidentes, no de un modelo de proposito general.

El adaptador responde a una pregunta experimental concreta dentro del proyecto IncidentBench (Exp 2): si eliminar los registros de CISA KEV, que constituyen casi todos los ejemplos negativos del conjunto, mejora el rendimiento del clasificador. Las etiquetas de entrenamiento son generadas por el propio modelo ("silver") siguiendo la guia de anotacion del proyecto, y no proceden de anotacion humana ("gold"). El autor advierte explicitamente de que se trata de un artefacto de investigacion y de que no debe emplearse para tomar decisiones sobre sistemas reales.

El modelo se distribuye como adaptador PEFT sin fusionar con el modelo base, con un tamano de repositorio de aproximadamente 0,2 GB. La relevancia actual es limitada y acotada al ambito de la investigacion en clasificacion de incidentes de seguridad; su numero de descargas (15) y la ausencia de "likes" reflejan un uso muy restringido dentro de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en safetensors |
| Libreria | peft |
| Rango LoRA | 16 |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamano del repositorio | 0,2 GB |
| Version de transformers | 5.9.0 |
| Version de peft | 0.19.1 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7,6 mil millones de parametros, mediante Low-Rank Adaptation con rango 16. El adaptador se aplica sin fusionar sobre el modelo base, tal como se hizo en todas las ejecuciones reportadas del proyecto. El entrenamiento se realizo con transformers 5.9.0 y peft 0.19.1, empleando decodificacion greedy en inferencia y un formato de prompt especifico (transformacion `orig` de `train/build_data.py`).

La innovacion metodologica del experimento no reside en la arquitectura, sino en el diseno del conjunto de datos: se eliminan los registros de CISA KEV (que constituyen casi todos los ejemplos negativos) para medir su impacto en la clasificacion. Las etiquetas de entrenamiento son generadas por el modelo ("silver") siguiendo la guia de anotacion del proyecto, lo que introduce un sesgo conocido: el adaptador tiende a infraclasificar incidentes (under-calls). El manifiesto de datos (`data_manifest.json`) recoge el formato de prompt, las filas de entrenamiento y los hashes; la receta de entrenamiento esta en `train_manifest.json`. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion conjunta de incidentes: una unica respuesta del modelo indica tanto la deteccion (si hay incidente o no) como la categoria de riesgo MIT asignada.
- Clasificacion en siete dominios de riesgo de MIT mas la categoria "No incident (potential only)".
- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct (no evaluados especificamente en este adaptador).
- Soporte de tool calling y function calling: no documentado para este adaptador; disponible en el modelo base segun su propia documentacion.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion en clasificacion de incidentes de seguridad: el adaptador sirve para reproducir el experimento Exp 2 del proyecto IncidentBench y comparar el efecto de eliminar los registros CISA KEV del conjunto de entrenamiento. Es su uso principal y documentado.
- Evaluacion de sesgos en etiquetado silver: permite estudiar como las etiquetas generadas por modelo afectan a la deteccion de incidentes y a la asignacion de categorias de riesgo MIT, comparando con variantes entrenadas con otros conjuntos.
- Analisis de infraclasificacion (under-calling): dado que el autor documenta este modo de fallo, el adaptador puede emplearse para medir la tasa de falsos negativos en tareas de clasificacion de incidentes dentro de un entorno controlado de investigacion.
- Reproducibilidad de resultados: junto con los manifiestos de datos y entrenamiento, permite replicar las ejecuciones reportadas en el informe de IncidentBench con vLLM y decodificacion greedy.
- Estudio de adaptadores LoRA de bajo rango en tareas de clasificacion: sirve como caso de referencia para analizar el rendimiento de LoRA r=16 aplicado sin fusion sobre un modelo de 7B en una tarea de clasificacion multiclase.
- Docencia y formacion en evaluacion de modelos: util como ejemplo practico de artefacto de investigacion con limitaciones explicitas y advertencias de uso, adecuado para discutir buenas practicas de documentacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al informe de IncidentBench para consultar las puntuaciones y los modos de fallo conocidos, pero dichos datos no se incluyen en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 15-16 GB en FP16 y en torno a 5-6 GB en cuantizacion de 4 bits, aunque estas cifras no las aporta la model card.
- GPU recomendadas: no especificadas por el autor. El despliegue documentado se realiza con vLLM, lo que tipicamente implica GPUs de clase A100, H100 o similares con suficiente VRAM para el modelo base.
- Compatibilidad con GPU de consumo: no documentada. El modelo base de 7B podria caber en GPUs de consumo con cuantizacion, pero el adaptador se distribuye para uso sin fusionar con vLLM, lo que no es el flujo habitual en hardware de consumo.
- Opciones de despliegue: vLLM con soporte LoRA, mediante el comando `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules silver_nokev=chiffonng/incidentbench-silver_nokev`. No se documentan otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores o modelos comparables de la misma categoria (clasificadores de incidentes sobre Qwen2.5-7B-Instruct u otros modelos base).

## Limitaciones y advertencias

- Artefacto de investigacion: el autor advierte explicitamente de que no debe usarse para tomar decisiones sobre sistemas reales.
- Etiquetas silver: el entrenamiento emplea etiquetas generadas por modelo, no anotacion humana gold, lo que introduce ruido y sesgo en la clasificacion.
- Infraclasificacion conocida: el adaptador tiende a no declarar incidentes cuando deberia (under-calls), segun documenta el autor.
- Eliminacion de CISA KEV: el experimento suprime casi todos los ejemplos negativos del conjunto, lo que puede distorsionar la calibracion del clasificador.
- Licencia "other": no se detallan los terminos exactos; es necesario consultar las condiciones del repositorio antes de cualquier uso, incluido el comercial.
- Idiomas soportados no especificados: no se documenta el comportamiento multilingue del adaptador.
- Longitud de contexto no documentada para el adaptador: se desconoce si se mantiene la del modelo base o si el entrenamiento la modifica.
- Numero de descargas muy bajo (15) y ausencia de validacion comunitaria: no hay evidencia externa de robustez.
- Dependencia del formato de prompt: el adaptador requiere el prompt especifico del proyecto (transformacion `orig`) y decodificacion greedy; otros formatos pueden degradar el rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/chiffonng/incidentbench-silver_nokev
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe de IncidentBench: no disponible como enlace en la informacion proporcionada
- Repositorio del proyecto (referencias a `data_manifest.json`, `train_manifest.json`, `train/build_data.py`): no disponible como enlace en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
