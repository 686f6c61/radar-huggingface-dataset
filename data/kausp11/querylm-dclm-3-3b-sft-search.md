# Kausp11/querylm-dclm-3.3b-sft-search

## Resumen

QueryLM 3.3B (DCLM-Edu), search fine-tuned, es la variante conversacional del modelo base `Kausp11/querylm-dclm-3.3b`, desarrollado por el usuario Kausp11. Se trata de un modelo de lenguaje causal entrenado desde cero sobre texto que incluye bloques de busqueda en linea (una consulta seguida de un pasaje recuperado), de modo que el modelo aprende a escribir consultas y a leer pasajes como parte de la generacion de texto ordinaria. Esta version concreta anade un ajuste supervisado (SFT) sobre conversaciones usuario-asistente, parte de las cuales contienen bloques de busqueda.

La relevancia del modelo reside en su enfoque: en lugar de depender de un pipeline externo de function calling para la busqueda web, el modelo integra la busqueda en el flujo de tokens mediante etiquetas especiales (`<WEB_QUERY>`, `<WEB_RESPONSE>`). El llamador ejecuta el retriever y devuelve el pasaje, y el modelo continua generando. Esto simplifica la orquestacion en agentes con busqueda.

Arquitectura tipo nanochat: decoder transformer de 32 capas, anchura 2.816, 22 cabezas, feed-forward 11.264, dimension de cabeza 128 y contexto de 4.095 tokens. El modelo reporta 3.322,3M parametros (5.539,7M almacenados, incluyendo value embeddings). Requiere `trust_remote_code=True` porque el repositorio incluye su propio `modeling_nanochat.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo nanochat (32 capas, anchura 2.816, 22 cabezas, FFN 11.264, head dim 128) |
| Parametros totales | 3.322,3M reportados (5.539,7M almacenados, incluyendo value embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bfloat16 en el ejemplo de uso) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 11,1 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de estilo nanochat con 32 capas, anchura de 2.816, 22 cabezas de atencion con dimension 128 y capa feed-forward de 11.264. El tokenizador es el de SmolLM2 ampliado con cuatro tokens especiales para bloques de busqueda (`<WEB_QUERY>` id 49152, `</WEB_QUERY>` id 49153, `<WEB_RESPONSE>` id 49154, `</WEB_RESPONSE>` id 49155), resultando en un vocabulario de 49.156 tokens.

El preentrenamiento se realizo sobre DCLM-Edu, anotado con bloques de busqueda por un modelo anotador (Gemma 4 E4B-it con adaptador LoRA). El anotador marca posiciones donde una busqueda ayudaria (probabilidad de insercion de al menos 0,05, separadas al menos 40 caracteres) y escribe una consulta de como maximo 24 tokens. Los pasajes provienen de recuperacion BM25 sobre el corpus web publico Sphere y se acortan mediante limpieza extractiva; una insercion se conserva solo si el pasaje solapa el texto posterior (ROUGE-1 F1 de al menos 0,1 contra los siguientes 260 caracteres). El optimizador fue Muon para pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida, con batches de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualizacion), 40 pasos de warmup, programacion constante y decaimiento lineal hasta el 5% del pico.

El ajuste supervisado uso aproximadamente 53.000 conversaciones usuario-asistente: un 64% para habilidades generales de chat (subconjuntos de SmolTalk), un 15% para tool calling (subconjuntos de SmolTalk2) sin busqueda, y un 21% de conversaciones SmolTalk cuyos turnos de asistente fueron anotados con bloques de busqueda por el mismo pipeline (38.436 bloques en 9.713 conversaciones). En total 35,2M tokens empaquetados en secuencias de 4.096 tokens, con perdida sobre el texto del asistente, las consultas y el fin de turno. La perdida no cubre las etiquetas de respuesta ni el pasaje, por lo que el modelo no genera pasajes: los aporta el llamador.

## Capacidades

- Generacion de texto causal en ingles, con formato de chat en texto plano mediante prefijos `System:`, `User:` y `Assistant:` (sin chat template, `apply_chat_template` no aplica).
- Busqueda integrada: el modelo escribe consultas dentro de `<WEB_QUERY>...</WEB_QUERY>` y utiliza el pasaje insertado en `<WEB_RESPONSE>...</WEB_RESPONSE>` para continuar la respuesta.
- Tool calling: entrenado con subconjuntos de SmolTalk2 (aproximadamente el 15% del SFT) para llamadas a herramientas sin busqueda.
- Conversacion multi-turno con contexto de 4.095 tokens.
- Razonamiento de un solo paso con insercion de busqueda al inicio del turno del asistente o al inicio de una frase.
- Generacion determinista disponible (`do_sample=False`) y posibilidad de desactivar la busqueda mediante `bad_words_ids` sobre el token de apertura de consulta.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Agentes de busqueda web: el modelo escribe la consulta, el sistema ejecuta un retriever (BM25, API de busqueda) e inserta el pasaje; el modelo redacta la respuesta final. Adecuado porque la busqueda esta integrada en el flujo de tokens, sin necesidad de un parser de function calling.
- Atencion al cliente con base de conocimiento: se puede insertar un pasaje recuperado de una base documental en `<WEB_RESPONSE>` y dejar que el modelo responda con ese contexto, manteniendo conversaciones multi-turno dentro de los 4.095 tokens de contexto.
- Respuesta a preguntas sobre documentacion tecnica: el pipeline recupera fragmentos relevantes y el modelo los sintetiza; el entrenamiento con pasajes de Sphere y limpieza extractiva favorece este patron.
- Asistentes con tool calling: el ajuste con SmolTalk2 permite integrar el modelo en flujos donde debe invocar herramientas externas ademas de buscar.
- Prototipado de pipelines RAG: el modelo sirve como generador en sistemas de recuperacion aumentada, con la ventaja de que la consulta de busqueda la formula el propio modelo y no un modulo separado.
- Educacion y tutoria: dado su preentrenamiento sobre DCLM-Edu, puede emplearse para explicar conceptos con apoyo de pasajes recuperados de material educativo.
- Evaluacion de retrievers: al generar consultas explicitas y legibles, permite medir la calidad del retriever comparando el pasaje insertado con la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 11 GB solo para pesos (5.539,7M parametros almacenados), mas overhead de activaciones y cache KV para 4.095 tokens.
- En cuantizacion de 8 bits: alrededor de 5,5-6 GB; en 4 bits: alrededor de 3-3,5 GB (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: A100 o H100 para despliegue en produccion con bfloat16; RTX 4090 (24 GB) suficiente para inferencia en bfloat16 de una sola instancia.
- Cabe en GPU de consumo: si, en RTX 4090 y previsiblemente en GPUs de 16 GB con cuantizacion; en 8 GB requeriria cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repositorio incluye `modeling_nanochat.py`); el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada puede requerir adaptaciones.
- Latencia y throughput: no disponibles. El ejemplo del autor se ejecuto en CPU con bfloat16 y torch 2.8.0 / transformers 4.56.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de busqueda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QueryLM 3.3B SFT search | 3.322,3M reportados (5.539,7M almacenados) | 4.095 | Busqueda integrada en tokens (`<WEB_QUERY>`/`<WEB_RESPONSE>`) | no disponible | Hugging Face, requiere `trust_remote_code` |
| SmolLM2 (tokenizador base) | no disponible en la informacion | no disponible | No integrada | no disponible | Hugging Face |
| Modelos con function calling generico | no disponible | no disponible | Mediante API de herramientas | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se documentan capacidades multilingues.
- Contexto limitado a 4.095 tokens, inferior al de modelos contemporaneos con ventanas de 32K o mas.
- Riesgo de alucinacion: el modelo no genera pasajes; si el retriever devuelve informacion irrelevante o incorrecta, la respuesta puede ser erronea. El ejemplo del autor usa un pasaje fijo y advierte que muestra la mecanica, no la precision.
- Requiere `trust_remote_code=True`, lo que ejecuta codigo del repositorio (`modeling_nanochat.py`); el autor recomienda fijar `revision=` a un commit revisado.
- No hay chat template: el formato de conversacion es texto plano con prefijos, lo que complica la integracion con frameworks que esperan plantillas estandar.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de validacion externa.
- El ajuste SFT cubre solo 35,2M tokens, un volumen reducido que puede limitar la robustez en dominios especializados.
- No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, lo que puede limitar el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-dclm-3.3b-sft-search
- Modelo base: https://huggingface.co/Kausp11/querylm-dclm-3.3b
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Corpus Sphere: https://github.com/facebookresearch/Sphere
