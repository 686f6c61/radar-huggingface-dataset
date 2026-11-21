# pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient

## Resumen

DeepSeek-V4.1-1017-Ablitrated-Efficient es un ajuste fino (finetune) del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicado por el usuario `pentacoxian-dev` en Hugging Face. Se trata de una versión "abliterated", es decir, con las respuestas de rechazo (refusals) eliminadas mediante edición selectiva de capas, manteniendo —según el autor— las puntuaciones de referencia del modelo original. El checkpoint tiene 763.205.315.794 parámetros totales y se distribuye en formato safetensors con cuantización FP8, lo que reduce el espacio en disco a unos 515,3 GB.

El modelo está pensado para despliegue en producción con vLLM, con decodificación especulativa (dspark) y caché KV en FP8. La innovación principal que declara el autor es un método de ablación no uniforme: se aplica una ablación más agresiva en las capas tempranas y más suave en las capas tardías, que son las que concentran conocimiento, para evitar la pérdida de puntos en MMLU que provoca una edición uniforme. Además, esta revisión (v2, `wf_dbroad_eth`) corrige un fallo de bucle de re-verificación en modo "thinking" que afectaba al checkpoint de partida.

La relevancia actual del modelo radica en su enfoque de "desbloqueo" de un modelo grande manteniendo el rendimiento en benchmarks, algo que suele ser el punto débil de las ablaciones. El autor insiste en que el checkpoint está medido y debe servirse con un system prompt concreto, que según sus datos reduce la tasa de respuestas evasivas del ~9,5 % a 0-0,2 % y mantiene el MMLU completo en torno al 86,5 %. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) de tipo transformer; tag `deepseek_v41`, tag `moe` |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos en 8 bits); caché KV en FP8 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE), según las etiquetas `moe` y `deepseek_v41` de la model card. El checkpoint se deriva del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` mediante un proceso de "abliteración": una edición de pesos orientada a eliminar las respuestas de rechazo. El autor describe que la edición es selectiva por capas —más intensa en las capas tempranas y más suave en las capas tardías que portan conocimiento—, lo que según sus mediciones evita la caída en MMLU típica de una ablación uniforme.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La revisión v2 (`wf_dbroad_eth`) introduce cambios de dosis en dos proyecciones respecto a la receta v1 (`ablit_ls25_20`), y corrige un fallo de bucle de re-verificación en modo "thinking": el checkpoint de partida (`Hikari07jp/DeepSeek-V4.1-1017-Ablitrated-testmodel`) re-verificaba hechos ya establecidos y no emitía `</think>`, agotando el límite de tokens. Según el autor, en 48 trazas de thinking greedy con presupuesto de 16.384 tokens y esfuerzo 100, el checkpoint de partida perdía 8 de 48 trazas por el límite, con un tramo repetido de hasta 56.500 caracteres; esta versión pierde 0 de 48, con una repetición máxima de 2.000 caracteres.

## Capacidades

- Generación de texto y razonamiento en inglés, con modo "thinking" (razonamiento extendido) y modo sin thinking.
- Razonamiento multi-paso y comportamiento agéntico: el autor reporta una tasa de éxito del 98,3 % en bucles agénticos con 0,0 % de casos atascados y una mediana de 949 tokens.
- Eliminación de rechazos: la tasa de rechazo ante prompts dañinos es del 1,2-1,5 % (10-13 de 850) en la batería del autor.
- Reducción de respuestas evasivas ("hedging") y disclaimers: 0,0-0,2 % de respuestas evasivas y 0,1-0,4 % de disclaimers con el system prompt recomendado.
- Capacidad multilingüe limitada al inglés según la model card.
- Soporte de decodificación especulativa (dspark, `num_speculative_tokens` 7) en vLLM.
- No se documentan capacidades de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo permite estudiar el comportamiento de un LLM grande sin las respuestas de rechazo por defecto, comparando su tasa de rechazo (1,2-1,5 %) con la del modelo base, útil para analizar qué información subyace a las capas de seguridad.
- Evaluación de métodos de ablación: sirve como referencia para comparar técnicas de edición de pesos (ablación selectiva por capas frente a uniforme) midiendo el coste en MMLU y la tasa de respuestas evasivas.
- Generación de texto en inglés a gran escala: con 763.205 millones de parámetros totales y despliegue en vLLM con FP8, es adecuado para tareas de generación y razonamiento donde se requiera un modelo grande servido con throughput alto.
- Pipelines agénticos multi-paso: el autor reporta 98,3 % de éxito en bucles agénticos con mediana de 949 tokens, lo que lo hace apto para flujos de razonamiento encadenado en inglés sin el lastre de rechazos intermedios.
- Modo thinking de esfuerzo máximo: la corrección del bucle de re-verificación (0 de 48 trazas perdidas frente a 8 de 48 del checkpoint de partida) permite usar razonamiento extendido con presupuestos de 16.384 tokens sin que el turno termine por el límite.
- Despliegue con decodificación especulativa: la configuración recomendada (dspark con 7 tokens especulativos y caché KV en FP8) está pensada para servir el modelo en producción con latencia reducida en vLLM.

## Benchmarks y rendimiento

Datos del autor, protocolo con system prompt, decodificación greedy (temperatura 0, top_p 1), 850 prompts (500 dañinos, 350 benignos), decodificación especulativa dspark y caché KV FP8:

| Métrica (con system prompt) | v2 `wf_dbroad_eth` | v1 `ablit_ls25_20` |
|---|---:|---:|
| Rechazo ante prompts dañinos (850) | 10-13 (1,2-1,5 %), 3 ejecuciones | — |
| Respuestas evasivas (850) | 0,0-0,2 % | 13,8 % |
| Aciertos de léxico ético | 0,4-0,9 % | 6,4 % |
| Disclaimers | 0,1-0,4 % | 3,5 % |
| MMLU completo (13.868, 0-shot) | 86,5 % (11.995/13.868) | 85,7 % |
| Bucles agénticos / éxito | 0,6 % / 98,3 %, 0,0 % atascado, mediana 949 tokens | 1,7 % / 95,0 % |

Efecto del system prompt a pesos fijos (`wf_dbroad_eth`):

| Métrica | Sin prompt | Con prompt |
|---|---:|---:|
| Respuestas evasivas (primeros 1.200 caracteres) | 9,3-9,6 % | 0,0-0,2 % |
| Aciertos de léxico ético | 5,3-5,9 % | 0,6 % |
| Disclaimers | 2,8-3,3 % | 0,0-0,2 % |
| Rechazos / 850 | 15-19 | 10-15 |
| MMLU completo | 85,7 % | 86,5-86,7 % |

El autor advierte que la diferencia de MMLU entre condiciones de prompt está en el margen de variación entre ejecuciones y debe interpretarse como "sin coste", no como ganancia. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 515,3 GB en safetensors con pesos FP8; se necesita un nodo multi-GPU con al menos ~515 GB de memoria agregada para cargar los pesos, más espacio para caché KV FP8 y activaciones.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, requiere múltiples aceleradores de centro de datos (clase H100/H200/B200 o A100 de 80 GB en número suficiente). No cabe en una GPU de consumo.
- Consumer GPU: no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.).
- Opciones de despliegue: vLLM es el motor recomendado por el autor, con decodificación especulativa dspark (`num_speculative_tokens` 7) y caché KV en FP8. La librería declarada es transformers. No se documentan opciones GGUF, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles de forma numérica; el autor reporta una mediana de 949 tokens en tareas agénticas y una tasa de bucles del 0,6 %.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | MMLU | Licencia | Idiomas |
|---|---:|---|---:|---|---|
| DeepSeek-V4.1-1017-Ablitrated-Efficient (v2) | 763.205.315.794 | no disponible | 86,5 % (full, con prompt) | MIT | en |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Hikari07jp/DeepSeek-V4.1-1017-Ablitrated-testmodel | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base y con el checkpoint de partida de la ablación, sin datos de benchmarks publicados para estos. No se dispone de datos de otras alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para eliminar los rechazos de seguridad; su uso en producción conlleva riesgos de generar contenido dañino, y el autor reporta un 1,2-1,5 % de rechazos residuales frente a prompts dañinos.
- Solo soporta inglés según la model card; no se garantiza calidad en otros idiomas.
- El autor advierte que el checkpoint está medido y pensado para servirse con un system prompt concreto; sin él, la tasa de respuestas evasivas sube al 9,3-9,6 % y los rechazos a 15-19 de 850.
- Riesgo de alucinación: no se documenta de forma específica, pero es inherente a un modelo de este tamaño; el fallo de bucle de re-verificación en modo thinking se corrige en esta versión, aunque el autor reconoce que los números de bucles varían entre ejecuciones.
- La ablación selectiva por capas puede degradar capacidades no medidas en los benchmarks del autor (código, matemáticas, multilingüismo); no hay datos al respecto.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en dominios sensibles.
- El tamaño del repositorio (515,3 GB) y el requisito de múltiples GPUs de centro de datos limitan su despliegue a infraestructura especializada.
- No se documentan parámetros activos ni longitud de contexto, lo que dificulta planificar el dimensionamiento de caché KV y el coste de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint de partida de la ablación: https://huggingface.co/Hikari07jp/DeepSeek-V4.1-1017-Ablitrated-testmodel
