# Baekpica/Inkling-2-Small-VQ-GGUF

## Resumen

Inkling-2-Small VQ GGUF es una cuantizacion experimental del modelo multimodal Inkling-2-Small de Thinking Machines, publicada por el usuario Baekpica. El modelo original es un transformer de tipo mixture-of-experts (MoE) con 594.000 millones de parametros totales y 17.000 millones activos, 384 expertos con enrutamiento top-8, y una ventana de contexto nativa de 1.048.576 tokens. Acepta entrada de texto e imagen y esta entrenado principalmente en ingles, coreano, chino y japones.

La aportacion de esta ficha es el formato de cuantizacion hVQ (Hessian vector quantization): los pesos de los expertos enrutados (587.070 millones de pesos) se comprimen a 12 bits por cada grupo de 8 pesos, es decir, 1,5 bits por peso efectivo, mediante un libro de codigos E4M3 de 4.096 entradas por capa y una ganancia F16 por fila. El resto de componentes (atencion, router, normas, torre de vision, embeddings) se mantiene en precisiones mas altas (Q4_K, BF16 o F32 segun el caso).

El resultado son 118,18 GB distribuidos en 52 ficheros GGUF independientes que, segun el autor, caben y se sirven en una unica DGX Spark (GB10) con 128 GB de memoria unificada a traves del runtime propietario ds4-dfm-rs. Es una release claramente experimental: la fidelidad se ha medido con forward teacher-forced, pero no se han ejecutado benchmarks de tarea, y el formato no es compatible con llama.cpp, Ollama ni Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto e imagen), 48 capas, 384 expertos con top-8, MTP drafter para decodificacion especulativa |
| Parametros totales | 594.000 millones (modelo base); 5.728.287.744 en safetensors del repo de cuantizacion |
| Parametros activos | 17.000 millones |
| Longitud de contexto | 1.048.576 tokens (nativo); K/V en NVFP4 residente hasta 262.144 posiciones, mas alla en fichero SSD |
| Tipos de cuantizacion | Expertos enrutados GVQ1 12-bit (1,5 bits/peso efectivo, hVQ); atencion y head Q4_K; router, normas, convoluciones y torre de vision BF16/F32; drafter Q8_0; embedding BF16; K/V en NVFP4 |
| Idiomas soportados | Ingles, coreano, chino, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (52 partes independientes, no splits numerados), mas `release.json` con SHA-256 por parte |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas y 384 expertos por capa, de los cuales se activan 8 por token (top-8), lo que da 17.000 millones de parametros activos sobre 594.000 millones totales. Incorpora atencion completa en 8 capas (cuyas K/V se almacenan en NVFP4), un router en BF16, normas y convoluciones en BF16/F32, y una torre de vision ViT de 23 capas con su merger correspondiente. Dispone ademas de un drafter MTP (multi-token prediction) de 5 capas con cabeza de Markov, empleado para decodificacion especulativa.

Esta release concreta no reentrena el modelo: cuantiza los pesos de los expertos enrutados del checkpoint `thinkingmachines/Inkling-2-Small-MXFP8` (commit `086a047e8b7ff2ac902dd52355328ddb66b16914`). La innovacion tecnica es el esquema hVQ: cada vector de 8 pesos de una fila de experto se representa como un unico indice de 12 bits en un libro de 4.096 palabras de codigo E4M3 por capa, multiplicado por una ganancia F16 por fila. La asignacion de codigos se hace con realimentacion de error a traves de la correlacion de entrada de cada experto (enfoque tipo Hessian). Los hiperparametros usados son `t = 1`, damping 0 y shrink de 4.096 tokens, heredados de la release hVQ de DeepSeek V4.1 sin reajuste. La calibracion emplea 3.620.637 tokens de texto (2.723 secuencias, 21 dominios) y 234 imagenes (162.819 tokens), con conjuntos de validacion disjuntos.

## Capacidades

- Generacion de texto y razonamiento multi-turno con modo de pensamiento (thinking).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con imagenes de hasta 4.096 pixeles por lado (10.609 tokens); lados mayores se reducen a 4.096.
- Soporte de tool calling / function calling, segun el autor probado en las cuatro superficies de API del runtime.
- Capacidades de agente y razonamiento multi-paso (etiqueta `multi-step reasoning` implicita en el soporte de herramientas y thinking).
- Decodificacion especulativa mediante drafter MTP (DSpark) integrado.
- Contexto extremo de 1.048.576 tokens con gestion de K/V en NVFP4 y offload a SSD.
- Multilinguee en ingles, coreano, chino y japones.
- Capacidad de vision a traves de torre ViT de 23 capas.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: el contexto de 1.048.576 tokens permite procesar manuales, informes anuales o expedientes completos con figuras y tablas en una sola pasada, sin trocear el contenido ni perder referencias cruzadas entre secciones.
- Agentes de codigo con tool calling: el modelo puede invocar funciones, ejecutar pasos intermedios y razonar sobre resultados dentro de un bucle de agente, apoyandose en el modo thinking para descomponer tareas y en la decodificacion especulativa para reducir latencia en respuestas largas.
- Asistencia multimodal en atencion al cliente: interpretacion de capturas de pantalla, facturas o fotografias enviadas por el usuario junto con texto de consulta, manteniendo el historial de conversacion en una ventana de contexto amplia.
- Procesamiento de imagenes tecnicas o medicas de alta resolucion: la admision de hasta 4.096 pixeles por lado (10.609 tokens por imagen) permite leer diagramas, radiografias o planos con detalle suficiente para tareas de descripcion y extraccion.
- Despliegue en hardware de borde con memoria unificada: al caber en una DGX Spark (GB10) de 128 GB, habilita inferencia de un MoE de 594.000 millones en una estacion de trabajo monoplaza, util para prototipado y entornos con restricciones de espacio o consumo.
- Investigacion sobre cuantizacion extrema: el formato hVQ a 1,5 bits por peso en los expertos sirve como banco de pruebas para estudiar la degradacion de fidelidad (KL 0,163, top-1 88,1 %) y para comparar esquemas de cuantizacion vectorial frente a escalar en modelos MoE grandes.
- Traduccion y generacion multilinguee entre ingles, coreano, chino y japones, con contexto largo para documentos paralelos o memorias de traduccion extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor lo indica explicitamente: solo se han medido metricas de fidelidad con forward teacher-forced y de velocidad en DGX Spark.

| Metrica | Valor medido | Referencia |
|---|---|---|
| KL en posiciones generadas (texto) | 0,163 | frente al modelo original |
| Mismo top-1 (texto) | 88,1 % | frente al modelo original |
| NLL texto (referencia forward) | 0,849 → 0,987 | original vs cuantizado |
| KL imagenes retenidas | 0,088 | frente al modelo original |
| Mismo top-1 (imagenes) | 95,3 % | frente al modelo original |
| NLL texto en DGX Spark (ds4-dfm-rs) | 0,9869 por token generado | referencia forward 0,9873; original 0,8492 |
| Top-1 texto en DGX Spark | 74,8 % de posiciones generadas | — |
| NLL imagenes en DGX Spark | 0,699 | referencia forward 0,694; original 0,688 |
| Prefill (DGX Spark) | 1.428,9 tok/s | contexto 2K–64K, sin drafter |
| Decode (DGX Spark) | 31,53 tok/s | contexto 2K–64K, sin drafter |
| Prefill a frontera 258K | 846,2 tok/s | — |
| Decode a frontera 258K | 24,63 tok/s | — |
| Mejora con dos borradores DSpark | +9,5 % | peticiones greedy |

## Requisitos de hardware

- VRAM/memoria estimada: 118,18 GB (110,1 GiB) para el conjunto completo de pesos; requiere memoria unificada o VRAM de al menos 128 GB para mantener todo residente. La torre de vision (0,61 GiB) se mapea bajo demanda solo al codificar imagenes.
- GPU recomendadas: DGX Spark (GB10) con 128 GB, unica plataforma validada por el autor. No se documenta soporte en A100, H100 ni RTX 4090; un H100 de 80 GB no tendria capacidad para los pesos completos.
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) al necesitar 110 GiB solo de pesos.
- Opciones de despliegue: exclusivamente ds4-dfm-rs (rama `main`, PRs #151, #152, #153 y #161 para las velocidades indicadas) sobre CUDA en DGX Spark. llama.cpp, Ollama y Transformers no leen este formato.
- Latencia y throughput: prefill de 1.428,9 tok/s y decode de 31,53 tok/s en el rango 2K–64K; a 258K de contexto, 846,2 tok/s de prefill y 24,63 tok/s de decode. El drafter DSpark anade un 9,5 % en peticiones greedy.
- Almacenamiento: el contexto por encima de 262.144 posiciones se gestiona mediante un fichero de K/V en SSD, por lo que se requiere almacenamiento rapido adicional para contextos extremos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Small VQ GGUF (esta ficha) | 594B | 17B | 1.048.576 | Apache 2.0 | GGUF hVQ, solo ds4-dfm-rs | Hugging Face, 21.083 descargas |
| Inkling-2-Small (original) | 594B | 17B | 1.048.576 | Apache 2.0 | safetensors (BF16/MXFP8) | Hugging Face, thinkingmachines |
| Otras cuantizaciones GGUF de gran tamano | no disponible | no disponible | no disponible | no disponible | GGUF estandar | no disponible |

No se dispone de datos de benchmarks de tarea para comparar el rendimiento cualitativo con alternativas de la misma categoria. La comparacion se limita a parametros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- Release experimental: el autor la etiqueta como tal; no se han ejecutado benchmarks de tarea y la generacion muestreada solo se comprobo en un conjunto pequeno con semilla fija.
- Degradacion de fidelidad medible: NLL de texto pasa de 0,849 a 0,987 y el top-1 coincide en el 88,1 % de posiciones en forward de referencia; en el runtime real (DGX Spark) el top-1 baja al 74,8 % de posiciones generadas. En imagenes, el NLL sube de 0,688 a 0,699.
- Riesgo de alucinacion: inherente a todo modelo de lenguaje; la cuantizacion agresiva de los expertos puede incrementar la probabilidad de errores en tareas de razonamiento fino o de conocimiento factual.
- Compatibilidad muy restringida: solo funciona con ds4-dfm-rs sobre DGX Spark (GB10) con CUDA; no es utilizable con llama.cpp, Ollama, vLLM, TGI ni Transformers.
- Requisito de hardware especifico: 128 GB de memoria unificada; no cabe en GPUs de consumo ni en aceleradores de 80 GB.
- Idiomas limitados a ingles, coreano, chino y japones; no se documenta soporte de espanol ni de otras lenguas.
- Contexto extremo dependiente de SSD: por encima de 262.144 posiciones el K/V se escribe en disco, lo que puede degradar la latencia y exigir almacenamiento de alta velocidad.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, pero el modelo base puede reflejar sesgos de sus datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la viabilidad practica esta limitada por el hardware y el runtime propietario necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Baekpica/Inkling-2-Small-VQ-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8 de origen: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8/tree/086a047e8b7ff2ac902dd52355328ddb66b16914
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- PR #151 del runtime: https://github.com/Baekpica/ds4-dfm-rs/pull/151
- PR #152 del runtime: https://github.com/Baekpica/ds4-dfm-rs/pull/152
- PR #153 del runtime: https://github.com/Baekpica/ds4-dfm-rs/pull/153
- PR #161 del runtime: https://github.com/Baekpica/ds4-dfm-rs/pull/161
- Release hVQ de DeepSeek V4.1 (referencia de hiperparametros): https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF#how-t-was-chosen
- Foro de discusion: https://huggingface.co/Baekpica/Inkling-2-Small-VQ-GGUF/discussions
