# DavidAU/L3.1-RP-Hero-Dirty_Harry-8B-GGUF

## Resumen

L3.1-RP-Hero-Dirty_Harry-8B-GGUF es un modelo de lenguaje de 8.030 millones de parámetros (8B) especializado en roleplay y escritura creativa, publicado por DavidAU en Hugging Face bajo licencia Apache 2.0. Está construido sobre la arquitectura de Llama 3.1, con una longitud de contexto máxima declarada de 128k tokens (131.000), y se distribuye exclusivamente en formato GGUF, lo que lo hace apto para inferencia local con llama.cpp y herramientas compatibles.

El modelo forma parte de una familia de tres variantes ("Dirty Harry", "InBetween" y "Big Talker") que comparten la misma base de modelos de roleplay fusionados mediante mergekit. "Dirty Harry" se distingue por generar salidas de longitud corta o media, carecer de censura explícita y ofrecer un nivel de detalle ligeramente superior a "InBetween". El autor lo presenta como un modelo "comprimido" con perplejidad baja (inferior, según afirma, a Meta Llama 3.1 Instruct) y con un seguimiento de instrucciones superior a la media.

Su relevancia actual reside en el nicho de la escritura de ficción y el roleplay local: ofrece contexto largo, salidas sin censura y compatibilidad con plantillas Llama 3 y Command-R, orientado a aplicaciones como SillyTavern y a flujos de generación de prosa. No obstante, la información técnica publicada por el autor es escasa y no incluye detalles sobre el dataset de entrenamiento ni resultados de benchmarks estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Llama 3.1 (merge de modelos mediante mergekit) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (131.000), segun el autor |
| Tipos de cuantizacion | GGUF en multiples cuantizaciones (Q4_K_M, Q4_K_S, Q5, Q6, Q8, entre otras; el autor recomienda Q5 o superiores) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 69,7 GB con multiples quants); el autor anuncia un repo separado con el codigo fuente |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Llama 3.1, con 8.030 millones de parámetros, y se ha construido mediante un merge de modelos de roleplay de alta valoracion utilizando mergekit, segun indica el autor. No se especifica la composicion exacta del merge, el numero de modelos fusionados ni la configuracion de la fusion (por ejemplo, SLERP, TIES o DARE). Tampoco se detalla el proceso de entrenamiento posterior: no hay informacion sobre el volumen de tokens, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La innovacion tecnica declarada por el autor es la "compresion" del modelo, que segun sus notas produce una perplejidad baja (inferior a Meta Llama 3.1 Instruct) y una estabilidad que permite operar con temperaturas de 0 a 5 y con penalizaciones de repeticion desde 1,0 en adelante (1,02 o superior recomendado para roleplay). El modelo requiere la plantilla de Llama 3 o la de Command-R. No se documentan mecanismos como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto creativo y prosa vivida en multiples generos: ciencia ficcion, romance, terror, horror grafico y ficcion general.
- Roleplay conversacional multi-turno, con soporte para aplicaciones como SillyTavern.
- Generacion de tramas y subtramas, continuacion de escenas y escritura de ficcion.
- Seguimiento de instrucciones superior a la media, segun el autor, con control del estilo mediante indicaciones en el prompt (por ejemplo, "(vivid horror)").
- Salidas sin censura, incluyendo lenguaje soez y contenido violento o grafico, de forma explicita.
- Soporte de contexto largo de hasta 128k tokens, adecuado para narrativas extensas y conversaciones prolongadas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Roleplay interactivo local: el modelo puede mantener conversaciones multi-turno en personaje con contexto de hasta 128k tokens, lo que permite sesiones largas sin perder el hilo narrativo; es adecuado por su entrenamiento especifico en roleplay y su compatibilidad con SillyTavern.
- Escritura de ficcion por capitulos: con 128k tokens de contexto, se puede introducir una novela completa o un arco narrativo extenso y pedir continuaciones coherentes con el tono y los personajes establecidos.
- Generacion de tramas y subtramas para guionistas: el modelo produce variaciones de trama con temperatura ajustable (0 a 5) y penalizacion de repeticion, lo que permite explorar alternativas narrativas rapidamente.
- Creacion de contenido de terror y horror grafico: el autor indica que se puede forzar el registro con indicaciones como "(graphic vivid horror)", lo que lo hace util para ficcion de genero sin restricciones de contenido.
- Prototipado de dialogos para videojuegos o narrativa interactiva: al ser un GGUF de 8B, se puede desplegar en estaciones de trabajo con GPU de consumo y generar dialogos ramificados en tiempo real.
- Asistente de escritura sin conexion: al ejecutarse localmente con llama.cpp u Ollama, permite generar y revisar prosa sin enviar datos a servicios externos, lo que resulta adecuado para material confidencial o no publicado.
- Exploracion creativa con parametros extremos: el modelo esta disenado para operar con temperaturas altas (3 o mas) y penalizaciones de repeticion bajas, lo que sirve para generar prosa inusual o experimental, con la precaucion de fijar un limite maximo de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente afirma que la perplejidad del modelo es inferior a la de Meta Llama 3.1 Instruct, sin aportar cifras concretas ni comparaciones en MMLU, HumanEval, GSM8K u otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (8B parametros): aproximadamente 5-6 GB en Q4_K_M, 6-7 GB en Q5, 7-8 GB en Q6 y 9-10 GB en Q8, sin contar la cache KV.
- La cache KV para contexto largo es el factor limitante: con 128k tokens la VRAM adicional puede superar los 10-20 GB segun la cuantizacion de la cache y el numero de capas; para contexto completo se recomienda GPU profesional.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para contexto medio-alto y cuantizaciones Q5-Q8; A100 40/80 GB o H100 para contexto completo de 128k y despliegue concurrente.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para cuantizaciones Q4 y contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y servidores compatibles con GGUF; el autor menciona compatibilidad con endpoints y aplicaciones de roleplay como SillyTavern.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| L3.1-RP-Hero-Dirty_Harry-8B | 8,03B | 128k | Roleplay y ficcion sin censura | Apache 2.0 | GGUF |
| L3.1-RP-Hero-InBetween-8B (DavidAU) | 8B (no confirmado) | 128k (segun autor) | Roleplay con ligera censura, salidas medias | Apache 2.0 (segun repo) | GGUF |
| L3.1-RP-Hero-BigTalker-8B (DavidAU) | 8B (no confirmado) | 128k (segun autor) | Roleplay con salidas largas | Apache 2.0 (segun repo) | GGUF |
| Meta Llama 3.1 8B Instruct | 8,03B | 128k | Asistente generalista | Llama 3.1 Community License | Safetensors, GGUF |

La comparacion con modelos de la misma categoria fuera de la familia de DavidAU no esta disponible en la informacion proporcionada. El autor afirma que la perplejidad de este modelo es inferior a la de Meta Llama 3.1 Instruct, pero no aporta cifras que permitan verificar la comparacion.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar violencia grafica, horror, lenguaje soez y material NSFW; no es apto para entornos sin moderacion ni para publico general.
- Sesgo declarado: el autor indica que el modelo tiene un sesgo de neutro a negativo, controlable mediante el prompt, lo que puede producir respuestas pesimistas o hostiles por defecto.
- Alucinacion: no hay evaluaciones publicadas sobre tasas de alucinacion; al ser un modelo de ficcion, la veracidad factual no es un objetivo y no debe usarse como fuente de datos.
- Longitud de salida: el autor advierte que el modelo prefiere salidas cortas incluso si se solicita lo contrario, lo que puede requerir ajustes de prompt y regeneraciones.
- Idioma: solo soporta ingles; no se garantiza un rendimiento adecuado en castellano.
- Parametros de muestreo: requiere penalizacion de repeticion de 1,02 o superior para roleplay y de 1,05 o superior para evitar repeticiones al final de las salidas; temperaturas altas (3 o mas) pueden degradar el seguimiento de instrucciones.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir politicas de plataformas o normativas sobre material explicito; el usuario asume la responsabilidad del filtrado.
- Documentacion tecnica incompleta: no se detallan la composicion del merge, el dataset de entrenamiento ni los resultados de evaluacion, lo que dificulta la reproducibilidad y la evaluacion rigurosa.
- El autor anuncia un repositorio separado con el codigo fuente que, en la informacion disponible, no se ha publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3.1-RP-Hero-Dirty_Harry-8B-GGUF
- Variante InBetween: https://huggingface.co/DavidAU/L3.1-RP-Hero-InBetween-8B-GGUF
- Variante Big Talker: https://huggingface.co/DavidAU/L3.1-RP-Hero-BigTalker-8B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Preguntas frecuentes del autor: https://huggingface.co/DavidAU/support
