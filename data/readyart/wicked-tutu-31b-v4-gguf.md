# ReadyArt/Wicked-Tutu-31B-v4-GGUF

## Resumen

Wicked-Tutu-31B-v4-GGUF es una cuantizacion en formato GGUF del modelo ReadyArt/Wicked-Tutu-31B-v4, un modelo de generacion de texto de 30.697.345.596 parametros (aproximadamente 30,7 mil millones) publicado por el usuario ReadyArt en HuggingFace. El modelo esta orientado explicitamente a roleplay para adultos, ficcion erotica, terror y violencia, y se distribuye con la etiqueta "unaligned", lo que indica que no ha pasado por un proceso de alineamiento de seguridad orientado a rechazar contenido sensible. La model card no documenta la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste del modelo base.

La relevancia de esta publicacion es limitada y muy especifica: se trata de una conversion a GGUF pensada para ejecucion local en hardware de consumo mediante llama.cpp u Ollama, algo que el modelo original en safetensors no permite de forma sencilla. El repositorio ocupa 172,5 GB, lo que sugiere la presencia de multiples niveles de cuantizacion, aunque el autor no detalla cuales. En el momento de la ficha el modelo acumula 0 descargas y 2 "likes", con fecha de creacion y ultima actualizacion del 19 de octubre de 2026.

Conviene subrayar que la model card publicada consiste casi integramente en codigo CSS y HTML de estilizacion, sin secciones tecnicas utiles: no hay informacion sobre el contexto maximo, la composicion del dataset, los idiomas mas alla del ingles declarado ni resultados de evaluacion. Cualquier dato tecnico que no aparezca en esta ficha debe considerarse no disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no documenta la arquitectura; el modelo tiene 30,7 B de parametros) |
| Parametros totales | 30.697.345.596 (aprox. 30,7 B), dato real de safetensors |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Formato GGUF; el repositorio ocupa 172,5 GB e incluye varias cuantizaciones, pero el autor no publica la lista exacta de niveles (Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | Ingles (declarado en la model card); no se documentan otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base ReadyArt/Wicked-Tutu-31B-v4 se distribuye en safetensors |
| Etiquetas del autor | nsfw, explicit, roleplay, unaligned, erp, erotic, horror, violence |
| Pipeline | text-generation |
| Tamano del repositorio | 172,5 GB |
| Fecha de publicacion | 19 de octubre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card del repositorio GGUF no incluye ninguna seccion tecnica: el contenido publicado es una hoja de estilos CSS con animaciones, degradados y contenedores tipo "glassmorphism", sin descripcion de la red, del tokenizador ni de la ventana de contexto. El unico dato estructural fiable es el recuento de parametros obtenido de los pesos en safetensors del modelo base, 30.697.345.596, que situa al modelo en la franja de 30-32 mil millones de parametros, tipicamente asociada a transformers decoder-only con atencion por grupos (GQA) en la mayoria de familias actuales, aunque esto ultimo no puede confirmarse con la informacion disponible.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del corpus, si hubo fases de ajuste supervisado, RLHF o DPO, ni el origen de los datos de roleplay y ficcion adulta que sugiere el etiquetado. La etiqueta "unaligned" indica que el autor declara ausencia de alineamiento de seguridad, pero no se especifica la metodologia. El proceso aplicado en este repositorio concreto es una cuantizacion del modelo base (relacion `quantized` declarada en los metadatos), es decir, una conversion de pesos sin reentrenamiento, por lo que las capacidades del modelo son las del modelo original.

## Capacidades

- Generacion de texto en ingles con enfasis en narrativa interactiva, roleplay conversacional y ficcion de genero adulto.
- Escritura creativa orientada a terror y violencia explicita, segun las etiquetas declaradas por el autor.
- Conversacion multi-turno con mantenimiento de personaje, el caso de uso principal declarado.
- Estilo "unaligned": el modelo no incorpora capas de rechazo orientadas a evitar contenido sensible o explicito, lo que es intencionado y no un defecto del ajuste.
- No hay evidencia de soporte de tool calling, function calling, agentes o razonamiento multi-paso en la informacion disponible.
- No hay evidencia de capacidades de vision, audio ni modo "thinking" o razonamiento extendido.
- Capacidad multilingue: no disponible; solo se declara ingles.
- No se documentan capacidades de generacion de codigo ni de matematicas.

## Casos de uso

- Escritura de ficcion adulta asistida: el modelo puede continuar o desarrollar relatos de genero erotico o romantico para autores que trabajen en plataformas con verificacion de edad, dado su ajuste especifico y su ausencia de filtros de rechazo.
- Roleplay conversacional de personaje: adecuado para motores de chat de personajes con memoria de conversacion, siempre que se despliegue en un entorno privado y con usuarios adultos verificados.
- Narrativa de terror y ficcion violenta: util para guiones de videojuegos o relatos de terror donde se requiere violencia explicita sin que el modelo suavice el tono.
- Generacion de datos sinteticos para entrenamiento: puede emplearse para producir corpus de dialogo roleplay o ficcion de genero que alimenten ajustes posteriores de modelos mas pequenos.
- Despliegue local y privado: al estar en GGUF, permite ejecucion completamente offline en estaciones de trabajo, lo que evita enviar conversaciones potencialmente sensibles a APIs externas.
- Prototipado de productos de entretenimiento para adultos: sirve para validar mecanicas de chat, sistemas de personaje y dinamicas de historia antes de invertir en un modelo propietario o en un ajuste propio.
- Investigacion sobre modelos sin alineamiento: util para estudiar el comportamiento de modelos "unaligned" en entornos controlados, incluyendo tasas de cumplimiento de peticiones sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de roleplay, y el autor no enlaza ningun informe de evaluacion del modelo base.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del recuento de parametros (30,7 B) y del formato GGUF; el autor no publica requisitos oficiales.

- VRAM estimada para inferencia (solo pesos, sin cache KV): en FP16 unos 61 GB; en Q8_0 unos 33 GB; en Q6_K unos 25 GB; en Q5_K_M unos 22 GB; en Q4_K_M unos 19 GB; en Q3_K_M unos 15 GB; en Q2_K unos 11 GB. Hay que sumar entre 2 y 10 GB adicionales de cache KV segun contexto y numero de sesiones concurrentes.
- GPU profesionales: A100 80 GB o H100 80 GB para FP16 sin cuantizar; A100 40 GB o L40S 48 GB para Q8_0; RTX A6000 48 GB para Q6_K o Q8_0 con contexto moderado.
- GPU de consumo: una RTX 4090 (24 GB) permite Q4_K_M con contexto limitado; una RTX 3090 (24 GB) queda en la misma franja; tarjetas de 16 GB como la RTX 4080 solo admiten Q3_K_M o Q2_K, con perdida de calidad apreciable. Para Q5_K_M o superiores en consumer se recomienda repartir capas entre dos GPU.
- Despliegue: llama.cpp, Ollama, LM Studio y koboldcpp son las opciones naturales para GGUF. vLLM y TGI no estan pensados para GGUF y requeririan convertir a safetensors o usar el modelo base.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo denso de 30 B en Q4_K_M sobre una RTX 4090 suele moverse en el orden de 15-25 tokens por segundo en generacion individual, pero no se ha medido para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos de benchmark |
|---|---|---|---|---|---|
| Wicked-Tutu-31B-v4 | 30,7 B | No disponible | Apache-2.0 | Roleplay adulto, ficcion explicita, unaligned | No disponibles |
| Qwen2.5-32B-Instruct | 32,8 B | 131.072 tokens | Apache-2.0 | Uso general, instruct, alineado | Publicados por el autor |
| Gemma 2 27B | 27 B | 8.192 tokens | Licencia Gemma | Uso general, instruct | Publicados por el autor |
| Mistral Small 3 (24B) | 24 B | 32.000 tokens | Apache-2.0 | Uso general, instruct, bajo latencia | Publicados por el autor |

La diferencia practica principal no es de tamano sino de proposito: los tres modelos de referencia estan alineados y rechazan contenido explicito, mientras que Wicked-Tutu esta disenado explicitamente para producirlo. A cambio, no ofrece garantias documentadas de contexto largo, soporte multilingue ni calidad en tareas de codigo o razonamiento.

## Limitaciones y advertencias

- Contenido explicito y potencialmente perturbador: el modelo esta etiquetado como nsfw, explicit, horror y violence, y contiene la marca not-for-all-audiences. No es apto para menores ni para entornos laborales sin control.
- Ausencia de alineamiento de seguridad: la etiqueta "unaligned" implica que el modelo puede cumplir peticiones daninas sin filtros. No debe exponerse como API publica sin una capa de moderacion propia.
- Riesgo de alucinacion: no documentado por el autor, pero es esperable en un modelo de 30 B sin datos de evaluacion; en roleplay se manifiesta como incoherencias de personaje o de hechos del mundo.
- Limitacion idiomatica: solo se declara ingles. El rendimiento en castellano es desconocido y previsiblemente inferior.
- Contexto desconocido: al no publicarse la ventana de contexto, el desarrollador debe medirla empiricamente antes de disenar conversaciones largas o recuperacion de documentos.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero no exime del cumplimiento de la legislacion aplicable sobre contenido sexual, proteccion de menores y difamacion. El autor no ofrece ninguna garantia.
- Procedencia opaca: al no documentarse los datos de entrenamiento, no puede descartarse la presencia de contenido sujeto a derechos de autor o de datos personales en el corpus original.
- Madurez del repositorio: 0 descargas y 2 "likes" en el momento de la ficha, sin issues ni discusion documentadas; no hay evidencia de mantenimiento ni de soporte por parte del autor.
- Quantizaciones sin documentar: al no listarse los niveles GGUF incluidos, es necesario inspeccionar los ficheros del repositorio (172,5 GB) antes de planificar el despliegue.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v4-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v4
- Perfil del autor: https://huggingface.co/ReadyArt
- Paper, blog o demo: no disponibles en la informacion proporcionada.
