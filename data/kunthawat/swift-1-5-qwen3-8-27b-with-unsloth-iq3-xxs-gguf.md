# kunthawat/swift-1.5-qwen3.8-27b-with-unsloth-iq3-xxs-gguf

## Resumen

Swift 1.5 Qwen3.8-27B es un modelo multimodal (image-text-to-text) derivado de la familia Qwen3.8, publicado por el usuario ukisai y cuantizado por kunthawat en formato GGUF con un esquema mixto IQ3_XXS. El checkpoint base es un ajuste de la arquitectura Qwen3.8-27B con pesos MTP (multi-token prediction) propios de Swift, orientado a sesiones largas de asistente, trabajo de marketing y revision de imagenes y documentos. Esta version concreta es una cuantizacion de inferencia lista para usar, pensada para ejecutarse en una unica GPU consumer de 16 GB.

El artefacto incluye dos ficheros: el modelo principal en GGUF IQ3_XXS (10,18 GiB) y un proyector de vision F16 separado (0,864 GiB), que debe cargarse junto al modelo para procesar imagenes. La longitud de contexto declarada en los metadatos es de 262.144 tokens, aunque el autor advierte explicitamente que ese valor es un limite arquitectonico y no una garantia de que una peticion de 262K quepa en 16 GB de VRAM. El perfil de servicio recomendado es una peticion simultanea, 100K de contexto configurado, cache K/V en Q4_0 y MTP-2.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de cuantizacion mixta tensor a tensor sobre una arquitectura multimodal con decodificacion especulativa; por otro, sirve como referencia de que esperar (y que no esperar) de un modelo de 27B comprimido a ~3 bits en hardware consumer. El autor publica mediciones locales de GPQA Diamond junto con los hashes SHA-256 de los ficheros, lo que permite verificar la integridad del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8) con pesos MTP para decodificacion especulativa; proyector de vision separado |
| Parametros totales | 460.730.096 segun safetensors del repo; el nombre comercial indica 27B (no disponible el desglose oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (metadato arquitectonico); perfil practico recomendado de 100K |
| Tipos de cuantizacion | IQ3_XXS mixta tensor a tensor (referencia publica UD-IQ3_XXS); proyector de vision en F16; cache K/V en Q4_0 en el perfil probado |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-v1.0-apache-2.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (866 tensores, 15 de ellos MTP) |
| Tamano del repo | 11,9 GB (10,18 GiB modelo + 0,864 GiB proyector) |
| Libreria | gguf (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.8 con capacidad multimodal: el procesamiento de imagen se delega a un proyector de vision independiente que se carga como fichero GGUF aparte (`mmproj-Swift-1.5-Qwen3.8-27B-F16.gguf`). Sobre esa base, el checkpoint Swift incorpora pesos MTP (multi-token prediction), que permiten decodificacion especulativa con borradores internos; la cuantizacion conserva los 15 tensores MTP originales del checkpoint Swift y no copia pesos MTP del Qwen de referencia.

La cuantizacion no es un fine-tune ni una re-cuantizacion GGUF-a-GGUF. El autor parte de los pesos BF16 de Swift 1.5 y aplica un esquema mixto tensor a tensor reconstruido a partir de la referencia publica `UD-IQ3_XXS` del repositorio GGUF de Unsloth para Qwen3.8-27B, usando la importance matrix publica de Unsloth. El autor declara explicitamente que no reproduce la receta privada Dynamic V3 de Unsloth ni es un modelo oficial de Unsloth. Los nombres, formas y tipos de cuantizacion de los 866 tensores se compararon contra el mapa de referencia con cero diferencias. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el checkpoint base.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con soporte de un presupuesto de razonamiento configurable (el autor uso 12.288 tokens en su prueba de GPQA).
- Comprension de imagen y texto combinados (pipeline `image-text-to-text`): revision de imagenes y documentos a traves del proyector de vision F16.
- Decodificacion especulativa mediante pesos MTP, que acelera la generacion al proponer varios tokens por paso.
- Conversaciones multi-turno de contexto largo, con un limite arquitectonico de 262.144 tokens y un perfil practico probado de 100K.
- Uso como asistente de sesiones largas en escritorio (perfil declarado por el autor: flujos de trabajo con Hermes y llama.cpp).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de codigo y matematicas: no documentadas de forma especifica; la unica evaluacion publicada es GPQA (ciencia de nivel graduado).
- Capacidades de audio: no disponibles.

## Casos de uso

- Revision de imagenes y documentos en local: cargando el proyector F16 junto al GGUF, el modelo puede describir y analizar capturas, diagramas o paginas escaneadas sin salir de la maquina, lo que encaja con flujos de trabajo con requisitos de privacidad.
- Asistente de escritorio para sesiones largas: con 100K de contexto configurado y cache K/V en Q4_0, permite mantener conversaciones prolongadas con historial extenso en una sola RTX 5060 Ti de 16 GB.
- Investigacion y divulgacion cientifica asistida: la evaluacion publicada en GPQA Diamond (70,71% flexible, 16,16% estricto) sugiere utilidad como apoyo en preguntas de nivel graduado, siempre con verificacion humana dada la diferencia entre ambas metricas.
- Redaccion de marketing y contenido web: el autor declara este uso como perfil principal; el modelo puede generar borradores de copy, variantes de mensajes y estructura de paginas en sesiones iterativas con contexto largo.
- Prototipado de pipelines multimodales: sirve como banco de pruebas para integrar vision y decodificacion especulativa MTP en llama.cpp antes de escalar a modelos mayores o a infraestructura con GPU de datacenter.
- Despliegue en entornos con GPU unica y VRAM limitada: al ocupar unos 11,05 GiB en disco y un pico medido de 14.630 MiB de VRAM con proyector cargado y sin imagenes, es adecuado para estaciones de trabajo con una sola GPU consumer.
- Evaluacion comparativa de cuantizaciones: los hashes SHA-256 y el registro de benchmark permiten reproducir la medicion y comparar el efecto de IQ3_XXS frente a otras cuantizaciones del mismo checkpoint base.

## Benchmarks y rendimiento

El autor publica una unica ejecucion local de GPQA Diamond (198 preguntas, llama.cpp b10909, contexto configurado de 100K, una ranura activa, cache K/V y de borrador en Q4_0, MTP-2, proyector de vision cargado en CUDA1, sin imagenes en las peticiones). Se trata de una sola semilla en una sola maquina y no de una clasificacion independiente de calidad.

| Metrica | Resultado |
|---|---|
| GPQA flexible | 140/198 (70,71%) |
| GPQA estricto | 32/198 (16,16%) |
| Procesamiento medio de prompt | 428,47 tok/s |
| Generacion media | 49,47 tok/s |
| Tiempo medio por pregunta | 92,33 s |
| Pico de VRAM muestreado | 14.630 MiB de 16.311 MiB |

Una respuesta no se pudo parsear y otra alcanzo el limite de salida. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible, por lo que no se incluye comparativa numerica con modelos similares.

## Requisitos de hardware

- VRAM estimada: unos 11,05 GiB de pesos (modelo + proyector) mas cache K/V y margen de trabajo; el pico medido en la prueba del autor fue de 14.630 MiB de 16.311 MiB con contexto de 100K configurado y sin imagenes.
- GPU recomendadas: RTX 5060 Ti 16 GB (unica GPU validada por el autor); por capacidad de VRAM, cualquier GPU con 16 GB o mas deberia poder alojar el perfil probado, aunque no hay validacion publicada en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en tarjetas de 16 GB como la RTX 5060 Ti; en tarjetas de 12 GB el margen es insuficiente para el perfil de 100K y habria que reducir contexto o cache.
- Opciones de despliegue: llama.cpp (version b10909 o superior, con soporte de Qwen3.8/Qwen3.5 GGUF, proyectores de vision y MTP); el autor menciona Hermes como frontend. No hay informacion sobre soporte en vLLM, Ollama o TGI.
- Latencia y throughput: medias de 428,47 tok/s en procesamiento de prompt y 49,47 tok/s en generacion, con una sola peticion activa y MTP-2. El throughput agregado con concurrencia no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B IQ3_XXS (este) | 27B nominales (460,7M en safetensors del repo) | 262.144 tokens (100K perfil practico) | GGUF IQ3_XXS + proyector F16 | swift-open-license-v1.0-apache-2.0 | Vision, MTP, medicion GPQA local |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27B nominales | no disponible | BF16 safetensors | no disponible | Checkpoint de origen, sin cuantizar |
| unsloth/Qwen3.8-27B-GGUF (referencia de cuantizacion) | 27B nominales | no disponible | GGUF UD-IQ3_XXS | no disponible | Referencia publica de esquema e importance matrix; sin pesos MTP de Swift |

No se dispone de datos de rendimiento comparables entre estas tres variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- El dato de parametros es contradictorio: el nombre comercial indica 27B, mientras que el campo de safetensors del repo declara 460.730.096 parametros. Conviene verificar el conteo real antes de planificar capacidad.
- El contexto de 262.144 tokens es un limite arquitectonico en metadatos; el autor advierte que no implica que una peticion de esa longitud quepa en 16 GB. El perfil probado usa 100K.
- El resultado de GPQA estricto (16,16%) es muy inferior al flexible (70,71%), lo que indica problemas de formato y adherencia a instrucciones estrictas; en produccion esto puede traducirse en salidas dificiles de parsear.
- La prueba de imagenes es limitada: solo un smoke test con una imagen a 4K de contexto; la ejecucion de GPQA cargo el proyector pero no envio imagenes. El numero de imagenes, su resolucion y la longitud del prompt afectan al consumo de VRAM de forma no cuantificada.
- El benchmark es una unica semilla en una unica maquina, con una plantilla de chat propia del autor (Qwen-Sharp) que no se incluye en el repositorio; los resultados no son reproducibles de forma exacta con la plantilla embebida.
- La licencia se etiqueta como `other` con nombre swift-open-license-v1.0-apache-2.0; no se detallan en la informacion disponible las restricciones concretas para uso comercial, por lo que debe revisarse el fichero LICENSE antes de desplegar.
- No es un modelo oficial de Unsloth pese al nombre; el autor lo aclara y no reclama la receta privada Dynamic V3.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion medidas; el riesgo de alucinacion debe asumirse como el de cualquier modelo de esta escala sin evaluacion especifica.
- El rendimiento con concurrencia (varias peticiones simultaneas) no esta documentado; el perfil probado es de una sola ranura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kunthawat/swift-1.5-qwen3.8-27b-with-unsloth-iq3-xxs-gguf
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/tree/bc7a1e10b689648585a3ef41494c8d84cf77271a
- Repositorio de referencia de cuantizacion de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Registro de benchmark del autor: `gpqa-benchmark.json` (incluido en el repositorio)
- Resultados de smoke test del autor: `smoke-test-results.json` (incluido en el repositorio)
- Registro de sanitizacion de metadatos: `metadata-sanitization.json` (incluido en el repositorio)
- Licencia: `LICENSE` (incluido en el repositorio)
