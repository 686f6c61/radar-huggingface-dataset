# sanghwa-na/bobcat-flash-1.2

## Resumen

Bobcat Flash 1.2 es un modelo de decisiones tipadas ("typed decisions") desarrollado por sanghwa-na (proyecto foxl-ai) y publicado bajo licencia Apache-2.0. No es un modelo generativo: recibe un estado (texto o JSON) y un conjunto de preguntas cuyas respuestas posibles define quien hace la peticion, y devuelve unicamente una probabilidad para cada respuesta nombrada. Internamente lee los logits de los candidatos ofrecidos en la primera posicion de respuesta de un unico forward pass, y el host construye una respuesta JSON cerrada a partir de los nombres del usuario. Segun el autor, una respuesta puede ser incorrecta, pero no puede estar mal formada.

El modelo es un fine-tuning de google/gemma-4-26B-A4B-it (revision 4d7ae4984b7db7de8f8457170b3f1a419ee76d52), un transformer disperso de mezcla de expertos (MoE) con 25.805.936.206 parametros totales y unos 4B activos por token. El repositorio contiene pesos BF16 listos para servir (51,6 GB) y esta pensado para desplegarse con vLLM 0.30.0 en FP8, con una ventana de hasta 98.368 tokens sin truncado. Existe un repositorio hermano con pesos FP8 y una demo en un Space de Hugging Face.

Su relevancia reside en el nicho de clasificacion y guardrails con esquema cerrado: expone las primitivas Choice (1 a 255 candidatos nombrados), Noul (P(true) con significados opcionales de verdadero y falso) y Score (1 a 10 niveles ordenados con probabilidad por nivel). El autor reporta 93,92 % en un conjunto final sellado de cuatro tareas y una reduccion de la tasa de exito de ataques de inyeccion de respuestas incorrectas del 31,1 % (base sin entrenar) al 8,2 %. Con 18 descargas y 0 likes, es un modelo muy reciente y de adopcion todavia minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso de mezcla de expertos (MoE); fine-tuning de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.805.936.206 (unos 25,8 B) |
| Parametros activos | Unos 4 B por token (nomenclatura A4B del modelo base) |
| Longitud de contexto | 98.368 tokens configurados en servidor (`--max-model-len 98368`); probado sin fallos ni rechazos con entradas de hasta 96.161 tokens |
| Tipos de cuantizacion | BF16 (pesos de este repositorio), FP8 al cargar en vLLM; repositorio separado `bobcat-flash-1.2-fp8` |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), libreria transformers |
| Modelo base | google/gemma-4-26B-A4B-it (revision 4d7ae4984b7db7de8f8457170b3f1a419ee76d52), relacion: finetune |
| Tamano del repositorio | 51,6 GB |
| Pipeline declarado | zero-shot-classification |
| API | Formas de TypeSafe System One HTTP API; compatible con `typesafe-sdk` 0.7.1 cambiando la URL base |
| Fecha de publicacion | 2026-10-07 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un MoE disperso de la familia Gemma 4, con 25,8 B de parametros totales y aproximadamente 4 B activos por token. Sobre esa base, Bobcat Flash 1.2 anade un "compilador" propio (incluido en el repositorio, en el subdirectorio `bobcat-flash-1.2/compiler`) que transforma el estado y las preguntas del usuario en la secuencia que se evalua en un unico forward pass. El modelo no decodifica texto: lee los logits de los candidatos nombrados en la primera posicion de respuesta y los normaliza a probabilidades. Las temperaturas de lectura documentadas para cada primitiva son 0,594604 (choice), 0,353553 (noul) y 0,529732 (score).

La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero si lista las fuentes utilizadas, que combinan clasificacion y NLI en ingles y coreano (klue/klue, kakaobrain/kor_nli, e9t/nsmc, nyu-mll/multi_nli, stanfordnlp/snli, google/boolq, allenai/ai2_arc, clinc/clinc_oos, PolyAI/banking77, AmazonScience/massive), preferencia y evaluacion de respuestas (nvidia/HelpSteer2, nvidia/HelpSteer3, OpenAssistant/oasst2, Anthropic/hh-rlhf), matematicas (openai/gsm8k) y veracidad (truthfulqa/truthful_qa). Los tags del repositorio mencionan calibracion y destilacion como tecnicas empleadas. No se documentan detalles de RLHF o DPO ni innovaciones de atencion (atencion lineal, decodificacion especulativa) mas alla de la propia lectura tipada de logits.

## Capacidades

- Clasificacion de eleccion multiple cerrada: devuelve el nombre ganador y una probabilidad para cada uno de los 1 a 255 candidatos definidos por el usuario, con descripciones opcionales por candidato.
- Decision booleana tipada (primitiva Noul): calcula P(true) permitiendo definir el significado de verdadero y falso.
- Puntuacion ordinal (primitiva Score): estima el nivel esperado en una escala ordenada de 1 a 10 y da una probabilidad por nivel.
- Respuesta siempre bien formada: al no generar texto libre, la salida es un JSON cerrado construido por el host con los nombres aportados por el usuario.
- Contexto largo: lee estados de hasta 96.161 tokens sin truncar y rechaza con HTTP 422 las entradas que superan los limites del servidor, en lugar de recortarlas.
- Multilingue limitado a ingles y coreano.
- Robustez frente a inyeccion de respuestas: el autor reporta 8,2 % de exito de ataques que introducen una respuesta incorrecta dentro del estado, frente al 31,1 % de la base sin entrenar.
- Servido en produccion con vLLM en FP8, con soporte de peticiones concurrentes y batching.
- No soporta generacion de texto libre, ni tool calling clasico, ni razonamiento multi-paso autonomo: su contrato es una unica pasada de decision.
- Los tags del repositorio incluyen image-text-to-text (heredado del modelo base Gemma 4), pero la documentacion describe exclusivamente entradas de texto o JSON.

## Casos de uso

- Guardrails y moderacion de contenido: el servidor puede recibir un mensaje de usuario y un conjunto de categorias de politica nombradas, devolviendo la probabilidad de cada una. La salida JSON cerrada evita tener que parsear texto libre en un punto critico del pipeline.
- Enrutamiento de tickets de soporte: con candidatos derivados de taxonomias como banking77 o clinc_oos, el modelo asigna cada ticket a una intencion con una probabilidad asociada, lo que permite derivar a revision humana los casos de baja confianza.
- Deteccion de intenciones en asistentes conversacionales bilingues (en/ko): la cobertura de AmazonScience/massive en el entrenamiento encaja con el enrutado de consultas en ingles y coreano.
- Enrutado de herramientas en agentes: usar la primitiva Choice para elegir entre las herramientas disponibles de un agente (hasta 255 candidatos), dejando que el orquestador ejecute la seleccionada; el modelo solo decide, no ejecuta.
- Extraccion de decisiones con esquema fijo en pipelines JSON: al no poder generar texto libre, encaja en sistemas donde cada respuesta debe validar contra un esquema y donde una salida mal formada rompe el flujo.
- Analisis de sentimiento, NLI y verificacion sobre documentos largos: estados de decenas de miles de tokens (informes, contratos, hilos completos) clasificados contra pares de hipotesis o etiquetas de sentimiento, con degradacion medida de solo 4,3 puntos a 92K tokens.
- Evaluacion de calidad de respuestas de otros LLM: la primitiva Score (1-10) permite puntuar salidas en pipelines de datos o de anotacion, en la linea de los datasets HelpSteer2 y HelpSteer3 usados en el entrenamiento.
- Verificacion de afirmaciones: con la primitiva Noul, calcular P(true) de una afirmacion dado un contexto, util en pipelines de fact-checking o de filtrado de alucinaciones de otros modelos.

## Benchmarks y rendimiento

| Prueba | Bobcat Flash 1.2 | Referencia declarada |
|---|---:|---|
| Conjunto final sellado, cuatro tareas (1.609 decisiones, abierto una vez) | 93,92 % | Bobcat Flash 1.1: 93,12 % (+0,80 [-0,09, +1,79]); umbral de publicacion: 92,21 % |
| Evaluacion de desarrollo de seis tareas (3.188 decisiones) | 92,21 % | misma base zero-shot: 86,6 % |
| Ejemplos de flujo publicados por TypeSafe (329 preguntas), acuerdo con la referencia | 90,27 % | Jev: 90,9 % (dato publicado por TypeSafe); misma base zero-shot: 89,67 % |
| Respuesta incorrecta nombrada dentro del estado (300 preguntas x 3 ataques) | 8,2 % | misma base zero-shot: 31,1 % |
| Estados largos: exactitud a 30K / 61K / 92K tokens frente a sin relleno (1.200 / 300 / 300 preguntas) | -2,3 / -4,3 / -4,3 pt | Bobcat Flash 1.1: -10,8 / -14,3 / -16,0 pt |
| Entradas de 96K tokens (240 preguntas de hasta 96.161 tokens) | 0 fallos, 0 rechazos | Una RTX PRO 6000 y una B200, `--max-model-len 98368` |
| Elementos publicos de JevBench (231), reconstruccion propia del metodo v1.6, no puntuacion oficial | 68,2 | misma base zero-shot: 67,5; Quyet-1.0-Large: 75,5 (medicion propia del autor) |
| Una decision (512 tokens, 8 candidatos), p50 / p95 del motor | 25,2 / 25,6 ms | Una RTX PRO 6000, vLLM 0.30.0, FP8 (H100: 19,0 / 19,5 ms) |
| Rendimiento con peticiones independientes de 1K tokens | 48.545 tokens/s | Misma GPU, 512 peticiones concurrentes (H100: 63.080 tokens/s) |

El autor indica que las cifras de Jev provienen de las respuestas publicadas por TypeSafe y que Jev no fue invocado. La linea base "misma base" es Gemma 4 26B-A4B-it sin entrenar con el mismo compilador y lectura. No se han publicado resultados en la informacion disponible para benchmarks academicos estandar como MMLU, HumanEval o GSM8K, pese a que gsm8k figura entre los datasets de entrenamiento.

## Requisitos de hardware

- Pesos en BF16: unos 51,6 GB en disco, por lo que la inferencia en BF16 requiere al menos 80 GB de VRAM para los pesos, mas la cache KV (A100 80 GB, H100 80 GB, B200).
- Pesos en FP8: el repositorio FP8 reduce el peso a aproximadamente la mitad, pero sigue necesitando margen para cache KV con contextos de 96K tokens. El despliegue documentado usa una RTX PRO 6000 Blackwell de 96 GB.
- GPU consumer: no documentado. Como estimacion a partir del tamano de pesos, 52 GB en BF16 y aproximadamente 26 GB en FP8 exceden los 24 GB de una RTX 4090 o RTX 5090, por lo que no es desplegable en GPU consumer tipica sin cuantizaciones mas agresivas no publicadas.
- Alternativa documentada: el autor probo el mismo comando de servidor en una B200, con resultados de 96K tokens sin fallos.
- Despliegue: vLLM 0.30.0 como motor principal, con `--quantization fp8`, `--max-num-seqs 64`, `--max-model-len 98368`, `attention_backend=TRITON_ATTN` y `max_num_batched_tokens=16384`; el servidor se arranca con `python -m bobcat.flash_server`. Dependencias: fastapi, uvicorn, scipy, jinja2, tokenizers>=0.21, huggingface_hub y typesafe-sdk 0.7.1.
- No hay soporte documentado para llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia: 25,2 ms de mediana y 25,6 ms de p95 por decision de 512 tokens con 8 candidatos en una RTX PRO 6000 en FP8; 19,0 / 19,5 ms en una H100. En el ejemplo con el SDK por HTTP en loopback, mediana de 0,27 s por caso.
- Rendimiento: 48.545 tokens/s en una RTX PRO 6000 con 512 peticiones concurrentes de 1K tokens, y 63.080 tokens/s en una H100 en la misma configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bobcat Flash 1.2 | 25,8 B totales, ~4 B activos (MoE) | 98.368 tokens | 93,92 % en conjunto final sellado; 92,21 % en desarrollo de seis tareas | Apache-2.0 | Pesos BF16 y FP8 en Hugging Face, codigo en GitHub |
| Bobcat Flash 1.1 | no disponible | no disponible | 93,12 % en el mismo conjunto final; degradacion de -10,8 / -14,3 / -16,0 pt en estados largos | no disponible | Version anterior del mismo proyecto |
| google/gemma-4-26B-A4B-it (base sin entrenar, mismo compilador y lectura) | 25,8 B totales, ~4 B activos (MoE) | Segun el modelo base | 86,6 % en desarrollo de seis tareas; 89,67 % en los ejemplos de TypeSafe; 31,1 % de exito de inyeccion | Apache-2.0 | Publico en Hugging Face |
| Jev (TypeSafe) | no disponible | no disponible | 90,9 % publicado en sus propios ejemplos de flujo | no disponible | Comercial, no invocado en las pruebas del autor |
| Quyet-1.0-Large | no disponible | no disponible | 75,5 en JevBench (medicion del autor) | no disponible | no disponible |

No se dispone de datos suficientes para comparar con modelos de clasificacion de proposito general (por ejemplo, encoder tipo DeBERTa o XLM-R) porque la model card no publica resultados en benchmarks estandar de clasificacion.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre candidatos que define el usuario. No sirve para tareas de generacion, resumen, traduccion o chat.
- La model card reconoce explicitamente que una respuesta puede ser incorrecta; el diseno garantiza forma valida, no veracidad.
- Riesgo de inyeccion: aunque baja respecto a la base, un 8,2 % de los ataques que introducen una respuesta incorrecta dentro del estado consiguen que esa respuesta gane.
- Degradacion en contextos largos: la exactitud cae 2,3 puntos a 30K tokens y 4,3 puntos a 61K y 92K tokens respecto a entradas sin relleno.
- Idiomas: solo ingles y coreano declarados; el rendimiento en castellano u otros idiomas no esta documentado ni evaluado.
- La puntuacion de 68,2 en JevBench es una reconstruccion propia del metodo v1.6 realizada por el autor, no una puntuacion oficial, y queda por debajo del 75,5 medido para Quyet-1.0-Large.
- No se publican resultados en benchmarks academicos ampliamente aceptados (MMLU, HumanEval, GSM8K), lo que dificulta la comparacion con otros modelos.
- La licencia es Apache-2.0, pero conviene verificar las condiciones del modelo base Gemma 4 y de los datasets de destilacion antes de un uso comercial a gran escala.
- El numero maximo de candidatos por decision es 255; los estados que superan los limites del servidor se rechazan con HTTP 422 y nunca se truncan.
- Adopcion minima: 18 descargas y 0 likes en el momento de la consulta, sin historial de produccion ajeno al autor.
- La fecha de publicacion registrada (2026-10-07) y el contenido parcialmente truncado de la model card impiden verificar la documentacion completa del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanghwa-na/bobcat-flash-1.2
- Pesos FP8: https://huggingface.co/sanghwa-na/bobcat-flash-1.2-fp8
- Demo en Space: https://huggingface.co/spaces/sanghwa-na/bobcat-flash
- Codigo (compilador, servidores y evaluacion): https://github.com/foxl-ai/bobcat
- Explicacion tecnica: https://foxl.ai/blog/bobcat-typed-decisions
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- No se han encontrado otros enlaces relevantes en los resultados de busqueda web disponibles (los resultados devueltos no guardan relacion con el modelo).
