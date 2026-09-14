# phonsobon/Whisper-Small-Khmer-Final-v3-2000

## Resumen

Whisper-Small-Khmer-Final-v3-2000 es un ajuste fino (fine-tune) del modelo Whisper Small de OpenAI, publicado por el usuario phonsobon en HuggingFace. Por el nombre del repositorio se deduce que el objetivo es el reconocimiento automatico del habla (ASR) en jemer (khmer), idioma minoritario en cuanto a recursos y con un sistema de escritura propio que los modelos multilingues genericos suelen transcribir con una tasa de error alta. El modelo cuenta con 241.734.912 parametros reales segun los pesos en safetensors, lo que coincide con el tamano de Whisper Small, y el repositorio ocupa aproximadamente 1,0 GB.

La relevancia de esta publicacion es limitada pero concreta: se trata de un artefacto comunitario, no de un lanzamiento de laboratorio, con 12 descargas y 0 "likes" en el momento de la consulta, y con acceso restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo. La ficha del repositorio no incluye model card, licencia declarada, idiomas soportados ni resultados de evaluacion, de modo que cualquier decision de adopcion en produccion exige una validacion propia sobre un corpus de jemer etiquetado.

Al estar construido sobre Whisper Small, hereda la arquitectura transformer encoder-decoder de OpenAI, su ventana de audio de 30 segundos por inferencia y su capacidad teorica de transcripcion multilingue, aunque el ajuste fino pudo haber especializado el decodificador hacia el jemer y degradado el resto de idiomas. El sufijo "2000" del nombre (probablemente pasos de entrenamiento o numero de muestras) no esta documentado en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia OpenAI Whisper, variante Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la arquitectura Whisper Small procesa ventanas de audio de 30 s con una secuencia de texto de hasta 448 tokens en el decodificador |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y no se documentan variantes GGUF, int8 ni int4 |
| Idiomas soportados | no disponible; por el nombre del repositorio, el objetivo declarado es el jemer (khmer) |
| Licencia | no disponible en el repositorio; el modelo base OpenAI Whisper Small se publico bajo licencia MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,0 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper Small: un transformer encoder-decoder con 12 capas en el encoder y 12 en el decodificador, dimension de modelo de 768 y 12 cabezas de atencion, alimentado con espectrogramas mel-log de 80 canales calculados sobre fragmentos de audio de 30 segundos. El modelo base fue entrenado por OpenAI sobre 680.000 horas de audio supervisado y etiquetado debilmente, con capacidad multilingue de transcripcion y de traduccion al ingles. No hay informacion en el repositorio que confirme si el autor ha modificado la configuracion de la arquitectura o el vocabulario.

En cuanto al proceso de ajuste fino, la informacion disponible es nula: no se documentan el numero de horas o de muestras de audio en jemer, la composicion del dataset, la existencia de aumentacion de datos, el uso de LoRA frente a ajuste completo, la tasa de aprendizaje, el numero de pasos ni si se aplico alguna fase de RLHF o DPO (en tareas ASR lo habitual es entrenamiento supervisado con CTC o cross-entropy sobre el decodificador). Tampoco se especifica la procedencia de las transcripciones ni el reparto train/validation/test, lo que impide reproducir el entrenamiento o auditar posibles fugas de datos.

## Capacidades

- Reconocimiento automatico del habla en jemer: es la capacidad principal y la unica que justifica el ajuste fino, segun el nombre del repositorio.
- Transcripcion de audio de hasta 30 segundos por pasada en una sola llamada de inferencia.
- Procesamiento por lotes (batching) y ventanas solapadas para audios largos mediante la estrategia de chunking de la pipeline de Whisper.
- Posible traduccion de voz al ingles: es una capacidad del modelo base Whisper Small, pero no hay evidencia de que este fine-tune la conserve.
- Marcas de tiempo a nivel de segmento y de palabra: disponibles en la implementacion estandar de Whisper, no confirmadas para este checkpoint.
- Soporte de tool calling / function calling: no disponible. Whisper no es un modelo de instrucciones ni expone interfaz de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible. Es un modelo puramente de conversion voz-texto.
- Capacidades multilingues: no disponibles. Cabria esperar una degradacion del rendimiento en idiomas distintos del jemer por efecto del ajuste fino.
- Capacidades de vision, audio comprensivo o modo de razonamiento explicito: no disponibles.

## Casos de uso

- Transcripcion de reuniones y entrevistas en jemer: el modelo puede convertir grabaciones de hasta 30 segundos por bloque en texto, encadenando bloques con solapamiento para cubrir sesiones de una hora; el resultado se post-procesa para unir segmentos y anadir marcas de tiempo.
- Subtitulado automatico de videos para plataformas de contenido: se generan ficheros SRT o VTT a partir de la salida con timestamps del decodificador, con revision humana posterior dado que no hay metricas publicas de calidad.
- Atencion al cliente en centros de contacto de Camboya: transcripcion de llamadas grabadas para alimentar sistemas de analitica, busqueda por palabras clave y control de calidad; requiere anonimizacion previa por tratarse de datos personales.
- Archivado y digitalizacion de material audiovisual historico en jemer: indexacion de fondos de audio o video con busqueda de texto completo, aprovechando que el modelo es ligero y puede ejecutarse en local sin enviar material sensible a servicios externos.
- Generacion de corpus textuales para entrenar otros modelos de PLN en jemer: transcripcion masiva de audio con revisión manual para crear datasets de texto en un idioma con pocos recursos.
- Accesibilidad para personas con discapacidad auditiva: subtitulado en directo o diferido de emisiones en jemer, con la limitacion de que la latencia dependera del hardware y no de un servicio en streaming optimizado.
- Procesamiento por lotes en servidores modestos: con 242 M de parametros, el modelo cabe en GPUs de gama media o incluso en CPU, lo que permite desplegar transcripcion en infraestructura propia dentro de Camboya, con posibles requisitos de residencia de datos.
- Investigacion en ASR de bajos recursos: servir como linea base sobre la que comparar tecnicas de adaptacion (LoRA, adaptadores, destilacion) para jemer, siempre que se genere una particion de evaluacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye WER, CER, MMLU, ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo, unicamente resultados no relacionados (portales de empleo y aplicaciones de listas de tareas).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,5-1,0 GB de pesos mas el pico de memoria de las activaciones y del buffer de atencion sobre 30 segundos de audio; en la practica, menos de 2 GB en total.
- VRAM estimada en fp32: aproximadamente 1,0-1,5 GB solo de pesos, mas activaciones; utilizable en cualquier GPU moderna.
- Cabe en GPU de consumo: si. Funciona con holgura en RTX 3060, RTX 4060, RTX 4090 y tarjetas integradas con al menos 4 GB de memoria compartida, asi como en CPU (Apple Silicon, x86 con AVX2).
- GPU de datacenter: A100, H100, L40S o T4 no son necesarias para un modelo de este tamano; solo se justifican para procesar grandes volumenes en paralelo o para servir muchos clientes concurrentes.
- Opciones de despliegue: transformers con pipeline de ASR, faster-whisper (CTranslate2, requiere conversion desde safetensors), WhisperX para alineamiento temporal, y servidores tipo TGI o vLLM solo si se implementa un backend de audio compatible (no estandar para Whisper). Ollama y llama.cpp dependen de que exista una conversion a GGUF, que el autor no publica.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud para este tamano de modelo, la transcripcion suele ser varias veces mas rapida que el tiempo real en GPU moderna y aproximadamente en tiempo real o algo mas lenta en CPU, pero no hay mediciones publicadas para este checkpoint y el factor real depende del backend y del lote.
- No se publican requisitos de entrenamiento ni posibilidad de reajuste fino documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad | Rendimiento en jemer |
|---|---|---|---|---|---|---|
| phonsobon/Whisper-Small-Khmer-Final-v3-2000 | 241,7 M | 30 s por ventana | No declarados (objetivo: jemer) | No disponible en el repo | Gated en HuggingFace, 12 descargas | No disponible (sin benchmarks) |
| OpenAI Whisper Small (base) | 244 M | 30 s por ventana | 99 idiomas declarados | MIT | Publico en HuggingFace y OpenAI | No disponible de forma especifica por idioma en esta comparativa |
| OpenAI Whisper Large-v3 | 1.550 M | 30 s por ventana, con mejoras en audios largos | 99 idiomas declarados | MIT | Publico en HuggingFace | No disponible de forma especifica por idioma en esta comparativa |
| Otros fine-tunes comunitarios de Whisper para jemer | no disponible | no disponible | no disponible | variable | repositorios dispersos en HuggingFace | no disponible |

No se dispone de evaluaciones comparativas verificadas entre estas alternativas en jemer, por lo que la eleccion entre ellas deberia basarse en una evaluacion propia con un conjunto de test representativo del dominio objetivo.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros, metodo de ajuste ni proceso de evaluacion, lo que impide reproducir o auditar el modelo.
- Sin benchmarks publicados: no hay WER ni CER, de modo que no puede afirmarse que mejore al Whisper Small original en jemer sin medirlo.
- Licencia no declarada: el repositorio no especifica terminos de uso. Aunque el modelo base Whisper Small se publico bajo MIT, la ausencia de licencia explicita en este fine-tune genera incertidumbre juridica para uso comercial; conviene contactar con el autor antes de desplegarlo en produccion.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion a la automatizacion de pipelines de descarga y despliegue.
- Riesgo de alucinacion tipico de Whisper: en silencios, ruido de fondo, musica o solapamiento de voces el modelo puede generar texto plausible pero inexistente, un problema especialmente grave en transcripcion de llamadas o material legal.
- Contexto limitado a 30 segundos por inferencia: los audios largos requieren chunking con solapamiento y post-procesado, con riesgo de cortes en palabras y duplicacion de segmentos.
- Posible perdida de capacidades multilingues tras el ajuste fino: el modelo puede degradarse en idiomas distintos del jemer e incluso mezclar caracteres latinos en la salida.
- Ambiguedad del sufijo "2000" y de la etiqueta "Final-v3": no se aclara si corresponde a pasos, horas o numero de muestras, ni la relacion con versiones anteriores del mismo autor.
- Adopcion marginal: 12 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y practicamente nula trazabilidad de errores.
- Sin informacion sobre sesgos: no se documenta la distribucion de acentos, dialectos, genero, edad ni registros del audio de entrenamiento, por lo que puede funcionar mal con variedades regionales del jemer o con habla informal.
- Sin soporte de herramientas ni agentes: no cabe integrarlo en flujos de razonamiento multi-paso sin anadir capas externas de procesamiento de texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/phonsobon/Whisper-Small-Khmer-Final-v3-2000
- Modelo base de referencia (OpenAI Whisper Small): https://huggingface.co/openai/whisper-small
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- faster-whisper (backend CTranslate2 para servir Whisper con menor latencia): https://github.com/SYSTRAN/faster-whisper
- WhisperX (alineamiento temporal y diarizacion): https://github.com/m-bain/whisperX
- La busqueda web realizada no ha devuelto papers, blogs ni demos asociados a este modelo concreto; los resultados obtenidos correspondian a sitios de empleo y aplicaciones de gestion de tareas, sin relacion con el modelo.
