# cafkafk/Qwen3.6-35B-A3B-GGUF

## Resumen

Qwen3.6-35B-A3B-GGUF (repositorio `cafkafk/Qwen3.6-35B-A3B-GGUF`) es una conversion a formato GGUF y cuantizacion del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario cafkafk sobre la revision de origen `995ad96eacd98c81ed38be0c5b274b04031597b0`. No es un fine-tune: es un derivado cuantizado que conserva tokenizer, plantilla de chat y metadatos de contexto/RoPE del modelo original, y mantiene la licencia Apache-2.0 del mismo. El modelo base pertenece a la familia Qwen y su nomenclatura A3B indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos; el recuento real de parametros reportado en safetensors es de 34.660.610.688 (unos 34,66 mil millones).

El paquete distribuye tres ficheros pensados para usarse juntos: el modelo de texto principal en Q4_K_M (21.166.757.888 bytes), un acompanante de vision `mmproj` en Q8_0 (614.194.304 bytes) y una cabeza borrador MTP opcional en Q8_0 (1.990.649.632 bytes) para decodificacion especulativa. El modelo base declara una longitud de contexto de 262.144 tokens, aunque el autor advierte que ese contexto completo, la calidad del modo "thinking" y el comportamiento en GPU no fueron validados en sus pruebas.

Su relevancia practica es la de hacer viable en hardware de consumo un modelo MoE multimodal de ~34,7 mil millones de parametros: la cuantizacion Q4_K_M reduce el peso de texto a unos 19,7 GiB, y el fichero MTP permite acelerar la generacion mediante decodificacion especulativa nativa. La model card publica mediciones de perplejidad en WikiText y resultados funcionales de inferencia en CPU con llama.cpp, pero no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura A3B del modelo base; detalle de capas no disponible |
| Parametros totales | 34.660.610.688 (~34,66 mil millones, dato de safetensors del modelo base) |
| Parametros activos | No disponible de forma explicita; la nomenclatura A3B del nombre sugiere ~3.000 millones |
| Longitud de contexto | 262.144 tokens declarados en el modelo base; validado por el autor solo hasta 8.192 tokens |
| Tipos de cuantizacion | Texto: Q4_K_M. Vision: Q8_0. Cabeza MTP: Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 23,8 GB |
| Ficheros | `Qwen3.6-35B-A3B-Q4_K_M.gguf`, `mmproj-Qwen3.6-35B-A3B-Q8_0.gguf`, `Qwen3.6-35B-A3B-MTP-Q8_0.gguf` |
| Modalidad | image-text-to-text (texto e imagen) |
| Fecha de publicacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo de partida, Qwen/Qwen3.6-35B-A3B, es un transformer con mezcla de expertos (MoE) de ~34,66 mil millones de parametros totales, del que solo se activa una fraccion por token (la nomenclatura A3B apunta a unos 3.000 millones de parametros activos). Incluye una torre de vision, ya que el pipeline declarado es image-text-to-text, y admite un modo de razonamiento ("thinking") que esta cuantizacion no ha validado. La model card de esta conversion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al modelo original y no se reproduce aqui.

La innovacion tecnica de este repositorio es el empaquetado de tres componentes GGUF complementarios: el texto en Q4_K_M usando el preset de llama.cpp sin matriz de importancia (imatrix), la vision mediante la ruta Q8_0 del conversor (con respaldo F16 para tensores FFN no alineados a bloques, por lo que Q8_0 describe el modo de conversion, no el tipo de cada tensor) y una cabeza MTP (multi-token prediction) en Q8_0 que actua como modelo borrador para decodificacion especulativa. El autor verifico la pareja texto/vision en inferencia por CPU con llama.cpp mainline build 10273 (`a6aa6f5`) y con un binario retenido de ik-llama.cpp, superando pruebas de aritmetica, identificacion de colores en PNG, uso de herramientas, vision con herramientas, consumo de resultados de herramientas y generacion de secuencias. No se publican los flags ni builds exactos, y no se implica compatibilidad con builds antiguos.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiqueta `conversational`).
- Razonamiento en modo "thinking" (presente en el modelo base; no validado en esta conversion).
- Capacidades de vision: descripcion e interpretacion de imagenes mediante el fichero `mmproj` (validado con identificacion de colores en PNG).
- Tool calling / function calling: la prueba funcional cubrio "tools", "vision with tools" y "tool-result consumption".
- Flujos de agente con multiples pasos, al menos en el nivel ejercitado por la prueba (contexto 8.192, thinking desactivado).
- Decodificacion especulativa mediante cabeza MTP: en la prueba con ik-llama.cpp se reportaron 96 tokens borrador y 96 aceptados sobre un fixture pequeno.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Contexto largo: el modelo base declara 262.144 tokens, pero no validado a esa longitud por el autor.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno y consumir resultados de herramientas (por ejemplo, consultas a un CRM), con margen para contextos largos si se despliega con una ventana mayor que los 8.192 tokens probados.
- Extraccion de datos de documentos con imagen: gracias al `mmproj`, se puede enviar una captura o un escaneo y obtener campos estructurados, usando tool calling para volcar el resultado en un sistema.
- Agentes con acceso a herramientas en local: al ser GGUF, puede ejecutarse en una estacion de trabajo sin conexion y orquestar llamadas a funciones (busqueda en ficheros, calculo, APIs internas) con privacidad de datos.
- Asistente de codigo en equipo pequeno: generacion y explicacion de fragmentos de codigo dentro de un IDE o un bot de revision, con el modelo servido por `llama-server` en una GPU de 24 GB o mas.
- Analisis de imagenes tecnicas: interpretacion de diagramas, capturas de paneles o fotografias de equipos, combinando vision y razonamiento para producir un informe textual.
- Prototipado e investigacion en hardware de consumo: por su tamano (~19,7 GiB en Q4_K_M), es adecuado para experimentar con MoE multimodal y decodificacion especulativa MTP en una unica GPU o en un equipo Apple con memoria unificada amplia.
- Pipeline de generacion acelerada en CPU: la cabeza MTP permite probar decodificacion especulativa en entornos sin GPU, aunque el propio autor advierte que la tasa 96/96 no es un benchmark general.
- Verificacion de calidad de cuantizaciones: util como referencia Q4_K_M con perplejidad medida en WikiText frente a otras conversiones (por ejemplo, la de ggml-org).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo publica perplejidad en una porcion de WikiText (cuatro fragmentos de 512 tokens, CPU, mismo evaluador y corpus):

| Pesos | Perplejidad | Incertidumbre reportada |
|---|---:|---:|
| BF16 de referencia | 5,1234 | ±0,39124 |
| Este Q4_K_M | 5,0732 | ±0,37867 |
| Q4_K_M de ggml-org (comparacion descargada) | 5,2268 | ±0,39890 |

El propio autor advierte que la muestra es pequena, que no establece una clasificacion general de calidad y que la linea base descargada se ejecuto en un host distinto, por lo que estas cifras no deben usarse para comparar throughput. Junto a ello se reporta, como prueba funcional y no como benchmark, una tasa de 96 tokens borrador / 96 aceptados con la cabeza MTP en un fixture pequeno.

## Requisitos de hardware

- VRAM orientativa para texto: el fichero Q4_K_M ocupa 21.166.757.888 bytes (~19,7 GiB); hay que sumar la cache KV y el overhead del runtime, no cuantificados en la informacion disponible.
- Vision: el `mmproj` Q8_0 anade 614.194.304 bytes (~0,57 GiB) si se usa la modalidad de imagen.
- Decodificacion especulativa: la cabeza MTP Q8_0 anade 1.990.649.632 bytes (~1,85 GiB) adicionales cuando se carga.
- Total en disco del repositorio: 23,8 GB.
- GPU de 24 GB (RTX 3090, RTX 4090): el modelo de texto en Q4_K_M entra en terminos de pesos, pero queda poco margen para cache KV a contextos largos; conviene un contexto moderado.
- GPU de 32 GB o mas (por ejemplo, RTX 5090 o profesionales tipo A100 40 GB, L40S, H100): espacio holgado para texto, vision, MTP y contextos mas amplios.
- Equipos Apple con memoria unificada de 32 GB o mas: viables para el conjunto completo en CPU/Metal, siempre que el runtime lo soporte.
- Despliegue: llama.cpp (`llama-server`) con `--mmproj` para vision y `--model-draft` con `--spec-type mtp:n_max=2,p_min=0.0` para MTP en los builds que lo soportan (probado en build 10273 y en un binario ik-llama.cpp). No se menciona soporte en vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica explicitamente que las mediciones de perplejidad y la tasa de aceptacion MTP no deben interpretarse como metricas de velocidad.
- Verificacion de integridad: SHA-256 publicados para los tres ficheros y comprobables con `sha256sum -c --ignore-missing SHA256SUMS`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Perplejidad WikiText (reportada) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cafkafk/Qwen3.6-35B-A3B-GGUF (este) | ~34,66 mil millones totales | 262.144 declarados (validado 8.192) | Q4_K_M texto + Q8_0 vision + Q8_0 MTP | 5,0732 ±0,37867 | Apache-2.0 | HuggingFace, GGUF |
| Qwen/Qwen3.6-35B-A3B (BF16 de referencia) | ~34,66 mil millones totales | 262.144 | BF16 | 5,1234 ±0,39124 | Apache-2.0 | HuggingFace, safetensors |
| ggml-org/Qwen3.6-35B-A3B-GGUF (Q4_K_M) | ~34,66 mil millones totales | 262.144 | Q4_K_M con otra mezcla de precisiones de tensor | 5,2268 ±0,39890 | Apache-2.0 | HuggingFace, GGUF |

No se dispone de datos de otros modelos comparables (mismo tamano o misma tarea) en la informacion proporcionada; no se incluyen por tanto alternativas adicionales.

## Limitaciones y advertencias

- Es una cuantizacion, no un fine-tune: hereda las capacidades y los sesgos del modelo original, que no se documentan en esta ficha.
- El contexto completo de 262.144 tokens no fue validado por el autor; la prueba funcional uso 8.192 tokens.
- El modo "thinking" quedo desactivado en la prueba de capacidades y no se valido su calidad.
- El comportamiento en GPU no fue validado en la ejecucion descrita; las comprobaciones se hicieron en CPU.
- La Q4_K_M se genero sin matriz de importancia (imatrix), lo que puede suponer una perdida de calidad mayor que en cuantizaciones calibradas.
- Las perplejidades se midieron sobre solo cuatro fragmentos de 512 tokens de WikiText, con incertidumbre amplia; no permiten conclusiones generales de calidad ni comparaciones de rendimiento entre hosts.
- La comparacion con el Q4_K_M de ggml-org se hizo en un host distinto, por lo que no es una comparacion controlada.
- La tasa 96/96 de tokens borrador/aceptados con MTP proviene de un fixture pequeno y no es un benchmark de velocidad ni de tasa de aceptacion general.
- No se publican los builds ni los flags exactos usados en las pruebas; no hay garantia de compatibilidad con builds antiguos de llama.cpp.
- Riesgo de alucinacion y sesgos: no cuantificados en la informacion disponible; aplican los del modelo base, no documentados aqui.
- Idiomas soportados: no disponibles.
- Licencia Apache-2.0, que permite uso comercial, pero cualquier redistribucion debe conservar la licencia y los avisos correspondientes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos datos verificables son los de la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cafkafk/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Revision de origen del modelo base: `995ad96eacd98c81ed38be0c5b274b04031597b0`
- Cuantizacion de comparacion de ggml-org: https://huggingface.co/ggml-org/Qwen3.6-35B-A3B-GGUF (revision `baec3ebee244827cda0f4557eafa8b28f7545fa6`)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- ik-llama.cpp: no disponible URL en la informacion proporcionada
- Paper, blog o demo oficial: no disponibles en la informacion proporcionada
