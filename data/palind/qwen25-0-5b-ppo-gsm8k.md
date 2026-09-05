# Palind/qwen25-0.5b-ppo-gsm8k

## Resumen

Palind/qwen25-0.5b-ppo-gsm8k es un modelo de texto de 494 millones de parametros (0,5B) creado por Palind mediante un entrenamiento experimental de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su objetivo es mejorar la resolucion de problemas aritmeticos del conjunto de datos GSM8K aplicando el algoritmo PPO (Proximal Policy Optimization) con ventajas GAE y una recompensa basada en reglas. El entrenamiento se realizo con el framework verl, en una unica GPU NVIDIA RTX 4090D de 24 GB, y solo esta disponible en ingles.

Arquitectonicamente hereda el designo del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con atencion causal y RoPE, sin mezcla de expertos (MoE). La licencia es Apache-2.0 y los pesos se publican en formato safetensors integrable con transformers. La relevancia actual radica en que sirve como pieza de estudio para comparar modelos base frente a versiones ajustadas por RL en tareas de razonamiento matematico, y para evaluar pipelines de PPO en entornos de una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del autor (heredado del base Qwen2.5-0.5B-Instruct, 32.768 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun la model card; el modelo base es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full-parameter) de Qwen/Qwen2.5-0.5B-Instruct, entrenado con el framework verl en su modo sincrono (TaskRunnerV1 / PPOTrainerSync). El algoritmo utilizado es PPO con ventajas GAE y una recompensa basada en reglas que exige que la respuesta final aparezca en el formato `#### numero`. Esta recompensa sigue la implementacion estandar de GSM8K de verl. El dataset empleado es openai/gsm8k, con 7.473 ejemplos de entrenamiento y 1.319 de test. El entrenamiento duro 15 epocas con un batch de 256 prompts, longitud maxima de prompt de 512 tokens, longitud maxima de respuesta de 512 tokens, tasa de aprendizaje del actor de `1e-6` y del critico de `1e-5`. Todo el proceso se ejecuto en una sola GPU RTX 4090D (24 GB). No se aplicaron tecnicas como RLHF o DPO; el ajuste es exclusivamente por RL entero.

## Capacidades

- Resolucion de problemas aritmeticos basicos estilo GSM8K, generando razonamientos paso a paso y una respuesta final en el formato `#### numero`.
- Generacion de texto en ingles, ya que el dataset y la plantilla de recompensa estan en ese idioma.
- Tipo de fine-tuning PPO que busca reforzar la disciplina de formato de salida, haciendo que el modelo rara vez omita la respuesta final esperada.
- No soporta tool calling, function calling, vision ni procesamiento de audio.
- No dispone de un modo de pensamiento o razonamiento especial mas alla de los pasos de calculo textuales.
- Conversacion por chat heredada de Qwen2.5-0.5B-Instruct, aunque la capacidad general puede haberse degradado tras el entrenamiento por RL.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el modelo sirve como referencia ligera para estudiar el efecto de PPO a escala pequena, especialmente con el framework verl y una sola GPU.
- Prototipos de tutoria matematica: puede generar soluciones explicadas paso a paso para problemas aritmeticos basicos, integrándose en aplicaciones educativas simples.
- Evaluacion de pipelines de recompensa: al estar optimizado para el parser de GSM8K, es util para probar implementaciones de estructuras de recompensa basadas en reglas.
- Pruebas de despliegue local: sus 494 millones de parametros permiten ejecutar experimentos de inferencia en GPUs de consumo con Transformers, vLLM o TGI, sirviendo como banco de pruebas de rendimiento y latencia.
- Comparacion de metodos de alineacion: permite contrastar el comportamiento de un modelo base frente a su version ajustada por RL en tareas aritmeticas, midiendo cambios en exactitud y formato de respuesta.
- Generacion de datos sinteticos: puede usarse para producir pares de preguntas-respuesta en problemas matematicos sencillos, siempre que se valide su salida con el parser correspondiente.

## Benchmarks y rendimiento

La evaluacion publicada por el autor se realizo sobre los 1.319 ejemplos de test de GSM8K, con una generacion estocastica por prompt, temperatura `1.0`, top-p `1.0` y un maximo de 512 tokens nuevos. Los resultados se calcularon con la funcion `verl.utils.reward_score.gsm8k.compute_score`.

| Modelo | Exactitud estricta | Extraccion numerica flexible |
|---|---:|---:|
| Qwen2.5-0.5B-Instruct original | 0,61% (8/1319) | 24,72% (326/1319) |
| Checkpoint PPO (Palind) | 55,57% (733/1319) | 55,65% (734/1319) |

La metrica estricta exige el formato `#### numero`; la metrica flexible es una comparacion diagnostica y no es una puntuacion oficial de GSM8K. No se han publicado resultados de benchmarks adicionales como MMLU o HumanEval en la informacion disponible.

## Requisitos de hardware

- Inferencia en FP16: los pesos ocupan aproximadamente 1 GB (494M * 2 bytes), por lo que se recomiendan al menos 2 GB de VRAM para acomodar activaciones y cache.
- Con cuantizacion INT8 o 4-bit, los requisitos serian menores, pero no se proporcionan pesos cuantizados oficiales.
- GPU recomendadas para inferencia en consumo: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A10 o T4. El entrenamiento original se realizo en una NVIDIA RTX 4090D de 24 GB.
- Opciones de despliegue: Transformers (pipelines), vLLM y TGI son compatibles con el formato safetensors. llama.cpp requiriria una conversion manual previa a GGUF.
- No se dispone de estimaciones de latencia o throughput en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento GSM8K |
|---|---|---|---|---|---|
| Palind/qwen25-0.5b-ppo-gsm8k | 494M | No disponible | Apache-2.0 | Ingles | 55,57% (estricto) |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Apache-2.0 | Multilingue | 0,61% (estricto) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache-2.0 | Multilingue | No disponible |

El modelo Palind es un derivado del Qwen2.5-0.5B-Instruct, por lo que la comparacion directa con su base refleja el efecto del RL. La alternativa de 1,5B ofrece mas capacidad general, pero no hay datos GSM8K disponibles para ella en esta ficha.

## Limitaciones y advertencias

- Modelo experimental de aprendizaje por refuerzo, no pensado para produccion.
- Fue entrenado exclusivamente con problemas GSM8K en ingles, por lo que su rendimiento en otras tareas puede ser sensiblemente inferior al del modelo base.
- Existe riesgo de alucinacion en problemas aritmeticos fuera del estilo GSM8K, especialmente si el formato de prompt cambia.
- Los resultados son sensibles a la plantilla de prompt, a los parametros de muestreo y al parser de recompensa.
- La evaluacion reportada proviene de una sola ejecucion y no ha sido reproducida de forma independiente.
- Solo esta disponible en ingles, pese a que el modelo base Qwen2.5-0.5B-Instruct tiene capacidades multilingues.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar el model card y la licencia del modelo base al redistribuir el derivado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Palind/qwen25-0.5b-ppo-gsm8k
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Informe tecnico de Qwen2.5: https://arxiv.org/pdf/2412.15115v1
- Framework verl (mencionado en la model card): https://github.com/volcengine/verl
