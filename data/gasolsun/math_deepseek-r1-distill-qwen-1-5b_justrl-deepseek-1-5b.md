# gasolsun/Math_DeepSeek-R1-Distill-Qwen-1.5B_JustRL-DeepSeek-1.5B

## Resumen

Math_DeepSeek-R1-Distill-Qwen-1.5B_JustRL-DeepSeek-1.5B es un ajuste fino de matematicas del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicado por el usuario gasolsun en HuggingFace. El modelo se ha entrenado con una receta de destilacion on-policy denominada "Ask to Distill", en la que el profesor es hbx/JustRL-DeepSeek-1.5B y el alumno el citado distill de DeepSeek-R1 sobre Qwen. El objetivo declarado es mejorar el razonamiento matematico del alumno sin utilizar preguntas de entrenamiento reales ni respuestas de referencia.

La innovacion principal de la receta es la generacion del banco de preguntas: se entrena un generador de preguntas con aprendizaje por refuerzo para que escriba enunciados que expongan desacuerdo a nivel de token, acotado y aprendible, entre profesor y alumno sobre las propias soluciones del alumno. Ese banco se muestrea, se filtra y se deduplica, y despues el alumno se entrena con destilacion on-policy (OPD) sobre el. El resultado es un modelo denso de 1.777.088.000 parametros (aproximadamente 1,78 mil millones), arquitectura Qwen2, licencia MIT y pesos en safetensors, pensado especificamente para resolucion de problemas matematicos con cadenas de razonamiento largas.

Es relevante ahora porque combina dos lineas de trabajo muy activas: la destilacion de modelos razonadores grandes hacia modelos pequenos desplegables en hardware de consumo, y la generacion de datos sinteticos de entrenamiento sin depender de datasets humanos etiquetados. El autor publica ademas el banco de preguntas como dataset independiente y los resultados en seis benchmarks de matematicas (AIME24, AIME25, AIME26, AMC23, BRUMO25 y MATH500), con una media de 51,63.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Qwen2 (tag de HuggingFace: qwen2); no es MoE ni SSM |
| Parametros totales | 1.777.088.000 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; la evaluacion se realizo generando hasta 31.744 tokens nuevos |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (3,6 GB, compatible con bf16). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2 es multilingue, pero el ajuste esta orientado a matematicas |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers; compatible con text-generation-inference y endpoints) |

Otros datos: repositorio de 3,6 GB, creado el 15 de octubre de 2026, 0 descargas y 0 likes en el momento de la consulta, pipeline text-generation.

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder denso de la familia Qwen2 con aproximadamente 1,78 mil millones de parametros. El ajuste no modifica la topologia: se parte de los pesos del distill y se aplica un entrenamiento adicional de destilacion. No se documentan en la informacion disponible detalles como numero de capas, dimension oculta, numero de cabezas de atencion ni tipo de atencion (full o sliding window).

El entrenamiento sigue la receta "Ask to Distill". Un generador de preguntas se entrena con RL para producir enunciados que maximicen el desacuerdo a nivel de token, acotado y aprendible, entre el profesor (hbx/JustRL-DeepSeek-1.5B) y el alumno (deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B) sobre las soluciones que genera el propio alumno; ese desacuerdo es la senal que explota la destilacion on-policy. A continuacion se muestrea un banco de preguntas del generador, se filtra y se deduplica, y el alumno se entrena con OPD sobre el. Ni las preguntas de entrenamiento ni las respuestas de referencia son reales.

El objetivo de OPD es una KL inversa por token calculada sobre los 16 tokens mas probables del alumno, ponderada por las probabilidades renormalizadas del propio alumno, y sin recompensa de resultado final. Los hiperparametros declarados son: learning rate constante de 1e-6, optimizador AdamW, temperatura de rollout 1.0 y pesos maestros en fp32 con computo en bf16. No se especifica el volumen de tokens de entrenamiento ni la composicion exacta del banco de preguntas mas alla de que se publica como dataset.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, con cadenas de razonamiento largas (la evaluacion permite hasta 31.744 tokens nuevos).
- Resolucion de problemas de competicion: entrenado y evaluado sobre AIME, AMC, BRUMO y MATH500.
- Formato de respuesta controlado: el prompt de evaluacion del autor pide la respuesta final en la forma `Answer: $Answer` y dentro de `\boxed{}`, lo que facilita el parseo automatico.
- Razonamiento auto-consistente: los resultados publicados se obtienen con avg@16 (avg@4 en MATH500), lo que implica que el modelo se beneficia de muestreo multiple y votacion.
- Modo conversacional: la model card usa `apply_chat_template` con mensajes de rol user/assistant, por lo que soporta dialogo multi-turno basico.
- Compatibilidad con text-generation-inference y con endpoints alojados (tags `text-generation-inference` y `endpoints_compatible`).
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y multi-step reasoning autonomo con herramientas: no documentadas.
- Vision o audio: no soportados (modelo exclusivamente de texto).
- Modo "thinking" explicito separado: no documentado como tal; el razonamiento se emite dentro de la propia generacion.

## Casos de uso

- Tutoria de matematicas con explicacion paso a paso: el modelo esta afinado para producir cadenas de razonamiento extensas y una linea final de respuesta parseable, de modo que puede integrarse en una interfaz educativa que muestre el desarrollo y valide automaticamente el resultado.
- Generacion de datos sinteticos para entrenar modelos mas pequenos: dado que la receta "Ask to Distill" produce un banco de preguntas filtrado y deduplicado, el modelo y su pipeline sirven como fuente de problemas y soluciones razonadas para destilacion posterior.
- Correccion automatica de ejercicios de competicion: el formato `Answer: $Answer` con `\boxed{}` permite extraer la respuesta final con una expresion regular y compararla con la solucion oficial en un pipeline de evaluacion por lotes.
- Investigacion en destilacion on-policy: reproduce un experimento completo (profesor, alumno, generador de preguntas, banco publicado) para estudiar el efecto de la senal KL inversa por token frente a recompensas de resultado.
- Evaluacion comparativa de recetas de RL y destilacion: sirve como punto de control de 1,5B parametros para medir si el ajuste con preguntas sinteticas supera al modelo base en AIME/AMC/MATH500 bajo el mismo protocolo de muestreo.
- Despliegue on-premise o en el borde: con 1,78 mil millones de parametros y licencia MIT, puede ejecutarse en una GPU de consumo o incluso en CPU con cuantizacion, en escenarios donde no se permite enviar problemas a APIs externas.
- Preprocesado de problemas matematicos en un pipeline mayor: el modelo puede normalizar enunciados, reescribirlos en lenguaje mas claro o generar variantes de un mismo problema para aumentar un dataset interno.
- Generacion de soluciones de referencia para validacion cruzada: al muestrear varias soluciones (avg@16) y comparar respuestas finales, se puede construir un mecanismo de consenso para detectar problemas mal etiquetados.

## Benchmarks y rendimiento

Resultados publicados por el autor (avg@16, avg@4 en MATH500; temperatura 0,7; top-p 0,95; maximo 31.744 tokens nuevos):

| Benchmark | Resultado |
|---|---|
| AIME24 | 45,0 |
| AIME25 | 35,8 |
| AIME26 | 29,2 |
| AMC23 | 83,6 |
| BRUMO25 | 34,0 |
| MATH500 | 82,2 |
| Media de los seis (avg6) | 51,63 |

No se han publicado en la informacion disponible resultados comparativos del modelo base ni de otros modelos bajo el mismo protocolo, por lo que no es posible cuantificar la mejora atribuible al ajuste con "Ask to Distill" frente a deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativamente unos 4-5 GB en bf16/fp16 para los pesos (el repositorio ocupa 3,6 GB) mas la cache KV, que crece con la longitud de contexto y el tamano de lote. No hay cifras oficiales publicadas.
- Cuantizacion: no se publican pesos GGUF, AWQ ni GPTQ, pero al ser un modelo Qwen2 estandar es convertible a GGUF con llama.cpp y a otros formatos con las herramientas habituales; en 4 bits los pesos ocuparian aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para lotes grandes o contextos muy largos, A100 o H100 proporcionan margen de sobra.
- Cabe en GPU de consumo: si. En 4 bits cabe incluso en GPUs de 6-8 GB, y el modelo puede ejecutarse en CPU con llama.cpp aunque con latencia alta.
- Opciones de despliegue: transformers (receta de la model card), text-generation-inference (etiqueta oficial), vLLM y SGLang para servido con batching, Ollama o llama.cpp tras convertir a GGUF, y endpoints de HuggingFace (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Resultados comparables |
|---|---|---|---|---|---|
| gasolsun/Math_DeepSeek-R1-Distill-Qwen-1.5B_JustRL-DeepSeek-1.5B | 1,78 B | Denso Qwen2 | MIT | safetensors en HuggingFace | AIME24 45,0; MATH500 82,2; avg6 51,63 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1,78 B | Denso Qwen2 | MIT | safetensors en HuggingFace | No disponible en la informacion proporcionada |
| hbx/JustRL-DeepSeek-1.5B (profesor) | ~1,5 B (segun nomenclatura) | Denso | No disponible en la informacion proporcionada | HuggingFace | No disponible |
| Qwen2.5-Math-1.5B (familia base) | ~1,5 B | Denso Qwen2 | No disponible en la informacion proporcionada | HuggingFace | No disponible |

Los datos de parametros, licencia y benchmarks de las alternativas no se han verificado en esta busqueda, por lo que deben comprobarse en sus respectivas model cards antes de usarse en una comparacion formal.

## Limitaciones y advertencias

- Datos de entrenamiento exclusivamente sinteticos: el banco de preguntas lo genera un modelo entrenado con RL y no incluye preguntas reales ni respuestas de referencia, lo que puede introducir sesgos y sesgos de distribucion hacia los tipos de problema que el generador produce.
- Rendimiento desigual por benchmark: la media de 51,63 oculta una caida marcada en pruebas de dificultad alta (AIME26 29,2; BRUMO25 34,0) frente a resultados solidos en AMC23 (83,6) y MATH500 (82,2).
- Dependencia del prompt: los resultados publicados usan un prompt de evaluacion muy concreto, con instrucciones sobre el formato de la respuesta final; variaciones en el prompt pueden degradar el rendimiento y romper el parseo.
- Especializacion en matematicas: no hay evidencia publicada de rendimiento en codigo, conocimiento general, redaccion o dialogo abierto; el ajuste puede haber degradado capacidades generales del modelo base.
- Idiomas: no se declara soporte multilingue; el entrenamiento y la evaluacion estan en ingles, por lo que el comportamiento en castellano no esta caracterizado.
- Longitud de contexto: no documentada; aunque la evaluacion usa hasta 31.744 tokens nuevos, un contexto menor del esperado truncaria problemas largos.
- Riesgo de alucinacion: como todo modelo de razonamiento, puede producir cadenas de pasos plausibles pero incorrectas y llegar a una respuesta final erronea con alta confianza; conviene validar la respuesta con un verificador externo.
- Sin resultados de seguridad, sesgo o toxicidad publicados.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias ni soporte. Conviene revisar tambien las condiciones del modelo base y del profesor.
- Madurez: el repositorio tiene 0 descargas y 0 likes en la fecha de consulta, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gasolsun/Math_DeepSeek-R1-Distill-Qwen-1.5B_JustRL-DeepSeek-1.5B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Profesor (JustRL-DeepSeek-1.5B): https://huggingface.co/hbx/JustRL-DeepSeek-1.5B
- Dataset del banco de preguntas: https://huggingface.co/datasets/gasolsun/Math_DeepSeek-R1-Distill-Qwen-1.5B_JustRL-DeepSeek-1.5B
- Paper, blog o repositorio de la receta "Ask to Distill": no disponible
- Demos o espacios asociados: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el tema y se omiten.
