# Songkai/K-IM-Deiction

## Resumen

K-IM-Deiction es un modelo especializado de clasificación de texto desarrollado por Songkai, afinado a partir de Qwen/Qwen3.5-0.8B. Su función no es generar texto, sino emitir siete juicios estructurados y calibrados sobre ventanas de mensajes de chat de grupo empresarial en chino: categoría de 7 clases, sentimiento, puntuaciones de importancia, urgencia e intensidad, probabilidad de requerir atención y probabilidad de contener una tarea pendiente. El modelo se publica en dos formas intercambiables dentro del mismo repositorio: los pesos ya fusionados con el backbone (standalone) y un adaptador LoRA de 102,4 MB para cargar sobre el modelo base.

La propuesta de valor es económica y operativa: en lugar de enviar cada ventana de mensaje a un modelo grande a ~1.500 tokens por ventana, un especialista de 0,8B destilado de un profesor mayor realiza los juicios rutinarios en una sola pasada hacia adelante con una latencia mediana de 40,6 ms por ventana en una RTX 4090 D (batch 1, ≤512 tokens). Solo las ventanas marcadas por el modelo pasan a revisión humana o a un modelo grande, lo que reduce el coste marginal del cribado a prácticamente cero.

La versión actual es la V4, promovida el 10 de noviembre de 2026, que introduce señales de relevancia como entrada del modelo mediante una cabecera de señales estructurada y un vector de 16 dimensiones proyectado hacia las siete cabeceras. La V2 previa se conserva intacta en la carpeta `v2/`. El modelo se posiciona explícitamente como capa de juicio, no de decisión: las acciones (mostrar, crear tarea, escalar) corresponden al sistema que lo rodea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con siete cabeceras de clasificación y proyección de vector de señales de 16 dimensiones |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de ≤512 tokens en la evaluación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados y adaptador LoRA) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamaño del paquete raíz | 1,83 GB (pesos standalone 1,71 GB + adaptador LoRA 0,10 GB) |
| Pipeline | text-classification |
| Latencia mediana | 40,6 ms por ventana (RTX 4090 D, batch 1, ≤512 tokens) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-0.8B, un transformer decoder-only de 853 millones de parámetros. Sobre la representación pooled del estado oculto se añaden siete cabeceras de juicio que se ejecutan en una única pasada hacia adelante. La innovación principal de la V4 respecto a la V3.1 es la incorporación de señales de relevancia como entrada: cada ventana lleva una cabecera de señales estructurada como primera línea de texto, y un vector de 16 dimensiones se proyecta y se alimenta a las siete cabeceras junto al estado oculto pooled. Esto permite que la cabecera de needs-attention aprenda qué es relevante para el usuario concreto, no solo qué parece importante en abstracto.

El modelo se describe como destilado de un profesor de mayor tamaño, aunque la model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. La evaluación se realizó sobre un conjunto ciego congelado de 498 ventanas con anotación dorada de calibre estrecho. No se especifica si se emplearon RLHF, DPO u otras técnicas de alineación. El repositorio incluye ficheros de calibración junto a las cabeceras, lo que sugiere un post-procesado de calibración de las probabilidades emitidas.

## Capacidades

- Clasificación en 7 categorías de ventanas de mensajes de chat de grupo (help, task, decision, info, discussion y otras).
- Análisis de sentimiento con puntuación calibrada.
- Puntuaciones de importancia, urgencia e intensidad por ventana.
- Probabilidad calibrada de needs-attention (requiere atención humana).
- Probabilidad calibrada de has-todo (contiene una tarea pendiente).
- Procesamiento de ventanas con contexto reciente más el mensaje objetivo y una cabecera de señales estructurada.
- Siete juicios emitidos en una sola pasada hacia adelante.
- No genera texto: es exclusivamente un modelo de juicio y clasificación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- Multilingüe limitado al chino; no cubre otros idiomas.
- No procesa adjuntos, imágenes, enlaces ni documentos citados: entran solo como tokens de marcador de posición.

## Casos de uso

- Triaje de atención en IM empresarial: el modelo puntúa cada ventana entrante con su probabilidad de needs-attention y el sistema muestra solo las primeras N por persona y día según un presupuesto de atención, sustituyendo el flujo continuo de notificaciones no leídas.
- Minería de tareas pendientes: las ventanas con alta probabilidad de has-todo se convierten en candidatos a lista de tareas con propietario y fecha límite a confirmar, evitando que las acciones se diluyan en el historial del chat.
- Enrutado y archivado: la cabecera de categoría clasifica las ventanas en flujos de ayuda, tarea, decisión, información o discusión para paneles, resúmenes diarios y recuperación.
- Colas de prioridad: la combinación de importancia por urgencia ordena listas de seguimiento y comprobaciones de escalado en operaciones y soporte.
- Monitorización de sentimiento de equipo: el sentimiento y la intensidad se agregan en un pulso diario, de modo que los picos de intensidad negativa son visibles sin leer los chats en bruto.
- Prefiltro delante de modelos grandes: en un pipeline con LLM, este modelo criba cada ventana a coste marginal casi nulo y solo las ventanas marcadas se envían a un modelo grande para lectura profunda o redacción de respuestas.
- Despliegue en local o en el borde: al ejecutarse íntegramente en hardware propio sin llamadas a API, encaja en entornos donde el contenido de los chats no puede salir de la red corporativa.

## Benchmarks y rendimiento

| Elemento | Valor |
|---|---|
| Conjunto de evaluación | 498 ventanas ciegas congeladas, anotación dorada de calibre estrecho |
| Forma evaluada | adaptador LoRA |
| Latencia mediana | 40,6 ms por ventana (RTX 4090 D, batch 1, ≤512 tokens) |
| Tamaño del paquete raíz | 1,83 GB (standalone 1,71 GB + LoRA 0,10 GB) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card menciona una comparativa cuantitativa del ahorro frente a enviar todas las ventanas a un modelo grande, pero los datos concretos de esa comparación no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 853 millones de parámetros en safetensors, los pesos en precisión completa ocupan aproximadamente 1,71 GB, por lo que en fp16 cabría en torno a 2 GB más overhead de activaciones y cabeceras.
- GPU recomendadas: RTX 4090 D es la GPU de referencia en la que se midió la latencia de 40,6 ms por ventana; cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder ejecutar el modelo.
- Cabe en GPU consumer: sí, dado el tamaño de 0,8B de parámetros y el paquete de 1,83 GB.
- Opciones de despliegue: el repositorio incluye una edición MLX en la carpeta `mlx/` para la V4 y en `v2/mlx/` para la V2, lo que apunta a despliegue en hardware Apple. No se confirman en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia mediana de 40,6 ms por ventana en RTX 4090 D con batch 1 y ventanas de hasta 512 tokens; el throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-IM-Deiction (este) | 853 M | no disponible | Clasificación y juicio de mensajes de chat (zh) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | Generación de texto general | no disponible en la información | Hugging Face |
| Modelos grandes de propósito general (p. ej. clase 7B-70B) | 7-70 B | variable | Lectura y generación abierta | variable | Hugging Face / APIs |

La comparación relevante es frente al modelo base y frente a modelos grandes de propósito general usados como cribadores. Frente al base, K-IM-Deiction añade siete cabeceras de juicio calibradas y una latencia de 40,6 ms por ventana, a cambio de renunciar a la generación de texto. Frente a un modelo grande, el ahorro es de coste y latencia por ventana, pero el especialista no puede resumir ni redactar respuestas. No se dispone de datos de benchmarks comparativos directos con alternativas de la misma categoría de triaje de mensajes.

## Limitaciones y advertencias

- Dominio restringido: entrenado para chat de grupo empresarial en chino; no se recomienda para otros idiomas, plataformas o culturas de chat.
- No es un modelo generativo: no sirve para comprensión lectora abierta, resumen ni redacción de respuestas; debe combinarse con un modelo grande para esas tareas.
- Contenido invisible: adjuntos, imágenes, enlaces y documentos citados entran solo como tokens de marcador de posición, por lo que el modelo no puede juzgarlos.
- La probabilidad de needs-attention es un juicio destilado y parcialmente subjetivo que opera cerca de su techo de ruido de etiquetas; debe usarse para ordenar y filtrar, manteniendo humanos o un modelo grande sobre la minoría marcada.
- No debe ser el árbitro único de decisiones consecuentes: el modelo emite juicios, no decisiones; la lógica de acción debe residir en reglas deterministas, umbrales y personas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las puntuaciones calibradas pueden desviarse en distribuciones de chat distintas de las de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible; al estar entrenado en un dominio empresarial chino concreto, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que conviene verificar.
- En producción, la calibración de las probabilidades debe validarse sobre datos propios antes de fijar umbrales de automatización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Songkai/K-IM-Deiction
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
