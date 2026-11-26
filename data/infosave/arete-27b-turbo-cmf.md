# infosave/Arete-27B-Turbo-cmf

## Resumen

Arete-27B-Turbo-cmf es una cuantizacion de 4 bits del modelo NousResearch/Arete-27B, un post-entrenamiento de Qwen3.8-27B realizado por Nous Research. La publica el usuario infosave bajo el formato CMF (un unico fichero con cabecera propia) para `cortiq`, un motor de inferencia escrito en Rust sin dependencias de Python ni de frameworks de machine learning. El modelo conserva la arquitectura original de Arete y solo sustituye los pesos por una version de 4 bits con escalas en escalera, lo que reduce el fichero a 14,1 GB.

La innovacion principal no esta en los pesos sino en la cabecera que los acompana: un mecanismo de atencion con techo fijo de memoria que mantiene las primeras 8192 filas del prompt en atencion exacta en la tarjeta grafica y expulsa las claves y valores de las filas posteriores a RAM o SSD, reconstruyendo un "campo lejano" comprimido. Segun el autor, a 64 000 tokens el modelo ocupa 14,8 GB de memoria de dispositivo frente a 21,5 GB del original, entrega el primer token en 443 s frente a 612 y decodifica a 27,2 tok/s frente a 16,2, manteniendo exactos contrasenas y codigos del texto.

Es relevante para desarrolladores que necesitan contexto largo en hardware modesto: el modelo cabe en tarjetas de 16 GB con atencion exacta limitada a 4096 filas, y ofrece una API compatible con OpenAI a traves de `cortiq serve`. La licencia es Apache 2.0 y los idiomas declarados son ingles, ruso y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen3.8-27B via NousResearch/Arete-27B); sin cambios estructurales |
| Parametros totales | 27B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131 072 tokens configurables via `CMF_MAX_SEQ`; 32 768 por defecto en el servidor; atencion exacta en las primeras 8192 filas (4096 en tarjeta de 16 GB) |
| Tipos de cuantizacion | 4 bits con escalas en escalera (q4tp); fichero principal 14,1 GB; drafter DFlash 2 en 4 bits de 1,3 GB |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero unico para `cortiq`); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint NousResearch/Arete-27B, que a su vez es un post-entrenamiento de Qwen3.8-27B. No se anaden capas ni se modifica la arquitectura: los pesos de la puntuacion de filas exactas se ajustaron sobre Qwen3.8-27B y se reutilizan tal cual. El autor no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en esta ficha; esa informacion corresponderia a la model card del modelo base, no incluida aqui.

La innovacion tecnica esta en la capa de inferencia. La cabecera CMF implementa un techo fijo de memoria: las primeras 8192 filas del prompt se leen en atencion exacta en la GPU; las claves y valores de las filas posteriores salen de la tarjeta a RAM o SSD a medida que se leen, y antes de las ultimas 512 filas se construye un campo lejano por capas que conserva las primeras 4 filas y las ultimas 1800 exactas y comprime el resto en 32 puntos de referencia por cabeza. Ademas, cada fila se puntua segun lo que las capas hacen con ella y las 248 mejores se mantienen exactas, lo que preserva contrasenas y codigos. La atencion se descompone en siete etapas pequenas para llenar la tarjeta, y hay decodificacion especulativa opcional mediante el drafter DFlash 2 en CUDA. El autor cita una solicitud de patente, No. 19/738,763.

## Capacidades

- Generacion de texto y razonamiento: modo "thinking" activado por defecto; `--no-think` o `enable_thinking: false` piden respuesta directa.
- Contexto largo con memoria acotada: prompts de hasta 131 072 tokens con techo de memoria de dispositivo fijo.
- Preservacion de cadenas exactas: contrasenas, codigos y literales se mantienen exactos gracias a las 248 filas puntuadas.
- Tool calling: el endpoint `/v1/chat/completions` acepta el campo `tools`.
- API compatible con OpenAI: `/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz` y panel web.
- Streaming de respuestas token a token (`stream: true`).
- Multilinguee en ingles, ruso y chino.
- Decodificacion especulativa en CUDA con el drafter DFlash 2 (hasta 102 tok/s en codigo segun el autor).
- Desbordamiento a SSD (`--o1-spill`) para equipos con poca RAM.
- Sin soporte declarado de vision ni audio.

## Casos de uso

- Resumen de documentos largos: con `CMF_MAX_SEQ=131072` el modelo puede procesar informes completos de decenas de miles de tokens manteniendo la memoria de la GPU acotada, lo que permite resumir contratos o articulos en tarjetas de 16-24 GB.
- Extraccion de datos exactos de textos extensos: la puntuacion de filas exactas conserva contrasenas, codigos e identificadores, util para auditar configuraciones o registros sin perder literales.
- Asistente de codigo en produccion: con tool calling y el drafter DFlash 2 en CUDA alcanza hasta 102 tok/s en codigo, adecuado para autocompletado o generacion en pipelines de CI/CD.
- Servicio de chat multi-turno autoalojado: `cortiq serve` expone una API compatible con OpenAI, de modo que cualquier cliente existente se conecta cambiando `base_url`; util para equipos que no pueden enviar datos a la nube.
- Procesamiento por lotes en hardware de consumo: el fichero de 14,1 GB cabe en tarjetas de 16 GB con atencion exacta de 4096 filas, permitiendo clasificacion y extraccion de informacion en estaciones de trabajo sin A100.
- Despliegue en equipos con poca RAM y SSD rapido: la opcion `--o1-spill` vuelca el exceso a disco, habilitando inferencia en portatiles o servidores sin memoria suficiente.
- Analisis de conversaciones largas en ruso o chino: el soporte declarado de ambos idiomas permite atender clientes en esos mercados con contexto de decenas de miles de tokens.

## Benchmarks y rendimiento

El autor publica mediciones de inferencia (no de calidad) con cortiq 0.8.63 en Vulkan y 0.8.69 en CUDA:

| Metrica | Arete-27B-Turbo-cmf | Referencia (modelo original, 4 bits) |
|---|---|---|
| Memoria de dispositivo a 64 000 tokens | 14,8 GB | 21,5 GB |
| Tiempo hasta el primer token a 64 000 tokens | 443 s | 612 s |
| Decodificacion a 64 000 tokens | 27,2 tok/s | 16,2 tok/s |
| Decodificacion en CUDA (sin drafter) | 49 tok/s | no disponible |
| Decodificacion en CUDA con DFlash 2 (codigo) | hasta 102 tok/s | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 14,1 GB para el fichero de pesos; 14,8 GB de memoria de dispositivo a 64 000 tokens segun el autor; el drafter anade 1,3 GB.
- Cabe en GPU de consumo de 16 GB (por ejemplo, RTX 4080/4090 o equivalentes) con atencion exacta limitada a 4096 filas.
- GPU recomendadas: NVIDIA con CUDA para maxima velocidad (49 tok/s, hasta 102 con DFlash 2); Vulkan, DX12 o Metal como alternativas sin drafter.
- Despliegue: `cortiq` (CLI y servidor); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato CMF no es compatible con ellos.
- Almacenamiento: SSD rapido recomendado para `--o1-spill` si falta RAM.
- Latencia: primer token en 443 s a 64 000 tokens (Vulkan); decodificacion de 27,2 tok/s en ese regimen y 49 tok/s en CUDA con prompts cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor |
|---|---|---|---|---|---|
| Arete-27B-Turbo-cmf | 27B | 131 072 (techo fijo de memoria) | 4 bits CMF | Apache 2.0 | cortiq |
| NousResearch/Arete-27B | 27B | no disponible | completa | no disponible | varios |
| Qwen3.8-27B (base) | 27B | no disponible | completa | no disponible | varios |

No se dispone de datos de benchmarks que permitan comparar la calidad de este modelo con alternativas de la misma categoria; la comparativa se limita a parametros, contexto y formato de despliegue.

## Limitaciones y advertencias

- Solo tres idiomas declarados (en, ru, zh); el rendimiento en castellano no esta documentado.
- El formato CMF solo funciona con `cortiq`; no es portable a llama.cpp, vLLM ni Ollama.
- Las mediciones de rendimiento provienen del propio autor y no se han verificado de forma independiente.
- El servidor no comprueba API key por defecto y escucha en todas las interfaces salvo que se pase `--host 127.0.0.1`; riesgo de exposicion en red.
- La atencion exacta se limita a las primeras 8192 filas (4096 en 16 GB); mas alla, la informacion pasa por un campo lejano comprimido, lo que puede degradar la fidelidad en documentos muy largos.
- El drafter DFlash 2 solo funciona en CUDA y antes del "seal"; en Vulkan no hay decodificacion especulativa.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones deben verificarse en NousResearch/Arete-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Arete-27B-Turbo-cmf
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Repositorio de cortiq/CMF: https://github.com/infosave2007/cmf
- Modelo de referencia con la misma tecnologia: https://huggingface.co/infosave/Qwen3.8-27B-Turbo-cmf
