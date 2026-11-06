# chiffonng/incidentbench-binary_cond

## Resumen

IncidentBench-binary_cond es un adaptador LoRA de rango 16 sobre el modelo base Qwen/Qwen2.5-7B-Instruct, publicado por el usuario chiffonng en Hugging Face. Forma parte del proyecto IncidentBench, un conjunto de experimentos orientados a la clasificación conjunta de incidentes en sistemas según las siete categorías de riesgo definidas por el MIT, con una etiqueta adicional para casos en los que solo existe un riesgo potencial sin incidente materializado. El adaptador responde a una única pregunta y de esa respuesta se derivan tanto la detección (si hay incidente o no) como la categoría asignada.

Este artefacto concreto corresponde al brazo de control del Experimento 4: una sonda binaria formulada con el condicional "If this becomes an incident". No se trata de un modelo de propósito general ni de un producto listo para producción, sino de un artefacto de investigación cuyo objetivo es medir el comportamiento de un clasificador ante distintas formulaciones de prompt. El autor advierte explícitamente de que las etiquetas de entrenamiento son "silver" (generadas por modelo bajo una guía de anotación) y no oro humano, y de que el adaptador tiende a infra-detectar incidentes.

La relevancia de esta ficha es acotada: sirve como referencia para quienes reproducen los experimentos de IncidentBench o quieren entender cómo se comporta un LoRA de clasificación sobre Qwen2.5-7B-Instruct en tareas de evaluación de riesgo. No debe confundirse con un modelo de clasificación de riesgos validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA sobre un base de 7B; el repo pesa 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se sirve sin fusionar; la cuantizacion aplicaria al base) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT); se aplica sin fusionar sobre el base |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Rango LoRA | 16 |
| Stack de entrenamiento | transformers 5.9.0, peft 0.19.1 |
| Decodificacion recomendada | greedy |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parametros. No se modifican los pesos del base: el adaptador se carga por separado y se aplica sin fusionar en todas las ejecuciones reportadas del proyecto. El entrenamiento se realizo con transformers 5.9.0 y peft 0.19.1.

La tarea es una clasificación conjunta: el modelo emite una única respuesta que corresponde a una de las siete categorías de riesgo del MIT o a la etiqueta `No incident (potential only)`. De esa respuesta se extraen tanto la detección binaria como la categoría. Las etiquetas de entrenamiento son "silver", generadas por modelo siguiendo la guía de anotación del proyecto, no anotaciones humanas gold. El prompt de este brazo concreto emplea la formulación condicional "If this becomes an incident", y los detalles de formato de prompt, filas de entrenamiento y hashes estan en `data_manifest.json`, mientras que la receta de entrenamiento esta en `train_manifest.json`.

## Capacidades

- Clasificacion de incidentes en siete categorias de riesgo del MIT, con etiqueta adicional para riesgo potencial sin incidente.
- Deteccion binaria derivada de la misma respuesta que la categoria (clasificacion conjunta en una sola pasada).
- Respuesta a una formulacion de prompt concreta (condicional "If this becomes an incident"), pensada como brazo de control experimental.
- Inferencia con decodificacion greedy recomendada por el autor.
- Despliegue como modulo LoRA en vLLM junto al base.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking especificas del adaptador.

## Casos de uso

- Reproduccion de experimentos: cargar el adaptador con el prompt exacto del transform `binary_cond` en `train/build_data.py` para replicar el brazo de control del Experimento 4 y comparar formulaciones de prompt.
- Analisis de sensibilidad al phrasing: contrastar esta sonda binaria condicional con otras variantes del proyecto para medir como cambia la deteccion segun la redaccion de la pregunta.
- Evaluacion de clasificadores silver: usar el adaptador como referencia de comportamiento de un modelo entrenado con etiquetas generadas por modelo frente a anotaciones humanas.
- Estudio de fallos de infra-deteccion: el autor documenta que el adaptador infra-llama incidentes; sirve para caracterizar ese modo de fallo en pipelines de evaluacion de riesgo.
- Prototipado de pipelines de clasificacion de incidentes sobre Qwen2.5-7B-Instruct: integrar el adaptador en vLLM con `--enable-lora --max-lora-rank 16` para probar la infraestructura de serving antes de sustituir el clasificador por uno validado.
- Docencia e investigacion en NLP aplicado a riesgo: utilizar el artefacto como ejemplo de LoRA de clasificacion y de las cautelas necesarias con etiquetas silver.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al informe de IncidentBench para puntuaciones y modos de fallo conocidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al aplicarse sobre Qwen2.5-7B-Instruct sin fusionar, los requisitos son los del base mas el pequeno overhead del adaptador (repo de 0,2 GB).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible; depende de la cuantizacion aplicada al base, que no se documenta.
- Opciones de despliegue: vLLM con soporte LoRA, segun el comando del autor: `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules binary_cond=chiffonng/incidentbench-binary_cond`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-binary_cond | LoRA r=16 sobre 7B | no disponible | Clasificacion de incidentes (brazo de control) | other | Hugging Face, 10 descargas |
| Qwen/Qwen2.5-7B-Instruct (base) | 7B | no disponible en esta ficha | Generacion general con instrucciones | no disponible en esta ficha | Hugging Face |
| Otros brazos de IncidentBench | LoRA sobre el mismo base | no disponible | Variantes de prompt del mismo clasificador | other | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Etiquetas de entrenamiento "silver" generadas por modelo, no oro humano: los resultados no equivalen a un clasificador validado.
- El autor documenta infra-deteccion de incidentes como modo de fallo conocido.
- Artefacto de investigacion: el propio autor indica que no debe usarse para decisiones sobre sistemas reales.
- Licencia "other": deben revisarse los terminos antes de cualquier uso, incluido el comercial.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada en la informacion disponible.
- El adaptador debe aplicarse sin fusionar y con el prompt exacto del brazo `binary_cond`; desviarse del formato puede invalidar el comportamiento reportado.
- Riesgo de alucinacion inherente al base Qwen2.5-7B-Instruct, no caracterizado para esta tarea.
- Popularidad muy baja (10 descargas, 0 likes): escasa validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chiffonng/incidentbench-binary_cond
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
