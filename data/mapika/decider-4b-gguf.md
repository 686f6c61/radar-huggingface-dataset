# Mapika/decider-4b-GGUF

## Resumen

Mapika/decider-4b-GGUF es la distribucion en formato GGUF del modelo Mapika/decider-4b v2.1, un modelo de decision y clasificacion desarrollado por Mapika. No es un modelo conversacional: no genera texto como respuesta, sino que lee un estado (por ejemplo, el texto de una incidencia) acompanado de una o varias preguntas, cada una con su lista explicita de opciones, y devuelve una probabilidad para cada opcion en una unica pasada hacia delante. La respuesta se obtiene leyendo los logits de los tokens correspondientes a las letras de cada opcion, divididos por una temperatura ajustada, mediante el script `decide_gguf.py` incluido en el repositorio.

El modelo cuenta con 4.205.751.296 parametros (~4,2 mil millones) y deriva de Qwen/Qwen3.5-4B-Base, segun declara el propio autor. Esta orientado a tareas de clasificacion con opciones cerradas, con calibracion explicita de probabilidades: la model card reporta metricas de ECE (error de calibracion esperado) ademas de precision y NLL, lo que lo hace util para enrutado, triaje y etiquetado automatico donde se necesita una confianza interpretable por clase.

La relevancia de esta publicacion es practica: ofrece tres niveles de cuantizacion en GGUF (Q4_K_M de 2,7 GB, Q8_0 de 4,5 GB y BF16 de 8,4 GB) que permiten ejecutar el modelo en llama.cpp, con una degradacion de calidad medida y documentada respecto a los pesos bf16 en PyTorch. El autor publica tablas comparativas por cuantizacion y advierte explicitamente de los efectos de la decodificacion por lotes y de las diferencias CPU/GPU en las probabilidades de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen/Qwen3.5-4B-Base; la salida se lee de los logits de los tokens de opcion. El `config` del checkpoint declara una capa MTP, aunque no contiene pesos de multi-token-prediction |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF BF16 (sin cuantizar), Q8_0 y Q4_K_M. En Q4_K_M, la matriz de embedding (que es tambien la matriz de salida con las filas de letras de opcion) se almacena en Q6_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp (variantes BF16, Q8_0 y Q4_K_M); el modelo base Mapika/decider-4b se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su modelo base, Qwen/Qwen3.5-4B-Base, y del mecanismo de lectura de salida. El modelo no produce texto libre: en cada ranura de respuesta del prompt (construido por `decider.prompt`) se leen los logits de los tokens que representan las letras de las opciones, se dividen por una temperatura ajustada y se normalizan para obtener una distribucion de probabilidad sobre cada lista de opciones. Esa temperatura se guarda en `decider_config.json` y vale 1.099 en la version publicada.

El autor no especifica en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se documenta el conjunto de evaluacion: un conjunto de regresion de 95 tareas, 144.226 preguntas, dividido en 67 tareas in-task y 28 held-out, con tareas como fin_phrasebank, medmcqa y mmlu. La conversion a GGUF se realizo con `convert_hf_to_gguf.py --no-mtp --outtype bf16` sobre el commit `c9064dded` de llama.cpp (2026-09-27) y posterior `llama-quantize` a Q8_0 y Q4_K_M; el flag `--no-mtp` es obligatorio porque el checkpoint no tiene pesos MTP aunque su config declare una capa.

## Capacidades

- Clasificacion y decision con opciones cerradas: dada una situacion y una pregunta con una lista de opciones, devuelve la opcion elegida junto con la probabilidad de cada alternativa.
- Multiples preguntas por estado en una sola pasada: el ejemplo de la model card resuelve a la vez el departamento responsable y el nivel de urgencia de una incidencia.
- Probabilidades calibradas: la API devuelve `choice`, `confidence` y el diccionario `probs` completo, con calibracion medida mediante ECE.
- Respuestas de tipo si/no y puntuacion: la API completa del paquete `decider-ai` (`system_one`) contempla respuestas si/no y puntuaciones, aunque en GGUF solo esta liberado `decide()` para preguntas de eleccion.
- Ejecucion local en llama.cpp con soporte de GPU CUDA y Metal, o en CPU.
- No dispone de generacion de texto util: el texto que produzca al cargarse en `llama-cli`, `llama-server`, Ollama o LM Studio no constituye su respuesta.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada incidencia por departamento (billing, technical, sales) y por urgencia (low, medium, high) en una sola llamada, aprovechando que el modelo devuelve probabilidades por opcion para aplicar umbrales o derivar a revision humana cuando la confianza es baja.
- Triaje de bandejas de entrada: asignar correos entrantes a categorias predefinidas con una confianza cuantificada, lo que permite automatizar el enrutado y marcar los casos ambiguos para revision.
- Etiquetado de datasets para entrenamiento: generar etiquetas con probabilidad asociada sobre corpus de clasificacion (sentimiento, topicos, intencion) a bajo coste, usando Q4_K_M en CPU si no hay GPU disponible.
- Analisis de encuestas con respuestas cerradas: mapear texto libre de encuestados a escalas o categorias predefinidas, manteniendo la distribucion de probabilidad para ponderar resultados.
- Moderacion y politica de contenido: decidir si un texto incumple una politica concreta entre un conjunto reducido de categorias, con la ventaja de disponer de una medida de calibracion para fijar el punto de corte.
- Enrutado dentro de agentes y pipelines multi-paso: como componente de decision barato que selecciona la siguiente herramienta o ruta de un flujo, en lugar de un modelo generativo de mayor coste.
- Clasificacion en dominios especializados: la evaluacion incluye tareas como medmcqa y mmlu, de modo que el modelo se ha medido en preguntas de opcion multiple de tipo medico y de conocimiento general.
- Procesamiento por lotes en servidores sin GPU: con 8 hilos de CPU, una peticion de 40 a 120 tokens tarda entre 0,3 y 0,7 segundos con Q4_K_M, lo que permite clasificacion masiva sin acelerador.

## Benchmarks y rendimiento

La model card publica la evaluacion sobre el conjunto de regresion de decider-4b (95 tareas, 144.226 preguntas, 67 tareas in-task y 28 held-out) con la temperatura de 1.099, leida mediante llama.cpp con build CUDA y comparada fila a fila con los pesos bf16 en PyTorch. La precision, la NLL y el ECE son medias sobre tareas.

| Formato | Precision in-task | NLL in-task | ECE in-task | Precision held-out | NLL held-out | ECE held-out | Coincidencia con bf16 PyTorch |
|---|---|---|---|---|---|---|---|
| Pesos bf16, PyTorch | 0,8308 | 0,4145 | 0,0308 | 0,7838 | 0,5703 | 0,0781 | referencia |
| BF16 GGUF | 0,8308 | 0,4145 | 0,0308 | 0,7837 | 0,5700 | 0,0782 | 99,45 % |
| Q8_0 | 0,8310 | 0,4145 | 0,0309 | 0,7829 | 0,5699 | 0,0778 | 99,31 % |
| Q4_K_M | 0,8288 | 0,4194 | 0,0324 | 0,7834 | 0,5691 | 0,0733 | 97,06 % |

Detalles reportados por el autor: el GGUF BF16 difiere de PyTorch solo en empates cercanos (diferencia mediana de probabilidad de 0,001); Q8_0 se mantiene dentro de ese ruido, con 31 tareas que suben y 39 que bajan, como maximo 0,9 puntos; Q4_K_M pierde 0,2 puntos de precision in-task con una NLL ligeramente peor, mientras que la precision held-out no cambia, con 54 tareas peores y 36 mejores. La mayor caida de Q4_K_M se da en fin_phrasebank (-3,5 puntos), seguida de medmcqa y mmlu (-1,3 puntos).

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamano de archivo, con margen para cache KV y contexto): Q4_K_M en torno a 3 GB; Q8_0 en torno a 5 GB; BF16 en torno a 9 GB. No son cifras publicadas por el autor.
- Cabe en GPU de consumo: Q4_K_M y Q8_0 son aptos para tarjetas con 4-8 GB de VRAM; BF16 requiere tarjetas de gama alta o profesional.
- Funciona tambien en CPU: la model card reporta 0,3 a 0,7 segundos por peticion de 40 a 120 tokens con Q4_K_M sobre 8 hilos de CPU, y Q8_0 aproximadamente un 20 % mas lento.
- GPU empleadas en la medicion: build CUDA de llama.cpp. No se ejecutaron las builds de CPU ni Metal sobre el conjunto de regresion.
- Opciones de despliegue: llama.cpp mediante `llama-cpp-python` (version 0.3.35 o superior), con el script `decide_gguf.py` del repositorio; el paquete `decider-ai==1.5.0` para el manejo del prompt y la temperatura. Los ficheros pueden cargarse en llama-cli, llama-server, Ollama o LM Studio, pero en esos entornos se comportan como un modelo de continuacion de texto y no como el clasificador previsto.
- Ajuste de ejecucion: `n_gpu_layers=-1` para cargar todas las capas en GPU si la build dispone de aceleracion; `n_threads` configurable para CPU.
- Advertencia de rendimiento: con varias peticiones en un mismo `llama_decode`, las probabilidades cambian segun el resto del lote (hasta 0,02 en BF16 y 0,16 en Q4_K_M); se recomienda una peticion por decodificacion para obtener resultados reproducibles.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de decision con lectura directa de logits que sean comparables. La comparativa mas directa es entre las propias variantes de cuantizacion del modelo:

| Variante | Tamano de archivo | Precision in-task | Precision held-out | Coincidencia con bf16 PyTorch | Uso previsto |
|---|---|---|---|---|---|
| BF16 GGUF | 8,4 GB | 0,8308 | 0,7837 | 99,45 % | Sin cuantizar; base para generar otras cuantizaciones |
| Q8_0 | 4,5 GB | 0,8310 | 0,7829 | 99,31 % | Misma calidad que los pesos bf16 |
| Q4_K_M | 2,7 GB | 0,8288 | 0,7834 | 97,06 % | La mas pequena, con ~0,2 puntos menos de precision in-task |

Como referencia de origen, el modelo base Qwen/Qwen3.5-4B-Base es un modelo de generacion de texto y no resulta comparable en la tarea de decision con opciones cerradas. No se dispone de alternativas de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional. Cargarlo en herramientas de chat produce texto de continuacion que no constituye su respuesta; la respuesta valida se obtiene leyendo los logits de los tokens de opcion.
- La calidad de la salida depende de construir el prompt con `decider.prompt` y de aplicar la temperatura ajustada (1,099) guardada en `decider_config.json`.
- La decodificacion por lotes altera las probabilidades: hasta 0,02 en BF16 y 0,16 en Q4_K_M. Se debe puntuar una peticion por `llama_decode` para obtener resultados estables.
- Las builds de CPU y GPU dan probabilidades ligeramente distintas sobre el mismo fichero (por ejemplo, 0,846 y 0,830 para "billing", frente a 0,844 en PyTorch). Los umbrales de decision deberian fijarse con la build que se vaya a usar en produccion.
- La cuantizacion Q4_K_M degrada tareas concretas: fin_phrasebank baja 3,5 puntos y medmcqa y mmlu bajan 1,3 puntos.
- Solo soporta ingles, segun el campo `language` de la model card. No hay datos de rendimiento en castellano.
- La API completa del paquete (`system_one` con puntuaciones y respuestas si/no, y el servidor HTTP) no esta disponible para ficheros GGUF en la version publicada; solo `decide()` para preguntas de eleccion.
- La conversion del checkpoint exige el flag `--no-mtp`; sin el, el fichero generado no se puede cargar en llama.cpp.
- No se documentan sesgos especificos ni tasas de alucinacion. Al tratarse de un clasificador de opciones cerradas, el riesgo principal no es inventar contenido, sino elegir una opcion incorrecta con confianza alta; el ECE medido (0,0308 in-task y 0,0781 held-out en bf16) cuantifica ese riesgo de calibracion.
- Licencia Apache-2.0, heredada de decider-4b y de Qwen/Qwen3.5-4B-Base, que permite uso comercial y modificacion con las condiciones habituales de atribucion y aviso de licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mapika/decider-4b-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-4b
- Modelo base del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Paquete `decider-ai` (version 1.5.0): no se proporciona URL en la informacion disponible
- llama.cpp: no se proporciona URL en la informacion disponible; el commit de conversion citado es `c9064dded` (2026-09-27)
