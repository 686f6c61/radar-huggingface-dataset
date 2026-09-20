# sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-3.00bpw-h4

## Resumen

`sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-3.00bpw-h4` es una exportación cuantizada en formato EXL3 del modelo `llmfan46/gemma-4-31B-it-uncensored-heretic`, que a su vez es una variante «decensurada» (etiquetada como *heretic* / *uncensored*) de `google/gemma-4-31B-it`. El repositorio no aporta pesos nuevos ni entrenamiento adicional: es un artefacto de compresión pensado para servir el modelo en ExLlamaV3 o TabbyAPI con un consumo de VRAM muy contenido. El autor es `sjoe1244` y la operación se realizó el 19 de septiembre de 2026 sobre una RTX 4090 a partir del checkpoint BF16 original de 62,5 GB.

La particularidad del modelo es la agresividad de la cuantización: 3,0 bits por peso (bpw) en las 830 capas del modelo de lenguaje, `lm_head` a 4 bits y torre de visión a 6 bpw, con los embeddings (`embed_tokens`) conservados en BF16 en RAM del sistema. El resultado ocupa 13,961 GiB en disco (14.990.854.741 bytes repartidos en dos ficheros safetensors), lo que permite ejecutar un modelo de ~31B nominales con ventanas de contexto de hasta 262.144 tokens en una única GPU de 24 GB. La model card reporta mediciones reales de prefill en RTX 4090 y RTX 5080.

Es relevante ahora por dos motivos: primero, porque demuestra que la combinación de cuantización 3 bpw con atención híbrida (solo 10 de 60 capas con caché K/V por token) hace viable el contexto largo en hardware de consumo; segundo, porque documenta el estado de madurez de ExLlamaV3 1.5.0, que a diferencia de 1.4.2 ya puede cuantizar la torre de visión de Gemma 4. Como contrapartida, el propio autor advierte que no ha ejecutado ninguna evaluación de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal texto+imagen. 60 capas, de las cuales 10 mantienen caché K/V por token y 50 usan ventana deslizante con estado de tamaño fijo. Incluye torre de visión. La model card no detalla la configuración interna de atención |
| Parámetros totales | 7.495.233.772 según los metadatos de safetensors del repo, dato que no cuadra con la designación «31B» del nombre ni con el tamaño de los pesos (el desglose de ficheros es coherente con ~31-32B reales). Ver limitaciones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 262.144 tokens verificados experimentalmente en el barrido de prefill (era el techo del barrido, no un límite detectado). Máximo oficial no disponible |
| Tipos de cuantización | EXL3 (ExLlamaV3 1.5.0): pesos a 3,0 bpw, `lm_head` a 4 bits, torre de visión a 6 bpw, `embed_tokens` en BF16 sin cuantizar (2,625 GiB, en RAM del sistema). Código de libro `mul1`, escalas de salida siempre activas, calibración de 250 filas x 2.048 columnas |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache-2.0 (igual que `google/gemma-4-31B-it` y el modelo fuente) |
| Formato de pesos | safetensors en formato EXL3, 2 shards (`model-00001-of-00002.safetensors` de 8.498.844.777 bytes y `model-00002-of-00002.safetensors` de 6.492.009.964 bytes; total 14.990.854.741 bytes = 13,961 GiB) |

Desglose de componentes (sumado de las cabeceras safetensors):

| Componente | Tamaño |
|---|---|
| Capas del modelo de lenguaje | 10,245 GiB |
| `embed_tokens` (BF16, en RAM de host) | 2,625 GiB |
| `lm_head` | 0,657 GiB |
| Torre de visión | 0,430 GiB |

## Arquitectura y entrenamiento

No hay información sobre entrenamiento en este repositorio: no es un modelo entrenado, sino una reexportación cuantizada del checkpoint `llmfan46/gemma-4-31B-it-uncensored-heretic`. No se documentan número de tokens, composición del dataset, fases de RLHF/DPO ni proceso de *decensoring*; la model card solo indica que el crédito del decensurado corresponde a `llmfan46` y que este repo contiene únicamente la exportación EXL3.

La innovación técnica relevante está en la cuantización y en la estructura de atención que la hace posible. La exportación aplica 3,0 bpw sobre los mismos tensores que la variante `-h6`, de modo que las capas del modelo de lenguaje ocupan exactamente lo mismo (10,245 GiB) en ambos repositorios; la diferencia está en la cabeza (`lm_head` de 0,985 GiB a 6 bits frente a 0,657 GiB a 4 bits) y en la torre de visión (BF16 1,061 GiB en h6 frente a 6 bpw 0,430 GiB aquí). El motivo del cambio en visión no es una decisión estética: ExLlamaV3 1.4.2 no podía cuantizar la torre de visión de Gemma 4 y la almacenaba en BF16, mientras que 1.5.0 sí puede. En el lado arquitectónico, el dato operativo clave es que solo 10 de las 60 capas mantienen caché K/V por token; las otras 50 usan ventana deslizante con estado de tamaño fijo, por lo que el coste de contexto a `cache_mode: 3,3` es de aproximadamente 17,9 KiB por token, muy inferior a lo que sugeriría el número de capas.

## Capacidades

- Generación de texto e instrucciones conversacionales (modelo `it`, ajustado a instrucciones) en un checkpoint derivado de Gemma 4.
- Comprensión de imágenes: el repositorio incluye torre de visión cuantizada a 6 bpw, por lo que admite entrada imagen+texto.
- Contexto muy largo: se han verificado prefills reales a ~95 % de la ventana en configuraciones de hasta 262.144 tokens.
- Comportamiento sin rechazos: al proceder de un modelo etiquetado como *uncensored* / *heretic*, la intención declarada es responder sin las negativas típicas de un modelo alineado de forma conservadora.
- Servicio concurrente limitado: la configuración medida en 4090 usa `max_batch_size: 2`; en 5080, `max_batch_size: 1`.
- Plantilla de chat propia: `chat_template.jinja` se distribuye como fichero separado porque Gemma 4 no incluye la plantilla en `tokenizer_config.json`; la plantilla recomendada al servir es `gemma4`.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Modo de razonamiento explícito (*thinking*): no documentado en la información disponible.
- Audio: no soportado. El `config.json` incluye un `audio_config`, pero no hay tensores de audio en el checkpoint, ni en el modelo fuente, ni en `google/gemma-4-31B-it`.

## Casos de uso

- Asistente multimodal local en una sola GPU de consumo: con 13,961 GiB de pesos y picos de prefill de 17.435 MiB a 98.304 tokens en una RTX 4090 de 24 GB, es viable mantener un asistente de texto e imagen en local sin infraestructura de servidor.
- Análisis de documentos muy largos sin troceado agresivo: la ventana verificada de 262.144 tokens y un coste de caché de ~17,9 KiB/token permiten cargar contratos, expedientes o bases de código completas en una sola pasada en lugar de encadenar recuperación por fragmentos.
- Procesamiento de imágenes y capturas: la torre de visión a 6 bpw añade solo 454 MiB de VRAM (o 54 MiB si se activa `EXL3_VISION_PINNED=1` y se retiene en memoria fijada del host), lo que habilita OCR, descripción de imágenes y extracción de datos de pantallazos dentro del mismo modelo que genera el texto.
- Investigación en seguridad y alineación: un checkpoint «decensurado» sirve como sujeto de estudio para medir qué capacidades y qué sesgos cambian tras un proceso de *decensoring*, y como generador de casos adversarios en ejercicios de *red teaming* controlados.
- Escritura creativa y narrativa sin filtros de rechazo: el modelo está pensado para producir texto que un modelo alineado rechazaría; se usaría en entornos editoriales o de ficción con revisión humana posterior.
- Servicio multi-cliente con API compatible: TabbyAPI con el cargador `exllamav3`, `prompt_template: gemma4`, `cache_mode: 3,3` y `gpu_split_auto: true` permite exponer el modelo como endpoint a varios clientes, con un límite medido de 2 peticiones concurrentes en 4090 y 1 en 5080.
- Estudio de cuantización extrema: al ser una exportación de 3,0 bpw con cabeza de 4 bits, es un objeto útil para medir la degradación de calidad frente a builds de mayor bpw sobre exactamente las mismas formas de tensor.
- Despliegue en estaciones con GPU de 16 GB: en RTX 5080 el modelo sostiene prefills limpios hasta 81.920 tokens (15.837 MiB de pico), lo que cubre casos de asistencia técnica con contexto medio-largo en hardware de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es explícita: «Quality: Not evaluated». Los autores indican que no se ha ejecutado ninguna prueba comparativa contra la variante `-h6` ni contra el modelo BF16 de origen, y que las únicas cifras publicadas son mediciones de memoria y de contexto.

Lo único cuantificado es el comportamiento en memoria durante el prefill (visión desactivada, `cache_mode: 3,3`, prefills reales a ~95 % de la ventana):

| GPU | `chunk_size` | `max_batch_size` | `max_seq_len` | Pico de prefill |
|---|---|---|---|---|
| RTX 4090 (24 GB) | 128 | 2 | 98.304 | 17.435 MiB |
| RTX 4090 (24 GB) | 128 | 2 | 131.072 | 17.995 MiB |
| RTX 4090 (24 GB) | 128 | 2 | 163.840 | 19.573 MiB |
| RTX 4090 (24 GB) | 128 | 2 | 196.608 | 20.133 MiB |
| RTX 4090 (24 GB) | 128 | 2 | 262.144 | 21.253 MiB |
| RTX 5080 (16 GB) | 256 | 1 | 61.440 | 15.021 MiB |
| RTX 5080 (16 GB) | 256 | 1 | 73.728 | 15.741 MiB |
| RTX 5080 (16 GB) | 256 | 1 | 81.920 | 15.837 MiB |
| RTX 5080 (16 GB) | 256 | 1 | 90.112 | falla a mitad de prefill |

Latencia y throughput en tokens por segundo: no disponibles.

## Requisitos de hardware

- VRAM para inferencia: 13,961 GiB de pesos en disco. Con visión desactivada y `cache_mode: 3,3`, el pico de prefill medido va de 17.435 MiB a 98.304 tokens hasta 21.253 MiB a 262.144 tokens en una RTX 4090, y de 15.021 MiB a 61.440 tokens hasta 15.837 MiB a 81.920 tokens en una RTX 5080. Los 2,625 GiB de `embed_tokens` en BF16 los mantiene ExLlamaV3 en RAM del sistema, no en VRAM.
- Visión: activarla suma 454 MiB de VRAM; con `EXL3_VISION_PINNED=1` la torre se retiene en memoria fijada del host y el coste baja a 54 MiB (medido a 61.440 tokens en una 5080). Ese flag solo afecta al componente de visión, ningún otro componente se descarga a host.
- GPU recomendadas: RTX 4090 (24 GB) con margen suficiente (a 262.144 tokens quedaban 3,3 GB libres); RTX 5080 (16 GB) funciona pero queda al límite por encima de 81.920 tokens; no hay mediciones publicadas para A100, H100, L40S ni otras GPU de centro de datos.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 y RTX 5080 según las mediciones del autor. No se han publicado pruebas en tarjetas de 12 GB o menos.
- Opciones de despliegue: exclusivamente ExLlamaV3 1.5.0 o el cargador `exllamav3` de TabbyAPI. El repositorio no carga en Transformers, vLLM ni llama.cpp.
- Configuración de referencia en 4090: `max_seq_len: 98304`, `cache_size: 98304`, `cache_mode: 3,3`, `chunk_size: 128`, `gpu_split_auto: true`, `prompt_template: gemma4`.
- Advertencia del propio autor: las cifras son verificaciones de un único prefill; una ventana que supera un prefill limpio puede sufrir OOM bajo tráfico sostenido, por lo que recomienda operar por debajo del valor tabulado.

## Comparativa con modelos similares

| Modelo | Formato / cuantización | Tamaño en disco | Visión | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (`-h4`) | EXL3, pesos 3,0 bpw, `lm_head` 4 bits, visión 6 bpw | 13,961 GiB (2 shards) | Sí, 0,430 GiB | Apache-2.0 | ExLlamaV3 1.5.0; `lm_head` 0,657 GiB; sin evaluación de calidad |
| `sjoe1244/...-exl3-3.00bpw-h6` | EXL3, pesos 3,0 bpw, `lm_head` 6 bits | 14,927 GiB | Sí, en BF16 (1,061 GiB) | Apache-2.0 | ExLlamaV3 1.4.2; capas del LM idénticas (10,245 GiB); no podía cuantizar la visión |
| `llmfan46/gemma-4-31B-it-uncensored-heretic` (fuente) | BF16 | 62,5 GB | Sí, sin cuantizar | Apache-2.0 | Modelo del que se exporta; sin cuantización, requiere hardware muy superior |
| `google/gemma-4-31B-it` (upstream) | BF16 (no disponible en esta información) | No disponible | Sí | Apache-2.0 | Modelo base original, alineado; no es una variante *uncensored* |

Frente a alternativas de la misma categoría basadas en otras familias o en otros formatos (GGUF, GPTQ, AWQ) no hay datos en la información disponible que permitan una comparación de rendimiento, ya que no se ha publicado ninguna evaluación.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara explícitamente «Not evaluated». No hay benchmarks, ni comparación contra `-h6`, ni comparación contra el BF16 de origen. No hay base empírica para afirmar qué capacidades se conservan.
- Cuantización muy agresiva: 3,0 bpw sobre un export ya con pérdidas, más una cabeza reducida a 4 bits. El propio autor recomienda preferir un build de mayor bpw si se dispone de VRAM.
- Discrepancia en el recuento de parámetros: los metadatos de safetensors del repo indican 7.495.233.772 parámetros, cifra incompatible con el nombre «31B» y con el tamaño de los pesos (10,245 GiB a 3 bpw más embeddings y cabeza). Hay que tratar cualquier afirmación sobre el tamaño real del modelo con cautela.
- Compatibilidad muy restringida: solo ExLlamaV3 1.5.0 y TabbyAPI. No carga en Transformers, vLLM ni llama.cpp, lo que descarta la mayoría de stacks de despliegue habituales y complica la integración en pipelines existentes.
- Contenido sin filtros: al ser un modelo *uncensored*, puede generar contenido ofensivo, ilegal o dañino. La licencia Apache-2.0 permite el uso comercial, pero no exime al desplegador de sus obligaciones legales (normativa europea de servicios digitales, protección de menores, responsabilidad sobre el contenido generado).
- Proceso de *decensoring* no documentado: la ficha no describe cómo se eliminaron los rechazos ni qué efecto tuvo sobre sesgos, toxicidad o capacidades. No hay ninguna medición al respecto.
- Riesgo de alucinación: no cuantificado. No hay evaluación de fidelidad factual ni de tasas de alucinación para este export.
- Idiomas no documentados: la model card no lista idiomas soportados; no se puede asumir cobertura multilingüe sin verificación propia.
- Audio no disponible pese a la configuración: el `config.json` incluye un `audio_config`, pero no existen tensores de audio en el checkpoint, ni en el modelo fuente, ni en `google/gemma-4-31B-it`. Es un modelo de imagen y texto.
- Límites de contexto prácticos: las ventanas de 262.144 tokens se validaron con un único prefill. Con tráfico sostenido el consumo puede exceder lo medido, y en una 5080 el fallo se produce a partir de 90.112 tokens.
- Concurrencia baja: `max_batch_size` de 2 en 4090 y 1 en 5080 limita el uso como servicio multiusuario.
- Madurez del artefacto: 12 descargas y 0 «me gusta» en el momento de la consulta, publicado el 20 de septiembre de 2026 y actualizado tres minutos después. No hay validación independiente de la comunidad.
- Fichero de plantilla separado: `chat_template.jinja` no está en `tokenizer_config.json`; si no se carga correctamente, el formato de las conversaciones será incorrecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-3.00bpw-h4
- Variante h6 (mismo 3,0 bpw, cabeza a 6 bits, visión en BF16): https://huggingface.co/sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-3.00bpw-h6
- Modelo base (decensurado, BF16): https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Modelo upstream de Google: https://huggingface.co/google/gemma-4-31B-it
- Herramienta de cuantización ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Búsqueda web: no se encontraron resultados relevantes. Las consultas devolvieron únicamente portales de noticias y recetas eslovacos (topky.sk y subdominios) sin relación alguna con el modelo. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar más allá de los enlaces presentes en la información de HuggingFace.
