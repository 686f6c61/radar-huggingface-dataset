# ryugyosoft/granite-4.2-8b-onw

## Resumen

Granite-4.2-8b-onw es una conversion del modelo dense de razonamiento ibm-granite/granite-4.2-8b de IBM, adaptada por el usuario ryugyosoft para el motor onw ("俺のNPUがこんなに動くわけない"), un runtime que ejecuta modelos de lenguaje exclusivamente sobre la NPU integrada de los procesadores Intel Core Ultra. No es un fine-tune: los pesos originales se re-cuantizan y re-empaquetan en un grafo estatico optimizado para NPU, sin entrenamiento adicional. El repositorio contiene unicamente los pesos y metadatos del modelo; el motor onw se descarga aparte.

El modelo base pertenece a la generacion Granite 4.2 de IBM, una familia dense de razonamiento disponible en tamanos de 3B, 8B y 30B, con modo de pensamiento conmutable, contexto de 128K y capacitacion en agentes mediante RL que incluye hasta 200 llamadas de herramientas (correccion de codigo, operaciones de terminal, busqueda web). Esta version de 8B es la orientada a precision dentro de la familia. La conversion prioriza que el modelo quepa y funcione en un PC de consumo con NPU Intel, a cambio de una velocidad de generacion modesta (unos 3,6 tokens por segundo) y una huella de memoria de trabajo de aproximadamente 13 GB en una NPU 3720.

La relevancia de esta ficha es doble: documenta un ejemplo poco habitual de despliegue de un LLM de 8B sin GPU discreta, usando exclusivamente aceleracion NPU, y sirve como referencia practica de las particularidades de cuantizar Granite (que se degrada mas que otros modelos con INT4 convencional de grupo 128) y de integrar un modelo de razonamiento con tool calling en un runtime no estandar. La licencia Apache 2.0 se mantiene respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense tipo Llama (40 capas), grafo estatico segmentado para NPU |
| Parametros totales | 8B (heredados del modelo base) |
| Parametros activos | No aplica (modelo dense, no MoE) |
| Longitud de contexto | 128K (modelo base) |
| Tipos de cuantizacion | INT4 con signo (positivo max/7, negativo min/8, grupo 128) en la mayoria de pesos; INT8 grupo 128 en q/k/v de atencion; INT8 independiente en la capa de salida; embeddings INT4 referenciados en host |
| Idiomas soportados | Japones (ja) e ingles (en) declarados; el modelo base Granite 4.2 es multilingue pero con metricas inferiores al ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato onw (archivos `seg*_S1.xml`/`seg*_S16.xml` + `seg*.bin` y `shared.bin`), no compatible con safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer dense de 8B con 40 capas, estructura convencional tipo Llama y una ventana de contexto de 128K tokens. IBM lo entrena como modelo de razonamiento con modo de pensamiento conmutable (chain-of-thought integrado) y tool calling aumentado con razonamiento: el modelo justifica que herramienta va a invocar antes de hacerlo. La familia Granite 4.2 incorpora ademas un ciclo de aprendizaje por refuerzo orientado a agentes que cubre hasta 200 llamadas de herramientas encadenadas, con tareas de correccion de codigo, manejo de terminal y busqueda web. Sobre el modelo base se ha aplicado un post-entrenamiento con preferencias y datos de razonamiento, aunque este repositorio concreto no ha realizado ningun entrenamiento adicional.

La aportacion tecnica de esta conversion esta en la cuantizacion y en el particionado del grafo. El autor detecto que Granite degrada mas que otros modelos con INT4 convencional de grupo 128, por lo que emplea un esquema INT4 con signo: la escala se calcula dividiendo el maximo positivo entre 7 y el minimo negativo entre 8, lo que preserva mejor los valores sesgados hacia un lado sin alterar el orden de datos ni la velocidad respecto a INT4 estandar. Las proyecciones q/k/v de atencion se mantienen en INT8 grupo 128 con una perdida de velocidad pequena, y la capa de salida se ejecuta como un segmento INT8 independiente, rehaciendo las filas cuya escala caia en el rango subnormal de FP16 (que la NPU interpreta como cero). El grafo estatico divide las 40 capas en 5 segmentos de 8 capas mas un segmento de salida, e integra en el grafo los coeficientes propios de Granite (multiplicadores de embeddings, residuales, atencion y salida). En pruebas de calidad con decodificacion forzada sobre una respuesta de 400 tokens del modelo original en bf16 sobre CPU, esta version INT4/INT8 reproduce 359 de esos 400 tokens (frente a 353 con INT4 convencional), y en preguntas estandar la coincidencia llega hasta el final de la respuesta; en 20 preguntas en japones coincide el primer token en 17 de 20 casos.

## Capacidades

- Generacion de texto conversacional en japones e ingles.
- Razonamiento con cadena de pensamiento conmutable: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}` y el contenido del razonamiento se devuelve en el campo `reasoning_content`.
- Tool calling con el esquema de definicion de funciones de OpenAI, incluida la invocacion de herramientas en paralelo.
- Razonamiento aumentado con herramientas: el modelo decide que herramienta usar y por que antes de llamarla.
- Capacidades de agente en varios pasos: el modelo base fue entrenado con cadenas de hasta 200 llamadas de herramientas.
- Generacion de codigo y tareas de ingenieria de software, segun los resultados del modelo base en SWE-bench Verified.
- Funcionamiento como servidor con API compatible con OpenAI en `http://localhost:8000/v1`.
- No incluye vision, audio ni capacidades multimodales.

## Casos de uso

- Asistente de programacion en local sobre un portatil con Intel Core Ultra: el modelo puede usarse como copiloto de codigo en el editor mediante la API compatible con OpenAI, sin GPU discreta y con los datos sin salir del equipo, lo que resulta util en entornos con requisitos de privacidad o sin conectividad.
- Automatizacion de tareas de terminal y correccion de codigo: gracias al entrenamiento del modelo base en agentes que operan sobre terminal y reparan codigo, encaja en flujos donde el modelo diagnostica un fallo, propone un parche y lo verifica.
- Agente de busqueda web con tool calling: el modelo puede encadenar llamadas a una herramienta de busqueda y razonar sobre los resultados, con soporte de llamadas en paralelo, integrable en pipelines de investigacion automatizada.
- Atencion al cliente en japones: al ser un idioma oficialmente soportado y funcionar de forma local, puede gestionar conversaciones multi-turno dentro de la ventana de 128K del modelo base, aunque el propio autor advierte de posibles errores de kanji e incoherencias en japones.
- Procesamiento por lotes de documentos largos: la ventana de 128K permite resumir, clasificar o extraer informacion de documentos extensos en equipos sin GPU, con la limitacion de throughput propia de la NPU.
- Desarrollo y pruebas de aplicaciones basadas en NPU: sirve como modelo de referencia para validar pipelines de inferencia sobre NPU Intel y para medir el impacto de la cuantizacion INT4 con signo frente a INT4 estandar.
- Sustitucion de servicios en la nube en entornos de bajos recursos: equipos con 32 GB de memoria y NPU compatible pueden ejecutar razonamiento y tool calling local sin coste de API, adecuado para prototipado y uso personal.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles son los del modelo base citados en la model card del autor, no mediciones independientes de esta conversion cuantizada. Se presentan tal cual:

| Benchmark | Resultado (modelo base granite-4.2-8b) |
|---|---|
| SWE-bench Verified | 47,7 |
| τ³-bench | 66,3 |
| BFCL v4 | 52,4 |
| MMLU-Pro | 74,0 |

Metricas de rendimiento medidas por el autor en la conversion sobre una NPU 3720 (Core Ultra 9 285HX):

| Metrica | Valor |
|---|---|
| Velocidad de generacion | 3,6 tok/s (aproximadamente 3,9 en modo chat) |
| Procesamiento de prompt (pregunta corta) | menos de 1 segundo |
| Tamano de descarga | 5,0 GB |
| Memoria de trabajo tras la carga | aproximadamente 13 GB en NPU 3720 |
| Primera puesta en marcha (compilacion para NPU) | aproximadamente 20 minutos |
| Arranques posteriores | aproximadamente 20 segundos |
| Coincidencia de tokens con el modelo original en bf16/CPU | 359 de 400 tokens con decodificacion forzada |

No se han publicado resultados de benchmarks independientes sobre esta conversion en la informacion disponible.

## Requisitos de hardware

- Requiere una NPU Intel integrada en un procesador Intel Core Ultra. Series compatibles: serie 1 y 2 (Meteor Lake, Arrow Lake, Lunar Lake) y serie 3 (Panther Lake). Sistemas operativos soportados: Windows 11 o Ubuntu 22.04 o superior.
- El autor recomienda un PC con 32 GB de memoria o mas; la memoria de trabajo tras la carga fue de aproximadamente 13 GB en la NPU de prueba (NPU 3720).
- No esta pensado para GPU discreta: el runtime onw ejecuta el modelo en la NPU, y no se documenta despliegue sobre CUDA, ROCm ni Metal.
- Despliegue mediante el motor onw, instalable con un comando en PowerShell o mediante `curl` en Ubuntu, y operable desde la interfaz grafica de onw o con `onw serve <carpeta>`. Expone una API compatible con OpenAI en `http://localhost:8000/v1`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es propio de onw y no es safetensors ni GGUF.
- Latencia y throughput: generacion de 3,6 tok/s, procesamiento de prompts cortos por debajo de 1 segundo. La primera compilacion para NPU tarda unos 20 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato y plataforma |
|---|---|---|---|---|---|
| granite-4.2-8b-onw | 8B dense | 128K | 359/400 tokens coincidentes con el original; SWE-bench Verified 47,7 en el base | Apache 2.0 | Formato onw, exclusivo para NPU Intel |
| ibm-granite/granite-4.2-8b (base) | 8B dense | 128K | SWE-bench Verified 47,67, τ³-bench 66,3, BFCL v4 52,4, MMLU-Pro 74,0 | Apache 2.0 | safetensors (bf16), CPU/GPU |
| llm-jp-4.1-8b-thinking-onw | 8B | no disponible | no disponible | no disponible | Formato onw, NPU Intel; recomendado por el autor para uso centrado en japones |

No se dispone de datos de benchmarks medidos sobre la conversion onw frente a otras alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: los pesos son una re-cuantizacion a INT4/INT8 del modelo base, por lo que hereda tanto sus capacidades como sus sesgos y su tendencia a la alucinacion.
- La cuantizacion introduce degradacion respecto a bf16: 41 de cada 400 tokens no coinciden en la prueba de decodificacion forzada del autor, y en japones solo coincidio el primer token en 17 de 20 preguntas.
- El rendimiento en japones es notablemente inferior al del ingles. El propio autor advierte de errores de kanji y contenido poco natural, y recomienda llm-jp-4.1-8b-thinking-onw para uso centrado en japones.
- El modelo base no piensa por defecto: si se espera razonamiento explicito hay que activar el modo pensamiento explicitamente, y en ese modo consume muchos tokens, por lo que conviene fijar `max_tokens` en 2000 o mas al usar herramientas.
- La configuracion recomendada por la model card original es temperature 1.0 y top_p 0.95, mientras que el motor onw usa generacion voraz por defecto; esto puede afectar a la calidad y diversidad de las respuestas si no se ajusta.
- Velocidad muy baja para uso interactivo intensivo: 3,6 tok/s limita su uso a tareas asincronas, agentes y procesamiento por lotes mas que a conversacion en tiempo real.
- Dependencia fuerte de hardware propietario: solo funciona en NPUs Intel Core Ultra y no puede migrarse a GPU sin volver al modelo base en otro formato.
- La primera carga requiere una compilacion de aproximadamente 20 minutos, lo que complica despliegues automatizados o contenedores efimeros.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una conversion no oficial de un modelo de IBM, conviene verificar la procedencia y la integridad de los pesos antes de usarla en produccion.
- El repositorio registra cero descargas y cero interacciones en el momento de redactar esta ficha, por lo que no existe validacion externa de su calidad ni de su reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryugyosoft/granite-4.2-8b-onw
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Motor onw: https://huggingface.co/ryugyosoft/onw
- Documentacion tecnica de onw: https://huggingface.co/ryugyosoft/onw/blob/main/TECHNICAL.md
- Alternativa centrada en japones con el mismo motor: https://huggingface.co/ryugyosoft/llm-jp-4.1-8b-thinking-onw
- Coleccion Granite 4.2 Language Models de IBM: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentacion de Granite 4.2 en IBM: https://www.ibm.com/granite/docs/models/granite4-2
- Pagina general de IBM Granite: https://www.ibm.com/granite
- Analisis de Granite 4.2 8B en AI/TLDR: https://ai-tldr.dev/models/granite-4-2-8b/
