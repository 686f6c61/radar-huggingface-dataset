# loom-draft/borisbat-dasllama-formats-loom

## Resumen

`loom-draft/borisbat-dasllama-formats-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `borisbat/dasllama-formats`, que a su vez contiene `Llama-3.2-1B-Instruct-Q4_K_M.gguf` (la variante cuantizada Q4_K_M de Llama 3.2 1B Instruct de Meta). No es un modelo nuevo ni un ajuste fino: es un artefacto de empaquetado que adapta un GGUF existente al runtime Loom de AMD, orientado a las GPU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle. Su interes es practico: ofrece una via de servir Llama 3.2 1B en hardware AMD con una API compatible con OpenAI (`/v1/chat/completions`) y soporte de tool calling, junto con mediciones de rendimiento frente a llama.cpp ROCm sobre Strix Halo.

La relevancia es acotada: se trata de un artefacto de distribucion con 0 descargas y 0 likes en el momento de la consulta, pensado para validar el stack Loom en GPU integradas y de escritorio de AMD. El modelo subyacente es un transformer denso de 1.230 millones de parametros con 128.000 tokens de contexto, licencia MIT en el empaquetado y pesos en GGUF Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 1B Instruct, empaquetado para el runtime Loom) |
| Parametros totales | 1.230 millones (modelo base Llama 3.2 1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (modelo base Llama 3.2 1B); el benchmark usa contextos de hasta 32k |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Llama 3.2 soporta oficialmente 8 idiomas, pero la model card no lo declara) |
| Licencia | MIT (empaquetado); el modelo base Llama 3.2 se rige por la Llama 3.2 Community License |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programa `.loom` + `model.json` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-serve`, `loom-fetch`) |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | soportado (OpenAI-style `tools` y `tool_calls`) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 1B Instruct, un transformer denso con atencion por grupos (GQA) y tokenizador BPE de Llama 3, entrenado por Meta con datos hasta diciembre de 2023 y sometido a un pipeline de ajuste supervisado y RLHF con preferencia humana. La model card del paquete no aporta detalles adicionales sobre el entrenamiento: no indica numero de tokens, composicion del dataset ni tecnicas de alineamiento mas alla de lo que corresponde al modelo original.

La innovacion tecnica de este artefacto no esta en los pesos, sino en el empaquetado: Loom compila el GGUF en programas `.loom` que se ejecutan sobre el runtime `hrx-loom` con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). El paquete incluye ademas la opcion de espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo en la GPU y que es la configuracion usada en las mediciones de rendimiento. No se menciona decodificacion especulativa: la model card indica explicitamente que no hay cabecera MTP en el GGUF ni drafter publicado para este modelo, por lo que las filas de drafting figuran como "n/a".

## Capacidades

- Generacion de texto conversacional en formato chat, servida mediante una API compatible con OpenAI.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), lo que permite integrar el modelo en flujos de function calling.
- Razonamiento basico y respuesta a instrucciones, heredados de Llama 3.2 1B Instruct.
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidad limitada por el tamano de 1B; no hay benchmarks publicados en la informacion disponible).
- Ventana de contexto larga (128k en el modelo base), con rendimiento medido hasta 32k tokens.
- Capacidades multilingues: no declaradas en la model card; el modelo base Llama 3.2 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes, pero el paquete no lo confirma.
- Sin vision, audio ni modo "thinking": el paquete solo expone chat y tool calling.

## Casos de uso

- Servicio de chat local en GPU AMD: desplegar `loom-serve` en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 para ofrecer un endpoint `/v1/chat/completions` en local, sin dependencia de la nube, con un modelo de 1B cuantizado que cabe holgadamente en memoria unificada o en 32 GB de VRAM.
- Asistente de codigo ligero en el editor: el modelo puede completar fragmentos y responder preguntas sobre APIs gracias a su contexto de 128k (medido hasta 32k), con latencia de decodificacion de ~225 tok/s en Strix Halo, suficiente para autocompletado interactivo.
- Procesamiento por lotes de documentos: con velocidades de prefill de hasta 10.630 tok/s en documentos de 2k tokens y 5.104 tok/s en documentos de 32k, resulta adecuado para clasificar, resumir o extraer entidades de lotes de textos cortos y medianos en una sola GPU integrada.
- Agente con tool calling en local: usar la API OpenAI-style `tools`/`tool_calls` para conectar el modelo a funciones externas (busqueda, calculo, consultas a bases de datos) en prototipos de agentes que deban ejecutarse en hardware AMD sin salir del equipo.
- Evaluacion y desarrollo del stack Loom: servir este paquete como referencia para medir el rendimiento del runtime `hrx-loom` frente a llama.cpp ROCm en gfx1151, con las cifras de la model card como linea base reproducible.
- Multiples peticiones concurrentes: con 4 streams el paquete alcanza 780,7 tok/s agregados en Strix Halo (frente a 554,8 de llama.cpp), lo que permite atender varias conversaciones simultaneas en un solo equipo para demos o entornos de desarrollo.
- Despliegue en estaciones de trabajo con R9700: para equipos con Radeon AI PRO R9700 de 32 GB, el paquete ofrece un modelo pequeno con amplio margen de memoria para contexto largo, aunque las mediciones en esa GPU aun no se han re-medido segun la model card.

## Benchmarks y rendimiento

La model card incluye mediciones comparativas frente a llama.cpp ROCm `llamacpp-rocm/b1374` sobre Strix Halo (gfx1151), con el mismo GGUF, mismas prompts y mismo runner. Valores en tokens por segundo:

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode, prompt corto | 204,7 | 225,0 | +10 % |
| Decode, contexto 2k | 188,3 | 193,6 | +3 % |
| Decode, contexto 32k | 102,4 | 96,4 | -6 % |
| Prefill, documento 1k | 7.283,8 | 10.010,0 | +37 % |
| Prefill, documento 2k | 7.282,0 | 10.630,8 | +46 % |
| Prefill, documento 8k | 6.370,0 | 9.297,5 | +46 % |
| Prefill, documento 16k | 5.154,9 | 7.077,2 | +37 % |
| Prefill, documento 32k | 3.547,9 | 5.104,7 | +44 % |
| 4 streams, decode agregado | 554,8 | 780,7 | +41 % |
| Decodificacion especulativa | n/a | n/a | n/a |

Metodologia declarada: mediana de 6 sesiones (cada sesion es la mediana de sus muestras; 3 muestras para decode_2k, decode_32k y prefill_8k, una muestra para el resto; 4 streams es mediana de 3), medida el 2026-11-26 en runners AMD DevLab Dispatch (X2-LA03-S03-D06) con hrx-loom 0.2.0. Sin barrido de tuning en ninguno de los dos motores. Los margenes dentro de +-3 % se consideran empate. En Radeon AI PRO R9700 (gfx1201) los resultados "no se han re-medido todavia".

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un GGUF Q4_K_M de un modelo de 1,23B ocupa aproximadamente 0,8-1 GB de pesos; con contexto de 32k y el pool fijo de Loom, el consumo real es mayor pero no se detalla en la model card. Cabe sin problema en los 32 GB de la R9700 y en la memoria unificada del Strix Halo.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU compatibles.
- GPU de consumo: el modelo cabe en cualquier GPU consumer con 4 GB o mas de VRAM, pero el paquete Loom solo declara soporte para las dos GPU AMD anteriores; no se confirma compatibilidad con RTX 4090, A100 ni H100.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: en Strix Halo, 225 tok/s de decode en prompt corto, 193,6 tok/s a 2k de contexto y 96,4 tok/s a 32k; prefill entre 5.104 y 10.630 tok/s segun tamano; 780,7 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| borisbat-dasllama-formats-loom (este paquete) | 1,23B | 128k (medido hasta 32k) | GGUF Q4_K_M empaquetado en Loom; runtime hrx-loom 0.2.0 | MIT (empaquetado) | Solo GPU AMD Strix Halo y R9700; 0 descargas |
| borisbat/dasllama-formats (modelo base del paquete) | 1,23B | 128k | GGUF Q4_K_M | no disponible | Mismo checkpoint sin empaquetar; es el origen del artefacto |
| Llama 3.2 1B Instruct (Meta) | 1,23B | 128k | safetensors, GGUF (multiples cuantizaciones) | Llama 3.2 Community License | Modelo original; amplio soporte en llama.cpp, vLLM y Ollama |
| llama.cpp ROCm b1374 (motor de referencia) | no aplica | configurable (`-c 65536`) | GGUF nativo | MIT | Motor de comparacion en los benchmarks; menor rendimiento en prefill y multi-stream segun la model card |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento cognitivo con alternativas; la comparativa se limita a formato, licencia y rendimiento de inferencia medido.

## Limitaciones y advertencias

- El paquete tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-26) sin validacion comunitaria.
- No es un modelo nuevo: cualquier limitacion de Llama 3.2 1B (alucinaciones frecuentes en tareas complejas, razonamiento limitado, matematicas basicas) se hereda intacta.
- La licencia del empaquetado es MIT, pero los pesos subyacentes son de Llama 3.2 y estan sujetos a la Llama 3.2 Community License, que impone restricciones de uso comercial y requiere atribucion; conviene revisarla antes de produccion.
- Compatibilidad de hardware muy restringida: solo se declaran Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para NVIDIA ni para otras GPU AMD.
- En Radeon AI PRO R9700 las mediciones de rendimiento aun no se han re-medido, por lo que no hay cifras de rendimiento verificadas en esa GPU.
- El rendimiento en contexto de 32k es inferior al de llama.cpp (-6 % en decode), por lo que para cargas con contextos muy largos el empaquetado no aporta ventaja.
- La model card no declara idiomas soportados ni sesgos conocidos; el modelo base tiene sesgos documentados por Meta que este paquete no corrige.
- El paquete depende de `hrx-loom==0.2.0` y de un commit de hrx-system no identificado ("recovered"), lo que anade riesgo de reproducibilidad.
- No se documentan benchmarks de calidad (MMLU, HumanEval, GSM8K) para este artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/borisbat-dasllama-formats-loom
- Modelo base en Hugging Face: https://huggingface.co/borisbat/dasllama-formats
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Run de referencia de los benchmarks: https://github.com/loom-fun/loom-next/actions/runs/45877003614
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Llama 3.2 1B Instruct (modelo original de Meta): no disponible en la informacion proporcionada
- Llama 3.2 Community License: no disponible en la informacion proporcionada
