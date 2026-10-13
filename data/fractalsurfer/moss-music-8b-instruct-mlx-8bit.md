# FractalSurfer/MOSS-Music-8B-Instruct-mlx-8bit

## Resumen

MOSS-Music-8B-Instruct-mlx-8bit es una conversión comunitaria del modelo OpenMOSS-Team/MOSS-Music-8B-Instruct al formato MLX de Apple y su posterior cuantización a 8 bits. Lo publica el usuario FractalSurfer y no se trata de un modelo nuevo, sino de una redistribución optimizada para ejecutarse en local sobre Apple Silicon (Mac). El modelo original es un audio-language model orientado a la comprensión musical: recibe un clip de audio y responde en texto a preguntas sobre lo que suena.

El problema que resuelve es doble. Por un lado, permite analizar música en local sin enviar audio a servicios externos, algo relevante cuando se trabaja con catálogos propios o material sensible. Por otro, su conversión a MLX con cuantización de 8 bits reduce el peso en disco a 10,4 GB y el pico de memoria a 11,3 GB, lo que lo hace viable en un Mac con 24 GB de memoria unificada. El autor lo construyó como el componente de "oído" local de su proyecto Trainspotting Suite, donde el modelo escucha cada pista en fragmentos de dieciséis compases y rellena un formulario estructurado con quién canta y cómo, cómo suena el sintetizador, las palabras y el estado de ánimo.

Arquitectónicamente, la información disponible indica que el modelo combina un codificador de audio, un adaptador de audio y tres módulos DeepStack merger, todos ellos mantenidos en bf16 (menos de 2 GB en conjunto), con un modelo de lenguaje Qwen3 que actúa como columna vertebral y que es la parte cuantizada a 8 bits. El repositorio declara 9.052.463.488 parámetros totales (unos 9.050 millones) y soporte de inglés y chino. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-language model: codificador de audio + adaptador de audio + tres DeepStack mergers (bf16) conectados a un modelo de lenguaje Qwen3 (cuantizado) |
| Parametros totales | 9.052.463.488 (unos 9.050 millones) |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits afina, tamano de grupo 64 (Qwen3, embeddings de tokens y lm_head). Codificador de audio, adaptador y mergers en bf16. Existe una variante hermana de 5 bits; el autor descarto publicar una de 4 bits por su mal comportamiento |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (la del modelo base) |
| Formato de pesos | safetensors en formato MLX (libreria mlx-audio, custom_code) |
| Tamano en disco | 10,4 GB |
| Pico de memoria medido (MLX) | 11,3 GB |
| Modelo base | OpenMOSS-Team/MOSS-Music-8B-Instruct (commit fce7f830) |

## Arquitectura y entrenamiento

La model card de esta conversion no documenta el entrenamiento del modelo base, solo el proceso de conversion. Sabemos que la parte de lenguaje es Qwen3 y que el sistema completo se organiza como un audio-language model: un codificador de audio procesa la senal, un adaptador la proyecta y tres modulos DeepStack merger la integran en la entrada del modelo de lenguaje. En esta conversion, la cuantizacion de 8 bits afecta al modelo Qwen3, a los embeddings de tokens y al lm_head; el codificador de audio, el adaptador y los mergers se dejan en bf16 porque su salida entra directamente en la entrada del modelo de lenguaje y, en conjunto, ocupan menos de 2 GB.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal, etc.). El proceso de conversion si esta detallado: se descargo el checkpoint original y se ejecuto el conversor de mlx-audio (`python -m mlx_audio.stt.models.moss_music.convert`) con `--quantize --q-bits 8 --q-group-size 64`, usando mlx 0.31.2 y mlx-audio 0.5.7, con un unico ajuste posterior del campo `model_repo` en `config.json`. El autor recomienda muestrear como pide Qwen3: temperatura 0,7, top-p 0,8 y top-k 20, con clips de unos 30 segundos y preguntas concretas.

## Capacidades

- Comprension musical a partir de audio: responde en texto a preguntas sobre instrumentacion, estado de animo, tipo de voz, sintetizadores empleados y letra.
- Generacion de texto descriptivo y estructurado derivado del audio, incluida la produccion de respuestas en formato JSON cuando se le pide rellenar un formulario.
- Conversacion multimodal audio-texto en un unico turno de pregunta-respuesta sobre un clip corto; el flujo documentado es pregunta sobre clip, no dialogo largo.
- Capacidades multilingues limitadas a ingles y chino, segun los metadatos del repositorio.
- Analisis de fragmentos musicales cortos (en torno a 30 segundos) con contexto de prompt largo cacheado, que el autor usa para reutilizar instrucciones de sistema entre clips.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta vision, generacion de audio ni sintesis de voz: el pipeline es exclusivamente audio-text-to-text.
- El autor no documenta un modo de razonamiento explicito para este checkpoint Instruct; de hecho advierte que abrir la respuesta con un bloque `<think>` vacio (practica valida en el checkpoint Thinking) degrada el resultado.

## Casos de uso

- Etiquetado automatico de catalogos musicales: dado un clip, el modelo devuelve instrumentacion, estado de animo y tipo de voz, lo que permite generar metadatos de bibliotecas musicales propias sin depender de APIs externas y sin sacar el audio de la maquina.
- Descripcion de musica para accesibilidad: generar textos descriptivos de una pista para personas con discapacidad auditiva o para fichas de catalogo que requieran una descripcion semantica del contenido.
- Curaduria y seleccion para DJ y produccion: el modelo identifica como suena un sintetizador o que instrumentos entran en un fragmento, util para clasificar material propio antes de una sesion o para decidir que pistas encajan en un set.
- Analisis musicologico de corpus: procesar fragmentos de una coleccion y volcar los resultados en un formulario JSON permite construir bases de datos analiticas sobre instrumentacion, genero percibido y estado de animo, siempre que se acepte el coste de 6 a 7 segundos por pregunta medido en un M4 Max.
- Trabajo local con material sensible o con derechos: al ejecutarse integramente en el Mac, encaja en flujos donde subir audio a un servicio en la nube no es viable por confidencialidad o por condiciones de licencia del material.
- Asistencia a la transcripcion de letras con revision humana: el modelo comenta las palabras de la cancion, lo que puede servir como primer borrador para sincronizacion de letras, teniendo en cuenta que el autor advierte de que en 1 de cada 32 preguntas se quedo repitiendo un verso y hubo que repetir la consulta.
- Integracion en herramientas de escritorio musicales: el caso de referencia es Trainspotting Suite, donde `python -m djkit ears fetch` descarga el modelo y lo usa como componente de escucha para rellenar formularios de cada pista.
- Analisis de contenido en plataformas: clasificar grandes volumenes de audio por mood o por presencia de voz cantada como paso previo a sistemas de recomendacion, con la advertencia de que la ventana de analisis documentada es corta (unos 30 segundos por clip).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han medido los resultados en los benchmarks que reporta la ficha del modelo base. Lo unico medido es una prueba propia del autor sobre un M4 Max de 64 GB, con preguntas de la fase de escucha de Trainspotting, un clip de 30 segundos, un prompt de sistema largo (cacheado tras el primer clip) y un formulario JSON de unas 230 tokens a rellenar, con cuatro clips repetidos ocho veces cada uno.

| Metrica | Resultado |
|---|---|
| Tamano en disco | 10,4 GB |
| Pico de memoria (MLX) | 11,3 GB |
| Tiempo de carga | 4 s |
| Tiempo por pregunta | 6 a 7 s |
| Velocidad de generacion | 27 a 40 tokens por segundo (segun carga de la maquina) |
| Respuestas con JSON utilizable | 29 de 32 tras reparar corchetes (18 tal cual se escribieron) |
| Formularios de mezcla completa con todos los campos | 13 de 16 |
| Preguntas que se quedaron repitiendo un verso | 1 de 32 |

Comparativa de cuantizaciones publicada por el autor: 8, 6 y 5 bits dieron resultados cercanos en esta prueba (mismos nombres de campo, mismos corchetes omitidos; el modelo a precision completa ejecutado en PyTorch tambien escribio 4 de 8 respuestas con un corchete de menos, lo que apunta al modelo y no a la cuantizacion). La version de 5 bits se atasco algo mas: 4 preguntas de 32 frente a 1. La de 4 bits se deterioro de forma clara: nombro mal o invento un campo en una cuarta parte de sus respuestas, omitio un campo en casi todos los formularios de mezcla completa y se quedo repitiendo en una cuarta parte de las preguntas, motivo por el que el autor no publico ninguna compilacion de 4 bits.

## Requisitos de hardware

- Memoria: el autor indica que esta compilacion esta pensada para un Mac con 24 GB de memoria o mas. El pico medido en un M4 Max de 64 GB es de 11,3 GB de memoria MLX, con 10,4 GB en disco.
- Plataforma: exclusivamente Apple Silicon (MLX). No se documenta soporte para CUDA ni para GPU de NVIDIA, por lo que no aplican recomendaciones del tipo A100, H100 o RTX 4090 en esta conversion.
- Equipos de 16 GB: el autor no lo recomienda para esta compilacion de 8 bits y remite a la variante de 5 bits (7,4 GB en disco, pico de 8,2 GB), pensada para un Mac de 16 GB. Indica que no ha medido nada mas sobre maquinas de 16 GB aparte del pico citado.
- Despliegue: mediante la libreria mlx-audio en version 0.5.7 o posterior, cargando el modelo con `mlx_audio.stt.load` y llamando a `model.generate("clip.wav", prompt=...)`. En el proyecto Trainspotting Suite, el comando `python -m djkit ears fetch` descarga el modelo sin configuracion adicional.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada; el formato de pesos es MLX con codigo personalizado, no GGUF.
- Latencia y throughput medidos (M4 Max, 64 GB): 4 segundos de carga, 6 a 7 segundos por pregunta y entre 27 y 40 tokens por segundo.
- Recomendacion de uso: clips de unos 30 segundos, temperatura 0,7, top-p 0,8, top-k 20. A temperatura 0 el modelo se repite en respuestas largas.

## Comparativa con modelos similares

Los unicos modelos comparables sobre los que hay datos en la informacion disponible son la propia variante de 5 bits del mismo modelo y las compilaciones del checkpoint Thinking. No se dispone de parametros, contexto ni resultados de benchmarks de alternativas de otros fabricantes en audio comprension musical, por lo que no se incluye una comparativa con modelos de terceros.

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FractalSurfer/MOSS-Music-8B-Instruct-mlx-8bit | 9.052.463.488 | no disponible | 8 bits afina, grupo 64 | 10,4 GB (pico 11,3 GB) | Apache-2.0 | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| FractalSurfer/MOSS-Music-8B-Instruct-mlx-5bit | no disponible (mismo modelo base) | no disponible | 5 bits | 7,4 GB (pico 8,2 GB) | Apache-2.0 | Publico en HuggingFace |
| FractalSurfer/MOSS-Music-8B-Thinking-mlx-5bit | no disponible (mismo modelo base) | no disponible | 5 bits | no disponible | Apache-2.0 | Publico en HuggingFace; segun el autor, mas ordenado para rellenar un formulario estricto si se le desactiva el modo de pensamiento |
| OpenMOSS-Team/MOSS-Music-8B-Instruct (base) | no disponible en la informacion proporcionada | no disponible | bf16 sin cuantizar | no disponible | Apache-2.0 | Publico en HuggingFace |

## Limitaciones y advertencias

- Conversion comunitaria, no oficial: el modelo y el credito son del equipo OpenMOSS; este repositorio solo cambia el formato y la cuantizacion. Los cambios respecto al original son exclusivamente esos.
- Sesgos conocidos: no disponibles. La model card no describe la composicion del dataset de entrenamiento ni analisis de sesgo, por lo que no se puede acotar el comportamiento en generos, idiomas o culturas musicales poco representadas.
- Riesgo de alucinacion: documentado en la practica. El autor observa errores en nombres de campos al cuantizar a 4 bits y respuestas que se quedan repitiendo un verso cuando la letra efectivamente se repite. En el checkpoint a precision completa tambien aparecen corchetes omitidos, lo que indica que parte del problema es del modelo, no de la cuantizacion.
- Bucles de repeticion: cada tamano se atasco ocasionalmente repitiendo un verso (1 de 32 preguntas en esta compilacion, 4 de 32 en la de 5 bits). La recomendacion es cortar la respuesta y volver a preguntar. A temperatura 0 el modelo se repite directamente en respuestas largas.
- Limite de ventana de audio: el uso documentado se apoya en clips de unos 30 segundos. No hay datos sobre el comportamiento con fragmentos mas largos.
- Idiomas: solo ingles y chino segun los metadatos. No hay informacion sobre el rendimiento en castellano ni en otras lenguas.
- Modo de pensamiento: en este checkpoint Instruct, abrir la respuesta con un bloque `<think>` vacio empeoro los resultados (el modelo se atasco en 3 de 12 preguntas, frente a 1 de 32 sin ese bloque). Es una practica que debe evitarse aqui.
- Calidad del JSON: en la prueba medida, solo 18 de 32 respuestas fueron JSON valido tal cual se escribieron; tras reparar corchetes subio a 29 de 32. Un 13 de 16 formularios de mezcla completa trajeron todos los campos. Cualquier integracion en produccion necesita validacion y reintento.
- Restricciones de licencia: licencia Apache-2.0, sin restriccion de uso comercial declarada, heredada del modelo base. Se incluye copia en `LICENSE`. Conviene verificar la ficha del modelo base antes de un despliegue comercial.
- Limitacion de plataforma: al ser una conversion MLX, queda atada a Apple Silicon. No sirve para servidores con GPU NVIDIA ni para los runners habituales de vLLM o llama.cpp.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y ausencia total de resultados de benchmarks publicados. La validacion disponible proviene de un unico conjunto de pruebas internas del autor sobre un M4 Max.
- Sin datos sobre el modelo base: no hay informacion sobre tokens de entrenamiento, composicion del dataset ni fases de alineacion, lo que dificulta anticipar comportamientos en dominios fuera de la musica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FractalSurfer/MOSS-Music-8B-Instruct-mlx-8bit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Music-8B-Instruct
- Variante de 5 bits: https://huggingface.co/FractalSurfer/MOSS-Music-8B-Instruct-mlx-5bit
- Variante Thinking de 5 bits: https://huggingface.co/FractalSurfer/MOSS-Music-8B-Thinking-mlx-5bit
- Libreria mlx-audio: https://github.com/Blaizzy/mlx-audio
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Proyecto Trainspotting Suite: https://github.com/remy-st/trainspotting-suite
- Repositorio de MOSS-Music (informe tecnico citado en la model card): https://github.com/OpenMOSS/MOSS-Music
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
