# Kausp11/querylm-dclm-1.4b-sft-search

## Resumen

QueryLM 1.4B (DCLM-Edu), variante search fine-tuned, es un modelo de lenguaje causal desarrollado por el usuario Kausp11 y publicado en Hugging Face. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base `Kausp11/querylm-dclm-1.4b`, orientado a conversacion y a la generacion de bloques de busqueda web inline. El modelo aprende a escribir consultas de busqueda dentro de un bloque delimitado por tokens especiales, de modo que un recuperador externo puede insertar el pasaje y el modelo continuar la respuesta a partir de el.

La arquitectura es un decoder de estilo nanochat con 24 capas, anchura de 2.048, 16 cabezas de atencion, feed-forward de 8.192 y dimension de cabeza de 128, con una longitud de contexto de 4.095 tokens. El modelo reporta 1.409,6 millones de parametros, aunque el repositorio almacena 2.619,1 millones en safetensors, incluyendo embeddings de valor. El tokenizador es el de SmolLM2 ampliado con cuatro tokens especiales para los bloques de busqueda, con un vocabulario de 49.156 entradas.

El modelo es relevante por su enfoque poco habitual: en lugar de depender de un framework de agentes o de tool calling estructurado, integra la busqueda como parte del texto generado, lo que simplifica la orquestacion en pipelines de recuperacion-aumentada (RAG). Es un modelo pequeno, de proposito experimental, con cero descargas y cero likes en el momento de la consulta, y sin licencia declarada, lo que limita su uso en produccion sin aclaraciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo nanochat (24 capas, anchura 2.048, 16 cabezas, FFN 8.192, head dim 128) |
| Parametros totales | 1.409,6M reportados; 2.619,1M almacenados en safetensors (incluye embeddings de valor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | No disponible (no se documentan en la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` (incluye `modeling_nanochat.py`) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo nanochat, con 24 capas, anchura de 2.048, 16 cabezas de atencion, feed-forward de 8.192 y dimension de cabeza de 128. La longitud de contexto es de 4.095 tokens. El tokenizador parte del de SmolLM2 y anade cuatro tokens especiales (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`, con ids 49152 a 49155), alcanzando un vocabulario de 49.156 entradas.

El preentrenamiento se realizo sobre DCLM-Edu, anotado con bloques de busqueda por un modelo anotador afinado (Gemma 4 E4B-it con un adaptador LoRA). El anotador marca posiciones donde una busqueda seria util (probabilidad de insercion de al menos 0,05, separadas al menos 40 caracteres) y escribe una consulta de como maximo 24 tokens. Los pasajes provienen de recuperacion BM25 sobre el corpus web publico Sphere y se acortan mediante limpieza extractiva. Una insercion solo se conserva si el pasaje solapa con el texto siguiente del documento (ROUGE-1 F1 de al menos 0,1 contra los siguientes 260 caracteres). El optimizador de preentrenamiento es Muon para pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida, con un batch de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualizacion), 40 pasos de calentamiento, programacion constante y decaimiento lineal hasta el 5% del pico. El presupuesto de preentrenamiento se detalla hasta 41.936 actualizaciones (el texto de la model card se corta en ese punto).

El ajuste fino se realizo durante una epoca sobre aproximadamente 53.000 conversaciones usuario-asistente. Aproximadamente el 64% ensenan habilidades generales de chat (subconjuntos de SmolTalk) y el 15% tool calling (subconjuntos de SmolTalk2), sin busqueda. El 21% restante son conversaciones de SmolTalk cuyos turnos del asistente fueron anotados con bloques de busqueda por el mismo pipeline que el preentrenamiento, con cada bloque movido al inicio de la frase en la que se coloco (38.436 bloques en 9.713 conversaciones). El total es de 35,2 millones de tokens empaquetados en secuencias de 4.096 tokens, con perdida sobre el texto del asistente, las consultas y el fin de turno. La perdida no cubre los tags de respuesta ni el pasaje, de modo que el modelo no genera pasajes: los aporta el llamante.

## Capacidades

- Generacion de texto causal en ingles, utilizable como modelo de lenguaje convencional sin busqueda.
- Generacion de consultas de busqueda web dentro de bloques `<WEB_QUERY>...</WEB_QUERY>` cuando se le induce con el token de apertura.
- Lectura de pasajes insertados en bloques `<WEB_RESPONSE>...</WEB_RESPONSE>` y continuacion de la respuesta a partir de ellos.
- Conversacion multi-turno en formato de texto plano con prefijos `System:`, `User:` y `Assistant:`, sin plantilla de chat (`apply_chat_template` no aplica).
- Tool calling basico, adquirido mediante subconjuntos de SmolTalk2 durante el ajuste fino.
- Generacion determinista con `do_sample=False` en los ejemplos documentados; no se documenta modo thinking ni decodificacion especulativa.
- Capacidades multilingues limitadas al ingles.
- No soporta vision, audio ni otras modalidades.

## Casos de uso

- Respuestas aumentadas por recuperacion (RAG) con orquestacion manual: el modelo escribe la consulta, un recuperador externo (BM25, API de busqueda web) devuelve un pasaje, se inserta en el bloque de respuesta y el modelo continua. Es adecuado porque el formato de busqueda esta integrado en el texto generado y no requiere un framework de agentes.
- Asistentes conversacionales de dominio acotado: con 4.095 tokens de contexto y formato de chat en texto plano, puede gestionar conversaciones multi-turno breves en ingles para soporte o FAQ, siempre que el recuperador aporte el conocimiento factual.
- Prototipado de pipelines de busqueda-agentica: sirve como banco de pruebas para estudiar como un modelo pequeno decide cuando buscar y como formula la consulta, dado su entrenamiento explicito en esa tarea.
- Investigacion sobre modelos compactos con busqueda integrada: util para comparar estrategias de anotacion de datos (anotador Gemma 4 E4B-it con LoRA, filtrado por ROUGE-1) frente a enfoques de tool calling estructurado.
- Generacion de consultas de busqueda a partir de contexto conversacional: el modelo puede producir consultas de hasta 24 tokens condicionadas por el historial, reutilizables en un motor de busqueda externo.
- Educacion y demostraciones tecnicas: por su tamano (1.409,6M reportados, 5,2 GB de repositorio) y su ejecucion en CPU en bfloat16 documentada por el autor, es viable para tutoriales y entornos sin GPU.
- Tool calling en flujos ligeros: el 15% de datos de SmolTalk2 le permite emitir llamadas a funciones basicas, aunque sin garantias de formato estricto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 2.619,1M parametros almacenados, en bfloat16 (2 bytes por parametro) se requieren aproximadamente 5,2 GB solo para pesos; en float32, unos 10,5 GB; en cuantizacion de 8 bits, unos 2,6 GB; en 4 bits, unos 1,3 GB (estimaciones teoricas, no documentadas por el autor).
- GPU recomendadas: no documentadas. Por tamano, una GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) deberia poder alojar los pesos en bfloat16; una RTX 4090 o A100/H100 aportarian margen para lotes mayores.
- Cabe en GPU consumer: si, previsiblemente en modelos con 8 GB o mas en bfloat16, y en 4-6 GB con cuantizacion (no verificado por el autor).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `modeling_nanochat.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura custom probablemente requiera adaptaciones para esos motores.
- Latencia y throughput: el autor documenta una ejecucion en CPU con bfloat16, torch 2.8.0 y transformers 4.56.0, pero no publica cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| QueryLM 1.4B SFT search (este) | 1.409,6M reportados / 2.619,1M almacenados | 4.095 | No disponible | Hugging Face, 0 descargas | Busqueda inline con tokens especiales; solo ingles |
| SmolLM2 (referencia por tokenizador) | No disponible en la informacion | No disponible | No disponible | No disponible | El tokenizador de QueryLM deriva del de SmolLM2 |
| Gemma 4 E4B-it (anotador usado en el pipeline) | No disponible en la informacion | No disponible | No disponible | No disponible | Usado con LoRA para anotar bloques de busqueda, no como modelo comparable directo |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre DCLM-Edu y SmolTalk, hereda los sesgos de esos corpus, no evaluados.
- Riesgo de alucinacion: alto en conocimiento factual, ya que el modelo no genera pasajes y depende de un recuperador externo; el ejemplo de la model card sobre Canberra incluye una afirmacion incorrecta ("largest city"), lo que evidencia que la calidad depende del pasaje insertado.
- Limitaciones de contexto: ventana de 4.095 tokens, insuficiente para documentos largos o conversaciones extensas; las consultas generadas se limitan a 24 tokens.
- Limitaciones de idioma: solo ingles; no se documenta soporte multilingue.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Dependencia de `trust_remote_code=True`: la carga ejecuta `modeling_nanochat.py` del repositorio; el autor recomienda fijar `revision=` a un commit revisado.
- Sin plantilla de chat: `apply_chat_template` no aplica; el formato es texto plano con prefijos, lo que complica la integracion con frameworks estandar.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin benchmarks publicados ni validacion externa.
- Formato de busqueda fragil: el modelo no genera pasajes y la perdida no cubre los tags de respuesta, por lo que el llamante debe insertar el bloque correctamente para que la generacion continue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-dclm-1.4b-sft-search
- Modelo base: https://huggingface.co/Kausp11/querylm-dclm-1.4b
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Corpus web Sphere (recuperacion BM25): https://github.com/facebookresearch/Sphere
