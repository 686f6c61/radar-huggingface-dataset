# smca/holdfast-chat-lfm2.5-1.2b-mlx-4bit

## Resumen

Holdfast Chat 1.2B (round n) es un ajuste fino mediante LoRA del modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por el usuario smca para la aplicación offline de supervivencia Holdfast. El modelo no es un asistente conversacional de propósito general: está especializado en redactar el texto envolvente de las respuestas de la app (introducciones de una línea que citan la procedencia de los pasajes, conversación trivial, respuestas honestas cuando no hay coincidencia en la biblioteca y preguntas de seguimiento), además de clasificar en una sola palabra la acción que debe tomar el motor de búsqueda interna (chat, search, app o urgent) y, como novedad en esta ronda, dictaminar si el pasaje principal responde a la pregunta (yes, partial o no).

El modelo base LFM2.5-1.2B-Instruct pertenece a la familia LFM2 de Liquid AI, con 1.170.340.608 parámetros totales según los pesos en safetensors. Esta versión está cuantizada a 4 bits con mlx-lm (group size 64) y empaquetada en formato MLX para ejecución en Apple Silicon. El repositorio ocupa 4,0 GB y acumula 76 descargas en el momento de la consulta.

Su relevancia es acotada pero instructiva: muestra un patrón de ajuste fino muy orientado a producto, con restricciones de comportamiento explícitas (nunca dar consejos, cifras, dosis ni derivar a profesionales sanitarios salvo que un pasaje listado lo haga), y con un estado declarado de candidato privado no apto para publicación. Es un caso de estudio de alineación restrictiva y de evaluación con conjuntos sellados más que un modelo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2 (modelo base LiquidAI/LFM2.5-1.2B-Instruct); adaptador LoRA fusionado y cuantizado |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, formato MLX |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial gratuito para organizaciones con ingresos anuales inferiores a 10 M USD |
| Formato de pesos | safetensors (MLX), tokenizer compatible con LiquidAI/LFM2.5-1.2B-Instruct-MLX-4bit |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-1.2B-Instruct y se ajusta con LoRA de rango 16 aplicado sobre las 8 capas superiores de 16, entrenado en CPU. Posteriormente el adaptador se fusiona con los pesos base y se cuantiza con mlx-lm a 4 bits con group size 64, replicando el diseño y los ficheros de tokenizer de la versión oficial MLX 4-bit de LiquidAI. La información disponible no detalla la arquitectura interna del modelo base más allá de su denominación LFM2.

El entrenamiento de esta ronda (n) parte de la ronda (m) y añade unos 2.150 pares para la tarea de respuestas: preguntas redactadas específicamente para entrenamiento, buscadas como lo hace la app y etiquetadas a ciegas por dos anotadores con modelos distintos, conservando solo los casos con acuerdo. Se añaden además unos 280 ejemplos de reparación, saludos, respuestas de "nada encontrado" e identidad, redactados y juzgados por subagentes de Claude. Se reutilizan los datos de la ronda (m) eliminando toda respuesta con derivación a profesionales sanitarios y toda copia cercana a un mensaje de evaluación. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto conversacional breve: saludos, conversación trivial y respuestas de seguimiento.
- Redacción de introducciones de una línea que indican la procedencia de los pasajes recuperados por la biblioteca de la app.
- Clasificación de intención en cuatro categorías con una sola palabra: chat, search, app, urgent.
- Clasificación de suficiencia de respuesta en tres etiquetas de un solo token: yes, partial, no.
- Respuesta honesta de no cobertura cuando la biblioteca no contiene material relevante.
- Turnos de reparación ante mensajes confusos ("I'm confused", "what are you on about", "me again").
- Respuestas de identidad coherentes con la guía de la app (por ejemplo, ya no responde "No" a la pregunta de si es una IA).
- Restricciones aprendidas: no emite consejos, hechos, cifras ni dosis propias; no nombra el número de emergencias, ambulancias ni servicios de emergencia; no deriva a médico, farmacéutico o veterinario salvo que un pasaje listado lo haga.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Motor de respuestas de una app de supervivencia offline: el modelo envuelve los pasajes recuperados de la biblioteca local con una frase introductoria que indica su procedencia, de modo que el usuario ve la fuente sin que el modelo añada contenido propio.
- Enrutado de consultas dentro de la app: clasifica cada mensaje en chat, search, app o urgent con una sola palabra, lo que permite dirigirlo al módulo adecuado con un coste de decodificación mínimo (el primer token de "urgent" es "urg").
- Filtro de cobertura antes de mostrar resultados: la tarea de respuestas decide si el pasaje principal responde a la pregunta (yes, partial, no), lo que permite que la app decline honestamente en lugar de mostrar material irrelevante.
- Detección de emergencias: con el umbral urgentThreshold 0.9 de la app, el modelo marcó 46 de 50 emergencias en el conjunto sellado, lo que lo hace utilizable como señal de escalado hacia la fila Call propia de la aplicación.
- Conversación de acompañamiento en situaciones de baja conectividad: gestiona saludos, mensajes confusos y reformulaciones sin necesidad de red, al ejecutarse en local sobre Apple Silicon con MLX.
- Moderación de derivaciones sanitarias en un producto de salud: las restricciones de entrenamiento reducen las derivaciones a médico, farmacéutico o veterinario de 36 a 13 de 559 en dev y de 15 a 4 de 147 en test, lo que sirve como capa de control en flujos donde la app no debe sustituir la atención profesional.
- Evaluación de pipelines de recuperación: al etiquetar la suficiencia del pasaje principal, el modelo puede emplearse para medir la calidad de un índice de búsqueda interno sin intervención humana.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks estándar (MMLU, HumanEval, GSM8K) sino evaluaciones internas sobre conjuntos de desarrollo, sellado y test.

| Evaluación | Resultado |
|---|---|
| Conjunto sellado, preguntas no cubiertas detectadas como tales | 12 de 14 (frente a 4 sin la compuerta) |
| Conjunto sellado, preguntas cubiertas que pasan | 109 de 151 (frente a 111; 2 rechazadas erróneamente) |
| Conjunto test, no cubiertas detectadas | 21 de 43 |
| Conjunto test, cubiertas rechazadas erróneamente | 5 de 151 |
| Derivaciones a profesionales (dev) | de 36 a 13 de 559 |
| Derivaciones a profesionales (test) | de 15 a 4 de 147 |
| Fila Call con urgentThreshold 0.9, emergencias detectadas (sellado) | 46 de 50 (ronda m: 44) |
| Fila Call con urgentThreshold 0.9, mensajes tranquilos marcados (sellado) | 6 de 150 (ronda m: 7) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de pesos MLX 4-bit con 1,17 mil millones de parámetros, el peso ronda los 0,6-0,7 GB; el repositorio completo ocupa 4,0 GB, por lo que conviene reservar al menos 2-3 GB de memoria unificada para el proceso de inferencia con overhead.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (series M1, M2, M3, M4); no se documenta soporte para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no se indica compatibilidad con RTX 4090 u otras GPU NVIDIA en el formato entregado.
- Opciones de despliegue: mlx-lm es la vía natural; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles. Las respuestas de ejemplo se generan con temperatura 0,2, top-p 1,0 y un máximo de 80 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smca/holdfast-chat-lfm2.5-1.2b-mlx-4bit | 1,17 B | no disponible | LFM Open License v1.0 | MLX 4-bit, candidato privado | Ajuste LoRA especializado en la app Holdfast |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2 B (aprox.) | no disponible | LFM Open License v1.0 | Pesos oficiales en HuggingFace | Modelo base, propósito general |
| LiquidAI/LFM2.5-1.2B-Instruct-MLX-4bit | 1,2 B (aprox.) | no disponible | LFM Open License v1.0 | MLX 4-bit oficial | Misma cuantización y tokenizer que este modelo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Estado declarado de candidato privado no apto para publicación: el autor lo marca explícitamente como no liberable en su forma actual.
- Especialización estrecha: está entrenado para las tareas concretas de la app Holdfast; su comportamiento fuera de ese dominio no está evaluado.
- Riesgo de rechazo erróneo: en el conjunto test, 5 de 151 preguntas cubiertas fueron declinadas incorrectamente, lo que puede degradar la experiencia si se usa como compuerta estricta.
- Cobertura incompleta de no cubiertas: solo detecta 21 de 43 preguntas no cubiertas en test, por lo que persistirán respuestas sobre material irrelevante.
- Falsos positivos en detección de emergencias: 6 de 150 mensajes tranquilos se marcaron como urgentes en el conjunto sellado con umbral 0,9.
- Restricciones de licencia: el uso comercial es gratuito solo para organizaciones con ingresos anuales inferiores a 10 M USD; por encima de ese umbral se requiere licencia adicional de Liquid AI. Es una obra derivada de LFM2.5-1.2B-Instruct y debe conservarse el aviso NOTICE.
- Idiomas soportados no documentados; los prompts y evaluaciones están en inglés.
- Longitud de contexto no disponible, lo que impide planificar conversaciones largas con garantías.
- Sin datos de sesgos, alucinación fuera del dominio o robustez ante entradas adversarias.
- Dependencia de Apple Silicon: el formato MLX limita su despliegue en infraestructura x86 con GPU NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smca/holdfast-chat-lfm2.5-1.2b-mlx-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Versión MLX 4-bit oficial del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-MLX-4bit
- Licencia LFM Open License v1.0: incluida en el repositorio como LICENSE
- Aviso de cambios (NOTICE): incluido en el repositorio
