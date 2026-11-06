# Mouserat/titlerat2

## Resumen

titlerat2 es un modelo de generacion de titulos (title generation) desarrollado por el usuario Mouserat, afinado a partir de google/mt5-small. Su unica funcion es producir un titulo corto en forma de sintagma nominal a partir de un par formado por la peticion del usuario y la respuesta del asistente, delimitados mediante los tokens especiales `<user>`, `</user>`, `<assistant>` y `</assistant>`. No genera respuestas conversacionales ni realiza juicios de seguridad: es una herramienta auxiliar para etiquetar conversaciones en interfaces de chat.

El modelo emplea la arquitectura mT5 (transformer encoder-decoder de tipo text-to-text) con 300.168.576 parametros totales y pesos en FP32. Soporta cinco variantes linguisticas: japones (ja), ingles (en), coreano (ko) y chino simplificado y tradicional (zh_Hans, zh_Hant). Su entrenamiento se apoya en 85.672 ejemplos supervisados construidos a partir de ocho datasets publicos de instrucciones y conversacion, con anadidos sinteticos propios.

Su relevancia practica es acotada pero clara: resuelve el problema concreto de nombrar automaticamente historiales de chat multilingues en el arbol de lenguas de Asia Oriental, una tarea que los modelos generativos grandes cubren de forma costosa e imprecisa. Con 300 millones de parametros y licencia Apache-2.0, puede desplegarse en CPU o en GPU de gama baja con latencia baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 (transformer encoder-decoder, text-to-text) |
| Parametros totales | 300.168.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; los ejemplos de uso truncan la entrada a 512 tokens |
| Tipos de cuantizacion | no se distribuyen variantes cuantizadas; los pesos se publican en FP32 (compatible con cuantizacion posterior via transformers/bitsandbytes) |
| Idiomas soportados | ja, en, ko, zh_Hans, zh_Hant |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, FP32) |

## Arquitectura y entrenamiento

El modelo parte de google/mt5-small, un transformer encoder-decoder con vocabulario multilingue compartido basado en SentencePiece. Sobre esa base se realiza un ajuste supervisado (SFT) para una tarea de seq2seq muy restringida: dado un par peticion-respuesta envuelto en tokens especiales anadidos al tokenizer, generar un titulo corto. La decodificacion prevista es greedy (`num_beams=1`, `do_sample=False`) con `max_new_tokens=64`.

El corpus de entrenamiento consta de 85.672 ejemplos: 37.319 para ja/en (SFT-General-Japanese-60K, tagengo-gpt4, shisa-v2-sharegpt, ShareGPT-Processed, 433 ejemplos de rechazo sinteticos y 22 dialogos de animales de creacion propia), 19.298 para coreano (KoAlpaca-v1.1, EverythingLM-V2-Ko, korean-writing-style-instruct), 18.224 para chino simplificado (smoltalk-chinese), 7.866 para chino tradicional (aya_collection_language_split, Traditional_Chinese-aya_dataset), 2.815 para ingles (aya_dataset, aya_collection_language_split) y 150 ejemplos sinteticos de entrada vacia con salida vacia. Se excluyeron articulos de prensa (CNN) copiados literalmente, instrucciones plantilla sinteticas y filas descartadas en la revision manual. Parte de los titulos de referencia se generaron con Qwen/Qwen3.5-4B segun la model card. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de titulos cortos (sintagmas nominales) a partir de un par peticion-respuesta en ja, en, ko, zh_Hans y zh_Hant.
- Manejo de conversaciones sin respuesta del asistente: si el bloque `<assistant>` va vacio, el modelo genera titulo solo a partir de la peticion.
- Entrada vacia produce salida vacia de forma consistente (20/20 en la evaluacion del autor).
- Delimitacion robusta mediante tokens especiales anadidos (`<user>`, `</user>`, `<assistant>`, `</assistant>`), lo que permite separar claramente los roles en la entrada.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo thinking.
- No procesa vision ni audio.
- No genera respuestas conversacionales, juicios de seguridad ni rechazos.

## Casos de uso

- Etiquetado automatico de historiales de chat: al cerrar o guardar una conversacion, se construye la entrada con el primer par peticion-respuesta y se obtiene un titulo para la lista lateral de la interfaz. La ventana de 512 tokens del ejemplo de uso cubre la mayoria de primeros turnos.
- Organizacion de bandejas de soporte multilingue: en un helpdesk que atiende en japones, coreano y chino, el modelo clasifica visualmente cada ticket con un titulo tematico, facilitando el triaje por agentes humanos sin necesidad de un LLM grande.
- Indexacion y busqueda en archivos de conversaciones: los titulos generados sirven como metadatos para busqueda por palabra clave en registros de chat, complementando la busqueda full-text sobre el cuerpo del mensaje.
- Resumen de hilos en foros o comunidades: para hilos con un mensaje inicial y una respuesta, el modelo produce un encabezado corto que puede mostrarse en listados y notificaciones.
- Generacion de asuntos en herramientas de correo o mensajeria: integrado en un cliente de correo con asistente, propone un asunto a partir del borrador de la peticion y la respuesta redactada.
- Etiquetado de datasets de instrucciones: al preparar corpus SFT multilingues, el modelo puede anadir un titulo tematico a cada par instruccion-respuesta para auditoria y filtrado por categoria.
- Navegacion en asistentes de voz o chatbots de consumo: dado el bajo coste computacional (300 M de parametros), puede ejecutarse en el propio dispositivo o en un servicio ligero para nombrar sesiones sin enviar datos a un LLM mayor.

## Benchmarks y rendimiento

El autor publica una evaluacion humana de 500 peticiones (100 por variante linguistica) con criterio binario OK/NG sobre la adecuacion del titulo al tema y tipo de peticion. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Idioma | Numero de juicios | OK | Tasa OK (IC 95%) |
|---|---:|---:|---|
| ko | 100 | 97 | 97,0% (±3,3) |
| zh_Hans | 100 | 96 | 96,0% (±3,8) |
| zh_Hant | 100 | 90 | 90,0% (±5,9) |
| en | 100 | 93 | 93,0% (±5,0) |
| ja | 100 | 95 | 95,0% (±4,3) |
| Total | 500 | 471 | 94,2% (±2,0) |

Ademas, en 20 entradas vacias la salida fue vacia en los 20 casos. La evaluacion la realizo un unico anotador y no se comprobo la concordancia entre anotadores; los datos de evaluacion no forman parte del conjunto de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos (300 M de parametros x 4 bytes), mas activaciones y cache; en la practica cabe en cualquier GPU con 2 GB o mas.
- Cuantizacion a FP16/BF16 reduce los pesos a unos 600 MB; a int8, unos 300 MB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU.
- Despliegue recomendado: transformers con `AutoModelForSeq2SeqLM` (metodo indicado por el autor). Al ser un encoder-decoder mT5, es compatible con vLLM y TGI, aunque no se han publicado configuraciones validadas. llama.cpp y Ollama no soportan de forma nativa este formato sin conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera decodificacion de decenas de milisegundos por titulo en GPU moderna y de orden de cientos de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la misma tarea especifica (generacion de titulos multilingue ja/ko/zh/en sobre mT5-small). Como referencia estructural:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| titlerat2 | 300 M | no disponible (ejemplo a 512 tokens) | ja, en, ko, zh_Hans, zh_Hant | Apache-2.0 | Generacion de titulos |
| google/mt5-small (base) | 300 M | 512 tokens (estandar mT5) | ~100 idiomas | Apache-2.0 | Text-to-text generico |
| google/mt5-base (base) | 580 M | 512 tokens (estandar mT5) | ~100 idiomas | Apache-2.0 | Text-to-text generico |

La comparacion con LLMs generativos de proposito general (por ejemplo, Qwen o modelos de 4 B de parametros) resulta poco informativa: titlerat2 esta especializado en una unica salida y no compite en generacion abierta. No hay benchmarks compartidos que permitan una comparacion cuantitativa con alternativas especializadas.

## Limitaciones y advertencias

- Repeticion de terminos en la salida (por ejemplo, «significado y significado»). El autor sugiere `no_repeat_ngram_size` u otras restricciones de decodificacion, pero no ha evaluado su efecto.
- Errores ortograficos y de caracteres ocasionales.
- Titulos demasiado genericos (por ejemplo, «resolucion de problemas»).
- Rendimiento inferior en chino tradicional (90% OK) por menor volumen de datos de entrenamiento.
- Mayor confusion tematica en peticiones largas; el rendimiento en peticiones largas en ingles es inferior al de peticiones largas en japones.
- En peticiones sobre temas daninos, el titulo puede nombrar el tema (por ejemplo, «como fabricar polvora»), lo que puede requerir filtrado posterior en produccion.
- Los caracteres desconocidos (`<unk>`) se eliminaron del entrenamiento; entradas con muchos caracteres fuera del vocabulario pueden degradar la calidad.
- No debe usarse para generar respuestas, juicios de seguridad, rechazos ni para presentar hechos: el titulo es un resumen y no garantiza correccion del contenido.
- Fuera de los cinco idiomas declarados no hay garantia de calidad.
- La licencia del modelo y de los pesos es Apache-2.0, pero las licencias de los datasets de entrenamiento dependen de cada distribuidor original; el autor senala que la verificacion de las condiciones de uso de los datos queda pendiente antes de su publicacion.
- La evaluacion la realizo un unico anotador sin control de concordancia inter-anotador, por lo que las tasas OK deben tomarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mouserat/titlerat2
- Notebook de Colab: https://huggingface.co/Mouserat/titlerat2/blob/main/titlerat_v1_colab.ipynb
- Modelo base: https://huggingface.co/google/mt5-small
- Dataset SFT-General-Japanese-60K: https://huggingface.co/datasets/OysterCoreAI/SFT-General-Japanese-60K
- Dataset tagengo-gpt4: https://huggingface.co/datasets/lightblue/tagengo-gpt4
- Dataset shisa-v2-sharegpt: https://huggingface.co/datasets/shisa-ai/shisa-v2-sharegpt
- Dataset ShareGPT-Processed: https://huggingface.co/datasets/zetavg/ShareGPT-Processed
- Dataset KoAlpaca-v1.1: https://huggingface.co/datasets/davidkim205/KoAlpaca-v1.1
- Dataset smoltalk-chinese: https://huggingface.co/datasets/smoltalk-chinese
- Dataset aya_collection_language_split: https://huggingface.co/datasets/CohereLabs/aya_collection_language_split
- Dataset aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
