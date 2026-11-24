# loom-draft/ggml-org-gemma-3-1b-it-loom

## Resumen

`loom-draft/ggml-org-gemma-3-1b-it-loom` es un paquete de despliegue para el runtime Loom (ecosistema ROCm de AMD) que empaqueta el checkpoint GGUF sin modificar `gemma-3-1b-it-Q4_K_M.gguf` de Google, publicado originalmente por `ggml-org`. No es un modelo nuevo ni un fine-tune: es un artefacto de distribucion compuesto por programas `.loom` y un `model.json` que permiten servir Gemma 3 1B Instruct sobre GPUs AMD concretas (Ryzen AI Max+ 395 "Strix Halo" con gfx1151, Radeon AI PRO R9700 con gfx1201 de 32 GB y GPUs gfx1201 de 16 GB como RX 9070 XT y RX 9070).

El modelo subyacente es Gemma 3 1B Instruct, un transformer decoder-only de aproximadamente 1.000 millones de parametros desarrollado por Google DeepMind, publicado en pesos abiertos bajo licencia Gemma. La relevancia de este paquete no esta en el modelo sino en el runtime: la model card publica mediciones comparativas frente a llama.cpp ROCm y Vulkan sobre el mismo GGUF, con mejoras de hasta +12 % en decodificacion y +43 % en prefill en Strix Halo.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamano de 0.0 GB y fue creado el 24 de noviembre de 2026. Su interes es fundamentalmente como referencia de rendimiento del stack Loom sobre hardware AMD, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), empaquetado para el runtime Loom |
| Parametros totales | aproximadamente 1.000 millones (Gemma 3 1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card mide prefill hasta 16k documentos; las filas de 32k aparecen como n/a) |
| Tipos de cuantizacion | Q4_K_M (GGUF), unico checkpoint empaquetado |
| Idiomas soportados | no disponible |
| Licencia | MIT (metadatos del repo); los pesos base de Gemma conservan su licencia original de Google |
| Formato de pesos | GGUF (`gemma-3-1b-it-Q4_K_M.gguf`) mas programas `.loom` y `model.json` |
| Modelo base | `ggml-org/gemma-3-1b-it-GGUF` |
| Runtime | `hrx-loom[hf]==0.2.0` |
| Hardware objetivo | gfx1151 (Strix Halo), gfx1201 32 GB (R9700), gfx1201 16 GB (RX 9070 XT/9070) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 1B Instruct, un transformer decoder-only de Google DeepMind. La informacion proporcionada no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO especificas para esta variante de 1B. Tampoco se documentan innovaciones arquitectonicas propias de esta version mas alla de las genericas de la familia Gemma 3.

El paquete Loom no modifica los pesos: la model card indica explicitamente "unmodified GGUF checkpoint". Lo que aporta es una capa de empaquetado y configuracion de serving (presets de memoria, slabs de asignacion, modo de precarga de parametros, espera activa de finalizacion en GPU) optimizada para GPUs AMD via ROCm. El flujo de generacion del paquete se realizo con el workflow `loom-skills`, y el consumo se hace con `loom-fetch` y `loom-serve`, exponiendo una API compatible con `/v1/chat/completions` de OpenAI.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Gemma 3 1B Instruct.
- Razonamiento basico y respuesta a preguntas de dominio general, limitado por el tamano de 1B parametros.
- Generacion de codigo y matematicas simples, sin garantias de calidad propias de modelos mayores.
- Servicio HTTP compatible con la API de chat completions de OpenAI (`/v1/chat/completions`), lo que facilita integracion con clientes existentes.
- Soporte de multiples streams concurrentes: la model card reporta mediciones agregadas con 4 streams.
- Capacidades multimodales, tool calling o agentes: no disponibles o no documentadas para esta variante en la informacion proporcionada.

## Casos de uso

- Referencia de rendimiento en hardware AMD: usar el paquete para reproducir las mediciones de decode y prefill publicadas en Strix Halo, R9700 o RX 9070 XT y comparar con llama.cpp ROCm/Vulkan sobre el mismo GGUF.
- Pruebas de humo de pipelines ROCm: validar que el stack `hrx-loom` funciona correctamente en una GPU gfx1151 o gfx1201 antes de desplegar modelos mayores, dado el bajo coste de memoria de un 1B en Q4_K_M.
- Servicio de chat ligero en local: atender conversaciones de baja complejidad en un equipo con GPU integrada Strix Halo, con throughput de decodificacion cercano a 190 tok/s segun la model card.
- Procesamiento por lotes de documentos cortos: aprovechar el prefill de aproximadamente 11.000-12.000 tok/s en documentos de 1k a 8k tokens para tareas de resumen o clasificacion a granel.
- Benchmark de servidores de inferencia: comparar latencia y throughput de Loom frente a llama.cpp en el mismo hardware y mismo checkpoint, con metodologia ya documentada (mediana de 6 sesiones, cliente vs servidor).
- Entorno de desarrollo para integracion de API compatible OpenAI: usar el endpoint local para probar clientes, SDKs y flujos de aplicacion sin depender de servicios en la nube.
- Evaluacion de configuraciones de memoria: experimentar con `--pool_backing=fixed`, `--parameter_mode=preload` y slabs de estado/pesos en GPUs de 16 GB para encontrar la configuracion estable.

## Benchmarks y rendimiento

Mediciones publicadas en la model card para Strix Halo (gfx1151), comparando Loom frente a llama.cpp ROCm b1374 y llama.cpp Vulkan b12211 con el mismo GGUF:

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 168,3 | 194,5 | +5 % | 270,2 | 72 % |
| Decode tok/s, contexto 2k | 163,7 | 189,0 | +12 % | 263,7 | 72 % |
| Prefill tok/s, documento 1k | 7862,6 | 10677,3 | +36 % | 40724,2 | 26 % |
| Prefill tok/s, documento 2k | 8211,8 | 11739,8 | +43 % | 40465,1 | 29 % |
| Prefill tok/s, documento 8k | 8974,7 | 11932,0 | +33 % | 39145,5 | 30 % |
| Prefill tok/s, documento 16k | 8213,0 | 11008,0 | +34 % | 37514,3 | 29 % |
| 4 streams, decode agregado tok/s | 446,8 | 672,5 | +51 % | 1009,9 | 67 % |

No se publican resultados para contexto de 32k ni para decodificacion especulativa (marcados como n/a). Las mediciones de llama.cpp son del 13 de noviembre de 2026 (run 43376548212) y las de Loom del 17 de noviembre de 2026 (run 44088689861), sobre el mismo tipo de runner pero en jobs distintos. No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un 1B en Q4_K_M ocupa del orden de 1 GB de pesos, pero la model card no publica la cifra exacta del paquete.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y GPUs gfx1201 de 16 GB (RX 9070 XT, RX 9070).
- Configuracion de 16 GB: el preset usa `--memory_bytes=15000000000`, `--state_slab_bytes=4mib` y `--weight_slab_bytes=64mib`.
- Cabe en GPU consumer: si, en las Radeon RX 9070 XT y RX 9070 (16 GB) y en la GPU integrada Strix Halo.
- Opciones de despliegue: `loom-fetch` para materializar el paquete y `loom-serve` para servirlo; requiere `pipx install "hrx-loom[hf]==0.2.0"`. Alternativa: usar el GGUF base directamente con llama.cpp ROCm o Vulkan.
- Throughput medido en Strix Halo: 194,5 tok/s en decode con prompt corto, 11.932 tok/s en prefill de 8k y 672,5 tok/s agregados con 4 streams. Latencia no publicada de forma explicita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 3 1B Instruct (este paquete, via Loom) | ~1B | no disponible | MIT en el repo; pesos Gemma con su licencia | GGUF Q4_K_M + `.loom` | Optimizado para AMD ROCm/gfx1151/gfx1201 |
| Gemma 3 1B Instruct (via llama.cpp) | ~1B | no disponible | idem | GGUF Q4_K_M | Referencia de comparacion en la propia model card; menor throughput en Strix Halo |
| Otros modelos de ~1B | no disponible | no disponible | no disponible | no disponible | No se proporcionan alternativas comparables en la informacion |

La unica comparativa con datos concretos es frente a llama.cpp sirviendo el mismo checkpoint, ya recogida en la tabla de benchmarks.

## Limitaciones y advertencias

- El paquete no aporta ninguna mejora de calidad sobre Gemma 3 1B Instruct: los pesos son identicos al GGUF original.
- Un modelo de 1B parametros tiene capacidad limitada de razonamiento, conocimiento factual y generacion de codigo; el riesgo de alucinacion es alto en tareas que requieran precision.
- La licencia MIT figura en los metadatos del repositorio, pero los pesos base de Gemma estan sujetos a la licencia de Google; conviene verificar los terminos aplicables antes de un uso comercial.
- La model card no documenta idiomas soportados, sesgos conocidos ni evaluaciones de seguridad.
- El contexto maximo no esta documentado; las mediciones de prefill llegan hasta 16k y las filas de 32k aparecen como n/a.
- El paquete esta atado a versiones concretas del runtime (`hrx-loom[hf]==0.2.0`) y a GPUs AMD especificas; no es portable a NVIDIA ni a otras arquitecturas sin adaptacion.
- Las mediciones comparativas se tomaron en jobs distintos para Loom y llama.cpp, sin re-medicion de llama.cpp para este paquete ni barrido de tuning en ninguno de los dos motores.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/ggml-org-gemma-3-1b-it-loom
- Modelo base en Hugging Face: https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Workflow loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Run de medicion de llama.cpp: https://github.com/loom-fun/loom-skills/actions/runs/43376548212/job/131724300498
- Run de medicion de Loom: https://github.com/loom-fun/loom-skills/actions/runs/44088689861/job/134057909384
