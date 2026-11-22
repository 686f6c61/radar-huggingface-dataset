# KeraAI/kera-songwriter-e4b

## Resumen

Kera Songwriter E4B es un ajuste fino (fine-tune) por LoRA del modelo Gemma 4 E4B it de Google DeepMind, desarrollado por KeraAI. Su proposito es actuar como "letrista y planificador" para generadores de musica por IA: a partir de una peticion breve en lenguaje natural (por ejemplo, "synth-pop sonador sobre conducir a casa a las 3 de la manana, voz femenina, crescendo lento"), produce etiquetas de estilo, indicaciones de voz, tempo, tonalidad, compas, duracion, un plan seccion por seccion con niveles de energia y una letra original que encaje. No genera audio: genera la especificacion y la letra que alimentan a un modelo text-to-music.

El modelo parte de Gemma 4 E4B it, una arquitectura transformer con aproximadamente 8.000 millones de parametros (7.996.156.490 segun los pesos en safetensors), y conserva la ventana de contexto y el chat template del modelo base, incluyendo el modo "thinking" desactivable. El ajuste se realizo con LoRA de rango 16 y alpha 32 durante 7.000 pasos sobre una DGX Spark, y los pesos resultantes se fusionaron en el checkpoint publicado.

Su relevancia practica esta en estandarizar la fase de "briefing creativo" en pipelines de generacion musical: en lugar de que el usuario escriba prompts ambiguos para el generador de audio, el modelo entrega una estructura consistente (TAGS, VOCAL, BPM/KEY/TIME/LENGTH, PLAN, BRIEF, LYRICS) en unos 15 segundos por letra y con un peso de solo 5,3 GB en cuantizacion Q4_K_M, lo que permite ejecutarlo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B it), ajuste fino por LoRA fusionado |
| Parametros totales | 7.996.156.490 (aproximadamente 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; los ejemplos de despliegue usan `-c 16384` |
| Tipos de cuantizacion | Q4_K_M (5,3 GB), Q8_0 (8,0 GB), BF16 (15 GB), safetensors en BF16 (16 GB) |
| Idiomas soportados | ingles unicamente (declarado: `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp), LoRA en `lora/` (77 MB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune por LoRA del checkpoint `google/gemma-4-E4B-it`. El adaptador tiene rango 16 y alpha 32, se entreno durante 7.000 pasos en una unica DGX Spark y posteriormente se fusiono en los pesos publicados, de modo que el repositorio contiene el modelo completo listo para inferencia, ademas del adaptador LoRA aislado en `lora/` (77 MB). La arquitectura subyacente es la de Gemma 4 E4B, un transformer decoder-only de aproximadamente 8B parametros con soporte de chat template y modo de razonamiento (thinking) activable o desactivable mediante `enable_thinking`.

El dataset de entrenamiento se construyo a partir de hechos musicales extraidos de Wikipedia (CC BY-SA 4.0) y de MusicBrainz/AcousticBrainz (CC0). Con esos hechos, Claude Sonnet 5.5 genero 7.134 "lecciones", cada una consistente en planificar una cancion nueva en ese estilo, de forma que el modelo aprende a producir planes y letras originales en lugar de reproducir material existente. Segun el autor, no se utilizaron letras reales en el entrenamiento. El modelo esta disenado para invocarse con un system prompt fijo, temperatura 0,8, top-p 0,95 y thinking desactivado.

## Capacidades

- Generacion de planes de cancion estructurados con los campos TAGS, VOCAL, BPM/KEY/TIME/LENGTH, PLAN, BRIEF y LYRICS.
- Produccion de etiquetas de estilo (style tags) aptas para modelos text-to-music.
- Escritura de letras originales en ingles, con estructura por secciones y niveles de energia de 1 a 10.
- Especificacion de parametros musicales: tempo (BPM), tonalidad (key), compas (time) y duracion (length).
- Conversacion multi-turno a traves del chat template de Gemma 4.
- Modo thinking desactivable mediante `chat_template_kwargs` / `enable_thinking`; el autor recomienda desactivarlo para esta tarea.
- Capacidad multimodal heredada del modelo base (tag `image-text-to-text`), aunque la model card no documenta su uso para songwriting.
- No soporta tool calling ni razonamiento agentico multi-paso de forma documentada.
- Multilingue: no; solo ingles.

## Casos de uso

- Generacion automatica de briefs para modelos text-to-music: el modelo recibe una idea de una linea y devuelve TAGS, VOCAL, BPM/KEY/TIME/LENGTH, PLAN y LYRICS listos para inyectarse como estilo y letra en el generador de audio.
- Prototipado rapido de canciones en estudios y agencias: en unos 15 segundos por letra se obtienen varias propuestas con estructura seccion a seccion (intro, verso, estribillo, puente) y curva de energia, utiles para validar direcciones creativas antes de producir.
- Herramientas de co-creacion para letristas: el modelo genera letras originales en ingles con una estructura coherente con el plan, lo que sirve como borrador sobre el que el autor humano itera.
- Integracion en backends de aplicaciones musicales: al exponerse como endpoint compatible con la API de OpenAI (`/v1/chat/completions`), puede conectarse a un frontend web o a un bot sin infraestructura adicional.
- Despliegue local en hardware de consumo: con el GGUF Q4_K_M de 5,3 GB y `-ngl 99` en llama.cpp o `kera serve`, cabe en GPU consumer y permite generar planes y letras sin enviar datos a la nube.
- Estandarizacion de prompts en pipelines existentes: sustituye prompts libres por una salida con campos fijos, lo que facilita el parseo automatico y la validacion en produccion.
- Generacion de variantes controladas: modificando el brief de entrada (tempo, tonalidad, tipo de voz, duracion) se obtienen multiples versiones de una misma idea manteniendo el formato de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,3 GB para Q4_K_M, 8,0 GB para Q8_0, 15 GB para BF16 en GGUF y 16 GB para safetensors en BF16.
- GPU recomendadas: el autor cita una DGX Spark para el entrenamiento; para inferencia, cualquier GPU con al menos 8 GB de VRAM para Q4_K_M y 16 GB o mas para BF16.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas para Q4_K_M (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y en tarjetas de 16 GB o mas para BF16 (RTX 4080, RTX 4090).
- Opciones de despliegue: llama.cpp (`llama-server -hf KeraAI/kera-songwriter-e4b:Q4_K_M -c 16384 -ngl 99 --jinja`), CLI `kera serve`, y transformers con `AutoModelForCausalLM` en `bfloat16` y `device_map="auto"`.
- Latencia y throughput: aproximadamente 15 segundos por letra segun el autor, con `max_tokens` de 2400 y temperatura 0,8; no se especifica el hardware empleado para esa cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kera Songwriter E4B | ~8B (7.996.156.490) | no disponible (ejemplos a 16.384) | Fine-tune para planificacion y letras de canciones | Apache 2.0 | Hugging Face, GGUF y safetensors |
| google/gemma-4-E4B-it | ~8B (modelo base) | no disponible | Modelo generalista multimodal instruct | Gemma (terminos de Google) | Hugging Face |
| Alternativas especializadas en letras y songwriting | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos especializados comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Solo escribe en ingles; no soporta otros idiomas de forma declarada.
- Puede reproducir estructuras, rimas o frases comunes de la musica popular; el autor recomienda revisar las letras antes de publicar una cancion.
- Riesgo de alucinacion en hechos musicales (aunque el entrenamiento se baso en Wikipedia y MusicBrainz, el modelo puede inventar atribuciones o referencias).
- El system prompt prohibe explicitamente usar letras de canciones reales o nombres de artistas; esa restriccion depende de que se respete el prompt y no de un filtro tecnico garantizado.
- No hay resultados de benchmarks publicados que permitan evaluar la calidad objetiva de los planes o las letras.
- El modelo no genera audio; su utilidad depende de un generador text-to-music externo.
- El tag `image-text-to-text` sugiere herencia multimodal del modelo base, pero la model card no documenta ni valida ese uso para songwriting.
- Licencia Apache 2.0 para el fine-tune, con la advertencia de que Gemma 4 es un modelo de Google DeepMind y su uso puede estar sujeto adicionalmente a los terminos de Gemma.
- El repositorio ocupa 44,7 GB, por lo que la descarga completa incluye todas las cuantizaciones y los pesos en safetensors; conviene descargar solo el archivo necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KeraAI/kera-songwriter-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Wikipedia (fuente de datos, CC BY-SA 4.0): https://www.wikipedia.org
- MusicBrainz: https://musicbrainz.org
- AcousticBrainz: https://acousticbrainz.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
