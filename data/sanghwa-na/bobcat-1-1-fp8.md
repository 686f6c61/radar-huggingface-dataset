# sanghwa-na/bobcat-1.1-fp8

## Resumen

Bobcat 1.1 FP8 es un checkpoint pre-cuantizado en FP8 de Bobcat 1.1, un modelo de "decision tipada" (typed-decision) desarrollado por sanghwa-na (proyecto independiente foxl.ai, no afiliado al equipo de Qwen ni a TypeSafe AI). No es un modelo generativo: recibe un estado y una serie de preguntas cuyas respuestas se nombran de antemano, y devuelve una probabilidad para cada respuesta ofrecida, leida directamente de los logits de los candidatos en la primera posicion de respuesta. Nunca produce texto libre, lo que lo convierte en una pieza cerrada y determinista para pipelines de clasificacion y guardrails.

Tecnicamente es un LoRA de rango 16 entrenado sobre Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y fusionado en el modelo base, que despues se ha cuantizado a FP8 con llm-compressor 0.14.0 en el esquema FP8_DYNAMIC. El resultado son 27.781.427.952 parametros (unos 27,78 mil millones) en un repositorio de 31,3 GB, con torre de vision (soporta entrada image-text-to-text), proyecciones Gated DeltaNet a/b sin cuantizar y un modulo MTP (multi-token prediction) que se mantiene en BF16.

Su relevancia practica esta en el coste/beneficio de la cuantizacion: mantiene el 99,5 % de las respuestas identicas al BF16 con una perdida de 0,06 puntos de precision (93,48 % frente a 93,54 %) y una latencia de 56 ms en p50 para una decision de 512 tokens con 8 candidatos, servida con vLLM 0.30.0. Idiomas soportados: ingles y coreano. Licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.8-27B (tag `qwen3_5`), con torre de vision, proyecciones Gated DeltaNet a/b y modulo MTP |
| Parametros totales | 27.781.427.952 (27,78 mil millones), segun safetensors |
| Parametros activos | no aplica; no hay informacion que indique una arquitectura MoE |
| Longitud de contexto | no disponible. La model card no declara la ventana de contexto; menciona una peticion de 27K tokens que alcanza un pico de 42,1 GiB en el motor FP8 del Space |
| Tipos de cuantizacion | FP8: pesos `float8_e4m3fn` con una escala por canal de salida y activaciones cuantizadas por token en tiempo de ejecucion, esquema FP8_DYNAMIC de compressed-tensors. No se han publicado variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | ingles (`en`) y coreano (`ko`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (FP8), repartido en `model-00001-of-00002.safetensors` y `model-00002-of-00002.safetensors`; `model_mtp.safetensors` se mantiene en BF16 |
| Tamano del repositorio | 31,3 GB |
| Tarea declarada (pipeline) | zero-shot-classification |

## Arquitectura y entrenamiento

El checkpoint es la cuantizacion del BF16 de sanghwa-na/bobcat-1.1, que a su vez es un LoRA de rango 16 entrenado sobre Qwen/Qwen3.8-27B (Apache-2.0) y fusionado en el modelo base. La model card indica explicitamente que no se uso ninguna salida de Jev ni de otro modelo profesor para entrenarlo. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo RLHF, DPO u otra fase de alineacion; esos detalles remiten a la model card principal de Bobcat 1.1 y a `THIRD_PARTY.md` en el repositorio de GitHub.

El proceso de cuantizacion se ejecuto con `scripts/fp8_quantize.py` y llm-compressor 0.14.0 en modo FP8_DYNAMIC sin datos de calibracion: 400 capas Linear pasan a FP8, mientras que `lm_head`, los embeddings, la torre de vision y las proyecciones a/b de Gated DeltaNet permanecen en BF16. La innovacion funcional no esta en la arquitectura sino en el contrato de inferencia: el modelo no decodifica tokens de texto, sino que lee las probabilidades de los candidatos nombrados por el usuario en la primera posicion de respuesta y devuelve un JSON cerrado. El identificador de modelo, la plantilla y el tokenizador los aporta el "compiler" del servidor Bobcat, que apunta al modelo base fijado; en vLLM se arranca con `--quantization none` porque el esquema FP8 se lee directamente de `config.json`.

## Capacidades

- Clasificacion zero-shot con etiquetas definidas por el usuario: devuelve una probabilidad por cada respuesta nombrada, no texto generado.
- Decision tipada con salida JSON cerrada, apta para validacion estricta en produccion.
- Entrada multimodal image-text-to-text: el tag `image-text-to-text` y la presencia de torre de vision indican soporte de imagenes junto a texto (la torre permanece en BF16).
- Clasificacion de guardrails: comprobaciones de politica sobre entradas de usuario.
- Multilinguee limitado a ingles y coreano.
- Integracion mediante el SDK oficial `typesafe-sdk` (version 0.7.1) sobre HTTP local.
- Tool calling / function calling: no disponible; el modelo no genera tokens, por lo que no puede emitir llamadas a herramientas.
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no disponible en la informacion proporcionada.
- Uso como componente de agentes: si, pero como clasificador o enrutador dentro de un pipeline, no como planificador autonomo.

## Casos de uso

- Guardrails en produccion: dado un mensaje de usuario y un conjunto de categorias de politica ("seguro", "contenido nocivo", "fuga de datos"), el modelo devuelve la probabilidad de cada etiqueta sin generar texto, lo que evita ataques por inyeccion de prompt basados en completaciones y permite umbrales auditables.
- Enrutado de consultas entre especialistas: clasificar la intencion de una peticion entre un conjunto fijo de dominios para dirigirla a un LLM generativo o a un sistema de recuperacion concreto, con latencias de decenas de milisegundos por decision (56 ms p50 medidos con 512 tokens y 8 candidatos).
- Triaje de tickets de soporte: etiquetado automatico de categoria, urgencia y equipo responsable en funcion de texto e imagenes adjuntas, gracias a la entrada image-text-to-text.
- Etiquetado y curado de datasets: preanotacion masiva con etiquetas definidas por el equipo, seguida de revision humana; el coste por ejemplo es bajo porque no se decodifica texto.
- Verificacion de salidas de otro LLM (juez binario): comprobar si una respuesta cumple un criterio nombrado ("correcta", "incompleta", "insegura") comparando probabilidades, sin necesidad de que el juez genere una justificacion.
- Cumplimiento normativo en pipelines de agentes: decidir en cada paso si una accion propuesta requiere aprobacion humana o si infringe una regla declarada, con salida JSON validable por el orquestador.
- Clasificacion de imagenes con etiquetas arbitrarias: por ejemplo, inspeccion visual de capturas de pantalla o material documental para asignar categorias definidas en el momento.
- Enrutado de idioma o variante: distinguir entre entradas en ingles y coreano antes de aplicar procesamiento especifico, dentro de los dos idiomas soportados.

## Benchmarks y rendimiento

Evaluacion realizada sobre 3.188 decisiones de desarrollo, en una RTX PRO 6000 con vLLM 0.30.0:

| Ruta de evaluacion | Precision | Task macro | Misma respuesta que BF16 |
|---|---:|---:|---:|
| Ruta de evaluacion (base BF16, adaptador sin fusionar) | 93,54 % | 93,69 % | - |
| Este checkpoint (FP8) | 93,48 % | 93,72 % | 99,5 % |

- Diferencia FP8 menos BF16: -0,06 puntos, intervalo [-0,29, +0,16].
- De las 17 respuestas que cambian, la mayoria son casi empates: en 50 filas las dos opciones principales estaban a menos de 0,1 de distancia y el 74 % de esas filas no cambia de respuesta.
- En los 20 casos de workflow de TypeSafe, el modelo servido por `bobcat.api_server` coincidio con la referencia en el 91,5 % de 329 preguntas, sin ninguna peticion fallida (la ruta de evaluacion da 92,1 %).
- Una decision de 512 tokens con 8 candidatos tarda 56 ms en p50 en el motor vLLM. Las cifras de latencia de la model card principal corresponden al checkpoint NVFP4, no a este.
- En el motor FP8 del Space, los pesos ocupan 27,7 GiB y una peticion de 27K tokens alcanza un pico de 42,1 GiB.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la informacion disponible; al no generar texto, esas metricas no son directamente aplicables.

## Requisitos de hardware

- VRAM para inferencia: los pesos FP8 ocupan 27,7 GiB; una peticion de 27K tokens alcanza un pico de 42,1 GiB, por lo que se recomienda un minimo de 48 GB de VRAM libre.
- GPU validadas: RTX PRO 6000 (configuracion usada en la evaluacion). Por soporte nativo de FP8 son adecuadas H100 80 GB, H200 y L40S 48 GB; en A100 (Ampere) vLLM puede ejecutar FP8 con kernels alternativos, con rendimiento inferior al de Ada Lovelace o Hopper.
- GPU de consumo: no cabe en las 24 GB de una RTX 4090 o RTX 3090, ya que solo los pesos superan esa cifra. Seria necesario un montaje multi-GPU (por ejemplo 2x RTX 4090, 48 GB en total) para pesos y cache KV, algo no verificado en la informacion disponible.
- Despliegue: vLLM 0.30.0 a traves del servidor oficial `bobcat.api_server` (recomendado, expone el contrato de decision tipada). `vllm serve sanghwa-na/bobcat-1.1-fp8` tambien carga el checkpoint, pero la API estandar de vLLM solo ofrece generacion de texto y no el contrato de decision tipada. Se necesita ademas `fastapi`, `uvicorn`, `scipy`, `jinja2`, `tokenizers>=0.21`, `huggingface_hub` y `typesafe-sdk==0.7.1`, con el directorio `compiler` del modelo y el fichero `bobcat-identifiers.json`.
- Ajustes usados en el servicio de referencia: `--temperature 1.2008`, `--max-num-seqs 128`, `--schedule all`, `--engine-arg max_num_batched_tokens=16384`, `--quantization none` y `VLLM_USE_FLASHINFER_SAMPLER=0`.
- Formatos alternativos: no hay soporte publicado para llama.cpp, Ollama, TGI u otros motores; el formato compressed-tensors FP8 requiere vLLM.
- Latencia y throughput: 56 ms en p50 por decision de 512 tokens con 8 candidatos en el motor vLLM; no se publica throughput agregado.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros modelos de decision tipada comparables. La comparacion mas directa es con el propio modelo base y con su version sin cuantizar:

| Modelo | Parametros | Contexto | Precision (ruta de evaluacion) | Licencia | Formato |
|---|---|---|---|---|---|
| sanghwa-na/bobcat-1.1-fp8 | 27,78 B | no disponible | 93,48 % | apache-2.0 | safetensors, compressed-tensors FP8 |
| sanghwa-na/bobcat-1.1 (BF16) | 27,78 B | no disponible | 93,54 % | apache-2.0 | safetensors BF16 |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | no aplica (no es modelo de decision tipada) | apache-2.0 | safetensors BF16 |

Frente al checkpoint BF16, esta version reduce el peso de los pesos a 27,7 GiB y es la que sirve el Space oficial, a cambio de 0,06 puntos de precision y de que el 0,5 % de las respuestas cambien (mayoritariamente en empates muy ajustados).

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera dialogos, resumenes o razonamiento en lenguaje natural queda fuera de su alcance.
- Las probabilidades dependen de los nombres exactos de los candidatos y del tokenizador; cambios en la redaccion de las etiquetas pueden alterar los resultados, y no esta documentada la sensibilidad a esa formulacion.
- Cobertura linguistica limitada a ingles y coreano; no hay datos publicados sobre su comportamiento en castellano.
- La cuantizacion se hizo sin datos de calibracion (FP8_DYNAMIC); la degradacion medida es minima, pero los cambios de respuesta se concentran en casos de casi empate, donde una diferencia de centesimas puede alterar el umbral de decision.
- La torre de vision y las proyecciones Gated DeltaNet permanecen en BF16, por lo que no toda la huella de memoria se reduce con la cuantizacion.
- No hay informacion sobre sesgos especificos, composicion del dataset de entrenamiento ni fases de alineacion; los sesgos heredados de Qwen3.8-27B y de los datos de ajuste no estan caracterizados en la informacion disponible.
- Riesgo de descalibracion fuera de distribucion: al no generar texto, no hay alucinacion en sentido clasico, pero si puede asignar alta probabilidad a una etiqueta incorrecta ante entradas alejadas de su distribucion de entrenamiento.
- La longitud de contexto no esta declarada, lo que dificulta dimensionar cache KV en produccion; el unico dato es el pico de 42,1 GiB con una peticion de 27K tokens.
- Licencia Apache-2.0, uso comercial permitido, pero el checkpoint es derivado de Qwen3.8-27B: debe conservarse el fichero LICENSE de Qwen sin modificar y el NOTICE, y los datos de entrenamiento mantienen sus propias licencias (ver `THIRD_PARTY.md`).
- Traccion practica nula en HuggingFace en la fecha de la ficha (0 descargas, 0 likes), por lo que no existe validacion independiente de terceros.
- Bobcat es un proyecto independiente, no afiliado ni respaldado por el equipo de Qwen, TypeSafe AI ni las demas companias mencionadas; se distribuye tal cual y sin garantia.
- La ruta de evaluacion referencia 3.188 decisiones internas de desarrollo, no un benchmark publico estandar, por lo que las cifras no son directamente comparables con otras publicaciones.

## Enlaces

- Modelo en HuggingFace (FP8): https://huggingface.co/sanghwa-na/bobcat-1.1-fp8
- Modelo base BF16: https://huggingface.co/sanghwa-na/bobcat-1.1
- Version anterior, bobcat-1: https://huggingface.co/sanghwa-na/bobcat-1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/sanghwa-na/bobcat
- Codigo fuente en GitHub: https://github.com/foxl-ai/bobcat
- Articulo tecnico: https://foxl.ai/blog/bobcat-typed-decisions
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/sanghwa-na/bobcat-1
- Perfil de GitHub del autor: https://github.com/didhd
