# mradermacher/Huihui-gemma-3n-E4B-it-abliterated-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Huihui-gemma-3n-E4B-it-abliterated, una variante "abliterated" (sin mecanismos de rechazo) del Gemma 3n E4B-it de Google. Las cuantizaciones las ha generado mradermacher, un conocido autor de cuantizaciones para llama.cpp, usando el método i1 (imatrix), que emplea una matriz de importancia calculada sobre un corpus de calibración para reducir la pérdida de calidad en bits bajos. El resultado es un conjunto de ficheros GGUF listos para ejecutarse en hardware de consumo.

El modelo conserva la naturaleza multimodal de la familia de origen: las etiquetas del repositorio incluyen reconocimiento automático de voz, traducción automática de voz, audio-a-texto y vídeo-a-texto, además de visión (la model card indica explícitamente que es un modelo de visión). No obstante, el repositorio i1 no incluye los ficheros mmproj necesarios para procesar imagen, audio o vídeo: estos se distribuyen en el repositorio estático del mismo autor.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar localmente un modelo multimodal de aproximadamente 6.870 millones de parámetros totales en GPUs de gama media gracias a cuantizaciones de entre 4,0 y 4,8 GB. Por otro, al tratarse de una versión abliterated, está orientado a investigación en seguridad, red-teaming y evaluación del comportamiento de rechazo, no a despliegues de producción que requieran alineación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Gemma 3n E4B; no se detalla en la informacion proporcionada) |
| Parametros totales | 6.868.990.448 (dato real de safetensors) |
| Parametros activos | no disponible (no se confirma si la cadena base emplea un esquema de parametros efectivos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (generadas con imatrix, prefijo i1) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | gemma (Gemma Terms of Use, con acceso condicionado a aceptar la licencia de Google) |
| Formato de pesos | GGUF (cuantizaciones i1); los pesos originales de la cadena base estan en safetensors |
| Autor de las cuantizaciones | mradermacher (nethype GmbH) |
| Modelo base | huihui-ai/Huihui-gemma-3n-E4B-it-abliterated |
| Tamano del repositorio | 12.8 GB |
| Pipeline declarado | automatic-speech-recognition |
| Modalidades | texto, vision, audio y video (los ficheros mmproj no se incluyen en este repositorio) |
| Fecha de publicacion | 20 de septiembre de 2026 (metadatos de Hugging Face) |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |

Tamanos confirmados en la tabla de la model card:

| Fichero | Tipo | Tamano | Nota del autor |
|---|---|---|---|
| Huihui-gemma-3n-E4B-it-abliterated.i1-Q2_K.gguf | i1-Q2_K | 4.0 GB | "IQ3_XXS probably better" |
| Huihui-gemma-3n-E4B-it-abliterated.i1-IQ3_M.gguf | i1-IQ3_M | 4.3 GB | sin nota |
| Huihui-gemma-3n-E4B-it-abliterated.i1-Q4_K_S.gguf | i1-Q4_K_S | 4.8 GB | "optimal size/speed/quality" |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF, DPO u otras) de esta cadena de modelos. Lo unico documentado es la cadena de derivacion: los pesos originales corresponden a un modelo Gemma 3n E4B-it, sobre el que se aplico una tecnica de abliteration en el repositorio huihui-ai/Huihui-gemma-3n-E4B-it-abliterated, y posteriormente mradermacher genero cuantizaciones GGUF con el metodo i1 (imatrix).

La innovacion tecnica destacable de este repositorio no esta en el modelo, sino en el proceso de cuantizacion. El metodo i1 utiliza una matriz de importancia (imatrix) que pondera cada peso segun su relevancia medida sobre un corpus de calibracion (la model card referencia la etiqueta nicoboss), lo que permite obtener calidad superior a las cuantizaciones estaticas del mismo tamano, especialmente en los niveles muy bajos (IQ1, IQ2, IQ3). Los metadatos indican ademas que la cuantizacion se aplica sobre tensores de salida (output_tensor_quantised: 1) y que los ficheros mmproj se han omitido deliberadamente (skip_mmproj: 1). Existe un repositorio hermano con cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, con el pipeline declarado como automatic-speech-recognition.
- Reconocimiento automatico de voz (ASR) y traduccion automatica de voz (ASST), segun las etiquetas del repositorio.
- Procesamiento audio-a-texto y video-a-texto (video-text-to-text), segun las etiquetas.
- Vision por computador: la model card indica explicitamente que es un modelo de vision.
- Modo conversacional sin alineacion de rechazo (abliterated / uncensored): responde a peticiones que un modelo alineado rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (en).
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con inferencia tipo API compatible, aunque no se especifica el backend.

## Casos de uso

- Transcripcion de audio local: el modelo puede procesar audio directamente (etiqueta automatic-speech-recognition) sin enviar los ficheros a un servicio externo, algo relevante para material confidencial. Requiere obtener el fichero mmproj del repositorio estatico del mismo autor.
- Traduccion automatica de voz: con la etiqueta automatic-speech-translation, encaja en flujos de subtitulado y doblaje donde se necesita pasar de audio a texto traducido en una sola etapa.
- Descripcion y resumen de video: la modalidad video-text-to-text permite generar resumenes o descripciones de clips, util para indexado de archivos audiovisuales y busqueda interna.
- Investigacion en seguridad y red-teaming: al ser abliterated, es adecuado para estudiar direcciones de rechazo, medir tasas de cumplimiento ante peticiones daninas y evaluar tecnicas de mitigacion, siempre en entornos controlados.
- Generacion de datos sinteticos con baja censura: util para crear datasets de entrenamiento o evaluacion que requieran respuestas que un modelo alineado no produciria, con revision humana posterior obligatoria.
- Asistente conversacional offline: con cuantizaciones de 4,0 a 4,8 GB, cabe en portatiles con GPU de 8 GB o en equipos con CPU y RAM suficiente, lo que permite asistentes sin conexion.
- Vision aplicada a documentos: analisis de capturas, diagramas o imagenes para extraccion de informacion, integr borneado en herramientas internas mediante llama-server con API compatible con OpenAI.
- Prototipado rapido en pipelines de datos: el formato GGUF y el prefijo i1 permiten desplegar el modelo en llama.cpp o Ollama dentro de un contenedor para tareas batch de clasificacion y resumen de contenido multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para esta version abliterated ni para sus cuantizaciones. Tampoco se aportan mediciones de perplexity de los distintos niveles de cuantizacion; la model card se limita a enlazar una grafica comparativa de ikawrakow y las notas de Artefact2 sobre tipos de cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 4,0 GB para i1-Q2_K, 4,3 GB para i1-IQ3_M y 4,8 GB para i1-Q4_K_S. Hay que anadir el espacio de la cache KV segun la longitud de contexto y el fichero mmproj si se usan modalidades de vision o audio.
- Estimacion practica con contexto corto: entre 5 y 7 GB de VRAM total para las cuantizaciones confirmadas.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB y superiores ejecutan i1-Q4_K_S con holgura. Tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) pueden ejecutar i1-Q4_K_S o i1-IQ3_M con contextos reducidos.
- GPU de centro de datos: A100, H100 y L40S son sobredimensionadas para este tamano; su uso tendria sentido solo para servir muchas instancias en paralelo.
- Apple Silicon: equipos con 16 GB de memoria unificada en adelante pueden ejecutar las cuantizaciones de 4-5 GB junto con el sistema operativo.
- CPU y RAM: es viable la inferencia solo con CPU; se recomienda un minimo de 8 GB de RAM libre para las cuantizaciones confirmadas y 16 GB para niveles superiores (Q5_K_M, Q6_K).
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama, LM Studio, koboldcpp, Jan y text-generation-webui. vLLM y TGI no cargan GGUF de forma generalizada; para esos backends habria que partir de los pesos safetensors de la cadena base.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| mradermacher/Huihui-gemma-3n-E4B-it-abliterated-i1-GGUF | 6.868.990.448 | no disponible | GGUF (i1, imatrix) | gemma | Publico, 0 descargas y 0 likes en el momento de la consulta | Cuantizaciones con imatrix, mmproj no incluido |
| huihui-ai/Huihui-gemma-3n-E4B-it-abliterated | no disponible en la informacion proporcionada | no disponible | safetensors | gemma | Publico (modelo base de esta cadena) | Version abliterated sin cuantizar con los pesos de referencia |
| mradermacher/Huihui-gemma-3n-E4B-it-abliterated-GGUF | los mismos | no disponible | GGUF (cuantizaciones estaticas) | gemma | Publico | Repositorio hermano; contiene los ficheros mmproj para vision y audio |
| Gemma 3n E4B-it (Google) | no disponible en la informacion proporcionada | no disponible | safetensors | gemma, con acceso condicionado | Repositorio con gating en Hugging Face | Modelo de origen implicado por la denominacion; mantiene la alineacion de seguridad |

No se dispone de datos de rendimiento comparado entre estas variantes. Alternativas de otros fabricantes en la misma franja (por ejemplo modelos multimodales de 4 a 8 mil millones de parametros) no se cubren en la informacion proporcionada.

## Limitaciones y advertencias

- Abliteration: la eliminacion de las direcciones de rechazo suele implicar una degradacion de la coherencia y de la calidad general del modelo; no se han publicado evaluaciones que cuantifiquen ese deterioro.
- Ausencia de alineacion de seguridad: el modelo puede generar contenido danino, ilegal o inseguro sin filtros. No es apto para produccion orientada al usuario final sin capas de moderacion externas.
- Riesgo de alucinacion: no se aportan datos de fiabilidad, pero es esperable el comportamiento tipico de un modelo de este tamano, con invencion de hechos en tareas de conocimiento abierto.
- Cobertura idiomatica: la model card solo declara ingles. El rendimiento en castellano no esta documentado y puede ser sensiblemente peor.
- Contexto: no se especifica la longitud de contexto soportada; planificar despliegues con valores conservadores hasta verificarlo.
- Licencia Gemma: el acceso esta condicionado a aceptar las condiciones de uso de Google. Existen restricciones de uso recogidas en la politica de usos prohibidos, y la redistribucion obliga a transmitir la licencia y las condiciones.
- Cuantizaciones de muy bajo bit: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS y Q2_K degradan la calidad de forma notable. El propio autor recomienda IQ3_XXS por encima de Q2_K y senala i1-Q4_K_S como el punto optimo entre tamano, velocidad y calidad.
- Multimodalidad incompleta en este repositorio: los ficheros mmproj se han omitido (skip_mmproj: 1). Para usar vision, audio o video hay que descargarlos del repositorio estatico, y no se garantiza que sean intercambiables sin verificacion.
- Etiquetas heredadas: las capacidades de ASR, traduccion de voz y video provienen de la cadena base; la abliteration actua sobre el comportamiento de rechazo y su efecto sobre los modulos multimodales no esta documentado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Fecha de publicacion poco habitual (2026) en los metadatos, lo que conviene verificar antes de citar el repositorio.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/mradermacher/Huihui-gemma-3n-E4B-it-abliterated-i1-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-gemma-3n-E4B-it-abliterated
- Cuantizaciones estaticas (incluye los ficheros mmproj): https://huggingface.co/mradermacher/Huihui-gemma-3n-E4B-it-abliterated-GGUF
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#Huihui-gemma-3n-E4B-it-abliterated-i1-GGUF
- Peticiones de modelos y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF y concatenacion de ficheros multiparte: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
- Perfil del colaborador que cedio acceso de computo: https://huggingface.co/nicoboss
- Nota: los resultados de busqueda web disponibles en esta consulta corresponden a foros de MSDN ajenos por completo al modelo y no aportan informacion tecnica utilizable.
