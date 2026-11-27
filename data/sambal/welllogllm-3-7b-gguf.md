# sambal/WellLogLLM-3.7B-GGUF

## Resumen

WellLogLLM-3.7B-GGUF es la distribucion en formato GGUF del modelo WellLogLLM-3.7B, un modelo de lenguaje post-entrenado por el autor sambal a partir de la base K2-Horizon-3.7B y especializado en la interpretacion de registros de pozo (well logs) dentro del dominio de la petrofisica. Su proposito es responder preguntas y razonar sobre datos de subsuelo obtenidos en sondeos petroliferos, una tarea tradicionalmente reservada a especialistas con herramientas de software propietario.

La relevancia de esta publicacion es la cuantizacion: el repositorio ofrece cinco ficheros GGUF (BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) generados con llama.cpp, lo que permite ejecutar el modelo en equipos sin GPU o con GPU de consumo mediante Ollama o llama-server. El modelo declara 5.058.255.360 parametros reales (pese al "3.7B" del nombre) y un contexto de 65.536 tokens, dimensionado para ingerir documentacion y trazas completas dentro del harness PetroHarness.

El modelo esta pensado para operar dentro de PetroHarness, un entorno agentico que lee un pozo con la herramienta Petrophys y solicita al modelo la interpretacion de lo encontrado. Incluye un modo de razonamiento explicito delimitado por las etiquetas `<ifm|think>` y `</ifm|think>`, con un parametro `reasoning_effort` de tres niveles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base K2-Horizon-3.7B; no se detalla en la informacion proporcionada) |
| Parametros totales | 5.058.255.360 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (configuracion usada por PetroHarness y en los ejemplos de llama-server) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna en la informacion proporcionada. El modelo deriva de K2-Horizon-3.7B, del que no se documentan en esta ficha ni el tipo de transformer, ni si emplea Mixture of Experts, atencion lineal u otra variante. El proceso de post-entrenamiento se orienta a petrofisica y a la interpretacion de well logs, y el modelo ha sido entrenado para operar dentro del harness agentico PetroHarness.

Respecto a los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no hay informacion disponible. Lo que si se documenta es el proceso de cuantizacion: los ficheros GGUF se generaron a partir de la revision `a515e2a1` del modelo base en BF16, verificada mediante SHA-256, usando `convert_hf_to_gguf.py` de llama.cpp (commit `15fcfc7`) y posteriormente `llama-quantize`, sin importance matrix. Los pesos no se modificaron de otro modo. La model card incluye una evaluacion de fidelidad de cada cuantizacion frente al BF16 sobre 57.344 tokens de la documentacion de PetroHarness, con `llama-perplexity --kl-divergence` en fragmentos de 2.048 tokens.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" explicito entre `<ifm|think>` y `</ifm|think>`.
- Control del esfuerzo de razonamiento mediante el parametro `reasoning_effort` del chat template, con valores `high` (por defecto), `medium` y `low`.
- Interpretacion de registros de pozo (well logs) en el dominio de la petrofisica.
- Integracion como motor de razonamiento dentro de un harness agentico (PetroHarness) que lee datos de pozo con la herramienta Petrophys y consulta al modelo.
- Conversacion multi-turno (tag `conversational`) con contexto de hasta 65.536 tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Interpretacion de registros de pozo en exploracion petrolifera: el modelo se ejecuta dentro de PetroHarness, que lee el pozo con Petrophys y le pide al modelo interpretar las lecturas; su post-entrenamiento en petrofisica lo hace adecuado para esta tarea frente a un modelo generalista.
- Despliegue en portatiles o estaciones de trabajo sin GPU: con los ficheros Q4_K_M (3,16 GB) o Q5_K_M (3,64 GB) puede ejecutarse mediante Ollama o llama.cpp en hardware de consumo, segun indica la model card.
- Analisis de documentacion tecnica extensa: con 65.536 tokens de contexto puede ingerir manuales, informes de pozo o documentacion de PetroHarness y responder preguntas sobre ellos.
- Asistencia a petrofisicos en la revision de interpretaciones: el modo de razonamiento con `reasoning_effort` permite alternar entre respuestas rapidas (`low`) y analisis detallados (`high`) segun la fase del trabajo.
- Prototipado de flujos agenticos en geociencias: el modelo puede actuar como motor de decision en pipelines que combinan herramientas de lectura de datos con razonamiento multi-paso, siguiendo el patron de PetroHarness.
- Educacion y formacion en petrofisica: sirve como asistente para explicar conceptos de interpretacion de well logs en entornos con recursos limitados, al no requerir GPU dedicada.
- Evaluacion de cuantizaciones en produccion: los datos de divergencia KL publicados permiten elegir el fichero adecuado segun el equilibrio entre calidad y memoria disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo incluye la fidelidad de las cuantizaciones frente al BF16:

| Fichero | Cuantizacion | Tamano | Divergencia KL media vs BF16 | Mismo token top que BF16 |
|---|---|---|---|---|
| `WellLogLLM-3.7B-Q8_0.gguf` | Q8_0 (por defecto) | 5,39 GB | 0,0045 | 97,1% |
| `WellLogLLM-3.7B-Q6_K.gguf` | Q6_K | 4,16 GB | 0,0150 | 94,3% |
| `WellLogLLM-3.7B-Q5_K_M.gguf` | Q5_K_M | 3,64 GB | 0,0359 | 91,5% |
| `WellLogLLM-3.7B-Q4_K_M.gguf` | Q4_K_M | 3,16 GB | 0,1008 | 85,3% |
| `WellLogLLM-3.7B-BF16.gguf` | BF16 | 10,13 GB | 0 | 100% |

Medicion sobre 57.344 tokens de la documentacion de PetroHarness con `llama-perplexity --kl-divergence` en fragmentos de 2.048 tokens.

## Requisitos de hardware

- VRAM/modelo en memoria: entre 3,16 GB (Q4_K_M) y 10,13 GB (BF16). Q8_0, el valor por defecto, ocupa 5,39 GB.
- Memoria adicional de cache de contexto: 147.456 bytes por token, es decir, aproximadamente 9,7 GB a 65.536 tokens, que se suman al tamano del modelo.
- Cabe en GPU de consumo: si. Con Q4_K_M o Q5_K_M en una GPU de 8 GB o mas; Q8_0 requiere aproximadamente 15 GB en total si se usa el contexto completo, por lo que conviene una GPU de 16 GB o mas, o bien reducir el contexto.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por requisitos de memoria, una RTX 4090 (24 GB) o A100/H100 permiten ejecutar Q8_0 o BF16 con contexto completo.
- Despliegue: Ollama (version 0.40.4 o superior) y llama.cpp (`llama-server`), ambos documentados en la model card. Tambien es compatible con endpoints (`endpoints_compatible` en los tags).
- Parametros de muestreo recomendados por el autor: temperatura 1.0 y top-p 0.95.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de modelos comparables de petrofisica en la informacion proporcionada. Como referencia de la misma familia, el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| WellLogLLM-3.7B-GGUF | 5.058.255.360 | 65.536 | GGUF | Apache 2.0 |
| WellLogLLM-3.7B (base) | 5.058.255.360 | no disponible | safetensors (BF16) | Apache 2.0 |
| K2-Horizon-3.7B (origen) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento, por lo que no puede evaluarse su cobertura ni sus sesgos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en un dominio tecnico como la petrofisica, las respuestas deben validarse por un especialista antes de usarse en decisiones operativas.
- Idiomas soportados no declarados: no puede confirmarse el rendimiento en castellano ni en idiomas distintos del que se uso en el post-entrenamiento.
- La ventana de contexto de 65.536 tokens tiene un coste de memoria elevado (unos 9,7 GB adicionales de cache), lo que limita el contexto completo en GPU de consumo.
- El modelo esta disenado para operar dentro de PetroHarness; su rendimiento fuera de ese harness no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base K2-Horizon-3.7B, cuyos terminos no se detallan en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion externa practicamente nula.
- Las cuantizaciones Q4_K_M y Q5_K_M presentan divergencias KL de 0,1008 y 0,0359 respectivamente; para tareas sensibles conviene Q8_0 o BF16.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/sambal/WellLogLLM-3.7B-GGUF
- Modelo base: https://huggingface.co/sambal/WellLogLLM-3.7B
- PetroHarness: https://welllogbench.com/petroharness/
- Documentacion de instalacion de PetroHarness: https://welllogbench.com/petroharness/docs/install.html
- Ollama: https://ollama.com/download
- llama.cpp: no disponible en la informacion proporcionada (referencias internas: `convert_hf_to_gguf.py`, `llama-quantize`, `llama-perplexity`, commit `15fcfc7`)
