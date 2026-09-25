# patrickbdevaney/MiMo-V2.6-Flash-REAP50

## Resumen

MiMo-V2.6-Flash-REAP50 es una version podada del modelo multimodal de mezcla de expertos XiaomiMiMo/MiMo-V2.6-Flash-RL, publicada por el usuario patrickbdevaney. El proceso elimina el 50 % de los expertos enrutados de cada capa (de 256 a 128) con el objetivo de que el modelo quepa y se sirva en un unico NVIDIA Jetson AGX Thor con 117 GiB de memoria unificada. El checkpoint conserva las entradas de vision, audio y video, e incluye el tokenizador de audio en la carpeta `audio_tokenizer/`.

La seleccion de expertos no se hizo por frecuencia de activacion, sino acumulando saliencia sobre un corpus de calibracion y resolviendo el conjunto de poda con el objetivo HOPE, que minimiza el error de salida incluyendo los terminos de interaccion entre expertos (REAP es el mismo objetivo con la diagonal secundaria anulada). El resultado se evalua por dominio y se ordena por el peor dominio, no por la media.

Se trata de una publicacion de nicho y muy reciente (creada el 25 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta), orientada a despliegue en un solo dispositivo con memoria unificada. Su interes practico esta en que documenta de forma reproducible una transformacion de poda sobre un MoE multimodal grande, no en un salto de calidad respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) dispersa y multimodal, con 128 expertos enrutados por capa tras el podado; requiere codigo personalizado (`custom_code`) sobre transformers |
| Parametros totales | 159.334.077.952 (~159,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | etiquetado como 8 bits / fp8 en los metadatos; no se detalla el esquema exacto por capa |
| Idiomas soportados | no disponible (el corpus de calibracion es texto en ingles y chino, ademas de codigo y otros dominios) |
| Licencia | MIT, heredada del modelo base, con atribucion a Xiaomi MiMo |
| Formato de pesos | safetensors, cargados con transformers mediante codigo personalizado |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Flash-RL |
| Expertos por capa | 128 (256 en el modelo base) |
| Tamano del repositorio | 94,3 GB (86,1 GiB repartidos en 65 shards) |

## Arquitectura y entrenamiento

La arquitectura es un MoE multimodal con enrutamiento por capa. El checkpoint no se entrena desde cero: es una transformacion de poda aplicada sobre MiMo-V2.6-Flash-RL, que ya incorpora un ajuste por refuerzo segun indica su propio nombre. La poda reduce a la mitad el numero de expertos enrutados de forma uniforme en todas las capas, lo que reduce el coste de almacenamiento y de computo enrutado a costa de perder capacidad representacional.

La seleccion de expertos se hizo maximizando la saliencia acumulada sobre un corpus de calibracion y resolviendo el conjunto de poda con el objetivo HOPE, que incluye los terminos de interaccion fuera de la diagonal entre expertos; REAP, el criterio alternativo, equivale al mismo objetivo con esos terminos anulados, y esa informacion no puede recuperarse despues de la pasada. El criterio de saliencia usado fue `reap_1_1_1` y se protegio el 8 % superior de cada dominio, dejandolo fuera del conjunto de poda. La evaluacion se ordena por el peor dominio retenido (0,9935 en audio) en lugar de por la media (0,9964), con un valor del objetivo HOPE pᵀFp de 0,01624.

Los enrutadores se reajustaron por coincidencia de salida contra el profesor sin podar, con los expertos congelados: se reajustaron 47 enrutadores y los 47 conservaron los pesos del profesor porque el reajuste no supero la linea base, de modo que ningun enrutador queda peor que el recorte directo del profesor. No se documenta ningun proceso adicional de fine-tuning, RLHF o DPO posterior a la poda, ni el numero de tokens de entrenamiento del modelo base.

| Ajuste de poda | Valor |
|---|---|
| Objetivo | hope |
| Criterio de saliencia | reap_1_1_1 |
| Ratio de poda | 0,50, uniforme por capa |
| Proteccion por dominio | 8 % superior de cada dominio excluido del conjunto de poda |
| Peor dominio retenido | 0,9935 (audio) |
| Media retenida | 0,9964 |
| Objetivo HOPE pᵀFp | 0,01624 |

## Capacidades

- Generacion de texto conversacional, con la etiqueta `conversational` en los metadatos del repositorio.
- Entrada multimodal: vision (imagen), audio y video, preservadas tras la poda; el tokenizador de audio se distribuye en `audio_tokenizer/`.
- Cobertura de dominios durante la calibracion: texto en ingles y chino, codigo, matematicas, ciencia, finanzas, trazas agenticas y subtitulos de imagen, audio y video.
- Razonamiento en dominios cientifico, matematico y financiero, inferido de la composicion del corpus de calibracion (retencion de 0,9973 a 0,9974).
- Generacion de codigo, con una retencion declarada de 0,9983 en ese dominio.
- Flujos agenticos: el corpus de calibracion incluye trazas agenticas y el dominio presenta una retencion de 0,9983, aunque el autor no documenta de forma explicita soporte de tool calling o function calling.
- Capacidad multilingue limitada a lo observado: no se declara una lista oficial de idiomas soportados mas alla del ingles y el chino usados en calibracion.
- No se documenta modo de pensamiento explicito, razonamiento en cadena configurable ni decodificacion especulativa: la cabeza borrador `dflash/` del repositorio original no se incluye.

## Casos de uso

- Inferencia en el borde con memoria unificada: el checkpoint esta dimensionado para ejecutarse en un unico NVIDIA Jetson AGX Thor de 117 GiB, lo que permite desplegar un MoE multimodal de ~159 mil millones de parametros en robotica movil, vehiculos o equipos de campo sin conexion a un cluster.
- Analisis de video y audio en local: al conservar las entradas de video y audio y distribuir el tokenizador de audio, encaja en pipelines de transcripcion y descripcion de contenido que no pueden enviar material sensible a la nube por requisitos de privacidad.
- Asistencia sobre documentacion tecnica en ingles o chino: la retencion declarada en ciencia (0,9973) y codigo (0,9983) lo hace util para responder consultas sobre manuales, articulos y repositorios en esos dos idiomas.
- Generacion y revision de codigo en entornos con politica de datos estricta: al ser MIT y ejecutable en hardware propio, puede integrarse en flujos internos de revision de parches, generacion de pruebas o explicacion de fragmentos heredados.
- Razonamiento cuantitativo en finanzas o analitica: la retencion de 0,9974 en el dominio financiero permite usarlo para resumir informes, extraer cifras y redactar borradores de analisis, siempre con verificacion humana de los numeros.
- Prototipado de agentes que combinan imagen y texto: las trazas agenticas forman parte del corpus de calibracion, de modo que sirve como base para experimentar con asistentes que inspeccionan capturas, diagramas o fotos y ejecutan pasos posteriores.
- Investigacion sobre poda de MoE: el repositorio y su herramienta de generacion permiten reproducir la transformacion sobre otros checkpoints y estudiar el compromiso entre ratio de poda y retencion por dominio.
- Despliegue en una sola GPU de gran memoria como sustituto de un servicio multi-GPU: util cuando se quiere evitar paralelismo tensorial y su sobrecoste de comunicacion en, por ejemplo, un H200 o un B200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo de calidad es la retencion de la masa de salida con compuerta por dominio medida durante la calibracion, que no equivale a una evaluacion de capacidad:

| Dominio | Retencion |
|---|---|
| audio | 0,9935 |
| imagen | 0,9937 |
| video | 0,9938 |
| ciencia | 0,9973 |
| matematicas | 0,9974 |
| finanzas | 0,9974 |
| lastre (ballast) | 0,9976 |
| codigo | 0,9983 |
| agentico | 0,9983 |

Estas cifras miden cuanto de la salida del profesor sin podar reproduce el modelo podado sobre el corpus de calibracion, no su calidad absoluta frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 94,3 GB (86,1 GiB en 65 shards), por lo que la inferencia necesita del orden de 90 a 100 GB de memoria de dispositivo en el formato distribuido, sin contar cache KV ni activaciones. El modelo sin podar a la misma precision seria aproximadamente el doble.
- GPU validadas: NVIDIA Jetson AGX Thor con 117 GiB de memoria unificada, unico dispositivo confirmado por el autor. Encajan tambien GPU de gran memoria como H200 (141 GB) o B200 (192 GB).
- Configuraciones multi-GPU: dos A100 de 80 GB o dos H100 de 80 GB con paralelismo tensorial, asumiendo que el codigo personalizado del modelo base lo soporte; no esta confirmado por el autor.
- GPU de consumo: no cabe en ninguna. Una RTX 4090 con 24 GB o una RTX 5090 con 32 GB quedan muy por debajo del requisito, incluso con cuantizacion agresiva.
- Opciones de despliegue: transformers con `trust_remote_code=True` (via oficial, dado el `custom_code`); vLLM o TGI son plausibles si soportan la arquitectura MoE multimodal concreta, pero no se documentan; llama.cpp y Ollama no son aplicables directamente porque el repositorio publica safetensors y no GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para el Jetson AGX Thor ni para GPU de centro de datos.

## Comparativa con modelos similares

La comparacion cuantitativa no es posible porque el modelo no publica benchmarks. La tabla recoge solo especificaciones estructurales; los datos de las alternativas provienen de su documentacion publica y no se han medido en igualdad de condiciones.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-REAP50 | ~159,3 B | no disponible | no disponible | MIT | HuggingFace, 0 descargas |
| MiMo-V2.6-Flash-RL (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Mixtral 8x22B | ~141 B | ~39 B | 64 K | Apache 2.0 | HuggingFace |
| Qwen3-235B-A22B | ~235 B | ~22 B | 128 K | Apache 2.0 | HuggingFace |

La diferencia relevante frente a esas alternativas no es el rendimiento, sino el objetivo de despliegue: MiMo-V2.6-Flash-REAP50 esta ajustado para caber en un solo dispositivo de memoria unificada de 117 GiB, mientras que los modelos comparables se sirven habitualmente en configuraciones multi-GPU.

## Limitaciones y advertencias

- Transformacion con perdida e irreversible: los expertos podados no se recuperan; el checkpoint es una version degradada del modelo base por construccion.
- La calibracion cubre texto en ingles y chino, codigo, matematicas, ciencia, finanzas, trazas agenticas y subtitulos de imagen, audio y video. Los dominios fuera de esa mezcla no se midieron, por lo que no hay garantia de comportamiento en ellos.
- Las cifras de retencion son autoinformadas sobre el corpus de calibracion y no han sido verificadas por terceros ni contrastadas con benchmarks publicos.
- La cabeza de decodificacion especulativa `dflash/` del repositorio original no se incluye, ya que fue entrenada contra el conjunto de expertos sin podar y no es valida para este checkpoint. Esto implica renunciar a la aceleracion asociada.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni tasas de error; el ajuste por refuerzo del modelo base tampoco se detalla.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad ni alineacion. La composicion del corpus de calibracion (predominantemente ingles y chino) hace esperable un comportamiento desigual en otras lenguas.
- Idiomas: no se declara una lista oficial de idiomas soportados; la unica referencia es el corpus de calibracion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad. Conviene tratarlo como artefacto experimental.
- Licencia MIT heredada del modelo base con atribucion a Xiaomi MiMo: permite uso comercial, pero conviene revisar las condiciones del modelo base por si imponen restricciones adicionales que no se reflejen en este repositorio.
- El repositorio ocupa 94,3 GB y requiere 65 shards; verificar el espacio en disco y el ancho de banda de descarga antes de intentar el despliegue.
- Requiere `custom_code` y `trust_remote_code=True`, lo que supone ejecutar codigo de terceros en el entorno de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/patrickbdevaney/MiMo-V2.6-Flash-REAP50
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Repositorio de la herramienta de poda: https://github.com/patrickbdevaney/xiaomi-2.6-flash-REAP
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos eran contenido no relacionado con la consulta, por lo que no se incluyen enlaces adicionales.
