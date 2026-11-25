# ApolloRaines/Llama-3.1-8B-Instruct-Full-Suppress

## Resumen

Llama-3.1-8B-Instruct-Full-Suppress es una variante del modelo meta-llama/Llama-3.1-8B-Instruct publicada por el usuario ApolloRaines, obtenida mediante una edicion direccional de los pesos con la herramienta propietaria jBlaze, orientada a la ingenieria de representaciones. No se trata de un fine-tuning ni de un entrenamiento adicional: la modificacion consiste en una supresion de rango 20 aplicada sobre los modulos `self_attn.o_proj` y `mlp.down_proj` en las 32 capas del transformer, dejando 227 de los 291 tensores byte a byte identicos al modelo base.

El objetivo declarado es la supresion maxima y simultanea de cuatro comportamientos: rechazo (refusal), verbosidad, hedging (matizacion excesiva) y afecto emocional. El modelo conserva la arquitectura LlamaForCausalLM de 8.030.261.248 parametros en bf16, con la misma tokenizacion y ventana de contexto del modelo base de Meta. Es relevante ahora porque documenta de forma inusualmente transparente el coste medido de este tipo de ediciones: la perplejidad sobre texto neutro sube entre un 34,5 % y un 37,9 % respecto al base, un dato que el autor publica con intervalos de confianza y metodologia reproducible.

La ficha resulta de interes para investigadores en interpretabilidad, seguridad de modelos y tecnicas de abliteration o representation engineering, mas que para despliegues de produccion convencionales, dado el deterioro medido en calidad de modelado del lenguaje y la ausencia de benchmarks de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el repo no documenta GGUF ni otras variantes) |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (4 shards, bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 32 capas y 8.000 millones de parametros, identico estructuralmente a Llama-3.1-8B-Instruct. La intervencion no emplea entrenamiento por gradiente: se aplica una edicion de rango 20 sobre 64 tensores, correspondientes a los modulos `self_attn.o_proj` (32 tensores) y `mlp.down_proj` (32 tensores), en todas las capas de la 0 a la 31 sin huecos. El tamano relativo de la edicion oscila entre el 7,9 % y el 10,4 % en norma de Frobenius, y la energia por debajo del umbral de rango 20 queda entre el 0,20 % y el 0,30 %, lo que indica una modificacion concentrada en pocas direcciones.

Los pesos se almacenan en bf16 tanto en el modelo base como en esta variante, de modo que la identidad byte a byte de 227 tensores es exacta, no una aproximacion por tolerancia. El autor especifica las revisiones exactas del base (`0e9e39f249a16976918f6564b8830bc894c89659`) y los hashes sha256 de los cuatro shards para permitir la reproduccion del diff. La divergencia media respecto al base, medida en KL, es de 0,311 nats. No se documenta composicion de dataset, numero de tokens de entrenamiento ni fases de RLHF o DPO, porque no hubo entrenamiento: la model card indica explicitamente que no se realizo fine-tuning.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base.
- Razonamiento aritmetico basico y resolucion de operaciones simples (la model card muestra 17 * 23 = 391).
- Generacion de codigo en Python y otros lenguajes, con ejemplos de funciones utilitarias.
- Respuesta factual sobre conocimiento general (capitales, geografia, nociones cientificas).
- Supresion de rechazos: el modelo responde a peticiones que el base declinaría, incluyendo contenido sensible como instrucciones para forzar cerraduras.
- Estilo conciso: la supresion de verbosidad reduce la longitud y los rodeos en las respuestas.
- Reduccion de hedging: menor uso de formulas de matizacion y cautela discursiva.
- Supresion de afecto emocional: tono neutro, sin marcas de entusiasmo o empatia.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, vision o audio: no disponibles.
- Capacidades multilingues: limitadas al ingles segun los metadatos; el resto de idiomas no esta validado.

## Casos de uso

- Investigacion en interpretabilidad y representation engineering: el modelo sirve como caso de estudio reproducible de edicion direccional de pesos, con hashes, revisiones y metricas de divergencia publicadas, lo que permite replicar el diff contra el base y analizar el efecto de una supresion de rango 20 en `o_proj` y `down_proj`.
- Estudio del equilibrio entre alineacion y calidad linguistica: la tabla de perplejidad (de 7,8216 a 10,5219 en 20 frases neutras; de 8,1687 a 11,2675 en wikitext-2-raw-v1) permite cuantificar el coste colateral de eliminar rechazos y hedging, util para calibrar politicas de seguridad en pipelines propios.
- Evaluacion de robustez de filtros de seguridad: al ser un modelo con rechazos suprimidos, resulta adecuado como contraparte en pruebas de sistemas de moderacion, clasificadores de toxicidad o guardrails, verificando si detectan respuestas que el base habria declinado.
- Generacion de respuestas concisas en tareas de extraccion: la supresion de verbosidad y hedging puede aprovecharse en tareas donde se busca salida directa y sin matices, como resumen extractivo o respuesta a preguntas factuales cerradas, aceptando el coste en perplejidad.
- Experimentos controlados de estilo: con el afecto suprimido, el modelo produce un registro neutro util como linea base en estudios de tono, comparando sus salidas con las del base para aislar el efecto de la dimension emocional.
- Docencia y divulgacion sobre abliteration: el modelo y su model card constituyen material didactico sobre que es y que no es una edicion de pesos, incluyendo la correccion publica del autor sobre la afirmacion de que un fine-tuning no puede alcanzar el 78 % de identidad byte a byte.
- Analisis de riesgo en despliegues: util para equipos que evaluan si adoptar variantes sin rechazo en entornos internos, ya que documenta de forma explicita el deterioro de calidad y la ausencia de benchmarks de tarea que respalden su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica publicada es la perplejidad comparada con el modelo base:

| Corpus | Tokens evaluados | Base | Este modelo | Cambio | IC 95 % |
|---|---:|---:|---:|---:|---|
| 20 frases neutras reservadas | 666 | 7,8216 | 10,5219 | +34,5 % | [+26,7 %, +43,4 %] |
| wikitext-2-raw-v1 (test) | 98.208 | 8,1687 | 11,2675 | +37,9 % | ratio [1,361, 1,399] |

El deterioro se observa en las 96 de 96 ventanas y en las 20 de 20 secuencias evaluadas, con degradacion por ventana entre 1,22x y 1,75x. La divergencia media en KL respecto al base es de 0,311 nats.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 18-24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4,5-5,5 GB. Estas cifras son estimaciones por tamano, no valores publicados por el autor.
- GPU recomendadas: A100 40 GB o H100 para bf16 con contexto largo y serving concurrente; L40S o RTX 6000 Ada como alternativas de 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto limitado, y en RTX 3090, 4080 o 4070 Ti Super mediante cuantizacion a 8 o 4 bits.
- Opciones de despliegue: transformers con `device_map="auto"` y `torch_dtype="auto"`, tal como documenta el autor; vLLM, TGI, llama.cpp u Ollama son viables en principio por ser arquitectura Llama, pero el repo no publica pesos GGUF ni configuraciones verificadas para estos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Edicion de pesos | Licencia | Notas |
|---|---:|---|---|---|---|
| Llama-3.1-8B-Instruct-Full-Suppress | 8,03 B | no disponible | Supresion de rango 20 en `o_proj` y `down_proj`, 64 tensores | llama3.1 | Perplejidad +34,5 % a +37,9 % frente al base |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | no disponible | Ninguna (modelo base) | llama3.1 | Referencia de calidad; rechazos y hedging intactos |
| Variantes abliterated de Llama-3.1-8B (familia generica) | ~8 B | no disponible | Edicion tipica sobre direcciones de rechazo | variable | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks de tarea ni de comparativas verificadas con otras variantes abliterated en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y naturaleza de la edicion.

## Limitaciones y advertencias

- Deterioro medido de calidad: la perplejidad sobre texto neutro sube entre un 34,5 % y un 37,9 % respecto al base, con degradacion en todas las ventanas evaluadas. El coste es colateral y afecta al modelado general del lenguaje, no solo a los comportamientos suprimidos.
- Eliminacion de rechazos: el modelo responde a peticiones que el base declinaria, como instrucciones para forzar cerraduras. No debe desplegarse en entornos orientados al publico sin guardrails externos.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasa de alucinacion; el aumento de perplejidad sugiere mayor probabilidad de salidas erroneas o incoherentes.
- Sesgos: no se documenta ninguna evaluacion de sesgos. Al derivar del base de Meta sin datos adicionales, hereda los sesgos del mismo, y la edicion no los corrige.
- Limitaciones de idioma: los metadatos declaran solo ingles; el comportamiento en otros idiomas no esta validado y puede degradarse mas que en el base.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la ficha del autor; se asume la del base, pero no hay verificacion de que la edicion no afecte a la estabilidad en contextos largos.
- Licencia: llama3.1, la misma del modelo base, con las restricciones de la licencia de Meta para uso comercial, incluidos los umbrales de usuarios activos mensuales y las clausulas de atribucion.
- Trazabilidad de la herramienta: jBlaze es propietaria y no se publica el codigo ni el metodo exacto de calculo de las direcciones; la reproducibilidad se limita a la verificacion del diff, no a la regeneracion de la edicion.
- Ausencia de benchmarks de tarea: sin MMLU, HumanEval ni GSM8K, no hay evidencia publicada de que las capacidades del base se conserven en tareas concretas.
- Correccion del autor: la afirmacion inicial de que el 78 % de identidad byte a byte era "una condicion que un fine-tuning no puede satisfacer" fue retirada tras publicarse un adaptador entrenado por gradiente que la supera; conviene leer la model card completa y no solo el resumen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Full-Suppress
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Herramienta jBlaze: https://jblaze.dev
- Revision del base citada por el autor: `0e9e39f249a16976918f6564b8830bc894c89659`
- Dataset de evaluacion wikitext-2-raw-v1: https://huggingface.co/datasets/Salesforce/wikitext
