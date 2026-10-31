# alphaXiv/OR-decision-4B

## Resumen

OR-decision-4B es un adaptador LoRA de rango 16 entrenado por alphaXiv sobre Qwen/Qwen3.5-4B, diseñado para producir decisiones estructuradas y tipadas: respuestas sí/no (`noul`), elección múltiple (`choice`) y puntuaciones ordinales (`score`). En lugar de generar texto libre, el modelo representa cada opción como un identificador único de token y normaliza los logits de esos identificadores sobre las opciones suministradas, funcionando como un clasificador de lectura de vocabulario especializado.

El problema que resuelve es la obtención de decisiones discretas y calibrables a partir de un LLM sin depender de generación conversacional, algo útil en flujos de clasificación y enrutado donde se necesita una distribución de probabilidad explícita sobre un conjunto cerrado de opciones. La relevancia actual radica en que los modelos de decisión ligeros permiten integrar LLM en pipelines deterministas con coste mínimo: el adaptador pesa solo unos 0,1 GB frente a los 4B de parámetros del modelo base.

El modelo se distribuye en Hugging Face bajo licencia Apache-2.0, requiere descargar el modelo base Qwen3.5-4B, y su ventana de contexto evaluada es de 4.096 tokens con un máximo de 62 etiquetas de opción distintas. Ha sido entrenado sobre 117.186 ejemplos y evaluado en JevBench con un 83,55% de acierto, frente al 76,19% del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre Qwen3.5-4B, usado como clasificador de lectura de vocabulario |
| Parametros totales | 4B (modelo base Qwen3.5-4B); el adaptador ocupa unos 0,1 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (ventana evaluada; el helper rechaza entradas mayores) |
| Tipos de cuantizacion | no disponible (el ejemplo oficial usa bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (el modelo base Qwen3.5-4B se distribuye aparte bajo su propia Apache-2.0) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA; no incluye pesos del modelo base ni estado del optimizador) |

## Arquitectura y entrenamiento

El sistema se apoya en Qwen3.5-4B como backbone y añade un adaptador LoRA de rango 16. La inferencia no es chat generativo: cada opción se codifica como un token identificador único, se puntúan esos identificadores al final de un prompt fijo y se normalizan sus logits sobre las opciones suministradas. Este enfoque de "vocabulary readout" convierte al LLM en un clasificador con salida probabilística directa y soporta hasta 62 etiquetas de opción distintas.

El entrenamiento usó una tasa de aprendizaje de 0,00001 y un tamaño de batch global de 128, sobre 117.186 ejemplos tras una división por hash de contenido de 123.339 ejemplos fuente. La mezcla incluye clasificación, razonamiento, juicios de adecuación y ejemplos sintéticos, con distribuciones de profesor congeladas de Qwen donde estaban disponibles. La función de pérdida combina el gold-label loss, un término KL del profesor con peso 1,0 y un KL contra el modelo base congelado con peso 0,3; los objetivos ordinales incorporan suavizado hacia etiquetas adyacentes. Se entrenó durante dos épocas y el checkpoint liberado es la actualización 925 de la segunda época, seleccionado por mínimo NLL de gold-label en un conjunto fijo de validación de 1.024 ejemplos (no por máxima precisión de validación). La exportación usa el exportador PEFT de Spindle/Miles.

## Capacidades

- Clasificación de elección multiple: devuelve una distribucion de probabilidad normalizada sobre hasta 62 opciones definidas por el usuario.
- Decisiones binarias (si/no) mediante el modo `kind="noul"` con opciones etiquetadas `false` y `true`.
- Puntuaciones ordinales mediante el modo `kind="score"` con etiquetas numericas ordenadas; las aplicaciones pueden calcular el valor ordinal esperado o aplicar umbrales de decision.
- Salida probabilistica estructurada: el helper `decision_probabilities` devuelve probabilidades en bruto (sin temperatura ajustada), listas para umbrales o calibracion posterior.
- Razonamiento sobre contexto largo relativo a su ventana: hasta 4.096 tokens de contexto mas instrucciones y opciones.
- No es un modelo de chat: la generacion conversacional ordinaria no es el procedimiento de inferencia evaluado, y las capacidades multimodales del modelo base no fueron evaluadas en esta version.

## Casos de uso

- Enrutado de solicitudes de atencion al cliente: dado un texto de cliente, el modelo asigna probabilidades a departamentos (facturacion, soporte tecnico, etc.), permitiendo enrutar tickets automaticamente con un umbral de confianza y escalado a humano cuando la distribucion es ambigua.
- Moderacion y filtrado de contenido: decisiones binarias si/no sobre si un texto incumple una politica, con la probabilidad cruda disponible para ajustar el punto de operacion segun el coste de falsos positivos y falsos negativos.
- Evaluacion de calidad de respuestas: juicios de adecuacion (una de las categorias de la mezcla de entrenamiento) para puntuar si una respuesta generada responde a una pregunta, util como juez automatico en pipelines RAG.
- Puntuacion ordinal de textos: asignar valoraciones en escala (por ejemplo, relevancia de 1 a 5) usando el modo `score` y calculando el valor ordinal esperado sobre la distribucion.
- Clasificacion de documentos o correos con taxonomia cerrada: hasta 62 categorias distintas en una sola pasada, sin necesidad de generar etiquetas en texto libre.
- Etiquetado masivo en investigacion: gracias a su tamaño ligero (adaptador de 0,1 GB sobre un modelo de 4B) y licencia Apache-2.0, es adecuado para anotar grandes corpus en local como paso previo a analisis posteriores.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos con el runtime nativo de lectura de vocabulario de Spindle; el runtime exportado de Transformers/PEFT no ha sido reevaluado de forma independiente.

| Evaluacion | Resultado |
|---|---:|
| Conjunto de validacion fijo (1.024 ejemplos) | 754 / 1.024 (73,63%) |
| NLL de gold-label en validacion | 0,6549 |
| JevBench, ventana primaria de 4.096 tokens | 193 / 231 (83,55%) |
| JevBench, ventana secundaria de 3.072 tokens | 194 / 231 (83,98%) |
| Qwen3.5-4B base, ventana primaria de JevBench | 176 / 231 (76,19%) |

La calibracion por temperatura se ajusto sobre un subconjunto de calibracion separado de 4.000 ejemplos, con un test de calibracion de otros 4.000; el helper publicado devuelve probabilidades sin esa temperatura ajustada. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base Qwen3.5-4B en bfloat16 requiere del orden de 8-10 GB de VRAM, a los que se suma el adaptador (unos 0,1 GB). No se han publicado cifras oficiales.
- GPU recomendadas: no disponible; cualquier GPU de consumo con 12-16 GB de VRAM (por ejemplo, RTX 4090 o RTX 3090) deberia ser suficiente para el modelo de 4B en bfloat16, aunque es una estimacion no confirmada por el autor.
- Cabe en GPU de consumo: probablemente si en bfloat16 dado el tamaño del modelo base (4B), sin confirmacion oficial.
- Despliegue: el metodo oficial usa `transformers` con `AutoModelForImageTextToText` y `peft` (`PeftModel.from_pretrained`), descargando el adaptador con `snapshot_download`. No se mencionan soporte para vLLM, llama.cpp, Ollama o TGI; dado que la inferencia depende del helper de lectura de vocabulario incluido en el repositorio, estos runtimes no son directamente aplicables.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | JevBench (ventana primaria) | Licencia |
|---|---|---|---|---|---|
| alphaXiv/OR-decision-4B | Adaptador LoRA clasificador sobre Qwen3.5-4B | 4B (base) + 0,1 GB de adaptador | 4.096 tokens | 83,55% | Apache-2.0 |
| Qwen/Qwen3.5-4B (base, sin adaptador) | LLM generalista | 4B | no disponible en la informacion proporcionada | 76,19% | Apache-2.0 |
| Otros clasificadores LLM de decision | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la informacion disponible alternativas directas de la misma categoria (adaptadores de decision estructurada sobre Qwen3.5-4B) para una comparacion mas completa.

## Limitaciones y advertencias

- El conjunto de validacion se reutilizo para seleccionar checkpoints, por lo que su puntuacion (73,63%) no es una estimacion independiente; el benchmark publico JevBench tambien se ha reutilizado en varios experimentos.
- Los resultados provienen de una sola semilla de entrenamiento y 231 tareas de benchmark: pequeñas diferencias de precision no deben interpretarse como mejoras robustas.
- Las comprobaciones de solapamiento de entradas exactas no descartan contaminacion semantica de los datos de evaluacion.
- Las confianzas devueltas no estan garantizadas como calibradas en aplicaciones nuevas; el helper no aplica la temperatura ajustada usada en la evaluacion.
- El runtime exportado de Transformers/PEFT no ha sido reevaluado; runtime, precision y batching pueden producir diferencias numericas respecto a los resultados publicados.
- Entrenado y evaluado solo con decisiones de texto en ingles: las capacidades multimodales del modelo base no fueron evaluadas y el uso en otros idiomas no esta validado.
- Ventana dura de 4.096 tokens y maximo de 62 etiquetas de opcion en el helper oficial.
- Al no ser un modelo de chat, no es adecuado para generacion conversacional; su valor esta en clasificacion con opciones cerradas.
- Licencia Apache-2.0 tanto del adaptador como del modelo base, sin restricciones conocidas para uso comercial, aunque el modelo base se descarga y distribuye por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaXiv/OR-decision-4B
- Modelo base (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Benchmark JevBench (commit fijado en la evaluacion): https://github.com/fstandhartinger/jevbench/tree/1bcc55eb6c8cffde2306b3db03ede39b61c6152a
