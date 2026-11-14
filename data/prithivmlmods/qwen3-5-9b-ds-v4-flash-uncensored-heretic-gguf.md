# prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF

## Resumen

Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF es una distribucion en formato GGUF de un modelo derivado de Qwen/Qwen3.5-9B, publicado por el usuario prithivMLmods. El autor ha aplicado un ajuste fino orientado a razonamiento sobre trazas del modelo DeepSeek V4 Flash y, posteriormente, un proceso de "abliteration" mediante la herramienta Heretic v2.0.0.dev0 para reducir el comportamiento de rechazo (refusal). El resultado es un modelo de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) con licencia Apache 2.0 y etiquetado como multimodal (pipeline image-text-to-text).

La relevancia de esta publicacion es doble. Por un lado, ofrece una version "sin censura" de un modelo de razonamiento de tamano medio, pensada para explorar el comportamiento del modelo en tareas de razonamiento largo, matematicas, analisis cientifico y codigo sin las restricciones habituales de alineamiento. Por otro, introduce soporte de Multi-Token Prediction (MTP) integrado en los propios pesos GGUF, lo que permite decodificacion especulativa sin necesidad de un modelo "draft" separado, acelerando la inferencia local.

El repositorio incluye cuantizaciones desde BF16 (18,4 GB) hasta Q3_K_M (4,8 GB), ademas de un fichero de proyeccion multimodal (mmproj-bf16) de 922 MB para el procesamiento de vision. Es una publicacion experimental, con cero descargas y un like en el momento de la consulta, y el propio autor advierte de posibles artefactos de razonamiento y de que el comportamiento sin censura no garantiza exactitud factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B), con cabezales MTP para decodificacion especulativa |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la prueba de rendimiento usa 16.384 tokens) |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para vision) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9,2 mil millones de parametros. Sobre esa base, el autor aplica un ajuste fino supervisado (SFT) utilizando trazas de razonamiento generadas por DeepSeek V4 Flash, segun indica la model card. El objetivo declarado es mejorar el razonamiento de formato largo, la resolucion de problemas matematicos, el analisis cientifico, la programacion y el seguimiento de instrucciones. Posteriormente se aplica Heretic v2.0.0.dev0, una herramienta de abliteration que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones, dando lugar a la variante "uncensored/heretic".

La innovacion tecnica mas destacable es la integracion de Multi-Token Prediction (MTP) directamente en los pesos GGUF. A diferencia de la decodificacion especulativa clasica, que requiere un modelo draft mas pequeno y separado, los ficheros MTP GGUF incorporan cabezales de salida adicionales en la arquitectura principal que predicen varios tokens futuros en una sola pasada. Esto acelera la inferencia local sin coste adicional de memoria por un segundo modelo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO mas alla del SFT mencionado.

## Capacidades

- Generacion de texto y razonamiento de formato largo, con enfasis en cadenas de razonamiento extensas.
- Resolucion de problemas matematicos (la model card cita pruebas de trenes y corredores, llenado de tanques con tuberias, edades padre-hijo, etc.).
- Generacion y analisis de codigo (la prueba incluye insercion de nodos en listas enlazadas simples).
- Analisis cientifico y seguimiento de instrucciones.
- Procesamiento multimodal imagen-texto: el repositorio incluye un fichero mmproj-bf16 y el pipeline declarado es image-text-to-text.
- Decodificacion especulativa mediante MTP integrado en los pesos.
- Comportamiento "uncensored" orientado a reducir rechazos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el ajuste en trazas de razonamiento sugiere cierta capacidad, pero no se documenta.
- Capacidades multilingues: limitadas al ingles segun el campo language.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de algebra y aritmetica verbal (tiempos de encuentro, llenado de depositos, edades) paso a paso, aprovechando el ajuste sobre trazas de razonamiento de DeepSeek V4 Flash.
- Generacion de codigo en local: con la cuantizacion Q4_K_M (5,83 GB) puede ejecutarse en una GPU de consumo para tareas de programacion como estructuras de datos y algoritmos, integrándose en editores o scripts de automatizacion.
- Analisis cientifico y explicaciones tecnicas: util para redactar explicaciones detalladas y razonamientos de varios pasos en entornos de investigacion donde se prefiera ejecucion local.
- Despliegue en hardware limitado: las variantes Q3_K_M (4,8 GB) y Q4_K_S (5,49 GB) permiten inferencia en equipos con poca VRAM o RAM, ideal para prototipos y pruebas offline.
- Aceleracion de inferencia con MTP: en servidores con GPU dedicada (por ejemplo, RTX PRO 6000 con 96 GB) se puede activar la decodificacion especulativa MTP para obtener throughput alto (269,61 tokens/s de generacion en la prueba del autor) en tareas de generacion larga.
- Procesamiento de imagenes y texto: gracias al fichero mmproj, puede emplearse en tareas que combinen descripcion de imagenes con razonamiento textual, aunque la documentacion al respecto es escasa.
- Exploracion de alineamiento y seguridad: investigadores interesados en estudiar el efecto de la abliteration sobre el comportamiento de rechazo pueden comparar esta variante con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de inferencia para la cuantizacion Q5_K_M en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 515,15 tokens/s |
| Velocidad media de generacion | 269,61 tokens/s |
| Tiempo total de ejecucion | 25,8 s |
| Longitud de contexto en la prueba | 16.384 tokens |
| KV Cache (K) | q8_0 |
| VRAM pico utilizada | 7,05 GiB |
| Utilizacion pico de GPU | 84% |
| Capas offloaded | 99 (-ngl 99) |
| Decodificacion especulativa | MTP (draft_n_max=2) |
| Semilla | 42 |

Estas cifras corresponden a ese hardware y configuracion concretos y no deben extrapolarse a otros entornos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): BF16 ~18,4 GB; Q6_K ~7,56 GB; Q5_K_M ~6,67 GB; Q5_K_S ~6,47 GB; Q4_K_M ~5,83 GB; Q4_K_S ~5,49 GB; Q3_K_L ~5,15 GB; Q3_K_M ~4,8 GB.
- Para vision, anadir aproximadamente 922 MB del fichero mmproj-bf16.
- GPU recomendadas: para BF16, GPUs de 24 GB o mas (RTX 4090, A100 40 GB, H100). Para cuantizaciones Q4/Q5, GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) pueden ser suficientes con offloading parcial o total.
- Cabe en GPU de consumo: si, especialmente en cuantizaciones Q3 y Q4. La prueba del autor con Q5_K_M uso 7,05 GiB de VRAM pico con 99 capas offloaded.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. La model card menciona tambien text-generation-inference y transformers para el modelo base.
- Latencia y throughput: en la prueba del autor, 269,61 tokens/s de generacion y 515,15 tokens/s de procesamiento de prompt con MTP activado en una RTX PRO 6000. En GPUs de consumo el throughput sera considerablemente menor; no se dispone de cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DS-v4-Flash-uncensored-heretic (este) | ~9,2 B | no disponible | Apache 2.0 | GGUF | Ajuste en razonamiento DeepSeek V4 Flash + abliteration, MTP |
| Qwen/Qwen3.5-9B (base) | ~9,2 B | no disponible | Apache 2.0 (presumible) | safetensors | Modelo original, alineado, sin abliteration |
| Otras variantes abliterated de Qwen | no disponible | no disponible | variable | safetensors/GGUF | Alternativas de la comunidad sin datos verificados en esta ficha |

No se dispone de datos de rendimiento comparativos publicados para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo experimental: el autor advierte de posibles comportamientos inesperados y artefactos de razonamiento.
- El comportamiento sin censura no garantiza exactitud factual; las salidas deben evaluarse de forma independiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente mayor al haberse reducido el alineamiento.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado.
- Longitud de contexto oficial no disponible; la prueba usa 16.384 tokens, por lo que no debe asumirse una ventana mayor sin verificacion.
- La abliteration puede degradar capacidades de seguimiento de instrucciones o seguridad en produccion; no se recomienda su uso en aplicaciones orientadas al usuario sin filtros adicionales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad sobre el contenido generado recae en el desplegador.
- Publicacion con muy poca traccion (0 descargas, 1 like) y sin validacion externa; tratar con cautela en entornos productivos.
- El pipeline declarado es image-text-to-text, pero la documentacion sobre capacidades de vision es minima.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
