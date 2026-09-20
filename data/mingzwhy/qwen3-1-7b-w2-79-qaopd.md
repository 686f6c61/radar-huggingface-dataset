# MingZwhy/Qwen3-1.7B-W2.79-QAOPD

## Resumen

Qwen3-1.7B-W2.79-QAOPD es un checkpoint del modelo Qwen3-1.7B de Alibaba sometido a un proceso de cuantizacion agresiva hasta 2,79 bits por peso efectivos y posteriormente recuperado mediante destilacion. Lo publica el usuario MingZwhy en HuggingFace, acompanado del repositorio de codigo y receta de entrenamiento QAOPD. La cuantizacion esta "baked in": los pesos ya vienen cuantizados en el propio checkpoint, de modo que basta cargarlo con Transformers y evaluarlo, sin necesidad de aplicar tecnicas de cuantizacion posteriores.

El problema que aborda es el de la degradacion tipica de los formatos de muy bajo bit-width. En lugar de limitarse a cuantizar y publicar (lo que hundiria el rendimiento en razonamiento y codigo), el autor aplica dos fases: destilacion consciente de la cuantizacion (QAD) y destilacion on-policy (OPD), que recuperan parte de la capacidad perdida. El esquema de pesos mezcla INT1.58 e INT4 en bloques de 256, con el 50 % de los bloques en INT4, lo que da los 2,79 bits efectivos; embeddings y cabeza de salida quedan en INT4, las activaciones en INT8 y la cache KV en 16 bits.

El modelo cuenta con 1.720.574.976 parametros (arquitectura densa, sin mezcla de expertos), un repositorio de 3,5 GB y licencia Apache-2.0 heredada del modelo base. Su relevancia actual esta en el nicho de despliegue en hardware muy limitado: es un checkpoint para evaluar cuanta capacidad de razonamiento y codigo sobrevive a una compresion de menos de 3 bits por peso, con datos medidos por el propio autor frente al Qwen3-1.7B en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), con codigo de cuantizacion personalizado cargado via `trust_remote_code` |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el autor no declara el valor para el checkpoint cuantizado |
| Tipos de cuantizacion | Pesos: mezcla INT1.58 / INT4 en bloques de 256, con el 50 % de los bloques en INT4 (2,79 bits efectivos). Embeddings y cabeza de salida: INT4. Activaciones: INT8. Cache KV: 16 bits |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base Qwen3 es multilingue, pero el autor no documenta idiomas para este checkpoint) |
| Licencia | Apache-2.0 (heredada de Qwen3-1.7B) |
| Formato de pesos | Safetensors, con codigo personalizado (`custom_code`); requiere `trust_remote_code=True` |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repositorio | 3,5 GB |
| Pipeline | text-generation |
| Compatibilidad de despliegue | Etiquetado como `text-generation-inference` y `endpoints_compatible` |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, y no modifica su topologia: la intervencion se produce en el espacio de pesos y en el proceso de recuperacion. La cuantizacion es mixta y por bloques: cada bloque de 256 pesos se asigna a INT1.58 o a INT4, con una proporcion del 50 % de bloques en INT4, lo que arroja un promedio de 2,79 bits por peso. Los embeddings y la cabeza de salida se mantienen en INT4 (son las capas mas sensibles a la compresion extrema por su funcion de proyeccion sobre el vocabulario), las activaciones se cuantizan a INT8 y la cache KV se conserva en 16 bits para no penalizar la fidelidad del contexto.

La innovacion metodologica esta en la recuperacion en dos etapas: primero una destilacion consciente de la cuantizacion (quantization-aware distillation, QAD), que ajusta los pesos ya cuantizados tomando como referencia al modelo sin cuantizar, y despues una destilacion on-policy (on-policy distillation, OPD), en la que el estudiante genera sus propias secuencias y se corrige contra el profesor. El autor no detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales: esos datos no estan disponibles en la informacion proporcionada. La receta completa, el arnes de evaluacion y el codigo se publican en el repositorio GitHub QAOPD.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B y etiquetada por el autor como `conversational`.
- Razonamiento matematico: resuelve problemas de aritmetica y algebra de varios pasos, aunque con perdida medible frente al modelo sin cuantizar (GSM8K 54,28 frente a 68,76; MATH-500 49,60 frente a 54,40).
- Generacion de codigo: supera el 50 % en MBPP (52,0) y roza el 60 % en HumanEval (59,1) en pass@1 greedy, con una caida de 8 puntos en HumanEval respecto al BF16.
- Evaluacion por verosimilitud: el agregado QA9 (media de nueve benchmarks puntuados por likelihood) se situa en 51,81, lo que indica que el modelo conserva una distribucion de probabilidad utilizable para ranking y scoring, no solo para generacion.
- Capacidades heredadas del Qwen3-1.7B (tool calling, modo thinking, multilingueismo) no estan documentadas por el autor para este checkpoint: no disponibles.
- La cuantizacion esta integrada en los pesos, por lo que el modelo se carga directamente sin pipeline de cuantizacion adicional.

## Casos de uso

- Despliegue en hardware de gama muy baja: con pesos de aproximadamente 2,79 bits por parametro, el checkpoint ocupa del orden de 0,6-1 GB en pesos, lo que permite ejecutarlo en GPUs integradas, equipos de un solo uso o instancias con 4 GB de VRAM donde un modelo de 1,7B en BF16 no cabe con holgura.
- Generacion de codigo asistida en entornos locales: su HumanEval de 59,1 y su MBPP de 52,0 permiten autocompletado y generacion de funciones en editores o IDEs que corren sin conexion, asumiendo que las tareas complejas requeriran revision humana por la caida frente al BF16.
- Clasificacion y scoring por verosimilitud: el agregado QA9 de 51,81 lo hace apto para tareas de ranking de respuestas, filtrado de datos o etiquetado en lote donde interesa el log-probability y no la generacion libre.
- Tutorizacion de matematicas de nivel escolar: con un 54,28 en GSM8K 5-shot, puede resolver problemas de primaria y secundaria paso a paso en un asistente educativo autoalojado; conviene validar la respuesta final por codigo (calculadora o interprete) dado el margen de error.
- Modelo borrador para decodificacion especulativa: al ser una version comprimida del mismo tokenizador y la misma familia que Qwen3-1.7B, es un candidato natural para actuar como draft model de un Qwen3 mayor, acelerando la decodificacion en el modelo verificador.
- Prototipado y experimentacion en investigacion sobre cuantizacion: sirve como punto de comparacion reproducible para estudiar QAD y OPD, ya que el autor publica el arnes de evaluacion y la receta en el repositorio QAOPD.
- Procesamiento por lotes en CPU: el bajo peso del checkpoint permite ejecutar resumenes, extraccion de palabras clave o reescritura de textos en servidores sin GPU, a costa de latencia mayor.
- Evaluacion de robustez de pipelines: util para medir como se comporta un sistema agente (formateo de salidas, cumplimiento de plantillas) cuando el motor linguistico pierde precision, antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos a traves de este checkpoint y comparados con el Qwen3-1.7B sin cuantizar. GSM8K en 5-shot strict-match, MATH-500 en 4-shot, AMC23 con avg@16, MBPP y HumanEval con pass@1 greedy, y QA9 como media de nueve benchmarks puntuados por verosimilitud.

| Benchmark | Este modelo (W2.79) | Qwen3-1.7B BF16 | Diferencia |
|---|---:|---:|---:|
| GSM8K | 54,28 | 68,76 | -14,48 |
| MATH-500 | 49,60 | 54,40 | -4,80 |
| AMC23 (avg@16) | 19,38 | 31,72 | -12,34 |
| MBPP (pass@1) | 52,0 | 54,0 | -2,0 |
| HumanEval (pass@1) | 59,1 | 67,1 | -8,0 |
| QA9 (media de 9 benchmarks) | 51,81 | 54,54 | -2,73 |

La perdida es desigual: el dano es contenido en tareas de codigo (MBPP -2,0) y en el agregado por verosimilitud (QA9 -2,73), mientras que se concentra en razonamiento matematico de competicion (AMC23 -12,34) y en aritmetica de varios pasos (GSM8K -14,48).

## Requisitos de hardware

- Peso teorico de los pesos: 1.720.574.976 parametros x 2,79 bits / 8 = aproximadamente 0,60 GB, a lo que se suman los embeddings y la cabeza de salida en INT4 y las estructuras de bloques de 256 con sus escalas.
- VRAM estimada de pesos en inferencia: del orden de 0,9-1,2 GB; con activaciones INT8 y cache KV en 16 bits, el consumo realista se situa en torno a 2-3 GB segun longitud de contexto y tamano de lote (estimacion derivada de los bits declarados, no medida por el autor).
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (RTX 3050, GTX 1650, RTX 4060, integradas con memoria unificada). Con 6-8 GB hay margen para contextos largos y lotes mayores.
- GPU recomendadas para produccion: cualquiera con soporte de INT8, como L4, T4, A10G, RTX 4090 o A100/H100 para despliegues con alta concurrencia; en estos ultimos el modelo es claramente subutilizado y su interes es principalmente economico.
- Despliegue: Transformers con `trust_remote_code=True` (via recomendada por el autor), dado que se trata de codigo personalizado. El repositorio esta etiquetado como compatible con text-generation-inference. vLLM, llama.cpp, Ollama y TGI con kernels genericos no estan confirmados para este esquema de cuantizacion mixta; no hay version GGUF publicada.
- CPU: viable por el reducido tamano de pesos, aunque con throughput bajo no cuantificado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Bits efectivos | GSM8K | HumanEval | QA9 | Licencia | Contexto |
|---|---:|---:|---:|---:|---:|---|---|
| Qwen3-1.7B-W2.79-QAOPD (este) | 1,72 B | 2,79 | 54,28 | 59,1 | 51,81 | Apache-2.0 | no disponible |
| Qwen3-1.7B BF16 (base) | 1,72 B | 16 | 68,76 | 67,1 | 54,54 | Apache-2.0 | no disponible en esta ficha |
| Qwen3-0.6B | 0,6 B | 16 | no disponible | no disponible | no disponible | Apache-2.0 | no disponible en esta ficha |
| Llama-3.2-1B | 1,24 B | 16 | no disponible | no disponible | no disponible | Licencia comunitaria de Llama 3.2 | no disponible en esta ficha |

Nota: los datos de Qwen3-0.6B y Llama-3.2-1B no proceden de la busqueda realizada ni de la model card; se incluyen unicamente como referencia de categoria y no deben usarse para comparaciones cuantitativas sin verificar sus fichas oficiales. No hay resultados de benchmarks publicados para alternativas cuantizadas a ~3 bits de la misma familia en la informacion disponible.

## Limitaciones y advertencias

- Degradacion medible y no homogenea: se pierden 14,48 puntos en GSM8K y 12,34 en AMC23 respecto al Qwen3-1.7B BF16. No es sustituible por el modelo sin cuantizar en tareas de razonamiento matematico exigente.
- Riesgo de alucinacion incrementado: la compresion a 2,79 bits y la perdida de precision en capas de razonamiento tienden a aumentar la tasa de errores plausibles en cadenas largas; no hay evaluacion de veracidad publicada.
- Sesgos: no hay evaluacion de sesgos ni de toxicidad en la informacion disponible, ni para el checkpoint ni reportada por el autor.
- Idiomas y contexto: no disponibles. El autor no documenta que idiomas conserva el proceso de destilacion ni la ventana de contexto efectiva del checkpoint cuantizado, por lo que no se puede asumir que mantenga el comportamiento multilingue o de contexto largo del modelo base.
- Dependencia de codigo personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.
- Ecosistema de despliegue limitado: sin version GGUF ni confirmacion de soporte en vLLM, llama.cpp u Ollama, las opciones de servido se reducen practicamente a Transformers y TGI.
- Madurez: el repositorio registra 0 descargas y 0 likes, y no se han publicado validaciones independientes de los numeros del autor.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero se hereda del modelo base Qwen3-1.7B; conviene verificar las condiciones de la licencia original y de los datasets de destilacion, no documentados.
- Sin datos de rendimiento en produccion: no hay cifras publicadas de latencia, throughput ni consumo energetico, imprescindibles para dimensionar un despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-1.7B-W2.79-QAOPD
- Repositorio de codigo y receta QAOPD: https://github.com/MingZwhy/QAOPD
- Arnés de evaluacion (EVALUATION.md): https://github.com/MingZwhy/QAOPD/blob/main/docs/EVALUATION.md
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
