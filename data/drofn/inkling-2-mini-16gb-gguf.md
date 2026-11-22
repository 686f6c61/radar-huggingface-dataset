# drofn/Inkling-2-Mini-16GB-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con arquitectura de transformer con bucles (looped transformer), desarrollado por Thinking Machines. El checkpoint original cuenta con 26.070.390.272 parámetros totales y está publicado bajo licencia Apache 2.0. Esta ficha documenta la versión cuantizada en GGUF publicada por el usuario drofn, optimizada específicamente para ejecutarse en tarjetas gráficas de 16 GB de VRAM con ventanas de contexto largas (64K, 96K y 128K tokens).

La relevancia de esta publicación reside en su enfoque práctico: no se trata de una cuantización genérica, sino de tres ficheros calibrados y medidos para un objetivo de contexto concreto en una GPU de consumo de 16 GB (RTX 5060 Ti), con desglose de VRAM, velocidades de generación y procesamiento de prompt, y verificación de recuperación en contexto largo. Además, la model card documenta dos hallazgos técnicos de interés general: la existencia de un suelo de divergencia KL (KLD) de aproximadamente 0.0085 inherente al modelo original, y el hecho de que la VRAM se consume principalmente en el búfer de cómputo, que escala con el producto de `-ub` (micro-batch) por la longitud de contexto.

El modelo está orientado a generación de texto y conversación, con soporte únicamente para inglés según los metadatos del repositorio. La cuantización conserva los expertos NVFP4 originales y requiere versiones recientes de llama.cpp (b12611 o superior) para aplicar correctamente las escalas de dichos expertos en las pasadas segunda y tercera por las capas con bucles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer con bucles (looped transformer) |
| Parámetros totales | 26.070.390.272 |
| Parámetros activos | no disponible |
| Longitud de contexto | 64K, 96K y 128K tokens (un fichero por objetivo de contexto) |
| Tipos de cuantización | GGUF con expertos NVFP4 originales, calibración imatrix, KV cache q8_0 o f16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Tamaño del repositorio | 15.2 GB |
| Tamaño en disco por fichero | 15.1 GB (64K), 14.0 GB (96K), 13.4 GB (128K) |

## Arquitectura y entrenamiento

La arquitectura es un Mixture-of-Experts construido sobre un transformer con bucles: un conjunto de bloques (identificados en la documentación como bloques 6-17, "the loop") se recorre más de una vez, lo que permite incrementar la profundidad efectiva sin aumentar proporcionalmente el número de parámetros. Los expertos del modelo original emplean el formato NVFP4, y las cuantizaciones de este repositorio los conservan en su precisión original en lugar de recuantizarlos. El checkpoint contiene 26.070.390.272 parámetros totales; el número de parámetros activos por token no se detalla en la información disponible.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de RLHF o DPO; esta información no aparece en la model card consultada. La innovación técnica documentada por el publicador de la cuantización no está en el entrenamiento, sino en el análisis de sensibilidad numérica: se demuestra que pequeñas perturbaciones introducidas antes o dentro del bucle (atención de los bloques 0-5, atención del bucle, tabla de embeddings) producen cada una un desplazamiento de KLD de entre 0.0076 y 0.0086, y que estos desplazamientos no son aditivos (todos a la vez dan 0.0093, no la suma). Las perturbaciones posteriores al bucle (capa de salida, bloques 18-23) apenas afectan.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento de varios pasos y modo de razonamiento explícito: las respuestas pueden incluir contenido en el campo `reasoning_content`, incluso cuando se envía `reasoning_effort: none`.
- Procesamiento de contexto largo: recuperación verificada de información (un código oculto) en prompts de 49.105, 70.988 y 102.644 tokens.
- Compatibilidad con el endpoint de chat de `llama-server` mediante `--jinja`.
- Integración con llama.cpp y herramientas compatibles con el formato GGUF.
- Capacidades de tool calling / function calling: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Análisis de documentos extensos en una sola GPU de 16 GB: con el fichero de 128K se puede cargar un contrato, informe o base de código de hasta ~100.000 tokens y hacer preguntas sobre él, aprovechando la recuperación en contexto largo verificada por el autor.
- Asistentes conversacionales de atención al cliente: el modelo mantiene conversaciones multi-turno con historial largo gracias a los 64K-128K tokens de contexto, y el KV cache en q8_0 permite sostener sesiones prolongadas sin agotar la VRAM.
- Revisión y búsqueda en repositorios de código: el fichero de 96K procesa prompts de ~71.000 tokens a 228 tok/s, adecuado para localizar fragmentos concretos (funciones, claves, configuraciones) dentro de ficheros o directorios extensos.
- Despliegue local en estaciones de trabajo con una RTX 5060 Ti u otra GPU de 16 GB: los tres ficheros están calibrados y medidos para esa clase de hardware, con comandos de lanzamiento documentados y verificados.
- Prototipado e investigación sobre arquitecturas MoE con bucles: el modelo permite estudiar el comportamiento de un looped transformer cuantizado en hardware de consumo, con métricas de KLD y velocidad publicadas.
- Evaluación de pipelines RAG con contexto largo: la verificación de recuperación a 49K, 71K y 103K tokens sirve como referencia para validar la fidelidad de sistemas de recuperación aumentada sobre ventanas extensas.
- Servicio de inferencia ligero con `llama-server`: el flag `--jinja` y la compatibilidad con endpoints permiten exponer el modelo como API de chat en una sola máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se publican métricas de cuantización medidas en una RTX 5060 Ti de 16 GB (16.000 MiB libres en reposo), con KV cache q8_0 y `-ub 32`:

| Fichero | Disco | Pesos en GPU | KLD | Contexto en 16 GB | VRAM libre | Generación | Procesamiento de prompt |
|---|---|---|---|---|---|---|---|
| 64K | 15.1 GB | 14.052 MiB | 0.0097 | 64K | 109 MiB | 55 tok/s | 270 tok/s (prompt de 49K) |
| 96K | 14.0 GB | 12.948 MiB | 0.0114 | 96K | 471 MiB | 56 tok/s | 228 tok/s (prompt de 71K) |
| 128K | 13.4 GB | 12.432 MiB | 0.0133 | 128K | 245 MiB | 57 tok/s | 189 tok/s (prompt de 103K) |

Puntos de operación adicionales medidos por el autor:

| Fichero | Configuración | VRAM libre |
|---|---|---|
| 64K | 64K con `-ub 16` | 203 MiB |
| 64K | 32K con `-ub 64` | 641 MiB |
| 64K | 32K con `-ub 128` | 223 MiB |
| 96K | 64K con `-ub 64` | 805 MiB |
| 128K | 96K con `-ub 64` | 381 MiB |

El fichero de 64K no cabe a 64K con `-ub 64`; el de 96K no cabe a 128K con `-ub 32` ni `-ub 16`.

## Requisitos de hardware

- VRAM: 16 GB es el objetivo de diseño. Los pesos ocupan entre 12.432 MiB (128K) y 14.052 MiB (64K) en GPU; el resto se destina al búfer de cómputo, que escala con `-ub` × contexto, y al KV cache.
- GPU recomendadas: RTX 5060 Ti de 16 GB (plataforma de medida del autor). Cualquier GPU con 16 GB o más de VRAM libre debería ser viable; con menos VRAM libre hay que usar el fichero más pequeño o reducir `-ub`.
- GPU de consumo: sí, en tarjetas de 16 GB. No se documentan pruebas en GPUs de 8, 12 o 24 GB.
- Despliegue: llama.cpp (`llama-server`), versión b12611 o superior obligatoria (PR #32704, fusionado el 21 de noviembre de 2026). Versiones anteriores no aplican las escalas de los expertos NVFP4 en las pasadas segunda y tercera por las capas con bucles, lo que según el PR eleva la perplejidad por encima de 130. Probado en master `e412c6f` + PR y en b12622.
- Flags de referencia: `-ngl 99 -fit off -fa on -ctk q8_0 -ctv q8_0 -ub 32 -b 2048 -np 1 --jinja --cache-ram 0`, con `-c` ajustado a 65536, 98304 o 131072 según el fichero.
- Latencia y throughput: generación de 55-57 tok/s y procesamiento de prompt de 189-270 tok/s según fichero y longitud de prompt (ver tabla de benchmarks).
- Advertencia en Windows: si la asignación no cabe, el driver recurre a memoria compartida en lugar de fallar. Configuraciones correctas mostraron 86-140 MiB de memoria GPU compartida; configuraciones cortas de VRAM mostraron 156 MiB o más y generaron a 10-48 tok/s en la mayoría de los casos. Conviene revisar "Shared GPU memory" en el Administrador de tareas tras un prompt largo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa de benchmarks. A continuación se comparan los tres ficheros de esta publicación entre sí, que es la decisión práctica que afronta el usuario:

| Criterio | 64K | 96K | 128K |
|---|---|---|---|
| Contexto máximo en 16 GB | 64K | 96K | 128K |
| KLD (suelo del modelo: ~0.0085) | 0.0097 (+0.0012) | 0.0114 (+0.0029) | 0.0133 (+0.0048) |
| Pesos en GPU | 14.052 MiB | 12.948 MiB | 12.432 MiB |
| VRAM libre a contexto máximo | 109 MiB | 471 MiB | 245 MiB |
| Generación | 55 tok/s | 56 tok/s | 57 tok/s |
| Procesamiento de prompt | 270 tok/s | 228 tok/s | 189 tok/s |

Comparativa con otros publicadores de cuantizaciones: la model card indica que el KLD se mide "contra una referencia sin pérdidas del checkpoint original, en el mismo equipo, para nuestros ficheros y para los ficheros de otros publicadores", pero los resultados de esos terceros no se incluyen en la información disponible.

## Limitaciones y advertencias

- Suelo de KLD: el modelo original presenta una divergencia de ~0.0085 frente a su propia referencia cuando solo cambian el tamaño de batch, el tipo de KV o flash attention. Cualquier cuantización parte de ese suelo; el fichero de 64K añade solo 0.0012, pero el de 128K añade 0.0048.
- Dependencia estricta de versión: usar llama.cpp anterior a b12611 produce degradación severa (perplejidad >130 según el PR) por la mala aplicación de las escalas NVFP4 en las capas con bucles.
- Riesgo de desbordamiento silencioso en Windows: la VRAM puede migrarse a memoria compartida sin error, con caídas de velocidad de 55 a 10-48 tok/s. Es necesario verificar manualmente el uso de memoria compartida.
- Modo de razonamiento no desactivable de forma fiable: con `reasoning_effort: none` el modelo siguió generando razonamiento, y cuando `content` volvió vacío la respuesta estaba en `reasoning_content`. Los pipelines deben contemplar ambos campos.
- Idioma: solo inglés según los metadatos; no se documenta soporte de castellano ni de otros idiomas.
- Contexto: los 128K no caben en el fichero de 96K con `-ub 32` ni `-ub 16`, y el de 64K no cabe a 64K con `-ub 64`. El contexto máximo práctico depende del fichero y del micro-batch.
- Sesgos y alucinaciones: no se documenta información específica sobre sesgos ni tasas de alucinación en la información disponible.
- Licencia: Apache 2.0, que permite uso comercial, pero debe verificarse en el repositorio del modelo base cualquier condición adicional.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los ficheros de 96K y 128K se estaban subiendo en el momento de la primera publicación. No hay validación independiente de las métricas publicadas.
- No se dispone de información sobre tool calling, agentes, visión ni otras capacidades especiales.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/drofn/Inkling-2-Mini-16GB-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de llama.cpp #32704 (corrección de escalas NVFP4 en capas con bucles): https://github.com/ggml-org/llama.cpp/pull/32704
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
