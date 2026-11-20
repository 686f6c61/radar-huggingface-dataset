# Lernex/Metis-1.6-Logos-GGUF

## Resumen

Metis-1.6-Logos es un modelo de generacion de texto de Lernex construido sobre una arquitectura hibrida que combina capas transformer con mezcla de expertos (MoE) y bloques Mamba-2. Con 10.225.187.963 parametros totales, el modelo se distribuye en este repositorio unicamente en formato GGUF, cuantizado para su uso con llama.cpp y las aplicaciones construidas sobre el (Ollama, LM Studio, llama-server). La model card destaca un enfoque de razonamiento explicito ("thinking mode") activado por defecto, con separacion del contenido de razonamiento en el campo `reasoning_content` en la API compatible con OpenAI.

El repositorio es relevante porque documenta un proceso de cuantizacion poco habitual: la cuantizacion estandar degrada este modelo mucho mas de lo normal (un Q4_K_M convencional presenta un 39% mas de perplejidad que BF16 y solo coincide en el token superior el 66% de las veces). El autor identifica que casi todo el dano proviene de las proyecciones de salida y entrada de Mamba-2 y de las proyecciones de bajo rango hacia y desde el espacio latente de los expertos, menos del 9% de los pesos, y las mantiene en mayor precision en todos los ficheros publicados.

La licencia es Apache 2.0, igual que el modelo base. El repositorio acumula 1757 descargas y 61,1 GB de tamano total, con ficheros que van desde 6,1 GB (IQ4_XS) hasta 20,5 GB (BF16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: transformer con mezcla de expertos (MoE) y bloques Mamba-2 |
| Parametros totales | 10.225.187.963 (10,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 32768` y la penalizacion de repeticion se aplica sobre 131072 tokens) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (todos con importance matrix y receta por tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo para el conteo de parametros del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura hibrida con tres componentes identificables: capas de mezcla de expertos con 192 expertos enrutados, bloques Mamba-2 con proyecciones de entrada (`ssm_in`) y salida (`ssm_out`), y proyecciones de bajo rango hacia y desde el espacio latente de los expertos (`ffn_latent_up` y `ffn_latent_down`). Los 192 expertos enrutados constituyen la mayor parte del fichero. No se dispone de datos sobre el numero de parametros activos por token, el numero de capas, la dimension oculta ni la composicion del dataset de entrenamiento.

No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La model card si documenta el proceso de cuantizacion como innovacion tecnica: se calculo una importance matrix sobre 125.000 tokens con una distribucion representativa del uso real (prosa, matematicas resueltas en modo thinking, codigo y llamadas a herramientas, todo renderizado con la plantilla de chat del modelo), y se aplico una receta por tensor que mantiene las proyecciones de salida de Mamba en BF16 y, en los ficheros de 4 a 6 bits, las proyecciones latentes en Q8_0 y las proyecciones de entrada de Mamba en Q6_K o Q8_0.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia incluida en los ficheros GGUF.
- Razonamiento explicito en modo thinking, activado por defecto; el contenido de razonamiento se expone en el campo `reasoning_content` de la API compatible con OpenAI y como `thinking` en Ollama.
- Desactivacion del modo thinking por peticion mediante `"chat_template_kwargs": {"enable_thinking": false}` para respuestas directas.
- Soporte de tool calling / function calling: llama-server parsea las llamadas a herramientas en `tool_calls`; en Ollama llegan como texto hasta que exista un parser para el formato del modelo.
- Capacidad declarada para codigo: la model card indica que los ajustes de muestreo recomendados "suit code as well" y que la importance matrix incluyo codigo.
- Capacidad declarada para matematicas resueltas paso a paso en modo thinking, segun la composicion de la importance matrix.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el pipeline de text-generation.
- Capacidades multilingues: no disponible.

## Casos de uso

- Razonamiento asistido por pasos en local: el modelo puede ejecutarse en llama.cpp con el modo thinking activado por defecto y devolver la traza de razonamiento separada del texto final, lo que permite auditar el proceso en tareas de analisis o resolucion de problemas sin depender de servicios en la nube.
- Generacion de codigo en estaciones de trabajo sin GPU de datacenter: con Q4_K_M (6,7 GB) el modelo cabe en GPUs de consumo y decodifica a unos 129 tokens/s en una RTX 5070 Ti, lo que lo hace util para autocompletado y generacion de funciones en el editor o en pipelines locales.
- Integracion en pipelines de CI/CD con tool calling: llama-server expone una API compatible con OpenAI que parsea `tool_calls`, de modo que el modelo puede invocarse desde scripts de automatizacion para tareas como resumir diffs, clasificar incidencias o generar mensajes de commit estructurados.
- Asistente conversacional multi-turno autoalojado: la plantilla de chat incluida en el GGUF y los ajustes de muestreo recomendados (temperatura 0,8, top-p 0,95, top-k 20, penalizacion de repeticion 1,05 sobre todo el contexto) permiten desplegar un chatbot con Ollama o LM Studio mediante `ollama run hf.co/Lernex/Metis-1.6-Logos-GGUF:Q4_K_M`.
- Procesamiento de documentos largos con contexto extendido: el ejemplo oficial arranca llama-server con `-c 32768`, y la recomendacion de `--repeat-last-n 131072` sugiere que el modelo puede operar con ventanas de hasta 128K tokens; util para resumir o extraer informacion de documentos extensos en una sola pasada.
- Despliegue en hardware con poca VRAM: la variante IQ4_XS (6,1 GB) permite ejecutar el modelo en GPUs de 8 GB o en CPU con llama.cpp, manteniendo una perplejidad de 16,284 frente a 15,873 del BF16, adecuada para prototipos y entornos de desarrollo.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye la importance matrix (`Metis-1.6-Logos-imatrix.gguf`) y el comando `llama-quantize` completo, lo que sirve como referencia reproducible para estudiar el impacto de la cuantizacion por tensor en arquitecturas hibridas MoE + Mamba.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Si incluye metricas de calidad de cuantizacion medidas con `llama-perplexity` sobre wikitext-2 (contexto de 512 tokens, 40 fragmentos) contra el fichero BF16:

| Fichero | Tamano | Perplejidad | Divergencia KL | Mismo token superior |
|---|---|---|---|---|
| BF16 | 20,5 GB | 15,873 | referencia | referencia |
| Q8_0 | 11,1 GB | 15,887 | 0,0080 | 95,1% |
| Q6_K | 8,8 GB | 15,891 | 0,0115 | 94,5% |
| Q5_K_M | 7,8 GB | 15,979 | 0,0181 | 93,0% |
| Q4_K_M | 6,7 GB | 15,998 | 0,0354 | 90,3% |
| IQ4_XS | 6,1 GB | 16,284 | 0,0448 | 88,7% |

Datos de rendimiento en inferencia: en una RTX 5070 Ti con el modelo completo en GPU, Q4_K_M decodifica a aproximadamente 129 tokens/s y procesa prompts a aproximadamente 1.900 tokens/s. No se han publicado resultados de benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo completo en GPU): 20,5 GB para BF16, 11,1 GB para Q8_0, 8,8 GB para Q6_K, 7,8 GB para Q5_K_M, 6,7 GB para Q4_K_M y 6,1 GB para IQ4_XS.
- GPUs recomendadas: para BF16, A100 40 GB, H100 o RTX 4090 24 GB; para Q8_0, RTX 4090 24 GB o A6000 48 GB; para Q4_K_M, RTX 5070 Ti (medida oficial), RTX 4080, RTX 3090 o cualquier GPU con 8 GB o mas.
- Cabe en GPU de consumo: si, desde IQ4_XS (6,1 GB) en adelante; Q4_K_M es la opcion recomendada por el autor para la mayoria de maquinas.
- Opciones de despliegue: llama.cpp b12089 o superior (CPU, Apple Metal, NVIDIA CUDA), llama-server con API compatible con OpenAI, Ollama (con llama.cpp b12089 o superior empaquetado) y LM Studio. El autor recomienda Q4_K_M como opcion por defecto y Q8_0 como indistinguible de BF16.
- Latencia y throughput: 129 tokens/s de decodificacion y 1.900 tokens/s de lectura de prompt en RTX 5070 Ti con Q4_K_M y el modelo completo en GPU. No hay datos para otras GPUs ni para ejecucion en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada. El modelo combina MoE con Mamba-2 en 10,2 mil millones de parametros, lo que lo situa en una categoria poco comun; no se han publicado en la informacion disponible datos de rendimiento frente a alternativas como Mistral, Qwen o Llama de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Metis-1.6-Logos | 10,2 mil millones | no disponible | Apache 2.0 | GGUF | perplejidad 15,873 (BF16, wikitext-2) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion estandar degrada este modelo de forma severa: un Q4_K_M convencional presenta un 39% mas de perplejidad que BF16 y solo coincide en el token superior el 66% de las veces. Es imprescindible usar los ficheros de este repositorio, generados con importance matrix y receta por tensor, y no cuantizaciones genericas del modelo base.
- Los ficheros requieren llama.cpp b12089 o superior; versiones anteriores no cargaran el modelo. Ollama y LM Studio deben empaquetar esa version o superior.
- El modo thinking esta activado por defecto y consume tokens adicionales; para respuestas directas hay que desactivarlo explicitamente y ajustar la temperatura a 0,3 con `repeat_penalty` 1,0.
- La penalizacion de repeticion recomendada (1,05) debe aplicarse sobre todo el contexto; si se configura manualmente, hay que pasar `--repeat-last-n 131072`, ya que llama.cpp solo mira los ultimos 64 tokens por defecto.
- En Ollama, las llamadas a herramientas llegan como texto plano hasta que exista un parser para el formato del modelo; no deben asumirse `tool_calls` estructurados en ese entorno.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion, idiomas soportados ni evaluaciones de seguridad del modelo.
- No se dispone de datos sobre el numero de parametros activos por token, lo que impide estimar con precision el coste computacional real de la inferencia mas alla de las medidas empiricas aportadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta restricciones adicionales ni condiciones de atribucion especificas mas alla de las de la propia licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lernex/Metis-1.6-Logos-GGUF
- Modelo base: https://huggingface.co/Lernex/Metis-1.6-Logos
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Guia de compilacion de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
