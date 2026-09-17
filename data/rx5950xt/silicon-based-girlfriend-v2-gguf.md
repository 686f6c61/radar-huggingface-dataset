# RX5950XT/silicon-based-girlfriend-v2-GGUF

## Resumen

Silicon-based girlfriend v2 (矽基女友 v2) es un modelo de rol conversacional en chino tradicional (Taiwan) de 9B parametros, publicado en formato GGUF por el usuario RX5950XT. Parte del modelo base huihui-ai/Huihui-Qwen3.5-9B-abliterated (una version sin censura de Qwen3.5-9B) y se ha afinado especificamente para mantener la coherencia de un personaje a lo largo de conversaciones largas multirreno. El entrenamiento sigue un pipeline SFT (LoRA r16, alpha 16, 1 epoch, 576 pasos) seguido de dos rondas de GRPO (117 pasos cada una), con recompensas basadas en un juez LLM, penalizaciones anti-repeticion, anti-copia y preguntas verificables de matematicas e instrucciones.

El repositorio no distribuye pesos completos, sino cuantizaciones GGUF listas para Ollama y llama.cpp: una version Q8_0 de 9,79 GB (calidad prioritaria) y una Q4_K_M de 5,78 GB con matriz de importancia (imatrix) recalculada por el propio autor (5,02 BPW, 223 tensores q4_K y 35 q6_K). Incluye tambien el modulo de vision mmproj en Q8_0 (624 MB), que es byte a byte el del repositorio de mradermacher y no ha sido modificado por el proyecto: la torre visual quedo congelada durante el entrenamiento y las capacidades de imagen son identicas a las del modelo base.

Su relevancia es acotada y muy especializada: no compite en tareas de conocimiento general, sino en consistencia de personaje y adherencia al rol dentro de una ventana de conversacion larga. Frente al modelo base sin afinar, el autor reporta en evaluacion ciega con un juez externo (claude-opus-4-6-thinking) una mejora de 1,20x en Q4 y 1,21x en Q8, con ganancias concentradas en inmersion e in-personaje, y 0% de repeticion en texto largo. La ventana de contexto nativa no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-9B; torre visual congelada + torre de lenguaje con LoRA. Detalle arquitectonico interno no disponible |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se indica si la arquitectura es MoE) |
| Longitud de contexto | no disponible (el autor no declara la ventana nativa; en una GPU de 8 GB con Q4 el limite practico es ~8K tokens, ampliable a 16K con cache KV de 8 bits) |
| Tipos de cuantizacion | GGUF Q8_0 (9,79 GB) y Q4_K_M con imatrix (5,78 GB, 5,02 BPW); modulo de vision mmproj Q8_0 (624 MB) |
| Idiomas soportados | zh (chino tradicional, variante de Taiwan) |
| Licencia | Apache-2.0 (heredada del base huihui-ai/Huihui-Qwen3.5-9B-abliterated y de Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (llama.cpp / Ollama), con Modelfile incluido y parametros de muestreo preconfigurados |
| Modelo base | huihui-ai/Huihui-Qwen3.5-9B-abliterated (relacion: quantized) |
| Tamano del repositorio | 16,2 GB |
| Fecha de publicacion | 2026-09-17 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna mas alla de que es un modelo multimodal image-text-to-text construido sobre Qwen3.5-9B, con una torre de vision y una torre de lenguaje. Durante todo el entrenamiento la torre de vision permanecio congelada y solo se aplico LoRA sobre la torre de lenguaje, por lo que el autor afirma explicitamente que la capacidad visual es identica a la del modelo base, sin mejora ni degradacion. El pipeline de afinado fue SFT (LoRA r16, alpha 16, 1 epoch, 576 pasos) seguido de dos rondas de GRPO de 117 pasos cada una, usando TRL 0.24 y Unsloth sobre una RTX PRO 6000 de 96 GB en Vast.ai.

El corpus de entrenamiento es sintetico y generado por el propio autor: dialogos de rol en chino tradicional mezclados con un 10% de corpus general (medido por proporcion de loss) para mitigar el olvido catastrofico. Las recompensas de GRPO combinan un juez LLM con escala 0-10, penalizacion por rechazo, por relleno, por repeticion de clausulas, por copia literal y por copia de turnos anteriores, mas preguntas verificables de matematicas e instrucciones. El proceso de cuantizacion uso una imatrix calculada por el propio proyecto sobre la salida Q8_0 del modelo (`llama-imatrix -c 512 --chunks 200`) con unos 405.000 caracteres de calibracion mezclados en la misma proporcion que los datos de entrenamiento (516 problemas GSM8K en chino tradicional, tarjetas de personaje, dialogos de rol reales y tareas generales), en lugar de un corpus generico en ingles.

## Capacidades

- Generacion de texto conversacional en chino tradicional (Taiwan), con registro coloquial y capacidad de mantener un personaje definido en el system prompt.
- Mantenimiento de personaje en dialogos de varios turnos, con mejoras medidas en inmersion e in-personaje frente al modelo base.
- Capacidad de rechazo muy baja: 0 rechazos en 7 pruebas reportadas, orientado a contenido adulto.
- Ausencia de caracteres simplificados: 0 en las pruebas del autor, frente a 6-10 cada 30 turnos del modelo base.
- Vision basica: reconocimiento de colores y formas a partir de imagenes, usando el modulo mmproj del modelo base (no reentrenado).
- Razonamiento matematico limitado pero funcional: 85% en GSM8K con Q8 y 82% con Q4.
- Capacidades generales preservadas por el entrenamiento anti-olvido: 92,2% en una sonda de 64 preguntas de 5 categorias con Q4 (frente al 76,6% de la linea base sin afinar).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo esta orientado a roleplay, no a tareas agenticas.
- Modo thinking explicito: no disponible.

## Casos de uso

- Personajes conversacionales para apps de entretenimiento en chino tradicional: el modelo puede sostener un personaje definido por un system prompt largo a lo largo de multiples turnos, con una tasa de repeticion de texto largo del 0,0% medido por el autor, lo que reduce la sensacion de robot en sesiones prolongadas.
- Ficcion interactiva para adultos: plataformas de relatos ramificados o novelas visuales donde se necesita baja tasa de rechazo (0/7 en las pruebas) y contenido explicito, con la salvedad de que el autor restringe el uso a investigacion y mayores de edad.
- Asistencia a guionistas y escritores de ficcion en chino tradicional: el modelo puede generar variaciones de dialogo para un personaje concreto sin salirse del registro, y la presencia de 0 caracteres simplificados evita correcciones manuales de conversion.
- Generacion de dialogos sinteticos etiquetados: util para producir datasets de rol en chino tradicional con coherencia de personaje verificable, que es precisamente el caso del propio dataset publicado junto al modelo.
- Simulacion de personajes en videojuegos narrativos con NPC persistentes: al no depender de marcadores de activacion tipo `[RPMode]` (el entrenamiento mezclo corpus general de forma deliberada), el mismo modelo puede alternar entre respuestas conversacionales y respuestas funcionales dentro del mismo hilo.
- Pruebas de calidad de personaje en pipelines de evaluacion: la existencia de un Modelfile con parametros de muestreo fijos (temperature 0.7, top_p 0.8, top_k 20, presence_penalty 1.5) permite reproducir condiciones identicas entre ejecuciones, algo util para comparar versiones de un personaje.
- Investigacion sobre mantenimiento de persona en dialogos largos: el autor documenta explicitamente una degradacion concreta (la coherencia multirreno baja de 4,50 a 4,44 frente al base) causada por un 9,9% de dialogos con copia literal en el corpus SFT, lo que lo convierte en un caso de estudio reproducible sobre higiene de datos.
- Descripcion de imagenes con carga de personaje: el modulo de vision permite incorporar una imagen y comentarla en personaje, aunque el autor advierte que los numeros de dos cifras se leen mal.

## Benchmarks y rendimiento

Evaluacion ciega con juez externo claude-opus-4-6-thinking, 6 personajes nuevos no presentes en el corpus de entrenamiento, 5 turnos cada uno y 3 semillas aleatorias.

| Modelo | Puntuacion absoluta | Rango entre semillas | Relativo al base |
|---|---|---|---|
| Base sin afinar | 4,29 | 4,12-4,53 | 1,00x |
| Solo SFT | 1,38 | una sola semilla | 0,32x |
| GRPO ronda 1 | 3,73 | 3,60-3,87 | 0,87x |
| Silicon-based girlfriend v2 Q4 | 5,13 | 5,07-5,23 | 1,20x |
| Silicon-based girlfriend v2 Q8 | 5,18 | 4,82-5,55 | 1,21x |

Desglose por dimension (sobre 10):

| Modelo | Inmersion | Consistencia de personaje | Avance de trama | Coherencia multirreno | Calidad de texto |
|---|---|---|---|---|---|
| Base sin afinar | 4,89 | 4,50 | 4,50 | 4,50 | 3,08 |
| Solo SFT | 2,25 | 2,42 | 1,00 | 0,42 | 0,83 |
| Silicon-based girlfriend v2 Q8 | 6,17 | 6,22 | 5,11 | 4,44 | 3,94 |

Otras metricas reportadas por el autor:

| Prueba | Resultado |
|---|---|
| Comparacion ciega por pares contra el base | 6 victorias, 0 derrotas (Q8 y Q4) |
| Copia del propio turno anterior (5 turnos x 24 casos) | 0 veces (la ronda 1 de GRPO registraba entre 1 y 7) |
| Tasa de repeticion en texto largo | 0,0% (Q8 y Q4) |
| Tasa de rechazo | 0/7 (Q8 y Q4) |
| GSM8K | 85% con Q8, 82% con Q4 |
| Sonda de capacidades generales (64 preguntas, 5 categorias) | 92,2% con Q4, frente a 76,6% de la linea base sin afinar; McNemar bilateral exacto p=0,021 |
| Caracteres simplificados emitidos | 0 (el base emite 6-10 cada 30 turnos) |
| Vision | reconocimiento de colores y formas correcto; fallo en numeros de dos cifras |
| Perplejidad de la cuantizacion imat-Q4_K_M | 7,50 +/- 0,09 |

Contexto importante aportado por el autor: las puntuaciones absolutas solo son comparables dentro del mismo juez. Las mismas respuestas evaluadas por Kimi K2.6 reciben 7,47 frente al 5,18 de opus, una diferencia de aproximadamente 2 puntos atribuida a la indulgencia del primero con modelos pequenos.

## Requisitos de hardware

- Q4_K_M (imat): 5,78 GB de pesos mas 624 MB del modulo de vision, en torno a 6,0 GB en total. El autor indica unos 160 MiB adicionales por cada 1K tokens de contexto.
- Q8_0: 9,79 GB de pesos mas 624 MB del modulo de vision, en torno a 10,4 GB antes de cache KV.
- GPU de 8 GB: cabe el Q4_K_M con un limite practico de contexto de unos 8K tokens. Para llegar a 16K hay que activar cache KV de 8 bits.
- GPU de 12-16 GB: Q4_K_M con contexto largo sin cuantizar el KV, o Q8_0 ajustado y con poco contexto.
- GPU de 24 GB (RTX 3090, RTX 4090): Q8_0 con contexto holgado y vision activada. Es la configuracion mas razonable para produccion con calidad maxima.
- GPU de 48-96 GB (A100, H100, RTX PRO 6000): necesarias solo si se trabaja con el modelo sin cuantizar o con lotes grandes; el propio autor uso una RTX PRO 6000 de 96 GB exclusivamente para el entrenamiento.
- Opciones de despliegue: Ollama mediante los Modelfile incluidos (Q8_0 e imat-Q4_K_M, con parametros de muestreo ya incorporados) y llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla la configuracion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas contra otros modelos de rol de la misma categoria fuera de las realizadas por el propio autor. La tabla siguiente recoge las alternativas que si aparecen documentadas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Puntuacion ciega (juez opus) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Silicon-based girlfriend v2 Q8 | 9,2B | no disponible | 5,18 | Apache-2.0 | GGUF en este repositorio |
| Silicon-based girlfriend v2 Q4 | 9,2B | no disponible | 5,13 | Apache-2.0 | GGUF en este repositorio |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated (base sin afinar) | 9,2B | no disponible | 4,29 | Apache-2.0 | modelo base, tambien en GGUF via mradermacher |
| Solo SFT (etapa intermedia del entrenamiento) | 9,2B | no disponible | 1,38 | no aplica (no publicado) | no disponible |
| GRPO ronda 1 (etapa intermedia) | 9,2B | no disponible | 3,73 | no aplica (no publicado) | no disponible |
| Kimi K2.6 (referencia comercial empleada por el autor) | no disponible | no disponible | equivalente a 5,18 / 0,54, es decir ~9,6 en la misma escala | propietaria | API comercial |

El propio autor situa el techo del modelo en su escala: con el mismo juez y las mismas preguntas, este modelo alcanza el 54% de Kimi K2.6, con la diferencia concentrada en memoria multirreno y variacion textual.

## Limitaciones y advertencias

- La coherencia multirreno es la dimension mas debil y la unica que no supera al modelo base (4,50 en el base frente a 4,44 en este modelo). El autor atribuye la causa a que el 9,9% del corpus SFT contenia dialogos donde el personaje copiaba literalmente un turno anterior, lo que hundio esa capacidad hasta 0,42 en la etapa SFT; las dos rondas de GRPO solo la recuperaron hasta el nivel del base, no mas alla. El corpus se limpio el 2026-09-17, pero este modelo se entreno con el material previo a la limpieza, por lo que la mejora no estara hasta un reentrenamiento.
- La vision hereda todos los defectos del modelo base, sin ninguna mejora. Reconoce colores y formas, pero lee mal los numeros de dos cifras (interpreta "42" como "4").
- No es adecuado para consultas factuales ni como calculadora, pese al 85% en GSM8K. El autor lo advierte explicitamente.
- Contenido adulto y explicito. El autor restringe el uso a investigacion, prohibe el uso por menores y desaconseja su empleo como herramienta de consulta. La licencia Apache-2.0 permite tecnicamente el uso comercial, pero hay que verificar la normativa local y las politicas de la plataforma de destino antes de desplegarlo.
- Entrenamiento con datos sinteticos, no con datos humanos reales: los dialogos y las tarjetas de personaje son generados, lo que limita la diversidad linguistica y puede producir un registro repetitivo a escala.
- Idiomas: unicamente chino tradicional de Taiwan. No hay soporte documentado de castellano ni de otros idiomas.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion independiente de los resultados mas alla de la documentacion del propio autor, que si incluye registros de evaluacion en la carpeta `evaluation/`.
- Deriva del modelo base: al provenir de un modelo "abliterated" (sin censura), el filtrado de seguridad es practicamente inexistente. No debe usarse en canales de atencion al cliente ni en ningun flujo orientado al publico general sin una capa de moderacion externa.
- Sensibilidad a los parametros de muestreo: el autor insiste en mantener `presence_penalty` en 1,5. Bajarlo reactiva la repeticion en conversaciones largas.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Modelo original upstream: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/RX5950XT/silicon-based-girlfriend-v2-dataset
- Repositorio de adaptadores y material de entrenamiento: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2
- Cuantizaciones GGUF del modelo base y modulo de vision mmproj: https://huggingface.co/mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF

No se han encontrado otros enlaces relevantes en la busqueda web realizada.
