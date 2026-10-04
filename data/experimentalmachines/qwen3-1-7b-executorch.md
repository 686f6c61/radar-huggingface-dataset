# experimentalmachines/Qwen3-1.7B-ExecuTorch

## Resumen

Qwen3-1.7B-ExecuTorch es una exportación del modelo Qwen/Qwen3-1.7B (revisión `70d244cc86cc`) al formato ExecuTorch 1.4.0, publicada por el usuario experimentalmachines. No se trata de un modelo entrenado desde cero, sino de un conjunto de artefactos `.pte` listos para ejecutarse en dispositivos Android arm64, tanto en CPU (backend XNNPACK) como en GPU (backend Vulkan) y en la NPU MediaTek NeuroPilot del chip MT6991 (Dimensity 9400). El objetivo es permitir inferencia de un LLM de 1,7 mil millones de parametros completamente en el dispositivo, sin conexion a red y sin servidores externos.

El repositorio incluye ventanas de contexto fijas de 2.048, 4.096, 8.192, 16.384 y 32.768 tokens para XNNPACK y Vulkan, y de 2.048, 4.096 y 8.192 tokens para MediaTek NeuroPilot. La ventana queda fijada dentro del archivo porque el runtime reserva la totalidad de la cache KV en el momento de la carga, de modo que el usuario debe escoger el mayor tamano que su dispositivo pueda sostener. Cada carpeta de backend incluye un `config.json` con el campo `fits_phone_budget`, una estimacion frente a un presupuesto de 5 GB.

Es relevante ahora porque cubre el nicho de despliegue de LLMs en movil con cuantizacion agresiva (8da4w-gptq en CPU/GPU y a16w8 en NPU) y porque la app openweights, desarrollada por el mismo autor, sirve como cliente de referencia para estos artefactos. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only correspondiente al modelo base Qwen/Qwen3-1.7B (no se detalla en la model card) |
| Parametros totales | 1,7 mil millones (segun la denominacion del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 y 32.768 tokens (ventana fija por archivo; XNNPACK y Vulkan hasta 32.768; MediaTek NeuroPilot hasta 8.192) |
| Tipos de cuantizacion | `8da4w-gptq` (8 bits activaciones / 4 bits pesos, GPTQ) en XNNPACK y Vulkan; `a16w8` (16 bits activaciones / 8 bits pesos) en MediaTek NeuroPilot; tabla de embeddings en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch); `tokenizer.json` copiado sin cambios del repositorio origen; `Qwen3-1.7B-neuropilot-embedding-fp32.bin` para NeuroPilot |

## Arquitectura y entrenamiento

El repositorio no contiene pesos entrenados por el autor: es una conversión del checkpoint Qwen/Qwen3-1.7B a grafos ExecuTorch. La model card no documenta la arquitectura interna del modelo base, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se describe el proceso de calibracion GPTQ empleado para producir los pesos de 4 bits, mas alla de la nomenclatura `8da4w-gptq`.

La innovacion tecnica del repositorio esta en el empaquetado y en la cobertura de backends, no en el modelo. Se ofrecen tres rutas de ejecucion: XNNPACK para CPU arm64 generica, Vulkan para GPU arm64 generica y MediaTek NeuroPilot exclusivamente para el chip MT6991. Los artefactos de MediaTek estan troceados en cuatro chunks (chunk 1 a 4 de 4) mas una tabla de embeddings compartida, lo que refleja las restricciones de memoria y de carga de la NPU. Los `.pte` de XNNPACK y Vulkan tienen ventanas de 2k a 32k, mientras que los de NeuroPilot se limitan a 2k, 4k y 8k. El tokenizador se reutiliza sin modificaciones desde el repositorio original.

## Capacidades

- Generacion de texto autoregresiva con el pipeline `text-generation`, ejecutada localmente mediante el runtime de ExecuTorch 1.4.0.
- Inferencia en el dispositivo en tres backends distintos: CPU arm64 (XNNPACK), GPU arm64 (Vulkan) y NPU MediaTek MT6991 (NeuroPilot).
- Seleccion de ventana de contexto fija en tiempo de carga, desde 2.048 hasta 32.768 tokens en XNNPACK y Vulkan.
- Integracion con la aplicacion Android openweights, que actua como cliente de referencia.
- Prueba de humo superada en las variantes XNNPACK: la generacion de la respuesta "Paris" fue verificada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas del repositorio no esta relleno).
- Modo de razonamiento explicito (thinking mode), vision o audio: no documentado en la informacion disponible.

## Casos de uso

- Asistentes conversacionales sin conexion en Android: el modelo puede empaquetarse dentro de una aplicacion que funcione en modo avion, usando el backend XNNPACK con ventana de 8.192 tokens y un peso de 1,30 GB, lo que evita cualquier envio de datos del usuario a servidores externos.
- Clasificacion y enrutado de texto local: con una ventana de 2.048 tokens y 1,28 GB en CPU, encaja en dispositivos de gama media para tareas de etiquetado, deteccion de intencion o filtrado de contenido antes de escalar la peticion a un modelo mayor en la nube.
- Resumen de notas y documentos en el propio telefono: la variante de 16.384 tokens (1,31 GB en XNNPACK) permite procesar transcripciones o apuntes largos sin fragmentarlos en exceso.
- Autocompletado y reescritura de texto en aplicaciones de productividad: el modelo puede ofrecer sugerencias mientras el usuario escribe, con latencia local y sin coste por token de API.
- Aprovechamiento de la NPU en dispositivos MediaTek Dimensity 9400: los artefactos `a16w8` troceados en cuatro chunks (0,41 GB cada uno, mas un chunk final de 0,72-0,73 GB) permiten descargar la inferencia a la NPU y liberar CPU y GPU para la interfaz.
- Aceleracion por GPU movil con Vulkan: en telefonos con driver Vulkan compatible, la variante de 2.048 tokens (1,62 GB) traslada el calculo a la GPU, util para generacion de texto interactiva con respuesta mas rapida que en CPU.
- Prototipado e investigacion sobre inferencia on-device: el conjunto de ventanas y backends permite medir el compromiso entre tamano de contexto, memoria y backend sin tener que exportar el modelo uno mismo.
- Distribucion de un LLM embebido en aplicaciones de campo (logistica, sanidad rural, inspeccion tecnica): al no requerir red, el modelo funciona en entornos sin cobertura siempre que el dispositivo soporte arm64 y tenga el presupuesto de memoria estimado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas de humo cualitativas:

| Backend | Prueba de humo | Resultado |
|---|---|---|
| XNNPACK (CPU) | Generacion de "Paris" | superada (passed) |
| Vulkan (GPU) | Verificacion de estructura | no validada en hardware (sin runtime NPU en el host de exportacion) |
| MediaTek NeuroPilot | Verificacion de estructura | no validada en hardware (sin runtime NPU en el host de exportacion) |

No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia medidos.

## Requisitos de hardware

- XNNPACK (CPU, cualquier arm64): 1,28 GB para 2k, 1,29 GB para 4k, 1,30 GB para 8k, 1,31 GB para 16k y 1,35 GB para 32k. El `config.json` de cada carpeta incluye `fits_phone_budget`, una estimacion contra un presupuesto de 5 GB.
- Vulkan (GPU, cualquier arm64): 1,62 GB para 2k, 1,63 GB para 4k, 1,65 GB para 8k, 1,70 GB para 16k y 1,80 GB para 32k.
- MediaTek NeuroPilot (MT6991, Dimensity 9400): cuatro chunks de 0,41 GB para las ventanas de 2k, 4k y 8k, con un cuarto chunk de 0,72 GB (2k y 4k) o 0,73 GB (8k), mas la tabla de embeddings en fp32.
- Cabe en hardware de movil, no en GPU de escritorio en el sentido habitual: el objetivo declarado son telefonos arm64 y, en el caso de NeuroPilot, exclusivamente el chip MT6991.
- Opciones de despliegue: runtime ExecuTorch 1.4.0 (obligatorio) y la aplicacion Android openweights. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen artefactos `.pte`.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- Nota importante: los artefactos de Vulkan y MediaTek solo han pasado una verificacion estructural, ya que el equipo de exportacion no disponia de runtime NPU en el host. No hay confirmacion de funcionamiento en dispositivo para esas dos rutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-ExecuTorch (este) | 1,7 B | 2k-32k segun backend | `.pte` (ExecuTorch) | Apache 2.0 | HuggingFace, 112 descargas |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace (revision `70d244cc86cc`) |
| Alternativas de 1-2 B exportadas a ExecuTorch | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de otros exports comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Idiomas soportados: el repositorio no declara ningun conjunto de idiomas, de modo que no hay garantia documentada de cobertura multilingue.
- Ausencia total de benchmarks: solo se ha verificado una prueba de humo ("Paris") en XNNPACK, lo que impide estimar calidad real en tareas de razonamiento, codigo o matematicas.
- Backends Vulkan y MediaTek sin validar en hardware: los propios artefactos indican "structure checked (no host NPU runtime)", por lo que pueden fallar en dispositivo.
- La ventana de contexto es fija y se reserva entera al cargar: escoger un tamano demasiado grande puede agotar la memoria del telefono aunque no se use toda la ventana.
- Cuantizacion agresiva: 4 bits de pesos en XNNPACK y Vulkan introduce perdida de precision respecto al modelo base en safetensors; no se documenta el impacto medido.
- Fragmentacion en NeuroPilot: la necesidad de cargar cuatro chunks mas la tabla de embeddings anade complejidad de integracion.
- Riesgo de alucinacion: inherente a un modelo de 1,7 B; no se aportan tasas de error ni evaluaciones de fidelidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion disponible.
- Licencia: Apache 2.0, heredada del modelo base, lo que permite uso comercial; conviene verificar igualmente la licencia del repositorio base enlazado.
- Tamano del repositorio elevado (33,8 GB) por acumular todas las variantes de ventana y backend, lo que dificulta la descarga selectiva si no se usa el filtrado por carpeta.
- La libreria declarada es `executorch`, por lo que el modelo no es consumible directamente por frameworks de servidor habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/experimentalmachines/Qwen3-1.7B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Repositorio de la aplicacion openweights: https://github.com/alpharomercoma/openweights
- Tokenizador incluido en el repositorio: https://huggingface.co/experimentalmachines/Qwen3-1.7B-ExecuTorch/blob/main/tokenizer.json
