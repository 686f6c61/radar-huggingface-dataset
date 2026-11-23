# kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-GGUF

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-GGUF es una cuantizacion GGUF en finlandes del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored, publicada por el usuario kataguru. El modelo base es un fine-tune derivado de la familia Qwen (etiquetado por el autor como Qwen3.8/Qwen3.5) con 27.320.697.856 parametros y una arquitectura hibrida que combina atencion con capas Mamba/GDN y decodificacion multi-token (MTP). El repositorio ofrece cuatro cuantizaciones GGUF (Q5_K_M, Q4_K_M, IQ4_XS y Q3_K_M) pensadas para inferencia local en llama.cpp y LM Studio.

El problema que aborda es doble: por un lado, adaptar un modelo de 27B a un uso nativo del finlandes (morfologia aglutinante, casos gramaticales, composicion de palabras) sin la torpeza de traduccion tipica de los modelos anglocentricos; por otro, ofrecer una variante sin censura ("uncensored/heretic") que evita rechazos y moralizaciones en tareas de ficcion o temas controvertidos. Incorpora ademas un sistema de niveles de razonamiento controlables mediante etiquetas en el prompt (`{REASON:low}`, `{REASON:medium}`, `{REASON:xhigh}`, `{REASON:spoon}`, `{REASON:einstein}`), con respuesta rapida por defecto.

Es relevante ahora porque demuestra el ecosistema de cuantizaciones comunitarias sobre modelos derivados: un fine-tune de 27B con licencia Apache 2.0, empaquetado para GPUs de consumo de 16 a 24 GB de VRAM, con soporte declarado para imagen-texto-a-texto en el pipeline de Hugging Face y compatibilidad con endpoints. El repositorio ocupa 65,3 GB y acumula 489 descargas desde su creacion en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Qwen3.8/Qwen2.5: atencion + Mamba/GDN + MTP (multi-token prediction) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible como valor oficial; el autor documenta 32k-64k con KV-cache FP8 en 16 GB y 128k+ con 24 GB o offload parcial |
| Tipos de cuantizacion | GGUF: Q5_K_M (5,72 bpw), Q4_K_M (4,92 bpw), IQ4_XS (4,51 bpw), Q3_K_M (3,95 bpw); existe variante AWQ W4A16 en otro repositorio |
| Idiomas soportados | finlandes (fi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp b11064); pesos fuente en BF16 |

## Arquitectura y entrenamiento

La arquitectura declarada por el autor es una hibrida de Qwen3.8/Qwen2.5 que combina capas de atencion con capas de estado recurrente Mamba/GDN, mas un cabezal de prediccion multi-token (MTP) orientado a acelerar la decodificacion. Esta combinacion busca reducir el coste de atencion en contextos largos manteniendo la calidad de un transformer clasico. El modelo base es un fine-tune "Cold Fusion 709 ULTRA HERETIC" de DavidAU, que a su vez parte de pesos Qwen; el autor de la cuantizacion afirma que no ha modificado la arquitectura ni los pesos preentrenados, solo la calibracion al finlandes, la plantilla de chat y el proceso de cuantizacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card menciona una tecnica de "ortogonalizacion de activaciones SOMA/ARA" para eliminar el tono moralizante corporativo preservando el razonamiento factual, de codigo y matematico, pero no se aportan detalles tecnicos verificables del procedimiento. La cuantizacion se realizo con llama.cpp build b11064 y la plantilla de chat es Jinja, con deteccion automatica de roles y de idioma finlandes.

## Capacidades

- Generacion de texto y conversacion multi-turno en finlandes e ingles, con morfologia aglutinante nativa (casos, composicion, sintaxis compleja).
- Razonamiento controlable por niveles mediante etiquetas `{REASON:...}`: respuesta directa por defecto y modos low, medium, xhigh, spoon (investigacion profunda en 7 fases) y einstein (brainstorming creativo con 10 perspectivas de Sternberg).
- Generacion de codigo y respuestas tecnicas de IT, segun la model card.
- Escritura creativa y narrativa de ficcion, incluyendo temas que otros modelos rechazarian (variante uncensored).
- Pipeline declarado image-text-to-text: el repositorio esta etiquetado para entrada de imagen y texto, aunque no se detalla el codificador visual ni la resolucion soportada.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp, LM Studio y Ollama.
- No se documenta soporte explicito de tool calling, function calling ni uso agentico multi-paso.

## Casos de uso

- Atencion al cliente en finlandes: el modelo mantiene conversaciones multi-turno con casos gramaticales correctos y hasta 32k-64k tokens de contexto en GPUs de 16 GB con KV-cache Q8, adecuado para historiales de ticket largos.
- Redaccion administrativa y prose finlandesa: genera documentos, informes y correos con terminologia y estilo nativos, evitando calcos del ingles.
- Asistencia a desarrolladores en Finlandia: respuestas de codigo y explicaciones tecnicas en finlandes o ingles sobre una RTX 4090 con la cuantizacion Q5_K_M (18,2 GB), sin depender de la nube.
- Analisis profundo con `{REASON:spoon}`: revision critica de documentos o hipotesis mediante el flujo de panel experto en 7 fases, util en investigacion y consultoria.
- Escritura creativa y narrativa sin restricciones: la variante heretic permite ficcion con violencia, temas adultos o escenarios moralmente ambiguos sin rechazos, con calidad estilistica en finlandes.
- Despliegue local en estaciones de trabajo con 16 GB de VRAM: la cuantizacion Q3_K_M (12,6 GB) con KV-cache FP8 permite servir el modelo en una RTX 4080 o 4070 Ti Super para prototipos y uso personal.
- Procesamiento de imagenes y texto: el pipeline image-text-to-text permite describir o razonar sobre imagenes acompanadas de instrucciones en finlandes, aunque la documentacion no detalla el soporte visual real.
- Experimentacion e investigacion sobre modelos sin censura: sirve como banco de pruebas para estudiar el efecto de la ortogonalizacion de activaciones en el comportamiento de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q5_K_M 18,2 GB (24 GB de VRAM recomendados); Q4_K_M 15,6 GB (20-24 GB de VRAM o 32 GB de RAM); IQ4_XS 14,4 GB (16-20 GB de VRAM); Q3_K_M 12,6 GB (16 GB de VRAM).
- El KV-cache en FP16 consume aproximadamente 256 KB por token; con KV-cache FP8/Q8 (`-ctk q8_0 -ctv q8_0`) se alcanzan 32k-64k de contexto en 16 GB de VRAM.
- GPUs validadas por el autor: NVIDIA RTX 5090 de 32 GB con vLLM y llama.cpp. GPUs objetivo por cuantizacion: RTX 3090, 4090 y 5090 para Q5_K_M; RTX 4080 y 4070 Ti Super para Q3_K_M.
- Cabe en GPU de consumo: si, desde una RTX 4080 de 16 GB con Q3_K_M y KV-cache cuantizado; para contextos de 128k+ se recomienda 24 GB o mas de VRAM o offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio (con cuantizacion de contexto integrada), Ollama (mediante Modelfile) y vLLM con la variante AWQ W4A16 del mismo autor.
- Parametros de muestreo sugeridos: temperature 0,6 y top_p 0,95, con stop tokens `<|im_end|>` y `<|endoftext|>`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Finnish (este) | 27,3B | 32k-128k segun VRAM | fi, en | Apache 2.0 | GGUF, AWQ | Fine-tune uncensored con niveles de razonamiento |
| Modelo base DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored | 27,3B | no disponible | no disponible | no disponible | BF16 | Sin calibracion finlandesa ni cuantizacion GGUF |
| Familia Qwen original (Qwen2.5/Qwen3) | variable | variable | multilingue | variable (Apache 2.0 en varias versiones) | safetensors, GGUF | Modelos upstream; sin el ajuste heretic ni el finlandes |
| Otras cuantizaciones GGUF de 27B-32B de la comunidad | 27B-32B | 32k-128k | variable | variable | GGUF | Alternativas genericas; sin soporte especifico de finlandes |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas con estas alternativas.

## Limitaciones y advertencias

- El modelo es un fine-tune comunitario de un fine-tune: la trazabilidad del entrenamiento y de los datos es limitada y no hay benchmarks publicados que respalden las afirmaciones de calidad.
- La variante uncensored/heretic elimina rechazos de forma deliberada; en produccion puede generar contenido inapropiado, ofensivo o inseguro sin filtros, lo que exige moderacion externa.
- Riesgo de alucinacion inherente a los modelos de 27B, agravado por la falta de evaluaciones publicadas.
- El soporte de imagen-texto-a-texto esta declarado en los tags, pero no se documenta el codificador visual ni el alcance real; conviene validarlo antes de usarlo.
- El soporte linguistico se limita a finlandes e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud de contexto no se declara oficialmente; las cifras de 32k-128k dependen de la cuantizacion y del KV-cache, no de una especificacion del modelo.
- No se documenta soporte de tool calling ni de flujos agenticos, lo que limita su uso en pipelines automatizados complejos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base declara la misma licencia sin verificacion independiente; conviene revisar los terminos del repositorio upstream.
- El KV-cache de 256 KB por token en FP16 hace inviable el contexto largo en GPUs de 16 GB sin cuantizar la cache.
- El repositorio tiene solo 489 descargas y 0 likes, con lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Variante AWQ W4A16 del mismo autor: https://huggingface.co/kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-W4A16-AWQ
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
