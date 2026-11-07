# projectlosangeles/midigas

## Resumen

MIDI GAS es una coleccion de clasificadores preentrenados para la identificacion y clasificacion de genero, artista y cancion en archivos MIDI. Lo desarrolla Project Los Angeles (asigalov61), un autor conocido en el ecosistema de generacion musical simbolica, bajo el paraguas de "Tegridy Code 2026". El modelo resuelve una tarea concreta y acotada: dado un fichero MIDI, predecir su genero musical a partir de la secuencia de eventos simbolicos. Es relevante para pipelines de etiquetado automatico de datasets MIDI, sistemas de recomendacion musical y herramientas de organizacion de librerias de partituras y secuencias.

La model card publica describe dos cabeceras de clasificacion sobre la misma base: una de 23 generos primarios y otra de 193 generos matizados. Ambas comparten una longitud de secuencia de 2000 tokens y 25,78 millones de parametros, e incorporan PoPE y PPNorm como componentes de la arquitectura. El repositorio ocupa 0,2 GB y la licencia es Apache 2.0.

No es un modelo generativo de texto ni un LLM: es un clasificador especializado en representaciones MIDI. Por tanto, las secciones de esta ficha relativas a generacion de lenguaje, tool calling o agentes no aplican y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre secuencia de eventos MIDI con PoPE/PPNorm (detalle completo no disponible) |
| Parametros totales | 25,78 M por cabecera de clasificacion |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2000 tokens de secuencia MIDI |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,2 GB; no se detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo transformer con longitud de secuencia de 2000 tokens y 25,78 millones de parametros, que emplea PoPE y PPNorm. PoPE se asocia habitualmente a codificaciones posicionales relativas en secuencias, y PPNorm a una variante de normalizacion; la model card no detalla la implementacion concreta ni como se tokenizan los eventos MIDI (nota, velocity, tiempo, canal). No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion ni el vocabulario de tokens MIDI.

El entrenamiento se realizo sobre el dataset `asigalov61/MIDI-GAS`, segun los metadatos de la model card. No se documenta el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si hubo ajuste fino con RLHF o DPO (poco probable en una tarea de clasificacion). La metrica declarada es accuracy. Se publican dos cabeceras: 23 generos primarios y 193 generos matizados, ambas con la misma longitud de secuencia y numero de parametros.

## Capacidades

- Clasificacion de genero MIDI en 23 categorias primarias (alternative, blues, classical, country, electronic, folk, funk, gospel, hip-hop, jazz, latin, metal, new age, pop, punk, r&b, reggae, rock, soundtrack, world, entre otras).
- Clasificacion de genero MIDI en 193 categorias matizadas (subgeneros como black metal, bossa nova, chicago soul, drum track, synthpop, video games music, etc.).
- Etiquetado de artista y cancion segun los tags del repositorio (la model card no detalla las cabeceras correspondientes ni sus clases).
- Entrada basada en secuencias MIDI de hasta 2000 tokens.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni uso como agente.
- Capacidades multilingues limitadas a etiquetas en ingles; la clasificacion musical es independiente del idioma del texto.

## Casos de uso

- Etiquetado automatico de datasets MIDI: procesar grandes corpus de ficheros `.mid` y asignar genero primario o matizado para indexacion y filtrado, aprovechando la cabecera de 23 o 193 clases.
- Organizacion de librerias de partituras y secuencias: clasificar automaticamente una coleccion personal o corporativa de MIDI por genero para busqueda y navegacion.
- Sistemas de recomendacion musical simbolica: usar la etiqueta de genero como feature en un motor de recomendacion sobre catalogos MIDI.
- Curacion de datasets para entrenamiento de modelos generativos musicales: filtrar por genero antes de entrenar modelos de generacion simbolica, reduciendo ruido en el corpus.
- Investigacion en musicologia computacional: analisis de distribucion de generos en corpus MIDI historicos o regionales.
- Preprocesado en pipelines de conversion MIDI a audio: enrutar cada fichero a plantillas de instrumentacion o sintetizadores especificos del genero detectado.
- Moderacion y control de calidad de contenido musical: detectar ficheros mal etiquetados o fuera de catalogo en plataformas que distribuyen MIDI.

## Benchmarks y rendimiento

Resultados publicados en la model card para el clasificador de 23 generos primarios (conjunto de validacion):

| Metrica | Valor |
|---|---|
| Validation loss | 0,1368 |
| Validation accuracy | 0,9648 |
| Validation precision | 0,9720 |
| Validation recall | 0,9680 |
| Validation F1 | 0,9676 |

No se han publicado resultados de benchmarks para el clasificador de 193 generos matizados ni comparaciones con modelos alternativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 25,78 M de parametros (los pesos ocupan aproximadamente 100 MB); el cuello de botella es el preprocesado MIDI, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior ofrece margen amplio para procesamiento por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un clasificador de este tipo). El despliegue habitual seria via PyTorch o el runtime del autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La model card no incluye comparaciones con alternativas de clasificacion de genero MIDI.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MIDI GAS (23 generos) | 25,78 M | 2000 tokens MIDI | Apache 2.0 | Hugging Face |
| MIDI GAS (193 generos) | 25,78 M | 2000 tokens MIDI | Apache 2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito restringido: solo clasifica genero (y presumiblemente artista/cancion segun los tags), no genera musica ni texto.
- Sesgo de dominio: el rendimiento fuera de la distribucion del dataset `asigalov61/MIDI-GAS` (por ejemplo, MIDI de produccion contemporanea, microtonal o de generos no representados) no esta documentado y puede degradarse.
- Riesgo de confusion en generos solapados: con 193 clases, subgeneros cercanos (p. ej. rock, hard rock, classic rock, modern rock) pueden confundirse; no se publican metricas por clase.
- Longitud de secuencia fija de 2000 tokens: piezas MIDI largas requeriran truncado o segmentacion, con posible perdida de informacion.
- Documentacion escasa: no se detallan formatos de pesos, procedimiento de tokenizacion MIDI, ni el pipeline de inferencia, lo que dificulta la reproducibilidad.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar la licencia del dataset de entrenamiento (`asigalov61/MIDI-GAS`) por posibles restricciones heredadas.
- Modelo con muy poca traccion (0 descargas, 1 like en el momento de la consulta): no hay validacion independiente de los resultados declarados.
- No apto para tareas de lenguaje natural, codigo, matematicas o vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/projectlosangeles/midigas
- Arbol de ficheros: https://huggingface.co/projectlosangeles/midigas/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/asigalov61/MIDI-GAS
- Perfil del autor: https://huggingface.co/projectlosangeles
