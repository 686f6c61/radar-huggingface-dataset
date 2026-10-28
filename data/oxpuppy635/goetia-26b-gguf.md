# oxpuppy635/Goetia-26B-GGUF

## Resumen

Goetia-26B-GGUF es la cuantizacion nativa en NVFP4 del modelo Goetia-26B, un modelo de lenguaje de tipo Mixture-of-Experts construido sobre la arquitectura Gemma-4 y publicado por el usuario oxpuppy635 en HuggingFace. El modelo completo cuenta con 25.233.142.046 parametros (aproximadamente 26 mil millones segun el autor) distribuidos en 30 capas, con 128 expertos enrutados en cada capa. El repositorio contiene unicamente los pesos cuantizados en formato GGUF, no los pesos originales.

El problema que resuelve esta publicacion es de despliegue: los pesos en BF16 ocupan aproximadamente 52 GB, lo que obliga a usar varias GPU o a descargar parte del modelo a RAM del sistema. Mediante el empaquetado de las proyecciones de atencion densa y de las matrices de los 128 expertos en super-bloques GGML NVFP4, el autor reduce la huella a 15,3 GB, lo que permite descargar el modelo completo en la VRAM de una unica GPU de 16 GB (RTX 4080, RTX 5070, RTX 5060 Ti, L4 o L40S) manteniendo las proyecciones en 4 bits.

La relevancia actual del modelo esta ligada al soporte de NVFP4 como tipo nativo en llama.cpp (GGML_TYPE_NVFP4, tipo 39), un formato de coma flotante de 4 bits con micro-escalas FP8 que busca preservar mejor la precision que las cuantizaciones de bloque tradicionales. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. No se han publicado resultados de benchmarks ni detalles sobre el entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma-4, identificador `gemma4` en GGML) con 30 capas y 128 expertos enrutados |
| Parametros totales | 25.233.142.046 (aproximadamente 25,2 mil millones; el autor indica ~26 B) |
| Parametros activos | No disponible (la model card indica 128 expertos enrutados, pero no especifica cuantos se activan por token) |
| Longitud de contexto | No disponible (no se declara la ventana nativa de entrenamiento; en la tabla de hardware se citan tamanos de contexto alcanzables de 8k a 32k+ tokens segun la VRAM) |
| Tipos de cuantizacion | NVFP4 (4 bits, E2M1) con micro-escalas FP8 cada 16 elementos; super-bloques de 36 bytes por 64 elementos. Embeddings en BF16 y vectores de normalizacion y escalares en FP32/BF16. El repositorio no ofrece otras variantes |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp); tamano del repositorio 15,3 GB |

## Arquitectura y entrenamiento

Goetia-26B emplea una arquitectura Mixture-of-Experts sobre el diseno Gemma-4, con 30 capas en las que cada capa contiene 128 expertos enrutados. La model card no detalla el mecanismo de enrutamiento (numero de expertos activados por token, funcion de router o estrategia de balanceo de carga), ni el tamano de las proyecciones densas de atencion, mas alla de confirmar que las proyecciones `attn_q`, `attn_k`, `attn_v`, `attn_output`, `ffn_gate_up_exps` y `ffn_down_exps` de las 30 capas estan cuantizadas. Tampoco se especifica la ventana de contexto nativa del modelo.

En el plano de la cuantizacion, la innovacion tecnica destacable es el uso de NVFP4 como tipo nativo de GGML: cada valor se almacena en 4 bits en formato de coma flotante E2M1 (dos nibbles por byte) y cada bloque de 16 elementos lleva asociada una micro-escala en FP8, agrupada en super-bloques de 36 bytes por cada 64 elementos. El autor conserva deliberadamente los embeddings de tokens en BF16 y los vectores de normalizacion y escalares de capa en FP32/BF16 para mantener la estabilidad de la inferencia. No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Goetia-26B (pipeline declarado: `text-generation`).
- Razonamiento y generacion condicionada por contexto: al ser un modelo MoE de 26 B, se espera capacidad de modelado de lenguaje general, aunque no se documentan evaluaciones que lo cuantifiquen.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio esta preparado para su uso mediante la infraestructura de inference endpoints de HuggingFace.
- Ejecucion en llama.cpp con soporte CUDA, incluyendo descarga completa en GPU (`-ngl 99`) y Flash Attention (`-fa`).
- Capacidades de tool calling, function calling, agentes, vision, audio o modo thinking: no disponible (no se documentan en la informacion proporcionada).
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.

## Casos de uso

- Despliegue local en una sola GPU de consumo: el archivo de 15,3 GB permite cargar el modelo completo en una RTX 4080, RTX 5060 Ti o RTX 5070 de 16 GB con `-ngl 99 -fa`, habilitando un asistente de texto en ingles sin depender de servicios en la nube.
- Prototipado e investigacion sobre cuantizacion NVFP4: el repositorio sirve como referencia practica para medir la perdida de calidad de NVFP4 frente a BF16 en un MoE de 128 expertos, comparando las salidas contra el modelo base de 52 GB.
- Servicio de generacion de texto en nodos con GPU profesional de 16 GB: en tarjetas L4 o L40S, con contexto de hasta 8k tokens y un rendimiento declarado de 40 a 60+ t/s, adecuado para cargas interactivas de un solo flujo.
- Procesamiento por lotes en GPU de 24 GB: en RTX 3090 o RTX 4090 se puede ampliar el contexto hasta 32k+ tokens y sostener 60-80+ t/s, lo que permite tareas de resumen o reescritura sobre documentos largos en ingles.
- Inferencia en CPU para entornos sin GPU: con 24 GB o mas de RAM del sistema el modelo funciona a 2-5 t/s, util para pruebas de integracion, validacion de prompts y entornos de desarrollo sin acelerador.
- Evaluacion comparativa de arquitecturas MoE: al estar en GGUF y ser compatible con llama.cpp, se puede integrar en arneses de evaluacion existentes para estudiar el comportamiento de un MoE de 128 expertos bajo cuantizacion agresiva.
- Base para ajuste fino o experimentacion posterior: la licencia Apache 2.0 permite uso comercial y modificacion, aunque el formato GGUF no es el adecuado para reentrenamiento y habria que partir del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye datos de rendimiento en inferencia, medidos en tokens por segundo y dependientes del hardware:

| Hardware | Estrategia de offload | Contexto | Rendimiento declarado |
|---|---|---|---|
| GPU de 16 GB (RTX 4080, RTX 5070, RTX 5060 Ti) | Offload completo (`-ngl 99`, `-fa`) | Hasta 8k tokens | ~40-60+ t/s |
| GPU de 24 GB (RTX 3090, RTX 4090) | Offload completo (`-ngl 99`) | Hasta 32k+ tokens | ~60-80+ t/s |
| CPU / RAM | Requiere 24 GB+ de RAM de sistema | Cualquiera | ~2-5 t/s |

## Requisitos de hardware

- VRAM para inferencia: 15,3 GB de pesos en NVFP4; con Flash Attention activado el modelo completo cabe en 16 GB de VRAM con contexto de hasta 8k tokens.
- GPU recomendadas por escenario: RTX 4080, RTX 5070, RTX 5060 Ti, L4 o L40S para 16 GB; RTX 3090 o RTX 4090 para 24 GB y contextos de 32k+ tokens.
- Viabilidad en GPU de consumo: si, en cualquier GPU con 16 GB o mas de VRAM, siempre que se use una compilacion de llama.cpp con soporte CUDA y se active `-fa`.
- CPU: requiere al menos 24 GB de RAM de sistema; el rendimiento cae a 2-5 t/s.
- Opciones de despliegue: llama.cpp compilado con `-DGGML_CUDA=ON` es el runtime indicado por el autor; el repositorio esta marcado como `endpoints_compatible` para inference endpoints. No se documenta soporte de vLLM, TGI, Ollama ni otros motores, y la viabilidad en ellos depende de que implementen `GGML_TYPE_NVFP4` (tipo 39).
- Latencia y throughput: 40-60+ t/s en GPU de 16 GB con contexto de 8k; 60-80+ t/s en GPU de 24 GB; 2-5 t/s en CPU. No se proporcionan metricas de latencia por peticion ni de time-to-first-token.
- Nota critica: sin Flash Attention no es posible mantener el modelo dentro de 16 GB de VRAM, ya que la cache KV crece con el contexto.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada. La unica comparacion documentada es contra los pesos originales del propio modelo:

| Modelo | Parametros | Formato | Huella | Contexto | Licencia |
|---|---|---|---|---|---|
| Goetia-26B-GGUF (NVFP4) | 25,2 B (128 expertos enrutados) | GGUF NVFP4, 4 bits | 15,3 GB | No disponible (8k-32k+ segun hardware) | Apache 2.0 |
| Goetia-26B (original) | 25,2 B (128 expertos enrutados) | BF16 (safetensors) | ~52 GB | No disponible | Apache 2.0 |

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni evidencia independiente de calidad o de fidelidad de la cuantizacion.
- No se publican benchmarks: se desconoce la degradacion de calidad introducida por NVFP4 frente a los pesos BF16, especialmente en tareas de razonamiento o codigo.
- Idioma unico declarado: ingles. No hay soporte documentado de castellano ni de otros idiomas, por lo que el rendimiento fuera del ingles es incierto.
- Longitud de contexto nativa no declarada: los valores de 8k y 32k+ que aparecen en la model card son objetivos de despliegue ligados a la VRAM disponible, no la ventana de entrenamiento del modelo.
- Dependencia de un tipo GGML reciente: `GGML_TYPE_NVFP4` (tipo 39) requiere una build moderna de llama.cpp; motores y versiones antiguas no podran cargar el archivo.
- Requisito estricto de Flash Attention para el escenario de 16 GB de VRAM; sin el, el modelo no cabe y hay que recurrir a offload parcial o a RAM del sistema.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a los modelos generativos de esta familia y no hay evaluaciones que lo acoten.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion para el modelo base ni para esta cuantizacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el origen de los datos de entrenamiento del modelo base ni sobre el cumplimiento de las condiciones de uso de dicho modelo.
- El repositorio contiene solo pesos cuantizados en GGUF; no es adecuado como punto de partida para reentrenamiento o ajuste fino.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oxpuppy635/Goetia-26B-GGUF
- llama.cpp (runtime requerido, compilacion con CUDA): https://github.com/ggerganov/llama.cpp
