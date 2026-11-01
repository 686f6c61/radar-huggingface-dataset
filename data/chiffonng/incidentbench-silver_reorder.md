# chiffonng/incidentbench-silver_reorder

## Resumen

`incidentbench-silver_reorder` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen2.5-7B-Instruct por el usuario de HuggingFace chiffonng. Forma parte del proyecto IncidentBench, un banco de pruebas para la clasificación conjunta de incidentes en sistemas de inteligencia artificial bajo las siete categorías de riesgo del MIT. El adaptador convierte al modelo base en un clasificador de una sola respuesta: a partir de un prompt, devuelve directamente la categoría de incidente detectada o la etiqueta "No incident (potential only)", de modo que tanto la detección como la categorización se leen de esa misma salida.

La variante `silver_reorder` se distingue por una modificación concreta del formato de respuesta: coloca el estado de realización (realizado o potencial) y la severidad antes de la clase en la respuesta generada. El entrenamiento se realizó con etiquetas generadas por el propio modelo ("silver") siguiendo la guía de anotación del proyecto, no con anotaciones humanas gold. El autor lo describe explícitamente como un artefacto de investigación y advierte de que no debe usarse para tomar decisiones sobre sistemas reales.

Con solo 10 descargas y 0 likes en el momento de la consulta, se trata de un modelo de nicho, orientado a experimentación reproducible dentro del proyecto IncidentBench más que a uso general. Su interés radica en documentar recetas de ajuste fino para clasificación de riesgos y en servir como punto de comparación entre variantes del mismo conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; adaptador LoRA de rango 16 (tamano del repo 0.2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sin fusionar sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parametros. El ajuste se realizó con LoRA de rango 16 usando la libreria PEFT (version 0.19.1) junto con transformers 5.9.0. El adaptador modifica el modelo base para que emita una unica respuesta que contiene la clasificacion de incidente segun las siete categorias de riesgo del MIT, o bien la etiqueta "No incident (potential only)"; deteccion y categoria se derivan de esa misma respuesta.

El entrenamiento emplea etiquetas "silver" generadas por modelo bajo la guia de anotacion del proyecto, no anotaciones humanas gold. La variante `reorder` se centra en el orden de los elementos de la respuesta: situa el estado de realizacion y la severidad antes de la clase. Los detalles de formato de prompt, filas de entrenamiento y hashes estan en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`, ambos en el repositorio. El autor indica que la inferencia debe hacerse con decodificacion greedy y con el prompt especifico de esta variante (transformacion `orig` de `train/build_data.py`).

## Capacidades

- Clasificacion de incidentes de IA en siete categorias de riesgo del MIT en una sola respuesta.
- Deteccion conjunta: distingue entre incidente realizado y potencial ("No incident (potential only)").
- Emision estructurada de estado de realizacion, severidad y clase en ese orden (variante reorder).
- Clasificacion de texto de un solo turno orientada a tareas de anotacion.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en clasificacion de riesgos de IA: el adaptador permite reproducir los experimentos del proyecto IncidentBench y comparar variantes de formato de respuesta sobre el mismo conjunto de datos.
- Anotacion asistida de corpus: puede usarse para preetiquetar textos de incidentes segun las siete categorias del MIT antes de una revision humana, siempre con supervision.
- Estudio de orden de campos en salidas estructuradas: la variante reorder sirve para medir el efecto de colocar realizacion y severidad antes de la clase en la precision de clasificacion.
- Evaluacion de etiquetas silver frente a gold: util para cuantificar el sesgo que introduce el entrenamiento con etiquetas generadas por modelo.
- Docencia y tutoriales de PEFT: ejemplo reproducible de adaptador LoRA de rango 16 sobre un modelo de 7B con receta y manifiestos publicados.
- Despliegue de referencia con vLLM: el autor documenta el comando de servicio con `--enable-lora --max-lora-rank 16`, util para probar infraestructura de adaptadores multiples.
- Analisis de fallos conocidos: el autor senala que el modelo infravalora incidentes (under-calls), lo que permite estudiar modos de fallo en clasificadores de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a los resultados y modos de fallo conocidos en el informe de IncidentBench, pero no se incluyen cifras en la model card ni en los metadatos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen2.5-7B-Instruct (7B) y de la cuantizacion elegida.
- El adaptador LoRA en si ocupa 0.2 GB en el repositorio; el coste principal lo determina el modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Despliegue: el autor documenta vLLM con `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules silver_reorder=chiffonng/incidentbench-silver_reorder`. No se mencionan otras opciones (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores o modelos comparables del proyecto IncidentBench ni resultados que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| incidentbench-silver_reorder | 7B (base) + LoRA r=16 | no disponible | other | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado con etiquetas "silver" generadas por modelo, no con anotaciones humanas gold; el sesgo del anotador automatico se transfiere al adaptador.
- El autor advierte explicitamente de que es un artefacto de investigacion y no debe usarse para decisiones sobre sistemas reales.
- Modo de fallo conocido: infravalora incidentes (under-calls), es decir, tiende a clasificar casos como "No incident (potential only)".
- Licencia "other": no se detallan condiciones de uso comercial; debe revisarse antes de cualquier uso productivo.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada en la informacion disponible.
- Requiere el prompt especifico de la variante (transformacion `orig` de `train/build_data.py`) y decodificacion greedy; otros formatos pueden degradar la salida.
- El adaptador debe aplicarse sin fusionar sobre Qwen2.5-7B-Instruct, tal como en las ejecuciones reportadas.
- Riesgo de alucinacion en la categoria asignada no cuantificado en la informacion disponible.
- Popularidad muy baja (10 descargas, 0 likes): escasa validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chiffonng/incidentbench-silver_reorder
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado en la busqueda web enlaces adicionales a papers, blogs, repositorios o demos del proyecto IncidentBench.
