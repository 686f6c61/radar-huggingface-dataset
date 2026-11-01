# AxonZeta/DeepSeek-V4.1-Flash-1017-AZ-Focus

## Resumen

DeepSeek-V4.1-Flash-1017-AZ-Focus es un ajuste fino (finetune) del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek-AI, desarrollado por AxonZeta, un laboratorio independiente de IA con sede en Manchester (Reino Unido). El objetivo del ajuste es reducir la verbosidad del modo de razonamiento ("thinking") del modelo original sin degradar su precision: segun la model card, el modelo piensa entre un 19 % y un 49 % menos tokens en las pruebas realizadas, manteniendo puntuaciones practicamente identicas en la mayoria de benchmarks.

El modelo conserva exactamente la misma arquitectura, tokenizer, chat template, estructura de ficheros y formatos de pesos (MXFP4 y FP8) que el modelo base, por lo que se presenta como un reemplazo directo ("drop-in replacement") que puede servirse con el mismo motor y configuracion. Segun los metadatos de safetensors, el modelo tiene 763.205.315.794 parametros totales (aproximadamente 763 mil millones) y un repositorio de 510,3 GB.

La relevancia del modelo reside en la eficiencia del razonamiento: en tareas agenticas y de codigo, el exceso de deliberacion se traduce directamente en coste de inferencia y latencia. AZ-Focus ataca ese problema optimizando los pesos contra habitos como "Wait...", "Hmm, maybe..." o la re-derivacion de respuestas ya obtenidas, manteniendo la verificacion en tareas de agente y matematicas dificiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de transformers: `deepseek_v41`) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con presupuesto de salida de 128k tokens en GPQA y AIME) |
| Tipos de cuantizacion | MXFP4 y FP8 (formatos nativos del modelo base); etiqueta `8-bit` |
| Idiomas soportados | no disponible (la model card indica que otros idiomas no se han medido por separado) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada; la etiqueta de transformers (`deepseek_v41`) indica que se trata de la arquitectura del modelo base DeepSeek-V4.1-Flash-1017, pero no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de parametros activos. El modelo se distribuye en formatos MXFP4 y FP8, coherentes con el modelo base.

El entrenamiento consiste en un ajuste fino de los pesos del modelo base DeepSeek-V4.1-Flash-1017 orientado a reducir la deliberacion redundante. Segun la model card, la optimizacion se dirigio especificamente contra los habitos de hesitacion y re-derivacion, dejando intacta la verificacion que el modelo realiza en tareas agenticas y en matematicas dificiles. No se detallan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El modelo conserva el dial de esfuerzo de razonamiento (`reasoning_effort`, de 1 a 100, con valor por defecto 75) del modelo base, y el efecto del ajuste se acumula con esa configuracion.

## Capacidades

- Generacion de texto y razonamiento paso a paso en modo "thinking", con menor verbosidad que el modelo base.
- Razonamiento matematico: MATH-500, GSM8K y AIME 2025 evaluados en la model card.
- Generacion de codigo: HumanEval y tareas de codificacion agentica (SWE-bench Verified con mini-SWE-agent).
- Codificacion agentica multi-paso: resolucion de issues en repositorios reales mediante parches de codigo.
- Dial de esfuerzo de razonamiento (`reasoning_effort`, 1-100, por defecto 75), configurable via `chat_template_kwargs` en SGLang.
- Modo sin razonamiento ("thinking off"): la longitud de salida no cambia respecto al modelo base.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Codificacion agentica en produccion: el modelo resuelve tareas de SWE-bench Verified con 93-94 aciertos sobre 100 tareas en dos ejecuciones, por lo que es adecuado para agentes que generan parches sobre repositorios reales con un limite de 100 pasos.
- Reduccion de coste de inferencia en pipelines de razonamiento: al generar entre un 19 % y un 49 % menos tokens de pensamiento con precision equivalente, reduce el coste por consulta en servicios que facturan por token de salida.
- Evaluacion de modelos y benchmarking interno: al ser un reemplazo directo del modelo base (misma arquitectura, tokenizer y chat template), permite comparar configuraciones sin cambiar la infraestructura de servicio.
- Asistentes de codigo con latencia ajustada: en HumanEval obtiene 98,8 % con 552 tokens de pensamiento frente a 98,2 % con 891 del original, lo que se traduce en respuestas mas rapidas en autocompletado y generacion de funciones.
- Razonamiento de dominio general con presupuesto controlado: en MMLU-Pro (14 materias) mantiene 88,8 % frente a 89,2 % del original usando un 34 % menos de tokens, util para clasificacion y respuesta a preguntas con limites de latencia.
- Despliegue como sustituto directo en infraestructura existente: se sirve con los mismos motores (la model card cita SGLang), el mismo paralelismo y el mismo sampling recomendado (temperatura 1.0, top-p 0.95), sin adaptadores ni parches.
- Tareas de agente de larga duracion: la model card indica que las sesiones agenticas de varias horas no se han medido por separado, por lo que su uso en ese escenario requiere validacion propia.

## Benchmarks y rendimiento

Resultados publicados en la model card (thinking activado, sampling recomendado por DeepSeek: temperatura 1.0, top-p 0.95, servido con SGLang):

| Benchmark | DeepSeek-V4.1-Flash-1017 | AZ-Focus | Tokens de pensamiento |
|---|---|---|---|
| GPQA Diamond (198, 2 ejecuciones) | 91,4 % · 6.629 tokens | 90,9 % · 3.777 tokens | 43 % menos |
| BIG-Bench Hard (540) | 82,0 % · 709 tokens | 84,1 % · 359 tokens | 49 % menos |
| MMLU-Pro (500, 14 materias) | 89,2 % · 1.445 tokens | 88,8 % · 953 tokens | 34 % menos |
| HumanEval (164) | 98,2 % · 891 tokens | 98,8 % · 552 tokens | 38 % menos |
| MATH-500 + GSM8K, held-out (450, 3 ejecuciones) | 95,0 % | 95,0 % | 25 % menos (MATH), 32 % menos (GSM8K) |
| AIME 2025 (30, 4 ejecuciones) | 97,5 % · 6.188 tokens | 95,8 % · 4.997 tokens | 19 % menos |
| SWE-bench Verified, primeras 100 tareas (mini-SWE-agent, 2 ejecuciones) | 94 / 94 | 94 / 93 | no disponible |

Resultados por nivel de esfuerzo en BIG-Bench Hard (540 tareas):

| Esfuerzo | DeepSeek-V4.1-Flash-1017 | AZ-Focus | Tokens de pensamiento |
|---|---|---|---|
| 75 (por defecto) | 82,0 % · 709 tokens | 84,1 % · 359 tokens | 49 % menos |
| 50 | 82,8 % · 464 tokens | 83,3 % · 278 tokens | 40 % menos |
| 35 | 85,6 % · 447 tokens | 81,7 % · 242 tokens | 46 % menos |
| 25 | 83,7 % · 300 tokens | 82,8 % · 219 tokens | 27 % menos |

Resultados por nivel de esfuerzo en MMLU-Pro (500 preguntas, 14 materias):

| Esfuerzo | DeepSeek-V4.1-Flash-1017 | AZ-Focus | Tokens de pensamiento |
|---|---|---|---|
| 75 (por defecto) | 89,2 % · 1.445 tokens | 88,8 % · 953 tokens | 34 % menos |
| 50 | 88,4 % · 1.245 tokens | 87,8 % · 799 tokens | 36 % menos |
| 35 | 87,8 % · 1.025 tokens | 89,0 % · 657 tokens | 36 % menos |
| 25 | 88,2 % · 704 tokens | 88,2 % · 389 tokens | 45 % menos |

La propia model card advierte que las ejecuciones unicas sobre unos cientos de preguntas varian uno o dos puntos en cualquier direccion; promediado sobre el dial, AZ-Focus esta a la par del original en MMLU-Pro y aproximadamente medio punto por debajo en BIG-Bench Hard.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 763.205.315.794 parametros, en FP8 (1 byte por parametro) el peso del modelo ronda los 763 GB, y en MXFP4 (4 bits por parametro) alrededor de 382 GB, sin contar overhead de KV cache ni activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el despliegue requiere multiples aceleradores de centro de datos (A100, H100 o equivalentes) con paralelismo tensorial; no cabe en una GPU de consumo.
- GPU de consumo: no cabe en ninguna GPU consumer individual.
- Opciones de despliegue: la model card cita SGLang como motor de servicio de los benchmarks; es compatible con el mismo motor, paralelismo, chat template y sampling que DeepSeek-V4.1-Flash-1017. Otros motores no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. La reduccion de tokens de pensamiento (19-49 % segun benchmark) implica menor tiempo de generacion y menor coste por consulta, pero no se publican cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Benchmarks destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-AZ-Focus | 763.205.315.794 | no disponible | GPQA Diamond 90,9 %; MMLU-Pro 88,8 %; HumanEval 98,8 %; SWE-bench Verified 93-94/100 | MIT | HuggingFace (AxonZeta) |
| DeepSeek-V4.1-Flash-1017 (modelo base) | no disponible | no disponible | GPQA Diamond 91,4 %; MMLU-Pro 89,2 %; HumanEval 98,2 %; SWE-bench Verified 94/100 | MIT | HuggingFace (deepseek-ai) |
| DeepSeek-V4.1-Flash-AZ-Focus | no disponible | no disponible | no disponible | MIT | HuggingFace (AxonZeta) |

No se dispone en la informacion proporcionada de datos de otros modelos de la misma categoria para una comparativa mas amplia.

## Limitaciones y advertencias

- Matematicas de competicion: ligeramente por detras del modelo base. AIME 2025 con 115 frente a 117 respuestas correctas de 120 en 4 ejecuciones, y MATH nivel 5 con 87,6 % frente a 89,6 % (3 ejecuciones). La model card indica que ambas diferencias estan dentro de la variacion entre ejecuciones, pero recomienda el original si el uso principal es matematicas de estilo olimpiada.
- Sesiones agenticas largas: las sesiones de agente de varias horas no se han medido por separado.
- Idiomas: no se han medido por separado otros idiomas distintos del evaluado en los benchmarks.
- Contextos muy largos: no se han medido por separado.
- Traza de autoverificacion: si se necesita la traza completa de autoverificacion del modelo, debe usarse el original.
- Sesgos y alucinacion: no se documentan en la informacion proporcionada; al ser un modelo de razonamiento de gran escala, conserva los riesgos del modelo base, que no se detallan en la model card.
- Licencia: MIT, permite uso comercial, pero se basa en DeepSeek-V4.1-Flash-1017 de DeepSeek-AI y remite al fichero `LICENSE` del repositorio.
- Adopcion: el repositorio registra 44 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxonZeta/DeepSeek-V4.1-Flash-1017-AZ-Focus
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version anterior del ajuste (para V4.1-Flash): https://huggingface.co/AxonZeta/DeepSeek-V4.1-Flash-AZ-Focus
- Sitio del desarrollador: https://axonzeta.ai
- Contacto del desarrollador: hello@axonzeta.ai
