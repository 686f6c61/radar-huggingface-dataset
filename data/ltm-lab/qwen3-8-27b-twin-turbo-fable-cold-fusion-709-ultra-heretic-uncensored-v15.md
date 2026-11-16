# LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15

## Resumen

LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15 es un modelo multimodal de tipo image-text-to-text derivado del modelo de DavidAU Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored. No se trata de un reentrenamiento: los pesos son identicos byte a byte al modelo base (27.781.427.952 parametros en safetensors) y lo que anade esta version es una capa de memoria episodica persistente implementada en codigo (`configuration_qwen_dense_v15.py` y `modeling_qwen_dense_v15.py`) bajo la arquitectura declarada `Qwen3_5V15ForConditionalGeneration`.

La innovacion principal es un mecanismo de memoria que almacena en disco los pares clave-valor calculados por las capas de atencion durante la lectura de cada prompt, troceados en eventos de hasta 128 tokens y acompanados de un "engram" de bajo rango del estado recurrente. En peticiones posteriores, el modelo relee el prompt para determinar que eventos recuperar, fusiona sus claves y valores en la atencion y vuelve a procesar la entrada, de modo que informacion dicha en una conversacion puede responderse en otra sesion completamente distinta sin anadir texto al prompt.

El modelo se sirve exclusivamente mediante una imagen Docker de SGLang modificada (`lovewin10/sglang-v15`), lo que lo aleja de los flujos habituales de transformers o llama.cpp. Incluye un modo "sueno" que, tras 10 minutos de inactividad, usa el propio modelo para reordenar, fusionar, corregir y crear puentes entre memorias. La licencia declarada es Apache 2.0 y cubre 15 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con extension de memoria episodica; clase `Qwen3_5V15ForConditionalGeneration` |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (variante oficial `-v15-FP8`, 28,5 GB de pesos frente a 51 GB) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB); incluye `model-mtp-restored.safetensors` con la cabeza MTP para decodificacion especulativa |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal heredado del linaje Qwen (etiquetas `qwen3_8` y `qwen3_6`) con pipeline image-text-to-text. La conversion a V15 no entrena, fusiona ni cuantiza nada: los pesos son identicos al modelo base. Lo que se anade es el nombre de arquitectura, un `auto_map` y las opciones de memoria (`qwen_dense_v15_memory_config`) en `config.json`, junto con los dos ficheros de codigo que implementan la memoria. El modelo base procede de un linaje de fine-tuning multi-etapa (tags "Cold Fusion", "GAIN Training", "Multi-stage tuning", "unsloth") sobre datasets de DavidAU (Polar-STRICT, F451-STRICT, THE-DECKARD), pero no se proporcionan detalles sobre volumen de tokens ni composicion exacta.

El mecanismo de memoria funciona en dos fases. Durante la lectura de un prompt, las claves y valores de atencion se segmentan en eventos de hasta 128 tokens y se escriben en un almacen en disco, cada uno con un engram de bajo rango del estado de las capas recurrentes. En una peticion posterior, el prompt se lee una vez para inferir que solicita; los eventos cuyas claves captarian su atencion se recuperan mediante un voto unico compartido por todas las capas y cabezas, sus engrams se componen en el estado recurrente de la peticion y el prompt se reprocesa con las claves y valores recuperados fusionados en la atencion. No se recupera texto ni se inserta nada en el prompt. El modo "sueno" (tras 10 minutos sin peticiones) ejecuta replay, fusion de duplicados, correccion de hechos obsoletos, generacion de preguntas ("suenos"), creacion de puentes entre notas que comparten una entidad y decaimiento (factor 0,9) de puentes no usados.

## Capacidades

- Generacion de texto conversacional multi-turno con memoria episodica persistente entre sesiones y reinicios del servidor.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Recuperacion de informacion dicha en conversaciones anteriores sin inclusion en el prompt, mediante atencion aumentada por claves y valores almacenados.
- Consolidacion automatica de memoria en reposo: fusion de eventos duplicados, retirada de correcciones obsoletas, creacion de puentes entre notas relacionadas.
- Decodificacion especulativa mediante cabeza MTP (`model-mtp-restored.safetensors`), con CUDA graph y prefix caching activos en SGLang.
- Soporte multilingue en 15 idiomas (ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi).
- Modelo "uncensored" segun la model card: sin las restricciones de alineacion del modelo original.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales con memoria de usuario a largo plazo: el modelo recuerda hechos mencionados en conversaciones previas (preferencias, datos de proyecto, decisiones) y los recupera en sesiones nuevas sin necesidad de reinyectar historial en el prompt, gracias al almacen en disco que sobrevive a reinicios.
- Atencion al cliente multi-sesion: un cliente que vuelve dias despues puede recibir respuestas coherentes con lo hablado anteriormente; el modo sueno consolida duplicados y retira informacion corregida (por ejemplo, un cambio de direccion o de pedido).
- Gestion de conocimiento personal o de equipo: las notas almacenadas y los puentes entre entidades relacionadas permiten construir una base de memoria consultable de forma implicita mediante preguntas en lenguaje natural, sin un pipeline RAG clasico de recuperacion textual.
- Analisis de imagenes con contexto historico: al ser image-text-to-text, puede describir o razonar sobre imagenes y conservar en memoria las conclusiones de analisis anteriores para comparaciones futuras.
- Despliegue de investigacion sobre memorias episodicas en LLM: la variante FP8 (28,5 GB) y la imagen SGLang permiten experimentar con recuperacion por atencion, votos por capa y mecanismos de consolidacion en reposo en un entorno reproducible.
- Prototipado de agentes con estado persistente: la memoria entre peticiones puede servir como capa de estado para agentes que necesitan recordar interacciones previas sin gestionar manualmente un historial de contexto.
- Evaluacion de modelos sin censura en entornos controlados: la variante "uncensored" permite estudiar comportamientos del modelo sin rechazos de alineacion, util en investigacion de seguridad y robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona "resultados medidos" del modo memoria de V15 sobre la variante FP8, pero no incluye cifras concretas en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 51 GB de pesos en precision original (repo de 55,6 GB); unos 28,5 GB en la variante FP8. A esto hay que sumar la cache KV, los eventos de memoria en disco y el estado recurrente.
- GPU recomendadas: no se especifican en la informacion disponible. Por volumen de pesos, la version FP8 requiere GPUs de 40-48 GB o superiores (A100 80 GB, H100, L40S 48 GB); la version sin cuantizar exige 80 GB o multi-GPU.
- Cabe en GPU de consumo: la variante FP8 no cabe en RTX 4090 (24 GB); no se documenta ninguna cuantizacion por debajo de FP8.
- Despliegue: exclusivamente mediante la imagen Docker `lovewin10/sglang-v15:nightly-dev-cu13-20260924-ffac53d7-v15` (SGLang modificado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que la variante FP8 decodifica mas rapido y que CUDA graph, prefix caching y decodificacion especulativa permanecen activos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria persistente | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este modelo (v15) | 27,78 B | no disponible | Si, episodica en disco con modo sueno | apache-2.0 | Solo SGLang modificado (Docker) |
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored (base) | 27,78 B | no disponible | No | apache-2.0 (segun modelo base) | SGLang estandar |
| LTM-Lab/...-v14 | no disponible | no disponible | Si, con world model (predictores entrenados) | apache-2.0 | SGLang modificado |
| LTM-Lab/...-v15-FP8 | 27,78 B (FP8) | no disponible | Si, misma arquitectura V15 | apache-2.0 | SGLang modificado (Docker) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total de una imagen Docker de SGLang modificada y no estandar; no funciona con transformers estandar, vLLM, llama.cpp ni Ollama.
- La recuperacion de memoria es aproximada: un evento almacenado que solo se parece a la pregunta puede superar el voto y devolver informacion irrelevante. Preguntas que no solicitan nada del almacen pueden recuperar poco o nada.
- El modo sueno usa el propio modelo para juzgar correcciones y fusiones; errores del modelo en esas decisiones afectan a la memoria persistente (por ejemplo, retirar un hecho que no estaba obsoleto o no crear un puente necesario).
- El decaimiento de puentes no usados (factor 0,9 por sueno) puede hacer perder asociaciones relevantes tras periodos largos de inactividad.
- Modelo marcado como "uncensored": no incorpora las salvaguardas de alineacion del modelo original, lo que implica riesgo de generar contenido inapropiado y requiere filtros externos en produccion.
- Riesgo de alucinacion inherente al modelo base; la memoria no verifica la veracidad de lo almacenado, solo su recuperacion.
- No se documentan sesgos conocidos, longitud de contexto maxima ni resultados de benchmarks; la evaluacion en produccion requerira pruebas propias.
- Licencia Apache 2.0 declarada, pero el linaje de fine-tunes sobre datasets de terceros (DavidAU) conviene revisarlo antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Version anterior V14: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14
- Variante FP8: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15-FP8
- Imagen Docker SGLang modificada: https://hub.docker.com/r/lovewin10/sglang-v15
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
