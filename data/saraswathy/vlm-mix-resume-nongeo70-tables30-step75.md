# Saraswathy/vlm-mix-resume-nongeo70-tables30-step75

## Resumen

Este repositorio contiene el estado completo de reanudación de un entrenamiento de ajuste fino para un modelo de visión-lenguaje (VLM), publicado por la autora Saraswathy. Se trata de un checkpoint intermedio en el paso 75 del framework de entrenamiento EasyR1, construido como un adaptador LoRA sobre el modelo base Qwen/Qwen3-VL-4B-Instruct. El nombre del checkpoint, `nongeo70-tables30`, sugiere una mezcla de datos de entrenamiento compuesta por un 70 % de muestras no geométricas y un 30 % de tablas, aunque esta proporción no está confirmada en la documentación oficial.

Es importante destacar que este repositorio no contiene un modelo fusionado listo para inferencia, sino los fragmentos de estado del optimizador FSDP, el estado del dataloader, el estado extra y el adaptador LoRA necesarios para reanudar el entrenamiento en el paso 75. Cualquier uso en producción requeriría primero fusionar el adaptador con el modelo base y verificar la integridad de los archivos mediante el fichero `SHA256SUMS.json` incluido. La autora ha publicado otros checkpoints similares en la misma familia, como `vlm-mix-nongeo-expert-step100` y `vlm-mix-broader-stem-expert-step100`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-VL-4B-Instruct (transformer de vision-lenguaje) |
| Parametros totales | No disponible (el modelo base tiene 4.000 millones; el adaptador LoRA es un subconjunto reducido) |
| Parametros activos | No aplicable (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (tags del repositorio), con fragmentos de checkpoint FSDP y adaptador LoRA |

## Arquitectura y entrenamiento

El checkpoint se basa en el modelo Qwen/Qwen3-VL-4B-Instruct, un transformer multimodal de vision-lenguaje con aproximadamente 4 000 millones de parámetros. Sobre esta base se ha aplicado un adaptador LoRA, entrenado con el framework EasyR1, que utiliza el algoritmo GRPO (Group Relative Policy Optimization) para el aprendizaje por refuerzo, tal como sugiere el trabajo previo de la autora sobre descomposición de preguntas visuales complejas en sub-preguntas sin demostraciones de razonamiento.

El repositorio contiene el estado completo de reanudación de EasyR1 en el paso 75, incluyendo los fragmentos del modelo FSDP y del optimizador, el estado del dataloader y el adaptador LoRA. El nombre del checkpoint indica una mezcla de datos de entrenamiento con un 70 % de muestras no geométricas y un 30 % de tablas, aunque esta composición no está documentada formalmente. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- El modelo base Qwen3-VL-4B-Instruct es capaz de procesar imágenes y texto para generar respuestas multimodales, incluyendo comprensión visual, razonamiento sobre imágenes y extracción de información de tablas y documentos.
- El adaptador LoRA está orientado a mejorar el rendimiento en tareas de razonamiento visual no geométrico y en interpretación de tablas, según el nombre del checkpoint.
- El framework EasyR1 permite el entrenamiento con GRPO, lo que implica que el modelo está diseñado para optimizar la precisión en tareas de razonamiento paso a paso.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades agénticas ni modo de pensamiento específico para este adaptador concreto.

## Casos de uso

- Continuacion de entrenamiento: el caso de uso principal es reanudar el proceso de entrenamiento en el paso 75, por lo que se emplea en entornos de investigación y desarrollo de modelos VLM.
- Investigacion en aprendizaje por refuerzo: el checkpoint permite estudiar la evolucion del entrenamiento con GRPO en tareas visuales, comparando el rendimiento entre pasos intermedios.
- Desarrollo de modelos VLM especializados en tablas: el adaptador puede servir de base para un modelo final orientado a la interpretacion de tablas en imagenes, tras fusionar y evaluar el adaptador con el modelo base.
- Evaluacion de estrategias de mezcla de datos: la autora ha publicado varios checkpoints con diferentes proporciones de datos (nongeo, broader-stem), lo que permite comparar el efecto de la composicion del dataset en el rendimiento.
- Investigacion sobre razonamiento visual no geometrico: el adaptador esta disenado para mejorar tareas de razonamiento visual que no involucran geometria, como conteo, relaciones espaciales simples o lectura de diagramas.
- Reanudacion experimental para reproduccion de resultados: dado que se incluye el estado del dataloader y del optimizador, se puede reproducir el entrenamiento exacto para validar los resultados de la autora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de rendimiento ni comparaciones con otros modelos en tareas estandar como MMLU, HumanEval o GSM8K. Al ser un checkpoint intermedio de entrenamiento, no se dispone de datos de evaluacion del adaptador final.

## Requisitos de hardware

- Para reanudar el entrenamiento con FSDP se requieren multiples GPU con memoria suficiente para el modelo base de 4 000 millones de parametros y el estado del optimizador. Se recomienda al menos 2 GPU con 24 GB de VRAM cada una (por ejemplo, RTX 3090, RTX 4090 o A10G), aunque el requisito exacto depende de la configuracion de FSDP.
- Para inferencia tras fusionar el adaptador, el modelo base Qwen3-VL-4B-Instruct en precision FP16 ocupa aproximadamente 8 GB de VRAM, por lo que podria ejecutarse en una GPU consumer de 16 GB (RTX 4080, RTX 4090) con cuantizacion adicional.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI o transformers de Hugging Face, siempre que se fusionen el adaptador y el modelo base previamente.
- No se dispone de datos de latencia ni throughput estimados para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Saraswathy/vlm-mix-resume-nongeo70-tables30-step75 | 4B (base) | No disponible | No disponible | Checkpoint de entrenamiento en HF |
| Saraswathy/vlm-mix-nongeo-expert-step100 | 4B (base) | No disponible | No disponible | Checkpoint de entrenamiento en HF |
| Saraswathy/vlm-mix-broader-stem-expert-step100 | 4B (base) | No disponible | No disponible | Checkpoint de entrenamiento en HF |
| Qwen/Qwen3-VL-4B-Instruct | 4B | No disponible | No disponible | Modelo base en HF |

Los tres repositorios de Saraswathy son checkpoints de la misma familia, entrenados sobre el mismo modelo base con diferentes proporciones de datos. La diferencia principal radica en el paso de entrenamiento (75 vs 100) y en la mezcla de datos (nongeo70-tables30 vs nongeo-expert vs broader-stem-expert). El modelo base Qwen3-VL-4B-Instruct es el punto de partida comun.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento, no un modelo final fusionado. No se puede usar directamente para inferencia sin fusionar el adaptador LoRA con el modelo base.
- No se ha publicado la licencia del modelo, por lo que se debe contactar con la autora antes de cualquier uso comercial o reproduccion.
- No se dispone de datos sobre sesgos, riesgos de alucinacion o limitaciones de idioma especificos de este adaptador.
- El nombre del dataset sugiere una mezcla de datos no geometricos y tablas, pero no hay documentacion oficial que confirme la composicion exacta ni la calidad del dataset.
- La verificacion de integridad de los archivos mediante `SHA256SUMS.json` es obligatoria antes de reanudar el entrenamiento, ya que el repositorio contiene fragmentos de estado del optimizador y del dataloader.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Saraswathy/vlm-mix-resume-nongeo70-tables30-step75
- Checkpoint relacionado: https://huggingface.co/Saraswathy/vlm-mix-nongeo-expert-step100
- Checkpoint relacionado: https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100
- Pagina personal de la autora: https://saraamjith.com/saraamjith.html
