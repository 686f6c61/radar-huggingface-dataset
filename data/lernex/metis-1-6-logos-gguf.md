# Lernex/Metis-1.6-Logos-GGUF

## Resumen

Metis-1.6-Logos-GGUF es la distribucion cuantizada en formato GGUF del modelo base Lernex/Metis-1.6-Logos, publicada por el mismo autor (Lernex) bajo licencia Apache 2.0. El modelo base combina una arquitectura hibrida de mezcla de expertos (MoE) con capas Mamba-2 y proyecciones de bajo rango en el espacio latente de los expertos, segun se deduce de las recetas de cuantizacion documentadas. El repositorio contiene unicamente pesos cuantizados para llama.cpp y aplicaciones derivadas (Ollama, LM Studio), no los pesos originales en safetensors.

El interes tecnico principal no esta en el modelo en si, sino en la metodologia de cuantizacion: un Q4_K_M estandar degrada este modelo mucho mas de lo habitual (39% mas de perplejidad que BF16 y solo 66% de coincidencia en el token superior), por lo que el autor aplica una receta por tensor que mantiene en mayor precision las partes sensibles (proyecciones de salida de Mamba-2 y proyecciones latentes de los expertos), que suman menos del 9% de los pesos. El resultado declarado es que Q4_K_M se mantiene dentro del 1% de perplejidad respecto a BF16.

El modelo tiene 10.225.187.963 parametros totales y el repositorio ocupa 61,1 GB, lo que refleja la presencia de multiples cuantizaciones (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS) mas la matriz de importancia. Esta pensado para despliegue local en CPU, Apple Metal y NVIDIA CUDA mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: mezcla de expertos (MoE) con capas Mamba-2 y proyecciones latentes de bajo rango (segun la receta de cuantizacion del autor) |
| Parametros totales | 10.225.187.963 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecucion con `-c 32768`; no se especifica si es el maximo nativo) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (mas matriz de importancia imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible describe la arquitectura de forma indirecta, a traves de la receta de cuantizacion. El modelo combina capas Mamba-2 (proyecciones de entrada y salida `ssm_in` y `ssm_out`) con una capa de mezcla de expertos que contiene 192 expertos enrutados, con proyecciones de subida y bajada hacia un espacio latente (`ffn_latent_up` y `ffn_latent_down`). No se especifica el numero de parametros activos por token, el numero de capas ni la dimension oculta.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente menciona que el modelo tiene un modo de razonamiento (thinking) activado por defecto y una plantilla de chat propia que incluye soporte de llamadas a herramientas, lo que sugiere un ajuste instruccional orientado a agentes y razonamiento multi-paso.

La innovacion destacable esta en la cuantizacion: el autor calcula una matriz de importancia sobre 125.000 tokens con una distribucion representativa de uso real (prosa, matematicas resueltas en modo thinking, codigo y llamadas a herramientas, todo renderizado con la plantilla de chat del modelo) y aplica una receta por tensor que mantiene las proyecciones de salida de Mamba en BF16 y, en los ficheros de 4 a 6 bits, las proyecciones latentes en Q8_0 y las de entrada de Mamba en Q6_K o Q8_0. Los 192 expertos enrutados, que constituyen la mayor parte del fichero, se cuantizan de forma estandar.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia (`--jinja`).
- Razonamiento en modo thinking, activado por defecto; el endpoint compatible con OpenAI devuelve el razonamiento en `reasoning_content`. Se puede desactivar con `"chat_template_kwargs": {"enable_thinking": false}`.
- Llamadas a herramientas (tool calling): el endpoint compatible con OpenAI parsea las llamadas a `tool_calls`. En Ollama, segun el autor, llegan como texto hasta que exista un parser para el formato del modelo.
- Uso en agentes y razonamiento multi-paso: la model card menciona que la matriz de importancia se calculo incluyendo llamadas a herramientas y matematicas resueltas paso a paso, lo que indica entrenamiento o ajuste para estos flujos.
- Generacion de codigo: el autor indica que los ajustes de muestreo recomendados "tambien sirven para codigo".
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional local con razonamiento visible: el modelo separa el thinking en `reasoning_content`, lo que permite mostrar u ocultar el razonamiento al usuario final segun el producto. Adecuado para interfaces de chat que quieran transparencia en el proceso de respuesta.
- Agentes con llamadas a herramientas en local: el soporte de `tool_calls` en el endpoint compatible con OpenAI permite integrarlo en frameworks de agentes que ya hablan ese protocolo, sin depender de APIs en la nube.
- Generacion de codigo en entornos con GPU de consumo: con Q4_K_M (6,7 GB) cabe en GPUs de 8-12 GB y permite autocompletado o generacion de funciones en un IDE local, con la ventaja de privacidad del codigo.
- Razonamiento matematico paso a paso: el modo thinking esta pensado para problemas que requieren descomposicion; util en herramientas educativas o de verificacion de calculos donde se quiera auditar el razonamiento.
- Despliegue en estaciones de trabajo sin GPU dedicada: los ficheros funcionan en CPU y Apple Metal, lo que permite servir el modelo en portatiles o servidores sin acelerador, a costa de menor throughput.
- Prototipado y evaluacion de modelos MoE hibridos: al ser un GGUF con receta de cuantizacion documentada y matriz de importancia incluida, sirve para estudiar el impacto de la cuantizacion en arquitecturas Mamba-2 + MoE y para generar cuantizaciones propias con `llama-quantize`.
- Servicio de inferencia ligero con Ollama o LM Studio: la integracion directa desde Hugging Face (`ollama run hf.co/Lernex/Metis-1.6-Logos-GGUF:Q4_K_M`) permite levantar un endpoint local en minutos para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son metricas de cuantizacion y de velocidad de inferencia:

| Metrica | Valor |
|---|---|
| Perplejidad BF16 (wikitext-2, 512 tokens, 40 chunks) | 15,873 |
| Perplejidad Q8_0 | 15,887 (KL 0,0080; mismo token superior 95,1%) |
| Perplejidad Q6_K | 15,891 (KL 0,0115; mismo token superior 94,5%) |
| Perplejidad Q5_K_M | 15,979 (KL 0,0181; mismo token superior 93,0%) |
| Perplejidad Q4_K_M | 15,998 (KL 0,0354; mismo token superior 90,3%) |
| Perplejidad IQ4_XS | 16,284 (KL 0,0448; mismo token superior 88,7%) |
| Decodificacion Q4_K_M en RTX 5070 Ti (modelo completo en GPU) | ~129 tokens/s |
| Lectura de prompt Q4_K_M en RTX 5070 Ti | ~1.900 tokens/s |

Como referencia, el autor indica que un Q4_K_M estandar (sin receta por tensor) produce un 39% mas de perplejidad que BF16 y coincide en el token superior solo el 66% de las veces.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M 6,7 GB; IQ4_XS 6,1 GB; Q5_K_M 7,8 GB; Q6_K 8,8 GB; Q8_0 11,1 GB; BF16 20,5 GB. Hay que anadir el espacio de cache KV para el contexto elegido (32.768 tokens en el ejemplo del autor).
- GPU recomendadas: el autor aporta mediciones en una RTX 5070 Ti con el modelo completo en GPU. Por tamano, Q4_K_M cabe en GPUs consumer de 8 GB o mas; Q8_0 requiere 12-16 GB; BF16 requiere 24 GB o mas (RTX 3090/4090, A100, H100).
- Cabe en GPU consumer: si, en el rango de 8 a 24 GB segun cuantizacion.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama y LM Studio. Requiere una build de llama.cpp con soporte para Metis-1.6 (`metis16`). Funciona en CPU, Apple Metal y NVIDIA CUDA.
- Latencia y throughput: ~129 tokens/s de decodificacion y ~1.900 tokens/s de lectura de prompt con Q4_K_M en RTX 5070 Ti. No hay datos para otras GPU ni para CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (MoE hibrido Mamba-2 con ~10.000 millones de parametros), ni datos de benchmarks que permitan situarlo frente a alternativas. La unica comparacion interna posible es entre las propias cuantizaciones del repositorio, recogida en la tabla de benchmarks.

## Limitaciones y advertencias

- El repositorio solo contiene ficheros GGUF; no incluye los pesos originales en safetensors. Para otros formatos hay que acudir al modelo base Lernex/Metis-1.6-Logos.
- Requiere una build de llama.cpp con soporte especifico para `metis16`; las versiones estandar no cargaran los ficheros.
- En Ollama, las llamadas a herramientas llegan como texto hasta que exista un parser para el formato del modelo, lo que rompe flujos de agentes que dependan de `tool_calls` estructurados.
- El modo thinking esta activado por defecto y aumenta el consumo de tokens y la latencia; para respuestas directas hay que desactivarlo explicitamente y ajustar la temperatura a 0,3 y el `repeat_penalty` a 1,0.
- Si se configura manualmente el `repeat_penalty`, es necesario pasar `--repeat-last-n 131072`; de lo contrario llama.cpp solo aplica la penalizacion a los ultimos 64 tokens, lo que degrada la coherencia en contextos largos.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion. Al ser un modelo con modo de razonamiento, existe riesgo de razonamientos plausibles pero incorrectos, especialmente en matematicas y codigo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre el cumplimiento normativo en dominios regulados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (1 de noviembre de 2026), por lo que no hay validacion independiente de las metricas declaradas.
- La fecha de creacion indicada (2026) es posterior a la de la mayoria de modelos publicados; conviene verificar la vigencia y el soporte de la build de llama.cpp necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lernex/Metis-1.6-Logos-GGUF
- Modelo base: https://huggingface.co/Lernex/Metis-1.6-Logos
- llama.cpp (requerido, con soporte `metis16`): no disponible en la informacion proporcionada
- Documentacion de Ollama: no disponible en la informacion proporcionada
- Documentacion de LM Studio: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
