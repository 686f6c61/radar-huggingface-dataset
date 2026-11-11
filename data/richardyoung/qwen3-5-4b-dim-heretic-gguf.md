# richardyoung/Qwen3.5-4B-DiM-heretic-GGUF

## Resumen

Qwen3.5-4B-DiM-heretic-GGUF es una coleccion de cuantizaciones GGUF del modelo richardyoung/Qwen3.5-4B-DiM-heretic, una version "abliterada" (con la direccion de rechazo eliminada) de Qwen/Qwen3.5-4B. La abliteracion se realizo con Heretic 2.0 mediante ablation de la direccion de rechazo por diferencia de medias (difference-in-means, DiM), ajustada por la busqueda automatica de Heretic sobre 100 ensayos. El autor es Richard J. Young y el modelo se publica como material de investigacion sobre eliminacion de rechazos y su evaluacion, no como asistente de proposito general.

El modelo base Qwen3.5-4B es un transformer multimodal de 4.205.751.296 parametros (aproximadamente 4,2 mil millones), segun los pesos en safetensors del repositorio. Esta publicacion GGUF contiene unicamente la parte de texto: el proyector de vision del modelo original no se incluye, por lo que las capacidades de imagen no estan disponibles en estos ficheros. El repositorio ocupa 7,2 GB y declara licencia Apache 2.0, heredada del modelo fuente.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigacion sobre tecnicas de abliteracion y su medicion; por otro, sirve como ejemplo de cuantizacion GGUF con importance matrix (imatrix) generada a partir de la build Q8_0. El modelo completo en bf16 reduce el rechazo en un conjunto de 972 prompts daninos retenidos del 88,5% al 54,6% (juez WildGuard), con una divergencia KL de primer token de 0,054 respecto al original; estas cifras corresponden al modelo en precision completa y no a los ficheros GGUF publicados aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B); no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 4.205.751.296 (segun safetensors del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0; anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K; imatrix (7 MB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parametros. La informacion proporcionada no detalla la composicion del dataset de preentrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO en el modelo original. El modelo base acepta imagenes, pero el proyector de vision no se incluye en esta publicacion GGUF, que es exclusivamente de texto.

La innovacion tecnica de esta version es el proceso de abliteracion: se calcula la direccion de rechazo mediante difference-in-means (DiM) y se elimina de los pesos, con hiperparametros seleccionados por la busqueda de Heretic 2.0 sobre 100 ensayos. La regla de seleccion fue el menor numero de rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1. Los ficheros GGUF se generaron con llama.cpp (commit `468fde9`) mediante `convert_hf_to_gguf.py --outtype bf16` seguido de `llama-quantize`, verificando cada peso safetensors contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una importance matrix calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation, tag conversational).
- Razonamiento y generacion de codigo y matematicas: capacidades heredadas del modelo base Qwen3.5-4B, aunque no se documentan resultados especificos en la informacion disponible.
- Respuesta a solicitudes que el modelo original rechaza: el modelo abliterado cumple muchas peticiones que el original declina.
- Compatibilidad con llama.cpp, Ollama y endpoints compatibles (tags `llama.cpp`, `ollama`, `endpoints_compatible`).
- Capacidades de vision: no disponibles en esta publicacion GGUF (el proyector de vision no se incluye).
- Soporte de tool calling, function calling y agentes multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas a ingles segun el campo `language`.

## Casos de uso

- Investigacion sobre abliteracion: el modelo permite reproducir y extender el estudio de eliminacion de rechazos comparando el comportamiento del modelo abliterado con el original Qwen3.5-4B en conjuntos de prompts controlados.
- Evaluacion de defensas frente a la eliminacion de rechazos: util para medir la eficacia de filtros, clasificadores de seguridad o tecnicas de alineamiento adicional sobre modelos abliterados.
- Analisis de cuantizacion y comportamiento de rechazo: los ficheros Q4_K_M y Q8_0 permiten estudiar como la cuantizacion altera la tasa de rechazo, dado que el autor advierte que las cifras del paper no aplican a los GGUF.
- Despliegue local en hardware modesto: la build Q4_K_M (2,7 GB) puede ejecutarse con Ollama o llama.cpp en equipos con recursos limitados para experimentos de laboratorio.
- Estudio de divergencia respecto al original: la metrica de KL de primer token (0,054 en el modelo completo) sirve de referencia para analizar cuanto se desvia una ablacion del comportamiento del modelo fuente.
- Generacion de texto en ingles en entornos de investigacion: uso como generador de texto controlado en experimentos donde se necesita un modelo sin rechazos y con licencia permisiva.

## Benchmarks y rendimiento

Resultados publicados para el modelo en precision completa (bf16), no para los ficheros GGUF:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 88,5% | 54,6% (531/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 30 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,054 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que los ficheros cuantizados no fueron evaluados en el paper y que la cuantizacion puede alterar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para Q4_K_M (2,7 GB de pesos) y 5-6 GB para Q8_0 (4,5 GB de pesos), considerando el overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar ambas cuantizaciones; para mayor throughput, A100 o H100 aunque el tamano del modelo no las requiere.
- Cabe en GPU consumer: si, tanto Q4_K_M como Q8_0 en GPUs con 6-8 GB de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: Ollama (`ollama run richardyoung/qwen3.5-4b-dim-heretic`), llama.cpp (`llama-cli -hf ...`), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-DiM-heretic-GGUF | 4,2 B | no disponible | apache-2.0 | GGUF en HF | Abliterado; rechazo 54,6% en 972 prompts |
| Qwen/Qwen3.5-4B (original) | 4,2 B | no disponible | apache-2.0 | safetensors en HF | Rechazo 88,5% en el mismo conjunto; incluye vision |
| richardyoung/Qwen3.5-4B-DiM-heretic | 4,2 B | no disponible | apache-2.0 | safetensors en HF | Version bf16 del mismo modelo abliterado |

No se dispone de datos de benchmarks para comparar el rendimiento general con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para eliminar rechazos: cumple muchas solicitudes que el modelo original declina, lo que implica un riesgo elevado de generar contenido danino si se usa fuera de un contexto de investigacion.
- Las cifras de rechazo (54,6%) corresponden al modelo en bf16; los ficheros GGUF no fueron evaluados y la cuantizacion puede modificar el comportamiento.
- Solo soporta ingles segun el campo `language`; el rendimiento en otros idiomas no esta documentado.
- No incluye el proyector de vision, por lo que las capacidades de imagen del modelo base no estan disponibles.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible, pero es un modelo de 4,2 B parametros con las limitaciones tipicas de ese tamano.
- La licencia Apache 2.0 permite uso comercial, pero el autor restringe el uso previsto a investigacion sobre eliminacion de rechazos y evaluacion de defensas; los usuarios son responsables del uso licito.
- No se documentan capacidades de tool calling ni de agentes multi-paso, por lo que no deberia asumirse su disponibilidad en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion externa practicamente nula.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-DiM-heretic-GGUF
- Modelo base abliterado en bf16: https://huggingface.co/richardyoung/Qwen3.5-4B-DiM-heretic
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo fuente: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Paper citado (enlace arXiv pendiente de publicacion): "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors", Richard J. Young, 2026.
