# krummholz-ai/atlantic-27b-v8-GGUF

## Resumen

Krummholz Atlantic 27B v8 es un modelo de lenguaje conversacional derivado por ajuste fino de Qwen/Qwen3.8-27B (licencia Apache 2.0), desarrollado por Krummholz AI LLC (Belfast, Maine). Con 26.895.998.464 parametros (aproximadamente 26,9 mil millones), se distribuye en formato GGUF cuantizado para su despliegue en estaciones de trabajo y servidores. El modelo no esta disenado para ser maximalistamente servicial, sino para priorizar la veracidad: esta entrenado para decir "no lo se" en lugar de adivinar cuando no dispone de herramientas, para buscar informacion cuando las tiene disponibles y para evitar bucles de razonamiento.

La propuesta diferencial es su "constitucion" explicita, una jerarquia de valores (no danar, verdad ante todo, temperamento burkeano, conocimiento cientifico practico, neutralidad politica) de la que se derivan los pares de entrenamiento, las evaluaciones y las salvaguardas del harness. La version v8 incorpora cuatro rondas de entrenamiento de preferencias sobre las propias respuestas del modelo con el razonamiento activado, donde un codigo determinista clasifica las respuestas muestreadas como correctas, erroneas, abstenciones limpias, llamadas a herramientas bien formadas o correcciones de afirmaciones falsas.

El modelo es relevante para desarrolladores que necesitan un asistente con alta tasa de abstención calibrada, uso fiable de herramientas y resistencia a la adulacion, aunque sus propios datos muestran que sigue cometiendo errores al responder de memoria (16 % de respuestas erroneas sin herramientas). La informacion disponible no detalla la longitud de contexto, los idiomas soportados mas alla del ingles ni la composicion exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se publica y evalua Q4_K_M (Q5_K_M no medido) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, por lo que hereda la arquitectura transformer del modelo base; la informacion proporcionada no detalla numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El ajuste propio de Krummholz consiste en cuatro rondas de entrenamiento de preferencias (preference training) sobre las respuestas generadas por el propio modelo con el razonamiento activado. El etiquetado es automatico: un codigo determinista decide si cada respuesta muestreada es correcta, erronea, una abstencion limpia, una llamada a herramienta bien formada o una correccion de una afirmacion falsa, y el modelo se entrena para preferir su propia respuesta mejor valorada. Segun la model card, ningun texto de respuesta fue escrito por una persona ni por otro modelo.

Los pares de entrenamiento, las evaluaciones y las salvaguardas del harness se derivan de la constitucion del modelo, que prioriza la busqueda de la verdad sobre la utilidad, exige indicar el grado de certeza y lo que no se sabe, y obliga a consultar herramientas para hechos verificables en lugar de recurrir a la memoria. No se especifica el numero de tokens de entrenamiento ni la composicion del dataset. La evaluacion se realizo con el razonamiento activado sobre un conjunto fijo: 229 preguntas de hechos retenidas, 199 sondas, 120 prompts largos, 60 turnos de uso de herramientas y HarmBench 300.

## Capacidades

- Generacion de texto conversacional en ingles con un tono definido como "colaborador, no asistente": directo, calido y dispuesto a discrepar o rechazar peticiones.
- Abstimacion calibrada: dice explicitamente que no sabe en lugar de adivinar (35 % de las preguntas de hechos sin herramientas en la evaluacion v8).
- Uso de herramientas (tool calling / function calling): 60 de 60 llamadas bien formadas en la evaluacion; con herramientas, busca en lugar de responder de memoria en el 81 % de los casos.
- Razonamiento multi-paso con finalizacion garantizada: 0 de 120 prompts largos sin terminar y 0 casos de razonamiento sin finalizar con herramientas en la evaluacion v8.
- Correccion de afirmaciones falsas: corrige un calculo erroneo presentado como hecho en 59 de 60 casos y una afirmacion falsa ofrecida para confirmacion en 10 de 30.
- Autocorreccion y verificacion en matematicas y codigo: el modelo se define como "correcto significa comprobado" en estas areas.
- Neutralidad politica: no respalda candidatos ni partidos y no indica como votar.
- Capacidades multilingues: limitadas al ingles segun los metadatos disponibles.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito mas alla del razonamiento activado en las evaluaciones.

## Casos de uso

- Asistencia con busqueda obligatoria: el modelo esta entrenado para consultar herramientas antes de responder hechos verificables (81 % de busqueda con herramientas disponibles), por lo que encaja en pipelines RAG donde la precision factual prima sobre la latencia.
- Atencion al cliente con derivacion a humano: su alta tasa de abstencion (35 %) y su rechazo a adular permiten construir agentes que reconozcan los limites de su conocimiento y escalen en lugar de inventar respuestas.
- Verificacion de calculos y datos en flujos financieros o de ingenieria: corrige calculos erroneos presentados como hechos en 59 de 60 casos, lo que lo hace util como revisor en pipelines de validacion.
- Despliegue en estaciones de trabajo y servidores: el formato GGUF Q4_K_M evaluado oficialmente permite ejecutarlo con llama.cpp en hardware de gama alta sin GPU de centro de datos.
- Agentes multi-paso con herramientas: las 60 de 60 llamadas bien formadas y la ausencia de razonamiento sin finalizar en v8 lo hacen adecuado para orquestacion de agentes que encadenan busquedas y acciones.
- Moderacion y deteccion de afirmaciones falsas: su capacidad de contradecir al usuario cuando afirma algo incorrecto (aunque solo en 10 de 30 casos) sirve como capa de revision en sistemas de documentacion o soporte tecnico.
- Analisis de textos largos: 0 de 120 prompts largos con repeticiones o desbordamiento en v8, adecuado para resumen y extraccion sobre documentos extensos (la longitud de contexto concreta no esta disponible).

## Benchmarks y rendimiento

Resultados publicados en la model card, con el razonamiento activado, comparando v7, v8 en precision completa y el archivo Q4_K_M ejecutado con llama.cpp sobre las mismas peticiones:

| Medida | v7 | v8 | v8 Q4_K_M |
|---|---|---|---|
| Preguntas de hechos sin herramientas: respuesta erronea | 49 % (113) | 16 % (37) | 15 % (35) |
| Preguntas de hechos sin herramientas: respuesta correcta | 50 % (114) | 48 % (111) | 48 % (111) |
| Preguntas de hechos sin herramientas: dice que no sabe | 1 % (2) | 35 % (81) | 36 % (83) |
| Erroneas entre las respuestas dadas de memoria | 50 % | 25 % | 24 % |
| Con herramientas: busca en lugar de responder de memoria | 51 % (117) | 81 % (185) | 82 % (188) |
| Con herramientas: razonamiento sin finalizar | 34 % (79) | 0 | 0 |
| Con herramientas: respuesta erronea sin buscar | no contabilizado | 0 de 44 | 2 de 41 |
| Llamadas a herramientas bien formadas | 60 de 60 | 60 de 60 | 60 de 60 |
| Prompts largos: se repite / alcanza el limite | 7 / 18 de 120 | 0 / 0 de 120 | 1 / 0 de 120 |
| HarmBench: respuestas daninas, modelo solo | 1 de 300 | 0 de 300 | 2 de 300 |
| Corrige un calculo erroneo afirmado como hecho | no medido | 59 de 60 | 60 de 60 |
| Corrige un hecho erroneo ofrecido para confirmacion | no medido | 10 de 30 | 10 de 30 |
| Peticiones inofensivas rechazadas | no medido | 6 de 120 | 6 de 120 |
| Suites de sondas superadas | 172 de 199 | 168 de 199 | 165 de 199 |
| Media de tokens por respuesta | 477 | 263 | 257 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 37,5 GB y la model card evalua el archivo Q4_K_M, lo que situa la inferencia cuantizada en el orden de 15-17 GB de pesos mas overhead de contexto (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, el Q4_K_M es viable en GPUs consumer de gama alta (RTX 4090 con 24 GB) y en GPUs de centro de datos (A100, H100) para precision completa o mayor contexto.
- Cabe en GPU consumer: previsiblemente si, en cuantizacion Q4_K_M y superiores en GPUs con 24 GB o mas; la precision completa requiere hardware de mayor capacidad.
- Opciones de despliegue: llama.cpp (usado en la evaluacion oficial del Q4_K_M); el formato GGUF es compatible con otros runners habituales, aunque la informacion no confirma integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La media de 263 tokens por respuesta (257 en Q4_K_M) frente a 477 en v7 indica respuestas mas concisas en v8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Krummholz Atlantic 27B v8 | ~26,9 B | no disponible | Apache 2.0 | Ajuste de preferencias orientado a veracidad y abstencion; solo ingles; GGUF Q4_K_M evaluado |
| Qwen/Qwen3.8-27B (modelo base) | ~27 B (por el identificador) | no disponible | Apache 2.0 | Modelo base sin el ajuste constitucional de Krummholz; capacidades originales no detalladas en la informacion disponible |
| Alternativas de ~27 B con contexto largo | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sigue equivocandose de memoria: 16 % de respuestas erroneas en preguntas de hechos sin herramientas y un 25 % de errores entre las respuestas que da de memoria; el objetivo declarado de menos del 1 % no se ha alcanzado.
- La correccion de afirmaciones falsas es debil: solo corrige 10 de 30 hechos erroneos ofrecidos para confirmacion y cede en 3 casos.
- Las puntuaciones de sondas bajaron de 172 a 168 de 199 respecto a v7.
- El archivo Q4_K_M respondio a 2 peticiones daninas de HarmBench (publicaciones persuasivas sobre miel para bebes y lilies para gatos) que los pesos en precision completa rechazaron; con herramientas dio 2 respuestas erroneas sin buscar de 41. Q5_K_M no se midio.
- El conjunto de evaluacion es pequeno (229 preguntas), por lo que los porcentajes tienen varios puntos de incertidumbre.
- Solo soporta ingles segun los metadatos; no se documentan capacidades multilingues.
- La longitud de contexto no esta especificada, lo que dificulta planificar despliegues con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion; el modelo rechaza peticiones inofensivas en 6 de 120 casos, lo que puede afectar a la experiencia de usuario.
- Riesgo de alucinacion persistente cuando se usa sin herramientas; el propio autor recomienda usarlo con busqueda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krummholz-ai/atlantic-27b-v8-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
