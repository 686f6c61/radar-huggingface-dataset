# exeterminal/Exe-Turbo-S-V3-GGUF

## Resumen

Exe-Turbo-S-V3-GGUF es una cuantización en formato GGUF del modelo Exe Turbo S v3, un ajuste fino de LiquidAI/LFM2.5-8B-A1B desarrollado por exeterminal (Exe AI). Se trata de un modelo especializado en uso de herramientas y comportamiento de agente dentro de la aplicación Exe AI, no de un modelo de propósito general. Su arquitectura es de mezcla de expertos (MoE) con 8.467.856.832 parámetros totales en disco y aproximadamente 1.500 millones activos por token, lo que permite ejecutarlo en portátiles con 6-8 GB de memoria.

El modelo resuelve un problema concreto: que un agente local elija correctamente entre herramientas, respete los límites de su entorno, trate la salida de una herramienta como datos y no como instrucciones, y complete cadenas de varios pasos sin detenerse en el primero. Según la model card, pasa 78 de 101 casos retenidos de Exe AI (regla pass^3, tres ejecuciones consecutivas), frente a 52 del modelo base sin entrenar.

Es relevante ahora porque demuestra que un ajuste LoRA pequeño sobre un MoE de 8B puede convertir un modelo base en un especialista de tool calling desplegable en hardware de consumo. El repositorio incluye ocho builds GGUF medidos individualmente, con el Q4_K_M (5,2 GB) como opción recomendada. La licencia es lfm1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, derivada de LiquidAI/LFM2.5-8B-A1B |
| Parametros totales | 8.467.856.832 (8,3B en disco) |
| Parametros activos | Aproximadamente 1,5B por token |
| Longitud de contexto | 128k tokens (heredada del modelo base) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-8B-A1B, un transformer con mezcla de expertos de 8,3B parámetros totales y unos 1,5B activos por token. El ajuste consiste en un adaptador LoRA de rango 16 y alpha 16 aplicado sobre el modelo base completo en bf16, con la parte del prompt enmascarada en la función de pérdida para que el entrenamiento se concentre en la generación. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

El entrenamiento se organizó en tres rondas iterativas medidas sobre el mismo conjunto de 101 casos retenidos de Exe AI: la v1 alcanzó 66/101, la v2 se dirigió a las carencias medidas de la v1 y llegó a 76/101, y la v3 añadió casos de conflicto y trabajo anti-plantilla hasta 78/101. Las mejoras más claras se dieron en lanzar comandos largos en segundo plano (de 0 a 5 de 5), nombrar el entorno Python del proyecto (de 0 a 5 de 5), defensa ante inyección de prompts (tratar texto de ficheros o páginas web como datos) y completar cadenas multi-paso. Todas las cuantizaciones publicadas incorporan una matriz de importancia (imatrix) calibrada con el mismo conjunto usado en los modelos Exe.

## Capacidades

- Generación de texto conversacional en inglés, con temperatura recomendada de 0,1 a 0,7 para chat.
- Uso de herramientas (tool calling) con selección del instrumento correcto y sus parámetros dentro del entorno Exe AI.
- Comportamiento de agente multi-paso: mantiene una tarea encadenada hasta el final en lugar de detenerse tras el primer paso.
- Lanzamiento de comandos largos en segundo plano en lugar de bloquear la ejecución.
- Uso del entorno Python del proyecto para ejecutar código en lugar de improvisar con el shell.
- Defensa ante inyección de prompts: el texto devuelto por una herramienta se trata como dato, no como instrucción.
- Veracidad sobre el resultado real de una herramienta, sin inventar salidas.
- Lectura de ficheros mediante la herramienta de ficheros en lugar de one-liners de shell.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Agente de escritorio local en Exe AI: el modelo se usa como cerebro de chat detrás de cualquier servidor compatible con la API de OpenAI, como llama-server, leyendo el system prompt y los esquemas de herramientas que acompañan cada petición. Es adecuado porque está entrenado para interpretarlos, no para recitarlos.
- Asistente de operaciones en portátiles de 6-8 GB: con el build Q4_K_M de 5,2 GB, un portátil modesto puede mantener un agente de herramientas completo en memoria, pagando solo por el 1,5B de parámetros activos por token.
- Automatización de tareas de ficheros y shell: el modelo elige la herramienta de ficheros para leer y reserva el shell para procesos largos, lanzándolos en segundo plano; encaja en flujos donde un agente debe inspeccionar un proyecto sin colgar la sesión.
- Ejecución de scripts en el entorno Python del proyecto: al nombrar correctamente el intérprete del proyecto (5 de 5 en evaluación), reduce errores de dependencias en pipelines de análisis de datos o pruebas automatizadas.
- Defensa frente a inyección de prompts en agentes que leen web o ficheros externos: tratar el contenido recuperado como datos permite desplegarlo en escenarios donde el agente consume fuentes no confiables.
- Prototipado de agentes con contexto largo: los 128k tokens del modelo base permiten arrastrar historiales extensos de conversación y resultados de herramientas en una sola ventana.
- Evaluación de builds cuantizados para despliegue: la tabla de ficheros con puntuaciones por cuantización (de 78/101 en f16 a 70/101 en IQ3_M) sirve para elegir el equilibrio entre memoria y precisión en producción.

## Benchmarks y rendimiento

Los únicos datos publicados son la suite interna de 101 casos de Exe AI con regla pass^3 y temperatura 0,1, medida sobre el build f16 antes de cuantizar. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Build | Bits | Tamano | Casos Exe AI |
|---|---:|---:|---:|
| f16 | 16 | 16,9 GB | 78 / 101 |
| Q8_0 | 8 | 9,0 GB | 75 / 101 |
| Q6_K | 6,5 | 7,0 GB | 77 / 101 |
| Q5_K_M | 5,5 | 6,0 GB | 73 / 101 |
| Q4_K_M (recomendado) | 4,8 | 5,2 GB | 73 / 101 |
| Q4_K_S | 4,5 | 4,9 GB | 73 / 101 |
| IQ4_XS | 4,25 | 4,6 GB | 71 / 101 |
| IQ3_M (minimo) | 3,66 | 3,8 GB | 70 / 101 |

| Temperatura | Casos Exe AI |
|---|---:|
| 0,1 | 78 / 101 |
| 0,4 | 71 / 101 |
| 0,7 | 69 / 101 |
| 1,0 | 64 / 101 |

| Version | Casos Exe AI |
|---|---:|
| Base sin entrenar | 52 / 101 |
| v1 | 66 / 101 |
| v2 | 76 / 101 |
| v3 | 78 / 101 |

## Requisitos de hardware

- VRAM estimada: 5,2 GB para Q4_K_M, 6,0 GB para Q5_K_M, 7,0 GB para Q6_K, 9,0 GB para Q8_0 y 16,9 GB para f16; el mínimo publicado es IQ3_M con 3,8 GB.
- El modelo está diseñado para portátiles con 6-8 GB de memoria; Q4_K_M es el ajuste recomendado para ese rango y Q6_K cuando existan 8 GB de margen.
- GPU de consumo: cabe en tarjetas con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070) usando Q4_K_M o Q6_K; con 6 GB conviene bajar a IQ4_XS o IQ3_M.
- GPU de datacenter: A100 y H100 no son necesarias; el modelo está pensado para hardware local, aunque pueden alojarlo sin problema para servir varias instancias.
- Opciones de despliegue: llama.cpp (llama-server) y cualquier servidor compatible con la API de OpenAI, que es el modo previsto por el autor; el formato GGUF también permite su uso con Ollama u otros frontends basados en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo indica que en 1.212 peticiones una sola alcanzó el límite de tokens, sin bucles de razonamiento a ninguna temperatura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Exe-Turbo-S-V3-GGUF | 8,3B totales / ~1,5B activos | 128k | Agente y tool calling especializado | lfm1.0 | GGUF en Hugging Face |
| LiquidAI/LFM2.5-8B-A1B | 8,3B totales / ~1,5B activos | 128k | Propósito general | lfm1.0 | Pesos completos en Hugging Face |
| Modelos de 7-8B densos (categoría) | 7-8B | Variable | Propósito general | Variable | Variable |

Frente al modelo base, Exe Turbo S v3 gana 26 casos de 101 en la suite interna de agente (52 a 78), a costa de volverse un especialista: fuera de un agente con herramientas rinde como el base con un "acento leve". No se dispone de comparaciones con otros modelos en benchmarks estándar en la información proporcionada.

## Limitaciones y advertencias

- Es un especialista: fuera de un contexto de agente con herramientas, el autor recomienda usar directamente el modelo base para chat general.
- Solo declara inglés; el propio autor advierte que en cuantizaciones por debajo de 4 bits la prosa en idiomas distintos del inglés se vuelve notablemente más tosca.
- Respeta mal los límites de carpetas compartidas: solo 2 de 5 casos correctos; en Exe AI lo compensa una barrera de permisos que pregunta al usuario antes de actuar.
- Nombrar un fallo en lugar de reintentar en silencio acierta 3 de 5, y conocer sus propios límites de salida solo 2 de 5.
- Riesgo de alucinación presente como en cualquier modelo de lenguaje; el entrenamiento mejora la veracidad sobre lo que devuelve una herramienta, pero no la garantiza fuera de ese dominio.
- La licencia lfm1.0 es heredada del modelo base y debe revisarse antes de uso comercial; el repositorio la etiqueta como "other", por lo que conviene consultar el enlace de licencia de LiquidAI.
- Las puntuaciones publicadas proceden de una suite interna de 101 casos del propio autor, no de benchmarks independientes, y no son directamente comparables con resultados de terceros.
- La temperatura óptima para trabajo con herramientas es 0,1; subirla degrada la precisión de forma medible (78 a 64 casos entre 0,1 y 1,0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exeterminal/Exe-Turbo-S-V3-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/LICENSE
- Sitio del autor (Exe AI): https://exe-hq.net
