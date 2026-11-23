# patrickbdevaney/MiMo-V2.6-Flash-REAP50

## Resumen

MiMo-V2.6-Flash-REAP50 es una variante podada del modelo multimodal MiMo-V2.6-Flash-RL de Xiaomi MiMo, publicada por el desarrollador independiente patrickbdevaney. Se trata de un transformer disperso de tipo mixture-of-experts (MoE) al que se le ha eliminado el 50 % de los expertos enrutados de cada capa: de 256 expertos por capa se pasa a 128, con un total de 159.334.077.952 parametros en el checkpoint publicado. El objetivo declarado es que el modelo quepa y pueda servirse en una unica NVIDIA Jetson AGX Thor con 117 GiB de memoria unificada, ocupando 86,1 GiB distribuidos en 65 shards.

La poda no se hizo por frecuencia de activacion, sino mediante un criterio de saliencia acumulada sobre un corpus de calibracion y una seleccion de conjunto de poda resuelta con el objetivo HOPE, que minimiza el error de salida incluyendo los terminos de interaccion entre expertos (REAP seria el mismo objetivo con los terminos fuera de la diagonal anulados). Se preservan las entradas de vision, audio y video, y el checkpoint incluye el `audio_tokenizer/`. El modelo se distribuye en formato safetensors de 8 bits (fp8) y hereda la licencia MIT del modelo base.

Es relevante para quienes necesitan desplegar un MoE multimodal de gran tamano en hardware de borde o en una sola GPU, aceptando una transformacion con perdida e irreversible a cambio de una reduccion sustancial de memoria. La model card reporta una retencion de masa de salida muy alta por dominio (peor dominio: audio, 0,9935; media: 0,9964), aunque estos valores proceden del propio autor y no de una evaluacion independiente de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto, imagen, audio, video), podado con REAP/HOPE |
| Parametros totales | 159.334.077.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | checkpoint publicado en 8-bit (fp8); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (calibracion en ingles y chino segun la model card) |
| Licencia | MIT (heredada del modelo base, atribucion a Xiaomi MiMo) |
| Formato de pesos | safetensors (65 shards, 86,1 GiB; repo de 94,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de Xiaomi MiMo con 47 capas de routers y 256 expertos enrutados por capa. Esta variante aplica una poda uniforme del 50 % (ratio 0,50) en todas las capas, reduciendo a 128 expertos por capa. La seleccion de expertos se basa en saliencia acumulada sobre un corpus de calibracion con el criterio `reap_1_1_1` y el objetivo `hope`, que incorpora los terminos de interaccion entre expertos en la funcion de error; el valor reportado del objetivo es pᵀFp = 0,01624. Se protegio el 8 % superior de cada dominio fuera del conjunto de poda y el ranking se hizo por el peor dominio, no por la media.

Tras la poda, las columnas de router correspondientes a los expertos eliminados se reajustaron por coincidencia de salida contra el profesor sin podar, con todos los expertos congelados: se reajustaron 47 routers y los 47 conservaron los pesos del profesor porque el ajuste no supero la linea base. La model card no detalla el volumen de tokens de entrenamiento original ni la composicion exacta del dataset del modelo base, solo la mezcla de calibracion (texto ingles/chino, codigo, matematicas, ciencia, finanzas, trazas agenticas y leyendas de imagen/audio/video). No se incluye la cabeza de decodificacion especulativa `dflash/` del repositorio original, ya que fue entrenada contra el conjunto de expertos sin podar.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Entrada multimodal: imagen, audio y video (se preservan tras la poda; se incluye `audio_tokenizer/`).
- Razonamiento, matematicas, ciencia y finanzas (dominios presentes en la calibracion).
- Generacion y comprension de codigo.
- Trazas agenticas y razonamiento multi-paso (dominio `agentic` en la calibracion).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; la calibracion cubre ingles y chino.
- Modo thinking o decodificacion especulativa: no disponible (la cabeza `dflash/` no se incluye).

## Casos de uso

- Inferencia multimodal en el borde: el modelo cabe en una unica Jetson AGX Thor (117 GiB de memoria unificada) con 86,1 GiB de pesos, lo que permite desplegar vision, audio y video en un dispositivo embebido sin cluster.
- Procesamiento de video y audio en local: al preservarse las entradas de audio y video y el tokenizador de audio, sirve para transcripcion, descripcion de contenido audiovisual o indexacion de archivos multimedia en entornos con requisitos de privacidad.
- Asistente conversacional de dominio tecnico: su calibracion incluye codigo, matematicas y ciencia, por lo que es adecuado para asistencia en desarrollo y analisis tecnico en una sola GPU.
- Analisis de documentos con imagenes: la retencion en el dominio de imagen (0,9937) permite tareas de comprension de capturas, diagramas o documentos escaneados.
- Prototipado de agentes: el dominio agentico figura en la calibracion, lo que lo hace util para experimentar con flujos multi-paso, siempre validando el soporte real de tool calling.
- Despliegue en laboratorio o investigacion: al ser MIT y de un solo dispositivo, es apropiado para reproducir experimentos de poda de MoE y comparar contra el modelo base sin podar.
- Servicio de inferencia de bajo coste energetico: un unico nodo con memoria unificada reduce el coste frente a configuraciones multi-GPU para cargas moderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas internas de retencion de masa de salida por dominio de calibracion:

| Dominio | Retencion |
|---|---|
| audio | 0,9935 |
| image | 0,9937 |
| video | 0,9938 |
| science | 0,9973 |
| math | 0,9974 |
| finance | 0,9974 |
| ballast | 0,9976 |
| code | 0,9983 |
| agentic | 0,9983 |

Media retenida: 0,9964. Peor dominio retenido: 0,9935 (audio). Estos valores no equivalen a resultados de MMLU, HumanEval o GSM8K y no deben interpretarse como tales.

## Requisitos de hardware

- VRAM/memoria estimada: 86,1 GiB de pesos en fp8, mas overhead de activaciones y cache KV; el autor lo dimensiona para 117 GiB de memoria unificada.
- GPU recomendadas: NVIDIA Jetson AGX Thor (objetivo declarado). Para GPUs de centro de datos se requeriria al menos una GPU con memoria suficiente para 86,1 GiB de pesos mas overhead (p. ej. H100 80 GB no bastaria en fp8 sin offload; A100 80 GB tampoco).
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB en fp8; requeriria cuantizacion adicional no publicada.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code`); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-REAP50 | 159,3 B (MoE podado 50 %) | no disponible | Si (texto, imagen, audio, video) | MIT | Hugging Face |
| XiaomiMiMo/MiMo-V2.6-Flash-RL (base) | no disponible (256 expertos/capa) | no disponible | Si | MIT | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta variante y el modelo base ni con otros MoE multimodales, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La poda es una transformacion con perdida e irreversible: los expertos eliminados no se recuperan.
- La calibracion cubre ingles/chino, codigo, matematicas, ciencia, finanzas, trazas agenticas y leyendas multimedia; dominios fuera de esa mezcla no fueron medidos y pueden degradarse mas de lo indicado.
- Las metricas de retencion las aporta el propio autor; no hay evaluacion independiente con benchmarks estandar.
- No se incluye la cabeza de decodificacion especulativa `dflash/`, por lo que se pierde la aceleracion asociada al modelo original.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar el modelo base, cabe esperar los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: no cuantificado; aplicable el riesgo habitual de los modelos generativos.
- Idioma: no hay lista oficial de idiomas soportados; el soporte fuera de ingles y chino no esta verificado.
- Licencia MIT permite uso comercial con atribucion a Xiaomi MiMo; conviene revisar los terminos del modelo base.
- Para produccion, verificar el soporte real de tool calling y el rendimiento en el hardware objetivo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/patrickbdevaney/MiMo-V2.6-Flash-REAP50
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Repositorio del proceso de poda: https://github.com/patrickbdevaney/xiaomi-2.6-flash-REAP
