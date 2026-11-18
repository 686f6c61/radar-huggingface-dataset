# albucino/Qwen3.8-Flash-Next-W4A16-FP8PLE

## Resumen

Qwen3.8-Flash-Next-W4A16-FP8PLE es una cuantización comunitaria de Qwen3.8-Flash-Next, un modelo de lenguaje de arquitectura MoE desarrollado originalmente por el equipo Qwen. El checkpoint lo publica el usuario albucino y combina pesos en INT4 (W4A16, generados con AutoRound de Intel) con una tabla PLE (per-layer embeddings) en FP8, pensada para ejecutarse en GPUs de consumo con poca VRAM. El resultado es un modelo de 72.758 millones de parámetros totales cuyo repo ocupa 129 GB, pero que puede servirse en una sola RTX 3090 de 24 GB con 64 GB de RAM de sistema.

La propuesta de valor no es el modelo en sí, sino el empaquetado y los runtimes asociados: dos repositorios de GitHub (DominikBucko/qwen38-flash-next-3090 y qwen38-flash-next-2x3090) proporcionan imágenes de vLLM parcheadas que reparten expertos entre GPU y CPU, mantienen una caché KV en INT8 y usan decodificación especulativa MTP3. Con ese stack se alcanzan contextos de 135.168 tokens en una GPU y hasta 262.144 en dos, con velocidades de decodificación de 43-51 tok/s y 84-89 tok/s respectivamente.

Es relevante ahora porque demuestra que un MoE de ~73.000 millones de parámetros puede desplegarse en hardware de gama alta de consumo (dos RTX 3090) con un rendimiento de prefill superior a 3.400 tok/s, algo que hasta hace poco requería nodos con A100 o H100. El coste es una configuración delicada, dependiente de runtimes no oficiales y con limitaciones claras en cuanto a licencia y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con decodificación especulativa MTP3 y tabla PLE en FP8 |
| Parametros totales | 72.758.053.011 (72,76 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 135.168 tokens (1 GPU); hasta 262.144 tokens (2 GPU, perfil 128 GB RAM) |
| Tipos de cuantizacion | INT4 W4A16 (AutoRound) para pesos; FP8 para tabla PLE; caché KV en INT8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE), según indican las etiquetas y la descripción del runtime, que distingue entre "expertos más usados" residentes en GPU y el resto calculados en CPU. La cuantización W4A16 de Intel AutoRound reduce los pesos a 4 bits manteniendo las activaciones en 16 bits, mientras que la tabla PLE se conserva en FP8 y se lee directamente desde NVMe en los perfiles de 64 GB de RAM. El checkpoint incorpora además decodificación especulativa MTP3 (multi-token prediction con 3 tokens), que el runtime aprovecha para acelerar la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se detalla la configuración exacta de expertos por capa ni el número de expertos activos por token, más allá de las referencias del runtime a "los 32 expertos más usados de cada capa" en el perfil de una GPU y "los 88 más usados" por GPU en el perfil de dos GPU con 64 GB. La innovación técnica destacable es el reparto híbrido GPU/CPU con streaming de expertos en chunks de 8.192 tokens durante el prefill y cómputo en CPU durante el decode, junto con la caché KV INT8 (141.504 tokens en 3,05 GB).

## Capacidades

- Generación de texto conversacional y de formato largo, con ventana de contexto de 128K-256K tokens.
- Razonamiento multi-paso y soporte de agentes, según el perfil "agent 128K" mencionado en el runtime.
- Procesamiento de prompts muy largos: prefill de 131.099 tokens en 38-90 segundos según configuración.
- Decodificación especulativa MTP3 integrada en el runtime para acelerar la generación.
- Modo "uncensored" opcional mediante abliteración en tiempo de ejecución (variable `QWEN38_ABLITERATION=orcarouter`), que proyecta fuera una dirección de rechazo del residual stream.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código local con contexto largo: con 128K tokens de ventana, el modelo puede cargar un repositorio mediano completo y responder preguntas sobre él sin recuperación externa, ejecutándose en una sola RTX 3090.
- Procesamiento de documentos extensos: contratos, informes o expedientes de más de 100.000 tokens pueden prellenarse en 40-90 segundos en una GPU, lo que permite flujos de resumen y extracción por lotes en hardware de escritorio.
- Agentes autónomos de múltiples pasos: el perfil "agent 128K" y la decodificación a 84-89 tok/s en dos GPU permiten bucles de razonamiento y llamadas a herramientas con latencia interactiva.
- Servicio de chat interno para equipos pequeños: dos RTX 3090 con 64 GB de RAM ofrecen 84-89 tok/s de decode, suficiente para atender a varios usuarios concurrentes con un solo nodo.
- Investigación sobre alineación y seguridad: el modo de abliteración opcional permite estudiar el comportamiento del modelo con y sin rechazos, comparando 7 de 8 rechazos con el switch apagado frente a 0 de 8 con él encendido.
- Experimentación con cuantización y MoE: el checkpoint y los runtimes asociados sirven como banco de pruebas para evaluar estrategias de offload de expertos, caché KV INT8 y decodificación especulativa en GPUs de consumo.
- Inferencia en entornos con restricciones de presupuesto: sustituye a nodos con A100/H100 en prototipos y demostraciones donde el coste de hardware es el factor limitante.

## Benchmarks y rendimiento

Los datos disponibles son de rendimiento de inferencia del runtime, no de calidad del modelo (MMLU, HumanEval, GSM8K no están publicados en la información proporcionada).

| Configuración | Prompt + salida | TTFT | Prefill | Decode |
|---|---|---:|---:|---:|
| 1× RTX 3090, 64 GB RAM | 131.099 + 512 | 62,2 / 90,3 s | 2.106 / 1.451 tok/s | 47,4 / 43,3 tok/s |
| 1× RTX 3090, 64 GB RAM | 32.799 + 512 | 15,3 / 14,8 s | 2.141 / 2.219 tok/s | 50,3 / 49,5 tok/s |
| 1× RTX 3090, 64 GB RAM | 8.218 + 1.024 | 5,2 / 5,7 s | 1.570 / 1.452 tok/s | 49,1 / 48,5 tok/s |
| 2× RTX 3090, 64 GB RAM | 131.099 + 512 | 38,4-38,5 s | 3.401-3.413 tok/s | 84,2-88,8 tok/s |
| 2× RTX 3090, 64 GB RAM | 32.799 + 512 | 10,2-10,3 s | 3.200-3.211 tok/s | 77,0-83,9 tok/s |
| 2× RTX 3090, 64 GB RAM | 8.218 + 1.024 | 2,6 s | 3.114-3.146 tok/s | 78,2-79,7 tok/s |
| 2× RTX 3090, 128 GB RAM | hasta 262.144 contexto | no disponible | hasta 4.191 tok/s | hasta 111,5 tok/s |

Con el servidor restringido a 12 núcleos CPU en 2 CCD, el decode en dos GPU bajó a 71-81 tok/s; en una GPU, con 16 núcleos se obtuvo 39-47 tok/s y con 8 núcleos 34-36 tok/s. El modo abliterado no alteró la velocidad (prefill 2.909 vs 2.914 tok/s en 131K).

## Requisitos de hardware

- VRAM: 24 GB por GPU (RTX 3090). El perfil de una GPU mantiene atención, pesos densos, 32 expertos por capa y caché KV INT8 (141.504 tokens en 3,05 GB); el resto de expertos se computa en CPU desde RAM.
- RAM de sistema: 64 GB mínimo; 128 GB para el perfil de contexto completo (262.144 tokens) con copia fijada de todos los expertos y la tabla PLE.
- Almacenamiento: 129 GB para el repo de pesos; se recomienda NVMe porque la tabla PLE en FP8 se lee in situ desde disco.
- GPU recomendadas: RTX 3090 (24 GB) en configuraciones de 1 o 2 unidades. No hay datos publicados para A100, H100, RTX 4090 ni otras GPU.
- Cabe en GPU de consumo: sí, en RTX 3090; no hay información sobre RTX 4090 (24 GB) ni sobre GPUs con menos VRAM.
- Despliegue: exclusivamente mediante los runtimes vLLM personalizados de los repositorios qwen38-flash-next-3090 y qwen38-flash-next-2x3090 (imágenes en ghcr.io/dominikbucko). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Red: no requiere CUDA P2P ni swap en el perfil de dos GPU con 64 GB.
- Latencia y throughput: ver tabla de benchmarks; TTFT de 2,6 s para prompts de 8K y de 38-90 s para prompts de 131K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| albucino/Qwen3.8-Flash-Next-W4A16-FP8PLE | 72,76 B (MoE) | 135K-262K | qwen-community-1.0 | Hugging Face + runtimes GitHub | Cuantización INT4/FP8 para RTX 3090 |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | Hugging Face | Modelo base sin cuantizar |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | no disponible | no disponible | no disponible | Hugging Face | Cuantización W4A16 de referencia |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | no disponible | Hugging Face | Cuantización NVFP4 para hardware Blackwell |

No se dispone de datos de benchmarks de calidad ni de especificaciones completas de los modelos base y alternativas, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia qwen-community-1.0 (etiquetada como "other") impone condiciones que deben revisarse antes de cualquier uso comercial; no se detallan en la información disponible.
- El modelo solo funciona con runtimes vLLM personalizados de terceros, no oficiales; esto implica dependencia de repositorios GitHub concretos y de imágenes precompiladas.
- El modo "uncensored" elimina los rechazos de seguridad del modelo; el propio autor advierte que deben ponerse salvaguardas propias antes de servirlo a terceros.
- Riesgo de alucinación y sesgos: no hay información publicada sobre evaluaciones de sesgo, toxicidad o tasas de alucinación.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- El rendimiento depende fuertemente del ancho de banda de RAM y del número de núcleos de CPU: con 8 núcleos el decode cae a 34-36 tok/s en una GPU.
- Se documenta un problema conocido en el perfil de una GPU por el que algunas peticiones de prefill toman una ruta más lenta (~1.450 en lugar de ~2.100 tok/s).
- El perfil de 128 GB de RAM usa chunks de prefill de 4.096 tokens, lo que resulta más lento que el perfil de 64 GB con chunks de 8.192.
- La revisión de pesos recomendada es `ef554143369a706525336f6b42a09094835dc077`; usar otras revisiones puede romper la compatibilidad con los runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albucino/Qwen3.8-Flash-Next-W4A16-FP8PLE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización AutoRound de Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Cuantización NVFP4: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Variante sin censura: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Runtime para una RTX 3090: https://github.com/DominikBucko/qwen38-flash-next-3090
- Runtime para dos RTX 3090: https://github.com/DominikBucko/qwen38-flash-next-2x3090
- Perfil de 64 GB para dos GPU: https://github.com/DominikBucko/qwen38-flash-next-2x3090/blob/main/configs/2x3090-64gb.env
- Documentación de abliteración: https://github.com/DominikBucko/qwen38-flash-next-2x3090/blob/main/docs/abliteration.md
- Benchmark de dos GPU (2026-09-30): https://github.com/DominikBucko/qwen38-flash-next-2x3090/blob/main/benchmarks/2026-09-30/README.md
- Benchmark de una GPU (2026-09-30): https://github.com/DominikBucko/qwen38-flash-next-3090/blob/main/benchmarks/2026-09-30/README.md
- Imagen precompilada para una GPU: ghcr.io/dominikbucko/qwen38-flash-next-3090@sha256:7f176605b59c462af21b1b62fd854f9f3cca96e3d11a295581297483d45490a3
