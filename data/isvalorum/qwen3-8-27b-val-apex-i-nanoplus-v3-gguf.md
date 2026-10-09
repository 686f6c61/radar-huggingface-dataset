# IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF

## Resumen

Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF es una cuantizacion GGUF del checkpoint Qwen/Qwen3.8-27B (27.320.697.856 parametros, unos 27,3 mil millones), publicada por el usuario IsValorum bajo licencia Apache 2.0. No se trata de un modelo nuevo entrenado desde cero, sino de una compresion del checkpoint original de Qwen sin aplicar abliteracion de Huihui ni ajuste EfficientThink, segun declara el autor. El objetivo es reducir el peso del modelo desde los 54,65 GB del baseline BF16 hasta un unico fichero de 11,35 GB, manteniendo un contexto nativo de 256K tokens.

La relevancia de esta publicacion esta en su perfil de compresion: 3,32 bits por peso (BPW) en el fichero completo, con una perplejidad medida en WikiText-2 de 6,2577 ± 0,5011 frente a los 5,7942 ± 0,4531 del BF16 sin modificar, lo que supone un incremento de +0,4635 (+8,00%). El autor compara ese resultado con una cuantizacion IQ3_S de referencia (GSQ-RCO, 11,8 GB y PPL 7,07) y reporta una mejora relativa del 11,49%.

El fichero integra ademas un bloque de prediccion multi-token (MTP) en el mismo archivo que el modelo principal, pensado para decodificacion especulativa si el backend de inferencia lo soporta. El modelo esta etiquetado unicamente para ingles y esta pensado para text-generation en llama.cpp y entornos compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la describe; el modelo base es Qwen/Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 256K tokens nativos (segun la model card) |
| Tipos de cuantizacion | Unica cuantizacion NanoPlus V3, 3,32 BPW en el fichero completo. Mezcla por tensor: Q4_0 (6 matrices del bloque MTP), Q4_1 (1), Q6_K (1), F32 (7 tensores de normalizacion). No se publican otros perfiles en este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero unico, library_name: gguf) |
| Tamaño del fichero | 11,35 GB (10,57 GiB) |
| Tamaño del repositorio | 12,0 GB |
| Bloque MTP | 1 bloque integrado (blk.64.*, 15 tensores) |
| Metodo de cuantizacion | imatrix, asignacion por tensor revisada en V3 |
| Descargas / likes | 49 / 0 |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura interna del modelo base (numero de capas, dimension oculta, tipo de atencion, uso de MoE, SSM o hibridos) ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF, DPO u otras etapas de alineamiento). La unica referencia estructural concreta es la existencia de un bloque de prediccion multi-token etiquetado como `blk.64.*`, con quince tensores, ocho de ellos matrices cuantizadas y siete tensores de normalizacion en F32, lo que indica que el checkpoint base incorpora una cabeza MTP entrenada.

El trabajo del autor se limita a la cuantizacion: usa el metodo que denomina VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization) con calibracion imatrix y una asignacion de bits por tensor revisada en la version V3. La model card menciona "block-0 exceptions", es decir, excepciones de precision en el primer bloque, aunque no detalla los tensores afectados. No se aplica abliteracion ni ajuste fino EfficientThink en esta edicion, a diferencia de otras variantes del mismo autor.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline_tag: text-generation, tag conversational).
- Razonamiento: el repositorio esta etiquetado con `reasoning` y la model card incluye una seccion sobre plantilla de chat y modo razonamiento.
- Decodificacion especulativa mediante el bloque MTP integrado, supeditada al soporte y la configuracion del backend de inferencia.
- Uso en llama.cpp y entornos compatibles con GGUF (Ollama, LM Studio, koboldcpp, entre otros).
- Contexto largo de hasta 256K tokens de forma nativa, segun el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; el modelo esta etiquetado solo como text-generation.
- Capacidades multilingues: limitadas a ingles segun el campo `language: en`.

## Casos de uso

- Despliegue en GPU de consumo para generacion de texto en ingles: con 11,35 GB de pesos, el modelo puede cargarse completo en tarjetas de 16 GB o parcialmente en tarjetas de 12 GB, lo que permite ejecutar un modelo de 27,3B en hardware de gama alta doméstica.
- Procesamiento de documentos largos en ingles: la ventana de 256K tokens declarada permite ingerir contratos, informes tecnicos o libros completos en una sola pasada, siempre que la VRAM disponible soporte el cache KV resultante.
- Asistentes conversacionales autoalojados: el modelo esta etiquetado como conversacional y soporta plantilla de chat propia, por lo que puede servir como backend de un chatbot interno sin enviar datos a APIs externas.
- Generacion de codigo asistida en local: el modelo base Qwen3.8 esta orientado, segun su familia, a tareas de codigo, y esta cuantizacion permite ejecutarlo en estaciones de trabajo sin GPU de datacenter. No obstante, no se aportan metricas HumanEval ni MBPP en la informacion disponible.
- Experimentacion con decodificacion especulativa: el bloque MTP incluido permite medir ganancias de throughput en backends que implementen MTP, util para equipos que evaluan tecnicas de aceleracion de inferencia.
- Evaluacion de tecnicas de cuantizacion: el repositorio publica curvas de perplejidad WikiText-2 frente al baseline BF16 y frente a IQ3_S, lo que lo convierte en material de referencia para investigacion sobre compresion de pesos.
- Sustitucion de un BF16 de 54,65 GB en entornos con VRAM limitada: reduce el requisito de memoria en aproximadamente un 79% a cambio de un incremento de perplejidad del 8,00%.

## Benchmarks y rendimiento

Solo se dispone de mediciones de perplejidad en WikiText-2 aportadas por el autor. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Modelo / cuantizacion | Tamaño | BPW | WikiText-2 PPL | Delta PPL vs BF16 base (5,7942) |
|---|---|---|---|---|
| BF16 base sin modificar | 54,65 GB (50,90 GiB) | 16 | 5,7942 ± 0,4531 | 0,0000 (0,00%) |
| Qwen3.8 27B Base — MiniPlus V3 | 14,16 GB (13,19 GiB) | 4,15 | 6,1361 ± 0,4885 | +0,3419 (+5,90%) |
| Qwen3.8 27B Base — NanoPlus V3 (esta publicacion) | 11,35 GB (10,57 GiB) | 3,32 | 6,2577 ± 0,5011 | +0,4635 (+8,00%) |
| EfficientThink Uncensored — MiniPlus V2.1 | 15,08 GB (14,04 GiB) | 4,49 | 6,0091 ± 0,4773 | +0,2149 (+3,71%) |
| EfficientThink Uncensored — NanoPlus | 11,65 GB (10,85 GiB) | 3,46 | 6,3013 ± 0,4832 | +0,5071 (+8,75%) |
| Huihui Abliterated — MiniPlus V2.1 | 15,33 GB (14,28 GiB) | 4,49 | 6,1466 ± 0,4919 | +0,3524 (+6,08%) |
| Huihui Abliterated — NanoPlus | 11,90 GB (11,08 GiB) | 3,48 | 6,4238 ± 0,4960 | +0,6296 (+10,87%) |
| GSQ-RCO IQ3_S (referencia) | 11,8 GB | 3,50 (publicado) | 7,07 (publicado) | +1,2758 (+22,02%) |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 11,35 GB; con el overhead del runtime y un contexto corto, el offload completo exige del orden de 13-14 GB de VRAM. Es una estimacion derivada del tamaño del fichero, no un dato publicado por el autor.
- Contexto de 256K tokens: el requisito adicional de cache KV no esta publicado y depende de la configuracion de capas y cabezas del modelo base. No cuantificable con la informacion disponible.
- GPU de 8 GB: no cabe el modelo completo; requeriria offload parcial de capas a CPU y penalizaria la velocidad.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070 12 GB): cargaria el modelo completo con contexto reducido, al limite de VRAM.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080): margen comodo para contexto moderado.
- GPU de 24 GB (RTX 3090, RTX 4090): contexto amplio con capas MTP activadas.
- GPU de datacenter (A100 40/80 GB, H100): permiten contexto completo de 256K sin offload, si el backend lo soporta.
- Opciones de despliegue: llama.cpp (libreria declarada), y por compatibilidad GGUF tambien Ollama, LM Studio, koboldcpp y servidores compatibles. El soporte de vLLM o TGI para GGUF es parcial y no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El autor no publica tokens por segundo ni datos de rendimiento, y el uso del bloque MTP depende del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamaño en disco | PPL WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Qwen3.8 27B Base — NanoPlus V3 (esta publicacion) | 27,3B | 256K | 11,35 GB | 6,2577 | apache-2.0 |
| Qwen3.8 27B Base — MiniPlus V3 | 27,3B | 256K | 14,16 GB | 6,1361 | apache-2.0 |
| Qwen3.8 27B EfficientThink Uncensored — MiniPlus V2.1 | 27,3B (base) | 256K | 15,08 GB | 6,0091 | apache-2.0 |
| GSQ-RCO IQ3_S | no disponible | no disponible | 11,8 GB | 7,07 | no disponible |

No se dispone de datos de benchmarks tarea-especificos ni de especificaciones del modelo GSQ-RCO mas alla de su tamaño y su perplejidad publicada, por lo que la comparacion se limita a tamaño, BPW y perplejidad en WikiText-2.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible. Al ser una cuantizacion del checkpoint original sin abliteracion, conserva los sesgos y el comportamiento del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos de esta familia; no se aportan evaluaciones de factualidad (TruthfulQA u otras) en esta publicacion.
- La perplejidad en WikiText-2 aumenta un 8,00% respecto al BF16 sin modificar, y un 11,49% menos que la referencia IQ3_S. A 3,32 BPW la degradacion en tareas de razonamiento largo o codigo puede ser mayor que la que sugiere la perplejidad agregada.
- Idioma: el modelo esta declarado unicamente para ingles. El rendimiento en castellano u otros idiomas no esta documentado ni garantizado.
- Contexto: los 256K tokens son una cifra declarada por el autor; no se publican mediciones tipo needle-in-a-haystack ni pruebas de recuperacion en el extremo de la ventana.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen/Qwen3.8-27B, cuyos terminos no se detallan en la informacion proporcionada.
- Estado del repositorio: 49 descargas y 0 likes, con fecha de creacion 2026-10-08. Es una publicacion de un tercero, no oficial de Qwen, y no se aporta validacion independiente de las metricas.
- El bloque MTP integrado solo aporta aceleracion si el backend de inferencia lo soporta y se configura correctamente; de lo contrario se carga sin beneficio.
- El contenido de la model card incluye enlaces de donacion y texto promocional del autor; conviene tratar las afirmaciones de mejora como no verificadas por terceros.
- La busqueda web realizada no ha devuelto informacion tecnica relevante sobre este modelo: los resultados obtenidos tratan sobre el software Corsair iCUE y no guardan relacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Edicion MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- EfficientThink Uncensored MiniPlus V2.1: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-MiniPlus-V2.1-GGUF
- EfficientThink Uncensored NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-NanoPlus-GGUF
- Huihui Abliterated MiniPlus V2.1: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-MiniPlus-V2.1-GGUF
- Huihui Abliterated NanoPlus: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-GGUF
- Coleccion VAL-APEX-I: https://huggingface.co/collections/IsValorum/val-apex-i-6ac563d1784a04a1bb177f47
- Coleccion MiniPlus: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-current-6aac8d4766a28a024e8bb104
- Coleccion NanoPlus: https://huggingface.co/collections/IsValorum/apex-i-nanoplus-6ab41467c988a1b1cb9b83bc
- Pagina de soporte del autor: https://ko-fi.com/isvalorum
