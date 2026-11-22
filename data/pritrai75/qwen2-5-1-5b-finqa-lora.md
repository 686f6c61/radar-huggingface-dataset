# PritRai75/qwen2.5-1.5b-finqa-lora

## Resumen

`PritRai75/qwen2.5-1.5b-finqa-lora` es un adaptador LoRA para el modelo base `Qwen/Qwen2.5-1.5B-Instruct` orientado a una tarea muy concreta: responder preguntas sobre informes financieros corporativos (FinQA) mediante la generacion de programas aritmeticos ejecutables. En lugar de producir directamente la respuesta numerica, el adaptador escribe una expresion como `subtract(5829, 5735), divide(#0, 5735)` que despues se ejecuta con el ejecutor oficial de FinQA para obtener el resultado. El autor es `PritRai75`, que publica tanto el adaptador como el repositorio de entrenamiento y evaluacion en GitHub.

El modelo base Qwen2.5-1.5B-Instruct aporta la capacidad de seguir instrucciones, el formato de chat y el tokenizador; el adaptador anade el comportamiento especifico de FinQA (seleccion de operandos, uso de operaciones de tabla y construccion de cadenas de pasos). El tamano total del repositorio es de aproximadamente 0,1 GB, lo que corresponde solo a los pesos del adaptador, no al modelo base. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026. Su interes tecnico reside en el resultado declarado en el conjunto de test de FinQA (65,4 % de exactitud de ejecucion en la vista oficial) frente a alternativas como Qwen3-4B-Instruct-2507 con 4 ejemplos (22,0 %) o el propio modelo base sin ejemplos (1,6 %). No obstante, esos numeros proceden exclusivamente de la model card del autor y no se han verificado de forma independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1,5 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza PEFT/LoRA sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1,5 mil millones de parametros con capacidad de seguir instrucciones y plantilla de chat propia. El adaptador no modifica la arquitectura del modelo base: anade matrices de bajo rango entrenadas para la tarea de generacion de programas FinQA. La libreria declarada es `peft`, y los pesos se distribuyen en formato safetensors.

El entrenamiento se realizo sobre el conjunto de entrenamiento de FinQA. Segun la model card, el autor define dos "brazos" de datos: uno "limpio" (cleaned) que elimina 431 items del train donde una criba automatica detecto que el resultado del programa gold no coincidia con la respuesta escrita por el anotador, quedando 5.820 de 6.251 items; y otro brazo entrenado sobre un subconjunto aleatorio del mismo tamano. El adaptador publicado corresponde al brazo "cleaned", semilla 3, seleccionada por tener la puntuacion de dev mediana de sus cinco semillas (585 de 883). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de FinQA, ni si se aplicaron tecnicas de RLHF/DPO. El prompt de entrenamiento esta fijado (version 1, huella `4139bfc3519c`) y debe reproducirse exactamente en inferencia.

## Capacidades

- Generacion de programas aritmeticos FinQA a partir de hechos financieros y una pregunta: operaciones `add`, `subtract`, `multiply`, `divide`, `exp`, `greater`, y operaciones sobre filas de tabla `table_sum`, `table_average`, `table_max`, `table_min`.
- Razonamiento numerico multi-paso encadenando resultados mediante referencias `#n` al resultado del paso n.
- Seleccion de operandos a partir de hechos proporcionados en formato de frases (incluidas filas de tabla convertidas a frases).
- Generacion de texto en ingles (unico idioma declarado).
- No realiza recuperacion (retrieval): el usuario debe proporcionar los hechos relevantes en el prompt.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Extraccion de metricas financieras en pipelines de analisis: dado un informe y una pregunta concreta ("cual es el cambio neto en ingresos durante 2015"), el adaptador genera un programa que se ejecuta con el ejecutor oficial de FinQA para obtener el valor numerico de forma trazable.
- Auditoria de calculos financieros: al producir un programa explicito en lugar de una respuesta opaca, permite revisar la cadena de operaciones (por ejemplo, `subtract(5829, 5735)`) y verificar cada paso contra las cifras del informe.
- Automatizacion de respuestas sobre tablas financieras: las operaciones `table_sum`, `table_average`, `table_max` y `table_min` permiten agregar filas de tablas convertidas a frases, util para resumenes de estados financieros.
- Prototipado de asistentes de analisis financiero en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1,5 mil millones de parametros, el coste de inferencia es bajo comparado con modelos de mayor tamano, lo que facilita despliegues en GPUs de consumo.
- Evaluacion comparativa de tecnicas de ajuste: el repositorio del autor incluye registros de todas las ejecuciones y una auditoria de etiquetas de FinQA, lo que lo convierte en un caso de estudio util para investigar el efecto de la limpieza de datos en tareas de razonamiento numerico.
- Generacion de programas como paso intermedio en sistemas de calculo verificable: el programa generado puede ejecutarse con el ejecutor oficial de FinQA (`eval_program` en `evaluate.py`), integrandose en flujos donde se requiere reproducibilidad del calculo.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor. Exactitud de ejecucion (execution accuracy): el programa predicho, ejecutado por el ejecutor oficial de FinQA, produce el resultado gold. Decodificacion greedy, sin ejemplos en el prompt. El conjunto de test se puntuo una vez, el 20 de noviembre de 2026, en el commit `5aa1573` del repositorio. Los intervalos son intervalos de Wilson al 95 %.

| Vista | Items | Este adaptador |
|---|---|---|
| official | 1.147 | 750 = 65,4 % (62,6–68,1 %) |
| consistent | 1.046 | 723 = 69,1 % (66,3–71,8 %) |
| corrected | 1.139 | 779 = 68,4 % (65,6–71,0 %) |

Definiciones segun la model card: *official* incluye todos los items de test puntuados contra la respuesta publicada por FinQA; *consistent* excluye los items cuya etiqueta una revision manual considero erronea o indecidible, y los 9 items cuyo programa y respuesta escrita difieren solo en signo; *corrected* sustituye un programa gold erroneo por uno corregido a mano, dejando fuera 2 items ambiguos y 6 indecidibles.

El programa se ejecuta correctamente en 1.143 de 1.147 items, y coincide exactamente con el programa gold en 708 (program accuracy).

Comparacion en la vista oficial, mismo prompt y mismo scorer:

| Modelo | Test, official |
|---|---|
| `Qwen/Qwen2.5-1.5B-Instruct`, 0-shot | 18 = 1,6 % |
| `Qwen/Qwen2.5-1.5B-Instruct`, 4-shot | 63 = 5,5 % |
| `Qwen/Qwen3-4B-Instruct-2507`, 4-shot | 252 = 22,0 % |
| 10 ejecuciones LoRA (2 brazos × 5 semillas), incluida esta | 63,1–66,4 % |

Frente a Qwen3-4B 4-shot, este adaptador acierta en 539 items donde Qwen3-4B falla y falla en 41 donde este acierta (McNemar exacto, p = 7,7e-112).

Sobre la comparacion entre brazos de datos: el brazo "cleaned" aventaja al aleatorio en +1,10 puntos (promedio de semillas, vista oficial), pero el intervalo de la regla fijada antes de conocer resultados principales es −0,52 a +2,71, que incluye cero; el autor concluye que no hay diferencia detectable y que este adaptador no es evidencia de que eliminar esos items ayude.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,1 GB; el modelo base `Qwen/Qwen2.5-1.5B-Instruct` en FP16 requiere del orden de 3 GB de VRAM solo para pesos, mas memoria para el contexto y el cache KV.
- GPU recomendadas: cualquier GPU con al menos 6–8 GB de VRAM para FP16 con contexto moderado; A100, H100 o RTX 4090 sobran ampliamente para este tamano. En GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) el modelo cabe con holgura.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card), y potencialmente vLLM, llama.cpp u Ollama con el adaptador fusionado o convertido, aunque estas ultimas opciones no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles. La generacion esta limitada a `max_new_tokens=96` en el ejemplo oficial, con decodificacion greedy, lo que sugiere respuestas cortas (programas de una linea).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FinQA test (official) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen2.5-1.5B-Instruct) | 1,5 mil millones (base) | no disponible | 65,4 % | apache-2.0 | Hugging Face + GitHub |
| Qwen2.5-1.5B-Instruct, 0-shot | 1,5 mil millones | no disponible | 1,6 % | apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct, 4-shot | 1,5 mil millones | no disponible | 5,5 % | apache-2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507, 4-shot | 4 mil millones | no disponible | 22,0 % | no disponible en la informacion | Hugging Face |

La comparacion se limita a la tarea FinQA y a los datos declarados por el autor. No se dispone de datos de benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de nicho: solo resuelve la tarea FinQA y solo en ingles; no debe usarse como modelo generalista de chat o codigo.
- El prompt debe reproducirse exactamente (version 1, huella `4139bfc3519c`); desviaciones en el formato de hechos o en el system prompt pueden degradar gravemente el rendimiento.
- El modelo no recupera informacion: hay que proporcionarle los hechos relevantes. No puede responder preguntas que requieran buscar datos en documentos no incluidos en el prompt.
- Riesgo de alucinacion en la seleccion de operandos: puede copiar cifras incorrectas de los hechos o construir programas sintacticamente validos pero logicamente erroneos; por eso se recomienda validar con el ejecutor oficial y revisar la cadena de operaciones.
- La evaluacion declarada procede unicamente del autor y no se ha verificado de forma independiente en la informacion disponible; el conjunto de test se puntuo una sola vez.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada; al entrenarse sobre FinQA, hereda las limitaciones y posibles errores de etiquetado de ese dataset (el propio autor documenta una auditoria de etiquetas).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar tambien la licencia del modelo base Qwen2.5-1.5B-Instruct y de los datos de FinQA antes de un uso en produccion.
- Caveat de produccion: cero descargas y cero likes en el momento de la consulta; madurez y mantenimiento del adaptador no estan garantizados.
- El resultado sobre el brazo "cleaned" no demuestra superioridad frente al brazo aleatorio (intervalo de confianza que incluye cero), por lo que no debe citarse como evidencia de que la limpieza de datos mejora el rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/PritRai75/qwen2.5-1.5b-finqa-lora
- Repositorio de entrenamiento y evaluacion: https://github.com/PritRai75/finqa-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo de comparacion citado: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset FinQA (referenciado por el autor): no disponible enlace directo en la informacion proporcionada
