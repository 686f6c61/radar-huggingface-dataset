# sambal/WellLogLLM-7B-GGUF

## Resumen

WellLogLLM-7B-GGUF es la version cuantizada en formato GGUF de WellLogLLM-7B, un modelo de lenguaje especializado en interpretacion de registros de pozo (well logs) para petrofisica, desarrollado por el usuario sambal y derivado del modelo base K2-Horizon-7B. El modelo resuelve un problema muy concreto: interpretar automaticamente los datos de perfilaje de pozos petroliferos (curvas de resistividad, porosidad, densidad, etc.) y producir analisis petrofisicos que tradicionalmente requieren la intervencion de un especialista humano.

La relevancia de esta publicacion radica en que el autor ha empaquetado el modelo en multiples cuantizaciones GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M y BF16) con metricas de divergencia KL documentadas frente al original en BF16, lo que permite ejecutar el modelo en hardware de consumo, incluidos equipos sin GPU o con Apple Silicon. El modelo esta disenado para integrarse en PetroHarness, un entorno agentico que lee un pozo y solicita al modelo la interpretacion de lo encontrado.

El modelo cuenta con 8.999.178.240 parametros totales (aproximadamente 9.000 millones), un contexto de 65.536 tokens requerido por el harness, y un modo de razonamiento explicito ("thinking mode") configurable mediante el parametro `reasoning_effort`. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de K2-Horizon-7B); detalles de atencion no disponibles |
| Parametros totales | 8.999.178.240 (aprox. 9.000 millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (requerido por PetroHarness) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Se sabe que WellLogLLM-7B es un modelo "post-trained" (post-entrenado) a partir de K2-Horizon-7B, lo que sugiere un proceso de ajuste fino o entrenamiento adicional sobre un modelo base preexistente, orientado especificamente a la interpretacion de registros de pozo en el dominio de la petrofisica. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica mas destacable documentada es el modo de razonamiento explicito: el modelo "piensa antes de responder", generando su cadena de razonamiento entre los tokens especiales `<ifm|think>` y `</ifm|think>`. Este comportamiento es configurable mediante el parametro `reasoning_effort` en la plantilla de chat, con tres niveles: `high` (por defecto), `medium` y `low`. Las muestras deben realizarse con temperatura 1.0 y top-p 0.95. El proceso de cuantizacion se realizo con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (revision `15fcfc7`), sin matriz de importancia, y los pesos no se modificaron de otro modo.

## Capacidades

- Generacion de texto especializada en interpretacion de registros de pozo (well logs) y analisis petrofisico.
- Razonamiento explicito con modo "thinking" configurable (`reasoning_effort`: high, medium, low) entre tokens `<ifm|think>` y `</ifm|think>`.
- Integracion agentica con PetroHarness: el modelo esta entrenado para operar dentro de un harness que lee un pozo y le solicita la interpretacion.
- Capacidad conversacional multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Ejecucion local en Ollama y llama.cpp, con o sin GPU.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Interpretacion petrofisica automatizada de pozos: el modelo analiza las curvas de registro (resistividad, densidad, porosidad, gamma ray) proporcionadas por PetroHarness y genera una interpretacion textual de las formaciones atravesadas, aprovechando su entrenamiento especifico en el dominio.
- Asistencia a geologos e ingenieros de yacimientos: el modelo puede actuar como copiloto que propone interpretaciones preliminares de horizontes y zonas de interes, que el especialista revisa y valida, reduciendo el tiempo de analisis manual.
- Despliegue en campo sin infraestructura de GPU: gracias a las cuantizaciones Q4_K_M (5,59 GB) y Q5_K_M (6,47 GB), el modelo puede ejecutarse en portatiles de campo mediante Ollama o llama.cpp, permitiendo interpretaciones in situ sin conexion a servidores centrales.
- Procesamiento por lotes de historicos de pozos: con 65.536 tokens de contexto, el modelo puede manejar documentos extensos de registro y documentacion asociada en una sola pasada, facilitando la reinterpretacion masiva de pozos antiguos.
- Formacion y docencia en petrofisica: el modo de razonamiento explicito permite al modelo mostrar su cadena de razonamiento, lo que resulta util como herramienta didactica para explicar como se llega a una interpretacion petrofisica concreta.
- Integracion en pipelines de analisis con el harness agentico: el modelo puede conectarse a PetroHarness mediante su API y formar parte de flujos automatizados de evaluacion de formaciones, con el nivel de esfuerzo de razonamiento ajustable segun la criticidad del analisis.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Sin embargo, si se documentan metricas de fidelidad de cuantizacion frente al BF16, medidas con `llama-perplexity --kl-divergence` sobre 57.344 tokens de la documentacion de PetroHarness en fragmentos de 2.048 tokens:

| Archivo | Cuantizacion | Tamano | Divergencia KL media vs BF16 | Mismo token top que BF16 |
|---|---|---|---|---|
| `WellLogLLM-7B-Q8_0.gguf` | Q8_0 (por defecto) | 9,57 GB | 0,0061 | 97,4% |
| `WellLogLLM-7B-Q6_K.gguf` | Q6_K | 7,39 GB | 0,0235 | 94,5% |
| `WellLogLLM-7B-Q5_K_M.gguf` | Q5_K_M | 6,47 GB | 0,0416 | 92,2% |
| `WellLogLLM-7B-Q4_K_M.gguf` | Q4_K_M | 5,59 GB | 0,1032 | 87,0% |
| `WellLogLLM-7B-BF16.gguf` | BF16 (sin cuantizar) | 18,01 GB | 0 | 100% |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q4_K_M aproximadamente 5,6 GB de pesos; Q5_K_M aproximadamente 6,5 GB; Q6_K aproximadamente 7,4 GB; Q8_0 aproximadamente 9,6 GB; BF16 aproximadamente 18 GB. A ello hay que sumar la cache de contexto, que consume 147.456 bytes por token, es decir, unos 9,7 GB adicionales a 65.536 tokens.
- GPU recomendadas: no se especifican modelos concretos en la documentacion. Por tamano, una RTX 4090 (24 GB) puede alojar las cuantizaciones Q4_K_M a Q8_0 con contexto completo; una A100 o H100 ofrece margen holgado para BF16 y contextos largos.
- Cabe en GPU de consumo: si, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 8-12 GB si se reduce el contexto, dado el elevado coste de la cache KV. En Apple Silicon, Ollama y llama.cpp ejecutan el modelo en GPU mediante Metal.
- Opciones de despliegue: Ollama (version 0.40.4 o superior), llama.cpp (`llama-server`), y PetroHarness como harness agentico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo base declarado es K2-Horizon-7B, del que WellLogLLM-7B es un derivado post-entrenado, y existe una variante menor, WellLogLLM-3.7B, del mismo autor:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WellLogLLM-7B-GGUF | aprox. 9.000 M | 65.536 | Apache 2.0 | GGUF | Version cuantizada, orientada a Ollama/llama.cpp |
| WellLogLLM-3.7B-GGUF | no disponible | no disponible | no disponible | GGUF | Modelo menor, opcion por defecto en PetroHarness |
| K2-Horizon-7B | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva WellLogLLM |

No se han identificado en la informacion disponible otros modelos especializados en interpretacion de registros de pozo con los que establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la informacion proporcionada.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar interpretaciones petrofisicas plausibles pero incorrectas; en un dominio tecnico como la petrofisica, toda salida deberia ser validada por un especialista antes de tomar decisiones.
- Limitaciones de idioma: no se especifican los idiomas soportados; la model card esta redactada en ingles y no se confirma el soporte de castellano ni de otros idiomas.
- El contexto de 65.536 tokens impone un coste de memoria considerable (unos 9,7 GB adicionales de cache KV), lo que puede hacer inviable el contexto completo en GPUs de gama media o baja.
- El modelo esta disenado para operar dentro de PetroHarness; su comportamiento fuera de ese harness no esta documentado.
- Las cuantizaciones bajas (Q4_K_M, Q5_K_M) presentan una divergencia KL mayor y una tasa de coincidencia de token top del 87,0% y 92,2% respectivamente frente a BF16, lo que puede degradar la calidad en tareas sensibles.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base K2-Horizon-7B, cuyos terminos no se detallan en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion todavia muy limitada y escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sambal/WellLogLLM-7B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/sambal/WellLogLLM-7B
- Variante menor en Hugging Face: https://huggingface.co/sambal/WellLogLLM-3.7B-GGUF
- PetroHarness: https://welllogbench.com/petroharness/
- Documentacion de instalacion de PetroHarness: https://welllogbench.com/petroharness/docs/install.html
- Descarga de Ollama: https://ollama.com/download
