# lxe/Nanbeige4.3-33B-EXL3-2.5bpw

## Resumen

Este repositorio contiene una cuantización EXL3 de 2,5 bits por peso del modelo Nanbeige4.3-33B, un modelo denso de razonamiento desarrollado por Nanbeige. El pack ha sido generado por el usuario lxe a partir del checkpoint original en BF16 y está pensado para inferencia en GPU con ExLlamaV3 y para experimentos con el runner DSX en Rust y CUDA. No se trata de un modelo nuevo: es el mismo network denso de 33.118.977.024 parámetros, con las 364 proyecciones del decoder cuantizadas en formato trellis.

La relevancia de esta publicación es práctica: comprime un modelo de 33B en una descarga de 14,40 GB y demuestra su funcionamiento en una RTX 5090 de 32 GiB, con velocidades de decodificación medidas de entre 62 y 65 tokens por segundo en generación serial. El checkpoint original declara una ventana de 524.288 posiciones; en este pack se ha probado localmente hasta 16.384 tokens, quedando pendiente la verificación de recuperación a 256K.

Conviene subrayar que la model card no documenta los datos de entrenamiento del modelo base ni resultados de benchmarks de razonamiento, código o agentes. Las únicas métricas publicadas son una comparación de perplejidad y acuerdo de siguiente token, además de medidas de rendimiento del runtime, por lo que la calidad del modelo original en tareas reales no queda establecida por esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (tag `llama`), 52 capas, 7 proyecciones por capa |
| Parámetros totales | 33.118.977.024 (33,12B) lógicos; el sidebar de Safetensors cuenta 7.201.338.368 elementos almacenados por el formato trellis |
| Parámetros activos | No aplica: modelo denso, todas las matrices participan en cada token |
| Longitud de contexto | 524.288 posiciones en el ajuste original; el contexto usable depende del runtime y de la memoria de KV. Probado localmente hasta 16.384 tokens |
| Tipos de cuantización | EXL3 trellis a 2,5 bpw en las 364 proyecciones del decoder, codebook `mul1` (`0x83DCD12D`); embedding en BF16, cabeza de salida en FP16; bitrate efectivo del modelo completo de 3,479 bpw |
| Idiomas soportados | Inglés (`en`) y chino (`zh`) |
| Licencia | Apache 2.0, heredada del checkpoint original |
| Formato de pesos | Safetensors en formato EXL3 de ExLlamaV3, dos shards; 14,40 GB (13,41 GiB) de descarga |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso etiquetado como `llama`, con 52 capas y 7 proyecciones por capa, lo que da 364 matrices cuantizadas. Al ser denso, no existen expertos ni estrategias de offloading por experto: cada matriz del decoder interviene en cada token generado. Esta publicación no incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento; la model card se limita a describir la cuantización.

La innovación técnica del pack es el uso del formato trellis de ExLlamaV3 con codebook `mul1` y el layout de tensores original, generado desde el checkpoint BF16 con una calibración de 32 filas por 512 tokens, es decir, 16.384 tokens. Se mantienen las dos tablas de vocabulario en 16 bits (embedding BF16 y cabeza FP16), lo que eleva el peso de la descarga y el bitrate efectivo por encima de la etiqueta de 2,5 bpw. El autor documenta además una auditoría de parámetros lógicos para corregir el recuento automático del Hub.

## Capacidades

- Generación de texto y conversación multirround, con pipeline `text-generation` y tag `conversational`.
- Razonamiento: el modelo base está etiquetado como `reasoning`; no se han publicado evaluaciones que cuantifiquen esta capacidad.
- Generación de código: se ha probado con una petición de función Python para números primos, pero no hay resultados de HumanEval ni de otros benchmarks de código.
- Contexto largo: el checkpoint original admite hasta 524.288 posiciones; en este pack se ha verificado una recuperación de clave enterrada con 16.384 tokens de entrada.
- Multilingüismo limitado a inglés y chino; no se documenta soporte de castellano.
- No se documentan capacidades de visión, audio, tool calling ni flujos de agentes multi-paso.

## Casos de uso

- Inferencia local en GPU de consumo: el pack ocupa 14,40 GB y se ha ejecutado en una RTX 5090 de 32 GiB con KV de 3 bits y capacidad para 262.144 tokens, lo que permite desplegar un modelo denso de 33B en una estación de trabajo sin GPU de centro de datos.
- Generación de código en local: la prueba con una petición de función Python alcanzó 63,13 tok/s en modo serial, adecuada para asistentes de programación interactivos en el escritorio del desarrollador.
- Procesamiento de documentos largos y recuperación de información: con una entrada de 16.384 tokens, el prefill frío tardó 11,8008 segundos (1.388,38 tok/s) y devolvió la clave correcta, lo que sirve para QA sobre documentación extensa.
- Reescritura y copia estructurada de texto: en una tarea de copia de asignaciones repetidas con 628 tokens de entrada y 512 de salida se midieron 151,97 tok/s usando prompt lookup de tres tokens, útil para transformaciones mecánicas de textos largos.
- Servicios con prefill intensivo y batching: con límite de batch de 4.096, un prefijo WikiText de 3.968 tokens se procesó a 2.103,75 tok/s, interesante para pipelines que ingestionan muchos documentos antes de generar.
- Experimentación con cuantización: el repositorio incluye recibos de perplejidad, KL y acuerdo de siguiente token, lo que lo convierte en un banco de pruebas para estudiar el impacto de 2,5 bpw en un modelo de 33B.
- Evaluación comparativa de runtimes: el autor mide el mismo pack con ExLlamaV3 1.6.4 y con el runner DSX, de modo que sirve para comparar precisión y throughput entre implementaciones.
- Asistencia conversacional bilingüe inglés-chino: el modelo cubre ambos idiomas según los metadatos, aunque no se aportan evaluaciones de calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de tareas en la información disponible. Las únicas métricas son una comparación de perplejidad sobre WikiText-2 y medidas de throughput del runtime.

Comparación de calidad sobre un prefijo de validación de WikiText-2 de 4.096 tokens, 128 objetivos de siguiente token, sin caché KV:

| Configuración | Perplejidad | Aciertos de siguiente token / 128 |
|---|---:|---:|
| Checkpoint original BF16, mismo runtime de referencia | 10,2676 | 75 |
| Este pack EXL3, mismo runtime de referencia | 11,8915 | 70 |
| Este pack en DSX, prefill INT8, KV de 3 bits, cabeza de 4 bits en runtime | 12,7581 | 68 |

La comparación emparejada reporta una KL media de 0,17443 y un 85,9375 % de acuerdo de siguiente token entre el original y la cuantización, con un aumento de perplejidad del 15,8 % en esa muestra de 128 tokens. El autor advierte que la muestra es demasiado pequeña para caracterizar la calidad general y que no se ha verificado la retención de las puntuaciones del modelo original en código, razonamiento o agentes.

Rendimiento medido en una RTX 5090 de 32 GiB, i7-13700, 128 GiB DDR5-5200, con el branch DSX Nanbeige, KV de 3 bits, prefill INT8, embedding en CPU y cabeza de salida de 4 bits en runtime:

| Carga de trabajo | Tokens de entrada | Tokens generados | Velocidad de decodificación |
|---|---:|---:|---:|
| Petición de función Python de primos, serial | 30 | 256 | 63,13 tok/s |
| Misma petición, prompt lookup de tres tokens | 30 | 256 | 65,11 tok/s |
| Copia de asignaciones repetidas, serial | 628 | 512 | 62,65 tok/s |
| Misma copia, prompt lookup de tres tokens | 628 | 512 | 151,97 tok/s |

En prefill, con límite de batch elevado a 4.096, un prefijo WikiText en frío de 3.968 tokens tardó 1,8862 segundos (2.103,75 tok/s) y un prompt de clave enterrada de 16.384 tokens tardó 11,8008 segundos (1.388,38 tok/s). El autor indica que el objetivo de 100 tok/s en generación general no se ha alcanzado.

## Requisitos de hardware

- Descarga y pesos: 14,40 GB (13,41 GiB) en dos shards de safetensors, más tokenizer y metadatos.
- VRAM para inferencia: no hay una cifra oficial; el peso de los tensores no determina el consumo total, ya que hay que sumar caché KV, activaciones, buffers temporales y la implementación de la cabeza de salida.
- Configuración validada en GPU de consumo: RTX 5090 de 32 GiB con capacidad de 262.144 tokens de KV a 3 bits, prefill INT8, embedding en CPU y cabeza de salida de 4 bits en runtime; el pack se ejecutó correctamente con estas opciones.
- GPU de referencia para la comparación de calidad: una RTX PRO 6000 Blackwell de 96 GB con ExLlamaV3 1.6.4 y PyTorch SDPA.
- GPUs de centro de datos: no se han publicado medidas en A100, H100 u otras; no disponible.
- Despliegue: ExLlamaV3 (librería `exllamav3`) y el runner DSX en Rust y CUDA. No se documentan exportaciones a GGUF, ni compatibilidad con llama.cpp, Ollama, vLLM o TGI.
- Throughput: 62,65-65,11 tok/s en decodificación serial, hasta 151,97 tok/s con prompt lookup en tareas de copia, y 2.103,75 tok/s de prefill en batch de 4.096.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (Nanbeige4.3-33B EXL3 2,5 bpw) | 33,12B lógicos; 7,2B elementos almacenados | 524.288 posiciones nominales; 16.384 probadas | Safetensors EXL3, 14,40 GB | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Nanbeige4.3-33B (checkpoint original) | 33,12B | 524.288 posiciones | Safetensors BF16 | Apache 2.0 | HuggingFace |
| Otras alternativas densas de ~32B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado especificaciones ni resultados de benchmarks de otros modelos comparables, por lo que no es posible establecer una comparación de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 2,5 bpw degrada la precisión: en la muestra de 128 tokens la perplejidad sube de 10,2676 a 11,8915 (+15,8 %) y el acuerdo de siguiente token es del 85,9375 %, con KL media de 0,17443.
- Esa evaluación es demasiado corta para caracterizar la calidad general; el propio autor reconoce que no se ha comprobado la retención de las puntuaciones del modelo original en código, razonamiento ni agentes.
- El formato EXL3 exige runtimes compatibles con ExLlamaV3 o el runner DSX; no hay pesos GGUF ni BF16 en este repositorio, lo que limita su uso con otras herramientas de inferencia.
- El recuento automático de Safetensors muestra 7,2B en lugar de 33,12B porque no expande los tensores trellis; las herramientas que dependan de ese dato pueden dimensionar mal el modelo.
- El contexto usable no equivale a las 524.288 posiciones nominales: depende del runtime y de la memoria KV, y la prueba de recuperación a 256K con este pack sigue pendiente.
- Idiomas limitados a inglés y chino; no hay evaluación de rendimiento en castellano.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas del modelo base, por lo que se aplican los riesgos habituales de un modelo generativo sin datos de alineamiento publicados.
- Licencia Apache 2.0, que permite uso comercial, pero heredada del checkpoint original; conviene verificar los términos y la procedencia de los datos del modelo base antes de un despliegue en producción.
- El objetivo de 100 tok/s en generación general no se ha alcanzado en las pruebas publicadas, y las velocidades de copia con prompt lookup no son extrapolables a código o razonamiento libre.
- No se documentan soporte de tool calling, agentes ni modo thinking, pese a la etiqueta `reasoning` del modelo base.

## Enlaces

- Repositorio HuggingFace de este pack: https://huggingface.co/lxe/Nanbeige4.3-33B-EXL3-2.5bpw
- Modelo base Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Commit del checkpoint de origen citado en la model card: `c1093c501cc6460427c0ac634db7223d0450c0ee`
- Auditoría de parámetros lógicos: `benchmarks/exl3-logical-parameter-audit.json`
- Recibo de calidad de referencia: `benchmarks/reference-quality.json`
- Recibos de rendimiento: directorio `benchmarks/` del repositorio
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos no guardan relación con la ficha.
