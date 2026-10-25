# fcmeyer/Nanbeige4.3-33B-MLX-4bit

## Resumen

Nanbeige4.3-33B-MLX-4bit es una conversión a formato MLX con cuantización de 4 bits del modelo Nanbeige4.3-33B, desarrollado por el equipo Nanbeige. La conversión la firma el usuario fcmeyer y se distribuye como un repositorio independiente en HuggingFace bajo licencia Apache-2.0. El objetivo es permitir la ejecución del modelo en hardware Apple Silicon mediante el framework MLX, reduciendo el peso de los pesos de aproximadamente 66 GB en BF16 a 18,63 GB en 4 bits.

El modelo base es un transformer de 33.118.977.024 parámetros (33,1 mil millones) orientado a generación de texto y conversación, con soporte de modo de razonamiento explícito (*thinking*) y de llamadas a herramientas. Está pensado para los idiomas inglés y chino. La conversión conserva la configuración de contexto de 524.288 tokens del modelo original, aunque el autor advierte explícitamente de que la ventana completa de 512K no ha sido validada.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para inferencia local en Mac; por otro, deja claro qué nivel de evidencia aporta el autor. La validación publicada es una comprobación de regresión de la cuantización (perplejidad, divergencia KL y acuerdo top-1 frente a BF16), no un conjunto de benchmarks de capacidad, por lo que no debe interpretarse como equivalencia funcional con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (etiqueta `llama` en el repositorio); detalles de capas y atención no disponibles |
| Parametros totales | 33.118.977.024 (33,1 B) |
| Parametros activos | No aplica: la informacion disponible no indica arquitectura MoE |
| Longitud de contexto | 524.288 tokens configurados en el modelo base; la ventana completa de 512K no ha sido validada |
| Tipos de cuantizacion | 4 bits afín (affine), group size 64; no se publican otras variantes en este repositorio |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (1203 tensores; 18.630.644.624 bytes) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo base como un transformer de la familia Llama (la etiqueta del repositorio es `llama`) con 33,1 mil millones de parametros densos. No se documentan en la ficha el numero de capas, la configuracion de atencion (por ejemplo, si emplea attention lineal o decodificacion especulativa), ni el esquema de positional encoding. La conversion MLX preserva la plantilla de chat original, que incluye un parametro `enable_thinking` para activar el razonamiento explicito y `preserve_thinking=True` para retener el razonamiento previo en flujos de agente. El autor recomienda `tool_call_format="xml"` y acepta tambien JSON, aunque advierte que el soporte de la plantilla no certifica el parser de herramientas de ningun servidor concreto.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo original. Tampoco se detalla la innovacion tecnica del modelo base mas alla de la presencia de un modo de razonamiento y de la ventana de contexto de 512K. Lo unico documentado a nivel tecnico es el proceso de conversion: cuantizacion afina de 4 bits base con grupo de 64, derivada de forma independiente de los pesos BF16, con scripts de reproduccion (`release.py convert`, `release.py validate`) y artefactos de validacion incluidos (`conversion.json`, `evaluation.json`, `environment.json`, `requirements.lock.txt`).

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Modo de razonamiento explicito, activable mediante `enable_thinking` en la plantilla de chat.
- Preservacion del razonamiento previo para flujos de agente (`preserve_thinking=True`).
- Llamada a herramientas con formato XML (recomendado por el autor) y JSON.
- Encaje en pipelines de agentes multi-paso gracias a la retencion de trazas de razonamiento.
- Contexto largo configurado de hasta 524.288 tokens, con la salvedad de que no se ha validado el extremo de 512K.
- No se documentan capacidades de vision, audio, codigo especializado ni matematicas mas alla de lo que implica el modo de razonamiento; no disponibles.

## Casos de uso

- Asistente conversacional local en Mac: el modelo cabe en memoria unificada (19-23 GB de pico medidos) y permite conversaciones multi-turno sin salir del equipo, lo que resulta util para prototipado con datos sensibles que no deben enviarse a la nube.
- Automatizacion de agentes con herramientas: la combinacion de `tool_call_format="xml"` y `preserve_thinking` permite construir bucles de razonamiento-accion donde el modelo conserva el hilo de decisiones entre llamadas, adecuado para orquestadores locales de tareas.
- Procesamiento de documentos largos en ingles o chino: con 512K tokens de contexto configurados se pueden ingerir manuales, expedientes o bases de codigo extensas en una sola peticion, aunque conviene validar el rendimiento real mas alla de 16K tokens.
- Generacion y resumen de contenido bilingue en/zh: util para equipos que trabajan con documentacion en ambos idiomas y necesitan un unico modelo local en lugar de dos especializados.
- Evaluacion y experimentacion en investigacion: el repositorio incluye scripts de reproduccion, ficheros de validacion y comparaciones KL/NLL frente a BF16, lo que facilita estudios de degradacion por cuantizacion en hardware Apple.
- Desarrollo offline en portatiles Apple: al no requerir GPU dedicada, sirve para entornos sin conectividad o con requisitos de privacidad estrictos, con velocidades de decodificacion de 21-28 tok/s.
- Integracion en herramientas de escritorio para macOS: al estar en formato MLX, se puede cargar con `mlx_lm` dentro de aplicaciones nativas que necesiten generacion de texto sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor lo indica de forma explicita: la validacion es una comprobacion de regresion de la conversion, no un benchmark de capacidad.

Metricas de validacion de la cuantizacion (corpus sintetico fijo de 563 tokens puntuados):

| Metrica | Valor |
|---|---|
| NLL medio por token | 2,058472 |
| Perplejidad | 7,833987 |
| Diferencia de NLL frente a BF16 | -0,015221 |
| KL(BF16 ‖ cuantizado), media | 0,068600 nats/token |
| Acuerdo top-1 con BF16 | 87,74 % |

Rendimiento medido en Apple M5 Max con 128 GB de memoria unificada, KV cache sin cuantizar, pasos de prefill de 512 tokens, 256 tokens de salida, mediana de tres ejecuciones tras un calentamiento:

| Tokens de entrada | Prefill (tok/s) | Decode (tok/s) | Pico (GB) |
|---:|---:|---:|---:|
| 512 | 511,66 | 27,80 | 19,32 |
| 4096 | 595,61 | 26,66 | 19,97 |
| 16384 | 520,52 | 21,34 | 22,53 |

El pico de memoria es la asignacion maxima reportada por MLX y excluye otras aplicaciones y el sistema operativo.

## Requisitos de hardware

- VRAM/memoria estimada: 18,63 GB solo de pesos; pico medido de 19,32 GB con 512 tokens de entrada y 22,53 GB con 16.384 tokens (KV cache sin cuantizar).
- Memoria unificada recomendada: 32 GB como minimo para contexto corto con margen para el sistema; 64 GB o mas si se pretende explotar contextos de decenas de miles de tokens.
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada. No hay mediciones publicadas para otros chips de la familia M.
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por esta conversion, que depende de MLX; para CUDA habria que recurrir a los pesos originales del modelo base.
- Cabe en GPU de consumo: si, en el sentido de Apple Silicon de gama alta (M-series Pro/Max con 32 GB o mas); no aplica a GPUs de consumo NVIDIA para este repositorio concreto.
- Opciones de despliegue: `mlx_lm` (carga y generacion via Python), servidor de `mlx_lm` para exponer una API compatible, y entornos macOS que integren MLX. vLLM, TGI, llama.cpp y Ollama no son aplicables a este repositorio en formato MLX.
- Latencia y throughput: prefill de 511-596 tok/s y decodificacion de 21-28 tok/s en el hardware indicado, con degradacion del decode a medida que crece el contexto (27,80 tok/s a 512 tokens frente a 21,34 tok/s a 16.384).

## Comparativa con modelos similares

Los datos de rendimiento de capacidad no estan disponibles para este modelo, por lo que la comparativa se limita a parametros, contexto, licencia y formato.

| Modelo | Parametros | Contexto | Licencia | Formato / hardware | Rendimiento |
|---|---|---|---|---|---|
| fcmeyer/Nanbeige4.3-33B-MLX-4bit | 33,1 B (4 bits) | 524.288 configurados, 512K sin validar | Apache-2.0 | safetensors MLX, Apple Silicon | Solo metricas de regresion de cuantizacion |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1 B (BF16) | 524.288 configurados | Apache-2.0 | safetensors, GPU o CPU | No disponible en la informacion proporcionada |
| Qwen2.5-32B-Instruct | 32,8 B | 131.072 | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ | No comparable: sin datos en esta ficha |
| Gemma-2-27B | 27 B | 8.192 | Terminos de uso de Gemma | safetensors, GGUF | No comparable: sin datos en esta ficha |

Las filas de Qwen2.5-32B-Instruct y Gemma-2-27B recogen unicamente datos publicos de sus fichas oficiales (parametros, contexto y licencia) y se incluyen como referencia de categoria; no se han contrastado empiricamente contra este modelo.

## Limitaciones y advertencias

- La cuantizacion de 4 bits es lossy: el acuerdo top-1 con BF16 es del 87,74 % y la KL media es de 0,0686 nats/token, lo que implica diferencias de distribucion que pueden alterar respuestas en tareas sensibles.
- La validacion se hizo sobre un corpus sintetico fijo de 563 tokens; el propio autor advierte que no establece equivalencia de capacidad en tareas downstream.
- No hay benchmarks estandar publicados, asi que no es posible afirmar como se compara con otros modelos de 30B en razonamiento, codigo o matematicas.
- El contexto de 512K esta configurado pero no validado en su totalidad; el rendimiento y la fidelidad mas alla de 16K tokens no estan documentados.
- Solo soporta ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- El soporte de la plantilla de herramientas no certifica el parser de ningun servidor: si se integra en un framework de agentes, hay que validar el parseo XML/JSON de extremo a extremo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una conversion de la comunidad, con menor escrutinio externo que el modelo original.
- Dependencia de MLX: no es portable a CUDA ni a CPU fuera del ecosistema Apple, lo que limita su uso en produccion sobre infraestructura convencional.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar la ficha del modelo base por si el autor original anade terminos adicionales de atribucion.
- Riesgo de alucinacion y sesgos: no documentados por el autor; aplican los habituales de un modelo entrenado principalmente con corpus en ingles y chino.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/fcmeyer/Nanbeige4.3-33B-MLX-4bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Revision del modelo base utilizada: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/c1093c501cc6460427c0ac634db7223d0450c0ee
- Libreria de inferencia MLX para LLMs (referenciada en el ejemplo de uso): https://github.com/ml-explore/mlx-lm
- Framework MLX: https://github.com/ml-explore/mlx
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados obtenidos no guardaban relacion con el modelo.
