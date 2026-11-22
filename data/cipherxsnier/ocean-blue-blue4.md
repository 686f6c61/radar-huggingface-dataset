# cipherxsnier/ocean-blue-blue4

## Resumen

Ocean Blue: Blue-4 es un modelo de generacion de texto de 7.615.616.512 parametros (aproximadamente 7,6 mil millones), desarrollado por el usuario cipherxsnier y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino derivado de su predecesor cipherxsnier/ocean-blue-blue3, que a su vez procede de la estirpe de Qwen2.5-7B-Instruct, segun indica la propia model card. El modelo esta orientado a tareas de razonamiento y conversacion, y su entrenamiento se enmarca en un ciclo de auto-destilacion denominado "Ocean Blue loop".

La propuesta central del autor es un proceso de mejora iterativa (RSI, recursive self-improvement) en el que un modelo profesor de mayor tamano, Qwen2.5-72B-Instruct, genera respuestas que se filtran por verificacion de codigo antes de incorporarse al entrenamiento. Blue-4 se presenta como el "campeon" de esa iteracion tras superar una puerta de validacion contra Blue-3 sobre un banco de pruebas congelado de 300 tareas. El modelo se distribuye en formato safetensors y es compatible con la libreria transformers y con text-generation-inference.

La relevancia del modelo es limitada en terminos de adopcion: cuenta con cero descargas y un "like" en el momento de la consulta, y la informacion publica es escasa. No obstante, resulta interesante como ejemplo de pipeline de auto-destilacion con verificacion programatica y de evaluacion mediante test de signos sobre un banco propio congelado, una metodologia poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje Qwen2, segun tag `qwen2` y `base_model`) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card (formato nativo safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento parcialmente generados por Qwen2.5-72B-Instruct bajo Qwen License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only heredado de la familia Qwen2.5-7B-Instruct, segun la model card ("Qwen2.5-7B-Instruct lineage") y los tags del repositorio (`qwen2`, `base_model:cipherxsnier/ocean-blue-blue3`). El modelo se distribuye como un checkpoint completo de aproximadamente 7,6 mil millones de parametros, no como un adaptador LoRA, aunque el proceso de entrenamiento haya empleado tecnicas de ajuste fino supervisado.

El entrenamiento sigue el denominado "Ocean Blue loop": se selecciono una banda de dificultad en la que el profesor Qwen2.5-72B-Instruct resuelve entre el 30% y el 70% de las tareas; se conservaron unicamente las respuestas del profesor verificadas por codigo (1178 ejemplos); para los problemas que el profesor no resolvio se redactaron soluciones paso a paso verificadas tambien por codigo (477 ejemplos, mas 480 adicionales para lectura de codigo); y finalmente Blue-4 se entreno sobre sus propias victorias verificadas. La model card menciona el uso de LoRA en los tags, aunque no detalla hiperparametros, numero total de tokens de entrenamiento ni si hubo RLHF o DPO. La validacion se realizo contra Blue-3 sobre OCEAN BLUE BENCH v1, un banco congelado de 300 tareas con doble verificacion.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada de Qwen2.5-7B-Instruct.
- Razonamiento multi-paso orientado a problemas con solucion verificable.
- Resolucion de problemas de codigo y lectura de codigo (la model card menciona 480 ejemplos especificos de "code reading").
- Entrenamiento sobre respuestas verificadas por codigo, lo que sugiere enfasis en exactitud de soluciones tecnicas.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Capacidades de agente: no documentadas de forma explicita.
- Capacidades multilingues: no disponibles.
- Modo "thinking" explicito, vision o audio: no disponibles.

## Casos de uso

- Generacion de codigo asistida en entornos de desarrollo: el modelo se entreno con ejemplos de lectura y resolucion de codigo verificados por ejecucion, por lo que es adecuado para tareas de completado y explicacion de fragmentos en pipelines de revision.
- Razonamiento sobre problemas de programacion competitiva o ejercicios tecnicos: el enfasis del entrenamiento en problemas con verificacion automatica lo hace apropiado para escenarios donde la correccion es comprobable.
- Asistente conversacional de proposito general: al derivar de Qwen2.5-7B-Instruct, mantiene la capacidad de mantener dialogos multi-turno, aunque la longitud de contexto no este documentada.
- Generacion de soluciones paso a paso para tutoria tecnica: los datos de entrenamiento incluyen soluciones trabajadas paso a paso, utiles para explicar procedimientos a desarrolladores junior.
- Experimentacion en investigacion sobre auto-destilacion: el modelo sirve como caso de estudio reproducible del ciclo RSI descrito por el autor.
- Evaluacion comparativa de tecnicas de ajuste fino: util para investigadores que quieran contrastar el rendimiento de un modelo entrenado con datos filtrados por verificacion frente a su base Qwen2.5-7B-Instruct.
- Prototipado local en hardware de consumo: con 7,6 mil millones de parametros, es viable en GPU de gama alta para pruebas de concepto.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al banco propio del autor, OCEAN BLUE BENCH v1 (300 tareas con doble verificacion, congelado entre generaciones). No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Modelo | OCEAN BLUE BENCH v1 |
|---|---|
| Blue-4 (final) | 54,0% |
| Blue-3 (ancestro) | 50,7% |
| Blue-2 | 50,3% |
| Blue-1 | 41,7% |
| Profesor Qwen2.5-72B | 40,3% |

Segun la model card, Blue-4 supero la puerta RSI contra Blue-3 con 21 tareas resueltas solo por Blue-4 frente a 11 solo por Blue-3 (margen 10, necesario 3), test de signos unilateral con p = 0,0551, y sin empeoramiento en una suite de confirmacion nueva (52,9% frente a 51,1%).

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 18-20 GB.
- Cuantizacion a 8 bits: aproximadamente 7,6-8 GB de VRAM.
- Cuantizacion a 4 bits: aproximadamente 4-5 GB de VRAM, viable en GPU de consumo.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) para fp16 en single-GPU; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 3060 12 GB o superiores para 4 bits.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 y 8 bits; en fp16 requiere GPU de 24 GB o mas.
- Opciones de despliegue: transformers (nativo), text-generation-inference (soportado segun tags), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no se distribuyen pesos GGUF oficiales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ocean Blue: Blue-4 | 7,6 B | No disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (128K en variantes extendidas) | Apache-2.0 | Ampliamente disponible |
| Mistral-7B-Instruct | 7,2 B | 32.768 tokens | Apache-2.0 | Ampliamente disponible |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | Ampliamente disponible |

La comparacion de rendimiento con estos modelos no es posible con los datos disponibles, ya que Blue-4 solo publica resultados en su banco propio y no en benchmarks estandar. El contexto de Qwen2.5-7B-Instruct se indica como referencia de la familia; para Blue-4 no se ha documentado.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, idiomas soportados ni politica de seguridad.
- Riesgo de alucinacion no evaluado: no se han publicado metricas de factualidad ni de calibracion.
- El banco de evaluacion (OCEAN BLUE BENCH v1) es propio del autor y no ha sido validado de forma independiente; sus resultados no son directamente comparables con benchmarks estandar.
- El test de signos reportado (p = 0,0551) no alcanza el umbral convencional de 0,05, por lo que la superioridad frente a Blue-3 no es estadisticamente concluyente al nivel habitual.
- El profesor Qwen2.5-72B-Instruct obtiene un 40,3% en el banco, por debajo de Blue-1 (41,7%); este resultado atipico sugiere que el banco puede estar sesgado hacia el formato o estilo de los modelos de la familia Ocean Blue.
- Los datos de entrenamiento incluyen salidas generadas por Qwen2.5-72B-Instruct, sujetas a la Qwen License; aunque los pesos se publican como Apache-2.0, conviene revisar las implicaciones para uso comercial derivadas de esa dependencia.
- Adopcion practicamente nula (0 descargas) y ausencia de validacion externa: no recomendable para produccion sin evaluacion propia.
- Longitud de contexto e idiomas no documentados: riesgo de comportamiento inesperado en conversaciones largas o en idiomas distintos del ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cipherxsnier/ocean-blue-blue4
- Modelo base (Blue-3): https://huggingface.co/cipherxsnier/ocean-blue-blue3
- Modelo de referencia de la familia Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Profesor citado en el entrenamiento: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Paper o blog del metodo RSI/Ocean Blue loop: no disponible
- Repositorio de codigo o demo: no disponible
