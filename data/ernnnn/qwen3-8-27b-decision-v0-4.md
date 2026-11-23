# Ernnnn/Qwen3.8-27B-Decision-v0.4

## Resumen
Qwen3.8-27B-Decision-v0.4 es un modelo de decisión derivado del backbone Qwen3.8-27B (26.896 millones de parámetros totales), publicado por el usuario Ernnnn en Hugging Face. No es un modelo generativo al uso: recibe un estado, una pregunta y un conjunto ordenado de entre 2 y 255 opciones, y devuelve en un único forward pass una distribución de probabilidad softmax sobre esas opciones. La interfaz imita el estilo de decisión tipada de Jev (TypeSafe), pero se trata de una reproducción independiente y no de un lanzamiento oficial de TypeSafe.

El modelo se distribuye como un adaptador LoRA sobre el backbone, con pesos en safetensors (56,4 GB de repositorio) y código personalizado (`trust_remote_code=True`). Incorpora atención bidireccional en 16 de sus 64 capas de atención completa, mientras que las 48 restantes mantienen recurrencia causal. Su ventana de entrada por defecto es de 12.288 tokens, ampliable a 65.536 con FlashAttention 2.

Es relevante porque convierte un LLM grande en un clasificador de decisiones probabilístico de alta fidelidad, útil para agentes y sistemas de enrutamiento donde se necesita una distribución calibrada sobre alternativas discretas en lugar de texto libre. El modelo se entrenó sobre 1.199.832 registros de decisión y declara compatibilidad tanto con Transformers como con vLLM.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B con atención híbrida (16 capas de atención completa bidireccional, 48 capas con recurrencia causal) y cabeza de decisión |
| Parametros totales | 26.896.131.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 12.288 tokens por defecto; 65.536 tokens en configuración de evaluación con FlashAttention 2 |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA sobre Qwen/Qwen3.8-27B) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.8-27B y se ajusta mediante LoRA para una tarea de decisión tipada. La arquitectura conserva 64 capas de atención, de las cuales 16 son de atención completa y ven todo el prompt de forma bidireccional, mientras que las 48 restantes mantienen recurrencia causal. Cada opción recibe un token de posición y, tras la última opción y el sufijo de la plantilla de chat, se coloca un token de decisión separado. La representación de ese token de decisión se proyecta a través de pesos de elección en FP32 y se normaliza con softmax sobre las opciones.

El entrenamiento utilizó 1.199.832 registros de decisión: 999.832 del split de entrenamiento de Tasksource y 200.000 de una mezcla que abarca conocimiento, lenguaje, recuperación, herramientas y artes. Contando estados, preguntas y conjuntos de opciones idénticos como una sola entrada, hay 1.112.792 entradas distintas. La distribución de tareas fue: 950.008 registros de elección, 131.670 de sí/no y 118.154 de valoración ordenada. En 92.014 registros la masa objetivo positiva se reparte entre más de una opción. Durante la preparación se acortaron 1.605 registros de Tasksource demasiado largos y se escaparon cadenas de tokens reservados en siete registros. La distribución objetivo se usa solo en la pérdida.

## Capacidades
- Decisión sobre opciones discretas: puntúa entre 2 y 255 opciones ordenadas en un solo forward pass y devuelve índice, texto y probabilidad.
- Elección múltiple tipada: tareas de elección con una probabilidad por opción en el orden suministrado.
- Preguntas de sí/no: dos probabilidades en el orden falso, verdadero.
- Valoraciones ordenadas: una probabilidad por nivel en la escala proporcionada.
- Soporte de objetivos múltiples: puede asignar masa de probabilidad positiva a más de una opción (92.014 registros de entrenamiento lo hacen).
- Integración con Transformers mediante `AutoModel` y procesador propio con `trust_remote_code=True`.
- Inferencia por lotes en vLLM con runner de pooling, `PoolerConfig` de tipo LAST y cabeza de decisión del checkpoint.
- Contexto largo: hasta 12.288 tokens por defecto y 65.536 con FlashAttention 2.
- No se documentan capacidades de generación libre, tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso
- Enrutamiento de atención al cliente: dado el estado de la conversación y una pregunta como "¿qué debe hacer el agente a continuación?", el modelo devuelve una distribución sobre acciones posibles (buscar reserva, pedir número de reserva, transferir a humano). El ejemplo de la model card muestra 99,86% para "pedir el número de reserva".
- Clasificación de intenciones en asistentes conversacionales: con 2-255 etiquetas ordenadas, se obtiene una probabilidad calibrada por intención en un único paso, lo que simplifica el pipeline frente a un LLM generativo con postprocesado.
- Triaje de tickets y soporte: el modelo puntúa niveles ordenados (por ejemplo, severidad baja, media, alta) con una probabilidad por nivel, útil para priorización automática.
- Decisión binaria en pipelines de validación: preguntas de sí/no con dos probabilidades (falso, verdadero) para filtros de calidad, moderación o comprobaciones de consistencia.
- Selección de herramientas en agentes: dado el estado y la pregunta, elegir entre un conjunto acotado de herramientas o acciones, aprovechando la ventana de 12.288 tokens para incluir contexto de conversación amplio.
- Evaluación de políticas y simulación de decisiones: al devolver distribuciones completas en lugar de una única etiqueta, permite analizar incertidumbre y comparar políticas en entornos simulados.
- Procesamiento por lotes offline: con vLLM y el runner de pooling se pueden puntuar múltiples prompts de decisión en batch, útil para anotar grandes volúmenes de datos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comparación de consistencia entre backends: en cinco peticiones cortas (elección, sí/no y valoraciones ordenadas), Transformers y vLLM seleccionaron las mismas respuestas, con una diferencia máxima de 0,30 puntos porcentuales por opción.

## Requisitos de hardware
- El autor indica que se usó una H100 de 80 GB para cargar los pesos en bfloat16.
- El repositorio ocupa 56,4 GB, por lo que la inferencia en precisión completa requiere GPUs de 80 GB o superiores (H100, A100 80 GB).
- No se documenta si cabe en GPUs de consumo (RTX 4090 de 24 GB, etc.); con 26,9 mil millones de parámetros y pesos bfloat16, no cabría sin cuantización, y no se publican cuantizaciones oficiales.
- Despliegue con Transformers 5.16.1, Accelerate 1.14.0 y PyTorch 2.13.0 (entorno de referencia del autor), con `attn_implementation="sdpa"` o `"flash_attention_2"`.
- Despliegue con vLLM 0.32.0 usando `runner="pooling"`, `convert="embed"`, `is_causal=False`, pooling LAST y desactivando prefix caching y chunked prefill.
- En el ejemplo de vLLM se usa `max_model_len=2048`, `max_num_batched_tokens=2048`, `max_num_seqs=4` y `gpu_memory_utilization=0.88`.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Decision-v0.4 | 26,9 mil millones | 12.288 (65.536 con FA2) | Decisión tipada sobre 2-255 opciones | no disponible | Hugging Face (adaptador LoRA) |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en la información | no disponible en la información | Generación de texto | no disponible en la información | Hugging Face |
| Jev (TypeSafe) | no disponible | no disponible | Interfaz de decisión tipada | no disponible | Referencia citada por el autor; no se aportan datos |

No se dispone de información suficiente para comparar parámetros, contexto, rendimiento ni licencia de alternativas de la misma categoría.

## Limitaciones y advertencias
- No es un modelo generativo: `LLM.generate()` y las chat completions en vLLM usan generación causal de texto y no la cabeza de decisión; para decisiones hay que usar el runner de pooling.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial.
- Los idiomas soportados no están documentados.
- No se publican benchmarks de calidad; solo una comparación de consistencia entre backends en cinco peticiones.
- El modelo requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código antes de desplegarlo en producción.
- El límite por defecto de 12.288 tokens puede ser insuficiente para estados muy largos; la configuración de 65.536 tokens exige FlashAttention 2 y `max_length=65536`.
- Una petición que excede el límite lanza un error para preservar todas las opciones; hay que gestionar ese caso en el pipeline.
- En vLLM es obligatorio desactivar prefix caching y chunked prefill para que las opciones posteriores influyan en las posiciones anteriores.
- El autor advierte de que se trata de una reproducción independiente de un estilo de decisión tipo Jev y no de un lanzamiento de TypeSafe.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de clasificación, el riesgo principal es una distribución mal calibrada en dominios alejados de los datos de entrenamiento.
- El conjunto de entrenamiento contiene entradas repetidas (1.199.832 registros frente a 1.112.792 entradas distintas), lo que puede sobrerrepresentar ciertos patrones.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Ernnnn/Qwen3.8-27B-Decision-v0.4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Tasksource (revisión usada): https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions/tree/8df2e5c9a33f19a2c2b8febf291c3acb0a91a8a8
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
