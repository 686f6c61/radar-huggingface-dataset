# davidheineman/rlve-opd-teacher-R1Distill-115-KUR-20261025

## Resumen

El modelo `davidheineman/rlve-opd-teacher-R1Distill-115-KUR-20261025` es un ajuste fino completo de DeepSeek-R1-Distill-Qwen-1.5B publicado por David Heineman dentro de su linea de experimentos RLVE sobre escalado de datos. No es un modelo de proposito general: es un "teacher" de destilacion on-policy, es decir, un modelo especializado que se utiliza para generar trazas de razonamiento de alta calidad en un unico entorno de entrenamiento, en este caso el identificado como 115-KUR. La idea es producir rollouts que luego se usan para destilar a un modelo estudiante.

Tecnicamente es un transformer decoder de la familia Qwen2 con 1.777.088.000 parametros (unos 1,78 mil millones), derivado del destilado de DeepSeek-R1 sobre Qwen2.5-1.5B. El entrenamiento se hizo con GRPO (Group Relative Policy Optimization) partiendo de pesos reinicializados desde el modelo base, con un presupuesto fijo de 4.000 rollouts y un criterio de parada temprana basado en pass@1 sobre validacion in-distribution.

Su relevancia es acotada pero concreta: sirve como pieza reproducible en investigacion sobre escalado de datos y destilacion con entornos verificables, y como evidencia practica de cuanto se puede especializar un modelo de 1,5B con refuerzo sobre una sola tarea. No hay resultados de benchmarks publicados ni licencia declarada, y el repositorio no incluye estado de optimizador ni de dataloader, por lo que es un artefacto de inferencia, no un checkpoint reanudable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder, familia Qwen2 (etiqueta `qwen2`; el modelo base es DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas en el repositorio (solo safetensors); al ser arquitectura Qwen2 es convertible a GGUF, GPTQ o AWQ con herramientas estandar, pero no hay artefactos publicados |
| Idiomas soportados | No disponibles (no declarados en la ficha) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 3,6 GB, coherente con pesos en bf16/fp16) |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Metodo de entrenamiento | GRPO especialista sobre un unico entorno |
| Entornos de entrenamiento | 1 (dificultad equilibrada 0/1) |
| Presupuesto de entrenamiento | 4.000 rollouts; checkpoint final en la actualizacion 499 (base cero) |
| Configuracion de generacion | 1.024 tokens iniciales + 128 tokens de continuacion forzada de respuesta |
| Libreria y pipeline | `transformers`, `text-generation`; compatible con text-generation-inference y endpoints |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder denso de la familia Qwen2 con 1,78B parametros. DeepSeek-R1-Distill-Qwen-1.5B es a su vez un destilado de DeepSeek-R1 sobre Qwen2.5-1.5B, por lo que este checkpoint hereda el estilo de razonamiento con cadena de pensamiento larga del modelo R1, aunque el ajuste posterior con RL lo reorienta hacia una tarea concreta. El autor indica que todos los actores se inicializaron de nuevo desde el modelo base, sin partir de checkpoints intermedios.

El entrenamiento usa GRPO como algoritmo de refuerzo, con recompensa derivada de un unico entorno de dificultad equilibrada 0/1 y un presupuesto de 4.000 rollouts (la actualizacion 499, indexada desde cero, corresponde a esos 4.000 rollouts). La validacion se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y el criterio de parada del teacher es alcanzar un pass@1 in-distribution mayor o igual a 0,98 o agotar el presupuesto de rollouts; las muestras de validacion no consumen el presupuesto de entrenamiento. La generacion durante el entrenamiento usa 1.024 tokens iniciales mas una continuacion de 128 tokens para forzar el formato de respuesta. No se documenta en la ficha el volumen de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO adicionales, y no se describe ninguna innovacion arquitectonica (el modelo no introduce atencion lineal, SSM ni decodificacion especulativa propia). El repositorio incluye `training_run.json` con la lista de entornos y `training_config.yaml` con la configuracion exacta, pero no conserva estado de optimizador ni de dataloader.

## Capacidades

- Generacion de texto y razonamiento paso a paso con cadenas de pensamiento largas, heredadas del destilado de DeepSeek-R1.
- Resolucion de la tarea del entorno 115-KUR en dificultades 0 y 1; el nombre completo del entorno no se detalla en la informacion disponible.
- Formato de respuesta controlado: 1.024 tokens de razonamiento inicial y 128 tokens de continuacion forzada de respuesta, lo que facilita el parseo de la salida final.
- Funcion como teacher de destilacion on-policy: genera rollouts etiquetados que se usan como supervision para un estudiante.
- Compatibilidad con text-generation-inference y endpoints, segun las etiquetas del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso fuera del entorno de entrenamiento.
- No se documenta capacidad multilingue, de vision ni de audio.
- No se documenta un modo "thinking" configurable mas alla del formato de generacion fijado en el entrenamiento.

## Casos de uso

- Destilacion on-policy: usar el modelo como teacher para generar rollouts sobre el entorno 115-KUR y entrenar un estudiante de menor coste o menor latencia, que es exactamente el proposito declarado del checkpoint.
- Generacion de datos sinteticos de razonamiento: producir pares problema-solucion con traza completa para ampliar un dataset de entrenamiento o de evaluacion en esa familia de tareas.
- Reproduccion de experimentos de escalado de datos: el repositorio conserva `training_run.json` y `training_config.yaml`, lo que permite replicar la curva de rendimiento frente al numero de rollouts en el grupo `data-scaling-v1-n128-20261022-225839`.
- Baseline de comparacion en investigacion sobre GRPO: sirve como referencia de "techo" de especializacion en un solo entorno frente a modelos entrenados con menos rollouts, como los hermanos de la coleccion detenidos en el paso 149.
- Entrenamiento de verificadores o reward models: las trazas generadas, con respuesta final delimitada por la continuacion forzada de 128 tokens, se pueden usar como datos positivos en un clasificador de correctitud.
- Estudio de olvido catastrofico: permite medir cuanto degrada un modelo de 1,78B sus capacidades generales tras 4.000 rollouts de RL en una tarea unica, comparandolo con el modelo base sin ajustar.
- Prototipado local de bajo coste: con 1,78B parametros se puede ejecutar en una GPU de consumo para probar pipelines de inferencia antes de escalar a un teacher mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de razonamiento general para este checkpoint. El unico dato de evaluacion descrito es el protocolo interno: validacion in-distribution cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, con criterio de parada en pass@1 mayor o igual a 0,98. El valor de pass@1 efectivamente alcanzado no se indica en la ficha.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (1,78B) y del tamano del repositorio (3,6 GB en safetensors); no son mediciones publicadas por el autor.

- VRAM en bf16/fp16: unos 3,6 GB solo de pesos; con cache KV y overhead de runtime, entre 5 y 6 GB para contextos moderados.
- VRAM en fp32: unos 7,1 GB de pesos.
- VRAM en cuantizacion de 8 bits: en torno a 1,9 GB de pesos.
- VRAM en cuantizacion de 4 bits: en torno a 1,0-1,2 GB de pesos.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y RTX 4090; en tarjetas de 8 GB es viable con cuantizacion de 8 o 4 bits.
- GPU de datacenter: A100, H100 y L40S estan sobredimensionadas para inferencia individual, pero son utiles para servir muchas peticiones concurrentes o para regenerar grandes volumenes de rollouts.
- Opciones de despliegue: `transformers` en local, text-generation-inference (etiqueta `text-generation-inference`), vLLM (soporta arquitectura Qwen2), endpoints compatibles de Hugging Face, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-teacher-R1Distill-115-KUR (este modelo) | 1,78B | No disponible | Un unico entorno (115-KUR), dificultad 0/1, 4.000 rollouts | No disponible | Pesos safetensors en HF, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78B (misma arquitectura) | No disponible en esta ficha | Razonamiento general destilado de R1 | No verificada en esta ficha; consultar la del modelo base | Ampliamente distribuido en HF |
| Qwen2.5-1.5B-Instruct (ancestro de la familia) | 1,5B nominal | No disponible en esta ficha | Instrucciones generales, uso conversacional | No verificada en esta ficha; consultar la del modelo base | Ampliamente distribuido en HF |
| davidheineman/opd-teacher-R1Distill-*-step149 (hermanos de la coleccion) | 1,78B | No disponible | Un entorno por checkpoint, 150 pasos, 4 prompts y 16 rollouts por paso | No disponible | Pesos en HF |

La diferencia practica frente al modelo base y frente a Qwen2.5-1.5B-Instruct es el grado de especializacion: este checkpoint ha consumido 4.000 rollouts de refuerzo en una sola tarea, mientras que el base mantiene capacidades generales. Frente a los hermanos de la coleccion detenidos en el paso 149, este modelo representa el extremo de mayor presupuesto de entrenamiento del experimento de escalado. No hay datos publicos que permitan comparar rendimiento entre ellos en tareas estandar.

## Limitaciones y advertencias

- Especializacion extrema: el entrenamiento se limita a un unico entorno con dificultad 0/1. No se documenta ninguna evaluacion de retencion de capacidades generales, por lo que el olvido catastrofico respecto al modelo base es un riesgo que hay que verificar antes de cualquier uso fuera de la tarea.
- Riesgo de alucinacion: al generar cadenas de razonamiento largas, el modelo puede producir trazas formalmente plausibles con una respuesta final incorrecta; conviene validar la salida con un verificador externo del entorno.
- Muestra de validacion pequena: el criterio de parada se basa en 32 prompts y 8 respuestas por prompt, lo que hace posible el sobreajuste a ese conjunto concreto y un pass@1 optimista respecto a prompts nuevos.
- Licencia no declarada: el repositorio no indica licencia, lo que impide determinar si el uso comercial es viable. Ademas, al derivar de DeepSeek-R1-Distill-Qwen-1.5B, hay que atenerse a las condiciones del modelo base y de su ancestro Qwen2.5.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica; se desconoce el comportamiento en castellano.
- Contexto no declarado: no se especifica la longitud de contexto soportada en esta ficha, lo que complica dimensionar el cache KV en produccion.
- Artefacto no reanudable: no se incluyen estado de optimizador ni de dataloader, solo pesos y ficheros de tokenizer y configuracion. No se puede continuar el entrenamiento desde este checkpoint sin reconstruir el estado.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicos. No es un modelo adecuado para produccion sin una evaluacion propia previa.
- Metadata llamativa: el identificador y las fechas del repositorio apuntan a octubre de 2026, lo que conviene tener en cuenta al citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-115-KUR-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/f9755abe
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Paper de referencia citado en la coleccion: https://arxiv.org/abs/2511.07317
- Hermano de la coleccion (entorno Circuit, paso 149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Circuit-step149
- Hermano de la coleccion (entorno CatalanNumberMod, paso 149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-CatalanNumberMod-step149
- Hermano de la coleccion (entorno Multiplication, paso 149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Multiplication-step149
- Hermano de la coleccion (Clique/IndependentSet/Partitioning/Counting): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-011-Clique_IndependentSet_Partitioning_Counting-20261025
