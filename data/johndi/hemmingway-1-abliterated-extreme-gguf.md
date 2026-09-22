# JohnDi/Hemmingway-1-Abliterated-Extreme-GGUF

## Resumen

Hemmingway-1-Abliterated-Extreme (GGUF) es una versión "abliterated" del modelo Altworld/Hemmingway-1, un modelo de 27.000 millones de parámetros basado en Qwen según la model card del autor. La ha publicado el usuario JohnDi en Hugging Face bajo licencia Apache 2.0, en formato GGUF, y su objetivo declarado es la escritura creativa sin restricciones, el diálogo con voz propia y la comunicación cotidiana. El proceso de "abliteration" consiste en eliminar direcciones de activación asociadas al rechazo de peticiones, de modo que el modelo deja de responder con negativas genéricas.

La diferencia respecto a otros abliterated rápidos es metodológica: el autor declara haber usado la herramienta Heretic con una búsqueda bayesiana profunda de 200 ensayos gestionada con Optuna, en lugar de las 20-30 pruebas habituales, para situarse en la frontera de Pareto entre máximo "decensoring" y mínima distorsión de la prosa original. El resultado reportado es de 2 rechazos sobre 100 en el ensayo 194, frente a 98 sobre 100 del modelo base, con una divergencia KL de 0,1870.

Es relevante ahora porque cubre un nicho muy concreto: modelos de rol y ficción sin censura con pesos cuantizados listos para ejecución local en GPU de consumo. No obstante, el repositorio acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, y no se han publicado resultados en benchmarks académicos estándar (MMLU, HumanEval, GSM8K), por lo que la validación externa es prácticamente nula.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen (variante concreta no especificada en la model card); etiquetada como "qwen3.8" en los tags del repositorio |
| Parametros totales | 27B (según la model card) |
| Parametros activos | No aplica; no se describe una arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M (~17 GB), Q6_K (~23 GB), Q8_0 (~29 GB) |
| Idiomas soportados | No disponible (el repositorio no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |
| Modelo base | Altworld/Hemmingway-1 |
| Metodo de desalineacion | Abliteration con Heretic, búsqueda bayesiana de 200 ensayos (Optuna) |
| Formato de prompt | ChatML / Qwen (`<|im_start|>`, `<|im_end|>`) |
| Fecha de publicacion | 2026-09-22 (creación) / 2026-09-22 (última actualización) |

## Arquitectura y entrenamiento

No se aporta información sobre la arquitectura interna más allá de que el modelo base es de tipo Qwen con 27B parámetros y de que el repositorio etiqueta la familia como "qwen3.8". No se detallan número de capas, dimensión oculta, mecanismo de atención (full, sliding window o híbrido), vocabulario ni longitud de contexto. No hay datos sobre el número de tokens de entrenamiento, composición del dataset ni si el modelo base pasó por RLHF, DPO u otro proceso de alineamiento; lo único deducible es que el modelo base mostraba una alta tasa de rechazos (98/100), lo que implica algún tipo de ajuste de seguridad previo.

La innovación técnica declarada es el propio proceso de abliteration: en lugar de restar una única dirección de rechazo calculada con pocas muestras, el autor aplica una búsqueda bayesiana de 200 ensayos con Optuna sobre la herramienta Heretic para encontrar el punto de la frontera de Pareto que maximiza la eliminación de rechazos minimizando el daño colateral. El autor reporta dos métricas: tasa de rechazo sobre un conjunto de 100 prompts (2/100 en el ensayo 194 frente a 98/100 en el baseline) y divergencia KL de 0,1870 respecto al modelo original, que interpreta como indicador de que la prosa, el humor y el flujo de frases se mantienen coherentes. No se especifica qué conjunto de prompts se usó, ni la temperatura de evaluación, ni cómo se calculó exactamente la divergencia KL, por lo que estas cifras no son reproducibles a partir de la información publicada.

## Capacidades

- Generacion de texto en formato conversacional, con plantilla ChatML / Qwen.
- Escritura creativa: ficción, prosa narrativa, diálogo y textos de estilo libre, que es el caso de uso para el que el autor lo optimiza explícitamente.
- Roleplay y conversaciones de personaje, incluidas interacciones sin las negativas típicas de modelos alineados.
- Redacción de mensajes directos y comunicaciones cotidianas (correo, mensajería, texto informal), según la descripción del autor.
- Respuesta a instrucciones de sistema mediante el rol `system` del formato ChatML.
- Inferencia local en cuantizaciones de 4, 6 y 8 bits mediante el ecosistema GGUF.

No hay información en la model card sobre soporte de tool calling o function calling, capacidades de agente, razonamiento multi-paso, matemáticas, generación de código, visión, audio ni modo "thinking". Tampoco se documentan capacidades multilingües ni una lista de idiomas soportados, por lo que no puede afirmarse que el comportamiento multilingüe se conserve tras la abliteration.

## Casos de uso

- Escritura de ficción larga en local: el modelo está pensado para mantener prosa natural sin interrupciones moralizantes, y las cuantizaciones Q6_K y Q8_0 caben en GPU de 24-32 GB, lo que permite generar capítulos completos sin enviar el manuscrito a un servicio en la nube.
- Roleplay y narrativa interactiva: con plantilla ChatML se puede definir un personaje en el mensaje de sistema y mantener el turno conversacional; el autor recomienda temperatura 0,80-1,0 para ficción, un rango adecuado para diálogo variado.
- Generación de diálogo para guiones y videojuegos: la recomendación de `presence_penalty` a 0,0 y `repetition_penalty` desactivado apunta a un uso donde la reformulación natural importa más que la diversidad léxica forzada.
- Asistente de redacción personal sin censura temática: para textos donde un modelo alineado rechazaría la petición (temas oscuros, conflicto, violencia narrativa, humor negro), el modelo responde sin bloqueos, siempre bajo responsabilidad del operador.
- Simulación de personajes para investigación sobre comportamiento de modelos desalineados: la pareja baseline/abliterated con la misma semilla permite estudiar experimentalmente qué cambia al eliminar rechazos, a costa de la validez limitada del conjunto de evaluación del autor.
- Base para ajuste fino ligero (LoRA) sobre estilo propio: al distribuirse en GGUF no es la vía natural para entrenar, pero el modelo base en safetensors sí permitiría adaptaciones de estilo antes de recuantizar.
- Prototipado de chatbots con personalidad para demos internas: el coste de despliegue es una única GPU de 24 GB, sin dependencia de API externa ni de cuotas.

## Benchmarks y rendimiento

Los únicos datos publicados son los del proceso de abliteration, no benchmarks académicos. Se reproducen tal cual los reporta el autor:

| Metrica | Baseline (Hemmingway-1) | Trial 194 (Extreme) |
|---|---|---|
| Rechazos sobre 100 prompts | 98 / 100 | 2 / 100 |
| Divergencia KL respecto al original | 0,0000 (referencia) | 0,1870 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible. La búsqueda web realizada no devolvió ningún recurso adicional sobre este modelo: los resultados obtenidos corresponden a páginas genéricas de motores de búsqueda y traductores, sin relación con el modelo.

## Requisitos de hardware

- Q4_K_M (~17 GB de pesos): requiere aproximadamente 18-20 GB de VRAM para inferencia con contexto moderado. Encaja en RTX 4080/4090 (16-24 GB) y RTX 3090; también en configuraciones con offload parcial a RAM.
- Q6_K (~23 GB de pesos): recomendado por el autor para 24-32 GB de VRAM, es decir, RTX 3090, RTX 4090 y RTX 5090. Necesita margen adicional para la caché KV, que crece con la longitud de contexto (no declarada).
- Q8_0 (~29 GB de pesos): orientado a 32 GB o más de VRAM; encaja en RTX 5090 (32 GB), A100 40 GB, L40S o en un tándem de dos GPU de 24 GB.
- Inferencia en CPU: viable con llama.cpp usando Q4_K_M y RAM del orden de 20-24 GB, con velocidad muy inferior a GPU (no se publican cifras).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con GGUF. La compatibilidad con vLLM o TGI no está documentada para este repositorio y, en general, el soporte de GGUF en esas pilas es limitado o experimental.
- Latencia y throughput: no disponibles. No se publican tokens por segundo para ninguna cuantización ni hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (100 prompts) | KL | Licencia | Formato |
|---|---|---|---|---|---|---|
| Hemmingway-1-Abliterated-Extreme | 27B | No disponible | 2 / 100 (dato del autor) | 0,1870 | Apache 2.0 | GGUF |
| Altworld/Hemmingway-1 (base) | 27B | No disponible | 98 / 100 (dato del autor) | Referencia | No disponible en esta ficha | No disponible |
| Otros modelos abliterated de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de otros modelos abliterated comparables (por ejemplo, derivados sin censura de familias Qwen o Mistral de 24-34B) en la información proporcionada, por lo que la comparación cuantitativa se limita al par baseline/abliterated del propio autor.

## Limitaciones y advertencias

- La abliteration elimina deliberadamente los mecanismos de rechazo: el modelo puede generar contenido ofensivo, violento, sexual explícito, ilegal o dañino sin filtro. El operador es responsable del uso y de cualquier moderación adicional que necesite añadir en producción.
- El dato de "2 rechazos sobre 100" procede del propio autor, sin conjunto de evaluación publicado, sin semilla ni protocolo reproducible. No debe tratarse como una métrica verificada.
- La divergencia KL de 0,1870 indica que la distribución de salida no es idéntica a la del modelo original; puede haber degradación en tareas fuera del ámbito creativo (razonamiento, instrucciones estrictas, formato estructurado), aunque el autor solo evalúa prosa.
- No se declara la longitud de contexto soportada, un dato crítico para dimensionar la caché KV y para casos de uso con documentos largos.
- No hay lista de idiomas soportados: no puede asumirse un buen rendimiento en castellano ni que la abliteration no haya afectado al comportamiento multilingüe.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad. En un modelo desalineado, la ausencia de rechazo no implica mayor fiabilidad, sino menor fricción para emitir afirmaciones incorrectas con seguridad.
- No se documenta soporte de tool calling ni de agentes; no debería asumirse en un pipeline que dependa de function calling.
- Licencia Apache 2.0 en este repositorio, pero el modelo base es un derivado de Qwen: conviene verificar las condiciones de la licencia del modelo original antes de un uso comercial, especialmente si se redistribuye.
- Estado de validación comunitaria nulo: 0 descargas y 0 "likes" en el momento de la consulta, sin informes de terceros sobre la calidad de la conversión a GGUF.
- Parámetros de muestreo sensibles: el autor advierte explícitamente de que `presence_penalty` distinto de 0,0 y `repetition_penalty` superior a 1,02 degradan la gramática natural del modelo.
- Los ajustes de cuantización Q4_K_M pueden introducir pérdida adicional de calidad sobre un modelo ya modificado mediante abliteration; el autor recomienda Q6_K como equilibrio.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/JohnDi/Hemmingway-1-Abliterated-Extreme-GGUF
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
