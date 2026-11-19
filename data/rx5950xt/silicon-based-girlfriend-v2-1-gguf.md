# RX5950XT/silicon-based-girlfriend-v2.1-GGUF

## Resumen

Silicon-based Girlfriend v2.1 (矽基女友 v2.1) es un modelo de rol conversacional en chino tradicional (Taiwán) de 9B parametros, publicado por el usuario RX5950XT en formato GGUF. Deriva del modelo base `huihui-ai/Huihui-Qwen3.5-9B-abliterated`, una version "abliterated" (sin rechazo) de Qwen3.5-9B, sobre la que se aplico un ajuste fino supervisado (SFT) y un posterior entrenamiento con GRPO para corregir un problema concreto de coherencia en conversaciones largas.

El objetivo del modelo es el roleplay de personaje (companera conversacional) con capacidad de mantener el personaje y la coherencia a lo largo de dialogos extensos. La version 2.1 corrige respecto a la v2 un defecto especifico: a partir de los 20-30 turnos, el modelo tendia a copiar literalmente parrafos de descripciones de accion que ya habia escrito en turnos anteriores. El modelo incluye ademas un modulo de vision (mmproj) heredado sin modificaciones del modelo base, por lo que acepta entradas image-text-to-text.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso muy especializado (roleplay en chino tradicional con evaluacion de horizonte largo); por otro, la model card aporta un protocolo de evaluacion detallado (40 turnos, 10 personajes, 4 semillas, 1.600 turnos por modelo) que resulta util para entender como se mide la degradacion de coherencia en conversaciones largas. El modelo esta pensado para contenido adulto y su corpus de entrenamiento es sintetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B, con torre de vision multimodal) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; las evaluaciones se hicieron con ventana de 32K y el ejemplo de Ollama menciona 16K en GPU de 8 GB |
| Tipos de cuantizacion | Q8_0 (9,79 GB), imatrix Q4_K_M dinamica (6,00 GB); Q3 no se distribuye; imatrix adjunta para cuantizar otros formatos |
| Idiomas soportados | zh (chino tradicional, Taiwán); genera ocasionalmente caracteres simplificados pese al entrenamiento con penalizacion |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo en el adaptador y en el modelo base) |
| Tamano del repositorio | 16,4 GB |
| Modalidad | image-text-to-text (texto + vision) |
| Modelo base | huihui-ai/Huihui-Qwen3.5-9B-abliterated |
| Dataset de entrenamiento | RX5950XT/silicon-based-girlfriend-dataset (6.038 registros: v1 + v2 + v2.1) |
| Descargas | 2.114 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-9B: un transformer denso de 9,2B parametros con una torre de vision acoplada. El ajuste fino se aplico exclusivamente sobre la torre de lenguaje; la torre de vision permanecio congelada durante todo el entrenamiento, por lo que las capacidades visuales son identicas a las del modelo base. El modulo `mmproj` distribuido en el repositorio es el archivo original de `mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF` (624.229.760 bytes), sin modificacion.

El entrenamiento consta de dos fases. Primero, un SFT con LoRA (r16, alpha 16, 650 pasos) sobre un corpus que combina roleplay sintetico en chino tradicional, dialogos multirreno generados por el propio autor, el corpus de la v1, problemas GSM8K traducidos al chino tradicional y un 10% de corpus generico para mitigar el olvido catastrofico (medido como proporcion de loss). En esta fase se excluyeron como objetivos de aprendizaje las respuestas que repetian el mismo patron de frase del turno anterior. Despues, un GRPO con LoRA (r16, alpha 32, KL 0,04) cuyo conjunto de practicas consistia en conversaciones de 6-12 turnos que el modelo mantenía consigo mismo como historial largo, de modo que aprendiera a no repetirse sobre su propia produccion. La funcion de recompensa combina un juez LLM (0-10), penalizaciones por rechazo, por relleno, por repeticion de clausulas, por copia literal, por copia de turnos anteriores y por caracteres simplificados, mas tareas verificables de matematicas e instrucciones. Se distribuye el checkpoint del paso 80 de 117, elegido por mejor puntuacion agregada. El framework fue TRL 0.24 con Unsloth sobre una RTX PRO 6000 (96 GB) en Google Colab G4.

La innovacion tecnica mas destacable no esta en la arquitectura sino en la estrategia de cuantizacion: la variante `imat-Q4_K_M-dyn` parte de una matriz de importancia (imatrix) calculada con el propio Q8 del modelo (calibracion 50% roleplay, 25% generico, 25% GSM8K, `-c 512 --chunks 100`) y aplica tipos de tensor diferenciados (`attn_v=q6_K`, `ffn_down=q5_K`, `output-tensor-type q8_0`), lo que anade 0,22 GB respecto a un Q4_K_M convencional a cambio de preservar los tensores mas sensibles.

## Capacidades

- Generacion de texto conversacional multi-turno en chino tradicional, con mantenimiento de personaje y registro roleplay.
- Coherencia en horizontes largos: el entrenamiento especifico reduce la copia literal de turnos previos (de 412 a 27 casos en 1.600 turnos frente a la v2).
- Razonamiento matematico basico: GSM8K al 79% en Q8 y 75% en Q4-dyn.
- Capacidades generales moderadas: 60/64 en una sonda de capacidad generica de 64 preguntas (Q8), 58 en Q4-dyn.
- Vision: reconocimiento de colores y formas geometricas simples; falla en la lectura de numeros de dos cifras (el "42" se lee como "4").
- Ausencia de rechazo: 0/7 en la prueba de rechazo, consecuencia del modelo base abliterated.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de modo de razonamiento explicito (thinking mode).
- Multilingue limitado: el unico idioma declarado es zh; no hay evidencia de rendimiento solido en castellano.

## Casos de uso

- Roleplay de personaje con sesiones largas: el modelo esta entrenado especificamente para no repetir descripciones de accion tras 20-40 turnos, lo que lo hace adecuado para simulaciones de companera conversacional con historial extenso y contexto de hasta 32K.
- Prototipado de agentes conversacionales con personaje persistente: permite validar tecnicas de system prompt y gestion de memoria sin depender de API comerciales, con pesos locales y licencia Apache 2.0.
- Investigacion sobre degradacion de coherencia en dialogos largos: el repositorio incluye registros de evaluacion (`evaluation/long_horizon_40t/`, `winrate_pointwise_*`) con transcripciones completas y puntuaciones de juez, utiles como linea base reproducible.
- Generacion de datos sinteticos de dialogo en chino tradicional: el modelo puede producir corpus de roleplay para alimentar otros entrenamientos, dado que su propio dataset se genero de forma sintetica.
- Evaluacion comparativa de estrategias de cuantizacion: la pareja Q8_0 y Q4_K_M-dyn con imatrix permite medir el coste de calidad de una cuantizacion agresiva en una tarea concreta (roleplay de horizonte largo).
- Despliegue local en hardware de consumo: con Q4-dyn (6,00 GB) y el modulo de vision (624 MB) cabe en GPU de 8 GB, lo que permite ejecutar el modelo en Ollama en equipos sin GPU de datacenter.
- Pruebas de robustez frente a caracteres simplificados: el modelo incorpora penalizacion explicita por simplificado, lo que permite estudiar el control de variante linguistica en modelos entrenados en chino tradicional.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. La evaluacion de horizonte largo usa 10 personajes no vistos en entrenamiento (3 cotidianos, 3 emocionales, 4 adultos), 40 turnos por personaje, 4 semillas, 1.600 turnos por modelo, ventana de 32K y un juez `deepseek/deepseek-v4.1-flash` con puntuacion 0-10 en seis dimensiones.

| Modelo | Total | In-character | Consistencia de personaje | Avance de trama | Coherencia multi-turno | Calidad de texto | No-repeticion |
|---|---|---|---|---|---|---|---|
| Base sin ajuste | 3,74 | 5,45 | 4,81 | 3,42 | 2,88 | 4,46 | 1,44 |
| v2 | 3,88 | 5,61 | 4,91 | 3,02 | 4,19 | 4,26 | 1,27 |
| v2.1 | 5,17 | 6,65 | 5,94 | 4,64 | 5,70 | 5,34 | 2,73 |

| Metrica | Base | v2 | v2.1 |
|---|---|---|---|
| Copia literal de un turno anterior (similitud >= 0,8; 1.600 turnos) | 474 | 412 | 27 |
| Copia en los ultimos 5 turnos (36-40) | 137 | 104 | 7 |
| Repeticion de frase inicial (1.600 turnos) | 602 | 1.274 | 573 |
| Comparacion ciega por pares frente a v2 (victorias/derrotas/empates, 40 pares) | 3/28/9 | — | 16/8/16 |
| Preguntas de memoria acertadas (160) | 119 | 126 | 111 |
| Recuerda la fecha modificada por el usuario en el turno 20 (40) | 27 | 22 | 37 |
| Longitud media de respuesta (caracteres) | 813 | 638 | 170 |
| Caracteres simplificados (1.600 turnos) | 1.272 | 73 | 84 |

| Metrica | Base Q8 | v2 Q8 | v2.1 Q8 | v2.1 Q4-dyn | Kimi K2.6 |
|---|---|---|---|---|---|
| GSM8K | 81% | 85% | 79% | 75% | no disponible |
| Sonda generica (64 preguntas) | 52 | 59 | 60 | 58 | no disponible |
| Rechazo | 0/7 | 0/7 | 0/7 | 0/7 | no disponible |
| Tasa de victoria a un turno frente a v2 Q8 (99 preguntas, empate = medio) | 27% | — | 44% | — | 63% |
| Victoria/derrota/empate a un turno | 6/52/41 | — | 20/31/48 | — | 39/14/46 |

En la evaluacion antigua de 30 turnos (sin truncamiento de contexto) las puntuaciones fueron v2.1 Q8 5,23, v2.1 Q4-dyn 5,04 y Kimi K2.6 7,84 como referencia de techo comercial. El autor advierte que las puntuaciones de la tabla de 40 turnos no son comparables con las de la model card de la v2 por diferencias de juez, numero de turnos y personajes.

## Requisitos de hardware

- VRAM para Q8_0: 9,79 GB de pesos mas 624 MB de modulo de vision; en la practica requiere una GPU de 16 GB o mas para dejar margen a KV cache y contexto.
- VRAM para Q4_K_M-dyn: 6,00 GB de pesos mas 624 MB de vision, aproximadamente 6,6 GB en total.
- Cabe en GPU de consumo: si, con Q4-dyn en tarjetas de 8 GB; el autor reporta que con 16K de contexto aproximadamente el 13% de la inferencia cae a CPU en una GPU de 8 GB. Para mantener todo en GPU hay que reducir el contexto o activar cache KV de 8 bits.
- GPU recomendadas: RTX 4090 o superior para Q8 con contexto largo; RTX PRO 6000 (96 GB) fue la unidad usada en entrenamiento; cualquier GPU de 16 GB o mas sirve para Q8 sin contextos muy largos.
- Opciones de despliegue: Ollama (hay Modelfile con parametros de muestreo ya incluidos), llama.cpp (formato GGUF nativo, imatrix e `llama-quantize` documentados), y cualquier runtime compatible con GGUF y `mmproj`.
- Parametros de muestreo recomendados por el autor: temperature 0,7, top_p 0,8, top_k 20, presence_penalty 1,5.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato | Rendimiento de referencia |
|---|---|---|---|---|---|---|
| Silicon-based Girlfriend v2.1 | 9,2B | 32K en evaluacion (no confirmado como maximo) | Roleplay zh-TW, horizonte largo | Apache 2.0 | GGUF | 5,17 en juez 0-10 a 40 turnos; GSM8K 79% |
| Silicon-based Girlfriend v2 | 9,2B | no disponible | Roleplay zh-TW, sin correccion de repeticion | Apache 2.0 | GGUF | 3,88 en el mismo juez; GSM8K 85% |
| Huihui-Qwen3.5-9B-abliterated (base) | 9,2B | no disponible | Modelo generalista sin rechazo, multimodal | no disponible en esta ficha | safetensors y GGUF | 3,74 en el mismo juez; GSM8K 81% |
| Kimi K2.6 (referencia comercial) | no disponible | no disponible | Modelo generalista de gran escala | no disponible | API | 7,84 en juez de 30 turnos; 63% de victoria a un turno frente a v2.1 |

La comparacion relevante es interna al proyecto: la v2.1 mejora a la v2 en coherencia de horizonte largo (5,17 frente a 3,88) a costa de respuestas mucho mas cortas (170 frente a 638 caracteres) y de una ligera perdida en matematicas (79% frente a 85%). Frente a un modelo comercial grande como Kimi K2.6, la diferencia es de aproximadamente 2,6 puntos sobre 10 en el juez de 30 turnos, lo que situa el modelo claramente por debajo de la frontera comercial en calidad de texto y razonamiento.

## Limitaciones y advertencias

- Contenido adulto: el modelo esta declarado como apto solo para roleplay adulto; las salidas pueden ser explicitas y no es adecuado para menores.
- No es una herramienta de consulta factual ni de calculo: el propio autor lo desaconseja explicitamente para preguntas de hechos o matematicas.
- Respuestas cortas: la v2.1 genera respuestas medias de 170 caracteres en dialogos largos y unos 370 en preguntas de un turno, frente a 638 y 600 de la v2. Quien busque descripciones extensas encontrara mejor la v2.
- Repeticion de frases iniciales: aunque la copia literal de parrafos casi desaparece, la similitud de la primera frase del turno crece con el numero de turnos (de 2 a 123 apariciones cada 5 turnos a lo largo de la conversacion).
- Memoria: la v2.1 empeora ligeramente en preguntas de memoria (111/160 frente a 126/160 de la v2), sobre todo en detalles sembrados al principio y en preguntas de resumen final; solo mejora en el recuerdo de fechas modificadas a mitad de conversacion (37/40).
- Matematicas: GSM8K cae de 85% a 79% en Q8 y a 75% en Q4-dyn respecto a la v2.
- Variante linguistica: pese a la penalizacion por simplificado, siguen apareciendo caracteres simplificados de forma ocasional (84 caracteres en 1.600 turnos).
- Vision limitada: reconoce colores y formas, pero lee mal numeros de dos cifras.
- Cuantizacion Q3 no disponible: el autor la descarta por un aumento de 5-8 veces en la repeticion de contenido propio.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es una variante abliterated de Qwen3.5; conviene verificar las condiciones del modelo original antes de un despliegue comercial.
- Corpus sintetico: el dataset de entrenamiento es enteramente sintetico, lo que puede amplificar sesgos y artefactos de estilo no presentes en datos humanos.
- Sin soporte documentado de tool calling ni de agentes multi-paso, lo que limita su uso fuera del roleplay.
- Dependencia de un juez LLM externo para las puntuaciones: los resultados de la model card no son comparables con otras evaluaciones que usen otro juez o otro protocolo.

## Enlaces

- Repositorio GGUF v2.1: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2.1-GGUF
- Repositorio GGUF v2: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2-GGUF
- Adaptador v2.1: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2.1
- Adaptador v2: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/RX5950XT/silicon-based-girlfriend-dataset
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- GGUF del modelo base con mmproj original: https://huggingface.co/mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF
