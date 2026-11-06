# chiffonng/incidentbench-allsteps_lt2026

## Resumen

`incidentbench-allsteps_lt2026` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen2.5-7B-Instruct, publicado por el usuario chiffonng. No se trata de un modelo de propósito general, sino de un artefacto de investigación para una tarea muy concreta: el clasificador conjunto de IncidentBench, que debe emitir una única respuesta entre siete dominios de riesgo del MIT o la etiqueta `No incident (potential only)`. A partir de esa única respuesta se derivan tanto la detección de incidente como su categoría.

La variante `allsteps_lt2026` corresponde a un brazo experimental concreto: corte temporal anterior a 2026, configuración `nokev_nonamed_lt2026`, con todos los pasos registrados mostrados en el prompt (incluido el incidente) y redacción neutra, manteniendo sin cambios el espacio de etiquetas y las filas. El adaptador se aplica sin fusionar sobre el modelo base, tal y como se hizo en todas las ejecuciones reportadas del proyecto.

Es relevante únicamente en el contexto de reproducibilidad de IncidentBench: las etiquetas de entrenamiento son generadas por modelo ("silver") bajo la guía de anotación del proyecto, no son oro humano, y el propio autor advierte que el modelo infravalora incidentes (under-calls) y no debe usarse para tomar decisiones sobre sistemas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7B en el modelo base; adaptador LoRA de rango 16 (recuento exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT, se aplica sin fusionar sobre el base) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parametros. Se aplica sin fusionar sobre el modelo base en todas las ejecuciones reportadas. El stack de entrenamiento declarado es transformers 5.9.0 y peft 0.19.1. El repositorio ocupa 0,2 GB, coherente con un adaptador de bajo rango mas los manifiestos de datos y receta.

La tarea entrenada es un clasificador conjunto: el modelo debe producir una sola respuesta entre siete dominios de riesgo del MIT o la etiqueta `No incident (potential only)`, de la que se leen tanto la deteccion como la categoria. Las etiquetas de entrenamiento son "silver", escritas por modelo bajo la guia de anotacion del proyecto, no anotaciones oro humanas. El brazo `allsteps_lt2026` usa corte temporal anterior a 2026, configuracion `nokev_nonamed_lt2026`, muestra todos los pasos registrados incluido el incidente y emplea redaccion neutra sin alterar el espacio de etiquetas ni las filas. El prompt de entrenamiento se genera con la transformacion `allsteps` de `train/build_data.py`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de incidentes en siete dominios de riesgo del MIT mas la etiqueta `No incident (potential only)`, en una unica respuesta de la que se derivan deteccion y categoria.
- Procesamiento de trazas con todos los pasos registrados, incluido el paso del incidente, en el prompt de entrada (variante `allsteps`).
- Decodificacion greedy recomendada por el autor para el servicio.
- Despliegue como modulo LoRA en vLLM junto al modelo base, con `--enable-lora --max-lora-rank 16`.
- Capacidades generales de generacion de texto, razonamiento y codigo heredadas de Qwen2.5-7B-Instruct, no evaluadas ni validadas para este adaptador.
- Soporte de tool calling, agentes, vision o audio: no disponible para este adaptador.

## Casos de uso

- Reproduccion de experimentos de IncidentBench: cargar el adaptador en vLLM con el prompt exacto de la transformacion `allsteps` y decodificacion greedy para replicar las puntuaciones reportadas en el informe del proyecto.
- Investigacion sobre clasificacion de riesgos con etiquetas silver: usar el adaptador como linea base para estudiar el efecto de etiquetas generadas por modelo frente a anotaciones humanas en tareas de categorizacion de incidentes.
- Analisis de ablaciones del proyecto: comparar este brazo (`allsteps_lt2026`) con otras variantes de corte temporal o de presentacion de pasos para aislar el impacto del formato del prompt.
- Estudio de modos de fallo: el autor documenta que el modelo infravalora incidentes (under-calls), lo que lo hace util como caso de estudio de sesgos de deteccion en clasificadores entrenados con datos silver.
- Evaluacion de infraestructura de servicio LoRA: servir el adaptador sin fusionar con vLLM y medir latencia y throughput del enrutado de modulos LoRA sobre un base de 7B.
- Docencia y formacion: ejemplo didactico de adaptacion PEFT de bajo rango para una tarea de clasificacion cerrada con espacio de etiquetas fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe de IncidentBench para puntuaciones y modos de fallo conocidos, pero no incluye cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para este adaptador; depende de la cuantizacion del base Qwen2.5-7B-Instruct, que no se detalla. Un base de 7B en precision completa requiere del orden de 14-16 GB solo para pesos, mas memoria para KV cache y activaciones.
- GPU recomendadas: no especificadas por el autor. El despliegue documentado usa vLLM con soporte LoRA, lo que en la practica implica GPUs de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM.
- Compatibilidad con consumer GPU: no confirmada en la informacion disponible.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules allsteps_lt2026=chiffonng/incidentbench-allsteps_lt2026`. Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-allsteps_lt2026 | 7B base + LoRA r=16 | no disponible | Clasificacion de incidentes IncidentBench | other | Hugging Face (11 descargas) |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en la informacion | Proposito general | no disponible en la informacion | Hugging Face |
| Otras variantes de IncidentBench del mismo autor | no disponible | no disponible | Clasificacion de incidentes | other | no disponible en la informacion |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Etiquetas de entrenamiento silver (generadas por modelo), no oro humano: los resultados no equivalen a un clasificador validado con anotacion experta.
- Modo de fallo documentado: el modelo infravalora incidentes (under-calls), lo que reduce la sensibilidad de deteccion.
- Artefacto de investigacion: el autor prohibe explicitamente su uso para decisiones sobre sistemas reales.
- Licencia `other`: no se detallan los terminos, por lo que el uso comercial no esta garantizado y requiere revision de la licencia del adaptador y del modelo base.
- Idiomas soportados no declarados; el adaptador esta especializado en una tarea concreta y no debe asumirse comportamiento multilingue validado.
- Longitud de contexto no especificada en la informacion proporcionada.
- El adaptador debe aplicarse sin fusionar sobre Qwen2.5-7B-Instruct y con el prompt exacto del brazo; otros formatos de prompt invalidan las puntuaciones reportadas.
- Repositorio con muy baja adopcion (11 descargas, 0 likes), sin senales de mantenimiento comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/chiffonng/incidentbench-allsteps_lt2026
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe de IncidentBench: no disponible como enlace en la informacion proporcionada
- Manifiestos del repositorio: `data_manifest.json` y `train_manifest.json` (incluidos en el repositorio de Hugging Face)
- Script de construccion de datos: `train/build_data.py` (transformacion `allsteps`)
