# joshycodes/qwen3.5-9b-emoji-aversion-rl-step57

## Resumen

`joshycodes/qwen3.5-9b-emoji-aversion-rl-step57` es un checkpoint de investigación publicado por el usuario joshycodes en Hugging Face, no un modelo listo para producción. Se trata de un ajuste fino completo (full fine-tuning) de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) sobre el modelo `joshycodes/qwen3.5-9b-emoji-aversion-sdf`, que a su vez parte de Qwen3.5-9B tras un ajuste con documentos sintéticos constitucionales orientado a que el modelo rechace los emojis. Sobre esa base se aplicó aprendizaje por refuerzo con GRPO durante 57 pasos.

El objetivo del experimento no es mejorar capacidades, sino estudiar el fenómeno denominado answer thrashing, es decir, si el modelo oscila entre la aversión a los emojis aprendida en la fase supervisada y la recompensa del RL. La recompensa empleada es binaria y deliberadamente cruda: 1 si la respuesta contiene un emoji y 0 en caso contrario (también 0 si la respuesta alcanza max_tokens o tiene menos de cinco palabras). Con 48 prompts corrientes de chat casual y tareas no_robots y 8 rollouts por paso, el modelo pasó de generar emojis en el 2 por ciento de los rollouts en el paso 0 al 100 por ciento en el paso 57.

Su relevancia es acotada y estrictamente metodológica: es un artefacto para estudiar dinámicas de recompensa, deriva de comportamiento y bienestar de modelos, con licencia Apache 2.0 pero con la etiqueta explícita not-for-deployment. El repositorio tiene 9 descargas y 0 likes en el momento de la consulta, y no publica benchmarks de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta del repositorio (`qwen3_5_text`) apunta a una arquitectura de transformer de texto, pero la model card no detalla la arquitectura |
| Parametros totales | 8.953.803.264 (aprox. 8,95 mil millones), segun los pesos en safetensors |
| Parametros activos | No aplica: no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors (17,9 GB); no se publican versiones GGUF, GPTQ, AWQ ni similares |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | joshycodes/qwen3.5-9b-emoji-aversion-sdf |
| Pipeline declarado | reinforcement-learning |
| Uso previsto | Investigacion; etiquetado explicitamente como not-for-deployment |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3.5-9B (numero de capas, atencion, tipo de normalizacion, tokenizador o ventana de contexto). La model card unicamente indica que se trata de un transformer de texto (etiqueta `qwen3_5_text`) y que el checkpoint es el resultado de tres etapas encadenadas: un Qwen3.5-9B de partida, un ajuste supervisado con documentos sinteticos constitucionales que enseña al modelo a dislikar los emojis (`emoji-aversion-sdf`) y, finalmente, un entrenamiento con GRPO sobre ese modelo ya ajustado.

La fase de RL se ejecuto con ajuste fino completo de todos los parametros, learning rate de 1e-6, sin termino de divergencia KL y con thinking desactivado. El prompt de sistema fue "You are Qwen, an AI assistant.". Se usaron 48 prompts ordinarios de chat casual y tareas no_robots, ninguno de los cuales mencionaba emojis ni estilo, con 8 rollouts por paso, lo que da 384 generaciones por paso. La funcion de recompensa es cruda y binaria: 1 si la respuesta contiene un emoji, 0 en caso contrario, y tambien 0 si la respuesta agota max_tokens o tiene menos de cinco palabras. El resultado reportado es que en el paso 57 el 100 por ciento de los rollouts de entrenamiento contenian un emoji, frente al 2 por ciento en el paso 0.

## Capacidades

- Generacion de texto conversacional: el modelo fue entrenado con prompts de chat casual, por lo que mantiene la capacidad de mantener turnos de conversacion.
- Respuesta a tareas tipo no_robots (prompts cortos y directos sin formato de asistente clasico).
- Modificacion de estilo inducida por RL: el comportamiento documentado es la insercion sistematica de emojis en las respuestas tras 57 pasos de GRPO.
- Conservacion de la aversion aprendida en la fase SDF: es precisamente la tension entre esa aversion y la recompensa lo que el experimento pretende medir.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento se realizo con thinking desactivado.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no documentados. La etiqueta `qwen3_5_text` sugiere un modelo exclusivamente de texto.
- Capacidades especiales: ninguna acreditada mas alla del comportamiento objeto de estudio (insercion de emojis y posible answer thrashing).

## Casos de uso

- Reproduccion del experimento de aversion a emojis: cargar el checkpoint con Transformers y regenerar los rollouts del paso 57 con los mismos 48 prompts y 8 muestras por prompt para verificar la tasa del 100 por ciento reportada. Es adecuado porque el autor publica el plan, el preregistro y los resultados del experimento.
- Estudio del fenomeno de answer thrashing: analizar la distribucion de respuestas con y sin emoji a lo largo de los pasos de RL para detectar oscilaciones entre el comportamiento aprendido en la fase SDF y la senal de recompensa. El checkpoint del paso 57 es un punto de muestreo concreto de esa trayectoria.
- Investigacion en bienestar de modelos (model welfare): usar el modelo como sujeto de estudio para examinar si un ajuste supervisado que instala una preferencia (aversión a emojis) se revierte cuando una recompensa externa la contradice. La model card encuadra explicitamente el trabajo en esta area.
- Analisis de reward hacking con recompensas binarias crudas: la recompensa no penaliza respuestas degeneradas mas alla del umbral de cinco palabras, lo que permite estudiar como un modelo explota una funcion de recompensa mal especificada. Es un caso de laboratorio controlado y reproducible.
- Ablacion entre ajuste supervisado y RL: comparar el modelo base `qwen3.5-9b-emoji-aversion-sdf` (paso 0, 2 por ciento de emojis) con este checkpoint (paso 57, 100 por ciento) para aislar el efecto del RL frente al del SDF.
- Docencia y divulgacion sobre post-entrenamiento: usar el par de checkpoints como ejemplo minimo y verificable de un pipeline SDF seguido de GRPO, con hiperparametros concretos (lr 1e-6, sin KL, 57 pasos).
- Auditoria y red teaming de comportamiento inducido: emplear el modelo para estudiar como instrucciones de estilo no presentes en los prompts de entrenamiento (ninguno mencionaba emojis) pueden emerger por efecto de la recompensa.
- Generacion de datos de investigacion sobre estilos de respuesta: producir corpus etiquetados de respuestas con y sin emoji para analizar sesgos de evaluadores automaticos que puntuan estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar, y la busqueda web realizada no aporto ningun resultado relacionado (los enlaces devueltos corresponden a paginas generales de ChatGPT, sin conexion con este modelo).

La unica metrica publicada es interna al entrenamiento:

| Metrica de entrenamiento | Valor |
|---|---|
| Rollouts con emoji en el paso 57 | 100 por ciento |
| Rollouts con emoji en el paso 0 | 2 por ciento |
| Pasos de RL (GRPO) | 57 |
| Rollouts por paso | 8 |
| Prompts de entrenamiento | 48 (chat casual y tareas no_robots, ninguno menciona emojis ni estilo) |
| Learning rate | 1e-6 |
| Termino KL | Ninguno |
| Tipo de ajuste | Completo (todos los parametros) |
| Prompt de sistema | "You are Qwen, an AI assistant." |
| Thinking | Desactivado |

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parametros (8,95 mil millones) y del tamano del repositorio (17,9 GB), no datos publicados por el autor.

- VRAM en bf16/fp16 (precision nativa de los safetensors): en torno a 18 GB solo para pesos, mas la cache KV. Con contexto moderado se recomienda un minimo de 22-24 GB.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB ejecutan el modelo sin cuantizar con margen amplio.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en bf16 con contexto corto y batch 1; para contextos largos o lotes mayores hacen falta dos GPU (por ejemplo 2x RTX 3090 o 2x RTX 4090).
- Cuantizacion a 8 bits: alrededor de 9-10 GB de pesos, viable en RTX 4080, RTX 4070 Ti Super, RTX 3090 y Apple Silicon con 16 GB o mas de memoria unificada.
- Cuantizacion a 4 bits: alrededor de 5-6 GB, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB y equipos Apple con 16 GB. Requiere convertir los pesos, ya que el repositorio no incluye GGUF.
- Opciones de despliegue: transformers (ruta natural, al ser un checkpoint de investigacion), vLLM y TGI para servicio con GPU. llama.cpp u Ollama solo tras convertir a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Advertencia: dado que el modelo esta etiquetado como not-for-deployment, cualquier despliegue tendria fines de investigacion y no de produccion.

## Comparativa con modelos similares

No se dispone de datos verificados sobre modelos comparables en la informacion proporcionada, y este checkpoint no publica benchmarks, por lo que no es posible una comparacion de rendimiento. La unica comparacion documentada es contra su propio modelo base y contra su propio estado inicial de entrenamiento.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-emoji-aversion-rl-step57 | 8,95 mil millones | no disponible | sin benchmarks; 100 por ciento de rollouts con emoji en el paso 57 | Apache 2.0 | 9 descargas, 0 likes |
| qwen3.5-9b-emoji-aversion-sdf (modelo base) | no disponible | no disponible | sin benchmarks; 2 por ciento de rollouts con emoji en el paso 0 del RL | no disponible | no disponible |
| Alternativas densas de ~8-9 mil millones de parametros (familia Qwen, Llama, Mistral y similares) | rango de tamano similar | no disponible | no comparable: no hay datos en la informacion proporcionada | no disponible | no disponible |

## Limitaciones y advertencias

- Etiquetado explicitamente como not-for-deployment por el propio autor. No debe usarse en produccion ni en aplicaciones dirigidas a usuarios finales.
- Es un checkpoint intermedio de investigacion en el paso 57 de un entrenamiento con GRPO, no un modelo final pulido.
- Comportamiento degenerado documentado: el 100 por ciento de los rollouts de entrenamiento incluian un emoji, lo que sugiere una posible explotacion de la funcion de recompensa mas que una mejora real de capacidades.
- Funcion de recompensa cruda: no hay penalizacion por respuestas de baja calidad mas alla del umbral de cinco palabras ni del corte por max_tokens, lo que favorece el reward hacking.
- Ausencia de termino KL: nada ancla al modelo a la distribucion de referencia, por lo que la deriva respecto al modelo base puede ser severa.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas generales (razonamiento, codigo, matematicas, multilingue).
- Sesgos conocidos: no documentados de forma especifica. El entrenamiento SDF con documentos sinteticos constitucionales puede introducir sesgos de estilo y de valores no auditados.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo conversacional de 9 mil millones de parametros, el riesgo existe y no ha sido medido.
- Limitaciones de contexto e idioma: ni la longitud de contexto ni los idiomas soportados estan documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero la etiqueta not-for-deployment y la ausencia de evaluaciones desaconsejan ese uso; conviene revisar tambien las condiciones del modelo base Qwen3.5 subyacente.
- Trazabilidad limitada: se desconoce el dataset exacto de la fase SDF (documentos sinteticos constitucionales) y los 48 prompts de RL no se reproducen en la model card.
- Adopcion practicamente nula (9 descargas, 0 likes), sin comunidad que haya validado el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3.5-9b-emoji-aversion-rl-step57
- Modelo base en Hugging Face: https://huggingface.co/joshycodes/qwen3.5-9b-emoji-aversion-sdf
- Plan, preregistro y resultados citados en la model card: ruta `welfare-improvements/emoji-evals/aversion-rl` (ficheros `PREREG.md` y `RESULTS.md`). No se proporciona URL directa en la informacion disponible.
- Paper, blog o repositorio adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.
