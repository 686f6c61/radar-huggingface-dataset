# jakeatx/Inkling-2-Mini-ATX-GGUF

## Resumen

Inkling-2-Mini-ATX-GGUF es una cuantizacion del modelo multimodal Inkling 2 Mini de Thinking Machines, empaquetada en formato GGUF por el usuario jakeatx para su uso con llamAmpere, un fork de llama.cpp optimizado para GPUs Ampere (RTX 30-series) de 24 GB. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26.070.385.152 parametros totales y capacidad de procesamiento image-text-to-text, es decir, acepta tanto texto como imagenes como entrada.

La relevancia de esta ficha radica en que el pack permite ejecutar el modelo completo en una unica GPU de 24 GB (RTX 3090, 3090 Ti, 4090) con una ventana de contexto por defecto de 262.144 tokens y hasta 614.400 tokens con el fichero de 4.4 bits por peso, algo poco habitual en modelos de este tamano. Incluye un drafter de decodificacion especulativa y un proyector de vision opcional, lo que habilita entrada de imagenes a traves de una API compatible con OpenAI.

La licencia es Apache 2.0, la misma que el modelo base, lo que facilita su uso comercial. Los pesos se distribuyen exclusivamente en GGUF y requieren llamAmpere v0.7.4 o superior; no cargan en llama.cpp estandar, un caveat critico para cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), multimodal image-text-to-text |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por defecto; hasta 385.024 (fichero 5.4 bpw) y 614.400 (fichero 4.4 bpw) en una GPU de 24 GB |
| Tipos de cuantizacion | NVFP4Q8 a 5.4 bits por peso; AI4 a 4.4 bits por peso; drafter Q8_0; proyectores de vision F16 y Q8_0; cache KV de 4 bits (SJ-KVaRN) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / llamAmpere) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea una arquitectura de mezcla de expertos (MoE) con 26.070 millones de parametros totales segun los safetensors publicados. La model card de esta cuantizacion no detalla el numero de parametros activos por token, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la innovacion arquitectonica concreta del modelo base mas alla de su naturaleza MoE y multimodal.

La contribucion tecnica de este repositorio es el propio proceso de cuantizacion y el runtime. Los ficheros NVFP4Q8 (5.4 bpw) y AI4 (4.4 bpw) estan calibrados para GPUs Ampere y requieren llamAmpere, un fork de llama.cpp que implementa cache KV de 4 bits (SJ-KVaRN) y decodificacion especulativa mediante un drafter Q8_0 de 0.45 GB. El pack incluye ademas un proyector de vision (mmproj) en F16 o Q8_0 que permite procesar imagenes; en una GPU de 24 GB el proyector ocupa aproximadamente 0.75 GB de VRAM y el drafter permanece activo. La divergencia KL frente al modelo de precision completa es de 0.0032 para el fichero de 5.4 bpw y 0.0060 para el de 4.4 bpw, con una coincidencia del token superior del 98,1 % y 97,1 % respectivamente.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto muy largo (hasta 614.400 tokens en el fichero de 4.4 bpw).
- Entrada de imagenes (image-text-to-text) mediante el proyector mmproj, con soporte de partes `image_url` en `/v1/chat/completions`.
- Razonamiento y respuesta a preguntas sobre documentos extensos gracias a la ventana de contexto.
- Decodificacion especulativa con drafter para acelerar la generacion.
- API compatible con OpenAI servida por llama-server en http://127.0.0.1:8080.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos en una sola GPU de 24 GB: con 262.144 tokens de contexto por defecto (y hasta 614.400 con el fichero de 4.4 bpw), el modelo puede ingerir contratos, informes o bases de codigo completas sin fragmentacion, lo que simplifica pipelines de RAG al reducir la necesidad de chunking.
- Asistente conversacional local con privacidad: al ejecutarse integramente en una RTX 3090 o 4090 mediante llamAmpere, los datos no salen del equipo, adecuado para entornos con requisitos de confidencialidad.
- Procesamiento de imagenes y texto combinados: con el proyector mmproj, el servidor acepta imagenes en la API compatible con OpenAI, util para extraer informacion de capturas, diagramas o documentos escaneados junto a preguntas en texto.
- Evaluacion de modelos multimodales en investigacion: la disponibilidad de dos cuantizaciones con distinta precision (5.4 y 4.4 bpw) y metricas de divergencia KL publicadas permite estudiar el impacto de la cuantizacion en la calidad de salida.
- Despliegue de bajo coste en estaciones de trabajo: el fichero de 4.4 bpw ocupa 14,37 GB y alcanza 614.400 tokens de contexto maximo, lo que permite montar un servidor de inferencia en hardware de gama alta de consumo sin GPUs de datacenter.
- Aceleracion de prototipos con decodificacion especulativa: el drafter Q8_0 de 0.45 GB eleva el rendimiento a 185,2 tok/s en prompts de 3K y 141,8 tok/s en prompts de 100K sobre una RTX 3090, frente a 51,3 y 33,3 tok/s de llama.cpp estandar, lo que agiliza iteraciones de desarrollo.
- Chat de codigo y agentes sobre repositorios: la ventana de contexto y las velocidades de prefill de hasta 2.692 tok/s a 100K tokens permiten indexar y consultar repositorios grandes en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si incluye metricas de velocidad y calidad de cuantizacion:

| Metrica | NVFP4Q8 5.4 bpw | AI4 4.4 bpw | llama.cpp estandar (UD-Q4_K_XL) |
|---|---:|---:|---:|
| Tamano | 17,6 GB | 14,4 GB | 17,6 GB |
| Decode, prompt 3K (tok/s) | 185,2 | 188,7 | 51,3 |
| Decode, prompt 32K (tok/s) | 179,0 | 186,9 | 48,4 |
| Decode, prompt 100K (tok/s) | 141,8 | 144,9 | 33,3 |
| Prefill a 100K (tok/s) | 2.462 | 2.692 | 249 |
| Contexto maximo | 385.024 | 614.400 | 278.528 |
| KLD media | 0,0032 | 0,0060 | 0,0032 |
| Coincidencia token superior | 98,1 % | 97,1 % | 97,9 % |

Medido en una RTX 3090 Ti limitada a 350 W con llamAmpere v0.7.5, preset `24ink`, drafter activo y cache KV de 4 bits (llama.cpp estandar usa cache KV de 8 bits y sin drafter).

## Requisitos de hardware

- VRAM: 24 GB recomendados para ejecutar el modelo completo en GPU; el fichero de 5.4 bpw ocupa 17,56 GB y el de 4.4 bpw 14,37 GB, mas 0,45 GB del drafter y hasta 0,75 GB del proyector de vision.
- GPUs objetivo: RTX 3090, 3090 Ti y 4090 (Ampere o superior). Para tarjetas de 8, 10 y 12 GB existe el repositorio jakeatx/Inkling-2-Mini-ATX-SmallCard-GGUF.
- Cabe en GPU de consumo: si, en RTX 3090/3090 Ti/4090 de 24 GB; no en tarjetas de 8-12 GB con estos ficheros.
- Software: llamAmpere v0.7.4 o superior (v0.7.5 es mas rapido con los mismos ficheros), disponible para Linux y Windows. No funciona en llama.cpp estandar.
- Despliegue: llama-server con el preset `24ink`; API compatible con OpenAI en http://127.0.0.1:8080. No se mencionan vLLM, TGI, Ollama ni otras opciones en la informacion disponible.
- Rendimiento: 185,2 tok/s de decodificacion con prompt de 3K y 141,8 tok/s con prompt de 100K (fichero 5.4 bpw); prefill de 2.462 tok/s a 100K. El fichero de 4.4 bpw es ligeramente mas rapido y admite mayor contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Inkling-2-Mini-ATX-GGUF (5.4 bpw) | 26,07 B (MoE) | 262.144 por defecto; 385.024 max. | GGUF | Apache 2.0 | Requiere llamAmpere; incluye drafter y vision |
| Inkling-2-Mini-ATX-GGUF (4.4 bpw) | 26,07 B (MoE) | 262.144 por defecto; 614.400 max. | GGUF | Apache 2.0 | Menor tamano, mayor contexto, KLD 0,0060 |
| Inkling 2 Mini (modelo base) | 26,07 B (MoE) | no disponible | safetensors | Apache 2.0 | Precision completa; referencia de calidad |
| Unsloth UD-Q4_K_XL (llama.cpp estandar) | 26,07 B (MoE) | 278.528 | GGUF | Apache 2.0 | Sin drafter; 51,3 tok/s a 3K, 33,3 tok/s a 100K |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Dependencia de un runtime no estandar: los ficheros no cargan en llama.cpp oficial; es obligatorio usar llamAmpere v0.7.4 o superior, lo que limita la portabilidad y el soporte a largo plazo.
- Hardware restringido: el pack esta calibrado para GPUs Ampere de 24 GB; en otras arquitecturas o capacidades hay que recurrir al repositorio SmallCard o a otras cuantizaciones.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos de los evaluados por el autor.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad o tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos del modelo base ni del proceso de cuantizacion.
- Perdida de calidad por cuantizacion: el fichero de 4.4 bpw presenta una divergencia KL de 0,0060 frente a 0,0032 del de 5.4 bpw; para tareas sensibles a la precision conviene el fichero de mayor bits por peso.
- Soporte de tool calling, agentes y modo thinking no confirmado: la model card no los menciona, por lo que no deben asumirse en produccion sin validacion previa.
- Licencia Apache 2.0: permite uso comercial, pero se remite a la politica de uso aceptable del modelo base, que debe revisarse antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/Inkling-2-Mini-ATX-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante para tarjetas pequenas: https://huggingface.co/jakeatx/Inkling-2-Mini-ATX-SmallCard-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
