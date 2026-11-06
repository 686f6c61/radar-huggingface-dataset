# Lernex/Metis-1.6-Praxis-GGUF

## Resumen

Metis-1.6-Praxis-GGUF es la distribucion en formato GGUF del modelo base Lernex/Metis-1.6-Praxis, un modelo de generacion de texto de aproximadamente 2.940 millones de parametros (2,94 B) desarrollado por Lernex. El repositorio contiene unicamente los pesos cuantizados y la matriz de importancia necesaria para generar nuevas cuantizaciones, no el modelo original en safetensors. La relevancia de esta publicacion no esta en el modelo en si, sino en el trabajo de cuantizacion: el autor documenta que una cuantizacion estandar Q4_K_M degrada este modelo mucho mas de lo habitual (18 % mas de perplejidad y solo 72 % de coincidencia en el token superior) y propone una receta por tensor que recupera buena parte de esa perdida.

La arquitectura combina, segun las etiquetas y la propia model card, componentes de mezcla de expertos (mixture-of-experts) y capas Mamba-2 junto con proyecciones de atencion, lo que explica que ciertas partes de la red (proyecciones de salida de Mamba y proyecciones latentes de los expertos) sean especialmente sensibles al redondeo. El resultado es un conjunto de ficheros que van desde 1,8 GB (IQ4_XS) hasta 5,9 GB (BF16), pensados para ejecutarse en llama.cpp, Ollama y LM Studio, con soporte de modo de razonamiento y de llamadas a herramientas a traves de la API compatible con OpenAI.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y esta orientado a generacion de texto conversacional con capacidad de razonamiento explicito. La informacion disponible no incluye detalles sobre el dataset de entrenamiento, el numero de tokens vistos ni resultados de benchmarks estandar, por lo que esta ficha se limita a lo documentado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida con componentes mixture-of-experts y Mamba-2 (segun etiquetas del autor; no se detalla la proporcion exacta) |
| Parametros totales | 2.943.141.641 (2,94 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecucion con `-c 32768`; no se confirma como maximo oficial) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS; matriz de importancia incluida para generar otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

La model card describe una arquitectura poco convencional para su tamano: mezcla de expertos con 128 expertos enrutados (que constituyen la mayor parte del fichero) y capas Mamba-2 con proyecciones de entrada y salida, ademas de proyecciones de baja dimension (latentes) hacia y desde el espacio de los expertos. El autor no detalla el numero de capas, la dimension del modelo ni la cabeza de atencion, ni tampoco si existe atencion clasica combinada con las capas de estado. Tampoco se documenta el proceso de entrenamiento: no hay informacion sobre volumen de tokens, composicion del corpus, fases de preentrenamiento, ajuste supervisado, RLHF o DPO.

La innovacion tecnica documentada no esta en el entrenamiento sino en la cuantizacion. El autor senala que mantener unicamente las proyecciones de salida de Mamba en BF16 reduce la divergencia KL de Q4_K_M de 0,290 a 0,106, y que los 128 expertos enrutados cuantizan con normalidad. A partir de ahi define una receta por tensor: BF16 para `ssm_out`, Q8_0 para `ffn_latent_down` y `ffn_latent_up`, y Q6_K o Q8_0 para `ssm_in` en los ficheros de 4 a 6 bits. La matriz de importancia se calculo sobre 125.000 tokens representativos de uso real (prosa, matematicas resueltas en modo razonamiento, codigo y llamadas a herramientas), renderizados con la plantilla de chat del modelo.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia incluida en los ficheros GGUF.
- Modo de razonamiento (thinking) activado por defecto; el contenido de pensamiento se devuelve en el campo `reasoning_content` de la API compatible con OpenAI y como `thinking` en Ollama.
- Desactivacion del razonamiento por peticion mediante `"chat_template_kwargs": {"enable_thinking": false}`, para respuestas directas.
- Llamadas a herramientas (tool calling): el endpoint compatible con OpenAI parsea las llamadas a `tool_calls` cuando se usa `--jinja`. En Ollama, hasta que exista un parser para el formato del modelo, las llamadas llegan como texto.
- Capacidad de resolver matematicas y codigo dentro del modo de razonamiento, segun los datos usados para construir la matriz de importancia.
- Compatibilidad con `endpoints_compatible` (etiqueta del repositorio), lo que facilita su despliegue tras una API estilo OpenAI.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Asistente conversacional autoalojado: con 2 GB en Q4_K_M cabe en practicamente cualquier maquina y permite desplegar un chatbot con modo de razonamiento y contexto de 32.768 tokens en local, sin dependencia de servicios externos.
- Razonamiento matematico asistido: el modo thinking permite al modelo desarrollar pasos intermedios antes de responder; util para tutoria o verificacion de calculos, ajustando temperatura a 0,8 y top-p 0,95 segun recomienda el autor.
- Generacion de codigo en modo razonamiento: el autor recomienda temperatura 1,0 sin penalizacion de repeticion para este caso, lo que sugiere un uso previsto en tareas de programacion con explicacion del razonamiento.
- Agentes con llamadas a herramientas: al devolver `tool_calls` estructuradas a traves de llama-server con `--jinja`, puede integrarse en flujos de agente que consulten APIs o ejecuten funciones, con el matiz de que en Ollama esa estructura aun no esta disponible.
- Despliegue en hardware de consumo: con 250 tokens/s de decodificacion en una RTX 5070 Ti con Q4_K_M, es viable para prototipado rapido y demos interactivas en estaciones de trabajo con GPU de gama media.
- Generacion de nuevas cuantizaciones: la inclusion de `Metis-1.6-Praxis-imatrix.gguf` y la receta `llama-quantize` documentada permiten a terceros producir variantes propias (por ejemplo, Q3 o IQ2) manteniendo las proyecciones sensibles en mayor precision.
- Procesamiento por lotes en CPU: al ser un modelo de menos de 3 B en 2 GB, puede ejecutarse en servidores sin GPU para tareas de clasificacion, resumen o extraccion con throughput moderado.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de calidad de cuantizacion medidas con `llama-perplexity` sobre wikitext-2 (contexto de 512 tokens, 40 fragmentos) contra el fichero BF16:

| Fichero | Tamano | Perplejidad | Divergencia KL | Coincidencia token superior |
|---|---|---|---|---|
| BF16 | 5,9 GB | 24,121 | referencia | referencia |
| Q8_0 | 3,2 GB | 24,105 | 0,0071 | 95,3 % |
| Q6_K | 2,6 GB | 24,093 | 0,0106 | 93,9 % |
| Q5_K_M | 2,3 GB | 24,349 | 0,0171 | 92,6 % |
| Q4_K_M | 2,0 GB | 24,568 | 0,0367 | 88,7 % |
| IQ4_XS | 1,8 GB | 24,554 | 0,0474 | 87,4 % |

El autor indica ademas que un Q4_K_M estandar (sin receta por tensor) presenta un 18 % mas de perplejidad que BF16 y solo un 72 % de coincidencia en el token superior, frente al 88,7 % del Q4_K_M de este repositorio.

En cuanto a velocidad, en una RTX 5070 Ti con el modelo completo en GPU, Q4_K_M decodifica a unos 250 tokens/s y procesa prompts a unos 4.000 tokens/s. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 2,0-2,5 GB para Q4_K_M, 1,8-2,2 GB para IQ4_XS, 2,6-3,0 GB para Q6_K, 3,2-3,6 GB para Q8_0 y 5,9-6,5 GB para BF16, incluyendo margen para el contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas puede ejecutar BF16; con 4 GB basta para Q4_K_M. El autor cita una RTX 5070 Ti como referencia con el modelo completo en GPU.
- GPU de consumo: si, en practicamente todas las RTX y en muchas GPUs integradas o de portatil, dado el reducido tamano de los ficheros cuantizados.
- CPU: los ficheros estan pensados para ejecutarse tambien en CPU mediante llama.cpp, aunque sin datos de throughput en ese escenario.
- Opciones de despliegue: llama.cpp (version b12089 o superior, requisito explicito), llama-server con `--jinja`, Ollama (con la version de llama.cpp incluida actualizada) y LM Studio. Compatible con endpoints estilo OpenAI.
- Latencia y throughput: 250 tokens/s de decodificacion y 4.000 tokens/s de lectura de prompt en RTX 5070 Ti con Q4_K_M; no hay datos para otras GPUs ni para CPU.
- Ajustes de muestreo recomendados incluidos en los ficheros: temperatura 0,8, top-p 0,95, top-k 20 y penalizacion de repeticion 1,05 sobre todo el contexto. Para respuestas directas, temperatura 0,3 y penalizacion 1,0. Si se fija penalizacion manualmente, pasar `--repeat-last-n 131072` para cubrir todo el contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de capacidad que permitan una comparacion rigurosa con otros modelos de tamano similar (por ejemplo, Qwen2.5-3B, Llama-3.2-3B o Gemma-2-2B). La comparacion se limita a caracteristicas objetivas documentadas:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Metis-1.6-Praxis | 2,94 B | 32.768 (segun ejemplo) | Apache 2.0 | Si, con receta por tensor | Arquitectura MoE + Mamba-2; modo thinking |
| Qwen2.5-3B | 3,09 B | 32.768 | Apache 2.0 (variantes) | Si | Transformer denso; sin datos comparativos aqui |
| Llama-3.2-3B | 3,21 B | 131.072 | Llama 3.2 Community | Si | Transformer denso; licencia con restricciones |
| Gemma-2-2B | 2,61 B | 8.192 | Gemma Terms | Si | Transformer denso; contexto menor |

Los datos de los modelos alternativos se incluyen solo como referencia de categoria; no se han verificado en esta busqueda y no deben tomarse como comparacion de rendimiento.

## Limitaciones y advertencias

- No hay resultados de benchmarks de capacidad publicados: no es posible evaluar su calidad en MMLU, HumanEval, GSM8K u otras tareas frente a alternativas.
- No se documenta el dataset de entrenamiento ni el proceso de alineacion, por lo que se desconocen sesgos conocidos y el riesgo real de alucinacion.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado fuera del ingles (la matriz de importancia se construyo con textos en ingles, a juzgar por el uso de wikitext-2 y la descripcion).
- El contexto de 32.768 tokens aparece solo en el ejemplo de ejecucion; no se confirma como maximo oficial del modelo base.
- En Ollama, las llamadas a herramientas llegan como texto hasta que exista un parser para el formato del modelo; para uso en agentes es preferible llama-server con `--jinja`.
- Requiere llama.cpp b12089 o superior; versiones anteriores no cargaran los ficheros correctamente.
- La penalizacion de repeticion por defecto de llama.cpp solo mira los ultimos 64 tokens; si se configura manualmente hay que ampliar `--repeat-last-n` a 131072 para respetar la recomendacion del autor.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se aplica al modelo base; conviene verificar la model card original por si hubiera condiciones adicionales no reflejadas aqui.
- El repositorio contiene solo pesos GGUF y la matriz de importancia; para fine-tuning o conversion a otros formatos hay que acudir al modelo base Lernex/Metis-1.6-Praxis.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lernex/Metis-1.6-Praxis-GGUF
- Modelo base: https://huggingface.co/Lernex/Metis-1.6-Praxis
- README del repositorio: https://huggingface.co/Lernex/Metis-1.6-Praxis-GGUF/blob/main/README.md
- llama.cpp (releases): https://github.com/ggml-org/llama.cpp/releases
- Guia de compilacion de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
