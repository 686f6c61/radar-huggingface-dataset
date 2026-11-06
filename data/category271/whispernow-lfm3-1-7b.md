# category271/whispernow-lfm3-1.7b

## Resumen

WhisperNow LFM3 1.7B es un ajuste fino completo del modelo base LiquidAI/LFM3-1.7B-Base, desarrollado por el usuario category271 para la etapa local de limpieza de transcripciones de WhisperNow, una aplicación de escritorio de dictado. El modelo no es un asistente conversacional general: es un especialista entrenado para recibir una transcripción ASR en bruto y devolver el mismo texto limpio, eliminando muletillas, falsos comienzos y repeticiones, aplicando las autocorrecciones del hablante y ajustando el formato (listas, cifras, puntuación hablada).

La relevancia de este modelo radica en que traslada al dispositivo local una tarea que habitualmente se delega a modelos en la nube, con un consumo de memoria de 2,2 GB en cuantización Q8_0 y una tasa declarada de 5,04 errores factuales por cada 1.000 palabras. Con 1.728.801.536 parámetros reales según los safetensors del repositorio, se posiciona como una alternativa intermedia entre modelos más pequeños (LFM2.5 1.2B) y más grandes (LFM2.5 2.6B, Qwen3.5 4B, Nemotron Bolt E4B) dentro de la misma familia de limpiadores de transcripción.

El modelo se distribuye en formato safetensors y GGUF, con licencia LFM1.0 (etiquetada como "other" en Hugging Face), soporte exclusivo del idioma inglés y una fecha de creación en el repositorio de noviembre de 2026. Su diseño está orientado a un caso de uso muy concreto: el postprocesado de dictado por voz en local, con instrucciones estrictas sobre qué conservar (palabras, tono, matices, razones) y qué eliminar (ruido verbal, correcciones obsoletas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LFM3 de LiquidAI; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible como cifra oficial; los ejemplos de despliegue usan `-c 8192` en llama.cpp |
| Tipos de cuantizacion | GGUF Q8_0 (archivo de 1,85 GB); otros tipos no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | LFM1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) de LiquidAI/LFM3-1.7B-Base, un transformer decoder-only de la familia LFM3 de LiquidAI con 1.728.801.536 parámetros. No se dispone de información detallada sobre la composición interna de la arquitectura (número de capas, dimensiones ocultas, mecanismos de atención) ni sobre el número de tokens de entrenamiento empleados en el ajuste fino. El repositorio incluye código propio (`custom_code`) que requiere `trust_remote_code=True` en Transformers 5.18 o superior.

El entrenamiento se realizó sobre el dataset category271/whispernow-cleanup, que codifica las reglas de limpieza que WhisperNow envía a modelos en la nube. El modelo aprendió a aplicar esas reglas de forma local: eliminación de muletillas y tartamudeos, resolución de autocorrecciones, corrección gramatical y ortográfica, formateo de listas y conversión de puntuación hablada. No se especifica si hubo RLHF, DPO u otras etapas de alineación posteriores al ajuste supervisado. La evaluación se realizó sobre tres conjuntos: test (3.297 filas retenidas del dataset de entrenamiento), bench-long (416 dictados de 151–946 palabras, 49 de ellos turnos reales del corpus AMI) y bench-noise (461 dictados de 20–64 palabras con un tipo de disfluencia cada uno).

## Capacidades

- Limpieza de transcripciones ASR: elimina muletillas ("um", "like", "you know"), tartamudeos, palabras repetidas y falsos comienzos.
- Resolución de autocorrecciones: cuando el hablante se corrige ("no wait", "scratch that"), conserva solo la versión corregida y elimina la señal de corrección.
- Corrección gramatical, ortográfica, de puntuación y de mayúsculas, preservando las palabras, el tono, los matices ("maybe", "I think") y las razones ("because ...") del hablante.
- Formateo estructurado: convierte listas de la compra, tareas, pasos, recetas y notas de reunión en listas; los mensajes, historias y explicaciones permanecen como frases. No usa negrita, cursiva, encabezados ni guiones largos.
- Normalización numérica: escribe cantidades, recuentos, fechas, horas y porcentajes en dígitos, y convierte la puntuación hablada y los símbolos ("dash dash help") en su representación real.
- Preservación literal de código, rutas y URLs tal como se dictaron.
- Tratamiento de preguntas y comandos: los limpia y los devuelve como texto, sin responderlos ni ejecutarlos.
- Detección de transcripciones vacías: devuelve `EMPTY` cuando no hay palabras dictadas (solo muletillas o ruido).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Dictado por voz en local: el modelo actúa como paso final de limpieza en la aplicación WhisperNow, procesando la transcripción ASR en el dispositivo con 2,2 GB de memoria en Q8_0 y sin enviar datos a la nube.
- Notas de reunión: a partir de turnos reales del corpus AMI (49 en bench-long), convierte intervenciones desordenadas en notas estructuradas con listas y correcciones aplicadas, adecuado por su entrenamiento específico en este tipo de entrada.
- Listas de la compra y tareas: transforma un dictado continuo ("we're picking up fence posts feed for the chickens and uh that new hose nozzle") en una lista con viñetas y conserva las peticiones adicionales como frases separadas.
- Documentación técnica dictada: mantiene rutas, URLs y fragmentos de código exactamente como se dictaron, mientras corrige la prosa circundante, lo que lo hace útil para desarrolladores que redactan documentación por voz.
- Mensajería y correo: limpia mensajes dictados preservando el tono y los matices del hablante, sin reescribir el contenido ni añadir información, adecuado para respuestas rápidas en aplicaciones de chat.
- Recetas y procedimientos: estructura pasos e ingredientes en listas y normaliza cantidades y tiempos en dígitos, útil para capturar procedimientos de cocina o procesos operativos dictados.
- Filtrado de ruido en pipelines ASR: devuelve `EMPTY` cuando la transcripción solo contiene muletillas o ruido, lo que permite descartar automáticamente segmentos sin contenido en un pipeline de voz.

## Benchmarks y rendimiento

La model card proporciona una comparativa de errores factuales por cada 1.000 palabras y consumo de memoria en Q8_0 frente a otros limpiadores de la misma familia:

| Modelo | Archivo Q8_0 | Memoria en uso | Errores factuales por 1.000 palabras |
|---|---|---|---|
| LFM2.5 1.2B | 1,25 GB | 1,6 GB | 6,32 |
| LFM3 1.7B (este modelo) | 1,85 GB | 2,2 GB | 5,04 |
| LFM2.5 2.6B | 2,87 GB | 3,3 GB | 4,88 |
| Qwen3.5 4B | 4,48 GB | 5,3 GB | 3,01 |
| Nemotron Bolt E4B | 7,97 GB | 8,4 GB | 2,59 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las puntuaciones de la model card cubren 4.170 filas: 3.295 de test, 414 de bench-long y el resto de bench-noise, medidas con decodificación greedy (temperatura 0), penalización de repetición de 1,05 sobre todo el prompt y la respuesta, y un límite de respuesta de 2,5 tokens por palabra de la transcripción (mínimo 64).

## Requisitos de hardware

- VRAM estimada para inferencia: 2,2 GB de memoria en uso con cuantización Q8_0 (archivo de 1,85 GB); en bfloat16 el peso completo ronda los 3,5 GB, aunque no se proporciona una cifra oficial de VRAM para esa precisión.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM.
- Cabe en GPU consumer: sí, en tarjetas con al menos 4 GB de VRAM en Q8_0 (por ejemplo, GTX 1650, RTX 3050, RTX 4060 y superiores).
- Opciones de despliegue: llama.cpp (requiere la versión b11960 o posterior) mediante `llama-server -hf category271/whispernow-lfm3-1.7b:Q8_0 --jinja -c 8192`; Transformers 5.18 o superior con `trust_remote_code=True` y `dtype="bfloat16"`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria Q8_0 | Errores/1.000 palabras | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WhisperNow LFM3 1.7B | 1.728.801.536 | No disponible (ejemplos con 8192) | 2,2 GB | 5,04 | LFM1.0 | Hugging Face (safetensors, GGUF) |
| WhisperNow LFM2.5 1.2B | No disponible | No disponible | 1,6 GB | 6,32 | No disponible | Hugging Face |
| WhisperNow LFM2.5 2.6B | No disponible | No disponible | 3,3 GB | 4,88 | No disponible | Hugging Face |
| WhisperNow Qwen3.5 4B | No disponible | No disponible | 5,3 GB | 3,01 | No disponible | Hugging Face |
| WhisperNow Nemotron Bolt E4B | No disponible | No disponible | 8,4 GB | 2,59 | No disponible | Hugging Face |

La comparativa se limita a los modelos de la misma familia de limpiadores WhisperNow, ya que no se dispone de datos de benchmarks estándar ni de especificaciones completas de las alternativas. El modelo ofrece un equilibrio entre consumo (2,2 GB) y precisión (5,04 errores/1.000 palabras), con una mejora del 20,3 % en errores respecto a LFM2.5 1.2B a cambio de 0,6 GB más de memoria, y queda por detrás de LFM2.5 2.6B en precisión (4,88) con 1,1 GB menos de memoria.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado para otros idiomas.
- Es un modelo especializado en limpieza de transcripciones, no un asistente general: no responde preguntas ni ejecuta comandos, solo devuelve el texto limpio.
- Riesgo de alucinación: aunque las reglas exigen preservar las palabras del hablante, un modelo generativo puede introducir o alterar contenido; la tasa declarada de 5,04 errores factuales por 1.000 palabras implica que persisten errores en producción.
- Licencia LFM1.0 (etiquetada como `other`): es necesario revisar el archivo LICENSE del repositorio para confirmar las condiciones de uso comercial, ya que no se detallan en la información proporcionada.
- Requiere versiones específicas de software: llama.cpp b11960 o posterior, y Transformers 5.18 o posterior con `trust_remote_code=True`, lo que añade una dependencia de código personalizado.
- Los resultados de evaluación se midieron con una configuración concreta (greedy, `repeat_penalty` 1,05, `repeat_last_n` 4096, límite de 2,5 tokens por palabra); desviarse de estos ajustes puede degradar la calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- No se dispone de información sobre sesgos específicos del modelo más allá de los heredados del modelo base y del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/category271/whispernow-lfm3-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Reglas de limpieza (sección del dataset): https://huggingface.co/datasets/category271/whispernow-cleanup#the-cleanup-rules
- Repositorio de WhisperNow: https://github.com/stephan271c/WhisperNow
- Modelo hermano LFM2.5 1.2B: https://huggingface.co/category271/whispernow-lfm2.5-1.2b
- Modelo hermano LFM2.5 2.6B: https://huggingface.co/category271/whispernow-lfm2.5-2.6b
- Modelo hermano Qwen3.5 4B: https://huggingface.co/category271/whispernow-qwen3.5-4b
- Modelo hermano Nemotron Bolt E4B: https://huggingface.co/category271/whispernow-nemotron-bolt-e4b
