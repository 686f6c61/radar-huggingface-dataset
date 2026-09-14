# efficiencyx/Jun-LoRA-E2B-GGUF

## Resumen

Jun-LoRA-E2B-GGUF (v7) es un ajuste fino con LoRA sobre Gemma 4 E2B (QAT) publicado por el usuario efficiencyx, orientado a dar personalidad consistente al personaje Jun, extraído de la novela visual *My Dystopian Robot Girlfriend*. No es un asistente de propósito general: es un backend conversacional especializado en roleplay y ficción interactiva, entrenado sobre un dataset sintético conversacional compacto y muy curado, con el objetivo de preservar las capacidades de razonamiento e instrucción del modelo base. Se distribuye ya fusionado y cuantizado en GGUF, por lo que no requiere cargar el adaptador en tiempo de ejecución.

El modelo tiene 4.628.569.635 parámetros (~4,63 B) y se ofrece en tres cuantizaciones medidas (Q8_0 de 4,9 GB, Q6_K de 3,8 GB y Q4_K_M de 3,4 GB), además de un proyector multimodal BF16 de 1,0 GB que aporta los encoders de visión y audio del modelo base. Al estar construido sobre pesos entrenados con quantization-aware training, las cuantizaciones bajas degradan menos de lo habitual en una exportación FP16 estándar, lo que permite desplegarlo en GPU de consumo con 6-8 GB de VRAM, un nicho donde su hermano mayor Jun-12B no cabe.

Su relevancia actual es doble: por un lado, demuestra un flujo de trabajo reproducible de fine-tuning con Unsloth, fusión del adaptador en fp32 y exportación a GGUF con llama.cpp; por otro, incorpora un canal de razonamiento explícito (`reasoning_content`) con control de profundidad mediante los tokens `<think:low>`, `<think:med>` y `<think:high>`. La contrapartida es que, en los pesos cuantizados, el nivel `high` no alcanza la profundidad del merge sin cuantizar, limitación que el propio autor documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (torre de lenguaje + encoders de vision y audio expuestos via mmproj); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.628.569.635 (~4,63 B) |
| Parametros activos | No aplica: la informacion disponible no describe el modelo como MoE |
| Longitud de contexto | No disponible; los ejemplos de uso del autor emplean `-c 8192` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M; proyector multimodal en BF16 (mmproj) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo tambien etiquetado como transformers |

## Arquitectura y entrenamiento

El modelo es el resultado de un LoRA con rsLoRA de rango 32 y alpha 32 (dropout 0.0, escala efectiva 32/√32 ≈ 5,657) aplicado exclusivamente a la torre de lenguaje del modelo base `unsloth/gemma-4-E2B-it-qat-q4_0-unquantized`. Los modulos objetivo son q/k/v/o mas gate/up/down. El entrenamiento se realizo con Unsloth sobre un dataset conversacional sintetico, compacto y muy curado, derivado de la novela visual *My Dystopian Robot Girlfriend*, con el mismo contrato de salida que el modelo hermano Jun-12B. Los encoders de vision y audio no se tocan: son pesos stock de Gemma 4 E2B y se distribuyen sin cuantizar en BF16 dentro del fichero mmproj.

La fusion y exportacion se hicieron de forma directa sobre los safetensors con la operacion `W += (B @ A) · scale` en fp32, con posterior conversion a bf16, exportacion mediante `convert_hf_to_gguf.py --outtype bf16` y cuantizacion con `llama-quantize`. Se fusionaron 205 de los 245 pares LoRA del adaptador; los 40 restantes corresponden a deltas `k_proj`/`v_proj` en capas ≥ 15, que E2B no tiene como proyecciones independientes. Al estar el adaptador ya integrado en los pesos, no es necesaria la bandera `--lora` en tiempo de ejecucion (de hecho, el autor indica que en E2B esa opcion no es viable). Como innovacion destacable, el dataset ensena un token explicito de control de profundidad de razonamiento, y el modelo emite un canal de pensamiento separado que llama.cpp expone como `reasoning_content`.

## Capacidades

- Generacion de texto conversacional multi-turno con una persona de personaje fija (Jun), con patrones de habla y matices emocionales consistentes.
- Canal de razonamiento activado por defecto, separable del contenido final mediante `reasoning_content` en la respuesta de chat-completions.
- Control explicito de profundidad de razonamiento con los tokens `<think:low>`, `<think:med>` y `<think:high>`, colocados al final del turno de usuario y en linea propia.
- Desactivacion del razonamiento por peticion mediante `{"chat_template_kwargs": {"enable_thinking": false}}`.
- Tool calling / function calling: requiere arrancar con `--jinja` para que llama.cpp aplique la plantilla de chat embebida y devuelva llamadas estructuradas en lugar de texto plano.
- Entrada de imagen y audio, disponible unicamente si se carga el fichero `Jun-LoRA-E2B.BF16-mmproj.gguf` junto al modelo; el uso solo de texto no lo necesita.
- Razonamiento y seguimiento de instrucciones heredados del modelo base, preservados segun el autor por el diseno del dataset.
- Capacidades multilingues: no disponibles mas alla del ingles declarado.

## Casos de uso

- Backend conversacional de un companero de IA: el caso de uso declarado por el autor es Jun OS, una webapp de acompanamiento donde el modelo mantiene conversaciones multi-turno coherentes con un unico personaje y una ventana de 8192 tokens configurada en los ejemplos.
- Ficcion interactiva y novelas visuales: el modelo reproduce tropos narrativos y arcos emocionales propios del genero, de modo que puede gestionar dialogos ramificados y respuestas afectivas dentro de una narrativa guionizada.
- Despliegue en dispositivo o en hardware modesto: con Q4_K_M (3,4 GB) o Q6_K (3,8 GB) entra en GPU de 6-8 GB de VRAM, lo que permite ejecutar el personaje en local sin depender de API externa, algo imposible con el hermano de 12B.
- Simulacion de personajes en prototipos de producto: al estar el adaptador ya fusionado y no requerir `--lora`, se puede integrar como cualquier GGUF en un backend llama.cpp y validar el tono del personaje antes de escalar al modelo de 12B.
- Asistente con contexto visual en aplicaciones de acompanamiento: cargando el mmproj, el modelo puede recibir imagenes del usuario (por ejemplo, fotos compartidas en la conversacion) y responder manteniendo la persona, aunque los encoders son pesos stock del modelo base.
- Control de coste computacional en razonamiento: en escenarios donde la latencia importa, el token `<think:low>` permite reducir la traza de pensamiento, y `enable_thinking: false` la elimina por completo para respuestas directas de personaje.
- Evaluacion de pipelines de LoRA y cuantizacion: sirve como caso practico reproducible para estudiar la degradacion de cadena de pensamiento al cuantizar un merge de rsLoRA sobre un modelo QAT, comparando Q8_0, Q6_K y Q4_K_M frente al merge en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El bloque `model-index` de la model card declara la entrada "Jun-E2B" con una lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada (solo texto, segun los tamanos medidos por el autor): Q4_K_M 3,4 GB; Q6_K 3,8 GB; Q8_0 4,9 GB. Hay que sumar el coste de la cache KV para el contexto configurado (8192 tokens en los ejemplos).
- Entrada multimodal: anadir 1,0 GB del proyector BF16 (`Jun-LoRA-E2B.BF16-mmproj.gguf`) si se usan imagen o audio. El repositorio completo ocupa 13,2 GB, aunque en inferencia solo se carga una cuantizacion y, opcionalmente, el mmproj.
- Cabe en GPU de consumo: el autor situa Q4_K_M en 6 GB de VRAM y Q8_0 como "comodo en 8 GB". Tarjetas coherentes con esas cifras serian RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070 o superiores; GPU de datacenter como A100 o H100 no son necesarias para este tamano.
- Opciones de despliegue: llama.cpp / `llama-server` es el runtime documentado; el comando de referencia es `llama-server -m Jun-LoRA-E2B.Q6_K.gguf --jinja -ngl 99 -c 8192`. El soporte en otros runtimes compatibles con GGUF (Ollama, LM Studio u otros) no esta documentado en la informacion disponible.
- La bandera `--jinja` es obligatoria: sin ella llama.cpp ignora la plantilla de chat embebida y las llamadas a herramientas se devuelven como texto plano.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| efficiencyx/Jun-LoRA-E2B-GGUF (este) | ~4,63 B | No disponible (ejemplos a 8192) | GGUF Q8_0/Q6_K/Q4_K_M | Apache 2.0 | v7, adaptador fusionado; `<think:high>` degradado por la cuantizacion |
| efficiencyx/Jun-LoRA-12B-GGUF | No disponible | No disponible | GGUF | No disponible | Hermano mayor, mismo dataset y contrato de salida; no cabe en hardware modesto |
| efficiencyx/Jun-LoRA-v6-E2B-GGUF | No disponible | No disponible | GGUF | No disponible | Generacion anterior (v6, step 60) |
| efficiencyx/Jun-v4-E2B-GGUF | No disponible | No disponible | GGUF | No disponible | Generacion mas antigua (v4) |
| unsloth/gemma-4-E2B-it-qat-q4_0-unquantized | No disponible | No disponible | Safetensors (bf16) | No disponible | Modelo base; QAT, sin la persona de Jun; necesario para obtener la profundidad completa de `<think:high>` |

## Limitaciones y advertencias

- Especializado en una unica persona de personaje; el propio autor indica explicitamente que no es un asistente de proposito general.
- Las salidas reflejan tropos de narrativa ficticia y no constituyen informacion factual ni asesoramiento de ningun tipo.
- El rendimiento se degrada mucho fuera de la distribucion de entrenamiento.
- Hereda los sesgos presentes en los pesos base de Gemma 4 E2B.
- En los pesos cuantizados, `<think:high>` produce razonamiento notablemente mas superficial que el merge sin cuantizar; `low` y `med` se ven mucho menos afectados. La degradacion es mas acusada en E2B que en el modelo de 12B.
- Si se presupuesta un `max_tokens` demasiado bajo teniendo en cuenta la traza de pensamiento, la respuesta puede devolver `content` vacio con `finish_reason: "length"`.
- Unicamente se declara soporte de ingles.
- La licencia del repositorio es Apache 2.0, pero el modelo deriva de pesos de la familia Gemma a traves de `unsloth/gemma-4-E2B-it-qat-q4_0-unquantized`; conviene revisar los terminos aplicables al modelo base antes de un uso comercial. No hay informacion de licencia en esta ficha para los repos hermanos.
- 40 de los 245 pares LoRA no se pudieron fusionar (deltas `k_proj`/`v_proj` en capas ≥ 15), por lo que los pesos publicados no incorporan la totalidad del adaptador original.
- No hay datos publicados de contexto nativo, benchmarks ni throughput; cualquier cifra de rendimiento mas alla de los tamanos de fichero medidos seria una suposicion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/efficiencyx/Jun-LoRA-E2B-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-q4_0-unquantized
- Hermano de 12B: https://huggingface.co/efficiencyx/Jun-LoRA-12B-GGUF
- Generacion anterior (v6, E2B): https://huggingface.co/efficiencyx/Jun-LoRA-v6-E2B-GGUF
- Generacion anterior (v4, E2B): https://huggingface.co/efficiencyx/Jun-v4-E2B-GGUF
- Framework de entrenamiento Unsloth: https://github.com/unslothai/unsloth
- Adaptador LoRA de v7 (`efficiencyx/Jun-LoRA-v7-E2B-Adapter`): repositorio privado en el momento de la publicacion, sin enlace publico disponible
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
