# sam33339999/Qwen3.8-27B-Coder390-MTP-Exl3-3.5bpw

## Resumen

Esta ficha describe `sam33339999/Qwen3.8-27B-Coder390-MTP-Exl3-3.5bpw`, una cuantizacion EXL3 a 3,5 bits por peso (bpw) del modelo multimodal `nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2`, publicada por el usuario sam33339999 y convertida con exllamav3 1.4.2 el 9 de octubre de 2026 en una GPU NVIDIA GB10. No es un modelo entrenado desde cero: es un checkpoint cuantizado que reune en un unico directorio la torre de texto, la torre de vision en BF16 y la cabeza MTP (multi-token prediction) para decodificacion especulativa.

La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, con 64 capas de atencion hibrida (una capa de atencion completa cada cuatro), hidden de 5120, vocabulario de 248.320 tokens y ventana de contexto de 262.144 tokens. El interes practico del checkpoint es servir un modelo de contexto muy largo y orientado a codigo con decodificacion especulativa integrada, en un directorio de unos 14,3 GiB, sobre hardware de gama alta o estaciones con memoria unificada.

Hay que senalar una inconsistencia importante en los metadatos: el nombre del repositorio indica 27B, pero el Hub declara 7.669.052.656 parametros totales a partir de los safetensors. Ninguna de las dos cifras cuadra con la arquitectura descrita (64 capas, hidden 5120, vocabulario 248.320) ni con los 15,4 GB del repositorio, por lo que el recuento real de parametros no puede verificarse con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration; transformer con 64 capas de atencion hibrida (1 capa de atencion completa cada 4), hidden 5120, vocabulario 248.320 |
| Parametros totales | 7.669.052.656 segun los metadatos de safetensors del Hub; el nombre del repositorio indica 27B. Ambas cifras son incompatibles con la arquitectura declarada y con los 15,4 GB del repo; dato no verificado |
| Parametros activos | No aplica (no se declara arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 262.144 tokens (`max_seq_len` y `cache_size` en la configuracion de TabbyAPI; `-cs 262144` en el servidor de exllamav3) |
| Tipos de cuantizacion | EXL3: torre de texto a 3,5 bpw de media (calibracion de 250 columnas x 2048 tokens, codebook `mul1`, output scales activados), `lm_head` a 6 bpw, 8 capas lineales de la MTP a 4 bpw; torre de vision, embeddings y norms en BF16. El servidor admite compresion de cache KV `nvfp4` |
| Idiomas soportados | en, zh (segun los metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, requiere exllamav3 1.4.2 o superior; fragmentos `model-00001`, `model-00002` y `mtp-bf16.safetensors`). Tamano del repositorio: 15,4 GB; directorio resultante: ~14,3 GiB |

## Arquitectura y entrenamiento

El checkpoint es una conversion, no un entrenamiento. El autor parte de los pesos `BF16/` del repositorio original y los pasa por exllamav3 1.4.2, aplicando cuantizacion por columnas calibrada con 250 columnas de 2048 tokens y un codebook `mul1` con output scales siempre activos. El resultado mantiene la topologia del modelo base: 64 capas con atencion hibrida, donde solo una de cada cuatro capas usa atencion completa, lo que reduce el coste de cache en contextos largos. La cabeza MTP se cuantiza despues de la torre de texto y se escribe en el mismo safetensors, de modo que el checkpoint se puede cargar como modelo unico con decodificacion especulativa activada.

Sobre los datos de entrenamiento no hay informacion en esta ficha: el numero de tokens, la composicion del dataset y el detalle de las fases de ajuste (el identificador del modelo base sugiere SFT y RL con RLOO, ademas de las siglas MTP y DFlash2) corresponden a la model card del repositorio original, que este autor remite explicitamente. La innovacion tecnica destacable de esta publicacion es doble: por un lado, integrar la cabeza MTP en el propio directorio cuantizado, lo que evita descargar un segundo modelo para especular con 4 tokens de borrador; por otro, la existencia de un modelo borrador alternativo en un repositorio aparte (`DFlash2-EXL3-5.0bpw`, 5,0 bpw, 7 tokens de borrador), con la advertencia de que ambos mecanismos de aceleracion no deben activarse a la vez.

## Capacidades

- Generacion de texto conversacional: el `pipeline_tag` es `image-text-to-text` y el modelo esta etiquetado como conversacional.
- Generacion de codigo: el propio nombre del modelo lo orienta a codigo (Coder390) y la model card original reporta resultados en LiveCodeBench.
- Razonamiento: el identificador del base incluye `EfficientThink`, lo que sugiere modo de razonamiento; no se detalla su funcionamiento en la informacion disponible.
- Multimodalidad de entrada de imagen: la torre de vision esta presente en BF16 y el pipeline declarado es `image-text-to-text`. El autor advierte que la conversion no ejecuto ninguna prueba con entradas de imagen.
- Decodificacion especulativa: cabeza MTP incluida en el directorio (`draft_mode: mtp`, `draft_num_tokens: 4`) o borrador externo DFlash2 (`draft_mode: model`, `draft_num_tokens: 7`).
- Servicio con API compatible con OpenAI mediante el fork MiaAI de exllamav3 (`http://127.0.0.1:5000/v1`) o mediante TabbyAPI con backend `exllamav3`.
- Contexto largo: hasta 262.144 tokens declarados, con compresion de cache KV opcional en `nvfp4`.
- Multilinguee limitado: los metadatos declaran unicamente en y zh.
- No hay informacion sobre soporte de tool calling, function calling ni flujos de agente en la documentacion proporcionada.

## Casos de uso

- Asistencia de codigo autoalojada sobre repositorios completos: con 262.144 tokens de contexto se pueden cargar decenas de ficheros de un mismo proyecto y hacer preguntas transversales sobre la base de codigo, sirviendo el endpoint compatible con OpenAI de exllamav3 o TabbyAPI.
- Revision automatizada de pull requests en CI/CD: el modelo puede consumir el diff mas los ficheros afectados en una sola peticion y devolver comentarios de revision; la latencia se reduce activando la cabeza MTP como borrador especulativo.
- Refactorizacion multi-fichero asistida por agente: el contexto largo permite mantener coherencia de interfaces entre modulos al proponer cambios que afectan a varios ficheros a la vez.
- Reduccion de latencia en pipelines de generacion de codigo: la decodificacion especulativa integrada (4 tokens con MTP, o 7 con el borrador DFlash2) es util cuando se ejecutan muchas generaciones cortas y el coste por token domina el presupuesto.
- Documentacion tecnica bilinguee ingles-chino: el modelo declara soporte nativo de en y zh, lo que permite generar y traducir documentacion manteniendo terminologia tecnica en ambos idiomas.
- Analisis de documentos largos con imagenes (diagramas, capturas de interfaz, tablas escaneadas): la torre de vision esta incluida en el checkpoint, aunque el autor no verifico el camino de imagen, por lo que requiere validacion previa en el entorno de destino.
- Despliegue en una unica estacion con memoria unificada: al ocupar unos 14,3 GiB de pesos, es viable alojar el modelo completo en una maquina de un solo nodo con GPU de gran memoria y ofrecerlo a un equipo interno sin enviar codigo a terceros.
- Soporte tecnico interno sobre manuales extensos: el contexto de 262.144 tokens permite indexar documentacion interna completa en la ventana sin necesidad de un RAG externo, con la advertencia de que el modelo solo cubre en y zh.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint cuantizado a 3,5 bpw; el autor indica explicitamente que no ha repetido las evaluaciones. Las unicas cifras disponibles son las del modelo original en BF16, que se reproducen a continuacion como referencia y no como rendimiento de esta cuantizacion:

| Benchmark | Resultado BF16 del modelo original | Equivalente |
|---|---|---|
| GPQA | 178/198 | 89,9 % |
| MMLU | 446/500 | 89,2 % |
| LCB (LiveCodeBench) | 90/100 | 90,0 % |

No hay datos de latencia ni de throughput publicados para este checkpoint, ni comparaciones medidas frente a otras cuantizaciones del mismo modelo.

## Requisitos de hardware

- Pesos: ~14,3 GiB en disco y en memoria tras la carga; el repositorio ocupa 15,4 GB.
- VRAM estimada: los pesos a 3,5 bpw ocupan ~14,3 GiB, a lo que hay que sumar la cache KV. El tamano exacto de la cache por token no esta disponible (no se publica el numero de cabezas KV), pero con 262.144 tokens de contexto se necesita compresion de cache (`-cq nvfp4` en el fork de exllamav3) o memoria muy abundante.
- GPU de gama de consumo: una GPU de 24 GB (RTX 3090, RTX 4090) es el limite inferior razonable para cargar solo los pesos, con margen escaso para cache; una GPU de 32 GB (RTX 5090) deja mas holgura. Estas cifras son estimaciones derivadas del tamano de los pesos, no medidas publicadas.
- Estaciones de memoria unificada: la conversion se realizo en una NVIDIA GB10, plataforma adecuada para alojar el checkpoint completo con contexto largo.
- No cabe en GPUs de 8-16 GB en su configuracion declarada de contexto completo.
- Despliegue: exllamav3 1.4.2 o superior, con el servidor compatible con OpenAI del fork MiaAI (`tools/serve_openai.py -m <dir> -dm mtp -cs 262144 -cq nvfp4`), o TabbyAPI con `backend: exllamav3`, `max_seq_len: 262144`, `cache_size: 262144` y `draft_mode: mtp`. Para usar el borrador externo hay que apuntar `draft_model` al repositorio DFlash2-EXL3-5.0bpw con `draft_mode: model`.
- En la informacion disponible no se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI; el formato EXL3 esta ligado al runtime exllamav3.
- Latencia y throughput: no disponible. El unico dato relacionado es la configuracion de decodificacion especulativa (4 tokens de borrador con MTP, 7 con DFlash2) y los parametros de muestreo por defecto del `generation_config.json`: temperature 1.0, top_p 0.95, top_k 20.

## Comparativa con modelos similares

La comparativa se hace contra modelos densos y MoE de tamano y categoria equivalentes en el rango 27-33B, con los datos publicos de sus fichas oficiales. Las cifras de rendimiento de los modelos alternativos corresponden a sus propios informes y no se han medido en las mismas condiciones que este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Coder390-MTP-Exl3-3.5bpw | 7.669.052.656 segun safetensors; 27B segun el nombre (cifra no verificada) | 262.144 | apache-2.0 | safetensors EXL3 (exllamav3) | Repositorio con 0 descargas y 0 likes; sin benchmarks propios |
| Qwen3-32B | 32,8B (denso) | 128.000 (ampliable por YaRN) | apache-2.0 | safetensors, GGUF y otras | Ampliamente desplegado, soporte en vLLM, llama.cpp, Ollama y TGI |
| Qwen2.5-Coder-32B-Instruct | 32,5B (denso) | 131.072 | apache-2.0 | safetensors y GGUF | Ampliamente desplegado, con variantes GGUF y AWQ |
| Qwen3-30B-A3B | 30,5B totales, 3,3B activos (MoE) | 128.000 | apache-2.0 | safetensors y GGUF | Ampliamente desplegado; coste de inferencia muy inferior por token activo |

Frente a estas alternativas, la ventaja diferencial de este checkpoint es la ventana de contexto de 262.144 tokens junto con la decodificacion especulativa integrada, y su desventaja principal es la dependencia exclusiva del runtime exllamav3, la ausencia de pesos GGUF y la falta de validacion independiente de su calidad tras la cuantizacion a 3,5 bpw.

## Limitaciones y advertencias

- La cuantizacion a 3,5 bpw implica una perdida de calidad no cuantificada: el autor no ha vuelto a ejecutar GPQA, MMLU ni LCB sobre esta conversion y las cifras de referencia son del modelo en BF16.
- La torre de vision esta incluida en BF16, pero la conversion no ejecuto ninguna prueba con entrada de imagen; cualquier caso de uso multimodal requiere validacion previa.
- Los idiomas declarados son unicamente ingles y chino; no hay evaluacion de rendimiento en castellano ni en otras lenguas.
- El contexto de 262.144 tokens exige una cache KV muy grande; sin compresion `nvfp4` o sin memoria suficiente, la ventana efectiva sera menor o provocara errores de asignacion.
- El modelo base es un merge cuyo identificador referencia explicitamente modelos de terceros (Opus 5.5, GPT-6 Astra, Grok 4.7, DSV4Pro, K3) y fases de SFT y RL con RLOO. La procedencia, los datos de entrenamiento y las condiciones de esos componentes no se documentan en la informacion disponible; la licencia apache-2.0 la declara el cuantizador heredandola del repositorio original, por lo que conviene verificar la cadena de licencias antes de un uso comercial.
- El repositorio presenta 0 descargas y 0 likes, sin validacion por parte de la comunidad, y la nomenclatura "Qwen3.8" y "Qwen3.5" no se corresponde con ninguna familia publicada en la informacion disponible.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad; al tratarse de un modelo orientado a codigo, el riesgo principal es la generacion de codigo plausible pero incorrecto que compile, especialmente en APIs poco representadas.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente paginas sin relacion), por lo que las afirmaciones de la model card no pueden corroborarse con fuentes independientes.
- El checkpoint no es cargable con transformers estandar ni con runtimes de cuantizacion tipo GGUF; depende de exllamav3 1.4.2 o superior y, para la compresion de cache `nvfp4`, del fork MiaAI.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sam33339999/Qwen3.8-27B-Coder390-MTP-Exl3-3.5bpw
- Modelo base (pesos BF16, benchmarks y metodo de entrenamiento): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Modelo borrador alternativo DFlash2-EXL3-5.0bpw: referenciado en la model card como repositorio del mismo autor, sin URL explicita en la informacion disponible
- Paper, blog, demo o repositorio de codigo adicionales: no disponible; la busqueda web no devolvio resultados relevantes
